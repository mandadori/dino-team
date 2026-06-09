# Setor de Produto — Núcleo (Sub-projeto A) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o setor de Produto vivo (Sub-projeto A) — agente `estrategista-produto`, slice `memory/produto/`, skills `/criar-produto` `/validar-produto` `/evoluir-produto`, governança com 4 gates, ciclo de evolução mensal — e declarar (scaffold) o Sub-projeto B; removendo a skill embrionária `/sinal-consultoria`.

**Architecture:** Brand-OS markdown/YAML (não há runtime de código a testar). Um agente de decisão (dono único do slice `produto/`) é orquestrado por 3 skills; integra com os outros setores **pela memória** (blackboard), nunca por chamada direta. Gates humanos são pausas `⏸` nas skills + flags em `governanca.yaml`. Verificação = checagens estruturais determinísticas (grep/estrutura/YAML), não TDD de código.

**Tech Stack:** Markdown + frontmatter YAML; `.claude/agents/`, `.claude/skills/`, `memory/`, `orquestracao/*.yaml`, `docs/automacao/`. Node ≥18 disponível para checagens. Spec-fonte: `docs/specs/2026-06-08-setor-produto-design.md`.

**Convenção de verificação:** como os artefatos são contratos em prosa, cada task termina com uma **checagem determinística** (arquivo existe + seções/chaves obrigatórias presentes via `grep`) — o equivalente honesto ao "rodar o teste". Onde houver YAML, validar que a chave nova existe e que o arquivo continua parseável.

**Ordem das ondas:**
1. Memória — slice `produto/` + `_schema.md` + fila de pedidos de pesquisa
2. Agente `estrategista-produto`
3. Skills (`/criar-produto`, `/validar-produto`, `/evoluir-produto`)
4. Governança & compliance (`governanca.yaml` + `revisor-brand.md`)
5. Ciclo de evolução (rotina mensal: `rotas.yaml` + `routines.md`)
6. Remoção do `/sinal-consultoria` + limpeza de referências
7. Doc-mestre `CLAUDE.md` (setor vivo + Horizonte B + lista de skills)
8. Sweep de integração (sem refs órfãs; YAML/skills bem-formados)

> **Nota de fronteira (do spec §5.2 / §6.1):** o setor produz **SPEC/blueprint**; o **asset pesado** é delegado (treinador/conteúdo/humano). A **concepção** do blueprint precede a **validação**. **G-ideia** = entre `/criar-produto` e `/validar-produto`; **G-lançamento** = após `/validar-produto`.

---

## Onda 1 — Memória (fundação: o slice que tudo lê/escreve)

### Task 1: Criar o slice `memory/produto/` com os 4 arquivos-semente

**Files:**
- Create: `memory/produto/catalogo.md`
- Create: `memory/produto/oportunidades.md`
- Create: `memory/produto/economia.md`
- Create: `memory/produto/funcao-objetivo.md`

- [ ] **Step 1: Criar `memory/produto/catalogo.md`** (produto vivo inicial = a consultoria)

```markdown
---
slice: produto
owner: estrategista-produto
ultima_atualizacao: 2026-06-08
versao: 1
---

# Catálogo de produtos

Produtos vivos da marca com seu blueprint de oferta e **status de 1ª classe**.
Owner único: `estrategista-produto`. Marketing lê (não escreve) para promover.

**Status (estado de 1ª classe):**
`oportunidade` → `em-validação` → `em-construção` → `ativo` → `em-evolução` → `candidato-a-sunset` → `aposentado`.

Campos do blueprint por produto: tipo · status · dor que resolve (ref `publico/`) ·
público da oferta · promessa/transformação · estrutura/outline · modelo de entrega ·
preço (proposto/aprovado) · verdade da marca servida (ref `brand/brand-book` §Verdades) ·
evidência (refs ao cérebro) · canal de distribuição.

## Produtos

### Consultoria Dino Team
- **Tipo:** serviço (consultoria de treino + dieta personalizada).
- **Status:** `ativo`.
- **Dor que resolve:** dispersão + medo do teto + progresso invisível (ref `publico/dores.md`).
- **Público da oferta:** homens e mulheres 18–40 que treinam e não veem resultado proporcional ao esforço.
- **Promessa:** o método validado por quem saiu do zero absoluto ao topo mundial — direção, não atalho.
- **Estrutura/entrega:** protocolo personalizado + acompanhamento — **operação humanizada** (fora de escopo deste setor; entrega não automatizada).
- **Modelo:** assinatura/serviço recorrente.
- **Preço:** (a confirmar pelo humano em `economia.md`).
- **Verdade servida:** "vende direção, não motivação" (ref `brand/brand-book.md` §Verdades).
- **Canal de distribuição:** Instagram (Ramon + consultoria).
- **Origem:** produto pré-existente (~400 alunos ativos).
```

- [ ] **Step 2: Criar `memory/produto/oportunidades.md`** (vazio, com schema da entrada documentado)

```markdown
---
slice: produto
owner: estrategista-produto
ultima_atualizacao: 2026-06-08
versao: 1
---

# Oportunidades de produto

Oportunidades como **hipóteses testáveis** (não ideias soltas). Cada uma nasce de
evidência do cérebro (`publico/`, `mercado/`, `performance/`) e é rankeada pela
função-objetivo (`funcao-objetivo.md`). O `estrategista-produto` é o único que escreve.

**Schema de uma entrada:**

​```
### <slug-da-oportunidade>
- **Hipótese (JTBD):** quando <situação>, o público quer <progresso>, para <resultado>.
- **Dor de origem:** <ref a publico/dores.md ou objecoes.md>
- **Sizing:** <estimativa grosseira de quantos/quão intenso — com a evidência>
- **Verdade servida:** <slug do brand-book §Verdades>
- **Score (função-objetivo):** fit-marca <0-5> · demanda <0-5> · retorno-risco <0-5> · fit-portfólio <0-5> → <total ponderado>
- **Status:** nova | em-desenho | validando | virou-produto | descartada
- **Evidência:** <refs ao cérebro + data>
​```

## Entradas

_(vazio — populado pela descoberta: rotina mensal de evolução ou `/criar-produto`.)_
```

- [ ] **Step 3: Criar `memory/produto/economia.md`** (mantido pelo humano)

```markdown
---
slice: produto
owner: estrategista-produto
ultima_atualizacao: 2026-06-08
versao: 1
mantido_por: humano
---

# Economia unitária (input humano)

O `estrategista-produto` **lê** este arquivo para propor preço; **não o inventa**.
Premissas de custo/margem por produto, mantidas pelo humano. Sem dado real conectado
(plataforma é externa) — é o piso para precificação até o **Sub-projeto B** destravar
economia real (gatilho: receita/custo conectados pela plataforma + API).

## Por produto

### Consultoria Dino Team
- **Custo unitário (entrega):** (a preencher — ex.: horas de coach/aluno/mês).
- **Margem-alvo:** (a preencher).
- **Preço atual praticado:** (a preencher).

## Premissas gerais
- (a preencher pelo humano — ex.: custo de aquisição via Instagram, capacidade de atendimento.)
```

- [ ] **Step 4: Criar `memory/produto/funcao-objetivo.md`** (mantido pelo humano)

