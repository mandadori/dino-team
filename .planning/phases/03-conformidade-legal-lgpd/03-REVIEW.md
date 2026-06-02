---
phase: 03-conformidade-legal-lgpd
reviewed: 2026-06-02T00:00:00Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - site/app/layout.tsx
  - site/app/page.tsx
  - site/app/privacidade/page.tsx
  - site/app/termos/page.tsx
  - site/components/ConsentProvider.tsx
  - site/components/CookieBanner.tsx
  - site/components/TrackingScripts.tsx
  - site/lib/site.ts
findings:
  critical: 3
  warning: 4
  info: 3
  total: 10
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-06-02
**Depth:** standard
**Files Reviewed:** 8
**Status:** issues_found

## Summary

Review of the LGPD compliance implementation (Phase 3): consent gate
(`ConsentProvider`), cookie banner (`CookieBanner`), tracking scripts
(`TrackingScripts`), legal pages (`/privacidade`, `/termos`), and shared
constants (`site.ts`).

The consent architecture is mechanically sound — `localStorage` hydration is
deferred to `useEffect`, the `TrackingScripts` gate correctly returns `null`
when `consent === false`, and the banner avoids dark patterns. However, three
blockers prevent this from shipping safely: (1) env var IDs are interpolated
directly into inline JavaScript without sanitization, creating a stored XSS
vector; (2) both legal pages are live-deployed with visible `[DATA]`, `[CNPJ]`,
`[RAZÃO SOCIAL]`, `[E-MAIL DO ENCARREGADO DE DADOS]`, and `[COMARCA/UF]`
placeholders that are legally required fields under the LGPD; and (3) the
`COMMUNITY_WHATSAPP_URL` in `site.ts` ships a literal `PLACEHOLDER` string as
the group-invite path, which would expose "PLACEHOLDER" text to users in
production.

---

## Critical Issues

### CR-01: Env var IDs interpolated into inline script strings without sanitization (XSS)

**File:** `site/components/TrackingScripts.tsx:27-60`

**Issue:** `gaId`, `metaPixelId`, and `clarityId` are sourced from
`process.env.NEXT_PUBLIC_*` and interpolated directly into inline `<Script>`
strings via template literals. Although `NEXT_PUBLIC_` vars are baked in at
build time and not user-supplied, a misconfigured deployment that sets a
malicious value (e.g. from a compromised CI secret or a pull-request preview
environment inheriting a rogue `.env`) would inject arbitrary JavaScript into
the page. The strings are never validated or escaped before embedding.

Concretely, the GA inline block:

```ts
{`gtag('config', '${gaId}');`}
```

…and the Clarity block:

```ts
})(window, document, "clarity", "script", "${clarityId}");`
```

…both accept any string content, including `'); alert(1); //`.

**Fix:** Validate each ID against the expected format before injecting, and
refuse to render the script if validation fails.

```ts
// Allowlist patterns per vendor
const GA_RE    = /^G-[A-Z0-9]+$/;
const PIXEL_RE = /^\d{10,20}$/;
const CLARITY_RE = /^[a-z0-9]{10,20}$/i;

export function TrackingScripts() {
  const { consent } = useConsent();
  const gaId      = process.env.NEXT_PUBLIC_GA_ID;
  const pixelId   = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

  if (!consent) return null;

  const safeGa      = gaId      && GA_RE.test(gaId)      ? gaId      : null;
  const safePixel   = pixelId   && PIXEL_RE.test(pixelId)   ? pixelId   : null;
  const safeClarity = clarityId && CLARITY_RE.test(clarityId) ? clarityId : null;

  return (
    <>
      {safeGa && ( /* ... existing GA blocks using safeGa ... */ )}
      {safePixel && ( /* ... existing Pixel block using safePixel ... */ )}
      {safeClarity && ( /* ... existing Clarity block using safeClarity ... */ )}
    </>
  );
}
```

---

### CR-02: Legal pages ship with mandatory LGPD fields as visible placeholders

**File:** `site/app/privacidade/page.tsx:35,53-55,164`
**File:** `site/app/termos/page.tsx:35,67,153,164`

**Issue:** Both pages render the following tokens verbatim in the live HTML:

- `[DATA]` — "Última atualização" date (both pages)
- `[RAZÃO SOCIAL]` — legal entity name (both pages, sections 1/2)
- `[CNPJ]` — tax registration number (both pages)
- `[E-MAIL DO ENCARREGADO DE DADOS]` — DPO contact address (privacidade §§1,7,9; termos §9)
- `[COMARCA/UF]` — jurisdiction clause (termos §8)

