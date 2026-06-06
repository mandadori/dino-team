# Phase 1: Landing Editorial + Fundação - Research

**Researched:** 2026-06-01
**Domain:** Redesign editorial foto-conduzido + fundação de animação multi-lib (GSAP/anime.js/Framer Motion) sobre Next.js 16 App Router monocromático
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Direção editorial & luz/sombra**
- **D-01:** Base de cor majoritariamente preta — mantém a alma escura atual. Fundo branco entra apenas em 1–2 blocos pontuais de respiro/destaque, não como base alternada de revista. Preto é o terreno; branco é exceção intencional.
- **D-02:** Tipografia de display (Anton) contida e hierárquica — refina a escala atual e o respiro, sem virar display gigante de capa. Sobriedade acima de impacto.
- **D-03:** O trabalho de contraste AA (DSGN-01) concentra-se nos poucos blocos de fundo branco (texto cinza reajustado a ≥4.5:1 sobre branco) + nos overlays sobre foto. O cinza atual `#7f7f7f` sobre preto é mantido como está.

**Fotos do Ramon**
- **D-04:** Acervo parcial / em breve — implementar com os arquivos que existirem e deixar slots prontos (placeholders monocromáticos intencionais) para os faltantes. Troca placeholder→foto real deve ser trivial.
- **D-05:** Tratamento full-bleed P&B alto contraste com texto sobreposto (foto sangra até a borda, P&B dramático). Hero e SobreRamon são os alvos de RDSN-02.
- **D-06:** Como o texto fica sobre a foto, overlay/gradiente (scrim) é obrigatório para garantir legibilidade WCAG AA — parte do DSGN-01, não detalhe estético.
- **D-07:** Definir uma pasta-convenção de assets (ex.: `site/public/ramon/`) e documentá-la no plano.

**Animação**
- **D-08:** Scroll-driven contido: apenas entradas (fade/sobe, espírito do `Reveal.tsx` atual) + parallax leve nas fotos full-bleed. Sem pin/scrub — nenhuma seção-âncora pinada.
- **D-09:** Microinterações (anime.js) mínimas e funcionais: hover sutil em CTA + contador (reusar `AnimatedCounter` existente). Sem enfeite.
- **D-10:** Mapa de responsabilidade por lib (DSGN-02) permanece o contrato, mas o uso real nesta fase é leve: GSAP = reveals de scroll + parallax de foto; anime.js = microinterações pontuais; Framer Motion = legado/UI. **three.js NÃO é usada nesta fase** (WebGL/DSGN-06 é v2).

### Claude's Discretion
- **Reskin vs re-layout das 7 seções:** propor no plano se cada seção é só repaginada ou re-diagramada (ex.: Metodo como passos editoriais numerados, Resultados em grid). Sem adicionar seções.
- **Migração do `Reveal.tsx`** (manter Framer vs reescrever em GSAP) — decisão de implementação, respeitando o mapa de libs.
- **Por-seção:** quais blocos recebem o fundo branco pontual e qual seção além do Hero ganha parallax.

### Deferred Ideas (OUT OF SCOPE)
- **Momento WebGL / three.js (DSGN-06):** v2, spike-gated. three.js fica instalada mas ociosa no v1.
- **Seções de conversão** (Planos, Comunidade, Depoimentos) e **WhatsApp real:** Fase 2.
- **Pin/scrub e coreografia scroll rica:** descartado para esta fase por decisão de tom (D-08).
- **LGPD/cookie/`TrackingScripts`:** Fase 3 — não tocar `TrackingScripts.tsx`.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DSGN-01 | Tokens de cor garantem contraste WCAG AA em ambos os fundos (cinza ≥4.5:1 sobre branco; cinza atual mantido sobre preto) | §Design Tokens, §Pitfall 1 (cinza sobre branco), §Code Examples (tokens Tailwind v4 `@theme`) |
| DSGN-02 | Mapa de responsabilidade única por lib de animação + bundle budget como critério de aceite | §Architectural Responsibility Map, §Standard Stack, §Pitfall 2 (bundle bloat) |
| DSGN-03 | Hook `usePrefersReducedMotion` + gates JS por lib (GSAP `matchMedia`, Framer `useReducedMotion`, anime via `matchMedia`) | §Architecture Patterns (gates por lib), §Code Examples, §Pitfall 3 |
| DSGN-04 | `@gsap/react` adicionado; `useGSAP()` é o padrão (nunca `useEffect` cru) | §Standard Stack (verificação npm), §Code Examples (useGSAP + ScrollTrigger) |
| DSGN-05 | Componentes de motion isolados como client islands em `components/motion/` (`"use client"` nunca sobe pra seção/página) | §Architecture Patterns (client islands), §Pitfall 4 |
| RDSN-01 | 7 seções existentes redesenhadas no padrão editorial sóbrio, mantendo monocromático estrito | §Existing Code Inventory, §Architecture Patterns, UI-SPEC.md |
| RDSN-02 | Fotos reais P&B do Ramon (Hero, SobreRamon) substituindo placeholders de gradiente | §Code Examples (next/image full-bleed + scrim), §Runtime State Inventory (acervo) |
</phase_requirements>

## Summary

