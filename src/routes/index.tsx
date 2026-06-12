import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Journeys } from "@/components/site/Journeys";
import { Journal } from "@/components/site/Journal";
import { InstagramStrip } from "@/components/site/Instagram";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Baobab Collective — Curated Safari Journeys" },
      {
        name: "description",
        content:
          "Luxury curated safari experiences in Africa. Authentic connections, conservation-led journeys, and extraordinary moments with The Baobab Collective.",
      },
      { property: "og:title", content: "The Baobab Collective — Curated Safari Journeys" },
      {
        property: "og:description",
        content: "Curated safari experiences that immerse, inspire and leave a lasting impact.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <Journeys />
      <Journal />
      <InstagramStrip />
      <Footer />
    </main>
  );
}
