---
phase: 01-landing-editorial-funda-o
reviewed: 2026-06-01T13:00:00Z
depth: standard
files_reviewed: 15
files_reviewed_list:
  - site/app/globals.css
  - site/app/page.tsx
  - site/components/AnimatedCounter.tsx
  - site/components/RamonPhoto.tsx
  - site/components/Reveal.tsx
  - site/components/motion/ParallaxImage.tsx
  - site/components/sections/CtaFinal.tsx
  - site/components/sections/FAQ.tsx
  - site/components/sections/Hero.tsx
  - site/components/sections/Metodo.tsx
  - site/components/sections/ParaQuemE.tsx
  - site/components/sections/Resultados.tsx
  - site/components/sections/SobreRamon.tsx
  - site/components/ui/CTAButton.tsx
  - site/lib/usePrefersReducedMotion.ts
findings:
  critical: 2
  warning: 2
  info: 1
  total: 5
status: fixed
---

# Phase 01: Code Review Report

**Reviewed:** 2026-06-01T13:00:00Z
**Depth:** standard
**Files Reviewed:** 15
**Status:** issues_found

## Summary

15 source files reviewed across the three plans of this phase: design/animation foundations (plan 01), Hero/SobreRamon/CtaFinal photo-driven rebuild (plan 02), and ParaQuemE/Metodo/Resultados/FAQ editorial redesign (plan 03).

The codebase is well-structured overall. The reduced-motion gates are properly implemented, SSR/client island boundaries follow the DSGN-05 pattern, and contrast tokens are correctly applied. Two critical defects were found that will produce incorrect visual behavior in production: a layout bug that breaks the Hero full-bleed photo, and the same bug breaking the parallax effect. One structural HTML validity issue and one CSS property conflict round out the quality findings.

---

## Critical Issues

### CR-01: Hero photo invisible (or parallax silently broken) due to `position` class conflict in RamonPhoto

**File:** `site/components/RamonPhoto.tsx:32` and `site/components/sections/Hero.tsx:19`

**Issue:** `RamonPhoto` hardcodes `relative` on its outer `div` in the `src` branch:

```tsx
<div className={`relative overflow-hidden ${className ?? ""}`}>
```

`Hero.tsx` passes `className="absolute inset-0"`, producing the final class string `"relative overflow-hidden absolute inset-0"` on the same element. Both `absolute` and `relative` set the CSS `position` property. Without `tailwind-merge`, both classes are emitted and the **last rule in the Tailwind-generated stylesheet wins**. In Tailwind v4 (and prior versions), position utilities are generated in alphabetical order within their `@layer utilities` block: `.absolute` (a) is emitted **before** `.relative` (r), so `.relative` wins.

Result — **Case A (most likely):** `position: relative` applies. The `inset-0` classes have no anchoring effect on a relative element; the RamonPhoto `div` has no explicit height; `next/image fill` requires a parent with both `position: relative` (correct) and defined dimensions (missing). The generated `<img>` is `position: absolute; inset: 0` inside a zero-height container — the photo renders at **0 px height and is invisible**. The Hero section height is driven solely by the text content; the full-bleed background does not exist.

Even in **Case B** (if `absolute` were to win instead): the `div` would anchor to `section.relative`, bypassing `ParallaxImage`'s `div` (which has no `position` set, so it is static). GSAP translates `ParallaxImage`'s `div`, but the photo is anchored to the section — **parallax has no visual effect on the photo**.

Either outcome is a production defect.

**Fix:** Two changes are needed.

1. Remove the hardcoded `relative` from `RamonPhoto`'s outer `div`; the consumer is responsible for positioning the wrapper:

```tsx
// RamonPhoto.tsx — src branch
return (
  <div className={`overflow-hidden ${className ?? ""}`}>
    <Image ... />
    <div aria-hidden="true" className="absolute inset-0" style={{ background: scrimVar }} />
  </div>
);
```

2. Give `ParallaxImage`'s wrapper `position: relative` so that the `absolute inset-0` passed from Hero anchors to it (enabling GSAP translate to move the photo):

```tsx
// ParallaxImage.tsx — return
return (
  <div ref={scope} className="relative will-change-transform">
    {children}
  </div>
);
```

With these two changes: `RamonPhoto div` gets `absolute inset-0` → anchors to `ParallaxImage div` (now `relative`) → `next/image fill` works → GSAP `translateY` on the `ParallaxImage div` moves the photo.

Note: the same `relative overflow-hidden` prefix in the placeholder branch should also lose `relative` for consistency, though the placeholder does not use `fill` so it is less critical there.

---

### CR-02: `usePrefersReducedMotion` produces a server/client hydration mismatch for reduced-motion users

**File:** `site/lib/usePrefersReducedMotion.ts:13-16`

**Issue:** The lazy `useState` initializer guards against SSR with `typeof window === "undefined"`, returning `false` on the server. In Next.js App Router, **client components are still server-rendered** to produce the initial HTML. For any user with `prefers-reduced-motion: reduce`, the server renders HTML with `reduce = false` (animations visible), but the client re-evaluates `matchMedia` during hydration and gets `reduce = true`. React detects the mismatch and must re-render, producing a flash where animated state is briefly visible before being replaced by the static state.

