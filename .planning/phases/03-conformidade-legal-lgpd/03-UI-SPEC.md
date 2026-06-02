---
phase: 3
slug: conformidade-legal-lgpd
status: draft
shadcn_initialized: false
preset: none
created: 2026-06-01
---

# Phase 3 — UI Design Contract: Conformidade Legal & LGPD

> Visual and interaction contract for this phase. Consumed by planner (tasks), executor (implementation), and ui-checker (validation).
> **Scope:** Only UI/UX. The technical consent state (Context vs prop), persistence mechanism, and component name are delegated to the executor per CONTEXT.md Claude's Discretion — not specified here.
> **Brand law (override):** monocromático estrito (preto/branco/cinza), tom sereno/anti-espetáculo. Sem cor de destaque, sem clichê ("Sua privacidade importa para nós"), sem terceiro botão de "Configurar". (REQUIREMENTS.md §Out of Scope, CLAUDE.md, CONTEXT.md D-05/D-06/D-10).
> **Inherited design system:** This phase reuses, without redefining, the tokens/type/spacing established in `01-UI-SPEC.md`. New surfaces (CookieBanner, /privacidade, /termos) must consume the existing system as-is.

This phase ships three surfaces:
1. **`/privacidade`** — Política de Privacidade (RSC, no interactivity) — LEGAL-01
2. **`/termos`** — Termos de Uso (RSC, no interactivity) — LEGAL-02
3. **CookieBanner** — fixed bottom bar, client island, gates `TrackingScripts` — LEGAL-03

Plus: legal links added to the existing `<footer>` in `app/page.tsx` (D-04).

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (Tailwind CSS 4, CSS-first `@theme` in `site/app/globals.css`; no `tailwind.config.js`) |
| Preset | not applicable — shadcn gate dispensed (see below) |
| Component library | custom — components in `site/components/` |
| Icon library | none for this phase (banner/legal pages need no icons; avoid injecting an icon dep) |
| Font | Anton (`--font-display`, display/uppercase) + Montserrat (`--font-body`, corpo) |

**shadcn gate result:** Dispensed by documented contraindication (same as 01-UI-SPEC.md). The brand has a closed, mature monochrome design system; CLAUDE.md and REQUIREMENTS.md §Out of Scope forbid injecting third-party UI/color/script. Initializing shadcn would introduce `--primary`/`--ring`/`--destructive` color tokens that violate brand law. `Tool: none`; registry safety gate: **not applicable** (no third-party registry declared).

**Existing assets reused (do not redefine):**
- `site/app/globals.css` — tokens `--color-bg/fg/muted/surface/line`, `--font-display/body`, global `:focus-visible` ring, global `prefers-reduced-motion` safety net.
- `site/components/ui/CTAButton.tsx` — `primary` (white solid / black text) and `outline` variants. **Reused for the banner's "Aceitar" button** (D-06). Note: `CTAButton` currently renders an `<a target="_blank">`; the banner's Accept/Recusar are in-page **buttons** that mutate consent state, so the executor will need a button-rendering variant or a sibling `<button>` styled identically — flagged here as an implementation note, not a new visual contract.

---

## Spacing Scale

Inherited from 01-UI-SPEC.md. 4px base; restricted to: **4, 8, 16, 24, 32, 48, 64, 96, 128**.

| Token | Value | Usage this phase |
|-------|-------|------------------|
| xs | 4px | Inline icon/text gaps (none expected) |
| sm | 8px | Gap between banner text and button row on mobile stack |
| md | 16px | Default paragraph spacing in legal pages; banner inner gap |
| lg | 24px | Page gutter `px-6` (banner + legal pages); banner vertical padding `py-6` (desktop) / `py-4` (mobile, ~16px) |
| xl | 32px | Legal-page heading → body block spacing |
| 2xl | 48px | Between major legal sections (e.g. "1. Coleta de dados" blocks) |
| 3xl+ | 64 / 96 / 128px | Legal-page top/bottom rhythm: `py-24` mobile → `sm:py-32` desktop (matches landing section rhythm so the page sits under the same fixed header) |

**Container:** `max-w-3xl` (768px, ~65ch) for legal-page prose readability — narrower than the landing's `max-w-6xl` because long legal text needs a tight measure. Banner content centered within `max-w-6xl` to align with the landing's content width. Gutter `px-6` (24px) at all widths.

**Touch target minimum:** 44×44px. "Aceitar" reuses `CTAButton` geometry (`px-8 py-4` ≈ 56px tall — OK). "Recusar" must also clear 44px height even as outline/link.

Exceptions: none.

---

## Typography

