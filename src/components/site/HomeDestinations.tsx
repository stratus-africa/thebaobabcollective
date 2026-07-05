import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PAGE_DEFAULTS } from "@/lib/page-content.defaults";
import { usePreviewMerge } from "@/lib/preview-overrides";

type Content = Partial<typeof PAGE_DEFAULTS.home_destinations>;

export function HomeDestinations({ content }: { content?: Content | null } = {}) {
  const base = { ...PAGE_DEFAULTS.home_destinations, ...(content ?? {}) };
  const c = usePreviewMerge("home_destinations", base);
  return (
    <section className="bg-background py-16 md:py-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 text-center">
        <p className="text-[11px] tracking-[0.3em] uppercase text-foreground/70 mb-3">{c.eyebrow}</p>
        <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4 tracking-wider">{c.title}</h2>
        <p className="text-foreground/70 max-w-2xl mx-auto mb-8">{c.body}</p>
        <Link
          to="/destinations"
          className="inline-flex items-center gap-2 border border-gold text-gold uppercase tracking-[0.25em] text-[11px] px-7 py-4 hover:bg-gold hover:text-gold-foreground transition-colors"
        >
          {c.cta_label} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </section>
  );
}
