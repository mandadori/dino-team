# Reconciliação de arquitetura — G3 como sistema canônico

**Data:** 2026-06-08
**Status:** Design aprovado em brainstorming — reconciliação documental (não construção).
**Escopo:** Reconciliar o doc-mestre (`CLAUDE.md`) e a prosa órfã à arquitetura **viva** do sistema, encerrando o "mix de gerações". Ratificar a geração 3 ("2 velocidades") como canônica e declarar — sem construir — o horizonte 360.

> Sucede e fecha [`2026-06-06-arquitetura-360-cerebro-de-marca-design.md`](2026-06-06-arquitetura-360-cerebro-de-marca-design.md) (G2, parcialmente superada) e [`2026-06-07-estrategista-mercado-design.md`](2026-06-07-estrategista-mercado-design.md) (G3, vigente).

---

## 1. Diagnóstico — três gerações, uma viva

O repositório passou por três gerações de arquitetura. O sistema **já convergiu para a G3**; o "mix inconsistente" era **drift no doc-mestre + prosa órfã**, não dois motores vivos brigando.

| Geração | Spec | Ideia-núcleo | Status |
|---|---|---|---|
| **G1** multi-setor | `2026-05-22` | setor × papel; roster grande | morta (causou a diluição) |
| **G2** 360 + cérebro | `2026-06-06` | `narrativas/` como joia; arco trimestral; `/ciclo-de-direcao`; `estrategista-narrativa`; roadmap de crença | morta (substituída em 7 dias) |
| **G3** 2 velocidades | `2026-06-07`+ | Verdades fixas no `brand/` (lento) + `estrategista-mercado` lê o momento (rápido); `registro-angulos` único; saturação = dado | **VIVA** |

Evidência de que G3 é a viva: `git log` (`b11502c` removeu o arco; `66611cd` fundiu em `registro-angulos`), `memory/_schema.md` v3 (sem slice `narrativas/`), agentes vivos (`estrategista-mercado` é leitor; `analista-performance` é dono do `registro-angulos`), `brand-book.md` com `## Verdades`, e as 5 skills de produção chamando `append_registro_angulos.js --verdade`.

## 2. Decisões travadas

- **Ratificar G3** como arquitetura canônica.
- **Horizonte 360 = declarado-não-construído**, com gatilhos nomeados (ver §5).
- **Throughput-primeiro** na automação progressiva: solidificar o runner `/schedule` + aprovação no dashboard **antes** de conectar métricas.
- **Princípio organizador "3 lares":** `CLAUDE.md` = como o sistema funciona; `brand/` = no que a marca acredita; `memory/` = o estado vivo. **Ponteiros, nunca cópias** — a duplicação foi a causa do drift.
- **Princípio de estratégia de conteúdo NÃO entra no `CLAUDE.md`** — é filosofia de marca, vai pro `brand/brand-book.md`.

## 3. Princípio organizador — 3 lares

| Doc | Responde | Relação |
|---|---|---|
| **CLAUDE.md** | como o **sistema** funciona | aponta para `brand/` e `memory/` — nunca copia |
| **`brand/`** | no que a marca **acredita** / como se posiciona | é a fonte da verdade |
| **`memory/`** | o que está **vivo** agora | é o estado |

Drift nasce quando uma vaza pro doc da outra.

## 4. Arquitetura canônica (G3) — 4 camadas sobre o cérebro

Um cérebro (`memory/`) com funções plugadas ao redor (blackboard). As funções não se falam — leem e escrevem o mesmo estado.

1. **Captura** — `pesquisador-mercado`, `arquivista` escrevem `mercado/`, `publico/`, `ramon/`, `pesquisa/`. Sensing leve semanal + deep mensal.
2. **Estratégia (2 velocidades)** — lento = `## Verdades` fixas no `brand/` (a marca é dona, não re-decide); rápido = `estrategista-mercado` aproveita o momento e direciona a uma verdade, equilibrando por saturação no `registro-angulos`. Pauta = tradução do momento em N briefings.
3. **Produção multicanal** — copy/design **inline** nas skills (canal via parâmetro); Dino Editor (visual) + banco de imagens por canal; `revisor-brand` (gate); write-back de 1 linha por peça aprovada. Canais: Instagram (vivo); blog/email/comunidade (skills prontas, disparo real depois); site (engenharia).
4. **Operacional** — `revisor-brand` (identidade + compliance), `analista-performance` (saturação agora; outcome quando métricas conectarem), orquestração (routines `/schedule` + governança + dashboard + política de publicação com gate humano).

