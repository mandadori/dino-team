---
name: novo-post
description: Dispara o pipeline completo de criação de um post Instagram (formato definido pelo usuário entre os disponíveis em templates/formatos/). Sintaxe livre — só formato é obrigatório; estilo e tema são opcionais e podem vir em qualquer ordem. Orquestra pesquisa, briefing, copy, design, curadoria técnica e curadoria editorial. Uso - /novo-post <formato> [estilo] [tema]. Requer brand book preenchido.
---

# /novo-post

Cria um post Instagram completo no formato pedido, do briefing à entrega das imagens.

## Sintaxe

```
/novo-post <formato> [estilo] [tema...]
```

- **`<formato>`** — obrigatório. Slug de diretório em `templates/formatos/`.
- **`[estilo]`** — opcional. Slug em `templates/formatos/<formato>/estilos/`.
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
| `pesquisador-mercado` | Scouting de tema + pesquisa profunda | formato/estilo OU briefing | sugestão inline (scouting) OU `dados/pesquisas-brutas/<data>-tendencias-<slug>.md` |
| `briefing-writer` | Recomendação de estilo (P2b) + briefing estratégico (P4) | formato+tema (P2b) / formato+estilo+tema (P4) | recomendação inline (P2b) / briefing inline (P4) |
| `designer` | Estilo ad-hoc em `_rascunho/` (P3) + assets do post + preview consolidado (P9) | refs visuais + contrato (P3) / estilo + copy (P9) | `estilo.md` + arquivo principal + `preview.html` (P3) / `design/*.html` + `design/preview.html` (P9) |
| `treinador` | Prescrição técnica de treino | exercícios + objetivo + recorte | `treino.md` |
| `copywriter` | Copy do post | pesquisa + briefing + `estilo.md` (+ `treino.md`) | `copy.md` |
| `curador-export` | Validação técnica + export PNG | `design/` + `estilo.md` | status inline + `export/*.png` |
| `revisor-coerencia` | Curadoria editorial (P11a) — coerência artefato vs. briefing; pode aprovar com ajustes | pasta + briefing | parecer inline |
| `revisor-brand` | Validação de identidade da marca (P11b) — binário | pasta + briefing | APROVADO/REPROVADO inline |
| `revisor-compliance` | Validação de compliance (P11c) — binário | pasta | APROVADO/REPROVADO inline |

## Pipeline

3 pausas no modo definido (Passos 2, 8, 9). 5 pausas no modo ad-hoc (Passos 2, 3, 8, 9, 12).

### 1. Parsear input

Liste `templates/formatos/` e `templates/formatos/<formato>/estilos/`. Tokenize a entrada: match com slug de estilo → estilo; resto → tema. Se formato ausente/inválido, pergunte ao usuário oferecendo a lista descoberta. Siga sempre para o Passo 2.

### 2. Resolver tema → estilo (pausa)

Ordem: tema primeiro, estilo depois — porque a recomendação de estilo depende do tema.

#### 2a. Tema

- **Tema veio no input** → usa direto.
- **Sem tema** → acione `pesquisador-mercado` modo scouting:

```
Tarefa: sugerir tema para um post Instagram.
Profundidade: rápida / decisória.

Inputs:
- Formato: <formato>
- Estilo: <slug se veio no input, senão "ainda não definido">
- Tema já definido: nenhum

Saída inline (3-4 linhas): tema sugerido + motivo, ancorando em pilar/público/tendência.
```

#### 2b. Estilo (sabendo o tema)

- **Estilo veio no input** → `modo_estilo = "definido"`, `slug = <escolhido>`.
- **Sem estilo** → acione `briefing-writer`:

```
Tarefa: recomendar UM estilo para o tema, ou propor ad-hoc se nenhum couber bem.

Inputs:
- Formato: <formato>
- Tema: <tema>
- Estilos disponíveis (leia todos): templates/formatos/<formato>/estilos/*/estilo.md

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
mkdir -p templates/formatos/<formato>/estilos/_rascunho/
```

Se `_rascunho/` já existir, pergunte ao usuário antes de sobrescrever (sobrescrever / continuar do rascunho atual / abortar).

Acione `designer`:

```
Tarefa: criar estilo (estilo.md + arquivo principal + preview.html) a partir das referências do usuário.

Inputs:
- Pasta de trabalho: templates/formatos/<formato>/estilos/_rascunho/
- Formato: <formato>
- Referências:
  - Imagem: <caminho ou "nenhuma">
  - Descrição: <texto do usuário ou "nenhuma">
- Contrato canônico: templates/estilo.md (use como guia das seções obrigatórias e condicionais)
- Regras inegociáveis: templates/formatos/README.md
- Dimensões e arquivo principal: vêm das regras inegociáveis + convenção de nome (slide.html para carrossel, frame.html para stories)

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
Rascunho do estilo ad-hoc em templates/formatos/<formato>/estilos/_rascunho/
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
- Caminho do estilo: <templates/formatos/<formato>/estilos/<slug>/ | templates/formatos/<formato>/estilos/_rascunho/>
- Tema: <tema>
- Data: <YYYY-MM-DD>

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

Estilo a seguir: <caminho do estilo.md — templates/formatos/<formato>/estilos/<slug>/estilo.md OU templates/formatos/<formato>/estilos/_rascunho/estilo.md>

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
- Regras inegociáveis: templates/formatos/README.md
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
- Tipografia/paleta dentro de brand/referencias-visuais.md (+ extras autorizadas pelo estilo.md).
- Sem JavaScript em assets individuais (JS só no wrapper).
- preview.html tem section[data-slide="N"] para cada asset.

Comando: node scripts/export-png.js export/conteudos/<formato>/<data>-<slug>/

Pós-export: verificar que qtd. de PNGs em export/ = qtd. de assets HTML em design/; inspeção visual rápida (capa + último asset).

Saída: inline com status, lista de PNGs, observações.
```

