# Phase 4: Blog SEO Production-Ready - Pattern Map

**Mapped:** 2026-06-11
**Files analyzed:** 23 (new + modified)
**Analogs found:** 21 / 23 (2 have no codebase analog — see §No Analog Found)

> Scope note: the `site/` Next.js 16 + Tailwind v4 + RSC app is the only codebase surface this phase touches. Every analog below lives under `site/`. Brand law (monochrome, Anton/Montserrat, RSC-by-default, `cn()`, tokens-not-hex) is already encoded in the existing files — **copy the analog, do not reinvent**.

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `site/lib/blog.ts` (new) | service / data-loader | file-I/O (build-time fs read) | `site/lib/dashboard/readers.ts` | exact (fs+safe-read), partial (parse strategy) |
| `site/lib/site.ts` (modify — add `AUTHORS`, `CATEGORIES`) | config | static-data | `site/lib/site.ts` (itself — `STATS`/`TESTIMONIALS`/`PLANS`) | exact |
| `site/app/layout.tsx` (modify — `metadataBase` → env) | config / layout | request-response (metadata) | `site/app/layout.tsx` (itself, line 27) | exact |
| `site/.env.example` (modify — add `NEXT_PUBLIC_SITE_URL`) | config | — | `site/.env.example` (itself) | exact |
| `site/app/blog/page.tsx` (new — listing) | route / page | CRUD-read (SSG list) | `site/app/privacidade/page.tsx` (shell) + `Resultados.tsx` (grid) | role-match |
| `site/app/blog/[slug]/page.tsx` (new — article) | route / page (dynamic) | CRUD-read (SSG by slug) | `site/app/privacidade/page.tsx` (shell + prose) | role-match |
| `site/app/blog/categoria/[slug]/page.tsx` (new — category) | route / page (dynamic) | CRUD-read (SSG filtered) | `site/app/privacidade/page.tsx` (shell) | role-match |
| `site/app/sitemap.ts` (new) | config / route | transform (loader→sitemap) | `site/lib/dashboard/readers.ts` (fs enumerate) | partial (no Next-native analog exists) |
| `site/app/robots.ts` (new) | config / route | request-response | — (Next-native API) | **no analog** |
| `site/app/opengraph-image.png` + `.alt.txt` (new) | asset / config | static | — (file-convention, zero code) | **no analog** (asset) |
| `site/components/blog/PostCard.tsx` (new — featured + grid) | component | request-response (presentational) | `Depoimentos.tsx` (card+grayscale slot) + `RamonPhoto.tsx` | role-match |
| `site/components/blog/AuthorBlock.tsx` (new) | component | request-response | `Depoimentos.tsx` (avatar slot) + `RamonPhoto.tsx` (placeholder) | exact (placeholder), role-match |
| `site/components/blog/Toc.tsx` (new) | component | event-driven (scroll-spy) | `FAQ.tsx` (client island + reduced-motion gate) | role-match (client island) |
| `site/components/blog/RelatedPosts.tsx` (new) | component | request-response | `Resultados.tsx` / `Depoimentos.tsx` (mapped grid) | role-match |
| `site/components/blog/ShareBar.tsx` (new) | component | event-driven (Web Share / clipboard) | `CookieBanner.tsx` (client island + button styles) | role-match (client island) |
| `site/components/blog/CategoryNav.tsx` (new) | component | request-response (Links) | footer `<nav>` in `privacidade/page.tsx` / `page.tsx` | role-match |
| `site/components/blog/ProseDino.tsx` or MDX components map (new) | component / config | transform (markdown→styled) | `privacidade/page.tsx` (hand-authored prose rhythm) | role-match (rhythm donor) |
| `site/components/blog/JsonLd.tsx` (new) | component | transform (object→`<script>`) | — (no JSON-LD anywhere yet) | **no analog** |
| `site/content/blog/*.mdx` (new — 4–6 stubs) | content | static | `export/conteudos/blog/` template + `/novo-artigo` SKILL frontmatter | partial (skill convention) |
| End CTA usage (inside article page) | reuse | — | `CtaFinal.tsx` (sign-off + CTAButton) | exact |
| `next.config.ts` (likely untouched — `@next/mdx` stays) | config | — | `next.config.ts` (itself) | exact (leave configured) |

