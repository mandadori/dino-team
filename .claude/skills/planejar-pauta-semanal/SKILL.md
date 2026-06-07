---
name: planejar-pauta-semanal
description: Skill L2 (composta). Produz N briefings estratégicos para a semana corrente sem executar os posts — a execução fica por conta de /lote-posts ou /novo-post posteriores. Output em `campanhas/<YYYY-Www>-pauta-semanal/`. Acionada por cron (toda 2ª 9h) ou manualmente. Briefings escritos inline pela skill.
---

# /planejar-pauta-semanal — Dino Team

## Objetivo

Toda semana, planejar **N briefings** que cubram os pilares ativos, evitem ângulos queimados e levem em conta o estado atual de Ramon — **distribuindo peças que servem os arcos de narrativa ativos** em `memory/narrativas/ativas.md`. **Não executa posts** — gera só a pauta para `/lote-posts` ou `/novo-post` rodarem depois (manual ou disparados pelo dashboard).

Esta skill é **downstream do ciclo de direção**: a direção estratégica é definida por `/ciclo-de-direcao` (qual narrativa construir, crença-alvo do trimestre). A pauta semanal é a **tradução** dessa direção em peças da janela. Rode `/ciclo-de-direcao` antes de planejar a pauta quando os arcos estiverem desatualizados ou ao início de novo horizonte.

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
| 2 | ⚙ ler narrativas ativas | `memory/narrativas/ativas.md` | 1 | arcos ativos + crenças-alvo |
| 3 | pesquisador (Fase A) | N, semana, ângulos-queimados, arcos ativos ← 2 | 2 | pesquisa-tendencias.md |
| 4 | ⚙ briefings inline (×N) | tendências ← 3, arcos ← 2, contexto | 3 | N briefings gravados (com campo `narrativa:`) |
| 5 | `estrategista-narrativa` (tarefa: `responder-coerencia`) | lista de ângulos ← 4, arcos ← 2 | 4 | classificação serve/neutro/contradiz por briefing |
| 6 | ⚙ gravar manifest + aplicar flags de coerência | briefings + coerência ← 4+5 | 5 | campanha |
| 7 | ⚙ relatório | — | 6 | relatório inline |

## Quando dispara

- Cron toda 2ª 9h via Vercel Cron (`orquestracao/rotas.yaml` rota id `pauta-semanal-cron`).
- Manual via `/planejar-pauta-semanal`.
- Manual via botão do dashboard.

## Agentes

| Agente | Quando |
|---|---|
| `pesquisador-mercado` | Levantar tendências da semana corrente + sugerir distribuição de pilares (1 chamada profunda) |
| `estrategista-narrativa` | Check de coerência de narrativa ao fim da geração de briefings |

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

### 2. Ler narrativas ativas

Ler `memory/narrativas/ativas.md` e extrair:
- Lista de arcos com estado `ativa` (slug + crença-alvo + pilares).
- Arcos `saturando` (sinalizar ao pesquisador para não reforçar a mesma mensagem).

Se o arquivo estiver vazio ou não tiver nenhum arco `ativa`, emitir aviso:

```
⚠ Nenhum arco ativo em memory/narrativas/ativas.md.
  Recomendado: rode /ciclo-de-direcao antes de planejar a pauta.
  Continuando sem direção narrativa — briefings não terão campo narrativa: preenchido.
```

Prosseguir mesmo assim (degraded mode), mas registrar o aviso no `log.md` da campanha.

### 3. Pesquisar tendências da semana

Acionar `pesquisador-mercado`:

