# Dino Editor: editor visual Figma-like + aprendizado de estilo

> Spec de design — 2026-06-02 · Revisado 2026-06-02
> Substitui a etapa "preview no Claude Design → ajuste via agente designer → reanexar" por uma **sessão no Dino Editor** (editor Figma-like separado, operando sobre `slide-N.html` standalone), com **aprendizado de estrutura** de volta ao `estilo.md` e **gestão de materiais** (banco de imagens) pré-preenchendo as drop zones.
>
> **Mudanças pós-spec:** O editor foi construído como aplicação separada (`scripts/editor/`) — não como reescrita do wrapper. Não há mais `preview.html` nem `curador-export`. A nova ordem de pipeline é: design → export determinístico → revisão → edição opcional no Dino Editor → re-export → publicação.

---

## Motivação

Hoje o fluxo de `/novo-post` produz `design/preview.html` e pausa para o usuário abrir no "Claude Design" (o próprio `templates/wrappers/preview-wrapper.html` aberto no navegador). Esse wrapper já é um mini-editor: dropa foto na drop zone, reposiciona, dá zoom, e o botão "Salvar HTML" cospe o preview editado que o usuário **reanexa** ao Claude Code.

Três limitações geram atrito e custo:

1. **Texto / tamanho / posição / estilo de texto** não são editáveis no wrapper → qualquer ajuste assim obriga **round-trip ao agente `designer`** (gasto de token).
2. **Os ajustes não voltam pro contrato.** A estrutura de design mora no `estilo.md` (slots/tokens/drop zones, versionado, lido por todos os agentes). Edições feitas no wrapper ficam presas no `preview.html` daquele post — o estilo nunca melhora a partir do uso real. O único "aprendizado" hoje é a promoção manual de um estilo ad-hoc do `_rascunho/` a permanente (Passo 13.6 do `/novo-post`).
3. **Reanexar arquivo** a cada ciclo de ajuste quebra a fluidez.

Adicionalmente, a seleção de foto de fundo é 100% manual: o usuário escolhe e dropa cada imagem.

Este design ataca os três pontos sem bifurcar a fonte da verdade (o HTML/`estilo.md` versionado), preservando a garantia de coerência do sistema (o `curador-export` valida o HTML contra o `estilo.md`).

### Por que não Penpot/MCP

Avaliado e rejeitado. Penpot tem modelo de objeto próprio (SVG): criaria duas fronteiras de tradução (`estilo.md`/HTML → objetos Penpot → de volta) e **bifurcaria a fonte da verdade**. O aprendizado de estrutura quebraria (edições viveriam no formato do Penpot; reverter pra slots/tokens é lossy/frágil), o pipeline de agentes que lê `estilo.md` desincronizaria do que está no Penpot, e o export pixel-exato passaria a depender do exporter do Penpot (fontes Anton/Montserrat, métricas) — trocando um problema **já resolvido** (`export-png.js` via Puppeteer renderiza o HTML real) por um não resolvido. O HTML é o mesmo meio do `slide.html`: edição entra e sai sem perda de tradução.

---

## Princípio central

> O `estilo.md` é o contrato declarativo da estrutura de design. A superfície de edição opera no **mesmo meio** (HTML/CSS) e **escreve de volta no contrato** quando o usuário promove uma mudança estrutural. O editor só expõe o que o contrato permite — é uma **guarda de marca**, não uma ferramenta de liberdade.

---

## Arquitetura — 4 componentes isolados

| Componente | Owner | Entrada | Saída (contrato) |
|---|---|---|---|
| **A. Dino Editor** (`scripts/editor/index.html` + `app.js`) | front (HTML/JS vanilla, Figma-like) | `slide-N.html` via `GET /slides` + `estilo.md` (slots/tokens) | `slide-N.html` limpos + `edits.json` via `POST /save` |
| **B. Loop de aprendizado** | skill `/novo-post` (Claude Code) | `edits.json` | `estilo.md` + `slide.html` atualizados (gated por confirmação) |
| **C. Gerenciador de materiais** | agente `gerenciador-materiais` + `scripts/index-banco.js` | `copy.md` + drop zones do `estilo.md` + banco indexado | `design/suggestions.json` + marcação de uso no índice |
| **D. Servidor** (`scripts/editor/server.js`) | Node HTTP | pasta do post | serve editor shell · `GET /slides` · `POST /save` · `GET /contract` · `GET /suggestions` |

