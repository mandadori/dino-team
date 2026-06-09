# Biblioteca de Fontes Curadas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar ao `pesquisador-mercado` uma biblioteca curada de fontes (livros/autores/criadores/estudos por pilar/tema), ensinável por entrevista e enriquecível por proposta, que ancora pesquisa e copy **sem inflar o contexto**.

**Architecture:** Slice de cérebro `memory/biblioteca/` com **índice leve sempre lido + fichas sob demanda** (nunca o conteúdo integral de uma obra). Owner: `pesquisador-mercado` (estende o agente; sem agente novo). Ensino via skill `/curar-fontes` (semeadura + reabrir/promover); enriquecimento via proposta de candidatas no scouting/deep-research; integração em `/pesquisar-tema` (1ª parada antes da web) e `/novo-post` (trechos na copy + captura de fonte nova). Loop de performance fica como Horizonte.

**Tech Stack:** Markdown + frontmatter YAML (cérebro/skills/agentes); Node.js ESM + `node:test` (apenas para o hook opcional `--fontes`).

**Spec:** `docs/specs/2026-06-09-biblioteca-fontes-curadas-design.md`

---

## File Structure

**Novos:**
- `memory/biblioteca/_indice.md` — índice leve (frontmatter + tabela + legenda). Único arquivo do slice lido por inteiro.
- `memory/biblioteca/fontes/.gitkeep` — mantém a pasta de fichas versionada quando vazia.
- `templates/ficha-fonte.md` — **contrato canônico único** da ficha (fonte DRY; agente e skill referenciam, não duplicam).
- `.claude/skills/curar-fontes/SKILL.md` — skill de entrevista que ensina/edita/promove fontes.

**Modificados:**
- `memory/_schema.md` — registra o slice `biblioteca/`.
- `.claude/agents/pesquisador-mercado.md` — ownership + regra de leitura anti-inflação + propor candidatas + modo `manutenção da biblioteca`.
- `.claude/skills/pesquisar-tema/SKILL.md` — consultar biblioteca antes da web; tabela "Perfis de fonte por pilar" vira fallback.
- `.claude/skills/novo-post/SKILL.md` — injetar trechos das fichas na copy (Passo 10) + captura de fonte nova (Passo 14.6).
- `CLAUDE.md` — listar `/curar-fontes` + slice `memory/biblioteca/`.

**Opcional (Task 8 — deferível):**
- `scripts/memory/append_registro_angulos.js` + `scripts/memory/append_registro_angulos.test.js` + `package.json` + `memory/performance/registro-angulos.md` + `.claude/skills/novo-post/SKILL.md` (Passo 15.5) + `.claude/agents/analista-performance.md`.

> **Nota de verificação:** as Tasks 1–7 alteram markdown (cérebro/skills/agentes/docs), que **não têm teste unitário** neste repo (`npm test` cobre só `scripts/editor/*` e `scripts/orquestracao/*`). Para essas, a verificação é **checagem estrutural determinística** (`grep`/`test -f` com saída esperada) + revisão manual no checkpoint. TDD completo (`node:test`) só na Task 8 (hook JS).

---

### Task 1: Scaffold do slice + template da ficha + registro no schema

**Files:**
- Create: `memory/biblioteca/_indice.md`
- Create: `memory/biblioteca/fontes/.gitkeep`
- Create: `templates/ficha-fonte.md`
- Modify: `memory/_schema.md` (tabela de Slices + enum do frontmatter)

- [ ] **Step 1: Criar `templates/ficha-fonte.md` (contrato canônico da ficha)**

```markdown
---
slice: biblioteca
owner: pesquisador-mercado
slug: <kebab-case — igual ao nome do arquivo, sem .md>
tipo: <livro | autor | criador | estudo | artigo | podcast>
pilares: [<pilar-de-brand/pilares-conteudo.md>]
status: <nucleo | candidato>
proveniencia: <usuario | scouting:YYYY-MM-DD | performance:YYYY-MM-DD>
ultima_atualizacao: YYYY-MM-DD
versao: 1
---

# <Nome legível da fonte>

**Use para:** <ângulos/temas que esta fonte sustenta — 1-2 linhas>

**Ideias-chave:**
- <bullet>
- <bullet>
- <bullet>

**Trechos:**
- "<citação/frase curada>" — <página/capítulo, ou URL + data de acesso>
- "<citação/frase curada>" — <página/fonte>

**Como a copy riffa:** <como virar copy da marca, sem cópia literal — 1-2 linhas>

**Off-limits:** <o que evitar ao usar esta fonte (ex: Mentalidade não vira motivação vazia)>
```

- [ ] **Step 2: Criar `memory/biblioteca/_indice.md` (índice leve)**

