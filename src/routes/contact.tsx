import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Phone, Instagram, Loader2, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { submitEnquiry } from "@/lib/submissions.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Enquire — The Baobab Collective" },
      { name: "description", content: "Let's plan your safari. Get in touch with The Baobab Collective to begin designing your bespoke African journey." },
      { property: "og:title", content: "Plan Your Journey — The Baobab Collective" },
      { property: "og:description", content: "Tell us about your dream safari and we'll craft a journey just for you." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const submit = useServerFn(submitEnquiry);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const form = new FormData(e.currentTarget);
    const data = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      destination: String(form.get("destination") || ""),
      message: String(form.get("message") || ""),
    };
    setLoading(true);
    try {
      await submit({ data });
      setSubmitted(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main>
        <section className="bg-cream py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-14 items-start">
            <div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-terracotta mb-5">
                We'd love to hear from you
              </p>
              <h1 className="font-serif text-5xl md:text-6xl text-foreground leading-[1.05] mb-8">
                Let's Plan<br />Your Journey
              </h1>
              <ul className="space-y-5 text-foreground/80">
                <li className="flex gap-4">
                  <Mail className="w-5 h-5 text-gold mt-1 shrink-0" />
                  <div>
                    <p className="text-[11px] tracking-[0.25em] uppercase text-foreground mb-1">Email us</p>
                    <a href="mailto:hello@thebaobabcollective.com" className="hover:text-gold">hello@thebaobabcollective.com</a>
                  </div>
                </li>
                <li className="flex gap-4">
                  <Phone className="w-5 h-5 text-gold mt-1 shrink-0" />
                  <div>
                    <p className="text-[11px] tracking-[0.25em] uppercase text-foreground mb-1">Call / WhatsApp</p>
                    <a href="tel:+270000000000" className="hover:text-gold">+27 00 000 0000</a>
                  </div>
                </li>
                <li className="flex gap-4">
                  <Instagram className="w-5 h-5 text-gold mt-1 shrink-0" />
                  <div>
                    <p className="text-[11px] tracking-[0.25em] uppercase text-foreground mb-1">Follow our journeys</p>
                    <a href="https://instagram.com" className="hover:text-gold">@thebaobabcollective</a>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-background border border-border p-8 md:p-10">
              {submitted ? (
                <div className="text-center py-10" role="status" aria-live="polite">
                  <CheckCircle2 className="w-14 h-14 text-gold mx-auto mb-6" strokeWidth={1.2} />
                  <h2 className="font-serif text-3xl text-foreground mb-3">Thank you</h2>
                  <p className="text-foreground/75 max-w-sm mx-auto">
                    Your enquiry has been received. One of our journey designers will be in touch within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-5" noValidate>
                  <Field label="Your name" name="name" required error={errors.name} />
                  <Field label="Email address" name="email" type="email" required error={errors.email} />
                  <Field label="Phone (optional)" name="phone" type="tel" error={errors.phone} />
                  <Field label="Where would you like to go?" name="destination" error={errors.destination} />
                  <div>
                    <label htmlFor="message" className="sr-only">Tell us about your dream journey</label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      placeholder="Tell us about your dream journey"
                      className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold placeholder:text-foreground/40"
                    />
                  </div>
                  {errors.form && (
                    <p role="alert" className="text-sm text-destructive">{errors.form}</p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-terracotta text-gold-foreground uppercase tracking-[0.25em] text-[12px] py-4 hover:bg-terracotta/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Send Enquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="sr-only">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={label}
        aria-invalid={!!error}
        className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold placeholder:text-foreground/40"
      />
      {error && <p role="alert" className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
