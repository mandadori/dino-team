# Arquitetura 360 + Cérebro de Marca — Design Doc

**Data:** 2026-06-06
**Status:** Spec aprovada em brainstorming — pronta para virar plano de implementação (decomponível em ondas)
**Escopo:** Reposicionar o sistema Dino Team de "fábrica de posts" para um sistema operacional de marca em camadas (Dados → Estratégia → Produção → Operacional) que **pensa como diretor de marca**: gere significado acumulado como ativo explícito, se auto-aprimora por memória, integra os setores e cresce sem diluir funções.

> Antecede e complementa [`2026-05-22-arquitetura-multi-setor-design.md`](2026-05-22-arquitetura-multi-setor-design.md). Onde aquele desenhou setor × papel, este corrige a causa-raiz que o fez colapsar (ver §1.1) e cravo a memória como espinha.

---

## 1. Visão geral

### 1.1 Problema — e por que a tentativa anterior colapsou

O sistema atual produz posts de Instagram com qualidade alta, mas:

- **Pensa em posts, não em narrativas.** Cada peça é um evento isolado. Não há memória do que a marca está construindo ao longo de meses.
- **Depende do humano pra decidir o que produzir.** Não responde "essa mensagem já foi dita 40 vezes?", "estamos construindo narrativa ou só publicando?", "o que o público deve crer em 6 meses?", "isso fortalece ou enfraquece o posicionamento?".
- **A camada de estratégia foi amputada.** O desenho de 22/05 tinha `briefing-writer`, `planejador-pauta` etc.; em 03/06 foram deletados e a decisão de ângulo virou **inline**, por-post, sem estado.

**Causa-raiz do colapso (corrigida aqui):** a regra *"skills orquestram, agentes executam"* não deixava agente **decidir**. Uma função-decisão (estratégia, narrativa) não tinha onde morar — sobrava metê-la dentro da skill. Some-se a isso o **fluxo incompleto**: agentes desenhados pra operar 360° só tinham o pipeline de posts pra alimentá-los, viraram passagem fina e foram absorvidos. **A diluição foi sintoma de fluxo incompleto + regra limitadora, não veredito contra a camada de estratégia.**

### 1.2 A virada conceitual

Parar de pensar o sistema como **um conjunto de skills que produzem peças** e passar a pensá-lo como **uma memória viva no centro, com funções plugadas ao redor.** O "diretor de marca" não controla posts; controla o **significado acumulado** que a marca constrói na cabeça do público ao longo dos anos. Esse significado precisa existir como **ativo explícito na memória** do sistema.

Estrutura implícita das grandes marcas, agora explícita: **Identidade → Posicionamento → Narrativas → Campanhas → Conteúdos.** Hoje o sistema tem as pontas (Identidade/Posicionamento em `brand/`; Conteúdos nos posts) e falta o meio (Narrativas, Campanhas como container de significado).

### 1.3 Os três pontos críticos são uma pilha, não três projetos

| Camada | Papel | Depende de |
|---|---|---|
| **Funções bem definidas** | cada decisão tem dono; não dá pra diluir uma decisão | do fluxo completo que as utiliza |
| **Memória pra auto-aprimoramento** | o substrato: torna função não-rasa e automação segura | é a fundação |
| **Automação** | emerge quando função + memória + política são boas o bastante | das duas acima |

**Automação é o objetivo; funções bem definidas + memória são o que ganham o direito a ela.** Foi a ordem invertida (automação/funções sem memória e sem fluxo completo) que quebrou antes.

### 1.4 Princípio condutor: **"a memória é a integração"**

Sinergia, auto-aprimoramento e integração **não são features a construir — são propriedades que emergem de um estado compartilhado e gravável.**

