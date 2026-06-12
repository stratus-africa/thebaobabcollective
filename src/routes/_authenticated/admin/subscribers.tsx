import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { adminListSubscribers } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/subscribers")({
  component: SubscribersAdmin,
});

function SubscribersAdmin() {
  const fn = useServerFn(adminListSubscribers);
  const { data, isLoading } = useQuery({ queryKey: ["admin-subs"], queryFn: () => fn() });

  const exportCsv = () => {
    if (!data) return;
    const csv = "email,created_at\n" + data.map((s) => `${s.email},${s.created_at}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "subscribers.csv"; a.click();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-3xl">Newsletter Subscribers ({data?.length ?? 0})</h1>
        <button onClick={exportCsv} className="text-[11px] tracking-luxury uppercase border border-gold text-gold px-4 py-2 hover:bg-gold hover:text-gold-foreground">Export CSV</button>
      </div>
      {isLoading && <p>Loading…</p>}
      <div className="bg-background border border-border">
        <table className="w-full text-sm">
          <thead className="bg-cream">
            <tr className="text-left text-[11px] tracking-[0.2em] uppercase text-foreground/70">
              <th className="p-3">Email</th>
              <th className="p-3">Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="p-3">{s.email}</td>
                <td className="p-3 text-foreground/60">{new Date(s.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
