# Scouting de Conteúdo Viral em Duas Fases — Design Doc

> Como o sistema passa a descobrir conteúdo em alta no mercado, ranquear candidatos por potencial de engajamento e selecioná-los sem fugir do branding — sem criar agente novo.
> Escopo do v1: skill `/novo-post`. Demais skills herdam depois.

---

## 1. Visão geral

### 1.1 Problema

A fase de scouting do `/novo-post` (Passo 2a) é hoje um chute informado: o `pesquisador-mercado` devolve **um** tema sugerido em 3-4 linhas, "rápido/decisório", ancorado em pilar/público/tendência. Disso decorre:

- **Não há descoberta sistemática do que está viralizando** nos nichos da marca (treino/hipertrofia, motivação-filosofia, informacional). O agente tem WebSearch/WebFetch, mas nada no fluxo manda varrer nem medir viralidade.
- **Não há ranqueamento por potencial de engajamento.** Volta um tema só, sem comparar candidatos.
- **A análise de concorrente dorme.** O `pesquisador-mercado` é owner de `dados/mercado/concorrentes/` e `tendencias/`, mas essas pastas estão vazias e o pipeline nunca pede mineração de padrão de comunicação.

### 1.2 Visão

Transformar o scouting num **funil de pesquisa de três profundidades**, onde uma inteligência de mercado durável e acumulada alimenta uma seleção rápida e ranqueada de candidatos, que por sua vez alimenta a pesquisa profunda já existente. O conteúdo deixa de ser escolhido por intuição e passa a ter lastro de mercado — sem nunca sair dos pilares da marca.

### 1.3 Princípios condutores

Herdados do `CLAUDE.md` e do design de arquitetura multi-setor:

- **Um agente domina uma função.** Descobrir tendência/concorrente já é território declarado do `pesquisador-mercado`. A função não é nova — está dormindo. Logo: **adaptar o agente, não criar um novo.**
- **Owner único de slice.** `dados/mercado/` tem um dono só. Agente novo fraturaria isso.
- **Capacidade durável vive no agente; orquestração vive na skill.** "Como varrer viral, que sinais olhar, como ranquear, onde gravar" é capacidade durável → mora no agente. Ordem, pausas e frescor → moram na skill.
- **Brand é guard-rail nativo.** O `pesquisador-mercado` já carrega `brand-book`, `publico-alvo`, `pilares-conteudo` e o erro `FORA_DE_PILAR`. Manter o scouting nele é o que garante "não fugir do branding".

### 1.4 YAGNI rigoroso

Fora do v1 (ver §7): integração Graph API do IG, cron de pré-aquecimento, ranqueamento por performance aprendida, adoção por `/lote-posts` e `/planejar-pauta-semanal`. O v1 estabelece o alicerce; o escopo cresce sem refatorar.

---

## 2. Arquitetura — o funil de pesquisa

Três momentos de pesquisa, três propósitos, três custos. **Os três coexistem** — o projeto adiciona os dois primeiros e enriquece o terceiro; não substitui nada.

| Momento | Pergunta que responde | Escopo | Onde grava | Custo |
|---|---|---|---|---|
| **Fase A — Inteligência de mercado** *(novo)* | "O que está em alta no nicho agora, no geral?" | Largo, panorâmico | `dados/mercado/tendencias/` + `concorrentes/` + `vocabulario-publico.md` | Caro, mas **cacheado** (roda de vez em quando) |
| **Fase B — Seleção ranqueada** *(novo; substitui o P2a)* | "Qual desses tem mais potencial **e** cabe na marca?" | Escolha entre candidatos | nada (lê o cache, devolve inline) | Barato |
| **P7 — Pesquisa profunda do ângulo** *(existente; enriquecido)* | "Fechado nesse ângulo — qual a matéria-prima verificável pra copy ter substância?" | Fundo, só do ângulo escolhido | `dados/pesquisas-brutas/<data>-...md` | Caro, focado |

**Leitura:** Fase A varre o terreno → Fase B escolhe o tema → P7 cava fundo no escolhido. O scouting decide *sobre o que falar*; o P7 decide *o que dizer com lastro*.

**Sinergia:** como a Fase A já populou `dados/mercado/`, o P7 passa a receber esse contexto como input — não redescobre tendências, parte de um patamar mais alto. O P7 melhora de graça, sem reescrita.

---

## 3. Componentes

### 3.1 `pesquisador-mercado` — dois modos nomeados

A capacidade mora no agente; a skill aciona. Adicionar à definição do agente (`.claude/agents/pesquisador-mercado.md`) dois tipos de tarefa explícitos, com metodologia.

#### 3.1.1 Modo `scouting de mercado` (Fase A)

