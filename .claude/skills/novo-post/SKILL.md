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

## Agentes

| Agente | Responsabilidade | Input | Output |
|---|---|---|---|
| `pesquisa-tendencias` | Scouting + pesquisa profunda | formato/estilos/tema parcial OU briefing | sugestão inline (scouting) OU `export/pesquisa/<data>-tendencias-<slug>.md` |
| `diretor-marca` | Briefing estratégico + curadoria editorial final | formato+estilo+tema (P3) OU pasta+briefing (P11) | briefing inline (P3) OU parecer + `briefing.md` (P11) |
| `treinador` | Prescrição técnica de treino | exercícios + objetivo + recorte | `treino.md` |
| `copywriter` | Copy do post | pesquisa + briefing (+ `treino.md`) | `copy.md` |
| `designer` | Assets HTML + preview consolidado | template visual + estilo.md + copy (+ `treino.md`) | `design/*.html` + `design/preview.html` |
| `curador-export` | Validação técnica + export PNG | `design/` + estilo.md | status inline + `export/*.png` |

## Pipeline

### 1. Parsear input

Liste `templates/formatos/` e `templates/formatos/<formato>/estilos/`. Tokenize a entrada: match com slug de estilo → estilo; resto → tema. Se formato ausente/inválido, pergunte ao usuário oferecendo a lista descoberta. Siga sempre para o Passo 2.

### 2. Confirmar plano (estilo existente ou ad-hoc; scouting de tema)

Se faltar **estilo**, pergunte ao usuário:

```
Estilo: nenhum definido.

Opções:
- Usar estilo existente: <lista de slugs de templates/formatos/<formato>/estilos/>
- Criar do zero (ad-hoc): anexe imagem de referência e/ou descreva o visual desejado
```

**Aguarde resposta.** Resolva uma das duas vias:

- **Slug existente escolhido** → `modo_estilo = "definido"`, `slug = <escolhido>`.
- **Ad-hoc** → `modo_estilo = "ad-hoc"`, colete:
  - `referencia_imagem` (caminho) — opcional
  - `referencia_descricao` (texto) — opcional
  - Ao menos um dos dois é obrigatório. Se nenhum, repita a pergunta.

Se faltar **tema**, acione `pesquisa-tendencias`:

```
Tarefa: sugerir tema para um post Instagram.
Profundidade: rápida / decisória.

Inputs:
- Formato: <formato>
- Estilo: <slug ou "ad-hoc — <descrição resumida>">
- Tema já definido: <texto ou "nenhum">

Saída inline (3-4 linhas): tema sugerido + motivo, ancorando em pilar/público/tendência.
```

Apresente o plano final:

```
Plano do post:
- Formato: <formato>
- Estilo: <slug existente> | ad-hoc (referência: <descrição resumida>)
- Tema: <tema>

Confirma? (responda "sim" para seguir, ou diga o que ajustar)
```

**Aguarde confirmação explícita ou ajuste** antes de seguir ao Passo 3.

### 3. Briefing estratégico

Acione `diretor-marca`:

```
Tarefa: produzir briefing estratégico para o post.

Inputs:
- Formato: <formato>
- Estilo: <slug>
- Tema: <tema>
- Data: <YYYY-MM-DD>

Avalie tema/formato/estilo contra o brand book; decida ângulo central; selecione 1 pilar; defina objetivo; descreva recorte de público; gere slug em kebab-case (2-5 palavras, captura o ângulo, não o tema bruto).

Preencha o esqueleto inline:

## Briefing estratégico
**Formato:** {formato}
**Estilo:** {slug}
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

### 4. Criar pasta do post

```bash
mkdir -p export/conteudos/<formato>/<data>-<slug>/{design,export}
```

### 5. Resolver inputs obrigatórios do estilo

**Se `modo_estilo = "ad-hoc"`:** pule este passo. Sem `estilo.md`, não há inputs obrigatórios a verificar.

Caso contrário, leia `templates/formatos/<formato>/estilos/<estilo>/estilo.md`. Se não declarar seção **"Inputs obrigatórios"**, pule. Caso contrário, por tipo de input:

- **Prescrição técnica de treino:**
  - Usuário forneceu exercícios + séries/reps → use direto, salve em `<pasta>/treino.md`.
  - Forneceu só exercícios → acione `treinador` (abaixo) e salve o output em `<pasta>/treino.md`.
  - Não forneceu nada → pergunte ao usuário. Não invente exercícios.
- **Outros tipos** → pergunte ao usuário.

Prompt do `treinador`:

```
Tarefa: definir séries × repetições por exercício.

