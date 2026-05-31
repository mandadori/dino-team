# Phase 1: Landing Editorial + Fundação - Context

**Gathered:** 2026-05-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Transformar a home existente (7 seções — Hero, ParaQuemE, Metodo, Resultados, SobreRamon, FAQ, CtaFinal — hoje toda preta, animada com Framer Motion) num **editorial sóbrio foto-conduzido**, monocromático estrito, assentado sobre uma **fundação de design/animação correta** que não precisará ser retrofitada nas fases seguintes.

Entrega = DSGN-01..05 (fundação: contraste AA, mapa de libs + budget, gates de reduced-motion por lib, `@gsap/react`/`useGSAP`, motion como client islands) + RDSN-01..02 (7 seções redesenhadas no padrão editorial + fotos reais P&B do Ramon no Hero e SobreRamon).

**Fora de escopo (outras fases):** seções novas de conversão — Planos, Comunidade, Depoimentos (Fase 2); WhatsApp real (Fase 2); LGPD/cookie (Fase 3); blog/SEO (Fase 4+). Esta fase NÃO adiciona capacidades; redesenha e funda.
</domain>

<decisions>
## Implementation Decisions

### Direção editorial & luz/sombra
- **D-01:** Base de cor **majoritariamente preta** — mantém a alma escura atual da marca. Fundo branco entra **apenas em 1–2 blocos pontuais** de respiro/destaque, não como base alternada de revista. Preto continua sendo o terreno; branco é exceção intencional.
- **D-02:** Tipografia de display (Anton) **contida e hierárquica** — refina a escala atual e o respiro, sem virar display gigante de capa de revista. Sobriedade acima de impacto, fiel ao tom sereno/anti-espetáculo.
- **D-03:** O trabalho de contraste AA (DSGN-01) concentra-se nos **poucos blocos de fundo branco** (texto cinza precisa ser reajustado a ≥4.5:1 sobre branco) + nos **overlays sobre foto**. O cinza atual `#7f7f7f` sobre preto (~4.7:1) é mantido como está.

### Fotos do Ramon
- **D-04:** Acervo **parcial / em breve** — a fase implementa com os arquivos que existirem e deixa **slots prontos** (placeholders monocromáticos intencionais) para os faltantes. RDSN-02 fica parcialmente cumprido até o acervo completo chegar; a troca placeholder→foto real deve ser trivial (não exigir reimplementação).
- **D-05:** Tratamento **full-bleed P&B alto contraste com texto sobreposto** (foto sangra até a borda, preto-e-branco dramático). Hero e SobreRamon são os alvos de RDSN-02.
- **D-06:** Como o texto fica sobre a foto, **overlay/gradiente (scrim)** é obrigatório para garantir legibilidade WCAG AA do texto sobre a imagem — tratar como parte do DSGN-01, não como detalhe estético.
- **D-07:** Definir uma **pasta-convenção de assets** (ex.: `site/public/ramon/`) e documentá-la no plano, para o usuário soltar os arquivos sem fricção.

### Animação
- **D-08:** Scroll-driven **contido**: apenas **entradas** (fade/sobe, no espírito do `Reveal.tsx` atual) + **parallax leve** nas fotos full-bleed. **Sem pin/scrub** — nenhuma seção-âncora pinada. Isso mantém o escopo do GSAP enxuto e o first-load JS abaixo do budget (<200KB, DSGN-02).
- **D-09:** Microinterações (anime.js) **mínimas e funcionais**: hover sutil em CTA + contador (reusar `AnimatedCounter` existente). Sem enfeite. Sobriedade máxima.
- **D-10:** Mapa de responsabilidade por lib (DSGN-02) permanece o contrato, mas o **uso real nesta fase é leve**: GSAP = reveals de scroll + parallax de foto; anime.js = microinterações pontuais; Framer Motion = legado/UI (o `Reveal.tsx` atual pode permanecer ou migrar — decisão de implementação do planner). **three.js NÃO é usada nesta fase** (WebGL/DSGN-06 é v2).

### Claude's Discretion
- **Reskin vs re-layout das 7 seções:** deixado ao meu critério — proponho no plano se cada seção é só repaginada visualmente ou re-diagramada (ex.: Metodo como passos editoriais numerados, Resultados em grid). Sem adicionar seções.
- **Migração do `Reveal.tsx`** (manter Framer vs reescrever em GSAP) — decisão de implementação, respeitando o mapa de libs.
- **Por-seção:** quais blocos recebem o fundo branco pontual e qual seção além do Hero ganha parallax.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Marca (lei de identidade — monocromático estrito, tom sóbrio)
- `brand/referencias-visuais.md` — paleta P&B, tipografia (Anton + Montserrat), mood; base dos tokens
- `brand/brand-book.md` — essência, mensagens centrais, o que a marca não é
- `brand/tom-de-voz.md` — sobriedade, anti-espetáculo (informa a contenção tipográfica e de animação)
- `brand/publico-alvo.md` — quem é o leitor da landing
- `brand/pilares-conteudo.md` — eixos temáticos

