# Phase 2: Conversão Completa - Pattern Map

**Mapped:** 2026-06-01
**Files analyzed:** 6 (3 new sections, 3 edited files)
**Analogs found:** 6 / 6 (every file has an exact in-repo analog)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `site/components/sections/Depoimentos.tsx` (NEW) | component (RSC section) | transform (filter + map over constant) | `site/components/sections/SobreRamon.tsx` | exact |
| `site/components/sections/Comunidade.tsx` (NEW) | component (RSC section) | transform (map over constant) | `site/components/sections/CtaFinal.tsx` + `Resultados.tsx` | exact |
| `site/components/sections/Planos.tsx` (NEW) | component (RSC section) | transform (map over constant) | `site/components/sections/Resultados.tsx` | exact |
| `site/lib/site.ts` (EDIT) | config (source-of-truth constants) | static data | `site/lib/site.ts` (existing `STATS`/`TIMELINE`/`WHATSAPP_URL`) | exact (self) |
| `site/components/sections/CtaFinal.tsx` (EDIT) | component (RSC section) | request-response (copy edit) | `site/components/sections/CtaFinal.tsx` (self) | exact (self) |
| `site/components/sections/Resultados.tsx` (EDIT) | component (RSC section) | transform (remove placeholder block) | `site/components/sections/Resultados.tsx` (self) | exact (self) |
| `site/app/page.tsx` (EDIT) | route (section registration) | request-response | `site/app/page.tsx` (self) | exact (self) |

Optional subcomponents `TestimonialCard` / `PlanCard` (executor discretion) inherit the same RSC + token patterns as their parent sections — no separate analog needed.

## Pattern Assignments

### `site/components/sections/Depoimentos.tsx` (RSC section, transform)

**Analog:** `site/components/sections/SobreRamon.tsx` (grid + map + `RamonPhoto` placeholder precedent) and `Resultados.tsx` (grid-of-cards layout).

**Imports pattern** (mirror `SobreRamon.tsx` lines 1-3 — no `"use client"`):
```tsx
import { Reveal } from "@/components/Reveal";
import { TESTIMONIALS } from "@/lib/site";
// next/image only if a real photo arrives; placeholder avatar needs no image.
```

**`publishable` gate** (D-11 — filter before render, never a build check):
```tsx
const visible = TESTIMONIALS.filter((t) => t.publishable);
// During the placeholder era all are publishable:false → visible.length === 0 → empty grid.
// Render heading + empty grid; NO "em breve", NO skeleton (UI-SPEC §Copywriting, Pitfall 1).
```

**Grid + map pattern** (from `Resultados.tsx` lines 15-26 — 3-col desktop / stacked mobile, D-13):
```tsx
<div className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
  {visible.map((t, i) => (
    <Reveal key={t.name} delay={0.08 * i}>
      <div className="h-full bg-bg p-8">…context → change → result…</div>
    </Reveal>
  ))}
</div>
```

**Monochrome avatar placeholder** (D-12 — copy the `src`-absent branch of `RamonPhoto.tsx` lines 53-68; deliberate, not broken):
```tsx
// Photo absent → role="img" aria-label={t.name}; bg-surface border-line;
//   neutral glyph with aria-hidden; never a broken <img>.
<div
  role="img"
  aria-label={t.name}
  className="flex items-center justify-center overflow-hidden border border-line bg-surface"
>
  <span aria-hidden="true" className="font-display uppercase tracking-widest text-muted">…</span>
</div>
// Photo present → <Image className="object-cover grayscale contrast-125" /> (RamonPhoto lines 30-41).
```

**Section shell** (every section uses this exact frame — `Resultados.tsx` line 7, `SobreRamon.tsx` line 7):
```tsx
<section className="border-t border-line px-6 py-24 sm:py-32">
  <div className="mx-auto max-w-6xl">
    <Reveal><h2 className="font-display text-4xl uppercase leading-tight sm:text-5xl">…</h2></Reveal>
    …
  </div>
</section>
```

---

### `site/components/sections/Comunidade.tsx` (RSC section, transform)

**Analog:** `site/components/sections/CtaFinal.tsx` (centered `max-w-4xl` block + single CTA) for the shell, `SobreRamon.tsx` benefit-list map for the benefits.

**Imports pattern** (mirror `CtaFinal.tsx` lines 1-3 — separate community URL, NOT `WHATSAPP_URL`):
```tsx
import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/ui/CTAButton";
import { COMMUNITY_BENEFITS, COMMUNITY_WHATSAPP_URL } from "@/lib/site";
```

**Centered block shell** (from `CtaFinal.tsx` lines 7-8 — `max-w-4xl text-center`):
```tsx
<section className="border-t border-line px-6 py-24 sm:py-32">
  <div className="mx-auto max-w-4xl text-center">…</div>
</section>
```

