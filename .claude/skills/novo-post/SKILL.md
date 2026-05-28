---
name: novo-post
description: Dispara o pipeline completo de criação de um post Instagram (formato definido pelo usuário entre os disponíveis em templates/social-media/). Sintaxe livre — só formato é obrigatório; estilo e tema são opcionais e podem vir em qualquer ordem. Orquestra pesquisa, briefing, copy, design, curadoria técnica e curadoria editorial. Uso - /novo-post <formato> [estilo] [tema]. Requer brand book preenchido.
---

# /novo-post

Cria um post Instagram completo no formato pedido, do briefing à entrega das imagens.

## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ parse input | input bruto | — | formato/estilo/tema |
| 2a | pesquisador (Fase A, se stale) | mês, formato | 1 | slice mercado |
| 2a.iii | pesquisador (Fase B) | formato, estilo | 2a | `<candidatos>` |
| 2c | ⏸ usuário | candidatos ← 2a.iii | 2a.iii | escolha |
| 3 | designer (ad-hoc, condic.) + ⏸ | descrição/refs | 2c | rascunho |
| 4 | briefing-writer | escolha ← 2c | 2c | `<briefing>` |
| 5 | ⚙ criar pasta | slug ← 4 | 4 | pasta |
| 6 | treinador (condic.) | exercícios, objetivo ← 4 | 4 | prescrição |
| 7 | pesquisador (P7) | briefing ← 4 | 4 | pesquisa-bruta |
| 8 | copywriter + ⏸ | pesquisa ← 7, briefing ← 4 | 7 | copy.md |
| 9 | designer + ⏸ | copy ← 8 | 8 | assets |
| 10 | curador-export | pasta ← 9 | 9 | `<validacao>` + PNGs |
| 11a | revisor-conteudo | pasta ← 10, briefing ← 4 | 10 | `<parecer>` |
| 11b | revisor-brand | pasta ← 10 | 11a | parecer binário |
| 13 | ⚙ entregar | tudo ← 11b | 11b | entrega |
| 13.5 | designer (stories, condic.) + ⏸ | copy, estilo | 13 | frames |
| 14 | ⚙ política publish | pasta ← 11b | 11b | publicado/pendente |

## Sintaxe

```
/novo-post <formato> [estilo] [tema...]
```

- **`<formato>`** — obrigatório. Slug de diretório em `templates/social-media/`.
- **`[estilo]`** — opcional. Slug em `templates/social-media/<formato>/estilos/`.
- **`[tema...]`** — opcional, texto livre.
- Ordem livre. Tokens são interpretados por correspondência com slugs; o resto vira tema.

## Pré-requisitos

- Puppeteer/Chromium instalado (`npm install` na raiz).

Se algum agente devolver `BRAND_BOOK_INCOMPLETO`, propague ao usuário e oriente a rodar `/brand-discovery` antes.

## Princípio central

**Estrutura de copy é propriedade do estilo, não do formato.** Cada `estilo.md` carrega `## Estrutura` (blocos, função editorial, tom, variações A/B, inputs visuais). Em modo ad-hoc, criamos um estilo temporário em `_rascunho/` **antes** da pesquisa+copy, para que o pipeline inteiro rode sobre um estilo concreto.

## Agentes

