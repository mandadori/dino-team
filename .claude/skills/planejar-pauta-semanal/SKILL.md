---
name: planejar-pauta-semanal
description: Skill L2 (composta). Produz N briefings estratégicos para a semana corrente sem executar os posts — a execução fica por conta de /lote-posts ou /novo-post posteriores. Output em `campanhas/<YYYY-Www>-pauta-semanal/`. Acionada por cron (toda 2ª 9h) ou manualmente. Briefings escritos inline pela skill.
---

# /planejar-pauta-semanal — Dino Team

## Objetivo

Toda semana, planejar **N briefings** que cubram os pilares ativos, evitem ângulos queimados e levem em conta o estado atual de Ramon. **Não executa posts** — gera só a pauta para `/lote-posts` ou `/novo-post` rodarem depois (manual ou disparados pelo dashboard).

A pauta semanal traduz o **momento** (emoção do público + crença de mercado, lidos pelo pesquisador) na **verdade** da marca que responde — via `estrategista-mercado`. A conexão entre semanas **emerge** do conjunto fixo de `## Verdades` (brand-book) + voz, não de campanha prescrita.

Os briefings são artefatos gravados em `campanhas/.../output/posts/` — são handoff cross-skill, consumidos posteriormente por `/novo-post` ou `/lote-posts` via `--briefing <caminho>`.

## Sintaxe

```
/planejar-pauta-semanal [N]
```

- **`[N]`** — opcional, default **5** posts.

## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ semana ativa | data | — | YYYY-Www |
| 2 | pesquisador (sensing leve) | semana, N | 1 | `pesquisa-tendencias.md` enriquecido (emoção + crença de mercado) |
| 3 | `estrategista-mercado` (`jogadas-da-semana`) | sensing ← 2, ângulos-queimados, livro-razão | 2 | N jogadas (ângulo+verdade+pilar+formato/canal) equilibradas |
| 3.⏸ | ⏸ usuário (só modo manual) | jogadas ← 3 | 3 | jogadas confirmadas/ajustadas |
| 4 | ⚙ briefings inline (×N) | jogadas ← 3.⏸ | 3.⏸ | N briefings com campo `verdade:` |
| 5 | `estrategista-mercado` (`coerencia-verdade`) | ângulos ← 4 | 4 | serve/off-brand/contradiz por briefing |
| 6 | ⚙ manifest + flags | briefings + coerência ← 4+5 | 5 | campanha (`verdade` na tabela) |
| 7 | ⚙ relatório | — | 6 | relatório inline |

## Quando dispara

- Cron toda 2ª 9h via Vercel Cron (`orquestracao/rotas.yaml` rota id `pauta-semanal-cron`).
- Manual via `/planejar-pauta-semanal`.
- Manual via botão do dashboard.

## Agentes

| Agente | Quando |
|---|---|
| `pesquisador-mercado` | Sensing leve da semana (emoção do público + crença de mercado) — 1 chamada |
| `estrategista-mercado` | Propor as jogadas da semana (`jogadas-da-semana`) e checar coerência das verdades (`coerencia-verdade`) |

Briefings são escritos inline pela skill no Passo 4.

---

## Pipeline

### 1. Determinar a semana ativa

Calcular `<YYYY-Www>` ISO 8601 (ex: `2026-W21`). Slug da campanha: `<YYYY-Www>-pauta-semanal`.

Criar pasta:

```bash
mkdir -p campanhas/<YYYY-Www>-pauta-semanal/output/posts
```

Se já existir, **abortar com erro** `PAUTA_JA_EXISTE — campanhas/<slug>` (cron não deve rodar 2x na mesma semana; rodar de novo é decisão humana).

### 2. Sensing leve da semana

Acionar `pesquisador-mercado`:

```
Tarefa: scouting de mercado — sensing leve da semana.
Profundidade: leve.

Inputs:
- Semana ativa: <YYYY-Www> (de <início> a <fim>).
- N: <N>

Saída: gravar em campanhas/<YYYY-Www>-pauta-semanal/pesquisa-tendencias.md, com as seções ## Emoção do público (oscilação da semana) e ## Crença de mercado em movimento.
```

### 3. Jogadas da semana (`estrategista-mercado`)

Acionar `estrategista-mercado`:

```
Tarefa: jogadas-da-semana

Inputs:
- Sensing da semana: campanhas/<YYYY-Www>-pauta-semanal/pesquisa-tendencias.md
- N: <N>
- Janela: <YYYY-Www>
```

O agente devolve N jogadas (ângulo + verdade + pilar + formato/canal + sustentação) equilibradas pelo livro-razão.

### 3.⏸ Ajuste humano (só modo manual)

**Apenas no modo manual** (pulado no modo cron): apresentar as jogadas e pausar:

```
Jogadas da semana (equilibradas por verdade):
<lista do agente>

Responda:
- "ok" → segue para gerar os N briefings
- ajuste em texto livre (trocar verdade, ângulo, pilar de qualquer jogada)
```

Aguardar resposta. Se houver ajuste, reacionar o estrategista (ou ajustar inline) e reapresentar até "ok".

### 4. Gerar briefings inline (×N)

