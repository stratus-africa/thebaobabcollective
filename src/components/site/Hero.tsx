import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Calendar, Users, Search, Plus, Minus } from "lucide-react";
import heroImg from "@/assets/hero-baobab.jpg";
import { PAGE_DEFAULTS } from "@/lib/page-content.defaults";
import { EnquireDialog } from "@/components/site/EnquireDialog";
import { usePreviewMerge } from "@/lib/preview-overrides";

type HeroContent = Partial<typeof PAGE_DEFAULTS.home>;

export function Hero({ content }: { content?: HeroContent | null } = {}) {
  const base = { ...PAGE_DEFAULTS.home, ...(content ?? {}) };
  const c = usePreviewMerge("home", base);
  const heroSrc = c.hero_image_url || heroImg;
  const navigate = useNavigate();

  const onSearch = (formData: FormData) => {
    const q = String(formData.get("location") ?? "").trim();
    navigate({ to: "/adventures", search: { q, region: "", terrain: "", difficulty: "" } });
  };

  return (
    <section className="relative w-full pb-16 md:pb-20">
      {/* Full-bleed framed forest panel */}
      <div className="w-full px-3 sm:px-4 lg:px-6">
        <div className="relative overflow-hidden rounded-[24px] md:rounded-[28px] bg-forest text-forest-foreground">
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

          <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] gap-8 lg:gap-8 px-5 sm:px-8 md:px-12 lg:px-16 xl:px-24 pt-12 sm:pt-14 md:pt-20 pb-12 sm:pb-16 md:pb-24">
            {/* LEFT — copy */}
            <div className="max-w-2xl animate-fade-up">
              <p className="font-serif italic text-2xl sm:text-3xl md:text-4xl text-gold mb-2 md:mb-3">
                Discover
              </p>
              <h1 className="font-serif text-[52px] leading-[0.95] sm:text-[72px] md:text-[96px] lg:text-[112px] xl:text-[128px] text-cream tracking-tight">
                {c.hero_title_line1}
                <br />
                <span className="italic">{c.hero_title_line2}</span>
              </h1>

              <p className="mt-5 md:mt-6 text-cream/80 italic text-base sm:text-lg md:text-xl max-w-md">
                {c.hero_subtitle}
              </p>

              <div className="mt-6 md:mt-8 flex flex-wrap items-center gap-3 md:gap-4">
                <Link
                  to="/adventures"
                  className="inline-flex items-center rounded-full bg-gold text-gold-foreground uppercase tracking-[0.2em] text-[11px] px-7 md:px-8 py-3.5 md:py-4 hover:bg-gold/90 transition-colors shadow-lg"
                >
                  {c.hero_cta_primary}
                </Link>
                <EnquireDialog
                  sourceUrl="/"
                  autosaveKey="enquire-home-hero"
                  trigger={
                    <button
                      type="button"
                      className="inline-flex items-center rounded-full border border-cream/40 text-cream uppercase tracking-[0.2em] text-[11px] px-7 md:px-8 py-3.5 md:py-4 hover:border-gold hover:text-gold transition-colors"
                    >
                      {c.hero_cta_secondary}
                    </button>
                  }
                />
              </div>

              {/* Search capsule */}
              <div className="mt-8 md:mt-10">
                <SearchCapsule onSubmit={onSearch} />
              </div>
            </div>

            {/* RIGHT — hero image + discount badge */}
            <div className="relative min-h-[320px] sm:min-h-[420px] lg:min-h-[560px]">
              <div className="absolute inset-0 flex items-end justify-center lg:justify-end">
                <img
                  src={heroSrc}
                  alt="Baobab safari hero"
                  className="w-full h-full max-h-[600px] object-cover object-center rounded-[20px] md:rounded-[24px] shadow-2xl"
                />
              </div>
              {c.hero_proof_text && (
                <div className="absolute -left-2 top-4 md:top-10 rotate-[-8deg] bg-cream text-forest px-3 md:px-4 py-2 md:py-3 rounded-md shadow-xl max-w-[180px] md:max-w-[220px]">
                  <p className="font-serif text-xs md:text-sm leading-snug">{c.hero_proof_text}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SearchCapsule({ onSubmit }: { onSubmit: (fd: FormData) => void }) {
  const [travellers, setTravellers] = useState(2);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(new FormData(e.currentTarget));
      }}
      className="flex flex-col sm:flex-row sm:items-center gap-2 bg-cream text-forest rounded-3xl sm:rounded-full pl-4 sm:pl-6 pr-2 py-2 shadow-2xl w-full max-w-2xl"
    >
      <label className="flex-1 min-w-0 flex items-center gap-3 py-2">
        <MapPin className="h-4 w-4 text-gold shrink-0" strokeWidth={1.75} />
        <span className="flex flex-col min-w-0 flex-1">
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-forest">Location</span>
          <input
            name="location"
            placeholder="All destinations"
            className="bg-transparent outline-none text-sm text-forest placeholder:text-forest/50 w-full"
          />
        </span>
      </label>
      <span className="hidden sm:block h-8 w-px bg-forest/15" />
      <label className="flex-1 min-w-0 flex items-center gap-3 py-2 sm:px-3">
        <Calendar className="h-4 w-4 text-gold shrink-0" strokeWidth={1.75} />
        <span className="flex flex-col min-w-0 flex-1">
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
      <div className="flex-1 min-w-0 flex items-center gap-3 py-2 sm:px-3">
        <Users className="h-4 w-4 text-gold shrink-0" strokeWidth={1.75} />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-forest">Traveller</span>
          <span className="flex items-center gap-2 text-sm">
            <button
              type="button"
              aria-label="Fewer travellers"
              onClick={() => setTravellers((n) => Math.max(1, n - 1))}
              className="h-5 w-5 rounded-full border border-forest/25 grid place-items-center hover:bg-forest/5"
            >
              <Minus className="h-3 w-3" />
            </button>
            <input type="hidden" name="travellers" value={travellers} />
            <span className="min-w-[1ch] text-center">{travellers}</span>
            <button
              type="button"
              aria-label="More travellers"
              onClick={() => setTravellers((n) => n + 1)}
              className="h-5 w-5 rounded-full border border-forest/25 grid place-items-center hover:bg-forest/5"
            >
              <Plus className="h-3 w-3" />
            </button>
          </span>
        </div>
      </div>
      <button
        type="submit"
        aria-label="Search"
        className="shrink-0 h-12 w-12 rounded-full bg-gold text-gold-foreground grid place-items-center hover:bg-gold/90 transition-colors self-end sm:self-auto"
      >
        <Search className="h-5 w-5" />
      </button>
    </form>
  );
}
