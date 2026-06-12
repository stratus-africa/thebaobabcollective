import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, Leaf, Heart } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import elephant from "@/assets/elephant.jpg";

export const Route = createFileRoute("/about-africa")({
  head: () => ({
    meta: [
      { title: "About Africa — The Baobab Collective" },
      { name: "description", content: "Africa is more than a destination — it's a feeling, a heartbeat, a story that stays with you forever." },
      { property: "og:title", content: "About Africa — The Baobab Collective" },
      { property: "og:description", content: "Our people, our planet, our purpose." },
      { property: "og:url", content: "/about-africa" },
    ],
    links: [{ rel: "canonical", href: "/about-africa" }],
  }),
  component: AboutAfricaPage,
});

function AboutAfricaPage() {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main>
        <section className="relative h-[70vh] min-h-[480px] flex items-center">
          <img src={elephant} alt="Elephant herd at sunrise" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-10 text-background">
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] mb-6 max-w-2xl">
              Africa is more than a destination
            </h1>
            <p className="text-lg max-w-xl text-background/90 mb-8">
              It's a feeling, a heartbeat, a story that stays with you forever.
            </p>
            <Link to="/journeys" className="inline-flex bg-gold text-gold-foreground uppercase tracking-[0.25em] text-[11px] px-7 py-4">
              Our Story
            </Link>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 grid md:grid-cols-3 gap-12 text-center">
            {[
              { icon: Users, title: "Our People", body: "We partner with local communities and guides who share their knowledge and stories with pride." },
              { icon: Leaf, title: "Our Planet", body: "We are committed to protecting Africa's wild spaces and supporting conservation initiatives." },
              { icon: Heart, title: "Our Purpose", body: "We believe in travel that makes a positive impact and leaves a lasting legacy for future generations." },
            ].map((p) => (
              <article key={p.title}>
                <p.icon className="w-12 h-12 text-gold mx-auto mb-5" strokeWidth={1.2} />
                <h2 className="text-[12px] tracking-[0.25em] uppercase text-foreground mb-4">{p.title}</h2>
                <p className="text-foreground/75 leading-relaxed max-w-xs mx-auto">{p.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
