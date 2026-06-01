"use client";
import { useSyncExternalStore } from "react";

/**
 * Hook central para detectar preferência de reduced-motion.
 * Centraliza a assinatura do matchMedia em um único ponto (DSGN-03).
 * Retorna `true` quando o usuário prefere menos movimento.
 *
 * Usa useSyncExternalStore com getServerSnapshot explícito (false) para
 * evitar hydration mismatch: servidor renderiza false, cliente lê o valor
 * real após hidratação sem causar flash ou erro de console (DSGN-03).
 */

const MQ = "(prefers-reduced-motion: reduce)";

const subscribe = (cb: () => void): (() => void) => {
  const mq = window.matchMedia(MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

const getSnapshot = (): boolean => window.matchMedia(MQ).matches;

const getServerSnapshot = (): boolean => false;

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
