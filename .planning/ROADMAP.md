# Roadmap: Site Dino Team

## Overview

Este milestone leva o protótipo Next.js existente (home de 7 seções, design monocromático, animações base) a um build production-ready, fatiado em slices verticais que deixam o site usável e shippável feature a feature. Começamos pela landing — núcleo de conversão — elevando-a a um editorial sóbrio foto-conduzido com a fundação de design/animação correta embutida (tokens de contraste AA, gates de reduced-motion, mapa de libs). Em seguida tornamos a conversão real e completa (Planos, Comunidade, Depoimentos, WhatsApp real) e legalmente apta (LGPD/cookie gate + páginas legais). Depois construímos o blog SEO de topo de funil — fundação MDX + rotas + SEO técnico numa fatia coerente — seguido da captura de e-mail pós-artigo e, por fim, da skill que gera artigos pelo pipeline de agentes da marca. Ao final do roadmap a landing converte, o tracking é consentido, o blog rankeia e o conteúdo se auto-alimenta.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Landing Editorial + Fundação** - Landing redesenhada com fotos reais do Ramon sobre tokens de contraste AA e gates de animação corretos (completed 2026-06-01)
- [x] **Phase 2: Conversão Completa** - Planos com preço, Comunidade, Depoimentos e WhatsApp real fecham o funil de lead (completed 2026-06-01)
- [ ] **Phase 3: Conformidade Legal & LGPD** - Páginas legais + cookie consent que de fato gateia os scripts de tracking
- [ ] **Phase 4: Blog SEO Production-Ready** - Listagem + artigo MDX com EEAT completo e SEO técnico (sitemap, OG, JSON-LD)
- [ ] **Phase 5: Captura de E-mail** - Form inline pós-artigo via Resend com consentimento e estados acessíveis
- [ ] **Phase 6: Pipeline de Artigos** - Skill `novo-artigo` que produz MDX versionado no contrato do schema

## Phase Details

### Phase 1: Landing Editorial + Fundação
**Goal**: A landing existente vira um editorial sóbrio foto-conduzido — fotos reais P&B do Ramon, contraste correto, animação contida — assentado sobre uma fundação de design/animação que não precisará ser retrofitada.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: DSGN-01, DSGN-02, DSGN-03, DSGN-04, DSGN-05, RDSN-01, RDSN-02
**Success Criteria** (what must be TRUE):
  1. Um visitante vê as 7 seções da home redesenhadas no padrão editorial sóbrio, monocromático estrito, com fotos reais P&B do Ramon no Hero e no SobreRamon (não mais placeholders de gradiente)
  2. Texto secundário sobre fundo branco é legível e passa contraste WCAG AA (cinza ajustado ≥4.5:1)
  3. Com `prefers-reduced-motion` ativo no navegador, nenhuma animação scroll-driven ou microinteração dispara — o conteúdo aparece estático e completo
  4. As animações usam a lib certa para cada papel (GSAP=scroll, anime.js=microinteração, Framer=legado) e o first-load JS da home permanece abaixo do budget definido (<200KB)
**Plans**: 3 plans
- [x] 01-01-PLAN.md — Fundação: tokens reconciliados + scrims, hook reduced-motion + gates (Reveal/Counter/CTA), @gsap/react, RamonPhoto + ParallaxImage, public/ramon/
- [x] 01-02-PLAN.md — Slice foto-conduzido: Hero + SobreRamon + CtaFinal redesenhados com foto P&B/scrim, tipografia contida e copy reconciliada
- [x] 01-03-PLAN.md — Slice editorial: ParaQuemE + Metodo (passos numerados, bloco branco) + Resultados + FAQ (gate reduced-motion)
**UI hint**: yes

### Phase 2: Conversão Completa
**Goal**: O funil de conversão fica completo e real — o visitante vê preço, entende a comunidade como parte do método, lê provas sociais nomeadas e chega ao WhatsApp de verdade.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: CONV-01, CONV-02, CONV-03, CONF-01
**Success Criteria** (what must be TRUE):
  1. Um visitante vê a seção Planos com o preço de cada plano visível na página, os inclusos por plano e um CTA de WhatsApp por plano (cards sóbrios, sem badge "popular")
  2. Um visitante lê depoimentos nomeados estruturados como contexto→mudança→resultado (sem nome real, o depoimento não é publicado)
  3. Um visitante encontra a seção Comunidade enquadrada como parte do método ("não estar sozinho no processo"), sem gamificação nem contador falso
  4. Todo CTA de WhatsApp abre uma conversa real (via `NEXT_PUBLIC_WHATSAPP_URL`), não mais o placeholder `wa.me/0000000000`
