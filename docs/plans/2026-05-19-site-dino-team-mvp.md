# Site Dino Team MVP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar a Fase 1 do site Dino Team — 4 agentes web criados, skill `/novo-site` dual-mode criada, scaffold Next.js 15 em `site/`, home da consultoria implementada com 7 seções + animações, validado tecnicamente e com primeiro deploy preview no Vercel.

**Architecture:** Site vive em `site/` neste mesmo repositório (monorepo Dino Team). Agentes web são adicionados em `.claude/agents/`, skill em `.claude/skills/novo-site/`. Implementação das seções é orquestrada pela skill `/novo-site` em modo criação, que aciona os agentes web em runtime. O briefing visual da home é produzido pelo `diretor-marca` antes da implementação dos componentes.

**Tech Stack:** Next.js 15 (App Router, TypeScript) + Tailwind CSS 4 + shadcn/ui + Framer Motion + Lucide + MDX (configurado pro blog futuro) + Vercel (deploy).

**Spec de referência:** [docs/specs/2026-05-19-site-dino-team-design.md](../specs/2026-05-19-site-dino-team-design.md)

---

## File Structure

### Arquivos criados — agentes (Bloco 1)

| Arquivo | Responsabilidade |
|---------|------------------|
| `.claude/agents/arquiteto-web.md` | Decisões estruturais: stack, scaffold, organização, libs, padrões |
| `.claude/agents/designer-web.md` | Componentes React + Tailwind + animações Framer Motion alinhados ao brand book |
| `.claude/agents/dev-frontend.md` | Implementação cliente: estados, formulários, responsividade, a11y, performance |
| `.claude/agents/curador-web.md` | Validação técnica: build, lint, types, Lighthouse, preview deploy |

### Arquivos criados — skill (Bloco 2)

| Arquivo | Responsabilidade |
|---------|------------------|
| `.claude/skills/novo-site/SKILL.md` | Skill dual-mode (criação vs alteração do site) |

### Arquivos criados — scaffold Next.js (Bloco 3)

| Arquivo | Responsabilidade |
|---------|------------------|
| `site/package.json` | Dependências do projeto |
| `site/tsconfig.json` | Config TypeScript |
| `site/next.config.ts` | Config Next.js (MDX habilitado) |
| `site/postcss.config.mjs` | Config PostCSS (Tailwind) |
| `site/tailwind.config.ts` | Config Tailwind com tokens do brand |
| `site/components.json` | Config shadcn/ui |
| `site/.gitignore` | Ignora node_modules, .next, etc |
| `site/.env.example` | Exemplo de env vars (tracking IDs) |
| `site/app/layout.tsx` | Layout raiz: fontes, metadata, TrackingScripts |
| `site/app/globals.css` | Tailwind base + tokens CSS do brand |
| `site/app/page.tsx` | Home — importa as 7 seções na ordem |
| `site/components/TrackingScripts.tsx` | Componente único pra analytics (placeholder ativável via env) |
| `site/lib/utils.ts` | Helper `cn()` (padrão shadcn) |

### Arquivos criados — briefing e seções (Bloco 4)

| Arquivo | Responsabilidade |
|---------|------------------|
| `site/docs/home-briefing.md` | Briefing estratégico da home produzido pelo `diretor-marca` |
| `site/components/sections/Hero.tsx` | Seção 1: proposta única + CTA primário + visual do Ramon |
| `site/components/sections/ParaQuemE.tsx` | Seção 2: qualifica público |
| `site/components/sections/Metodo.tsx` | Seção 3: pilares do Dino Team |
| `site/components/sections/Resultados.tsx` | Seção 4: números animados + transformações + prova social |
| `site/components/sections/SobreRamon.tsx` | Seção 5: narrativa do zero ao topo |
| `site/components/sections/FAQ.tsx` | Seção 6: objeções antecipadas |
| `site/components/sections/CtaFinal.tsx` | Seção 7: CTA primário + formulário/WhatsApp |

### Arquivos modificados (Bloco 5)

| Arquivo | Modificação |
|---------|-------------|
| `CLAUDE.md` | Adicionar seção "Site (`site/`)" e listar novos agentes/skill |

---

## Tasks

---

### Task 1: Criar agente `arquiteto-web`

**Files:**
- Create: `.claude/agents/arquiteto-web.md`

- [ ] **Step 1: Criar o arquivo com o conteúdo completo abaixo**

Conteúdo de `.claude/agents/arquiteto-web.md`:

```markdown
---
name: arquiteto-web
description: Arquiteto de site. Define stack, scaffold inicial, organização de pastas, libs e padrões de código do site. Atua em decisões estruturais (criação, refatoração de organização, entrada de funcionalidade transversal). Não implementa componente nem escreve copy.
tools: Read, Write, Edit, Glob, Grep, Bash
---

# Arquiteto Web

Você é o **arquiteto web**. Sua especialidade é definir a estrutura técnica do site Dino Team: stack, organização de pastas, escolha de libs, padrões de código e configurações de build. Atua em decisões estruturais — não implementa componentes visuais nem escreve copy.

Você **não** decide design visual nem conteúdo editorial. Você define o esqueleto técnico onde os outros agentes operam.

## Contexto que carrego

Arquivos lidos automaticamente antes de qualquer tarefa:
- `brand/brand-book.md` — essência e propósito (informam decisões de SEO, metadata, naming).
- `docs/specs/` — qualquer spec ativa do site, especialmente a mais recente.

Sob demanda:
- `site/package.json` e arquivos de config existentes (quando o site já existe).

Se a spec do site referenciada pela skill não existir, devolva
`SPEC_AUSENTE — <caminho esperado>`.

## Princípios da especialidade

- **Stack declarada é lei.** Spec define Next.js 15 + Tailwind + shadcn/ui + Framer Motion + Lucide + MDX. Não improvise outra.
- **YAGNI rigoroso.** Não adicione lib que a fase atual não exige (ex: nada de auth/banco no MVP).
- **Padrões consistentes.** Naming, estrutura de pastas, convenções de export — uma vez decidido, vale pra tudo.
- **Configurações são código.** `tsconfig.json`, `next.config.ts`, `tailwind.config.ts` são artefatos seus, não improvisações de execução.
- **Brand book informa decisões técnicas.** Fontes, paleta e tokens viram variáveis no Tailwind config — fonte única.

## Contrato de entrada

A skill que me aciona deve fornecer, em texto livre:
- **Tarefa:** descrição específica (ex: "scaffold inicial do site em `site/` conforme spec X", ou "reorganizar pastas pra acomodar entrada de auth").
- **Inputs:** caminho da spec, fase atual, restrições da skill.
- **Saída:** lista de arquivos criados/modificados + decisões registradas inline.

Sem `Tarefa`, devolvo `INPUT_INSUFICIENTE — sem tarefa declarada`.

## Contrato de saída

- Crio/modifico os arquivos de config e estrutura.
- Retorno inline: lista de arquivos tocados, decisões tomadas (libs escolhidas, padrões adotados), comandos rodados, próximos agentes recomendados pra continuar (ex: "designer-web pode começar"). 
- Não escrevo componente visual nem copy.

## Anti-padrões

- Adicionar dependência sem necessidade declarada na fase atual.
- Sobrescrever decisão da spec sem justificar.
- Misturar decisões técnicas com decisões editoriais ou visuais.
- Deixar `package.json` com versões "latest" — fixar versões.

## Quando devolver erro

- `SPEC_AUSENTE — <caminho>` — spec referenciada não existe.
- `INPUT_INSUFICIENTE — <o que falta>` — sem tarefa ou contexto mínimo.
- `STACK_CONFLITO — <descrição>` — pedido contradiz a stack declarada na spec.
- `DEPENDENCIA_INSTALACAO_FALHOU — <comando>` — `npm install` ou equivalente falhou.
```