```markdown
---
slice: produto
owner: estrategista-produto
ultima_atualizacao: 2026-06-08
versao: 1
mantido_por: humano
---

# Função-objetivo (input humano)

O que o setor **maximiza** ao rankear oportunidades. Pesos são do humano; o agente
apenas aplica. **Não é receita pura** — preserva a integridade da marca.

## Pesos (somam 1.0)

| Dimensão | Pergunta | Peso |
|---|---|---|
| Fit de marca | serve uma Verdade do `brand-book`? coerente com o brand? | 0.35 |
| Evidência de demanda | intensidade/tamanho da dor validada | 0.35 |
| Retorno ajustado a risco | margem esperada × prob. de validação ÷ esforço | 0.15 |
| Fit de portfólio | não canibaliza, complementa a consultoria | 0.15 |

> Economia entra como **filtro/gate**, não como o que se maximiza, nesta fase.
> Anti-canibalização é gate duro: oportunidade que canibaliza a consultoria sem
> ganho líquido é descartada, não rankeada.

## Orçamento de experimento (guard do G-ideia)

- **Por validação:** (a definir pelo humano — ex.: 1 post/stories + 1 landing; teto de "pedidos de atenção" à audiência por mês).
- Regra: validação **morre por padrão** se não bater o critério de sucesso declarado.
```

- [ ] **Step 5: Verificação determinística**

Run:
```bash
cd "$(git rev-parse --show-toplevel)" && \
for f in catalogo oportunidades economia funcao-objetivo; do \
  test -f "memory/produto/$f.md" && grep -q "slice: produto" "memory/produto/$f.md" \
  && echo "OK $f" || echo "FALHA $f"; done && \
grep -q "Status (estado de 1ª classe)" memory/produto/catalogo.md && echo "OK status-enum" && \
grep -q "Pesos (somam 1.0)" memory/produto/funcao-objetivo.md && echo "OK pesos"
```
Expected: `OK catalogo`, `OK oportunidades`, `OK economia`, `OK funcao-objetivo`, `OK status-enum`, `OK pesos`.

- [ ] **Step 6: Commit**

```bash
git add memory/produto/
git commit -m "feat(produto): cria slice memory/produto/ (catalogo, oportunidades, economia, funcao-objetivo)"
```

---

### Task 2: Criar a fila de pedidos de pesquisa (loop fechado com a Inteligência)

**Files:**
- Create: `memory/pesquisa/pedidos.md`

- [ ] **Step 1: Criar `memory/pesquisa/pedidos.md`**

```markdown
---
slice: pesquisa
owner: pesquisador-mercado
ultima_atualizacao: 2026-06-08
versao: 1
---

# Pedidos de pesquisa (fila — loop fechado)

O `estrategista-produto` **enfileira** aqui lacunas de evidência que precisa para
decidir produto ("existe demanda por X?", "preço do concorrente Y?"). O
`pesquisador-mercado` (via `/pesquisar-tema` ou `/pesquisar-mercado`) **atende** e
marca como respondido — apontando o arquivo de `memory/pesquisa/` gerado. Loop fechado
**pela memória**, sem chamada direta entre setores.

**Schema de um pedido:**

​```
### <slug-do-pedido>
- **Pergunta:** <a lacuna, em 1 frase>
- **Para decidir:** <qual oportunidade/produto depende disso>
- **Solicitante:** estrategista-produto · <data>
- **Status:** aberto | respondido
- **Resposta:** <ref ao arquivo memory/pesquisa/<...>.md quando respondido>
​```

## Pedidos

_(vazio.)_
```

- [ ] **Step 2: Verificação**

Run: `grep -q "Pedidos de pesquisa" memory/pesquisa/pedidos.md && grep -q "owner: pesquisador-mercado" memory/pesquisa/pedidos.md && echo OK`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add memory/pesquisa/pedidos.md
git commit -m "feat(produto): fila de pedidos de pesquisa (loop fechado com inteligencia)"
```

---

### Task 3: Declarar o slice no `_schema.md` + scaffold do Sub-projeto B

**Files:**
- Modify: `memory/_schema.md`

- [ ] **Step 1: Adicionar a linha do slice `produto/` à tabela `## Slices`**

Localizar a linha da tabela que termina o bloco de slices (a linha `pesquisa/`) e inserir **antes** dela:

```markdown
| `produto/` | `estrategista-produto` | `catalogo.md` (produtos vivos + status), `oportunidades.md` (hipóteses testáveis), `economia.md` (humano), `funcao-objetivo.md` (humano) | criado (setor Produto — Sub-projeto A) |
```

- [ ] **Step 2: Substituir a seção "## Integração Produto pelo cérebro (Onda 6)"**

Remover **toda** a seção atual (da heading `## Integração Produto pelo cérebro (Onda 6)` até antes de `## Slices declarados, build depois`) e substituir por:

```markdown
## Setor Produto — integrado pelo cérebro

O setor de Produto tem **slice próprio** (`produto/`, owner `estrategista-produto`) e
**lê** o resto do cérebro para decidir produto (`publico/` dores+objeções, `mercado/`
tendências, `performance/` saturação, `brand/` verdades). Integra com Marketing e
Inteligência **pela memória**, nunca por chamada direta:

| Direção | Como |
|---|---|
| Produto → Inteligência | enfileira lacunas em `pesquisa/pedidos.md`; `pesquisador-mercado` atende (loop fechado) |
| Produto → Marketing | escreve a oferta em `produto/catalogo.md`; `estrategista-mercado` lê para promover |
| Inteligência → Produto | Produto lê `mercado/` + `publico/` na descoberta |

> A skill embrionária `/sinal-consultoria` (canal manual de sinais de consultoria) foi
> **removida** — superada pelo setor de Produto. A **voz direta dos ~400 alunos**
> (dores/objeções/provas reais da base) entra no **Sub-projeto B**, dormente até a
> plataforma conectar.
```

- [ ] **Step 3: Atualizar o frontmatter padrão dos arquivos do cérebro**

Na seção `## Frontmatter padrão dos arquivos do cérebro`, no comentário do campo `slice:`, incluir `produto`:

Trocar `slice: <publico | mercado | ramon | performance | pesquisa>` por
`slice: <publico | mercado | ramon | performance | pesquisa | produto>`.

- [ ] **Step 4: Estender o scaffold do Sub-projeto B**

Na seção `## Slices declarados, build depois (canais de performance)`, acrescentar ao final:

```markdown
### Sub-projeto B — Experiência do Cliente / loop operacional (declarado, dormente)

Declarado para não virar amnésia; **não construir** até o gatilho.

| Capacidade | O que é | Gatilho |
|---|---|---|
| Loop operacional / CX | telemetria de uso, retenção, tempo médio, engajamento, churn, jornada | acesso à plataforma + API |
| Economia unitária real | custo/margem reais alimentando `produto/economia.md` | receita/custo conectados |
| Voz direta do cliente | dores/objeções/provas reais dos ~400 alunos na descoberta (inclui `performance/provas-de-aluno.md`) | plataforma conecta / canal estruturado de captura |

Sem coletor, sem agente, sem skill agora — só esta declaração.
```

- [ ] **Step 5: Atualizar `ultima_atualizacao` e `versao` do frontmatter**

No topo do arquivo, trocar `ultima_atualizacao: 2026-06-08` (manter data) e `versao: 3` → `versao: 4`.

- [ ] **Step 6: Verificação**

Run:
```bash
grep -q "| \`produto/\` |" memory/_schema.md && echo "OK slice-row" && \
grep -q "Setor Produto — integrado pelo cérebro" memory/_schema.md && echo "OK secao-produto" && \
grep -q "Sub-projeto B — Experiência do Cliente" memory/_schema.md && echo "OK scaffold-B" && \
! grep -q "Integração Produto pelo cérebro (Onda 6)" memory/_schema.md && echo "OK secao-antiga-removida" && \
grep -q "versao: 4" memory/_schema.md && echo "OK versao"
```
Expected: `OK slice-row`, `OK secao-produto`, `OK scaffold-B`, `OK secao-antiga-removida`, `OK versao`.

- [ ] **Step 7: Commit**

```bash
git add memory/_schema.md
git commit -m "docs(memory): declara slice produto/ + scaffold Sub-projeto B; remove via /sinal-consultoria"
```

---

## Onda 2 — Agente `estrategista-produto`

### Task 4: Escrever o contrato do agente

