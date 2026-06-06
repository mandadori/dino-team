# Simplificação do pipeline de posts — design

> Data: 2026-06-03
> Status: aprovado para implementação
> Escopo: pipeline de criação de posts (skills + agentes + contrato de estilo). Não toca no setor Web nem na orquestração/dashboard.

---

## 1. Contexto e problema

Hoje `/novo-post` orquestra **7 agentes** (`pesquisador-mercado`, `briefing-writer`, `treinador`, `copywriter`, `designer`, `revisor-conteudo`, `revisor-brand`) + `gerenciador-materiais`. Cada agente roda em contexto isolado, relê sua fatia de `brand/`, e recebe/entrega via envelopes formais. O SKILL tem 758 linhas de orquestração.

Quatro desses agentes — `copywriter`, `designer`, `briefing-writer`, `revisor-conteudo` — existem **só** para o pipeline de post. O custo real deles não é reler brand (já é cirúrgico), é o **overhead de orquestração**: cold start de subagente, construção de envelope, releitura redundante (`brand-book.md` é lido ~5× num pipeline), contadores de retry, roteamento de parecer.

## 2. Objetivo

Tornar a criação de post **mais enxuta e coerente**, com resultado idêntico ao atual. A skill passa a **executar os passos de produção inline** (lendo só o que cada passo precisa), acionando agentes apenas quando têm **função geral no sistema**. A instrução de cada estilo mora na **própria pasta do estilo**.

**O que NÃO é objetivo:** ganho dramático de latência. O trabalho de geração (pensar copy, gerar HTML) é o mesmo — é o mesmo modelo fazendo. O ganho é overhead de orquestração + manutenibilidade. Lote continua sequencial (mais simples, não mais rápido).

## 3. Princípio central

> **Skill executa a produção inline; agente só sobrevive se tem função geral (dono de dado, especialista técnico, ou gate transversal). Toda particularidade do estilo mora na pasta do estilo.**

## 4. Roster de agentes

### Deletados (específicos de post)
- `.claude/agents/copywriter.md`
- `.claude/agents/designer.md`
- `.claude/agents/briefing-writer.md`
- `.claude/agents/revisor-conteudo.md`

### Mantidos (função geral)
| Agente | Função geral que justifica |
|---|---|
| `pesquisador-mercado` | Dono único de `dados/mercado/`; tem WebSearch/WebFetch; serve várias skills. |
| `treinador` | Especialista técnico generalista; sub-agente sob demanda. |
| `revisor-brand` | Gate transversal de identidade (vale para Web também); **absorve compliance**. |
| `gerenciador-materiais` | Dono do índice do banco de imagens. |
| `archivist-ramon`, `analista-performance` | Donos de slices (`dados/ramon`, `dados/performance`); não eram parte da cadeia de produção — intocados. |

Roster total: **15 → 11 agentes**.

## 5. O que muda em cada skill

### Princípio comum (todas as skills de post)
Onde o fluxo dizia "acionar `briefing-writer` / `copywriter` / `designer` / `revisor-conteudo`", a skill agora **faz inline**, lendo no passo:
- **Briefing (decisão):** `brand/*` + `dados/ramon/contexto.md` + `dados/performance/angulos-queimados.md` + `dados/mercado/` + `estilo.md` do estilo.
- **Copy:** `estilo.md` (campos `#### editorial` de cada bloco) + `brand/tom-de-voz.md` + `brand/publico-alvo.md`.
- **Design:** `estilo.md` (campos `#### visual`) + `slide.html` do estilo + `brand/referencias-visuais.md` + `brand/social-media.md`.

Agentes ainda acionados: `pesquisador-mercado` (pesquisa), `treinador` (condic.), `revisor-brand` (gate), `gerenciador-materiais` (condic.).

### 5.1 `/novo-post` — fluxo reordenado (contexto-primeiro)

A ordem muda: contexto é carregado **antes** de decidir tema/estilo (hoje só entra no briefing).

