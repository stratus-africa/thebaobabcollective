import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type AdventuresHero = {
  eyebrow: string;
  headline: string;
  subhead: string;
};
export type AdventuresPhilosophy = { eyebrow: string; body: string };
export type AdventuresCta = {
  eyebrow: string;
  headline: string;
  body: string;
  buttonLabel: string;
};
export type AdventuresTerrain = { icon: string; label: string; note: string };
export type AdventuresStyle = { icon: string; title: string; body: string };
export type AdventuresSignature = {
  slug: string;
  name: string;
  region: string;
  terrain: string;
  nights: string;
  difficulty: "Easy" | "Moderate" | "Active" | "Challenging" | string;
  image: string;
  description: string;
  highlights: string[];
};

export type AdventuresPage = {
  id?: string;
  hero: AdventuresHero;
  philosophy: AdventuresPhilosophy;
  cta: AdventuresCta;
  terrains: AdventuresTerrain[];
  styles: AdventuresStyle[];
  signatures: AdventuresSignature[];
};

export const adventuresDefaults: AdventuresPage = {
  hero: {
    eyebrow: "Adventures",
    headline: "Wild Africa, deeply lived.",
    subhead:
      "Walking safaris, mokoro mornings, gorilla treks, desert traverses. The adventures we build are slow, private and shaped by the people who know the land best.",
  },
  philosophy: {
    eyebrow: "The Philosophy",
    body: "Adventure isn't a checklist. It's the long walk that turns into a discovery, the silence that holds you on a riverbank, the elder who lets you sit with the fire. We craft the conditions — Africa does the rest.",
  },
  cta: {
    eyebrow: "Begin",
    headline: "Your adventure, our craft.",
    body: "Share your dates, your dreams and the shape of your travelling party. We'll respond within 24 hours with a first sketch.",
    buttonLabel: "Request Your Adventure",
  },
  terrains: [],
  styles: [],
  signatures: [],
};

export const getAdventuresPage = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdventuresPage> => {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { data } = await supabase
      .from("adventures_page_blocks" as any)
      .select("id, hero, philosophy, cta, terrains, styles, signatures")
      .limit(1)
      .maybeSingle();
    if (!data) return adventuresDefaults;
    return {
      id: (data as any).id,
      hero: { ...adventuresDefaults.hero, ...((data as any).hero ?? {}) },
      philosophy: { ...adventuresDefaults.philosophy, ...((data as any).philosophy ?? {}) },
      cta: { ...adventuresDefaults.cta, ...((data as any).cta ?? {}) },
      terrains: ((data as any).terrains ?? []) as AdventuresTerrain[],
      styles: ((data as any).styles ?? []) as AdventuresStyle[],
      signatures: ((data as any).signatures ?? []) as AdventuresSignature[],
    };
  },
);

const SavePayload = z.object({
  hero: z.object({ eyebrow: z.string(), headline: z.string(), subhead: z.string() }),
  philosophy: z.object({ eyebrow: z.string(), body: z.string() }),
  cta: z.object({
    eyebrow: z.string(),
    headline: z.string(),
    body: z.string(),
    buttonLabel: z.string(),
  }),
  terrains: z.array(
    z.object({ icon: z.string(), label: z.string(), note: z.string() }),
  ),
  styles: z.array(z.object({ icon: z.string(), title: z.string(), body: z.string() })),
  signatures: z.array(
    z.object({
      slug: z.string().min(1),
      name: z.string().min(1),
      region: z.string(),
      terrain: z.string(),
      nights: z.string(),
      difficulty: z.string(),
      image: z.string(),
      description: z.string(),
      highlights: z.array(z.string()),
    }),
  ),
});

export const saveAdventuresPage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SavePayload.parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("adventures_page_blocks" as any)
      .select("id")
      .limit(1)
      .maybeSingle();
    const payload = {
      ...data,
      updated_by: context.userId,
      singleton: true,
    } as any;
    if ((existing as any)?.id) {
      const { error } = await supabaseAdmin
        .from("adventures_page_blocks" as any)
        .update(payload)
        .eq("id", (existing as any).id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("adventures_page_blocks" as any)
        .insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true as const };
  });
