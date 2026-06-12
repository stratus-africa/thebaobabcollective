import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { BaobabLogo } from "./Logo";

const navItems = [
  { label: "Home", to: "/" as const },
  { label: "About", to: "/about" as const },
  { label: "Journeys", to: "/journeys" as const },
  { label: "Journal", to: "/journal" as const },
  { label: "About Africa", to: "/about-africa" as const },
  { label: "Contact", to: "/contact" as const },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-forest text-forest-foreground py-2 px-4 text-center text-[11px] tracking-luxury uppercase">
        Curated Safari Journeys. Authentic Connections. Extraordinary Experiences.
      </div>

      <div className="bg-background border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="The Baobab Collective home">
            <BaobabLogo className="w-12 h-12" />
            <div className="font-serif text-foreground leading-[1.05] text-[15px] tracking-[0.18em]">
              <div>THE</div>
              <div>BAOBAB</div>
              <div>COLLECTIVE</div>
            </div>
          </Link>

          <nav aria-label="Primary" className="hidden lg:flex items-center gap-9">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="text-[12px] tracking-[0.2em] uppercase text-foreground/70 hover:text-foreground transition-colors relative pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                activeProps={{ className: "text-foreground [&>span]:opacity-100" }}
              >
                {item.label}
                <span className="absolute left-0 right-0 -bottom-0.5 h-px bg-gold opacity-0 transition-opacity" />
              </Link>
            ))}
          </nav>

          <Link
            to="/contact"
            className="hidden lg:inline-flex items-center justify-center border border-gold text-gold uppercase tracking-[0.2em] text-[11px] px-6 py-3 hover:bg-gold hover:text-gold-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          >
            Enquire Now
          </Link>

          <button
            className="lg:hidden p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden border-t border-border/40 bg-background px-6 py-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="text-[12px] tracking-[0.2em] uppercase text-foreground/80 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center border border-gold text-gold uppercase tracking-[0.2em] text-[11px] px-6 py-3 mt-2"
            >
              Enquire Now
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
