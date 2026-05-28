# Estilo `layout-dividido` — Carrossel

## Conceito visual

Slide dividido em **duas metades horizontais exatas (50/50 da altura — 675px cada)**, cada uma com sua própria fotografia de fundo independente e uma frase em Anton CAIXA ALTA centralizada (horizontal e verticalmente) sobreposta à foto.

A narrativa é binária e cinematográfica: **tensão em cima, resolução embaixo**.
- **Metade superior**: ponto de vista limitante, percepção comum, obstáculo, reclamação. Tom "negativo". Frase termina em reticências (`...`). Foto tratada com leve dessaturação para reforçar o peso emocional.
- **Metade inferior**: a virada — verdade, perspectiva correta, porquê vale a pena. Frase geralmente começa com "MAS" ou "ATÉ" e termina em ponto final (`.`). Foto preservada em cor e contraste, dando energia.

A tipografia é o protagonista absoluto. Anton em topo e base no mesmo peso visual, branca, sem `text-shadow` — o tratamento das fotos (filtros + overlay natural) cuida da legibilidade. **Font-size padrão: 90px; pode ser reduzido para acomodar frases mais longas, desde que o texto ocupe no máximo 2–3 linhas por metade.** Frases curtas (1–2 linhas) e longas (2–3 linhas) são ambas válidas: curtas maximizam impacto visual; longas permitem ensinamento e profundidade filosófica. Stamp pequeno `DINO TEAM` em Montserrat tracking aberto no rodapé inferior, decorativo.

Sem barra de progresso, sem swipe cue, sem tag de tópico, sem watermark, sem logo. **Minimalismo agressivo.**

DNA editorial: pílula filosófica binária. Cada slide é uma microvirada — tensão e resolução no mesmo frame.

---

## Estrutura

Sequência **flexível** de **3 a 7 slides**:
- **Primeiro slide:** capa obrigatória (`slide capa`).
- **Último slide:** CTA obrigatório (`slide cta`).
- **Slides intermediários:** todos `slide dividido`, na sequência narrativa que o ângulo pedir.

### Bloco `capa` (primeiro slide, obrigatório)

- **Classe HTML / variante visual:** `slide capa`
- **Função editorial:** hook — introduz o tema com promessa ou provocação binária.
- **Tom:** anunciativo + provocador. Estabelece a tensão que o post vai resolver.
- **O que entregar:** 2 frases — uma na metade superior (introduz tema/contexto), outra na metade inferior (promessa ou angulo do post). Pode dispensar a regra `...` / `.` se a capa precisar de outro fechamento. Limite: máx 2–3 linhas por metade.
- **Variações A/B:** sim — A e B para as duas frases da capa.
- **Inputs visuais:** 2 fotos — uma na zona `data-bg-drop="topo"`, outra em `data-bg-drop="base"`.

### Blocos `dividido-1..N` (intermediários, flexíveis)

- **Classe HTML / variante visual:** `slide dividido`
- **Função editorial:** desenvolvimento + virada — cada slide é um par tensão→resolução autocontido.
- **Tom:** topo = limitante / queixoso / percepção comum; base = verdade / perspectiva correta / porquê vale a pena. Base geralmente começa com "MAS" ou "ATÉ".
- **O que entregar:** 2 frases por slide — topo termina em `...`, base termina em `.`. Mesmo peso tipográfico em ambas. Limite: máx 2–3 linhas por metade. Frases curtas (1–2 linhas) maximizam impacto; longas permitem profundidade.
- **Variações A/B:** não. Pares topo/base derivam direto do ângulo do briefing.
- **Inputs visuais:** 2 fotos por slide — `data-bg-drop="topo"` (filtrada P&B) + `data-bg-drop="base"` (cor preservada).

### Bloco `cta` (último slide, obrigatório)

- **Classe HTML / variante visual:** `slide cta`
- **Função editorial:** CTA específico — chamada ligada ao conteúdo do post, nunca genérica.
- **Tom:** afirmativo, marca-DNA. Direção, não pressão.
- **O que entregar:** 1 frase de tensão na metade superior (sobre foto, termina em `...`) + 1 CTA na metade inferior (sobre preto sólido, Anton centralizado). Eyebrow opcional em Montserrat (classe `.cta-eyebrow`) acima do CTA. Limite: máx 2 linhas no topo, CTA com até 6 palavras.
- **Variações A/B:** sim — A e B no CTA.
- **Inputs visuais:** 1 foto somente na metade superior (`data-bg-drop="topo"`). Metade inferior é preto sólido, sem drop zone.

---

## Quando usar

- Posts de **mindset / mentalidade** com virada narrativa forte.
- **Mitos vs. verdades** — desconstruir uma crença comum.
- **Antes/depois conceitual** — não temporal, mas de perspectiva.
- **Percepção limitante vs. perspectiva correta** — ex: "É chato... mas funciona."
- Conteúdos onde **cada slide é uma pílula filosófica de duas linhas**.
- Quando há **bom material fotográfico** do Ramon e/ou do contexto (treino, palco, bastidor).

## Quando NÃO usar

- Posts **didáticos com muitos passos** — o formato só comporta duas frases curtas.
- Posts que precisam de **listas, séries, repetições, números** detalhados.
- **Treino estruturado** — vai pro estilo `treino-dino`.
- Conteúdo **denso em informação** — não cabe.
- Quando não há **fotos com qualidade** para preencher as duas metades — o estilo depende delas.

---

## Variantes visuais

Trocar a classe da `<section class="slide ...">`:

- **`slide capa`** — mesma estrutura 50/50, com texto que introduz o tema (em vez do par tensão/resolução). Útil quando o primeiro slide precisa anunciar o assunto.
- **`slide dividido`** — variante principal. Frase superior em tom de tensão terminando em `...`; frase inferior em tom de verdade terminando em `.`. Esta é a "alma" do estilo.
- **`slide cta`** — quebra parcial: metade superior mantém foto + frase; metade inferior vira **preto sólido** (sem foto) com CTA branco Anton centralizado. Eyebrow em Montserrat disponível como elemento opcional via classe `.cta-eyebrow`. Usar apenas no último slide.

---

## Cores adicionais / Tokens

**Nenhuma cor além da paleta da marca.** Apenas preto, branco e cinzas. As fotos contribuem com sua própria gama tonal (B&P na superior, cor preservada na inferior), mas não há nenhuma cor de acento gráfica.

| Token | Valor |
|---|---|
| Font-size frase (padrão) | `90px` Anton — reduzir proporcionalmente se exceder 3 linhas |
| Filtro foto topo | `grayscale(0.85) contrast(1.05)` quando `[data-has-bg]` |
| Filtro foto base | `contrast(1.08) saturate(1.05)` |
| Stamp `DINO TEAM` | Montserrat 14px, `letter-spacing: 0.42em`, 36px do bottom, centralizado |

---

## Notas técnicas

- Texto sempre **branco** (`#FFFFFF`), Anton sem `text-shadow`. Topo e base devem manter o mesmo font-size dentro do mesmo slide para preservar o peso visual 50/50.
- Zonas de drop marcadas como `[data-bg-drop="topo"]` e `[data-bg-drop="base"]` — o wrapper de preview aceita drag-and-drop e reposicionamento por arraste.
- Slide `cta`: metade inferior **não** marca `data-bg-drop` (preto sólido, sem foto).
