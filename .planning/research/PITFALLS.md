# Pitfalls Research

**Domain:** Redesign editorial + blog SEO + animação multi-lib (GSAP + anime.js + three.js + Framer Motion) + integração de pipeline, em Next.js 16 App Router, identidade monocromática estrita, mercado BR (LGPD)
**Researched:** 2026-05-31
**Confidence:** HIGH (verificado: contraste WCAG calculado, three.js/RSC e GSAP matchMedia confirmados em docs oficiais; MEDIUM nos detalhes de Next 16 MDX por janela de versão recente)

> Este documento foca nas armadilhas do **novo escopo** (animação multi-lib, three.js, LGPD runtime, MDX, SEO de blog novo, a11y monocromática, reduced-motion com libs JS). O `CONCERNS.md` já mapeou: og:image ausente, sem gate de consentimento, `metadataBase` placeholder, `cn()` sem tailwind-merge, MDX instalado-mas-não-usado, WhatsApp placeholder, ausência de páginas legais e de testes. Esses não são repetidos aqui exceto quando o novo escopo os agrava.

---

## Critical Pitfalls

### Pitfall 1: Quatro libs de animação fazendo a mesma coisa (bundle bloat + propósito duplicado)

**What goes wrong:**
GSAP, anime.js, three.js e Framer Motion coexistem sem fronteira de responsabilidade. Cada um traz seu próprio runtime (GSAP core ~70KB, Framer Motion ~50KB+ gzip, anime.js ~9KB, three.js ~150KB+ gzip). Sem regra, um dev anima um fade com GSAP, outro com Framer Motion, outro com anime.js — três engines de tweening carregados para o mesmo efeito. O bundle JS do site editorial (que deveria ser leve) infla para 300–400KB+ só de libs de motion, matando o LCP/TBT que o blog SEO precisa proteger.

**Why it happens:**
O PROJECT.md delega "combinação à discrição do executor". Sem um mapa de responsabilidade, cada execução escolhe a lib mais conveniente no momento. As quatro libs têm overlap real: Framer Motion e anime.js e GSAP todas fazem fade/slide/stagger; GSAP ScrollTrigger e Framer Motion `useScroll` ambos fazem scroll-driven.

**How to avoid:**
Definir um **mapa de responsabilidade única por lib** logo na primeira fase de animação, e tratá-lo como lei:
- **Framer Motion** (legado, já no bundle): microinterações de componente React simples (hover, mount/unmount, `Reveal`/`AnimatedCounter` existentes). Não adicionar uso novo se outra lib já cobre.
- **GSAP + ScrollTrigger**: tudo que é scroll-driven (pin, parallax editorial, timeline de seção). Uma autoridade única para scroll.
- **anime.js**: só microinterações fora de React (ex: SVG/canvas pontual) onde Framer Motion não cabe.
- **three.js / R3F**: exclusivamente WebGL pontual (1 cena, lazy). Nunca para 2D que CSS/GSAP resolve.
Carregar GSAP e three.js **só nas rotas/seções que os usam** via dynamic import — nunca no `layout.tsx` global. Adicionar um `bundle budget` (ex: first-load JS < 200KB na home, < 130KB nas páginas de artigo do blog) e medir no `curador-web`.

**Warning signs:**
- `npm run build` mostra first-load JS subindo acima de 200KB.
- Duas libs importadas no mesmo componente para efeitos visualmente equivalentes.
- GSAP ou three.js aparecendo no chunk compartilhado (`layout`/`app`) em vez de chunk de rota.

**Phase to address:**
Fase de fundação de animação (antes de qualquer efeito). Definir o mapa + bundle budget como critério de sucesso da fase.

---

### Pitfall 2: prefers-reduced-motion respeitado só no CSS — libs JS ignoram

**What goes wrong:**
O `globals.css` tem `@media (prefers-reduced-motion: reduce)` que zera transições/animações CSS. Mas GSAP, anime.js, three.js e até `Reveal.tsx`/`AnimatedCounter.tsx` (Framer Motion via JS, já apontado no CONCERNS.md) **animam via JavaScript** — manipulam estilos inline e `requestAnimationFrame` diretamente, fora do alcance do override CSS. Resultado: o usuário com reduced-motion ainda recebe parallax pesado, contadores animados, loops de WebGL e scroll-jacking — exatamente o público com sensibilidade vestibular que a regra deveria proteger. É também um item de auditoria de a11y que derruba o Lighthouse/WCAG do `curador-web`.

