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
- [`/novo-post`](.claude/skills/novo-post/SKILL.md) — criar um post completo (carrossel ou stories).
- [`/lote-posts`](.claude/skills/lote-posts/SKILL.md) — gerar N posts em sequência, agendável.
- [`/novo-estilo`](.claude/skills/novo-estilo/SKILL.md) — criar um novo estilo visual para carrossel ou stories.
- [`/atualizar-ramon`](.claude/skills/atualizar-ramon/SKILL.md) — atualizar o slice `dados/ramon/` (fase atual + cronograma + outras vertentes).

### 3. Agentes — especialistas por função (`.claude/agents/`)

Cada agente domina **uma função** e organiza-se em **setor × papel** apenas textualmente — os arquivos físicos ficam todos achatados em `.claude/agents/<nome>.md` porque o loader do Claude Code só enxerga arquivos flat nessa pasta (subpastas são ignoradas). O agrupamento abaixo é a fonte de verdade humana da divisão setorial; o nome do agente carrega a função.

Agentes não conhecem o fluxo nem outros agentes — recebem input num formato declarado, entregam output num formato declarado. Conhecimento específico de um fluxo vive nas skills e templates, não no agente.

**Agentes atuais (11):**

- **Marketing / Pesquisa**
  - [`pesquisador-mercado`](.claude/agents/pesquisador-mercado.md) — pesquisa de mercado/tendências e owner do slice `dados/mercado/`.
- **Marketing / Estratégia**
  - [`briefing-writer`](.claude/agents/briefing-writer.md) — recomendação de estilo e briefing estratégico canônico.
- **Marketing / Execução**
  - [`copywriter`](.claude/agents/copywriter.md) — copy persuasiva.
  - [`designer`](.claude/agents/designer.md) — HTML+CSS visual.
- **Marketing / Revisão**
  - [`curador-export`](.claude/agents/curador-export.md) — validação técnica + export PNG.
  - [`revisor-coerencia`](.claude/agents/revisor-coerencia.md) — coerência editorial do artefato com o briefing.
- **Produto / Consultoria / Execução**
  - [`treinador`](.claude/agents/treinador.md) — decisões técnicas de treino.
- **Transversais / Brand**
  - [`revisor-brand`](.claude/agents/revisor-brand.md) — guardião transversal da identidade da marca (decisão binária).
  - [`revisor-compliance`](.claude/agents/revisor-compliance.md) — compliance: promessas proibidas e claims sensíveis.
- **Transversais / Dados**
  - [`archivist-ramon`](.claude/agents/archivist-ramon.md) — owner único do slice `dados/ramon/`; consolida o contexto do Ramon (input do usuário + auto-sync de fontes públicas).
  - [`analista-performance`](.claude/agents/analista-performance.md) — owner único do slice `dados/performance/`; registra ângulos queimados e (futuro) métricas de canais.

**Pastas-placeholder das camadas futuras** (na raiz do repo, fora de `.claude/agents/`):
- `dados/politicas/` — políticas YAML declarativas (popula na Onda 5).
- `campanhas/` — estado vivo de campanhas multi-canal (popula na Onda 5+).
- `orquestracao/` — `rotas.yaml` declarativo de triggers (popula na Onda 5).

Veja [docs/specs/2026-05-22-arquitetura-multi-setor-design.md](docs/specs/2026-05-22-arquitetura-multi-setor-design.md) para o destino completo (3 setores produtivos + 3 transversais + orquestração).

### 4. Banco de Dados (`dados/`)

Memória persistente compartilhada — markdown + frontmatter YAML, versionada em git, lida por qualquer agente e escrita apenas pelo owner declarado. Ver [`dados/_schema.md`](dados/_schema.md) para slices ativos e ownership.

**Slices em v1:**
- `dados/ramon/contexto.md` — contexto temporal e biográfico do Ramon, arquivo único (owner: `archivist-ramon`).
- `dados/mercado/` — pesquisa de mercado e vocabulário do público (owner: `pesquisador-mercado`).
- `dados/performance/` — só `angulos-queimados.md` em v1 (owner: `analista-performance`); outros sub-slices entram quando publicação real existir.
- `dados/pesquisas-brutas/` — pesquisas profundas geradas pelo pipeline (insumo cumulativo).

---

## Regras operacionais

- **Skills orquestram, agentes executam.** Skill define ordem, pausas e formato final; agentes dominam função e podem cooperar entre si dentro de uma ordem.
- **Brand é o eixo comum.** Qualquer agente consulta `brand/` quando o trabalho exigir contexto da marca.
- **Erros estruturais voltam pra skill** (ex: `BRAND_BOOK_INCOMPLETO`, `ESTILO_INVALIDO`).

---

## Funções do sistema

Cada função é executada por skills. Outputs ficam em `export/`, organizados por formato e data.

- **Criação de conteúdo** — produzir posts prontos para publicação. Skills: `/novo-post` (individual), `/lote-posts` (em lote).
- **Criação de estilos** — criar novos templates visuais para uso nos posts. Skill: `/novo-estilo`.
- **Descoberta de marca** — entrevista estruturada para preencher ou atualizar o brand book. Skill: `/brand-discovery`.

