---
phase: 04-blog-seo-production-ready
plan: 05
subsystem: seo
tags: [next, sitemap, robots, opengraph, mdx, blog]

# Dependency graph
requires:
  - phase: 04-04
    provides: /blog listing + /blog/categoria/[slug] routes, CategoryNav, related-by-category
  - phase: 04-02
    provides: lib/blog.ts loader (getAllPosts, zod schema), lib/site.ts (CATEGORIES, SITE_URL), seed articles
  - phase: 04-03
    provides: /blog/[slug] article route, EEAT/JSON-LD stack
provides:
  - sitemap.ts enumerating /blog + 4 category routes + every article, absolute via SITE_URL (SEO-03)
  - robots.ts allow-all + sitemap pointer (SEO-04)
  - static monochrome opengraph-image.png (1200x630, no Ramon photo) as the default OG image (SEO-06)
  - 2 more on-brand stub articles populating Mentalidade + Bastidores so all 4 categories have content
  - /blog footer link on home, privacidade, termos
  - brand-review gate (D-10) approved on all 4 stub articles
affects: [phase-05, deploy, og-dinamico-v2]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "MetadataRoute.Sitemap/Robots file-convention routes — zero handler code, Next serves /sitemap.xml + /robots.txt"
    - "Static app/opengraph-image.png file convention as default OG image (no ImageResponse, zero code)"
    - "getAllPosts() inside sitemap() doubles as a build-time frontmatter re-assertion (BLOG-01)"

key-files:
  created:
    - site/app/sitemap.ts
    - site/app/robots.ts
    - site/app/opengraph-image.png
    - site/app/opengraph-image.alt.txt
    - site/content/blog/a-mentalidade-do-processo-acima-do-resultado.mdx
    - site/content/blog/bastidores-o-que-ninguem-ve-antes-do-palco.mdx
  modified:
    - site/app/page.tsx
    - site/app/privacidade/page.tsx
    - site/app/termos/page.tsx

key-decisions:
  - "D-09: 4 example stub articles total, one per category (treino, nutricao, mentalidade, bastidores) — minimum to give related-by-category real cross-category neighbors in every category"
  - "D-10: every stub respects brand/tom-de-voz.md and the pillar off-limits (no promise of prazo/resultado, no 'atalho/fórmula', no empty motivation) and passed the blocking brand-review gate (human-approved)"
  - "og:image is a static monochrome Anton wordmark asset, NO Ramon photo until the real B&W archive lands (T-04-14 accept; SEO-06)"

patterns-established:
  - "Pattern: SEO surface (sitemap/robots/og) lives entirely in Next file-convention routes — env-derived absolute URLs, no request input (T-04-12)"
  - "Pattern: stub articles carry example:true and anchor on a ## Verdades truth (o processo é o prêmio / direção não motivação)"

requirements-completed: [SEO-03, SEO-04, SEO-06, BLOG-03, BLOG-06, BLOG-08]

# Metrics
duration: 14min
completed: 2026-06-12
---

# Phase 04 Plan 05: Site-wide SEO surface + content completion Summary

**sitemap.ts (9 entries: /blog + 4 categories + 4 articles, absolute via SITE_URL), robots.ts allow-all + sitemap pointer, a static 1200×630 monochrome og:image, 2 more on-brand stubs completing all 4 categories, and the /blog footer link site-wide — all brand-approved, closing Phase 04.**

## Performance

- **Duration:** ~14 min (across original executor + continuation)
- **Completed:** 2026-06-12
- **Tasks:** 3 (2 auto + 1 human-verify checkpoint)
- **Files modified:** 9

## Accomplishments
- `sitemap.ts` enumerates 9 absolute URLs (1 `/blog` + 4 category routes + 4 articles), all derived from `SITE_URL`; `getAllPosts()` re-asserts frontmatter validity at build (BLOG-01).
- `robots.ts` returns allow-all (`userAgent: "*"`, `allow: "/"`) and points to `${SITE_URL}/sitemap.xml`.
- Static `opengraph-image.png` (1200×630, RGBA, monochrome Anton wordmark, no Ramon photo) + `opengraph-image.alt.txt` ("Dino Team — consultoria de treino e dieta. O topo exige direção.") served as the default OG image with zero code.
- Two more `example:true` stub articles (`a-mentalidade-do-processo-acima-do-resultado.mdx` → mentalidade, `bastidores-o-que-ninguem-ve-antes-do-palco.mdx` → bastidores) complete all 4 categories — every category route and related-by-category now have real cross-category data.
- `/blog` footer Link added to `page.tsx`, `privacidade/page.tsx`, `termos/page.tsx` (same className, focus-visible ring).
- D-10 brand-review gate: human reviewed all 4 stubs and approved — tom sereno/anti-espetáculo, second-person "você", no promise-of-result, no "atalho/fórmula", no empty motivation.

