# Site Dino Team — Design Doc

**Data:** 2026-05-19
**Status:** Spec aprovada — pronta pra implementação
**Escopo:** Site institucional + comercial da Dino Team, começando pelo MVP da home da consultoria

---

## 1. Visão geral

Site oficial da Dino Team. Funciona simultaneamente como **página de vendas premium** da consultoria e como **âncora de marca** que reforça posicionamento e credibilidade.

**MVP (fase 1):** Home única focada em vender a consultoria.
**Evolução prevista:** Blog → páginas de captura/vendas adicionais → login → área de membros → checkout integrado.

**Princípio condutor:** YAGNI rigoroso. Cada artefato (agente, skill, dependência, integração externa) só é criado quando o uso real chega. Arquitetura é desenhada pra escalar, mas só o que o presente exige é implementado.

---

## 2. Stack técnica

| Camada | Escolha | Por quê |
|--------|---------|---------|
| Framework | **Next.js 15** (App Router) | Escala do estático puro até login/checkout sem trocar de stack |
| Estilo | **Tailwind CSS 4** | Velocidade de iteração, consistente com o brand book |
| Componentes | **shadcn/ui** + **Radix** | Acessível por padrão, copiado pro repo (sem dependência travada) |
| Animações | **Framer Motion** | Padrão de mercado pra micro-animações premium (números contando, cards entrando, notificações flutuantes) |
| Ícones | **Lucide** | Leve, consistente, ampla cobertura |
| Conteúdo (blog futuro) | **MDX** | Markdown + React, sem CMS externo |
| Hospedagem | **Vercel** (free tier) | Zero servidor, HTTPS automático, preview deploys por PR, edge functions inclusos |
| Versionamento | **GitHub** | Origem do deploy, histórico, PRs com preview URL |
| Domínio | Comprado em Registro.br / Cloudflare | DNS migrado pra Cloudflare (grátis, melhor performance) |

**Banco de dados:** ausente no MVP. Quando entrar (login, formulários persistentes): **Supabase free tier** — um único serviço externo, com fallback pra Neon ou Convex se preferir.

---

## 3. Organização do repositório

O site vive **neste mesmo repositório**, em `site/`. Justificativa: brand book, agentes, skills, conteúdos de Instagram e código do site são todos "Dino Team" — separar em dois repos cria sincronização desnecessária do brand book.

```
dino team/
├── brand/              # já existe — eixo comum dos agentes
├── .claude/
│   ├── agents/         # existentes + 4 novos web
│   └── skills/         # existentes + 3 novas web
├── conteudos/          # já existe — posts Instagram produzidos
├── templates/          # já existe — templates de posts
├── docs/specs/         # specs (este arquivo)
└── site/               # NOVO — código do site
    ├── app/
    ├── components/
    ├── content/        # MDX dos posts de blog (futuro)
    ├── lib/
    ├── public/
    └── package.json
```

Vercel aponta pra subpasta `site/` no deploy.

---

## 4. Arquitetura de agentes

### 4.1 Agentes web novos (criados quando a fase exigir)

| Agente | Função | Criado na fase |
|--------|--------|----------------|
| **`arquiteto-web`** | Decisões estruturais: stack, scaffold, organização, libs, padrões de código | MVP |
| **`designer-web`** | Componentes React + Tailwind + animações Framer Motion alinhados ao brand book | MVP |
| **`dev-frontend`** | Implementação cliente: componentes, estados, formulários, responsividade, a11y, performance | MVP |
| **`curador-web`** | Validação técnica: build, lint, types, Lighthouse, preview deploy, reporta issues sem mascarar | MVP |
| **`dev-backend`** | Implementação servidor: APIs, autenticação, banco, integrações (Stripe, email, WhatsApp), webhooks | Fase 3+ (quando entrar primeiro formulário com persistência ou login) |

### 4.2 Agentes existentes reaproveitados

| Agente | Como contribui pro site |
|--------|--------------------------|
| **`diretor-marca`** | Briefing estratégico de cada página/seção; curadoria editorial final |
| **`copywriter`** | Copy de seções, CTAs, microcopy, meta descriptions, SEO copy (ganha modo "web") |
| **`pesquisa-tendencias`** | Benchmark de concorrentes, referências visuais, validação de hipóteses |

### 4.3 Regras operacionais (herdadas do sistema atual)

- Agentes são especialistas isolados — não conhecem o fluxo nem outros agentes
- Brand book é o eixo comum — qualquer agente consulta `brand/` quando precisa
- Skills orquestram o fluxo principal; agentes podem trocar info / delegar entre si em runtime
- Erros estruturais voltam pra skill que decidiu o próximo passo

---

## 5. Skills

### 5.1 Mapa completo de skills (todas previstas, mas criadas só quando a fase exigir)

