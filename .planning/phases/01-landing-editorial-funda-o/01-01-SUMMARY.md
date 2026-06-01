---
phase: 01-landing-editorial-funda-o
plan: "01"
subsystem: ui
tags: [gsap, framer-motion, tailwind, next-image, reduced-motion, accessibility, tokens]

# Dependency graph
requires: []
provides:
  - "Hook usePrefersReducedMotion centralizado em lib/ (DSGN-03)"
  - "Tokens CSS reconciliados em globals.css: #0a0a0a/#ededed/#141414/#262626 + --color-fg-on-light + --color-muted-on-light + --scrim-hero + --scrim-portrait"
  - "@gsap/react@2.1.2 instalado (useGSAP disponível)"
  - "Gates JS de reduced-motion em Reveal (framer useReducedMotion), AnimatedCounter (usePrefersReducedMotion + rAF), CTAButton (CSS puro)"
  - "components/RamonPhoto.tsx: server component com next/image fill + grayscale + scrim via token CSS + placeholder intencional"
  - "components/motion/ParallaxImage.tsx: client island com useGSAP + gsap.matchMedia(no-preference)"
  - "public/ramon/ convencionada com README documentando hero.jpg e retrato.jpg"
affects: [01-02, 01-03]

# Tech tracking
tech-stack:
  added:
    - "@gsap/react@2.1.2 (peer: gsap@3.15.0 já instalado)"
  patterns:
    - "Client island: 'use client' só no leaf component, nunca na seção (DSGN-05)"
    - "Gate reduced-motion por lib: gsap.matchMedia(no-preference), framer useReducedMotion(), usePrefersReducedMotion hook"
    - "next/image fill + priority (Hero LCP) + grayscale + contrast-125 para foto P&B"
    - "Scrim via var(--scrim-hero/portrait) — token CSS, nunca hex inline"
    - "Lazy init de matchMedia no useState (evita react-hooks/set-state-in-effect)"

key-files:
  created:
    - "site/lib/usePrefersReducedMotion.ts"
    - "site/components/RamonPhoto.tsx"
    - "site/components/motion/ParallaxImage.tsx"
    - "site/public/ramon/README.md"
  modified:
    - "site/app/globals.css"
    - "site/components/Reveal.tsx"
    - "site/components/AnimatedCounter.tsx"
    - "site/components/ui/CTAButton.tsx"
    - "site/package.json"
    - "site/package-lock.json"

key-decisions:
  - "D-09/RESEARCH A2: hover do CTAButton via CSS transition-transform + hover:scale-[1.04], não anime.js — auto-respeita reduced-motion via @media global; CTAButton permanece RSC"
  - "D-10/RESEARCH OQ3: Reveal.tsx mantém Framer Motion (já bundled, gate trivial com useReducedMotion); GSAP só para parallax (ParallaxImage)"
  - "usePrefersReducedMotion usa lazy initializer do useState para leitura inicial de matchMedia, evitando setState síncrono no efeito (regra react-hooks/set-state-in-effect do eslint-config-next)"
  - "AnimatedCounter: setValue(to) sob reduced-motion via requestAnimationFrame (não síncrono) para satisfazer mesma regra de lint"
  - "FAQ.tsx mantém 'use client' (pré-existente, legítimo — useState para accordion); não é violação de DSGN-05"

patterns-established:
  - "Pattern 1: client island boundary — 'use client' só em components/motion/* e leaves; seções RSC importam islands"
  - "Pattern 2: reduced-motion gate por lib — gsap.matchMedia(no-preference) nunca cria timeline, framer useReducedMotion early-return estático"
  - "Pattern 3: next/image fill+priority para Hero (LCP), lazy para demais; grayscale+contrast-125 para P&B"
  - "Pattern 4: scrim CSS via token var(--scrim-hero/portrait), nunca hex inline no componente"
  - "Pattern 5: hook matchMedia com lazy useState initializer para evitar setState síncrono no efeito"

requirements-completed: [DSGN-01, DSGN-02, DSGN-03, DSGN-04, DSGN-05]

# Metrics
duration: ~35min
completed: "2026-06-01"
---

# Phase 01 Plan 01: Fundacao Design/Animacao Summary

