# Feature Research

**Domain:** Site de marketing high-ticket (landing de consultoria) + blog SEO de autoridade — marca pessoal de fisiculturismo de elite (Ramon Dino)
**Researched:** 2026-05-31
**Confidence:** HIGH (padrões de mercado verificados em múltiplas fontes; constraints de marca lidos direto de PROJECT.md + tom-de-voz.md + home-briefing.md)

> **Lente de marca (não negociável, atravessa toda categorização abaixo):** monocromático estrito (preto/branco/cinza), Anton + Montserrat, tom **sereno/íntimo/direto** (não gritado, não vendedor, não vitimista). Autoridade vem do título do Ramon, não do volume da voz. Sem promessa de prazo/número, sem clichê fitness, sem hype/espetáculo, sem stock photo. Toda feature "padrão de mercado" abaixo foi filtrada por isso — muito do que é table stakes no fitness genérico vira anti-feature aqui.

---

## Feature Landscape

As cinco frentes do milestone (Planos/Preço, Comunidade, Depoimentos, Blog SEO, Captura de e-mail) estão categorizadas juntas. Cada linha indica a frente entre colchetes.

### Table Stakes (Users Expect These)

Sem isso o visitante desconfia da seriedade da oferta ou o blog não ranqueia / não passa no EEAT.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **[Planos] Preço visível na página** | Em high-ticket 2026 a transparência de preço é norma e gera confiança; esconder filtra mal e cheira a "tem que pedir orçamento". Decisão já tomada em PROJECT.md | LOW | Seção `Planos.tsx` (RSC). Constantes em `lib/site.ts` (`PLANS`). Valores entregues pelo usuário no chat |
| **[Planos] O que está incluso por plano** | Comprador premium quer saber exatamente o que recebe (anamnese, protocolo, biblioteca, check-shape, suporte, comunidade — já listados na seção Método) | LOW | Lista de bullets por card. Reaproveita itens do Método sem duplicar a narrativa |
| **[Planos] CTA por plano → WhatsApp** | Sem caminho de ação o preço vira informação morta | LOW | Reusa `CTAButton`; destino `NEXT_PUBLIC_WHATSAPP_URL` (mesmo placeholder pendente) |
| **[Depoimentos] Depoimento nomeado com resultado específico** | Depoimento nomeado converte ordens de magnitude mais que estrela anônima; é o que quebra o ceticismo | LOW–MEDIUM | Constante `TESTIMONIALS` em `lib/site.ts`. Material real é pendência do usuário (CONCERNS.md). Sem nome real → não publica |
| **[Depoimentos] Antes/depois ou transformação visual** | No nicho fitness a prova é o corpo; texto sozinho não sustenta. É a forma de prova mais esperada | MEDIUM | Exige fotos reais P&B/alto contraste (acervo pendente). Tratamento monocromático para não virar "antes/depois de academia" clichê |
| **[Blog] Listagem de artigos + página de artigo (MDX)** | Sem isso não há blog. MDX já está configurado no `next.config.ts` | MEDIUM | Rotas `app/blog/page.tsx` + `app/blog/[slug]/page.tsx`. Frontmatter YAML por artigo (alinha ao padrão do repo `dados/`) |
| **[Blog] Autor nomeado + credencial + Person schema** | EEAT 2026: autor credenciado é table stakes p/ ranquear; AI engines cruzam o nome. Aqui o autor é a própria autoridade (Ramon / Dino Team) | LOW–MEDIUM | Bloco de autor + `Person`/`Article` JSON-LD. Casa perfeitamente com o ângulo "campeão mundial" |
| **[Blog] Categorias / pilares** | Navegação e topical authority; reusa os pilares de conteúdo da marca | LOW | Mapear categorias aos pilares editoriais (`brand/pilares-conteudo.md`). Filtro simples por categoria |
| **[Blog] Tempo de leitura** | Convenção universal de blog; sinaliza esforço esperado, microajuda de UX | LOW | Calculado do corpo MDX (~200 wpm). Render discreto, não decorativo |
| **[Blog] Índice (TOC) em posts longos** | Table stakes p/ post >1.000 palavras em 2026; ajuda humano e LLM a entender hierarquia | LOW–MEDIUM | Gerado dos headings MDX. Sticky no desktop, colapsável no mobile |
| **[Blog] Posts relacionados** | Mantém o visitante no domínio, distribui link juice, reduz bounce | LOW | Por categoria/tag compartilhada. 2–3 cards no fim do artigo |
| **[Blog] Compartilhamento** | Esperado em blog de autoridade; amplifica alcance orgânico | LOW | Links nativos (sem widget de terceiros que injete cor/tracking). Copiar link + share intents |
| **[Blog] CTA inline para consultoria** | O blog é topo de funil; precisa de ponte sóbria para a oferta — mas o tom proíbe vender no corpo | LOW | Bloco discreto fim-de-artigo, **não** mid-content agressivo. Microcopy sóbrio, fecha com sign-off "O topo exige direção." |
| **[SEO] sitemap.xml + robots.txt + canonical** | Sem isso o blog não é descoberto/indexado corretamente. Nativo no App Router | LOW | `app/sitemap.ts` + `app/robots.ts` mapeando os MDX. Built-in desde Next 13.3 |
| **[SEO] Metadata + OG por página/artigo** | Compartilhamento e SERP exigem title/description/og por rota. Já mapeado em CONCERNS | LOW–MEDIUM | `generateMetadata` por artigo; `opengraph-image.tsx` via `next/og` (gera OG monocromático on-brand) |
| **[SEO] Structured data Article/Breadcrumb** | Sinaliza ao crawler o que é a página; cada vez mais crítico p/ SERP + AI Overviews | LOW–MEDIUM | JSON-LD por artigo. `schema-dts` p/ tipagem. Article + Breadcrumb + Person + Organization |
| **[Captura] Form de e-mail inline + consentimento LGPD** | Captura é objetivo declarado; LGPD exige consentimento explícito antes de tracking | MEDIUM | Server Action (Next 16) → ESP. Checkbox de consentimento. Sem cor → estilo monocromático |
| **[Captura] Estado de sucesso/erro acessível** | Sem feedback o usuário não sabe se funcionou; a11y AA é constraint | LOW | `"use client"` mínimo só p/ estado do form; resto RSC |
| **[Legal] Página de privacidade/termos + cookie consent** | LGPD + pré-requisito p/ ativar GA/Pixel/Clarity já presentes no código | LOW–MEDIUM | Páginas estáticas. Banner de consentimento condiciona `TrackingScripts` (já opt-in) |