---

## Pattern Assignments

### `site/lib/blog.ts` (service, file-I/O — build-time content loader)

**Analog:** `site/lib/dashboard/readers.ts` (fs read pattern) — but with a **critical inversion**: readers.ts wraps everything in `safe()` to **fail gracefully** (returns `[]` on error, because the repo isn't on the Vercel filesystem at runtime). `blog.ts` must do the **opposite for validation**: the zod `.safeParse` failure must `throw` so `next build` aborts (BLOG-01, RESEARCH §2). Keep the `fs` + `path.join` + `readdirSync` mechanics; drop the `safe()` swallow on the validation path.

**fs read + enumerate pattern to copy** (`readers.ts:1-3`, `:35-60`):
```typescript
import fs from "node:fs";
import path from "node:path";
// ...
return fs
  .readdirSync(dir, { withFileTypes: true })
  .filter((d) => d.isFile() && d.name.endsWith(".mdx"))
  .map((d) => { /* read + gray-matter + zod.safeParse */ });
```

**Content root** — `readers.ts:12` resolves `REPO_ROOT = path.resolve(process.cwd(), "..")` because it reads files OUTSIDE `site/`. `blog.ts` reads INSIDE `site/`, so use `path.join(process.cwd(), "content", "blog")` (cwd is `site/` for the app). Do NOT copy the `..` hop.

**Build-fail validation (NEW — no analog, from RESEARCH §2):**
```typescript
import matter from "gray-matter";
import { z } from "zod";

const FrontmatterSchema = z.object({
  title: z.string(),
  slug: z.string(),
  date: z.coerce.date(),
  author: z.string(),            // key into AUTHORS (lib/site.ts)
  category: z.enum(["treino", "nutricao", "mentalidade", "bastidores"]),
  description: z.string(),
  cover: z.string(),
  featured: z.boolean(),
});

const { data, content } = matter(raw);
const parsed = FrontmatterSchema.safeParse(data);
if (!parsed.success) {
  throw new Error(`[blog] ${file}: frontmatter inválido — ${parsed.error.message}`);
}
```
This loader is called from `generateStaticParams()` and `sitemap.ts` (both build-time paths), so a bad field aborts the build (RESEARCH §2, Pitfall 3).

**XSS scrub for JSON-LD serialization** (RESEARCH §4, Pitfall 4) — wherever a JSON-LD object is stringified: `JSON.stringify(obj).replace(/</g, "\\u003c")`.

---

### `site/lib/site.ts` — add `AUTHORS` + `CATEGORIES` (config, static-data)

**Analog:** `site/lib/site.ts` itself — follow the `STATS`/`TESTIMONIALS`/`PLANS` precedent exactly (typed `ReadonlyArray`/`Record`, `export const`, on-brand placeholder labels, env-derived URLs).

**`WHATSAPP_URL` env pattern to mirror for the new `SITE_URL`** (`site.ts:8-11`):
```typescript
export const WHATSAPP_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ||
  "https://wa.me/0000000000?text=" + encodeURIComponent("Quero minha consultoria Dino Team");
```

**Author registry (RESEARCH §6, D-04/05):** use `satisfies Record<string, Author>` so keys stay literal for the `author` frontmatter reference:
```typescript
export type Author = { name: string; credential: string; photo?: string; bio?: string };

export const AUTHORS = {
  "ramon-dino": {
    name: "Ramon Dino",
    credential: "primeiro brasileiro campeão do Mr. Olympia (Classic Physique)",
    photo: undefined, // placeholder até o acervo P&B chegar (mesmo bloqueio da Phase 1)
  },
  "mauri-rosolen": {
    name: "Mauri Rosolen",
    credential: "Treinador",
    photo: "/autores/mauri-rosolen.webp", // já no repo
  },
} satisfies Record<string, Author>;
```
**Placeholder discipline:** the `photo: undefined` for Ramon is the SAME intentional-placeholder pattern as `TESTIMONIALS` `publishable:false` and `RamonPhoto` `src` absent — deliberate, never "broken" (see `site.ts:79-90` comment).

**Categories (D-01, fixed 4):** mirror `STATS` shape:
```typescript
export const CATEGORIES = [
  { slug: "treino", label: "Treino" },
  { slug: "nutricao", label: "Nutrição" },
  { slug: "mentalidade", label: "Mentalidade" },
  { slug: "bastidores", label: "Bastidores" },
] as const;
```

---

### `site/app/layout.tsx` — migrate `metadataBase` (config)

**Analog:** itself, line 27. Single-line change (D-12, RESEARCH §3):
```typescript
// BEFORE (layout.tsx:27):
metadataBase: new URL("https://dinoteam.vercel.app"),
// AFTER:
metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://dinoteam.vercel.app"),
```
Add `NEXT_PUBLIC_SITE_URL` to `.env.example` following the existing commented-var style (each var has a `#` explainer + blank value — see the `NEXT_PUBLIC_WHATSAPP_URL` block).

---

### `site/app/blog/[slug]/page.tsx` (route, dynamic SSG — the article)

**Analog:** `site/app/privacidade/page.tsx` — donor for (1) the page-level `export const metadata` → here becomes `generateMetadata`, (2) the **fixed header shell** (`:15-27`), (3) the **footer shell** (`:215-239`), and (4) the **prose rhythm** (`mt-16 space-y-8` sections, `font-display ... uppercase` h2, `font-body text-base leading-relaxed` p). The blog inherits this exact chrome (UI-SPEC §Component Inventory: "do not invent a new chrome").

**Header shell to copy verbatim** (`privacidade/page.tsx:15-27`):
```tsx
<header className="fixed inset-x-0 top-0 z-50 border-b border-line/60 bg-bg/80 backdrop-blur">
  <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
    <Link href="/" className="font-display text-2xl uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg">
      Dino Team
    </Link>
    <CTAButton href={WHATSAPP_URL} className="px-5 py-2.5 text-xs">Quero minha direção</CTAButton>
  </div>
</header>
```

**Main offset under fixed header** (`privacidade/page.tsx:29`) — reuse the exact padding compensation so content clears the fixed header:
```tsx
<main className="px-6 py-24 pt-[calc(theme(spacing.24)+4rem)] sm:py-32 sm:pt-[calc(theme(spacing.32)+4rem)]">
```

**Next 16 dynamic-route gotcha (RESEARCH §3, Pitfall 1):** `params` is a `Promise` — every dynamic page AND its `generateMetadata` must `await params`:
```tsx
export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  return {
    title: `${post.title} · Dino Team`,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` }, // resolved absolute via metadataBase
    openGraph: { title: post.title, description: post.description, type: "article" },
  };
}
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // ... fetch post, render MDX via next-mdx-remote-client/rsc evaluate
}
```

**Metadata title convention** (`privacidade/page.tsx:7-8`): `"<Page> · Dino Team"` — keep the ` · Dino Team` suffix for every blog `<title>`.

**MDX render (RESEARCH §1 — the gated decision):** `next-mdx-remote-client/rsc` `evaluate`, body from the loader, with `remark-gfm` + `rehype-slug` + `rehype-autolink-headings`. Components map supplies the `prose-dino` element styles (see ProseDino below). **This is gated behind the Wave-0 smoke test** — do not author the article route before the smoke passes.

**Article reading column:** UI-SPEC mandates `max-w-[68ch]` for the prose measure (NOT the `max-w-3xl` legal width, NOT `max-w-6xl` section width). Two-column on `lg`: `[prose] [sticky TOC rail w-56/w-64]`.

**End CTA — reuse `CtaFinal.tsx` pattern** (sign-off line + `CTAButton`), see Shared Patterns §End CTA.

---

### `site/app/blog/page.tsx` (route, SSG listing — featured + grid)

**Analog:** `privacidade/page.tsx` (shell) + `Resultados.tsx` (grid map) + `Depoimentos.tsx` (editorial gate + empty state).

**Grid map pattern to copy** (`Resultados.tsx:15-26`) — mapped cards inside a bordered grid, `Reveal` with staggered delay:
```tsx
<div className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
  {STATS.map((s, i) => (
    <Reveal key={s.label} delay={0.08 * i}>
      <div className="h-full bg-bg p-8 text-center"> {/* ... */} </div>
    </Reveal>
  ))}
