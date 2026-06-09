# Setor de Produto — desenvolvimento e evolução

**Data:** 2026-06-08
**Status:** Design aprovado em brainstorming — construção (Sub-projeto A) + horizonte declarado (Sub-projeto B).
**Escopo:** Projetar o **setor de Produto** do Dino Team como sistema vivo — descobrir, decidir, desenhar, validar, lançar e evoluir produtos — ancorado no cérebro de marca (`memory/`) e operando sobre a audiência existente do Instagram, sem tocar o operacional humanizado da consultoria.

> Ativa a linha **"Setor Produto vivo"** do Horizonte declarado em [`CLAUDE.md`](../../CLAUDE.md) e em [`2026-06-08-reconciliacao-arquitetura-g3-design.md`](2026-06-08-reconciliacao-arquitetura-g3-design.md) §5. Mantém-se fiel à arquitetura **G3 "2 velocidades"** e ao princípio "a memória é a integração" de [`2026-06-06-arquitetura-360-cerebro-de-marca-design.md`](2026-06-06-arquitetura-360-cerebro-de-marca-design.md).

---

## 1. Ponto de partida (o que existe hoje)

- **Único produto:** consultoria Dino Team, em **plataforma web externa**, **sem tracking e sem API** ligada a este repo. ~**400 alunos ativos**.
- **Canal de distribuição/venda atual:** Instagram do Ramon + da consultoria.
- **Operação (criar protocolo + acompanhar) é humanizada** — fora de escopo desta construção.
- **Setor de Produto hoje:** 1 agente técnico não-acionado (`treinador`) + 1 skill de integração embrionária (`/sinal-consultoria`) + 1 linha de governança. Sem slice próprio, sem roadmap, sem fluxo de produto.

**Princípio inegociável do dono:** o setor decide com **base sólida de evidências** (público, tendências, dores, branding — o cérebro), nunca cria produto no escuro.

---

## 2. Decisões travadas

1. **Decomposição por gatilho (abordagem "C — núcleo vivo com costuras declaradas"):**
   - **Sub-projeto A — Núcleo de Produto:** construir agora; opera sobre a audiência do Instagram.
   - **Sub-projeto B — Experiência do Cliente / loop operacional:** declarado + schema pronto, **dormente**. Gatilho = **acesso à plataforma + API**.
2. **Remover a skill `/sinal-consultoria`** (artefato de fase embrionária; o novo setor a supera).
3. **Descoberta ancorada no cérebro existente** (opção 1): pesquisa de mercado + `publico/` + `mercado/`. A **voz direta dos 400 alunos** entra no Sub-projeto B, quando a plataforma conectar.
4. **`treinador` intocado** — segue como especialista técnico (entrega humanizada), e vira dono de expertise quando a construção de um produto de treino precisar de asset.
5. **1 agente agora** (`estrategista-produto`); split em 2 agentes = **costura declarada**, ativa com volume.
6. **Gate de lançamento consolidado** (ver §6).
7. **Função-objetivo e economia unitária são parâmetros do humano** — o sistema aplica, não inventa (ver §7, §8).

---

## 3. Carta-magna — o pipeline de 7 estágios

A visão-norte do setor é um pipeline stage-gate (cada estágio só passa adiante o que cumpre critério), apoiado em camadas transversais.

```
[1] Inteligência de mercado  (setor separado · entrada)
        │            ▲
        ▼            │ (pedido de pesquisa — loop fechado)
[2] Descoberta de oportunidades   dores → hipóteses testáveis, sizing
        ▼
[3] Estratégia & portfólio        priorização por função-objetivo, anti-canibalização, build/kill
        ▼
[4] Concepção & VALIDAÇÃO         MVP barato (fake-door/landing/concierge) · ORÇAMENTO · morte-por-padrão
        ▼
[5] Construção & precificação     spec + delegação de asset · preço proposto
        ▼
[6] Go-to-market & marketing      posicionamento, canais  (handoff p/ marketing existente)
        ▼
[7] Melhoria & ciclo de vida      sinal de mercado, iterar, SUNSET ──┐
        └──────────────────────────────────────────────────────────┘ (sobe p/ Descoberta)

Camadas transversais: orquestração · governança/guardrails · memória · gates humanos
```