1. **Parse input** (formato obrigatório; estilo/tema opcionais).
2. **Carregar contexto** — lê `dados/ramon/contexto.md`, `dados/performance/angulos-queimados.md`, `dados/mercado/tendencias/<mês>.md` (auto-heal de frescor via `pesquisador-mercado` se stale, como hoje).
3. **Tema** — se não veio no input, scouting ranqueado (`pesquisador-mercado` Fase B), informado pelo contexto do passo 2. ⏸
4. **Estilo** — se não veio, a skill recomenda inline lendo `## Quando usar`/`## Quando NÃO usar` dos `estilo.md` candidatos. ⏸ (confirmar plano)
5. **Estilo ad-hoc** (condic.) — a skill cria `_rascunho/` (estilo.md + slide.html) inline a partir das refs. ⏸
6. **Briefing (decisão inline)** — a skill fixa ângulo/pilar/objetivo/recorte/slug. **Não serializa envelope** — vira raciocínio. (Exceção: ver §7 — briefing pré-pronto vindo da pauta.)
7. **Criar pasta** do post.
8. **Inputs obrigatórios externos do estilo** (condic.) — se `estilo.md` declara `## Inputs obrigatórios externos` do tipo treino: usa input do usuário, ou aciona `treinador`, ou pergunta.
9. **Pesquisa profunda** (condic.) — `pesquisador-mercado` quando o ângulo é informacional (dados/mitos/técnica). Pula em post puramente narrativo.
10. **Copy (inline)** → grava `copy.md`. ⏸
11. **Design (inline)** → grava `design/slide-N.html` (taggeado `data-block`/`data-slot`). `gerenciador-materiais` condic. se há banco. ⏸ (editor)
12. **Loop de aprendizado de estilo** (condic.) — extrai deltas estruturais de `edits.json` e promove ao `estilo.md`/`slide.html` **inline**.
13. **Export PNG** — `scripts/export-png.js` (auto-valida).
14. **Gate (`revisor-brand`)** — valida **copy (tom de voz) + compliance** (claims de saúde/jurídico, promessas proibidas). **Não re-julga o visual** — a identidade visual já foi validada na criação do estilo (§6). APROVADO → consolida `briefing.md` (via `templates/briefing.md`). REPROVADO → volta ao passo apontado.
15. **Entregar**.
16. **Adaptar stories** (condic., só carrossel) — design inline. ⏸
17. **Salvar/descartar `_rascunho/`** (condic. ad-hoc).
18. **Publicação** (opcional, gated por `dados/politicas/publicacao.yaml`).

### 5.2 `/lote-posts`
- Produção por post (briefing-decisão, copy, design) vira **inline**, igual `/novo-post`.
- `pesquisador-mercado` continua sugerindo distribuição + subtemas (passos 3-4) e fazendo pesquisa profunda por post.
- Curadoria por post: só `revisor-brand` (copy+compliance). `revisor-conteudo` some.
- **Cada post é um passo independente** — não carrega pesquisa/copy do post anterior no contexto. A variação de tema/estilo dentro do lote já é feature existente (não adicionar regra extra de anti-repetição).
- Pausas e modo agendado: inalterados.

### 5.3 `/planejar-pauta-semanal`
- Continua produzindo **N briefings como artefatos** em `campanhas/<YYYY-Www>-pauta-semanal/output/posts/` — esses são handoff cross-skill (consumidos depois por `/novo-post`/`/lote-posts`), então o briefing-artefato **sobrevive aqui**.
- A diferença: os briefings são escritos **inline pela skill** (lendo `brand/*` + `dados/ramon` + `dados/performance` + a pesquisa de tendências), não pelo agente `briefing-writer`.
- `pesquisador-mercado` (Fase A / tendências da semana): mantido.

### 5.4 `/novo-estilo`
- Já é **dual-mode** (cria/edita; detecta slug existente). **Não existe nem é preciso criar `/editar-estilo`.**
- O passo de geração/edição (hoje agente `designer`) vira **inline**: a skill gera/edita `estilo.md` + `slide.html` diretamente.
- **Para de gerar `preview.html`** (§8). Preview = abrir `slide.html` no Live Preview do VS Code ou no Dino Editor.
- Gate de marca na criação/edição de estilo: `revisor-brand` valida a **identidade visual** do estilo (paleta/tipografia/layout/mood). É aqui que o alinhamento visual é garantido — front-load.

### 5.5 `/editar-post`
- **Sem mudança funcional.** Continua resolvendo o estilo a partir de `briefing.md` (`Caminho do estilo:` / `Estilo:`) e subindo o editor. Depende de `briefing.md` existir — garantido pelo passo 14 de `/novo-post`.

