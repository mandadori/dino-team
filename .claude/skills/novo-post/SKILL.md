---
name: novo-post
description: Dispara o pipeline completo de criação de um post Instagram (formato definido pelo usuário entre os disponíveis em templates/social-media/). Sintaxe livre — só formato é obrigatório; estilo e tema são opcionais e podem vir em qualquer ordem. Orquestra pesquisa, briefing inline, copy inline, design inline, export e gate de marca. Uso - /novo-post <formato> [estilo] [tema]. Requer brand book preenchido. Aceita briefing pré-pronto vindo da pauta semanal como input opcional.
---

# /novo-post

Cria um post Instagram completo no formato pedido, do briefing à entrega das imagens.

## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ parse input | input bruto | — | formato/estilo/tema/briefing-path |
| 2 | ⚙ checar frescor mercado | — | 1 | trigger Fase A se stale |
| 2a | pesquisador (Fase A, se stale) | mês, formato | 2 | slice mercado atualizado |
| 3 | pesquisador (Fase B, condic.) | formato, contexto | 2 | candidatos ranqueados |
| 3.⏸ | ⏸ usuário | candidatos ← 3 | 3 | tema escolhido |
| 4 | ⚙ recomendar estilo (inline, condic.) | tema, estilos disponíveis | 3.⏸ | recomendação |
| 4.⏸ | ⏸ usuário | recomendação ← 4 + plano | 4 | confirmação do plano |
| 5 | ⚙ estilo ad-hoc inline (condic.) + ⏸ | descrição/refs | 4.⏸ | _rascunho/ |
| 6 | ⚙ briefing inline (ou briefing pré-pronto) | contexto ← 2, tema, estilo | 5 | ângulo/pilar/objetivo/slug/verdade_servida |
| 7 | ⚙ criar pasta | slug ← 6 | 6 | pasta |
| 8 | ⚙ resolver inputs externos do estilo (condic.) | estilo.md | 7 | treino.md |
| 8t | treinador (condic.) | exercícios, objetivo | 8 | prescrição |
| 9 | pesquisador (P9, condic.) | briefing ← 6 | 8 | pesquisa-bruta |
| 10 | ⚙ copy inline + ⏸ | pesquisa ← 9, contexto-copy | 9 | copy.md |
| 11 | ⚙ design inline + ⏸ | copy ← 10, estilo.md | 10 | slide-N.html |
| 11m | arquivista (condic.) | canal, drive-raiz, copy, estilo | 11 | suggestions.json |
| 11.5 | ⚙ loop aprendizado (condic.) + ⏸ | edits.json ← 11 | 11 | estilo.md/slide.html |
| 12 | ⚙ export-png.js | slide-N.html ← 11 | 11.5 | PNGs |
| 13 | revisor-brand (gate) | copy.md + pasta | 12 | APROVADO/REPROVADO |
| 14 | ⚙ entregar | tudo ← 13 | 13 | entrega |
| 14.5 | ⚙ adaptar stories (condic., carrossel) + ⏸ | copy, estilo | 14 | frames |
| 15 | ⚙ salvar/descartar _rascunho/ (condic.) + ⏸ | — | 14.5 | slug permanente ou remoção |
| 15.5 | ⚙ write-back registro-angulos | ângulo+verdade+pilar+slug ← 6 | 13 | linha no registro-angulos |
| 16 | ⚙ publicação (opcional, gated) | pasta ← 13 | 15 | publicado/pendente |

## Sintaxe

```
/novo-post <formato> [estilo] [tema...]
/novo-post <formato> [estilo] --briefing <caminho/briefing-pre-pronto.md>
```

- **`<formato>`** — obrigatório. Slug de diretório em `templates/social-media/`.
- **`[estilo]`** — opcional. Slug em `templates/social-media/<formato>/estilos/`.
- **`[tema...]`** — opcional, texto livre.
- **`--briefing <caminho>`** — opcional. Caminho para um briefing pré-pronto (ex: vindo de `/planejar-pauta-semanal`). Quando presente, pula o Passo 6 (decisão inline) e usa ângulo/pilar/estilo já definidos.
- Ordem livre. Tokens são interpretados por correspondência com slugs; o resto vira tema.

