---
name: lote-posts
description: Gera N variações de post sobre um tema-base, no formato e estilo escolhidos. Sintaxe livre — formato é obrigatório; N, estilo e tema-base são opcionais. Útil para encher pauta semanal/mensal. Agendável via /schedule. Uso - /lote-posts <formato> [N] [estilo] [tema-base].
---

# /lote-posts

## Objetivo

Gerar múltiplos posts em sequência no mesmo formato e mesmo estilo. Útil para encher pauta semanal/mensal. Suporta execução interativa ou agendada (via `/schedule`).

Esta skill **reusa o pipeline de `/novo-post`** para cada post do lote — ela carrega o domínio "post" e descreve tarefas autocontidas aos agentes especialistas, exatamente como `/novo-post` faz. As diferenças são: scouting de tema é distribuição em N subtemas em vez de 1; sem pausa de preview por post; política de falha contínua.

## Sintaxe

```
/lote-posts <formato> [N] [estilo] [tema-base...]
```

- **`<formato>`** — obrigatório. Slug de um diretório em `templates/formatos/` (descoberto em runtime).
- **`[N]`** — opcional. Número de posts. Default: **5**.
- **`[estilo]`** — opcional. Slug em `templates/formatos/<formato>/estilos/`. Se omitido, scouting de estilo único para o lote inteiro.
- **`[tema-base...]`** — opcional, texto livre. Se omitido, scouting distribui N temas pelos pilares.

**Ordem é livre.** N é o token numérico; estilo bate com pasta existente; o resto é tema-base.

## Pré-requisitos

- Brand book preenchido em `brand/`. Se algum agente devolver `BRAND_BOOK_INCOMPLETO`, oriente o usuário a rodar `/brand-discovery`.
- Pelo menos um formato e um estilo em `templates/formatos/`.
- Puppeteer/Chromium instalado para o export.

## Pipeline

### Passo 1 — Descobrir formatos e parsear input

1. **Liste formatos disponíveis**: `ls templates/formatos/` (filtre diretórios).
2. **Liste estilos do formato escolhido**: `ls templates/formatos/<formato>/estilos/`.
3. **Para cada token restante:**
   - Numérico → `N` (quantidade).
   - Bate com slug de estilo → `estilo`.
   - Senão → faz parte do `tema-base`.
4. Se `N` não foi informado, use **5**.

### Passo 2 — Scouting (só se faltar estilo)

Lote é **um único estilo** para todos os N posts (variar estilo = rodar lotes separados). Se o estilo foi informado, pule para Passo 3. Senão, acione `pesquisa-tendencias`:

```
Tarefa: sugerir 1 estilo para um lote de N posts no mesmo formato.

Inputs:
- Formato: <formato>
- Estilos disponíveis: <lista de slugs>
- Tema-base já definido: <texto ou "nenhum">
- Quantidade de posts no lote: <N>

Profundidade esperada: rápido / decisório.

Observação: o estilo escolhido precisa acomodar múltiplos subtemas
relacionados, não apenas um.

Saída: inline, 2-3 linhas — estilo sugerido + 1 linha de justificativa.
```

Guarde a sugestão; apresentação ao usuário é no Passo 3 junto com os subtemas.

### Passo 3 — Distribuir N subtemas

Acione `pesquisa-tendencias` para distribuir os subtemas em pilares:

```
Tarefa: gerar uma lista de N subtemas distintos para um lote de posts.

Inputs:
- Formato: <formato>
- Estilo: <slug>
- Tema-base: <texto livre ou "nenhum — distribuir entre pilares">
- N: <número>

Profundidade esperada: rápido / decisório.

Regras:
- Se tema-base é livre, distribua os N entre os pilares (não concentre todos
  no mesmo pilar).
- Se tema-base é dado, derive N ângulos distintos a partir dele (cada subtema
  com recorte específico).

Saída: inline, lista numerada de N subtemas com o pilar de cada um, no formato:
1. <subtema> — pilar <pilar>
2. <subtema> — pilar <pilar>
...
```

Apresente ao usuário (modo interativo):

```
Lote: <N> posts em <formato>, estilo <slug>

Subtemas planejados:
1. {subtema 1} — pilar {pilar}
2. {subtema 2} — pilar {pilar}
...

Posso seguir com isso? (responda "sim" / "ok" para começar, ou diga o que ajustar)
```

**Aguarde confirmação explícita.**

**Modo agendado (sem usuário presente):** pule a confirmação. Prossiga com a lista gerada. Registre no entregável final que o lote foi gerado automaticamente.

### Passo 4 — Para cada subtema, executar pipeline de post

