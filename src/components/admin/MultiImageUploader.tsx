import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle, FolderOpen, GripVertical, Image as ImageIcon, Loader2, Plus, X,
} from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { adminUploadImage, adminDeleteMedia } from "@/lib/admin.functions";
import { MediaLibraryPicker, MEDIA_LIBRARY_QUERY_KEY } from "@/components/admin/MediaLibraryPicker";

const DEFAULT_ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/avif";
const ACCEPT_REGEX = /^image\/(png|jpe?g|webp|gif|avif|svg\+xml)$/i;

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function readAsBase64(file: File): Promise<{ base64: string; contentType: string; filename: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      resolve({ base64, contentType: file.type || "image/jpeg", filename: file.name });
    };
    reader.readAsDataURL(file);
  });
}

type PendingItem = { key: string; previewUrl: string; name: string; size: number; progress: number };

export function MultiImageUploader({
  label,
  value,
  onChange,
  maxSizeMB = 8,
  maxImages,
  accept = DEFAULT_ACCEPT,
  className,
}: {
  label?: string;
  value: string[];
  onChange: (urls: string[]) => void;
  maxSizeMB?: number;
  /** Optional cap on total images in the gallery. */
  maxImages?: number;
  accept?: string;
  className?: string;
}) {
  const upload = useServerFn(adminUploadImage);
  const deleteMedia = useServerFn(adminDeleteMedia);
  const queryClient = useQueryClient();

  const [pending, setPending] = useState<PendingItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [drag, setDrag] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const previewUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const items = Array.isArray(value) ? value.filter(Boolean) : [];
  const remainingSlots = maxImages ? Math.max(0, maxImages - items.length) : Infinity;
  const atCapacity = maxImages !== undefined && items.length >= maxImages;

  async function handleFiles(files: FileList | File[] | null | undefined) {
    setError(null);
    if (!files) return;
    const incoming = Array.from(files);
    if (!incoming.length) return;

    if (atCapacity) {
      setError(`You've reached the ${maxImages} image limit. Remove one before adding more.`);
      return;
    }

    let list = incoming;
    if (maxImages !== undefined && incoming.length > remainingSlots) {
      setError(
        `Only ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"} can be added (max ${maxImages}). Extra files were skipped.`,
      );
      list = incoming.slice(0, remainingSlots);
    }

    const invalid = list.find((f) => !ACCEPT_REGEX.test(f.type));
    if (invalid) {
      setError(`"${invalid.name}" isn't a supported image (use PNG, JPG, WEBP, GIF, AVIF, or SVG).`);
      return;
    }
    const tooBig = list.find((f) => f.size > maxSizeMB * 1024 * 1024);
    if (tooBig) {
      setError(`"${tooBig.name}" is ${humanSize(tooBig.size)} — each image must be under ${maxSizeMB}MB.`);
      return;
    }

    const startingUrls = items;
    const newPending: PendingItem[] = list.map((f) => {
      const previewUrl = URL.createObjectURL(f);
      previewUrlsRef.current.push(previewUrl);
      return {
        key: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 7)}`,
        previewUrl,
        name: f.name,
        size: f.size,
        progress: 5,
      };
    });
    setPending((p) => [...p, ...newPending]);

    const uploaded: string[] = [];
    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      const item = newPending[i];
      try {
        setPending((p) => p.map((q) => (q.key === item.key ? { ...q, progress: 40 } : q)));
        const payload = await readAsBase64(file);
        setPending((p) => p.map((q) => (q.key === item.key ? { ...q, progress: 75 } : q)));
        const res = (await upload({ data: payload })) as { url: string };
        uploaded.push(res.url);
        setPending((p) => p.map((q) => (q.key === item.key ? { ...q, progress: 100 } : q)));
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Upload failed";
        toast.error(`${file.name}: ${msg}`);
      } finally {
        setPending((p) => p.filter((q) => q.key !== item.key));
      }
    }

    if (uploaded.length) {
      onChange([...startingUrls, ...uploaded]);
      toast.success(
        uploaded.length === 1 ? "Image added to gallery" : `${uploaded.length} images added to gallery`,
      );
      // Refresh the media-library cache so newly uploaded images show up
      // immediately in the picker without a page reload.
      queryClient.invalidateQueries({ queryKey: MEDIA_LIBRARY_QUERY_KEY });
    }
  }


  async function removeAt(index: number) {
    const url = items[index];
    const next = items.filter((_, i) => i !== index);
    onChange(next);
    if (url && /\/api\/public\/media\//.test(url) && !next.includes(url)) {
      try {
        await deleteMedia({ data: { url } });
      } catch {
        // ignore
      }
    }
  }

  function moveTo(from: number, to: number) {
    if (from === to || to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  return (
    <div className={className}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <Label className="text-[11px] tracking-[0.2em] uppercase text-foreground/60">
            {label}
          </Label>
          <span className="text-[11px] text-foreground/50">{items.length} image{items.length === 1 ? "" : "s"}</span>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
          {items.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              draggable
              onDragStart={() => setDragIndex(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) moveTo(dragIndex, idx);
                setDragIndex(null);
              }}
              className="group relative aspect-square rounded-md overflow-hidden border-2 border-border bg-cream"
            >
              <img src={url} alt="" loading="lazy" className="w-full h-full object-cover" />
              <div className="absolute top-1.5 left-1.5 h-6 w-6 rounded-full bg-background/80 text-foreground/70 flex items-center justify-center text-[10px] font-medium">
                {idx + 1}
              </div>
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-background/80 text-foreground/70 hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                aria-label="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 py-1 flex items-center justify-between opacity-0 group-hover:opacity-100 transition">
                <span className="text-[10px] text-white/90 flex items-center gap-1">
                  <GripVertical className="w-3 h-3" /> Drag to reorder
                </span>
              </div>
            </div>
          ))}
          {pending.map((p) => (
            <div key={p.key} className="relative aspect-square rounded-md overflow-hidden border-2 border-gold/50 bg-cream">
              <img src={p.previewUrl} alt={p.name} className="w-full h-full object-cover opacity-70" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/40 backdrop-blur-[1px]">
                <Loader2 className="w-4 h-4 animate-spin text-gold" />
                <div className="w-2/3">
                  <Progress value={p.progress} className="h-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-wrap items-center justify-center gap-3 cursor-pointer rounded-md border-2 border-dashed px-6 py-6 text-center transition-colors ${
          drag ? "border-gold bg-gold/5" : "border-border bg-cream/40 hover:border-gold hover:bg-gold/5"
        }`}
      >
        <div className="h-10 w-10 rounded-full bg-gold/10 text-gold flex items-center justify-center">
          {items.length === 0 ? <ImageIcon className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </div>
        <div className="text-left">
          <p className="text-sm font-medium">
            {items.length === 0 ? "Drop images or click to upload" : "Add more images"}
          </p>
          <p className="text-[11px] text-foreground/50">
            Multiple files supported · PNG/JPG/WEBP/GIF/AVIF · up to {maxSizeMB}MB each
          </p>
        </div>
        <input
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setPickerOpen(true);
          }}
          className="ml-auto inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border bg-background hover:bg-cream"
        >
          <FolderOpen className="w-3.5 h-3.5" /> Library
        </button>
      </label>

      {error && (
        <p className="text-xs text-destructive mt-2 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}

      <MediaLibraryPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        multi
        title="Add from media library"
        onSelect={(urls) => {
          if (!urls.length) return;
          const merged = [...items];
          for (const u of urls) if (!merged.includes(u)) merged.push(u);
          onChange(merged);
        }}
      />
    </div>
  );
}