```markdown
---
slice: biblioteca
owner: pesquisador-mercado
ultima_atualizacao: 2026-06-09
versao: 1
---

# Índice — Biblioteca de Fontes Curadas

Índice leve do slice `memory/biblioteca/`. **Sempre lido**; as fichas em
`fontes/<slug>.md` são lidas **só quando selecionadas** por pilar + tema.

A biblioteca guarda **fichas curadas** (ponteiros + trechos-chave) — **nunca** o
conteúdo integral de uma obra. Contrato da ficha: `templates/ficha-fonte.md`.

| slug | nome | tipo | pilares | use para | status |
|---|---|---|---|---|---|

<!-- status: nucleo (aprovado pelo usuário) | candidato (proposto pelo agente, aguarda /curar-fontes) -->
<!-- tipo: livro | autor | criador | estudo | artigo | podcast -->
```

- [ ] **Step 3: Criar `memory/biblioteca/fontes/.gitkeep`**

Arquivo vazio (mantém a pasta no git):

```bash
mkdir -p memory/biblioteca/fontes && : > memory/biblioteca/fontes/.gitkeep
```

- [ ] **Step 4: Registrar o slice em `memory/_schema.md` — tabela de Slices**

Localize a linha da tabela de slices (o último slice atual):

```
| `pesquisa/` | `pesquisador-mercado` | pesquisa bruta datada (insumo) | ativo |
```

Insira **logo abaixo** dela a nova linha:

```
| `biblioteca/` | `pesquisador-mercado` (usuário ensina; agente propõe) | `_indice.md` (índice leve) + `fontes/<slug>.md` (fichas curadas: trechos/páginas por pilar/tema) | ativo |
```

- [ ] **Step 5: Registrar o slice no enum do frontmatter padrão (`memory/_schema.md`)**

Localize:

```
slice: <publico | mercado | ramon | performance | pesquisa | produto>
```

Substitua por:

```
slice: <publico | mercado | ramon | performance | pesquisa | produto | biblioteca>
```

- [ ] **Step 6: Verificação estrutural**

Run:
```bash
test -f templates/ficha-fonte.md && \
test -f memory/biblioteca/_indice.md && \
test -f memory/biblioteca/fontes/.gitkeep && \
grep -q '`biblioteca/`' memory/_schema.md && \
grep -q 'pesquisa | produto | biblioteca' memory/_schema.md && \
grep -q '| slug | nome | tipo | pilares | use para | status |' memory/biblioteca/_indice.md && \
echo "TASK1_OK"
```
Expected: `TASK1_OK`

- [ ] **Step 7: Commit**

```bash
git add templates/ficha-fonte.md memory/biblioteca/ memory/_schema.md
git commit -m "feat(biblioteca): scaffold do slice + template da ficha + registro no schema"
```

---

### Task 2: Estender o `pesquisador-mercado` (ownership + leitura anti-inflação + propor candidatas + modo manutenção)

**Files:**
- Modify: `.claude/agents/pesquisador-mercado.md`

- [ ] **Step 1: Adicionar a seção de ownership da biblioteca**

Localize o início da seção (o cabeçalho exato):

```
## Deep research parametrizado (type-aware)
```

Insira **imediatamente antes** dele o bloco abaixo:

```markdown
## Ownership do slice `memory/biblioteca/` (fontes curadas)

Sou o **owner único** do slice `memory/biblioteca/` — fichas curadas das fontes de que a marca tira profundidade (livros, autores, criadores, estudos). A biblioteca guarda **ponteiros + trechos-chave** (contrato: `templates/ficha-fonte.md`), **nunca** o conteúdo integral de uma obra.

**Leitura sem inflar contexto (regra crítica):**
1. Leia **só** `memory/biblioteca/_indice.md` (índice leve — 1 linha/fonte).
2. Filtre o índice por **pilar + palavras-chave do tema**; selecione no máximo **1-2 fontes**.
3. Abra **só** as fichas selecionadas (`fontes/<slug>.md`). Nunca leia a biblioteca inteira nem fichas irrelevantes.

**Propor fontes candidatas:** ao fazer `scouting de mercado` (Fase A) ou deep research, se uma fonte aparecer **fortemente citada** no nicho/público (livro recorrente entre fontes, criador com ângulo repetido, autor que o público referencia):
- Acrescente uma linha ao `_indice.md` com `status: candidato`.
- Crie uma ficha-stub em `fontes/<slug>.md` (`proveniencia: scouting:<data>`) com o que observou + a fonte do sinal (preencha o que tiver; deixe `Trechos` para o usuário completar).
- Nomeie as candidatas no campo `obs:` do manifesto.
- **Nunca** grave `status: nucleo` nem promova candidata — promoção é decisão do usuário via `/curar-fontes`. O núcleo curado pelo usuário é intocável por mim.
```

- [ ] **Step 2: Inserir a regra "biblioteca primeiro" no deep research**