Para cada jogada do Passo 3.⏸, escreva o briefing **inline**, lendo:
- `brand/brand-book.md` — essência, propósito, mensagens centrais e `## Verdades`.
- `brand/pilares-conteudo.md` — eixos temáticos válidos.
- `memory/ramon/contexto.md` — fase atual, cronograma, vertentes.
- `memory/performance/angulos-queimados.md` — ângulos a evitar.
- `campanhas/<YYYY-Www>-pauta-semanal/pesquisa-tendencias.md` — sensing da semana (Passo 2).
- Lista de estilos disponíveis: `templates/social-media/<formato>/estilos/*/estilo.md` — `## Quando usar` / `## Quando NÃO usar` para recomendar o estilo.

Para cada post, decida inline:
- **Ângulo central** — ponto de vista específico que diferencia.
- **Pilar** — de `brand/pilares-conteudo.md`; apenas 1.
- **Objetivo** — 1 frase específica.
- **Recorte de público** — 1-2 frases.
- **Slug do post** — kebab-case (2-5 palavras).
- **Verdade** — slug do `## Verdades` (brand-book) que a jogada acende (vindo do Passo 3). Campo obrigatório: `verdade: <slug>`.
- **Estilo recomendado** — slug existente; justificativa em 1 frase.
- **Data prevista de publicação** — dia específico da semana.
- **Sinalizações para o pipeline** — pesquisa necessária? tom? restrições/tabus?

Grave cada briefing em `campanhas/<YYYY-Www>-pauta-semanal/output/posts/<N>-<slug-do-briefing>.md` usando `templates/briefing.md` como esqueleto.

### 5. Check de coerência de verdade

Acionar `estrategista-mercado`:

```
Tarefa: coerencia-verdade

Inputs:
- Briefings planejados: <lista de slugs + ângulo central + verdade de cada um>
```

O agente devolve, por briefing: `serve <verdade>` | `off-brand` | `contradiz <verdade>`. Regra: `contradiz`/`off-brand` → sinalizar ao usuário (não bloquear). `off-brand` em >metade → aviso de pauta sem verdade.

Registrar a classificação de cada briefing no `briefing-mestre.md` (coluna `coerência`).

### 6. Gravar manifest da campanha

`campanhas/<YYYY-Www>-pauta-semanal/briefing-mestre.md`:

```markdown
---
slug: <YYYY-Www>-pauta-semanal
criada_em: <YYYY-MM-DD>
tipo: L2-pauta-semanal
N: <N>
---

# Pauta semanal — <YYYY-Www>

## Tendências da semana

(resumo da pesquisa em 2-3 linhas)

## Posts planejados

| # | Slug | Pilar | Verdade | Coerência | Estilo | Data prevista | Arquivo |
|---|---|---|---|---|---|---|---|
| 1 | <slug> | <pilar> | <slug-verdade> | <serve \| off-brand \| contradiz> | <estilo> | <data> | output/posts/1-<slug>.md |
...
```

`campanhas/<YYYY-Www>-pauta-semanal/status.yaml`:

```yaml
campanha:
  slug: <YYYY-Www>-pauta-semanal
  inicio: <YYYY-MM-DD>
  fim_previsto: <YYYY-MM-DD - sexta>
  estado: aguardando-aprovacao
tarefas:
  - id: <slug-do-briefing-1>
    skill: /novo-post   # quem executa quando humano disparar
    estado: pendente
    output: output/posts/1-<slug>.md
    data_prevista: <YYYY-MM-DD do briefing>
    atualizado_em: <agora>
  - ...
aprovacoes_pendentes:
  - tarefa_id: pauta-completa
    aguardando_desde: <agora>
    canal: dashboard
```

`campanhas/<YYYY-Www>-pauta-semanal/log.md`:

```markdown
# Log

- <YYYY-MM-DDTHH:mm> — Pauta gerada por /planejar-pauta-semanal (modo: cron|manual).
- <YYYY-MM-DDTHH:mm> — N briefings em output/posts/. Aguardando aprovação do usuário.
```

### 7. Notificar (no MVP, apenas relatório inline)

Saída final inline:

```
Pauta semanal <YYYY-Www> pronta:

- <N> briefings em campanhas/<YYYY-Www>-pauta-semanal/output/posts/
- Pilares cobertos: <lista>
- Verdades acionadas: <verdade: N posts | distribuição>
- Coerência: <N servem | N neutros | N contradizem — detalhes no briefing-mestre>
- Estilos sugeridos: <lista>

<avisos de contradição ou pauta neutra em excesso, se houver>

Próximo passo: revise no dashboard ou rode /lote-posts apontando para a pauta,
ou /novo-post <formato> --briefing <caminho-do-briefing>.
```

---

## Modo cron (sem usuário humano)

- Tudo igual, mas: ao terminar, registra "aguardando-aprovacao" e **não tenta executar** os posts. Humano abre dashboard e dispara `/lote-posts` quando aprovar.
- Falha de cron grava entrada em `log.md` da campanha com `estado: falhou`.

## Critério de conclusão

- Pasta `campanhas/<YYYY-Www>-pauta-semanal/` existe com briefing-mestre, status, log e N briefings em `output/posts/`.
- Cada briefing carrega o campo `verdade: <slug>` (slug do `## Verdades` da jogada).
- Check de coerência rodou (`estrategista-mercado`) e o resultado está na tabela do `briefing-mestre.md`.
- `status.yaml` declara `aprovacoes_pendentes` para o dashboard mostrar.
- Nenhum post foi executado.
