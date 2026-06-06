# Dino Editor — Fluidez + 4 Correções

> Spec de design. Brainstorm em 2026-06-03.
> Escopo: tornar o Dino Editor (`scripts/editor/`) fluido como um software de edição completo, corrigindo 4 inconsistências e fundando o canvas num modelo de posicionamento livre.

---

## Contexto

O Dino Editor é o editor visual Figma-like dos carrosséis (`scripts/editor/`), separado do pipeline de posts. Cada slide é um `<iframe>` (render do estilo) com uma **superfície top-level** que captura o ponteiro e faz hit-test via `elementFromPoint` dentro do iframe. Seleção, handles e guias são desenhados numa camada de overlay acima de tudo. Edições viram **estilos inline na própria `<section>`**; o save serializa o DOM vivo de volta nos `design/slide-N.html` (preservando head/CSS) e grava `edits.json` (deltas para o loop de aprendizado). Undo/redo é por **snapshot de `innerHTML`**.

Arquivos-núcleo:
- `app.js` — bootstrap, wiring, roteamento de clique (hit-test), navegação.
- `overlay.js` — motor de interação: seleção, handles, mover, resize, texto inline, fundo.
- `panel.js` — painel de propriedades (PT-BR), adaptado ao tipo do elemento.
- `edits.js` — gravação de deltas + serialização + save/export.
- `history.js` — undo/redo por snapshot de `innerHTML`.
- `handlers.js` / `server.js` — backend (serve slides/contract/suggestions, salva, exporta).

## Os 4 problemas

1. **Cadeado de proporção não mantém L/A.** Em texto, "L/A" no painel na verdade escalam `font-size` (`overlay.js:276,282`) — não há proporção real a travar. Em imagem, a proporção é aplicada mas o painel não atualiza o campo companheiro (`setW`/`setH` não chamam `syncGeom`), então o número exibido desencontra da geometria real.
2. **Troca de seleção travada.** Com um fundo selecionado, a selbox (`overlay.js:86`, `pointer-events:auto`) cobre o slide inteiro na camada de topo e seu `pointerdown` engole todo clique — não dá pra clicar num texto por cima do fundo.
3. **Mover um elemento corrompe o vizinho.** `ensureAbsolute` (`overlay.js:51-71`) tira o elemento do fluxo (`position:absolute`), então todo irmão posterior (ex.: o swipe cue logo abaixo do texto) reflui e "muda de composição completamente".
4. **Sem formatação de trecho.** `editText` (`overlay.js:214-227`) liga `contenteditable` no elemento inteiro; `setStyle` (`overlay.js:285-291`) aplica em `el.style` (o todo). Não há como mudar peso/cor/tamanho só de um trecho selecionado.

## Decisões (brainstorm 2026-06-03)

| # | Decisão | Escolha |
|---|---------|---------|
| D1 | Modelo base do canvas (resolve ③) | **Congelar layout ao carregar (Figma-like)** — tudo vira absoluto após as fontes assentarem; mover nunca afeta vizinho |
| D2 | Dimensão do texto no painel (resolve ①) | **Só tamanho da fonte** — remover L/A do texto; dimensiona pelo campo "Tam" + alças |
| D3 | Dimensão da imagem | **Mantém L/A + cadeado**, com conserto de `syncGeom` |
| D4 | Imagem em zona não-bleed | **Recortada à zona** (`overflow:hidden`); mover/zoom nunca ultrapassa as bordas do campo |
| D5 | Escopo do ④ | **Entra neste ciclo** junto com ①②③ |

---

## Arquitetura da solução

### A. Fundação — congelar layout ao carregar (D1, resolve ③)

Novo passo `freezeLayout(doc, root)`, chamado em `app.js wire()` **após** `frame.iframe.contentDocument.fonts.ready` e **antes** do primeiro `history.begin()`:

