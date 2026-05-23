# Onda 1 — Reorganização Estrutural — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mover os 6 agentes existentes para a nova convenção de pastas por setor/papel (`.claude/agents/{marketing,produto,engenharia,transversais}/...`), criar as pastas-placeholder das camadas futuras (`inteligencia/`, `campanhas/`, `orquestracao/`, `docs/politicas/`) e atualizar `CLAUDE.md` — **sem alterar uma linha do conteúdo de agente ou skill**.

**Architecture:** Onda puramente de refatoração estrutural. As skills `/novo-post`, `/lote-posts`, `/novo-estilo`, `/brand-discovery` resolvem agentes por `subagent_type` (nome no frontmatter), não por caminho — por isso o `git mv` é seguro. O único arquivo com path embutido é `CLAUDE.md`.

**Spec de referência:** [docs/specs/2026-05-22-arquitetura-multi-setor-design.md §6.2](../specs/2026-05-22-arquitetura-multi-setor-design.md)

**Riscos & invariantes:**
- Skills atuais devem continuar funcionando ao final da onda — smoke test obrigatório antes do commit.
- O subagent loader do Claude Code pode ou não suportar subdiretórios em `.claude/agents/`. Tarefa 0 valida isso antes de mover qualquer agente "de produção"; se falhar, o plano não avança.
- Nenhum agente é editado nesta onda — só movido. Edição vem na Onda 2.

---

## File Structure

### Diretórios criados

| Diretório | Responsabilidade |
|---|---|
| `.claude/agents/marketing/pesquisa/` | Casa do futuro `pesquisador-mercado` (hoje `pesquisa-tendencias.md` provisoriamente) |
| `.claude/agents/marketing/execucao/` | Casa de `copywriter.md` e `designer.md` |
| `.claude/agents/marketing/revisao/` | Casa de `curador-export.md` (revisão técnica do output Marketing) |
| `.claude/agents/marketing/estrategia/` | Vazia agora; popula na Onda 2 (`briefing-writer.md`) |
| `.claude/agents/produto/consultoria/execucao/` | Casa de `treinador.md` |
| `.claude/agents/produto/consultoria/{pesquisa,estrategia,revisao}/` | Vazias agora; podem ser populadas em ondas futuras |
| `.claude/agents/engenharia/{pesquisa,estrategia,execucao,revisao}/` | Vazias agora; populam na Onda 4 |
| `.claude/agents/transversais/brand/` | Casa de `diretor-marca.md` (provisório — quebrado na Onda 2) |
| `.claude/agents/transversais/inteligencia/` | Vazia agora; popula na Onda 3 |
| `.claude/agents/transversais/plataforma/` | Vazia agora; popula em ondas futuras |
| `inteligencia/` | Placeholder do Banco de Inteligência (Onda 3) |
| `campanhas/` | Placeholder de estado de campanhas L3 (Onda 5+) |
| `orquestracao/` | Placeholder de `rotas.yaml` (Onda 5) |
| `docs/politicas/` | Placeholder de políticas YAML (Onda 5) |

### Arquivos movidos (`git mv`, conteúdo intocado)

| Origem | Destino |
|---|---|
| `.claude/agents/copywriter.md` | `.claude/agents/marketing/execucao/copywriter.md` |
| `.claude/agents/designer.md` | `.claude/agents/marketing/execucao/designer.md` |
| `.claude/agents/curador-export.md` | `.claude/agents/marketing/revisao/curador-export.md` |
| `.claude/agents/pesquisa-tendencias.md` | `.claude/agents/marketing/pesquisa/pesquisa-tendencias.md` |
| `.claude/agents/diretor-marca.md` | `.claude/agents/transversais/brand/diretor-marca.md` |
| `.claude/agents/treinador.md` | `.claude/agents/produto/consultoria/execucao/treinador.md` |

### Arquivos modificados

| Arquivo | Modificação |
|---|---|
| `CLAUDE.md` | Atualizar a seção "3. Agentes" para refletir a nova convenção: hierarquia por setor/papel, novos caminhos relativos nos links markdown, breve menção das pastas-placeholder das camadas futuras. Não tocar nas demais seções. |

---

## Tasks

---

