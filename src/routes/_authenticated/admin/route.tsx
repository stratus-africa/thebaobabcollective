import { createFileRoute, Outlet, Link, useRouterState, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, Calendar, Mail, MessageSquare, Globe, Building, MapPin, Star, HelpCircle, FileText, Plane, Compass, BookOpen,
} from "lucide-react";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/bookings", label: "Bookings", icon: Calendar },
  { to: "/admin/enquiries", label: "Enquiries", icon: MessageSquare },
  { to: "/admin/private-travel", label: "Private Travel", icon: Plane },
  { to: "/admin/planning-guide", label: "Planning Guide", icon: BookOpen },
  { to: "/admin/subscribers", label: "Subscribers", icon: Mail },
  { type: "divider" as const },
  { to: "/admin/adventures", label: "Adventures Page", icon: Compass },
  { to: "/admin/content/journey_categories", label: "Journey Categories", icon: Globe },
  { to: "/admin/content/itineraries", label: "Itineraries", icon: Calendar },
  { to: "/admin/content/journal_articles", label: "Articles", icon: FileText },
  { to: "/admin/content/lodges", label: "Lodges", icon: Building },
  { to: "/admin/content/destinations", label: "Destinations", icon: MapPin },
  { to: "/admin/content/testimonials", label: "Testimonials", icon: Star },
  { to: "/admin/content/faqs", label: "FAQs", icon: HelpCircle },
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

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user?.email ?? null));
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex bg-cream">
      <aside className="w-64 bg-forest text-forest-foreground p-6 hidden md:flex flex-col">
        <Link to="/" className="font-serif text-xl mb-1">Baobab Admin</Link>
        <p className="text-[11px] tracking-luxury uppercase text-forest-foreground/60 mb-8">{user}</p>
        <nav className="flex-1 space-y-1">
          {nav.map((item, i) => {
            if ("type" in item) return <div key={i} className="border-t border-forest-foreground/15 my-4" />;
            const Icon = item.icon;
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to as any}
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${active ? "bg-gold text-gold-foreground" : "text-forest-foreground/80 hover:bg-forest-foreground/10"}`}
              >
                <Icon className="w-4 h-4" /> {item.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={signOut} className="text-[11px] tracking-luxury uppercase text-forest-foreground/60 hover:text-gold mt-4 text-left">
          Sign out
        </button>
      </aside>
      <main className="flex-1 p-6 md:p-10 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
}
