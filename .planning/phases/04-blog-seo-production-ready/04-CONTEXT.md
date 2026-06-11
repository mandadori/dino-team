# Phase 4: Blog SEO Production-Ready - Context

**Gathered:** 2026-06-11
**Status:** Ready for planning

<domain>
## Phase Boundary

O blog de topo de funil entra no ar: listagem `/blog`, páginas de categoria `/blog/categoria/[slug]` e artigo `/blog/[slug]` renderizando MDX (SSG, conteúdo em `site/content/blog/`), com EEAT completo (bloco de autor nomeado + credencial, tempo de leitura, TOC, 2–3 relacionados, share nativo, CTA sóbrio no fim) e SEO técnico construído junto com as rotas (metadataBase via env, `generateMetadata` por página/artigo, `sitemap.ts`, `robots.ts`, JSON-LD tipado, `og:image` único). Frontmatter validado por zod que **falha o build** se inválido.

Entrega = BLOG-01..10 + SEO-01..06 (16 requisitos). Ver `.planning/REQUIREMENTS.md` §Blog e §SEO Técnico.

**Fora de escopo (outras fases / v2):** captura de e-mail pós-artigo (Phase 5 — LEAD-01/02), skill `novo-artigo` geradora de MDX (Phase 6 — BLOG-11), repurpose `export/`→MDX (v2 — PIPE-01), og:image dinâmico por artigo (v2 — BLOG-12), busca no blog (v2 — BLOG-13), comentários/fórum (Out of Scope, marca).
</domain>

<decisions>
## Implementation Decisions

### Categorias & taxonomia (BLOG-06)
- **D-01:** Taxonomia **própria orientada a SEO**, NÃO os pilares internos da marca. Conjunto fixo de **4 categorias: Treino · Nutrição · Mentalidade · Bastidores**. Escolhidas por intenção de busca de topo de funil, não por função no funil.
- **D-02:** **1 categoria por artigo** (campo `category` singular no frontmatter, alinhado a BLOG-01). O valor é uma das 4 categorias (slug: `treino`, `nutricao`, `mentalidade`, `bastidores`).
- **D-03:** O mapeamento categoria→pilar da marca (pra quando a skill da Fase 6 gerar artigos por pilar) NÃO é construído agora — é problema da Phase 6.

### Autoria & EEAT (BLOG-04, SEO-05)
- **D-04:** **Autor variável por artigo** — campo `author` no frontmatter referencia uma chave de um **registro de autores em `lib/site.ts`** (nome + credencial + foto + bio curta opcional). Ramon como autoridade/revisor da marca, mas não autor único.
- **D-05:** Registro semeado no lançamento com **2 autores reais**:
  - `ramon-dino` → **Ramon Dino**, credencial "primeiro brasileiro campeão do Mr. Olympia (Classic Physique)". Foto: **placeholder monocromático** até o acervo P&B do Ramon chegar (mesmo bloqueio da Phase 1 — `site/public/ramon/` só tem README).
  - `mauri-rosolen` → **Mauri Rosolen**, credencial "Treinador". Foto: **`site/public/autores/mauri-rosolen.webp`** (já preservada no repo a partir do arquivo entregue pelo usuário).
- **D-06:** Bloco de autor por artigo = foto (P&B) + nome + credencial. JSON-LD **Person por autor** + **Organization "Dino Team"** (SEO-05).

### Listagem & layout (BLOG-02, BLOG-06)
- **D-07:** Listagem `/blog` no padrão **destaque + grid**: 1 artigo em destaque grande no topo (cover P&B) + grid dos demais abaixo. Exige uma flag **`featured`** no frontmatter (boolean) — o executor decide o fallback quando nenhum/múltiplos forem `featured` (ex.: mais recente).
- **D-08:** Filtro por categoria = **rotas dedicadas** `/blog/categoria/[slug]` (uma por categoria) + `/blog` geral. 5 páginas indexáveis, cada categoria rankeia. Cada rota de categoria tem `generateMetadata` próprio, entra no `sitemap.ts` e emite JSON-LD Breadcrumb. (Escolhido sobre pills client-side justamente pelo ganho de SEO de topo de funil.)

### Conteúdo de lançamento (BLOG-03)
- **D-09:** O executor **escreve 4–6 artigos-exemplo curtos** no tom da marca, cobrindo as 4 categorias, pra popular a listagem e exercitar featured/grid/relacionados-por-categoria. Marcados como exemplo (ex.: frontmatter ou nota) — o usuário substitui depois (Fase 6 ou manual). `site/content/blog/` está vazio hoje; `export/conteudos/blog/` também.
- **D-10:** Os stubs devem respeitar `brand/tom-de-voz.md` e os off-limits dos pilares (sem promessa de prazo/resultado, sem "atalho/fórmula", sem motivação vazia). Passam pelo gate de revisão da fase como qualquer copy.

### CTA do fim do artigo (BLOG-10)
- **D-11:** CTA **único e uniforme: WhatsApp consultoria** (`NEXT_PUBLIC_WHATSAPP_URL`), inline no FIM do artigo (não mid-content), sóbrio, com sign-off on-brand. Consistente com o core value (lead via WhatsApp). NÃO varia por categoria.

