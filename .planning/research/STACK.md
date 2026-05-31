# Stack Research

**Domain:** Site de marketing + blog SEO (consultoria fisiculturismo, marca pessoal Ramon Dino) sobre app Next.js 16 existente
**Researched:** 2026-05-31
**Confidence:** HIGH (versões verificadas via npm registry + docs oficiais Next.js/GSAP/Velite; recomendações cruzadas em múltiplas fontes)

> **Escopo:** Este é um milestone SOBRE um app já em produção. NÃO há re-pesquisa de Next/React/Tailwind — eles são dados (Next 16.2.6 / React 19.2.4 / Tailwind 4 / Turbopack). Tudo abaixo é o que se ADICIONA. As 4 libs de animação (GSAP, anime.js, three.js, Framer Motion) **já estão instaladas** (`site/package.json`) — a pesquisa decide como coexistir, não se instalar.

---

## Recommended Stack

### Core Technologies (a adicionar/fixar)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `@gsap/react` | `^2.1.2` | Hook `useGSAP()` para integrar GSAP ao ciclo de vida React/RSC | Único caminho oficialmente suportado para GSAP em React. Faz cleanup automático (context) de timelines/ScrollTriggers no unmount — evita memory leak e animação em nós já desmontados. Sem ele, GSAP em Next 16 vira fonte de bugs de hydration. |
| `resend` | `^6.12.4` | Newsletter (audiences + broadcasts) + e-mail transacional | API developer-first, captura via Server Action server-side (chave nunca no client), audiences nativas para newsletter, e React Email para o conteúdo. Cobre captura E envio com uma só dependência e um só vendor. |
| `next-mdx-remote-client` | `^2.1.11` | Render de MDX lido do filesystem em runtime/build no App Router | Os artigos são **gerados por skill** e versionados em `site/content/*.mdx`. Esta lib renderiza MDX a partir de string (RSC-friendly, fork mantido do `next-mdx-remote` com suporte real a App Router/React 19), sem acoplar o conteúdo a rotas físicas nem depender de plugin Webpack — **crucial porque o dev roda em Turbopack** (ver §What NOT to Use). |
| `gray-matter` | `^4.0.3` | Parse de frontmatter YAML dos `.mdx` | Padrão de fato, zero-config, síncrono, roda em RSC/build. Lê `title/description/date/cover/tags` do artigo gerado pela skill. |
| `zod` | `^4` (alinhar à versão já resolvida no lockfile; senão `^4.x`) | Validação do frontmatter no build/load | Garante que o MDX que a skill gerou tem os campos de SEO obrigatórios antes de publicar. Falha cedo em vez de renderizar artigo sem `description`/`date`. Provável já presente transitivamente. |
| `schema-dts` | `^1.1.5` | Tipos TypeScript para JSON-LD (structured data) | Tipa os objetos `Organization`, `BlogPosting`, `FAQPage`, `BreadcrumbList` para `<script type="application/ld+json">`. Garante JSON-LD válido em vez de objeto solto sem tipo. |

> **Confiança Core:** HIGH para `@gsap/react`, `resend`, `gray-matter`, `schema-dts`. HIGH-com-ressalva para `next-mdx-remote-client` (escolha sobre Velite justificada por incompatibilidade Velite×Turbopack — ver Alternatives + What NOT to Use).

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `rehype-pretty-code` | `^0.14.3` | Syntax highlighting de blocos de código no MDX (Shiki) | Só se artigos tiverem código. Para um blog de fitness/mindset, **provavelmente dispensável** — não instalar até existir necessidade. |
| `remark-gfm` | `^4.x` | Tabelas, task lists, autolink no MDX | Instalar se a skill gerar tabelas (ex.: comparativos de treino). Plugin remark padrão. |
| `tailwind-merge` | `^3.6.0` | Resolver conflitos de classe Tailwind no `cn()` | CONCERNS.md aponta que `cn()` hoje não usa tailwind-merge. Adicionar quando o redesign introduzir componentes com `className` override (provável). Baixo custo, alto valor. |
| `clsx` | `^2.1.1` | Composição condicional de classes (par canônico do `tailwind-merge`) | Junto com `tailwind-merge` no novo `cn()`. |
| `@react-email/components` | `^0.x` (latest) | Compor o e-mail de boas-vindas/broadcast como componente React | Só se quiser e-mails branded (monocromático). Opcional no MVP de captura; necessário quando houver fluxo de welcome. |