**Plans**: 2 plans
- [x] 02-01-PLAN.md — Fundação de dados de conversão + slice Planos (PLANS/TESTIMONIALS/COMMUNITY constants, Planos.tsx, cleanup Resultados)
- [x] 02-02-PLAN.md — Slice prova social + pertencimento: Depoimentos + Comunidade, ordem final D-01, reconciliação CtaFinal
**UI hint**: yes

### Phase 3: Conformidade Legal & LGPD
**Goal**: O site fica legalmente apto a coletar dados — o tracking só dispara após consentimento explícito e existem as páginas legais que o sustentam.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: LEGAL-01, LEGAL-02, LEGAL-03
**Success Criteria** (what must be TRUE):
  1. Um visitante acessa páginas de Política de Privacidade e Termos de Uso navegáveis e on-brand
  2. No primeiro acesso, um banner de cookie consent bloqueia o disparo de GA4/Meta/Clarity até o visitante decidir — recusar mantém os scripts desativados
  3. Após conceder consentimento, os `TrackingScripts` passam a carregar; o visitante consegue revogar o consentimento depois
**Plans**: TBD
**UI hint**: yes

### Phase 4: Blog SEO Production-Ready
**Goal**: O blog de topo de funil entra no ar — listagem, artigos MDX com todos os elementos EEAT, e SEO técnico construído junto com as rotas (não remediado depois).
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: BLOG-01, BLOG-02, BLOG-03, BLOG-04, BLOG-05, BLOG-06, BLOG-07, BLOG-08, BLOG-09, BLOG-10, SEO-01, SEO-02, SEO-03, SEO-04, SEO-05, SEO-06
**Success Criteria** (what must be TRUE):
  1. Um visitante acessa `/blog`, vê a listagem de artigos e filtra por categoria/pilar
  2. Um visitante abre um artigo em `/blog/[slug]` e vê o MDX renderizado com bloco de autor nomeado + credencial, tempo de leitura, TOC (sticky no desktop, colapsável no mobile), 2–3 posts relacionados, compartilhamento nativo e um CTA sóbrio no fim
  3. Um artigo com frontmatter inválido (campo SEO faltando) falha o build em vez de ir ao ar sem `description`/`date`
  4. Cada página e artigo expõe metadata correta (title/description/canonical/OG com `og:image` on-brand), aparece no `sitemap.xml`, respeita o `robots.txt` e emite JSON-LD (Article, Breadcrumb, Person, Organization) com URLs apontando para `NEXT_PUBLIC_SITE_URL`
**Plans**: TBD
**UI hint**: yes

### Phase 5: Captura de E-mail
**Goal**: O visitante que chegou pelo blog pode entrar na base — captura inline sóbria, consentida e acessível, sem popup.
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: LEAD-01, LEAD-02
**Success Criteria** (what must be TRUE):
  1. Um visitante preenche um form de e-mail inline (pós-artigo) com checkbox de consentimento LGPD, em estilo monocromático, e é inscrito via Resend
  2. Após submeter, o visitante vê um estado de sucesso ou de erro acessível (anunciado a leitor de tela, foco visível, WCAG AA)
  3. O e-mail não é enviado sem o checkbox de consentimento marcado
**Plans**: TBD
**UI hint**: yes

### Phase 6: Pipeline de Artigos
**Goal**: O blog passa a se auto-alimentar — uma skill orquestra os agentes da marca e produz artigos MDX válidos sem quebrar o build.
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: BLOG-11
**Success Criteria** (what must be TRUE):
  1. Rodar a skill `novo-artigo` produz um arquivo MDX versionado em `site/content/blog/` com frontmatter que satisfaz o schema BLOG-01 na primeira tentativa
  2. O artigo gerado passa o gate de lint+build da skill e aparece imediatamente na listagem `/blog` sem colisão de slug
  3. O conteúdo gerado respeita o tom de marca (passou por revisão editorial/brand no pipeline antes de versionar)
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Landing Editorial + Fundação | 3/3 | Complete   | 2026-06-01 |
| 2. Conversão Completa | 3/3 | Complete   | 2026-06-01 |
| 3. Conformidade Legal & LGPD | 0/TBD | Not started | - |
| 4. Blog SEO Production-Ready | 0/TBD | Not started | - |
| 5. Captura de E-mail | 0/TBD | Not started | - |
| 6. Pipeline de Artigos | 0/TBD | Not started | - |
