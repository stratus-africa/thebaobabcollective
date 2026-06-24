import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPageContent, savePageContent } from "@/lib/page-content.functions";
import { adminUploadImage } from "@/lib/admin.functions";
import { PAGE_DEFAULTS, mergePageContent, type PageKey } from "@/lib/page-content.defaults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Image as ImageIcon, Loader2, RefreshCw, Upload, X, ExternalLink, Save } from "lucide-react";

type FieldDef = { name: string; label: string; type: "text" | "textarea" | "image"; placeholder?: string };

const SCHEMAS: Record<PageKey, { title: string; description: string; preview: string; fields: FieldDef[] }> = {
  home: {
    title: "Home Page",
    description: "Hero copy, CTAs and the imagery shown on the homepage.",
    preview: "/",
    fields: [
      { name: "hero_image_url", label: "Hero Background Image", type: "image" },
      { name: "hero_title_line1", label: "Hero Title — Line 1", type: "text", placeholder: "JOURNEYS" },
      { name: "hero_title_line2", label: "Hero Title — Line 2", type: "text", placeholder: "THAT CONNECT" },
      { name: "hero_subtitle", label: "Hero Subtitle", type: "textarea" },
      { name: "hero_cta_primary", label: "Primary CTA Label", type: "text" },
      { name: "hero_cta_secondary", label: "Secondary CTA Label", type: "text" },
      { name: "hero_proof_text", label: "Social Proof Text", type: "text" },
    ],
  },
  about: {
    title: "About Section",
    description: "The About block shown on the homepage and About page.",
    preview: "/about",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title_line1", label: "Title — Line 1", type: "text" },
      { name: "title_line2", label: "Title — Line 2", type: "text" },
      { name: "title_line3", label: "Title — Line 3", type: "text" },
      { name: "body", label: "Body Paragraph", type: "textarea" },
      { name: "cta_label", label: "CTA Label", type: "text" },
      { name: "image_left_url", label: "Image — Left", type: "image" },
      { name: "image_right_url", label: "Image — Right", type: "image" },
    ],
  },
  private_travel: {
    title: "Private Travel Page",
    description: "Headline, subtitle and confirmation copy for the bespoke travel form.",
    preview: "/private-travel",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Page Title", type: "text" },
      { name: "subtitle", label: "Page Subtitle", type: "textarea" },
      { name: "submit_label", label: "Submit Button Label", type: "text" },
      { name: "success_title", label: "Success Title", type: "text" },
      { name: "success_body", label: "Success Body", type: "textarea" },
    ],
  },
};

const VALID_KEYS = Object.keys(SCHEMAS) as PageKey[];

export const Route = createFileRoute("/_authenticated/admin/pages/$page")({
  beforeLoad: ({ params }) => {
    if (!VALID_KEYS.includes(params.page as PageKey)) throw notFound();
  },
  component: PageEditor,
});