| Agente | Responsabilidade | Input | Output |
|---|---|---|---|
| `pesquisador-mercado` | Fase A (scouting de mercado → slice) + Fase B (seleção ranqueada) + pesquisa profunda (P7) | modo + formato/estilo (P2a) / briefing (P7) | slice `dados/mercado/` atualizado (Fase A) / candidatos ranqueados inline (Fase B) / `dados/pesquisas-brutas/<data>-tendencias-<slug>.md` (P7) |
| `briefing-writer` | Recomendação de estilo (P2b) + briefing estratégico (P4) | formato+tema (P2b) / formato+estilo+tema (P4) | recomendação inline (P2b) / briefing inline (P4) |
| `designer` | Estilo ad-hoc em `_rascunho/` (P3) + assets do post + preview consolidado (P9) | refs visuais + contrato (P3) / estilo + copy (P9) | `estilo.md` + arquivo principal + `preview.html` (P3) / `design/*.html` + `design/preview.html` (P9) |
| `treinador` | Prescrição técnica de treino | exercícios + objetivo + recorte | `treino.md` |
| `copywriter` | Copy do post | pesquisa + briefing + `estilo.md` (+ `treino.md`) | `copy.md` |
| `curador-export` | Validação técnica + export PNG | `design/` + `estilo.md` | status inline + `export/*.png` |
| `revisor-conteudo` | Curadoria editorial (P11a) — coerência com briefing + compliance; pode aprovar com ajustes | pasta + briefing | `<parecer>` inline |
| `revisor-brand` | Validação de identidade da marca (P11b) — binário | pasta + briefing | APROVADO/REPROVADO inline |

## Pipeline

4 pausas no modo definido (Passos 2, 8, 9, 13.5). 6 pausas no modo ad-hoc (Passos 2, 3, 8, 9, 13.5, 13.6).

### 1. Parsear input

Liste `templates/social-media/` e `templates/social-media/<formato>/estilos/`. Tokenize a entrada: match com slug de estilo → estilo; resto → tema. Se formato ausente/inválido, pergunte ao usuário oferecendo a lista descoberta. Siga sempre para o Passo 2.

### 2. Resolver tema → estilo (pausa)

Ordem: tema primeiro, estilo depois — porque a recomendação de estilo depende do tema.

#### 2a. Tema

- **Tema veio no input** → usa direto. **Pula todo o scouting (bypass)** — vai para o Passo 2b.
- **Sem tema** → scouting de duas fases (2a.i → 2a.ii → 2a.iii):

##### 2a.i — Checar frescor da inteligência de mercado

```bash
f="dados/mercado/tendencias/$(date +%Y-%m).md"
if [ -f "$f" ] && [ -z "$(find "$f" -mtime +14 2>/dev/null)" ]; then echo "FRESCO"; else echo "STALE"; fi
```

##### 2a.ii — Auto-heal (só se STALE)

Avise o usuário ("Atualizando inteligência de mercado, isso leva um pouco…") e acione `pesquisador-mercado`:

```
Tarefa: scouting de mercado (Fase A — inteligência durável).
Profundidade: deep research.

Inputs:
- Mês de referência: <YYYY-MM>

Saída: gravar/atualizar dados/mercado/tendencias/<YYYY-MM>.md, dados/mercado/concorrentes/<slug>.md e dados/mercado/vocabulario-publico.md conforme a metodologia do modo scouting de mercado.
```

Se FRESCO, pule este passo.

##### 2a.iii — Seleção ranqueada (sempre)

Acione `pesquisador-mercado`:

```
Tarefa: seleção de candidatos (Fase B — ranqueamento).

Inputs:
- Formato: <formato>
- Estilo: <slug se veio no input, senão "ainda não definido">
- Quantidade de candidatos: 3-5

Saída inline: candidatos ranqueados (ângulo + pilar + sustentação + potencial), do maior para o menor potencial.
```

Apresente e pause:

```
Candidatos (ranqueados por potencial):
<lista do agente>

Responda:
- <número> → escolhe o candidato
- "mais"   → re-ranqueia / traz outros
- ajuste em texto livre
- ou dê seu próprio tema (bypass — sua escolha vence)
```

A escolha define `tema`. **Guarde o candidato escolhido + a lista ranqueada** (serão reenviados no Passo 4). Se "mais"/ajuste, re-acione o modo seleção e reapresente. **Aguarde escolha explícita** antes de seguir ao Passo 2b.

#### 2b. Estilo (sabendo o tema)

- **Estilo veio no input** → `modo_estilo = "definido"`, `slug = <escolhido>`.
- **Sem estilo** → acione `briefing-writer`:

```
Tarefa: recomendar UM estilo para o tema, ou propor ad-hoc se nenhum couber bem.

Inputs:
- Formato: <formato>
- Tema: <tema>
- Estilos disponíveis (leia todos): templates/social-media/<formato>/estilos/*/estilo.md

Avalie cada estilo contra o tema usando `## Quando usar` / `## Quando NÃO usar` de cada estilo.md.

Saída inline:
- Recomendação: <slug recomendado> | "ad-hoc"
- Motivo: 1-2 frases ancorando em tema vs. estilo (ou explicando porque nenhum cabe).
```

Apresente a recomendação ao usuário:

```
Estilo recomendado: <slug | ad-hoc>
Motivo: <motivo do briefing-writer>

Responda:
- "sim" → segue com o recomendado
- "<outro-slug>" → troca para esse estilo
- "ad-hoc" → cria estilo novo (anexe imagem de referência e/ou descreva o visual)
```

Se vier `ad-hoc` (ou recomendação foi ad-hoc), `modo_estilo = "ad-hoc"`, colete:
- `referencia_imagem` (caminho) — opcional
- `referencia_descricao` (texto) — opcional
- Ao menos um dos dois é obrigatório. Se nenhum, repita a pergunta.

#### 2c. Mostrar plano + pausa

```
Plano do post:
- Formato: <formato>
- Tema: <tema>
- Estilo: <slug existente> | ad-hoc (referência: <descrição resumida>)

Confirma? (responda "sim" para seguir, ou diga o que ajustar)
```

**Aguarde confirmação explícita ou ajuste** antes de seguir.

### 3. Preparar `_rascunho/` ad-hoc (pausa)

**Só executa quando `modo_estilo = "ad-hoc"`.** Em modo definido, pule para o Passo 4.

```bash
mkdir -p templates/social-media/<formato>/estilos/_rascunho/
```

Se `_rascunho/` já existir, pergunte ao usuário antes de sobrescrever (sobrescrever / continuar do rascunho atual / abortar).

Acione `designer`:

```
Tarefa: criar estilo (estilo.md + arquivo principal + preview.html) a partir das referências do usuário.

Inputs:
- Pasta de trabalho: templates/social-media/<formato>/estilos/_rascunho/
- Formato: <formato>
- Referências:
  - Imagem: <caminho ou "nenhuma">
  - Descrição: <texto do usuário ou "nenhuma">
- Contrato canônico: templates/estilo.md (use como guia das seções obrigatórias e condicionais)
- Dimensões e arquivo principal: vêm das regras de brand + convenção de nome (slide.html para carrossel, frame.html para stories)

Saída em _rascunho/:
- estilo.md — preencher seções obrigatórias (Conceito visual, Estrutura, Quando usar, Quando NÃO usar, Variantes visuais) e condicionais que se apliquem
- arquivo principal do template (slide.html ou frame.html)
- preview.html — copiar templates/wrappers/preview-wrapper.html verbatim, substituir <!-- SLIDES_HERE --> por uma section[data-slide="N"] por variante, atualizar apenas o <title>

Regras críticas:
- Referências fotográficas são guia de mood/composição/tratamento — NUNCA conteúdo final.
- Backgrounds com intenção fotográfica = sempre drop zone (data-bg-drop="<nome>").
- Declarar drop zones no campo "Inputs visuais" de cada bloco da ## Estrutura do estilo.md.
- Conteúdo dos blocos é PLACEHOLDER ("TÍTULO DE EXEMPLO", "FRASE — MÁX 12 PALAVRAS", etc.).
```

**Pausa após gravação:**

```
Rascunho do estilo ad-hoc em templates/social-media/<formato>/estilos/_rascunho/
- estilo.md
- <arquivo principal>
- preview.html

