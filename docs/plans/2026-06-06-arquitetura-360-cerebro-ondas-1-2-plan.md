# Arquitetura 360 + Cérebro de Marca — Plano de Implementação (Ondas 1 e 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans para implementar tarefa-a-tarefa. Os passos usam checkbox (`- [ ]`).

**Goal:** Dar ao sistema Dino Team uma memória de marca explícita (`memory/`) e a camada de direção que faltava (gestão de narrativa), passando de "fábrica de posts" para um sistema que pensa como diretor de marca.

**Architecture:** Arquitetura blackboard — "a memória é a integração". A Onda 1 cria o substrato (cérebro `memory/` com slices de dono único + schema versionado). A Onda 2 dá vida a ele com a função de direção (um agente dono de `narrativas/` + a skill `/ciclo-de-direcao`), reposicionando a pauta como tradução da direção. Onda 2 depende da Onda 1.

**Tech Stack:** Markdown + frontmatter YAML (o cérebro e os contratos de agente/skill são markdown — não há build/teste unitário tradicional). Next.js + TypeScript no `site/` (dashboard lê o cérebro). "Testes" aqui = verificações determinísticas: `grep`, `ls`, checagem de campos de arquivo, smoke do `npm run build` do site, e dry-run de leitura das skills.

**Spec de origem:** `docs/specs/2026-06-06-arquitetura-360-cerebro-de-marca-design.md`.

---

## ⚠ Onde executar este plano

- O **doc** (spec + este plano) nasceu num worktree criado a partir de `origin/main` (`worktree-arquitetura-360-cerebro`) — porque a sessão de background exigiu isolamento.
- **A implementação NÃO deve rodar neste worktree** (ele está em cima de `main`, sem o trabalho não-commitado de `dino-studio-editor`). Execute em cima de **`dino-studio-editor`** — idealmente um worktree novo branchado dele (`superpowers:using-git-worktrees`). Os caminhos abaixo refletem o estado de `dino-studio-editor`.

## Refinamentos sobre o spec (descobertos ao mapear o código)

1. **`politicas` não está órfã.** `site/lib/dashboard/readers.ts` e `site/app/api/skills/dispatch/route.ts` leem `dados/politicas/publicacao.yaml`; `/novo-post` e `/lote-posts` também. → Em vez de **aposentar** na Onda 1, **movemos** `dados/politicas/` → `orquestracao/politicas/` (governança vive na camada de orquestração) e atualizamos os 5 consumidores. A aposentadoria/consolidação formal fica pra **Onda 5** (rework de governança), quando os flags por-decisão existirem.
2. **`politicas` não vai pra `memory/`.** É governança/config, não memória. Daí o destino `orquestracao/`, não `memory/`.
3. **O rename toca o site.** `dados/`→`memory/` exige atualizar 2 arquivos TS do site além de skills/agentes/CLAUDE.

## Mapa de arquivos (blast radius confirmado por grep)

**Movem-se (slices do cérebro):** `dados/mercado/`, `dados/ramon/`, `dados/performance/`, `dados/pesquisas-brutas/` (→ `memory/pesquisa/`), `dados/_schema.md`.
**Move-se (governança):** `dados/politicas/` → `orquestracao/politicas/`.
**Criam-se:** `memory/narrativas/`, `memory/publico/`, `memory/mercado/narrativa-de-mercado.md`, `memory/_schema.md` (reescrito).
**Referências a atualizar (`dados/` → `memory/` e politicas → orquestracao):**
- Skills: `.claude/skills/{novo-post,lote-posts,planejar-pauta-semanal,novo-site,atualizar-ramon}/SKILL.md`
- Agentes: `.claude/agents/{pesquisador-mercado,analista-performance,arquivista}.md`
- `CLAUDE.md`, `scripts/integrations/README.md`
- Site: `site/lib/dashboard/readers.ts`, `site/app/api/skills/dispatch/route.ts`

---

# ONDA 1 — Cérebro (fundação de memória)

**Resultado testável ao fim:** `memory/` existe com schema versionado declarando a estrutura completa; slices movidos sem perda de histórico git; `narrativas/` e `publico/` criados; nenhuma referência ativa a `dados/` resta; o site builda.

### Task 1.1: Mover os slices do cérebro para `memory/` (preserva histórico git)

**Files:**
- Move: `dados/mercado/` → `memory/mercado/`
- Move: `dados/ramon/` → `memory/ramon/`
- Move: `dados/performance/` → `memory/performance/`
- Move: `dados/pesquisas-brutas/` → `memory/pesquisa/`
- Move: `dados/_schema.md` → `memory/_schema.md`
- Move: `dados/politicas/` → `orquestracao/politicas/`

- [ ] **Step 1: Mover com `git mv` (mantém blame/histórico)**

