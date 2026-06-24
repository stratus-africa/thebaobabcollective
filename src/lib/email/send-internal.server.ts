// Server-only helper to enqueue a transactional email from public/unauthenticated
// flows (contact form, enquiry form) without going through the JWT-protected
// /lovable/email/transactional/send route. Renders the registered template,
// checks suppression, logs, then enqueues into pgmq for the cron processor.

import * as React from 'react'
import { render } from '@react-email/components'
import { randomUUID } from 'node:crypto'
import { TEMPLATES } from '@/lib/email-templates/registry'

const SITE_NAME = 'thebaobabcollective'
const SENDER_DOMAIN = 'notify.thebaobabcollective.co.uk'
const FROM_DOMAIN = 'notify.thebaobabcollective.co.uk'

export async function enqueueInternalEmail(args: {
  templateName: string
  recipientEmail?: string
  templateData?: Record<string, unknown>
  idempotencyKey?: string
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const { templateName, recipientEmail, templateData = {}, idempotencyKey } = args
  const template = TEMPLATES[templateName]
  if (!template) {
    console.error('enqueueInternalEmail: unknown template', { templateName })
    return { ok: false, reason: 'unknown_template' }
  }

  const effectiveRecipient = template.to || recipientEmail
  if (!effectiveRecipient) {
    return { ok: false, reason: 'no_recipient' }
  }

  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  const normalized = effectiveRecipient.toLowerCase()

  // Suppression check
  const { data: suppressed } = await supabaseAdmin
    .from('suppressed_emails')
    .select('email')
    .eq('email', normalized)
    .maybeSingle()
  if (suppressed) {
    return { ok: false, reason: 'suppressed' }
  }

  const element = React.createElement(template.component, templateData as any)
  const html = await render(element)
  const text = await render(element, { plainText: true })
  const subject =
    typeof template.subject === 'function'
      ? template.subject(templateData as Record<string, any>)
      : template.subject

  const messageId = idempotencyKey || randomUUID()

  await supabaseAdmin.from('email_send_log').insert({
    message_id: messageId,
    template_name: templateName,
    recipient_email: effectiveRecipient,
    status: 'pending',
  })

  const { error: enqueueError } = await supabaseAdmin.rpc('enqueue_email', {
    queue_name: 'transactional_emails',
    payload: {
      message_id: messageId,
      to: effectiveRecipient,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      purpose: 'transactional',
      label: templateName,
      idempotency_key: messageId,
      queued_at: new Date().toISOString(),
    },
  })

  if (enqueueError) {
    console.error('enqueueInternalEmail: enqueue failed', { error: enqueueError })
    await supabaseAdmin.from('email_send_log').insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: 'failed',
      error_message: enqueueError.message,
    })
    return { ok: false, reason: 'enqueue_failed' }
  }

  return { ok: true }
}
