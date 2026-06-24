import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowRight, MapPin, Check } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { EnquireDialog } from "@/components/site/EnquireDialog";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ShareButtons } from "@/components/site/ShareButtons";
import { getAdventuresPage } from "@/lib/adventures.functions";

const adventuresQuery = queryOptions({
  queryKey: ["adventures-page"],
  queryFn: () => getAdventuresPage(),
});

export const Route = createFileRoute("/adventures/$slug")({
  loader: async ({ params, context }) => {
    const page = await context.queryClient.ensureQueryData(adventuresQuery);
    const adv = page.signatures.find((s) => s.slug === params.slug);
    if (!adv) throw notFound();
    return { adv };
  },
  head: ({ loaderData, params }) => {
    const a = loaderData?.adv;
    const title = a ? `${a.name} — The Baobab Collective` : "Adventure";
    const desc = a?.description?.slice(0, 160) ?? "A signature African adventure.";
    const url = `https://thebaobabcollective.co.uk/adventures/${params.slug}`;
    const ldTrip = a
      ? {
          "@context": "https://schema.org",
          "@type": "TouristTrip",
          name: a.name,
          description: a.description,
          image: a.image,
          touristType: a.difficulty,
          url,
        }
      : null;
    const ldCrumbs = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://thebaobabcollective.co.uk/" },
        { "@type": "ListItem", position: 2, name: "Adventures", item: "https://thebaobabcollective.co.uk/adventures" },
        { "@type": "ListItem", position: 3, name: a?.name ?? params.slug, item: url },
      ],
    };
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        ...(a?.image ? [{ property: "og:image", content: a.image }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        ...(a?.image ? [{ name: "twitter:image", content: a.image }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        ...(ldTrip ? [{ type: "application/ld+json", children: JSON.stringify(ldTrip) }] : []),
        { type: "application/ld+json", children: JSON.stringify(ldCrumbs) },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="bg-background min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <h1 className="font-serif text-4xl mb-4">Adventure not found</h1>
        <Link to="/adventures" className="text-gold underline">Browse all adventures</Link>
      </div>
      <Footer />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="bg-background min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <h1 className="font-serif text-3xl mb-4">Something went wrong</h1>
        <p className="text-foreground/70">{error.message}</p>
      </div>
      <Footer />
    </div>
  ),
  component: AdventureDetail,
});

function AdventureDetail() {
  const { slug } = Route.useParams();
  const { data: page } = useSuspenseQuery(adventuresQuery);
  const a = page.signatures.find((s) => s.slug === slug)!;
  const url = typeof window !== "undefined" ? window.location.href : `https://thebaobabcollective.co.uk/adventures/${slug}`;

  return (
    <div className="bg-background">
      <Navbar />

      <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
        <img src={a.image} alt={a.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 lg:px-10 pb-10 max-w-7xl mx-auto text-white">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-2 flex items-center gap-2">
            <MapPin className="w-3 h-3" /> {a.region}
          </p>
          <h1 className="font-serif text-4xl md:text-6xl mb-3">{a.name}</h1>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] tracking-[0.25em] uppercase text-white/80">
            <span>{a.nights}</span>
            <span>{a.terrain}</span>
            <span>{a.difficulty}</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-6">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Adventures", to: "/adventures" },
            { label: a.name },
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 lg:px-10 py-16">
        <p className="text-lg text-foreground/80 leading-relaxed mb-10">{a.description}</p>

        {a.highlights?.length > 0 && (
          <>
            <h2 className="font-serif text-2xl mb-5">Highlights</h2>
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3 mb-12">
              {a.highlights.map((h) => (
                <li key={h} className="flex gap-3 text-foreground/80">
                  <Check className="w-4 h-4 text-gold mt-1 shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="flex flex-wrap gap-3 items-center">
          <EnquireDialog
            defaultSubject={a.name}
            sourceUrl={url}
            context={{ kind: "adventure", name: a.name, slug: a.slug }}
            trigger={
              <button className="inline-flex items-center gap-2 bg-gold text-gold-foreground uppercase tracking-[0.25em] text-[11px] px-6 py-3 hover:bg-gold/90">
                Enquire about this adventure <ArrowRight className="w-3 h-3" />
              </button>
            }
          />
          <ShareButtons title={a.name} url={url} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
