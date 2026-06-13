# Phase 6: Pipeline de Artigos - Research

**Researched:** 2026-06-13
**Domain:** Brand-OS skill → site MDX bridge (deterministic Node promote script + `next build` gate + git commit, single repo, two npm packages)
**Confidence:** HIGH (every load-bearing claim verified empirically in this repo this session)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Modelo = **bridge**. `/novo-artigo` mantém o draft em `export/conteudos/blog/<slug>/artigo.mdx` E ganha um passo final "promover ao site" que produz `site/content/blog/<slug>.mdx`. NÃO é rewrite nem skill separada (continua 1 comando).
- **D-02:** Montagem + validação + escrita do arquivo do site = **script determinístico Node** (padrão `scripts/memory/append_registro_angulos.js`). A skill resolve os valores dos campos no briefing e os passa ao script como args; o script monta o frontmatter, valida e escreve.
- **D-03:** `category` escolhida **direto no briefing** entre as 4 do site (`treino`/`nutricao`/`mentalidade`/`bastidores`), confirmada no ⏸. **Não** derivar de `pilar`. `pilar`/`verdade_servida` da marca seguem no draft; `category` é campo explícito.
- **D-04:** `author` **SEMPRE perguntado no briefing** entre `ramon-dino` e `mauri-rosolen` (sem default). Nunca `"Dino Team"`.
- **D-05:** O script **valida o frontmatter montado contra o MESMO schema zod do site** (importar/espelhar `FrontmatterSchema` de `site/lib/blog.ts`) ANTES de escrever; falha rápido com mensagem clara. `next build` é backstop, não 1ª defesa.
- **D-06:** 8 campos obrigatórios = `title`, `slug`, `date`, `author`, `category`, `description`, `cover`, `featured`. Defaults: `date`=hoje (`YYYY-MM-DD`), `featured`=`false`, `example` omitido. Chaves extras da marca (`verdade_servida`, `pilar`) podem permanecer no frontmatter (zod ignora chaves desconhecidas) — discrição.
- **D-07:** `cover` aponta para uma capa default on-brand compartilhada, **COMMITADA e existente** (ex. `/blog/covers/_default.webp`, monocromática). Criar `site/public/blog/covers/` + o arquivo default faz parte desta fase.
- **D-08:** Gate da skill = `cd site && npm run build` **completo** (autoritativo). Pré-validação zod do script falha cedo; build é a palavra final. Build vermelho ⇒ artigo não é dado por pronto.
- **D-09:** Colisão de slug checada **CEDO no briefing**: varrer `site/content/blog/` pelos slugs existentes antes de escrever; se colidir, falhar/sufixar e reconfirmar no ⏸. (O loader NÃO quebra em slug duplicado — sombreia em silêncio.)
- **D-10:** A skill **commita** o `.mdx` (+ capa default, se nova) após o gate `revisor-brand` aprovar E o build passar verde. Mensagem de commit a critério do executor.
- **D-11:** Esta fase **muda um princípio declarado**. Hoje `CLAUDE.md` e a descrição da skill dizem *"a publicação no site é trabalho do GSD do site (não desta skill)"*. Após a fase, `/novo-artigo` publica no site. Atualizar (seguindo as 9 regras de escrita de skills): `description`/frontmatter + `## Fluxo` + entregável + §"Critério de conclusão" de `SKILL.md`, e o ponteiro `/novo-artigo` em `CLAUDE.md`.

### Claude's Discretion

- Local/nome exato do script (`scripts/content/` ou `scripts/blog/`) e a mensagem de commit (D-02/D-10).
- Manter ou dropar `verdade_servida`/`pilar` no frontmatter do site (zod ignora — rastreabilidade vs limpeza) (D-06).
- Defaults `date`=hoje, `featured`=false (D-06).
- **Preservar** o write-back ao `registro-angulos` (passo 7 atual da skill) — a promoção ao site é passo adicional, não o substitui.
- A arte da capa default em si é placeholder monocromático; o usuário fornece a real depois.

### Deferred Ideas (OUT OF SCOPE)

- **Lote / multi-artigo** — fora; 1 artigo por execução.
- **Capa via banco de imagens (Drive/arquivista) ou geração de imagem** — fora; default placeholder por ora.
- **Imagem de capa real por-slug** — content-ops posterior (usuário troca o default).
- **Mapeamento automático `pilar`→`category`** — descartado em favor da escolha direta (D-03).
- **Imagens inline no corpo do artigo** — fora; corpo segue prosa MDX.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BLOG-11 | Skill `novo-artigo` — agentes (pesquisa/copy/revisão) produzem MDX versionado no contrato do schema BLOG-01 | A research entrega: (1) o contrato exato de BLOG-01 lido de `site/lib/blog.ts` (8 campos + `author`/`category` constraints de `site/lib/site.ts`); (2) o mecanismo determinístico de montagem+validação+escrita (mirror vs import, §Pitfall 1); (3) o gate `next build` confirmado verde + tempo (~6s) + lint pré-quebrado (§Code Examples / §Pitfall 4); (4) slug-collision scan (§Pitfall 3); (5) capa default safe-by-construction (§Pitfall 2); (6) os pontos exatos a editar em SKILL.md + CLAUDE.md (D-11, §State of the Art). |
</phase_requirements>

## Summary

Esta fase constrói a **primeira ponte explícita brand-OS → `site/`**: a skill `/novo-artigo` ganha um passo final que invoca um script Node determinístico, o qual monta o frontmatter BLOG-01, valida, escreve `site/content/blog/<slug>.mdx`, roda `next build` como gate, e a skill commita. Quatro fatos empíricos verificados nesta sessão fixam o desenho:

