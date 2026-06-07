# Auto-execução por Routine (Peça 3) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fechar a ponta da automação — a pauta produz briefings com data prevista; o `/novo-post` roda sozinho (modo `--auto`) em cada data via uma routine `/schedule`, deixando o post pronto (rascunho). Publicação **sempre** gated por humano.

**Architecture:** Mistura de **código** (resolver determinístico `briefings_do_dia.js`, TDD via `node --test`) e **documentos** (modo `--auto` do novo-post, máquina de estados, setup da routine). O resolver isola a orquestração do prompt da routine.

**Tech Stack:** Node ESM (`"type": "module"`), `node:test` + `node:assert`, parser YAML mínimo sem deps (padrão `avaliar_politica.js`), skills Markdown.

**Fonte:** `docs/specs/2026-06-07-auto-execucao-routine-design.md`. Depende idealmente das Peças 1/2 (não-bloqueante).

**Diretório de trabalho:** worktree `automacao-specs` (branch `automacao-specs`). Comandos bash começam com `cd` nele.

---

## Estrutura de arquivos

**Cria:**
- `scripts/orquestracao/briefings_do_dia.js` — resolver determinístico (Task 3).
- `scripts/orquestracao/briefings_do_dia.test.js` — testes (Task 3).
- `docs/automacao/routine-novo-post.md` — setup da routine `/schedule` (Task 5).

**Modifica:**
- `campanhas/_schema.md` — `data_prevista` na tarefa + estados novos (Task 1).
- `.claude/skills/planejar-pauta-semanal/SKILL.md` — escreve `data_prevista` por tarefa (Task 2).
- `.claude/skills/novo-post/SKILL.md` — modo `--auto` (Task 4).
- `package.json` — glob de teste inclui `scripts/orquestracao` (Task 3).

> **Não construir UI de dashboard nova:** o dashboard (`site/app/admin/dashboard/`) já tem seção `aprovacoes` que lê `status.yaml`/`aprovacoes_pendentes`. O fluxo `--auto` escreve esse estado; o surfacing reusa o que existe. Mexer no site (sob GSD) fica fora desta peça.

---

## Task 1: Máquina de estados das campanhas

**Files:**
- Modify: `campanhas/_schema.md`

- [ ] **Step 1: Adicionar `data_prevista` e os estados novos**

No `## Schema de status.yaml`, no bloco da tarefa, adicionar o campo `data_prevista` e ampliar o enum de `estado`:

```yaml
tarefas:
  - id: <slug-da-tarefa>
    skill: /<skill que executa>
    estado: pendente | em-andamento | aguardando-publicacao | aguardando-aprovacao | concluida | falhou-gate | falhou-auto | falhou
    output: <caminho ou null>
    data_prevista: YYYY-MM-DD | null   # data prevista de publicação (pauta semanal)
    atualizado_em: YYYY-MM-DDTHH:mm
```

E adicionar, abaixo do bloco, a legenda:

```markdown
**Estados do fluxo autônomo (Peça 3):**
- `aguardando-publicacao` — post gerado por `/novo-post --auto`, pronto, esperando aprovação humana de publicação no dashboard.
- `falhou-gate` — `revisor-brand` reprovou 2× no modo `--auto`; não há rascunho publicável.
- `falhou-auto` — erro de execução no modo `--auto`.
```

- [ ] **Step 2: Verificar**

Run: `grep -c "aguardando-publicacao\|falhou-gate\|falhou-auto\|data_prevista" campanhas/_schema.md`
Expected: `>= 4`.

- [ ] **Step 3: Commit**

```bash
cd "/Users/unstudio/Documents/Projetos/dino team/.claude/worktrees/automacao-specs"
git add campanhas/_schema.md
git commit -m "feat(campanhas): estados do fluxo autonomo (aguardando-publicacao, falhou-*) + data_prevista"
```

---

## Task 2: Pauta escreve `data_prevista` por tarefa

**Files:**
- Modify: `.claude/skills/planejar-pauta-semanal/SKILL.md`

- [ ] **Step 1: Incluir `data_prevista` no status.yaml gerado**

No Passo que grava `status.yaml`, no bloco de cada tarefa, adicionar a linha `data_prevista` (vinda da "Data prevista de publicação" do briefing):

```yaml
tarefas:
  - id: <slug-do-briefing>
    skill: /novo-post
    estado: pendente
    output: output/posts/<N>-<slug>.md
    data_prevista: <YYYY-MM-DD do briefing>
    atualizado_em: <agora>
```

- [ ] **Step 2: Verificar**

