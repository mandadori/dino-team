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
