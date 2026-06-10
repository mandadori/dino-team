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
| 3 | pesquisador (distribuição, condic.) | tema | 2 | distribuição sugerida |
| 4 | ⚙ subtemas + confirmar plano + ⏸ | plano ← 3 | 3 | plano confirmado |
| 5 | ⚙ briefing + copy inline (×posts) | plano ← 4 | 4 | copy por post |
| 6 | ⏸ revisão de copies em lote | copies ← 5 | 5 | ok/ajuste |
| 7 | ⚙ design inline + revisão (×posts, ⏸) | copy ← 5 | 6 | assets por post |
| 8 | ⚙ export + gate + write-back (×posts) | slides ← 7 | 7 | PNGs + validação + registro |
| 9 | ⚙ relatório do lote | — | 8 | relatório |
| 10 | ⚙ publicação (×posts, gated) | pasta ← 8 | 8 | publicado/pendente |

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

**Cada post é um contexto independente.** A skill produz briefing, copy e design inline por post — sem subagentes de produção. A variação de tema/estilo dentro do lote é garantida pelo planejamento dos Passos 3-4, não por anti-repetição automática entre posts.

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

### 4. Distribuir subtemas e confirmar plano (⏸)

Acione `pesquisador-mercado`:

```
Tarefa: gerar N subtemas distintos, cada um mapeado a um estilo da distribuição.
Profundidade: rápida / decisória.

Inputs:
- Formato: <formato>
- Distribuição: <slug:K | slug:K | ...>
- Tema-base: <texto livre ou "nenhum — distribuir entre pilares">
- Ângulos queimados: memory/performance/registro-angulos.md (ângulo com data+descanso ainda futuro = não repetir)

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

**Aguarde confirmação explícita** ou aplique os ajustes pedidos e reapresente.

### 5. Briefing + copy inline por post

Para cada par `(subtema, estilo)` da lista confirmada, execute inline e **sem pausa entre posts**:

#### 5a. Carregar contexto do lote

Leia (uma vez por lote, reutilize nos demais posts):
- `memory/ramon/contexto.md`
- `memory/performance/registro-angulos.md` — ângulos em descanso + saturação de verdade
- `memory/mercado/tendencias/<YYYY-MM>.md`

#### 5b. Briefing inline

Lê: `brand-book (§Verdades)` · `pilares-conteudo` · `ramon/contexto` · `performance/registro-angulos` · `mercado/tendencias/<mês>` · `estilo.md (§Conceito + #### editorial)`.

Fixe: ângulo central, pilar, objetivo, recorte de público, slug do post (kebab-case), **verdade servida** (slug do `## Verdades` do brand-book que este ângulo acende; `neutro` se nenhuma). Guarde como `verdade_servida` do post (usado no Passo 8).

Quando briefing pré-pronto (modo `--pauta`): extrair `verdade:` do briefing — se ausente, `neutro`.

Criar pasta: `export/conteudos/<formato>/<data>-<slug>/{design,export}`.

#### 5c. Resolver inputs obrigatórios do estilo (condicional)

Se `estilo.md` declarar `## Inputs obrigatórios externos`:
- **Modo interativo:** pergunte ao usuário (ex.: lista de exercícios).

#### 5d. Pesquisa profunda

Acione `/pesquisar-tema` por post, **sempre**, com o perfil do pilar do post (ver `## Perfis de fonte por pilar` na skill) — mesma pesquisa de /novo-post §Pesquisa.

```
/pesquisar-tema <tema do post> --pilar <pilar do post> --recorte <recorte do post>
```

A profundidade vem do perfil (rasa p/ Transformação; média p/ Mentalidade/Prova viva; profunda p/ Método). Posts que compartilham pilar/tema reaproveitam o cache de `memory/pesquisa/` — uma pesquisa serve vários.

#### 5e. Copy inline

Lê: `estilo.md §editorial` · `tom-de-voz` · `publico-alvo` · pesquisa gravada.

Escreva a copy seguindo exatamente os campos `#### editorial` por bloco. Grave em `export/conteudos/<formato>/<data>-<slug>/copy.md`.

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

### 7. Design inline por post + revisão de slides

Para cada post aprovado no Passo 6, execute o design inline:

Lê: `estilo.md §visual` · `slide.html` do estilo · `referencias-visuais` · `social-media` · `copy.md` do post.

Para cada bloco declarado em `## Estrutura`, gere um `slide-N.html` em `design/`, aplicando a copy e respeitando as drop zones e `[alternância]`. Não gerar `preview.html`.

Após o design de todos os posts, apresente **um por um**, na ordem da lista:

```
Post <n> de <N> — <slug-do-post> (estilo: <slug>)
Tema: <subtema>
Slides: export/conteudos/<formato>/<data>-<slug>/design/

Para revisar: abra via Dino Editor ou exporte (node scripts/export-png.js <pasta>)

Opções:
- "ok" / "confirmar" → segue para o próximo
- "ajustar: <descrição>" → edita os slides inline; reapresenta este post
```

Aguarde decisão antes de passar ao próximo. Quando todos forem confirmados, siga ao Passo 8.

### 8. Export, gate de marca e write-back (×posts)

Para cada post confirmado:

1. Snapshot da pesquisa em `<pasta>/pesquisa-base.md`.
2. Executar `node scripts/export-png.js export/conteudos/<formato>/<data>-<slug>/` — renderiza e valida dimensões/contagem automaticamente. Em caso de erro, registre e marque o post como pulado.
3. **Gate de marca:** aplique o gate como em /novo-post §Gate de marca (mesmo prompt, momento "criação de post"), por post. Especificidades do lote:
   - **APROVADO** → grava `briefing.md` via `templates/briefing.md`. Post aprovado.
   - **REPROVADO** → registra e marca o post como pulado (refazer é responsabilidade do `/novo-post`).

   Erros técnicos (`EXPORT_FALHOU`, `VALIDACAO_TECNICA_FALHOU`) → registre e siga ao próximo.

4. **Write-back no registro de ângulos:** por post aprovado, escreva a linha como em /novo-post §Write-back (script `append_registro_angulos.js`). Posts pulados (erro de export) ou reprovados no gate **não** registram linha. Se o script falhar (`REGISTRO_ANGULOS_AUSENTE`), registre o erro e siga — o post já está aprovado; o write-back não bloqueia entrega.

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

Para cada post aprovado, aplicar a política como em /novo-post §Publicação: carregar `orquestracao/politicas/publicacao.yaml`, avaliar as regras e só chamar `scripts/integrations/publish_instagram.js` quando a regra que casa diz `modo: automatico`. Em modo cron/agendado, **nunca publicar automaticamente** — apenas listar quais posts ficaram autorizados pela política e quais exigem aprovação humana.

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