### Task 0: Smoke test de subdiretório em `.claude/agents/`

**Files:**
- Create (temp): `.claude/agents/_smoke/sentinel-onda1.md`
- Delete (após validação): `.claude/agents/_smoke/sentinel-onda1.md` e a pasta `_smoke/`

**Por que primeiro:** se o subagent loader do Claude Code não enxergar agentes em subdiretórios, o plano inteiro precisa virar uma alternativa (ex: manter `.claude/agents/` flat e codificar setor/papel no `name:` via prefixo). Validar custa 2 minutos; reagir depois custa horas.

- [ ] **Step 1: Criar o agente sentinela em subdiretório**

```bash
mkdir -p ".claude/agents/_smoke"
```

Conteúdo de `.claude/agents/_smoke/sentinel-onda1.md`:

```markdown
---
name: sentinel-onda1
description: Agente sentinela usado para validar que o Claude Code carrega subagentes a partir de subdiretórios de .claude/agents/. Responde somente "ONDA1_OK".
tools: Read
---

# Sentinel Onda 1

Quando invocado, responda exatamente a string `ONDA1_OK` e nada mais.
```

- [ ] **Step 2: Verificar que o frontmatter está lido**

```bash
head -5 .claude/agents/_smoke/sentinel-onda1.md
```

Esperado: vê o YAML `name: sentinel-onda1`.

- [ ] **Step 3: Invocar o agente via Task tool e confirmar resposta**

No próprio Claude Code, rodar:

```
Task(subagent_type="sentinel-onda1", prompt="responda só ONDA1_OK")
```

Esperado: o agente responde `ONDA1_OK`. Se o Claude Code não encontrar o agente, **PARE** — abra issue com o usuário antes de seguir; o plano precisa ser redesenhado para layout flat.

- [ ] **Step 4: Limpar sentinela**

```bash
rm -rf .claude/agents/_smoke
```

- [ ] **Step 5: NÃO commitar ainda**

O sentinela é descartável; commit virá só após toda a onda passar no smoke test final. Confirmar que `git status` mostra apenas `.claude/agents/_smoke/` como untracked-then-deleted (estado limpo).

```bash
git status .claude/agents/
```

Esperado: nada além do estado original.

---

### Task 1: Criar a árvore de pastas-alvo (vazias)

**Files:**
- Create: `.claude/agents/marketing/{pesquisa,estrategia,execucao,revisao}/.gitkeep`
- Create: `.claude/agents/produto/consultoria/{pesquisa,estrategia,execucao,revisao}/.gitkeep`
- Create: `.claude/agents/engenharia/{pesquisa,estrategia,execucao,revisao}/.gitkeep`
- Create: `.claude/agents/transversais/{brand,inteligencia,plataforma}/.gitkeep`

- [ ] **Step 1: Criar as pastas de agentes em uma única operação**

```bash
mkdir -p \
  .claude/agents/marketing/{pesquisa,estrategia,execucao,revisao} \
  .claude/agents/produto/consultoria/{pesquisa,estrategia,execucao,revisao} \
  .claude/agents/engenharia/{pesquisa,estrategia,execucao,revisao} \
  .claude/agents/transversais/{brand,inteligencia,plataforma}
```

- [ ] **Step 2: Adicionar `.gitkeep` em cada pasta-folha (para git versionar a estrutura vazia)**

```bash
find .claude/agents/marketing .claude/agents/produto .claude/agents/engenharia .claude/agents/transversais \
  -type d -empty -exec touch {}/.gitkeep \;
```

- [ ] **Step 3: Verificar a árvore criada**

```bash
find .claude/agents -type d | sort
```

Esperado: todas as pastas listadas no File Structure existem. Nenhum `.gitkeep` está em pasta que vai receber agente nesta onda (pastas com `.gitkeep` são as que continuam vazias).

- [ ] **Step 4: Não commitar ainda**

A árvore + agentes movidos vão num único commit no fim da onda.

---

### Task 2: Mover `copywriter` para `marketing/execucao/`

**Files:**
- Move: `.claude/agents/copywriter.md` → `.claude/agents/marketing/execucao/copywriter.md`

- [ ] **Step 1: Executar `git mv` (preserva histórico)**

