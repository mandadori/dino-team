# Relatório autoconsciente do brand OS — design

> Spec de design. Status: aprovada no brainstorming (2026-06-09).
> Topo: o sistema narra a si mesmo, periodicamente, para o operador humano.

---

## 1. Problema & objetivo

O Dino Team é um brand OS multi-agente que opera cada vez mais sozinho (routines `/schedule` autônomas, gates de marca, cérebro de memória). Falta uma camada onde **o sistema reporta sobre si mesmo** ao operador humano: o que fez e por quê, o que mudou lá fora, o que aprendeu, e — o mais valioso — **como o próprio sistema pode evoluir**.

Objetivo: um relatório periódico que tece **três camadas** num documento só:

1. **Prestação de contas** — o sistema se explica (tarefas, falhas, melhorias autônomas, transparência de decisão, custo).
2. **Inteligência** — o que muda fora (concorrentes, tendências, risco antecipado).
3. **Direção** — forward-looking + conhecimento acumulado + **autojulgamento da própria arquitetura**.

A superfície inicial é um **artefato markdown versionado**; o dashboard renderiza quando estiver pronto (caminho de migração declarado pelo usuário).

### Princípio que governa o design

A natureza de risco do conteúdo é dupla e oposta:

- **Agregação** (insights, intel, git, decisões) = determinística. Lê fontes e resume. Sem risco de alucinação.
- **Autojulgamento** (avaliar estrutura/contexto/agentes) = passe de raciocínio. É onde mora o valor *e* o risco de virar "AI-slop" genérico.

A trava é **separar as duas por componente**: os números vêm de um script (zero LLM, zero número inventado); a opinião vem de um agente, **só onde opinar agrega** e sempre aterrada em evidência citável.

### Honestidade sobre dados (anti-vaporware)

Custo e resultado/impacto **não têm fonte hoje** — são exatamente os loops que o CLAUDE.md já declara como **Horizonte ("não construir até o gatilho")**. O relatório **não fabrica** esses números: ele os exibe como seção `💤 ainda não instrumentado — gatilho: X`, visível e honesta, igual ao padrão do Horizonte.

---

## 2. Arquitetura — 4 componentes + 1 instrumentação

| Componente | Tipo | Papel | Por que aqui |
|---|---|---|---|
| `scripts/relatorio/coletar.js` | script determinístico | Coleta os **fatos** do período: git log, logs de `campanhas/`, contagem de saturação do `registro-angulos`, datas de `ultima_atualizacao` dos slices, run-ledger. Emite JSON de fatos. | Números não passam por LLM → sem alucinação. |
| Agentes de domínio (existentes) | reuso | Cada um resume o *seu* slice: `pesquisador-mercado` (intel externa), `analista-performance` (saturação/decisões), `estrategista-mercado` (forward-looking), `estrategista-produto` (produto). | Já são donos desses domínios; a skill só pede o resumo, não re-pesquisa. |
| `arquiteto-sistema` | **agente novo** | Autojulgamento: saúde + drift + propostas de arquitetura + eficiência de contexto/agentes, medido contra a constituição do sistema (CLAUDE.md, `_schema.md`, contratos). Cita arquivo+evidência. Advisory. | Única função nova "decide-e-é-caro" → vira agente (regra do próprio sistema). |
| `/relatorio-sistema` | skill L2 composta | Orquestra: roda o script → chama os agentes → tece o documento → grava. | Skills orquestram fluxo; agentes possuem função. |
| `orquestracao/execucoes.jsonl` + `scripts/orquestracao/registrar_execucao.js` | run-ledger leve | Telemetria de execução das routines autônomas. Fonte real da seção "tarefas executadas / falhas". | Sem retrofitar 10+ skills; só as 4 autônomas + a própria. |

### Fronteiras (o que NÃO faz)

- Não publica nada.
- Não auto-aplica nenhuma proposta de arquitetura (advisory absoluto; humano ratifica).
- Não fabrica número (custo e resultado/impacto são `💤` deferidos).
- Não re-pesquisa mercado (lê o que já está no cérebro).

---

## 3. Cadência & custo — tiered (pulso semanal + mensal profundo)

O custo concentra no passe do `arquiteto-sistema`. Semanal-profundo seria ruim por **dois** motivos: custo de token **e** sinal (arquitetura não muda toda semana → propostas se repetem → fadiga de alarme). A solução é **dois níveis de profundidade do mesmo coletor**:

