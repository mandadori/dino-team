---
phase: 4
slug: blog-seo-production-ready
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-11
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> NOTE: `site/` has **zero unit-test infrastructure** today (CONCERNS.md). This phase is a content/SEO/SSG slice, so the deterministic gate is **`next build`** (frontmatter validation throws → build fails) plus **smoke tests and view-source/behavior checks**. A unit framework is intentionally NOT introduced in v1 — the build is the primary automated assertion.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none installed — `next build` assertions + smoke tests + manual behavior checks |
| **Config file** | none (Wave 0 installs the 9 `[ASSUMED]` deps behind human-verify) |
| **Quick run command** | `cd site && npm run build` |
| **Full suite command** | `cd site && npm run build && npm run lint` |
| **Estimated runtime** | ~30–90 seconds (build) |

---

## Sampling Rate

- **After every task commit:** `cd site && npm run build` (catches frontmatter/zod build-fail + type errors)
- **After every plan wave:** `cd site && npm run build && npm run lint`
- **Before `/gsd:verify-work`:** build green + the Manual-Only behavior checks below all pass
- **Max feedback latency:** ~90 seconds

---

## Per-Task Verification Map

> Plans not yet written (planning happens after the UI-SPEC gate). This map seeds the requirement→proof contract by family; the planner/executor fills concrete task IDs against it.

| Task family | Wave | Requirement | Secure/Correct Behavior | Test Type | Automated Command | File Exists | Status |
|---|---|---|---|---|---|---|---|
| MDX × Turbopack smoke | 0 | BLOG-02/03 | `dev`+`build` succeed on `_smoke.mdx`; MDX renders | smoke | `cd site && npm run dev` + `npm run build` | ❌ W0 | ⬜ pending |
| `npm install` 9 deps | 0 | (enabler) | deps present, `[ASSUMED]` human-verified | checkpoint | `cd site && npm install` | ❌ W0 | ⬜ pending |
| Frontmatter zod loader | 1 | BLOG-01 | invalid frontmatter **fails** `next build` | build-fail | `cd site && npm run build` (with bad fixture) | ❌ W0 | ⬜ pending |
| Listing + article + category | 2 | BLOG-02/06 | routes render (SSG), featured+grid, category pages | behavior | `cd site && npm run build` + view `/blog`, `/blog/[slug]`, `/blog/categoria/[slug]` | ❌ W0 | ⬜ pending |
| EEAT components | 2 | BLOG-04/05/07/08/09/10 | author block, reading time, TOC, related, share, WhatsApp CTA present | behavior | manual page inspection | ❌ W0 | ⬜ pending |
| SEO metadata + sitemap/robots | 3 | SEO-01/02/03/04 | absolute canonical/OG from env; sitemap+robots correct | behavior | view-source + `GET /sitemap.xml`, `/robots.txt` | ❌ W0 | ⬜ pending |
| Typed JSON-LD | 3 | SEO-05 | Article+Breadcrumb+Person+Org valid JSON, `<` escaped | behavior | view-source JSON-LD parse | ❌ W0 | ⬜ pending |
| og:image | 3 | SEO-06 | static `opengraph-image.png` served on share | behavior | view-source `og:image` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] **MDX × Turbopack smoke test** — `_smoke.mdx` builds + dev-renders under the `turbopack.root` override (BLOCKING gate; fallback chain: `transpilePackages` → Velite).
- [ ] **`checkpoint:human-verify` before `npm install`** — the 9 `[ASSUMED]` packages (`next-mdx-remote-client`, `zod`, `gray-matter`, `schema-dts`, `reading-time`, `rehype-slug`, `rehype-autolink-headings`, `remark-gfm`, `github-slugger`) are registry-verified but not slop-audited.
- [ ] No unit framework installed — phase validates via `next build` + behavior checks (documented decision, not a gap).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| SEO metadata correctness | SEO-01/02/03 | needs rendered-HTML inspection | view-source of `/blog`, an article, a category → assert `<title>`, meta description, `link[rel=canonical]`, `og:*` all absolute from `NEXT_PUBLIC_SITE_URL` |
| JSON-LD validity | SEO-05 | structured-data correctness | copy each `application/ld+json` block → validate JSON + `@type` set (Article/BreadcrumbList/Person/Organization); confirm `<` escaped |
| sitemap / robots | SEO-01/04 | route output inspection | `GET /sitemap.xml` lists /blog + 4 categories + all articles; `GET /robots.txt` references sitemap |
| EEAT element presence | BLOG-04/05/07/08/09/10 | visual/interaction | open an article → author block (name+credential+photo), reading time, TOC (sticky desktop/collapsible mobile), 2–3 same-category related, native share + copy fallback, WhatsApp CTA at end |
| og:image render | SEO-06 | visual | confirm static `opengraph-image.png` (mono, Anton, no Ramon photo) resolves for an article share |
| Stub articles on-brand | BLOG-03 | editorial judgment | brand-review gate on the 4–6 example articles (no promise-of-result, no "atalho/fórmula", no empty motivation) |

---

## Validation Sign-Off

- [ ] All tasks have an automated build/smoke verify or a Manual-Only entry above
- [ ] Sampling continuity: `next build` runs after every commit (no 3 consecutive tasks without a build)
- [ ] Wave 0 covers the MDX×Turbopack smoke + dep install gate
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set once plans map every task to a verify

**Approval:** pending
