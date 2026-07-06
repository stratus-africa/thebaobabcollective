import { Link } from "@tanstack/react-router";
import { Compass, MapPin, Mountain, Tent, Calendar, Users, Search, Plus, Minus } from "lucide-react";
import heroImg from "@/assets/hero-baobab.jpg";
import { PAGE_DEFAULTS } from "@/lib/page-content.defaults";
import { EnquireDialog } from "@/components/site/EnquireDialog";
import { usePreviewMerge } from "@/lib/preview-overrides";

const quickLinks = [
  { to: "/destinations", label: "Destinations", icon: MapPin },
  { to: "/journeys", label: "Journeys", icon: Compass },
  { to: "/adventures", label: "Adventures", icon: Mountain },
  { to: "/lodges", label: "Lodges", icon: Tent },
] as const;

type HeroContent = Partial<typeof PAGE_DEFAULTS.home>;

export function Hero({ content }: { content?: HeroContent | null } = {}) {
  const base = { ...PAGE_DEFAULTS.home, ...(content ?? {}) };
  const c = usePreviewMerge("home", base);
  const heroSrc = c.hero_image_url || heroImg;

  return (
    <section className="relative w-full pb-28 md:pb-36">
      {/* Framed forest panel */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] bg-forest text-forest-foreground">
          {/* Decorative dotted flight paths */}
          <svg
            className="pointer-events-none absolute inset-0 w-full h-full opacity-30"
            viewBox="0 0 1200 700"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden
          >
            <circle cx="850" cy="360" r="240" stroke="currentColor" strokeOpacity="0.25" strokeDasharray="2 6" />
            <circle cx="850" cy="360" r="320" stroke="currentColor" strokeOpacity="0.2" strokeDasharray="2 6" />
            <path
              d="M 480 220 C 620 140, 760 280, 900 260 S 1140 380, 1060 460"
              stroke="currentColor"
              strokeOpacity="0.6"
              strokeDasharray="4 8"
              strokeLinecap="round"
            />
          </svg>

          <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] gap-8 lg:gap-6 px-6 md:px-12 lg:px-16 pt-14 md:pt-20 pb-16 md:pb-24">
            {/* LEFT — copy */}
            <div className="max-w-xl animate-fade-up">
              <p className="font-serif italic text-3xl md:text-4xl text-gold mb-3">
                Discover
              </p>
              <h1 className="font-serif text-[64px] leading-[0.95] md:text-[96px] lg:text-[112px] text-cream tracking-tight">
                {c.hero_title_line1}
                <br />
                <span className="italic">{c.hero_title_line2}</span>
              </h1>

              <p className="mt-6 text-cream/80 italic text-lg md:text-xl max-w-md">
                {c.hero_subtitle}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/adventures"
                  className="inline-flex items-center rounded-full bg-gold text-gold-foreground uppercase tracking-[0.2em] text-[11px] px-8 py-4 hover:bg-gold/90 transition-colors shadow-lg"
                >
                  {c.hero_cta_primary}
                </Link>
                <EnquireDialog
                  sourceUrl="/"
                  autosaveKey="enquire-home-hero"
                  trigger={
                    <button
                      type="button"
                      className="inline-flex items-center rounded-full border border-cream/40 text-cream uppercase tracking-[0.2em] text-[11px] px-8 py-4 hover:border-gold hover:text-gold transition-colors"
                    >
                      {c.hero_cta_secondary}
                    </button>
                  }
                />
              </div>

              {/* Search capsule */}
              <div className="mt-10 hidden md:block">
                <SearchCapsule />
              </div>
            </div>

            {/* RIGHT — hero image + discount badge */}
            <div className="relative min-h-[360px] lg:min-h-[540px]">
              <div className="absolute inset-0 flex items-end justify-center lg:justify-end">
                <img
                  src={heroSrc}
                  alt="Baobab safari hero"
                  className="w-full h-full max-h-[560px] object-cover object-center rounded-[24px] shadow-2xl"
                />
              </div>
              {c.hero_proof_text && (
                <div className="absolute -left-2 top-6 md:top-10 rotate-[-8deg] bg-cream text-forest px-4 py-3 rounded-md shadow-xl max-w-[200px]">
                  <p className="font-serif text-sm leading-snug">{c.hero_proof_text}</p>
                </div>
              )}
            </div>
          </div>

          {/* Mobile search capsule */}
          <div className="md:hidden px-6 pb-8 -mt-4">
            <SearchCapsule />
          </div>
        </div>
      </div>

      {/* Floating quick-explore card */}
      {!c.quick_explore_hidden && (
        <div className="relative z-20 max-w-5xl mx-auto px-6 lg:px-10 -mt-16 md:-mt-20">
          <div className="bg-background/95 backdrop-blur border border-border shadow-xl rounded-lg">
            <div className="px-6 md:px-8 py-5 border-b border-border flex items-center justify-between">
              <span className="font-serif text-xl text-foreground">Where shall we wander?</span>
              <span className="hidden md:inline text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                Curated · Conservation-led
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4">
              {quickLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="group flex flex-col items-start gap-3 p-6 border-t md:border-t-0 md:border-l border-border first:border-l-0 first:border-t-0 hover:bg-muted/40 transition-colors"
                >
                  <Icon className="h-5 w-5 text-gold" strokeWidth={1.5} />
                  <span className="font-serif text-lg text-foreground">{label}</span>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground group-hover:text-gold transition-colors">
                    Explore →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function SearchCapsule() {
  return (
    <form
      action="/adventures"
      method="get"
      className="flex items-center gap-2 bg-cream text-forest rounded-full pl-6 pr-2 py-2 shadow-2xl w-full max-w-2xl"
    >
      <label className="flex-1 min-w-0 flex items-center gap-3 py-2">
        <MapPin className="h-4 w-4 text-gold shrink-0" strokeWidth={1.75} />
        <span className="flex flex-col min-w-0">
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-forest">Location</span>
          <input
            name="location"
            placeholder="All destinations"
            className="bg-transparent outline-none text-sm text-forest placeholder:text-forest/50 w-full"
          />
        </span>
      </label>
      <span className="h-8 w-px bg-forest/15" />
      <label className="flex-1 min-w-0 flex items-center gap-3 py-2 px-3">
        <Calendar className="h-4 w-4 text-gold shrink-0" strokeWidth={1.75} />
        <span className="flex flex-col min-w-0">
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-forest">Date</span>
          <input
            name="date"
            type="text"
            placeholder="Anytime"
            className="bg-transparent outline-none text-sm text-forest placeholder:text-forest/50 w-full"
          />
        </span>
      </label>
      <span className="hidden sm:block h-8 w-px bg-forest/15" />
      <label className="hidden sm:flex flex-1 min-w-0 items-center gap-3 py-2 px-3">
        <Users className="h-4 w-4 text-gold shrink-0" strokeWidth={1.75} />
        <span className="flex flex-col min-w-0">
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-forest">Traveller</span>
          <span className="flex items-center gap-2 text-sm">
            <button type="button" aria-label="Fewer travellers" className="h-5 w-5 rounded-full border border-forest/25 grid place-items-center hover:bg-forest/5">
              <Minus className="h-3 w-3" />
            </button>
            <span className="min-w-[1ch] text-center">2</span>
            <button type="button" aria-label="More travellers" className="h-5 w-5 rounded-full border border-forest/25 grid place-items-center hover:bg-forest/5">
              <Plus className="h-3 w-3" />
            </button>
          </span>
        </span>
      </label>
      <button
        type="submit"
        aria-label="Search"
        className="shrink-0 h-12 w-12 rounded-full bg-gold text-gold-foreground grid place-items-center hover:bg-gold/90 transition-colors"
      >
        <Search className="h-5 w-5" />
      </button>
    </form>
  );
}
