# Scouting de Conteúdo Viral em Duas Fases — Implementation Plan

> **For agentic workers:** This plan implements a prompt/markdown system (agent + skill definitions), not executable code. There is no test runner. Each task's "verification" is a **structural check** (grep/read confirming the inserted content) plus a **reasoning dry-run** against the spec's acceptance criteria. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the `/novo-post` scouting step into a two-phase engine — durable market intelligence (Fase A, cached in `dados/mercado/`) feeding a fast ranked candidate selection (Fase B) — without creating a new agent.

**Architecture:** Capability lives in agents (`pesquisador-mercado` gains two named modes; `briefing-writer` gains slice-reading + a selection rule). Orchestration lives in the skill (`/novo-post` P2a gains a freshness check + auto-heal + ranked-selection pause). P4/P7 receive the market slice as input. No new credentials; v1 sources are WebSearch+WebFetch only.

**Tech Stack:** Markdown agent/skill definitions under `.claude/`, Bash for the freshness check, git for commits. Spec: `docs/specs/2026-05-24-scouting-viral-duas-fases-design.md`.

---

## Verification approach (read once)

This domain has no `pytest`/`jest`. For each task:
- **Structural check** = `grep`/`Read` confirming the new section exists and is internally coherent.
- **Reasoning dry-run** = re-read the edited file and confirm it satisfies the relevant §6 acceptance criterion from the spec.
- **Commit** after each task, on the existing branch `feat/scouting-viral-duas-fases`.

The spec's acceptance criteria (§6) are the real "test suite"; the final task walks all of them.

---

## File structure

| File | Responsibility | Action |
|---|---|---|
| `.claude/agents/pesquisador-mercado.md` | Owns the two scouting modes (Fase A write-to-slice; Fase B ranked selection) | Modify — add `## Tipos de tarefa que você executa` |
| `.claude/agents/briefing-writer.md` | Reads market slice; applies the unified selection rule | Modify — extend `## Contexto que carrego`, `## Tipos de tarefa`, `## Contrato de entrada` |
| `.claude/skills/novo-post/SKILL.md` | Orchestrates freshness → auto-heal → ranked selection; passes slice to P4/P7 | Modify — rewrite P2a; extend P4 + P7 prompts; update Agentes table |

No new files in v1. No slice schema changes (the slice files are written at runtime by the agent, not created by this plan).

---

## Task 1: `pesquisador-mercado` — declare the two modes

**Files:**
- Modify: `.claude/agents/pesquisador-mercado.md` (insert a new section between `## Princípios da especialidade` ending at line 46 and `## Contrato de entrada` at line 48)

- [ ] **Step 1: Insert the `## Tipos de tarefa que você executa` section**

Use Edit. `old_string` is the boundary between the two existing sections:

````text
- **Marca como guard rail.** Toda sugestão precisa caber em algum pilar declarado; recusar sugestão fora de pilar é parte do trabalho.

## Contrato de entrada
````

`new_string`:

`````text
- **Marca como guard rail.** Toda sugestão precisa caber em algum pilar declarado; recusar sugestão fora de pilar é parte do trabalho.

## Tipos de tarefa que você executa

Além de pesquisa genérica sob demanda, você executa dois modos nomeados de scouting. A skill que te aciona declara o modo no campo **Tarefa**.

### Modo `scouting de mercado` (inteligência de mercado durável — Fase A)

Varredura profunda dos nichos dos pilares da marca (treino/hipertrofia, motivação-filosofia/disciplina, informacional) via WebSearch + WebFetch. Objetivo: descobrir o que está em alta e por quê, deixando aprendizado durável no slice.

O que procurar:
- **Temas/ângulos em alta** no nicho, com recorrência observável entre fontes.
- **Padrão de comunicação de concorrentes** — hooks recorrentes, formatos, tom, cadência (só o observável na web pública).
- **Sinais de engajamento observáveis** — views/comentários no YouTube, volume de discussão, repetição de cobertura. Declare sempre o sinal e a fonte; nunca invente métrica.

Onde gravar (você é owner do slice `dados/mercado/`):
- `dados/mercado/tendencias/<YYYY-MM>.md` — tendências quentes do mês, organizadas por pilar, cada uma com fonte + sinal observado. Crie o arquivo se não existir.
- `dados/mercado/concorrentes/<slug>.md` — um arquivo por concorrente relevante, com o padrão de comunicação validado.
- `dados/mercado/vocabulario-publico.md` — enriqueça com termos/jargões/dores em linguagem do leitor.

Guard-rail: só registre o que casa com um pilar declarado. Tema sem pilar não sobe (`FORA_DE_PILAR`).

Fonte no v1: apenas WebSearch + WebFetch (web pública). Quando existir `scripts/integrations/fetch_instagram_competitors.js`, leia também a métrica real de IG que ele entregar.

### Modo `seleção de candidatos` (ranqueamento rápido — Fase B)

Leitura do slice `dados/mercado/` acumulado + `dados/performance/angulos-queimados.md` (para não repetir ângulo recente) + pilares. Devolve **N candidatos ranqueados** (default 3-5) por potencial de engajamento, **inline, sem escrever no slice**.

Formato de cada candidato:

```
N. <ângulo em 1 linha>  [pilar: <X>]
   Sustentação: <tendência/concorrente que embasa> — <fonte>
   Potencial: <por que engaja, 1 linha — sinal observado>
