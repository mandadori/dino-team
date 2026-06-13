---
name: novo-artigo
description: Produz um artigo de blog a partir de um tema/ângulo, ancorado numa verdade da marca (`## Verdades`) e no brand. Escreve o draft em `export/conteudos/blog/<slug>/artigo.mdx` e o PROMOVE ao site (`site/content/blog/<slug>.mdx`) via `scripts/content/promover_artigo.js`, gated por `next build` e commitado. Pesquisa via `/pesquisar-tema`; gate `revisor-brand`; write-back no registro-angulos (canal=blog).
---

# /novo-artigo

Cria um artigo de blog completo, do briefing ao artefato MDX draft aprovado pelo gate de marca.

## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ parse input | input bruto | — | tema/ângulo, pilar opcional |
| 2 | ⚙ escolher verdade servida | `brand/brand-book.md` (`## Verdades`) | 1 | `verdade_servida` (slug\|neutro) |
| 3 | ⚙ briefing inline + ⏸ (resolve ângulo/pilar/category/author/slug; escaneia colisão; confirma o plano) | contexto ← 2, tema/pilar/brand, `site/content/blog/` | 2 | plano confirmado (inclui category + author) |
| 4 | `/pesquisar-tema` (condic., ângulo informacional) | tema, pilar, recorte ← 3 | 3 | `memory/pesquisa/<data>-tendencias-<slug>.md` |
| 5 | ⚙ escrever artigo inline (MDX draft) + ⏸ | pesquisa ← 4, brand, `templates/artigo.md` | 4 | `export/conteudos/blog/<slug>/artigo.mdx` |
| 6 | `revisor-brand` (gate, criação de post) | `artigo.mdx` ← 5 | 5 | APROVADO/REPROVADO |
| 7 | ⚙ promover ao site (`scripts/content/promover_artigo.js`) | `artigo.mdx` + plano ← 6 | 6 (APROVADO) | `site/content/blog/<slug>.mdx` |
| 8 | ⚙ gate `next build` | site ← 7 | 7 | build verde / vermelho |
| 9 | ⚙ commit escopado | `.mdx` ← 8 | 8 (verde) | commit do artigo (+ capa default se nova) |
| 10 | ⚙ entregar + write-back | tudo ← 9 | 9 | entrega ao usuário + linha no registro-angulos |

## Sintaxe

```
/novo-artigo <tema> [--pilar <pilar>]
```

- **`<tema>`** — obrigatório. Texto livre descrevendo o tema ou ângulo do artigo.
- **`[--pilar <pilar>]`** — opcional. Slug do pilar de `brand/pilares-conteudo.md`.

## Pipeline

### 1. Parsear input

Extraia do input: tema (texto livre após `/novo-artigo`), pilar (se `--pilar <valor>`). Se tema ausente, pergunte ao usuário antes de seguir.

### 2. Escolher verdade servida

Leia `brand/brand-book.md` (`## Verdades`). Com base no tema/ângulo (Passo 1), identifique a verdade que este artigo acende. Guarde como `verdade_servida = <slug>`. Se nenhuma verdade responder claramente, use `verdade_servida = neutro`.

### 3. Briefing inline

Leia os seguintes arquivos:
- `brand/brand-book.md` (inclui `## Verdades`)
- `brand/pilares-conteudo.md`
- `brand/publico-alvo.md`
- `memory/performance/registro-angulos.md` — ângulos em descanso + saturação de verdade

Com base nessas leituras, fixe:
- **Ângulo central** — ponto de vista específico que diferencia (não o tema bruto).
- **Pilar** — de `brand/pilares-conteudo.md`; apenas 1.
- **Objetivo** — 1 frase: o que o artigo deve fazer no leitor.
- **Recorte de público** — 1-2 frases do segmento específico dentro do público-alvo.
- **Slug** — kebab-case (2-5 palavras capturando o ângulo), `^[a-z0-9][a-z0-9-]*$`.
  - Escaneie colisão CEDO: varra `site/content/blog/*.mdx` pelos slugs já existentes; se colidir, ajuste o slug (sufixe/renomeie) e reconfirme — antes de escrever (o loader do site sombreia slugs duplicados em silêncio).
- **Category (site)** — escolha DIRETA entre as 4 do site: `treino` | `nutricao` | `mentalidade` | `bastidores`. Não derivar do pilar da marca — é um campo próprio do schema do site.
- **Author** — escolha entre `ramon-dino` e `mauri-rosolen` (sempre perguntar; sem default silencioso; NUNCA "Dino Team").
- **Pesquisa necessária?** — ângulo informacional (dados, mitos, técnica) = sim; narrativo/pessoal = não.

