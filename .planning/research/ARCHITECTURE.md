# Architecture Research

**Domain:** Blog SEO integrado a um pipeline de conteúdo multi-agente, sobre um site Next.js 16 App Router existente
**Researched:** 2026-05-31
**Confidence:** HIGH (estrutura do site e do pipeline lida diretamente do código; padrões Next 16/MDX/GSAP/SEO verificados em docs oficiais + fontes 2025/2026)

> **Premissa:** o site já existe. Este documento **não re-projeta** o que existe (RSC sections em `components/sections/`, `lib/site.ts`, tokens Tailwind v4, `proxy.ts` middleware, dashboard admin). Projeta apenas a **integração do novo**: blog MDX, ponte blog↔pipeline, composição das libs de animação, infra de SEO e newsletter — tudo aderente às convenções existentes.

---

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         PIPELINE MULTI-AGENTE (repo root)                  │
│                                                                            │
│  .claude/skills/novo-artigo/   ──orquestra──► agentes (pesquisador,        │
│  .claude/skills/repurpose-post/                copywriter, revisor-*)      │
│         │                                                                  │
│         │ escreve MDX                          export/conteudos/carrossel/ │
│         ▼                                              │ (fonte repurpose) │
│  ┌─────────────────────────────┐                       │                  │
│  │  site/content/blog/*.mdx    │◄──────repurpose────────┘                  │
│  │  (frontmatter + corpo)      │   (copy.md → MDX)                         │
│  └──────────────┬──────────────┘                                          │
└─────────────────┼──────────────────────────────────────────────────────────┘
                  │  build-time read (fs, server-only)
                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      SITE — Next.js 16 App Router                          │
│                                                                            │
│  lib/blog.ts (NOVO)  ──fs + gray-matter──►  PostMeta[] / PostContent      │
│       │  (server-only; bundled content, NÃO repo-root)                     │
│       ▼                                                                    │
│  app/blog/page.tsx (listagem RSC)    app/blog/[slug]/page.tsx (artigo RSC) │
│  app/blog/[slug]/opengraph-image.tsx  app/sitemap.ts  app/robots.ts        │
│       │                                                                    │
│       ├── mdx-components.tsx (mapeia tags MDX → componentes de marca)      │
│       ├── JSON-LD (Article / BreadcrumbList) inline na RSC                 │
│       └── client islands: animação + newsletter form                      │
│                                                                            │
│  app/api/newsletter/route.ts (NOVO) ──► provider (Resend Audiences)       │
│                                                                            │
│  AnimationProvider (client) ─ registra GSAP plugins 1x ─┐                  │
│  components/motion/*  (client islands: Scroll/Micro/WebGL wrappers)        │
└──────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `lib/blog.ts` (novo) | Ler `content/blog/*.mdx`, parsear frontmatter, listar/ordenar, resolver slug→post | `fs` + `gray-matter` + Zod schema; **server-only**, espelha o padrão `safe()` de `lib/dashboard/readers.ts` |
| `app/blog/page.tsx` | Listagem de artigos (cards, categorias) | RSC; chama `getAllPosts()` no corpo |
| `app/blog/[slug]/page.tsx` | Render de um artigo + metadata + JSON-LD | RSC; `generateStaticParams` + `generateMetadata` |
| `mdx-components.tsx` | Mapear elementos MDX (`h2`, `p`, `img`, callouts) a componentes monocromáticos de marca | `useMDXComponents` na raiz do site |
| `app/sitemap.ts` / `app/robots.ts` | SEO técnico file-based | Funções que importam `getAllPosts()` |
| `app/blog/[slug]/opengraph-image.tsx` | OG image por artigo | `ImageResponse` de `next/og` (Anton + foto P&B) |
| `AnimationProvider` (novo) | Registrar plugins GSAP uma vez; gate de `prefers-reduced-motion` | Client component em `app/` |
| `components/motion/*` (novo) | Wrappers client de animação (scroll, microinteração, WebGL) | `"use client"` leaf islands |
| `app/api/newsletter/route.ts` (novo) | Receber e-mail, validar, encaminhar ao provider | Route Handler Node.js; valida + chama SDK do provider |
| Skill `novo-artigo` (novo) | Orquestrar pesquisa→copy→revisão→MDX versionado | SKILL.md no padrão GSD existente |
| Skill `repurpose-post` (novo) | Converter `export/.../copy.md` em artigo MDX expandido | SKILL.md; lê `export/`, escreve `content/blog/` |

---

## Recommended Project Structure

```
site/
├── content/
│   └── blog/                       # NOVO — fonte de verdade dos artigos
│       └── <slug>.mdx              # frontmatter YAML + corpo MDX
│
├── app/
│   ├── blog/                       # NOVO — rotas do blog
│   │   ├── page.tsx                # listagem (RSC)
│   │   ├── [slug]/
│   │   │   ├── page.tsx            # artigo (RSC) + generateMetadata + JSON-LD
│   │   │   └── opengraph-image.tsx # OG image dinâmica por artigo
│   │   └── categoria/[cat]/page.tsx# (opcional fase 2) filtro por categoria
│   ├── sitemap.ts                  # NOVO — inclui home + artigos
│   ├── robots.ts                   # NOVO
│   ├── api/
│   │   └── newsletter/route.ts     # NOVO — captura de e-mail
│   └── providers.tsx               # NOVO — AnimationProvider (client)
│
├── mdx-components.tsx              # NOVO — na raiz de site/ (convenção @next/mdx)
│
├── components/
│   ├── blog/                       # NOVO — UI específica do blog (RSC por padrão)
│   │   ├── PostCard.tsx            # card de listagem (RSC)
│   │   ├── PostHeader.tsx          # título/autor/data (RSC)
│   │   └── ...
│   ├── motion/                     # NOVO — client islands de animação
│   │   ├── ScrollReveal.tsx        # "use client" — GSAP ScrollTrigger
│   │   ├── MicroFx.tsx             # "use client" — anime.js microinteração
│   │   └── WebGLScene.tsx          # "use client" + dynamic import three.js
│   ├── newsletter/
│   │   └── NewsletterForm.tsx      # "use client" — POSTa /api/newsletter
│   ├── sections/                   # EXISTENTE — não mexer na fronteira RSC
│   ├── ui/                         # EXISTENTE
│   └── Reveal.tsx                  # EXISTENTE (Framer Motion legado — manter)
│
└── lib/
    ├── blog.ts                     # NOVO — reader de content/blog (server-only)
    ├── site.ts                     # EXISTENTE — adicionar SITE_URL, AUTHOR, etc.
    └── utils.ts                    # EXISTENTE
```

### Structure Rationale

- **`content/blog/` dentro de `site/`, não no repo root.** Crítico: o reader do dashboard (`lib/dashboard/readers.ts`) lê `../campanhas/` e `../dados/` relativo a `process.cwd()` e isso **só funciona em dev** — no Vercel serverless o repo não existe, por isso usa `safe()` com fallback vazio (ARCHITECTURE.md existente, linha 200). O blog **não pode** depender desse padrão: o conteúdo precisa estar **bundled** com o app. Colocar os `.mdx` em `site/content/blog/` os inclui no build → `fs.readdirSync` funciona em produção. Esta é a diferença arquitetural central entre o blog e o dashboard.
- **`mdx-components.tsx` na raiz de `site/`.** Convenção obrigatória do `@next/mdx` (já habilitado em `next.config.ts` com `pageExtensions` incluindo `md/mdx`). É onde a marca trava: cada elemento MDX é mapeado para um componente monocromático (Anton/Montserrat, tokens `text-fg`/`text-muted`), garantindo que nenhum artigo escape do design system.
- **`components/blog/` separado de `components/sections/`.** Sections são a landing; blog é outra superfície. Ambos RSC por padrão, mas mantê-los separados evita acoplamento e respeita a convenção "uma pasta por papel" (STRUCTURE.md).
- **`components/motion/` isola TODAS as `"use client"` de animação.** A regra de ouro do código existente: nunca colocar `"use client"` em section ou page (anti-pattern documentado, linha 208). As novas libs (GSAP/anime.js/three) só tocam o DOM no cliente → vivem exclusivamente em islands leaf importadas por RSCs.
- **`lib/blog.ts` espelha `lib/dashboard/readers.ts`.** Mesmo padrão: server-only, funções puras de leitura, `safe()`-style error handling. Mantém a camada `lib/` como terminal (sem imports circulares).

---

## Architectural Patterns

### Pattern 1: Pipeline → MDX → Render (fluxo de conteúdo)

**What:** O conteúdo é produzido fora do site (pelos agentes) e aterrissa como `.mdx` versionado em `site/content/blog/`. O site só **lê** — nunca escreve em runtime. Duas vias de entrada:

1. **Skill geradora (`novo-artigo`):** pesquisa (pesquisador-mercado) → briefing (briefing-writer) → corpo longo (copywriter, modo artigo) → revisão (revisor-conteudo + revisor-brand) → grava `site/content/blog/<slug>.mdx` com frontmatter completo.
2. **Repurpose (`repurpose-post`):** lê um `export/conteudos/carrossel/<data>-<slug>/` (copy.md + briefing.md já aprovados) → copywriter expande os slides em prosa de artigo → revisor-brand valida → grava MDX. Reaproveita conteúdo já produzido e aprovado.

**When to use:** Sempre. É a fronteira que mantém o site stateless e cacheável. Geração de conteúdo é trabalho de agente (precisa de write no repo); render é trabalho do Next.

**Trade-offs:**
- (+) Site permanece estático/SSG; sem DB; conteúdo em git (auditável, reversível, revisado por brand gate).
- (+) Reusa o pipeline e os gates de compliance/brand já existentes — o blog não burla a curadoria.
- (−) Publicar um artigo exige um commit + rebuild (não é CMS ao vivo). Aceitável: a cadência de blog é baixa e o controle de marca é "lei não negociável".

**Frontmatter MDX (schema proposto):**
```yaml
---
title: "Por que consistência vence intensidade"
slug: "consistencia-vence-intensidade"   # = nome do arquivo; canônico
description: "..."                          # usado em <meta> e card
category: "mentalidade"                     # de pilares-conteudo.md
author: "ramon"                             # chave → lib/site.ts AUTHORS
publishedAt: "2026-05-31"
updatedAt: "2026-05-31"                     # opcional
cover: "/blog/<slug>/cover.jpg"             # foto P&B do acervo
draft: false                                # filtra do build em produção
sourceContent: "export/.../<slug>"          # rastreio de repurpose (opcional)
---
```

### Pattern 2: Client-island de animação sobre RSC (composição das 4 libs)

**What:** As quatro camadas de animação (GSAP scroll-driven, anime.js microinterações, three.js WebGL pontual, Framer Motion legado) coexistem porque **todas são leaf islands `"use client"`** importadas por RSCs. Nenhuma sobe `"use client"` para o nível de section/page.

**When to use:**
- **GSAP + ScrollTrigger** → animação scroll-driven (parallax foto, sequências editoriais). Requer **adicionar `@gsap/react`** (o hook `useGSAP` NÃO está no package.json — só `gsap`). `useGSAP` dá cleanup automático e evita conflito com o virtual DOM do React.
- **anime.js** → microinterações pontuais (hover de CTA, contadores, transições curtas). Mais leve que GSAP para efeitos discretos.
- **three.js** → WebGL pontual (1 cena de impacto, ex: hero). **Sempre `next/dynamic` com `ssr: false`** + lazy-load — three é pesado (~150KB+), não pode entrar no bundle inicial.
- **Framer Motion** → manter o que já existe (`Reveal`, `AnimatedCounter`). Não migrar o legado; usar Framer só onde já está.

**Trade-offs:**
- (+) RSC streaming preservado; JS só embarca onde há interação.
- (−) Quatro libs = risco de duplicar responsabilidade. **Disciplina necessária:** uma regra clara por camada (scroll=GSAP, micro=anime, WebGL=three, legado=Framer). Não usar duas libs para o mesmo efeito.

**Provider central (registra plugins 1x):**
```tsx
// app/providers.tsx
"use client";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
export function AnimationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    // respeitar prefers-reduced-motion (constraint de marca)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      ScrollTrigger.getAll().forEach((t) => t.disable());
    }
  }, []);
  return <>{children}</>;
}
```
```tsx
// components/motion/WebGLScene.tsx — three.js lazy, nunca SSR
"use client";
import dynamic from "next/dynamic";
const Scene = dynamic(() => import("./_scene"), { ssr: false, loading: () => null });
export function WebGLScene() { return <Scene />; }
```

### Pattern 3: SEO file-based na RSC (metadata + sitemap + JSON-LD)

**What:** Toda a infra de SEO usa as convenções file-based do App Router, sem libs externas. O `RootLayout` existente já define `metadataBase` e OG default — o blog estende isso por rota.

**When to use:** Sempre, por artigo.

- **`generateMetadata`** em `app/blog/[slug]/page.tsx` → title/description/canonical/OG por artigo, lidos do frontmatter.
- **`generateStaticParams`** → SSG de todos os slugs no build (rápido, indexável).
- **`opengraph-image.tsx`** por artigo → `ImageResponse` (Anton + foto P&B) resolve a pendência de `og:image` já mapeada em CONCERNS.
- **`sitemap.ts` / `robots.ts`** → file-based, versionados; `sitemap.ts` importa `getAllPosts()`.
- **JSON-LD** → `<script type="application/ld+json">` inline na RSC do artigo (`Article` + `BreadcrumbList`); `FAQPage` na home (a section FAQ existe).

**Trade-offs:**
- (+) Zero dependências novas de SEO; tudo nativo do Next 16.
- (+) `metadataBase` já configurado em `layout.tsx` → URLs absolutas corretas.
- (−) `opengraph-image.tsx` com `ImageResponse` tem limites de CSS (subset flexbox); o design da OG precisa ser simples.

```tsx
// app/blog/[slug]/page.tsx (trecho)
export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = getPostBySlug((await params).slug);
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", publishedTime: post.publishedAt },
  };
}
```

### Pattern 4: Newsletter via Route Handler + provider único

**What:** `NewsletterForm` (client island) → POST `/api/newsletter` (Route Handler Node.js, padrão idêntico aos handlers já existentes em `app/api/`) → encaminha ao provider de e-mail.

**Recommendation:** **Resend Audiences** como provider. Racional: a stack já carrega `@anthropic-ai/sdk` e tem cultura de "código no controle" (ARCHITECTURE existente); Resend é SDK-first, sem painel pesado, integra em uma chamada, e cobre double opt-in. Alternativa de menor custo: MailerLite (double opt-in nativo via API). Self-hosted (Listmonk) descartado: adiciona infra que o escopo não comporta (deploy fora de escopo).

**LGPD:** o handler só dispara após consentimento explícito (constraint de marca). O form exige checkbox de consentimento; tracking scripts permanecem opt-in (padrão já existente em `TrackingScripts`).

**Trade-offs:**
- (+) Mesma forma dos handlers existentes (`runtime = "nodejs"`, valida input, retorna JSON estruturado).
- (−) Adiciona 1 env var (`RESEND_API_KEY`) e 1 dependência. Aceitável.

---

## Data Flow

### Fluxo de geração (pipeline → MDX)

```
[/novo-artigo <tema>]
   ↓  (skill orquestra)
pesquisador-mercado → dados/pesquisas-brutas/<data>-<slug>.md
   ↓
briefing-writer → briefing inline (ângulo, pilar, slug)
   ↓
copywriter (modo artigo) → corpo longo em prosa
   ↓
revisor-conteudo + revisor-brand → APROVADO
   ↓
⚙ skill grava → site/content/blog/<slug>.mdx  (frontmatter + corpo)
   ↓
[commit + rebuild]  → artigo indexável no ar
```

### Fluxo de repurpose (export → MDX)

```
export/conteudos/carrossel/<data>-<slug>/copy.md + briefing.md
   ↓  [/repurpose-post <pasta>]
copywriter expande slides → prosa de artigo
   ↓
revisor-brand valida (copy já passou por curadoria no /novo-post)
   ↓
⚙ skill grava → site/content/blog/<slug>.mdx (sourceContent aponta a origem)
```

### Fluxo de render (request)

```
GET /blog/<slug>
   ↓
Next SSG (build-time): generateStaticParams já gerou a rota
   ↓
app/blog/[slug]/page.tsx (RSC)
   → getPostBySlug() lê content/blog/<slug>.mdx (bundled)
   → gray-matter separa frontmatter + corpo
   → MDX compila com mdx-components.tsx (componentes de marca)
   → JSON-LD Article inline
   ↓
HTML estático + client islands hidratam (ScrollReveal, NewsletterForm)
```

### Fluxo de newsletter

```
NewsletterForm (client) → POST /api/newsletter { email, consent }
   ↓
route.ts (Node): valida email + consent → Resend.contacts.create(audienceId)
   ↓
provider dispara double opt-in → retorna { ok: true }
```

---

## Build Order (dependências entre os blocos)

Ordem sugerida de fases, derivada das dependências reais:

1. **Fundação MDX + reader** — `lib/blog.ts`, `mdx-components.tsx`, schema de frontmatter, 1-2 artigos seed escritos à mão. **Bloqueia tudo o mais do blog.** Sem reader, não há listagem nem render.
2. **Rotas do blog** — `app/blog/page.tsx` + `app/blog/[slug]/page.tsx` + `components/blog/*`. Depende de (1).
3. **SEO técnico** — `generateMetadata`, `sitemap.ts`, `robots.ts`, `opengraph-image.tsx`, JSON-LD. Depende de (2) (precisa das rotas e do reader para enumerar artigos).
4. **Skills de conteúdo** — `novo-artigo` + `repurpose-post`. Depende de (1) (precisa do schema de frontmatter como contrato de saída) mas é **independente das rotas** — pode rodar em paralelo a (2)/(3). Recomendado vir após (1) para validar o schema com artigos reais.
5. **Animação** — `AnimationProvider`, `components/motion/*`. **Independente do blog**; aplica-se tanto à landing (redesign) quanto ao blog. Requer **adicionar `@gsap/react`** ao package.json. Pode rodar cedo (serve o redesign editorial), mas a integração no blog depende de (2).
6. **Newsletter** — `api/newsletter/route.ts` + `NewsletterForm`. Independente; depende só de decidir o provider (Resend) e setar env var. Pode entrar em qualquer fase após a fundação.

**Caminho crítico:** (1) → (2) → (3). (4), (5), (6) penduram em (1)/(2) mas paralelizáveis entre si.

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0–50 artigos | SSG puro. `getAllPosts()` lê tudo no build. Zero otimização necessária. |
| 50–500 artigos | Manter SSG; build ainda rápido. Adicionar paginação na listagem e índice por categoria. Considerar `generateStaticParams` com `dynamicParams` para slugs antigos. |
| 500+ artigos | Build time começa a doer. Avaliar ISR (`revalidate`) ou mover conteúdo para um headless CMS — mas isso quebraria o modelo "conteúdo em git via pipeline"; só se a cadência de blog explodir (improvável para uma marca pessoal). |

### Scaling Priorities

1. **Primeiro gargalo:** tempo de build conforme artigos acumulam (cada MDX é compilado no build). Mitigação: paginação + não compilar drafts.
2. **Segundo gargalo:** `opengraph-image.tsx` por artigo gerado no build pode somar. Mitigação: cache de OG ou imagem estática quando o artigo não muda.

---

## Anti-Patterns

### Anti-Pattern 1: Ler `content/blog/` via `lib/dashboard/readers.ts` (repo-root)

**What people do:** Reusar o reader do dashboard, que resolve `path.resolve(process.cwd(), "..")` para ler do repo root.
**Why it's wrong:** Esse padrão é **dev-only** — no Vercel serverless o repo não existe e os readers retornam vazio com `safe()`. O blog ficaria sem conteúdo em produção.
**Do this instead:** `lib/blog.ts` lê de `site/content/blog/` (dentro do app, bundled no build). Conteúdo viaja com o deploy.

### Anti-Pattern 2: `"use client"` em `app/blog/[slug]/page.tsx` para animar o artigo

**What people do:** Marcar a página inteira como client para usar GSAP/Framer no conteúdo.
**Why it's wrong:** Mata o SSR/streaming, infla o bundle, e quebra `generateMetadata`/`generateStaticParams` (não funcionam em client components). Viola o anti-pattern já documentado (ARCHITECTURE linha 208).
**Do this instead:** Página RSC; importar `components/motion/ScrollReveal` (island) só onde há animação.

### Anti-Pattern 3: three.js no bundle inicial / com SSR

**What people do:** `import * as THREE from "three"` direto em um componente renderizado no server.
**Why it's wrong:** three referencia `window`/`document` → quebra no SSR; ~150KB+ no bundle inicial mata o LCP (e a marca exige performance/A11y).
**Do this instead:** `next/dynamic` com `ssr: false`, lazy, e só onde o efeito justifica.

### Anti-Pattern 4: Frontmatter sem schema / sem validação

**What people do:** Ler `gray-matter` e usar os campos crus.
**Why it's wrong:** Um artigo gerado por agente com campo faltando quebra o build silenciosamente ou gera SEO inválido.
**Do this instead:** Validar o frontmatter com Zod em `lib/blog.ts`; o schema vira o **contrato de saída** das skills `novo-artigo`/`repurpose-post`.

### Anti-Pattern 5: Duas libs de animação para o mesmo efeito

**What people do:** Animar scroll ora com GSAP, ora com Framer Motion `whileInView`, sem regra.
**Why it's wrong:** Dobra bundle e cria inconsistência visual.
**Do this instead:** Regra fixa — scroll-driven = GSAP; microinteração = anime.js; WebGL = three; legado existente = Framer (não expandir). Documentar em CONVENTIONS.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Resend (newsletter) | SDK em Route Handler Node.js (`api/newsletter/route.ts`) | Env var `RESEND_API_KEY`; double opt-in; só após consentimento (LGPD) |
| GA4 / Meta Pixel / Clarity | Já existente (`TrackingScripts`, opt-in) | Blog herda tracking automaticamente via `RootLayout` |
| Anthropic (skills) | Já existente; skills rodam em runtime com write no repo (não serverless) | `novo-artigo`/`repurpose-post` executam local/CI, não na API route |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Pipeline ↔ blog | Filesystem (skill escreve `content/blog/*.mdx`; site lê no build) | Fronteira assíncrona via git; site nunca escreve conteúdo em runtime |
| `export/` ↔ `content/blog/` | Skill `repurpose-post` lê `copy.md`/`briefing.md`, escreve MDX | Conteúdo já curado; repurpose só re-formata + revisa brand |
| RSC ↔ animação | Import de island `"use client"` | Nunca subir `"use client"` para page/section |
| RSC ↔ `lib/blog.ts` | Chamada direta no corpo da RSC (server-only) | `lib/` é camada terminal; sem imports circulares |
| Client form ↔ provider | `NewsletterForm` → `/api/newsletter` → Resend | Mesmo padrão de `DispatchButton` → `/api/skills/dispatch` |

---

## Sources

- [Next.js — Guides: MDX](https://nextjs.org/docs/app/guides/mdx) — `@next/mdx`, `mdx-components.tsx`, frontmatter via remark/gray-matter (HIGH)
- [Next.js — Metadata and OG images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) — `generateMetadata`, `opengraph-image`, `ImageResponse` (HIGH)
- [Next.js — generateMetadata reference](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) (HIGH)
- [GSAP — React / useGSAP](https://gsap.com/resources/React/) — `"use client"` obrigatório, `@gsap/react` para cleanup, registro central de plugins (HIGH)
- [Optimizing GSAP in Next.js 15](https://medium.com/@thomasaugot/optimizing-gsap-animations-in-next-js-15-best-practices-for-initialization-and-cleanup-2ebaba7d0232) — init/cleanup, `ScrollTrigger.refresh()` (MEDIUM)
- [How to Configure SEO in Next.js 16](https://jsdevspace.substack.com/p/how-to-configure-seo-in-nextjs-16) — `sitemap.ts`/`robots.ts` file-based, JSON-LD (MEDIUM)
- [Resend / MailerLite double opt-in](https://www.mailerlite.com/help/how-to-use-double-opt-in-when-collecting-subscribers) — comparação de providers, double opt-in (MEDIUM)
- Código do repositório: `site/next.config.ts` (MDX já habilitado), `site/package.json` (gsap/animejs/three já instalados; `@gsap/react` ausente), `site/lib/dashboard/readers.ts` (padrão de reader), `.claude/skills/novo-post/SKILL.md` (padrão de skill/pipeline), `.planning/codebase/ARCHITECTURE.md` (fronteira RSC/client, dev-only fs reads) (HIGH)

---
*Architecture research for: blog SEO integrado a pipeline multi-agente sobre Next.js 16 App Router*
*Researched: 2026-05-31*
