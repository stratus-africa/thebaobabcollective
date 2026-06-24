import { useEffect, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBooking } from "@/lib/bookings.functions";
import { useFormAutosave } from "@/hooks/use-form-autosave";

type Itinerary = {
  id: string;
  name: string;
  slug: string;
  nights?: string | null;
  price_from_usd?: number | null;
  deposit_usd?: number | null;
};

type BookDraft = {
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  travel_date: string;
  party_size: number;
  special_requests: string;
};

const EMPTY: BookDraft = {
  guest_name: "",
  guest_email: "",
  guest_phone: "",
  travel_date: "",
  party_size: 2,
  special_requests: "",
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: BookDraft) {
  const errs: Partial<Record<keyof BookDraft, string>> = {};
  if (!values.guest_name.trim()) errs.guest_name = "Please tell us your name.";
  if (!values.guest_email.trim()) errs.guest_email = "Email is required.";
  else if (!emailRe.test(values.guest_email.trim())) errs.guest_email = "Enter a valid email address.";
  if (values.guest_phone.trim().length < 5) errs.guest_phone = "Phone is required so we can confirm.";
  if (!values.party_size || values.party_size < 1) errs.party_size = "At least 1 guest.";
  return errs;
}

export type BookDialogProps = {
  itinerary: Itinerary;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Hash to sync with URL (e.g. "book") */
  openOnHash?: string;
};

export function BookDialog({
  itinerary,
  trigger,
  open: openProp,
  onOpenChange,
  openOnHash,
}: BookDialogProps) {
  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? openProp! : internalOpen;
  const setOpen = (v: boolean) => {
    if (!isControlled) setInternalOpen(v);
    onOpenChange?.(v);
  };

  const book = useServerFn(createBooking);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof BookDraft | "form", string>>>({});

  const autosave = useFormAutosave<BookDraft>({ key: `booking:${itinerary.slug}` });
  const [values, setValues] = useState<BookDraft>(EMPTY);

  useEffect(() => {
    if (autosave.draft) setValues((prev) => ({ ...prev, ...autosave.draft! }));
  }, [autosave.draft]);

  useEffect(() => {
    if (submitted) return;
    autosave.save(values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, submitted]);

  // Sync hash <-> open state
  useEffect(() => {
    if (!openOnHash || typeof window === "undefined") return;
    const sync = () => {
      if (window.location.hash.replace("#", "") === openOnHash) setOpen(true);
    };
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openOnHash]);

  useEffect(() => {
    if (!openOnHash || typeof window === "undefined") return;
    const target = `#${openOnHash}`;
    const current = window.location.hash;
    if (open && current !== target) {
      window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}${target}`);
    } else if (!open && current === target) {
      window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}`);
    }
  }, [open, openOnHash]);

  function setField<K extends keyof BookDraft>(k: K, v: BookDraft[K]) {
    setValues((prev) => ({ ...prev, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = validate(values);
    if (Object.keys(next).length) {
      setErrors(next);
      const first = Object.keys(next)[0];
      document.getElementById(`book-${first}`)?.focus();
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await book({ data: { itinerary_id: itinerary.id, ...values } });
      autosave.clear();
      setSubmitted(true);
      if (res.checkoutUrl) {
        toast.success("Redirecting to secure checkout…");
        window.location.href = res.checkoutUrl;
      } else {
        toast.success("Booking received — we'll contact you to confirm payment");
        window.location.href = `/booking/success?booking_id=${res.booking_id}`;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not create booking";
      setErrors({ form: msg });
      toast.error(msg);
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        aria-describedby="book-dialog-desc"
        className="p-0 gap-0 max-w-2xl w-[calc(100vw-1.5rem)] sm:w-full max-h-[92vh] overflow-hidden flex flex-col"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border text-left">
          <DialogTitle className="font-serif text-2xl md:text-3xl text-foreground">
            Book {itinerary.name}
          </DialogTitle>
          <DialogDescription id="book-dialog-desc" className="text-sm text-foreground/70">
            {itinerary.nights ? `${itinerary.nights} · ` : ""}
            Tell us your travel dates and we'll confirm by email.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto">
          {submitted ? (
            <div className="p-10 text-center" role="status" aria-live="polite">
              <CheckCircle2 className="w-14 h-14 text-gold mx-auto mb-6" strokeWidth={1.2} aria-hidden="true" />
              <h3 className="font-serif text-2xl text-foreground mb-3">Booking received</h3>
              <p className="text-foreground/70 max-w-sm mx-auto">
                Sending you to a secure checkout…
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate aria-busy={loading} className="p-4 sm:p-6 space-y-5">
              {autosave.showRestoredNotice && (
                <p className="text-xs text-foreground/70 border border-gold/40 bg-gold/5 px-3 py-2">
                  Your previous booking details have been restored.
                </p>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <BookField
                  id="book-guest_name"
                  label="Full name"
                  required
                  value={values.guest_name}
                  onChange={(v) => setField("guest_name", v)}
                  error={errors.guest_name}
                />
                <BookField
                  id="book-guest_email"
                  label="Email"
                  type="email"
                  required
                  value={values.guest_email}
                  onChange={(v) => setField("guest_email", v)}
                  error={errors.guest_email}
                />
                <BookField
                  id="book-guest_phone"
                  label="Phone"
                  type="tel"
                  required
                  value={values.guest_phone}
                  onChange={(v) => setField("guest_phone", v)}
                  error={errors.guest_phone}
                />
                <BookField
                  id="book-party_size"
                  label="Party size"
                  type="number"
                  min={1}
                  max={20}
                  value={String(values.party_size)}
                  onChange={(v) => setField("party_size", Number(v) || 1)}
                  error={errors.party_size}
                />
                <div className="md:col-span-2">
                  <BookField
                    id="book-travel_date"
                    label="Preferred travel date"
                    type="date"
                    value={values.travel_date}
                    onChange={(v) => setField("travel_date", v)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="book-special_requests" className="text-xs text-foreground/70">
                    Special requests
                  </Label>
                  <Textarea
                    id="book-special_requests"
                    rows={4}
                    className="mt-2"
                    value={values.special_requests}
                    onChange={(e) => setField("special_requests", e.target.value)}
                  />
                </div>
              </div>

              {itinerary.deposit_usd && (
                <div className="bg-cream p-4 text-sm text-foreground/80">
                  A refundable deposit of{" "}
                  <span className="font-medium text-foreground">${itinerary.deposit_usd.toLocaleString()}</span>{" "}
                  secures your booking. Balance due 60 days before travel.
                </div>
              )}

              {errors.form && (
                <p role="alert" className="text-sm text-destructive border border-destructive/40 bg-destructive/5 px-4 py-3">
                  {errors.form}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-gold text-gold-foreground uppercase tracking-[0.25em] text-[12px] py-4 hover:bg-gold/90 transition-colors disabled:opacity-60"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Preparing checkout…</>
                ) : (
                  <>
                    {itinerary.deposit_usd
                      ? `Pay deposit · $${itinerary.deposit_usd.toLocaleString()}`
                      : "Request booking"}
                    <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  </>
                )}
              </button>
              <p className="text-[11px] text-foreground/50 text-center">
                Secure checkout · Draft autosaves as you type.
              </p>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BookField({
  id,
  label,
  type = "text",
  required,
  value,
  onChange,
  error,
  min,
  max,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  min?: number;
  max?: number;
}) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div>
      <Label htmlFor={id} className="text-xs text-foreground/70">
        {label} {required && <span className="text-terracotta" aria-hidden="true">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        aria-invalid={!!error}
        aria-describedby={errorId}
        className="mt-2"
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
