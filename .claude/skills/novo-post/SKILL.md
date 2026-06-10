---
name: novo-post
description: Dispara o pipeline completo de criação de um post Instagram (formato definido pelo usuário entre os disponíveis em templates/social-media/). Sintaxe livre — só formato é obrigatório; estilo e tema são opcionais e podem vir em qualquer ordem. Orquestra pesquisa, briefing inline, copy inline, design inline, export e gate de marca. Uso - /novo-post <formato> [estilo] [tema]. Requer brand book preenchido. Aceita briefing pré-pronto vindo da pauta semanal como input opcional.
---

# /novo-post

Cria um post Instagram completo no formato pedido, do briefing à entrega das imagens.

## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ parse input | input bruto | — | formato/estilo/tema/briefing/auto |
| 2 | ⚙ frescor de mercado | — | 1 | dispara /pesquisar-mercado se stale |
| 3 | pesquisador (Fase B, condic.) + ⏸ | formato, contexto | 2 | tema escolhido |
| 4 | ⚙ estilo + plano (inline) + ⏸ | tema, estilos | 3 | estilo definido ou _rascunho/ |
| 5 | ⚙ briefing (inline ou pré-pronto) + criar pasta | contexto, tema, estilo | 4 | ângulo/pilar/objetivo/slug/verdade + pasta |
| 6 | ⚙ resolver inputs do estilo (condic.) | estilo.md | 5 | treino.md |
| 7 | /pesquisar-tema | briefing ← 5 | 6 | pesquisa gravada |
| 8 | ⚙ copy (inline) + ⏸ | pesquisa ← 7 | 7 | copy.md |
| 9 | ⚙ design (inline) + Editor + ⏸ | copy ← 8, estilo.md | 8 | slide-N.html |
| 10 | ⚙ export-png.js | slide-N.html ← 9 | 9 | PNGs |
| 11 | revisor-brand (gate) | copy + pasta ← 10 | 10 | APROVADO/REPROVADO |
| 12 | ⚙ entregar | tudo ← 11 | 11 | entrega |
| 13 | ⚙ write-back registro-angulos | ângulo+verdade+pilar ← 5 | 11 | linha no registro |
| 14 | ⚙ publicação (opcional, gated) | pasta ← 11 | 12 | publicado/pendente |

## Sintaxe

```
/novo-post <formato> [estilo] [tema...]
/novo-post <formato> [estilo] --briefing <caminho/briefing-pre-pronto.md>
```

- **`<formato>`** — obrigatório. Slug de diretório em `templates/social-media/`.
- **`[estilo]`** — opcional. Slug em `templates/social-media/<formato>/estilos/`.
- **`[tema...]`** — opcional, texto livre.
- **`--briefing <caminho>`** — opcional. Caminho para um briefing pré-pronto (ex: vindo de `/planejar-pauta-semanal`). Quando presente, ativa `modo_briefing = "pre-pronto"`: pula scouting (Passo 3) e decisão de briefing inline (parte do Passo 5), usando ângulo/pilar/estilo já definidos.
- Ordem livre. Tokens são interpretados por correspondência com slugs; o resto vira tema.

## Pré-requisitos

- Puppeteer/Chromium instalado (`npm install` na raiz).
- Se `revisor-brand` devolver `BRAND_BOOK_INCOMPLETO`, propague ao usuário e oriente a rodar `/brand-discovery` antes.

## Princípio central

A skill executa produção inline (briefing, copy, design — sem subagentes) e delega pesquisa às skills `/pesquisar-mercado` (Fase A) e `/pesquisar-tema` (deep research). A Fase B (seleção de candidatos) fica inline por ser decisória e acoplada à produção. Agentes externos (`treinador`, `revisor-brand`, `arquivista`) entram quando têm função geral no sistema.

**Estrutura de copy é propriedade do estilo, não do formato.** Cada `estilo.md` carrega `## Estrutura` com blocos declarativos. Em ad-hoc, cria-se um estilo temporário em `_rascunho/` **antes** da copy, para o pipeline rodar sobre um estilo concreto.

