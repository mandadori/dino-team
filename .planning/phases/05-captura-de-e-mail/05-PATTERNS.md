# Phase 5: Captura de E-mail - Pattern Map

**Mapped:** 2026-06-12
**Files analyzed:** 5 (2 new, 3 modified)
**Analogs found:** 5 / 5 (every new/modified file has a strong in-repo analog; the genuinely-new mechanics — Server Action + `useActionState` + form inputs — are flagged below)

> Scope note: this is the site's **first text-entry surface and first write path**. There is zero prior art for Server Actions, `useActionState`, or external write SDKs. The analogs below are *visual/structural* moulds (token strings, env-gating, client-island discipline, mount points); the *integration mechanics* come from 05-RESEARCH.md §Code Examples (verified skeletons), not from an in-repo analog. Where a pattern is new, it is called out explicitly under "What's genuinely new."

---

## File Classification

| New/Modified File | New? | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|------|-----------|----------------|---------------|
| `site/components/blog/NewsletterForm.tsx` | NEW | component (client island) | request-response (form submit) | `site/components/blog/ShareBar.tsx` (client island + button token strings + `role="status"`/`aria-live` + reduced-motion) · `site/components/CookieBanner.tsx` (BUTTON_BASE/PRIMARY token strings + inline `/privacidade` link) · `site/app/admin/login/page.tsx` (the only prior `<form>` + `<input>` + submit `<button>` with monochrome tokens) | role-match (no prior `useActionState` form, but island + token + input precedents are exact) |
| `site/app/blog/actions.ts` | NEW | service (Server Action `"use server"`) | request-response → external write (Resend) | `site/app/api/skills/dispatch/route.ts` (server-only `process.env.*` access + secret guard + discriminated JSON return + no-throw) | role-match (Route Handler, not Server Action — but the env-guard + secret-gate + structured-return discipline transfer 1:1) |
| `site/app/blog/[slug]/page.tsx` | MODIFY | route (RSC) — mount point | request-response | itself — extend the existing article-end CTA `<section>` (lines 293–302) as the visual mould; env-gate mirrors `lib/site.ts` env-with-fallback | exact (in-file precedent) |
| `site/app/blog/page.tsx` | MODIFY | route (RSC) — mount point | request-response | itself — append after the listing (lines 103–121); env-gate mirrors `lib/site.ts` | exact (in-file precedent) |
| `site/.env.example` | MODIFY | config | — | itself — the `NEXT_PUBLIC_WHATSAPP_URL`/`NEXT_PUBLIC_SITE_URL` documented-empty block (lines 13–19) is the exact mould (BUT new keys are server-only, NO `NEXT_PUBLIC_` prefix) | exact |

`site/lib/site.ts` may be **extended** with non-secret constants only (e.g. honeypot field name, success copy) at executor discretion — **never** the Resend secrets (D-03). No new constant is strictly required; copy lives in `NewsletterForm` per UI-SPEC §Copywriting.

---

## Pattern Assignments

### `site/components/blog/NewsletterForm.tsx` (NEW — client island, request-response)

This file fuses three existing analogs. No single file is a full template; copy each slice from its source.

**Analog A — `site/components/blog/ShareBar.tsx`** (client-island shell, button tokens, a11y-live, reduced-motion)

Client directive + hook imports + the canonical `BUTTON_BASE` outline-button token string (lines 1–4, 20–23). **Critical:** the comment on line 18–19 documents *why* these strings are copied rather than using `CTAButton` — `CTAButton` renders an `<a>`, useless for an in-page action `<button>`. The new form's submit button must follow this same precedent.

```tsx
"use client";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

// Tokens de geometria/foco copiados de CookieBanner (CTAButton renderiza <a>,
// inutilizável para botões de ação in-page).
const BUTTON_BASE =
  "inline-flex min-h-[44px] items-center justify-center gap-2 px-8 py-4 font-body text-sm font-semibold uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg";
```

The `aria-live` confirmation idiom (lines 119–121) — copy this shape for the success/error regions, but the form needs both `role="status" aria-live="polite"` (success) AND `role="alert" aria-live="assertive"` (errors), per UI-SPEC §Accessibility Contract:

```tsx
<span role="status" aria-live="polite" className="sr-only">
  {copied ? "Link copiado para a área de transferência." : ""}
</span>
```

The reduced-motion gate idiom (lines 65, 75–76) — apply this to any optional pending spinner (Pitfall 7):

```tsx
const reduce = usePrefersReducedMotion();
const transition = reduce ? "" : "transition-colors duration-200";
```

**Analog B — `site/components/CookieBanner.tsx`** (primary-button tokens + inline `/privacidade` link)

The **solid white submit button** uses `BUTTON_PRIMARY` exactly as defined here (lines 19–22). UI-SPEC §Color reserves white for this single button.

