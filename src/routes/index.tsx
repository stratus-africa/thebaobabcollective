import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Journal } from "@/components/site/Journal";
import { InstagramStrip } from "@/components/site/Instagram";
import { Footer } from "@/components/site/Footer";
import { getPageContent } from "@/lib/page-content.functions";
import { getArticles } from "@/lib/cms.functions";
import { PAGE_DEFAULTS } from "@/lib/page-content.defaults";
import { usePreviewMerge } from "@/lib/preview-overrides";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [
      home,
      about,
      home_adventures,
      home_destinations,
      home_lodges,
      home_journal,
      home_instagram,
      footer,
      articles,
    ] = await Promise.all([
      getPageContent({ data: { key: "home" } }).catch(() => null),
      getPageContent({ data: { key: "about" } }).catch(() => null),
      getPageContent({ data: { key: "home_adventures" } }).catch(() => null),
      getPageContent({ data: { key: "home_destinations" } }).catch(() => null),
      getPageContent({ data: { key: "home_lodges" } }).catch(() => null),
      getPageContent({ data: { key: "home_journal" } }).catch(() => null),
      getPageContent({ data: { key: "home_instagram" } }).catch(() => null),
      getPageContent({ data: { key: "footer" } }).catch(() => null),
      getArticles().catch(() => [] as any[]),
    ]);
    const journalCards = (articles ?? []).slice(0, 3).map((r: any) => ({
      slug: r.slug,
      title: r.title,
      image: r.image ?? "",
    }));
    return {
      home,
      about,
      home_adventures,
      home_destinations,
      home_lodges,
      home_journal,
      home_instagram,
      footer,
      journalCards,
    };
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

type StripKey = "home_adventures" | "home_destinations" | "home_lodges";
type StripLink = { to: "/adventures" | "/destinations" | "/lodges" };

function StripCard({
  content,
  keyName,
  linkTo,
}: {
  content: any;
  keyName: StripKey;
  linkTo: StripLink["to"];
}) {
  const base = { ...(PAGE_DEFAULTS[keyName] as any), ...(content ?? {}) };
  const c: any = usePreviewMerge(keyName, base);
  return (
    <div className="bg-background border border-border p-8 md:p-10 text-center flex flex-col h-full">
      <p className="text-[11px] tracking-[0.3em] uppercase text-foreground/70 mb-3">{c.eyebrow}</p>
      <h3 className="font-serif text-2xl md:text-3xl text-foreground mb-4 tracking-wider">{c.title}</h3>
      <p className="text-foreground/70 mb-8 flex-1">{c.body}</p>
      <Link
        to={linkTo}
        className="mx-auto inline-flex items-center gap-2 border border-gold text-gold uppercase tracking-[0.25em] text-[11px] px-6 py-3 hover:bg-gold hover:text-gold-foreground transition-colors"
      >
        {c.cta_label} <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

function HomeStrips({
  adventures,
  lodges,
}: {
  adventures: any;
  lodges: any;
}) {
  return (
    <section className="bg-cream py-16 md:py-20">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StripCard content={adventures} keyName="home_adventures" linkTo="/adventures" />
          <StripCard content={lodges} keyName="home_lodges" linkTo="/lodges" />
        </div>
      </div>
    </section>
  );
}


function Index() {
  const {
    home,
    about,
    home_adventures,
    home_destinations,
    home_lodges,
    home_journal,
    home_instagram,
    footer,
    journalCards,
  } = Route.useLoaderData();
  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <Hero content={home} />
      <About content={about} />
      <HomeStrips adventures={home_adventures} destinations={home_destinations} lodges={home_lodges} />
      <Journal content={home_journal} articles={journalCards.length ? journalCards : undefined} />
      <InstagramStrip content={home_instagram} />
      <Footer content={footer} />
    </main>
  );
}