### SEO — URL base (SEO-01)
- **D-12:** `NEXT_PUBLIC_SITE_URL` = **`https://dinoteam.vercel.app`** por ora, mas movido do hardcode atual (`site/app/layout.tsx:27` `metadataBase`) para **env var com fallback**. O usuário troca pelo domínio real ao publicar, sem refatorar código. Todo canonical/OG/sitemap/JSON-LD deriva dessa env.

### Claude's Discretion
- **Abordagem de render MDX** — `content/blog/*.mdx` → rota `[slug]`. `@next/mdx` (file-based, `createMDX`) já está instalado, mas file-based mapeia `.mdx` para rotas diretamente, não casa com o padrão `content/` + `[slug]` dinâmico. O **pesquisador resolve** a content-layer (ex.: `next-mdx-remote`/RSC, ou compilar via `@next/mdx` `import()`, ou Velite/Content-Collections). **Risco a validar no início da fase (smoke test):** compatibilidade da lib escolhida com **Turbopack** (sinalizado no STATE.md — `next-mdx-remote-client` foi o candidato cogitado).
- **Frontmatter schema (BLOG-01)** — campos mínimos do contrato: `title, slug, date, author, category, description, cover` + o derivado desta discussão: **`featured` (boolean)**. Validação com **zod** (lib a adicionar). Parser de frontmatter (`gray-matter` ou equivalente) à escolha do executor.
- **Mecânica do TOC (BLOG-07)** — sticky no desktop, colapsável no mobile; a partir de quantos headings e profundidade (h2/h3) à discrição do executor, respeitando `prefers-reduced-motion`.
- **Lógica de relacionados (BLOG-08)** — 2–3 por mesma categoria; critério de desempate (recência) à discrição do executor.
- **Tempo de leitura (BLOG-05)** — cálculo do corpo (lib `reading-time` ou contagem própria) à discrição.
- **Share nativo (BLOG-09)** — copiar link + Web Share API / share intents, sem widget de terceiro.
- **Design do `og:image` único (SEO-06)** — monocromático, Anton + P&B, estático único no v1. Layout/conteúdo exato à discrição do executor dentro das travas de marca (Ramon na imagem só quando houver foto real).
- **Libs SEO** — `schema-dts` (JSON-LD tipado, SEO-05) a adicionar; `generateMetadata`/`sitemap.ts`/`robots.ts` são APIs nativas do Next 16.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requisitos & rastreabilidade desta fase
- `.planning/REQUIREMENTS.md` §Blog (BLOG-01..10) e §"SEO Técnico" (SEO-01..06) — contrato de aceite
- `.planning/ROADMAP.md` §"Phase 4: Blog SEO Production-Ready" — goal + success criteria

### Marca (identidade, tom, taxonomia)
- `brand/brand-book.md` — essência, o que a marca não é; ancora copy dos stubs e do CTA
- `brand/tom-de-voz.md` — sobriedade, anti-espetáculo, registros R1–R3; obrigatório pros artigos-exemplo e CTA
- `brand/pilares-conteudo.md` — pilares (Mentalidade/Método/Prova viva/Transformação) e off-limits; informa o conteúdo dos stubs e o mapeamento futuro categoria→pilar (Fase 6)
- `brand/referencias-visuais.md` — paleta P&B, Anton/Montserrat; base do layout do blog e do og:image
- `brand/publico-alvo.md` — homem 18–40 que treina mas não evolui; orienta ângulo/SEO dos artigos
- `memory/ramon/contexto.md` — credencial e fatos do Ramon (autor + JSON-LD Person)

### Código existente (leitura obrigatória antes de implementar)
- `site/app/layout.tsx` — `metadataBase` hardcoded (`:27`) a migrar pra `NEXT_PUBLIC_SITE_URL`; header fixo + onde metadata raiz vive
- `site/app/page.tsx` — footer existente (links legais da Phase 3); padrão de seção/RSC; onde linkar `/blog` se aplicável
- `site/lib/site.ts` — padrão de constantes (`WHATSAPP_URL`, `STATS`); lar do registro de autores + categorias
- `site/next.config.ts` — `@next/mdx` (`createMDX`) já configurado, `pageExtensions` inclui md/mdx, Turbopack `root` fixado
- `site/app/globals.css` — tokens (`bg-bg`, `bg-surface`, `text-fg`, `text-muted`, `border-line`), `@theme` Tailwind v4
- `site/components/ui/CTAButton.tsx` — reusar no CTA do fim do artigo
- `site/components/Reveal.tsx` — animação scroll-reveal (gate reduced-motion já estabelecido na Phase 1)
- `site/public/autores/mauri-rosolen.webp` — foto do autor Mauri (preservada nesta sessão)

