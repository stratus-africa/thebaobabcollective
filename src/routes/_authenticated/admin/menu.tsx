import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMenuConfig, saveMenuConfig, MENU_DEFAULTS, type MenuConfig } from "@/lib/menu.functions";
import { MENU_CONFIG_QUERY_KEY } from "@/hooks/useMenuConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save, Plus, Trash2, ChevronUp, ChevronDown, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/menu")({
  component: MenuEditor,
});

function MenuEditor() {
  const fetchFn = useServerFn(getMenuConfig);
  const saveFn = useServerFn(saveMenuConfig);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin", "menu_config"], queryFn: () => fetchFn() });
  const [draft, setDraft] = useState<MenuConfig>(MENU_DEFAULTS);

  useEffect(() => {
    if (data) setDraft({ ...MENU_DEFAULTS, ...data });
  }, [data]);

  const mSave = useMutation({
    mutationFn: () => saveFn({ data: draft }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "menu_config"] });
      qc.invalidateQueries({ queryKey: MENU_CONFIG_QUERY_KEY });
      toast.success("Menu saved");
    },
    onError: (e: any) => toast.error(e.message ?? "Could not save"),
  });

  function reset() {
    if (!confirm("Reset the menu to defaults? Save to apply.")) return;
    setDraft(MENU_DEFAULTS);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl">Menu &amp; Navigation</h1>
          <p className="text-sm text-foreground/60 mt-1">Edit the main menu, submenus, CTA and footer links. Save to see changes in the preview.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reset}><RefreshCw className="w-4 h-4 mr-1" /> Reset</Button>
          <Button onClick={() => mSave.mutate()} disabled={mSave.isPending || isLoading} className="bg-gold text-gold-foreground hover:bg-gold/90">
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
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,600px)] gap-6">
        <div className="space-y-8">
          {/* Top bar */}
          <Section title="Top Announcement Bar">
            <div className="flex items-center gap-3 mb-3">
              <Switch checked={draft.topBarEnabled} onCheckedChange={(v) => setDraft({ ...draft, topBarEnabled: v })} />
              <Label>Show top bar</Label>
            </div>
            <Label>Text</Label>
            <Input value={draft.topBarText} onChange={(e) => setDraft({ ...draft, topBarText: e.target.value })} />
          </Section>

          <Section title="Header Style">
            <div className="flex items-center gap-3">
              <Switch
                checked={draft.transparentOverHero}
                onCheckedChange={(v) => setDraft({ ...draft, transparentOverHero: v })}
              />
              <Label>Overlay menu on hero (clear background)</Label>
            </div>
            <p className="text-xs text-foreground/60 mt-2">
              When enabled, the main menu floats on top of hero sections with a transparent background across all pages.
            </p>
          </Section>


          {/* Primary nav */}
          <Section title="Main Navigation">
            <ItemList
              items={draft.primary}
              onChange={(items) => setDraft({ ...draft, primary: items })}
              allowChildren
            />
          </Section>

          {/* More dropdown */}
          <Section title="'More' Dropdown">
            <ItemList
              items={draft.more}
              onChange={(items) => setDraft({ ...draft, more: items })}
            />
          </Section>

          {/* CTA */}
          <Section title="Header CTA Button">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Label</Label>
                <Input value={draft.ctaLabel} onChange={(e) => setDraft({ ...draft, ctaLabel: e.target.value })} />
              </div>
              <div>
                <Label>Link URL <span className="text-foreground/50">(leave blank to open Enquire dialog)</span></Label>
                <Input value={draft.ctaTo} placeholder="/contact" onChange={(e) => setDraft({ ...draft, ctaTo: e.target.value })} />
              </div>
            </div>
          </Section>

          {/* Footer columns */}
          <Section title="Footer">
            <Label>Footer tagline</Label>
            <Input
              value={draft.footerTagline}
              onChange={(e) => setDraft({ ...draft, footerTagline: e.target.value })}
              className="mb-6"
            />
            <div className="space-y-6">
              {draft.footerColumns.map((col, idx) => (
                <div key={idx} className="border border-border rounded p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Input
                      value={col.heading}
                      onChange={(e) => {
                        const cols = [...draft.footerColumns];
                        cols[idx] = { ...cols[idx], heading: e.target.value };
                        setDraft({ ...draft, footerColumns: cols });
                      }}
                      placeholder="Column heading"
                      className="max-w-sm"
                    />
                    <Button variant="ghost" size="sm" onClick={() => {
                      const cols = draft.footerColumns.filter((_, i) => i !== idx);
                      setDraft({ ...draft, footerColumns: cols });
                    }}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                  <div className="space-y-2">
                    {col.links.map((l, li) => (
                      <div key={li} className="flex gap-2 items-center">
                        <Input
                          value={l.label}
                          placeholder="Label"
                          onChange={(e) => {
                            const cols = [...draft.footerColumns];
                            const links = [...cols[idx].links];
                            links[li] = { ...links[li], label: e.target.value };
                            cols[idx] = { ...cols[idx], links };
                            setDraft({ ...draft, footerColumns: cols });
                          }}
                        />
                        <Input
                          value={l.to}
                          placeholder="/path"
                          onChange={(e) => {
                            const cols = [...draft.footerColumns];
                            const links = [...cols[idx].links];
                            links[li] = { ...links[li], to: e.target.value };
                            cols[idx] = { ...cols[idx], links };
                            setDraft({ ...draft, footerColumns: cols });
                          }}
                        />
                        <Button variant="ghost" size="sm" onClick={() => {
                          const cols = [...draft.footerColumns];
                          const links = cols[idx].links.filter((_, i) => i !== li);
                          cols[idx] = { ...cols[idx], links };
                          setDraft({ ...draft, footerColumns: cols });
                        }}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => {
                      const cols = [...draft.footerColumns];
                      cols[idx] = { ...cols[idx], links: [...cols[idx].links, { label: "New link", to: "/" }] };
                      setDraft({ ...draft, footerColumns: cols });
                    }}><Plus className="w-4 h-4 mr-1" /> Add link</Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={() => setDraft({
                ...draft,
                footerColumns: [...draft.footerColumns, { heading: "New Column", links: [] }],
              })}><Plus className="w-4 h-4 mr-1" /> Add column</Button>
            </div>
          </Section>
        </div>
        <MenuPreviewPanel savedAt={mSave.isSuccess ? mSave.submittedAt : 0} />
        </div>
      )}
    </div>
  );
}

function MenuPreviewPanel({ savedAt }: { savedAt: number }) {
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    if (savedAt) setNonce((n) => n + 1);
  }, [savedAt]);
  return (
    <div className="border border-border bg-muted/30 flex flex-col min-h-[600px] sticky top-4">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border bg-background">
        <div className="text-[11px] tracking-[0.2em] uppercase text-foreground/60">Preview · saved state</div>
        <Button variant="ghost" size="sm" onClick={() => setNonce((n) => n + 1)}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
      <iframe key={nonce} title="Menu preview" src="/" className="flex-1 w-full bg-background" />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-background border border-border p-5 sm:p-6">
      <h2 className="font-serif text-xl mb-4">{title}</h2>
      {children}
    </div>
  );
}

