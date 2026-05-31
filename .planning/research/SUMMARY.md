# Project Research Summary

**Project:** Site Dino Team — build completo production-ready
**Domain:** Site de marketing high-ticket + blog SEO integrado a pipeline de conteúdo multi-agente (Next.js 16 App Router existente)
**Researched:** 2026-05-31
**Confidence:** HIGH

## Executive Summary

Este milestone leva um protótipo Next.js 16 existente (home 7 seções, design monocromático, animações base) a um build production-ready com três frentes simultâneas: redesign editorial foto-conduzido da landing, 3 novas seções de conversão (Planos, Comunidade, Depoimentos), e um blog SEO integrado ao pipeline de agentes da marca. O padrão de mercado para esse tipo de produto — site high-ticket de autoridade + blog de topo de funil — é exigente em dois eixos que se tensionam: SEO técnico irrepreensível (EEAT, structured data, Core Web Vitals) e animação editorial de alto craft sem comprometer a performance. A pesquisa conclui que a stack atual cobre 90% do necessário; o que falta de crítico é `@gsap/react` (ausente do package.json), `resend` + `gray-matter` + `schema-dts` + `zod` para o pipeline de blog e newsletter.

A abordagem recomendada é build-time SSG para todo o conteúdo do blog (MDX versionado em `site/content/blog/`, lido no build via `lib/blog.ts`), com pipeline de geração por agentes externo ao Next — a fronteira pipeline-site é o sistema de arquivos, sem CMS ao vivo. Para animação, o princípio é uma lib por trabalho: Framer Motion para o legado existente, GSAP+ScrollTrigger para scroll-driven, anime.js para microinterações isoladas, three.js apenas WebGL pontual com `dynamic ssr:false`. Sem esse mapa de responsabilidade, as quatro libs coexistem sem fronteira e o bundle da home ultrapassa 300KB de só motion, matando o LCP do blog que é o objetivo de tráfego.

Os três riscos de maior impacto são: (1) three.js, que sozinho pode adicionar 150KB+ no bundle global e quebrar o SSR se importado estaticamente — candidato firme a fase separada ou a ser cortado do MVP; (2) LGPD sem gate de consentimento runtime (o estado atual dos TrackingScripts é opt-in por env var, não por consentimento do usuário) — bloqueante de lançamento; (3) o token de cinza `#7f7f7f` que falha contraste WCAG AA sobre fundos claros (4.0:1 vs. mínimo 4.5:1) — risco sistêmico no blog/artigo que é texto longo sobre branco. O caminho crítico do projeto é: frontmatter schema -> reader de blog -> rotas MDX -> SEO técnico. Tudo o mais depende ou é paralelizável a esse eixo.

---

## Key Findings

### Stack — decisões travadas pela pesquisa

O site usa Next.js 16.2 / React 19 / Tailwind 4 / Turbopack — nenhuma dessas decisões está em renegociação. As quatro libs de animação (GSAP 3.15, anime.js 4.4, three.js 0.184, Framer Motion 12) já estão no `package.json`. O que a pesquisa acrescenta são as dependências que ainda faltam e as regras de coexistência.

**Dependências a adicionar:**

- `@gsap/react ^2.1.2` — hook `useGSAP()` obrigatório para GSAP no App Router; cleanup automático de timelines; **ausente do package.json hoje** (gap crítico identificado pela pesquisa)
- `resend ^6.12.4` — newsletter + transacional via Server Action server-side; single vendor para captura e broadcast; DX dev-first sem script de terceiro no `<head>`
- `next-mdx-remote-client ^2.1.11` — render de MDX a partir de string em RSC; escolhido sobre Velite porque o Velite WebpackPlugin não funciona com Turbopack (incompatibilidade documentada); escolhido sobre `@next/mdx` puro porque o blog é uma coleção dinâmica, não rotas físicas estáticas
- `gray-matter ^4.0.3` — parse de frontmatter YAML dos `.mdx`; zero-config, síncrono, roda em RSC/build
- `zod ^4` — validação do frontmatter no build; garante que artigos gerados por agente têm os campos SEO obrigatórios antes de ir ao ar; falha cedo em vez de renderizar artigo sem `description`/`date`
- `schema-dts ^1.1.5` — tipos TypeScript para JSON-LD; tipa `Organization`, `BlogPosting`, `FAQPage`, `BreadcrumbList`
- `clsx ^2.1.1` + `tailwind-merge ^3.6.0` — resolver conflito de classes no `cn()` (concern já mapeado no CONCERNS.md)

