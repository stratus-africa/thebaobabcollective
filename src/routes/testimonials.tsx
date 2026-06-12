import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { getTestimonials } from "@/lib/cms.functions";
import { Star, Quote } from "lucide-react";

const q = queryOptions({ queryKey: ["testimonials"], queryFn: () => getTestimonials() });

export const Route = createFileRoute("/testimonials")({
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
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

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main>
        <section className="bg-cream py-20 text-center px-6">
          <p className="text-[11px] tracking-[0.3em] uppercase text-terracotta mb-4">Guest Stories</p>
          <h1 className="font-serif text-5xl md:text-6xl mb-5">In their words</h1>
          <p className="max-w-2xl mx-auto text-foreground/75">
            The clearest measure of a journey is how it stays with you afterwards.
          </p>
        </section>

        <section className="py-12 border-y border-border/40 bg-background">
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
            <div><p className="font-serif text-4xl text-gold">12+</p><p className="text-[11px] tracking-[0.2em] uppercase text-foreground/60 mt-1">Years of journeys</p></div>
            <div><p className="font-serif text-4xl text-gold">800+</p><p className="text-[11px] tracking-[0.2em] uppercase text-foreground/60 mt-1">Travellers hosted</p></div>
            <div><p className="font-serif text-4xl text-gold">40+</p><p className="text-[11px] tracking-[0.2em] uppercase text-foreground/60 mt-1">Lodge partners</p></div>
          </div>
        </section>

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
            <h2 className="font-serif text-3xl mb-4">Let your story begin here</h2>
            <Link to="/contact" className="inline-flex items-center bg-gold text-gold-foreground uppercase tracking-[0.25em] text-[12px] px-8 py-3.5 hover:bg-gold/90">
              Start planning
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
