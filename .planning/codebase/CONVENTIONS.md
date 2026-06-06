# Coding Conventions

**Analysis Date:** 2026-05-31
**Scope:** `site/` directory (Next.js 16 app)

## Naming Patterns

**Files:**
- React components: PascalCase — `Hero.tsx`, `CTAButton.tsx`, `AnimatedCounter.tsx`
- Utility/lib files: camelCase — `utils.ts`, `site.ts`, `readers.ts`
- Route handlers: Next.js convention — `route.ts` inside `app/api/` segments
- Config files: kebab-case or framework convention — `eslint.config.mjs`, `postcss.config.mjs`, `next.config.ts`

**Functions:**
- React components: PascalCase named exports — `export function Hero()`, `export function CTAButton()`
- Utility functions: camelCase named exports — `export function cn()`, `export function readCampanhas()`
- Event handlers inline in components: short camelCase — `go()` in `DispatchButton.tsx`, `submit()` in login `page.tsx`
- Internal helpers (module-private): camelCase — `safe()`, `matchField()` in `lib/dashboard/readers.ts`

**Variables and Constants:**
- Module-level constants: SCREAMING_SNAKE_CASE for exported data arrays — `WHATSAPP_URL`, `STATS`, `TIMELINE`, `FAQS`, `PRINCIPIOS`, `INCLUI`, `COLUNAS`
- Local variables: camelCase
- TypeScript type unions: PascalCase — `type Variant = "primary" | "outline"`
- Type aliases for object shapes: PascalCase — `CampanhaResumo`, `AprovacaoPendente`, `SliceInfo`

**Components' prop interfaces:**
- Defined inline as destructured object types directly in function signature (no separate `Props` interface):
  ```typescript
  export function CTAButton({
    href,
    children,
    variant = "primary",
    className,
  }: {
    href: string;
    children: ReactNode;
    variant?: Variant;
    className?: string;
  })
  ```

## Code Style

**Formatting:**
- No Prettier config found — formatting is implicit via ESLint + editor.
- Multi-line prop destructuring with trailing comma is standard (observed throughout).
- String concatenation uses template literals or direct concatenation (no style preference conflict found).

**Linting:**
- Tool: ESLint 9 with flat config (`site/eslint.config.mjs`)
- Ruleset: `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`
- Covers: Next.js-specific rules, TypeScript rules, Core Web Vitals rules
- Run: `npm run lint` (calls `eslint` with no path — scans from project root)

**TypeScript:**
- `strict: true` in `site/tsconfig.json` — all strict checks enabled
- `noEmit: true` — TypeScript only used for type checking, not compilation
- Typecheck command: `npm run typecheck` (runs `tsc --noEmit`)
- `ReadonlyArray<T>` used for module-level data constants (e.g., `STATS`, `TIMELINE`, `FAQS`)

## Import Organization

**Order observed across files:**
1. React/Next.js framework imports (`import type { Metadata } from "next"`, `import { useState } from "react"`)
2. Third-party packages (`framer-motion`, `lucide-react`, `next/font/google`, `@anthropic-ai/sdk`)
3. Internal `@/` path alias imports — components, lib, styles
4. CSS imports last in layout files (`import "./globals.css"`)

**Path Aliases:**
- `@/*` maps to `site/` root (configured in `site/tsconfig.json`)
- Usage: `import { cn } from "@/lib/utils"`, `import { WHATSAPP_URL } from "@/lib/site"`, `import { Reveal } from "@/components/Reveal"`

**No barrel (`index.ts`) files** — imports reference specific file paths directly.

## Client vs. Server Components

**"use client" directive:**
- Required for components using React hooks (`useState`, `useEffect`, `useRef`) or Framer Motion's `useInView`
- Applied at file top before any imports
- Examples: `components/FAQ.tsx`, `components/Reveal.tsx`, `components/AnimatedCounter.tsx`, `components/admin/DispatchButton.tsx`, `app/admin/login/page.tsx`

