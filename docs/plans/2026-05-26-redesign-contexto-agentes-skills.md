# Redesign de Contexto Cirúrgico — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar 8 princípios de contexto cirúrgico a 15 contratos de agente + 7 skills + CLAUDE.md, eliminando redundância de contexto, formalizando schemas de saída e padronizando retry.

**Architecture:** Refatoração de markdown (contratos + skills), não código. Pattern + Deltas: os templates e schemas vivem na spec; cada arquivo recebe o delta específico. Verificação é **grep-based** (não há teste unitário para markdown) via `scripts/check-redesign.sh`. Ordem: script → contratos de agente → skills → CLAUDE.md → varredura final.

**Tech Stack:** Markdown, frontmatter YAML, bash/grep para verificação. Sem build.

**Spec:** `docs/specs/2026-05-26-redesign-contexto-agentes-skills-design.md`

---

## Convenções de referência (fonte única — tasks apontam pra cá)

### Ordem de seções do contrato de agente

```
# <Papel>  (intro: especialidade + fronteira)
## Contexto que carrego          ← AUTO-LOAD (estático)
## Recebo                         ← ENVELOPE (o que a skill passa + de qual passo)
## Entrego                        ← SCHEMA RÍGIDO (ver 3 tipos)
## Orçamento de output            ← alvo de concisão + anti-padding
## Input incompleto               ← erros early-exit (consolida "Quando devolver erro")
## Princípios da especialidade    ← preservar conteúdo existente
## Anti-padrões                   ← preservar conteúdo existente
```

Seções específicas do domínio (ex: "Tipos de tarefa", "Seções avaliadas", "Princípios técnicos/comunicação" do treinador) são **preservadas** entre Princípios e Anti-padrões.

### Os 3 schemas de Entrego

```
# TIPO 1 — Inline rígido (tags OU campos markdown fixos; consumido por agente/skill)
<candidatos>
<c rank=1 angulo="..." pilar="..." sustentacao="..." potencial="alto|medio|baixo">...</c>
... máx N ...
</candidatos>
# Pareceres usam campos markdown fixos (já rígidos) — ver tasks dos revisores.

# TIPO 2 — Markdown estruturado (mostrado ao usuário E consumido; só briefing-writer)
## <Título>
**Campo:** valor
... conjunto fechado de campos, sem preâmbulo ...

# TIPO 3 — Manifesto (agente grava arquivo[s]; retorna só isto)
<manifesto>
arquivos: <lista|contagem> | pasta: <destino>
status: ok | <ERRO_X>
obs: <1 linha ou vazio>
</manifesto>
```

### Orçamento por tipo

| Output | Alvo |
|---|---|
| Inline rígido (candidatos, parecer, validação) | ~150–300 palavras |
| Briefing (markdown estruturado) | ~250 palavras |
| Manifesto | ~50 palavras |
| Artefato em arquivo (copy, HTML, deep research) | sem teto global — limites por bloco do `estilo.md`/template |

Anti-padding universal (em toda seção Orçamento): "Sem preâmbulo, sem eco do input, sem fecho, nada fora do schema."

### Recipe de transformação de contrato (aplicável a todo agente)

1. Renomear `## Contrato de entrada` → `## Recebo`. Manter os campos; remover qualquer linha que repita o que está em "Contexto que carrego".
2. Renomear `## Contrato de saída` → `## Entrego`. Substituir o corpo pelo schema do tipo correto (abaixo, por agente).
3. Inserir `## Orçamento de output` logo após `## Entrego`, com o alvo da tabela + frase anti-padding.
4. Renomear `## Quando devolver erro` → `## Input incompleto` (mover para logo após Orçamento). Manter os códigos de erro.
5. Preservar `## Princípios da especialidade`, `## Anti-padrões` e seções de domínio.

### Skill template

Toda skill ganha, logo após a intro, uma `## Fluxo` (tabela). Ações de orquestrador marcadas `⚙`; pausas humanas `⏸`. Passos detalhados existentes: remover injeção de contexto auto-carregado e instrução de comportamento interno do agente.

---

## Task 1: Script de verificação estrutural

**Files:**
- Create: `scripts/check-redesign.sh`

- [ ] **Step 1: Escrever o script**

```bash
#!/usr/bin/env bash
# Verifica invariantes do redesign de contexto cirúrgico.
# Uso: scripts/check-redesign.sh [agents|skills|readme|all]
set -uo pipefail
cd "$(dirname "$0")/.." || exit 2
fail=0

check_agents() {
  for f in .claude/agents/*.md; do
    for sec in "## Recebo" "## Entrego" "## Orçamento de output" "## Input incompleto"; do
      grep -qF "$sec" "$f" || { echo "FALTA [$sec] em $f"; fail=1; }
    done
    for old in "## Contrato de entrada" "## Contrato de saída" "## Quando devolver erro"; do
      grep -qF "$old" "$f" && { echo "AINDA TEM [$old] em $f"; fail=1; }
    done
  done
}

check_skills() {
  for f in .claude/skills/*/SKILL.md; do
    case "$f" in */brainstorming/*|*/writing-plans/*|*/grill-me/*|*/find-skills/*|*/skill-creator/*|*/agent-browser/*|*/ui-ux-pro-max/*|*/remotion-best-practices/*) continue;; esac
    grep -qF "## Fluxo" "$f" || { echo "FALTA [## Fluxo] em $f"; fail=1; }
  done
}

check_readme() {
  [ -e templates/formatos/README.md ] && { echo "README ainda existe"; fail=1; }
  hits=$(grep -rl "formatos/README.md" .claude templates 2>/dev/null)
  [ -n "$hits" ] && { echo "Referências ao README:"; echo "$hits"; fail=1; }
  return 0
}

case "${1:-all}" in
  agents) check_agents;;
  skills) check_skills;;
  readme) check_readme;;
  all) check_agents; check_skills; check_readme;;
esac
[ "$fail" = 0 ] && echo "OK: todas as checagens passaram" || echo "FALHOU"
exit $fail
```

