---
phase: 1
status: draft
created: 2026-05-31
---

# UI Spec: Landing Editorial + Fundação

> Design contract for this phase. Consumed by planner (tasks), executor (implementation), and ui-checker (validation).
> **Scope:** Only UI/UX decisions. No backend, API, or data-layer concerns.
> **Brand law (override):** monocromático estrito (preto/branco/cinza), tom sereno/anti-espetáculo. Qualquer cor de destaque, badge "popular" ou CTA colorido é proibido (REQUIREMENTS.md §Out of Scope, CLAUDE.md). Esta fase **redesenha e funda**; não adiciona seções.

## Design System

**Tooling:** `tailwind-only` (Tailwind CSS 4, CSS-first via `@theme` em `site/app/globals.css`, sem `tailwind.config.js`).
**Component source:** `custom` — componentes próprios em `site/components/`. shadcn **não** será inicializado.
**shadcn gate result:** Projeto é Next.js, mas o gate é dispensado por contraindicação documentada — a marca tem design system maduro e fechado (monocromático estrito, Anton/Montserrat) e CLAUDE.md/REQUIREMENTS proíbem injetar UI/cor/script de terceiro. Inicializar shadcn introduziria tokens de cor (`--primary`, `--ring`, `--destructive`) e padrões que contrariam a lei de marca. `Tool: none` para registries; safety gate de registry: não se aplica.
**Existing tokens:** Encontrados em `site/app/globals.css` (`--color-bg/fg/muted/surface/line`, `--font-display`/`--font-body`). Esta fase **adiciona** tokens de contraste-sobre-branco e scrim; não reescreve os existentes.

## Design Tokens

### Color (60/30/10)

A marca é monocromática estrita. O "10% accent" não é uma cor — é **branco puro reservado para ação/ênfase** sobre o terreno preto (CTAs sólidos e a foto P&B de alto contraste). Não existe cor de marca além de preto/branco/cinza.

| Role | Token | Value | Usage |
|------|-------|-------|-------|
| Dominant (~60%) | `--color-bg` | `#0a0a0a` | Superfície base da página (preto — terreno da home, D-01) |
| Secondary (~30%) | `--color-surface` | `#141414` | Seções elevadas/alternadas (Metodo etc.); `--color-line #262626` para divisores |
| Accent (~10%) | `#FFFFFF` (branco) | `#FFFFFF` | **Reservado para:** botão de CTA sólido (fundo branco, texto preto), título display sobre foto, e os **1–2 blocos pontuais de fundo branco** (D-01). Nenhum outro elemento "compete" por ênfase. |

**Tokens de texto:**

| Token | Value | Contexto | Contraste |
|-------|-------|----------|-----------|
| `--color-fg` | `#ededed` | Texto primário sobre preto | ~15:1 sobre `#0a0a0a` — passa AAA |
| `--color-muted` | `#7f7f7f` | Texto secundário sobre preto (mantido como está, D-03) | ~4.7:1 sobre `#0a0a0a` — passa AA, **não alterar** |
| `--color-fg-on-light` | `#0a0a0a` | Texto primário nos blocos brancos | ~19:1 sobre `#FFFFFF` — passa AAA |
| `--color-muted-on-light` | `#595959` (NOVO — DSGN-01) | Texto secundário sobre fundo branco | ≥4.5:1 sobre `#FFFFFF` — passa AA. **Nunca** usar `#7f7f7f` (= 3.5:1, falha) sobre branco. |

**Scrim sobre foto (DSGN-01 / D-06) — obrigatório, não estético:**

| Token | Value | Usage |
|-------|-------|-------|
| `--scrim-hero` | `linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.75) 100%)` | Overlay sobre foto full-bleed do Hero. Garante que `#ededed`/`#fff` sobre a imagem mantenha ≥4.5:1 na região do texto. |
| `--scrim-portrait` | `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)` | Overlay sobre o retrato P&B do SobreRamon (texto na base). |

> Os valores exatos de opacidade do scrim são piso de partida; o executor deve **medir** o contraste do texto na região mais clara da foto e subir a opacidade até ≥4.5:1. O contraste é critério de aceite (Success Criteria 2), não preferência.

