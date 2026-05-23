# Onda 1 — Reorganização Estrutural — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preparar a estrutura para as ondas 2-5: criar as pastas-placeholder das camadas futuras (`dados/`, `campanhas/`, `orquestracao/`, `dados/politicas/`), e atualizar `CLAUDE.md` para começar a agrupar os agentes existentes por setor/papel textualmente (preparando o terreno conceitual para os novos agentes que entram nas ondas seguintes).

**Architecture (revisada em 2026-05-23 após smoke test):**
- **Layout flat confirmado:** o loader de subagentes do Claude Code não enxerga subdiretórios em `.claude/agents/` — agentes só são resolvíveis quando vivem em `.claude/agents/<nome>.md`. Validado via smoke test (ver memória [[claude-code-agents-flat-only]]). A spec original (§3.4) precisa adaptar a expectativa "setor × papel × função" para uma convenção que vive **mentalmente + em CLAUDE.md**, não em pastas físicas.
- **Princípio operacional:** nome do agente carrega a função (ex: `briefing-writer`, `revisor-brand`); agrupamento por setor é apenas textual em CLAUDE.md. Sem subpastas, sem `sector:`/`role:` no frontmatter (YAGNI — ninguém consome esses campos nas 5 ondas).
- Os 6 agentes existentes **ficam onde estão** (`.claude/agents/<nome>.md`). Onda 2 e em diante criam agentes novos; Onda 3 renomeia `pesquisa-tendencias.md` → `pesquisador-mercado.md`; nenhum agente é movido pra subpasta.

**Spec de referência:** [docs/specs/2026-05-22-arquitetura-multi-setor-design.md §6.2](../specs/2026-05-22-arquitetura-multi-setor-design.md) — com adaptação ao loader real do Claude Code (ver bloco "Architecture" acima).

**Riscos & invariantes:**
- Skills atuais (`/novo-post`, `/lote-posts`, `/novo-estilo`, `/brand-discovery`) continuam funcionando sem alteração — nenhum arquivo `.md` de agente é tocado nesta onda.
- A divisão "setor × papel × função" da spec sobrevive como organização **conceitual** em CLAUDE.md, não como pasta física.

---

## File Structure

### Pastas criadas

| Diretório | Responsabilidade |
|---|---|
| `dados/` | Placeholder do Banco de Dados (Onda 3) — agora `.gitkeep` apenas |
| `campanhas/` | Placeholder de estado de campanhas L3 (Onda 5+) — `.gitkeep` apenas |
| `orquestracao/` | Placeholder de `rotas.yaml` (Onda 5) — `.gitkeep` apenas |
| `dados/politicas/` | Placeholder de políticas YAML (Onda 5) — `.gitkeep` apenas |

### Arquivos modificados

| Arquivo | Modificação |
|---|---|
| `CLAUDE.md` | Atualizar a seção "3. Agentes" para agrupar os 6 agentes existentes textualmente por setor/papel; adicionar nota sobre a convenção flat e por que escolhemos esse layout; mencionar as pastas-placeholder das camadas futuras |

### O que **não** acontece nesta onda

- Nenhum agente é movido, renomeado ou editado.
- Nenhuma skill é modificada.
- Nenhum agente novo é criado.

---

## Tasks

---

### Task 1: Criar pastas-placeholder das camadas futuras

**Files:**
- Create: `dados/.gitkeep`
- Create: `campanhas/.gitkeep`
- Create: `orquestracao/.gitkeep`
- Create: `dados/politicas/.gitkeep`

- [ ] **Step 1: Criar as 4 pastas com `.gitkeep`**

```bash
mkdir -p dados campanhas orquestracao dados/politicas
touch dados/.gitkeep campanhas/.gitkeep orquestracao/.gitkeep dados/politicas/.gitkeep
```

- [ ] **Step 2: Confirmar criação**

```bash
ls -la dados campanhas orquestracao dados/politicas
```

Esperado: cada pasta tem `.gitkeep`.

- [ ] **Step 3: Não commitar ainda** — commit unificado no final da onda.

---

### Task 2: Atualizar `CLAUDE.md` — seção "3. Agentes" para agrupamento textual

