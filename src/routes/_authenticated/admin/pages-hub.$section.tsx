import { createFileRoute, notFound } from "@tanstack/react-router";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  LayoutDashboard, Compass, MapPin, Building, BookOpen, Globe,
  Bell, Users as UsersIcon, Sparkles,
} from "lucide-react";
import { PageEditor } from "./pages.$page";
import type { PageKey } from "@/lib/page-content.defaults";

type HubTab = { value: string; label: string; icon: any; pageKeys: PageKey[] };
type HubSection = { title: string; description: string; tabs: HubTab[] };

const SECTIONS: Record<string, HubSection> = {
  home: {
    title: "Home Page",
    description: "Every section of the homepage, grouped into tabs.",
    tabs: [
      { value: "hero",         label: "Home Hero",    icon: LayoutDashboard, pageKeys: ["home", "top_bar"] },
      { value: "adventures",   label: "Adventures",   icon: Compass,         pageKeys: ["home_adventures", "adventures_index", "detail_journey"] },
      { value: "destinations", label: "Destinations", icon: MapPin,          pageKeys: ["home_destinations"] },
      { value: "lodges",       label: "Lodges",       icon: Building,        pageKeys: ["home_lodges", "lodges_index", "detail_lodge"] },
      { value: "journal",      label: "Journal",      icon: BookOpen,        pageKeys: ["home_journal"] },
      { value: "instagram",    label: "Instagram",    icon: Globe,           pageKeys: ["home_instagram"] },
    ],
  },
  about: {
    title: "About Page",
    description: "Sections of the /about page.",
    tabs: [
      { value: "hero",    label: "About Hero", icon: Sparkles,   pageKeys: ["about"] },
      { value: "mission", label: "Mission",    icon: BookOpen,   pageKeys: ["about_mission"] },
      { value: "values",  label: "Values",     icon: Bell,       pageKeys: ["about_values"] },
      { value: "team",    label: "Team",       icon: UsersIcon,  pageKeys: ["about_team"] },
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
            <TabsContent key={t.value} value={t.value} className="mt-0 space-y-10">
              {t.pageKeys.map((pk) => (
                <PageEditor key={pk} pageKey={pk} />
              ))}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
