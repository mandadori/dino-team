---
name: relatorio-sistema
description: Gera o relatório periódico onde o brand OS narra a si mesmo — três camadas (prestação de contas, inteligência, direção) + autojulgamento da arquitetura. Dois modos de profundidade: pulso semanal (só script, ~zero token) e mensal profundo (script + agentes de domínio + arquiteto-sistema). Fatos por script (sem alucinação); custo e resultado/impacto ficam como seções deferidas honestas (Horizonte). Sintaxe — /relatorio-sistema [--pulso | --mes <YYYY-MM>].
---

# /relatorio-sistema — Dino Team

## Objetivo

Periodicamente, deixar o sistema reportar sobre si mesmo ao operador humano: o que fez e por quê (prestação de contas), o que muda lá fora (inteligência), para onde ir + como a própria arquitetura pode evoluir (direção + autoarquitetura). Artefato markdown versionado em `relatorios/`; o dashboard renderiza depois.

## Sintaxe

```
/relatorio-sistema                 # mensal profundo do mês fechado anterior
/relatorio-sistema --pulso         # pulso semanal (semana ISO fechada)
/relatorio-sistema --mes <YYYY-MM> # mês específico
```

## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ resolver período + criar pasta | args | — | `<YYYY-MM>` ou `<YYYY-Www>` |
| 2 | ⚙ `coletar.js` | período ← 1 | 1 | JSON de fatos |
| 2p | ⚙ `render_pulso.js` | fatos ← 2 | 2 | `pulso.md` → **fim** (modo `--pulso`) |
| 3 | agentes de domínio (×4) | fatos + slices ← 2 | 2 | resumos camadas B/C |
| 4 | `arquiteto-sistema` | git diff + foco + fatos + Camada D anterior ← 2 | 2 | Camada D |
| 5 | ⚙ tecer documento | tudo ← 2,3,4 | 4 | `relatorio.md` |
| 6 | ⚙ `registrar_execucao.js` | resultado ← 5 | 5 | linha no run-ledger |

## Quando dispara

- Cron mensal (dia 7) e semanal (2ª 7h) via routines `/schedule` (`orquestracao/rotas.yaml`).
- Manual via `/relatorio-sistema`.

## Agentes

| Agente | Quando | Camada |
|---|---|---|
| `pesquisador-mercado` | Modo mensal — inteligência externa + movimentos + antecipação de risco | B |
| `analista-performance` | Modo mensal — saturação + transparência de decisão | B |
| `estrategista-mercado` | Modo mensal — forward-looking / próximas jogadas | C |
| `estrategista-produto` | Modo mensal — estado de produto + oportunidades/evolução | C |
| `arquiteto-sistema` | Modo mensal — autojulgamento da arquitetura (foco rotativo) | D |

---

## Pipeline

### 1. Resolver período + criar pasta

- `--pulso` → semana ISO fechada anterior (`<YYYY-Www>`); senão mês fechado anterior (`<YYYY-MM>`), ou `--mes`.
- Pasta: `relatorios/<periodo>/`. Se `relatorio.md`/`pulso.md` já existir → abortar `RELATORIO_JA_EXISTE — relatorios/<periodo>` (re-run é decisão humana; `--force` sobrescreve).

### 2. Coletar fatos

Rodar `node scripts/relatorio/coletar.js --periodo <periodo>`. Guardar o JSON.

### 2p. Modo pulso (early-exit)

Se `--pulso`: `node scripts/relatorio/coletar.js --periodo <sem> | node scripts/relatorio/render_pulso.js > relatorios/<sem>/pulso.md`. Registrar no run-ledger (passo 6) e **terminar**. Sem agentes.

### 3. Resumos de domínio (modo mensal)

Acionar, cada um com o JSON de fatos + ponteiro pro slice, pedindo resumo conciso da janela:

- `pesquisador-mercado` → inteligência externa + movimentos de concorrentes + antecipação de risco (lê `memory/mercado/`, `memory/publico/`).
- `analista-performance` → leitura de saturação + transparência de decisão (lê `registro-angulos`).
- `estrategista-mercado` → forward-looking / próximas jogadas.
- `estrategista-produto` → estado de produto + oportunidades/evolução.

Falha de um agente: 1 retry; depois degradar a seção com "⚠ indisponível (falha em <agente>)" e seguir.

### 4. Autoarquitetura (`arquiteto-sistema`)

Computar o **foco rotativo** do mês: `agentes` se mês%3==1, `skills` se ==2, `memory-orquestracao` se ==0. Montar o git diff estrutural desde o último relatório:

```bash
git diff <ultimo-commit-de-relatorio>..HEAD -- .claude/agents .claude/skills memory/_schema.md CLAUDE.md
```

Acionar `arquiteto-sistema` com período + foco + diff + fatos + Camada D do relatório anterior (se houver).

### 5. Tecer o documento

Montar `relatorios/<YYYY-MM>/relatorio.md` na anatomia da spec §4.1:

- **Topo** — período / gerado / modo / **Insights do período** (2-3 bullets destilados).
- **Camada A** — tarefas & falhas dos fatos, melhorias dos commits, transparência de decisão, 💤 custo.
- **Camada B** — intel + risco (`pesquisador-mercado` + `analista-performance`).
- **Camada C** — forward-looking + conhecimento acumulado + 💤 resultado/impacto (`estrategista-mercado` + `estrategista-produto`).
- **Camada D** — autoarquitetura (`arquiteto-sistema`).

As seções 💤 são literais: "ainda não instrumentado — gatilho: <X>". Nenhum número fabricado.

### 6. Registrar execução

`node scripts/orquestracao/registrar_execucao.js --skill relatorio-sistema --modo <auto|manual> --resultado ok`.

---

## Modo cron (sem humano)

- Igual, sem pausa. Falha → registrar `--resultado falha --nota <motivo>` e logar.

## Critério de conclusão

- `relatorios/<periodo>/relatorio.md` (mensal) ou `pulso.md` (semanal) existe.
- Modo mensal: 4 camadas presentes; 💤 custo e 💤 resultado/impacto literais (nenhum número fabricado).
- Run-ledger recebeu a linha desta execução.
