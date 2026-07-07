import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { EnquireDialog } from "@/components/site/EnquireDialog";
import { getTestimonials } from "@/lib/cms.functions";
import { getPageContent } from "@/lib/page-content.functions";
import { PAGE_DEFAULTS } from "@/lib/page-content.defaults";
import { usePreviewMerge } from "@/lib/preview-overrides";
import { Star, Quote } from "lucide-react";

const q = queryOptions({ queryKey: ["testimonials"], queryFn: () => getTestimonials() });

export const Route = createFileRoute("/testimonials")({
  loader: async ({ context }) => {
    const [items, page] = await Promise.all([
      context.queryClient.ensureQueryData(q),
      getPageContent({ data: { key: "testimonials_page" } }).catch(() => null),
    ]);
    return { items, page };
  },
  head: () => ({
    meta: [
      { title: "Guest Stories — The Baobab Collective" },
      { name: "description", content: "Hear from travellers who have journeyed with The Baobab Collective." },
    ],
  }),
  errorComponent: ({ error }) => <div className="p-10 text-center">{error.message}</div>,
  notFoundComponent: () => <div className="p-10 text-center">Not found</div>,
  component: TestimonialsPage,
});

function TestimonialsPage() {
  const { data: items } = useSuspenseQuery(q);
  const { page } = Route.useLoaderData();
  const base = { ...PAGE_DEFAULTS.testimonials_page, ...(page ?? {}) };
  const c: any = usePreviewMerge("testimonials_page", base);

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main>
        <section className="bg-cream py-20 text-center px-6">
          <p className="text-[11px] tracking-[0.3em] uppercase text-terracotta mb-4">{c.eyebrow}</p>
          <h1 className="font-serif text-5xl md:text-6xl mb-5">{c.title}</h1>
          <p className="max-w-2xl mx-auto text-foreground/75">{c.subtitle}</p>
        </section>

        {c.show_metrics && (
          <section className="py-12 border-y border-border/40 bg-background">
            <div className="max-w-5xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="font-serif text-4xl text-gold">{c.metric_1_value}</p>
                <p className="text-[11px] tracking-[0.2em] uppercase text-foreground/60 mt-1">{c.metric_1_label}</p>
              </div>
              <div>
                <p className="font-serif text-4xl text-gold">{c.metric_2_value}</p>
                <p className="text-[11px] tracking-[0.2em] uppercase text-foreground/60 mt-1">{c.metric_2_label}</p>
              </div>
              <div>
                <p className="font-serif text-4xl text-gold">{c.metric_3_value}</p>
                <p className="text-[11px] tracking-[0.2em] uppercase text-foreground/60 mt-1">{c.metric_3_label}</p>
              </div>
            </div>
          </section>
        )}

        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8">
            {items.map((t) => (
              <article key={t.id} className="bg-cream p-8 relative">
                <Quote className="w-8 h-8 text-gold/40 mb-4" />
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="font-serif text-xl leading-relaxed text-foreground mb-6">"{t.quote}"</p>
                <div>
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  {t.location && <p className="text-[11px] tracking-[0.15em] uppercase text-foreground/60">{t.location}</p>}
                  {t.trip_taken && <p className="text-[11px] tracking-[0.15em] uppercase text-gold mt-2">{t.trip_taken}</p>}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-forest text-forest-foreground py-16 text-center">
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="font-serif text-3xl mb-4">{c.cta_title}</h2>
            <EnquireDialog
              sourceUrl="/testimonials"
              autosaveKey="enquire:testimonials"
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center bg-gold text-gold-foreground uppercase tracking-[0.25em] text-[12px] px-8 py-3.5 hover:bg-gold/90"
                >
                  {c.cta_button}
                </button>
              }
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
