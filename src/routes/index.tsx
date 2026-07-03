import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Journeys } from "@/components/site/Journeys";
import { Journal } from "@/components/site/Journal";
import { InstagramStrip } from "@/components/site/Instagram";
import { Footer } from "@/components/site/Footer";
import { getPageContent } from "@/lib/page-content.functions";
import { getArticles } from "@/lib/cms.functions";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [home, about, home_journeys, home_journal, home_instagram, articles] = await Promise.all([
      getPageContent({ data: { key: "home" } }).catch(() => null),
      getPageContent({ data: { key: "about" } }).catch(() => null),
      getPageContent({ data: { key: "home_journeys" } }).catch(() => null),
      getPageContent({ data: { key: "home_journal" } }).catch(() => null),
      getPageContent({ data: { key: "home_instagram" } }).catch(() => null),
      getArticles().catch(() => [] as any[]),
    ]);
    const journalCards = (articles ?? []).slice(0, 3).map((r: any) => ({
      slug: r.slug,
      title: r.title,
      image: r.image ?? "",
    }));
    return { home, about, home_journeys, home_journal, home_instagram, journalCards };
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
  const { home, about, home_journeys, home_journal, home_instagram, journalCards } = Route.useLoaderData();
  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <Hero content={home} />
      <About content={about} />
      <Journeys content={home_journeys} />
      <Journal content={home_journal} articles={journalCards.length ? journalCards : undefined} />
      <InstagramStrip content={home_instagram} />
      <Footer />
    </main>
  );
}
