---
name: lote-posts
description: Gera N variações de post sobre um tema-base, no formato e estilo escolhidos. Sintaxe livre — formato é obrigatório; N, estilo e tema-base são opcionais. Útil para encher pauta semanal/mensal. Agendável via /schedule. Uso - /lote-posts <formato> [N] [estilo] [tema-base].
---

# /lote-posts — Dino Team

## Objetivo

Gerar múltiplos posts em sequência no mesmo formato e mesmo estilo. Útil para encher pauta semanal/mensal. Suporta execução interativa ou agendada (via `/schedule`).

## Sintaxe

```
/lote-posts <formato> [N] [estilo] [tema-base...]
```

- **`<formato>`** — obrigatório. `carrossel` ou `stories`.
- **`[N]`** — opcional. Número de posts. Default: **5**.
- **`[estilo]`** — opcional. Slug em `templates/formatos/<formato>/estilos/`. Se omitido, scouting de estilo único para o lote inteiro.
- **`[tema-base...]`** — opcional, texto livre. Se omitido, scouting distribui temas pelos pilares.

**Ordem é livre.** N é o token numérico; estilo bate com pasta existente; o resto é tema-base.

### Exemplos

```
/lote-posts carrossel 5 treino-dino braço
/lote-posts carrossel 7 mindset de elite           ← sem estilo → scouting
/lote-posts stories 3                               ← sem estilo nem tema → ambos auto
/lote-posts carrossel                               ← N=5 default, estilo+tema auto
/lote-posts stories foco                            ← N=5, sem estilo → auto, tema=foco
```

## Inputs esperados do usuário

| Input | Obrigatório | Origem |
|---|---|---|
| Formato | Sim | Argumento da skill |
| N | Não | Argumento (default 5) |
| Estilo | Não | Argumento ou scouting (com confirmação) |
| Tema-base | Não | Argumento ou scouting |
| Aprovação da lista de subtemas | Sim (modo interativo) | Pausa de confirmação após o Passo 3 |

## Pré-requisitos

- Brand book preenchido em `brand/`.
- Pilares de conteúdo definidos (essencial quando tema-base é livre).
- Pelo menos o estilo `padrao` em `templates/formatos/<formato>/estilos/`.
- Puppeteer instalado (`npm install` na raiz).

## Pipeline

### Passo 0 — Validar brand book

Leia os 5 arquivos de `brand/`. Se algum estiver incompleto, **pare** e oriente o usuário a rodar `/brand-discovery`.

### Passo 1 — Parsear input

1. **Identifique o formato** (`carrossel` ou `stories`). Se ausente ou inválido, pergunte e pare.
2. **Liste estilos disponíveis** para o formato.
3. **Para cada token restante:**
   - Numérico → `N` (quantidade).
   - Bate com slug de estilo → `estilo`.
   - Senão → faz parte do `tema-base`.
4. Se `N` não foi informado, use **5**.

### Passo 2 — Scouting (só se faltar estilo)

Lote é **um único estilo** para todos os N posts (variar estilo = rodar lotes separados).

Se o estilo foi informado, pule para Passo 3. Senão, acione `pesquisa-tendencias`:

```
MODO: scouting

Formato: {carrossel | stories}
Estilos disponíveis: {lista de slugs}
Estilo já definido: auto-selecionar
Tema já definido: {tema-base se houver, senão "auto-selecionar"}

Observação: este é um lote de {N} posts no mesmo estilo. Escolha um estilo que acomode bem múltiplos subtemas relacionados.
```

Receba sugestão de estilo. Guarde — apresentação ao usuário é no Passo 3 junto com os subtemas.

### Passo 3 — Gerar lista de N subtemas

Decida internamente N ângulos/subtemas distintos:

- **Se tema-base foi informado:** derive N variações coerentes a partir dele (cada uma um ângulo distinto do mesmo tema).
- **Se tema-base é livre:** distribua os N entre os pilares de `brand/pilares-conteudo.md`. Não concentre todos no mesmo pilar.

Apresente ao usuário (modo interativo):

```
Lote: {N} posts em {formato}, estilo {slug}

Estilo {slug} — {motivo do scouting, se aplicável}

Subtemas planejados:
1. {subtema 1} — pilar {pilar}
2. {subtema 2} — pilar {pilar}
3. ...
N. {subtema N} — pilar {pilar}

Posso seguir com isso? (responda "sim" / "ok" para começar, ou diga o que ajustar)
```

**Aguarde confirmação explícita.** Se o usuário pedir ajuste em algum subtema, refaça localmente e reapresente.

**Modo agendado (sem usuário presente):** pule a confirmação. Prossiga com a lista gerada. Registre no entregável final que o lote foi gerado automaticamente.