**Files:**
- Modify: `CLAUDE.md` (linhas ~56-66, seção "### 3. Agentes")

- [ ] **Step 1: Localizar o trecho atual a substituir**

Trecho atual em `CLAUDE.md` (não editar nada fora desse bloco):

```markdown
### 3. Agentes — especialistas por função (`.claude/agents/`)

Cada agente domina **uma função**, vale pra qualquer skill do sistema (não só criação de posts). Não conhece o fluxo nem outros agentes — recebe input num formato declarado, entrega output num formato declarado. Conhecimento específico de um fluxo vive nas skills e templates, não no agente.

**Agentes:**
- [`diretor-marca`](.claude/agents/diretor-marca.md) — estratégia e curadoria editorial.
- [`pesquisa-tendencias`](.claude/agents/pesquisa-tendencias.md) — pesquisa de conteúdo (scouting / deep).
- [`copywriter`](.claude/agents/copywriter.md) — copy persuasiva.
- [`designer`](.claude/agents/designer.md) — HTML+CSS visual.
- [`curador-export`](.claude/agents/curador-export.md) — validação técnica + export PNG.
- [`treinador`](.claude/agents/treinador.md) — decisões técnicas de treino.
```

- [ ] **Step 2: Substituir pelo novo conteúdo**

Usar a tool Edit para substituir o bloco acima por:

```markdown
### 3. Agentes — especialistas por função (`.claude/agents/`)

Cada agente domina **uma função** e organiza-se em **setor × papel** apenas textualmente — os arquivos físicos ficam todos achatados em `.claude/agents/<nome>.md` porque o loader do Claude Code só enxerga arquivos flat nessa pasta (subpastas são ignoradas). O agrupamento abaixo é a fonte de verdade humana da divisão setorial; o nome do agente carrega a função.

Agentes não conhecem o fluxo nem outros agentes — recebem input num formato declarado, entregam output num formato declarado. Conhecimento específico de um fluxo vive nas skills e templates, não no agente.

**Agentes atuais (6):**

- **Marketing / Pesquisa**
  - [`pesquisa-tendencias`](.claude/agents/pesquisa-tendencias.md) — pesquisa de conteúdo (será renomeado para `pesquisador-mercado` na Onda 3).
- **Marketing / Execução**
  - [`copywriter`](.claude/agents/copywriter.md) — copy persuasiva.
  - [`designer`](.claude/agents/designer.md) — HTML+CSS visual.
- **Marketing / Revisão**
  - [`curador-export`](.claude/agents/curador-export.md) — validação técnica + export PNG.
- **Produto / Consultoria / Execução**
  - [`treinador`](.claude/agents/treinador.md) — decisões técnicas de treino.
- **Transversais / Brand**
  - [`diretor-marca`](.claude/agents/diretor-marca.md) — estratégia e curadoria editorial (será quebrado em `briefing-writer`, `revisor-coerencia` e `revisor-brand` na Onda 2).

**Pastas-placeholder das camadas futuras** (na raiz do repo, fora de `.claude/agents/`):
- `dados/` — Banco de Dados (popula na Onda 3).
- `campanhas/` — estado vivo de campanhas multi-canal (popula na Onda 5+).
- `orquestracao/` — `rotas.yaml` declarativo de triggers (popula na Onda 5).
- `dados/politicas/` — políticas YAML declarativas (popula na Onda 5).

Veja [docs/specs/2026-05-22-arquitetura-multi-setor-design.md](docs/specs/2026-05-22-arquitetura-multi-setor-design.md) para o destino completo (3 setores produtivos + 3 transversais + orquestração).
```

- [ ] **Step 3: Verificar resultado da edição**

```bash
sed -n '/### 3. Agentes/,/^---$/p' CLAUDE.md
```

Esperado: vê os 6 agentes agrupados por setor textualmente, com links apontando para os arquivos flat existentes, e a nota sobre as pastas-placeholder.

- [ ] **Step 4: Confirmar que nenhuma outra seção de CLAUDE.md mudou**

```bash
git diff --stat CLAUDE.md
```

Esperado: 1 file changed; mudanças concentradas na seção "3. Agentes". Se o diff aparecer em "## O que é", "## Princípios", etc., abortar e reverter.

