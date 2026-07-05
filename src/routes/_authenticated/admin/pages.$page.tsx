import { useEffect, useState } from "react";
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
import { Loader2, RefreshCw, ExternalLink, Save, Eye, EyeOff } from "lucide-react";

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
    description: "Team intro section on the About page.",
    preview: "/about",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "body", label: "Body", type: "textarea" },
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
  home_journeys: {
    title: "Home — Journeys Strip",
    description: "The 'Our Journeys' section on the homepage.",
    preview: "/",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "body", label: "Body", type: "textarea" },
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
    description: "Handle and heading shown on the Instagram section.",
    preview: "/",
    fields: [
      { name: "heading", label: "Heading", type: "text" },
      { name: "handle", label: "Instagram Handle", type: "text" },
      { name: "url", label: "Instagram URL", type: "text" },
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
  journeys_index: {
    title: "Journeys — Landing",
    description: "Intro band on the /journeys listing page.",
    preview: "/journeys",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "textarea" },
    ],
  },
  destinations_index: {
    title: "Destinations — Landing",
    description: "Intro band on the /destinations listing page.",
    preview: "/destinations",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "textarea" },
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
    title: "Journey Detail Template",
    description: "Shared copy across all journey detail pages.",
    preview: "/journeys",
    fields: [
      { name: "intro_eyebrow", label: "Intro Eyebrow", type: "text" },
      { name: "enquire_cta", label: "Enquire CTA Label", type: "text" },
      { name: "related_title", label: "Related Section Title", type: "text" },
    ],
  },
  detail_adventure: {
    title: "Adventure Detail Template",
    description: "Shared copy across all adventure detail pages.",
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
  detail_destination: {
    title: "Destination Detail Template",
    description: "Shared copy across all destination detail pages.",
    preview: "/destinations",
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
  const [showPreview, setShowPreview] = useState(true);

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