### Typography

Display = **Anton** (sempre CAIXA ALTA, `text-transform: uppercase`). Body = **Montserrat**. Anton **contido e hierárquico** — refina a escala atual, sem virar display gigante de capa (D-02). Escala reflete o código existente; novos tamanhos só onde a contenção pede.

| Element | Font | Size (mobile → desktop) | Weight | Line height |
|---------|------|-------------------------|--------|-------------|
| H1 / Hero title | Anton | `text-5xl` 48px → `lg:text-7xl` 72px (teto; **não** 8xl/96px — D-02) | 400 (Anton tem peso único) | 0.95 |
| H2 / section title | Anton | `text-4xl` 36px → `sm:text-5xl` 48px | 400 | 1.1 (tight) |
| H3 / sub-bloco | Anton | `text-2xl` 24px | 400 | 1.2 |
| Numeral/metric (display) | Anton | `text-5xl` 48px → `sm:text-6xl` 60px | 400 | 1.0 |
| Eyebrow / kicker | Montserrat | `text-sm` 14px, `tracking-[0.3em]`, uppercase | 600 | 1.4 |
| Body | Montserrat | `text-base` 16px (corpo); `text-lg` 18px (lead do Hero) | 400 | 1.6 (relaxed) |
| Label / caption | Montserrat | `text-sm` 14px, `tracking-wider`, uppercase | 600 | 1.4 |

**Weights:** exatamente **2** — Montserrat 400 (regular) e 600 (semibold). Anton ignora peso (fonte de peso único). Sem 500/700/800.
**Caixa:** títulos display (Anton), eyebrows e labels sempre **uppercase**. Body corrido **pode** ser caixa baixa no site (diferente das peças de social, que são todas caixa alta) — leitura de parágrafo longo prevalece; D-02 trata de contenção, não de forçar caps no corpo.

### Spacing

Escala de 4px (Tailwind default), restrita aos degraus: **4, 8, 16, 24, 32, 48, 64, 96, 128**.

| Token Tailwind | px | Uso típico |
|----------------|----|-----------|
| `gap-1` / `p-1` | 4 | colagem fina |
| `gap-2` | 8 | entre kicker e título |
| `mt-4` | 16 | espaçamento de parágrafo |
| `gap-6` / `px-6` | 24 | gutter horizontal padrão da página |
| `mt-8` / `gap-8` | 32 | bloco interno |
| `gap-12` | 48 | colunas/itens de grid |
| `mt-16` | 64 | título → conteúdo da seção |
| `py-24` | 96 | padding vertical de seção (mobile) |
| `py-32` / `sm:py-32` | 128 | padding vertical de seção (desktop) |

**Container:** `max-w-6xl` (1152px) para seções de conteúdo; `max-w-4xl` (Hero centralizado) / `max-w-xl` (lead). Gutter `px-6` (24px) em todas as larguras.
**Touch target mínimo:** 44×44px para qualquer alvo interativo (CTA já é `px-8 py-4` = ~56px de altura, OK).

## Component Inventory

| Component | Source | Variant | States |
|-----------|--------|---------|--------|
| `CTAButton` (`ui/CTAButton.tsx`) | custom (existente) | sólido: fundo branco, texto preto, uppercase, `tracking-wider`, 600 | default, hover (scale 1.04 via anime.js + `bg-neutral-200`), focus-visible (ring monocromático — NOVO), active, reduced-motion (sem scale) |
| `AnimatedCounter` (`AnimatedCounter.tsx`) | custom (existente) | numeral Anton que conta até o valor | mount (anima 0→valor, anime.js), reduced-motion (renderiza valor final estático, sem contagem — NOVO gate) |
| `Reveal` (`Reveal.tsx`) | custom (existente, Framer/`motion`) | fade+sobe `y:24→0`, `once:true` | in-view (anima uma vez), reduced-motion (`useReducedMotion()` → renderiza estático e completo — NOVO gate) |
| `ScrollReveal` (motion island — NOVO em `components/motion/`) | custom | entrada por scroll via **GSAP** `useGSAP()` (se o planner migrar de Framer) | in-view, reduced-motion (`gsap.matchMedia()` não inicializa) |
| `ParallaxImage` (motion island — NOVO em `components/motion/`) | custom | parallax **leve** da foto full-bleed (GSAP, sem pin/scrub — D-08) | scroll (translate leve), reduced-motion (foto estática) |
| `RamonPhoto` / slot de foto (NOVO) | custom | `next/image` full-bleed P&B + scrim; aceita placeholder monocromático quando o arquivo não existe (D-04) | imagem presente (priority no Hero), placeholder intencional (slot pronto, troca trivial D-04/D-07) |
| 7 section components (`sections/*`) | custom (existentes, a redesenhar) | Hero, ParaQuemE, Metodo, Resultados, SobreRamon, FAQ, CtaFinal | RSC; motion só via islands importados |