Em `VALIDACAO_TECNICA_FALHOU` → corrija no Designer no ponto apontado. Em `EXPORT_FALHOU` → resolva a causa (dependência, HTML quebrado) e re-rode.

### 11. Curadoria editorial final

Três revisões em sequência. Toda reprovação **interrompe** a sequência e devolve a etapa apontada para refazer. Só após APROVADO em todos os três, o briefing institucional é consolidado.

#### 11a. Coerência (`revisor-coerencia`)

```
Tarefa: dar parecer editorial sobre o post pronto.

Inputs:
- Pasta do post: export/conteudos/<formato>/<data>-<slug>/
  (pesquisa-base.md, copy.md, design/preview.html, design/*.html, export/*.png, treino.md quando aplicável)
- Briefing estratégico original (inline):
  <briefing guardado no Passo 4, na íntegra>

Avalie 4 dimensões: alinhamento com brand book; coerência com briefing original (ângulo, pilar, objetivo, recorte); qualidade editorial (hook, 1 ideia por bloco, concreto > abstrato, CTA específico); integridade técnica (qtd. PNGs = qtd. assets; pesquisa-base.md presente).

Saída: parecer inline.
Status válidos: APROVADO | APROVADO COM AJUSTES | REPROVADO.
```

- **APROVADO** ou **APROVADO COM AJUSTES** → seguir para 11b. Se AJUSTES, anotar os pontos para aplicar depois ou em iteração rápida com `copywriter`/`designer` antes de seguir.
- **REPROVADO** → reabra a etapa apontada, refaça, e re-rode 11a.

#### 11b. Brand (`revisor-brand`)

```
Tarefa: validar identidade da marca no post pronto.

Inputs:
- Pasta do post: export/conteudos/<formato>/<data>-<slug>/
- Briefing estratégico original (inline):
  <briefing guardado no Passo 4, na íntegra>

Avalie tom de voz, paleta/tipografia, pilar, mood/identidade visual contra brand/. Decisão binária.

Saída: parecer inline.
Status válidos: APROVADO | REPROVADO.
```

- **APROVADO** → seguir para 11c.
- **REPROVADO** → reabra a etapa apontada (em geral copy ou design) e re-rode 11a desde o início.

#### 11c. Compliance (`revisor-compliance`)

```
Tarefa: validar compliance do post pronto.

Inputs:
- Pasta do post: export/conteudos/<formato>/<data>-<slug>/

Varra saúde, jurídico, suplementação, promessas irreais. Decisão binária.

Saída: parecer inline.
Status válidos: APROVADO | REPROVADO.
```

- **APROVADO** → consolidar briefing institucional usando `templates/briefing.md` (sem variações A/B, sem rastros de processo) e gravar em `export/conteudos/<formato>/<data>-<slug>/briefing.md`. **Este é o último passo da curadoria.**
- **REPROVADO** → reabra `copy` ou `design` e re-rode 11a desde o início.

### 12. Salvar/descartar `_rascunho/` (pausa)

**Só executa quando `modo_estilo = "ad-hoc"`.** Em modo definido, pule para o Passo 13.

```
Estilo ad-hoc usado no post: templates/formatos/<formato>/estilos/_rascunho/

Quer salvar como estilo permanente?
- "salvar <slug-em-kebab-case>" → mantém pasta, renomeia.
- "descartar" → remove a pasta.
```

- **Salvar:** valide kebab-case (`^[a-z0-9-]+$`). Se já existir `templates/formatos/<formato>/estilos/<slug>/`, peça outro slug. Então `mv templates/formatos/<formato>/estilos/_rascunho/ templates/formatos/<formato>/estilos/<slug>/`.
- **Descartar:** `rm -rf templates/formatos/<formato>/estilos/_rascunho/`.

Registre o resultado para o Passo 13.

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
└── briefing.md
```

## Critério de conclusão

- A pasta `export/conteudos/<formato>/<data>-<slug>/` contém `pesquisa-base.md`, `copy.md`, `design/` com assets + `preview.html`, `export/` com PNGs e `briefing.md`.
- Quantidade de PNGs em `export/` é igual à de assets HTML em `design/`.
- `briefing.md` foi gerado por curadoria editorial com status APROVADO.
- Em modo ad-hoc, `_rascunho/` foi salvo com slug definitivo ou removido (não deve sobrar entre execuções).
- Usuário recebeu a mensagem final do Passo 13 com lista de PNGs e caminho do briefing.
