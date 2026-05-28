# Reescrita do schema de estilos + separação de identidade vs. convenções

> Spec de design — 2026-05-27
> Estrutura: **campos declarativos por bloco** (visual ⟂ editorial), **herança por delta** (tokens e chrome vivem uma vez só), **brand = regras / templates = artefatos**.
> Este é o **Spec A** (fundação). O **Spec B** (loop de atualização do branding) depende dele.

---

## Motivação

O `estilo.md` atual é prosa-pesada e inconsistente entre estilos. A mesma informação mora em lugares diferentes em cada estilo: `layout-dividido` declara ausência de chrome no `## Conceito visual`; `treino-dino` declara logo e tag implicitamente dentro da descrição de cada bloco. Não há campo canônico, e o `designer` precisa interpretar parágrafos para extrair onde posicionar cada elemento, qual o tamanho máximo de texto, o que é foto e o que é cor sólida.

Três problemas concretos:

1. **Sem vocabulário scannable.** Cada `estilo.md` esconde o spec em prosa, em lugares diferentes. O `designer` adivinha posicionamento.
2. **Redundância com o brand book.** `treino-dino` re-declara Anton, Montserrat, 80px, `#FFFFFF` — tudo que já está em `referencias-visuais.md`.
3. **Identidade universal misturada com convenção de canal.** `referencias-visuais.md` mistura paleta/tipografia (universal, lida por todo designer incl. web) com margem de carrossel e safe-area de stories (só posts). O `designer-web` lê ruído.

Este redesenho torna o `estilo.md` um conjunto de campos declarativos auditáveis, separa identidade universal de convenção de canal, e estabelece que tokens e chrome se herdam por delta — o estilo declara só o que é dele.

---

## Princípio central

> O `estilo.md` declara **apenas o que é próprio do estilo**. Tudo que é universal (tokens da marca) ou compartilhado entre estilos (chrome) é herdado por referência, declarado uma vez na fonte canônica.

Consequências:

- **Brand = regras; templates = artefatos.** `brand/` guarda identidade e convenções (o que pouco muda); `templates/` guarda esqueleto, HTML e estilos (o que muda sempre).
- **Visual ⟂ editorial.** Cada bloco separa o que o `designer` precisa (layout, posição, tokens) do que o `copywriter` precisa (função, tom, o que escrever). Vínculo pelo **nome do slot**.
- **`estilo.md` é a fonte; `slide.html` é derivável dele.** Critério de completude: o HTML deve ser produzível a partir do `estilo.md` sem consultar o template existente. (Sem validador automático — é disciplina, não máquina.)

---

## 1. Arquitetura de arquivos

### 1.1 Separação `brand/`

| Arquivo | Escopo | Lido por |
|---|---|---|
| `brand/referencias-visuais.md` | **Identidade universal, canal-agnóstica**: paleta, tipografia, mood, tratamento de foto, asset da logo | todos os designers (posts **e** web) |
| `brand/social-media.md` | **Convenções do canal**: chrome canônico (swipe-cue, barra-progresso, tag-tópico, posicionamento de logo em post, watermark), aspect-ratios, safe-areas, margens | `designer`, `curador-export`, `revisor-brand` |

`brand/social-media.md` é **novo**. Os designers de post passam a ler os dois; `designer-web` lê só `referencias-visuais.md`. Futuro simétrico: quando web precisar de convenções próprias, `brand/web.md`.

**Chrome canônico** é o registro de cada elemento recorrente com spec visual **completa** (não a prosa atual "sinaliza continuidade"). Exemplo da entrada do swipe-cue:

```
### Swipe-cue
- texto: ARRASTE →  (seta U+2192)
- fonte: Montserrat 600, ~14px, tracking 0.16em, CAIXA ALTA
- cor: branco, opacidade 0.8
- aparece: só na capa
- posição: definida pelo estilo (default rodapé-centro)
```

Quando o reuso real de chrome entre estilos começar, a entrada em prosa pode ganhar um **snippet de implementação de referência** ao lado — fora do escopo deste spec, mas a estrutura comporta.

### 1.2 Rename `templates/formatos/` → `templates/social-media/`

"Formato" é taxonomia errada — carrossel e stories são execução de um **canal**. Quando entrar TikTok/YouTube/email, cada um é irmão de `social-media/`, não um "formato".

```
templates/
  estilo.md                  ← esqueleto canônico (governa todos os formatos)
  social-media/              ← renomeado de formatos/
    carrossel/estilos/<slug>/{estilo.md, slide.html, preview.html}
    stories/estilos/<slug>/{estilo.md, frame.html, preview.html}
```

