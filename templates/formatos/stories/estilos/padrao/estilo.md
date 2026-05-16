# Estilo `padrao` — Stories

## Conceito visual

Leiaute tipográfico minimalista 9:16, fundo preto sólido, tipografia Anton dominante. Sem fotos de fundo. Respeita safe area de 250px no topo e na base (UI do Instagram).

Variantes internas:
- **`hook`** — primeiro frame, título gigante alinhado ao topo (após safe area), apoio curto abaixo.
- **`antes-depois`** — frame dividido em 2 colunas, contraste preto/branco entre elas.
- **`cta`** — fundo invertido (branco), texto centralizado.

## Quando usar

- Stories **conceituais / textuais** (insight, citação, frase de impacto) onde o tipográfico carrega tudo.
- Quando você quer **alta legibilidade** sem competir com fundo fotográfico.
- Sequências **rápidas e diretas** (3-4 frames) que vivem só do texto.

## Quando NÃO usar

- Stories de **prova social / treino demonstrado** — pede foto/vídeo de fundo.
- **Antes e depois** com material visual real — use estilo com fotos (a criar).
- Frames que precisam **mostrar produto, físico, momento** — esse estilo é puramente tipográfico.

## Variações

Trocar a classe da `<section class="frame ...">`:
- `frame hook`
- `frame antes-depois` (estrutura tipográfica, sem fotos)
- `frame cta`

## Notas

Estilo **base/fallback**. Respeita safe area de 250px top/bottom — não coloque conteúdo crítico fora dela.
