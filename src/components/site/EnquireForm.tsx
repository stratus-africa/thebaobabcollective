import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, CheckCircle2, ArrowRight, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { submitEnquiry } from "@/lib/submissions.functions";
import { useFormAutosave } from "@/hooks/use-form-autosave";



export type EnquireFormProps = {
  defaultSubject?: string;
  defaultDestination?: string;
  sourceUrl?: string;
  compact?: boolean;
  className?: string;
  /** localStorage key for autosave. Set null to disable. Defaults to a key per subject. */
  autosaveKey?: string | null;
  /** Context card shown at the top of the form, prefilled from the page (journey/destination). */
  context?: {
    kind?: "Journey" | "Destination" | "Itinerary" | "Lodge";
    title: string;
    dates?: string;
    slug?: string;
    image?: string;
  };
};

type Draft = {
  name: string;
  email: string;
  phone: string;
  message: string;
  subscribe: boolean;
};

const EMPTY_DRAFT: Draft = {
  name: "",
  email: "",
  phone: "",
  message: "",
  subscribe: true,
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateField(name: keyof Draft, value: string): string | undefined {
  switch (name) {
    case "name":
      return value.trim().length === 0 ? "Please tell us your name." : undefined;
    case "email":
      if (value.trim().length === 0) return "Email is required.";
      if (!emailRe.test(value.trim())) return "Enter a valid email address.";
      return undefined;
    case "phone":
      return value.trim().length < 5 ? "Phone number is required so we can reach you." : undefined;
    case "message":
      return value.trim().length < 5 ? "Share a sentence about your trip so we can help." : undefined;
    default:
      return undefined;
  }
}

export function EnquireForm({
  defaultSubject,
  defaultDestination,
  sourceUrl,
  compact,
  className,
  autosaveKey,
  context,
}: EnquireFormProps) {
  const submit = useServerFn(submitEnquiry);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Draft | "form", string>>>({});
  const [honeypot, setHoneypot] = useState("");
  const mountedAt = useRef<number>(Date.now());


  const storageKey = useMemo(() => {
    if (autosaveKey === null) return null;
    if (autosaveKey) return autosaveKey;
    return `enquiry:${defaultSubject ?? "general"}`;
  }, [autosaveKey, defaultSubject]);

  const autosave = useFormAutosave<Draft>({
    key: storageKey ?? "_disabled",
    enabled: storageKey !== null,
  });

  // Single source of truth: a state-backed draft initialised from autosave on mount
  const [values, setValues] = useState<Draft>({
    ...EMPTY_DRAFT,
    message: context?.title
      ? `I'd love to learn more about ${context.kind ? `the ${context.kind.toLowerCase()} ` : ""}${context.title}. Please share availability and how we could shape a trip around it.`
      : "",
  });
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;
    if (autosave.draft) {
      setValues((prev) => ({ ...prev, ...autosave.draft! }));
      hydratedRef.current = true;
    }
  }, [autosave.draft]);

  // Autosave on every change (debounced inside the hook)
  useEffect(() => {
    if (storageKey === null) return;
    if (submitted) return;
    autosave.save(values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, storageKey, submitted]);

  function setField<K extends keyof Draft>(k: K, v: Draft[K]) {
    setValues((prev) => ({ ...prev, [k]: v }));
  }




  function blurValidate(name: keyof Draft) {
    const v = String(values[name] ?? "");
    const err = validateField(name, v);
    setErrors((prev) => ({ ...prev, [name]: err }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (honeypot.trim() !== "") {
      // Silent bot rejection — show success to avoid signaling
      setSubmitted(true);
      return;
    }
    if (Date.now() - mountedAt.current < 2000) {
      setErrors({ form: "Please take a moment to review your details before submitting." });
      return;
    }
    const next: typeof errors = {};
    (["name", "email", "phone", "message"] as const).forEach((f) => {
      const err = validateField(f, String(values[f] ?? ""));
      if (err) next[f] = err;
    });
    if (Object.keys(next).length) {
      setErrors(next);
      const first = Object.keys(next)[0];
      const el = document.getElementById(first);
      el?.focus();
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await submit({
        data: {
          company: "",
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          destination: defaultDestination || context?.title || "",
          subject: defaultSubject ?? "",
          travel_dates: context?.dates ?? "",
          subscribe_newsletter: values.subscribe,
          source_url: sourceUrl ?? (typeof window !== "undefined" ? window.location.href : ""),
          message: values.message,
        },
      });
      autosave.clear();
      setSubmitted(true);
      toast.success("Enquiry sent — we'll be in touch within 24 hours.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setErrors({ form: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function startAnother() {
    setValues({ ...EMPTY_DRAFT });
    setErrors({});
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <div
        className={`bg-background border border-border p-8 sm:p-10 text-center ${className ?? ""}`}
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="w-14 h-14 text-gold mx-auto mb-6" strokeWidth={1.2} aria-hidden="true" />
        <h3 className="font-serif text-3xl text-foreground mb-3">Thank you</h3>
        <p className="text-foreground/75 max-w-sm mx-auto mb-8">
          Your enquiry has been received. One of our journey designers will be in touch within 24 hours.
        </p>
        <button
          type="button"
          onClick={startAnother}
          className="inline-flex items-center gap-2 border border-gold text-gold uppercase tracking-[0.25em] text-[11px] px-6 py-3 hover:bg-gold hover:text-gold-foreground transition-colors"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-busy={loading}
      className={`bg-background border border-border p-6 md:p-8 space-y-6 ${className ?? ""}`}
    >
      {/* Honeypot — bots fill this; humans never see it */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: "-10000px", top: "auto", width: 1, height: 1, overflow: "hidden" }}
      >
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>
      {defaultSubject && (
        <p className="text-[11px] tracking-[0.25em] uppercase text-terracotta">Enquiry — {defaultSubject}</p>
      )}

      {context && (
        <div className="flex items-center gap-4 border border-gold/30 bg-gold/5 p-3 sm:p-4 rounded-sm">
          {context.image && (
            <img
              src={context.image}
              alt=""
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-sm border border-border shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            {context.kind && (
              <p className="text-[10px] tracking-[0.25em] uppercase text-gold mb-1">
                Enquiring about · {context.kind}
              </p>
            )}
            <p className="font-serif text-lg text-foreground leading-tight truncate">{context.title}</p>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground/65">
              {context.dates && <span>Travel: {context.dates}</span>}
              {context.slug && <span className="font-mono">/{context.slug}</span>}
            </div>
          </div>
        </div>
      )}

      {autosave.showRestoredNotice && (
        <div
          role="status"
          className="flex items-start gap-3 border border-gold/40 bg-gold/5 px-4 py-3 text-xs text-foreground/80"
        >
          <Save className="w-4 h-4 text-gold mt-0.5 shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-foreground">Draft restored</p>
            <p className="text-foreground/60">We saved what you had typed earlier. Pick up where you left off.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              autosave.clear();
              setValues({ ...EMPTY_DRAFT, destination: defaultDestination ?? "" });
            }}
            className="text-foreground/60 hover:text-foreground inline-flex items-center gap-1 text-[11px]"
            aria-label="Discard saved draft"
          >
            <X className="w-3 h-3" /> Discard
          </button>
        </div>
      )}

      <fieldset className="space-y-5">
        <legend className="font-serif text-xl text-foreground mb-2">About you</legend>
        <div className="grid md:grid-cols-2 gap-4">
          <Field
            label="Full name"
            name="name"
            required
            value={values.name}
            onChange={(v) => setField("name", v)}
            onBlur={() => blurValidate("name")}
            error={errors.name}
          />
          <Field
            label="Email address"
            name="email"
            type="email"
            required
            value={values.email}
            onChange={(v) => setField("email", v)}
            onBlur={() => blurValidate("email")}
            error={errors.email}
          />
          <Field
            label="Phone (required)"
            name="phone"
            type="tel"
            required
            value={values.phone}
            onChange={(v) => setField("phone", v)}
            onBlur={() => blurValidate("phone")}
            error={errors.phone}
            placeholder="+27 00 000 0000"
          />
        </div>
      </fieldset>




      <div>
        <Label htmlFor="message" className="text-sm text-foreground">
          Tell us about your dream journey <span className="text-terracotta">*</span>
        </Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={5}
          className="mt-2"
          placeholder="Special occasions, must-sees, mobility considerations, dietary needs…"
          value={values.message}
          onChange={(e) => setField("message", e.target.value)}
          onBlur={() => blurValidate("message")}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {errors.message && (
          <p id="message-error" role="alert" className="mt-1 text-xs text-destructive">
            {errors.message}
          </p>
        )}
      </div>

      <label className="flex items-start gap-3 text-sm text-foreground/75">
        <Checkbox
          checked={values.subscribe}
          onCheckedChange={(v) => setField("subscribe", v === true)}
          className="mt-0.5"
        />
        <span>Send me occasional journey ideas and field notes from the Collective.</span>
      </label>

      {errors.form && (
        <p role="alert" className="text-sm text-destructive border border-destructive/40 bg-destructive/5 px-4 py-3">
          {errors.form}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-terracotta text-gold-foreground uppercase tracking-[0.25em] text-[12px] py-4 hover:bg-terracotta/90 transition-colors disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Sending…
          </>
        ) : (
          <>
            Send Enquiry <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </>
        )}
      </button>
      <p className="text-[11px] text-foreground/50 text-center">
        We respond within 24 hours, Monday to Saturday. Your details are kept private.
        {storageKey !== null && " Draft autosaves as you type."}
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  error,
  placeholder,
  value,
  onChange,
  onBlur,
  min,
  as,
  options,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  min?: number;
  as?: "select";
  options?: string[];
}) {
  const errorId = error ? `${name}-error` : undefined;
  return (
    <div>
      <Label htmlFor={name} className="text-xs text-foreground/70">
        {label} {required && <span className="text-terracotta" aria-hidden="true">*</span>}
      </Label>
      {as === "select" ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className="mt-2 w-full border border-border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <option value="">Select…</option>
          {options?.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder ?? label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          min={min}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className="mt-2"
        />
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