> **Confiança Supporting:** HIGH. Note que vários são condicionais — não instalar "por precaução".

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `next/og` (`ImageResponse`) | OG image dinâmica por página/artigo | **Já vem com Next 16** — não é dependência. Use `opengraph-image.tsx` por segmento de rota. Em Next 16 roda no Node runtime por padrão; só force edge se medir necessidade. 1200×630, monocromático com foto P&B do acervo. |
| `sitemap.ts` / `robots.ts` | Sitemap e robots nativos | **Built-in do App Router.** Substituem qualquer plugin de sitemap. `sitemap.ts` deve enumerar artigos lendo `site/content/`. |
| `generateMetadata` / `generateStaticParams` | Metadata e SSG por artigo | **Built-in.** `generateStaticParams` pré-renderiza cada artigo no build (blog estático → rápido + SEO). |

---

## Installation

```bash
# de dentro de site/

# Core — animação React + newsletter + pipeline MDX + SEO tipado
npm install @gsap/react resend next-mdx-remote-client gray-matter schema-dts

# cn() robusto (resolve concern existente)
npm install clsx tailwind-merge

# Condicionais — só quando o conteúdo exigir
npm install remark-gfm                         # tabelas/GFM no MDX
npm install rehype-pretty-code shiki           # só se houver blocos de código
npm install @react-email/components            # só p/ e-mail branded de welcome/broadcast

# zod normalmente já está resolvido (peer de várias libs); fixar se necessário:
npm install zod
```

> `gsap`, `animejs`, `three`, `framer-motion` JÁ estão instalados — não reinstalar. `next/og`, `sitemap.ts`, `robots.ts`, `generateMetadata`, `ImageResponse` são built-in do Next 16 — zero install.

---

## Estratégia de animação multi-lib (a decisão central)

As 4 libs já existem no `package.json`. Carregar todas em toda página mataria o bundle e o LCP. A regra é **uma lib por trabalho, carregada onde o trabalho acontece** — nunca quatro engines de animação no mesmo componente.

| Lib | Versão instalada | Papel ÚNICO atribuído | Carregamento |
|-----|------------------|------------------------|--------------|
| **Framer Motion** | `^12.40` | Reveals on-scroll declarativos e microtransições de UI já existentes (`Reveal`, `AnimatedCounter`). **Backbone padrão.** | Já em uso. Mantém. É a escolha default para 90% das animações de seção. |
| **GSAP + ScrollTrigger** | `^3.15` (+ `@gsap/react`) | Sequências scroll-driven complexas (pin, timeline encadeada, parallax de foto P&B) que Framer não faz bem. SplitText para revelar títulos Anton palavra-a-palavra. | Só em componentes `"use client"` que precisam, via `useGSAP()` com `scope` ref. Importar plugins sob demanda. |
| **three.js** | `^0.184` | WebGL pontual e parcimonioso (Constraint: "parcimônia"). No máximo 1 cena (ex.: hero com partículas/grão monocromático). | **`next/dynamic` com `ssr: false`** + `IntersectionObserver` para montar só quando visível. `@types/three` já instalado. Forte candidato a NÃO usar no MVP. |
| **anime.js** | `^4.4` | Microinterações isoladas (hover de botão, tick de número, stagger leve) onde GSAP seria overkill. | Import nomeado da v4 (`import { animate } from 'animejs'`). Use só se Framer não cobrir o caso com elegância. |

**Regra de coexistência (anti-conflito de bundle/hydration):**
1. **Nenhuma das 4 no RSC.** Toda animação imperativa (GSAP/anime/three) vive em componente `"use client"` isolado e pequeno; a seção RSC só o importa.
2. **GSAP sempre via `useGSAP()`** (`@gsap/react`) — nunca `useEffect` cru. Garante cleanup e evita o leak documentado.
3. **three.js sempre `dynamic({ ssr:false })`** — nunca importado estático (quebra build SSR e infla o bundle inicial em ~600kB).
4. **Plugins GSAP importados pontualmente** no client component que usa, não global.
5. **`prefers-reduced-motion`** respeitado em todas (Constraint A11y): GSAP via `gsap.matchMedia()`, Framer via `useReducedMotion()`.
6. **Decisão de redução de escopo recomendada:** para "editorial sóbrio" (Key Decision do PROJECT), Framer Motion + GSAP/ScrollTrigger cobrem o ambicionado. **three.js e anime.js devem ser tratados como opcionais/stretch** — não são caminho crítico e cada um adiciona peso. O executor pode removê-los do MVP sem perda.