**SEO técnico: zero novas dependências** — `generateMetadata`, `generateStaticParams`, `sitemap.ts`, `robots.ts`, `opengraph-image.tsx` via `next/og` são todos built-in do Next 16 App Router.

**Mapa de responsabilidade por lib de animação (lei, não sugestão):**

| Lib | Papel único | Carregamento |
|-----|-------------|--------------|
| Framer Motion | Legado existente (`Reveal`, `AnimatedCounter`). Não expandir. | Já no bundle |
| GSAP + ScrollTrigger + `@gsap/react` | Scroll-driven: pin, parallax, SplitText, timelines editoriais | Dynamic por componente `"use client"` |
| anime.js | Microinterações pontuais (hover, stagger) onde Framer não cabe | Import nomeado v4; por componente |
| three.js | WebGL pontual, máx 1 cena | `next/dynamic({ ssr: false })` + IntersectionObserver; **forte candidato a corte do MVP** |

**Bundle budget:** first-load JS < 200KB na home, < 130KB em artigos de blog. Medido pelo `curador-web` no build report.

**three.js como maior risco/custo de stack:** +~150-600KB gzip se vazar para o shared chunk; quebra SSR se importado estaticamente; R3F v9 obrigatório (v8 incompatível com React 19); requer `transpilePackages` para add-ons. É o único item com spike recomendado antes de implementar. Se o estilo "editorial sóbrio" se mantiver (recomendado pelo PROJECT.md), Framer Motion + GSAP cobrem tudo sem three.js.

**O que não usar:** Velite com Turbopack, Contentlayer (não mantido), `useEffect` cru para GSAP, three.js no bundle inicial, `NEXT_PUBLIC_` para API keys de newsletter, `react-helmet`, plugins de sitemap de terceiro, 4 engines de animação no mesmo componente.

---

### Features — o que construir, o que não construir

**Must have (v1 — table stakes):**

- Seção Planos com preço visível + inclusos + CTA WhatsApp — transparência é norma high-ticket; decisão já tomada no PROJECT.md
- Seção Depoimentos nomeados com resultado específico (texto estruturado; visual quando acervo chegar) — depoimento nomeado converte ordens de magnitude acima de estrela anônima
- Seção Comunidade enquadrada como parte do método, não como perk — responde à dor "estou sozinho no processo"
- Blog: listagem + artigo MDX + frontmatter schema — fundação; tudo do blog depende deste bloco
- Blog: autor/credencial/TOC/tempo de leitura/categorias/relacionados + CTA fim-de-artigo sóbrio — table stakes EEAT 2026
- SEO técnico: sitemap + robots + generateMetadata/OG por artigo + Article/Breadcrumb JSON-LD
- Captura de e-mail inline pós-artigo + consentimento LGPD — sem popup; inline é a única via on-brand
- Páginas legais (privacidade, termos) + cookie consent gate — desbloqueia TrackingScripts; obrigação LGPD; bloqueante de lançamento
- WhatsApp real (env var) substituindo placeholder

**Should have (v1.x — add quando possível):**

- OG image dinâmica por artigo via `opengraph-image.tsx` (Anton + foto P&B) — começa com OG estático único
- Lead magnet contextual ("o guia de direção", não "assine a newsletter") — começa com captura simples
- Contador de membros da Comunidade — só quando número real e relevante

**Defer (v2+):**

- Skill repurpose `export/` -> MDX — feature mais cara do milestone; o blog lança com artigos MDX manuais + skill `novo-artigo`; pipeline de repurpose entra depois de validar o fluxo base
- Newsletter com cadência de conteúdo — fora deste milestone
- Busca no blog, filtro multi-tag avançado — só quando houver massa crítica de artigos

**Anti-features (não construir):** popup de captura, countdown de oferta/escassez falsa, cores saturadas em CTA, estrelas de avaliação agregadas, gamificação de comunidade, stock photo de academia, comparador de planos SaaS, chat widget, comentários no blog, auto-play de vídeo, CTA no meio do corpo do artigo.

**Frontmatter schema é a dependência-raiz do blog** — define-o antes de qualquer rota, skill ou sitemap:

```
title, slug (kebab-case sem acento), description (<= 160 chars), category,
author, publishedAt (ISO), updatedAt, cover, draft, sourceContent (opcional)
```

TOC, tempo de leitura, relacionados, sitemap, generateMetadata e JSON-LD Article todos dependem desse schema. Errar = retrabalho em cascata.

---

### Architecture — padrões centrais

O site já é Next.js 16 App Router com RSC como default, islands `"use client"` para interatividade, e `lib/` como camada terminal server-only. A arquitetura do blog segue e estende esse padrão sem introduzir novas convenções.

**Componentes principais a criar:**

1. `lib/blog.ts` — reader server-only de `site/content/blog/`; `fs` + `gray-matter` + Zod; espelha o padrão `safe()` de `lib/dashboard/readers.ts`; conteúdo bundled com o app (não lido do repo root como o dashboard, que é dev-only)
2. `app/blog/page.tsx` + `app/blog/[slug]/page.tsx` — RSC com `generateStaticParams` + `generateMetadata`; JSON-LD inline
3. `mdx-components.tsx` (raiz de `site/`) — mapeia h1/h2/p/img para componentes monocromáticos de marca; trava a tipografia para todos os artigos
4. `components/motion/` — islands `"use client"` de animação isoladas: `ScrollReveal` (GSAP), `MicroFx` (anime.js), `WebGLScene` (three.js, se mantido)
5. `app/providers.tsx` (AnimationProvider) — registra plugins GSAP 1x; gate global de `prefers-reduced-motion` via `gsap.matchMedia()`
6. `app/api/newsletter/route.ts` — Route Handler Node.js -> Resend Audiences; mesmo padrão dos handlers existentes
7. Skills `novo-artigo` e `repurpose-post` — orquestram agentes -> MDX versionado em `site/content/blog/`

**Fronteira crítica:** `site/content/blog/` precisa estar dentro de `site/` (bundled no build), não no repo root. O `lib/dashboard/readers.ts` usa `path.resolve(process.cwd(), "..")` que funciona apenas em dev — em Vercel serverless o repo não existe. O blog não pode replicar esse padrão.

**Fluxo de conteúdo:**
```
skill /novo-artigo -> site/content/blog/<slug>.mdx
skill /repurpose-post: export/conteudos/carrossel/<data>/ -> site/content/blog/<slug>.mdx
   (build-time)
lib/blog.ts: gray-matter + zod -> getAllPosts() / getPostBySlug()
   -> app/blog/page.tsx (listagem RSC) + app/blog/[slug]/page.tsx (artigo RSC + SSG)
```

---

### Critical Pitfalls

1. **Bundle bloat por 4 libs de animação sem fronteira de responsabilidade** — aplicar o mapa de responsabilidade única como lei na fase de fundação; budget first-load JS (home < 200KB, artigo < 130KB) como critério de aceite; GSAP e three.js via dynamic import por rota, nunca no layout global

2. **prefers-reduced-motion ignorado pelas libs JS** — gate em JS, não só CSS: GSAP via `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`, Framer via `useReducedMotion()`, anime.js via `window.matchMedia().matches` antes de instanciar, three.js não monta a cena se reduced-motion; centralizar em hook `usePrefersReducedMotion()`; verificar manualmente no DevTools

3. **three.js no RSC / bundle global** — sempre `next/dynamic({ ssr: false })` + IntersectionObserver; R3F v9 (não v8); confirmar no build report que `three` está em chunk de rota; poster estático como fallback; candidato a corte do MVP

4. **LGPD: tracking ativado por env var sem consentimento runtime** — `TrackingScripts` só renderiza os `<Script>` após cookie `consent=granted`; banner bloqueia de verdade (não cosmético); páginas legais devem existir antes do banner; bloqueante de lançamento

5. **Cinza `#7f7f7f` falha contraste AA sobre branco** — contraste 4.0:1 sobre branco (mínimo é 4.5:1); usar `#7f7f7f` apenas sobre fundos escuros; para texto secundário sobre branco usar >= `#767676` (mínimo AA) ou `#595959` (~7:1); definir token `text-muted-on-light` na fase de design system

**Adicionais de alto impacto:**

