import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Suspense, useMemo } from "react";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { ShareButtons } from "@/components/site/ShareButtons";
import { FilterBar, type FilterOption } from "@/components/site/FilterBar";
import { CardGridSkeleton } from "@/components/site/CardSkeleton";
import { getLodges } from "@/lib/cms.functions";
import { MapPin, ArrowRight } from "lucide-react";
import { EnquireDialog } from "@/components/site/EnquireDialog";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const lodgesQuery = queryOptions({
  queryKey: ["lodges"],
  queryFn: () => getLodges(),
});

const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  location: z.string().optional().catch(undefined),
  sort: z.enum(["featured", "price-asc", "price-desc", "name-asc"]).optional().catch("featured"),
});

export const Route = createFileRoute("/lodges/")({
  validateSearch: zodValidator(searchSchema),
  loader: ({ context }) => context.queryClient.ensureQueryData(lodgesQuery),
  head: () => ({
    meta: [
      { title: "Partner Lodges — The Baobab Collective" },
      { name: "description", content: "Hand-picked luxury safari lodges across Africa — each chosen for its setting, soul and ethics." },
      { property: "og:title", content: "Partner Lodges — The Baobab Collective" },
      { property: "og:description", content: "Hand-picked luxury safari lodges across Africa." },
    ],
  }),
  errorComponent: ({ error }) => <div className="p-10 text-center" role="alert">{error.message}</div>,
  notFoundComponent: () => <div className="p-10 text-center">Not found</div>,
  component: LodgesPage,
});

const sortOptions: FilterOption[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Name A–Z" },
];

function LodgesPage() {
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

        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-8">
            <Suspense
              fallback={
                <>
                  <div className="bg-background border border-border rounded-xl p-4 md:p-5 h-[110px] animate-pulse" aria-hidden="true" />
                  <CardGridSkeleton count={6} />
                </>
              }
            >
              <LodgesGrid />
            </Suspense>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function LodgesGrid() {
  const { data: lodges } = useSuspenseQuery(lodgesQuery);
  const { formatPrice } = useSiteSettings();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/lodges" });
  const q = search.q ?? "";
  const location = search.location ?? "all";
  const sort = search.sort ?? "featured";

  const locationOptions: FilterOption[] = useMemo(() => {
    const set = new Set<string>();
    lodges.forEach((l) => l.location && set.add(l.location));
    return Array.from(set)
      .sort()
      .map((v) => ({ value: v, label: v }));
  }, [lodges]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = lodges.filter((l) => {
      if (location !== "all" && l.location !== location) return false;
      if (!needle) return true;
      return (
        l.name.toLowerCase().includes(needle) ||
        (l.location ?? "").toLowerCase().includes(needle) ||
        (l.description ?? "").toLowerCase().includes(needle)
      );
    });
    if (sort === "price-asc")
      list = [...list].sort((a, b) => (a.price_from_usd ?? Infinity) - (b.price_from_usd ?? Infinity));
    if (sort === "price-desc")
      list = [...list].sort((a, b) => (b.price_from_usd ?? -Infinity) - (a.price_from_usd ?? -Infinity));
    if (sort === "name-asc") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [lodges, q, location, sort]);

  const hasFilters = q !== "" || location !== "all" || sort !== "featured";
  const setSearch = (patch: Record<string, unknown>) =>
    navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, ...patch }), replace: true });

  return (
    <>
      <FilterBar
        query={q}
        onQueryChange={(v) => setSearch({ q: v || undefined })}
        queryPlaceholder="Search lodges…"
        location={location}
        locationOptions={locationOptions}
        onLocationChange={(v) => setSearch({ location: v === "all" ? undefined : v })}
        sort={sort}
        sortOptions={sortOptions}
        onSortChange={(v) => setSearch({ sort: v === "featured" ? undefined : v })}
        resultCount={filtered.length}
        totalCount={lodges.length}
        hasFilters={hasFilters}
        onReset={() => navigate({ search: {}, replace: true })}
      />

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-foreground/70">
          <p className="font-serif text-2xl mb-2">No lodges match those filters</p>
          <p className="text-sm">Try clearing filters or searching a different term.</p>
        </div>
      ) : (
        <ul
          aria-label="Partner lodges"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 list-none p-0"
        >
          {filtered.map((l) => {
            const titleId = `lodge-${l.id}-title`;
            const descId = `lodge-${l.id}-desc`;
            return (
              <li key={l.id}>
                <article
                  aria-labelledby={titleId}
                  className="group flex flex-col h-full bg-background border border-border rounded-xl overflow-hidden motion-safe:transition-all motion-safe:duration-500 motion-safe:hover:-translate-y-1 hover:shadow-2xl hover:shadow-foreground/10 hover:border-gold/40 focus-within:ring-2 focus-within:ring-gold focus-within:ring-offset-2 focus-within:ring-offset-background"
                >
                  <Link
                    to="/lodges/$slug"
                    params={{ slug: l.slug }}
                    aria-label={`View ${l.name}`}
                    className="relative aspect-[4/3] overflow-hidden block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    <img
                      src={l.hero_image}
                      alt={`${l.name}, ${l.location ?? "lodge"}`}
                      loading="lazy"
                      className="w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-700 ease-out motion-safe:group-hover:scale-110 motion-safe:group-focus-within:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 motion-safe:transition-opacity motion-safe:duration-500 group-hover:opacity-100 group-focus-within:opacity-100" />
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-background/90 backdrop-blur text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 text-foreground rounded-full">
                      <MapPin className="w-3 h-3 text-gold" aria-hidden="true" /> {l.location}
                    </span>
                    {l.price_from_usd ? (
                      <span className="absolute top-4 right-4 bg-gold text-gold-foreground text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 rounded-full font-medium">
                        From {formatPrice(l.price_from_usd)}
                      </span>
                    ) : null}
                  </Link>
                  <div className="p-6 md:p-7 flex flex-col flex-1">
                    <h2
                      id={titleId}
                      className="font-serif text-2xl md:text-3xl text-foreground mb-3 group-hover:text-gold group-focus-within:text-gold transition-colors"
                    >
                      <Link to="/lodges/$slug" params={{ slug: l.slug }} className="focus-visible:outline-none">
                        {l.name}
                      </Link>
                    </h2>
                    <p id={descId} className="text-foreground/70 text-sm leading-relaxed mb-5 line-clamp-3 flex-1">
                      {l.description}
                    </p>
                    {l.amenities?.length ? (
                      <ul aria-label="Amenities" className="flex flex-wrap gap-1.5 mb-5">
                        {l.amenities.slice(0, 4).map((a) => (
                          <li
                            key={a}
                            className="text-[10px] tracking-[0.15em] uppercase border border-border/70 px-2.5 py-1 text-foreground/70 rounded-full"
                          >
                            {a}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3">
                      <p className="text-xs text-foreground/60">
                        {l.price_from_usd ? (
                          <>
                            <span className="text-foreground/90">{formatPrice(l.price_from_usd)}</span> / night
                          </>
                        ) : (
                          "On enquiry"
                        )}
                      </p>
                      <Link
                        to="/lodges/$slug"
                        params={{ slug: l.slug }}
                        aria-label={`View ${l.name}`}
                        className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-foreground hover:text-gold focus-visible:outline-none focus-visible:text-gold transition-colors min-h-11 px-1"
                      >
                        View Lodge{" "}
                        <ArrowRight
                          aria-hidden="true"
                          className="w-4 h-4 motion-safe:transition-transform motion-safe:duration-300 group-hover:translate-x-1"
                        />
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
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