**Benefits map** (3-4 textual benefits, D-15; map pattern from `SobreRamon.tsx` lines 37-46, staggered `delay={0.06 * i}`):
```tsx
{COMMUNITY_BENEFITS.map((b, i) => (
  <Reveal key={b} delay={0.06 * i}>
    <p className="font-body text-muted">{b}</p>
  </Reveal>
))}
```

**CTA to the group** (D-14/D-17 — `COMMUNITY_WHATSAPP_URL`, NOT the support number; reuse `CTAButton`):
```tsx
<Reveal delay={0.16}>
  <div className="mt-10 flex justify-center">
    <CTAButton href={COMMUNITY_WHATSAPP_URL}>…copy de exclusividade…</CTAButton>
  </div>
</Reveal>
```

---

### `site/components/sections/Planos.tsx` (RSC section, transform)

**Analog:** `site/components/sections/Resultados.tsx` (heading + map-over-constant grid of cards).

**Imports pattern** (mirror `Resultados.tsx` lines 1-3 + add `CTAButton`):
```tsx
import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/ui/CTAButton";
import { PLANS } from "@/lib/site";
```

**2-card grid** (D-05 — 2 cards; from `Resultados.tsx` line 15 grid, but `sm:grid-cols-2`):
```tsx
<div className="mt-14 grid gap-8 sm:grid-cols-2">
  {PLANS.map((p, i) => (
    <Reveal key={p.name} delay={0.08 * i}>…card…</Reveal>
  ))}
</div>
```

**Card with pinned CTA** (D-09 tonal distinction `bg-surface` vs `bg-bg`, NO "popular" badge; per-plan deeplink via `p.whatsappUrl`):
```tsx
// "base" card on bg-bg, "elevado" card on bg-surface — distinction is tonal, never chromatic.
// flex flex-col + mt-auto pins the CTA to the card base for equal-height cards.
<div className="flex h-full flex-col border border-line bg-surface p-8">
  {/* nome (H3) → preço (font-display text-5xl) → inclusos <ul> → CTAButton mt-auto */}
  <CTAButton href={p.whatsappUrl} className="mt-auto">…</CTAButton>
</div>
```

**Price rendering** (Pitfall 5 — never raw `PLACEHOLDER` on the page; intentional label):
```tsx
// p.price already carries "Sob consulta" / "—" as the placeholder-era label (set in lib/site.ts).
<p className="font-display text-5xl uppercase leading-none sm:text-6xl">{p.price}</p>
```

---

### `site/lib/site.ts` (EDIT — add 3 constants)

**Analog:** the file's own existing `WHATSAPP_URL` (env + `encodeURIComponent`), `STATS`, `TIMELINE` (`ReadonlyArray<T>` of object literals).

**Existing patterns to mirror** (lines 8-31):
- `WHATSAPP_URL` (lines 8-11): `process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://wa.me/0000000000?text=" + encodeURIComponent(...)` — the deeplink-builder template for per-plan URLs.
- `STATS` / `TIMELINE` (lines 14-31): `export const X: ReadonlyArray<{...}> = [...]` with an inline `// PLACEHOLDER`-style comment — the template for `PLANS` / `TESTIMONIALS` / `COMMUNITY_BENEFITS`.

**`PLANS`** (D-07/D-08 — per-plan deeplink builder reusing the `WHATSAPP_URL` shape):
```tsx
const WA_NUMBER = "0000000000"; // PLACEHOLDER até o número real chegar (D-06/D-19)
function planDeeplink(planName: string): string {
  return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(`Quero o Plano ${planName}`);
}
export const PLANS: ReadonlyArray<{
  name: string; price: string; includes: ReadonlyArray<string>; whatsappUrl: string;
}> = [
  { name: "PLACEHOLDER A", price: "Sob consulta", includes: ["PLACEHOLDER"], whatsappUrl: planDeeplink("A") },
  { name: "PLACEHOLDER B", price: "Sob consulta", includes: ["PLACEHOLDER"], whatsappUrl: planDeeplink("B") },
];
```

**`TESTIMONIALS`** (D-11/D-12 — `publishable` gate field, optional `photo`):
```tsx
export const TESTIMONIALS: ReadonlyArray<{
  name: string; context: string; change: string; result: string;
  photo?: string; publishable: boolean;
}> = [
  { name: "PLACEHOLDER", context: "", change: "", result: "", publishable: false },
  { name: "PLACEHOLDER", context: "", change: "", result: "", publishable: false },
  { name: "PLACEHOLDER", context: "", change: "", result: "", publishable: false },
];
```

**Community constants** (D-16/D-17 — separate from `WHATSAPP_URL`):
```tsx
export const COMMUNITY_WHATSAPP_URL = "https://chat.whatsapp.com/PLACEHOLDER"; // grupo exclusivo de alunos
export const COMMUNITY_BENEFITS: ReadonlyArray<string> = [
  "PLACEHOLDER — …", "PLACEHOLDER — …", "PLACEHOLDER — …",
];
```

---

### `site/components/sections/CtaFinal.tsx` (EDIT — copy reconciliation, D-04)