Regras globais (fonte única, não repetir por passo):
- **Drop zones e dimensões:** ver `brand/social-media.md`. Backgrounds com intenção fotográfica = sempre drop zone (`data-bg-drop="<nome>"`); não marcar elementos puramente tipográficos ou placeholders técnicos (ex: chroma).
- **Sem `preview.html`.** Preview de design = Dino Editor (carrossel) ou export→PNG (stories).
- **`export-png.js` valida sozinho** dimensões e contagem; em falha, corrigir o arquivo apontado e re-rodar.

## Modo autônomo (`--auto`)

`modo_auto = true` só é válido junto de `--briefing` pré-pronto (execução por routine), o que já pula scouting e decisão de briefing inline. O pipeline roda **sem nenhuma pausa humana** e **nunca publica**:

- **Passo 8 (copy):** gera e segue **sem** a pausa de revisão.
- **Passo 9 (design):** **não sobe o editor**; usa os `slide-N.html` gerados direto → export. Fotos: se a campanha apontar banco, o sub-passo *Fotos do banco* (`arquivista`) pré-preenche; sem banco, segue com placeholders. O sub-passo *Aprendizado de estilo* é **pulado** (sem `edits.json`).
- **Passo 11 (gate `revisor-brand`):** **permanece**. Se REPROVADO: 1 retry; 2º fracasso → marca a tarefa como `falhou-gate` no `status.yaml` da campanha e **encerra sem entregar**.
- **Passo 12 (entrega):** sub-passos *stories* e *captura de fonte* **pulados**; *rascunho* é N/A (estilo definido).
- **Passo 14 (publicação):** **nunca executa**. Ao concluir o gate APROVADO, atualiza a tarefa no `status.yaml` para `aguardando-publicacao` (+ entrada em `aprovacoes_pendentes`, canal `dashboard`) e encerra. Publicação é sempre aprovação humana no dashboard.

Erro de execução em qualquer passo `--auto` → marca a tarefa como `falhou-auto` e encerra. Modo interativo (sem `--auto`) é inalterado.

---

## Pipeline

### 1. Parsear input

Lê: templates/social-media/ (formatos + estilos disponíveis)

Liste `templates/social-media/` e `templates/social-media/<formato>/estilos/`. Tokenize a entrada: match com slug de estilo → estilo; `--briefing <caminho>` → `briefing_path`; resto → tema. Se formato ausente/inválido, pergunte ao usuário oferecendo a lista descoberta. Siga sempre para o Passo 2.

- `--auto` → `modo_auto = true`. Só válido junto de `--briefing`. Sem `--briefing`, ignore `--auto` e siga interativo.
- Se `briefing_path` presente: leia o arquivo e extraia `Formato`, `Estilo`, `Tema`, `Ângulo central`, `Pilar`, `Objetivo`, `Recorte de público`, `Slug do post`, `Verdade` (campo `verdade: <slug>`, gravado pelo `/planejar-pauta-semanal`). Com `Verdade` presente → `verdade_servida = <slug>`; ausente → `verdade_servida = neutro`. Esses valores substituem tema/estilo do input textual. Marque `modo_briefing = "pre-pronto"`: pule o Passo 3 e a decisão de briefing inline do Passo 5.

### 2. Frescor da inteligência de mercado

Lê: — (Ramon, mercado e registro-angulos são lidos no Passo 3 e no Passo 5; aqui só se garante que a inteligência de mercado esteja fresca antes do scouting).

```bash
f="memory/mercado/tendencias/$(date +%Y-%m).md"
if [ -f "$f" ] && [ -z "$(find "$f" -mtime +14 2>/dev/null)" ]; then echo "FRESCO"; else echo "STALE"; fi
```

Se STALE, avise ("Atualizando inteligência de mercado…") e invoque:

```
/pesquisar-mercado --mes <YYYY-MM>
```

`/pesquisar-mercado` aciona o `pesquisador-mercado` (Fase A) e grava `memory/mercado/tendencias/<YYYY-MM>.md`, `memory/mercado/concorrentes/<slug>.md` e `memory/publico/`. Prompt do agente e metodologia de scouting vivem nessa skill (fonte única). Se FRESCO, pule.