- **Sinergia:** quando blog, e-mail, carrossel e comunidade leem da MESMA narrativa ativa e escrevem de volta nela, reforçam-se **por estrutura**, não por coordenação manual. Quatro canais, uma crença — ninguém coordenou; todos leram a mesma memória.
- **Auto-aprimoramento:** cada peça escreve de volta o que foi (narrativa servida, mensagem dita, ângulo, canal, data). A memória sabe quando uma mensagem satura e (com métrica) qual expressão converte. "Já foi dito 40 vezes?" vira **dado, não intuição**.
- **Integração completa:** o diretor governa **significado**, e significado atravessa tudo. A memória é **da marca inteira**: a consultoria lê dores/objeções da mesma memória; a comunidade reforça as narrativas ativas; o site puxa o posicionamento vigente. Funções novas (produto, comunidade, atendimento) **plugam no mesmo cérebro** e herdam o significado acumulado. Os agentes não se conhecem — coordenam-se pelo estado.

Tecnicamente: arquitetura **blackboard / hub-and-spoke**. Acoplamento fraco (cada função evolui sozinha), coordenação emergente (pelo estado), aprendizado cumulativo (o estado guarda o que aprendeu).

### 1.5 Eixo organizador: **Função = dona de uma decisão + a memória que lê/escreve**

Funções **não** são definidas por canal (evita "copywriter de e-mail", "copywriter de blog" — a multiplicação que o sistema já fugiu) nem por posição num organograma (evita re-derivar o roster que explodiu). Cada função é definida pela **pergunta que responde** e pela **fatia de memória** que consulta e atualiza. Não dá pra diluir uma decisão: ou alguém a toma, ou ela não é tomada.

**Regra de corpo (evita re-diluir):** primeiro define-se a função + o contrato de memória; **só depois** decide-se o "corpo":

- **Decisão durável e cara → agente** (ex.: gestão de narrativa, pesquisa de mercado, guarda de marca).
- **Passo contextual barato → inline na skill** (ex.: copy, design).
- **Ação determinística → script** (ex.: publicação, export, fetch de métrica).

Foi pular essa segunda etapa — instanciar agente fino pra tudo — que diluiu o roster.

---

## 2. O cérebro (`memory/`)

### 2.1 Cérebro vs. insumo

Distinção que organiza tudo: **cérebro** (durável, dono único, escrito-de-volta, a "verdade") vs. **pesquisa bruta** (insumo transitório). Hoje `dados/` mistura os dois e o nome é neutro demais pra coisa que é a espinha do sistema.

**Decisão:** renomear `dados/` → `memory/`. A pesquisa bruta (`pesquisas-brutas/`) vira `memory/pesquisa/` — insumo, não verdade.

### 2.2 Slices do cérebro

```
memory/
├── narrativas/    ← marca: narrativas ativas, roadmap de crença, livro-razão de mensagens
├── publico/       ← dores, objeções (com a fala do público embutida)
├── mercado/       ← narrativa-de-mercado (maré) · tendencias (ondas) · concorrentes (pull pontual)
├── ramon/         ← contexto temporal/biográfico do Ramon
├── performance/   ← ângulos queimados + métricas de canais (futuro)
└── pesquisa/      ← pesquisa bruta (insumo) — ex-`pesquisas-brutas/`
```

| Slice | Dono único | Conteúdo | Lido por |
|---|---|---|---|
| `narrativas/` | função de **direção** | arcos de narrativa, crença-alvo, livro-razão de mensagens | pauta, produção, coerência, Produto |
| `publico/` | `pesquisador-mercado` (Produto **alimenta**) | dores, objeções + como o público as verbaliza | pauta, produção, Produto, branding |
| `mercado/` | `pesquisador-mercado` | narrativa-de-mercado, tendências, concorrentes | direção, branding, pauta |
| `ramon/` | `arquivista` | fase, cronograma, princípios, falas, conquistas | produção, pauta |
| `performance/` | `analista-performance` | ângulos queimados; métricas por canal (futuro) | direção, pauta |
| `pesquisa/` | função de **pesquisa** | matéria-prima bruta datada | produção (snapshot), destilação |

