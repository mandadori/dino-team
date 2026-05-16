# Estilo `padrao` — Carrossel

## Conceito visual

Leiaute tipográfico minimalista, fundo preto sólido, tipografia Anton dominante em CAIXA ALTA. Sem fotos de fundo. Hierarquia construída exclusivamente por escala tipográfica e espaçamento.

Variantes internas:
- **`capa`** — título grande na parte inferior, eyebrow superior com pilar/categoria, footer com marca + indicador de página.
- **`corpo`** — conteúdo centralizado vertical, gap generoso entre elementos.
- **`cta`** — fundo invertido (branco), texto centralizado, máxima ênfase.

## Quando usar

- Tema **conceitual / filosófico** (mentalidade, disciplina, filosofia estoica) — funciona bem só com tipografia.
- Quando **não há material fotográfico** disponível ou pertinente.
- Posts de **autoridade / posicionamento** — sobriedade tipográfica reforça seriedade.
- Quando o objetivo é fazer o leitor parar e ler o texto, não absorver imagem.

## Quando NÃO usar

- Temas que **pedem prova visual** (antes/depois, treino demonstrado, momento de competição) — esse estilo não acomoda fotos.
- Quando o conteúdo é **muito longo** por slide — esse estilo respira melhor com texto enxuto (máx 40 palavras por corpo).
- Posts onde **a marca Ramon Dino visual** (rosto, físico, presença) é a mensagem — falta espaço pra ela aqui.

## Variações

Trocar a classe da `<section class="slide ...">`:
- `slide capa`
- `slide corpo`
- `slide cta`

## Notas

Este é o estilo **base/fallback**. Quando a pipeline não encontra estilo melhor, cai aqui. Mantenha-o sempre funcional.