## 6. Gate de marca em 2 momentos

| Momento | Quem | O que valida |
|---|---|---|
| Criação/edição de estilo (`/novo-estilo`) | `revisor-brand` | Identidade visual: paleta, tipografia, layout, mood. |
| Criação de post (`/novo-post`, `/lote-posts`) | `revisor-brand` | Copy (tom de voz) **+ compliance** (claims/promessas). Não re-julga visual herdado. |

`revisor-brand` **absorve a dimensão de compliance** que era do `revisor-conteudo`: checagem de promessas proibidas e claims sensíveis (saúde, jurídico, suplementação, resultados irreais), lendo `brand/compliance/termos-vetados.md` quando existir. A coerência editorial (artefato cumpre o ângulo decidido) deixa de ser etapa separada — é responsabilidade da própria skill, que decidiu o ângulo e escreveu a copy no mesmo contexto.

## 7. Briefing: etapa vs. artefato

Separar dois conceitos que hoje se confundem:

- **Briefing-como-etapa/envelope** (o que `briefing-writer` produzia antes da copy, para alinhar agentes isolados): **removido.** Inline, a skill decide ângulo/pilar/recorte como raciocínio e usa direto. Não serializa documento intermediário.
- **`briefing.md`-como-artefato** (consolidado na pasta do post): **mantido, obrigatório.** Consumido por `/editar-post` (resolve o estilo) e `scripts/integrations/publish_instagram.js`. Continua sendo gerado via `templates/briefing.md` — agora escrito pela própria skill no passo 14.
- **Briefing da pauta semanal** (`campanhas/.../output/posts/<N>-<slug>.md`): **mantido** — é handoff cross-skill. `/novo-post` e `/lote-posts` devem **aceitar um briefing pré-pronto** como input opcional: quando presente, pulam a decisão inline (passo 6) e usam o ângulo/pilar/estilo já definidos; quando ausente, decidem inline.

## 8. Contrato do estilo (refinado)

### Arquivo único `estilo.md` (sem divisão em 3)
A divisão em conteúdo/estilo/layout foi descartada: a alternância de layout por slide (corpo com fundo preto↔branco, texto/imagem trocando de lado) acopla copy + visual **por slide** — a copy é escrita já sabendo do visual. Co-localizar visual + editorial por bloco (modelo atual) resolve isso sem custo de sincronia entre arquivos.

### Estrutura (igual à atual + um campo novo)
```
## Conceito            (2-3 frases: DNA visual + editorial + mood)
## Estrutura
  [sequência]: capa(1, obrigatório) → corpo(1..N, flexível) → cta(1, obrigatório)
  [total]: min X | max Y
  ### bloco: <id>
    [instâncias]: 1 | N-dinâmico (fonte: copy → ...) | 0..N-opcional
    #### visual     [classe] [bg] [overlay] [layout] [slots] [tokens]
      [alternância]: <regra de variação par/ímpar>      ← NOVO, opcional, só em bloco N-dinâmico que varia
    #### editorial  [função] [tom] [entregar] [ab]
## Quando usar  /  ## Quando NÃO usar
## (condicionais) Inputs obrigatórios externos / Notas técnicas
```

- **Papéis, não números:** a quantidade de slides do corpo vem da copy. Nunca hardcodar "10 slides".
- **`[alternância]` (novo):** declara variação cíclica do bloco N-dinâmico. Ex:
  `[alternância]: bg #000 ↔ #fff (ímpar/par); layout texto-esquerda ↔ texto-direita`
  O designer inline aplica a variante conforme a posição (ímpar/par) do slide na sequência do corpo.

### Pasta do estilo
`estilo.md` + `slide.html` (renderável). **`preview.html` aposentado** — era wrapper interativo legado; o passo de preview já aponta para `slide.html`, e a interatividade vive no Dino Editor. `slide.html` rende standalone (tem `<body>` com as seções de exemplo taggeadas).

### `templates/estilo.md` (contrato canônico)
- Documentar o campo `[alternância]`.
- Remover qualquer menção a geração de `preview.html`.
- Confirmar "papéis, não números".

## 9. Inventário de arquivos

