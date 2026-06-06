"use client";

import Link from "next/link";
import { useConsent } from "@/components/ConsentProvider";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * Banner de consentimento de cookies — Fase 3 (LEGAL-03 / D-05/D-06/D-09).
 *
 * Barra inferior fixa, monocromática, sem dark pattern: "Aceitar" e "Recusar"
 * têm igual legitimidade (Recusar com menor peso visual, nunca destrutivo).
 * Aparece só enquanto não há escolha persistida (`decided === false`).
 * Não bloqueia conteúdo, não captura foco, não é modal (Accessibility Contract).
 */

// Tokens de geometria/foco copiados do CTAButton (que renderiza <a>; aqui
// precisamos de <button> de ação in-page, não de link).
const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 px-8 py-4 font-body text-sm font-semibold uppercase tracking-wide transition-all duration-200 hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg";
const BUTTON_PRIMARY = "bg-fg text-bg hover:bg-muted";
const BUTTON_OUTLINE =
  "border border-fg/40 text-fg hover:border-fg hover:bg-fg/5";

export function CookieBanner() {
  const { decided, accept, refuse } = useConsent();
  const reduce = usePrefersReducedMotion();

  // Escolha já registrada (ou expirada e re-decidida): banner some.
  if (decided) return null;

  // Transição de saída discreta — desativada sob prefers-reduced-motion.
  const motionClass = reduce
    ? ""
    : "transition-transform duration-300 motion-safe:animate-none";

  return (
    <div
      role="region"
      aria-label="Consentimento de cookies"
      className={`fixed bottom-0 inset-x-0 z-50 border-t border-line bg-bg px-6 py-4 sm:py-6 ${motionClass}`}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-body text-sm text-fg sm:text-base">
          Usamos cookies de analytics para entender o uso do site. Você decide.{" "}
          <Link
            href="/privacidade"
            className="font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg"
          >
            Política de Privacidade
          </Link>
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={accept}
            className={`${BUTTON_BASE} ${BUTTON_PRIMARY}`}
          >
            Aceitar
          </button>
          <button
            type="button"
            onClick={refuse}
            className={`${BUTTON_BASE} ${BUTTON_OUTLINE}`}
          >
            Recusar
          </button>
        </div>
      </div>
    </div>
  );
}
