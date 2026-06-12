import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { getFaqs } from "@/lib/cms.functions";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const q = queryOptions({ queryKey: ["faqs"], queryFn: () => getFaqs() });

const labels: Record<string, string> = {
  planning: "Planning your journey",
  conservation: "Conservation & ethics",
  logistics: "Logistics & support",
};

export const Route = createFileRoute("/faq")({
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  head: () => ({
    meta: [
      { title: "FAQ — The Baobab Collective" },
      { name: "description", content: "Answers on planning, conservation and logistics for your safari journey." },
    ],
  }),
  errorComponent: ({ error }) => <div className="p-10 text-center">{error.message}</div>,
  notFoundComponent: () => <div className="p-10 text-center">Not found</div>,
  component: FaqPage,
});

function FaqPage() {
  const { data: all } = useSuspenseQuery(q);
  const [search, setSearch] = useState("");
  const filter = (cat: string) =>
    all.filter(
      (f) =>
        f.category === cat &&
        (!search ||
          f.question.toLowerCase().includes(search.toLowerCase()) ||
          f.answer.toLowerCase().includes(search.toLowerCase())),
    );

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main>
        <section className="bg-cream py-20 text-center px-6">
          <p className="text-[11px] tracking-[0.3em] uppercase text-terracotta mb-4">Frequently Asked</p>
          <h1 className="font-serif text-5xl md:text-6xl mb-5">Questions, answered.</h1>
          <p className="max-w-2xl mx-auto text-foreground/75">
            Everything you need to know to plan with confidence.
          </p>
          <div className="max-w-md mx-auto mt-8 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search questions…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6 space-y-12">
            {(["planning", "conservation", "logistics"] as const).map((cat) => {
              const items = filter(cat);
              if (items.length === 0) return null;
              return (
                <div key={cat}>
                  <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-6">{labels[cat]}</h2>
                  <Accordion type="single" collapsible className="border-t border-border">
                    {items.map((f) => (
                      <AccordionItem key={f.id} value={f.id} className="border-b border-border">
                        <AccordionTrigger className="text-left font-serif text-lg">{f.question}</AccordionTrigger>
                        <AccordionContent className="text-foreground/75 leading-relaxed">{f.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              );
            })}
            {all.filter((f) => f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase())).length === 0 && (
              <p className="text-center text-foreground/60 py-20">No questions match your search.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