```
Tarefa: levantar tendências quentes desta semana relevantes para os pilares Dino Team e sugerir distribuição de N pilares ao longo da semana.
Profundidade: profunda.

Inputs:
- Semana ativa: <YYYY-Www> (de <data-início> a <data-fim>).
- N: <N>
- Ângulos queimados: lê memory/performance/angulos-queimados.md (não repetir nas próximas 4 semanas)
- Arcos de narrativa ativos (do Passo 2): <lista de arcos — priorizar tendências que avançam a crença-alvo dos arcos>

Saída: gravar em campanhas/<YYYY-Www>-pauta-semanal/pesquisa-tendencias.md.

Conteúdo esperado: 2-3 tendências por pilar com fonte, ângulos sugeridos por dia da semana, lista final "N pilares para os N posts da semana" — indicando para cada um qual arco ativo serve (ou "neutro" se nenhum).
```

### 4. Gerar briefings inline (×N)

Para cada pilar/tema da pesquisa do Passo 3, escreva o briefing **inline**, lendo:
- `brand/brand-book.md` — essência, propósito, mensagens centrais.
- `brand/pilares-conteudo.md` — eixos temáticos válidos.
- `memory/ramon/contexto.md` — fase atual, cronograma, vertentes.
- `memory/performance/angulos-queimados.md` — ângulos a evitar.
- `memory/narrativas/ativas.md` — arcos ativos e crenças-alvo (do Passo 2).
- `campanhas/<YYYY-Www>-pauta-semanal/pesquisa-tendencias.md` — tendências levantadas no Passo 3.
- Lista de estilos disponíveis: `templates/social-media/<formato>/estilos/*/estilo.md` — `## Quando usar` / `## Quando NÃO usar` para recomendar o estilo.

Para cada post, decida inline:
- **Ângulo central** — ponto de vista específico que diferencia.
- **Pilar** — de `brand/pilares-conteudo.md`; apenas 1.
- **Objetivo** — 1 frase específica.
- **Recorte de público** — 1-2 frases.
- **Slug do post** — kebab-case (2-5 palavras).
- **Narrativa** — slug do arco ativo que este post avança; `neutro` se nenhum arco for servido. (Campo obrigatório: `narrativa: <slug | neutro>`)
- **Estilo recomendado** — slug existente; justificativa em 1 frase.
- **Data prevista de publicação** — dia específico da semana.
- **Sinalizações para o pipeline** — pesquisa necessária? tom? restrições/tabus?

Grave cada briefing em `campanhas/<YYYY-Www>-pauta-semanal/output/posts/<N>-<slug-do-briefing>.md` usando `templates/briefing.md` como esqueleto.

### 5. Check de coerência de narrativa

Acionar `estrategista-narrativa`:

```
Tarefa: responder-coerencia

Inputs:
- Arcos ativos: <lista do Passo 2 — slug + crença-alvo>
- Briefings planejados: <lista de slugs + ângulo central de cada um>
```

O agente devolve, por briefing: `serve <arco>` | `neutro` | `contradiz <arco>`.

**Regras de ação:**
- Briefing marcado `contradiz <arco>` → sinalizar ao usuário com sugestão de reâncorar no arco ativo. Não bloquear automaticamente — o usuário decide se mantém ou ajusta.
- `neutro` em >metade da pauta → emitir aviso: `⚠ Mais da metade dos briefings está neutra — a pauta desta semana não está construindo narrativa. Considere revisar ângulos ou rodar /ciclo-de-direcao.`

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

| # | Slug | Pilar | Narrativa | Coerência | Estilo | Data prevista | Arquivo |
|---|---|---|---|---|---|---|---|
| 1 | <slug> | <pilar> | <slug-arco \| neutro> | <serve \| neutro \| contradiz> | <estilo> | <data> | output/posts/1-<slug>.md |
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
- Narrativas servidas: <arco: N posts | neutro: N posts>
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
- `memory/narrativas/ativas.md` foi lido; cada briefing carrega o campo `narrativa: <slug | neutro>`.
- Check de coerência rodou (`estrategista-narrativa`) e o resultado está na tabela do `briefing-mestre.md`.
- `status.yaml` declara `aprovacoes_pendentes` para o dashboard mostrar.
- Nenhum post foi executado.