**Analog:** itself. **This is NOT a from-scratch rewrite** (Pitfall 3). The file already reads the on-brand close *"Consistência vence. Direção define."* (line 12) with CTA *"Quero minha direção"* (line 24).

**Task scope:**
- Confirm/refine the emotional-reinforcement copy so it stays distinct from the new Planos card CTAs.
- Ensure the CTA text differs from "Quero o Plano X" (it already does: "Quero minha direção").
- Do NOT delete the existing strong line without a clearly-better on-brand replacement.
- Structure (lines 5-29) stays: `<section border-t border-line px-6 py-28 md:py-40>` → `max-w-4xl text-center` → `Reveal` H2 → `Reveal` subcopy → `Reveal` `CTAButton`. CTA `href={WHATSAPP_URL}` stays (support number, not a plan deeplink).

---

### `site/components/sections/Resultados.tsx` (EDIT — remove stale placeholder, Pitfall 2)

**Analog:** itself.

**Task scope:** delete ONLY the dashed placeholder block at lines 28-36 (the `// PLACEHOLDER: depoimentos…` comment + its `<Reveal delay={0.1}>` wrapper with `border-dashed`). The real Depoimentos section supersedes it; leaving it creates a duplicate testimonials teaser two sections earlier.
- KEEP the `STATS` grid (lines 15-26) and everything above it untouched.
- This is a deletion, not a redesign (consistent with D-03). Flag for user confirmation (Open Question 1).

---

### `site/app/page.tsx` (EDIT — register 3 sections, D-01)

**Analog:** itself.

**Task scope:**
- Add imports for `Depoimentos`, `Comunidade`, `Planos` (mirror existing import block lines 1-7).
- Insert in `<main>` (lines 25-33) in D-01 order: after `<SobreRamon />`, before `<FAQ />`:
  `Hero → ParaQuemE → Metodo → Resultados → SobreRamon → Depoimentos → Comunidade → Planos → FAQ → CtaFinal`

## Shared Patterns

### Entry animation
**Source:** `site/components/Reveal.tsx`
**Apply to:** all three new sections (wrap headings, cards, list items).
```tsx
<Reveal delay={0.08 * i}>{children}</Reveal>
// Handles once-only viewport trigger + reduced-motion gate (returns static div). Stagger via delay.
```

### CTA button (focus ring + external-link hardening)
**Source:** `site/components/ui/CTAButton.tsx`
**Apply to:** Planos cards (per-plan deeplink) and Comunidade (group invite).
```tsx
<CTAButton href={url} variant="primary|outline">…</CTAButton>
// Already includes target="_blank" + rel="noopener noreferrer" (Security control) +
// focus-visible ring + reduced-motion-safe hover:scale-[1.04]. Never hand-roll a raw <a>.
```

### Section shell + monochrome tokens
**Source:** every existing section (`Resultados.tsx` line 7, `CtaFinal.tsx` line 7, `SobreRamon.tsx` line 7)
**Apply to:** all three new sections.
```tsx
<section className="border-t border-line px-6 py-24 sm:py-32">
  <div className="mx-auto max-w-6xl">  {/* or max-w-4xl for centered Comunidade */}
// Tokens ONLY — never hex. Live values from globals.css/UI-SPEC, NOT CONVENTIONS.md (Pitfall 6):
//   bg-bg, bg-surface, text-fg, text-muted, border-line, font-display, font-body.
// Heading: font-display text-4xl uppercase leading-tight sm:text-5xl.
```

### Monochrome placeholder slot
**Source:** `site/components/RamonPhoto.tsx` lines 53-68 (`src`-absent branch)
**Apply to:** testimonial avatar when `photo` is absent (D-12).
```tsx
// role="img" + aria-label; bg-surface border-line; aria-hidden glyph. Deliberate, never broken.
```

### Module constant (source of truth)
**Source:** `site/lib/site.ts` `STATS` / `TIMELINE` / `WHATSAPP_URL`
**Apply to:** `PLANS`, `TESTIMONIALS`, `COMMUNITY_BENEFITS`, `COMMUNITY_WHATSAPP_URL`.
```tsx
export const X: ReadonlyArray<{…}> = [ /* PLACEHOLDER comment + literals */ ];
// Deeplink builder reuses WHATSAPP_URL shape: "https://wa.me/" + N + "?text=" + encodeURIComponent(...)
```

## No Analog Found

None. Every file in this phase maps to an exact in-repo analog. This is a pure-additive composition phase over the complete Fase 1 component kit.

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| (none) | — | — | All patterns exist in the codebase |

## Metadata

**Analog search scope:** `site/components/sections/`, `site/components/`, `site/components/ui/`, `site/lib/`, `site/app/`
**Files scanned:** 9 (site.ts, Resultados, CtaFinal, SobreRamon, FAQ, RamonPhoto, CTAButton, Reveal, page.tsx)
**Pattern extraction date:** 2026-06-01
