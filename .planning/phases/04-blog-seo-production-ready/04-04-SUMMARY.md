---
phase: 04-blog-seo-production-ready
plan: 04
subsystem: blog-discovery
tags: [rsc, ssg, seo, json-ld, breadcrumb, category-routes, listing, next16, schema-dts]

# Dependency graph
requires:
  - phase: 04-02
    provides: "lib/blog.ts (getAllPosts/getPostsByCategory + Post type), lib/site.ts (CATEGORIES/SITE_URL/WHATSAPP_URL), JsonLd primitive"
  - phase: 04-03
    provides: "PostCard (featured|grid) + the article-route shell/JSON-LD/await-params pattern this plan mirrors"
provides:
  - "SSG /blog listing route (featured + grid) with static generateMetadata + canonical"
  - "Dynamic SSG /blog/categoria/[slug] route — 4 indexable category pages with generateStaticParams over CATEGORIES, per-route generateMetadata + canonical, and BreadcrumbList JSON-LD"
  - "CategoryNav (RSC server Links) — reusable category navigation, no client pills (D-08)"
  - "/blog footer nav link (deferred from 04-03 to its owning plan)"
affects: [04-05, sitemap, robots, blog-discovery]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Category filtering as dedicated indexable routes /blog/categoria/[slug] via generateStaticParams over the fixed 4-CATEGORIES enum — server-rendered Links, NOT client pills (D-08)"
    - "Featured selection: the single post with featured:true, falling back to posts[0] (most-recent, loader already sorts date-desc) when none or multiple are flagged (D-07)"
    - "BreadcrumbList JSON-LD on category pages authored as a typed schema-dts object passed to <JsonLd> (the only <-escape chokepoint), all item URLs absolute via SITE_URL"
    - "Listing/category pages inherit the privacidade header/main-offset/footer shell verbatim; categories differentiated by label text only (no color/pill/badge)"

key-files:
  created:
    - site/components/blog/CategoryNav.tsx
    - site/app/blog/page.tsx
    - site/app/blog/categoria/[slug]/page.tsx
  modified: []

key-decisions:
  - "D-07: featured = the one post with featured:true; most-recent (posts[0]) fallback when none/multiple flagged"
  - "D-08: category filtering = dedicated indexable routes /blog/categoria/[slug] (server Links), NOT client pills"
  - "D-03 honored: no category->pillar coupling built (out of scope, Phase 6)"
  - "Added the /blog footer nav link here (its owning plan per 04-03's deferral note) so the link resolves at runtime"
  - "CategoryNav API: <CategoryNav current={slug | 'todos'} /> — single prop, RSC"

patterns-established:
  - "CategoryNav is the single source for the Todos+4-category server-Link nav; listing passes current='todos', each category page passes current={slug}"
  - "Both /blog and /blog/categoria/[slug] reuse the same featured/grid PostCard variants from 04-03 — no card re-implementation"

requirements-completed: [BLOG-02, BLOG-06, SEO-02, SEO-05]

# Metrics
duration: 3min
completed: 2026-06-12
---

# Phase 4 Plan 04: Blog Listing + Category Routes Summary

**The blog's discovery slice is live: `/blog` shows a featured article over a grid of the rest, and 4 real indexable category routes `/blog/categoria/[slug]` narrow the catalog via server-rendered Links — each with its own metadata + canonical and a BreadcrumbList JSON-LD, all built on the Wave-2 loader/registries/JsonLd and the Wave-3 PostCard.**

## Performance

- **Duration:** 3 min
- **Tasks:** 2
- **Files created:** 3 (1 component + 2 routes); 0 modified

## Accomplishments

- `site/components/blog/CategoryNav.tsx` — RSC nav of server `<Link>`s: "Todos" → `/blog` + one link per `CATEGORIES` → `/blog/categoria/{slug}`. Current = `text-fg`, others = `text-muted hover:text-fg`, all `text-sm uppercase tracking-[0.2em]` + focus-visible ring. Differentiated by label text only — no color, no pill, no badge (UI-SPEC §Color). `aria-current="page"` on the active link.
- `site/app/blog/page.tsx` — RSC SSG listing. Inherits the privacidade header/main-offset/footer shell, adds the `/blog` footer nav link, renders `<CategoryNav current="todos" />`, the featured `PostCard` (variant="featured") on top, then the rest as a `sm:grid-cols-2 lg:grid-cols-3` grid of grid-variant PostCards. Static `metadata`: title `Artigos · Dino Team`, canonical `/blog`, OG.
- `site/app/blog/categoria/[slug]/page.tsx` — RSC dynamic SSG. `generateStaticParams` enumerates exactly the 4 `CATEGORIES`; an unknown slug hits `notFound()` (404). Page + `generateMetadata` both `await params` (Next 16). Filters via `getPostsByCategory(slug)`, renders the grid + `<CategoryNav current={slug} />`, and emits a `BreadcrumbList` JSON-LD (Início → Blog → Categoria) through `<JsonLd>`. Title `{Categoria} · Dino Team`, canonical `/blog/categoria/{slug}`, OG.
- `next build` exits 0 and statically generates `/blog` (○ Static) + the 4 category routes (● SSG: treino, nutricao, mentalidade, bastidores); both seed `/blog/[slug]` articles still SSG.

