---
phase: 01-landing-editorial-funda-o
plan: "02"
subsystem: ui
tags: [hero, sobre-ramon, cta-final, raman-photo, parallax, scrim, typography, copy]

# Dependency graph
requires:
  - "01-01 (RamonPhoto, ParallaxImage, tokens scrim, @gsap/react)"
provides:
  - "Hero foto-conduzido: RamonPhoto full-bleed + scrim-hero + ParallaxImage leve + H1 sign-off + CTA reconciliado"
  - "SobreRamon: retrato RamonPhoto + scrim-portrait substituindo gradiente; H2 tipografia contida"
  - "CtaFinal: fecho on-brand distinto + CTA reconciliado + escala contida"
  - "page.tsx header CTA reconciliado para consistencia de verbo-noun"
affects: [01-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Foto full-bleed como fundo de section: RamonPhoto absolute inset-0 + z-10 no conteudo de texto"
    - "ParallaxImage envolvendo RamonPhoto como camada de fundo do Hero (D-08)"
    - "RamonPhoto com aspect-[4/5] + border border-line para slot de retrato no SobreRamon"
    - "Fecho de CtaFinal distinto do sign-off do Hero para evitar duplicacao na mesma pagina"

key-files:
  created: []
  modified:
    - "site/components/sections/Hero.tsx"
    - "site/components/sections/SobreRamon.tsx"
    - "site/components/sections/CtaFinal.tsx"
    - "site/app/page.tsx"

key-decisions:
  - "CtaFinal usa fecho distinto (Consistencia vence. Direcao define.) para nao duplicar o sign-off O topo exige direcao. ja presente no H1 do Hero; ambos ancorados no brand-book"
  - "Watermark DINO removido do Hero: com foto real presente (ou placeholder intencional via RamonPhoto), o watermark compete visualmente e perde sentido funcional"
  - "SobreRamon sem ParallaxImage: o parallax leve no Hero ja estabelece o padrao; adicionar parallax ao retrato adicionaria peso sem ganho percebido de tom — discrição do executor conforme plano"
  - "CtaFinal H2 escala: md:text-7xl reconciliado para lg:text-7xl (alinha breakpoint ao teto de display D-02 sem alterar o tamanho maximo)"

# Metrics
duration: ~8min
completed: "2026-06-01"
---

# Phase 01 Plan 02: Hero/SobreRamon/CtaFinal Foto-Conduzido Summary

**Hero editorial foto-conduzido com RamonPhoto full-bleed + scrim + ParallaxImage leve, H1 sign-off da marca, teto tipografico contido e copy reconciliada; SobreRamon com retrato RamonPhoto + scrim-portrait substituindo gradiente editorial; CtaFinal com fecho on-brand distinto e CTA consistente.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-06-01T12:24:00Z
- **Completed:** 2026-06-01T12:31:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Hero: substituido placeholder radial-gradient por RamonPhoto src=/ramon/hero.jpg (full-bleed, priority, scrim=hero) envolvido em ParallaxImage
- Hero: H1 reconciliado para o sign-off literal O topo exige direcao. (UI-SPEC §Copywriting)
- Hero: eyebrow reconciliado para Consultoria Ramon Dino (uppercase, tracking largo)
- Hero: CTA reconciliado para Quero minha direcao
- Hero: teto tipografico baixado de md:text-8xl para lg:text-7xl (D-02, Pattern 4)
- Hero: conteudo de texto em camada z-10 acima do scrim (contraste garantido)
- Hero: permanece RSC; motion via islands importados (DSGN-05)
- SobreRamon: slot de retrato gradiente substituido por RamonPhoto src=/ramon/retrato.jpg, scrim=portrait, aspect-[4/5], border border-line; sem priority (lazy)
- SobreRamon: H2 reconciliado de md:text-6xl para sm:text-5xl (UI-SPEC H2 ceiling)
- CtaFinal: H2 de md:text-7xl para lg:text-7xl (alinha ao teto de display)
- CtaFinal: fecho on-brand distinto do sign-off do Hero (sem duplicacao)
- CtaFinal: CTA reconciliado de Comecando minha consultoria para Quero minha direcao
- page.tsx: header CTA reconciliado de Quero minha consultoria para Quero minha direcao

## Task Commits

1. **Task 1: Hero foto-conduzido + page.tsx CTA** — `b339c3b`
2. **Task 2: SobreRamon retrato + CtaFinal** — `1eb942d`

## Files Created/Modified

- `site/components/sections/Hero.tsx` — RamonPhoto full-bleed + ParallaxImage + scrim-hero + copy reconciliada + teto lg:text-7xl; permanece RSC
- `site/components/sections/SobreRamon.tsx` — RamonPhoto retrato + scrim-portrait + aspect-[4/5] + H2 sm:text-5xl; permanece RSC
- `site/components/sections/CtaFinal.tsx` — fecho on-brand distinto + H2 lg:text-7xl + CTA Quero minha direcao; permanece RSC
- `site/app/page.tsx` — header CTA reconciliado (WHATSAPP_URL e TrackingScripts intocados)

## Build Metrics

- **Build status:** verde (lint + typecheck + npm run build passam)
- **First Load JS (home route /):** Turbopack nao exibe per-route em CLI. Total gzipped de todos os chunks estaticos: 279.5 KB (todas as rotas incluidas — admin, APIs). Os 4 maiores chunks compartilhados (framework + React + Framer + GSAP) somam ~234.5 KB gz. A home carrega subset desses chunks; sem adicao de dependencias neste plano, o delta e zero em relacao ao plano 01. Orcamento <200 KB sera re-avaliado com medicao por rota no check final da fase.
- **DSGN-05 check:** `grep -rl '"use client"' components/sections app/page.tsx` retorna apenas FAQ.tsx (pre-existente, legitimo para useState de accordion) — Hero, SobreRamon, CtaFinal, page.tsx permanecem RSC.

## Contraste e Scrim

- **Scrim hero e portrait:** tokens --scrim-hero e --scrim-portrait aplicados via RamonPhoto (herdados do plano 01). Opacidade de partida: hero 0.35→0.75, portrait 0→0.6. Ajuste fino de opacidade sera feito quando a foto real do Ramon estiver disponivel e o contraste puder ser medido na regiao mais clara da imagem — piso ≥4.5:1.
- **Placeholder monocromatico:** sem foto, Hero e SobreRamon renderizam o placeholder intencional Foto do Ramon (via RamonPhoto) — aspecto deliberado, nao quebrado (D-04).

## Decisions Made

- **Fecho do CtaFinal distinto do sign-off do Hero:** H1 do Hero ja usa O topo exige direcao. (sign-off da marca); repetir na mesma pagina seria redundante e reduziria o impacto. CtaFinal usa Consistencia vence. Direcao define. — ancorado nos principios centrais do brand-book (Consistencia vence intensidade, Direcao > esforco), mantendo o mesmo universo semantico sem duplicar o literal.
- **Watermark DINO removido do Hero:** Com a foto real (ou placeholder intencional via RamonPhoto) ocupando o fundo, o watermark DINO em text-[34vw] comp ete visualmente com a foto e perde funcao. Decisao: removido. A alma editorial da marca emerge pela foto e pelo scrim, nao por overlay tipografico.
- **SobreRamon sem ParallaxImage:** O parallax leve no Hero ja estabelece o movimento editorial da pagina. Adicionar um segundo parallax ao retrato do SobreRamon nao acrescentaria tom — apenas peso de JS extra. Decisao: descartado (discrição do executor, conforme o plano permite).
- **CtaFinal breakpoint md→lg no H2:** O valor maximo continua sendo text-7xl (72px); apenas o breakpoint foi alinhado ao padrao da pagina (lg, nao md).

## Deviations from Plan

### Auto-fixed Issues

None — plano executado exatamente como escrito.

## Known Stubs

- `site/components/sections/Hero.tsx`: passa `src="/ramon/hero.jpg"` para RamonPhoto; arquivo ainda nao existe em `public/ramon/`. O componente renderiza placeholder intencional Foto do Ramon (via RamonPhoto) — intencional (D-04). Troca trivial ao adicionar o arquivo.
- `site/components/sections/SobreRamon.tsx`: idem com `src="/ramon/retrato.jpg"`. Placeholder intencional no slot 4/5.

## Threat Flags

Nenhuma nova superficie de ameaca introduzida alem do escopo do threat model documentado no PLAN.md. Fotos servidas same-origin de public/ (T-02-IMG). TrackingScripts e WHATSAPP_URL intocados (T-02-TRACK).

## Next Phase Readiness

- **Plano 03 (redesign ParaQuemE, Metodo, Resultados, FAQ)** pode iniciar: Hero, SobreRamon e CtaFinal redesenhados; fundacao de tokens/RamonPhoto/ParallaxImage estavel
- **Dependencias satisfeitas para plano 03:** RDSN-01 (parcial — Hero+SobreRamon+CtaFinal done), RDSN-02 (parcial — foto-conduzido aplicado em Hero+SobreRamon)
- **Remanescente para plano 03:** ParaQuemE, Metodo, Resultados, FAQ (4 secoes restantes da landing)

---
*Phase: 01-landing-editorial-fundacao*
*Completed: 2026-06-01*
