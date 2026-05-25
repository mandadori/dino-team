# Adaptação Carrossel → Stories no `/novo-post`

**Data:** 2026-05-24
**Contexto:** Após gerar um post carrossel completo via `/novo-post`, o usuário quer a opção de adaptar o mesmo conteúdo para o formato stories (9:16), sem refazer pesquisa, briefing ou curadoria.

---

## Objetivo

Adicionar um passo opcional ao pipeline `/novo-post` que, após a entrega do carrossel, pergunta se o usuário quer gerar a versão stories do mesmo post. Copy idêntica (ou variante isolada se ajustada), assets redesenhados para 1080×1920, preview para revisão, export em subfolder `stories/`.

---

## Pipeline

### Modo definido (estilo já existente)

```
1–11   Fluxo atual sem alteração
13     Entregar carrossel ao usuário
13.5   Adaptar para stories? ← NOVO
14     Publicação (opcional)
```

### Modo ad-hoc

```
1–11   Fluxo atual sem alteração
       (Passo 12 original — salvar/descartar _rascunho — REMOVIDO daqui)
13     Entregar carrossel ao usuário
13.5   Adaptar para stories? ← NOVO
13.6   Salvar/descartar _rascunho? ← Passo 12 movido para cá
14     Publicação (opcional)
```

**Motivo da mudança do Passo 12:** o estilo ad-hoc é usado tanto para o carrossel quanto para o stories. A decisão de salvar ou descartar só faz sentido quando o trabalho com o estilo está completamente encerrado.

O estilo, se salvo, fica **somente em** `templates/formatos/carrossel/estilos/<slug>/`. Nenhum estilo é criado ou salvo em `templates/formatos/stories/`.

---

## Passo 13.5 — Pergunta e geração stories

### Pergunta

```
Quer adaptar este post para stories (9:16)?
- "sim" → gera versão stories
- "não" → encerra (ou segue para publicação)
```

### Prompt ao `designer`

```
Tarefa: adaptar assets do carrossel para stories (9:16).

Inputs:
- Regras inegociáveis: templates/formatos/README.md
- Estilo de referência: <caminho do estilo.md do carrossel>
- Template de referência: <pasta do estilo>/slide.html
- Copy: export/conteudos/carrossel/<slug>/copy.md
- Inputs técnicos (se houver): export/conteudos/carrossel/<slug>/treino.md
- Formato de saída: stories (1080×1920)

Saída em export/conteudos/carrossel/<slug>/stories/design/:
- frame-N.html por bloco da ## Estrutura do estilo
- preview.html usando templates/wrappers/preview-wrapper.html verbatim

Drop zones: manter as declaradas no estilo de referência.
```

O designer lê `templates/formatos/README.md` e aplica automaticamente as regras do formato stories (dimensões, safe areas de 250px topo/base, ausência de barra de progresso e swipe cue).

### Pausa para revisão

```
Stories gerado em export/conteudos/carrossel/<slug>/stories/:
- preview.html
- <assets individuais>

Opções:
- "exportar" → exporto como está
- Anexe preview.html editado → sobrescrevo e exporto
- Peça ajustes visuais → repasso ao designer
- Ajuste de copy → re-aciono copywriter; salvo em stories/copy.md (copy.md original intacto)
```

**Isolamento de copy:** se o usuário pedir ajuste de texto, o copywriter recebe `copy.md` + pedido de ajuste e grava em `stories/copy.md`. O `copy.md` raiz (carrossel) nunca é alterado neste passo.

### Export

Após aprovação, aciona `curador-export` para `stories/`:

```
Tarefa: validar assets e executar export para PNG.

Inputs:
- Pasta: export/conteudos/carrossel/<slug>/stories/design/
- Estilo: <caminho do estilo.md do carrossel>

Comando: node scripts/export-png.js export/conteudos/carrossel/<slug>/stories/

Pós-export: verificar que qtd. de PNGs em stories/export/ = qtd. de frame-N.html em stories/design/.
```

### Curadoria

**Não se repete.** Copy e briefing já foram aprovados nos Passos 11a/b/c. O stories usa o mesmo conteúdo e o mesmo estilo de referência.

---

## Estrutura de pastas

```
export/conteudos/carrossel/<data>-<slug>/
├── pesquisa-base.md
├── copy.md                      ← original do carrossel, nunca alterado pelo stories
├── treino.md                    (quando aplicável)
├── briefing.md
├── design/
│   ├── slide-1.html … slide-N.html
│   └── preview.html
├── export/
│   └── slide-N.png
└── stories/                     ← criado em 13.5
    ├── copy.md                  (só existe se houver ajuste de copy no stories)
    ├── design/
    │   ├── frame-1.html … frame-N.html
    │   └── preview.html
    └── export/
        └── frame-N.png
```

---

## Critério de conclusão do Passo 13.5

- `stories/design/` contém `frame-N.html` para cada bloco + `preview.html`.
- `stories/export/` contém um PNG por frame.
- Quantidade de PNGs = quantidade de frames HTML.
- `copy.md` raiz não foi modificado (se houver ajuste de copy, `stories/copy.md` existe).
