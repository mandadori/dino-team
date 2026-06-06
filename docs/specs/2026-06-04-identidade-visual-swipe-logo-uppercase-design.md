# Identidade Visual — Swipe Cue Definitivo + Logo + Uppercase

> Spec de design. Brainstorm em 2026-06-04.
> Frente ② do trabalho de criação de posts. Define o swipe cue definitivo, padroniza a logo, muda a regra de uppercase, e propaga tudo para a verdade canônica (`brand/social-media.md` + `brand/referencias-visuais.md`), os estilos e o `revisor-brand`.

---

## Contexto

`brand/social-media.md` é o **Chrome canônico**: a spec visual completa de cada elemento recorrente (swipe-cue, barra de progresso, tag, logo, watermark) + dimensões, margens e hierarquia tipográfica. O `estilo.md` de cada estilo declara **presença + posição** dos elementos; o **visual é herdado** de `social-media.md`. `brand/referencias-visuais.md` guarda a identidade universal (paleta, fontes, regra de caixa). Os estilos (`templates/social-media/carrossel/estilos/<nome>/slide.html` + `estilo.md`) são autocontidos — cada `slide.html` tem seu próprio `<style>`. O `revisor-brand` valida artefatos contra esses documentos de brand.

Estilos de carrossel hoje: **editorial**, **treino-dino**, **layout-dividido**.

### Estado atual e dores

**Swipe cue** (`social-media.md:32-38` + CSS em editorial/treino-dino):
- Markup: `<div class="swipe-cue"><span>ARRASTE</span><svg.../></div>`; SVG chevron `path M9 6l6 6-6 6` stroke 1.4, viewBox 24×24; CSS `inline-flex; gap:10px; svg{height:0.72em}`.
- **Dor 1 — seta curta demais:** viewBox 24×24 com o chevron ocupando só x9–15/y6–18 (muita margem interna). Com `height:0.72em` na *caixa*, o chevron visível fica ~0.36em — bem menor que a altura de letra (~0.7em).
- **Dor 2 — respiro fixo:** `gap:10px` em px não escala com a fonte.
- **Dor 3 — seta acoplada ao texto:** o SVG é filho do `.swipe-cue`, que o editor trata como texto; editar via contenteditable desloca/perde a seta.
- A referência do usuário (screenshot) é um **chevron preenchido/sólido, encorpado**, com altura ≈ altura de letra do texto — diferente do traço fino atual.

**Logo** (`social-media.md:54-59`): doc canônico diz "altura padrão ~32px", mas os estilos usam `width:100px`. Conflito — a verdade canônica está defasada.

**Uppercase** (`referencias-visuais.md:37-40`): "Regra absoluta: todo texto em peças é CAIXA ALTA". Os estilos forçam `text-transform:uppercase` em quase todo elemento. O usuário quer caixa alta só onde a fonte é Anton.

## Decisões (brainstorm 2026-06-04)

| # | Decisão | Escolha |
|---|---------|---------|
| D1 | Construção da seta do swipe cue | **SVG de chevron preenchido entregue como pseudo-elemento `::after`** (via `mask-image`, data-URI), `height` em em, gap em em, cor herda (`currentColor`) |
| D2 | Regra de uppercase | **Por fonte:** Anton (display/títulos) sempre CAIXA ALTA; Montserrat (corpo/sub/labels/swipe) caixa livre — a copy decide |
| D3 | Logo | **Fixa 100px** (`width:100px; height:auto`) em todo estilo que tem logo; reconcilia o "~32px" defasado |
| D4 | Verdade canônica | Spec de elementos + swipe-cue + logo em **`brand/social-media.md`**; regra global de caixa em **`brand/referencias-visuais.md`** |

---

## Arquitetura da solução

### A. Swipe cue definitivo (D1)

**Markup enxuto** (editorial e treino-dino — layout-dividido não tem swipe):
```html
<div class="swipe-cue" data-slot="swipe-cue">ARRASTE</div>
```
A seta sai do DOM e vira pseudo-elemento. O texto "ARRASTE" é o único conteúdo editável.