### Differentiators (Competitive Advantage)

Não obrigatórios, mas onde a marca ganha. Todos alinhados ao Core Value (converter o público certo carregado pela credibilidade do campeão).

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **[Depoimentos] Depoimento-processo, não só resultado** | Histórias que mostram "como ele pensa/ajusta" e impacto no dia a dia — alinha ao tom "processo > pódio". Diferencia do antes/depois raso do nicho | LOW–MEDIUM | Depoimento estruturado: contexto → o que mudou na rotina → resultado. Foge do clichê transformação-milagre |
| **[Depoimentos] Prova ancorada no "comum"** | Mostrar que pessoas comuns (não atletas) sustentam o método reforça "replicável p/ qualquer um" — tese central do tom | LOW | Curadoria de quem aparece: aluno comum > fisiculturista. Reforça "o que falta não é condição, é direção" |
| **[Comunidade] Comunidade como parte do método, não produto à parte** | A maioria das marcas vende comunidade como "grupo de WhatsApp". Aqui é "ambiente que te puxa pra cima" — já no vocabulário da marca (Comunidade é palavra-chave) | LOW–MEDIUM | Seção `Comunidade.tsx`. Enquadrar como "não estar sozinho no processo" (dor declarada do público), não como "perk" |
| **[Comunidade] Contador de membros / presença** | Social proof por volume; número grande em Anton (reusa `AnimatedCounter`) | LOW | Só se o número for real e relevante. Senão, omitir — número fraco enfraquece |
| **[Blog] Repurpose do pipeline `export/` → MDX** | A marca já produz conteúdo (carrosséis); reaproveitar alimenta o blog com baixo custo marginal. Decisão de PROJECT.md | HIGH | Skill geradora + adaptador export→MDX. É a feature mais cara da frente blog; trabalho de pipeline, não só de site |
| **[Blog] OG image monocromático gerado on-brand** | OG gerado via `next/og` com tipografia Anton + paleta da marca = cada share reforça identidade | MEDIUM | Template JSX único; fontes embutidas. Diferencia de OG genérico de blog |
| **[Captura] Lead magnet contextual (não newsletter genérica)** | Form contextual ("o guia de direção", não "assine a newsletter") converte muito mais. Casa com tese "direção" | MEDIUM | Conteúdo do magnet é trabalho editorial. Inline pós-artigo > popup. Define o gancho on-brand |
| **[Planos] Posicionamento como investimento, não custo** | Em high-ticket, enquadrar como investimento na identidade ("a pessoa em quem te transforma") baixa a barreira de preço | LOW | Copy da seção, não feature técnica. Conecta preço ao "segundo produto do caminho" (identidade) |

