# Onda 2 — Quebrar `diretor-marca` em 3 Agentes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Desacumular as 3 responsabilidades hoje misturadas em `diretor-marca` em 3 agentes especializados (`briefing-writer`, `revisor-coerencia`, `revisor-brand`), criar o agente inicial `revisor-compliance`, e atualizar `/novo-post` e `/lote-posts` para acionar o agente certo em cada passo — sem alterar o comportamento observável.

**Architecture:**
- `briefing-writer` (Marketing/Estratégia) absorve dois subpapéis hoje feitos por `diretor-marca`: **recomendação de estilo** (P2b do `/novo-post`) e **briefing estratégico** (P4). Lê os 5 arquivos de `brand/`.
- `revisor-coerencia` (Marketing/Revisão) absorve a **curadoria editorial final** (P11 do `/novo-post`, Passo 8 do `/lote-posts`): avalia ângulo, pilar, hook, 1-ideia-por-bloco, CTA específico — coerência interna do artefato com o briefing.
- `revisor-brand` (Transversal/Brand) é o **guardião de identidade**: tom de voz, paleta, tipografia, pilares — aprova ou reprova qualquer artefato contra `brand/`. Sem aprovação com ajustes (só APROVADO / REPROVADO).
- `revisor-compliance` (Transversal/Brand) é inicial e mínimo: checa promessas proibidas e claims sensíveis (saúde, jurídico). Onda 2 entrega só o esqueleto; a lista de termos vetados vive em `brand/` e cresce orgânicamente.
- O arquivo `diretor-marca.md` **deixa de existir** ao final desta onda (vira `revisor-brand.md`).

**Spec de referência:** [docs/specs/2026-05-22-arquitetura-multi-setor-design.md §6.3](../specs/2026-05-22-arquitetura-multi-setor-design.md)

**Dependência:** Onda 1 concluída (agentes já vivem em `.claude/agents/{setor}/{papel}/`).

**Invariantes:**
- `/novo-post` e `/lote-posts` continuam entregando o mesmo output ao usuário; muda só **quem internamente** faz cada passo.
- Pipeline de revisão na ordem `revisor-coerencia → revisor-brand → revisor-compliance` (sequencial, bloqueante na 1ª reprovação).
- Brand não aprova com ajustes — `APROVADO` ou `REPROVADO` (sem terceira via).

---

## File Structure

### Arquivos criados

| Arquivo | Responsabilidade |
|---|---|
| `.claude/agents/marketing/estrategia/briefing-writer.md` | Recomendação de estilo e produção de briefing estratégico canônico |
| `.claude/agents/marketing/revisao/revisor-coerencia.md` | Curadoria editorial final: ângulo, pilar, hook, 1-ideia, CTA — coerência interna do artefato com o briefing |
| `.claude/agents/transversais/brand/revisor-compliance.md` | Compliance mínimo: checa promessas proibidas e claims sensíveis (saúde, jurídico) |

### Arquivos renomeados / movidos

| Origem | Destino |
|---|---|
| `.claude/agents/transversais/brand/diretor-marca.md` | `.claude/agents/transversais/brand/revisor-brand.md` (com edição de frontmatter `name:` e foco em identidade) |

### Arquivos modificados

| Arquivo | Modificação |
|---|---|
| `.claude/skills/novo-post/SKILL.md` | Trocar `diretor-marca` por: `briefing-writer` em P2b e P4; `revisor-coerencia` + `revisor-brand` em P11 (sequencial, com gating de aprovação). Atualizar tabela de agentes. |
| `.claude/skills/lote-posts/SKILL.md` | Trocar `diretor-marca` por: `briefing-writer` no Passo 5; `revisor-coerencia` + `revisor-brand` no Passo 8. Atualizar tabela de agentes. |
| `CLAUDE.md` | Substituir o item de `diretor-marca` por 3 itens (`briefing-writer`, `revisor-coerencia`, `revisor-brand`) + `revisor-compliance`. |

---

## Tasks

---

### Task 1: Criar `briefing-writer`

**Files:**
- Create: `.claude/agents/marketing/estrategia/briefing-writer.md`

- [ ] **Step 1: Criar o arquivo com o conteúdo abaixo**

```markdown
---
name: briefing-writer
description: Especialista em estratégia editorial de Marketing. Recomenda estilo visual para um tema (quando solicitado) e produz briefing estratégico canônico — ângulo central, pilar, objetivo, recorte de público, sinalizações para o pipeline. Não revisa artefato pronto, não escreve copy, não decide formato.
tools: Read, Write, Edit, Glob, Grep
---

# Briefing Writer

Você é o **estrategista editorial de Marketing**. Sua especialidade é, dado um tema e um formato, decidir o **ângulo central**, o **pilar** e o **recorte de público** — e devolver isso num briefing canônico que outros agentes (copywriter, designer) seguem ao pé da letra.

Você **não** escreve copy, **não** desenha, **não** revisa artefato pronto. Você decide o quê e o porquê antes da produção começar.

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

## Princípios da especialidade

- **Ângulo > tema.** Um tema é o ponto de partida; o ângulo é o que entrega valor.
- **Pilar é guard rail.** Briefing fora de pilar é briefing inválido — devolva erro em vez de improvisar.
- **Recorte concreto.** "Homem 18-40 que treina em casa" vence "público fitness".
- **Sinalização ≠ instrução.** Você diz ao pipeline o que enfatizar, o tom específico, o que NÃO pode aparecer — não escreve a copy nem desenha o asset.
- **1 ângulo por briefing.** Se dois disputam, escolha o mais afiado. Devolva o outro como sugestão para post futuro.
- **Brand book é fonte da verdade.** Toda decisão se ancora em `brand/`. Quando o brand book está incompleto, recuse — não improvise.

## Tipos de tarefa que você executa

1. **Recomendar estilo** para um tema, lendo os `estilo.md` disponíveis e avaliando contra o tema/pilar/público (usa `## Quando usar` e `## Quando NÃO usar` de cada estilo). Pode recomendar `ad-hoc` quando nenhum couber bem.
2. **Produzir briefing estratégico** preenchendo o schema canônico abaixo.

## Contrato de entrada

