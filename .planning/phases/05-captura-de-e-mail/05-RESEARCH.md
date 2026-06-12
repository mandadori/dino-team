# Phase 5: Captura de E-mail - Research

**Researched:** 2026-06-12
**Domain:** Public unauthenticated email-capture form → Resend Contacts/Audiences (single opt-in) via Next.js 16 Server Action + React 19 `useActionState`, LGPD consent, WCAG AA accessible states
**Confidence:** HIGH (Resend SDK contract read from the package's own bundled type declarations; Server Action pattern from official Next.js 16.2.9 docs; all codebase patterns read directly)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Integração Resend (LEAD-01)**
- **D-01:** Modelo = **Resend Audiences/Contacts API** — o e-mail é adicionado como contato a uma audience (lista real, nutrível depois). **Não** é envio transacional avulso.
- **D-02:** **Single opt-in** — sem e-mail de confirmação e sem rota de verificação. O consentimento explícito do checkbox é a base legal LGPD; o contato entra na lista direto no envio do form.
- **D-03:** O mecanismo é um **Server Action** (`"use server"`), conforme LEAD-01 — não um Route Handler. O Server Action lê `process.env.RESEND_API_KEY` e `process.env.RESEND_AUDIENCE_ID` **server-only** (NÃO `NEXT_PUBLIC_*`, são segredos) e chama o Resend.
- **D-04:** **Env-gated, sem conta ainda.** Construir tudo de forma que `RESEND_API_KEY`/`RESEND_AUDIENCE_ID` vazios **não bloqueiem o build** (ver D-12). `.env.example` ganha as duas chaves vazias e documentadas, no padrão de `NEXT_PUBLIC_WHATSAPP_URL`/`NEXT_PUBLIC_SITE_URL`. **Blocker de deploy declarado:** o usuário cria a audience e preenche as chaves antes do deploy real.

**Posicionamento (LEAD-01)**
- **D-05:** **Componente compartilhado** (ex.: `components/blog/NewsletterForm.tsx`), renderizado em dois lugares: (a) em `/blog/[slug]`, **depois** da seção CTA de WhatsApp — é o **último bloco** do artigo; (b) no **final da listagem `/blog`**.
- **D-06:** O form **não substitui nem compete** com o CTA de WhatsApp ("Quero minha direção"). É uma seção própria, sóbria, abaixo dele no artigo. WhatsApp = conversão primária (bottom-funnel); e-mail = degrau suave (top-funnel).

**Consentimento & validação (LEAD-01, LEAD-02)**
- **D-07:** Checkbox de consentimento LGPD **desmarcado por padrão** (opt-in explícito), com **link inline para `/privacidade`**. É consentimento de **processamento de dados a nível de form** — **distinto** do consentimento de cookies do `ConsentProvider`/`useConsent` (Fase 3). **Não** reutiliza `useConsent`; é estado local do form.
- **D-08:** Botão de envio **sempre ativo**. Enviar sem o checkbox marcado → **erro acessível inline** (aria-live, foco movido pro checkbox). O e-mail **nunca** é enviado sem o consentimento (revalidado no servidor — critério de sucesso 3).
- **D-09:** Validação de e-mail = **HTML5 nativo** (`type="email"` + `required`) no cliente **+ revalidação no Server Action** antes de chamar o Resend. Sem lib de validação extra.

**Estados de sucesso/erro (LEAD-02)**
- **D-10:** **Sucesso = o form é substituído** por uma mensagem de confirmação sucinta no mesmo espaço, anunciada via **aria-live** e com **foco movido** pra ela. Não deixa campos órfãos na tela.
- **D-11:** **E-mail já inscrito** (Resend retorna contato existente) = **tratado como sucesso** (mesma mensagem). Não revela se o e-mail já existia (privacidade) e não gera atrito.
- **D-12:** **Sem `RESEND_API_KEY`/`RESEND_AUDIENCE_ID` configurados, a seção do form não renderiza** (em vez de mostrar um form que sempre falha em preview). Reaparece assim que a env é preenchida; build/CI passam limpos.
- **D-13:** Acessibilidade (LEAD-02): erros e sucesso via **aria-live**, **foco gerenciado**, **foco visível** (anel de foco do design system), contraste **WCAG AA**, **client island mínimo** (`"use client"` só no componente do form; a seção que o monta pode ser RSC).

### Claude's Discretion
- **Copy/tom exato** (heading, subtexto, label do checkbox, texto do botão, mensagens de sucesso/erro) — executor escreve seguindo `brand/tom-de-voz.md`. **Nota:** o 05-UI-SPEC §Copywriting já prescreve a copy v1 de record (ready-to-ship); o executor refina dentro do mesmo registro.
- **Anti-spam do endpoint público** — honeypot e/ou rate-limit básico no Server Action, à discrição do executor. **Sem CAPTCHA de terceiro.**
- **Estrutura técnica do estado do form** — `useActionState`/`useFormStatus` (React 19 / Next 16) vs `useState`; executor escolhe o padrão mais limpo. **Esta pesquisa recomenda `useActionState` (ver Pattern 1).**
- **Nomes exatos** do componente do form e do arquivo do Server Action.
- **Design visual do bloco** — definido no 05-UI-SPEC, ancorado em `brand/referencias-visuais.md`.

### Deferred Ideas (OUT OF SCOPE)
- **LEAD-03 — lead magnet contextual ("guia de direção")** — v2; esta fase é captura genérica de e-mail, sem isca.
- **NEWS-01 — newsletter com cadência editorial** — v2; esta fase só **captura** o e-mail.
- **Double opt-in** (e-mail de confirmação + rota `/confirmar` + estado pendente) — descartado em favor de single opt-in. Revisitar só se deliverability exigir.
- **Form na landing/home** — fora de escopo; a captura é pós-conteúdo do blog.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LEAD-01 | Form de e-mail inline (Server Action → Resend) com checkbox de consentimento LGPD, estilo monocromático | §Standard Stack (`resend` SDK + `contacts.create` legacy `audienceId` overload, single opt-in confirmed) · Pattern 1 (Server Action + `useActionState`) · Pattern 3 (env-gating D-12) · §Code Examples (action skeleton, env-gate RSC, `.env.example` keys) |
| LEAD-02 | Estado de sucesso/erro acessível (client island mínimo, WCAG AA) | Pattern 2 (discriminated state machine → 7 UI-SPEC states) · Pattern 4 (managed focus + aria-live with `useActionState`) · §Code Examples (focus-on-transition idiom) · 05-UI-SPEC §Accessibility Contract |
</phase_requirements>

## Summary

This phase adds the **first text-entry surface and first write-path** to a site that has been entirely link/button/photo driven. There is zero prior art in the repo for forms, Server Actions, or external write integrations — so the research focuses where the locked decisions point: the Resend integration mechanics, the Next 16 / React 19 Server-Action form pattern, env-gating, server-side validation/anti-spam, and accessibility wiring. Everything visual is already locked by 05-UI-SPEC (7 states, tokens, prescribed pt-BR copy); this document does not re-spec visuals.

The central integration finding is decisive and well-supported: the **`resend` v6.12.4 SDK's `contacts.create()` returns a discriminated `{ data, error }` object (it does NOT throw on API-level errors)**, and the SDK's own enumerated error-code set contains **no `already_exists` / `duplicate` / `conflict` code**. Adding the same email twice is idempotent — it succeeds and returns a contact id rather than erroring. This means **D-11 (treat already-subscribed as success) requires zero special-case branching**: a clean `data` result already covers both new and existing contacts. The `RESEND_AUDIENCE_ID` from D-01/D-03 maps to the SDK's `audienceId` field, which is the `LegacyCreateContactOptions` overload — still fully functional in v6 but marked `@deprecated` in favor of the newer `segments` model. Since the user is creating an Audience (not segments) and CONTEXT locks `RESEND_AUDIENCE_ID`, the legacy overload is the correct, supported path for v1.

**Primary recommendation:** Build one `"use client"` form island driven by **React 19 `useActionState`** returning a **discriminated state object** (`status: "idle" | "success" | "consent_error" | "invalid_email" | "server_error"`). The Server Action (`"use server"`) reads `process.env.RESEND_*` server-only, runs a honeypot check → consent revalidation → lightweight regex email validation → `resend.contacts.create({ email, audienceId, unsubscribed: false })`, and maps `{ data }`→success (covers already-subscribed) / `{ error }`→server_error. An RSC parent reads `process.env.RESEND_API_KEY && process.env.RESEND_AUDIENCE_ID` and simply does not render the section when unset (D-12). Pending comes from `useActionState`'s third tuple value; focus management runs in a `useEffect` keyed on the returned state. No new validation library (D-09), no CAPTCHA (brand law) — honeypot + the 5 req/s Resend rate limit are the anti-abuse posture for v1.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Email-capture form UI + interaction state (input/checkbox/pending/success/error) | Browser / Client (`"use client"` island) | — | Owns input/checkbox/focus/aria-live; the only stateful surface. D-13 keeps `"use client"` confined to this component. |
| Mounting the form section + env-gate decision | Frontend Server (RSC) | — | RSC parent reads `process.env.RESEND_*` (server-only secrets) and conditionally renders. `process.env` is never exposed to the client (D-12, D-03). |
| Email subscription write (Resend `contacts.create`) | API / Backend (Server Action `"use server"`) | External (Resend API) | LEAD-01 locks Server Action, not Route Handler. Secrets live server-side; the SDK call happens on the server only. |
| Consent enforcement (LGPD) | API / Backend (Server Action revalidates) | Browser (checkbox + client error) | D-08: consent is checked client-side for UX AND revalidated server-side as the authoritative gate — email never sent to Resend without it. |
| Email validation | API / Backend (Server Action regex) | Browser (HTML5 `type="email"` + `required`) | D-09: native HTML5 first line, server revalidation authoritative line. No extra lib. |
| Anti-spam (honeypot, rate-limit) | API / Backend (Server Action) | — | Public unauthenticated write endpoint; honeypot field + Resend's own 5 req/s cap. No third-party CAPTCHA (brand law). |
| Audience/list ownership | External (Resend dashboard) | — | User creates the Audience and supplies `RESEND_AUDIENCE_ID`; declared deploy blocker (D-04). |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `resend` | **6.12.4** (latest, published 2026-06-04) `[VERIFIED: npm registry]` `[CITED: github.com/resend/resend-node]` | Official Resend Node SDK — `contacts.create()` adds a contact to an Audience | The official first-party SDK (repo `github.com/resend/resend-node`). No postinstall script; deps = `postal-mime`, `standardwebhooks` only. The only sanctioned way to call the Contacts API from Node/Next. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none new) | — | — | **No other new dependency.** D-09 forbids a validation lib; UI-SPEC forbids any UI registry/CAPTCHA. `react`/`react-dom` 19.2.4 and `next` 16.2.6 already provide `useActionState`/`useFormStatus`/`"use server"`. The existing `zod@4.4.3` is available if the planner prefers schema validation over a regex, but a one-line regex is sufficient and lighter for a single email field (see Pattern 5). |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `resend.contacts.create({ audienceId })` (legacy overload) | `resend.contacts.create({ segments: [{ id }] })` (new model) | The new `segments` model is where Resend is heading (`audienceId` is `@deprecated` in the v6 types `[VERIFIED: resend@6.12.4 d.ts]`). BUT CONTEXT D-01/D-03 lock `RESEND_AUDIENCE_ID` and the user is creating an **Audience**, not segments. The legacy overload is still fully functional in v6 and is the correct match for a locked decision. Do not migrate to segments in this phase. |
| Regex email validation (D-09) | `zod@4.4.3` (already installed) `.email()` | zod is already a dep, so no new install — but it is overkill for one field and the Next docs example uses `safeParse` returning `error.flatten().fieldErrors`. Either is fine; regex keeps the action dependency-free per D-09's "sem lib de validação extra" intent. Planner's call. |
| `useActionState` | `useState` + manual `onSubmit` fetch | `useState` loses progressive enhancement and re-implements pending/error plumbing by hand. `useActionState` is the React 19 / Next 16 canonical form pattern `[CITED: nextjs.org/docs/app/guides/forms]` and keeps the island minimal. Recommended. |