1. **Dois `package.json`, duas árvores de deps.** A raiz é `dino-team-content-pipeline` (`"type": "module"`, deps = `puppeteer`/`jsdom` apenas) e `site/` é o Next.js app (zod **4.4.3**, gray-matter **4.0.3**). Os scripts brand-OS existentes têm **zero deps externas** — `avaliar_politica.js` e `briefings_do_dia.js` chegam a hand-roll um parser YAML mínimo só para não depender de nada. A raiz tem `zod@3.25.76` **transitivamente** (via puppeteer), o que é uma armadilha de versão: validar contra v3 um schema escrito em v4 diverge em `z.coerce`/error API. `gray-matter` **não** existe na raiz.

2. **O schema `FrontmatterSchema` NÃO é exportado** de `site/lib/blog.ts` (só `getAllPosts`/`getPostBySlug`/`getPostsByCategory` + os tipos). "Importar o schema" exige primeiro editar `blog.ts` para exportá-lo, e ainda assim depende de Node ≥22.6 type-stripping + `site/node_modules` instalado + roda o side-effect de leitura de diretório do módulo. **Recomendação: espelhar (mirror) o schema** com guarda explícita, não importar.

3. **O gate `next build` é barato e confiável**: build verde (warm e cold) em **~6s**, exit 0; gera estaticamente os 4 artigos via `generateStaticParams` (o loader roda em build-time — frontmatter inválido aborta o build, confirmado pela doc do próprio `blog.ts`). **`npm run lint` está pré-quebrado** (2 erros em `ConsentProvider.tsx:68` + `ShareBar.tsx:72`, exit ≠ 0, herdados das Fases 03/04) — o gate **tem que ser `next build`**, nunca `npm run lint`.

4. **Repo único.** `site/.git` não existe, sem `.gitmodules`, `site/content/blog/*` é tracked pela raiz. O `git commit` da skill é operação single-repo trivial — sem armadilha de contexto git separado.

**Primary recommendation:** Criar `scripts/content/promover_artigo.js` (ESM, molde `append_registro_angulos.js`, **zero deps externas** — hand-roll a validação dos 8 campos + escrita YAML do frontmatter, espelhando `FrontmatterSchema`); validar `author ∈ AUTHORS` e `category ∈ {4}` explicitamente (teeth real: author inválido quebra o build em `AuthorBlock`); checar colisão de slug varrendo `site/content/blog/*.mdx`; usar a capa default committed `/blog/covers/_default.webp`; gate = `cd site && npm run build` (exit code); skill commita 1 artigo (+ capa se nova). Editar SKILL.md + CLAUDE.md (D-11) seguindo as 9 regras.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Resolver valores dos campos (briefing: category, author, slug, description) | Skill (orquestração brand-OS) | — | Decisão editorial/contextual; a skill lê brand + pausa no ⏸. Não é determinístico. |
| Montar + validar + escrever o `.mdx` do site | Script Node determinístico (`scripts/`) | — | Operação mecânica/determinística — não pode "esquecer campo". CLAUDE.md: ação determinística → script. |
| Gate de qualidade do artefato | Build do site (`next build`) | Pré-validação zod-espelhada no script | Build é a palavra final (pega MDX/JSX/author-lookup); o script falha cedo com mensagem clara. |
| Detecção de colisão de slug | Script/skill (scan de `site/content/blog/`) | — | O loader do site NÃO detecta (sombreia em silêncio) — precisa preceder a escrita. |
| Persistência (commit do artefato no repo) | Skill (git, single repo) | — | A skill orquestra o commit após gate verde; brand-OS e site são o mesmo repo. |
| Renderização da capa/listagem | Site (RSC `PostCard`/article hero) | — | Já existe (Fase 04); a fase só garante que o default existe e renderiza limpo. |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js (built-in `fs`/`path`) | ≥20 (repo engines), ambiente atual v24.15.0 | Ler draft, montar/escrever `.mdx`, escanear slugs | [VERIFIED: `package.json` engines + `node --version`] Padrão de TODO script brand-OS — zero deps. |
| `next build` (via `site/`) | next **16.2.6** | Gate de qualidade autoritativo (D-08) | [VERIFIED: `site/package.json` + build run exit 0] O throw do loader em build-time É o gate (confirmado por `generateStaticParams`). |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `gray-matter` | 4.0.3 (em `site/node_modules`) | Serializar frontmatter YAML + corpo | **Apenas se** optar por importar/usar deps do site. O round-trip foi testado OK (§Code Examples). **Recomendação: NÃO usar — hand-roll a escrita YAML** (3-quote rule abaixo) para manter o script deps-free como os irmãos. |
| `zod` | 4.4.3 (`site/`) / 3.25.76 (raiz, transitivo) | Validar frontmatter | **Não importar nem do site nem da raiz** — mismatch de versão (v3 raiz vs v4 site) é footgun. Mirror a validação como checagem de campos hand-rolled. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Mirror hand-rolled (recomendado) | Importar `FrontmatterSchema` de `site/lib/blog.ts` | Exige exportar o schema (hoje não é exportado), Node TS type-stripping (≥22.6, emite warning `MODULE_TYPELESS_PACKAGE_JSON`), `site/node_modules` instalado, e arrasta side-effects do módulo. Acopla o script ao runtime do site. **Mais frágil.** Testado: import funciona MAS o schema não está exportado. |
| Script deps-free (recomendado) | Script usando `gray-matter`+`zod` do `site/node_modules` | Resolve só se rodar com cwd/arquivo dentro da árvore do site; quebra se `site/node_modules` ausente; versão de zod ambígua. O padrão do repo é deps-free. |
| `scripts/content/promover_artigo.js` | `scripts/blog/promover_artigo.js` | Cosmético (D-02 discretion). `scripts/content/` generaliza melhor para futuros canais; `scripts/blog/` é mais literal. Sem impacto técnico. |