**Why it happens:**
A crença de que "já tem a media query no CSS, então está coberto". CSS `animation: none` não pausa um `gsap.to()` nem um render loop de three.js — esses escrevem estilos inline com prioridade maior, ou desenham em canvas que o CSS nem alcança.

**How to avoid:**
Gate em **JS, por lib**, não só CSS:
- **GSAP:** envolver toda timeline/ScrollTrigger em `gsap.matchMedia()` com a condição `"(prefers-reduced-motion: no-preference)"`. O matchMedia reverte automaticamente as animações quando a query deixa de bater (inclusive em toggle runtime via `gsap.matchMediaRefresh()`). [Verificado em docs GSAP.]
- **Framer Motion:** usar o hook `useReducedMotion()` e desligar `animate`/usar variantes estáticas; não confiar no CSS.
- **anime.js:** checar `window.matchMedia('(prefers-reduced-motion: reduce)').matches` antes de instanciar; pular a animação se `true`.
- **three.js / R3F:** se reduced-motion, não montar a cena animada (servir poster estático/imagem) ou parar o render loop (`frameloop="never"` no R3F, ou não chamar `requestAnimationFrame`).
- Centralizar num hook `usePrefersReducedMotion()` reutilizado por todos.

**Warning signs:**
- Animação JS continua rodando com `prefers-reduced-motion: reduce` ativo no DevTools (Rendering > Emulate CSS media).
- Lighthouse/axe não pega (não testa reduced-motion), então **precisa de checagem manual** no DevTools.
- `Reveal.tsx`/`AnimatedCounter.tsx` ainda animam com a flag ligada (CONCERNS.md já sinaliza esse caso).

**Phase to address:**
Mesma fase de fundação de animação — o hook e os gates devem nascer junto com a primeira animação, não retrofitados.

---

### Pitfall 3: three.js no Next 16 / RSC — hydration mismatch e peso no bundle global

**What goes wrong:**
Importar three.js / React Three Fiber direto num componente que o servidor tenta renderizar gera erro de hydration (o servidor não tem `WebGLRenderingContext`, `window`, `requestAnimationFrame`) ou, pior, "vaza" three.js para o chunk compartilhado e adiciona 150KB+ ao first-load de **todas** as páginas — inclusive artigos do blog que não têm WebGL. Em mobile (boa parte do público fitness 18–40), uma cena WebGL mal otimizada trava o scroll e drena bateria.

**Why it happens:**
RSC renderiza no servidor por padrão. three.js é client-only e pesado. A solução `'use client'` sozinha não impede o SSR do componente — só `dynamic(..., { ssr: false })` o faz client-only de verdade. Sem isso, o bundler ainda pode incluir three.js no grafo global.

**How to avoid:**
- Componente de cena com `'use client'` **e** importado via `next/dynamic` com `{ ssr: false }` a partir de uma RSC. [Verificado: padrão oficial R3F + Next App Router.]
- Renderizar a cena **só na seção/rota que a usa**, com um `loading`/poster estático (imagem P&B do Ramon) enquanto carrega — evita CLS e dá fallback para reduced-motion/mobile fraco.
- Usar **R3F v9** (v8 é incompatível com React 19 / Next 16). Adicionar `three` a `transpilePackages` se add-ons do ecossistema vierem não-transpilados. [Verificado em docs R3F.]
- Pausar o render loop quando a cena sai do viewport (IntersectionObserver / `frameloop="demand"`).
- Confirmar no build report que `three` está num chunk de rota, não no shared.

**Warning signs:**
- Console: "ReferenceError: window is not defined" no build/SSR.
- "Hydration failed" / "Text content does not match".
- first-load JS sobe em rotas que nem usam 3D.
- Frame drops/aquecimento em mobile durante scroll.

**Phase to address:**
Fase específica de three.js (separada da fundação de animação 2D). Provavelmente a fase que **mais precisa de spike/research dedicada** — flag para o roadmap.

