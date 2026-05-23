# Onda 4 — Site + Engenharia — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Executar o plano de MVP do site Dino Team já existente (`docs/plans/2026-05-19-site-dino-team-mvp.md`), **adaptado à arquitetura multi-setor** — 4 agentes web em Engenharia, briefing produzido por `briefing-writer` (não mais `diretor-marca`), e validação `revisor-brand` obrigatória antes do deploy preview.

**Architecture:**
- Este plano é um **delta overlay** sobre `docs/plans/2026-05-19-site-dino-team-mvp.md`. Ele substitui pontualmente algumas tasks (paths, agente responsável pelo briefing, novo gate pré-deploy) e **delega o resto ao plano original**.
- 4 agentes web vivem flat em `.claude/agents/<nome>.md` (Claude Code não enxerga subdiretórios; ver memória [[claude-code-agents-flat-only]]). Agrupamento conceitual "Engenharia / Execução / Web" + "Engenharia / Revisão" vive textualmente em CLAUDE.md, não em pastas.
- `/novo-site` chama `briefing-writer` (Marketing/Estratégia) para produzir o briefing institucional da home — `briefing-writer` consulta `dados/ramon/` (preenchido na Onda 3) automaticamente.
- Pré-deploy: `revisor-brand` valida o site inteiro contra o brand book. Sem aprovação dele, não há deploy.
- Dashboard (`site/app/admin/dashboard/`) fica para Onda 5 — esta onda entrega só a home + scaffold + agentes/skill.

**Tech Stack:** Next.js 15 (App Router, TypeScript) + Tailwind CSS 4 + shadcn/ui + Framer Motion + Lucide + MDX + Vercel.

**Spec de referência:** [docs/specs/2026-05-22-arquitetura-multi-setor-design.md §6.5](../specs/2026-05-22-arquitetura-multi-setor-design.md)
**Plano-base de referência:** [docs/plans/2026-05-19-site-dino-team-mvp.md](2026-05-19-site-dino-team-mvp.md)
**Spec original do site:** [docs/specs/2026-05-19-site-dino-team-design.md](../specs/2026-05-19-site-dino-team-design.md)

**Dependências:** Ondas 1, 2 e 3 concluídas (sem isso, `briefing-writer` não existe).

**Invariantes:**
- Conteúdo dos 4 agentes web (princípios, contratos de I/O, anti-padrões) é exatamente o do plano-base; só os **paths de arquivo** mudam.
- Skills `/novo-post`, `/lote-posts`, `/novo-estilo`, `/brand-discovery`, `/atualizar-ramon` continuam funcionando.
- Sem mudança no design visual da home — escopo do plano-base preservado.

---

## File Structure

### Paths dos 4 agentes web

Os 4 agentes web vivem em `.claude/agents/<nome>.md` flat — exatamente como o plano original (`2026-05-19-site-dino-team-mvp.md`) já previa. A spec multi-setor tinha proposto subpastas (`agents/engenharia/execucao/web/...`), mas o smoke test (Onda 1) provou que subdir não funciona — então os paths viraram os mesmos do plano original.

| Agente | Path |
|---|---|
| `arquiteto-web` | `.claude/agents/arquiteto-web.md` |
| `designer-web` | `.claude/agents/designer-web.md` |
| `dev-frontend` | `.claude/agents/dev-frontend.md` |
| `curador-web` | `.claude/agents/curador-web.md` |

### Arquivos do plano original que continuam idênticos

Toda a Bloco 3 (scaffold Next.js) e Bloco 4 (briefing + 7 seções) do plano original ficam idênticos em conteúdo e localização — vivem em `site/` na raiz do repositório.

### Modificações no `.claude/skills/novo-site/SKILL.md`

O conteúdo da skill no plano original é mantido com 3 deltas:
1. **Briefing institucional da home** (Task 10) → produzido por `briefing-writer`, não por `diretor-marca`.
2. **Pré-deploy** (nova task após a Task 19 build/lint do plano original) → validar com `revisor-brand`.
3. Tabela de agentes da skill: 4 agentes web continuam, mais menções explícitas a `briefing-writer` e `revisor-brand` como "agentes externos consumidos".

### Modificações em `CLAUDE.md`

Adicionar 4 bullets em Engenharia (não substituir nada da seção atual).

---

## Tasks

---

