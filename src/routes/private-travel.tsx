import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { submitPrivateTravelRequest } from "@/lib/private-travel.functions";
import { getPageContent } from "@/lib/page-content.functions";
import { PAGE_DEFAULTS } from "@/lib/page-content.defaults";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";
import { Check } from "lucide-react";

const INTERESTS = [
  "Wildlife & safari",
  "Cultural immersion",
  "Conservation experience",
  "Beach & coast",
  "Adventure & walking",
  "Wellness & slow travel",
  "Photography",
  "Family-friendly",
  "Honeymoon",
  "Multi-generational",
];

export const Route = createFileRoute("/private-travel")({
  loader: async () => {
    const content = await getPageContent({ data: { key: "private_travel" } }).catch(() => null);
    return { content: { ...PAGE_DEFAULTS.private_travel, ...(content ?? {}) } };
  },
  head: () => ({
    meta: [
      { title: "Private Travel — Bespoke Safari Planning | The Baobab Collective" },
      { name: "description", content: "Request a fully bespoke safari itinerary designed entirely around you." },
    ],
  }),
  component: PrivateTravelPage,
});

function PrivateTravelPage() {
  const { content: c } = Route.useLoaderData();
  const submit = useServerFn(submitPrivateTravelRequest);
  const { currencyCode, currencySymbol } = useSiteSettings();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    destinations: "",
    travel_dates: "",
    party_size: 2,
    budget_usd: "",
    interests: [] as string[],
    notes: "",
  });

  const toggle = (i: string) =>
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(i) ? f.interests.filter((x) => x !== i) : [...f.interests, i],
    }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submit({ data: form });
      setDone(true);
      toast.success("Request received — we'll be in touch within 48 hours");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main>
        <section className="bg-forest text-forest-foreground py-24 text-center px-6">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">{c.eyebrow}</p>
          <h1 className="font-serif text-5xl md:text-6xl mb-5">{c.title}</h1>
          <p className="max-w-2xl mx-auto text-forest-foreground/80">
            {c.subtitle}
          </p>
        </section>

        {done ? (
          <section className="py-24 text-center px-6">
            <div className="max-w-lg mx-auto">
              <div className="w-16 h-16 mx-auto rounded-full bg-gold/15 flex items-center justify-center mb-6">
                <Check className="w-7 h-7 text-gold" />
              </div>
              <h2 className="font-serif text-3xl mb-3">{c.success_title}</h2>
              <p className="text-foreground/70 mb-6">
                {c.success_body}
              </p>
            </div>
          </section>
        ) : (
          <section className="py-20">
            <form onSubmit={onSubmit} className="max-w-2xl mx-auto px-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" required value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="party">Party size</Label>
                  <Input id="party" type="number" min={1} max={50} value={form.party_size} onChange={(e) => setForm((f) => ({ ...f, party_size: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label htmlFor="dates">Travel dates</Label>
                  <Input id="dates" placeholder="e.g. Aug 2026, flexible" value={form.travel_dates} onChange={(e) => setForm((f) => ({ ...f, travel_dates: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="budget">Budget per person ({currencyCode})</Label>
                  <Input
                    id="budget"
                    placeholder={`e.g. ${currencySymbol}8,000+`}
                    value={form.budget_usd}
                    onChange={(e) => setForm((f) => ({ ...f, budget_usd: e.target.value }))}
                  />
                </div>
              </div>

              {/* "Dream destinations" field removed per spec */}

              <div>
                <Label className="block mb-3">Your interests</Label>
                <div className="grid grid-cols-2 gap-3">
                  {INTERESTS.map((i) => (
                    <label key={i} className="flex items-center gap-2 cursor-pointer text-sm">
                      <Checkbox checked={form.interests.includes(i)} onCheckedChange={() => toggle(i)} />
                      <span>{i}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Anything else we should know?</Label>
                <Textarea id="notes" rows={5} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>

              <Button type="submit" disabled={loading} size="lg" className="w-full bg-gold text-gold-foreground hover:bg-gold/90 uppercase tracking-[0.25em] text-[12px]">
                {loading ? "Sending…" : c.submit_label}
              </Button>
            </form>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
