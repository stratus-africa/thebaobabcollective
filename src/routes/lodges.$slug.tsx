import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowRight, MapPin, Check } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { ShareButtons } from "@/components/site/ShareButtons";
import { EnquireDialog } from "@/components/site/EnquireDialog";
import { getLodgeBySlug, getLodges } from "@/lib/cms.functions";

const lodgeQuery = (slug: string) =>
  queryOptions({
    queryKey: ["lodge", slug],
    queryFn: () => getLodgeBySlug({ data: { slug } }),
  });

const allLodgesQuery = queryOptions({
  queryKey: ["lodges"],
  queryFn: () => getLodges(),
});

export const Route = createFileRoute("/lodges/$slug")({
  loader: async ({ params, context }) => {
    const l = await context.queryClient.ensureQueryData(lodgeQuery(params.slug));
    if (!l) throw notFound();
    await context.queryClient.ensureQueryData(allLodgesQuery);
    return { lodge: l };
  },
  head: ({ loaderData }) => {
    const l = loaderData?.lodge;
    const title = l ? `${l.name}, ${l.location} — The Baobab Collective` : "Lodge";
    const desc = l?.description?.slice(0, 160) ?? "A handpicked safari lodge.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        ...(l?.hero_image ? [{ property: "og:image", content: l.hero_image }] : []),
        ...(l ? [{ property: "og:url", content: `/lodges/${l.slug}` }] : []),
      ],
      links: l ? [{ rel: "canonical", href: `/lodges/${l.slug}` }] : [],
    };
  },
  notFoundComponent: () => (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-32 text-center">
        <h1 className="font-serif text-4xl mb-4">Lodge not found</h1>
        <Link to="/lodges" className="text-gold underline">Back to all lodges</Link>
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
  component: LodgePage,
});

function LodgePage() {
  const { slug } = Route.useParams();
  const { data: l } = useSuspenseQuery(lodgeQuery(slug));
  const { data: all } = useSuspenseQuery(allLodgesQuery);
  if (!l) return null;
  const others = (all ?? []).filter((x: any) => x.slug !== l.slug).slice(0, 3);

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main>
        <section className="relative h-[60vh] min-h-[420px] flex items-end">
          {l.hero_image && (
            <img src={l.hero_image} alt={l.name} className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pb-14 text-background w-full flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3 inline-flex items-center gap-2">
                <MapPin className="w-3 h-3" /> {l.location}
              </p>
              <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] mb-4">{l.name}</h1>
              {l.price_from_usd ? (
                <p className="text-sm md:text-base text-background/85">
                  From <span className="text-gold">${l.price_from_usd.toLocaleString()}</span> / night
                </p>
              ) : (
                <p className="text-sm md:text-base text-background/85">Rates on enquiry</p>
              )}
            </div>
            <ShareButtons
              title={`${l.name}, ${l.location} — The Baobab Collective`}
              description={l.description?.slice(0, 140)}
              label="Share"
            />
          </div>
        </section>

        <section className="py-20 md:py-24 bg-cream">
          <div className="max-w-3xl mx-auto px-6 lg:px-10">
            <p className="text-[11px] tracking-[0.3em] uppercase text-terracotta mb-5">About this lodge</p>
            <p className="font-serif text-2xl md:text-3xl text-foreground leading-relaxed whitespace-pre-line">
              {l.description}
            </p>
          </div>
        </section>

        {l.amenities?.length ? (
          <section className="py-16 md:py-20">
            <div className="max-w-5xl mx-auto px-6 lg:px-10">
              <h2 className="font-serif text-3xl text-foreground mb-8 text-center">Amenities</h2>
              <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-3xl mx-auto">
                {l.amenities.map((a: string) => (
                  <li key={a} className="flex items-start gap-3 text-foreground/80">
                    <Check className="w-4 h-4 text-gold mt-1 shrink-0" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {l.gallery?.length ? (
          <section className="pb-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
              <h2 className="font-serif text-3xl text-foreground mb-8 text-center">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {l.gallery.map((src: string, i: number) => (
                  <div key={`${src}-${i}`} className="aspect-[4/3] overflow-hidden">
                    <img
                      src={src}
                      alt={`${l.name} — image ${i + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="bg-forest text-forest-foreground py-20 text-center">
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="font-serif text-4xl mb-5">Stay at {l.name}</h2>
            <p className="text-forest-foreground/80 mb-8">
              Tell us your dates and travel style — we'll weave {l.name} into a bespoke itinerary.
            </p>
            <EnquireDialog
              defaultSubject={`Enquiry about ${l.name}`}
              defaultDestination={l.location}
              sourceUrl={`/lodges/${l.slug}`}
              autosaveKey={`enquire:lodge:${l.slug}`}
              context={{
                kind: "Lodge",
                title: `${l.name}, ${l.location}`,
                slug: l.slug,
                image: l.hero_image ?? undefined,
              }}
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center gap-2 bg-gold text-gold-foreground uppercase tracking-[0.25em] text-[12px] px-8 py-4 hover:bg-gold/90 transition-colors"
                >
                  Enquire <ArrowRight className="w-3 h-3" />
                </button>
              }
            />
          </div>
        </section>

        {others.length > 0 && (
          <section className="py-20 bg-cream">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
              <h2 className="font-serif text-3xl text-foreground mb-10 text-center">Other Lodges</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {others.map((o: any) => (
                  <Link
                    key={o.slug}
                    to="/lodges/$slug"
                    params={{ slug: o.slug }}
                    className="group block"
                  >
                    <div className="overflow-hidden aspect-[4/3] mb-4">
                      <img
                        src={o.hero_image}
                        alt={o.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <h3 className="font-serif text-2xl text-foreground mb-1 group-hover:text-gold transition-colors">
                      {o.name}
                    </h3>
                    <p className="text-sm text-foreground/70">{o.location}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
