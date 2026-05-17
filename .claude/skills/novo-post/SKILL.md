---
name: novo-post
description: Dispara o pipeline completo de criação de um post Instagram (formato definido pelo usuário entre os disponíveis em templates/formatos/). Sintaxe livre — só formato é obrigatório; estilo e tema são opcionais e podem vir em qualquer ordem. Orquestra pesquisa, briefing, copy, design, curadoria técnica e curadoria editorial. Uso - /novo-post <formato> [estilo] [tema]. Requer brand book preenchido.
---

# /novo-post

## Objetivo

Criar um post Instagram completo no formato pedido pelo usuário, do briefing à entrega de imagens prontas para publicação.

Esta skill **carrega o domínio "post"**: sabe quais etapas existem, em que ordem, com que agentes especialistas, com que templates de input/output, e onde gravar cada artefato. Os agentes acionados aqui são especialistas puros — eu descrevo cada tarefa autocontida e aponto os templates relevantes.

## Sintaxe

```
/novo-post <formato> [estilo] [tema...]
```

- **`<formato>`** — obrigatório. Slug de um diretório em `templates/formatos/` (descoberto em runtime).
- **`[estilo]`** — opcional. Slug de um diretório em `templates/formatos/<formato>/estilos/`. Se omitido, scouting + confirmação.
- **`[tema...]`** — opcional, texto livre. Se omitido, scouting + confirmação.

**Ordem é livre.** Cada token é interpretado: bate com formato → formato; bate com slug de estilo → estilo; o resto vira tema.

## Pré-requisitos

- Brand book preenchido em `brand/`. Se algum agente devolver `BRAND_BOOK_INCOMPLETO`, oriente o usuário a rodar `/brand-discovery` antes de seguir.
- Pelo menos um formato disponível em `templates/formatos/` com pelo menos um estilo (recomendado: estilo `padrao`).
- Puppeteer/Chromium instalado se o pipeline incluir export de imagem (`npm install` na raiz).

## Pipeline

### Passo 1 — Descobrir formatos e parsear input

1. **Liste formatos disponíveis**: `ls templates/formatos/` — filtre apenas diretórios. Se o usuário passou um token que bate com um deles, é o **formato**.
2. **Liste estilos do formato escolhido**: `ls templates/formatos/<formato>/estilos/` — filtre diretórios.
3. **Tokenize o resto da entrada**. Para cada token restante:
   - Bate (case-insensitive) com um slug de estilo? → é o **estilo**.
   - Senão → faz parte do **tema** (junte tokens restantes em ordem).
4. Se o formato é inválido ou ausente: pergunte ao usuário, oferecendo a lista descoberta de `templates/formatos/`.
5. **Resultado:**
   - `(a) estilo + tema definidos` → siga para Passo 3.
   - `(b) estilo definido, tema livre` → Passo 2 (scouting de tema).
   - `(c) tema definido, estilo livre` → Passo 2 (scouting de estilo).
   - `(d) ambos livres` → Passo 2 (scouting de estilo + tema).

### Passo 2 — Scouting (só se faltar estilo ou tema)

Acione `pesquisa-tendencias` com uma tarefa autocontida:

```
Tarefa: sugerir <estilo|tema|ambos> para um post Instagram.

Inputs:
- Formato: <formato>
- Estilos disponíveis: <lista de slugs lidos de templates/formatos/<formato>/estilos/>
- Estilo já definido: <slug ou "nenhum — sugerir">
- Tema já definido: <texto ou "nenhum — sugerir">

Profundidade esperada: rápido / decisório (sem deep research).

Saída: inline, 3-4 linhas no formato:
- Estilo sugerido: <slug> — <1 linha do porquê>
- Tema sugerido: <tema> — <1 linha do porquê>
- Contexto/justificativa: <2-3 linhas ancorando em pilar/público/tendência>
```

Receba o output. Apresente ao usuário:

```
Sugestão automática:
- Estilo: {slug} — {motivo}
- Tema: {tema} — {motivo}
- Por quê: {justificativa}

Posso seguir com isso? (responda "sim" / "ok" para continuar, ou diga o que ajustar)
```

**Aguarde confirmação explícita.**

