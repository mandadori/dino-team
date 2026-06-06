# External Integrations

**Analysis Date:** 2026-05-31
**Scope:** `site/` directory only

## APIs & External Services

**AI Orchestration:**
- Anthropic Claude API - Orchestrates skills (/planejar-pauta-semanal, /atualizar-ramon, /lote-posts) from the admin dashboard and cron
  - SDK/Client: `@anthropic-ai/sdk` ^0.98.0
  - Auth: `CLAUDE_API_KEY` env var
  - Used in: `site/app/api/cron/planejar-pauta-semanal/route.ts`, `site/app/api/skills/dispatch/route.ts`
  - Status: Client initialized and verified as ready; actual skill execution delegated to an external runtime (serverless has no repo write access)

**Messaging / CTA:**
- WhatsApp - Primary CTA for consultoria acquisition
  - Link: `NEXT_PUBLIC_WHATSAPP_URL` env var (falls back to `https://wa.me/0000000000` placeholder if unset)
  - Used in: `site/lib/site.ts`, `site/components/sections/Hero.tsx`, `site/components/ui/CTAButton.tsx`, `site/components/sections/CtaFinal.tsx`
  - Note: Number is a PLACEHOLDER — must be filled before production deploy

## Analytics & Tracking

All three analytics tools are opt-in via env vars. Missing ID = script not injected. Implementation in `site/components/TrackingScripts.tsx`, loaded in `site/app/layout.tsx`.

**Analytics:**
- Google Analytics 4 - Page views and user behavior
  - Env var: `NEXT_PUBLIC_GA_ID`
  - Injected via: `gtag.js` loaded `afterInteractive`
  - Status: Optional; not configured in default state

**Advertising:**
- Meta (Facebook/Instagram) Pixel - Paid traffic tracking and conversion events
  - Env var: `NEXT_PUBLIC_META_PIXEL_ID`
  - Injected via: `fbevents.js` loaded `afterInteractive`; tracks `PageView` on init
  - Status: Optional; required when running paid ads

**Heatmaps/Session Recording:**
- Microsoft Clarity - Heatmaps and session replay
  - Env var: `NEXT_PUBLIC_CLARITY_ID`
  - Injected via: `clarity.ms/tag/{id}` loaded `afterInteractive`
  - Status: Optional; not configured in default state

## Fonts

**Google Fonts:**
- Anton (display/titles) - Loaded via `next/font/google` in `site/app/layout.tsx`
- Montserrat (body/support) - Loaded via `next/font/google` in `site/app/layout.tsx`
- Strategy: `display: "swap"` for both; CSS variables `--font-anton` and `--font-montserrat`

## Data Storage

**Databases:**
- None. No database connection in the site layer.

**File Storage:**
- Local filesystem (read-only from serverless) - `site/lib/dashboard/readers.ts` reads `campanhas/` and `dados/` from the parent repo directory (`REPO_ROOT = path.resolve(process.cwd(), "..")`)
- Note: Reads work in local dev; on Vercel serverless, repo is absent so readers return empty arrays gracefully

**Caching:**
- Next.js default caching (no custom cache layer)

## Authentication & Identity

**Auth Provider:**
- Custom token-based — no third-party auth provider

**Implementation:**
- Admin dashboard protected by `DASHBOARD_TOKEN` env var
- Token accepted via cookie `dashboard_token` or query parameter `?token=`
- Middleware: `site/proxy.ts` (Edge runtime) intercepts all `/admin/*` routes
- Cookie set as `httpOnly`, `sameSite: "lax"`, scoped to `/admin` path
- Login page: `site/app/admin/login/page.tsx`

**Cron Authentication:**
- Vercel sends `Authorization: Bearer <CRON_SECRET>` header to cron endpoints
- Validated in `site/app/api/cron/planejar-pauta-semanal/route.ts`

## CI/CD & Deployment

**Hosting:**
- Vercel - Production deployment target (`https://dinoteam.vercel.app`)
- Cron jobs declared in `site/vercel.json`: `POST /api/cron/planejar-pauta-semanal` every Monday at 12:00 UTC (`0 12 * * 1`)

**CI Pipeline:**
- Not detected. No GitHub Actions or other CI config found under `site/`.

## Webhooks & Callbacks

**Incoming:**
- `POST /api/cron/planejar-pauta-semanal` - Vercel Cron trigger (authenticated by `CRON_SECRET`); registers the trigger and returns JSON; does not execute the skill directly
- `POST /api/skills/dispatch` - Dashboard dispatch endpoint (authenticated by `DASHBOARD_TOKEN` cookie); validates policy, initializes Anthropic client, returns dispatch status; actual skill execution delegated externally

**Outgoing:**
- None detected in the site layer. Instagram publish and other outgoing integrations live in `scripts/integrations/` (outside `site/`).

## Environment Configuration

**Required env vars:**
- `CRON_SECRET` - Must be set for Vercel Cron authentication (generate with `openssl rand -hex 32`)
- `CLAUDE_API_KEY` - Must be set for orchestrator Route Handlers to function
- `DASHBOARD_TOKEN` - Must be set for admin dashboard access (generate with `openssl rand -hex 32`)
- `NEXT_PUBLIC_WHATSAPP_URL` - Must be set to real WhatsApp number before production deploy

**Optional env vars:**
- `NEXT_PUBLIC_GA_ID` - Enables Google Analytics 4
- `NEXT_PUBLIC_META_PIXEL_ID` - Enables Meta Pixel
- `NEXT_PUBLIC_CLARITY_ID` - Enables Microsoft Clarity

**Secrets location:**
- `site/.env.local` (gitignored; template at `site/.env.example`)
- On Vercel: Environment Variables panel in project settings

---

*Integration audit: 2026-05-31*
