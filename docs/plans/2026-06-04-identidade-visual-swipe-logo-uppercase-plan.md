# Identidade Visual — Swipe Cue + Logo + Uppercase · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Definir o swipe cue definitivo (chevron preenchido proporcional e desacoplado), padronizar a logo em 100px, trocar a regra de uppercase para por-fonte (Anton=CAIXA ALTA, Montserrat=livre), e propagar tudo para a verdade canônica de brand, os 3 estilos de carrossel e o `revisor-brand`.

**Architecture:** A verdade visual mora em `brand/social-media.md` (chrome canônico de elementos) + `brand/referencias-visuais.md` (regra global de caixa). Os estilos (`templates/social-media/carrossel/estilos/<nome>/slide.html` autocontidos) implementam o que herdam. Não há teste unitário — é HTML/CSS + docs; a validação é por preview/sign-off visual + screenshot headless (puppeteer) que confirma que o `mask` do chevron renderiza.

**Tech Stack:** HTML/CSS (estilos autocontidos), Markdown (brand docs + agente), puppeteer (já instalado) para screenshot de validação.

**Spec:** `docs/specs/2026-06-04-identidade-visual-swipe-logo-uppercase-design.md`

**Decisões travadas no brainstorm:**
- Seta = SVG chevron preenchido via `::after` + `mask-image` (data-URI), `height`/`gap` em em, cor `currentColor`.
- Uppercase por-fonte: Anton força CAIXA ALTA; Montserrat sem `text-transform`.
- Logo **100px literal em todos os estilos** (inclusive topbar do treino-dino).
- Verdade: `social-media.md` (elementos/swipe/logo) + `referencias-visuais.md` (regra de caixa).

---

## File Structure

**Modificados:**
- `brand/social-media.md` — § Swipe-cue (spec definitiva), § Logo (100px), § Tag (casing livre), § Hierarquia tipográfica.
- `brand/referencias-visuais.md` — § Tipografia (regra de caixa por-fonte).
- `templates/social-media/carrossel/estilos/editorial/slide.html` + `estilo.md` — swipe novo, logo (já 100px), remover `text-transform` Montserrat, placeholders.
- `templates/social-media/carrossel/estilos/treino-dino/slide.html` + `estilo.md` — swipe novo, logo→100px, remover `text-transform` Montserrat.
- `templates/social-media/carrossel/estilos/layout-dividido/slide.html` + `estilo.md` — remover `text-transform` Montserrat (sem swipe/logo).
- `.claude/agents/revisor-brand.md` — checklist de identidade visual com as regras novas.

**Temporários (não versionados; removidos no fim):**
- `templates/social-media/carrossel/estilos/_preview-swipe-cue.html` — preview do chevron (checkpoint humano).
- `scripts/_shot-estilo.mjs` — screenshot headless de validação.

**Mapa elemento→fonte (levantado do código atual), para a remoção de `text-transform: uppercase`:**

| Estilo | REMOVER (Montserrat) | MANTER (Anton) |
|---|---|---|
| editorial | `.slide.corpo .eyebrow`, `.slide.corpo .body-text`, `.slide.cta .cta-sub` (+ a regra antiga do `.swipe-cue`, substituída) | os 3 blocos `font-display` (título capa, headline corpo, título cta) |
| treino-dino | `.topbar .topic`, `.slide.lista .ex-name`, `.slide.lista .ex-reps`, `.slide.exercicio .ex-name`, `.slide.exercicio .ex-reps` (+ a regra antiga do `.swipe-cue`) | os 2 blocos `font-display` (título capa, título cta) |
| layout-dividido | os 3 blocos Montserrat com `text-transform` (stamp/selo) | o bloco `font-display` (frase Anton) |

---

## Task 1: Preview do chevron + CHECKPOINT humano

**Files:**
- Create (temp): `templates/social-media/carrossel/estilos/_preview-swipe-cue.html`

Objetivo: renderizar o swipe cue definitivo (técnica `::after` + `mask`) em fundo escuro, em 3 tamanhos e 3 variantes de peso do chevron, para o usuário travar o desenho exato antes de propagar.

- [ ] **Step 1: Criar o preview**

