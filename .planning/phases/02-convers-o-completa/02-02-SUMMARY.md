---
phase: 02-convers-o-completa
plan: "02"
subsystem: site/conversion
tags: [depoimentos, comunidade, prova-social, pertencimento, rsc, monocromático, whatsapp]
dependency_graph:
  requires:
    - phase: 02-01
      provides: "TESTIMONIALS, COMMUNITY_WHATSAPP_URL, COMMUNITY_BENEFITS constantes em lib/site.ts; seção Planos.tsx já registrada em page.tsx"
  provides:
    - Depoimentos.tsx — RSC com gate publishable + avatar placeholder monocromático
    - Comunidade.tsx — RSC com lista semântica de benefícios + CTA para grupo exclusivo
    - page.tsx na sequência final D-01 (10 seções)
    - CtaFinal.tsx reconciliado com sign-off "O topo exige direção."
  affects: [site/app/page.tsx, site/components/sections/Depoimentos.tsx, site/components/sections/Comunidade.tsx, site/components/sections/CtaFinal.tsx]
tech_stack:
  added: []
  patterns: [RSC section, publishable gate filter, monochrome avatar placeholder, semantic ul/li benefits list, D-01 landing order]
key_files:
  created:
    - site/components/sections/Depoimentos.tsx
    - site/components/sections/Comunidade.tsx
  modified:
    - site/app/page.tsx
    - site/components/sections/CtaFinal.tsx
key_decisions:
  - "Grade vazia é o comportamento correto na era de placeholder (D-11): Depoimentos renderiza heading + grade vazia, sem 'em breve' nem skeleton"
  - "Avatar placeholder usa inicial do nome em font-display como glyph neutro, espelhando RamonPhoto src-ausente"
  - "CtaFinal reconciliada por adição do sign-off opcional 'O topo exige direção.' preservando copy e estrutura existentes (D-04: reconciliação, não rewrite)"
  - "Comunidade usa lista ul/li para benefícios (acessibilidade semântica, não p-tags)"
patterns-established:
  - "Pattern: publishable gate — filter(t => t.publishable) no render, nunca no build"
  - "Pattern: COMMUNITY_WHATSAPP_URL sempre separado de WHATSAPP_URL em todo componente de Comunidade"
  - "Pattern: avatar placeholder monochrome — role=img + aria-label no container, aria-hidden na inicial"
requirements-completed: [CONV-02, CONV-03, CONF-01]
duration: 8min
completed: "2026-06-01"
---

# Phase 02 Plan 02: Depoimentos + Comunidade + ordem final D-01 — Summary

**Prova social (Depoimentos RSC com gate publishable) + pertencimento (Comunidade RSC com benefícios e CTA de grupo exclusivo) + sequência final D-01 da landing — funil de conversão completo ponta a ponta.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-06-01T19:15:00Z
- **Completed:** 2026-06-01T19:23:00Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- `Depoimentos.tsx` criado como RSC puro com gate editorial D-11 (`publishable` filter), grade 3-col desktop / empilhada mobile (D-13), avatar placeholder monocromático (D-12) espelhando `RamonPhoto` src-ausente, e estrutura contexto→mudança→resultado (CONV-02)
- `Comunidade.tsx` criado como RSC com título enquadrando a comunidade como parte do método, lista semântica `<ul>/<li>` de `COMMUNITY_BENEFITS`, e CTA `CTAButton href={COMMUNITY_WHATSAPP_URL}` apontando para o grupo exclusivo de alunos (CONF-01/D-14/D-17)
- `page.tsx` reordenado para sequência final D-01 completa; `CtaFinal.tsx` reconciliado com sign-off opcional "O topo exige direção." preservando copy e estrutura existentes (D-04)

## Task Commits

1. **Task 1: Criar a seção Depoimentos (RSC)** - `e9cd7df` (feat)
2. **Task 2: Criar a seção Comunidade (RSC)** - `f07d0ce` (feat)
3. **Task 3: Reordenar page.tsx e reconciliar CtaFinal** - `82106f9` (feat)

## Files Created/Modified

- `site/components/sections/Depoimentos.tsx` — RSC: filter publishable, grade 3-col, avatar monochrome placeholder D-12, contexto→mudança→resultado
- `site/components/sections/Comunidade.tsx` — RSC: bloco max-w-4xl centralizado, ul/li de COMMUNITY_BENEFITS, CTA para COMMUNITY_WHATSAPP_URL
- `site/app/page.tsx` — imports de Depoimentos e Comunidade + inserção na ordem D-01 antes de Planos
- `site/components/sections/CtaFinal.tsx` — adição do sign-off "O topo exige direção." como fecho on-brand (copy e estrutura preservadas)