Apresente o plano ao usuário (⏸):

```
Plano do artigo:
- Tema: <tema>
- Ângulo central: <ângulo>
- Pilar: <pilar>
- Objetivo: <objetivo>
- Slug: <slug>  (livre de colisão em site/content/blog/)
- Category (site): <treino | nutricao | mentalidade | bastidores>
- Author: <ramon-dino | mauri-rosolen>
- Verdade servida: <verdade_servida>
- Pesquisa: <sim / não (narrativo)>

Confirma? ("ok" para seguir, ou descreva o ajuste)
```

Aguarde confirmação explícita. Se vier ajuste, ajuste o plano inline e reapresente.

### 4. Pesquisa profunda (condicional)

Execute **somente** quando o ângulo for informacional (dados, mitos, técnica). Pule em artigo puramente narrativo.

Invoque `/pesquisar-tema`:

```
/pesquisar-tema <tema> --pilar <pilar> --recorte <recorte de público>
```

A skill grava o resultado em `memory/pesquisa/<data>-tendencias-<slug>.md`. Este arquivo é o que o Passo 5 lê.

### 5. Escrever o artigo inline (MDX + pausa)

Crie a pasta de saída:

```bash
mkdir -p export/conteudos/blog/<slug>
```

Leia os seguintes arquivos:
- `brand/tom-de-voz.md`
- `brand/publico-alvo.md`
- `templates/artigo.md` (esqueleto de seções)
- `memory/pesquisa/<data>-tendencias-<slug>.md` (se pesquisa executada no Passo 4)

Escreva o artigo completo em MDX seguindo a estrutura de `templates/artigo.md`:
- Frontmatter com os campos fixados no briefing (Passo 3) + `verdade_servida`.
- `## Abertura` — hook que espelha a dor; keyword no primeiro parágrafo.
- Corpo em H2/H3 — desenvolvimento do ângulo, ancorado na pesquisa.
- `## Fechamento` — eleva ao tom da marca + CTA sóbrio.
- Tom: `brand/tom-de-voz.md`. Sem motivação vazia; sem vitimismo; sem vender no corpo.

Grave em `export/conteudos/blog/<slug>/artigo.mdx`.

Pause para revisão (⏸):

```
Artigo em export/conteudos/blog/<slug>/artigo.mdx

--- início ---
<conteúdo integral do artigo>
--- fim ---

Confirma? ("ok" para seguir ao gate de marca, ou descreva o ajuste)
```

Aguarde resposta. Se vier ajuste, edite o arquivo inline e reapresente. Máx 1 ciclo de retry automático; 2º fracasso escala ao usuário.

### 6. Gate de marca (`revisor-brand`)

Acione `revisor-brand`:

```
Tarefa: validar copy + compliance do artigo (momento: criação de post).

Inputs:
- Arquivo: export/conteudos/blog/<slug>/artigo.mdx
- Briefing inline:
  Pilar: <pilar>
  Objetivo: <objetivo>
  Ângulo central: <ângulo>
  Recorte de público: <recorte>
  Slug: <slug>

Avaliar: tom de voz, pilar, compliance (saúde, jurídico, suplementação, promessas irreais).

Saída: parecer inline (schema "momento: criação de post"). Status: APROVADO | REPROVADO.
```

Controle de tentativas (`tentativas_gate`, inicia em 0; incrementa a cada re-rodada):
- Se `tentativas_gate ≥ 1` → pausar e escalar ao usuário com o parecer e a ação necessária.
- **APROVADO** → siga para o §Promover ao site.
- **REPROVADO** → aplique a instrução do campo `Ação`; incremente `tentativas_gate`; re-rode este passo.

### 7. Promover ao site

Com o artigo **APROVADO** pelo gate de marca, promova o draft ao site rodando o script determinístico (monta o frontmatter BLOG-01, valida, escaneia colisão, escreve):

```bash
node scripts/content/promover_artigo.js \
  --slug "<slug>" \
  --title "<título do briefing>" \
  --description "<description do briefing>" \
  --author "<ramon-dino|mauri-rosolen>" \
  --category "<treino|nutricao|mentalidade|bastidores>" \
  --date "$(date +%F)" \
  --cover "/blog/covers/_default.webp" \
  --featured false \
  --draft "export/conteudos/blog/<slug>/artigo.mdx"
```