### Anti-Features (Commonly Requested, Often Problematic)

O que o playbook de fitness/coaching genérico pede e que **viola** o tom ou a lei de marca. NÃO construir.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Pop-up de captura agressivo / exit-intent / timer** | "Popups dominam volume (66%+)", convertem em fitness genérico | Viola tom sereno e anti-espetáculo; interrompe; cheira a vendedor (palavra-NÃO do tom) | Form **inline** pós-artigo, contextual. Sem overlay, sem timer, sem "espere! não vá!" |
| **Selo "X kg em Y dias" / countdown de oferta / escassez falsa** | Padrão de prova e urgência em fitness e high-ticket | Tabu explícito: promessa de prazo/número. Escassez falsa quebra a confiança calma | Prova por processo e por trajetória real do Ramon. Urgência só se real |
| **Cor de destaque / verde "saúde" / vermelho CTA / badges coloridos** | Best-practice de CRO ("botão contrastante converte") | Lei de marca: monocromático estrito. Qualquer cor é violação | Contraste por preto/branco/cinza + tipografia Anton. Inversão de bloco (branco sobre preto) p/ destaque |
| **Estrelas de avaliação / "4.9 de 2.341 reviews" / score agregado** | Social proof padrão | Anônimo converte muito menos que nomeado; e número agregado vira "produto popular", contra "marca de elite, não popular" | Depoimentos nomeados com resultado específico e foto real |
| **Tier "grátis"/freemium da comunidade, gamificação, badges, ranking** | Engajamento de comunidade SaaS | Vira espetáculo/competição de plateia; contra "orienta para dentro, liberte da plateia" | Comunidade enquadrada como ambiente de processo, parte do método |
| **Stock photo de academia, halteres, "antes/depois" colorido de banco** | Preencher seções sem acervo | Constraint: sem stock; sem clichê fitness | Acervo real do Ramon P&B; placeholder monocromático intencional até chegar |
| **Comparador de planos tipo SaaS (3 colunas "Popular!"/badge)** | Padrão de pricing table | Badge "mais popular" = apelo de plateia; estética SaaS colorida contra marca | Cards sóbrios monocromáticos, hierarquia por tipografia, sem badge gritado |
| **Chat widget / chatbot de captura no canto** | Captura de lead "moderna" | Injeta UI/cor/script de terceiro; ruído; contra minimalismo agressivo | CTA WhatsApp direto (já é o canal de conversão) |
| **Comentários no blog / fórum embutido** | "Engajamento" | Moderação cara, spam, ruído visual, risco de tom fora de marca | Comunidade fica no canal próprio; blog é topo de funil unidirecional |
| **Auto-play de vídeo / carrossel auto-rotativo de depoimentos** | "Dinamismo" | Contra `prefers-reduced-motion`; hype visual; a11y | Slider controlado pelo usuário ou grid estático; motion contido |
| **Newsletter com cadência de "dicas" motivacionais** | Nutrição de lead padrão | Motivação vazia é tabu; "no topo de funil mindset não vende" | Captura sim; conteúdo do e-mail = método/direção, mesmo tom sóbrio (fora deste milestone) |
| **CTA de venda no meio do corpo do artigo** | Conversão de blog | Tom proíbe vender no corpo; só no fecho sóbrio | CTA único, discreto, no fim do artigo, com sign-off |

---

## Feature Dependencies

```
[Blog: listagem + artigo MDX]
    └──requires──> [MDX config]  (✓ já existe em next.config.ts)
    └──requires──> [Frontmatter schema por artigo: title, slug, date, author, category, description]
            └──enables──> [Tempo de leitura]
            └──enables──> [TOC]  (dos headings)
            └──enables──> [Posts relacionados]  (por category/tag)
            └──enables──> [sitemap.ts]  (lê os MDX)
            └──enables──> [generateMetadata + Article schema]  (lê frontmatter)

[SEO técnico: sitemap + robots + canonical + structured data]
    └──requires──> [Blog: artigo MDX]  (precisa das rotas p/ mapear)

[opengraph-image.tsx por artigo]
    └──requires──> [Fontes Anton/Montserrat embutidas no edge runtime]

[Skill repurpose export/ → MDX]
    └──requires──> [Frontmatter schema do blog]
    └──enhances──> [Blog]  (alimenta com baixo custo)

[Captura de e-mail inline]
    └──requires──> [ESP escolhido + Server Action]
    └──requires──> [Consentimento LGPD]
    └──conflicts──> [Pop-up de captura]  (não fazer ambos; inline é a via on-brand)

[Cookie consent / páginas legais]
    └──gates──> [TrackingScripts GA/Pixel/Clarity]  (já opt-in no código)

[Depoimentos com antes/depois]   [Hero/SobreRamon fotos reais]
    └──both require──> [Acervo real do Ramon P&B]  (pendência do usuário)

[Planos]  [Depoimentos]  [Comunidade]
    └──all require──> [Conteúdo real do usuário entregue no chat]  (valores, transformações, dados da comunidade)
```