```tsx
const BUTTON_PRIMARY = "bg-fg text-bg hover:bg-muted";
```

The **inline `/privacidade` link inside the consent label** copies this `<Link>` token string verbatim (lines 44–51) — `next/link`, `font-semibold underline underline-offset-4` + the focus-visible ring (UI-SPEC §Typography says the consent link is weight 600 + `underline underline-offset-4`):

```tsx
import Link from "next/link";
// ...
<Link
  href="/privacidade"
  className="font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg"
>
  Política de Privacidade
</Link>
```

**Analog C — `site/app/admin/login/page.tsx`** (the ONLY prior `<input>` + submit `<button>` — exact monochrome field tokens)

This is the single existing text input in the repo. Its className (line 26) is the direct mould for the new email input's visual tokens — UI-SPEC §New tokens prescribes the *same* set (`bg-surface`, `border border-line` → focus `border-fg`, `px-4 py-3`, `rounded-none` implicit). Copy the field styling; add the form-specific a11y attrs (`name`, `type="email"`, `required`, `inputMode`, `autoComplete`, `aria-invalid`, `aria-describedby`):

```tsx
// admin/login input — the field-token mould:
className="mt-6 w-full border border-line bg-surface px-4 py-3 font-body text-fg outline-none focus:border-fg"
// admin/login submit button (note: this one is bg-fg primary, full-width):
className="mt-4 w-full bg-fg px-6 py-3 font-body text-sm font-semibold uppercase tracking-wide text-bg hover:bg-muted"
```

> Caveat: `admin/login` uses controlled `useState` + `onSubmit` + `preventDefault` (the *old* manual pattern). Do NOT copy its state mechanics — the new form uses `useActionState` (Pattern 1 below). Copy only its **visual token strings** for the input/button.

**What's genuinely new (no in-repo analog — use 05-RESEARCH.md §Code Examples):**
- `useActionState(subscribe, initial)` 3-tuple + `pending` from index 2 (RESEARCH Pattern 1; Pitfalls 1 & 2). The action signature is `(prevState, formData)` — first arg required even if unused.
- Discriminated `SubscribeState` union driving the 7 UI states (RESEARCH Pattern 2; maps 1:1 to UI-SPEC §States).
- Managed-focus `useEffect` keyed on `state` (input / checkbox / success-heading `tabIndex={-1}` refs) — RESEARCH Pattern 4; Pitfall 6.
- The honeypot hidden input + the consent checkbox (`accent-[#ededed]`, `size-5`) — RESEARCH Code Examples; UI-SPEC §New tokens.
- The full `NewsletterForm.tsx` skeleton is in 05-RESEARCH.md §Code Examples → "Client island skeleton" (verified shape). Fill tokens/copy from UI-SPEC.

---

### `site/app/blog/actions.ts` (NEW — Server Action `"use server"`, request-response → external write)

**Analog — `site/app/api/skills/dispatch/route.ts`** (server-only env access + secret guard + structured discriminated return + never-throws)

This Route Handler is the closest precedent for the *server-side discipline* the Server Action needs, even though the mechanism differs (Route Handler vs Server Action). Mirror these three patterns:

**1. Server-only secret read + early guard** (lines 26–29) — the action reads `process.env.RESEND_API_KEY`/`RESEND_AUDIENCE_ID` the same way; absence → return a state, never throw (D-03/D-12):

```ts
const apiKey = process.env.CLAUDE_API_KEY;
if (!apiKey) {
  return NextResponse.json({ error: "CLAUDE_API_KEY não configurada" }, { status: 500 });
}
```
→ becomes, in the action: `if (!apiKey || !audienceId) return { status: "server_error" };`

**2. Discriminated structured return, no throw** (lines 64–73) — the SDK client (`Anthropic` here, `Resend` there) is the external dependency; return a plain object the caller branches on. The action returns the `SubscribeState` union instead of a `NextResponse`.

**3. Lazy SDK instantiation after the guard** (line 61: `new Anthropic({ apiKey })` is constructed *after* the apiKey check, not at module top-level) — copy this exactly to avoid build-time throw with empty env (RESEARCH Pitfall 4):

```ts
const client = new Anthropic({ apiKey }); // constructed only after apiKey confirmed
```
→ in the action: `const resend = new Resend(apiKey);` only after the env guard passes.

