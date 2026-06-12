---
phase: 04-blog-seo-production-ready
plan: 02
subsystem: api
tags: [mdx, zod, gray-matter, schema-dts, reading-time, seo, json-ld, content-layer, nextjs]

# Dependency graph
requires:
  - phase: 04-01
    provides: 9 MDX/SEO deps installed + MDX×Turbopack render path validated (next-mdx-remote-client, zod, gray-matter, schema-dts, reading-time, rehype-slug, rehype-autolink-headings, remark-gfm, github-slugger)
provides:
  - "Build-failing zod-validated MDX content loader (lib/blog.ts): getAllPosts/getPostBySlug/getPostsByCategory + Post type"
  - "Author registry AUTHORS + fixed 4-category CATEGORIES + SITE_URL (env+fallback) in lib/site.ts"
  - "metadataBase migrated to NEXT_PUBLIC_SITE_URL env (layout.tsx) + documented in .env.example"
  - "Typed JSON-LD emitter primitive with mandatory <-escape XSS scrub (components/blog/JsonLd.tsx)"
  - "2 on-brand seed articles (treino/ramon-dino featured, nutricao/mauri-rosolen) that build green"
affects: [04-03, 04-04, 04-05, blog-listing, blog-article, blog-category, sitemap, robots, seo-metadata]

# Tech tracking
tech-stack:
  added: []  # all deps installed in 04-01
  patterns:
    - "Build-fail content loader: zod safeParse THROWS inside build-time path (inverts dashboard/readers.ts safe() swallow)"
    - "Env-with-fallback for SITE_URL mirroring the WHATSAPP_URL precedent"
    - "Single JSON-LD primitive owns the <-escape XSS scrub for all downstream structured data"
    - "Intentional placeholder discipline (Ramon photo undefined, missing covers) — deliberate, never error state"

key-files:
  created:
    - site/lib/blog.ts
    - site/components/blog/JsonLd.tsx
    - site/content/blog/o-treino-que-funciona-e-o-que-voce-mantem.mdx
    - site/content/blog/disciplina-na-cozinha-vence-a-ultima-moda.mdx
  modified:
    - site/lib/site.ts
    - site/app/layout.tsx
    - site/.env.example

key-decisions:
  - "D-01: fixed 4-category SEO taxonomy (Treino/Nutrição/Mentalidade/Bastidores) as typed CATEGORIES const"
  - "D-02: one category per article via singular `category` zod enum"
  - "D-04: variable author per article via lib/site.ts AUTHORS registry (key referenced by frontmatter)"
  - "D-05: AUTHORS seeded with 2 real authors — ramon-dino (photo undefined placeholder), mauri-rosolen (real photo)"
  - "D-09: 2 example stub articles seeded (example:true) to populate the listing"
  - "D-12: base URL from NEXT_PUBLIC_SITE_URL env with fallback, replacing the hardcoded metadataBase (SEO-01)"
  - "reading-time lib used over own word-count; output formatted pt-BR ('N min de leitura')"

patterns-established:
  - "Build-fail loop: getAllPosts() THROWS naming offending file+field; Wave-3 routes call it from generateStaticParams/sitemap so a bad field aborts next build"
  - "JsonLd is the single XSS-scrubbing chokepoint for Article/Person/Organization/BreadcrumbList"

requirements-completed: [BLOG-01, SEO-01, SEO-05]

# Metrics
duration: 4min
completed: 2026-06-12
---

# Phase 4 Plan 02: Blog Content-Layer Foundation Summary

**Build-failing zod-validated MDX loader (lib/blog.ts), AUTHORS+CATEGORIES registries + NEXT_PUBLIC_SITE_URL env migration, XSS-safe JSON-LD primitive, and 2 on-brand seed articles that build green — the thin end-to-end content contract every Wave-3 route consumes.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-06-12T06:50:32Z
- **Completed:** 2026-06-12T06:54:18Z
- **Tasks:** 3
- **Files modified:** 7 (4 created, 3 modified)

