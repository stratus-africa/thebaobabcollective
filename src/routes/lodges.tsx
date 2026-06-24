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

        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {lodges.map((l) => (
              <article
                key={l.id}
                className="group flex flex-col bg-background border border-border rounded-xl overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-foreground/10 hover:border-gold/40"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={l.hero_image}
                    alt={l.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-background/90 backdrop-blur text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 text-foreground rounded-full">
                    <MapPin className="w-3 h-3 text-gold" /> {l.location}
                  </span>
                  {l.price_from_usd ? (
                    <span className="absolute top-4 right-4 bg-gold text-gold-foreground text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 rounded-full font-medium">
                      From ${l.price_from_usd.toLocaleString()}
                    </span>
                  ) : null}
                </div>
                <div className="p-6 md:p-7 flex flex-col flex-1">
                  <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-3 group-hover:text-gold transition-colors">{l.name}</h2>
                  <p className="text-foreground/70 text-sm leading-relaxed mb-5 line-clamp-3 flex-1">{l.description}</p>
                  {l.amenities?.length ? (
                    <ul className="flex flex-wrap gap-1.5 mb-5">
                      {l.amenities.slice(0, 4).map((a) => (
                        <li key={a} className="text-[10px] tracking-[0.15em] uppercase border border-border/70 px-2.5 py-1 text-foreground/70 rounded-full">{a}</li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3">
                    <p className="text-xs text-foreground/60">
                      {l.price_from_usd ? <><span className="text-foreground/90">${l.price_from_usd.toLocaleString()}</span> / night</> : "On enquiry"}
                    </p>
                    <Link
                      to="/contact"
                      search={{ subject: `Enquiry about ${l.name}` } as any}
                      className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-foreground group-hover:text-gold transition-colors"
                    >
                      Enquire <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/40">
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
