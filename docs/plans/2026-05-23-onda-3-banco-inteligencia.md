# Onda 3 — Banco de Inteligência Mínimo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar memória persistente compartilhada ao sistema. Implementar o Banco de Inteligência em markdown + frontmatter YAML com 3 slices declarados (`ramon/`, `mercado/`, `performance/`), schema versionado v1, e o primeiro agente owner (`archivist-ramon`). Renomear `pesquisa-tendencias` → `pesquisador-mercado` agora que ele tem slice atribuído. Adaptar `briefing-writer` para consultar o banco antes de produzir briefing. Criar a skill `/atualizar-ramon` para Bruno popular `ramon/` interativamente.

**Architecture:**
- Banco em `inteligencia/`, criado como pasta-placeholder vazia na Onda 1. Schema declarado em `_schema.md` na raiz: lista slices, owners, versão.
- **Ownership único por slice** — só o agente declarado owner escreve naquele slice; qualquer agente lê. Isso evita o banco virar lixo cumulativo.
- **YAGNI rigoroso nos slices:** só populamos os arquivos que a Onda 4+ realmente vai consultar. `performance/social-media/*`, `performance/ads/*`, etc. ficam para quando publicação real estiver rodando (Onda 5+).
- `briefing-writer` ganha um passo de leitura prévia: `ramon/cronograma.md`, `ramon/fase-atual.md`, `performance/angulos-queimados.md`. Não escreve no banco — só lê. O archivist é quem consolida o que vem do `briefing-writer` (via output) para `ramon/` quando aplicável.
- A primeira entrada de `ramon/fase-atual.md` vem **do usuário** via `/atualizar-ramon`, não inventada pelo agente.

**Spec de referência:** [docs/specs/2026-05-22-arquitetura-multi-setor-design.md §4.2 e §6.4](../specs/2026-05-22-arquitetura-multi-setor-design.md)

**Dependência:** Ondas 1 e 2 concluídas.

**Invariantes:**
- Skills `/novo-post`, `/lote-posts`, `/novo-estilo`, `/brand-discovery` continuam funcionando ao final.
- `pesquisador-mercado` é resolvível em todos os lugares onde `pesquisa-tendencias` era invocado.
- Conteúdo factual de `ramon/` é responsabilidade do usuário (Bruno) — agentes não inventam dados pessoais do Ramon.

---

## File Structure

### Arquivos criados — schema e slices

| Arquivo | Responsabilidade |
|---|---|
| `inteligencia/_schema.md` | Manifest do banco: slices, owners, versão (v1), regras de ownership |
| `inteligencia/ramon/cronograma.md` | Linha do tempo de compromissos/marcos do Ramon (campeonatos, viagens, fases) |
| `inteligencia/ramon/fase-atual.md` | Fase atual do Ramon (off-season, prep, prep avançada, peak week, pós-campeonato). Atualizado por `/atualizar-ramon` |
| `inteligencia/mercado/vocabulario-publico.md` | Glossário do vocabulário do leitor (derivado de `brand/publico-alvo.md` na Onda 3; cresce com pesquisas) |
| `inteligencia/performance/angulos-queimados.md` | Lista de ângulos já usados que precisam de descanso antes de voltar; vazio inicialmente, populado por `revisor-coerencia` ao longo do tempo |

### Arquivos criados — agentes e skills

| Arquivo | Responsabilidade |
|---|---|
| `.claude/agents/transversais/inteligencia/archivist-ramon.md` | Owner único do slice `ramon/`. Consolida informações novas em `cronograma.md` / `fase-atual.md`. Não inventa fatos; valida com o usuário. |
| `.claude/skills/atualizar-ramon/SKILL.md` | Skill interativa para Bruno atualizar `ramon/` |

### Arquivos renomeados

| Origem | Destino |
|---|---|
| `.claude/agents/marketing/pesquisa/pesquisa-tendencias.md` | `.claude/agents/marketing/pesquisa/pesquisador-mercado.md` (rename + edit do `name:` no frontmatter + adicionar parágrafo de ownership do slice `mercado/`) |

### Arquivos modificados

| Arquivo | Modificação |
|---|---|
| `.claude/agents/marketing/estrategia/briefing-writer.md` | Adicionar leitura prévia obrigatória de `inteligencia/ramon/cronograma.md`, `inteligencia/ramon/fase-atual.md` e `inteligencia/performance/angulos-queimados.md` antes de produzir briefing |
| `.claude/skills/novo-post/SKILL.md` | Trocar todas as menções de `pesquisa-tendencias` por `pesquisador-mercado` (tabela de agentes, P2a, P7) |
| `.claude/skills/lote-posts/SKILL.md` | Idem (tabela, Passos 3 e 4) |
| `CLAUDE.md` | Atualizar bullet do agente Marketing/Pesquisa para `pesquisador-mercado`; adicionar `archivist-ramon` em Transversais/Inteligência; adicionar `/atualizar-ramon` na lista de skills |

---

## Tasks

---

### Task 1: Criar `inteligencia/_schema.md` (manifest do banco, v1)

**Files:**
- Create: `inteligencia/_schema.md`
- Delete: `inteligencia/.gitkeep` (não é mais placeholder)

- [ ] **Step 1: Criar o schema com o conteúdo abaixo**