**Blast radius do rename** (resolver na implementação): toda referência a `templates/formatos/` em `novo-post`, `novo-estilo`, descrições de skill e qualquer agente. O token `<formato>` em caminhos de **export** (`export/conteudos/<formato>/`) **não muda** — continua `carrossel`/`stories`.

---

## 2. Schema novo do `estilo.md`

```
# Estilo <slug> — <formato>

## Conceito                          ← 2-3 frases: DNA editorial + visual (condensado)

## Estrutura
[sequência]: capa(1, obrigatório) → <bloco>(1..N, dinâmico) → cta(1, obrigatório)
[total]: min <X> | max <Y>

### bloco: <id>
[instâncias]: 1 | N-dinâmico (fonte: <arquivo → campo>)

#### visual
[classe]: <classe-css>               ← liga ao slide.html; substitui ## Variantes visuais
[bg]: foto(drop:<nome>) | cor(#hex) | gradiente(<spec>) | chroma(#hex) | nenhum
[overlay]: gradiente-escuro | filtro(<css>) | nenhum    ← só quando bg=foto; tratamento por bloco
[layout]: full | dividido-50-50 | <custom>              ← só declara quando não-padrão
[slots]:                             ← cada elemento posicionado (conteúdo + chrome)
  <nome>: <font/size se conteúdo> | posição | alinhamento
[tokens]: <só deltas vs. referencias-visuais — omite o que é padrão da marca>

#### editorial
[função]: hook | contexto | desenvolvimento | virada | instrução-técnica | prova | CTA | fechamento
[tom]: <1 frase de modulação dentro do tom da marca>
[entregar]:                          ← só slots que carregam copy; vínculo pelo nome do slot
  <nome>: max <N> palavras           ← sufixo ? marca slot opcional (ex: eyebrow?)
[ab]: <slots com variação A/B> | não

## Quando usar
[requer]: <restrição prática — opcional, ex: 2 fotos por slide>     ← campo opcional

## Quando NÃO usar

## Inputs obrigatórios externos      (condicional)
## Notas técnicas                    (condicional)
```

### 2.1 Decisões de schema (travadas)

1. **`[slots]` funde conteúdo + chrome.** Tudo que ocupa posição é um slot.
   - **Slot de chrome** (swipe-cue, barra-progresso, logo, tag-tópico, watermark) → declara **só presença + posição**; visual herdado de `brand/social-media.md`. É isso que garante o chrome idêntico entre posts.
   - **Slot de conteúdo** (título, corpo, lista) → declara visual próprio (font/size/alinhamento), porque varia por estilo.
   - **Vínculo visual↔editorial é o nome do slot:** se o slot aparece em `[entregar]`, carrega copy; se só no `[slots]` visual, é chrome puro.

2. **`[tokens]` é delta puro.** Só valores que **desviam** do padrão da marca. Anton/Montserrat/CAIXA ALTA/paleta/80px **nunca** aparecem — vivem no brand.

3. **`[overlay]` carrega o tratamento de foto, por bloco.** Os filtros de `layout-dividido` (grayscale no topo, cor preservada na base) deixam de morar numa tabela global de tokens e passam a ser declarados no bloco que os usa. Resolve a ambiguidade "qual filtro se aplica a qual bloco".

4. **`[instâncias]: N-dinâmico` declara a fonte do N.** Ex: `N-dinâmico (fonte: treino.md → lista-exercícios)`. O `designer` sabe que o bloco se repete **e** de onde vem o conteúdo de cada repetição.

5. **`[sequência]` + `[total]` estruturam a estrutura.** A ordem dos blocos, quais são obrigatórios e a extensão min/max deixam de ser prosa. O `briefing-writer` infere a extensão do post ao recomendar o estilo.

6. **`[requer]` em `## Quando usar` é opcional.** Restrições práticas que o `briefing-writer` precisa saber (ex: `layout-dividido` exige 2 fotos de qualidade por slide).

### 2.2 Seções que somem

- **`## Variantes visuais`** → absorvida por `[classe]` em cada bloco. Vira no máximo um índice trivial; preferência por remover.
- **`## Cores adicionais / Tokens`** (global) → absorvida por `[tokens]` por bloco. Um token genuinamente compartilhado por todos os blocos do estilo pode virar uma nota curta; o default é declarar por bloco.
- **`## Conceito visual`** (2-4 parágrafos) → condensa para **`## Conceito`** (2-3 frases de DNA). O resto era repetição do que os blocos já declaram.

