import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { articles } from "@/lib/content";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Journal — The Baobab Collective" },
      { name: "description", content: "Travel inspiration, destination guides and stories from the road less travelled." },
      { property: "og:title", content: "Journal — The Baobab Collective" },
      { property: "og:description", content: "Stories. Guidance. Inspiration." },
      { property: "og:url", content: "/journal" },
    ],
    links: [{ rel: "canonical", href: "/journal" }],
  }),
  component: JournalIndex,
});

function JournalIndex() {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main>
        <section className="bg-cream py-20 md:py-28 text-center">
          <div className="max-w-3xl mx-auto px-6">
            <p className="text-[11px] tracking-[0.3em] uppercase text-terracotta mb-5">Be Inspired</p>
            <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-6 leading-[1.1]">The Journal</h1>
            <p className="text-foreground/75">Stories, guidance and inspiration from the road less travelled.</p>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-10 grid md:grid-cols-3 gap-10">
            {articles.map((a) => (
              <Link
                key={a.slug}
                to="/journal/$slug"
                params={{ slug: a.slug }}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <article>
                  <div className="overflow-hidden aspect-[4/3] mb-5">
                    <img
                      src={a.image}
                      alt={a.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-gold mb-2">{a.category} · {a.readTime}</p>
                  <h2 className="font-serif text-2xl text-foreground mb-3 group-hover:text-gold transition-colors">{a.title}</h2>
                  <p className="text-foreground/70 mb-3">{a.excerpt}</p>
                  <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-foreground">
                    Read More <ArrowRight className="w-3 h-3" />
                  </span>
                </article>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