| | Pulso semanal | Relatório mensal |
|---|---|---|
| Custo | ~zero token (só `coletar.js`) | moderado (script + agentes + arquiteto, com delta + rodízio) |
| Conteúdo | o que muda rápido: posts, saturação, runs/falhas, manchetes de intel | as 3 camadas completas + autojulgamento profundo |
| Fonte | `coletar.js` | `coletar.js` + agentes + `arquiteto-sistema` |
| Risco de ruído | baixo (fatos, não opinião) | baixo (profundo só 1×/mês) |

O pulso é **quase de graça de construir** porque é a camada de fatos que o mensal já produz, renderizada num template fino, **sem chamar agente**.

### Controle de custo do autojulgamento: delta + foco rotativo

O `arquiteto-sistema` **não relê tudo todo mês**. Cada relatório audita:

- **(a) o delta** — git diff dos arquivos estruturais (`.claude/agents/`, `.claude/skills/`, `memory/_schema.md`, `CLAUDE.md`) desde o último relatório. Barato e direcionado.
- **(b) um subsistema em rodízio** — mês 1: agentes → mês 2: skills → mês 3: memory/orquestração → volta.

Isso teta o custo por run **e** dá cobertura completa da arquitetura a cada trimestre.

---

## 4. Anatomia dos documentos

### 4.1 Relatório mensal — `relatorios/<YYYY-MM>/relatorio.md`

**Topo:** período · gerado em · modo (cron/manual) · **Insights do período** (2-3 bullets destilados — os aprendizados mais valiosos do mês).

**Camada A — Prestação de contas** *(o sistema sobre si)*

| Seção | Fonte |
|---|---|
| Tarefas executadas & falhas | run-ledger + logs de `campanhas/` |
| Melhorias autônomas (histórico) | git log do período, agrupado por feat/fix/docs |
| Transparência de decisão (o *porquê*) | `registro-angulos` (verdade/pilar/ângulo por peça) + justificativas dos briefings |
| 💤 Custo no período | **ainda não instrumentado — gatilho: telemetria de tokens/API** |

**Camada B — Inteligência** *(o que muda lá fora)*

| Seção | Fonte |
|---|---|
| Inteligência externa & movimentos de concorrentes | síntese do `pesquisador-mercado` sobre `mercado/` + `publico/` |
| Antecipação de risco | tensões: tendência que contradiz uma verdade, concorrente avançando, objeção crescente |

**Camada C — Direção** *(forward-looking)*

| Seção | Fonte |
|---|---|
| Forward-looking / próximas jogadas | `estrategista-mercado` (o que o momento pede) + `estrategista-produto` (oportunidades/evolução) |
| Conhecimento acumulado | diff de `biblioteca/` + `pesquisa/` no período |
| 💤 Resultado & impacto | **ainda não instrumentado — gatilho: conta IG/API conectada (`metricas.md`)** |

**Camada D — Autoarquitetura** *(`arquiteto-sistema`)*

| Seção | Fonte |
|---|---|
| Saúde & drift | slices stale, divergência CLAUDE.md↔disco, saturação preocupante |
| Propostas de evolução | mudanças concretas em agentes/skills/slices — cada uma com evidência + *porquê* + status (novo / reincidente / resolvido) + severidade |
| Foco do mês (rodízio) | deep-dive do subsistema da vez |

As seções `💤` ficam visíveis e honestas — sinalizam o gatilho que as destrava.

### 4.2 Pulso semanal — `relatorios/<YYYY-Www>/pulso.md`

Só fatos, sem agente, sem opinião:

- Posts criados/publicados na semana (`campanhas/` + `export/`)
- Ângulos saturando (contagem do `registro` na janela)
- Runs & falhas da semana (run-ledger)
- Manchetes de intel — **títulos já escritos** das entradas recentes de `mercado/` + `publico/`, com link pro arquivo (sem interpretação; síntese é trabalho do agente, no mensal)
- Melhorias da semana (git log, uma linha cada)
- → link pro último relatório mensal

---

## 5. Componentes em detalhe

### 5.1 `scripts/relatorio/coletar.js`

Script Node determinístico. Recebe `--periodo <YYYY-MM | YYYY-Www>` (ou início/fim). Emite JSON de fatos em stdout (e opcionalmente grava em `relatorios/<periodo>/.fatos.json`).

Fatos coletados:

- **git** — commits no intervalo de datas, com `{hash, tipo (feat|fix|docs|outro), escopo, assunto}`.
- **campanhas** — varre `campanhas/*/log.md` + `status.yaml` no período: campanhas criadas, estado, aprovações pendentes.
- **registro-angulos** — parse da tabela; contagem por `verdade` e por `ângulo` na janela (saturação); ângulos em descanso (data+descanso futuro).
- **slices** — `ultima_atualizacao` (frontmatter) de cada slice de `memory/`; sinaliza staleness vs. cadência esperada.
- **run-ledger** — parse de `orquestracao/execucoes.jsonl` no período: por skill, contagem ok/falha.
- **biblioteca/pesquisa diff** — arquivos novos em `memory/biblioteca/fontes/` e `memory/pesquisa/` no período (por data de criação git).

Determinístico e testável: dado um estado de repo fixture, produz JSON previsível. Cold-start (intervalo vazio) → JSON com listas vazias, nunca erro.

### 5.2 `scripts/orquestracao/registrar_execucao.js`

Padrão do `append_registro_angulos.js`. CLI:

```
node scripts/orquestracao/registrar_execucao.js \
  --skill <nome> --modo <auto|manual> --resultado <ok|falha> [--slug <slug>] [--nota <txt>]
```

Anexa uma linha JSON a `orquestracao/execucoes.jsonl`:

```json
{"ts":"2026-06-09T12:00:00-03:00","skill":"pesquisar-mercado","modo":"auto","resultado":"ok","slug":null,"nota":null}
```

Cria o arquivo se ausente. Chamado por: `pesquisar-mercado`, `planejar-pauta-semanal`, `novo-post --auto`, `evoluir-produto`, e `/relatorio-sistema` — no fim de cada run.

### 5.3 Agente `arquiteto-sistema`

**Função:** meta-arquiteto do brand OS. Reasoner **stateless** — não possui slice de memory (o relatório anterior é a memória; a skill passa a Camada D anterior para computar status).

**Recebe da skill** (input cirúrgico — é o que teta o custo):

- Período + git diff dos arquivos estruturais desde o último relatório.
- O subsistema do **foco rotativo** do mês.
- JSON de fatos (saturação, staleness).
- Camada D do relatório anterior (para status novo/reincidente/resolvido).

**Contexto que carrego** (declarado no contrato): `CLAUDE.md`, `memory/_schema.md`, `docs/specs/` (specs canônicas), `orquestracao/governanca.yaml`. Os contratos/skills específicos chegam via o git diff + o foco do mês (não lê todos sempre).

**O que inspeciona:**

- **Drift** — CLAUDE.md declara vs. disco (skill citada inexistente; slice declarado sem leitura; contagem de agentes diverge).
- **Saúde** — slices stale (data vs. cadência), slices mortos, saturação em extremo.
- **Violação de constituição** — contrato repetindo contexto que já declara; skill embutindo comportamento de agente; skill sem `## Fluxo`; schema de saída drift — medido contra as regras do **próprio** CLAUDE.md.
- **Eficiência de contexto** — contrato inchado, injeção redundante, arquivo grande demais.

**Travas anti-slop (invariantes do contrato):**

1. Todo achado **cita arquivo (+ seção/linha) e a regra/evidência específica**. Sem citação → não entra.
2. **Proibido** best-practice genérico solto ("adicione testes", "modularize") — só vale amarrado a violação concreta de regra *declarada*.
3. Cada proposta = `evidência → por que importa → mudança proposta → status → severidade`.
4. **Advisory absoluto** — nunca edita, nunca auto-aplica.
5. **Silêncio quando limpo** — subsistema sem drift novo → "sem drift em X", e ponto (anti-padding).

**Entrega:** markdown estruturado (a Camada D), sem preâmbulo — schema rígido como todo agente do sistema.

### 5.4 Skill `/relatorio-sistema`

Modos:

- `/relatorio-sistema` → mensal profundo do mês fechado anterior.
- `/relatorio-sistema --pulso` → pulso semanal (só coletor + template).
- `/relatorio-sistema --mes <YYYY-MM>` → mês específico.

Fluxo (tabela `## Fluxo` no SKILL.md):

| Passo | Agente/Ação | Recebe | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ resolver período + criar pasta | args | — | `<YYYY-MM>` ou `<YYYY-Www>` |
| 2 | ⚙ `coletar.js` | período | 1 | JSON de fatos |
| 2.pulso | ⚙ template do pulso | fatos | 2 | `pulso.md` → **fim** (modo pulso) |
| 3 | agentes de domínio (×4) | fatos + slices | 2 | resumos das camadas B/C |
| 4 | `arquiteto-sistema` | git diff + foco + fatos + Camada D anterior | 2 | Camada D |
| 5 | ⚙ tecer documento | tudo ← 2,3,4 | 4 | `relatorio.md` |
| 6 | ⚙ `registrar_execucao.js` | resultado | 5 | linha no run-ledger |