Under LGPD Art. 41, the DPO identity and contact channel must be publicly
disclosed. A deployed page showing `[E-MAIL DO ENCARREGADO DE DADOS]` does not
satisfy that requirement. The controller identity (`[RAZÃO SOCIAL]` / `[CNPJ]`)
is similarly mandated by Art. 18, §6. Deploying these pages in this state
exposes the business to regulatory non-compliance from day one.

**Fix:** Before going live, replace every bracketed token with real data.
If the data is not yet available, the safest interim approach is to block
indexing of these routes (`noindex`) and display a "Política em elaboração"
notice, or simply not link to the pages from the footer until the content is
complete.

Minimum required substitutions:
```
[DATA]                       → e.g., "02 de junho de 2026"
[RAZÃO SOCIAL]               → razão social da pessoa jurídica
[CNPJ]                       → XX.XXX.XXX/XXXX-XX
[E-MAIL DO ENCARREGADO...]   → dpo@dinoteam.com.br (or equivalent)
[COMARCA/UF]                 → e.g., "Rio Branco/AC"
```

---

### CR-03: COMMUNITY_WHATSAPP_URL ships the literal string "PLACEHOLDER" to users

**File:** `site/lib/site.ts:95`

**Issue:**
```ts
export const COMMUNITY_WHATSAPP_URL =
  "https://chat.whatsapp.com/PLACEHOLDER";
```

If the `Comunidade` section renders this value as an `<a href>` (which is its
purpose), any visitor who clicks "Entrar na Comunidade" will be sent to
`https://chat.whatsapp.com/PLACEHOLDER` — a real URL that either 404s or joins
an unintended group. This is a user-facing data error, not just a dev
placeholder.

**Fix:** Guard the value at the call site, or make the component conditional
on the presence of a valid URL. The cleanest fix is the same pattern already
used for `TESTIMONIALS` (`publishable: false`):

```ts
// site/lib/site.ts
export const COMMUNITY_WHATSAPP_URL: string | null =
  process.env.NEXT_PUBLIC_COMMUNITY_WA_URL ?? null;
```

Then in `Comunidade.tsx`:
```tsx
{COMMUNITY_WHATSAPP_URL && (
  <CTAButton href={COMMUNITY_WHATSAPP_URL}>Entrar na Comunidade</CTAButton>
)}
```

Alternatively, add the env var to `.env.example` and require it before deploy.

---

## Warnings

### WR-01: `decided` stays `false` during SSR/first paint — banner flashes on every page load for users who already consented

**File:** `site/components/ConsentProvider.tsx:61-74`

**Issue:** `decided` is initialised to `false` and is only corrected inside
`useEffect`. Between the server render and the first client paint (hydration),
`decided === false`, which means `CookieBanner` renders. A user who already
consented 3 months ago will see the banner flicker briefly on every navigation.
This is harmless but visually wrong, and it degrades trust in the consent
mechanism.

**Fix:** Use a three-state model (`"pending" | "accepted" | "refused"`) and
have the banner only appear when the state is explicitly `"refused_or_absent"`
(not `"pending"`), or suppress rendering until after first effect:

```ts
const [decided, setDecided] = useState<"pending" | "decided">("pending");
// CookieBanner: if (decided === "pending" || consent_decided) return null;
```

Alternatively, read a cookie (instead of localStorage) during SSR via
`cookies()` from `next/headers` in the layout — cookies are available
server-side, allowing the correct initial state without a flash.

---

### WR-02: `consent` rehydration races with `TrackingScripts` — scripts may fire before expiry check completes

**File:** `site/components/ConsentProvider.tsx:65-74`
**File:** `site/components/TrackingScripts.tsx:20`

**Issue:** `consent` starts as `false` and is promoted to `true` inside
`useEffect`. `TrackingScripts` returns `null` when `consent === false`, which
is correct. However, the order in which React mounts and runs effects across
sibling components (both rendered by `ConsentProvider`) is not guaranteed to
be synchronous relative to the render cycle. In practice Next.js processes
effects top-down, but the reliance on this ordering is implicit and fragile.
The current structure survives today but is one refactor away from a bug where
scripts load before the hydration check runs.

**Fix:** Move the `consent` state read deeper so it is only evaluated after
the hydration effect confirms it, by adding a `hydrated` guard:

```ts
const [hydrated, setHydrated] = useState(false);
useEffect(() => {
  const stored = readStoredChoice();
  // ... set consent/decided
  setHydrated(true);
}, []);
// TrackingScripts should check: if (!hydrated || !consent) return null;
```

Expose `hydrated` through context or merge it into `consent` semantics
(`consent` should be `false` until hydration is confirmed).

---

### WR-03: `readStoredChoice` is called in module scope inside `useEffect` but `window` is accessed at parse time if module is imported on the server

**File:** `site/components/ConsentProvider.tsx:43-58`

**Issue:** `readStoredChoice` calls `window.localStorage.getItem(...)` at line
45. The function itself is only ever invoked from inside a `useEffect` (line
66), so the call is safe at runtime. However, if module evaluation ever moves
this call to a non-effect context (e.g., a server-side rendering path or a
test environment that imports the module without the `"use client"` boundary
being respected), it would throw `ReferenceError: window is not defined`.

The `"use client"` directive on line 1 protects against this in the Next.js
App Router, but the internal `readStoredChoice` function has no defensive guard
itself, making it subtly fragile.

**Fix:** Add a `typeof window === "undefined"` guard inside `readStoredChoice`:

```ts
function readStoredChoice(): StoredChoice | null {
  if (typeof window === "undefined") return null;
  try {
    // ... existing logic
  } catch {
    return null;
  }
}
```

---

### WR-04: `COOKIE_CONSENT_TTL_MS` uses 30-day months — actual duration is ~180 days, not exactly 6 months

**File:** `site/lib/site.ts:116`

**Issue:**
```ts
export const COOKIE_CONSENT_TTL_MS = 6 * 30 * 24 * 60 * 60 * 1000;
// = 15_552_000_000 ms = ~179.8 days
```

The privacy policy and cookie notice both state "6 meses" (6 months). In
calendar terms, 6 months from June is December — which is 183-184 days, not
180. The discrepancy is ~3-4 days. While LGPD does not mandate millisecond
precision here, the policy says one thing and the code does another: a user
who consented on December 31 would see the banner again in late June, not
late December as promised.

**Fix:** Use a deterministic 6-month offset:
```ts
function sixMonthsFromNow(): number {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return d.getTime();
}
// In persist():
expiresAt: sixMonthsFromNow(),
```

Move `expiresAt` calculation out of the constant and into the `persist`
callback in `ConsentProvider`.

---

## Info

### IN-01: Footer duplicated verbatim across three pages

**File:** `site/app/page.tsx:42-66`
**File:** `site/app/privacidade/page.tsx:215-239`
**File:** `site/app/termos/page.tsx:172-196`

**Issue:** The `<footer>` JSX block — including both nav links — is copied
identically in all three page files. Any future change (adding a "Cookies"
link, updating copy) requires editing three locations.

**Fix:** Extract to a shared `<SiteFooter />` component in
`site/components/SiteFooter.tsx` and import in all three pages.

---

### IN-02: Header also duplicated — privacidade and termos pages have their own header instead of reusing the root layout

**File:** `site/app/privacidade/page.tsx:14-27`
**File:** `site/app/termos/page.tsx:14-27`

**Issue:** Both legal pages define their own `<header>` with logo + CTA button.
`app/layout.tsx` does not render a header, so this is intentional, but the
resulting duplication is the same problem as IN-01 for the footer.

**Fix:** Extract to a `<SiteHeader />` component. If the only difference
between the homepage header (logo as text) and the legal-page header (logo as
`<Link href="/">`) is the link wrapper, parameterize it:
```tsx
<SiteHeader logoLinksHome />
```

---

### IN-03: `motionClass` in `CookieBanner` does not have an exit animation — `motion-safe:animate-none` is a no-op

**File:** `site/components/CookieBanner.tsx:33-34`

**Issue:**
```ts
const motionClass = reduce
  ? ""
  : "transition-transform duration-300 motion-safe:animate-none";
```

When `reduce === false`, the class string applies `transition-transform
duration-300` (a transition, not an animation) and then `motion-safe:animate-none`
(which disables CSS animations — irrelevant since none are applied). There is no
entry or exit animation actually defined. The comment says "transição de saída
discreta" but the component disappears immediately when `decided` becomes `true`
(React unmounts it synchronously). The motion classes are dead code.

**Fix:** Either implement the exit animation using a library (`framer-motion`
`AnimatePresence` is already in the project), or remove the dead `motionClass`
variable and its application entirely.

---

_Reviewed: 2026-06-02_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
