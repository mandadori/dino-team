---
phase: 04-blog-seo-production-ready
plan: 03
subsystem: blog-article
tags: [mdx, rsc, ssg, eeat, json-ld, seo, toc, share, next16, schema-dts]

# Dependency graph
requires:
  - phase: 04-01
    provides: 9 MDX/SEO deps installed + MDX×Turbopack render path validated
  - phase: 04-02
    provides: "lib/blog.ts loader (getAllPosts/getPostBySlug/getPostsByCategory + Post type), lib/site.ts registries (AUTHORS/CATEGORIES/SITE_URL/WHATSAPP_URL), JsonLd primitive"
provides:
  - "Dynamic SSG article route /blog/[slug] rendering MDX + full EEAT stack + generateMetadata + Article/Person/Organization/Breadcrumb JSON-LD"
  - "Presentational EEAT components (RSC): ProseDino (MDX components map), AuthorBlock, PostCard (featured|grid), RelatedPosts"
  - "Two client islands (reduced-motion gated): Toc (IntersectionObserver scroll-spy) + ShareBar (Web Share + copy-link fallback)"
  - "PostCard component reusable by the /blog listing (04-04) and category (04-05) routes"
affects: [04-04, 04-05, blog-listing, blog-category, sitemap]

# Tech tracking
tech-stack:
  added: []  # all deps installed in 04-01
  patterns:
    - "MDX render via next-mdx-remote-client/rsc evaluate({source,options.mdxOptions.{remarkPlugins,rehypePlugins},components}) -> { content }"
    - "TOC headings extracted from raw MDX body with github-slugger (same lib rehype-slug uses) so anchor ids stay in sync; code fences skipped"
    - "Client islands confined to Toc + ShareBar; everything else (route, prose map, author, related, JSON-LD) is RSC/SSG"
    - "JSON-LD entities cross-linked by absolute @id (Article.author/publisher -> Person/Organization @id) via SITE_URL"

key-files:
  created:
    - site/components/blog/ProseDino.tsx
    - site/components/blog/AuthorBlock.tsx
    - site/components/blog/PostCard.tsx
    - site/components/blog/RelatedPosts.tsx
    - site/components/blog/Toc.tsx
    - site/components/blog/ShareBar.tsx
    - site/app/blog/[slug]/page.tsx
  modified: []

key-decisions:
  - "D-04: author resolved per article from the AUTHORS registry (AuthorBlock accepts AuthorKey | Author)"
  - "D-05: Ramon photo undefined -> intentional 'Foto do autor' placeholder slot (not an error)"
  - "D-06: AuthorBlock = P&B photo + name + credential; Person-per-author + Organization JSON-LD (EEAT)"
  - "D-11: single uniform WhatsApp consultoria CTA at the article END, sober, not varied by category; sign-off 'O topo exige direção.' + 'Quero minha direção'"
  - "rehype-autolink-headings behavior: wrap (clickable heading anchors)"
  - "TOC threshold = 3 headings (executor); rendered both as desktop sticky rail and mobile <details>"
  - "RelatedPosts recency tie-break = loader's date-desc order, take top 3 same-category excluding current"

patterns-established:
  - "MDX components map (proseComponents) is the single source of brand prose rhythm — applied via the evaluate components arg, not per-element"
  - "Headings for the TOC are derived from the same github-slugger that rehype-slug uses, guaranteeing id parity without re-walking the rendered tree"
  - "JSON-LD authored as typed schema-dts objects passed to <JsonLd> (the only <-escape chokepoint) — never hand-serialized"

requirements-completed: [BLOG-03, BLOG-04, BLOG-05, BLOG-07, BLOG-08, BLOG-09, BLOG-10, SEO-02, SEO-05]

# Metrics
duration: 6min
completed: 2026-06-12
---

# Phase 4 Plan 03: Blog Article Route + EEAT Stack Summary

**The blog's core visitor slice is live: `/blog/[slug]` renders real MDX with the full EEAT stack (named author, reading time, TOC, related, native share, end CTA), correct per-article SEO metadata, and typed Article/Person/Organization/Breadcrumb JSON-LD — all built on the Wave-2 loader + registries + JsonLd primitive.**

## Performance

- **Duration:** 6 min
- **Tasks:** 3
- **Files created:** 7 (6 components + 1 route); 0 modified

## Accomplishments