Run: `grep -c "data_prevista" .claude/skills/planejar-pauta-semanal/SKILL.md`
Expected: `>= 1`.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/planejar-pauta-semanal/SKILL.md
git commit -m "feat(skills): pauta-semanal grava data_prevista por tarefa no status.yaml"
```

---

## Task 3: Resolver `briefings_do_dia.js` (TDD)

**Files:**
- Create: `scripts/orquestracao/briefings_do_dia.js`
- Test: `scripts/orquestracao/briefings_do_dia.test.js`
- Modify: `package.json` (glob de teste)

- [ ] **Step 1: Escrever o teste que falha**

Criar `scripts/orquestracao/briefings_do_dia.test.js`:

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { briefingsDoDia, parseTarefas } from "./briefings_do_dia.js";

test("parseTarefas extrai os campos de cada tarefa", () => {
  const yaml = `campanha:
  slug: x
tarefas:
  - id: post-a
    skill: /novo-post
    estado: pendente
    output: output/posts/1-a.md
    data_prevista: 2026-06-09
  - id: post-b
    skill: /novo-post
    estado: concluida
    output: output/posts/2-b.md
    data_prevista: 2026-06-10
aprovacoes_pendentes: []
`;
  const ts = parseTarefas(yaml);
  assert.equal(ts.length, 2);
  assert.equal(ts[0].id, "post-a");
  assert.equal(ts[0].data_prevista, "2026-06-09");
  assert.equal(ts[1].estado, "concluida");
});

test("briefingsDoDia retorna so pendentes /novo-post vencendo ate hoje", () => {
  const dir = mkdtempSync(join(tmpdir(), "camp-"));
  const c = join(dir, "2026-W24-pauta-semanal");
  mkdirSync(c, { recursive: true });
  writeFileSync(
    join(c, "status.yaml"),
    `tarefas:
  - id: hoje
    skill: /novo-post
    estado: pendente
    output: output/posts/1-hoje.md
    data_prevista: 2026-06-09
  - id: futuro
    skill: /novo-post
    estado: pendente
    output: output/posts/2-futuro.md
    data_prevista: 2026-06-20
  - id: feito
    skill: /novo-post
    estado: concluida
    output: output/posts/3-feito.md
    data_prevista: 2026-06-09
`
  );
  const res = briefingsDoDia({ campanhasDir: dir, today: "2026-06-09" });
  rmSync(dir, { recursive: true, force: true });
  assert.equal(res.length, 1);
  assert.equal(res[0].tarefa_id, "hoje");
  assert.equal(res[0].output, "output/posts/1-hoje.md");
});
```

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `node --test scripts/orquestracao/briefings_do_dia.test.js`
Expected: FAIL — `Cannot find module './briefings_do_dia.js'`.

- [ ] **Step 3: Implementar o resolver**

Criar `scripts/orquestracao/briefings_do_dia.js`:

```javascript
#!/usr/bin/env node
/**
 * briefings_do_dia.js — resolve quais briefings de pauta vencem hoje.
 * Sem deps externas (parser YAML mínimo, como avaliar_politica.js).
 *
 * Uso: node scripts/orquestracao/briefings_do_dia.js
 * Env: CAMPANHAS_DIR (default "campanhas"), TODAY=YYYY-MM-DD (default hoje).
 * Saída (stdout): JSON array [{ campanha, tarefa_id, output, data_prevista }]
 *   — apenas tarefas estado=pendente, skill=/novo-post, data_prevista <= TODAY.
 */
import { readFileSync, existsSync, readdirSync } from "fs";
import { resolve, join } from "path";

/** Parser mínimo da lista `tarefas:` de um status.yaml. */
export function parseTarefas(yamlText) {
  const lines = yamlText.split(/\r?\n/);
  const tarefas = [];
  let cur = null;
  let inTarefas = false;
  for (const line of lines) {
    if (/^tarefas:\s*$/.test(line)) { inTarefas = true; continue; }
    // chave top-level (sem indentação) encerra o bloco tarefas
    if (inTarefas && /^\S/.test(line) && !/^\s*-/.test(line)) { inTarefas = false; }
    if (!inTarefas) continue;
    const item = line.match(/^\s*-\s+id:\s*(.+?)\s*$/);
    if (item) {
      if (cur) tarefas.push(cur);
      cur = { id: item[1].trim() };
      continue;
    }
    const kv = line.match(/^\s+([a-z_]+):\s*(.*?)\s*$/);
    if (kv && cur) cur[kv[1]] = kv[2].trim();
  }
  if (cur) tarefas.push(cur);
  return tarefas;
}

/** Retorna os briefings vencendo até `today` (inclui atrasados pendentes). */
export function briefingsDoDia({ campanhasDir, today }) {
  const out = [];
  if (!existsSync(campanhasDir)) return out;
  for (const entry of readdirSync(campanhasDir)) {
    const statusPath = join(campanhasDir, entry, "status.yaml");
    if (!existsSync(statusPath)) continue;
    for (const t of parseTarefas(readFileSync(statusPath, "utf8"))) {
      if (
        t.estado === "pendente" &&
        t.skill === "/novo-post" &&
        t.data_prevista &&
        t.data_prevista <= today
      ) {
        out.push({
          campanha: entry,
          tarefa_id: t.id,
          output: t.output ?? null,
          data_prevista: t.data_prevista,
        });
      }
    }
  }
  out.sort((a, b) =>
    (a.data_prevista + a.campanha).localeCompare(b.data_prevista + b.campanha)
  );
  return out;
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const campanhasDir = resolve(process.env.CAMPANHAS_DIR || "campanhas");
  const today = process.env.TODAY || new Date().toISOString().slice(0, 10);
  console.log(JSON.stringify(briefingsDoDia({ campanhasDir, today }), null, 2));
}
```

