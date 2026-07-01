import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Check, Image as ImageIcon, Loader2, Search } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminListMedia } from "@/lib/admin.functions";

type MediaItem = {
  path: string;
  url: string;
  name: string;
  size: number;
  updated_at: string;
};

export function MediaLibraryPicker({
  open,
  onOpenChange,
  onSelect,
  multi = false,
  title = "Media library",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (urls: string[]) => void;
  multi?: boolean;
  title?: string;
}) {
  const list = useServerFn(adminListMedia);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const { data, isLoading, refetch, isFetching } = useQuery<MediaItem[]>({
    queryKey: ["admin", "media", { open }],
    queryFn: () => list({ data: {} }) as unknown as Promise<MediaItem[]>,
    enabled: open,
    staleTime: 30_000,
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!search.trim()) return data;
    const q = search.trim().toLowerCase();
    return data.filter((m) => m.name.toLowerCase().includes(q));
  }, [data, search]);

  function toggle(url: string) {
    if (multi) {
      setSelected((prev) =>
        prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url],
      );
    } else {
      onSelect([url]);
      onOpenChange(false);
    }
  }

  function confirm() {
    if (selected.length) onSelect(selected);
    setSelected([]);
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setSelected([]);
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {multi
              ? "Select one or more previously uploaded images."
              : "Pick an image you've already uploaded."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by filename…"
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto rounded-md border border-border bg-cream/30 p-3">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-md bg-foreground/5 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-foreground/60">
              <ImageIcon className="w-8 h-8 mb-2 opacity-60" />
              <p className="text-sm">
                {search ? "No images match that search." : "No images uploaded yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filtered.map((m) => {
                const active = selected.includes(m.url);
                return (
                  <button
                    key={m.path}
                    type="button"
                    onClick={() => toggle(m.url)}
                    className={`group relative aspect-square rounded-md overflow-hidden border-2 transition-all bg-background text-left ${
                      active ? "border-gold ring-2 ring-gold/30" : "border-border hover:border-gold/70"
                    }`}
                    title={m.name}
                  >
                    <img
                      src={m.url}
                      alt={m.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                      <p className="text-[10px] text-white/90 truncate">{m.name}</p>
                    </div>
                    {active && (
                      <div className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-gold text-gold-foreground flex items-center justify-center shadow">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {multi && (
          <DialogFooter>
            <p className="text-xs text-foreground/60 mr-auto self-center">
              {selected.length} selected
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={confirm} disabled={!selected.length}>
              Add {selected.length ? `(${selected.length})` : ""}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