For `AnimatedCounter` this means the counter briefly shows `0` and starts animating before immediately jumping to the final value. For `Reveal` it means the `motion.div` is mounted and then immediately replaced by a plain `div`, potentially causing a visual flash or layout shift.

React 18 does not suppress `useState` mismatches with a warning; in development this appears as a console error.

**Fix:** Use `useSyncExternalStore` with an explicit server snapshot of `false`. This is the React-recommended pattern for browser-API-dependent state that must not mismatch:

```ts
"use client";
import { useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

const getSnapshot = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const getServerSnapshot = () => false;

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
```

`useSyncExternalStore` explicitly accepts a `getServerSnapshot` that returns `false`, making the mismatch intentional and suppressed. The client value is used after hydration without a warning.

---

## Warnings

### WR-01: `<ol>` contains `<div>` children (invalid HTML) in `SobreRamon`

**File:** `site/components/sections/SobreRamon.tsx:36-46`

**Issue:** `TIMELINE.map` renders each item as `<Reveal key={...}><li>...</li></Reveal>`. `Reveal` always renders a `div` (either `<div>` or `<motion.div>`). The resulting DOM is `<ol> → <div> → <li>`, which is **invalid HTML**: the only permitted direct children of `<ol>` are `<li>`, `<script>`, and `<template>` (per HTML5 spec). Browsers silently repair this, but it breaks semantics for assistive technologies that navigate ordered lists and may produce inconsistent node-counting for screen readers.

**Fix:** Either move `Reveal` inside the `<li>` instead of outside it:

```tsx
<ol className="mt-10 space-y-6">
  {TIMELINE.map((t, i) => (
    <li key={t.marco} className="border-l border-line pl-5">
      <Reveal delay={0.06 * i}>
        <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-fg">
          {t.marco}
        </p>
        <p className="mt-2 font-body text-muted">{t.texto}</p>
      </Reveal>
    </li>
  ))}
</ol>
```

Or change `Reveal` to accept an `as` prop that lets it render as the semantic element rather than always a `div`.

---

### WR-02: `CTAButton` applies conflicting `transition-colors` and `transition-transform` — color transition is silently dropped

**File:** `site/components/ui/CTAButton.tsx:35-37`

**Issue:** `cn()` concatenates these two strings:

```
"transition-colors duration-200"
"hover:scale-[1.04] transition-transform"
```

`cn()` does not use `tailwind-merge`; it only joins strings with spaces. Both `transition-colors` and `transition-transform` are present in the final class list. Both utilities set the CSS `transition-property` property. With equal specificity, the **last rule in the stylesheet wins**. Tailwind generates `transition-colors` before `transition-transform` (alphabetical order within `@layer utilities`), so `transition-transform` wins and the `transition-property: color, background-color, border-color...` from `transition-colors` is **overridden**. The background-color change on hover (`hover:bg-muted`) has no CSS transition — it snaps instantly instead of fading over 200 ms.

**Fix:** Combine the transition properties into a single class list, or use `tailwind-merge` to resolve conflicts. The minimal fix is to replace both utility classes with a single `transition-all duration-200` (or explicitly specify `transition-[color,background-color,transform]` if Tailwind v4 supports arbitrary transition lists):

```tsx
cn(
  "inline-flex items-center justify-center gap-2 px-8 py-4 font-body text-sm font-semibold uppercase tracking-wide",
  "transition-all duration-200",          // covers both color and transform
  "hover:scale-[1.04]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg",
  styles[variant],
  className,
)
```

If `transition-all` is considered too broad, replace `cn` with `clsx` + `tailwind-merge` and keep the two separate transition utilities.

---

## Info

### IN-01: `aria-controls` points to a conditionally rendered element (panel absent from DOM when closed)

**File:** `site/components/sections/FAQ.tsx:50-51`

**Issue:** The accordion trigger has `aria-controls={`faq-panel-${i}`}` at all times. When `isOpen === false` (or when `reduce === true` and `isOpen === false`), the panel `div` with that `id` is not rendered at all — the DOM element referenced by `aria-controls` does not exist. The WAI-ARIA spec states that `aria-controls` should reference an **existing** element. Screen readers that rely on this relationship to navigate from trigger to panel may encounter an invalid reference.

This is a well-known tension with animated accordions (mounting/unmounting vs. hiding), but it is worth addressing.

**Fix:** Render the panel element at all times and toggle visibility with `display:none` (or `hidden` attribute) rather than conditional mounting. For the animated branch, `AnimatePresence` can still wrap it while using CSS clip/overflow instead of mount/unmount. Alternatively, always render the panel container but leave it empty when closed, preserving the DOM id for `aria-controls`:

```tsx
{/* Always render the container so aria-controls resolves */}
<div
  id={`faq-panel-${i}`}
  role="region"
  aria-labelledby={`faq-trigger-${i}`}
  hidden={!isOpen}
>
  <p className="pb-6 font-body text-muted">{f.a}</p>
</div>
```

This removes the animation dependency but preserves the accessibility contract. If animation is required, prefer `visibility:hidden`/`height:0` with the element present in the DOM.

---

_Reviewed: 2026-06-01T13:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
