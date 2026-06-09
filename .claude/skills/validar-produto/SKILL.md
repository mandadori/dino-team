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

```
/validar-produto <slug-do-produto> [--tipo <fake-door|landing|concierge>]
```

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
```
Experimento "<tipo>" para "<nome>":
<passos para rodar no IG/landing>
Critério de sucesso: <métrica + limiar>. Mata se: <condição>.

Rode e me diga o resultado (ex: "82 comentários EU QUERO", "12 e-mails na lista", "3 vendas concierge").
```
Aguardar o resultado real reportado pelo humano. **Não inventar resultado.**

### 4. Registrar resultado (passa/morre)
Comparar resultado vs critério. Acionar `estrategista-produto` para atualizar `catalogo.md`:
- **Passou** → status `em-construção` (aguardando G-lançamento) + linha de evidência (o resultado).
- **Morreu** → status `aposentado` + **aprendizado** (o que o sinal ensinou — vira insumo de descoberta). Reportar e **encerrar** (sem G-lançamento).

### 5. ⏸ G-lançamento (gate humano consolidado)
Só se passou. Apresentar o **pacote** e pedir um único go/no-go:
```
"<nome>" VALIDADO (<resultado> vs critério <limiar>).
Pacote de lançamento:
- Construir: <o que será produzido + quem (delegação de asset)>
- Preço: <preço proposto — base economia.md/benchmark>
- Distribuição: <plano proposto — canais, sequência, claim principal>

- "sim" → libero construção + handoff de distribuição pro marketing
- "ajustar <campo>: <valor>" → revejo o pacote
- "não" → mantenho aprendizado, não lanço
```
Autonomia `humano` (ver `governanca.yaml` → `lancamento-produto`). O plano de distribuição
foi **traçado** automaticamente; **nada executa sem este ok**. A publicação peça-a-peça
ainda passa pelo gate mecânico existente (`revisor-brand` + dashboard).

### 6. Relatório inline
```
<nome>: <VALIDADO e lançado | morreu (aprendizado registrado)>.
<se lançado:> Handoff de distribuição disponível p/ marketing (catalogo.md lido por estrategista-mercado).
<se morreu:> Aprendizado em catalogo.md — alimenta a próxima descoberta.
```

## Notas operacionais
- **Morte-por-padrão é feature.** Matar barato é o resultado esperado da maioria das validações.
- A skill **não roda** o experimento — emite o brief; o humano executa na audiência e reporta. Sinal real, nunca fabricado.
- Cold start: o canal de validação é o Instagram (Ramon + 400 alunos), independente da plataforma.

## Critério de conclusão
- `catalogo.md` reflete o desfecho: `em-construção` (validado, pós G-lançamento) ou `aposentado` (com aprendizado).
- G-lançamento resolvido pelo humano quando o produto passou.
