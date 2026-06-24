import { useState } from "react";
import { Facebook, Instagram, Link as LinkIcon, Share2, Check } from "lucide-react";
import { toast } from "sonner";

// TikTok icon (lucide doesn't bundle one)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M16.5 3a5.5 5.5 0 0 0 4.5 4.5v3.2a8.7 8.7 0 0 1-4.5-1.3v6.4A6.2 6.2 0 1 1 10.3 9.6v3.2a3 3 0 1 0 3 3V3h3.2Z" />
    </svg>
  );
}

export type ShareButtonsProps = {
  /** Title of the content being shared (page name, lodge, journey…) */
  title: string;
  /** Optional teaser used by native share / fallback copy */
  description?: string;
  /** Absolute URL to share. Defaults to current page on client. */
  url?: string;
  /** Label e.g. "Share this lodge" */
  label?: string;
  variant?: "inline" | "stacked";
  className?: string;
};

function buildUrl(url?: string): string {
  if (url) return url;
  if (typeof window === "undefined") return "";
  return window.location.href;
}

export function ShareButtons({ title, description, url, label = "Share", variant = "inline", className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const share = (target: "facebook" | "instagram" | "tiktok" | "native" | "copy") => async () => {
    const href = buildUrl(url);
    const text = description ? `${title} — ${description}` : title;

    switch (target) {
      case "facebook": {
        const u = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(href)}&quote=${encodeURIComponent(text)}`;
        window.open(u, "_blank", "noopener,noreferrer,width=600,height=600");
        return;
      }
      case "instagram":
      case "tiktok": {
        // No public web-share URL for either. Copy the link and open their app/site so the user can paste into a Story / post / DM.
        try {
          await navigator.clipboard.writeText(href);
          toast.success(`Link copied — paste it into ${target === "instagram" ? "Instagram" : "TikTok"}`);
        } catch {
          // ignore
        }
        const appUrl = target === "instagram" ? "https://www.instagram.com/" : "https://www.tiktok.com/";
        window.open(appUrl, "_blank", "noopener,noreferrer");
        return;
      }
      case "native": {
        const nav = typeof navigator !== "undefined" ? (navigator as Navigator & { share?: (d: ShareData) => Promise<void> }) : null;
        if (nav?.share) {
          try {
            await nav.share({ title, text: description, url: href });
            return;
          } catch {
            return;
          }
        }
        if (nav?.clipboard) {
          await nav.clipboard.writeText(href);
          toast.success("Link copied to clipboard");
        }
        return;
      }
      case "copy": {
        try {
          await navigator.clipboard.writeText(href);
          setCopied(true);
          toast.success("Link copied");
          setTimeout(() => setCopied(false), 1800);
        } catch {
          toast.error("Couldn't copy link");
        }
        return;
      }
    }
  };

  const hasNativeShare = typeof navigator !== "undefined" && "share" in navigator;

  const buttonBase =
    "inline-flex items-center justify-center w-9 h-9 border border-border text-foreground/70 hover:text-gold hover:border-gold transition-colors";

  return (
    <div className={`${variant === "stacked" ? "flex flex-col items-start gap-3" : "flex items-center gap-3 flex-wrap"} ${className ?? ""}`}>
      <span className="text-[11px] tracking-[0.25em] uppercase text-foreground/60">{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={share("facebook")} aria-label="Share on Facebook" className={buttonBase}>
          <Facebook className="w-4 h-4" />
        </button>
        <button type="button" onClick={share("instagram")} aria-label="Share to Instagram" className={buttonBase}>
          <Instagram className="w-4 h-4" />
        </button>
        <button type="button" onClick={share("tiktok")} aria-label="Share to TikTok" className={buttonBase}>
          <TikTokIcon className="w-4 h-4" />
        </button>
        {hasNativeShare && (
          <button type="button" onClick={share("native")} aria-label="Share via device" className={buttonBase}>
            <Share2 className="w-4 h-4" />
          </button>
        )}
        <button type="button" onClick={share("copy")} aria-label="Copy link" className={buttonBase}>
          {copied ? <Check className="w-4 h-4 text-gold" /> : <LinkIcon className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
