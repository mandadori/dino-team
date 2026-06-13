---
phase: 05-captura-de-e-mail
plan: 03
subsystem: ui
tags: [resend, env-gate, rsc, blog, lead-capture, a11y, deploy-blocker]

requires:
  - phase: 05-captura-de-e-mail (plan 02)
    provides: "NewsletterForm client island + subscribe Server Action"
  - phase: 04-blog-seo-production-ready
    provides: "/blog listing + /blog/[slug] article routes (mount points)"
provides:
  - "NewsletterForm mounted env-gated in /blog/[slug] (after WhatsApp CTA, last article block) and /blog (end of listing)"
  - "Server-only RSC env-gate (newsletterEnabled) — section hidden when RESEND_* unset (D-12), build green, no secret in client bundle"
affects: []

tech-stack:
  added: []
  patterns:
    - "RSC server-only env-gate deciding whether to render a client island (process.env read in RSC body, never passed as prop / never NEXT_PUBLIC_)"

key-files:
  created: []
  modified:
    - site/app/blog/[slug]/page.tsx
    - site/app/blog/page.tsx

key-decisions:
  - "Section heading/subtext live INSIDE NewsletterForm (not the RSC wrapper) so the success panel cleanly REPLACES the whole block (D-10, no orphan heading) — minor deviation from the RESEARCH env-gate sketch comment, behavior-equivalent and cleaner"
  - "Article mount uses a plain border-t section (no text-center needed — the form centers its own content); listing mount lets the form's own mx-auto max-w-md center it within max-w-6xl (D-05)"

patterns-established:
  - "Env-gated client-island mount: {newsletterEnabled && <section><NewsletterForm/></section>} repeated verbatim across both routes"

requirements-completed: [LEAD-01, LEAD-02]

duration: 10min
completed: 2026-06-13
---

# Phase 05: Captura de E-mail — Plan 03 Summary

**NewsletterForm mounted env-gated in both blog routes (after the WhatsApp CTA on articles, end of the listing); hidden with keys unset, build green, no secret leak. The two human gates — manual a11y sign-off and the Resend-account deploy smoke — are carried forward per the user's decision.**

## Performance

- **Duration:** ~10 min (Task 1 code); Tasks 2–3 are carried human checkpoints
- **Completed:** 2026-06-13 (code) — verification + deploy pending
- **Tasks:** 1 of 3 executed; 2 carried (1 deferred, 1 blocked)
- **Files modified:** 2

## Accomplishments
- **Task 1 (code, done):** `NewsletterForm` imported + mounted behind a server-only `newsletterEnabled = !!RESEND_API_KEY && !!RESEND_AUDIENCE_ID` gate in `/blog/[slug]` (immediately after the WhatsApp CTA — the article's last block, D-05/D-06) and at the end of `/blog` (posts branch, D-05). With `RESEND_*` unset the section does not render (D-12) — `next build` green, `grep` of `.next/static` confirms **no `RESEND_*` in the client bundle** (T-05-05). WhatsApp CTA + empty-state branch untouched.

## Task Commits

1. **Task 1: Mount NewsletterForm env-gated in both routes** — `48014e3` (feat)
2. **Task 2: Manual a11y + 7-state verification** — ⏸ **deferred** (user) — no commit
3. **Task 3: Resend account + deploy smoke** — ⛔ **blocked** (no account yet) — no commit

## Files Created/Modified
- `site/app/blog/[slug]/page.tsx` — env-gate + `<NewsletterForm>` after the WhatsApp CTA
- `site/app/blog/page.tsx` — env-gate + `<NewsletterForm>` at the end of the listing

## Decisions Made
- Heading/subtext kept inside `NewsletterForm` (client island) rather than the RSC section wrapper, so the success panel replaces the entire block cleanly (D-10). Behavior-equivalent to the plan; improves the success-state swap.

## Deviations from Plan
None affecting scope. The env-gate sketch in RESEARCH showed a placeholder `{/* heading/subtext */}` inside the RSC section; the heading instead lives in the island (see Decisions) — a cleaner D-10 success swap, same rendered result in idle.

## Issues Encountered
- `npm run lint` still exits 1 on the **2 pre-existing** errors (`ConsentProvider.tsx:68`, `ShareBar.tsx:72`); the two route files modified here introduce no new lint errors. `next build` (the deterministic gate) is green.

## Carried Checkpoints (CRITICAL — not yet satisfied)

**⏸ Task 2 — Manual a11y sign-off (DEFERRED by user).** LEAD-02 accessibility is unverified. Before the form is considered done, run `cd site && RESEND_API_KEY=local-dev RESEND_AUDIENCE_ID=local-dev npm run dev` and walk the 7-item checklist (consent gate blocks send + focus→checkbox; aria-live announcement; keyboard + visible focus ring; WCAG AA contrast, no red; reduced-motion; hidden with empty env; invalid-email focus→input) + the 6 UI-SPEC §Checker Sign-Off dimensions. **D-13 (accessibility) confirmation lives here** — the decision-coverage override from plan-phase flagged D-13 for verify-phase.

**⛔ Task 3 — Resend account + deploy smoke (BLOCKED).** The declared deploy blocker (D-04). The user has no Resend account yet. Before go-live: create account + Audience, fill `RESEND_API_KEY` + `RESEND_AUDIENCE_ID` (server-only, `.env.local` dev / Vercel env prod), then the real smoke — subscribe a fresh email (success + appears in audience) and the SAME email again (also success → confirms idempotent already-subscribed, D-11/A2). If a repeat shows `server_error`, adjust the `{error}→server_error` mapping to treat the specific code as success (RESEARCH A2 — trivially adjustable).

## Next Phase Readiness
- The capture slice is code-complete and on `main`. Phase 05 is **executed, verification pending**: a11y sign-off (Task 2) + Resend deploy smoke (Task 3) remain. Recommended next: `/gsd-verify-work 5` once the a11y check + Resend smoke are done, or proceed to Phase 6 with these two gates explicitly carried.

---
*Phase: 05-captura-de-e-mail*
*Completed (code): 2026-06-13 — a11y sign-off + deploy smoke carried*
