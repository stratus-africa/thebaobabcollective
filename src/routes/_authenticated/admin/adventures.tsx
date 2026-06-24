import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save, Upload, X } from "lucide-react";
import {
  getAdventuresPage,
  saveAdventuresPage,
  type AdventuresPage,
  type AdventuresSignature,
  type AdventuresStyle,
  type AdventuresTerrain,
  adventuresDefaults,
} from "@/lib/adventures.functions";
import { adminUploadImage } from "@/lib/admin.functions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/admin/adventures")({
  component: AdminAdventures,
});

const ICONS = ["Mountain", "Waves", "Sun", "Footprints", "Tent", "Binoculars", "Plane", "Compass"];
const DIFFICULTIES = ["Easy", "Moderate", "Active", "Challenging"];

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function AdminAdventures() {
  const fetchFn = useServerFn(getAdventuresPage);
  const saveFn = useServerFn(saveAdventuresPage);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-adventures-page"],
    queryFn: () => fetchFn(),
  });

  const [draft, setDraft] = useState<AdventuresPage>(adventuresDefaults);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setDraft(data);
  }, [data]);

  async function save() {
    setSaving(true);
    try {
      await saveFn({
        data: {
          hero: draft.hero,
          philosophy: draft.philosophy,
          cta: draft.cta,
          terrains: draft.terrains,
          styles: draft.styles,
          signatures: draft.signatures,
        },
      });
      toast.success("Adventures page saved");
      await refetch();
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-foreground/60">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-10">
      <div className="flex items-start justify-between gap-4 sticky top-0 bg-cream py-4 z-10 border-b border-border/40">
        <div>
          <h1 className="font-serif text-3xl">Adventures page</h1>
          <p className="text-sm text-foreground/60">Live content for /adventures.</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-gold text-gold-foreground uppercase tracking-[0.25em] text-[11px] px-6 py-3 disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
          Save changes
        </button>
      </div>

      {/* Hero */}
      <Card title="Hero">
        <Field label="Eyebrow">
          <Input value={draft.hero.eyebrow} onChange={(e) => setDraft({ ...draft, hero: { ...draft.hero, eyebrow: e.target.value } })} />
        </Field>
        <Field label="Headline">
          <Textarea rows={2} value={draft.hero.headline} onChange={(e) => setDraft({ ...draft, hero: { ...draft.hero, headline: e.target.value } })} />
        </Field>
        <Field label="Subhead">
          <Textarea rows={3} value={draft.hero.subhead} onChange={(e) => setDraft({ ...draft, hero: { ...draft.hero, subhead: e.target.value } })} />
        </Field>
      </Card>

      {/* Philosophy */}
      <Card title="Philosophy">
        <Field label="Eyebrow">
          <Input value={draft.philosophy.eyebrow} onChange={(e) => setDraft({ ...draft, philosophy: { ...draft.philosophy, eyebrow: e.target.value } })} />
        </Field>
        <Field label="Body">
          <Textarea rows={4} value={draft.philosophy.body} onChange={(e) => setDraft({ ...draft, philosophy: { ...draft.philosophy, body: e.target.value } })} />
        </Field>
      </Card>

      {/* CTA */}
      <Card title="Closing CTA">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Eyebrow">
            <Input value={draft.cta.eyebrow} onChange={(e) => setDraft({ ...draft, cta: { ...draft.cta, eyebrow: e.target.value } })} />
          </Field>
          <Field label="Button label">
            <Input value={draft.cta.buttonLabel} onChange={(e) => setDraft({ ...draft, cta: { ...draft.cta, buttonLabel: e.target.value } })} />
          </Field>
        </div>
        <Field label="Headline">
          <Input value={draft.cta.headline} onChange={(e) => setDraft({ ...draft, cta: { ...draft.cta, headline: e.target.value } })} />
        </Field>
        <Field label="Body">
          <Textarea rows={3} value={draft.cta.body} onChange={(e) => setDraft({ ...draft, cta: { ...draft.cta, body: e.target.value } })} />
        </Field>
      </Card>

      {/* Terrains */}
      <ListCard
        title="Terrain tiles"
        items={draft.terrains}
        onChange={(terrains) => setDraft({ ...draft, terrains })}
        empty={{ icon: "Mountain", label: "", note: "" }}
        render={(t, set) => (
          <>
            <Field label="Icon">
              <IconSelect value={t.icon} onChange={(v) => set({ ...t, icon: v })} />
            </Field>
            <Field label="Label">
              <Input value={t.label} onChange={(e) => set({ ...t, label: e.target.value })} />
            </Field>
            <Field label="Note">
              <Input value={t.note} onChange={(e) => set({ ...t, note: e.target.value })} />
            </Field>
          </>
        )}
      />

      {/* Styles */}
      <ListCard
        title="Adventure styles"
        items={draft.styles}
        onChange={(styles) => setDraft({ ...draft, styles })}
        empty={{ icon: "Footprints", title: "", body: "" }}
        render={(s, set) => (
          <>
            <Field label="Icon">
              <IconSelect value={s.icon} onChange={(v) => set({ ...s, icon: v })} />
            </Field>
            <Field label="Title">
              <Input value={s.title} onChange={(e) => set({ ...s, title: e.target.value })} />
            </Field>
            <Field label="Body">
              <Textarea rows={2} value={s.body} onChange={(e) => set({ ...s, body: e.target.value })} />
            </Field>
          </>
        )}
      />

      {/* Signature itineraries */}
      <ListCard
        title="Signature itineraries"
        items={draft.signatures}
        onChange={(signatures) => setDraft({ ...draft, signatures })}
        empty={{
          slug: "",
          name: "",
          region: "",
          terrain: "",
          nights: "",
          difficulty: "Moderate",
          image: "",
          description: "",
          highlights: [],
        }}
        render={(s, set) => (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Name">
                <Input value={s.name} onChange={(e) => set({ ...s, name: e.target.value, slug: s.slug || slugify(e.target.value) })} />
              </Field>
              <Field label="Slug (matches /itineraries/$slug)">
                <Input value={s.slug} onChange={(e) => set({ ...s, slug: e.target.value })} />
              </Field>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <Field label="Region">
                <Input value={s.region} onChange={(e) => set({ ...s, region: e.target.value })} />
              </Field>
              <Field label="Terrain">
                <Input value={s.terrain} onChange={(e) => set({ ...s, terrain: e.target.value })} />
              </Field>
              <Field label="Nights">
                <Input value={s.nights} onChange={(e) => set({ ...s, nights: e.target.value })} placeholder="8 nights" />
              </Field>
            </div>
            <Field label="Difficulty">
              <select
                value={s.difficulty}
                onChange={(e) => set({ ...s, difficulty: e.target.value })}
                className="h-10 bg-background border border-border px-3 text-sm w-full"
              >
                {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Image">
              <ImageUpload value={s.image} onChange={(url) => set({ ...s, image: url })} />
            </Field>
            <Field label="Description">
              <Textarea rows={3} value={s.description} onChange={(e) => set({ ...s, description: e.target.value })} />
            </Field>
            <Field label="Highlights (one per line)">
              <Textarea
                rows={4}
                value={(s.highlights ?? []).join("\n")}
                onChange={(e) => set({ ...s, highlights: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) })}
              />
            </Field>
          </>
        )}
      />
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-background border border-border/50 p-6 md:p-8 space-y-4">
      <h2 className="font-serif text-2xl">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block text-[11px] tracking-[0.2em] uppercase text-foreground/60">{label}</Label>
      {children}
    </div>
  );
}

function IconSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 bg-background border border-border px-3 text-sm w-full"
    >
      {ICONS.map((i) => <option key={i}>{i}</option>)}
    </select>
  );
}

function ListCard<T extends object>({
  title,
  items,
  onChange,
  empty,
  render,
}: {
  title: string;
  items: T[];
  onChange: (items: T[]) => void;
  empty: T;
  render: (item: T, set: (next: T) => void) => React.ReactNode;
}) {
  const setAt = (idx: number, next: T) => {
    const copy = items.slice();
    copy[idx] = next;
    onChange(copy);
  };
  const removeAt = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <section className="bg-background border border-border/50 p-6 md:p-8 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl">{title}</h2>
        <button
          onClick={() => onChange([...items, structuredClone(empty)])}
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] border border-gold text-gold px-4 py-2 hover:bg-gold hover:text-gold-foreground"
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>
      <div className="space-y-6">
        {items.map((item, idx) => (
          <div key={idx} className="border border-border/40 p-5 space-y-3 bg-cream/40">
            <div className="flex justify-between items-center">
              <span className="text-[11px] uppercase tracking-[0.2em] text-foreground/60">Item {idx + 1}</span>
              <button onClick={() => removeAt(idx)} className="text-foreground/60 hover:text-terracotta">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            {render(item, (next) => setAt(idx, next))}
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-foreground/60 italic">No items yet.</p>
        )}
      </div>
    </section>
  );
}

function ImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const upload = useServerFn(adminUploadImage);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function pick(file: File) {
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp|gif|avif)/i.test(file.type)) {
      toast.error("Choose a PNG, JPG, WEBP, GIF, or AVIF image.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be smaller than 8MB");
      return;
    }
    setBusy(true);
    try {
      const buf = new Uint8Array(await file.arrayBuffer());
      let binary = "";
      for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
      const res = await upload({
        data: {
          filename: file.name,
          contentType: file.type || "image/jpeg",
          base64: btoa(binary),
        },
      });
      onChange(res.url);
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex items-start gap-4">
      <div className="w-28 h-20 border border-border rounded-md bg-cream overflow-hidden flex items-center justify-center shrink-0">
        {value ? <img src={value} alt="" className="w-full h-full object-cover" /> : <span className="text-xs text-foreground/40">No image</span>}
      </div>
      <div className="flex flex-col gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-md border border-border hover:bg-muted disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {value ? "Replace" : "Upload"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md border border-border text-foreground/70 hover:bg-muted"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
        <p className="text-xs text-foreground/55">Stored privately and served via signed URL.</p>
      </div>
    </div>
  );
}

// Silence type imports
void (null as unknown as AdventuresTerrain | AdventuresStyle | AdventuresSignature);