**Installation:**
```bash
cd site && npm install resend@6.12.4
```

**Version verification (performed this session):**
```
npm view resend version        → 6.12.4
npm view resend time.modified  → 2026-06-04T16:49:05Z
npm view resend repository.url  → git+https://github.com/resend/resend-node.git
npm view resend scripts.postinstall → (empty — no postinstall script)
npm view resend dependencies   → { postal-mime, standardwebhooks }
```

## Package Legitimacy Audit

> slopcheck could not be installed in this session (the sandbox classifier denied installing an undeclared agent-chosen package). Per the graceful-degradation protocol the package below is verified manually via the npm registry + first-party repository + no-postinstall check, and is treated as `[VERIFIED: npm registry]` on the strength of being the official Resend SDK with a matching first-party GitHub repo. **The planner should still gate the install behind a `checkpoint:human-verify` task** (consistent with the Phase 04 precedent where 9 deps were human-verified before install — see STATE.md "9 MDX/SEO deps human-verified").

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `resend` | npm | ~3 yrs (mature) | very high (official SDK) | github.com/resend/resend-node (first-party, matches publisher) | unavailable (sandbox-denied) | **Approved** — official first-party SDK; no postinstall; minimal first-party deps. Gate install behind `checkpoint:human-verify` per Phase 04 precedent. |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none
**postinstall check:** `npm view resend scripts.postinstall` returned empty — no install-time script executes.

