# Ângulos Queimados — Gatilho no Finalizar

> Spec de design. Brainstorm em 2026-06-04.
> Frente ④ (papéis de agente). Corrige o furo de fluxo que deixa `dados/performance/angulos-queimados.md` sempre vazio, mudando o gatilho de escrita de "publicação via API" (que nunca dispara) para "post finalizado e salvo". Não altera o `pesquisador-mercado`.

---

## Contexto

`dados/performance/angulos-queimados.md` (owner: `analista-performance`) registra ângulos editoriais usados recentemente que precisam descansar, para as skills não repetirem tema. O **read-side já funciona**: `/novo-post` (Passos 3 e 6), `/lote-posts` e `/planejar-pauta-semanal` leem o arquivo ao escolher tema/ângulo.

**O furo:** o `analista-performance` só escreve "após uma publicação ser aprovada" — pensado para um gatilho de publicação via API. Mas não há automação de publicação (e não haverá tão cedo), e o `/novo-post` termina no export/entrega. Resultado: **o arquivo nunca popula** → a checagem de "não repetir" lê um arquivo sempre vazio → a proteção contra repetição de tema é fantasma.

Além disso, o cabeçalho de `angulos-queimados.md` cita o `briefing-writer` — agente **deletado** na simplificação do pipeline. Referência stale.

> Escopo explícito: **não tocar** no `pesquisador-mercado` (era observação do usuário, não pedido de mudança). Não tocar no read-side (já funciona).

## Decisão (brainstorm 2026-06-04)

| # | Decisão | Escolha |
|---|---------|---------|
| D1 | Gatilho de escrita | **"Post finalizado e salvo"** (não publicação via API). Criar+salvar um post é o proxy de "vai ser publicado" |
| D2 | Ponto no fluxo | Após o post ser **aprovado (Passo 13)** e **salvo como permanente (Passo 15)** do `/novo-post`. Post descartado **não** grava |
| D3 | Quem escreve | `analista-performance` (owner), acionado pela skill no novo passo — sua task "registrar ângulo queimado" já existe |
| D4 | Janela de descanso | Definida pelo `analista-performance` por bom senso editorial (já é princípio dele) |

---

## Arquitetura da solução

### Fluxo novo (write-side)

```
/novo-post:
  Passo 6  → briefing inline produz {ângulo, pilar, objetivo, slug}
  Passo 13 → revisor-brand: APROVADO
  Passo 15 → salvar permanente (ou descartar _rascunho/)
  Passo 15.x (NOVO) → se salvo (não descartado): acionar analista-performance
                      "registrar ângulo queimado" com {ângulo, pilar, slug, data}
```

A leitura continua nos Passos 3/6 (escolha de tema) — agora encontrando entradas reais.

### Arquivos modificados

1. **`.claude/skills/novo-post/SKILL.md`**
   - Adicionar passo **15.x** (após o salvar-permanente do Passo 15, antes/junto do Passo 16 de publicação): se o post foi salvo (não descartado), acionar `analista-performance` com `{ângulo central, pilar, slug, data de hoje}` capturados no Passo 6.
   - Atualizar a tabela de Fluxo (`## Fluxo`) com o novo passo.

2. **`.claude/skills/lote-posts/SKILL.md`**
   - Mesmo registro por post finalizado: ao salvar cada post do lote, acionar `analista-performance` com o ângulo daquele post.

3. **`.claude/agents/analista-performance.md`**
   - Reescrever o gatilho: de "após uma publicação ser aprovada" / "Quando a publicação real e as métricas existirem" para **"após o post ser finalizado e salvo (export + aprovação + salvo permanente)"**. A task #1 ("Registrar ângulo queimado") permanece; só muda o quando.
   - Remover a dependência implícita de publicação via API como condição para popular `angulos-queimados`.

4. **`dados/performance/angulos-queimados.md`**
   - Corrigir o cabeçalho: remover "Lido por `briefing-writer`" (agente deletado). Descrever o fluxo real: **lido pela skill `/novo-post` (briefing inline) ao escolher o ângulo; escrito por `analista-performance` após o post ser finalizado e salvo.**

5. **`dados/_schema.md`**
   - Se a descrição do slice `performance` citar o gatilho antigo ("após publicação"/"quando métricas existirem" como condição para `angulos-queimados`), alinhar para o gatilho novo. Se não citar, nenhuma mudança.

### O que NÃO muda

- `pesquisador-mercado` e `dados/mercado/` — intocados.
- Read-side (Passos 3/6 já leem `angulos-queimados`).
- A estrutura de entrada do `angulos-queimados.md` (slug, data, resumo, janela, data de retorno) — mantida.
- Sub-slices futuros de métricas por canal do `analista-performance` — fora de escopo (YAGNI, como já está).

## Casos de borda

- **Post descartado no Passo 15:** não grava ângulo (não vai ao ar).
- **Briefing pré-pronto (vindo da pauta):** o ângulo vem do briefing; grava igual ao finalizar.
- **Lote:** cada post finalizado grava o seu; um lote de N posts adiciona N entradas (ou atualiza, se o mesmo ângulo se repetir no lote — o que o próprio lote deveria evitar via read-side).
- **Mesmo ângulo já presente:** `analista-performance` atualiza a data da última publicação em vez de duplicar.

## Validação

Sem teste unitário (é skill/doc). Validar por:
- **Coerência de referências cruzadas:** nenhuma menção remanescente a "publicação via API" como gatilho de `angulos-queimados`, nem ao agente deletado `briefing-writer`.
- **Fluxo real (pelo usuário):** rodar um `/novo-post` de ponta a ponta e confirmar que `angulos-queimados.md` ganha a entrada ao salvar; um segundo tema próximo deve aparecer sinalizado como queimado na leitura.

## Fora de escopo

- Qualquer mudança no `pesquisador-mercado` / `dados/mercado/`.
- Automação de publicação via API (não existe e não entra agora).
- Métricas de canal / sub-slices de performance.