```markdown
---
versao: 1
ultima_atualizacao: 2026-05-23
---

# Banco de Inteligência — Schema

Memória persistente compartilhada do sistema Dino Team. Markdown com frontmatter YAML. Lido por qualquer agente; escrito apenas pelo owner declarado.

## Princípios

- **Ownership único por slice.** Só o agente declarado owner escreve. Outros propõem via output e o owner consolida.
- **Versionado em git.** Toda mudança é commit.
- **Escala em markdown enquanto possível.** Migra para SQL apenas quando volume passar de ~100MB ou queries ficarem lentas (decisão do `keeper-banco`, agente futuro).
- **Leitura sob demanda.** Quem precisa, lê. Nada é carregado automaticamente.

## Slices ativos (v1)

| Slice | Caminho | Owner único | Conteúdo |
|---|---|---|---|
| **Ramon** | `inteligencia/ramon/` | `archivist-ramon` | Contexto temporal e biográfico do Ramon: cronograma, fase atual, princípios de treino, falas, conquistas, acervo visual. Fonte: Bruno via `/atualizar-ramon`. Agentes nunca inventam. |
| **Mercado** | `inteligencia/mercado/` | `pesquisador-mercado` | Pesquisa de mercado, concorrentes, tendências, vocabulário do público. Populado por pesquisas profundas. |
| **Performance** | `inteligencia/performance/` | múltiplos analistas (definidos por sub-slice) | Métricas de canais (social media, ads, email, funil-site), ângulos queimados, padrões identificados. **Onda 3 só popula `angulos-queimados.md` (cooperativo, owner: `revisor-coerencia`); resto fica para quando publicação real existir.** |

## Arquivos populados em v1 (Onda 3)

```
inteligencia/
├── _schema.md                           ← este arquivo
├── ramon/
│   ├── cronograma.md                    ← preenchido por Bruno via /atualizar-ramon
│   └── fase-atual.md                    ← preenchido por Bruno via /atualizar-ramon
├── mercado/
│   └── vocabulario-publico.md           ← derivado de brand/publico-alvo.md
└── performance/
    └── angulos-queimados.md             ← vazio em v1; cresce ao longo do uso
```

## Arquivos futuros (declarados, não criados em v1)

Conforme volume justificar:
- `ramon/acervo-visual.md`, `ramon/falas-citacoes.md`, `ramon/historico-conquistas.md`, `ramon/principios-treino.md`
- `mercado/tendencias/<YYYY-MM>.md`, `mercado/concorrentes/<slug>.md`, `mercado/hashtags-performando.md`
- `performance/social-media/<YYYY-MM>.md`, `performance/ads/<YYYY-MM>.md`, `performance/email/<YYYY-MM>.md`, `performance/funil-site/<YYYY-MM>.md`, `performance/padroes-identificados.md`

Criar apenas quando uma skill real for consumir.

## Regras de ownership

- Owner **único** por slice (ou por sub-slice quando explicitado, como em `performance/<canal>`).
- Owner **escreve**; outros **leem e propõem**.
- Proposta vira pull (manual ou via skill) feita pelo owner.
- Mudança de owner exige atualização deste schema + commit.

## Frontmatter padrão para arquivos do banco

Cada arquivo do banco deve ter no topo:

```yaml
---
slice: <ramon | mercado | performance>
owner: <nome do agente owner>
ultima_atualizacao: YYYY-MM-DD
versao: 1
---
```

## Migração futura

Se em algum momento for migrar para SQL/outro armazenamento, este schema é o ponto de entrada da migração — declara a estrutura semântica que o novo armazenamento precisa replicar.
```

- [ ] **Step 2: Remover o `.gitkeep` que estava em `inteligencia/`**

```bash
rm -f inteligencia/.gitkeep
```

- [ ] **Step 3: Verificar**

```bash
ls -la inteligencia/
```

Esperado: vê `_schema.md` (e nenhum `.gitkeep`).

- [ ] **Step 4: Não commitar ainda** — commit unificado da onda.

---

### Task 2: Criar o slice `inteligencia/ramon/` com templates vazios

**Files:**
- Create: `inteligencia/ramon/cronograma.md`
- Create: `inteligencia/ramon/fase-atual.md`

**Importante:** o conteúdo factual desses arquivos vem do usuário (Bruno) via `/atualizar-ramon` (Task 8). Nesta task, criamos os templates com frontmatter e um corpo "preencher via /atualizar-ramon".

- [ ] **Step 1: Criar `cronograma.md`**

```markdown
---
slice: ramon
owner: archivist-ramon
ultima_atualizacao: 2026-05-23
versao: 1
---

# Cronograma do Ramon

Linha do tempo de compromissos, marcos e fases — usada por `briefing-writer` para situar o conteúdo no momento do Ramon.

## Estrutura

Cada entrada:

```
- **YYYY-MM-DD** (ou faixa YYYY-MM) — <descrição em 1 linha>
  - Tipo: campeonato | viagem | conteúdo gravado | fase | marco pessoal
  - Status: confirmado | provável | passado
```

## Entradas

_(Preencher via `/atualizar-ramon`. Sem entradas em v1.)_
```

- [ ] **Step 2: Criar `fase-atual.md`**

```markdown
---
slice: ramon
owner: archivist-ramon
ultima_atualizacao: 2026-05-23
versao: 1
---

# Fase atual do Ramon

Onde o Ramon está agora — off-season, prep, prep avançada, peak week, pós-campeonato, transição. Usada por `briefing-writer` para calibrar o tom e o ângulo do conteúdo.

## Fase

_(Preencher via `/atualizar-ramon`. Em v1 ainda não definido — pipeline funciona, mas briefing-writer não conta com este sinal.)_

## Sinalizações para o pipeline (quando fase definida)

- **Vocabulário:** termos típicos da fase ("manutenção calórica", "depleção", "peak", etc.).
- **Tom:** quão técnico/educacional vs. inspiracional cabe agora.
- **Restrições editoriais:** o que NÃO conversar agora (ex: durante peak week, evitar conteúdo que sugira mudança de protocolo).

## Última revisão

_Data: 2026-05-23 — template criado, conteúdo pendente._
```

