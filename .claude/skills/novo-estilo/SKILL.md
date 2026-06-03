---
name: novo-estilo
description: Cria ou edita um estilo visual para qualquer formato disponível em templates/social-media/. Em modo criação, recebe descrição livre (texto + refs visuais opcionais) e gera o template do zero inline. Em modo edição, detecta um slug existente no input, exibe o preview atual e aplica as alterações pedidas inline. Apresenta preview iterativo antes de salvar. Gate de marca (revisor-brand) valida identidade visual antes de salvar.
---

# /novo-estilo — Dino Team

## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ parse + modo | input | — | modo, formato, slug |
| 2 | ⚙ tratar _rascunho/ | — | 1 | rascunho pronto |
| 3 | ⏸ usuário | contexto ← 2 | 2 | descrição/alterações |
| 4 | ⚙ preparar pasta | — | 3 | pasta de trabalho |
| 5 | ⚙ gerar/editar inline | descrição/refs ← 3, modo | 4 | estilo.md + slide.html |
| 6 | ⚙ editor auto + ⏸ usuário | _rascunho ← 5 | 5 | confirmar/ajuste |
| 6.5 | ⚙ promover edits → estilo (editar) | edits.json ← 6 | 6 | estilo.md/slide.html |
| 7 | revisor-brand (gate visual) | estilo.md + slide.html ← 5/6 | 6 | APROVADO/REPROVADO |
| 8 | ⚙ slug (só criar) | — | 7 | slug |
| 9 | ⚙ salvar | — | 8 | estilo salvo |
| 10 | ⚙ confirmar | — | 9 | confirmação |

## Objetivo

Criar um estilo visual novo ou editar um existente — `estilo.md` + template HTML — prontos para uso pela skill `/novo-post`. Não há subagente de design: a skill gera/edita os artefatos inline.

## Sintaxe

```
/novo-estilo <formato> [slug-existente] [descrição / alterações]
```

- **`<formato>`** — obrigatório. Qualquer subpasta válida de `templates/social-media/`.
- **`[slug-existente]`** — opcional. Se bater com pasta em `templates/social-media/{formato}/estilos/`, entra em modo edição.
- **`[descrição / alterações]`** — opcional. Pode ser pedida no Passo 3.

Ordem é livre. A skill identifica formato, slug e trata o restante como descrição.

```
/novo-estilo stories texto centralizado, sem header, fonte grande
/novo-estilo carrossel layout-dividido reduzir o stamp do rodapé
```

---

## Pipeline

### 1. Parsear input e determinar modo

Extraia o formato e valide contra as subpastas de `templates/social-media/`. Se ausente ou inválido, pergunte e pare. Liste `templates/social-media/{formato}/estilos/`. Se algum token do input (case-insensitive) bater com um slug existente (exceto `_rascunho`), modo = **editar** com `slug_alvo = {slug}`; senão, modo = **criar**. O restante do input vira `descricao_alteracoes` (pode estar vazio).

### 2. Tratar `_rascunho/` existente

Se `templates/social-media/{formato}/estilos/_rascunho/` existir, pergunte: continuar de onde parou (pula para o Passo 6) ou descartar (`rm -rf _rascunho/` e segue).

### 3. Mostrar contexto e coletar descrição/alterações

- **Modo editar**: a edição visual acontece no Dino Editor, que abre automaticamente no Passo 6 — **não** peça ao usuário para abrir Live Preview aqui.
  - Se o usuário já trouxe alterações em texto no input, confirme-as e siga.
  - Se não, avise que o editor abrirá com o estilo atual instanciado para edição visual direta, e siga (sem exigir descrição em texto).
- **Modo criar**: se `descricao_alteracoes` for menor que uma frase clara, peça detalhes — posicionamento, variantes, uso de foto de fundo, elementos esperados.

### 4. Preparar pasta de trabalho

- Criar: `mkdir -p templates/social-media/{formato}/estilos/_rascunho/`
- Editar: `cp -r templates/social-media/{formato}/estilos/{slug_alvo}/ templates/social-media/{formato}/estilos/_rascunho/` — preserva o original intacto até o Passo 9.

### 5. Gerar ou editar estilo inline

Leia os seguintes arquivos antes de produzir:
- `templates/estilo.md` — contrato canônico (seções obrigatórias e condicionais).
- `brand/referencias-visuais.md` — tokens de marca (paleta, tipografia, CAIXA ALTA, 80px).
- `brand/social-media.md` — dimensões, chrome canônico, aspect-ratios.

**Modo criar:** gere do zero, a partir da descrição e refs visuais do usuário:
- `estilo.md` — seguindo o esqueleto canônico em `templates/estilo.md`: seções obrigatórias (Conceito, Estrutura com `[sequência]`/`[total]`/blocos com `#### visual` e `#### editorial`; `[alternância]` quando bloco N-dinâmico varia layout/fundo, Quando usar, Quando NÃO usar) e condicionais que se apliquem.
- `slide.html` (carrossel) ou `frame.html` (stories) — HTML standalone com `<body>` contendo as seções de exemplo taggeadas (`data-block`, `data-slot`, `data-bg-drop`).
- Conteúdo dos blocos é PLACEHOLDER ("TÍTULO DE EXEMPLO", "FRASE — MÁX 12 PALAVRAS", etc.).
- Backgrounds com intenção fotográfica = sempre drop zone (`data-bg-drop="<nome>"`).
- **Não gerar `preview.html`** — preview = abrir `slide.html` via Live Preview ou Dino Editor.

**Modo editar:** leia os arquivos já copiados em `_rascunho/`. Aplique APENAS as alterações pedidas; preserve variantes, tokens, estrutura e documentação não mencionada.

