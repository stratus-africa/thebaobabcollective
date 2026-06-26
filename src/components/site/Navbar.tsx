import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { BaobabLogo } from "./Logo";
import { EnquireDialog } from "@/components/site/EnquireDialog";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const primaryItems = [
  { label: "Home", to: "/" as const },
  { label: "Adventures", to: "/adventures" as const },
  { label: "Lodges", to: "/lodges" as const },
  { label: "Destinations", to: "/destinations" as const },
  { label: "Journal", to: "/journal" as const },
];

const moreItems = [
  { label: "About", to: "/about" as const },
  
  { label: "Testimonials", to: "/testimonials" as const },
  { label: "FAQ", to: "/faq" as const },
  { label: "Private Travel", to: "/private-travel" as const },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { logoUrl } = useSiteSettings();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-forest text-forest-foreground py-2 px-4 text-center text-[11px] tracking-luxury uppercase">
        Curated Safari Journeys. Authentic Connections. Extraordinary Experiences.
      </div>

      <div className="bg-background border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-1 flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3 shrink-0 -my-2" aria-label="The Baobab Collective home">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="w-40 h-40 lg:w-44 lg:h-44 object-contain" />
            ) : (
              <BaobabLogo className="w-40 h-40 lg:w-44 lg:h-44" />
            )}
          </Link>

          <nav aria-label="Primary" className="hidden lg:flex items-center gap-7">
            {primaryItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="text-[12px] tracking-[0.2em] uppercase text-foreground/70 hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {item.label}
              </Link>
            ))}

            <div className="relative" onMouseLeave={() => setMoreOpen(false)}>
              <button
                onMouseEnter={() => setMoreOpen(true)}
                onClick={() => setMoreOpen((o) => !o)}
                className="text-[12px] tracking-[0.2em] uppercase text-foreground/70 hover:text-foreground inline-flex items-center gap-1"
              >
                More <ChevronDown className="w-3 h-3" />
              </button>
              {moreOpen && (
                <div className="absolute right-0 top-full pt-2">
                  <div className="bg-background border border-border shadow-lg py-2 min-w-[200px]">
                    {moreItems.map((m) => (
                      <Link
                        key={m.to}
                        to={m.to}
                        onClick={() => setMoreOpen(false)}
                        className="block px-5 py-2 text-[12px] tracking-[0.15em] uppercase text-foreground/75 hover:text-foreground hover:bg-cream"
                      >
                        {m.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            {user && isAdmin && (
              <>
                <Link to="/admin" className="text-[11px] tracking-[0.2em] uppercase text-gold hover:underline">
                  Admin
                </Link>
                <button onClick={signOut} className="text-[11px] tracking-[0.2em] uppercase text-foreground/70 hover:text-foreground">
                  Sign out
                </button>
              </>
            )}
            <EnquireDialog
              autosaveKey="enquire:navbar"
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center justify-center border border-gold text-gold uppercase tracking-[0.2em] text-[11px] px-5 py-3 hover:bg-gold hover:text-gold-foreground transition-colors"
                >
                  Enquire
                </button>
              }
            />
          </div>

          <button
            className="lg:hidden p-2"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden border-t border-border/40 bg-background px-6 py-4 flex flex-col gap-3 max-h-[80vh] overflow-y-auto">
            {[...primaryItems, ...moreItems].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="text-[12px] tracking-[0.2em] uppercase text-foreground/80 hover:text-foreground py-1"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 mt-2 border-t border-border/40 flex flex-col gap-3">
              {user && isAdmin && (
                <>
                  <Link to="/admin" onClick={() => setOpen(false)} className="text-[11px] tracking-[0.2em] uppercase text-gold">
                    Admin
                  </Link>
                  <button onClick={() => { setOpen(false); signOut(); }} className="text-left text-[11px] tracking-[0.2em] uppercase text-foreground/80">
                    Sign out
                  </button>
                </>
              )}
              <EnquireDialog
                autosaveKey="enquire:navbar"
                trigger={
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center border border-gold text-gold uppercase tracking-[0.2em] text-[11px] px-6 py-3 mt-2"
                  >
                    Enquire Now
                  </button>
                }
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
