import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/blog";
import { CATEGORIES } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Cartão de post — Server Component (sem diretiva de client). Dois variantes (D-07):
 *  - featured: título Display tier sobre cover com scrim (--scrim-hero).
 *  - grid: título Heading tier + excerpt (= description).
 *
 * O cartão inteiro é UM único <Link> (alvo >=44px, focus-visible ring). Hover é
 * só CSS (border-line -> border-fg/40 + underline no título) — reduced-motion
 * safe. Cover ausente -> placeholder monocromático intencional (Depoimentos),
 * nunca imagem colorida/stock. Categoria diferenciada só por rótulo (sem cor).
 */

const DATE_FMT = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

/** Linha de metadados compartilhada: categoria · data · tempo de leitura. */
function MetaRow({ post }: { post: Post }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-sm text-muted">
      <span className="uppercase tracking-[0.2em]">
        {categoryLabel(post.category)}
      </span>
      <span aria-hidden="true">·</span>
      <time dateTime={post.date.toISOString()}>{DATE_FMT.format(post.date)}</time>
      <span aria-hidden="true">·</span>
      <span>{post.readingTime}</span>
    </div>
  );
}

/** Cover P&B ou placeholder monocromático intencional (cover ausente). */
function Cover({
  post,
  overlay = false,
  priority = false,
  sizes,
}: {
  post: Post;
  overlay?: boolean;
  priority?: boolean;
  sizes: string;
}) {
  return (
    <div className="absolute inset-0">
      {post.cover ? (
        <Image
          src={post.cover}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover grayscale contrast-125"
        />
      ) : (
        // Placeholder intencional (UI-SPEC §Assets): slot monocromático, não erro.
        <div
          aria-hidden="true"
          className="flex h-full w-full items-center justify-center bg-surface"
        >
          <span className="font-display text-2xl uppercase tracking-widest text-muted">
            Dino Team
          </span>
        </div>
      )}
      {overlay ? (
        // Scrim obrigatório (UI-SPEC §Color, critério de aceite) — garante o
        // contraste do título sobreposto; token CSS, nunca hex inline.
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: "var(--scrim-hero)" }}
        />
      ) : null}
    </div>
  );
}

const CARD_LINK =
  "group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg";

export function PostCard({
  post,
  variant = "grid",
}: {
  post: Post;
  variant?: "featured" | "grid";
}) {
  const href = `/blog/${post.slug}`;

  if (variant === "featured") {
    return (
      <Link href={href} className={cn(CARD_LINK, "relative overflow-hidden")}>
        <div className="relative aspect-[16/9] w-full overflow-hidden border border-line transition-colors duration-200 group-hover:border-fg/40 sm:aspect-[21/9]">
          <Cover
            post={post}
            overlay
            priority
            sizes="(min-width: 1024px) 1152px, 100vw"
          />
          <div className="absolute inset-0 flex flex-col justify-end p-8">
            <span className="font-body text-sm uppercase tracking-[0.3em] text-muted">
              {categoryLabel(post.category)}
            </span>
            <h2 className="mt-2 font-display text-4xl uppercase leading-[1.1] text-fg underline-offset-4 group-hover:underline sm:text-5xl">
              {post.title}
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-sm text-muted">
              <time dateTime={post.date.toISOString()}>
                {DATE_FMT.format(post.date)}
              </time>
              <span aria-hidden="true">·</span>
              <span>{post.readingTime}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // grid variant
  return (
    <Link
      href={href}
      className={cn(
        CARD_LINK,
        "flex h-full flex-col border border-line transition-colors duration-200 group-hover:border-fg/40 hover:border-fg/40",
      )}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-line">
        <Cover post={post} sizes="(min-width: 1024px) 384px, 100vw" />
      </div>
      <div className="flex flex-1 flex-col p-8">
        <h3 className="font-display text-2xl uppercase leading-[1.15] text-fg underline-offset-4 group-hover:underline sm:text-3xl">
          {post.title}
        </h3>
        <p className="mt-4 font-body text-sm leading-[1.5] text-muted">
          {post.description}
        </p>
        <div className="mt-4">
          <MetaRow post={post} />
        </div>
      </div>
    </Link>
  );
}