## Pré-requisitos

- Puppeteer/Chromium instalado (`npm install` na raiz).

Se `revisor-brand` devolver `BRAND_BOOK_INCOMPLETO`, propague ao usuário e oriente a rodar `/brand-discovery` antes.

## Princípio central

**A skill executa produção inline e dispara skills de pesquisa.** Não há subagentes para briefing, copy ou design — a skill lê os arquivos necessários diretamente e produz. A pesquisa de mercado (Fase A) e a pesquisa de tema (deep research) são delegadas às skills `/pesquisar-mercado` e `/pesquisar-tema` respectivamente — o `/novo-post` dispara essas skills quando necessário, mas não possui o pipeline de pesquisa. A Fase B (seleção de candidatos) permanece inline, pois é decisória e acoplada à produção. Agentes externos (treinador, revisor-brand, arquivista) são acionados quando têm função geral no sistema. Ao finalizar (APROVADO), escreve de volta no cérebro uma linha em `registro-angulos.md` — ângulo + verdade + pilar (Passo 15.5), via script determinístico.

**Contexto de leitura por passo:**
- **Briefing (Passo 6):** `brand/brand-book.md` (inclui `## Verdades`) + `brand/pilares-conteudo.md` + `memory/ramon/contexto.md` + `memory/performance/registro-angulos.md` + `memory/mercado/tendencias/<mês>.md` + `estilo.md` do estilo escolhido.
- **Copy (Passo 10):** `estilo.md` (campos `#### editorial` de cada bloco) + `brand/tom-de-voz.md` + `brand/publico-alvo.md` + pesquisa gravada.
- **Design (Passo 11):** `estilo.md` (campos `#### visual` de cada bloco) + `slide.html` do estilo + `brand/referencias-visuais.md` + `brand/social-media.md` + copy.md.

**Estrutura de copy é propriedade do estilo, não do formato.** Cada `estilo.md` carrega `## Estrutura` com blocos declarativos. Em modo ad-hoc, cria-se um estilo temporário em `_rascunho/` **antes** da copy, para que o pipeline inteiro rode sobre um estilo concreto.

## Modo autônomo (`--auto`)

Quando `modo_auto = true` (sempre com `--briefing` pré-pronto, então Passos 3/3.⏸/4/4.⏸ já são pulados), o pipeline roda **sem nenhuma pausa humana** e **nunca publica**:

- **Passo 10 (copy):** gera a copy e segue **sem** a pausa de revisão.
- **Passo 11 (Dino Editor):** **não sobe o editor**; usa os `slide-N.html` gerados direto → export. Fotos: se a campanha apontar banco, o Passo 11m (`arquivista`) pré-preenche; sem banco, segue com placeholders do estilo.
- **Passo 11.5 (aprendizado de estilo):** **pulado** (sem `edits.json`).
- **Passo 13 (gate `revisor-brand`):** **permanece**. Se REPROVADO: 1 retry; 2º fracasso → marca a tarefa como `falhou-gate` no `status.yaml` da campanha e **encerra sem entregar** (não publica lixo).
- **Passo 14.5 (stories):** **pulado**.
- **Passo 15 (rascunho):** N/A (estilo definido).
- **Passo 16 (publicação):** **nunca executa**. Ao concluir o gate APROVADO, atualiza a tarefa no `status.yaml` da campanha para `aguardando-publicacao` (+ entrada em `aprovacoes_pendentes` canal `dashboard`) e encerra. A publicação é sempre aprovação humana no dashboard.

Erro de execução em qualquer passo `--auto` → marca a tarefa como `falhou-auto` e encerra. Modo interativo (sem `--auto`) é inalterado.

---

## Pipeline

### 1. Parsear input

Liste `templates/social-media/` e `templates/social-media/<formato>/estilos/`. Tokenize a entrada: match com slug de estilo → estilo; `--briefing <caminho>` → `briefing_path`; resto → tema. Se formato ausente/inválido, pergunte ao usuário oferecendo a lista descoberta. Siga sempre para o Passo 2.

- `--auto` → `modo_auto = true`. Só válido junto de `--briefing` (execução autônoma por routine). Sem `--briefing`, ignore `--auto` e siga interativo.

