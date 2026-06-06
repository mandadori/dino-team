# Codebase Structure

**Analysis Date:** 2026-05-31
**Scope:** `site/` directory only

## Directory Layout

```
site/
├── app/                        # Next.js App Router root
│   ├── layout.tsx              # Root layout: fonts, metadata, TrackingScripts
│   ├── page.tsx                # Public landing page (home, 7 sections)
│   ├── globals.css             # Tailwind v4 @theme tokens + global styles
│   ├── favicon.ico
│   ├── admin/                  # Admin area (auth-protected by proxy.ts)
│   │   ├── layout.tsx          # Admin shell with nav links
│   │   ├── login/
│   │   │   └── page.tsx        # Token entry form (client component)
│   │   └── dashboard/
│   │       ├── page.tsx        # Overview: KPI cards + quick-action buttons
│   │       ├── campanhas/
│   │       │   └── page.tsx    # Campaign kanban (em-curso / aguardando / concluida)
│   │       ├── aprovacoes/
│   │       │   └── page.tsx    # Pending approval queue
│   │       └── dados/
│   │           └── page.tsx    # Data slice freshness monitor
│   └── api/                    # Route Handlers (Node.js runtime)
│       ├── skills/
│       │   └── dispatch/
│       │       └── route.ts    # POST: skill trigger + policy gate
│       └── cron/
│           └── planejar-pauta-semanal/
│               └── route.ts    # POST: Vercel Cron authenticated receiver
│
├── components/                 # Shared React components
│   ├── sections/               # One file per landing page section (RSC)
│   │   ├── Hero.tsx
│   │   ├── ParaQuemE.tsx
│   │   ├── Metodo.tsx
│   │   ├── Resultados.tsx
│   │   ├── SobreRamon.tsx
│   │   ├── FAQ.tsx             # "use client" (accordion state)
│   │   └── CtaFinal.tsx
│   ├── ui/                     # Generic UI primitives
│   │   └── CTAButton.tsx       # Link button, primary + outline variants
│   ├── admin/                  # Admin-specific client components
│   │   └── DispatchButton.tsx  # "use client" — POSTs to /api/skills/dispatch
│   ├── Reveal.tsx              # "use client" — Framer Motion scroll-reveal wrapper
│   ├── AnimatedCounter.tsx     # "use client" — viewport-triggered number counter
│   └── TrackingScripts.tsx     # Opt-in GA/Meta Pixel/Clarity via next/script
│
├── lib/                        # Shared server-side logic and constants
│   ├── site.ts                 # Brand constants: WHATSAPP_URL, STATS, TIMELINE
│   ├── utils.ts                # cn() class concatenation helper
│   └── dashboard/
│       └── readers.ts          # Server-side fs readers for campanhas/, dados/
│
├── public/                     # Static assets served at root
│   └── *.svg                   # Default Next.js placeholder SVGs
│
├── docs/
│   └── home-briefing.md        # Brand/UX brief that drove the homepage design
│
├── proxy.ts                    # Next.js Edge middleware (auth guard for /admin/*)
├── next.config.ts              # Next.js config: MDX enabled, Turbopack root fix
├── tsconfig.json               # TypeScript strict, path alias @/* → ./*
├── eslint.config.mjs           # ESLint 9 flat config (next preset)
├── postcss.config.mjs          # PostCSS with @tailwindcss/postcss
├── vercel.json                 # Cron schedule: /api/cron/planejar-pauta-semanal
├── package.json                # Dependencies and npm scripts
└── .env.example                # Required env vars documentation
```

## Directory Purposes

**`app/`:**
- Purpose: All routing — pages, layouts, API routes. Next.js App Router convention.
- Contains: `.tsx` page/layout files; `route.ts` for API endpoints
- Key files: `app/layout.tsx` (root shell), `app/page.tsx` (homepage), `app/globals.css` (design tokens)

**`app/admin/`:**
- Purpose: Authenticated admin dashboard for the multi-agent orchestration system
- Contains: Dashboard sub-pages (campanhas, aprovações, dados) and login
- Key files: `app/admin/layout.tsx`, `app/admin/dashboard/page.tsx`

**`app/api/`:**
- Purpose: HTTP endpoints callable from client or external services (Vercel Cron)
- Contains: Route Handlers at `route.ts`; all use Node.js runtime explicitly
- Key files: `app/api/skills/dispatch/route.ts`, `app/api/cron/planejar-pauta-semanal/route.ts`

**`components/sections/`:**
- Purpose: One React Server Component per landing page section
- Contains: Self-contained section files that import from `lib/site.ts` and shared components
- Key files: All 7 sections — `Hero.tsx` through `CtaFinal.tsx`

**`components/ui/`:**
- Purpose: Generic, reusable UI primitives shared across public and admin
- Contains: `CTAButton.tsx` (currently the only shared primitive)

**`components/admin/`:**
- Purpose: Admin-specific interactive client components
- Contains: `DispatchButton.tsx` — the only component that calls an API route

**`lib/`:**
- Purpose: Shared server-side utilities; no browser APIs used here
- Contains: Brand constants, class utility, dashboard filesystem readers
- Key files: `lib/site.ts` (constants), `lib/dashboard/readers.ts` (fs access)

**`public/`:**
- Purpose: Static file serving; current contents are placeholder SVGs from Next.js scaffold
- Generated: No
- Committed: Yes (currently only placeholder assets)

