# Phase 2: Conversão Completa - Research

**Researched:** 2026-06-01
**Domain:** Next.js 16 App Router landing-page sections (RSC) + Tailwind CSS 4 monochrome design system
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Ordem e posicionamento**
- **D-01:** Sequência das 3 novas seções: **Depoimentos → Comunidade → Planos**, inseridas antes do FAQ.
- **D-02:** Planos → FAQ → CtaFinal. FAQ absorve objeções pós-preço; CtaFinal encerra.
- **D-03:** As 7 seções existentes não mudam de posição nesta fase.
- **D-04:** O CtaFinal vira **reforço emocional** (copy de identidade, não "escolha um plano"). CTA WhatsApp permanece, com copy distinta dos cards de Planos. Não é removido nem deixado intacto.

**Seção Planos (CONV-01)**
- **D-05:** **2 planos** — layout de 2 cards. Decisão binária ("marca de elite, não popular").
- **D-06:** Dados reais (nomes, preços, inclusos) chegam via chat sob demanda. Executor constrói estrutura com placeholders marcados (`PLACEHOLDER` em `lib/site.ts`).
- **D-07:** CTA WhatsApp por plano = **deeplink personalizado** (`wa.me/NUMBER?text=Quero+o+Plano+X`), não URL genérica.
- **D-08:** Deeplinks em constante `PLANS` (array de objetos) em `lib/site.ts`: cada objeto com nome, preços, inclusos e `whatsappUrl`. Placeholder até o número real chegar. Coerente com `WHATSAPP_URL`, `STATS`, `TIMELINE` existentes.
- **D-09:** Cards sóbrios, **sem badge "popular"**. Distinção visual delegada ao executor (borda, fundo `surface` vs `bg`, ou dimensão) — monocromático estrito.

**Seção Depoimentos (CONV-02)**
- **D-10:** **3 depoimentos** no layout.
- **D-11:** Estrutura: `{ name, context, change, result, photo?, publishable }`. Campo `publishable: true/false` é o gate editorial — componente só renderiza `publishable: true`. Placeholders ficam `false` e nunca aparecem.
- **D-12:** Foto P&B do aluno é **opcional** — card funciona com avatar placeholder monocromático.
- **D-13:** Layout: **grade 3 colunas desktop / empilhado mobile**. Sem carrossel, sem dependência extra.

**Seção Comunidade (CONV-03)**
- **D-14:** Comunidade = **grupo fechado de WhatsApp exclusivo para alunos**. CTA leva a link de convite do grupo (não ao número de suporte).
- **D-15:** Composição: título + **3–4 benefícios textuais** (comunidade como parte do método) + CTA. Sem gamificação, sem contador, sem quote de membro.
- **D-16:** Textos dos benefícios = placeholders marcados. Constante `COMMUNITY_BENEFITS` em `lib/site.ts`.
- **D-17:** Link do grupo = constante `COMMUNITY_WHATSAPP_URL` em `lib/site.ts` (separada de `WHATSAPP_URL`). Placeholder até o link real chegar.

**WhatsApp real (CONF-01)**
- **D-18:** Após a fase, **3 constantes distintas de WhatsApp**: `WHATSAPP_URL` (suporte geral, env já existia), `COMMUNITY_WHATSAPP_URL` (grupo de alunos, novo placeholder), `whatsappUrl` por plano dentro de `PLANS` (deeplinks, novo placeholder).
- **D-19:** Número/links reais chegam via chat. **Nenhuma env var nova obrigatória** para o build funcionar com placeholders.

### Claude's Discretion
- **Distinção visual dos 2 cards de Planos** — borda mais grossa, fundo `surface` vs `bg`, ou diferença de dimensão; monocromático estrito, sem badge "popular".
- **Copy do CtaFinal reformulado** — executor escreve nova copy de reforço emocional respeitando brand book + tom-de-voz.
- **Animações das 3 novas seções** — seguem o padrão da Fase 1 (Reveal + microinterações mínimas). Nenhuma novidade.