Se `briefing_path` presente: leia o arquivo apontado e extraia `Formato`, `Estilo`, `Tema`, `Ângulo central`, `Pilar`, `Objetivo`, `Recorte de público`, `Slug do post`, `Verdade` (campo `verdade: <slug>` do briefing — gravado pelo `/planejar-pauta-semanal`). Quando `Verdade` presente, guarde como `verdade_servida = <slug>`; quando ausente, `verdade_servida = neutro`. Esses valores substituem qualquer tema/estilo vindo do input textual. Marque `modo_briefing = "pre-pronto"`. Pule os Passos 3, 3.⏸, 4 e 4.⏸ e vá direto ao Passo 5 (se estilo for ad-hoc) ou ao Passo 7.

### 2. Frescor da inteligência de mercado

A skill **não lê contexto aqui**. Ramon, mercado e registro-angulos são consumidos onde de fato decidem: o `pesquisador-mercado` os lê no Passo 3 (recebe os caminhos) para ranquear o tema, e o briefing inline os lê no Passo 6. Este passo só garante que a inteligência de mercado esteja fresca antes do scouting.

#### 2a. Checar frescor

```bash
f="memory/mercado/tendencias/$(date +%Y-%m).md"
if [ -f "$f" ] && [ -z "$(find "$f" -mtime +14 2>/dev/null)" ]; then echo "FRESCO"; else echo "STALE"; fi
```

Se STALE, avise o usuário ("Atualizando inteligência de mercado…") e invoque `/pesquisar-mercado`:

```
/pesquisar-mercado --mes <YYYY-MM>
```

A skill `/pesquisar-mercado` aciona o `pesquisador-mercado` (Fase A) e grava `memory/mercado/tendencias/<YYYY-MM>.md`, `memory/mercado/concorrentes/<slug>.md` e `memory/publico/`. O prompt completo do agente e a metodologia de scouting vivem em `/pesquisar-mercado` (fonte única).

Se FRESCO, pule.

### 3. Tema (scouting ranqueado)

**Tema veio no input** → usa direto. Pula o scouting — vai para o Passo 4.

**Sem tema** → acione `pesquisador-mercado` (Fase B), informando o contexto carregado no Passo 2:

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

A escolha define `tema`. **Guarde o candidato escolhido + a lista ranqueada** (serão usados no Passo 6). Se "mais"/ajuste, re-acione o modo seleção e reapresente. **Aguarde escolha explícita** antes de seguir ao Passo 4.

### 4. Estilo (inline, sabendo o tema) e plano

**Estilo veio no input** → `modo_estilo = "definido"`, `slug = <escolhido>`. Mostre o plano abaixo e pause.

**Sem estilo** → leia `## Quando usar` / `## Quando NÃO usar` de cada `estilo.md` em `templates/social-media/<formato>/estilos/` (exceto `_rascunho`) e decida inline qual estilo serve melhor para o tema. Se nenhum couber bem, recomende "ad-hoc".

Apresente o plano ao usuário (⏸):

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

Se vier `ad-hoc` (ou recomendação inline foi ad-hoc), `modo_estilo = "ad-hoc"`, colete:
- `referencia_imagem` (caminho) — opcional
- `referencia_descricao` (texto) — opcional
- Ao menos um dos dois é obrigatório. Se nenhum, repita a pergunta.

**Aguarde confirmação explícita ou ajuste** antes de seguir.

### 5. Preparar `_rascunho/` ad-hoc (pausa)

**Só executa quando `modo_estilo = "ad-hoc"`.** Em modo definido, pule para o Passo 6.

```bash
mkdir -p templates/social-media/<formato>/estilos/_rascunho/
```

Se `_rascunho/` já existir, pergunte ao usuário antes de sobrescrever (sobrescrever / continuar do rascunho atual / abortar).

Crie `estilo.md` + `slide.html` inline nesta pasta, seguindo:
- `templates/estilo.md` como contrato canônico (seções obrigatórias e condicionais)
- `brand/referencias-visuais.md` para tokens de marca
- `brand/social-media.md` para dimensões e chrome
- As referências/descrição do usuário para DNA visual