- **O que faz:** varre, via WebSearch+WebFetch, os nichos dos pilares da marca (treino/hipertrofia, motivação-filosofia/disciplina, informacional). Procura: temas em alta, ângulos recorrentes, padrão de comunicação de concorrentes, e os **sinais de engajamento observáveis publicamente** (views/comentários no YouTube, volume de discussão, recorrência de cobertura).
- **Escreve no slice próprio:**
  - `dados/mercado/tendencias/<YYYY-MM>.md` — o que está quente no mês, organizado por pilar, com fonte + sinal observado. Cria o arquivo se não existir.
  - `dados/mercado/concorrentes/<slug>.md` — padrão de comunicação validado por concorrente relevante (hooks recorrentes, formatos, tom, cadência) — só o observável na web pública.
  - `dados/mercado/vocabulario-publico.md` — enriquece com termos/jargões/dores em linguagem do leitor.
- **Guard-rail:** só sobe o que casa com um pilar declarado (`FORA_DE_PILAR` continua válido).
- **Fontes no v1:** apenas WebSearch + WebFetch (web pública — artigos de tendência, blogs, YouTube, discussão de nicho). Sem credenciais novas. Ver §7 para o caminho Graph API.

#### 3.1.2 Modo `seleção de candidatos` (Fase B)

- **O que faz:** lê o slice `dados/mercado/` acumulado + `dados/performance/angulos-queimados.md` (evita ângulo repetido) + pilares. Devolve **N candidatos ranqueados** (default 3-5), inline, **sem escrever no slice**.
- **Formato de cada candidato:**

  ```
  N. <ângulo em 1 linha>  [pilar: <X>]
     Sustentação: <tendência/concorrente que embasa> — <fonte>
     Potencial: <por que engaja, 1 linha — sinal observado>
  ```

- **Honestidade do "potencial" no v1:** é **estimativa de sinal de mercado** (sinal observado + frescor + saturação do ângulo) filtrada por fit de marca — **não** modelo aprendido. Quando `analista-performance` tiver dado de publicação real, ele realimenta (§7).

### 3.2 Contrato de frescor + auto-heal

A **skill** decide (orquestra); o **agente** executa.

- **Regra de frescor (default):** o slice está **fresco** se `dados/mercado/tendencias/<mês-atual em YYYY-MM>.md` existe **e** foi modificado nos últimos **14 dias**. Caso contrário → **stale**.
- **Fluxo no passo de scouting da skill:**
  1. Skill checa o frescor do arquivo do mês.
  2. **Stale/vazio** → aciona Fase A (avisa ao usuário: "atualizando inteligência de mercado…"; caminho lento) → agente grava o slice.
  3. Aciona Fase B → devolve candidatos ranqueados.
  4. **Fresco** → pula o passo 2, vai direto à Fase B (caminho rápido).
- **Garantia:** a Fase B **nunca** opera em dado vazio/velho — independe de cron. Quando o cron pré-aquecedor existir (§7), ele só faz o passo 2 cair quase sempre no ramo rápido; a correção continua intrínseca.

### 3.3 `briefing-writer` — regra de seleção + leitura do slice

#### 3.3.1 A fronteira de papel (ponto delicado resolvido)

A Fase B *propõe* ângulo+pilar com lastro de mercado; o `briefing-writer` é a **autoridade do ângulo** e o **estrategista de registro**. Princípio:

> Pesquisador **pesquisa e propõe**; briefing-writer **decide e formaliza**.

#### 3.3.2 Regra unificada de seleção (interativo vs. automatizado)

O `pesquisador-mercado` (Fase B) **sempre ranqueia**. Quem **escolhe** o candidato depende do modo de execução:

| Modo | Quem escolhe | Quem formaliza |
|---|---|---|
| **Interativo** (humano presente — `/novo-post` no v1) | O **humano**, na pausa de seleção | `briefing-writer` |
| **Automatizado** (sem humano — triggers futuros) | O **`briefing-writer`** (topo do ranking, ajustado por fit de marca + contexto Ramon + ângulos queimados) | `briefing-writer` |

**Contrato único de input do `briefing-writer`:** sempre recebe **a lista ranqueada + (opcional) a escolha do humano**.
- Escolha presente → formaliza **aquele** candidato (humano vence).
- Escolha ausente (modo auto) → **seleciona** o melhor-fit e formaliza.

Um só contrato serve aos dois modos — é o que torna o `/novo-post` interativo de hoje e o cron de amanhã usarem a **mesma** peça. No v1 o único consumidor é interativo (sempre há humano escolhendo); a capacidade de auto-seleção fica **desenhada e pronta no agente**, exercitada só quando triggers automatizados adotarem o bloco de scouting. Custo zero a mais no v1.

#### 3.3.3 Leitura adicional do slice de mercado

