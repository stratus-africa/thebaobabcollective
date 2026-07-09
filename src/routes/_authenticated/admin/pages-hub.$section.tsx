import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  LayoutDashboard, Compass, MapPin, Building, BookOpen, Globe, ExternalLink,
  Bell, Users as UsersIcon, Sparkles,
} from "lucide-react";

type Editor = { pageKey: string; title: string; description: string };
type HubTab = { value: string; label: string; icon: any; editors: Editor[] };
type HubSection = { title: string; description: string; tabs: HubTab[] };

const SECTIONS: Record<string, HubSection> = {
  home: {
    title: "Home Page",
    description: "Every section of the homepage, grouped into tabs.",
    tabs: [
      {
        value: "hero",
        label: "Home Hero",
        icon: LayoutDashboard,
        editors: [
          { pageKey: "home", title: "Home — Hero", description: "Hero copy, CTAs and background image." },
          { pageKey: "top_bar", title: "Top Announcement Bar", description: "Dark bar at the top of every page." },
        ],
      },
      {
        value: "adventures",
        label: "Adventures",
        icon: Compass,
        editors: [
          { pageKey: "home_adventures", title: "Home — Adventures Strip", description: "The Adventures strip on the homepage." },
          { pageKey: "adventures_index", title: "Adventures — Landing Page", description: "All editable copy on the /adventures listing page." },
          { pageKey: "detail_journey", title: "Adventure Detail Template", description: "Shared copy for every adventure detail page." },
        ],
      },
      {
        value: "destinations",
        label: "Destinations",
        icon: MapPin,
        editors: [
          { pageKey: "home_destinations", title: "Home — Destinations Strip", description: "The Destinations strip and landing entry point on the homepage." },
        ],
      },
      {
        value: "lodges",
        label: "Lodges",
        icon: Building,
        editors: [
          { pageKey: "home_lodges", title: "Home — Lodges Strip", description: "The Lodges strip on the homepage." },
          { pageKey: "lodges_index", title: "Lodges — Landing Page", description: "Intro band on the /lodges listing page." },
          { pageKey: "detail_lodge", title: "Lodge Detail Template", description: "Shared copy for every lodge detail page." },
        ],
      },
      {
        value: "journal",
        label: "Journal",
        icon: BookOpen,
        editors: [
          { pageKey: "home_journal", title: "Home — Journal Strip", description: "The 'Stories. Guidance. Inspiration.' block." },
        ],
      },
      {
        value: "instagram",
        label: "Instagram",
        icon: Globe,
        editors: [
          { pageKey: "home_instagram", title: "Home — Instagram Strip", description: "Handle, heading and the 7 thumbnails." },
        ],
      },
    ],
  },
  about: {
    title: "About Page",
    description: "Sections of the /about page.",
    tabs: [
      {
        value: "hero",
        label: "About Hero",
        icon: Sparkles,
        editors: [{ pageKey: "about", title: "About — Hero / Block", description: "Eyebrow, title, body and side images." }],
      },
      {
        value: "mission",
        label: "Mission",
        icon: BookOpen,
        editors: [{ pageKey: "about_mission", title: "About — Mission", description: "Mission section copy." }],
      },
      {
        value: "values",
        label: "Values",
        icon: Bell,
        editors: [{ pageKey: "about_values", title: "About — Values", description: "The four values shown on the About page." }],
      },
      {
        value: "team",
        label: "Team",
        icon: UsersIcon,
        editors: [{ pageKey: "about_team", title: "About — Team", description: "Team intro copy and member cards." }],
      },
    ],
  },
};

export const Route = createFileRoute("/_authenticated/admin/pages-hub/$section")({
  beforeLoad: ({ params }) => {
    if (!SECTIONS[params.section]) throw notFound();
  },
  component: PagesHub,
});

function PagesHub() {
  const { section } = Route.useParams();
  const cfg = SECTIONS[section];

  return (
    <div>
      <header className="mb-8">
        <p className="text-[11px] tracking-[0.3em] uppercase text-foreground/60 mb-2">Admin · Pages</p>
        <h1 className="font-serif text-3xl text-foreground">{cfg.title}</h1>
        <p className="text-sm text-foreground/65 mt-1">{cfg.description}</p>
      </header>

      <Tabs defaultValue={cfg.tabs[0]?.value} orientation="vertical" className="flex flex-col md:flex-row gap-8">
        <TabsList className="h-auto md:w-56 shrink-0 flex md:flex-col bg-transparent p-0 gap-1 justify-start">
          {cfg.tabs.map((t) => {
            const Icon = t.icon;
            return (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="w-full justify-start gap-2 data-[state=active]:bg-cream data-[state=active]:text-foreground data-[state=active]:shadow-none border border-transparent data-[state=active]:border-border px-4 py-2.5"
              >
                <Icon className="w-4 h-4" /> {t.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="flex-1 min-w-0">
          {cfg.tabs.map((t) => (
            <TabsContent key={t.value} value={t.value} className="mt-0 space-y-5">
              {t.editors.map((ed) => (
                <EditorCard key={ed.pageKey} pageKey={ed.pageKey} title={ed.title} description={ed.description} />
              ))}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}

function EditorCard({ pageKey, title, description }: Editor) {
  return (
    <div className="bg-background border border-border rounded-xl p-6 md:p-8">
      <h2 className="font-serif text-2xl text-foreground">{title}</h2>
      <p className="text-sm text-foreground/70 mt-1">{description}</p>
      <Link
        to="/admin/pages/$page"
        params={{ page: pageKey }}
        className="inline-flex items-center gap-2 mt-5 bg-forest text-forest-foreground uppercase tracking-[0.2em] text-[11px] px-5 py-3 hover:bg-forest/90 transition-colors"
      >
        Open editor <ExternalLink className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
