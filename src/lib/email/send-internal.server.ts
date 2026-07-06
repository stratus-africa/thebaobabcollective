diff --git a/src/lib/email/send-internal.server.ts b/src/lib/email/send-internal.server.ts
index ccb719c..65c0165 100644
--- a/src/lib/email/send-internal.server.ts
+++ b/src/lib/email/send-internal.server.ts
@@ -12,6 +12,75 @@ const SITE_NAME = 'thebaobabcollective'
 const SENDER_DOMAIN = 'notify.thebaobabcollective.co.uk'
 const FROM_DOMAIN = 'notify.thebaobabcollective.co.uk'
 
+// Generate a cryptographically random 32-byte hex token
+function generateToken(): string {
+  const bytes = new Uint8Array(32)
+  crypto.getRandomValues(bytes)
+  return Array.from(bytes)
+    .map((b) => b.toString(16).padStart(2, '0'))
+    .join('')
+}
+
+// Get the existing unused unsubscribe token for this email, or create one.
+// Mirrors the logic in /lovable/email/transactional/send.ts so both send
+// paths satisfy the email API's `missing_unsubscribe_token` requirement.
+async function getOrCreateUnsubscribeToken(
+  supabaseAdmin: any,
+  normalizedEmail: string
+): Promise<{ ok: true; token: string } | { ok: false; reason: string }> {
+  const { data: existingToken, error: tokenLookupError } = await supabaseAdmin
+    .from('email_unsubscribe_tokens')
+    .select('token, used_at')
+    .eq('email', normalizedEmail)
+    .maybeSingle()
+
+  if (tokenLookupError) {
+    console.error('getOrCreateUnsubscribeToken: lookup failed', { error: tokenLookupError })
+    return { ok: false, reason: 'token_lookup_failed' }
+  }
+
+  if (existingToken && !existingToken.used_at) {
+    return { ok: true, token: existingToken.token }
+  }
+
+  if (existingToken && existingToken.used_at) {
+    // Token exists but was already used to unsubscribe. This email should have
+    // been caught by the suppression check before we get here.
+    console.warn('getOrCreateUnsubscribeToken: token already used but email not suppressed', {
+      email: normalizedEmail,
+    })
+    return { ok: false, reason: 'unsubscribe_token_used' }
+  }
+
+  const newToken = generateToken()
+  const { error: tokenError } = await supabaseAdmin
+    .from('email_unsubscribe_tokens')
+    .upsert(
+      { token: newToken, email: normalizedEmail },
+      { onConflict: 'email', ignoreDuplicates: true }
+    )
+
+  if (tokenError) {
+    console.error('getOrCreateUnsubscribeToken: failed to create token', { error: tokenError })
+    return { ok: false, reason: 'token_create_failed' }
+  }
+
+  // If another request raced us, our upsert was silently ignored — re-read to
+  // get the token that actually ended up stored.
+  const { data: storedToken, error: reReadError } = await supabaseAdmin
+    .from('email_unsubscribe_tokens')
+    .select('token')
+    .eq('email', normalizedEmail)
+    .maybeSingle()
+
+  if (reReadError || !storedToken) {
+    console.error('getOrCreateUnsubscribeToken: failed to read back token', { error: reReadError })
+    return { ok: false, reason: 'token_readback_failed' }
+  }
+
+  return { ok: true, token: storedToken.token }
+}
+
 export async function enqueueInternalEmail(args: {
   templateName: string
   recipientEmail?: string
@@ -43,6 +112,15 @@ export async function enqueueInternalEmail(args: {
     return { ok: false, reason: 'suppressed' }
   }
 
+  const tokenResult = await getOrCreateUnsubscribeToken(supabaseAdmin, normalized)
+  if (!tokenResult.ok) {
+    console.error('enqueueInternalEmail: could not prepare unsubscribe token', {
+      reason: tokenResult.reason,
+    })
+    return { ok: false, reason: tokenResult.reason }
+  }
+  const unsubscribeToken = tokenResult.token
+
   const element = React.createElement(template.component, templateData as any)
   const html = await render(element)
   const text = await render(element, { plainText: true })
@@ -73,6 +151,7 @@ export async function enqueueInternalEmail(args: {
       purpose: 'transactional',
       label: templateName,
       idempotency_key: messageId,
+      unsubscribe_token: unsubscribeToken,
       queued_at: new Date().toISOString(),
     },
   })