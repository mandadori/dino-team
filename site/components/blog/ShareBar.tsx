"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * Barra de compartilhamento (BLOG-09) — ilha de cliente.
 *
 * Botão primário "Copiar link": grava window.location no clipboard; o rótulo
 * troca "Copiar link" -> "Link copiado", anunciado via role="status"
 * aria-live="polite", e reverte em ~2s. Gatilho Web Share renderizado SÓ quando
 * navigator.share existe, com rótulo visível "Compartilhar" (nunca só ícone) +
 * SVG monocromático inline (currentColor). Variante outline; todo botão >=44px,
 * focus-visible ring. Sem widget de terceiros. Transição gateada por
 * usePrefersReducedMotion.
 */

// Tokens de geometria/foco copiados de CookieBanner (CTAButton renderiza <a>,
// inutilizável para botões de ação in-page).
const BUTTON_BASE =
  "inline-flex min-h-[44px] items-center justify-center gap-2 px-8 py-4 font-body text-sm font-semibold uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg";
const BUTTON_OUTLINE =
  "border border-fg/40 text-fg hover:border-fg hover:bg-fg/5";

function LinkIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 shrink-0"
    >
      <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 shrink-0"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

export function ShareBar({ title }: { title: string }) {
  const reduce = usePrefersReducedMotion();
  const [copied, setCopied] = useState(false);
  // Web Share só existe em runtime de cliente — detecta após montar para evitar
  // mismatch de hidratação (server não tem navigator).
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  // Transição do rótulo desativada sob reduced-motion.
  const transition = reduce ? "" : "transition-colors duration-200";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Falha de clipboard (permissão/contexto inseguro): mantém o rótulo padrão.
    }
  }

  async function handleShare() {
    try {
      await navigator.share({ title, url: window.location.href });
    } catch {
      // Cancelamento do usuário ou falha: silencioso — copy-link é o fallback.
    }
  }

  return (
    <section className="mt-16 flex flex-wrap items-center gap-4 border-t border-line pt-8">
      <button
        type="button"
        onClick={handleCopy}
        className={`${BUTTON_BASE} ${BUTTON_OUTLINE} ${transition}`}
      >
        <LinkIcon />
        {copied ? "Link copiado" : "Copiar link"}
      </button>

      {canShare ? (
        <button
          type="button"
          onClick={handleShare}
          className={`${BUTTON_BASE} ${BUTTON_OUTLINE} ${transition}`}
        >
          <ShareIcon />
          Compartilhar
        </button>
      ) : null}

      {/* Confirmação acessível do copy-link. */}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Link copiado para a área de transferência." : ""}
      </span>
    </section>
  );
}
