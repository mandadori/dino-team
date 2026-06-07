---
name: novo-email
description: Produz um e-mail (assunto + preheader + corpo + CTA) lendo a narrativa ativa e o brand. Output em `export/conteudos/email/<slug>/email.md`. Gate `revisor-brand`; write-back (canal=email). Envio real (Resend) é etapa futura — esta skill entrega o conteúdo aprovado.
---

# /novo-email

Cria um e-mail completo de marca, do briefing ao artefato aprovado pelo gate de marca.

## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ parse input | input bruto | — | tema/ângulo, objetivo opcional |
| 2 | ⚙ escolher verdade servida | `brand/brand-book.md` (`## Verdades`) | 1 | `verdade_servida` (slug\|neutro) |
| 3 | ⚙ briefing inline | contexto ← 2, tema/brand | 2 | ângulo/pilar/objetivo/recorte/slug |
| 3.⏸ | ⏸ usuário | briefing ← 3 | 3 | confirmação do plano |
| 4 | `/pesquisar-tema` (condic., ângulo informacional) | tema, pilar, recorte ← 3 | 3.⏸ | `memory/pesquisa/<data>-tendencias-<slug>.md` |
| 5 | ⚙ escrever e-mail inline + ⏸ | pesquisa ← 4, brand, `templates/email.md` | 4 | `export/conteudos/email/<slug>/email.md` |
| 6 | `revisor-brand` (gate, criação de post) | `email.md` ← 5 | 5 | APROVADO/REPROVADO |
| 7 | ⚙ entregar + write-back | tudo ← 6 | 6 (APROVADO) | entrega ao usuário + linha no livro-razão |

## Sintaxe

```
/novo-email <tema> [--pilar <pilar>]
```

- **`<tema>`** — obrigatório. Texto livre descrevendo o tema ou ângulo do e-mail.
- **`[--pilar <pilar>]`** — opcional. Slug do pilar de `brand/pilares-conteudo.md`.

## Pipeline

### 1. Parsear input

Extraia do input: tema (texto livre após `/novo-email`), pilar (se `--pilar <valor>`). Se tema ausente, pergunte ao usuário antes de seguir.

### 2. Escolher verdade servida

Leia `brand/brand-book.md` (`## Verdades`). Com base no tema/ângulo (Passo 1), identifique a verdade que este e-mail acende. Guarde como `verdade_servida = <slug>`. Se nenhuma verdade responder claramente, use `verdade_servida = neutro`.

### 3. Briefing inline

Leia os seguintes arquivos:
- `brand/brand-book.md` (inclui `## Verdades`)
- `brand/pilares-conteudo.md`
- `brand/publico-alvo.md`

Com base nessas leituras, fixe:
- **Ângulo central** — a ideia central do e-mail; o que o leitor deve sair sentindo/pensando.
- **Pilar** — de `brand/pilares-conteudo.md`; apenas 1.
- **Objetivo** — 1 frase: o que este e-mail deve fazer no leitor.
- **Recorte de público** — 1-2 frases do segmento específico dentro do público-alvo.
- **Slug** — kebab-case (2-5 palavras capturando o ângulo).
- **Pesquisa necessária?** — e-mail é relacional por padrão (não); só sim se o ângulo for informacional com dados externos.

Apresente o plano ao usuário (⏸):

```
Plano do e-mail:
- Tema: <tema>
- Ângulo central: <ângulo>
- Pilar: <pilar>
- Objetivo: <objetivo>
- Slug: <slug>
- Verdade servida: <verdade_servida>
- Pesquisa: <sim / não (relacional)>

Confirma? ("ok" para seguir, ou descreva o ajuste)
```

Aguarde confirmação explícita. Se vier ajuste, ajuste o plano inline e reapresente.

### 4. Pesquisa profunda (condicional)

Execute **somente** quando o ângulo for informacional e o usuário ou o briefing indicar que dados externos fortalecem a mensagem. E-mail relacional e narrativo não necessita de pesquisa.

