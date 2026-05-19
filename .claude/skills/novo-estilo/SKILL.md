---
name: novo-estilo
description: Cria ou edita um estilo visual para qualquer formato disponível em templates/formatos/. Em modo criação, recebe descrição livre (texto + refs visuais opcionais) e gera o template do zero. Em modo edição, detecta um slug existente no input, exibe o preview atual e aplica as alterações pedidas. Apresenta preview iterativo antes de salvar. Respeita a identidade visual da marca.
---

# /novo-estilo — Dino Team

## Objetivo

Criar um estilo visual novo ou editar um existente — `estilo.md` + template HTML + `preview.html` — prontos para uso pela skill `/novo-post`.

## Sintaxe

```
/novo-estilo <formato> [slug-existente] [descrição / alterações]
```

- **`<formato>`** — obrigatório. Qualquer subpasta válida de `templates/formatos/`.
- **`[slug-existente]`** — opcional. Se bater com pasta em `templates/formatos/{formato}/estilos/`, entra em modo edição.
- **`[descrição / alterações]`** — opcional. Pode ser pedida no Passo 4.

Ordem é livre. A skill identifica formato, slug e trata o restante como descrição.

```
/novo-estilo stories texto centralizado, sem header, fonte grande
/novo-estilo carrossel padrao remover o swipe cue da capa
```

## Pré-requisitos

- `brand/referencias-visuais.md` preenchido.

## Agentes

| Agente | Responsabilidade | Input | Output |
|---|---|---|---|
| `designer` | Gerar ou editar template HTML, `estilo.md` e `preview.html` numa pasta destino. | Modo (`criar-template-de-estilo` \| `editar-template-de-estilo` \| `regenerar-preview`), formato, pasta destino, slug-alvo (edição), descrição/alterações, refs visuais. | Arquivo principal do template do formato + `estilo.md` + `preview.html` na pasta destino. |

---

## Pipeline

### 1. Validar brand book

Leia `brand/referencias-visuais.md`. Se vazio ou ausente, pare:

> "O brand book não está completo. Rode `/brand-discovery` antes."

### 2. Parsear input e determinar modo

Extraia o formato e valide contra as subpastas de `templates/formatos/`. Se ausente ou inválido, pergunte e pare. Liste `templates/formatos/{formato}/estilos/`. Se algum token do input (case-insensitive) bater com um slug existente (exceto `_rascunho`), modo = **editar** com `slug_alvo = {slug}`; senão, modo = **criar**. O restante do input vira `descricao_alteracoes` (pode estar vazio).

### 3. Tratar `_rascunho/` existente

Se `templates/formatos/{formato}/estilos/_rascunho/` existir, pergunte: continuar de onde parou (pula para o Passo 7) ou descartar (`rm -rf _rascunho/` e segue).

### 4. Mostrar contexto e coletar descrição/alterações

- **Modo editar**: o usuário precisa ver o estilo atual antes de descrever mudanças.
  - Se `templates/formatos/{formato}/estilos/{slug_alvo}/preview.html` existir, mostre o caminho.
  - Se não existir, acione [Agente: `designer`] → input: `regenerar-preview` para `{slug_alvo}`. Output: `preview.html` regenerado na pasta do estilo. Mostre o caminho.
  - Peça ao usuário que abra o preview no Claude Design e descreva as alterações (ou confirme as que já vieram no input).
- **Modo criar**: se `descricao_alteracoes` for menor que uma frase clara, peça detalhes — posicionamento, variantes, uso de foto de fundo, elementos esperados.

### 5. Preparar pasta de trabalho

- Criar: `mkdir -p templates/formatos/{formato}/estilos/_rascunho/`
- Editar: `cp -r templates/formatos/{formato}/estilos/{slug_alvo}/ templates/formatos/{formato}/estilos/_rascunho/` — preserva o original intacto até o Passo 9.

### 6. Acionar designer

[Agente: `designer`] → input abaixo. Output: arquivo principal do template do formato + `estilo.md` + `preview.html` em `_rascunho/`. Encaminha para o usuário no Passo 7.

```
Modo: {criar-template-de-estilo | editar-template-de-estilo}
Formato: {formato}
Pasta de trabalho: templates/formatos/{formato}/estilos/_rascunho/
Slug alvo (só edição): {slug_alvo}

Descrição / Alterações:
{texto do usuário}

Referências visuais: {lista de caminhos ou "nenhuma"}

Regras:
- brand/referencias-visuais.md é lei (paleta, tipografia, dimensões, mood).
- Dimensões e arquivo principal: ditados pelo formato (ver templates/formatos/{formato}/estilos/padrao/).
- Conteúdo é PLACEHOLDER ("TÍTULO DE EXEMPLO", "CORPO — MÁX 40 PALAVRAS", etc.).
- Zonas fotográficas marcadas com [data-bg-drop="..."].
- Cada variante em bloco identificável por classe + comentário HTML.

Comportamento por modo:
- criar: leia templates/formatos/{formato}/estilos/padrao/ como base estrutural mínima. Gere o template do zero a partir da descrição e refs visuais.
- editar: leia os arquivos já copiados em _rascunho/. Aplique APENAS as alterações pedidas; preserve variantes, tokens, documentação não mencionada.

Entregáveis em _rascunho/:
- arquivo principal do template (mesmo nome do estilo padrao do formato)
- estilo.md — Conceito visual, Quando usar, Quando NÃO usar, Variações internas, Inputs obrigatórios, Cores adicionais (se houver)
- preview.html — copie templates/wrappers/preview-wrapper.html verbatim, substitua <!-- SLIDES_HERE --> por uma section[data-slide="N"] por variante, atualize apenas o <title>
```

### 7. Revisar preview

Mostre ao usuário:

```
Rascunho em templates/formatos/{formato}/estilos/_rascunho/preview.html
Abra no Claude Design e responda "confirmar" — ou descreva o ajuste.
```

Se houver ajuste, volte ao Passo 6 passando o estado atual de `_rascunho/` como input do designer. Repita até confirmação.

### 8. Definir slug (só modo criar)

Pergunte o slug. Valide kebab-case (`^[a-z0-9-]+$`). Se já existir pasta com esse nome em `templates/formatos/{formato}/estilos/`, peça outro. Em modo editar, `slug_final = slug_alvo` — pule.

### 9. Salvar

- Criar: `mv templates/formatos/{formato}/estilos/_rascunho templates/formatos/{formato}/estilos/{slug_final}`
- Editar: `cp -r templates/formatos/{formato}/estilos/_rascunho/. templates/formatos/{formato}/estilos/{slug_alvo}/` && `rm -rf templates/formatos/{formato}/estilos/_rascunho/`

### 10. Confirmar ao usuário

```
Estilo {criado | atualizado}: {slug_final} ({formato})
Use com: /novo-post {formato} {slug_final} [tema]
```

---

## Critério de conclusão

- Arquivo principal do template do formato + `estilo.md` + `preview.html` presentes em `templates/formatos/{formato}/estilos/{slug_final}/`.
- Usuário confirmou explicitamente o preview no Passo 7.
- `_rascunho/` foi removido.
- Em modo editar, o estilo original só foi sobrescrito após a confirmação do Passo 7.

## Wrapper de preview

O wrapper (carrossel arrastável, drop de imagem, reposicionamento) vive em `templates/wrappers/preview-wrapper.html` — fonte única, lida do disco pelo `designer`. Editar somente lá.
