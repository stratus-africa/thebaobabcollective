import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitEnquiry } from "@/lib/submissions.functions";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormValues = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

const EMPTY: FormValues = { name: "", email: "", phone: "", message: "" };

function validate(name: keyof FormValues, value: string): string | undefined {
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
      return value.trim().length < 5 ? "Share a sentence so we can help." : undefined;
    default:
      return undefined;
  }
}

export function ContactForm() {
  const submit = useServerFn(submitEnquiry);
  const [values, setValues] = useState<FormValues>({ ...EMPTY });
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues | "form", string>>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function setField<K extends keyof FormValues>(k: K, v: FormValues[K]) {
    setValues((prev) => ({ ...prev, [k]: v }));
  }

  function blurValidate(name: keyof FormValues) {
    const err = validate(name, values[name]);
    setErrors((prev) => ({ ...prev, [name]: err }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: typeof errors = {};
    (["name", "email", "phone", "message"] as const).forEach((f) => {
      const err = validate(f, values[f]);
      if (err) next[f] = err;
    });
    if (Object.keys(next).length) {
      setErrors(next);
      const first = Object.keys(next)[0];
      document.getElementById(first)?.focus();
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await submit({
        data: {
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          message: values.message.trim(),
          destination: "",
          subject: "Contact Us",
          source_url: typeof window !== "undefined" ? window.location.href : "",
        },
      });
      setSubmitted(true);
      toast.success("Message sent — we'll be in touch within 24 hours.");
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
      <div className="bg-background border border-border p-8 sm:p-10 text-center" role="status" aria-live="polite">
        <CheckCircle2 className="w-14 h-14 text-gold mx-auto mb-6" strokeWidth={1.2} aria-hidden="true" />
        <h3 className="font-serif text-3xl text-foreground mb-3">Thank you</h3>
        <p className="text-foreground/75 max-w-sm mx-auto mb-8">
          Your message has been received. One of our journey designers will be in touch within 24 hours.
        </p>
        <button
          type="button"
          onClick={() => { setValues({ ...EMPTY }); setSubmitted(false); }}
          className="inline-flex items-center gap-2 border border-gold text-gold uppercase tracking-[0.25em] text-[11px] px-6 py-3 hover:bg-gold hover:text-gold-foreground transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-busy={loading} className="bg-background border border-border p-6 md:p-8 space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contact-name" className="text-xs text-foreground/70">
            Full name <span className="text-terracotta" aria-hidden="true">*</span>
          </Label>
          <Input
            id="contact-name"
            name="name"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            onBlur={() => blurValidate("name")}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            className="mt-2"
          />
          {errors.name && (
            <p id="contact-name-error" role="alert" className="mt-1 text-xs text-destructive">{errors.name}</p>
          )}
        </div>
        <div>
          <Label htmlFor="contact-email" className="text-xs text-foreground/70">
            Email address <span className="text-terracotta" aria-hidden="true">*</span>
          </Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
            onBlur={() => blurValidate("email")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            className="mt-2"
          />
          {errors.email && (
            <p id="contact-email-error" role="alert" className="mt-1 text-xs text-destructive">{errors.email}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="contact-phone" className="text-xs text-foreground/70">
          Phone <span className="text-terracotta" aria-hidden="true">*</span>
        </Label>
        <Input
          id="contact-phone"
          name="phone"
          type="tel"
          placeholder="+27 00 000 0000"
          value={values.phone}
          onChange={(e) => setField("phone", e.target.value)}
          onBlur={() => blurValidate("phone")}
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? "contact-phone-error" : undefined}
          className="mt-2"
        />
        {errors.phone && (
          <p id="contact-phone-error" role="alert" className="mt-1 text-xs text-destructive">{errors.phone}</p>
        )}
      </div>

      <div>
        <Label htmlFor="contact-message" className="text-xs text-foreground/70">
          Message <span className="text-terracotta" aria-hidden="true">*</span>
        </Label>
        <Textarea
          id="contact-message"
          name="message"
          rows={5}
          placeholder="How can we help you?"
          value={values.message}
          onChange={(e) => setField("message", e.target.value)}
          onBlur={() => blurValidate("message")}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className="mt-2"
        />
        {errors.message && (
          <p id="contact-message-error" role="alert" className="mt-1 text-xs text-destructive">{errors.message}</p>
        )}
      </div>

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
            Send Message <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </>
        )}
      </button>
      <p className="text-[11px] text-foreground/50 text-center">
        We respond within 24 hours, Monday to Saturday. Your details are kept private.
      </p>
    </form>
  );
}