- [ ] **Step 3: Verificar**

```bash
ls -la inteligencia/ramon/
head -8 inteligencia/ramon/fase-atual.md
```

Esperado: 2 arquivos com frontmatter correto.

- [ ] **Step 4: Não commitar ainda.**

---

### Task 3: Criar o slice `inteligencia/mercado/vocabulario-publico.md` derivado de `brand/publico-alvo.md`

**Files:**
- Create: `inteligencia/mercado/vocabulario-publico.md`

**Estratégia:** ler `brand/publico-alvo.md`, extrair os termos/jargões/dores declarados, e popular o arquivo do banco como ponto de partida. Owner do slice é `pesquisador-mercado` (após rename na Task 5).

- [ ] **Step 1: Ler `brand/publico-alvo.md` para extrair termos**

```bash
cat brand/publico-alvo.md
```

(Use Read tool no Claude Code.)

Esperado: identificar listas de jargões, vocabulário típico, dores recorrentes. Se o arquivo estiver vazio ou superficial, criar o template com nota "preencher na primeira pesquisa profunda" e seguir.

- [ ] **Step 2: Criar `vocabulario-publico.md` com o conteúdo extraído + template para crescimento**

Conteúdo de `inteligencia/mercado/vocabulario-publico.md`:

```markdown
---
slice: mercado
owner: pesquisador-mercado
ultima_atualizacao: 2026-05-23
versao: 1
fonte_inicial: brand/publico-alvo.md
---

# Vocabulário do público

Termos, jargões e expressões que o leitor da marca usa. Fonte da verdade para `copywriter` ("linguagem do público"), `pesquisador-mercado` (recorte) e `briefing-writer` (recorte de público).

## Termos centrais

_(Extraídos de `brand/publico-alvo.md` na criação. Atualize quando uma pesquisa profunda trouxer novos termos.)_

- _(preencher a partir do conteúdo declarado em brand/publico-alvo.md — listar 5-15 termos com 1 linha de contexto cada)_

## Dores e pain points em linguagem do leitor

- _(extrair de brand/publico-alvo.md — frases em primeira pessoa do leitor)_

## Termos que o público NÃO usa (proibir no copy)

- _(extrair de brand/publico-alvo.md e brand/tom-de-voz.md — vocabulário corporativo, jargão técnico fora do nicho, etc.)_

## Histórico de atualizações

- 2026-05-23 — Criação a partir de `brand/publico-alvo.md` (Onda 3).
```

**Importante:** preencher os bullets `_(preencher...)_` com o conteúdo real extraído de `brand/publico-alvo.md` antes de continuar. Se o arquivo de brand estiver vazio, deixar como template e adicionar nota no corpo: "Vazio em v1 — popule rodando `/brand-discovery` antes."

- [ ] **Step 3: Verificar**

```bash
head -10 inteligencia/mercado/vocabulario-publico.md
ls -la inteligencia/mercado/
```

Esperado: vê o arquivo criado com frontmatter; remover o `.gitkeep` da pasta (Onda 1 colocou).

```bash
rm -f inteligencia/mercado/.gitkeep
```

Espera... `inteligencia/mercado/` NÃO foi criada pela Onda 1; só `inteligencia/` e suas pastas-folhas em `.claude/agents/`. Confirmar:

```bash
ls inteligencia/
```

Se `mercado/` não existir, foi criado por essa task agora (via Write do arquivo). Se existir já com `.gitkeep`, remover esse `.gitkeep`.

- [ ] **Step 4: Não commitar ainda.**

---

### Task 4: Criar `inteligencia/performance/angulos-queimados.md` (vazio)

**Files:**
- Create: `inteligencia/performance/angulos-queimados.md`

- [ ] **Step 1: Criar o arquivo com cabeçalho e estrutura, sem entradas**

```markdown
---
slice: performance
owner: revisor-coerencia
ultima_atualizacao: 2026-05-23
versao: 1
---

# Ângulos queimados

Ângulos editoriais usados recentemente que precisam de descanso antes de voltar. Lido por `briefing-writer` antes de aprovar um novo ângulo; escrito por `revisor-coerencia` após uma publicação aprovada.

## Estrutura

Cada entrada:

```
- **<slug-do-ângulo>** — última publicação: YYYY-MM-DD
  - Resumo do ângulo: 1 linha
  - Janela de descanso recomendada: <N dias / N semanas>
  - Pode voltar a partir de: YYYY-MM-DD
```

## Entradas ativas

_(Sem entradas em v1. Cresce orgânicamente após cada publicação aprovada.)_

## Entradas expiradas (já podem voltar)

_(vazio)_
```

- [ ] **Step 2: Verificar e remover `.gitkeep`**

```bash
ls inteligencia/performance/ 2>/dev/null || mkdir -p inteligencia/performance/
rm -f inteligencia/performance/.gitkeep
ls -la inteligencia/performance/
```

Esperado: pasta tem apenas `angulos-queimados.md`.

- [ ] **Step 3: Não commitar ainda.**

---

### Task 5: Renomear `pesquisa-tendencias.md` → `pesquisador-mercado.md` (rename + edit do `name:` + ownership do slice mercado/)

**Files:**
- Move + edit: `.claude/agents/marketing/pesquisa/pesquisa-tendencias.md` → `.claude/agents/marketing/pesquisa/pesquisador-mercado.md`

- [ ] **Step 1: Renomear o arquivo**