### Deferred Ideas (OUT OF SCOPE)
- `COMMUNITY_WHATSAPP_URL` como env var (hoje hardcoded placeholder).
- Quote de membro da Comunidade.
- Carrossel de depoimentos (grade fixa em vez disso).
- Contador de membros (CONV-04, v2).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CONV-01 | Seção Planos com preço visível, inclusos por plano, CTA WhatsApp por plano (cards sóbrios, sem badge "popular") | `PLANS` constant pattern (mirrors `STATS`/`TIMELINE`), `PlanCard` RSC, deeplink builder, `CTAButton` reuse — §Standard Stack, §Code Examples |
| CONV-02 | Seção Depoimentos nomeados (contexto→mudança→resultado), foto P&B opcional; sem nome real não publica | `TESTIMONIALS` constant with `publishable` gate (`.filter`), `RamonPhoto` avatar-placeholder precedent — §Architecture Patterns, §Pitfall 1 |
| CONV-03 | Seção Comunidade como parte do método, sem gamificação | `COMMUNITY_BENEFITS` + `COMMUNITY_WHATSAPP_URL` constants, centered `max-w-4xl` block — §Code Examples |
| CONF-01 | WhatsApp real substituindo placeholder `wa.me/0000000000` (via `NEXT_PUBLIC_WHATSAPP_URL`) | Three distinct WhatsApp constants (D-18); placeholder-safe build (D-19); deeplink text-param builder — §Pitfall 4 |
</phase_requirements>

## Summary

This is a **pure additive, frontend-only phase** with **zero new dependencies**. It adds three React Server Components (`Depoimentos`, `Comunidade`, `Planos`) to the existing landing page, edits one existing section's copy (`CtaFinal`), reconciles a stale placeholder block in `Resultados.tsx`, and adds three data constants to `lib/site.ts`. Every pattern needed already exists in the Fase 1 codebase: `Reveal` for entry animation, `CTAButton` for all CTAs, `RamonPhoto` as the exact precedent for an intentional monochrome avatar placeholder, and module-level `ReadonlyArray` constants (`STATS`, `TIMELINE`, `FAQS`) as the template for `PLANS`/`TESTIMONIALS`/`COMMUNITY_BENEFITS`.

The phase carries an unusually complete upstream contract: CONTEXT.md (D-01…D-19) and an **approved UI-SPEC** (`02-UI-SPEC.md`) already fix layout, typography, color, spacing, copy structure, accessibility, and responsive behavior. Research therefore confirms feasibility against the real code and surfaces the integration subtleties the planner must encode as discrete tasks — not exploring alternatives (there are none to explore; the stack is locked and trivial).

**Primary recommendation:** Three new RSC section files + one constants edit + two reconciliation edits (CtaFinal copy, Resultados placeholder removal) + page.tsx registration. No libraries, no carousel, no client islands beyond the already-`"use client"` `Reveal`/`CTAButton`. Validate via `npm run build && npm run lint && npm run typecheck` (no test runner exists in this project — see Validation Architecture).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Render Depoimentos / Comunidade / Planos sections | Frontend Server (RSC) | — | Static content from module constants; no interactivity → render on server, zero client JS. Matches all existing sections. |
| Entry animation (Reveal) | Browser / Client | Frontend Server | `Reveal` is a `"use client"` island that wraps server-rendered children. `"use client"` never rises to the section (DSGN-05). |
| CTA hover microinteraction | Browser / Client | — | Pure CSS `hover:scale-[1.04]` inside `CTAButton`; auto-respects reduced-motion via global `@media`. No JS. |
| WhatsApp deeplink (open chat with prefilled text) | Browser / Client | — | Plain `<a href="wa.me/...?text=...">`; the WhatsApp app/web handles it. No backend, no API. |
| Plan/testimonial/community content data | Database / Storage → here: source-of-truth constants | — | No DB in v1. Content lives as typed `ReadonlyArray` constants in `lib/site.ts`, versioned in git. Real values arrive via chat (D-06/D-19). |
| `publishable` editorial gate | Frontend Server (RSC) | — | A `.filter(t => t.publishable)` at render time in the RSC. Not build validation, not a comment (D-11). |

