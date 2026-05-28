---
name: lote-posts
description: Gera N posts em um mesmo formato com variação de estilos e temas. Sintaxe livre — formato é obrigatório; quantidade, estilos (com distribuição opcional) e tema-base são opcionais. Multi-estilo nativo — aceita "treino-dino:2 layout-dividido:2" ou pergunta a distribuição. Útil para encher pauta semanal/mensal. Agendável via /schedule.
---

# /lote-posts — Dino Team

## Objetivo

Gerar N posts em um mesmo formato, com variação de estilos e temas dentro do lote. Reusa o pipeline do `/novo-post` por post, com pausa única de revisão de previews ao final do design (não pausa durante briefing, copy ou design).

## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ parse input | input | — | N, estilos, tema |
| 2 | ⚙ distribuição de estilos | — | 1 | estilos por post |
| 3 | pesquisador (Fase A/B, condic.) | tema | 2 | distribuição+candidatos |
| 4 | ⏸ usuário | plano ← 3 | 3 | confirmação |
| 5 | sub-fluxo novo-post P4–8 (×posts) | plano ← 4 | 4 | copy por post |
| 6 | ⏸ usuário | copies ← 5 | 5 | ok/ajuste em lote |
| 7 | designer (×posts) | copy ← 5 | 6 | assets por post |
| 8 | curador-export + revisores (×posts) | pasta ← 7 | 7 | validação por post |
| 9 | ⚙ relatório do lote | — | 8 | relatório |
| 10 | ⚙ política publish (×posts) | pasta ← 8 | 8 | publicado/pendente |

## Sintaxe

```
/lote-posts <formato> [N] [estilo[:K] ...] [tema-base...]
```

- **`<formato>`** — obrigatório. Subpasta válida de `templates/social-media/`.
- **`[N]`** — opcional. Quantidade total de posts. Default: **5**, ou somatório das distribuições por estilo.
- **`[estilo[:K] ...]`** — opcional. Zero, um ou mais slugs em `templates/social-media/<formato>/estilos/`. Use `slug:K` para distribuição explícita; sem `:K` a skill pergunta.
- **`[tema-base...]`** — opcional, texto livre. Se omitido, scouting distribui temas pelos pilares.

Ordem livre. Tokens são interpretados: número solto → N total; slug (com ou sem `:K`) → estilo; resto → tema-base.

```
/lote-posts carrossel 4 treino-dino:2 layout-dividido:2 panturrilha
/lote-posts carrossel 6 layout-dividido mindset
/lote-posts carrossel treino-dino layout-dividido pernas
/lote-posts carrossel 5
```

## Agentes

| Agente | Responsabilidade | Quando aciona |
|---|---|---|
| `pesquisador-mercado` | Sugerir distribuição de estilos (se nenhum foi informado) e gerar lista de N subtemas mapeados aos estilos. | Passos 3 e 4 |
| `briefing-writer` | Briefing estratégico por post. | Passo 5 |
| Pipeline `/novo-post` (pesquisa → copy) | Executa pesquisa e copy de cada post. | Passo 5 |
| Pipeline `/novo-post` (design) | Executa o design de cada post após aprovação da copy. | Passo 7 |
| `curador-export` | Valida e exporta PNGs por post. | Passo 8 |
| `revisor-conteudo` + `revisor-brand` | Curadoria editorial por post. | Passo 8 |

Cada agente lê o recorte de `brand/` que sua função exige antes de executar. Erro `BRAND_BOOK_INCOMPLETO` vindo de qualquer agente para o lote inteiro.

---

## Pipeline

### 1. Parsear input

Liste `templates/social-media/` e `templates/social-media/<formato>/estilos/`. Tokenize a entrada:

- Token numérico solto → `N_total`.
- Token bate com slug de estilo (com ou sem `:K`) → adicione ao mapa `distribuicao`.
- Restante → `tema_base` (texto livre).

Se formato ausente/inválido, pergunte oferecendo a lista descoberta.

### 2. Resolver distribuição de estilos

Decida com base no parse:

- **Nenhum estilo informado** → vá ao Passo 3.
- **1 estilo, sem `:K`** → todos os `N_total` posts usam este estilo. Se `N_total` não veio, use **5**. Vá ao Passo 4.
- **Múltiplos estilos, todos com `:K`** → `N_total = soma`. Distribuição fechada. Vá ao Passo 4.
- **Múltiplos estilos sem `:K` (ou mistos)** → pergunte ao usuário:
  ```
  Estilos: <slug1>, <slug2>, ...
  Total: <N_total ou "?">
  Como distribuir? Ex: "<slug1>:2 <slug2>:2"
  ```
  Aguarde resposta válida.

### 3. Scouting de distribuição (sem estilo informado)

[Agente: `pesquisador-mercado`] → input:

```
Tarefa: sugerir uma distribuição de N posts entre os estilos disponíveis.
Profundidade: rápida / decisória.

Inputs:
- Formato: <formato>
- Estilos disponíveis: <lista de slugs + 1 linha de conceito de cada um>
- N total: <N ou "5 por padrão">
- Tema-base: <texto ou "nenhum">

Regras:
- Sugira distribuição multi-estilo quando fizer sentido (variedade dentro do lote).
- Sugira estilo único só com justificativa clara.

Saída inline: "slug:K | slug:K | ..." + 1 linha de justificativa.
```

Apresente a sugestão e aguarde o usuário confirmar ou ajustar.

### 4. Distribuir subtemas e confirmar plano

[Agente: `pesquisador-mercado`] → input:

```
Tarefa: gerar N subtemas distintos, cada um mapeado a um estilo da distribuição.
Profundidade: rápida / decisória.

Inputs:
- Formato: <formato>
- Distribuição: <slug:K | slug:K | ...>
- Tema-base: <texto livre ou "nenhum — distribuir entre pilares">

Regras:
- Cada subtema deve combinar com o estilo a que é atribuído.
- Tema-base livre → distribua entre pilares de pilares-conteudo.md.
- Tema-base dado → derive N ângulos distintos.

Saída: lista numerada de N triplas.
1. <subtema> — estilo <slug> — pilar <pilar>
2. ...
```

Apresente o plano ao usuário:

```
Lote: <N> posts em <formato>

Distribuição:
- <slug1>: <K1> posts
- <slug2>: <K2> posts

Subtemas:
1. <subtema 1> — estilo <slug> — pilar <pilar>
2. <subtema 2> — estilo <slug> — pilar <pilar>
...

Confirma? (sim/ok para começar, ou diga o que ajustar)
```

**Aguarde confirmação explícita** ou aplique os ajustes pedidos e reapresente. Em modo agendado, pule a confirmação.

### 5. Executar até a copy de cada post

Para cada par `(subtema, estilo)` da lista, execute os passos do `/novo-post` **até a copy**, sem pausa:

- **Briefing estratégico** (`briefing-writer`) — extraia `slug-do-post`.
- **Criar pasta do post** — `export/conteudos/<formato>/<data>-<slug>/`.
- **Resolver inputs obrigatórios do estilo** (apenas se `modo_estilo = "definido"`):
  - Modo interativo: pergunte ao usuário (ex.: lista de exercícios).
  - Modo agendado: pule este post (`SKIPPED — input técnico obrigatório`) e siga.
- **Pesquisa profunda** (`pesquisador-mercado`).
- **Copy** (`copywriter`).

**Política de falha:** se um post falhar em qualquer etapa, registre o erro e continue os demais. `BRAND_BOOK_INCOMPLETO` para o lote inteiro.

### 6. Pausa de revisão de copies em lote

Após a copy de todos os posts, apresente as copies em lote:

```
Copies do lote geradas. Revise antes do design:

Post 1 — <slug-do-post> (estilo: <slug>)
--- início ---
<conteúdo integral de copy.md do post 1>
--- fim ---

Post 2 — <slug-do-post> (estilo: <slug>)
--- início ---
<conteúdo integral de copy.md do post 2>
--- fim ---

...

Responda:
- "ok" → aprova todos e inicia design de todos
- "ajustar post N: <descrição>" → re-aciona copywriter só daquele post; reapresenta apenas o post ajustado para confirmação; pergunta se há mais ajustes ou se pode iniciar design
```