Itere sobre os N subtemas. Para cada um, execute as etapas do `/novo-post` **a partir do briefing**, com estas adaptações:

- **Pular o parse inicial** (formato/estilo/tema já definidos).
- **Pular o scouting** (já decidido).
- **Pular a pausa de revisão do preview** — em modo lote, **não pausa por post**. Quem quiser ajuste fino abre o `preview.html` específico depois e re-roda o export.

Para cada subtema, na ordem:

1. **Briefing estratégico** (`/novo-post` Passo 3) — acione `diretor-marca` com o esqueleto de briefing embutido. Extraia `slug-do-post`.
2. **Criar pasta do post** (`/novo-post` Passo 4).
3. **Verificar inputs obrigatórios do estilo** (`/novo-post` Passo 5):
   - Modo interativo: pergunte ao usuário pela lista de exercícios deste subtema antes de continuar.
   - Modo agendado: **pule este subtema** (registre `SKIPPED — input técnico obrigatório`) e siga para o próximo. Não invente.
4. **Pesquisa profunda** (`/novo-post` Passo 6).
5. **Copy** (`/novo-post` Passo 7).
6. **Design — gerar assets + consolidar preview** (`/novo-post` Passo 8). Sem pausa de revisão.
7. **Pacote técnico** (`/novo-post` Passo 10 — snapshot da pesquisa + validação + export).
8. **Curadoria editorial** (`/novo-post` Passo 11).
   - Se APROVADO → marca como concluído.
   - Se REPROVADO → registre o parecer e **pule este post** (no lote não tentamos refazer; refazer é responsabilidade do `/novo-post`). Siga para o próximo.

**Política de falha:** se um post falhar em qualquer etapa técnica (export, validação), registre o erro e continue os demais. Lote não para por causa de 1 post quebrado.

### Passo 5 — Reportar entrega do lote

Apresente ao usuário:

```
Lote concluído: <N> posts solicitados

Formato: <formato>
Estilo: <slug>

Sucessos ({M} de {N}):
1. export/conteudos/<formato>/<data>-<slug-1>/ — APROVADO
2. export/conteudos/<formato>/<data>-<slug-2>/ — APROVADO
...

Pulados/falhos ({N-M}):
- <slug-x>: <motivo — ex: "REPROVADO na curadoria editorial, ver briefing.md", "SKIPPED — input técnico obrigatório", "EXPORT_FALHOU">

Imagens em cada pasta export/. Briefings institucionais em cada briefing.md.
```

## Tratamento de erros propagados pelos agentes

Mesma tabela do `/novo-post`. Diferença: no lote, erros que no `/novo-post` parariam o pipeline aqui apenas **pulam o post atual** e seguem para o próximo. Apenas `BRAND_BOOK_INCOMPLETO` para o lote inteiro (sem brand book, nenhum post sai).

## Critérios de aprovação entre etapas

| Etapa | Como aprovar |
|---|---|
| Scouting de estilo (Passo 2) | Aceito junto com a lista no Passo 3 |
| Lista de subtemas (Passo 3) | Usuário confirma (interativo) ou auto-aprovada (agendado) |
| Cada post no Passo 4 | Mesmos critérios do `/novo-post`, exceto a pausa de preview que é pulada |

## Formato do entregável final

Por post (idêntico ao `/novo-post`):

```
export/conteudos/<formato>/<data>-<slug-do-post>/
├── pesquisa-base.md
├── copy.md
├── treino.md           ← quando aplicável
├── design/
│   ├── <assets HTML>
│   └── preview.html
├── export/
│   └── <imagens PNG>
└── briefing.md
```

Para o lote como um todo: relatório consolidado no chat (Passo 5).

## Modo agendado (`/schedule`)

Combine com `/schedule` para gerar lotes em cadência (ex: toda segunda 9h). No modo agendado:
- Pula a confirmação da lista (Passo 3).
- Em estilos que exigem input técnico do usuário, pula os subtemas afetados (não invente).
- Reporta o resumo no canal de notificação configurado.

## Princípios

- **Variedade dentro de coerência.** Os N posts soam como família — mesmo estilo visual, ângulos diferentes.
- **Um estilo por lote.** Lote misto de estilos não é suportado — rode 2 lotes separados.
- **Mesmo formato em todo o lote.**
- **Distribuir entre pilares quando tema é livre.**
- **Falhar um, seguir os outros.**

## O que esta skill NÃO faz

- Não publica os posts.
- Não pausa para preview por post (use `/novo-post` para ajuste fino).
- Não inventa inputs técnicos quando o estilo exige prescrição.
- Não suporta lote com formatos ou estilos misturados.
