# Estilo `layout-dividido` — Carrossel

## Conceito

Slide dividido em duas metades horizontais exatas (50/50 — 675px cada), cada uma com fotografia independente e overlay diferenciado. Narrativa binária cinematográfica: tensão em cima (foto dessaturada), resolução embaixo (cor preservada). DNA editorial: pílula filosófica — cada slide é uma microvirada autocontida.

## Estrutura

[sequência]: capa(1, obrigatório) → dividido(1..N, flexível) → cta(1, obrigatório)
[total]: min 3 | max 7

### bloco: capa
[instâncias]: 1

#### visual
[classe]: slide capa
[bg]: foto(drop: topo) + foto(drop: base)
[layout]: dividido-50-50
[overlay]: filtro(grayscale(0.85) contrast(1.05)) no topo; filtro(contrast(1.08) saturate(1.05)) na base
[slots]:
  título-topo: Anton 90px | metade-topo-centro | centralizado
  título-base: Anton 90px | metade-base-centro | centralizado
  stamp: Montserrat 600 14px (tracking 0.42em) | rodapé-centro | centralizado
[tokens]: título 90px (reduzir proporcionalmente se exceder 3 linhas); stamp Montserrat 14px tracking 0.42em 36px do bottom

#### editorial
[função]: hook
[tom]: anunciativo + provocador. Introduz o tema com tensão binária.
[entregar]:
  título-topo: max 2-3 linhas (introduz tema/contexto)
  título-base: max 2-3 linhas (promessa ou ângulo do post)
[ab]: título-topo, título-base

---

### bloco: dividido
[instâncias]: 1..N (flexível, min 1)

#### visual
[classe]: slide dividido
[bg]: foto(drop: topo) + foto(drop: base)
[layout]: dividido-50-50
[overlay]: filtro(grayscale(0.85) contrast(1.05)) no topo; filtro(contrast(1.08) saturate(1.05)) na base
[slots]:
  título-topo: Anton 90px | metade-topo-centro | centralizado
  título-base: Anton 90px | metade-base-centro | centralizado
  stamp: Montserrat 600 14px (tracking 0.42em) | rodapé-centro | centralizado
[tokens]: título 90px (reduzir proporcionalmente se exceder 3 linhas)

#### editorial
[função]: desenvolvimento + virada
[tom]: topo = limitante/percepção comum, termina em ...; base = verdade/perspectiva correta, começa com MAS ou ATÉ, termina em .
[entregar]:
  título-topo: max 2-3 linhas — termina em ...
  título-base: max 2-3 linhas — começa com MAS ou ATÉ; termina em .
[ab]: não

---

### bloco: cta
[instâncias]: 1

#### visual
[classe]: slide cta
[bg]: foto(drop: topo) + cor(#000000) na base
[layout]: dividido-50-50
[overlay]: filtro(grayscale(0.85) contrast(1.05)) no topo; nenhum na base (preto sólido)
[slots]:
  título-topo: Anton 90px | metade-topo-centro | centralizado
  cta: Anton 90px | metade-base-centro | centralizado
  eyebrow?: Montserrat | acima do cta | centralizado
  stamp: Montserrat 600 14px (tracking 0.42em) | rodapé-centro | centralizado
[tokens]: título 90px; cta Anton 90px max 6 palavras

#### editorial
[função]: CTA
[tom]: afirmativo, marca-DNA. Direção, não pressão.
[entregar]:
  título-topo: max 2 linhas — termina em ...
  cta: max 6 palavras
  eyebrow?: max 4 palavras
[ab]: cta

## Quando usar
[requer]: 2 fotos por slide (topo + base, qualidade editorial)

- Posts de **mindset / mentalidade** com virada narrativa forte.
- **Mitos vs. verdades** — desconstruir uma crença comum.
- **Antes/depois conceitual** — de perspectiva, não temporal.
- Conteúdo onde **cada slide é uma pílula filosófica** de duas linhas.
- Quando há **material fotográfico de qualidade** do Ramon.

## Quando NÃO usar

- Posts **didáticos com muitos passos** — o formato só comporta duas frases curtas.
- Posts com **listas, séries, repetições ou números** detalhados.
- **Treino estruturado** — vai pro estilo `treino-dino`.
- Conteúdo **denso em informação**.
- Quando não há **2 fotos por slide com qualidade suficiente**.

## Notas técnicas

- Texto sempre branco (#FFFFFF), Anton sem text-shadow. Topo e base mantêm o mesmo font-size no mesmo slide.
- Drop zones: `data-bg-drop="topo"` e `data-bg-drop="base"` — o wrapper aceita drag-and-drop e reposicionamento.
- Bloco cta: metade inferior não tem drop zone (preto sólido).
- **Caixa:** Anton (`.half-text`) sempre CAIXA ALTA. Montserrat (stamp, cta-eyebrow) caixa livre — a copy decide. Sem `text-transform` nos slots Montserrat.