O `briefing-writer` passa a ler automaticamente `dados/mercado/tendencias/<mês-atual>.md` e `dados/mercado/concorrentes/*.md` (hoje lê `ramon/contexto.md` + `performance/angulos-queimados.md`). Briefing fica market-aware. Aplica a mesma regra de ausência já vigente: se o slice estiver vazio, segue sem ele e declara a ausência nas `## Sinalizações`.

---

## 4. Mudanças no pipeline `/novo-post`

| Passo | Mudança |
|---|---|
| **P2a** | **Reescrito.** Vira o scouting de duas fases: checa frescor → auto-heal Fase A (se stale) → Fase B ranqueada → seleção. **Preserva o bypass:** se o tema veio no input, pula o scouting inteiro. O auto-heal + ranqueamento só disparam no ramo "sem tema". |
| **P2b** | **Inalterado** (recomendação de estilo, depois do tema definido). |
| **P4** | `briefing-writer` agora lê `dados/mercado/` (§3.3.3) e recebe a lista ranqueada + escolha como input (§3.3.2). Schema do briefing inalterado. |
| **P7** | Recebe `dados/mercado/` como contexto adicional → mais afiado, não redescobre tendência. Resto inalterado. |

Passos 1, 3, 5, 6, 8-14 **inalterados** (parse, rascunho ad-hoc, pasta, inputs externos, copy, design, curadoria, export, publicação).

### 4.1 Novo formato do P2a (pausa de seleção, modo interativo)

```
Candidatos (ranqueados por potencial):

1. <ângulo>  [pilar: <X>]
   Sustentação: <tendência/concorrente> — <fonte>
   Potencial: <por que engaja>
2. ...

Responda:
- <número> → escolhe o candidato
- "mais"   → re-ranqueia / traz outros
- ajuste em texto livre
- ou dê seu próprio tema (bypass — sua escolha vence)
```

---

## 5. Slices de dados afetados

- **`dados/mercado/tendencias/<YYYY-MM>.md`** — passa a ser escrito pela Fase A (antes: previsto, vazio). Owner: `pesquisador-mercado`.
- **`dados/mercado/concorrentes/<slug>.md`** — passa a ser escrito pela Fase A (antes: previsto, vazio). Owner: `pesquisador-mercado`.
- **`dados/mercado/vocabulario-publico.md`** — enriquecido pela Fase A. Owner: `pesquisador-mercado`.
- **`dados/performance/angulos-queimados.md`** — lido pela Fase B (já era lido pelo `briefing-writer`). Sem mudança de owner.
- Nenhum slice muda de owner; nenhum slice novo é criado.

---

## 6. Critérios de aceite

- A definição do `pesquisador-mercado` declara os dois modos (`scouting de mercado`, `seleção de candidatos`) com metodologia, sinais de engajamento observáveis e convenção de escrita no slice.
- A definição do `briefing-writer` declara a leitura do slice `dados/mercado/` e a regra unificada de seleção (recebe lista ranqueada + escolha opcional; seleciona quando a escolha está ausente).
- O `/novo-post` P2a, no ramo "sem tema", checa frescor do slice, dispara Fase A quando stale, e apresenta candidatos ranqueados no formato de §4.1.
- O bypass por tema no input continua funcionando (não dispara Fase A nem Fase B).
- P4 e P7 recebem o slice `dados/mercado/` como input.
- Nenhuma credencial nova é exigida para o v1 rodar.
- Os passos de copy, design, curadoria, export e publicação permanecem byte-idênticos no comportamento.

---

## 7. Fora de escopo / costuras futuras

Desenhadas para encaixar sem refatorar:

- **`fetch_instagram_competitors.js`** (Graph API — Business Discovery + Hashtag Search), construído pelo `integrador-apis` reusando o app/token Meta do `publish_instagram.js`. Daria métrica real de engajamento do IG. A Fase A passaria a lê-lo quando existir. Exige ligar as credenciais Meta (hoje pendentes).
- **Cron de pré-aquecimento da Fase A** via `orquestracao/rotas.yaml` — mantém o slice fresco proativamente; o auto-heal vira fallback. Reusa a infra de cron já existente (pauta semanal).
- **Ranqueamento por performance aprendida** — quando `analista-performance` acumular dado de publicação real, a Fase B incorpora engajamento aprendido ao ranqueamento (hoje é só sinal de mercado estimado).
- **Adoção por `/lote-posts` e `/planejar-pauta-semanal`** — herdam o bloco de scouting. A `/planejar-pauta-semanal` é o maior beneficiário (produz N briefings) e já é disparada por cron — onde a regra de auto-seleção do `briefing-writer` (§3.3.2) realmente entra em ação.
- **SEO** — métricas reais (volume, dificuldade, backlinks) vivem atrás de APIs dedicadas; marginal para uma marca Instagram-first, relevante talvez só para o site. Fora do escopo deste projeto.