**Tokens CSS reconciliados, @gsap/react instalado, hook usePrefersReducedMotion criado, gates JS de reduced-motion aplicados em Reveal/AnimatedCounter/CTAButton, e componentes RamonPhoto + ParallaxImage fundados como base para o redesign foto-conduzido dos planos 02 e 03.**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-06-01T11:49:00Z
- **Completed:** 2026-06-01T12:24:00Z
- **Tasks:** 4 (Tasks 1–4; Task 2 foi checkpoint:human-verify)
- **Files modified:** 8

## Accomplishments

- Tokens reconciliados em globals.css: bg/fg/surface/line atualizados + dois tokens novos (--color-fg-on-light, --color-muted-on-light) + dois scrims (--scrim-hero, --scrim-portrait)
- Gate de reduced-motion em JS aplicado em todos os islands: Reveal (framer useReducedMotion), AnimatedCounter (usePrefersReducedMotion + rAF), CTAButton (CSS puro auto-respeita @media), ParallaxImage (gsap.matchMedia no-preference)
- RamonPhoto criado: next/image fill + grayscale + contrast-125 + scrim via token CSS + placeholder monocromático intencional quando src ausente
- ParallaxImage criado: client island isolado em components/motion/ com useGSAP + gsap.matchMedia; apenas translateY leve, sem pin/scrub, degradação em mobile

## Task Commits

