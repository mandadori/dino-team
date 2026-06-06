# Phase 1: Landing Editorial + Fundação - Pattern Map

**Mapped:** 2026-06-01
**Files analyzed:** 16 (5 new, 11 modified)
**Analogs found:** 14 / 16

> All paths are relative to `site/` unless absolute. Excerpts are the concrete code to copy/adapt — not abstractions. Tokens, copy, and typography ceiling must be reconciled against `01-UI-SPEC.md` (RESEARCH §Runtime State Inventory flags three discrepancies the planner MUST treat as explicit tasks).

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `lib/usePrefersReducedMotion.ts` | hook | event-driven (matchMedia) | `components/AnimatedCounter.tsx` (useEffect+browser API) | role-match |
| `components/motion/ScrollReveal.tsx` | motion island | event-driven (scroll) | `components/Reveal.tsx` | exact (replaces it) |
| `components/motion/ParallaxImage.tsx` | motion island | event-driven (scroll) | `components/Reveal.tsx` (island skeleton) | role-match |
| `components/motion/CtaMicroFx.tsx` (or inline in CTAButton) | motion island | event-driven (hover) | `components/AnimatedCounter.tsx` (rAF island) | partial |
| `components/RamonPhoto.tsx` | component (presentational) | request-response (build-time image) | Hero/SobreRamon placeholder blocks | no-analog (next/image new) |
| `app/globals.css` | config (tokens) | transform (build CSS) | itself (`@theme` block) | exact (extend in place) |
| `components/Reveal.tsx` | motion island | event-driven (in-view) | itself (add reduced-motion gate) | exact |
| `components/AnimatedCounter.tsx` | motion island | event-driven (rAF) | itself (add reduced-motion gate) | exact |
| `components/ui/CTAButton.tsx` | ui component | event-driven (hover/focus) | itself (add hover scale + focus ring) | exact |
| `components/sections/Hero.tsx` | section (RSC) | request-response | SobreRamon (photo slot pattern) | exact |
| `components/sections/SobreRamon.tsx` | section (RSC) | request-response | Hero (photo slot pattern) | exact |
| `components/sections/Resultados.tsx` | section (RSC) | request-response | Metodo (grid pattern) | exact |
| `components/sections/Metodo.tsx` | section (RSC) | request-response | ParaQuemE (grid pattern) | exact |
| `components/sections/ParaQuemE.tsx` | section (RSC) | request-response | Metodo | exact |
| `components/sections/FAQ.tsx` | section (client) | event-driven (accordion) | itself (Framer accordion) | exact |
| `components/sections/CtaFinal.tsx` | section (RSC) | request-response | Hero (CTA + Reveal) | exact |

> `lib/site.ts` (copy/constants) and `package.json` (add `@gsap/react`) are also modified — see Shared Patterns and Wave 0 note.

## Pattern Assignments

### `lib/usePrefersReducedMotion.ts` (hook, NEW) — DSGN-03

**Analog:** `components/AnimatedCounter.tsx` (lines 1-3, 24-36) — the only existing example of `useEffect` + a browser API + cleanup in this codebase. Copy the `"use client"` + `useEffect` + cleanup shape; swap the rAF body for a `matchMedia` listener.

**Authoritative implementation:** `01-RESEARCH.md` §Code Examples (lines 332-348). Use that verbatim. It establishes:
- `"use client"` at top (matchMedia is browser-only).
- subscribe in `useEffect`, `mq.addEventListener("change", ...)`, return cleanup `removeEventListener`.
- returns `boolean`.