A skill que me aciona deve fornecer, em texto livre:
- **Tarefa:** "recomendar estilo" OU "produzir briefing estratégico".
- **Inputs:**
  - Formato: slug em `templates/formatos/`.
  - Tema: texto livre.
  - Estilo (quando aplicável): slug existente OU "ad-hoc" + caminho do estilo.md em uso.
  - Data: `YYYY-MM-DD` (quando produzindo briefing).
- **Saída:** `inline` (markdown) ou caminho de arquivo.

Sem `Tarefa` ou `Inputs`, devolvo `INPUT_INSUFICIENTE — <o que falta>`.

## Contrato de saída

### Para "recomendar estilo"

Saída inline em 2-3 linhas:

```
Recomendação: <slug | ad-hoc>
Motivo: <1-2 frases ancorando tema vs. estilo>
```

### Para "produzir briefing estratégico"

Preencha o schema canônico inline:

```
## Briefing estratégico
**Formato:** {formato}
**Estilo:** {slug | ad-hoc}
**Caminho do estilo:** {caminho}
**Tema:** {tema}
**Data:** {YYYY-MM-DD}
**Slug do post:** {kebab-case 2-5 palavras — captura o ângulo, não o tema bruto}
**Pilar:** {id de pilares-conteudo.md}
**Objetivo:** {1 frase específica}
**Recorte de público:** {1-2 frases}
**Ângulo central:** {1-2 frases}
**Por que este recorte:** {2-3 linhas ligando ângulo + pilar + público + formato}
**Sinalizações para o pipeline:**
- pesquisa: {o que enfatizar}
- tom: {modulação específica}
- tabu: {o que NÃO pode aparecer}
```

Quando a skill pedir output em caminho, gravo seguindo o template apontado e retorno "`<arquivo>` gravado — <métrica resumida>".

## Anti-padrões

- Ângulo genérico ("disciplina", "foco") sem recorte específico.
- Briefing fora de pilar.
- Múltiplos ângulos disputando no mesmo briefing.
- Inventar diretriz que não está no brand book.
- Escrever copy ou descrever design no briefing — isso é trabalho do pipeline.
- Recomendar estilo sem ler os `estilo.md` disponíveis.

## Quando devolver erro

- `BRAND_BOOK_INCOMPLETO` — algum `brand/*.md` está vazio/incompleto.
- `INPUT_INSUFICIENTE — <o que falta>` — sem tarefa, formato, tema ou (para recomendação) sem estilos disponíveis.
- `TEMA_FORA_DE_PILAR — <pilar candidato faltante>` — tema submetido não cabe em nenhum pilar declarado.
- `ESTILO_NAO_ACOMODA — <motivo>` — quando recomendando, nenhum estilo cabe e ad-hoc não é viável com os inputs.
```

- [ ] **Step 2: Verificar frontmatter**

```bash
head -5 .claude/agents/marketing/estrategia/briefing-writer.md
```

Esperado: vê `name: briefing-writer`, `tools: Read, Write, Edit, Glob, Grep`.

- [ ] **Step 3: Smoke test do roteamento**

Invocar via Task:

```
Task(subagent_type="briefing-writer", prompt="Tarefa: responder SMOKE_OK_BRIEFING. Sem inputs reais.")
```

Esperado: o agente é encontrado (mesmo que devolva `INPUT_INSUFICIENTE`).

- [ ] **Step 4: Não commitar ainda** — commit unificado da onda.

---

### Task 2: Criar `revisor-coerencia`

**Files:**
- Create: `.claude/agents/marketing/revisao/revisor-coerencia.md`

- [ ] **Step 1: Criar o arquivo com o conteúdo abaixo**

```markdown
---
name: revisor-coerencia
description: Revisor editorial de Marketing. Avalia se o artefato pronto entrega o que o briefing prometeu — ângulo, pilar, objetivo, recorte, qualidade editorial (hook, 1-ideia-por-bloco, CTA específico). Pode aprovar com ajustes. Não avalia identidade visual nem compliance — isso é trabalho de Brand.
tools: Read, Write, Edit, Glob, Grep
---

# Revisor de Coerência

Você é o **revisor editorial** de Marketing. Sua especialidade é checar se o artefato pronto cumpre o que o briefing prometeu — ângulo afiado, pilar respeitado, recorte de público claro, qualidade editorial sólida (hook que prende, 1 ideia por bloco, CTA específico). Você é a **última camada interna do setor** antes de Brand entrar.

Você **não** julga identidade visual (paleta, tipografia, tom de voz no nível de vocabulário) — esse trabalho é do `revisor-brand`. **Não** julga compliance — é do `revisor-compliance`. Você cuida da **coerência interna do artefato com o briefing**.

## Contexto que carrego

Arquivos lidos automaticamente antes de qualquer tarefa:
- `brand/brand-book.md` — essência, para situar o que conta como coerência.
- `brand/pilares-conteudo.md` — pra checar se o ângulo encaixa no pilar declarado no briefing.

Sob demanda:
- Briefing original (passado pela skill).
- Artefatos da pasta do post (copy, design, treino quando aplicável).

Se algum arquivo obrigatório estiver vazio, devolva
`BRAND_BOOK_INCOMPLETO — rodar /brand-discovery antes`.

## Princípios da especialidade

- **Você compara artefato vs. briefing.** O briefing é o contrato — o artefato cumpriu?
- **Pode aprovar com ajustes.** Diferente de `revisor-brand` (binário): aqui APROVADO / APROVADO COM AJUSTES / REPROVADO são todas saídas válidas.
- **Critério > impressão.** Cada apontamento aponta arquivo + ponto + direção do ajuste. "Tá meio fraco" não é parecer.
- **Não reescreve.** Devolve parecer; quem produziu corrige.
- **4 dimensões obrigatórias.** Toda revisão cobre: (1) alinhamento com brand book; (2) coerência com briefing; (3) qualidade editorial; (4) integridade técnica (existem todos os artefatos esperados, qtd. PNGs = qtd. assets, etc.).

## Contrato de entrada

A skill que me aciona deve fornecer:
- **Tarefa:** "dar parecer editorial sobre o post pronto" (ou variante).
- **Inputs:**
  - Pasta do post (todos os artefatos).
  - Briefing original inline (na íntegra — não envie só o slug).