- Para cada selecionável e cada zona `data-bg-drop`: mede `getBoundingClientRect` relativo à `section` e fixa `position:absolute` + `left`/`top`.
- **Não-texto:** fixa `width`/`height` medidos.
- **Texto:** fixa `width = Math.ceil(largura medida)`. *Necessário* — absoluto com `width:auto` colapsaria para `max-content` e reflui a quebra de linha. Como o freeze roda após `fonts.ready`, o bug histórico de "width medido antes da Anton → ~1px estreito → quebra em 2 linhas" não ocorre. Esse `width` é interno; **não** é exposto no painel (D2).
- `section` recebe `position:relative` (se ainda não tiver).
- **Idempotente:** elemento já com `position:absolute` inline + `left` definido é pulado (reabrir um slide já salvo/congelado não re-mede).

Efeitos herdados sem custo:
- `ensureAbsolute` (`overlay.js:51`) vira guarda no-op (tudo já é absoluto) — mantido por segurança.
- Undo/redo: o snapshot de `innerHTML` (`history.js:13-18`) já captura o markup congelado; restaurar reescreve markup absoluto e re-marca selecionáveis. Nenhum re-freeze necessário no restore.
- Save: `cleanSection` (`edits.js:43-49`) serializa o DOM absoluto → os `slide-N.html` passam a persistir tudo posicionado em absoluto. Formato aprovado.

### B. ① Dimensões (D2, D3)

`panel.js show()`:
- **Texto:** não construir o bloco "Dimensões" (L/A + cadeado + label explicativa) — remover `panel.js:78-85` para o caso texto. Texto se dimensiona pelo campo **"Tam"** (Tipografia, já existente) e pelas alças que escalam a fonte (`overlay.js:194-198`, mantido).
- **Imagem:** manter bloco "Dimensões" com L/A + cadeado.

`overlay.js`:
- `setW`/`setH` (`overlay.js:273-284`) passam a chamar `pnl("syncGeom")` ao final, para o campo companheiro (não-digitado) refletir a geometria real na hora. A trava de proporção da imagem já é honrada (`setW`/`setH` usam `aspectLock`; handle de canto usa `ratio` fixo em `overlay.js:192`).

### C. Containment de imagem em zona não-bleed (D4)

- Toda zona `data-bg-drop` recebe `overflow:hidden` (acrescentar regra ao `IFRAME_CSS`, `app.js:12-17`). Isso recorta às bordas do campo tanto o background-CSS quanto um eventual `<img>` filho da zona.
- Reposição (`beginBgMove`, `overlay.js:247-260`) e zoom (`setBgZoom`, `overlay.js:245`) já estão clampados (posição 0–100%). Com `overflow:hidden` garantido, a imagem nunca ultrapassa os limites do campo ao mover/redimensionar.

### D. ② Troca de seleção (fundo → elemento por cima)

`overlay.js drawSelection` (`76-97`):
- Quando a seleção é fundo (`bg-image`/`bg-fill` ou `el.hasAttribute("data-bg-drop")`), setar `box.style.pointerEvents = "none"`. O clique atravessa para o hit-test da superfície (`app.js onDown` → `hitTest`) e seleciona o elemento da frente.
- Como o estado da `box` é reaproveitado entre seleções, definir `pointerEvents` a cada `drawSelection` conforme o tipo atual (`"none"` para fundo, `"auto"` para os demais).
- Mover o fundo continua funcionando: clicar numa **área vazia** do slide cai no `bg-drop` (os elementos da frente agora são absolutos e delimitados) → `beginMove` → `beginBgMove`.

### E. ④ Formatar trecho de texto (D5)

Durante a sessão de `contenteditable` (`editText`, `overlay.js:214-227`):

- **Detecção:** listener de `selectionchange` no doc do iframe; quando há um `Range` não-colapsado dentro do elemento em edição, exibe uma **mini-barra flutuante** na camada de overlay, posicionada acima do trecho via `range.getBoundingClientRect()` × escala do frame. Some quando a seleção colapsa ou a edição encerra.
- **Controles:** grossura (peso), cor (as 3 cores da marca de `panel.js:14`) e tamanho (font-size do trecho).
- **Aplicação:** envolve o `Range` num `<span style>`:
  - `range.surroundContents(span)` quando o range não cruza fronteiras de nó;
  - `extractContents()` → embrulha o fragmento num span → reinsere, quando cruza nós;
  - seguido de um passe de **merge**: funde spans adjacentes com estilo idêntico e desfaz span cujo estilo iguala o do pai (evita "sopa de spans").