### Passo 3 — Briefing estratégico

Acione `diretor-marca` com uma tarefa autocontida, embutindo o esqueleto do briefing:

```
Tarefa: produzir um briefing estratégico para um post.

Avalie o tema/formato/estilo abaixo contra o brand book completo, decida o
ângulo central, selecione 1 pilar, defina o objetivo estratégico, descreva o
recorte de público, e gere um slug em kebab-case que capture o ângulo (não o
tema bruto).

Inputs:
- Formato: <formato>
- Estilo: <slug>
- Tema: <tema confirmado>
- Data: <YYYY-MM-DD>

Template a seguir: preencha exatamente o esqueleto abaixo (saída inline em
markdown, sem salvar arquivo):

## Briefing estratégico

**Formato:** {formato}
**Estilo:** {slug}
**Tema:** {tema}
**Data:** {YYYY-MM-DD}

**Slug do post:** {kebab-case, 2-5 palavras, captura o ângulo}
**Pilar:** {pilar selecionado de pilares-conteudo.md}
**Objetivo:** {1 frase, específico — educar/posicionar/converter/etc.}
**Recorte de público:** {1-2 frases nomeando o leitor concreto}

**Ângulo central:** {1-2 frases — o recorte específico que torna o post único}

**Por que este recorte:**
{2-3 linhas conectando ângulo + pilar + público + formato escolhido.}

**Sinalizações para o pipeline:**
- {coisa específica que pesquisa deve buscar}
- {coisa específica de tom}
- {restrição/tabu}

Saída: inline (retornar o briefing preenchido).
```

Receba o briefing inline. **Mostre o briefing ao usuário** e prossiga (não pause salvo se o usuário interromper).

Extraia do briefing: **slug do post**, **pilar**, **objetivo**, **recorte de público**, **ângulo central**, **sinalizações para o pipeline**.

### Passo 4 — Criar pasta do post

Com slug do post resolvido no briefing:

```bash
mkdir -p export/conteudos/<formato>/<data>-<slug>/design
mkdir -p export/conteudos/<formato>/<data>-<slug>/export
```

### Passo 5 — Verificar inputs obrigatórios do estilo

Leia `templates/formatos/<formato>/estilos/<estilo>/estilo.md`. Procure por seção **"Inputs obrigatórios"**.

- **Sem seção / sem inputs obrigatórios** → pule para Passo 6.
- **Com inputs obrigatórios:**
  - Se o tipo de input for prescrição técnica de treino (ex: estilo `treino-dino`):
    - **Usuário forneceu exercícios + séries/reps no input?** → use diretamente.
    - **Usuário forneceu só exercícios?** → acione `treinador`:
      ```
      Tarefa: definir séries × repetições por exercício para a lista abaixo.

      Inputs:
      - Lista de exercícios: <lista do usuário>
      - Objetivo: <do briefing — geralmente hipertrofia, salvo outra indicação>
      - Público / recorte: <recorte de público do briefing>

      Saída: inline (texto no formato canônico do treinador).
      ```
      Após receber o output, salve em `<pasta>/treino.md`.
    - **Usuário não forneceu nem a lista?** → pergunte ao usuário antes de seguir. Não invente exercícios.
  - Outros tipos de input → pergunte ao usuário.

### Passo 6 — Pesquisa profunda

Acione `pesquisa-tendencias` com uma tarefa autocontida:

```
Tarefa: levantar matéria-prima profunda que sustente a copy de um post.

Inputs:
- Formato: <formato>
- Estilo: <slug>
- Tema: <tema>
- Pilar de conteúdo: <pilar do briefing>
- Recorte de público: <recorte do briefing>
- Sinalizações do briefing: <copiar inline>

Profundidade esperada: profundo / estratégico (10-15 min de trabalho,
WebFetch em 2-3 fontes promissoras).

Foco do levantamento (definido pelo domínio "post"):
- Ângulos não-óbvios e contradições no tema dentro do recorte.
- Referências concretas (posts/criadores/marcas) com link.
- Dados/citações verificáveis.
- Espaços em branco / mitos a quebrar.

Template a seguir: templates/pesquisa.md (preencha as seções declaradas lá).

Saída: gravar em export/pesquisa/<data>-tendencias-<slug-do-post>.md.
```

