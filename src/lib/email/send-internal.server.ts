import React from 'react'
import { render } from '@react-email/components'
import { createClient } from '@supabase/supabase-js'
import { getEmailTemplate } from './email-registry.server'

const SITE_NAME = 'thebaobabcollective'
const SENDER_DOMAIN = 'notify.thebaobabcollective.co.uk'
const FROM_DOMAIN = 'notify.thebaobabcollective.co.uk'

// Generate a cryptographically random 32-byte hex token
function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Get the existing unused unsubscribe token for this email, or create one.
// This satisfies the email API's `missing_unsubscribe_token` requirement for
// transactional emails. Reuses tokens when possible to minimize DB writes.
async function getOrCreateUnsubscribeToken(
  supabaseAdmin: any,
  normalizedEmail: string
): Promise<{ ok: true; token: string } | { ok: false; reason: string }> {
  const { data: existingToken, error: tokenLookupError } = await supabaseAdmin
    .from('email_unsubscribe_tokens')
    .select('token, used_at')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (tokenLookupError) {
    console.error('getOrCreateUnsubscribeToken: lookup failed', { error: tokenLookupError })
    return { ok: false, reason: 'token_lookup_failed' }
  }

  // Reuse existing unused tokens
  if (existingToken && !existingToken.used_at) {
    return { ok: true, token: existingToken.token }
  }

  if (existingToken && existingToken.used_at) {
    // Token exists but was already used to unsubscribe. This email should have
    // been caught by the suppression check before we get here.
    console.warn('getOrCreateUnsubscribeToken: token already used but email not suppressed', {
      email: normalizedEmail,
    })
    return { ok: false, reason: 'unsubscribe_token_used' }
  }

  const newToken = generateToken()
  const { error: tokenError } = await supabaseAdmin
    .from('email_unsubscribe_tokens')
    .upsert(
      { token: newToken, email: normalizedEmail },
      { onConflict: 'email', ignoreDuplicates: true }
    )

  if (tokenError) {
    console.error('getOrCreateUnsubscribeToken: failed to create token', { error: tokenError })
    return { ok: false, reason: 'token_create_failed' }
  }

  // If another request raced us, our upsert was silently ignored — re-read to
  // get the token that actually ended up stored.
  const { data: storedToken, error: reReadError } = await supabaseAdmin
    .from('email_unsubscribe_tokens')
    .select('token')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (reReadError || !storedToken) {
    console.error('getOrCreateUnsubscribeToken: failed to read back token', { error: reReadError })
    return { ok: false, reason: 'token_readback_failed' }
  }

  return { ok: true, token: storedToken.token }
}

export async function enqueueInternalEmail(args: {
  templateName: string
  recipientEmail?: string
  templateData?: Record<string, any>
}): Promise<{ ok: boolean; reason?: string }> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    return { ok: false, reason: 'missing_env' }
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
  const template = getEmailTemplate(args.templateName)

  if (!template) {
    console.error('Unknown email template', { templateName: args.templateName })
    return { ok: false, reason: 'unknown_template' }
  }

  const normalized = (args.recipientEmail || '').toLowerCase().trim()
  const templateData = args.templateData || {}

  // Check if email is suppressed
  const { data: suppressed } = await supabaseAdmin
    .from('email_suppressions')
    .select('id')
    .eq('email', normalized)
    .maybeSingle()

  if (suppressed) {
    console.log('Email suppressed, skipping send', { email: normalized })
    return { ok: false, reason: 'suppressed' }
  }

  // Get or create unsubscribe token for this email
  const tokenResult = await getOrCreateUnsubscribeToken(supabaseAdmin, normalized)
  if (!tokenResult.ok) {
    console.error('enqueueInternalEmail: could not prepare unsubscribe token', {
      reason: tokenResult.reason,
    })
    return { ok: false, reason: tokenResult.reason }
  }
  const unsubscribeToken = tokenResult.token

  const element = React.createElement(template.component, templateData as any)
  const html = await render(element)
  const text = await render(element, { plainText: true })

  const messageId = crypto.randomUUID()

  // Log pending BEFORE enqueue so we have a record even if enqueue crashes
  await supabaseAdmin.from('email_send_log').insert({
    message_id: messageId,
    template_name: args.templateName,
    recipient_email: normalized,
    status: 'pending',
  })

  const { error: enqueueError } = await supabaseAdmin.rpc('enqueue_email', {
    queue_name: 'transactional_emails',
    payload: {
      message_id: messageId,
      to: normalized,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject: template.subject,
      html,
      text,
      purpose: 'transactional',
      label: args.templateName,
      idempotency_key: messageId,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  })

  if (enqueueError) {
    console.error('Failed to enqueue email', { error: enqueueError, templateName: args.templateName })
    await supabaseAdmin.from('email_send_log').insert({
      message_id: messageId,
      template_name: args.templateName,
      recipient_email: normalized,
      status: 'failed',
      error_message: 'Failed to enqueue email',
    })
    return { ok: false, reason: 'enqueue_failed' }
  }

  console.log('Email enqueued', { templateName: args.templateName, email: normalized })
  return { ok: true }
}