**Config de pesquisa** (ex-`_diretivas.md`: concorrentes prioritários, segmentos, perguntas abertas) **não é memória — é config**. Passa a viver junto da função de pesquisa, fora do cérebro.

### 2.3 `narrativas/` — a joia da coroa (sem precedente no sistema)

Três peças:

1. **Narrativas ativas** — os arcos em construção (ex.: *"Progresso invisível"*), cada um com: crença-alvo, horizonte, pilares/canais que serve, estado (`ativa` / `saturando` / `aposentada`).
2. **Roadmap de crença** — o que o público deve acreditar em 3 / 6 / 12 meses. É a régua de "isso fortalece o posicionamento?".
3. **Livro-razão de mensagens** — o que já foi dito, quantas vezes, em que canais. Responde "essa mensagem foi dita 40 vezes?".

### 2.4 As duas narrativas — a dialética marca × mercado

Existem **duas** narrativas e elas formam um par:

- **Narrativa da marca** (`narrativas/`) — o que a Dino Team constrói.
- **Narrativa de mercado** (`mercado/narrativa-de-mercado.md`) — o discurso dominante do nicho (maromba BR: hardcore, "no pain no gain", guru, bravata, promessa de atalho, shape de verão).

**A identidade inteira da Dino Team é uma posição CONTRA a narrativa de mercado** (anti-hype, anti-espetáculo, "direção > motivação", os off-limits "sem atalho/fórmula mágica"). Logo a narrativa de mercado é a **pedra de amolar** da narrativa da marca: a direção lê "o que a maromba acredita hoje" pra decidir "contra o quê nos posicionamos / o que reframamos". Sem rastrear o discurso do nicho, a marca perde o contraste que a define.

Distinção de cadência dentro de `mercado/`:
- **`narrativa-de-mercado.md`** — discurso profundo e lento (crenças, clichês, códigos culturais). **Maré.** Alimenta `narrativas/`.
- **`tendencias/`** — o que está quente agora (volátil, mensal). **Ondas.**
- **`concorrentes/`** — **pull pontual**, não feed contínuo. Lido sob demanda por: aprimoramento de branding (foi o estudo do STNDRD que remodelou o brand book em 29/05) e análise de estratégia. Não roda toda semana.

### 2.5 `publico/` — dores e objeções como ativo consultável

Hoje vivem em **prosa** no `brand/publico-alvo.md` (a "escada de dores"). Viram ativo:
- `publico/dores.md`, `publico/objecoes.md` — cada entrada carrega **como o público a verbaliza** ("travei", "platô", "não vejo resultado", "shape"). Isso aposenta o `vocabulario-publico.md` standalone (lista solta é baixo valor; a fala do público vale **em contexto**, dentro da dor/objeção, pra espelhar a linguagem no hook antes de elevar ao tom da marca — o próprio `tom-de-voz.md` já reconhece isso com "shape").

### 2.6 Regras do cérebro

- **Dono único por slice.** Só o owner escreve; outros propõem via output e o owner consolida.
- **Schema versionado** em `memory/_schema.md`.
- **YAGNI de slice:** uma fatia só nasce quando uma função a lê de verdade. Zero memória especulativa. (O schema **declara** a estrutura completa; declarar ≠ construir.)
- **Write-back é de primeira classe:** produzir uma peça **atualiza o cérebro** (ver §4.2).
- **Integridade:** keeper de memória audita lixo/saturação periodicamente (função declarada, build depois).

---

## 3. Roster de funções (mapa 360)

### 3.1 Como ler

Cada função: **decisão que possui** · **lê → escreve** · **automatável?** · **corpo · quando**. Tags: **[EXISTE]** (mantém), **[REFRAME]** (existe mas muda de papel), **[NOVO]** (não existe hoje). "agora" = nesta milestone; "depois" = declarado, build sequenciado.

### 3.2 DADOS — captura → cérebro