**Tier-correctness note for the planner:** Nothing in this phase belongs in an API route, a Server Action, or a client-side data fetch. Every CTA is an external `<a>` link. Misassigning any of this to `app/api/` or a `"use client"` section would be an error — the sections must stay RSC.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.6 | App Router, RSC, `next/image` | Already the project's framework `[VERIFIED: site/package.json]` |
| react / react-dom | 19.2.4 | Server Components | Project baseline `[VERIFIED: site/package.json]` |
| tailwindcss | ^4 (CSS-first `@theme`) | All styling via design tokens | Established in Fase 1; tokens in `globals.css` `[VERIFIED: site/package.json, site/app/globals.css]` |
| framer-motion | ^12.40.0 | Powers the existing `Reveal` island only | Reused as-is; no new motion code `[VERIFIED: site/package.json]` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | ^1.16.0 | Monochrome `currentColor` icons | **Optional** — UI-SPEC frames Comunidade benefits as textual (D-15). Use only if a minimal neutral icon per benefit is desired; not currently imported anywhere in the codebase `[VERIFIED: grep — no imports found]`. If used, this is its first appearance. |
| next/image | (bundled) | Real student photo in `TestimonialCard` | Only when a real P&B photo arrives; placeholder avatar needs no image. Precedent: `RamonPhoto.tsx`. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS `grid` for Depoimentos | A carousel lib (embla, swiper) | **Explicitly rejected (D-13).** Adds a dependency + client JS for 3 items; violates anti-spectacle tone. Do not introduce. |
| Module constants in `lib/site.ts` | CMS / MDX / JSON data files | Overkill for v1; breaks the established `STATS`/`TIMELINE`/`FAQS` co-location pattern. Real data arrives via chat (D-06). |
| `publishable` filter at render | Build-time validation / env gate | Rejected (D-11). The filter is simpler and auditable in one file. |

**Installation:**
```bash
# None. No packages are added in this phase.
```

**Version verification:** All versions above read directly from `site/package.json` `[VERIFIED: site/package.json]`. No registry lookups were needed because **no packages are installed** — the phase is additive frontend code on the existing stack.

## Package Legitimacy Audit

> **Not applicable.** This phase installs **zero external packages**. All code reuses dependencies already present and verified in `site/package.json`. slopcheck / registry verification is unnecessary because no new package name is introduced.

| Package | Disposition |
|---------|-------------|
| (none) | No installs in this phase |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```
                    git-versioned source of truth
                    ┌──────────────────────────────┐
                    │        lib/site.ts           │
                    │  WHATSAPP_URL (env-backed)   │
                    │  PLANS[]            (NEW)     │
                    │  TESTIMONIALS[]    (NEW)     │
                    │  COMMUNITY_BENEFITS[] (NEW)  │
                    │  COMMUNITY_WHATSAPP_URL (NEW)│
                    └───────────────┬──────────────┘
                                    │ import (server-side, build time)
        ┌───────────────┬──────────┼───────────┬──────────────────┐
        ▼               ▼          ▼           ▼                  ▼
  Depoimentos.tsx  Comunidade.tsx  Planos.tsx  CtaFinal.tsx   (Resultados.tsx
   (RSC, NEW)       (RSC, NEW)     (RSC, NEW)  (EDIT copy)     placeholder REMOVED)
        │               │          │           │
        │  .filter(     │          │           │
        │  publishable) │          │           │
        ▼               ▼          ▼           ▼
   wraps children in <Reveal> (client island)  and uses <CTAButton> (client island)
        │               │          │           │
        └───────────────┴────┬─────┴───────────┘
                             ▼
                     app/page.tsx (RSC)
              Hero → ParaQuemE → Metodo → Resultados → SobreRamon
                → Depoimentos → Comunidade → Planos → FAQ → CtaFinal
                             │
                             ▼
                  Rendered HTML (static, SSG)
                             │
              CTA <a href="wa.me/NUMBER?text=...">
                             ▼
                   WhatsApp app / web  (external — no backend)
```

File-to-responsibility mapping is in the Component Responsibilities below, not the diagram.

### Recommended Project Structure
```
site/
├── lib/
│   └── site.ts                       # EDIT: + PLANS, TESTIMONIALS, COMMUNITY_BENEFITS, COMMUNITY_WHATSAPP_URL
├── components/
│   └── sections/
│       ├── Depoimentos.tsx           # NEW (RSC)
│       ├── Comunidade.tsx            # NEW (RSC)
│       ├── Planos.tsx                # NEW (RSC)
│       ├── Resultados.tsx            # EDIT: remove dashed placeholder block (lines ~28–37)
│       └── CtaFinal.tsx              # EDIT: copy → emotional reinforcement (D-04)
└── app/
    └── page.tsx                      # EDIT: register 3 new sections in D-01 order
```
Optional subcomponents `TestimonialCard` / `PlanCard` may live inside their section files or as siblings in `components/sections/` (executor discretion per UI-SPEC §Component Inventory). No new directory is needed.