### Task 1: (sem preparação de pastas — agentes ficam flat)

A Onda 4 originalmente previa criar a árvore `.claude/agents/engenharia/{execucao/web,revisao}/`. Como o loader não usa subpastas, esta task é **no-op** — os 4 agentes web são criados direto em `.claude/agents/<nome>.md` (Task 2). Mantida aqui como marcador para não desnumerar as tasks seguintes.

---

### Task 2: Executar Tasks 1-4 do plano original (4 agentes web), com paths ajustados

**Files:**
- Create: `.claude/agents/arquiteto-web.md`
- Create: `.claude/agents/designer-web.md`
- Create: `.claude/agents/dev-frontend.md`
- Create: `.claude/agents/curador-web.md`

**Como executar:**
1. Abra `docs/plans/2026-05-19-site-dino-team-mvp.md`.
2. Execute **Task 1** (arquiteto-web) com 1 mudança: escreva o arquivo em `.claude/agents/arquiteto-web.md` (não no path original).
3. Execute **Task 2** (designer-web) em `.claude/agents/designer-web.md`.
4. Execute **Task 3** (dev-frontend) em `.claude/agents/dev-frontend.md`.
5. Execute **Task 4** (curador-web) em `.claude/agents/curador-web.md`.

O **conteúdo** (frontmatter `name:`, princípios, contratos de I/O, anti-padrões) de cada agente é exatamente o do plano original — não alterar.

- [ ] **Step 1: Executar Task 1 do plano original com path novo**

Conteúdo: copiar verbatim do plano original (Task 1, Step 1) para `.claude/agents/arquiteto-web.md`. Manter o frontmatter `name: arquiteto-web` (resolução é por nome).

Verificar:

```bash
head -5 .claude/agents/arquiteto-web.md
```

Esperado: `name: arquiteto-web`.

- [ ] **Step 2: Executar Task 2 do plano original com path novo**

`.claude/agents/designer-web.md`. Conteúdo verbatim do plano original (Task 2, Step 1).

Verificar:

```bash
head -5 .claude/agents/designer-web.md
```

Esperado: `name: designer-web`.

- [ ] **Step 3: Executar Task 3 do plano original com path novo**

`.claude/agents/dev-frontend.md`. Verbatim.

```bash
head -5 .claude/agents/dev-frontend.md
```

Esperado: `name: dev-frontend`.

- [ ] **Step 4: Executar Task 4 do plano original com path novo**

`.claude/agents/curador-web.md`. Verbatim.

```bash
head -5 .claude/agents/curador-web.md
```

Esperado: `name: curador-web`.

- [ ] **Step 5: Smoke test dos 4 agentes**

```
Task(subagent_type="arquiteto-web", prompt="SMOKE_OK_ARQUITETO")
Task(subagent_type="designer-web", prompt="SMOKE_OK_DESIGNER_WEB")
Task(subagent_type="dev-frontend", prompt="SMOKE_OK_DEV")
Task(subagent_type="curador-web", prompt="SMOKE_OK_CURADOR_WEB")
```

Esperado: todos encontrados.

- [ ] **Step 6: NÃO seguir o Step "git commit" do plano original** — vamos commitar tudo unificado no fim desta onda.

---

### Task 3: Executar Task 5 do plano original (criar skill `/novo-site`) com 2 deltas

**Files:**
- Create: `.claude/skills/novo-site/SKILL.md`

**Deltas vs. plano original:**

1. **Tabela de agentes** da skill: adicionar `briefing-writer` (consumido em Task 10 do plano original) e `revisor-brand` (consumido no novo gate pré-deploy) como "agentes externos" — usados pela skill mas não-residentes em Engenharia.
2. **Texto da skill** que menciona quem produz o briefing institucional precisa apontar `briefing-writer`, não `diretor-marca`.

- [ ] **Step 1: Executar Task 5 do plano original**

Abra `docs/plans/2026-05-19-site-dino-team-mvp.md` e localize a Task 5 (criação de `.claude/skills/novo-site/SKILL.md`). Copie o conteúdo proposto **exceto** as menções a `diretor-marca`.

- [ ] **Step 2: Aplicar Delta 1 — tabela de agentes**

Na seção "Agentes" do SKILL.md da `/novo-site`, garantir que a tabela contenha:

```markdown
| Agente | Responsabilidade | Origem |
|---|---|---|
| `arquiteto-web` | Scaffold, organização, libs, config | Engenharia/Execução/Web |
| `designer-web` | Componentes React + Tailwind + animações | Engenharia/Execução/Web |
| `dev-frontend` | Estados, formulários, responsividade, a11y, performance | Engenharia/Execução/Web |
| `curador-web` | Validação técnica: build, lint, types, Lighthouse, preview deploy | Engenharia/Revisão |
| `briefing-writer` | Briefing institucional da home (Task 10) — consulta `dados/ramon/` | Marketing/Estratégia (externo) |
| `revisor-brand` | Validação de brand pré-deploy (novo gate) — binário | Transversais/Brand (externo) |
```

- [ ] **Step 3: Aplicar Delta 2 — texto que descreve a Task 10**

Em qualquer trecho do SKILL.md da `/novo-site` que mencione produção do briefing institucional, substituir:

- `diretor-marca` → `briefing-writer`
- "diretor de marca" → "briefing writer"
- "lê os 5 arquivos de `brand/`" (se houver) → mantém (o briefing-writer também lê).

Especificamente, no fluxo descrito da skill (passo de "briefing institucional"):

Atual (plano original):
```
3. Acionar `diretor-marca` com:
   - Tarefa: produzir briefing institucional da home...
```

Substituir por:

```
3. Acionar `briefing-writer` com:
   - Tarefa: produzir briefing institucional da home seguindo o template `templates/briefing.md`.
   - Inputs:
     - Spec do site: docs/specs/2026-05-19-site-dino-team-design.md
     - Brand book (lido automaticamente).
     - Banco de Dados: `dados/ramon/cronograma.md`, `dados/ramon/fase-atual.md` (lidos automaticamente quando produzindo briefing).
   - Saída: `site/docs/home-briefing.md`.
```

- [ ] **Step 4: Aplicar Delta 3 — adicionar o gate pré-deploy no fluxo da skill**

No fluxo descrito da `/novo-site`, **antes** do passo "deploy preview Vercel" (Task 20 do plano original), inserir novo passo:

```
N. Pré-deploy — validar com `revisor-brand`:

   Tarefa: validar o site contra brand book antes do primeiro deploy.

   Inputs:
   - Caminhos: site/app/page.tsx, site/components/sections/*.tsx, site/app/globals.css, site/tailwind.config.ts.
   - Spec original: docs/specs/2026-05-19-site-dino-team-design.md (descreve seções).
   - Briefing institucional: site/docs/home-briefing.md.

   Avalie: tom de voz nas copies das seções; paleta e tipografia contra brand/referencias-visuais.md; pilares respeitados; identidade visual consistente entre seções.

   Decisão: APROVADO ou REPROVADO.

   - APROVADO → seguir para deploy.
   - REPROVADO → reabrir a seção apontada (em geral copy via dev-frontend ou cor/tipo via designer-web) e re-rodar este gate.

   Saída: parecer inline.
```

- [ ] **Step 5: Verificar**

```bash
grep -n "diretor-marca" .claude/skills/novo-site/SKILL.md
```

Esperado: nenhum match.

```bash
grep -n "briefing-writer\|revisor-brand" .claude/skills/novo-site/SKILL.md
```

Esperado: ≥ 4 matches (tabela + Task 10 + gate pré-deploy + critério de conclusão).

- [ ] **Step 6: Não commitar ainda.**

---

### Task 4: Executar Tasks 6-9 do plano original (scaffold Next.js)

**Files:** conforme plano original — `site/package.json`, `site/tsconfig.json`, `site/next.config.ts`, etc.

Estas tarefas não têm delta. Execute-as integralmente do plano original (`docs/plans/2026-05-19-site-dino-team-mvp.md`):
- Task 6 — scaffold Next.js
- Task 7 — Tailwind + tokens do brand
- Task 8 — shadcn/ui + componentes-base
- Task 9 — root layout + TrackingScripts + globals.css

- [ ] **Step 1: Executar Task 6 do plano original**
- [ ] **Step 2: Executar Task 7 do plano original**
- [ ] **Step 3: Executar Task 8 do plano original**
- [ ] **Step 4: Executar Task 9 do plano original**

**Importante:** o plano original sugere commitar ao fim de cada task; **suprimir esses commits intermediários** — vamos commitar tudo da onda no fim. Mantenha as mudanças staged (`git add` mas sem `git commit`) OU deixe untracked e adicione tudo no commit final.