**Files:**
- Create: `.claude/agents/estrategista-produto.md`

> Mirror de forma e voz: `.claude/agents/estrategista-mercado.md` (mesmas seções, schema rígido de saída, anti-padding). Conteúdo abaixo é completo — apenas siga.

- [ ] **Step 1: Criar `.claude/agents/estrategista-produto.md`**

```markdown
---
name: estrategista-produto
description: Setor de Produto — descobre oportunidades no cérebro de marca (dores → hipóteses testáveis, sizing), prioriza por função-objetivo (anti-canibalização), arquiteta a oferta e especifica o produto, propõe preço e flaga evolução/sunset. Dono único do slice memory/produto/. Não entrega serviço (humanizado), não produz asset pesado (delega), não publica (gate humano).
tools: Read, Write, Edit, Glob, Grep
---

# Estrategista de Produto

Você é o **estrategista de produto** do Dino Team. Sua especialidade é transformar o que
o cérebro de marca sabe (dores, objeções, tendências, provas, verdades) em **decisões de
produto defensáveis por evidência** — descobrir a oportunidade, priorizá-la, arquitetar a
oferta, propor o preço e cuidar do ciclo de vida (evoluir ou matar).

Você **decide com base em evidência, nunca no escuro**. Não inventa demanda, custo nem
verdade. Você **especifica** (blueprint/spec) — o **asset pesado é de quem tem a
expertise** (treino → `treinador`; copy → produção de conteúdo; entrega de serviço →
humano). Você **não publica**: lançamento e publicação têm gate humano.

## Contexto que carrego

Arquivos lidos automaticamente antes de qualquer tarefa:
- `brand/brand-book.md` — essência e o conjunto canônico de `## Verdades` (toda oferta serve uma).
- `brand/publico-alvo.md` — quem é o leitor, os dois prêmios (Corpo/Identidade).
- `brand/pilares-conteudo.md` — eixos válidos e `## Off-limits` (sem promessa irreal).

Slice que sou dono (leio e **escrevo**):
- `memory/produto/catalogo.md`, `oportunidades.md`, `economia.md` (input humano), `funcao-objetivo.md` (input humano).

Lidos sob demanda (leio, **nunca escrevo**):
- `memory/publico/dores.md` + `objecoes.md` — dor/objeção real (origem das hipóteses).
- `memory/mercado/tendencias/<YYYY-MM>.md` + `concorrentes/*.md` — crença de mercado, benchmark de preço.
- `memory/performance/registro-angulos.md` + `provas-de-aluno.md` (quando existir) — o que ressoou; prova.

Se `brand/brand-book.md` não tiver `## Verdades` → `SEM_VERDADES — rodar /brand-discovery antes`.
Se `funcao-objetivo.md` estiver sem pesos → `SEM_FUNCAO_OBJETIVO — humano deve preencher os pesos`.

## Princípios da especialidade

- **Evidência primeiro.** Toda oportunidade aponta uma dor/objeção/tendência real do cérebro, com `ref`. Sem evidência, é `SEM_SUSTENTACAO`, não oportunidade.
- **A função-objetivo é do humano; você aplica.** Rankeia por `funcao-objetivo.md`. Nunca otimiza receita pura nem reescreve os pesos.
- **Anti-canibalização é gate duro.** Oportunidade que rouba da consultoria sem ganho líquido é descartada, não rankeada.
- **Especifica, não constrói.** Output universal = blueprint/spec. Asset pesado se delega; serviço se entrega humanamente (intocado).
- **Não inventa economia.** Preço é proposto a partir de `economia.md` (humano) + benchmark + valor da oferta. Sem `economia.md`, propõe faixa e marca `(piso de custo a confirmar)`.
- **Mata os próprios filhos.** Em avaliação de ciclo de vida, decide sunset por **valor futuro esperado** — **ignora esforço já investido** (custo afundado).
- **Marca como guard-rail.** Toda oferta cabe num pilar e serve uma verdade. Off-brand → recusa.

## Tipos de tarefa que você executa

A skill declara o modo no campo **Tarefa**.

1. **`descobrir-oportunidade`** — lê o cérebro (recorte dado) → gera/atualiza N hipóteses testáveis (JTBD + dor de origem + sizing grosseiro + verdade servida), rankeadas pela função-objetivo. Escreve/atualiza `oportunidades.md`. Se faltar evidência para decidir, emite linha(s) de **pedido de pesquisa** (output, para a skill enfileirar em `pesquisa/pedidos.md`).
2. **`arquitetar-oferta`** — dada uma oportunidade (slug) + respostas da entrevista → blueprint de oferta (posicionamento, promessa, público da oferta, estrutura/outline, modelo de entrega, **preço proposto**) + verdade servida + evidências. Grava no `catalogo.md` com status `em-validação`.
3. **`desenhar-experimento`** — dado um produto `em-validação` + tipo → desenha o experimento barato (fake-door | landing | concierge) com **orçamento** e **critério de sucesso explícito** (viés morte-por-padrão). Inline (a skill emite o brief e o humano roda).
4. **`avaliar-evolucao`** — dado um produto vivo + sinal fresco (vendas/lista/objeções/tendência) → propõe **evolução** da oferta **ou** flag **`candidato-a-sunset`** (com justificativa por valor futuro, ignorando custo afundado). Inline; a skill leva ao humano.

## Recebo

- **Tarefa:** `descobrir-oportunidade` | `arquitetar-oferta` | `desenhar-experimento` | `avaliar-evolucao`.
- **Inputs:** recorte/pilar (tarefa 1); slug da oportunidade + respostas da entrevista (tarefa 2); slug do produto + tipo de experimento (tarefa 3); slug do produto + sinal observado (tarefa 4).

Sem `Tarefa` claro → `INPUT_INSUFICIENTE — <o que falta>`.

## Entrego

Sem preâmbulo fora do schema.

### `descobrir-oportunidade` — manifesto (escreve em `oportunidades.md`)

​```
oportunidades.md atualizado — <N> hipóteses (<N novas>, <N rerankeadas>).
top: <slug> (score <total>) · <slug> (score <total>) ...
pedidos-de-pesquisa: <slug: pergunta | "nenhum">
​```

### `arquitetar-oferta` — manifesto (escreve em `catalogo.md`)

​```
catalogo.md — "<nome do produto>" gravado status=em-validação.
verdade: <slug> · pilar: <X> · preço-proposto: <faixa> (<base: economia.md|benchmark|valor>)
delegação de asset: <treinador | conteúdo | humano | nenhuma (spec só)>
​```

### `desenhar-experimento` — inline rígido

​```
<experimento produto="<slug>" tipo="fake-door|landing|concierge" orcamento="<...>" criterio_sucesso="<métrica + limiar>" como_rodar="<passos p/ o humano no IG/landing>" mata_se="<condição de morte-por-padrão>" />
​```

### `avaliar-evolucao` — inline rígido

​```
<avaliacao produto="<slug>" recomendacao="evoluir|sunset|manter" porque="<valor futuro esperado — ignora custo afundado>" acao="<mudança de oferta proposta | aposentar>" />
​```

## Orçamento de output

Manifestos ~40–80 palavras. Inline rígido ~60 palavras. Anti-padding: sem preâmbulo, sem eco do input, nada fora do schema.

## Anti-padrões

- Inventar demanda, custo/margem, ou uma "verdade" fora do `## Verdades`.
- Rankear ou maximizar receita pura; reescrever os pesos da função-objetivo.
- Produzir copy de marketing, design, ou asset final de produto (delega).
- Decidir sunset por esforço já investido (custo afundado).
- Escrever em slice que não é seu (`publico/`, `mercado/`, `performance/`).
- Publicar ou prometer canal — lançamento é gate humano.

## Input incompleto

