import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, Instagram, Facebook } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { EnquireDialog } from "@/components/site/EnquireDialog";

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
  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main>
        <section className="bg-cream py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6 lg:px-10 grid lg:grid-cols-[5fr_7fr] gap-14 items-start">
            <div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-terracotta mb-5">
                We'd love to hear from you
              </p>
              <h1 className="font-serif text-5xl md:text-6xl text-foreground leading-[1.05] mb-8">
                Let's Plan<br />Your Journey
              </h1>
              <p className="text-foreground/75 mb-8 leading-relaxed">
                Tell us a little about who's travelling, when, and the kind of experience you're after.
                One of our journey designers will respond within 24 hours with first ideas and next steps.
              </p>
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
                    <p className="text-[11px] tracking-[0.25em] uppercase text-foreground mb-1">Instagram</p>
                    <a href="https://instagram.com/thebaobabcollective" target="_blank" rel="noreferrer" className="hover:text-gold">@thebaobabcollective</a>
                  </div>
                </li>
                <li className="flex gap-4">
                  <Facebook className="w-5 h-5 text-gold mt-1 shrink-0" />
                  <div>
                    <p className="text-[11px] tracking-[0.25em] uppercase text-foreground mb-1">Facebook</p>
                    <a href="https://facebook.com/thebaobabcollective" target="_blank" rel="noreferrer" className="hover:text-gold">/thebaobabcollective</a>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-background border border-border p-8 md:p-10">
              <p className="text-[11px] tracking-[0.3em] uppercase text-terracotta mb-4">Start an enquiry</p>
              <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
                Share Your Vision
              </h2>
              <p className="text-foreground/70 mb-8 leading-relaxed">
                Open our detailed enquiry form — tell us who's travelling, when, your budget,
                and the experiences you're dreaming of. We'll respond within 24 hours.
              </p>
              <EnquireDialog
                trigger={
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center gap-2 bg-terracotta text-gold-foreground uppercase tracking-[0.25em] text-[12px] py-4 hover:bg-terracotta/90 transition-colors"
                  >
                    Open Enquiry Form
                  </button>
                }
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