## Decisions Made

- Grade vazia em Depoimentos é o comportamento correto durante a era de placeholder (D-11): heading visível, grade com zero cards — sem skeleton, sem "em breve", sem card vazio
- Avatar placeholder usa a inicial do nome como glyph neutro em `font-display uppercase` para aparência intencional, não quebrada (D-12)
- `CtaFinal` reconciliado por adição cirúrgica do sign-off opcional "O topo exige direção." (UI-SPEC §Copywriting); copy e CTA existentes preservados (D-04 — reconciliação, não rewrite)
- Lista de benefícios da Comunidade usa `<ul>/<li>` semânticos em vez de `<p>` repetidos (UI-SPEC §Accessibility)

## Deviations from Plan

None — plan executed exactly as written.

## Verification Evidence

- `npm run typecheck` — PASSED (após cada task)
- `npm run lint` — PASSED (após cada task)
- `npm run build` — PASSED verde (build completo com placeholders, D-19)
- `Depoimentos.tsx` não contém `"use client"` (em código — apenas em comentário docstring)
- `TESTIMONIALS.filter` presente; `sm:grid-cols-3` presente; `role="img"` presente
- `Comunidade.tsx` contém `href={COMMUNITY_WHATSAPP_URL}` e `<ul>/<li>` semânticos
- Nenhum hex `#` em valor CSS; apenas tokens (`bg-surface`, `text-muted`, `border-line`)
- `CtaFinal.tsx` mantém `href={WHATSAPP_URL}` (suporte); copy distinta de "Quero o Plano"
- Ordem D-01 em `page.tsx`: SobreRamon → Depoimentos → Comunidade → Planos → FAQ → CtaFinal

## Known Stubs

| File | Field | Reason |
|------|-------|--------|
| site/lib/site.ts | `TESTIMONIALS[*]` | `publishable: false` — depoimentos reais chegam via chat; gate D-11 garante que nenhum aparece |
| site/lib/site.ts | `COMMUNITY_WHATSAPP_URL` | Link placeholder `chat.whatsapp.com/PLACEHOLDER` — URL real do grupo chegará via chat |
| site/lib/site.ts | `COMMUNITY_BENEFITS[*]` | Textos prefixados "PLACEHOLDER —" — copy real chegará via chat |

Todos os stubs herdados do plano 02-01 e marcados explicitamente. A landing funciona com eles; nenhum stub impede o goal do plano (funil de conversão completo ponta a ponta).

## Threat Surface Scan

Nenhuma superfície nova além do mapeado no `<threat_model>` do plano:

- T-02-04 (Reverse tabnabbing via target="_blank"): `CTAButton` usa `rel="noopener noreferrer"` — VERIFICADO. Nenhum `<a>` cru hand-rolled em `Comunidade.tsx`.
- T-02-05 (Depoimento placeholder vazando): Gate `.filter(t => t.publishable)` em `Depoimentos.tsx` linha 21 — MITIGADO. Grade vazia; placeholders nunca renderizam.
- T-02-06 (CTA da Comunidade apontando para número de suporte): `href={COMMUNITY_WHATSAPP_URL}` — MITIGADO. Constante separada; ausência de `WHATSAPP_URL` cru em `Comunidade.tsx` verificada.

## Self-Check: PASSED

- `site/components/sections/Depoimentos.tsx` — FOUND
- `site/components/sections/Comunidade.tsx` — FOUND
- `site/app/page.tsx` — FOUND, contém `<Depoimentos />`, `<Comunidade />`, `<Planos />`
- `site/components/sections/CtaFinal.tsx` — FOUND, contém sign-off + `href={WHATSAPP_URL}`
- Commit `e9cd7df` — FOUND (feat: Depoimentos.tsx)
- Commit `f07d0ce` — FOUND (feat: Comunidade.tsx)
- Commit `82106f9` — FOUND (feat: page.tsx reorder + CtaFinal)
- `npm run build` — PASSED verde

## Next Phase Readiness

Phase 02 completa. Funil de conversão ponta a ponta: Hero → ParaQuemE → Metodo → Resultados → SobreRamon → Depoimentos → Comunidade → Planos → FAQ → CtaFinal.

Bloqueantes para produção (herdados, sem novidade):
- Preços, nomes de planos, depoimentos com nome real e link do grupo WhatsApp entregues pelo usuário via chat sob demanda
- `NEXT_PUBLIC_WHATSAPP_URL` deve ser definido em Vercel para o número real substituir o placeholder

---
*Phase: 02-convers-o-completa*
*Completed: 2026-06-01*
