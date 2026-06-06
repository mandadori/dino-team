# Phase 3: Conformidade Legal & LGPD — Pattern Map

**Mapped:** 2026-06-01
**Files analyzed:** 7 (2 new components, 2 new pages, 3 modifications)
**Analogs found:** 7 / 7

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `site/components/CookieBanner.tsx` | component (client island) | event-driven + localStorage | `site/components/admin/DispatchButton.tsx` | role-match |
| `site/app/privacidade/page.tsx` | page (RSC) | static render | `site/app/admin/dashboard/page.tsx` | role-match |
| `site/app/termos/page.tsx` | page (RSC) | static render | `site/app/admin/dashboard/page.tsx` | role-match |
| `site/app/layout.tsx` | layout | request-response | self (existing file, modify) | exact |
| `site/components/TrackingScripts.tsx` | component (RSC) | conditional render | self (existing file, modify) | exact |
| `site/app/page.tsx` | page (RSC) | static render | self (existing file, modify — footer only) | exact |
| `site/lib/site.ts` | config/constants | — | self (existing file, possibly modify) | exact |

---

## Pattern Assignments

### `site/components/CookieBanner.tsx` (component, client island, event-driven)

**Primary analog:** `site/components/admin/DispatchButton.tsx`
**Secondary analog:** `site/components/AnimatedCounter.tsx` (for `usePrefersReducedMotion` usage pattern)
**Tertiary reference:** `site/components/ui/CTAButton.tsx` (for button styling tokens)

**"use client" + useState pattern** (DispatchButton.tsx lines 1–19):
```tsx
"use client";

import { useState } from "react";

export function DispatchButton({ ... }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  // ...
}
```

**usePrefersReducedMotion integration** (AnimatedCounter.tsx lines 1–5, 25–33):
```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

// Inside component:
const reduce = usePrefersReducedMotion();

if (reduce) {
  // skip animation, render final state immediately
}
```

Note: `usePrefersReducedMotion` is already defined at `site/lib/usePrefersReducedMotion.ts`. Do not redefine. For CookieBanner exit animation: when `reduce === true`, banner disappears instantly (no transition); when false, use a CSS transition (fade/slide-up).

**Button rendering — inline `<button>` not `<a>` (CTAButton.tsx lines 28–48 for style tokens; DispatchButton.tsx lines 49–51 for `<button>` rendering):**
```tsx
// CTAButton renders <a> — NOT suitable for consent action.
// Copy its class tokens but render a <button>:
<button
  onClick={handleAccept}
  className="inline-flex items-center justify-center gap-2 px-8 py-4 font-body text-sm font-semibold uppercase tracking-wide transition-all duration-200 hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg bg-fg text-bg hover:bg-muted"
>
  Aceitar
</button>

// "Recusar" uses the outline token from CTAButton variant="outline":
<button
  onClick={handleRefuse}
  className="... border border-fg/40 text-fg hover:border-fg hover:bg-fg/5"
>
  Recusar
</button>
```

**Focus ring token** (CTAButton.tsx lines 40–41):
```tsx
"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg"
```

**Fixed bottom bar layout pattern** (globals.css tokens + page.tsx footer as structural reference):
```tsx
<div
  role="region"
  aria-label="Consentimento de cookies"
  className="fixed bottom-0 inset-x-0 z-50 border-t border-line bg-bg px-6 py-4 sm:py-6"
>
  <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    {/* text + link */}
    {/* button row */}
  </div>
</div>
```

**Inline link to /privacidade** (app/page.tsx CTAButton import for Next.js Link pattern):
```tsx
import Link from "next/link";
// In banner text:
<Link
  href="/privacidade"
  className="font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg"
>
  Política de Privacidade
</Link>
```

**localStorage persistence pattern** — no existing analog in this codebase. Use browser localStorage directly inside the "use client" island. Key: `"dino-consent"`, value: `{ choice: "accepted" | "refused", expiresAt: number }`. Read on mount via `useEffect`, write on button click.

---

### `site/app/privacidade/page.tsx` (page, RSC, static)