Regras críticas:
- Referências fotográficas são guia de mood/composição/tratamento — NUNCA conteúdo final.
- Backgrounds com intenção fotográfica = sempre drop zone (`data-bg-drop="<nome>"`).
- Declarar drop zones no campo `[bg]` e `[slots]` de cada bloco da `## Estrutura` do `estilo.md`.
- Conteúdo dos blocos é PLACEHOLDER ("TÍTULO DE EXEMPLO", "FRASE — MÁX 12 PALAVRAS", etc.).
- Não gerar `preview.html` — preview = abrir `slide.html` via Live Preview ou Dino Editor.

**Pausa após gravação (⏸):**

```
Rascunho do estilo ad-hoc em templates/social-media/<formato>/estilos/_rascunho/
- estilo.md
- slide.html (ou frame.html)

Para revisar o visual, abra o arquivo principal via Live Preview ou:
  node scripts/export-png.js <qualquer pasta de post com design/> --format=<formato>

Confirma? ("ok" para seguir ao briefing, ou descreva o ajuste)
```

Se vier ajuste, edite os arquivos em `_rascunho/` inline conforme o pedido. Repita até "ok".

### 6. Briefing estratégico (inline)

**Quando `modo_briefing = "pre-pronto"`:** pule este passo. Os campos já foram extraídos no Passo 1 (incluindo `verdade_servida`).

**Caso contrário:** leia os seguintes arquivos e decida inline:
- `brand/brand-book.md` — inclui o conjunto canônico de `## Verdades`.
- `brand/pilares-conteudo.md`
- `memory/ramon/contexto.md`
- `memory/performance/registro-angulos.md` — ângulos em descanso + saturação de verdade
- `memory/mercado/tendencias/<YYYY-MM>.md`
- `estilo.md` do estilo escolhido (campos `## Conceito` e `#### editorial` de cada bloco)

Com base nessas leituras e no tema/candidatos escolhidos, fixe:
- **Ângulo central** — ponto de vista específico que diferencia (não o tema bruto).
- **Pilar** — de `brand/pilares-conteudo.md`; apenas 1.
- **Objetivo** — 1 frase específica do que o post deve fazer no leitor.
- **Recorte de público** — 1-2 frases do segmento específico dentro do público-alvo.
- **Slug do post** — kebab-case (2-5 palavras capturando o ângulo, não o tema bruto).
- **Verdade servida** — slug do `## Verdades` (brand/brand-book.md) que este ângulo acende; `neutro` se nenhuma. Guarde como `verdade_servida`.
- **Sinalizações para o pipeline** — pesquisa necessária? tom específico? restrições/tabus?

**Guarde esses campos na memória da skill** — serão usados nos Passos 10 (copy), 13 (gate + briefing.md) e 15.5 (write-back registro-angulos).

### 7. Criar pasta do post

```bash
mkdir -p export/conteudos/<formato>/<data>-<slug>/{design,export}
```

### 8. Resolver inputs obrigatórios externos do estilo

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

### 9. Pesquisa profunda

Execute **para todo post**. A profundidade e as fontes vêm do **perfil do pilar** do briefing (Passo 6), resolvido pela `/pesquisar-tema`. A pesquisa é fonte de criatividade, não só de fato — inclusive em posts de Mentalidade.

Invoque `/pesquisar-tema`:

```
/pesquisar-tema <tema> --pilar <pilar do briefing> --recorte <recorte do briefing>
```

A `/pesquisar-tema` resolve o perfil de fonte/profundidade pelo `--pilar` (ver `## Perfis de fonte por pilar` na skill). O cache de `memory/pesquisa/` continua valendo: se a slug já existe, pula.

A skill `/pesquisar-tema` aciona o `pesquisador-mercado` (deep research) partindo do contexto de mercado acumulado em `memory/mercado/` e grava o resultado em `memory/pesquisa/<data>-tendencias-<slug>.md`. O prompt completo do agente, o template e a metodologia de pesquisa profunda vivem em `/pesquisar-tema` (fonte única). A **Fase B (Passo 3, seleção de candidatos) permanece inline** — é decisória e acoplada à produção.

