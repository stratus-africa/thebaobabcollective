import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { adminDashboard } from "@/lib/admin.functions";
import {
  Calendar, MessageSquare, Plane, Mail, DollarSign, Clock,
  PlusCircle, CheckCircle2, Compass, FileText, ArrowRight,
  Briefcase, MapPin, Building, BookOpen,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-muted/60 animate-pulse rounded ${className}`} />;
}

function Dashboard() {
  const fn = useServerFn(adminDashboard);
  const { data, isLoading } = useQuery({ queryKey: ["admin-dashboard"], queryFn: () => fn() });
  const { formatPrice } = useSiteSettings();

  const stats = [
    {
      label: "Active Enquiries",
      value: data?.enquiries,
      icon: MessageSquare,
      tone: "bg-forest/15 text-forest",
    },
    {
      label: "Total Revenue",
      value: data?.total_revenue != null ? formatPrice(data.total_revenue) : undefined,
      icon: DollarSign,
      tone: "bg-terracotta/15 text-terracotta",
    },
  ];

  const quickTasks = [
    { to: "/admin/content/itineraries", label: "Add an Itinerary", icon: PlusCircle },
    { to: "/admin/enquiries", label: "Review Enquiries", icon: CheckCircle2 },
    { to: "/admin/adventures", label: "Update Adventures Page", icon: Compass },
    { to: "/admin/content/journal_articles", label: "Publish an Article", icon: FileText },
  ];

  const tools = [
    { to: "/admin/content/lodges", label: "Lodges", icon: Building, blurb: "Curate partner camps & lodges" },
    { to: "/admin/content/destinations", label: "Destinations", icon: MapPin, blurb: "Manage destination guides" },
    { to: "/admin/private-travel", label: "Private Travel", icon: Briefcase, blurb: "Bespoke travel requests" },
    { to: "/admin/planning-guide", label: "Planning Guide", icon: BookOpen, blurb: "Downloadable PDFs & requests" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl text-foreground">Admin Dashboard</h1>
        <p className="text-foreground/60 mt-1">Manage your luxury safari content and operations.</p>
      </div>

      {/* Welcome card */}
      <section className="bg-background border border-border rounded-xl p-6 md:p-7">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 items-center">
          <div className="h-12 w-12 rounded-xl bg-forest text-forest-foreground flex items-center justify-center font-serif text-xl shrink-0">
            B
          </div>
          <div className="min-w-0">
            <h2 className="font-serif text-2xl text-foreground truncate">Welcome back</h2>
            <p className="text-sm text-foreground/60 truncate">Here's what's moving across the collective today.</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/60"
              >
                <span className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${s.tone}`}>
                  <Icon className="w-5 h-5" strokeWidth={1.6} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-foreground/60 truncate">{s.label}</p>
                  {isLoading || s.value === undefined ? (
                    <Skeleton className="h-6 w-16 mt-1" />
                  ) : (
                    <p className="font-serif text-xl md:text-2xl text-foreground leading-tight">{s.value}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main grid: left content, right admin tools (stacked) */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6 min-w-0">
          <div className="bg-background border border-border rounded-xl">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <h2 className="font-serif text-xl text-foreground">Recent Activity</h2>
              <Link to="/admin/enquiries" className="text-[11px] tracking-[0.2em] uppercase text-gold hover:underline">
                View all
              </Link>
            </div>
            <ul className="divide-y divide-border/70">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <li key={i} className="px-6 py-4 flex items-center gap-4">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-1/3" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                      <Skeleton className="h-3 w-12" />
                    </li>
                  ))
                : (data?.activity ?? []).length === 0
                ? (
                  <li className="px-6 py-10 text-center text-sm text-foreground/60">No recent activity yet.</li>
                )
                : (data?.activity ?? []).map((a, i) => {
                    const Icon = a.kind === "booking" ? Calendar : a.kind === "enquiry" ? MessageSquare : Plane;
                    return (
                      <li key={i} className="px-6 py-4 flex items-center gap-4">
                        <span className="h-9 w-9 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" strokeWidth={1.6} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-foreground truncate">{a.title}</p>
                          <p className="text-xs text-foreground/60 truncate">{a.subtitle}</p>
                        </div>
                        <span className="text-[11px] text-foreground/50 shrink-0">{formatRelative(a.at)}</span>
                      </li>
                    );
                  })}
            </ul>
          </div>

          <div className="bg-background border border-border rounded-xl">
            <div className="px-6 py-5 border-b border-border">
              <h2 className="font-serif text-xl text-foreground">Quick Tasks</h2>
            </div>
            <ul className="p-3 space-y-1">
              {quickTasks.map((t) => {
                const Icon = t.icon;
                return (
                  <li key={t.to}>
                    <Link
                      to={t.to as any}
                      className="group flex items-center gap-3 p-3 rounded-lg hover:bg-muted/60 transition-colors"
                    >
                      <span className="h-9 w-9 rounded-lg bg-cream text-foreground flex items-center justify-center shrink-0 group-hover:bg-gold group-hover:text-gold-foreground transition-colors">
                        <Icon className="w-4 h-4" strokeWidth={1.6} />
                      </span>
                      <span className="text-sm text-foreground flex-1">{t.label}</span>
                      <ArrowRight className="w-4 h-4 text-foreground/40 group-hover:text-gold transition-colors" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <aside className="space-y-3">
          <h2 className="font-serif text-xl text-foreground">Admin Tools</h2>
          <div className="flex flex-col gap-3">
            {tools.map((t) => {
              const Icon = t.icon;
              return (
                <Link
                  key={t.to}
                  to={t.to as any}
                  className="group flex items-start gap-3 bg-background border border-border rounded-xl p-4 hover:border-gold/50 hover:shadow-md transition-all"
                >
                  <span className="h-10 w-10 rounded-lg bg-forest/10 text-forest flex items-center justify-center shrink-0 group-hover:bg-gold/15 group-hover:text-gold transition-colors">
                    <Icon className="w-5 h-5" strokeWidth={1.6} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-base text-foreground">{t.label}</p>
                    <p className="text-xs text-foreground/60 mt-0.5">{t.blurb}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-foreground/30 group-hover:text-gold transition-colors mt-1" />
                </Link>
              );
            })}
          </div>
        </aside>
      </section>
    </div>
  );
}