```

"Potencial de engajamento" no v1 é **estimativa de sinal de mercado** (sinal observado + frescor + saturação do ângulo) filtrada por fit de marca — não modelo aprendido. Ranqueie do maior para o menor potencial. Todo candidato cabe num pilar declarado.

## Contrato de entrada
`````

- [ ] **Step 2: Structural check**

Run: `grep -n "scouting de mercado\|seleção de candidatos\|Tipos de tarefa" ".claude/agents/pesquisador-mercado.md"`
Expected: lines for the new section header and both mode subheaders.

- [ ] **Step 3: Reasoning dry-run**

Read the section back. Confirm it satisfies §6 criterion 1: *"a definição do `pesquisador-mercado` declara os dois modos com metodologia, sinais de engajamento observáveis e convenção de escrita no slice."* All three must be present (methodology ✓, observable signals ✓, write-to-slice paths ✓).

- [ ] **Step 4: Commit**

```bash
git add .claude/agents/pesquisador-mercado.md
git commit -m "feat(pesquisador-mercado): adiciona modos scouting de mercado e seleção de candidatos

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 2: `briefing-writer` — read market slice + selection rule

**Files:**
- Modify: `.claude/agents/briefing-writer.md` (three edits: `## Contexto que carrego` ~line 21-25; `## Tipos de tarefa que você executa`; `## Contrato de entrada`)

- [ ] **Step 1: Extend the obligatory reading list with the market slice**

Use Edit. `old_string`:

````text
Leitura adicional **obrigatória** antes de produzir briefing estratégico (não obrigatória para recomendar estilo):
- `dados/ramon/contexto.md` — para situar o post no momento do Ramon (fase atual + cronograma: campeonato próximo? viagem? off-season?) e calibrar tom e ângulo.
- `dados/performance/angulos-queimados.md` — para não repetir um ângulo recente.

Se algum dos 2 estiver ausente, **siga sem ele e declare a ausência no campo `## Sinalizações` do briefing** (ex: `"sinalizações: ausência de dados/ramon/contexto.md — briefing produzido sem este sinal"`). Não bloqueie por banco vazio.
````

`new_string`:

````text
Leitura adicional **obrigatória** antes de produzir briefing estratégico (não obrigatória para recomendar estilo):
- `dados/ramon/contexto.md` — para situar o post no momento do Ramon (fase atual + cronograma: campeonato próximo? viagem? off-season?) e calibrar tom e ângulo.
- `dados/performance/angulos-queimados.md` — para não repetir um ângulo recente.
- `dados/mercado/tendencias/<mês-atual em YYYY-MM>.md` — para ancorar o ângulo no que está em alta no nicho.
- `dados/mercado/concorrentes/*.md` — para conhecer o padrão de comunicação validado dos concorrentes.

Se algum deles estiver ausente, **siga sem ele e declare a ausência no campo `## Sinalizações` do briefing** (ex: `"sinalizações: ausência de dados/ramon/contexto.md — briefing produzido sem este sinal"`). Não bloqueie por banco vazio.
````