Inputs:
- Lista de exercícios: <lista do usuário>
- Objetivo: <do briefing>
- Recorte de público: <do briefing>

Saída: inline no formato canônico do treinador.
```

### 6. Pesquisa profunda

Acione `pesquisa-tendencias`:

```
Tarefa: levantar matéria-prima profunda para a copy.
Profundidade: deep research (WebFetch nas fontes promissoras).

Inputs:
- Formato/Estilo/Tema: <formato> / <slug> / <tema>
- Pilar / Recorte / Sinalizações: <inline do briefing>

Foco: ângulos não-óbvios e contradições dentro do recorte; referências concretas com link; dados/citações verificáveis; mitos a quebrar.

Template: templates/pesquisa.md.
Saída: gravar em export/pesquisa/<data>-tendencias-<slug>.md.
```

### 7. Copy

Acione `copywriter`:

```
Tarefa: escrever copy do post seguindo o template estrutural.

Inputs:
- Pesquisa: export/pesquisa/<data>-tendencias-<slug>.md
- Briefing inline:
  - Pilar: <pilar>
  - Objetivo: <objetivo>
  - Ângulo central: <ângulo>
  - Recorte de público: <recorte>
  - Slug do post: <slug>
- Inputs técnicos (quando aplicável):
  export/conteudos/<formato>/<data>-<slug>/treino.md

Template: templates/formatos/<formato>/copy.md.
Saída: gravar em export/conteudos/<formato>/<data>-<slug>/copy.md.
```

Critério: arquivo gravado com a estrutura do template e variações nos pontos pedidos.

### 7.5. Pausa para revisão da copy

Mostre ao usuário o conteúdo de `copy.md`:

```
Copy gerada em export/conteudos/<formato>/<data>-<slug>/copy.md

--- início do copy ---
<conteúdo integral de copy.md>
--- fim do copy ---

Confirma? (responda "ok" para seguir ao design, ou descreva o ajuste)
```

**Aguarde resposta.** Se vier ajuste, re-acione o `copywriter` com o pedido inline (sem re-rodar pesquisa), aguarde nova gravação e reapresente. Repita até "ok". Se confirmado, siga ao Passo 8.

Prompt do `copywriter` em modo ajuste:

```
Tarefa: ajustar copy do post conforme pedido do usuário.

Inputs:
- Copy atual: export/conteudos/<formato>/<data>-<slug>/copy.md
- Pedido de ajuste: <texto do usuário>
- Briefing inline original: <briefing guardado no Passo 3>

Regras:
- Preserve estrutura do template e blocos que não foram pedidos para mudar.
- Aplique apenas o ajuste solicitado.

Saída: sobrescrever export/conteudos/<formato>/<data>-<slug>/copy.md.
```

### 8. Design (assets + preview consolidado)

Acione `designer` com as duas tarefas no mesmo prompt:

```
Tarefa 1 — produzir N assets visuais (um por bloco do copy).

Inputs:
- Regras inegociáveis: templates/formatos/README.md
- Guia visual:
  - Modo "definido":
    - Template visual: templates/formatos/<formato>/estilos/<estilo>/<arquivo HTML do estilo>
    - Descrição do estilo: templates/formatos/<formato>/estilos/<estilo>/estilo.md
  - Modo "ad-hoc":
    - Referência (imagem): <caminho ou "nenhuma">
    - Referência (descrição): <texto do usuário>