**Server Components (no directive):**
- Default for all components/pages — `app/page.tsx`, `components/sections/Hero.tsx`, `lib/dashboard/readers.ts`
- Server-side data reading done directly in Server Components via reader functions (no `useEffect` fetch)
- `export const dynamic = "force-dynamic"` used on dashboard pages that read live filesystem state

**API Routes:**
- `export const runtime = "nodejs"` declared explicitly on routes using `fs`/`path` — `app/api/skills/dispatch/route.ts`, `app/api/cron/planejar-pauta-semanal/route.ts`

## Error Handling

**API Route pattern (try/catch with early return):**
```typescript
let body: { skill?: string; args?: string };
try {
  body = await req.json();
} catch {
  return NextResponse.json({ error: "corpo inválido" }, { status: 400 });
}
```

**Filesystem reads pattern (safe wrapper function):**
```typescript
function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}
// Usage: return safe(() => fs.readFileSync(p, "utf8"), "(não encontrado)");
```

**Client component error state pattern:**
```typescript
const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
// In catch block:
setState("error");
setMsg(e instanceof Error ? e.message : String(e));
```

**HTTP error responses:**
- Always use `NextResponse.json({ error: "message" }, { status: N })` pattern
- Auth failures return `401`, missing env returns `500`, bad input returns `400`

**No unhandled promise rejections** — all async handlers are wrapped in try/catch.

## Logging

**Framework:** None — no logger library installed.

**Patterns:**
- No `console.log` calls found in source files (clean production code).
- API routes return JSON responses with explanatory `note` fields for diagnostic context instead of logging.

## Comments

**When to comment:**
- JSDoc-style comments (`/** ... */`) on exported functions and components — explain purpose, constraints, and architectural notes
- Inline comments explain non-obvious decisions, brand constraints, and `PLACEHOLDER` markers for missing real content
- Architecture honesty notes for serverless limitations (e.g., `NOTE DE ARQUITETURA` in cron route)

**Examples observed:**
```typescript
/**
 * cn — concatena classes condicionais sem dependência externa.
 * Suficiente para os componentes desta fase (sem conflito de classes Tailwind
 * que exija merge). Se o projeto crescer, trocar por clsx + tailwind-merge.
 */
```
```typescript
// CTA primário. PLACEHOLDER até o número real ser preenchido em NEXT_PUBLIC_WHATSAPP_URL.
```

## Function Design

**Size:** Single-responsibility functions. No function exceeds ~30 lines in source. Complex logic split into helper functions.

**Parameters:** Destructured object pattern for components. Single primitive params for utilities.

**Return Values:**
- Components: JSX directly (no intermediate variable).
- API routes: always `NextResponse.json(...)` — never throw from route handler.
- Utilities: typed return value; no `any`.

## Tailwind Usage

**Design tokens** defined in `site/app/globals.css` via `@theme` (Tailwind v4 native):
- `bg` — `#000000` (main background)
- `fg` — `#ffffff` (text and contrast)
- `muted` — `#7f7f7f` (secondary hierarchy)
- `surface` — `#0c0c0c` (elevated surfaces/cards)
- `line` — `#1f1f1f` (borders)
- `font-display` → Anton (titles, uppercase)
- `font-body` → Montserrat (body text)

**Usage pattern:** All colors and fonts referenced by token name (`text-fg`, `bg-bg`, `border-line`, `font-display`, `font-body`). No hardcoded hex values in component files.

**`cn()` utility** at `site/lib/utils.ts` — lightweight class concatenator (no `tailwind-merge`, intentional for current scale).

## Module Design

**Exports:** Named exports everywhere — no default exports for components. Default exports only for Next.js page conventions (`export default function Home()`, `export default function RootLayout()`).

**Barrel Files:** None used — direct file-path imports only.

**Data co-location:** Module-level constants live in `lib/site.ts` (site-wide data), or at the top of the component file that owns them (e.g., `FAQS` in `FAQ.tsx`, `PRINCIPIOS` in `Metodo.tsx`).

---

*Convention analysis: 2026-05-31*
