# Ângulos Queimados — Gatilho no Finalizar · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer `dados/performance/angulos-queimados.md` realmente popular, mudando o gatilho de escrita de "publicação via API" (que nunca dispara) para "post finalizado" — e corrigir as referências stale.

**Architecture:** Edições de skill/doc (Markdown). Sem código, sem teste unitário. O `analista-performance` (owner) passa a gravar o ângulo quando o post é aprovado no gate de marca e entregue; as skills `/novo-post` e `/lote-posts` o acionam nesse ponto. Validação = coerência de referências cruzadas + teste real do usuário.

**Tech Stack:** Markdown. Git. `grep` para verificação de coerência.

**Spec:** `docs/specs/2026-06-04-angulos-queimados-gatilho-finalizar-design.md`

**Correção de ancoragem vs. spec:** o spec dizia "Passo 15 (salvo permanente)", mas o Passo 15 do `/novo-post` é housekeeping do **estilo ad-hoc** (`_rascunho/`), não do post. O ponto correto de finalização do **post** é após o Passo 13 (APROVADO) + 14 (entregue). A gravação entra como **Passo 15.5** (antes do publish opcional, Passo 16). Mesma intenção (gravar quando finalizado, não via API).

---

## File Structure

| Arquivo | Mudança |
|---|---|
| `dados/performance/angulos-queimados.md` | Cabeçalho: remover ref ao `briefing-writer` (deletado) + descrever o fluxo real |
| `.claude/agents/analista-performance.md` | Gatilho: "após publicação aprovada" → "após o post ser finalizado (gate aprovado + entregue)" |
| `.claude/skills/novo-post/SKILL.md` | Novo Passo 15.5 (registrar ângulo) + linha na tabela `## Fluxo` |
| `.claude/skills/lote-posts/SKILL.md` | Registrar ângulo por post após o gate (Passo 8) + linha na tabela `## Fluxo` |
| `dados/_schema.md` | Verificar slice performance; alinhar só se citar gatilho antigo |

**Não toca:** `pesquisador-mercado`, `dados/mercado/`, read-side de `angulos-queimados`.

---

## Task 1: Corrigir o cabeçalho de `angulos-queimados.md`

**Files:**
- Modify: `dados/performance/angulos-queimados.md`

- [ ] **Step 1: Substituir a linha de descrição stale**

Em `dados/performance/angulos-queimados.md`, substituir:
```
Ângulos editoriais usados recentemente que precisam de descanso antes de voltar. Lido por `briefing-writer` antes de aprovar um novo ângulo; escrito por `analista-performance` após uma publicação aprovada.
```
por:
```
Ângulos editoriais usados recentemente que precisam de descanso antes de voltar. Lido pelas skills `/novo-post`, `/lote-posts` e `/planejar-pauta-semanal` ao escolher o ângulo (briefing inline); escrito por `analista-performance` após o post ser finalizado — aprovado no gate de marca e entregue.
```

- [ ] **Step 2: Substituir a nota de "entradas ativas"**

Substituir:
```
_(Sem entradas em v1. Cresce orgânicamente após cada publicação aprovada.)_
```
por:
```
_(Sem entradas em v1. Cresce orgânicamente após cada post finalizado.)_
```

- [ ] **Step 3: Commit**

```bash
git add dados/performance/angulos-queimados.md
git commit -m "fix(dados): angulos-queimados — fluxo correto (sem ref ao briefing-writer deletado)"
```

---

## Task 2: Reescrever o gatilho no `analista-performance.md`

**Files:**
- Modify: `.claude/agents/analista-performance.md`

- [ ] **Step 1: Atualizar o parágrafo de escopo v1**

Em `.claude/agents/analista-performance.md`, substituir o trecho:
```
Você cuida só de `performance/angulos-queimados.md`: após uma publicação ser aprovada, registra o ângulo usado para que a skill (que decide o ângulo inline) não o repita cedo demais.
```
por:
```
Você cuida só de `performance/angulos-queimados.md`: após o post ser finalizado (aprovado no gate de marca e entregue pela skill), registra o ângulo usado para que as próximas decisões de ângulo (inline na skill) não o repitam cedo demais. Não depende de publicação via API — o post finalizado é o gatilho.
```