### Pattern 1: Section as RSC importing a module constant
**What:** A section is a plain async-free `export function` that maps over a `ReadonlyArray` constant from `lib/site.ts`, wrapping pieces in `<Reveal>`. No `"use client"`.
**When to use:** All three new sections.
**Example:**
```tsx
// Source: site/components/sections/Resultados.tsx (existing pattern, VERIFIED)
import { Reveal } from "@/components/Reveal";
import { STATS } from "@/lib/site";

export function Resultados() {
  return (
    <section className="border-t border-line px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="font-display text-4xl uppercase leading-tight sm:text-5xl">…</h2>
        </Reveal>
        <div className="mt-14 grid gap-px ... sm:grid-cols-3">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={0.08 * i}>…</Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Pattern 2: `publishable` editorial gate (D-11)
**What:** Filter the array before rendering so non-publishable (placeholder) testimonials never appear.
**When to use:** `Depoimentos.tsx` only.
**Example:**
```tsx
// TESTIMONIALS placeholders carry publishable: false and never render.
const visible = TESTIMONIALS.filter((t) => t.publishable);
// If visible.length === 0, render nothing inside the grid (no "em breve", no skeleton — UI-SPEC).
```

### Pattern 3: Intentional monochrome avatar placeholder (D-12)
**What:** When a testimonial has no `photo`, render a deliberate monochrome avatar (not a broken image), mirroring `RamonPhoto`'s `src`-absent branch.
**Example:**
```tsx
// Source pattern: site/components/RamonPhoto.tsx (VERIFIED — src-absent branch)
// Photo present → <Image className="grayscale contrast-125" .../>
// Photo absent → role="img" aria-label="..."; bg-surface border-line; initial/neutral mark; aria-hidden on the visual glyph.
```

### Anti-Patterns to Avoid
- **Adding `"use client"` to a section** — sections stay RSC; only `Reveal`/`CTAButton` are client (DSGN-05). The `RamonPhoto` JSDoc explicitly notes it is "server-friendly (sem 'use client')."
- **Hardcoding hex colors** — always tokens (`bg-bg`, `bg-surface`, `text-fg`, `text-muted`, `border-line`). Verified rule in CONVENTIONS.md and every existing section.
- **Re-using `WHATSAPP_URL` for the community CTA** — D-14/D-17 require a *separate* `COMMUNITY_WHATSAPP_URL` (invite link, not support number).
- **A generic plan CTA** — D-07 requires per-plan deeplinks with prefilled `?text=`.
- **Leaving the `Resultados.tsx` dashed placeholder** ("Depoimentos e transformações de alunos entram aqui") in place — it becomes a duplicate of the real Depoimentos section. See Pitfall 2.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Entry fade/slide animation | A new IntersectionObserver / motion hook | Existing `Reveal` | Already handles `once`, reduced-motion gate, viewport margin. Verified. |
| CTA button + hover + focus ring | A new `<a>`/`<button>` with bespoke classes | Existing `CTAButton` | Handles `target/rel`, focus-visible ring, reduced-motion-safe scale, primary/outline variants. Verified. |
| Reduced-motion handling | New `matchMedia` logic | Inherited via `Reveal` (`useReducedMotion`) + global `@media` in `globals.css` | Two-layer gate already exists; new sections inherit it for free. |
| Monochrome avatar fallback | A new placeholder component | Mirror `RamonPhoto` src-absent branch | Exact precedent for "intentional, not broken" monochrome slot. |
| Class concatenation | clsx / tailwind-merge | Existing `cn()` in `lib/utils.ts` | Intentional lightweight helper at current scale (documented). |
| Testimonials carousel | embla/swiper | CSS `grid` (D-13) | Rejected by decision; 3 static items need no JS carousel. |

**Key insight:** This phase is a composition exercise over an already-complete component kit. The risk is *re-inventing* (a second button, a second reveal, a hardcoded color), not *missing a library*.

## Common Pitfalls

### Pitfall 1: The `publishable` gate silently hides all testimonials
**What goes wrong:** All three seeded `TESTIMONIALS` are placeholders with `publishable: false` (correct per D-06/D-11), so the rendered Depoimentos grid is empty until real content arrives. A reviewer may read this as "the section is broken."
**Why it happens:** The editorial gate is working as designed — "sem nome real, não publica."
**How to avoid:** Plan an explicit, intentional empty state in the section: render the section heading but no cards, with no "em breve"/skeleton (UI-SPEC §Copywriting). Document in a code comment that an empty grid is the correct placeholder-era behavior. The planner should add a verification note that empty Depoimentos is expected until real names arrive.
**Warning signs:** A card rendering with literal text "PLACEHOLDER" or "Lorem ipsum" on the live page — that violates the contract (placeholders must not render).

### Pitfall 2: Duplicate "depoimentos" block left in `Resultados.tsx`
**What goes wrong:** `Resultados.tsx` lines ~28–37 contain a dashed-border placeholder: *"Depoimentos e transformações de alunos entram aqui."* Once the real `Depoimentos` section ships, this becomes a confusing duplicate teaser two sections earlier.
**Why it happens:** It was a Fase 1 forward-reference placeholder for content this phase now delivers.
**How to avoid:** The plan MUST include a task to remove that placeholder block from `Resultados.tsx` (keep the `STATS` grid; delete only the dashed `mt-px border-dashed` block and its `Reveal` wrapper + comment). This is the reconciliation D-03 implies ("ajusta o CtaFinal" is named; the Resultados cleanup is the unstated twin — flag it).
**Warning signs:** Two places on the page gesturing at testimonials.

### Pitfall 3: CtaFinal already has on-brand emotional copy — D-04 is a *reconciliation*, not a from-scratch rewrite
**What goes wrong:** A planner reading D-04 ("copy muda de 'escolha um plano' para mensagem de identidade") may assume the current CtaFinal says "escolha um plano." It does **not** — it already reads *"Consistência vence. Direção define."* with `CTAButton` "Quero minha direção" `[VERIFIED: site/components/sections/CtaFinal.tsx]`.
**Why it happens:** D-04 describes the *intent* relative to a generic CTA pattern; Fase 1 already implemented an emotional close.
**How to avoid:** Frame the CtaFinal task as: (a) confirm/refine the emotional-reinforcement copy so it is distinct from the new Planos card CTAs, and (b) ensure its CTA text differs from "Quero o Plano X." The UI-SPEC suggests reusing the brand thesis verb and an optional sign-off "O topo exige direção." The bulk of D-04 is *already satisfied* — avoid a gratuitous rewrite that loses the existing strong line.
**Warning signs:** A plan that deletes "Consistência vence. Direção define." without a clearly-better on-brand replacement.

### Pitfall 4: Three WhatsApp constants conflated into one
**What goes wrong:** Using `WHATSAPP_URL` for plan CTAs and the community CTA collapses three distinct intents (D-18) into one link, losing the per-plan prefilled text and the group-invite distinction.
**Why it happens:** They all point at "WhatsApp," so they feel interchangeable.
**How to avoid:** Implement exactly three (D-18): `WHATSAPP_URL` (untouched, env-backed support), `COMMUNITY_WHATSAPP_URL` (new placeholder invite link), and `whatsappUrl` per object inside `PLANS` (deeplink `wa.me/NUMBER?text=Quero+o+Plano+{Nome}`). Build the per-plan deeplink consistently with the existing `WHATSAPP_URL` pattern (`"https://wa.me/" + NUMBER + "?text=" + encodeURIComponent(...)`). Note: the plan deeplink's NUMBER should match the real `NEXT_PUBLIC_WHATSAPP_URL` number when it arrives (specifics §117) — until then, a shared placeholder NUMBER is fine.
**Warning signs:** Only one WhatsApp constant referenced across the three new sections.

### Pitfall 5: Build-breaking on placeholders (must NOT happen)
**What goes wrong:** A plan that requires a real WhatsApp number or real prices for `npm run build` to pass violates D-19 ("nenhuma env var nova é obrigatória para o build funcionar com placeholders").
**How to avoid:** All new constants ship with safe placeholder values. Prices render as an intentional label (`—` or "Sob consulta") rather than a raw `PLACEHOLDER` string on the page (UI-SPEC §Placeholders). The build, lint, and typecheck must all pass with placeholders in place — that is the phase's acceptance baseline.
**Warning signs:** Any task gated on "real number arrives."

### Pitfall 6: Stale hex values in CONVENTIONS.md vs. live tokens
**What goes wrong:** CONVENTIONS.md (dated 2026-05-31) lists `bg #000000`, `surface #0c0c0c`, `line #1f1f1f`. The **live** `globals.css` (reconciled 2026-06-01) and the UI-SPEC use `bg #0a0a0a`, `surface #141414`, `line #262626`.
**How to avoid:** Treat `site/app/globals.css` + `02-UI-SPEC.md` as the source of truth for token *values*. Since all code references token *names* (`bg-surface`, `border-line`), this discrepancy never reaches component code — but do not copy hex values from CONVENTIONS.md into anything.
**Warning signs:** A hardcoded hex appearing anywhere (already an anti-pattern).