> Confiança: HIGH. `@gsap/react`/`useGSAP` é prescrição oficial GSAP para App Router; `dynamic ssr:false` para three é consenso.

---

## Newsletter: recomendação única

**Recomendado: Resend (`^6.12.4`) — Audiences + Broadcasts.**

Por quê, dado ESTE projeto:
- **Já existe afinidade de stack.** O app é Next 16 com Route Handlers/Server Actions e a marca já é um SO multi-agente que gera conteúdo. Captura de e-mail vira uma Server Action de ~15 linhas chamando `resend.contacts.create()` numa audience — chave server-side, nada exposto ao client, zero SDK pesado no bundle.
- **Um vendor cobre dois usos.** Resend faz transacional E newsletter (Broadcasts). Como o repo já produz conteúdo via skill, dá para evoluir para enviar broadcast do MDX repurposado pela mesma API, sem segundo fornecedor.
- **DX e preço.** Free tier generoso; sem editor visual imposto; e-mails compostos em React Email (branding monocromático fiel à marca).
- **Fit cultural com a marca.** "Marca de elite, não popular" + tom sóbrio → e-mail como componente controlado, não template genérico de plataforma de marketing.

**Quando eu mudaria:**
- Se o usuário quiser **automação de funil visual / sequências de nurture sem código** → **Kit (ex-ConvertKit)** ou **Loops**. Mas isso contraria o "você decide" + o perfil dev do repo.
- Se a prioridade fosse **publicar a newsletter direto de Git/markdown** como produto editorial → **Buttondown**. Bom fit conceitual com "artigos versionados", mas adiciona vendor e tira o controle de branding fino.

> Confiança: HIGH na recomendação (Resend), MEDIUM nas condições de troca (dependem de preferência futura do usuário). Pratique a captura como Server Action — não exponha a API key via `NEXT_PUBLIC_`.

---

## Pipeline MDX: recomendação única

**Recomendado: leitura própria de filesystem + `next-mdx-remote-client` + `gray-matter` + validação `zod`.**

Por quê, dado que os artigos são **gerados por skill e versionados em `site/content/`** e o dev roda em **Turbopack**:
- **Velite (a alternativa mais forte) quebra com Turbopack.** O `VeliteWebpackPlugin` não funciona com Turbopack; exige rodar o CLI Velite em paralelo (`velite --watch` + concorrência no script `dev`) ou um wrapper plugin. Adiciona um passo de build separado e um diretório gerado `.velite/`. Para um blog cujo conteúdo já é file-based e gerado por skill, isso é cerimônia extra sem ganho proporcional.
- **`next-mdx-remote-client` casa com "conteúdo como dado".** A skill escreve um `.mdx`; uma função `getArticle(slug)` lê o arquivo, separa frontmatter (`gray-matter`), valida (`zod`) e renderiza a string MDX num RSC. O conteúdo NÃO precisa ser uma rota física — exatamente o que o repurpose de `export/` também quer.
- **`@next/mdx` (já configurado) é ortogonal, não concorrente.** Ele serve MDX-como-página (cada `.mdx` = uma rota). Serve para páginas estáticas pontuais (ex.: uma landing MDX), mas **não** para um índice de blog dinâmico que lista/ordena/filtra artigos por frontmatter. Mantenha `@next/mdx` habilitado; use `next-mdx-remote-client` para o blog.
- **Contentlayer está morto** (não mantido) — eliminado.
- **fumadocs** é excelente, mas é uma framework de **documentação** (sidebar, search, layout docs). Overkill e fora de tom para um blog editorial de marca.

Fluxo prescrito:
```
skill gera → site/content/<slug>.mdx (frontmatter + corpo)
           → lib/blog.ts: getAllArticles() / getArticle(slug)
                 gray-matter (parse) → zod (valida SEO obrigatório) → next-mdx-remote-client (render RSC)
           → app/blog/page.tsx (índice, lê frontmatter)
           → app/blog/[slug]/page.tsx (generateStaticParams + generateMetadata + render)
```