- [ ] **Step 2: Atualizar a descrição da task #1**

Substituir:
```
1. **Registrar ângulo queimado** — após publicação aprovada: adicionar entrada em `angulos-queimados.md` com slug do ângulo, data, resumo, janela de descanso e data de retorno.
```
por:
```
1. **Registrar ângulo queimado** — após o post ser finalizado (gate de marca aprovado + entregue): adicionar entrada em `angulos-queimados.md` com slug do ângulo, data, resumo, janela de descanso e data de retorno.
```

- [ ] **Step 3: Verificar o frontmatter `description`**

Ler o frontmatter do agente. Se a `description:` disser algo como "após publicação", alinhar para "após o post ser finalizado". Se já for genérica ("ângulos usados que precisam descansar"), não mudar.

- [ ] **Step 4: Commit**

```bash
git add .claude/agents/analista-performance.md
git commit -m "fix(agent:analista-performance): gatilho de ângulo no finalizar (não via API)"
```

---

## Task 3: Novo Passo 15.5 no `/novo-post`

**Files:**
- Modify: `.claude/skills/novo-post/SKILL.md`

- [ ] **Step 1: Adicionar a linha na tabela `## Fluxo`**

Na tabela de fluxo, logo após a linha do Passo 15 (`| 15 | ⚙ salvar/descartar _rascunho/ ...`), inserir:
```
| 15.5 | analista-performance — registrar ângulo | ângulo/pilar/slug ← 6 | 13 | entrada em angulos-queimados |
```

- [ ] **Step 2: Adicionar a seção do passo**

Inserir uma nova seção entre o Passo 15 e o Passo 16 (a seção do Passo 16 começa em "publicação"):
```markdown
### 15.5. Registrar ângulo queimado

Após o post ser **APROVADO** no gate de marca (Passo 13) e entregue (Passo 14), acione `analista-performance` para gravar o ângulo usado — assim os próximos posts não o repetem. **Não depende de publicação via API; o post finalizado é o gatilho.** Se o post foi REPROVADO sem recuperação ou descartado, **não** registre.

Acione `analista-performance`:
```
Tarefa: registrar ângulo queimado.
Ângulo central: <ângulo definido no Passo 6>
Pilar: <pilar do Passo 6>
Slug: <slug do Passo 6>
Data da publicação: <data de hoje>
```
O `analista-performance` define a janela de descanso por bom senso editorial (ângulo específico descansa mais; amplo, menos) e grava a entrada em `dados/performance/angulos-queimados.md`. Se o mesmo ângulo já existir, ele atualiza a data em vez de duplicar.
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/novo-post/SKILL.md
git commit -m "feat(skill:novo-post): registrar ângulo queimado ao finalizar (Passo 15.5)"
```

---

## Task 4: Registrar ângulo por post no `/lote-posts`

**Files:**
- Modify: `.claude/skills/lote-posts/SKILL.md`

- [ ] **Step 1: Ler o arquivo e localizar o ponto pós-gate**

Ler `.claude/skills/lote-posts/SKILL.md`. O Passo 8 faz export + `revisor-brand` por post; o Passo 10 faz política de publish por post. O registro do ângulo entra **por post, após o gate do Passo 8** (post aprovado), antes do publish.

- [ ] **Step 2: Adicionar a linha na tabela `## Fluxo`**

Após a linha do Passo 8 (`| 8 | export-png.js + revisor-brand (×posts) ...`), inserir:
```
| 8.5 | analista-performance — registrar ângulo (×posts) | ângulo ← 5 | 8 | entradas em angulos-queimados |
```

- [ ] **Step 3: Adicionar a instrução de registro**

Na seção do Passo 8 (após o gate de marca por post), acrescentar:
```markdown
**Registrar ângulo queimado (por post aprovado):** para cada post que passou no gate, acione `analista-performance`:
```
Tarefa: registrar ângulo queimado.
Ângulo central: <ângulo central do post, fixado no Passo 5>
Pilar: <pilar do post>
Slug: <slug do post>
Data da publicação: <data de hoje>
```
Posts pulados (erro de export) ou reprovados no gate **não** registram ângulo. O `analista-performance` atualiza a data se o ângulo já existir.
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/lote-posts/SKILL.md
git commit -m "feat(skill:lote-posts): registrar ângulo queimado por post aprovado"
```

