# Arquitetura 360 + Cérebro de Marca — Plano de Implementação (Onda 6)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development ou executing-plans. Passos com checkbox (`- [ ]`).

**Goal:** **Fechar o loop de integração com o Produto.** Hoje o `treinador` é uma ilha técnica e a consultoria não toca o cérebro. A Onda 6 **pluga o setor Produto no cérebro** (princípio "a memória é a integração"): quando a consultoria gera um sinal real — aluno trava (= dor), pergunta recorrente (= objeção), resultado de aluno (= prova) — esse sinal **vira entrada nos slices `publico/` e `performance/`** pelos donos certos; e o Produto **lê** dores/objeções/performance para priorizar o que construir. Marketing e Produto se afinam **sem se falarem**, pelo cérebro.

**Architecture:** Blackboard, de novo. **Não há slice novo de "produto":** o Produto **escreve nos slices existentes** (`publico/` via owner `pesquisador-mercado`; `performance/` via owner `analista-performance`) e **lê** deles para o roadmap. A regra de dono único se mantém — o Produto **propõe**, o owner **consolida**. O corpo da função "sinais produto → cérebro" é uma **skill de roteamento** (`/sinal-consultoria`) que recebe um sinal real e o encaminha ao owner correto.

**⚠ Honestidade de escopo (decisão explícita):** Produto é, no próprio spec, **"declarado, build depois"** (§3.6, §6.2) e a consultoria com alunos reais **ainda não existe** como fluxo no sistema. Construir dados de aluno especulativos violaria o YAGNI que o spec exige (§8: "integração completa vira scope creep"). Portanto a Onda 6 entrega o **wiring/contrato** — o caminho pelo qual um sinal real flui quando existir — **sem fabricar alunos, resultados ou dores fictícias.** O critério "consultoria escreve em `publico/`" fica **estruturalmente pronto**; a escrita real acontece quando houver consultoria real (marcado como pendência de runtime/negócio, não simulado).

**Tech Stack:** Markdown (skill, contratos de agente, schema, CLAUDE.md). Sem código novo. "Testes" = `grep`/`ls` + dry-run de leitura (o roteamento aponta para os owners certos; nenhuma entrada fictícia é criada).

**Spec de origem:** `docs/specs/2026-06-06-arquitetura-360-cerebro-de-marca-design.md` (Onda 6 em §7; Produto §3.6; Produto fecha o loop §3.6 nota; setores §6.2).

---

## ⚠ Onde executar este plano

- Execute **neste worktree** — já contém `dino-studio-editor` + Ondas 1-5.
- **Não fabricar dados.** Nenhuma entrada de dor/objeção/prova "de exemplo de aluno" é criada. O que se cria são contratos, a skill de roteamento e a declaração no schema.

## Refinamentos sobre o spec (descobertos ao mapear o código)

1. **`treinador` hoje não lê marca nem cérebro** (por design — "especialista técnico generalista"). A Onda 6 **não** o transforma em consumidor de marca; ela adiciona que, **quando aciona pelo fluxo de consultoria**, ele pode **propor** sinais ao cérebro (aluno travou em X = candidato a dor) — sempre via output, nunca escrevendo no slice (dono único). Mudança mínima e coerente com o contrato dele.
2. **`pesquisador-mercado` já é owner de `publico/` "com Produto alimentando"** (já está no `description` do agente e no schema). A Onda 6 só **liga a fonte** "Produto" a esse canal de alimentação — via `/sinal-consultoria`. O contrato do owner praticamente não muda; o que faltava era o **roteador**.
3. **Não há fluxo de consultoria/anamnese.** O `treinador` responde tarefas pontuais; não há captura estruturada de aluno. Logo `/sinal-consultoria` recebe o sinal **de quem o tiver** (o usuário/consultor o digita) e o roteia. Quando existir um fluxo de anamnese (futuro), ele alimenta a mesma skill.

## Mapa de arquivos

**Criam-se:**
- `.claude/skills/sinal-consultoria/SKILL.md` (roteia sinal real → owner do slice)

**Modificam-se:**
- `.claude/agents/treinador.md` (nota: pode propor sinais de consultoria ao cérebro via output; não escreve em slice)
- `.claude/agents/pesquisador-mercado.md` (confirmar fonte "Produto" alimentando `publico/` — provavelmente já coberto; ajustar 1 linha se preciso)
- `.claude/agents/analista-performance.md` (aceitar "prova de aluno" como entrada de performance, proposta via `/sinal-consultoria`)
- `memory/_schema.md` (declarar a integração Produto: escreve em `publico/`+`performance/`, lê para roadmap; sem slice novo)
- `CLAUDE.md` (declarar setor Produto como 1ª classe, integrado pelo cérebro)