Esta fase NÃO é greenfield: existe um protótipo Next.js 16.2.6 / React 19.2.4 / Tailwind 4 funcionando, com 7 seções RSC, tokens monocromáticos em `app/globals.css` via `@theme`, e duas ilhas de animação Framer Motion (`Reveal`, `AnimatedCounter`). O trabalho é (a) **fundar** uma camada de animação multi-lib com responsabilidade única por lib, gates de reduced-motion em JS e isolamento em client islands; e (b) **redesenhar** as 7 seções no padrão editorial sóbrio com fotos full-bleed P&B + scrim. As decisões visuais já estão fechadas no `01-UI-SPEC.md` (tokens, tipografia, scrim, escopo de animação) e no `01-CONTEXT.md` (D-01..D-10).

A pesquisa de projeto (`.planning/research/*`) já estabeleceu a stack e os pitfalls em nível macro com confiança HIGH; este documento os concretiza no nível-arquivo desta fase. Três achados de implementação são novos e load-bearing: **(1)** há uma **discrepância de tokens** entre o `globals.css` atual (`#000000`/`#ffffff`/`#0c0c0c`/`#1f1f1f`) e o `01-UI-SPEC.md` (`#0a0a0a`/`#ededed`/`#141414`/`#262626`) que o planner precisa reconciliar como tarefa explícita; **(2)** o Hero atual usa `md:text-8xl` (96px) e copy diferente da UI-SPEC, ambos violando D-02 e o contrato de copy — o redesign precisa baixar o teto para `lg:text-7xl` e atualizar a copy; **(3)** `@gsap/react` confirmadamente ausente do `package.json` (gap DSGN-04), `gsap@3.15.0` já instalado, peer `gsap ^3.12.5` satisfeito.

**Primary recommendation:** Fundar a camada de animação primeiro (hook `usePrefersReducedMotion`, `@gsap/react`, pasta `components/motion/`, tokens reconciliados) como um slice vertical fino, e só então redesenhar seção-a-seção reusando essa fundação — cada seção é um slice que prova end-to-end (RSC → island de motion → reduced-motion gate → contraste medido). Manter `three.js` instalada e ociosa; não tocar `TrackingScripts.tsx`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Layout/composição das 7 seções | Frontend Server (RSC) | — | Seções são Server Components por padrão; sem `"use client"` (anti-pattern documentado em ARCHITECTURE.md L199) |
| Tokens de cor/tipografia/scrim | CDN/Static (CSS build) | — | `@theme` em `globals.css` é compilado por Tailwind v4 no build; zero JS |
| Reveals de scroll (entrada fade/sobe) | Browser/Client (island) | — | GSAP ScrollTrigger via `useGSAP()`; só toca DOM no cliente |
| Parallax leve de foto full-bleed | Browser/Client (island) | — | GSAP scroll-driven; `"use client"` leaf, sem pin/scrub |
| Microinteração de CTA (hover) | Browser/Client (island) | — | anime.js `animate()` com guard de matchMedia |
| Contador de métricas | Browser/Client (island) | — | `AnimatedCounter` existente (Framer `useInView` + rAF); adicionar gate reduced-motion |
| Reveal legado (`Reveal.tsx`) | Browser/Client (island) | — | Framer Motion `whileInView`; manter ou migrar p/ GSAP (discrição do planner) |
| Otimização de imagem (foto Ramon) | Frontend Server (`next/image`) | CDN/Static | `next/image` gera srcset/AVIF/WebP no build; `priority` no LCP do Hero |
| Detecção de `prefers-reduced-motion` | Browser/Client (hook) | — | `usePrefersReducedMotion` em `lib/`; `matchMedia` é API de browser |

**Sanity check para o planner:** Nenhuma capacidade de animação ou `matchMedia` pode ser atribuída a um RSC (`sections/*` ou `app/page.tsx`). Toda lib de motion (GSAP/anime/Framer) vive exclusivamente em leaf islands `"use client"` dentro de `components/motion/` (ou nos componentes legados já client). Foto e tokens são server/build — não inflam o JS.

## Standard Stack

