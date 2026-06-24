import { createServerFn } from "@tanstack/react-start";

// Public CMS reads - use admin client to bypass auth requirement
// but filter to published only.

export const getJourneyCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: cats, error } = await supabaseAdmin
    .from("journey_categories")
    .select("*")
    .eq("published", true)
    .order("sort_order");
  if (error) throw new Error(error.message);

  const { data: its } = await supabaseAdmin
    .from("itineraries")
    .select("*")
    .eq("published", true)
    .order("sort_order");

  return (cats ?? []).map((c) => ({
    ...c,
    itineraries: (its ?? []).filter((i) => i.category_id === c.id),
  }));
});

export const getJourneyBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: cat } = await supabaseAdmin
      .from("journey_categories")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (!cat) return null;
    const { data: its } = await supabaseAdmin
      .from("itineraries")
      .select("*")
      .eq("category_id", cat.id)
      .eq("published", true)
      .order("sort_order");
    return { ...cat, itineraries: its ?? [] };
  });

export const getArticles = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const nowIso = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from("journal_articles")
    .select("*")
    .or(`published.eq.true,scheduled_at.lte.${nowIso}`)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getArticleBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const nowIso = new Date().toISOString();
    const { data: article } = await supabaseAdmin
      .from("journal_articles")
      .select("*")
      .eq("slug", data.slug)
      .or(`published.eq.true,scheduled_at.lte.${nowIso}`)
      .maybeSingle();
    return article;
  });

export const getLodges = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("lodges")
    .select("*")
    .eq("published", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getLodgeBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: lodge } = await supabaseAdmin
      .from("lodges")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    return lodge;
  });

export const getDestinations = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("destinations")
    .select("*")
    .eq("published", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getTestimonials = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("testimonials")
    .select("*")
    .eq("published", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getFaqs = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("faqs")
    .select("*")
    .eq("published", true)
    .order("category")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getItineraryBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: it } = await supabaseAdmin
      .from("itineraries")
      .select("*, category:journey_categories(*)")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    return it;
  });

export const getDestinationBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: dest } = await supabaseAdmin
      .from("destinations")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    return dest;
  });
