<!-- refreshed: 2026-05-31 -->
# Architecture

**Analysis Date:** 2026-05-31
**Scope:** `site/` directory only

## System Overview

```text
┌──────────────────────────────────────────────────────────────────────┐
│                         Browser / Client                             │
│  Public landing (SSR)          Admin dashboard (SSR + client island) │
└──────────────┬─────────────────────────────┬────────────────────────┘
               │                             │
               ▼                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     Next.js App Router (Node.js)                     │
│                                                                      │
│  app/page.tsx (home)      app/admin/dashboard/**  app/admin/login   │
│  app/layout.tsx           app/admin/layout.tsx                       │
└────────────┬─────────────────────────────┬───────────────────────────┘
             │                             │
             ▼                             ▼
┌────────────────────────┐   ┌─────────────────────────────────────────┐
│   components/          │   │   app/api/  (Route Handlers)            │
│   sections/  (7 RSC)   │   │                                         │
│   ui/        (shared)  │   │   /api/skills/dispatch  (skill trigger) │
│   admin/     (client)  │   │   /api/cron/planejar-pauta-semanal      │
│   Reveal, AnimCounter  │   └───────────────────┬─────────────────────┘
└──────────┬─────────────┘                       │
           │                                     ▼
           ▼                        ┌────────────────────────┐
┌──────────────────────┐            │  Anthropic SDK         │
│   lib/               │            │  (wired, not executing)│
│   site.ts (consts)   │            └────────────────────────┘
│   utils.ts (cn())    │
│   dashboard/         │
│   readers.ts (fs)    │◄──── reads ──── ../campanhas/ ../dados/
└──────────────────────┘              (repo root — dev only)
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| `RootLayout` | HTML shell, fonts, metadata, tracking | `site/app/layout.tsx` |
| `Home` | Landing page composition (7 sections) | `site/app/page.tsx` |
| `AdminLayout` | Admin shell with nav | `site/app/admin/layout.tsx` |
| `DashboardHome` | Campaign/approval overview + quick actions | `site/app/admin/dashboard/page.tsx` |
| `CampanhasPage` | Kanban view of campaign states | `site/app/admin/dashboard/campanhas/page.tsx` |
| `AprovacoesPage` | Pending approval queue | `site/app/admin/dashboard/aprovacoes/page.tsx` |
| `DadosPage` | Data slice freshness monitor | `site/app/admin/dashboard/dados/page.tsx` |
| `AdminLogin` | Token-based login form | `site/app/admin/login/page.tsx` |
| `dispatch route` | Skill trigger + policy gate | `site/app/api/skills/dispatch/route.ts` |
| `cron route` | Vercel Cron authenticated receiver | `site/app/api/cron/planejar-pauta-semanal/route.ts` |
| `readers` | Server-side filesystem reads for dashboard | `site/lib/dashboard/readers.ts` |
| `site.ts` | Brand constants (WHATSAPP_URL, STATS, TIMELINE) | `site/lib/site.ts` |
| `proxy.ts` | Edge middleware protecting `/admin/*` | `site/proxy.ts` |
| `Reveal` | Framer Motion scroll-reveal wrapper (client) | `site/components/Reveal.tsx` |
| `AnimatedCounter` | Viewport-triggered number counter (client) | `site/components/AnimatedCounter.tsx` |
| `CTAButton` | Link-based CTA with two variants | `site/components/ui/CTAButton.tsx` |
| `DispatchButton` | Client component that POSTs to dispatch route | `site/components/admin/DispatchButton.tsx` |
| `TrackingScripts` | Opt-in GA / Meta Pixel / Clarity injection | `site/components/TrackingScripts.tsx` |

## Pattern Overview

**Overall:** Next.js App Router with React Server Components as the default; client components are isolated to interactive leaf nodes only.

**Key Characteristics:**
- All page-level components and sections are Server Components by default (no `"use client"`)
- Client boundary is pushed to the leaf: `Reveal`, `AnimatedCounter`, `FAQ`, `DispatchButton`, `AdminLogin` are the only `"use client"` nodes
- Static data (brand constants, copy) lives in `lib/site.ts`; no API call at render time for the public homepage
- Admin dashboard pages use `export const dynamic = "force-dynamic"` to opt out of caching and always re-read filesystem state
- The `proxy.ts` file acts as Next.js middleware (Edge Runtime) protecting all `/admin/*` routes via token cookie

## Layers

**Routing Layer:**
- Purpose: Page composition and URL-to-component mapping
- Location: `site/app/`
- Contains: `page.tsx`, `layout.tsx`, nested route directories
- Depends on: components, lib
- Used by: Next.js framework

**Component Layer:**
- Purpose: UI building blocks — sections, shared UI, admin-specific
- Location: `site/components/`
- Contains: Section RSCs, utility client components, admin client components
- Depends on: `lib/site.ts` (constants), `lib/utils.ts` (cn), Framer Motion, Lucide
- Used by: page files in `app/`

**Library Layer:**
- Purpose: Shared logic, constants, server-side data access
- Location: `site/lib/`
- Contains: `site.ts` (brand constants), `utils.ts` (class merger), `dashboard/readers.ts` (fs readers)
- Depends on: Node.js `fs`, path resolution relative to repo root
- Used by: both page RSCs and API route handlers

**API Layer:**
- Purpose: Server-side HTTP endpoints for skill dispatch and cron trigger
- Location: `site/app/api/`
- Contains: Route Handlers (Node.js runtime)
- Depends on: `@anthropic-ai/sdk`, `lib/dashboard/readers.ts`, `process.env`
- Used by: Vercel Cron, `DispatchButton` client component, external cron runners

**Edge Layer:**
- Purpose: Auth guard for admin routes; runs on Vercel Edge before page render
- Location: `site/proxy.ts`
- Contains: Token validation, cookie-setting, redirect to login
- Depends on: `process.env.DASHBOARD_TOKEN`
- Used by: Next.js middleware (matcher `/admin/:path*`)

## Data Flow

### Public Landing Page Request

1. Browser requests `/` → Next.js renders `RootLayout` + `Home` as RSC (`site/app/layout.tsx`, `site/app/page.tsx`)
2. `Home` imports 7 section components and calls `WHATSAPP_URL` from `site/lib/site.ts`
3. Sections are rendered server-side; client boundary components (`Reveal`, `AnimatedCounter`, `FAQ`) are hydrated in browser
4. `TrackingScripts` is injected into `<body>` as `next/script` with `afterInteractive` strategy

### Admin Dashboard Request

1. Browser requests `/admin/dashboard` → `proxy.ts` (Edge) intercepts, validates `dashboard_token` cookie or `?token=` query
2. On failure: redirect to `/admin/login`
3. On success: Next.js renders `AdminLayout` + `DashboardHome` as RSC
4. `DashboardHome` calls `readCampanhas()`, `readAprovacoesPendentes()`, `readInteligencia()` from `site/lib/dashboard/readers.ts`
5. Readers use `node:fs` to read `../campanhas/` and `../dados/` from repo root (dev only; graceful empty on Vercel)
6. `DispatchButton` (client component) is hydrated; on click it POSTs to `/api/skills/dispatch`

### Skill Dispatch Flow

1. `DispatchButton` POSTs `{ skill, args }` to `site/app/api/skills/dispatch/route.ts`
2. Route validates `dashboard_token` cookie, checks `CLAUDE_API_KEY` env var
3. Policy gate: if dispatch involves publication, checks for sensitive terms against `dados/politicas/publicacao.yaml`
4. Returns `{ dispatched: true, executed: false, ... }` — actual skill execution is delegated to external runtime with repo write access (not serverless)

### Cron Trigger Flow

1. Vercel fires authenticated POST to `/api/cron/planejar-pauta-semanal` every Monday at 12:00 UTC (per `site/vercel.json`)
2. Route validates `Authorization: Bearer <CRON_SECRET>` header
3. Returns trigger acknowledgment; real skill execution delegated to repo-backed runtime

**State Management:**
- No client-side global state store; each admin page is a fresh RSC that reads filesystem state on every request (`force-dynamic`)
- Client components manage only local UI state (open FAQ item, dispatch button loading state)

## Key Abstractions

**Reveal:**
- Purpose: Standardized scroll-reveal animation wrapper
- Examples: used in every section component and admin pages
- Pattern: Framer Motion `whileInView` with configurable `delay` prop; `once: true` prevents replay

**CTAButton:**
- Purpose: All CTAs are `<a>` links to external WhatsApp URL — never `<button>` for navigation
- Examples: `site/components/ui/CTAButton.tsx`
- Pattern: Two variants (`primary`, `outline`); accepts `href`, always `target="_blank"`

**readers.ts:**
- Purpose: Server-side filesystem access to repo state (campaigns, data slices, policy)
- Examples: `site/lib/dashboard/readers.ts`
- Pattern: All reads wrapped in `safe()` helper that returns fallback on any exception; no throws exposed to RSC

**Brand constants:**
- Purpose: Single source of truth for factual site data (stats, timeline, WhatsApp URL)
- Examples: `site/lib/site.ts`
- Pattern: `ReadonlyArray` typed constants; env override for `WHATSAPP_URL`

## Entry Points

**Public Site:**
- Location: `site/app/page.tsx`
- Triggers: Any browser request to `/`
- Responsibilities: Composes 7 sections (Hero → CtaFinal), renders header and footer

**Root Layout:**
- Location: `site/app/layout.tsx`
- Triggers: Every route
- Responsibilities: HTML shell, Google Fonts (Anton + Montserrat), metadata, `TrackingScripts`

**Admin Middleware:**
- Location: `site/proxy.ts`
- Triggers: Any request matching `/admin/:path*`
- Responsibilities: Token auth, cookie promotion, redirect to login

**Skill Dispatch API:**
- Location: `site/app/api/skills/dispatch/route.ts`
- Triggers: POST from `DispatchButton` in dashboard
- Responsibilities: Auth, policy gate, trigger acknowledgment

**Cron API:**
- Location: `site/app/api/cron/planejar-pauta-semanal/route.ts`
- Triggers: Vercel Cron POST every Monday 12:00 UTC
- Responsibilities: Auth, trigger acknowledgment, Anthropic client readiness check

## Architectural Constraints

- **Server/Client boundary:** Never add `"use client"` to section or page files. Client components live only in `components/` as leaf nodes.
- **Filesystem reads are dev-only:** `lib/dashboard/readers.ts` reads `../campanhas/` and `../dados/` relative to `process.cwd()`. On Vercel serverless these dirs do not exist — all readers use `safe()` fallback returning empty arrays. Do not add readers that assume filesystem availability in production.
- **Skill execution is delegated:** The API routes do NOT execute Claude Code skills. They authenticate, validate policy, and return `executed: false`. Actual execution requires a runtime with repo write access (GitHub Action or local Claude Code).
- **Global state:** `WHATSAPP_URL` and `STATS`/`TIMELINE` in `lib/site.ts` are module-level constants (not mutable). No other module-level mutable state.
- **Circular imports:** None detected. `lib/` is a terminal layer (imports only external packages and Node built-ins).
- **Edge vs. Node runtime:** `proxy.ts` runs on Edge (no `fs`). API routes declare `export const runtime = "nodejs"` explicitly to use Node.js and access `fs`/Anthropic SDK.

## Anti-Patterns

### Adding "use client" to section components

**What happens:** A section like `Hero.tsx` or `Metodo.tsx` is converted to a client component to add a small interaction.
**Why it's wrong:** It forces the entire section tree to ship as JS, losing the SSR/streaming benefit and increasing bundle size.
**Do this instead:** Extract only the interactive leaf into its own `"use client"` component (e.g., `components/Reveal.tsx` pattern) and import it inside the server section component.

### Reading filesystem in client components

**What happens:** A client component imports `fs` or calls `lib/dashboard/readers.ts` directly.
**Why it's wrong:** `fs` is not available in the browser. It will fail at runtime.
**Do this instead:** Keep all filesystem reads in RSC page files (e.g., `app/admin/dashboard/page.tsx`) and pass data as props to client components.

### Hardcoding brand data in components

**What happens:** A stat value, URL, or copy string is typed directly inside a section component.
**Why it's wrong:** Duplicates the source of truth; changes require hunting multiple files.
**Do this instead:** Add constants to `site/lib/site.ts` and import them.

## Error Handling

**Strategy:** Fail-safe defaults — readers never throw, API routes return structured JSON errors with HTTP status codes.

**Patterns:**
- `lib/dashboard/readers.ts`: all reads wrapped in `safe<T>(fn, fallback)` — filesystem errors return empty arrays silently
- API routes: explicit `if (!env_var)` checks return `{ error: "..." }` with 400/401/500 before business logic
- Client `DispatchButton`: try/catch around fetch, sets `state = "error"` and displays `msg` inline — no unhandled rejections

## Cross-Cutting Concerns

**Fonts:** Anton (display/titles, uppercase) and Montserrat (body) loaded via `next/font/google` in `app/layout.tsx`; exposed as CSS variables `--font-anton`, `--font-montserrat` and Tailwind theme tokens `font-display`, `font-body`.

**Color tokens:** Defined in `app/globals.css` `@theme` block — `bg`, `fg`, `muted`, `surface`, `line`. Strictly monochromatic (black/white/gray). Never use color tokens outside this palette.

**Accessibility:** `focus-visible` outline enforced globally. `prefers-reduced-motion` disables all animations via CSS. `aria-hidden` on decorative elements. FAQ accordion uses `aria-expanded` / `aria-controls` / `role="region"`.

**Tracking:** Opt-in only — `TrackingScripts` checks env vars at build time; no tracking code is injected unless `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, or `NEXT_PUBLIC_CLARITY_ID` are set.

**Authentication:** Admin-only, token-based via `proxy.ts` Edge middleware. Token from `DASHBOARD_TOKEN` env var; passed via query then promoted to `httpOnly` cookie.

---

*Architecture analysis: 2026-05-31*