> **Escopo de instalação desta fase:** uma única dependência nova (`@gsap/react`). Todas as libs de animação já estão no `package.json`. Não instalar nada do blog/newsletter/SEO (Fases 4–6).

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@gsap/react` | `2.1.2` | Hook `useGSAP()` para integrar GSAP ao ciclo de vida React/Next App Router | Único caminho oficialmente suportado para GSAP em React; cleanup automático via `gsap.context()` no unmount; lida com o duplo-disparo do React StrictMode. `[CITED: gsap.com/resources/React]` |
| `gsap` | `3.15.0` (já instalado) | Engine de scroll-driven: ScrollTrigger (reveals) + parallax de foto | Todos os plugins (ScrollTrigger, SplitText) grátis desde abr/2025. `[VERIFIED: npm — gsap@3.15.0 instalado, npm ls]` |
| `animejs` | `4.4.1` (já instalado) | Microinterações pontuais (hover do CTA) | API leve (~9KB) para tween isolado; import nomeado v4 `import { animate } from "animejs"`. `[VERIFIED: npm view animejs version → 4.4.1]` |
| `framer-motion` | `12.40.0` (já instalado) | Legado/UI: `Reveal`, `AnimatedCounter`, accordion do FAQ | Já no bundle e em uso; `useReducedMotion()` nativo para gate. `[VERIFIED: npm view framer-motion version → 12.40.0]` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `next/image` | built-in (Next 16) | Foto full-bleed P&B otimizada (AVIF/WebP, srcset, `priority`) | RDSN-02 — Hero e SobreRamon. Built-in; zero install. `[CITED: nextjs.org/docs — Image component]` |
| `next/font/google` | built-in (em uso) | Anton + Montserrat com `display: swap` (já no `layout.tsx`) | Já configurado; evita CLS de fonte. Não mexer salvo se a escala tipográfica exigir. |
| `gsap/ScrollTrigger` | parte do `gsap` | Plugin de scroll (registrado 1× via `gsap.registerPlugin`) | Importar pontualmente no client component que usa, não global. `[CITED: gsap.com/resources/React]` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| GSAP para reveals | Manter Framer `Reveal` para tudo | Legítimo (reduz superfície/bundle). Discrição do planner (D-10). Se mantiver Framer, GSAP entra só p/ parallax. |
| anime.js para hover do CTA | CSS `transition` + `hover:scale` puro | CSS é mais barato e auto-respeita reduced-motion. Considerar: o CTA atual já usa `transition-colors`; scale via anime.js é o pedido (D-09), mas CSS `transition-transform` cobriria sem JS. Planner decide. |
| `clsx` + `tailwind-merge` no `cn()` | `cn()` atual (concat simples) | CONCERNS aponta `cn()` sem merge. **Esta fase introduz overrides de `className` reais** (variantes de seção, scrim). Recomendado adicionar, mas é melhoria, não bloqueante de DSGN. Tratar como opcional do planner. `[ASSUMED]` |

**Installation:**
```bash
# de dentro de site/
npm install @gsap/react
```

> `gsap`, `animejs`, `three`, `framer-motion` JÁ estão instalados — não reinstalar. `next/image`, `next/font` são built-in.

**Version verification (executada nesta sessão):**
- `@gsap/react` → `2.1.2` (latest), peer `{ gsap: "^3.12.5", react: ">=17" }` — satisfeito por `gsap@3.15.0` + `react@19.2.4`. `[VERIFIED: npm view @gsap/react]`
- `gsap@3.15.0` instalado e resolvido. `[VERIFIED: npm ls gsap]`

## Package Legitimacy Audit

> Apenas uma dependência nova nesta fase.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `@gsap/react` | npm | ~3 anos (org GreenSock, pkg oficial) | ~600k/wk (classe) | github.com/greensock/react | n/d (slopcheck indisponível) | Approved — pkg oficial GreenSock, peer verificado, prescrito na doc oficial GSAP |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

> slopcheck não estava disponível no ambiente (`command -v slopcheck` → not installed) e `pip install slopcheck` não foi possível. Sob a regra de degradação graciosa, `@gsap/react` deveria ser `[ASSUMED]`. Mitigação: o pacote é o **pacote oficial do GreenSock** (mesma org que `gsap`, já instalado e em uso), prescrito na documentação oficial (`gsap.com/resources/React`), com peer-dependency verificada contra o lockfile. Risco de slopsquat é mínimo. Recomendação ao planner: instalar normalmente; se a política de segurança exigir, gate atrás de um `checkpoint:human-verify` único.

## Architecture Patterns

### System Architecture Diagram

```
                    ┌─────────────────────────────────────────────┐
   visitante  ───►  │  app/page.tsx (RSC)  +  app/layout.tsx (RSC) │
   (request)        │  fontes next/font · metadata · TrackingScripts│
                    └───────────────┬─────────────────────────────┘
                                    │ compõe (server render)
                                    ▼
            ┌───────────────────────────────────────────────────────┐
            │   components/sections/*  (7 RSC — sem "use client")    │
            │   Hero · ParaQuemE · Metodo · Resultados · SobreRamon  │
            │   · FAQ · CtaFinal                                     │
            └───┬───────────────┬───────────────────┬───────────────┘
                │ importa        │ importa            │ importa
                ▼                ▼                    ▼
   ┌────────────────────┐  ┌─────────────────┐  ┌──────────────────────┐
   │ next/image (server)│  │ components/      │  │ components/motion/*  │
   │ foto P&B + scrim   │  │ Reveal,          │  │ (NOVO — "use client")│
   │ (build optimize)   │  │ AnimatedCounter, │  │ ScrollReveal (GSAP)  │
   │ priority no Hero   │  │ FAQ (Framer)     │  │ ParallaxImage (GSAP) │
   └────────────────────┘  │ legado client    │  │ MicroFx/CTA (anime)  │
                           └────────┬────────┘  └──────────┬───────────┘
                                    │                       │
                                    ▼                       ▼
                           ┌──────────────────────────────────────┐
                           │ lib/usePrefersReducedMotion (NOVO)    │
                           │ + gates por lib:                      │
                           │  GSAP gsap.matchMedia(no-preference)  │
                           │  Framer useReducedMotion()            │
                           │  anime  matchMedia().matches guard    │
                           └──────────────────────────────────────┘
                                    │
                                    ▼ rede de segurança
                           ┌──────────────────────────────────────┐
                           │ globals.css @media reduced-motion     │
                           │ (esmaga durações — permanece)         │
                           └──────────────────────────────────────┘
```

Fluxo do caso primário (visitante carrega a home): request → RSC compõe seções server-side → HTML estático com foto otimizada já presente (LCP rápido) → islands `"use client"` hidratam → cada island consulta o gate de reduced-motion antes de registrar qualquer timeline/tween → se `reduce`, nada dispara e o conteúdo permanece estático e completo.

### Recommended Project Structure
```
site/
├── public/
│   └── ramon/                 # NOVO (D-07) — acervo P&B; hero.jpg, retrato.jpg
├── app/
│   ├── globals.css            # EXISTENTE — reconciliar/estender tokens (DSGN-01)
│   ├── layout.tsx             # EXISTENTE — fontes/metadata (não mexer salvo escala)
│   └── page.tsx               # EXISTENTE — composição das 7 seções (RSC)
├── components/
│   ├── motion/                # NOVO (DSGN-05) — TODAS as islands de animação nova
│   │   ├── ScrollReveal.tsx   #   "use client" — GSAP reveal (se migrar de Framer)
│   │   ├── ParallaxImage.tsx  #   "use client" — GSAP parallax leve de foto
│   │   └── CtaMicroFx.tsx     #   "use client" — anime.js hover (ou aplicar no CTAButton)
│   ├── sections/*             # EXISTENTE — as 7 seções a redesenhar (RSC)
│   ├── ui/CTAButton.tsx       # EXISTENTE — alvo de microinteração + focus ring
│   ├── Reveal.tsx             # EXISTENTE — Framer legado (manter ou migrar)
│   ├── AnimatedCounter.tsx    # EXISTENTE — adicionar gate reduced-motion
│   └── RamonPhoto.tsx         # NOVO (sugerido) — wrapper next/image + scrim + placeholder
└── lib/
    ├── usePrefersReducedMotion.ts  # NOVO (DSGN-03) — hook central
    ├── site.ts                # EXISTENTE — copy/constantes (atualizar copy do Hero)
    └── utils.ts               # EXISTENTE — cn() (opcional: clsx+tailwind-merge)
```

### Pattern 1: useGSAP() com scope ref e gate de reduced-motion (DSGN-03/DSGN-04)
**What:** Toda animação GSAP vive num client island via `useGSAP()` (nunca `useEffect`), com cleanup automático e registro condicional em `gsap.matchMedia()` para a condição `no-preference` — assim a timeline **não é nem criada** sob reduced-motion (não basta acelerar).
**When to use:** ScrollReveal e ParallaxImage.
**Example:**
```tsx
// Source: gsap.com/resources/React + gsap.com/docs/v3/GSAP/gsap.matchMedia()
// components/motion/ScrollReveal.tsx
"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function ScrollReveal({ children }: { children: React.ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    // Só registra a animação quando o usuário NÃO pediu menos movimento.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(scope.current!.children, {
        opacity: 0, y: 24, duration: 0.6, ease: "power3.out",
        scrollTrigger: { trigger: scope.current, start: "top 85%", once: true },
      });
    });
    // matchMedia reverte automaticamente quando a condição deixa de bater.
  }, { scope });
  return <div ref={scope}>{children}</div>;
}
```

### Pattern 2: Foto full-bleed P&B + scrim obrigatório (RDSN-02 / D-05 / D-06)
**What:** `next/image` com `fill` cobrindo a seção, filtro P&B se a origem for colorida, e um overlay de gradiente (scrim) **acima** da imagem e **abaixo** do texto, garantindo ≥4.5:1 do texto na região mais clara da foto. `priority` no Hero (LCP).
**When to use:** Hero e SobreRamon.
**Example:**
```tsx
// Source: nextjs.org/docs Image + UI-SPEC.md §scrim
<section className="relative min-h-[100svh] overflow-hidden">
  <Image
    src="/ramon/hero.jpg" alt="Ramon Dino em preto e branco, alto contraste"
    fill priority sizes="100vw"
    className="object-cover object-center grayscale contrast-125"
  />
  {/* scrim — não estético, é o que garante o contraste AA */}
  <div aria-hidden className="absolute inset-0"
       style={{ background: "linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,.75))" }} />
  <div className="relative z-10 …">{/* eyebrow, H1, lead, CTA */}</div>