- `INPUT_INSUFICIENTE — <o que falta>` — sem tarefa ou inputs mínimos.
- `SEM_VERDADES` — `brand-book.md` sem `## Verdades`.
- `SEM_FUNCAO_OBJETIVO` — `funcao-objetivo.md` sem pesos.
- `SEM_SUSTENTACAO — <oportunidade>` — proposta sem dor/sinal real no cérebro.
- `CANIBALIZA — <oportunidade>` — rouba de produto existente sem ganho líquido.
- `FORA_DE_PILAR — <oferta>` — não cabe em nenhum pilar declarado.
```

- [ ] **Step 2: Verificação determinística**

Run:
```bash
test -f .claude/agents/estrategista-produto.md && \
grep -q "^name: estrategista-produto" .claude/agents/estrategista-produto.md && \
for s in "Contexto que carrego" "Tipos de tarefa" "## Recebo" "## Entrego" "Anti-padrões" "Input incompleto"; do \
  grep -q "$s" .claude/agents/estrategista-produto.md && echo "OK: $s" || echo "FALTA: $s"; done && \
for t in descobrir-oportunidade arquitetar-oferta desenhar-experimento avaliar-evolucao; do \
  grep -q "$t" .claude/agents/estrategista-produto.md && echo "OK task: $t" || echo "FALTA task: $t"; done
```
Expected: todas as linhas começam com `OK`.

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/estrategista-produto.md
git commit -m "feat(produto): agente estrategista-produto (dono do slice produto/)"
```

---

## Onda 3 — Skills

> Mirror de forma: `.claude/skills/pesquisar-tema/SKILL.md` (frontmatter + `## Fluxo` + Pipeline + `## Critério de conclusão`) e o padrão de pausa `⏸` de `/sinal-consultoria` (antes de ser removida — copie o padrão da memória, não do arquivo). Schema rígido entre skill e agente; a skill só injeta o que varia.

### Task 5: Skill `/criar-produto` (descoberta → estratégia → concepção da oferta)

**Files:**
- Create: `.claude/skills/criar-produto/SKILL.md`

- [ ] **Step 1: Criar `.claude/skills/criar-produto/SKILL.md`**

```markdown
---
name: criar-produto
description: Entrevista guiada que cria um produto ancorado em evidência — pega uma oportunidade (do slice ou ideia nova), confronta com o cérebro de marca, desenha a oferta (posicionamento, promessa, público, estrutura/outline, modelo, preço proposto) e grava o blueprint no catálogo como `em-validação`. Gate revisor-brand. Termina no G-ideia (humano aprova gastar orçamento de validação). Sintaxe — /criar-produto <ideia ou slug de oportunidade> [--tipo <digital|serviço|físico>].
---

# /criar-produto — Dino Team

## Objetivo

Criar um produto **com base sólida de evidências**, não no escuro. Conduz uma entrevista
guiada que parte de uma oportunidade (ou ideia), a confronta com o cérebro, e produz o
**blueprint de oferta**. Cobre os estágios 2·3 + concepção (4a) do pipeline de produto.
**Não constrói asset final** (delegado) e **não valida** (é `/validar-produto`).

## Sintaxe

​```
/criar-produto <ideia ou slug-de-oportunidade> [--tipo <digital|serviço|físico>]
​```

## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ parse | input | — | ideia/slug, tipo |
| 2 | `estrategista-produto` (`descobrir-oportunidade`) | ideia/slug + recorte ← 1 | 1 | oportunidade rankeada em `oportunidades.md`; pedidos de pesquisa (se houver) |
| 2b | ⚙ enfileirar pedido de pesquisa (se houver) | pedidos ← 2 | 2 | entrada em `memory/pesquisa/pedidos.md` |
| 3 | ⏸ entrevista guiada (inline) | oportunidade ← 2 | 2 | respostas: público, restrições, modelo desejado |
| 4 | `estrategista-produto` (`arquitetar-oferta`) | oportunidade + respostas ← 3 | 3 | blueprint no `catalogo.md` status `em-validação` |
| 5 | `revisor-brand` (gate) | blueprint ← 4 | 4 | aprovado / reprovado (identidade + compliance de oferta) |
| 6.⏸ | ⏸ **G-ideia** | blueprint aprovado ← 5 | 5 | humano aprova gastar orçamento de validação |
| 7 | ⚙ relatório inline | ← 6 | 6 | caminho + próximo passo (`/validar-produto`) |

## Pipeline

### 1. Parsear input
- `--tipo <digital|serviço|físico>` → `tipo` (default: inferir na entrevista).
- Restante → `ideia` (texto livre) ou `slug` se bater com uma entrada de `oportunidades.md`.

### 2. Descobrir/ancorar a oportunidade
Acionar `estrategista-produto` com `Tarefa: descobrir-oportunidade`, recorte = a ideia/slug.
O agente confronta com `publico/`, `mercado/`, `performance/`, rankeia pela função-objetivo
e grava em `oportunidades.md`. Se ele devolver `SEM_SUSTENTACAO` → reportar ao usuário e
**parar** (não criar produto sem evidência). Se devolver `pedidos-de-pesquisa` → Passo 2b.

### 2b. Enfileirar pedido de pesquisa (loop fechado)
Para cada pedido devolvido, acrescentar uma entrada em `memory/pesquisa/pedidos.md`
(schema do arquivo) com status `aberto`. Informar ao usuário que há lacuna de evidência —
ele decide seguir mesmo assim (marcando assunção) ou rodar `/pesquisar-tema` antes.

### 3. Entrevista guiada (⏸ inline)
Perguntar, **uma de cada vez** (estilo entrevista — só o que a oportunidade não responde):
público da oferta, transformação prometida, formato/estrutura desejada, modelo de entrega
e restrições. Confrontar respostas com a evidência (apontar tensões, não só transcrever).

### 4. Arquitetar a oferta
Acionar `estrategista-produto` com `Tarefa: arquitetar-oferta`, passando slug + respostas.
Ele grava o blueprint no `catalogo.md` com status `em-validação` e devolve manifesto
(verdade, pilar, preço proposto, delegação de asset).

### 5. Gate de marca (`revisor-brand`)
Acionar `revisor-brand` para validar **copy/oferta + compliance** do blueprint: promessa
lastreada no spec+evidência, ética de preço, compliance de saúde. Reprovado → 1 retry com
o ajuste apontado; 2º fracasso escala ao usuário.

### 6. ⏸ G-ideia (gate humano)
Apresentar o blueprint + o **orçamento de validação** (de `funcao-objetivo.md`) e pedir:
​```
Produto "<nome>" desenhado e aprovado pela marca, status em-validação.
Validar custa: <orçamento de experimento>.
- "sim" → libero para /validar-produto
- "ajustar <campo>: <valor>" → reabro a arquitetura
- "cancelar" → mantenho como oportunidade, sem validar
​```
Autonomia `automatico_com_revisao` (ver `governanca.yaml` → `validacao-produto`).

### 7. Relatório inline
​```
Produto criado: "<nome>" — catalogo.md (status em-validação).
Verdade: <slug> · pilar: <X> · preço proposto: <faixa>.
Próximo: /validar-produto <slug>
​```

## Notas operacionais
- **Sem write-back de `registro-angulos`** — esta skill não produz peça de conteúdo.
- A skill **não escreve** no catálogo — o owner (`estrategista-produto`) escreve. A skill orquestra e enfileira pedidos de pesquisa.
- Ancora no cérebro existente (opção 1 do spec). Voz direta do cliente = Sub-projeto B.

## Critério de conclusão
- `catalogo.md` tem o produto com status `em-validação` e blueprint completo.
- Gate `revisor-brand` aprovado.
- G-ideia resolvido pelo humano (liberado, ajustado ou cancelado).
```

- [ ] **Step 2: Verificação**