### 3. Tema — scouting ranqueado (⏸)

Lê: `ramon/contexto` · `performance/registro-angulos` · `mercado/tendencias/<mês>` (repassados ao pesquisador).

- **Tema veio no input** (ou `modo_briefing = "pre-pronto"`) → usa direto, pula o scouting, vai ao Passo 4.
- **Sem tema** → acione `pesquisador-mercado` (Fase B):

```
Tarefa: seleção de candidatos (Fase B — ranqueamento).

Inputs:
- Formato: <formato>
- Estilo: <slug se veio no input, senão "ainda não definido">
- Contexto Ramon: memory/ramon/contexto.md (leia — considere fase atual e cronograma)
- Ângulos queimados: memory/performance/registro-angulos.md (ângulo com data+descanso ainda futuro = não repetir)
- Tendências do mês: memory/mercado/tendencias/<YYYY-MM>.md
- Quantidade de candidatos: 3-5

Saída inline: candidatos ranqueados (ângulo + pilar + sustentação + potencial), do maior para o menor potencial.
```

Apresente e pause (⏸):

```
Candidatos (ranqueados por potencial):
<lista do agente>

Responda:
- <número> → escolhe o candidato
- "mais"   → re-ranqueia / traz outros
- ajuste em texto livre
- ou dê seu próprio tema (bypass — sua escolha vence)
```

A escolha define `tema`. **Guarde o candidato escolhido + a lista ranqueada** (usados no Passo 5). Se "mais"/ajuste, re-acione o modo seleção e reapresente. **Aguarde escolha explícita** antes do Passo 4.

### 4. Estilo + plano (⏸)

