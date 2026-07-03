import { useState } from "react";
import { Instagram, Facebook, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { BaobabLogo } from "./Logo";
import { subscribeNewsletter } from "@/lib/submissions.functions";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useMenuConfig } from "@/hooks/useMenuConfig";
import { toast } from "sonner";

export function Footer() {
  const subscribe = useServerFn(subscribeNewsletter);
  const { email: contactEmail, phone: contactPhone, phoneTel: contactPhoneTel, logoUrl } = useSiteSettings();
  const menu = useMenuConfig();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await subscribe({ data: { email } });
      toast.success(
        res.alreadySubscribed ? "You're already on the list — thank you." : "Welcome aboard.",
      );
      setEmail("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not subscribe.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const cols = menu.footerColumns ?? [];

  return (
    <footer id="contact" className="bg-cream pt-16 pb-6">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-1">
          <Link to="/" className="flex items-start gap-3 mb-4" aria-label="The Baobab Collective home">
            {logoUrl ? (
              <img src={logoUrl} alt="The Baobab Collective" className="w-14 h-14 object-contain" />
            ) : (
              <BaobabLogo className="w-14 h-14" />
            )}
          </Link>
          <p className="text-[10px] tracking-[0.3em] uppercase text-foreground/60">
            {menu.footerTagline || "Journeys That Connect"}
          </p>
        </div>

        {cols.map((col, idx) => (
          <nav key={`${col.heading}-${idx}`} aria-label={`Footer ${col.heading}`}>
            <h4 className="text-[11px] tracking-[0.25em] uppercase text-foreground mb-5">{col.heading}</h4>
            <ul className="space-y-2">
              {col.links.map((l, i) => (
                <li key={`${l.to}-${i}`}>
                  <Link
                    to={l.to as any}
                    className="text-[11px] tracking-wider uppercase text-foreground/75 hover:text-gold"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <address className="not-italic">
          <h4 className="text-[11px] tracking-[0.25em] uppercase text-foreground mb-5">Get in Touch</h4>
          <p className="text-sm text-foreground/75 mb-1">
            <a href={`mailto:${contactEmail}`} className="hover:text-gold break-all">{contactEmail}</a>
          </p>
          <p className="text-sm text-foreground/75 mb-5">
            <a href={`tel:${contactPhoneTel}`} className="hover:text-gold">{contactPhone}</a>
          </p>
          <div className="flex items-center gap-4 text-foreground/70">
            <a href="https://instagram.com" aria-label="Instagram" className="hover:text-gold"><Instagram className="w-4 h-4" /></a>
            <a href="https://facebook.com" aria-label="Facebook" className="hover:text-gold"><Facebook className="w-4 h-4" /></a>
          </div>
        </address>

        <div>
          <h4 className="text-[11px] tracking-[0.25em] uppercase text-foreground mb-5">Newsletter</h4>
          <p className="text-sm text-foreground/75 mb-4">Receive travel inspiration and special offers.</p>
          <form onSubmit={onSubmit} className="flex border border-border bg-background" noValidate>
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 min-w-0 px-3 py-3 text-sm bg-transparent outline-none placeholder:text-foreground/40 focus-visible:ring-2 focus-visible:ring-gold"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-forest text-forest-foreground px-4 disabled:opacity-60"
              aria-label="Subscribe to newsletter"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 mt-14 pt-6 border-t border-border/60">
        <p className="text-center text-[11px] tracking-[0.2em] uppercase text-foreground/60">
          © The Baobab Collective {new Date().getFullYear()} &nbsp;|&nbsp; All Rights Reserved
        </p>
      </div>
    </footer>
  );
}