### 3.1 Três refinamentos sobre o diagrama original

1. **Aresta Inteligência ↔ Produto é bidirecional.** Além de consumir, o setor **enfileira pedido de pesquisa** (loop fechado — §9).
2. **O estágio 4 tem viés de "morte-por-padrão" + orçamento de experimento.** A maioria das ideias deve morrer aqui, barato. É o fusível da autonomia.
3. **Construção e precificação são naturezas distintas** mesmo adjacentes: construção é spec + delegação; precificação é gate de dinheiro.

---

## 4. Mapa: pipeline × realidade (o que se constrói agora)

**Descoberta-chave (cold start):** a audiência do Instagram (Ramon + 400 alunos) é um **canal de validação real hoje**, independente da plataforma. Fake-door, enquete em stories, "comenta EU QUERO", landing com lista de espera, concierge MVP — geram **sinal de mercado real sem a API**.

| Estágio | Constrói agora? | Apoia em | Gatilho do que falta |
|---|---|---|---|
| 1. Inteligência | ✅ já existe | `pesquisador-mercado`, `mercado/`, `publico/` | — |
| 2. Descoberta → hipóteses | ✅ **agora** | cérebro + lente de produto | — |
| 3. Estratégia & portfólio | ✅ **agora** | função-objetivo (§7) | — |
| 4. Concepção & **validação** | ✅ **agora** | **Instagram + landing/lista** | — (é o cold-start) |
| 5a. Construção (spec) | ✅ **agora** | spec; delega asset (§5) | — |
| 5b. Precificação | 🟡 propõe; humano aprova | `economia.md` (humano) | setor financeiro / receita conectada |
| 6. GTM & marketing | ✅ **agora** | marketing + `revisor-brand` | — |
| 7a. Melhoria (sinal de **mercado**) | ✅ **agora** | vendas/lista/objeções do IG | — |
| 7b. Telemetria de **uso**, retenção, churn, CX | ⏸ **depois** | — | **plataforma + API** |

**Sequenciamento dentro do A (throughput-primeiro no próprio pipeline):** aprofundar **2–3–4** primeiro (descobrir → priorizar → validar barato). Manter 5–6–7 leves até o primeiro produto validado *puxar* por eles. Não construir ferramental pesado de precificação antes do estágio 4 ter matado/aprovado uma ideia.

---

## 5. Arquitetura — agente + memória

### 5.1 Agente `estrategista-produto`

Paralelo ao `estrategista-mercado`. **Dono único** do slice `memory/produto/`. Decisão durável e cara:
descobre oportunidade → prioriza por função-objetivo → arquiteta oferta → especifica produto → propõe preço → flaga evolução/sunset.

- **Lê:** `brand/` (todos), `memory/publico/`, `memory/mercado/`, `memory/performance/`, `memory/ramon/`, e o próprio `memory/produto/`.
- **Escreve:** só `memory/produto/`.
- **Não faz:** entrega de serviço (humanizada), produção de asset pesado (delega), copy de marketing (fábrica de conteúdo), publicação (gate humano).
- **Costura declarada — split futuro:** quando o catálogo/volume justificar, separa em `analista-oportunidade` (estágios 2–3) + `arquiteto-oferta` (estágios 5–7). O slice já nasce particionável por arquivo para o split não exigir rework.

### 5.2 Fronteira "constrói vs delega" (resolve a ambiguidade do brief)

Output **universal** do setor = **SPEC / blueprint** (oportunidade → oferta → estrutura/outline → preço proposto). O que ele **constrói de fato** é só o **barato e determinístico**: landing de validação, outline, estrutura. **Asset pesado é delegado ao dono da expertise:**

| Tipo de produto | Setor produz | Asset final |
|---|---|---|
| Digital (ebook, curso, desafio, template) | blueprint + outline/estrutura + spec | delega: `treinador` (treino), fábrica de conteúdo (copy), humano (gravação) |
| Serviço (tier de consultoria, mentoria) | offer-design (escopo, estrutura, modelo de entrega) | entrega = humana (operação intocada) |
| Físico | spec + posicionamento | fabricação externa |

### 5.3 Slice `memory/produto/` (owner: `estrategista-produto`)