---

### Pitfall 4: Ativar GA4/Meta/Clarity sem gate de consentimento runtime (LGPD)

**What goes wrong:**
`TrackingScripts.tsx` injeta GA4 + Meta Pixel + Clarity assim que os env vars existem (CONCERNS.md). No dia em que o usuário preencher os IDs para o lançamento, o site passa a coletar dados pessoais (cookies, IP, fingerprint do Meta) **antes de qualquer consentimento** — violação direta da LGPD (Lei 13.709/2018). O risco é maior porque o canal de conversão é WhatsApp (dado pessoal) e o Meta Pixel já dispara `PageView`/eventos sem opt-in.

**Why it happens:**
O opt-in atual é por **env var** (decisão de deploy), não por **consentimento do usuário** (decisão de runtime do visitante). São coisas diferentes e fáceis de confundir. Banners de cookie costumam ser deixados para o fim e implementados como enfeite visual que não bloqueia de fato os scripts.

**How to avoid:**
- Implementar banner de consentimento que **bloqueia o carregamento** dos scripts até `aceitar`. `TrackingScripts` só renderiza os `<Script>` se houver sinal de consentimento (cookie `consent=granted`), nunca só por env var.
- Categorizar: scripts essenciais (nenhum, no caso) vs. analytics/marketing (todos os três) — só os essenciais sem consentimento.
- Estado de consentimento persistido em cookie próprio (não em script de terceiro), com opção de **revogar**.
- Página de Política de Privacidade (já listada como pendência) precisa existir **antes** do banner, linkada nele.
- Não disparar `gtag`/`fbq` de eventos de conversão antes do consentimento.

**Warning signs:**
- DevTools > Network mostra requisições para `google-analytics.com` / `connect.facebook.net` / `clarity.ms` no primeiro load, sem clicar em "aceitar".
- Cookies `_ga`, `_fbp`, `_clck` presentes antes de consentimento.
- Banner aparece mas scripts já carregaram por trás.

**Phase to address:**
Fase de LGPD/legal, que deve vir **antes ou junto** da fase que configura tracking real — nunca depois. Bloqueante de lançamento.

---

### Pitfall 5: Blog novo com SEO que se autossabota (metadata, CLS, JSON-LD, sitemap)

