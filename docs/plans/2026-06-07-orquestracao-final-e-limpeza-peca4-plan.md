# Orquestração Final e Limpeza (Peça 4) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recolher as pontas das Peças 1–3 — finalizar o rename `narrativa → verdade` (script + ledger + 5 skills), remover o handler de cron órfão, consolidar o agendamento em routines, e varredura final.

**Architecture:** Rename de **código** (script `append_livro_razao.js`, verificado rodando o script) + edições de docs/config + remoção de handlers Vercel. Depende das Peças 1 e 3 prontas.

**Tech Stack:** Node ESM, Markdown/YAML, Next.js route handlers (remoção).

**Fonte:** `docs/specs/2026-06-07-orquestracao-final-e-limpeza-design.md`.

**Diretório de trabalho:** worktree `automacao-specs` (branch `automacao-specs`). Bash começa com `cd` nele.

---

## Estrutura de arquivos

**Modifica:**
- `scripts/memory/append_livro_razao.js` — flag/coluna `narrativa` → `verdade` (Task 1).
- `memory/narrativas/livro-razao.md` + `memory/narrativas/_formato.md` — header da tabela (Task 1).
- `.claude/skills/{novo-post,lote-posts,novo-email,novo-artigo,novo-comunidade}/SKILL.md` — `--narrativa` → `--verdade` (Task 1).
- `orquestracao/rotas.yaml` + `orquestracao/README.md` — agendamento por routine (Task 3).

**Deleta:**
- `site/app/api/cron/ciclo-de-direcao/` (Task 2).
- `site/app/api/cron/{pesquisar-mercado,planejar-pauta-semanal}/` (Task 3 — consolidação, aprovada na revisão).

**Cria:**
- `docs/automacao/routines.md` — setup das routines de pauta e pesquisa (Task 3).

---

## Task 1: Rename `narrativa → verdade` (atômico)

**Files:**
- Modify: `scripts/memory/append_livro_razao.js`
- Modify: `memory/narrativas/livro-razao.md`, `memory/narrativas/_formato.md`
- Modify: 5 skills de produção

> Script + header do ledger mudam **juntos** (o script valida o header). O ledger atual está vazio (só header) → sem migração de linhas.

- [ ] **Step 1: Renomear no script**

Em `scripts/memory/append_livro_razao.js`:

1. Comentário de uso (cabeçalho): trocar `--narrativa <slug|neutro>` por `--verdade <slug|neutro>`.
2. `function usage()`: trocar `--narrativa <slug|neutro>` por `--verdade <slug|neutro>`.
3. `const REQUIRED = ['data', 'mensagem', 'narrativa', 'canal', 'peca'];` → trocar `'narrativa'` por `'verdade'`.
4. `const HEADER_PATTERN = /\|\s*data\s*\|\s*mensagem\/ângulo\s*\|\s*narrativa\s*\|\s*canal\s*\|\s*peça\s*\|/i;` → trocar `narrativa` por `verdade`.
5. Construção da linha: `... | ${args.narrativa} | ...` → `... | ${args.verdade} | ...`.

- [ ] **Step 2: Renomear o header do ledger**

Em `memory/narrativas/livro-razao.md`, trocar a linha do header:

```
| data | mensagem/ângulo | narrativa | canal | peça |
```
por
```
| data | mensagem/ângulo | verdade | canal | peça |
```

(A linha separadora `|------|...` abaixo permanece.) Em `memory/narrativas/_formato.md`, fazer a mesma troca no exemplo de header e remover a nota "header ainda se chama narrativa porque o script mantém a flag" — agora ambos são `verdade`.

- [ ] **Step 3: Renomear nas 5 skills de produção**

Em cada um dos 5 SKILL.md (`novo-post`, `lote-posts`, `novo-email`, `novo-artigo`, `novo-comunidade`), trocar `--narrativa "<verdade_servida...>"` por `--verdade "<verdade_servida...>"` na chamada do `append_livro_razao.js`. (O valor já é `verdade_servida` desde a Peça 1.)

- [ ] **Step 4: Verificar o script rodando**

