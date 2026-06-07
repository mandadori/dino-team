# Estrategista de Mercado (Peça 1) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir a governança de narrativa em arco por um modelo de duas velocidades — criar o agente `estrategista-mercado` (lê o momento, responde com a verdade), dar sensing leve ao pesquisador, religar a pauta, e demolir o arco (`ciclo-de-direcao`, `estrategista-narrativa`, `ativas.md`, `roadmap-crenca.md`).

**Architecture:** Codebase de **documentos** (agentes/skills/memória em Markdown+YAML; um script JS de write-back **não tocado** nesta peça). Não há código executável novo → o plano é **dirigido por verificação** (grep/ls/leitura de conformidade), não por testes unitários. Cada task = operação de arquivo + verificação + commit. Ordem: criar o novo → religar consumidores → deletar o velho → varredura final.

**Tech Stack:** Markdown, YAML frontmatter, contratos de agente do Claude Code, convenção de specs/skills do projeto.

**Fonte:** `docs/specs/2026-06-07-estrategista-mercado-design.md`. Peças 2/3/4 fora.

**Desvio consciente vs. spec:** o spec listou 4 slugs de verdade baseados no CLAUDE.md ("Direção > esforço"), que está em *drift* com o `brand-book.md` (autoridade: tese **"Direção > motivação"**). A Task 1 formaliza o conjunto de verdades ancorado no **brand-book**, não no CLAUDE.md.

---

## Estrutura de arquivos (o que cada task toca)

**Cria:**
- `.claude/agents/estrategista-mercado.md` — contrato do agente novo (Task 2).

**Modifica:**
- `brand/brand-book.md` — seção `## Verdades` canônica (Task 1).
- `.claude/agents/pesquisador-mercado.md` — sensing leve semanal (Task 3).
- `.claude/skills/planejar-pauta-semanal/SKILL.md` — passa pelo estrategista + pausa manual + `verdade:` (Task 4).
- `memory/narrativas/_formato.md`, `memory/narrativas/livro-razao.md` — owner + semântica verdade (Task 5).
- `memory/_schema.md` — owner do slice narrativas (Task 6).
- `.claude/skills/novo-post/SKILL.md` — `verdade` no lugar de arco (Task 7).
- `.claude/skills/pesquisar-mercado/SKILL.md`, `orquestracao/governanca.yaml`, `orquestracao/rotas.yaml`, `orquestracao/README.md` (Task 8).
- `CLAUDE.md` — fix de drift + roster + skills (Task 9).

**Deleta:**
- `.claude/skills/ciclo-de-direcao/`, `.claude/agents/estrategista-narrativa.md`, `memory/narrativas/ativas.md`, `memory/narrativas/roadmap-crenca.md` (Task 10).

> **Não tocar nesta peça:** `scripts/memory/append_livro_razao.js` (flag `--narrativa` mantida; rename é Peça 4), `site/app/api/cron/ciclo-de-direcao/` (Peça 4), `docs/plans/*`, `docs/specs/2026-06-06-*`.

---

## Task 1: Formalizar `## Verdades` no brand-book

**Files:**
- Modify: `brand/brand-book.md` (inserir seção após "Mensagens centrais", antes de `## O produto`)

O `estrategista-mercado` precisa de um conjunto **enumerável e canônico** de verdades pra mapear cada jogada e equilibrar pelo livro-razão. Hoje as verdades estão espalhadas em ~18 bullets. Esta task as enumera (ancoradas na tese **"Direção > motivação"** e na espinha direção→caminho→identidade do próprio brand-book).

- [ ] **Step 1: Inserir a seção `## Verdades` no brand-book**

Inserir, logo após o bloco de bullets de "Mensagens centrais" (após a linha que termina em "Quem aceita o processo, muda de verdade." e antes do `---` que precede `## O produto`):

```markdown
---

## Verdades (conjunto canônico)

> As verdades atemporais que a marca acende. Conjunto **enumerável** — cada peça acende **uma** (registrada no livro-razão como `verdade:`). É a camada lenta do sistema de 2 velocidades; muda raramente (via `/brand-discovery`), nunca por reatividade de mercado.

| slug | verdade |
|---|---|
| `direcao-vence-motivacao` | Direção > motivação. Você não precisa de mais motivação, precisa de direção. |
| `voce-vs-voce` | A única disputa que importa é você vs. você — supere quem era ontem, não os outros. |
| `disciplina-sem-vontade` | Disciplina é fazer mesmo sem vontade. |
| `consistencia-vence-intensidade` | Consistência vence intensidade — pequenas ações diárias geram grandes resultados. |
| `execucao-nao-motivacao` | Resultado não vem de motivação, vem de execução. |
| `identidade-e-o-premio` | O prêmio real não é chegar; é quem você virou no caminho. |
```

- [ ] **Step 2: Atualizar o registro de "Última atualização" do brand-book**

Adicionar como primeira linha do bloco `## Última atualização`:

