# Phase 3: Conformidade Legal & LGPD - Context

**Gathered:** 2026-06-01
**Status:** Ready for planning

<domain>
## Phase Boundary

O site fica legalmente apto a coletar dados: os 3 scripts de tracking (GA4, Meta Pixel, Clarity) só disparam após consentimento explícito do visitante via banner de cookie consent, e as páginas /privacidade e /termos existem e são linkadas no footer.

Entrega = LEGAL-01 (Página de Política de Privacidade em /privacidade) + LEGAL-02 (Página de Termos de Uso em /termos) + LEGAL-03 (CookieBanner que condiciona o disparo de TrackingScripts).

**Fora de escopo:** gestão granular de categorias de cookies (analytics vs funcional vs marketing), link de "Gerenciar cookies" no footer, qualquer nova funcionalidade de tracking além dos 3 já existentes.

</domain>

<decisions>
## Implementation Decisions

### Páginas legais (LEGAL-01, LEGAL-02)

- **D-01:** Conteúdo: **rascunho completo gerado** pelo executor — texto jurídico real de Política de Privacidade e Termos de Uso, com os campos identificadores da empresa marcados como `[RAZÃO SOCIAL]`, `[CNPJ]`, `[E-MAIL DO ENCARREGADO DE DADOS]`. O usuário substitui os placeholders quando tiver os dados; não exige refatoração de código.
- **D-02:** Design visual: **editorial da marca** — mesmo header fixo + footer da landing page, fundo preto, tipografia Anton/Montserrat, tokens do design system (`bg-bg`, `text-fg`, `text-muted`, `border-line`). Não criar layout utilitário separado.
- **D-03:** Rotas: `/privacidade` → `app/privacidade/page.tsx` e `/termos` → `app/termos/page.tsx`.
- **D-04:** Links para `/privacidade` e `/termos` adicionados ao `<footer>` existente em `app/page.tsx`.

### Banner de cookie consent (LEGAL-03)

- **D-05:** Posição: **barra inferior full-width**, fixada na base da tela (`position: fixed; bottom: 0`). Não bloqueia conteúdo. Monocromático estrito (fundo `bg-bg` com borda `border-line` no topo).
- **D-06:** Ações: **dois botões explícitos — "Aceitar" e "Recusar"**. O botão Aceitar usa o estilo primário (CTAButton); o Recusar pode ser estilo link ou outline sóbrio para não ter o mesmo peso visual.
- **D-07:** Ao recusar: banner desaparece, tracking **não dispara** naquela sessão nem em futuras (escolha persistida). Não há link de "Gerenciar cookies" no footer — a escolha é definitiva até o consentimento expirar.
- **D-08:** Persistência da escolha: **6 meses** (localStorage ou cookie de primeira parte — decisão técnica delegada ao executor). Banner não reaparece por 6 meses após qualquer escolha.
- **D-09:** O texto do banner inclui **link para `/privacidade`** — o visitante acessa a política antes de consentir (requisito LGPD).

### Escopo do consentimento

- **D-10:** Gatekeados pelo consentimento: **exclusivamente os 3 scripts de tracking** (GA4, Meta Pixel, Clarity) no `TrackingScripts.tsx`. Nenhum outro comportamento do site é afetado pela escolha.
- **D-11:** `TrackingScripts` só é montado/executado quando o estado de consentimento for `true`. Implementação técnica (Context Provider vs prop booleana passada do layout) delegada ao executor.

### Claude's Discretion

- **Implementação técnica do estado de consentimento** — Context Provider em `app/layout.tsx` ou prop booleana; executor escolhe o mais limpo para o padrão RSC/client island do projeto.
- **Mecanismo de persistência** — localStorage (simples, sem acesso server-side necessário) vs cookie de primeira parte; executor decide.
- **Copy exata do banner** — sóbria e direta, dentro do tom de marca (sem "Sua privacidade importa para nós" clichê); executor escreve respeitando `brand/tom-de-voz.md`.
- **Nome do componente** — `CookieBanner.tsx` ou similar em `components/`.
- **Animação do banner** — entrada/saída discreta (fade ou slide-up), respeitando `prefers-reduced-motion`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Marca (identidade visual e tom)
- `brand/brand-book.md` — essência, o que a marca não é; informa a copy do banner e das páginas legais
- `brand/tom-de-voz.md` — sobriedade, anti-espetáculo; copy do banner e das páginas deve seguir o tom
- `brand/referencias-visuais.md` — paleta P&B, tipografia Anton/Montserrat; base do design das páginas legais e do banner

