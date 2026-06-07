# Dino Team

> Documento mestre da marca Dino Team
> Sistema multi-agente orientado por skills.

---

## O que é o Dino Team

Consultoria de treinamento e dieta personalizada + comunidade da marca pessoal de **Ramon Dino** — primeiro brasileiro campeão do maior campeonato do mundo de fisiculturismo.

Entrega ao público comum o método validado por Ramon, que saiu do zero absoluto ao topo mundial. Branding, história, propósito, palavras-chave e mensagens centrais estão em [`brand/brand-book.md`](brand/brand-book.md).

### O que a Dino Team **não** é
- Não é consultoria fitness genérica.
- Não promete resultados irreais nem atalhos.
- Não se baseia em teoria ou achismo.
- Não usa motivação vazia nem vitimismo.
- Não vende velocidade — vende direção.

---

## Princípios centrais

- **Direção > esforço.**
- **Disciplina é fazer mesmo sem vontade.**
- **Consistência vence intensidade.**
- **Resultado vem de execução, não de motivação.**

---

## Como o sistema é organizado

Este repositório é o **sistema operacional de marca completo** do Dino Team.

### 1. Branding da marca (`brand/`)

Documentos institucionais que ancoram toda decisão. Cada agente lê automaticamente os arquivos ligados à sua função (declarado em `.claude/agents/<nome>.md`); `brand-book.md` é leitura obrigatória dos agentes editoriais.

- [`brand/brand-book.md`](brand/brand-book.md) — essência, propósito, mensagens centrais.
- [`brand/tom-de-voz.md`](brand/tom-de-voz.md) — como a marca fala.
- [`brand/publico-alvo.md`](brand/publico-alvo.md) — quem é o leitor.
- [`brand/pilares-conteudo.md`](brand/pilares-conteudo.md) — eixos temáticos válidos.
- [`brand/referencias-visuais.md`](brand/referencias-visuais.md) — paleta, tipografia, mood.

### 2. Skills — fluxos orquestrados (`.claude/skills/`)

Cada skill é um **fluxo de trabalho ponta a ponta**. A skill é quem **orquestra**: define a ordem das etapas, qual agente é acionado em cada uma, como o output de um vira input do próximo, onde pausa para confirmação do usuário, e qual é o formato do entregável final.

**Skills disponíveis:**
- [`/brand-discovery`](.claude/skills/brand-discovery/SKILL.md) — entrevista para construir/atualizar o brand book.
- [`/novo-post`](.claude/skills/novo-post/SKILL.md) — criar um post completo (carrossel ou stories). Dispara `/pesquisar-mercado` (Fase A, quando stale) e `/pesquisar-tema` (deep research, quando informacional). Ao finalizar com APROVADO, escreve de volta no cérebro: ângulo em `angulos-queimados.md` e mensagem em `livro-razao.md`.
- [`/lote-posts`](.claude/skills/lote-posts/SKILL.md) — gerar N posts em sequência, agendável. Também dá write-back ao `livro-razao.md` por post aprovado.
- [`/novo-estilo`](.claude/skills/novo-estilo/SKILL.md) — criar um novo estilo visual para carrossel ou stories.
- [`/atualizar-ramon`](.claude/skills/atualizar-ramon/SKILL.md) — atualizar o slice `memory/ramon/` (fase atual + cronograma + outras vertentes).
- [`/novo-site`](.claude/skills/novo-site/SKILL.md) — criar ou alterar o site (dual-mode); aciona os agentes de Engenharia + gate `revisor-brand`.
- [`/planejar-pauta-semanal`](.claude/skills/planejar-pauta-semanal/SKILL.md) — L2: produz N briefings da semana (sem executar). Agendável (default: 2ª 9h via cron).
- [`/ciclo-de-direcao`](.claude/skills/ciclo-de-direcao/SKILL.md) — define/atualiza arcos de narrativa ativos em `memory/narrativas/ativas.md`. Precede `/planejar-pauta-semanal` a cada novo horizonte estratégico.
- [`/pesquisar-mercado`](.claude/skills/pesquisar-mercado/SKILL.md) — Fase A standalone: captura inteligência de mercado durável (tendências, concorrentes, fala do público) em `memory/mercado/` + `memory/publico/`. Disparável manual ou pela produção quando stale.
- [`/pesquisar-tema`](.claude/skills/pesquisar-tema/SKILL.md) — deep research standalone para um ângulo/tema específico. Grava matéria-prima em `memory/pesquisa/`, reusável por `/novo-post` e `/lote-posts`.