**Installation:**
```bash
# Nenhuma instalação. O script recomendado é deps-free (built-in node:fs/node:path).
# Se (contra recomendação) optar por usar gray-matter/zod, eles JÁ existem em site/node_modules — não instalar nada.
```

**Version verification (executado nesta sessão):**
- `next` 16.2.6 — [VERIFIED: `site/package.json`]
- `zod` site 4.4.3 / raiz 3.25.76 (transitivo via puppeteer) — [VERIFIED: `cat */node_modules/zod/package.json`]
- `gray-matter` 4.0.3 (só em `site/`) — [VERIFIED: `cat site/node_modules/gray-matter/package.json`]
- Node v24.15.0, npm 11.12.1 — [VERIFIED: `node --version`]

## Package Legitimacy Audit

> Esta fase **não instala nenhum pacote novo**. O script recomendado usa apenas built-ins do Node (`node:fs`, `node:path`). Todas as libs citadas (next, zod, gray-matter, reading-time) já estão no `site/package.json`, foram instaladas e verificadas nas Fases 04/05. Nenhum risco de slopsquatting nesta fase.

| Package | Registry | Disposition |
|---------|----------|-------------|
| (nenhum novo) | — | N/A — fase deps-free; sem `npm install`. |

**Packages removed due to slopcheck [SLOP] verdict:** none (no install step)
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```
/novo-artigo <tema>
      │
      ▼
  [1-2] parse input + escolher verdade servida (skill, lê brand-book §Verdades)
      │
      ▼
  [3] briefing inline (skill, lê brand/ + registro-angulos)
      │   resolve: ângulo, pilar, objetivo, recorte, slug
      │   + NOVO (D-03): category ∈ {treino,nutricao,mentalidade,bastidores}
      │   + NOVO (D-04): author ∈ {ramon-dino, mauri-rosolen}
      │   + NOVO (D-09): scan site/content/blog/*.mdx → slug livre?  ──┐ colide?
      │                                                                 ▼ sufixa/falha
      ▼  ⏸ confirma plano (inclui category + author + slug)        reconfirma no ⏸
  [4] /pesquisar-tema (condicional, informacional)
      │
      ▼
  [5] escrever artigo MDX inline → export/conteudos/blog/<slug>/artigo.mdx  ⏸
      │   (DRAFT — frontmatter da marca; preservado, D-01)
      ▼
  [6] revisor-brand (gate de marca: tom + compliance) ── REPROVADO → ajusta, re-roda
      │ APROVADO
      ▼
  [7] write-back registro-angulos (preservado — passo existente)
      │
      ▼
  [8 NOVO] PROMOVER AO SITE:
      │   skill chama: node scripts/content/promover_artigo.js \
      │       --slug ... --title ... --description ... --author ... \
      │       --category ... --date <hoje> --cover /blog/covers/_default.webp \
      │       --featured false --draft export/.../artigo.mdx
      │
      ▼   ┌──────────────────────────────────────────────────────┐
          │ promover_artigo.js (determinístico, deps-free):       │
          │  a. valida 8 campos (mirror BLOG-01) + author∈AUTHORS  │
          │     + category∈enum  → falha cedo, msg clara          │
          │  b. lê corpo do draft (strip frontmatter da marca)    │
          │  c. monta frontmatter BLOG-01 (escrita YAML 3-quote)  │
          │  d. re-scan slug em site/content/blog/ (defesa 2)     │
          │  e. escreve site/content/blog/<slug>.mdx              │
          └──────────────────────────────────────────────────────┘
      │
      ▼
  [9 NOVO] GATE: cd site && npm run build   (exit 0? → verde; ≠0 → não pronto)
      │ verde
      ▼
  [10 NOVO] git commit: site/content/blog/<slug>.mdx (+ capa default se nova)
      │
      ▼
  entrega ao usuário (mensagem final — publicado no site)
```

### Recommended Project Structure
```
scripts/
└── content/
    └── promover_artigo.js   # NOVO — molde de append_registro_angulos.js, deps-free
site/
├── content/blog/
│   └── <slug>.mdx           # NOVO por execução — escrito pelo script
└── public/blog/covers/
    └── _default.webp        # NOVO — capa default committed, monocromática (D-07)
.claude/skills/novo-artigo/
└── SKILL.md                 # EDITADO — passos 8-10, description, entregável, critério (D-11)
templates/
└── artigo.md                # opcional: alinhar/anotar o mismatch (origem do gap)
CLAUDE.md                    # EDITADO — ponteiro /novo-artigo + §Blog (D-11)
```

### Pattern 1: Script CLI determinístico com args (molde do repo)
**What:** Node ESM com shebang, `parseArgs(process.argv.slice(2))`, validação de args obrigatórios com `usage()` + exit 1, escape de células, override de caminho via env var para testes.
**When to use:** Toda operação mecânica brand-OS. É exatamente o contrato de `append_registro_angulos.js`.
**Example:**
```javascript
// Source: scripts/memory/append_registro_angulos.js (este repo, VERIFIED)
#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

function parseArgs(argv) { /* --key value pairs; faltou valor → usage() */ }
const REQUIRED = ['slug','title','description','author','category'];
for (const k of REQUIRED) if (!args[k]) { console.error(`--${k} obrigatório`); usage(); }
// Defaults de discrição (D-06):
const date = args.date || new Date().toISOString().slice(0,10); // YYYY-MM-DD
const featured = args.featured === 'true';
const cover = args.cover || '/blog/covers/_default.webp';
```