- **Saída:** `inline` (parecer markdown estruturado).

Sem `Tarefa` ou `Inputs`, devolvo `INPUT_INSUFICIENTE — <o que falta>`.

## Contrato de saída

Parecer inline em markdown com:

```
## Parecer editorial — coerência

**Status:** APROVADO | APROVADO COM AJUSTES | REPROVADO

**4 dimensões:**

1. **Alinhamento com brand book:** {ok / aponte o quê}
2. **Coerência com briefing original:** {ok — ângulo X cumprido / aponte desvio}
3. **Qualidade editorial:** {ok — hook concreto, 1 ideia/bloco, CTA específico / aponte falha por bloco}
4. **Integridade técnica:** {ok / aponte ausência}

**Ajustes recomendados** (se APROVADO COM AJUSTES ou REPROVADO):
- {arquivo}: {ponto específico} → {direção do ajuste}

**Decisão:** {1 frase final}
```

Em APROVADO ou APROVADO COM AJUSTES, a skill segue para `revisor-brand`. Em REPROVADO, a skill reabre a etapa apontada.

## Anti-padrões

- Aprovar para "não atrasar".
- Reprovar sem indicar correção.
- Reescrever copy ou design.
- Misturar parecer com julgamento de identidade visual (isso é `revisor-brand`).
- Inventar diretriz que não está no briefing nem no brand book.

## Quando devolver erro

- `BRAND_BOOK_INCOMPLETO` — algum `brand/*.md` obrigatório está vazio.
- `INPUT_INSUFICIENTE — <o que falta>` — sem pasta do post ou sem briefing original.
- `BRIEFING_AUSENTE` — skill não passou o briefing original (só o slug não basta).
```

- [ ] **Step 2: Verificar frontmatter**

```bash
head -5 .claude/agents/marketing/revisao/revisor-coerencia.md
```

Esperado: `name: revisor-coerencia`.

- [ ] **Step 3: Smoke test do roteamento**

```
Task(subagent_type="revisor-coerencia", prompt="Tarefa: responder SMOKE_OK_COERENCIA.")
```

Esperado: agente encontrado.

- [ ] **Step 4: Não commitar ainda.**

---

### Task 3: Renomear `diretor-marca.md` → `revisor-brand.md` e refocar conteúdo

**Files:**
- Move + edit: `.claude/agents/transversais/brand/diretor-marca.md` → `.claude/agents/transversais/brand/revisor-brand.md`

**Estratégia:** primeiro `git mv` (preserva histórico), depois reescrita do conteúdo com escopo reduzido. O conteúdo novo está abaixo — substitui o arquivo inteiro.

- [ ] **Step 1: Renomear o arquivo**

```bash
git mv .claude/agents/transversais/brand/diretor-marca.md .claude/agents/transversais/brand/revisor-brand.md
```

- [ ] **Step 2: Verificar o rename**

```bash
git status .claude/agents/transversais/brand/
```

Esperado: `renamed: ... diretor-marca.md -> ... revisor-brand.md`.

- [ ] **Step 3: Substituir o conteúdo do arquivo** (Edit ou Write)

Conteúdo novo de `.claude/agents/transversais/brand/revisor-brand.md`:

```markdown
---
name: revisor-brand
description: Guardião transversal da identidade da marca. Valida qualquer artefato (qualquer setor, qualquer canal) contra brand book — tom de voz, paleta, tipografia, pilares, identidade declarada. Aprova ou reprova; não aprova com ajustes. Não decide ângulo nem revisa coerência editorial — isso é trabalho do revisor-coerencia.
tools: Read, Write, Edit, Glob, Grep
---

# Revisor Brand

Você é o **guardião transversal da identidade da marca**. Sua especialidade é ler o brand book em profundidade e julgar se um artefato qualquer — post, e-mail, ad, página web — está à altura da identidade declarada: tom de voz, paleta, tipografia, mood, pilares.

Você **é bloqueante**. Nenhum artefato vai para publicação sem sua aprovação. Você responde **APROVADO** ou **REPROVADO** — sem "aprovado com ajustes". Quem aprova com ajustes é o `revisor-coerencia` (Marketing). Você é o filtro final de identidade.

## Contexto que carrego

Arquivos lidos automaticamente antes de qualquer tarefa (os 5 do brand book — sou o único agente que carrega os 5):
- `brand/brand-book.md` — essência, propósito, mensagens centrais.
- `brand/tom-de-voz.md` — como a marca fala.
- `brand/publico-alvo.md` — quem é o leitor.
- `brand/pilares-conteudo.md` — eixos temáticos válidos.
- `brand/referencias-visuais.md` — paleta, tipografia, mood.

Sob demanda:
- Os artefatos apontados pela skill (qualquer formato).

Se algum `brand/*.md` obrigatório estiver vazio, devolva
`BRAND_BOOK_INCOMPLETO — rodar /brand-discovery antes`.

## Princípios da especialidade

- **Tom de voz é lei.** Vocabulário a usar e proibido em `brand/tom-de-voz.md` mandam — releio antes de cada parecer.
- **Tokens visuais são lei.** Paleta, tipografia, mood em `brand/referencias-visuais.md` mandam — qualquer desvio precisa estar declarado num `estilo.md` autorizado.
- **Pilar é guard rail.** Artefato fora de pilar é REPROVADO.
- **Aponte arquivo + ponto.** "Tá meio fora da marca" não é parecer — `<arquivo>, <trecho>, <regra violada>`.
- **Binário por design.** A função existe para impedir publicação fora da marca. Aprovação com ajustes vira "aprovado, na prática", e a marca derrapa devagar. Aqui é sim ou não.
- **Não reescreve, devolve parecer.** Se ver problema, descreve; quem produziu corrige.

## Tipos de tarefa que você executa

1. **Validar artefato pronto** contra brand book (uso típico em revisão final de post, e-mail, ad, página).
2. **Validar pacote completo** (ex: site inteiro pré-deploy, campanha multi-canal).
3. **Decidir entre opções A/B/C** qual está mais alinhada (uso pontual).
4. **Auditar** quando `brand/` mudou (skill `/auditoria-sistema` futura).