```bash
git mv .claude/agents/marketing/pesquisa/pesquisa-tendencias.md .claude/agents/marketing/pesquisa/pesquisador-mercado.md
```

- [ ] **Step 2: Atualizar o frontmatter** (Edit tool)

Substituir a primeira ocorrência de:

```
name: pesquisa-tendencias
description: Especialista em pesquisa de conteúdo, tendências e referências. Faz qualquer pesquisa que a skill descrever — scouting rápido, levantamento profundo, análise de concorrência, mapeamento de referências — sempre ancorada em fontes verificáveis.
```

Por:

```
name: pesquisador-mercado
description: Pesquisador de mercado e tendências. Faz pesquisa de conteúdo, concorrentes, tendências, vocabulário do público — sempre com fontes verificáveis. Owner único do slice `inteligencia/mercado/` — escreve aprendizados duráveis em `mercado/vocabulario-publico.md`, `mercado/tendencias/<YYYY-MM>.md` e `mercado/concorrentes/<slug>.md`. Outros agentes apenas leem o slice.
```

E o título logo abaixo do frontmatter:

Substituir:

```markdown
# Pesquisa & Tendências
```

Por:

```markdown
# Pesquisador de Mercado
```

- [ ] **Step 3: Adicionar parágrafo de ownership do slice mercado** (Edit tool)

Logo após a seção `## Contexto que carrego`, adicionar nova subseção:

```markdown
## Ownership do slice `inteligencia/mercado/`

Sou o **owner único** deste slice — qualquer agente lê, eu sou o único que escreve.

Quando uma pesquisa profunda traz aprendizado durável sobre vocabulário do público, comportamento de concorrente ou tendência relevante, atualize:

- `inteligencia/mercado/vocabulario-publico.md` — termos/jargões/dores em linguagem do leitor.
- `inteligencia/mercado/tendencias/<YYYY-MM>.md` — tendência ainda quente neste mês (criar arquivo se não existir).
- `inteligencia/mercado/concorrentes/<slug>.md` — quando uma referência específica merece arquivo dedicado.

Não escrevo no slice por automatismo — só quando a skill pedir explicitamente, ou quando a pesquisa revelar algo claramente durável (i.e., não específico daquele post). Em caso de dúvida, gravo a pesquisa em `export/pesquisa/` e proponho o aprendizado em uma seção "Sugestão para `inteligencia/mercado/`" no fim do arquivo de pesquisa.
```

- [ ] **Step 4: Verificar o rename e o conteúdo**

```bash
head -5 .claude/agents/marketing/pesquisa/pesquisador-mercado.md
grep -c "pesquisador-mercado" .claude/agents/marketing/pesquisa/pesquisador-mercado.md
```

Esperado: `name: pesquisador-mercado` no topo; ao menos 1 menção do nome no corpo.

- [ ] **Step 5: Smoke test do roteamento**

```
Task(subagent_type="pesquisador-mercado", prompt="Tarefa: responder SMOKE_OK_MERCADO.")
Task(subagent_type="pesquisa-tendencias", prompt="qualquer coisa")
```

Esperado: o primeiro é encontrado; o segundo NÃO é encontrado (nome antigo extinto).

- [ ] **Step 6: Não commitar ainda.**

---

### Task 6: Criar `archivist-ramon`

**Files:**
- Create: `.claude/agents/transversais/inteligencia/archivist-ramon.md`

- [ ] **Step 1: Criar o arquivo com o conteúdo abaixo**

