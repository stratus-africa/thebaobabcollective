import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, Save, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getSiteSettings,
  saveSiteSettings,
  type SiteSettings,
} from "@/lib/site-settings.functions";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const fetchSettings = useServerFn(getSiteSettings);
  const save = useServerFn(saveSiteSettings);
  const { data, isLoading } = useQuery<SiteSettings>({
    queryKey: ["site-settings"],
    queryFn: () => fetchSettings(),
  });

  const [logoUrl, setLogoUrl] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneTel, setPhoneTel] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setLogoUrl(data.branding?.logo_url ?? "");
    setEmail(data.contact?.email ?? "");
    setPhone(data.contact?.phone ?? "");
    setPhoneTel(data.contact?.phone_tel ?? "");
    setAddress(data.contact?.address ?? "");
  }, [data]);

  function validate(): boolean {
    let ok = true;
    setEmailError(null);
    setLogoError(null);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Enter a valid email address.");
      ok = false;
    }
    if (logoUrl) {
      try {
        new URL(logoUrl);
      } catch {
        setLogoError("Logo must be a valid URL (https://…).");
        ok = false;
      }
    }
    return ok;
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await save({
        data: {
          contact: {
            email: email.trim(),
            phone: phone.trim(),
            phone_tel: phoneTel.trim() || phone.trim().replace(/[^\d+]/g, ""),
            address: address.trim(),
          },
          branding: { logo_url: logoUrl.trim() },
        },
      });
      toast.success("Site settings saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <header className="mb-8">
        <p className="text-[11px] tracking-[0.3em] uppercase text-foreground/60 mb-2">Admin</p>
        <h1 className="font-serif text-3xl text-foreground">Site Settings</h1>
        <p className="text-sm text-foreground/65 mt-1">
          Update the site logo and primary contact details. Changes apply across the site immediately.
        </p>
      </header>

      {isLoading ? (
        <div className="flex items-center gap-2 text-foreground/60 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      ) : (
        <form onSubmit={onSave} className="space-y-10" noValidate>
          <section className="bg-background border border-border rounded-lg p-6 md:p-8 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <ImageIcon className="w-5 h-5 text-gold" aria-hidden="true" />
              <h2 className="font-serif text-xl text-foreground">Branding</h2>
            </div>
            <div>
              <Label htmlFor="logo_url" className="text-sm">Site Logo URL</Label>
              <Input
                id="logo_url"
                type="url"
                placeholder="https://…/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                aria-invalid={!!logoError}
                aria-describedby={logoError ? "logo_url-error" : "logo_url-help"}
                className="mt-2"
              />
              {logoError ? (
                <p id="logo_url-error" role="alert" className="mt-1 text-xs text-destructive">{logoError}</p>
              ) : (
                <p id="logo_url-help" className="mt-1 text-xs text-foreground/55">
                  Paste a publicly accessible image URL. Leave empty to use the default logo mark.
                </p>
              )}
              {logoUrl && !logoError && (
                <div className="mt-3 inline-flex items-center gap-3 p-3 border border-border rounded-md bg-cream">
                  <img src={logoUrl} alt="Logo preview" className="h-10 w-10 object-contain" />
                  <span className="text-xs text-foreground/70">Live preview</span>
                </div>
              )}
            </div>
          </section>

          <section className="bg-background border border-border rounded-lg p-6 md:p-8 space-y-5">
            <h2 className="font-serif text-xl text-foreground">Contact</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="info@thebaobabcollective.co.uk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? "email-error" : undefined}
                  className="mt-2"
                />
                {emailError && (
                  <p id="email-error" role="alert" className="mt-1 text-xs text-destructive">{emailError}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm">Phone (display)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+44 (0) 20 0000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="phone_tel" className="text-sm">Phone (tel link, optional)</Label>
                <Input
                  id="phone_tel"
                  placeholder="+442000000000"
                  value={phoneTel}
                  onChange={(e) => setPhoneTel(e.target.value)}
                  className="mt-2"
                />
                <p className="mt-1 text-xs text-foreground/55">
                  Used as <code>tel:</code> link. Defaults to digits from display phone.
                </p>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address" className="text-sm">Address</Label>
                <Input
                  id="address"
                  placeholder="London · Cape Town · Nairobi"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-gold text-gold-foreground uppercase tracking-[0.25em] text-[11px] px-6 py-3 hover:bg-gold/90 transition-colors disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" /> Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