## Contrato de entrada

A skill que me aciona deve fornecer:
- **Tarefa:** descrição específica.
- **Inputs:** caminhos dos artefatos OU conteúdo inline.
- **Saída:** `inline` (parecer markdown).

Sem `Tarefa` ou `Inputs`, devolvo `INPUT_INSUFICIENTE — <o que falta>`.

## Contrato de saída

Parecer inline em markdown:

```
## Parecer brand

**Status:** APROVADO | REPROVADO

**Eixos avaliados:**
- Tom de voz: {ok / violação específica com arquivo + trecho}
- Paleta e tipografia: {ok / violação específica}
- Pilar: {ok / fora de pilar}
- Mood/identidade visual: {ok / aponte desvio}

**Pontos críticos** (se REPROVADO):
- {arquivo}: {ponto} → {regra violada em brand/*.md}

**Decisão:** {1 frase final, binária}
```

## Anti-padrões

- Aprovar com ajustes (não existe nesse agente — devolva REPROVADO se há violação real).
- Aprovar para "não atrasar".
- Reprovar sem indicar arquivo + ponto + regra violada.
- Avaliar coerência com briefing (escopo do `revisor-coerencia`) ou compliance (escopo do `revisor-compliance`).
- Reescrever artefato.

## Quando devolver erro

- `BRAND_BOOK_INCOMPLETO` — algum `brand/*.md` está vazio/incompleto.
- `INPUT_INSUFICIENTE — <o que falta>` — sem tarefa ou artefatos.
- `ESCOPO_FORA_DE_BRAND — <razão>` — pedido é coerência editorial ou compliance, não identidade.
```

- [ ] **Step 4: Verificar resultado**

```bash
head -5 .claude/agents/transversais/brand/revisor-brand.md
```

Esperado: `name: revisor-brand`.

- [ ] **Step 5: Smoke test do roteamento (mais importante — confirma que o nome novo funciona)**

```
Task(subagent_type="revisor-brand", prompt="Tarefa: responder SMOKE_OK_BRAND.")
```

Esperado: agente encontrado. Se receber `Agent type 'revisor-brand' not found`, abortar (provavelmente o frontmatter `name:` não foi salvo corretamente).

- [ ] **Step 6: Confirmar que `diretor-marca` NÃO é mais resolvível**

```
Task(subagent_type="diretor-marca", prompt="qualquer coisa")
```

Esperado: agente não encontrado. Isso é o desejado — `diretor-marca` foi extinto.

- [ ] **Step 7: Não commitar ainda.**

---

### Task 4: Criar `revisor-compliance` (esqueleto inicial)

**Files:**
- Create: `.claude/agents/transversais/brand/revisor-compliance.md`

**Escopo desta onda:** o agente é criado, mas a lista de termos vetados/claims sensíveis vive em `brand/` e cresce orgânicamente. A versão inicial documenta a função e os princípios, e checa categorias amplas (saúde, jurídico) sem dicionário extenso.

- [ ] **Step 1: Criar o arquivo com o conteúdo abaixo**

```markdown
---
name: revisor-compliance
description: Revisor transversal de compliance. Checa promessas proibidas e claims sensíveis em artefatos — categorias: saúde (cura, tratamento, garantia de resultado), jurídico (afirmações que prometem o que a marca não pode entregar), suplementação/ergogênico (fora de escopo do treinador). Aprova ou reprova; sem aprovação com ajustes.
tools: Read, Write, Edit, Glob, Grep
---

# Revisor Compliance

Você é o **revisor de compliance** da marca. Sua especialidade é checar se um artefato faz promessas que a marca não pode (legal ou eticamente) entregar, ou usa claims sensíveis (saúde, jurídico) sem suporte.

Você é o **terceiro filtro** do pipeline de revisão (depois de `revisor-coerencia` e `revisor-brand`). Como `revisor-brand`, sua decisão é binária: APROVADO ou REPROVADO.

## Contexto que carrego

Arquivos lidos automaticamente antes de qualquer tarefa:
- `brand/brand-book.md` — o que a marca prometeu publicamente / o que ela NÃO é.

Sob demanda:
- `brand/compliance/termos-vetados.md` (quando existir — cresce orgânicamente).
- Artefatos apontados pela skill.

Se `brand/brand-book.md` estiver vazio, devolva
`BRAND_BOOK_INCOMPLETO — rodar /brand-discovery antes`.

## Princípios da especialidade

- **Promessa concreta = exige base.** "Você vai ganhar 5kg em 30 dias" sem caveat é REPROVADO; "Volume + intensidade + frequência geram hipertrofia em adultos saudáveis" é defensável.
- **Saúde tem categoria própria.** "Cura", "trata", "alivia [condição médica]" é REPROVADO por padrão — marca não é serviço médico.
- **Jurídico: não prometa o que não controla.** "Garantia de resultado", "satisfação 100%" sem amparo contratual é REPROVADO.
- **Suplementação fora de escopo do treinador.** Conforme `treinador.md` declara: não prescrevemos suplemento/ergogênico em conteúdo institucional. Artefato que prescreve é REPROVADO.
- **Binário.** APROVADO ou REPROVADO.
- **Aponte arquivo + trecho + categoria violada.**

## Categorias iniciais de compliance

| Categoria | Sinais a investigar |
|---|---|
| **Saúde** | "cura", "trata", "alivia", "previne", "diagnostica", referências a doenças/condições médicas, claims sobre suplementos |
| **Jurídico** | "garantia", "100% de satisfação", "se não funcionar devolvemos", afirmações contratuais sem base |
| **Suplementação / ergogênico** | nomes específicos de suplementos prescritos como solução, marcas, dosagens, claims de aumento de performance via substância |
| **Promessas irreais** | "5kg em 30 dias", "transformação em X semanas" sem caveat de variabilidade individual |

Lista cresce orgânicamente. Quando identificar um termo recorrente, sinalize ao usuário para incluir em `brand/compliance/termos-vetados.md`.

## Contrato de entrada

- **Tarefa:** "validar compliance do artefato".
- **Inputs:** caminhos dos artefatos.
- **Saída:** `inline` (parecer markdown).

Sem `Tarefa` ou `Inputs`, devolvo `INPUT_INSUFICIENTE — <o que falta>`.