**Analog:** `site/app/admin/dashboard/page.tsx` (RSC page with heading hierarchy + sections)

**RSC page structure** (dashboard/page.tsx lines 1–10 and 26–58):
```tsx
// NO "use client" — RSC by default
import Link from "next/link";

export default function PrivacidadePage() {
  return (
    <main className="...">
      {/* content */}
    </main>
  );
}
```

**Header/footer inheritance:** Pages at `/privacidade` and `/termos` sit inside `app/layout.tsx` which provides the `<html>/<body>` shell. The fixed header and footer are currently in `app/page.tsx` (home), NOT in the root layout. Therefore the legal pages must include their own `<header>` and `<footer>` — or the executor can extract a shared `SiteShell` component. Copy the exact header and footer markup from `app/page.tsx` lines 17–26 (header) and 41–51 (footer):

```tsx
// Header (app/page.tsx lines 17–26):
<header className="fixed inset-x-0 top-0 z-50 border-b border-line/60 bg-bg/80 backdrop-blur">
  <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
    <span className="font-display text-2xl uppercase tracking-wide">
      Dino Team
    </span>
    <CTAButton href={WHATSAPP_URL} className="px-5 py-2.5 text-xs">
      Quero minha direção
    </CTAButton>
  </div>
</header>

// Footer (app/page.tsx lines 41–51):
<footer className="border-t border-line px-6 py-12">
  <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
    <span className="font-display text-xl uppercase tracking-wide">
      Dino Team
    </span>
    <p className="font-body text-sm text-muted">
      Consultoria de treino e dieta · O método do mais alto nível, adaptado para você.
    </p>
  </div>
</footer>
```

**Page prose structure** (dashboard/page.tsx h1 + section pattern; FAQ.tsx `max-w-3xl` container):
```tsx
// Legal pages use max-w-3xl (narrower than landing's max-w-6xl) for readability:
<main className="px-6 py-24 sm:py-32 pt-[calc(theme(spacing.24)+4rem)] sm:pt-[calc(theme(spacing.32)+4rem)]">
  {/* pt offset accounts for fixed header height */}
  <div className="mx-auto max-w-3xl">
    <h1 className="font-display text-4xl uppercase leading-[1.1] sm:text-5xl text-fg">
      POLÍTICA DE PRIVACIDADE
    </h1>
    <p className="mt-4 font-body text-sm text-muted">
      Última atualização: [DATA]
    </p>

    <section className="mt-16 space-y-8">
      <h2 className="font-display text-2xl uppercase leading-[1.2]">
        1. Informações que coletamos
      </h2>
      <p className="font-body text-base leading-relaxed text-fg">
        {/* body prose */}
      </p>
    </section>
  </div>
</main>
```

**Typography token reference** (globals.css lines 14–26 + page.tsx lines 19, 43):
```
font-display = Anton (--font-anton), always uppercase
font-body = Montserrat (--font-montserrat)
text-fg (#ededed), text-muted (#7f7f7f), bg-bg (#0a0a0a)
```

---

### `site/app/termos/page.tsx` (page, RSC, static)

**Analog:** Same as `app/privacidade/page.tsx` above — identical structure, different copy.

Copy every pattern from `/privacidade` exactly. Only the H1 text ("TERMOS DE USO") and prose content differ. No structural difference between the two pages.

---

### `site/app/layout.tsx` (layout, modify)

**Source:** `site/app/layout.tsx` (full file, 51 lines — read above)

**Current structure to preserve** (lines 1–51):
```tsx
import type { Metadata } from "next";
import { Anton, Montserrat } from "next/font/google";
import "./globals.css";
import { TrackingScripts } from "@/components/TrackingScripts";

// font configs (lines 6–19) — unchanged

export const metadata: Metadata = { ... }; // unchanged

export default function RootLayout({ children }: ...) {
  return (
    <html lang="pt-BR" className={`${anton.variable} ${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full bg-bg text-fg">
        {children}
        <TrackingScripts />   {/* ← currently unconditional */}
      </body>
    </html>
  );
}
```

**Modification target — add CookieBanner and wire consent:**
The layout is an RSC. `CookieBanner` is a client island that manages its own consent state internally (reads/writes localStorage). The cleanest pattern for this codebase (no existing Context Provider precedent) is to have `CookieBanner` own the consent state internally AND communicate it upward/sideways to `TrackingScripts` via a shared client boundary.

Two viable approaches (executor decides per D-11 discretion):

Option A — Context Provider (client boundary wraps both):
```tsx
// New file: site/components/ConsentProvider.tsx ("use client")
// Provides consent state via React context
// Both CookieBanner and TrackingScripts consume it

