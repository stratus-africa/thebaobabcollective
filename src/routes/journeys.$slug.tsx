import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { getJourney, journeys, type Itinerary } from "@/lib/content";

export const Route = createFileRoute("/journeys/$slug")({
  loader: ({ params }) => {
    const journey = getJourney(params.slug);
    if (!journey) throw notFound();
    return { journey };
  },
  head: ({ loaderData }) => {
    const j = loaderData?.journey;
    const title = j ? `${j.title} Journeys — The Baobab Collective` : "Journey";
    const desc = j?.intro ?? "Curated safari journey";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: j ? `/journeys/${j.slug}` : "/journeys" },
      ],
      links: j ? [{ rel: "canonical", href: `/journeys/${j.slug}` }] : [],
    };
  },
  notFoundComponent: () => (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-32 text-center">
        <h1 className="font-serif text-4xl mb-4">Journey not found</h1>
        <Link to="/journeys" className="text-gold underline">Back to all journeys</Link>
      </main>
      <Footer />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-32 text-center">
        <h1 className="font-serif text-3xl mb-4">Something went wrong</h1>
        <p className="text-foreground/70">{error.message}</p>
      </main>
      <Footer />
    </div>
  ),
  component: JourneyPage,
});

function JourneyPage() {
  const { journey } = Route.useLoaderData();
  const others = journeys.filter((j) => j.slug !== journey.slug);

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main>
        <section className="relative h-[60vh] min-h-[420px] flex items-end">
          <img
            src={journey.heroImage}
            alt={`${journey.title} — ${journey.tagline}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pb-16 text-background">
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">Our Journeys</p>
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] mb-4">{journey.title}</h1>
            <p className="text-lg md:text-xl text-background/90 max-w-xl">{journey.tagline}</p>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-cream">
          <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
            <p className="text-[11px] tracking-[0.3em] uppercase text-terracotta mb-5">The Journey</p>
            <p className="font-serif text-2xl md:text-3xl text-foreground leading-relaxed">{journey.intro}</p>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-12 text-center">
              Featured Itineraries
            </h2>
            <div className="space-y-16">
              {(journey.itineraries as Itinerary[]).map((it: Itinerary, idx: number) => (
                <article
                  key={it.name}
                  className={`grid md:grid-cols-2 gap-10 items-center ${idx % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""}`}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={it.image} alt={it.name} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[11px] tracking-[0.25em] uppercase text-gold mb-2">{it.nights}</p>
                    <h3 className="font-serif text-3xl text-foreground mb-4">{it.name}</h3>
                    <p className="text-foreground/75 mb-6 leading-relaxed">{it.description}</p>
                    <ul className="space-y-2 mb-8">
                      {it.highlights.map((h: string) => (
                        <li key={h} className="flex gap-3 text-foreground/80">
                          <Check className="w-4 h-4 text-gold mt-1 shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-2 border border-gold text-gold uppercase tracking-[0.25em] text-[11px] px-6 py-3 hover:bg-gold hover:text-gold-foreground transition-colors"
                    >
                      Enquire <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-forest text-forest-foreground py-20 text-center">
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="font-serif text-4xl mb-5">Begin your {journey.title.toLowerCase()} journey</h2>
            <p className="text-forest-foreground/80 mb-8">
              Every journey we craft is bespoke. Tell us your dates, dreams and travel style — we'll do the rest.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-gold text-gold-foreground uppercase tracking-[0.25em] text-[12px] px-8 py-4 hover:bg-gold/90 transition-colors"
            >
              Start Planning <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </section>

        <section className="py-20 bg-cream">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <h2 className="font-serif text-3xl text-foreground mb-10 text-center">Other Journeys</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {others.map((o) => (
                <Link
                  key={o.slug}
                  to="/journeys/$slug"
                  params={{ slug: o.slug }}
                  className="group block"
                >
                  <div className="overflow-hidden aspect-[4/3] mb-4">
                    <img src={o.heroImage} alt={o.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <h3 className="font-serif text-2xl text-foreground mb-1">{o.title}</h3>
                  <p className="text-sm text-foreground/70">{o.tagline}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