- [ ] **Step 2: Tornar executável e rodar (deve falhar — nada migrado ainda)**

Run: `chmod +x scripts/check-redesign.sh && scripts/check-redesign.sh agents`
Expected: lista de `FALTA [## Recebo] ...` para vários agentes + `FALHOU`. (Confirma que o script detecta o estado pré-migração.)

- [ ] **Step 3: Commit**

```bash
git add scripts/check-redesign.sh
git commit -m "chore: script de verificação do redesign de contexto"
```

---

## Task 2: Contrato — designer (drop zones + remove README)

**Files:**
- Modify: `.claude/agents/designer.md`

- [ ] **Step 1: Absorver drop zones e remover README de "sob demanda"**

Na seção "Contexto que carrego", **remover** a linha `Regras inegociáveis (templates/formatos/README.md) — quando a skill apontar: ...`.

Em "Princípios da especialidade", **remover** a sub-cláusula que cita `templates/formatos/README.md` na "Hierarquia de regras" e reescrever para:
`- **Hierarquia de regras.** Tokens de brand/referencias-visuais.md > estilo.md do estilo (quando houver) > interpretação visual.`

Adicionar em "Princípios da especialidade" o resíduo técnico do README (drop zones):

```markdown
- **Drop zones de foto.** Fotos de fundo são sempre inseridas pelo usuário via Claude Design — nunca hardcode imagem no template. `data-bg-drop="<nome>"` vai no `<section data-slide>`; o wrapper injeta `background-image` inline nesse elemento. Filhos opacos cobrindo o mesmo espaço ocultam a foto: qualquer div host de overlay usa `background: transparent`, e o `.slide` base recebe `background-size: cover; background-position: center; background-repeat: no-repeat;`. Exceção: fundo de cor sólida/gradiente declarado no estilo.md não cria drop zone.
```

- [ ] **Step 2: Aplicar recipe (Recebo/Entrego/Orçamento/Input incompleto)**

Renomear `## Contrato de entrada` → `## Recebo` (remover a linha que aponta o README como input).
Renomear `## Contrato de saída` → `## Entrego` e usar manifesto:

```markdown
## Entrego

Gravo cada asset no caminho indicado e retorno só o manifesto:

<manifesto>
estilo: <slug> | conceito: <1 linha>
arquivos: <N assets> | pasta: <destino>
status: ok | <ERRO>
obs: <observação técnica relevante ou vazio>
</manifesto>

Cada asset é standalone (HTML+CSS inline, sem deps externas além das fontes do brand) e leva no topo do `<style>`: `/* ESTILO: <slug> | CONCEITO: <1 linha> */`. Sem preâmbulo fora do manifesto.
```

Inserir Orçamento (manifesto ~50 palavras; assets governados por dimensões do template + limites do estilo). Renomear `## Quando devolver erro` → `## Input incompleto` (manter os códigos).

- [ ] **Step 3: Verificar**

Run: `scripts/check-redesign.sh agents 2>&1 | grep designer || echo "designer OK"`
Expected: `designer OK` (sem FALTA/AINDA TEM para designer).
Run: `grep -c "formatos/README.md" .claude/agents/designer.md`
Expected: `0`

- [ ] **Step 4: Commit**

```bash
git add .claude/agents/designer.md
git commit -m "refactor(designer): absorve drop zones, remove README, schema manifesto"
```

---

## Task 3: Contrato — copywriter

**Files:**
- Modify: `.claude/agents/copywriter.md`

- [ ] **Step 1: Aplicar recipe**

Renomear `## Contrato de entrada` → `## Recebo`. Renomear `## Contrato de saída` → `## Entrego` com manifesto:

```markdown
## Entrego

Gravo o copy no caminho indicado seguindo a `## Estrutura` do `estilo.md`, e retorno só o manifesto:

<manifesto>
arquivo: <caminho>
blocos: <N> | variações A/B: <M>
status: ok | <ERRO>
obs: <notas por bloco pro designer, ou vazio>
</manifesto>

Quando a `## Estrutura` declara variações A/B num bloco, gravo todas no arquivo. Sem preâmbulo fora do manifesto.
```

Inserir Orçamento (manifesto ~50 palavras; o copy segue os limites por bloco do `estilo.md`). Renomear `## Quando devolver erro` → `## Input incompleto`.

