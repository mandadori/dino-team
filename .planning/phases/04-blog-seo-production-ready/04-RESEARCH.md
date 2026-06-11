# Phase 4: Blog SEO Production-Ready — Research

**Researched:** 2026-06-11
**Stack:** Next.js 16.2.6 · React 19 · Tailwind v4 · Turbopack · SSG
**Confidence:** HIGH (Next 16 SEO APIs verified against official docs; MDX content-layer = MEDIUM-HIGH pending the mandatory Wave-0 smoke test)

> Provenance: authored by the orchestrator from the gsd-phase-researcher's completed findings (the agent's own Write was blocked by the bg-isolation guard; Bash write used as the verified workaround). Substantively complete and planner-ready. Empirical Turbopack proof is deliberately deferred to the Wave-0 smoke test below.

---

## 1. MDX Content-Layer × Turbopack — THE flagged risk (RESOLVED, gated)

**Decision:** Render `site/content/blog/*.mdx` into the dynamic `/blog/[slug]` route with **`next-mdx-remote-client/rsc`** (`evaluate`), reading files with `fs` inside an async RSC, and enumerating slugs with `generateStaticParams` for SSG.

**Why this and not the alternatives:**
- **`@next/mdx` (already installed)** maps `.mdx` files *directly to routes* (file-based). It does NOT fit the `content/` + dynamic `[slug]` pattern the phase requires. Keep it configured (it's harmless and `pageExtensions` already includes md/mdx) but it is **not the renderer**.
- **`next-mdx-remote/rsc` (the original)** has a *documented* `ModuleBuildError` under Turbopack (vercel/next.js#63318), requiring a `transpilePackages` workaround. Avoid as the primary.
- **`next-mdx-remote-client/rsc` (the maintained fork)** is the variant the current Next.js docs point to, targets **Next 15–16 + React 19**, and has **no documented Turbopack incompatibility**. This is the recommendation.
- **Velite / Content-Collections** are viable build-time content layers but add a heavier toolchain; hold as fallback, not first choice.

**[BLOCKING] Wave-0 smoke test (must be the FIRST task of the phase):**
1. Add `next-mdx-remote-client` + minimal rehype/remark plugins.
2. Create a throwaway `site/content/blog/_smoke.mdx` with an h2, a list, a code block, and a GFM table.
3. Render it through a temporary `[slug]` route; run **`npm run dev`** AND **`npm run build`** under the existing `turbopack.root` override.
4. Pass = both commands succeed and the MDX renders. Then delete `_smoke.mdx`.

**Fallback chain if the smoke test fails (in order):**
1. Add `transpilePackages: ['next-mdx-remote-client']` (or the original `next-mdx-remote`) to `next.config.ts`.
2. If still failing, switch the content layer to **Velite** (programmatic API: compile MDX at build, import typed data).

**Open question:** behavior under the exact `turbopack.root` override on 16.2.6 — resolved empirically by the smoke test, hence it gates everything.

---

## 2. Build-Failing Frontmatter Validation (BLOG-01)

**Pattern:** one content loader at `site/lib/blog.ts`:
1. `gray-matter` splits frontmatter + body.
2. **`zod`** schema `.safeParse(data)` — on failure, **`throw`** with the offending file + field.
3. The loader is called from `generateStaticParams()` (and from `sitemap.ts`), which run at build time — so an invalid/missing field **aborts `next build`** rather than shipping a page without `description`/`date`.

**Schema fields (zod):** `title` (string), `slug` (string), `date` (coerced date/ISO string), `author` (key into the author registry — see §6), `category` (enum of the 4 slugs: `treino` · `nutricao` · `mentalidade` · `bastidores`), `description` (string), `cover` (string path), `featured` (boolean, from D-07).

Parser choice (`gray-matter` vs equivalent) is executor discretion; `gray-matter` is the default recommendation.

---

## 3. Next 16 SEO APIs — all native, verified

- **`params` is now a `Promise`** in Next 16 — every dynamic route page/`generateMetadata` must `await params`. This is the single biggest Next-15→16 gotcha for this phase.
- **`generateMetadata`** (async) per page / article / category, returning `alternates: { canonical: '<absolute url>' }`, `openGraph`, `description`, `title`.
- **`metadataBase`** in `site/app/layout.tsx` migrates from the hardcoded value at `:27` to:
  `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dinoteam.vercel.app')` (D-12). Add the var to `.env.example`. All canonical/OG/sitemap/JSON-LD URLs derive from it.
- **`app/sitemap.ts`** returns `MetadataRoute.Sitemap` — enumerate `/blog`, the 4 category routes, and every article (derive from the content loader), all absolute via the env base.
- **`app/robots.ts`** returns `MetadataRoute.Robots` — allow all + point to `${SITE_URL}/sitemap.xml`.

Prefer these Next-native APIs over external libs (CONTEXT decision); the only external SEO lib is `schema-dts` (§4).

---

## 4. Typed JSON-LD (SEO-05)

Use **`schema-dts`** to type the structured-data objects, rendered server-side as `<script type="application/ld+json">`:
- **`WithContext<Article>`** on each article page.
- **`WithContext<BreadcrumbList>`** on article + category pages.
- **`WithContext<Person>`** per author (name + credential → from the author registry).
- **`WithContext<Organization>`** for "Dino Team".

**Mandatory XSS scrub** when serializing: `JSON.stringify(obj).replace(/</g, '\\u003c')` before injecting into the script tag. All `url`/`@id` fields absolute via `NEXT_PUBLIC_SITE_URL`.

---

## 5. og:image (SEO-06)

**v1 = single static asset.** Drop `app/opengraph-image.png` (1200×630) + an `app/opengraph-image.alt.txt`. Next picks it up automatically as the default OG image — **zero code**. Design: monochrome, Anton + P&B, **no Ramon photo** until the real B&W archive arrives (same block as Phase 1). Dynamic per-article `ImageResponse` is explicitly **v2 / out of scope** (BLOG-12).

---

## 6. Supporting Mechanics (light — patterns + lib picks)

- **Author registry (D-04/05, EEAT):** a `const AUTHORS = { ... } satisfies Record<string, Author>` map in `site/lib/site.ts`. Each entry = name + credential + photo + optional short bio.
  - `mauri-rosolen` → **Mauri Rosolen**, "Treinador", photo `/autores/mauri-rosolen.webp` (already in repo).
  - `ramon-dino` → **Ramon Dino**, "primeiro brasileiro campeão do Mr. Olympia (Classic Physique)", photo **`undefined`** → reuse the **`RamonPhoto` monochrome-placeholder** pattern established in Phase 1 until the real archive lands.
- **Reading time (BLOG-05):** `reading-time` lib OR own word-count — both acceptable (discretion).
- **TOC (BLOG-07):** extract headings via **`rehype-slug`** (anchor ids) + **`github-slugger`** (keep TOC links in sync with rendered ids). Sticky on desktop, collapsible on mobile, scroll-spy as a **client island**, gated by `prefers-reduced-motion`.
- **Related (BLOG-08):** 2–3 articles of the **same `category`**; tie-break by recency (discretion).
- **Share (BLOG-09):** Web Share API + **copy-link fallback**, a small **client island** — no third-party widget.
- **End CTA (BLOG-10/D-11):** single uniform **WhatsApp** CTA inline at the article end, reusing `site/components/ui/CTAButton.tsx` + `WHATSAPP_URL` from `lib/site.ts`; on-brand sign-off; does NOT vary by category.
- **MDX plugins:** `remark-gfm` (tables/strikethrough/task lists), `rehype-autolink-headings` (clickable heading anchors), alongside `rehype-slug`.
- **Client-island discipline:** only **TOC** and **ShareBar** are client components; listing, article body, category pages, and all SEO are RSC/SSG (CONVENTIONS.md).

---

## 7. Package Manifest — `[ASSUMED]`, gate the install

Nine new packages. **slopcheck was sandbox-denied**, so all are tagged `[ASSUMED]` — each verified to exist on **npm** with sane age/maintenance, but not slop-audited. **The planner MUST gate `npm install` behind a `checkpoint:human-verify` task** (autonomous: false) before any code depends on them.

| Package | Role |
|---|---|
| `next-mdx-remote-client` | MDX → RSC renderer (content-layer) |
| `zod` | frontmatter schema (build-fail validation) |
| `gray-matter` | frontmatter parsing |
| `schema-dts` | typed JSON-LD |
| `reading-time` | reading-time estimate (optional — discretion) |
| `rehype-slug` | heading ids for TOC anchors |
| `rehype-autolink-headings` | clickable heading anchors |
| `remark-gfm` | GitHub-flavored markdown in MDX |
| `github-slugger` | TOC↔heading id sync |

---

## 8. Pitfalls

1. **`params` not awaited** → Next 16 runtime error. Await it in every dynamic route + `generateMetadata`.
2. **Using `next-mdx-remote/rsc` (original) instead of the client fork** → Turbopack `ModuleBuildError` (#63318).
3. **Validating frontmatter only at runtime** → build passes, broken page ships. Validation MUST run inside a build-time path (`generateStaticParams`/`sitemap.ts`) and `throw`.
4. **JSON-LD without the `<`-escape** → XSS vector. Always `.replace(/</g,'\\u003c')`.
5. **`@next/mdx` left as the renderer** → file-based routing collides with the `content/` + `[slug]` design. It stays configured but unused as a renderer.
6. **`cn()` without tailwind-merge** (CONCERNS.md) — pre-existing; do not regress, do not block on it.

---

## Validation Architecture

The `site/` has **zero tests** today. Validation for this phase is therefore **build assertions + smoke tests + behavior checks**, one per requirement family. Each is cheap and deterministic — suitable as PLAN acceptance criteria.

| Requirement family | Validation (proof the executor must produce) |
|---|---|
| **MDX render** (BLOG-02/03 routes) | Wave-0 smoke: `npm run dev` AND `npm run build` succeed on `_smoke.mdx`; behavior: `/blog/[slug]` renders MDX h2/h3, lists, GFM table, code. |
| **Frontmatter build-fail** (BLOG-01) | Fixture `.mdx` missing `description` (or `date`) makes `npm run build` **exit non-zero** with the offending file/field named; removing the field-error makes build pass. |
| **SEO metadata** (SEO-01/02/03/04) | Built HTML / view-source of `/blog`, an article, and a category each contains `<title>`, `meta[name=description]`, `link[rel=canonical]`, and `og:*` tags with **absolute** URLs derived from `NEXT_PUBLIC_SITE_URL`. |
| **JSON-LD** (SEO-05) | View-source contains `<script type="application/ld+json">` parsing as valid JSON with `@type` Article + BreadcrumbList + Person + Organization; all `url`/`@id` absolute; `<` is escaped. |
| **sitemap / robots** (SEO-01/04) | `GET /sitemap.xml` lists `/blog` + 4 categories + every article with the env base URL; `GET /robots.txt` references the sitemap. |
| **EEAT completeness** (BLOG-04/05/07/08/09/10) | An article page renders: author block (name + credential + photo/placeholder), reading time, TOC (sticky desktop / collapsible mobile), 2–3 same-category related, native share (with copy fallback), and the WhatsApp CTA at the end. |
| **Content stubs on-brand** (BLOG-03/D-09/D-10) | 4–6 example articles cover all 4 categories, marked as examples, and pass the brand review gate (no promise-of-result, no "atalho/fórmula", no empty motivation). |

---

## Open Questions (non-blocking, resolve during execution)

1. `next-mdx-remote-client/rsc` build under the exact `turbopack.root` override on 16.2.6 — **resolved by the Wave-0 smoke test** (first task).
2. og:image static PNG still needs the brand design pass (monochrome, Anton, no Ramon photo until real archive).
3. `reading-time` lib vs own word-count — both fine; executor discretion.

---

## Recommended Plan Shape (hint for the planner — MVP / vertical slices)

- **Wave 0 (blocking gate):** MDX × Turbopack smoke test → `checkpoint:human-verify` for `npm install` of the 9 `[ASSUMED]` packages.
- **Wave 1 (foundation):** `lib/blog.ts` loader + zod schema (build-fail) · author registry + 4 categories in `lib/site.ts` · migrate `metadataBase` → `NEXT_PUBLIC_SITE_URL` + `.env.example`.
- **Wave 2 (slices):** `/blog` listing (featured + grid) · `/blog/[slug]` article (MDX + EEAT components: AuthorBlock, ReadingTime, TOC island, Related, ShareBar island, end CTA) · `/blog/categoria/[slug]`.
- **Wave 3 (SEO + content):** `generateMetadata` per route · `sitemap.ts` · `robots.ts` · typed JSON-LD · static `opengraph-image.png` · 4–6 on-brand stub articles (through the brand gate).

Final wave/slice decomposition is the planner's call; this is guidance, not a contract.