Inherited from 01-UI-SPEC.md. Display = **Anton** (always `uppercase`). Body = **Montserrat**. Exactly **2 weights**: Montserrat 400 (regular) + 600 (semibold). Anton is single-weight (ignores weight).

| Role | Font | Size (mobile → desktop) | Weight | Line height |
|------|------|-------------------------|--------|-------------|
| Legal page H1 (title) | Anton | `text-4xl` 36px → `sm:text-5xl` 48px | 400 | 1.1 |
| Legal page H2 (section) | Anton | `text-2xl` 24px | 400 | 1.2 |
| Legal page H3 (sub-section, if needed) | Montserrat | `text-lg` 18px, uppercase, `tracking-wide` | 600 | 1.4 |
| Legal body / paragraph | Montserrat | `text-base` 16px | 400 | 1.6 (relaxed — long-form reading) |
| Legal meta ("Última atualização: …") | Montserrat | `text-sm` 14px | 400 (muted) | 1.4 |
| Banner body text | Montserrat | `text-sm` 14px → `sm:text-base` 16px | 400 | 1.5 |
| Banner inline link ("Política de Privacidade") | Montserrat | inherits banner body size | 600 + `underline underline-offset-4` | inherits |
| Button label ("Aceitar" / "Recusar") | Montserrat | `text-sm` 14px, uppercase, `tracking-wide` | 600 | 1 |

3 effective sizes in play per surface (14/16 + one display step) — within the 3–4 limit. No 500/700/800.

---

## Color

Monochrome strict. The "10% accent" is **not a color** — it is **white reserved for the single primary action** ("Aceitar" solid button) on the black terrain. There is no brand color beyond black/white/gray, and **no destructive color** (recusar is not destructive-styled — see below).

| Role | Token | Value | Usage |
|------|-------|-------|-------|
| Dominant (~60%) | `--color-bg` | `#0a0a0a` | Banner background (D-05); legal page background |
| Secondary (~30%) | `--color-line` | `#262626` | Banner top border (`border-t border-line`, D-05); divider rules between legal sections; footer top border (existing) |
| Accent (~10%) | white | `#FFFFFF` (via `--color-fg #ededed` / `bg-fg`) | **Reserved exclusively for:** the "Aceitar" solid button (white fill, black text) and legal-page H1/H2 display titles. Nothing else competes for emphasis. |
| Destructive | — | **none** | "Recusar" is a neutral, equally-legitimate choice — **not** styled red/destructive. Per brand law there is no destructive color; per LGPD recusar must not be visually punished. |

**Text tokens (inherited):**

| Token | Value | Context | Contrast |
|-------|-------|---------|----------|
| `--color-fg` | `#ededed` | Primary text on black (legal body, banner text) | ~15:1 — AAA |
| `--color-muted` | `#7f7f7f` | Secondary text on black (legal meta, banner secondary line) | ~4.7:1 — AA. **Never** on white. |

> Legal pages and the banner sit on **black** (D-02/D-05) — the white-block tokens (`--color-fg-on-light`, `--color-muted-on-light`) from 01-UI-SPEC.md are **not used** in this phase. No photo, no scrim in this phase.

Accent reserved for: **the "Aceitar" button fill and legal-page display titles only.** Never applied to body text, the "Recusar" control, the inline link, or footer links.

---

## Component Inventory

| Component | Source | Variant / styling | States |
|-----------|--------|-------------------|--------|
| `CookieBanner` (NEW, `components/`, `"use client"`) | custom | Fixed bottom bar (`fixed bottom-0 inset-x-0 z-50`), `bg-bg`, `border-t border-line`, `px-6 py-4 sm:py-6`. Inner: `max-w-6xl mx-auto`, text + 2-button row. Does **not** block content (D-05). | hidden (consent already decided / not yet mounted), visible (no decision yet), exiting (discreet fade/slide-out on choice), reduced-motion (appears/disappears instantly, no transition) |
| "Aceitar" button | reuse `CTAButton` primary geometry/style | white fill, black text, uppercase, `tracking-wide`, 600 (D-06). In-page action (not a link) → button-rendered. | default, hover (`bg-muted` per CTAButton, scale 1.04 via CSS — auto-respects reduced-motion), focus-visible (white ring, inherited global), active |
| "Recusar" button | custom outline/link, sober | `outline` style (`border border-fg/40 text-fg hover:border-fg hover:bg-fg/5`) OR plain underlined link — **lower visual weight than Aceitar** (D-06), but not destructive, not hidden, not disabled-looking. | default, hover, focus-visible (white ring), active |
| Banner inline link → `/privacidade` | `next/link` | `underline underline-offset-4`, weight 600, inherits text color (`text-fg`), focus-visible ring. (D-09) | default, hover (no color change — underline already present), focus-visible |
| `/privacidade` page | NEW `app/privacidade/page.tsx` (RSC) | Inherits fixed header + footer (D-02). Black bg, Anton H1/H2, Montserrat 16px/1.6 prose, `max-w-3xl`, `py-24 sm:py-32`. Static legal copy with `[RAZÃO SOCIAL]`/`[CNPJ]`/`[E-MAIL DO ENCARREGADO DE DADOS]` placeholders (D-01). | static (no interactive state) |
| `/termos` page | NEW `app/termos/page.tsx` (RSC) | Same shell/typography/spacing as `/privacidade`. | static |
| Footer legal links | EDIT existing `<footer>` in `app/page.tsx` (D-04) | `next/link` to `/privacidade` and `/termos`. `text-sm`, `text-muted hover:text-fg`, focus-visible ring. Match existing footer link styling. | default, hover, focus-visible |
| `TrackingScripts` | EDIT existing `components/TrackingScripts.tsx` (D-10/D-11) | No visual change. Renders its `<Script>` tags **only when consent === true**. Visual contract: nothing renders to the DOM visually either way. | gated (consent true → mounts), suppressed (consent false/undecided → renders nothing) |

