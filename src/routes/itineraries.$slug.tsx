import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { ArrowRight, Check, Calendar, MapPin, Users, Sparkles, Loader2 } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getItineraryBySlug } from "@/lib/cms.functions";
import { submitEnquiry } from "@/lib/submissions.functions";

const itinerarySearchSchema = z.object({
  itinerary: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/itineraries/$slug")({
  validateSearch: zodValidator(itinerarySearchSchema),
  loader: async ({ params }) => {
    const itinerary = await getItineraryBySlug({ data: { slug: params.slug } });
    if (!itinerary) throw notFound();
    return { itinerary };
  },
  head: ({ loaderData }) => {
    const it = loaderData?.itinerary;
    const title = it ? `${it.name} — The Baobab Collective` : "Itinerary";
    const desc = it?.description ?? "A curated safari itinerary";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        ...(it?.image ? [{ property: "og:image", content: it.image }] : []),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-32 text-center">
        <h1 className="font-serif text-4xl mb-4">Itinerary not found</h1>
        <Link to="/journeys" className="text-gold underline">Browse all journeys</Link>
      </main>
      <Footer />
    </div>
  ),
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="bg-background min-h-screen">
        <Navbar />
        <main className="max-w-3xl mx-auto px-6 py-32 text-center">
          <h1 className="font-serif text-3xl mb-4">Something went wrong</h1>
          <p className="text-foreground/70 mb-6">{error.message}</p>
          <button
            onClick={() => { reset(); router.invalidate(); }}
            className="bg-gold text-gold-foreground px-6 py-3 uppercase tracking-[0.25em] text-[11px]"
          >Retry</button>
        </main>
        <Footer />
      </div>
    );
  },
  component: ItineraryPage,
});

