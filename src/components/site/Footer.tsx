import { Instagram, Facebook, ArrowRight } from "lucide-react";
import { BaobabLogo } from "./Logo";

export function Footer() {
  return (
    <footer id="contact" className="bg-cream pt-16 pb-6">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-1">
          <div className="flex items-start gap-3 mb-4">
            <BaobabLogo className="w-12 h-12" />
            <div className="font-serif text-foreground leading-[1.05] text-[14px] tracking-[0.18em]">
              <div>THE</div>
              <div>BAOBAB</div>
              <div>COLLECTIVE</div>
            </div>
          </div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-foreground/60">
            Journeys That Connect
          </p>
        </div>

        <div>
          <h4 className="text-[11px] tracking-[0.25em] uppercase text-foreground mb-5">
            Quick Links
          </h4>
          <ul className="space-y-2 text-sm text-foreground/75">
            {["Home", "About", "Journeys", "Experiences", "About Africa", "Contact"].map((i) => (
              <li key={i}>
                <a href="#" className="hover:text-gold transition-colors uppercase tracking-wider text-[11px]">
                  {i}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] tracking-[0.25em] uppercase text-foreground mb-5">Journeys</h4>
          <ul className="space-y-2 text-sm text-foreground/75">
            {["Adventure", "Connection", "Heritage", "Conservation"].map((i) => (
              <li key={i}>
                <a href="#" className="hover:text-gold transition-colors uppercase tracking-wider text-[11px]">
                  {i}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] tracking-[0.25em] uppercase text-foreground mb-5">Get in Touch</h4>
          <p className="text-sm text-foreground/75 mb-1">hello@thebaobabcollective.com</p>
          <p className="text-sm text-foreground/75 mb-5">+27 00 000 0000</p>
          <div className="flex items-center gap-4 text-foreground/70">
            <a href="#" aria-label="Instagram" className="hover:text-gold"><Instagram className="w-4 h-4" /></a>
            <a href="#" aria-label="Facebook" className="hover:text-gold"><Facebook className="w-4 h-4" /></a>
            <a href="#" aria-label="Pinterest" className="hover:text-gold">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.09 2.46 7.6 5.97 9.13-.08-.78-.16-1.97.03-2.82.17-.76 1.1-4.84 1.1-4.84s-.28-.56-.28-1.39c0-1.3.75-2.27 1.7-2.27.8 0 1.18.6 1.18 1.32 0 .8-.51 2-.78 3.11-.22.93.47 1.69 1.39 1.69 1.67 0 2.95-1.76 2.95-4.3 0-2.25-1.62-3.82-3.93-3.82-2.68 0-4.25 2.01-4.25 4.09 0 .81.31 1.68.7 2.15.08.09.09.18.07.27-.07.31-.24.93-.27 1.06-.04.17-.14.21-.32.13-1.2-.56-1.95-2.31-1.95-3.72 0-3.03 2.2-5.81 6.34-5.81 3.33 0 5.92 2.37 5.92 5.54 0 3.31-2.08 5.97-4.98 5.97-.97 0-1.89-.5-2.2-1.1l-.6 2.28c-.22.83-.8 1.87-1.19 2.5.9.28 1.85.43 2.84.43 5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg>
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-[11px] tracking-[0.25em] uppercase text-foreground mb-5">Newsletter</h4>
          <p className="text-sm text-foreground/75 mb-4">
            Receive travel inspiration and special offers.
          </p>
          <form className="flex border border-border bg-background">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-3 py-3 text-sm bg-transparent outline-none placeholder:text-foreground/40"
            />
            <button type="submit" className="bg-forest text-forest-foreground px-4" aria-label="Subscribe">
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-14 pt-6 border-t border-border/60">
        <p className="text-center text-[11px] tracking-[0.2em] uppercase text-foreground/60">
          © The Baobab Collective 2024 &nbsp;|&nbsp; All Rights Reserved &nbsp;|&nbsp;
          <a href="#" className="hover:text-gold"> Privacy Policy</a>
        </p>
      </div>
    </footer>
  );
}
