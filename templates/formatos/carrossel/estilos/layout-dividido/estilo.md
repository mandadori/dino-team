# Estilo `_rascunho` (Dividido) — Carrossel

## Conceito visual

Slide dividido em **duas metades horizontais exatas (50/50 da altura — 675px cada)**, cada uma com sua própria fotografia de fundo independente e uma frase em Anton CAIXA ALTA centralizada (horizontal e verticalmente) sobreposta à foto.

A narrativa é binária e cinematográfica: **tensão em cima, resolução embaixo**.
- **Metade superior**: ponto de vista limitante, percepção comum, obstáculo, reclamação. Tom "negativo". Frase termina em reticências (`...`). Foto tratada com leve dessaturação para reforçar o peso emocional.
- **Metade inferior**: a virada — verdade, perspectiva correta, porquê vale a pena. Frase geralmente começa com "MAS" ou "ATÉ" e termina em ponto final (`.`). Foto preservada em cor e contraste, dando energia.

A tipografia é o protagonista absoluto. Anton em topo e base no mesmo peso visual, branca, sem `text-shadow` — o tratamento das fotos (filtros + overlay natural) cuida da legibilidade. **Font-size padrão: 90px; pode ser reduzido para acomodar frases mais longas, desde que o texto ocupe no máximo 2–3 linhas por metade.** Frases curtas (1–2 linhas) e longas (2–3 linhas) são ambas válidas: curtas maximizam impacto visual; longas permitem ensinamento e profundidade filosófica. Stamp pequeno `DINO TEAM` em Montserrat tracking aberto no rodapé inferior, decorativo.

Sem barra de progresso, sem swipe cue, sem tag de tópico, sem watermark, sem logo. **Minimalismo agressivo.**

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

## Variações internas

Trocar a classe da `<section class="slide ...">`:

- **`slide capa`** — mesma estrutura 50/50, com texto que introduz o tema (em vez do par tensão/resolução). Útil quando o primeiro slide precisa anunciar o assunto.
- **`slide dividido`** — variante principal. Frase superior em tom de tensão terminando em `...`; frase inferior em tom de verdade terminando em `.`. Esta é a "alma" do estilo.
- **`slide cta`** — quebra parcial: metade superior mantém foto + frase; metade inferior vira **preto sólido** (sem foto) com CTA branco Anton centralizado. Eyebrow em Montserrat disponível como elemento opcional via classe `.cta-eyebrow` (não incluído no preview default). Usar apenas no último slide.

## Inputs obrigatórios

Para cada slide do post:
- **2 imagens** — uma para a metade superior, uma para a inferior. Resolução mínima recomendada 1080×675 cada (ou superior, com bom enquadramento horizontal).
- **2 frases** — uma para o topo (tensão/afirmação, `...`), uma para a base (resolução/virada, `.`). Frases curtas e longas são ambas válidas. **Regra de layout: máximo 2–3 linhas por metade.** O designer ajusta o font-size (a partir de 90px, reduzindo conforme necessário) para que a frase caiba dentro desse limite de linhas.

Exceção no slide `cta`: apenas **1 imagem** (metade superior) e **1 frase de tensão** + **1 CTA** (em vez da frase de resolução).

## Cores adicionais

**Nenhuma além da paleta da marca.** Apenas preto, branco e cinzas. As fotos contribuem com sua própria gama tonal (B&P na superior, cor preservada na inferior), mas não há nenhuma cor de acento gráfica.

## Notas técnicas

- Texto sempre **branco** (`#FFFFFF`), Anton sem `text-shadow`. Font-size padrão 90px — reduzir proporcionalmente se a frase ocupar mais de 3 linhas. Topo e base devem manter o mesmo font-size dentro do mesmo slide para preservar o peso visual 50/50.
- Foto superior recebe `filter: grayscale(0.85) contrast(1.05)` via CSS quando há imagem dropada (`[data-has-bg]`).
- Foto inferior recebe `filter: contrast(1.08) saturate(1.05)` — preserva cor com leve ganho.
- Zonas de drop marcadas como `[data-bg-drop="topo"]` e `[data-bg-drop="base"]` — o wrapper de preview aceita drag-and-drop e reposicionamento por arraste.
- Stamp `DINO TEAM` em Montserrat 14px, `letter-spacing: 0.42em`, posicionado a 36px do bottom, centralizado.
