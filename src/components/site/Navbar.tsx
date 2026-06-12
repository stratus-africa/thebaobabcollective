import { useState } from "react";
import { Menu, X } from "lucide-react";
import { BaobabLogo } from "./Logo";

const navItems = ["Home", "About", "Journeys", "Experiences", "About Africa", "Contact"];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("Home");

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement bar */}
      <div className="bg-forest text-forest-foreground py-2 px-4 text-center text-[11px] tracking-luxury uppercase">
        Curated Safari Journeys. Authentic Connections. Extraordinary Experiences.
      </div>

      {/* Main nav */}
      <div className="bg-background border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between gap-6">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 shrink-0">
            <BaobabLogo className="w-12 h-12" />
            <div className="font-serif text-foreground leading-[1.05] text-[15px] tracking-[0.18em]">
              <div>THE</div>
              <div>BAOBAB</div>
              <div>COLLECTIVE</div>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-9">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => setActive(item)}
                className={`text-[12px] tracking-[0.2em] uppercase transition-colors relative pb-1 ${
                  active === item ? "text-foreground" : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {item}
                {active === item && (
                  <span className="absolute left-0 right-0 -bottom-0.5 h-px bg-gold" />
                )}
              </button>
            ))}
          </nav>

          {/* CTA */}
          <a
            href="#contact"
            className="hidden lg:inline-flex items-center justify-center border border-gold text-gold uppercase tracking-[0.2em] text-[11px] px-6 py-3 hover:bg-gold hover:text-gold-foreground transition-colors"
          >
            Enquire Now
          </a>

          {/* Mobile menu btn */}
          <button
            className="lg:hidden p-2"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden border-t border-border/40 bg-background px-6 py-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setActive(item);
                  setOpen(false);
                }}
                className="text-left text-[12px] tracking-[0.2em] uppercase text-foreground/80"
              >
                {item}
              </button>
            ))}
            <a
              href="#contact"
              className="inline-flex items-center justify-center border border-gold text-gold uppercase tracking-[0.2em] text-[11px] px-6 py-3 mt-2"
            >
              Enquire Now
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