**Produto** integra pelo cérebro (`/sinal-consultoria`), sem slice próprio.

**Loop de auto-aprimoramento, honesto:** hoje é de **cobertura** (anti-saturação por verdade/ângulo). Vira **otimização** quando `fetch_*` popular `metricas.md` — capacidade declarada (§5), gatilho = acesso ao Instagram conectado.

## 5. Horizonte declarado (não construído)

| Capacidade | O que é | Gatilho |
|---|---|---|
| Narrativa/campanha proativa | construir crença ao longo de semanas (não só aproveitar o momento) | evento datado a construir (lançamento, fase de competição do Ramon) |
| Loop de resultado (outcome) | `fetch_*` popula `metricas.md`, cruza por `slug` | conta Instagram/API conectada |
| Setor Produto vivo | roadmap de produto como ativo; consultoria alimentando o cérebro em volume | consultoria operando com alunos reais |

Até o gatilho disparar: **não construir**.

## 6. Estratégia de conteúdo (mora no `brand/`, não aqui)

Registrado para rastreabilidade — o texto vive em `brand/brand-book.md`, não no doc-mestre. A marca **não reage**: aproveita o momento (movimento de mercado + emoção do público) como abertura de atenção para **mostrar o caminho** — não o atalho que as pessoas querem, mas a direção que precisam, mesmo sem saber. O momento é o veículo; a **verdade é a âncora fixa**; o **pilar é variável livre** (educacional, estratégia, mindset).

## 7. Sequenciamento de migração (reconciliação)

O sistema já está construído em G3. "Migração" aqui é reconciliar o doc + limpar órfãos + dar a próxima rung de automação.

| Onda | Conteúdo | Risco |
|---|---|---|
| **R1 — Reconciliar CLAUDE.md** | os 8 itens de §8 | zero (só doc) |
| **R2 — Limpar órfãos + vocabulário** | drift de prosa (`narrativa ativa`, `designer`, `curador-export`, `briefing-writer`) + polimento "responde→aproveita/direciona" no `estrategista-mercado` + pauta | baixo |
| **R3 — Throughput-primeiro** | confirmar runner `/schedule` do `/novo-post --auto` headless + fluxo de aprovação de publicação no dashboard | médio (runtime) |
| **R4 — Manter horizonte declarado** | não construir outcome-loop / proativo / Produto até o gatilho | zero |
| **Paralelo (brand, gate `revisor-brand`)** | adicionar "Postura editorial — a marca não reage, mostra o caminho" ao `brand-book.md` | fora das ondas |

## 8. Mudanças exatas no CLAUDE.md

1. **Princípios centrais** → ponteiro para `## Verdades` (brand-book); sem re-listar (mata o drift de duplicação).
2. **Skills** → adicionar `editar-post`, `afinar-tom-de-voz`, `configurar-banco`.
3. **Pointer de agentes** → arquitetura viva = spec G3 `2026-06-07`; cérebro = `2026-06-06`; marcar `2026-05-22` como histórico (G1). + vocabulário do `estrategista-mercado` (responde→aproveita).
4. **Nova seção 5 — Produção visual** (Dino Editor + banco de imagens por canal); renumera Site→6, Orquestração→7.
5. **Orquestração — agendamento** → routines `/schedule` (handlers Vercel removidos).
6. **Orquestração — rotas** → documentação declarativa que as routines espelham (3 routines).
7. **Regras operacionais** → adicionar a regra de corpo (anti-diluição).
8. **Nova subseção — Horizonte declarado** (tabela de §5). + opcional: 1 linha sobre o projeto standalone metaverso-ia.

**Não muda (já é G3):** seção Cérebro, as Regras operacionais existentes, "Funções do sistema".

## 9. Critérios de aceitação

- [ ] CLAUDE.md descreve **um** sistema (G3); nenhum ponteiro aponta para G1/G2 como destino.
- [ ] Princípios centrais é ponteiro para o `## Verdades` canônico, sem lista divergente.
- [ ] As 3 skills ausentes (`editar-post`, `afinar-tom-de-voz`, `configurar-banco`) estão no doc.
- [ ] Dino Editor + banco de imagens têm seção própria.
- [ ] Agendamento descrito como routines `/schedule`, não handlers Vercel.
- [ ] Horizonte 360 declarado com gatilhos.
- [ ] Prosa órfã (`narrativa ativa`, `designer`, `curador-export`, `briefing-writer`) eliminada dos arquivos vivos.
- [ ] R3 (runtime) entregue como plano, não como edição.