- [ ] **Step 2: Verificar**

Run: `scripts/check-redesign.sh agents 2>&1 | grep copywriter || echo "copywriter OK"`
Expected: `copywriter OK`

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/copywriter.md
git commit -m "refactor(copywriter): schema manifesto + orçamento"
```

---

## Task 4: Contrato — briefing-writer (markdown estruturado)

**Files:**
- Modify: `.claude/agents/briefing-writer.md`

- [ ] **Step 1: Aplicar recipe (Entrego = markdown estruturado, já existente)**

Renomear `## Contrato de entrada` → `## Recebo`. Renomear `## Contrato de saída` → `## Entrego`: **manter** os dois schemas existentes (recomendar estilo + briefing canônico), apenas adicionar no topo da seção a frase: `Respondo só com o schema abaixo, sem preâmbulo. Texto fora do schema é ignorado.`

Inserir Orçamento (briefing ~250 palavras; anti-padding). Renomear `## Quando devolver erro` → `## Input incompleto`.

- [ ] **Step 2: Verificar**

Run: `scripts/check-redesign.sh agents 2>&1 | grep briefing-writer || echo "briefing-writer OK"`
Expected: `briefing-writer OK`

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/briefing-writer.md
git commit -m "refactor(briefing-writer): formaliza schema + orçamento"
```

---

## Task 5: Contrato — pesquisador-mercado (2 modos)

**Files:**
- Modify: `.claude/agents/pesquisador-mercado.md`

- [ ] **Step 1: Aplicar recipe com schema por modo**

Renomear `## Contrato de entrada` → `## Recebo`. Renomear `## Contrato de saída` → `## Entrego` (criar se não houver seção dedicada) com dois modos:

```markdown
## Entrego

### Modo Fase B (seleção de candidatos) — inline rígido
<candidatos>
<c rank=1 angulo="..." pilar="..." sustentacao="<fonte/sinal>" potencial="alto|medio|baixo">...</c>
... máx 5, do maior pro menor potencial ...
</candidatos>

### Modo scouting (Fase A) + pesquisa profunda (P7) — manifesto
<manifesto>
arquivos: <lista dos arquivos gravados no slice / pesquisas-brutas>
status: ok | <ERRO>
obs: <achado-chave em 1 linha ou vazio>
</manifesto>

Sem preâmbulo fora do schema.
```

Inserir Orçamento (candidatos ~200 palavras; manifesto ~50; deep research sem teto). Renomear `## Quando devolver erro` → `## Input incompleto`.

- [ ] **Step 2: Verificar**

Run: `scripts/check-redesign.sh agents 2>&1 | grep pesquisador || echo "pesquisador OK"`
Expected: `pesquisador OK`

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/pesquisador-mercado.md
git commit -m "refactor(pesquisador): schema por modo + orçamento"
```

---

## Task 6: Contrato — revisor-conteudo (parecer)

**Files:**
- Modify: `.claude/agents/revisor-conteudo.md`

- [ ] **Step 1: Aplicar recipe (Entrego = parecer em campos markdown fixos)**

Renomear `## Contrato de entrada` → `## Recebo`. Renomear `## Contrato de saída` → `## Entrego`: **manter** o schema de parecer existente (duas seções + status final + Ação) — ele já é inline rígido. Adicionar no topo da seção: `Respondo só com este parecer, sem preâmbulo.`

Inserir Orçamento (parecer ~250 palavras; anti-padding). Renomear `## Quando devolver erro` → `## Input incompleto`.

- [ ] **Step 2: Verificar**

Run: `scripts/check-redesign.sh agents 2>&1 | grep revisor-conteudo || echo "revisor-conteudo OK"`
Expected: `revisor-conteudo OK`

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/revisor-conteudo.md
git commit -m "refactor(revisor-conteudo): formaliza parecer + orçamento"
```

---

## Task 7: Contrato — revisor-brand (parecer binário + limpar refs obsoletas)

**Files:**
- Modify: `.claude/agents/revisor-brand.md`

- [ ] **Step 1: Limpar referências obsoletas**

O agente cita `revisor-coerencia` e `revisor-compliance` (fundidos em `revisor-conteudo` no commit 0693308). Substituir todas as ocorrências por `revisor-conteudo`:
- Na `description` do frontmatter.
- Na intro ("Quem aprova com ajustes é o revisor-coerencia").
- Em Anti-padrões ("escopo do revisor-coerencia ou compliance" → "escopo do revisor-conteudo").

- [ ] **Step 2: Aplicar recipe (Entrego = parecer binário existente)**

Renomear `## Contrato de entrada` → `## Recebo`. Renomear `## Contrato de saída` → `## Entrego`: manter o parecer binário existente (Status APROVADO|REPROVADO + eixos + Ação). Adicionar no topo: `Respondo só com este parecer, sem preâmbulo.`

Inserir Orçamento (parecer ~200 palavras). Renomear `## Quando devolver erro` → `## Input incompleto`.

- [ ] **Step 3: Verificar**

Run: `scripts/check-redesign.sh agents 2>&1 | grep revisor-brand || echo "revisor-brand OK"`
Expected: `revisor-brand OK`
Run: `grep -cE "revisor-(coerencia|compliance)" .claude/agents/revisor-brand.md`
Expected: `0`