- **Undo/save:** a sessão de edição inteira é **uma** unidade de histórico (um `begin()` no início do `editText`, como já é hoje). Isso evita o conflito de restaurar `innerHTML` no meio de um `contenteditable`. Os spans persistem via serialização do DOM (`cleanSection`) e são capturados pelo snapshot do histórico — ambos de graça.
- **Delta de aprendizado:** `done()` continua registrando o delta `text` como texto plano (`overlay.js:223`). Correto: formatação de trecho é **conteúdo**, não estrutura do estilo — não deve voltar para o estilo via loop de aprendizado.

---

## Fluxo de dados

```
load do iframe
  └─ fonts.ready → freezeLayout(doc, root)   [tudo absoluto, idempotente]
       └─ markSelectable → prefillBg → wire de ponteiro

clique na superfície
  └─ hitTest → select(ctx)
       ├─ drawSelection: selbox pointer-events = (fundo ? none : auto)   [fix ②]
       └─ panel.show: bloco Dimensões só se imagem                       [fix ①/D2]

drag de handle / campo L-A (imagem)
  └─ setW/setH → aspectLock aplicado → syncGeom                          [fix ①/D3]

duplo-clique em texto → editText (contenteditable, begin() único)
  └─ selectionchange com range não-vazio → mini-barra flutuante
       └─ aplica span no range → merge                                   [feature ④]
  └─ blur → done(): remove contenteditable, registra delta text plano

save → cleanSection (DOM absoluto + spans) → slide-N.html + edits.json
undo/redo → snapshot/restore de innerHTML (markup congelado + spans)
```

## Casos de borda

- **Reabrir slide já congelado:** `freezeLayout` idempotente — pula elementos já absolutos.
- **Texto editado fica mais longo:** com `width` fixo, reflui em mais linhas dentro da caixa (previsível); altura cresce (absoluto, height auto).
- **Texto centralizado:** `width` fixado na largura medida + `left` medido preserva a posição; `text-align:center` centraliza dentro da caixa fixa.
- **Fundo que não é o slide inteiro (bg-fill de sub-região):** selbox click-through não impede uso — regiões de fill não são "movidas"; seleção por clique na área vazia segue válida.
- **Range de formatação cruzando vários nós/spans:** caminho `extractContents` + merge; MVP aceita aninhamento leve residual.
- **Export PNG:** `export-png.js` renderiza o `slide-N.html` salvo (agora absoluto) via Puppeteer a 1080×1350 — deve reproduzir o canvas idêntico. **A confirmar no plano** que o export lê o HTML salvo e bate pixel-a-pixel.

## Testes

Estender a suíte headless existente (`*.test.js` em `scripts/editor/`):
- `freezeLayout` idempotente (segundo passe não altera estilos inline).
- Texto preserva quebra de linha após freeze (com fontes carregadas).
- selbox de fundo recebe `pointer-events:none`; clique seleciona elemento da frente.
- `setW`/`setH` de imagem disparam `syncGeom` e respeitam `aspectLock`.
- Zona `data-bg-drop` tem `overflow:hidden`; reposição/zoom permanecem clampados.
- Aplicar estilo num `Range` cria span correto; passe de merge funde spans equivalentes.

Validação visual final: usuário sobe o servidor e abre no browser (sem agent-browser).

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Rewrap de texto no freeze | `fonts.ready` antes de medir + `width` medido fixado |
| HTML salvo 100% absoluto diverge no export | Confirmar no plano que `export-png.js` renderiza o DOM salvo idêntico |
| Sopa de spans no ④ | Passe de merge; MVP aceita aninhamento leve |
| Conflito undo × contenteditable | Sessão de edição = 1 unidade de histórico (sem restore de innerHTML no meio) |

## Fora de escopo

- Reescrita do tom de voz / sistema de copy (frente própria).
- Swipe cue, logo, regra de uppercase, identidade visual (frente própria).
- Papéis de agente (`pesquisador-mercado`, ângulos queimados) (frente própria).
- Mudanças no backend de save/export além de confirmação de paridade do export.