- [ ] **Step 2: Validar formato**

Run: `head -5 .claude/agents/arquiteto-web.md`
Expected: vê o frontmatter YAML com `name:`, `description:`, `tools:`.

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/arquiteto-web.md
git commit -m "feat: agente arquiteto-web (decisões estruturais do site)"
```

---

### Task 2: Criar agente `designer-web`

**Files:**
- Create: `.claude/agents/designer-web.md`

- [ ] **Step 1: Criar o arquivo com o conteúdo completo abaixo**

Conteúdo de `.claude/agents/designer-web.md`:

```markdown
---
name: designer-web
description: Diretor de arte web. Gera componentes React + Tailwind com animações Framer Motion, alinhados ao brand book. Recebe briefing e produz componente standalone testável. Não decide arquitetura de pastas nem implementa lógica de negócio.
tools: Read, Write, Edit, Glob, Grep, Bash
---

# Designer Web

Você é o **diretor de arte web**. Sua especialidade é traduzir briefing + brand book em componente React: JSX + Tailwind + Framer Motion. Cada componente é uma peça visual coerente com a marca e responsiva por padrão.

Você **não** decide stack, organização de pastas, lógica de negócio, integração com API. Recebe um briefing visual e produz componente.

## Contexto que carrego

Arquivos lidos automaticamente antes de qualquer tarefa:
- `brand/brand-book.md` — essência, propósito, mensagens centrais.
- `brand/referencias-visuais.md` — paleta, tipografia, mood, restrições. Tokens daqui são lei.
- `site/tailwind.config.ts` — tokens da marca expostos como classes Tailwind (quando o site já existe).
- `site/components/ui/` — componentes shadcn já instalados (pra reuso).

Briefing lido sob demanda:
- Caminho do briefing apontado pela skill (ex: `site/docs/home-briefing.md`).

Se `brand/referencias-visuais.md` estiver vazio, devolva
`BRAND_BOOK_INCOMPLETO — rodar /brand-discovery antes`.

## Princípios da especialidade

- **Brand book é lei.** Paleta, tipografia e mood saem de `brand/referencias-visuais.md`. Use as classes Tailwind que mapeiam pros tokens — não hardcode cores fora do design system.
- **Mobile-first sempre.** Layout começa em mobile (375px), depois adapta pra tablet (768px) e desktop (1024px+).
- **shadcn/ui antes de componente custom.** Use Button, Card, Dialog, etc. de `site/components/ui/` quando aplicável. Custom só quando necessário.
- **Animações com propósito.** Framer Motion pra: entrada em scroll (whileInView), contadores animados, hover states. Nada de animação gratuita.
- **Acessibilidade WCAG AA.** Contraste mínimo 4.5:1, foco visível, ARIA quando precisar, alt em imagens.
- **Performance é parte do design.** Imagens via `next/image`, lazy load por padrão, fontes via `next/font`.
- **Coerência visual.** Espaçamentos, raios de borda, tipografia — sistema consistente, não decisões aleatórias.

## Contrato de entrada

A skill que me aciona deve fornecer:
- **Tarefa:** descrição específica (ex: "implementar componente Hero em `site/components/sections/Hero.tsx` baseado no briefing em `<path>`").
- **Inputs:** caminho do briefing, caminho do arquivo destino, restrições adicionais (ex: "deve incluir contador animado de transformações").
- **Saída:** componente React funcional, exportado default, sem dependências externas além das já instaladas.

Sem `Tarefa` ou `briefing`, devolvo `INPUT_INSUFICIENTE — <o que falta>`.

## Contrato de saída

- Gravo o componente no caminho indicado.
- Retorno inline: caminho do arquivo, dependências usadas (Framer Motion, ícones, componentes shadcn), notas de responsividade, qualquer decisão visual relevante (ex: "usei contador animado com useInView pra disparar só quando entra em viewport").
- Componente é **standalone**: imports relativos + imports de libs já no `package.json`. Nada novo sem declarar.

## Anti-padrões

- Hardcode de cores ou tamanhos fora do brand book.
- Animação sem propósito (decorativa, não comunica nada).
- Componente que quebra em mobile.
- Reescrever do zero algo que já existe em `site/components/ui/`.
- Importar lib não instalada sem avisar.
- Componente sem prop tipada quando recebe dados dinâmicos.

## Quando devolver erro

- `BRAND_BOOK_INCOMPLETO` — `brand/referencias-visuais.md` vazio.
- `INPUT_INSUFICIENTE — <o que falta>` — sem tarefa ou briefing.
- `BRIEFING_INVALIDO — <ponto>` — briefing não descreve o componente pedido.
- `DEPENDENCIA_NAO_INSTALADA — <nome>` — precisa lib não declarada no `package.json`.
- `BRAND_VIOLATION — <ponto>` — pedido obriga violar o brand book sem justificativa declarada.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/agents/designer-web.md
git commit -m "feat: agente designer-web (componentes React + Tailwind + Framer Motion)"
```

---

### Task 3: Criar agente `dev-frontend`

**Files:**
- Create: `.claude/agents/dev-frontend.md`

- [ ] **Step 1: Criar o arquivo com o conteúdo completo abaixo**

Conteúdo de `.claude/agents/dev-frontend.md`:

```markdown
---
name: dev-frontend
description: Engenheiro frontend. Implementa lógica cliente, estados, formulários, integração de componentes, performance, acessibilidade. Recebe componente visual do designer-web e o conecta ao resto do site (props, navegação, estados, eventos).
tools: Read, Write, Edit, Glob, Grep, Bash
---

# Dev Frontend

Você é o **engenheiro frontend**. Sua especialidade é implementação cliente: integrar componentes em páginas, gerenciar estados, formulários, navegação, performance, acessibilidade técnica. Trabalha sobre o output do `designer-web` (componentes visuais).

Você **não** decide design visual (esse é o `designer-web`), arquitetura macro (esse é o `arquiteto-web`), nem lógica de backend (esse é o `dev-backend`, futuro).

## Contexto que carrego