- [ ] **Step 4: Commit**

```bash
git add .claude/agents/revisor-brand.md
git commit -m "refactor(revisor-brand): parecer + orçamento, limpa refs obsoletas"
```

---

## Task 8: Contratos — curador-export e curador-web (status)

**Files:**
- Modify: `.claude/agents/curador-export.md`
- Modify: `.claude/agents/curador-web.md`

- [ ] **Step 1: curador-export — recipe com Entrego = validação**

Renomear `## Contrato de entrada` → `## Recebo`. Renomear `## Contrato de saída` → `## Entrego`:

```markdown
## Entrego

<validacao>
status: APROVADO | VALIDACAO_TECNICA_FALHOU | EXPORT_FALHOU
checks: dimensões <ok|falha> | tokens brand <ok|falha> | sem-JS <ok|falha> | preview section[data-slide] <ok|falha>
pngs: <N gerados / esperados> ou n/a
falhas: <arquivo:ponto, ou vazio>
</validacao>

Sem preâmbulo fora do schema.
```

Inserir Orçamento (~150 palavras). Renomear `## Quando devolver erro` → `## Input incompleto` (criar a partir de erros existentes se necessário: BRAND_BOOK_INCOMPLETO etc.).

- [ ] **Step 2: curador-web — mesmo recipe, Entrego = validação web**

```markdown
## Entrego

<validacao>
status: APROVADO | VALIDACAO_FALHOU
checks: tsc <ok|N erros> | eslint <ok|N erros> | build <ok|falha> | lighthouse perf/a11y/bp/seo <valores>
preview_url: <url do vercel ou n/a>
falhas: <arquivo:linha → problema, ou vazio>
</validacao>

Sem preâmbulo fora do schema.
```

Inserir Orçamento (~150 palavras). Renomear `## Quando devolver erro` → `## Input incompleto` (criar se ausente, com ao menos `INPUT_INSUFICIENTE`).

- [ ] **Step 3: Verificar**

Run: `scripts/check-redesign.sh agents 2>&1 | grep -E "curador-(export|web)" || echo "curadores OK"`
Expected: `curadores OK`

- [ ] **Step 4: Commit**

```bash
git add .claude/agents/curador-export.md .claude/agents/curador-web.md
git commit -m "refactor(curadores): schema validação + orçamento"
```

---

## Task 9: Contrato — treinador (inline canônico)

**Files:**
- Modify: `.claude/agents/treinador.md`

- [ ] **Step 1: Aplicar recipe (Entrego = formato canônico existente)**

Renomear `## Contrato de entrada` → `## Recebo`. Renomear `## Contrato de saída` → `## Entrego`: manter os formatos canônicos existentes (séries×reps, divisão, dúvida). Adicionar no topo da seção: `Respondo só no formato pedido, sem preâmbulo.`

Inserir Orçamento (resposta técnica ~250 palavras; prescrição governada pela tarefa). Renomear `## Quando devolver erro` → `## Input incompleto`. Preservar "Princípios técnicos", "Princípios de comunicação", "Tipos de tarefa", "Princípio raiz".

- [ ] **Step 2: Verificar**

Run: `scripts/check-redesign.sh agents 2>&1 | grep treinador || echo "treinador OK"`
Expected: `treinador OK`

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/treinador.md
git commit -m "refactor(treinador): formaliza Entrego + orçamento"
```

---

## Task 10: Contratos — archivist-ramon e analista-performance (manifesto)

**Files:**
- Modify: `.claude/agents/archivist-ramon.md`
- Modify: `.claude/agents/analista-performance.md`

- [ ] **Step 1: archivist-ramon — recipe com manifesto**

Renomear entrada/saída → `## Recebo`/`## Entrego`. Entrego = manifesto:

```markdown
## Entrego

<manifesto>
arquivo: dados/ramon/contexto.md
seções alteradas: <lista> | fontes citadas: <N>
status: ok | mudança-de-fase-pendente-de-confirmação | <ERRO>
obs: <1 linha ou vazio>
</manifesto>

Sem preâmbulo fora do manifesto.
```

Inserir Orçamento (~50 palavras). Criar/renomear `## Input incompleto` com erros existentes (mudança de fase exige confirmação; fato sem fonte recusado).

- [ ] **Step 2: analista-performance — recipe com manifesto**

Renomear entrada/saída → `## Recebo`/`## Entrego`. Entrego = manifesto:

```markdown
## Entrego

<manifesto>
arquivos: <ex: dados/performance/angulos-queimados.md>
ângulos registrados: <N> | janela de descanso: <datas>
status: ok | <ERRO>
obs: <1 linha ou vazio>
</manifesto>

Sem preâmbulo fora do manifesto.
```

Inserir Orçamento (~50 palavras). Criar/renomear `## Input incompleto`.

- [ ] **Step 3: Verificar**

Run: `scripts/check-redesign.sh agents 2>&1 | grep -E "archivist-ramon|analista-performance" || echo "data agents OK"`
Expected: `data agents OK`

- [ ] **Step 4: Commit**