Localize, dentro da seção `## Deep research parametrizado (type-aware)`, a frase que abre o parágrafo:

```
**Fonte e profundidade parametrizadas (type-aware):** quando a skill passar `Fontes:` e `Profundidade:`, priorize essas fontes e calibre o esforço pela profundidade:
```

Insira **imediatamente antes** dela:

```markdown
**Biblioteca primeiro (1ª parada).** Antes de qualquer WebSearch, consulte `memory/biblioteca/` pela regra de leitura anti-inflação acima: filtre o índice por pilar+tema, abra 1-2 fichas e use os **trechos curados** como matéria-prima primária. A web preenche **lacunas** — não redescobre o que a ficha já entrega.

```

- [ ] **Step 3: Adicionar o modo de tarefa `manutenção da biblioteca`**

Localize o fim da seção `### Modo `seleção de candidatos` (ranqueamento rápido — Fase B)` — isto é, a linha logo antes do cabeçalho:

```
## Recebo
```

Insira **imediatamente antes** de `## Recebo` o bloco:

```markdown
### Modo `manutenção da biblioteca`

Acionado pela skill `/curar-fontes`. Recebo campos estruturados de uma fonte e **gravo/edito** a ficha + atualizo o índice. Operações:

- **Criar/editar ficha:** escrever `memory/biblioteca/fontes/<slug>.md` seguindo `templates/ficha-fonte.md` com os campos fornecidos; criar/atualizar a linha correspondente em `_indice.md` (status conforme informado, default `nucleo` quando o usuário ensina).
- **Promover candidato → núcleo:** mudar `status: candidato` → `status: nucleo` na ficha e no índice; atualizar `ultima_atualizacao`.

Regras: não invento trechos/páginas — gravo só o que a skill fornece. Atualizo `ultima_atualizacao` no frontmatter da ficha e do `_indice.md`. Em conflito com fonte já existente (mesmo slug), devolvo `CONFLITO_FONTE — <slug>` para a skill resolver. Saída: manifesto (arquivos gravados + 1 linha de confirmação).
```

- [ ] **Step 4: Verificação estrutural**

Run:
```bash
grep -q '## Ownership do slice `memory/biblioteca/`' .claude/agents/pesquisador-mercado.md && \
grep -q 'Biblioteca primeiro (1ª parada)' .claude/agents/pesquisador-mercado.md && \
grep -q '### Modo `manutenção da biblioteca`' .claude/agents/pesquisador-mercado.md && \
echo "TASK2_OK"
```
Expected: `TASK2_OK`

- [ ] **Step 5: Commit**

```bash
git add .claude/agents/pesquisador-mercado.md
git commit -m "feat(biblioteca): pesquisador-mercado é owner — lê índice+fichas, propõe candidatas, modo manutenção"
```

---

### Task 3: Criar a skill `/curar-fontes` (ensino por entrevista)

**Files:**
- Create: `.claude/skills/curar-fontes/SKILL.md`

- [ ] **Step 1: Criar `.claude/skills/curar-fontes/SKILL.md`**

```markdown
---
name: curar-fontes
description: Skill interativa para ensinar/curar a biblioteca de fontes da marca — livros, autores, criadores, estudos por pilar/tema, com trechos e páginas que a copy pode riffar. Owner do slice memory/biblioteca/ é o pesquisador-mercado. Use quando o usuário quiser "ensinar de onde a copy tira referência", "adicionar um livro/autor/criador à biblioteca", "curar fontes", "semear a biblioteca por pilar", ou "aprovar/promover as fontes que o sistema sugeriu". Aceita semeadura por pilar, adicionar/editar uma fonte, e promover candidatas a núcleo.
---

# /curar-fontes — Dino Team

## Objetivo

Manter o slice `memory/biblioteca/` — a biblioteca curada de fontes de que a marca tira profundidade. Você ensina **qual recorte/tema/autor/livro/páginas/criador/fonte** sustenta cada pilar; o `pesquisador-mercado` (owner) grava fichas leves (`fontes/<slug>.md`) + índice (`_indice.md`). O `/pesquisar-tema` e o `/novo-post` consultam a biblioteca depois.

A biblioteca guarda **ponteiros + trechos-chave** — **nunca** o texto integral de uma obra. Contrato da ficha: `templates/ficha-fonte.md`.

## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ diagnóstico | `_indice.md` | — | índice atual + candidatas pendentes |
| 2 | ⏸ usuário | — | 1 | modo escolhido |
| 3 | ⚙ coletar campos | input ← 2 | 2 | campos da(s) ficha(s) |
| 4 | `pesquisador-mercado` (manutenção) | campos ← 3 | 3 | ficha + índice (manifesto) |
| 5 | ⚙ confirmar + loop | manifesto ← 4 | 4 | conclusão |

## Sintaxe

```
/curar-fontes [<slug-ou-nome-da-fonte>] [--pilar <pilar>]
```

- Sem argumentos → diagnóstico + escolha de modo (semeadura / adicionar / promover).
- Com `<slug-ou-nome>` → reabre/edita aquela fonte direto.
- `--pilar <pilar>` → restringe a semeadura/triagem a um pilar de `brand/pilares-conteudo.md`.

## Pipeline

### 1. Diagnóstico — mostrar índice atual

Ler `memory/biblioteca/_indice.md` e apresentar inline:

```
Biblioteca de fontes (memory/biblioteca/_indice.md):