**Lê-se (modelo):** `.claude/skills/novo-post/SKILL.md` (como uma skill aciona um agente owner), `memory/publico/dores.md` + `objecoes.md` (formato das entradas que serão propostas).

---

# ONDA 6 — Produto (integração pelo cérebro)

**Resultado testável ao fim:** existe `/sinal-consultoria` que, dado um sinal real de consultoria, o classifica (dor | objeção | prova) e o **roteia ao owner correto** (`pesquisador-mercado` p/ `publico/`; `analista-performance` p/ `performance/`) como **proposta** — o owner consolida. Os contratos de `treinador`/owners refletem essa fonte. O schema declara a integração. **Nenhuma entrada fictícia criada.**

### Task 6.1: Skill `/sinal-consultoria` (roteador de sinal → cérebro)

**Files:** Create `.claude/skills/sinal-consultoria/SKILL.md`. Read: `memory/publico/dores.md`, `memory/publico/objecoes.md` (formato), `.claude/agents/pesquisador-mercado.md` + `analista-performance.md` (interfaces).

- [ ] **Step 1: Escrever a skill** com:
  - **Frontmatter:** `name: sinal-consultoria`; `description:` "Roteia um sinal REAL da consultoria para o cérebro: aluno travou em X → candidato a dor (`publico/dores.md`); pergunta recorrente → objeção (`publico/objecoes.md`); resultado de aluno → prova (`performance/`). A skill classifica e **propõe ao owner do slice** (dono único consolida). Não inventa sinais — recebe do consultor."
  - **Sintaxe:** `/sinal-consultoria <descrição do sinal>` (texto livre do que aconteceu na consultoria).
  - **`## Fluxo`** (Passo|Ação|Recebe|Depende|Entrega):
    1. ⚙ classificar o sinal — dor | objeção | prova (inline; se ambíguo, perguntar ao usuário).
    2. ⚙ rotear ao owner:
       - dor → `pesquisador-mercado` (tarefa: incorporar entrada em `publico/dores.md` com a fala do aluno embutida).
       - objeção → `pesquisador-mercado` (`publico/objecoes.md`).
       - prova → `analista-performance` (registrar prova/resultado em `performance/`).
    3. ⏸ confirmação humana antes de o owner gravar (autonomia: `humano`, conforme `governanca.yaml` `sinais-produto`).
    4. ⚙ relatório inline — o que foi proposto, a qual slice, status.
  - **Regra dura:** a skill **não escreve** nos slices; ela **aciona o owner**, que escreve. Sem sinal real no input → não inventa (`SEM_SINAL`).

- [ ] **Step 2: Verificar e commitar**
```bash
grep -q "name: sinal-consultoria" .claude/skills/sinal-consultoria/SKILL.md && grep -q "dono único" .claude/skills/sinal-consultoria/SKILL.md && echo OK
git add .claude/skills/sinal-consultoria
git commit -m "feat(skills): cria /sinal-consultoria (roteia sinal real de consultoria ao cerebro)"
```

### Task 6.2: Atualizar contratos dos agentes envolvidos

**Files:** Modify `.claude/agents/treinador.md`, `.claude/agents/pesquisador-mercado.md`, `.claude/agents/analista-performance.md`.

- [ ] **Step 1: `treinador.md`** — adicionar uma nota curta (em "Tipos de tarefa" ou seção nova "Sinais ao cérebro"): quando acionado num contexto de consultoria, **pode propor** um sinal observado (aluno trava em X, dúvida recorrente, resultado) como output estruturado, para `/sinal-consultoria` rotear. **Não escreve em slice de memória** (segue dono único). Não muda o foco técnico dele.

- [ ] **Step 2: `pesquisador-mercado.md`** — confirmar/ajustar que a fonte "Produto/consultoria" é uma das origens das entradas de `publico/` (o `description` já diz "Produto alimenta"; garantir que o corpo do contrato menciona que entradas podem chegar via `/sinal-consultoria` como proposta a consolidar). 1 linha se já coberto.

- [ ] **Step 3: `analista-performance.md`** — adicionar que "prova de aluno" (resultado real de consultoria) é uma entrada válida de `performance/` (serve o pilar Transformação), proposta via `/sinal-consultoria`. Sem fabricar entradas.

