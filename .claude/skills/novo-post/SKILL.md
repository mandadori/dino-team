---
name: novo-post
description: Dispara o pipeline completo de criação de um post Instagram da Dino Team (carrossel ou stories). Sintaxe livre — só formato é obrigatório; estilo e tema são opcionais e podem vir em qualquer ordem. Orquestra pesquisa, briefing, copy, design, curadoria técnica e curadoria editorial. Uso - /novo-post <formato> [estilo] [tema]. Requer brand book preenchido.
---

# /novo-post — Dino Team

## Objetivo

Criar um post Instagram completo no formato pedido (carrossel 4:5 ou stories 9:16), do briefing à entrega de PNGs prontos para publicação.

## Sintaxe

```
/novo-post <formato> [estilo] [tema...]
```

- **`<formato>`** — obrigatório. `carrossel` ou `stories`.
- **`[estilo]`** — opcional. Slug de um estilo em `templates/formatos/<formato>/estilos/`. Se omitido, scouting + confirmação.
- **`[tema...]`** — opcional, texto livre. Se omitido, scouting + confirmação.

**Ordem é livre.** Cada token é interpretado: bate com formato → formato; bate com slug de estilo → estilo; o resto vira tema.

### Exemplos

```
/novo-post carrossel treino-dino braço
/novo-post carrossel braço                  ← sem estilo → scouting
/novo-post stories disciplina               ← sem estilo → scouting
/novo-post carrossel                         ← sem estilo nem tema → scouting de ambos
/novo-post treino-dino carrossel braço      ← ordem invertida, funciona
```

## Inputs esperados do usuário

| Input | Obrigatório | Origem |
|---|---|---|
| Formato | Sim | Argumento da skill |
| Estilo | Não | Argumento ou scouting (com confirmação) |
| Tema | Não | Argumento ou scouting (com confirmação) |

Inputs adicionais que podem surgir durante o pipeline:
- Lista de exercícios + séries/reps — quando o estilo escolhido exige (ex: `treino-dino`). Skill detecta lendo `estilo.md`.
- Confirmação do preview antes do export.

## Pré-requisitos

- Brand book preenchido em `brand/` (`brand-book.md`, `tom-de-voz.md`, `publico-alvo.md`, `pilares-conteudo.md`, `referencias-visuais.md`).
- Pelo menos o estilo `padrao` em `templates/formatos/{formato}/estilos/padrao/`.
- Puppeteer instalado (`npm install` na raiz).

## Pipeline

### Passo 0 — Validar brand book

Antes de tudo, leia os 5 arquivos de `brand/`. Se qualquer um estiver vazio ou claramente incompleto, **pare** e responda ao usuário:

> "O brand book ainda não está completo. Rode `/brand-discovery` antes de gerar conteúdo — sem brand book sólido, o post sai genérico."

### Passo 1 — Parsear input

1. **Identifique o formato** (`carrossel` ou `stories`). Se ausente ou inválido, pergunte ao usuário e pare.
2. **Liste estilos disponíveis** para o formato:
   ```bash
   ls templates/formatos/{formato}/estilos/
   ```
3. **Tokenize o resto da entrada.** Para cada token:
   - Bate exatamente (case-insensitive) com um slug de estilo? → é o **estilo**.
   - Senão → faz parte do **tema** (junte tokens restantes em ordem).
4. **Resultado:**
   - `(a) estilo + tema definidos` → siga para Passo 3.
   - `(b) estilo definido, tema livre` → Passo 2 (scouting de tema).
   - `(c) tema definido, estilo livre` → Passo 2 (scouting de estilo).
   - `(d) ambos livres` → Passo 2 (scouting de estilo + tema).

### Passo 2 — Scouting (só se faltar estilo ou tema)

Acione o agente `pesquisa-tendencias` via Task tool com o prompt:

```
MODO: scouting

Formato: {carrossel | stories}
Estilos disponíveis: {lista de slugs lidos de templates/formatos/{formato}/estilos/}
Estilo já definido: {slug ou "auto-selecionar"}
Tema já definido: {texto ou "auto-selecionar"}
```

Receba o output. Apresente ao usuário:

```
Sugestão automática:
- Estilo: {slug} — {motivo}
- Tema: {tema} — {motivo}
- Por quê: {justificativa}

Posso seguir com isso? (responda "sim" / "ok" para continuar, ou diga o que ajustar)
```

**Aguarde confirmação explícita.** Se o usuário pedir ajuste, reaplique localmente (sem novo scouting, salvo se a mudança for grande) e mostre de novo até OK.

### Passo 3 — Briefing estratégico (Diretor de Marca)