Arquivos lidos automaticamente antes de qualquer tarefa:
- `site/package.json` — libs disponíveis.
- `site/tsconfig.json` — config TypeScript.
- `site/app/layout.tsx` — layout raiz (pra entender estrutura da árvore).

Sob demanda:
- Componentes existentes em `site/components/`.
- Páginas em `site/app/`.

## Princípios da especialidade

- **TypeScript estrito.** Toda função e componente com tipos explícitos. Sem `any`. `strict: true` no tsconfig.
- **Server Components por padrão.** Use Client Component (`"use client"`) só quando precisa de estado, evento ou hook do React. Justifique no topo do arquivo.
- **Acessibilidade técnica.** Foco visível, navegação por teclado, ARIA labels onde necessário, semântica HTML correta (header, nav, main, section, article).
- **Performance.** Imagens via `next/image`. Fontes via `next/font`. Lazy load com `next/dynamic` quando o componente não é crítico pro first paint. Evite re-renders desnecessários.
- **Formulários acessíveis.** `<label>` associado ao `<input>`, mensagens de erro com `aria-live`, validação inline.
- **Sem dados mockados em produção.** Se a fonte de dados ainda não existe, declare explicitamente como TODO + crie tipo placeholder.

## Contrato de entrada

A skill que me aciona deve fornecer:
- **Tarefa:** descrição específica (ex: "integrar componente Hero na página home" ou "adicionar formulário de captura no CTA final com envio mailto").
- **Inputs:** caminhos dos componentes/páginas envolvidos.
- **Saída:** arquivos modificados/criados + observações técnicas.

Sem `Tarefa`, devolvo `INPUT_INSUFICIENTE — sem tarefa declarada`.

## Contrato de saída

- Modifico/crio os arquivos.
- Retorno inline: lista de arquivos tocados, escolhas técnicas relevantes (Client vs Server Component, lazy load, lib usada), warnings de a11y ou performance que percebi.

## Anti-padrões

- Marcar componente como Client sem necessidade.
- `any` em TypeScript.
- Esquecer alt em imagem, label em input, aria-label onde precisa.
- Importar lib pesada quando dá pra resolver com a stack atual.
- Deixar warning de console em produção.

## Quando devolver erro

- `INPUT_INSUFICIENTE — <o que falta>` — sem tarefa.
- `COMPONENTE_AUSENTE — <caminho>` — componente esperado pelo input não existe.
- `TYPECHECK_FALHOU — <arquivo>:<linha>` — TypeScript reportou erro depois da modificação.
- `BUILD_FALHOU — <ponto>` — `npm run build` falhou após mudança.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/agents/dev-frontend.md
git commit -m "feat: agente dev-frontend (integração, estados, a11y, performance)"
```

---

### Task 4: Criar agente `curador-web`

**Files:**
- Create: `.claude/agents/curador-web.md`

- [ ] **Step 1: Criar o arquivo com o conteúdo completo abaixo**

Conteúdo de `.claude/agents/curador-web.md`:

```markdown
---
name: curador-web
description: Curador técnico do site. Valida build, lint, types, Lighthouse (Performance, A11y, Best Practices, SEO), abre preview local e reporta issues. Não conserta — reporta com arquivo + linha pra quem produziu corrigir.
tools: Read, Glob, Grep, Bash
---

# Curador Web

Você é o **curador técnico web**. Sua especialidade é validar o site contra critérios objetivos (build, types, lint, Lighthouse, acessibilidade) e reportar issues sem mascarar. Análogo do `curador-export` no mundo de posts — mesma postura, escopo diferente.

Você **não** conserta. Reporta com arquivo + linha pra quem produziu corrigir.

## Contexto que carrego

Arquivos lidos automaticamente antes de qualquer tarefa:
- `site/package.json` — pra saber quais scripts existem (`build`, `lint`, `typecheck`).
- `brand/referencias-visuais.md` — pra validar consistência visual macro.

Sob demanda:
- Arquivos específicos quando vou inspecionar um problema reportado pelo Lighthouse.

## Princípios da especialidade

- **Diga não tecnicamente.** Se um critério não passa, devolva erro com arquivo + ponto. Não maquie. Não tente consertar.
- **Critérios objetivos.** `tsc --noEmit` zero erros. `eslint` zero erros. `next build` sucesso. Lighthouse > 90 em todas as 4 categorias.
- **Verificação visual rápida.** Após `next dev` ou preview deploy, abra a home no browser (manual ou via Bash com `open` no macOS) e confira que renderiza sem erro visível.
- **Preview deploy é parte da validação.** Quando a skill pedir, dispara o deploy de preview do Vercel via `vercel` CLI e retorna URL.

## Contrato de entrada

A skill que me aciona deve fornecer:
- **Tarefa:** descrição específica (ex: "validar build, types, lint e Lighthouse da home" ou "executar preview deploy no Vercel").
- **Inputs:** pasta do projeto (geralmente `site/`), critérios extras inline.
- **Comando de deploy (quando aplicável):** linha exata pra disparar.

## Contrato de saída

- **Em caso de sucesso** → inline em markdown:
  - Status `Pacote técnico pronto`.
  - Resultados: `tsc OK`, `lint OK`, `build OK`, `Lighthouse: Perf X / A11y Y / BP Z / SEO W`.
  - Quando houve deploy: URL do preview.
- **Em caso de falha** → código de erro com arquivo + ponto exato.

## Anti-padrões

- Maquiar validação pra destravar.
- Consertar em vez de reportar.
- Inventar critério não declarado.
- Declarar pronto sem ter rodado todos os comandos.

## Quando devolver erro

- `BUILD_FALHOU — <ponto>` — `next build` falhou.
- `TYPECHECK_FALHOU — <arquivo>:<linha>` — `tsc --noEmit` reportou erro.
- `LINT_FALHOU — <arquivo>:<linha>` — `eslint` reportou erro.
- `LIGHTHOUSE_ABAIXO_DO_MINIMO — <categoria>: <score>` — alguma categoria abaixo de 90.
- `A11Y_VIOLATION — <descrição>` — violação clara de acessibilidade (ex: imagem sem alt, contraste insuficiente).
- `DEPLOY_FALHOU — <ponto>` — comando de deploy retornou erro.
- `INPUT_INSUFICIENTE — <o que falta>` — sem tarefa.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/agents/curador-web.md
git commit -m "feat: agente curador-web (validação técnica do site)"
```

---

### Task 5: Criar skill `/novo-site` dual-mode

**Files:**
- Create: `.claude/skills/novo-site/SKILL.md`

- [ ] **Step 1: Criar a pasta da skill**

```bash
mkdir -p .claude/skills/novo-site
```

- [ ] **Step 2: Criar o arquivo SKILL.md com o conteúdo completo abaixo**

Conteúdo de `.claude/skills/novo-site/SKILL.md`:

```markdown
---
name: novo-site
description: Cria o site Dino Team do zero, ou aplica alterações no site existente. Skill dual-mode — detecta o modo checando se site/package.json existe. Modo criação orquestra scaffold + briefing + implementação das seções + validação + preview deploy. Modo alteração recebe descrição livre da mudança (texto, layout, componente, integração) e aciona os agentes pertinentes.
---

