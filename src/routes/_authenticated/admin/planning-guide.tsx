import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { adminListPlanningGuide } from "@/lib/planning-guide.functions";

export const Route = createFileRoute("/_authenticated/admin/planning-guide")({
  component: PlanningGuideAdmin,
});

function PlanningGuideAdmin() {
  const fn = useServerFn(adminListPlanningGuide);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-planning-guide"],
    queryFn: () => fn(),
  });

  const rows = data ?? [];

  function exportCsv() {
    const header = [
      "created_at", "name", "email", "travelling_party",
      "earliest_date", "interests", "message", "pdf_url", "email_sent",
    ];
    const csv = [
      header.join(","),
      ...rows.map((r: any) =>
        header
          .map((h) => {
            const v = h === "interests" ? (r.interests ?? []).join("; ") : r[h];
            return `"${String(v ?? "").replace(/"/g, '""')}"`;
          })
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `planning-guide-requests-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-3xl">Planning Guide Requests</h1>
        {rows.length > 0 && (
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] border border-foreground/30 px-4 py-2 hover:bg-foreground hover:text-background"
          >
            <Download className="w-3 h-3" /> Export CSV
          </button>
        )}
      </div>
      {isLoading && <p>Loading…</p>}
      <div className="space-y-4">
        {rows.map((r: any) => (
          <article key={r.id} className="bg-background border border-border p-5">
            <div className="flex justify-between flex-wrap gap-2 mb-2">
              <div>
                <p className="font-medium">{r.name} · <span className="text-foreground/60">{r.email}</span></p>
                <p className="text-sm text-foreground/60">
                  {r.travelling_party || "—"} · earliest: {r.earliest_date || "flexible"}
                </p>
              </div>
              <p className="text-[11px] uppercase tracking-luxury text-foreground/50">
                {new Date(r.created_at).toLocaleString()}
              </p>
            </div>
            {(r.interests ?? []).length > 0 && (
              <div className="flex flex-wrap gap-2 my-2">
                {r.interests.map((i: string) => (
                  <span key={i} className="text-[10px] uppercase tracking-[0.2em] bg-cream px-2 py-1">{i}</span>
                ))}
              </div>
            )}
            {r.message && <p className="text-foreground/80 whitespace-pre-wrap mt-2">{r.message}</p>}
            <div className="flex gap-4 mt-3 text-xs">
              {r.pdf_url ? (
                <a href={r.pdf_url} target="_blank" rel="noopener noreferrer" className="text-gold underline">
                  Download PDF
                </a>
              ) : (
                <span className="text-foreground/40">PDF not generated</span>
              )}
              <span className={r.email_sent ? "text-forest" : "text-foreground/40"}>
                {r.email_sent ? "✓ Email sent" : "Email pending"}
              </span>
            </div>
          </article>
        ))}
        {rows.length === 0 && !isLoading && (
          <p className="text-foreground/60">No requests yet.</p>
        )}
      </div>
    </div>
  );
}