| Função | Decisão | Lê → Escreve | Auto? | Corpo · quando |
|---|---|---|---|---|
| Pesquisa de mercado **[EXISTE]** | "o que no nicho importa?" | brand, público → mercado, pesquisa | sim (cron+demanda) | agente `pesquisador-mercado` + `/pesquisar-mercado` · agora |
| Pesquisa de tema **[REFRAME]** | "matéria-prima pra este ângulo?" | mercado, público → pesquisa | trigger produção | skill própria (extraída do `/novo-post`) · agora |
| Contexto Ramon **[EXISTE]** | "verdade atual do Ramon?" | fontes + input → ramon | auto-sync + manual | agente `arquivista` + `/atualizar-ramon` · agora |
| Dores & objeções **[NOVO]** | "o que o público sente/objeta?" | pesquisa, comunidade, consultoria → publico | parcial | dono `pesquisador-mercado`; Produto alimenta · agora (semente da prosa) |

### 3.3 ESTRATÉGIA — lê cérebro → decide direção *(a camada que faltava)*

| Função | Decisão | Lê → Escreve | Auto? | Corpo · quando |
|---|---|---|---|---|
| **Direção / gestão de narrativa [NOVO ★]** | "qual narrativa, o que avança/satura, crença-alvo?" | narrativas, mercado/narrativa, performance, publico → **narrativas** | saturação sim; **virar narrativa = humano** | agente + `/ciclo-de-direcao` (cron+manual+threshold) · agora |
| Planejamento de pauta **[REFRAME]** | "o que produzir nesta janela, p/ qual narrativa?" | narrativas, publico, ângulos-queimados, tendencias → pauta | sim, revisão opcional | `/planejar-pauta` (era semanal; agora **downstream da direção**) · agora |
| Planejamento de campanha **[NOVO]** | "orquestrar campanha multicanal p/ uma narrativa?" | narrativas, performance, calendário → plano | revisão humana | skill L3 · depois |

### 3.4 PRODUÇÃO — briefing → peça → write-back

| Função | Decisão | Lê → Escreve | Auto? | Corpo · quando |
|---|---|---|---|---|
| Copy **[REFRAME]** | "escrever conforme briefing+estilo+tom?" | estilo, tom, publico, pesquisa → peça | — | **inline** na skill (canal via param) · agora |
| Design **[REFRAME]** | "compor o visual?" | estilo, refs-visuais → peça | — | **inline** + Dino Editor · agora |
| Canais **[EXISTE/NOVO]** | "produzir a peça no canal X" | briefing → artefato | gated por política | `/novo-post` agora; `/novo-email`, `/novo-artigo`, comunidade, ads · depois |
| Site / web **[EXISTE]** | "construir/alterar o site" | briefing, brand → site | — | agentes Engenharia + `/novo-site`/GSD · agora |
| Write-back **[NOVO]** | "registrar o que a peça foi" | briefing, peça → narrativas (livro-razão), performance (ângulos) | sim | passo final da skill; executa o dono da fatia · agora |

### 3.5 OPERACIONAL — guarda · coerência · aprende

| Função | Decisão | Lê → Escreve | Auto? | Corpo · quando |
|---|---|---|---|---|
| Guarda de marca + compliance **[EXISTE]** | "dentro da identidade + compliance?" | brand → parecer (gate) | gate auto | agente `revisor-brand` · agora |
| **Coerência de narrativa [NOVO]** | "fortalece ou enfraquece o posicionamento?" | narrativas, posicionamento → flag | sim (flag) | check da direção / no gate · agora |
| Aprimoramento de branding **[EXISTE]** | "o brand book precisa evoluir?" | mercado/concorrentes + narrativa → brand | humano | `/brand-discovery`, `/afinar-tom-de-voz` + revisor-brand · pull pontual |
| Aprendizado de performance **[EXISTE→cresce]** | "o que performou/saturou?" | métricas + log → performance | sim (c/ métrica) | agente `analista-performance` · agora→cresce |
| Keeper de memória/schema **[NOVO]** | "cérebro íntegro, sem lixo?" | schema, slices → auditoria | sim | agente/skill periódica · depois |