This hook is the centralization point (DSGN-03, RESEARCH §Don't Hand-Roll). `AnimatedCounter` and any anime.js guard consume it instead of each re-querying `matchMedia`.

---

### `components/motion/ScrollReveal.tsx` (motion island, NEW) — DSGN-04/DSGN-03

**Analog:** `components/Reveal.tsx` (full file) — same contract (`{ children, delay?, className? }`, in-view entrance, animate once). If the planner migrates per D-10, ScrollReveal **replaces** Reveal's role with GSAP; the prop signature must stay identical so the 7 sections swap import lines only.

**Island boundary pattern to copy** (`Reveal.tsx` lines 1-3) — `"use client"` lives in the leaf, never the section:
```tsx
"use client";
import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
```

**Authoritative GSAP implementation:** `01-RESEARCH.md` §Pattern 1 (lines 202-227). Copy that verbatim — `gsap.registerPlugin(ScrollTrigger, useGSAP)`, `useGSAP(() => {...}, { scope })`, and the critical reduced-motion gate via `gsap.matchMedia("(prefers-reduced-motion: no-preference)")` so the timeline is **never created** under reduce (not merely accelerated).

**Entrance values to preserve** (from `Reveal.tsx` lines 6-9, 30): `opacity 0→1`, `y: 24→0`, `duration 0.6`, ease `power3.out` (GSAP equivalent of the existing `[0.22, 1, 0.36, 1]`), `once: true`.

> **Planner decision (D-10):** RESEARCH Open Question 3 recommends KEEPING `Reveal.tsx` in Framer (already bundled, trivial gate) and using GSAP only for parallax. If kept, `ScrollReveal.tsx` may not be created — apply the reduced-motion gate to `Reveal.tsx` instead (see below).

---

### `components/motion/ParallaxImage.tsx` (motion island, NEW) — D-08

**Analog:** `components/Reveal.tsx` (lines 1-3, 24-36) for the island skeleton (`"use client"` leaf wrapping `children`/image, scope ref).

**Authoritative pattern:** `01-RESEARCH.md` §Pattern 1 (GSAP `useGSAP` + `gsap.matchMedia`) — same shape as ScrollReveal but the tween is a **leve** vertical `translateY` driven by `scrollTrigger: { scrub: ... }`. **Constraint (D-08):** parallax only, **no pin, no rich scrub choreography**. Animate `transform` only (RESEARCH Pitfall 6 — never height/layout → CLS). Reduced-motion gate identical to ScrollReveal: photo stays static.

Mobile: degrade to light or off (UI-SPEC §Responsive, line 140) — must not cause jank/CLS.

---

### `components/motion/CtaMicroFx.tsx` OR inline in `CTAButton.tsx` (motion island, NEW/MODIFIED) — D-09

**Analog:** `components/AnimatedCounter.tsx` (lines 1-3) for the `"use client"` + rAF island shape; `components/ui/CTAButton.tsx` (the target component).

**Authoritative pattern:** `01-RESEARCH.md` §Code Examples (lines 373-381) — anime.js v4 named import `import { animate } from "animejs"` + `matchMedia('(prefers-reduced-motion: reduce)').matches` guard before `animate()`. Target: `scale 1.04, duration 200, ease "outQuad"` (UI-SPEC line 90, 109).

> **Planner decision (RESEARCH A2, line 382):** CSS `transition-transform` + `hover:scale-[1.04]` on `CTAButton` is cheaper and auto-respects reduced-motion via the global `@media` block (globals.css lines 44-53). D-09 asks for anime.js; CSS satisfies "microinteração mínima". Planner picks one. If CSS, no new island file is needed — extend `CTAButton.tsx` className (lines 31-35) directly.

---

### `components/RamonPhoto.tsx` (presentational component, NEW) — RDSN-02 / D-04/D-05/D-06/D-07

**Analog:** No `next/image` exists anywhere in the codebase (no-analog for the image part). Closest structural analogs are the existing **placeholder slots**:
- Hero background block: `components/sections/Hero.tsx` lines 8-20 (`aria-hidden` gradient + `DINO` watermark).
- SobreRamon portrait slot: `components/sections/SobreRamon.tsx` lines 9-22 (`role="img"` + `aria-label` + `aspect-[4/5]` + gradient + watermark).

**Authoritative implementation:** `01-RESEARCH.md` §Pattern 2 (lines 234-247) for `next/image fill priority sizes="100vw" className="object-cover grayscale contrast-125"` + scrim overlay; §Pattern 3 (lines 250-253) for the trivially-swappable placeholder (prop `src?: string` — if absent, render intentional monochrome placeholder, NOT colored gradient).

**Token usage:** scrim must use `--scrim-hero` / `--scrim-portrait` (UI-SPEC lines 41-46), not inline hex — RESEARCH Anti-Pattern "Hex hardcoded em componente". Asset folder convention: `public/ramon/` (`hero.jpg`, `retrato.jpg`) — D-07 / RESEARCH §Project Structure. Folder does not yet exist (verified `ls public` → only default SVGs); create it.

**Accessibility:** `alt` descriptive on-brand (e.g. "Ramon Dino em preto e branco, alto contraste"); placeholder/overlay `aria-hidden="true"` (matches existing Hero pattern). `priority` on Hero LCP, `loading="lazy"` elsewhere (UI-SPEC lines 130, 128).

---

### `components/Reveal.tsx` (MODIFIED) — DSGN-03 gate

**Self-analog.** Current file (lines 1-36) has NO reduced-motion gate (line 13 comment claims "via CSS global" — insufficient per Pitfall 3).

**Patch pattern:** `01-RESEARCH.md` §Code Examples (lines 352-360) — add `useReducedMotion()` from framer-motion; if `reduce`, early-return `<div className={className}>{children}</div>` (static and complete), else the existing `motion.div`. Preserve existing variants/transition (lines 6-9, 30).

---

### `components/AnimatedCounter.tsx` (MODIFIED) — DSGN-03 gate

**Self-analog.** Current rAF loop (lines 24-36) always fires.

**Patch pattern:** `01-RESEARCH.md` §Code Examples (lines 363-370) — consume `usePrefersReducedMotion()`; inside the `useEffect`, `if (reduce) { setValue(to); return; }` BEFORE the rAF tick. Add `reduce` to the dependency array. Renders final value statically under reduce.

---

### `components/ui/CTAButton.tsx` (MODIFIED) — DSGN focus ring + D-09 hover

**Self-analog.** Current file (lines 21-39) has `transition-colors` and `hover:bg-muted`/`hover:bg-neutral-200`-style but **no hover scale and no explicit focus-visible ring on the element** (only the global `:focus-visible` in globals.css lines 38-41).

**Patch:** add hover scale (`hover:scale-[1.04]` CSS or anime.js per D-09) to the className concat (lines 31-35); add monochromatic `focus-visible:` ring contextual to background (white ring on dark, dark ring on white blocks) — UI-SPEC lines 90, 126. Keep `cn()` merge pattern (line 2, 31). NOTE: UI-SPEC §Copy fixes the label to `Quero minha direção` (currently `Quero minha consultoria` — reconcile via `lib/site.ts`/usage).

---

### `components/sections/Hero.tsx` (MODIFIED, RSC) — RDSN-01/RDSN-02 / D-02

**Analog:** `components/sections/SobreRamon.tsx` (lines 5-22) for the photo-slot-as-region pattern; Hero is itself the canonical CTA+eyebrow+H1+lead+Reveal layout.

**Current structure to preserve** (Hero.tsx lines 6-53): `section relative flex min-h-[100svh] overflow-hidden` → eyebrow → H1 → lead → CTA, each wrapped in staggered `Reveal` (delay 0.08/0.16/0.24).

**Required changes (RESEARCH discrepancies — explicit tasks):**
1. **Typography ceiling (D-02, RESEARCH Pattern 4 lines 256-257):** H1 currently `md:text-8xl` (96px, line 30) → lower to `lg:text-7xl` (72px) per UI-SPEC Typography (line 56).
2. **Copy (RESEARCH §Runtime State Inventory item 2, lines 293):** eyebrow `Consultoria de treino e dieta` (line 25) → `Consultoria Ramon Dino`; H1 → sign-off `O topo exige direção.` (UI-SPEC §Copywriting lines 147-148); CTA label → `Quero minha direção`.
3. **Photo (RDSN-02):** replace the `radial-gradient` placeholder (lines 11-13) with `<RamonPhoto src="/ramon/hero.jpg" priority ... />` + `--scrim-hero` overlay (RESEARCH Pattern 2). Keep `aria-hidden` watermark optional.
4. Wrap photo in `ParallaxImage` island if Hero is the parallax target (D-08).

**Hard rule:** Hero stays a **Server Component** — no `"use client"` (RESEARCH Anti-Pattern Pitfall 4, lines 314-317). Motion only via imported islands.

---

### `components/sections/SobreRamon.tsx` (MODIFIED, RSC) — RDSN-01/RDSN-02

**Self-analog + Hero analog.** Two-column grid (lines 6-58): portrait slot (lines 9-22) | text+timeline (lines 24-57).

**Required changes:**
- Replace portrait gradient placeholder (lines 11-21) with `<RamonPhoto src="/ramon/retrato.jpg" />` + `--scrim-portrait` (RESEARCH Pattern 2, UI-SPEC line 46). Keep `aspect-[4/5]` and the `role="img"`/`aria-label` accessibility shape from the existing slot.
- H2 currently `md:text-6xl` (line 26) → reconcile to `sm:text-5xl` per UI-SPEC Typography (H2 = `text-4xl`→`sm:text-5xl`, line 57).
- Second photo-driven section candidate for parallax (D-08, planner's discretion per UI-SPEC line 103).
- TIMELINE map + Reveal stagger (lines 39-50) — keep; swap `Reveal`→`ScrollReveal` only if migrating (D-10).

---

### `components/sections/Resultados.tsx` (MODIFIED, RSC) — RDSN-01 / D-09

**Analog:** `components/sections/Metodo.tsx` (lines 36-48) — identical `grid gap-px overflow-hidden border border-line bg-line` cell-grid pattern (the canonical "editorial grid" of this codebase).

**Keep:** `AnimatedCounter` usage (lines 19-21) — D-09 explicitly reuses it; the gate is added inside AnimatedCounter itself. Numeral display `md:text-7xl` → reconcile to UI-SPEC numeral scale (`text-5xl`→`sm:text-6xl`, line 59). H2 `md:text-6xl` → `sm:text-5xl`. Planner may re-diagram as editorial grid (Claude's discretion, CONTEXT line 36).

---

### `components/sections/Metodo.tsx` / `ParaQuemE.tsx` (MODIFIED, RSC) — RDSN-01

**Mutual analogs.** Both use the bordered cell-grid (Metodo lines 36-48 `sm:grid-cols-2`; ParaQuemE lines 27-58 `md:grid-cols-2` cards). lucide-react icons (`Compass/Repeat/Flame/Target`, `Check/X`) with `aria-hidden`.

**Changes:** reconcile H2 typography ceiling (`md:text-6xl`→`sm:text-5xl`). Planner's discretion: Metodo as numbered editorial steps (CONTEXT line 36). Keep RSC; Reveal stagger pattern preserved or swapped to ScrollReveal (D-10). One of these is a candidate for a **pontual white-background block** (D-01, 1–2 blocks only) — requires `--color-fg-on-light` / `--color-muted-on-light` tokens (DSGN-01, never `#7f7f7f` on white).

---

### `components/sections/FAQ.tsx` (MODIFIED, client) — RDSN-01 / DSGN-03

**Self-analog.** Already `"use client"` (legitimate — accordion needs `useState`, line 1-5). Framer `AnimatePresence` height-animate accordion (lines 62-77) with full a11y (`aria-expanded`/`aria-controls`/`role="region"`, lines 50-67).

**Changes:** add Framer `useReducedMotion()` gate to the accordion expand (same pattern as Reveal patch, RESEARCH lines 352-360) so panels appear instantly under reduce. Reconcile H2 typography (line 37 `md:text-6xl` → `sm:text-5xl`). Note: animating `height` is the one allowed layout-animation here (accordion), but reduced-motion must skip it.

---

### `components/sections/CtaFinal.tsx` (MODIFIED, RSC) — RDSN-01

**Analog:** `components/sections/Hero.tsx` (CTA + Reveal + centered display). CtaFinal (lines 5-28) mirrors Hero's centered H2 + lead + CTAButton with Reveal stagger.

**Changes:** H2 `md:text-7xl` (line 10) is already near the ceiling — confirm against UI-SPEC. May host the brand sign-off `O topo exige direção.` (UI-SPEC line 148, alternative to Hero). CTA label → `Quero minha direção`. RSC preserved.

---

## Shared Patterns

### Token system (DSGN-01)
**Source:** `app/globals.css` lines 8-17 (`@theme` block) + 38-41 (focus) + 44-53 (reduced-motion CSS safety net).
**Apply to:** every section + RamonPhoto scrim.
**Reconciliation (RESEARCH §Runtime State item 1 + UI-SPEC §Design Tokens) — EXTEND in place, do not rename:**
```css
@theme {
  --color-bg: #0a0a0a;             /* was #000000 */
  --color-fg: #ededed;             /* was #ffffff */
  --color-muted: #7f7f7f;          /* keep — OK on black */
  --color-surface: #141414;        /* was #0c0c0c */
  --color-line: #262626;           /* was #1f1f1f */
  --color-fg-on-light: #0a0a0a;    /* NEW — text on white blocks */
  --color-muted-on-light: #595959; /* NEW — secondary on white (≥4.5:1) */
}
:root {
  --scrim-hero: linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,.75) 100%);
  --scrim-portrait: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.6) 100%);
}
```
Changing `--color-bg`/`--color-fg` repaints the whole page → re-verify all 7 sections; `#7f7f7f` drops from ~4.7:1 to ~4.5:1 (floor) — measure (RESEARCH A4).

### Reduced-motion gates per lib (DSGN-03)
**Source of truth:** `lib/usePrefersReducedMotion.ts` (NEW). Per-lib gate sources in RESEARCH §Code Examples (lines 331-381).
**Apply to:** ALL motion islands.
- GSAP (ScrollReveal/ParallaxImage): `gsap.matchMedia("(prefers-reduced-motion: no-preference)")` — never create timeline under reduce.
- Framer (Reveal, FAQ accordion): `useReducedMotion()` → static branch.
- anime.js (CTA, if used): `matchMedia('(prefers-reduced-motion: reduce)').matches` guard before `animate()`.
- `AnimatedCounter`: `usePrefersReducedMotion()` → `setValue(to)` final.
- CSS `@media` block (globals.css 44-53) STAYS as safety net.

### Client-island boundary (DSGN-05)
**Source/lawful examples:** `Reveal.tsx`, `AnimatedCounter.tsx`, `FAQ.tsx`, `CTAButton.tsx` — all `"use client"` at the leaf. **Counter-rule:** NONE of `sections/*` (except FAQ) nor `app/page.tsx` may carry `"use client"` (verified clean; RESEARCH §Test Map DSGN-05 line 481 = `grep -rL "use client" components/sections app/page.tsx` must stay clean). New motion islands live ONLY in `components/motion/`.

### `cn()` className merge
**Source:** `lib/utils.ts` (lines 6-10) — simple concat, used by `CTAButton.tsx` (line 2, 31). Adequate now; `clsx`+`tailwind-merge` is OPTIONAL (RESEARCH A1, line 102) — only if section/scrim variant overrides conflict.

### Copy/constants
**Source:** `lib/site.ts` (WHATSAPP_URL line 8-11, STATS 14-23, TIMELINE 26-31). Hero copy reconciliation (CTA label, eyebrow) touches usages of these. **Do NOT** rename `NEXT_PUBLIC_WHATSAPP_URL` (Fase 2; RESEARCH §Runtime State line 288). CTAs keep pointing at placeholder.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `components/RamonPhoto.tsx` | component | request-response | No `next/image` usage exists anywhere in the codebase; only gradient placeholders. Use RESEARCH §Pattern 2/3 + UI-SPEC. Image part is greenfield (but `next/image` is built-in, no install). |
| `lib/usePrefersReducedMotion.ts` | hook | event-driven | No standalone hook / no `lib/` matchMedia hook exists. Structural shell borrowed from `AnimatedCounter` useEffect+cleanup; behavior from RESEARCH §Code Examples. |

## Wave 0 / Foundation note for planner

- **`@gsap/react` is NOT installed** (verified: `node_modules/@gsap/react` absent; not in `package.json`). DSGN-04 requires `npm install @gsap/react` (2.1.2, peer satisfied by gsap@3.15.0 / react@19.2.4). This is the ONLY new dependency.
- `gsap@3.15.0`, `animejs@4.4.1`, `framer-motion@12.40.0`, `three@0.184.0` already installed — do NOT reinstall. `three` stays idle (v2).
- `next.config.ts` does NOT set `images.remotePatterns` — keep it that way; Ramon photos are served from `public/ramon/` (same-origin), satisfying the security control (RESEARCH §Security V14).
- No test framework installed; gates are `npm run typecheck && npm run lint` (per commit), `npm run build` (read First Load JS <200KB per wave), manual a11y at phase gate (RESEARCH §Validation Architecture).

## Metadata

**Analog search scope:** `site/components/{,sections,ui,motion,admin}`, `site/app/`, `site/lib/`, `site/public/`, `package.json`, `next.config.ts`
**Files scanned:** 20 source files read in full (7 sections, 4 components, globals.css, layout, page, 2 lib, configs)
**Pattern extraction date:** 2026-06-01
