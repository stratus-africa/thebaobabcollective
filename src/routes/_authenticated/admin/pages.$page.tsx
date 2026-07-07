import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPageContent, savePageContent } from "@/lib/page-content.functions";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { PageLivePreview } from "@/components/admin/PageLivePreview";
import { PAGE_DEFAULTS, mergePageContent, type PageKey } from "@/lib/page-content.defaults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, RefreshCw, ExternalLink, Save, Eye, EyeOff, ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";

// Pages whose fields group by index (image_1_*, image_2_* ...) and support reordering.
const REORDER_GROUPS: Partial<Record<PageKey, { count: number; suffixes: string[]; label: (i: number) => string }>> = {
  about_team: {
    count: 4,
    suffixes: ["url", "name", "role", "bio"],
    label: (i) => `Member ${i}`,
  },
  home_instagram: {
    count: 7,
    suffixes: ["url", "caption"],
    label: (i) => `Photo ${i}`,
  },
};

// Reorder all group values by applying an old->new index permutation.
// order[newPos-1] = oldPos (1-indexed).
function reorderGroup(
  draft: Record<string, any>,
  suffixes: string[],
  order: number[],
): Record<string, any> {
  const next = { ...draft };
  for (const s of suffixes) {
    const snapshot: Record<number, any> = {};
    for (let i = 1; i <= order.length; i++) {
      snapshot[i] = draft[`image_${i}_${s}`];
    }
    for (let newPos = 1; newPos <= order.length; newPos++) {
      const oldPos = order[newPos - 1];
      next[`image_${newPos}_${s}`] = snapshot[oldPos];
    }
  }
  return next;
}


type FieldDef = {
  name: string;
  label: string;
  type: "text" | "textarea" | "image" | "boolean";
  placeholder?: string;
};

