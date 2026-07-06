import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { About } from "@/components/site/About";
import { getPageContent } from "@/lib/page-content.functions";
import { PAGE_DEFAULTS } from "@/lib/page-content.defaults";
import { usePreviewMerge } from "@/lib/preview-overrides";

export const Route = createFileRoute("/about")({
  loader: async () => {
    const [about, mission, values, team] = await Promise.all([
      getPageContent({ data: { key: "about" } }).catch(() => null),
      getPageContent({ data: { key: "about_mission" } }).catch(() => null),
      getPageContent({ data: { key: "about_values" } }).catch(() => null),
      getPageContent({ data: { key: "about_team" } }).catch(() => null),
    ]);
    return { about, mission, values, team };
  },
  head: () => ({
    meta: [
      { title: "About — The Baobab Collective" },
      { name: "description", content: "Born from a love of Africa. Built on connection. Meet the people behind The Baobab Collective." },
      { property: "og:title", content: "About — The Baobab Collective" },
      { property: "og:description", content: "We don't just plan trips, we create meaningful connections." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function MissionSection({ content }: { content: any }) {
  const c = usePreviewMerge("about_mission", { ...PAGE_DEFAULTS.about_mission, ...(content ?? {}) });
  return (
    <section className="bg-background py-20">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 max-w-3xl text-center">
        <p className="text-[11px] tracking-[0.3em] uppercase text-foreground/70 mb-3">{c.eyebrow}</p>
        <h2 className="font-serif text-3xl md:text-4xl mb-6">{c.title}</h2>
        <p className="text-foreground/75 leading-relaxed">{c.body}</p>
      </div>
    </section>
  );
}

function ValuesSection({ content }: { content: any }) {
  const c: any = usePreviewMerge("about_values", { ...PAGE_DEFAULTS.about_values, ...(content ?? {}) });
  const items = [1, 2, 3, 4].map((n) => ({
    title: c[`value_${n}_title`],
    body: c[`value_${n}_body`],
  }));
  return (
    <section className="bg-cream py-20">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <div className="text-center mb-12">
          <p className="text-[11px] tracking-[0.3em] uppercase text-foreground/70 mb-3">{c.eyebrow}</p>
          <h2 className="font-serif text-3xl md:text-4xl">{c.title}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((it, i) => (
            <div key={i} className="bg-background border border-border p-6">
              <h3 className="text-[13px] tracking-[0.2em] uppercase mb-3 text-gold">{it.title}</h3>
              <p className="text-sm text-foreground/75 leading-relaxed">{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamSection({ content }: { content: any }) {
  const c: any = usePreviewMerge("about_team", { ...PAGE_DEFAULTS.about_team, ...(content ?? {}) });
  const members = [1, 2, 3, 4]
    .map((n) => ({
      url: c[`image_${n}_url`] as string,
      name: c[`image_${n}_name`] as string,
      role: c[`image_${n}_role`] as string,
      bio: c[`image_${n}_bio`] as string,
    }))
    .filter((m) => m.url || m.name);
  return (
    <section className="bg-background py-20">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-[11px] tracking-[0.3em] uppercase text-foreground/70 mb-3">{c.eyebrow}</p>
          <h2 className="font-serif text-3xl md:text-4xl mb-6">{c.title}</h2>
          <p className="text-foreground/75 leading-relaxed">{c.body}</p>
        </div>
        {members.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {members.map((m, i) => (
              <div key={i} className="text-center">
                {m.url ? (
                  <img
                    src={m.url}
                    alt={m.name || `Team member ${i + 1}`}
                    loading="lazy"
                    className="w-full aspect-[3/4] object-cover mb-4 bg-cream"
                  />
                ) : (
                  <div className="w-full aspect-[3/4] bg-cream mb-4" />
                )}
                {m.name && <p className="font-serif text-lg text-foreground">{m.name}</p>}
                {m.role && (
                  <p className="text-[11px] tracking-[0.2em] uppercase text-foreground/60 mt-1">
                    {m.role}
                  </p>
                )}
                {m.bio && (
                  <p className="text-sm text-foreground/70 mt-3 leading-relaxed">{m.bio}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}


function AboutPage() {
  const { about, mission, values, team } = Route.useLoaderData();
  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main>
        <About content={about} />
        <MissionSection content={mission} />
        <ValuesSection content={values} />
        <TeamSection content={team} />
        <section className="bg-cream py-16 text-center">
          <Link to="/contact" className="inline-flex border border-gold text-gold uppercase tracking-[0.25em] text-[11px] px-8 py-4 hover:bg-gold hover:text-gold-foreground transition-colors">
            Plan Your Journey
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