## Accomplishments

- `lib/blog.ts` content loader: `gray-matter` split + `zod` `safeParse` on frontmatter; the validation path **throws** (it does NOT use the `safe()` swallow of `dashboard/readers.ts`), so an invalid/missing field aborts `next build` once Wave-3 calls it from a build-time path (BLOG-01).
- Author registry `AUTHORS` (ramon-dino photo `undefined`, mauri-rosolen real photo), fixed 4-category `CATEGORIES`, and `SITE_URL` (env+fallback) added to `lib/site.ts`.
- `metadataBase` in `layout.tsx` now derives from `process.env.NEXT_PUBLIC_SITE_URL ?? "https://dinoteam.vercel.app"`; the var is documented in `.env.example` (SEO-01).
- `components/blog/JsonLd.tsx` — RSC `schema-dts`-typed JSON-LD emitter with the mandatory `.replace(/</g, "\\u003c")` XSS scrub (SEO-05).
- 2 on-brand seed articles (`treino`/ramon-dino/featured, `nutricao`/mauri-rosolen) whose frontmatter exactly satisfies the zod schema; `next build` exits 0 with real content.

## Loader API (exported from `site/lib/blog.ts`)

- `getAllPosts(): Post[]` — all posts, sorted date desc; validates each file (throws on bad frontmatter).
- `getPostBySlug(slug: string): Post` — one post or throws if absent.
- `getPostsByCategory(category: string): Post[]` — filtered, date desc.
- `type Post` — `{ title, slug, date, author, category, description, cover, featured, example, readingTime, readingMinutes, body }`.
- `type Frontmatter` — `z.infer` of the schema. Content root: `path.join(process.cwd(), "content", "blog")` (no `..` hop).

## Registry shapes (exported from `site/lib/site.ts`)

- `SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dinoteam.vercel.app"`.
- `type Author = { name; credential; photo?; bio? }`; `AUTHORS = { "ramon-dino": {…photo: undefined}, "mauri-rosolen": {…photo: "/autores/mauri-rosolen.webp"} } satisfies Record<string, Author>`; `type AuthorKey`.
- `CATEGORIES = [{slug:"treino",label:"Treino"},{slug:"nutricao",label:"Nutrição"},{slug:"mentalidade",label:"Mentalidade"},{slug:"bastidores",label:"Bastidores"}] as const`; `type CategorySlug`.

## Build-fail behavior (BLOG-01) — verified

`next build` exits 0 with both seed articles. The build-fail contract was proven by temporarily removing `description:` from one seed and invoking the loader exactly as Wave 3 will (`getAllPosts()` at build time): it threw

```
[blog] o-treino-que-funciona-e-o-que-voce-mantem.mdx: frontmatter inválido — description: Invalid input: expected string, received undefined
```

naming both the offending file and field, then the seed was restored. NOTE: until Wave 3 imports `getAllPosts()` into `generateStaticParams()`/`sitemap.ts`, `next build` itself does not yet exercise the loader — the throw was therefore proven by invoking the build-time function directly (equivalent path), not by a route that does not exist yet.

## Task Commits

1. **Task 1: Build-failing MDX content loader + zod schema (lib/blog.ts)** — `b0b5b63` (feat)
2. **Task 2: AUTHORS+CATEGORIES registries, metadataBase→env, JsonLd primitive** — `427bde0` (feat)
3. **Task 3: Two on-brand seed articles** — `c270f2e` (feat)

_TDD note: Task 1 was marked `tdd="true"`. The `site/` has zero test runner; per 04-RESEARCH §Validation Architecture the canonical proof for this requirement family is the build-fail assertion, which was executed (RED = throw on missing field; GREEN = valid content builds + loads). No separate `test(...)` commit since there is no test harness in `site/`._

## Files Created/Modified