```bash
git mv .claude/agents/copywriter.md .claude/agents/marketing/execucao/copywriter.md
```

- [ ] **Step 2: Verificar que o conteúdo é byte-idêntico ao original**

```bash
git diff --cached .claude/agents/marketing/execucao/copywriter.md
```

Esperado: a saída mostra renomeação ("rename from .claude/agents/copywriter.md / rename to .claude/agents/marketing/execucao/copywriter.md") **sem diffs de conteúdo**. Se aparecer qualquer linha começando em `+` ou `-` no corpo, abortar e investigar.

- [ ] **Step 3: Confirmar que o `name:` no frontmatter continua `copywriter`**

```bash
head -3 .claude/agents/marketing/execucao/copywriter.md
```

Esperado: vê `name: copywriter`. **Não editar** — a referência por nome nas skills continua válida.

- [ ] **Step 4: Não commitar ainda**

Commit unificado no final da onda.

---

### Task 3: Mover `designer` para `marketing/execucao/`

**Files:**
- Move: `.claude/agents/designer.md` → `.claude/agents/marketing/execucao/designer.md`

- [ ] **Step 1: Executar `git mv`**

```bash
git mv .claude/agents/designer.md .claude/agents/marketing/execucao/designer.md
```

- [ ] **Step 2: Verificar renomeação sem diff de conteúdo**

```bash
git diff --cached .claude/agents/marketing/execucao/designer.md
```

Esperado: apenas rename. Sem `+`/`-` de conteúdo.

- [ ] **Step 3: Confirmar `name:` intacto**

```bash
head -3 .claude/agents/marketing/execucao/designer.md
```

Esperado: `name: designer`.

- [ ] **Step 4: Não commitar ainda**

---

### Task 4: Mover `curador-export` para `marketing/revisao/`

**Files:**
- Move: `.claude/agents/curador-export.md` → `.claude/agents/marketing/revisao/curador-export.md`

- [ ] **Step 1: Executar `git mv`**

```bash
git mv .claude/agents/curador-export.md .claude/agents/marketing/revisao/curador-export.md
```

- [ ] **Step 2: Verificar renomeação sem diff de conteúdo**

```bash
git diff --cached .claude/agents/marketing/revisao/curador-export.md
```

Esperado: apenas rename.

- [ ] **Step 3: Confirmar `name:` intacto**

```bash
head -3 .claude/agents/marketing/revisao/curador-export.md
```

Esperado: `name: curador-export`.

- [ ] **Step 4: Não commitar ainda**

---

### Task 5: Mover `pesquisa-tendencias` para `marketing/pesquisa/` (rename do arquivo virá na Onda 3)

**Files:**
- Move: `.claude/agents/pesquisa-tendencias.md` → `.claude/agents/marketing/pesquisa/pesquisa-tendencias.md`

**Importante:** Onda 3 renomeia para `pesquisador-mercado.md`. Nesta onda, **só move** — o nome do arquivo e o `name:` no frontmatter continuam `pesquisa-tendencias`.

- [ ] **Step 1: Executar `git mv`**

```bash
git mv .claude/agents/pesquisa-tendencias.md .claude/agents/marketing/pesquisa/pesquisa-tendencias.md
```

- [ ] **Step 2: Verificar renomeação sem diff de conteúdo**

```bash
git diff --cached .claude/agents/marketing/pesquisa/pesquisa-tendencias.md
```

Esperado: apenas rename.

- [ ] **Step 3: Confirmar `name:` intacto**

```bash
head -3 .claude/agents/marketing/pesquisa/pesquisa-tendencias.md
```

Esperado: `name: pesquisa-tendencias` (sim, ainda esse nome — rename é Onda 3).

- [ ] **Step 4: Não commitar ainda**

---

### Task 6: Mover `diretor-marca` para `transversais/brand/` (provisório — quebrado na Onda 2)

**Files:**
- Move: `.claude/agents/diretor-marca.md` → `.claude/agents/transversais/brand/diretor-marca.md`

**Importante:** Onda 2 quebra este agente em 3 (`briefing-writer`, `revisor-coerencia`, `revisor-brand`). Nesta onda só muda de pasta.

- [ ] **Step 1: Executar `git mv`**

