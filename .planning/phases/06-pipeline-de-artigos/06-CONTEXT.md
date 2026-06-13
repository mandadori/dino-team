# Phase 6: Pipeline de Artigos - Context

**Gathered:** 2026-06-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Fechar o gap draft→publicação: fazer a skill brand-OS `/novo-artigo` produzir um artigo MDX **válido para o site** (schema `BLOG-01`, arquivo flat `site/content/blog/<slug>.mdx`) que passa o gate de build e aparece em `/blog` sem colisão de slug — preservando a revisão de marca/editorial que a skill já tem (`revisor-brand`, passo 6).

Entrega = **BLOG-11** (a skill `/novo-artigo` versiona um MDX que satisfaz `BLOG-01` na 1ª tentativa, passa lint+build, aparece na listagem, e respeita o tom de marca via o gate editorial já existente).

**O gap real (motivador):** o frontmatter do draft atual (`templates/artigo.md`) é um schema DIFERENTE do site — emite `data`/`autor`/`pilar`/`narrativa`/`status` e NÃO emite `date`/`author`(key)/`category`(enum)/`cover`/`featured`. Um draft atual FALHA o loader do site em 5 campos. Reconciliar isso é o coração da fase.

**Fora de escopo:** lote/multi-artigo (1 por execução), geração/seleção de capa via banco de imagens (Drive), imagem de capa real por-slug (content-ops posterior), agendamento. Imagens inline no corpo seguem como estão (prosa MDX).

</domain>

<decisions>
## Implementation Decisions

### Arquitetura da integração (BLOG-11)

- **D-01:** Modelo = **bridge**. `/novo-artigo` mantém o draft em `export/conteudos/blog/<slug>/artigo.mdx` E ganha um **passo final "promover ao site"** que produz `site/content/blog/<slug>.mdx`. Rodar a skill ponta-a-ponta entrega o arquivo do site (critério 1). NÃO é rewrite (o draft é preservado) NEM skill separada (continua 1 comando, `/novo-artigo`).
- **D-02:** A montagem + validação + escrita do arquivo do site é feita por um **script determinístico Node** (padrão do repo — ex. `scripts/memory/append_registro_angulos.js`). A skill **resolve os valores dos campos no briefing** e os passa ao script como args; o script monta o frontmatter, valida e escreve. Determinismo é o que garante "válido na 1ª tentativa" (o script não esquece campo).

### Mapa de frontmatter → BLOG-01

- **D-03:** `category` é **escolhida direto no briefing** entre as 4 do site (`treino`/`nutricao`/`mentalidade`/`bastidores`), confirmada no ⏸ do plano. **Não** derivar de `pilar` (sem mapeamento 1:1 — Método/Resultados/Sobre Ramon/Comunidade não casam). O `pilar`/`verdade_servida` da marca seguem no draft; a `category` do site é um campo explícito.
- **D-04:** `author` é **SEMPRE perguntado no briefing** entre `ramon-dino` e `mauri-rosolen` (sem default). Nunca `"Dino Team"` (inválido — não é key de `AUTHORS`).
- **D-05:** O script **valida o frontmatter montado contra o MESMO schema zod do site** (importar/espelhar `FrontmatterSchema` de `site/lib/blog.ts`) ANTES de escrever; falha rápido com mensagem clara em campo faltante/inválido. `next build` é backstop, não a 1ª defesa.
- **D-06:** Os 8 campos obrigatórios = `title`, `slug`, `date`, `author`, `category`, `description`, `cover`, `featured`. Defaults de discrição: `date` = hoje (`YYYY-MM-DD`), `featured` = `false`, `example` omitido (não é seed). Chaves extras da marca (`verdade_servida`, `pilar`) podem permanecer no frontmatter (zod ignora chaves desconhecidas) para rastreabilidade — discrição.

### Imagem de capa (cover)

- **D-07:** `cover` aponta para uma **capa default on-brand compartilhada, COMMITADA e existente** (ex. `/blog/covers/_default.webp`, monocromática). Todo artigo gerado referencia esse default → build + listagem renderizam limpos (critério 2). O usuário troca por uma imagem real por-slug depois (disciplina de placeholder da Fase 04). **Criar `site/public/blog/covers/` + o arquivo default faz parte desta fase.**

### Gate de qualidade + slug + versionamento

- **D-08:** O gate da skill é `cd site && npm run build` **completo** (autoritativo — pega MDX/JSX além de frontmatter), casando com "lint+build" do critério 2. A pré-validação zod do script (D-05) falha cedo; o build é a palavra final. Build vermelho ⇒ artigo não é dado por pronto.
- **D-09:** Colisão de slug checada **CEDO no briefing**: varrer `site/content/blog/` pelos slugs existentes (campo `slug`) antes de escrever; se colidir, falhar/sufixar e reconfirmar no ⏸. (O loader NÃO quebra em slug duplicado — `getPostBySlug` pega o 1º e sombreia em silêncio — então o build não pegaria; a checagem precede.)
- **D-10:** A skill **commita** o `.mdx` (+ a capa default, se nova) após o gate `revisor-brand` aprovar E o build passar verde. Mensagem de commit a critério do executor.

### Princípio que muda (consequência — não esquecer)

