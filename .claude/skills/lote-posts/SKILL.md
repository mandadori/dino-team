---
name: lote-posts
description: Gera N posts em um mesmo formato com variação de estilos e temas. Sintaxe livre — formato é obrigatório; quantidade, estilos (com distribuição opcional) e tema-base são opcionais. Multi-estilo nativo — aceita "treino-dino:2 layout-dividido:2" ou pergunta a distribuição. Útil para encher pauta semanal/mensal. Agendável via /schedule. Briefing/copy/design executados inline pela skill por post.
---

# /lote-posts — Dino Team

## Objetivo

Gerar N posts em um mesmo formato, com variação de estilos e temas dentro do lote. A produção (briefing, copy, design) é inline por post — sem subagentes de produção. Pausa única de revisão de copies ao final, depois pausa de revisão de slides por post.

## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ parse input | input | — | N, estilos, tema |
| 2 | ⚙ distribuição de estilos | — | 1 | estilos por post |
| 3 | pesquisador (Fase A/B, condic.) | tema, contexto | 2 | distribuição+candidatos |
| 4 | ⏸ usuário | plano ← 3 | 3 | confirmação |
| 5 | ⚙ briefing+copy inline (×posts) | plano ← 4 | 4 | copy por post |
| 6 | ⏸ usuário | copies ← 5 | 5 | ok/ajuste em lote |
| 7 | ⚙ design inline (×posts) | copy ← 5 | 6 | assets por post |
| 8 | export-png.js + revisor-brand (×posts) | slide-N.html ← 7 | 7 | PNGs + validação por post |
| 9 | ⚙ relatório do lote | — | 8 | relatório |
| 10 | ⚙ política publish (×posts) | pasta ← 8 | 8 | publicado/pendente |

## Sintaxe

```
/lote-posts <formato> [N] [estilo[:K] ...] [tema-base...]
/lote-posts <formato> --pauta <caminho-da-pasta-da-campanha>
```

- **`<formato>`** — obrigatório. Subpasta válida de `templates/social-media/`.
- **`[N]`** — opcional. Quantidade total de posts. Default: **5**, ou somatório das distribuições por estilo.
- **`[estilo[:K] ...]`** — opcional. Zero, um ou mais slugs em `templates/social-media/<formato>/estilos/`. Use `slug:K` para distribuição explícita; sem `:K` a skill pergunta.
- **`[tema-base...]`** — opcional, texto livre. Se omitido, scouting distribui temas pelos pilares.
- **`--pauta <caminho>`** — opcional. Pasta de uma campanha de pauta semanal (ex: `campanhas/2026-W23-pauta-semanal/`). Quando presente, lê os briefings pré-prontos de `output/posts/*.md` e pula os Passos 2, 3 e 4 (distribuição, scouting e confirmação do plano). Cada briefing pré-pronto substitui a decisão inline do Passo 5b para aquele post.

Ordem livre. Tokens são interpretados: número solto → N total; slug (com ou sem `:K`) → estilo; resto → tema-base.

```
/lote-posts carrossel 4 treino-dino:2 layout-dividido:2 panturrilha
/lote-posts carrossel 6 layout-dividido mindset
/lote-posts carrossel treino-dino layout-dividido pernas
/lote-posts carrossel 5
/lote-posts carrossel --pauta campanhas/2026-W23-pauta-semanal/
```

## Princípio de produção inline

**Cada post é um contexto independente.** A skill produz briefing, copy e design inline por post — sem subagentes de produção. A variação de tema/estilo dentro do lote é garantida pelo planejamento do Passo 3-4, não por anti-repetição automática entre posts.

**Contexto de leitura por post (Passo 5):**
- **Briefing:** `brand/brand-book.md` + `brand/pilares-conteudo.md` + `dados/ramon/contexto.md` + `dados/performance/angulos-queimados.md` + `dados/mercado/tendencias/<mês>.md` + `estilo.md` do estilo atribuído.
- **Copy:** `estilo.md` (campos `#### editorial`) + `brand/tom-de-voz.md` + `brand/publico-alvo.md` + pesquisa do post.
- **Design (Passo 7):** `estilo.md` (campos `#### visual`) + `slide.html` do estilo + `brand/referencias-visuais.md` + `brand/social-media.md` + `copy.md` do post.