| Arquivo | Conteúdo | Mantido por |
|---|---|---|
| `catalogo.md` | produtos vivos (incl. consultoria) com blueprint de oferta + **status de 1ª classe** | agente |
| `oportunidades.md` | oportunidades como **hipóteses testáveis** (dor→hipótese, JTBD, sizing), rankeadas pela função-objetivo, evidência citada | agente |
| `economia.md` | premissas de custo/margem por produto | **humano** (input) |
| `funcao-objetivo.md` | pesos do que o setor maximiza | **humano** (input) |

**Status de produto (estado de 1ª classe):** `oportunidade` → `em-validação` → `em-construção` → `ativo` → `em-evolução` → `candidato-a-sunset` → `aposentado`.

Entrada no `memory/_schema.md` declarando o slice e o ownership.

---

## 6. Skills, fluxos e gates

### 6.1 Skills

| Skill | Faz | Estágios | Gate de saída |
|---|---|---|---|
| `/criar-produto` | entrevista guiada **ancorada em evidência**: pega oportunidade → confronta com o cérebro → desenha oferta (posicionamento, promessa, público, estrutura/outline, modelo, **preço proposto**) → blueprint; grava no catálogo `em-validação` | 2·3·4a (concepção) | `revisor-brand` (identidade + compliance de oferta) |
| `/validar-produto` | desenha experimento barato (fake-door/landing/concierge) **com orçamento + critério de sucesso explícito**; emite brief para rodar no IG; registra resultado → **passa ou morre** | 4b (validação) | resultado vs critério |
| `/evoluir-produto` | puxa sinal fresco (objeções, vendas, lista, tendências) → propõe **evolução** da oferta **ou** flag de **sunset** | 7 | humano |

**Ordem e fronteira dos estágios:** a **concepção** do blueprint (oferta + estrutura/outline + preço proposto) precede a validação — é justamente o que se valida. O **asset** de produto (estágio 5, construção) é produzido **após o G-lançamento** e **delegado** ao dono de expertise (§5.2); o **preço é finalizado** no G-lançamento. **G-ideia** é a pausa entre `/criar-produto` e `/validar-produto` (aprovar gastar orçamento de validação); **G-lançamento** é a pausa após `/validar-produto`.

O **handoff de GTM** (estágio 6) não é skill nova: o blueprint aprovado no gate de lançamento vira input das skills de marketing existentes (`/planejar-pauta-semanal`, `/novo-post`, etc.). O produto no `catalogo.md` é **lido** pelo `estrategista-mercado` — integração pela memória, sem chamada direta.

### 6.2 Os 4 gates humanos obrigatórios

| Gate | Onde | Autonomia | O que o humano aprova |
|---|---|---|---|
| **G-ideia** | após concepção (blueprint pronto), antes do orçamento de validação | `automatico_com_revisao` | seguir para validar (gasta orçamento de experimento) |
| **G-lançamento** ⭐ | após Validação | `humano` | **pacote consolidado**: construir + preço + plano de distribuição proposto → **um go/no-go** |
| **G-publicação** | peça-a-peça, antes de ir ao canal | `ver_politica` (já existe) | cada peça (`revisor-brand` + dashboard + `publicacao.yaml`) |
| **G-sunset** | quando a evolução flaga candidato | `humano` | matar o produto |

**Regra do G-lançamento:** o plano de distribuição é **traçado automaticamente** (é barato); **nada executa/handoff sem o ok humano no plano concreto** — onde o `revisor-brand` também checa claim e canal. Aprovar o plano desenhado (não a intenção) torna a aprovação significativa e é o ponto de compliance.

---

## 7. Função-objetivo (o que o sistema maximiza)

Explícita e **parametrizada pelo humano** — sem isso, o sistema otimiza a coisa errada ou oscila. **Não é receita pura** (corromperia uma marca de "direção, não motivação, sem promessa falsa").

**Score composto, ponderado pela marca** (`funcao-objetivo.md`):

