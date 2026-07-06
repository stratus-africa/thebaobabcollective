import { Link } from "@tanstack/react-router";
import { Compass, MapPin, Mountain, Tent } from "lucide-react";
import heroImg from "@/assets/hero-baobab.jpg";
import { PAGE_DEFAULTS } from "@/lib/page-content.defaults";
import { EnquireDialog } from "@/components/site/EnquireDialog";

const proofAvatars = [
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/45.jpg",
  "https://randomuser.me/api/portraits/men/76.jpg",
  "https://randomuser.me/api/portraits/women/12.jpg",
];

const quickLinks = [
  { to: "/destinations", label: "Destinations", icon: MapPin },
  { to: "/journeys", label: "Journeys", icon: Compass },
  { to: "/adventures", label: "Adventures", icon: Mountain },
  { to: "/lodges", label: "Lodges", icon: Tent },
] as const;

import { usePreviewMerge } from "@/lib/preview-overrides";

type HeroContent = Partial<typeof PAGE_DEFAULTS.home>;

export function Hero({ content }: { content?: HeroContent | null } = {}) {
  const base = { ...PAGE_DEFAULTS.home, ...(content ?? {}) };
  const c = usePreviewMerge("home", base);
  const heroSrc = c.hero_image_url || heroImg;
  return (
    <section className="relative w-full overflow-hidden pb-28 md:pb-36">
      <div className="relative h-[640px] md:h-[720px] w-full">
        <img
          src={heroSrc}
          alt="Safari jeep beside baobab tree at sunset"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/75 via-background/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-10 h-full flex items-center">
          <div className="max-w-xl animate-fade-up">
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-foreground leading-[1.05]">
              {c.hero_title_line1}<br />{c.hero_title_line2}
            </h1>
            <div className="w-16 h-px bg-gold my-7" />
            <p className="text-foreground/85 text-lg leading-relaxed mb-8">
              {c.hero_subtitle}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/adventures"
                className="inline-flex items-center bg-gold text-gold-foreground uppercase tracking-[0.25em] text-[11px] px-8 py-4 hover:bg-gold/90 transition-colors"
              >
                {c.hero_cta_primary}
              </Link>
              <EnquireDialog
                sourceUrl="/"
                autosaveKey="enquire-home-hero"
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center border border-foreground/30 text-foreground uppercase tracking-[0.25em] text-[11px] px-8 py-4 hover:border-gold hover:text-gold transition-colors"
                  >
                    {c.hero_cta_secondary}
                  </button>
                }
              />
            </div>

            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-3">
                {proofAvatars.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    loading="lazy"
                    className="h-9 w-9 rounded-full border-2 border-background object-cover"
                    style={{ zIndex: proofAvatars.length - i }}
                  />
                ))}
                <span className="h-9 w-9 rounded-full border-2 border-background bg-gold text-gold-foreground text-[10px] font-medium flex items-center justify-center">
                  +120
                </span>
              </div>
              <p className="text-foreground/80 text-xs tracking-wide">
                {c.hero_proof_text}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating quick-explore card */}
      {!c.quick_explore_hidden && (
        <div className="relative z-20 max-w-5xl mx-auto px-6 lg:px-10 -mt-20 md:-mt-24">
          <div className="bg-background/95 backdrop-blur border border-border shadow-xl">
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