</section>
```
> O valor do scrim no UI-SPEC é piso de partida; **medir** o contraste do texto na região mais clara e subir a opacidade até ≥4.5:1 (critério de aceite 2). Considerar token CSS `--scrim-hero`/`--scrim-portrait` (UI-SPEC) em vez de inline.

### Pattern 3: Placeholder de foto trivialmente substituível (D-04)
**What:** Um componente `RamonPhoto` que renderiza `next/image` se o arquivo existir, ou um placeholder monocromático **intencional** (rótulo Anton uppercase "FOTO DO RAMON", sem gradiente colorido) quando não. A troca é só soltar o arquivo em `public/ramon/` — sem reimplementação.
**When to use:** Hero e SobreRamon enquanto o acervo é parcial.
**Note:** Não dá para `fs.existsSync` em `public/` de forma confiável no Vercel; o padrão simples é uma prop `src?: string` — se ausente, renderiza placeholder. O planner define como o slot sinaliza presença/ausência.

### Pattern 4: Tipografia Anton contida (D-02) — corrigir o teto atual
**What:** O Hero atual usa `md:text-8xl` (96px). A UI-SPEC fixa o teto em `lg:text-7xl` (72px). O redesign deve baixar a escala de display e refinar respiro/hierarquia, não ampliar.
**Anti-pattern atual a corrigir:** `text-8xl` no Hero, `md:text-6xl` em H2 (UI-SPEC pede `sm:text-5xl`/48px). Reconciliar a escala com a tabela de Typography da UI-SPEC.

### Anti-Patterns to Avoid
- **`"use client"` em uma `sections/*` ou em `page.tsx`:** força a árvore inteira a virar JS, mata SSR/streaming. Extrair só a folha interativa para `components/motion/`. `[CITED: .planning/codebase/ARCHITECTURE.md L208-212]`
- **GSAP via `useEffect` cru:** memory leak + animação em nós desmontados sob StrictMode. Sempre `useGSAP()`. `[CITED: gsap.com/resources/React]`
- **Reduced-motion só no CSS:** GSAP/anime/Framer animam via JS/rAF, fora do alcance do `@media` CSS. Gate em JS por lib é o contrato real. `[VERIFIED: PITFALLS.md + gsap.matchMedia docs]`
- **Hex hardcoded em componente:** sempre via token (`bg-bg`, `text-fg`, `text-muted`…). `[CITED: CONVENTIONS.md §Tailwind]`
- **Duas libs para o mesmo efeito:** uma lib por trabalho (mapa DSGN-02). `[CITED: PITFALLS.md Pitfall 1]`
- **Importar `three` nesta fase:** fica ociosa (v2). Não adicionar ao caminho da home.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cleanup de timelines GSAP em React | `useEffect` + `return () => tween.kill()` manual | `useGSAP()` de `@gsap/react` | Lida com StrictMode duplo-disparo, scope, ScrollTrigger/SplitText cleanup automaticamente |
| Gate de reduced-motion no GSAP | `if (matchMedia(...).matches) return` espalhado | `gsap.matchMedia("(prefers-reduced-motion: no-preference)")` | Reverte animações automaticamente em toggle runtime; um só padrão |
| Otimização/responsividade de foto | `<img>` cru + srcset manual | `next/image` (`fill`, `priority`, `sizes`) | AVIF/WebP, lazy default, LCP-aware, sem CLS |
| Detecção de motion preference | listener `matchMedia` ad-hoc em cada componente | hook único `usePrefersReducedMotion` em `lib/` | DSGN-03 pede centralização; evita duplicação e drift |
| Carregamento de fonte sem CLS | `<link>` de Google Fonts | `next/font/google` (já em uso) | `size-adjust` + `swap` zeram FOUT/CLS |

**Key insight:** O custo desta fase não está em escrever animações — está em fazê-las **não dispararem** sob reduced-motion e **não inflarem** o bundle. As ferramentas certas (`useGSAP`, `gsap.matchMedia`, `next/image`) resolvem exatamente esses dois pontos; soluções caseiras reintroduzem os pitfalls.

## Runtime State Inventory

> Esta fase é parcialmente um redesign que altera tokens e copy existentes. Inventário do que não é "só um arquivo de componente".

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | Nenhum — a landing é estática, sem DB/datastore. Verificado: sem `fs`/datastore na home (apenas `lib/site.ts` constantes). | Nenhuma |
| Live service config | Nenhum tocado nesta fase — `TrackingScripts` (GA4/Meta/Clarity) é Fase 3, não tocar. | Nenhuma |
| OS-registered state | Nenhum. Sem cron/scheduler relacionado à landing. | Nenhuma |
| Secrets/env vars | `NEXT_PUBLIC_WHATSAPP_URL` referenciado em `lib/site.ts` (placeholder `wa.me/0000000000`). WhatsApp real é Fase 2 — CTAs continuam apontando ao placeholder. Não renomear a env. | Nenhuma nesta fase |
| Build artifacts | `public/ramon/` **não existe ainda** (verificado: `ls public` → só SVGs default do Next). Criar a pasta-convenção (D-07). Tokens em `globals.css` são compilados por Tailwind no build — mudar tokens exige rebuild (automático no dev/build). | Criar `public/ramon/`; rebuild ao alterar tokens |

**Discrepâncias de "estado" no código que o planner DEVE tratar como tarefas explícitas:**
1. **Tokens divergentes:** `globals.css` atual = `--color-bg:#000000`, `--color-fg:#ffffff`, `--color-surface:#0c0c0c`, `--color-line:#1f1f1f`. UI-SPEC = `#0a0a0a`/`#ededed`/`#141414`/`#262626` + novos `--color-muted-on-light:#595959`, `--color-fg-on-light:#0a0a0a`, scrims. **Reconciliação necessária** — adotar os valores da UI-SPEC e adicionar os tokens novos. (DSGN-01)
2. **Copy/escala do Hero divergente:** código atual tem H1 "O método do campeão, aplicado em você." em `md:text-8xl` e eyebrow "Consultoria de treino e dieta"; UI-SPEC fixa H1 = sign-off "O topo exige direção." (ou fecho do CtaFinal), eyebrow "Consultoria Ramon Dino", CTA "Quero minha direção", teto `lg:text-7xl`. **Atualizar copy + escala.** (D-02, RDSN-01, UI-SPEC §Copywriting)
3. **Placeholders de gradiente:** Hero (`radial-gradient`) e SobreRamon (`aspect-[4/5]` com gradiente) são os slots a substituir por foto+scrim ou placeholder intencional. (RDSN-02)

## Common Pitfalls

### Pitfall 1: Cinza `#7f7f7f` falha contraste AA sobre branco
**What goes wrong:** O cinza de marca passa AA sobre preto (~4.7:1) mas falha sobre branco (~3.5–4.0:1, abaixo de 4.5:1). Os 1–2 blocos brancos (D-01) usariam um cinza ilegível.
**Why it happens:** Tentação de um único token de cinza para tudo; contraste depende do fundo.
**How to avoid:** Token novo `--color-muted-on-light: #595959` (~7:1 sobre branco) para texto secundário nos blocos brancos; **nunca** `#7f7f7f` sobre branco. Manter `#7f7f7f` só sobre preto. (DSGN-01, UI-SPEC §Tokens de texto)
**Warning signs:** axe/Lighthouse "insufficient contrast" em seção clara; legenda cinza sobre branco.

### Pitfall 2: Bundle bloat por libs de animação sem fronteira
**What goes wrong:** GSAP + anime + Framer carregados onde não precisam; first-load JS estoura o budget <200KB (DSGN-02).
**How to avoid:** Mapa de responsabilidade única (DSGN-02) como lei; islands por componente, nunca import de motion no `layout`/`page`; medir `npm run build` first-load JS da home contra <200KB como critério de aceite. three.js fora desta fase.
**Warning signs:** `gsap`/`framer-motion` no shared chunk do build report; duas libs no mesmo componente.

### Pitfall 3: Reduced-motion respeitado só no CSS
**What goes wrong:** O `@media reduced-motion` atual só esmaga durações CSS; GSAP/anime/`AnimatedCounter` (rAF) e `Reveal` (Framer JS) continuam disparando.
**How to avoid:** Hook `usePrefersReducedMotion` + gates por lib: GSAP `gsap.matchMedia(no-preference)`, Framer `useReducedMotion()`, anime guard `matchMedia('(prefers-reduced-motion: reduce)').matches` antes de `animate()`. `AnimatedCounter` deve renderizar o valor final estático. CSS permanece como rede de segurança. (DSGN-03)
**Warning signs:** com DevTools > Rendering > Emulate `prefers-reduced-motion: reduce`, contador ainda anima, parallax ainda mexe.

### Pitfall 4: `"use client"` subindo para seção/página
**What goes wrong:** Para animar uma seção, alguém marca `Hero.tsx` como client; toda a árvore vira JS.
**How to avoid:** Animação só em leaf islands `components/motion/*`; a seção RSC importa o island. (DSGN-05) `[CITED: ARCHITECTURE.md L208]`
**Warning signs:** `"use client"` no topo de um arquivo em `sections/` ou `app/`.

### Pitfall 5: Foto sem scrim derruba o contraste do texto sobreposto
**What goes wrong:** Foto P&B com região clara atrás do texto → texto branco ilegível, falha AA.
**How to avoid:** Scrim obrigatório (D-06); medir na região mais clara; subir opacidade até ≥4.5:1. Tratar como parte de DSGN-01, não estética.
**Warning signs:** texto desaparece sobre áreas claras da foto; contraste medido <4.5:1.

### Pitfall 6: CLS / LCP na foto do Hero
**What goes wrong:** Foto sem `priority`/dimensões → LCP alto e layout shift; animação de entrada que reflui layout.
**How to avoid:** `priority` + `fill`/`sizes` no Hero; demais fotos `loading="lazy"`. Animar só `transform`/`opacity` (nunca height/layout). Estado inicial do reveal não pode reservar altura zero.
**Warning signs:** CLS > 0.1; LCP da home alto no build/Lighthouse.

## Code Examples

### Hook central de reduced-motion (DSGN-03)
```tsx
// Source: padrão matchMedia (MDN) + UI-SPEC §gates
// lib/usePrefersReducedMotion.ts
"use client";
import { useEffect, useState } from "react";

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}
```

### Gate em Framer (Reveal) e no contador (DSGN-03)
```tsx
// Reveal: respeitar reduced-motion sem só acelerar
"use client";
import { motion, useReducedMotion } from "framer-motion";
export function Reveal({ children, delay = 0, className }: {...}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>; // estático e completo
  return (<motion.div /* …variants fade+y… */>{children}</motion.div>);
}
```
```tsx
// AnimatedCounter: pular a contagem sob reduced-motion (mostrar valor final)
const reduce = usePrefersReducedMotion();
useEffect(() => {
  if (!inView) return;
  if (reduce) { setValue(to); return; }   // valor final imediato
  /* …rAF tick… */
}, [inView, to, duration, reduce]);
```

### Microinteração anime.js com guard (D-09)
```tsx
// Source: animejs v4 import nomeado + matchMedia guard
"use client";
import { animate } from "animejs";
function onEnter(el: HTMLElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  animate(el, { scale: 1.04, duration: 200, ease: "outQuad" });
}
```
> Alternativa mais barata e auto-acessível: CSS `transition-transform` + `hover:scale-[1.04]` no `CTAButton`, que respeita reduced-motion via o `@media` global. O planner decide entre anime.js (pedido em D-09) e CSS puro.

### Tokens reconciliados em Tailwind v4 (DSGN-01)
```css
/* app/globals.css — estender o @theme existente (não reescrever os nomes) */
@theme {
  --color-bg: #0a0a0a;            /* reconciliar (era #000000) */
  --color-fg: #ededed;            /* reconciliar (era #ffffff) */
  --color-muted: #7f7f7f;         /* manter — OK sobre preto */
  --color-surface: #141414;       /* reconciliar (era #0c0c0c) */
  --color-line: #262626;          /* reconciliar (era #1f1f1f) */
  --color-fg-on-light: #0a0a0a;   /* NOVO — texto sobre blocos brancos */
  --color-muted-on-light: #595959;/* NOVO — secundário sobre branco (≥4.5:1) */
}
/* scrims como custom properties (usar em style ou utility) */
:root {
  --scrim-hero: linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,.75) 100%);
  --scrim-portrait: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.6) 100%);
}
```
> **Nota de reconciliação:** mudar `--color-bg`/`--color-fg` afeta a página inteira. O planner deve tratar a troca de tokens como uma tarefa de fundação isolada e re-verificar visualmente todas as seções, pois o contraste do `#7f7f7f` muda de ~4.7:1 (sobre `#000`) para ~4.5:1 (sobre `#0a0a0a`) — ainda passa AA, mas é o piso; confirmar.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| GSAP via `useEffect` + cleanup manual | `useGSAP()` de `@gsap/react` | `@gsap/react` (2023+) | Cleanup automático, StrictMode-safe |
| Plugins GSAP pagos (Club) | Todos grátis (ScrollTrigger, SplitText) | abr/2025 (Webflow) | Sem `gsap-trial`; usar `gsap` core | `[CITED: webflow.com/blog/gsap-becomes-free]` |
| Reduced-motion só CSS | Gate em JS por lib (`gsap.matchMedia`, `useReducedMotion`) | maduro | A11y real para animação JS |
| `<img>` + srcset manual | `next/image` `fill`/`priority` | Next 13+ | LCP/CLS automáticos |

