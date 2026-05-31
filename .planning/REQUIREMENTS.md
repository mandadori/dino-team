# Requirements: Site Dino Team

**Defined:** 2026-05-31
**Core Value:** O site converte o público certo em lead qualificado de consultoria via WhatsApp, carregado pela credibilidade do método de um campeão mundial — e o blog sustenta autoridade/tráfego orgânico no topo do funil.

## v1 Requirements

Requisitos deste milestone. Cada um mapeia para fases do roadmap.

### Design System & Fundação de Animação

- [ ] **DSGN-01**: Tokens de cor garantem contraste WCAG AA em ambos os fundos (cinza de texto ≥4.5:1 sobre branco; cinza atual mantido sobre preto)
- [ ] **DSGN-02**: Mapa de responsabilidade única por lib de animação (GSAP=scroll · anime.js=microinterações · Framer Motion=UI/legado · three.js=WebGL pontual) + bundle budget definido como critério de aceite
- [ ] **DSGN-03**: Hook `usePrefersReducedMotion` + gates JS por lib (GSAP `matchMedia`, Framer `useReducedMotion`, anime/three via `matchMedia`)
- [ ] **DSGN-04**: `@gsap/react` adicionado; `useGSAP()` é o padrão de uso do GSAP (nunca `useEffect` cru)
- [ ] **DSGN-05**: Componentes de motion isolados como client islands em `components/motion/` (`"use client"` nunca sobe pra seção/página)

### Redesign Editorial

- [ ] **RDSN-01**: As 7 seções existentes redesenhadas no padrão editorial sóbrio (backbone `frontend-design`), mantendo monocromático estrito
- [ ] **RDSN-02**: Fotos reais P&B do Ramon integradas (Hero, SobreRamon) substituindo os placeholders de gradiente

### Seções de Conversão (novas)

- [ ] **CONV-01**: Seção Planos com preço visível na página, inclusos por plano e CTA WhatsApp por plano (cards sóbrios, sem badge "popular")
- [ ] **CONV-02**: Seção Depoimentos nomeados (estrutura contexto→mudança→resultado), foto P&B quando o acervo chegar; sem nome real não publica
- [ ] **CONV-03**: Seção Comunidade enquadrada como parte do método ("não estar sozinho no processo"), sem gamificação

### Blog

- [ ] **BLOG-01**: Frontmatter schema validado (zod) — title, slug, date, author, category, description, cover — como contrato-raiz
- [ ] **BLOG-02**: Listagem de artigos em `/blog`
- [ ] **BLOG-03**: Página de artigo `/blog/[slug]` renderizando MDX (build-time SSG, conteúdo em `site/content/blog/`)
- [ ] **BLOG-04**: Bloco de autor nomeado + credencial em cada artigo
- [ ] **BLOG-05**: Tempo de leitura calculado do corpo do artigo
- [ ] **BLOG-06**: Categorias/pilares + filtro por categoria
- [ ] **BLOG-07**: Índice (TOC) gerado dos headings em posts longos (sticky desktop, colapsável mobile)
- [ ] **BLOG-08**: Posts relacionados por categoria (2–3 no fim do artigo)
- [ ] **BLOG-09**: Compartilhamento nativo (copiar link + share intents, sem widget de terceiro)
- [ ] **BLOG-10**: CTA inline sóbrio no fim do artigo (não mid-content), com sign-off on-brand
- [ ] **BLOG-11**: Skill `novo-artigo` — agentes (pesquisa/copy/revisão) produzem MDX versionado no contrato do schema BLOG-01

### SEO Técnico

- [ ] **SEO-01**: `metadataBase` / site URL via env (`NEXT_PUBLIC_SITE_URL`) — pré-requisito de OG/canonical/sitemap
- [ ] **SEO-02**: `generateMetadata` por página e por artigo (title/description/canonical/OG)
- [ ] **SEO-03**: `sitemap.ts` mapeando rotas estáticas + artigos do blog
- [ ] **SEO-04**: `robots.ts`
- [ ] **SEO-05**: Structured data JSON-LD (Article, Breadcrumb, Person, Organization) tipado com `schema-dts`
- [ ] **SEO-06**: `opengraph-image` monocromático on-brand (Anton + P&B), estático único no v1

### Captura de Lead

- [ ] **LEAD-01**: Form de e-mail inline (Server Action → Resend) com checkbox de consentimento LGPD, estilo monocromático
- [ ] **LEAD-02**: Estado de sucesso/erro acessível (client island mínimo, WCAG AA)

### Legal / LGPD

- [ ] **LEGAL-01**: Página de Política de Privacidade
- [ ] **LEGAL-02**: Página de Termos de Uso
- [ ] **LEGAL-03**: Banner de cookie consent que condiciona o disparo de `TrackingScripts` (GA4/Meta/Clarity)

### Configuração de Conversão

- [ ] **CONF-01**: WhatsApp real substituindo o placeholder `wa.me/0000000000` (via `NEXT_PUBLIC_WHATSAPP_URL`)

## v2 Requirements

Reconhecidos, fora deste milestone.

### Pipeline & Conteúdo
- **PIPE-01**: Skill de repurpose `export/` → MDX (adaptador carrossel→artigo) — feature mais cara; blog lança com `novo-artigo` + MDX manual antes
- **BLOG-12**: OG image dinâmico gerado por artigo (começa estático único)
- **LEAD-03**: Lead magnet contextual ("guia de direção") em vez de captura genérica
- **CONV-04**: Contador de membros da comunidade (só com número real e relevante)

### Experiência
- **DSGN-06**: Momento WebGL com three.js / R3F v9 — **stretch, spike-gated**: exige `dynamic ssr:false` + chunk por rota; candidato a corte por custo/perf mobile
- **BLOG-13**: Busca no blog (quando houver massa crítica de artigos)
- **NEWS-01**: Newsletter com cadência de conteúdo (exige estratégia editorial de e-mail no tom sóbrio)

## Out of Scope

Excluído explicitamente, com motivo.

| Feature | Reason |
|---------|--------|
| Deploy em produção / domínio | Usuário publica por conta própria |
| Dashboard admin / orquestração de skills | Stub não-funcional; esforço separado |
| Pop-up de captura / exit-intent / timer | Viola tom sereno e anti-espetáculo da marca |
| Cor de destaque / badge "popular" / CTA colorido | Lei de marca: monocromático estrito |
| Estrelas / score agregado de avaliação | Anônimo converte menos; vira "popular", contra "marca de elite" |
| Comentários / fórum no blog | Moderação cara, ruído, risco de tom fora de marca |
| Chat widget / chatbot de captura | Injeta UI/cor/script de terceiro; WhatsApp já é o canal |
| Promessa de prazo/resultado, escassez falsa | Tabu de marca explícito |

## Traceability

Preenchido na criação do roadmap.

| Requirement | Phase | Status |
|-------------|-------|--------|
| (a mapear pelo roadmapper) | — | Pending |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 0 (pendente roadmap)
- Unmapped: 30 ⚠️

---
*Requirements defined: 2026-05-31*
*Last updated: 2026-05-31 after initial definition*