// layout.tsx becomes:
import { ConsentProvider } from "@/components/ConsentProvider";
import { CookieBanner } from "@/components/CookieBanner";
import { TrackingScripts } from "@/components/TrackingScripts";

<body className="min-h-full bg-bg text-fg">
  <ConsentProvider>
    {children}
    <CookieBanner />
    <TrackingScripts />
  </ConsentProvider>
</body>
```

Option B — Prop passed from layout (simpler, avoids extra file):
Not viable for RSC layout since consent state lives in localStorage (client-only). Option A is the correct pattern.

**Import additions to layout.tsx** (copy existing import style, lines 1–4):
```tsx
import { CookieBanner } from "@/components/CookieBanner";
// ConsentProvider if using Option A
```

---

### `site/components/TrackingScripts.tsx` (component, modify)

**Source:** `site/components/TrackingScripts.tsx` (full file, 56 lines — read above)

**Current structure** (lines 1–56): RSC that unconditionally renders `<Script>` tags when env vars are set.

**Modification:** Add a `consent` boolean prop (or consume context). Guard the entire return:

```tsx
// If using Context approach (Option A):
"use client";
import { useConsent } from "@/components/ConsentProvider";
import Script from "next/script";

export function TrackingScripts() {
  const { consent } = useConsent();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  // ... other IDs

  if (!consent) return null;   // ← single guard, renders nothing when no consent

  return (
    <>
      {gaId && ( ... )} {/* unchanged script blocks from lines 15–53 */}
      {metaPixelId && ( ... )}
      {clarityId && ( ... )}
    </>
  );
}
```

**Existing script blocks to preserve unchanged** (TrackingScripts.tsx lines 15–53):
```tsx
{gaId && (
  <>
    <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
    <Script id="ga-init" strategy="afterInteractive">
      {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
    </Script>
  </>
)}
// ... metaPixelId and clarityId blocks unchanged
```

---

### `site/app/page.tsx` (page, modify — footer only)

**Source:** `site/app/page.tsx` (full file, 54 lines — read above)

**Current footer** (lines 41–51):
```tsx
<footer className="border-t border-line px-6 py-12">
  <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
    <span className="font-display text-xl uppercase tracking-wide">
      Dino Team
    </span>
    <p className="font-body text-sm text-muted">
      Consultoria de treino e dieta · O método do mais alto nível, adaptado para você.
    </p>
  </div>
</footer>
```

**Modification:** Add legal links inside the footer `<div>`. The existing `<p>` becomes one flex child; a new `<nav>` with the two links becomes another. Keep the outer footer structure intact. Link styling copies the admin nav pattern (`text-muted hover:text-fg`) at `site/app/admin/layout.tsx` lines 14–20:

```tsx
// Add inside the existing flex div, after the <p>:
import Link from "next/link"; // already available in Next.js pages

<nav className="flex gap-5 font-body text-sm text-muted">
  <Link href="/privacidade" className="hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg">
    Política de Privacidade
  </Link>
  <Link href="/termos" className="hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg">
    Termos de Uso
  </Link>
</nav>
```

---

### `site/lib/site.ts` (config, possibly modify)

**Source:** `site/lib/site.ts` (full file, 106 lines — read above)

**Existing pattern** (lines 7–11): simple exported constants, env vars with fallback:
```ts
export const WHATSAPP_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ||
  "https://wa.me/0000000000?text=" + encodeURIComponent("Quero minha consultoria Dino Team");
```

**Addition pattern** (copy this style for cookie consent config):
```ts
// Cookie consent configuration — Phase 3 (LEGAL-03)
export const COOKIE_CONSENT_KEY = "dino-consent";
// Duration in milliseconds: 6 months = 6 × 30 × 24 × 60 × 60 × 1000
export const COOKIE_CONSENT_TTL_MS = 6 * 30 * 24 * 60 * 60 * 1000;
```

These constants are consumed by `CookieBanner.tsx` for localStorage key name and expiry calculation. Centralizing them in `lib/site.ts` follows the established `WHATSAPP_URL`/`STATS` pattern.

---

## Shared Patterns

### "use client" island declaration
**Source:** `site/components/admin/DispatchButton.tsx` line 1, `site/components/AnimatedCounter.tsx` line 1, `site/components/Reveal.tsx` line 1
**Apply to:** `CookieBanner.tsx` and any `ConsentProvider.tsx` created
```tsx
"use client";
```
Always the very first line, before any imports. Never add to RSC pages (`privacidade/page.tsx`, `termos/page.tsx`).

### prefers-reduced-motion gate
**Source:** `site/lib/usePrefersReducedMotion.ts` (full hook), `site/components/AnimatedCounter.tsx` lines 25–32
**Apply to:** `CookieBanner.tsx` (for enter/exit animation)
```tsx
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const reduce = usePrefersReducedMotion();
// When reduce === true: no transition on banner appear/disappear
// Global CSS in globals.css lines 58–67 also covers this as a safety net
```
The global CSS net (`animation-duration: 0.01ms !important`) catches any missed cases, but explicit `usePrefersReducedMotion()` gates are the established project pattern for components with JS-driven animation.

### Focus ring (monocromatic)
**Source:** `site/components/ui/CTAButton.tsx` lines 40–41, `site/app/globals.css` lines 52–55
**Apply to:** all interactive elements in `CookieBanner.tsx` (both buttons, inline link) and footer legal links in `app/page.tsx`
```tsx
"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg"
```
Global `:focus-visible` rule in `globals.css` (white outline 2px, offset 3px) applies as fallback. Components use the Tailwind class version for explicitness.

### Path alias imports
**Source:** All existing components — `@/` alias throughout
**Apply to:** All new files
```tsx
import { CTAButton } from "@/components/ui/CTAButton";
import { COOKIE_CONSENT_KEY } from "@/lib/site";
import Link from "next/link";
```
Never use relative paths (`../`). Always `@/` from the `site/` root.

### Color tokens (Tailwind utility classes)
**Source:** `site/app/globals.css` lines 14–26 — `@theme` block defines custom colors
**Apply to:** All new surfaces
```
bg-bg      → #0a0a0a  (banner bg, legal page bg)
text-fg    → #ededed  (primary text, display titles)
text-muted → #7f7f7f  (meta text, secondary copy)
border-line → #262626 (banner top border, dividers)
bg-surface → #141414  (elevated surfaces — not needed this phase)
```

### `max-w-6xl` content container
**Source:** `site/app/page.tsx` lines 18, 42 (header + footer div); `site/app/admin/layout.tsx` line 11
**Apply to:** Banner inner wrapper, legal page header/footer
```tsx
<div className="mx-auto max-w-6xl px-6 ...">
```

### `max-w-3xl` prose container
**Source:** `site/components/sections/FAQ.tsx` line 38
**Apply to:** Legal page main content (`privacidade/page.tsx`, `termos/page.tsx`)
```tsx
<div className="mx-auto max-w-3xl">
```

---

## No Analog Found

| File | Role | Reason |
|---|---|---|
| `site/components/ConsentProvider.tsx` (if created) | context provider | No React Context Provider exists in this codebase yet. Pattern follows standard React `createContext` + `useContext` — no existing analog to copy from. Executor uses React docs pattern. |

localStorage consent persistence has no existing analog in this codebase. Executor writes directly to `localStorage` inside `useEffect` within `CookieBanner.tsx` (or `ConsentProvider.tsx`).

---

## Metadata

**Analog search scope:** `site/app/`, `site/components/`, `site/lib/`
**Files read:** 12 source files
**Pattern extraction date:** 2026-06-01