- [ ] **Step 4: Verificar e commitar**
```bash
grep -qi "sinal-consultoria\|consultoria" .claude/agents/treinador.md && grep -qi "sinal-consultoria\|prova de aluno\|consultoria" .claude/agents/analista-performance.md && echo OK
git add .claude/agents/treinador.md .claude/agents/pesquisador-mercado.md .claude/agents/analista-performance.md
git commit -m "feat(agents): treinador/pesquisador/analista aceitam sinais de consultoria (via /sinal-consultoria)"
```

### Task 6.3: Declarar a integração Produto no schema + CLAUDE.md

**Files:** Modify `memory/_schema.md`, `CLAUDE.md`.

- [ ] **Step 1: `memory/_schema.md`** — na seção de slices ou numa nota de integração, declarar: **Produto não tem slice próprio** — escreve em `publico/` (dores/objeções reais de aluno, via `pesquisador-mercado`) e `performance/` (prova de aluno, via `analista-performance`), e **lê** ambos + `narrativas/` para priorizar o roadmap de produto. Fonte das entradas: `/sinal-consultoria`. (Roadmap de produto = doc futuro, declarado, build depois — YAGNI: não criar arquivo vazio agora.)

- [ ] **Step 2: `CLAUDE.md`** — na arquitetura, declarar o **setor Produto como 1ª classe, integrado pelo cérebro**: consultoria (`treinador` agora; anamnese/nutri depois) consome dores/objeções/performance e os alimenta de volta via `/sinal-consultoria`. Marketing e Produto se afinam pelo cérebro, não por acoplamento. Adicionar `/sinal-consultoria` ao roster de skills.

- [ ] **Step 3: Verificar e commitar**
```bash
grep -qi "produto" memory/_schema.md && grep -q "sinal-consultoria" CLAUDE.md && echo OK
git add memory/_schema.md CLAUDE.md
git commit -m "docs: declara integracao Produto pelo cerebro (escreve publico/+performance; le p/ roadmap)"
```

### Task 6.4: Verificação final da Onda 6

- [ ] **Step 1: Artefatos**
```bash
test -f .claude/skills/sinal-consultoria/SKILL.md && echo OK
grep -q "sinal-consultoria" CLAUDE.md && echo "CLAUDE OK"
```
- [ ] **Step 2: Roteamento aponta aos owners certos** (dry-run de leitura)
```bash
grep -q "pesquisador-mercado" .claude/skills/sinal-consultoria/SKILL.md && grep -q "analista-performance" .claude/skills/sinal-consultoria/SKILL.md && echo "roteia OK"
```
- [ ] **Step 3: Nenhuma entrada fictícia criada** — confirmar que `memory/publico/dores.md`, `objecoes.md` e `memory/performance/` **não** ganharam entradas inventadas de aluno nesta onda.
```bash
git diff --stat HEAD~3 -- memory/publico memory/performance   # esperado: vazio (nenhuma mudança de conteúdo de dados)
```
Expected: nada — a Onda 6 mexe em contratos/skill/schema, não em dados.

- [ ] **Step 4: Dono único preservado** — `/sinal-consultoria` aciona o owner, não escreve no slice.
```bash
grep -q "não escreve" .claude/skills/sinal-consultoria/SKILL.md || grep -q "aciona o owner" .claude/skills/sinal-consultoria/SKILL.md && echo OK
```

---

## Self-review (cobertura vs spec)

- §7 Onda 6 ("wire Produto consumindo/alimentando o cérebro") → Tasks 6.1 (alimenta via roteador), 6.3 (consome via declaração) ✓
- §3.6 ("sinais produto → cérebro: aluno trava = dor; pergunta = objeção; resultado = prova") → Task 6.1 classificação + roteamento ✓
- §3.6 nota ("marketing e produto se afinam sem se falarem, pelo cérebro") → integração só pelos slices, sem acoplamento direto ✓
- §7 critério ("consultoria escreve em `publico/`/`performance`; marketing usa") → **estruturalmente pronto** (o caminho existe); escrita real condicionada a consultoria real (pendência de negócio, não fabricada) ✓

## Decisões resolvidas / diferidas

- **Sem slice `produto/`** — Produto escreve nos slices existentes (dono único preservado).
- **Sem dados fictícios de aluno** — entrega o wiring; escrita real quando houver consultoria real.
- **Roadmap de produto** declarado no schema, **não criado** (YAGNI) — nasce quando o Produto for priorizado de fato.
- **`treinador` continua técnico** — só ganha a capacidade de *propor* sinais; não vira consumidor de marca.
