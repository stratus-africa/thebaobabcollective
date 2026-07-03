import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { articles, getArticle } from "@/lib/content";

export const Route = createFileRoute("/journal/$slug")({
  loader: ({ params }) => {
    const article = getArticle(params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => {
    const a = loaderData?.article;
    const title = a ? `${a.title} — The Baobab Collective Journal` : "Journal";
    const desc = a?.excerpt ?? "Safari stories and inspiration.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: a?.title ?? title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: a ? `/journal/${a.slug}` : "/journal" },
      ],
      links: a ? [{ rel: "canonical", href: `/journal/${a.slug}` }] : [],
      scripts: a
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                headline: a.title,
                description: a.excerpt,
                datePublished: a.date,
              }),
            },
          ]
        : [],
    };
  },
  notFoundComponent: () => (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-32 text-center">
        <h1 className="font-serif text-4xl mb-4">Article not found</h1>
        <Link to="/journal" className="text-gold underline">Back to Journal</Link>
      </main>
      <Footer />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-32 text-center">
        <h1 className="font-serif text-3xl mb-4">Something went wrong</h1>
        <p className="text-foreground/70">{error.message}</p>
      </main>
      <Footer />
    </div>
  ),
  component: ArticlePage,
});

function ArticlePage() {
  const { article } = Route.useLoaderData();
  const related = articles.filter((a) => a.slug !== article.slug);

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main>
        <article>
          <header className="bg-cream py-16 md:py-24">
            <div className="max-w-3xl mx-auto px-6 text-center">
              <Link to="/journal" className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-foreground/60 hover:text-gold mb-8">
                <ArrowLeft className="w-3 h-3" /> Back to Journal
              </Link>
              <p className="text-[11px] tracking-[0.3em] uppercase text-terracotta mb-4">{article.category} · {article.readTime}</p>
              <h1 className="font-serif text-4xl md:text-5xl text-foreground leading-[1.1] mb-5">{article.title}</h1>
              <p className="text-sm text-foreground/60">{article.date}</p>
            </div>
          </header>

          <div className="max-w-5xl mx-auto px-6 lg:px-10 -mt-8 md:-mt-12">
            <div className="aspect-[16/9] overflow-hidden">
              <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="max-w-3xl mx-auto px-6 py-16 md:py-20">
            <div className="space-y-6 text-foreground/85 text-lg leading-relaxed font-serif">
              {article.content.map((p: string, i: number) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </article>

        <section aria-labelledby="related" className="bg-cream py-20">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
            <h2 id="related" className="font-serif text-3xl text-foreground text-center mb-12">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-10">
              {related.map((a) => (
                <Link
                  key={a.slug}
                  to="/journal/$slug"
                  params={{ slug: a.slug }}
                  className="group grid grid-cols-[140px_1fr] gap-5 items-center"
                >
                  <div className="overflow-hidden aspect-square">
                    <img src={a.image} alt={a.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.25em] uppercase text-gold mb-1">{a.category}</p>
                    <h3 className="font-serif text-xl text-foreground group-hover:text-gold transition-colors mb-2">{a.title}</h3>
                    <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-foreground/70">
                      Read <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
