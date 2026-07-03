import { ArrowRight } from "lucide-react";
import lodge from "@/assets/lodge-tent.jpg";
import elephant from "@/assets/elephant.jpg";
import { PAGE_DEFAULTS } from "@/lib/page-content.defaults";

type AboutContent = Partial<typeof PAGE_DEFAULTS.about>;

export function About({ content }: { content?: AboutContent | null } = {}) {
  const c = { ...PAGE_DEFAULTS.about, ...(content ?? {}) };
  const leftSrc = c.image_left_url || lodge;
  const rightSrc = c.image_right_url || elephant;

  return (
    <section className="bg-cream py-20 md:py-28">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-foreground/70 mb-6">
            {c.eyebrow}
          </p>
          <div className="w-12 h-px bg-gold mb-8" />
          <h2 className="font-serif text-4xl md:text-5xl leading-[1.1] text-foreground mb-8">
            {c.title_line1}<br />{c.title_line2}<br />{c.title_line3}
          </h2>
          <p className="text-foreground/75 leading-relaxed max-w-md mb-8">
            {c.body}
          </p>
          <a
            href="#about"
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-foreground border-b border-foreground/40 pb-1 hover:border-gold hover:text-gold transition-colors"
          >
            {c.cta_label} <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="overflow-hidden">
            <img
              src={leftSrc}
              alt="Luxury safari lodge tent at sunset"
              loading="lazy"
              className="w-full h-[420px] object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="overflow-hidden mt-12">
            <img
              src={rightSrc}
              alt="African elephant in savannah"
              loading="lazy"
              className="w-full h-[420px] object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
