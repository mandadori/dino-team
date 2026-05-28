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

- texto: ARRASTE → (seta U+2192)
- fonte: Montserrat 600, ~14px, tracking 0.16em, CAIXA ALTA
- cor: branco, opacidade 0.8
- aparece: só na capa (sinaliza continuidade de carrossel)
- posição: definida pelo estilo (default rodapé-centro)

### Barra de progresso

- altura: 3px
- cor: branco translúcido (opacity 0.5) com fill branco sólido (opacity 1.0)
- fill: proporcional à posição do slide na sequência (slide 2 de 5 = 40% fill)
- posição: rodapé, bleed total (ignora padding de 80px), pinned ao bottom

### Tag de tópico

- fonte: Montserrat 600, ~14px, tracking 0.16em, CAIXA ALTA
- cor: branco
- posição: definida pelo estilo (default topo-dir)
- propósito: identifica a categoria do conteúdo (ex: BACK DAY, O TREINO, PRIMEIRO EXERCÍCIO)

### Logo

- arquivo: `assets/logo.png`
- altura padrão em posts: ~32px
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
- Chrome (tag de tópico, stamp): Montserrat 600 ~14px, tracking 0.16em (padrão — não re-declarar no estilo)

---

## Drop zones de foto

Fotos são sempre inseridas pelo usuário via Claude Design — nunca hardcoded no template.

- `data-bg-drop="<nome>"` no `<section data-slide>` — o wrapper injeta `background-image` via inline style.
- `.slide` base deve ter: `background-size: cover; background-position: center; background-repeat: no-repeat;`
- Filhos usados como host de overlay devem ter `background: transparent`.
- Para layouts divididos (ex: `dividido-50-50`): cada metade tem sua própria drop zone com nome distinto (ex: `topo`, `base`).
