"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { subscribe, type SubscribeState } from "@/app/blog/actions";

/**
 * Captura de e-mail — client island (LEAD-01 / LEAD-02).
 *
 * Único client boundary do form: detém input/checkbox/pending/sucesso/erro. Os 7
 * estados do 05-UI-SPEC saem de um `useActionState` (React 19 / Next 16) — o 3º
 * valor (`pending`) dirige o botão; NÃO usar `useFormStatus` no mesmo componente
 * (Pitfall 1). Sucesso SUBSTITUI o form no mesmo espaço e recebe foco (D-10); erros
 * via `role="alert"` + `aria-live` com foco gerenciado (D-08/D-13).
 *
 * Monocromático estrito: ZERO vermelho. Erro = texto branco (`text-fg`) + borda
 * branca no campo + `role="alert"` — cor nunca carrega o significado de erro
 * (UI-SPEC §Color). Segredos do Resend NUNCA cruzam para cá (server-only, D-03).
 */

// Tokens de botão copiados de ShareBar/CookieBanner (CTAButton renderiza <a>,
// inutilizável para um <button type="submit">).
const BUTTON_BASE =
  "inline-flex min-h-[44px] items-center justify-center gap-2 px-8 py-4 font-body text-sm font-semibold uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg";
const BUTTON_PRIMARY = "bg-fg text-bg hover:bg-muted";

// Token de campo do admin/login + rounded-none, altura ≥48px, texto 16px (sem zoom iOS).
const FIELD_BASE =
  "mt-2 min-h-[48px] w-full rounded-none border bg-surface px-4 py-3 font-body text-base text-fg outline-none placeholder:text-muted focus:border-fg";

const PRIVACY_LINK =
  "font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg";

const initial: SubscribeState = { status: "idle" };

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribe, initial);
  const inputRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  // Foco gerenciado na transição de estado (D-08/D-10/D-13).
  useEffect(() => {
    if (state.status === "consent_error") consentRef.current?.focus();
    else if (state.status === "invalid_email") inputRef.current?.focus();
    else if (state.status === "success") successRef.current?.focus();
  }, [state]);

  // Estado 3 — sucesso SUBSTITUI o form (mesmo painel para já-inscrito, D-10/D-11).
  if (state.status === "success") {
    return (
      <div role="status" aria-live="polite" className="mx-auto max-w-md">
        <h2
          ref={successRef}
          tabIndex={-1}
          className="font-display text-2xl uppercase tracking-wide text-fg outline-none sm:text-3xl"
        >
          Pronto. Você está na lista.
        </h2>
        <p className="mt-4 font-body text-muted">
          O próximo princípio chega quando fizer sentido. Enquanto isso, o caminho
          continua.
        </p>
      </div>
    );
  }

  const emailInvalid = state.status === "invalid_email";
  const consentInvalid = state.status === "consent_error";

  return (
    <form action={formAction} aria-busy={pending} className="mx-auto max-w-md">
      <h2 className="text-center font-display text-2xl uppercase tracking-wide text-fg sm:text-3xl">
        Receba a direção no seu e-mail
      </h2>
      <p className="mx-auto mt-3 max-w-prose text-center font-body text-muted">
        De vez em quando, um princípio do método direto para você. Sem ruído.
      </p>

      <div className="mt-8 text-left">
        <label
          htmlFor="newsletter-email"
          className="block font-body text-sm text-fg"
        >
          Seu melhor e-mail
        </label>
        <input
          ref={inputRef}
          id="newsletter-email"
          name="email"
          type="email"
          required
          inputMode="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          aria-invalid={emailInvalid}
          aria-describedby={emailInvalid ? "newsletter-email-err" : undefined}
          className={`${FIELD_BASE} ${emailInvalid ? "border-fg" : "border-line"}`}
        />
        {emailInvalid && (
          <p
            id="newsletter-email-err"
            role="alert"
            aria-live="assertive"
            className="mt-2 font-body text-sm text-fg"
          >
            <strong className="font-semibold">Confira</strong> o e-mail digitado.
          </p>
        )}
      </div>

      {/* Honeypot — invisível, fora do tab order, ignorado por leitor de tela. */}
      <input
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
      />

      <div className="mt-6 text-left">
        <label className="flex min-h-[44px] cursor-pointer items-start gap-3 font-body text-sm text-fg">
          <input
            ref={consentRef}
            name="consent"
            type="checkbox"
            aria-invalid={consentInvalid}
            aria-describedby={
              consentInvalid ? "newsletter-consent-err" : undefined
            }
            className="mt-0.5 size-5 shrink-0 accent-[#ededed]"
          />
          <span>
            Autorizo o Dino Team a usar meu e-mail para enviar conteúdo, conforme
            a{" "}
            <Link href="/privacidade" className={PRIVACY_LINK}>
              Política de Privacidade
            </Link>
            .
          </span>
        </label>
        {consentInvalid && (
          <p
            id="newsletter-consent-err"
            role="alert"
            aria-live="assertive"
            className="mt-2 font-body text-sm text-fg"
          >
            <strong className="font-semibold">Marque a autorização</strong> para
            continuar.
          </p>
        )}
      </div>

      {state.status === "server_error" && (
        <p
          role="alert"
          aria-live="assertive"
          className="mt-6 text-center font-body text-sm text-fg"
        >
          Não consegui te inscrever agora. Tente de novo em instantes.
        </p>
      )}

      <div className="mt-8 text-center">
        <button
          type="submit"
          disabled={pending}
          className={`${BUTTON_BASE} ${BUTTON_PRIMARY} disabled:opacity-60`}
        >
          {pending ? "Enviando…" : "Quero receber"}
        </button>
      </div>
    </form>
  );
}
