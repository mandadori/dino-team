import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import GithubSlugger from "github-slugger";
import { evaluate } from "next-mdx-remote-client/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import type {
  WithContext,
  Article,
  Person,
  Organization,
  BreadcrumbList,
} from "schema-dts";

import { CTAButton } from "@/components/ui/CTAButton";
import { JsonLd } from "@/components/blog/JsonLd";
import { proseComponents } from "@/components/blog/ProseDino";
import { AuthorBlock } from "@/components/blog/AuthorBlock";
import { ShareBar } from "@/components/blog/ShareBar";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { NewsletterForm } from "@/components/blog/NewsletterForm";
import { Toc, type TocHeading } from "@/components/blog/Toc";
import {
  getAllPosts,
  getPostBySlug,
  getPostsByCategory,
  type Post,
} from "@/lib/blog";
import { AUTHORS, CATEGORIES, SITE_URL, WHATSAPP_URL } from "@/lib/site";

/**
 * Rota de artigo /blog/[slug] — RSC dinâmica, SSG (BLOG-03..10, SEO-02/05).
 *
 * Renderiza o MDX via next-mdx-remote-client/rsc (caminho provado no smoke da
 * Wave 0) com remark-gfm + rehype-slug + rehype-autolink-headings e o mapa
 * proseComponents. Compõe a pilha EEAT (autor, tempo de leitura, TOC, related,
 * share, CTA final) + metadados por artigo + JSON-LD tipado.
 *
 * Next 16: `params` é uma Promise — sempre await (RESEARCH §3, Pitfall 1).
 */

const DATE_FMT = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const ABS = (path: string) => new URL(path, SITE_URL).toString();

function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

/**
 * Extrai as headings h2/h3 do corpo MDX para o TOC, gerando ids com a MESMA
 * lib que o rehype-slug usa (github-slugger) — garantindo que os anchors do TOC
 * batam com os ids renderizados. Ignora linhas dentro de fences de código.
 */
function extractHeadings(body: string): TocHeading[] {
  const slugger = new GithubSlugger();
  const headings: TocHeading[] = [];
  let inFence = false;

  for (const rawLine of body.split("\n")) {
    const line = rawLine.trimEnd();
    if (/^(```|~~~)/.test(line.trim())) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line);
    if (!match) continue;

    const level = match[1].length;
    // Remove marcações inline simples (negrito/itálico/código/links) do rótulo.
    const text = match[2]
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/[*_`]/g, "")
      .trim();
    if (!text) continue;

    headings.push({ id: slugger.slug(text), text, level });
  }

  return headings;
}