**`docs/`:**
- Purpose: Internal design documentation for the site
- Contains: `home-briefing.md` — the editorial brief used to build the homepage

## Key File Locations

**Entry Points:**
- `site/app/layout.tsx`: Root HTML shell, fonts, metadata, tracking
- `site/app/page.tsx`: Public homepage composition
- `site/proxy.ts`: Auth middleware for all admin routes

**Configuration:**
- `site/next.config.ts`: MDX support, Turbopack root
- `site/tsconfig.json`: TypeScript config, `@/*` path alias
- `site/vercel.json`: Vercel Cron schedule
- `site/app/globals.css`: Tailwind v4 design tokens (`@theme` block)

**Core Logic:**
- `site/lib/site.ts`: Brand constants (WhatsApp URL, stats, timeline)
- `site/lib/utils.ts`: `cn()` utility
- `site/lib/dashboard/readers.ts`: Filesystem readers for dashboard state
- `site/app/api/skills/dispatch/route.ts`: Policy gate and skill trigger

**Reusable Components:**
- `site/components/Reveal.tsx`: Standard animation wrapper (used everywhere)
- `site/components/ui/CTAButton.tsx`: All call-to-action buttons

## Naming Conventions

**Files:**
- React components: PascalCase (e.g., `Hero.tsx`, `CTAButton.tsx`, `AnimatedCounter.tsx`)
- Next.js special files: lowercase as required (`page.tsx`, `layout.tsx`, `route.ts`, `globals.css`)
- Library modules: camelCase (e.g., `readers.ts`, `utils.ts`, `site.ts`)
- Config files: lowercase with extension (e.g., `next.config.ts`, `postcss.config.mjs`)

**Directories:**
- All lowercase, hyphenated for multi-word (e.g., `planejar-pauta-semanal/`, `aprovacoes/`)
- Component subdirectories match their role: `sections/`, `ui/`, `admin/`

**Exports:**
- Named exports for all components (no default exports in `components/`)
- Default exports for Next.js page/layout/route files (framework requirement)

**CSS classes (Tailwind):**
- Use design tokens via Tailwind utility names: `bg-bg`, `text-fg`, `text-muted`, `bg-surface`, `border-line`
- Typography: `font-display` (Anton, uppercase titles), `font-body` (Montserrat, body text)
- Never hardcode hex colors — always use the token names defined in `globals.css`

## Where to Add New Code

**New landing page section:**
- Create: `site/components/sections/NomeDaSecao.tsx` (RSC, no `"use client"`)
- Register: Import and add to `site/app/page.tsx` between existing sections
- Pattern: Use `Reveal` wrapper for animations, `CTAButton` for any CTA, import constants from `lib/site.ts`

**New brand constant (stat, copy, URL):**
- Add to: `site/lib/site.ts`
- Use `ReadonlyArray` type for collections; env override pattern for configurable values

**New interactive client component:**
- Create: `site/components/<name>.tsx` with `"use client"` as first line
- If admin-specific: `site/components/admin/<Name>.tsx`
- Keep state local; never fetch data inside — receive it as props from RSC parent

**New admin dashboard sub-page:**
- Create directory: `site/app/admin/dashboard/<slug>/`
- Create: `site/app/admin/dashboard/<slug>/page.tsx`
- Add `export const dynamic = "force-dynamic"` at top
- Call readers from `lib/dashboard/readers.ts` directly in the component body
- Add nav link to `site/app/admin/layout.tsx`

**New API route:**
- Create directory matching the URL path under `site/app/api/`
- Create: `route.ts` with `export const runtime = "nodejs"` if using Node.js APIs
- Always validate auth first; return structured JSON errors with correct HTTP status

**New filesystem reader (for dashboard):**
- Add to: `site/lib/dashboard/readers.ts`
- Always wrap in `safe<T>(fn, fallback)` — never let fs errors surface to RSC
- Resolve paths relative to `REPO_ROOT = path.resolve(process.cwd(), "..")` (repo root, not `site/`)

**New shared UI primitive:**
- Add to: `site/components/ui/<Name>.tsx`
- Accept `className` prop; use `cn()` from `lib/utils.ts` for class merging

## Special Directories

**`.next/`:**
- Purpose: Next.js build output and dev cache
- Generated: Yes (by `next build` / `next dev`)
- Committed: No (in `.gitignore`)

**`node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes (by `npm install`)
- Committed: No

**`docs/`:**
- Purpose: Internal design documentation (not served publicly)
- Generated: No
- Committed: Yes

## Environment Variables Reference

All env vars are documented in `site/.env.example`. Key variables:

| Variable | Used in | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_WHATSAPP_URL` | `lib/site.ts` | WhatsApp CTA link (placeholder until real number) |
| `DASHBOARD_TOKEN` | `proxy.ts`, `api/skills/dispatch/route.ts` | Admin access token |
| `CRON_SECRET` | `api/cron/*/route.ts` | Vercel Cron auth bearer token |
| `CLAUDE_API_KEY` | `api/skills/dispatch/route.ts`, cron route | Anthropic API key for skill execution |
| `NEXT_PUBLIC_GA_ID` | `components/TrackingScripts.tsx` | Google Analytics (optional) |
| `NEXT_PUBLIC_META_PIXEL_ID` | `components/TrackingScripts.tsx` | Meta Pixel (optional) |
| `NEXT_PUBLIC_CLARITY_ID` | `components/TrackingScripts.tsx` | Microsoft Clarity (optional) |

---

*Structure analysis: 2026-05-31*
