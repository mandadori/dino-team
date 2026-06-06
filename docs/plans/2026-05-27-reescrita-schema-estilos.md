# Reescrita do schema de estilos — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar todos os `estilo.md` para schema declarativo campo-a-campo (visual ⟂ editorial), separar `brand/referencias-visuais.md` (universal) de `brand/social-media.md` (novo, canal), renomear `templates/formatos/` → `templates/social-media/`, e propagar as mudanças para todos os contratos e skills.

**Architecture:** `brand/` guarda regras (identidade universal + convenções de canal). `templates/` guarda artefatos (esqueleto + HTML + estilos). Cada bloco em `estilo.md` declara dois sub-grupos: `#### visual` (para o designer) e `#### editorial` (para o copywriter), vinculados pelo nome dos slots. Tokens da marca nunca são re-declarados no estilo — apenas deltas.

**Tech Stack:** Markdown (sem código de runtime). Git (renomear diretório). Leitura+escrita de arquivos via Edit/Write.

**Spec:** `docs/specs/2026-05-27-reescrita-schema-estilos-design.md`

---

## Mapa de arquivos

| Ação | Arquivo |
|---|---|
| **Reescrever** | `templates/estilo.md` |
| **Refatorar** | `brand/referencias-visuais.md` |
| **Criar** | `brand/social-media.md` |
| **Renomear** (git mv) | `templates/formatos/` → `templates/social-media/` |
| **Reescrever** | `templates/social-media/carrossel/estilos/treino-dino/estilo.md` |
| **Reescrever** | `templates/social-media/carrossel/estilos/layout-dividido/estilo.md` |
| **Editar** | `.claude/agents/designer.md` |
| **Editar** | `.claude/agents/curador-export.md` |
| **Editar** | `.claude/agents/revisor-brand.md` |
| **Editar** | `.claude/agents/briefing-writer.md` |
| **Editar** | `.claude/agents/copywriter.md` |
| **Editar** | `.claude/skills/novo-post/SKILL.md` |
| **Editar** | `.claude/skills/novo-estilo/SKILL.md` |
| **Editar** | `.claude/skills/lote-posts/SKILL.md` |

---

## Task 1: Reescrever `templates/estilo.md`

Substituição completa do esqueleto canônico pelo schema novo. Este arquivo é a fonte da verdade do schema — tudo que vier depois o herda.

**Files:**
- Modify: `templates/estilo.md`

- [ ] **Step 1: Sobrescrever com o novo esqueleto canônico**

Conteúdo completo:

