import { useEffect, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EnquireForm, type EnquireFormProps } from "@/components/site/EnquireForm";

export type EnquireDialogProps = EnquireFormProps & {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  /** Auto-open when the URL hash matches (e.g. "enquire"). */
  openOnHash?: string;
};

export function EnquireDialog({
  trigger,
  open: openProp,
  onOpenChange,
  title = "Speak with a Journey Designer",
  description,
  openOnHash,
  defaultSubject,
  defaultDestination,
  sourceUrl,
  compact,
}: EnquireDialogProps) {
  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? openProp! : internalOpen;

  const setOpen = (v: boolean) => {
    if (!isControlled) setInternalOpen(v);
    onOpenChange?.(v);
  };

  // Auto-open on matching hash
  useEffect(() => {
    if (!openOnHash || typeof window === "undefined") return;
    const check = () => {
      if (window.location.hash.replace("#", "") === openOnHash) setOpen(true);
    };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openOnHash]);

  const desc =
    description ??
    (defaultSubject
      ? `Share a few details about your ${defaultSubject} journey — we'll respond within 24 hours.`
      : "Tell us about your dream journey — we'll respond within 24 hours.");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className="p-0 gap-0 max-w-2xl w-[calc(100vw-1.5rem)] sm:w-full max-h-[92vh] overflow-hidden flex flex-col"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border text-left">
          <DialogTitle className="font-serif text-2xl md:text-3xl text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-foreground/70">
            {desc}
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto px-1 sm:px-2 py-1">
          <EnquireForm
            defaultSubject={defaultSubject}
            defaultDestination={defaultDestination}
            sourceUrl={sourceUrl}
            compact={compact}
            className="!border-0 !bg-transparent !p-4 sm:!p-6"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
