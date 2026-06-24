import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Compass,
  Mountain,
  Waves,
  Sun,
  Footprints,
  Tent,
  Binoculars,
  Plane,
  Check,
  Calendar,
  Gauge,
  MapPin,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { getJourney } from "@/lib/content";
import heroBaobab from "@/assets/hero-baobab.jpg";
import elephant from "@/assets/elephant.jpg";
import lodgeTent from "@/assets/lodge-tent.jpg";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";

export const Route = createFileRoute("/adventures")({
  head: () => ({
    meta: [
      { title: "Safari Adventures — Wild Africa, Deeply Lived | The Baobab Collective" },
      {
        name: "description",
        content:
          "Walking safaris, mokoro expeditions, desert traverses, gorilla treks and migration chases. Discover our most immersive adventures across Africa's wildest landscapes.",
      },
      { property: "og:title", content: "Safari Adventures — The Baobab Collective" },
      {
        property: "og:description",
        content: "Bespoke wild adventures across Africa — walking safaris, deserts, deltas and gorilla treks.",
      },
      { property: "og:image", content: heroBaobab },
      { property: "og:url", content: "/adventures" },
    ],
    links: [{ rel: "canonical", href: "/adventures" }],
  }),
  component: AdventuresPage,
});

const terrainTypes = [
  { icon: Mountain, label: "Mountain & Highlands", note: "Rwenzori, Atlas, Drakensberg" },
  { icon: Waves, label: "Delta & Waterways", note: "Okavango, Zambezi, Bangweulu" },
  { icon: Sun, label: "Desert & Dunes", note: "Namib, Kalahari, Danakil" },
  { icon: Footprints, label: "Bush & Savannah", note: "Serengeti, Mara, Luangwa" },
  { icon: Tent, label: "Remote Wilderness", note: "Selous, Kafue, Mahale" },
  { icon: Waves, label: "Coastal & Marine", note: "Bazaruto, Quirimbas, Zanzibar" },
];

const styles = [
  {
    icon: Footprints,
    title: "Walking Safaris",
    body: "Track wildlife on foot with master guides — the original safari, on its truest terms.",
  },
  {
    icon: Binoculars,
    title: "Big Game Expeditions",
    body: "Private vehicles, off-road permissions and the patience to wait for the moment.",
  },
  {
    icon: Waves,
    title: "Water Safaris",
    body: "Mokoro, dhow and houseboat — quiet, low-impact ways into Africa's wettest wildernesses.",
  },
  {
    icon: Plane,
    title: "Fly-Camping & Bush Sleep-outs",
    body: "Stars overhead, lantern light, the call of a distant lion. The wildest night of your life.",
  },
  {
    icon: Mountain,
    title: "Trekking & Climbs",
    body: "Gorilla and chimp treks, Kilimanjaro, Mount Kenya, volcano scrambles in the Virungas.",
  },
  {
    icon: Compass,
    title: "Expedition Routes",
    body: "Multi-country traverses for travellers who want the journey to be the destination.",
  },
];