## Contrato de saída

```
## Parecer compliance

**Status:** APROVADO | REPROVADO

**Categorias varridas:**
- Saúde: {ok / violação específica com arquivo + trecho}
- Jurídico: {ok / violação}
- Suplementação: {ok / violação}
- Promessas irreais: {ok / violação}

**Pontos críticos** (se REPROVADO):
- {arquivo}: {trecho} → categoria: {nome} → ação: {remover / reescrever sem promessa}

**Decisão:** {1 frase}
```

## Anti-padrões

- Aprovar com ajustes (não existe — REPROVADO se há violação real).
- Reescrever artefato.
- Reprovar por questão de tom (escopo do `revisor-brand`).
- Reprovar por questão de coerência com briefing (escopo do `revisor-coerencia`).

## Quando devolver erro

- `BRAND_BOOK_INCOMPLETO` — `brand-book.md` vazio.
- `INPUT_INSUFICIENTE — <o que falta>` — sem artefatos.
- `ESCOPO_FORA_DE_COMPLIANCE — <razão>` — pedido é identidade ou coerência editorial.
```

- [ ] **Step 2: Verificar frontmatter**

```bash
head -5 .claude/agents/transversais/brand/revisor-compliance.md
```

Esperado: `name: revisor-compliance`.

- [ ] **Step 3: Smoke test do roteamento**

```
Task(subagent_type="revisor-compliance", prompt="Tarefa: responder SMOKE_OK_COMPLIANCE.")
```

Esperado: agente encontrado.

- [ ] **Step 4: Não commitar ainda.**

---

### Task 5: Atualizar `/novo-post` — Passos 2b, 4 e 11

**Files:**
- Modify: `.claude/skills/novo-post/SKILL.md`

**Mudanças:**
1. **Tabela de agentes** (~linhas 33-41): remover linha `diretor-marca`; adicionar linhas `briefing-writer`, `revisor-coerencia`, `revisor-brand`, `revisor-compliance`.
2. **Passo 2b** (~linhas 73-89): trocar invocação `diretor-marca` por `briefing-writer`.
3. **Passo 4** (~linhas 173-207): trocar invocação `diretor-marca` por `briefing-writer`.
4. **Passo 11** (~linhas 399-419): substituir invocação única de `diretor-marca` por sequência `revisor-coerencia → revisor-brand → revisor-compliance` com gating.

- [ ] **Step 1: Substituir a tabela de agentes (Passo "## Agentes")**

Trecho atual a substituir (linhas começando em `| Agente |`):

```markdown
| Agente | Responsabilidade | Input | Output |
|---|---|---|---|
| `pesquisa-tendencias` | Scouting de tema + pesquisa profunda | formato/estilo OU briefing | sugestão inline (scouting) OU `export/pesquisa/<data>-tendencias-<slug>.md` |
| `diretor-marca` | Recomendação de estilo (P2b) + briefing estratégico (P4) + curadoria editorial final (P11) | formato+tema (P2b) / formato+estilo+tema (P4) / pasta+briefing (P11) | recomendação inline (P2b) / briefing inline (P4) / parecer + `briefing.md` (P11) |
| `designer` | Estilo ad-hoc em `_rascunho/` (P3) + assets do post + preview consolidado (P9) | refs visuais + contrato (P3) / estilo + copy (P9) | `estilo.md` + arquivo principal + `preview.html` (P3) / `design/*.html` + `design/preview.html` (P9) |
| `treinador` | Prescrição técnica de treino | exercícios + objetivo + recorte | `treino.md` |
| `copywriter` | Copy do post | pesquisa + briefing + `estilo.md` (+ `treino.md`) | `copy.md` |
| `curador-export` | Validação técnica + export PNG | `design/` + `estilo.md` | status inline + `export/*.png` |
```

Substituir por:

```markdown
| Agente | Responsabilidade | Input | Output |
|---|---|---|---|
| `pesquisa-tendencias` | Scouting de tema + pesquisa profunda | formato/estilo OU briefing | sugestão inline (scouting) OU `export/pesquisa/<data>-tendencias-<slug>.md` |
| `briefing-writer` | Recomendação de estilo (P2b) + briefing estratégico (P4) | formato+tema (P2b) / formato+estilo+tema (P4) | recomendação inline (P2b) / briefing inline (P4) |
| `designer` | Estilo ad-hoc em `_rascunho/` (P3) + assets do post + preview consolidado (P9) | refs visuais + contrato (P3) / estilo + copy (P9) | `estilo.md` + arquivo principal + `preview.html` (P3) / `design/*.html` + `design/preview.html` (P9) |
| `treinador` | Prescrição técnica de treino | exercícios + objetivo + recorte | `treino.md` |
| `copywriter` | Copy do post | pesquisa + briefing + `estilo.md` (+ `treino.md`) | `copy.md` |
| `curador-export` | Validação técnica + export PNG | `design/` + `estilo.md` | status inline + `export/*.png` |
| `revisor-coerencia` | Curadoria editorial (P11a) — coerência artefato vs. briefing; pode aprovar com ajustes | pasta + briefing | parecer inline |
| `revisor-brand` | Validação de identidade da marca (P11b) — binário | pasta + briefing | APROVADO/REPROVADO inline |
| `revisor-compliance` | Validação de compliance (P11c) — binário | pasta | APROVADO/REPROVADO inline |
```

- [ ] **Step 2: Atualizar o Passo 2b — invocação na sugestão de estilo**

Trecho atual a substituir (dentro de `#### 2b. Estilo (sabendo o tema)`):

```markdown
- **Estilo veio no input** → `modo_estilo = "definido"`, `slug = <escolhido>`.
- **Sem estilo** → acione `diretor-marca`:
```

Substituir por:

```markdown
- **Estilo veio no input** → `modo_estilo = "definido"`, `slug = <escolhido>`.
- **Sem estilo** → acione `briefing-writer`:
```

E o texto que segue dentro do code block que diz `Saída inline:` (ainda no Passo 2b) — substituir a linha `- Recomendação: <slug recomendado> | "ad-hoc"` mantendo o mesmo formato. Não há mais mudanças no prompt em si — `briefing-writer` aceita tarefa "recomendar estilo".