Núcleo (aprovadas por você): <contagem por pilar | "(vazio — primeira curadoria)">
Candidatas pendentes (propostas pelo sistema): <lista de slugs status=candidato | "(nenhuma)">

O que vamos fazer?
- "semear <pilar>"        → varrer um pilar e cadastrar fontes do zero
- "adicionar <fonte>"     → cadastrar uma fonte específica
- "<slug>"                → editar uma fonte existente
- "promover"              → revisar e aprovar as candidatas pendentes
```

### 2. Coletar input do usuário

**Semeadura por pilar** (`semear <pilar>` ou `--pilar`): para cada fonte que o usuário citar no pilar, colete os campos do Passo 3. Continue até o usuário dizer "chega".

**Adicionar/editar uma fonte:** vá direto ao Passo 3 para aquela fonte.

**Promover candidatas:** liste cada candidata (abra a ficha-stub `fontes/<slug>.md`), mostre o que o sistema preencheu e pergunte: aprovar (vira `nucleo`) / editar antes de aprovar / descartar. Para "editar antes", colete os campos do Passo 3.

### 3. Coletar campos da ficha

Para cada fonte, pergunte (campos do `templates/ficha-fonte.md`):
1. **Nome + tipo** (livro | autor | criador | estudo | artigo | podcast).
2. **Pilar(es)** — de `brand/pilares-conteudo.md`.
3. **Use para** — que ângulos/temas essa fonte sustenta (1-2 linhas).
4. **Ideias-chave** — 3-5 bullets.
5. **Trechos** — citações/frases com **página/capítulo/URL**. (Pode deixar para depois; ficha sem trecho ainda serve de ponteiro.)
6. **Como a copy riffa** — 1-2 linhas.
7. **Off-limits** — o que evitar.

Gere `slug` em kebab-case a partir do nome (ex: `meditacoes-marco-aurelio`).

### 4. Acionar `pesquisador-mercado` (modo manutenção)

[Agente: `pesquisador-mercado`]

```
Tarefa: manutenção da biblioteca — <criar/editar ficha | promover candidato → núcleo>.

Inputs (campos coletados, por fonte):
- slug / nome / tipo / pilares
- use_para / ideias_chave / trechos (com página/fonte) / como_a_copy_riffa / off_limits
- status: nucleo            # promoção: candidato → nucleo
- proveniencia: usuario via /curar-fontes em <YYYY-MM-DD>

Regras: siga templates/ficha-fonte.md; não invente trechos/páginas (grave só o fornecido);
atualize a linha em _indice.md e ultima_atualizacao nos frontmatters.
Em slug já existente com conteúdo divergente, devolva CONFLITO_FONTE.

Saída: manifesto (arquivos gravados + 1 linha de confirmação).
```

### 5. Confirmar + loop

- **Gravou** → mostrar inline o que entrou no índice (slug + status) e seguir.
- **`CONFLITO_FONTE`** → mostrar o conflito; perguntar substituir / mesclar / manter; re-acionar.

Depois:

```
Gravado em memory/biblioteca/:
- <slug> [<pilar>] · status <nucleo|...>

Mais alguma fonte? (sim/não)
```

Loop até "não". Encerrar reportando os slugs afetados.

## Princípios

- **Fonte é fonte da verdade.** O usuário fornece trechos/páginas; o agente grava — nunca inventa citação.
- **Núcleo só por aprovação.** Candidatas propostas pelo sistema só viram `nucleo` quando o usuário promove aqui.
- **Ficha leve.** Trechos-chave e ponteiros, nunca o texto integral da obra.
- **Incremental.** Pode parar e voltar; cada fonte é independente.

## Critério de conclusão

- Pelo menos uma ficha foi criada/editada/promovida e o `_indice.md` reflete a mudança.
- `pesquisador-mercado` retornou manifesto de confirmação.
- O usuário encerrou explicitamente ("não" para próxima fonte).
```

- [ ] **Step 2: Verificação estrutural**

