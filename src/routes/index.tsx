import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Journeys } from "@/components/site/Journeys";
import { Journal } from "@/components/site/Journal";
import { InstagramStrip } from "@/components/site/Instagram";
import { Footer } from "@/components/site/Footer";
import { getPageContent } from "@/lib/page-content.functions";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [home, about] = await Promise.all([
      getPageContent({ data: { key: "home" } }).catch(() => null),
      getPageContent({ data: { key: "about" } }).catch(() => null),
    ]);
    return { home, about };
  },
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
  const { home, about } = Route.useLoaderData();
  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <Hero content={home} />
      <About content={about} />
      <Journeys />
      <Journal />
      <InstagramStrip />
      <Footer />
    </main>
  );
}