## Featured-Selection Fallback Rule (D-07)

`selectFeatured(posts)` in `app/blog/page.tsx`: take `posts.filter(p => p.featured)`. If exactly one is flagged, use it; otherwise (none flagged OR multiple flagged) fall back to `posts[0]`, which is the most-recent because the loader already sorts date-desc. With the current seeds, the `featured: true` treino article is selected; the nutricao article goes to the grid.

## CategoryNav API

`<CategoryNav current={string} />` — single prop. Pass `current="todos"` from `/blog` and `current={slug}` from a category page. It renders the fixed nav (Todos + 4 categories) itself from `CATEGORIES`; callers do not pass the item list. RSC (no `"use client"`).

## Canonical + Breadcrumb JSON-LD verification (per route, from generated HTML)

- `/blog` → `<title>Artigos · Dino Team</title>`, `<link rel="canonical" href="https://dinoteam.vercel.app/blog">`. No JSON-LD on the listing (none required — Breadcrumb lives on the deeper category/article pages).
- `/blog/categoria/treino` → `<title>Treino · Dino Team</title>`, `<link rel="canonical" href="https://dinoteam.vercel.app/blog/categoria/treino">`, exactly **one** `<script type="application/ld+json">` with `@type BreadcrumbList` whose 3 `item` URLs are absolute via `SITE_URL` (Início `…/`, Blog `…/blog`, Categoria `…/blog/categoria/treino`). The mandatory `<`-escape lives in `<JsonLd>` (proven in 04-03); this payload contains no `<` to escape and no raw `</script` breakout.
- The other 3 category routes (nutricao, mentalidade, bastidores) follow the identical pattern — all SSG-generated, each with its own canonical + Breadcrumb.

## Deviations from Plan

**1. [Rule 3 - Scope] Added the `/blog` footer nav link (resolving 04-03's explicit deferral)**
- **Found during:** Task 1 (composing the inherited footer shell).
- **Issue:** 04-03 deliberately did NOT add the `/blog` footer `<Link>` because the listing route did not exist yet, deferring it to "its owning plan." This plan creates `/blog`, so the link now resolves.
- **Fix:** Added `<Link href="/blog">Blog</Link>` to the footer `<nav>` on both new routes (alongside Privacidade/Termos). No change to the inherited shell beyond that one link.
- **Files modified:** `site/app/blog/page.tsx`, `site/app/blog/categoria/[slug]/page.tsx`.
- **Commits:** `0862d2d`, `e146614`.

Otherwise the plan executed exactly as written. Note: the article route `/blog/[slug]` (04-03) still carries only Privacidade/Termos in its footer — adding `/blog` there is left to 04-05's footer/cross-link pass to avoid touching a prior plan's committed file out of scope.

## Authentication Gates

None.

## Task Commits

1. **Task 1: CategoryNav (server Links) + /blog listing (featured + grid + empty state)** — `0862d2d` (feat)
2. **Task 2: Category route /blog/categoria/[slug] — filtered listing + generateStaticParams + generateMetadata + Breadcrumb JSON-LD** — `e146614` (feat)

## Known Stubs

None introduced by this plan. The cover-asset placeholder and Ramon-photo placeholder remain (inherited from 04-02/04-03, intentional brand discipline) — they are rendered by `PostCard`, not by this plan's code. No data faked.

## Threat Surface

No new threat surface beyond the plan's `<threat_model>`. T-04-09 mitigated: `generateStaticParams` enumerates only the 4 fixed `CATEGORIES`; any other slug hits `notFound()` (no filesystem path derived from the param). T-04-10 mitigated: BreadcrumbList flows through the existing `<JsonLd>` `<`-escape chokepoint, no hand-serialized `<script>`. T-04-11 mitigated: all canonical/breadcrumb absolute URLs derive from build-time `SITE_URL`; the slug is constrained to the 4-enum.

## Self-Check: PASSED

All 3 created files exist on disk; both task commits (`0862d2d`, `e146614`) present in git history; `next build` exits 0 and SSG-generates `/blog` + the 4 `/blog/categoria/[slug]` routes; generated HTML confirms per-route `<title> · Dino Team`, absolute `rel=canonical`, and a single `BreadcrumbList` JSON-LD with absolute items on the category pages.

---
*Phase: 04-blog-seo-production-ready*
*Completed: 2026-06-12*