const SCHEMAS: Record<PageKey, { title: string; description: string; preview: string; fields: FieldDef[] }> = {
  home: {
    title: "Home — Hero",
    description: "Hero copy, CTAs and background image on the homepage.",
    preview: "/",
    fields: [
      { name: "hero_image_url", label: "Hero Background Image", type: "image" },
      { name: "hero_title_line1", label: "Hero Title — Line 1", type: "text", placeholder: "JOURNEYS" },
      { name: "hero_title_line2", label: "Hero Title — Line 2", type: "text", placeholder: "THAT CONNECT" },
      { name: "hero_subtitle", label: "Hero Subtitle", type: "textarea" },
      { name: "hero_cta_primary", label: "Primary CTA Label", type: "text" },
      { name: "hero_cta_secondary", label: "Secondary CTA Label", type: "text" },
      { name: "hero_proof_text", label: "Social Proof Text", type: "text" },
      { name: "hero_image_as_background", label: "Use Hero Image as Full Background", type: "boolean" },
      { name: "hero_hide_search", label: "Hide Search Filter", type: "boolean" },
      { name: "hero_focal_x", label: "Hero focal point — Horizontal (0=left, 100=right)", type: "text", placeholder: "50" },
      { name: "hero_focal_y", label: "Hero focal point — Vertical (0=top, 100=bottom)", type: "text", placeholder: "50" },
      { name: "hero_bg_size", label: "Background size ('cover' or 'contain')", type: "text", placeholder: "cover" },
    ],
  },
  about: {
    title: "About Block",
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
  about_mission: {
    title: "About — Mission",
    description: "Mission section on the About page.",
    preview: "/about",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "body", label: "Body", type: "textarea" },
    ],
  },
  about_values: {
    title: "About — Values",
    description: "The four values shown on the About page.",
    preview: "/about",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "value_1_title", label: "Value 1 — Title", type: "text" },
      { name: "value_1_body", label: "Value 1 — Body", type: "textarea" },
      { name: "value_2_title", label: "Value 2 — Title", type: "text" },
      { name: "value_2_body", label: "Value 2 — Body", type: "textarea" },
      { name: "value_3_title", label: "Value 3 — Title", type: "text" },
      { name: "value_3_body", label: "Value 3 — Body", type: "textarea" },
      { name: "value_4_title", label: "Value 4 — Title", type: "text" },
      { name: "value_4_body", label: "Value 4 — Body", type: "textarea" },
    ],
  },
  about_team: {
    title: "About — Team",
    description: "Team intro and photos shown on the About page. Use the arrows to reorder members.",
    preview: "/about",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "body", label: "Body", type: "textarea" },
      { name: "image_1_url", label: "Member 1 — Photo", type: "image" },
      { name: "image_1_name", label: "Member 1 — Name", type: "text" },
      { name: "image_1_role", label: "Member 1 — Role", type: "text" },
      { name: "image_1_bio", label: "Member 1 — Brief Bio", type: "textarea" },
      { name: "image_2_url", label: "Member 2 — Photo", type: "image" },
      { name: "image_2_name", label: "Member 2 — Name", type: "text" },
      { name: "image_2_role", label: "Member 2 — Role", type: "text" },
      { name: "image_2_bio", label: "Member 2 — Brief Bio", type: "textarea" },
      { name: "image_3_url", label: "Member 3 — Photo", type: "image" },
      { name: "image_3_name", label: "Member 3 — Name", type: "text" },
      { name: "image_3_role", label: "Member 3 — Role", type: "text" },
      { name: "image_3_bio", label: "Member 3 — Brief Bio", type: "textarea" },
      { name: "image_4_url", label: "Member 4 — Photo", type: "image" },
      { name: "image_4_name", label: "Member 4 — Name", type: "text" },
      { name: "image_4_role", label: "Member 4 — Role", type: "text" },
      { name: "image_4_bio", label: "Member 4 — Brief Bio", type: "textarea" },
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
  home_adventures: {
    title: "Home — Adventures Strip",
    description: "The Adventures strip on the homepage.",
    preview: "/",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "body", label: "Body", type: "textarea" },
      { name: "cta_label", label: "CTA Label", type: "text" },
    ],
  },
  home_destinations: {
    title: "Home — Destinations Strip",
    description: "The Destinations strip on the homepage.",
    preview: "/",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "body", label: "Body", type: "textarea" },
      { name: "cta_label", label: "CTA Label", type: "text" },
    ],
  },
  home_lodges: {
    title: "Home — Lodges Strip",
    description: "The Lodges strip on the homepage.",
    preview: "/",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "body", label: "Body", type: "textarea" },
      { name: "cta_label", label: "CTA Label", type: "text" },
    ],
  },
  home_journal: {
    title: "Home — Journal Strip",
    description: "The 'Stories. Guidance. Inspiration.' block on the homepage.",
    preview: "/",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title_line1", label: "Title — Line 1", type: "text" },
      { name: "title_line2", label: "Title — Line 2", type: "text" },
      { name: "title_line3", label: "Title — Line 3", type: "text" },
      { name: "body", label: "Body", type: "textarea" },
      { name: "cta_label", label: "CTA Label", type: "text" },
    ],
  },
  home_instagram: {
    title: "Home — Instagram Strip",
    description: "Handle, heading, and the 7 thumbnails. Use ↑/↓ to reorder photos.",
    preview: "/",
    fields: [
      { name: "heading", label: "Heading", type: "text" },
      { name: "handle", label: "Instagram Handle", type: "text" },
      { name: "url", label: "Instagram URL", type: "text" },
      { name: "image_1_url", label: "Photo 1", type: "image" },
      { name: "image_1_caption", label: "Photo 1 — Caption", type: "text" },
      { name: "image_2_url", label: "Photo 2", type: "image" },
      { name: "image_2_caption", label: "Photo 2 — Caption", type: "text" },
      { name: "image_3_url", label: "Photo 3", type: "image" },
      { name: "image_3_caption", label: "Photo 3 — Caption", type: "text" },
      { name: "image_4_url", label: "Photo 4", type: "image" },
      { name: "image_4_caption", label: "Photo 4 — Caption", type: "text" },
      { name: "image_5_url", label: "Photo 5", type: "image" },
      { name: "image_5_caption", label: "Photo 5 — Caption", type: "text" },
      { name: "image_6_url", label: "Photo 6", type: "image" },
      { name: "image_6_caption", label: "Photo 6 — Caption", type: "text" },
      { name: "image_7_url", label: "Photo 7", type: "image" },
      { name: "image_7_caption", label: "Photo 7 — Caption", type: "text" },
    ],
  },


  top_bar: {
    title: "Top Announcement Bar",
    description: "The dark bar at the very top of every page.",
    preview: "/",
    fields: [
      { name: "enabled", label: "Show top bar", type: "boolean" },
      { name: "text", label: "Announcement Text", type: "text" },
    ],
  },
  contact: {
    title: "Contact Page",
    description: "All copy on the /contact page.",
    preview: "/contact",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title_line1", label: "Title — Line 1", type: "text" },
      { name: "title_line2", label: "Title — Line 2", type: "text" },
      { name: "body", label: "Intro Paragraph", type: "textarea" },
      { name: "form_title", label: "Form Card Title", type: "text" },
      { name: "form_intro", label: "Form Card Intro", type: "textarea" },
      { name: "form_cta", label: "Form CTA Button", type: "text" },
      { name: "instagram_url", label: "Instagram URL", type: "text" },
      { name: "instagram_handle", label: "Instagram Handle", type: "text" },
      { name: "facebook_url", label: "Facebook URL", type: "text" },
      { name: "facebook_handle", label: "Facebook Handle", type: "text" },
    ],
  },
  lodges_index: {
    title: "Lodges — Landing",
    description: "Intro band on the /lodges listing page.",
    preview: "/lodges",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "textarea" },
    ],
  },
  adventures_index: {
    title: "Adventures — Landing",
    description: "Intro band on the /adventures listing page.",
    preview: "/adventures",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "textarea" },
    ],
  },
  detail_journey: {
    title: "Adventure Detail Template",
    description: "Shared copy across all adventure detail (itinerary) pages.",
    preview: "/adventures",
    fields: [
      { name: "intro_eyebrow", label: "Intro Eyebrow", type: "text" },
      { name: "enquire_cta", label: "Enquire CTA Label", type: "text" },
      { name: "related_title", label: "Related Section Title", type: "text" },
    ],
  },

  detail_lodge: {
    title: "Lodge Detail Template",
    description: "Shared copy across all lodge detail pages.",
    preview: "/lodges",
    fields: [
      { name: "intro_eyebrow", label: "Intro Eyebrow", type: "text" },
      { name: "enquire_cta", label: "Enquire CTA Label", type: "text" },
      { name: "related_title", label: "Related Section Title", type: "text" },
    ],
  },
  footer: {
    title: "Footer",
    description: "Newsletter copy, contact heading, and copyright line. Footer columns are managed under Menu & Navigation.",
    preview: "/",
    fields: [
      { name: "contact_heading", label: "Contact Column Heading", type: "text" },
      { name: "newsletter_title", label: "Newsletter Heading", type: "text" },
      { name: "newsletter_body", label: "Newsletter Body", type: "textarea" },
      { name: "newsletter_placeholder", label: "Email Input Placeholder", type: "text" },
      { name: "copyright", label: "Copyright Line ({year} auto-fills)", type: "text" },
    ],
  },
  not_found: {
    title: "404 Page",
    description: "The 'page not found' screen.",
    preview: "/__notfound__",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "body", label: "Body", type: "textarea" },
      { name: "cta_label", label: "CTA Label", type: "text" },
    ],
  },
  auth_page: {
    title: "Admin Sign-in Page",
    description: "Copy on the admin sign-in form.",
    preview: "/auth",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "textarea" },
      { name: "email_label", label: "Email Label", type: "text" },
      { name: "password_label", label: "Password Label", type: "text" },
      { name: "submit_label", label: "Submit Button Label", type: "text" },
    ],
  },
  seo: {
    title: "Global SEO Defaults",
    description: "Site-wide title, description, and social share image defaults.",
    preview: "/",
    fields: [
      { name: "site_name", label: "Site Name", type: "text" },
      { name: "default_title", label: "Default Page Title", type: "text" },
      { name: "default_description", label: "Default Meta Description", type: "textarea" },
      { name: "default_og_image", label: "Default Social Share Image", type: "image" },
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
  const [showPreview, setShowPreview] = useState(false);

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

  const previewablePath = schema.preview.startsWith("/__") ? "/does-not-exist-preview" : schema.preview;
  const drafts = { [page]: draft };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl">{schema.title}</h1>
          <p className="text-sm text-foreground/60 mt-1">{schema.description}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setShowPreview((v) => !v)}>
            {showPreview ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {showPreview ? "Hide preview" : "Show preview"}
          </Button>
          <Button asChild variant="outline">
            <Link to={schema.preview} target="_blank">
              <ExternalLink className="w-4 h-4 mr-1" /> Open
            </Link>
          </Button>
          <Button variant="outline" onClick={reset}>
            <RefreshCw className="w-4 h-4 mr-1" /> Reset
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

      <div className={showPreview ? "grid grid-cols-1 xl:grid-cols-[minmax(0,480px)_1fr] gap-6" : ""}>
        <div>
          {isLoading ? (
            <div className="bg-background border border-border p-10 text-center text-foreground/60">
              <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Loading…
            </div>
          ) : REORDER_GROUPS[page] ? (
            <div className="bg-background border border-border p-6 space-y-5">
              {schema.fields
                .filter((f) => !/^image_\d+_/.test(f.name))
                .map((f) => (
                  <FieldRow
                    key={f.name}
                    field={f}
                    value={draft[f.name] ?? (f.type === "boolean" ? false : "")}
                    onChange={(v) => setDraft((d) => ({ ...d, [f.name]: v }))}
                  />
                ))}
              <ReorderableGroups
                page={page}
                group={REORDER_GROUPS[page]!}
                schema={schema}
                draft={draft}
                setDraft={setDraft}
                onReorderCommit={(next) => {
                  // Persist immediately so the public page updates without a manual Save.
                  saveFn({ data: { key: page, value: next } })
                    .then(() => {
                      qc.invalidateQueries({ queryKey: ["page-content", page] });
                      toast.success("Order saved");
                    })
                    .catch((e: any) => toast.error(e?.message ?? "Could not save order"));
                }}
              />
            </div>
          ) : (
            <div className="bg-background border border-border p-6 space-y-5">
              {schema.fields.map((f) => (
                <FieldRow
                  key={f.name}
                  field={f}
                  value={draft[f.name] ?? (f.type === "boolean" ? false : "")}
                  onChange={(v) => setDraft((d) => ({ ...d, [f.name]: v }))}
                />
              ))}
            </div>
          )}

        </div>
        {showPreview && (
          <div className="min-h-[600px]">
            <PageLivePreview path={previewablePath} drafts={drafts} />
          </div>
        )}
      </div>
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
    return <ImageUploader label={field.label} value={value ?? ""} onChange={onChange} />;
  }
  if (field.type === "boolean") {
    return (
      <div className="flex items-center justify-between gap-4 py-2">
        <Label>{field.label}</Label>
        <Switch checked={!!value} onCheckedChange={onChange} />
      </div>
    );
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

function ReorderableGroups({
  page,
  group,
  schema,
  draft,
  setDraft,
  onReorderCommit,
}: {
  page: PageKey;
  group: { count: number; suffixes: string[]; label: (i: number) => string };
  schema: { fields: FieldDef[] };
  draft: Record<string, any>;
  setDraft: (fn: (d: Record<string, any>) => Record<string, any>) => void;
  onReorderCommit: (next: Record<string, any>) => void;
}) {
  const ids = Array.from({ length: group.count }, (_, k) => `slot-${k + 1}`);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    // On touch devices, require a short hold before dragging so vertical page
    // scrolling still works when the user swipes over a slot.
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const commit = (nextDraft: Record<string, any>) => {
    setDraft(() => nextDraft);
    onReorderCommit(nextDraft);
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 1 || j > group.count) return;
    const order = Array.from({ length: group.count }, (_, k) => k + 1);
    [order[i - 1], order[j - 1]] = [order[j - 1], order[i - 1]];
    commit(reorderGroup(draft, group.suffixes, order));
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = ids.indexOf(String(active.id));
    const newIdx = ids.indexOf(String(over.id));
    if (oldIdx < 0 || newIdx < 0) return;
    const baseOrder = Array.from({ length: group.count }, (_, k) => k + 1);
    const nextOrder = arrayMove(baseOrder, oldIdx, newIdx);
    commit(reorderGroup(draft, group.suffixes, nextOrder));
  };

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      <p className="text-[11px] tracking-[0.2em] uppercase text-foreground/60">
        Items — drag the handle to reorder (or use ↑/↓). Changes save automatically.
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {ids.map((id, idx) => {
              const i = idx + 1;
              const fields = group.suffixes
                .map((s) => schema.fields.find((f) => f.name === `image_${i}_${s}`))
                .filter(Boolean) as FieldDef[];
              return (
                <SortableItem
                  key={id}
                  id={id}
                  label={group.label(i)}
                  canUp={i > 1}
                  canDown={i < group.count}
                  onUp={() => move(i, -1)}
                  onDown={() => move(i, 1)}
                >
                  {fields.map((f) => (
                    <FieldRow
                      key={f.name}
                      field={f}
                      value={draft[f.name] ?? ""}
                      onChange={(v) => setDraft((d) => ({ ...d, [f.name]: v }))}
                    />
                  ))}
                </SortableItem>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableItem({
  id,
  label,
  canUp,
  canDown,
  onUp,
  onDown,
  children,
}: {
  id: string;
  label: string;
  canUp: boolean;
  canDown: boolean;
  onUp: () => void;
  onDown: () => void;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : "auto",
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-border rounded-md p-4 bg-cream/30 space-y-3"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing touch-none select-none text-foreground/60 hover:text-foreground bg-background border border-border rounded-md h-10 w-10 md:h-9 md:w-9 flex items-center justify-center"
            aria-label={`Drag ${label} to reorder`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-5 h-5" />
          </button>
          <p className="font-medium text-sm">{label}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button type="button" size="icon" variant="outline" onClick={onUp} disabled={!canUp} aria-label="Move up" className="h-10 w-10 md:h-9 md:w-9">
            <ArrowUp className="w-4 h-4" />
          </Button>
          <Button type="button" size="icon" variant="outline" onClick={onDown} disabled={!canDown} aria-label="Move down" className="h-10 w-10 md:h-9 md:w-9">
            <ArrowDown className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}