Cada componente é construível e testável isoladamente; conversam só por contratos de arquivo (`preview.html`, `edits.json`, `.banco-index.json`).

---

## Componente A — Dino Editor (aplicação separada)

`scripts/editor/index.html` + `scripts/editor/app.js` — aplicação standalone servida pelo servidor em `localhost:4321`. Opera sobre os `slide-N.html` do post (lidos via `GET /slides`); **nunca** lê nem escreve `preview.html`.

### Funcionalidades implementadas
- **Seleção de elemento:** clicar num elemento editável abre um **painel lateral**. O painel expõe **apenas os slots/tokens que o `estilo.md` daquele bloco declara** (preso ao contrato). Ex.: selecionar a headline de um bloco `corpo` → painel mostra texto, tamanho (dentro da faixa do token, ex. Anton ~88px), posição (dentro da zona declarada), estilo de texto.
- **Controles do painel:** texto (`contenteditable`), tamanho, posição, background (trocar/reposicionar a foto da drop zone), estilo de texto (peso, alinhamento, cor restrita à paleta do brand).
- **Remover elemento** (ex.: tirar o `corpo` de um bloco específico).
- **Guias inteligentes (snapping):** durante o arrasto/reposicionamento, exibir linhas de alinhamento e *snap* a: centro horizontal/vertical do slide, bordas, **safe-areas do brand** (`brand/social-media.md`), *anchors* dos slots declarados no `estilo.md`, e bordas/centros de outros elementos. Linhas de distância visíveis. As guias empurram pra posição do contrato — sinergia com o "preso ao contrato".
- **Botão Salvar:** `POST /save` para o servidor (Componente D), enviando o `preview.html` serializado + o `edits.json`.

### Restrições
- Vanilla JS (sem framework), como o atual — arquivo servível e renderizável pelo Puppeteer sem alterar `export-png.js`.
- Sem dependências externas além das fontes do brand já carregadas.
- O painel **nunca** oferece controle fora do que o `estilo.md` do bloco declara (enforcement de marca no editor).

### Mapeamento controle → `scope`
O editor sabe a natureza de cada edição porque sabe qual controle foi tocado:
- editar conteúdo de texto, trocar a foto, reposicionar a foto → `scope: content`
- redimensionar logo, mover slot, deletar elemento, mudar tamanho de fonte → `scope: structural`

Esse mapeamento é a fonte do `scope` no `edits.json` (ver Componente B). Errar o mapeamento promove lixo ao estilo — mitigado pelo gate do loop (o usuário sempre escolhe quais promover).

---

## Contrato de saída — `edits.json`

Salvo em `export/conteudos/<formato>/<data>-<slug>/design/edits.json` (e `…/stories/design/edits.json` na versão stories). Artefato por-post; o loop de aprendizado lê dali.

```json
{
  "estilo": "editorial",
  "estilo_path": "templates/social-media/carrossel/estilos/editorial/estilo.md",
  "post": "2026-06-02-do-zero-ao-topo",
  "slides": [
    {
      "slide": 1,
      "block": "capa",
      "edits": [
        {"target": "logo",   "prop": "size",           "from": "120px", "to": "96px",  "scope": "structural"},
        {"target": "título", "prop": "position.bottom", "from": "200px", "to": "240px", "scope": "structural"},
        {"target": "título", "prop": "text",            "from": "TÍTULO EXEMPLO", "to": "Do zero ao topo", "scope": "content"},
        {"target": "corpo",  "prop": "removed",         "from": "present", "to": "removed", "scope": "structural"}
      ],
      "background": {"drop": "photo", "image": "ramon-042.jpg", "position": "center 30%", "zoom": 1.2}
    }
  ]
}
```

