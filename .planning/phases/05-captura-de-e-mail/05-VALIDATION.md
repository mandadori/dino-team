---
phase: 5
slug: captura-de-e-mail
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-12
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> NOTE: `site/` has **zero unit-test infrastructure** today (CONCERNS.md / 05-RESEARCH.md). This phase is a small UI + Server-Action slice, so the deterministic gate is **`next build` + `tsc` + `lint`**, complemented by **manual accessibility + behavior checks** (the heart of LEAD-02) and a **post-account smoke** for the real Resend round-trip (gated by the D-04 deploy blocker). A unit/e2e framework is intentionally NOT introduced in v1.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none installed — `next build` + `tsc --noEmit` (type-level assertion of the action's discriminated state) + `next lint` + manual a11y/behavior checks |
| **Config file** | none (Wave 0 installs `resend` behind human-verify) |
| **Quick run command** | `cd site && npm run build` |
| **Full suite command** | `cd site && npm run build && npm run lint` |
| **Estimated runtime** | ~30–90 seconds (build) |

---

## Sampling Rate

- **After every task commit:** `cd site && npm run build` (must stay green with EMPTY `RESEND_*` envs — proves D-12 env-gating + lazy `new Resend()`)
- **After every plan wave:** `cd site && npm run build && npm run lint`
- **Before `/gsd:verify-work`:** build + lint green AND the Manual-Only behavior/a11y checks below all pass
- **Max feedback latency:** ~90 seconds

---

## Per-Task Verification Map

> Plans not yet written (this seeds the requirement→proof contract by family; the planner/executor fills concrete task IDs against it). Threat refs map to the STRIDE table in 05-RESEARCH.md §Security Domain.

| Task family | Wave | Requirement | Threat Ref | Secure/Correct Behavior | Test Type | Automated Command | File Exists | Status |
|---|---|---|---|---|---|---|---|---|
| `npm install resend` | 0 | (enabler) | supply-chain | dep present, official SDK human-verified (Phase 04 precedent) | checkpoint | `cd site && npm install` | ❌ W0 | ⬜ pending |
| Env-gate builds green | 0 | D-12 | — | `next build` succeeds with EMPTY `RESEND_*`; no top-level `new Resend()` | build | `cd site && npm run build` | ❌ W0 | ⬜ pending |
| Server Action → Resend contact | 1 | LEAD-01 | T-Spoofing/Tampering | `contacts.create({email,audienceId})`; returns discriminated success; already-subscribed = success (idempotent) | type+build | `cd site && npm run build` | ❌ W0 | ⬜ pending |
| Consent gate (no send w/o checkbox) | 1 | LEAD-01 (SC-3) | T-Repudiation | action re-guards: no checkbox → returns consent-error, Resend NOT called | behavior | manual: submit unchecked → error, no network call | ❌ W0 | ⬜ pending |
| Server email validation + honeypot | 1 | LEAD-01 | T-Spam/DoS (A4) | invalid email rejected server-side; filled honeypot silently drops | behavior | manual: bad email → error; honeypot fill → no-op | ❌ W0 | ⬜ pending |
| Form component + 7 states (`useActionState`) | 2 | LEAD-01/02 | — | idle/pending/success/consent-error/invalid-email/server-error render per UI-SPEC; success REPLACES form | behavior | manual page inspection per state | ❌ W0 | ⬜ pending |
| Accessibility wiring | 2 | LEAD-02 | — | aria-live announces status; focus → success heading / → checkbox on consent error; labels on input+checkbox+errors; WCAG AA; reduced-motion honored | behavior (manual a11y) | screen-reader + keyboard + contrast check | ❌ W0 | ⬜ pending |
| Hidden state (unconfigured) | 2 | D-12 | info-disclosure | RSC parent renders nothing when `RESEND_*` unset | behavior | manual: empty env → section absent | ❌ W0 | ⬜ pending |
| Mount in `/blog/[slug]` + `/blog` | 2 | LEAD-01 (D-05) | — | shared component after WhatsApp CTA on article + end of listing | behavior | view `/blog/[slug]` + `/blog` | ❌ W0 | ⬜ pending |
| `.env.example` documented | 2 | D-04 | secret-handling | `RESEND_API_KEY=` + `RESEND_AUDIENCE_ID=` present, empty, commented | source | `grep RESEND_ site/.env.example` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] **`checkpoint:human-verify` before `npm install resend`** — `resend@6.x` is registry-verified as the official first-party SDK (matching repo, no postinstall) but not slop-audited; mirror the Phase 04 dep-gate precedent.
- [ ] **Env-gating build proof** — `next build` must be green with empty `RESEND_API_KEY`/`RESEND_AUDIENCE_ID` (lazy `new Resend(apiKey)` inside the action, never at module top-level).

*Everything else is covered by the build/lint/typecheck bar + the Manual-Only checks below.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Consent gate blocks send | LEAD-01 (SC-3) | No test runner; needs DOM + network observation | Submit with unchecked box → inline error appears (aria-live), focus moves to checkbox, NO Resend network request fires |
| Accessible status announcement | LEAD-02 | Requires screen reader | With VoiceOver/NVDA, submit → success/error is announced via `aria-live`; focus lands on success heading (or checkbox on consent error) |
| Keyboard + focus ring | LEAD-02 | Requires keyboard interaction | Tab through input → checkbox → submit; visible focus ring on each (white ring per UI-SPEC); reading order = tab order |
| Contrast WCAG AA | LEAD-02 | Visual measurement | Sample input fill/text/placeholder/error text vs ground; all ≥ 4.5:1 (or 3:1 large) — note: errors use white text + field border, no red |
| Reduced-motion | LEAD-02 | Browser setting | With `prefers-reduced-motion`, no spinner/transition animates; state changes are instant |
| Hidden when unconfigured | D-12 | Env-dependent render | With empty `RESEND_*`, the form section does not appear on `/blog/[slug]` or `/blog`; with keys set, it appears |
| **Post-account smoke (real round-trip)** | LEAD-01 | Needs real `RESEND_*` + audience (D-04 deploy blocker) | After account/keys set: subscribe a fresh email → success + appears in Resend audience; **subscribe the SAME email again → also success** (verifies the idempotent already-subscribed=success assumption A2 from RESEARCH) |

---

## Validation Sign-Off

- [ ] All task families map to a build/type assertion OR a Manual-Only check (no silent gaps)
- [ ] Env-gating proven: `next build` green with empty `RESEND_*`
- [ ] No secret leak: `grep -r "re_" site/.next/static` returns nothing after build
- [ ] Sampling continuity: no 3 consecutive task families without an automated (build/type) assertion
- [ ] Post-account smoke scheduled as the deploy-gate (carries the D-04 blocker)
- [ ] `nyquist_compliant: true` set once the plan's task IDs are filled against this map

**Approval:** pending