### Pattern 2: Mirror do schema BLOG-01 (sem importar zod)
**What:** Replicar a constraint dos 8 campos como checagens hand-rolled, espelhando `FrontmatterSchema`.
**When to use:** No `promover_artigo.js`, antes de escrever (D-05 "falha rápido").
**Example:**
```javascript
// Mirror de site/lib/blog.ts FrontmatterSchema (VERIFIED contra o arquivo)
const CATEGORIES = ['treino','nutricao','mentalidade','bastidores'];
const AUTHORS = ['ramon-dino','mauri-rosolen']; // espelha keys de site/lib/site.ts AUTHORS
function validate(fm) {
  const errs = [];
  for (const f of ['title','slug','date','author','category','description','cover'])
    if (typeof fm[f] !== 'string' || !fm[f]) errs.push(`${f}: obrigatório (string não-vazia)`);
  if (typeof fm.featured !== 'boolean') errs.push('featured: obrigatório (boolean)');
  if (!CATEGORIES.includes(fm.category)) errs.push(`category: "${fm.category}" não está em ${CATEGORIES.join('|')}`);
  if (!AUTHORS.includes(fm.author)) errs.push(`author: "${fm.author}" não é key de AUTHORS (${AUTHORS.join('|')}) — NUNCA "Dino Team" (D-04)`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fm.date)) errs.push(`date: "${fm.date}" deve ser YYYY-MM-DD`);
  if (errs.length) { console.error('[promover] frontmatter inválido:\n - ' + errs.join('\n - ')); process.exit(1); }
}
```
> **Por que author/category são teeth reais e não só zod:** `site/app/blog/[slug]/page.tsx:137` faz `AUTHORS[post.author]` (pode ser `undefined`) e `:294` passa `author ?? post.author` ao `AuthorBlock`, que destructura `const { name } = AUTHORS[input]` → **throw em build** se a key for inválida. O zod do site tipa `author` como `z.string()` (não pega key ruim), mas o `AuthorBlock` pega — em build. A pré-checagem do script falha mais cedo e com msg melhor.

### Pattern 3: Escrita YAML do frontmatter (3-quote rule, deps-free)
**What:** Citar strings com aspas simples sempre que contiverem `:` ou `"` (ou por padrão, para segurança); `date` como string `'YYYY-MM-DD'`; `featured` bare boolean.
**When to use:** Ao montar o bloco `---...---` sem gray-matter.
**Example:**
```javascript
function yamlStr(s) { return `'${String(s).replace(/'/g, "''")}'`; } // single-quote escape YAML
const frontmatter = [
  '---',
  `title: ${yamlStr(fm.title)}`,
  `slug: ${yamlStr(fm.slug)}`,
  `date: ${fm.date}`,            // bare YYYY-MM-DD — z.coerce.date() aceita (VERIFIED)
  `author: ${fm.author}`,        // key simples, sem aspas
  `category: ${fm.category}`,
  `description: ${yamlStr(fm.description)}`,
  `cover: ${yamlStr(fm.cover)}`,
  `featured: ${fm.featured}`,    // true/false bare
  // discrição D-06: manter rastreabilidade da marca (zod ignora chaves extras)
  ...(fm.verdade_servida ? [`verdade_servida: ${yamlStr(fm.verdade_servida)}`] : []),
  ...(fm.pilar ? [`pilar: ${yamlStr(fm.pilar)}`] : []),
  '---',
  '',
].join('\n');
```
> **Validado empiricamente:** `gray-matter.stringify` (que usa js-yaml) auto-cita strings com `:`/`"` e re-parseia OK contra o schema; tanto `date` string quanto Date object passam `z.coerce.date()`. Hand-roll com aspas simples reproduz esse comportamento sem a dep. **Se preferir robustez máxima de serialização, usar `gray-matter` de `site/node_modules` é a alternativa testada-OK** (mas reintroduz a dep).

### Anti-Patterns to Avoid
- **Importar `zod` da raiz do repo:** é v3.25.76 (transitivo via puppeteer), enquanto o site usa v4.4.3. Validar com a API errada mascara/diverge erros. Mirror em vez de importar.
- **Usar `npm run lint` como gate:** já sai exit ≠ 0 por 2 erros pré-existentes (ConsentProvider/ShareBar). O gate é `next build` (D-08).
- **Confiar só no zod do site para `author`:** o schema é `z.string()` — não pega `"Dino Team"`. A teeth real é o `AuthorBlock` lookup (build throw). Pré-checar `author ∈ AUTHORS` no script.
- **Escrever o `.mdx` antes de validar:** D-05 manda validar primeiro, falhar rápido. Não deixar um arquivo inválido no disco para o build derrubar.
- **Assumir que slug duplicado quebra o build:** NÃO quebra — `getPostBySlug` pega o 1º e sombreia. Scan explícito (D-09) é obrigatório.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Saber se o frontmatter satisfaz BLOG-01 | Um schema "parecido" inventado | **Mirror EXATO** dos 8 campos + enums de `site/lib/blog.ts` e keys de `site/lib/site.ts` | A fonte de verdade é o site; divergir reintroduz o gap que a fase fecha. Ler, não inventar. |
| Validar o artefato de ponta a ponta (MDX/JSX/author-lookup) | Re-checar MDX no script | **`next build`** (D-08) | O build já roda o loader (build-time), o MDX eval, e o `AuthorBlock` lookup. É o gate autoritativo, ~6s. |
| Detectar colisão de slug | Parser de frontmatter completo | `readdirSync` + regex `^slug:` por arquivo (cheap) | Não precisa de gray-matter; uma varredura de linha basta (§Code Examples). |
| Serializar YAML do frontmatter | Concatenação ingênua sem quoting | 3-quote rule (Pattern 3) **ou** `gray-matter.stringify` (já em `site/`) | Título com `:` ou aspas quebra YAML silenciosamente; o quoting é o detalhe que faz "válido na 1ª tentativa". |