Regras críticas:
- Referências fotográficas são guia de mood/composição/tratamento — NUNCA conteúdo final.
- Nunca re-declare tokens de marca que já vivem em `brand/referencias-visuais.md`.
- Nunca hardcodar número de instâncias do corpo — quantidade vem da copy (bloco N-dinâmico).

### 6. Revisar no Dino Editor (auto-start + pausa iterativa)

A revisão visual roda no **Dino Editor**, que a skill **sobe automaticamente** — o usuário nunca executa o backend. (O editor suporta `slide-N.html` / carrossel; para formatos baseados em `frame.html` — ex. stories — caia no fallback: render com `export-png.js`.) **Nunca instrua "Live Preview" do VS Code — o usuário não o encontra; passe sempre a URL `http://localhost:4321`.**

1. **Gerar scaffold de preview** com o gerador determinístico — instancia cada bloco da `## Estrutura` em `slide-N.html` standalone (corpo flexível repetido `--repeat` vezes; default 2):

   ```bash
   node scripts/editor/scaffold-estilo.js \
     --estilo templates/social-media/{formato}/estilos/_rascunho/estilo.md \
     --out export/conteudos/{formato}/_preview-{slug_alvo|rascunho}
   ```

   O gerador deriva formato/slug do caminho, copia o `<head>`/CSS do estilo e avisa se o formato não for carrossel (editor é carrossel-only).
2. **Subir o editor em background** (a skill executa):

   ```bash
   lsof -ti tcp:4321 | xargs kill -9 2>/dev/null; \
   npm run editor -- export/conteudos/{formato}/_preview-{slug_alvo|rascunho} \
     --estilo templates/social-media/{formato}/estilos/_rascunho/estilo.md \
     > /tmp/dino-editor.log 2>&1 &
   ```

   Aguarde ~3s e confirme saúde: `curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/` → `200`.
3. **Apresentar (⏸):**

   ```
   Dino Editor no ar para o estilo {slug}.
   Abra no navegador: http://localhost:4321 — edite o visual, clique "Salvar".

   Responda:
   - "confirmar"           → promovo as mudanças ao estilo e sigo ao gate
   - ajuste em texto livre  → aplico inline no estilo
   ```
4. **Promover edições estruturais** (modo editar): após o save, leia `export/conteudos/{formato}/_preview-{...}/design/edits.json`; se existir, rode `scripts/editor/extract-structural.js` e aplique cada delta em `_rascunho/estilo.md` + `_rascunho/slide.html` atomicamente (mesmo mecanismo do Passo 11.5 de `/novo-post`). Delta não mapeável: reporte ao usuário e siga com os demais.

Ajuste em texto livre → edite `_rascunho/` inline (volta ao Passo 5) e reapresente. Repita até "confirmar". Ao confirmar, derrube o editor e remova o scaffold:

```bash
lsof -ti tcp:4321 | xargs kill -9 2>/dev/null
rm -rf export/conteudos/{formato}/_preview-{slug_alvo|rascunho}/
```

### 7. Gate de marca (`revisor-brand`)

Após confirmação do usuário, acione `revisor-brand`:

```
Tarefa: validar identidade visual do estilo (momento: criação/edição de estilo).

Inputs:
- estilo.md: templates/social-media/{formato}/estilos/_rascunho/estilo.md
- Arquivo principal: templates/social-media/{formato}/estilos/_rascunho/<slide.html | frame.html>

Avaliar: paleta, tipografia, layout, mood — alinhamento com brand/referencias-visuais.md e brand/social-media.md.
```

Controle de tentativas:
- `tentativas_7`: inicializar em 0; incrementar a cada re-rodada.

Se `tentativas_7 ≥ 1` → pausar e apresentar ao usuário:

```
Gate de identidade visual travado após N tentativa(s).
Parecer atual: <inline>
Ação necessária: <instrução do revisor>
```

- **APROVADO** → siga para o Passo 8.
- **REPROVADO** → aplique a instrução inline (edite `_rascunho/estilo.md` e/ou `_rascunho/slide.html` conforme apontado); incrementar `tentativas_7`; volte ao Passo 6 para nova revisão do usuário.

### 8. Definir slug (só modo criar)

Pergunte o slug. Valide kebab-case (`^[a-z0-9-]+$`). Se já existir pasta com esse nome em `templates/social-media/{formato}/estilos/`, peça outro. Em modo editar, `slug_final = slug_alvo` — pule.

### 9. Salvar

- Criar: `mv templates/social-media/{formato}/estilos/_rascunho templates/social-media/{formato}/estilos/{slug_final}`
- Editar: `cp -r templates/social-media/{formato}/estilos/_rascunho/. templates/social-media/{formato}/estilos/{slug_alvo}/` && `rm -rf templates/social-media/{formato}/estilos/_rascunho/`

### 10. Confirmar ao usuário

```
Estilo {criado | atualizado}: {slug_final} ({formato})
Use com: /novo-post {formato} {slug_final} [tema]
```

---

## Critério de conclusão

- Arquivo principal do template do formato + `estilo.md` presentes em `templates/social-media/{formato}/estilos/{slug_final}/`.
- Pasta do estilo NÃO contém `preview.html`.
- `revisor-brand` aprovou a identidade visual (gate no Passo 7).
- Usuário confirmou explicitamente o template no Passo 6 (editado no Dino Editor, que a skill subiu sozinha).
- `_rascunho/` foi removido, assim como o scaffold de preview em `export/conteudos/{formato}/_preview-*/`.
- Em modo editar, o estilo original só foi sobrescrito após a confirmação do Passo 6 e aprovação do Passo 7.