- **`content`** = texto, esta foto, posição/zoom desta foto → fica só neste post; **nunca** promovido.
- **`structural`** = tamanho de logo, posição de slot, elemento removido, tamanho de fonte → candidato a promover ao `estilo.md`.
- `estilo_path` referencia o contrato a ser potencialmente atualizado.

---

## Componente B — Loop de aprendizado

Após o usuário salvar e retornar ao Claude Code, a skill `/novo-post` executa um **novo passo (9.5)**:

1. Lê `design/edits.json`.
2. Filtra `scope == "structural"`, agrupa por bloco.
3. Se houver deltas estruturais, **pausa** e apresenta:

```
Detectei mudanças estruturais no estilo 'editorial':
- bloco capa: logo 120→96px · título subiu (bottom 200→240px)
- bloco corpo: elemento 'corpo' removido

Promover ao estilo.md? (tudo / escolher quais / não — fica só neste post)
```

4. **Sim / escolher** → atualiza atomicamente:
   - os `[slots]`/`[tokens]` do bloco no `estilo.md`,
   - o `slide.html` (implementação) do estilo, mantendo contrato e implementação coerentes.
   Posts futuros herdam. Mudança versionada em git.
5. **Não** → o post permanece como editado; o contrato não muda.

Sem deltas estruturais (só `content`), o passo é silencioso (sem pausa).

**Determinístico:** lê o manifesto, não infere por diff de HTML. Sem advinhação, sem custo de comparação.

---

## Componente C — Gerenciador de materiais

Agente `gerenciador-materiais` (owner do banco de imagens) + script de indexação. Aberto pra gerir outros tipos de material no futuro.

### Indexação (`scripts/index-banco.js`)
`node scripts/index-banco.js <pasta-do-banco>` → para cada imagem **nova** (incremental), passa por visão e grava/atualiza `<banco>/.banco-index.json`:

```json
{
  "images": [
    {"file": "ramon-042.jpg", "caption": "Ramon de costas, treino pesado, P&B", "tags": ["costas","treino","pb"], "used_in": [], "rest_until": null}
  ]
}
```

- Visão roda **só na indexação** (uma vez por imagem). Seleção posterior é lookup barato.

### Seleção (agente `gerenciador-materiais`)
Lê `copy.md` (por bloco) + drop zones declaradas no `estilo.md` + `.banco-index.json`. Para cada drop zone:
1. **Filtra** imagens com `rest_until` no futuro (em descanso).
2. **Ranqueia** por match semântico entre a copy do slide e a `caption`/`tags`.
3. Devolve a melhor por drop zone.

Lê JSON + raciocina sobre legendas vs. copy — **não roda visão na seleção**.

### Entrega como sugestão (não bake)
Pré-preenche as drop zones no `preview.html` antes da edição. O usuário troca no editor se quiser. Mantém o humano no loop de graça.

### Tracking de uso — marcar, não mover
Ao aprovar/exportar o post, marca no índice:
- `used_in += {post, data}`
- `rest_until = data + janela_de_descanso`

**Não move arquivos.** Razões: não-destrutivo (crítico num Drive sincronizado, onde mover propaga a todos os dispositivos); estado rico (quando/onde/quantas vezes vs. binário usado/não-usado); reuso legítimo após descanso; índice estável (mover quebra os caminhos e força reindexar). Modelo idêntico a `dados/performance/angulos-queimados.md` — fadiga com janela de descanso, não banimento.

### Banco no Drive
Pasta local ou **Drive sincronizado localmente** (Google Drive for Desktop → caminho de sistema). Ressalva: as fotos precisam estar **disponíveis offline** (espelhadas), não como placeholders online-only, senão a indexação por visão não lê os bytes.

---

## Componente D — Servidor (`scripts/editor/server.js`)