- Frontmatter sem validação Zod — artigo com campo faltando quebra o build inteiro do Next
- Velite + Turbopack — VeliteWebpackPlugin não funciona; não usar Velite até eventual migração para Webpack
- GSAP via `useEffect` cru — memory leak + animação em nós desmontados; sempre via `useGSAP()`
- `content/blog/` fora de `site/` — conteúdo não bundled, inexistente em Vercel serverless

---

## Implications for Roadmap

A ordem de fases é ditada pelas dependências reais identificadas na pesquisa. O caminho crítico é: design system -> MDX foundation -> blog routes -> SEO layer. Tudo o mais (animação avançada, newsletter, skills de conteúdo) é paralelizável ou post-crítico.

### Phase 1: Design System + Fundação de Animação

**Rationale:** Tokens de contraste errados se propagam em cascata para todas as superfícies novas. Os gates de reduced-motion precisam nascer antes de qualquer animação ser escrita — retrofitar custa mais do que definir na origem.

**Delivers:** Tokens de contraste corretos (incluindo `text-muted-on-light`), `cn()` com `tailwind-merge`, `mdx-components.tsx` de marca, `AnimationProvider` com gate de `prefers-reduced-motion`, `@gsap/react` instalado e validado, bundle budget definido e medido.

**Addresses:** Pitfall #6 (cinza sobre branco), Pitfall #1 (bundle bloat), Pitfall #2 (reduced-motion JS), concern `cn()` sem tailwind-merge.

**Research flag:** Padrões estabelecidos — skip research-phase.

---

### Phase 2: LGPD + Legal (pré-requisito de tracking)

**Rationale:** Bloqueante de lançamento independente de qualquer outra fase. No momento que o usuário preencher os IDs reais de GA4/Pixel/Clarity, o site passa a coletar dados sem consentimento. Resolver antes de avançar para features de conversão.

**Delivers:** Cookie consent gate bloqueante, páginas de Privacidade e Termos (MDX estático), `TrackingScripts` condicionado a `consent=granted`, opção de revogar.

**Addresses:** Pitfall #4 (LGPD sem consentimento runtime), concern páginas legais ausentes.

**Research flag:** Padrões estabelecidos — skip research-phase.

---

### Phase 3: Redesign Editorial + Novas Seções de Conversão

**Rationale:** Com design system e tokens corretos (Phase 1), o redesign aplica-os sem risco de retrabalho de contraste. As 3 novas seções dependem de conteúdo real do usuário — planejar placeholder monocromático intencional.

**Delivers:** Seções existentes redesenhadas com fotos reais P&B, Seção Planos (preço visível + inclusos + CTA), Seção Comunidade (método, não perk), Seção Depoimentos (estruturados, nomeados), WhatsApp real.

**Addresses:** Redesign foto-conduzido, anti-features mapeados (popup, countdown, badges coloridos).

**Research flag:** Padrões estabelecidos para landing high-ticket — skip research-phase.

---

### Phase 4: Blog MDX — Fundação + SEO Técnico

**Rationale:** Maior densidade de dependências do projeto. O frontmatter schema é a dependência-raiz: sem ele não há listagem, sitemap, generateMetadata, JSON-LD nem skills. SEO técnico construído junto com as rotas — não depois. `metadataBase` via `NEXT_PUBLIC_SITE_URL` é pré-requisito para canonical/OG apontarem para o domínio correto (hoje hardcoded para `dinoteam.vercel.app`).

**Delivers:** `lib/blog.ts` (reader server-only + Zod), `app/blog/page.tsx` + `app/blog/[slug]/page.tsx`, `app/sitemap.ts` + `app/robots.ts` dinâmicos, `generateMetadata` por artigo, JSON-LD `Article` + `BreadcrumbList`, `opengraph-image.tsx` por artigo, 1-2 artigos seed para validar pipeline.

**Uses:** `next-mdx-remote-client`, `gray-matter`, `zod`, `schema-dts`, `next/og` (built-in), `generateStaticParams` (built-in).

**Addresses:** TOC, tempo de leitura, categorias, relacionados, autor/credencial, CTA fim-de-artigo sóbrio, Pitfall #5 (SEO autossabotado), Pitfall #7 (MDX App Router), concern `og:image` ausente, concern `metadataBase` placeholder.

**Research flag:** Smoke test de `next-mdx-remote-client` + Turbopack recomendado no início da fase (fork recente; risco baixo mas real). Não é research-phase completo.

