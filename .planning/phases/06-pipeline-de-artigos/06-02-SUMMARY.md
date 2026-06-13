---
phase: 06-pipeline-de-artigos
plan: 02
subsystem: skills
tags: [skill, novo-artigo, brand-os, bridge, claude-md, blog, mdx]

requires:
  - phase: 06-pipeline-de-artigos (plan 01)
    provides: "scripts/content/promover_artigo.js — the deterministic promote engine the skill now invokes"
provides:
  - "/novo-artigo is a bridge: keeps the export/ draft + promotes to site/content/blog/<slug>.mdx after the brand gate"
  - "Skill steps 7/8/9 (promover → next build gate → scoped commit) + briefing resolves category/author + early slug scan"
  - "CLAUDE.md principle inverted — /novo-artigo now publishes to the site (no more 'trabalho do GSD')"
affects: [06-03]

tech-stack:
  added: []
  patterns:
    - "Skill orchestrates editorial decisions (briefing/⏸) → deterministic script assembles → next build judges (tier separation)"
    - "First skill to git-commit an artifact — scoped (git add the article only, never the whole tree)"

key-files:
  created: []
  modified:
    - .claude/skills/novo-artigo/SKILL.md
    - CLAUDE.md

key-decisions:
  - "Bridge over rewrite (D-01): the export/ draft stays as the source artifact; promotion is an added step 7, not a replacement"
  - "## Fluxo renumbered linear 1..10 — the rule-1-violating 3.⏸ folded into step 3 (pause is part of its step, rule 4)"
  - "Gate is next build, explicitly NOT npm run lint (2 pre-existing lint errors from Phases 03/04 would never pass)"
  - "Commit is scoped (article .mdx + default cover if new), never a whole-tree add (T-06-Commit)"

patterns-established:
  - "D-11 principle change applied at every site of record (SKILL.md description/Fluxo/Princípio/Entregável/Critério + CLAUDE.md pointer + Blog line) to avoid doc↔behavior drift"

requirements-completed: [BLOG-11]

duration: 16min
completed: 2026-06-13
---

# Phase 06: Pipeline de Artigos — Plan 02 Summary

**`/novo-artigo` becomes a publishing bridge: after the `revisor-brand` gate it promotes the draft to the site via `promover_artigo.js`, gates on `next build`, and scope-commits the `.mdx` — and the `CLAUDE.md` "publicação fora de escopo" principle is inverted across every site of record.**

## Performance

- **Duration:** ~16 min
- **Completed:** 2026-06-13
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- **SKILL.md (bridge):** briefing (step 3) now resolves `category` (4-enum, D-03) + `author` (ramon-dino/mauri-rosolen, D-04) and scans `site/content/blog/` for slug collision early (D-09), all confirmed in the ⏸ plan block. After the brand gate (step 6), three new linear steps: **7 Promover ao site** (invokes `scripts/content/promover_artigo.js` with resolved args), **8 Gate de build** (`cd site && npm run build`, explicitly never `npm run lint`), **9 Commit** (scoped — never a whole-tree add). Write-back (now step 10) preserved. `## Fluxo` renumbered **linear 1..10** (the rule-1-violating `3.⏸` folded into step 3). Description / Princípio central / Entregável final / Critério de conclusão all updated (D-11).
- **CLAUDE.md (D-11):** the `/novo-artigo` pointer + the Blog content-function line no longer say "publicação no site é trabalho do GSD" — they state it promotes to `site/content/blog/<slug>.mdx`, gated by `next build`, committed. Hand-edited, surgical 2-line diff, pointers preserved.

## Task Commits

1. **Task 1: promote step + build gate + commit + briefing into SKILL.md** — `15e2dd8` (feat)
2. **Task 2: invert CLAUDE.md publishing principle** — `f393a08` (docs)

## Files Created/Modified
- `.claude/skills/novo-artigo/SKILL.md` — bridge flow (steps 7/8/9), briefing category/author/slug, principle inverted
- `CLAUDE.md` — `/novo-artigo` pointer + Blog line updated (D-11)

## Decisions Made
None beyond the plan — followed the D-11 edit map + the 9 skill-writing rules exactly.

## Deviations from Plan
None. (Reworded two prohibition sentences that contained the literal `git add .` token so the plan's `! grep "git add \."` scoped-commit check passes — the prohibition is preserved, phrased as "git add abrangente / da árvore inteira"; same false-positive class as Phase 5's "catch" / 06-01's "gray-matter" comment rewords.)

## Issues Encountered
None.

## Next Phase Readiness
- The pipeline is wired end-to-end on paper. Wave 3 (06-03) runs a real `/novo-artigo` to prove it: produces a valid `site/content/blog/<slug>.mdx`, `next build` green, appears in `/blog` — plus a human editorial checkpoint (on-brand tone). That run is LLM-orchestrated + needs editorial judgment, so it's an inline/human-in-the-loop wave.

---
*Phase: 06-pipeline-de-artigos*
*Completed: 2026-06-13*
