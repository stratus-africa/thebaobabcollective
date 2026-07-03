import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { articles } from "@/lib/content";

export function Journal() {
  return (
    <section className="bg-sand/40 py-20 md:py-28">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-16">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-terracotta mb-5">Be Inspired</p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground leading-[1.1] mb-6">
            Stories.<br />Guidance.<br />Inspiration.
          </h2>
          <p className="text-foreground/75 leading-relaxed mb-8 max-w-sm">
            Discover travel tips, destination guides and stories from the road less travelled.
          </p>
          <Link
            to="/journal"
            className="inline-flex items-center bg-terracotta text-gold-foreground uppercase tracking-[0.25em] text-[11px] px-7 py-4 hover:bg-terracotta/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            Explore Our Journal
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {articles.map((p) => (
            <article key={p.slug} className="group">
              <Link to="/journal/$slug" params={{ slug: p.slug }} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                <div className="overflow-hidden mb-4 aspect-[4/3]">
                  <img
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
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
