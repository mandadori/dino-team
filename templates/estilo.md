# Esqueleto canônico de `estilo.md`

> Contrato que todo `estilo.md` deve cumprir.
> Lido inline pela skill `/novo-estilo` e por `/novo-post` (modo ad-hoc).
> Copie as seções, substitua o conteúdo entre `{...}`, remova o que não se aplica.

---

## Princípio

**O `estilo.md` declara apenas o que é próprio do estilo.**

- **Tokens da marca** (Anton, Montserrat, paleta, CAIXA ALTA, 80px) vivem em `brand/referencias-visuais.md`. Nunca re-declare.
- **Chrome** (swipe-cue, barra-progresso, tag-tópico, logo, watermark) tem spec visual em `brand/social-media.md`. O estilo declara só presença + posição nos `[slots]`.
- **`[tokens]`** = somente valores que **desviam** do padrão de marca. Se ficaria vazio — omita o campo.
- **Papéis, não números.** A quantidade de slides do corpo vem da copy (bloco N-dinâmico). Nunca hardcodar "10 slides" ou qualquer número fixo de instâncias do corpo.
- **Pasta do estilo contém apenas `estilo.md` + `slide.html`** (ou `frame.html` para stories). `preview.html` não é gerado — preview = abrir `slide.html` no Live Preview do VS Code ou no Dino Editor.

---

## Cabeçalho

```
# Estilo <slug-em-kebab-case> — <formato>
```

---

## Seções obrigatórias

### `## Conceito`

2-3 frases de DNA editorial + visual. Responde: como o estilo se parece e qual o mood dominante.

### `## Estrutura`

Abre com metadados da sequência:

```
[sequência]: <bloco>(N, obrigatório) → <bloco>(1..N, flexível) → <bloco>(1, obrigatório)
[total]: min <X> | max <Y>
```

Seguido dos blocos:

```
### bloco: <id> — <nome-curto>
[instâncias]: 1 | N-dinâmico (fonte: copy → <bloco>) | 0..N-opcional

#### visual
[classe]: <nome-da-classe-css>
[bg]: foto(drop:<nome>) | foto(drop:<a>) + foto(drop:<b>) | cor(#hex) | gradiente(<spec>) | chroma(#hex) | nenhum
[overlay]: gradiente-escuro-base | gradiente-escuro-topo | filtro(<css>) | nenhum
[layout]: <custom>                ← omitir se full-bleed padrão
[alternância]: <regra de variação par/ímpar>   ← opcional; só em bloco N-dinâmico que varia layout/fundo por posição
  Ex: bg #000 ↔ #fff (ímpar/par); layout texto-esquerda ↔ texto-direita
[slots]:
  <nome>: <font/size se conteúdo> | <posição> | <alinhamento>
[tokens]: <delta1>; <delta2>      ← omitir se vazio

#### editorial
[função]: hook | contexto | desenvolvimento | virada | instrução-técnica | prova | CTA | fechamento
[tom]: <1 frase de modulação dentro do tom da marca>
[entregar]:
  <nome>: max <N> palavras        ← sufixo ? = opcional (ex: eyebrow?: max 4 palavras)
[ab]: <slots com variação A/B> | não
```

**`[alternância]` — regra de variação par/ímpar:** campo opcional, usado apenas em blocos N-dinâmico que alternam layout ou fundo de slide para slide. O designer inline aplica a variante conforme a posição do slide na sequência do corpo: ímpar recebe a variante A, par recebe a variante B. Garante ritmo visual sem hardcodar número de slides — a quantidade de instâncias vem da copy, não do estilo.

**Regras dos slots:**
- **Chrome** (`logo`, `tag-tópico`, `swipe-cue`, `barra-progresso`, `watermark`): declara só `posição`. Visual herdado de `brand/social-media.md`.
- **Conteúdo** (`título`, `corpo`, `lista`, etc.): declara `font/size | posição | alinhamento`.
- Slot em `[entregar]` → carrega copy. Slot só em `[slots]` visual → chrome puro.
- Para layouts divididos: `[bg]` usa notação `foto(drop: a) + foto(drop: b)`.

### `## Quando usar`

3-6 bullets de temas/contextos/pilares.

Campo opcional: `[requer]: <restrição prática>` (ex: `2 fotos por slide`)

### `## Quando NÃO usar`

3-6 bullets de anti-padrões editoriais.

---

## Seções condicionais

### `## Inputs obrigatórios externos`

Quando o estilo exige dado externo. Declarar: tipo, formato esperado, quem produz quando o usuário não fornece.

### `## Notas técnicas`

Comportamentos não-óbvios do template HTML. Bullets curtos.

---

## O que NÃO mora aqui

- `## Variantes visuais` → substituído por `[classe]` em cada bloco
- `## Cores adicionais / Tokens` global → substituído por `[tokens]` por bloco
- `## Conceito visual` longo → substituído por `## Conceito` (2-3 frases)
- Qualquer token que já está em `brand/referencias-visuais.md`
- Spec visual de chrome → vive em `brand/social-media.md`

---

## Checklist de validação

- [ ] `## Conceito` com 2-3 frases de DNA.
- [ ] `[sequência]` + `[total]` presentes.
- [ ] Cada bloco tem `[classe]`, `[bg]`, `[slots]`, `[função]`, `[tom]`, `[entregar]`, `[ab]`.
- [ ] Bloco N-dinâmico com variação de layout/fundo usa `[alternância]` em vez de hardcodar posições.
- [ ] Nenhum bloco hardcoda número fixo de slides (quantidade vem da copy).
- [ ] Nenhum token de marca re-declarado (Anton/Montserrat/paleta/80px/CAIXA ALTA).
- [ ] Chrome slots declaram só posição.
- [ ] `## Quando usar` e `## Quando NÃO usar` presentes.
- [ ] Seções condicionais incluídas só quando aplicáveis.
- [ ] Pasta do estilo NÃO contém `preview.html`.
