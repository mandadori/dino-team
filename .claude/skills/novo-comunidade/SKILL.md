---
name: novo-comunidade
description: Produz uma mensagem para a comunidade (WhatsApp) lendo a narrativa ativa — conversa, não broadcast de marketing. Output em `export/conteudos/comunidade/<slug>/mensagem.md`. Gate `revisor-brand`; write-back (canal=comunidade). Disparo real é etapa futura.
---

# /novo-comunidade

Cria uma mensagem de comunidade (WhatsApp) completa, do briefing ao artefato aprovado pelo gate de marca.

## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ parse input | input bruto | — | tema/intenção, pilar opcional |
| 2 | ⚙ ler narrativa ativa | `memory/narrativas/ativas.md` | 1 | `narrativa_servida` (slug\|neutro) |
| 3 | ⚙ mensagem inline + ⏸ | contexto ← 2, tema/brand, `templates/comunidade.md` | 2 | `export/conteudos/comunidade/<slug>/mensagem.md` |
| 4 | `revisor-brand` (gate, criação de post) | `mensagem.md` ← 3 | 3 | APROVADO/REPROVADO |
| 5 | ⚙ entregar + write-back | tudo ← 4 | 4 (APROVADO) | entrega ao usuário + linha no livro-razão |

## Sintaxe

```
/novo-comunidade <tema>
```

- **`<tema>`** — obrigatório. Texto livre descrevendo o tema ou a conversa a iniciar na comunidade.

## Pipeline

### 1. Parsear input

Extraia do input: tema (texto livre após `/novo-comunidade`). Se tema ausente, pergunte ao usuário antes de seguir.

### 2. Ler narrativa ativa

Leia `memory/narrativas/ativas.md`. Identifique o arco com `estado: ativa`. Guarde o slug do arco como `narrativa_servida`. Se não houver arco `ativa`, use `narrativa_servida = neutro` e emita aviso de uma linha.

### 3. Escrever a mensagem inline (+ pausa)

Crie a pasta de saída:

```bash
mkdir -p export/conteudos/comunidade/<slug>
```

Leia os seguintes arquivos:
- `brand/tom-de-voz.md`
- `brand/publico-alvo.md`
- `memory/narrativas/ativas.md`
- `templates/comunidade.md` (esqueleto de campos)

Com base nessas leituras, escreva a mensagem seguindo `templates/comunidade.md`:
- Frontmatter com os campos do briefing (slug = kebab-case do tema, 2-4 palavras) + `narrativa_servida`.
- `gancho` — 1 linha; frase que para o scroll mental. ≤ 15 palavras.
- `corpo` — ≤ 4 linhas; conversa, não marketing. Tom de quem está no grupo, não de quem está vendendo. Corpo corrido, sem bullets. Ancorado no arco narrativo ativo.
- `convite` — 1 pergunta curta e genuína que abre diálogo real.

Grave em `export/conteudos/comunidade/<slug>/mensagem.md`.

Pause para revisão (⏸):

```
Mensagem em export/conteudos/comunidade/<slug>/mensagem.md

--- início ---
<conteúdo integral da mensagem>
--- fim ---

Confirma? ("ok" para seguir ao gate de marca, ou descreva o ajuste)
```

Aguarde resposta. Se vier ajuste, edite o arquivo inline e reapresente. Máx 1 ciclo de retry automático; 2º fracasso escala ao usuário.

### 4. Gate de marca (`revisor-brand`)

Acione `revisor-brand`:

```
Tarefa: validar copy + compliance da mensagem de comunidade (momento: criação de post).

Inputs:
- Arquivo: export/conteudos/comunidade/<slug>/mensagem.md
- Briefing inline:
  Tema: <tema>
  Narrativa servida: <narrativa_servida>
  Slug: <slug>

Avaliar: tom de voz (conversa, não marketing), compliance (saúde, jurídico, suplementação, promessas irreais).

Saída: parecer inline (schema "momento: criação de post"). Status: APROVADO | REPROVADO.
```

Controle de tentativas (`tentativas_gate`, inicia em 0; incrementa a cada re-rodada):
- Se `tentativas_gate ≥ 1` → pausar e escalar ao usuário com o parecer e a ação necessária.
- **APROVADO** → siga para o Passo 5.
- **REPROVADO** → aplique a instrução do campo `Ação`; incremente `tentativas_gate`; re-rode este passo.

### 5. Entregar + write-back

Entregue ao usuário:

```
Mensagem de comunidade pronta: export/conteudos/comunidade/<slug>/mensagem.md

- Tema: <tema>
- Narrativa servida: <narrativa_servida>
- Gancho: <gancho>

Destaques do gate de marca:
- {bullet 1}
- {bullet 2}

Próximo passo: disparo real via WhatsApp é etapa futura (fora desta skill).
```

Write-back no livro-razão (somente quando APROVADO):

```bash
node scripts/memory/append_livro_razao.js \
  --data "$(date +%F)" \
  --mensagem "<gancho + tema>" \
  --narrativa "<narrativa_servida do Passo 2>" \
  --canal comunidade \
  --peca "<slug do Passo 3>"
```

Reporte a linha anexada inline. Se o script falhar (`LIVRO_RAZAO_AUSENTE`), avise o usuário e siga — a mensagem já está entregue; o write-back não bloqueia a entrega.

## Princípio central

**Copy é função única, canal via parâmetro.** A skill é a mais leve: produz a mensagem inline, adaptando ao formato de comunidade (WhatsApp — curta, gancho + corpo + convite), sem pesquisa e sem agente de copy separado. Não há briefing separado — o tema e a narrativa ativa são suficientes. `revisor-brand` valida copy + compliance antes da entrega. Write-back reusa `scripts/memory/append_livro_razao.js` da Onda 3.

**Disparo real é diferido.** Esta skill entrega o artefato aprovado em `export/conteudos/comunidade/<slug>/mensagem.md`. O disparo real via WhatsApp é Onda 5+.

## Entregável final

```
export/conteudos/comunidade/<slug>/
└── mensagem.md   (gancho + corpo + convite, status APROVADO)
```

## Critério de conclusão

- `export/conteudos/comunidade/<slug>/mensagem.md` existe com gancho, corpo e convite preenchidos.
- Gate `revisor-brand` retornou APROVADO.
- Write-back executado: linha registrada em `memory/narrativas/livro-razao.md` com `--canal comunidade`.
- Usuário recebeu a mensagem final com o caminho do artefato.