Run:
```bash
test -f .claude/skills/curar-fontes/SKILL.md && \
grep -q '^name: curar-fontes' .claude/skills/curar-fontes/SKILL.md && \
grep -q '## Fluxo' .claude/skills/curar-fontes/SKILL.md && \
grep -q 'manutenção da biblioteca' .claude/skills/curar-fontes/SKILL.md && \
grep -q 'templates/ficha-fonte.md' .claude/skills/curar-fontes/SKILL.md && \
echo "TASK3_OK"
```
Expected: `TASK3_OK`

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/curar-fontes/
git commit -m "feat(biblioteca): skill /curar-fontes — ensino por entrevista (semeadura, adicionar, promover)"
```

---

### Task 4: Integrar a biblioteca no `/pesquisar-tema`

**Files:**
- Modify: `.claude/skills/pesquisar-tema/SKILL.md`

- [ ] **Step 1: Adicionar "biblioteca primeiro" ao prompt do deep research (Passo 2)**

Localize, no bloco de prompt do Passo 2, a linha:

```
Foco: ângulos não-óbvios e contradições dentro do recorte; referências concretas com link; dados/citações verificáveis; mitos a quebrar.
```

Insira **imediatamente antes** dela:

```
Biblioteca de fontes (1ª parada): consulte memory/biblioteca/_indice.md — filtre por pilar+tema, abra 1-2 fichas e use os trechos curados como matéria-prima primária. A web preenche lacunas.
```

- [ ] **Step 2: Rebaixar a tabela "Perfis de fonte por pilar" para fallback**

Localize o parágrafo de introdução da seção:

```
A skill resolve o perfil a partir de `--pilar` (de `brand/pilares-conteudo.md`) e o passa ao `pesquisador-mercado` nos campos `Fontes` e `Profundidade`. O perfil respeita o `## Off-limits` dos pilares (sem motivação vazia, sem promessa irreal).
```

Insira **imediatamente após** esse parágrafo:

```markdown
> **A biblioteca curada vem primeiro.** Esta tabela é o **fallback de tipo-de-fonte**: o agente consulta `memory/biblioteca/` (fontes concretas com trechos) como 1ª parada; quando a biblioteca não tem fonte para o pilar/tema, esta tabela orienta o tipo de fonte a buscar na web.
```

- [ ] **Step 3: Verificação estrutural**

Run:
```bash
grep -q 'Biblioteca de fontes (1ª parada)' .claude/skills/pesquisar-tema/SKILL.md && \
grep -q 'A biblioteca curada vem primeiro' .claude/skills/pesquisar-tema/SKILL.md && \
echo "TASK4_OK"
```
Expected: `TASK4_OK`

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/pesquisar-tema/SKILL.md
git commit -m "feat(biblioteca): /pesquisar-tema consulta a biblioteca antes da web; tabela vira fallback"
```

---

### Task 5: Integrar a biblioteca no `/novo-post` (copy + captura)

**Files:**
- Modify: `.claude/skills/novo-post/SKILL.md`

- [ ] **Step 1: Adicionar a biblioteca ao contexto de leitura da Copy**

Localize, na seção "Contexto de leitura por passo", a linha do passo Copy:

```
- **Copy (Passo 10):** `estilo.md` (campos `#### editorial` de cada bloco) + `brand/tom-de-voz.md` + `brand/publico-alvo.md` + pesquisa gravada.
```

Substitua por:

```
- **Copy (Passo 10):** `estilo.md` (campos `#### editorial` de cada bloco) + `brand/tom-de-voz.md` + `brand/publico-alvo.md` + pesquisa gravada + fichas selecionadas de `memory/biblioteca/` (índice → 1-2 fichas por pilar/tema).
```

- [ ] **Step 2: Instruir o uso dos trechos das fichas no Passo 10**

Localize, no Passo 10, a lista de arquivos a ler — especificamente a linha:

```
- `memory/pesquisa/<data>-tendencias-<slug>.md` (se pesquisa executada no Passo 9)
```

Insira **imediatamente após** ela:

```
- `memory/biblioteca/_indice.md` → filtre por **pilar+tema do briefing**, abra **só 1-2 fichas** (`memory/biblioteca/fontes/<slug>.md`) e use os **trechos curados** como matéria-prima da copy (sem cópia literal; respeite o `Off-limits` da ficha). Nunca leia a biblioteca inteira. Guarde os `slug` das fontes usadas para o Passo 14.6.
```

- [ ] **Step 3: Adicionar a linha do Passo 14.6 na tabela `## Fluxo`**

Localize, na tabela `## Fluxo` do topo, a linha:

```
| 14.5 | ⚙ adaptar stories (condic., carrossel) + ⏸ | copy, estilo | 14 | frames |
```

Insira **imediatamente após** ela:

```
| 14.6 | ⚙ captura de fonte na biblioteca (condic., não-bloqueia) + ⏸ | slugs de fonte ← 10 | 14 | ficha nova (opcional) |
```

