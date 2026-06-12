import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { adminDashboard } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const fn = useServerFn(adminDashboard);
  const { data } = useQuery({ queryKey: ["admin-dashboard"], queryFn: () => fn() });

  const cards = [
    { label: "Bookings", value: data?.bookings ?? "—" },
    { label: "Enquiries", value: data?.enquiries ?? "—" },
    { label: "Private travel", value: data?.private_travel ?? "—" },
    { label: "Subscribers", value: data?.subscribers ?? "—" },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl text-foreground mb-2">Dashboard</h1>
      <p className="text-foreground/60 mb-8">Overview of activity across your site.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-background border border-border p-6">
            <p className="text-[11px] tracking-[0.2em] uppercase text-foreground/60 mb-2">{c.label}</p>
            <p className="font-serif text-4xl text-foreground">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
