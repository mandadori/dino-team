# Estilo `_rascunho` — Carrossel

## Conceito visual

Carrossel narrativo de **trajetória e autoridade** — foto full bleed do Ramon como palco, com gradient escuro cobrindo a metade inferior para dar legibilidade a um texto editorial denso. Na capa e no CTA, a logo DINO e o título formam um bloco único ancorado no rodapé, com a logo imediatamente acima do título. Nos slides de corpo, a logo fica centralizada no topo sozinha. A narrativa progride do gancho (capa) ao desenvolvimento (corpo) ao chamado (cta), como um ensaio fotográfico de revista de elite.

DNA editorial: cinematográfico, sério, sem ornamentos — a força vem da foto + tipografia Anton em escala grande + silêncio no terço superior do frame. Zero cores de acento: paleta exclusivamente preto/branco/cinza.

---

## Estrutura

Sequência de **N+2 slides** (1 capa + N slides de corpo + 1 cta). Em todos os slides: barra de progresso inferior (3px) com fill proporcional à posição.

### Bloco `capa`

- **Classe HTML / variante visual:** `slide capa`
- **Função editorial:** Gancho — nomeia o tema da narrativa com peso máximo.
- **Tom:** declarativo, impactante — uma afirmação ou título que provoca curiosidade.
- **O que entregar:** bloco `.title-block` ancorado no rodapé (v-bottom, `bottom: 200px`), contendo: logo DINO (`.logo-img`, `margin-bottom: 32px`) imediatamente acima do título Anton grande (~140px, até 4–5 palavras / até 2 linhas); swipe cue com texto "ARRASTE" + chevron SVG abaixo do título. A logo faz parte do bloco — não flutua no topo.
- **Inputs visuais:** foto do Ramon como background com `data-bg-drop="photo"` + gradient overlay denso.

### Blocos `corpo` (slides 2 a N)

- **Classe HTML / variante visual:** `slide corpo`
- **Função editorial:** Desenvolvimento — cada slide aprofunda um capítulo da narrativa.
- **Tom:** editorial, direto — eyebrow de contexto + headline de impacto + parágrafo curto de desenvolvimento.
- **O que entregar:** logo DINO centralizada no topo (`.logo-center`); área de conteúdo na zona inferior (ancorada em `bottom: 150px`) com eyebrow (Montserrat 13px), headline (Anton ~88px, até 2 linhas) e parágrafo (Montserrat ~26px weight 300, line-height 1.35, 4–6 linhas / ~200–280 caracteres); swipe cue no rodapé. **Sem pill/tag de tópico.** O gradient overlay começa mais alto (escurece a partir de ~24% e cobre densamente a metade inferior) para dar contraste ao parágrafo denso sem invadir o silêncio do terço superior.
- **Inputs visuais:** foto do Ramon como background com `data-bg-drop="photo"` + mesmo gradient overlay.

### Bloco `cta` (slide final)

- **Classe HTML / variante visual:** `slide cta`
- **Função editorial:** Chamado — converte a atenção gerada pela narrativa em ação.
- **Tom:** afirmativo, direto ao ponto — headline de ação + sub-texto de endereçamento.
- **O que entregar:** bloco `.title-block` ancorado no rodapé (v-bottom, mesmo padrão da capa), contendo: logo DINO (`.logo-img`, `margin-bottom: 32px`) imediatamente acima do título Anton grande (~140px); sub-texto Montserrat 28px abaixo do título. **Sem swipe cue** (último slide, não arrasta).
- **Inputs visuais:** foto do Ramon como background com `data-bg-drop="photo"` (ou `background: #000` se não houver foto) + mesmo gradient overlay (ou fundo sólido preto).

---

## Quando usar

- Temas **narrativos e de trajetória** — origem, processo, conquista, bastidores.
- Conteúdo de **autoridade** — quem é Ramon, de onde veio, o que prova.
- Posts de **bastidor e humanização** da marca — sem perder o peso visual de elite.
- **Pilares:** Autoridade, Trajetória, Mentalidade, Inspiração.
- Funciona bem com fotos de **retrato, palco ou bastidor** — enquadramentos onde o rosto ou corpo do atleta domina o terço superior.

## Quando NÃO usar

- Temas **instrutivos com prescrição técnica** (séries, reps, exercícios) → usar `treino-dino`.
- Posts onde **não há foto disponível** — o estilo depende de foto full bleed para funcionar.
- Conteúdo **curto de um único ponto** que não justifica progressão narrativa em múltiplos slides.
- Temas que precisam de **layout dividido** com comparações lado a lado → usar `layout-dividido`.

---

## Variantes visuais

Trocar a classe da `<section class="slide ...">`:

- `slide capa` — slide 1: foto full bleed + gradient + bloco v-bottom (logo + título Anton 140px + swipe cue).
- `slide corpo` — slides intermediários: foto full bleed + gradient + logo centrada no topo + área editorial inferior (sem pill/tag).
- `slide cta` — slide final: foto ou fundo preto + gradient/sólido + bloco v-bottom (logo + título Anton 140px + sub Montserrat 28px). Sem swipe cue.

---

## Tokens visuais

| Token | Valor |
|---|---|
| Gradient overlay | `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 24%, rgba(0,0,0,0.95) 66%, rgba(0,0,0,1) 100%)` |
| Padding padrão | `80px` |
| Logo height | `36px` |
| Logo no corpo | centralizada horizontalmente, topo + padding (`top: 80px`) via `.logo-center` |
| Logo na capa / CTA | dentro do `.title-block`, acima do título, `margin-bottom: 32px` |
| Título capa | Anton ~140px, line-height 0.9, CAIXA ALTA, sem sombra |
| Eyebrow corpo | Montserrat 13px, letter-spacing 0.22em, rgba(255,255,255,0.6), CAIXA ALTA |
| Headline corpo | Anton ~88px, line-height 0.92, branco, CAIXA ALTA, sem sombra |
| Parágrafo corpo | Montserrat ~26px, weight 300, line-height 1.35, rgba(255,255,255,0.82), CAIXA ALTA, 4–6 linhas / ~200–280 caracteres, `max-width: 920px` |
| Área editorial corpo | `.content-area` ancorada em `bottom: 150px` (zona inferior ampliada para acomodar parágrafo denso) |
| CTA headline | Anton ~140px, line-height 0.9, CAIXA ALTA, sem sombra |
| CTA sub | Montserrat 28px, weight 500, rgba(255,255,255,0.75), CAIXA ALTA |
| Swipe cue | Montserrat 26px, weight 300, "ARRASTE" + chevron SVG `<path d="M9 6l6 6-6 6">` |
| Barra de progresso | 3px, track rgba(255,255,255,.22), fill #fff |
| Sombras | Nenhuma — sem `text-shadow`, `box-shadow` nem `filter: drop-shadow` em nenhum elemento |