**Deprecated/outdated:**
- `gsap-trial` / plugins de Club pagos antigos — desnecessários (GSAP 100% grátis).
- Animar `height`/`top` (reflui layout) — usar `transform`/`opacity`.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `clsx`+`tailwind-merge` no `cn()` é melhoria opcional, não bloqueante de DSGN | Standard Stack (Alternatives) | Baixo — se overrides de classe conflitarem, planner adiciona; não afeta aceite DSGN |
| A2 | anime.js para hover do CTA pode ser substituído por CSS puro sem violar D-09 | Code Examples | Baixo — D-09 pede "microinteração mínima"; CSS cobre. Confirmar preferência se houver dúvida de tom |
| A3 | `@gsap/react@2.1.2` é seguro instalar sem slopcheck (pkg oficial GreenSock) | Package Legitimacy Audit | Baixo — org oficial, peer verificado; gate humano opcional |
| A4 | Trocar `--color-bg` de `#000000`→`#0a0a0a` mantém `#7f7f7f` em AA (~4.5:1, piso) | Code Examples (reconciliação) | Médio — é exatamente o piso 4.5:1; medir após a troca. Se ficar abaixo, manter `#000000` como bg ou escurecer levemente o muted |
| A5 | `public/ramon/` como pasta-convenção (D-07 sugere `site/public/ramon/`) | Project Structure | Nenhum — D-07 já trava a convenção |