- [ ] **Step 4: Adicionar a seção do Passo 14.6**

Localize o cabeçalho da seção:

```
### 15. Salvar/descartar `_rascunho/` (pausa)
```

Insira **imediatamente antes** dele:

```markdown
### 14.6. Captura de fonte na biblioteca (condicional, não-bloqueia)

**Em `--auto`: pular (sem humano para confirmar).** Só executa se a copy (Passo 10) se apoiou numa fonte que **não estava** em `memory/biblioteca/_indice.md`.

```
A copy usou uma fonte que ainda não está na biblioteca: <nome/fonte>.
Salvar como ficha do pilar <pilar>? Vira matéria-prima para posts futuros.
- "sim"  → eu coleto os campos mínimos e gravo a ficha
- "não"  → segue sem salvar
```

Se "sim", colete o mínimo (nome, tipo, pilar, "use para", 1-2 trechos com página/fonte) e acione `pesquisador-mercado` no modo `manutenção da biblioteca` (`proveniencia: usuario via /novo-post em <data>`, `status: nucleo`). **Nunca bloqueia a entrega** — em qualquer erro, reporte e siga.
```

- [ ] **Step 5: Verificação estrutural**

Run:
```bash
grep -q 'fichas selecionadas de `memory/biblioteca/`' .claude/skills/novo-post/SKILL.md && \
grep -q '### 14.6. Captura de fonte na biblioteca' .claude/skills/novo-post/SKILL.md && \
grep -q '| 14.6 |' .claude/skills/novo-post/SKILL.md && \
echo "TASK5_OK"
```
Expected: `TASK5_OK`

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/novo-post/SKILL.md
git commit -m "feat(biblioteca): /novo-post usa trechos das fichas na copy + captura fonte nova (14.6)"
```

---

### Task 6: Documentar no `CLAUDE.md` (doc-mestre)

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Listar `/curar-fontes` no cluster de Pesquisa e inteligência**

Localize, na seção de skills, o item do `/pesquisar-tema`:

```
- [`/pesquisar-tema`](.claude/skills/pesquisar-tema/SKILL.md) — deep research standalone para um ângulo/tema específico. Grava matéria-prima em `memory/pesquisa/`, reusável por `/novo-post`, `/lote-posts` e `/novo-artigo`.
```

Insira **imediatamente após** ele:

```
- [`/curar-fontes`](.claude/skills/curar-fontes/SKILL.md) — ensina a **biblioteca de fontes curadas** (`memory/biblioteca/`) por entrevista: livros/autores/criadores/estudos por pilar, com trechos/páginas que a copy riffa. Semeadura + adicionar + promover candidatas. Owner do slice: `pesquisador-mercado`.
```

- [ ] **Step 2: Adicionar o slice à lista de Slices (§4)**

Localize, na seção "### 4. Cérebro de marca (`memory/`)", a linha do slice de pesquisa (a última da lista "Slices:"):

```
- `memory/pesquisa/` — pesquisa bruta (insumo cumulativo, não-verdade).
```

Insira **imediatamente após** ela:

```
- `memory/biblioteca/` — `_indice.md` (índice leve) + `fontes/<slug>.md` (fichas curadas: trechos/páginas por pilar/tema). Ensinada por `/curar-fontes`, enriquecida por proposta no scouting; lida 1ª (antes da web) por `/pesquisar-tema` e na copy do `/novo-post` (owner: `pesquisador-mercado`).
```

- [ ] **Step 3: Atualizar a descrição do `pesquisador-mercado` no roster**

Localize:

```
  - [`pesquisador-mercado`](.claude/agents/pesquisador-mercado.md) — pesquisa de mercado/tendências e owner do slice `memory/mercado/`.
```

Substitua por:

```
  - [`pesquisador-mercado`](.claude/agents/pesquisador-mercado.md) — pesquisa de mercado/tendências e owner dos slices `memory/mercado/` e `memory/biblioteca/` (fontes curadas: lê índice+fichas por pilar/tema; propõe candidatas).
```

- [ ] **Step 4: Verificação estrutural**

Run:
```bash
grep -q '/curar-fontes' CLAUDE.md && \
grep -q '`memory/biblioteca/`' CLAUDE.md && \
grep -q 'fontes curadas' CLAUDE.md && \
echo "TASK6_OK"
```
Expected: `TASK6_OK`

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(biblioteca): doc-mestre lista /curar-fontes + slice memory/biblioteca/"
```

---

### Task 7: Smoke test manual (verificação ponta a ponta)

**Files:** nenhum (validação).

> Skills são interativas — esta é uma checklist manual que o executor roda para provar que a feature funciona de ponta a ponta. Não há commit.

- [ ] **Step 1: Semear uma fonte via `/curar-fontes`**