Abra preview.html no Claude Design e revise estrutura/visual.
Confirma? ("ok" para seguir ao briefing, ou descreva o ajuste)
```

Se vier ajuste, re-acione o `designer` com o pedido inline + estado atual de `_rascunho/`. Repita até "ok".

### 4. Briefing estratégico

Acione `briefing-writer`:

```
Tarefa: produzir briefing estratégico para o post.

Inputs:
- Formato: <formato>
- Estilo: <slug | "ad-hoc">
- Caminho do estilo: <templates/social-media/<formato>/estilos/<slug>/ | templates/social-media/<formato>/estilos/_rascunho/>
- Tema: <tema>
- Data: <YYYY-MM-DD>
- Candidatos ranqueados: <lista da Fase B guardada no Passo 2a.iii | "nenhum — tema veio no input (sem scouting)">
- Candidato escolhido pelo humano: <o selecionado no Passo 2a.iii | "nenhum">

Leia o estilo.md no caminho indicado (## Estrutura é fonte da modulação de tom por bloco).
Avalie tema/formato/estilo contra o brand book; decida ângulo central; selecione 1 pilar; defina objetivo; descreva recorte de público; gere slug em kebab-case (2-5 palavras, captura o ângulo, não o tema bruto).

Preencha o esqueleto inline:

## Briefing estratégico
**Formato:** {formato}
**Estilo:** {slug | ad-hoc}
**Caminho do estilo:** {caminho passado acima}
**Tema:** {tema}
**Data:** {YYYY-MM-DD}
**Slug do post:** {kebab-case}
**Pilar:** {de pilares-conteudo.md}
**Objetivo:** {1 frase específica}
**Recorte de público:** {1-2 frases}
**Ângulo central:** {1-2 frases}
**Por que este recorte:** {2-3 linhas ligando ângulo + pilar + público + formato}
**Sinalizações para o pipeline:**
- {pesquisa}
- {tom}
- {restrição/tabu}
```

Mostre o briefing ao usuário e **guarde-o inline na memória da skill** — será reenviado no Passo 11. Prossiga sem pausa.

### 5. Criar pasta do post

```bash
mkdir -p export/conteudos/<formato>/<data>-<slug>/{design,export}
```

### 6. Resolver inputs obrigatórios externos do estilo

Leia o `estilo.md` apontado pelo briefing. Se ele declarar `## Inputs obrigatórios externos`, resolva por tipo:

- **Prescrição técnica de treino:**
  - Usuário forneceu exercícios + séries/reps → use direto, salve em `<pasta>/treino.md`.
  - Forneceu só exercícios → acione `treinador` (abaixo) e salve o output em `<pasta>/treino.md`.
  - Não forneceu nada → pergunte ao usuário. Não invente exercícios.
- **Outros tipos** → pergunte ao usuário.

Se o estilo não declarar `## Inputs obrigatórios externos`, pule.

Prompt do `treinador`:

```
Tarefa: definir séries × repetições por exercício.

Inputs:
- Lista de exercícios: <lista do usuário>
- Objetivo: <do briefing>
- Recorte de público: <do briefing>

Saída: inline no formato canônico do treinador.
```

### 7. Pesquisa profunda

Acione `pesquisador-mercado`:

```
Tarefa: levantar matéria-prima profunda para a copy.
Profundidade: deep research (WebFetch nas fontes promissoras).

Inputs:
- Formato/Estilo/Tema: <formato> / <slug | "ad-hoc"> / <tema>
- Pilar / Recorte / Sinalizações: <inline do briefing>
- Contexto de mercado acumulado: dados/mercado/tendencias/<mês-atual em YYYY-MM>.md + dados/mercado/concorrentes/*.md (parta daqui; não redescubra tendências já mapeadas).

Foco: ângulos não-óbvios e contradições dentro do recorte; referências concretas com link; dados/citações verificáveis; mitos a quebrar.

Template: templates/pesquisa.md.
Saída: gravar em dados/pesquisas-brutas/<data>-tendencias-<slug>.md.
```

### 8. Copy (pausa)

Acione `copywriter`:

```
Tarefa: escrever copy do post seguindo a ## Estrutura do estilo.

Inputs:
- Pesquisa: dados/pesquisas-brutas/<data>-tendencias-<slug>.md
- Briefing inline:
  - Pilar: <pilar>
  - Objetivo: <objetivo>
  - Ângulo central: <ângulo>
  - Recorte de público: <recorte>
  - Slug do post: <slug>
- Inputs técnicos (quando aplicável):
  export/conteudos/<formato>/<data>-<slug>/treino.md

Estilo a seguir: <caminho do estilo.md — templates/social-media/<formato>/estilos/<slug>/estilo.md OU templates/social-media/<formato>/estilos/_rascunho/estilo.md>

Saída: gravar em export/conteudos/<formato>/<data>-<slug>/copy.md.
```

Critério: arquivo gravado seguindo a `## Estrutura` declarada no estilo (blocos, função, tom, variações A/B nos pontos pedidos).

#### Pausa para revisão da copy

```
Copy gerada em export/conteudos/<formato>/<data>-<slug>/copy.md

--- início do copy ---
<conteúdo integral de copy.md>
--- fim do copy ---

Confirma? (responda "ok" para seguir ao design, ou descreva o ajuste)
```

**Aguarde resposta.** Se vier ajuste, re-acione o `copywriter` com o pedido inline (sem re-rodar pesquisa), aguarde nova gravação e reapresente. Repita até "ok".

Prompt do `copywriter` em modo ajuste:

```
Tarefa: ajustar copy do post conforme pedido do usuário.

Inputs:
- Copy atual: export/conteudos/<formato>/<data>-<slug>/copy.md
- Pedido de ajuste: <texto do usuário>
- Briefing inline original: <briefing guardado no Passo 4>
- Estilo a seguir: <caminho do estilo.md>

Regras:
- Preserve a ## Estrutura do estilo e blocos que não foram pedidos para mudar.
- Aplique apenas o ajuste solicitado.

Saída: sobrescrever export/conteudos/<formato>/<data>-<slug>/copy.md.
```

### 9. Design (pausa)

Acione `designer` com as duas tarefas no mesmo prompt:

```
Tarefa 1 — produzir N assets visuais (um por bloco da ## Estrutura do estilo).

Inputs:
- Estilo (visual + estrutura): <caminho do estilo.md>
- Template visual: <pasta do estilo>/<arquivo principal HTML> (slide.html | frame.html)
- Copy: export/conteudos/<formato>/<data>-<slug>/copy.md
- Inputs técnicos (se houver): export/conteudos/<formato>/<data>-<slug>/treino.md

Saída: um HTML standalone por bloco em design/, nome sequencial seguindo o padrão do template visual (slide-1.html, frame-1.html, ...).

Drop zones: respeite o campo "Inputs visuais" de cada bloco no estilo.md.
- data-bg-drop="full" se asset preenche tudo com foto
- data-bg-drop="<nome>" por zona fotográfica
- não marcar se puramente tipográfico ou se for placeholder técnico (ex: chroma)

Tarefa 2 — consolidar em preview.html.

Inputs:
- Pasta dos assets: export/conteudos/<formato>/<data>-<slug>/design/
- Wrapper (VERBATIM, não altere CSS/JS): templates/wrappers/preview-wrapper.html

Regras:
- Substituir APENAS <!-- SLIDES_HERE --> por <section data-slide="N" style="width:{W}px;height:{H}px;"> para cada asset, contendo o <style> do <head> + o conteúdo do <body> (sem o wrapper <body>). W/H das dimensões do template visual. data-slide="N" obrigatório (o script de export usa).
- Atualizar APENAS o <title> para "Preview — <tema> (<estilo>)".

Saída: export/conteudos/<formato>/<data>-<slug>/design/preview.html.
```

#### Pausa para revisão do preview

```
Design gerado em export/conteudos/<formato>/<data>-<slug>/design/ (estilo: <slug | ad-hoc>):
- preview.html
- <assets individuais>

Opções:
- "exportar" → exporto o preview.html em disco como está.
- Anexe preview.html editado → sobrescrevo e exporto.
- Peça ajustes → repasso ao Designer.
```

**Aguarde resposta.** Se vier arquivo anexado, sobrescreva `design/preview.html`. Se vier pedido de ajuste, repasse ao `designer` com o ponto específico. Se vier confirmação, siga para o Passo 10.

### 10. Validação técnica + export PNG

Snapshot da pesquisa na pasta do post:

```bash
cp -n dados/pesquisas-brutas/<data>-tendencias-<slug>.md \
      export/conteudos/<formato>/<data>-<slug>/pesquisa-base.md
```

Acione `curador-export`:

```
Tarefa: validar assets e executar export para PNG.

Inputs:
- Pasta: export/conteudos/<formato>/<data>-<slug>/design/
- Estilo: <caminho do estilo.md>

Critérios:
- Dimensões dos assets = template visual.
- Sem JavaScript em assets individuais (JS só no wrapper).
- preview.html tem section[data-slide="N"] para cada asset.

Comando: node scripts/export-png.js export/conteudos/<formato>/<data>-<slug>/

Pós-export: verificar que qtd. de PNGs em export/ = qtd. de assets HTML em design/; inspeção visual rápida (capa + último asset).

Saída: inline com status, lista de PNGs, observações.
```

Em `VALIDACAO_TECNICA_FALHOU` → corrija no Designer no ponto apontado. Em `EXPORT_FALHOU` → resolva a causa (dependência, HTML quebrado) e re-rode.

### 11. Curadoria editorial final

Duas revisões em sequência. Toda reprovação **interrompe** e devolve a etapa apontada para refazer. Só após APROVADO em ambas, o briefing institucional é consolidado.

Controle de tentativas (rastrear por execução):
- `tentativas_11a`: inicializar em 0; incrementar a cada re-rodada.
- `tentativas_11b`: inicializar em 0; incrementar a cada re-rodada.

Se `tentativas_11a ≥ 1` ou `tentativas_11b ≥ 1` → pausar e apresentar ao usuário:

```
Curadoria travada após N tentativas em [11a|11b].
Parecer atual: <inline>
Ação necessária: <instrução do revisor>
```

#### 11a. Conteúdo (`revisor-conteudo`)

```
Tarefa: revisar conteúdo do post pronto.

Inputs:
- Pasta do post: export/conteudos/<formato>/<data>-<slug>/
  (pesquisa-base.md, copy.md, design/preview.html, design/*.html, export/*.png, treino.md quando aplicável)
- Briefing estratégico original (inline):
  <briefing guardado no Passo 4, na íntegra>
```

- **APROVADO** → seguir para 11b.
- **APROVADO COM AJUSTES** → aplicar instrução do campo `Ação` (acionar agente indicado com a instrução inline); seguir para 11b.
- **REPROVADO** → acionar agente indicado no campo `Ação` com a instrução inline; incrementar `tentativas_11a`; re-rodar 11a.

#### 11b. Brand (`revisor-brand`)

```
Tarefa: validar identidade da marca no post pronto.

Inputs:
- Pasta do post: export/conteudos/<formato>/<data>-<slug>/
- Briefing estratégico original (inline):
  <briefing guardado no Passo 4, na íntegra>

Avalie tom de voz, paleta/tipografia, pilar, mood/identidade visual contra brand/. Decisão binária.

Saída: parecer inline com campo Ação quando REPROVADO.
Status válidos: APROVADO | REPROVADO.
```

- **APROVADO** → consolidar briefing institucional usando `templates/briefing.md` (sem variações A/B, sem rastros de processo) e gravar em `export/conteudos/<formato>/<data>-<slug>/briefing.md`. **Este é o último passo da curadoria.**
- **REPROVADO** → acionar agente indicado no campo `Ação` com a instrução inline; incrementar `tentativas_11b`; re-rodar 11a desde o início.

### 13. Entregar ao usuário

```
Post pronto: export/conteudos/<formato>/<data>-<slug>/

- Formato: <formato>
- Estilo: <slug> (<salvo como permanente | descartado | já era permanente>)
- Tema: <tema>

Destaques da curadoria:
- {bullet 1}
- {bullet 2}
- {bullet 3}

Imagens prontas para upload:
- <lista de PNGs>

Briefing institucional: export/conteudos/<formato>/<data>-<slug>/briefing.md
```

### 13.5. Adaptar para stories (pausa)

**Só executa quando `<formato> = carrossel`.** Em outros formatos, pule para o Passo 13.6 (ad-hoc) ou Passo 14 (modo definido).

```
Quer adaptar este post para stories (9:16)?
- "sim" → gera versão stories
- "não" → segue para o próximo passo
```

Se "não", pule para o Passo 13.6 (ad-hoc) ou Passo 14 (modo definido).

Se "sim", acione `designer`:

```
Tarefa: adaptar assets do carrossel para stories (9:16).

Inputs:
- Estilo de referência: <caminho do estilo.md do carrossel>
- Template de referência: <pasta do estilo>/slide.html
- Copy: export/conteudos/carrossel/<data>-<slug>/copy.md
- Inputs técnicos (se houver): export/conteudos/carrossel/<data>-<slug>/treino.md
- Formato de saída: stories (1080×1920)

Saída em export/conteudos/carrossel/<data>-<slug>/stories/design/:
- frame-N.html por bloco da ## Estrutura do estilo
- preview.html usando templates/wrappers/preview-wrapper.html verbatim

Drop zones: manter as declaradas no estilo de referência.
```

#### Pausa para revisão do preview stories

```
Stories gerado em export/conteudos/carrossel/<data>-<slug>/stories/design/:
- preview.html
- <frames individuais>

Opções:
- "exportar" → exporto como está
- Anexe preview.html editado → sobrescrevo e exporto
- Peça ajustes visuais → repasso ao designer
- Ajuste de copy → re-aciono copywriter; salvo em stories/copy.md (copy.md original intacto)
```

**Aguarde resposta.** Se vier ajuste visual, repasse ao `designer` com o ponto específico e aguarde nova gravação. Se vier ajuste de copy, acione `copywriter`:

```
Tarefa: ajustar copy para versão stories do post.

Inputs:
- Copy original: export/conteudos/carrossel/<data>-<slug>/copy.md
- Pedido de ajuste: <texto do usuário>
- Briefing inline original: <briefing guardado no Passo 4>
- Estilo a seguir: <caminho do estilo.md do carrossel>

Regras:
- Preserve a ## Estrutura do estilo e blocos não pedidos para mudar.
- Aplique apenas o ajuste solicitado.

Saída: gravar em export/conteudos/carrossel/<data>-<slug>/stories/copy.md.
NÃO alterar export/conteudos/carrossel/<data>-<slug>/copy.md.
```

Repita até "exportar" ou confirmação. Após aprovação, acione `curador-export`:

```
Tarefa: validar assets e executar export para PNG.

Inputs:
- Pasta: export/conteudos/carrossel/<data>-<slug>/stories/design/
- Estilo: <caminho do estilo.md do carrossel>

Critérios:
- Dimensões dos frames = 1080×1920.
- Sem JavaScript em assets individuais (JS só no wrapper).
- preview.html tem section[data-slide="N"] para cada frame.

Comando: node scripts/export-png.js export/conteudos/carrossel/<data>-<slug>/stories/

Pós-export: verificar que qtd. de PNGs em stories/export/ = qtd. de frame-N.html em stories/design/.

Saída: inline com status, lista de PNGs, observações.
```

**Curadoria não se repete** — copy e briefing já foram aprovados nos Passos 11a/b/c.

Em `VALIDACAO_TECNICA_FALHOU` → corrija no designer no ponto apontado. Em `EXPORT_FALHOU` → resolva a causa e re-rode.

### 13.6. Salvar/descartar `_rascunho/` (pausa)

**Só executa quando `modo_estilo = "ad-hoc"`.** Em modo definido, pule para o Passo 14.

```
Estilo ad-hoc usado no post: templates/social-media/<formato>/estilos/_rascunho/

Quer salvar como estilo permanente?
- "salvar <slug-em-kebab-case>" → mantém pasta, renomeia.
- "descartar" → remove a pasta.
```

- **Salvar:** valide kebab-case (`^[a-z0-9-]+$`). Se já existir `templates/social-media/<formato>/estilos/<slug>/`, peça outro slug. Então `mv templates/social-media/<formato>/estilos/_rascunho/ templates/social-media/<formato>/estilos/<slug>/`. O estilo é salvo somente em `templates/social-media/carrossel/estilos/<slug>/` — nenhum estilo é criado em `templates/social-media/stories/`.
- **Descartar:** `rm -rf templates/social-media/<formato>/estilos/_rascunho/`.

### 14. Publicação (opcional, gated por política)

Carregar `dados/politicas/publicacao.yaml`. Avaliar as regras com as variáveis disponíveis:
- `artefato.canal = 'instagram'`
- `briefing.pilar = <pilar do briefing>`
- `artefato.contem_termo(<termo>)` (varrer copy + briefing para termos sensíveis)

**Regra que casa primeiro decide.** Se `modo: automatico` → oferecer ao usuário publicar agora:

```
Política autoriza publicação automática neste post (regra: <id>).
Janela de aborto: <N> min após publicação.

Quer publicar agora? (sim para chamar publish_instagram.js; não para fechar)
```

Se sim → executar:

```bash
node scripts/integrations/publish_instagram.js --post export/conteudos/<formato>/<data>-<slug>/
```

Reportar resposta (status, instagram_media_id, posted_at) inline.

Se `modo: aprovacao_humana` → não chamar o script automaticamente. Mostrar:

```
Política exige aprovação humana antes de publicar (regra: <id>, motivo: <motivo>).
Para publicar, rode manualmente:
  node scripts/integrations/publish_instagram.js --post export/conteudos/<formato>/<data>-<slug>/
```

## Entregável final

```
export/conteudos/<formato>/<data>-<slug>/
├── pesquisa-base.md
├── copy.md
├── treino.md                     (quando aplicável)
├── design/
│   ├── <assets HTML>
│   └── preview.html
├── export/
│   └── <PNGs>
├── briefing.md
└── stories/                      (quando adaptação stories executada)
    ├── copy.md                   (só existe se houver ajuste de copy no stories)
    ├── design/
    │   ├── <frames HTML>
    │   └── preview.html
    └── export/
        └── <PNGs>
```

## Critério de conclusão

- A pasta `export/conteudos/<formato>/<data>-<slug>/` contém `pesquisa-base.md`, `copy.md`, `design/` com assets + `preview.html`, `export/` com PNGs e `briefing.md`.
- Quantidade de PNGs em `export/` é igual à de assets HTML em `design/`.
- `briefing.md` foi gerado por curadoria editorial com status APROVADO.
- Em modo ad-hoc, `_rascunho/` foi salvo com slug definitivo ou removido (não deve sobrar entre execuções) — a decisão ocorre no Passo 13.6, após o Passo 13.5.
- Usuário recebeu a mensagem final do Passo 13 com lista de PNGs e caminho do briefing.
- Quando adaptação stories executada: `stories/design/` contém `frame-N.html` + `preview.html`; `stories/export/` contém um PNG por frame; quantidade de PNGs = quantidade de frames HTML; `copy.md` raiz não foi alterado.