> Confiança: HIGH. A incompatibilidade Velite×Turbopack está documentada (Velite docs + GitHub). Se o projeto migrasse `dev` para Webpack, Velite voltaria a ser competitivo (ver Alternatives).

---

## SEO técnico (tudo built-in do Next 16 — quase zero dependência)

| Recurso | Como (App Router) | Nota |
|---------|-------------------|------|
| `metadataBase` | Setar em `app/layout.tsx` | **Pré-requisito de tudo.** Hoje a base URL está hardcoded; mover para `metadataBase` resolve OG/canonical/sitemap relativos. |
| Metadata por página | `export const metadata` (estático) / `generateMetadata` (dinâmico, por artigo) | title 55–60 char, description 150–160. |
| Sitemap | `app/sitemap.ts` enumerando `site/content/` | Substitui plugins. Inclui home, seções-âncora se aplicável, e cada artigo. |
| Robots | `app/robots.ts` | Disallow `/admin/`, `/api/`; aponta para sitemap. |
| JSON-LD | `<script type="application/ld+json">` tipado com `schema-dts` | `Organization` no layout (1×); `BlogPosting` por artigo (datePublished/dateModified/author); `FAQPage` na seção FAQ existente; `BreadcrumbList` no blog. |
| OG dinâmica | `opengraph-image.tsx` por rota via `ImageResponse` (`next/og`) | Por-artigo com título Anton sobre foto P&B. 1200×630. Built-in. |
| Canonical | Campo `alternates.canonical` no metadata | Evita duplicação home/blog. |

> Confiança: HIGH. Confirmado nos docs oficiais Next.js (Metadata API, file conventions sitemap/robots, ImageResponse).

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `next-mdx-remote-client` (FS reader) | **Velite** | Se `dev`/`build` migrar para Webpack (sem Turbopack), ou se quiser type-safety Zod gerada automaticamente + asset processing (imagens do MDX otimizadas). Forte, mas atrito com Turbopack hoje. |
| `next-mdx-remote-client` | **@next/mdx puro (MDX como rota)** | Para páginas MDX estáticas avulsas (não um índice de blog). Mantemos ele habilitado para esse caso. |
| Resend | **Kit (ex-ConvertKit) / Loops** | Se quiser automação de funil/sequências visuais sem código. |
| Resend | **Buttondown** | Se a newsletter for produto editorial publicado de Git/markdown e simplicidade > branding fino. |
| Framer Motion + GSAP | **Só Framer Motion** | Se "editorial sóbrio" se provar suficiente sem scroll-driven pesado — reduz superfície e bundle. Caminho de fallback legítimo. |
| `gray-matter` | parser próprio | Nunca; gray-matter é trivial e robusto. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Contentlayer / contentlayer2** | Projeto não mantido; sem garantia de suporte React 19/Next 16. | `next-mdx-remote-client` + gray-matter |
| **VeliteWebpackPlugin com Turbopack** | Plugin Webpack não funciona com Turbopack (o `dev` deste projeto). Levaria a setup com CLI paralelo. | Leitura FS própria; ou Velite só se migrar p/ Webpack |
| **three.js no bundle inicial / import estático** | +~600kB no JS inicial; quebra SSR. Mata LCP de um site de conversão. | `next/dynamic({ ssr:false })` + IntersectionObserver, ou cortar do MVP |
| **GSAP via `useEffect` cru** | Memory leak + animação em nós desmontados em RSC/App Router. | `useGSAP()` de `@gsap/react` com `scope` |
| **Pacote `gsap-trial` / club plugins pagos antigos** | GSAP é 100% grátis desde abr/2025 (Webflow) — SplitText/ScrollTrigger/MorphSVG incluídos no `gsap` core. | `gsap` `^3.15` padrão (já instalado) |
| **API key de newsletter via `NEXT_PUBLIC_`** | Expõe credencial no client. | Server Action / Route Handler server-side |
| **`react-helmet` / libs de `<head>` de terceiros** | Redundante e conflita com App Router. | Metadata API nativa |
| **Plugin de sitemap (`next-sitemap`)** | App Router tem `sitemap.ts` nativo. | `app/sitemap.ts` |
| **4 engines de animação no mesmo componente** | Conflito de RAF/scroll listeners, bundle inflado, jank. | Uma lib por trabalho (ver tabela §animação) |