```bash
git mv .claude/agents/diretor-marca.md .claude/agents/transversais/brand/diretor-marca.md
```

- [ ] **Step 2: Verificar renomeação sem diff de conteúdo**

```bash
git diff --cached .claude/agents/transversais/brand/diretor-marca.md
```

Esperado: apenas rename.

- [ ] **Step 3: Confirmar `name:` intacto**

```bash
head -3 .claude/agents/transversais/brand/diretor-marca.md
```

Esperado: `name: diretor-marca`.

- [ ] **Step 4: Não commitar ainda**

---

### Task 7: Mover `treinador` para `produto/consultoria/execucao/`

**Files:**
- Move: `.claude/agents/treinador.md` → `.claude/agents/produto/consultoria/execucao/treinador.md`

- [ ] **Step 1: Executar `git mv`**

```bash
git mv .claude/agents/treinador.md .claude/agents/produto/consultoria/execucao/treinador.md
```

- [ ] **Step 2: Verificar renomeação sem diff de conteúdo**

```bash
git diff --cached .claude/agents/produto/consultoria/execucao/treinador.md
```

Esperado: apenas rename.

- [ ] **Step 3: Confirmar `name:` intacto**

```bash
head -3 .claude/agents/produto/consultoria/execucao/treinador.md
```

Esperado: `name: treinador`.

- [ ] **Step 4: Não commitar ainda**

---

### Task 8: Remover `.gitkeep` das pastas que agora têm agente

**Files:**
- Delete: `.gitkeep` de `marketing/execucao/`, `marketing/revisao/`, `marketing/pesquisa/`, `transversais/brand/`, `produto/consultoria/execucao/`

- [ ] **Step 1: Remover os `.gitkeep` redundantes**

```bash
rm -f \
  .claude/agents/marketing/execucao/.gitkeep \
  .claude/agents/marketing/revisao/.gitkeep \
  .claude/agents/marketing/pesquisa/.gitkeep \
  .claude/agents/transversais/brand/.gitkeep \
  .claude/agents/produto/consultoria/execucao/.gitkeep
```

- [ ] **Step 2: Verificar que `.gitkeep` continua apenas nas pastas que precisam (vazias)**

```bash
find .claude/agents -name .gitkeep
```

Esperado: lista apenas:
```
.claude/agents/marketing/estrategia/.gitkeep
.claude/agents/produto/consultoria/pesquisa/.gitkeep
.claude/agents/produto/consultoria/estrategia/.gitkeep
.claude/agents/produto/consultoria/revisao/.gitkeep
.claude/agents/engenharia/pesquisa/.gitkeep
.claude/agents/engenharia/estrategia/.gitkeep
.claude/agents/engenharia/execucao/.gitkeep
.claude/agents/engenharia/revisao/.gitkeep
.claude/agents/transversais/inteligencia/.gitkeep
.claude/agents/transversais/plataforma/.gitkeep
```

(Ordem pode variar; o que importa é o conjunto.)

- [ ] **Step 3: Não commitar ainda**

---

### Task 9: Criar pastas-placeholder das camadas futuras

**Files:**
- Create: `inteligencia/.gitkeep`
- Create: `campanhas/.gitkeep`
- Create: `orquestracao/.gitkeep`
- Create: `docs/politicas/.gitkeep`

- [ ] **Step 1: Criar as pastas vazias com `.gitkeep`**

```bash
mkdir -p inteligencia campanhas orquestracao docs/politicas
touch inteligencia/.gitkeep campanhas/.gitkeep orquestracao/.gitkeep docs/politicas/.gitkeep
```

- [ ] **Step 2: Confirmar criação**

```bash
ls -la inteligencia campanhas orquestracao docs/politicas
```

Esperado: cada pasta tem `.gitkeep`.

- [ ] **Step 3: Não commitar ainda**

---

### Task 10: Atualizar `CLAUDE.md` — seção "3. Agentes"

**Files:**
- Modify: `CLAUDE.md` (linhas 56-66 aproximadamente — a seção "### 3. Agentes")

- [ ] **Step 1: Localizar o trecho exato a substituir**

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

