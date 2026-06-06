---
phase: 02-convers-o-completa
plan: 03
subsystem: ui
tags: [whatsapp, env-var, nextjs, conversion]

requires:
  - phase: 02-convers-o-completa
    provides: "Seção Planos com deeplinks de WhatsApp por plano (planDeeplink)"
provides:
  - "planDeeplink() derivando WA_NUMBER de NEXT_PUBLIC_WHATSAPP_URL (CONF-01 fechado)"
affects: [04-blog-seo, deploy]

tech-stack:
  added: []
  patterns:
    - "Extração de número WhatsApp via regex /wa\\.me\\/([^?]+)/ com fallback de placeholder"

key-files:
  created: []
  modified:
    - site/lib/site.ts

key-decisions:
  - "WA_NUMBER deriva de NEXT_PUBLIC_WHATSAPP_URL via regex, espelhando o padrão de WHATSAPP_URL; fallback '0000000000' mantido para build sem env var"

patterns-established:
  - "Número base de WhatsApp tem fonte única (NEXT_PUBLIC_WHATSAPP_URL) consumida por todos os CTAs — sem hardcode divergente"

requirements-completed: [CONF-01]

duration: 4min
completed: 2026-06-01
---

# Phase 2 Plan 03: planDeeplink lê NEXT_PUBLIC_WHATSAPP_URL Summary

**`planDeeplink()` passa a derivar `WA_NUMBER` de `process.env.NEXT_PUBLIC_WHATSAPP_URL` via regex, alinhando os CTAs de Plano ao mesmo número base de `WHATSAPP_URL` e fechando CONF-01.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-06-01T22:32:02Z
- **Completed:** 2026-06-01
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- `WA_NUMBER` em `site/lib/site.ts` agora é derivado de `NEXT_PUBLIC_WHATSAPP_URL` via `/wa\.me\/([^?]+)/`, com fallback `"0000000000"` preservado.
- Eliminada a inconsistência: CTAs de Plano (`planDeeplink`) e os demais CTAs (`WHATSAPP_URL`) usam o mesmo número base.
- Build, typecheck e grep de aceitação verdes; nenhum outro arquivo tocado.

## Task Commits

Each task was committed atomically:

1. **Task 02-03-T01: Derivar WA_NUMBER de NEXT_PUBLIC_WHATSAPP_URL em planDeeplink()** - `08f2153` (fix)

**Plan metadata:** _(committed in final docs commit)_

## Files Created/Modified
- `site/lib/site.ts` - Substituído `const WA_NUMBER = "0000000000"` por extração de `NEXT_PUBLIC_WHATSAPP_URL` (regex + fallback); comentário atualizado.

## Decisions Made
- None - followed plan as specified. WA_NUMBER deriva do env var via regex, espelhando WHATSAPP_URL, com fallback de placeholder.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
Para produção, definir `NEXT_PUBLIC_WHATSAPP_URL` (ex.: `https://wa.me/5511999999999?text=...`). Sem ela, todos os CTAs — incluindo deeplinks por plano — caem no placeholder `wa.me/0000000000` (build não quebra).

## Next Phase Readiness
- CONF-01 fechado: número de WhatsApp tem fonte única consumida por todos os CTAs.
- Sem bloqueios introduzidos. `NEXT_PUBLIC_WHATSAPP_URL` continua pendente de configuração no deploy (responsabilidade do operador).

## Self-Check: PASSED
- `site/lib/site.ts` — FOUND
- Commit `08f2153` — FOUND

---
*Phase: 02-convers-o-completa*
*Completed: 2026-06-01*