```markdown
2026-06-07 — formalização do conjunto canônico de `## Verdades` (camada lenta do sistema de 2 velocidades; consumido pelo `estrategista-mercado`). Ancorado nas mensagens centrais existentes.
```

- [ ] **Step 3: Gate de marca (`revisor-brand`)**

Acionar `revisor-brand` (momento: criação/edição de estilo → aqui, edição de brand):

```
Tarefa: validar edição de brand (momento: aprimoramento de branding).
Arquivo editado: brand/brand-book.md — nova seção ## Verdades.
Avaliar: as verdades enumeradas são fiéis às mensagens centrais e ao registro sereno? Algum slug contradiz a identidade?
Saída: APROVADO | REPROVADO + ajuste.
```

Esperado: `APROVADO`. Se `REPROVADO`, aplicar o ajuste indicado e reacionar (máx 1 retry; 2º → escalar ao usuário, pois o conjunto de verdades é propriedade do branding).

- [ ] **Step 4: Verificar**

Run: `grep -c "^| \`" brand/brand-book.md` (conta linhas de slug na tabela)
Expected: `6` (as 6 verdades). E `grep -n "## Verdades" brand/brand-book.md` retorna 1 linha.

- [ ] **Step 5: Commit**

```bash
git add brand/brand-book.md
git commit -m "feat(brand): formaliza conjunto canonico de Verdades (camada lenta do sistema de 2 velocidades)"
```

---

## Task 2: Criar o agente `estrategista-mercado`

**Files:**
- Create: `.claude/agents/estrategista-mercado.md`

- [ ] **Step 1: Escrever o contrato completo**

Criar `.claude/agents/estrategista-mercado.md` com exatamente:

```markdown
---
name: estrategista-mercado
description: Lê a crença do mercado e a emoção do público (rápido) e escolhe qual verdade atemporal da marca responde ao momento (lento). Owner único do slice `memory/narrativas/` (livro-razão de verdades acionadas). Propõe as jogadas da semana e equilibra as verdades pelo livro-razão; não produz copy nem decide pauta sozinho.
tools: Read, Write, Edit, Glob, Grep
---

# Estrategista de Mercado

Você é o **estrategista de mercado** do sistema Dino Team. Sua especialidade é ler o **momento** — a crença que move o mercado e a oscilação emocional do público — e escolher qual **verdade atemporal da marca** responde a esse momento.

A marca é dona da verdade; você **não a inventa**. A oscilação emocional do público é o **gatilho**; a verdade da marca é a **resposta**. Aparecer no pico emocional dizendo o que a marca sempre diz **reforça** o branding — é o oposto de perseguir tendência.

Você **não** produz conteúdo (copy, design, briefing) — isso é da produção. Você **não** decide a pauta sozinho — você **propõe** as jogadas; a skill orquestra e o humano ajusta no modo manual.

## Contexto que carrego

Arquivos lidos automaticamente antes de qualquer tarefa:
- `brand/brand-book.md` — essência, mensagens centrais e o **conjunto canônico de `## Verdades`** (o que você pode acender).
- `brand/pilares-conteudo.md` — eixos temáticos válidos e função no funil.
- `brand/tom-de-voz.md` — registro sereno; para propor ângulo já no tom.
- `brand/publico-alvo.md` — quem é o leitor e seus estágios.

Lidos sob demanda (quando a tarefa apontar):
- `memory/publico/dores.md` + `memory/publico/objecoes.md` — emoção/dor crua do público.
- `memory/mercado/tendencias/<YYYY-MM>.md` — crença/discurso do mercado no período.
- `memory/mercado/narrativa-de-mercado.md` — discurso dominante do nicho (pedra de amolar).
- `memory/performance/angulos-queimados.md` — ângulos que precisam descansar.
- `memory/narrativas/livro-razao.md` — quais verdades já foram acionadas (equilíbrio + saturação).

Se `brand/brand-book.md` não tiver a seção `## Verdades`, devolva `SEM_VERDADES — rodar Task de formalização / /brand-discovery antes`.

## Ownership do slice `memory/narrativas/`

Sou o **owner único** — qualquer agente lê, eu sou o único responsável pelo slice. Após o redesign, o slice contém só `livro-razao.md` (+ `_formato.md`).

- **Leio** `livro-razao.md` para equilíbrio e saturação. **Não escrevo nele à mão** — o append é feito pelo script `scripts/memory/append_livro_razao.js`, disparado no write-back das skills de produção.
- A "leitura estratégica da semana" (jogadas) é **efêmera** — devolvo inline; a skill a grava em `campanhas/<semana>/`. Não crio slice durável próprio.

## Princípios da especialidade