- [ ] **Step 4: Rodar o teste e ver passar**

Run: `node --test scripts/orquestracao/briefings_do_dia.test.js`
Expected: PASS (2 tests, 0 fail).

- [ ] **Step 5: Incluir o diretório no glob de teste do package.json**

Em `package.json`, trocar o script de teste para incluir `scripts/orquestracao`:

```json
    "test": "node --test scripts/editor/*.test.js scripts/orquestracao/*.test.js",
```

Run: `npm test 2>&1 | tail -5`
Expected: a suíte inteira passa (inclui os 2 novos testes).

- [ ] **Step 6: Commit**

```bash
git add scripts/orquestracao/briefings_do_dia.js scripts/orquestracao/briefings_do_dia.test.js package.json
git commit -m "feat(orquestracao): briefings_do_dia.js resolve pauta vencendo hoje (determinístico, testado)"
```

---

## Task 4: Modo `--auto` do `/novo-post`

**Files:**
- Modify: `.claude/skills/novo-post/SKILL.md`

Em `--auto` o post roda ponta-a-ponta sem pausa, sempre a partir de `--briefing`, parando antes de publicar.

- [ ] **Step 1: Parsear a flag no Passo 1**

No Passo 1 (parse de input), adicionar:

```markdown
- `--auto` → `modo_auto = true`. Só válido junto de `--briefing` (execução autônoma por routine). Sem `--briefing`, ignore `--auto` e siga interativo.
```

- [ ] **Step 2: Adicionar a seção de comportamento autônomo**

Após o "Princípio central", inserir:

```markdown
## Modo autônomo (`--auto`)

Quando `modo_auto = true` (sempre com `--briefing` pré-pronto, então Passos 3/3.⏸/4/4.⏸ já são pulados), o pipeline roda **sem nenhuma pausa humana** e **nunca publica**:

- **Passo 10 (copy):** gera a copy e segue **sem** a pausa de revisão.
- **Passo 11 (Dino Editor):** **não sobe o editor**; usa os `slide-N.html` gerados direto → export. Fotos: se a campanha apontar banco, o Passo 11m (`arquivista`) pré-preenche; sem banco, segue com placeholders do estilo.
- **Passo 11.5 (aprendizado de estilo):** **pulado** (sem `edits.json`).
- **Passo 13 (gate `revisor-brand`):** **permanece**. Se REPROVADO: 1 retry; 2º fracasso → marca a tarefa como `falhou-gate` no `status.yaml` da campanha e **encerra sem entregar** (não publica lixo).
- **Passo 14.5 (stories):** **pulado**.
- **Passo 15 (rascunho):** N/A (estilo definido).
- **Passo 16 (publicação):** **nunca executa**. Ao concluir o gate APROVADO, atualiza a tarefa no `status.yaml` da campanha para `aguardando-publicacao` (+ entrada em `aprovacoes_pendentes` canal `dashboard`) e encerra. A publicação é sempre aprovação humana no dashboard.

Erro de execução em qualquer passo `--auto` → marca a tarefa como `falhou-auto` e encerra. Modo interativo (sem `--auto`) é inalterado.
```

- [ ] **Step 3: Referenciar `--auto` nos passos de pausa**

Em cada pausa (Passos 10, 11, 11.5, 14.5), adicionar no início a nota: `**Em `--auto`: pular esta pausa (ver "Modo autônomo").**` E no Passo 16, nota: `**Em `--auto`: não publicar; marcar `aguardando-publicacao`.**`