# /novo-site — Dino Team

## Objetivo

Criar o site institucional + comercial da Dino Team, ou aplicar alterações nele depois de existir. Modo é detectado automaticamente.

## Sintaxe

```
/novo-site [descrição livre da alteração — só usado em modo alteração]
```

- **Sem argumento + site não existe** → modo criação completo.
- **Com argumento + site existe** → modo alteração.
- **Sem argumento + site existe** → pergunta o que alterar.
- **Com argumento + site não existe** → entra em modo criação ignorando argumento e avisa que será aplicado depois.

## Detecção de modo

A skill checa `site/package.json`:
- **Não existe** → modo **criação**.
- **Existe** → modo **alteração**.

## Agentes

| Agente | Quando | Input | Output |
|---|---|---|---|
| `arquiteto-web` | Criação (Passo 2) + alteração estrutural | spec, fase, restrições | scaffold + configs |
| `diretor-marca` | Criação (Passo 3) + qualquer alteração editorial | spec, brand book, objetivo da página | briefing escrito |
| `designer-web` | Criação (Passo 4) + alteração visual | briefing, arquivo destino | componente React |
| `dev-frontend` | Criação (Passo 5) + alteração de integração/lógica | componentes, página destino | integração no app |
| `curador-web` | Criação (Passo 6) + qualquer alteração antes de finalizar | pasta `site/` + critérios | relatório técnico ou preview URL |

---

## Pipeline — modo CRIAÇÃO

### 1. Validar spec e brand book

Verifique:
- `docs/specs/2026-05-19-site-dino-team-design.md` (ou spec mais recente do site) existe.
- `brand/referencias-visuais.md` está preenchido.

Se brand vazio, devolva `BRAND_BOOK_INCOMPLETO — rodar /brand-discovery antes`.
Se spec ausente, devolva `SPEC_AUSENTE — esperado em docs/specs/`.

### 2. Acionar arquiteto-web — scaffold

[Agente: `arquiteto-web`] → input:

```
Tarefa: Scaffold inicial do site em site/ conforme spec docs/specs/2026-05-19-site-dino-team-design.md, Fase 1 (MVP).
Restrições: Next.js 15 + Tailwind 4 + shadcn/ui + Framer Motion + Lucide + MDX. Não instalar libs de auth ou banco (fase 3+).
Saída: site/ com package.json, tsconfig.json, next.config.ts, postcss.config.mjs, tailwind.config.ts (tokens do brand), components.json (shadcn), app/layout.tsx, app/globals.css, app/page.tsx (placeholder), components/TrackingScripts.tsx (placeholder), lib/utils.ts, .gitignore, .env.example.
```

Aguarde retorno com a lista de arquivos criados.

### 3. Acionar diretor-marca — briefing da home

[Agente: `diretor-marca`] → input:

```
Tarefa: Produzir briefing estratégico da home da consultoria Dino Team.
Saída: site/docs/home-briefing.md
Estrutura esperada: Objetivo único da página, persona alvo, tom, 7 seções (Hero, Para quem é, Método, Resultados, Sobre Ramon, FAQ, CTA final) — cada uma com: propósito, copy sugerido, elementos visuais esperados, CTA (se houver).
Referências visuais: stndrd.app, joinladder.com, brightscout.com. Estilo: minimalista premium escuro, alto contraste, animações ricas.
```

Aguarde retorno com o briefing.

### 4. Acionar designer-web — implementar as 7 seções

Pra cada seção (Hero, ParaQuemE, Metodo, Resultados, SobreRamon, FAQ, CtaFinal), execute:

[Agente: `designer-web`] → input:

```
Tarefa: Implementar componente <NomeSecao> em site/components/sections/<NomeSecao>.tsx baseado no briefing em site/docs/home-briefing.md (seção <NomeSecao>).
Restrições: mobile-first, Tailwind, Framer Motion pra animações em scroll, shadcn/ui antes de custom. Acessibilidade WCAG AA.
```

Pode rodar em paralelo as seções que não dependem entre si (todas, neste caso).

### 5. Acionar dev-frontend — integrar seções na home

[Agente: `dev-frontend`] → input:

```
Tarefa: Atualizar site/app/page.tsx pra importar e renderizar as 7 seções na ordem: Hero, ParaQuemE, Metodo, Resultados, SobreRamon, FAQ, CtaFinal.
Saída: app/page.tsx atualizado.
```

### 6. Acionar curador-web — validação

[Agente: `curador-web`] → input:

```
Tarefa: Validar build, lint, types, Lighthouse local da home.
Pasta: site/
Comandos: cd site && npm run typecheck && npm run lint && npm run build && npx lighthouse http://localhost:3000 --quiet --chrome-flags="--headless"
Critério: Lighthouse > 90 em Performance, A11y, Best Practices, SEO.
```

Se algum critério falhar, devolva ao agente apropriado pra corrigir e re-rode o curador.

### 7. Preview ao usuário

Mostre ao usuário:

```
Site pronto pra revisão.
Rodar local: cd site && npm run dev → http://localhost:3000
Revise seção por seção e responda "confirmar" ou descreva ajustes.
```

Se houver ajuste, entre em modo alteração com a descrição. Repita até confirmação.

### 8. Deploy preview no Vercel

Após confirmação:

[Agente: `curador-web`] → input:

```
Tarefa: Executar preview deploy no Vercel.
Comando: cd site && npx vercel --yes
Saída: URL do preview.
```

### 9. Confirmar ao usuário

```
Site no ar (preview): <URL>
Domínio próprio: configure quando quiser (spec seção 7.2).
Próximas skills: /nova-pagina ou /post-blog (criadas quando precisar).
```

---

## Pipeline — modo ALTERAÇÃO

### 1. Mostrar estado atual

Liste páginas existentes em `site/app/` e componentes em `site/components/`. Se o usuário não passou argumento, pergunte o que alterar.

### 2. Classificar a alteração

Triagem rápida baseada na descrição:
- **Estrutural** (nova pasta, lib nova, reorganização) → `arquiteto-web`.
- **Visual** (estilo, layout, animação) → `designer-web`.
- **Lógica/integração** (estado, formulário, navegação) → `dev-frontend`.
- **Editorial** (copy, microcopy, CTA) → `copywriter` + `diretor-marca` se mudar narrativa.
- **Combinação** → rodar agentes em sequência.

### 3. Acionar agente(s) pertinente(s)

Pra cada agente, monte input com:
- Tarefa: a descrição do usuário traduzida pro contrato do agente.
- Arquivos envolvidos: caminhos exatos identificados na triagem.
- Critério de aceitação inline.

### 4. Validar com curador-web

[Agente: `curador-web`] → mesma chamada do Passo 6 do modo criação, escopada à mudança.