Run:
```bash
test -f .claude/skills/criar-produto/SKILL.md && \
grep -q "^name: criar-produto" .claude/skills/criar-produto/SKILL.md && \
grep -q "## Fluxo" .claude/skills/criar-produto/SKILL.md && \
grep -q "G-ideia" .claude/skills/criar-produto/SKILL.md && \
grep -q "estrategista-produto" .claude/skills/criar-produto/SKILL.md && \
grep -q "revisor-brand" .claude/skills/criar-produto/SKILL.md && \
grep -q "## Critério de conclusão" .claude/skills/criar-produto/SKILL.md && echo "OK criar-produto"
```
Expected: `OK criar-produto`

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/criar-produto/
git commit -m "feat(produto): skill /criar-produto (entrevista guiada ancorada em evidencia)"
```

---

### Task 6: Skill `/validar-produto` (experimento barato + G-lançamento)

**Files:**
- Create: `.claude/skills/validar-produto/SKILL.md`

- [ ] **Step 1: Criar `.claude/skills/validar-produto/SKILL.md`**

```markdown
---
name: validar-produto
description: Valida um produto em-validação com um experimento barato (fake-door, landing, concierge) com orçamento e critério de sucesso explícito (viés morte-por-padrão). O humano roda o experimento na audiência do Instagram e reporta; a skill registra passa/morre. Se passa, abre o G-lançamento consolidado (humano aprova construir + preço + distribuição). Sintaxe — /validar-produto <slug> [--tipo <fake-door|landing|concierge>].
---

# /validar-produto — Dino Team

## Objetivo

Provar (ou matar) uma oferta **barato, antes de construir** — o gate mais importante para
a autonomia do setor. Cobre o estágio 4b (validação). A maioria das ideias **deve morrer
aqui**. Roda sobre a audiência existente do Instagram (cold start), sem depender de
plataforma.

## Sintaxe

​```
/validar-produto <slug-do-produto> [--tipo <fake-door|landing|concierge>]
​```

## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ parse + checar status | input | — | produto `em-validação`; tipo |
| 2 | `estrategista-produto` (`desenhar-experimento`) | slug + tipo ← 1 | 1 | brief do experimento (orçamento + critério de sucesso + como rodar + mata-se) |
| 3.⏸ | ⏸ humano roda o experimento | brief ← 2 | 2 | resultado reportado pelo humano (métrica observada) |
| 4 | ⚙ registrar resultado | resultado ← 3 | 3 | `catalogo.md` atualizado: passou ou `aposentado` (com aprendizado) |
| 5.⏸ | ⏸ **G-lançamento** (se passou) | resultado ← 4 | 4 | humano aprova pacote: construir + preço + plano de distribuição |
| 6 | ⚙ relatório inline | ← 5 | 5 | status final + handoff (marketing) ou aprendizado registrado |

## Pipeline

### 1. Parsear + checar status
Resolver `slug` em `catalogo.md`. Se status ≠ `em-validação` →
`STATUS_INVALIDO — produto não está em-validação (atual: <status>)` e parar.

### 2. Desenhar o experimento
Acionar `estrategista-produto` com `Tarefa: desenhar-experimento` (slug + tipo). Recebe o
brief com **orçamento**, **critério de sucesso** (métrica + limiar) e **`mata_se`**
(condição de morte-por-padrão). Sem critério de sucesso explícito → reabrir (não validar
sem limiar).

### 3. ⏸ Humano roda o experimento
Apresentar o brief `como_rodar` e pausar:
​```
Experimento "<tipo>" para "<nome>":
<passos para rodar no IG/landing>
Critério de sucesso: <métrica + limiar>. Mata se: <condição>.

Rode e me diga o resultado (ex: "82 comentários EU QUERO", "12 e-mails na lista", "3 vendas concierge").
​```
Aguardar o resultado real reportado pelo humano. **Não inventar resultado.**

### 4. Registrar resultado (passa/morre)
Comparar resultado vs critério. Acionar `estrategista-produto` para atualizar `catalogo.md`:
- **Passou** → status `em-construção` (aguardando G-lançamento) + linha de evidência (o resultado).
- **Morreu** → status `aposentado` + **aprendizado** (o que o sinal ensinou — vira insumo de descoberta). Reportar e **encerrar** (sem G-lançamento).

### 5. ⏸ G-lançamento (gate humano consolidado)
Só se passou. Apresentar o **pacote** e pedir um único go/no-go:
​```
"<nome>" VALIDADO (<resultado> vs critério <limiar>).
Pacote de lançamento:
- Construir: <o que será produzido + quem (delegação de asset)>
- Preço: <preço proposto — base economia.md/benchmark>
- Distribuição: <plano proposto — canais, sequência, claim principal>

- "sim" → libero construção + handoff de distribuição pro marketing
- "ajustar <campo>: <valor>" → revejo o pacote
- "não" → mantenho aprendizado, não lanço
​```
Autonomia `humano` (ver `governanca.yaml` → `lancamento-produto`). O plano de distribuição
foi **traçado** automaticamente; **nada executa sem este ok**. A publicação peça-a-peça
ainda passa pelo gate mecânico existente (`revisor-brand` + dashboard).

### 6. Relatório inline
​```
<nome>: <VALIDADO e lançado | morreu (aprendizado registrado)>.
<se lançado:> Handoff de distribuição disponível p/ marketing (catalogo.md lido por estrategista-mercado).
<se morreu:> Aprendizado em catalogo.md — alimenta a próxima descoberta.
​```

## Notas operacionais
- **Morte-por-padrão é feature.** Matar barato é o resultado esperado da maioria das validações.
- A skill **não roda** o experimento — emite o brief; o humano executa na audiência e reporta. Sinal real, nunca fabricado.
- Cold start: o canal de validação é o Instagram (Ramon + 400 alunos), independente da plataforma.

## Critério de conclusão
- `catalogo.md` reflete o desfecho: `em-construção` (validado, pós G-lançamento) ou `aposentado` (com aprendizado).
- G-lançamento resolvido pelo humano quando o produto passou.
```

- [ ] **Step 2: Verificação**

Run:
```bash
test -f .claude/skills/validar-produto/SKILL.md && \
grep -q "^name: validar-produto" .claude/skills/validar-produto/SKILL.md && \
grep -q "G-lançamento" .claude/skills/validar-produto/SKILL.md && \
grep -q "morte-por-padrão" .claude/skills/validar-produto/SKILL.md && \
grep -q "desenhar-experimento" .claude/skills/validar-produto/SKILL.md && \
grep -q "## Critério de conclusão" .claude/skills/validar-produto/SKILL.md && echo "OK validar-produto"
```
Expected: `OK validar-produto`

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/validar-produto/
git commit -m "feat(produto): skill /validar-produto (experimento barato + G-lancamento)"
```

---

### Task 7: Skill `/evoluir-produto` (melhoria + sunset)

**Files:**
- Create: `.claude/skills/evoluir-produto/SKILL.md`

- [ ] **Step 1: Criar `.claude/skills/evoluir-produto/SKILL.md`**