- [ ] **Step 4: Verificar**

Run: `grep -c "Modo autônomo\|modo_auto\|--auto\|aguardando-publicacao\|falhou-gate\|falhou-auto" .claude/skills/novo-post/SKILL.md`
Expected: `>= 6`.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/novo-post/SKILL.md
git commit -m "feat(skills): novo-post ganha modo --auto (sem pausas; para em aguardando-publicacao)"
```

---

## Task 5: Setup da routine `/schedule` (doc)

**Files:**
- Create: `docs/automacao/routine-novo-post.md`

A routine em si é **setup manual do usuário** via a skill `/schedule` (não automatizável por subagente). Esta task documenta o procedimento e o prompt da routine.

- [ ] **Step 1: Criar o doc de setup**

Criar `docs/automacao/routine-novo-post.md`:

```markdown
# Routine de auto-execução do `/novo-post`

Runner da Peça 3: uma routine `/schedule` diária que gera os posts cuja data prevista venceu, deixando-os `aguardando-publicacao` (humano publica no dashboard).

## Setup (manual, uma vez)

Crie uma routine diária via a skill `/schedule` com o prompt abaixo. Cadência sugerida: diária, 08:00 `America/Sao_Paulo`.

**Prompt da routine:**

> Rode `node scripts/orquestracao/briefings_do_dia.js` no repo. Para cada item do JSON retornado, execute `/novo-post --briefing <campanha>/<output> --auto`. Ao concluir cada post (gate APROVADO), atualize a tarefa correspondente no `status.yaml` da campanha para `aguardando-publicacao` e commite o rascunho do post. Se `briefings_do_dia.js` retornar `[]`, não faça nada. Nunca publique — publicação é aprovação humana no dashboard. Reporte os posts gerados e quaisquer `falhou-gate`/`falhou-auto`.

## Verificação antes de confiar na routine

1. `TODAY=<uma data com briefing pendente> node scripts/orquestracao/briefings_do_dia.js` retorna os briefings esperados.
2. `/novo-post --briefing <um briefing real> --auto` gera o post e para em `aguardando-publicacao` (não publica).
3. O dashboard (`/admin/dashboard` → aprovações) mostra o post aguardando publicação.

## Verificar na implementação (flag honesto do spec)

A mecânica exata do `/schedule` (execução headless de skill + commit no repo conectado ao GitHub) deve ser confirmada na primeira configuração. Se a routine não conseguir rodar a skill headless, alternativas: runner local (`claude -p`) no cron, ou GitHub Action — o resolver `briefings_do_dia.js` é determinístico e serve qualquer um deles.
```

- [ ] **Step 2: Verificar**

Run: `test -f docs/automacao/routine-novo-post.md && grep -c "briefings_do_dia\|--auto\|aguardando-publicacao\|Nunca publique\|nunca publique" docs/automacao/routine-novo-post.md`
Expected: arquivo existe; `>= 3`.

- [ ] **Step 3: Commit**

```bash
git add docs/automacao/routine-novo-post.md
git commit -m "docs(automacao): setup da routine /schedule p/ auto-execucao do novo-post"
```

---

## Task 6: Verificação final (Peça 3)

- [ ] **Step 1: Suíte de testes verde**

Run:
```bash
cd "/Users/unstudio/Documents/Projetos/dino team/.claude/worktrees/automacao-specs"
npm test 2>&1 | tail -6
```
Expected: todos os testes passam (inclui `briefings_do_dia.test.js`).

- [ ] **Step 2: Resolver roda na CLI**

Run: `TODAY=2099-01-01 node scripts/orquestracao/briefings_do_dia.js`
Expected: JSON (array — vazio ou com tarefas pendentes reais; sem erro).

- [ ] **Step 3: git status limpo**

Run: `git status --short`
Expected: vazio.

---

## Self-Review (preenchido)

**Cobertura:** Mudança 1 (--auto) → Task 4; Mudança 2 (resolver) → Task 3; Mudança 3 (routine) → Task 5; Mudança 4 (estado/gate) → Tasks 1+2; constraint fotos → nota no Task 4 Passo 11. ✅
**Placeholders:** nenhum; código e docs completos inline. ✅
**Consistência:** `data_prevista` (schema Task 1 = pauta Task 2 = resolver Task 3); estados `aguardando-publicacao`/`falhou-gate`/`falhou-auto` idênticos entre `_schema.md` (Task 1) e `novo-post --auto` (Task 4); `parseTarefas`/`briefingsDoDia` exportados e usados no teste com os mesmos nomes. ✅
**TDD:** Task 3 segue write-test → fail → impl → pass → commit. ✅