- [ ] **Step 5: Não commitar ainda.**

---

### Task 3: Smoke test funcional (regressão das skills atuais)

**Files:** (nenhum modificado)

**Por que:** confirmar que adicionar pastas auxiliares (`dados/`, etc.) e mudar CLAUDE.md não quebrou nada. Como nenhum agente foi tocado, espera-se que tudo continue funcionando — este step é uma rede de segurança.

- [ ] **Step 1: Invocar 2 agentes via Agent tool**

```
Agent(subagent_type="copywriter", prompt="Tarefa: responder SMOKE_OK_COPY.")
Agent(subagent_type="pesquisa-tendencias", prompt="Tarefa: responder SMOKE_OK_PESQUISA.")
```

Esperado: ambos encontrados (mesmo que devolvam `INPUT_INSUFICIENTE`, o que prova é que foram resolvidos).

- [ ] **Step 2: Rodar `/novo-post` em modo dry até o Passo 2a (sugestão de tema)**

(Opcional, alto valor.) Invocar a skill — `/novo-post carrossel` — chegar até o Passo 2a, confirmar que `pesquisa-tendencias` responde, e abortar. Se chegou ao Passo 2a sem erro de "agent not found", a onda passou.

- [ ] **Step 3: Caso algo falhe — reverter**

```bash
git checkout -- CLAUDE.md
rm -rf dados campanhas orquestracao dados/politicas
git status
```

Esperado: working tree limpo. Em seguida, investigar com o usuário.

---

### Task 4: Commit único da Onda 1

**Files:** (todos os listados)

- [ ] **Step 1: Conferir o `git status`**

```bash
git status
```

Esperado:
- 4 arquivos novos (`.gitkeep` em `dados/`, `campanhas/`, `orquestracao/`, `dados/politicas/`).
- 1 arquivo modificado (`CLAUDE.md`).

- [ ] **Step 2: Diff visual**

```bash
git diff --cached --stat
```

Esperado: 5 arquivos no conjunto.

- [ ] **Step 3: Stage e commit**

```bash
git add dados/ campanhas/ orquestracao/ dados/politicas/ CLAUDE.md
git commit -m "$(cat <<'EOF'
refactor(arquitetura): pastas-placeholder + CLAUDE.md com grouping textual (Onda 1)

Adapta a Onda 1 ao layout flat real do Claude Code (loader não enxerga
subdiretórios em .claude/agents/) — agentes ficam todos achatados;
agrupamento setor × papel × função vive em CLAUDE.md textualmente, não
em pastas físicas. Spec original (§3.4 do
docs/specs/2026-05-22-arquitetura-multi-setor-design.md) ajustado
mentalmente; planos das Ondas 2-5 reescritos em paralelo.

Mudanças:
- dados/, campanhas/, orquestracao/, dados/politicas/ criados como
  placeholders com .gitkeep — populam nas ondas 3 e 5.
- CLAUDE.md seção "3. Agentes" reagrupada: os 6 agentes existentes
  listados por setor/papel textualmente, com nota explicando a
  convenção flat e a divisão lógica.
- Nenhum agente foi movido, renomeado ou editado.

Próxima onda (Onda 2): quebrar diretor-marca em briefing-writer +
revisor-coerencia + revisor-brand + criar revisor-compliance.
EOF
)"
```

- [ ] **Step 4: Confirmar commit**

```bash
git log -1 --stat
```

Esperado: 1 commit recém-criado, com os 4 `.gitkeep` e a edição de `CLAUDE.md`.

---

## Critério de conclusão da Onda 1

- [ ] Pastas-placeholder `dados/`, `campanhas/`, `orquestracao/`, `dados/politicas/` existem (versionadas via `.gitkeep`).
- [ ] `CLAUDE.md` agrupa os 6 agentes existentes por setor/papel textualmente, com nota explicando a convenção flat.
- [ ] Skills `/novo-post`, `/lote-posts`, `/novo-estilo`, `/brand-discovery` continuam funcionando (verificado pelo menos para `/novo-post` no Passo 2a).
- [ ] Nenhum arquivo de agente em `.claude/agents/` foi tocado.
- [ ] Commit único, mensagem descritiva referenciando o ajuste de layout.