### Dependency Notes

- **Frontmatter schema é a raiz do blog:** define-o cedo. TOC, tempo de leitura, relacionados, sitemap, metadata e schema todos dependem dele. Errar o schema = retrabalho em cascata.
- **SEO técnico depende das rotas do blog existirem** — não dá pra gerar sitemap de artigos antes de ter o roteamento MDX.
- **Captura inline conflita com pop-up:** escolher uma via. Inline pós-artigo é a única compatível com o tom; pop-up é anti-feature.
- **Cookie consent é gate dos scripts de tracking** já presentes — sem consentimento, não dispara (já é opt-in, mas falta o banner e as páginas legais).
- **Fotos reais bloqueiam Depoimentos visuais e o redesign foto-conduzido** — são pendência do usuário; planejar fallback monocromático intencional para não travar o build.
- **Conteúdo real (preços, depoimentos, dados da comunidade) é entregue no chat sob demanda** — as seções podem ser construídas com estrutura + placeholder e populadas depois.

---

## MVP Definition

> Contexto: milestone subsequente. "MVP" aqui = o conjunto que entrega o Core Value (converter público certo em lead) + sustenta autoridade (blog SEO). Ordenado por dependência e valor.

### Launch With (v1 deste milestone)

- [ ] **Seção Planos com preço visível + inclusos + CTA** — decisão tomada; transparência é table stakes high-ticket
- [ ] **Seção Depoimentos nomeados** (texto estruturado; visual quando acervo chegar) — quebra ceticismo, prova o método
- [ ] **Seção Comunidade** enquadrada como parte do método — responde à dor "estou sozinho no processo"
- [ ] **Blog: listagem + artigo MDX + frontmatter schema** — fundação; tudo do blog depende disso
- [ ] **Blog: autor/credencial + tempo de leitura + categorias + relacionados + TOC + CTA fim-de-artigo** — table stakes de autoridade EEAT
- [ ] **SEO técnico: sitemap + robots + metadata/OG + Article schema** — sem isso o blog não cumpre o papel de tráfego orgânico
- [ ] **Captura de e-mail inline + LGPD** — objetivo declarado; via inline (não popup)
- [ ] **Páginas legais + cookie consent** — desbloqueia tracking já no código; obrigação LGPD
- [ ] **WhatsApp real** — sem ele nenhum CTA converte

### Add After Validation (v1.x)

- [ ] **Repurpose `export/` → MDX (skill)** — feature mais cara; o blog pode lançar com artigos manuais MDX e ganhar o pipeline depois
- [ ] **OG image gerado on-brand por artigo** — começa com OG estático único; gera dinâmico quando o volume de artigos justificar
- [ ] **Lead magnet contextual** — começa com captura simples; adiciona o gancho/conteúdo quando definido
- [ ] **Contador de membros da comunidade** — só quando houver número real e relevante

### Future Consideration (v2+)

- [ ] **Newsletter com cadência de conteúdo** — fora deste milestone; exige estratégia editorial de e-mail própria no tom sóbrio
- [ ] **Busca no blog** — só quando o volume de artigos justificar
- [ ] **Filtro multi-tag avançado / arquivo por data** — adiar até o blog ter massa crítica

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Planos com preço visível | HIGH | LOW | P1 |
| Depoimentos nomeados | HIGH | LOW–MEDIUM | P1 |
| Seção Comunidade | MEDIUM | LOW–MEDIUM | P1 |
| Blog listagem + artigo MDX (+ schema frontmatter) | HIGH | MEDIUM | P1 |
| Autor/TOC/tempo/categorias/relacionados | MEDIUM | LOW–MEDIUM | P1 |
| SEO técnico (sitemap/robots/metadata/schema) | HIGH | LOW–MEDIUM | P1 |
| Captura e-mail inline + LGPD | HIGH | MEDIUM | P1 |
| Páginas legais + cookie consent | MEDIUM | LOW–MEDIUM | P1 |
| WhatsApp real | HIGH | LOW | P1 |
| CTA fim-de-artigo on-brand | MEDIUM | LOW | P1 |
| Repurpose export/ → MDX | HIGH | HIGH | P2 |
| OG image dinâmico on-brand | MEDIUM | MEDIUM | P2 |
| Lead magnet contextual | HIGH | MEDIUM | P2 |
| Contador de membros | LOW | LOW | P2 |
| Newsletter com cadência | MEDIUM | MEDIUM | P3 |
| Busca no blog | LOW | MEDIUM | P3 |