Create `templates/social-media/carrossel/estilos/_preview-swipe-cue.html`:
```html
<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>Swipe cue — preview</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600&display=swap" rel="stylesheet">
<style>
  body { margin:0; background:#111; color:#fff; font-family:"Montserrat",sans-serif; padding:60px; }
  h2 { color:#888; font-weight:400; font-size:13px; letter-spacing:.1em; text-transform:uppercase; margin:40px 0 14px; }
  .row { display:flex; align-items:center; gap:48px; flex-wrap:wrap; }
  .swipe-cue { display:inline-flex; align-items:center; gap:.4em; font-family:"Montserrat"; font-weight:300; letter-spacing:.04em; color:rgba(255,255,255,.9); }
  .s14 { font-size:14px; } .s26 { font-size:26px; } .s40 { font-size:40px; }
  .swipe-cue::after { content:""; display:inline-block; width:.60em; height:.74em; background-color:currentColor;
    -webkit-mask:var(--cv) no-repeat center/contain; mask:var(--cv) no-repeat center/contain; }
  /* Variantes de peso (inner tip mais/menos recuado = arm mais grosso/fino) */
  .A { --cv:url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2010%2016'%3E%3Cpath%20d='M2%201L9%208L2%2015L0.5%2015L7.5%208L0.5%201Z'%20fill='%23000'/%3E%3C/svg%3E"); }
  .B { --cv:url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2010%2016'%3E%3Cpath%20d='M3%201L10%208L3%2015L0%2015L7%208L0%201Z'%20fill='%23000'/%3E%3C/svg%3E"); }
  .C { --cv:url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2012%2016'%3E%3Cpath%20d='M4%201L11%208L4%2015L1%2015L8%208L1%201Z'%20fill='%23000'/%3E%3C/svg%3E"); }
</style></head>
<body>
  <h2>Variante A (fino) — 14 / 26 / 40px</h2>
  <div class="row"><span class="swipe-cue A s14">ARRASTE</span><span class="swipe-cue A s26">ARRASTE</span><span class="swipe-cue A s40">ARRASTE</span></div>
  <h2>Variante B (médio)</h2>
  <div class="row"><span class="swipe-cue B s14">ARRASTE</span><span class="swipe-cue B s26">ARRASTE</span><span class="swipe-cue B s40">ARRASTE</span></div>
  <h2>Variante C (encorpado)</h2>
  <div class="row"><span class="swipe-cue C s14">ARRASTE</span><span class="swipe-cue C s26">ARRASTE</span><span class="swipe-cue C s40">ARRASTE</span></div>
</body></html>
```

- [ ] **Step 2: CHECKPOINT — usuário trava o desenho**