---

### Task 5: Executar Task 10 do plano original (briefing institucional) com Delta — acionar `briefing-writer`

**Files:**
- Create: `site/docs/home-briefing.md`

**Delta:** a Task 10 original aciona `diretor-marca`. Esta onda aciona `briefing-writer`. Conteúdo do briefing institucional pode mudar levemente porque o `briefing-writer` consulta o banco — esperar que apareçam sinalizações tipo "Ramon em prep para Olympia 2026" se `ramon/fase-atual.md` estiver populado.

- [ ] **Step 1: Acionar `briefing-writer`**

```
Task(subagent_type="briefing-writer", prompt="""
Tarefa: produzir briefing institucional da home do site Dino Team.

Inputs:
- Spec do site: docs/specs/2026-05-19-site-dino-team-design.md (descreve as 7 seções e o tom esperado).
- Brand book (você lê automaticamente os 5 arquivos de brand/).
- Banco de Dados: `dados/ramon/cronograma.md`, `dados/ramon/fase-atual.md` (você lê automaticamente quando produzindo briefing).

Template: templates/briefing.md.
Saída: gravar em site/docs/home-briefing.md.

Foco: definir ângulo central da home (não é um post — é a porta de entrada da marca), pilar dominante, recorte de público mais amplo possível mas ainda concreto.
""")
```

- [ ] **Step 2: Verificar resultado**

```bash
ls site/docs/home-briefing.md
head -30 site/docs/home-briefing.md
```

Esperado: arquivo gravado, com seções do schema canônico do `briefing-writer`. Se o banco está populado, ver menção a "fase atual" / "cronograma" no campo de sinalizações.

- [ ] **Step 3: Aprovação do usuário (Bruno)**

Mostrar o briefing ao usuário. Em REPROVADO, re-acionar o `briefing-writer` com pedido de ajuste. Em APROVADO, seguir.

- [ ] **Step 4: Não commitar ainda.**

---

### Task 6: Executar Tasks 11-19 do plano original (7 seções da home + componentes intermediários)

**Files:** conforme plano original — `site/components/sections/*.tsx`.

Sem deltas — execute integralmente:
- Task 11 — Hero
- Task 12 — ParaQuemE
- Task 13 — Metodo
- Task 14 — Resultados
- Task 15 — SobreRamon
- Task 16 — FAQ
- Task 17 — CtaFinal
- Task 18 — page.tsx (importa as 7 seções)
- Task 19 — build/lint/types (smoke técnico)

Cada task aciona `designer-web` e/ou `dev-frontend` — resolução por nome no frontmatter, paths flat conforme o plano original.

- [ ] **Step 1: Executar Task 11**
- [ ] **Step 2: Executar Task 12**
- [ ] **Step 3: Executar Task 13**
- [ ] **Step 4: Executar Task 14**
- [ ] **Step 5: Executar Task 15**
- [ ] **Step 6: Executar Task 16**
- [ ] **Step 7: Executar Task 17**
- [ ] **Step 8: Executar Task 18**
- [ ] **Step 9: Executar Task 19**

**Importante:** suprimir commits intermediários. Acumular em staging area / untracked até o fim da onda.

---

### Task 7: Pré-deploy — validar com `revisor-brand` (NOVO — não estava no plano original)

**Files:** (nenhum modificado nesta task — só parecer)

- [ ] **Step 1: Acionar `revisor-brand`**

```
Task(subagent_type="revisor-brand", prompt="""
Tarefa: validar o site Dino Team contra o brand book antes do primeiro deploy.

Inputs:
- Componentes: site/app/page.tsx + todos os arquivos em site/components/sections/.
- Estilos: site/app/globals.css, site/tailwind.config.ts.
- Briefing institucional: site/docs/home-briefing.md.
- Spec original do site: docs/specs/2026-05-19-site-dino-team-design.md.

Avalie:
- Tom de voz (`brand/tom-de-voz.md`) em cada copy de seção.
- Paleta e tipografia (`brand/referencias-visuais.md`) — classes Tailwind usadas mapeiam pros tokens?
- Pilares (`brand/pilares-conteudo.md`) — a home reflete os pilares declarados?
- Mood/identidade visual consistente entre seções.

Decisão binária: APROVADO ou REPROVADO.
""")
```