- **A verdade é fixa; o momento é variável.** Nunca invente uma "nova verdade" — escolha, entre as do `## Verdades`, a que responde ao momento.
- **Aproveitar a emoção, não persegui-la.** Oscilação emocional = gatilho; verdade atemporal = resposta.
- **Equilíbrio, não repetição.** Lê o livro-razão; evita martelar a mesma verdade; cobre o conjunto ao longo do tempo. A conexão entre semanas **emerge** do conjunto fixo + voz — não de campanha prescrita.
- **Saturação é dado.** Conta no livro-razão (nº de acionamentos da mesma verdade numa janela), não intuição.
- **Marca como guard-rail.** Toda jogada cabe num pilar **e** responde com uma verdade declarada. Sem sustentação no cérebro (emoção/dor real + sinal de mercado), recuse.

## Tipos de tarefa que você executa

A skill que te aciona declara o modo no campo **Tarefa**.

1. **`jogadas-da-semana`** — dado o sensing do pesquisador (emoção do público + crença de mercado), os ângulos-queimados e o livro-razão, proponha **N jogadas**. Para cada uma: ângulo (o momento/emoção que dispara) + verdade (o slug do `## Verdades` que responde) + pilar + formato/canal sugerido + sustentação. Equilibre pelo livro-razão. Inline, sem escrever no slice.
2. **`coerencia-verdade`** — dada uma lista de ângulos/briefings (ex.: temas que o humano ajustou no modo manual), classifique cada um: `serve <verdade>` | `off-brand` | `contradiz <verdade>`. Gate de coerência em **tempo de planejamento** — distinto do gate final do `revisor-brand` no post pronto. Inline.

## Recebo

- **Tarefa:** `jogadas-da-semana` | `coerencia-verdade`.
- **Inputs:** sensing do pesquisador (caminho do arquivo ou inline) + N + janela da semana (tarefa 1); lista de ângulos/slugs (tarefa 2).

Sem `Tarefa` claro, devolvo `INPUT_INSUFICIENTE — <o que falta>`.

## Entrego

### `jogadas-da-semana` — inline rígido

```
<jogadas>
<jogada n=1 angulo="<momento/emoção que dispara>" verdade="<slug do ## Verdades>" pilar="<X>" formato="<sugerido>" canal="<sugerido>" sustentacao="<emoção/sinal observado — fonte>" />
... N, equilibradas (sem martelar a mesma verdade) ...
equilibrio: <distribuição de verdades nesta leva + alerta se concentrou demais ou repetiu verdade saturada no livro-razão>
</jogadas>
```

### `coerencia-verdade` — inline rígido

```
<coerencia>
<item ref="<slug/ângulo>" resultado="serve <verdade> | off-brand | contradiz <verdade>" />
...
alerta: <"X de N off-brand/contradizem — revisar antes de produzir" ou vazio>
</coerencia>
```

Sem preâmbulo fora do schema.

## Orçamento de output

Jogadas ~150–200 palavras. Coerência ~50 palavras. Anti-padding: sem preâmbulo, sem eco do input, sem fecho, nada fora do schema.

## Anti-padrões

- Inventar uma "verdade" fora do `## Verdades` do brand book.
- Perseguir tendência sem ancorar numa verdade (trend-chasing).
- Produzir copy, design ou briefing de produção.
- Repetir verdade já saturada no livro-razão sem justificativa.
- Fazer WebSearch (o `pesquisador-mercado` coleta; você interpreta).
- Reescrever o livro-razão à mão (append é por script).

## Input incompleto

- `INPUT_INSUFICIENTE — <o que falta>` — sem tarefa ou sem inputs quando a tarefa exige.
- `SENSING_AUSENTE` — sem o sensing do pesquisador para a semana.
- `SEM_VERDADES` — `brand/brand-book.md` não tem a seção `## Verdades`.
- `SEM_SUSTENTACAO — <jogada>` — proposta sem emoção/dor real ou sinal de mercado.
- `FORA_DE_PILAR — <ângulo>` — não cabe em nenhum pilar declarado.
```

- [ ] **Step 2: Verificar conformidade de schema**

Run: `grep -E "^name:|^tools:|## Tipos de tarefa|jogadas-da-semana|coerencia-verdade|## Entrego|## Anti-padrões" .claude/agents/estrategista-mercado.md | wc -l`
Expected: `>= 7` (frontmatter + seções obrigatórias + as 2 tarefas presentes).

Run: `head -5 .claude/agents/estrategista-mercado.md`
Expected: frontmatter com `name: estrategista-mercado` e `tools: Read, Write, Edit, Glob, Grep`.

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/estrategista-mercado.md
git commit -m "feat(agents): cria estrategista-mercado (momento->verdade + equilibrio pelo livro-razao)"
```

---

## Task 3: Sensing leve no `pesquisador-mercado`

**Files:**
- Modify: `.claude/agents/pesquisador-mercado.md` (modo `scouting de mercado` Fase A)

Diferenciar profundidade (semanal leve vs. mensal deep) e acrescentar a dimensão emocional, sem nova chamada de web.

- [ ] **Step 1: Adicionar a variante de sensing leve no modo scouting**

Em `.claude/agents/pesquisador-mercado.md`, dentro de `### Modo \`scouting de mercado\``, após o parágrafo que começa em "Varredura profunda dos nichos…", inserir:

```markdown
**Profundidade por cadência:**
- **Semanal (sensing leve)** — quando a skill pedir `Profundidade: leve`: foco rápido em (a) **oscilação emocional do público** (comentários, Reddit `r/fitness`/`r/bodybuilding`, reações aos posts dos concorrentes — onde a emoção aparece não-filtrada) e (b) **crença de mercado em movimento** nesta semana. Grave o resultado no caminho que a skill apontar (campanha da semana), com as seções `## Emoção do público (oscilação da semana)` e `## Crença de mercado em movimento`. **Não** é deep scouting.
- **Mensal (deep durável)** — comportamento atual: concorrentes/estrutura, aprendizado durável em `memory/mercado/` + `memory/publico/`.
```

- [ ] **Step 2: Verificar**

Run: `grep -c "Emoção do público (oscilação da semana)\|Crença de mercado em movimento\|sensing leve" .claude/agents/pesquisador-mercado.md`
Expected: `>= 3`.

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/pesquisador-mercado.md
git commit -m "feat(agents): pesquisador-mercado ganha sensing leve semanal (emocao + crenca de mercado)"
```

---

## Task 4: Reescrever `/planejar-pauta-semanal`

**Files:**
- Modify: `.claude/skills/planejar-pauta-semanal/SKILL.md`

Passar pelo `estrategista-mercado`, pausar pro humano no modo manual, e gravar `verdade:` no lugar de `narrativa:`/arco. Remover a leitura de `ativas.md` e a dependência do ciclo.

- [ ] **Step 1: Atualizar a tabela de Fluxo**

Substituir as linhas dos Passos 2–6 da tabela `## Fluxo` por:

```markdown
| 2 | pesquisador (sensing leve) | semana, N | 1 | `pesquisa-tendencias.md` enriquecido (emoção + crença de mercado) |
| 3 | `estrategista-mercado` (`jogadas-da-semana`) | sensing ← 2, ângulos-queimados, livro-razão | 2 | N jogadas (ângulo+verdade+pilar+formato/canal) equilibradas |
| 3.⏸ | ⏸ usuário (só modo manual) | jogadas ← 3 | 3 | jogadas confirmadas/ajustadas |
| 4 | ⚙ briefings inline (×N) | jogadas ← 3.⏸ | 3.⏸ | N briefings com campo `verdade:` |
| 5 | `estrategista-mercado` (`coerencia-verdade`) | ângulos ← 4 | 4 | serve/off-brand/contradiz por briefing |
| 6 | ⚙ manifest + flags | briefings + coerência ← 4+5 | 5 | campanha (`verdade` na tabela) |
```

- [ ] **Step 2: Atualizar a tabela de Agentes**

Substituir o bloco `## Agentes` por:

```markdown
| Agente | Quando |
|---|---|
| `pesquisador-mercado` | Sensing leve da semana (emoção do público + crença de mercado) — 1 chamada |
| `estrategista-mercado` | Propor as jogadas da semana (`jogadas-da-semana`) e checar coerência das verdades (`coerencia-verdade`) |

Briefings são escritos inline pela skill no Passo 4.
```

- [ ] **Step 3: Remover a dependência do ciclo e a leitura de arcos**

No bloco de Objetivo, substituir o parágrafo "Esta skill é **downstream do ciclo de direção**…" por:

```markdown
A pauta semanal traduz o **momento** (emoção do público + crença de mercado, lidos pelo pesquisador) na **verdade** da marca que responde — via `estrategista-mercado`. A conexão entre semanas **emerge** do conjunto fixo de `## Verdades` (brand-book) + voz, não de campanha prescrita.
```

Substituir o **Passo 2 atual** ("Ler narrativas ativas") inteiro por:

```markdown
### 2. Sensing leve da semana

Acionar `pesquisador-mercado`:

\```
Tarefa: scouting de mercado — sensing leve da semana.
Profundidade: leve.

Inputs:
- Semana ativa: <YYYY-Www> (de <início> a <fim>).
- N: <N>

Saída: gravar em campanhas/<YYYY-Www>-pauta-semanal/pesquisa-tendencias.md, com as seções ## Emoção do público (oscilação da semana) e ## Crença de mercado em movimento.
\```
```

Substituir o **Passo 3 atual** ("Pesquisar tendências") por um novo Passo 3 (estrategista) + 3.⏸ (pausa manual):

```markdown
### 3. Jogadas da semana (`estrategista-mercado`)

Acionar `estrategista-mercado`:

\```
Tarefa: jogadas-da-semana

Inputs:
- Sensing da semana: campanhas/<YYYY-Www>-pauta-semanal/pesquisa-tendencias.md
- N: <N>
- Janela: <YYYY-Www>
\```

O agente devolve N jogadas (ângulo + verdade + pilar + formato/canal + sustentação) equilibradas pelo livro-razão.

### 3.⏸ Ajuste humano (só modo manual)

**Apenas no modo manual** (pulado no modo cron): apresentar as jogadas e pausar:

\```
Jogadas da semana (equilibradas por verdade):
<lista do agente>

Responda:
- "ok" → segue para gerar os N briefings
- ajuste em texto livre (trocar verdade, ângulo, pilar de qualquer jogada)
\```

Aguardar resposta. Se houver ajuste, reacionar o estrategista (ou ajustar inline) e reapresentar até "ok".
```

