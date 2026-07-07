import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import {
  ArrowRight,
  Check,
  Calendar,
  Gauge,
  MapPin,
  Search,
  X,
  Loader2,
  Download,
  Compass,
  Mountain,
  Waves,
  Sun,
  Footprints,
  Tent,
  Binoculars,
  Plane,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { EnquireDialog } from "@/components/site/EnquireDialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import heroBaobab from "@/assets/hero-baobab.jpg";
import {
  adventuresDefaults,
  getAdventuresPage,
  type AdventuresPage,
} from "@/lib/adventures.functions";
import { requestPlanningGuide } from "@/lib/planning-guide.functions";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  region: fallback(z.string(), "").default(""),
  terrain: fallback(z.string(), "").default(""),
  difficulty: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/adventures/")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Safari Adventures — Wild Africa, Deeply Lived | The Baobab Collective" },
      {
        name: "description",
        content:
          "Walking safaris, mokoro expeditions, desert traverses, gorilla treks and migration chases. Filter our signature adventures by region, terrain and difficulty.",
      },
      { property: "og:title", content: "Safari Adventures — The Baobab Collective" },
      {
        property: "og:description",
        content: "Bespoke wild adventures across Africa — walking safaris, deserts, deltas and gorilla treks.",
      },
      { property: "og:image", content: heroBaobab },
      { property: "og:url", content: "/adventures" },
    ],
    links: [{ rel: "canonical", href: "/adventures" }],
  }),
  loader: async ({ context }) => {
    return context.queryClient.ensureQueryData({
      queryKey: ["adventures-page"],
      queryFn: () => getAdventuresPage(),
      staleTime: 60_000,
    });
  },
  errorComponent: ({ error }) => (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-32 text-center">
        <h1 className="font-serif text-3xl mb-4">Something went wrong</h1>
        <p className="text-foreground/70">{error.message}</p>
      </main>
      <Footer />
    </div>
  ),
  notFoundComponent: () => (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-32 text-center">
        <h1 className="font-serif text-4xl mb-4">Page not found</h1>
        <Link to="/" className="text-gold underline">Back home</Link>
      </main>
      <Footer />
    </div>
  ),
  component: AdventuresPage,
});

const iconMap = {
  Mountain, Waves, Sun, Footprints, Tent, Binoculars, Plane, Compass,
} as const;
type IconKey = keyof typeof iconMap;

const difficultyMeta: Record<string, { dots: number; tone: string }> = {
  Easy: { dots: 1, tone: "text-foreground/70" },
  Moderate: { dots: 2, tone: "text-foreground/70" },
  Active: { dots: 3, tone: "text-terracotta" },
  Challenging: { dots: 4, tone: "text-terracotta" },
};

function Icon({ name, className }: { name: string; className?: string }) {
  const C = (iconMap as any)[name as IconKey] ?? Compass;
  return <C className={className} strokeWidth={1.4} />;
}

function AdventuresPage() {
  const fn = useServerFn(getAdventuresPage);
  const { data } = useQuery({
    queryKey: ["adventures-page"],
    queryFn: () => fn(),
  });
  const page: AdventuresPage = data ?? adventuresDefaults;

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main>
        <HeroSection hero={page.hero} />
        <SignaturesSection signatures={page.signatures} />
        <RhythmSection />
        <CtaSection cta={page.cta} />
      </main>
      <Footer />
    </div>
  );
}

function HeroSection({ hero }: { hero: AdventuresPage["hero"] }) {
  const heroSrc = hero.image || heroBaobab;
  return (
    <section className="relative h-[78vh] min-h-[560px] flex items-end">
      <img
        src={heroSrc}
        alt={hero.imageAlt || "Sunrise over the African bush — a guide leads a walking safari toward distant baobabs"}
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />
      <div className="relative max-w-[1920px] mx-auto px-6 lg:px-10 pb-20 text-background w-full">
        <p className="text-[11px] tracking-[0.35em] uppercase text-gold mb-5">{hero.eyebrow}</p>
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1] mb-6 max-w-4xl">
          {hero.headline}
        </h1>
        <p className="text-lg md:text-xl text-background/85 max-w-2xl leading-relaxed mb-8">
          {hero.subhead}
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="#signature"
            className="inline-flex items-center gap-2 bg-gold text-gold-foreground uppercase tracking-[0.25em] text-[11px] px-7 py-4 hover:bg-gold/90"
          >
            Featured Adventures <ArrowRight className="w-3 h-3" />
          </a>
          <EnquireDialog
            sourceUrl="/adventures"
            autosaveKey="enquire:adventures-hero"
            trigger={
              <button
                type="button"
                className="inline-flex items-center gap-2 border border-background/70 text-background uppercase tracking-[0.25em] text-[11px] px-7 py-4 hover:bg-background hover:text-foreground transition-colors"
              >
                Start Your Enquiry
              </button>
            }
          />
        </div>
      </div>
    </section>
  );
}