**Convention note:** Banner copy/config (e.g. the 6-month duration, D-08) should live in `lib/site.ts` alongside `WHATSAPP_URL`/`STATS`, per the established constants pattern (CONTEXT.md code_context). Executor decides exact shape.

---

## States & Interactions

**Consent lifecycle (the core interaction of this phase):**

1. **Undecided (first visit, no stored choice):** banner visible at bottom. `TrackingScripts` suppressed (renders nothing). Page fully usable (banner does not block — D-05).
2. **Aceitar pressed:** choice persisted for 6 months (D-08). Banner exits (discreet fade/slide). `TrackingScripts` mounts and the three `<Script>` tags load (GA4 / Meta Pixel / Clarity — D-10).
3. **Recusar pressed:** choice persisted for 6 months. Banner exits. `TrackingScripts` stays suppressed this session **and future sessions** until the choice expires (D-07). No "Gerenciar cookies" affordance exists (D-07 / deferred).
4. **Returning visitor within 6 months:** no banner. Tracking state reflects the stored choice (loads if accepted, suppressed if refused).
5. **After 6 months:** stored choice expired → banner reappears as in state 1.

**Animation (CONTEXT.md D / Claude's Discretion):**
- Banner entrance/exit = **discreet** fade or slide-up only (executor's choice). No bounce, no attention-grab. Do **not** use `Reveal.tsx` (it is scroll-driven; banner is `fixed` — code_context note).
- `prefers-reduced-motion`: banner appears/disappears **instantly** (no transition). Gate via `usePrefersReducedMotion` (existing hook) or the global CSS reduced-motion net, consistent with DSGN-03.
- "Aceitar" hover scale (1.04) inherited from `CTAButton` (pure CSS, auto-respects reduced-motion).

**Client islands (DSGN-05):** `"use client"` lives only in `CookieBanner` (and whatever consent provider the executor introduces). It **never** rises to the legal pages (RSC) or to `app/page.tsx` as a whole.

**No-layout-shift requirement:** the fixed bottom banner must not cause CLS on the landing or legal pages. It overlays content (D-05: "não bloqueia conteúdo") rather than pushing it.

---

## Accessibility Contract

- **Contrast:** banner and legal text on black — `--color-fg #ededed` (~15:1 AAA), `--color-muted #7f7f7f` (~4.7:1 AA). Inline link uses `text-fg` + underline (does not rely on color alone to signal a link — passes WCAG 1.4.1). "Recusar" must be legible (≥4.5:1) despite lower visual weight — lower weight ≠ low contrast.
- **Both choices keyboard-reachable and equally operable:** Tab order = Aceitar then Recusar (or visual order); both are real `<button>`s with visible focus. LGPD/accessibility: refusing must be **no harder** than accepting (same number of actions, both visible without scrolling).
- **Focus indicators:** inherited global `:focus-visible` white ring (`outline: 2px solid #fff; offset 3px`). Applies to both buttons, the inline link, and footer links. Never reset without replacement; never the browser blue default (violates monochrome).
- **Banner semantics:** the banner is a complementary region — use a `<div role="region" aria-label="Consentimento de cookies">` (or a `<dialog>`-free landmark). It must **not** trap focus and must **not** be `aria-modal` (it does not block the page). Do not auto-move focus into it on load (would hijack first-visit reading).
- **Inline link:** descriptive text ("Política de Privacidade"), not "clique aqui".
- **Legal pages:** semantic heading hierarchy (single H1, ordered H2/H3), prose readable at 16px/1.6, `max-w-3xl` measure. RSC — no motion, no JS needed to read.
- **Screen reader:** when consent is granted/refused and the banner is removed, removal of an off-focus region needs no announcement; do not add a disruptive live-region toast (anti-espetáculo).
- **`prefers-reduced-motion`:** banner transitions disabled; content present/absent immediately.

---

## Responsive Behavior

| Breakpoint | Banner | Legal pages |
|------------|--------|-------------|
| mobile (<640) | Full-width bottom bar. Text stacks **above** the button row (`flex-col gap-4`). Buttons full-width or side-by-side with comfortable 44px targets. `py-4`, `px-6`. | Single column, `max-w-3xl` (effectively full width minus gutter), `px-6`, `py-24`. H1 `text-4xl`. |
| sm (≥640) | Text and button row on one line where space allows (`sm:flex-row sm:items-center sm:justify-between`), or text left / buttons right. `sm:py-6`. Content within `max-w-6xl mx-auto`. | H1 `text-5xl`, `sm:py-32`. Measure stays `max-w-3xl` (does not widen — long-form readability). |
| lg (≥1024) | Same as sm; content stays within `max-w-6xl`. | Same as sm; content stays `max-w-3xl` centered. |

Mobile-first. The banner must remain a single sober bar at every width — no full-screen modal variant.

---

## Copywriting Contract

Tom **sereno, direto, anti-espetáculo** (`brand/tom-de-voz.md`). Executor writes exact banner copy within this tone (D / Claude's Discretion) — the strings below are **prescriptive defaults the executor may refine**, not literals to paste verbatim, except where marked.

| Element | Copy |
|---------|------|
| Banner body | Sober, factual, names the purpose. Default: **"Usamos cookies de analytics para entender o uso do site. Você decide."** followed by the inline link. Must contain a link to `/privacidade` (D-09). **Forbidden clichê:** "Sua privacidade importa para nós" / "Valorizamos sua privacidade" (CONTEXT.md). |
| Banner inline link | **"Política de Privacidade"** (links to `/privacidade`). Not "saiba mais", not "clique aqui". |
| Primary CTA (Aceitar) | **"Aceitar"** (D-06). Single word, sober. Not "Aceitar todos", not "Concordo e continuar". |
| Secondary action (Recusar) | **"Recusar"** (D-06). Equal legitimacy, lower visual weight, plain. Not "Recusar e sair", not "Não, obrigado". |
| Legal page titles (H1) | **"Política de Privacidade"** (`/privacidade`); **"Termos de Uso"** (`/termos`). Anton uppercase. |
| Legal page meta | **"Última atualização: [DATA]"** — placeholder date for the user to set, muted, `text-sm`. |
| Identifier placeholders (D-01) | `[RAZÃO SOCIAL]`, `[CNPJ]`, `[E-MAIL DO ENCARREGADO DE DADOS]` — literal bracketed tokens in the generated legal copy so the user swaps them without touching code. |
| Footer links | **"Política de Privacidade"** and **"Termos de Uso"** (D-04), matching tone. |
| Empty state | **None.** No data-listing surfaces in this phase. |
| Error state | **None.** No forms/submissions in this phase (email capture = Phase 5). |
| Destructive confirmation | **None.** "Recusar" is a normal, reversible-by-expiry choice — **not** a destructive action and gets **no** confirmation dialog (D-07: choice is definitive but unceremonious). |

**Copy prohibitions (brand law — validate in checker):** no privacy clichés; no fake urgency/scarcity; no manipulative consent dark-patterns (no pre-checked, no "Aceitar" visually dominant to the point of hiding "Recusar"); body in second person ("você"); no caps-lock shouting in prose (Anton handle the uppercase display role only).

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not applicable — shadcn not initialized (documented contraindication) |
| third-party | none declared | not applicable |

No registries in use this phase. Vetting gate: not triggered.

---

## Out of Scope

- **Granular cookie categories** (analytics / functional / marketing toggles) — CONTEXT.md deferred. Single "tracking scripts" block only (D-10).
- **"Gerenciar cookies" footer link / consent-revocation UI** — CONTEXT.md D-07 / deferred. Choice is definitive until 6-month expiry.
- **Third "Configurar" button** — D-06: exactly two buttons.
- **Privacy-first analytics swap (Plausible/Fathom)** — deferred; keeping GA4/Pixel/Clarity gated.
- **Any new tracking beyond the existing 3 scripts** — domain boundary.
- **Color, destructive styling, icons, third-party UI** — brand law.
- **Forms / error states / email capture** — Phase 5.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