Erro `BRAND_BOOK_INCOMPLETO` para o lote inteiro.

---

## Pipeline

### 1. Parsear input

Liste `templates/social-media/` e `templates/social-media/<formato>/estilos/`. Tokenize a entrada:

- Token numérico solto → `N_total`.
- Token bate com slug de estilo (com ou sem `:K`) → adicione ao mapa `distribuicao`.
- `--pauta <caminho>` → `pauta_path` (pasta da campanha pré-planejada).
- Restante → `tema_base` (texto livre).

Se formato ausente/inválido, pergunte oferecendo a lista descoberta.

**Quando `--pauta` presente:** leia `<pauta_path>/output/posts/*.md` em ordem. Para cada briefing, extraia Formato, Estilo, Tema, Ângulo central, Pilar, Objetivo, Recorte de público, Slug do post. Construa a lista de pares `(briefing_prepronto, estilo)` substituindo o plano dos Passos 2-4. `N_total = quantidade de briefings lidos`. **Pule os Passos 2, 3 e 4** e vá direto ao Passo 5. No Passo 5b, para cada post com briefing pré-pronto, use os campos já extraídos (não decida inline).

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

Acione `pesquisador-mercado`:

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

### 4. Distribuir subtemas e confirmar plano (pausa)

Acione `pesquisador-mercado`:

```
Tarefa: gerar N subtemas distintos, cada um mapeado a um estilo da distribuição.
Profundidade: rápida / decisória.

Inputs:
- Formato: <formato>
- Distribuição: <slug:K | slug:K | ...>
- Tema-base: <texto livre ou "nenhum — distribuir entre pilares">
- Ângulos queimados: dados/performance/angulos-queimados.md (não repetir)

Regras:
- Cada subtema deve combinar com o estilo a que é atribuído.
- Tema-base livre → distribua entre pilares de brand/pilares-conteudo.md.
- Tema-base dado → derive N ângulos distintos.

Saída: lista numerada de N triplas.
1. <subtema> — estilo <slug> — pilar <pilar>
2. ...
```

Apresente o plano ao usuário (⏸):

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

### 5. Briefing + copy inline por post

Para cada par `(subtema, estilo)` da lista confirmada, execute inline e **sem pausa entre posts**:

#### 5a. Carregar contexto do post

Leia (uma vez por lote, reutilize nos demais posts):
- `dados/ramon/contexto.md`
- `dados/performance/angulos-queimados.md`
- `dados/mercado/tendencias/<YYYY-MM>.md`

#### 5b. Briefing inline

Leia `brand/brand-book.md` + `brand/pilares-conteudo.md` + `estilo.md` do estilo atribuído (campos `## Conceito` e `#### editorial`). Fixe: ângulo central, pilar, objetivo, recorte de público, slug do post (kebab-case).

Criar pasta: `export/conteudos/<formato>/<data>-<slug>/{design,export}`.

#### 5c. Resolver inputs obrigatórios do estilo (condicional)

Se `estilo.md` declarar `## Inputs obrigatórios externos`:
- **Modo interativo:** pergunte ao usuário (ex.: lista de exercícios).
- **Modo agendado:** pule este post (`SKIPPED — input técnico obrigatório`) e siga.

#### 5d. Pesquisa profunda

Acione `pesquisador-mercado` por post (pesquisa profunda individual):

```
Tarefa: levantar matéria-prima profunda para a copy.
Profundidade: deep research.

Inputs:
- Formato/Estilo/Tema: <formato> / <slug> / <subtema>
- Pilar / Recorte / Sinalizações: <do briefing inline deste post>
- Contexto de mercado: dados/mercado/tendencias/<YYYY-MM>.md + dados/mercado/concorrentes/*.md

Saída: gravar em dados/pesquisas-brutas/<data>-tendencias-<slug>.md.
```

#### 5e. Copy inline