### Mapas do código
- `.planning/codebase/STACK.md` — estado MDX (libs instaladas: `@next/mdx`, `@mdx-js/*`; faltam zod/schema-dts/reading-time/parser)
- `.planning/codebase/STRUCTURE.md` — onde criar rotas (`app/blog/`, `app/blog/[slug]/`, `app/blog/categoria/[slug]/`), componentes, `content/`
- `.planning/codebase/CONVENTIONS.md` — RSC vs client island, tokens, nomenclatura, `cn()`
- `.planning/codebase/CONCERNS.md` — pendências de lançamento (fotos reais, og:image), `cn()` sem tailwind-merge, zero testes
- `.planning/phases/03-conformidade-legal-lgpd/03-CONTEXT.md` — padrão de páginas novas (rota = pasta + page.tsx), placeholders bracketed, editorial herdado
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `site/components/ui/CTAButton.tsx` — CTA primário/outline; usar no CTA WhatsApp do fim do artigo (D-11).
- `site/lib/site.ts` — padrão de constantes centralizadas; abrigar registro de **autores** (D-04/05), lista de **categorias** (D-01) e possivelmente metadados do blog.
- `site/components/Reveal.tsx` + hook reduced-motion (Phase 1) — reuso pra animações de entrada da listagem/artigo, com gate de reduced-motion já resolvido.
- Tokens monocromáticos em `globals.css` — todo o blog se mantém em `bg-bg`/`text-fg`/`text-muted`/`border-line`, sem hex.
- Header fixo + footer da landing (Phase 3) — o blog herda o mesmo shell visual.

### Established Patterns
- **RSC por padrão; client island só quando há estado.** Listagem, artigo, categoria e SEO são RSC/SSG. Client islands mínimos só onde precisa interação (ex.: botão de share, TOC com scroll-spy).
- **Rotas = pasta + `page.tsx`** em `app/` (ver `app/privacidade`, `app/termos`). Novas: `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `app/blog/categoria/[slug]/page.tsx`.
- **Constantes em `lib/site.ts`** (não hardcode espalhado).
- **SEO nativo do Next 16:** `generateMetadata`, `app/sitemap.ts`, `app/robots.ts`, `metadataBase` no layout — preferir as APIs nativas a libs externas (exceto `schema-dts` pra tipar JSON-LD).

### Integration Points
- `site/app/layout.tsx`: `metadataBase` passa a ler `process.env.NEXT_PUBLIC_SITE_URL` com fallback `https://dinoteam.vercel.app` (D-12); `.env.example` ganha a var.
- `site/content/blog/` (novo diretório): fonte dos MDX; o loader/content-layer lê daqui no build (SSG).
- `site/public/autores/`: fotos de autor (Mauri já lá; Ramon entra quando acervo chegar).
- `app/sitemap.ts` + `app/robots.ts` (novos): mapeiam rotas estáticas + artigos + categorias derivando de `NEXT_PUBLIC_SITE_URL`.
- `lib/site.ts`: `WHATSAPP_URL` já existe — o CTA do artigo reusa.

### Pendências/Riscos herdados
- **Foto P&B do Ramon** segue bloqueante (placeholder intencional no bloco de autor até o acervo chegar).
- **Credencial do Mauri** ("Treinador") é enxuta pra EEAT — pode ser enriquecida quando o usuário fornecer.
- **Content-layer MDX × Turbopack** — smoke test no início da fase (ver Claude's Discretion).
- **Zero testes** no `site/` hoje; `cn()` sem tailwind-merge (CONCERNS.md).
</code_context>

<specifics>
## Specific Ideas

- Listagem com **1 destaque grande no topo + grid** (cover P&B full-width no destaque).
- Categorias como **rotas próprias indexáveis** (não pills) — decisão explícita de SEO.
- Autor **Mauri Rosolen** entregue pelo usuário com foto; **Ramon Dino** com credencial Mr. Olympia e foto placeholder.
- CTA do fim **só WhatsApp**, sign-off on-brand, uniforme.
- og:image único, **Anton + P&B** — sem foto do Ramon enquanto não houver acervo.
- Stubs de exemplo cobrindo **as 4 categorias** pra dar massa a relacionados-por-categoria.
</specifics>

<deferred>
## Deferred Ideas

- **CTA variável por categoria (lógica de funil)** — considerado (Mentalidade/Bastidores = CTA leve; Treino/Nutrição = consultoria), descartado no v1 em favor de CTA uniforme WhatsApp (D-11). Pode ser revisitado quando houver volume de artigos.
- **Taxonomia "Resultados" como 5ª categoria** — considerada, cortada pra manter 4 categorias enxutas; prova de aluno entra dentro de Bastidores/Transformação no conteúdo.
- **Mapeamento categoria→pilar** — pertence à Phase 6 (skill `novo-artigo`), não à Phase 4.
- **Captura de e-mail pós-artigo** — Phase 5 (LEAD-01/02).
- **og:image dinâmico por artigo** — v2 (BLOG-12); v1 é estático único.
- **Busca no blog** — v2 (BLOG-13), quando houver massa crítica.
- **Domínio de produção real** — usuário troca `NEXT_PUBLIC_SITE_URL` ao publicar; deploy fora de escopo do milestone.

### Reviewed Todos (not folded)
Nenhum — `todo.match-phase 4` retornou 0 matches.
</deferred>

---

*Phase: 4-blog-seo-production-ready*
*Context gathered: 2026-06-11*
