"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import { COOKIE_CONSENT_KEY, COOKIE_CONSENT_TTL_MS } from "@/lib/site";

/**
 * Estado de consentimento de cookies — Fase 3 (LEGAL-03).
 *
 * Único client boundary compartilhado entre CookieBanner (UI) e
 * TrackingScripts (gate). Por que Context e não prop do layout: o layout é
 * RSC e a escolha vive em localStorage (client-only), então o estado precisa
 * de uma fronteira de cliente comum (Option A do 03-PATTERNS.md).
 *
 * - `consent`: true apenas quando há escolha "accepted" não expirada.
 * - `decided`: true quando existe escolha persistida e válida — controla se o
 *   banner aparece (banner só aparece quando `decided === false`).
 *
 * Acesso a localStorage é guardado para SSR: só ocorre dentro de useEffect e
 * dos handlers accept/refuse, nunca no topo do módulo.
 */

type StoredChoice = {
  choice: "accepted" | "refused";
  expiresAt: number;
};

type ConsentContextValue = {
  consent: boolean;
  decided: boolean;
  accept: () => void;
  refuse: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

function readStoredChoice(): StoredChoice | null {
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredChoice>;
    if (
      (parsed.choice === "accepted" || parsed.choice === "refused") &&
      typeof parsed.expiresAt === "number"
    ) {
      return { choice: parsed.choice, expiresAt: parsed.expiresAt };
    }
    return null;
  } catch {
    return null;
  }
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState(false);
  const [decided, setDecided] = useState(false);

  // Hidrata o estado a partir de localStorage após montar (client-only).
  useEffect(() => {
    const stored = readStoredChoice();
    if (stored && stored.expiresAt > Date.now()) {
      setDecided(true);
      setConsent(stored.choice === "accepted");
    } else {
      setDecided(false);
      setConsent(false);
    }
  }, []);

  const persist = useCallback((choice: "accepted" | "refused") => {
    const record: StoredChoice = {
      choice,
      expiresAt: Date.now() + COOKIE_CONSENT_TTL_MS,
    };
    try {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(record));
    } catch {
      // localStorage indisponível (modo privado restrito): a escolha vale só
      // nesta sessão via estado em memória; não quebra a navegação.
    }
    setDecided(true);
    setConsent(choice === "accepted");
  }, []);

  const accept = useCallback(() => persist("accepted"), [persist]);
  const refuse = useCallback(() => persist("refused"), [persist]);

  return (
    <ConsentContext.Provider value={{ consent, decided, accept, refuse }}>
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (ctx === null) {
    throw new Error("useConsent deve ser usado dentro de <ConsentProvider>.");
  }
  return ctx;
}
