# Post Carrossel — Treino de Perna (Leg Day)

**Formato:** carrossel 4:5 (1080×1350)
**Data:** 2026-05-15
**Pilar:** Educacional + Autoridade
**Objetivo:** Construir autoridade técnica via protocolo real de treino de perna; gerar identificação com quem treina mas não evolui por falta de método; converter ao final com CTA direto para a Dino Team.
**Slug:** faca-esse-treino-nao-ande-mais

---

## Resumo executivo

Carrossel de treino de perna no estilo "protocolo do atleta" — apresenta a lista completa e detalha cada exercício individualmente em slides chroma verde, encerrando com uma pergunta-gatilho que converte. Direcionado a quem já treina mas não tem método, o post usa a autoridade técnica de Ramon Dino para mostrar que a sequência e a lógica por trás do treino fazem a diferença. A promessa não é o exercício em si, é a diferença entre treinar por sorte e treinar com método.

## Ângulo central

Protocolo, não treino — cada exercício tem função específica e a ordem determina o resultado.

---

## Slides (copy final)

### Slide 1 — Capa
**Tag:** LEG DAY
**Título:** FAÇA ESSE TREINO E NÃO ANDE MAIS
**Swipe cue:** Arraste →

### Slide 2 — Lista completa do treino
**Tag:** O TREINO

A1. ABDUTORA NA MÁQUINA — 4 SÉRIES  15 · 12 · Ⓕ · Ⓕ
B1. AGACHAMENTO LIVRE — 4 SÉRIES  10 · 8 · 8 · Ⓕ
C1. LEG PRESS 45 — 4 SÉRIES  12 · 10 · Ⓕ · Ⓕ
D1. CADEIRA EXTENSORA — 3 SÉRIES  15 · 12 · Ⓕ
E1. CADEIRA FLEXORA — 3 SÉRIES  12 · 10 · Ⓕ

### Slide 3 — Primeiro Exercício (chroma verde)
**Tag:** PRIMEIRO EXERCÍCIO
A1. ABDUTORA NA MÁQUINA
4 SÉRIES  15 · 12 · Ⓕ · Ⓕ

### Slide 4 — Segundo Exercício (chroma verde)
**Tag:** SEGUNDO EXERCÍCIO
B1. AGACHAMENTO LIVRE
4 SÉRIES  10 · 8 · 8 · Ⓕ

### Slide 5 — Terceiro Exercício (chroma verde)
**Tag:** TERCEIRO EXERCÍCIO
C1. LEG PRESS 45
4 SÉRIES  12 · 10 · Ⓕ · Ⓕ

### Slide 6 — Quarto Exercício (chroma verde)
**Tag:** QUARTO EXERCÍCIO
D1. CADEIRA EXTENSORA
3 SÉRIES  15 · 12 · Ⓕ

### Slide 7 — Quinto Exercício (chroma verde)
**Tag:** QUINTO EXERCÍCIO
E1. CADEIRA FLEXORA
3 SÉRIES  12 · 10 · Ⓕ

### Slide 8 — CTA Final
**Tag:** DIRECIONE SEU ESFORÇO
**Título:** SEU TREINO TEM MÉTODO OU TEM SORTE?
**Subtexto:** ENTRE PARA A DINO TEAM. LINK NA BIO.

---

## Direção visual (resumo)

- **Conceito:** Dois momentos visuais distintos — slides de foto (capa, lista, CTA) com fundo escuro e overlay, e slides de exercício com fundo chroma verde sólido (#00B140), criando ritmo e impacto no feed.
- **Paleta:** preto + branco (slides de foto) / verde chroma #00B140 + branco (slides de exercício)
- **Tipografia:** Anton (títulos e nomes de exercício em CAIXA ALTA) + Montserrat (séries, tags, body)
- **Estilo:** treino-dino — card de exercício no canto inferior esquerdo em chroma verde; topbar com logo à esquerda e tag de tópico à direita; barra de progresso branca na base

Detalhes completos nos arquivos HTML em `design/`.

---

## Arquivos para publicação

PNGs prontos para upload no Instagram em `export/`:

- `slide-1.png` — Capa (116 KB)
- `slide-2.png` — Lista do treino (117 KB)
- `slide-3.png` — Abdutora na Máquina / chroma verde (23 KB)
- `slide-4.png` — Agachamento Livre / chroma verde (26 KB)
- `slide-5.png` — Leg Press 45 / chroma verde (28 KB)
- `slide-6.png` — Cadeira Extensora / chroma verde (31 KB)
- `slide-7.png` — Cadeira Flexora / chroma verde (34 KB)
- `slide-8.png` — CTA Final (108 KB)

---

## Notas finais

- **Foto pendente:** os slides de foto (1, 2 e 8) usam placeholder chroma escuro. Antes de publicar, substituir o fundo pelos ativos de foto do Ramon (pose de treino de pernas ou palco com destaque nos membros inferiores) nos HTMLs em `design/` e re-exportar esses três slides.
- **Slides 3–7 (chroma verde):** prontos para publicação mesmo sem foto — o verde sólido é intencional e faz parte do estilo treino-dino.
- **Símbolo Ⓕ:** preservado corretamente em todos os slides de exercício como U+24BB (falha muscular concêntrica).
- **Correção aplicada no export:** o script `scripts/export-png.js` foi corrigido durante este processo — as `.slide-label` do preview agora são ocultadas antes do screenshot, evitando contaminação visual. A correção vale para todos os posts futuros.
- **Sequência lógica validada:** ativação isolada (abdutora) → compostos dominantes (agachamento, leg press) → isolamento de finalização (extensora, flexora). Sem furos lógicos, sem redundâncias.

---

## Arquivos relacionados

- `pesquisa-base.md` — protocolo técnico usado como insumo (séries, reps e justificativas por exercício)
- `copy.md` — copy final com notas para o Designer
- `design/slide-N.html` — HTMLs standalone (edite no Claude Design web para trocar fotos ou ajustar texto)
- `design/preview.html` — preview consolidado com os 8 slides
- `export/slide-N.png` — imagens finais para publicação no Instagram