O arquivo gravado pela `/pesquisar-tema` (`memory/pesquisa/<data>-tendencias-<slug>.md`) é o que o Passo 10 (copy) lê.

### 10. Copy (inline + pausa)

Leia os seguintes arquivos:
- `estilo.md` do estilo escolhido — campos `#### editorial` de cada bloco (função, tom, [entregar], [ab])
- `brand/tom-de-voz.md`
- `brand/publico-alvo.md`
- `memory/pesquisa/<data>-tendencias-<slug>.md` (se pesquisa executada no Passo 9)
- `export/conteudos/<formato>/<data>-<slug>/treino.md` (se existir)

Com base nessas leituras e no briefing inline do Passo 6, escreva a copy seguindo **exatamente** os campos `#### editorial` de cada bloco do estilo (função, tom, [entregar], [ab]). Um bloco por bloco, respeitando limites de palavras declarados em `[entregar]`.

Grave em `export/conteudos/<formato>/<data>-<slug>/copy.md`.

#### Pausa para revisão da copy (⏸)

**Em `--auto`: pular esta pausa (ver "Modo autônomo").**

```
Copy gerada em export/conteudos/<formato>/<data>-<slug>/copy.md

--- início do copy ---
<conteúdo integral de copy.md>
--- fim do copy ---

Confirma? (responda "ok" para seguir ao design, ou descreva o ajuste)
```

**Aguarde resposta.** Se vier ajuste, edite `copy.md` inline conforme o pedido (sem re-rodar pesquisa), reapresente. Repita até "ok".

### 11. Design (inline + pausa)

Leia os seguintes arquivos:
- `estilo.md` do estilo escolhido — campos `#### visual` de cada bloco (classe, bg, overlay, layout, alternância, slots, tokens)
- `slide.html` (ou `frame.html`) do estilo — template base
- `brand/referencias-visuais.md`
- `brand/social-media.md`
- `export/conteudos/<formato>/<data>-<slug>/copy.md`
- `export/conteudos/<formato>/<data>-<slug>/treino.md` (se existir)

Para cada bloco declarado em `## Estrutura` do estilo, gere um `slide-N.html` em `design/`, nome sequencial. Aplique a copy do bloco correspondente em `copy.md` aos slots declarados em `[slots]` / `[entregar]`. Para blocos N-dinâmico com `[alternância]`, aplique a variante A (ímpar) ou B (par) conforme a posição na sequência.

Regras:
- Drop zones: respeite o campo `[bg]` e `[slots]` de cada bloco.
  - `data-bg-drop="full"` se asset preenche tudo com foto
  - `data-bg-drop="<nome>"` por zona fotográfica
  - não marcar se puramente tipográfico ou placeholder técnico (ex: chroma)
- Cada slide é HTML standalone com `data-block` e `data-slot` nos elementos.
- Não gerar `preview.html`.

Saída: `design/slide-1.html`, `design/slide-2.html`, ... (um por bloco).

#### Pré-preenchimento de imagens (condicional)

Carregue a pasta-raiz do Drive de `orquestracao/banco-imagens.yaml` (campo `drive.pasta_raiz_id`).

- Se `pasta_raiz_id` estiver **vazio** → pule a seleção; o usuário dropa as fotos manualmente no Dino Editor (sem erro).
- Se o MCP do Drive estiver indisponível → avise ("banco de imagens indisponível; siga dropando manual") e continue o post (a entrega nunca trava).
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

#### Pausa para revisão e edição no Dino Editor (⏸)

**Em `--auto`: pular esta pausa (ver "Modo autônomo").**

**A skill sobe o backend do editor automaticamente** — o usuário nunca roda o backend. Antes de apresentar a pausa, execute:

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
- "ok" / "exportei" → sigo para a revisão de marca (Passo 13).
- Peça ajustes visuais → edito os slides inline e reapresento.
```

**Aguarde resposta.** Edições visuais são feitas pelo usuário no Dino Editor (zero token). Se o usuário pedir explicitamente um ajuste inline, edite o slide apontado. Quando confirmar, siga para o Passo 11.5.

### 11.5. Loop de aprendizado de estilo (condicional)

**Em `--auto`: pular esta pausa (ver "Modo autônomo").**

Após o usuário salvar no estúdio (Passo 11), leia `export/conteudos/<formato>/<data>-<slug>/design/edits.json` se existir e rode a extração:

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

Se `hasStructural` for `false` (ou o arquivo não existir), **pule** este passo sem mensagem.

Se `hasStructural` for `true`, **pause** e apresente (⏸):

```
Detectei mudanças estruturais no estilo '<estilo>':
<para cada bloco em byBlock>
- bloco <block>: <lines unidas por " · ">

