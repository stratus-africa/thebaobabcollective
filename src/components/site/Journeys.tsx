import { ArrowRight, Sun, Leaf, Globe, Trees } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PAGE_DEFAULTS } from "@/lib/page-content.defaults";
import { usePreviewMerge } from "@/lib/preview-overrides";

const categories = [
  { slug: "adventure" as const, icon: Sun, title: "Adventure", desc: "Wild landscapes and thrilling encounters that awaken your sense of wonder." },
  { slug: "connection" as const, icon: Leaf, title: "Connection", desc: "Meaningful moments with people, culture and the natural world." },
  { slug: "heritage" as const, icon: Globe, title: "Heritage", desc: "Honouring the rich stories and traditions that shape Africa." },
  { slug: "conservation" as const, icon: Trees, title: "Conservation", desc: "Supporting conservation and communities for a more sustainable future." },
];

type Content = Partial<typeof PAGE_DEFAULTS.home_journeys>;

export function Journeys({ content }: { content?: Content | null } = {}) {
  const base = { ...PAGE_DEFAULTS.home_journeys, ...(content ?? {}) };
  const c = usePreviewMerge("home_journeys", base);
  return (
    <section id="journeys" className="bg-background py-20 md:py-28">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-[11px] tracking-[0.3em] uppercase text-foreground/70 mb-4">{c.eyebrow}</p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-5 tracking-wider">{c.title}</h2>
          <p className="text-foreground/70 leading-relaxed">{c.body}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border/60">
          {categories.map((cat) => (
            <div
              key={cat.slug}
              className="bg-background p-8 text-center flex flex-col items-center group hover:bg-cream transition-colors"
            >
              <cat.icon className="w-14 h-14 text-gold mb-6" strokeWidth={1.2} aria-hidden="true" />
              <h3 className="text-[13px] tracking-[0.25em] uppercase text-foreground mb-4">{cat.title}</h3>
              <p className="text-sm text-foreground/70 leading-relaxed mb-8 flex-1">{cat.desc}</p>
              <Link
                to="/journeys/$slug"
                params={{ slug: cat.slug }}
                className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-foreground group-hover:text-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                View Journeys <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