### Deletar
- `.claude/agents/copywriter.md`, `designer.md`, `briefing-writer.md`, `revisor-conteudo.md`
- `templates/social-media/carrossel/estilos/{editorial,layout-dividido,treino-dino}/preview.html`
- `templates/wrappers/` (diretório vazio, sem referências)

### Atualizar
- `CLAUDE.md` — roster 15→11; remover os 4 agentes da lista; ajustar descrição das skills se citarem os agentes; manter coerência da seção de agentes.
- `templates/estilo.md` — campo `[alternância]`, remover `preview.html`, confirmar papéis-não-números.
- `.claude/agents/revisor-brand.md` — absorver dimensão de compliance (termos vetados, claims/promessas); documentar o gate em 2 momentos.
- Skills: `novo-post`, `lote-posts`, `planejar-pauta-semanal`, `novo-estilo` — inline conforme §5; remover envelopes dos 4 agentes; remover geração de `preview.html` (novo-estilo).

### Manter (trocam só de consumidor)
- Todo `brand/*` (lido inline + por `revisor-brand`).
- `dados/ramon`, `dados/performance`, `dados/mercado` (lidos inline + pelos donos).
- `templates/briefing.md` (escrito pela skill agora), `templates/pesquisa.md` (usado por `pesquisador-mercado`).
- `templates/social-media/<formato>/estilos/<slug>/estilo.md` (contrato do estilo, refinado).
- `slide.html` de cada estilo.

## 10. Sequência de migração (ordem segura)

Cross-references entre `CLAUDE.md` e os agentes/skills exigem ordem:

1. **Contrato + template:** atualizar `templates/estilo.md` (`[alternância]`, sem preview.html).
2. **`revisor-brand`:** absorver compliance + gate-em-2-momentos.
3. **Skills inline (uma a uma, verificando cada):** `novo-post` → `lote-posts` → `planejar-pauta-semanal` → `novo-estilo`. Cada uma: substituir acionamentos dos 4 agentes por passos inline; remover envelopes; manter acionamentos de `pesquisador-mercado`/`treinador`/`revisor-brand`/`gerenciador-materiais`.
4. **Aceitar briefing pré-pronto:** garantir que `novo-post`/`lote-posts` consomem briefing da pauta quando apontado.
5. **Deletar agentes:** os 4 `.md` — só depois que nenhuma skill os referencia.
6. **Limpar arquivos:** `preview.html` dos 3 estilos + `templates/wrappers/`.
7. **`CLAUDE.md`:** roster e referências.
8. **Verificação final** (§11).

## 11. Critérios de aceitação

- `grep -rlE "copywriter|briefing-writer|revisor-conteudo" .claude/skills` → vazio (nenhuma skill referencia agente deletado). `designer` só pode aparecer como `designer-web` (web).
- `ls .claude/agents/` não contém `copywriter.md`, `designer.md`, `briefing-writer.md`, `revisor-conteudo.md`.
- `find templates/social-media -name preview.html` → vazio.
- `templates/wrappers/` não existe.
- `CLAUDE.md` lista 11 agentes; nenhuma menção aos 4 deletados na seção de agentes.
- `templates/estilo.md` documenta `[alternância]` e não menciona `preview.html`.
- `.claude/agents/revisor-brand.md` contém a dimensão de compliance.
- `/editar-post` segue resolvendo estilo via `briefing.md` (inalterado).
- Smoke conceitual: ler `/novo-post` de ponta a ponta e confirmar que cada passo inline declara explicitamente quais arquivos lê (briefing/copy/design conforme §5), e que `briefing.md` ainda é gerado no fim.
- As skills `novo-post`/`lote-posts` aceitam briefing pré-pronto da pauta.

## 12. Riscos e mitigação

- **Perda de isolamento de contexto** (copy + design no mesmo contexto): aceito; mitigado por post-independente no lote. Qualidade garantida pelo gate `revisor-brand`.
- **Compliance sem olhar independente do produtor:** mitigado por migrar compliance ao `revisor-brand` (que é olhar externo e relê tudo).
- **Quebrar a pauta semanal:** mitigado pelo §7 (briefing pré-pronto aceito como input).
- **Deletar agente ainda referenciado:** mitigado pela ordem da §10 (deletar por último).