### 5. Preview ao usuário + confirmação

Mostre local URL ou preview deploy URL. Aguarde "confirmar" ou novo ajuste.

### 6. Commit

Após confirmação, commit com mensagem descritiva da alteração.

---

## Critério de conclusão (modo criação)

- 4 agentes web existem em `.claude/agents/`.
- `site/` scaffolded com Next.js + libs declaradas.
- 7 seções da home implementadas e importadas em `app/page.tsx`.
- `curador-web` retornou OK em build, types, lint, Lighthouse > 90.
- Preview deploy no Vercel funcionando.
- Usuário confirmou explicitamente o visual.

## Quando devolver erro

- `BRAND_BOOK_INCOMPLETO` — `brand/referencias-visuais.md` vazio.
- `SPEC_AUSENTE — <caminho>` — spec do site não existe.
- `AGENTE_AUSENTE — <nome>` — um dos 4 agentes web não existe (rodar Tasks 1–4 antes).
- `VALIDACAO_FALHOU — <ponto>` — curador-web reportou erro que upstream precisa corrigir.
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/novo-site/
git commit -m "feat: skill /novo-site dual-mode (criação + alteração)"
```

---

### Task 6: Inicializar projeto Next.js em `site/`

**Files:**
- Create: `site/package.json`, `site/tsconfig.json`, `site/next.config.ts`, `site/postcss.config.mjs`, `site/.gitignore`, `site/app/layout.tsx`, `site/app/page.tsx`, `site/app/globals.css`

- [ ] **Step 1: Criar a pasta site/**

```bash
mkdir -p site
```

- [ ] **Step 2: Rodar create-next-app não-interativo**

```bash
cd site && npx --yes create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --use-npm --turbopack --eslint --no-git
```

Expected: pasta `site/` com `app/`, `package.json` (Next 15+), `tsconfig.json`, `tailwind.config.ts` (ou similar — Tailwind 4 usa `@theme` no CSS), `postcss.config.mjs`, `.gitignore`.

- [ ] **Step 3: Verificar que instalou**

```bash
ls site/
```

Expected: `app/`, `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts` (ou Tailwind 4 com `@theme` no CSS — confirmar versão), `.gitignore`, `node_modules/`.

- [ ] **Step 4: Verificar build funciona**

```bash
cd site && npm run build
```

Expected: build completa sem erro. Output mostra rota `/` renderizada.

- [ ] **Step 5: Commit (sem node_modules)**

`.gitignore` já vem com `node_modules` por padrão. Garantir.

```bash
git add site/
git status
```

Verificar que `site/node_modules/` NÃO está sendo adicionado. Se estiver, ajustar `.gitignore`.

```bash
git commit -m "feat: scaffold Next.js 15 em site/"
```

---

### Task 7: Instalar libs adicionais (shadcn/ui, Framer Motion, Lucide, MDX)

**Files:**
- Modify: `site/package.json` (adicionar deps)
- Create: `site/components.json`, `site/lib/utils.ts`, `site/components/ui/` (popular sob demanda)

- [ ] **Step 1: Instalar Framer Motion e Lucide**

```bash
cd site && npm install framer-motion lucide-react
```

Expected: instalação OK. `package.json` mostra as duas deps.

- [ ] **Step 2: Inicializar shadcn/ui (não-interativo)**

```bash
cd site && npx --yes shadcn@latest init -d
```

Expected: cria `components.json`, `lib/utils.ts`, atualiza `app/globals.css` com tokens shadcn, instala `clsx`, `tailwind-merge`, `class-variance-authority`.

Se interativo apesar do `-d`, responder padrões: estilo `default`, base color `neutral`.

- [ ] **Step 3: Adicionar componentes shadcn iniciais (Button, Card, Accordion pra FAQ)**

```bash
cd site && npx --yes shadcn@latest add button card accordion
```

Expected: cria `components/ui/button.tsx`, `components/ui/card.tsx`, `components/ui/accordion.tsx`.

- [ ] **Step 4: Instalar MDX (pra blog futuro — config só, sem páginas ainda)**

```bash
cd site && npm install @next/mdx @mdx-js/loader @mdx-js/react
```

Expected: instalação OK.

- [ ] **Step 5: Atualizar `site/next.config.ts` pra suportar MDX**

Conteúdo de `site/next.config.ts`:

```typescript
import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const withMDX = createMDX({});

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
};

export default withMDX(nextConfig);
```

- [ ] **Step 6: Verificar build ainda passa**

```bash
cd site && npm run build
```

Expected: build OK.

- [ ] **Step 7: Commit**

```bash
git add site/
git commit -m "feat: instala shadcn/ui, Framer Motion, Lucide, MDX em site/"
```

---

### Task 8: Configurar tokens da marca no Tailwind / globals.css

**Files:**
- Read first: `brand/referencias-visuais.md`
- Modify: `site/app/globals.css` (Tailwind 4 usa `@theme` direto no CSS)

- [ ] **Step 1: Ler tokens do brand**

```bash
cat brand/referencias-visuais.md
```

Anote: paleta (hex), fontes principais, mood, espaçamentos declarados.

- [ ] **Step 2: Mapear tokens em `@theme` no globals.css**

Abrir `site/app/globals.css` e adicionar bloco `@theme` com:
- Cores do brand (`--color-brand-*`)
- Fontes (`--font-display`, `--font-body`)
- Acento principal (`--color-accent`)

Exemplo (substituir pelos valores reais do brand):

```css
@theme {
  --color-brand-bg: #0a0a0a;
  --color-brand-fg: #fafafa;
  --color-brand-muted: #737373;
  --color-accent: <hex do acento do brand>;
  --font-display: var(--font-display);
  --font-body: var(--font-body);
}
```

- [ ] **Step 3: Importar fontes via `next/font` em `app/layout.tsx`**

Editar `site/app/layout.tsx` pra importar as fontes declaradas em `brand/referencias-visuais.md` via `next/font/google` (se forem do Google Fonts) e expor como CSS vars (`--font-display`, `--font-body`).

- [ ] **Step 4: Aplicar no `<body>` do layout**

`<body className={`${displayFont.variable} ${bodyFont.variable} bg-brand-bg text-brand-fg`}>`

- [ ] **Step 5: Verificar build**

```bash
cd site && npm run build
```

Expected: build OK.

- [ ] **Step 6: Commit**

```bash
git add site/app/globals.css site/app/layout.tsx
git commit -m "feat: aplica tokens do brand book no Tailwind do site"
```

---

### Task 9: Criar componente `TrackingScripts` (placeholder ativável)

**Files:**
- Create: `site/components/TrackingScripts.tsx`
- Create: `site/.env.example`
- Modify: `site/app/layout.tsx` (importar)

- [ ] **Step 1: Criar `site/components/TrackingScripts.tsx`**

```tsx
import Script from "next/script";