**Key insight:** O valor da fase é **determinismo + paridade exata com o contrato do site**. Tudo que "decide" (category, author, slug, copy) é da skill/⏸; tudo que "monta" é do script; tudo que "julga" é o `next build`. Não misturar.

## Runtime State Inventory

> Esta fase muda um princípio declarado e cria um artefato novo committed. Não há rename/migração de dados, mas há estado a inventariar.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | **Nenhum** — não renomeia chaves/coleções. O `registro-angulos.md` continua recebendo `--canal blog` (write-back preservado, passo 7). Verified: `scripts/memory/append_registro_angulos.js` inalterado. | Nenhuma migração. |
| Live service config | **Nenhum** — sem n8n/Datadog/Tailscale envolvidos. Verified: nenhuma config externa referencia `/novo-artigo`. | Nenhuma. |
| OS-registered state | **Nenhum** — `/novo-artigo` não tem routine `/schedule` (apenas `/novo-post --auto` poll, pauta semanal e pesquisa mensal a têm). Verified contra `orquestracao/rotas.yaml` referência em CLAUDE.md. | Nenhuma. |
| Secrets/env vars | **Nenhum** — o script não lê secret. `next build` não precisa de `RESEND_*` (form é env-gated, Fase 05) nem de `NEXT_PUBLIC_SITE_URL` (tem fallback em `site/lib/site.ts`). Verified: build verde sem env vars setadas. | Nenhuma. |
| Build artifacts / installed packages | **`site/.next/`** — cache de build (já existe). Nenhum egg-info/binário. Nenhum `npm install` novo (fase deps-free). | Nenhuma — o gate `next build` regenera o cache. |
| Princípio declarado (estado documental) | `CLAUDE.md:54` (ponteiro `/novo-artigo`: *"A publicação no site é trabalho do GSD do site"*), `CLAUDE.md:201` (§Blog: *"Artigo MDX draft pronto para integração no site"*), `SKILL.md` frontmatter `description` (mesma frase), `SKILL.md` §"Princípio central" (*"A publicação no site é fora de escopo"*), §"Entregável final", §"Critério de conclusão", passo 7 mensagem (*"integração no site é trabalho do GSD"*). | **Editar todos** (D-11) — ver §State of the Art para os locais exatos. |

## Common Pitfalls

### Pitfall 1: Module resolution — o script não acha zod/gray-matter (ou acha a versão errada)
**What goes wrong:** Um script ESM em `scripts/` que faz `import { z } from "zod"` resolve a partir do diretório do arquivo subindo a árvore: encontra `zod@3.25.76` (raiz, transitivo) — **não** o `zod@4.4.3` do site. Importar `gray-matter` na raiz falha (`ERR_MODULE_NOT_FOUND` — não existe lá).
**Why it happens:** Dois `package.json`, duas `node_modules`. Node resolve por proximidade do importador, não pela cwd.
**How to avoid:** Script **deps-free** (built-ins `node:fs`/`node:path`) + mirror da validação. Verified: `import("../../site/lib/blog.ts")` de `scripts/content/` funciona (resolve as deps do site a partir de `blog.ts`), MAS o schema não é exportado e arrasta side-effects — por isso mirror, não import.
**Warning signs:** `ERR_MODULE_NOT_FOUND: gray-matter`; erros de zod com API diferente do esperado; `MODULE_TYPELESS_PACKAGE_JSON` warning.

### Pitfall 2: A capa "default" não existe → 404 em runtime (NÃO quebra o build, mas suja a UI)
**What goes wrong:** `cover` é `z.string()` obrigatória; o `PostCard`/article hero fazem `post.cover ?` (truthy) → sempre entram no ramo `<Image src={post.cover}>`. Se o arquivo não existir em `public/`, é 404 **em runtime** (não em build).
**Why it happens:** `next/image` não verifica existência do arquivo em build-time; serve `/public/...` como está. **Verified:** os 4 artigos-semente já apontam para `/blog/covers/<slug>.webp` que **não existem** e o build é verde.
**How to avoid:** Criar `site/public/blog/covers/_default.webp` (committed, existente) e apontar todo `cover` gerado para ele (D-07). O placeholder branch (`post.cover ?`) NÃO é acionado porque cover é não-vazia — então o arquivo TEM que existir para a listagem renderizar limpa (critério 2).
**Warning signs:** `/blog` renderiza, mas imagens aparecem quebradas no browser (404 no devtools); Lighthouse reclama de imagem ausente.

### Pitfall 3: Slug duplicado sombreia em silêncio (build não pega)
**What goes wrong:** Dois `.mdx` com o mesmo `slug` no frontmatter → `getPostBySlug` retorna o 1º (`.find`), o 2º some da rota sem erro. `generateStaticParams` pode até gerar params duplicados, mas não lança.
**Why it happens:** O loader valida shape, não unicidade. **Verified:** `getPostBySlug` em `site/lib/blog.ts:118` usa `.find`.
**How to avoid:** Scan cedo (D-09): `readdirSync('site/content/blog')` + extrair `^slug:` de cada arquivo; se colidir, sufixar/falhar e reconfirmar no ⏸. Re-scan no script como 2ª defesa antes de escrever.
**Warning signs:** Artigo "publicado" não aparece em `/blog`; rota `/blog/<slug>` mostra o artigo errado.