- [ ] **Step 2: Add the selection rule to `## Tipos de tarefa que você executa`**

Use Edit. `old_string` (the existing list of two task types):

````text
1. **Recomendar estilo** para um tema, lendo os `estilo.md` disponíveis e avaliando contra o tema/pilar/público (usa `## Quando usar` e `## Quando NÃO usar` de cada estilo). Pode recomendar `ad-hoc` quando nenhum couber bem.
2. **Produzir briefing estratégico** preenchendo o schema canônico abaixo.
````

`new_string`:

````text
1. **Recomendar estilo** para um tema, lendo os `estilo.md` disponíveis e avaliando contra o tema/pilar/público (usa `## Quando usar` e `## Quando NÃO usar` de cada estilo). Pode recomendar `ad-hoc` quando nenhum couber bem.
2. **Produzir briefing estratégico** preenchendo o schema canônico abaixo.

Quando a tarefa de produzir briefing vier acompanhada de uma **lista de candidatos ranqueada** (do `pesquisador-mercado`, modo seleção de candidatos), aplique a regra de seleção:

- **Com escolha do humano** (a skill marca o candidato selecionado) → formalize **aquele** candidato. A escolha do humano vence.
- **Sem escolha** (execução automatizada, sem humano) → **você seleciona** o candidato de maior potencial, ajustado por fit de marca, contexto do Ramon e ângulos queimados, e então formaliza. Você é a autoridade do ângulo.

Em ambos os casos o output é o mesmo briefing canônico — a lista de candidatos é insumo, não muda o schema de saída.
````

- [ ] **Step 3: Add the ranked-list input to `## Contrato de entrada`**

Use Edit. `old_string`:

````text
  - Estilo (quando aplicável): slug existente OU "ad-hoc" + caminho do estilo.md em uso.
  - Data: `YYYY-MM-DD` (quando produzindo briefing).
````

`new_string`:

````text
  - Estilo (quando aplicável): slug existente OU "ad-hoc" + caminho do estilo.md em uso.
  - Data: `YYYY-MM-DD` (quando produzindo briefing).
  - Candidatos ranqueados (opcional): lista vinda do `pesquisador-mercado` (modo seleção), com a escolha do humano marcada quando houver.
````

- [ ] **Step 4: Structural check**

Run: `grep -n "dados/mercado/tendencias\|Candidatos ranqueados\|regra de seleção\|Com escolha do humano" ".claude/agents/briefing-writer.md"`
Expected: matches for the slice reading, the input line, and both branches of the selection rule.

- [ ] **Step 5: Reasoning dry-run**

Read the three edited zones. Confirm §6 criterion 2: *"a definição do `briefing-writer` declara a leitura do slice `dados/mercado/` e a regra unificada de seleção (recebe lista ranqueada + escolha opcional; seleciona quando a escolha está ausente)."*

- [ ] **Step 6: Commit**

```bash
git add .claude/agents/briefing-writer.md
git commit -m "feat(briefing-writer): lê slice de mercado e aplica regra de seleção de candidato

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 3: `/novo-post` — rewrite P2a into two-phase scouting

**Files:**
- Modify: `.claude/skills/novo-post/SKILL.md` (the `#### 2a. Tema` subsection, currently lines ~57-72)

- [ ] **Step 1: Replace the `#### 2a. Tema` subsection**

Use Edit. `old_string` (current 2a):

`````text
#### 2a. Tema

- **Tema veio no input** → usa direto.
- **Sem tema** → acione `pesquisador-mercado` modo scouting:

```
Tarefa: sugerir tema para um post Instagram.
Profundidade: rápida / decisória.

Inputs:
- Formato: <formato>
- Estilo: <slug se veio no input, senão "ainda não definido">
- Tema já definido: nenhum

Saída inline (3-4 linhas): tema sugerido + motivo, ancorando em pilar/público/tendência.
```
`````

`new_string`:

``````text
#### 2a. Tema

- **Tema veio no input** → usa direto. **Pula todo o scouting (bypass)** — vai para o Passo 2b.
- **Sem tema** → scouting de duas fases (2a.i → 2a.ii → 2a.iii):

##### 2a.i — Checar frescor da inteligência de mercado

