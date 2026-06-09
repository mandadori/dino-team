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

```
/evoluir-produto [<slug-do-produto> | --todos]
```

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
```
<nome>: recomendação <evoluir | SUNSET | manter>
Porquê (valor futuro): <justificativa — ignora esforço já investido>
Ação proposta: <mudança de oferta | APOSENTAR>

- evoluir: "sim" aplica a mudança | "ajustar ..." 
- SUNSET: "matar <slug>" confirma a aposentadoria | "manter" cancela
```
Autonomia `humano` para sunset (ver `governanca.yaml` → `sunset-produto`).

### 4. Aplicar
Acionar `estrategista-produto` para atualizar `catalogo.md`: evolução → ajusta a oferta e
status `em-evolução`; sunset confirmado → status `aposentado` + motivo. Novas
oportunidades surgidas do sinal → o agente as grava em `oportunidades.md` (realimenta a
descoberta).

### 5. Relatório inline
```
Ciclo de evolução: <N> avaliados → <N evoluídos>, <N aposentados>, <N mantidos>.
Novas oportunidades: <slugs | nenhuma>.
```

## Notas operacionais
- **Sinal de melhoria hoje é de mercado** (vendas, lista, objeções do IG). Sinal de **uso** (retenção/churn) entra no Sub-projeto B.
- Invocada manualmente **e** pela rotina mensal (`rotas.yaml` → `evolucao-produto-cron`), que **só sinaliza** — humano decide.
- Sem produto `ativo` → `SEM_PRODUTOS_ATIVOS` (esperado no cold start, antes do 1º lançamento).

## Critério de conclusão
- `catalogo.md` reflete as decisões aprovadas; nenhum sunset sem confirmação humana.
- Novas oportunidades (se houver) registradas em `oportunidades.md`.
