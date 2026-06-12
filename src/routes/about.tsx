import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { About } from "@/components/site/About";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — The Baobab Collective" },
      { name: "description", content: "Born from a love of Africa. Built on connection. Meet the people behind The Baobab Collective." },
      { property: "og:title", content: "About — The Baobab Collective" },
      { property: "og:description", content: "We don't just plan trips, we create meaningful connections." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main>
        <About />
        <section className="bg-cream py-16 text-center">
          <Link to="/contact" className="inline-flex border border-gold text-gold uppercase tracking-[0.25em] text-[11px] px-8 py-4 hover:bg-gold hover:text-gold-foreground transition-colors">
            Plan Your Journey
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