**Decisões que precisam do usuário (assets):** acervo real de fotos P&B do Ramon é bloqueante para cumprir RDSN-02 plenamente; até chegar, slots renderizam placeholder intencional (D-04). Solicitar ao usuário no início da fase (já registrado em STATE.md Blockers).

## Open Questions

1. **Quais fotos do acervo já existem?**
   - What we know: D-04 diz "acervo parcial"; `public/ramon/` ainda não existe.
   - What's unclear: se há QUALQUER arquivo pronto para o Hero/SobreRamon agora.
   - Recommendation: planner cria a pasta-convenção + componente de slot; pede ao usuário os arquivos no início; placeholder intencional cobre o gap sem reimplementação.

2. **Reskin vs re-layout por seção (discrição do planner):**
   - What we know: CONTEXT deixa explícito como discrição.
   - Recommendation: planner propõe no PLAN, por seção (ex.: Metodo = passos numerados editoriais, Resultados = grid). Sem adicionar seções.

3. **Migrar `Reveal.tsx` p/ GSAP ou manter Framer?**
   - What we know: D-10 permite ambos; mapa de libs deve ser respeitado.
   - Recommendation: manter `Reveal` em Framer (já existe, já no bundle, `useReducedMotion` trivial) e usar GSAP só para o que Framer não faz bem (parallax). Reduz superfície. Decisão final do planner.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node/npm | install `@gsap/react` | ✓ | npm presente | — |
