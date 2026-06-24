import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { ShareButtons } from "@/components/site/ShareButtons";
import { getLodges } from "@/lib/cms.functions";
import { MapPin, ArrowRight } from "lucide-react";


const lodgesQuery = queryOptions({
  queryKey: ["lodges"],
  queryFn: () => getLodges(),
});

export const Route = createFileRoute("/lodges")({
  loader: ({ context }) => context.queryClient.ensureQueryData(lodgesQuery),
  head: () => ({
    meta: [
      { title: "Partner Lodges — The Baobab Collective" },
      { name: "description", content: "Hand-picked luxury safari lodges across Africa — each chosen for its setting, soul and ethics." },
      { property: "og:title", content: "Partner Lodges — The Baobab Collective" },
      { property: "og:description", content: "Hand-picked luxury safari lodges across Africa." },
    ],
  }),
  errorComponent: ({ error }) => <div className="p-10 text-center">{error.message}</div>,
  notFoundComponent: () => <div className="p-10 text-center">Not found</div>,
  component: LodgesPage,
});

function LodgesPage() {
  const { data: lodges } = useSuspenseQuery(lodgesQuery);

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main>
        <section className="bg-forest text-forest-foreground py-24 text-center px-6">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">Where you'll stay</p>
          <h1 className="font-serif text-5xl md:text-6xl mb-5">Partner Lodges</h1>
          <p className="max-w-2xl mx-auto text-forest-foreground/80">
            Every camp and lodge we work with has been walked, slept in, and chosen for soul as much as setting.
          </p>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-10">
            {lodges.map((l) => (
              <article key={l.id} className="bg-cream group">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={l.hero_image} alt={l.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-gold mb-3">
                    <MapPin className="w-3 h-3" /> {l.location}
                  </div>
                  <h2 className="font-serif text-3xl text-foreground mb-3">{l.name}</h2>
                  <p className="text-foreground/75 leading-relaxed mb-5 line-clamp-3">{l.description}</p>
                  {l.amenities?.length ? (
                    <ul className="flex flex-wrap gap-2 mb-6">
                      {l.amenities.slice(0, 4).map((a) => (
                        <li key={a} className="text-[11px] tracking-wider uppercase border border-border px-3 py-1 text-foreground/70">{a}</li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    {l.price_from_usd ? (
                      <p className="text-sm text-foreground/70">
                        <span className="text-foreground font-medium">${l.price_from_usd.toLocaleString()}</span> / night
                      </p>
                    ) : <span />}
                    <Link
                      to="/contact"
                      search={{ subject: `Enquiry about ${l.name}` } as any}
                      className="inline-flex items-center gap-2 border border-gold text-gold uppercase tracking-[0.25em] text-[11px] px-5 py-2.5 hover:bg-gold hover:text-gold-foreground"
                    >
                      Enquire <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="mt-5 pt-5 border-t border-border/40">
                    <ShareButtons
                      title={`${l.name} — ${l.location}`}
                      description={l.description?.slice(0, 140)}
                      label="Share lodge"
                    />
                  </div>

                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
