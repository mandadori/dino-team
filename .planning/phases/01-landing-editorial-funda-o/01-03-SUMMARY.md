---
phase: 01-landing-editorial-funda-o
plan: "03"
subsystem: ui
tags: [typography, editorial, numbered-steps, white-block, reduced-motion, accordion, framer-motion, accessibility]

# Dependency graph
requires:
  - "01-01 (tokens --color-fg-on-light / --color-muted-on-light, usePrefersReducedMotion, @gsap/react, gates JS)"
  - "01-02 (Hero/SobreRamon/CtaFinal redesenhados; padrão tipográfico contido estabelecido)"
provides:
  - "ParaQuemE refinada: grid editorial gap-px; H2 text-4xl/sm:text-5xl; RSC"
  - "Metodo re-diagramada: 4 passos editoriais numerados com numeral display Anton (01–04, font-display text-5xl/sm:text-6xl); RSC"
  - "Bloco branco pontual D-01 (único na página): lista INCLUI do Metodo com bg-white; texto via --color-fg-on-light / --color-muted-on-light (#595959, ≥4.5:1 sobre branco)"
  - "Resultados: H2 sm:text-5xl; numeral text-5xl/sm:text-6xl; AnimatedCounter e STATS preservados; RSC"
  - "FAQ: gate useReducedMotion adicionado — painel abre instantâneo (div estático) sob reduce=true; AnimatePresence height 0↔auto mantido sob no-preference; H2 sm:text-5xl; a11y preservada"
  - "RDSN-01 completo: todas as 7 seções da landing no padrão editorial monocromático sóbrio"
  - "DSGN-03 completo: último gate faltante (accordion FAQ) fechado"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Numeral editorial display: p.numero em font-display text-5xl/sm:text-6xl com aria-hidden; H3 text-2xl ao lado"
    - "Bloco branco pontual: bg-white + text-[var(--color-fg-on-light)] + text-[var(--color-muted-on-light)]; chips com border-black/15"
    - "Gate FAQ reduced-motion: useReducedMotion() de framer-motion; branch reduce=true renderiza div estático; branch no-preference mantém motion.div com height animation"

key-files:
  created: []
  modified:
    - "site/components/sections/ParaQuemE.tsx"
    - "site/components/sections/Metodo.tsx"
    - "site/components/sections/Resultados.tsx"
    - "site/components/sections/FAQ.tsx"

key-decisions:
  - "Ícones lucide removidos do Metodo em favor dos numerais display: com numerais grandes (01–04) em font-display ocupando o papel de destaque, adicionar ícone competiria visualmente sem acrescentar informação — tom mais contido e editorial"
  - "Bloco INCLUI hospeda o único bg-white (D-01): a lista de 6 itens é o candidato natural de 'respiro de destaque' dentro do Metodo; os chips ficam bem delimitados sobre branco com border-black/15"
  - "Placeholder de depoimentos do Resultados mantido como border-dashed: seção de prova social real é Fase 2; remover seria perder o slot marcado; inventar conteúdo viola tabu de marca"
  - "FAQ: branch estático (reduce=true) usa div simples sem AnimatePresence — instanciação do AnimatePresence sob reduce seria desnecessária e potencialmente causaria flash de contenido"

# Metrics
duration: ~3min
completed: "2026-06-01"
---

# Phase 01 Plan 03: Redesign ParaQuemE / Metodo / Resultados / FAQ Summary