### 3.6 PRODUTO — 1ª classe, declarado *(build depois)*

| Função | Decisão | Lê → Escreve | Corpo · quando |
|---|---|---|---|
| Direção de produto **[NOVO]** | "o que construir/melhorar?" | publico/dores+objeções, performance → roadmap de produto | humano · depois |
| Execução consultoria **[EXISTE]** | "protocolo / treino / dieta" | ramon/princípios, dados do aluno → protocolo | agente `treinador` (+ futuros) · treinador agora |
| Sinais produto → cérebro **[NOVO]** | "o que o aluno trava / pergunta / conquista" | consultoria → publico (dor/objeção real), performance (prova) | parcial · depois |

Produto **fecha o loop de integração**: consome o cérebro (dores/objeções dizem o que melhorar; performance diz qual oferta converte) e o alimenta de volta (o que o aluno trava = dor real; pergunta recorrente = objeção; resultado de aluno = prova pro pilar Transformação). Marketing e produto se afinam **sem se falarem**, pelo cérebro.

### 3.7 Deltas — o "completar o que falta"

- **NOVO (o que de fato faltava):** Direção/gestão de narrativa (★ a camada acima da pauta) · Coerência de narrativa · Dores & objeções como ativo · Write-back estruturado · Keeper de memória · setor Produto.
- **REFRAME:** pauta vira downstream da direção · pesquisa sai do `/novo-post` pra skill própria · copy/design assumidos como **inline** (não agentes — pela regra de corpo).
- **EXISTE (mantém):** `pesquisador-mercado`, `arquivista`, `revisor-brand`, `analista-performance`, `treinador`, Engenharia/site.

---

## 4. Modelo de operação — os 3 momentos em que a memória é tocada

A confusão de hoje é que tudo isto está espremido dentro do `/novo-post`. Separar é o que destrava sinergia e auto-aprimoramento.

### 4.1 Captura (feedstock → cérebro)

As skills de pesquisa. O agente-dono grava a pesquisa bruta em `memory/pesquisa/` e **destila** o aprendizado durável na sua fatia (`mercado/`, `publico/`). Disparável **sozinha** (manual/cron) **ou** de dentro da produção quando o cérebro está stale.

### 4.2 Write-back (no fim de cada produção)

Ao entregar uma peça, a skill **registra na memória** o que aquilo foi: narrativa servida, mensagem dita, ângulo queimado, canal, data. Quem **executa a escrita** é o agente-dono da fatia (regra de dono único): `analista-performance` (ângulos/performance) e a função de direção (livro-razão de narrativas). A skill **dispara**; o dono **escreve**.

### 4.3 Ciclo de direção (auto-aprimoramento + ajuste de estratégia) — **o que não existe hoje**

Uma skill periódica (cron + manual + threshold) que **lê o cérebro inteiro** (estado das narrativas, saturação, performance, mercado) e **escreve as fatias de estratégia**: ativa/aposenta narrativa, define a crença-alvo do trimestre, ajusta peso de pilar, sinaliza "mensagem X saturou". **Não produz conteúdo** — só atualiza significado. Parte auto-aplica (política); virada de narrativa escala pro humano.

### 4.4 Pauta como tradução da direção

Hoje existe a `/planejar-pauta-semanal` (tática: "quais posts essa semana"), mas **falta a camada acima** (estratégica: "qual narrativa/crença estamos construindo"). No novo modelo a pauta é a **tradução** do ciclo de direção em peças da janela — não o topo da pilha.

### 4.5 Governança / automação

`dados/politicas/` está morta (sem automação pra governar) — **aposenta-se o artefato atual**. A governança vira **propriedade de cada decisão no mapa** (o flag `automatável / humano`). Quando a primeira automação ligar, os flags se consolidam num **único arquivo de governança** (aí útil: o humano vê e ajusta todas as fronteiras num lugar). YAGNI — recria quando o loop existir.

---

## 5. Mudança nas regras (CLAUDE.md)

