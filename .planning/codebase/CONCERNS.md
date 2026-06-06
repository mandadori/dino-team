# Codebase Concerns

**Analysis Date:** 2026-05-31
**Scope:** `site/` directory only

---

## Tech Debt

**Orchestration layer is non-functional stubs:**
- Issue: Both API routes that form the core of the orchestration system (`app/api/cron/planejar-pauta-semanal/route.ts` and `app/api/skills/dispatch/route.ts`) return `executed: false` and never actually invoke Claude or run any skill. The Anthropic client is instantiated only to check `typeof client.messages?.create === "function"` — it performs no real call. The cron fires weekly and does nothing.
- Files: `site/app/api/cron/planejar-pauta-semanal/route.ts`, `site/app/api/skills/dispatch/route.ts`
- Impact: The dashboard and cron infrastructure look complete but deliver zero value in production. Skills cannot be dispatched from the UI or triggered automatically.
- Fix approach: Wire the dispatch route to a real Claude API call (agents SDK or `messages.create`) with a streaming response, or route the trigger to a GitHub Actions workflow with repo write access via `workflow_dispatch`.

**Policy gate is a hardcoded string match, not a YAML parse:**
- Issue: `dispatch/route.ts` checks for sensitive terms (`suplemento`, `emagrecer`, `cura`) with a regex on the raw `skill + args` string. It does not actually parse `dados/politicas/publicacao.yaml` — it only checks if the file exists (`politicaPresente`).
- Files: `site/app/api/skills/dispatch/route.ts` (lines 11–53)
- Impact: Any policy changes in `publicacao.yaml` have no effect on the API gate. The hardcoded term list can drift from the YAML source of truth silently.
- Fix approach: Parse `publicacao.yaml` at request time using a YAML library (`js-yaml`) and derive the blocked terms from it dynamically.

**`cn()` utility lacks Tailwind class merge:**
- Issue: `lib/utils.ts` implements `cn()` as a simple filter-and-join without `tailwind-merge`. The file itself documents this gap: "Se o projeto crescer, trocar por clsx + tailwind-merge."
- Files: `site/lib/utils.ts`
- Impact: Composing conflicting Tailwind classes (e.g., `px-4 px-8`) produces both in the output string — the last one wins in CSS cascade, which is fragile and order-dependent. Will cause visual bugs as component variants multiply.
- Fix approach: Replace with `clsx` + `tailwind-merge`. Drop-in: `import { twMerge } from 'tailwind-merge'; import { clsx } from 'clsx'; export const cn = (...inputs) => twMerge(clsx(inputs));`

**MDX dependency installed but unused:**
- Issue: `@mdx-js/loader`, `@mdx-js/react`, and `@next/mdx` are listed as production dependencies and `next.config.ts` wraps the config with `createMDX({})`. No `.mdx` files exist in `app/` or `components/`.
- Files: `site/package.json`, `site/next.config.ts`
- Impact: Adds ~400KB to the dependency tree and increases build time for a feature not yet used. MDX processing is enabled on every build.
- Fix approach: Move MDX packages to devDependencies or remove until actual MDX content exists. Only add `withMDX` wrapper when needed.