### Pitfall 4: Usar lint como gate (ou achar que o build está vermelho por causa do lint)
**What goes wrong:** `npm run lint` sai exit ≠ 0 hoje (2 erros `react-hooks/set-state-in-effect` em `ConsentProvider.tsx:68` e `ShareBar.tsx:72`, herdados das Fases 03/04). Se a skill gatekeepar por lint, NUNCA passa.
**Why it happens:** Erros pré-existentes, fora do escopo desta fase. **Verified:** `npm run lint` exit ≠ 0; `next build` exit 0.
**How to avoid:** Gate é `cd site && npm run build` e checar o exit code (D-08). Documentar na skill que lint não é o gate.
**Warning signs:** Skill reporta "build falhou" mas o `.next` foi gerado e `/blog` renderiza.

### Pitfall 5: Frontmatter da marca vaza para o site / corpo com frontmatter duplo
**What goes wrong:** O draft em `export/` tem frontmatter da marca (`pilar`/`narrativa`/`data`/`autor`/`status`). Copiar o draft inteiro para `site/content/blog/` levaria `autor: "Dino Team"` (inválido — quebra `AuthorBlock` em build) e `data:`/`status:` (não-BLOG-01).
**Why it happens:** Os dois schemas divergem — é o gap motivador da fase (CONTEXT §domain).
**How to avoid:** O script **descarta** o frontmatter do draft e monta o frontmatter BLOG-01 do zero a partir dos args resolvidos no briefing; só o **corpo** (pós-`---`) do draft é reaproveitado. Manter `verdade_servida`/`pilar` é discrição (D-06) — mas como chaves novas montadas, não copiadas do bloco antigo.
**Warning signs:** Build falha em `AuthorBlock` (`Cannot destructure ... undefined`); dois blocos `---` no `.mdx` final.

## Code Examples

### Scan de colisão de slug (cheap, deps-free)
```javascript
// Source: pattern derivado de site/lib/blog.ts getAllPosts (VERIFIED) — sem gray-matter
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
function existingSlugs(contentDir) {
  return readdirSync(contentDir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => {
      const raw = readFileSync(join(contentDir, f), 'utf8');
      const m = raw.match(/^slug:\s*["']?([^"'\n]+)["']?\s*$/m);
      return m ? m[1].trim() : null;
    })
    .filter(Boolean);
}
const dir = resolve('site/content/blog');
if (existingSlugs(dir).includes(args.slug)) {
  console.error(`[promover] slug colide: "${args.slug}" já existe em ${dir}`);
  process.exit(1); // skill reconfirma no ⏸ (sufixa ou novo slug)
}
```

### Gate `next build` a partir da skill (detecção pass/fail)
```bash
# Source: VERIFIED nesta sessão — exit 0 verde (~6s warm e cold), aborta em frontmatter/author inválido
cd site && npm run build
echo "exit=$?"   # 0 = verde (artigo pronto); ≠0 = NÃO pronto (D-08)
```

### gray-matter round-trip (referência — caso opte por usar a dep do site)
```javascript
// Source: VERIFIED nesta sessão rodando de dentro de site/ (resolve site/node_modules)
import matter from "gray-matter";
// matter.stringify(body, data) auto-cita "title: 'O treino: o que voce mantem'"
// date como "2026-06-13" (string) OU new Date(...) → ambos re-parseiam OK no z.coerce.date()
// String form serializa mais limpo: date: '2026-06-13' vs date: 2026-06-13T00:00:00.000Z
```

## State of the Art — Princípio que muda (D-11)

| Old (hoje) | New (após a fase) | Local exato | Impact |
|------------|-------------------|-------------|--------|
| `/novo-artigo` entrega draft em `export/`; *"A publicação no site é trabalho do GSD do site"* | `/novo-artigo` publica no site (escreve `site/content/blog/<slug>.mdx`, gate build, commita) | `CLAUDE.md:54` (ponteiro skill) | Reescrever a última frase do bullet. |
| §Blog: *"Artigo MDX draft pronto para integração no site"* | *"Artigo MDX publicado no site (passa `next build`)"* | `CLAUDE.md:201` | Atualizar a descrição da função. |
| `description` frontmatter: *"...Output em `export/...`. A publicação no site é trabalho do GSD do site"* | Incluir o passo de promoção + gate build + commit | `SKILL.md:3` (frontmatter) | Reescrever o `description` (1 linha). |
| `## Fluxo` 7 passos (termina em write-back) | + passos: promover ao site, gate build, commit (após o gate de marca, preservando write-back) | `SKILL.md:11-21` | Adicionar linhas na tabela — **numeração linear 1..N (regra 1)**, condicionais como sub-bullets (regra 3), pausa parte do passo (regra 4). **Corrigir o `3.⏸` atual** (viola a regra 1 — deve virar parte do passo 3). |
| §"Princípio central": *"A publicação no site é fora de escopo"* | Remover/reescrever — agora a promoção é determinística via script | `SKILL.md:182-186` | Reescrever o 2º parágrafo. |
| §"Entregável final": só `export/.../artigo.mdx` | + `site/content/blog/<slug>.mdx` (+ capa default) | `SKILL.md:188-193` | Adicionar o artefato do site. |
| §"Critério de conclusão": draft + gate marca + write-back | + `.mdx` do site válido na 1ª tentativa, build verde, aparece na listagem, commitado | `SKILL.md:195-200` | Adicionar os critérios de BLOG-11. |
| Passo 7 msg: *"integração no site é trabalho do GSD"* | *"publicado no site: /blog/<slug>"* | `SKILL.md:165` | Atualizar a mensagem final. |