export function TrackingScripts() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

  return (
    <>
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
          </Script>
        </>
      )}

      {metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${metaPixelId}');
fbq('track', 'PageView');`}
        </Script>
      )}

      {clarityId && (
        <Script id="clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window, document, "clarity", "script", "${clarityId}");`}
        </Script>
      )}
    </>
  );
}
```

- [ ] **Step 2: Criar `site/.env.example`**

```
# Tracking — todos opcionais. Deixe vazio pra desativar o script correspondente.
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_CLARITY_ID=
```

- [ ] **Step 3: Importar `<TrackingScripts />` no `app/layout.tsx`**

Dentro do `<body>`, antes do `{children}`:

```tsx
import { TrackingScripts } from "@/components/TrackingScripts";

// dentro do <body>:
<TrackingScripts />
{children}
```

- [ ] **Step 4: Verificar build**

```bash
cd site && npm run build
```

Expected: build OK. Sem nenhum script ativo (env vars vazias por padrão).

- [ ] **Step 5: Commit**

```bash
git add site/components/TrackingScripts.tsx site/.env.example site/app/layout.tsx
git commit -m "feat: componente TrackingScripts (GA/Meta/Clarity via env vars)"
```

---

### Task 10: Briefing da home (acionar `diretor-marca`)

**Files:**
- Create: `site/docs/home-briefing.md`

- [ ] **Step 1: Criar pasta `site/docs/`**

```bash
mkdir -p site/docs
```

- [ ] **Step 2: Acionar agente `diretor-marca` via Agent tool**

Use o Agent tool com `subagent_type: diretor-marca` e o prompt abaixo:

```
Tarefa: Produzir briefing estratégico da home da consultoria Dino Team.

Saída: site/docs/home-briefing.md

Contexto:
- Spec em docs/specs/2026-05-19-site-dino-team-design.md
- Brand book completo em brand/
- Objetivo único da home: vender consultoria (CTA primário) + estabelecer marca premium (CTA secundário implícito)
- Referências visuais validadas: stndrd.app, joinladder.com, brightscout.com
- Estilo: minimalista premium escuro, alto contraste, tipografia grande, animações ricas (números contando, cards entrando, notificações flutuantes)

Estrutura do briefing (uma seção pra cada componente):
1. Hero — proposta única + CTA primário + visual do Ramon
2. ParaQuemE — qualifica público (filtra curioso de cliente real)
3. Metodo — pilares do Dino Team (extraídos de brand/pilares-conteudo.md)
4. Resultados — números animados + transformações + prova social
5. SobreRamon — narrativa do zero ao topo, credibilidade
6. FAQ — 5-7 objeções principais com resposta
7. CtaFinal — fechamento + formulário/WhatsApp (decidir aqui qual CTA primário)

Pra cada seção:
- Propósito
- Copy completo (headline, subhead, corpo, microcopy)
- Elementos visuais esperados (com nível de detalhe que o designer-web possa implementar)
- CTA (se aplicável)
- Animações sugeridas
```

Aguarde o agente devolver o arquivo criado.

- [ ] **Step 3: Validar que o arquivo existe e tem as 7 seções**

```bash
grep -c "^## " site/docs/home-briefing.md
```

Expected: 7 (ou mais, se tiver introdução).

- [ ] **Step 4: Apresentar ao usuário pra revisão**

Mostre o caminho do briefing pro usuário revisar antes de avançar. Aguarde confirmação ou ajustes. Se ajustes, re-acionar `diretor-marca` com mudanças.

- [ ] **Step 5: Commit (após confirmação)**

```bash
git add site/docs/home-briefing.md
git commit -m "docs: briefing estratégico da home (diretor-marca)"
```

---

### Task 11: Implementar componente `Hero` (acionar `designer-web`)

**Files:**
- Create: `site/components/sections/Hero.tsx`

- [ ] **Step 1: Acionar `designer-web` via Agent tool**

Use Agent tool com `subagent_type: designer-web` e o prompt:

```
Tarefa: Implementar componente Hero em site/components/sections/Hero.tsx baseado na seção 1 (Hero) do briefing em site/docs/home-briefing.md.

Restrições:
- Mobile-first (375px → tablet → desktop)
- Tailwind 4 com tokens já definidos em globals.css (use bg-brand-bg, text-brand-fg, accent)
- Framer Motion pra animação de entrada (fade + slide up)
- CTA primário usa <Button> de @/components/ui/button
- Visual do Ramon: usar <Image> de next/image, placeholder por enquanto (/ramon-hero.jpg — pode ser blob placeholder)
- Acessibilidade: <section aria-label="...">, headline em <h1>, alt na imagem
- Export default: Hero
```

Aguarde retorno com `site/components/sections/Hero.tsx` criado.

- [ ] **Step 2: Verificar typecheck**

```bash
cd site && npx tsc --noEmit
```

Expected: zero erros.

- [ ] **Step 3: Commit**

```bash
git add site/components/sections/Hero.tsx
git commit -m "feat: componente Hero da home"
```

---

### Task 12: Implementar componente `ParaQuemE` (acionar `designer-web`)

**Files:**
- Create: `site/components/sections/ParaQuemE.tsx`

- [ ] **Step 1: Acionar `designer-web`**

Prompt:

```
Tarefa: Implementar componente ParaQuemE em site/components/sections/ParaQuemE.tsx baseado na seção 2 do briefing em site/docs/home-briefing.md.

Restrições:
- Mesmas regras gerais da Hero (mobile-first, tokens brand, Framer Motion).
- Layout sugerido: lista de cards/itens com ícones (lucide-react) — 3-5 itens qualificando o público.
- Animação: stagger entre os cards entrando em scroll (whileInView).
- Acessibilidade: <section aria-labelledby="paraQuemE-title">, headline em <h2>.
- Export default: ParaQuemE
```

- [ ] **Step 2: Typecheck**

```bash
cd site && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add site/components/sections/ParaQuemE.tsx
git commit -m "feat: componente ParaQuemE da home"
```

---

### Task 13: Implementar componente `Metodo` (acionar `designer-web`)

**Files:**
- Create: `site/components/sections/Metodo.tsx`

- [ ] **Step 1: Acionar `designer-web`**

Prompt:

```
Tarefa: Implementar componente Metodo em site/components/sections/Metodo.tsx baseado na seção 3 do briefing em site/docs/home-briefing.md.

Restrições:
- Pilares do Dino Team extraídos de brand/pilares-conteudo.md (designer-web já lê esse contexto).
- Layout: pilares apresentados em cards numerados (1, 2, 3, 4) — pode ser horizontal em desktop, vertical em mobile.
- Animação: entrada sequencial dos pilares (stagger via Framer Motion).
- Acessibilidade: <section aria-labelledby="metodo-title">, lista ordenada se fizer sentido semanticamente.
- Export default: Metodo
```

- [ ] **Step 2: Typecheck + Commit**

```bash
cd site && npx tsc --noEmit
git add site/components/sections/Metodo.tsx
git commit -m "feat: componente Metodo da home"
```

---

### Task 14: Implementar componente `Resultados` com números animados

**Files:**
- Create: `site/components/sections/Resultados.tsx`

- [ ] **Step 1: Acionar `designer-web`**

Prompt:

```
Tarefa: Implementar componente Resultados em site/components/sections/Resultados.tsx baseado na seção 4 do briefing em site/docs/home-briefing.md.