```bash
mkdir -p memory orquestracao
git mv dados/mercado memory/mercado
git mv dados/ramon memory/ramon
git mv dados/performance memory/performance
git mv dados/pesquisas-brutas memory/pesquisa
git mv dados/_schema.md memory/_schema.md
git mv dados/politicas orquestracao/politicas
```

- [ ] **Step 2: Confirmar que `dados/` ficou vazio e removê-lo**

```bash
find dados -type f 2>/dev/null   # esperado: nenhuma saída
rmdir dados 2>/dev/null || rm -rf dados
ls -d memory/* orquestracao/politicas
```
Expected: lista `memory/mercado memory/pesquisa memory/performance memory/ramon memory/_schema.md` e `orquestracao/politicas`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor(memory): move slices dados/ -> memory/ e politicas -> orquestracao/ (git mv)"
```

### Task 1.2: Reescrever `memory/_schema.md` para a estrutura nova

**Files:**
- Modify (sobrescreve): `memory/_schema.md`

- [ ] **Step 1: Escrever o schema completo**

Conteúdo integral do arquivo (declara a estrutura completa — inclusive slices a popular depois; declarar ≠ construir):

````markdown
---
versao: 2
ultima_atualizacao: 2026-06-06
---

# Cérebro de Marca — Schema (`memory/`)

Memória viva compartilhada do sistema Dino Team. **"A memória é a integração":** as funções não se coordenam entre si — leem e escrevem o mesmo estado. Markdown + frontmatter YAML. Lido por qualquer função; escrito apenas pelo owner declarado.

## Princípios

- **Dono único por slice.** Só o owner escreve; outros propõem via output e o owner consolida.
- **Cérebro ≠ insumo.** `memory/pesquisa/` é pesquisa bruta (insumo transitório). O resto é a "verdade" durável.
- **YAGNI de slice.** Uma fatia só nasce quando uma função a lê de verdade. Este schema **declara** a estrutura completa; declarar ≠ construir.
- **Write-back é de 1ª classe.** Produzir uma peça atualiza o cérebro (livro-razão de mensagens, ângulos).
- **Versionado em git.** Toda mudança é commit.

## Slices

| Slice | Owner único | Conteúdo | Estado |
|---|---|---|---|
| `narrativas/` | `estrategista-narrativa` | arcos ativos, roadmap de crença, livro-razão de mensagens | criado (Onda 1); populado (Onda 2) |
| `publico/` | `pesquisador-mercado` (Produto alimenta) | dores, objeções (com a fala do público embutida) | criado (Onda 1) |
| `mercado/` | `pesquisador-mercado` | `narrativa-de-mercado.md`, `tendencias/`, `concorrentes/` | ativo |
| `ramon/` | `arquivista` | contexto temporal/biográfico | ativo |
| `performance/` | `analista-performance` | `angulos-queimados.md`; métricas por canal (futuro) | ativo (parcial) |
| `pesquisa/` | `pesquisador-mercado` | pesquisa bruta datada (insumo) | ativo |

**Não é cérebro:** `orquestracao/politicas/` (governança/config), `dados/mercado/_diretivas.md` → ver Task 1.7 (config de pesquisa).

## Slices declarados, build depois (Produto / canais)

- `publico/` é alimentado por sinais reais da consultoria (Onda 6+).
- `performance/{social-media,ads,email,funil-site}/` quando publicação real gerar métrica (Onda 5+).

## Frontmatter padrão dos arquivos do cérebro

```yaml
---
slice: <narrativas | publico | mercado | ramon | performance | pesquisa>
owner: <agente owner>
ultima_atualizacao: YYYY-MM-DD
versao: 1
---
```

## Ownership

Owner **escreve**; outros **leem e propõem**. Mudança de owner exige atualizar este schema + commit.
````

- [ ] **Step 2: Verificar e commitar**

```bash
grep -q "Cérebro de Marca" memory/_schema.md && echo OK
git add memory/_schema.md && git commit -m "docs(memory): reescreve _schema para estrutura de cérebro v2"
```

### Task 1.3: Atualizar todas as referências de caminho

**Files:**
- Modify: `.claude/skills/novo-post/SKILL.md`, `.claude/skills/lote-posts/SKILL.md`, `.claude/skills/planejar-pauta-semanal/SKILL.md`, `.claude/skills/novo-site/SKILL.md`, `.claude/skills/atualizar-ramon/SKILL.md`
- Modify: `.claude/agents/pesquisador-mercado.md`, `.claude/agents/analista-performance.md`, `.claude/agents/arquivista.md`
- Modify: `CLAUDE.md`, `scripts/integrations/README.md`
- Modify: `site/lib/dashboard/readers.ts`, `site/app/api/skills/dispatch/route.ts`

- [ ] **Step 1: Mapear o que ainda referencia `dados/`**

```bash
grep -rln "dados/" .claude CLAUDE.md scripts site --include="*.md" --include="*.ts" --include="*.tsx" --include="*.js" | grep -vE "\.next|node_modules"
```
Expected: a lista de arquivos do "Mapa de arquivos" acima.

- [ ] **Step 2: Trocar os caminhos dos slices do cérebro (`dados/<slice>` → `memory/<slice>`; `dados/pesquisas-brutas` → `memory/pesquisa`)**

Em cada arquivo, aplicar as substituições textuais:
- `dados/mercado` → `memory/mercado`
- `dados/ramon` → `memory/ramon`
- `dados/performance` → `memory/performance`
- `dados/pesquisas-brutas` → `memory/pesquisa`
- `dados/_schema.md` → `memory/_schema.md`

Comando assistido (revisar cada hit antes; **não** rode cego em arquivos do site sem conferir):

```bash
for f in .claude/skills/*/SKILL.md .claude/agents/{pesquisador-mercado,analista-performance,arquivista}.md scripts/integrations/README.md CLAUDE.md; do
  sed -i '' -e 's#dados/pesquisas-brutas#memory/pesquisa#g' \
            -e 's#dados/mercado#memory/mercado#g' \
            -e 's#dados/ramon#memory/ramon#g' \
            -e 's#dados/performance#memory/performance#g' \
            -e 's#dados/_schema.md#memory/_schema.md#g' "$f"
done
```

- [ ] **Step 3: Trocar o caminho de `politicas` (`dados/politicas` → `orquestracao/politicas`)**

Arquivos: `.claude/skills/novo-post/SKILL.md`, `.claude/skills/lote-posts/SKILL.md`, `CLAUDE.md`, `site/lib/dashboard/readers.ts`, `site/app/api/skills/dispatch/route.ts`.

```bash
for f in .claude/skills/novo-post/SKILL.md .claude/skills/lote-posts/SKILL.md CLAUDE.md; do
  sed -i '' -e 's#dados/politicas#orquestracao/politicas#g' "$f"
done
```
Nos 2 arquivos do site, editar à mão (são `path.join(REPO_ROOT, "dados", "politicas", ...)` e `path.join(REPO_ROOT, "dados")`):
- `site/lib/dashboard/readers.ts`:
  - linha ~99: `path.join(REPO_ROOT, "dados")` → `path.join(REPO_ROOT, "memory")` e `` `dados/${slice}/${f}` `` → `` `memory/${slice}/${f}` ``
  - linha ~122: `path.join(REPO_ROOT, "dados", "politicas", "publicacao.yaml")` → `path.join(REPO_ROOT, "orquestracao", "politicas", "publicacao.yaml")`
  - **Atenção:** a lista de slices lida pelo dashboard (frescor do banco) deve refletir os slices novos. Se houver um array tipo `["ramon","mercado","performance"]`, atualizar para `["narrativas","publico","mercado","ramon","performance","pesquisa"]`.
- `site/app/api/skills/dispatch/route.ts`:
  - linha ~57: `path.join(REPO_ROOT, "dados", "politicas", "publicacao.yaml")` → `path.join(REPO_ROOT, "orquestracao", "politicas", "publicacao.yaml")`
  - linha ~51: atualizar a string de mensagem `dados/politicas/publicacao.yaml` → `orquestracao/politicas/publicacao.yaml`

- [ ] **Step 4: Verificar zero referências ativas a `dados/`**

```bash
grep -rn "dados/" .claude CLAUDE.md scripts site --include="*.md" --include="*.ts" --include="*.tsx" --include="*.js" | grep -vE "\.next|node_modules" | grep -v "memory/pesquisa"
```
Expected: **nenhuma saída** (fora conteúdo histórico já movido p/ `memory/pesquisa/`, que não é código). Se sobrar algo, corrigir.

- [ ] **Step 5: Smoke do site (a mudança de path TS não quebrou build)**

```bash
cd site && npm run build 2>&1 | tail -20; cd ..
```
Expected: build conclui sem erro de tipo/import nos 2 arquivos tocados. (Se `npm run build` for pesado, `npx tsc --noEmit` em `site/` basta para validar tipos.)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(memory): atualiza refs dados/->memory/ e politicas->orquestracao/ em skills, agentes, CLAUDE e site"
```

### Task 1.4: Criar `memory/publico/` (dores + objeções extraídas da prosa)

**Files:**
- Create: `memory/publico/dores.md`
- Create: `memory/publico/objecoes.md`
- Read (fonte): `brand/publico-alvo.md` (a "escada de dores"), `brand/pilares-conteudo.md`, `brand/tom-de-voz.md` (vocabulário do público)

- [ ] **Step 1: Criar `memory/publico/dores.md` no formato canônico**

Frontmatter + uma entrada por dor. Extrair a "escada de dores" de `brand/publico-alvo.md` e enriquecer com a fala do público (de `tom-de-voz.md` §Vocabulário e dos pilares). Formato e sementes (já conhecidas dos pilares — completar lendo `publico-alvo.md`):

````markdown
---
slice: publico
owner: pesquisador-mercado
ultima_atualizacao: 2026-06-06
versao: 1
---

# Dores do público

Estado interno do público (não do mercado). Cada dor: nome, descrição, **como o público verbaliza** (fala crua, pra espelhar no hook antes de elevar ao tom da marca), e o registro/pilar que a serve. Alimentado por pesquisa e (Onda 6+) por sinais reais da consultoria.

## Entradas

### Cansaço de recomeçar
- **Descrição:** ciclo de parar e voltar; energia gasta em recomeços, não em progresso.
- **Fala do público:** "sempre começo de novo", "perco tudo quando paro".
- **Serve:** Pilar Mentalidade · registro R1/R2.

### Comparação / atraso
- **Descrição:** sente-se atrás de quem começou junto; mede-se pelo outro.
- **Fala do público:** "todo mundo evoluiu menos eu", "comecei tarde demais".
- **Serve:** Pilar Mentalidade / Prova viva.

### Vergonha silenciosa
- **Descrição:** sabe que pode mais e continua escolhendo o mesmo.
- **Fala do público:** "sei o que fazer, só não faço".
- **Serve:** Pilar Mentalidade (M9).

### Medo do teto
- **Descrição:** acredita que já chegou no próprio limite genético/possível.
- **Fala do público:** "meu corpo não responde mais", "é genética".
- **Serve:** Pilar Prova viva.

### Dispersão
- **Descrição:** muitos métodos, nenhuma direção; troca de plano a cada dúvida.
- **Fala do público:** "não sei o que seguir", "cada hora um treino".
- **Serve:** Pilar Método (M10: "não está travado, está disperso").

### Corpo que não vem / progresso invisível
- **Descrição:** faz tudo certo e não vê resultado no espelho.
- **Fala do público:** "não vejo resultado", "travei", "platô".
- **Serve:** Pilar Método / Mentalidade.

### Solidão no processo
- **Descrição:** sente que enfrenta sozinho; sem ambiente.
- **Fala do público:** "ninguém entende", "faço sozinho".
- **Serve:** Pilar Transformação (comunidade responde).
````

> Completar/ajustar lendo a escada de dores integral em `brand/publico-alvo.md` — não inventar entradas fora dela.

- [ ] **Step 2: Criar `memory/publico/objecoes.md`** (mesmo formato; objeções de venda/processo: "não tenho tempo", "consultoria é cara", "treino sozinho já", "fora de academia não dá"). Cada objeção: descrição + fala do público + reframe alinhado ao tom (M-mecanismos) + pilar. Extrair de `publico-alvo.md`.

- [ ] **Step 3: Verificar e commitar**

```bash
test -f memory/publico/dores.md && test -f memory/publico/objecoes.md && echo OK
git add memory/publico && git commit -m "feat(memory): cria slice publico/ (dores + objecoes com fala do publico)"
```

### Task 1.5: Criar `memory/mercado/narrativa-de-mercado.md`

**Files:**
- Create: `memory/mercado/narrativa-de-mercado.md`
- Read (fonte): `memory/mercado/concorrentes/*` (STNDRD etc.), `brand/pilares-conteudo.md` (off-limits), `brand/tom-de-voz.md` (o que a marca nega)

- [ ] **Step 1: Escrever o discurso dominante do nicho (maré)**

````markdown
---
slice: mercado
owner: pesquisador-mercado
ultima_atualizacao: 2026-06-06
versao: 1
---

# Narrativa de mercado (maromba BR)

O discurso **lento e profundo** do nicho — distinto de `tendencias/` (ondas). É a **pedra de amolar** da narrativa da marca: a Dino Team se posiciona CONTRA boa parte disto. Alimenta `narrativas/`.

## Crenças dominantes do nicho
- **"No pain no gain" / hardcore:** intensidade = virtude; sofrimento = prova.
- **Mais é melhor:** mais volume, mais suplemento, mais treino.
- **Cultura do atalho:** fórmula secreta, shape de verão, transformação rápida.
- **Guru / bravata:** autoridade pelo grito e pela exibição (palco, holofote).
- **Discurso anabólico velado:** resultado atribuído a recurso, não a direção.

## Onde a Dino Team se posiciona contra (contraste que a define)
- Anti-hype / anti-espetáculo → o sereno (a vitória é prova silenciosa).
- Direção > intensidade/motivação → contra "no pain no gain".
- Método validado > atalho → off-limits "sem fórmula mágica".
- Mostrar > proclamar → contra a bravata do guru.

## Sinais / fontes
- Estudo STNDRD (`memory/mercado/concorrentes/stndrd*`) — referência de contraste seco.
- Atualizar via `/pesquisar-mercado` (Onda 3).
````

- [ ] **Step 2: Verificar e commitar**

```bash
test -f memory/mercado/narrativa-de-mercado.md && echo OK
git add memory/mercado/narrativa-de-mercado.md && git commit -m "feat(memory): cria narrativa-de-mercado (discurso do nicho)"
```

### Task 1.6: Criar a estrutura de `memory/narrativas/` (vazia + schema interno)

Onda 1 cria a **estrutura e o formato**; Onda 2 **popula**. Resolve a decisão em aberto §10 do spec (schema interno de narrativas).

**Files:**
- Create: `memory/narrativas/_formato.md` (define o schema interno)
- Create: `memory/narrativas/ativas.md` (cabeçalho + "sem arcos ainda")
- Create: `memory/narrativas/roadmap-crenca.md` (cabeçalho + horizontes vazios)
- Create: `memory/narrativas/livro-razao.md` (cabeçalho + tabela vazia)

- [ ] **Step 1: Definir o formato interno em `_formato.md`**

````markdown
---
slice: narrativas
owner: estrategista-narrativa
ultima_atualizacao: 2026-06-06
versao: 1
---

# Formato do slice `narrativas/`

## `ativas.md` — arcos de narrativa em construção
Cada arco:
```
### <nome-do-arco>
- **estado:** ativa | saturando | aposentada
- **crença-alvo:** <a crença que este arco instala no público>
- **horizonte:** <YYYY-MM a YYYY-MM>
- **pilares:** <pilares de brand/pilares-conteudo.md que serve>
- **canais:** <ig | blog | email | comunidade | site>
- **contra (narrativa de mercado):** <o que este arco reframa do discurso do nicho>
- **mensagens-âncora:** <2-4 frases-semente, no tom>
- **última-atividade:** YYYY-MM-DD
```

## `roadmap-crenca.md` — o que o público deve crer
Três horizontes; cada um lista crenças-alvo:
```
## 3 meses
- <crença>
## 6 meses
- <crença>
## 12 meses
- <crença>
```

## `livro-razao.md` — o que já foi dito (responde "dito 40 vezes?")
Tabela append-only, escrita pelo write-back (Onda 3):
```
| data | mensagem/ângulo | narrativa | canal | peça |
|------|-----------------|-----------|-------|------|
```
Contagem de saturação = nº de linhas por mensagem/narrativa numa janela.
````

- [ ] **Step 2: Criar os 3 arquivos com cabeçalho + corpo vazio** (frontmatter `slice: narrativas`, owner `estrategista-narrativa`; `ativas.md` com "_Sem arcos ativos — populado na Onda 2._"; `roadmap-crenca.md` com os 3 cabeçalhos vazios; `livro-razao.md` com a tabela só com header).

- [ ] **Step 3: Verificar e commitar**

```bash
ls memory/narrativas/  # _formato.md ativas.md livro-razao.md roadmap-crenca.md
git add memory/narrativas && git commit -m "feat(memory): cria estrutura do slice narrativas/ (formato + arquivos vazios)"
```

### Task 1.7: Aposentar `vocabulario-publico.md` standalone + tratar `_diretivas.md`

**Files:**
- Delete: `memory/mercado/vocabulario-publico.md` (conteúdo já absorvido em `publico/` na Task 1.4)
- Modify: `.claude/agents/pesquisador-mercado.md` (deixa de ser owner de `vocabulario-publico`; passa a escrever a fala do público dentro de `publico/`)
- Modify: `.claude/skills/novo-post/SKILL.md` (passo de copy lê `memory/publico/` em vez de `vocabulario-publico`)
- Decidir `_diretivas.md`: é **config de pesquisa**, não memória → mantém em `memory/mercado/_diretivas.md` por ora **mas** documentar no contrato do `pesquisador-mercado` que é config (não slice de aprendizado). (Mover pra junto da skill `/pesquisar-mercado` fica pra Onda 3, quando a skill nascer.)

- [ ] **Step 1: Conferir que a fala do público foi pra `publico/` e remover o standalone**

```bash
grep -q "Fala do público" memory/publico/dores.md && echo "absorvido OK"
git rm memory/mercado/vocabulario-publico.md
```

- [ ] **Step 2: Atualizar `pesquisador-mercado.md`** — na seção de ownership, trocar a menção a `vocabulario-publico.md` por: "enriquece `memory/publico/dores.md` e `objecoes.md` com a fala do público (em contexto)". Atualizar a lista de arquivos que escreve.

- [ ] **Step 3: Atualizar `novo-post/SKILL.md`** — no Passo 10 (copy), onde referencia `vocabulario-publico`, apontar para `memory/publico/dores.md` + `objecoes.md`.

- [ ] **Step 4: Verificar e commitar**

```bash
grep -rn "vocabulario-publico" .claude CLAUDE.md --include="*.md"   # esperado: nenhuma ref ativa em skill/agente
git add -A && git commit -m "refactor(memory): aposenta vocabulario-publico standalone; fala do publico vive em publico/"
```

### Task 1.8: Atualizar as regras operacionais do CLAUDE.md (§5.1 do spec)

**Files:**
- Modify: `CLAUDE.md` (seção "Regras operacionais" + "Banco de Dados" + nota no roster)

- [ ] **Step 1: Substituir a regra de orquestração**

Trocar a linha atual *"Skills orquestram, agentes executam."* por:

```markdown
- **Skills orquestram fluxos; agentes possuem funções.** Uma função pode ser **decisão, memória ou execução** — não só execução. Agentes se coordenam **pela memória (`memory/`), nunca entre si** (princípio blackboard: "a memória é a integração"). Skill define ordem, pausas e formato final; agente recebe contrato isolado de I/O e domina fundo o próprio domínio de decisão (não conhece a orquestração — qual skill chama quem).
```

- [ ] **Step 2: Renomear a seção "Banco de Dados" → "Cérebro de marca (`memory/`)"** e atualizar o texto/caminhos para refletir os slices novos (`narrativas/`, `publico/`, `mercado/` com `narrativa-de-mercado`, `ramon/`, `performance/`, `pesquisa/`) e a regra "a memória é a integração". Ajustar os bullets de slices v1.

- [ ] **Step 3: Verificar e commitar**

```bash
grep -q "a memória é a integração" CLAUDE.md && grep -q "Cérebro de marca" CLAUDE.md && echo OK
git add CLAUDE.md && git commit -m "docs(claude): regras novas (agentes possuem funções; blackboard) + secao Cerebro de marca"
```

### Task 1.9: Verificação final da Onda 1

- [ ] **Step 1: Nenhuma referência ativa a `dados/`**
```bash
grep -rn "dados/" .claude CLAUDE.md scripts site --include="*.md" --include="*.ts" --include="*.tsx" --include="*.js" | grep -vE "\.next|node_modules|memory/pesquisa"
```
Expected: vazio.

- [ ] **Step 2: Estrutura do cérebro completa**
```bash
ls -d memory/narrativas memory/publico memory/mercado memory/ramon memory/performance memory/pesquisa memory/_schema.md
ls -d orquestracao/politicas
```
Expected: tudo existe.

- [ ] **Step 3: Site ainda builda** (`cd site && npm run build` ou `npx tsc --noEmit`). Expected: sem erro.

---

# ONDA 2 — Direção (o diretor de marca)

**Resultado testável ao fim:** existe o agente `estrategista-narrativa` (dono de `memory/narrativas/`) e a skill `/ciclo-de-direcao`; `narrativas/` tem ≥1 arco ativo + roadmap de crença; `/planejar-pauta` lê os arcos ativos e distribui peças que os servem; existe um check de coerência de narrativa no nível da pauta.

> Depende da Onda 1 (slice `narrativas/` + formato). Padrão de contrato de agente: espelhar `.claude/agents/pesquisador-mercado.md` e `analista-performance.md`. Padrão de skill: espelhar `.claude/skills/planejar-pauta-semanal/SKILL.md` (frontmatter + `## Fluxo` + pipeline).

### Task 2.1: Criar o agente `estrategista-narrativa`

**Files:**
- Create: `.claude/agents/estrategista-narrativa.md`
- Read (padrão): `.claude/agents/analista-performance.md` (formato de contrato + ownership de slice)

> Nome provisório (spec §10). Convenção `<função>-<contexto>`.

- [ ] **Step 1: Escrever o contrato** seguindo a estrutura-padrão de agente, com este conteúdo específico:
  - **Frontmatter:** `name: estrategista-narrativa`; `description:` "Owner único do slice `memory/narrativas/`. Lê o cérebro inteiro e decide a direção de narrativa da marca — quais arcos ativar/aposentar, a crença-alvo, e o que saturou. Não produz conteúdo nem revisa copy."; `tools: Read, Write, Edit, Glob, Grep`.
  - **Quem é:** o diretor de marca; governa **significado acumulado**, não peças.
  - **Contexto que carrego:** `brand/brand-book.md`, `brand/pilares-conteudo.md`, `brand/tom-de-voz.md`, e (sob demanda) todo o `memory/`.
  - **Ownership do slice `memory/narrativas/`:** owner único; escreve `ativas.md`, `roadmap-crenca.md`; lê `livro-razao.md` (escrito pelo write-back). Formato em `memory/narrativas/_formato.md`.
  - **Tarefas que executa:** (1) **revisar direção** — ler narrativas ativas + `livro-razao` (saturação) + `performance` + `mercado/narrativa-de-mercado` + `publico` e decidir ativar/aposentar/ajustar arcos; (2) **definir/ajustar roadmap de crença**; (3) **responder coerência** — "este ângulo/pauta serve ou contradiz qual arco ativo?" (inline).
  - **Regra de autonomia:** detectar saturação e propor ajuste = automático; **virar/aposentar narrativa = escala pro humano** (devolve proposta, não aplica).
  - **Recebo / Entrego / Orçamento / Anti-padrões / Input incompleto:** seguir o formato de `analista-performance.md`. Anti-padrões: produzir copy; decidir pauta tática (é da pauta); inventar arco sem sustentação no cérebro.

- [ ] **Step 2: Verificar formato e commitar**
```bash
grep -q "name: estrategista-narrativa" .claude/agents/estrategista-narrativa.md && echo OK
git add .claude/agents/estrategista-narrativa.md && git commit -m "feat(agents): cria estrategista-narrativa (dono de memory/narrativas)"
```

### Task 2.2: Criar a skill `/ciclo-de-direcao`

**Files:**
- Create: `.claude/skills/ciclo-de-direcao/SKILL.md`
- Read (padrão): `.claude/skills/planejar-pauta-semanal/SKILL.md`

> Nome provisório (spec §10).

- [ ] **Step 1: Escrever a skill** com:
  - **Frontmatter:** `name: ciclo-de-direcao`; `description:` "Ciclo periódico de direção de marca. Lê o cérebro inteiro e atualiza `memory/narrativas/` — ativa/aposenta arcos, define crença-alvo, sinaliza saturação. NÃO produz conteúdo. Disparo manual agora; cron/threshold na Onda 5."
  - **`## Fluxo`** (tabela Passo|Agente/Ação|Recebe|Depende|Entrega):
    1. ⚙ reunir estado — caminhos do cérebro.
    2. `estrategista-narrativa` (tarefa: revisar direção) — recebe os caminhos; entrega proposta de mudanças em `ativas.md`/`roadmap-crenca.md`.
    3. ⏸ usuário — aprova ativação/aposentadoria de arco (autonomia: virada de narrativa exige humano).
    4. `estrategista-narrativa` (tarefa: aplicar) — grava as mudanças aprovadas.
    5. ⚙ relatório inline — arcos ativos, crença-alvo do trimestre, o que saturou.
  - **Pipeline:** detalhar cada passo (que arquivos o agente lê; o ponto de pausa; o formato do relatório). Sem produção de conteúdo.

- [ ] **Step 2: Verificar e commitar**
```bash
grep -q "name: ciclo-de-direcao" .claude/skills/ciclo-de-direcao/SKILL.md && echo OK
git add .claude/skills/ciclo-de-direcao && git commit -m "feat(skills): cria /ciclo-de-direcao (direcao de narrativa)"
```

### Task 2.3: Popular `memory/narrativas/` com o 1º arco + roadmap

**Files:**
- Modify: `memory/narrativas/ativas.md`, `memory/narrativas/roadmap-crenca.md`

- [ ] **Step 1: Escrever o arco "Progresso invisível"** em `ativas.md`, no formato de `_formato.md`:

```markdown
### progresso-invisivel
- **estado:** ativa
- **crença-alvo:** o resultado que ainda não aparece não é fracasso — é a parte do processo que ninguém posta.
- **horizonte:** 2026-06 a 2026-08
- **pilares:** Mentalidade, Método
- **canais:** ig, blog, email, comunidade
- **contra (narrativa de mercado):** o atalho / "shape rápido" / resultado atribuído a recurso.
- **mensagens-âncora:**
  - "O resultado é a soma de dias que pareciam não mudar nada."
  - "Você não está travado. Está medindo errado."
  - "O processo não precisa do seu reconhecimento para estar funcionando."
- **última-atividade:** 2026-06-06
```

- [ ] **Step 2: Escrever o roadmap de crença inicial** em `roadmap-crenca.md` (3/6/12 meses), ancorado na espinha filosófica (direção → caminho → identidade) e na crença do arco ativo. Ex.: 3m — "resultado invisível ≠ fracasso"; 6m — "direção vence intensidade"; 12m — "quem eu virei no caminho é o prêmio".

- [ ] **Step 3: Verificar e commitar**
```bash
grep -q "progresso-invisivel" memory/narrativas/ativas.md && echo OK
git add memory/narrativas && git commit -m "feat(memory): popula narrativas/ com arco progresso-invisivel + roadmap de crenca"
```

### Task 2.4: Reposicionar `/planejar-pauta-semanal` como tradução da direção

**Files:**
- Modify: `.claude/skills/planejar-pauta-semanal/SKILL.md`

- [ ] **Step 1: Inserir leitura das narrativas ativas no início do pipeline.** No Passo de geração de briefings, adicionar como entrada obrigatória `memory/narrativas/ativas.md`. A pauta passa a **distribuir peças que servem os arcos ativos**, não só pilares.

- [ ] **Step 2: Cada briefing gerado declara qual narrativa serve.** No esqueleto do briefing (e em `templates/briefing.md` se aplicável), adicionar o campo `narrativa: <slug-do-arco>`. O ângulo de cada post deve avançar a crença-alvo do arco.

- [ ] **Step 3: Atualizar o `## Objetivo` e o `## Fluxo`** da skill pra refletir que a pauta é **downstream da direção** (cita `/ciclo-de-direcao` como a etapa estratégica acima dela).

- [ ] **Step 4: Verificar e commitar**
```bash
grep -q "memory/narrativas/ativas.md" .claude/skills/planejar-pauta-semanal/SKILL.md && echo OK
git add -A && git commit -m "refactor(skills): planejar-pauta vira downstream da direcao (le narrativas ativas)"
```

### Task 2.5: Check de coerência de narrativa (nível pauta)

**Files:**
- Modify: `.claude/skills/planejar-pauta-semanal/SKILL.md` (passo de validação)

- [ ] **Step 1: Adicionar passo de coerência ao fim da pauta.** Depois de gerar os briefings, acionar `estrategista-narrativa` (tarefa: responder coerência) passando a lista de ângulos planejados + as narrativas ativas. Ele devolve, por briefing: `serve <arco>` | `neutro` | `contradiz <arco>`.

- [ ] **Step 2: Regra de ação.** Briefing marcado `contradiz` → a skill sinaliza ao usuário e sugere reâncorar no arco ativo (não publica cego). `neutro` em excesso (ex.: >metade da pauta) → aviso de que a pauta não está construindo narrativa.

- [ ] **Step 3: Verificar e commitar**
```bash
grep -q "coerência" .claude/skills/planejar-pauta-semanal/SKILL.md && echo OK
git add -A && git commit -m "feat(skills): pauta ganha check de coerencia de narrativa (estrategista-narrativa)"
```

### Task 2.6: Verificação final da Onda 2

- [ ] **Step 1: Artefatos existem**
```bash
test -f .claude/agents/estrategista-narrativa.md && test -f .claude/skills/ciclo-de-direcao/SKILL.md && grep -q "progresso-invisivel" memory/narrativas/ativas.md && echo OK
```
- [ ] **Step 2: Dry-run conceitual de `/ciclo-de-direcao`** — abrir a skill e confirmar que o pipeline lê o cérebro, chama `estrategista-narrativa`, pausa pra humano na virada de narrativa, e grava em `memory/narrativas/`. (Execução real interativa = teste de aceitação com o usuário.)
- [ ] **Step 3: `/planejar-pauta` lê narrativas** — confirmar que a skill referencia `memory/narrativas/ativas.md` e que o briefing carrega o campo `narrativa:`.

---

## Self-review (cobertura vs spec)

- §2 (cérebro/slices/rename) → Tasks 1.1–1.8 ✓
- §2.3 (narrativas 3 peças) → Task 1.6 (formato) + 2.3 (popula) ✓
- §2.4 (narrativa de mercado) → Task 1.5 ✓
- §2.5 (publico/dores+objeções, fim do vocabulario standalone) → Tasks 1.4, 1.7 ✓
- §3.3 (direção/gestão de narrativa) → Tasks 2.1, 2.2 ✓
- §3.5 (coerência de narrativa) → Task 2.5 ✓
- §4.4 (pauta downstream) → Task 2.4 ✓
- §5.1 (regras CLAUDE.md) → Task 1.8 ✓
- §4.5 (politicas) → **refinado**: movida (1.1, 1.3), aposentadoria adiada p/ Onda 5 (documentado).
- Write-back (§4.2) e extração de pesquisa (§3.2) → **Onda 3** (fora deste plano, por design).

## Decisões resolvidas neste plano (eram §10 do spec)
- **Schema interno de `narrativas/`** → definido em `memory/narrativas/_formato.md` (Task 1.6).
- **Migração `dados/`→`memory/`** → de uma vez, com `git mv` (Task 1.1), refs atualizadas (1.3).
- **Coerência de narrativa** → nível pauta via `estrategista-narrativa` (Task 2.5); coerência por-peça fica p/ Onda 3 (write-back).
- **Nomes** `estrategista-narrativa` e `/ciclo-de-direcao` → provisórios, confirmar com o usuário.
