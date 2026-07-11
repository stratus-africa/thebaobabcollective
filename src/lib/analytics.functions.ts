import { createServerFn } from "@tanstack/react-start";

/**
 * Record a site visit. This is designed to be called from the root layout
 * once per browser session. It increments a single global counter row.
 */
export const recordVisit = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await (supabaseAdmin as any).rpc("increment_visitor_counter");
  return { ok: true as const };
});