```bash
git add .claude/agents/archivist-ramon.md .claude/agents/analista-performance.md
git commit -m "refactor(data agents): schema manifesto + orçamento"
```

---

## Task 11: Contratos — agentes web (arquiteto-web, designer-web, dev-frontend, integrador-apis)

**Files:**
- Modify: `.claude/agents/arquiteto-web.md`
- Modify: `.claude/agents/designer-web.md`
- Modify: `.claude/agents/dev-frontend.md`
- Modify: `.claude/agents/integrador-apis.md`

- [ ] **Step 1: Aplicar recipe em cada um (todos manifesto)**

Para os 4: renomear entrada/saída → `## Recebo`/`## Entrego`; criar `## Entrego` se ausente; inserir Orçamento (~50 palavras manifesto); criar/renomear `## Input incompleto` a partir dos erros existentes. Schema por agente:

```markdown
# arquiteto-web
<manifesto>
arquivos: <config/scaffold criados ou alterados>
stack: <confirmação da stack da spec>
status: ok | SPEC_AUSENTE | <ERRO>
obs: <1 linha ou vazio>
</manifesto>

# designer-web
<manifesto>
componentes: <lista de seções/componentes gravados>
pasta: site/components/... 
status: ok | BRAND_BOOK_INCOMPLETO | <ERRO>
obs: <1 linha ou vazio>
</manifesto>

# dev-frontend
<manifesto>
arquivos: <páginas/componentes integrados>
status: ok | <ERRO>
obs: <TODOs declarados ou vazio>
</manifesto>

# integrador-apis
<manifesto>
script: scripts/integrations/<arquivo>
api: <alvo + versão> | log: <caminho do .logs/ ou n/a>
status: ok | SEM_CREDENCIAIS | <ERRO>
obs: <1 linha ou vazio>
</manifesto>
```

Cada um adiciona "Sem preâmbulo fora do manifesto."

- [ ] **Step 2: Verificar**

Run: `scripts/check-redesign.sh agents 2>&1 | grep -E "arquiteto-web|designer-web|dev-frontend|integrador-apis" || echo "web agents OK"`
Expected: `web agents OK`

- [ ] **Step 3: Rodar a checagem completa de agentes (todos os 15 migrados)**

Run: `scripts/check-redesign.sh agents`
Expected: `OK: todas as checagens passaram`

- [ ] **Step 4: Commit**

```bash
git add .claude/agents/arquiteto-web.md .claude/agents/designer-web.md .claude/agents/dev-frontend.md .claude/agents/integrador-apis.md
git commit -m "refactor(web agents): schema manifesto + orçamento"
```

---

## Task 12: Skill — novo-post (fluxo + remove injeções + retry 1)

**Files:**
- Modify: `.claude/skills/novo-post/SKILL.md`

- [ ] **Step 1: Adicionar tabela `## Fluxo` após a intro**

```markdown
## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ parse input | input bruto | — | formato/estilo/tema |
| 2a | pesquisador (Fase A, se stale) | — | 1 | slice mercado |
| 2a.iii | pesquisador (Fase B) | formato | 2a | `<candidatos>` |
| 2c | ⏸ usuário | candidatos ← 2a.iii | 2a.iii | escolha |
| 3 | designer (ad-hoc, condic.) + ⏸ | descrição/refs | 2c | rascunho |
| 4 | briefing-writer | escolha ← 2c | 2c | `<briefing>` |
| 5 | ⚙ criar pasta | slug ← 4 | 4 | pasta |
| 6 | treinador (condic.) | exercícios, objetivo ← 4 | 4 | prescrição |
| 7 | pesquisador (P7) | briefing ← 4 | 4 | pesquisa-bruta |
| 8 | copywriter + ⏸ | pesquisa ← 7, briefing ← 4 | 7 | copy.md |
| 9 | designer + ⏸ | copy ← 8 | 8 | assets |
| 10 | curador-export | pasta ← 9 | 9 | `<validacao>` + PNGs |
| 11a | revisor-conteudo | pasta ← 10, briefing ← 4 | 10 | `<parecer>` |
| 11b | revisor-brand | pasta ← 10 | 11a | parecer binário |
| 13 | ⚙ entregar | tudo ← 11b | 11b | entrega |
| 13.5 | designer (stories, condic.) + ⏸ | copy, estilo | 13 | frames |
| 14 | ⚙ política publish | pasta ← 11b | 11b | publicado/pendente |
```

- [ ] **Step 2: Remover injeções de contexto auto-carregado**

- Linha ~78 (call pesquisador Fase A): remover `- Pilares da marca: (de brand/pilares-conteudo.md)`.
- Linhas ~188, ~373, ~541 (calls designer): remover `- Regras inegociáveis: templates/formatos/README.md`.
- Linhas ~434 e ~599 (Critérios curador-export): remover `- Tipografia/paleta dentro de brand/referencias-visuais.md (+ extras autorizadas pelo estilo.md).` (o curador valida tokens por padrão).

- [ ] **Step 3: Apertar retry para máx 1**

