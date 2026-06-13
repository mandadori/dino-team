import type { Metadata } from "next";
import Link from "next/link";

import { CTAButton } from "@/components/ui/CTAButton";
import { CategoryNav } from "@/components/blog/CategoryNav";
import { PostCard } from "@/components/blog/PostCard";
import { NewsletterForm } from "@/components/blog/NewsletterForm";
import { getAllPosts, type Post } from "@/lib/blog";
import { WHATSAPP_URL } from "@/lib/site";

/**
 * Listagem do blog /blog — RSC, SSG (BLOG-02, SEO-02).
 *
 * Padrão featured + grid (D-07): o post em destaque é o que tem `featured: true`;
 * quando nenhum (ou mais de um) está marcado, cai no mais recente (o loader já
 * ordena por data desc). Reaproveita PostCard (Wave 3) — featured no topo, o
 * resto numa grid sm:grid-cols-2 lg:grid-cols-3.
 *
 * Filtragem por categoria é por ROTAS reais (CategoryNav -> /blog/categoria/[slug]),
 * não por pills client (D-08). Estado vazio = variante sóbria on-brand (sem
 * skeleton, sem "em breve").
 */

export const metadata: Metadata = {
  title: "Artigos · Dino Team",
  description:
    "Artigos sobre treino, nutrição, mentalidade e bastidores — o método do mais alto nível, traduzido em direção para você executar.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Artigos · Dino Team",
    description:
      "Artigos sobre treino, nutrição, mentalidade e bastidores — o método do mais alto nível, traduzido em direção para você executar.",
    type: "website",
    url: "/blog",
  },
};

/**
 * Seleciona o post em destaque (D-07): o primeiro com `featured: true`; se nenhum
 * ou vários estiverem marcados, cai no mais recente. `posts` já vem ordenado por
 * data desc do loader, então posts[0] é o mais recente.
 */
function selectFeatured(posts: Post[]): Post {
  const flagged = posts.filter((p) => p.featured);
  return flagged.length === 1 ? flagged[0] : posts[0];
}

export default function BlogListingPage() {
  const posts = getAllPosts();

  // Env-gate server-only (D-12): a seção do form só renderiza com as duas chaves
  // do Resend presentes. Segredos lidos só aqui no RSC, nunca vão ao cliente (D-03).
  const newsletterEnabled =
    !!process.env.RESEND_API_KEY && !!process.env.RESEND_AUDIENCE_ID;

  const featured = posts.length > 0 ? selectFeatured(posts) : null;
  const rest = featured
    ? posts.filter((p) => p.slug !== featured.slug)
    : [];

  return (
    <>
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
          {/* Cabeçalho da listagem */}
          <header>
            <p className="font-body text-sm uppercase tracking-[0.3em] text-muted">
              Artigos
            </p>
            <h1 className="mt-2 font-display text-4xl uppercase leading-[1.1] text-fg sm:text-5xl">
              O Blog
            </h1>
          </header>

          {/* Navegação de categorias (rotas reais, não pills) */}
          <div className="mt-8 border-y border-line py-6">
            <CategoryNav current="todos" />
          </div>

          {posts.length === 0 ? (
            // Estado vazio sóbrio on-brand (UI-SPEC §Copywriting) — sem skeleton,
            // sem "em breve". Aponta para a ação real.
            <section className="mt-16 max-w-[68ch]">
              <h2 className="font-display text-2xl uppercase leading-[1.2] text-fg sm:text-3xl">
                Ainda não há artigos por aqui.
              </h2>
              <p className="mt-4 font-body text-base leading-relaxed text-muted">
                O conteúdo está a caminho. Enquanto isso, sua direção pode
                começar agora —
              </p>
              <div className="mt-6">
                <CTAButton href={WHATSAPP_URL}>Quero minha direção</CTAButton>
              </div>
            </section>
          ) : (
            <>
              {/* Post em destaque */}
              {featured ? (
                <div className="mt-12">
                  <PostCard post={featured} variant="featured" />
                </div>
              ) : null}

              {/* Grid do restante */}
              {rest.length > 0 ? (
                <div className="mt-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post) => (
                    <PostCard key={post.slug} post={post} variant="grid" />
                  ))}
                </div>
              ) : null}

              {/* Captura de e-mail (LEAD-01) — fim da listagem, max-w-md
                  centralizado (D-05). Env-gated (D-12): some sem as chaves Resend. */}
              {newsletterEnabled && (
                <section className="mt-16 border-t border-line pt-12">
                  <NewsletterForm />
                </section>
              )}
            </>
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