```markdown
# Esqueleto canônico de `estilo.md`

> Contrato que todo `estilo.md` deve cumprir.
> Lido pelo `designer` em `/novo-estilo` e em `/novo-post` (modo ad-hoc).
> Copie as seções, substitua o conteúdo entre `{...}`, remova o que não se aplica.

---

## Princípio

**O `estilo.md` declara apenas o que é próprio do estilo.**

- **Tokens da marca** (Anton, Montserrat, paleta, CAIXA ALTA, 80px) vivem em `brand/referencias-visuais.md`. Nunca re-declare.
- **Chrome** (swipe-cue, barra-progresso, tag-tópico, logo, watermark) tem spec visual em `brand/social-media.md`. O estilo declara só presença + posição nos `[slots]`.
- **`[tokens]`** = somente valores que **desviam** do padrão de marca. Se ficaria vazio — omita o campo.

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
[instâncias]: 1 | N-dinâmico (fonte: <arquivo → campo>) | 0..N-opcional

#### visual
[classe]: <nome-da-classe-css>
[bg]: foto(drop:<nome>) | foto(drop:<a>) + foto(drop:<b>) | cor(#hex) | gradiente(<spec>) | chroma(#hex) | nenhum
[overlay]: gradiente-escuro-base | gradiente-escuro-topo | filtro(<css>) | nenhum
[layout]: <custom>                ← omitir se full-bleed padrão
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
- [ ] Nenhum token de marca re-declarado (Anton/Montserrat/paleta/80px/CAIXA ALTA).
- [ ] Chrome slots declaram só posição.
- [ ] `## Quando usar` e `## Quando NÃO usar` presentes.
- [ ] Seções condicionais incluídas só quando aplicáveis.
```

- [ ] **Step 2: Verificar que o arquivo foi gravado corretamente**

```bash
grep -c "\[slots\]\|#### visual\|#### editorial\|## Conceito" "templates/estilo.md"
```

Esperado: ≥ 4 matches (campos centrais do novo schema presentes).

- [ ] **Step 3: Commit**

```bash
git add templates/estilo.md
git commit -m "refactor(schema): reescreve templates/estilo.md com schema declarativo visual/editorial"
```

---

## Task 2: Refatorar `brand/referencias-visuais.md`

Remover tudo que é específico de posts/canal. O arquivo fica com identidade universal pura.

**Files:**
- Modify: `brand/referencias-visuais.md`

**O que REMOVE:**
- `## Margens e grid` (todo o bloco — vai para social-media.md)
- `## Aplicação em carrossel` (todo o bloco — vai para social-media.md)
- `## Aplicação em stories` (todo o bloco — vai para social-media.md)
- Em `## Tipografia`: o sub-bloco "Hierarquia sugerida em carrosséis:" (vai para social-media.md)
- Em `## Elementos gráficos recorrentes`: os bullets de swipe-cue, barra de progresso, tag de tópico, watermark (spec completa vai para social-media.md)
- Em `## Logo`: a frase "posição padrão é topo-esquerdo do slide alinhado a uma tag textual de tópico no topo-direito" (posicionamento em post vai para social-media.md)

**O que PERMANECE (não tocar):**
- `## Logo` (somente: arquivo oficial, uso de drop-shadow, versão para fundo claro)
- `## Paleta de cores`
- `## Tipografia` (exceto hierarquia de carrossel)
- `## Mood / Estilo`
- `## Aplicação de fotografia`
- `## O que evitar`
- `## Pendências de identidade visual`

- [ ] **Step 1: Remover `## Margens e grid`**

Localizar e deletar o bloco completo (linhas com "## Margens e grid" até o próximo `---`):

```
## Margens e grid

**Margem padrão de carrossel:** **80px** em todos os lados.
...
**Stories:** safe area de **250px no topo e na base** ...
```

- [ ] **Step 2: Remover `## Aplicação em carrossel` e `## Aplicação em stories`**

Localizar e deletar os dois blocos completos.

- [ ] **Step 3: Remover hierarquia de carrosséis em Tipografia**

Localizar em `## Tipografia` e deletar:

```
Hierarquia sugerida em carrosséis:
- **Capa e títulos de slide:** Anton, peso visual forte
- **Subtítulos / nomes de exercícios / chamadas:** Montserrat (300/400/600/700)
- **Apoio / créditos / tags de tópico:** Montserrat em tamanho reduzido com letter-spacing aberto
```

- [ ] **Step 4: Substituir `## Elementos gráficos recorrentes` por apontador**

Substituir o conteúdo do bloco:

```markdown
## Elementos gráficos recorrentes

Spec visual completa de cada elemento recorrente (swipe-cue, barra de progresso, tag de tópico, logo em post, watermark) está em `brand/social-media.md`.
```

- [ ] **Step 5: Editar `## Logo` — remover posicionamento de post**

Remover a linha:
```
Quando aparece, posição padrão é **topo-esquerdo do slide** alinhado a uma tag textual de tópico no topo-direito.
```

Substituir por:
```
Posicionamento em posts e convenções por formato estão em `brand/social-media.md`.
```

- [ ] **Step 6: Verificar que apenas identidade universal restou**

```bash
grep -n "carrossel\|stories\|80px\|250px\|safe area\|swipe\|barra de progresso\|tag de tópico" "brand/referencias-visuais.md"
```

