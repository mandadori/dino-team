# Spec: Otimizações nas Skills de Criação de Post

**Data:** 2026-05-20  
**Escopo:** `novo-post`, `lote-posts`, `designer.md`, `templates/formatos/README.md`

---

## Contexto

Três melhorias no pipeline de criação de posts, mais a reescrita do README de formatos:

1. **Copy approval** — pausa para revisão da copy antes do design, em `novo-post` e `lote-posts`.
2. **Designer generalizado** — remoção da exigência de template de estilo; designer aceita template existente ou referência ad-hoc.
3. **Fluxo ad-hoc no `novo-post`** — usuário pode criar post sem estilo pré-definido em templates, passando referência visual (imagem + descrição).
4. **README como regras inegociáveis** — `templates/formatos/README.md` reescrito como checklist prescritivo, passado ao designer pela skill em cada criação de post.

---

## 1. Copy Approval

### `novo-post`

**Onde:** entre Passo 7 (copy) e Passo 8 (design).

**Comportamento:** após o copywriter gravar `copy.md`, a skill exibe o conteúdo do arquivo ao usuário e aguarda resposta:

```
Copy gerada em export/conteudos/<formato>/<data>-<slug>/copy.md

--- início do copy ---
{conteúdo de copy.md}
--- fim do copy ---

Confirma? (ok para seguir, ou descreva o ajuste)
```

- **Aprovado:** segue ao Passo 8 (design).
- **Ajuste pedido:** re-aciona o `copywriter` com o pedido inline, sem re-acionar pesquisa. Reapresenta copy.md após gravação. Repete até aprovação.

**Custo adicional:** zero se aprovado na primeira vez. Ajuste = uma re-invocação do copywriter (sem pesquisa).

---

### `lote-posts`

**Resequência do Passo 5 atual:**

- **Antes:** `(briefing → pesquisa → copy → design) × N`
- **Depois:** `(briefing → pesquisa → copy) × N` → **pausa de revisão em lote** → `(design) × N`

**Pausa de revisão em lote:**

```
Copies do lote geradas. Revise antes do design:

Post 1 — <slug-1> (estilo: <slug>)
--- início ---
{conteúdo de copy.md do post 1}
--- fim ---

Post 2 — <slug-2> (estilo: <slug>)
--- início ---
{conteúdo de copy.md do post 2}
--- fim ---

...

Responda:
- "ok" → aprova todos e inicia design
- "ajustar post N: <descrição>" → re-aciona copywriter só daquele post; reapresenta somente o post ajustado para confirmação; pergunta se há mais ajustes ou se pode iniciar design
```

A pausa só avança ao design quando o usuário confirmar que não há mais ajustes.

**Modo agendado:** pula a pausa de copy, segue direto ao design (comportamento já existente no modo agendado).

---

## 2. Designer Generalizado

### `designer.md`

**Mudança:** remover a exigência de template como obrigatório. O agente passa a aceitar qualquer combinação de guia visual:

| Recebe | Comportamento |
|---|---|
| Template HTML + `estilo.md` | Comportamento atual — herda estrutura e variantes do template |
| Referência (imagem + descrição) | Gera HTML do zero seguindo a referência e as regras do brand |
| Ambos | Usa template como base, aplica referência como direção adicional |
| Nenhum dos dois | Devolve `INPUT_INSUFICIENTE — guia visual ausente (template ou referência obrigatório)` |

**Erro atualizado:**
- Remover: `INPUT_INSUFICIENTE — sem tarefa, template ou copy`
- Adicionar: `INPUT_INSUFICIENTE — guia visual ausente (template ou referência obrigatório)`

**Contrato de entrada atualizado:** `Caminho do template visual do estilo` → `Guia visual: caminho do template (quando houver) e/ou referência (imagem + descrição)`.

Nenhum modo novo declarado — o designer simplesmente executa com o que recebe.

---

