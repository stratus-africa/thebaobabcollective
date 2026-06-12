import heroImg from "@/assets/hero-baobab.jpg";

export function Hero() {
  return (
    <section className="relative h-[600px] md:h-[640px] w-full overflow-hidden">
      <img
        src={heroImg}
        alt="Safari jeep beside baobab tree at sunset"
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/20 to-transparent" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 h-full flex items-center">
        <div className="max-w-lg animate-fade-up">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-foreground leading-[1.05]">
            JOURNEYS<br />THAT CONNECT
          </h1>
          <div className="w-16 h-px bg-gold my-7" />
          <p className="text-foreground/85 text-lg leading-relaxed mb-8">
            Curated safari experiences<br />
            that immerse, inspire and<br />
            leave a lasting impact.
          </p>
          <a
            href="#journeys"
            className="inline-flex items-center bg-gold text-gold-foreground uppercase tracking-[0.25em] text-[11px] px-8 py-4 hover:bg-gold/90 transition-colors"
          >
            Explore Journeys
          </a>
        </div>
      </div>
    </section>
  );
}