</div>
```
For the blog: featured post on top (`PostCard` featured variant, Display-tier title), then `sm:grid-cols-2 lg:grid-cols-3` grid of `PostCard` grid variant (UI-SPEC §Responsive). `featured` flag selection with executor-chosen fallback (most-recent) per D-07.

**Empty-state discipline** (from `Depoimentos.tsx:18-21` editorial gate + UI-SPEC §Copywriting) — even though D-09 ships 4–6 stubs, spec the empty state: heading `Ainda não há artigos por aqui.` + WhatsApp CTA. No "em breve"/skeleton (same rule as `Depoimentos` "sem card vazio, sem skeleton").

**`generateMetadata` for `/blog`** (RESEARCH §3): static metadata with `alternates: { canonical: "/blog" }`.

---

### `site/app/blog/categoria/[slug]/page.tsx` (route, dynamic SSG — filtered listing)

**Analog:** same as `/blog` listing + the `[slug]/page.tsx` dynamic-params handling. `generateStaticParams` enumerates the 4 fixed `CATEGORIES` slugs. Filters posts by `category`. Emits BreadcrumbList JSON-LD (SEO-05) and its own `generateMetadata` + canonical (D-08). Same `await params` gotcha.

---

### `site/app/sitemap.ts` (route, transform)

**Analog:** `readers.ts` fs-enumerate for the data source; Next-native `MetadataRoute.Sitemap` for the shape (no codebase analog for the return type). RESEARCH §3:
```typescript
import type { MetadataRoute } from "next";
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dinoteam.vercel.app";
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts(); // build-time loader — also re-asserts frontmatter validity
  return [
    { url: `${BASE}/blog`, lastModified: new Date() },
    ...CATEGORIES.map((c) => ({ url: `${BASE}/blog/categoria/${c.slug}` })),
    ...posts.map((p) => ({ url: `${BASE}/blog/${p.slug}`, lastModified: p.date })),
  ];
}
```

---

### `site/app/robots.ts` (route) — **no codebase analog** (Next-native)

RESEARCH §3 — allow all + point at the env-derived sitemap:
```typescript
import type { MetadataRoute } from "next";
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dinoteam.vercel.app";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${BASE}/sitemap.xml` };
}
```

---

### `site/components/blog/PostCard.tsx` (component, featured + grid variants)

**Analog:** `Depoimentos.tsx` (card surface + grayscale image slot + intentional placeholder) + `RamonPhoto.tsx` (cover image treatment).

**Image slot + intentional placeholder pattern** (`Depoimentos.tsx:40-63`) — the executor copies this branch for covers without a real image (monochrome placeholder, never colored/stock):
```tsx
{t.photo ? (
  <div className="relative mb-6 h-16 w-16 overflow-hidden border border-line">
    <Image src={t.photo} alt={`Foto de ${t.name}`} fill sizes="64px" className="object-cover grayscale contrast-125" />
  </div>
) : (
  <div role="img" aria-label={t.name} className="... border border-line bg-surface">
    <span aria-hidden="true" className="font-display text-2xl uppercase tracking-widest text-muted">{t.name.charAt(0)}</span>
  </div>
)}
```

**Cover with scrim (for featured)** — use `RamonPhoto.tsx:30-49` treatment (`grayscale contrast-125` + `--scrim-hero` token overlay) when title text overlays the cover. UI-SPEC §Color makes the scrim **acceptance criteria**, not decoration.

**Card variant typography (UI-SPEC §Typography):** featured title = Display tier (`text-4xl sm:text-5xl`, Anton uppercase); grid title = Heading tier (`text-2xl`, optional `sm:text-3xl`). Hover: `border-line → border-fg/40` + title `underline underline-offset-4` (CSS-only, reduced-motion safe). Entire card = one ≥44px link target. RSC (no `"use client"`).

---

### `site/components/blog/AuthorBlock.tsx` (component)

**Analog:** `RamonPhoto.tsx` (exact placeholder pattern for absent photo) + `Depoimentos.tsx` avatar slot.

**Absent-photo placeholder (RamonPhoto.tsx:55-68)** — for Ramon (no photo yet), reuse this intentional-slot pattern, label `Foto do autor` (UI-SPEC §Copy), NOT an error state:
```tsx
<div role="img" aria-label={alt} className="flex ... border border-line bg-surface">
  <span aria-hidden="true" className="font-display text-2xl uppercase tracking-widest text-muted">Foto do autor</span>
