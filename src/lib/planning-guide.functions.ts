import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const RequestSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(120),
  email: z.string().trim().email("Valid email required").max(255),
  travellingParty: z.string().trim().max(120).optional().or(z.literal("")),
  earliestDate: z.string().trim().max(80).optional().or(z.literal("")),
  interests: z.array(z.string().max(60)).max(20).default([]),
  message: z.string().trim().max(1500).optional().or(z.literal("")),
});

export const requestPlanningGuide = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => RequestSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Insert request row
    const { data: row, error: insertErr } = await supabaseAdmin
      .from("planning_guide_requests" as any)
      .insert({
        name: data.name,
        email: data.email.toLowerCase(),
        travelling_party: data.travellingParty || null,
        earliest_date: data.earliestDate || null,
        interests: data.interests ?? [],
        message: data.message || null,
      })
      .select("id")
      .single();
    if (insertErr) {
      console.error("planning-guide insert", insertErr);
      throw new Error("Could not save your request. Please try again.");
    }
    const requestId = (row as any).id as string;

    // 2. Generate PDF
    let pdfUrl: string | null = null;
    try {
      const { renderPlanningGuidePdf } = await import("@/lib/pdf/planning-guide.server");
      const buffer = await renderPlanningGuidePdf({
        name: data.name,
        interests: data.interests ?? [],
        travellingParty: data.travellingParty || null,
        earliestDate: data.earliestDate || null,
      });

      const path = `${new Date().getFullYear()}/${requestId}.pdf`;
      const { error: uploadErr } = await supabaseAdmin.storage
        .from("planning-guides")
        .upload(path, buffer, {
          contentType: "application/pdf",
          upsert: true,
        });
      if (uploadErr) {
        console.error("planning-guide upload", uploadErr);
      } else {
        const { data: signed } = await supabaseAdmin.storage
          .from("planning-guides")
          .createSignedUrl(path, 60 * 60 * 24 * 30);
        pdfUrl = signed?.signedUrl ?? null;
        await supabaseAdmin
          .from("planning_guide_requests" as any)
          .update({ pdf_url: pdfUrl })
          .eq("id", requestId);
      }
    } catch (err) {
      console.error("planning-guide pdf", err);
    }

    // 3. Email send is conditional — only when a Lovable Emails domain is configured.
    //    We attempt a best-effort send; failures don't break the user flow.
    try {
      const { sendPlanningGuideEmails } = await import("@/lib/email/planning-guide.server");
      await sendPlanningGuideEmails({
        name: data.name,
        email: data.email,
        pdfUrl,
        travellingParty: data.travellingParty || null,
        earliestDate: data.earliestDate || null,
        interests: data.interests ?? [],
        message: data.message || null,
      });
      await supabaseAdmin
        .from("planning_guide_requests" as any)
        .update({ email_sent: true })
        .eq("id", requestId);
    } catch (err) {
      console.warn("planning-guide email skipped:", (err as Error)?.message);
    }

    return { ok: true as const, pdfUrl };
  });

export const adminListPlanningGuide = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("planning_guide_requests" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as any[]) ?? [];
  });
