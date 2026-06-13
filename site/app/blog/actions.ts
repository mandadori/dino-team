"use server";

import { Resend } from "resend";

/**
 * Captura de e-mail — Server Action (LEAD-01).
 *
 * Única superfície de write do site e primeiro endpoint público não-autenticado.
 * Adiciona o e-mail a uma Audience do Resend (single opt-in, D-01/D-02). Toda
 * entrada do visitante é não-confiável e revalidada AQUI no servidor — o checkbox
 * e o type="email" do cliente são só primeira linha de UX.
 *
 * Disciplina (RESEARCH §Don't Hand-Roll): escrever MENOS código que o instinto
 * sugere. O SDK retorna `{ data, error }` e NUNCA lança em erro de API, então não
 * há bloco de exceção nem branch de "duplicado": e-mail já inscrito cai em
 * `{ data }` limpo = sucesso (idempotente, D-11). Segredos são server-only (D-03) — nunca
 * `NEXT_PUBLIC_`, nunca importados pelo client island.
 */

export type SubscribeState =
  | { status: "idle" } // UI state 1
  | { status: "success" } // UI state 3 (cobre já-inscrito, D-11)
  | { status: "consent_error" } // UI state 4 (D-08)
  | { status: "invalid_email" } // UI state 5 (D-09)
  | { status: "server_error" }; // UI state 6

// Regex permissiva de propósito (D-09): barra o obviamente inválido sem rejeitar
// endereços legítimos exóticos. A validação real é o Resend aceitar o contato.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribe(
  _prev: SubscribeState, // primeiro arg obrigatório sob useActionState (Pitfall 2)
  formData: FormData,
): Promise<SubscribeState> {
  // 1. Honeypot — um humano nunca preenche um campo escondido. Absorve o bot em
  //    silêncio (retorna sucesso) para não revelar a armadilha.
  if (formData.get("website")) return { status: "success" };

  // 2. Consentimento — gate autoritativo (D-08, critério de sucesso 3). Sem o
  //    checkbox marcado, o Resend NÃO é chamado.
  if (formData.get("consent") !== "on") return { status: "consent_error" };

  // 3. E-mail — revalidação server-side (D-09). HTML5 foi a primeira linha no cliente.
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!EMAIL_RE.test(email)) return { status: "invalid_email" };

  // 4. Guard de segredos (D-03/D-12). Instanciação LAZY do SDK só APÓS o guard
  //    evita throw em build com env vazio (Pitfall 4) — a seção fica hidden no
  //    cliente quando as chaves faltam, mas a action também degrada graciosamente.
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!apiKey || !audienceId) return { status: "server_error" };

  // 5. Single opt-in: adiciona o contato à Audience (D-01/D-02). Overload legacy
  //    `audienceId` casa com RESEND_AUDIENCE_ID (D-03). Sem bloco de exceção e sem
  //    checagem de duplicado — qualquer `{ data }` limpo = sucesso (D-11).
  const resend = new Resend(apiKey);
  const { error } = await resend.contacts.create({
    audienceId,
    email,
    unsubscribed: false,
  });

  // Todo erro do Resend vira um único server_error sóbrio — sem trace, sem código,
  // sem PII em log (T-05-07).
  if (error) return { status: "server_error" };
  return { status: "success" };
}