Acione o agente `diretor-marca` via Task tool com o prompt:

```
Tarefa: briefing-estrategico

Formato: {carrossel | stories}
Estilo: {slug}
Tema: {tema confirmado}
Data: {YYYY-MM-DD de hoje}
```

Receba o briefing inline. **Mostre o briefing ao usuário** e prossiga (não pause salvo se o usuário interromper — briefing é decisão do Diretor, não do usuário).

Extraia do briefing: **slug do post**, **pilar**, **objetivo**, **recorte de público**, **ângulo central**, **sinalizações para o pipeline**.

### Passo 4 — Verificar inputs obrigatórios do estilo

Leia `templates/formatos/{formato}/estilos/{estilo}/estilo.md`. Procure por seção **"Inputs obrigatórios"**.

- **Sem seção / sem inputs obrigatórios** → pule para Passo 5.
- **Com inputs obrigatórios:**
  - Se for `lista de exercícios + séries/reps` (caso típico: estilo `treino-dino`):
    - **Usuário forneceu exercícios + séries/reps no input?** → use diretamente.
    - **Usuário forneceu só exercícios?** → acione `treinador` (ver abaixo).
    - **Usuário não forneceu nem a lista?** → pergunte ao usuário antes de seguir. Não invente exercícios.
  - Outros tipos de input → pergunte ao usuário.

Acionamento do treinador (quando aplicável):

```
Tarefa: definir séries × repetições por exercício para o treino abaixo.

Lista de exercícios:
{lista do usuário}

Objetivo: hipertrofia (público amplo Dino Team) — salvo outra indicação no briefing.
Público: ler brand/publico-alvo.md.
Caminho de saída: inline (retornar texto, sem salvar arquivo)
```

Após receber o output, salve em `{pasta}/treino.md` (a pasta é definida no próximo passo — então salve aqui ou após o Passo 5; aceitável fazer já com `mkdir -p` antecipado).

### Passo 5 — Criar pasta do post

Com slug do post resolvido no briefing:

```bash
mkdir -p export/conteudos/{tipo}/{data}-{slug}/design
mkdir -p export/conteudos/{tipo}/{data}-{slug}/export
```

Onde `{tipo}` = `carrossel` ou `stories`.

Se o Treinador foi acionado, mova/salve o output em `export/conteudos/{tipo}/{data}-{slug}/treino.md`.

### Passo 6 — Pesquisa profunda (Pesquisa & Tendências, modo deep)

Acione `pesquisa-tendencias` via Task tool:

```
MODO: deep

Formato: {carrossel | stories}
Estilo: {slug}
Tema: {tema}
Pilar de conteúdo: {pilar do briefing}
Recorte de público: {recorte do briefing}
Caminho de saída: export/pesquisa/{data}-tendencias-{slug-do-post}.md
```

Critério de aprovação: pesquisa retornou caminho com arquivo gravado, com pelo menos os ângulos/estruturas e referências mínimas do template. Se output for vazio ou inconsistente, devolva ao agente pedindo refazer.

### Passo 7 — Copy (Copywriter)

Acione `copywriter` via Task tool:

```
Formato: {carrossel | stories}
Caminho da pesquisa: export/pesquisa/{data}-tendencias-{slug-do-post}.md
Caminho de saída: export/conteudos/{tipo}/{data}-{slug-do-post}/copy.md

Briefing estratégico:
- Pilar: {pilar}
- Objetivo: {objetivo}
- Ângulo central: {ângulo}
- Recorte de público: {recorte}
- Slug do post: {slug}

Caminho do treino (se aplicável): export/conteudos/{tipo}/{data}-{slug-do-post}/treino.md
```

Critério de aprovação: arquivo `copy.md` salvo, com 2 variações da capa/frame 1 e do CTA, número de slides/frames dentro da faixa do formato.

### Passo 8 — Design (Designer)

Acione `designer` via Task tool:

```
Formato: {carrossel | stories}
Estilo: {slug do estilo}
Caminho do copy: export/conteudos/{tipo}/{data}-{slug-do-post}/copy.md
Pasta destino: export/conteudos/{tipo}/{data}-{slug-do-post}/design/
Caminho do treino (se aplicável): export/conteudos/{tipo}/{data}-{slug-do-post}/treino.md
```

Critério de aprovação: `slide-N.html` por slide do copy + `preview.html` consolidado, dimensões corretas, sem JS.

### Passo 9 — Pausa para revisão do preview

**Pare e mostre ao usuário:**