### 5.1 As regras que evoluem

| Regra atual | Veredito | Regra nova |
|---|---|---|
| "skills orquestram, **agentes executam**" | **relaxar** (causa-raiz do colapso) | agentes **possuem funções** — decisão, memória **ou** execução |
| "agentes não conhecem **outros agentes**" | **mantém** — é liberdade, não limite | princípio blackboard: coordenam pelo cérebro, evoluem sozinhos |
| "agentes não conhecem **o fluxo**" | **reformula** | não conhecem a **orquestração** (qual skill chama quem); **dominam fundo o próprio domínio** |

**Regra nova, em uma linha:** *skills orquestram fluxos; agentes possuem funções (decisão/memória/execução) e se coordenam pela memória, nunca entre si.*

### 5.2 O que muda no CLAUDE.md

- A seção "Funções do sistema" (hoje post-cêntrica) → o modelo em camadas + decisões.
- O roster de agentes (incorporar NOVO/REFRAME).
- A seção "Banco de Dados" → "Cérebro de marca (`memory/`)" com os slices de §2.
- As regras operacionais (§5.1).

### 5.3 Skills afetadas

- `/novo-post` — **deixa de possuir pesquisa**; dispara `/pesquisar-*` quando stale ou lê estado fresco. Ganha o passo de **write-back** no fim.
- `/planejar-pauta-semanal` — vira `/planejar-pauta`, **downstream do ciclo de direção**.
- **Nova:** `/ciclo-de-direcao` (gestão de narrativa).
- **Nova(s):** `/pesquisar-mercado` (+ pesquisa de tema), extraídas do `/novo-post`.
- `/lote-posts` — passa a ler narrativas ativas (sinergia).

---

## 6. Setores e canais

### 6.1 Marketing — canais

| Canal | Estado |
|---|---|
| Instagram (carrossel + stories) | agora |
| Blog (SEO) | agora (via site/GSD; `/novo-artigo` + MDX) |
| Site (institucional/landing) | agora |
| E-mail | depois |
| Comunidade (WhatsApp) | depois |
| Ads (Meta) | depois |

Copy/design são **funções únicas** (canal via parâmetro), não funções por canal.

### 6.2 Produto — declarado, build depois

Consultoria (`treinador` agora; nutricionista/anamnese/check-shape depois), E-books/serviços (depois). Integra-se **pelo cérebro** (§3.6), nunca por acoplamento direto.

### 6.3 Transversais

Brand/compliance (`revisor-brand`), Memória (donos de slice + keeper), Plataforma/ops (keepers de agentes/skills — futuro).

---

## 7. Sequenciamento (ondas) — schema-completo, build marketing-first

Princípio: **declarar a estrutura completa no schema; construir fatia por fatia, cada uma puxada por uma função que a usa agora.** Crescer pela fatia que mais funções tocam — narrativa/crença — onde a sinergia se concentra.

| Onda | Objetivo | Entra | Critério de conclusão |
|---|---|---|---|
| **1 — Cérebro (fundação)** | dar substrato de memória | renomear `dados/`→`memory/`; criar `narrativas/`, `publico/` (extrair dores/objeções da prosa), `mercado/narrativa-de-mercado.md`; mover `pesquisas-brutas/`→`pesquisa/`; aposentar `politicas/` + `vocabulario-publico.md` standalone; `memory/_schema.md` versionado completo; atualizar regras do CLAUDE.md (§5.1) | schema declara estrutura completa; slices-semente populados; nada quebrado |
| **2 — Direção (a camada ausente)** | o sistema ganha diretor | função/agente de gestão de narrativa + `/ciclo-de-direcao`; popular `narrativas/` (1-2 arcos ativos + roadmap de crença inicial); reframe `/planejar-pauta` downstream; check de coerência de narrativa | ciclo roda e produz/atualiza narrativas; pauta sai da direção |
| **3 — Write-back + pesquisa standalone** | fechar o loop de aprendizado | write-back estruturado no fim do `/novo-post` (livro-razão + ângulos); extrair pesquisa pra `/pesquisar-mercado` + pesquisa de tema; `/novo-post` passa a disparar/ler | produzir um post atualiza o cérebro; pesquisa reusável fora do post |
| **4 — Produção multicanal** | sinergia real entre canais | `/novo-artigo` (blog), `/novo-email`, prompts de comunidade — reusando copy/design inline + lendo narrativas ativas | uma narrativa ativa gera peças coerentes em ≥2 canais |
| **5 — Governança + automação** | primeira automação segura | consolidar flags de autonomia num arquivo de governança; ligar cron (direção + pauta); 1ª publicação real gated por política | sistema reage sem slash command; política bloqueia 1 publicação corretamente |
| **6+ — Produto** | integração completa | wire Produto consumindo/alimentando o cérebro (dores reais da consultoria, prova de aluno) | consultoria escreve em `publico/`/`performance`; marketing usa |