</div>
```
Name = Anton Heading tier uppercase; credential = Montserrat Label tier `text-muted`. Photo `alt` = `"{name}, {credential}"` (UI-SPEC §A11y). RSC.

---

### `site/components/blog/Toc.tsx` (component, **client island**, scroll-spy)

**Analog:** `FAQ.tsx` (client island with `"use client"` + state + `useReducedMotion` gate) for the interaction shape; `CookieBanner.tsx` for the `usePrefersReducedMotion` import pattern.

**Reduced-motion gate to copy** (`FAQ.tsx:31-32`, `:67-94` branch / `Reveal.tsx:26-28`) — branch on `reduce` and render the static/instant variant; under reduced-motion, TOC does **instant anchor jump, no smooth scroll, no animated highlight** (UI-SPEC §States). Use `usePrefersReducedMotion` from `@/lib/usePrefersReducedMotion` (the SSR-safe `useSyncExternalStore` hook) rather than framer's `useReducedMotion` if no framer is otherwise needed.

**Mechanics (RESEARCH §6, UI-SPEC):** `IntersectionObserver` scroll-spy, heading ids from `rehype-slug` + `github-slugger` sync, sticky right rail on `lg` (`sticky top-24`), collapsible `<details>` on mobile (closed, summary "Neste artigo"), renders only with ≥3 `h2`/`h3`. Active link `text-fg` + `border-l-2 border-fg -ml-px`; inactive `text-muted`. `scroll-mt-24` on headings for the fixed-header offset.

---

### `site/components/blog/ShareBar.tsx` (component, **client island**, Web Share + clipboard)

**Analog:** `CookieBanner.tsx` — the canonical **in-page `<button>` client island** (CTAButton renders `<a>`, not usable here). Copy the button style constants and the `usePrefersReducedMotion` import.

**Button style constants to copy** (`CookieBanner.tsx:18-22`):
```typescript
const BUTTON_BASE = "inline-flex items-center justify-center gap-2 px-8 py-4 font-body text-sm font-semibold uppercase tracking-wide transition-all duration-200 hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg";
const BUTTON_OUTLINE = "border border-fg/40 text-fg hover:border-fg hover:bg-fg/5";
```
ShareBar uses the **outline** variant (UI-SPEC §Component Inventory). Mechanics (RESEARCH §6, UI-SPEC): copy-link primary with `role="status"` + `aria-live="polite"` confirmation (`Copiar link` → `Link copiado`, revert ~2s); Web Share trigger only when `navigator.share` exists, with **visible text label `Compartilhar`** (never icon-only); inline monochrome SVG (`currentColor`); every button ≥44px. No third-party widget.

---

### `site/components/blog/CategoryNav.tsx` (component, server Links)

**Analog:** the footer `<nav>` in `privacidade/page.tsx:224-237` / `page.tsx:51-64` — `<nav>` of `<Link>` with `text-muted hover:text-fg` + focus ring. RSC (server Links, NOT client pills — D-08).

**Pattern to copy** (`page.tsx:51-64`):
```tsx
<nav className="flex gap-5 font-body text-sm text-muted">
  <Link href="..." className="hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg">Label</Link>
