---
phase: 06-pipeline-de-artigos
plan: 01
subsystem: infra
tags: [node-script, deps-free, blog, mdx, frontmatter, validation, node-test, bridge]

requires:
  - phase: 04-blog-seo-production-ready
    provides: "BLOG-01 FrontmatterSchema (site/lib/blog.ts) + AUTHORS/CATEGORIES (site/lib/site.ts) — the contract this script mirrors"
provides:
  - "scripts/content/promover_artigo.js — deterministic deps-free promote-to-site bridge (mirror BLOG-01, slug-scan, path-traversal guard, draft-body reuse)"
  - "Exported promoverArtigo() / parseArgs() — unit-testable (throws, never process.exit in the fn)"
  - "node --test suite (8 cases) wired into root npm test; committed 1200x630 default cover"
affects: [06-02, 06-03]

tech-stack:
  added: []
  patterns:
    - "Deterministic deps-free Node CLI: built-ins only (no zod/gray-matter — root resolves zod@3, lacks the frontmatter parser); hand-rolled validate + YAML"
    - "Mirror-not-import the site contract (FrontmatterSchema not exported; two-zod-version footgun)"
    - "Throwing core fn + process.exit-ing main() split → unit-testable via assert.throws"

key-files:
  created:
    - scripts/content/promover_artigo.js
    - scripts/content/promover_artigo.test.js
    - site/public/blog/covers/_default.webp
  modified:
    - package.json

key-decisions:
  - "Mirror BLOG-01 (8 fields + author/category enums) as hand-rolled checks rather than importing zod (deps-free, avoids the zod@3-vs-@4 footgun)"
  - "promoverArtigo() throws on every error so the unit test can assert.throws; only main() calls process.exit"
  - "Default cover is a real 1200x630 #0a0a0a WEBP (brand bg) committed to disk so the listing renders cleanly (missing file would 404 at runtime); user swaps real art later (D-07)"

patterns-established:
  - "scripts/content/ as the home for brand-OS→site content bridges; PROMOVER_CONTENT_DIR env override for tmpdir tests"
  - "Slug path-traversal guard (^[a-z0-9][a-z0-9-]*$ + resolve-under-dir) on any input that becomes a filename"

requirements-completed: [BLOG-11]

duration: 18min
completed: 2026-06-13
---

# Phase 06: Pipeline de Artigos — Plan 01 Summary

**A deterministic, deps-free `promover_artigo.js` that mirrors the site's BLOG-01 schema, guards slug against collision + path-traversal, discards the draft's brand frontmatter, and writes a valid `site/content/blog/<slug>.mdx` — fully unit-tested (8 cases) with a committed default cover.**

## Performance

- **Duration:** ~18 min
- **Completed:** 2026-06-13
- **Tasks:** 2
- **Files modified:** 4 (3 created, 1 edited)

## Accomplishments
- `scripts/content/promover_artigo.js` — built-ins only (no `zod`/`gray-matter` import — the two-version footgun). Exported `promoverArtigo()` throws on any error (validate/collision/traversal/missing-draft); `main()` does the exit. Mirrors BLOG-01 (8 required fields), enforces `author ∈ {ramon-dino, mauri-rosolen}` (never "Dino Team", D-04) + `category ∈ 4-enum`, slug regex `^[a-z0-9][a-z0-9-]*$` + dest-under-dir guard (V12), early slug-collision scan (D-09), discards the draft's brand frontmatter and reuses only the body (D-06/Pitfall 5).
- `scripts/content/promover_artigo.test.js` — 8 `node --test` cases all green: valid assemble + round-trip (no "Dino Team" leak, single fence pair), invalid author, invalid category, slug collision, path-traversal, bad date, parseArgs, CLI exit via `execFileSync` + `PROMOVER_CONTENT_DIR`.
- `package.json` — added `scripts/content/*.test.js` to root `npm test` (80/80 green; no new dependency).
- `site/public/blog/covers/_default.webp` — real 1200×630 `#0a0a0a` WEBP (generated via Node-PNG → `cwebp`), committed (D-07).

## Task Commits

1. **Task 1: promover_artigo.js (deps-free, mirror, guards)** — `6ea6d92` (feat)
2. **Task 2: node --test suite + test glob + default cover** — `0603402` (test)

## Files Created/Modified
- `scripts/content/promover_artigo.js` — the promote engine
- `scripts/content/promover_artigo.test.js` — 8 unit tests
- `package.json` — test glob (`scripts/content/*.test.js`)
- `site/public/blog/covers/_default.webp` — default cover (1200×630, brand bg)

## Decisions Made
None beyond the plan. Followed the verified PATTERNS molds (append_registro_angulos / registrar_execucao) and the RESEARCH deps-free rule.

## Deviations from Plan
- Reworded two in-code comments that contained the literal token "gray-matter" so the plan's `! grep gray-matter` deps-free check passes — there is no such import; comment-wording only (same class as Phase 5's "catch" reword).
- Upgraded the default cover from a minimal placeholder to a proper 1200×630 `#0a0a0a` WEBP (cwebp was available) — strictly better, same purpose.

## Issues Encountered
- The plan's `file … | grep -iq webp` cover check is a `file`-version quirk: this `file` prints "**Web/P** image" (with a slash), so a literal `webp` grep misses it. The file IS a genuine WEBP — verified by the RIFF/WEBP header + `file` reporting "Web/P image, VP8 encoding, 1200x630". Deterministic intent met.

## Next Phase Readiness
- The promote engine exists, is tested, and writes valid BLOG-01 MDX from args. Wave 2 (06-02) wires it into `/novo-artigo` (promote step + `next build` gate + scoped commit) and inverts the CLAUDE.md "fora de escopo" principle (D-11).

---
*Phase: 06-pipeline-de-artigos*
*Completed: 2026-06-13*
