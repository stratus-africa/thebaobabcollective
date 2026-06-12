import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { adminListEnquiries } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/enquiries")({
  component: EnquiriesAdmin,
});

function EnquiriesAdmin() {
  const fn = useServerFn(adminListEnquiries);
  const { data, isLoading } = useQuery({ queryKey: ["admin-enquiries"], queryFn: () => fn() });
  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Enquiries</h1>
      {isLoading && <p>Loading…</p>}
      <div className="space-y-4">
        {data?.map((e) => (
          <article key={e.id} className="bg-background border border-border p-5">
            <div className="flex justify-between flex-wrap gap-2 mb-2">
              <div>
                <p className="font-medium">{e.name} · <span className="text-foreground/60">{e.email}</span></p>
                {e.destination && <p className="text-sm text-foreground/60">Destination: {e.destination}</p>}
              </div>
              <p className="text-[11px] uppercase tracking-luxury text-foreground/50">{new Date(e.created_at).toLocaleDateString()}</p>
            </div>
            <p className="text-foreground/80 whitespace-pre-wrap">{e.message}</p>
          </article>
        ))}
        {data?.length === 0 && <p className="text-foreground/60">No enquiries yet.</p>}
      </div>
    </div>
  );
}