- [ ] **Step 4: Atualizar o Passo 4 (briefings) para `verdade`**

No Passo "Gerar briefings inline", trocar a leitura de `memory/narrativas/ativas.md` e o campo `narrativa:` por:

```markdown
- **Verdade** — slug do `## Verdades` (brand-book) que a jogada acende (vindo do Passo 3). Campo obrigatório: `verdade: <slug>`.
```

Remover da lista de arquivos lidos a linha `memory/narrativas/ativas.md` (não há mais arco).

- [ ] **Step 5: Atualizar o Passo 5 (coerência) para o estrategista-mercado**

Substituir a chamada ao `estrategista-narrativa` (`responder-coerencia`) por:

```markdown
Acionar `estrategista-mercado`:

\```
Tarefa: coerencia-verdade

Inputs:
- Briefings planejados: <lista de slugs + ângulo central + verdade de cada um>
\```

O agente devolve, por briefing: `serve <verdade>` | `off-brand` | `contradiz <verdade>`. Regra: `contradiz`/`off-brand` → sinalizar ao usuário (não bloquear). `off-brand` em >metade → aviso de pauta sem verdade.
```

- [ ] **Step 6: Atualizar manifest e modo cron**

No `briefing-mestre.md` (Passo 6) e `status.yaml`, trocar a coluna/campo `Narrativa` por `Verdade`. No bloco "Modo cron", manter "não executa posts"; confirmar que a pausa 3.⏸ não roda em cron.

- [ ] **Step 7: Verificar**

Run: `grep -c "estrategista-narrativa\|narrativas/ativas\|ciclo-de-direcao\|responder-coerencia" .claude/skills/planejar-pauta-semanal/SKILL.md`
Expected: `0`.

Run: `grep -c "estrategista-mercado\|jogadas-da-semana\|coerencia-verdade\|verdade:" .claude/skills/planejar-pauta-semanal/SKILL.md`
Expected: `>= 4`.

- [ ] **Step 8: Commit**

```bash
git add .claude/skills/planejar-pauta-semanal/SKILL.md
git commit -m "feat(skills): pauta-semanal passa pelo estrategista-mercado + pausa manual + verdade (sem arco)"
```

---

## Task 5: Repurpor `livro-razao.md` + `_formato.md`

**Files:**
- Modify: `memory/narrativas/_formato.md`
- Modify: `memory/narrativas/livro-razao.md`

Owner → `estrategista-mercado`; coluna registra **verdade**; remover seções de `ativas`/`roadmap`. **Flag `--narrativa` do script permanece** (rename é Peça 4) — então a coluna do livro-razão continua chamando-se `narrativa` no header por ora, mas a **semântica** é verdade. Documentar isso.

- [ ] **Step 1: Reescrever `_formato.md`**

Substituir todo o conteúdo de `memory/narrativas/_formato.md` por:

```markdown
---
slice: narrativas
owner: estrategista-mercado
ultima_atualizacao: 2026-06-07
versao: 2
---

# Formato do slice `narrativas/`

Após o redesign de 2 velocidades, o slice contém **apenas o livro-razão**. Não há mais arcos (`ativas.md`) nem roadmap de crença — a camada lenta é o conjunto de `## Verdades` em `brand/brand-book.md`.

## `livro-razao.md` — o que já foi dito (responde "qual verdade, quantas vezes?")

Tabela append-only, escrita pelo write-back das skills de produção.

\```
| data | mensagem/ângulo | narrativa | canal | peça |
|------|-----------------|-----------|-------|------|
\```

> **Semântica (redesign 2 velocidades):** a coluna `narrativa` registra a **verdade** (slug do `## Verdades` do brand-book) que a peça acendeu. O header ainda se chama `narrativa` porque o script `append_livro_razao.js` mantém a flag `--narrativa` nesta fase; o rename para `verdade` é da Peça 4.