## Task Commits

Each task was committed atomically:

1. **Task 1: sitemap.ts + robots.ts + static og:image + /blog footer link** - `e7cb66a` (feat)
2. **Task 2: Two more on-brand stub articles — Mentalidade + Bastidores** - `a30fcd0` (feat)
3. **Task 3: Brand-review gate (D-10) + EEAT/SEO behavior verification** - human-approved checkpoint (no code commit; verification only)

**Plan metadata:** this SUMMARY + STATE/ROADMAP/REQUIREMENTS update (docs commit).

## Files Created/Modified
- `site/app/sitemap.ts` - MetadataRoute.Sitemap enumerating /blog + 4 categories + every article, absolute via SITE_URL.
- `site/app/robots.ts` - MetadataRoute.Robots allow-all + sitemap pointer.
- `site/app/opengraph-image.png` - Static 1200×630 monochrome OG image (Anton wordmark, no Ramon photo).
- `site/app/opengraph-image.alt.txt` - On-brand OG alt text.
- `site/content/blog/a-mentalidade-do-processo-acima-do-resultado.mdx` - Mentalidade stub (ramon-dino, featured:false).
- `site/content/blog/bastidores-o-que-ninguem-ve-antes-do-palco.mdx` - Bastidores stub (ramon-dino, featured:false).
- `site/app/page.tsx` - Footer /blog Link.
- `site/app/privacidade/page.tsx` - Footer /blog Link.
- `site/app/termos/page.tsx` - Footer /blog Link.

## Decisions Made
- None beyond the plan's D-09 / D-10 (recorded in frontmatter). Plan executed as specified.

## Deviations from Plan

None - plan executed exactly as written.

## Deferred Issues

`npm run lint` reports **2 pre-existing `react-hooks/set-state-in-effect` errors** that are OUT OF SCOPE for this plan (SCOPE BOUNDARY — they are not in any file 04-05 created or modified):

| File | Line | Rule | Origin |
|------|------|------|--------|
| `site/components/blog/ShareBar.tsx` | 72 | react-hooks/set-state-in-effect (`setCanShare` in useEffect) | created in 04-03 (`29fcefd`) |
| `site/components/ConsentProvider.tsx` | 68 | react-hooks/set-state-in-effect (`setConsent`/`setDecided` in useEffect) | created in 03-01 (`b069abf`) |

These are the canonical "feature-detect in effect, then setState" pattern (navigator.share probe / localStorage consent read) and do not affect runtime correctness. `next build` is fully green. Recommend addressing in a follow-up cleanup (e.g. lazy `useState` initializer or `useSyncExternalStore`) — not blocking the Phase 04 close.

## Issues Encountered
- The Task 3 brand-review gate is a blocking `checkpoint:human-verify`; the original executor stopped there with all 4 stubs presented ON-BRAND. The human operator reviewed and replied "approved", clearing D-10. This continuation executor confirmed build-green + the pre-existing lint deltas and finalized the plan.

## Known Stubs
- All 4 blog articles carry `example: true` (intentional D-09 example content seeding the categories). Covers reference placeholder paths under `/blog/covers/...`. These are deliberate seed articles, not unwired UI — real editorial content arrives via the `/novo-artigo` skill. The blog infrastructure (loader, routes, SEO, related-by-category) is fully wired and validated against them.

## User Setup Required
- `NEXT_PUBLIC_SITE_URL` must be set in the deploy environment before OG/canonical/sitemap emit production-absolute URLs (carried blocker from Phase 04 entry — `lib/site.ts` env-fallback keeps build green locally).

## Next Phase Readiness
- Phase 04 (blog-seo-production-ready) is complete: blog listing, article + category routes, full EEAT/JSON-LD stack, sitemap/robots/og:image, and all 4 categories populated and brand-approved.
- Deploy-time: set `NEXT_PUBLIC_SITE_URL`; replace the monochrome og:image + Ramon author placeholder photo when the real B&W archive lands (BLOG-12 dynamic OG is v2/deferred).

---
*Phase: 04-blog-seo-production-ready*
*Completed: 2026-06-12*