Cada agente domina **uma função** e está organizado por **setor × papel** (`.claude/agents/{setor}/{papel}/`). Vale pra qualquer skill do sistema — não só criação de posts. Não conhece o fluxo nem outros agentes — recebe input num formato declarado, entrega output num formato declarado. Conhecimento específico de um fluxo vive nas skills e templates, não no agente.

Agentes são resolvidos por **nome** (frontmatter `name:`), não por caminho — as skills continuam funcionando independente da pasta onde o arquivo mora.

**Agentes atuais:**

- **Marketing**
  - [`copywriter`](.claude/agents/marketing/execucao/copywriter.md) — copy persuasiva (execução).
  - [`designer`](.claude/agents/marketing/execucao/designer.md) — HTML+CSS visual (execução).
  - [`curador-export`](.claude/agents/marketing/revisao/curador-export.md) — validação técnica + export PNG (revisão).
  - [`pesquisa-tendencias`](.claude/agents/marketing/pesquisa/pesquisa-tendencias.md) — pesquisa de conteúdo (será renomeado para `pesquisador-mercado` na Onda 3).
- **Produto / Consultoria**
  - [`treinador`](.claude/agents/produto/consultoria/execucao/treinador.md) — decisões técnicas de treino (execução).
- **Transversais / Brand**
  - [`diretor-marca`](.claude/agents/transversais/brand/diretor-marca.md) — estratégia e curadoria editorial (será quebrado em `briefing-writer`, `revisor-coerencia` e `revisor-brand` na Onda 2).

**Pastas-placeholder** (vazias até as ondas correspondentes): `marketing/estrategia/`, `produto/consultoria/{pesquisa,estrategia,revisao}/`, `engenharia/{pesquisa,estrategia,execucao,revisao}/`, `transversais/{inteligencia,plataforma}/`. Veja [docs/specs/2026-05-22-arquitetura-multi-setor-design.md](docs/specs/2026-05-22-arquitetura-multi-setor-design.md) para o destino completo.
```

- [ ] **Step 3: Verificar resultado da edição**

```bash
sed -n '/### 3. Agentes/,/^---$/p' CLAUDE.md | head -40
```

Esperado: vê o novo bloco com os agentes agrupados por setor e os links apontando para os novos caminhos.

- [ ] **Step 4: Confirmar que nenhuma outra seção de CLAUDE.md mudou**

```bash
git diff --stat CLAUDE.md
```

Esperado: 1 file changed, ~X insertions, ~Y deletions — todas na faixa da seção "3. Agentes".

```bash
git diff CLAUDE.md | head -80
```

Esperado: visualmente, todo o diff fica dentro da seção "### 3. Agentes". Se vir mudança em "## O que é", "## Princípios", etc. — abortar e reverter.

- [ ] **Step 5: Não commitar ainda**

---

### Task 11: Smoke test funcional — invocar pelo menos 2 agentes em locais novos

**Files:** (nenhum modificado)

**Por que:** confirmar empiricamente que o subagent loader resolve agentes em subdiretórios pelo `name:`. Se isso falhar, **revertemos toda a onda** com `git checkout .` antes de commitar.

- [ ] **Step 1: Invocar `pesquisa-tendencias` em uma tarefa trivial**

No próprio Claude Code, rodar:

```
Task(subagent_type="pesquisa-tendencias", prompt="Tarefa: responder com a string SMOKE_OK_PESQUISA. Profundidade: rápida. Sem brand book necessário — é teste de roteamento.")
```

Esperado: o agente é encontrado e responde (mesmo que ele recuse a tarefa por falta de input, o que prova é que ele foi carregado).

Se a resposta for `Agent type 'pesquisa-tendencias' not found` ou equivalente, abortar e seguir o Step 4 de reversão.

- [ ] **Step 2: Invocar `copywriter` em uma tarefa trivial**

```
Task(subagent_type="copywriter", prompt="Tarefa: responder com a string SMOKE_OK_COPY. Sem inputs reais — é teste de roteamento.")
```

Esperado: o agente é encontrado (mesmo que devolva `INPUT_INSUFICIENTE`, o que prova é que foi resolvido).

- [ ] **Step 3: Invocar `diretor-marca`** (no novo local em `transversais/brand/`)

```
Task(subagent_type="diretor-marca", prompt="Tarefa: responder com a string SMOKE_OK_DIRETOR. Sem inputs — teste de roteamento.")
```

Esperado: idem.

- [ ] **Step 4: Caso QUALQUER um dos 3 falhe — reverter a onda inteira**

```bash
git checkout -- .claude/agents/ CLAUDE.md
rm -rf inteligencia campanhas orquestracao docs/politicas
git status
```

Esperado: working tree limpo. Em seguida, registrar com o usuário que o layout flat precisa ser mantido (replanejar antes de re-tentar).

- [ ] **Step 5: Se todos passaram — seguir para o commit final**

Anote no chat com o usuário: "Onda 1 smoke test ok — 6 agentes resolvidos em subpastas. Vou commitar."

---

### Task 12: Commit único da Onda 1

**Files:** (todos os listados acima)

- [ ] **Step 1: Conferir o `git status`**

```bash
git status
```

Esperado:
- 6 arquivos renomeados (`renamed: .claude/agents/<antigo> -> .claude/agents/<novo>`)
- ~10 arquivos novos (`.gitkeep` nas pastas vazias + `inteligencia/.gitkeep`, `campanhas/.gitkeep`, `orquestracao/.gitkeep`, `docs/politicas/.gitkeep`)
- 1 arquivo modificado (`CLAUDE.md`)

- [ ] **Step 2: Conferir o diff agregado**

```bash
git diff --cached --stat
```

Esperado: nenhum dos 6 agentes mostra mudança de linha (`0 insertions, 0 deletions` ou ausente do diff, só rename). `CLAUDE.md` mostra mudanças concentradas na seção "3. Agentes".

- [ ] **Step 3: Stage e commit**

```bash
git add .claude/agents/ inteligencia/ campanhas/ orquestracao/ docs/politicas/ CLAUDE.md
git commit -m "$(cat <<'EOF'
refactor(arquitetura): reorganiza agentes por setor/papel (Onda 1)