### Requisitos desta fase
- `.planning/REQUIREMENTS.md` §"Design System & Fundação de Animação" (DSGN-01..05) e §"Redesign Editorial" (RDSN-01, RDSN-02) — contrato de aceite

### Pesquisa (constraints técnicos a respeitar)
- `.planning/research/SUMMARY.md` — síntese (stack, table stakes, watch-outs)
- `.planning/research/PITFALLS.md` — armadilhas de animação/perf; o constraint "contraste + reduced-motion devem existir ANTES de qualquer animação"
- `.planning/research/STACK.md` — versões e papel de cada lib (GSAP/`@gsap/react`, anime.js, Framer Motion)
- `.planning/research/ARCHITECTURE.md` — client islands / fronteira `"use client"`

### Backbone de design
- Skill `interface-design` (`frontend-design`) — backbone declarado em RDSN-01 para o padrão editorial sóbrio

### Mapas do código existente
- `.planning/codebase/STRUCTURE.md`, `.planning/codebase/CONVENTIONS.md`, `.planning/codebase/STACK.md` — padrões do site atual
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `site/components/Reveal.tsx` — padrão de entrada Framer (`whileInView` fade+sobe, anima uma vez). Base para os reveals; pode ser mantido ou migrado pro GSAP conforme o mapa de libs.
- `site/components/AnimatedCounter.tsx` — microinteração de contador já pronta (reusar em Resultados; D-09).
- `site/components/ui/CTAButton.tsx` — CTA existente; alvo de microinteração de hover mínima.
- `site/app/globals.css` — tokens da marca (`--color-bg/fg/muted/surface/line`, fontes Anton/Montserrat) + bloco `@media (prefers-reduced-motion)` (hoje só CSS — DSGN-03 pede gates JS por lib além disso).
- `site/components/sections/*` (Hero, ParaQuemE, Metodo, Resultados, SobreRamon, FAQ, CtaFinal) — as 7 seções a redesenhar.

### Established Patterns
- Identidade dark-only (`color-scheme: dark`, body preto). Introduzir blocos brancos pontuais (D-01) exige token de cinza-sobre-branco novo (DSGN-01) sem quebrar o cinza-sobre-preto atual.
- Reduced-motion hoje é só CSS global (esmaga durações). DSGN-03 quer **gates JS por lib** (GSAP `matchMedia`, Framer `useReducedMotion`, anime/three via `matchMedia`) — animação não deve disparar, não só acelerar.
- Componentes de motion devem virar **client islands** em `components/motion/` (`"use client"` nunca sobe pra seção/página) — DSGN-05.

### Integration Points
- `@gsap/react` ainda **não instalada** — DSGN-04 a adiciona; `useGSAP()` vira o padrão (nunca `useEffect` cru).
- Slots de foto no Hero e SobreRamon hoje são placeholders de gradiente → substituir por foto full-bleed P&B + scrim (D-05/D-06), com pasta-convenção de assets (D-07).
- `site/components/TrackingScripts.tsx` existe mas é assunto da Fase 3 (LGPD) — não tocar aqui.
</code_context>

<specifics>
## Specific Ideas

- Referência de concorrente já pesquisada: STNDRD (`dados/mercado/concorrentes/stndrd*`) — editorial sóbrio de elite é o norte do tom.
- "Animação contida" foi explicitamente definida como: entradas + parallax leve, sem pin/scrub, microinterações mínimas — não interpretar "contida" como licença pra coreografia rica.
- Branco é exceção (1–2 blocos), não base — qualquer proposta majoritariamente branca contraria D-01.
</specifics>

<deferred>
## Deferred Ideas

- **Momento WebGL / three.js (DSGN-06):** v2, spike-gated, candidato a corte por custo/perf mobile. three.js fica instalada mas ociosa no v1.
- **Seções de conversão** (Planos, Comunidade, Depoimentos) e **WhatsApp real:** Fase 2.
- **Pin/scrub e coreografia scroll rica:** descartado para esta fase por decisão de tom (D-08); poderia ser reconsiderado em iteração futura se houver demanda, mas não está no roadmap.
</deferred>

---

*Phase: 1-Landing Editorial + Fundação*
*Context gathered: 2026-05-31*
