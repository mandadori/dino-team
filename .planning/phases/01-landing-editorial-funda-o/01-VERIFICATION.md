---
phase: 01-landing-editorial-funda-o
verified: 2026-06-01T16:43:47Z
status: gaps_found
score: 3/4 must-haves verified
overrides_applied: 0
gaps:
  - truth: "Um visitante vê fotos reais P&B do Ramon no Hero e no SobreRamon (não mais placeholders de gradiente)"
    status: failed
    reason: "public/ramon/ contém apenas README.md — nenhum arquivo hero.jpg ou retrato.jpg existe. Visitantes veem o placeholder monocromático 'Foto do Ramon' em vez de fotos reais. SC-1 e RDSN-02 requerem fotos integradas."
    artifacts:
      - path: "site/public/ramon/hero.jpg"
        issue: "MISSING — arquivo não existe"
      - path: "site/public/ramon/retrato.jpg"
        issue: "MISSING — arquivo não existe"
    missing:
      - "Adicionar site/public/ramon/hero.jpg (foto do Ramon full-bleed, de preferência P&B ou que o filter grayscale+contrast-125 do RamonPhoto converta bem)"
      - "Adicionar site/public/ramon/retrato.jpg (retrato vertical 4/5 do Ramon para SobreRamon)"
      - "Após adicionar os arquivos, SC-1 e RDSN-02 serão satisfeitos — o código está 100% pronto para recebê-los"
human_verification:
  - test: "Verificar contraste do texto sobreposto sobre a foto (após adicionar as fotos)"
    expected: "Texto principal e secundário sobre a foto do Hero e o retrato do SobreRamon passam WCAG AA (≥4.5:1) graças ao scrim aplicado"
    why_human: "O contraste real depende da região mais clara da foto específica do Ramon — não é verificável sem a foto"
  - test: "Verificar comportamento visual de prefers-reduced-motion no browser"
    expected: "Com DevTools > Rendering > Emulate reduced-motion: Reveal aparece estático, AnimatedCounter mostra valor final sem animar, hover do CTA não escala, parallax do Hero não dispara, accordion do FAQ abre instantâneo"
    why_human: "Requer interação com DevTools e inspeção visual do comportamento — não verificável via grep"
  - test: "Verificar aparência do bloco branco pontual (Metodo, lista INCLUI)"
    expected: "O bloco bg-white do Metodo é visualmente sóbrio, chips legíveis, texto secundário (#595959) claramente distinguível sobre o fundo branco"
    why_human: "Qualidade visual e percepção do tom editorial requerem inspeção humana"
---

# Phase 01: Landing Editorial + Fundação — Verification Report