**9 regras de escrita de skills (CLAUDE.md) que a edição DEVE seguir:**
1. `## Fluxo` numerado linear `1..N` — **o `3.⏸` atual já viola** (corrigir).
2. Cada passo abre com `Lê:` (uma linha) — os passos atuais NÃO usam o formato `Lê:`; ao adicionar passos novos, seguir o padrão da skill (a skill atual lista leituras dentro de cada `### N.` — manter consistência local).
3. Condicionais = sub-bullets do passo-pai (ex.: "se slug colide → sufixa/reconfirma").
4. Pausa (⏸) é parte do passo que a contém — nunca sub-passo.
5. Modo num único bloco (não aplicável — `/novo-artigo` não tem `--auto`).
6. Referência por nome de seção (`§Promover ao site`), nunca por número.
7. Bloco longo compartilhado tem lar canônico (não duplicar texto de outras skills).
8. Fonte única para regra de sistema (não restated specs).
9. Edição = Dino Editor por link (não aplicável — artigo é prosa MDX, não slides).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | A arte da capa default `_default.webp` será fornecida/criada como placeholder monocromático on-brand; o RESEARCH não gera a imagem. O importante (verificado) é que o ARQUIVO exista no path para a listagem renderizar limpa. | Pitfall 2 / D-07 | Se nenhum `.webp` real for committed, a listagem 404a as imagens (mesmo estado dos 4 seeds hoje). Mitiga: qualquer `.webp` monocromático committed resolve. |
| A2 | `next build` em CI/máquina do usuário leva ~6s como aqui. Medido neste repo (4 artigos, cache quente e frio = 6s). | §Summary / Code Examples | Em máquina mais lenta ou com mais artigos, pode subir — mas continua a ser o gate certo; só o tempo varia. |
| A3 | A skill roda o gate `next build` em foreground e lê o exit code; não há cron/headless especial. Consistente com o padrão do repo. | §Code Examples | Se o ambiente exigir build em background, a skill precisa de poll — improvável (build é rápido). |

**Nenhuma `[ASSUMED]` toca compliance/segurança/retenção** — todas são operacionais e de baixo risco, todas com mitigação verificada.

## Open Questions

1. **Manter `verdade_servida`/`pilar` no frontmatter do site?**
   - What we know: o zod do site ignora chaves desconhecidas (`z.object` sem `.strict()`) → não quebra (VERIFIED no schema). Rastreabilidade marca↔site é útil.
   - What's unclear: limpeza do frontmatter público vs. valor de rastreio.
   - Recommendation: manter (discrição D-06) — custo zero, ganho de rastreabilidade. Documentar como chaves montadas (não copiadas do draft).

2. **Nome do script: `scripts/content/` vs `scripts/blog/`?**
   - What we know: ambos funcionam; discrição D-02.
   - Recommendation: `scripts/content/promover_artigo.js` — generaliza para futuros canais (email/comunidade poderiam ganhar promoção análoga); alinhado a `export/conteudos/`.

3. **`templates/artigo.md` deve ser atualizado?**
   - What we know: o template do draft tem o frontmatter da marca (origem do mismatch). O script descarta esse frontmatter, então o template do draft pode permanecer como está.
   - Recommendation: opcional — adicionar uma nota no template explicando que `category`/`author` do site são resolvidos no briefing, não no frontmatter do draft. Não bloqueante.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | script promover + build | ✓ | v24.15.0 (engines ≥20) | — |
| npm | `npm run build` | ✓ | 11.12.1 | — |
| `site/node_modules` | `next build` | ✓ (instalado) | next 16.2.6 | `npm install` em `site/` se ausente |
| zod (site) | só se importar (NÃO recomendado) | ✓ em site/ | 4.4.3 | mirror hand-rolled (recomendado) |
| gray-matter (site) | só se usar serialização via lib | ✓ em site/ | 4.0.3 | escrita YAML hand-rolled (recomendado) |
| git | commit (D-10) | ✓ (repo único) | — | — |

**Missing dependencies with no fallback:** nenhuma.
**Missing dependencies with fallback:** `gray-matter`/`zod` da raiz — ausentes/versão-errada na raiz; fallback é o desenho recomendado (deps-free).

## Validation Architecture

> `.planning/config.json` não foi encontrado nesta árvore (a fase é GSD-managed; nyquist_validation não está explicitamente `false`). Seção incluída.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `node --test` (built-in) — padrão do repo brand-OS |
| Config file | none — `package.json` (raiz) `"test"` roda `node --test scripts/**/...test.js` |
| Quick run command | `node --test scripts/content/promover_artigo.test.js` |
| Full suite command | `npm test` (raiz) — inclui editor/orquestracao/relatorio; **adicionar o glob `scripts/content/*.test.js`** ao script `test` da raiz (Wave 0) |
| Site gate | `cd site && npm run build` (autoritativo, D-08) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BLOG-11 | Script monta frontmatter BLOG-01 válido a partir de args | unit | `node --test scripts/content/promover_artigo.test.js` | ❌ Wave 0 |
| BLOG-11 | Script falha cedo em author inválido (≠ AUTHORS) | unit | idem (`--author "Dino Team"` → exit 1) | ❌ Wave 0 |
| BLOG-11 | Script falha cedo em category fora do enum | unit | idem (`--category foo` → exit 1) | ❌ Wave 0 |
| BLOG-11 | Slug colidente é detectado | unit | idem (seed um `.mdx`, re-promover mesmo slug → exit 1) | ❌ Wave 0 |
| BLOG-11 | `.mdx` escrito re-parseia OK (round-trip) | unit | idem (escreve em tmp via env override, re-lê, valida 8 campos) | ❌ Wave 0 |
| BLOG-11 | Artigo promovido passa `next build` e aparece em `/blog` | integration | `cd site && npm run build` (exit 0) + grep da rota | ✅ (comando existe; cenário é manual/smoke) |