Critério de aprovação: arquivo gravado com os blocos do template preenchidos. Se output vazio/inconsistente, devolva ao agente pedindo refazer.

### Passo 7 — Copy

Acione `copywriter` com uma tarefa autocontida:

```
Tarefa: escrever copy de um post seguindo o template estrutural apontado.

Inputs:
- Caminho da pesquisa: export/pesquisa/<data>-tendencias-<slug-do-post>.md
- Briefing estratégico (inline):
  - Pilar: <pilar>
  - Objetivo: <objetivo>
  - Ângulo central: <ângulo>
  - Recorte de público: <recorte>
  - Slug do post: <slug>
- Caminho de inputs técnicos obrigatórios (quando aplicável):
  export/conteudos/<formato>/<data>-<slug-do-post>/treino.md

Template a seguir: templates/formatos/<formato>/copy.md (define quantos blocos,
função de cada bloco, variações pedidas em capa/CTA, limites de palavras).

Saída: gravar em export/conteudos/<formato>/<data>-<slug-do-post>/copy.md.
```

Critério de aprovação: arquivo gravado com a estrutura do template, variações nos pontos pedidos pelo template.

### Passo 8 — Design

Esta etapa tem duas tarefas para o `designer`. Envie ambas no mesmo prompt para que o agente faça em sequência:

```
Tarefa 1: produzir os N assets visuais de um post, um por bloco do copy.

Inputs:
- Caminho do template visual do estilo:
  templates/formatos/<formato>/estilos/<estilo>/<arquivo HTML do estilo>
  (lê as dimensões, variantes e áreas de conteúdo declaradas dentro dele)
- Caminho da descrição do estilo:
  templates/formatos/<formato>/estilos/<estilo>/estilo.md
- Caminho do copy:
  export/conteudos/<formato>/<data>-<slug-do-post>/copy.md
- Caminho de inputs obrigatórios (quando aplicável):
  export/conteudos/<formato>/<data>-<slug-do-post>/treino.md

Saída: gravar um arquivo HTML standalone por bloco do copy em
export/conteudos/<formato>/<data>-<slug-do-post>/design/, com nome
sequencial (slide-1.html, slide-2.html, ... ou frame-1.html, frame-2.html, ...
seguindo o padrão de nome do arquivo do template visual).

---

Tarefa 2: consolidar os assets em um preview único usando o wrapper apontado.

Inputs:
- Pasta de origem dos assets: export/conteudos/<formato>/<data>-<slug-do-post>/design/
- Caminho do wrapper de consolidação: templates/wrappers/preview-wrapper.html
  (use VERBATIM — leia o arquivo, não altere CSS nem JS).

Regras da consolidação:
- Substitua APENAS o comentário <!-- SLIDES_HERE --> pelo conjunto de <section>,
  uma por asset, no formato:
    <section data-slide="N" style="width:{W}px;height:{H}px;">
      <style>/* copiado do <head><style> do asset-N.html */</style>
      <!-- copiado do <body> do asset-N.html (sem o wrapper <body>) -->
    </section>
  Onde {W} e {H} são as dimensões declaradas no template visual do estilo.
- Atualize APENAS o <title> para "Preview — <tema> (<estilo>)".
- O atributo data-slide="N" é obrigatório — o script de export usa para extrair cada bloco.

Drop zones (responsabilidade do designer ao marcar os assets):
- Se um asset preenche o espaço todo (sem coluna fotográfica dedicada) →
  marque a raiz da section com data-bg-drop="full".
- Se um asset é dividido em zonas fotográficas → marque cada zona com
  data-bg-drop="<nome>".
- Asset puramente tipográfico por escolha (sem intenção de foto) → não marque.

Saída: gravar em export/conteudos/<formato>/<data>-<slug-do-post>/design/preview.html.
```

Critério de aprovação: N arquivos HTML por bloco + `preview.html` consolidado com o wrapper preservado verbatim.

### Passo 9 — Pausa para revisão do preview

**Pare e mostre ao usuário:**