Localizar o controle de tentativas da curadoria (Passo 11). Substituir os limiares `tentativas_11a ≥ 3` e `tentativas_11b ≥ 2` por **≥ 1** em ambos (1 retry automático; 2º fracasso pausa e mostra parecer ao usuário). Atualizar o texto explicativo correspondente.

- [ ] **Step 4: Verificar**

Run: `grep -nE "pilares-conteudo.md\)|formatos/README.md|Tipografia/paleta dentro de brand" .claude/skills/novo-post/SKILL.md || echo "injeções removidas"`
Expected: `injeções removidas`
Run: `scripts/check-redesign.sh skills 2>&1 | grep novo-post || echo "novo-post tem Fluxo"`
Expected: `novo-post tem Fluxo`

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/novo-post/SKILL.md
git commit -m "refactor(novo-post): tabela de fluxo, remove injeções redundantes, retry máx 1"
```

---

## Task 13: Skill — novo-estilo (fluxo + remove injeções)

**Files:**
- Modify: `.claude/skills/novo-estilo/SKILL.md`

- [ ] **Step 1: Adicionar `## Fluxo`**

```markdown
## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ parse + modo | input | — | modo, formato, slug |
| 2 | ⚙ tratar _rascunho/ | — | 1 | rascunho pronto |
| 3 | ⏸ usuário | contexto ← 2 | 2 | descrição/alterações |
| 4 | ⚙ preparar pasta | — | 3 | pasta de trabalho |
| 5 | designer | descrição/refs ← 3, modo | 4 | template+estilo.md+preview |
| 6 | ⏸ usuário | preview ← 5 | 5 | confirmar/ajuste |
| 7 | ⚙ slug (só criar) | — | 6 | slug |
| 8 | ⚙ salvar | — | 7 | estilo salvo |
| 9 | ⚙ confirmar | — | 8 | confirmação |
```

- [ ] **Step 2: Remover injeções no bloco "Regras" do call designer (~L76-77)**

- Remover `- brand/referencias-visuais.md é lei (paleta, tipografia, mood).` (designer auto-carrega).
- Remover `- Regras inegociáveis (dimensões, safe areas, fontes, paleta): templates/formatos/README.md.` (README deletado; tokens vêm do auto-load).

Manter as demais linhas de "Regras" (convenção de arquivo principal, contrato do estilo.md, placeholders, drop zones, variantes) — são instruções de tarefa, não contexto auto-carregado.

- [ ] **Step 3: Verificar**

Run: `grep -nE "referencias-visuais.md é lei|formatos/README.md" .claude/skills/novo-estilo/SKILL.md || echo "injeções removidas"`
Expected: `injeções removidas`

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/novo-estilo/SKILL.md
git commit -m "refactor(novo-estilo): tabela de fluxo, remove injeções redundantes"
```

---

## Task 14: Skill — planejar-pauta-semanal (fluxo + remove injeção + retry)

**Files:**
- Modify: `.claude/skills/planejar-pauta-semanal/SKILL.md`

- [ ] **Step 1: Adicionar `## Fluxo`**

```markdown
## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ semana ativa | data | — | YYYY-Www |
| 2 | pesquisador (Fase A) | N, semana, ângulos-queimados | 1 | pesquisa-tendencias.md |
| 3 | briefing-writer (×N) | tendências ← 2 | 2 | N `<briefing>` |
| 4 | ⚙ gravar manifest | briefings ← 3 | 3 | campanha |
| 5 | ⚙ relatório | — | 4 | relatório inline |
```

- [ ] **Step 2: Remover injeção redundante no call do pesquisador (~L58)**

Remover `- Pilares ativos: lê brand/pilares-conteudo.md` (pesquisador auto-carrega). **Manter** `- Ângulos queimados: lê dados/performance/angulos-queimados.md` (o pesquisador NÃO auto-carrega esse arquivo — é instrução válida).

- [ ] **Step 3: Verificar**

Run: `grep -n "Pilares ativos: lê brand/pilares-conteudo.md" .claude/skills/planejar-pauta-semanal/SKILL.md || echo "injeção removida"`
Expected: `injeção removida`
Run: `grep -c "angulos-queimados.md" .claude/skills/planejar-pauta-semanal/SKILL.md`
Expected: `>= 1` (mantida)

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/planejar-pauta-semanal/SKILL.md
git commit -m "refactor(planejar-pauta): tabela de fluxo, remove injeção de pilares"
```

---

## Task 15: Skill — lote-posts (fluxo + envelope cleanup)

**Files:**
- Modify: `.claude/skills/lote-posts/SKILL.md`

- [ ] **Step 1: Adicionar `## Fluxo`**

```markdown
## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ parse input | input | — | N, estilos, tema |
| 2 | ⚙ distribuição de estilos | — | 1 | estilos por post |
| 3 | pesquisador (Fase A/B, condic.) | tema | 2 | distribuição+candidatos |
| 4 | ⏸ usuário | plano ← 3 | 3 | confirmação |
| 5 | sub-fluxo novo-post P4–8 (×posts) | plano ← 4 | 4 | copy por post |
| 6 | ⏸ usuário | copies ← 5 | 5 | ok/ajuste em lote |
| 7 | designer (×posts) | copy ← 5 | 6 | assets por post |
| 8 | curador-export + revisores (×posts) | pasta ← 7 | 7 | validação por post |
| 9 | ⚙ relatório do lote | — | 8 | relatório |
| 10 | ⚙ política publish (×posts) | pasta ← 8 | 8 | publicado/pendente |
```