Contagem de saturação = nº de linhas por **verdade** numa janela. Append feito pelo script `scripts/memory/append_livro_razao.js`. O owner `estrategista-mercado` **lê** para equilíbrio/saturação; não escreve aqui.
```

- [ ] **Step 2: Atualizar o frontmatter + nota de `livro-razao.md`**

Em `memory/narrativas/livro-razao.md`, trocar `owner: estrategista-narrativa` por `owner: estrategista-mercado`, `ultima_atualizacao` para `2026-06-07`, e atualizar a linha de descrição para:

```markdown
Tabela append-only. Cada linha = uma peça publicada. A coluna `narrativa` registra a **verdade** (slug do `## Verdades`) acionada — semântica do redesign de 2 velocidades; header renomeado para `verdade` na Peça 4. Contagem de saturação = nº de linhas por verdade numa janela.
```

(Não alterar o header da tabela nem linhas existentes — o script depende do `HEADER_PATTERN` atual.)

- [ ] **Step 3: Verificar**

Run: `grep -c "owner: estrategista-mercado" memory/narrativas/_formato.md memory/narrativas/livro-razao.md`
Expected: `2`.

Run: `grep -c "ativas.md\|roadmap-crenca" memory/narrativas/_formato.md`
Expected: `0`.

Run: `grep -E "^\| data \| mensagem/ângulo \| narrativa \| canal \| peça \|" memory/narrativas/livro-razao.md`
Expected: 1 linha (header **intacto** — o script depende dele).

- [ ] **Step 4: Commit**

```bash
git add memory/narrativas/_formato.md memory/narrativas/livro-razao.md
git commit -m "refactor(memory): narrativas vira so livro-razao (owner estrategista-mercado; coluna = verdade)"
```

---

## Task 6: Religar `memory/_schema.md`

**Files:**
- Modify: `memory/_schema.md`

- [ ] **Step 1: Atualizar a linha do slice `narrativas/` na tabela de Slices**

Trocar:

```markdown
| `narrativas/` | `estrategista-narrativa` | arcos ativos, roadmap de crença, livro-razão de mensagens | criado (Onda 1); populado (Onda 2); write-back multicanal (Onda 4) |
```

por:

```markdown
| `narrativas/` | `estrategista-mercado` | livro-razão de verdades acionadas (camada lenta = `## Verdades` do brand-book) | redesign 2 velocidades (2026-06) |
```

- [ ] **Step 2: Verificar**

Run: `grep -c "estrategista-narrativa" memory/_schema.md`
Expected: `0`.

Run: `grep -c "estrategista-mercado" memory/_schema.md`
Expected: `>= 1`.

- [ ] **Step 3: Commit**

```bash
git add memory/_schema.md
git commit -m "docs(memory): schema do slice narrativas aponta estrategista-mercado (so livro-razao)"
```

---

## Task 7: Religar `/novo-post`

**Files:**
- Modify: `.claude/skills/novo-post/SKILL.md`

Trocar a lógica de arco/`narrativa_servida` por `verdade`. **Flag `--narrativa` no Passo 15.6 mantida** (valor passa a ser o slug de verdade; rename é Peça 4).

- [ ] **Step 1: Passo 1 (briefing pré-pronto) — extrair `verdade`**

Onde o Passo 1 extrai `Narrativa` (campo `narrativa:` do briefing) e define `narrativa_servida`, trocar por: extrair `Verdade` (campo `verdade:`), guardar como `verdade_servida = <slug>`; quando ausente, `verdade_servida = neutro`.

- [ ] **Step 2: Passo 6 (briefing inline) — não ler arco, escolher verdade**

Na lista de arquivos lidos no Passo 6, **remover** `memory/narrativas/ativas.md`. Trocar o item de decisão "Narrativa servida" por:

```markdown
- **Verdade servida** — slug do `## Verdades` (brand/brand-book.md) que este ângulo acende; `neutro` se nenhuma. Guarde como `verdade_servida`.
```

- [ ] **Step 3: Passo 15.6 (write-back) — valor = verdade, flag mantida**

No comando `append_livro_razao.js`, trocar o valor de `--narrativa` para a verdade:

```bash
node scripts/memory/append_livro_razao.js \
  --data "$(date +%F)" \
  --mensagem "<ângulo central do Passo 6>" \
  --narrativa "<verdade_servida do Passo 6 — slug ou neutro>" \
  --canal instagram \
  --peca "<slug do Passo 6>"
```

> Nota inline a manter no SKILL: a flag `--narrativa` registra a **verdade** acionada (rename para `--verdade` na Peça 4).

- [ ] **Step 4: Atualizar o Princípio central**

No bloco "Princípio central", trocar "mensagem em `livro-razao.md` (Passo 15.6)" — substituir qualquer menção a "narrativa servida"/arco por "verdade servida". Remover menção a `memory/narrativas/ativas.md` no "Contexto de leitura por passo" do Briefing (Passo 6).

- [ ] **Step 5: Verificar**

Run: `grep -c "narrativas/ativas\|narrativa_servida\|estrategista-narrativa" .claude/skills/novo-post/SKILL.md`
Expected: `0`.

Run: `grep -c "verdade_servida\|## Verdades\|verdade:" .claude/skills/novo-post/SKILL.md`
Expected: `>= 2`.

Run: `grep -c "append_livro_razao.js" .claude/skills/novo-post/SKILL.md`
Expected: `>= 1` (write-back ainda presente, flag `--narrativa` ainda usada).

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/novo-post/SKILL.md
git commit -m "feat(skills): novo-post usa verdade (do brand-book) no lugar de arco/narrativa"
```

---

## Task 8: Religar pesquisar-mercado + governança + rotas + README

