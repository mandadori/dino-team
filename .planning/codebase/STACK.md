# Technology Stack

**Analysis Date:** 2026-05-31
**Scope:** `site/` directory only

## Languages

**Primary:**
- TypeScript 5.x - All application code (`.ts`, `.tsx`)
- CSS - Global styles via Tailwind v4 (`site/app/globals.css`)

**Secondary:**
- MDX - Enabled via `@next/mdx` for future blog (Phase 2); no `.mdx` files exist yet

## Runtime

**Environment:**
- Node.js (version not pinned in `package.json`; `package-lock.json` lockfileVersion 3 implies Node 18+)

**Package Manager:**
- npm
- Lockfile: `site/package-lock.json` (present, lockfileVersion 3)

## Frameworks

**Core:**
- Next.js 16.2.6 - App Router, React Server Components, Route Handlers
- React 19.2.4 - UI rendering
- React DOM 19.2.4 - DOM bindings

**Animation:**
- Framer Motion 12.40.0 - Scroll-triggered animations (`Reveal` component), viewport-aware counter (`AnimatedCounter`)

**Icons:**
- Lucide React 1.16.0 - Icon library (declared as dependency; usage not yet present in source)

**Content:**
- `@next/mdx` 16.2.6 - MDX support (configured in `site/next.config.ts`, no MDX pages yet)
- `@mdx-js/loader` 3.1.1 - Webpack/Turbopack MDX loader
- `@mdx-js/react` 3.1.1 - React MDX context provider

**Build/Dev:**
- Turbopack - Dev bundler (configured in `site/next.config.ts` with explicit `root` override)
- PostCSS via `@tailwindcss/postcss` 4.x - CSS processing pipeline (`site/postcss.config.mjs`)
- Tailwind CSS 4.x - Utility-first CSS; configured with `@theme` tokens in `site/app/globals.css`
- ESLint 9.x - Linting; config in `site/eslint.config.mjs` using `eslint-config-next` core-web-vitals + typescript presets

## Key Dependencies

**Critical:**
- `@anthropic-ai/sdk` ^0.98.0 - Claude API client; used in Route Handlers for orchestrator wiring (`site/app/api/cron/planejar-pauta-semanal/route.ts`, `site/app/api/skills/dispatch/route.ts`)
- `next` 16.2.6 - Core framework; App Router, middleware (`proxy.ts`), Route Handlers, Vercel Cron integration
- `framer-motion` 12.40.0 - Used across all animated components; removing it breaks `Reveal` and `AnimatedCounter`

**Infrastructure:**
- `@tailwindcss/postcss` 4.x - Required for Tailwind v4 CSS pipeline
- `typescript` ^5 - Full strict mode (`"strict": true` in `site/tsconfig.json`)

## Configuration

**Environment:**
- Configured via `.env.local` (gitignored); documented in `site/.env.example`
- Required vars (see `.env.example`):
  - `NEXT_PUBLIC_GA_ID` - Google Analytics 4 Measurement ID (optional)
  - `NEXT_PUBLIC_META_PIXEL_ID` - Meta/Facebook Pixel ID (optional)
  - `NEXT_PUBLIC_CLARITY_ID` - Microsoft Clarity ID (optional)
  - `NEXT_PUBLIC_WHATSAPP_URL` - Primary CTA link; falls back to placeholder if unset
  - `CRON_SECRET` - Bearer token Vercel sends to cron endpoints (required for cron auth)
  - `CLAUDE_API_KEY` - Anthropic API key for orchestrator Route Handlers
  - `DASHBOARD_TOKEN` - Admin dashboard access token (cookie-based auth)

**Build:**
- `site/next.config.ts` - MDX enabled, `pageExtensions` includes `.md` and `.mdx`, Turbopack root fixed to `site/`
- `site/tsconfig.json` - ES2017 target, strict mode, path alias `@/*` → `./*`, `bundler` module resolution
- `site/postcss.config.mjs` - Single plugin: `@tailwindcss/postcss`
- `site/eslint.config.mjs` - Next.js core-web-vitals + TypeScript rules; ignores `.next/`, `out/`, `build/`

## Platform Requirements

**Development:**
- Node.js 18+ (implied by lockfileVersion 3 and Next.js 16)
- npm install from `site/` directory
- `.env.local` populated from `site/.env.example`

**Production:**
- Vercel (declared in `site/vercel.json`; base URL hardcoded as `https://dinoteam.vercel.app` in `site/app/layout.tsx`)
- Vercel Cron trigger for `POST /api/cron/planejar-pauta-semanal` every Monday at 12:00 UTC
- Serverless Node.js runtime (Route Handlers use `export const runtime = "nodejs"`)
- Edge runtime for middleware/proxy (`site/proxy.ts` runs on Vercel Edge)

---

*Stack analysis: 2026-05-31*