**What goes wrong:**
Blog novo já nasce sem autoridade; erros técnicos comuns matam o ranqueamento antes de começar:
- **Metadata duplicada/genérica:** todos os artigos herdam o `title`/`description` do layout, ou o `metadataBase` placeholder (`dinoteam.vercel.app`, CONCERNS.md) faz canonical/OG apontarem para o domínio errado.
- **CLS de fontes e animação:** Anton/Montserrat carregando sem `next/font` (FOUT/layout shift) + animações de entrada (`Reveal`, GSAP) que empurram conteúdo = Core Web Vitals ruins, que o Google usa como sinal.
- **JSON-LD malformado:** structured data `Article`/`BlogPosting` com campos faltando ou tipo errado → não aparece como rich result, ou gera erro no Search Console.
- **Sitemap/robots ausentes ou estáticos:** sitemap não inclui artigos novos automaticamente; `robots.txt` bloqueando por engano.
- **og:image faltando** (CONCERNS.md): compartilhamento no WhatsApp (canal #1 de conversão) sem preview.

**Why it happens:**
SEO técnico é invisível em dev — o site "parece pronto". Metadata por artigo exige `generateMetadata` por rota dinâmica; é fácil esquecer e cair no fallback. CLS só aparece em medição, não em olho nu. JSON-LD não dá erro de runtime quando malformado.

**How to avoid:**
- `generateMetadata` por artigo (title, description, canonical, OG por página) derivado do frontmatter MDX. `metadataBase` via `process.env.NEXT_PUBLIC_SITE_URL`.
- Fontes via `next/font/local` (Anton/Montserrat) com `display: swap` e `size-adjust` para zerar CLS; reservar espaço para imagens (width/height ou aspect-ratio).
- Animações de entrada com `transform`/`opacity` apenas (não animar layout); estado inicial não deve reservar zero altura.
- `app/sitemap.ts` e `app/robots.ts` dinâmicos que iteram os artigos MDX no build. Sitemap inclui `lastModified` do frontmatter.
- JSON-LD `BlogPosting` validado contra o Rich Results Test; campos obrigatórios (`headline`, `datePublished`, `author`, `image`).
- OG image por artigo via `app/blog/[slug]/opengraph-image.tsx` (gerada) ou imagem do frontmatter.

**Warning signs:**
- Search Console: "Página duplicada sem canônica selecionada pelo usuário" / cobertura baixa.
- Lighthouse SEO < 100; CLS > 0.1.
- Rich Results Test acusa erro/aviso no Article.
- Compartilhar artigo no WhatsApp não mostra card.

**Phase to address:**
Fase do blog (estrutura MDX + SEO técnico juntos — SEO não é "depois"). CLS de fonte deve ser resolvido na fase de redesign/design system.

---

### Pitfall 6: Cinza de marca #7f7f7f que falha contraste WCAG sobre fundo claro

**What goes wrong:**
O cinza de marca `#7f7f7f` **passa** AA em texto normal sobre preto (5.24:1, calculado), mas **falha** sobre branco — só 4.0:1, abaixo do mínimo 4.5:1 para texto normal. Como o design é monocromático e usa tanto seções escuras quanto claras (e o blog/artigo tende a ser texto longo sobre fundo claro para leitura), usar `#7f7f7f` para texto secundário/legendas/metadados sobre branco é uma falha de a11y silenciosa e generalizada. Foco visível e estados desabilitados em cinza sobre cinza também viram problema.

**Why it happens:**
Monocromático tenta um único token de cinza para tudo. O contraste depende do **fundo**, e o mesmo cinza que funciona no hero escuro reprova no corpo de artigo claro. Designers checam contraste no mockup escuro e generalizam.

**How to avoid:**
- Tratar `#7f7f7f` como **cinza só-para-fundo-escuro** (texto secundário sobre preto: OK). Para texto sobre branco, usar um cinza mais escuro (ex: `#595959` dá ~7:1; o mínimo para 4.5:1 sobre branco é por volta de `#767676`). Adicionar token `text-muted-on-light` distinto se a marca permitir, ou restringir cinza a fundos escuros.
- Não usar cinza para **texto pequeno crítico** (CTA, links de conversão) em nenhum fundo — usar branco/preto puro (21:1).
- Foco visível: outline com contraste ≥ 3:1 contra o fundo adjacente E contra o componente — em monocromático, garantir que o `:focus-visible` não seja cinza-sobre-cinza.
- Rodar axe/Lighthouse a11y em seções claras E escuras separadamente.

**Warning signs:**
- Lighthouse/axe: "Contrast ratio is insufficient" em texto cinza.
- Legendas/metadados de artigo em cinza sobre branco.
- Foco invisível ao navegar por teclado em seções claras.

**Phase to address:**
Fase de redesign/design system — definir os tokens de cinza por fundo antes de aplicar em seções e no blog.

---

### Pitfall 7: MDX no Next 16 App Router — RSC, frontmatter e code-splitting

**What goes wrong:**
MDX está instalado mas nunca usado (CONCERNS.md). Ao ligar de verdade:
- `@next/mdx` (rotas `.mdx` em `app/`) **não parseia frontmatter** nativamente — `export const metadata` precisa ser manual, ou usa-se `remark-frontmatter` + plugin. Devs assumem que `---` no topo "só funciona" e acabam com o YAML renderizado como texto na página.
- Conteúdo dinâmico (artigos gerados pela skill, versionados como arquivos) lido em runtime vs. build: `@next/mdx` espera arquivos roteáveis em build-time; conteúdo data-driven pede `next-mdx-remote` (ou `@next/mdx` com `import()` dinâmico), que é outro padrão.
- Componentes interativos dentro do MDX viram client components e podem inflar o bundle por artigo se não forem code-split.

**Why it happens:**
Há dois mundos de MDX (compile-time `@next/mdx` vs. runtime `next-mdx-remote`) e eles se confundem. O pipeline gera MDX como **dado versionado** (skill → arquivo), o que empurra para o modelo runtime/file-based, não o de rota estática.

**How to avoid:**
- Decidir o modelo cedo: artigos como **arquivos `.mdx` lidos no build** (collection) → `generateStaticParams` + leitura de frontmatter via `gray-matter` + MDX compilado (`next-mdx-remote/rsc` ou `@content-collections`/equivalente compatível com Next 16). Frontmatter parseado explicitamente, nunca renderizado.
- Manter os artigos como RSC por padrão; só componentes realmente interativos como `'use client'` islands dentro do MDX.
- Mapear `MDXComponents` (h1→Anton, p→Montserrat, etc.) uma vez, para manter tipografia de marca sem hardcode no conteúdo.
- Validar frontmatter (slug, title, description, date, og image) no build — artigo sem campo obrigatório falha o build, não vai pro ar quebrado.

**Warning signs:**
- `---` aparece como texto no artigo renderizado.
- Erro de RSC ao usar hook/estado dentro de `.mdx` sem `'use client'`.
- Cada artigo virando client component pesado.
- `metadata` do artigo vindo vazia/fallback.

**Phase to address:**
Fase do blog — escolha do modelo MDX é decisão de fundação da fase, antes da skill geradora.

---

### Pitfall 8: Skill geradora de MDX produzindo conteúdo que quebra build/SEO

**What goes wrong:**
A skill gera artigos (e faz repurpose de `export/`) como MDX versionado. Sem contrato rígido, ela produz: frontmatter incompleto/inconsistente, slugs duplicados ou com acento/espaço, datas em formato variável, JSX inválido (aspas curvas, tags não fechadas vindas de copy editorial), imagens referenciando caminhos inexistentes. Um MDX inválido **quebra o build inteiro** do Next (não só o artigo), derrubando o site.

**Why it happens:**
LLM gerando MDX livre não valida sintaxe nem unicidade de slug. Repurpose de conteúdo de carrossel (`export/`) traz formatação que não é MDX válido. O acoplamento build-time significa que um artigo ruim bloqueia tudo.

**How to avoid:**
- Contrato de output rígido para a skill: frontmatter com schema fixo (slug kebab-case sem acento, title, description ≤ 160, date ISO, ogImage, tags). Validar antes de commitar.
- Slug derivado/normalizado e checado contra colisão com artigos existentes.
- Lint de MDX (remark) + `npm run build` como gate na skill antes de versionar (igual `curador-web` faz pro site).
- Repurpose: transformar copy de carrossel em MDX por template, não copiar cru.
- Artigos em pasta isolada para que falha de um seja detectável; idealmente build por-artigo no CI.

**Warning signs:**
- Build falha após adicionar artigo.
- Dois artigos com mesmo slug → rota colide.
- Frontmatter com campos faltando → metadata/SEO quebrados naquele artigo.

**Phase to address:**
Fase da skill de geração de blog (depende da fundação MDX da Fase do blog).

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Carregar GSAP/three.js no layout global | Import simples, "funciona em qualquer página" | first-load JS infla em todas as rotas, mata LCP do blog | Nunca — sempre dynamic por rota |
| Banner de cookie cosmético (não bloqueia scripts) | Entrega rápida, "tem banner" | Violação LGPD continua; risco legal real | Nunca |
| Reduced-motion só via CSS | Já está no globals.css | Libs JS ignoram; falha a11y silenciosa | Nunca para animação JS; OK só para puro CSS |
| Cinza #7f7f7f único para todo texto | 1 token, simples | Falha contraste sobre branco | Só em texto sobre fundo escuro |
| MDX runtime (`next-mdx-remote`) por preguiça de configurar build | Flexível, sem `generateStaticParams` | Perde SSG/perf, artigos não pré-renderizados → SEO/LCP piores | Só se conteúdo for verdadeiramente dinâmico (não é o caso) |
| Pular `next/font`, usar `<link>` de fonte | Setup trivial | CLS de fonte, penalidade Core Web Vitals | Nunca neste projeto (SEO é objetivo) |
| Manter Framer Motion + adicionar 3 libs sem mapa | Liberdade do executor | Propósito duplicado, bundle bloat, manutenção confusa | Nunca sem mapa de responsabilidade |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| GA4 / Meta Pixel / Clarity | Disparar por env var sem consentimento (estado atual) | Gate por cookie de consentimento runtime; só renderizar `<Script>` após "aceitar" |
| WhatsApp (conversão) | Manter `wa.me/0000000000`; sem og:image no card | Número real via env + og:image por página para preview no compartilhamento |
| three.js / R3F | `'use client'` sozinho (ainda SSR) ou import global | `dynamic(..., { ssr: false })` + R3F v9 + chunk por rota + poster fallback |
| Newsletter provider (a definir) | Escolher provider que injeta script de tracking próprio sem consentimento | Escolher provider com double opt-in e form server-side; submeter via API route, não script de terceiro no `<head>` |
| MDX gerado por skill | Commitar MDX inválido que quebra o build inteiro | Lint remark + build gate antes de versionar; schema de frontmatter validado |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Libs de motion no shared chunk | first-load JS > 200KB; LCP alto | Dynamic import por rota; bundle budget no curador-web | Imediato no mobile 3G/4G |
| three.js render loop sempre ativo | Aquecimento, frame drop, bateria no mobile | IntersectionObserver + `frameloop="demand"`; pausar fora do viewport | Em qualquer celular médio durante scroll |
| CLS de fonte (Anton/Montserrat) | Texto pula no load; CLS > 0.1 | `next/font` com swap + size-adjust | Toda primeira visita; penaliza ranking |
| Animação de entrada que reflui layout | CLS de animação; conteúdo empurrado | Animar só transform/opacity; reservar altura inicial | Visível em conexões lentas |
| MDX runtime sem SSG | TTFB/LCP altos em artigo; sem cache estático | Build-time MDX + generateStaticParams | Quando o blog crescer e ganhar tráfego (objetivo!) |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Tracking sem consentimento (LGPD) | Multa/processo; coleta ilícita de dado pessoal | Gate de consentimento bloqueante antes dos scripts |
| Coletar e-mail de newsletter sem base legal / sem política | Violação LGPD; dado pessoal sem consentimento | Double opt-in + política de privacidade linkada + checkbox explícito |
| og:image / metadata derivados de input não sanitizado do frontmatter | Injeção via MDX gerado | Validar/escapar frontmatter; schema rígido na skill |
| WhatsApp link com número em texto puro indexável | Scraping/spam do número | OK para conversão, mas ciente; não é vetor crítico aqui |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Scroll-jacking pesado (GSAP pin/parallax) | Usuário perde controle do scroll, enjoa; pior no mobile | Parallax sutil; respeitar reduced-motion; nunca sequestrar scroll inteiro |
| Banner de consentimento que cobre conteúdo/CTA | Bloqueia conversão WhatsApp, irrita | Banner discreto não-modal; não esconder o CTA principal |
| WebGL como gate visual (cena antes do conteúdo) | Loading longo no mobile fraco; bounce | Poster estático imediato; WebGL só enriquece, nunca bloqueia |
| Cinza secundário ilegível sobre branco no artigo | Leitura cansativa, abandono | Cinza escuro (≥4.5:1) para corpo; #7f7f7f só em fundo escuro |
| Foco de teclado invisível (monocromático) | Usuário de teclado se perde | `:focus-visible` com contraste ≥3:1; testar nas seções claras e escuras |

## "Looks Done But Isn't" Checklist

- [ ] **Animações:** parecem suaves no desktop — verificar reduced-motion (DevTools emulate) **realmente** para GSAP/anime/three/Framer, não só CSS; testar mobile médio.
- [ ] **Consentimento LGPD:** banner existe — verificar que GA4/Meta/Clarity **não** disparam em Network antes de "aceitar".
- [ ] **Blog SEO:** artigo renderiza — verificar `generateMetadata` por artigo, canonical correto (metadataBase real), JSON-LD valida no Rich Results Test, sitemap inclui o artigo, og:image presente.
- [ ] **three.js:** cena aparece — verificar `ssr:false`, three.js fora do shared chunk no build report, poster fallback, render loop pausa fora do viewport.
- [ ] **Contraste:** design aprovado no escuro — verificar contraste do cinza em **seções claras** e foco de teclado em ambas.
- [ ] **MDX:** artigo abre — verificar frontmatter parseado (não renderizado), build não quebra com artigo inválido, tipografia de marca aplicada via MDXComponents.
- [ ] **Fontes:** texto renderiza — verificar CLS ≈ 0 (next/font), sem FOUT visível.
- [ ] **Bundle:** site rápido em dev — medir first-load JS de produção contra o budget (home e artigo).

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Libs de motion no shared chunk | MEDIUM | Refatorar para dynamic import por rota; remover lib redundante; re-medir build |
| Tracking sem consentimento já em produção | HIGH (legal) | Tirar IDs do ar imediatamente; implementar gate; revisar coleta retroativa; publicar política |
| Cinza falhando contraste em várias telas | MEDIUM | Introduzir token de cinza por fundo; busca-substituir usos sobre branco |
| MDX inválido quebrando build | LOW | Reverter/corrigir artigo; adicionar lint+build gate na skill para não repetir |
| three.js inflando bundle global | MEDIUM | Isolar em `dynamic ssr:false`; confirmar chunk de rota; adicionar poster |
| SEO ruim de blog já indexado | HIGH | Corrigir metadata/canonical/sitemap; re-submeter Search Console; esperar re-crawl (semanas) |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Bundle bloat multi-lib (P1) | Fundação de animação | first-load JS < budget no build report |
| Reduced-motion ignorado por JS (P2) | Fundação de animação | Toggle reduced-motion no DevTools para todas as animações JS |
| three.js / RSC (P3) | Fase three.js (com spike) | Build report (chunk por rota), sem hydration error, mobile OK |
| LGPD sem consentimento (P4) | Fase LGPD/legal (antes do tracking real) | Network limpo antes de "aceitar"; política publicada |
| SEO autossabotado (P5) | Fase blog (MDX+SEO juntos) | Lighthouse SEO 100, CLS<0.1, Rich Results válido, sitemap completo |
| Cinza #7f7f7f sobre branco (P6) | Redesign/design system | axe/Lighthouse a11y em seções claras e escuras |
| MDX App Router (P7) | Fase blog (fundação) | Frontmatter parseado, RSC default, build estável |
| Skill MDX quebra build/SEO (P8) | Fase skill de blog | Lint+build gate na skill; schema de frontmatter |

## Sources

- WCAG 2.1 contrast — cálculo próprio dos ratios de `#000`/`#fff`/`#7f7f7f` (luminância relativa): #7f7f7f sobre preto = 5.24:1 (passa AA normal), sobre branco = 4.0:1 (falha AA normal). HIGH.
- [gsap.matchMedia() — GSAP Docs](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/) e [ScrollTrigger.matchMedia + prefers-reduced-motion — GSAP forum](https://gsap.com/community/forums/topic/27141-scrolltriggermatchmedia-and-prefers-reduced-motion/). HIGH.
- [React Three Fiber — Installation (R3F v9, React 19/Next, transpilePackages)](https://r3f.docs.pmnd.rs/getting-started/installation) e [pmndrs/react-three-next starter](https://github.com/pmndrs/react-three-next). HIGH.
- [Three.js with Next.js Integration Guide](https://threejsresources.com/frameworks/three-js-nextjs) — padrão `dynamic ssr:false`. MEDIUM.
- [Respecting Users' Motion Preferences — Smashing Magazine](https://www.smashingmagazine.com/2021/10/respecting-users-motion-preferences/) e [Empathetic Animation — CSS-Tricks](https://css-tricks.com/empathetic-animation/). MEDIUM.
- `.planning/codebase/CONCERNS.md` e `TESTING.md` (2026-05-31) — estado atual: opt-in por env sem consentimento, og:image ausente, metadataBase placeholder, MDX instalado/não-usado, Reveal/AnimatedCounter dependem só do CSS override, zero testes. HIGH.
- LGPD (Lei 13.709/2018) — exigência de consentimento explícito para tratamento de dados pessoais (conhecimento de domínio). MEDIUM.

---
*Pitfalls research for: redesign editorial + blog SEO + animação multi-lib + LGPD em Next.js 16 App Router monocromático*
*Researched: 2026-05-31*
