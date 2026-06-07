# Pesquisa Universal por Tipo (Peça 2) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer a pesquisa de tema rodar para **todo** post (não só informacionais) e ser **type-aware** — fonte e profundidade por pilar, virando fonte de criatividade.

**Architecture:** Codebase de documentos (skills/agentes Markdown). Sem código novo → plano dirigido por verificação (grep). Cada task = edição + verificação + commit.

**Tech Stack:** Markdown, contratos de agente, convenção de skills.

**Fonte:** `docs/specs/2026-06-07-pesquisa-universal-por-tipo-design.md`. Autocontida (independe das Peças 1/3/4).

**Diretório de trabalho:** worktree `automacao-specs` (branch `automacao-specs`). Todos os caminhos relativos a ele.

---

## Estrutura de arquivos

**Modifica:**
- `.claude/skills/pesquisar-tema/SKILL.md` — seção `## Perfis de fonte por pilar` + resolução por `--pilar` (Task 1).
- `.claude/agents/pesquisador-mercado.md` — modo deep research parametrizado por `Fontes`/`Profundidade` (Task 2).
- `.claude/skills/novo-post/SKILL.md` — Passo 9: condicional → sempre (Task 3).
- `.claude/skills/lote-posts/SKILL.md` — Passo 5d: pesquisa por pilar, sempre (Task 4).

---

## Task 1: Perfis de fonte por pilar em `/pesquisar-tema`

**Files:**
- Modify: `.claude/skills/pesquisar-tema/SKILL.md`

- [ ] **Step 1: Adicionar a seção de perfis**

Inserir, antes de `## Critério de conclusão`, a seção:

```markdown
## Perfis de fonte por pilar

A skill resolve o perfil a partir de `--pilar` (de `brand/pilares-conteudo.md`) e o passa ao `pesquisador-mercado` nos campos `Fontes` e `Profundidade`. O perfil respeita o `## Off-limits` dos pilares (sem motivação vazia, sem promessa irreal).

| Pilar | Fontes prioritárias | Profundidade | Foco criativo |
|---|---|---|---|
| **Mentalidade** | Livros/autores (estoicismo, filosofia aplicada), correntes de pensamento, debates culturais sobre disciplina/processo | média | Frases/autores/frameworks pra copy riffar; ângulos contraintuitivos. Filosofia conectada à prática, nunca motivação vazia. |
| **Método** | Estudos de hipertrofia/periodização, autoridades técnico-científicas do nicho, métodos consagrados | profunda | Dado verificável + mito a quebrar + a lógica por trás |
| **Prova viva** | Fatos técnicos de fisiculturismo de elite + `memory/ramon/contexto.md`; análises técnicas | média | Princípio universal (não biografia 1ª pessoa); o que separa elite de amador |
| **Transformação** | Interno: `memory/performance/provas-de-aluno.md` + `memory/publico/`; externo leve | rasa (quase interna) | Prova social real, mecânica da consultoria. Sem promessa irreal. |

- Pilar ausente/desconhecido → perfil default **Mentalidade** (média, criativo) + aviso de 1 linha.
- "Rasa (interna)" = priorizar `memory/`, no máximo 1 WebFetch leve; **não** varredura cara.
```

- [ ] **Step 2: Passar o perfil ao agente no Passo 2**

No Passo "Pesquisa profunda" da skill, no prompt do `pesquisador-mercado`, trocar a linha fixa de profundidade por:

```markdown
- Profundidade: <profundidade do perfil do pilar — rasa | média | profunda>
- Fontes: <fontes prioritárias do perfil do pilar>
```

- [ ] **Step 3: Verificar**

Run: `grep -c "Perfis de fonte por pilar\|Mentalidade\|Método\|Prova viva\|Transformação" .claude/skills/pesquisar-tema/SKILL.md`
Expected: `>= 5`.

Run: `grep -c "Fontes:" .claude/skills/pesquisar-tema/SKILL.md`
Expected: `>= 1`.

- [ ] **Step 4: Commit**

```bash
cd "/Users/unstudio/Documents/Projetos/dino team/.claude/worktrees/automacao-specs"
git add .claude/skills/pesquisar-tema/SKILL.md
git commit -m "feat(skills): pesquisar-tema ganha perfis de fonte por pilar (type-aware)"
```

---

## Task 2: Deep research parametrizado no `pesquisador-mercado`

**Files:**
- Modify: `.claude/agents/pesquisador-mercado.md`

- [ ] **Step 1: Tornar o modo deep research parametrizado**

Em `.claude/agents/pesquisador-mercado.md`, no bloco que descreve a pesquisa profunda (modo deep research / "matéria-prima profunda para a copy"), adicionar:

```markdown
**Fonte e profundidade parametrizadas (type-aware):** quando a skill passar `Fontes:` e `Profundidade:`, priorize essas fontes e calibre o esforço pela profundidade:
- `rasa` — priorize `memory/` (interno); no máximo 1 WebFetch leve.
- `média` — 2-3 fontes sólidas do tipo indicado (ex: livros/autores p/ Mentalidade; fatos técnicos p/ Prova viva).
- `profunda` — varredura técnica/científica com WebFetch nas fontes promissoras (comportamento padrão atual).