export async function generateStaticParams() {
  // Importa o loader em tempo de build — também exercita o throw de frontmatter
  // inválido (BLOG-01): um campo ruim aborta `next build` aqui.
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let post: Post;
  try {
    post = getPostBySlug(slug);
  } catch {
    return {};
  }
  return {
    title: `${post.title} · Dino Team`,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `/blog/${slug}`,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post: Post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  const author = AUTHORS[post.author as keyof typeof AUTHORS];
  const headings = extractHeadings(post.body);

  // Env-gate server-only (D-12): a seção do form só renderiza com as duas chaves
  // do Resend presentes. Segredos lidos só aqui no RSC, nunca vão ao cliente (D-03).
  const newsletterEnabled =
    !!process.env.RESEND_API_KEY && !!process.env.RESEND_AUDIENCE_ID;

  // MDX -> React (Server). NENHUM rehype-raw: HTML cru não passa (T-04-05).
  const { content } = await evaluate({
    source: post.body,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "wrap" }],
        ],
      },
    },
    components: proseComponents,
  });

  // Relacionados: mesma categoria, sem o atual, 2–3 mais recentes (loader já
  // ordena por data desc).
  const related = getPostsByCategory(post.category)
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  const articleUrl = ABS(`/blog/${post.slug}`);
  const orgId = ABS("/#organization");
  const authorId = ABS(`/blog/autores/${post.author}#person`);

  const organizationJson: WithContext<Organization> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": orgId,
    name: "Dino Team",
    url: SITE_URL,
  };

  const personJson: WithContext<Person> = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": authorId,
    name: author?.name ?? post.author,
    description: author?.credential,
  };

  const articleJson: WithContext<Article> = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": articleUrl,
    headline: post.title,
    description: post.description,
    datePublished: post.date.toISOString(),
    mainEntityOfPage: articleUrl,
    author: { "@id": authorId },
    publisher: { "@id": orgId },
    ...(post.cover ? { image: ABS(post.cover) } : {}),
  };

  const breadcrumbJson: WithContext<BreadcrumbList> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: ABS("/") },
      { "@type": "ListItem", position: 2, name: "Blog", item: ABS("/blog") },
      {
        "@type": "ListItem",
        position: 3,
        name: categoryLabel(post.category),
        item: ABS(`/blog/categoria/${post.category}`),
      },
      {
        "@type": "ListItem",
        position: 4,
        name: post.title,
        item: articleUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd data={articleJson} />
      <JsonLd data={personJson} />
      <JsonLd data={organizationJson} />
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
        <article className="mx-auto max-w-6xl">
          {/* Cabeçalho do artigo */}
          <header className="mx-auto max-w-[68ch]">
            <p className="font-body text-sm uppercase tracking-[0.3em] text-muted">
              {categoryLabel(post.category)}
            </p>
            <h1 className="mt-2 font-display text-4xl uppercase leading-[1.05] text-fg sm:text-5xl lg:text-6xl">
              {post.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-sm text-muted">
              <span>{author?.name ?? post.author}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={post.date.toISOString()}>
                {DATE_FMT.format(post.date)}
              </time>
              <span aria-hidden="true">·</span>
              <span>{post.readingTime}</span>
            </div>
          </header>

          {/* Cover opcional — P&B + scrim, quebra para max-w-4xl */}
          {post.cover ? (
            <div className="relative mx-auto mt-12 aspect-[16/9] w-full max-w-4xl overflow-hidden border border-line">
              <Image
                src={post.cover}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 896px, 100vw"
                className="object-cover grayscale contrast-125"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{ background: "var(--scrim-portrait)" }}
              />
            </div>
          ) : null}

          {/* Duas colunas em lg: [prosa] [rail TOC sticky] */}
          <div className="mt-16 lg:flex lg:gap-12">
            <div className="min-w-0 lg:flex-1">
              {/* TOC mobile (acima do corpo, recolhível) */}
              <div className="mb-8 lg:hidden">
                <Toc headings={headings} />
              </div>

              <div className="prose-dino mx-auto max-w-[68ch] font-body text-fg">
                {content}
              </div>

              <div className="mx-auto max-w-[68ch]">
                <AuthorBlock author={author ?? post.author} />
                <ShareBar title={post.title} />
                <RelatedPosts posts={related} />

                {/* CTA final — único e uniforme (D-11), nunca varia por categoria */}
                <section className="mt-16 border-t border-line pt-12 text-center">
                  <p className="font-body text-sm uppercase tracking-widest text-muted">
                    O topo exige direção.
                  </p>
                  <div className="mt-6 flex justify-center">
                    <CTAButton href={WHATSAPP_URL}>
                      Quero minha direção
                    </CTAButton>
                  </div>
                </section>

                {/* Captura de e-mail (LEAD-01) — último bloco do artigo, DEPOIS
                    do CTA WhatsApp (D-05/D-06). Conversão suave; o WhatsApp acima
                    segue a primária. Env-gated (D-12): some sem as chaves Resend. */}
                {newsletterEnabled && (
                  <section className="mt-16 border-t border-line pt-12">
                    <NewsletterForm />
                  </section>
                )}
              </div>
            </div>

            {/* TOC desktop (rail sticky) */}
            <aside className="hidden lg:block">
              <Toc headings={headings} />
            </aside>
          </div>
        </article>
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