## Architecture Patterns

### System Architecture Diagram

```
                    ┌─────────────────────────────────────────────┐
   /blog/[slug]     │  RSC page (Server Component)                 │
   /blog (listing)  │                                             │
                    │  const enabled =                            │
                    │    !!process.env.RESEND_API_KEY &&          │  ← env-gate (D-12)
                    │    !!process.env.RESEND_AUDIENCE_ID         │    secrets read server-only
                    │                                             │
                    │  {enabled && <NewsletterForm />}  ──────────┼──► (renders nothing if unset)
                    └───────────────────┬─────────────────────────┘
                                        │ mounts client island
                                        ▼
                    ┌─────────────────────────────────────────────┐
                    │  NewsletterForm  ("use client")             │
                    │                                             │
                    │  [state, formAction, pending] =             │
                    │     useActionState(subscribe, {status:idle})│
                    │                                             │
                    │  <form action={formAction}>                 │
                    │    <input name="email" type="email" required│  ← HTML5 native (D-09)
                    │    <input name="website" hidden> (honeypot) │  ← anti-spam (discretion)
                    │    <input type="checkbox" name="consent">   │  ← unchecked default (D-07)
                    │    <button disabled={pending}>              │  ← pending from useActionState
                    │  </form>                                    │
                    │                                             │
                    │  useEffect([state]) → manage focus +        │  ← Pattern 4 (a11y, D-13)
                    │     aria-live regions react to state.status │
                    └───────────────────┬─────────────────────────┘
                                        │ FormData POST (RSC action invocation)
                                        ▼
                    ┌─────────────────────────────────────────────┐
                    │  subscribe(prevState, formData)  "use server"│
                    │                                             │
                    │  1. honeypot: formData.get("website") → bail │
                    │  2. consent !== "on"  → {consent_error}     │  ← revalidate (D-08, crit 3)
                    │  3. email regex fail  → {invalid_email}     │  ← revalidate (D-09)
                    │  4. read process.env.RESEND_*  (guard)      │  ← server guard (D-03/D-12)
                    │  5. resend.contacts.create({email,audienceId,│
                    │        unsubscribed:false})                 │  ← single opt-in (D-02)
                    │       → {data}  → {status:success}          │  ← covers already-subscribed (D-11)
                    │       → {error} → {status:server_error}     │
                    └───────────────────┬─────────────────────────┘
                                        │ HTTPS
                                        ▼
                              ┌──────────────────────┐
                              │  Resend API          │
                              │  POST /contacts      │
                              │  (Audience list)     │
                              └──────────────────────┘
```

### Recommended Project Structure
```
site/
├── app/
│   └── blog/
│       └── actions.ts          # NEW — "use server" subscribe action (colocated with blog routes)
├── components/
│   └── blog/
│       └── NewsletterForm.tsx  # NEW — "use client" island (name = executor discretion, D-05 suggests this)
├── lib/
│   └── site.ts                 # extend — non-secret constants if any (NEVER Resend secrets, D-03)
└── .env.example                # extend — add RESEND_API_KEY= and RESEND_AUDIENCE_ID= (D-04)
```

Rationale: the action lives in `app/blog/actions.ts` (colocated with the two routes that consume it, matching the App Router convention and the existing `app/api/.../route.ts` colocation discipline). The component lives in `components/blog/` alongside its siblings (`ShareBar.tsx`, `AuthorBlock.tsx`, `RelatedPosts.tsx`). `[VERIFIED: codebase STRUCTURE.md + components/blog/* read this session]`