- [ ] **Step 2: Tratar resultado**

- **APROVADO** → seguir para deploy (Task 8).
- **REPROVADO** → reabrir a(s) seção(ões) apontada(s):
  - Problema de copy → `dev-frontend` ajusta o texto.
  - Problema de cor/tipografia → `designer-web` ajusta token/classe.
- Re-acionar `revisor-brand` após ajuste. Repetir até APROVADO. **Sem aprovação, sem deploy.**

- [ ] **Step 3: Aprovação do usuário (Bruno)**

Após APROVADO do `revisor-brand`, mostrar ao Bruno os componentes finais (ou abrir o `next dev` em `http://localhost:3000`) para aprovação visual. Em REPROVADO do Bruno, voltar à seção, ajustar, re-acionar `revisor-brand`, re-mostrar.

- [ ] **Step 4: Não commitar ainda.**

---

### Task 8: Executar Task 20 do plano original (deploy preview Vercel)

**Files:** sem mudanças locais — apenas configura deploy.

Execute Task 20 do plano original. Sem deltas.

- [ ] **Step 1: Executar Task 20**

Critério: URL preview Vercel acessível com a home carregando corretamente em mobile e desktop.

---

### Task 9: Executar Task 21 do plano original (atualizar CLAUDE.md) com Delta

**Files:**
- Modify: `CLAUDE.md`

**Delta vs. plano original:**

O plano original prevê adicionar uma seção "Site (`site/`)" e listar os 4 agentes novos + skill `/novo-site` em `.claude/agents/` (flat) e `.claude/skills/`. Como Ondas 1-3 já reformataram `CLAUDE.md` para a estrutura por setor/papel, esta onda adiciona Engenharia com os 4 agentes nos paths novos.

- [ ] **Step 1: Localizar a seção "3. Agentes"**

Procurar pela subseção `### 3. Agentes` em `CLAUDE.md` (já reorganizada nas ondas anteriores).

- [ ] **Step 2: Adicionar a subseção Engenharia**

Adicionar (após `Transversais / Dados` e antes do bloco "Pastas-placeholder"):

```markdown
- **Engenharia / Execução / Web**
  - [`arquiteto-web`](.claude/agents/arquiteto-web.md) — scaffold, organização, libs, config do site.
  - [`designer-web`](.claude/agents/designer-web.md) — componentes React + Tailwind + Framer Motion.
  - [`dev-frontend`](.claude/agents/dev-frontend.md) — estados, formulários, responsividade, a11y, performance.
- **Engenharia / Revisão**
  - [`curador-web`](.claude/agents/curador-web.md) — build, lint, types, Lighthouse, preview deploy.
```

- [ ] **Step 3: (Sem ajuste de pastas-placeholder)**

No layout flat, não há pastas-placeholder dentro de `.claude/agents/`. As únicas pastas-placeholder do projeto vivem na raiz (`dados/`, `campanhas/`, `orquestracao/`, `dados/politicas/`) e foram populadas/mantidas pelas ondas correspondentes. Nada a ajustar aqui.

- [ ] **Step 4: Adicionar nova seção "5. Site" (após "4. Banco de Dados" da Onda 3)**

```markdown
### 5. Site (`site/`)

Site institucional do Dino Team — Next.js 15 + Tailwind 4 + shadcn/ui + Framer Motion. Construído e mantido pelo setor de Engenharia.

- [`/novo-site`](.claude/skills/novo-site/SKILL.md) — skill dual-mode (criação vs. alteração do site). Aciona `briefing-writer` para briefing institucional e exige aprovação de `revisor-brand` antes de cada deploy.
```

- [ ] **Step 5: Verificar**

```bash
grep -n "arquiteto-web\|designer-web\|dev-frontend\|curador-web" CLAUDE.md
grep -n "novo-site\|site/" CLAUDE.md
```

Esperado: matches em ambos.

- [ ] **Step 6: Não commitar ainda.**

---

### Task 10: Smoke test funcional

**Files:** (nenhum modificado)

- [ ] **Step 1: Resolver os 4 agentes web**

```
Task(subagent_type="arquiteto-web", prompt="SMOKE_OK_ARQUITETO")
Task(subagent_type="designer-web", prompt="SMOKE_OK_DESIGNER_WEB")
Task(subagent_type="dev-frontend", prompt="SMOKE_OK_DEV")
Task(subagent_type="curador-web", prompt="SMOKE_OK_CURADOR_WEB")
```

