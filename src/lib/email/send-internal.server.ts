import React from 'react'
import { render } from '@react-email/components'
import { createClient } from '@supabase/supabase-js'
import { TEMPLATES } from '@/lib/email-templates/registry'

const SITE_NAME = 'The Baobab Collective'
const SENDER_DOMAIN = 'notify.thebaobabcollective.co.uk'
const FROM_DOMAIN = 'notify.thebaobabcollective.co.uk'

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function getOrCreateUnsubscribeToken(
  supabaseAdmin: any,
  normalizedEmail: string,
): Promise<{ ok: true; token: string } | { ok: false; reason: string }> {
  const { data: existingToken, error: lookupErr } = await supabaseAdmin
    .from('email_unsubscribe_tokens')
    .select('token, used_at')
    .eq('email', normalizedEmail)
    .maybeSingle()
  if (lookupErr) return { ok: false, reason: 'token_lookup_failed' }
  if (existingToken && !existingToken.used_at) return { ok: true, token: existingToken.token }

  const newToken = generateToken()
  const { error: tokenErr } = await supabaseAdmin
    .from('email_unsubscribe_tokens')
    .upsert(
      { token: newToken, email: normalizedEmail },
      { onConflict: 'email', ignoreDuplicates: true },
    )
  if (tokenErr) return { ok: false, reason: 'token_create_failed' }

  const { data: stored } = await supabaseAdmin
    .from('email_unsubscribe_tokens')
    .select('token')
    .eq('email', normalizedEmail)
    .maybeSingle()
  if (!stored) return { ok: false, reason: 'token_readback_failed' }
  return { ok: true, token: stored.token }
}

export async function enqueueInternalEmail(args: {
  templateName: string
  recipientEmail?: string
  idempotencyKey?: string
  templateData?: Record<string, any>
}): Promise<{ ok: boolean; reason?: string }> {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('enqueueInternalEmail: missing Supabase env')
    return { ok: false, reason: 'missing_env' }
  }

  const template = TEMPLATES[args.templateName]
  if (!template) {
    console.error('enqueueInternalEmail: unknown template', args.templateName)
    return { ok: false, reason: 'unknown_template' }
  }

  const recipient = template.to ?? args.recipientEmail
  if (!recipient) return { ok: false, reason: 'missing_recipient' }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
  const normalized = recipient.toLowerCase().trim()
  const templateData = args.templateData ?? {}

  // Suppression check
  const { data: suppressed } = await supabaseAdmin
    .from('suppressed_emails')
    .select('email')
    .eq('email', normalized)
    .maybeSingle()
  if (suppressed) return { ok: false, reason: 'suppressed' }

  const tokenResult = await getOrCreateUnsubscribeToken(supabaseAdmin, normalized)
  if (!tokenResult.ok) return { ok: false, reason: tokenResult.reason }

  const element = React.createElement(template.component, templateData as any)
  const html = await render(element)
  const text = await render(element, { plainText: true })
  const subject =
    typeof template.subject === 'function' ? template.subject(templateData) : template.subject

  const messageId = args.idempotencyKey ?? crypto.randomUUID()

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
      subject,
      html,
      text,
      purpose: 'transactional',
      label: args.templateName,
      idempotency_key: messageId,
      unsubscribe_token: tokenResult.token,
      queued_at: new Date().toISOString(),
    },
  })

  if (enqueueError) {
    console.error('enqueueInternalEmail: enqueue failed', enqueueError)
    await supabaseAdmin.from('email_send_log').insert({
      message_id: messageId,
      template_name: args.templateName,
      recipient_email: normalized,
      status: 'failed',
      error_message: 'Failed to enqueue email',
    })
    return { ok: false, reason: 'enqueue_failed' }
  }

  return { ok: true }
}