Leia `estilo.md` (campos `#### editorial`) + `brand/tom-de-voz.md` + `brand/publico-alvo.md` + pesquisa gravada. Escreva a copy seguindo exatamente os campos `#### editorial` por bloco. Grave em `export/conteudos/<formato>/<data>-<slug>/copy.md`.

**Política de falha:** se um post falhar em qualquer etapa, registre o erro e continue os demais. `BRAND_BOOK_INCOMPLETO` para o lote inteiro.

### 6. Pausa de revisão de copies em lote (⏸)

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
- "ajustar post N: <descrição>" → edita copy.md daquele post inline; reapresenta apenas o post ajustado para confirmação; pergunta se há mais ajustes ou se pode iniciar design
```

A pausa só avança ao Passo 7 quando o usuário confirmar que não há mais ajustes.

**Modo agendado:** pule a pausa. Siga direto ao Passo 7.

### 7. Design inline por post + revisão de slides

Para cada post aprovado no Passo 6, execute o design inline:

Leia `estilo.md` (campos `#### visual`) + `slide.html` do estilo + `brand/referencias-visuais.md` + `brand/social-media.md` + `copy.md` do post. Para cada bloco declarado em `## Estrutura`, gere um `slide-N.html` em `design/`, aplicando a copy e respeitando as drop zones e `[alternância]`. Não gerar `preview.html`.

Após o design de todos os posts, apresente **um por um**, na ordem da lista:

```
Post <n> de <N> — <slug-do-post> (estilo: <slug>)
Tema: <subtema>
Slides: export/conteudos/<formato>/<data>-<slug>/design/

Para revisar: abra via Live Preview ou exporte (node scripts/export-png.js <pasta>)

Opções:
- "ok" / "confirmar" → segue para o próximo
- "ajustar: <descrição>" → edita os slides inline; reapresenta este post
```

Aguarde decisão antes de passar ao próximo. Quando todos forem confirmados, siga ao Passo 8.

**Modo agendado:** pule o loop. Siga direto ao Passo 8 com os slides gerados.

### 8. Validação, export e gate de marca

Para cada post confirmado:

1. Snapshot da pesquisa em `<pasta>/pesquisa-base.md`.
2. Executar `node scripts/export-png.js export/conteudos/<formato>/<data>-<slug>/` — renderiza e valida dimensões/contagem automaticamente. Em caso de erro, registre e marque o post como pulado.
3. Gate de marca: acione `revisor-brand` por post:

```
Tarefa: validar copy + compliance do post pronto (momento: criação de post).

Inputs:
- Pasta do post: export/conteudos/<formato>/<data>-<slug>/
  (pesquisa-base.md, copy.md, design/slide-*.html, export/*.png, treino.md quando aplicável)
- Briefing inline:
  Pilar: <pilar>
  Objetivo: <objetivo>
  Ângulo central: <ângulo>
  Recorte de público: <recorte>
  Slug do post: <slug>

Avaliar: tom de voz, pilar, compliance (saúde, jurídico, suplementação, promessas irreais).
NÃO re-julgar identidade visual.
```

- **APROVADO** → grava `briefing.md` via `templates/briefing.md`. Post aprovado.
- **REPROVADO** → registra e marca o post como pulado (refazer é responsabilidade do `/novo-post`).

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

Para cada post aprovado, aplicar o mesmo gate de política do Passo 16 do `/novo-post`: carregar `dados/politicas/publicacao.yaml`, avaliar as regras e só chamar `scripts/integrations/publish_instagram.js` quando a regra que casa diz `modo: automatico`. Em modo cron/agendado, **nunca publicar automaticamente** — apenas listar quais posts ficaram autorizados pela política e quais exigem aprovação humana.

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
- Relatório consolidado do Passo 9 entregue ao usuário, com sucessos e falhas discriminados.

## Princípios

- **Variedade dentro de coerência.** Subtemas e estilos distintos, mesmo formato, mesma marca.
- **Mesmo formato no lote.** Múltiplos formatos = múltiplos lotes.
- **Falhar um, seguir os outros.**
- **Post-independente.** Cada post tem seu próprio contexto de briefing/copy/design — não carrega estado do post anterior.