### Sampling Rate
- **Per task commit:** `node --test scripts/content/promover_artigo.test.js`
- **Per wave merge:** `npm test` (raiz) + `cd site && npm run build`
- **Phase gate:** build verde + 1 artigo real promovido aparece em `/blog`

### Wave 0 Gaps
- [ ] `scripts/content/promover_artigo.js` — o script (BLOG-11)
- [ ] `scripts/content/promover_artigo.test.js` — testes unit (usar env override de path, molde de `registrar_execucao.test.js` que já usa `mkdtempSync`/tmpdir)
- [ ] Adicionar `scripts/content/*.test.js` ao `"test"` da raiz `package.json`
- [ ] `site/public/blog/covers/_default.webp` — capa default committed (D-07)

## Security Domain

> `security_enforcement` não está explicitamente `false`. Seção incluída. Esta é uma fase de tooling local (script + skill + commit), não exposta a rede — o threat model é estreito mas real (skill que escreve arquivos + auto-commita).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Sem auth — operação local de dev. |
| V3 Session Management | no | N/A. |
| V4 Access Control | no | N/A. |
| V5 Input Validation | yes | Mirror BLOG-01 + enums `author`/`category` (Pattern 2). Sanitizar o `slug` (kebab `^[a-z0-9-]+$`) antes de usá-lo como **nome de arquivo** (previne path traversal — ver threat abaixo). |
| V6 Cryptography | no | N/A. |
| V12 File & Resources | yes | O script escreve um arquivo cujo nome deriva do `slug` (input). Validar `slug` contra `^[a-z0-9][a-z0-9-]*$` e resolver o destino sob `site/content/blog/` confirmando que o path resolvido permanece nesse diretório. |

### Known Threat Patterns for {script que escreve arquivo + skill que auto-commita}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| `slug` malicioso vira path traversal (`../../etc/...`) ao virar nome de arquivo | Tampering | Validar `slug` `^[a-z0-9][a-z0-9-]*$`; `resolve()` o destino e assert `dest.startsWith(resolve('site/content/blog'))`. |
| Auto-commit varre arquivos não relacionados (escopo amplo) | Tampering | `git add` **apenas** `site/content/blog/<slug>.mdx` e (se nova) `site/public/blog/covers/_default.webp` — nunca `git add .` (D-10 threat-relevant). |
| Corpo MDX injeta JSX/script perigoso | Tampering/XSS | O site já renderiza MDX via `next-mdx-remote-client/rsc evaluate` com `proseComponents` controlados (Fase 04); o corpo vem do draft revisado por `revisor-brand` (gate de marca, passo 6) — defesa-em-profundidade. O script não precisa sanitizar o corpo, mas NÃO deve passar o corpo por `eval`/template não-escapado. |
| `featured: true` em massa (sem querer) destacaria todos | Repudiation/UX | Default `featured=false` (D-06); só `true` por flag explícita. |

## Sources

### Primary (HIGH confidence — verificado neste repo nesta sessão)
- `site/lib/blog.ts` — `FrontmatterSchema` (8 campos, `category` enum, `author` z.string), loader que LANÇA, `getPostBySlug` usa `.find` (slug shadow), comentário confirmando throw em build-time.
- `site/lib/site.ts` — `AUTHORS` (`ramon-dino`/`mauri-rosolen`), `CATEGORIES` (4 slugs), `SITE_URL` env-fallback.
- `site/app/blog/[slug]/page.tsx` — `AUTHORS[post.author]` (:137), `author ?? post.author` ao `AuthorBlock` (:294); `post.cover ?` guard (:263).
- `site/components/blog/PostCard.tsx` — `post.cover ?` truthy guard (cover não-vazia sempre usa `<Image>`).
- `site/components/blog/AuthorBlock.tsx` — `resolveAuthor` destructura `AUTHORS[input]` → throw em key inválida.
- `scripts/memory/append_registro_angulos.js` — molde do script CLI determinístico.
- `package.json` (raiz, `type:module`, deps puppeteer/jsdom) + `site/package.json` (next 16.2.6, zod 4.4.3, gray-matter 4.0.3).
- `.planning/codebase/CONVENTIONS.md` + `STRUCTURE.md` (linha 193: site resolve repo root via `process.cwd()/..`).
- Builds/lints/round-trip executados: `npm run build` exit 0 (~6s warm+cold, gera os 4 artigos via generateStaticParams); `npm run lint` exit ≠ 0 (2 erros pré-existentes); gray-matter round-trip parse OK; `import("site/lib/blog.ts")` OK mas schema não-exportado; zod raiz=3.25.76 vs site=4.4.3.

### Secondary (MEDIUM confidence)
- Node 22.6+/23+ native TS type-stripping (observado: `import('./site/lib/blog.ts')` rodou com warning `MODULE_TYPELESS_PACKAGE_JSON`) — comportamento experimental, motivo adicional para preferir mirror.

### Tertiary (LOW confidence)
- nenhum — todas as decisões load-bearing foram verificadas empiricamente.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versões lidas dos `package.json`/`node_modules` reais; deps-free é o padrão verificado dos scripts irmãos.
- Architecture: HIGH — fluxo derivado da SKILL.md atual + contratos do site lidos diretamente.
- Pitfalls: HIGH — cada pitfall foi reproduzido/confirmado (build verde com covers ausentes; lint vermelho; slug shadow no código; author throw no AuthorBlock; module resolution testado).

**Research date:** 2026-06-13
**Valid until:** 2026-07-13 (estável — depende de contratos internos do repo, não de libs externas em movimento). Re-verificar se `site/lib/blog.ts` mudar o schema ou se `site/package.json` subir zod/next major.