Atualizar também a frase logo após o code block:

Atual:
```
Apresente a recomendação ao usuário:
```

Mantém-se igual.

Mais abaixo, atual:
```
Motivo: <motivo do diretor>
```

Substituir por:
```
Motivo: <motivo do briefing-writer>
```

- [ ] **Step 3: Atualizar o Passo 4 — invocação no briefing estratégico**

Trecho atual a substituir (cabeçalho do Passo 4):

```markdown
### 4. Briefing estratégico

Acione `diretor-marca`:
```

Substituir por:

```markdown
### 4. Briefing estratégico

Acione `briefing-writer`:
```

O prompt completo dentro do code block do Passo 4 **não muda** — `briefing-writer` aceita exatamente o mesmo contrato.

- [ ] **Step 4: Reescrever o Passo 11 — sequência de 3 revisores**

Trecho atual a substituir (Passo 11 inteiro, da linha "### 11. Curadoria editorial final" até "Em REPROVADO, reabra a etapa apontada, refaça e reentregue à curadoria. Repita até APROVADO."):

```markdown
### 11. Curadoria editorial final

Acione `diretor-marca`:

```
Tarefa: dar parecer editorial sobre o post pronto e, se aprovado, consolidar o briefing institucional.

Inputs:
- Pasta do post: export/conteudos/<formato>/<data>-<slug>/
  (pesquisa-base.md, copy.md, design/preview.html, design/*.html, export/*.png, treino.md quando aplicável)
- Briefing estratégico original (inline):
  <briefing guardado no Passo 4, na íntegra>

Avalie em 4 dimensões: alinhamento com brand book; coerência com briefing original (ângulo, pilar, objetivo, recorte); qualidade editorial (hook, 1 ideia por bloco, concreto > abstrato, CTA específico); integridade técnica (qtd. PNGs = qtd. assets; pesquisa-base.md presente).

Decida APROVADO ou REPROVADO.
- APROVADO: consolide o briefing institucional usando templates/briefing.md (sem variações A/B, sem rastros de processo) e grave em export/conteudos/<formato>/<data>-<slug>/briefing.md.
- REPROVADO: devolva parecer inline com arquivo + ponto + etapa a refazer. Não consolide.

Saída: parecer inline.
```

Em REPROVADO, reabra a etapa apontada, refaça e reentregue à curadoria. Repita até APROVADO.
```

Substituir por:

```markdown
### 11. Curadoria editorial final

Três revisões em sequência. Toda reprovação **interrompe** a sequência e devolve a etapa apontada para refazer. Só após APROVADO em todos os três, o briefing institucional é consolidado.

#### 11a. Coerência (`revisor-coerencia`)

```
Tarefa: dar parecer editorial sobre o post pronto.

Inputs:
- Pasta do post: export/conteudos/<formato>/<data>-<slug>/
  (pesquisa-base.md, copy.md, design/preview.html, design/*.html, export/*.png, treino.md quando aplicável)
- Briefing estratégico original (inline):
  <briefing guardado no Passo 4, na íntegra>

Avalie 4 dimensões: alinhamento com brand book; coerência com briefing original (ângulo, pilar, objetivo, recorte); qualidade editorial (hook, 1 ideia por bloco, concreto > abstrato, CTA específico); integridade técnica (qtd. PNGs = qtd. assets; pesquisa-base.md presente).

Saída: parecer inline.
Status válidos: APROVADO | APROVADO COM AJUSTES | REPROVADO.
```

- **APROVADO** ou **APROVADO COM AJUSTES** → seguir para 11b. Se AJUSTES, anotar os pontos para aplicar depois ou em iteração rápida com `copywriter`/`designer` antes de seguir.
- **REPROVADO** → reabra a etapa apontada, refaça, e re-rode 11a.

#### 11b. Brand (`revisor-brand`)

```
Tarefa: validar identidade da marca no post pronto.

Inputs:
- Pasta do post: export/conteudos/<formato>/<data>-<slug>/
- Briefing estratégico original (inline):
  <briefing guardado no Passo 4, na íntegra>

Avalie tom de voz, paleta/tipografia, pilar, mood/identidade visual contra brand/. Decisão binária.

Saída: parecer inline.
Status válidos: APROVADO | REPROVADO.
```

- **APROVADO** → seguir para 11c.
- **REPROVADO** → reabra a etapa apontada (em geral copy ou design) e re-rode 11a desde o início.

#### 11c. Compliance (`revisor-compliance`)

```
Tarefa: validar compliance do post pronto.

Inputs:
- Pasta do post: export/conteudos/<formato>/<data>-<slug>/

Varra saúde, jurídico, suplementação, promessas irreais. Decisão binária.

Saída: parecer inline.
Status válidos: APROVADO | REPROVADO.
```

- **APROVADO** → consolidar briefing institucional usando `templates/briefing.md` (sem variações A/B, sem rastros de processo) e gravar em `export/conteudos/<formato>/<data>-<slug>/briefing.md`. **Este é o último passo da curadoria.**
- **REPROVADO** → reabra `copy` ou `design` e re-rode 11a desde o início.
```

- [ ] **Step 5: Verificar todas as edições**

```bash
grep -n "diretor-marca" .claude/skills/novo-post/SKILL.md
```

Esperado: **nenhum match**. Se houver, alguma menção foi esquecida — corrigir.

```bash
grep -n "briefing-writer\|revisor-coerencia\|revisor-brand\|revisor-compliance" .claude/skills/novo-post/SKILL.md
```

Esperado: múltiplos matches cobrindo a tabela, P2b, P4 e P11.

- [ ] **Step 6: Diff visual**

```bash
git diff .claude/skills/novo-post/SKILL.md | head -100
```

Esperado: mudanças concentradas na tabela de agentes, Passos 2b, 4 e 11. Nenhuma mudança em Passos 1, 3, 5-10, 12-13.

- [ ] **Step 7: Não commitar ainda.**

---

### Task 6: Atualizar `/lote-posts` — Passos 5 e 8

**Files:**
- Modify: `.claude/skills/lote-posts/SKILL.md`

**Mudanças:**
1. Tabela de agentes: remover `diretor-marca`; adicionar `briefing-writer`, `revisor-coerencia`, `revisor-brand` (+ opcional `revisor-compliance`).
2. Passo 5: o briefing por post é produzido por `briefing-writer`.
3. Passo 8: a curadoria editorial por post passa por `revisor-coerencia → revisor-brand → revisor-compliance`.

- [ ] **Step 1: Atualizar a tabela de agentes**

Trecho atual:

```markdown
| Agente | Responsabilidade | Quando aciona |
|---|---|---|
| `pesquisa-tendencias` | Sugerir distribuição de estilos (se nenhum foi informado) e gerar lista de N subtemas mapeados aos estilos. | Passos 3 e 4 |
| Pipeline `/novo-post` (briefing → pesquisa → copy) | Executa até a copy de cada post. | Passo 5 |
| Pipeline `/novo-post` (design) | Executa o design de cada post após aprovação da copy. | Passo 7 |
| `curador-export` | Valida e exporta PNGs por post. | Passo 8 |
| `diretor-marca` | Curadoria editorial final por post. | Passo 8 |
```

Substituir por:

```markdown
| Agente | Responsabilidade | Quando aciona |
|---|---|---|
| `pesquisa-tendencias` | Sugerir distribuição de estilos (se nenhum foi informado) e gerar lista de N subtemas mapeados aos estilos. | Passos 3 e 4 |
| `briefing-writer` | Briefing estratégico por post. | Passo 5 |
| Pipeline `/novo-post` (pesquisa → copy) | Executa pesquisa e copy de cada post. | Passo 5 |
| Pipeline `/novo-post` (design) | Executa o design de cada post após aprovação da copy. | Passo 7 |
| `curador-export` | Valida e exporta PNGs por post. | Passo 8 |
| `revisor-coerencia` + `revisor-brand` + `revisor-compliance` | Curadoria editorial em 3 etapas por post. | Passo 8 |
```

- [ ] **Step 2: Atualizar a referência interna no Passo 5**

Trecho atual:

```markdown
- **Briefing estratégico** (`diretor-marca`) — extraia `slug-do-post`.
```

Substituir por:

```markdown
- **Briefing estratégico** (`briefing-writer`) — extraia `slug-do-post`.
```

- [ ] **Step 3: Reescrever o item 3 do Passo 8**

Trecho atual:

```markdown
3. [Agente: `diretor-marca`] → parecer editorial.
   - APROVADO → grava `briefing.md`.
   - REPROVADO → registra o parecer e marca o post como pulado (refazer é responsabilidade do `/novo-post`).
```

Substituir por:

```markdown
3. Curadoria editorial em sequência:
   a. [Agente: `revisor-coerencia`] → parecer de coerência. APROVADO ou APROVADO COM AJUSTES → segue para 3b. REPROVADO → registra e marca o post como pulado (refazer é responsabilidade do `/novo-post`).
   b. [Agente: `revisor-brand`] → parecer de identidade. APROVADO → segue para 3c. REPROVADO → registra e marca como pulado.
   c. [Agente: `revisor-compliance`] → parecer de compliance. APROVADO → grava `briefing.md`. REPROVADO → registra e marca como pulado.
```

- [ ] **Step 4: Verificar todas as menções**

```bash
grep -n "diretor-marca" .claude/skills/lote-posts/SKILL.md
```

Esperado: nenhum match.

```bash
grep -n "briefing-writer\|revisor-coerencia\|revisor-brand\|revisor-compliance" .claude/skills/lote-posts/SKILL.md
```

Esperado: matches na tabela, Passo 5, Passo 8.

- [ ] **Step 5: Diff visual**

```bash
git diff .claude/skills/lote-posts/SKILL.md | head -60
```

Esperado: mudanças concentradas em tabela de agentes, Passo 5 (1 linha) e Passo 8 (item 3 reescrito). Nada nos demais passos.

- [ ] **Step 6: Não commitar ainda.**

---

### Task 7: Atualizar `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md` (seção "3. Agentes" — atualizada na Onda 1)

- [ ] **Step 1: Localizar e substituir o item `diretor-marca` em Transversais / Brand**

Trecho atual (deixado pela Onda 1):

```markdown
- **Transversais / Brand**
  - [`diretor-marca`](.claude/agents/transversais/brand/diretor-marca.md) — estratégia e curadoria editorial (será quebrado em `briefing-writer`, `revisor-coerencia` e `revisor-brand` na Onda 2).
```

Substituir por:

```markdown
- **Marketing / Estratégia**
  - [`briefing-writer`](.claude/agents/marketing/estrategia/briefing-writer.md) — recomendação de estilo e briefing estratégico canônico.
- **Marketing / Revisão**
  - [`revisor-coerencia`](.claude/agents/marketing/revisao/revisor-coerencia.md) — coerência editorial do artefato com o briefing.
- **Transversais / Brand**
  - [`revisor-brand`](.claude/agents/transversais/brand/revisor-brand.md) — guardião transversal da identidade da marca (decisão binária).
  - [`revisor-compliance`](.claude/agents/transversais/brand/revisor-compliance.md) — compliance: promessas proibidas e claims sensíveis.
```

Também atualizar o item de `revisor-coerencia` que aparece dentro de **Marketing / Revisão** já existente (deixado pela Onda 1, que tinha `curador-export` como único filho de `marketing/revisao/`). Se a Onda 1 colocou `curador-export` sozinho num bullet de Marketing/Revisão, basta adicionar o `revisor-coerencia` como segundo bullet.

Resultado esperado da seção Marketing/Revisão:

```markdown
- **Marketing / Revisão**
  - [`curador-export`](.claude/agents/marketing/revisao/curador-export.md) — validação técnica + export PNG.
  - [`revisor-coerencia`](.claude/agents/marketing/revisao/revisor-coerencia.md) — coerência editorial do artefato com o briefing.
```

- [ ] **Step 2: Remover a frase "será quebrado…" agora obsoleta**

A nota sobre quebra na Onda 2 já não cabe mais — o trabalho foi feito.

- [ ] **Step 3: Verificar resultado**

```bash
sed -n '/### 3. Agentes/,/^---$/p' CLAUDE.md
```

Esperado: vê os 4 novos agentes (`briefing-writer`, `revisor-coerencia`, `revisor-brand`, `revisor-compliance`) listados; `diretor-marca` não aparece em lugar algum.

- [ ] **Step 4: Confirmar que só a seção "3. Agentes" mudou**

```bash
git diff --stat CLAUDE.md
```

Esperado: 1 file changed, mudanças localizadas.

- [ ] **Step 5: Não commitar ainda.**

---

### Task 8: Smoke test funcional — invocar os 4 agentes novos + roteamento das skills

**Files:** (nenhum modificado)

- [ ] **Step 1: Confirmar os 4 agentes novos resolvíveis**

```
Task(subagent_type="briefing-writer", prompt="Tarefa: SMOKE_OK_BRIEFING.")
Task(subagent_type="revisor-coerencia", prompt="Tarefa: SMOKE_OK_COERENCIA.")
Task(subagent_type="revisor-brand", prompt="Tarefa: SMOKE_OK_BRAND.")
Task(subagent_type="revisor-compliance", prompt="Tarefa: SMOKE_OK_COMPLIANCE.")
```

Esperado: os 4 são encontrados.

- [ ] **Step 2: Confirmar que `diretor-marca` está extinto**

```
Task(subagent_type="diretor-marca", prompt="qualquer coisa")
```

Esperado: agente não encontrado.

- [ ] **Step 3: Rodar `/novo-post carrossel <tema-rápido>` em modo dry até o briefing**

Acompanhar a execução até o Passo 4. Verificar:
- No P2b, a recomendação de estilo é entregue pelo `briefing-writer` (não há mais referência a "diretor de marca" na mensagem do assistente).
- No P4, o briefing canônico é entregue pelo `briefing-writer` no mesmo formato.

Pode abortar após o P4 — não precisa rodar até o Passo 11.

- [ ] **Step 4: (Opcional, alto valor) Rodar `/novo-post` até o Passo 11**

Verificar que 11a, 11b e 11c são executados em sequência, na ordem certa, com a interrupção correta em caso de REPROVADO. Pode usar um post simples já criado.

- [ ] **Step 5: Caso QUALQUER smoke test falhe — reverter**

```bash
git checkout -- .claude/agents/ .claude/skills/ CLAUDE.md
```

Em seguida, registrar o problema com o usuário antes de re-tentar.

---

### Task 9: Commit único da Onda 2

**Files:** (todos os listados)

- [ ] **Step 1: Conferir o `git status`**

```bash
git status
```

Esperado:
- 1 arquivo renomeado (`diretor-marca.md -> revisor-brand.md`) — com mudança de conteúdo (substituição completa).
- 3 arquivos novos: `briefing-writer.md`, `revisor-coerencia.md`, `revisor-compliance.md`.
- 3 arquivos modificados: `novo-post/SKILL.md`, `lote-posts/SKILL.md`, `CLAUDE.md`.

- [ ] **Step 2: Conferir diff agregado**

```bash
git diff --cached --stat
```

Esperado: 7 arquivos no conjunto, contando o rename como modificação.

- [ ] **Step 3: Stage e commit**

```bash
git add .claude/agents/ .claude/skills/novo-post/SKILL.md .claude/skills/lote-posts/SKILL.md CLAUDE.md
git commit -m "$(cat <<'EOF'
refactor(arquitetura): quebra diretor-marca em 3 agentes especializados (Onda 2)

Conforme spec docs/specs/2026-05-22-arquitetura-multi-setor-design.md §6.3:

- briefing-writer (marketing/estrategia/) — absorve recomendação de estilo
  (P2b) e briefing estratégico (P4) de /novo-post + briefing por post de
  /lote-posts. Pode aprovar com ajustes.

- revisor-coerencia (marketing/revisao/) — absorve a curadoria editorial
  final (P11a / Passo 8 de /lote-posts): coerência interna do artefato
  com o briefing. Aprovado / Aprovado com ajustes / Reprovado.

- revisor-brand (transversais/brand/) — renomeado de diretor-marca.
  Guardião transversal da identidade da marca. Binário: APROVADO ou
  REPROVADO. P11b.

- revisor-compliance (transversais/brand/, novo) — terceiro filtro do
  pipeline de revisão. Saúde, jurídico, suplementação, promessas
  irreais. P11c.

Skills /novo-post e /lote-posts atualizadas: P2b/P4 invocam
briefing-writer; P11 vira sequência revisor-coerencia → revisor-brand →
revisor-compliance com gating de aprovação. Diretor-marca não existe
mais.

CLAUDE.md atualizado. Comportamento observável do pipeline preservado.

Próxima onda (Onda 3): Banco de Inteligência mínimo + archivist-ramon +
renomear pesquisa-tendencias → pesquisador-mercado.
EOF
)"
```

- [ ] **Step 4: Confirmar commit**

```bash
git log -1 --stat | head -40
```

Esperado: o commit recém-criado com os 7 arquivos.

---

## Critério de conclusão da Onda 2

- [ ] `.claude/agents/marketing/estrategia/briefing-writer.md` existe com frontmatter correto.
- [ ] `.claude/agents/marketing/revisao/revisor-coerencia.md` existe com frontmatter correto.
- [ ] `.claude/agents/transversais/brand/revisor-brand.md` existe (renomeado de `diretor-marca.md`), com conteúdo reescrito focado em identidade.
- [ ] `.claude/agents/transversais/brand/revisor-compliance.md` existe (esqueleto inicial).
- [ ] `.claude/skills/novo-post/SKILL.md` não menciona mais `diretor-marca`; menciona `briefing-writer` em P2b/P4 e `revisor-coerencia/brand/compliance` em P11.
- [ ] `.claude/skills/lote-posts/SKILL.md` idem para Passos 5 e 8.
- [ ] `CLAUDE.md` lista os 4 agentes novos e não tem mais `diretor-marca`.
- [ ] Smoke tests passaram: os 4 agentes novos respondem; `diretor-marca` não é encontrado; `/novo-post` chega ao Passo 4 com `briefing-writer` ativo.
- [ ] Skills `/novo-post`, `/lote-posts`, `/novo-estilo`, `/brand-discovery` continuam entregando o mesmo output ao usuário.
