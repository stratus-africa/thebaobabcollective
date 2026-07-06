// Server-only email dispatch for the Planning Guide flow.
// We use a "soft" approach: if a Lovable Emails domain hasn't been configured
// yet, we no-op and let the caller record `email_sent = false`. The PDF link
// and DB row still work end-to-end.

import { createClient } from '@supabase/supabase-js'

type SendArgs = {
  name: string
  email: string
  pdfUrl: string | null
  travellingParty: string | null
  earliestDate: string | null
  interests: string[]
  message: string | null
}

const ADMIN_EMAIL = 'hello@stratus.africa'

// Generate a cryptographically random 32-byte hex token
function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Get or create unsubscribe token for the planning guide email
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

  if (existingToken && !existingToken.used_at) {
    return { ok: true, token: existingToken.token }
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

export async function sendPlanningGuideEmails(args: SendArgs) {
  const senderDomain = process.env.LOVABLE_EMAIL_SENDER_DOMAIN
  const apiKey = process.env.LOVABLE_API_KEY
  if (!senderDomain || !apiKey) {
    // Email infra not yet configured — caller treats this as a soft skip.
    throw new Error('Lovable Emails not configured')
  }

  const fromAddress = `Baobab Collective <hello@${senderDomain}>`
  const interestsLine = args.interests.length ? args.interests.join(', ') : 'Open to inspiration'

  const requesterHtml = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:32px;color:#1f2a24;">
      <p style="letter-spacing:3px;text-transform:uppercase;color:#c79849;font-size:11px;margin:0 0 18px;">The Baobab Collective</p>
      <h1 style="font-size:28px;margin:0 0 16px;line-height:1.2;">Your Africa Planning Guide</h1>
      <p>Hi ${escapeHtml(args.name)},</p>
      <p>Thank you for reaching out. Your planning guide is ready — a short field manual for designing your bespoke safari.</p>
      ${args.pdfUrl
        ? `<p style="margin:28px 0;"><a href="${args.pdfUrl}" style="background:#c79849;color:#1f2a24;text-decoration:none;padding:14px 22px;letter-spacing:2px;text-transform:uppercase;font-size:12px;display:inline-block;">Download Guide</a></p>`
        : `<p>We're attaching your guide in the next email.</p>`}
      <p>One of our journey designers will reply within 24 hours with a first sketch. In the meantime, reply with any dates or dreams that come to mind.</p>
      <p style="margin-top:32px;color:#6b6b62;font-size:12px;">— The Baobab Collective<br/>hello@stratus.africa</p>
    </div>
  `

  const adminHtml = `
    <div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2a24;font-size:13px;">
      <h2 style="font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">New Planning Guide request</h2>
      <table style="border-collapse:collapse;width:100%;">
        <tr><td style="padding:6px 0;color:#999;text-transform:uppercase;letter-spacing:2px;font-size:10px;">Name</td><td>${escapeHtml(args.name)}</td></tr>
        <tr><td style="padding:6px 0;color:#999;text-transform:uppercase;letter-spacing:2px;font-size:10px;">Email</td><td>${escapeHtml(args.email)}</td></tr>
        <tr><td style="padding:6px 0;color:#999;text-transform:uppercase;letter-spacing:2px;font-size:10px;">Party</td><td>${escapeHtml(args.travellingParty || '—')}</td></tr>
        <tr><td style="padding:6px 0;color:#999;text-transform:uppercase;letter-spacing:2px;font-size:10px;">Earliest</td><td>${escapeHtml(args.earliestDate || '—')}</td></tr>
        <tr><td style="padding:6px 0;color:#999;text-transform:uppercase;letter-spacing:2px;font-size:10px;">Interests</td><td>${escapeHtml(interestsLine)}</td></tr>
      </table>
      ${args.message ? `<p style="margin-top:18px;white-space:pre-wrap;">${escapeHtml(args.message)}</p>` : ''}
      ${args.pdfUrl ? `<p style="margin-top:18px;"><a href="${args.pdfUrl}">View generated PDF</a></p>` : ''}
    </div>
  `

  // Get unsubscribe token for the requester email
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase not configured for planning guide unsubscribe tokens, proceeding without')
  }

  let unsubscribeToken: string | undefined
  if (supabaseUrl && supabaseServiceKey) {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    const normalizedEmail = args.email.toLowerCase().trim()
    const tokenResult = await getOrCreateUnsubscribeToken(supabaseAdmin, normalizedEmail)
    if (tokenResult.ok) {
      unsubscribeToken = tokenResult.token
    } else {
      console.warn('Failed to generate unsubscribe token for planning guide', { reason: tokenResult.reason })
    }
  }

  await Promise.allSettled([
    sendEmail({
      apiKey,
      from: fromAddress,
      to: args.email,
      subject: 'Your Africa Planning Guide — The Baobab Collective',
      html: requesterHtml,
      unsubscribeToken,
    }),
    sendEmail({
      apiKey,
      from: fromAddress,
      to: ADMIN_EMAIL,
      subject: `New Planning Guide request — ${args.name}`,
      html: adminHtml,
      replyTo: args.email,
    }),
  ])
}

async function sendEmail(args: {
  apiKey: string
  from: string
  to: string
  subject: string
  html: string
  replyTo?: string
  unsubscribeToken?: string
}) {
  // Lovable Emails REST endpoint (gateway). Best-effort; failures bubble.
  const res = await fetch('https://api.lovable.dev/emails/send', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${args.apiKey}`,
    },
    body: JSON.stringify({
      from: args.from,
      to: [args.to],
      subject: args.subject,
      html: args.html,
      purpose: 'transactional',
      ...(args.replyTo ? { reply_to: args.replyTo } : {}),
      ...(args.unsubscribeToken ? { unsubscribe_token: args.unsubscribeToken } : {}),
    }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Lovable email failed ${res.status}: ${body}`)
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