**Phase Goal:** Redesenhar a landing page existente no padrão editorial sóbrio foto-conduzido — tokens reconciliados, motion respeitando prefers-reduced-motion, identidade visual monocromática autêntica.
**Verified:** 2026-06-01T16:43:47Z
**Status:** gaps_found
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| SC-1 | Um visitante vê as 7 seções redesenhadas com fotos reais P&B do Ramon no Hero e SobreRamon (não mais placeholders) | FAILED | `public/ramon/` contém apenas `README.md`; nenhum `hero.jpg` ou `retrato.jpg` existe; visitantes veem o placeholder "Foto do Ramon" |
| SC-2 | Texto secundário sobre fundo branco passa contraste WCAG AA (≥4.5:1) | VERIFIED | `--color-muted-on-light: #595959` em globals.css; Metodo.tsx usa `text-[var(--color-muted-on-light)]` no único bloco `bg-white`; nunca usa `text-muted` (#7f7f7f) sobre branco; contraste medido: #595959 sobre branco = ~7:1, passa AAA |
| SC-3 | Com `prefers-reduced-motion` ativo, nenhuma animação dispara — conteúdo aparece estático | VERIFIED | Hook `usePrefersReducedMotion` (useSyncExternalStore, corretamente implementado); Reveal.tsx gate via `useReducedMotion` framer; AnimatedCounter gate via `usePrefersReducedMotion` + rAF; ParallaxImage gate via `gsap.matchMedia("no-preference")`; FAQ accordion gate via `useReducedMotion`; CSS safety net `@media (prefers-reduced-motion: reduce)` preservado em globals.css |
| SC-4 | Libs de animação no papel correto e first-load JS abaixo de 200KB | VERIFIED (partial) | GSAP+ScrollTrigger isolados em `components/motion/ParallaxImage.tsx` (client island); Framer Motion em Reveal/FAQ (legado/UI); anime.js não usada nesta fase (D-10 respeitado); build verde; medição per-rota não disponível via Turbopack CLI, mas zero dependências adicionadas em planos 02 e 03 |

**Score:** 3/4 truths verified (SC-1 FAILED — fotos reais ausentes)

---

## Required Artifacts

### Plan 01-01 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `site/lib/usePrefersReducedMotion.ts` | Hook central de detecção de reduced-motion | VERIFIED | Existe; usa `useSyncExternalStore` com `window.matchMedia`; getServerSnapshot retorna false (sem SSR mismatch); exports `usePrefersReducedMotion(): boolean` |
| `site/components/motion/ParallaxImage.tsx` | Parallax leve de foto via GSAP useGSAP + gsap.matchMedia | VERIFIED | `"use client"` no topo; `useGSAP` de `@gsap/react`; `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`; somente translateY, sem pin; degradação mobile (amplitude 16px vs 40px) |
| `site/components/RamonPhoto.tsx` | next/image full-bleed P&B + scrim + fallback placeholder | VERIFIED | `next/image` com `fill`; `grayscale contrast-125`; overlay `aria-hidden` com `style={{ background: scrimVar }}`; usa `var(--scrim-hero)`/`var(--scrim-portrait)` (nunca hex inline); placeholder com `role="img"` quando `src` ausente; sem `"use client"` |
| `site/app/globals.css` | Tokens reconciliados + tokens sobre-branco + scrims | VERIFIED | `--color-bg: #0a0a0a`, `--color-fg: #ededed`, `--color-surface: #141414`, `--color-line: #262626`, `--color-muted: #7f7f7f`; novos: `--color-fg-on-light: #0a0a0a`, `--color-muted-on-light: #595959`; `--scrim-hero` e `--scrim-portrait` em `:root`; bloco `@media (prefers-reduced-motion: reduce)` preservado |
| `site/public/ramon/README.md` | Documentação da convenção de pasta | VERIFIED | Existe; documenta `hero.jpg` e `retrato.jpg` |
| `site/public/ramon/hero.jpg` | Foto real do Ramon para Hero | MISSING | Arquivo não existe — apenas README.md na pasta |
| `site/public/ramon/retrato.jpg` | Retrato do Ramon para SobreRamon | MISSING | Arquivo não existe |

### Plan 01-02 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `site/components/sections/Hero.tsx` | Hero editorial foto-conduzido com RamonPhoto + scrim + parallax + copy reconciliada | VERIFIED (code) / FAILED (foto) | Importa `RamonPhoto` com `src="/ramon/hero.jpg"`, `priority`, `scrim="hero"`, envolto em `ParallaxImage`; H1 "O topo exige direção."; eyebrow "Consultoria Ramon Dino"; CTA "Quero minha direção"; `lg:text-7xl` (sem `text-8xl`); sem `"use client"`. Foto ausente = placeholder visível |
| `site/components/sections/SobreRamon.tsx` | SobreRamon com retrato RamonPhoto + scrim-portrait | VERIFIED (code) / FAILED (foto) | `RamonPhoto` com `src="/ramon/retrato.jpg"`, `scrim="portrait"`, `aspect-[4/5]`, `border border-line`; H2 `sm:text-5xl` (sem `md:text-6xl`); sem `"use client"` |
| `site/components/sections/CtaFinal.tsx` | CtaFinal com fecho on-brand e CTA consistente | VERIFIED | Fecho "Consistência vence. Direção define." (distinto do sign-off do Hero); CTA "Quero minha direção"; `lg:text-7xl` (sem `text-8xl`); sem `"use client"` |
| `site/app/page.tsx` | Header CTA reconciliado | VERIFIED | "Quero minha direção"; `WHATSAPP_URL` e `TrackingScripts` intocados |

### Plan 01-03 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `site/components/sections/Metodo.tsx` | Metodo re-diagramada como passos editoriais numerados | VERIFIED | 4 PRINCIPIOS com numerais `"01"–"04"` em `font-display text-5xl sm:text-6xl` + `aria-hidden`; H3 `text-2xl`; bloco INCLUI com `bg-white` + `text-[var(--color-muted-on-light)]` + `text-[var(--color-fg-on-light)]`; sem `"use client"` |
| `site/components/sections/FAQ.tsx` | FAQ com gate de reduced-motion no accordion | VERIFIED | `"use client"` legítimo; `useReducedMotion` de framer-motion; branch `reduce=true` renderiza `div` estático puro (sem `AnimatePresence`); branch `no-preference` mantém `AnimatePresence` + `motion.div` height 0↔auto; a11y integral: `aria-expanded`, `aria-controls`, `role="region"`, `aria-labelledby`, estado `open` |
| `site/components/sections/ParaQuemE.tsx` | ParaQuemE no padrão editorial | VERIFIED | H2 `text-4xl sm:text-5xl` (sem `md:text-6xl`); grid `gap-px` editorial; sem `"use client"`; sem `bg-white` |
| `site/components/sections/Resultados.tsx` | Resultados com AnimatedCounter preservado | VERIFIED | H2 `sm:text-5xl`; `AnimatedCounter` e `STATS` preservados; numeral `text-5xl sm:text-6xl`; sem `"use client"`; sem `bg-white`; placeholder de depoimentos `border-dashed` mantido |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `AnimatedCounter.tsx` | `usePrefersReducedMotion.ts` | import + gate | VERIFIED | `import { usePrefersReducedMotion }` presente; `if (reduce) { rAF(() => setValue(to)) }` no useEffect; `reduce` nas deps |
| `ParallaxImage.tsx` | `@gsap/react` | `useGSAP` | VERIFIED | `import { useGSAP } from "@gsap/react"` presente; `gsap.registerPlugin(ScrollTrigger, useGSAP)`; `useGSAP(() => { ... }, { scope })` |
| `Hero.tsx` | `RamonPhoto.tsx` | import + uso | VERIFIED | `import { RamonPhoto }` presente; `<RamonPhoto src="/ramon/hero.jpg" priority scrim="hero" className="absolute inset-0" />` |
| `Hero.tsx` | `ParallaxImage.tsx` | import (parallax) | VERIFIED | `import { ParallaxImage }` presente; `<ParallaxImage>` envolvendo RamonPhoto |
| `SobreRamon.tsx` | `RamonPhoto.tsx` | import + uso | VERIFIED | `import { RamonPhoto }` presente; `<RamonPhoto src="/ramon/retrato.jpg" scrim="portrait" className="aspect-[4/5] border border-line" />` |
| `FAQ.tsx` | `framer-motion useReducedMotion` | gate do accordion | VERIFIED | `import { ..., useReducedMotion } from "framer-motion"`; `const reduce = useReducedMotion()`; branch ternário `reduce ? <div estático> : <AnimatePresence>` |
| `Metodo.tsx` (white block) | `globals.css tokens` | `--color-muted-on-light` / `--color-fg-on-light` | VERIFIED | `text-[var(--color-muted-on-light)]` e `text-[var(--color-fg-on-light)]` usados exclusivamente no bloco `bg-white`; `text-muted` ausente desse bloco |

---

## Data-Flow Trace (Level 4)

Not applicable — this phase produces no API routes or data-fetching components. All data is static (arrays in `lib/site.ts`). The components render static content and pass it correctly.

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Lint passes | `npm run lint` | No output (clean) | PASS |
| TypeCheck passes | `npx tsc --noEmit` | No output (clean) | PASS |
| Build green | `npm run build` | All 7 static pages generated successfully | PASS |
| Only FAQ.tsx has "use client" in sections | `grep -rl '"use client"' components/sections` | `components/sections/FAQ.tsx` only | PASS |
| Single bg-white in sections | `grep -rn "bg-white" components/sections/` | `Metodo.tsx:79` only | PASS |
| No text-8xl in sections | `grep -n "text-8xl" Hero.tsx CtaFinal.tsx SobreRamon.tsx` | Clean | PASS |
| No md:text-6xl remaining | `grep -n "md:text-6xl" sections/*.tsx` | Clean | PASS |
| @gsap/react installed | `node -e "require('./package.json').dependencies['@gsap/react']"` | `^2.1.2` | PASS |
| No debt markers (TBD/FIXME/XXX) | `grep -rn "TBD\|FIXME\|XXX" ...` | Clean in all phase-modified files | PASS |

---

## Probe Execution

No probes declared in PLAN files and no conventional `scripts/*/tests/probe-*.sh` exist.

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| DSGN-01 | 01-01 | Tokens de cor garantem contraste WCAG AA em ambos os fundos | SATISFIED | `--color-muted-on-light: #595959` (~7:1 sobre branco); `--color-muted: #7f7f7f` (~4.5:1 sobre `#0a0a0a`); tokens aplicados corretamente nos blocos brancos e pretos |
| DSGN-02 | 01-01 | Mapa de responsabilidade única por lib de animação + bundle budget | SATISFIED | GSAP=scroll (ParallaxImage); Framer=legado/UI (Reveal, FAQ); anime.js não usada nesta fase; build verde; `@gsap/react` instalado |
| DSGN-03 | 01-01, 01-03 | Hook `usePrefersReducedMotion` + gates JS por lib | SATISFIED | Hook centralizado (useSyncExternalStore); gates em Reveal (framer), AnimatedCounter (hook), CTAButton (CSS), ParallaxImage (gsap.matchMedia), FAQ accordion (framer) |
| DSGN-04 | 01-01 | `@gsap/react` adicionado; `useGSAP()` é o padrão | SATISFIED | `@gsap/react@^2.1.2` em package.json; `useGSAP` usado em ParallaxImage; nenhum `useEffect` cru para GSAP |
| DSGN-05 | 01-01 | Motion isolado como client islands em `components/motion/` | SATISFIED | `ParallaxImage.tsx` é o único componente em `components/motion/`; `"use client"` ausente de todas as seções exceto FAQ (pré-existente, legítimo) |
| RDSN-01 | 01-02, 01-03 | 7 seções redesenhadas no padrão editorial sóbrio | SATISFIED | Hero, SobreRamon, CtaFinal (plano 02) + ParaQuemE, Metodo, Resultados, FAQ (plano 03) = 7/7 seções no padrão monocromático editorial com escala tipográfica reconciliada |
| RDSN-02 | 01-02 | Fotos reais P&B do Ramon integradas (Hero, SobreRamon) substituindo placeholders de gradiente | BLOCKED | `public/ramon/hero.jpg` e `public/ramon/retrato.jpg` não existem; visitantes veem placeholder monocromático "Foto do Ramon" via RamonPhoto; o gradiente foi substituído pelo placeholder intencional, não por fotos reais |

---

## Anti-Patterns Found

No blockers or TBD/FIXME/XXX markers found in any phase-modified file.

The following patterns were noted (informational):

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `site/components/sections/Resultados.tsx` | `border-dashed` placeholder for depoimentos section | INFO | Intencional per plan — prova social real é Fase 2; slot marcado para não inventar conteúdo |
| `site/components/sections/Hero.tsx` | `src="/ramon/hero.jpg"` passed to RamonPhoto but file absent | WARNING | Renders placeholder by design (D-04); trivial fix: drop the JPG in `public/ramon/` |

---

## Human Verification Required

### 1. Contraste do texto sobre foto (após adicionar as fotos)

**Test:** Adicionar `site/public/ramon/hero.jpg` e `site/public/ramon/retrato.jpg`, executar `npm run dev`, abrir o navegador e medir o contraste do texto sobreposto na região mais clara de cada foto com uma ferramenta de contraste (ex.: browser DevTools color picker ou axe).
**Expected:** Todo texto sobre a foto (H1, eyebrow, CTA no Hero; copy no SobreRamon) passa WCAG AA (≥4.5:1). O scrim `--scrim-hero` (0.35→0.75 rgba preto) e `--scrim-portrait` (0→0.60) devem garantir isso, mas a opacidade pode precisar de ajuste fino dependendo da foto específica.
**Why human:** Contraste sobre foto depende da luminosidade da imagem específica do Ramon — não é verificável sem o arquivo.

### 2. Comportamento visual de prefers-reduced-motion

**Test:** No Chrome DevTools > Rendering > Emulate `prefers-reduced-motion: reduce`. Recarregar a home. Observar: (a) Reveal aparece estático sem fade+slide; (b) AnimatedCounter mostra valor final imediatamente; (c) hover no CTAButton não produz scale; (d) Hero não produz parallax ao rolar; (e) accordion do FAQ abre instantâneo sem animar height.
**Expected:** Zero animações disparadas — conteúdo estático e completo em todos os pontos acima.
**Why human:** Comportamento de animação sob emulação de reduced-motion requer interação com DevTools e inspeção visual — grep verifica a presença dos gates no código, não sua eficácia em runtime.

### 3. Aparência do bloco branco pontual do Metodo

**Test:** Executar `npm run dev`, navegar até a seção Metodo, verificar visualmente o bloco "O que compõe a consultoria" com `bg-white`.
**Expected:** Bloco branco é visivelmente sóbrio e intencional (não parece erro); texto do label (#595959) é legível sobre branco; chips dos 6 itens da consultoria estão bem delimitados com `border-black/15`; nenhum outro bloco branco aparece na página.
**Why human:** Qualidade visual, percepção de tom editorial e contraste real requerem inspeção visual.

---

## Gaps Summary

**1 gap bloqueia o goal completo:**

**RDSN-02 / SC-1: Fotos reais do Ramon ausentes.** O code delivery está 100% correto e pronto — `RamonPhoto` renderiza `next/image` com `fill + grayscale + contrast-125 + scrim via token`, `public/ramon/` está convencionada e documentada, os slots em `Hero.tsx` e `SobreRamon.tsx` já passam os caminhos corretos (`/ramon/hero.jpg`, `/ramon/retrato.jpg`). O que falta é o asset físico — os arquivos de foto — que é um item de conteúdo a ser fornecido pelo usuário, não por código.

**Fechamento:** Basta adicionar `site/public/ramon/hero.jpg` e `site/public/ramon/retrato.jpg` para que SC-1 e RDSN-02 sejam satisfeitos sem nenhuma mudança de código. Após adicionar as fotos, verificar o contraste do texto sobreposto na região mais clara das imagens (item de human verification acima).

---

## Score Detail

| Category | Result |
|----------|--------|
| ROADMAP Success Criteria | 3/4 (SC-1 FAILED — fotos ausentes) |
| Artifacts: Exist | 11/13 (hero.jpg e retrato.jpg ausentes) |
| Artifacts: Substantive | 11/11 que existem — todos implementados corretamente |
| Artifacts: Wired | 11/11 que existem — todos conectados e usados |
| Key Links | 7/7 VERIFIED |
| Requirements | DSGN-01 thru DSGN-05 SATISFIED; RDSN-01 SATISFIED; RDSN-02 BLOCKED |
| Debt Markers | 0 (clean) |
| Anti-Patterns | 0 blockers |
| Build/Lint/Typecheck | ALL GREEN |

---

_Verified: 2026-06-01T16:43:47Z_
_Verifier: Claude (gsd-verifier)_