**Files:**
- Modify: `.claude/skills/pesquisar-mercado/SKILL.md`
- Modify: `orquestracao/governanca.yaml`
- Modify: `orquestracao/rotas.yaml`
- Modify: `orquestracao/README.md`

- [ ] **Step 1: `pesquisar-mercado` — remover menção ao ciclo**

Em `.claude/skills/pesquisar-mercado/SKILL.md`, remover `/ciclo-de-direcao` de qualquer frase de consumidores (ex.: "...e para o `/ciclo-de-direcao`" vira só "...para as skills de produção"). Buscar e ajustar todas as ocorrências.

- [ ] **Step 2: `governanca.yaml` — substituir as decisões de narrativa**

Substituir a decisão `direcao-narrativa` (linhas 8–12) e a decisão `coerencia-narrativa` (linhas 40–43) por:

```yaml
  - funcao: estrategia-mercado
    decisao: "que verdade da marca responde ao momento (emoção do público + crença de mercado)"
    autonomia: automatico_com_revisao   # propor jogadas = auto; ajuste de temas = humano no modo manual da pauta
    corpo: "agente estrategista-mercado (na /planejar-pauta-semanal)"

  - funcao: coerencia-verdade
    decisao: "a jogada serve ou contradiz uma verdade da marca"
    autonomia: automatico                # flag; ação humana só se 'contradiz'/'off-brand'
    corpo: "estrategista-mercado (check na pauta)"
```

E na decisão `planejamento-pauta`, trocar `"o que produzir na janela, p/ qual narrativa"` por `"o que produzir na janela, p/ qual verdade"`.

- [ ] **Step 3: `rotas.yaml` — remover a rota do ciclo**

Remover o bloco inteiro da rota `ciclo-de-direcao-cron` (as linhas `- id: ciclo-de-direcao-cron` … até antes de `- id: pesquisar-mercado-cron`).

- [ ] **Step 4: `orquestracao/README.md` — atualizar a tabela de crons**

Trocar o título "## Rotas cron ativas (3)" por "## Rotas cron ativas (2)" e remover a linha da tabela do `ciclo-de-direcao-cron`.

- [ ] **Step 5: Verificar**

Run: `grep -rc "ciclo-de-direcao\|estrategista-narrativa" .claude/skills/pesquisar-mercado/SKILL.md orquestracao/governanca.yaml orquestracao/rotas.yaml orquestracao/README.md`
Expected: `0` em todos.

Run: `grep -c "estrategia-mercado\|coerencia-verdade\|estrategista-mercado" orquestracao/governanca.yaml`
Expected: `>= 2`.

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/pesquisar-mercado/SKILL.md orquestracao/governanca.yaml orquestracao/rotas.yaml orquestracao/README.md
git commit -m "refactor(orquestracao): remove ciclo-de-direcao; governanca/rotas apontam estrategista-mercado"
```

---

## Task 9: Religar `CLAUDE.md` (fix de drift)

**Files:**
- Modify: `CLAUDE.md`

Corrigir o drift (lista `curador-export` inexistente; omite `estrategista-mercado`) e remover ciclo/estrategista-narrativa.

- [ ] **Step 1: Lista de skills — remover `/ciclo-de-direcao`**

Na seção de skills "Estratégia e direção", remover o item `/ciclo-de-direcao` inteiro. Ajustar a frase de `/planejar-pauta-semanal` que diz "Precede ... a cada novo horizonte estratégico" para refletir que ela passa pelo `estrategista-mercado`.

- [ ] **Step 2: Roster de agentes — corrigir drift**

Na seção "Agentes atuais (11)": remover `curador-export` (não existe na pasta); remover `estrategista-narrativa`; adicionar, em **Marketing / Estratégia**:

```markdown
- **Marketing / Estratégia**
  - [`estrategista-mercado`](.claude/agents/estrategista-mercado.md) — lê o momento (emoção do público + crença de mercado) e escolhe a verdade da marca que responde; owner do livro-razão; propõe as jogadas da pauta.
```

Manter a contagem coerente: o roster continua com **11** agentes (sai estrategista-narrativa **e** curador-export que estava listado mas não existia; entra estrategista-mercado — o número real de arquivos em `.claude/agents/` após a Peça 1 é 11). Conferir no Step 4.

- [ ] **Step 3: Slice `narrativas/` + integração**

Onde o CLAUDE.md descreve `memory/narrativas/` como "owner: estrategista-narrativa" e "narrativas ativas, roadmap…", trocar por "owner: `estrategista-mercado`; livro-razão de verdades acionadas (camada lenta = `## Verdades` do brand-book)". Remover menções a `/ciclo-de-direcao` e arcos no texto de orquestração/cron.

- [ ] **Step 4: Verificar**

Run: `grep -c "estrategista-narrativa\|ciclo-de-direcao\|curador-export" CLAUDE.md`
Expected: `0`.

Run: `grep -c "estrategista-mercado" CLAUDE.md`
Expected: `>= 2`.