| Skill | Comportamento | Criada na fase |
|-------|---------------|----------------|
| **`/novo-site`** | Skill **dual-mode** (como `/novo-estilo` faz). Detecta o modo automaticamente checando se `site/package.json` existe. **Modo criação** (site não existe): orquestra `arquiteto-web` → `diretor-marca` → `designer-web` + `dev-frontend` → `curador-web`. **Modo alteração** (site existe): exibe estado atual, recebe descrição da mudança (texto, layout, componente, nova integração, ajuste de copy), aplica com os agentes pertinentes. Engloba o que seria um `/alterar` separado. | **MVP** |
| **`/nova-pagina <descrição>`** | Adiciona página nova ao site existente (vendas, captura, sobre Ramon, etc). Fluxo: `diretor-marca` (briefing) → `designer-web` + `dev-frontend` → `curador-web`. | Fase 2+ (quando precisar da segunda página) |
| **`/post-blog [tema]`** | Gera novo post Markdown pra `site/content/blog/`. Fluxo: `pesquisa-tendencias` (se tema vago) → `diretor-marca` (briefing) → `copywriter` → arquivo `.mdx` pronto pra commit. | Fase 2 (quando o blog entrar) |

### 5.2 Não viram skill (uso único ou raro)

- **Adicionar funcionalidade backend** (login, checkout, área de membros) — projeto único quando chegar a hora, aciona `dev-backend` diretamente. Vira skill apenas se virar padrão repetível.

---

## 6. MVP — Home da consultoria

### 6.1 Objetivo único da página

**Vender a consultoria.** CTA primário fecha venda (WhatsApp qualificado ou checkout, a decidir no briefing). Toda decisão de design serve esse objetivo. CTA secundário implícito: design + storytelling carregam credibilidade da marca.

### 6.2 Direção visual