const signature = [
  {
    name: "Okavango on Foot",
    region: "Botswana",
    nights: "8 nights",
    difficulty: "Moderate",
    image: lodgeTent,
    description:
      "A walking safari camp deep in a private concession. Days on foot, afternoons in the mokoro, nights under canvas with the Delta humming all around.",
    highlights: ["Daily walking safaris", "Mokoro at sunrise", "Tracker apprenticeship", "Star-bed sleep-out"],
  },
  {
    name: "Namib Traverse",
    region: "Namibia",
    nights: "10 nights",
    difficulty: "Active",
    image: g3,
    description:
      "From the apricot dunes of Sossusvlei to the wreck-strewn Skeleton Coast — a self-flown adventure across the world's oldest desert.",
    highlights: ["Dawn climb at Big Daddy", "Private bush flights", "Desert-adapted lion tracking", "Hot-air balloon"],
  },
  {
    name: "Great Migration Chase",
    region: "Tanzania & Kenya",
    nights: "9 nights",
    difficulty: "Easy",
    image: elephant,
    description:
      "Follow the herds across the Mara and Serengeti in private mobile camps positioned exactly where the crossings unfold.",
    highlights: ["Mara River crossings", "Private mobile camps", "Hot-air balloon at dawn", "Maasai guides"],
  },
  {
    name: "Virunga Gorilla Trek",
    region: "Rwanda & Uganda",
    nights: "7 nights",
    difficulty: "Challenging",
    image: g1,
    description:
      "Two gorilla permits, golden monkey tracking and a Bwindi forest immersion — the most moving wildlife encounter on earth.",
    highlights: ["Twin gorilla treks", "Golden monkeys", "Forest community visit", "Lake Kivu finale"],
  },
  {
    name: "Lower Zambezi by Canoe",
    region: "Zambia",
    nights: "6 nights",
    difficulty: "Active",
    image: g2,
    description:
      "Paddle the Zambezi alongside elephants drinking at the bank, sleeping on river islands with only the hippos for neighbours.",
    highlights: ["Three-day canoe traverse", "Walking with a senior guide", "Island fly-camp", "Tiger fishing"],
  },
  {
    name: "Ethiopian Highlands Expedition",
    region: "Ethiopia",
    nights: "11 nights",
    difficulty: "Challenging",
    image: g4,
    description:
      "Trek the Simien escarpments with gelada baboons, then descend into the Danakil — sulphur lakes, salt flats and active volcanoes.",
    highlights: ["Simien trek", "Erta Ale crater rim", "Lalibela churches", "Danakil salt caravans"],
  },
];

const difficultyMeta: Record<string, { dots: number; tone: string }> = {
  Easy: { dots: 1, tone: "text-foreground/70" },
  Moderate: { dots: 2, tone: "text-foreground/70" },
  Active: { dots: 3, tone: "text-terracotta" },
  Challenging: { dots: 4, tone: "text-terracotta" },
};

const rhythm = [
  {
    when: "Dawn",
    title: "First light, first tracks",
    body: "Coffee in camp, then out before the bush wakes — when leopards are still moving and the light is liquid gold.",
  },
  {
    when: "Mid-Morning",
    title: "Encounter & Read",
    body: "Time on foot with your guide reading sign, story and silence. The richest hours of any adventure day.",
  },
  {
    when: "Afternoon",
    title: "Slow & Local",
    body: "Rest, swim, journal, or sit with a tracker over tea. The bush is hot, and so is your patience for it.",
  },
  {
    when: "Sundown",
    title: "Sundowner & Story",
    body: "Gin in hand on a kopje, an escarpment, a mokoro — wherever the day has carried you. Then dinner under the stars.",
  },
];

const planning = [
  {
    icon: Calendar,
    title: "When to go",
    body: "Dry season (Jun–Oct) for classic game viewing. Green season (Nov–Apr) for birds, predators and fewer travellers.",
  },
  {
    icon: Gauge,
    title: "Choosing your pace",
    body: "We match every adventure to your fitness, family makeup and appetite for remoteness — never the other way around.",
  },
  {
    icon: MapPin,
    title: "Where it goes",
    body: "Single-country deep dives or multi-country expeditions. We design the route around the wildlife and the season.",
  },
];