---

### Phase 5: Newsletter (Captura de E-mail)

**Rationale:** Independente do blog, mas se beneficia das rotas para o formulário inline pós-artigo. Pode ser paralelizado com Phase 4 ou vir logo depois.

**Delivers:** `app/api/newsletter/route.ts` (Route Handler -> Resend Audiences), `NewsletterForm` (island client), checkbox de consentimento LGPD, estado de sucesso/erro acessível, double opt-in.

**Uses:** `resend ^6.12.4`, padrão idêntico aos Route Handlers existentes.

**Research flag:** Padrões estabelecidos — skip research-phase.

---

### Phase 6: Skill de Geração de Artigo (`novo-artigo`)

**Rationale:** Depende da Phase 4 — o frontmatter schema é o contrato de saída da skill. Com as rotas funcionando e o frontmatter validado em Zod, a skill pode ser escrita com contrato rígido e testada contra o build real.

**Delivers:** Skill `novo-artigo` (pesquisador-mercado -> briefing-writer -> copywriter -> revisor-conteudo -> revisor-brand -> MDX em `site/content/blog/`), gate de lint+build na skill, slug normalizado sem colisão.

**Addresses:** Pitfall #8 (skill MDX quebra build), pipeline de geração de autoridade.

**Research flag:** Padrões de skills já estabelecidos no repo — skip research-phase.

---

### Phase 7: Repurpose `export/` -> MDX (v1.x — diferido)

**Rationale:** Feature de maior custo de implementação. O blog lança com artigos da skill `novo-artigo` e artigos seed. O repurpose entra após validar o pipeline base.

**Delivers:** Skill `repurpose-post` (lê `export/conteudos/carrossel/<data>/copy.md` -> copywriter expande -> revisor-brand -> MDX com `sourceContent`).

**Research flag:** Sem dependência técnica nova — skip research-phase.

---

### Phase 8: three.js / WebGL (stretch — avaliar no início)

**Rationale:** Maior item de risco e custo técnico individual. Se o estilo "editorial sóbrio" se provar suficiente com Framer + GSAP (o que a pesquisa sugere), esta fase pode ser cancelada. Tratar como stretch goal explícito desde o início.

**Delivers:** Uma cena WebGL (hero com grão/partículas monocromáticas), R3F v9 configurado, poster estático como fallback, render loop pausado fora do viewport.

**Addresses:** Constraint three.js pontual do PROJECT.md; diferenciação visual de hero.

**Avoids:** three.js no shared chunk, hydration mismatch, frame drops no mobile.

**Research flag:** REQUER spike dedicado (research-phase) — R3F v9 + Next 16 + React 19 tem janela recente de compatibilidade; confirmar na prática antes de planejar a fase.

---

### Phase Ordering Rationale

- Design system primeiro: tokens de contraste errados se propagam em cascata; gates de reduced-motion precisam existir antes de qualquer animação.
- LGPD segundo: bloqueante de lançamento independente; risco aumenta a cada fase que configura IDs reais de tracking sem o gate.
- Landing antes do blog: landing é o núcleo de conversão; blog é topo de funil. A conversão WhatsApp precisa funcionar antes que o tráfego orgânico seja relevante.
- Blog MDX + SEO juntos em uma fase: SEO depende das rotas existirem; construir as rotas sem o SEO e remediar depois custa mais.
- Skills depois da fundação MDX: o frontmatter schema (Phase 4) é o contrato de saída das skills; skill escrita antes do schema garante conflito.
- three.js como stretch: único item com spike recomendado e único cujo corte não viola nenhuma feature de conversão ou SEO.

### Research Flags

Fases que precisam de pesquisa dedicada durante o planejamento:
- **Phase 8 (three.js/WebGL):** spike obrigatório — R3F v9 + Next 16 + React 19 é janela recente; confirmar compatibilidade e padrão de chunk antes de planejar