| `gsap` | scroll/parallax | ✓ | 3.15.0 | — |
| `animejs` | microinteração CTA | ✓ | 4.4.1 | CSS transition |
| `framer-motion` | legado/reveal/FAQ | ✓ | 12.40.0 | — |
| `next`/`next/image`/`next/font` | render, foto, fonte | ✓ | 16.2.6 | — |
| `@gsap/react` | `useGSAP()` (DSGN-04) | ✗ | — (a instalar) | nenhum aceitável — é o requisito |
| Fotos P&B do Ramon | RDSN-02 | ✗ | — | placeholder monocromático intencional (D-04) |
| `slopcheck` | auditoria de pacote | ✗ | — | mitigado: pkg oficial GreenSock (ver Audit) |

**Missing dependencies with no fallback:** `@gsap/react` (é o próprio requisito DSGN-04 — instalar).
**Missing dependencies with fallback:** fotos do Ramon → placeholder intencional; `slopcheck` → verificação manual (pkg oficial).

## Validation Architecture

> `workflow.nyquist_validation: true` em config.json — seção incluída.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | **Nenhum instalado** (verificado: sem vitest/jest/playwright; sem `*.test.*`) |
| Config file | none — ver Wave 0 |
| Quick run command | `npm run typecheck && npm run lint` (gates existentes) |
| Full suite command | `npm run build` (catches imports/JSX/RSC violations) + verificação manual a11y |