## Runtime State Inventory

> This is an **additive greenfield-within-the-app** phase (new sections + new constants), not a rename/refactor/migration. A focused inventory was still performed because the phase touches a shared constants file and an existing section.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — no database, no datastore. Content is git-versioned constants in `lib/site.ts`. | None — verified: project has no DB layer (STRUCTURE.md, package.json). |
| Live service config | `NEXT_PUBLIC_WHATSAPP_URL` env var exists and is currently empty/placeholder. The real number arrives via chat (D-19). No service config stores the renamed strings. | None at build time. Real values are a content drop, not a migration. |
| OS-registered state | None — no cron/scheduler/process references the new constants. (Existing Vercel Cron is unrelated.) | None. |
| Secrets / env vars | `NEXT_PUBLIC_WHATSAPP_URL` (existing, optional). **No new env var is introduced** (D-17/D-19: `COMMUNITY_WHATSAPP_URL` is hardcoded placeholder, deferred as env). | None — confirm `.env.example` needs no edit this phase. |
| Build artifacts | None stale — new `.tsx` files compile fresh; editing `Resultados.tsx`/`CtaFinal.tsx` is ordinary source change. `.next/` regenerates on build. | None beyond a normal rebuild. |

**Reconciliation note (not "runtime state" but easy to miss):** the dashed placeholder in `Resultados.tsx` is *source-level* stale state that this phase's new Depoimentos section supersedes — see Pitfall 2. This is the only carry-over item requiring an explicit edit.