```markdown
---
name: archivist-ramon
description: Owner único do slice `inteligencia/ramon/`. Consolida informações sobre Ramon — cronograma, fase atual, falas, conquistas, princípios de treino — em arquivos versionados. Não inventa fatos; valida com o usuário antes de gravar. Usado pela skill `/atualizar-ramon` e quando outros agentes propõem mudança no slice.
tools: Read, Write, Edit, Glob, Grep
---

# Archivist Ramon

Você é o **arquivista do Ramon**. Sua especialidade é manter o slice `inteligencia/ramon/` atualizado e coerente — cronograma, fase atual, falas, conquistas, princípios de treino. Cada fato gravado precisa ter fonte (em geral, o próprio usuário Bruno via `/atualizar-ramon`).

Você **não** inventa biografia. Você **não** escreve copy sobre Ramon. Você organiza informação que vem do usuário (ou que outros agentes propõem) em arquivos persistentes e bem estruturados.

## Contexto que carrego

Arquivos lidos automaticamente antes de qualquer tarefa:
- `inteligencia/_schema.md` — manifest do banco.
- `inteligencia/ramon/*.md` — estado atual do slice.

Sob demanda:
- Inputs do usuário (texto livre, datas, URLs, fotos referenciadas).
- Propostas de outros agentes (output marcado como "Sugestão para `inteligencia/ramon/`").

## Princípios da especialidade

- **Fonte > especulação.** Toda entrada precisa ter fonte: "usuário em /atualizar-ramon (2026-05-23)" ou "post @ramondino YYYY-MM-DD" ou similar.
- **Atomicidade.** Cada fato vira uma linha clara, datada, com tipo. Evite parágrafos no banco — listas curtas.
- **Atualização incremental.** Não reescreva o arquivo inteiro a cada update — adicione/edite a linha relevante e atualize `ultima_atualizacao` no frontmatter.
- **Conflito de fatos = pergunta ao usuário.** Se uma nova entrada contradiz uma existente, pergunte: "Estava `X` em `<arquivo>:<linha>`. Você está corrigindo (substituir) ou adicionando contexto (manter as duas)?"
- **Frontmatter é parte do arquivo.** Após qualquer escrita, atualize `ultima_atualizacao: YYYY-MM-DD`.
- **Ownership único.** Só eu escrevo no slice. Se um agente sugerir mudança, processo a sugestão como input — não delego escrita.

## Tipos de tarefa que você executa

1. **Adicionar entrada no cronograma** — data + descrição + tipo + status, em `cronograma.md`.
2. **Atualizar fase atual** — sobrescrever seção "Fase" em `fase-atual.md` + adicionar entrada em "Última revisão".
3. **Adicionar/atualizar fato em outro arquivo do slice** (futuro — `falas-citacoes.md`, `historico-conquistas.md`, `principios-treino.md`).
4. **Validar coerência do slice** — checar que datas não conflitam, fase atual bate com cronograma.
5. **Responder o que o slice sabe sobre Ramon** — varrer o slice e devolver inline (usado quando `briefing-writer` precisa de contexto).

## Contrato de entrada

- **Tarefa:** descrição específica.
- **Inputs:** texto do usuário, ou propostas de outros agentes.
- **Saída:** arquivo do slice atualizado + 1-3 linhas confirmando o que foi gravado.

Sem `Tarefa` ou `Inputs`, devolvo `INPUT_INSUFICIENTE — <o que falta>`.

## Contrato de saída

- Gravo o(s) arquivo(s) atualizado(s) em `inteligencia/ramon/`.
- Retorno inline:

```
Atualizado: <arquivo> — <que linha mudou em 1 frase>
Próximo passo sugerido: <opcional — ex: confirmar fase atual também, ou pesquisar mais detalhes>
```

## Anti-padrões

- Inventar data, lugar, fala ou conquista — se não veio do usuário, não grava.
- Editar arquivo fora do slice `ramon/`.
- Reescrever arquivo inteiro quando só uma linha mudou.
- Esquecer de atualizar `ultima_atualizacao` no frontmatter.
- Aceitar entrada conflitante sem confirmar com o usuário.

## Quando devolver erro

- `INPUT_INSUFICIENTE — <o que falta>` — sem tarefa ou inputs.
- `SLICE_AUSENTE — inteligencia/ramon/<arquivo>` — arquivo do slice esperado não existe (deveria ter sido criado na Onda 3; se faltou, sinalize).
- `CONFLITO_FATOS — <arquivo>:<linha>` — nova entrada contradiz fato existente e usuário precisa decidir.
- `FORA_DE_OWNERSHIP — <slice>` — pedido tenta mexer em outro slice (ex: `mercado/`); recuse e oriente o owner certo.
```

- [ ] **Step 2: Remover o `.gitkeep` da pasta `transversais/inteligencia/`**

```bash
rm -f .claude/agents/transversais/inteligencia/.gitkeep
```

- [ ] **Step 3: Smoke test do roteamento**

```
Task(subagent_type="archivist-ramon", prompt="Tarefa: responder SMOKE_OK_ARCHIVIST.")
```

Esperado: agente encontrado.

- [ ] **Step 4: Não commitar ainda.**

---

### Task 7: Adaptar `briefing-writer` para consultar o banco

**Files:**
- Modify: `.claude/agents/marketing/estrategia/briefing-writer.md`

**Mudança:** adicionar leitura prévia obrigatória de 3 arquivos do banco antes de produzir briefing.

- [ ] **Step 1: Localizar a seção "Contexto que carrego"**

Atual:

```markdown
## Contexto que carrego

Arquivos lidos automaticamente antes de qualquer tarefa:
- `brand/brand-book.md` — essência, propósito, mensagens centrais.
- `brand/tom-de-voz.md` — como a marca fala.
- `brand/publico-alvo.md` — quem é o leitor.
- `brand/pilares-conteudo.md` — eixos temáticos válidos.

Sob demanda (quando a skill apontar):
- `estilo.md` de cada estilo disponível em `templates/formatos/<formato>/estilos/*/estilo.md` — quando a tarefa é recomendar estilo.
- Esqueleto em `templates/` (ex: `templates/briefing.md`) — quando a tarefa pede output estruturado.

Se algum `brand/*.md` obrigatório estiver vazio, devolva
`BRAND_BOOK_INCOMPLETO — rodar /brand-discovery antes`.
```

- [ ] **Step 2: Substituir pela versão expandida (adiciona leitura do banco antes de "produzir briefing")**

```markdown
## Contexto que carrego

Arquivos lidos automaticamente antes de qualquer tarefa:
- `brand/brand-book.md` — essência, propósito, mensagens centrais.
- `brand/tom-de-voz.md` — como a marca fala.
- `brand/publico-alvo.md` — quem é o leitor.
- `brand/pilares-conteudo.md` — eixos temáticos válidos.

Leitura adicional **obrigatória** antes de produzir briefing estratégico (não obrigatória para recomendar estilo):
- `inteligencia/ramon/cronograma.md` — para situar o post no momento do Ramon (campeonato próximo? viagem? off-season?).
- `inteligencia/ramon/fase-atual.md` — para calibrar tom e ângulo.
- `inteligencia/performance/angulos-queimados.md` — para não repetir um ângulo recente.

Se algum dos 3 estiver ausente, **siga sem ele e declare a ausência no campo `## Sinalizações` do briefing** (ex: `"sinalizações: ausência de fase-atual.md — briefing produzido sem este sinal"`). Não bloqueie por banco vazio.

Sob demanda (quando a skill apontar):
- `estilo.md` de cada estilo disponível em `templates/formatos/<formato>/estilos/*/estilo.md` — quando a tarefa é recomendar estilo.
- Esqueleto em `templates/` (ex: `templates/briefing.md`) — quando a tarefa pede output estruturado.

Se algum `brand/*.md` obrigatório estiver vazio, devolva
`BRAND_BOOK_INCOMPLETO — rodar /brand-discovery antes`.
```

- [ ] **Step 3: Adicionar bullet de princípio sobre o banco**

Na seção `## Princípios da especialidade`, adicionar como último bullet:

```markdown
- **Banco de Inteligência informa, não substitui.** Use `inteligencia/ramon/` para situar o post no momento real do Ramon e `inteligencia/performance/angulos-queimados.md` para evitar repetição. Nunca invente fato de Ramon — se o banco está vazio, declare a ausência no briefing.
```

- [ ] **Step 4: Verificar**

```bash
grep -n "inteligencia/" .claude/agents/marketing/estrategia/briefing-writer.md
```

Esperado: 3+ menções (em `## Contexto`, no princípio, possivelmente em outros pontos se você as adicionou).

- [ ] **Step 5: Não commitar ainda.**

---

### Task 8: Criar a skill `/atualizar-ramon`

**Files:**
- Create: `.claude/skills/atualizar-ramon/SKILL.md`

- [ ] **Step 1: Criar o arquivo com o conteúdo abaixo**

```markdown
---
name: atualizar-ramon
description: Skill interativa para Bruno atualizar o slice `inteligencia/ramon/` — cronograma, fase atual, e (futuro) outras informações biográficas. Usa o agente `archivist-ramon` como owner único do slice. Sem ela, agentes que dependem do contexto Ramon operam às cegas.
---

# /atualizar-ramon — Dino Team

## Objetivo

Manter `inteligencia/ramon/` atualizado — slice da memória persistente sobre o Ramon, lido por `briefing-writer` para calibrar todo conteúdo.

## Sintaxe

```
/atualizar-ramon
```

Sem argumentos — a skill é conversacional. Bruno descreve o que mudou (texto livre), a skill identifica o(s) arquivo(s) afetado(s) e aciona `archivist-ramon`.

## Pipeline

### 1. Diagnóstico — mostrar estado atual

Ler e mostrar inline:
- `inteligencia/ramon/fase-atual.md` (seção "Fase" + "Última revisão")
- `inteligencia/ramon/cronograma.md` (últimas 5 entradas, ou "(vazio)")

Apresentar:

```
Slice ramon/ — estado atual:

Fase atual: <conteúdo da seção Fase | "(vazio — primeira atualização)">
Última revisão de fase: <data | "(nunca)">

Últimas entradas do cronograma:
<lista | "(vazio)">

O que vamos atualizar?
- "fase atual" / "fase" → atualizar fase-atual.md
- "cronograma" / "agenda" / "calendário" → adicionar/editar entradas em cronograma.md
- texto livre → eu identifico
```

### 2. Coletar input do usuário

**Atualizar fase atual:**

Pergunte:
1. Qual é a fase agora? (off-season | prep | prep avançada | peak week | pós-campeonato | transição | outro — descreva)
2. Desde quando? (`YYYY-MM-DD` ou "hoje")
3. Sinalizações específicas (opcional): há alguma restrição editorial específica desta fase? (ex: peak week → não publicar conteúdo que sugira mudar dieta)

**Adicionar entrada no cronograma:**

Pergunte:
1. Data ou faixa de datas (`YYYY-MM-DD` ou `YYYY-MM` ou "próximo mês")
2. Descrição em 1 linha (ex: "Arnold Classic SA 2026", "viagem Doha", "gravação Pretinho")
3. Tipo (campeonato | viagem | conteúdo gravado | fase | marco pessoal)
4. Status (confirmado | provável | passado)

**Texto livre:**

Tente parsear:
- Se mencionar fase + data → atualizar fase.
- Se mencionar data + evento → adicionar ao cronograma.
- Caso contrário, pergunte qual dos dois é o alvo.

### 3. Acionar `archivist-ramon`

[Agente: `archivist-ramon`]

```
Tarefa: <atualizar fase atual | adicionar entrada no cronograma | ...>

Inputs:
- <campos coletados no Passo 2, estruturados>
- Fonte: usuário (Bruno) via /atualizar-ramon na data <YYYY-MM-DD>

Regras:
- Use o frontmatter padrão; atualize `ultima_atualizacao`.
- Se houver conflito com entrada existente, devolva CONFLITO_FATOS — eu pergunto ao usuário e re-aciono.

Saída: arquivo do slice atualizado + 1-3 linhas confirmando.
```

### 4. Confirmar e oferecer próxima atualização

Mostrar inline o que foi gravado (ler do arquivo) e perguntar:

```
Gravado em <arquivo>:
<diff resumido — só a parte que mudou>

Mais alguma coisa pra atualizar? (sim/não)
```

Loop até "não".

### 5. Reportar conclusão

```
Slice ramon/ atualizado.
Arquivos modificados:
- <lista>

Próximo /novo-post vai consultar o estado novo do slice.
```

## Princípios

- **Fonte humana é fonte da verdade.** Bruno descreve, archivist grava — agentes não inventam.
- **Confirmação após cada gravação.** Bruno vê o que foi escrito antes de prosseguir.
- **Conflito de fatos pausa a skill.** Em `CONFLITO_FATOS`, pergunte: substituir, manter as duas, descartar a nova?
- **Incremental.** Pode parar e voltar — cada subatualização é independente.

## Critério de conclusão

- Pelo menos 1 arquivo de `inteligencia/ramon/` foi atualizado e versionado.
- `archivist-ramon` retornou confirmação.
- Bruno encerrou explicitamente ("não" para próxima atualização).
```

- [ ] **Step 2: Verificar**

```bash
ls .claude/skills/atualizar-ramon/
head -5 .claude/skills/atualizar-ramon/SKILL.md
```

Esperado: o arquivo existe com frontmatter correto.

- [ ] **Step 3: Não commitar ainda.**

---

### Task 9: Atualizar `/novo-post` e `/lote-posts` — trocar `pesquisa-tendencias` por `pesquisador-mercado`

**Files:**
- Modify: `.claude/skills/novo-post/SKILL.md`
- Modify: `.claude/skills/lote-posts/SKILL.md`

- [ ] **Step 1: Substituir todas as menções em `/novo-post`**

Usar Edit com `replace_all: true`:

- Em `.claude/skills/novo-post/SKILL.md`, substituir `pesquisa-tendencias` por `pesquisador-mercado` em **todas as ocorrências** (tabela de agentes, P2a, P7, qualquer outra).

- [ ] **Step 2: Verificar**

```bash
grep -n "pesquisa-tendencias" .claude/skills/novo-post/SKILL.md
```

Esperado: **nenhum match**.

```bash
grep -cn "pesquisador-mercado" .claude/skills/novo-post/SKILL.md
```

Esperado: ≥ 3 ocorrências (tabela + P2a + P7).

- [ ] **Step 3: Substituir todas as menções em `/lote-posts`**

Mesmo procedimento em `.claude/skills/lote-posts/SKILL.md`.

- [ ] **Step 4: Verificar**

```bash
grep -n "pesquisa-tendencias" .claude/skills/lote-posts/SKILL.md
```

Esperado: nenhum match.

```bash
grep -cn "pesquisador-mercado" .claude/skills/lote-posts/SKILL.md
```

Esperado: ≥ 3 ocorrências (tabela + Passo 3 + Passo 4).

- [ ] **Step 5: Não commitar ainda.**

---

### Task 10: Atualizar `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Atualizar o bullet do agente Marketing/Pesquisa**

Trecho atual (deixado pelas Ondas 1 e 2):

```markdown
  - [`pesquisa-tendencias`](.claude/agents/marketing/pesquisa/pesquisa-tendencias.md) — pesquisa de conteúdo (será renomeado para `pesquisador-mercado` na Onda 3).
```

Substituir por:

```markdown
  - [`pesquisador-mercado`](.claude/agents/marketing/pesquisa/pesquisador-mercado.md) — pesquisa de mercado/tendências e owner do slice `inteligencia/mercado/`.
```

- [ ] **Step 2: Adicionar `archivist-ramon` em Transversais/Inteligência**

Na seção "3. Agentes", adicionar nova subseção (após Transversais/Brand):

```markdown
- **Transversais / Inteligência**
  - [`archivist-ramon`](.claude/agents/transversais/inteligencia/archivist-ramon.md) — owner único do slice `inteligencia/ramon/`. Consolida cronograma e fase atual do Ramon a partir de input do usuário.
```

- [ ] **Step 3: Adicionar `/atualizar-ramon` na lista de skills**

Localizar a seção "### 2. Skills" e adicionar como último bullet:

```markdown
- [`/atualizar-ramon`](.claude/skills/atualizar-ramon/SKILL.md) — Bruno atualiza o slice `inteligencia/ramon/` (cronograma + fase atual).
```

- [ ] **Step 4: Mencionar o Banco de Inteligência na arquitetura**

Procurar a seção "## Como o sistema é organizado" e, logo após `### 3. Agentes...`, adicionar:

```markdown
### 4. Banco de Inteligência (`inteligencia/`)

Memória persistente compartilhada — markdown + frontmatter YAML, versionada em git, lida por qualquer agente e escrita apenas pelo owner declarado. Ver [`inteligencia/_schema.md`](inteligencia/_schema.md) para slices ativos e ownership.

**Slices em v1:**
- `inteligencia/ramon/` — contexto temporal e biográfico do Ramon (owner: `archivist-ramon`).
- `inteligencia/mercado/` — pesquisa de mercado e vocabulário do público (owner: `pesquisador-mercado`).
- `inteligencia/performance/` — só `angulos-queimados.md` em v1 (owner: `revisor-coerencia`); outros sub-slices entram quando publicação real existir.
```

- [ ] **Step 5: Verificar**

```bash
grep -n "pesquisa-tendencias" CLAUDE.md
```

Esperado: nenhum match.

```bash
grep -n "archivist-ramon\|atualizar-ramon\|inteligencia/" CLAUDE.md
```

Esperado: ≥ 4 matches.

- [ ] **Step 6: Não commitar ainda.**

---

### Task 11: Smoke test funcional

**Files:** (nenhum modificado)

- [ ] **Step 1: Resolver agentes novos**

```
Task(subagent_type="pesquisador-mercado", prompt="SMOKE_OK_MERCADO")
Task(subagent_type="archivist-ramon", prompt="SMOKE_OK_ARCHIVIST")
Task(subagent_type="briefing-writer", prompt="SMOKE_OK_BRIEFING")
```

Esperado: todos encontrados.

- [ ] **Step 2: Confirmar que `pesquisa-tendencias` está extinto**

```
Task(subagent_type="pesquisa-tendencias", prompt="qualquer coisa")
```

Esperado: agente não encontrado.

- [ ] **Step 3: Bruno popula `ramon/fase-atual.md` via `/atualizar-ramon`**

Rodar:

```
/atualizar-ramon
```

Bruno informa fase atual e (opcionalmente) 1-2 entradas no cronograma.

Esperado:
- `inteligencia/ramon/fase-atual.md` deixa de ter "_preencher via_" e ganha conteúdo factual.
- `archivist-ramon` confirmou a gravação.

- [ ] **Step 4: Rodar `/novo-post` em modo dry até o briefing e verificar consulta ao banco**

```
/novo-post carrossel <tema-rápido>
```

Acompanhar até o Passo 4 (briefing produzido por `briefing-writer`). Verificar:
- O briefing menciona contexto vindo de `inteligencia/ramon/` (fase atual, próximo campeonato, etc.) OU declara explicitamente "ausência de fase-atual.md — briefing produzido sem este sinal" se o slice ainda estiver vazio.
- O campo `## Sinalizações para o pipeline` reflete algo do contexto do banco.

Pode abortar após o Passo 4.

- [ ] **Step 5: Verificar integridade do banco**

```bash
find inteligencia -name "*.md" | xargs head -5
```

Esperado: cada arquivo tem frontmatter com `slice:`, `owner:`, `ultima_atualizacao:`, `versao:`.

- [ ] **Step 6: Caso QUALQUER smoke test falhe — reverter**

```bash
git checkout -- .claude/ CLAUDE.md
rm -rf inteligencia/ramon inteligencia/mercado inteligencia/performance inteligencia/_schema.md
touch inteligencia/.gitkeep
```

(Restaura para o estado após Onda 2.) Registrar com o usuário.

---

### Task 12: Commit único da Onda 3

**Files:** (todos os listados)

- [ ] **Step 1: Conferir o `git status`**

```bash
git status
```

Esperado:
- Renomeado: `pesquisa-tendencias.md -> pesquisador-mercado.md` (com mudança de conteúdo).
- Novos: `inteligencia/_schema.md`, `inteligencia/ramon/cronograma.md`, `inteligencia/ramon/fase-atual.md`, `inteligencia/mercado/vocabulario-publico.md`, `inteligencia/performance/angulos-queimados.md`, `.claude/agents/transversais/inteligencia/archivist-ramon.md`, `.claude/skills/atualizar-ramon/SKILL.md`.
- Modificados: `briefing-writer.md`, `novo-post/SKILL.md`, `lote-posts/SKILL.md`, `CLAUDE.md`.
- Deletados (pelo `rm -f .gitkeep` das pastas que ganharam conteúdo): `inteligencia/.gitkeep`, `inteligencia/mercado/.gitkeep`, `inteligencia/performance/.gitkeep`, `.claude/agents/transversais/inteligencia/.gitkeep`.

- [ ] **Step 2: Stage e commit**

```bash
git add inteligencia/ .claude/agents/ .claude/skills/ CLAUDE.md
git commit -m "$(cat <<'EOF'
feat(arquitetura): Banco de Inteligência mínimo + pesquisador-mercado (Onda 3)

Conforme spec docs/specs/2026-05-22-arquitetura-multi-setor-design.md §4.2 e §6.4:

- inteligencia/_schema.md (v1) declara 3 slices ativos com ownership único.
- Slices populados:
  - ramon/ → cronograma.md + fase-atual.md (templates; preenchidos por
    Bruno via /atualizar-ramon).
  - mercado/ → vocabulario-publico.md derivado de brand/publico-alvo.md.
  - performance/ → angulos-queimados.md vazio (cresce orgânicamente).

- archivist-ramon (transversais/inteligencia/, novo) — owner único de
  ramon/. Não inventa fatos; valida com usuário.

- /atualizar-ramon (skill nova) — interface conversacional para Bruno
  manter ramon/ atualizado.

- pesquisa-tendencias renomeado para pesquisador-mercado; ganha
  ownership do slice mercado/. Skills /novo-post e /lote-posts
  atualizadas (resolução por nome — sem mudança de pipeline).

- briefing-writer adaptado para consultar ramon/cronograma.md,
  ramon/fase-atual.md e performance/angulos-queimados.md antes de
  produzir briefing. Ausência de slice é declarada no briefing, não
  bloqueia.

CLAUDE.md atualizado: seção 4 (Banco de Inteligência) adicionada.

Próxima onda (Onda 4): Site + Engenharia (adaptação de
docs/plans/2026-05-19-site-dino-team-mvp.md à nova arquitetura).
EOF
)"
```

- [ ] **Step 3: Confirmar commit**

```bash
git log -1 --stat | head -50
```

Esperado: o commit recém-criado com todos os arquivos.

---

## Critério de conclusão da Onda 3

- [ ] `inteligencia/_schema.md` declara 3 slices ativos com ownership único, versão v1.
- [ ] `inteligencia/ramon/cronograma.md` e `inteligencia/ramon/fase-atual.md` existem com frontmatter padrão.
- [ ] `inteligencia/mercado/vocabulario-publico.md` populado a partir de `brand/publico-alvo.md`.
- [ ] `inteligencia/performance/angulos-queimados.md` existe (vazio mas com cabeçalho).
- [ ] `archivist-ramon` resolvível por `subagent_type`.
- [ ] `pesquisador-mercado` resolvível; `pesquisa-tendencias` extinto.
- [ ] `briefing-writer` lê os 3 arquivos do banco antes de produzir briefing.
- [ ] `/atualizar-ramon` existe e roda interativamente.
- [ ] Bruno atualizou `ramon/fase-atual.md` pelo menos uma vez (smoke test 3).
- [ ] Próximo `/novo-post` consulta o banco — briefing reflete o estado de Ramon ou declara ausência.
- [ ] Skills `/novo-post`, `/lote-posts`, `/novo-estilo`, `/brand-discovery`, `/atualizar-ramon` funcionam.