```markdown
---
name: evoluir-produto
description: Fecha o loop de ciclo de vida — pega um produto ativo (ou todos), puxa sinal fresco do cérebro (objeções crescentes, vendas, lista, tendências) e propõe evolução da oferta OU flag de sunset (decisão por valor futuro, ignorando custo afundado). Humano decide; sunset tem gate. Sintaxe — /evoluir-produto [<slug> | --todos].
---

# /evoluir-produto — Dino Team

## Objetivo

Manter o catálogo vivo: melhorar o que tem tração e **matar o que não tem** (disciplina de
sunset). Cobre o estágio 7 (melhoria & ciclo de vida) e realimenta a descoberta. É também
o que a **rotina mensal de evolução** invoca.

## Sintaxe

​```
/evoluir-produto [<slug-do-produto> | --todos]
​```

## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ parse + selecionar produtos | input | — | lista de produtos `ativo`/`em-evolução` |
| 2 | `estrategista-produto` (`avaliar-evolucao`) por produto | produtos + sinal ← 1 | 1 | recomendação: evoluir \| sunset \| manter (por valor futuro) |
| 3.⏸ | ⏸ humano decide | recomendações ← 2 | 2 | aprovação por produto (sunset = **G-sunset**) |
| 4 | ⚙ aplicar no `catalogo.md` | decisões ← 3 | 3 | status/oferta atualizados |
| 5 | ⚙ relatório inline | ← 4 | 4 | resumo: evoluídos, aposentados, mantidos |

## Pipeline

### 1. Selecionar produtos
`<slug>` → um produto; `--todos` (ou sem arg, no modo rotina) → todos os `ativo` e
`em-evolução` do `catalogo.md`.

### 2. Avaliar (por produto)
Acionar `estrategista-produto` com `Tarefa: avaliar-evolucao` (slug + sinal fresco do
cérebro: `publico/objecoes.md`, tendências, e qualquer resultado de mercado registrado).
Recebe `recomendacao` (evoluir | sunset | manter) com **justificativa por valor futuro
esperado** — a regra de custo afundado é do contrato do agente.

### 3. ⏸ Humano decide
Apresentar as recomendações. **Sunset exige confirmação explícita (G-sunset):**
​```
<nome>: recomendação <evoluir | SUNSET | manter>
Porquê (valor futuro): <justificativa — ignora esforço já investido>
Ação proposta: <mudança de oferta | APOSENTAR>

- evoluir: "sim" aplica a mudança | "ajustar ..." 
- SUNSET: "matar <slug>" confirma a aposentadoria | "manter" cancela
​```
Autonomia `humano` para sunset (ver `governanca.yaml` → `sunset-produto`).

### 4. Aplicar
Acionar `estrategista-produto` para atualizar `catalogo.md`: evolução → ajusta a oferta e
status `em-evolução`; sunset confirmado → status `aposentado` + motivo. Novas
oportunidades surgidas do sinal → o agente as grava em `oportunidades.md` (realimenta a
descoberta).

### 5. Relatório inline
​```
Ciclo de evolução: <N> avaliados → <N evoluídos>, <N aposentados>, <N mantidos>.
Novas oportunidades: <slugs | nenhuma>.
​```

## Notas operacionais
- **Sinal de melhoria hoje é de mercado** (vendas, lista, objeções do IG). Sinal de **uso** (retenção/churn) entra no Sub-projeto B.
- Invocada manualmente **e** pela rotina mensal (`rotas.yaml` → `evolucao-produto-cron`), que **só sinaliza** — humano decide.
- Sem produto `ativo` → `SEM_PRODUTOS_ATIVOS` (esperado no cold start, antes do 1º lançamento).

## Critério de conclusão
- `catalogo.md` reflete as decisões aprovadas; nenhum sunset sem confirmação humana.
- Novas oportunidades (se houver) registradas em `oportunidades.md`.
```

- [ ] **Step 2: Verificação**

Run:
```bash
test -f .claude/skills/evoluir-produto/SKILL.md && \
grep -q "^name: evoluir-produto" .claude/skills/evoluir-produto/SKILL.md && \
grep -q "G-sunset" .claude/skills/evoluir-produto/SKILL.md && \
grep -q "custo afundado" .claude/skills/evoluir-produto/SKILL.md && \
grep -q "avaliar-evolucao" .claude/skills/evoluir-produto/SKILL.md && \
grep -q "## Critério de conclusão" .claude/skills/evoluir-produto/SKILL.md && echo "OK evoluir-produto"
```
Expected: `OK evoluir-produto`

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/evoluir-produto/
git commit -m "feat(produto): skill /evoluir-produto (melhoria + disciplina de sunset)"
```

---

## Onda 4 — Governança & compliance

### Task 8: Substituir `sinais-produto` por 4 decisões de produto em `governanca.yaml`

**Files:**
- Modify: `orquestracao/governanca.yaml`

- [ ] **Step 1: Remover o bloco `sinais-produto`**

Apagar as linhas (atualmente as últimas decisões antes da Regra-mãe):
```yaml
  - funcao: sinais-produto      # Onda 6 — declarado
    decisao: "o que o aluno trava/pergunta/conquista vira dor/objeção/prova"
    autonomia: humano
    corpo: "/sinal-consultoria (Onda 6)"
```

- [ ] **Step 2: Inserir as 4 decisões do setor de Produto** (no mesmo lugar, antes da linha de comentário `# Regra-mãe`)

```yaml
  - funcao: desenvolvimento-produto
    decisao: "descobrir oportunidade no cérebro + arquitetar a oferta"
    autonomia: automatico_com_revisao   # propor/desenhar = auto; criar de fato passa pelos gates abaixo
    corpo: "agente estrategista-produto (/criar-produto)"

  - funcao: validacao-produto
    decisao: "rodar experimento barato dentro do orçamento (G-ideia)"
    autonomia: automatico_com_revisao   # libera validar = humano no G-ideia; experimento roda na audiência
    corpo: "/validar-produto"

  - funcao: lancamento-produto
    decisao: "construir + precificar + distribuir o produto validado (G-lançamento consolidado)"
    autonomia: humano                    # gate único de lançamento; nada executa sem go/no-go
    corpo: "/validar-produto (G-lançamento) → handoff p/ marketing"

  - funcao: sunset-produto
    decisao: "aposentar um produto (G-sunset)"
    autonomia: humano                    # matar produto exige confirmação; custo afundado ignorado na recomendação
    corpo: "/evoluir-produto (G-sunset)"
```

- [ ] **Step 3: Verificação (chaves presentes/ausentes + YAML parseável)**

Run:
```bash
! grep -q "sinais-produto" orquestracao/governanca.yaml && echo "OK removido" && \
for k in desenvolvimento-produto validacao-produto lancamento-produto sunset-produto; do \
  grep -q "funcao: $k" orquestracao/governanca.yaml && echo "OK $k" || echo "FALTA $k"; done && \
node -e "const fs=require('fs');const t=fs.readFileSync('orquestracao/governanca.yaml','utf8');if(!/^\t/m.test(t))console.log('OK sem-tabs')"
```
Expected: `OK removido`, `OK desenvolvimento-produto`, `OK validacao-produto`, `OK lancamento-produto`, `OK sunset-produto`, `OK sem-tabs`.

> Se houver `python3` com pyyaml: `python3 -c "import yaml;yaml.safe_load(open('orquestracao/governanca.yaml'));print('OK yaml')"`.

- [ ] **Step 4: Commit**

```bash
git add orquestracao/governanca.yaml
git commit -m "feat(produto): governanca dos 4 gates de produto; remove sinais-produto"
```

---

### Task 9: Estender o `revisor-brand` com compliance de produto/oferta

**Files:**
- Modify: `.claude/agents/revisor-brand.md`

- [ ] **Step 1: Inspecionar o arquivo e localizar a seção de compliance**

Run: `grep -n "compliance\|Compliance\|claim\|saúde\|proibid" .claude/agents/revisor-brand.md | head -20`

Identificar a seção/checklist de compliance existente (claims de saúde/resultado).

- [ ] **Step 2: Acrescentar a subseção de compliance de produto**

Inserir, logo após o checklist de compliance existente, este bloco (ajustar a heading ao nível usado no arquivo):

```markdown
### Compliance de produto/oferta

Quando o artefato é uma **oferta/blueprint de produto** (vindo de `/criar-produto`),
além do compliance de saúde, validar:

1. **Claim lastreado:** toda promessa da oferta está suportada pelo spec + evidência do cérebro. Reprovar claim que a oferta não entrega.
2. **Ética de preço:** sem dark pattern, sem escassez falsa, sem precificação enganosa.
3. **Promessa de resultado:** sem transformação física irreal nem garantia de resultado (regra de saúde já vigente).

Reprovar (não "aprovar com ajustes") se qualquer item falhar.
```

