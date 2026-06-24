import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { journeys } from "@/lib/content";

export const Route = createFileRoute("/journeys")({
  head: () => ({
    meta: [
      { title: "Our Journeys — The Baobab Collective" },
      { name: "description", content: "Handpicked safari experiences that celebrate adventure, connection, heritage and conservation across Africa." },
      { property: "og:title", content: "Our Journeys — The Baobab Collective" },
      { property: "og:description", content: "Curated safari journeys across Africa." },
      { property: "og:url", content: "/journeys" },
    ],
    links: [{ rel: "canonical", href: "/journeys" }],
  }),
  component: JourneysIndex,
});

function JourneysIndex() {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main>
        <section className="bg-cream py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center">
            <p className="text-[11px] tracking-[0.3em] uppercase text-terracotta mb-5">Curated Safari Journeys</p>
            <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-6 tracking-wider">OUR JOURNEYS</h1>
            <p className="text-foreground/75 max-w-2xl mx-auto">
              Handpicked safari experiences that celebrate adventure, connection, heritage and conservation.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {journeys.map((j) => (
              <Link
                key={j.slug}
                to="/journeys/$slug"
                params={{ slug: j.slug }}
                className="group relative flex flex-col bg-background border border-border rounded-xl overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-foreground/10 hover:border-gold/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={j.heroImage}
                    alt={`${j.title} safari journeys`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="absolute top-4 left-4 bg-background/90 backdrop-blur text-[10px] tracking-[0.25em] uppercase px-3 py-1.5 text-foreground rounded-full">
                    {j.slug}
                  </span>
                </div>
                <div className="p-6 md:p-7 flex flex-col flex-1">
                  <p className="text-[11px] tracking-[0.25em] uppercase text-gold mb-2">{j.tagline}</p>
                  <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-3 group-hover:text-gold transition-colors">{j.title}</h2>
                  <p className="text-foreground/70 text-sm leading-relaxed mb-5 line-clamp-3 flex-1">{j.intro}</p>
                  <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-foreground">
                      Explore Journey
                    </span>
                    <ArrowRight className="w-4 h-4 text-gold transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