Esperado: nenhum resultado (zero matches).

- [ ] **Step 7: Commit**

```bash
git add brand/referencias-visuais.md
git commit -m "refactor(brand): remove convenções de canal de referencias-visuais.md (vão para social-media.md)"
```

---

## Task 3: Criar `brand/social-media.md`

Arquivo novo. Contém tudo que saiu de `referencias-visuais.md` mais as specs completas de chrome.

**Files:**
- Create: `brand/social-media.md`

- [ ] **Step 1: Criar o arquivo com conteúdo completo**

```markdown
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
```

- [ ] **Step 2: Verificar que o arquivo foi criado**

```bash
grep -c "### Swipe-cue\|### Barra de progresso\|### Tag de tópico\|### Logo" "brand/social-media.md"
```

Esperado: 4 matches.

- [ ] **Step 3: Commit**

```bash
git add brand/social-media.md
git commit -m "feat(brand): cria brand/social-media.md com chrome canônico e convenções de canal"
```

---

## Task 4: Renomear `templates/formatos/` → `templates/social-media/` e atualizar todas as referências

**Files:**
- Rename: `templates/formatos/` → `templates/social-media/`
- Modify: `.claude/skills/novo-post/SKILL.md`
- Modify: `.claude/skills/novo-estilo/SKILL.md`
- Modify: `.claude/skills/lote-posts/SKILL.md`
- Modify: `.claude/agents/briefing-writer.md`
- Modify: `.claude/agents/copywriter.md`

- [ ] **Step 1: Renomear o diretório com git**

```bash
git mv templates/formatos templates/social-media
```

- [ ] **Step 2: Atualizar todas as referências em massa**

```bash
# Verificar todos os arquivos com referência ao caminho antigo
grep -r "templates/formatos" .claude/ --include="*.md" -l
```

Esperado: briefing-writer.md, copywriter.md, novo-post/SKILL.md, novo-estilo/SKILL.md, lote-posts/SKILL.md

```bash
# Substituir em todos de uma vez
find .claude -name "*.md" -exec sed -i '' 's|templates/formatos|templates/social-media|g' {} \;
```

- [ ] **Step 3: Verificar que não há referências antigas restando**

```bash
grep -r "templates/formatos" .claude/ templates/ --include="*.md"
```

Esperado: zero resultados.

- [ ] **Step 4: Verificar que caminhos de export NÃO foram alterados**

```bash
grep -r "export/conteudos" .claude/ --include="*.md" | head -5
```

Esperado: caminhos ainda usam `carrossel`/`stories` como token de formato (não `social-media`). Se algum ficou errado, corrigir manualmente.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: renomeia templates/formatos → templates/social-media; atualiza todas as referências"
```

---

## Task 5: Re-autorar `treino-dino/estilo.md`

Reescrever o estilo no schema novo. Verificar coerência com `slide.html` existente.

**Files:**
- Modify: `templates/social-media/carrossel/estilos/treino-dino/estilo.md`

- [ ] **Step 1: Sobrescrever com o estilo reescrito**

```markdown
# Estilo `treino-dino` — Carrossel

## Conceito

