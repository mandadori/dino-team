"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * Índice do artigo (BLOG-07) — ilha de cliente.
 *
 * Sticky no rail direito em lg (sticky top-24, w-56/w-64); <details> recolhível
 * no mobile (fechado por padrão, summary "Neste artigo"). Scroll-spy via
 * IntersectionObserver. Gate de reduced-motion: quando reduzido, o salto de
 * âncora é instantâneo — sem smooth-scroll, sem destaque animado (UI-SPEC
 * §States). Renderiza só com >=3 headings. As headings recebem scroll-mt-24 em
 * ProseDino (compensa o header fixo). Cada link >=44px, focus-visible ring.
 */

export type TocHeading = { id: string; text: string; level: number };

const TOC_THRESHOLD = 3;

function TocLinks({
  headings,
  activeId,
  reduce,
}: {
  headings: TocHeading[];
  activeId: string | null;
  reduce: boolean;
}) {
  return (
    <ul className="space-y-1">
      {headings.map((h) => {
        const isActive = h.id === activeId;
        return (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                // Reduced-motion: salto instantâneo, sem smooth-scroll/destaque animado.
                if (reduce) {
                  e.preventDefault();
                  const el = document.getElementById(h.id);
                  if (el) {
                    el.scrollIntoView({ behavior: "auto" });
                    history.replaceState(null, "", `#${h.id}`);
                  }
                }
              }}
              aria-current={isActive ? "location" : undefined}
              className={[
                "flex min-h-[44px] items-center border-l-2 py-1 pl-3 -ml-px font-body text-sm leading-[1.5] transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg",
                isActive
                  ? "border-fg font-semibold text-fg"
                  : "border-transparent text-muted hover:text-fg",
                h.level >= 3 ? "pl-6" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {h.text}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function Toc({ headings }: { headings: TocHeading[] }) {
  const reduce = usePrefersReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(
    headings[0]?.id ?? null,
  );

  useEffect(() => {
    if (headings.length < TOC_THRESHOLD) return;
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Escolhe a heading visível mais ao topo como ativa.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      // Janela superior: ativa a seção assim que ela cruza abaixo do header fixo.
      { rootMargin: "-96px 0px -66% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  // Limiar de executor: TOC só aparece com >=3 headings.
  if (headings.length < TOC_THRESHOLD) return null;

  return (
    <>
      {/* Mobile: <details> recolhível, fechado por padrão. */}
      <details className="border-t border-line pt-4 lg:hidden">
        <summary className="cursor-pointer font-body text-sm uppercase tracking-[0.3em] text-muted">
          Neste artigo
        </summary>
        <nav aria-label="Índice do artigo" className="mt-4">
          <TocLinks headings={headings} activeId={activeId} reduce={reduce} />
        </nav>
      </details>

      {/* Desktop: rail sticky à direita. */}
      <nav
        aria-label="Índice do artigo"
        className="sticky top-24 hidden w-56 self-start lg:block xl:w-64"
      >
        <p className="font-body text-sm uppercase tracking-[0.3em] text-muted">
          Neste artigo
        </p>
        <div className="mt-4">
          <TocLinks headings={headings} activeId={activeId} reduce={reduce} />
        </div>
      </nav>
    </>
  );
}
