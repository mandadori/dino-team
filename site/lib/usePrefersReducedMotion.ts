"use client";
import { useEffect, useState } from "react";

/**
 * Hook central para detectar preferência de reduced-motion.
 * Centraliza a assinatura do matchMedia em um único ponto (DSGN-03).
 * Retorna `true` quando o usuário prefere menos movimento.
 *
 * O estado inicial é lido via lazy initializer do useState para evitar
 * chamar setState diretamente dentro do efeito.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    // Avaliado só no client após hidratação; no SSR retorna false.
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  return reduced;
}