- [ ] **Step 2: Limpar envelopes redundantes**

Procurar e remover qualquer linha que reinjete `brand/*` ou `templates/formatos/README.md` nos calls de agente (herda o padrão do novo-post). Manter referências documentais que não são injeção de input (ex: "cada agente lê o recorte de brand/ que sua função exige" é nota explicativa — manter).

- [ ] **Step 3: Verificar**

Run: `grep -nE "formatos/README.md|: \(de brand/" .claude/skills/lote-posts/SKILL.md || echo "envelopes limpos"`
Expected: `envelopes limpos`

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/lote-posts/SKILL.md
git commit -m "refactor(lote-posts): tabela de fluxo + envelope cirúrgico"
```

---

## Task 16: Skills — brand-discovery e atualizar-ramon (fluxo)

**Files:**
- Modify: `.claude/skills/brand-discovery/SKILL.md`
- Modify: `.claude/skills/atualizar-ramon/SKILL.md`

- [ ] **Step 1: brand-discovery — adicionar `## Fluxo`**

```markdown
## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 0 | ⚙ diagnóstico | brand/* | — | lacunas |
| 1 | ⚙ coleta de materiais | materiais soltos | 0 | insumos |
| 2 | ⏸ entrevista incremental | perguntas ← 1 | 1 | respostas |
| 3 | ⚙ consolidação | respostas ← 2 | 2 | brand/* preenchido |
| 4 | ⏸ validação final | brand/* ← 3 | 3 | aprovação |
```

- [ ] **Step 2: atualizar-ramon — adicionar `## Fluxo`**

```markdown
## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ diagnóstico | dados/ramon (archivist auto) | — | estado atual |
| 2 | ⏸ usuário | — | 1 | input |
| 3 | archivist-ramon | input ← 2 | 2 | contexto.md (manifesto) |
| 4 | ⚙ tratar retorno | retorno ← 3 | 3 | tratamento + oferta |
| 5 | ⚙ reportar | — | 4 | conclusão |
```

- [ ] **Step 3: Verificar**

Run: `scripts/check-redesign.sh skills 2>&1 | grep -E "brand-discovery|atualizar-ramon" || echo "skills OK"`
Expected: `skills OK`

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/brand-discovery/SKILL.md .claude/skills/atualizar-ramon/SKILL.md
git commit -m "refactor(brand-discovery, atualizar-ramon): tabela de fluxo"
```

---

## Task 17: Skill — novo-site (fluxo dual-mode)

**Files:**
- Modify: `.claude/skills/novo-site/SKILL.md`

- [ ] **Step 1: Adicionar `## Fluxo` (modo criação)**

```markdown
## Fluxo — modo criação

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ validar spec+brand | spec, brand | — | validado |
| 2 | arquiteto-web | spec ← 1 | 1 | scaffold (manifesto) |
| 3 | briefing-writer | spec, objetivo | 2 | `<briefing>` home |
| 4 | designer-web | briefing ← 3 | 3 | 7 seções (manifesto) |
| 5 | dev-frontend | seções ← 4 | 4 | home integrada |
| 6 | curador-web | — | 5 | `<validacao>` |
| 7 | ⏸ usuário | preview | 6 | ok/ajuste |
| 7.5 | revisor-brand (bloqueante) | seções ← 5 | 7 | parecer binário |
| 8 | ⚙ deploy preview (vercel) | — | 7.5 | URL |
| 9 | ⚙ confirmar | — | 8 | confirmação |

## Fluxo — modo alteração

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ estado atual | descrição da mudança | — | contexto |
| 2 | ⚙ classificar alteração | — | 1 | tipo de mudança |
| 3 | agente(s) pertinente(s) | escopo ← 2 | 2 | mudança aplicada |
| 4 | curador-web | — | 3 | `<validacao>` |
| 5 | revisor-brand (se tocou copy/identidade) | — | 4 | parecer binário |
| 6 | ⏸ usuário | preview | 5 | confirmação |
| 7 | ⚙ commit | — | 6 | commitado |
```

- [ ] **Step 2: Limpar linhas documentais redundantes**

Nas linhas que descrevem o que o briefing-writer auto-carrega (ex: "Brand book (lido automaticamente os 5 arquivos)" e "Banco de Dados: ... lidos automaticamente"): manter como **nota** se forem explicação, mas garantir que não aparecem como **campos de input** nos calls de agente. Remover qualquer ocorrência em bloco de envelope.

- [ ] **Step 3: Verificar**

Run: `scripts/check-redesign.sh skills 2>&1 | grep novo-site || echo "novo-site OK"`
Expected: `novo-site OK`

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/novo-site/SKILL.md
git commit -m "refactor(novo-site): tabelas de fluxo dual-mode + envelope cirúrgico"
```

---

## Task 18: CLAUDE.md — doutrina do sistema

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Expandir "Regras operacionais"**

Adicionar à seção `## Regras operacionais` os bullets de doutrina:

```markdown
- **Skill = fluxo; contrato = comportamento.** A skill define ordem, envelope entre agentes, dependências, retrabalho e output final. O contrato do agente define critérios de qualidade, como processar input, schema de output e tratamento de input incompleto. Nunca colocar comportamento interno do agente na skill.
- **Contexto cirúrgico, sem redundância.** A skill só injeta o que varia por chamada. Nunca repassa contexto que o agente já declara em "Contexto que carrego" (brand/*, slices que é owner, diretivas). Nenhuma instrução repetida entre skill e contrato.
- **Schema rígido de saída.** Todo agente entrega num dos 3 formatos: inline rígido (tags/campos), markdown estruturado (briefing) ou manifesto (file-producers). Sem preâmbulo; texto fora do schema é ignorado.
- **Orçamento via contrato.** Sem `max_tokens` por subagent no runtime — cada contrato declara alvo de concisão + anti-padding.
- **Early-exit + máx 1 retry.** Gate antes de agente caro; máx 1 retry automático por etapa, 2º fracasso escala ao usuário.
- **Toda skill abre com `## Fluxo`** (tabela: Passo | Agente/Ação | Recebe | Depende | Entrega).
```

- [ ] **Step 2: Apontar a spec como referência canônica**

Na seção que descreve a organização (perto de "Regras operacionais" ou no rodapé), adicionar: `Padrão de contratos e skills detalhado em [docs/specs/2026-05-26-redesign-contexto-agentes-skills-design.md](docs/specs/2026-05-26-redesign-contexto-agentes-skills-design.md).`

- [ ] **Step 3: Remover a referência ao README de formatos (se houver)**

Run: `grep -n "formatos/README.md" CLAUDE.md || echo "sem ref"`
Se houver, remover a linha.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(claude-md): doutrina de contexto cirúrgico + schema/orçamento/retry"
```

---

## Task 19: Deletar README + varredura de consistência final

**Files:**
- Delete: `templates/formatos/README.md`

- [ ] **Step 1: Confirmar que nenhum arquivo ainda referencia o README**

Run: `grep -rn "formatos/README.md" .claude templates CLAUDE.md`
Expected: nenhuma saída (todas as referências removidas nas tasks 2, 12, 13, 18).
Se houver saída, voltar e remover antes de deletar.

- [ ] **Step 2: Deletar o arquivo**

Run: `git rm templates/formatos/README.md`
Expected: `rm 'templates/formatos/README.md'`

- [ ] **Step 3: Rodar a checagem completa**

Run: `scripts/check-redesign.sh all`
Expected: `OK: todas as checagens passaram`

- [ ] **Step 4: Revisão manual de não-redundância**

Inspecionar cada bloco de call de agente nas skills e confirmar (checklist manual): nenhum campo de envelope repete um arquivo listado no "Contexto que carrego" do agente-alvo. Conferir especialmente: designer (brand/referencias-visuais, README), pesquisador (pilares-conteudo), curadores (referencias-visuais), revisores (brand-book, pilares).

Run (apoio): `grep -rnE ": \(de brand/|brand/referencias-visuais.md é lei|Pilares da marca: \(de" .claude/skills/ || echo "sem injeções residuais"`
Expected: `sem injeções residuais`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: deleta README de formatos (duplicação) + varredura de consistência"
```

---

## Self-Review (executada na escrita do plano)

**Spec coverage:**
- §1 template contrato → Convenções + recipe, aplicado nas Tasks 2–11. ✓
- §2 template skill (Fluxo) → Tasks 12–17 + check `skills`. ✓
- §3A 3 schemas → Convenções + schema por agente nas tasks. ✓
- §3B orçamento → inserido em toda task de agente. ✓
- §3C early-exit + retry máx 1 → Task 12 (novo-post) + bullet doutrina Task 18. ✓
- §4 deletar README + drop zones → Task 2 (absorve) + Task 19 (deleta). ✓
- §5 deltas por agente (15) → Tasks 2–11 cobrem os 15. ✓
- §6 deltas por skill (7) → Tasks 12–17 cobrem os 7. ✓
- §7 CLAUDE.md → Task 18. ✓
- §8 ordem (agentes → skills → CLAUDE.md → checagem) → ordem das tasks + Task 19. ✓

**Placeholder scan:** schemas escritos por extenso; nº de linha citados como "~L" porque arquivos serão editados antes (offsets podem mover) — verificação usa grep por string, não por linha. Sem TODO/TBD. ✓

**Type consistency:** nomes de seção (`## Recebo`, `## Entrego`, `## Orçamento de output`, `## Input incompleto`, `## Fluxo`) idênticos entre o check script (Task 1), o recipe e todas as tasks. Tags de schema (`<manifesto>`, `<candidatos>`, `<parecer>`/campos, `<validacao>`) consistentes entre Convenções e tasks. ✓

**Nota sobre verificação:** como é refactor de markdown, não há red/green de teste unitário — o "verde" de cada task é o grep estrutural + o `check-redesign.sh`. A qualidade semântica (schema faz sentido, envelope realmente cirúrgico) é validada na revisão manual da Task 19 e, idealmente, num smoke real de `/novo-post` após o merge.