---

## 8. Riscos + mitigações

| Risco | Mitigação |
|---|---|
| Cérebro vira gaveta de tranqueira em 3 meses | dono único por fatia; schema versionado; YAGNI de slice; keeper audita |
| Construir o cérebro inteiro antes de algum canal usar (re-diluição um nível acima) | cresce fatia por fatia, cada uma puxada por função que a usa agora |
| "Integração completa" vira scope creep pra produto/engenharia | schema brand-wide, build marketing-first; Produto declarado, fiado depois |
| Recriar agente fino (re-deletado em 1 mês) | regra de corpo (§1.5): só vira agente decisão durável e cara; resto inline/script |
| Ciclo de direção decide demais sozinho | flag automatável/humano por decisão; virar narrativa sempre escala |
| Tokens explodirem com mais funções | contexto destilado por skill; copy/design inline; pesquisa compartilhada via cérebro |

---

## 9. Fora de escopo / diferido

- Migração do cérebro pra SQL (só quando volume/queries justificarem).
- Webhooks de sistemas externos (Resend, Meta) — quando integrações ativas pedirem.
- WhatsApp/Telegram como canal de aprovação — após dashboard maduro.
- Versionamento de agentes (`@v2`) — quando 1ª regressão em produção exigir.
- Setor Produto > Loja/App — quando o produto existir.

---

## 10. Decisões em aberto (resolver no plano)

- **Migração `dados/`→`memory/`:** rename físico + atualização de todos os caminhos nas skills/agentes. Faseado ou de uma vez? (proposta: de uma vez na Onda 1, commit isolado.)
- **Schema interno exato de `narrativas/`** (campos por arco; formato do livro-razão; granularidade da contagem de mensagens).
- **Corpo da "coerência de narrativa":** check dentro do `revisor-brand` ampliado vs. função da direção vs. passo inline no gate.
- **Owner de `publico/`:** confirmado `pesquisador-mercado` com Produto alimentando — validar quando Produto entrar.
- **Nome final** das skills novas (`/ciclo-de-direcao`, `/pesquisar-mercado`).

---

## 11. Critérios de aceitação do redesign

- [ ] `memory/` existe com schema versionado declarando a estrutura completa (incl. Produto/canais futuros).
- [ ] `narrativas/` populado com ≥1 narrativa ativa + roadmap de crença.
- [ ] Ciclo de direção roda (manual + cron) e atualiza `narrativas/` sem produzir conteúdo.
- [ ] Produzir um post **atualiza o cérebro** (livro-razão + ângulos) automaticamente.
- [ ] Pesquisa é skill própria, reusável fora do `/novo-post`.
- [ ] Uma narrativa ativa gera peças coerentes em ≥2 canais (sinergia demonstrada).
- [ ] CLAUDE.md reflete as regras novas (§5.1) e o modelo em camadas.
- [ ] Nenhum agente fino novo criado (regra de corpo respeitada).
- [ ] Skills atuais continuam funcionando ao fim de cada onda.