function PageEditor() {
  const { page } = Route.useParams() as { page: PageKey };
  const fetchFn = useServerFn(getPageContent);
  const saveFn = useServerFn(savePageContent);
  const qc = useQueryClient();
  const schema = SCHEMAS[page];

  const { data, isLoading } = useQuery({
    queryKey: ["page-content", page],
    queryFn: () => fetchFn({ data: { key: page } }),
  });

  const [draft, setDraft] = useState<Record<string, any>>(() => mergePageContent(page, null));

  useEffect(() => {
    setDraft(mergePageContent(page, data ?? null));
  }, [page, data]);

  const mSave = useMutation({
    mutationFn: () => saveFn({ data: { key: page, value: draft } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["page-content", page] });
      toast.success("Page content saved");
    },
    onError: (e: any) => toast.error(e.message ?? "Could not save"),
  });

  function reset() {
    if (!confirm("Reset all fields on this page to defaults? This will overwrite the current saved version when you click Save.")) return;
    setDraft({ ...PAGE_DEFAULTS[page] });
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl">{schema.title}</h1>
          <p className="text-sm text-foreground/60 mt-1">{schema.description}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to={schema.preview} target="_blank">
              <ExternalLink className="w-4 h-4 mr-1" /> Preview
            </Link>
          </Button>
          <Button variant="outline" onClick={reset}>
            <RefreshCw className="w-4 h-4 mr-1" /> Reset to defaults
          </Button>
          <Button
            onClick={() => mSave.mutate()}
            disabled={mSave.isPending || isLoading}
            className="bg-gold text-gold-foreground hover:bg-gold/90"
          >
            {mSave.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            Save
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-background border border-border p-10 text-center text-foreground/60">
          <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Loading…
        </div>
      ) : (
        <div className="bg-background border border-border p-6 space-y-5">
          {schema.fields.map((f) => (
            <FieldRow
              key={f.name}
              field={f}
              value={draft[f.name] ?? ""}
              onChange={(v) => setDraft((d) => ({ ...d, [f.name]: v }))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FieldRow({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: any;
  onChange: (v: any) => void;
}) {
  if (field.type === "image") {
    return <ImageField label={field.label} value={value ?? ""} onChange={onChange} />;
  }
  return (
    <div>
      <Label className="mb-1.5 block">{field.label}</Label>
      {field.type === "textarea" ? (
        <Textarea
          rows={4}
          value={value ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <Input value={value ?? ""} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const upload = useServerFn(adminUploadImage);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp|gif|avif)$/i.test(file.type)) {
      setError("Choose a PNG, JPG, WEBP, GIF, or AVIF image.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Image must be under 8MB.");
      return;
    }
    setUploading(true);
    try {
      const reader = new FileReader();
      const payload = await new Promise<{ base64: string; contentType: string; filename: string }>(
        (resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(",")[1] ?? "";
            resolve({ base64, contentType: file.type || "image/jpeg", filename: file.name });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        },
      );
      const res = await upload({ data: payload });
      onChange(res.url);
      toast.success("Image uploaded");
    } catch (e: any) {
      setError(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      <div className="border border-border bg-cream/30">
        {value ? (
          <div className="relative group">
            <img src={value} alt="Preview" className="w-full max-h-72 object-cover" />
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <UploadButton onPick={handleFile} disabled={uploading} variant="replace" />
              <button
                type="button"
                onClick={() => onChange("")}
                className="bg-background/95 border border-border px-2 py-1 text-xs inline-flex items-center gap-1 hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 flex flex-col items-center justify-center gap-2 text-foreground/50">
            <ImageIcon className="w-8 h-8" />
            <UploadButton onPick={handleFile} disabled={uploading} variant="upload" />
            <p className="text-[11px]">PNG, JPG, WEBP up to 8MB</p>
          </div>
        )}
      </div>
      <Input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="…or paste an image URL"
        className="text-xs mt-2"
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      {uploading && (
        <p className="text-xs text-foreground/60 mt-1 flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" /> Uploading…
        </p>
      )}
    </div>
  );
}

function UploadButton({
  onPick,
  disabled,
  variant,
}: {
  onPick: (f: File | undefined) => void;
  disabled?: boolean;
  variant: "upload" | "replace";
}) {
  return (
    <label
      className={`inline-flex items-center gap-1 text-xs cursor-pointer px-3 py-1.5 border ${
        variant === "replace"
          ? "bg-background/95 border-border hover:bg-cream"
          : "bg-gold text-gold-foreground border-gold hover:bg-gold/90"
      } ${disabled ? "opacity-50 cursor-wait" : ""}`}
    >
      {variant === "replace" ? <RefreshCw className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
      {variant === "replace" ? "Replace" : "Choose image"}
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        className="hidden"
        disabled={disabled}
        onChange={(e) => onPick(e.target.files?.[0])}
      />
    </label>
  );
}