Move os 6 agentes existentes para a convenção .claude/agents/{setor}/{papel}/
conforme spec docs/specs/2026-05-22-arquitetura-multi-setor-design.md §6.2.
Conteúdo dos agentes não foi tocado — só a localização.

Cria pastas-placeholder com .gitkeep para as camadas futuras:
inteligencia/, campanhas/, orquestracao/, docs/politicas/ e os papéis
vazios em .claude/agents/.

CLAUDE.md atualizado refletindo a nova organização. Skills atuais
(/novo-post, /lote-posts, /novo-estilo, /brand-discovery) continuam
funcionando — resolução de agente é por nome, não por caminho.

Próxima onda (Onda 2): quebrar diretor-marca em briefing-writer +
revisor-coerencia + revisor-brand.
EOF
)"
```

- [ ] **Step 4: Confirmar commit**

```bash
git log -1 --stat | head -30
```

Esperado: 1 commit recém-criado, com os 6 renames, os `.gitkeep` novos e a edição de `CLAUDE.md`.

- [ ] **Step 5: Smoke test pós-commit — rodar `/novo-post` em modo curto**

(Opcional, alto valor.) Invocar a skill em modo dry — `/novo-post carrossel` — chegar até o Passo 2a (sugestão de tema), confirmar que `pesquisa-tendencias` responde do novo path, e abortar. Se chegou no Passo 2a sem erro de "agent not found", a onda passou.

---

## Critério de conclusão da Onda 1

- [ ] Os 6 agentes vivem em `.claude/agents/{setor}/{papel}/` conforme o mapa.
- [ ] Conteúdo de nenhum agente foi alterado (verificado com `git log -p` no commit final).
- [ ] Pastas-placeholder `inteligencia/`, `campanhas/`, `orquestracao/`, `docs/politicas/` existem (versionadas via `.gitkeep`).
- [ ] `CLAUDE.md` reflete a nova organização sem mudanças em outras seções.
- [ ] Smoke test passou: 3 agentes resolvíveis por `subagent_type` a partir de subdiretórios.
- [ ] Commit único, mensagem descritiva.
- [ ] Skills `/novo-post`, `/lote-posts`, `/novo-estilo`, `/brand-discovery` continuam funcionando (verificado pelo menos para `/novo-post` no Passo 2a).
