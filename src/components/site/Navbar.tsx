import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, Search } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";

import { EnquireDialog } from "@/components/site/EnquireDialog";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useMenuConfig } from "@/hooks/useMenuConfig";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { logoUrl } = useSiteSettings();
  const menu = useMenuConfig();

  const primaryItems = menu.primary.filter((i) => !i.hidden);
  const moreItems = menu.more.filter((i) => !i.hidden);

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

  const overlay = !!menu.transparentOverHero;
  const linkBase =
    "text-[15px] tracking-[0.22em] uppercase font-semibold px-1 transition-colors";
  const linkColor = overlay
    ? "text-cream/85 hover:text-cream"
    : "text-foreground/80 hover:text-foreground";

  const topBar = menu.topBarEnabled && menu.topBarText ? (
    <div className="relative z-[60] bg-forest text-forest-foreground py-2 px-4 text-center text-[11px] tracking-luxury uppercase">
      {menu.topBarText}
    </div>
  ) : null;

  return (
    <>
      {/* Top bar stays above the floating nav so the logo overlay tucks underneath it. */}
      {overlay && topBar}
      <header className={overlay ? "absolute inset-x-0 z-50" : "sticky top-0 z-50"}>
        {!overlay && topBar}

        <div className={overlay ? "bg-transparent" : "bg-background border-b border-border/40"}>
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 py-1 flex items-center gap-4 lg:gap-6">

          <Link
            to="/"
            className="relative shrink-0 flex items-center h-16 sm:h-20 lg:h-24 w-16 sm:w-24 lg:w-32"
            aria-label="The Baobab Collective home"
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="The Baobab Collective"
                className="absolute left-0 top-1/2 -translate-y-1/2 h-28 sm:h-40 lg:h-52 w-auto max-w-none object-contain z-10 pointer-events-none"
              />
            ) : (
              <span className={`font-serif text-lg sm:text-xl lg:text-2xl leading-tight ${overlay ? "text-cream" : "text-foreground"}`}>
                The Baobab<br />Collective
              </span>
            )}
          </Link>


          <nav aria-label="Primary" className="hidden lg:flex flex-1 items-center justify-center gap-8 xl:gap-12">
            {primaryItems.map((item, i) => (
              item.children && item.children.length ? (
                <PrimaryWithSubmenu key={`${item.to}-${i}`} item={item} overlay={overlay} />
              ) : (
                <Link
                  key={`${item.to}-${i}`}
                  to={item.to as any}
                  activeOptions={{ exact: item.to === "/" }}
                  className={`${linkBase} ${linkColor}`}
                  activeProps={{ className: overlay ? "text-cream" : "text-foreground" }}
                >
                  {item.label}
                </Link>
              )
            ))}

            {moreItems.length > 0 && (
              <div className="relative" onMouseLeave={() => setMoreOpen(false)}>
                <button
                  onMouseEnter={() => setMoreOpen(true)}
                  onClick={() => setMoreOpen((o) => !o)}
                  className={`${linkBase} ${linkColor} inline-flex items-center gap-1`}
                >
                  More <ChevronDown className="w-3 h-3" />
                </button>
                {moreOpen && (
                  <div className="absolute right-0 top-full pt-2">
                    <div className="bg-background border border-border shadow-lg py-2 min-w-[220px]">
                      {moreItems.map((m, i) => (
                        <Link
                          key={`${m.to}-${i}`}
                          to={m.to as any}
                          onClick={() => setMoreOpen(false)}
                          className="block px-5 py-2 text-[14px] tracking-[0.2em] uppercase font-semibold text-foreground/80 hover:text-foreground hover:bg-cream"
                        >
                          {m.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>


          <div className="hidden lg:flex items-center gap-4 shrink-0">
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
            <button
              type="button"
              aria-label="Search"
              className="p-2 text-foreground/70 hover:text-foreground transition-colors"
            >
              <Search className="w-4 h-4" strokeWidth={1.75} />
            </button>
            {menu.ctaTo ? (
              <Link
                to={menu.ctaTo as any}
                className="inline-flex items-center justify-center rounded-full bg-gold text-gold-foreground uppercase tracking-[0.2em] text-[13px] px-6 py-3 hover:bg-gold/90 transition-colors"
              >
                {menu.ctaLabel}
              </Link>
            ) : (
              <EnquireDialog
                autosaveKey="enquire:navbar"
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full bg-gold text-gold-foreground uppercase tracking-[0.2em] text-[13px] px-6 py-3 hover:bg-gold/90 transition-colors"
                  >
                    {menu.ctaLabel}
                  </button>
                }
              />
            )}
          </div>

          <button
            className="lg:hidden p-2 ml-auto"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>


        {open && (
          <div className="lg:hidden border-t border-border/40 bg-background px-6 py-4 flex flex-col gap-3 max-h-[80vh] overflow-y-auto">
            {[...primaryItems, ...moreItems].map((item, i) => {
              const rawChildren = ("children" in item ? item.children : undefined) as
                | { label: string; to: string; hidden?: boolean }[] | undefined;
              const children = (rawChildren ?? []).filter((c) => !c.hidden);
              return (
                <div key={`${item.to}-${i}`}>
                  <Link
                    to={item.to as any}
                    onClick={() => setOpen(false)}
                    className="text-[12px] tracking-[0.2em] uppercase text-foreground/80 hover:text-foreground py-1 block"
                  >
                    {item.label}
                  </Link>
                  {children.length > 0 && (
                    <div className="pl-4 mt-1 flex flex-col gap-1">
                      {children.map((c) => (
                        <Link
                          key={c.to}
                          to={c.to as any}
                          onClick={() => setOpen(false)}
                          className="text-[11px] tracking-[0.2em] uppercase text-foreground/60 hover:text-foreground py-1"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
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
              {menu.ctaTo ? (
                <Link
                  to={menu.ctaTo as any}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center border border-gold text-gold uppercase tracking-[0.2em] text-[11px] px-6 py-3 mt-2"
                >
                  {menu.ctaLabel}
                </Link>
              ) : (
                <EnquireDialog
                  autosaveKey="enquire:navbar"
                  trigger={
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center justify-center border border-gold text-gold uppercase tracking-[0.2em] text-[11px] px-6 py-3 mt-2"
                    >
                      {menu.ctaLabel}
                    </button>
                  }
                />
              )}
            </div>
          </div>
        )}
      </div>
    </header>
    </>
  );
}


function PrimaryWithSubmenu({
  item,
  overlay,
}: {
  item: { label: string; to: string; children?: { label: string; to: string; hidden?: boolean }[] };
  overlay?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const kids = (item.children ?? []).filter((c) => !c.hidden);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Link
        to={item.to as any}
        className={`text-[13px] tracking-[0.24em] uppercase font-semibold inline-flex items-center gap-1 ${
          overlay ? "text-cream/85 hover:text-cream" : "text-foreground/80 hover:text-foreground"
        }`}
        activeProps={{ className: overlay ? "text-cream" : "text-foreground" }}
      >
        {item.label} <ChevronDown className="w-3 h-3" />
      </Link>
      {open && kids.length > 0 && (
        <div className="absolute left-0 top-full pt-2">
          <div className="bg-background border border-border shadow-lg py-2 min-w-[220px]">
            {kids.map((c) => (
              <Link
                key={c.to}
                to={c.to as any}
                onClick={() => setOpen(false)}
                className="block px-5 py-2 text-[12px] tracking-[0.2em] uppercase font-semibold text-foreground/80 hover:text-foreground hover:bg-cream"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