**Default Next.js scaffold assets not cleaned up:**
- Issue: `public/` contains `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, and `window.svg` — all default Next.js scaffold files. None are referenced in any source file.
- Files: `site/public/file.svg`, `site/public/globe.svg`, `site/public/next.svg`, `site/public/vercel.svg`, `site/public/window.svg`
- Impact: Orphaned files add noise and mislead future developers about what assets are in use.
- Fix approach: Delete all five scaffold SVGs. Confirm with `grep -r "file.svg\|globe.svg"` before deleting.

---

## Known Bugs

**Token exposed in URL query string:**
- Symptoms: When logging in at `/admin/login`, the form submits via `router.push('/admin/dashboard?token=...')`, placing the `DASHBOARD_TOKEN` plaintext in the browser URL bar, browser history, and server access logs.
- Files: `site/app/admin/login/page.tsx` (line 12), `site/proxy.ts` (lines 16–22)
- Trigger: Any admin login attempt.
- Workaround: The proxy immediately converts the query token to an `httpOnly` cookie on the first request, but the token has already appeared in the URL by that point. Browser history retains it.

**`readInteligencia` only scans first-level `.md` files in slices:**
- Symptoms: `dados/mercado/` has subdirectories (e.g., `concorrentes/stndrd/`, `concorrentes/stndrd-v2/`) containing markdown files. `readInteligencia` uses `fs.readdirSync(dir)` (non-recursive) and filters only `.md` at the top level, so nested files are invisible in the Dados dashboard page.
- Files: `site/lib/dashboard/readers.ts` (lines 98–119)
- Trigger: Any time `dados/mercado/concorrentes/**` contains files.
- Workaround: None. The dashboard silently shows fewer files than actually exist.

---

## Security Considerations

**Token in URL (admin login):**
- Risk: `DASHBOARD_TOKEN` leaks into browser history, server logs, and referrer headers on redirect.
- Files: `site/app/admin/login/page.tsx`, `site/proxy.ts`
- Current mitigation: Proxy converts query token to `httpOnly` cookie immediately, but the initial exposure has already occurred.
- Recommendations: Change login to a `POST` form that sends token in the request body to an API route, which sets the cookie server-side without the token ever appearing in the URL.

**No CSRF protection on dispatch API:**
- Risk: `POST /api/skills/dispatch` authenticates only via cookie (`dashboard_token`). A malicious page could trigger a cross-site request if the cookie is already set and `SameSite` enforcement is weak. The cookie is set as `sameSite: "lax"` which mitigates cross-site POSTs from links but not from scripts in same-site contexts.
- Files: `site/app/api/skills/dispatch/route.ts`, `site/proxy.ts` (cookie config line 23)
- Current mitigation: `SameSite: lax` on the cookie.
- Recommendations: Add an explicit `Origin` or `Referer` header check, or issue a CSRF token on dashboard page load.

**No rate limiting on admin API routes:**
- Risk: `/api/skills/dispatch` and `/api/cron/planejar-pauta-semanal` have no rate limiting. Repeated unauthenticated POSTs can brute-force the token comparison. Authenticated POSTs could (once wired) trigger unbounded Claude API calls.
- Files: `site/app/api/skills/dispatch/route.ts`, `site/app/api/cron/planejar-pauta-semanal/route.ts`
- Current mitigation: None beyond the token check.
- Recommendations: Add Vercel's `@vercel/rate-limit` or a simple in-memory sliding window before auth check.

**No analytics/tracking consent gate (LGPD):**
- Risk: `TrackingScripts.tsx` injects GA4, Meta Pixel, and Microsoft Clarity unconditionally when env vars are set. Brazilian LGPD (Lei 13.709/2018) requires explicit user consent before activating tracking scripts.
- Files: `site/components/TrackingScripts.tsx`, `site/app/layout.tsx`
- Current mitigation: Scripts are opt-in via env vars (disabled if vars are empty), but there is no runtime user consent mechanism.
- Recommendations: Implement a consent banner before deploying with any `NEXT_PUBLIC_*` tracking IDs. Gate `TrackingScripts` on a cookie-stored consent signal.

**`metadataBase` set to placeholder Vercel domain:**
- Risk: `app/layout.tsx` hardcodes `metadataBase: new URL("https://dinoteam.vercel.app")`. If the production domain is different, all OG/Twitter card image URLs and canonical links will be incorrect.
- Files: `site/app/layout.tsx` (line 25)
- Current mitigation: None.
- Recommendations: Move to `process.env.NEXT_PUBLIC_SITE_URL` with the Vercel domain as fallback, and add it to `.env.example`.

---

## Performance Bottlenecks

**`readCampanhas` → `readAprovacoesPendentes` double-reads the filesystem:**
- Problem: `readAprovacoesPendentes()` calls `readCampanhas()` internally (line 71), then for each campaign reads `status.yaml` again (line 73). `dashboard/page.tsx` calls both independently, causing `readCampanhas()` to run twice and every `status.yaml` to be read twice per page load.
- Files: `site/lib/dashboard/readers.ts` (lines 35–90), `site/app/admin/dashboard/page.tsx` (lines 12–14)
- Cause: No shared cache or memoization between server component calls within the same request.
- Improvement path: Accept a pre-computed `CampanhaResumo[]` array as a parameter to `readAprovacoesPendentes`, or memoize `readCampanhas` with `React.cache()` (available in RSC context).

**No `og:image` defined — social sharing broken:**
- Problem: `app/layout.tsx` defines `openGraph` metadata without an `images` array. Sharing on WhatsApp, Twitter, or LinkedIn will display no preview image, severely reducing click-through from the primary conversion channel (WhatsApp CTA).
- Files: `site/app/layout.tsx` (lines 22–33)
- Cause: No brand photo or generated OG image exists yet.
- Improvement path: Generate a static OG image via `app/opengraph-image.tsx` (Next.js static OG) or provide a pre-rendered PNG in `public/`.

---

## Fragile Areas

**Dashboard readers silently return empty on Vercel (production):**
- Files: `site/lib/dashboard/readers.ts`
- Why fragile: All reader functions are wrapped in `safe()` which swallows all exceptions and returns `[]` or empty strings. In production (Vercel serverless), the repo is not on the filesystem, so `REPO_ROOT` resolves to a non-existent path. Every dashboard page renders zeros and empty states with no error indication to the operator.
- Safe modification: Any change to `readers.ts` must account for the fact that it runs in two fundamentally different contexts (local dev with repo vs. Vercel without). Add an `isDev` flag or a `REPO_ROOT` env override to make the context explicit.
- Test coverage: None.

**`proxy.ts` uses Next.js 16 `proxy` convention — undocumented behavior:**
- Files: `site/proxy.ts`
- Why fragile: The file is named `proxy.ts` and exports `export function proxy(...)` — this relies on `PROXY_FILENAME = 'proxy'` in Next.js internals (`node_modules/next/dist/lib/constants.js:289`). This convention is not yet in the public Next.js docs and could be removed or renamed in a patch release. The standard and documented approach is `middleware.ts` with a default export.
- Safe modification: If auth breaks after a Next.js version bump, rename to `middleware.ts` and change to `export default function middleware(...)`.
- Test coverage: None — no smoke test verifies that `/admin/dashboard` redirects unauthenticated requests.

**`DispatchButton` never actually executes a skill:**
- Files: `site/components/admin/DispatchButton.tsx`, `site/app/api/skills/dispatch/route.ts`
- Why fragile: The button calls the API, receives `dispatched: true, executed: false`, and displays the `note` field as confirmation. Any operator who presses "Planejar pauta semanal" will see what appears to be a success message while nothing has happened. There is no visual distinction between "dispatched (real)" and "dispatched (stub)".
- Safe modification: Add `executed` to the response display so the operator knows execution did not occur. Or rename `dispatched` to `acknowledged` to avoid confusion.

---

## Scaling Limits

**Vercel cron on Hobby plan fires once, not repeatedly:**
- Current capacity: One cron job defined in `vercel.json` (`0 12 * * 1` — Mondays at noon UTC).
- Limit: Vercel Hobby plan allows 1 cron job; Pro plan allows 40. The current setup is within limits but the cron does not execute the skill — it just acknowledges the trigger.
- Scaling path: Upgrade to Vercel Pro when adding more cron routes. The real bottleneck is the missing execution wiring, not the cron slot.

**`readCampanhas` scans entire `campanhas/` directory on every page load:**
- Current capacity: Scales linearly with campaign count. Acceptable for dozens.
- Limit: With hundreds of campaigns, synchronous `fs.readdirSync` + per-directory reads on each server render will slow dashboard page load measurably.
- Scaling path: Add an index file (`campanhas/_index.json`) written by skills that the dashboard reads instead of scanning the directory tree.

---

## Missing Critical Features

**No real photos of Ramon:**
- Problem: `Hero.tsx`, `SobreRamon.tsx`, and the section comments explicitly state "foto P&B do Ramon (acervo ainda não disponível)". Both sections use CSS gradients as placeholders. The site is launch-blocking without real brand imagery.
- Blocks: Any production deployment that expects brand-authentic visual identity.

**WhatsApp number not configured:**
- Problem: `lib/site.ts` exports `WHATSAPP_URL` with a hardcoded `wa.me/0000000000` fallback when `NEXT_PUBLIC_WHATSAPP_URL` is empty. Every CTA button on the site points to an invalid number if the env var is not set.
- Files: `site/lib/site.ts` (lines 7–11), all CTA usages in `site/components/sections/`
- Blocks: Any revenue-generating use of the site.

**No testimonials or social proof content:**
- Problem: `Resultados.tsx` contains a hardcoded placeholder div: "Depoimentos e transformações de alunos entram aqui". The section title ("O método funciona — e tem prova") is unsupported by actual testimonials.
- Files: `site/components/sections/Resultados.tsx` (lines 28–37)
- Blocks: Credibility of the conversion funnel.

**No privacy policy or terms of use pages:**
- Problem: No legal pages exist in `app/`. Running analytics (GA4, Meta Pixel) and collecting WhatsApp leads requires a privacy policy under LGPD. The footer has no link to any legal page.
- Files: `site/app/page.tsx` (footer), `site/app/layout.tsx`
- Blocks: Legal compliance for Brazilian market operation.

---

## Test Coverage Gaps

**Zero test files exist:**
- What's not tested: All API routes (auth logic, policy gate, cron trigger), all dashboard readers (filesystem parsing, YAML parsing, graceful degradation), all UI components (render, interaction), all utility functions.
- Files: Entire `site/` directory.
- Risk: Any regression in auth logic, reader parsing, or component rendering goes undetected. The `safe()` swallow-all pattern in `readers.ts` makes silent failures especially hard to detect without tests.
- Priority: High for `app/api/` routes (auth + policy gate), Medium for `lib/dashboard/readers.ts`, Low for presentational components.

**No Lighthouse or a11y CI check:**
- What's not tested: Core Web Vitals, accessibility (contrast, focus, ARIA), SEO meta completeness.
- Files: `site/` (no CI config present beyond `eslint.config.mjs`).
- Risk: Performance regressions from Framer Motion animations or font loading changes go undetected. The `@media (prefers-reduced-motion)` override in `globals.css` is correct but `Reveal.tsx` and `AnimatedCounter.tsx` do not independently respect the media query via JS — they rely solely on the CSS override to stop animations.
- Priority: Medium.

---

*Concerns audit: 2026-05-31*
