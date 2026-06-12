import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";

/**
 * Contrato de ritmo de prosa do blog Dino Team (Server Component — sem diretiva de client).
 *
 * Mapa de componentes MDX (elemento -> componente estilizado) que aplica a
 * rítmica de leitura da marca via UMA fonte única, não por elemento solto. O
 * doador do ritmo é a prosa hand-authored de app/privacidade/page.tsx; a
 * tradução para MDX (machine-rendered) vive aqui (UI-SPEC §Typography "MDX
 * Prose contract").
 *
 * Regras-chave:
 * - h2 vs h3 diferem por MARGEM (mt-12 vs mt-8) e pelo passo h2 sm:text-3xl,
 *   NÃO por um 5º tamanho — ambos compartilham a base text-2xl (Tier 3).
 * - scroll-mt-24 nas headings compensa o header fixo para âncoras/TOC.
 * - Prosa é CAIXA LIVRE — nunca forçar uppercase no corpo.
 * - Monocromático: code/pre sem cor de sintaxe; img grayscale+contrast-125.
 * - Medida de leitura max-w-[68ch]; first:mt-0 no primeiro filho.
 * - Sem plugin `prose` do Tailwind (não instalado) — mapa explícito.
 */

type ImgProps = ComponentPropsWithoutRef<"img">;

/**
 * Mapa de componentes passado ao `evaluate` de next-mdx-remote-client/rsc pela
 * rota de artigo (Task 3). Cada chave de elemento recebe as classes da marca.
 */
export const proseComponents: MDXComponents = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      {...props}
      className="mt-12 scroll-mt-24 font-display text-2xl uppercase leading-[1.2] text-fg first:mt-0 sm:text-3xl"
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3
      {...props}
      className="mt-8 scroll-mt-24 font-display text-2xl uppercase leading-[1.25] text-fg first:mt-0"
    />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p
      {...props}
      className="mt-6 font-body text-base leading-[1.7] text-fg first:mt-0 lg:text-lg"
    />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a
      {...props}
      className="text-fg underline decoration-line underline-offset-4 hover:decoration-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul
      {...props}
      className="mt-6 list-disc space-y-2 pl-6 font-body text-base leading-[1.7] text-fg marker:text-muted first:mt-0 lg:text-lg"
    />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol
      {...props}
      className="mt-6 list-decimal space-y-2 pl-6 font-body text-base leading-[1.7] text-fg marker:text-muted first:mt-0 lg:text-lg"
    />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li {...props} className="leading-[1.7]" />
  ),
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong {...props} className="font-semibold text-fg" />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      {...props}
      className="mt-8 border-l-2 border-line pl-6 font-body text-base leading-[1.6] text-muted first:mt-0 lg:text-lg"
    />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code
      {...props}
      className="border border-line bg-surface px-2 font-mono text-sm text-fg"
    />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      {...props}
      className="mt-6 overflow-x-auto border border-line bg-surface p-6 font-mono text-sm leading-[1.5] text-fg first:mt-0 [&_code]:border-0 [&_code]:bg-transparent [&_code]:p-0"
    />
  ),
  // Imagem em prosa: tratamento P&B da marca + legenda muted via alt.
  img: ({ alt, ...props }: ImgProps) => (
    <figure className="mt-8 first:mt-0">
      {/* next/image não cabe sem dimensões conhecidas no MDX — <img> nativo com
          lazy-loading e o tratamento monocromático da marca (RamonPhoto/Depoimentos). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...props}
        alt={alt ?? ""}
        loading="lazy"
        className="w-full grayscale contrast-125"
      />
      {alt ? (
        <figcaption className="mt-2 font-body text-sm text-muted">
          {alt}
        </figcaption>
      ) : null}
    </figure>
  ),
};

/**
 * Wrapper opcional que aplica a medida de leitura + first:mt-0. A rota de artigo
 * pode envolver `content` (resultado do evaluate) com este componente para fixar
 * a medida da coluna de prosa numa única fonte.
 */
export function ProseDino({ children }: { children: React.ReactNode }) {
  return (
    <div className="prose-dino max-w-[68ch] font-body text-fg">{children}</div>
  );
}