**Convenção de assets de foto (D-07):** `site/public/ramon/` (ex.: `hero.jpg`, `retrato.jpg`). Documentar no plano para o usuário soltar os arquivos sem fricção. Enquanto não chegam, o slot renderiza placeholder monocromático intencional (não gradiente colorido).

## States & Interactions

**Animação — escopo contido (D-08, D-09, DSGN-02):**
- **Scroll (GSAP):** apenas **entradas** (fade/sobe, espírito do `Reveal`) + **parallax leve** nas fotos full-bleed (Hero e mais uma seção, à discrição do planner). **Sem pin, sem scrub, sem coreografia.**
- **Microinteração (anime.js):** hover do CTA (scale 1.04, 200ms `outQuad`) + contador (`AnimatedCounter`). Nada além disso.
- **Framer Motion (`motion`):** legado/UI — `Reveal.tsx` pode permanecer ou migrar para GSAP (discrição do planner, respeitando o mapa de libs DSGN-02).
- **three.js:** não usada nesta fase (v2).

**Por estado interativo:**
- **CTAButton** — default: branco sólido / texto preto. Hover: `scale 1.04` (anime.js) + `bg-neutral-200`. Focus-visible: ring monocromático (ver a11y). Active: scale volta a 1. Disabled: n/a nesta fase (CTAs são links). Reduced-motion: hover sem scale, só `bg-neutral-200`.
- **Reveal/ScrollReveal** — in-view: anima uma vez (`once:true`). Reduced-motion: conteúdo aparece **estático e completo** desde o primeiro paint (não animar rápido — DSGN-03).
- **ParallaxImage** — scroll: translate vertical leve. Reduced-motion: foto totalmente estática.
- **Counter** — mount: 0→valor (2s). Reduced-motion: valor final imediato.

**Gates de reduced-motion (DSGN-03) — animação NÃO dispara, não só acelera:**
- Hook `usePrefersReducedMotion` em `site/lib/` (NOVO).
- GSAP: `gsap.matchMedia()` — registra timelines só fora de reduced-motion.
- Framer: `useReducedMotion()` — `Reveal` renderiza estático.
- anime.js: guard `matchMedia('(prefers-reduced-motion: reduce)')` antes de `animate()` no CTA e no Counter.
- O CSS global atual (`@media reduced-motion` que esmaga durações) **permanece como rede de segurança**, mas os gates JS são o contrato real.

**Client islands (DSGN-05):** `"use client"` vive só nos componentes de `components/motion/`, `CTAButton`, `AnimatedCounter`, `Reveal`. **Nunca** sobe para uma `sections/*` ou para a página.

## Accessibility Contract

- **Contraste:** texto normal ≥4.5:1, texto grande (≥24px ou ≥18.66px bold) ≥3:1. Pontos críticos: `--color-muted-on-light` (`#595959`) nos blocos brancos; texto sobre foto medido **com o scrim aplicado** na região mais clara da imagem. `#7f7f7f` sobre preto mantido (~4.7:1).
- **Focus indicators (NOVO — corrige Pitfall 7):** `:focus-visible` com ring monocromático visível e ≥3:1 contra o fundo — branco sobre preto (`outline`/`ring` branco), preto/escuro sobre os blocos brancos. **Nunca** reset de outline sem replacement; **nunca** ring azul default do browser (viola monocromático, Pitfall 3).
- **Keyboard:** todos os CTAs (links `<a>`) navegáveis por Tab, ordem de leitura = ordem visual.
- **Screen reader:** placeholders de foto e overlays decorativos com `aria-hidden="true"` (já no Hero atual); foto real do Ramon recebe `alt` descritivo on-brand (ex.: "Ramon Dino em preto e branco, alto contraste").
- **`prefers-reduced-motion`:** respeitado via gates JS por lib (acima). Critério de aceite 3 da fase: com reduced-motion ativo, **nenhuma** entrada/parallax/microinteração dispara; conteúdo estático e completo.
- **Imagem:** `priority` na foto dominante do Hero (LCP — Pitfall 4); `loading="lazy"` nas demais.

## Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| mobile (<640, base) | Coluna única. Hero `min-h-screen` centralizado, H1 `text-5xl`. Seções `py-24`, gutter `px-6`. Grids colapsam para 1 coluna. SobreRamon empilha foto sobre texto. |
| sm (≥640) | Section title `text-5xl`. Metodo grid `sm:grid-cols-2`; Resultados `sm:grid-cols-3`. Padding de seção sobe para `sm:py-32`. |
| lg (≥1024) | Hero H1 `lg:text-7xl` (teto). SobreRamon `lg:grid-cols-2` (foto | texto lado a lado). Container `max-w-6xl`. |

Mobile-first; sem layout dedicado a tablet além dos saltos `sm`/`lg`. Parallax deve degradar bem em telas pequenas (movimento leve ou desligado em mobile, à discrição do planner — não pode causar jank/CLS).

## Copywriting

Tom **sereno, íntimo, direto, anti-espetáculo** (tom-de-voz.md). Copy existente já está on-brand; manter e só refinar. Frases-bandeira e sign-off são literais.

**Primary CTA (label):** `Quero minha direção` (Hero, já no código) — verbo + núcleo da tese ("direção"). Reusar o mesmo verbo-noun nos demais CTAs da landing para consistência. Sem urgência, sem promessa de prazo/número (tabu de marca).
**Eyebrow / kicker do Hero:** `Consultoria Ramon Dino` (uppercase, tracking largo).
**Sign-off da marca:** `O topo exige direção.` — assinatura fixa, literal, sem variação. Usada como H1 do Hero e/ou fecho do CtaFinal.

**Empty / placeholder state (foto ausente, D-04):** slot monocromático intencional com rótulo Anton uppercase, ex.: `Foto do Ramon` (padrão já presente no SobreRamon). Não é erro — é placeholder de acervo parcial; deve parecer deliberado, não quebrado.

**Error states:** **nenhum nesta fase.** A landing não tem formulário nem submissão (captura de e-mail = Fase 5; WhatsApp real = Fase 2). Sem estados de erro a especificar.

**Destructive actions:** **nenhuma.** Esta fase não tem ações destrutivas — sem confirmações a desenhar.

**Proibições de copy (lei de marca, validar no checker):** sem "atalho", "jeito fácil", "sem esforço"; sem motivação vazia; sem promessa de prazo/resultado; sem hype/caps-lock na voz; sem superlativos vazios. Body em segunda pessoa ("você").

## Out of Scope

- **Seções novas de conversão** — Planos, Comunidade, Depoimentos (Fase 2). Esta fase só redesenha as 7 existentes; não adiciona seção.
- **WhatsApp real** (`NEXT_PUBLIC_WHATSAPP_URL`) — Fase 2. CTAs continuam apontando para placeholder.
- **LGPD / cookie consent / `TrackingScripts`** — Fase 3. Não tocar em `TrackingScripts.tsx`.
- **Blog, SEO técnico, OG image** — Fase 4+.
- **Captura de e-mail / formulários / estados de erro** — Fase 5.
- **three.js / WebGL hero (DSGN-06)** — v2, spike-gated. Lib fica ociosa.
- **Pin / scrub / coreografia scroll rica** — descartado por tom (D-08).
- **Qualquer cor de destaque, badge "popular", CTA colorido, estrelas/score** — proibido por lei de marca (monocromático estrito).
- **shadcn / registries de terceiro** — contraindicado; não inicializar.