Run: `ls .claude/agents/*.md | wc -l`
Expected: `11` (após Task 10 deletar estrategista-narrativa e Task 2 criar estrategista-mercado). _Nota: rodar esta conferência **após** a Task 10._

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(claude): fix drift do roster (+estrategista-mercado, -curador-export) e remove ciclo/arco"
```

---

## Task 10: Deletar o arco

**Files:**
- Delete: `.claude/skills/ciclo-de-direcao/` (diretório)
- Delete: `.claude/agents/estrategista-narrativa.md`
- Delete: `memory/narrativas/ativas.md`
- Delete: `memory/narrativas/roadmap-crenca.md`

- [ ] **Step 1: (Opcional) Salvar as mensagens-âncora do arco ativo**

Antes de deletar `ativas.md`, registrar as `mensagens-âncora` do arco `progresso-invisivel` como frases-semente, mapeadas à verdade subjacente (`consistencia-vence-intensidade` / `direcao-vence-motivacao`). Destino sugerido: anexar a `memory/pesquisa/2026-06-07-frases-semente-progresso-invisivel.md`. Pular se o usuário não quiser.

- [ ] **Step 2: Deletar os 4 alvos**

```bash
git rm -r .claude/skills/ciclo-de-direcao
git rm .claude/agents/estrategista-narrativa.md
git rm memory/narrativas/ativas.md
git rm memory/narrativas/roadmap-crenca.md
```

- [ ] **Step 3: Verificar**

Run: `ls .claude/skills/ciclo-de-direcao 2>&1; ls .claude/agents/estrategista-narrativa.md 2>&1; ls memory/narrativas/`
Expected: "No such file" para os 3 primeiros; `memory/narrativas/` lista só `_formato.md` e `livro-razao.md`.

Run: `ls .claude/agents/*.md | wc -l`
Expected: `11`.

- [ ] **Step 4: Commit**

```bash
git commit -m "refactor: remove o arco (ciclo-de-direcao, estrategista-narrativa, ativas, roadmap-crenca)"
```

---

## Task 11: Varredura final (Peça 1)

**Files:** nenhum (verificação).

- [ ] **Step 1: Sweep de referências mortas do arco**

Run:
```bash
grep -rn "estrategista-narrativa\|ciclo-de-direcao\|narrativas/ativas\|roadmap-crenca\|narrativa_servida\|responder-coerencia" \
  --include="*.md" --include="*.yaml" --include="*.js" --include="*.ts" . \
  | grep -v node_modules | grep -v "docs/plans/" | grep -v "docs/specs/2026-06-0"
```
Expected: **vazio** (nenhuma referência viva). Hits só em `docs/plans/*` e `docs/specs/*` (histórico) são aceitáveis e devem ter sido filtrados.

> Nota: `--narrativa` (flag do script) e a coluna `narrativa` do livro-razão **AINDA aparecem** — é esperado na Peça 1 (rename é Peça 4). **Não** incluir `--narrativa` neste sweep.

- [ ] **Step 2: Sweep de site cron órfão (informativo, fix na Peça 4)**

Run: `ls site/app/api/cron/ciclo-de-direcao 2>&1`
Expected: ainda existe — **não** removido nesta peça (é Peça 4). Apenas confirmar que está mapeado.

- [ ] **Step 3: Conferência de inventário final**

Run: `ls .claude/agents/ && echo "---" && ls .claude/skills/ | grep -c ciclo-de-direcao && echo "---" && ls memory/narrativas/`
Expected: `estrategista-mercado.md` presente, `estrategista-narrativa.md` ausente; `ciclo-de-direcao` count = `0`; `memory/narrativas/` = `_formato.md` + `livro-razao.md`.

- [ ] **Step 4: Commit (se o sweep exigiu algum fix)**

Se o Step 1 achou hit vivo, corrigir o arquivo e:
```bash
git add -A && git commit -m "fix: remove referencia morta ao arco encontrada no sweep da Peca 1"
```
Senão, nada a commitar — a peça está completa.

---

## Self-Review (preenchido)

**Cobertura do spec:** Mudança 1 (agente) → Task 2; Mudança 2 (sensing) → Task 3; Mudança 3 (pauta) → Task 4; Mudança 4 (demolição + repurpose + religação) → Tasks 5–10; Conjunto de verdades → Task 1; sweep → Task 11. ✅

**Placeholders:** nenhum "TBD/TODO"; todo conteúdo de arquivo novo está inline; edições mostram before/after. ✅

**Consistência de tipos/nomes:** `verdade`/`verdade_servida` (não `narrativa_servida`); flag `--narrativa` **mantida** consistentemente (rename explicitamente diferido pra Peça 4); owner `estrategista-mercado` uniforme; `jogadas-da-semana`/`coerencia-verdade` idênticos entre agente (Task 2) e skill (Task 4). ✅

**Ordem/dependências:** criar (1,2,3) → religar (4–9) → deletar (10) → verificar (11). A conferência `ls .claude/agents/*.md | wc -l == 11` só fecha após a Task 10 (anotado nas Tasks 9 e 10).