## Code Examples

### `PLANS` constant (D-08) — mirrors existing `STATS`/`TIMELINE` shape
```tsx
// Source pattern: site/lib/site.ts (existing STATS/TIMELINE — VERIFIED)
// NUMBER shares the real NEXT_PUBLIC_WHATSAPP_URL number when it arrives (specifics §117).
const WA_NUMBER = "0000000000"; // PLACEHOLDER até o número real chegar (D-06/D-19)

function planDeeplink(planName: string): string {
  return (
    "https://wa.me/" + WA_NUMBER + "?text=" +
    encodeURIComponent(`Quero o Plano ${planName}`)
  ); // deeplink personalizado (D-07)
}

export const PLANS: ReadonlyArray<{
  name: string;
  price: string;       // "Sob consulta" / "—" até o valor real chegar (UI-SPEC)
  includes: ReadonlyArray<string>;
  whatsappUrl: string;
}> = [
  // PLACEHOLDER: nomes/preços/inclusos reais chegam via chat (D-06).
  { name: "PLACEHOLDER A", price: "Sob consulta", includes: ["PLACEHOLDER"], whatsappUrl: planDeeplink("A") },
  { name: "PLACEHOLDER B", price: "Sob consulta", includes: ["PLACEHOLDER"], whatsappUrl: planDeeplink("B") },
];
```

### `TESTIMONIALS` + `publishable` gate (D-11)
```tsx
// Source pattern: site/lib/site.ts constants (VERIFIED)
export const TESTIMONIALS: ReadonlyArray<{
  name: string;
  context: string;   // "Onde você estava"
  change: string;    // "O que mudou"
  result: string;    // "Onde chegou"
  photo?: string;    // P&B opcional (D-12)
  publishable: boolean;
}> = [
  // 3 placeholders, todos publishable:false → não renderizam (D-11). Trocar por nomes reais via chat.
  { name: "PLACEHOLDER", context: "", change: "", result: "", publishable: false },
  { name: "PLACEHOLDER", context: "", change: "", result: "", publishable: false },
  { name: "PLACEHOLDER", context: "", change: "", result: "", publishable: false },
];
// In Depoimentos.tsx: TESTIMONIALS.filter((t) => t.publishable)
```

### Community constants (D-16/D-17)
```tsx
// Separado de WHATSAPP_URL — link de convite do grupo de alunos (D-14/D-17).
export const COMMUNITY_WHATSAPP_URL =
  "https://chat.whatsapp.com/PLACEHOLDER"; // grupo exclusivo de alunos; link real via chat

export const COMMUNITY_BENEFITS: ReadonlyArray<string> = [
  // 3–4 benefícios enquadrando a comunidade como parte do método + exclusividade (D-15). PLACEHOLDER.
  "PLACEHOLDER — não estar sozinho no processo",
  "PLACEHOLDER — acesso exclusivo de alunos",
  "PLACEHOLDER — ambiente que puxa pra cima",
];
```