**What's genuinely new (no in-repo analog — use 05-RESEARCH.md §Code Examples):**
- `"use server"` directive + the `(prevState, formData) => Promise<SubscribeState>` signature (no prior Server Action exists; verified search returned NONE).
- `resend.contacts.create({ audienceId, email, unsubscribed: false })` (legacy `audienceId` overload — D-01/D-03). `{ data, error }` discrimination; **any clean `data` = success** (covers already-subscribed, D-11 — no try/catch, no duplicate-check; Pitfall 5).
- Honeypot bail (`formData.get("website")` → silent `success`), consent revalidation (`formData.get("consent") !== "on"` → `consent_error`, D-08), regex email gate `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` (D-09; RESEARCH Pattern 5).
- The full action skeleton is in 05-RESEARCH.md §Code Examples → "Action skeleton" (verified against `resend@6.12.4` types + Next 16.2.9 docs).
- **Install gate:** `resend@6.12.4` is NOT in `site/package.json` (verified). Gate the install behind a `checkpoint:human-verify` task per the Phase 04 precedent (RESEARCH §Package Legitimacy Audit).

---

### `site/app/blog/[slug]/page.tsx` (MODIFY — RSC route, mount point)

**Analog — itself.** The article-end CTA `<section>` (lines 292–302) is the **visual mould** named by CONTEXT D-05. The new form section mounts **immediately after** it (last block of the article), inside the same `mx-auto max-w-[68ch]` column (line 287).

```tsx
{/* CTA final — existing WhatsApp section (lines 293–302): the visual mould */}
<section className="mt-16 border-t border-line pt-12 text-center">
  <p className="font-body text-sm uppercase tracking-widest text-muted">
    O topo exige direção.
  </p>
  <div className="mt-6 flex justify-center">
    <CTAButton href={WHATSAPP_URL}>Quero minha direção</CTAButton>
  </div>
</section>
{/* NEW: NewsletterForm section mounts HERE, after the WhatsApp CTA (D-05/D-06) */}
```

**Env-gate** (RESEARCH Pattern 3 / Code Examples "Env-gate in RSC parent") — read secrets server-only in the RSC body, render nothing when unset (D-12):

```tsx
const newsletterEnabled =
  !!process.env.RESEND_API_KEY && !!process.env.RESEND_AUDIENCE_ID;
// ...
{newsletterEnabled && (
  <section className="mt-16 border-t border-line pt-12 text-center">
    {/* heading/subtext per UI-SPEC */}
    <NewsletterForm />
  </section>
)}
```

This mirrors the env-with-fallback discipline already in `lib/site.ts` (`WHATSAPP_URL`/`SITE_URL`), except the absence path is "don't render" instead of "use fallback." The import follows the existing barrel convention: `import { NewsletterForm } from "@/components/blog/NewsletterForm";` (same shape as the `AuthorBlock`/`ShareBar`/`RelatedPosts` imports on lines 21–23).

---

### `site/app/blog/page.tsx` (MODIFY — RSC route, mount point)

**Analog — itself.** The form mounts at the **end of the listing**, after the featured + grid block (after line 121, before `</div>`/`</main>`). Per UI-SPEC §Spacing, the listing form is constrained to `max-w-md` centered (not the article's `max-w-[68ch]`). Same `newsletterEnabled` env-gate as the article route (copy it verbatim). Same import shape as the existing `PostCard`/`CategoryNav` imports (lines 5–6).

> Note: this page is currently a synchronous `export default function BlogListingPage()` (line 47) — it has no `async`/`await`, and reading `process.env.*` in an RSC body needs neither. The article route is `async` (for `await params`); the listing route stays sync. Both read `process.env` identically.

---

### `site/.env.example` (MODIFY — config)

**Analog — itself.** Lines 13–19 (`NEXT_PUBLIC_WHATSAPP_URL`/`NEXT_PUBLIC_SITE_URL`) are the documented-empty mould. Append the two new keys **without** the `NEXT_PUBLIC_` prefix (they are server-only secrets — D-03, Pitfall 3). Exact block from RESEARCH §Code Examples → ".env.example additions":

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

The existing file already has a server-only-secret precedent block (`CRON_SECRET`/`CLAUDE_API_KEY`/`DASHBOARD_TOKEN`, lines 21–29) — the Resend keys belong with those (server-only), NOT with the `NEXT_PUBLIC_*` group, conceptually.

---

## Shared Patterns

### Monochrome button tokens (NOT `CTAButton`)
**Source:** `site/components/blog/ShareBar.tsx` lines 18–23 + `site/components/CookieBanner.tsx` lines 16–22
**Apply to:** the `NewsletterForm` submit button
The repo's established law: `CTAButton` renders an `<a>` (a link), unusable for an in-page action button. Every in-page button (`ShareBar`, `CookieBanner`) copies the `BUTTON_BASE` + `BUTTON_PRIMARY`/`BUTTON_OUTLINE` token strings into a real `<button>`. The submit button is `BUTTON_BASE` + `BUTTON_PRIMARY` (solid white). The `hover:scale-[1.04]` variant (in `CookieBanner`'s BUTTON_BASE) is CSS-only / auto reduced-motion-safe.

