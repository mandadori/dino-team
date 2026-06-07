---
name: pesquisar-mercado
description: Captura de inteligência de mercado durável (Fase A): tendências quentes do mês, padrão de comunicação de concorrentes, fala do público. Escreve em `memory/mercado/` e `memory/publico/`. Disparável manual ou por cron (Onda 5); também acionada pelo `/novo-post` quando a inteligência está stale. Não produz conteúdo.
---

# /pesquisar-mercado — Dino Team

## Objetivo

Capturar inteligência de mercado durável para o cérebro da marca: tendências do mês, padrão de comunicação dos concorrentes e fala do público. Escreve nos slices `memory/mercado/` e `memory/publico/`. **Não produz post, copy ou briefing** — é matéria-prima para as skills de produção (`/novo-post`, `/lote-posts`, `/planejar-pauta-semanal`) e para o `/ciclo-de-direcao`.

Pode ser disparada manualmente, pela produção (quando a inteligência está stale — check do `/novo-post` Passo 2a) ou por cron (Onda 5, via `orquestracao/rotas.yaml`).

## Sintaxe

```
/pesquisar-mercado [--mes <YYYY-MM>] [--profundidade <rapida|deep>]
```

- **`--mes <YYYY-MM>`** — opcional. Mês de referência. Default: mês corrente (`date +%Y-%m`).
- **`--profundidade <rapida|deep>`** — opcional. Default: `deep`.

## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ reunir parâmetros | input | — | mês de referência, profundidade |
| 2 | `pesquisador-mercado` (scouting Fase A) | mês de referência, profundidade ← 1 | 1 | `memory/mercado/` + `memory/publico/` atualizados |
| 3 | ⚙ relatório inline | manifesto ← 2 | 2 | achados-chave, arquivos atualizados, novos concorrentes |

## Agentes

| Agente | Quando |
|---|---|
| `pesquisador-mercado` | Único passo de pesquisa (Fase A — inteligência durável) |

---

## Pipeline

### 1. Reunir parâmetros

Determinar o mês de referência:

```bash
MES=$(date +%Y-%m)   # ou --mes passado pelo usuário
```

Profundidade default: `deep research`.

### 2. Scouting de mercado (Fase A — inteligência durável)

Acionar `pesquisador-mercado`:

```
Tarefa: scouting de mercado (Fase A — inteligência durável).
Profundidade: deep research.

Inputs:
- Mês de referência: <YYYY-MM>

Saída: gravar/atualizar memory/mercado/tendencias/<YYYY-MM>.md, memory/mercado/concorrentes/<slug>.md e memory/publico/ (dores/objeções) conforme a metodologia do modo scouting de mercado.
```

O agente executa varredura profunda (WebSearch + WebFetch) dos nichos dos pilares da marca (treino/hipertrofia, motivação-filosofia/disciplina, informacional), seguindo as diretivas de `memory/mercado/_diretivas.md`. Grava aprendizado durável nos slices. Devolve manifesto com arquivos criados/atualizados.

### 3. Relatório inline

Apresentar ao usuário:

```
Inteligência de mercado atualizada — <YYYY-MM>

Arquivos atualizados:
- <lista do manifesto>

Novos concorrentes detectados: <lista ou "nenhum">

Achados-chave:
- <achado 1 em 1 linha>
- <achado 2 em 1 linha>
- (máx 5 bullet points)

Próximo passo sugerido: /planejar-pauta-semanal ou /novo-post para usar a inteligência fresca.
```

---

## Notas operacionais

- **Sem write-back de livro-razão** — esta skill não produz peça; write-back só acontece em `/novo-post` (Passo 15.6) e `/lote-posts` (Passo 8.6).
- **Agendável (Onda 5):** entrada em `orquestracao/rotas.yaml` prevista para ligar cron mensal. Por ora, disparo manual.
- **Idempotente:** rodar duas vezes no mesmo mês **adiciona** entradas de scouting (não sobrescreve — o agente segue o protocolo append do slice).
- **Stale check:** o `/novo-post` decide quando acionar esta skill (arquivo `memory/mercado/tendencias/<YYYY-MM>.md` ausente ou com mais de 14 dias).

## Critério de conclusão

- `memory/mercado/tendencias/<YYYY-MM>.md` existe e foi atualizado com a varredura do mês.
- Relatório inline entregue com arquivos atualizados e achados-chave.
