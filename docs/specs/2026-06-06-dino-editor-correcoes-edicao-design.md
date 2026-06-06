# Dino Editor — Correções de edição (seleção, cor, swipe, preview, zoom, alças)

> Spec de design · 2026-06-06
> Sete correções pontuais no Dino Editor. Sem mudança de arquitetura — cada uma
> isolada num arquivo/função existente.

---

## Contexto

O Dino Editor (`scripts/editor/`) é o editor visual Figma-like dos slides de
carrossel. Cada slide renderiza num `<iframe>` (CSS isolado) numa escala pequena
(~0.18–0.62 do tamanho real, `computeScale`), com uma superfície top-level
(`.dt-surface`) capturando o ponteiro e uma camada de overlay (`#dt-overlay`)
desenhando seleção/alças/guias. O painel de propriedades (`#dt-panel`) é dockado
à direita via flex.

Esta spec resolve sete problemas reportados, todos de UX de edição.

---

## Itens

### 1. Selecionar trecho de texto (em vez de selecionar tudo)

**Problema:** ao entrar em edição de texto (duplo-clique), seleciona o conteúdo
inteiro — não dá pra selecionar só uma palavra/trecho.

**Causa:** `overlay.js` → `editText` faz `selectNodeContents(el)` + `addRange`,
o que seleciona tudo de propósito.

**Solução:** posicionar o **caret** no ponto do duplo-clique em vez de selecionar
tudo. Usar `doc.caretRangeFromPoint(x, y)` com as coords do slide (mesma conversão
tela→slide do `hitTest`). Se `caretRangeFromPoint` não retornar (fora de nó de
texto), colapsar no fim do conteúdo como fallback. O ponto do clique precisa
chegar ao `editText`: o handler de `dblclick` (app.js e o do selbox em overlay.js)
passa `clientX/clientY` adiante.

