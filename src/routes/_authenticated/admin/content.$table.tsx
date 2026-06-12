import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminList, adminUpsert, adminDelete } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Trash2, Plus, Pencil } from "lucide-react";

const TABLE_LABELS: Record<string, string> = {
  journey_categories: "Journey Categories",
  itineraries: "Itineraries",
  journal_articles: "Articles",
  lodges: "Lodges",
  destinations: "Destinations",
  testimonials: "Testimonials",
  faqs: "FAQs",
};

const SCHEMAS: Record<string, { name: string; label: string; type: "text" | "textarea" | "number" | "bool" | "array" | "json"; }[]> = {
  journey_categories: [
    { name: "slug", label: "Slug", type: "text" },
    { name: "title", label: "Title", type: "text" },
    { name: "tagline", label: "Tagline", type: "text" },
    { name: "intro", label: "Intro", type: "textarea" },
    { name: "hero_image", label: "Hero Image URL", type: "text" },
    { name: "sort_order", label: "Sort", type: "number" },
    { name: "published", label: "Published", type: "bool" },
  ],
  itineraries: [
    { name: "category_id", label: "Category ID", type: "text" },
    { name: "slug", label: "Slug", type: "text" },
    { name: "name", label: "Name", type: "text" },
    { name: "nights", label: "Nights", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "highlights", label: "Highlights (one per line)", type: "array" },
    { name: "image", label: "Image URL", type: "text" },
    { name: "price_from_usd", label: "Price from (USD)", type: "number" },
    { name: "deposit_usd", label: "Deposit (USD)", type: "number" },
    { name: "sort_order", label: "Sort", type: "number" },
    { name: "published", label: "Published", type: "bool" },
  ],
  journal_articles: [
    { name: "slug", label: "Slug", type: "text" },
    { name: "title", label: "Title", type: "text" },
    { name: "excerpt", label: "Excerpt", type: "textarea" },
    { name: "image", label: "Image URL", type: "text" },
    { name: "date", label: "Date", type: "text" },
    { name: "read_time", label: "Read time", type: "text" },
    { name: "category", label: "Category", type: "text" },
    { name: "content", label: "Paragraphs (one per line)", type: "array" },
    { name: "sort_order", label: "Sort", type: "number" },
    { name: "published", label: "Published", type: "bool" },
  ],
  lodges: [
    { name: "slug", label: "Slug", type: "text" },
    { name: "name", label: "Name", type: "text" },
    { name: "location", label: "Location", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "hero_image", label: "Hero image URL", type: "text" },
    { name: "gallery", label: "Gallery URLs (one per line)", type: "array" },
    { name: "amenities", label: "Amenities (one per line)", type: "array" },
    { name: "price_from_usd", label: "Price from (USD)", type: "number" },
    { name: "sort_order", label: "Sort", type: "number" },
    { name: "published", label: "Published", type: "bool" },
  ],
  destinations: [
    { name: "slug", label: "Slug", type: "text" },
    { name: "name", label: "Name", type: "text" },
    { name: "region", label: "Region", type: "text" },
    { name: "country", label: "Country", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "image", label: "Image URL", type: "text" },
    { name: "best_season", label: "Best season", type: "text" },
    { name: "featured_trips", label: "Featured trips (one per line)", type: "array" },
    { name: "sort_order", label: "Sort", type: "number" },
    { name: "published", label: "Published", type: "bool" },
  ],
  testimonials: [
    { name: "name", label: "Name", type: "text" },
    { name: "location", label: "Location", type: "text" },
    { name: "quote", label: "Quote", type: "textarea" },
    { name: "rating", label: "Rating (1-5)", type: "number" },
    { name: "trip_taken", label: "Trip", type: "text" },
    { name: "sort_order", label: "Sort", type: "number" },
    { name: "published", label: "Published", type: "bool" },
  ],
  faqs: [
    { name: "category", label: "Category (planning|conservation|logistics)", type: "text" },
    { name: "question", label: "Question", type: "text" },
    { name: "answer", label: "Answer", type: "textarea" },
    { name: "sort_order", label: "Sort", type: "number" },
    { name: "published", label: "Published", type: "bool" },
  ],
};

export const Route = createFileRoute("/_authenticated/admin/content/$table")({
  component: ContentAdmin,
});