function SignaturesSection({ signatures }: { signatures: AdventuresPage["signatures"] }) {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const regions = useMemo(
    () => Array.from(new Set(signatures.map((s) => s.region).filter(Boolean))).sort(),
    [signatures],
  );
  const terrains = useMemo(
    () => Array.from(new Set(signatures.map((s) => s.terrain).filter(Boolean))).sort(),
    [signatures],
  );
  const difficulties = ["Easy", "Moderate", "Active", "Challenging"];

  const filtered = useMemo(() => {
    const q = (search.q ?? "").trim().toLowerCase();
    const region = search.region ?? "";
    const terrain = search.terrain ?? "";
    const difficulty = search.difficulty ?? "";
    return signatures.filter((s) => {
      if (region && s.region !== region) return false;
      if (terrain && s.terrain !== terrain) return false;
      if (difficulty && s.difficulty !== difficulty) return false;
      if (q) {
        const haystack = `${s.name} ${s.region} ${s.description} ${(s.highlights || []).join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [signatures, search]);

  const hasFilters = !!((search.q ?? "") || (search.region ?? "") || (search.terrain ?? "") || (search.difficulty ?? ""));

  const setParam = (k: "q" | "region" | "terrain" | "difficulty", v: string) =>
    navigate({
      search: (prev: z.infer<typeof searchSchema>) => ({ ...prev, [k]: v }),
      replace: true,
    });

  const clearAll = () =>
    navigate({ search: { q: "", region: "", terrain: "", difficulty: "" }, replace: true });

  return (
    <section id="signature" className="py-24 md:py-32 scroll-mt-20">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-[11px] tracking-[0.3em] uppercase text-terracotta mb-4">Signature Adventures</p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground">
            {signatures.length} journeys we'd take ourselves.
          </h2>
          <p className="text-foreground/70 mt-5">
            Each is a starting point — every detail is reshaped around you, your dates and your pace.
          </p>
        </div>

        <div className="mb-12" />


        {filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border/60 bg-cream/40">
            <p className="font-serif text-2xl text-foreground mb-3">No adventures match those filters.</p>
            <p className="text-foreground/65 mb-6">Adjust them, or let us design something bespoke.</p>
            <div className="flex justify-center gap-3 flex-wrap">
              <button
                onClick={clearAll}
                className="inline-flex items-center gap-2 border border-gold text-gold uppercase tracking-[0.25em] text-[11px] px-6 py-3 hover:bg-gold hover:text-gold-foreground transition-colors"
              >
                Clear filters
              </button>
              <Link
                to="/private-travel"
                className="inline-flex items-center gap-2 bg-gold text-gold-foreground uppercase tracking-[0.25em] text-[11px] px-6 py-3 hover:bg-gold/90"
              >
                Design your own <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-16">
            {filtered.map((a) => {
              const meta = difficultyMeta[a.difficulty] ?? difficultyMeta.Moderate;
              return (
                <article key={a.slug} className="group">
                  <Link
                    to="/adventures/$slug"
                    params={{ slug: a.slug }}
                    className="block overflow-hidden aspect-[4/3] mb-6"
                  >
                    <img
                      src={a.image}
                      alt={`${a.name} — ${a.region}`}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </Link>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] tracking-[0.2em] uppercase text-foreground/60 mb-3">
                    <span className="inline-flex items-center gap-2 text-gold">
                      <MapPin className="w-3 h-3" /> {a.region}
                    </span>
                    <span>{a.nights}</span>
                    <span className={`inline-flex items-center gap-2 ${meta.tone}`}>
                      {a.difficulty}
                      <span className="inline-flex gap-0.5">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <span
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${i < meta.dots ? "bg-current" : "bg-current/25"}`}
                          />
                        ))}
                      </span>
                    </span>
                  </div>
                  <h3 className="font-serif text-3xl text-foreground mb-3">
                    <Link to="/adventures/$slug" params={{ slug: a.slug }} className="hover:text-gold">
                      {a.name}
                    </Link>
                  </h3>
                  <p className="text-foreground/75 leading-relaxed mb-5">{a.description}</p>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6">
                    {(a.highlights || []).map((h) => (
                      <li key={h} className="flex gap-2 text-sm text-foreground/75">
                        <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/adventures/$slug"
                      params={{ slug: a.slug }}
                      className="inline-flex items-center gap-2 bg-gold text-gold-foreground uppercase tracking-[0.25em] text-[11px] px-6 py-3 hover:bg-gold/90"
                    >
                      View Itinerary <ArrowRight className="w-3 h-3" />
                    </Link>
                    <EnquireDialog
                      sourceUrl={`/adventures/${a.slug}`}
                      autosaveKey={`enquire:adventure:${a.slug}`}
                      trigger={
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 border border-gold text-gold uppercase tracking-[0.25em] text-[11px] px-6 py-3 hover:bg-gold hover:text-gold-foreground transition-colors"
                        >
                          Enquire
                        </button>
                      }
                    />

                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="md:col-span-2 lg:col-span-2">
      <Label className="text-[10px] tracking-[0.25em] uppercase text-foreground/60 mb-1.5 block">
        {label}
      </Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 bg-background border border-border px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function RhythmSection() {
  const rhythm = [
    {
      when: "Dawn",
      title: "First light, first tracks",
      body: "Coffee in camp, then out before the bush wakes — when leopards are still moving and the light is liquid gold.",
    },
    {
      when: "Mid-Morning",
      title: "Encounter & Read",
      body: "Time on foot with your guide reading sign, story and silence. The richest hours of any adventure day.",
    },
    {
      when: "Afternoon",
      title: "Slow & Local",
      body: "Rest, swim, journal, or sit with a tracker over tea. The bush is hot, and so is your patience for it.",
    },
    {
      when: "Sundown",
      title: "Sundowner & Story",
      body: "Gin in hand on a kopje, an escarpment, a mokoro — wherever the day has carried you. Then dinner under the stars.",
    },
  ];
  return (
    <section className="py-24 bg-cream">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-32">
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">A Day in the Field</p>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-6">
              The rhythm of an adventure day.
            </h2>
            <p className="text-foreground/70 leading-relaxed">
              No two days repeat — but the cadence is the same. Up before the bush, slow through the heat, alive again at dusk.
            </p>
          </div>
          <ol className="lg:col-span-8 space-y-10">
            {rhythm.map((r, i) => (
              <li key={r.when} className="grid grid-cols-[auto_1fr] gap-6 md:gap-10">
                <div className="text-right">
                  <div className="font-serif text-4xl text-terracotta">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="text-[11px] tracking-[0.25em] uppercase text-foreground/55 mt-1">
                    {r.when}
                  </div>
                </div>
                <div className="border-l border-border pl-6 md:pl-8 pb-2">
                  <h3 className="font-serif text-2xl text-foreground mb-2">{r.title}</h3>
                  <p className="text-foreground/70 leading-relaxed">{r.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

const INTEREST_OPTIONS = [
  "Walking safaris",
  "Big game",
  "Gorilla & primate trekking",
  "Desert landscapes",
  "Water-based safaris",
  "Cultural connection",
  "Conservation projects",
  "Photography",
  "Family-friendly",
  "Honeymoon",
];

function PlanningGuideSection() {
  const submit = useServerFn(requestPlanningGuide);
  const [loading, setLoading] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [success, setSuccess] = useState<{ pdfUrl: string | null } | null>(null);

  const toggle = (v: string) =>
    setInterests((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const result = await submit({
        data: {
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          travellingParty: String(fd.get("travellingParty") ?? ""),
          earliestDate: String(fd.get("earliestDate") ?? ""),
          interests,
          message: String(fd.get("message") ?? ""),
        },
      });
      setSuccess({ pdfUrl: result.pdfUrl ?? null });
      toast.success("Your Planning Guide is ready — check your inbox.");
      (e.target as HTMLFormElement).reset();
      setInterests([]);
    } catch (err: any) {
      toast.error(err?.message ?? "Could not request guide. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="planning-guide" className="py-24 md:py-32 bg-background scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">Free Resource</p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-6">
            The Africa Planning Guide.
          </h2>
          <p className="text-foreground/75 leading-relaxed mb-8">
            A short, beautifully produced PDF covering how we design journeys, when to travel, sample budgets, what to pack, and the conservation work behind every booking. Personalised to you on send.
          </p>
          <ul className="space-y-3 text-foreground/75 text-sm">
            {[
              "Season-by-season guide to wildlife regions",
              "Three budget tiers with what's included",
              "Field-tested packing list",
              "Direct line to a Journey Designer",
            ].map((b) => (
              <li key={b} className="flex gap-3">
                <Check className="w-4 h-4 text-gold mt-1 shrink-0" /> {b}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-7">
          {success ? (
            <div className="bg-cream border border-gold/40 p-8 md:p-10 text-center">
              <Download className="w-8 h-8 text-gold mx-auto mb-4" strokeWidth={1.4} />
              <h3 className="font-serif text-3xl text-foreground mb-3">Your guide is on its way.</h3>
              <p className="text-foreground/70 mb-6">
                We've emailed it to you and queued a personal note from a Journey Designer.
              </p>
              {success.pdfUrl ? (
                <a
                  href={success.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gold text-gold-foreground uppercase tracking-[0.25em] text-[11px] px-7 py-4 hover:bg-gold/90"
                >
                  Download your PDF <ArrowRight className="w-3 h-3" />
                </a>
              ) : (
                <p className="text-sm text-foreground/60">Your PDF link will arrive by email shortly.</p>
              )}
            </div>
          ) : (
            <form onSubmit={onSubmit} className="bg-cream p-8 md:p-10 space-y-5 border border-border/40">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" required className="mt-2 bg-background" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required className="mt-2 bg-background" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="travellingParty">Travelling party</Label>
                  <Input
                    id="travellingParty"
                    name="travellingParty"
                    placeholder="e.g. 2 adults"
                    className="mt-2 bg-background"
                  />
                </div>
                <div>
                  <Label htmlFor="earliestDate">Earliest travel window</Label>
                  <Input
                    id="earliestDate"
                    name="earliestDate"
                    placeholder="e.g. July 2026 or flexible"
                    className="mt-2 bg-background"
                  />
                </div>
              </div>
              <div>
                <Label className="mb-2 block">What calls to you?</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {INTEREST_OPTIONS.map((opt) => {
                    const active = interests.includes(opt);
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => toggle(opt)}
                        className={`text-[11px] tracking-[0.15em] uppercase px-3 py-2.5 border transition-colors text-left ${
                          active
                            ? "border-gold bg-gold text-gold-foreground"
                            : "border-border/60 bg-background text-foreground/70 hover:border-gold/60"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label htmlFor="message">Anything else? (optional)</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="mt-2 bg-background"
                  placeholder="Dreams, deal-breakers, mobility considerations, special occasions…"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 bg-gold text-gold-foreground uppercase tracking-[0.25em] text-[11px] px-8 py-4 hover:bg-gold/90 disabled:opacity-60"
              >
                {loading ? (
                  <><Loader2 className="w-3 h-3 animate-spin" /> Preparing your guide</>
                ) : (
                  <>Email me the Planning Guide <ArrowRight className="w-3 h-3" /></>
                )}
              </button>
              <p className="text-[11px] text-foreground/55">
                We only use your details to send the guide and one personal follow-up. Unsubscribe any time.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function CtaSection({ cta }: { cta: AdventuresPage["cta"] }) {
  return (
    <section className="bg-forest text-forest-foreground py-24 text-center">
      <div className="max-w-2xl mx-auto px-6">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-5">{cta.eyebrow}</p>
        <h2 className="font-serif text-4xl md:text-5xl mb-5">{cta.headline}</h2>
        <p className="text-forest-foreground/80 mb-8 leading-relaxed">{cta.body}</p>
        <Link
          to="/private-travel"
          className="inline-flex items-center gap-2 bg-gold text-gold-foreground uppercase tracking-[0.25em] text-[12px] px-8 py-4 hover:bg-gold/90"
        >
          {cta.buttonLabel} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </section>
  );
}

// Silence unused imports (kept for downstream extensions/icons in CMS)
void Checkbox; void Calendar; void Gauge;