```bash
f="dados/mercado/tendencias/$(date +%Y-%m).md"
if [ -f "$f" ] && [ -z "$(find "$f" -mtime +14 2>/dev/null)" ]; then echo "FRESCO"; else echo "STALE"; fi
```

##### 2a.ii — Auto-heal (só se STALE)

Avise o usuário ("Atualizando inteligência de mercado, isso leva um pouco…") e acione `pesquisador-mercado`:

```
Tarefa: scouting de mercado (Fase A — inteligência durável).
Profundidade: deep research.

Inputs:
- Pilares da marca: (de brand/pilares-conteudo.md)
- Mês de referência: <YYYY-MM>

Saída: gravar/atualizar dados/mercado/tendencias/<YYYY-MM>.md, dados/mercado/concorrentes/<slug>.md e dados/mercado/vocabulario-publico.md conforme a metodologia do modo scouting de mercado.
```

Se FRESCO, pule este passo.

##### 2a.iii — Seleção ranqueada (sempre)

Acione `pesquisador-mercado`:

```
Tarefa: seleção de candidatos (Fase B — ranqueamento).

Inputs:
- Formato: <formato>
- Estilo: <slug se veio no input, senão "ainda não definido">
- Quantidade de candidatos: 3-5

Saída inline: candidatos ranqueados (ângulo + pilar + sustentação + potencial), do maior para o menor potencial.
```

Apresente e pause:

```
Candidatos (ranqueados por potencial):
<lista do agente>

Responda:
- <número> → escolhe o candidato
- "mais"   → re-ranqueia / traz outros
- ajuste em texto livre
- ou dê seu próprio tema (bypass — sua escolha vence)
```

A escolha define `tema`. **Guarde o candidato escolhido + a lista ranqueada** (serão reenviados no Passo 4). Se "mais"/ajuste, re-acione o modo seleção e reapresente. **Aguarde escolha explícita** antes de seguir ao Passo 2b.
``````

- [ ] **Step 2: Structural check**

Run: `grep -n "2a.i\|2a.ii\|2a.iii\|FRESCO\|bypass\|seleção de candidatos" ".claude/skills/novo-post/SKILL.md"`
Expected: matches for the three sub-steps, the freshness sentinel, the bypass note, and the Fase B task.

- [ ] **Step 3: Reasoning dry-run**

Confirm §6 criteria 3 and 4: the "sem tema" branch checks freshness, fires Fase A when stale, and presents ranked candidates in the §4.1 format; the "tema veio no input" branch bypasses both phases. Trace both branches mentally.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/novo-post/SKILL.md
git commit -m "feat(novo-post): P2a vira scouting de duas fases com auto-heal

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 4: `/novo-post` — pass slice + ranked list to P4 and P7

**Files:**
- Modify: `.claude/skills/novo-post/SKILL.md` (P4 briefing prompt ~lines 179-210; P7 deep-research prompt ~lines 247-261)

- [ ] **Step 1: Add candidate inputs to the P4 (briefing-writer) prompt**

Use Edit. `old_string`:

````text
- Estilo: <slug | "ad-hoc">
- Caminho do estilo: <templates/formatos/<formato>/estilos/<slug>/ | templates/formatos/<formato>/estilos/_rascunho/>
- Tema: <tema>
- Data: <YYYY-MM-DD>

