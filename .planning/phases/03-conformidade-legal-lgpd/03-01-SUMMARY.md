---
phase: 03-conformidade-legal-lgpd
plan: 01
subsystem: site
tags: [lgpd, consent, cookies, tracking, privacy]
status: awaiting-checkpoint
requires:
  - site/components/TrackingScripts.tsx (existing)
  - site/app/layout.tsx (existing)
  - site/lib/site.ts (existing)
  - site/lib/usePrefersReducedMotion.ts (existing)
  - site/components/ui/CTAButton.tsx (style tokens)
provides:
  - ConsentProvider (consent state + localStorage, 6-month TTL)
  - useConsent() hook
  - CookieBanner (fixed bottom consent bar)
  - TrackingScripts gated on consent === true
affects:
  - site/app/layout.tsx (now wraps body in ConsentProvider)
tech-stack:
  added: []
  patterns:
    - React createContext/useContext for shared client consent state (first in codebase)
    - localStorage persistence with expiresAt TTL inside client island
key-files:
  created:
    - site/components/ConsentProvider.tsx
    - site/components/CookieBanner.tsx
  modified:
    - site/lib/site.ts
    - site/components/TrackingScripts.tsx
    - site/app/layout.tsx
decisions:
  - "Option A (Context Provider) over Option B (layout prop): consent lives in client-only localStorage, so an RSC layout cannot read it — a shared client boundary is required."
  - "localStorage over first-party cookie: simpler, no server-side access needed for client-only gating (D-08 discretion)."
  - "Banner copy: 'Usamos cookies de analytics para entender o uso do site. Você decide.' — sober, second person, no privacy clichê (tom-de-voz compliant)."
metrics:
  duration_min: 4
  completed: 2026-06-02
  tasks_completed: 2
  tasks_total: 3
  files_touched: 5
---

# Phase 3 Plan 01: Cookie-Consent Vertical Slice Summary

Consent-gated tracking for LGPD: a sober fixed bottom banner lets the visitor accept or refuse, and GA4/Meta Pixel/Clarity stay suppressed until explicit consent, with the choice persisted 6 months in localStorage.

## What Was Built

- **`site/lib/site.ts`** — added `COOKIE_CONSENT_KEY = "dino-consent"` and `COOKIE_CONSENT_TTL_MS` (6 months in ms), following the existing exported-const pattern.
- **`site/components/ConsentProvider.tsx`** (new, `"use client"`) — owns `consent`/`decided` state via React `createContext`. Reads localStorage on mount (SSR-safe, only inside `useEffect`), parses `{ choice, expiresAt }`, and validates non-expiry. Exposes `accept()`/`refuse()` that persist `{ choice, expiresAt: now + TTL }` and update state. Exports a `useConsent()` hook that throws if used outside the provider.
- **`site/components/CookieBanner.tsx`** (new, `"use client"`) — fixed bottom bar (`role="region"`, `aria-label="Consentimento de cookies"`, not `aria-modal`, no focus trap). Renders null once `decided === true`. Two real `<button>` elements (Aceitar primary tokens, Recusar outline tokens, both ≥44px, equal legitimacy), an inline `next/link` to `/privacidade`, and a reduced-motion-aware exit transition.
- **`site/components/TrackingScripts.tsx`** (modified) — now `"use client"`, reads `useConsent()`, and returns null via `if (!consent) return null` before the three Script blocks (GA4 / Meta Pixel / Clarity), which are otherwise untouched.
- **`site/app/layout.tsx`** (modified) — body contents wrapped in `<ConsentProvider>` so `{children}`, `CookieBanner`, and `TrackingScripts` share one consent boundary. Fonts, metadata, and html/body classes preserved.

## Tasks

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Consent constants + ConsentProvider client boundary | b069abf | site/lib/site.ts, site/components/ConsentProvider.tsx |
| 2 | CookieBanner UI + gate TrackingScripts + wire layout | b2d5547 | site/components/CookieBanner.tsx, site/components/TrackingScripts.tsx, site/app/layout.tsx |
| 3 | Verify consent gating behavior in the browser | — | checkpoint:human-verify (PENDING) |

## Verification

- `npx tsc --noEmit` — passes, no type errors across new and modified files.
- `npx next build` — completes successfully; client/RSC boundaries valid (no `"use client"` leaking into RSC pages).
- Source assertions (per-task acceptance criteria) — all hold:
  - ConsentProvider first line `"use client"`, contains `createContext`, exports `useConsent`, persists `expiresAt`, no module-top localStorage.
  - CookieBanner first line `"use client"`, contains `href="/privacidade"`, `role="region"`, `aria-label="Consentimento de cookies"`, exactly two `<button>` elements, no `aria-modal`, no forbidden clichê.
  - TrackingScripts first line `"use client"`, contains `if (!consent) return null`, still exactly 4 `<Script` occurrences.
  - layout wraps body in `ConsentProvider` and renders `CookieBanner`.

## Threat Model Coverage

- **T-03-02 (Information Disclosure — tracking pre-consent):** mitigated. `if (!consent) return null` ensures GA4/Meta/Clarity never mount before explicit consent. Runtime confirmation deferred to Task 3 step 2.
- **T-03-03 (Repudiation — choice not persisted):** mitigated. Choice written to localStorage with a 6-month `expiresAt`; banner suppressed while valid.
- **T-03-01 (Tampering — localStorage value):** accepted. Client-side only; impact limited to the visitor's own tracking state.
- **T-03-SC (package installs):** accepted. No new packages installed.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. The consent gate is fully wired; tracking scripts read live consent state. Tracking IDs themselves (`NEXT_PUBLIC_GA_ID` etc.) remain env-driven as before this plan — not a stub introduced here.

## Status

Stopped at **Task 3 — checkpoint:human-verify** (gate="blocking"). The implementation is complete and committed; runtime browser verification of the consent lifecycle (banner visibility, pre-consent suppression, accept/refuse persistence, keyboard + reduced-motion) requires a human and cannot be auto-tested without a browser test runner (out of scope this phase). Awaiting user approval to mark the plan complete.

## Self-Check: PASSED

- Created files exist: `site/components/ConsentProvider.tsx`, `site/components/CookieBanner.tsx` — FOUND.
- Modified files present in commits b069abf and b2d5547 — FOUND.
- Commits b069abf and b2d5547 exist in git history — FOUND.
