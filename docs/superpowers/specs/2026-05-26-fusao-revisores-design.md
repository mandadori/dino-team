# Spec: Fusão dos Agentes Revisores

**Data:** 2026-05-26
**Status:** aprovado

---

## Contexto

O pipeline `/novo-post` rodava 3 agentes revisores sequencialmente no Passo 11:

1. `revisor-coerencia` — coerência editorial com briefing + qualidade de copy (3 níveis)
2. `revisor-brand` — identidade da marca: paleta, tipografia, tom de voz, mood (binário)
3. `revisor-compliance` — promessas proibidas e claims sensíveis (binário)

Problemas identificados:
- A Dimensão 1 do `revisor-coerencia` ("alinhamento com brand book") sobrepõe parcialmente o `revisor-brand`.
- 3 chamadas sequenciais criam 3 loops de retrabalho independentes — dificulta automação por routines.
- Compliance (não prometer atalhos, não garantir resultado) é conceitualmente editorial, não identidade visual.

---

## Decisão

**Opção B:** manter `revisor-brand` inalterado como guardião transversal de identidade; fundir `revisor-coerencia` + `revisor-compliance` num novo `revisor-conteudo`.

Resultado: 3 chamadas → 2 chamadas no Passo 11. `revisor-brand` continua transversal e usável por qualquer skill (ex: `/novo-site`).

---

## Agente: `revisor-conteudo`

Substitui `revisor-coerencia` e `revisor-compliance`.

### Responsabilidade

Checar se o artefato (1) cumpre o que o briefing prometeu e tem qualidade editorial sólida, e (2) não faz promessas proibidas nem usa claims sensíveis.

### Contexto carregado automaticamente

- `brand/brand-book.md`
- `brand/pilares-conteudo.md`

### Contrato de entrada

```
Tarefa: revisar conteúdo do post pronto.

Inputs:
- Pasta do post (todos os artefatos).
- Briefing estratégico original (inline, na íntegra).

Saída: inline (parecer markdown estruturado).
```

Sem `Tarefa` ou `Inputs` → devolver `INPUT_INSUFICIENTE — <o que falta>`.
Sem briefing inline (só slug) → devolver `BRIEFING_AUSENTE`.

### Contrato de saída

```
## Parecer — revisor-conteudo

### Seção 1: Coerência editorial
Status: APROVADO | COM AJUSTES | REPROVADO

1. Coerência com briefing (ângulo, pilar, objetivo, recorte): {ok / desvio}
2. Qualidade editorial (hook, 1 ideia/bloco, CTA específico): {ok / falha por bloco}
3. Integridade técnica (qtd. PNGs = qtd. assets; pesquisa-base.md presente): {ok / ausência}

Ajustes recomendados (se COM AJUSTES ou REPROVADO):
- {arquivo}: {ponto} → {direção do ajuste}

### Seção 2: Compliance
Status: APROVADO | REPROVADO

Categorias varridas:
- Saúde: {ok / violação com arquivo + trecho}
- Jurídico: {ok / violação}
- Suplementação: {ok / violação}
- Promessas irreais: {ok / violação}

Pontos críticos (se REPROVADO):
- {arquivo}: {trecho} → categoria: {nome} → ação: {remover / reescrever}

### Status final
APROVADO | COM AJUSTES | REPROVADO

### Ação (quando COM AJUSTES ou REPROVADO)
agente: copywriter | designer | copywriter+designer
instrucao: <texto direto pronto para ser passado ao agente>
```

### Regra de composição do status final

- Qualquer `REPROVADO` (em qualquer seção) → final `REPROVADO`
- Nenhum REPROVADO + algum `COM AJUSTES` → final `COM AJUSTES`
- Tudo `APROVADO` → final `APROVADO`

---

## Agente: `revisor-brand` (inalterado, adição mínima)

Mantém contrato atual. Acréscimo: campo `Ação` no output quando REPROVADO.

```
### Ação (quando REPROVADO)
agente: copywriter | designer | copywriter+designer
instrucao: <texto direto pronto para ser passado ao agente>
```

---

## Passo 11 atualizado — `/novo-post`

```
### 11. Curadoria editorial final

Duas revisões em sequência. Toda reprovação interrompe e devolve
a etapa apontada para refazer.

Controle de tentativas:
- max_tentativas_11a: 3
- max_tentativas_11b: 2
Se atingir o limite → pausar e apresentar ao usuário:
  "Curadoria travada após N tentativas em [11a|11b].
   Parecer atual: <inline>
   Ação necessária: <instrução do revisor>"

#### 11a. Conteúdo (revisor-conteudo)

Tarefa: revisar conteúdo do post pronto.

Inputs:
- Pasta do post: export/conteudos/<formato>/<data>-<slug>/
- Briefing estratégico original (inline, na íntegra): <briefing guardado no Passo 4>

Avalie Seção 1 (coerência editorial: briefing, qualidade, integridade técnica)
e Seção 2 (compliance: saúde, jurídico, suplementação, promessas irreais).

Saída: parecer inline com status final + campo Ação quando não APROVADO.

- APROVADO ou COM AJUSTES → seguir para 11b.
  Se COM AJUSTES: aplicar instrução do campo Ação antes de seguir
  (acionar agente indicado com a instrução inline).
- REPROVADO → acionar agente indicado no campo Ação; re-rodar 11a.
  Incrementar contador de tentativas_11a.

#### 11b. Brand (revisor-brand)

Tarefa: validar identidade da marca no post pronto.

Inputs:
- Pasta do post: export/conteudos/<formato>/<data>-<slug>/
- Briefing estratégico original (inline, na íntegra): <briefing guardado no Passo 4>

Avalie tom de voz, paleta/tipografia, pilar, mood/identidade visual
contra brand/. Decisão binária.

Saída: parecer inline com campo Ação quando REPROVADO.

- APROVADO → consolidar briefing.md usando `templates/briefing.md` e gravar em `export/conteudos/<formato>/<data>-<slug>/briefing.md`.
- REPROVADO → acionar agente indicado no campo Ação; re-rodar 11a desde o início.
  Incrementar contador de tentativas_11b.
```

---

## Arquivos afetados

| Ação | Arquivo |
|---|---|
| Criar | `.claude/agents/revisor-conteudo.md` |
| Remover | `.claude/agents/revisor-coerencia.md` |
| Remover | `.claude/agents/revisor-compliance.md` |
| Atualizar | `.claude/skills/novo-post/SKILL.md` — Passo 11 |
| Atualizar | `CLAUDE.md` — lista de agentes (16 → 15) |

---

## Anti-padrões do `revisor-conteudo`

- Aprovar para "não atrasar".
- Reprovar sem indicar `Ação` com agente + instrução.
- Reescrever copy ou design (devolver parecer; quem produziu corrige).
- Misturar avaliação de identidade visual com coerência editorial (isso é `revisor-brand`).
- Omitir o campo `Ação` quando status não for APROVADO.

---

## Critério de conclusão da implementação

- `.claude/agents/revisor-conteudo.md` existe com contrato completo.
- `.claude/agents/revisor-coerencia.md` e `.claude/agents/revisor-compliance.md` removidos.
- `SKILL.md` do `/novo-post` tem Passo 11 com 2 etapas (11a + 11b), contador de tentativas e roteamento automático via campo `Ação`.
- `CLAUDE.md` lista 15 agentes (não 16) com `revisor-conteudo` no lugar dos dois removidos.
- `revisor-brand.md` tem campo `Ação` no contrato de saída.
- Smoke test: rodar `/novo-post` end-to-end e verificar que o Passo 11 aciona `revisor-conteudo` → `revisor-brand` em sequência.