> O projeto usa typecheck + lint + build como gates de qualidade (TESTING.md). Não há, e o escopo desta fase não exige, suíte de teste de UI automatizada. Os critérios de aceite são majoritariamente **visuais/medição manual** (contraste, reduced-motion, bundle budget), não unit-testáveis sem infra nova.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DSGN-01 | Cinza ≥4.5:1 sobre branco; tokens compilam | manual + build | axe/Lighthouse em seção clara; `npm run build` | manual |
| DSGN-02 | first-load JS home <200KB | automated (build report) | `npm run build` → ler "First Load JS" da `/` | ✅ build |
| DSGN-03 | Nenhuma animação dispara sob reduced-motion | manual | DevTools Emulate `prefers-reduced-motion: reduce` + inspeção visual de cada island | manual |
| DSGN-04 | `@gsap/react` instalado; GSAP via `useGSAP` | automated | `npm ls @gsap/react`; grep ausência de `useEffect`+`gsap` cru | ✅ |
| DSGN-05 | `"use client"` só em `components/motion/*` e legados | automated | `grep -rL "use client" components/sections app/page.tsx` (deve estar limpo) | ✅ |
| RDSN-01 | 7 seções redesenhadas monocromáticas | manual | inspeção visual + ui-checker contra UI-SPEC | manual |
| RDSN-02 | Foto P&B + scrim no Hero/SobreRamon (ou placeholder) | manual | inspeção visual; contraste do texto sobre foto medido | manual |

### Sampling Rate
- **Per task commit:** `npm run typecheck && npm run lint`
- **Per wave merge:** `npm run build` (e ler First Load JS contra <200KB)
- **Phase gate:** build verde + checklist manual de a11y (contraste seção clara/escura + reduced-motion em todas as islands) antes de `/gsd:verify-work`

### Wave 0 Gaps
- [ ] Nenhuma infra de teste a instalar — o escopo não justifica Vitest/Playwright para esta fase (animação/visual é validado por DevTools + build report + ui-checker).
- [ ] (Opcional) Se o planner quiser um teste unitário, alvo trivial: `lib/usePrefersReducedMotion` com mock de `matchMedia` (jsdom) — mas isso exigiria instalar Vitest+jsdom (fora do escopo mínimo). Recomendado **não** introduzir infra de teste nesta fase; usar os gates existentes.

## Security Domain

> `security_enforcement` ausente em config.json → tratado como habilitado. Esta fase é UI estática sem entrada de usuário, sem auth, sem dados pessoais novos — superfície de segurança mínima.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Sem auth na landing (admin é fora de escopo) |
| V3 Session Management | no | Sem sessão na landing |
| V4 Access Control | no | Página pública |
| V5 Input Validation | no | **Sem formulário/submissão nesta fase** (captura = Fase 5; UI-SPEC §Error states: nenhum) |
| V6 Cryptography | no | Sem cripto |
| V14 Config | yes (leve) | Não introduzir tracking/script de terceiro (Fase 3); `next/image` só de `public/` local (sem `remotePatterns` abertos) |

### Known Threat Patterns for {Next.js landing estática monocromática}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Imagem externa não confiável via `next/image` | Tampering | Servir fotos de `public/ramon/` (mesma origem); não abrir `images.remotePatterns` |
| `alt`/conteúdo de placeholder injetável | — | Texto estático no código; sem input de usuário |
| Disparo prematuro de tracking (LGPD) | Info Disclosure | **Não tocar `TrackingScripts.tsx`** — é Fase 3; manter opt-in atual |

> Risco geral desta fase: **baixo**. O principal cuidado de conformidade é não acoplar nada de tracking/3rd-party à landing (continua sendo a fronteira da Fase 3).

## Sources

### Primary (HIGH confidence)
- `site/` código real lido nesta sessão — `globals.css`, `layout.tsx`, `page.tsx`, todas as 7 `sections/*`, `Reveal.tsx`, `AnimatedCounter.tsx`, `ui/CTAButton.tsx`, `lib/utils.ts`, `lib/site.ts`, `next.config.ts`, `package.json` — estado atual verificado
- `npm view @gsap/react` / `npm ls gsap` / `npm view animejs|framer-motion version` — versões e peers verificados nesta sessão
- https://gsap.com/resources/React/ — `useGSAP()`, scope, cleanup, `"use client"` obrigatório
- https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/ — pattern de reduced-motion + reversão automática
- `.planning/research/{STACK,PITFALLS,ARCHITECTURE,SUMMARY}.md` — pesquisa de projeto (HIGH)
- `.planning/phases/01-.../01-UI-SPEC.md` + `01-CONTEXT.md` — contrato visual e decisões travadas
- `.planning/codebase/{ARCHITECTURE,CONVENTIONS,TESTING}.md` — padrões e estado do site
- `brand/referencias-visuais.md` — lei monocromática, fotografia P&B + overlay

### Secondary (MEDIUM confidence)
- https://webflow.com/blog/gsap-becomes-free — GSAP grátis desde abr/2025
- WCAG 2.1 contrast — ratios de `#7f7f7f`/`#595959` sobre preto/branco (cálculo da pesquisa de projeto)

### Tertiary (LOW confidence)
- Nenhuma claim crítica depende só de fonte não verificada.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — uma dep nova, versão/peer verificados via npm nesta sessão; resto já instalado e lido do package.json
- Architecture: HIGH — padrões lidos direto do código + docs oficiais GSAP; client-island boundary documentado no codebase map
- Pitfalls: HIGH — contraste calculado na pesquisa de projeto; reduced-motion/bundle verificados em docs e no código existente
- Reconciliação de tokens/copy: HIGH — divergência observada diretamente entre `globals.css`/`Hero.tsx` e `01-UI-SPEC.md`

**Research date:** 2026-06-01
**Valid until:** 2026-07-01 (stack estável; revalidar `@gsap/react`/Next se houver major bump)
