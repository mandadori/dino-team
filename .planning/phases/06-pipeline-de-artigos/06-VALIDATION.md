---
phase: 6
slug: pipeline-de-artigos
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-13
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Unlike `site/` (no test runner), the **brand-OS root HAS a test convention**: `node --test` (built-in), with sibling tests (`scripts/orquestracao/registrar_execucao.test.js` using `mkdtempSync`/tmpdir). The deterministic promote script (`scripts/content/promover_artigo.js`) is **unit-testable** and SHOULD be tested. The site side stays on the `next build` gate (D-08).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `node --test` (built-in) — brand-OS repo pattern |
| **Config file** | none — root `package.json` `"test"` runs `node --test`; **add the glob `scripts/content/*.test.js`** to it (Wave 0) |
| **Quick run command** | `node --test scripts/content/promover_artigo.test.js` |
| **Full suite command** | `npm test` (root) + `cd site && npm run build` |
| **Estimated runtime** | unit ~1–3s; site build ~6–90s |

---

## Sampling Rate

- **After every task commit:** `node --test scripts/content/promover_artigo.test.js`
- **After every plan wave:** `npm test` (root) + `cd site && npm run build`
- **Before `/gsd:verify-work`:** root suite green + site build green + **one real article promoted via `/novo-artigo` appears in `/blog`**
- **Max feedback latency:** ~3s (unit), ~90s (build)

---

## Per-Task Verification Map

> Threat refs map to the STRIDE table in 06-RESEARCH.md §Security Domain.

| Task family | Wave | Requirement | Threat Ref | Secure/Correct Behavior | Test Type | Automated Command | File Exists | Status |
|---|---|---|---|---|---|---|---|---|
| Promote script — assemble valid BLOG-01 | 1 | BLOG-11 | V5 | from args → frontmatter with all 8 fields, gray-matter-serialized, round-trips through the mirrored validator | unit | `node --test scripts/content/promover_artigo.test.js` | ❌ W0 | ⬜ pending |
| Reject invalid `author` (≠ AUTHORS) | 1 | BLOG-11 | V5 | `--author "Dino Team"` → exit 1, clear message (build would also throw via AuthorBlock) | unit | idem | ❌ W0 | ⬜ pending |
| Reject `category` outside enum | 1 | BLOG-11 | V5 | `--category foo` → exit 1 | unit | idem | ❌ W0 | ⬜ pending |
| Slug-collision detected | 1 | BLOG-11 (D-09) | — | seed a `.mdx`, re-promote same slug → exit 1 (loader does NOT catch this — silent shadow) | unit | idem | ❌ W0 | ⬜ pending |
| Slug path-traversal guard | 1 | BLOG-11 | V12 / Tampering | `slug` validated `^[a-z0-9][a-z0-9-]*$`; resolved dest must stay under `site/content/blog/` | unit | idem | ❌ W0 | ⬜ pending |
| Written `.mdx` re-parses (round-trip) | 1 | BLOG-11 | — | write to tmp (env path override), re-read, validate 8 fields | unit | idem | ❌ W0 | ⬜ pending |
| Default cover exists | 1 | BLOG-11 (D-07) | — | `site/public/blog/covers/_default.webp` present so listing renders (missing cover doesn't break build but 404s at runtime) | source | `test -f site/public/blog/covers/_default.webp` | ❌ W0 | ⬜ pending |
| Skill promote step + D-11 edits | 2 | BLOG-11 | — | SKILL.md gains promote step (after brand gate); description + `## Fluxo` + conclusion updated; CLAUDE.md pointer updated; 9 skill-rules respected (fix `3.⏸`) | source | grep SKILL.md + CLAUDE.md for new step / removed "fora de escopo" | ❌ W0 | ⬜ pending |
| Auto-commit scoped | 2 | BLOG-11 (D-10) | Tampering | `git add` ONLY the article `.mdx` (+ default cover if new) — never `git add .` | source | grep SKILL.md/script for scoped add, no `git add .` | ❌ W0 | ⬜ pending |
| Promoted article passes build + appears in /blog | 3 | BLOG-11 (crit 2) | — | a real promoted article → `next build` exit 0 + route present, no slug collision | integration/manual | `cd site && npm run build` + view `/blog` | ✅ cmd exists | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/content/promover_artigo.js` — the deterministic, **deps-free** promote script (mirrors BLOG-01; built-in `node:fs`/`node:path`; no `zod`/`gray-matter` import — root resolves `zod@3` and lacks `gray-matter`, a known footgun).
- [ ] `scripts/content/promover_artigo.test.js` — unit tests (env path override + `mkdtempSync`/tmpdir, mirroring `registrar_execucao.test.js`).
- [ ] Add `scripts/content/*.test.js` to the root `package.json` `"test"` glob.
- [ ] `site/public/blog/covers/_default.webp` — committed default cover (D-07).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| End-to-end `/novo-artigo` run | BLOG-11 crit 1 | The skill is LLM-orchestrated (briefing → draft → brand gate → promote) | Run `/novo-artigo <tema>` through to the promote step; confirm a valid `site/content/blog/<slug>.mdx` is written with all 8 fields on the first try |
| Article appears in `/blog`, brand tone | BLOG-11 crit 2/3 | Visual + editorial judgment | `cd site && npm run dev`; confirm the new article shows in `/blog` + opens at `/blog/<slug>`; confirm `revisor-brand` approved the copy (sereno, no promise-of-result) |
| Lint is NOT the gate | (guardrail) | Pre-existing red | Note: `npm run lint` exits non-zero on 2 pre-existing errors (ConsentProvider/ShareBar) — the gate is `next build`, not lint |

---

## Validation Sign-Off

- [ ] Promote script has unit tests covering: valid assemble, invalid author, invalid category, slug collision, path-traversal guard, round-trip
- [ ] Root `npm test` green (incl. new `scripts/content/*.test.js`)
- [ ] `cd site && npm run build` green with a promoted article present
- [ ] Default cover file committed and exists
- [ ] `git add` scope verified (article + cover only, never `git add .`)
- [ ] One real `/novo-artigo` run produces a valid site article that appears in `/blog`
- [ ] `nyquist_compliant: true` set once task IDs are filled against this map

**Approval:** pending