---

## 3. Re-autoração dos estilos existentes

Os dois estilos atuais são reescritos no schema novo:

- `templates/social-media/carrossel/estilos/treino-dino/estilo.md`
- `templates/social-media/carrossel/estilos/layout-dividido/estilo.md`

Critério: o `slide.html` de cada um deve **seguir os campos** do `estilo.md` reescrito. Onde o HTML atual divergir do que o `estilo.md` novo declara, ou ajusta-se o HTML ou ajusta-se o campo — não deixa divergência silenciosa. Inspeção a olho (sem validador).

`treino-dino` exercita `[instâncias]: N-dinâmico`, `[bg]: chroma`, `[slots]` de chrome (logo, barra, swipe-cue, tag).
`layout-dividido` exercita `[layout]: dividido-50-50`, `[overlay]: filtro(...)` por metade, ausência total de chrome, `[requer]: 2 fotos por slide`.

---

## 4. Propagação para contratos e skills

A reescrita do schema obriga ajuste nos consumidores. **Sem isso o pipeline quebra.**

| Arquivo | Mudança |
|---|---|
| `templates/estilo.md` | Reescrever o esqueleto canônico para o schema da §2 (vira form preenchível, resolve ad-hoc). |
| `.claude/agents/designer.md` | Passa a ler `brand/social-media.md`. Lê `[slots]`/`[classe]`/`[bg]`/`[overlay]`/`[tokens]` de cada bloco. Chrome herda da convenção. |
| `.claude/agents/copywriter.md` | Lê `#### editorial` (`[função]`/`[tom]`/`[entregar]`/`[ab]`). |
| `.claude/agents/briefing-writer.md` | Lê `[sequência]`/`[total]` e `## Quando usar`/`[requer]` na recomendação de estilo. |
| `.claude/agents/curador-export.md` | Passa a ler `brand/social-media.md`. Valida contra os campos do `estilo.md`. |
| `.claude/agents/revisor-brand.md` | Passa a ler `brand/social-media.md` (chrome é parte da identidade). |
| `.claude/agents/designer-web.md` | Sem mudança de leitura (já lê só `referencias-visuais.md`); confirmar que não referencia convenção de post. |
| `.claude/skills/novo-post/SKILL.md` | Prompts que citam `## Estrutura`/`## Variantes visuais` passam a citar os campos novos. Caminho `templates/formatos/` → `templates/social-media/`. |
| `.claude/skills/novo-estilo/SKILL.md` | Idem caminho + schema novo no prompt de criação ad-hoc. |
| `CLAUDE.md` | Atualizar referências a `templates/formatos/`. |

---

## 5. Ordem de implementação

1. **`templates/estilo.md`** — esqueleto canônico novo (a fonte da verdade do schema).
2. **`brand/referencias-visuais.md` + `brand/social-media.md`** — separar identidade universal de convenção de canal; chrome com spec visual completa.
3. **Rename `templates/formatos/` → `templates/social-media/`** — com todas as referências.
4. **Re-autorar `treino-dino` + `layout-dividido`** no schema novo; alinhar `slide.html` aos campos.
5. **Propagar contratos + skills + CLAUDE.md** (§4).

Itens 1-2 são pré-requisito de tudo. 3 é mecânico mas amplo. 4 valida o schema contra casos reais. 5 fecha o ciclo.

---

## 6. Fora de escopo

- **Loop de atualização do branding durante criação de posts** → Spec B (depende deste).
- **Validador automático `estilo.md` ↔ `slide.html`** → YAGNI. Consistência é disciplina + inspeção.
- **Biblioteca de snippets de implementação de chrome** → quando o reuso real entre estilos começar.
- **`brand/web.md`** → quando web precisar de convenções próprias.

---

## 7. Critério de conclusão

- `templates/estilo.md` descreve o schema da §2 como form preenchível.
- `brand/referencias-visuais.md` não contém nenhuma convenção específica de post; `brand/social-media.md` existe com chrome de spec completa.
- `templates/social-media/` substitui `templates/formatos/` sem referência órfã ao caminho antigo.
- `treino-dino` e `layout-dividido` estão no schema novo, com `slide.html` coerente aos campos.
- Nenhum `estilo.md` re-declara token que já vive no brand.
- Contratos e skills da §4 referenciam os campos/caminhos novos; o `/novo-post` roda ponta a ponta sobre um estilo reescrito.