Leia o estilo.md no caminho indicado (## Estrutura é fonte da modulação de tom por bloco).
````

`new_string`:

````text
- Estilo: <slug | "ad-hoc">
- Caminho do estilo: <templates/formatos/<formato>/estilos/<slug>/ | templates/formatos/<formato>/estilos/_rascunho/>
- Tema: <tema>
- Data: <YYYY-MM-DD>
- Candidatos ranqueados: <lista da Fase B guardada no Passo 2a.iii | "nenhum — tema veio no input (sem scouting)">
- Candidato escolhido pelo humano: <o selecionado no Passo 2a.iii | "nenhum">

Leia o estilo.md no caminho indicado (## Estrutura é fonte da modulação de tom por bloco).
````

- [ ] **Step 2: Add market-slice context to the P7 (deep research) prompt**

Use Edit. `old_string`:

````text
Inputs:
- Formato/Estilo/Tema: <formato> / <slug | "ad-hoc"> / <tema>
- Pilar / Recorte / Sinalizações: <inline do briefing>

Foco: ângulos não-óbvios e contradições dentro do recorte; referências concretas com link; dados/citações verificáveis; mitos a quebrar.
````

`new_string`:

````text
Inputs:
- Formato/Estilo/Tema: <formato> / <slug | "ad-hoc"> / <tema>
- Pilar / Recorte / Sinalizações: <inline do briefing>
- Contexto de mercado acumulado: dados/mercado/tendencias/<mês-atual em YYYY-MM>.md + dados/mercado/concorrentes/*.md (parta daqui; não redescubra tendências já mapeadas).

Foco: ângulos não-óbvios e contradições dentro do recorte; referências concretas com link; dados/citações verificáveis; mitos a quebrar.
````

- [ ] **Step 3: Structural check**

Run: `grep -n "Candidatos ranqueados\|Candidato escolhido pelo humano\|Contexto de mercado acumulado" ".claude/skills/novo-post/SKILL.md"`
Expected: the two P4 input lines and the one P7 input line.

- [ ] **Step 4: Reasoning dry-run**

Confirm §6 criterion 5: *"P4 e P7 recebem o slice `dados/mercado/` como input."* P4 receives the candidate list + choice (and the agent auto-reads the slice per Task 2); P7 receives the slice paths explicitly.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/novo-post/SKILL.md
git commit -m "feat(novo-post): P4 recebe candidatos; P7 recebe contexto de mercado

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 5: `/novo-post` — update Agentes table + full acceptance walk

**Files:**
- Modify: `.claude/skills/novo-post/SKILL.md` (Agentes table row for `pesquisador-mercado`, ~line 35)

- [ ] **Step 1: Update the `pesquisador-mercado` row in the Agentes table**

Use Edit. `old_string`:

````text
| `pesquisador-mercado` | Scouting de tema + pesquisa profunda | formato/estilo OU briefing | sugestão inline (scouting) OU `dados/pesquisas-brutas/<data>-tendencias-<slug>.md` |
````

`new_string`:

````text
| `pesquisador-mercado` | Fase A (scouting de mercado → slice) + Fase B (seleção ranqueada) + pesquisa profunda (P7) | modo + formato/estilo (P2a) / briefing (P7) | slice `dados/mercado/` atualizado (Fase A) / candidatos ranqueados inline (Fase B) / `dados/pesquisas-brutas/<data>-tendencias-<slug>.md` (P7) |
````

- [ ] **Step 2: Structural check**

Run: `grep -n "Fase A (scouting de mercado" ".claude/skills/novo-post/SKILL.md"`
Expected: one match in the Agentes table.

- [ ] **Step 3: Full acceptance walk against spec §6**

Read the spec's §6 criteria and tick each against the edited files:

```bash
sed -n '/## 6. Critérios de aceite/,/## 7/p' "docs/specs/2026-05-24-scouting-viral-duas-fases-design.md"
```

Confirm one by one:
- [ ] `pesquisador-mercado` declares both modes (Task 1)
- [ ] `briefing-writer` declares slice reading + selection rule (Task 2)
- [ ] P2a "sem tema" branch: freshness → auto-heal → ranked candidates (Task 3)
- [ ] bypass by input theme still works, fires neither phase (Task 3)
- [ ] P4 + P7 receive `dados/mercado/` (Task 4)
- [ ] no new credentials required (nothing in any task adds env vars or API calls)
- [ ] copy/design/curadoria/export/publicação steps byte-unchanged (Tasks touched only P2a, P4, P7, and the table — confirm via `git diff --stat main` showing only the three files)

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/novo-post/SKILL.md
git commit -m "docs(novo-post): atualiza tabela de agentes para scouting de duas fases

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Out of scope (do NOT implement — see spec §7)

- `scripts/integrations/fetch_instagram_competitors.js` (Graph API) — future seam.
- Cron pre-warm via `orquestracao/rotas.yaml`.
- Performance-learned ranking from `analista-performance`.
- Adoption by `/lote-posts` and `/planejar-pauta-semanal`.
- SEO tooling.

Mentioning any of these in agent/skill prose as a *future hook* (e.g., "quando existir `fetch_instagram_competitors.js`") is fine and intended; **building** them is not.