`npm run editor -- export/conteudos/<formato>/<data>-<slug> --estilo <estilo_path>`:
- `GET /` → serve o shell do editor (`index.html`).
- `GET /slides` → lê `design/slide-N.html`, extrai CSS do estilo (uma vez) + cada `<section data-slide>`; devolve `{ css, slides }`.
- `POST /save` → reescreve cada `slide-N.html` limpo (sem scaffolding do editor) + `edits.json`.
- `GET /contract` → `parse-estilo` → contrato JSON de blocos/slots.
- `GET /suggestions` → sugestões de imagens do banco.
- CORS + fallback estático (logo, assets).

Export de PNGs é separado: `node scripts/export-png.js <pasta>/` (valida dimensões + contagem automaticamente). O agente `curador-export` foi aposentado — a validação é determinística no script.

---

## Integração no pipeline `/novo-post`

Passos que mudam (numeração do `SKILL.md` atual):

- **Passo 9 (Design):** após o `designer` gerar os assets, aciona `gerenciador-materiais` → drop zones pré-preenchidas com sugestões.
- **Passo 9 (pausa):** mensagem reescrita → "rode `npm run editor -- <post> --estilo <estilo>`, edite no Dino Editor (`localhost:4321`) e salve".
- **Passo 9.5 (novo — loop de aprendizado):** lê `edits.json`; se houver `scope: structural`, oferece promover ao `estilo.md`.
- **Passo 10 (export):** `node scripts/export-png.js <pasta>/` — determinístico, valida dimensões + contagem. `curador-export` aposentado.
- **Passo 13.5 (stories):** mesma mecânica de estúdio/edição/manifesto para `stories/design/`.
- **Passo 14 / marcação de uso:** ao aprovar/exportar, `gerenciador-materiais` marca as imagens usadas no índice.

Passos de pesquisa, briefing, copy e curadoria editorial permanecem intactos.

---

## Riscos e mitigações

- **Editor canvas é frontend real** (seleção, handles, `contenteditable`, serialização de deltas, undo, snapping). É o maior pedaço de trabalho — mas é o wrapper que já é mantido, crescendo no mesmo código vanilla.
- **Mapeamento controle → `scope`:** se errar, promove estrutura indevida ao estilo. Mitigação: o loop sempre pausa e deixa o usuário escolher quais deltas promover; default conservador (`content`) para qualquer controle ambíguo.
- **Coerência `estilo.md` ↔ `slide.html`:** a promoção atualiza os dois atomicamente; um sem o outro deixa contrato e implementação divergentes.
- **Drive online-only** quebra a indexação por visão → exigir "disponível offline" e falhar com mensagem clara se o arquivo não tiver bytes locais.
- **Custo de visão na indexação** proporcional ao tamanho do banco, mas uma vez (incremental); seleção é barata.
- **Serialização do `preview.html` editado** deve preservar `section[data-slide="N"]`, dimensões e ausência de JS nos slides (só o chrome do wrapper tem JS) — senão o `export-png.js`/`curador-export` falham. O serializador grava o HTML no mesmo formato que o `curador-export` valida.

---

## Critérios de sucesso

1. Usuário abre o estúdio local, edita texto/tamanho/posição/background/estilo de texto de um slide e salva — **sem gastar token** e sem reanexar arquivo.
2. O `preview.html` salvo continua exportável pelo `export-png.js` sem ajuste (dimensões, `data-slide`, sem JS nos slides).
3. Ao salvar com mudanças estruturais, o Claude Code detecta via `edits.json` e oferece promover ao `estilo.md`; ao aceitar, `estilo.md` e `slide.html` ficam atualizados e coerentes, e um post novo no mesmo estilo herda a mudança.
4. O `gerenciador-materiais` pré-preenche as drop zones com fotos do banco apontado, filtrando imagens em descanso; ao exportar, marca as usadas no índice sem mover arquivos.
5. O editor só expõe controles dos slots/tokens declarados no `estilo.md` do bloco (enforcement de marca); guias inteligentes assistem o reposicionamento.
