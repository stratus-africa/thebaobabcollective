import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { adminListPrivateTravel } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/private-travel")({
  component: PrivateTravelAdmin,
});

function PrivateTravelAdmin() {
  const fn = useServerFn(adminListPrivateTravel);
  const { data, isLoading } = useQuery({ queryKey: ["admin-pt"], queryFn: () => fn() });
  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Private Travel Requests</h1>
      {isLoading && <p>Loading…</p>}
      <div className="space-y-4">
        {data?.map((r) => (
          <article key={r.id} className="bg-background border border-border p-5">
            <div className="flex justify-between flex-wrap gap-2 mb-3">
              <div>
                <p className="font-medium">{r.full_name} · <span className="text-foreground/60">{r.email}</span></p>
                <p className="text-sm text-foreground/60">
                  {r.destinations ?? "—"} · {r.travel_dates ?? "—"} · {r.party_size ?? "—"} guests · {r.budget_usd ?? "—"}
                </p>
              </div>
              <p className="text-[11px] uppercase tracking-luxury text-foreground/50">{new Date(r.created_at).toLocaleDateString()}</p>
            </div>
            {r.interests?.length ? (
              <div className="flex flex-wrap gap-2 mb-3">
                {r.interests.map((i) => <span key={i} className="text-[11px] tracking-wider uppercase border border-border px-2 py-1 text-foreground/60">{i}</span>)}
              </div>
            ) : null}
            {r.notes && <p className="text-foreground/80 whitespace-pre-wrap">{r.notes}</p>}
          </article>
        ))}
        {data?.length === 0 && <p className="text-foreground/60">No requests yet.</p>}
      </div>
    </div>
  );
}