O script **reusa só o corpo** do draft (descarta o frontmatter da marca) e escreve `site/content/blog/<slug>.mdx`. O contrato dos 8 campos vive em `site/lib/blog.ts` (fonte única — não restated aqui). A capa default `/blog/covers/_default.webp` é placeholder (o usuário troca pela arte real depois). Se o script sair com código ≠0 (validação, colisão de slug ou path-traversal), corrija no §Briefing inline e re-rode.

### 8. Gate de build

```bash
cd site && npm run build
```

Exit 0 = verde → artigo pronto. O gate é o **`next build`** (o loader valida o frontmatter em build-time e aborta em campo inválido) — **NUNCA `npm run lint`**, que está pré-quebrado por 2 erros herdados das Fases 03/04 e nunca passaria. Build vermelho ⇒ o artigo NÃO está pronto: corrija e re-rode.

### 9. Commit

Após o gate de marca aprovar **e** o build ficar verde, commite **somente** o artefato do artigo:

```bash
git add site/content/blog/<slug>.mdx
# + site/public/blog/covers/_default.webp — SOMENTE se a capa default ainda não estava versionada
git commit -m "feat(blog): publica <slug>"
```

**NUNCA** faça um `git add` abrangente (o curinga que adiciona a árvore inteira) — o commit é escopado ao `.mdx` do artigo (+ a capa default, se nova). Nada mais entra no commit.

### 10. Entregar + write-back

Entregue ao usuário:

```
Publicado no site: /blog/<slug>
Artefatos: site/content/blog/<slug>.mdx (publicado) · export/conteudos/blog/<slug>/artigo.mdx (draft de origem)

- Pilar: <pilar>
- Ângulo: <ângulo>
- Category: <category>
- Author: <author>
- Verdade servida: <verdade_servida>

Destaques do gate de marca:
- {bullet 1}
- {bullet 2}

Build: verde (next build). Commit: site/content/blog/<slug>.mdx versionado.
```

Write-back no registro de ângulos (somente quando APROVADO):

```bash
node scripts/memory/append_registro_angulos.js \
  --slug "<slug do Passo 3>" \
  --data "$(date +%F)" \
  --canal blog \
  --angulo "<slug-kebab do ângulo central do Passo 3>" \
  --verdade "<verdade_servida do Passo 2>" \
  --pilar "<pilar do Passo 3>"
```

Reporte a linha anexada inline. Se o script falhar (`REGISTRO_ANGULOS_AUSENTE`), avise o usuário e siga — o artigo já está entregue; o write-back não bloqueia a entrega.

## Princípio central

**Copy é função única, canal via parâmetro.** A skill produz o artigo inline, adaptando o formato para blog (MDX, SEO, H2/H3), sem agente de copy separado. Pesquisa profunda é delegada a `/pesquisar-tema` quando o ângulo for informacional. `revisor-brand` valida copy + compliance antes da entrega. Write-back via `scripts/memory/append_registro_angulos.js`.

**A publicação no site é determinística.** A skill resolve as decisões editoriais (ângulo, category, author, slug) e escreve o draft em `export/conteudos/blog/<slug>/artigo.mdx`; a promoção ao site é feita pelo script `scripts/content/promover_artigo.js` (monta/valida/escreve `site/content/blog/<slug>.mdx` contra o contrato de `site/lib/blog.ts`), e o `next build` é o gate de qualidade. O draft em `export/` é preservado como artefato de origem. **Separação de tiers:** decisão editorial = skill/⏸; montagem do MDX = script determinístico; julgamento = build.

## Entregável final

```
export/conteudos/blog/<slug>/
└── artigo.mdx                    (MDX draft de origem, APROVADO pelo gate de marca)

site/content/blog/<slug>.mdx      (MDX publicado — BLOG-01 válido, passou next build, commitado)
site/public/blog/covers/_default.webp   (capa default — só se ainda não existia)
```

## Critério de conclusão

- `export/conteudos/blog/<slug>/artigo.mdx` existe (draft de origem).
- Gate `revisor-brand` retornou APROVADO.
- `site/content/blog/<slug>.mdx` existe com frontmatter BLOG-01 válido na 1ª tentativa (8 campos; sem colisão de slug).
- `cd site && npm run build` ficou verde (gate `next build`, nunca lint).
- O artigo aparece na listagem `/blog`.
- Commit escopado do `.mdx` (+ capa default se nova) feito — nunca um `git add` da árvore inteira.
- Write-back executado: linha registrada em `memory/performance/registro-angulos.md` com `--canal blog`.
- Usuário recebeu a mensagem final com o caminho do artefato publicado.