type ItemLike = { label: string; to: string; hidden?: boolean; children?: { label: string; to: string; hidden?: boolean }[] };

function ItemList<T extends ItemLike>({
  items, onChange, allowChildren,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  allowChildren?: boolean;
}) {
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }
  function update(i: number, patch: Partial<T>) {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="border border-border rounded p-3">
          <div className="flex gap-2 items-center flex-wrap">
            <Input placeholder="Label" value={it.label} onChange={(e) => update(i, { label: e.target.value } as any)} className="flex-1 min-w-[140px]" />
            <Input placeholder="/path" value={it.to} onChange={(e) => update(i, { to: e.target.value } as any)} className="flex-1 min-w-[140px]" />
            <label className="text-xs flex items-center gap-1">
              <Switch checked={!it.hidden} onCheckedChange={(v) => update(i, { hidden: !v } as any)} />
              Visible
            </label>
            <Button variant="ghost" size="icon" onClick={() => move(i, -1)}><ChevronUp className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => move(i, 1)}><ChevronDown className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => onChange(items.filter((_, x) => x !== i))}><Trash2 className="w-4 h-4" /></Button>
          </div>
          {allowChildren && (
            <div className="mt-3 pl-4 border-l-2 border-border">
              <p className="text-[11px] tracking-[0.2em] uppercase text-foreground/50 mb-2">Submenu</p>
              <div className="space-y-2">
                {(it.children ?? []).map((c, ci) => (
                  <div key={ci} className="flex gap-2 items-center flex-wrap">
                    <Input placeholder="Label" value={c.label} onChange={(e) => {
                      const kids = [...(it.children ?? [])];
                      kids[ci] = { ...kids[ci], label: e.target.value };
                      update(i, { children: kids } as any);
                    }} className="flex-1 min-w-[120px]" />
                    <Input placeholder="/path" value={c.to} onChange={(e) => {
                      const kids = [...(it.children ?? [])];
                      kids[ci] = { ...kids[ci], to: e.target.value };
                      update(i, { children: kids } as any);
                    }} className="flex-1 min-w-[120px]" />
                    <Button variant="ghost" size="icon" onClick={() => {
                      const kids = (it.children ?? []).filter((_, x) => x !== ci);
                      update(i, { children: kids } as any);
                    }}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => {
                  const kids = [...(it.children ?? []), { label: "New link", to: "/" }];
                  update(i, { children: kids } as any);
                }}><Plus className="w-4 h-4 mr-1" /> Add subitem</Button>
              </div>
            </div>
          )}
        </div>
      ))}
      <Button variant="outline" onClick={() => onChange([...items, { label: "New item", to: "/" } as T])}>
        <Plus className="w-4 h-4 mr-1" /> Add item
      </Button>
    </div>
  );
}
