import { ArrowRight, Sun, Leaf, Globe, Trees } from "lucide-react";

const categories = [
  {
    icon: Sun,
    title: "Adventure",
    desc: "Wild landscapes and thrilling encounters that awaken your sense of wonder.",
  },
  {
    icon: Leaf,
    title: "Connection",
    desc: "Meaningful moments with people, culture and the natural world.",
  },
  {
    icon: Globe,
    title: "Heritage",
    desc: "Honouring the rich stories and traditions that shape Africa.",
  },
  {
    icon: Trees,
    title: "Conservation",
    desc: "Supporting conservation and communities for a more sustainable future.",
  },
];

export function Journeys() {
  return (
    <section id="journeys" className="bg-background py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-[11px] tracking-[0.3em] uppercase text-foreground/70 mb-4">
            Curated Safari Journeys
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-5 tracking-wider">
            OUR JOURNEYS
          </h2>
          <p className="text-foreground/70 leading-relaxed">
            Thoughtfully curated experiences that celebrate adventure, connection and heritage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border/60">
          {categories.map((c) => (
            <div
              key={c.title}
              className="bg-background p-8 text-center flex flex-col items-center group hover:bg-cream transition-colors"
            >
              <c.icon className="w-14 h-14 text-gold mb-6" strokeWidth={1.2} />
              <h3 className="text-[13px] tracking-[0.25em] uppercase text-foreground mb-4">
                {c.title}
              </h3>
              <p className="text-sm text-foreground/70 leading-relaxed mb-8 flex-1">{c.desc}</p>
              <a
                href="#"
                className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-foreground group-hover:text-gold transition-colors"
              >
                View Journeys <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