### Server-only env read + graceful empty (degradation)
**Source:** `site/lib/site.ts` lines 8–11, 39–40, 125–126 (env-with-fallback) + `site/app/api/skills/dispatch/route.ts` lines 22–29 (env guard)
**Apply to:** both mount points (RSC env-gate) AND the Server Action (server guard)
Reading a missing `process.env.X` yields `undefined` (falsy) — no throw, build stays green. Mount points render nothing when unset (D-12); the action returns `server_error` (D-03). **Never** `NEXT_PUBLIC_` the Resend keys (secrets), and **never** import them into the client island.

### Client-island confinement (`"use client"` only where state lives)
**Source:** `site/components/ConsentProvider.tsx` (the shared client boundary) + `site/components/blog/ShareBar.tsx` (leaf island) vs the RSC pages that mount them
**Apply to:** `NewsletterForm` is `"use client"`; the `<section>` that mounts it in both pages stays RSC (D-13). The env-gate decision happens in the RSC parent (secrets never cross into client JS). **Do NOT reuse `useConsent`/`ConsentProvider`** — that gates cookies/tracking; this form's consent is local form state (D-07).

### Reduced-motion gate
**Source:** `site/lib/usePrefersReducedMotion.ts` + its use in `ShareBar.tsx` (lines 65, 75–76) and `CookieBanner.tsx` (lines 26, 32–34)
**Apply to:** any optional pending spinner in `NewsletterForm` (Pitfall 7). `const reduce = usePrefersReducedMotion();` → render static `ENVIANDO…` text only when `reduce`. The global `@media (prefers-reduced-motion)` reset in `globals.css` (lines 58–67) already kills CSS animation; the hook covers JS/SVG motion.

### Inline `/privacidade` link + focus-visible ring
**Source:** `site/components/CookieBanner.tsx` lines 44–51 (the exact Link token string) + the global `:focus-visible { outline: 2px solid #fff; outline-offset: 3px }` in `globals.css` lines 51–55 + the footer focus-visible classes repeated across `app/blog/[slug]/page.tsx` (lines 225, 326, 332)
**Apply to:** the consent checkbox label's inline `/privacidade` link; every interactive element (input, checkbox, link, button) inherits the white focus ring for free, but the explicit `focus-visible:ring-*` classes are added on buttons/links per the established token strings.

### Section divider mould (`border-t border-line pt-12`)
**Source:** `site/app/blog/[slug]/page.tsx` line 293 (end-CTA) + `site/components/blog/RelatedPosts.tsx` line 16 + `site/components/blog/AuthorBlock.tsx` line 25 (`pt-8` variant)
**Apply to:** the form section wrapper. `mt-16 border-t border-line pt-12` (centered `text-center` in the article) is the calm sub-block rhythm shared by every article-foot section. The form inherits it so it reads as one more quiet block, not a second hero (D-06).

---

## No Analog Found

No file is fully analog-less, but these **mechanics** have no in-repo precedent and must come from 05-RESEARCH.md (verified skeletons), not from copying an existing file:

| Mechanic | Role | Data Flow | Reason / Source |
|----------|------|-----------|-----------------|
| `"use server"` Server Action | service | request-response → external write | No Server Action exists in the repo (verified: grep `"use server"` → NONE). Use RESEARCH §Code Examples "Action skeleton". |
| `useActionState` form state | component | request-response | No `useActionState` usage exists (verified). The one prior form (`admin/login`) uses old `useState`+`onSubmit`. Use RESEARCH Pattern 1 + "Client island skeleton". |
| `resend.contacts.create` (Audiences) | service | external write | First external write path on the site. No ESP/email SDK precedent. `resend` not installed. Use RESEARCH §Standard Stack + Pitfall 5. |
| Managed-focus on state transition (`useEffect` + refs + `tabIndex={-1}`) | component | — | `ShareBar` has `aria-live` but no focus-management layer. Use RESEARCH Pattern 4 + Pitfall 6. |
| Consent checkbox primitive (`accent-[#ededed]`, `size-5`) + honeypot input | component | — | No checkbox primitive exists (cookie consent is two buttons). Use UI-SPEC §New tokens + RESEARCH Code Examples. |

---

## Metadata

**Analog search scope:** `site/components/`, `site/components/blog/`, `site/app/blog/`, `site/app/admin/`, `site/app/api/`, `site/lib/`, `site/app/globals.css`, `site/.env.example`, `site/package.json`, `site/tsconfig.json`
**Files scanned:** 13 read in full + 2 grep sweeps (Server Action / form-element / path-alias)
**Verification sweeps:** `"use server"` → NONE · `useActionState` → NONE · `<form>`/`type="email"`/`type="checkbox"` → only `app/admin/login/page.tsx` · `resend` in package.json → absent · path alias `@/*` → `./*`
**Pattern extraction date:** 2026-06-12