A pausa só avança ao Passo 7 quando o usuário confirmar que não há mais ajustes.

**Modo agendado:** pule a pausa. Siga direto ao Passo 7.

### 7. Design + revisão de previews por post

Para cada post aprovado no Passo 6, execute o **Design (assets + preview consolidado)** do `/novo-post` (`designer`).

Após o design de todos os posts, apresente os previews **um por um**, na ordem da lista:

```
Post <n> de <N> — <slug-do-post> (estilo: <slug>)
Tema: <subtema>
Preview: export/conteudos/<formato>/<data>-<slug>/design/preview.html

Opções:
- "ok" / "confirmar" → segue para o próximo
- "ajustar: <descrição>" → reaciona o designer; reapresenta este post
- Anexe preview.html editado → sobrescreve e segue
```

Aguarde decisão antes de passar ao próximo. Quando todos forem confirmados, siga ao Passo 8.

**Modo agendado:** pule o loop. Siga direto ao Passo 8 com os previews gerados.

### 8. Validação, export e curadoria editorial

Para cada post confirmado:

1. Snapshot da pesquisa em `<pasta>/pesquisa-base.md`.
2. [Agente: `curador-export`] → valida assets e exporta PNGs.
3. Curadoria editorial em sequência:
   a. [Agente: `revisor-conteudo`] → parecer de coerência + compliance. APROVADO ou APROVADO COM AJUSTES → segue para 3b. REPROVADO → registra e marca o post como pulado (refazer é responsabilidade do `/novo-post`).
   b. [Agente: `revisor-brand`] → parecer de identidade. APROVADO → grava `briefing.md`. REPROVADO → registra e marca como pulado.

Erros técnicos (`EXPORT_FALHOU`, `VALIDACAO_TECNICA_FALHOU`) → registre e siga ao próximo.

### 9. Reportar entrega do lote

```
Lote concluído: <N> posts solicitados

Formato: <formato>
Distribuição: <slug1>: <K1> | <slug2>: <K2>

Sucessos (<M> de <N>):
1. export/conteudos/<formato>/<data>-<slug-1>/ — estilo <slug> — APROVADO
2. export/conteudos/<formato>/<data>-<slug-2>/ — estilo <slug> — APROVADO
...

Pulados/falhos (<N-M>):
- <slug-x>: <motivo>
```

### 10. Publicação por post (opcional, gated por política)

Para cada post aprovado, aplicar o mesmo gate de política do Passo 14 do `/novo-post`: carregar `dados/politicas/publicacao.yaml`, avaliar as regras e só chamar `scripts/integrations/publish_instagram.js` quando a regra que casa diz `modo: automatico`. Em modo cron/agendado, **nunca publicar automaticamente** — apenas listar quais posts ficaram autorizados pela política e quais exigem aprovação humana.

---

## Modo agendado (`/schedule`)

- Pula confirmação do plano (Passo 4).
- Pula pausa de revisão de copies em lote (Passo 6).
- Pula loop de revisão de previews (Passo 7).
- Posts com inputs técnicos obrigatórios não declarados são pulados.
- Reporta o resumo no canal de notificação configurado.

## Critério de conclusão

- Pelo menos 1 post entregue com pasta completa (`pesquisa-base.md`, `copy.md`, `design/`, `export/<PNGs>`, `briefing.md`).
- Quantidade de PNGs em cada `export/` = quantidade de assets em `design/`.
- Relatório consolidado do Passo 8 entregue ao usuário, com sucessos e falhas discriminados.

## Princípios

- **Variedade dentro de coerência.** Subtemas e estilos distintos, mesmo formato, mesma marca.
- **Mesmo formato no lote.** Múltiplos formatos = múltiplos lotes.
- **Falhar um, seguir os outros.**
