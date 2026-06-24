import { useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type LightboxImage = { src: string; caption?: string; alt?: string };

export function Lightbox({
  images,
  open,
  onOpenChange,
  index,
  onIndexChange,
  title,
}: {
  images: LightboxImage[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
  index: number;
  onIndexChange: (i: number) => void;
  title?: string;
}) {
  const count = images.length;
  const current = images[index];

  const next = useCallback(() => {
    if (count === 0) return;
    onIndexChange((index + 1) % count);
  }, [count, index, onIndexChange]);

  const prev = useCallback(() => {
    if (count === 0) return;
    onIndexChange((index - 1 + count) % count);
  }, [count, index, onIndexChange]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, next, prev]);

  if (!current) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 gap-0 border-0 bg-black/95 max-w-[100vw] w-screen h-[100dvh] sm:max-w-[100vw] rounded-none flex flex-col [&>button]:hidden"
        aria-describedby="lightbox-desc"
      >
        <DialogTitle className="sr-only">{title ?? "Gallery"}</DialogTitle>
        <DialogDescription id="lightbox-desc" className="sr-only">
          Image {index + 1} of {count}
        </DialogDescription>

        <div className="absolute top-3 right-3 z-20 flex items-center gap-3 text-white/90 text-xs">
          <span className="tabular-nums tracking-wider">
            {index + 1} / {count}
          </span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative flex-1 flex items-center justify-center px-2 sm:px-12">
          {count > 1 && (
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-2 sm:left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <img
            src={current.src}
            alt={current.alt ?? current.caption ?? `Image ${index + 1}`}
            className="max-h-[85vh] max-w-full object-contain select-none"
            draggable={false}
          />
          {count > 1 && (
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-2 sm:right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {current.caption && (
          <div className="px-6 py-4 text-center text-white/80 text-sm">
            {current.caption}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