**CSS por estilo** (cada `slide.html` traz a mesma spec; herda de `social-media.md`):
```css
.swipe-cue {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  font-family: var(--font-body);   /* Montserrat */
  font-weight: 300;
  letter-spacing: .04em;
  color: rgba(255,255,255,.9);
}
.swipe-cue::after {
  content: "";
  display: inline-block;
  width: .60em;
  height: .74em;                    /* altura ≈ altura de letra do texto */
  background-color: currentColor;   /* a seta herda a cor do texto */
  -webkit-mask: url("data:image/svg+xml,<SVG>") no-repeat center / contain;
          mask: url("data:image/svg+xml,<SVG>") no-repeat center / contain;
}
```
onde `<SVG>` é (URL-encoded na implementação) um chevron **preenchido**, ponto de partida a afinar no preview:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 16"><path d="M3 1 L10 8 L3 15 L0 15 L7 8 L0 1 Z" fill="black"/></svg>
```

**Propriedades garantidas:**
- **Replica o screenshot** — chevron preenchido; peso/ângulo afinados no `path` contra a referência.
- **Desacoplado** — sendo `::after`, editar/trocar o texto nunca move nem apaga a seta (também elimina a Dor 3 no editor).
- **Proporcional** — `height` e `gap` em em escalam com a fonte; altura casada com a altura de letra.
- **Cor herda** — `currentColor` + `mask`, então segue a cor do texto em qualquer estilo/fundo.

**Preview de afinação:** na implementação, gerar um HTML de preview do swipe cue (em fundo escuro, em 2-3 tamanhos) pra o usuário travar o peso/ângulo exatos do chevron antes de propagar.

### B. Uppercase por fonte (D2)

- **`referencias-visuais.md` § Tipografia:** trocar a "Regra absoluta: todo texto CAIXA ALTA" por: **"Anton (display/títulos) sempre em CAIXA ALTA; Montserrat (corpo, subtítulos, labels) em caixa livre — definida pela copy. Sem `text-transform` forçado em Montserrat."**
- **Estilos:** remover `text-transform: uppercase` de todo elemento Montserrat (corpo, sub, headline-Montserrat, swipe, pill/tag); manter `text-transform: uppercase` **apenas** nos elementos Anton (`.big-title` e quaisquer headlines Anton). O mapeamento elemento→fonte é feito por estilo na implementação, lendo cada `slide.html`.
- **Placeholders:** reescrever os placeholders em CAPS dos templates (ex.: `body-text` em editorial) para caixa natural, pra o template já demonstrar a regra nova.
- **Casing literal preservado:** texto autorado em maiúsculas (ex.: "ARRASTE", "BACK DAY") continua aparecendo em maiúsculas — porque é como está escrito, não por `text-transform`.

### C. Logo 100px (D3)

- **`social-media.md` § Logo:** atualizar a spec para **`width: 100px; height: auto`** (substitui "altura padrão ~32px"). Manter o drop-shadow de legibilidade e "posição definida pelo estilo".
- **Estilos:** garantir `width:100px; height:auto` em todo logo. **editorial** já está; **treino-dino** alinhar para 100px. **layout-dividido** não tem logo.

### D. Verdade canônica + propagação (D4)

Ordem de propagação para o `revisor-brand` não acusar drift:

1. **`brand/social-media.md`** (verdade de elementos):
   - § Swipe-cue → reescrever com a spec definitiva (texto "ARRASTE" sem força de caixa; chevron preenchido via `::after`/mask; `height`/`gap` em em; cor herda; aparece só na capa; posição pelo estilo).
   - § Logo → 100px (D3).
   - § Tag de tópico → casing livre (remover "CAIXA ALTA" forçado; default literal preservado).
   - § Hierarquia tipográfica → nota de casing alinhada à regra por-fonte.
2. **`brand/referencias-visuais.md`** § Tipografia → regra de caixa por-fonte (B).
3. **Estilos** (`slide.html` + `estilo.md`):
   - **editorial** e **treino-dino:** swipe cue novo (markup + CSS), logo 100px, remoção de `text-transform` em Montserrat, placeholders em caixa natural.
   - **layout-dividido:** só remoção de `text-transform` em Montserrat + placeholders.
   - `estilo.md` de cada um: atualizar descritores/tokens que citam swipe-cue, logo ou caixa.
4. **`revisor-brand`** (`.claude/agents/revisor-brand.md`): atualizar o conhecimento/checklist de identidade visual para a regra por-fonte (Anton=uppercase, Montserrat=livre), o swipe-cue definitivo e a logo 100px — lendo `social-media.md` + `referencias-visuais.md` como fonte.

## Casos de borda

- **Editor + swipe `::after`:** ao congelar, `.swipe-cue` (tipo texto) tem width pinada; a seta `::after` segue dentro do flex. Editar o texto reflui só o texto; a seta permanece proporcional. Resolve a Dor 3 sem mudança no editor.
- **`mask` no export:** `-webkit-mask` + `mask` (data-URI SVG) renderizam no Chromium do puppeteer (`export-png.js`) e nos browsers. Validar no export de amostra.
- **Texto da swipe trocado:** com casing livre, "ARRASTE" é literal; trocar por outra palavra mantém a seta intacta (pseudo-elemento).
- **Elemento Anton vs Montserrat ambíguo:** se um estilo usa Anton fora de título (raro), a regra por-fonte ainda se aplica (Anton→uppercase). Confirmar no mapeamento por estilo.

## Validação

Estilos são HTML/CSS — sem teste automatizado. Validar por:
- **Preview** do swipe cue (fundo escuro, múltiplos tamanhos) → sign-off do peso/ângulo do chevron.
- **export-png** de uma amostra (editorial e treino-dino) → confirma que `mask` renderiza e a logo/uppercase saem certas no PNG 1080×1350.
- **Sign-off visual** do usuário no browser.
- Passagem no **`revisor-brand`** com as regras atualizadas (sem flag de drift).

## Fora de escopo

- Estilos de stories (se/quando existirem) — só carrossel agora.
- Conteúdo e casing real da copy (decisão da frente ③ — sistema de copy).
- Barra de progresso, watermark, tag (salvo o ajuste de casing da tag) — sem mudança.
- Mudanças no motor do editor (frente ① já tratada).