Run:
```bash
cd "/Users/unstudio/Documents/Projetos/dino team/.claude/worktrees/automacao-specs"
printf -- '---\nslice: narrativas\nowner: estrategista-mercado\nultima_atualizacao: 2026-06-07\nversao: 1\n---\n\n# t\n\n| data | mensagem/ângulo | verdade | canal | peça |\n|------|-----------------|---------|-------|------|\n' > /tmp/lr-peca4.md
LIVRO_RAZAO_PATH=/tmp/lr-peca4.md node scripts/memory/append_livro_razao.js --data 2026-06-07 --mensagem "teste" --verdade direcao-vence-motivacao --canal instagram --peca x
```
Expected: imprime `| 2026-06-07 | teste | direcao-vence-motivacao | instagram | x |` (exit 0).

Run (a flag antiga deve falhar):
```bash
LIVRO_RAZAO_PATH=/tmp/lr-peca4.md node scripts/memory/append_livro_razao.js --data 2026-06-07 --mensagem t --narrativa x --canal instagram --peca y; echo "exit=$?"
```
Expected: erro "argumento --verdade é obrigatório" + `exit=1`.

- [ ] **Step 5: Verificar ausência da flag antiga**

Run: `grep -rn -- "--narrativa" .claude/skills scripts memory | grep -v node_modules`
Expected: **vazio**.

- [ ] **Step 6: Commit**

```bash
git add scripts/memory/append_livro_razao.js memory/narrativas/livro-razao.md memory/narrativas/_formato.md .claude/skills/novo-post/SKILL.md .claude/skills/lote-posts/SKILL.md .claude/skills/novo-email/SKILL.md .claude/skills/novo-artigo/SKILL.md .claude/skills/novo-comunidade/SKILL.md
git commit -m "refactor: rename narrativa->verdade no livro-razao (script + ledger + 5 skills)"
```

---

## Task 2: Remover o handler de cron `ciclo-de-direcao`

**Files:**
- Delete: `site/app/api/cron/ciclo-de-direcao/`
- Modify: `site/vercel.json` (se tiver entrada de cron)

- [ ] **Step 1: Deletar o handler**

```bash
git rm -r site/app/api/cron/ciclo-de-direcao
```

- [ ] **Step 2: Remover a entrada em vercel.json**

Abrir `site/vercel.json`. Se houver um array `crons`, remover a entrada cujo `path` aponta para `/api/cron/ciclo-de-direcao`. Se o arquivo não existir ou não tiver `crons`, pular.

- [ ] **Step 3: Verificar**

Run: `ls site/app/api/cron/ 2>&1; grep -rn "ciclo-de-direcao" site/ 2>/dev/null | grep -v node_modules | grep -v ".next"`
Expected: `ciclo-de-direcao` ausente de `site/app/api/cron/`; nenhuma referência viva em `site/`.

- [ ] **Step 4: Commit**

```bash
git add -A site/
git commit -m "chore(site): remove handler de cron orfao do ciclo-de-direcao"
```

---

## Task 3: Consolidar agendamento em routines

**Files:**
- Delete: `site/app/api/cron/pesquisar-mercado/`, `site/app/api/cron/planejar-pauta-semanal/`
- Modify: `site/vercel.json`, `orquestracao/rotas.yaml`, `orquestracao/README.md`
- Create: `docs/automacao/routines.md`

Estado-alvo: as 3 skills agendadas (pesquisar-mercado, pauta, novo-post) viram routines `/schedule` que **de fato executam**. Vercel fica só com o dashboard. (Aprovado na revisão das specs.)

- [ ] **Step 1: Deletar os handlers Vercel restantes**

```bash
git rm -r site/app/api/cron/pesquisar-mercado site/app/api/cron/planejar-pauta-semanal
```
Remover as entradas correspondentes em `site/vercel.json` (array `crons`), se existirem. Se `site/app/api/cron/` ficar vazio, removê-lo também.

- [ ] **Step 2: Criar o doc das routines**

Criar `docs/automacao/routines.md`:

