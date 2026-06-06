# Estilo `editorial` — Carrossel

## Conceito

Carrossel narrativo de trajetória e autoridade: foto full-bleed do Ramon como palco, gradient escuro cobrindo a metade inferior para dar legibilidade a um texto editorial denso. DNA cinematográfico, sério, sem ornamentos — a força vem da foto + Anton em escala grande + silêncio no terço superior. Progride do gancho (capa) ao desenvolvimento (corpo) ao chamado (cta), como um ensaio fotográfico de revista de elite.

## Estrutura

[sequência]: capa(1, obrigatório) → corpo(1..N, flexível) → cta(1, obrigatório)
[total]: min 3 | max sem limite

### bloco: capa
[instâncias]: 1

#### visual
[classe]: slide capa
[bg]: foto(drop: photo)
[overlay]: gradiente-escuro-base
[layout]: title-block ancorado v-bottom (bottom 110px) — logo acima do título, centralizado
[slots]:
  logo: largura 100px | posição rodapé-centro
  título: Anton ~140px | rodapé-centro | centralizado
  swipe-cue: posição rodapé-centro
[tokens]: título Anton ~140px; logo largura 100px

#### editorial
[função]: hook
[tom]: declarativo, impactante — uma afirmação que provoca curiosidade
[entregar]:
  título: max 5 palavras
[ab]: título

---

### bloco: corpo
[instâncias]: N-dinâmico (fonte: copy → capítulos da narrativa)

#### visual
[classe]: slide corpo
[bg]: foto(drop: photo)
[overlay]: gradiente-escuro-base
[layout]: content-area na zona inferior (bottom 90px); logo centrada no topo
[slots]:
  logo: largura 100px | posição topo-centro
  eyebrow: Montserrat 13px | acima da headline | esquerdo
  headline: Anton ~88px | zona-inferior | esquerdo
  corpo: Montserrat 300 ~30px | abaixo da headline | esquerdo
[tokens]: headline Anton ~88px; corpo Montserrat 300 ~30px line-height 1.4; logo largura 100px

#### editorial
[função]: desenvolvimento
[tom]: editorial, direto — contexto + impacto + desenvolvimento curto
[entregar]:
  eyebrow?: max 5 palavras
  headline: max 4 palavras
  corpo: max 45 palavras
[ab]: headline

---

### bloco: cta
[instâncias]: 1

#### visual
[classe]: slide cta
[bg]: foto(drop: photo) | cor(#000)
[overlay]: gradiente-escuro-base
[layout]: title-block ancorado v-bottom (bottom 130px) — logo acima do título, centralizado; sem swipe-cue
[slots]:
  logo: largura 100px | posição rodapé-centro
  título: Anton ~140px | rodapé-centro | centralizado
  sub: Montserrat 28px | abaixo do título | centralizado
[tokens]: título Anton ~140px; sub Montserrat 28px; logo largura 100px

#### editorial
[função]: CTA
[tom]: afirmativo, direto ao ponto — headline de ação + sub de endereçamento
[entregar]:
  título: max 5 palavras
  sub: max 4 palavras
[ab]: título

## Quando usar

- Temas narrativos e de trajetória — origem, processo, conquista, bastidores.
- Conteúdo de prova de autoridade — quem é o Ramon, de onde veio, o que prova (como princípio universal, não biografia em 1ª pessoa).
- Posts de bastidor e humanização da marca, sem perder o peso visual de elite.
- Pilares: Prova viva, Mentalidade.

[requer]: foto full-bleed (retrato, palco ou bastidor) com rosto/corpo do atleta dominando o terço superior.

## Quando NÃO usar

- Temas instrutivos com prescrição técnica (séries, reps, exercícios) → usar `treino-dino`.
- Posts sem foto disponível — o estilo depende de foto full-bleed.
- Conteúdo curto de um único ponto que não justifica progressão narrativa.
- Comparações lado a lado → usar `layout-dividido`.

## Notas técnicas

- Logo: largura fixa de **100px** (`width: 100px; height: auto`) em todos os blocos.
- Capa e CTA: logo + título agrupados no `.title-block` ancorado no rodapé (logo acima do título). Não usar `.logo-center` separado nesses dois blocos.
- Corpo: logo centralizada no topo via `.logo-center`. Sem pill/tag de tópico e sem swipe-cue.
- Swipe-cue: **apenas na capa** (primeiro slide). Corpo e CTA não têm swipe. Seta = chevron preenchido via `::after`/mask (data-URI SVG canônico em `brand/social-media.md`). Sem `<svg>` no DOM. Texto "ARRASTE" autorado em maiúsculas (sem `text-transform`).
- Sem barra de progresso — removida do estilo.
- CTA sem foto: trocar `.slide-bg.placeholder` por `background: #000`.
- Sem sombras — nenhum `text-shadow`, `box-shadow` ou `drop-shadow`.
- **Caixa:** Anton (títulos) sempre CAIXA ALTA. Montserrat (eyebrow, corpo, cta-sub) caixa livre — a copy decide. Sem `text-transform` nos slots Montserrat.