| Dimensão | Pergunta | Peso sugerido (fase atual) |
|---|---|---|
| Fit de marca | serve uma Verdade do `brand-book`? coerente com o brand? | **alto** |
| Evidência de demanda | intensidade/tamanho da dor validada | **alto** |
| Retorno ajustado a risco | margem esperada × prob. de validação ÷ esforço | médio |
| Fit de portfólio | não canibaliza, complementa a consultoria | médio (gate de anti-canibalização) |

Economia entra como **filtro/gate**, não como o que se maximiza, nesta fase. Os **pesos são do humano**; o agente apenas aplica o score para rankear `oportunidades.md`.

---

## 8. Precificação e economia unitária

O setor **não inventa** custo/margem (regra de ouro do sistema). Sem setor financeiro hoje:

- **Economia = input humano** em `produto/economia.md` (premissas de custo/margem por produto).
- **Precificação (estágio 5b):** o agente **propõe** faixa de preço a partir de (valor da oferta + piso de custo fornecido + benchmark de concorrente vindo da inteligência); **humano aprova** no G-lançamento.
- **Horizonte declarado:** setor financeiro / economia unitária real — gatilho = receita/custo conectados pela plataforma.

---

## 9. Contratos transversais (blackboard — "a memória é a integração")

| Contrato | Como funciona |
|---|---|
| **↔ Inteligência** | lê `mercado/` + `publico/` (pull, sob demanda na descoberta); **enfileira pedido de pesquisa** em `memory/pesquisa/pedidos.md` que `/pesquisar-tema` / `pesquisador-mercado` atende. **Loop fechado, zero acoplamento direto.** |
| **→ Marketing** | escreve a oferta no `catalogo.md`; `estrategista-mercado` lê quando promove. Plano de distribuição = handoff pós G-lançamento. Sem chamada direta. |
| **⚖ Compliance** | `revisor-brand` **estendido** com checklist de produto/oferta (§10). |
| **↘ Expertise** | construção de asset delega ao dono (`treinador`, fábrica de conteúdo, humano) — §5.2. |

---

## 10. Compliance de produto (extensão do `revisor-brand`)

Marketing autônomo é o maior risco regulatório/legal. Reusa o gate existente; **estende o checklist** para:

1. **Claim lastreado:** toda promessa precisa estar suportada pelo spec + evidência. Sem claim que a oferta não entrega.
2. **Ética de preço:** sem dark pattern, sem escassez falsa, sem precificação enganosa.
3. **Compliance de saúde/resultado** (já existente): sem promessa irreal de transformação física.

Roda no G-publicação (peça-a-peça) e é consultado no desenho da oferta (`/criar-produto`).

---

## 11. Disciplina de sunset (matar produtos)

Desenhada explícita ou nunca acontece. Sistemas autônomos não matam os próprios filhos por default.

- **Estado de 1ª classe** no catálogo (§5.3): `candidato-a-sunset`, `aposentado`.
- A **rotina de evolução** (§12) avalia cada produto vivo contra **critérios de sunset**: demanda caiu, objeção estrutural sem reframe, canibaliza outro produto melhor, drift de marca.
- **Regra dura no contrato do agente:** *"decida sunset por valor futuro esperado; ignore o esforço já investido"* — tratamento explícito de custo afundado.
- A rotina **só flaga**; humano mata (G-sunset).

---

## 12. Ciclo de evolução (o "vivo" / autoaprimoramento)

**Rotina `/schedule` mensal** (espelha as routines existentes em [`docs/automacao/routines.md`](../automacao/routines.md) e [`orquestracao/rotas.yaml`](../../orquestracao/rotas.yaml)):

1. Varre o cérebro (`publico/`, `mercado/`, `performance/`) + o `catalogo.md`.
2. Produz: (a) **novas oportunidades** em `oportunidades.md`; (b) **flags de evolução/sunset** nos produtos vivos.
3. **Só sinaliza** — humano decide. Nenhuma criação/kill automático.

É a seta que sobe pela esquerda do diagrama: melhoria → realimenta descoberta com sinal de mercado.

**Honestidade sobre o loop:** hoje o sinal de melhoria é de **mercado** (vendas, conversão de lista, objeções do IG) — disponível desde o dia 1. O sinal de **uso** (retenção, churn, tempo médio, engajamento) entra no Sub-projeto B, quando a plataforma conectar, e **aprofunda** o loop.

---