```
Design gerado em export/conteudos/<formato>/<data>-<slug-do-post>/design/ (estilo: <slug>):
- preview.html  ← carrossel arrastável estilo Instagram (1 asset por vez)
- <assets individuais HTML>

No preview.html (abra no Claude Design web):
- Navegue com setas, dots, teclado (← →) ou arraste do mouse
- Arraste imagens do desktop para dentro de qualquer asset → vira fundo
- Depois de dropar uma imagem, arraste dentro dela para ajustar o foco

Quando estiver satisfeito, escolha uma das opções:
- responda "exportar" → eu exporto direto do preview.html atual em disco
- anexe o preview.html editado aqui no chat → eu sobrescrevo o arquivo e exporto
```

**Aguarde confirmação explícita** ("exportar", "ok", "pode exportar", "continua") OU o arquivo anexado.

**Se o usuário anexar `preview.html` no chat:**
- Leia o conteúdo do arquivo anexado.
- Sobrescreva `export/conteudos/<formato>/<data>-<slug-do-post>/design/preview.html`.
- Prossiga para o Passo 10.

**Se o usuário só responder "exportar":** o script de export lê o `preview.html` em disco como está.

**Se o usuário pedir ajustes via chat:** volte ao Passo 8, repasse os ajustes específicos ao Designer, reapresente o preview e aguarde nova confirmação.

### Passo 10 — Pacote técnico (validação + export)

Antes de acionar o curador, snapshot da pesquisa na pasta do post (se ainda não estiver lá):

```bash
cp -n export/pesquisa/<data>-tendencias-<slug-do-post>.md \
      export/conteudos/<formato>/<data>-<slug-do-post>/pesquisa-base.md
```

Acione `curador-export` com uma tarefa autocontida:

```
Tarefa: validar os assets de design contra os tokens da marca e o estilo em
uso, e em seguida executar o export para imagem.

Inputs:
- Pasta dos artefatos a validar:
  export/conteudos/<formato>/<data>-<slug-do-post>/design/
- Caminho do estilo.md em uso:
  templates/formatos/<formato>/estilos/<estilo>/estilo.md

Critérios adicionais de validação:
- Cada asset HTML respeita as dimensões declaradas no template do estilo.
- Tipografia e paleta dentro do declarado em brand/referencias-visuais.md e/ou
  cores extras autorizadas pelo estilo.md (se houver).
- Sem JavaScript em assets individuais (JS só no wrapper do preview).
- preview.html existe e tem section[data-slide="N"] para cada asset.

Comando de export:
  node scripts/export-png.js export/conteudos/<formato>/<data>-<slug-do-post>/

Após export, verificar que a quantidade de PNGs em
export/conteudos/<formato>/<data>-<slug-do-post>/export/ é igual ao número
de assets HTML em design/, e fazer inspeção visual rápida (capa + último asset).

Saída: inline com status, lista de PNGs gerados, observações técnicas.
```

Se devolver erro técnico:
- `VALIDACAO_TECNICA_FALHOU` → volte ao Designer com o ponto a corrigir.
- `EXPORT_FALHOU` ou `DEPENDENCIA_AUSENTE` → resolva e re-rode.

### Passo 11 — Curadoria editorial final

Acione `diretor-marca` com uma tarefa autocontida, apontando o template do briefing institucional:

```
Tarefa: dar parecer editorial sobre um post pronto contra o brand book e o
briefing estratégico original. Se aprovado, consolidar o briefing institucional
final no template apontado.

Inputs:
- Pasta do post: export/conteudos/<formato>/<data>-<slug-do-post>/
  Contém: pesquisa-base.md, copy.md, design/preview.html, design/*.html,
  export/*.png, e treino.md (quando aplicável).
- Briefing estratégico original (inline):
  <cole aqui o briefing recebido no Passo 3, na íntegra>

Avalie em 4 dimensões:
(i) alinhamento com brand book (tom, vocabulário, identidade visual),
(ii) coerência com briefing estratégico (ângulo, pilar, objetivo, recorte),
(iii) qualidade editorial (hook, 1 ideia por bloco, concreto > abstrato, CTA específico, sem furo lógico),
(iv) integridade técnica (quantidade de PNGs = quantidade de assets HTML; pesquisa-base.md presente).

Decida:
- APROVADO → consolidar o briefing institucional final no caminho abaixo.
- REPROVADO COM AJUSTE PONTUAL → devolver parecer com arquivo + ponto. Não consolidar.
- REPROVADO POR DESVIO SÉRIO → devolver parecer detalhado pedindo refazer etapa específica. Não consolidar.

Template a seguir (quando aprovado):
templates/briefing.md (preencha sem variações A/B — escolha uma; sem rastros
de processo; documento pronto para quem vai publicar).

Saída: inline com parecer (Status, pontos avaliados, decisões de curadoria).
Quando aprovado, gravar também em
export/conteudos/<formato>/<data>-<slug-do-post>/briefing.md.
```