### 3. Agentes — especialistas por função (`.claude/agents/`)

Cada agente domina **uma função** e organiza-se em **setor × papel** apenas textualmente — os arquivos físicos ficam todos achatados em `.claude/agents/<nome>.md` porque o loader do Claude Code só enxerga arquivos flat nessa pasta (subpastas são ignoradas). O agrupamento abaixo é a fonte de verdade humana da divisão setorial; o nome do agente carrega a função.

Agentes não conhecem o fluxo nem outros agentes — recebem input num formato declarado, entregam output num formato declarado. Conhecimento específico de um fluxo vive nas skills e templates, não no agente.

**Agentes atuais (11):**

- **Marketing / Pesquisa**
  - [`pesquisador-mercado`](.claude/agents/pesquisador-mercado.md) — pesquisa de mercado/tendências e owner do slice `memory/mercado/`.
- **Marketing / Revisão**
  - [`curador-export`](.claude/agents/curador-export.md) — validação técnica + export PNG.
- **Produto / Consultoria / Execução**
  - [`treinador`](.claude/agents/treinador.md) — decisões técnicas de treino.
- **Transversais / Brand**
  - [`revisor-brand`](.claude/agents/revisor-brand.md) — guardião transversal da identidade da marca e compliance; gate em 2 momentos (identidade visual em criação de estilo; copy + compliance em criação de post).
- **Transversais / Dados**
  - [`arquivista`](.claude/agents/arquivista.md) — owner único do slice `memory/ramon/` e do banco de imagens; consolida contexto do Ramon (input do usuário + auto-sync de fontes públicas) e gerencia legenda/seleção/marcação de fotos por slide.
  - [`analista-performance`](.claude/agents/analista-performance.md) — owner único do slice `memory/performance/`; registra ângulos queimados e (futuro) métricas de canais.
- **Engenharia / Execução / Web**
  - [`arquiteto-web`](.claude/agents/arquiteto-web.md) — scaffold, organização, libs, config do site.
  - [`designer-web`](.claude/agents/designer-web.md) — componentes React + Tailwind + Framer Motion.
  - [`dev-frontend`](.claude/agents/dev-frontend.md) — estados, formulários, responsividade, a11y, performance.
- **Engenharia / Execução / Integrações**
  - [`integrador-apis`](.claude/agents/integrador-apis.md) — constrói/mantém `scripts/integrations/publish_*.js` e `fetch_*.js`. Owner único.
- **Engenharia / Revisão**
  - [`curador-web`](.claude/agents/curador-web.md) — build, lint, types, Lighthouse, preview deploy.

Veja [docs/specs/2026-05-22-arquitetura-multi-setor-design.md](docs/specs/2026-05-22-arquitetura-multi-setor-design.md) para o destino completo (3 setores produtivos + 3 transversais + orquestração).

### 4. Cérebro de marca (`memory/`)

**A memória é a integração.** As funções não se coordenam entre si — leem e escrevem o mesmo estado (blackboard). Markdown + frontmatter YAML, versionado em git, dono único por slice. Ver [`memory/_schema.md`](memory/_schema.md) para slices e ownership.

**Slices:**
- `memory/narrativas/` — narrativas ativas, roadmap de crença, livro-razão de mensagens (owner: `estrategista-narrativa`).
- `memory/publico/` — dores e objeções com a fala do público embutida (owner: `pesquisador-mercado`; Produto alimenta).
- `memory/mercado/` — `narrativa-de-mercado.md` (discurso do nicho), `tendencias/`, `concorrentes/` (owner: `pesquisador-mercado`).
- `memory/ramon/contexto.md` — contexto temporal e biográfico do Ramon (owner: `arquivista`).
- `memory/performance/` — `angulos-queimados.md` + métricas por canal (futuro) (owner: `analista-performance`).
- `memory/pesquisa/` — pesquisa bruta (insumo cumulativo, não-verdade).

### 5. Site (`site/`)

Site institucional + comercial do Dino Team — Next.js 16 + Tailwind 4 + Framer Motion + Lucide + MDX. Construído e mantido pelo setor de Engenharia. Identidade monocromática (preto/branco/cinza) fiel ao brand book.