Promover ao estilo.md? Isso atualiza o estilo para posts futuros.
- "tudo"            → promove todos os deltas
- "<bloco/slot>"    → promove só os escolhidos
- "não"             → fica só neste post (estilo intacto)
```

**Aguarde resposta.** Se "não", siga para o Passo 12 sem alterar o estilo.

Se "tudo" ou seleção, edite `estilo.md` e `slide.html` do estilo **inline**, aplicando cada delta nos dois arquivos atomicamente conforme a variante de posição declarada. Em delta não mapeável, reporte ao usuário o delta problemático e siga com os demais. Após a promoção, siga para o Passo 12.

### 12. Export PNG (determinístico)

Snapshot da pesquisa na pasta do post:

```bash
cp -n memory/pesquisa/<data>-tendencias-<slug>.md \
      export/conteudos/<formato>/<data>-<slug>/pesquisa-base.md
```

Execute o export:

```bash
node scripts/export-png.js export/conteudos/<formato>/<data>-<slug>/
```

O script renderiza cada `slide-N.html` e valida automaticamente dimensões e contagem. Se a validação falhar, leia o erro, corrija no arquivo apontado e re-rode.

Em caso de erro de dependência (Puppeteer não instalado): `npm install` na raiz.

### 13. Gate de marca (`revisor-brand`)

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

Controle de tentativas (rastrear por execução):
- `tentativas_13`: inicializar em 0; incrementar a cada re-rodada.

Se `tentativas_13 ≥ 1` → pausar e apresentar ao usuário:

```
Gate de marca travado após N tentativa(s).
Parecer atual: <inline>
Ação necessária: <instrução do revisor>
```

- **APROVADO** → consolidar `briefing.md` usando `templates/briefing.md` e gravar em `export/conteudos/<formato>/<data>-<slug>/briefing.md`. Siga para o Passo 14.
- **REPROVADO** → aplicar a instrução do campo `Ação` (corrigir copy ou design inline conforme indicado); incrementar `tentativas_13`; re-rodar Passo 12 + Passo 13.

### 14. Entregar ao usuário

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

### 14.5. Adaptar para stories (pausa)

**Em `--auto`: pular esta pausa (ver "Modo autônomo").**

**Só executa quando `<formato> = carrossel`.** Em outros formatos, pule para o Passo 15.

```
Quer adaptar este post para stories (9:16)?
- "sim" → gera versão stories
- "não" → segue para o próximo passo
```

Se "não", pule para o Passo 15.

Se "sim", leia o `estilo.md` do carrossel e o `slide.html` de referência. Gere os frames stories inline:
- Dimensões: 1080×1920
- Saída: `export/conteudos/carrossel/<data>-<slug>/stories/design/frame-N.html`
- Manter as drop zones declaradas no estilo de referência.

#### Pausa para revisão dos frames stories (⏸)

```
Stories gerado em export/conteudos/carrossel/<data>-<slug>/stories/design/:
- <frames individuais: frame-1.html, frame-2.html...>

Para revisar, abra os frames via Live Preview ou exporte diretamente:
  node scripts/export-png.js export/conteudos/carrossel/<data>-<slug>/stories/ --format=stories

Opções:
- "exportar" → exporto como está
- Peça ajustes visuais → edito os frames inline e reapresento
- Ajuste de copy → edito o copy inline para a versão stories
```

**Aguarde resposta.** Se vier ajuste visual, edite os frames inline. Se vier ajuste de copy, edite a copy para stories e grave em `stories/copy.md` (copy.md original intacto). Repita até "exportar" ou confirmação.

Após aprovação, execute o export:

```bash
node scripts/export-png.js export/conteudos/carrossel/<data>-<slug>/stories/ --format=stories
```

O script valida dimensões e contagem automaticamente. Em caso de erro, corrija o frame apontado e re-rode.

**Gate de marca não se repete** — copy e briefing já foram aprovados no Passo 13.

### 15. Salvar/descartar `_rascunho/` (pausa)

**Só executa quando `modo_estilo = "ad-hoc"`.** Em modo definido, pule para o Passo 16.

```
Estilo ad-hoc usado no post: templates/social-media/<formato>/estilos/_rascunho/

