import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

type Ctx = { supabase: any; userId: string };

async function assertAdmin(context: Ctx) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!data) throw new Error("Forbidden");
}

const TABLES = [
  "journey_categories",
  "itineraries",
  "journal_articles",
  "lodges",
  "destinations",
  "testimonials",
  "faqs",
] as const;
type TableName = (typeof TABLES)[number];

const ListSchema = z.object({
  table: z.enum(TABLES),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(12),
  orderBy: z.string().default("sort_order"),
  orderDir: z.enum(["asc", "desc"]).default("asc"),
});
const UpsertSchema = z.object({
  table: z.enum(TABLES),
  row: z.record(z.string(), z.any()),
});
const DeleteSchema = z.object({ table: z.enum(TABLES), id: z.string().uuid() });

// Allow-list of sortable columns per table to prevent injection via orderBy
const SORTABLE: Record<TableName, string[]> = {
  journey_categories: ["sort_order", "title", "slug", "created_at", "updated_at"],
  itineraries: ["sort_order", "name", "price_from_usd", "created_at", "updated_at"],
  journal_articles: ["sort_order", "title", "published_at", "created_at", "updated_at"],
  lodges: ["sort_order", "name", "price_from_usd", "created_at", "updated_at"],
  destinations: ["sort_order", "name", "country", "region", "created_at", "updated_at"],
  testimonials: ["sort_order", "name", "rating", "created_at", "updated_at"],
  faqs: ["sort_order", "category", "created_at", "updated_at"],
};

export const adminList = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ListSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const orderCol = SORTABLE[data.table].includes(data.orderBy) ? data.orderBy : "sort_order";
    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;
    const { data: rows, error, count } = await supabaseAdmin
      .from(data.table)
      .select("*", { count: "exact" })
      .order(orderCol, { ascending: data.orderDir === "asc", nullsFirst: false })
      .range(from, to);
    if (error) throw new Error(error.message);
    return { rows: rows ?? [], count: count ?? 0 };
  });

const UploadImageSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().regex(/^image\/(png|jpe?g|webp|gif|avif)$/i, "Unsupported image type"),
  base64: z.string().min(1),
});

export const adminUploadImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UploadImageSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const cleanName = data.filename.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, "");
    const path = `cms/${Date.now()}-${cleanName}`;

    const binary = atob(data.base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    // 8 MB hard limit (Worker memory)
    if (bytes.length > 8 * 1024 * 1024) throw new Error("Image exceeds 8MB limit");

    const { error: upErr } = await supabaseAdmin.storage
      .from("journal-images")
      .upload(path, bytes, { contentType: data.contentType, upsert: false });
    if (upErr) throw new Error(upErr.message);

    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from("journal-images")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    if (signErr) throw new Error(signErr.message);

    return { url: signed.signedUrl, path, size: bytes.length };
  });

export const adminUpsert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UpsertSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const row = { ...data.row };
    // remove auto fields when blank id
    if (!row.id) delete row.id;
    const { data: saved, error } = await supabaseAdmin
      .from(data.table)
      .upsert(row)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return saved;
  });

export const adminDelete = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => DeleteSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from(data.table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---- Bookings ----
export const adminListBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    return data ?? [];
  });

const BookingUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
  payment_status: z.enum(["unpaid", "deposit_paid", "paid_in_full", "refunded"]).optional(),
});

export const adminUpdateBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => BookingUpdateSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...patch } = data;
    const { error } = await supabaseAdmin.from("bookings").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---- Enquiries ----
export const adminListEnquiries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });
    return data ?? [];
  });

// ---- Private Travel ----
export const adminListPrivateTravel = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("private_travel_requests")
      .select("*")
      .order("created_at", { ascending: false });
    return data ?? [];
  });

// ---- Newsletter ----
export const adminListSubscribers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    return data ?? [];
  });

// ---- Dashboard counts ----
export const adminDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [b, e, p, n, pending, revenue, recentB, recentE, recentP] = await Promise.all([
      supabaseAdmin.from("bookings").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("enquiries").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("private_travel_requests").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabaseAdmin.from("bookings").select("total_estimate_usd").in("status", ["confirmed", "completed"]),
      supabaseAdmin.from("bookings").select("id, itinerary_name, guest_name, status, created_at").order("created_at", { ascending: false }).limit(4),
      supabaseAdmin.from("enquiries").select("id, name, subject, created_at").order("created_at", { ascending: false }).limit(4),
      supabaseAdmin.from("private_travel_requests").select("id, name, created_at").order("created_at", { ascending: false }).limit(2),
    ]);
    const total_revenue = (revenue.data ?? []).reduce(
      (sum: number, r: { total_estimate_usd: number | null }) => sum + (r.total_estimate_usd ?? 0),
      0,
    );
    type Activity = { kind: "booking" | "enquiry" | "private"; title: string; subtitle: string; at: string };
    const activity: Activity[] = [
      ...(recentB.data ?? []).map((r: any) => ({
        kind: "booking" as const,
        title: `Booking: ${r.itinerary_name}`,
        subtitle: `${r.guest_name} • ${r.status}`,
        at: r.created_at as string,
      })),
      ...(recentE.data ?? []).map((r: any) => ({
        kind: "enquiry" as const,
        title: `Enquiry: ${r.subject ?? "General"}`,
        subtitle: r.name as string,
        at: r.created_at as string,
      })),
      ...(recentP.data ?? []).map((r: any) => ({
        kind: "private" as const,
        title: "Private travel request",
        subtitle: r.name as string,
        at: r.created_at as string,
      })),
    ]
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 6);
    return {
      bookings: b.count ?? 0,
      enquiries: e.count ?? 0,
      private_travel: p.count ?? 0,
      subscribers: n.count ?? 0,
      pending_bookings: pending.count ?? 0,
      total_revenue,
      activity,
    };
  });
