---
phase: 02-convers-o-completa
plan: "01"
subsystem: site/conversion
tags: [planos, conversão, whatsapp-deeplink, rsc, monocromático]
dependency_graph:
  requires: [01-landing-editorial-funda-o]
  provides: [PLANS, TESTIMONIALS, COMMUNITY_BENEFITS, COMMUNITY_WHATSAPP_URL, Planos section]
  affects: [site/lib/site.ts, site/components/sections/Planos.tsx, site/app/page.tsx, site/components/sections/Resultados.tsx]
tech_stack:
  added: []
  patterns: [RSC section, ReadonlyArray constants, WhatsApp deeplink builder, tonal card distinction]
key_files:
  created:
    - site/components/sections/Planos.tsx
  modified:
    - site/lib/site.ts
    - site/app/page.tsx
    - site/components/sections/Resultados.tsx
decisions:
  - "Tonal card distinction via bg-bg/bg-surface array — executor chose array indexing over conditional to keep it extensible"
  - "CTA wrapped in div with pt-8 inside mt-auto block for clean spacing above button"
  - "COMMUNITY_BENEFITS as 4 items (spec allows 3-4) for stronger method framing"
metrics:
  duration_minutes: 2
  completed_date: "2026-06-01T19:09:15Z"
  tasks_completed: 3
  tasks_total: 3
  files_changed: 4
---

# Phase 02 Plan 01: Fundação de dados de conversão e seção Planos — Summary

**One-liner:** WhatsApp deeplink builder por plano com distinção tonal entre cards + remoção do placeholder tracejado de depoimentos em Resultados.

## What Was Built

A fundação de dados de conversão foi estabelecida em `lib/site.ts` com 4 novas constantes: `PLANS` (2 planos com deeplink individualizado via `planDeeplink()`), `TESTIMONIALS` (3 placeholders com `publishable: false`), `COMMUNITY_WHATSAPP_URL` (link de grupo exclusivo, separado do número de suporte) e `COMMUNITY_BENEFITS` (4 benefícios on-brand enquadrando a comunidade como parte do método).

A seção `Planos.tsx` foi criada como RSC puro (sem "use client"), com grade 2-col (`sm:grid-cols-2`), cards tonalmente distintos (`bg-bg` vs `bg-surface`) sem badge nem cor de destaque, preço Anton `text-5xl/6xl` como anchor visual, lista de inclusos semântica (`<ul>/<li>`), e CTA `CTAButton` fixado à base de cada card via `flex flex-col + mt-auto`. O deeplink `href={p.whatsappUrl}` leva o usuário ao WhatsApp já com o plano identificado no texto.

Em `page.tsx`, a seção foi registrada entre `<SobreRamon />` e `<FAQ />` para posicionamento correto neste wave (o plano 02-02 insere Depoimentos e Comunidade antes de Planos na ordem final D-01).

O bloco tracejado de placeholder de depoimentos foi removido cirurgicamente de `Resultados.tsx` — a grade de STATS permanece intacta.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Adicionar 4 constantes de conversão em lib/site.ts | 82c027a | site/lib/site.ts |
| 2 | Criar seção Planos (RSC) e registrar em page.tsx | 7138101 | site/components/sections/Planos.tsx, site/app/page.tsx |
| 3 | Remover bloco tracejado de placeholder de Resultados.tsx | adc9dc0 | site/components/sections/Resultados.tsx |

## Verification Evidence

- `npm run typecheck` — PASSED (3x, após cada task)
- `npm run lint` — PASSED (após Task 2)
- `npm run build` — PASSED (verde, build completo com placeholders)
- `grep -c border-dashed Resultados.tsx` — retorna 0 (bloco removido)
- `grep -c "use client" Planos.tsx` — retorna 0 (RSC puro)
- `PLANS` tem 2 elementos; ambos com `whatsappUrl` via `planDeeplink()`
- `TESTIMONIALS` tem 3 elementos, todos `publishable: false`
- `price` usa "Sob consulta" em ambos os planos — nunca string crua "PLACEHOLDER"
- `COMMUNITY_WHATSAPP_URL` contém `chat.whatsapp.com`, distinto de `WHATSAPP_URL`

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

## Known Stubs

| File | Field | Reason |
|------|-------|--------|
| site/lib/site.ts | `PLANS[*].name` | Placeholder "PLACEHOLDER A/B" — nomes reais chegam via chat |
| site/lib/site.ts | `PLANS[*].includes` | Array `["PLACEHOLDER"]` — inclusos reais chegam via chat |
| site/lib/site.ts | `PLANS[*].price` | "Sob consulta" — rótulo intencional on-brand (plano D-06) |
| site/lib/site.ts | `TESTIMONIALS[*]` | `publishable: false` — depoimentos reais chegam via chat |
| site/lib/site.ts | `COMMUNITY_WHATSAPP_URL` | Link placeholder — URL real do grupo chegará via chat |
| site/lib/site.ts | `COMMUNITY_BENEFITS[*]` | Textos prefixados "PLACEHOLDER —" — copy real chegará via chat |
| site/lib/site.ts | `WA_NUMBER` | "0000000000" — número real substituirá via `NEXT_PUBLIC_WHATSAPP_URL` |

Todos os stubs são intencionais e marcados; o build funciona com eles. Nenhum stub impede o goal do plano (fundação de dados de conversão + seção Planos funcional).

## Threat Surface Scan

Nenhuma superfície nova além do mapeado no `<threat_model>` do plano:
- T-02-01 (Tampering — deeplink `wa.me`): `encodeURIComponent()` aplicado em `planDeeplink()` — MITIGADO.
- T-02-02 (Reverse tabnabbing): `CTAButton` usa `rel="noopener noreferrer"` + `target="_blank"` — VERIFICADO.
- T-02-03 (Placeholder cru): campo `price` usa "Sob consulta" — VERIFICADO.

## Self-Check: PASSED

- `site/lib/site.ts` — FOUND, contém as 4 constantes
- `site/components/sections/Planos.tsx` — FOUND, RSC com PLANS.map
- `site/app/page.tsx` — FOUND, contém `<Planos />`
- `site/components/sections/Resultados.tsx` — FOUND, sem border-dashed
- Commit `82c027a` — FOUND (feat: constantes de conversão)
- Commit `7138101` — FOUND (feat: Planos.tsx + page.tsx)
- Commit `adc9dc0` — FOUND (fix: remove bloco tracejado)