</nav>
```
4 category links → `/blog/categoria/[slug]` + "Todos" → `/blog`. Current = `text-fg`, others = `text-muted`, all `text-sm uppercase tracking-[0.2em]` (UI-SPEC §Color: categories differentiated by label text only, no color/pill/badge).

---

### `site/components/blog/ProseDino.tsx` (or MDX components map) — markdown→styled

**Analog:** `privacidade/page.tsx` — the hand-authored prose IS the rhythm donor. The legal page sets each element's classes per-element (`<h2 className="font-display text-2xl uppercase leading-[1.2] text-fg">`, `<p className="font-body text-base leading-relaxed text-fg">`, sections `mt-16 space-y-8`). For MDX (machine-rendered) the SAME visual rules apply via ONE wrapper/components-map, not per-element (UI-SPEC §Typography "MDX Prose contract").

**Element classes to translate from `privacidade/page.tsx` into the MDX map:**
- `h2` → `font-display text-2xl sm:text-3xl uppercase leading-[1.2] text-fg mt-12 scroll-mt-24` (donor: `:47`, + `scroll-mt-24` for TOC/anchor offset)
- `h3` → `font-display text-2xl uppercase text-fg mt-8 scroll-mt-24`
- `p` → `font-body text-base lg:text-lg leading-[1.7] text-fg mt-6` (donor: `:38` but looser `1.7` per UI-SPEC, not `leading-relaxed`)
- links → `underline underline-offset-4 decoration-line hover:decoration-fg text-fg` (donor: `CookieBanner.tsx:47` underline-offset-4)
- `blockquote` → `border-l-2 border-line pl-6 text-muted mt-8`
- `code`/`pre` → `bg-surface border border-line` monochrome, `text-sm`
- `img` → `grayscale contrast-125` (brand photo treatment, donor: `RamonPhoto`/`Depoimentos`), caption `text-sm text-muted mt-2`
- `first:mt-0` on first child; MDX body is **caixa livre** (never force uppercase on prose — UI-SPEC §Typography).

Reading measure `max-w-[68ch]`. No `prose` Tailwind plugin (not installed) — author the map explicitly.

---

### `site/components/blog/JsonLd.tsx` — **no codebase analog** (new capability)

RESEARCH §4, SEO-05 — `schema-dts`-typed objects rendered as `<script type="application/ld+json">`, **with mandatory `<`-escape** (Pitfall 4):
```tsx
import type { WithContext, Article } from "schema-dts";
function JsonLd({ data }: { data: WithContext<Article | /* ... */> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c"); // XSS scrub — mandatory
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
```
Emit: `Article` (article page), `BreadcrumbList` (article + category), `Person` per author (from `AUTHORS`), `Organization` "Dino Team". All `url`/`@id` absolute via `NEXT_PUBLIC_SITE_URL`. RSC.

---

### `site/content/blog/*.mdx` (content — 4–6 on-brand stubs)

**Analog:** the `/novo-artigo` SKILL frontmatter convention (`.claude/skills/novo-artigo/SKILL.md`) — the future Phase-6 pipeline writes MDX to `export/conteudos/blog/<slug>/artigo.mdx`. The Phase-4 loader's **zod schema is the contract** the future skill must satisfy; keep the field names aligned. Stubs live in `site/content/blog/` (D-09; both `site/content/blog/` and `export/conteudos/blog/` are empty today).

**Frontmatter shape (must match `lib/blog.ts` zod schema exactly):**
```yaml
---
title: "..."
slug: "..."
date: 2026-06-11
author: mauri-rosolen        # key in AUTHORS
category: treino             # one of treino|nutricao|mentalidade|bastidores
description: "..."
cover: "/blog/covers/..."    # or placeholder path
featured: false
# mark-as-example (D-09): e.g. `example: true` or a body note — executor's call
---
```
Copy MUST pass the brand gate (D-10, UI-SPEC §Copywriting): tom sereno/anti-espetáculo, second person "você", NO "atalho/fórmula/jeito fácil", no promise of prazo/resultado, no empty motivation. Cover all 4 categories so `RelatedPosts`-by-category has real data.

---

## Shared Patterns

### Blog shell (header + footer) — INHERITED, do not reinvent
**Source:** `site/app/privacidade/page.tsx:15-27` (header) + `site/app/page.tsx:42-66` (footer)
**Apply to:** `/blog`, `/blog/[slug]`, `/blog/categoria/[slug]` (all three page roots)
The fixed header + footer are identical across the landing and legal pages. UI-SPEC §Component Inventory: "do **not** invent a new chrome." Footer gains a `/blog` link in its `<nav>` (alongside Privacidade/Termos). The wordmark on blog pages is a `<Link href="/">` (legal-page variant, `:17-22`), not the bare `<span>` of the home (which is already at `/`).

### End CTA (WhatsApp, sign-off) — reuse `CTAButton`
**Source:** `site/components/sections/CtaFinal.tsx:22-31` + `site/components/ui/CTAButton.tsx`
**Apply to:** article page end (D-11), single uniform, does NOT vary by category
```tsx
<p className="mt-4 font-body text-sm uppercase tracking-widest text-muted">O topo exige direção.</p>
<CTAButton href={WHATSAPP_URL}>Quero minha direção</CTAButton>
```
The sign-off line `O topo exige direção.` and CTA label `Quero minha direção` are UI-SPEC §Copywriting-locked (no variation). `WHATSAPP_URL` from `@/lib/site`.

### Reduced-motion gate — INHERITED, mandatory on every island
**Source:** `site/lib/usePrefersReducedMotion.ts` (SSR-safe hook) + `Reveal.tsx:26-28` (JS gate) + `FAQ.tsx:67-94` (branch) + `globals.css:58-67` (CSS floor)
**Apply to:** `Toc` (scroll-spy/smooth-scroll), `ShareBar`, any `Reveal` use on cards
Branch on the reduced-motion value and render the static/instant variant — content complete on first paint. The global CSS `@media (prefers-reduced-motion)` block already neutralizes transitions; JS islands must additionally gate behavior (no smooth-scroll, no animated highlight).

### Monochrome tokens — INHERITED, never hex
**Source:** `site/app/globals.css:14-35` `@theme`
**Apply to:** every blog surface
`bg-bg` / `bg-surface` / `text-fg` / `text-muted` / `border-line`, `--scrim-hero`/`--scrim-portrait` for photo overlays, `text-fg-on-light`/`text-muted-on-light` ONLY inside white blocks (the CTA button label). NEVER `#7f7f7f` on white (fails AA). No new color tokens this phase (UI-SPEC §Color).

### `cn()` + `@/` alias — INHERITED conventions
**Source:** `site/lib/utils.ts` (`cn`) + every file's `@/components`, `@/lib` imports
**Apply to:** all new components. `cn()` has no tailwind-merge (CONCERNS.md) — pre-existing; do not regress, do not block on it (RESEARCH Pitfall 6).

### Client-island discipline — INHERITED (CONVENTIONS.md)
**Source:** `Reveal.tsx:1`, `FAQ.tsx:1`, `CookieBanner.tsx:1` (the only `"use client"` files)
**Apply to:** ONLY `Toc` and `ShareBar` carry `"use client"`. Listing, article body, category pages, `PostCard`, `AuthorBlock`, `RelatedPosts`, `CategoryNav`, `JsonLd`, all SEO = RSC/SSG. `"use client"` never rises to a page or section (UI-SPEC §States).

---

## No Analog Found

Files with no close match in the codebase (planner should use RESEARCH.md / Next-native APIs):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `site/app/robots.ts` | config/route | request-response | No existing `robots.ts`; pure Next-native `MetadataRoute.Robots` (RESEARCH §3) — trivial, no pattern to copy. |
| `site/components/blog/JsonLd.tsx` | component | transform | No JSON-LD/`schema-dts` anywhere in the codebase yet; new capability (RESEARCH §4). Mandatory `<`-escape has no precedent. |
| `site/app/sitemap.ts` | config/route | transform | Partial only — `readers.ts` donates the fs-enumerate, but the `MetadataRoute.Sitemap` return shape is Next-native with no analog. |
| `site/app/opengraph-image.png` + `.alt.txt` | asset | static | File-convention asset (zero code); design pass needed (monochrome, Anton, no Ramon photo until archive — RESEARCH §5). |

**MDX rendering (`next-mdx-remote-client/rsc`)** also has no codebase analog (`@next/mdx` is installed but is file-based, not the renderer — RESEARCH §1) and is **gated behind the Wave-0 smoke test** before any article-route code is written.

---

## Metadata

**Analog search scope:** `site/app/`, `site/components/`, `site/lib/`, `site/public/`, `site/next.config.ts`, `site/.env.example`, `.claude/skills/novo-artigo/`
**Files scanned:** ~14 read in full (layout, privacidade, site.ts, CTAButton, RamonPhoto, Reveal, usePrefersReducedMotion, utils, Resultados, Depoimentos, next.config, readers.ts, CookieBanner, globals.css, FAQ, CtaFinal, page.tsx) + tree/deps/env via Bash
**Key absence confirmed:** no `sitemap.ts` / `robots.ts` / `opengraph-image.*` exist; `content/blog/` empty; only 3 `"use client"` islands in the codebase; SEO libs (zod/schema-dts/gray-matter/reading-time/parser/rehype/remark) NOT yet installed (gate `npm install` per RESEARCH §7).
**Pattern extraction date:** 2026-06-11
