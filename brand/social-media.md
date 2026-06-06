# Convenções de Social Media — Dino Team

> Lido por `designer`, `curador-export`, `revisor-brand`.
> Identidade visual universal (paleta, tipografia, mood) está em `brand/referencias-visuais.md`.
> Este arquivo contém: chrome canônico, aspect-ratios, safe-areas, margens e convenções de overlay.

---

## Aspect-ratios e dimensões

| Formato | Dimensões | Aspect ratio |
|---|---|---|
| Carrossel | 1080 × 1350 | 4:5 |
| Stories | 1080 × 1920 | 9:16 |

---

## Margens e grid

**Carrossel — padding interno:** 80px em todos os lados.
- Conteúdo crítico nunca encosta nas bordas.
- Exceção: imagens de fundo e barras de progresso podem ocupar bleed total (0 → 1080).

**Stories — safe area:** 250px no topo e na base (UI do Instagram sobrepõe essa área).

---

## Chrome canônico

Spec visual completa de cada elemento recorrente. O `estilo.md` declara presença + posição; o visual é herdado daqui. Estilos que não usam um elemento simplesmente não o declaram nos `[slots]`.

### Swipe-cue

- texto: ARRASTE (caixa livre — autorado; sem `text-transform`)
- fonte: Montserrat 300, tracking ~0.04em
- seta: chevron **preenchido** renderizado como pseudo-elemento `::after` via `mask-image` (data-URI SVG). Nunca um `<svg>`/glifo no DOM — assim a seta não é conteúdo editável e nunca é deslocada ao editar o texto.
- proporção: `height` da seta ≈ altura de letra do texto (`.74em`), respiro `gap: .4em` — tudo em em, escala com a fonte.
- cor: herda do texto via `background-color: currentColor` + `mask` (default branco ~0.9 sobre fundo escuro)
- aparece: só na capa (sinaliza continuidade de carrossel)
- posição: definida pelo estilo (default rodapé-centro)
- chevron canônico (mask SVG, viewBox `0 0 12 16`): `path d="M4 1L11 8L4 15L1 15L8 8L1 1Z"` (peso "encorpado", variante C, travado no preview 2026-06-04)

### Barra de progresso

- altura: 3px
- cor: branco translúcido (opacity 0.5) com fill branco sólido (opacity 1.0)
- fill: proporcional à posição do slide na sequência (slide 2 de 5 = 40% fill)
- posição: rodapé, bleed total (ignora padding de 80px), pinned ao bottom

### Tag de tópico

- fonte: Montserrat 600, ~14px, tracking 0.16em (caixa livre — autorada; sem `text-transform`. Labels podem ser escritos em maiúsculas literais)
- cor: branco
- posição: definida pelo estilo (default topo-dir)
- propósito: identifica a categoria do conteúdo (ex: BACK DAY, O TREINO, PRIMEIRO EXERCÍCIO)

### Logo

- arquivo: `assets/logo.png`
- tamanho padrão em posts: largura 100px, altura automática (`width: 100px; height: auto`) — fixo em todos os estilos
- tratamento sobre fundos escuros: drop-shadow sutil para legibilidade (`filter: drop-shadow(0 1px 3px rgba(0,0,0,0.6))`)
- posição: definida pelo estilo (default topo-esq)

### Watermark DINO

- texto: DINO
- fonte: Anton
- opacidade: 5-6% (decorativa, atrás do conteúdo)
- posição: definida pelo estilo

---

## Convenções de overlay em fotos

Quando há texto sobre foto, aplicar overlay para garantir legibilidade.
O campo `[overlay]` do bloco referencia esses nomes.

| Nome | CSS |
|---|---|
| `gradiente-escuro-base` | `linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)` |
| `gradiente-escuro-topo` | `linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 60%)` |
| `gradiente-escuro-global` | `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4))` |

Para `filtro(<css>)` no `[overlay]`: usar CSS direto (ex: `filtro(grayscale(0.85) contrast(1.05))`).

---

## Hierarquia tipográfica em posts

Orientação de tamanhos por tipo de bloco (complementa `brand/referencias-visuais.md`):

- Títulos de capa: Anton 120-180px (estilo declara o valor exato em `[tokens]`)
- Subtítulos / chamadas / tags: Montserrat 300-700 (estilo declara o valor exato em `[tokens]`)
- Chrome (tag de tópico, stamp): Montserrat 600 ~14px, tracking 0.16em (padrão — não re-declarar no estilo). Caixa definida pela copy (sem `text-transform`).
- **Caixa:** Anton (display/títulos) sempre CAIXA ALTA; Montserrat (corpo, subtítulos, labels) caixa livre — a copy decide.

---

## Drop zones de foto

Fotos são sempre inseridas pelo usuário via Claude Design — nunca hardcoded no template.

- `data-bg-drop="<nome>"` no `<section data-slide>` — o wrapper injeta `background-image` via inline style.
- `.slide` base deve ter: `background-size: cover; background-position: center; background-repeat: no-repeat;`
- Filhos usados como host de overlay devem ter `background: transparent`.
- Para layouts divididos (ex: `dividido-50-50`): cada metade tem sua própria drop zone com nome distinto (ex: `topo`, `base`).