- **Estilo:** minimalista premium escuro, alto contraste, tipografia grande e confiante, whitespace generoso, acento de cor único e marcante (a definir no briefing — derivado do brand book)
- **Animações:** micro-interações ricas — números contando (métricas de transformação), cards entrando em scroll, notificações flutuantes (prova social), parallax sutil
- **Referências validadas:** [stndrd.app](https://www.stndrd.app/), [joinladder.com](https://www.joinladder.com/), [brightscout.com](https://www.brightscout.com/)

### 6.3 Seções (esboço — refinadas no briefing)

1. **Hero** — proposta única + CTA primário + visual forte do Ramon
2. **Para quem é** — qualifica o público (filtra curioso de cliente real)
3. **Método** — pilares do Dino Team (extraídos de `brand/pilares-conteudo.md`)
4. **Resultados** — números animados + transformações + prova social
5. **Sobre Ramon** — narrativa do zero ao topo, credibilidade
6. **FAQ** — objeções principais antecipadas
7. **CTA final** — fechamento + formulário/WhatsApp

### 6.4 Responsividade e acessibilidade

- Mobile-first obrigatório (maior parte do tráfego vem de Instagram)
- Acessibilidade WCAG AA: contraste, foco visível, navegação por teclado, alt em imagens, ARIA quando necessário

---

## 7. Hospedagem, deploy, domínio

### 7.1 Fluxo de deploy

| Ação | Como acontece |
|------|---------------|
| Primeiro deploy | `git push` → Vercel detecta → build → URL temporária `dinoteam.vercel.app` em ~1min |
| Alteração | Edita → commit → push → redeploy automático. Cada PR ganha "preview URL" pra revisar antes do merge |
| Rollback | Vercel → Deployments → "Promote to Production" numa versão anterior. Instantâneo. |

### 7.2 Domínio

1. Comprar domínio (Registro.br pra `.com.br`, Cloudflare/Namecheap pra `.com`) — **pode ser feito a qualquer momento**, idealmente cedo pra garantir o nome
2. Vercel → Settings → Domains → adicionar domínio → copiar registros DNS
3. Configurar DNS no provedor (recomendado migrar pra Cloudflare — grátis, mais rápido, melhor painel)
4. Propagação: 15min a 2h. SSL automático após propagar.

Site funciona com URL Vercel enquanto isso — domínio não trava nada.

---

## 8. Analytics, tracking, integrações

Centralizadas num componente único `<TrackingScripts />` no `app/layout.tsx`. Cada ferramenta é ativada por variável de ambiente — adicionar/remover não exige reescrever código.

| Ferramenta | Quando faz sentido |
|------------|--------------------|
| **Vercel Analytics** | Sempre — já incluso no Vercel free, zero setup, pageviews + Web Vitals |
| **Google Analytics 4** | Quando precisar análise mais profunda (funis, audiências) |
| **Plausible / Umami** | Alternativa GA mais leve e privacy-friendly (Umami é self-hostable) |
| **Meta Pixel** | Obrigatório quando rodar tráfego pago no Instagram/Facebook |
| **Microsoft Clarity** | Heatmap + gravação de sessão grátis — útil pra otimizar conversão |
| **Google Tag Manager** | Só se for ter muitas tags (>5). Senão é overkill |

Decisão de **o que ativar** é do usuário + `diretor-marca` (estratégica).
Decisão de **como implementar** é do `dev-frontend` (técnica).

---

## 9. Caminho de evolução

| Fase | Entrega | Agentes que ativam | Plataformas externas |
|------|---------|---------------------|----------------------|
| **1 — MVP** | Home da consultoria | `arquiteto-web`, `designer-web`, `dev-frontend`, `curador-web` + reuso | Vercel + GitHub |
| **2 — Blog** | Posts MDX no `site/content/blog/` + página de listagem + página individual | Mesmos da fase 1 + `copywriter` | Idem |
| **3 — Captura/forms** | Formulário com envio de email (sem persistência ainda) | + `dev-backend` (primeira ativação) | + provedor de email (Resend, ~grátis até 3k/mês) |
| **4 — Login + área de membros** | Auth + banco | `arquiteto-web` revisita + `dev-backend` protagonista | + Supabase |
| **5 — Checkout integrado** | Venda direta no site | `dev-backend` | + Stripe ou Pagar.me |

Cada fase só começa quando a anterior é estabilizada. Não se monta fase 4 "porque um dia vai precisar".

---

## 10. Princípios operacionais

- **YAGNI rigoroso** — agente, skill, dependência ou serviço externo só existe quando o presente exige
- **Brand book é fonte da verdade visual e editorial** — qualquer divergência é erro
- **Componentes reutilizáveis** — toda decisão visual da home alimenta a biblioteca, próximas páginas reaproveitam
- **Performance é feature** — Lighthouse > 90 em todas as métricas é critério de aceitação do `curador-web`
- **Mobile-first** — desenhado pra mobile antes de desktop
- **Acessibilidade WCAG AA** — não negociável
- **Preview antes de produção** — toda alteração passa por preview URL antes do merge

---

## 11. Prompt sugerido pra iniciar a construção

Quando você (Bruno) decidir começar a construção real do site, copie e cole o prompt abaixo no Claude Code dentro deste repositório. Ele dispara o fluxo estruturado.

```
Iniciar construção do site Dino Team conforme spec em
docs/specs/2026-05-19-site-dino-team-design.md.

FASE ATUAL: 1 — MVP (home única da consultoria)

PASSO 1 — Criar os 4 agentes web definidos no spec:
- arquiteto-web
- designer-web
- dev-frontend
- curador-web

Cada agente segue o padrão dos agentes existentes em .claude/agents/
(documento isolado, especialista puro, input/output declarados,
consulta brand/ quando precisa de contexto da marca).

PASSO 2 — Criar a skill /novo-site em .claude/skills/novo-site/SKILL.md,
seguindo o padrão dual-mode do /novo-estilo (detecta criação vs alteração).

PASSO 3 — Executar /novo-site em modo criação:
- arquiteto-web faz scaffold do Next.js 15 em site/ com Tailwind,
  shadcn/ui, Framer Motion, Lucide, MDX configurado pro blog futuro
- diretor-marca produz briefing da home (objetivo: vender consultoria;
  estilo: minimalista premium escuro; refs: stndrd, joinladder, brightscout)
- designer-web + dev-frontend implementam as 7 seções esboçadas na
  spec (Hero, Para quem é, Método, Resultados, Sobre Ramon, FAQ, CTA final)
- curador-web valida build, lint, types, Lighthouse e abre preview local

PASSO 4 — Pausar antes do deploy. Apresentar preview local pro Bruno revisar
seção por seção. Aplicar ajustes solicitados antes de commit.

PASSO 5 — Após aprovação visual: configurar repositório no Vercel (apontando
pra subpasta site/), primeiro deploy, devolver URL temporária.
Compra de domínio e apontamento DNS ficam pra um segundo momento.

RESTRIÇÕES:
- Não criar agente dev-backend ainda (fase 3+)
- Não criar skills /nova-pagina ou /post-blog ainda (criar quando o uso chegar)
- Brand book é fonte da verdade visual e editorial
- Tudo mobile-first, Lighthouse > 90, WCAG AA
- Nenhum serviço externo além de Vercel + GitHub nesta fase
```

---

## 12. Critérios de aceitação do MVP

A fase 1 está completa quando:

- [ ] 4 agentes web criados e documentados em `.claude/agents/`
- [ ] Skill `/novo-site` criada e funcional em modo criação
- [ ] Projeto Next.js scaffolded em `site/` com todas as libs configuradas
- [ ] 7 seções da home implementadas, responsivas (mobile/tablet/desktop)
- [ ] Animações funcionando (números contando, cards entrando, notificações flutuantes)
- [ ] Lighthouse > 90 em Performance, Accessibility, Best Practices, SEO
- [ ] Componente `<TrackingScripts />` pronto (mesmo que nenhum ID configurado ainda)
- [ ] Deploy no Vercel funcionando com URL temporária
- [ ] CTA primário (WhatsApp ou checkout) testado e funcionando
- [ ] Aprovação visual do Bruno seção por seção
