import Link from "next/link";
import { CATEGORIES } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Navegação de categorias — Server Component (sem diretiva de client). Filtragem
 * por categoria é feita por ROTAS indexáveis reais, NÃO por pills client (D-08):
 * uma escolha deliberada de SEO. Renderiza um <nav> de <Link> server-rendered:
 * "Todos" -> /blog + um link por categoria -> /blog/categoria/{slug}.
 *
 * Categorias são diferenciadas SÓ pelo rótulo (UI-SPEC §Color): sem cor, sem
 * pill, sem badge. O atual fica text-fg; os demais text-muted hover:text-fg.
 * Cada link é text-sm uppercase tracking-[0.2em] com focus-visible ring.
 */

const LINK_BASE =
  "text-sm uppercase tracking-[0.2em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg";

/** `current` = slug de categoria ou "todos" (a view geral em /blog). */
export function CategoryNav({ current }: { current: string }) {
  const items: ReadonlyArray<{ slug: string; label: string; href: string }> = [
    { slug: "todos", label: "Todos", href: "/blog" },
    ...CATEGORIES.map((c) => ({
      slug: c.slug,
      label: c.label,
      href: `/blog/categoria/${c.slug}`,
    })),
  ];

  return (
    <nav
      aria-label="Categorias do blog"
      className="flex flex-wrap gap-x-6 gap-y-3 font-body"
    >
      {items.map((item) => {
        const active = item.slug === current;
        return (
          <Link
            key={item.slug}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              LINK_BASE,
              active ? "text-fg" : "text-muted hover:text-fg",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