## 3. Fluxo Ad-hoc no `novo-post`

### Passo 2 (Confirmar plano)

Quando nenhum slug de estilo é resolvido no parse, o usuário é apresentado à escolha:

```
Estilo: nenhum definido.

Opções:
- Slug existente: <lista de slugs disponíveis>
- Do zero: descreva o visual e/ou anexe uma imagem de referência
```

- **Slug existente escolhido:** fluxo normal.
- **Do zero:** coletar descrição textual e/ou imagem de referência. Ao menos um dos dois é obrigatório.

O plano final apresentado ao usuário inclui `Estilo: ad-hoc (referência: <descrição resumida>)` quando não há slug.

### Passo 5 (Resolver inputs obrigatórios do estilo)

- Quando não há `estilo.md` (modo ad-hoc): **pular este passo inteiramente**.
- Sem `estilo.md`, não há "Inputs obrigatórios" a verificar.

### Passo 8 (Design)

O prompt ao designer passa guia visual conforme o modo:

**Modo com estilo definido (atual):**
```
Regras inegociáveis: templates/formatos/README.md
Template visual: templates/formatos/<formato>/estilos/<estilo>/slide.html
Descrição do estilo: templates/formatos/<formato>/estilos/<estilo>/estilo.md
```

**Modo ad-hoc:**
```
Regras inegociáveis: templates/formatos/README.md
Guia visual (referência ad-hoc):
  - Imagem: <caminho ou "nenhuma">
  - Descrição: <texto do usuário>
```

---

## 4. README como Regras Inegociáveis

### `templates/formatos/README.md`

Reescrito como checklist prescritivo, enxuto. Lido pelo designer via skill em cada criação de post — não auto-carregado pelo agente.

**Estrutura do novo README:**

```markdown
# Regras Inegociáveis — Criação de Posts

Aplicam em todo post, independente de formato ou estilo.

## Tipografia
- Todo texto em CAIXA ALTA, sem exceção
- Títulos: Anton
- Subtítulos e apoio: Montserrat
- Sem tipografias além dessas duas

## Margens e Safe Areas
- Carrossel: 80px em todos os lados
- Stories: 250px topo e base
- Conteúdo crítico nunca encosta nas bordas
- Imagens de fundo e barras de progresso podem ocupar bleed total

## Paleta
- Apenas preto (#000000), branco (#FFFFFF) e cinza (#7F7F7F)
- Verde chroma (#00B140) exclusivamente em estilos de treino com vídeo
- Sem cores saturadas, gradientes coloridos ou neons

## Assets individuais
- Sem JavaScript
- Sem dependências externas além das fontes declaradas
- Um arquivo HTML standalone por slide/frame

## Preview consolidado
- Todo post termina com preview.html
- preview.html usa templates/wrappers/preview-wrapper.html verbatim
- section[data-slide="N"] obrigatório por asset

## Dimensões
- Carrossel: 1080×1350px
- Stories: 1080×1920px
- Não alterar dimensões declaradas no template
```

---

## Arquivos alterados

| Arquivo | Tipo de mudança |
|---|---|
| `.claude/skills/novo-post/SKILL.md` | Adicionar pausa de copy (entre P7 e P8); adaptar Passo 2 para fluxo ad-hoc; adaptar Passo 5 (skip sem estilo.md); adaptar Passo 8 (guia visual dual) |
| `.claude/skills/lote-posts/SKILL.md` | Resequenciar pipeline interno (copy × N → pausa em lote → design × N) |
| `.claude/agents/designer.md` | Remover exigência de template; atualizar contrato de entrada e erro |
| `templates/formatos/README.md` | Reescrever como regras inegociáveis |

---

## Fora do escopo

- `novo-estilo`: não alterado (já usa template como base obrigatória por design)
- `curador-export`: não alterado (validação continua contra `estilo.md` e `referencias-visuais.md`)
- `brand/referencias-visuais.md`: não alterado