- `/blog/[slug]/page.tsx` — dynamic SSG RSC route: `generateStaticParams()` from `getAllPosts()` (which finally wires the BLOG-01 build-fail throw into `next build`), `generateMetadata()` awaiting `params` (Next 16), MDX rendered via `next-mdx-remote-client/rsc` `evaluate` with `remark-gfm` + `rehype-slug` + `rehype-autolink-headings`, the full reading flow, and 4 JSON-LD blocks.
- 4 presentational RSC components (`ProseDino`, `AuthorBlock`, `PostCard`, `RelatedPosts`) and 2 reduced-motion-gated client islands (`Toc`, `ShareBar`).
- `next build` exits 0 and SSG-generates both seed articles; an unknown slug returns 404 (`notFound()`), not 500 — verified against `next start`.

## Component APIs

- `ProseDino.tsx` — exports `proseComponents: MDXComponents` (the map passed to `evaluate`'s `components`) and a `ProseDino` wrapper. h2 = `mt-12 scroll-mt-24 … sm:text-3xl`, h3 = `mt-8 scroll-mt-24 …` (same Tier-3 base `text-2xl`, differ by margin + the h2 step). Monochrome `code`/`pre`; `img` -> `<figure>` grayscale+contrast-125 with `alt` as caption; links underline-on-hover; 68ch measure; `first:mt-0`; prose stays caixa livre.
- `AuthorBlock.tsx` — props `{ author: AuthorKey | Author }`. With `photo` -> next/image grayscale+contrast-125; without (Ramon) -> intentional "Foto do autor" placeholder slot. `alt = "{name}, {credential}"`.
- `PostCard.tsx` — props `{ post: Post; variant?: "featured" | "grid" }`. Whole card = one `<Link href={'/blog/' + post.slug}>` (>=44px, focus ring). `featured` = Display-tier title over cover + `--scrim-hero`; `grid` = Heading-tier title + `description` excerpt + meta row. Cover absent -> intentional monochrome placeholder. Hover CSS-only (`border-fg/40` + title underline). Date `DD de mês de AAAA` pt-BR.
- `RelatedPosts.tsx` — props `{ posts: Post[] }`. Heading "Continue lendo" + grid of grid-variant PostCards. Empty -> renders nothing.
- `Toc.tsx` — `"use client"`. Props `{ headings: TocHeading[] }` where `TocHeading = { id; text; level }`. Renders only at >=3 headings. Sticky rail on lg / collapsible `<details>` on mobile. IntersectionObserver scroll-spy (`rootMargin: "-96px 0px -66% 0px"`). Reduced-motion -> instant anchor jump (no smooth-scroll/animated highlight). Each link >=44px + focus ring.
- `ShareBar.tsx` — `"use client"`. Props `{ title: string }`. Copy-link primary with `role="status"` `aria-live="polite"` confirmation ("Copiar link" -> "Link copiado", reverts ~2s). Web Share trigger gated on `navigator.share` existence (detected post-mount to avoid hydration mismatch), visible "Compartilhar" label + inline monochrome SVG (no icon-only, no third-party widget). Outline buttons >=44px; transition gated by `usePrefersReducedMotion`.

## How TOC headings are extracted

The route does **not** re-walk the rendered React tree. `extractHeadings(post.body)` scans the raw MDX body line-by-line for `##`/`###` (skipping ```/~~~ code fences), strips simple inline markup from the label, and slugs each with `new GithubSlugger().slug(text)`. Because `rehype-slug` uses the same `github-slugger`, the TOC anchor ids match the rendered heading ids exactly (verified: `id="a-intensidade-engana"`, `id="direção-antes-de-volume"`, accented ids preserved). `scroll-mt-24` on headings (in `proseComponents`) compensates the fixed header offset on jump.

## JSON-LD + absolute-URL verification

Emitted via `<JsonLd>` (the single `<`-escape chokepoint) as 4 typed `schema-dts` objects:

- **Article** — `@id`/`mainEntityOfPage` = `https://dinoteam.vercel.app/blog/{slug}`, `author` -> `{ "@id": Person }`, `publisher` -> `{ "@id": Organization }`, `image` (absolute) only when a cover path exists.
- **Person** — `@id` = `…/blog/autores/{authorKey}#person`, `name` + `description` (credential) from `AUTHORS`.
- **Organization** — `@id` = `…/#organization`, name "Dino Team".
- **BreadcrumbList** — Início -> Blog -> Category -> Article, all `item` absolute.

View-source of the generated HTML confirms: `<title>… · Dino Team`, `rel="canonical"` absolute, `og:type=article`, `og:url` absolute, and all four `@type`s present with absolute `@id`/`item`/`image`. The mandatory `.replace(/</g,"<")` is applied by the primitive (proven by a direct test: a `<` in the payload becomes `<`); the seed content simply contains no `<` to escape, and no raw `<` breaks out of any `ld+json` block.

## Task Commits

1. **Task 1: Presentational EEAT components (ProseDino, AuthorBlock, PostCard, RelatedPosts)** — `20b4c87` (feat)
2. **Task 2: Interactive islands (Toc + ShareBar), reduced-motion gated** — `29fcefd` (feat)
3. **Task 3: Article route /blog/[slug] — MDX + EEAT + generateMetadata + JSON-LD** — `185fd8e` (feat)

_TDD note: Tasks 1 and 3 were marked `tdd="true"`. `site/` has zero test runner; per 04-RESEARCH §Validation Architecture the canonical proof for this requirement family is the build + behavior assertion (RED would be a non-building route / missing EEAT element; GREEN = `next build` exits 0, SSG-generates the articles, view-source contains the EEAT + JSON-LD). No separate `test(...)` commits since there is no test harness in `site/`. The BLOG-01 build-fail throw is now genuinely exercised by `next build` because `generateStaticParams()` imports `getAllPosts()`._

## Deviations from Plan

**1. [Rule 3 - Scope] Did NOT add the `/blog` footer nav link**
- **Found during:** Task 3 (composing the inherited footer shell).
- **Issue:** The plan's `<interfaces>` note states "this phase adds a /blog footer nav link in plan 04-05" and the `/blog` listing route does not exist yet (it is plan 04-04). Adding a `<Link href="/blog">` now would 404 at runtime until 04-04 ships.
- **Fix:** Kept the footer's existing Privacidade/Termos links only; the `/blog` link is deferred to its owning plan as the plan instructs. No code beyond the inherited shell.
- **Files:** `site/app/blog/[slug]/page.tsx`.
- **Commit:** `185fd8e`.

## Issues Encountered

- **Stale `.next` validator artifact.** Before the build, `npx tsc --noEmit` surfaced one error in the generated `.next/dev/types/validator.ts` referencing the deleted Wave-0 `app/smoke-test/[slug]/page.js`. This is a stale build artifact (not a source file), out of scope, and cleared automatically when `next build` regenerated `.next` — final `tsc` is clean. No source change.
- **Acceptance-grep collision on the RSC components.** The Task-1 automated check greps the literal string `"use client"` to assert RSC; my doc comments mentioned it in prose ("sem \"use client\""). Reworded the four comments to "Server Component (sem diretiva de client)" so the grep is unambiguous — the components were always RSC (no directive); only the comment text changed.

## Known Stubs

| Stub | File | Reason / Resolution |
|------|------|---------------------|
| Cover assets `/blog/covers/*.webp` do not exist yet | both seed `.mdx` (inherited from 04-02) | Intentional (D-05 / UI-SPEC): `PostCard`/article-cover render the monochrome placeholder when the asset is absent; the article route omits the `<Image>` cover block and the `image` JSON-LD field entirely when `post.cover` resolves to a missing file is irrelevant (path is forward-declared). Real B&W covers land later. |
| `AUTHORS["ramon-dino"].photo: undefined` | `site/lib/site.ts` (inherited) | Intentional placeholder discipline (D-05) — `AuthorBlock` renders the "Foto do autor" slot, verified in the treino article's HTML. Resolved when the real P&B archive arrives. |

No new stubs introduced by this plan. No data is faked — the placeholders are deliberate brand discipline.

## Threat Surface

No new threat surface beyond the plan's `<threat_model>`. All JSON-LD flows through the existing `<JsonLd>` `<`-escape primitive (T-04-06 mitigated); MDX is rendered with **no** `rehype-raw` so raw HTML/scripts in content do not execute (T-04-05 mitigated); all canonical/OG/`@id` URLs derive from build-time `SITE_URL` and the slug comes from filesystem enumeration, never request body (T-04-07 mitigated); unknown slug -> `notFound()` 404 (T-04-08 accepted).

## Next Phase Readiness

- `PostCard` (featured|grid) is ready for the `/blog` listing (04-04) and `/blog/categoria/[slug]` (04-05); `RelatedPosts` shows the same-category grid pattern those routes will reuse.
- 04-05 owns adding the `/blog` footer nav link (per the plan's interface note) and the brand-review gate over seed copy.
- The MDX render path (`evaluate` + `proseComponents` + the 3 plugins) is the canonical pattern for any future MDX surface.

## Self-Check: PASSED

All 7 created files exist on disk; all 3 task commits (`20b4c87`, `29fcefd`, `185fd8e`) present in git history; `next build` exits 0 and SSG-generates both `/blog/[slug]` pages.

---
*Phase: 04-blog-seo-production-ready*
*Completed: 2026-06-12*
