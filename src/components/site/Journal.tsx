import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { articles as staticArticles } from "@/lib/content";
import { PAGE_DEFAULTS } from "@/lib/page-content.defaults";
import { usePreviewMerge } from "@/lib/preview-overrides";

type Content = Partial<typeof PAGE_DEFAULTS.home_journal>;
type Article = {
  slug: string;
  title: string;
  image?: string | null;
};

export function Journal({
  content,
  articles,
}: {
  content?: Content | null;
  articles?: Article[] | null;
} = {}) {
  const base = { ...PAGE_DEFAULTS.home_journal, ...(content ?? {}) };
  const c = usePreviewMerge("home_journal", base);
  const list = (articles && articles.length > 0 ? articles : staticArticles).slice(0, 3);

  return (
    <section className="bg-sand/40 py-20 md:py-28">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-16">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-terracotta mb-5">{c.eyebrow}</p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground leading-[1.1] mb-6">
            {c.title_line1}<br />{c.title_line2}<br />{c.title_line3}
          </h2>
          <p className="text-foreground/75 leading-relaxed mb-8 max-w-sm">{c.body}</p>
          <Link
            to="/journal"
            className="inline-flex items-center bg-terracotta text-gold-foreground uppercase tracking-[0.25em] text-[11px] px-7 py-4 hover:bg-terracotta/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            {c.cta_label}
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {list.map((p) => (
            <article key={p.slug} className="group">
              <Link to="/journal/$slug" params={{ slug: p.slug }} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                <div className="overflow-hidden mb-4 aspect-[4/3]">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-cream" />
                  )}
                </div>
                <h3 className="font-serif text-xl text-foreground mb-3 leading-snug group-hover:text-gold transition-colors">{p.title}</h3>
                <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-foreground/80">
                  Read More <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