function ItineraryPage() {
  const { itinerary } = Route.useLoaderData();
  const { itinerary: prefillFromQuery } = Route.useSearch();
  const cat = (itinerary as any).category;
  const enquiryName = prefillFromQuery || itinerary.name;

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative h-[70vh] min-h-[480px] flex items-end">
          <img src={itinerary.image} alt={itinerary.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pb-16 text-background w-full">
            {cat && (
              <Link
                to="/journeys/$slug"
                params={{ slug: cat.slug }}
                className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4 inline-block hover:underline"
              >
                ← {cat.title}
              </Link>
            )}
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] mb-4 max-w-3xl">{itinerary.name}</h1>
            <div className="flex flex-wrap gap-6 text-sm text-background/90">
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gold" /> {itinerary.nights}</span>
              {itinerary.price_from_usd && (
                <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-gold" /> From ${Number(itinerary.price_from_usd).toLocaleString()} pp</span>
              )}
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-gold" /> Private guided</span>
            </div>
          </div>
        </section>

        {/* Overview + Sidebar */}
        <section className="py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-10">
              <div>
                <p className="text-[11px] tracking-[0.3em] uppercase text-terracotta mb-4">Overview</p>
                <p className="font-serif text-2xl md:text-3xl text-foreground leading-relaxed mb-6">{itinerary.description}</p>
              </div>

              <div>
                <h2 className="font-serif text-3xl text-foreground mb-6">Journey Highlights</h2>
                <ul className="grid sm:grid-cols-2 gap-4">
                  {itinerary.highlights.map((h: string) => (
                    <li key={h} className="flex gap-3 text-foreground/80 bg-cream p-4">
                      <Check className="w-5 h-5 text-gold mt-0.5 shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="font-serif text-3xl text-foreground mb-6">A Sample Rhythm</h2>
                <div className="space-y-6">
                  {itinerary.highlights.slice(0, 4).map((h: string, i: number) => (
                    <div key={h} className="flex gap-5 border-l-2 border-gold pl-6">
                      <div className="shrink-0">
                        <p className="text-[10px] tracking-[0.3em] uppercase text-gold">Phase</p>
                        <p className="font-serif text-3xl text-foreground">{String(i + 1).padStart(2, "0")}</p>
                      </div>
                      <div>
                        <h3 className="font-serif text-xl text-foreground mb-2">{h}</h3>
                        <p className="text-foreground/70 text-sm leading-relaxed">
                          Days of immersive guiding, intimate camps and conservation-led experiences crafted around this chapter of your journey.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-forest text-forest-foreground p-8 md:p-10">
                <h2 className="font-serif text-2xl mb-5">What's Included</h2>
                <ul className="grid sm:grid-cols-2 gap-3 text-sm text-forest-foreground/90">
                  {[
                    "All accommodation in hand-picked lodges & camps",
                    "Private expert guide throughout",
                    "All meals, drinks & park fees",
                    "Internal light-aircraft transfers",
                    "24/7 on-trip concierge",
                    "Conservation contribution",
                  ].map((x) => (
                    <li key={x} className="flex gap-2"><Check className="w-4 h-4 text-gold mt-0.5 shrink-0" /> {x}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24 self-start space-y-6">
              <div className="bg-cream p-8">
                <p className="text-[11px] tracking-[0.3em] uppercase text-terracotta mb-3">Reserve Your Journey</p>
                <p className="font-serif text-3xl text-foreground mb-1">
                  {itinerary.price_from_usd ? `$${Number(itinerary.price_from_usd).toLocaleString()}` : "On request"}
                </p>
                <p className="text-xs text-foreground/60 mb-6">per person, twin share · {itinerary.nights}</p>
                <Link
                  to="/book/$slug"
                  params={{ slug: itinerary.slug }}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gold text-gold-foreground uppercase tracking-[0.25em] text-[11px] px-6 py-4 hover:bg-gold/90 mb-3"
                >
                  Book This Journey <ArrowRight className="w-3 h-3" />
                </Link>
                <a
                  href="#enquire"
                  className="w-full inline-flex items-center justify-center gap-2 border border-gold text-gold uppercase tracking-[0.25em] text-[11px] px-6 py-4 hover:bg-gold hover:text-gold-foreground transition-colors"
                >
                  Enquire First
                </a>
                <p className="text-[11px] text-foreground/60 mt-4 text-center">
                  Deposit ${Number(itinerary.deposit_usd).toLocaleString()} secures your dates
                </p>
              </div>
              <div className="border border-foreground/10 p-6 text-sm text-foreground/70">
                <p className="flex items-start gap-2"><MapPin className="w-4 h-4 text-gold mt-0.5" />
                  Every itinerary is fully bespoke — adapt the route, lodges and pace to your travel style.
                </p>
              </div>
            </aside>
          </div>
        </section>

        {/* Enquire Form */}
        <section id="enquire" className="bg-cream py-20 md:py-24 scroll-mt-24">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-10">
              <p className="text-[11px] tracking-[0.3em] uppercase text-terracotta mb-4">Enquire</p>
              <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">Speak with a Journey Designer</h2>
              <p className="text-foreground/70">
                Share a few details about your dream {enquiryName} experience — we'll respond within 24 hours.
              </p>
            </div>
            <EnquireForm itineraryName={enquiryName} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function EnquireForm({ itineraryName }: { itineraryName: string }) {
  const submit = useServerFn(submitEnquiry);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await submit({
        data: {
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          phone: String(fd.get("phone") ?? ""),
          destination: itineraryName,
          message: String(fd.get("message") ?? ""),
        },
      });
      toast.success("Enquiry sent — we'll be in touch shortly.");
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      toast.error(err?.message ?? "Could not submit enquiry.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-background p-8 md:p-10 space-y-5 shadow-sm">
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" required className="mt-2" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required className="mt-2" />
        </div>
      </div>
      <div>
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input id="phone" name="phone" className="mt-2" />
      </div>
      <div>
        <Label htmlFor="message">Tell us about your dream journey</Label>
        <Textarea id="message" name="message" rows={5} required className="mt-2"
          placeholder={`Travel dates, group size, special requests for ${itineraryName}...`} />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 bg-gold text-gold-foreground uppercase tracking-[0.25em] text-[11px] px-8 py-4 hover:bg-gold/90 disabled:opacity-60"
      >
        {loading ? <><Loader2 className="w-3 h-3 animate-spin" /> Sending</> : <>Send Enquiry <ArrowRight className="w-3 h-3" /></>}
      </button>
    </form>
  );
}