Treino completo do Ramon — exercício por exercício, com séries e repetições. Slides de exercício usam chroma verde (#00B140) para inserção de vídeo do Ramon em pós-produção. DNA editorial: instrutivo seco, autoridade técnica. O entregável é o treino; o treino fala por si.

## Estrutura

[sequência]: capa(1, obrigatório) → lista(1, obrigatório) → exercício(N, dinâmico) → cta(1, obrigatório)
[total]: min N+3 | max sem limite

### bloco: capa
[instâncias]: 1

#### visual
[classe]: slide capa
[bg]: foto(drop: photo)
[overlay]: gradiente-escuro-base
[slots]:
  título: Anton 160-180px | centro-vertical | alinhamento esquerdo
  tag-tópico: posição topo-dir
  logo: posição topo-esq
  swipe-cue: posição rodapé-centro
  barra-progresso: posição rodapé
[tokens]: título Anton 160-180px

#### editorial
[função]: hook
[tom]: anúncio direto — nomeia o treino, sem rodeios
[entregar]:
  título: max 5 palavras
  tag-tópico: max 3 palavras (ex: BACK DAY)
[ab]: título

---

### bloco: lista
[instâncias]: 1

#### visual
[classe]: slide lista
[bg]: foto(drop: photo)
[overlay]: gradiente-escuro-base
[slots]:
  tag-tópico: posição topo-dir
  lista-exercicios: Montserrat 700 ~32px (nome) + 300 ~26px (reps) | esquerdo | vertical numerada
  logo: posição topo-esq
  barra-progresso: posição rodapé
[tokens]: nome-exercício Montserrat 700 ~32px; reps Montserrat 300 ~26px

#### editorial
[função]: contexto
[tom]: neutro técnico. Sem adjetivos.
[entregar]:
  tag-tópico: max 3 palavras (ex: O TREINO)
  lista-exercicios: todos os exercícios numerados em ordem — cada item: número + nome + séries e reps
[ab]: não

---

### bloco: exercício
[instâncias]: N-dinâmico (fonte: treino.md → lista-exercícios)

#### visual
[classe]: slide exercicio
[bg]: chroma(#00B140)
[overlay]: nenhum
[slots]:
  tag-ordinal: posição topo-dir
  nome-exercicio: Montserrat 700 ~38px | canto inferior esquerdo
  reps: Montserrat 300 ~30px | abaixo de nome-exercicio
  logo: posição topo-esq
  barra-progresso: posição rodapé
[tokens]: nome-exercício Montserrat 700 ~38px; reps Montserrat 300 ~30px

#### editorial
[função]: instrução-técnica
[tom]: seco. Nome do exercício + reps. Nada além.
[entregar]:
  tag-ordinal: posição ordinal por extenso (PRIMEIRO EXERCÍCIO, SEGUNDO EXERCÍCIO, ..., ÚLTIMO EXERCÍCIO)
  nome-exercicio: nome exato do exercício
  reps: séries × reps no formato do treino.md
[ab]: não

---

### bloco: cta
[instâncias]: 1

#### visual
[classe]: slide cta
[bg]: foto(drop: photo)
[overlay]: gradiente-escuro-base
[slots]:
  título: Anton ~160px | centro | centralizado
  tag-tópico: posição topo-dir
  logo: posição topo-esq
  barra-progresso: posição rodapé | fill 100%
[tokens]: título Anton ~160px

#### editorial
[função]: CTA
[tom]: afirmativo, marca-DNA — frase curta de direção
[entregar]:
  título: max 6 palavras
  tag-tópico: max 3 palavras
[ab]: título

## Quando usar

- Posts onde o entregável é um **treino real e replicável** (não conceitual).
- Quando o cliente quer **demonstração técnica** com vídeo do Ramon.
- Conteúdo **educacional + autoridade** combinados.
- Pilares: Educacional, Autoridade, Descritivo/Explicativo.

## Quando NÃO usar

- Temas **conceituais ou filosóficos** — outro estilo tipográfico serve melhor.
- Quando **não há vídeos do Ramon** disponíveis para o exercício — slide chroma fica vazio na pós.
- Posts de **CTA puro** (sem conteúdo de treino real).
- Conteúdo **curto** (1-3 exercícios) — o ritmo pede pelo menos 4-6.

## Inputs obrigatórios externos

Tipo: **Prescrição técnica de treino.**

- **Grupo muscular ou foco** (ex: costas em V, perna completa).
- **Lista de exercícios** em ordem de execução. Numeração `1., 2., 3., ...`
- **(Opcional) Séries e repetições por exercício.**

Formato de séries/reps: separar séries por espaço: `4 SÉRIES 12 10 Ⓕ Ⓕ`. Símbolo `Ⓕ` = falha (U+24BB).

Quem produz séries/reps quando o usuário não fornece: agente `treinador`.

## Notas técnicas

- Slides chroma (#00B140): remover qualquer drop-shadow ou filtro que contamine a chave de cor na pós-produção.
- Símbolo `Ⓕ` (U+24BB) deve ser preservado como caractere unicode — não substituir por imagem.
- Área central dos slides chroma reservada ao vídeo do Ramon — sem texto nem sobreposição na zona central.
```

- [ ] **Step 2: Inspecionar `slide.html` do treino-dino e verificar coerência**

```bash
grep -n "slide capa\|slide lista\|slide exercicio\|slide cta\|gradiente\|#00B140\|drop-shadow\|Anton\|Montserrat" \
  "templates/social-media/carrossel/estilos/treino-dino/slide.html" | head -30
```

Verificar visualmente: as classes CSS (`slide capa`, `slide lista`, `slide exercicio`, `slide cta`) existem no HTML. Os filtros/overlays declarados no `estilo.md` estão implementados. Se houver divergência, anotar e corrigir no HTML.

- [ ] **Step 3: Commit**

```bash
git add templates/social-media/carrossel/estilos/treino-dino/estilo.md
git commit -m "refactor(estilo): re-autora treino-dino no schema declarativo visual/editorial"
```

---

## Task 6: Re-autorar `layout-dividido/estilo.md`

**Files:**
- Modify: `templates/social-media/carrossel/estilos/layout-dividido/estilo.md`

- [ ] **Step 1: Sobrescrever com o estilo reescrito**

```markdown
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
```

- [ ] **Step 2: Inspecionar `slide.html` do layout-dividido e verificar coerência**

```bash
grep -n "slide capa\|slide dividido\|slide cta\|grayscale\|contrast\|saturate\|topo\|base\|data-bg-drop" \
  "templates/social-media/carrossel/estilos/layout-dividido/slide.html" | head -30
```

Verificar: as classes CSS existem, os filtros por metade estão implementados (`grayscale(0.85)` no topo, `contrast(1.08) saturate(1.05)` na base), as drop zones `topo` e `base` estão declaradas.

- [ ] **Step 3: Commit**

```bash
git add templates/social-media/carrossel/estilos/layout-dividido/estilo.md
git commit -m "refactor(estilo): re-autora layout-dividido no schema declarativo visual/editorial"
```

---

## Task 7: Atualizar contratos dos agentes — `designer`, `curador-export`, `revisor-brand`

Esses três agentes passam a ler `brand/social-media.md`.

**Files:**
- Modify: `.claude/agents/designer.md`
- Modify: `.claude/agents/curador-export.md`
- Modify: `.claude/agents/revisor-brand.md`

- [ ] **Step 1: Atualizar `designer.md` — adicionar social-media.md ao contexto**

Em `## Contexto que carrego`, após a linha de `brand/referencias-visuais.md`, adicionar:

```
- `brand/social-media.md` — convenções do canal: chrome canônico (spec visual de swipe-cue, barra-progresso, tag-tópico, logo, watermark), aspect-ratios, safe-areas, margens, overlays canônicos. Chrome slots nos `[slots]` do `estilo.md` herdam o visual daqui.
```

- [ ] **Step 2: Atualizar `designer.md` — atualizar referências ao schema**

Localizar a linha:
```
- Descrição do estilo (`templates/.../<slug>/estilo.md`) — conceito, variantes internas, restrições adicionais (cores extras declaradas, safe areas, áreas obrigatórias).
```

Substituir por:
```
- Descrição do estilo (`templates/social-media/.../<slug>/estilo.md`) — `## Conceito`, `## Estrutura` com campos por bloco (`[classe]`, `[bg]`, `[overlay]`, `[layout]`, `[slots]`, `[tokens]`), `## Quando usar`. Slots de chrome (swipe-cue, barra, logo, tag, watermark) declaram só presença + posição — visual herdado de `brand/social-media.md`.
```

Localizar em `## Anti-padrões`:
```
- Usar tokens visuais que contradizem `brand/referencias-visuais.md` ou o `estilo.md` apontado.
```

Substituir por:
```
- Usar tokens visuais que contradizem `brand/referencias-visuais.md`, `brand/social-media.md` ou o `estilo.md` apontado.
```

- [ ] **Step 3: Atualizar `curador-export.md` — adicionar social-media.md ao contexto**

Em `## Contexto que carrego`, após `brand/referencias-visuais.md`, adicionar:

```
- `brand/social-media.md` — convenções do canal: dimensões por formato, chrome canônico. Usado para validar dimensões e presença de elementos esperados.
```

- [ ] **Step 4: Atualizar `revisor-brand.md` — adicionar social-media.md ao contexto**

Em `## Contexto que carrego`, após a lista dos 5 arquivos, adicionar:

```
- `brand/social-media.md` — convenções do canal: chrome canônico e aspect-ratios. Chrome é parte da identidade — desvios da spec canônica são violação de marca.
```

Atualizar a abertura de `## Contexto que carrego` para refletir que agora são 6 arquivos de brand (não 5):

Localizar: `(os 5 do brand book — sou o único agente que carrega os 5)`
Substituir: `(os arquivos de brand — sou o único agente que carrega todos)`

- [ ] **Step 5: Commit**

```bash
git add .claude/agents/designer.md .claude/agents/curador-export.md .claude/agents/revisor-brand.md
git commit -m "refactor(agents): designer/curador-export/revisor-brand passam a ler brand/social-media.md"
```

---

## Task 8: Atualizar contratos — `briefing-writer` e `copywriter`

Esses dois precisam de atualização de caminho e referências ao schema.

**Files:**
- Modify: `.claude/agents/briefing-writer.md`
- Modify: `.claude/agents/copywriter.md`

- [ ] **Step 1: Atualizar `briefing-writer.md` — caminhos e campos novos**

Localizar (em `## Contexto que carrego`):
```
- `estilo.md` de cada estilo disponível em `templates/formatos/<formato>/estilos/*/estilo.md` — quando a tarefa é recomendar estilo.
```
Substituir por:
```
- `estilo.md` de cada estilo disponível em `templates/social-media/<formato>/estilos/*/estilo.md` — quando a tarefa é recomendar estilo. Ler `[sequência]`/`[total]` para entender a extensão do post e `## Quando usar` (incluindo `[requer]` quando presente) para avaliar fit editorial e viabilidade.
```

Localizar (em `## Recebo`):
```
  - Formato: slug em `templates/formatos/`.
```
Substituir por:
```
  - Formato: slug em `templates/social-media/`.
```

- [ ] **Step 2: Atualizar `copywriter.md` — caminho**

Localizar:
```
- `estilo.md` apontado pela skill (`templates/formatos/<formato>/estilos/<slug>/estilo.md`) — carrega `## Estrutura` com função editorial, tom, o que entregar + limite de palavras, variações A/B e Inputs visuais por bloco.
```
Substituir por:
```
- `estilo.md` apontado pela skill (`templates/social-media/<formato>/estilos/<slug>/estilo.md`) — ler `#### editorial` de cada bloco: `[função]`, `[tom]`, `[entregar]` (slots que carregam copy com limites), `[ab]` (quais slots têm variação A/B).
```

Localizar em `## Princípios da especialidade`:
```
- **Estrutura vem do estilo.** Quantos blocos, função editorial, tom por bloco, ritmo, hierarquia — tudo está na `## Estrutura` do `estilo.md` apontado pela skill. Não invente estrutura.
```
Substituir por:
```
- **Estrutura vem do estilo.** Quantos blocos, função editorial, tom por bloco, ritmo, hierarquia — tudo está na `#### editorial` de cada bloco do `estilo.md` apontado. Não invente estrutura.
```

Localizar em `## Entrego`:
```
Gravo o copy no caminho indicado seguindo a `## Estrutura` do `estilo.md`, e retorno só o manifesto:
```
Substituir por:
```
Gravo o copy no caminho indicado seguindo a `#### editorial` de cada bloco do `estilo.md`, e retorno só o manifesto:
```

Localizar em `## Input incompleto`:
```
- `ESTILO_INVALIDO — <caminho>` — caminho do `estilo.md` não existe, ou não traz `## Estrutura` parseável.
```
Substituir por:
```
- `ESTILO_INVALIDO — <caminho>` — caminho do `estilo.md` não existe, ou não traz blocos com `#### editorial` parseáveis.
```

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/briefing-writer.md .claude/agents/copywriter.md
git commit -m "refactor(agents): briefing-writer e copywriter atualizam caminhos e refs ao schema novo"
```

---

## Task 9: Atualizar skills — `novo-post`, `novo-estilo`, `lote-posts`

Atualizar prompts que citam seções antigas do `estilo.md` e caminhos `templates/formatos/`.

**Nota:** O rename de caminho já foi feito por `sed` na Task 4. Esta task foca nas **referências ao schema** (nomes de seções) que ainda usam a nomenclatura antiga.

**Files:**
- Modify: `.claude/skills/novo-post/SKILL.md`
- Modify: `.claude/skills/novo-estilo/SKILL.md`

- [ ] **Step 1: Verificar referências ao schema antigo em novo-post**

```bash
grep -n "Variantes visuais\|Conceito visual\|Cores adicionais\|## Estrutura" \
  ".claude/skills/novo-post/SKILL.md"
```

Para cada ocorrência encontrada:
- `## Conceito visual` → `## Conceito`
- `## Variantes visuais` → (remover referência — absorvida por `[classe]`)
- `## Cores adicionais / Tokens` → `[tokens]`
- `## Estrutura` → `## Estrutura` (manter — seção ainda existe, mas referências à estrutura interna como "blocos/função/tom" devem citar os campos do schema novo)

- [ ] **Step 2: Atualizar prompt do designer em novo-post (Passo 3 / modo ad-hoc)**

Localizar (nos entregáveis do designer em modo ad-hoc):
```
- estilo.md — seções obrigatórias (Conceito visual, Estrutura com blocos/função/tom/entrega/A-B/Inputs visuais, Quando usar, Quando NÃO usar, Variantes visuais) e condicionais (Inputs obrigatórios externos, Cores adicionais/Tokens, Notas técnicas) que se apliquem
```
Substituir por:
```
- estilo.md — seguindo o esqueleto canônico em templates/estilo.md: seções obrigatórias (Conceito, Estrutura com [sequência]/[total]/blocos com #### visual e #### editorial, Quando usar, Quando NÃO usar) e condicionais (Inputs obrigatórios externos, Notas técnicas) que se apliquem
```

- [ ] **Step 3: Atualizar prompt do copywriter em novo-post (Passo 8)**

Localizar:
```
Estilo a seguir: <caminho do estilo.md — templates/formatos/<formato>/estilos/<slug>/estilo.md OU templates/formatos/<formato>/estilos/_rascunho/estilo.md>
```
(O caminho já foi atualizado pela Task 4. Verificar se está correto com `social-media`.)

- [ ] **Step 4: Atualizar novo-estilo — referências ao schema**

Localizar no prompt do designer em novo-estilo:
```
- estilo.md — seções obrigatórias (Conceito visual, Estrutura com blocos/função/tom/entrega/A-B/Inputs visuais, Quando usar, Quando NÃO usar, Variantes visuais) e condicionais (Inputs obrigatórios externos, Cores adicionais/Tokens, Notas técnicas) que se apliquem
```
Substituir por:
```
- estilo.md — seguindo o esqueleto canônico em templates/estilo.md: seções obrigatórias (Conceito, Estrutura com [sequência]/[total]/blocos com #### visual e #### editorial, Quando usar, Quando NÃO usar) e condicionais (Inputs obrigatórios externos, Notas técnicas) que se apliquem
```

- [ ] **Step 5: Atualizar descrição frontmatter do novo-estilo**

Localizar no frontmatter:
```
description: Cria ou edita um estilo visual para qualquer formato disponível em templates/formatos/.
```
Substituir por:
```
description: Cria ou edita um estilo visual para qualquer formato disponível em templates/social-media/.
```

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/novo-post/SKILL.md .claude/skills/novo-estilo/SKILL.md
git commit -m "refactor(skills): novo-post e novo-estilo atualizam refs ao schema novo e caminho social-media"
```

---

## Task 10: Validação final

Verificar que nenhuma referência órfã restou e que o pipeline está íntegro.

**Files:**
- Read-only verification

- [ ] **Step 1: Varredura de referências órfãs ao caminho antigo**

```bash
grep -r "templates/formatos" . --include="*.md" --exclude-dir=".git" --exclude-dir="export" --exclude-dir="docs"
```

Esperado: **zero resultados**.

- [ ] **Step 2: Varredura de seções antigas do schema**

```bash
grep -r "## Variantes visuais\|## Conceito visual\|## Cores adicionais" \
  templates/ .claude/ --include="*.md"
```

Esperado: zero resultados (exceto possivelmente no spec de design em `docs/specs/` — ok, é documentação histórica).

- [ ] **Step 3: Verificar que os dois estilos passam no checklist canônico**

Para cada estilo reescrito, verificar que os campos obrigatórios existem:

```bash
for estilo in templates/social-media/carrossel/estilos/treino-dino/estilo.md \
              templates/social-media/carrossel/estilos/layout-dividido/estilo.md; do
  echo "=== $estilo ==="
  grep -c "\[classe\]\|#### visual\|#### editorial\|\[função\]\|\[slots\]\|\[sequência\]" "$estilo"
done
```

Esperado: ≥ 6 matches por estilo.

- [ ] **Step 4: Verificar que nenhum estilo re-declara tokens de marca**

```bash
grep -n "Anton\|Montserrat\|#000000\|#FFFFFF\|CAIXA ALTA\|80px" \
  templates/social-media/carrossel/estilos/treino-dino/estilo.md \
  templates/social-media/carrossel/estilos/layout-dividido/estilo.md
```

Esperado: apenas ocorrências em `[tokens]` (tamanhos de fonte que são deltas legítimos). Se aparecer fora de `[tokens]`, remover.

- [ ] **Step 5: Verificar que brand/referencias-visuais.md ficou limpo**

```bash
grep -c "carrossel\|stories\|80px\|250px\|swipe\|barra de progresso\|tag de tópico" \
  "brand/referencias-visuais.md"
```

Esperado: zero resultados.

- [ ] **Step 6: Verificar que brand/social-media.md tem os 4 chrome canônicos**

```bash
grep -c "### Swipe-cue\|### Barra de progresso\|### Tag de tópico\|### Logo" \
  "brand/social-media.md"
```

Esperado: 4.

- [ ] **Step 7: Commit final de validação**

```bash
git add -A
git status  # deve estar limpo
git log --oneline -10  # revisar os commits desta feature
```

Se status estiver limpo (sem pendências), a implementação está completa.

---

## Critério de conclusão (do spec)

- [ ] `templates/estilo.md` descreve o schema com `[slots]`/`#### visual`/`#### editorial` como form preenchível.
- [ ] `brand/referencias-visuais.md` não contém nenhuma convenção específica de post.
- [ ] `brand/social-media.md` existe com spec completa dos 4+ chrome canônicos.
- [ ] `templates/social-media/` substitui `templates/formatos/` sem referência órfã.
- [ ] `treino-dino` e `layout-dividido` estão no schema novo, com `slide.html` coerente.
- [ ] Nenhum `estilo.md` re-declara token que já vive no brand.
- [ ] Contratos e skills referenciam os campos/caminhos novos.