## 13. Cold start (bootstrap sem produtos no mercado)

Resolvido pela dupla **cérebro (semente da descoberta) + audiência do Instagram (sinal de validação)**:

- **Descoberta** parte do que o cérebro já sabe (`publico/dores.md`, `objecoes.md`, `mercado/tendencias/`, `performance/`).
- **Validação** roda em fake-door / enquete / lista na audiência existente, **antes de construir**.
- **Primeiro produto recomendado:** baixo risco e **adjacente à consultoria** (ex.: desafio pago, ebook), para provar o pipeline ponta-a-ponta na audiência atual antes de apostar grande.

---

## 14. Sub-projeto B — declarado (scaffold agora, build depois)

**Não construir** até o gatilho. Declarar para não virar amnésia.

| Capacidade | O que é | Gatilho |
|---|---|---|
| Loop operacional / CX | telemetria de uso, retenção, tempo médio, engajamento, churn, jornada do cliente | **acesso à plataforma + API** |
| Economia unitária real / financeiro | custo/margem reais alimentando precificação | receita/custo conectados |
| Voz direta do cliente (400 alunos) | dores/objeções/provas reais da base na descoberta | plataforma conecta (ou canal estruturado de captura) |

Scaffold agora = **schema declarado** no `memory/_schema.md` + linha no Horizonte do `CLAUDE.md`. **Sem coletor, sem agente, sem skill.**

---

## 15. O que muda no repositório

**Criar:**
- `.claude/agents/estrategista-produto.md` — contrato do agente.
- `.claude/skills/criar-produto/SKILL.md`, `.claude/skills/validar-produto/SKILL.md`, `.claude/skills/evoluir-produto/SKILL.md`.
- `memory/produto/` — `catalogo.md`, `oportunidades.md`, `economia.md`, `funcao-objetivo.md` (sementes + frontmatter).
- `memory/pesquisa/pedidos.md` — fila de pedidos de pesquisa (loop fechado §9).
- Routine `/schedule` mensal (varredura de evolução §12).

**Editar:**
- `memory/_schema.md` — declarar slice `produto/` + scaffold do Sub-projeto B.
- `orquestracao/governanca.yaml` — substituir a linha `sinais-produto` por `desenvolvimento-produto` com os 4 gates; ou nova linha + remoção da antiga.
- `orquestracao/rotas.yaml` — documentar a rotina mensal de evolução.
- `.claude/agents/revisor-brand.md` — estender checklist de compliance de produto (§10).
- `CLAUDE.md` — setor Produto vivo (substituir descrição atual); atualizar Horizonte declarado (Sub-projeto B); remover referências a `/sinal-consultoria`.

**Remover:**
- `.claude/skills/sinal-consultoria/` — superada pelo novo setor.
- Referências a `/sinal-consultoria` em `CLAUDE.md`, `memory/_schema.md`, `governanca.yaml`, e nos contratos de `treinador`, `pesquisador-mercado`, `analista-performance` (a menção ao canal de sinal).

> **Atenção à decomposição do plano:** §15 é grande. O plano de implementação deve tratar o Sub-projeto A em ondas (memória+schema → agente → skills → governança/gates → rotina → limpeza do `/sinal-consultoria` → docs). O Sub-projeto B é só declaração (uma onda curta de scaffold).

---

## 16. Não-objetivos (fora de escopo)

- Tocar a **entrega humanizada** da consultoria (protocolo, acompanhamento).
- Construir **coletor de métricas / telemetria de uso** (Sub-projeto B — dormente).
- Construir **canal de venda / checkout / pagamento** (depende de definição + integração futura).
- Produzir **asset pesado** de produto (delegado aos donos de expertise).
- Inventar **custo, margem, ou demanda** sem evidência (regra de ouro).

---

## 17. Parâmetros que ficam com o humano

1. **Pesos da função-objetivo** (`funcao-objetivo.md`).
2. **Premissas de economia unitária** (`economia.md`).
3. **Os 4 gates** — toda decisão de gastar orçamento, lançar, publicar ou matar.
4. **Mudança de status** de produto que cruze um gate.

O sistema percebe, propõe e sinaliza; o humano decide o que é "bom" e o que vai ao mercado.