Esperado: todos encontrados nos paths novos.

- [ ] **Step 2: Resolver `briefing-writer` e `revisor-brand`** (smoke regressivo)

```
Task(subagent_type="briefing-writer", prompt="SMOKE_OK_BRIEFING")
Task(subagent_type="revisor-brand", prompt="SMOKE_OK_BRAND")
```

Esperado: encontrados (Ondas 2+ continuam saudáveis).

- [ ] **Step 3: URL preview do site acessível**

Visitar a URL do preview Vercel emitida na Task 8.

Esperado: home carrega, 7 seções visíveis, sem erro de console crítico.

- [ ] **Step 4: Skills de conteúdo continuam funcionando**

Rodar `/novo-post carrossel <tema-rápido>` até o Passo 4 (briefing). Esperado: pipeline funciona.

---

### Task 11: Commit unificado da Onda 4

**Files:** (todos os listados — ~30 arquivos)

- [ ] **Step 1: Conferir `git status`**

```bash
git status
```

Esperado: ~30 arquivos novos/modificados — agentes em Engenharia, skill `/novo-site`, scaffold completo do site em `site/`, briefing institucional, CLAUDE.md atualizado.

- [ ] **Step 2: Stage e commit**

```bash
git add .claude/agents/arquiteto-web.md .claude/agents/designer-web.md .claude/agents/dev-frontend.md .claude/agents/curador-web.md .claude/skills/novo-site site/ CLAUDE.md
git commit -m "$(cat <<'EOF'
feat(arquitetura): Site + Engenharia MVP (Onda 4)

Conforme spec docs/specs/2026-05-22-arquitetura-multi-setor-design.md §6.5
e plano-base docs/plans/2026-05-19-site-dino-team-mvp.md adaptado.

Agentes web criados (flat em .claude/agents/, agrupados textualmente
em CLAUDE.md como Engenharia/Execução/Web e Engenharia/Revisão):
- arquiteto-web.md, designer-web.md, dev-frontend.md, curador-web.md

Skill /novo-site criada com 2 deltas vs. plano original:
- Briefing institucional produzido por briefing-writer (Marketing/
  Estratégia), não por diretor-marca. briefing-writer consulta
  dados/ramon/* automaticamente.
- Gate obrigatório pré-deploy: revisor-brand valida o site contra brand
  book. Sem aprovação, sem deploy.

Site Dino Team MVP no ar:
- Scaffold Next.js 15 + Tailwind 4 + shadcn/ui + Framer Motion em site/.
- Home com 7 seções (Hero, ParaQuemE, Método, Resultados, SobreRamon,
  FAQ, CtaFinal).
- Briefing institucional em site/docs/home-briefing.md.
- Deploy preview Vercel ativo.

CLAUDE.md atualizado: subseção Engenharia adicionada na seção "3.
Agentes"; nova seção "5. Site (site/)" com /novo-site.

Próxima onda (Onda 5): orquestração (rotas.yaml cron) + dashboard +
publish_instagram.
EOF
)"
```

- [ ] **Step 3: Confirmar**

```bash
git log -1 --stat | head -60
```

---

## Critério de conclusão da Onda 4

- [ ] 4 agentes web vivem flat em `.claude/agents/<nome>.md` — `arquiteto-web.md`, `designer-web.md`, `dev-frontend.md`, `curador-web.md`. Agrupamento "Engenharia / Execução / Web" e "Engenharia / Revisão" em CLAUDE.md é só textual.
- [ ] Skill `/novo-site` existe e referencia `briefing-writer` + `revisor-brand` em vez de `diretor-marca`.
- [ ] `site/docs/home-briefing.md` foi produzido por `briefing-writer` e Bruno aprovou.
- [ ] Site no ar via preview Vercel (URL emitida).
- [ ] `revisor-brand` aprovou o site pré-deploy.
- [ ] Bruno aprovou o visual do site.
- [ ] CLAUDE.md reflete a estrutura nova de Engenharia + site/.
- [ ] Skills `/novo-post`, `/lote-posts`, `/novo-estilo`, `/brand-discovery`, `/atualizar-ramon` continuam funcionando.
- [ ] Tudo num único commit; mensagem citando spec e plano-base.
