---
phase: 03-conformidade-legal-lgpd
plan: 02
subsystem: ui
tags: [nextjs, rsc, lgpd, legal-pages, tailwind, brand-editorial]

# Dependency graph
requires:
  - phase: 03-conformidade-legal-lgpd (plan 01)
    provides: CookieBanner links to /privacidade — this plan makes that route exist
provides:
  - /privacidade RSC page with complete LGPD privacy policy
  - /termos RSC page with complete terms of use
  - Footer legal links (Política de Privacidade + Termos de Uso) on home
  - Bracketed identifier placeholders ([RAZÃO SOCIAL]/[CNPJ]/[E-MAIL DO ENCARREGADO DE DADOS]/[COMARCA-UF]/[DATA]) for user swap without code change
affects: [seo-tecnico, captura-email, deploy]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Legal RSC page shell: replicate landing fixed header + footer inline, max-w-3xl prose, py-24/sm:py-32 with pt header-clearance offset"
    - "Bracketed token placeholders for company identifiers (no env/config coupling for static legal copy)"

key-files:
  created:
    - site/app/privacidade/page.tsx
    - site/app/termos/page.tsx
  modified:
    - site/app/page.tsx

key-decisions:
  - "Legal pages inline their own header/footer (no shared SiteShell extracted) — keeps the change additive and avoids touching the landing's structure beyond the footer nav"
  - "Wordmark in legal-page header is a next/link to / (home) — improves navigation back from a deep legal route without altering the landing's static span wordmark"
  - "Terms foro clause uses [COMARCA/UF] as an additional bracketed placeholder alongside the standard identifier set"

patterns-established:
  - "Legal page RSC pattern: fixed header (Link wordmark + CTAButton) + max-w-3xl Anton/Montserrat prose + footer with legal nav"
  - "Privacy/terms prose mirror structure exactly; only H1 + section copy differ"

requirements-completed: [LEGAL-01, LEGAL-02]

# Metrics
duration: 3min
completed: 2026-06-02
---

# Phase 3 Plan 02: Páginas Legais (/privacidade + /termos) Summary

**Two RSC legal pages — complete LGPD privacy policy and terms of use in the brand editorial shell — reachable from the home footer, with company identifiers as swap-in bracketed placeholders.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-06-02T12:24:36Z
- **Completed:** 2026-06-02T12:27:04Z
- **Tasks:** 2
- **Files modified:** 3 (2 created, 1 modified)

## Accomplishments
- `/privacidade`: full LGPD-grade privacy policy — controller, data collected (incl. GA4/Meta Pixel/Clarity analytics cookies), purpose, legal basis (consent), third-party sharing, retention, data-subject rights, DPO contact, cookie control, change clause.
- `/termos`: complete terms of use — acceptance, service description (no result/timeline promise — brand tabu respected), IP, user conduct, liability limitation, third-party links, changes, Brazilian law + foro, contact.
- Both pages reuse the landing's fixed header (wordmark + WhatsApp CTA) and footer, with `max-w-3xl` Anton/Montserrat prose on black, strict monochrome tokens.
- Home footer now links to both legal pages with `text-muted hover:text-fg` + focus-visible ring; the legal pages carry the same footer nav.
- Company identifiers are literal bracketed tokens the user swaps without touching code.

## Task Commits

Each task was committed atomically:

1. **Task 1: /privacidade page (RSC, brand editorial)** — `2cc743c` (feat)
2. **Task 2: /termos page + footer legal links** — `2a27f17` (feat)

**Plan metadata:** committed with this SUMMARY (docs).

## Files Created/Modified
- `site/app/privacidade/page.tsx` — RSC Política de Privacidade, LGPD prose, brand shell, metadata export.
- `site/app/termos/page.tsx` — RSC Termos de Uso, same shell, terms prose with no outcome promise, metadata export.
- `site/app/page.tsx` — added `next/link` import and a footer `<nav>` linking to /privacidade and /termos.

## Decisions Made
- Legal pages inline their own header/footer rather than extracting a shared `SiteShell` — minimal-footprint, additive change; header/footer still live in `app/page.tsx` for the landing.
- The legal-page header wordmark is a `next/link` to `/` (the landing keeps a static `span` wordmark) so a visitor on a deep legal route can return home; this is an intentional, non-breaking enhancement of the replicated shell.
- Added `[COMARCA/UF]` as a bracketed placeholder in the terms foro clause, extending the standard `[RAZÃO SOCIAL]`/`[CNPJ]`/`[E-MAIL DO ENCARREGADO DE DADOS]` set — keeps the foro fillable without code edits.

## Deviations from Plan

None — plan executed exactly as written. (The header-wordmark-as-link and the extra `[COMARCA/UF]` placeholder are within-spec refinements of the prescribed shell/placeholder pattern, not unplanned functional work.)

## Issues Encountered
None. `npx tsc --noEmit` passed clean; `npx next build` emitted `/privacidade` and `/termos` as static (`○`) routes and rebuilt `/`.

## Known Stubs
None. The bracketed identifier tokens (`[RAZÃO SOCIAL]`, `[CNPJ]`, `[E-MAIL DO ENCARREGADO DE DADOS]`, `[COMARCA/UF]`, `[DATA]`) are intentional per D-01 (threat register T-03-04 disposition: accept) — the user swaps them before going live without touching code. They do not block the plan goal: the pages render complete, navigable legal documents.

## User Setup Required
None — no external service configuration required. Before going live, the user replaces the bracketed identifier placeholders and the `[DATA]` last-updated date in both legal pages.

## Next Phase Readiness
- Phase 3 (conformidade-legal-lgpd) is complete: LEGAL-01, LEGAL-02 (this plan) + LEGAL-03 (plan 01) all satisfied. The CookieBanner's `/privacidade` link (plan 01) now resolves to a real page.
- Ready for Phase 4 (SEO técnico): legal routes exist for sitemap inclusion; `NEXT_PUBLIC_SITE_URL` still needed before OG/canonical/sitemap (carried blocker).

---
*Phase: 03-conformidade-legal-lgpd*
*Completed: 2026-06-02*

## Self-Check: PASSED

- site/app/privacidade/page.tsx — FOUND
- site/app/termos/page.tsx — FOUND
- .planning/phases/03-conformidade-legal-lgpd/03-02-SUMMARY.md — FOUND
- Commit 2cc743c — FOUND
- Commit 2a27f17 — FOUND
