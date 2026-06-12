import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { WithContext, BreadcrumbList } from "schema-dts";

import { CTAButton } from "@/components/ui/CTAButton";
import { CategoryNav } from "@/components/blog/CategoryNav";
import { JsonLd } from "@/components/blog/JsonLd";
import { PostCard } from "@/components/blog/PostCard";
import { getPostsByCategory } from "@/lib/blog";
import { CATEGORIES, SITE_URL, WHATSAPP_URL } from "@/lib/site";

/**
 * Rota de categoria /blog/categoria/[slug] — RSC dinâmica, SSG (BLOG-06, SEO-02/05).
 *
 * Filtragem por categoria é por ROTAS indexáveis reais, NÃO por pills client
 * (D-08): cada categoria é uma página rankeável com metadados próprios + canonical
 * + BreadcrumbList JSON-LD (Início -> Blog -> Categoria). generateStaticParams
 * enumera SÓ as 4 CATEGORIES fixas; qualquer outro slug -> notFound() (T-04-09).
 *
 * Next 16: `params` é uma Promise — sempre await, na página E no generateMetadata.
 */

const ABS = (path: string) => new URL(path, SITE_URL).toString();

/** Resolve a categoria a partir do slug; undefined se não for uma das 4. */
function findCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export async function generateStaticParams() {
  // O conjunto fixo de 4 categorias (D-01) — nenhuma outra rota de categoria
  // existe. Um slug fora disso cai no notFound() abaixo (404).
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = findCategory(slug);
  if (!category) return {};

  const title = `${category.label} · Dino Team`;
  const description = `Artigos sobre ${category.label.toLowerCase()} — o método do mais alto nível, traduzido em direção para você executar.`;

  return {
    title,
    description,
    alternates: { canonical: `/blog/categoria/${slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/blog/categoria/${slug}`,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = findCategory(slug);
  if (!category) notFound();

  const posts = getPostsByCategory(slug);

  const breadcrumbJson: WithContext<BreadcrumbList> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: ABS("/") },
      { "@type": "ListItem", position: 2, name: "Blog", item: ABS("/blog") },
      {
        "@type": "ListItem",
        position: 3,
        name: category.label,
        item: ABS(`/blog/categoria/${slug}`),
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJson} />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-line/60 bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="font-display text-2xl uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg"
          >
            Dino Team
          </Link>
          <CTAButton href={WHATSAPP_URL} className="px-5 py-2.5 text-xs">
            Quero minha direção
          </CTAButton>
        </div>
      </header>

      <main className="px-6 py-24 pt-[calc(theme(spacing.24)+4rem)] sm:py-32 sm:pt-[calc(theme(spacing.32)+4rem)]">
        <div className="mx-auto max-w-6xl">
          {/* Cabeçalho da categoria — kicker = rótulo da categoria uppercase */}
          <header>
            <p className="font-body text-sm uppercase tracking-[0.3em] text-muted">
              {category.label}
            </p>
            <h1 className="mt-2 font-display text-4xl uppercase leading-[1.1] text-fg sm:text-5xl">
              {category.label}
            </h1>
          </header>

          {/* Navegação de categorias (rotas reais) — atual em destaque */}
          <div className="mt-8 border-y border-line py-6">
            <CategoryNav current={slug} />
          </div>

          {posts.length === 0 ? (
            // Estado vazio por categoria (UI-SPEC §Copywriting) — sem skeleton.
            <section className="mt-16 max-w-[68ch]">
              <h2 className="font-display text-2xl uppercase leading-[1.2] text-fg sm:text-3xl">
                Ainda não há artigos por aqui.
              </h2>
              <p className="mt-4 font-body text-base leading-relaxed text-muted">
                Nenhum artigo em {category.label} ainda. O conteúdo está a
                caminho. Enquanto isso, sua direção pode começar agora —
              </p>
              <div className="mt-6">
                <CTAButton href={WHATSAPP_URL}>Quero minha direção</CTAButton>
              </div>
            </section>
          ) : (
            <div className="mt-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} variant="grid" />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-line px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <span className="font-display text-xl uppercase tracking-wide">
            Dino Team
          </span>
          <p className="font-body text-sm text-muted">
            Consultoria de treino e dieta · O método do mais alto nível,
            adaptado para você.
          </p>
          <nav className="flex gap-5 font-body text-sm text-muted">
            <Link
              href="/blog"
              className="hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg"
            >
              Blog
            </Link>
            <Link
              href="/privacidade"
              className="hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg"
            >
              Política de Privacidade
            </Link>
            <Link
              href="/termos"
              className="hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg"
            >
              Termos de Uso
            </Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