O controller mostra o arquivo para o usuário abrir no browser (`open` ou file://). O usuário escolhe A/B/C (ou pede ajuste fino do `path`/altura). **Registrar o `path` e o `viewBox` travados** — eles viram o `--cv` usado nas Tasks 3 e 4. Default, se o usuário não mudar: **Variante B** (`viewBox='0 0 10 16'`, `path='M3 1L10 8L3 15L0 15L7 8L0 1Z'`).

> Sem commit nesta task — é artefato temporário + decisão. O preview é removido na Task 8.

---

## Task 2: Verdade canônica de brand

**Files:**
- Modify: `brand/social-media.md` (§ Swipe-cue, § Logo, § Tag de tópico, § Hierarquia tipográfica)
- Modify: `brand/referencias-visuais.md` (§ Tipografia)

- [ ] **Step 1: Reescrever § Swipe-cue em `social-media.md`**

Substituir o bloco `### Swipe-cue` (texto/fonte/cor/aparece/posição) por:
```markdown
### Swipe-cue

- texto: ARRASTE (caixa livre — autorado; sem `text-transform`)
- fonte: Montserrat 300, tracking ~0.04em
- seta: chevron **preenchido** renderizado como pseudo-elemento `::after` via `mask-image` (data-URI SVG). Nunca um `<svg>`/glifo no DOM — assim a seta não é conteúdo editável e nunca é deslocada ao editar o texto.
- proporção: `height` da seta ≈ altura de letra do texto (`.74em`), respiro `gap: .4em` — tudo em em, escala com a fonte.
- cor: herda do texto via `background-color: currentColor` + `mask` (default branco ~0.9 sobre fundo escuro)
- aparece: só na capa (sinaliza continuidade de carrossel)
- posição: definida pelo estilo (default rodapé-centro)
- chevron canônico (mask SVG, viewBox `0 0 10 16`): `path d="M3 1L10 8L3 15L0 15L7 8L0 1Z"` (peso travado no preview 2026-06-04)
```
> Se o usuário travou outra variante na Task 1, usar o `path`/`viewBox` dela aqui.

- [ ] **Step 2: Atualizar § Logo em `social-media.md`**

Substituir a linha `- altura padrão em posts: ~32px` por:
```markdown
- tamanho padrão em posts: largura 100px, altura automática (`width: 100px; height: auto`) — fixo em todos os estilos
```
(Manter as demais linhas da § Logo: arquivo, drop-shadow, posição.)

- [ ] **Step 3: Atualizar § Tag de tópico em `social-media.md`**

Substituir `- fonte: Montserrat 600, ~14px, tracking 0.16em, CAIXA ALTA` por:
```markdown
- fonte: Montserrat 600, ~14px, tracking 0.16em (caixa livre — autorada; sem `text-transform`. Labels podem ser escritos em maiúsculas literais)
```

- [ ] **Step 4: Atualizar § Hierarquia tipográfica em `social-media.md`**

Substituir a linha do Chrome (`- Chrome (tag de tópico, stamp): Montserrat 600 ~14px, tracking 0.16em (padrão — não re-declarar no estilo)`) por:
```markdown
- Chrome (tag de tópico, stamp): Montserrat 600 ~14px, tracking 0.16em (padrão — não re-declarar no estilo). Caixa definida pela copy (sem `text-transform`).
- **Caixa:** Anton (display/títulos) sempre CAIXA ALTA; Montserrat (corpo, subtítulos, labels) caixa livre — a copy decide.
```

- [ ] **Step 5: Atualizar a regra de caixa em `referencias-visuais.md`**

Na § Tipografia, substituir as linhas 37-40 (de `**Display / Títulos:** **Anton** — sempre em **CAIXA ALTA**` até o blockquote `> **Regra absoluta:** ...`) por:
```markdown
**Display / Títulos:** **Anton** — sempre em **CAIXA ALTA**
**Texto secundário / Subtítulos / Corpo:** **Montserrat** — **caixa livre**, definida pela copy

> **Regra de caixa (por fonte):** o que é **Anton** (títulos/display) vai sempre em **CAIXA ALTA**. O que é **Montserrat** (corpo, subtítulos, labels, swipe) tem **caixa livre** — sem `text-transform` forçado; a copy decide. Texto autorado em maiúsculas (ex.: "ARRASTE", "BACK DAY") aparece em maiúsculas porque está escrito assim, não por transformação.
```

- [ ] **Step 6: Commit**

```bash
git add brand/social-media.md brand/referencias-visuais.md
git commit -m "feat(brand): swipe cue definitivo + logo 100px + uppercase por-fonte (canônico)"
```

---

## Task 3: Estilo editorial

**Files:**
- Modify: `templates/social-media/carrossel/estilos/editorial/slide.html`
- Modify: `templates/social-media/carrossel/estilos/editorial/estilo.md`

- [ ] **Step 1: Substituir o CSS do swipe cue**

Em `editorial/slide.html`, substituir o bloco:
```css
    /* --------- Swipe cue (apenas capa) --------- */
    .swipe-cue {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.8);
    }
    .swipe-cue svg {
      height: 0.72em;
      width: auto;
      display: block;
    }
```
por:
```css
    /* --------- Swipe cue (apenas capa) — seta = ::after via mask, proporcional --------- */
    .swipe-cue {
      display: inline-flex;
      align-items: center;
      gap: 0.4em;
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.04em;
      color: rgba(255,255,255,0.9);
    }
    .swipe-cue::after {
      content: "";
      display: inline-block;
      width: 0.60em;
      height: 0.74em;
      background-color: currentColor;
      -webkit-mask: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2010%2016'%3E%3Cpath%20d='M3%201L10%208L3%2015L0%2015L7%208L0%201Z'%20fill='%23000'/%3E%3C/svg%3E") no-repeat center / contain;
              mask: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2010%2016'%3E%3Cpath%20d='M3%201L10%208L3%2015L0%2015L7%208L0%201Z'%20fill='%23000'/%3E%3C/svg%3E") no-repeat center / contain;
    }
```
> Se a Task 1 travou outra variante, trocar o data-URI (path/viewBox) nas duas linhas `mask`.

- [ ] **Step 2: Substituir o markup do swipe cue**

Em `editorial/slide.html`, substituir:
```html
      <div class="swipe-cue" data-slot="swipe-cue">
        <span>ARRASTE</span>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.4"
                stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
```
por:
```html
      <div class="swipe-cue" data-slot="swipe-cue">ARRASTE</div>
```

- [ ] **Step 3: Remover `text-transform: uppercase` dos elementos Montserrat**

Em `editorial/slide.html`, remover a linha `text-transform: uppercase;` (e nada mais) de cada um destes três blocos: `.slide.corpo .eyebrow`, `.slide.corpo .body-text`, `.slide.cta .cta-sub`. **NÃO** remover dos blocos `font-family: var(--font-display)` (Anton: título da capa, headline do corpo, título do cta) — esses mantêm o uppercase.

- [ ] **Step 4: Reescrever os placeholders prosa para caixa natural**

Em `editorial/slide.html`, no markup, trocar o texto-placeholder dos slots Montserrat para caixa natural:
- `data-slot="eyebrow">SEM ACADEMIA. SEM DINHEIRO.` → `data-slot="eyebrow">Sem academia. Sem dinheiro.`
- `data-slot="corpo">PLACEHOLDER — ATÉ 3 LINHAS DE TEXTO DE CORPO EM CAIXA ALTA. MÁXIMO 120 CARACTERES POR PARÁGRAFO.` → `data-slot="corpo">Placeholder — até 3 linhas de texto de corpo. Máximo 120 caracteres por parágrafo.`
- `data-slot="sub">CONSULTORIA DINO TEAM` → `data-slot="sub">Consultoria Dino Team`

(Os slots Anton — `título`, `headline` — permanecem em maiúsculas literais.)

- [ ] **Step 5: Atualizar `editorial/estilo.md`**

No `editorial/estilo.md`, ajustar os descritores que citam essas regras:
- A linha 269 do slide.html embute o comentário "Todo texto é text-transform: uppercase — NUNCA caixa baixa." e a linha 268 "Fontes: Anton (títulos CAIXA ALTA) + Montserrat (corpo CAIXA ALTA)". Corrigir esses comentários no `slide.html` para: "Fontes: Anton (títulos CAIXA ALTA) + Montserrat (corpo em caixa livre)." e remover a frase "Todo texto é text-transform: uppercase".
- No `estilo.md`, onde houver menção a swipe-cue/logo/caixa, alinhar ao novo (swipe = chevron `::after`; logo 100px; corpo Montserrat caixa livre). Ler o arquivo e ajustar as linhas pertinentes.

- [ ] **Step 6: Commit**

```bash
git add templates/social-media/carrossel/estilos/editorial/slide.html templates/social-media/carrossel/estilos/editorial/estilo.md
git commit -m "feat(estilo:editorial): swipe cue ::after + corpo Montserrat caixa livre"
```

---

## Task 4: Estilo treino-dino

**Files:**
- Modify: `templates/social-media/carrossel/estilos/treino-dino/slide.html`
- Modify: `templates/social-media/carrossel/estilos/treino-dino/estilo.md`

- [ ] **Step 1: Substituir o CSS do swipe cue**

Em `treino-dino/slide.html`, substituir o bloco:
```css
    .slide.capa .swipe-cue {
      margin-top: 22px;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-family: var(--font-body);
      font-size: 26px;
      font-weight: 300;
      letter-spacing: 0;
      text-transform: uppercase;
      color: rgba(255,255,255,.92);
    }
    .slide.capa .swipe-cue svg {
      height: 0.72em;
      width: auto;
      display: block;
    }
```
por:
```css
    .slide.capa .swipe-cue {
      margin-top: 22px;
      display: inline-flex;
      align-items: center;
      gap: 0.4em;
      font-family: var(--font-body);
      font-size: 26px;
      font-weight: 300;
      letter-spacing: 0.04em;
      color: rgba(255,255,255,.92);
    }
    .slide.capa .swipe-cue::after {
      content: "";
      display: inline-block;
      width: 0.60em;
      height: 0.74em;
      background-color: currentColor;
      -webkit-mask: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2010%2016'%3E%3Cpath%20d='M3%201L10%208L3%2015L0%2015L7%208L0%201Z'%20fill='%23000'/%3E%3C/svg%3E") no-repeat center / contain;
              mask: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2010%2016'%3E%3Cpath%20d='M3%201L10%208L3%2015L0%2015L7%208L0%201Z'%20fill='%23000'/%3E%3C/svg%3E") no-repeat center / contain;
    }
```
> Usar o mesmo data-URI travado na Task 1 (igual ao editorial).

- [ ] **Step 2: Substituir o markup do swipe cue**

Em `treino-dino/slide.html`, substituir:
```html
      <div class="swipe-cue" data-slot="swipe-cue">
        <span>Arraste</span>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.4"
                stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
```
por:
```html
      <div class="swipe-cue" data-slot="swipe-cue">ARRASTE</div>
```

- [ ] **Step 3: Logo → 100px**

Em `treino-dino/slide.html`, no bloco `.topbar .logo-img`, substituir:
```css
    .topbar .logo-img {
      height: 32px;
      width: auto;
      display: block;
      opacity: 0.98;
    }
```
por:
```css
    .topbar .logo-img {
      width: 100px;
      height: auto;
      display: block;
      opacity: 0.98;
    }
```

- [ ] **Step 4: Remover `text-transform: uppercase` dos elementos Montserrat**

Em `treino-dino/slide.html`, remover a linha `text-transform: uppercase;` de cada um destes blocos: `.topbar .topic`, `.slide.lista .ex-name`, `.slide.lista .ex-reps`, `.slide.exercicio .ex-name`, `.slide.exercicio .ex-reps`. **NÃO** remover dos 2 blocos `font-family: var(--font-display)` (Anton: título da capa e título do cta).

- [ ] **Step 5: Atualizar `treino-dino/estilo.md`**

Ler `treino-dino/estilo.md` e alinhar os descritores: swipe-cue = chevron `::after`; logo = 100px; elementos Montserrat (tag/ex-name/ex-reps) em caixa livre. Ajustar as linhas pertinentes (ex.: `logo: posição topo-esq` pode ganhar a nota de 100px se o arquivo declara tamanho).

- [ ] **Step 6: Commit**

```bash
git add templates/social-media/carrossel/estilos/treino-dino/slide.html templates/social-media/carrossel/estilos/treino-dino/estilo.md
git commit -m "feat(estilo:treino-dino): swipe ::after + logo 100px + Montserrat caixa livre"
```

---

## Task 5: Estilo layout-dividido (só uppercase)

**Files:**
- Modify: `templates/social-media/carrossel/estilos/layout-dividido/slide.html`
- Modify: `templates/social-media/carrossel/estilos/layout-dividido/estilo.md`

- [ ] **Step 1: Remover `text-transform: uppercase` dos elementos Montserrat**

Em `layout-dividido/slide.html`, remover a linha `text-transform: uppercase;` dos três blocos `font-family: var(--font-body)` que a têm (o stamp/selo "DINO TEAM" e os apoios Montserrat). **NÃO** remover do bloco `font-family: var(--font-display)` (a frase Anton título-topo/título-base) — esse mantém o uppercase. Há também o comentário "Mantenha CAIXA ALTA sempre (Anton)." — esse está correto e fica.

- [ ] **Step 2: Atualizar `layout-dividido/estilo.md`**

Ler `layout-dividido/estilo.md` e alinhar qualquer nota de caixa para a regra por-fonte (Anton CAIXA ALTA, stamp Montserrat caixa livre). layout-dividido não tem swipe/logo — nada a fazer nesses.

- [ ] **Step 3: Commit**

```bash
git add templates/social-media/carrossel/estilos/layout-dividido/slide.html templates/social-media/carrossel/estilos/layout-dividido/estilo.md
git commit -m "feat(estilo:layout-dividido): Montserrat caixa livre (uppercase por-fonte)"
```

---

## Task 6: Atualizar o agente revisor-brand

**Files:**
- Modify: `.claude/agents/revisor-brand.md`

- [ ] **Step 1: Atualizar o conhecimento de identidade visual**

Ler `.claude/agents/revisor-brand.md`. No trecho que descreve a validação de identidade visual (tipografia/caixa/elementos), alinhar às regras novas para o agente **não** acusar drift:
- Caixa: Anton sempre CAIXA ALTA; Montserrat caixa livre (sem `text-transform` forçado). Remover qualquer regra "todo texto CAIXA ALTA".
- Swipe-cue: chevron preenchido via `::after`/mask, proporcional (em), desacoplado do texto — conforme `social-media.md`.
- Logo: 100px (`width:100px; height:auto`) em todos os estilos.
- Manter a referência de que a fonte de verdade é `brand/social-media.md` + `brand/referencias-visuais.md`.

Se o agente não enumera essas regras explicitamente (e só aponta para os docs de brand), confirmar que ele lê esses dois arquivos e que nenhuma regra hardcoded contradiz o novo. Fazer os ajustes mínimos necessários.

- [ ] **Step 2: Commit**

```bash
git add .claude/agents/revisor-brand.md
git commit -m "chore(agent:revisor-brand): validar uppercase por-fonte + swipe/logo definitivos"
```

---

## Task 7: Validação headless (mask renderiza) + sign-off

**Files:**
- Create (temp): `scripts/_shot-estilo.mjs`

- [ ] **Step 1: Script de screenshot headless**

Create `scripts/_shot-estilo.mjs`:
```js
// Screenshot de validação: renderiza cada estilo/slide.html e salva PNG.
// Confirma headless que o mask do chevron, a logo e a caixa renderizam sem erro.
import puppeteer from "puppeteer";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const files = [
  "templates/social-media/carrossel/estilos/editorial/slide.html",
  "templates/social-media/carrossel/estilos/treino-dino/slide.html",
  "templates/social-media/carrossel/estilos/layout-dividido/slide.html",
];
const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
for (const f of files) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(pathToFileURL(resolve(f)).href, { waitUntil: "networkidle0", timeout: 60000 });
  const out = f.replace(/\//g, "__") + ".png";
  await page.screenshot({ path: `scripts/_shot-${out}`, fullPage: true });
  console.log(`ok: ${f}${errors.length ? " — ERROS: " + errors.join("; ") : ""}`);
  await page.close();
}
await browser.close();
console.log("screenshots em scripts/_shot-*.png");
```

- [ ] **Step 2: Rodar**

Run: `node scripts/_shot-estilo.mjs`
Expected: imprime `ok:` para os 3 estilos, sem "ERROS". Gera `scripts/_shot-*.png`. Se aparecer erro de página, investigar (mask malformado, etc.).

- [ ] **Step 3: CHECKPOINT — sign-off visual do usuário**

O controller mostra os PNGs (e/ou pede o usuário abrir os `slide.html` no browser). Validar:
- Swipe cue: chevron preenchido, proporcional ao texto, no peso travado na Task 1.
- Logo: 100px em editorial e treino-dino (confirmar que a topbar do treino-dino ficou aceitável com a logo grande — decisão "100px literal").
- Caixa: títulos Anton em CAIXA ALTA; corpo/sub/labels Montserrat na caixa autorada (placeholders editoriais em caixa natural).

Ajustes que o usuário pedir voltam às Tasks 2-5 (e ao data-URI do chevron, se for peso).

- [ ] **Step 4: Remover artefatos temporários**

```bash
rm -f scripts/_shot-estilo.mjs scripts/_shot-*.png templates/social-media/carrossel/estilos/_preview-swipe-cue.html
```
(Não versionados — sem commit. Confirmar `git status` limpo desses temporários.)

---

## Self-Review (cobertura do spec)

- **A. Swipe cue definitivo:** Task 1 (preview+lock) + Tasks 3/4 (markup `::after` + CSS mask) + Task 2 §Swipe-cue (canônico). ✔
- **B. Uppercase por-fonte:** Task 2 (referencias-visuais + social-media) + Tasks 3/4/5 (remoção de `text-transform` Montserrat, mantém Anton) + placeholders (Task 3). ✔
- **C. Logo 100px:** Task 2 §Logo + Task 4 step 3 (treino-dino); editorial já 100px (verificado no map). ✔
- **D. Propagação + revisor-brand:** Task 2 (brand) + Tasks 3/4/5 (estilos + estilo.md) + Task 6 (revisor-brand). ✔
- **Validação:** Task 7 (screenshot headless confirma mask + sign-off visual). ✔

Sem placeholders soltos — o chevron tem default concreto (Variante B) tunável no checkpoint. Nomes/tokens consistentes (mesmo data-URI em editorial e treino-dino; mapa elemento→fonte explícito). Sem teste unitário por ser HTML/CSS+docs — validação é visual/headless, declarada.
