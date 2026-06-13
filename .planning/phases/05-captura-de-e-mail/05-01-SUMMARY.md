---
phase: 05-captura-de-e-mail
plan: 01
subsystem: infra
tags: [resend, env, next, build-gate, supply-chain]

requires:
  - phase: 04-blog-seo-production-ready
    provides: "blog routes (/blog, /blog/[slug]) where the form will mount; .env.example server-only secret block convention"
provides:
  - "resend@6.12.4 SDK installed in site/ (human-verified before install, T-05-SC)"
  - "RESEND_API_KEY + RESEND_AUDIENCE_ID documented (empty, server-only) in site/.env.example"
  - "Proven baseline: next build is green with RESEND_* unset (env-gate degrades, D-04/D-12)"
affects: [05-02, 05-03]

tech-stack:
  added: [resend@6.12.4]
  patterns: ["server-only secret env vars (no NEXT_PUBLIC_ prefix); documented-and-empty .env.example convention extended to Resend"]

key-files:
  created: []
  modified:
    - site/package.json
    - site/package-lock.json
    - site/.env.example

key-decisions:
  - "resend pinned at 6.12.4 (the exact version the researcher legitimacy-audited)"
  - "RESEND_API_KEY / RESEND_AUDIENCE_ID are server-only secrets — placed in the .env.example secret block, never NEXT_PUBLIC_ (D-03)"

patterns-established:
  - "Wave-0 enabler gate: human-verify supply-chain dependency before install (Phase 04 T-04-SC precedent)"
  - "Env-gate baseline: build must stay green with feature env vars unset (D-12)"

requirements-completed: [LEAD-01]

duration: 6min
completed: 2026-06-13
---

# Phase 05: Captura de E-mail — Plan 01 Summary

**resend@6.12.4 installed behind a human-verify supply-chain gate, with the two server-only RESEND_* keys documented-and-empty in .env.example, and a proven green `next build` with the Resend env unset.**

## Performance

- **Duration:** ~6 min
- **Completed:** 2026-06-13
- **Tasks:** 3 (1 checkpoint + 2 executed)
- **Files modified:** 3

## Accomplishments
- Human-verify checkpoint (T-05-SC) approved → `resend@6.12.4` installed (official first-party SDK, no postinstall, deps `postal-mime`+`standardwebhooks`).
- `.env.example` documents `RESEND_API_KEY` + `RESEND_AUDIENCE_ID` — empty, commented, in the server-only secret block (no `NEXT_PUBLIC_` prefix).
- `npm run typecheck` clean and `next build` exits 0 with `RESEND_*` unset — env-gate baseline proven (D-04/D-12), all blog routes still prerender.

## Task Commits

1. **Task 1: Human-verify gate (resend legitimacy)** — checkpoint, user "approved" (no commit)
2. **Task 2: Install resend@6.12.4 + document keys** — `d9bb2ed` (feat)
3. **Task 3: Prove build green with empty Resend env** — verification only (no files changed)

## Files Created/Modified
- `site/package.json` / `site/package-lock.json` — `resend@6.12.4` dependency registered
- `site/.env.example` — new "Captura de e-mail — Fase 5 (LEAD-01)" block with two empty server-only keys

## Decisions Made
None beyond the plan — followed as specified. (Pinned resend at the audited 6.12.4; keys kept server-only per D-03.)

## Deviations from Plan
None — plan executed exactly as written.

## Issues Encountered
- `npm install` reported 2 moderate-severity vulnerabilities across the existing 541-package tree (pre-existing, not introduced by `resend`). Out of scope for this plan; noted for a future `npm audit` follow-up.

## User Setup Required
**External service requires manual configuration before go-live.** The form is env-gated (hidden) until both keys are set:
- `RESEND_API_KEY` — Resend Dashboard → API Keys (https://resend.com/api-keys)
- `RESEND_AUDIENCE_ID` — Resend Dashboard → Audiences (create the audience, copy its id)
This is the declared deploy blocker (D-04); verified end-to-end by the post-account smoke in 05-03.

## Next Phase Readiness
- SDK installed + env documented → Wave 2 (05-02: Server Action + NewsletterForm) is unblocked.
- Build-green-with-empty-env baseline established; 05-02 must preserve it via lazy `new Resend()` inside the action.

---
*Phase: 05-captura-de-e-mail*
*Completed: 2026-06-13*