Invoque `/curar-fontes`, escolha "adicionar", cadastre uma fonte real de teste (ex: livro de Mentalidade com 1 trecho + página). Confirme a gravação.

Verifique:
```bash
ls memory/biblioteca/fontes/*.md | grep -v gitkeep && \
grep -c '| ' memory/biblioteca/_indice.md
```
Expected: pelo menos 1 ficha listada; a tabela do índice tem ≥ 1 linha de dados (além do cabeçalho/separador).

- [ ] **Step 2: Confirmar a ficha segue o contrato**

Run:
```bash
f=$(ls memory/biblioteca/fontes/*.md | grep -v gitkeep | head -1); \
grep -q 'status:' "$f" && grep -q 'pilares:' "$f" && grep -q '\*\*Trechos:\*\*' "$f" && echo "FICHA_OK"
```
Expected: `FICHA_OK`

- [ ] **Step 3: Verificar consulta no `/pesquisar-tema`**

Invoque `/pesquisar-tema "<tema do mesmo pilar da fonte semeada>" --pilar <pilar>`. Observe que o agente **consulta o índice e abre a ficha** (cita o trecho na pesquisa gravada) antes de partir para a web.

Verifique que o arquivo de pesquisa referencia a fonte da biblioteca:
```bash
ls -t memory/pesquisa/*.md | head -1
```
Expected: arquivo recente; ao abri-lo, a fonte curada aparece como matéria-prima.

- [ ] **Step 4: Sanity check do repositório**

Run:
```bash
npm test
```
Expected: a suíte existente continua PASS (nenhuma regressão; as Tasks 1–6 não tocam JS).

- [ ] **Step 5: Relatar resultado do smoke test ao usuário**

Resuma: fonte semeada, índice atualizado, `/pesquisar-tema` consultou a biblioteca, `npm test` verde.

---

### Task 8 (OPCIONAL — deferível): Hook `--fontes` no write-back do registro de ângulos

> **Recomendação: deferir.** O dado `--fontes` só tem **consumidor** quando o **loop de performance** existir (Horizonte; gatilho = conta IG/API populando `metricas.md`). Construir agora gera dado write-only (YAGNI). Implemente esta task **apenas** se o usuário quiser começar a coletar histórico desde já. Esta task altera um ledger compartilhado (`registro-angulos.md`) e o contrato do `analista-performance` — não é tão "fina" quanto parece.

**Files:**
- Create: `scripts/memory/append_registro_angulos.test.js`
- Modify: `scripts/memory/append_registro_angulos.js`
- Modify: `package.json` (glob de teste)
- Modify: `memory/performance/registro-angulos.md` (migração de coluna)
- Modify: `.claude/skills/novo-post/SKILL.md` (Passo 15.5 passa `--fontes`)
- Modify: `.claude/agents/analista-performance.md` (documentar a coluna)

- [ ] **Step 1: Escrever o teste que falha (coluna `fontes`)**

Crie `scripts/memory/append_registro_angulos.test.js`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SCRIPT = 'scripts/memory/append_registro_angulos.js';

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'ra-'));
  const path = join(dir, 'registro-angulos.md');
  writeFileSync(path, [
    '---',
    'slice: performance',
    'owner: analista-performance',
    'ultima_atualizacao: 2026-01-01',
    'versao: 1',
    '---',
    '',
    '# Registro',
    '',
    '| slug | data | canal | ângulo | verdade | pilar | descanso | fontes |',
    '|---|---|---|---|---|---|---|---|',
    '',
  ].join('\n'), 'utf8');
  return path;
}

function run(path, args) {
  return execFileSync('node', [SCRIPT, ...args], {
    env: { ...process.env, REGISTRO_ANGULOS_PATH: path },
    encoding: 'utf8',
  });
}

test('grava a coluna fontes quando --fontes é passado', () => {
  const path = fixture();
  const out = run(path, [
    '--slug', 'p1', '--data', '2026-06-09', '--canal', 'instagram',
    '--angulo', 'a1', '--verdade', 'direcao', '--pilar', 'mentalidade',
    '--fontes', 'meditacoes-marco-aurelio,habitos-atomicos',
  ]);
  assert.match(out, /meditacoes-marco-aurelio,habitos-atomicos/);
  const content = readFileSync(path, 'utf8');
  assert.match(content, /\| p1 \| 2026-06-09 \| instagram \| a1 \| direcao \| mentalidade \| 21d \| meditacoes-marco-aurelio,habitos-atomicos \|/);
});