Invoque `/pesquisar-tema`:

```
/pesquisar-tema <tema> --pilar <pilar> --recorte <recorte de público>
```

A skill grava o resultado em `memory/pesquisa/<data>-tendencias-<slug>.md`. Este arquivo é o que o Passo 5 lê.

### 5. Escrever o e-mail inline (+ pausa)

Crie a pasta de saída:

```bash
mkdir -p export/conteudos/email/<slug>
```

Leia os seguintes arquivos:
- `brand/tom-de-voz.md`
- `brand/publico-alvo.md`
- `templates/email.md` (esqueleto de campos)
- `memory/pesquisa/<data>-tendencias-<slug>.md` (se pesquisa executada no Passo 4)

Escreva o e-mail completo seguindo `templates/email.md`:
- Frontmatter com os campos do briefing (Passo 3) + `verdade_servida`.
- `assunto` — ≤ 50 chars; específico, não clickbait.
- `preheader` — ≤ 90 chars; complementa o assunto.
- Corpo: abertura pessoal → desenvolvimento → CTA sóbrio (1 linha). Tom: carta de mentor 1:1. Corpo corrido, sem bullets, sem formatação excessiva.

Grave em `export/conteudos/email/<slug>/email.md`.

Pause para revisão (⏸):

```
E-mail em export/conteudos/email/<slug>/email.md

--- início ---
<conteúdo integral do e-mail>
--- fim ---

Confirma? ("ok" para seguir ao gate de marca, ou descreva o ajuste)
```

Aguarde resposta. Se vier ajuste, edite o arquivo inline e reapresente. Máx 1 ciclo de retry automático; 2º fracasso escala ao usuário.

### 6. Gate de marca (`revisor-brand`)

Acione `revisor-brand`:

```
Tarefa: validar copy + compliance do e-mail (momento: criação de post).

Inputs:
- Arquivo: export/conteudos/email/<slug>/email.md
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
E-mail pronto: export/conteudos/email/<slug>/email.md

- Pilar: <pilar>
- Ângulo: <ângulo>
- Verdade servida: <verdade_servida>
- Assunto: <assunto>

Destaques do gate de marca:
- {bullet 1}
- {bullet 2}

Próximo passo: envio real via Resend é etapa futura (fora desta skill).
```

Write-back no livro-razão (somente quando APROVADO):

```bash
node scripts/memory/append_livro_razao.js \
  --data "$(date +%F)" \
  --mensagem "<ângulo central do Passo 3>" \
  --verdade "<verdade_servida do Passo 2>" \
  --canal email \
  --peca "<slug do Passo 3>"
```

Reporte a linha anexada inline. Se o script falhar (`LIVRO_RAZAO_AUSENTE`), avise o usuário e siga — o e-mail já está entregue; o write-back não bloqueia a entrega.

## Princípio central

**Copy é função única, canal via parâmetro.** A skill produz o e-mail inline, adaptando o formato para correspondência (assunto + preheader + corpo corrido em tom de carta de mentor), sem agente de copy separado. E-mail é relacional por natureza — pesquisa profunda é opcional e só ativada quando o ângulo for informacional. `revisor-brand` valida copy + compliance antes da entrega. Write-back reusa `scripts/memory/append_livro_razao.js` da Onda 3.

**Envio real é diferido.** Esta skill entrega o artefato aprovado em `export/conteudos/email/<slug>/email.md`. O disparo real via Resend é Onda 5+.

## Entregável final

```
export/conteudos/email/<slug>/
└── email.md   (e-mail completo com assunto + preheader + corpo, status APROVADO)
```

## Critério de conclusão

- `export/conteudos/email/<slug>/email.md` existe com assunto, preheader e corpo preenchidos.
- Gate `revisor-brand` retornou APROVADO.
- Write-back executado: linha registrada em `memory/narrativas/livro-razao.md` com `--canal email`.
- Usuário recebeu a mensagem final com o caminho do artefato.