- [ ] **Step 3: Verificação**

Run:
```bash
grep -q "Compliance de produto/oferta" .claude/agents/revisor-brand.md && \
grep -q "Claim lastreado" .claude/agents/revisor-brand.md && \
grep -q "Ética de preço" .claude/agents/revisor-brand.md && echo "OK revisor-brand"
```
Expected: `OK revisor-brand`

- [ ] **Step 4: Commit**

```bash
git add .claude/agents/revisor-brand.md
git commit -m "feat(produto): estende revisor-brand com compliance de produto/oferta"
```

---

## Onda 5 — Ciclo de evolução (rotina mensal)

### Task 10: Adicionar a rota `evolucao-produto-cron` em `rotas.yaml`

**Files:**
- Modify: `orquestracao/rotas.yaml`

- [ ] **Step 1: Acrescentar a rota ao final do bloco `rotas:`**

```yaml
  - id: evolucao-produto-cron
    trigger:
      tipo: cron
      schedule: "0 9 5 * *"          # dia 5 de cada mês às 9h (TZ: America/Sao_Paulo)
      timezone: America/Sao_Paulo
    skill: /evoluir-produto
    args:
      escopo: --todos                 # varre todos os produtos ativos; SÓ sinaliza, humano decide
    notificacao:
      sucesso: dashboard
      falha: dashboard
    ativa: true
```

- [ ] **Step 2: Verificação**

Run:
```bash
grep -q "evolucao-produto-cron" orquestracao/rotas.yaml && \
grep -q "/evoluir-produto" orquestracao/rotas.yaml && \
node -e "const fs=require('fs');const t=fs.readFileSync('orquestracao/rotas.yaml','utf8');if(!/^\t/m.test(t))console.log('OK sem-tabs')" && echo "OK rota"
```
Expected: `OK sem-tabs`, `OK rota`

- [ ] **Step 3: Commit**

```bash
git add orquestracao/rotas.yaml
git commit -m "feat(produto): rota mensal de evolucao (evolucao-produto-cron)"
```

---

### Task 11: Documentar a rotina em `docs/automacao/routines.md`

**Files:**
- Modify: `docs/automacao/routines.md`

- [ ] **Step 1: Ler o arquivo para casar o formato das rotinas existentes**

Run: `sed -n '1,80p' docs/automacao/routines.md` (entender como pauta-semanal e pesquisar-mercado são documentadas).

- [ ] **Step 2: Adicionar a entrada da rotina de evolução**

Seguindo exatamente o formato das rotinas existentes (mesma estrutura de seção que `pesquisar-mercado`), documentar:
- **id:** `evolucao-produto-cron`
- **Quando:** dia 5 de cada mês, 9h (America/Sao_Paulo).
- **Dispara:** `/evoluir-produto --todos`.
- **O que faz:** varre o catálogo + cérebro, propõe evoluções e flags de sunset. **Só sinaliza** — humano decide no gate. Sem produto `ativo`, retorna `SEM_PRODUTOS_ATIVOS` (esperado no cold start).
- **Notificação:** dashboard (sucesso/falha).

- [ ] **Step 3: Verificação**

Run: `grep -q "evolucao-produto-cron" docs/automacao/routines.md && grep -q "só sinaliza\|Só sinaliza\|SÓ sinaliza" docs/automacao/routines.md && echo OK`
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add docs/automacao/routines.md
git commit -m "docs(automacao): documenta rotina mensal de evolucao de produto"
```

---

## Onda 6 — Remoção do `/sinal-consultoria` + limpeza de referências

### Task 12: Remover a skill e limpar as referências nos agentes

**Files:**
- Delete: `.claude/skills/sinal-consultoria/` (diretório)
- Modify: `.claude/agents/treinador.md`
- Modify: `.claude/agents/pesquisador-mercado.md`
- Modify: `.claude/agents/analista-performance.md`

- [ ] **Step 1: Remover o diretório da skill**

```bash
git rm -r .claude/skills/sinal-consultoria/
```

- [ ] **Step 2: Limpar `treinador.md`**

Remover a seção inteira `## Sinais ao cérebro (via /sinal-consultoria)` (da heading até antes de `## Recebo`). Em seu lugar, **uma linha** que preserva a intenção:

```markdown
> Sinais reais de consultoria (dor/objeção/prova de aluno) alimentam o cérebro pelo **Sub-projeto B** do setor de Produto (dormente até a plataforma conectar) — não há canal manual ativo.
```

- [ ] **Step 3: Limpar `pesquisador-mercado.md`** (linha ~33)

Trocar exatamente:
`Entradas podem chegar via **`/sinal-consultoria`** — a skill roteia sinais reais da consultoria (aluno trava = dor; pergunta recorrente = objeção) como propostas formatadas, já aprovadas pelo usuário. Ao receber uma dessas propostas, incorporo a entrada ao slice sem alterar as entradas existentes, e atualizo `ultima_atualizacao` no frontmatter.`
por:
`Sinais reais da consultoria (aluno trava = dor; pergunta recorrente = objeção) entrarão como propostas formatadas pelo **Sub-projeto B** do setor de Produto (dormente até a plataforma conectar). Ao receber uma proposta aprovada pelo usuário, incorporo a entrada ao slice sem alterar as existentes, e atualizo `ultima_atualizacao` no frontmatter.`

- [ ] **Step 4: Limpar `analista-performance.md`** (linhas ~32 e ~50)

Trocar exatamente (linha ~32):
`- `memory/performance/provas-de-aluno.md` — provas reais de aluno via `/sinal-consultoria` (crie com frontmatter padrão se não existir).`
por:
`- `memory/performance/provas-de-aluno.md` — provas reais de aluno via o **Sub-projeto B** do setor de Produto (dormente; crie com frontmatter padrão se não existir).`

Trocar exatamente (linha ~50):
`4. **Registrar prova de aluno** — resultado real de consultoria proposto via `/sinal-consultoria`. Serve o pilar Transformação / Prova viva. Grava em `memory/performance/provas-de-aluno.md` (crie com frontmatter padrão se não existir). A prova é de aluno real — não inventar dado.`
por:
`4. **Registrar prova de aluno** — resultado real de consultoria proposto pelo **Sub-projeto B** do setor de Produto (dormente até a plataforma conectar). Serve o pilar Transformação / Prova viva. Grava em `memory/performance/provas-de-aluno.md` (crie com frontmatter padrão se não existir). A prova é de aluno real — não inventar dado.`

- [ ] **Step 5: Verificação (nenhuma ref viva ao `/sinal-consultoria` nos agentes/skills)**

Run:
```bash
! grep -rIl "sinal-consultoria" .claude/ && echo "OK .claude limpo" && \
test ! -d .claude/skills/sinal-consultoria && echo "OK skill removida" && \
grep -q "Sub-projeto B" .claude/agents/treinador.md && echo "OK treinador atualizado"
```
Expected: `OK .claude limpo`, `OK skill removida`, `OK treinador atualizado`.

- [ ] **Step 6: Commit**

```bash
git add -A .claude/
git commit -m "refactor(produto): remove /sinal-consultoria (superada); limpa refs nos agentes"
```

---

## Onda 7 — Doc-mestre `CLAUDE.md`

### Task 13: Atualizar `CLAUDE.md` (setor Produto vivo + skills + Horizonte B)

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Atualizar a lista de skills — adicionar as 3, remover `/sinal-consultoria`**

Na seção `### 2. Skills`, no grupo "Produto — integração pelo cérebro", substituir a entrada do `/sinal-consultoria` por um novo bloco do setor de Produto:

```markdown
_Produto — desenvolvimento e evolução (Sub-projeto A):_
- [`/criar-produto`](.claude/skills/criar-produto/SKILL.md) — entrevista guiada ancorada em evidência → blueprint de oferta no `catalogo.md` (status `em-validação`). Gate `revisor-brand` + G-ideia.
- [`/validar-produto`](.claude/skills/validar-produto/SKILL.md) — experimento barato (fake-door/landing/concierge) na audiência do Instagram; morte-por-padrão; G-lançamento consolidado.
- [`/evoluir-produto`](.claude/skills/evoluir-produto/SKILL.md) — melhoria + disciplina de sunset (custo afundado); invocada também pela rotina mensal de evolução.
```

- [ ] **Step 2: Atualizar a descrição do agente no roster**

Na seção `### 3. Agentes`, no grupo **Produto**, acrescentar o agente novo (mantendo `treinador`):

```markdown
- **Produto / Desenvolvimento & Evolução**
  - [`estrategista-produto`](.claude/agents/estrategista-produto.md) — descobre oportunidades no cérebro, prioriza por função-objetivo (anti-canibalização), arquiteta oferta, propõe preço, flaga evolução/sunset. Dono único de `memory/produto/`.
- **Produto / Consultoria / Execução**
  - [`treinador`](.claude/agents/treinador.md) — decisões técnicas de treino (entrega humanizada).
```

Atualizar a contagem "**Agentes atuais (11):**" → "**Agentes atuais (12):**".

- [ ] **Step 3: Atualizar a seção do slice `produto/` em "### 4. Cérebro de marca"**

Onde diz "Setor Produto — integrado pelo cérebro: ... Produto não tem slice próprio", substituir por:

```markdown
**Setor Produto — desenvolvimento e evolução (Sub-projeto A):** tem slice próprio `memory/produto/` (owner `estrategista-produto`: `catalogo.md`, `oportunidades.md`, `economia.md` e `funcao-objetivo.md` — os dois últimos mantidos pelo humano). Lê `publico/` + `mercado/` + `performance/` + `brand/` para decidir produto; integra com Inteligência e Marketing **pela memória** (fila `pesquisa/pedidos.md`; oferta lida no `catalogo.md`). O `treinador` segue como entrega técnica humanizada. A skill `/sinal-consultoria` foi removida.
```

Acrescentar `produto/` à lista de **Slices:**:
```markdown
- `memory/produto/` — `catalogo.md` (produtos vivos + status), `oportunidades.md` (hipóteses testáveis), `economia.md` + `funcao-objetivo.md` (input humano) (owner: `estrategista-produto`).
```

- [ ] **Step 4: Atualizar o "Horizonte declarado"**

Na tabela do `## Horizonte declarado`, **substituir** a linha "Setor Produto vivo" por (o núcleo agora foi construído; o que resta é o loop operacional):

```markdown
| Loop operacional de Produto (Sub-projeto B) | telemetria de uso, retenção, tempo médio, engajamento, churn, CX + economia unitária real + voz direta dos alunos na descoberta | acesso à plataforma da consultoria + API |
```

- [ ] **Step 5: Verificação**

Run:
```bash
for s in criar-produto validar-produto evoluir-produto estrategista-produto "memory/produto/" "Sub-projeto B"; do \
  grep -q "$s" CLAUDE.md && echo "OK $s" || echo "FALTA $s"; done && \
! grep -q "sinal-consultoria" CLAUDE.md && echo "OK sem-sinal" && \
grep -q "Agentes atuais (12)" CLAUDE.md && echo "OK contagem"
```
Expected: todas `OK`.

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(arquitetura): setor Produto vivo no doc-mestre + Horizonte B + skills"
```

---

## Onda 8 — Sweep de integração

### Task 14: Verificação final do sistema

**Files:** (somente leitura/checagem)

- [ ] **Step 1: Nenhuma referência viva órfã ao `/sinal-consultoria`**

Run:
```bash
grep -rIl "sinal-consultoria" . --include="*.md" --include="*.yaml" | grep -v "docs/plans/\|docs/specs/\|.claude/worktrees/"
```
Expected: **nenhuma saída** (só `docs/plans/` e `docs/specs/` históricos podem citar — esses são arquivais, não tocar).

- [ ] **Step 2: Todos os novos arquivos de memória têm frontmatter válido**

Run:
```bash
for f in memory/produto/catalogo.md memory/produto/oportunidades.md memory/produto/economia.md memory/produto/funcao-objetivo.md memory/pesquisa/pedidos.md; do \
  head -1 "$f" | grep -q "^---$" && echo "OK fm $f" || echo "FALTA fm $f"; done
```
Expected: `OK fm` para os 5.

- [ ] **Step 3: As 3 skills e o agente carregam (frontmatter `name` correto)**

Run:
```bash
for s in criar-produto validar-produto evoluir-produto; do \
  grep -q "^name: $s" .claude/skills/$s/SKILL.md && echo "OK skill $s" || echo "FALTA $s"; done && \
grep -q "^name: estrategista-produto" .claude/agents/estrategista-produto.md && echo "OK agente"
```
Expected: `OK skill criar-produto`, `OK skill validar-produto`, `OK skill evoluir-produto`, `OK agente`.

- [ ] **Step 4: YAML de orquestração sem tabs (parseável)**

Run:
```bash
for y in orquestracao/governanca.yaml orquestracao/rotas.yaml; do \
  node -e "const t=require('fs').readFileSync('$y','utf8');process.exit(/^\t/m.test(t)?1:0)" && echo "OK $y" || echo "TAB EM $y"; done
```
Expected: `OK orquestracao/governanca.yaml`, `OK orquestracao/rotas.yaml`.

- [ ] **Step 5: Coerência de nomes (status, gates, tarefas) entre artefatos**

Run:
```bash
echo "status enum em catalogo:" && grep -c "em-validação\|em-construção\|candidato-a-sunset" memory/produto/catalogo.md && \
echo "G-ideia em criar + governanca:" && grep -l "G-ideia" .claude/skills/criar-produto/SKILL.md && grep -l "validacao-produto" orquestracao/governanca.yaml && \
echo "tarefas do agente referenciadas nas skills:" && \
grep -q "descobrir-oportunidade\|arquitetar-oferta" .claude/skills/criar-produto/SKILL.md && \
grep -q "desenhar-experimento" .claude/skills/validar-produto/SKILL.md && \
grep -q "avaliar-evolucao" .claude/skills/evoluir-produto/SKILL.md && echo "OK coerencia"
```
Expected: termina com `OK coerencia`.

- [ ] **Step 6: Commit final (se o sweep tiver corrigido algo) e fechamento**

Se algum step revelou inconsistência, corrigir no arquivo-fonte e re-rodar. Quando tudo passar:
```bash
git add -A && git commit -m "chore(produto): sweep de integracao do setor de Produto" --allow-empty
```

---

## Notas de execução

- **Não é TDD de código** — os artefatos são contratos em prosa; a "falha→implementação→passa" vira "escrever artefato → checagem estrutural determinística". As checagens (grep/estrutura/YAML) são reais e devem passar.
- **Sub-projeto B é só declaração** (Task 3 Step 4 + Task 13 Step 4). Não construir coletor/telemetria.
- **Ordem importa:** Onda 1 (memória) antes de tudo, porque agente e skills referenciam os arquivos do slice. Onda 6 (remoção) depois das ondas que estabelecem o substituto. Onda 7 (CLAUDE.md) por último entre as de escrita, para refletir o estado final.
- **Após a execução:** rodar um smoke real de `/criar-produto` com uma ideia adjacente à consultoria (ex.: "desafio de 30 dias") e validar o fluxo ponta-a-ponta até o G-ideia — fora do escopo deste plano (é teste de aceitação manual).
