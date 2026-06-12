---
phase: 04-blog-seo-production-ready
plan: 01
subsystem: site/blog
tags: [mdx, turbopack, ssg, dependencies, smoke-test]
requires: []
provides:
  - "9 MDX/SEO dependencies installed and human-verified"
  - "empirically-validated MDX x Turbopack render path (next-mdx-remote-client/rsc evaluate)"
affects:
  - site/package.json
  - site/package-lock.json
tech-stack:
  added:
    - "next-mdx-remote-client@^2.1.11 (MDX -> RSC renderer)"
    - "zod@^4.4.3 (frontmatter schema)"
    - "gray-matter@^4.0.3 (frontmatter parser)"
    - "schema-dts@^2.0.0 (typed JSON-LD)"
    - "reading-time@^1.5.0 (read-time estimate)"
    - "rehype-slug@^6.0.0 (heading ids)"
    - "rehype-autolink-headings@^7.1.0 (heading anchors)"
    - "remark-gfm@^4.0.1 (GFM in MDX)"
    - "github-slugger@^2.0.0 (TOC<->id sync)"
  patterns:
    - "next-mdx-remote-client/rsc evaluate() inside async RSC, fs.readFileSync from process.cwd()/content/blog"
    - "generateStaticParams() enumerates .mdx slugs for SSG (build-time render)"
    - "Next 16: params is a Promise — await it in dynamic routes"
key-files:
  created: []
  modified:
    - site/package.json
    - site/package-lock.json
decisions:
  - "Render path: next-mdx-remote-client/rsc evaluate() (maintained fork) — no Turbopack incompatibility, validated empirically"
  - "Fallback path used: NONE — no transpilePackages needed; smoke passed on first try under turbopack.root override"
  - "next.config.ts left untouched (createMDX wrapper harmless, unused as renderer — RESEARCH Pitfall 5)"
metrics:
  duration: 10
  completed: 2026-06-12
  tasks: 2
  files: 2
---

# Phase 04 Plan 01: MDX × Turbopack Wave-0 Gate Summary

Installed and human-verified the 9 `[ASSUMED]` MDX/SEO dependencies, then empirically proved `next-mdx-remote-client/rsc` `evaluate()` renders MDX (h2 with rehype-slug id, GFM table, fenced code, lists) under the existing `turbopack.root` override via SSG — both `npm run build` and `npm run dev` passed with no fallback, clearing the phase's single flagged risk.

## What Was Built

This was a blocking Wave-0 gate, not feature code. Two outcomes:

1. **Dependency install (Task 1):** All 9 packages from RESEARCH §7 installed in one `npm install` from `site/` after the human approved the legitimacy checkpoint (T-04-SC). `npm install` exited 0; all 9 appear in `site/package.json`; `node_modules/next-mdx-remote-client` exists.

2. **MDX × Turbopack smoke (Task 2):** A throwaway `content/blog/_smoke.mdx` (h2/h3, unordered list, fenced code block, GFM table) was rendered through a temporary SSG route (`app/smoke-test/[slug]/page.tsx`) using `next-mdx-remote-client/rsc` `evaluate()` with `remark-gfm` + `rehype-slug` + `rehype-autolink-headings`, awaiting the Next 16 `params` Promise.
   - `npm run build` exited 0 — the route prerendered as SSG (`● /smoke-test/[slug]` → `/smoke-test/_smoke`). The prerendered HTML at `.next/server/app/smoke-test/_smoke.html` contained `<h2 id="smoke-heading-h2">` (rehype-slug working), `<table>` (remark-gfm working), `<code>`, and `<ul>`.
   - `npm run dev` (port 3000) served the same route with h2/table/code/list all present.
   - After PASS: deleted `content/blog/_smoke.mdx` and the entire smoke route dir; final `npm run build` is green with no smoke route in the table.

**Fallback path: NONE.** The smoke passed on the first attempt under the exact `turbopack.root` override — `transpilePackages` was not needed, and no escalation to Velite occurred.

## Smoke Artifact Cleanup — Confirmed

- `site/content/blog/_smoke.mdx` — DELETED.
- The smoke route directory — DELETED.
- `site/next.config.ts` — untouched (no `transpilePackages`).
- Final `git status --short site/` is clean; the empty `content/blog/` dir is untracked (git does not track empty dirs; Wave 1's loader will populate it).

## Implementation Note (deviation from literal plan wording)

The plan's literal example named the smoke route `site/app/_smoke/[slug]/`. A leading-underscore folder is a **Next.js private folder** — it is excluded from routing and never compiled, so a build passing with it present would NOT prove the render path (the route would be dead code). Per Rule 1 (correctness), the smoke route was created at `app/smoke-test/[slug]/` (non-private) with `generateStaticParams`, which forces the MDX through `next-mdx-remote-client/rsc` at build time via SSG — exactly mirroring the real `/blog/[slug]` pattern. This makes the smoke a genuine proof rather than a no-op. The content-file slug `_smoke.mdx` keeps its underscore (a content slug, not a route segment). Both the route dir and the MDX were deleted after the smoke passed, so the final tree is identical regardless.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Smoke route moved out of a Next.js private folder**
- **Found during:** Task 2
- **Issue:** `app/_smoke/` (the plan's literal path) is a Next.js private folder (leading underscore), excluded from routing — the smoke route never compiled, so a passing build did not actually exercise the MDX render path.
- **Fix:** Created the route at `app/smoke-test/[slug]/` with `generateStaticParams` so SSG compiles and renders the MDX at build time; verified the prerendered HTML contains the rendered elements.
- **Files modified:** smoke route (throwaway, deleted after PASS)
- **Commit:** a15e8b1

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Install 9 human-verified MDX/SEO deps | 4c1c56e | site/package.json, site/package-lock.json |
| 2 | MDX × Turbopack Wave-0 smoke + cleanup | a15e8b1 | (throwaway smoke artifacts, deleted) |

## Authentication Gates

None.

## Verification

- `cd site && npm run build` → exit 0, "Compiled successfully", no `_smoke`/`smoke-test` in route table.
- All 9 deps present in `site/package.json` and `node_modules`.
- Smoke render of h2 (with rehype-slug id) / list / GFM table / code observed in prerendered HTML and via dev server before cleanup.

## Self-Check: PASSED