---

## Stack Patterns by Variant

**Se "editorial sóbrio" se mantém (recomendado):**
- Framer Motion (reveals/UI) + GSAP/ScrollTrigger (1–2 sequências hero/galeria). anime.js e three.js: opcionais.
- Porque entrega o craft pedido com bundle controlado e manutenção barata.

**Se quiser um momento "hero cinematográfico" único:**
- Adicionar 1 cena three.js via `dynamic ssr:false`, grão/partículas monocromáticas, montada só no viewport.
- Porque isola o custo WebGL a um único componente lazy.

**Se o blog crescer para dezenas de artigos com taxonomia:**
- Reconsiderar **Velite** (após eventual migração Webpack) por type-safety e processamento de assets em escala.
- Porque a leitura FS própria fica verbosa com muitas coleções/relacionamentos.

**Se a newsletter virar central (sequências, segmentação):**
- Migrar captura para **Kit/Loops** mantendo a Server Action como fachada.

---

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `@gsap/react@2.1.2` | `gsap@3.15`, React 19, Next 16 App Router | Requer `"use client"`; usa useLayoutEffect isomórfico (SSR-safe). |
| `next-mdx-remote-client@2.1.11` | Next 16 App Router, React 19, RSC | Fork mantido focado em App Router; renderiza de string (não precisa rota física). |
| `resend@6.12.4` | Node runtime Route Handlers / Server Actions | Usar server-side; combina com `@react-email/components` para conteúdo. |
| `velite@0.3.1` | **NÃO** com Turbopack via WebpackPlugin | Incompatibilidade conhecida — motivo de não recomendar agora. `1.0.0-alpha.2` (mai/2026) ainda alpha. |
| `gsap@3.15` (instalado) | Inclui ScrollTrigger, SplitText, MorphSVG grátis | Desde abr/2025 todos os plugins são free (Webflow). |
| `three@0.184` + `@types/three@0.184` | React 19 via dynamic import | Só `ssr:false`. Versões de runtime e types já casadas no lockfile. |
| `schema-dts@1.1.x` | TypeScript 5 strict | Só tipos; zero runtime. |

---

## Sources

- npm registry (via `npm view`) — versões verificadas: `@gsap/react@2.1.2`, `animejs@4.4.1`, `three@0.184.0`, `velite@0.3.1` (stable) / `1.0.0-alpha.2` (mai/2026), `next-mdx-remote-client@2.1.11`, `resend@6.12.4`, `schema-dts@1.1.5`-class, `gray-matter@4.0.3`, `tailwind-merge@3.6.0`, `clsx@2.1.1`, `fumadocs-mdx@15.0.10` — HIGH
- https://gsap.com/resources/React/ — `useGSAP` como prescrição oficial para App Router/RSC, cleanup automático — HIGH
- https://webflow.com/blog/gsap-becomes-free — GSAP 100% grátis (incl. SplitText/ScrollTrigger) desde 30/abr/2025 — HIGH
- https://velite.js.org/guide/with-nextjs + GitHub zce/velite — incompatibilidade `VeliteWebpackPlugin` × Turbopack; uso recomendado via CLI/plugin — HIGH
- https://nextjs.org/docs/app/getting-started/metadata-and-og-images — Metadata API, `ImageResponse`, `opengraph-image.tsx` — HIGH
- https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots — `robots.ts`/`sitemap.ts` nativos — HIGH
- https://www.sequenzy.com/versus/resend-vs-loops + convertkit-vs-buttondown — comparativo de providers de newsletter (DX/preço/uso) — MEDIUM
- https://mikebifulco.com/posts/live-coding-resend-broadcasts-nextjs — Resend Broadcasts para newsletter em Next.js — MEDIUM
- `site/package.json` + `site/next.config.ts` (lidos) — libs de animação já instaladas + MDX/Turbopack configurados — HIGH

---
*Stack research for: site de marketing + blog SEO sobre Next.js 16 existente (Dino Team)*
*Researched: 2026-05-31*
