---
name: novo-artigo
description: Produz um artigo de blog (MDX draft) a partir de um tema/ângulo, lendo a narrativa ativa e o brand. Output em `export/conteudos/blog/<slug>/artigo.mdx`. Pesquisa via `/pesquisar-tema`; gate `revisor-brand`; write-back no livro-razão (canal=blog). A publicação no site é trabalho do GSD do site (não desta skill).
---

# /novo-artigo

Cria um artigo de blog completo, do briefing ao artefato MDX draft aprovado pelo gate de marca.

## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ parse input | input bruto | — | tema/ângulo, pilar opcional |
| 2 | ⚙ escolher verdade servida | `brand/brand-book.md` (`## Verdades`) | 1 | `verdade_servida` (slug\|neutro) |
| 3 | ⚙ briefing inline | contexto ← 2, tema/pilar/brand | 2 | ângulo/pilar/objetivo/recorte/slug |
| 3.⏸ | ⏸ usuário | briefing ← 3 | 3 | confirmação do plano |
| 4 | `/pesquisar-tema` (condic., ângulo informacional) | tema, pilar, recorte ← 3 | 3.⏸ | `memory/pesquisa/<data>-tendencias-<slug>.md` |
| 5 | ⚙ escrever artigo inline (MDX) + ⏸ | pesquisa ← 4, brand, `templates/artigo.md` | 4 | `export/conteudos/blog/<slug>/artigo.mdx` |
| 6 | `revisor-brand` (gate, criação de post) | `artigo.mdx` ← 5 | 5 | APROVADO/REPROVADO |
| 7 | ⚙ entregar + write-back | tudo ← 6 | 6 (APROVADO) | entrega ao usuário + linha no livro-razão |

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
- `memory/performance/angulos-queimados.md`

Com base nessas leituras, fixe:
- **Ângulo central** — ponto de vista específico que diferencia (não o tema bruto).
- **Pilar** — de `brand/pilares-conteudo.md`; apenas 1.
- **Objetivo** — 1 frase: o que o artigo deve fazer no leitor.
- **Recorte de público** — 1-2 frases do segmento específico dentro do público-alvo.
- **Slug** — kebab-case (2-5 palavras capturando o ângulo).
- **Pesquisa necessária?** — ângulo informacional (dados, mitos, técnica) = sim; narrativo/pessoal = não.

Apresente o plano ao usuário (⏸):

```
Plano do artigo:
- Tema: <tema>
- Ângulo central: <ângulo>
- Pilar: <pilar>
- Objetivo: <objetivo>
- Slug: <slug>
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
- **APROVADO** → siga para o Passo 7.
- **REPROVADO** → aplique a instrução do campo `Ação`; incremente `tentativas_gate`; re-rode este passo.

### 7. Entregar + write-back

Entregue ao usuário:

```
Artigo pronto (draft): export/conteudos/blog/<slug>/artigo.mdx

- Pilar: <pilar>
- Ângulo: <ângulo>
- Verdade servida: <verdade_servida>

Destaques do gate de marca:
- {bullet 1}
- {bullet 2}

Próximo passo: integração no site é trabalho do GSD do site (fora desta skill).
```

Write-back no livro-razão (somente quando APROVADO):

```bash
node scripts/memory/append_livro_razao.js \
  --data "$(date +%F)" \
  --mensagem "<ângulo central do Passo 3>" \
  --narrativa "<verdade_servida do Passo 2>" \
  --canal blog \
  --peca "<slug do Passo 3>"
```

Reporte a linha anexada inline. Se o script falhar (`LIVRO_RAZAO_AUSENTE`), avise o usuário e siga — o artigo já está entregue; o write-back não bloqueia a entrega.

## Princípio central

**Copy é função única, canal via parâmetro.** A skill produz o artigo inline, adaptando o formato para blog (MDX, SEO, H2/H3), sem agente de copy separado. Pesquisa profunda é delegada a `/pesquisar-tema` quando o ângulo for informacional. `revisor-brand` valida copy + compliance antes da entrega. Write-back reusa `scripts/memory/append_livro_razao.js` da Onda 3.

**A publicação no site é fora de escopo.** Esta skill entrega o artefato MDX draft em `export/conteudos/blog/<slug>/artigo.mdx`. A integração do MDX no site Next.js é fase do GSD do site (`.planning/`).

## Entregável final

```
export/conteudos/blog/<slug>/
└── artigo.mdx   (MDX draft, status APROVADO pelo gate de marca)
```

## Critério de conclusão

- `export/conteudos/blog/<slug>/artigo.mdx` existe com frontmatter preenchido e status `draft`.
- Gate `revisor-brand` retornou APROVADO.
- Write-back executado: linha registrada em `memory/narrativas/livro-razao.md` com `--canal blog`.
- Usuário recebeu a mensagem final com o caminho do artefato.