---

## Task 5: Verificar/alinhar `dados/_schema.md`

**Files:**
- Modify (condicional): `dados/_schema.md`

- [ ] **Step 1: Inspecionar a descrição do slice performance**

Run:
```bash
grep -n "Performance\|angulos-queimados\|publicação real\|Onda 5" dados/_schema.md
```
A linha do slice performance diz: "Onda 3 só popula `angulos-queimados.md`; sub-slices por canal ... entram quando publicação real existir (Onda 5+)". Isso **já está correto** — `angulos-queimados` popula agora (Onda 3); só os sub-slices de canal esperam métricas reais. O gatilho de `angulos-queimados` não está amarrado a API ali.

- [ ] **Step 2: Decidir**

Se a linha **não** amarra `angulos-queimados` a "publicação via API" (esperado: não amarra), **não fazer mudança** e seguir. Se amarrar, ajustar para "popula após o post ser finalizado". Como o esperado é nenhuma mudança, não há commit nesta task salvo se um ajuste real for necessário.

- [ ] **Step 3: Commit (somente se houve edição)**

```bash
git add dados/_schema.md
git commit -m "docs(dados): _schema — alinhar gatilho do angulos-queimados ao finalizar"
```
(Se nada mudou, pular o commit e registrar "sem mudança" no relato.)

---

## Task 6: Verificação de coerência de referências cruzadas

**Files:** — (nenhum; verificação)

- [ ] **Step 1: Caçar referências stale ao agente deletado**

Run:
```bash
cd "/Users/unstudio/Documents/Projetos/dino team"
grep -rn "briefing-writer" .claude/ dados/ templates/ 2>/dev/null || echo "(limpo — nenhuma ref a briefing-writer)"
```
Expected: nenhuma ocorrência em `angulos-queimados.md` nem nos agentes/skills relativos a este fluxo. (Se houver `briefing-writer` em outros docs fora deste escopo, apenas reportar — não corrigir aqui.)

- [ ] **Step 2: Caçar o gatilho antigo amarrado a ângulos**

Run:
```bash
grep -rn "publicação aprovada\|publicação via API\|após uma publicação" .claude/agents/analista-performance.md dados/performance/angulos-queimados.md 2>/dev/null || echo "(limpo — gatilho antigo removido)"
```
Expected: nenhuma ocorrência do gatilho antigo nesses dois arquivos.

- [ ] **Step 3: Confirmar que o read-side e o pesquisador-mercado seguem intactos**

Run:
```bash
grep -rn "angulos-queimados" .claude/skills/*/SKILL.md | grep -i "não repetir\|escolher\|lê\|ler"
git diff --name-only a26c59f..HEAD | grep -i "pesquisador-mercado" || echo "(pesquisador-mercado intocado ✓)"
```
Expected: read-side continua presente nas skills; `pesquisador-mercado` não aparece nos arquivos alterados.

> Sem commit — verificação. Reportar qualquer anomalia ao controller.

---

## Self-Review (cobertura do spec)

- **D1/D2 (gatilho no finalizar, ponto no fluxo):** Task 3 (novo-post Passo 15.5) + Task 4 (lote-posts pós-gate). Ancoragem corrigida para APROVADO+entregue (Passo 13/14), documentada no header. ✔
- **D3 (analista-performance escreve):** Task 2 (gatilho reescrito) + Tasks 3/4 (skills acionam). ✔
- **D4 (janela de descanso por bom senso):** preservada — princípio do agente, citado nas instruções de acionamento. ✔
- **Cabeçalho stale / briefing-writer:** Task 1 + Task 6 (verificação). ✔
- **_schema alinhado:** Task 5 (condicional). ✔
- **Não tocar pesquisador-mercado / read-side:** Task 6 step 3 confirma. ✔

Sem placeholders (todos os blocos old→new têm texto exato; os `<...>` são variáveis de runtime preenchidas pela skill, não lacunas do plano). Sem teste unitário por ser skill/doc — validação por grep de coerência (Task 6) + teste real do usuário. Nomes consistentes (Passo 15.5 / 8.5; analista-performance; angulos-queimados) entre tasks.
