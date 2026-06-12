import { ArrowRight } from "lucide-react";
import a from "@/assets/journal-baobab.jpg";
import b from "@/assets/journal-lion.jpg";
import c from "@/assets/journal-lodge.jpg";

const posts = [
  { img: a, title: "Where to go for your first safari" },
  { img: b, title: "The magic of slow travel in Africa" },
  { img: c, title: "Why responsible travel matters" },
];

export function Journal() {
  return (
    <section className="bg-sand/40 py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-16">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-terracotta mb-5">Be Inspired</p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground leading-[1.1] mb-6">
            Stories.<br />Guidance.<br />Inspiration.
          </h2>
          <p className="text-foreground/75 leading-relaxed mb-8 max-w-sm">
            Discover travel tips, destination guides and stories from the road less travelled.
          </p>
          <a
            href="#"
            className="inline-flex items-center bg-terracotta text-gold-foreground uppercase tracking-[0.25em] text-[11px] px-7 py-4 hover:bg-terracotta/90 transition-colors"
          >
            Explore Our Journal
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {posts.map((p) => (
            <article key={p.title} className="group">
              <div className="overflow-hidden mb-4 aspect-[4/3]">
                <img
                  src={p.img}
                  alt={p.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <h3 className="font-serif text-xl text-foreground mb-3 leading-snug">{p.title}</h3>
              <a
                href="#"
                className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-foreground/80 hover:text-gold transition-colors"
              >
                Read More <ArrowRight className="w-3 h-3" />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
