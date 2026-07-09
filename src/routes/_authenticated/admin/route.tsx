import { createFileRoute, Outlet, Link, useRouterState, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  LayoutDashboard, Calendar, Mail, MessageSquare, Globe, Building, MapPin, Star,
  HelpCircle, FileText, Plane, Compass, BookOpen, Bell, Menu, LogOut, ArrowLeft, Settings,
} from "lucide-react";

type NavItem = { to: string; label: string; icon: any; exact?: boolean };
type NavGroup = { label: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { to: "/admin/enquiries", label: "Enquiries", icon: MessageSquare },
      { to: "/admin/subscribers", label: "Subscribers", icon: Mail },
    ],
  },
  {
    label: "Management",
    items: [
      { to: "/admin/adventures", label: "Adventures", icon: Compass },
      { to: "/admin/content/lodges", label: "Lodges", icon: Building },
      { to: "/admin/content/destinations", label: "Destinations", icon: MapPin },
    ],
  },
  {
    label: "Pages · Home",
    items: [
      { to: "/admin/pages/home", label: "Home — Hero", icon: LayoutDashboard },
      { to: "/admin/pages/home_adventures", label: "Adventures", icon: Compass },
      { to: "/admin/pages/home_destinations", label: "Destinations", icon: MapPin },
      { to: "/admin/pages/home_lodges", label: "Lodges", icon: Building },
      { to: "/admin/pages/home_journal", label: "Journal", icon: BookOpen },
      { to: "/admin/pages/home_instagram", label: "Instagram", icon: Globe },
      { to: "/admin/pages/top_bar", label: "Top Bar", icon: Bell },
    ],
  },
  {
    label: "Pages · About",
    items: [
      { to: "/admin/pages/about", label: "About — Hero", icon: BookOpen },
      { to: "/admin/pages/about_mission", label: "Mission", icon: BookOpen },
      { to: "/admin/pages/about_values", label: "Values", icon: BookOpen },
      { to: "/admin/pages/about_team", label: "Team", icon: BookOpen },
    ],
  },
  {
    label: "Pages · Contact",
    items: [
      { to: "/admin/pages/contact", label: "Contact", icon: Mail },
    ],
  },
  {
    label: "Pages · Landings",
    items: [
      { to: "/admin/pages/lodges_index", label: "Lodges Landing", icon: Building },
      { to: "/admin/pages/adventures_index", label: "Adventures Landing", icon: Plane },
      { to: "/admin/pages/detail_journey", label: "Adventure Detail", icon: Compass },
      { to: "/admin/pages/detail_lodge", label: "Lodge Detail", icon: Building },
      { to: "/admin/pages/footer", label: "Footer", icon: LayoutDashboard },
    ],
  },
  {
    label: "Content",
    items: [
      { to: "/admin/journal", label: "Journal", icon: FileText },
      { to: "/admin/content/testimonials", label: "Testimonials", icon: Star },
      { to: "/admin/pages/testimonials", label: "Testimonials Page", icon: Star },
      { to: "/admin/content/faqs", label: "FAQs", icon: HelpCircle },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/admin/menu", label: "Menu & Navigation", icon: Menu },
      { to: "/admin/pages/seo", label: "Global SEO", icon: Globe },
      { to: "/admin/pages/auth_page", label: "Admin Sign-in Page", icon: HelpCircle },
      { to: "/admin/pages/not_found", label: "404 Page", icon: HelpCircle },
      { to: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];




export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth", search: { redirect: location.href } });
    const { data: role } = await supabase
      .from("user_roles").select("role")
      .eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
    if (!role) throw redirect({ to: "/" });
  },
  component: AdminLayout,
});

function SidebarBody({
  pathname, email, onSignOut, onNavigate,
}: { pathname: string; email: string | null; onSignOut: () => void; onNavigate?: () => void }) {
  const initial = (email?.[0] ?? "B").toUpperCase();
  return (
    <div className="flex flex-col h-full bg-forest text-forest-foreground">
      <div className="px-6 py-6 border-b border-forest-foreground/10">
        <Link to="/" onClick={onNavigate} className="flex items-center gap-3 group">
          <span className="h-10 w-10 rounded-lg bg-gold text-gold-foreground flex items-center justify-center font-serif text-lg">
            {initial}
          </span>
          <span className="min-w-0">
            <span className="block font-serif text-lg leading-tight group-hover:text-gold transition-colors">Baobab Admin</span>
            <span className="block text-[10px] tracking-[0.25em] uppercase text-forest-foreground/60 truncate">
              {email ?? "—"}
            </span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="px-3 mb-2 text-[10px] tracking-[0.3em] uppercase text-forest-foreground/50">
              {g.label}
            </p>
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const Icon = item.icon;
                const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to as any}
                      onClick={onNavigate}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        active
                          ? "bg-gold text-gold-foreground font-medium"
                          : "text-forest-foreground/80 hover:bg-forest-foreground/10 hover:text-forest-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" strokeWidth={1.6} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-forest-foreground/10 space-y-1">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-forest-foreground/80 hover:bg-forest-foreground/10"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Website
        </Link>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-forest-foreground/80 hover:bg-forest-foreground/10"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </div>
  );
}

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [user, setUser] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user?.email ?? null));
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const initial = (user?.[0] ?? "A").toUpperCase();

  return (
    <div className="min-h-screen flex bg-cream">
      {/* Desktop sidebar */}
      <aside className="w-64 shrink-0 hidden md:block sticky top-0 h-screen">
        <SidebarBody pathname={pathname} email={user} onSignOut={signOut} />
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
          <div className="h-16 px-4 md:px-8 flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-md border border-border hover:bg-muted"
                  aria-label="Open admin navigation"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 border-r-0">
                <SheetTitle className="sr-only">Admin navigation</SheetTitle>
                <SidebarBody
                  pathname={pathname}
                  email={user}
                  onSignOut={signOut}
                  onNavigate={() => setMobileOpen(false)}
                />
              </SheetContent>
            </Sheet>

            <div className="flex-1 min-w-0">
              <p className="text-[10px] tracking-[0.3em] uppercase text-foreground/50">Admin</p>
              <p className="font-serif text-base truncate text-foreground">The Baobab Collective</p>
            </div>

            <button
              aria-label="Notifications"
              className="relative h-10 w-10 inline-flex items-center justify-center rounded-md border border-border hover:bg-muted"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gold" />
            </button>
            <div
              className="h-10 w-10 rounded-full bg-forest text-forest-foreground flex items-center justify-center font-serif"
              aria-label={user ?? "Admin"}
              title={user ?? undefined}
            >
              {initial}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