**Composição:** com o caret posicionado, o usuário arrasta e seleciona o trecho;
a barra flutuante (#2) então aplica o estilo ao trecho.

**Arquivos:** `scripts/editor/overlay.js` (`editText`, assinatura passa a receber
coords do clique), `scripts/editor/app.js` (dblclick na surface).

---

### 2. Barra flutuante de formatação de trecho some sem aplicar

**Problema:** com um trecho selecionado, ao clicar na barrinha que aparece acima
(B, cor, A-/A+) a barra some e nenhuma alteração é feita.

**Causa:** a barra (`dt-text-tb`) vive no **documento top-level**, mas o texto
editável (`contenteditable`) está **dentro do iframe**. Os botões usam
`mousedown → preventDefault` pra evitar perder o foco, mas `preventDefault` no
documento pai **não impede** o `blur` de um elemento dentro do iframe. Clicar na
barra → o editável perde foco → dispara `done()` (handler de `blur`) → comita o
texto, remove `contenteditable` e esconde a barra **antes** do clique aplicar o
estilo. O `applyToSelection` então roda sobre uma seleção já perdida → no-op.

**Solução:** blindar o `blur` enquanto a interação é com a barra.

- Guardar o `range` selecionado em `savedRange` sempre que `updateTextToolbar`
  detecta seleção não-colapsada dentro do elemento.
- Flag `tbBusy`: setado em `pointerdown`/`mousedown` em qualquer ponto da barra,
  limpo após o `applyToSelection` concluir (e num `setTimeout(0)` de segurança).
- No `done()` (handler de `blur`): se `tbBusy`, **abortar o commit** — re-focar o
  elemento (`el.focus()`) e restaurar `savedRange` na seleção — em vez de fechar
  a edição.
- `applyToSelection` opera sobre a seleção restaurada (ou diretamente sobre
  `savedRange` se a seleção atual estiver colapsada), garantindo que o estilo é
  aplicado e a seleção sobrevive pro próximo clique.

**Arquivos:** `scripts/editor/overlay.js` (`editText`/`done`, `updateTextToolbar`,
`buildTextToolbar`, `applyToSelection`).

---

### 3. Seletor de cor nativo + hex + conta-gotas

**Problema:** a cor do texto é um dropdown com 3 cores fixas (Branco/Preto/Cinza)
e a barrinha de trecho tem 3 bolinhas fixas. O usuário quer escolher qualquer cor
(gradiente + campo hex, estilo Photoshop) e pegar cor da tela (conta-gotas).

**Decisão (confirmada):** usar o seletor de cor **nativo** do navegador
(`<input type="color">`, que abre exatamente o seletor com gradiente + campo hex)
+ botão **conta-gotas** (`window.EyeDropper`). Não construir seletor custom.

**Solução:**

- **Texto (painel):** trocar o campo `p-color` (selectField de 3 cores) por uma
  linha com `<input type="color">` (valor = cor atual via `hexOf(cs.color)`) +
  botão conta-gotas. `input`/`change` no color → `DT.overlay.setStyle("color", v)`.
- **Barra de trecho:** trocar as 3 bolinhas (`.dot`) por **um** swatch que abre o
  mesmo `<input type="color">` + um botão conta-gotas; aplicam via
  `applyToSelection({ color })`.
- **Fundo (bg-fill / bg-image cor):** já usa `<input type="color">` nativo — só
  adicionar o botão conta-gotas ao lado de cada `colorRow`.
- **Conta-gotas:** `new EyeDropper().open()` → escreve `result.sRGBHex` no input e
  dispara o mesmo caminho de aplicação. Se `window.EyeDropper` não existir,
  **esconder** o botão (o input nativo já cobre gradiente + hex).

**Arquivos:** `scripts/editor/panel.js` (campo de cor de texto, `colorRow` de
fundo), `scripts/editor/overlay.js` (`buildTextToolbar`). Helper único de
conta-gotas reutilizado nos três pontos.

---

### 4. Seta do swipe cue encolhe / some ao mudar o tamanho do texto

**Problema:** ao alterar o tamanho do texto do swipe cue, a seta diminui e às
vezes some do slide.

**Causa (dupla):**
1. A seta é um `::after` dimensionado em `em` (`0.60em × 0.74em`), então encolhe
   proporcionalmente à fonte.
2. O **freeze** (`freeze.js` → `frozenStyleFor`) pina `width` em elementos de
   texto. A `.swipe-cue` é `inline-flex` (texto "ARRASTE" + seta `::after`). Ao
   aumentar a fonte, o texto cresce dentro da largura pinada → a seta (flex item)
   é espremida até colapsar / estoura a largura e some.

**Solução:**

- **CSS do estilo** (`.swipe-cue` / `.swipe-cue::after` nos `slide.html` /
  `estilo.md` dos estilos que têm swipe cue):
  - `.swipe-cue { white-space: nowrap; }`
  - `.swipe-cue::after { flex: 0 0 auto; width: max(10px, 0.60em); height: max(12px, 0.74em); }`
- **`freeze.js`** (`frozenStyleFor`): não pinar `width` em texto quando há risco de
  clip. Abordagem escolhida na implementação entre:
  - (a) deixar `frozenStyleFor` aceitar um sinal "nowrap" e, nesse caso, não pinar
    `width` (deixa crescer com a fonte); ou
  - (b) manter como está e confiar no CSS (`nowrap` + `flex:0 0 auto`) — que já
    impede o colapso da seta.

  Preferência: começar por (b) (mínimo, geral via CSS) e só aplicar (a) se o teste
  ao vivo mostrar clip residual. `frozenStyleFor` continua testável; se (a),
  adicionar caso de teste cobrindo "texto nowrap → sem `width`".

**Arquivos:** estilos com swipe cue (hoje: `editorial`; verificar
`layout-dividido` e `treino-dino`), `scripts/editor/freeze.js` (condicional, se
necessário), `scripts/editor/freeze.test.js` (se (a)).

---

### 5. Preview por estilo, fora de `export/`

**Problema:** abrir um estilo no editor gera uma pasta descartável
`export/conteudos/<formato>/_preview-<slug>/` (criada por `scaffold-estilo.js` e
apagada pela skill depois). Polui `export/` e re-scaffolda toda vez.

**Solução:** o preview de cada estilo passa a morar **na própria pasta do estilo**,
commitado:

```
templates/social-media/<formato>/estilos/<slug>/preview/design/slide-N.html
```

- `scaffold-estilo.js`: o `--out` default passa a ser a pasta `preview/` do próprio
  estilo (derivada de `--estilo`), em vez de `export/conteudos/<formato>/_preview-<slug>`.
  `--out` explícito continua respeitado.
- **Editar um estilo** = regenerar o `preview/` (overwrite, pra ficar fresco em
  relação ao `slide.html`) e abrir o editor direto nessa pasta. Sem criar nem
  apagar nada em `export/`.
- **Salvar** edições de estilo continua escrevendo em `preview/design/slide-N.html`;
  a promoção estrutural (`extract-structural.js`) lê o `edits.json` de lá e aplica
  em `slide.html` + `estilo.md` (fluxo existente, só muda o caminho de origem).
- **Migração:** gerar `preview/` para os 3 estilos atuais (`editorial`,
  `layout-dividido`, `treino-dino`) e **remover** os 3 `_preview-*` órfãos de
  `export/conteudos/carrossel/`.
- **Skills:** ajustar `novo-estilo/SKILL.md` (passos 1, 3, 4 e checklist que citam
  `export/conteudos/{formato}/_preview-*`) e `editar-post/SKILL.md` se referenciar
  o scaffold em export. A regra "não gerar `preview.html`" permanece — `preview/`
  é uma pasta de scaffold do editor (slide-N.html), não o artefato `preview.html`.

**Arquivos:** `scripts/editor/scaffold-estilo.js` (default `--out`),
`.claude/skills/novo-estilo/SKILL.md`, `.claude/skills/editar-post/SKILL.md`,
`templates/social-media/carrossel/estilos/*/preview/` (gerados/commitados),
`export/conteudos/carrossel/_preview-*` (removidos).

---

### 6. Estabilidade sob zoom do navegador

**Problema (confirmado: zoom do navegador, Cmd+/pinça — não há zoom próprio no
editor):** ao clicar num elemento com zoom aplicado, a tela "pula pro início" e o
painel de propriedades parece não fixo.

**Causa:** ao selecionar, `DT.panel.show` abre o painel (`is-open`, `width 264px`),
o que encolhe o `#dt-stage` (flex) → reflow → o `scroll-snap-type: x mandatory`
re-snapa o carrossel → pula pro início. O zoom do navegador torna o salto mais
visível.

**Solução:**

- **Preservar `scrollLeft`** do `#dt-stage` ao abrir/fechar o painel: capturar
  antes da troca de seleção e restaurar no mesmo frame (`requestAnimationFrame`)
  após o painel mudar de largura.
- **Suspender `scroll-snap`** momentaneamente durante a troca de seleção, reusando
  o padrão `is-dragging` (que já faz `scroll-snap-type: none`) ou um equivalente
  curto, restaurado após o reflow.
- **Verificação empírica:** confirmar que boxes/handles (`position:fixed` +
  `getBoundingClientRect`, ambos em px CSS) seguem alinhados sob zoom — devem
  seguir, pois o zoom do navegador escala tudo uniformemente. Se houver desvio,
  registrar como follow-up (fora do escopo desta correção).

**Arquivos:** `scripts/editor/app.js` (wrap de `select`/`deselect` preservando
scroll), `scripts/editor/index.html` (CSS de snap, se necessário).

---

### 7. Alças de seleção proporcionais (elementos pequenos)

**Problema:** ao selecionar um elemento pequeno (ex.: texto curto), as 8 alças
têm tamanho fixo (11px) e ocupam quase todo o box → se sobrepõem, cobrem o texto
e dificultam tanto mirar a alça certa quanto ver/ajustar o conteúdo.

**Causa:** `drawSelection` desenha sempre as 8 alças (`HPOS`) com tamanho fixo,
independentemente do tamanho do box na tela.

**Solução (comportamento confirmado — esconder progressivamente conforme encolhe):**

- Calcular `Wd`/`Hd` (dimensões do box **na tela**, já escaladas) — já existem em
  `drawSelection`.
- **Box pequeno** (`min(Wd, Hd) < ~48px`): esconder as 4 alças de **meio de aresta**
  (`n`, `e`, `s`, `w`); manter só os 4 cantos (`nw`, `ne`, `se`, `sw`).
- **Box muito pequeno** (`min(Wd, Hd) < ~24px`): esconder **também** os cantos —
  fica só o contorno + o box arrastável. Resize fino pelo campo "Tam" do painel e
  pelas setas do teclado (já existentes).
- Os limiares (48px / 24px) são constantes nomeadas, ajustáveis.
- Opcional (se ainda apertado): reduzir a alça pra ~8px quando o box é pequeno,
  com piso, via classe CSS condicional.

A mecânica de arrasto/resize das alças visíveis não muda.

**Arquivos:** `scripts/editor/overlay.js` (`drawSelection` — lógica de visibilidade
por limiar), `scripts/editor/index.html` (classe CSS opcional de alça pequena).

---

## Testes

Cada módulo tem suite (`*.test.js`). Cobertura desta spec:

- **#1:** `editText` posiciona caret a partir de coords (mock de
  `caretRangeFromPoint`); seleção entra colapsada, não select-all.
- **#2:** `done()` com `tbBusy` ativo não comita / restaura `savedRange`;
  `applyToSelection` aplica sobre `savedRange`.
- **#4:** se adotada a via (a), `frozenStyleFor` não retorna `width` para texto
  `nowrap`.
- **#5:** `scaffold-estilo.js` default de `--out` aponta pra `preview/` do estilo
  derivado de `--estilo`.
- **#7:** lógica de visibilidade de alças por limiar (função pura testável, se
  extraída).

UI ao vivo (não testável headless): conta-gotas (#3), scroll preservado (#6),
ausência de clip da seta (#4) e desafogo das alças (#7) — validados no preview no
final.

## Entrega final

Subir o servidor do editor sobre um estilo (preview novo, item #5) e passar a URL
pro usuário validar no browser. **Nunca** testar a UI via agent-browser.

## Não-objetivos

- Não adicionar controle de zoom próprio ao editor (confirmado: só estabilidade
  sob zoom do navegador).
- Não construir seletor de cor custom (confirmado: nativo + conta-gotas).
- Não mexer na mecânica de arrasto/resize além da visibilidade das alças.
