import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { submitEnquiry } from "@/lib/submissions.functions";

const TRIP_TYPES = ["Honeymoon", "Family safari", "Solo expedition", "Friends / group", "Anniversary", "Corporate / incentive"];
const BUDGETS = ["Under $5k pp", "$5k – $10k pp", "$10k – $20k pp", "$20k – $40k pp", "$40k+ pp", "Open to advice"];
const STYLES = ["Classic luxury lodges", "Tented camps", "Mobile expeditions", "Eco / conservation camps", "Private villas", "Mix it up"];
const EXPERIENCES = ["Big Five game viewing", "Walking safaris", "Gorilla / primate trekking", "Birding", "Cultural encounters", "Beach extension", "Helicopter / fly camping", "Photography focus"];
const REFERRALS = ["Google search", "Instagram", "Facebook", "TikTok", "Friend / family", "Travel agent", "Press / publication", "Other"];

export type EnquireFormProps = {
  defaultSubject?: string;
  defaultDestination?: string;
  sourceUrl?: string;
  compact?: boolean;
  className?: string;
};

export function EnquireForm({ defaultSubject, defaultDestination, sourceUrl, compact, className }: EnquireFormProps) {
  const submit = useServerFn(submitEnquiry);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [experiences, setExperiences] = useState<string[]>([]);
  const [subscribe, setSubscribe] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function toggleExperience(name: string) {
    setExperiences((prev) => (prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const phone = String(fd.get("phone") ?? "").trim();
    if (phone.length < 5) {
      setErrors({ phone: "Please enter a phone number we can reach you on." });
      return;
    }
    const adultsRaw = String(fd.get("adults") ?? "").trim();
    const childrenRaw = String(fd.get("children") ?? "").trim();
    setLoading(true);
    try {
      await submit({
        data: {
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          phone,
          destination: String(fd.get("destination") ?? defaultDestination ?? ""),
          subject: defaultSubject ?? "",
          travel_dates: String(fd.get("travel_dates") ?? ""),
          adults: adultsRaw ? Number(adultsRaw) : undefined,
          children: childrenRaw ? Number(childrenRaw) : undefined,
          budget: String(fd.get("budget") ?? ""),
          trip_type: String(fd.get("trip_type") ?? ""),
          accommodation_style: String(fd.get("accommodation_style") ?? ""),
          experiences,
          referral_source: String(fd.get("referral_source") ?? ""),
          subscribe_newsletter: subscribe,
          source_url: sourceUrl ?? (typeof window !== "undefined" ? window.location.href : ""),
          message: String(fd.get("message") ?? ""),
        },
      });
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

  if (submitted) {
    return (
      <div className={`bg-background border border-border p-10 text-center ${className ?? ""}`} role="status" aria-live="polite">
        <CheckCircle2 className="w-14 h-14 text-gold mx-auto mb-6" strokeWidth={1.2} />
        <h3 className="font-serif text-3xl text-foreground mb-3">Thank you</h3>
        <p className="text-foreground/75 max-w-sm mx-auto">
          Your enquiry has been received. One of our journey designers will be in touch within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className={`bg-background border border-border p-6 md:p-8 space-y-6 ${className ?? ""}`}>
      {defaultSubject && (
        <p className="text-[11px] tracking-[0.25em] uppercase text-terracotta">Enquiry — {defaultSubject}</p>
      )}

      <fieldset className="space-y-5">
        <legend className="font-serif text-xl text-foreground mb-2">About you</legend>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Full name" name="name" required />
          <Field label="Email address" name="email" type="email" required />
          <Field label="Phone (required)" name="phone" type="tel" required error={errors.phone} placeholder="+27 00 000 0000" />
          <Field label="How did you hear about us?" name="referral_source" as="select" options={REFERRALS} />
        </div>
      </fieldset>

      {!compact && (
        <fieldset className="space-y-5">
          <legend className="font-serif text-xl text-foreground mb-2">Your trip</legend>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Where would you like to go?" name="destination" defaultValue={defaultDestination} />
            <Field label="Approximate travel dates" name="travel_dates" placeholder="e.g. May 2027, 10 nights" />
            <Field label="Adults" name="adults" type="number" min={0} defaultValue="2" />
            <Field label="Children" name="children" type="number" min={0} defaultValue="0" />
            <Field label="Trip type" name="trip_type" as="select" options={TRIP_TYPES} />
            <Field label="Budget per person (excl. flights)" name="budget" as="select" options={BUDGETS} />
            <div className="md:col-span-2">
              <Field label="Accommodation style" name="accommodation_style" as="select" options={STYLES} />
            </div>
          </div>

          <div>
            <Label className="text-sm text-foreground mb-3 block">Experiences of interest</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {EXPERIENCES.map((exp) => {
                const active = experiences.includes(exp);
                return (
                  <button
                    key={exp}
                    type="button"
                    onClick={() => toggleExperience(exp)}
                    aria-pressed={active}
                    className={`text-left text-xs px-3 py-2 border transition-colors ${
                      active
                        ? "bg-forest text-forest-foreground border-forest"
                        : "border-border text-foreground/75 hover:border-gold hover:text-gold"
                    }`}
                  >
                    {exp}
                  </button>
                );
              })}
            </div>
          </div>
        </fieldset>
      )}

      <div>
        <Label htmlFor="message" className="text-sm text-foreground">Tell us about your dream journey</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={5}
          className="mt-2"
          placeholder="Special occasions, must-sees, mobility considerations, dietary needs…"
        />
      </div>

      <label className="flex items-start gap-3 text-sm text-foreground/75">
        <Checkbox checked={subscribe} onCheckedChange={(v) => setSubscribe(v === true)} className="mt-0.5" />
        <span>Send me occasional journey ideas and field notes from the Collective.</span>
      </label>

      {errors.form && (
        <p role="alert" className="text-sm text-destructive">{errors.form}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-terracotta text-gold-foreground uppercase tracking-[0.25em] text-[12px] py-4 hover:bg-terracotta/90 transition-colors disabled:opacity-60"
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending</> : <>Send Enquiry <ArrowRight className="w-3 h-3" /></>}
      </button>
      <p className="text-[11px] text-foreground/50 text-center">
        We respond within 24 hours, Monday to Saturday. Your details are kept private.
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
  defaultValue,
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
  defaultValue?: string;
  min?: number;
  as?: "select";
  options?: string[];
}) {
  return (
    <div>
      <Label htmlFor={name} className="text-xs text-foreground/70">
        {label} {required && <span className="text-terracotta">*</span>}
      </Label>
      {as === "select" ? (
        <select
          id={name}
          name={name}
          defaultValue=""
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
          defaultValue={defaultValue}
          min={min}
          aria-invalid={!!error}
          className="mt-2"
        />
      )}
      {error && <p role="alert" className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