**Priority key:** P1 = must have for launch · P2 = should have, add when possible · P3 = nice to have, future.

## Competitor Feature Analysis

Referências do nicho high-ticket coaching / fitness de autoridade vs. abordagem Dino Team.

| Feature | Coaching genérico (playbook) | Marca pessoal de atleta (STNDRD-like) | Our Approach |
|---------|------------------------------|----------------------------------------|--------------|
| Preço | Gated ("agende uma call") | Às vezes visível em tiers | Visível na página, sóbrio, sem badge "popular" |
| Prova social | Estrelas + número agregado | Antes/depois + depoimento | Depoimento **nomeado** + processo + foto P&B real; sem score agregado |
| Comunidade | "Grupo exclusivo" como perk | Comunidade da marca | Parte do método ("não estar sozinho"), não perk; sem gamificação |
| Captura | Pop-up + lead magnet genérico | Inline + newsletter | Inline contextual pós-artigo; sem pop-up |
| Blog | Posts SEO keyword-stuffed | Pouco blog, muito IG | Blog de autoridade EEAT + repurpose do pipeline IG existente |
| CTA blog | Vende no meio do post | Variado | Um CTA sóbrio no fecho + sign-off |
| Estética | Cor + urgência + hype | Variado | Monocromático estrito, sereno, anti-espetáculo |

---

## Sources

- [Nora Sudduth — High Ticket Coaching](https://norasudduth.com/business-strategy/high-ticket-sales-coaching/) (MEDIUM — transparência de preço como norma)
- [Lovely Impact — High Ticket Coaching Funnel](https://lovelyimpact.com/high-ticket-coaching-funnel/) (MEDIUM)
- [Studiocart — Sell High-Ticket Offers](https://www.studiocart.co/guide/how-to-sell-high-ticket-coaching-offers-3k/) (MEDIUM — preço como investimento)
- [Coached — Testimonials that Convert](https://usecoached.com/blog/how-to-collect-client-testimonials-convert-fitness-coaching) (MEDIUM — nomeado > anônimo; tipos de depoimento)
- [Code Canel — Fitness Before/After](https://codecanel.com/fitness-before-after/) (MEDIUM — antes/depois como prova emocional)
- [VanDenBerg — Ideal Blog Post 2026 (SEO+AI)](https://rebeccavandenberg.com/what-does-an-ideal-blog-post-look-like-in-2026-seo-ai-guide/) (MEDIUM — TOC/autor/estrutura table stakes)
- [RankAI — Author Schema & SEO](https://rankai.ai/blog/your-complete-guide-to-author-schema-and-its-seo-impact) (MEDIUM — Person schema / EEAT)
- [Next.js Docs — Metadata and OG images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) (HIGH — official, `generateMetadata` + `next/og`)
- [Kodaps — Next.js App Router SEO features](https://www.kodaps.dev/en/blog/nextjs-app-seo-features) (MEDIUM — sitemap.ts/robots.ts/structured data)
- [DEV — SEO-Optimized Blog with Next.js + MDX](https://dev.to/pavel_buyeu/building-an-seo-optimized-blog-with-nextjs-and-mdx-from-routing-to-rendering-2h72) (MEDIUM)
- [Hello Bar — Popup vs Inline Form](https://www.hellobar.com/blog/popup-vs-inline-form/) (MEDIUM — inline contextual converte; popup intrusivo)
- [Resend — Send emails with Next.js](https://resend.com/nextjs) (HIGH — ESP dev-first p/ Server Actions/API routes)
- [Thinkific — Brand Community Examples](https://www.thinkific.com/blog/brand-community-examples-and-tips/) (MEDIUM — value prop + social proof de comunidade)
- Project docs (HIGH): `.planning/PROJECT.md`, `site/docs/home-briefing.md`, `.planning/codebase/STRUCTURE.md`, `brand/tom-de-voz.md`

---
*Feature research for: site high-ticket coaching + blog SEO de autoridade (marca pessoal de elite)*
*Researched: 2026-05-31*
