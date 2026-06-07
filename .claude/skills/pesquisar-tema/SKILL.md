---
name: pesquisar-tema
description: Levanta matéria-prima profunda (deep research) para um ângulo/tema específico — dados, contradições, mitos, referências com fonte. Grava em `memory/pesquisa/<data>-<slug>.md`, reusável por `/novo-post`. Disparável manual ou pela produção quando o ângulo é informacional.
---

# /pesquisar-tema — Dino Team

## Objetivo

Levantar matéria-prima editorial profunda para um ângulo ou tema específico: dados verificáveis, contradições, mitos a quebrar, referências concretas com link. Grava o resultado em `memory/pesquisa/` para ser consumido pelo `/novo-post` (Passo 10) ou `/lote-posts` — evita repetir a pesquisa quando vários posts usam o mesmo tema.

**Não produz copy, design nem briefing.** É pesquisa bruta (insumo cumulativo).

## Sintaxe

```
/pesquisar-tema <tema/ângulo> [--pilar <pilar>] [--recorte <texto>]
```

- **`<tema/ângulo>`** — obrigatório. Ângulo ou tema a pesquisar (texto livre).
- **`--pilar <pilar>`** — opcional. Pilar de `brand/pilares-conteudo.md` para filtrar relevância.
- **`--recorte <texto>`** — opcional. Segmento de público ou restrição de foco.

## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ parse | input | — | tema, pilar, recorte, slug |
| 2 | `pesquisador-mercado` (deep research) | tema, pilar, recorte, slug ← 1 | 1 | `memory/pesquisa/<data>-<slug>.md` |
| 3 | ⚙ entregar | manifesto ← 2 | 2 | caminho do arquivo + achado-chave inline |

## Agentes

| Agente | Quando |
|---|---|
| `pesquisador-mercado` | Único passo de pesquisa profunda (deep research) |

---

## Pipeline

### 1. Parsear input

Tokenize a entrada:
- `--pilar <texto>` → `pilar`.
- `--recorte <texto>` → `recorte`.
- Restante → `tema` (texto livre).

Gerar `slug` a partir do tema: kebab-case, 2-5 palavras (ex: `disciplina-sem-motivacao`).

Data de hoje: `DATA=$(date +%F)`.

### 2. Pesquisa profunda (deep research)

Acionar `pesquisador-mercado`:

```
Tarefa: levantar matéria-prima profunda para a copy.
Profundidade: deep research (WebFetch nas fontes promissoras).

Inputs:
- Formato/Estilo/Tema: — / — / <tema>
- Pilar / Recorte / Sinalizações: <pilar ou "nenhum"> / <recorte ou "nenhum"> / <nenhuma>
- Contexto de mercado acumulado: memory/mercado/tendencias/<YYYY-MM atual>.md + memory/mercado/concorrentes/*.md (parta daqui; não redescubra tendências já mapeadas).

Foco: ângulos não-óbvios e contradições dentro do recorte; referências concretas com link; dados/citações verificáveis; mitos a quebrar.

Template: templates/pesquisa.md.
Saída: gravar em memory/pesquisa/<DATA>-tendencias-<slug>.md.
```

Onde `<DATA>` e `<slug>` vêm do Passo 1.

### 3. Entregar

Apresentar ao usuário:

```
Pesquisa gravada: memory/pesquisa/<DATA>-tendencias-<slug>.md

Achado-chave: <achado do manifesto em 1 linha>

Para usar em um post:
  /novo-post <formato> --briefing <caminho-do-briefing>
  ou: /novo-post <formato> <tema>  (o Passo 9 pulará a pesquisa — arquivo já existe)
```

---

## Notas operacionais

- **Reusável:** o arquivo gravado em `memory/pesquisa/` é consumido pelo `/novo-post` Passo 10 e `/lote-posts` Passo 5d quando a slug bater. Pré-pesquisar antes de um lote evita N chamadas ao agente de pesquisa.
- **Sem write-back de livro-razão** — esta skill não produz peça.
- **Sem Fase B** — seleção de candidatos permanece inline no `/novo-post` (acoplada à produção).
- **Parte do contexto de mercado acumulado:** a pesquisa parte de `memory/mercado/` já mapeado, não redescobre tendências do zero.

## Critério de conclusão

- `memory/pesquisa/<DATA>-tendencias-<slug>.md` existe e contém matéria-prima com fontes.
- Caminho do arquivo e achado-chave entregues ao usuário inline.