- **D-11:** Esta fase **muda um princípio declarado**. Hoje `CLAUDE.md` e a descrição da skill dizem *"a publicação no site é trabalho do GSD do site (não desta skill)"*. Após a fase, `/novo-artigo` **publica no site**. Atualizar, seguindo o **padrão de escrita de skills (9 regras)** do `CLAUDE.md`: o `description`/frontmatter + `## Fluxo` + entregável + §"Critério de conclusão" de `.claude/skills/novo-artigo/SKILL.md`, e o ponteiro `/novo-artigo` em `CLAUDE.md` §"Criação de conteúdo — Blog".

### Claude's Discretion

- Local/nome exato do script (`scripts/content/` ou `scripts/blog/`) e a mensagem de commit (D-02/D-10).
- Manter ou dropar `verdade_servida`/`pilar` no frontmatter do site (zod ignora — rastreabilidade vs limpeza) (D-06).
- Defaults `date`=hoje, `featured`=false (D-06).
- **Preservar** o write-back ao `registro-angulos` (passo 7 atual da skill) — a promoção ao site é passo adicional, não o substitui.
- A arte da capa default em si é placeholder monocromático; o usuário fornece a real depois.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requisitos desta fase
- `.planning/REQUIREMENTS.md` — `BLOG-11` (pipeline `novo-artigo` → MDX no contrato do schema).

### Contrato do site (leitura OBRIGATÓRIA — a fonte de verdade do schema)
- `site/lib/blog.ts` — `FrontmatterSchema` (zod) = os 8 campos obrigatórios + o loader que **lança** em inválido (o gate de build). O script de promoção deve **espelhar/importar** este schema (D-05).
- `site/lib/site.ts` — `AUTHORS` (`ramon-dino`, `mauri-rosolen`) + `CATEGORIES` (4 slugs) = constraints de `author`/`category` (D-03/D-04).
- `site/content/blog/o-treino-que-funciona-e-o-que-voce-mantem.mdx` — exemplo de frontmatter VÁLIDO (shape de record, incl. `cover: "/blog/covers/<slug>.webp"`).
- `site/app/blog/page.tsx` + `site/app/blog/[slug]/page.tsx` — como `cover`/`author`/`category` são consumidos (confirmar que a capa default renderiza limpa na listagem, critério 2).

### A skill a modificar (brand OS) — seguir as 9 regras de escrita de skills
- `.claude/skills/novo-artigo/SKILL.md` — fluxo atual: draft em `export/`, gate `revisor-brand` (passo 6), write-back `registro-angulos` (passo 7). O passo de promoção ao site entra **após** o gate de marca.
- `templates/artigo.md` — template MDX atual do draft (frontmatter da marca: `pilar`/`narrativa`/`data`/`autor`/`status`) — a origem do mismatch que D-03..D-06 reconciliam.
- `CLAUDE.md` §"Criação de conteúdo — Blog" + o ponteiro `/novo-artigo` + "Padrão de escrita de skills (9 regras)" — atualizar o princípio (D-11).

### Mapas do código
- `.planning/codebase/STRUCTURE.md` — onde ficam scripts, conteúdo do site.
- `.planning/codebase/CONVENTIONS.md` — padrões de script/convenções do repo.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `scripts/memory/append_registro_angulos.js` — script Node CLI determinístico com args (`--slug`, `--data`, ...). **Molde direto** para o script de promoção draft→site (D-02).
- `site/lib/blog.ts` `FrontmatterSchema` — importável/espelhável para a validação pré-escrita (D-05).
- A capa default (a criar) + a convenção `/blog/covers/<slug>.webp` já usada pelos artigos-semente da Fase 04.

### Established Patterns
- Skills brand-OS seguem as **9 regras de escrita de skills** (`CLAUDE.md`); operações mecânicas/determinísticas vivem em `scripts/`.
- O site lê `site/content/blog/*.mdx` **flat**; o loader **lança** em frontmatter inválido (build aborta) — esse throw É o gate.
- Disciplina de placeholder (Fase 04: foto placeholder do ramon-dino) — a capa default segue a mesma lógica.

### Integration Points
- O passo novo lê o draft aprovado (`export/conteudos/blog/<slug>/artigo.mdx`) + os valores resolvidos no briefing → o script escreve `site/content/blog/<slug>.mdx`, roda `next build`, e (D-10) faz `git commit`.
- **Cross-boundary:** um script da brand-OS (`scripts/`) escreve dentro de `site/`. É a primeira ponte explícita brand-OS → site.
- `site/public/blog/covers/` é criada nesta fase (não existe hoje) com o arquivo default.

</code_context>

<specifics>
## Specific Ideas

- A `category` do site é independente do `pilar` da marca — escolha direta entre as 4, no briefing (D-03).
- `author` sempre perguntado entre Ramon e Mauri — sem default silencioso (D-04).
- Capa: um único default monocromático committed para todos os gerados até o swap real (D-07).
- O gate é o build de verdade (`next build`), não só a validação do loader (D-08).
- A skill commita o artigo após aprovação + build verde (D-10).

</specifics>

<deferred>
## Deferred Ideas

- **Lote / multi-artigo** — fora; 1 artigo por execução de `/novo-artigo`.
- **Capa via banco de imagens (Drive/arquivista) ou geração de imagem** — fora; default placeholder por ora.
- **Imagem de capa real por-slug** — content-ops posterior (usuário fornece e troca o default).
- **Mapeamento automático `pilar`→`category`** — considerado e descartado em favor da escolha direta (D-03).
- **Imagens inline no corpo do artigo** — fora; o corpo segue prosa MDX como hoje.

</deferred>

---

*Phase: 06-pipeline-de-artigos*
*Context gathered: 2026-06-13*
