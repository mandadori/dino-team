# Site Dino Team

## What This Is

Site institucional + comercial da consultoria Dino Team — a marca pessoal de Ramon Dino, primeiro brasileiro campeão do Mr. Olympia. Hoje existe um protótipo Next.js (home de 7 seções, design monocromático, animações base e um dashboard admin de orquestração ainda stub). Este ciclo leva o protótipo a um **build completo e production-ready**: redesign editorial sóbrio foto-conduzido da landing, 3 seções novas, e um **blog SEO integrado ao pipeline de conteúdo** da marca. Público: homem 18–40 que já treina mas não evolui.

## Core Value

O site converte o público certo em **lead qualificado de consultoria via WhatsApp**, carregado pela credibilidade do método de um campeão mundial — e o blog sustenta autoridade e tráfego orgânico no topo do funil. Se tudo o mais falhar, a conversão para contato qualificado precisa funcionar.

## Requirements

### Validated

<!-- Já existe no protótipo (codebase map 2026-05-31). Base sobre a qual construímos. -->

- ✓ Home com 7 seções (Hero, ParaQuemE, Metodo, Resultados, SobreRamon, FAQ, CtaFinal) com copy — existing
- ✓ Design system monocromático: tokens Tailwind v4 (`@theme`), Anton + Montserrat — existing
- ✓ Animações base: `Reveal` + `AnimatedCounter` via Framer Motion — existing
- ✓ CTA WhatsApp + tracking opt-in (GA4 / Meta Pixel / Clarity) — existing
- ✓ Stack: Next.js 16.2 / React 19 / Tailwind 4 / Framer Motion 12 / MDX configurado — existing
- ✓ Dashboard admin (auth por token) + rotas API/cron — existing (stub não-funcional; fora deste ciclo)

### Active

<!-- Escopo deste ciclo. Hipóteses até shippadas. -->

- [ ] Redesign editorial sóbrio foto-conduzido das seções existentes (frontend-design como backbone)
- [ ] Integração das fotos reais do Ramon (P&B, alto contraste) substituindo placeholders
- [ ] Seção Planos/Preço — valores exibidos na página
- [ ] Seção Comunidade Dino Team
- [ ] Seção Depoimentos dedicados (prova social real)
- [ ] Blog: listagem + página de artigo (render MDX) + SEO por artigo
- [ ] Skill geradora de artigo (agentes → MDX versionado) + repurpose de posts do `export/`
- [ ] Páginas legais (privacidade, termos) + consentimento de cookies (LGPD)
- [ ] SEO técnico: sitemap, robots, structured data, OG por página + `og:image`
- [ ] Captura de e-mail / newsletter (provider definido na pesquisa)
- [ ] WhatsApp real substituindo o placeholder `wa.me/0000000000`

### Out of Scope

<!-- Limites explícitos, com motivo, pra evitar re-adição. -->

- Deploy em produção / domínio — o usuário publica por conta própria (não selecionado no escopo)
- Dashboard admin / orquestração de skills — stub não-funcional; esforço separado, fora deste ciclo
- Correção do tech debt da orquestração (policy gate YAML, dispatch real do Claude) — atrelado ao dashboard, fora
- `interface-design` como backbone de design — descartada em favor de `frontend-design` (interface-design se autoexclui de sites de marketing)

## Context

- **Repositório é um SO de marca multi-agente.** Além do `site/`, há `brand/` (brand book, tom de voz, público, pilares, referências visuais), `dados/` (slices de Ramon, mercado, performance, pesquisas brutas), `.claude/agents` + `.claude/skills` (pipeline de conteúdo), `export/` (conteúdo produzido). O blog se conecta a esse pipeline.
- **Codebase map atualizado** em `.planning/codebase/` (2026-05-31) cobre STACK, STRUCTURE, ARCHITECTURE, CONVENTIONS, INTEGRATIONS, CONCERNS, TESTING do `site/`.
- **Briefing institucional existente** em `site/docs/home-briefing.md` — ângulo central, 7 seções, tabus. Insumo direto pro redesign.
- **Pendências de lançamento já mapeadas** (CONCERNS.md): fotos reais, WhatsApp, depoimentos, og:image, páginas legais.
- **Convenções do código** (STRUCTURE.md): seções como RSC em `components/sections/`, constantes em `lib/site.ts`, `cn()` em `lib/utils.ts`, tokens só via nomes (`bg-bg`, `text-fg`…), nunca hex hardcoded.
- **Assets reais** (fotos, depoimentos, planos/preços) serão entregues pelo usuário **no chat, sob demanda**, na fase que precisar.
- **Zero testes** hoje no `site/`; `cn()` sem tailwind-merge; `proxy.ts` usa convenção não-documentada do Next 16.

## Constraints

- **Marca**: monocromático estrito (preto `#000` / branco `#fff` / cinza `#7f7f7f`) — sem cor saturada. Anton (títulos, caixa alta) + Montserrat (corpo, caixa normal — exceção sancionada pra leitura web). Lei de marca, não negociável.
- **Tom**: direto, autoritário sem arrogância, prático. Sem promessa de prazo/resultado, sem "atalho/fórmula", sem clichê fitness, sem motivação vazia. "Marca de elite, não popular."
- **Fotografia**: acervo do Ramon, P&B / alto contraste, overlay de legibilidade. Sem stock photos.
- **Stack mantido**: Next.js 16 / React 19 / Tailwind 4. Sem troca de framework.
- **Design backbone**: skill `frontend-design` (Anthropic) — craft editorial dentro das travas de marca.
- **Animação/3D**: GSAP (scroll-driven) + anime.js (microinterações) + three.js (WebGL pontual, parcimônia) + Framer Motion (legado). Combinação à discrição do executor.
- **LGPD**: consentimento explícito do usuário antes de ativar qualquer script de tracking.
- **Performance/A11y**: respeitar `prefers-reduced-motion`; foco visível WCAG AA; monocromático exige cuidado de contraste.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Refazer seções com novo padrão (não polir) | Base atual é placeholder; com fotos reais dá pra elevar a um editorial foto-conduzido | — Pending |
| Ambição "editorial sóbrio" (não cinematic pesado) | Refino + foto + motion contido; rápido de manter, fiel ao mood "minimalismo agressivo" | — Pending |
| Preço exibido na página (não WhatsApp-gated) | Planos e valores já definidos pelo usuário | — Pending |
| Blog integrado ao pipeline: skill geradora de MDX **+** repurpose de `export/` | Usuário pediu as duas vias; reaproveita o conteúdo já produzido pela marca | — Pending |
| `frontend-design` como backbone de design (não `interface-design`) | interface-design se autoexclui de marketing; frontend-design cobre landing/marketing | — Pending |
| Stack de animação: GSAP + anime.js + three.js + Framer Motion | Escolha explícita do usuário; combinação delegada ao executor | — Pending |
| Newsletter provider a definir na pesquisa | Usuário delegou ("você decide") | — Pending |
| Deploy em produção fora de escopo | Usuário publica por conta própria | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-31 after initialization*