---

## 6. Tratamento de erro

| Situação | Comportamento |
|---|---|
| Relatório do período já existe | aborta `RELATORIO_JA_EXISTE` — re-run é decisão humana (`--force`) |
| Um agente de domínio falha | degrada a seção: "⚠ indisponível (falha em `<agente>`)"; **o relatório ainda sai**. Máx 1 retry, depois degrada |
| `coletar.js` falha | fatal (fatos são a espinha) — aborta |
| Cold start (sem runs / sem git no período) | seções dizem "sem atividade no período"; relatório gera |
| run-ledger vazio | "sem execuções registradas" (esperado no cold start) |

**Princípio:** o relatório é resiliente — uma peça falhando vira uma linha honesta de indisponibilidade, não mata o documento.

---

## 7. Cadência operacional (routines `/schedule`)

Duas entradas novas em `orquestracao/rotas.yaml` (documentação declarativa que as routines espelham):

| Routine | Cadência | Skill | Modo |
|---|---|---|---|
| relatorio-mensal | dia 7 de cada mês, 9h America/Sao_Paulo | `/relatorio-sistema` | autônomo |
| pulso-semanal | 2ª 7h America/Sao_Paulo (antes da pauta das 9h) | `/relatorio-sistema --pulso` | autônomo |

O mensal sai **depois** de `pesquisar-mercado` (dia 1) e `evoluir-produto` (dia 5) — vê o cérebro já atualizado. Notificação: dashboard (sucesso/falha).

---

## 8. Governança & doc-mestre

- `orquestracao/governanca.yaml`: nova função `auto-relato-sistema`, autonomia `automatico` para **gerar**; agir nas propostas de arquitetura = `humano` (advisory).
- `CLAUDE.md` (doc-mestre): adicionar `/relatorio-sistema` às skills, `arquiteto-sistema` aos agentes (roster **12→13**), `relatorios/` à estrutura de pastas, run-ledger à seção de orquestração. Manter doc↔realidade em sincronia (o próprio `arquiteto-sistema` flagaria esse drift).
- `memory/_schema.md`: **sem novo slice** (o `arquiteto-sistema` é stateless; o run-ledger é orquestração, não cérebro). Nenhuma mudança de ownership.

---

## 9. Estratégia de teste

- `coletar.js` — testes unitários com fixtures (git log, logs de campanha, registro, `execucoes.jsonl`, datas de slice) → JSON de fatos correto. Inclui cold-start vazio.
- `registrar_execucao.js` — anexa linha correta; cria arquivo se ausente; lida com `--nota` ausente.
- Pulso — dado JSON de fatos, template produz as seções esperadas.
- `arquiteto-sistema` — teste comportamental: fixture com **drift plantado** (ex: CLAUDE.md cita skill inexistente) → agente flaga citando o arquivo; fixture limpa → "sem drift". Mais smoke no repo real.
- E2E — smoke de `--pulso` e mensal no repo real; eyeball do output.

---

## 10. Fora de escopo (declarado, não construído)

- **Telemetria de custo** (tokens/API) — gatilho: API/conta conectada. Até lá, seção `💤`.
- **Resultado & impacto** (métricas reais) — gatilho: conta IG/API conectada populando `metricas.md`. Até lá, seção `💤`.
- **Renderização no dashboard** — o artefato vive em `relatorios/`; o dashboard lê quando a rota existir (migração futura).
- **Retrofit do run-ledger nas skills manuais** — só as 4 autônomas + a própria por ora.

---

## 11. Critério de conclusão

- `relatorios/<periodo>/` existe com `relatorio.md` (mensal) ou `pulso.md` (semanal).
- `coletar.js` emite JSON de fatos determinístico; testado com fixtures incl. cold-start.
- `registrar_execucao.js` existe e está fiado nas 4 routines autônomas + na própria skill.
- Agente `arquiteto-sistema` existe com travas anti-slop no contrato; teste de drift plantado passa.
- Skill `/relatorio-sistema` (3 modos) com `## Fluxo`, degradação graciosa, e write no run-ledger.
- Seções `💤` honestas (custo, resultado/impacto) — nenhum número fabricado.
- `rotas.yaml`, `governanca.yaml`, `CLAUDE.md` atualizados; doc↔realidade em sincronia.