Restrições:
- Esta é a seção com mais animação da página.
- Números animados (count-up de 0 ao valor final) usando Framer Motion com useInView pra disparar só quando entra em viewport.
- Estatísticas principais (ex: "+N alunos transformados", "X% atingem meta em Y semanas", "Z anos de método").
- Cards de prova social/depoimento entrando em stagger.
- Opcional: "notificações flutuantes" simulando prova social (ex: "Lucas P. acabou de entrar no Dino Team") — animação de fade in/out no canto, max 2-3 ciclos pra não distrair.
- Acessibilidade: números têm valor textual literal pra screen reader (aria-label completo), animação respeita prefers-reduced-motion.
- Export default: Resultados
```

- [ ] **Step 2: Typecheck + Commit**

```bash
cd site && npx tsc --noEmit
git add site/components/sections/Resultados.tsx
git commit -m "feat: componente Resultados com números animados"
```

---

### Task 15: Implementar componente `SobreRamon`

**Files:**
- Create: `site/components/sections/SobreRamon.tsx`

- [ ] **Step 1: Acionar `designer-web`**

Prompt:

```
Tarefa: Implementar componente SobreRamon em site/components/sections/SobreRamon.tsx baseado na seção 5 do briefing em site/docs/home-briefing.md.

Restrições:
- Layout editorial: foto do Ramon + texto narrativo lado a lado (desktop), empilhado (mobile).
- Tipografia maior pro storytelling (use display font do brand).
- Possível timeline / marcos (zero ao topo) — opcional, depende do briefing.
- Animação: parallax sutil na imagem em scroll, texto entra com fade.
- Acessibilidade: imagem com alt narrativo, <section aria-labelledby="ramon-title">.
- Export default: SobreRamon
```

- [ ] **Step 2: Typecheck + Commit**

```bash
cd site && npx tsc --noEmit
git add site/components/sections/SobreRamon.tsx
git commit -m "feat: componente SobreRamon da home"
```

---

### Task 16: Implementar componente `FAQ`

**Files:**
- Create: `site/components/sections/FAQ.tsx`

- [ ] **Step 1: Acionar `designer-web`**

Prompt:

```
Tarefa: Implementar componente FAQ em site/components/sections/FAQ.tsx baseado na seção 6 do briefing em site/docs/home-briefing.md.

Restrições:
- Use <Accordion> de @/components/ui/accordion (shadcn).
- 5-7 perguntas do briefing.
- Acessibilidade: Accordion shadcn já é acessível por padrão. Mantenha as labels descritivas.
- Animação: container entra em fade quando vira viewport.
- Export default: FAQ
```

- [ ] **Step 2: Typecheck + Commit**

```bash
cd site && npx tsc --noEmit
git add site/components/sections/FAQ.tsx
git commit -m "feat: componente FAQ com Accordion"
```

---

### Task 17: Implementar componente `CtaFinal`

**Files:**
- Create: `site/components/sections/CtaFinal.tsx`

- [ ] **Step 1: Acionar `designer-web`**

Prompt:

```
Tarefa: Implementar componente CtaFinal em site/components/sections/CtaFinal.tsx baseado na seção 7 do briefing em site/docs/home-briefing.md.

Restrições:
- CTA primário (decidido no briefing): pode ser botão WhatsApp (href com link) OU formulário simples de captura (nome + email + envio mailto).
- Sem backend nesta fase — se for formulário, ação é mailto: ou link pra WhatsApp.
- Visual de fechamento: alto impacto, full-width, contraste máximo.
- Animação: entrada com fade + scale sutil; CTA com hover/focus visíveis.
- Acessibilidade: form com labels associados, mensagens de erro com aria-live se houver validação client-side.
- Export default: CtaFinal
```

- [ ] **Step 2: Typecheck + Commit**

```bash
cd site && npx tsc --noEmit
git add site/components/sections/CtaFinal.tsx
git commit -m "feat: componente CtaFinal com CTA primário"
```

---

### Task 18: Integrar as 7 seções na home (acionar `dev-frontend`)

**Files:**
- Modify: `site/app/page.tsx`

- [ ] **Step 1: Acionar `dev-frontend`**

Prompt:

```
Tarefa: Atualizar site/app/page.tsx pra importar e renderizar as 7 seções na ordem: Hero, ParaQuemE, Metodo, Resultados, SobreRamon, FAQ, CtaFinal.

Restrições:
- Server Component (não precisa "use client" — as seções já são client onde precisam).
- Wrapper <main> com aria-label="Home Dino Team".
- Metadata da página (title, description) via export const metadata — usar copy do briefing pra SEO.
- Sem código extra além da composição.
```

Conteúdo esperado de `site/app/page.tsx`:

```tsx
import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { ParaQuemE } from "@/components/sections/ParaQuemE";
import { Metodo } from "@/components/sections/Metodo";
import { Resultados } from "@/components/sections/Resultados";
import { SobreRamon } from "@/components/sections/SobreRamon";
import { FAQ } from "@/components/sections/FAQ";
import { CtaFinal } from "@/components/sections/CtaFinal";

export const metadata: Metadata = {
  title: "Dino Team — Consultoria de Ramon Dino",
  description: "<copy SEO derivado do briefing>",
};

export default function Home() {
  return (
    <main aria-label="Home Dino Team">
      <Hero />
      <ParaQuemE />
      <Metodo />
      <Resultados />
      <SobreRamon />
      <FAQ />
      <CtaFinal />
    </main>
  );
}
```

- [ ] **Step 2: Verificar build + dev**

```bash
cd site && npm run build && npm run dev &
sleep 5
curl -s http://localhost:3000 | head -20
kill %1
```

Expected: build OK, HTML retorna com conteúdo das seções.

- [ ] **Step 3: Commit**

```bash
git add site/app/page.tsx
git commit -m "feat: integra 7 seções na home"
```

---

### Task 19: Validação técnica completa (acionar `curador-web`)

**Files:** (read-only)

- [ ] **Step 1: Adicionar scripts utilitários ao `site/package.json`**

Editar `site/package.json` pra incluir:

```json
"scripts": {
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit"
}
```

- [ ] **Step 2: Acionar `curador-web`**

Prompt:

```
Tarefa: Validar build, types, lint e Lighthouse da home.

Pasta: site/

Comandos a rodar:
1. cd site && npm run typecheck
2. cd site && npm run lint
3. cd site && npm run build
4. cd site && npm run start & (background)
5. sleep 3 && npx lighthouse http://localhost:3000 --quiet --chrome-flags="--headless" --output=json --output-path=./lighthouse-report.json
6. Encerrar processo do start