Quer salvar como estilo permanente?
- "salvar <slug-em-kebab-case>" → mantém pasta, renomeia.
- "descartar" → remove a pasta.
```

- **Salvar:** valide kebab-case (`^[a-z0-9-]+$`). Se já existir `templates/social-media/<formato>/estilos/<slug>/`, peça outro slug. Então `mv templates/social-media/<formato>/estilos/_rascunho/ templates/social-media/<formato>/estilos/<slug>/`. O estilo é salvo somente em `templates/social-media/carrossel/estilos/<slug>/` — nenhum estilo é criado em `templates/social-media/stories/`.
- **Descartar:** `rm -rf templates/social-media/<formato>/estilos/_rascunho/`.

### 15.5. Write-back no registro de ângulos

Após o post ser **APROVADO** no gate de marca (Passo 13) e entregue (Passo 14), registre a peça no `registro-angulos.md` — uma linha que grava o que o post **disse** (ângulo + verdade + pilar + descanso). Assim o scouting (Passo 3) sabe que o ângulo está em descanso e o `estrategista-mercado` detecta saturação de verdade. **Não depende de publicação via API; o post finalizado é o gatilho.** Se REPROVADO sem recuperação ou descartado, **não** registre.

Determinístico — o script escreve a linha completa; ninguém (nem o `analista-performance`, owner do slice) anexa à mão:

```bash
node scripts/memory/append_registro_angulos.js \
  --slug "<slug do Passo 6>" \
  --data "$(date +%F)" \
  --canal instagram \
  --angulo "<slug-kebab do ângulo central do Passo 6>" \
  --verdade "<verdade_servida do Passo 6 — slug ou neutro>" \
  --pilar "<pilar do Passo 6>" \
  --descanso "<21d default; ângulo muito específico → maior, ex 6sem>"
```

Reporte a linha anexada inline. Se o script falhar (`REGISTRO_ANGULOS_AUSENTE`), avise o usuário e siga — o post já está entregue; o write-back não bloqueia entrega.

### 16. Publicação (opcional, gated por política)

**Em `--auto`: não publicar; marcar `aguardando-publicacao`.**

Carregar `orquestracao/politicas/publicacao.yaml`. Avaliar as regras com as variáveis disponíveis:
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

#### Marcação de uso de materiais (condicional)

Se houve pré-preenchimento via banco, marque as imagens efetivamente presentes no preview final
(não as meramente sugeridas — uma foto trocada no Editor não deve queimar) acionando `arquivista`:

```
Tarefa: marcar.

Inputs:
- canal: instagram
- Pasta-raiz do Drive: <pasta_raiz_id de banco-imagens.yaml>
- drive_file_id usados: <lista dos IDs efetivamente aplicados nas drop zones>
- Post: <data>-<slug>
```

Isso registra `used_in` (com `canal`) + `rest_until.instagram` no índice — a foto descansa só no
Instagram (60 dias, da config) e permanece livre nos demais canais.

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
- `briefing.md` foi gerado com status APROVADO pelo gate `revisor-brand`.
- Em modo ad-hoc, `_rascunho/` foi salvo com slug definitivo ou removido (não deve sobrar entre execuções) — a decisão ocorre no Passo 15.
- Usuário recebeu a mensagem final do Passo 14 com lista de PNGs e caminho do briefing.
- Quando APROVADO: a peça foi registrada como uma linha em `registro-angulos.md` (ângulo + verdade + pilar + descanso) no Passo 15.5.
- Quando adaptação stories executada: `stories/design/` contém `frame-N.html`; `stories/export/` contém um PNG por frame; quantidade de PNGs = quantidade de frames HTML; `copy.md` raiz não foi alterado.