```
Design gerado em export/conteudos/{tipo}/{data}-{slug-do-post}/design/ (estilo: {slug}):
- preview.html  ← abra este no Claude Design para revisar o post inteiro
- slide-1.html, slide-2.html, ...  ← fontes individuais

Abra preview.html no Claude Design web, revise os slides e, quando estiver satisfeito,
responda "exportar" para gerar os PNGs finais.
```

**Aguarde confirmação explícita** ("exportar", "ok", "pode exportar", "continua") antes de prosseguir.

Se o usuário editar `preview.html` diretamente no Claude Design e salvar, o script extrai cada `section[data-slide]` automaticamente — não precisa reeditar os individuais.

Se o usuário pedir ajustes via chat:
- Volte ao Passo 8 (acione Designer de novo) passando os ajustes específicos.
- Reapresente o preview e aguarde nova confirmação.

### Passo 10 — Pacote técnico (Curador & Exportador)

Acione `curador-export` via Task tool:

```
Formato: {carrossel | stories}
Pasta do post: export/conteudos/{tipo}/{data}-{slug-do-post}/
Caminho da pesquisa fonte: export/pesquisa/{data}-tendencias-{slug-do-post}.md
```

Critério de aprovação:
- Status `Pacote técnico pronto`.
- N PNGs em `export/` igual ao número de HTMLs em `design/`.
- `pesquisa-base.md` presente na pasta do post.

Se devolver erro técnico, volte ao agente apontado pelo código (`VALIDACAO_TECNICA_FALHOU` → Designer; `PESQUISA_AUSENTE` → Pesquisa) e refaça.

### Passo 11 — Curadoria editorial final (Diretor de Marca)

Acione `diretor-marca` via Task tool com a segunda tarefa:

```
Tarefa: curadoria-editorial

Pasta do post: export/conteudos/{tipo}/{data}-{slug-do-post}/
Caminho do briefing final: export/conteudos/{tipo}/{data}-{slug-do-post}/briefing.md

Briefing original:
{cole aqui o briefing recebido no Passo 3, na íntegra}
```

Resultados possíveis:
- **APROVADO** → o Diretor salvou `briefing.md`. Siga para Passo 12.
- **REPROVADO** → leia o parecer, identifique o ponto e a etapa (copy, design). Reabra a etapa correspondente, refaça, e reentregue à curadoria. Repita até aprovação.

### Passo 12 — Entrega ao usuário

Apresente:

```
Post pronto: export/conteudos/{tipo}/{data}-{slug-do-post}/

- Formato: {carrossel | stories}
- Estilo: {slug}
- Tema: {tema}

Entregue (3 bullets do parecer da curadoria):
- {bullet 1}
- {bullet 2}
- {bullet 3}

PNGs prontos para upload em export/:
- slide-1.png
- slide-2.png
- ...

Briefing institucional: export/conteudos/{tipo}/{data}-{slug-do-post}/briefing.md
```

## Critérios de aprovação entre etapas — resumo

| Etapa | Como aprovar |
|---|---|
| Scouting (Passo 2) | Usuário confirma explicitamente |
| Briefing (Passo 3) | Diretor entregou todos os campos do template; siga sem pausa |
| Inputs obrigatórios (Passo 4) | Treino fornecido ou prescrito pelo Treinador antes de pesquisa |
| Pesquisa deep (Passo 6) | Arquivo salvo com os blocos do template |
| Copy (Passo 7) | `copy.md` salvo, 2 variações em capa e CTA |
| Design (Passo 8) | `slide-N.html` + `preview.html` salvos, sem erro |
| Preview (Passo 9) | Usuário confirma explicitamente |
| Pacote técnico (Passo 10) | Status `Pacote técnico pronto`, N PNGs igual a N HTMLs |
| Curadoria editorial (Passo 11) | Diretor retorna APROVADO + `briefing.md` salvo |

## Formato do entregável final

Pasta `export/conteudos/{tipo}/{data}-{slug-do-post}/` contendo:

```
{pasta}/
├── pesquisa-base.md            ← snapshot da pesquisa
├── copy.md                     ← copy final (com variações para histórico)
├── treino.md                   ← prescrição técnica (quando aplicável)
├── design/
│   ├── slide-1.html
│   ├── slide-2.html
│   ├── ...
│   └── preview.html
├── export/
│   ├── slide-1.png
│   ├── slide-2.png
│   └── ...
└── briefing.md                 ← briefing institucional aprovado
```

PNGs em `export/` são o entregável de publicação. `briefing.md` é o documento que o publicador lê antes de subir o post.

## O que esta skill NÃO faz

- Não publica no Instagram (gera PNGs, não faz upload).
- Não suporta formatos além de `carrossel` e `stories`.
- Não pula validação de brand book.
- Não inventa exercícios em estilos que exigem prescrição técnica.