- `site/lib/blog.ts` (created) — build-time content loader + zod frontmatter schema + Post accessors.
- `site/components/blog/JsonLd.tsx` (created) — typed JSON-LD `<script>` emitter with `<`-escape XSS scrub.
- `site/content/blog/o-treino-que-funciona-e-o-que-voce-mantem.mdx` (created) — seed article, treino/ramon-dino/featured.
- `site/content/blog/disciplina-na-cozinha-vence-a-ultima-moda.mdx` (created) — seed article, nutricao/mauri-rosolen.
- `site/lib/site.ts` (modified) — added SITE_URL, AUTHORS, CATEGORIES + types.
- `site/app/layout.tsx` (modified) — metadataBase from NEXT_PUBLIC_SITE_URL.
- `site/.env.example` (modified) — documented NEXT_PUBLIC_SITE_URL block.

## Decisions Made

None beyond the plan's locked D-01/D-02/D-04/D-05/D-09/D-12. Discretionary picks within plan latitude: used the `reading-time` lib (allowed) and formatted its output in pt-BR (`N min de leitura`); built a human-readable per-field error message from `zod` `error.issues` (zod v4 `error.message` is a JSON blob — the issues-mapped message names the field cleanly).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- **No blog route yet imports the loader.** Because Wave 3 builds the routes, `next build` alone cannot yet exercise the loader's throw path (the plan's `<verification>` "remove description, re-run build" would falsely pass today). Resolved by proving the BLOG-01 throw by invoking `getAllPosts()` directly at build time (the identical path Wave 3 will use) — see Build-fail behavior above. No code change needed; the loader is correct.
- **`npx tsx` transient runner.** Proving the throw used `npx tsx -e`, which pulled `tsx@4.22.4` into npm's exec cache. It was NOT added to `package.json`/`package-lock.json` (verified via `git status`); no dependency change.

## Known Stubs

| Stub | File | Reason / Resolution |
|------|------|---------------------|
| `cover:` points to not-yet-existing `/blog/covers/*.webp` | both seed `.mdx` | Intentional (D-05 / UI-SPEC): `PostCard` renders a monochrome placeholder when the cover asset is absent; real covers/Phase-1-style B&W archive land later. Path is forward-declared so the swap is trivial. |
| `AUTHORS["ramon-dino"].photo: undefined` | `site/lib/site.ts` | Intentional placeholder discipline (D-05), same as `RamonPhoto`/`TESTIMONIALS` — `AuthorBlock` (Wave 3) renders the "Foto do autor" monochrome slot. Resolved when the real P&B photo archive arrives. |
| `example: true` on both seeds | seed `.mdx` | Marks them as replaceable seeds (D-09); the brand-gated articles in 04-05 will fill the remaining 2 categories. These 2 seeds still face the brand-review gate in 04-05 like any copy (D-10). |

These stubs are intentional and do not block the plan's goal (a validated content pipeline + green build). No data is faked.

## User Setup Required

None for this plan — `NEXT_PUBLIC_SITE_URL` has a documented fallback and is optional until a real domain is published (deploy is out of scope per PROJECT.md). The var is now in `.env.example` for when the user publishes.

## Next Phase Readiness

- Wave 3 routes (`/blog`, `/blog/[slug]`, `/blog/categoria/[slug]`, `sitemap.ts`, `robots.ts`) can now import `getAllPosts`/`getPostBySlug`/`getPostsByCategory`, `AUTHORS`/`CATEGORIES`/`SITE_URL`, and `JsonLd` directly — the content contract is live with 2 real articles.
- Reminder for Wave 3: import `getAllPosts()` into `generateStaticParams()` and `sitemap.ts` so the BLOG-01 build-fail actually gates `next build` (the loader is ready; it just needs a build-time caller).
- Brand-review gate in 04-05 will validate the 2 seed articles' copy (D-10) alongside the remaining category stubs.

## Self-Check: PASSED

All created/modified files exist on disk; all 3 task commits (`b0b5b63`, `427bde0`, `c270f2e`) present in git history.

---
*Phase: 04-blog-seo-production-ready*
*Completed: 2026-06-12*