Resultados:
- **APROVADO** → Diretor salvou `briefing.md`. Siga para Passo 12.
- **REPROVADO** → leia o parecer, reabra a etapa apontada, refaça e reentregue à curadoria. Repita até aprovação.

### Passo 12 — Entrega

Apresente:

```
Post pronto: export/conteudos/<formato>/<data>-<slug-do-post>/

- Formato: <formato>
- Estilo: <slug>
- Tema: <tema>

Entregue (3 bullets do parecer da curadoria):
- {bullet 1}
- {bullet 2}
- {bullet 3}

Imagens prontas para upload em export/:
- <lista de PNGs>

Briefing institucional: export/conteudos/<formato>/<data>-<slug-do-post>/briefing.md
```

## Tratamento de erros propagados pelos agentes

| Erro recebido | Ação |
|---|---|
| `BRAND_BOOK_INCOMPLETO` | Pare, oriente o usuário: "O brand book ainda não está completo. Rode `/brand-discovery` antes de gerar conteúdo." |
| `INPUT_INSUFICIENTE — X` | Verifique o que ficou faltando no prompt; complete e re-acione. |
| `TEMA_FORA_DE_PILAR` | Mostre ao usuário o que o Diretor recusou; peça ajuste de tema ou justificativa. |
| `PESQUISA_SEM_ANGULO` | Reacione `pesquisa-tendencias` pedindo refazer com foco em ângulos. |
| `VALIDACAO_TECNICA_FALHOU` | Reacione o Designer no ponto apontado. |
| `EXPORT_FALHOU` | Investigue (dependência, espaço em disco, HTML quebrado); resolva e re-rode. |
| `ESTILO_NAO_ACOMODA` | Avise o usuário; ofereça trocar o estilo ou ajustar a mensagem. |

## Critérios de aprovação entre etapas — resumo

| Etapa | Como aprovar |
|---|---|
| Scouting (Passo 2) | Usuário confirma explicitamente |
| Briefing (Passo 3) | Diretor entregou todos os campos do esqueleto; siga sem pausa |
| Inputs obrigatórios (Passo 5) | Insumo técnico fornecido ou prescrito antes de pesquisa |
| Pesquisa (Passo 6) | Arquivo salvo seguindo `templates/pesquisa.md` |
| Copy (Passo 7) | Arquivo salvo seguindo `templates/formatos/<formato>/copy.md` |
| Design (Passo 8) | Assets individuais + `preview.html` consolidado, validados |
| Preview (Passo 9) | Usuário confirma explicitamente |
| Pacote técnico (Passo 10) | Status do Curador OK, PNGs gerados |
| Curadoria editorial (Passo 11) | Diretor retorna APROVADO + `briefing.md` salvo |

## Formato do entregável final

```
export/conteudos/<formato>/<data>-<slug-do-post>/
├── pesquisa-base.md            ← snapshot da pesquisa
├── copy.md                     ← copy final
├── treino.md                   ← inputs técnicos (quando aplicável)
├── design/
│   ├── <assets HTML individuais>
│   └── preview.html
├── export/
│   └── <imagens PNG>
└── briefing.md                 ← briefing institucional aprovado
```

## O que esta skill NÃO faz

- Não publica no Instagram (gera imagens, não faz upload).
- Não pula validação técnica nem curadoria editorial.
- Não inventa inputs técnicos quando o estilo exige prescrição.
- Não suporta formatos fora de `templates/formatos/` (para adicionar, use `/novo-estilo` ou crie diretório manualmente seguindo `templates/formatos/README.md`).