function AdventuresPage() {
  const journey = getJourney("adventure");

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main>
        {/* HERO */}
        <section className="relative h-[78vh] min-h-[560px] flex items-end">
          <img
            src={heroBaobab}
            alt="Sunrise over the African bush — a guide leads a walking safari toward distant baobabs"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pb-20 text-background w-full">
            <p className="text-[11px] tracking-[0.35em] uppercase text-gold mb-5">Adventures</p>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1] mb-6 max-w-4xl">
              Wild Africa,<br />deeply lived.
            </h1>
            <p className="text-lg md:text-xl text-background/85 max-w-2xl leading-relaxed mb-8">
              Walking safaris, mokoro mornings, gorilla treks, desert traverses. The adventures we build are slow, private and shaped by the people who know the land best.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#signature"
                className="inline-flex items-center gap-2 bg-gold text-gold-foreground uppercase tracking-[0.25em] text-[11px] px-7 py-4 hover:bg-gold/90"
              >
                Featured Adventures <ArrowRight className="w-3 h-3" />
              </a>
              <Link
                to="/private-travel"
                className="inline-flex items-center gap-2 border border-background/70 text-background uppercase tracking-[0.25em] text-[11px] px-7 py-4 hover:bg-background hover:text-foreground transition-colors"
              >
                Design Your Own
              </Link>
            </div>
          </div>
        </section>

        {/* STATEMENT */}
        <section className="py-24 md:py-32 bg-cream">
          <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
            <p className="text-[11px] tracking-[0.3em] uppercase text-terracotta mb-6">The Philosophy</p>
            <p className="font-serif text-2xl md:text-3xl text-foreground leading-relaxed">
              Adventure isn't a checklist. It's the long walk that turns into a discovery, the silence that holds you on a riverbank, the elder who lets you sit with the fire. We craft the conditions — Africa does the rest.
            </p>
          </div>
        </section>

        {/* TERRAINS */}
        <section className="py-24 border-b border-border/40">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
              <div>
                <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">Terrain</p>
                <h2 className="font-serif text-4xl md:text-5xl text-foreground max-w-2xl">Six landscapes, one continent.</h2>
              </div>
              <p className="text-foreground/70 max-w-md">
                Every adventure begins with terrain. Tell us what calls you — we'll route you to the wildest version of it.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border/60">
              {terrainTypes.map((t) => (
                <div key={t.label} className="bg-background p-8 hover:bg-cream transition-colors">
                  <t.icon className="w-7 h-7 text-terracotta mb-5" strokeWidth={1.4} />
                  <h3 className="font-serif text-xl text-foreground mb-2">{t.label}</h3>
                  <p className="text-sm text-foreground/65">{t.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STYLES */}
        <section className="py-24 bg-forest text-forest-foreground">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">Styles of Adventure</p>
              <h2 className="font-serif text-4xl md:text-5xl">Choose how you meet the wild.</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {styles.map((s) => (
                <div key={s.title} className="border-l border-gold/40 pl-6 py-1">
                  <s.icon className="w-6 h-6 text-gold mb-4" strokeWidth={1.4} />
                  <h3 className="font-serif text-2xl mb-2">{s.title}</h3>
                  <p className="text-forest-foreground/75 leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SIGNATURE ADVENTURES */}
        <section id="signature" className="py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-[11px] tracking-[0.3em] uppercase text-terracotta mb-4">Signature Adventures</p>
              <h2 className="font-serif text-4xl md:text-5xl text-foreground">Six journeys we'd take ourselves.</h2>
              <p className="text-foreground/70 mt-5">
                Each is a starting point — every detail is reshaped around you, your dates and your pace.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-x-8 gap-y-16">
              {signature.map((a) => {
                const meta = difficultyMeta[a.difficulty] ?? difficultyMeta.Moderate;
                return (
                  <article key={a.name} className="group">
                    <div className="overflow-hidden aspect-[4/3] mb-6">
                      <img
                        src={a.image}
                        alt={`${a.name} — ${a.region}`}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] tracking-[0.2em] uppercase text-foreground/60 mb-3">
                      <span className="inline-flex items-center gap-2 text-gold">
                        <MapPin className="w-3 h-3" /> {a.region}
                      </span>
                      <span>{a.nights}</span>
                      <span className={`inline-flex items-center gap-2 ${meta.tone}`}>
                        {a.difficulty}
                        <span className="inline-flex gap-0.5">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <span
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${i < meta.dots ? "bg-current" : "bg-current/25"}`}
                            />
                          ))}
                        </span>
                      </span>
                    </div>
                    <h3 className="font-serif text-3xl text-foreground mb-3">{a.name}</h3>
                    <p className="text-foreground/75 leading-relaxed mb-5">{a.description}</p>
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6">
                      {a.highlights.map((h) => (
                        <li key={h} className="flex gap-2 text-sm text-foreground/75">
                          <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-foreground border-b border-gold pb-1 hover:text-gold"
                    >
                      Enquire about {a.name.split(" ")[0]} <ArrowRight className="w-3 h-3" />
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* RHYTHM OF A DAY */}
        <section className="py-24 bg-cream">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="grid lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-4 lg:sticky lg:top-32">
                <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">A Day in the Field</p>
                <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-6">The rhythm of an adventure day.</h2>
                <p className="text-foreground/70 leading-relaxed">
                  No two days repeat — but the cadence is the same. Up before the bush, slow through the heat, alive again at dusk.
                </p>
              </div>
              <ol className="lg:col-span-8 space-y-10">
                {rhythm.map((r, i) => (
                  <li key={r.when} className="grid grid-cols-[auto_1fr] gap-6 md:gap-10">
                    <div className="text-right">
                      <div className="font-serif text-4xl text-terracotta">{String(i + 1).padStart(2, "0")}</div>
                      <div className="text-[11px] tracking-[0.25em] uppercase text-foreground/55 mt-1">{r.when}</div>
                    </div>
                    <div className="border-l border-border pl-6 md:pl-8 pb-2">
                      <h3 className="font-serif text-2xl text-foreground mb-2">{r.title}</h3>
                      <p className="text-foreground/70 leading-relaxed">{r.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* PLANNING */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="text-[11px] tracking-[0.3em] uppercase text-terracotta mb-4">Plan with us</p>
              <h2 className="font-serif text-4xl md:text-5xl text-foreground">Three questions to begin.</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              {planning.map((p) => (
                <div key={p.title} className="text-center px-4">
                  <p.icon className="w-8 h-8 text-gold mx-auto mb-5" strokeWidth={1.3} />
                  <h3 className="font-serif text-2xl text-foreground mb-3">{p.title}</h3>
                  <p className="text-foreground/70 leading-relaxed">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORY ITINERARIES (linked) */}
        {journey && (
          <section className="py-20 bg-cream border-t border-border/40">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
              <div className="flex items-end justify-between mb-10">
                <h2 className="font-serif text-3xl md:text-4xl text-foreground">More from Adventure</h2>
                <Link
                  to="/journeys/$slug"
                  params={{ slug: "adventure" }}
                  className="hidden md:inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-foreground hover:text-gold"
                >
                  All adventure itineraries <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {journey.itineraries.map((it) => (
                  <div key={it.name} className="bg-background border border-border/50">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={it.image} alt={it.name} loading="lazy" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-6">
                      <p className="text-[11px] tracking-[0.25em] uppercase text-gold mb-2">{it.nights}</p>
                      <h3 className="font-serif text-2xl text-foreground mb-2">{it.name}</h3>
                      <p className="text-sm text-foreground/70 line-clamp-3">{it.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-forest text-forest-foreground py-24 text-center">
          <div className="max-w-2xl mx-auto px-6">
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-5">Begin</p>
            <h2 className="font-serif text-4xl md:text-5xl mb-5">Your adventure, our craft.</h2>
            <p className="text-forest-foreground/80 mb-8 leading-relaxed">
              Share your dates, your dreams and the shape of your travelling party. We'll respond within 24 hours with a first sketch.
            </p>
            <Link
              to="/private-travel"
              className="inline-flex items-center gap-2 bg-gold text-gold-foreground uppercase tracking-[0.25em] text-[12px] px-8 py-4 hover:bg-gold/90"
            >
              Request Your Adventure <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