### Pattern 1: Server Action + `useActionState` form (React 19 / Next 16)
**What:** A `"use server"` action with signature `(prevState, formData) => Promise<State>` wired into a `"use client"` form via `useActionState(action, initialState)`, which returns `[state, formAction, pending]`.
**When to use:** This is THE canonical Next 16 form pattern and the recommended choice for D-discretion "estrutura técnica do estado do form."
**Key facts** `[CITED: nextjs.org/docs/app/guides/forms — v16.2.9, lastUpdated 2026-03-10]`:
- When using `useActionState`, the action signature **changes** to take `prevState` (a.k.a. `initialState`) as the **first** argument and `formData` second.
- `useActionState` returns a **3-tuple**: `[state, formAction, pending]`. The third value (`pending`) is the in-flight boolean — use it directly; you do **not** need `useFormStatus` for a single submit button.
- The form binds `<form action={formAction}>`. Disable the button with `disabled={pending}`.
- `useFormStatus` is the alternative, but it **must live in a child component nested inside the `<form>`** (it reads the parent form's status). For this single-button form, `useActionState`'s `pending` is simpler and keeps the island flat. In React 19 `useFormStatus` also exposes `data`/`method`/`action`, but we don't need them.
**Example:** see §Code Examples → "Action skeleton" and "Client island skeleton".

### Pattern 2: Discriminated state object → the 7 UI-SPEC states
**What:** The action returns a discriminated union; the client renders UI per `state.status`.
**When to use:** D-10/D-11/D-08/D-09/server-error all need distinct, screen-reader-announced UI. A discriminated object (vs. throwing) is the React 19 idiom `[CITED: nextjs.org/docs/app/guides/forms]` ("Instead of throwing errors... return consistent state objects that the form can react to").
**State shape (maps 1:1 to 05-UI-SPEC §States):**
```ts
type SubscribeState =
  | { status: "idle" }
  | { status: "success" }                         // UI state 3 (also covers already-subscribed, D-11)
  | { status: "consent_error" }                   // UI state 4 (D-08)
  | { status: "invalid_email" }                   // UI state 5 (D-09)
  | { status: "server_error" };                   // UI state 6 (Resend/network failure)
```
- **pending** (UI state 2) is NOT a `status` value — it comes from `useActionState`'s `pending` boolean, orthogonal to the returned state.
- **hidden** (UI state 7) is NOT a form state — it is the RSC parent not rendering the form at all (Pattern 3).
- Keep messages out of the returned object where possible: the prescribed pt-BR copy lives in the component (UI-SPEC §Copywriting), keyed by `status`. This keeps the action payload tiny and the copy in one on-brand place. (If the planner prefers, a `message` field is also valid — Next docs show both.)

### Pattern 3: Env-gating at render time + server guard (D-12)
**What:** Two layers. (1) The RSC parent reads `process.env.RESEND_API_KEY && process.env.RESEND_AUDIENCE_ID` and conditionally renders the section — when unset, **nothing renders** (no placeholder). (2) The Server Action re-checks the same envs and returns `server_error` if somehow invoked without them.
**When to use:** D-12 + D-04 — build/CI must stay green with empty env; the form must not appear in preview when it would always fail.
**Why it works:** `process.env.X` in an RSC / Server Action is read on the server at request time; it is never bundled into client JS (the values are secrets, NOT `NEXT_PUBLIC_*`). Reading a missing env var yields `undefined` (falsy) — no throw, build stays green. This mirrors the existing `WHATSAPP_URL`/`SITE_URL` env-with-fallback discipline `[VERIFIED: lib/site.ts read this session]`, except here the absence path is "don't render" instead of "use fallback."
**Example:** see §Code Examples → "Env-gate in RSC parent".

### Pattern 4: Managed focus + aria-live with `useActionState`
**What:** A `useEffect` keyed on `state` moves focus on each transition and the markup carries the aria-live regions; React 19 idioms apply.
**When to use:** LEAD-02 / D-13 — focus to checkbox on consent error, to input on invalid email, to the success panel heading on success.
**How (React 19 specifics):**
- Use `useRef` for the input, checkbox, and success-panel heading.
- A `useEffect(() => { ... }, [state])` reads `state.status` and calls the appropriate `ref.current?.focus()`. Because `useActionState` returns a **new** state object on each action completion, the effect re-runs on every transition (even idle→same-error→error retries work because React re-renders on each action result).
- The success panel heading gets `tabIndex={-1}` so it is programmatically focusable but not in the tab order, then `.focus()` (UI-SPEC §States row 3).
- aria-live regions: errors use `role="alert"` `aria-live="assertive"`; the success panel uses `role="status"` `aria-live="polite"` (UI-SPEC §Accessibility Contract). The form sets `aria-busy={pending}`.
- Field errors wire `aria-invalid` + `aria-describedby` pointing to stable error-region ids.
**Precedent in repo:** `ShareBar.tsx` already uses `role="status" aria-live="polite"` + a `useEffect`-driven client state; the focus-management layer is new but consistent. `[VERIFIED: components/blog/ShareBar.tsx read this session]`
**Example:** see §Code Examples → "Focus-on-transition effect".

### Pattern 5: Server-side email validation without a new lib (D-09)
**What:** A pragmatic regex in the action, after HTML5 native validation on the client.
**Recommended regex** (RFC-pragmatic, the widely-used HTML5-spec-aligned pattern):
```ts
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```
This is intentionally permissive (matches the browser's own `type="email"` philosophy) — it rejects obvious garbage (`a@b`, empty, spaces) without trying to be an RFC 5322 parser (which is famously impossible and counterproductive). The real validity test is whether Resend accepts it; this regex is the cheap server-side gate D-09 asks for. Trim and lowercase before validating/sending. No new dependency. `[ASSUMED]` (the regex choice is a well-established convention, not a cited spec — but the "don't over-validate email" guidance is broadly authoritative).

### Anti-Patterns to Avoid
- **Throwing from the Server Action for expected outcomes** (consent missing, bad email, already-subscribed). Throwing breaks `useActionState`'s state flow and surfaces Next's error overlay. **Return discriminated state objects** instead. `[CITED: nextjs.org/docs/app/guides/forms]`
- **Reading `process.env.RESEND_*` in the client island.** Secrets must never reach the client; they are read only in the RSC parent (gate) and the Server Action. Never prefix them `NEXT_PUBLIC_`. (D-03)
- **Special-casing "already exists" with a try/catch around `contacts.create`.** The SDK does not throw for duplicates and has no `already_exists` error code — a clean `{ data }` already covers it (D-11). Adding a catch for a non-existent error path is dead code.
- **Using `useFormStatus` in the same component as the `<form>`.** `useFormStatus` only reads status from a **parent** form, so it returns `pending: false` if called in the component that renders the `<form>`. For this form, use `useActionState`'s `pending`. `[CITED: react.dev/reference/react-dom/hooks/useFormStatus]`
- **Adding a red/destructive error color.** UI-SPEC §Color is explicit: errors are signalled by `text-fg` (white) + white `border-fg` outline + `role="alert"`, never a hue. No `--destructive` token.
- **Disabling the submit button when consent is unchecked.** D-08 requires the button **always active**; an unchecked-consent submit must produce an *accessible error*, not a dead button.
- **Migrating to the `segments` model.** Tempting because `audienceId` is `@deprecated`, but it contradicts the locked `RESEND_AUDIENCE_ID` decision and the user's Audience-based setup. Out of scope.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Add email to a mailing list | A custom fetch to Resend's REST endpoint with hand-rolled auth headers + JSON parsing | `resend` SDK `contacts.create()` | The SDK handles auth, the `{ data, error }` discrimination, retries, and types. Hand-rolling re-implements all of it and drifts from the API. |
| Form pending/error/state plumbing | `useState` + manual `onSubmit` + `fetch` + manual `preventDefault` | `useActionState` + Server Action | React 19 gives this for free with progressive enhancement; the manual version loses no-JS submit and re-derives `pending`. `[CITED: nextjs.org/docs/app/guides/forms]` |
| "Already subscribed" idempotency | A pre-check `contacts.list` / `contacts.get` before create, or a try/catch on a duplicate error | Just call `contacts.create` and treat `{ data }` as success | `contacts.create` is idempotent on email — no duplicate error exists in the SDK's error enum. A pre-check is a wasted round-trip and a race condition. (D-11) `[VERIFIED: resend@6.12.4 d.ts — RESEND_ERROR_CODE_KEY has no duplicate/exists code]` |
| Email validation | An RFC 5322 regex or a validation library | One pragmatic regex (Pattern 5) + HTML5 `type="email"` + Resend's own acceptance | Over-validating email rejects valid addresses; under-validating is caught by Resend. The cheap regex is the right server gate per D-09. |
| Bot/spam protection | A third-party CAPTCHA widget | A hidden honeypot field + Resend's 5 req/s team rate limit | CAPTCHA injects external UI/script/color (brand law violation, UI-SPEC §Out of Scope). Honeypot is invisible, free, and adequate for a low-value top-funnel form. |
| Pending button affordance | A colored spinner | Label swap `QUERO RECEBER`→`ENVIANDO…` (UI-SPEC), optional monochrome `currentColor` SVG spinner gated by `usePrefersReducedMotion()` | Brand monochrome law + reduced-motion discipline; the hook already exists. `[VERIFIED: lib/usePrefersReducedMotion.ts read this session]` |

**Key insight:** This phase's entire risk surface is the integration contract, and that contract is small and idempotent. The discipline is to write *less* code than instinct suggests — no duplicate-check, no validation lib, no CAPTCHA, no `useFormStatus`, no manual fetch. The SDK + React 19 primitives + the existing design tokens do almost all of it.

## Runtime State Inventory

> This is a greenfield additive phase (new component, new action, new envs) — not a rename/refactor. No existing runtime state is renamed or migrated. The one operational state change is **external**: a Resend Audience must be created and `RESEND_AUDIENCE_ID` populated before deploy (declared blocker, D-04). No code or data in this repo carries a string that needs migrating.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None in-repo. Captured emails live in Resend's Audience (external SaaS), not in this repo. | None in this repo. |
| Live service config | **Resend Audience** must exist; `RESEND_AUDIENCE_ID` references it. Lives in the Resend dashboard, not git. | User creates the Audience and supplies the id (deploy blocker, D-04). |
| OS-registered state | None — verified by the absence of any cron/task/launchd touching this feature (existing `vercel.json` cron is unrelated). | None. |
| Secrets/env vars | **New:** `RESEND_API_KEY`, `RESEND_AUDIENCE_ID` (both server-only, NOT `NEXT_PUBLIC_*`). Documented-and-empty in `.env.example`. On Vercel: set in the Environment Variables panel. | Add both to `.env.example` (D-04); user fills real values pre-deploy. |
| Build artifacts | None — `npm install resend` adds to `node_modules`/`package-lock.json` (gitignored / committed lockfile per repo norm); no stale artifact carries an old name. | Run `npm install` after adding the dep. |

**Canonical question — after every file is updated, what runtime systems still have old state?** None in this repo. The only external prerequisite is the Resend Audience + the two env vars, both declared as a deploy blocker by the user (D-04).

## Common Pitfalls

### Pitfall 1: `useFormStatus().pending` always false in the form component
**What goes wrong:** Executor calls `useFormStatus()` in `NewsletterForm` (the component that renders `<form>`) and the button never shows the pending state.
**Why it happens:** `useFormStatus` reads the status of the **parent** `<form>`; called in the same component as the form, there is no parent form in scope, so it returns `pending: false`. `[CITED: react.dev/reference/react-dom/hooks/useFormStatus]`
**How to avoid:** Use `useActionState`'s third return value (`pending`) for the single submit button — no nested component needed. Only reach for `useFormStatus` if extracting a separate `<SubmitButton>` child.
**Warning signs:** Button label never swaps to `ENVIANDO…`; double-submits possible.

### Pitfall 2: Action signature mismatch with `useActionState`
**What goes wrong:** TypeScript error / runtime misbehavior because the action takes `(formData)` but `useActionState` calls it with `(prevState, formData)`.
**Why it happens:** A plain `<form action={fn}>` action takes `(formData)`; a `useActionState`-wrapped action takes `(prevState, formData)`. These are different signatures. `[CITED: nextjs.org/docs/app/guides/forms]`
**How to avoid:** Define the action as `async function subscribe(prevState: SubscribeState, formData: FormData): Promise<SubscribeState>`. The first arg is unused on the happy path but must be present.
**Warning signs:** `formData.get(...)` returns undefined / `formData` is actually the previous state.

### Pitfall 3: Secrets leaking via `NEXT_PUBLIC_` or client import
**What goes wrong:** `RESEND_API_KEY` ends up in the client bundle (readable by anyone) because it was prefixed `NEXT_PUBLIC_` or read inside a `"use client"` component.
**Why it happens:** Habit from the existing `NEXT_PUBLIC_*` analytics/WhatsApp vars — but those are *meant* to be public; Resend keys are secrets (D-03).
**How to avoid:** Name them `RESEND_API_KEY` / `RESEND_AUDIENCE_ID` (no prefix). Read them ONLY in the RSC parent (gate) and the Server Action. Never pass them as props to the client island.
**Warning signs:** Grep the built `.next/static` chunks for the key name; it must not appear.

### Pitfall 4: Build/CI breaks with empty Resend env
**What goes wrong:** Adding `new Resend(process.env.RESEND_API_KEY)` at module top-level throws at build time when the key is empty (the SDK constructor may reject an empty key), breaking `next build` in CI where envs are unset (D-04/D-12).
**Why it happens:** Top-level SDK instantiation runs during build/prerender; an empty key can throw.
**How to avoid:** Instantiate the SDK **lazily inside the action**, after the env guard: `const resend = new Resend(apiKey)` only once `apiKey` is confirmed present. The env-gate in the RSC parent already prevents the form from rendering, so the action is normally unreachable without keys — but the lazy instantiation makes the build path safe regardless. Verify with `npm run build` using an empty `.env`.
**Warning signs:** `next build` fails only in CI / clean checkout, passes locally where `.env.local` has keys.

### Pitfall 5: Treating "already subscribed" as an error
**What goes wrong:** Executor wraps `contacts.create` in try/catch or branches on a `duplicate` error code that doesn't exist, producing a server_error for repeat subscribers and breaking D-11.
**Why it happens:** Intuition from other ESPs (some return 409 on duplicate).
**How to avoid:** The Resend v6 SDK returns `{ data, error }` and has **no** duplicate/exists/conflict error code `[VERIFIED: resend@6.12.4 d.ts — RESEND_ERROR_CODE_KEY enum]`. Map any `{ data }` (truthy, no error) → success; map `{ error }` → server_error. Both new and existing emails land in success.
**Warning signs:** Re-submitting a known email shows the generic error instead of the success panel.

### Pitfall 6: Focus lost when the form is replaced by the success panel
**What goes wrong:** On success the form unmounts and the success panel mounts, but focus falls back to `<body>` — a keyboard/SR user loses their place (violates D-10/D-13).
**Why it happens:** Replacing the subtree doesn't auto-move focus.
**How to avoid:** Give the success heading `tabIndex={-1}` and `.focus()` it in the `useEffect` that fires on `status === "success"` (Pattern 4). The panel is `role="status" aria-live="polite"` so it is also announced.
**Warning signs:** After submit, Tab jumps to the page header instead of continuing from the confirmation.

### Pitfall 7: `prefers-reduced-motion` ignored on the pending spinner
**What goes wrong:** An optional pending spinner animates even when the user requested reduced motion.
**Why it happens:** The global `@media (prefers-reduced-motion)` reset in `globals.css` kills CSS animation duration, but a JS/SVG-driven spinner may bypass it.
**How to avoid:** Gate any spinner with `usePrefersReducedMotion()` (returns `true` → render the static `ENVIANDO…` text only). The hook exists and is the established pattern. `[VERIFIED: lib/usePrefersReducedMotion.ts + ShareBar.tsx read this session]`
**Warning signs:** Motion visible with the OS reduce-motion setting on.

## Code Examples

> These are **skeletons** establishing the verified contract shapes, not finished components. Copy/visuals come from 05-UI-SPEC; the executor fills tokens, classNames, and prescribed pt-BR copy.

### Action skeleton (`app/blog/actions.ts`)
```ts
// Source: contract from nextjs.org/docs/app/guides/forms (v16.2.9) +
// resend@6.12.4 type declarations (contacts.create legacy audienceId overload).
"use server";

import { Resend } from "resend";

export type SubscribeState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "consent_error" }
  | { status: "invalid_email" }
  | { status: "server_error" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribe(
  _prev: SubscribeState,        // required first arg under useActionState (Pitfall 2)
  formData: FormData,
): Promise<SubscribeState> {
  // 1. Honeypot — a real user never fills a hidden field (anti-spam discretion).
  if (formData.get("website")) return { status: "success" }; // silently absorb bots

  // 2. Consent revalidation — authoritative gate (D-08, success criterion 3).
  if (formData.get("consent") !== "on") return { status: "consent_error" };

  // 3. Email revalidation (D-09) — HTML5 was the first line on the client.
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { status: "invalid_email" };

  // 4. Server guard for secrets (D-03/D-12). Lazy SDK init avoids build-time throw (Pitfall 4).
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!apiKey || !audienceId) return { status: "server_error" };

  // 5. Single opt-in add to the Audience (D-01/D-02). SDK returns {data,error}, never throws on API errors.
  const resend = new Resend(apiKey);
  const { error } = await resend.contacts.create({
    audienceId,                 // legacy overload — matches RESEND_AUDIENCE_ID (D-01/D-03)
    email,
    unsubscribed: false,
  });

  // D-11: any clean data result = success (already-subscribed is idempotent, no duplicate error exists).
  if (error) return { status: "server_error" };
  return { status: "success" };
}
```

### Client island skeleton (`components/blog/NewsletterForm.tsx`)
```tsx
// Source: nextjs.org/docs/app/guides/forms (useActionState 3-tuple, pending from index 2).
"use client";

import { useActionState, useEffect, useRef } from "react";
import { subscribe, type SubscribeState } from "@/app/blog/actions";

const initial: SubscribeState = { status: "idle" };

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribe, initial);
  const inputRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  // Managed focus on transition (Pattern 4 / D-08/D-10/D-13).
  useEffect(() => {
    if (state.status === "consent_error") consentRef.current?.focus();
    else if (state.status === "invalid_email") inputRef.current?.focus();
    else if (state.status === "success") successRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div role="status" aria-live="polite">
        <h2 ref={successRef} tabIndex={-1}>{/* UI-SPEC: PRONTO. VOCÊ ESTÁ NA LISTA. */}</h2>
        {/* UI-SPEC success body */}
      </div>
    );
  }

  return (
    <form action={formAction} aria-busy={pending}>
      {/* visible label + input (D-09) */}
      <input
        ref={inputRef}
        name="email"
        type="email"
        required
        inputMode="email"
        autoComplete="email"
        aria-invalid={state.status === "invalid_email"}
        aria-describedby={state.status === "invalid_email" ? "email-err" : undefined}
      />
      {state.status === "invalid_email" && (
        <p id="email-err" role="alert" aria-live="assertive">{/* UI-SPEC: Confira o e-mail digitado. */}</p>
      )}

      {/* honeypot — visually hidden, aria-hidden, no autocomplete */}
      <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="sr-only" />

      {/* consent checkbox, unchecked by default (D-07) */}
      <label>
        <input
          ref={consentRef}
          name="consent"
          type="checkbox"
          aria-invalid={state.status === "consent_error"}
          aria-describedby={state.status === "consent_error" ? "consent-err" : undefined}
        />
        {/* UI-SPEC consent label incl. inline /privacidade link */}
      </label>
      {state.status === "consent_error" && (
        <p id="consent-err" role="alert" aria-live="assertive">{/* UI-SPEC: Marque a autorização para continuar. */}</p>
      )}

      {state.status === "server_error" && (
        <p role="alert" aria-live="assertive">{/* UI-SPEC: Não consegui te inscrever agora... */}</p>
      )}

      <button type="submit" disabled={pending}>
        {pending ? /* ENVIANDO… */ "" : /* QUERO RECEBER */ ""}
      </button>
    </form>
  );
}
```

### Env-gate in RSC parent (mount sites — `app/blog/[slug]/page.tsx`, `app/blog/page.tsx`)
```tsx
// Source: D-12 + lib/site.ts env-with-fallback precedent. Secrets read server-only, never bundled.
const newsletterEnabled =
  !!process.env.RESEND_API_KEY && !!process.env.RESEND_AUDIENCE_ID;

// ...in JSX, AFTER the WhatsApp CTA section (D-05/D-06):
{newsletterEnabled && (
  <section className="mt-16 border-t border-line pt-12 text-center">
    {/* heading/subtext per UI-SPEC */}
    <NewsletterForm />
  </section>
)}
// When the envs are unset: nothing renders. No placeholder. Build stays green. (D-12)
```

### `.env.example` additions (D-04)
```bash
# ── Captura de e-mail — Fase 5 (LEAD-01) ───────────────────────
# Chave da API Resend (server-only — NUNCA NEXT_PUBLIC_, é segredo).
# Sem ela (e sem RESEND_AUDIENCE_ID), a seção do form NÃO renderiza (D-12).
# PREENCHER antes do deploy. Crie em https://resend.com/api-keys
RESEND_API_KEY=

# Id da Audience do Resend onde os contatos entram (single opt-in).
# Crie a Audience no dashboard do Resend e cole o id aqui. Deploy blocker (D-04).
RESEND_AUDIENCE_ID=
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useFormState` (from `react-dom`) | `useActionState` (from `react`) | React 19 | The pre-19 name/import is renamed; using the old import breaks. We use `useActionState` from `react`. `[CITED: nextjs.org/docs/app/guides/forms]` |
| Route Handler + client `fetch` for form submit | Server Action (`"use server"`) invoked via `<form action>` | Next 13.4+ stable in App Router | LEAD-01 locks Server Action; gives progressive enhancement for free. |
| Resend `contacts.create({ audienceId })` as the primary model | `contacts.create({ segments: [...] })` (Audiences → Segments migration) | Resend v6 (`audienceId` marked `@deprecated`) | We deliberately use the **legacy** `audienceId` overload because CONTEXT locks `RESEND_AUDIENCE_ID` and the user uses Audiences. Still fully functional in v6. `[VERIFIED: resend@6.12.4 d.ts]` |

**Deprecated/outdated:**
- `useFormState` — replaced by `useActionState`. Do not import from `react-dom`.
- Resend `LegacyCreateContactOptions.audienceId` is `@deprecated` in the v6 types but **intentionally used here** per the locked decision; revisit only if the user moves to Segments (out of scope).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The pragmatic email regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` is the right server-side gate (vs. a stricter validator) | Pattern 5 | Low — over-strict validation rejects valid emails; this permissive pattern + Resend's own acceptance is the safer default. If the planner prefers zod (already installed), `.email()` is an equivalent, also-fine choice. |
| A2 | `contacts.create` with a duplicate email returns `{ data }` (idempotent success), not an error, satisfying D-11 with no special-casing | Summary, Pitfall 5, Don't Hand-Roll | Medium — verified via the SDK's error-code enum (no duplicate code exists) but NOT confirmed by a live API call (user has no account yet). If Resend ever returns an error for duplicates, the action's `{ error } → server_error` mapping would wrongly fail repeat subscribers. **Recommended verification:** once the user creates the account, the plan should include a manual smoke (subscribe the same email twice, confirm both show the success panel). The mapping is also trivially adjustable to treat a specific error code as success if needed. |
| A3 | Instantiating `new Resend(apiKey)` lazily inside the action (not at module top-level) keeps `next build` green with empty envs | Pitfall 4 | Low — standard guard; verifiable with `npm run build` against an empty `.env`. The env-gate already prevents the normal render path. |
| A4 | The honeypot field + Resend's 5 req/s team rate limit are adequate anti-abuse for this top-funnel form (no app-level rate limiter needed in v1) | Don't Hand-Roll, §Security | Medium — a determined attacker can still pump emails up to 5/s. CONTEXT explicitly delegates anti-spam to executor discretion and the plan-phase threat-model gate; if the user wants per-IP throttling, that is an additive follow-up (no app-level rate-limit infra exists in the repo today). |

## Open Questions

1. **Does the user's Resend plan/Audience exist yet, and what is the exact `audienceId`?**
   - What we know: D-04 declares this a deploy blocker; the form is env-gated so build/dev proceed without it.
   - What's unclear: the real key + id values (the user supplies them pre-deploy).
   - Recommendation: build fully env-gated; the plan should carry an explicit "user creates Audience + fills `RESEND_API_KEY`/`RESEND_AUDIENCE_ID`" blocker task and a post-account smoke (verifies A2).

2. **Regex vs. zod for the email gate (D-discretion within D-09's "sem lib extra").**
   - What we know: zod@4.4.3 is already installed; D-09 says "sem lib de validação extra" (no *extra* lib — zod is not extra since it's present).
   - What's unclear: planner preference for a one-line regex vs. `z.string().email()`.
   - Recommendation: regex (Pattern 5) keeps the action zero-dependency and matches D-09's spirit; either is acceptable.

3. **Honeypot strategy details (field name, hidden technique).**
   - What we know: a hidden field a bot fills but a human doesn't; CAPTCHA is prohibited.
   - What's unclear: exact field name (`website`/`url`/`company` are common decoys) and hide technique (`sr-only` + `aria-hidden` + `tabIndex=-1` + `autoComplete="off"`).
   - Recommendation: use a plausible decoy name (`website`), `sr-only` + `aria-hidden="true"` + `tabIndex={-1}` + `autoComplete="off"`; bail to a silent `success` (don't reveal the trap). Executor discretion.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node/npm + `site/` toolchain | install `resend`, build | ✓ | Next 16.2.6 / React 19.2.4 (package.json) | — |
| `resend` npm package | Server Action subscribe call | ✗ (not yet installed) | 6.12.4 available on npm | — (must install) |
| Resend account + API key | Live subscription at deploy | ✗ (user has no account) | — | **Env-gated:** form does not render; build/dev proceed (D-12). Real values are a declared deploy blocker (D-04). |
| Resend Audience + `audienceId` | `contacts.create` target | ✗ | — | Same env-gate; deploy blocker. |

**Missing dependencies with no fallback:** none that block development. `resend` must be `npm install`ed (gate behind `checkpoint:human-verify` per Phase 04 precedent).
**Missing dependencies with fallback:** Resend account/key/audience — fully covered by the D-12 env-gate during development; only block the real deploy (D-04, already declared).

## Validation Architecture

> `.planning/config.json` was not present in the repo at research time; treating `nyquist_validation` as enabled by default. **However:** the `site/` project has **no test framework installed** (no jest/vitest/playwright in `package.json`; the only scripts are `dev`/`build`/`lint`/`typecheck`). The phases to date validated via `next build` + `lint` + `typecheck` + manual/headless checks (STATE.md). This section reflects that reality rather than inventing a framework.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | **none installed** — validation is `tsc --noEmit` + `eslint` + `next build` + manual a11y/smoke |
| Config file | none — see Wave 0 |
| Quick run command | `cd site && npm run typecheck && npm run lint` |
| Full suite command | `cd site && npm run build` (exercises RSC render, env-gate, action compilation) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LEAD-01 | Action compiles, types valid, build green with EMPTY env (form hidden) | build/type | `cd site && npm run typecheck && npm run build` (run with empty `.env`) | ✅ (commands exist) |
| LEAD-01 | Consent unchecked → action returns `consent_error`, no Resend call | manual / future unit | manual: submit without checkbox; confirm inline error + no network | ❌ (no test runner) |
| LEAD-01 | Already-subscribed email → success panel (D-11) | manual smoke (post-account) | manual: subscribe same email twice with real key | ❌ (needs Resend account) |
| LEAD-02 | aria-live announces error/success; focus moves correctly | manual a11y | keyboard + screen-reader pass (VoiceOver/NVDA); axe DevTools | ❌ (no automated a11y harness) |
| LEAD-02 | No red/destructive color; monochrome only | manual / lint-by-review | visual + UI-checker sign-off (05-UI-SPEC §Checker Sign-Off) | ✅ (UI-SPEC gate) |
| LEAD-01/02 | Secrets not in client bundle | manual grep | `cd site && npm run build && grep -r RESEND_API_KEY .next/static \|\| echo "OK: no leak"` | ✅ (command exists) |

### Sampling Rate
- **Per task commit:** `cd site && npm run typecheck && npm run lint`
- **Per wave merge:** `cd site && npm run build` (with an empty `.env` to assert D-12/D-04 build-green)
- **Phase gate:** build green + UI-checker sign-off (05-UI-SPEC) + manual keyboard/SR a11y pass + secret-leak grep returns clean.

### Wave 0 Gaps
- [ ] No test framework — consistent with all prior phases; **do not introduce one for this phase** (out of scope; would be its own decision). Validation stays type/build/lint/manual.
- [ ] Manual a11y checklist (from 05-UI-SPEC §Accessibility Contract) should be a checkpoint task, not an automated test.
- [ ] Post-account smoke (A2: duplicate→success) is a deploy-time checkpoint, not a CI test.

*If the planner wants automated coverage, that is a separate infrastructure decision; this phase ships on the established build+lint+typecheck+manual bar.*

## Security Domain

> `security_enforcement` config not found; treating as enabled. This is the site's **first public unauthenticated write endpoint**, so the threat surface is real and called out by the orchestrator brief.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | The endpoint is intentionally public/unauthenticated (anyone can subscribe). |
| V3 Session Management | no | No session created; stateless single write. |
| V4 Access Control | no | No protected resource; the "resource" is adding self to a list. |
| V5 Input Validation | **yes** | Server-side email regex (Pattern 5) + consent revalidation (D-08) in the Server Action — never trust the client. Trim/lowercase before send. |
| V6 Cryptography | no (delegated) | No crypto hand-rolled; TLS to Resend handled by the SDK; API key is a server-only secret (never `NEXT_PUBLIC_`). |
| V7 Error Handling & Logging | **yes** | Action returns sober discriminated states; never leaks Resend error codes/stack traces to the visitor (UI-SPEC state 6). No PII logged (no logger in repo anyway). |
| V12 / Business Logic abuse | **yes** | Honeypot + Resend 5 req/s rate limit mitigate automated list-stuffing of a public write. |

### Known Threat Patterns for {Next 16 Server Action + public email write}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Bot/list-stuffing spam (mass automated subscribes) | Denial of Service / Spoofing | Honeypot hidden field (silent absorb) + Resend's 5 req/s per-team cap `[CITED: resend.com/docs/api-reference rate limit = 5 req/s]`. No CAPTCHA (brand law). Per-IP throttle is an optional follow-up (A4). |
| Email header / injection via the email field | Tampering | `contacts.create` sends structured JSON via the SDK (not raw SMTP headers); server-side regex strips obvious garbage; no string interpolation into headers. |
| Secret exposure (`RESEND_API_KEY` in client bundle) | Information Disclosure | Server-only env (no `NEXT_PUBLIC_`), read only in RSC parent + action; verify with post-build grep (Pitfall 3 / §Validation). |
| Consent bypass (subscribe without LGPD opt-in) | Tampering / Repudiation | Consent revalidated server-side in the action (D-08, success criterion 3) — client checkbox is UX only; the authoritative gate is the server. |
| Already-subscribed email enumeration (leaking who's on the list) | Information Disclosure | D-11: same success message for new and existing; never reveal prior state. The idempotent SDK response makes this the natural (and only) behavior. |
| Error-detail leakage (stack/API codes to visitor) | Information Disclosure | Generic sober error copy (UI-SPEC state 6); map all `{ error }` to one `server_error` state; no code/trace shown. |
| CSRF on the Server Action | Spoofing | Next.js Server Actions have built-in origin checks / encrypted action ids; in Next 16 inline closure variables are also encrypted in transit `[CITED: nextjs.org/docs/app/guides/forms + Next 16 security notes]`. No extra CSRF token needed. |

## Sources

### Primary (HIGH confidence)
- **`resend@6.12.4` bundled type declarations** (`dist/index.d.cts`, read this session via `npm pack`) — authoritative for: `contacts.create` overloads (`CreateContactOptions` vs `LegacyCreateContactOptions` with `@deprecated audienceId`), `CreateContactResponse = Response<CreateContactResponseSuccess>` ({data,error} discrimination), `RESEND_ERROR_CODE_KEY` enum (no duplicate/exists code), `ErrorResponse` shape.
- **nextjs.org/docs/app/guides/forms** (v16.2.9, lastUpdated 2026-03-10) — `useActionState` 3-tuple + pending, action signature `(prevState, formData)`, discriminated-state-not-throw idiom, `useFormStatus` parent-only constraint, server-side validation pattern.
- **resend.com/docs/api-reference (rate limit)** — default 5 req/s per team, 429 on exceed.
- **Codebase (read this session):** `app/blog/[slug]/page.tsx`, `app/blog/page.tsx`, `components/ui/CTAButton.tsx`, `components/blog/ShareBar.tsx`, `components/ConsentProvider.tsx`, `app/globals.css`, `lib/site.ts`, `lib/usePrefersReducedMotion.ts`, `.env.example`, `package.json`, `app/api/skills/dispatch/route.ts`, `.planning/codebase/{CONVENTIONS,STRUCTURE,INTEGRATIONS}.md`.

### Secondary (MEDIUM confidence)
- **resend.com/docs/api-reference/contacts/create-contact** (current docs reflect the newer segments/topics model; cross-referenced against the v6 SDK types for the legacy `audienceId` path).
- **react.dev/reference/react-dom/hooks/useFormStatus** — parent-form pending semantics.

### Tertiary (LOW confidence)
- General community guidance on email-regex pragmatism and honeypot anti-spam (well-established conventions, marked `[ASSUMED]` in the Assumptions Log).
- Resend duplicate-contact idempotency not confirmed by a live call (user has no account) — inferred from the SDK error-code enum (A2).

## Metadata

**Confidence breakdown:**
- Standard stack (`resend` version/contract): **HIGH** — read from the package's own bundled type declarations + npm registry verification.
- Architecture (Server Action + `useActionState`, env-gate, focus/a11y): **HIGH** — official Next 16.2.9 docs + direct codebase precedent (`ShareBar`, `ConsentProvider`, `usePrefersReducedMotion`, env-with-fallback in `lib/site.ts`).
- Pitfalls: **HIGH** for the documented ones (signature, `useFormStatus`, secrets, build-with-empty-env, duplicate handling); **MEDIUM** for the duplicate-as-success runtime behavior (A2 — verified by type enum, not a live call).
- Security: **MEDIUM-HIGH** — standard public-write-endpoint threat model; rate-limit number cited; honeypot adequacy is a judgment call (A4).

**Research date:** 2026-06-12
**Valid until:** ~2026-07-12 for the Resend SDK (fast-moving — re-verify the version and the `audienceId` deprecation status before a later milestone); ~2026-09 for the Next 16 / React 19 form pattern (stable).