### Passo 4 — Para cada subtema, executar pipeline de post

Itere sobre os N subtemas. Para cada um, execute os passos do `/novo-post` **a partir do Passo 3 (briefing)**, pulando:
- Passo 1 (parse — já temos formato, estilo, tema).
- Passo 2 (scouting — já decidido).
- **Passo 9 (pausa de preview)** — em modo lote, **NÃO pausa para revisão** de cada post. Lote é massa, ajuste fino é feito post a post via `/novo-post`.

Para cada subtema, execute na ordem:

1. **Briefing estratégico** — acione `diretor-marca` com `Tarefa: briefing-estrategico` (formato, estilo, tema=subtema, data).
2. **Verificar inputs obrigatórios do estilo** — leia `estilo.md`. Se exigir prescrição técnica (ex: treino-dino):
   - Modo interativo: pergunte ao usuário pela lista de exercícios deste subtema antes de continuar (uma pergunta por subtema, na hora).
   - Modo agendado: **pule este subtema** (registre `SKIPPED — input técnico obrigatório`) e siga para o próximo. Não invente.
3. **Criar pasta** `export/conteudos/{tipo}/{data}-{slug-do-post}/`.
4. **Pesquisa deep** — acione `pesquisa-tendencias` (modo deep) salvando em `export/pesquisa/`.
5. **Copywriter** — gera `copy.md`.
6. **Designer** — gera `design/slide-N.html` + `preview.html`.
7. **Curador-Exportador** — valida e exporta PNGs.
8. **Curadoria editorial (Diretor de Marca)** — `Tarefa: curadoria-editorial`.
   - Se APROVADO → marca como concluído.
   - Se REPROVADO → registre o parecer e **pule este post** (não tente refazer no lote — refazer é função do `/novo-post`). Siga para o próximo.

**Política de falha:** se um post falhar em qualquer etapa técnica (export, validação), registre o erro e continue os demais. Lote não para por causa de 1 post quebrado.

### Passo 5 — Reportar entrega do lote

Apresente ao usuário:

```
Lote concluído: {N} posts solicitados

Formato: {carrossel | stories}
Estilo: {slug}

Sucessos ({M} de {N}):
1. export/conteudos/{tipo}/{data}-{slug-1}/ — APROVADO
2. export/conteudos/{tipo}/{data}-{slug-2}/ — APROVADO
...

Pulados/falhos ({N-M}):
- {slug-x}: {motivo — ex: "REPROVADO na curadoria editorial, ver briefing.md", "SKIPPED — input técnico obrigatório", "EXPORT_FALHOU_SLIDE_3"}

PNGs em cada pasta `export/`. Briefings institucionais em cada `briefing.md`.
```

## Critérios de aprovação entre etapas

| Etapa | Como aprovar |
|---|---|
| Scouting de estilo (Passo 2) | Aceita junto com a lista no Passo 3 |
| Lista de subtemas (Passo 3) | Usuário confirma (interativo) ou auto-aprovada (agendado) |
| Cada post no Passo 4 | Mesmos critérios do `/novo-post`, exceto a pausa de preview que é pulada |

## Formato do entregável final

Por post (idêntico ao `/novo-post`):

```
export/conteudos/{tipo}/{data}-{slug-do-post}/
├── pesquisa-base.md
├── copy.md
├── treino.md           ← quando aplicável
├── design/
│   ├── slide-N.html
│   └── preview.html
├── export/
│   └── slide-N.png
└── briefing.md
```

Para o lote como um todo: relatório consolidado no chat (Passo 5) com sucessos, falhas e motivos.

## Modo agendado (`/schedule`)

Combine com `/schedule` para gerar lotes em cadência (ex: toda segunda 9h). No modo agendado:
- Pula a confirmação da lista (Passo 3).
- Em estilos que exigem input técnico do usuário, pula os subtemas afetados (não invente exercícios).
- Reporta o resumo no canal de notificação configurado.

## Princípios

- **Variedade dentro de coerência.** Os N posts soam como família — mesmo estilo visual, ângulos diferentes.
- **Um estilo por lote.** Lote misto de estilos não é suportado — rode 2 lotes separados.
- **Mesmo formato em todo o lote.** Lote misto (carrossel + stories) não é suportado.
- **Distribuir entre pilares quando tema é livre.** Não concentre todos no mesmo pilar.
- **Falhar um, seguir os outros.** Erro em 1 post não para o lote.

## O que esta skill NÃO faz

- Não publica os posts.
- Não faz pausa de preview por post (use `/novo-post` para ajuste fino).
- Não inventa exercícios quando o estilo exige prescrição técnica e o usuário não forneceu.
- Não suporta lote com formatos ou estilos misturados.
