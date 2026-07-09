import { createFileRoute, notFound } from "@tanstack/react-router";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  LayoutDashboard, Compass, MapPin, Building, BookOpen, Globe,
  Bell, Users as UsersIcon, Sparkles,
} from "lucide-react";
import { PageEditor } from "./pages.$page";
import type { PageKey } from "@/lib/page-content.defaults";

type SubEditor = { pageKey: PageKey; label: string };
type HubTab = { value: string; label: string; icon: any; editors: SubEditor[] };
type HubSection = { title: string; description: string; tabs: HubTab[] };

const SECTIONS: Record<string, HubSection> = {
  home: {
    title: "Home Page",
    description: "Every section of the homepage, grouped into tabs.",
    tabs: [
      {
        value: "hero", label: "Home Hero", icon: LayoutDashboard,
        editors: [
          { pageKey: "home", label: "Home — Hero" },
          { pageKey: "top_bar", label: "Top Announcement Bar" },
        ],
      },
      {
        value: "adventures", label: "Adventures", icon: Compass,
        editors: [
          { pageKey: "home_adventures",   label: "Home — Adventures Strip" },
          { pageKey: "adventures_index",  label: "Adventures Landing" },
          { pageKey: "detail_journey",    label: "Adventures Detail Template" },
        ],
      },
      {
        value: "destinations", label: "Destinations", icon: MapPin,
        editors: [{ pageKey: "home_destinations", label: "Home — Destinations Strip" }],
      },
      {
        value: "lodges", label: "Lodges", icon: Building,
        editors: [
          { pageKey: "home_lodges",  label: "Home — Lodges Strip" },
          { pageKey: "lodges_index", label: "Lodges Landing" },
          { pageKey: "detail_lodge", label: "Lodge Detail Template" },
        ],
      },
      {
        value: "journal", label: "Journal", icon: BookOpen,
        editors: [{ pageKey: "home_journal", label: "Home — Journal Strip" }],
      },
      {
        value: "instagram", label: "Instagram", icon: Globe,
        editors: [{ pageKey: "home_instagram", label: "Home — Instagram Strip" }],
      },
    ],
  },
  about: {
    title: "About Page",
    description: "Sections of the /about page.",
    tabs: [
      { value: "hero",    label: "About Hero", icon: Sparkles,  editors: [{ pageKey: "about",         label: "About — Hero / Block" }] },
      { value: "mission", label: "Mission",    icon: BookOpen,  editors: [{ pageKey: "about_mission", label: "About — Mission" }] },
      { value: "values",  label: "Values",     icon: Bell,      editors: [{ pageKey: "about_values",  label: "About — Values" }] },
      { value: "team",    label: "Team",       icon: UsersIcon, editors: [{ pageKey: "about_team",    label: "About — Team" }] },
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
            <TabsContent key={t.value} value={t.value} className="mt-0">
              {t.editors.length > 1 ? (
                <Tabs defaultValue={t.editors[0].pageKey} orientation="vertical" className="flex flex-col lg:flex-row gap-6">
                  <TabsList className="h-auto lg:w-52 shrink-0 flex lg:flex-col bg-transparent p-0 gap-1 justify-start">
                    {t.editors.map((ed) => (
                      <TabsTrigger
                        key={ed.pageKey}
                        value={ed.pageKey}
                        className="w-full justify-start gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none border border-transparent data-[state=active]:border-border px-3 py-2 text-sm"
                      >
                        {ed.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <div className="flex-1 min-w-0">
                    {t.editors.map((ed) => (
                      <TabsContent key={ed.pageKey} value={ed.pageKey} className="mt-0">
                        <PageEditor pageKey={ed.pageKey} />
                      </TabsContent>
                    ))}
                  </div>
                </Tabs>
              ) : (
                <PageEditor pageKey={t.editors[0].pageKey} />
              )}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