1. **Task 1: Reconciliar tokens, scrims, instalar @gsap/react e criar public/ramon/** - `1621583` (feat)
2. **Task 2: Checkpoint human-verify de @gsap/react** - aprovado pelo usuario, sem commit de codigo
3. **Task 3: Hook usePrefersReducedMotion + gates JS** - `9664f6d` (feat)
4. **Task 4: RamonPhoto + ParallaxImage** - `c7aa7e0` (feat)

## Files Created/Modified

- `site/app/globals.css` - Tokens reconciliados + --color-fg-on-light + --color-muted-on-light + --scrim-hero + --scrim-portrait
- `site/lib/usePrefersReducedMotion.ts` - Hook central de reduced-motion com matchMedia lazy init + addEventListener
- `site/components/Reveal.tsx` - Adicionado gate: useReducedMotion de framer-motion, early-return estatico quando reduce=true
- `site/components/AnimatedCounter.tsx` - Adicionado gate: usePrefersReducedMotion + setValue(to) via rAF quando reduce=true; reduce nas deps
- `site/components/ui/CTAButton.tsx` - Adicionado hover:scale-[1.04] + transition-transform (CSS) + focus-visible ring monocromatico; permanece RSC
- `site/components/RamonPhoto.tsx` - Server component: next/image fill + grayscale + scrim via token + placeholder intencional
- `site/components/motion/ParallaxImage.tsx` - Client island: useGSAP + gsap.matchMedia(no-preference) + translateY leve + degradacao mobile
- `site/public/ramon/README.md` - Convencao de pasta documentada (hero.jpg, retrato.jpg)
- `site/package.json` + `site/package-lock.json` - @gsap/react@2.1.2 adicionado

## Build Metrics

- **Build status:** verde (lint + typecheck + npm run build passam)
- **First Load JS (home route `/`):** Baseline desta fase — chunks principais gzipped: ~68.9 kB (framework shared), ~42.6 kB, ~38.5 kB, ~36.6 kB. Nenhuma secao redesenhada ainda (planos 02/03). Three.js fora do caminho da home. Orcamento <200KB será medido novamente ao fim do plano 02.
- **DSGN-05 check:** `grep -rl '"use client"' components/sections app/page.tsx` retorna apenas FAQ.tsx (pre-existente, legitimo para useState de accordion).

## Contraste e Scrim

- **#7f7f7f sobre #0a0a0a:** ~4.5:1 (piso AA confirmado — RESEARCH A4). Token mantido como `--color-muted`.
- **--color-muted-on-light (#595959) sobre branco:** ~7:1, passa AAA — correto para texto secundario em blocos brancos.
- **Scrim hero (rgba 0,0,0 0.35→0.75):** Opacidade de partida conforme UI-SPEC. Ajuste real de opacidade sera feito nos planos 02/03 quando a foto real estiver presente e o texto sobreposto for mensuravel.

## Decisions Made

- **hover do CTAButton via CSS puro** (RESEARCH A2 / D-09): transition-transform + hover:scale-[1.04] auto-respeita o @media reduced-motion global. Não cria CtaMicroFx.tsx com anime.js. CTAButton permanece Server Component.
- **Reveal.tsx mantém Framer Motion** (D-10 / RESEARCH OQ3): já bundled, gate trivial com useReducedMotion(). GSAP usado apenas para parallax (ParallaxImage).
- **usePrefersReducedMotion usa lazy init do useState** para ler matchMedia.matches na montagem sem chamar setState sincronamente no efeito (regra react-hooks/set-state-in-effect do eslint-config-next/core-web-vitals).
- **setValue(to) no AnimatedCounter via requestAnimationFrame** (nao síncrono) para satisfazer a mesma regra de lint mantendo o gate de reduced-motion efetivo.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] matchMedia lazy init em usePrefersReducedMotion para corrigir violacao de lint**
- **Found during:** Task 3 (verificacao de lint)
- **Issue:** O exemplo do RESEARCH chamava `setReduced(mq.matches)` diretamente no corpo do useEffect — viola `react-hooks/set-state-in-effect` do eslint-config-next/core-web-vitals
- **Fix:** Movido para lazy initializer do useState (`useState(() => window.matchMedia(...).matches)`); o useEffect so subscreve ao listener de mudanca
- **Files modified:** site/lib/usePrefersReducedMotion.ts
- **Verification:** npm run lint passa sem erros
- **Committed in:** 9664f6d (Task 3 commit)

**2. [Rule 1 - Bug] setValue no AnimatedCounter via rAF para corrigir violacao de lint**
- **Found during:** Task 3 (verificacao de lint)
- **Issue:** `if (reduce) { setValue(to); return; }` no corpo do useEffect viola a mesma regra
- **Fix:** Wrapper requestAnimationFrame ao redor do setValue(to) mantendo semantica de "imediato" (1 frame de delay, imperceptivel)
- **Files modified:** site/components/AnimatedCounter.tsx
- **Verification:** npm run lint passa sem erros; comportamento de reduced-motion preservado
- **Committed in:** 9664f6d (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (Rule 1 — bugs de violacao de lint na implementacao dos gates JS)
**Impact on plan:** Correcoes necessarias para manter lint verde; nenhum impacto funcional ou de escopo.

## Known Stubs

- `site/components/RamonPhoto.tsx`: quando `src` ausente, renderiza placeholder monocromatico "Foto do Ramon". Intencional (D-04) — troca trivial ao adicionar `/public/ramon/hero.jpg` ou `/public/ramon/retrato.jpg`. Nao e erro.
- `site/public/ramon/` vazia (apenas README): fotos ainda nao disponibilizadas. Slot pronto para recebe-las.

## Threat Flags

Nenhuma nova superficie de ameaca introduzida alem do escopo do threat model documentado no PLAN.md. Fotos servidas same-origin de public/ (T-01-IMG mitigado). @gsap/react aprovado via checkpoint humano (T-01-SC mitigado).

## Issues Encountered

- `react-hooks/set-state-in-effect` (eslint-config-next/core-web-vitals) nao documentado nos exemplos do RESEARCH — requereu ajuste nas implementacoes de usePrefersReducedMotion e AnimatedCounter. Resolvido com lazy init e rAF.
- Nota: FAQ.tsx aparece no check `grep -rl '"use client"' components/sections` — e pre-existente (useState accordion) e nao e violacao de DSGN-05 introduzida neste plano.

## User Setup Required

Para ativar as fotos do Ramon (troca trivial):
1. Adicionar `site/public/ramon/hero.jpg` (foto full-bleed para o Hero)
2. Adicionar `site/public/ramon/retrato.jpg` (retrato vertical 4/5 para SobreRamon)
Apos adicionar os arquivos, as secoes dos planos 02/03 so precisam passar `src="/ramon/hero.jpg"` para o RamonPhoto.

## Next Phase Readiness

- **Plano 02 (redesign Hero, Metodo, FAQ)** pode iniciar: tokens, hook, gates e componentes de foto/parallax estao prontos
- **Plano 03 (redesign ParaQuemE, Resultados, SobreRamon, CtaFinal)** idem
- **Dependencias satisfeitas:** DSGN-01 (tokens), DSGN-02 (@gsap/react instalado), DSGN-03 (hook + gates), DSGN-04 (useGSAP disponivel), DSGN-05 (client islands isolados)
- **Bloqueador conhecido:** fotos P&B do Ramon ausentes (D-04 cobre com placeholder intencional)

---
*Phase: 01-landing-editorial-fundacao*
*Completed: 2026-06-01*