- Copy: export/conteudos/<formato>/<data>-<slug>/copy.md
- Inputs técnicos (se houver): export/conteudos/<formato>/<data>-<slug>/treino.md

Saída: um HTML standalone por bloco em design/, nome sequencial seguindo o padrão do template visual (slide-1.html, frame-1.html, ...).

Drop zones: data-bg-drop="full" se asset preenche tudo; data-bg-drop="<nome>" por zona fotográfica; não marcar se puramente tipográfico.

Tarefa 2 — consolidar em preview.html.

Inputs:
- Pasta dos assets: export/conteudos/<formato>/<data>-<slug>/design/
- Wrapper (VERBATIM, não altere CSS/JS): templates/wrappers/preview-wrapper.html

Regras:
- Substituir APENAS <!-- SLIDES_HERE --> por <section data-slide="N" style="width:{W}px;height:{H}px;"> para cada asset, contendo o <style> do <head> + o conteúdo do <body> (sem o wrapper <body>). W/H das dimensões do template visual. data-slide="N" obrigatório (o script de export usa).
- Atualizar APENAS o <title> para "Preview — <tema> (<estilo>)".

Saída: export/conteudos/<formato>/<data>-<slug>/design/preview.html.
```

### 9. Pausa para revisão do preview

Mostre ao usuário:

```
Design gerado em export/conteudos/<formato>/<data>-<slug>/design/ (estilo: <slug>):
- preview.html
- <assets individuais>

Opções:
- "exportar" → exporto o preview.html em disco como está.
- Anexe preview.html editado → sobrescrevo e exporto.
- Peça ajustes → repasso ao Designer.
```

**Aguarde resposta.** Se vier arquivo anexado, sobrescreva `design/preview.html`. Se vier pedido de ajuste, volte ao Passo 8 com o ponto específico. Se vier confirmação, siga para o Passo 10.

### 10. Validação e export

Snapshot da pesquisa na pasta do post:

```bash
cp -n export/pesquisa/<data>-tendencias-<slug>.md \
      export/conteudos/<formato>/<data>-<slug>/pesquisa-base.md
```

Acione `curador-export`:

```
Tarefa: validar assets e executar export para PNG.

Inputs:
- Pasta: export/conteudos/<formato>/<data>-<slug>/design/
- Estilo: templates/formatos/<formato>/estilos/<estilo>/estilo.md

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

Acione `diretor-marca`:

```
Tarefa: dar parecer editorial sobre o post pronto e, se aprovado, consolidar o briefing institucional.

Inputs:
- Pasta do post: export/conteudos/<formato>/<data>-<slug>/
  (pesquisa-base.md, copy.md, design/preview.html, design/*.html, export/*.png, treino.md quando aplicável)
- Briefing estratégico original (inline):
  <briefing guardado no Passo 3, na íntegra>

Avalie em 4 dimensões: alinhamento com brand book; coerência com briefing original (ângulo, pilar, objetivo, recorte); qualidade editorial (hook, 1 ideia por bloco, concreto > abstrato, CTA específico); integridade técnica (qtd. PNGs = qtd. assets; pesquisa-base.md presente).

Decida APROVADO ou REPROVADO.
- APROVADO: consolide o briefing institucional usando templates/briefing.md (sem variações A/B, sem rastros de processo) e grave em export/conteudos/<formato>/<data>-<slug>/briefing.md.
- REPROVADO: devolva parecer inline com arquivo + ponto + etapa a refazer. Não consolide.

Saída: parecer inline.
```

Em REPROVADO, reabra a etapa apontada, refaça e reentregue à curadoria. Repita até APROVADO.

### 12. Entregar ao usuário

```
Post pronto: export/conteudos/<formato>/<data>-<slug>/

- Formato: <formato>
- Estilo: <slug>
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
- Usuário recebeu a mensagem final do Passo 12 com lista de PNGs e caminho do briefing.