Lê: estilo.md (## Quando usar / ## Quando NÃO usar) de cada estilo

- **Estilo veio no input** → `modo_estilo = "definido"`, `slug = <escolhido>`. Mostre o plano e pause.
- **Sem estilo** → leia `## Quando usar` / `## Quando NÃO usar` de cada `estilo.md` em `templates/social-media/<formato>/estilos/` (exceto `_rascunho`) e decida inline qual serve melhor para o tema. Se nenhum couber, recomende "ad-hoc".

Apresente o plano (⏸):

```
Plano do post:
- Formato: <formato>
- Tema: <tema>
- Estilo: <slug existente> | ad-hoc (referência: <descrição resumida>)
- Motivo: <1-2 frases ancorando tema vs. estilo>

Responda:
- "sim" / "ok" → segue com este plano
- "<outro-slug>" → troca para esse estilo
- "ad-hoc" → cria estilo novo (anexe imagem de referência e/ou descreva o visual)
- qualquer ajuste em texto livre
```

Se vier `ad-hoc` (ou a recomendação inline foi ad-hoc), `modo_estilo = "ad-hoc"`; colete `referencia_imagem` (caminho) e/ou `referencia_descricao` (texto) — ao menos um obrigatório; se nenhum, repita a pergunta. **Aguarde confirmação explícita ou ajuste** antes de seguir.

- **Criar estilo ad-hoc em `_rascunho/` (condic., ⏸)** — só quando `modo_estilo = "ad-hoc"`:

  ```bash
  mkdir -p templates/social-media/<formato>/estilos/_rascunho/
  ```

  Se `_rascunho/` já existir, pergunte antes de sobrescrever (sobrescrever / continuar do rascunho atual / abortar). Crie `estilo.md` + `slide.html` inline seguindo `templates/estilo.md` (contrato canônico), `brand/referencias-visuais.md` (tokens), `brand/social-media.md` (dimensões/chrome) e as referências do usuário (DNA visual). Referências fotográficas são guia de mood/composição/tratamento — NUNCA conteúdo final. Declare drop zones nos campos `[bg]`/`[slots]` de cada bloco da `## Estrutura`; conteúdo dos blocos é PLACEHOLDER ("TÍTULO DE EXEMPLO", "FRASE — MÁX 12 PALAVRAS"). Pause (⏸):

  ```
  Rascunho do estilo ad-hoc em templates/social-media/<formato>/estilos/_rascunho/
  - estilo.md
  - slide.html (ou frame.html)

  Para revisar o visual:
    node scripts/export-png.js <qualquer pasta de post com design/> --format=<formato>

  Confirma? ("ok" para seguir ao briefing, ou descreva o ajuste)
  ```

  Se vier ajuste, edite os arquivos em `_rascunho/` inline. Repita até "ok".

### 5. Briefing estratégico + criar pasta

Lê: `brand-book (§Verdades)` · `pilares-conteudo` · `ramon/contexto` · `performance/registro-angulos` · `mercado/tendencias/<mês>` · `estilo.md (§Conceito + #### editorial)`.

- **`modo_briefing = "pre-pronto"`** → pule a decisão; os campos já vieram do Passo 1 (incluindo `verdade_servida`).
- **Caso contrário** → com base nas leituras acima e no tema/candidatos escolhidos, fixe:
  - **Ângulo central** — ponto de vista específico que diferencia (não o tema bruto).
  - **Pilar** — de `brand/pilares-conteudo.md`; apenas 1.
  - **Objetivo** — 1 frase específica do que o post deve fazer no leitor.
  - **Recorte de público** — 1-2 frases do segmento específico dentro do público-alvo.
  - **Slug do post** — kebab-case (2-5 palavras capturando o ângulo, não o tema bruto).
  - **Verdade servida** — slug do `## Verdades` que o ângulo acende; `neutro` se nenhuma. Guarde como `verdade_servida`.
  - **Sinalizações** — pesquisa necessária? tom específico? restrições/tabus?

**Guarde esses campos** — usados no Passo 8 (copy), Passo 11 (gate + `briefing.md`) e Passo 13 (write-back). Em seguida, crie a pasta do post:

```bash
mkdir -p export/conteudos/<formato>/<data>-<slug>/{design,export}
```

### 6. Resolver inputs do estilo (condic.)

Lê: `estilo.md` apontado pelo briefing. Se declarar `## Inputs obrigatórios externos`, resolva por tipo:

- **Prescrição técnica de treino:**
  - Usuário forneceu exercícios + séries/reps → use direto, salve em `<pasta>/treino.md`.
  - Forneceu só exercícios → acione `treinador` (abaixo), salve o output em `<pasta>/treino.md`.
  - Não forneceu nada → pergunte ao usuário. Não invente exercícios.
- **Outros tipos** → pergunte ao usuário.

Se o estilo não declarar `## Inputs obrigatórios externos`, pule.

- **Treino (`treinador`):**

  ```
  Tarefa: definir séries × repetições por exercício.

  Inputs:
  - Lista de exercícios: <lista do usuário>
  - Objetivo: <do briefing>
  - Recorte de público: <do briefing>

  Saída: inline no formato canônico do treinador.
  ```

### 7. Pesquisa profunda

#### Pesquisa

Lê: — (delegado a `/pesquisar-tema`, que lê `memory/mercado/`).

Execute **para todo post** — a pesquisa é fonte de criatividade, não só de fato (inclusive em Mentalidade). Profundidade e fontes vêm do **perfil do pilar** do briefing, resolvido pela `/pesquisar-tema`:

```
/pesquisar-tema <tema> --pilar <pilar do briefing> --recorte <recorte do briefing>
```

`/pesquisar-tema` resolve o perfil pelo `--pilar` (ver `## Perfis de fonte por pilar` na skill), aciona o `pesquisador-mercado` (deep research) e grava `memory/pesquisa/<data>-tendencias-<slug>.md` — o arquivo que o Passo 8 lê. Cache vale: se a slug já existe, pula. Prompt do agente, template e metodologia vivem em `/pesquisar-tema` (fonte única).

### 8. Copy (⏸)

Lê: `estilo.md §editorial` (função, tom, [entregar], [ab] de cada bloco) · `tom-de-voz` · `publico-alvo` · pesquisa do post (`memory/pesquisa/<data>-tendencias-<slug>.md`) · `treino.md` (se existir) · biblioteca (`memory/biblioteca/_indice.md` → filtre por **pilar+tema** do briefing, abra **só 1-2 fichas** `memory/biblioteca/fontes/<slug>.md`, use os trechos curados como matéria-prima, sem cópia literal, respeitando `Off-limits`; nunca leia a biblioteca inteira; guarde os `slug` usados para o sub-passo *Captura de fonte* do Passo 12).

Escreva a copy seguindo **exatamente** os campos `#### editorial` de cada bloco do estilo, bloco por bloco, respeitando limites de palavras de `[entregar]`. Grave em `export/conteudos/<formato>/<data>-<slug>/copy.md`. Pause (⏸):

```
Copy gerada em export/conteudos/<formato>/<data>-<slug>/copy.md

--- início do copy ---
<conteúdo integral de copy.md>
--- fim do copy ---

Confirma? (responda "ok" para seguir ao design, ou descreva o ajuste)
```

**Aguarde resposta.** Se vier ajuste, edite `copy.md` inline (sem re-rodar pesquisa) e reapresente. Repita até "ok".

### 9. Design (⏸)

Lê: `estilo.md §visual` (classe, bg, overlay, layout, alternância, slots, tokens de cada bloco) · `slide.html` (ou `frame.html`) do estilo · `referencias-visuais` · `social-media` · `copy.md` (+ `treino.md` se existir).

Para cada bloco da `## Estrutura` do estilo, gere um `slide-N.html` em `design/`, nome sequencial. Aplique a copy do bloco correspondente aos slots `[slots]`/`[entregar]`. Para blocos N-dinâmico com `[alternância]`, aplique a variante A (ímpar) ou B (par) conforme a posição na sequência. Cada slide é HTML standalone com `data-block` e `data-slot` nos elementos; respeite drop zones (`[bg]`/`[slots]`; `data-bg-drop="full"` quando o asset preenche tudo, `data-bg-drop="<nome>"` por zona). Saída: `design/slide-1.html`, `design/slide-2.html`, … (um por bloco).

- **Fotos do banco (condic.)** — carregue `orquestracao/banco-imagens.yaml` (`drive.pasta_raiz_id`).
  - `pasta_raiz_id` **vazio** → pule; o usuário dropa fotos manualmente no Editor (sem erro).
  - MCP do Drive indisponível → avise ("banco de imagens indisponível; siga dropando manual") e continue (a entrega nunca trava).
  - Caso contrário, acione `arquivista`:

    ```
    Tarefa: indexar (lazy) e depois selecionar.

    Inputs:
    - canal: instagram
    - Pasta-raiz do Drive: <pasta_raiz_id de banco-imagens.yaml>
    - copy.md: export/conteudos/<formato>/<data>-<slug>/copy.md
    - estilo.md: <caminho do estilo.md>
    - Pasta do post: export/conteudos/<formato>/<data>-<slug>/

    Saída: design/suggestions.json com a melhor imagem DISPONÍVEL NO CANAL instagram por drop zone.
    ```

#### Subir o Dino Editor

Pausa de revisão e edição (⏸). **A skill sobe o backend do editor automaticamente** — o usuário nunca roda o backend. Antes de apresentar a pausa, execute:

```bash
lsof -ti tcp:4321 | xargs kill -9 2>/dev/null; \
npm run editor -- export/conteudos/<formato>/<data>-<slug> \
  --estilo <caminho do estilo.md> > /tmp/dino-editor.log 2>&1 &
```

Aguarde ~3s e confirme saúde (`curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/` → `200`). Só então apresente:

```
Design gerado em export/conteudos/<formato>/<data>-<slug>/design/ (estilo: <slug | ad-hoc>):
- <slides individuais: slide-1.html, slide-2.html...>

O Dino Editor já está no ar: abra http://localhost:4321 no navegador.

Edite no canvas, clique "Salvar" (grava slide-N.html + edits.json). Quando pronto, clique "Exportar" ou use:

  node scripts/export-png.js export/conteudos/<formato>/<data>-<slug>/

Opções de resposta:
- "ok" / "exportei" → sigo para a revisão de marca.
- Peça ajustes visuais → edito os slides inline e reapresento.
```

**Aguarde resposta.** Edições visuais são feitas pelo usuário no Editor (zero token). Se pedir ajuste inline explícito, edite o slide apontado. Quando confirmar, avalie o sub-passo de aprendizado.

#### Aprendizado de estilo

Condicional. Após o usuário salvar no editor, leia `export/conteudos/<formato>/<data>-<slug>/design/edits.json` se existir e rode a extração:

```bash
node -e '
import("./scripts/editor/extract-structural.js").then(async (m) => {
  const fs = await import("node:fs");
  const p = "export/conteudos/<formato>/<data>-<slug>/design/edits.json";
  if (!fs.existsSync(p)) { console.log(JSON.stringify({hasStructural:false})); return; }
  console.log(JSON.stringify(m.extractStructural(JSON.parse(fs.readFileSync(p,"utf8")))));
});
'
```

Se `hasStructural` for `false` (ou o arquivo não existir), **pule** sem mensagem. Se `true`, **pause** e apresente (⏸):

```
Detectei mudanças estruturais no estilo '<estilo>':
<para cada bloco em byBlock>
- bloco <block>: <lines unidas por " · ">

Promover ao estilo.md? Isso atualiza o estilo para posts futuros.
- "tudo"            → promove todos os deltas
- "<bloco/slot>"    → promove só os escolhidos
- "não"             → fica só neste post (estilo intacto)
```

**Aguarde resposta** (default = fica local). Se "não", siga sem alterar o estilo. Se "tudo"/seleção, edite `estilo.md` e `slide.html` do estilo **inline**, aplicando cada delta nos dois arquivos atomicamente conforme a variante de posição. Delta não mapeável → reporte o problemático e siga com os demais.

### 10. Export PNG

Snapshot da pesquisa na pasta do post e export:

```bash
cp -n memory/pesquisa/<data>-tendencias-<slug>.md \
      export/conteudos/<formato>/<data>-<slug>/pesquisa-base.md

node scripts/export-png.js export/conteudos/<formato>/<data>-<slug>/
```

Erro de dependência (Puppeteer): `npm install` na raiz.

### 11. Gate de marca (revisor-brand)

#### Gate de marca

Acione `revisor-brand`:

```
Tarefa: validar copy + compliance do post pronto (momento: criação de post).

Inputs:
- Pasta do post: export/conteudos/<formato>/<data>-<slug>/
  (copy.md, design/slide-*.html, export/*.png, treino.md quando aplicável, pesquisa-base.md)
- Briefing inline:
  Pilar: <pilar>
  Objetivo: <objetivo>
  Ângulo central: <ângulo>
  Recorte de público: <recorte>
  Slug do post: <slug>

Avaliar: tom de voz, pilar, compliance (saúde, jurídico, suplementação, promessas irreais).
NÃO re-julgar identidade visual — o estilo já foi validado na criação.

Saída: parecer inline (schema "momento: criação de post"). Status: APROVADO | REPROVADO.
```

Controle de tentativas: `tentativas_11` inicia em 0; incrementa a cada re-rodada. Se `tentativas_11 ≥ 1` → pausar e apresentar:

```
Gate de marca travado após N tentativa(s).
Parecer atual: <inline>
Ação necessária: <instrução do revisor>
```

- **APROVADO** → consolide `briefing.md` usando `templates/briefing.md` e grave em `export/conteudos/<formato>/<data>-<slug>/briefing.md`. Siga para o Passo 12.
- **REPROVADO** → aplique a instrução do campo `Ação` (corrigir copy ou design inline); incremente `tentativas_11`; re-rode Passo 10 + Passo 11.

### 12. Entregar ao usuário

```
Post pronto: export/conteudos/<formato>/<data>-<slug>/

- Formato: <formato>
- Estilo: <slug> (<salvo como permanente | descartado | já era permanente>)
- Tema: <tema>

Destaques do gate de marca:
- {bullet 1}
- {bullet 2}
- {bullet 3}

Imagens prontas para upload:
- <lista de PNGs>

Briefing institucional: export/conteudos/<formato>/<data>-<slug>/briefing.md
```

- **Adaptar stories (condic., carrossel, ⏸)** — só quando `<formato> = carrossel`:

  ```
  Quer adaptar este post para stories (9:16)?
  - "sim" → gera versão stories
  - "não" → segue
  ```

  Se "sim", leia o `estilo.md` do carrossel e o `slide.html` de referência. Gere os frames inline em `export/conteudos/carrossel/<data>-<slug>/stories/design/frame-N.html` (1080×1920), mantendo as drop zones do estilo de referência. Pause (⏸):

  ```
  Stories gerado em export/conteudos/carrossel/<data>-<slug>/stories/design/:
  - <frames individuais: frame-1.html, frame-2.html...>

  Para revisar, exporte:
    node scripts/export-png.js export/conteudos/carrossel/<data>-<slug>/stories/ --format=stories

  Opções:
  - "exportar" → exporto como está
  - Peça ajustes visuais → edito os frames inline e reapresento
  - Ajuste de copy → edito o copy inline para a versão stories
  ```

  **Aguarde resposta.** Ajuste visual → edite os frames inline. Ajuste de copy → edite e grave em `stories/copy.md` (`copy.md` raiz intacto). Repita até "exportar". Após aprovação:

  ```bash
  node scripts/export-png.js export/conteudos/carrossel/<data>-<slug>/stories/ --format=stories
  ```

  **Gate de marca não se repete** — copy e briefing já foram aprovados no Passo 11.

- **Captura de fonte na biblioteca (condic., não-bloqueia)** — só se a copy (Passo 8) se apoiou numa fonte que **não estava** em `memory/biblioteca/_indice.md`:

  ```
  A copy usou uma fonte que ainda não está na biblioteca: <nome/fonte>.
  Salvar como ficha do pilar <pilar>? Vira matéria-prima para posts futuros.
  - "sim"  → eu coleto os campos mínimos e gravo a ficha
  - "não"  → segue sem salvar
  ```

  Se "sim", colete o mínimo (nome, tipo, pilar, "use para", 1-2 trechos com página/fonte) e acione `pesquisador-mercado` no modo `manutenção da biblioteca` (`proveniencia: usuario via /novo-post em <data>`, `status: nucleo`). **Nunca bloqueia a entrega** — em qualquer erro, reporte e siga.

- **Salvar/descartar `_rascunho/` (condic., ⏸)** — só quando `modo_estilo = "ad-hoc"`:

  ```
  Estilo ad-hoc usado no post: templates/social-media/<formato>/estilos/_rascunho/

  Quer salvar como estilo permanente?
  - "salvar <slug-em-kebab-case>" → mantém pasta, renomeia.
  - "descartar" → remove a pasta.
  ```

  - **Salvar:** valide kebab-case (`^[a-z0-9-]+$`). Se já existir `templates/social-media/<formato>/estilos/<slug>/`, peça outro slug. Então `mv templates/social-media/<formato>/estilos/_rascunho/ templates/social-media/<formato>/estilos/<slug>/`. O estilo é salvo somente em `templates/social-media/carrossel/estilos/<slug>/` — nenhum estilo é criado em `templates/social-media/stories/`.
  - **Descartar:** `rm -rf templates/social-media/<formato>/estilos/_rascunho/`.

### 13. Write-back no registro de ângulos

#### Write-back

Após APROVADO (Passo 11) e entregue (Passo 12), registre a peça — uma linha que grava o que o post **disse** (ângulo + verdade + pilar + descanso), para o scouting (Passo 3) saber que o ângulo está em descanso e o `estrategista-mercado` detectar saturação. **Não depende de publicação; o post finalizado é o gatilho.** Se REPROVADO sem recuperação ou descartado, **não** registre.

Determinístico — o script escreve a linha completa (ninguém anexa à mão):

```bash
node scripts/memory/append_registro_angulos.js \
  --slug "<slug do Passo 5>" \
  --data "$(date +%F)" \
  --canal instagram \
  --angulo "<slug-kebab do ângulo central do Passo 5>" \
  --verdade "<verdade_servida do Passo 5 — slug ou neutro>" \
  --pilar "<pilar do Passo 5>" \
  --descanso "<21d default; ângulo muito específico → maior, ex 6sem>"
```

Reporte a linha anexada inline. Se o script falhar (`REGISTRO_ANGULOS_AUSENTE`), avise e siga — o post já está entregue; o write-back não bloqueia.

### 14. Publicação (opcional, gated por política)

#### Publicação

Carregue `orquestracao/politicas/publicacao.yaml` e avalie as regras com as variáveis disponíveis:
- `artefato.canal = 'instagram'`
- `briefing.pilar = <pilar do briefing>`
- `artefato.contem_termo(<termo>)` (varrer copy + briefing para termos sensíveis)

**Regra que casa primeiro decide.** Se `modo: automatico` → oferecer ao usuário publicar agora:

```
Política autoriza publicação automática neste post (regra: <id>).
Janela de aborto: <N> min após publicação.

Quer publicar agora? (sim para chamar publish_instagram.js; não para fechar)
```

Se sim → executar e reportar resposta (status, instagram_media_id, posted_at) inline:

```bash
node scripts/integrations/publish_instagram.js --post export/conteudos/<formato>/<data>-<slug>/
```

Se `modo: aprovacao_humana` → não chamar o script automaticamente. Mostrar:

```
Política exige aprovação humana antes de publicar (regra: <id>, motivo: <motivo>).
Para publicar, rode manualmente:
  node scripts/integrations/publish_instagram.js --post export/conteudos/<formato>/<data>-<slug>/
```

- **Marcação de uso de imagens (condic.)** — se houve pré-preenchimento via banco, marque as imagens efetivamente presentes no preview final (não as meramente sugeridas — foto trocada no Editor não deve queimar) acionando `arquivista`:

  ```
  Tarefa: marcar.

  Inputs:
  - canal: instagram
  - Pasta-raiz do Drive: <pasta_raiz_id de banco-imagens.yaml>
  - drive_file_id usados: <lista dos IDs efetivamente aplicados nas drop zones>
  - Post: <data>-<slug>
  ```

  Isso registra `used_in` (com `canal`) + `rest_until.instagram` no índice — a foto descansa só no Instagram (60 dias, da config) e permanece livre nos demais canais.

---

### Registrar execução (run-ledger)

Ao concluir, registrar no run-ledger para o relatório do sistema:

`node scripts/orquestracao/registrar_execucao.js --skill novo-post --modo <auto|manual> --resultado <ok|falha> [--slug <slug>] [--nota <motivo se falha>]`

- `--modo auto` quando disparada por routine; `manual` quando pelo usuário.
- Em falha estrutural, registrar `--resultado falha --nota <erro>` antes de abortar.
- Registrar em qualquer modo (manual ou `--auto`).

---

## Entregável final

```
export/conteudos/<formato>/<data>-<slug>/
├── pesquisa-base.md
├── copy.md
├── treino.md                     (quando aplicável)
├── design/
│   └── slide-N.html              (um por bloco)
├── export/
│   └── slide-N.png
├── briefing.md
└── stories/                      (quando adaptação stories executada)
    ├── copy.md                   (só existe se houver ajuste de copy no stories)
    ├── design/
    │   └── frame-N.html
    └── export/
        └── frame-N.png
```

## Critério de conclusão

- A pasta `export/conteudos/<formato>/<data>-<slug>/` contém `pesquisa-base.md`, `copy.md`, `design/slide-N.html`, `export/slide-N.png` e `briefing.md`.
- Quantidade de PNGs em `export/` é igual à de `slide-N.html` em `design/` (validado pelo export-png.js).
- `briefing.md` foi gerado com status APROVADO pelo gate `revisor-brand` (Passo 11, §Gate de marca).
- Em modo ad-hoc, `_rascunho/` foi salvo com slug definitivo ou removido (não deve sobrar entre execuções) — decidido no sub-passo *Salvar/descartar* do Passo 12.
- Usuário recebeu a mensagem final de entrega (Passo 12) com lista de PNGs e caminho do briefing.
- Quando APROVADO: a peça foi registrada como uma linha em `registro-angulos.md` (ângulo + verdade + pilar + descanso) no Passo 13 (§Write-back).
- Quando adaptação stories executada: `stories/design/` contém `frame-N.html`; `stories/export/` contém um PNG por frame; quantidade de PNGs = quantidade de frames HTML; `copy.md` raiz não foi alterado.