function ContentAdmin() {
  const { table } = Route.useParams();
  const list = useServerFn(adminList);
  const upsert = useServerFn(adminUpsert);
  const del = useServerFn(adminDelete);
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", table],
    queryFn: () => list({ data: { table: table as any } }),
  });

  const mUpsert = useMutation({
    mutationFn: (row: any) => upsert({ data: { table: table as any, row } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", table] }); toast.success("Saved"); setOpen(false); },
    onError: (e: any) => toast.error(e.message ?? "Error"),
  });
  const mDel = useMutation({
    mutationFn: (id: string) => del({ data: { table: table as any, id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", table] }); toast.success("Deleted"); },
  });

  const fields = SCHEMAS[table] ?? [];

  const startCreate = () => {
    const blank: any = { id: "" };
    fields.forEach((f) => {
      blank[f.name] = f.type === "bool" ? true : f.type === "number" ? 0 : f.type === "array" ? [] : "";
    });
    setEditing(blank);
    setOpen(true);
  };
  const startEdit = (row: any) => {
    setEditing({ ...row });
    setOpen(true);
  };
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const row: any = { ...editing };
    fields.forEach((f) => {
      if (f.type === "number" && row[f.name] !== null && row[f.name] !== "") row[f.name] = Number(row[f.name]);
      if (f.type === "array" && typeof row[f.name] === "string") {
        row[f.name] = (row[f.name] as string).split("\n").map((s) => s.trim()).filter(Boolean);
      }
    });
    mUpsert.mutate(row);
  };

  const titleField = fields[0]?.name === "slug" ? fields[1]?.name : fields[0]?.name;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-3xl">{TABLE_LABELS[table]}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={startCreate} className="bg-gold text-gold-foreground hover:bg-gold/90"><Plus className="w-4 h-4 mr-1" /> New</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "Create"}</DialogTitle></DialogHeader>
            {editing && (
              <form onSubmit={save} className="space-y-4">
                {fields.map((f) => (
                  <div key={f.name}>
                    <Label>{f.label}</Label>
                    {f.type === "textarea" ? (
                      <Textarea rows={4} value={editing[f.name] ?? ""} onChange={(e) => setEditing({ ...editing, [f.name]: e.target.value })} />
                    ) : f.type === "array" ? (
                      <Textarea rows={4} value={Array.isArray(editing[f.name]) ? (editing[f.name] as string[]).join("\n") : editing[f.name] ?? ""} onChange={(e) => setEditing({ ...editing, [f.name]: e.target.value })} />
                    ) : f.type === "bool" ? (
                      <div className="pt-1"><Checkbox checked={!!editing[f.name]} onCheckedChange={(v) => setEditing({ ...editing, [f.name]: !!v })} /></div>
                    ) : f.type === "number" ? (
                      <Input type="number" value={editing[f.name] ?? 0} onChange={(e) => setEditing({ ...editing, [f.name]: e.target.value })} />
                    ) : (
                      <Input value={editing[f.name] ?? ""} onChange={(e) => setEditing({ ...editing, [f.name]: e.target.value })} />
                    )}
                  </div>
                ))}
                <Button type="submit" disabled={mUpsert.isPending} className="w-full">{mUpsert.isPending ? "Saving…" : "Save"}</Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <p>Loading…</p>}
      <div className="bg-background border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream">
            <tr className="text-left text-[11px] tracking-[0.2em] uppercase text-foreground/70">
              <th className="p-3">{titleField}</th>
              <th className="p-3">Published</th>
              <th className="p-3 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {data?.map((row: any) => (
              <tr key={row.id} className="border-t border-border">
                <td className="p-3">{row[titleField!]}</td>
                <td className="p-3">{row.published ? "Yes" : "—"}</td>
                <td className="p-3 text-right">
                  <button onClick={() => startEdit(row)} className="text-foreground/60 hover:text-foreground mr-3"><Pencil className="w-4 h-4 inline" /></button>
                  <button onClick={() => confirm("Delete?") && mDel.mutate(row.id)} className="text-foreground/60 hover:text-destructive"><Trash2 className="w-4 h-4 inline" /></button>
                </td>
              </tr>
            ))}
            {data?.length === 0 && <tr><td colSpan={3} className="p-10 text-center text-foreground/60">No rows.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
