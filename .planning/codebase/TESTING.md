# Testing Patterns

**Analysis Date:** 2026-05-31
**Scope:** `site/` directory (Next.js 16 app)

## Test Framework

**Runner:** None — no test framework is installed.

- No `jest.config.*`, `vitest.config.*`, or `playwright.config.*` files exist in `site/`.
- `package.json` (`site/package.json`) has no `test` script and no testing dependencies (no Jest, Vitest, Testing Library, Cypress, Playwright).
- The `devDependencies` contain only: `@tailwindcss/postcss`, TypeScript type packages, ESLint, `tailwindcss`.

**Quality assurance substitutes currently in use:**
- **Type checking:** `npm run typecheck` → runs `tsc --noEmit` with `strict: true`
- **Linting:** `npm run lint` → ESLint 9 with `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`
- **Build verification:** `npm run build` → Next.js production build (catches missing imports, invalid JSX, etc.)
- **Manual preview:** Vercel preview deploy via `npx vercel --yes` (specified in skill `novo-site`)

**Run Commands:**
```bash
npm run typecheck   # TypeScript type check (strict mode, no emit)
npm run lint        # ESLint with Next.js + TypeScript rules
npm run build       # Production build — catches structural errors
npm run dev         # Local dev server for manual visual verification
```

## Test File Organization

**Location:** No test files exist anywhere in `site/`.

**Naming:** Not applicable — no test infrastructure.

**Structure:** Not applicable.

## Test Structure

No automated test suites. The codebase is not structured around testability (no dependency injection, no test doubles, no seam for mocking).

**What currently acts as quality gates (in order of enforcement):**
1. TypeScript strict mode — catches type mismatches and missing null checks at compile time
2. ESLint `core-web-vitals` ruleset — catches Next.js anti-patterns, missing `key` props, etc.
3. Next.js build — catches broken imports, invalid route exports, server/client directive violations
4. `revisor-brand` agent gate — manual brand compliance check before deploy (human-in-the-loop)
5. `curador-web` agent — Lighthouse audit (> 90 on Performance, A11y, Best Practices, SEO) per skill spec in `.claude/skills/novo-site/SKILL.md`

## Mocking

**Framework:** Not applicable — no test framework present.

**What would need mocking if tests were added:**
- `fs`/`path` calls in `site/lib/dashboard/readers.ts` (reads from `../campanhas/`, `../dados/`)
- `process.env` variables (`DASHBOARD_TOKEN`, `CRON_SECRET`, `CLAUDE_API_KEY`, `NEXT_PUBLIC_*`)
- `fetch` calls in `site/components/admin/DispatchButton.tsx` (calls `/api/skills/dispatch`)
- `Anthropic` client in `site/app/api/skills/dispatch/route.ts` and cron route

## Fixtures and Factories

**Test Data:** None — no fixtures or factories.

**Location:** Not applicable.

## Coverage

**Requirements:** None enforced — no coverage tooling configured.

**View Coverage:** Not applicable.

## Test Types

**Unit Tests:** Not implemented.

**Integration Tests:** Not implemented.

**E2E Tests:** Not implemented.

## What to Add When Introducing Tests

If tests are introduced, the recommended approach aligned with the stack:

**Framework choice:**
- Vitest (zero-config with Next.js, fast, ESM-native) for unit/integration
- Playwright for E2E (official Next.js recommendation)

**Install:**
```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event jsdom
npm install -D @playwright/test  # for E2E
```

**Vitest config location:** `site/vitest.config.ts`

**Test file location:** Co-located with source files following `*.test.ts` / `*.test.tsx` pattern, or in a `__tests__/` sibling directory.

**High-value targets (currently untested):**

- `site/lib/utils.ts` — `cn()` function is pure, trivially testable
- `site/lib/dashboard/readers.ts` — `safe()`, `matchField()`, `readCampanhas()`, `readAprovacoesPendentes()`, `readInteligencia()` — require fs mocking
- `site/lib/site.ts` — constants validation (STATS values, TIMELINE items)
- `site/app/api/skills/dispatch/route.ts` — auth logic, policy gate, JSON body parsing
- `site/app/api/cron/planejar-pauta-semanal/route.ts` — auth header validation
- `site/components/admin/DispatchButton.tsx` — state machine (idle → loading → done/error), fetch mock

**Example unit test pattern (if Vitest + Testing Library added):**
```typescript
import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("joins truthy classes", () => {
    expect(cn("a", "b", false, null, "c")).toBe("a b c");
  });
  it("returns empty string for all falsy", () => {
    expect(cn(false, null, undefined)).toBe("");
  });
});
```

**Example API route test pattern (if Vitest added):**
```typescript
import { describe, it, expect, vi } from "vitest";
// Mock fs before importing route
vi.mock("node:fs");
import { POST } from "@/app/api/skills/dispatch/route";

describe("POST /api/skills/dispatch", () => {
  it("returns 401 when token missing", async () => {
    const req = new Request("http://localhost/api/skills/dispatch", {
      method: "POST",
      headers: {},
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
```

## Accessibility Quality Gate

While no automated a11y tests exist, the codebase follows WCAG AA patterns consistently:
- `aria-hidden` on decorative elements (`<span aria-hidden>`, `<Icon aria-hidden />`)
- `aria-expanded` + `aria-controls` + `aria-labelledby` on accordion FAQ (`site/components/sections/FAQ.tsx`)
- `:focus-visible` outline defined in `site/app/globals.css`
- `prefers-reduced-motion` CSS media query in `site/app/globals.css` disables all animations
- `role="img"` + `aria-label` on placeholder image containers

---

*Testing analysis: 2026-05-31*