Sem esses campos, mantenha o comportamento atual (deep). O princípio "cite fontes / específico > genérico / identifique contradições" vale em qualquer profundidade — muda só onde cavar e quão fundo. Para Mentalidade/filosofia, traga **frases/autores/frameworks** como matéria-prima criativa, nunca motivação vazia.
```

- [ ] **Step 2: Verificar**

Run: `grep -c "Fonte e profundidade parametrizadas\|rasa\|média\|profunda" .claude/agents/pesquisador-mercado.md`
Expected: `>= 4`.

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/pesquisador-mercado.md
git commit -m "feat(agents): pesquisador-mercado aceita Fontes/Profundidade no deep research (type-aware)"
```

---

## Task 3: `/novo-post` Passo 9 — de condicional para sempre

**Files:**
- Modify: `.claude/skills/novo-post/SKILL.md`

- [ ] **Step 1: Reescrever o início do Passo 9**

Substituir o parágrafo atual do Passo 9 ("Execute quando o ângulo for informacional… Pule em post puramente narrativo.") por:

```markdown
Execute **para todo post**. A profundidade e as fontes vêm do **perfil do pilar** do briefing (Passo 6), resolvido pela `/pesquisar-tema`. A pesquisa é fonte de criatividade, não só de fato — inclusive em posts de Mentalidade.

Invoque `/pesquisar-tema`:

\```
/pesquisar-tema <tema> --pilar <pilar do briefing> --recorte <recorte do briefing>
\```

A `/pesquisar-tema` resolve o perfil de fonte/profundidade pelo `--pilar` (ver `## Perfis de fonte por pilar` na skill). O cache de `memory/pesquisa/` continua valendo: se a slug já existe, pula.
```

- [ ] **Step 2: Verificar**

Run: `grep -c "para todo post\|perfil do pilar" .claude/skills/novo-post/SKILL.md`
Expected: `>= 1`.

Run: `grep -c "Pule em post puramente narrativo" .claude/skills/novo-post/SKILL.md`
Expected: `0`.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/novo-post/SKILL.md
git commit -m "feat(skills): novo-post pesquisa todo post (type-aware por pilar), nao so informacional"
```

---

## Task 4: `/lote-posts` Passo 5d — pesquisa por pilar, sempre

**Files:**
- Modify: `.claude/skills/lote-posts/SKILL.md`

- [ ] **Step 1: Atualizar o Passo 5d (pesquisa profunda)**

No Passo `#### 5d. Pesquisa profunda`, substituir a chamada por:

```markdown
Acione `pesquisador-mercado` por post, **sempre**, com o perfil do pilar do post (ver `## Perfis de fonte por pilar` em `/pesquisar-tema`):

\```
/pesquisar-tema <tema do post> --pilar <pilar do post> --recorte <recorte do post>
\```

A profundidade vem do perfil (rasa p/ Transformação; média p/ Mentalidade/Prova viva; profunda p/ Método). Posts que compartilham pilar/tema reaproveitam o cache de `memory/pesquisa/` — uma pesquisa serve vários.
```

- [ ] **Step 2: Verificar**

Run: `grep -c "perfil do pilar\|sempre" .claude/skills/lote-posts/SKILL.md`
Expected: `>= 1`.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/lote-posts/SKILL.md
git commit -m "feat(skills): lote-posts pesquisa por pilar sempre (type-aware), com cache compartilhado"
```

---

## Task 5: Verificação final (Peça 2)

- [ ] **Step 1: Conferir cobertura**

Run:
```bash
cd "/Users/unstudio/Documents/Projetos/dino team/.claude/worktrees/automacao-specs"
grep -lc "Perfis de fonte por pilar" .claude/skills/pesquisar-tema/SKILL.md && \
grep -lc "Fonte e profundidade parametrizadas" .claude/agents/pesquisador-mercado.md && \
grep -lc "para todo post" .claude/skills/novo-post/SKILL.md
```
Expected: os 3 arquivos retornam (todas as mudanças aplicadas).

- [ ] **Step 2: git status limpo**

Run: `git status --short`
Expected: vazio (tudo commitado).

---

## Self-Review (preenchido)

**Cobertura:** Mudança 1 (perfis) → Task 1; Mudança 2 (agente param.) → Task 2; Mudança 3 (novo-post sempre) → Task 3; Mudança 4 (lote-posts) → Task 4. ✅
**Placeholders:** nenhum; conteúdo inline completo. ✅
**Consistência:** `--pilar` resolve perfil → `Fontes`/`Profundidade` passados ao agente; nomes idênticos entre Task 1 (skill) e Task 2 (agente). ✅