**ParaQuemE/Metodo/Resultados/FAQ redesenhadas no padrão editorial monocromático sóbrio; Metodo re-diagramada como 4 passos editoriais numerados (numerais Anton display) com o único bloco branco pontual da página (lista INCLUI, tokens fg-on-light/muted-on-light); FAQ com gate useReducedMotion fechando o último gap de DSGN-03; todas as 7 seções de RDSN-01 completas.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-06-01T12:33:40Z
- **Completed:** 2026-06-01T12:36:20Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- ParaQuemE: H2 `md:text-6xl` → `text-4xl sm:text-5xl`; grid editorial `gap-px overflow-hidden border border-line bg-line md:grid-cols-2` com células `bg-bg` e `bg-surface`; padding `sm:py-32`; hierarquia de texto refinada; RSC mantido
- Metodo: 4 PRINCIPIOS transformados em passos editoriais numerados — cada um com numeral display (`font-display text-5xl sm:text-6xl`, `aria-hidden`) + H3 `text-2xl` + parágrafo de texto; ícones lucide removidos em favor dos numerais; grid editorial mantido; RSC mantido
- Bloco INCLUI do Metodo recebe `bg-white` (único bg-white da página inteira, D-01); texto primário via `var(--color-fg-on-light)` e secundário via `var(--color-muted-on-light)` (#595959, ≥4.5:1 sobre branco — passa AA); chips com `border-black/15` para contraste sobre branco; NUNCA `text-muted` (#7f7f7f, ~3.5:1 sobre branco, falha AA) usado dentro do bloco
- Resultados: H2 `md:text-6xl` → `text-4xl sm:text-5xl`; numeral do AnimatedCounter `text-6xl md:text-7xl` → `text-5xl sm:text-6xl`; padding `sm:py-32`; AnimatedCounter e STATS preservados; placeholder de depoimentos (border-dashed) mantido; RSC mantido
- FAQ: `useReducedMotion` de framer-motion importado; branch `reduce=true` renderiza painel aberto como `div` estático puro (instântaneo, sem transição de height); branch `no-preference` mantém `AnimatePresence` + `motion.div` com `height 0↔auto` (exceção do accordion); H2 `md:text-6xl` → `text-4xl sm:text-5xl`; a11y preservada integralmente (aria-expanded, aria-controls, role="region", aria-labelledby, estado `open`); `"use client"` legítimo mantido

## Task Commits

1. **Task 1: ParaQuemE + Metodo (passos numerados + bloco branco)** — `9d48eb4`
2. **Task 2: Resultados (escala) + FAQ (gate reduced-motion)** — `58543ed`

## Files Created/Modified

- `site/components/sections/ParaQuemE.tsx` — H2 contido; grid editorial `gap-px`; padding `sm:py-32`; RSC
- `site/components/sections/Metodo.tsx` — passos numerados com numeral display Anton; bloco INCLUI `bg-white` com tokens `--color-fg-on-light`/`--color-muted-on-light`; RSC
- `site/components/sections/Resultados.tsx` — H2 `sm:text-5xl`; numeral `text-5xl/sm:text-6xl`; AnimatedCounter preservado; RSC
- `site/components/sections/FAQ.tsx` — `useReducedMotion` gate; painel estático sob reduce; AnimatePresence mantido sob no-preference; a11y integral

## Build Metrics

- **Build status:** verde (lint + typecheck + `npm run build` passam)
- **DSGN-05 check:** `grep -rl '"use client"' components/sections app/page.tsx` retorna apenas `FAQ.tsx` — ParaQuemE, Metodo, Resultados permanecem RSC; confirmado.
- **bg-white único:** `grep -rn "bg-white" components/sections/` retorna apenas `Metodo.tsx:79` — nenhuma outra seção tem bloco branco.
- **First Load JS (home route /):** Sem adição de dependências neste plano — delta zero em relação ao plano 02. Build Turbopack não exibe per-route JS em CLI (comportamento conhecido desde plano 01). Total de todos os chunks compilados = verde; sem nova lib adicionada.

## Contraste sobre Branco (Bloco INCLUI do Metodo)

- **`--color-fg-on-light` (#0a0a0a) sobre branco (#ffffff):** ~19:1 — passa AAA. Usado para texto primário dos chips.
- **`--color-muted-on-light` (#595959) sobre branco (#ffffff):** ~7:1 — passa AAA. Usado para o label "O que compõe a consultoria".
- **`border-black/15`:** borda dos chips com 15% de opacidade sobre branco — visível e contida.
- **NUNCA `text-muted` (#7f7f7f) sobre branco:** ~3.5:1, falha AA. Ausente do bloco branco — verificado.

## Confirmação do Bloco Branco Pontual (D-01)

**O único bloco de fundo branco (`bg-white`) da página inteira vive na lista INCLUI do `Metodo.tsx` (linha 79).** ParaQuemE, Resultados e FAQ NÃO adicionaram outro `bg-white`. Os chips dentro do bloco usam `border-black/15` e todo texto usa os tokens `fg-on-light`/`muted-on-light` — conformidade total com D-01 e a regra AA de contraste sobre branco.

## RDSN-01 e DSGN-03 — Status Final

- **RDSN-01 (7 seções no padrão editorial):** COMPLETO. Hero + SobreRamon + CtaFinal (plano 02) + ParaQuemE + Metodo + Resultados + FAQ (plano 03) = 7/7 seções redesenhadas.
- **DSGN-03 (gate reduced-motion em todos os islands animados):** COMPLETO. Gates: Reveal (framer `useReducedMotion`, plano 01), AnimatedCounter (`usePrefersReducedMotion` + rAF, plano 01), CTAButton (CSS auto, plano 01), ParallaxImage (`gsap.matchMedia`, plano 01), **FAQ accordion (framer `useReducedMotion`, este plano)**. Todos fechados.

## Decisions Made

- **Ícones lucide removidos do Metodo:** Com numerais display grandes (01–04) em `font-display` ocupando o papel visual de destaque, adicionar ícone além do numeral competiria visualmente sem acrescentar informação semântica. Decisão: numerais substituem os ícones — tom mais contido e editorial. Os 4 PRINCIPIOS e a lista INCLUI preservados sem inventar conteúdo.
- **Bloco branco INCLUI do Metodo (não ParaQuemE):** A lista "O que compõe a consultoria" é o ponto natural de respiro de destaque — lista de 6 itens em chips delimita bem o espaço branco. ParaQuemE permanece sobre fundo preto/surface (dois cards, contraste natural pela diferença de bg-bg vs bg-surface).
- **FAQ branch estático sem AnimatePresence:** Sob `reduce=true`, instanciar o AnimatePresence seria desnecessário e poderia gerar flash de conteúdo. A solução mais limpa é renderizar o painel como `div` puro quando `isOpen` — instântaneo, zero overhead de animação.

## Deviations from Plan

### Auto-fixed Issues

None — plano executado exatamente como escrito.

## Known Stubs

- `site/components/sections/Resultados.tsx`: bloco placeholder de depoimentos (border-dashed) mantido. Intencional — prova social real é Fase 2; slot marcado para receber conteúdo real (depoimentos com nome e transformação verificada) sem inventar resultado.

## Threat Flags

Nenhuma nova superfície de ameaça introduzida além do escopo do threat model documentado no PLAN.md. Todo conteúdo é estático no código — sem `dangerouslySetInnerHTML`, sem input de usuário. FAQ tem estado de UI local (accordion) sem dados sensíveis (T-03-CLIENT — accept).

## Self-Check: PASSED

- `site/components/sections/ParaQuemE.tsx` — FOUND
- `site/components/sections/Metodo.tsx` — FOUND (bg-white presente, numerais 01–04 presente, font-display presente, tokens fg-on-light/muted-on-light presentes)
- `site/components/sections/Resultados.tsx` — FOUND (AnimatedCounter presente, sem use client, sem md:text-6xl)
- `site/components/sections/FAQ.tsx` — FOUND (useReducedMotion presente, use client no topo, sem md:text-6xl)
- Commit `9d48eb4` (Task 1) — FOUND
- Commit `58543ed` (Task 2) — FOUND
- Build verde — CONFIRMED
- DSGN-05: só FAQ.tsx em sections/ tem "use client" — CONFIRMED
- bg-white único em Metodo.tsx — CONFIRMED

---
*Phase: 01-landing-editorial-fundacao*
*Completed: 2026-06-01*