Critérios:
- typecheck: zero erros
- lint: zero erros
- build: sucesso
- Lighthouse: > 90 em Performance, Accessibility, Best Practices, SEO

Reportar todos os resultados. Se algum critério falhar, indicar arquivo + linha pra correção.
```

- [ ] **Step 3: Se houver issue reportado, voltar ao agente correspondente pra corrigir**

- Issues de typecheck/lint → `dev-frontend`
- Issues de a11y / contraste / animação → `designer-web`
- Issues de SEO (metadata, alt em imagens) → `dev-frontend`
- Issues de Performance (imagens grandes, JS pesado) → `dev-frontend`

Re-rodar `curador-web` após correções. Repetir até todos critérios passarem.

- [ ] **Step 4: Commit do package.json (e qualquer correção)**

```bash
git add site/
git commit -m "chore: scripts npm + correções pós-validação"
```

---

### Task 20: Preview deploy no Vercel

**Files:** (deploy externo)

- [ ] **Step 1: Verificar Vercel CLI**

```bash
npx vercel --version
```

Se não instalado, baixa na hora. Se autenticação for pedida, instruir o usuário a rodar `npx vercel login` no terminal dele.

- [ ] **Step 2: Primeiro deploy preview**

```bash
cd site && npx vercel --yes
```

Expected: prompt interativo pode pedir nome do projeto, escopo (pessoal ou time), confirmar build settings. `--yes` aceita padrões.

Se interativo demais, instruir o usuário a rodar manualmente.

Output esperado: URL temporária tipo `https://dino-team-xxx.vercel.app`.

- [ ] **Step 3: Validar URL no browser**

Acionar `curador-web` pra abrir a URL e confirmar visualmente:

```
Tarefa: Validar visualmente a URL <URL_PREVIEW>. Confirma renderização das 7 seções sem erro óbvio. Reportar inline.
```

- [ ] **Step 4: Devolver URL ao usuário**

Mensagem final pro usuário:

```
Site no ar (preview): <URL_PREVIEW>

Próximos passos opcionais:
- Comprar domínio e apontar DNS (spec seção 7.2)
- Ativar tracking (preencher env vars em site/.env e re-deploy)
- Criar primeira página adicional (skill /nova-pagina — criada quando precisar)
- Adicionar blog (skill /post-blog — criada quando precisar)
```

- [ ] **Step 5: Commit (se Vercel criou arquivos)**

```bash
git status
```

Se aparecer `site/.vercel/` (arquivo de config local), adicionar ao `.gitignore`:

```bash
echo ".vercel" >> site/.gitignore
git add site/.gitignore
git commit -m "chore: ignora .vercel local"
```

---

### Task 21: Atualizar `CLAUDE.md` com novos agentes/skill/pasta `site/`

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Ler `CLAUDE.md` atual pra localizar seções a modificar**

```bash
grep -n "^##\|^###" CLAUDE.md
```

- [ ] **Step 2: Adicionar 4 agentes na seção "Agentes"**

Localizar a lista de agentes e adicionar:

```markdown
- [`arquiteto-web`](.claude/agents/arquiteto-web.md) — decisões estruturais do site (stack, scaffold, organização).
- [`designer-web`](.claude/agents/designer-web.md) — componentes React + Tailwind + animações Framer Motion alinhados ao brand book.
- [`dev-frontend`](.claude/agents/dev-frontend.md) — integração cliente: estados, formulários, responsividade, a11y, performance.
- [`curador-web`](.claude/agents/curador-web.md) — validação técnica do site (build, lint, types, Lighthouse, preview deploy).
```

- [ ] **Step 3: Adicionar skill `/novo-site` na seção "Skills disponíveis"**

```markdown
- [`/novo-site`](.claude/skills/novo-site/SKILL.md) — criar o site Dino Team ou aplicar alterações (skill dual-mode).
```

- [ ] **Step 4: Adicionar nova função na seção "Funções do sistema"**

```markdown
- **Site institucional + comercial** — criar e manter o site Dino Team. Skill: `/novo-site`. Código em `site/`. Spec em `docs/specs/`.
```

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: registra agentes web, skill /novo-site e pasta site/ no CLAUDE.md"
```

---

## Self-Review (executada antes de entregar este plano)

**1. Spec coverage:**

| Spec section | Coberto por |
|--------------|-------------|
| 2. Stack técnica | Tasks 6, 7 |
| 3. Organização do repositório | Tasks 6, 21 |
| 4. Arquitetura de agentes (4 web) | Tasks 1, 2, 3, 4 |
| 5. Skills (`/novo-site`) | Task 5 |
| 6. MVP — Home (7 seções) | Tasks 10, 11–17, 18 |
| 7. Hospedagem e deploy | Task 20 |
| 8. Analytics/tracking | Task 9 |
| 9. Caminho de evolução | Documentado na skill `/novo-site`, sem task (futuro) |
| 10. Princípios operacionais | Embutidos nos agentes (Tasks 1–4) e skill (Task 5) |
| 11. Prompt sugerido | Suplantado por este plano (mais detalhado) |
| 12. Critérios de aceitação | Validados na Task 19 |

Sem gaps.

**2. Placeholder scan:**

- Task 8 Step 2: `<hex do acento do brand>` — propositalmente lido do brand book em runtime (Step 1). Não é placeholder ruim, é instrução de leitura.
- Task 11–17: prompts pra `designer-web` pedem componentes baseados no briefing produzido na Task 10 — código completo de cada componente não pode ser pré-escrito (depende do briefing). Aceitável: cada task tem contrato, restrições, critério de aceitação claros.
- Task 20 Step 2: depende de Vercel CLI ter autenticação configurada. Fallback documentado (instruir usuário a logar).

**3. Type consistency:**

- Nomes de componentes (`Hero`, `ParaQuemE`, `Metodo`, `Resultados`, `SobreRamon`, `FAQ`, `CtaFinal`) consistentes em Tasks 11–18.
- Paths (`site/components/sections/`, `site/app/page.tsx`, `site/components/TrackingScripts.tsx`) consistentes.
- Env vars (`NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_CLARITY_ID`) usadas no `.env.example` (Task 9 Step 2) batem com o componente (Task 9 Step 1).

Sem inconsistências.

---

## Notas de execução

- **Algumas tasks de componente (11–17) dependem da Task 10** (briefing). Não há como executá-las em paralelo antes do briefing existir. Após Task 10, Tasks 11–17 podem ser paralelizadas (todas leem o mesmo briefing).
- **TDD não se aplica diretamente** a componentes visuais e arquivos de agentes/skills. Critério de aceitação é: typecheck OK + build OK + visual confirmado pelo usuário + Lighthouse passa.
- **Frequent commits** garantidos: cada task termina com commit explícito.
- **Curador-web pode ser re-acionado** múltiplas vezes na Task 19 até passar. Faz parte do design.