test('fontes default vazio quando omitido', () => {
  const path = fixture();
  const out = run(path, [
    '--slug', 'p2', '--data', '2026-06-09', '--canal', 'blog',
    '--angulo', 'a2', '--verdade', 'neutro',
  ]);
  assert.match(out, /\| p2 \|.*\| 21d \|  \|$/m);
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `node --test scripts/memory/append_registro_angulos.test.js`
Expected: FAIL (a coluna `fontes` ainda não é escrita; a linha tem 7 colunas, não 8).

- [ ] **Step 3: Implementar `--fontes` no script**

Em `scripts/memory/append_registro_angulos.js`:

a) Atualize o `HEADER_PATTERN` para incluir a 8ª coluna:

```javascript
const HEADER_PATTERN = /\|\s*slug\s*\|\s*data\s*\|\s*canal\s*\|\s*ângulo\s*\|\s*verdade\s*\|\s*pilar\s*\|\s*descanso\s*\|\s*fontes\s*\|/i;
```

b) Adicione o default após `const descanso = ...`:

```javascript
const fontes = args.fontes || '';
```

c) Atualize a construção da linha (`newLine`) para incluir a célula `fontes`:

```javascript
const newLine = `| ${escapeCell(args.slug)} | ${args.data} | ${escapeCell(args.canal)} | ${escapeCell(args.angulo)} | ${escapeCell(args.verdade)} | ${escapeCell(pilar)} | ${escapeCell(descanso)} | ${escapeCell(fontes)} |`;
```

d) Adicione `--fontes` ao bloco `usage()` (linha opcional, após `--descanso`):

```javascript
  [--descanso <ex: 21d|6sem>] \\
  [--fontes <slugs separados por vírgula>]`);
```

- [ ] **Step 4: Migrar `memory/performance/registro-angulos.md` (cabeçalho)**

Adicione a coluna `fontes` ao cabeçalho e ao separador da tabela. Localize:

```
| slug | data | canal | ângulo | verdade | pilar | descanso |
|---|---|---|---|---|---|---|
```

Substitua por:

```
| slug | data | canal | ângulo | verdade | pilar | descanso | fontes |
|---|---|---|---|---|---|---|---|
```

> As linhas de dados existentes ficam com 7 colunas (a 8ª lê como vazia em Markdown — aceitável). Se preferir, anexe ` |` ao fim de cada linha de dado existente para normalizar.

- [ ] **Step 5: Rodar o teste e confirmar que passa**

Run: `node --test scripts/memory/append_registro_angulos.test.js`
Expected: PASS (2 testes).

- [ ] **Step 6: Incluir `scripts/memory/*.test.js` no `npm test`**

Em `package.json`, localize:

```json
    "test": "node --test scripts/editor/*.test.js scripts/orquestracao/*.test.js",
```

Substitua por:

```json
    "test": "node --test scripts/editor/*.test.js scripts/orquestracao/*.test.js scripts/memory/*.test.js",
```

Run: `npm test`
Expected: toda a suíte (incluindo os 2 novos) PASS.

- [ ] **Step 7: Passar `--fontes` no Passo 15.5 do `/novo-post`**

Em `.claude/skills/novo-post/SKILL.md`, no bloco bash do Passo 15.5, adicione antes do fim do comando (após a linha `--descanso ...`):

```bash
  --fontes "<slugs das fontes da biblioteca usadas no Passo 10, separados por vírgula; vazio se nenhuma>"
```

E atualize o texto do passo para mencionar que `--fontes` registra os `slug` das fichas usadas (alimenta o loop de performance futuro).

- [ ] **Step 8: Documentar a coluna no `analista-performance`**

Em `.claude/agents/analista-performance.md`, na descrição do formato do `registro-angulos.md`, acrescente a coluna `fontes` (slugs de `memory/biblioteca/` usados na peça; vazio quando nenhuma) e a nota: alimenta a correlação fonte↔engajamento quando o loop de performance existir.

- [ ] **Step 9: Commit**

```bash
git add scripts/memory/ package.json memory/performance/registro-angulos.md .claude/skills/novo-post/SKILL.md .claude/agents/analista-performance.md
git commit -m "feat(biblioteca): hook --fontes no registro-angulos (coleta histórico p/ loop de performance)"
```

---

## Self-Review (executar após escrever o plano)

1. **Cobertura da spec:** §2 estrutura → Task 1; §3 `/curar-fontes` → Task 3; §4 captura no post → Task 5; §5 propor candidatas → Task 2; §6 integração pesquisa+copy → Tasks 4,5; §7 Horizonte/hook → Task 8 (opcional); §8 fora de escopo → respeitado (sem texto integral, sem loop, sem agente novo); ownership/schema/docs → Tasks 1,2,6. ✔
2. **Sem placeholders:** todo conteúdo de arquivo é concreto; verificações são comandos reais com saída esperada. ✔
3. **Consistência de tipos/nomes:** `status` (`nucleo`/`candidato`), `proveniencia`, modo `manutenção da biblioteca`, `templates/ficha-fonte.md`, slugs de coluna `fontes` — consistentes entre Tasks 1/2/3/5/8. ✔