- [`/novo-site`](.claude/skills/novo-site/SKILL.md) — skill dual-mode (criação vs. alteração). Produz briefing institucional inline e exige aprovação de `revisor-brand` antes de cada deploy.
- MVP: home da consultoria com 7 seções (Hero, ParaQuemE, Método, Resultados, SobreRamon, FAQ, CtaFinal). Briefing em `site/docs/home-briefing.md`.

### 6. Orquestração + Dashboard

Camada que torna o sistema reativo. Triggers (cron, futuramente webhook/threshold) disparam skills sem slash command. Políticas declarativas decidem quando humano entra. Dashboard mostra estado e permite gatilho manual.

- **Rotas:** [`orquestracao/rotas.yaml`](orquestracao/rotas.yaml) — tabela declarativa de trigger → skill. v1 com 1 rota (cron pauta semanal).
- **Políticas:** [`orquestracao/politicas/publicacao.yaml`](orquestracao/politicas/publicacao.yaml) — regras de quando publicação é automática e quando exige aprovação humana.
- **Dashboard:** rota `/admin/dashboard` no site (auth por token). Mostra campanhas em curso, aprovações pendentes, frescor do banco, e dispara skills via Route Handler.
- **Cron:** Vercel Cron + Route Handler em `site/app/api/cron/<id>/route.ts`.
- **Tools de publicação:** scripts em [`scripts/integrations/`](scripts/integrations/), mantidos por `integrador-apis`. v1: `publish_instagram.js`.
- **Campanhas:** estado vivo em [`campanhas/`](campanhas/) (schema em `campanhas/_schema.md`), escrito por skills L2/L3, lido pelo dashboard.

---

## Regras operacionais

- **Skills orquestram fluxos; agentes possuem funções.** Uma função pode ser **decisão, memória ou execução** — não só execução. Agentes se coordenam **pela memória (`memory/`), nunca entre si** (blackboard: "a memória é a integração"). Skill define ordem, pausas e formato final; o agente domina fundo o próprio domínio de decisão e não conhece a orquestração (qual skill chama quem).
- **Skill = fluxo; contrato = comportamento.** A skill define ordem, envelope entre agentes, dependências, retrabalho e output final. O contrato do agente define critérios de qualidade, como processar input, schema de output e tratamento de input incompleto. Nunca colocar comportamento interno do agente na skill.
- **Contexto cirúrgico, sem redundância.** A skill só injeta o que varia por chamada. Nunca repassa contexto que o agente já declara em "Contexto que carrego" (brand/*, slices que é owner, diretivas). Nenhuma instrução repetida entre skill e contrato.
- **Schema rígido de saída.** Todo agente entrega num dos 3 formatos: inline rígido (tags/campos), markdown estruturado (briefing) ou manifesto (file-producers). Sem preâmbulo; texto fora do schema é ignorado.
- **Orçamento via contrato.** Sem `max_tokens` por subagent no runtime — cada contrato declara alvo de concisão + anti-padding.
- **Early-exit + máx 1 retry.** Gate antes de agente caro; máx 1 retry automático por etapa, 2º fracasso escala ao usuário.
- **Toda skill abre com `## Fluxo`** (tabela: Passo | Agente/Ação | Recebe | Depende | Entrega).
- **Brand é o eixo comum.** Cada agente lê o recorte de `brand/` que sua função exige — declarado em "Contexto que carrego" do próprio contrato.
- **Erros estruturais voltam pra skill** (ex: `BRAND_BOOK_INCOMPLETO`, `ESTILO_INVALIDO`).

Padrão de contratos e skills detalhado em [docs/specs/2026-05-26-redesign-contexto-agentes-skills-design.md](docs/specs/2026-05-26-redesign-contexto-agentes-skills-design.md).

---

## Funções do sistema

Cada função é executada por skills. Outputs ficam em `export/`, organizados por formato e data.

- **Criação de conteúdo** — produzir posts prontos para publicação. Skills: `/novo-post` (individual), `/lote-posts` (em lote).
- **Criação de estilos** — criar novos templates visuais para uso nos posts. Skill: `/novo-estilo`.
- **Descoberta de marca** — entrevista estruturada para preencher ou atualizar o brand book. Skill: `/brand-discovery`.