### Requisitos desta fase
- `.planning/REQUIREMENTS.md` §"Conformidade Legal" (LEGAL-01, LEGAL-02, LEGAL-03) — contrato de aceite

### Código existente (leitura obrigatória antes de implementar)
- `site/components/TrackingScripts.tsx` — componente a ser gatekeado; entender a estrutura atual antes de modificar
- `site/app/layout.tsx` — onde TrackingScripts é montado; ponto de integração do estado de consentimento
- `site/app/page.tsx` — onde o footer existente está definido; adicionar links legais aqui
- `site/components/ui/CTAButton.tsx` — reusar para o botão "Aceitar" do banner
- `site/app/globals.css` — tokens disponíveis (`bg-bg`, `bg-surface`, `text-fg`, `text-muted`, `border-line`)

### Mapas do código
- `.planning/codebase/STRUCTURE.md` — onde criar rotas novas (`app/privacidade/`, `app/termos/`), onde ficam componentes
- `.planning/codebase/CONVENTIONS.md` — padrões de nomenclatura, tokens Tailwind, RSC vs client islands

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `site/components/ui/CTAButton.tsx` — botão CTA existente (primary + outline). Usar para o botão "Aceitar" do banner.
- `site/components/Reveal.tsx` — animação de entrada scroll-reveal. **Não aplicar** no banner (banner é fixed, não scroll-driven); animação própria se necessário.
- `site/app/globals.css` — tokens `bg-bg`, `bg-surface`, `border-line`, `text-muted`. O banner usa esses tokens para se manter monocromático.

### Established Patterns
- **RSC por padrão, client island quando há estado.** `CookieBanner` precisa de estado (consentimento) → `"use client"`. As páginas `/privacidade` e `/termos` são RSC puras (sem interatividade).
- **Constantes em `lib/site.ts`.** Se o banner tiver textos ou configuração (ex: duração de 6 meses), centralizá-los ali seguindo o padrão de `WHATSAPP_URL`, `STATS`, etc.
- **Rotas novas = pasta + `page.tsx`** em `app/`. Ver `app/admin/` como referência de estrutura.

### Integration Points
- `app/layout.tsx` é o ponto de integração: monta `TrackingScripts` e precisará montar `CookieBanner` + prover estado de consentimento para ambos.
- `app/page.tsx` footer: adicionar `<Link href="/privacidade">` e `<Link href="/termos">` dentro do `<footer>` existente.
- `TrackingScripts.tsx`: recebe ou lê estado de consentimento; só renderiza os `<Script>` quando `consentGiven === true`.

</code_context>

<specifics>
## Specific Ideas

- O banner linka `/privacidade` no próprio texto (ex: "Usamos cookies de analytics. Veja nossa [Política de Privacidade].").
- Dois botões: "Aceitar" (primário) + "Recusar" (outline/link). Sem terceiro botão de "Configurar".
- As páginas legais herdam o layout visual da landing (header fixo + footer), não são páginas utilitárias brancas.

</specifics>

<deferred>
## Deferred Ideas

- **Link "Gerenciar cookies" no footer** — usuário optou por escolha definitiva sem gestão posterior; fora do escopo desta fase.
- **Categorias granulares de cookies** (analytics / funcional / marketing separados) — complexidade desnecessária no momento; fase 3 cobre apenas o bloco "tracking scripts".
- **Analytics privacy-first (Plausible/Fathom)** como alternativa sem banner — discutido, descartado em favor de manter GA4/Pixel/Clarity com consentimento explícito.

</deferred>

---

*Phase: 03-conformidade-legal-lgpd*
*Context gathered: 2026-06-01*