```markdown
# Routines de agendamento (Dino Team)

Após a consolidação (Peça 4), o agendamento é **um mecanismo só**: routines `/schedule` que executam de fato (os antigos handlers Vercel só registravam). Vercel hospeda só o dashboard (`/admin/dashboard`).

| Routine | Cadência | Skill | Modo |
|---|---|---|---|
| pesquisar-mercado | mensal (dia 1) | `/pesquisar-mercado` | autônomo (deep durável) |
| pauta-semanal | semanal (2ª) | `/planejar-pauta-semanal` | autônomo (sem a pausa manual) |
| novo-post | poll diário | `/novo-post --auto` por briefing vencendo | autônomo (ver `routine-novo-post.md`) |

Setup: criar cada routine via a skill `/schedule` com a cadência acima. `orquestracao/rotas.yaml` permanece como **documentação declarativa** que as routines espelham. Publicação nunca é automática (gate humano no dashboard, política em `orquestracao/politicas/publicacao.yaml`).
```

- [ ] **Step 3: Atualizar rotas.yaml e README**

Em `orquestracao/rotas.yaml`, adicionar no topo um comentário:
```yaml
# AGENDAMENTO: executado por routines /schedule (ver docs/automacao/routines.md).
# Este arquivo é a documentação declarativa que as routines espelham.
```
Em `orquestracao/README.md`, trocar a "**Nota de runtime**" (handlers Vercel só registram) por: "Agendamento executado por **routines `/schedule`** (ver `docs/automacao/routines.md`); o Vercel hospeda só o dashboard." Atualizar a tabela de rotas para remover a coluna/menção de Handler Vercel.

- [ ] **Step 4: Verificar**

Run: `ls site/app/api/cron/ 2>&1; grep -c "routines" orquestracao/README.md docs/automacao/routines.md`
Expected: `site/app/api/cron/` vazio ou ausente; `routines` referenciado.

- [ ] **Step 5: Commit**

```bash
git add -A site/ orquestracao/rotas.yaml orquestracao/README.md docs/automacao/routines.md
git commit -m "refactor(orquestracao): consolida agendamento em routines; remove handlers Vercel de cron"
```

---

## Task 4: Varredura final do redesign

- [ ] **Step 1: Sweep total (deve estar limpo)**

Run:
```bash
cd "/Users/unstudio/Documents/Projetos/dino team/.claude/worktrees/automacao-specs"
grep -rn "estrategista-narrativa\|ciclo-de-direcao\|narrativas/ativas\|roadmap-crenca\|narrativa_servida\|responder-coerencia\|--narrativa" \
  --include="*.md" --include="*.yaml" --include="*.js" --include="*.ts" --include="*.json" . \
  | grep -v node_modules | grep -v ".next" | grep -v "docs/plans/" | grep -v "docs/specs/2026-06-0"
```
Expected: **vazio**. Qualquer hit vivo deve ser corrigido (não em `docs/plans/*` nem specs históricos).

- [ ] **Step 2: Suíte de testes ainda verde**

Run: `npm test 2>&1 | tail -6`
Expected: todos passam.

- [ ] **Step 3: git status limpo + log**

Run: `git status --short && echo "---" && git log --oneline -8`
Expected: status vazio; commits das Peças visíveis.

- [ ] **Step 4: Commit (se o sweep exigiu fix)**

Se o Step 1 achou hit vivo: corrigir e
```bash
git add -A && git commit -m "fix: remove referencia residual no sweep final do redesign"
```
Senão, nada a commitar.

---

## Self-Review (preenchido)

**Cobertura:** Mudança 1 (rename) → Task 1; Mudança 2 (handler órfão) → Task 2; Mudança 3 (consolidar routines) → Task 3; Mudança 4 (sweep) → Task 4. ✅
**Placeholders:** nenhum; edits exatos + comandos completos. ✅
**Consistência:** `--verdade` uniforme (script REQUIRED + HEADER_PATTERN + 5 skills); header do ledger `verdade` casa com `HEADER_PATTERN`; routines doc casa com `routine-novo-post.md` da Peça 3. ✅
**Dependências:** Task 1 assume Peça 1 (valor já é `verdade_servida`); Task 2/3 assumem Peça 3 (routine novo-post documentada). ✅

> **Nota fora-do-repo (orquestrador):** atualizar a auto-memória (`MEMORY.md` em `~/.claude/projects/...`) com o redesign de 2 velocidades é tarefa do orquestrador, não deste plano (fica fora do worktree).
