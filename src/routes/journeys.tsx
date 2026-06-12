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

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-10">
            {journeys.map((j) => (
              <Link
                key={j.slug}
                to="/journeys/$slug"
                params={{ slug: j.slug }}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <div className="overflow-hidden aspect-[4/3] mb-5">
                  <img
                    src={j.heroImage}
                    alt={`${j.title} safari journeys`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <p className="text-[11px] tracking-[0.25em] uppercase text-gold mb-2">{j.tagline}</p>
                <h2 className="font-serif text-3xl text-foreground mb-3">{j.title}</h2>
                <p className="text-foreground/70 mb-4 line-clamp-2">{j.intro}</p>
                <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-foreground group-hover:text-gold">
                  Explore <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