Fases com padrões estabelecidos (skip research-phase):
- **Phase 1 (Design System):** tokens CSS/Tailwind v4 e prefers-reduced-motion são padrões maduros
- **Phase 2 (LGPD):** padrão de cookie consent com Next.js Route Handler é bem documentado
- **Phase 3 (Redesign/Novas Seções):** landing high-ticket monocromático — padrões mapeados em FEATURES.md
- **Phase 4 (Blog MDX):** smoke test de `next-mdx-remote-client` no início da fase, não research-phase completo
- **Phase 5 (Newsletter):** Resend + Server Action é padrão documentado
- **Phase 6 (Skill `novo-artigo`):** padrões de skill já no repo
- **Phase 7 (Repurpose):** sem dependência técnica nova

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Versões verificadas via npm registry; incompatibilidade Velite x Turbopack documentada; `@gsap/react` ausente confirmado via leitura do package.json real |
| Features | HIGH | Constraints de marca lidos direto de PROJECT.md + tom-de-voz.md + home-briefing.md; padrões de mercado high-ticket verificados em múltiplas fontes |
| Architecture | HIGH | Estrutura do site lida diretamente do código; padrões Next 16 App Router verificados em docs oficiais; fronteira blog vs. dashboard (dev-only vs. bundled) confirmada pelo código existente |
| Pitfalls | HIGH | Contraste WCAG calculado numericamente; `gsap.matchMedia()` verificado em docs GSAP; R3F v9/React 19 verificado em docs R3F; LGPD por conhecimento de lei |

**Overall confidence:** HIGH

### Gaps a Resolver Durante a Implementação

- **Acervo real do Ramon (fotos P&B):** bloqueante para Depoimentos visuais e redesign foto-conduzido. Planejar placeholder monocromático intencional na Phase 3; solicitar ao usuário no início da fase.
- **Conteúdo real das novas seções** (preços dos Planos, textos de Depoimentos, dados da Comunidade): entregues pelo usuário no chat sob demanda. Estrutura pode ser construída com placeholder e populada depois.
- **Compatibilidade `next-mdx-remote-client` + Turbopack:** confirmar com smoke test no início da Phase 4 (fork recente; risco baixo mas real).
- **R3F v9 + Next 16 + React 19:** confirmar com spike na Phase 8. Não assumir compatibilidade.
- **Número real de membros da Comunidade:** necessário antes de construir o contador; omitir se o número for fraco.
- **`NEXT_PUBLIC_SITE_URL` e `NEXT_PUBLIC_WHATSAPP_URL`:** definir antes de qualquer OG/canonical/CTA funcionar. Solicitar ao usuário na Phase 3 ou Phase 4.

---

## Sources

### Primary (HIGH confidence)

- `site/package.json` + `site/next.config.ts` — estado real das dependências; `@gsap/react` ausente confirmado
- `.planning/codebase/CONCERNS.md` + `ARCHITECTURE.md` + `STRUCTURE.md` — estado atual do codebase
- `brand/tom-de-voz.md`, `brand/brand-book.md`, `.planning/PROJECT.md` — constraints de marca e escopo
- https://gsap.com/resources/React/ — `useGSAP` como prescrição oficial para App Router/RSC
- https://nextjs.org/docs/app/getting-started/metadata-and-og-images — Metadata API, `ImageResponse`, `opengraph-image.tsx`
- https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots — `robots.ts`/`sitemap.ts` nativos
- https://r3f.docs.pmnd.rs/getting-started/installation — R3F v9, React 19/Next, `transpilePackages`
- WCAG 2.1 — cálculo de contraste de `#7f7f7f` sobre branco (4.0:1) e preto (5.24:1)
- https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/ — reduced-motion gate em JS para GSAP

### Secondary (MEDIUM confidence)

- https://velite.js.org/guide/with-nextjs + GitHub zce/velite — incompatibilidade Velite x Turbopack
- https://webflow.com/blog/gsap-becomes-free — GSAP 100% grátis desde abr/2025 (todos os plugins)
- https://resend.com/nextjs — ESP dev-first para Server Actions/Route Handlers
- https://www.smashingmagazine.com/2021/10/respecting-users-motion-preferences/ — reduced-motion em libs JS
- https://rebeccavandenberg.com/what-does-an-ideal-blog-post-look-like-in-2026-seo-ai-guide/ — TOC/autor/estrutura como table stakes EEAT 2026
- https://rankai.ai/blog/your-complete-guide-to-author-schema-and-its-seo-impact — Person schema e EEAT
- npm registry (via `npm view`) — versões verificadas de todas as dependências novas

---
*Research completed: 2026-05-31*
*Ready for roadmap: yes*