### Plan card tonal distinction (D-09) — tokens only, no color
```tsx
// "base" card on bg-bg, "elevado" card on bg-surface — distinction is tonal, never chromatic (UI-SPEC §Color).
// flex flex-col + mt-auto pins the CTA to the card base for equal-height grid (UI-SPEC §Responsive).
<div className="flex h-full flex-col border border-line bg-surface p-8">
  {/* nome (H3 Montserrat 600 uppercase tracking-wider) → preço (Anton text-5xl sm:text-6xl) → inclusos <ul> → CTAButton mt-auto */}
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `pages/` Router | App Router + RSC (sections are server components) | Already adopted in Fase 1 | New sections must be RSC; client islands isolated. |
| Tailwind config JS file | Tailwind 4 CSS-first `@theme` in `globals.css` | Already adopted | No `tailwind.config.*` to touch; tokens are in CSS. No token changes this phase. |

**Deprecated/outdated:**
- CONVENTIONS.md token hex values (2026-05-31) are superseded by the 2026-06-01 reconciliation in `globals.css` — see Pitfall 6. Use token names, never the stale hex.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Removing the dashed placeholder block in `Resultados.tsx` is in-scope reconciliation for this phase | Pitfall 2 | Low — if the user wants it kept, it is a one-line revert; flag in plan for confirmation. |
| A2 | Plan deeplink NUMBER will equal the real `NEXT_PUBLIC_WHATSAPP_URL` number (per specifics §117) | Code Examples, Pitfall 4 | Low — if plans use a different number, change one constant. Placeholder works either way. |
| A3 | Lucide icons are optional and likely unused (benefits are textual per D-15) | Standard Stack | Low — purely additive cosmetic choice; no functional dependency. |
| A4 | Community group link format is `chat.whatsapp.com/...` (standard WhatsApp group invite) | Code Examples | Low — placeholder; real link replaces it verbatim via chat. |

## Open Questions

1. **Should the `Resultados.tsx` dashed placeholder be removed in this phase?**
   - What we know: It teases testimonials that the new Depoimentos section now delivers (Pitfall 2). D-03 says existing sections don't change *position*; D-04 explicitly allows editing CtaFinal copy.
   - What's unclear: Whether "não redesenha seções existentes" (CONTEXT §domain) forbids the small cleanup edit to Resultados.
   - Recommendation: Include it as an explicit, minimal reconciliation task (delete the dashed block only). It is a deletion, not a redesign. The planner should surface it for user confirmation if discuss-phase didn't.

2. **Empty Depoimentos during placeholder era — heading visible or whole section hidden?**
   - What we know: UI-SPEC says no card / no skeleton when nothing is publishable.
   - What's unclear: Whether the section heading should still render with an empty grid, or the whole `<section>` is suppressed until ≥1 publishable testimonial exists.
   - Recommendation: Render the heading + empty grid (keeps page rhythm and lets real content drop in trivially). Confirm with user; both are one-line conditionals.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| node + npm | build/lint/typecheck | ✓ (project runs in Fase 1) | per project | — |
| next | RSC sections, `next/image` | ✓ | 16.2.6 | — |
| WhatsApp number (real) | live CTAs at runtime | ✗ (placeholder) | — | Placeholder `wa.me/0000000000`; build unaffected (D-19) |

**Missing dependencies with no fallback:** None — the phase builds and ships with placeholders.
**Missing dependencies with fallback:** Real WhatsApp number / group link / plan data — fallback is intentional placeholders; real values are a content drop, not a code dependency.

## Validation Architecture

> `workflow.nyquist_validation: true` in config. **Important:** this project has **no test runner** — no jest/vitest/playwright, no `test` script in `package.json` `[VERIFIED: grep + package.json]`. Validation is build/lint/type-based, appropriate for static RSC content with no logic branches beyond a `.filter`.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | none installed |
| Config file | none |
| Quick run command | `cd site && npm run typecheck && npm run lint` |
| Full suite command | `cd site && npm run build` (compiles + typechecks all routes; the real gate for RSC correctness) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CONV-01 | Planos section renders 2 cards, prices, per-plan CTA; build green | build/manual | `cd site && npm run build` + visual check | ✅ build infra exists |
| CONV-02 | Depoimentos filters `publishable`; no placeholder text on page | type+manual | `npm run typecheck` + visual check (empty grid expected) | ✅ |
| CONV-03 | Comunidade renders 3–4 benefits + group CTA → `COMMUNITY_WHATSAPP_URL` | build/manual | `npm run build` + link-target check | ✅ |
| CONF-01 | Three distinct WhatsApp constants; build passes with placeholders | type+manual | `npm run typecheck` + grep for 3 constants | ✅ |

### Sampling Rate
- **Per task commit:** `cd site && npm run typecheck` (fast)
- **Per wave merge:** `cd site && npm run lint && npm run build`
- **Phase gate:** `npm run build` green + manual visual pass of the 5 affected sections before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] No automated test files exist or are required — static content + a single `.filter` does not warrant introducing a test runner in this phase. If a regression test for the `publishable` filter is desired later, that is a separate, optional decision (note for planner; do **not** scaffold a test framework here without explicit user request).
- [ ] Manual visual verification checklist is the substantive acceptance gate: section order (D-01), monochrome compliance, focus rings, reduced-motion, mobile stacking.

*(No framework install recommended — introducing vitest/playwright for this phase would be scope creep against the project's established build-as-gate convention.)*

## Security Domain

> `security_enforcement` is not set in config (absent = enabled). Assessed below; this phase has a **minimal** security surface — static content, external links, no input, no auth, no data persistence.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth in these sections (public landing). |
| V3 Session Management | no | No sessions. |
| V4 Access Control | no | All content public. |
| V5 Input Validation | no | **No user input** — no forms, no query params consumed. CTAs are outbound links only. |
| V6 Cryptography | no | No secrets handled in this phase; WhatsApp number is public by design. |
| V12/V14 (links/build) | yes | External-link hardening: `rel="noopener noreferrer"` on all `wa.me`/invite links (already enforced by `CTAButton`). |

### Known Threat Patterns for static RSC + external links

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Reverse tabnabbing via `target="_blank"` | Tampering | `rel="noopener noreferrer"` — already in `CTAButton` `[VERIFIED: site/components/ui/CTAButton.tsx]`. Any raw `<a target="_blank">` (e.g., community CTA) must include it too. |
| Unsanitized deeplink text injection | Tampering | `encodeURIComponent()` on the `?text=` payload (matches existing `WHATSAPP_URL` pattern). |
| Placeholder leaking to production | Information disclosure (minor) | Render intentional labels, never raw `PLACEHOLDER`/`Lorem` on the page (UI-SPEC). |

**Security bottom line:** No new attack surface beyond outbound WhatsApp links. The single control to verify is `rel="noopener noreferrer"` on every external link — guaranteed if every CTA uses `CTAButton`; flag any hand-rolled `<a>`.

## Sources

### Primary (HIGH confidence)
- `site/package.json` — exact dependency versions (next 16.2.6, react 19.2.4, tailwind ^4, framer-motion ^12.40.0, lucide-react ^1.16.0)
- `site/lib/site.ts` — existing constant patterns (`WHATSAPP_URL`, `STATS`, `TIMELINE`)
- `site/components/sections/{Resultados,SobreRamon,CtaFinal}.tsx` — RSC section + Reveal + map patterns; CtaFinal current copy
- `site/components/{Reveal,RamonPhoto}.tsx`, `site/components/ui/CTAButton.tsx` — reusable components, placeholder/avatar precedent, focus/rel hardening
- `site/app/page.tsx` — section registration point and order
- `site/app/globals.css` — live design tokens (reconciled 2026-06-01)
- `.planning/phases/02-convers-o-completa/02-UI-SPEC.md` — approved visual/interaction contract
- `.planning/phases/02-convers-o-completa/02-CONTEXT.md` — locked decisions D-01…D-19
- `.planning/REQUIREMENTS.md` — CONV-01/02/03, CONF-01 acceptance + Out of Scope law
- `.planning/codebase/{STRUCTURE,CONVENTIONS}.md` — code placement + conventions (note stale token hex)

### Secondary (MEDIUM confidence)
- grep verification: `lucide-react` not currently imported; no test runner / test scripts present

### Tertiary (LOW confidence)
- None — all findings verified against live code or the approved UI-SPEC/CONTEXT.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — read directly from package.json; no installs needed.
- Architecture: HIGH — three existing sections demonstrate the exact pattern; UI-SPEC is approved and detailed.
- Pitfalls: HIGH — each pitfall is grounded in a specific verified file (Resultados placeholder, CtaFinal copy, token drift, three-WhatsApp split).

**Research date:** 2026-06-01
**Valid until:** 2026-07-01 (stable — additive frontend work on a fixed stack; no fast-moving dependencies)
