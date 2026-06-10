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

As verdades atemporais que a marca acende são o conjunto canônico **`## Verdades`** em [`brand/brand-book.md`](brand/brand-book.md) — enumerável, consumido pelo `estrategista-mercado`, registrado no `registro-angulos`. **Fonte única; não duplicar a lista aqui** (foi a cópia divergente que gerou drift). Em síntese, a marca vende **direção, não motivação**; **consistência, não intensidade**; **execução, não vontade** — e trata o processo, não a chegada, como o prêmio (**identidade**).

---

## Como o sistema é organizado

Este repositório é o **sistema operacional de marca completo** do Dino Team.

> Nota: o repositório também hospeda um **projeto standalone não relacionado** ao brand OS — um mundo de agentes IA estilo Habbo (`docs/superpowers/specs/2026-06-05-metaverso-ia-agentes-design.md`). Não faz parte do pipeline Dino Team.

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

_Produção multicanal — todas ancoram numa verdade do `## Verdades` (brand-book) e dão write-back ao registro de ângulos:_
- [`/novo-post`](.claude/skills/novo-post/SKILL.md) — post Instagram completo (carrossel ou stories). Dispara `/pesquisar-mercado` (Fase A, quando stale) e `/pesquisar-tema` (deep research, quando informacional). Write-back: uma linha em `registro-angulos.md` (`--canal instagram`).
- [`/lote-posts`](.claude/skills/lote-posts/SKILL.md) — N posts Instagram em sequência, agendável. Write-back ao `registro-angulos.md` por post aprovado.
- [`/novo-artigo`](.claude/skills/novo-artigo/SKILL.md) — artigo de blog (MDX draft) em `export/conteudos/blog/<slug>/artigo.mdx`. Pesquisa via `/pesquisar-tema` quando informacional. Write-back `--canal blog`. A publicação no site é trabalho do GSD do site.
- [`/novo-email`](.claude/skills/novo-email/SKILL.md) — e-mail (assunto + preheader + corpo + CTA) em `export/conteudos/email/<slug>/email.md`. Tom de carta de mentor 1:1. Write-back `--canal email`. Envio real (Resend) é etapa futura.
- [`/novo-comunidade`](.claude/skills/novo-comunidade/SKILL.md) — mensagem para a comunidade (WhatsApp) em `export/conteudos/comunidade/<slug>/mensagem.md`. Tom de conversa, não broadcast. Write-back `--canal comunidade`. Disparo real é etapa futura.

_Estratégia e direção:_
- [`/planejar-pauta-semanal`](.claude/skills/planejar-pauta-semanal/SKILL.md) — L2: produz N briefings da semana (sem executar) passando pelo `estrategista-mercado` (lê o momento, aproveita-o e escolhe a verdade). Agendável (default: 2ª 9h via routine `/schedule`).

_Pesquisa e inteligência:_
- [`/pesquisar-mercado`](.claude/skills/pesquisar-mercado/SKILL.md) — Fase A standalone: captura inteligência de mercado durável (tendências, concorrentes, fala do público) em `memory/mercado/` + `memory/publico/`. Disparável manual ou pela produção quando stale.
- [`/pesquisar-tema`](.claude/skills/pesquisar-tema/SKILL.md) — deep research standalone para um ângulo/tema específico. Grava matéria-prima em `memory/pesquisa/`, reusável por `/novo-post`, `/lote-posts` e `/novo-artigo`.
- [`/curar-fontes`](.claude/skills/curar-fontes/SKILL.md) — ensina a **biblioteca de fontes curadas** (`memory/biblioteca/`) por entrevista: livros/autores/criadores/estudos por pilar, com trechos/páginas que a copy riffa. Semeadura + adicionar + promover candidatas. Owner do slice: `pesquisador-mercado`.

_Marca e site:_
- [`/brand-discovery`](.claude/skills/brand-discovery/SKILL.md) — entrevista para construir/atualizar o brand book.
- [`/afinar-tom-de-voz`](.claude/skills/afinar-tom-de-voz/SKILL.md) — refino profundo do `brand/tom-de-voz.md` por exemplos concretos; vai além do brand-discovery.
- [`/novo-estilo`](.claude/skills/novo-estilo/SKILL.md) — criar ou editar um estilo visual (template) para qualquer formato; gate `revisor-brand` valida a identidade visual.
- [`/editar-post`](.claude/skills/editar-post/SKILL.md) — reabre um post já criado no Dino Editor para edição visual (resolve o estilo pelo `briefing.md` do post).
- [`/configurar-banco`](.claude/skills/configurar-banco/SKILL.md) — define qual pasta do Google Drive é o banco de imagens da marca (via Drive MCP).
- [`/atualizar-ramon`](.claude/skills/atualizar-ramon/SKILL.md) — atualizar o slice `memory/ramon/` (fase atual + cronograma + outras vertentes).
- [`/novo-site`](.claude/skills/novo-site/SKILL.md) — criar ou alterar o site (dual-mode); aciona os agentes de Engenharia + gate `revisor-brand`.

_Produto — desenvolvimento e evolução (Sub-projeto A):_
- [`/criar-produto`](.claude/skills/criar-produto/SKILL.md) — entrevista guiada ancorada em evidência → blueprint de oferta no `catalogo.md` (status `em-validação`). Gate `revisor-brand` + G-ideia.
- [`/validar-produto`](.claude/skills/validar-produto/SKILL.md) — experimento barato (fake-door/landing/concierge) na audiência do Instagram; morte-por-padrão; G-lançamento consolidado.
- [`/evoluir-produto`](.claude/skills/evoluir-produto/SKILL.md) — melhoria + disciplina de sunset (custo afundado); invocada também pela rotina mensal de evolução.

_Auto-observabilidade:_
- [`/relatorio-sistema`](.claude/skills/relatorio-sistema/SKILL.md) — relatório periódico onde o sistema narra a si mesmo (prestação de contas + inteligência + direção + autoarquitetura). Pulso semanal (script) + mensal profundo (agentes + `arquiteto-sistema`). Custo e resultado/impacto são seções `💤` deferidas (Horizonte).

### 3. Agentes — especialistas por função (`.claude/agents/`)

Cada agente domina **uma função** e organiza-se em **setor × papel** apenas textualmente — os arquivos físicos ficam todos achatados em `.claude/agents/<nome>.md` porque o loader do Claude Code só enxerga arquivos flat nessa pasta (subpastas são ignoradas). O agrupamento abaixo é a fonte de verdade humana da divisão setorial; o nome do agente carrega a função.

Agentes não conhecem o fluxo nem outros agentes — recebem input num formato declarado, entregam output num formato declarado. Conhecimento específico de um fluxo vive nas skills e templates, não no agente.

**Agentes atuais (13):**

- **Marketing / Estratégia**
  - [`estrategista-mercado`](.claude/agents/estrategista-mercado.md) — lê o momento (emoção do público + crença de mercado) e escolhe a verdade da marca que **aproveita** esse momento (mostra o caminho, não reage); lê o `registro-angulos` para saturação/equilíbrio (não tem slice durável); propõe as jogadas da pauta.
- **Marketing / Pesquisa**
  - [`pesquisador-mercado`](.claude/agents/pesquisador-mercado.md) — pesquisa de mercado/tendências e owner dos slices `memory/mercado/` e `memory/biblioteca/` (fontes curadas: lê índice+fichas por pilar/tema; propõe candidatas).
- **Produto / Desenvolvimento & Evolução**
  - [`estrategista-produto`](.claude/agents/estrategista-produto.md) — descobre oportunidades no cérebro, prioriza por função-objetivo (anti-canibalização), arquiteta oferta, propõe preço, flaga evolução/sunset. Dono único de `memory/produto/`.
- **Produto / Consultoria / Execução**
  - [`treinador`](.claude/agents/treinador.md) — decisões técnicas de treino (entrega humanizada).
- **Transversais / Brand**
  - [`revisor-brand`](.claude/agents/revisor-brand.md) — guardião transversal da identidade da marca e compliance; gate em 2 momentos (identidade visual em criação de estilo; copy + compliance em criação de post).
- **Transversais / Dados**
  - [`arquivista`](.claude/agents/arquivista.md) — owner único do slice `memory/ramon/` e do banco de imagens; consolida contexto do Ramon (input do usuário + auto-sync de fontes públicas) e gerencia legenda/seleção/marcação de fotos por slide.
  - [`analista-performance`](.claude/agents/analista-performance.md) — owner único do slice `memory/performance/`; dono de `registro-angulos.md` (o que cada peça disse, escrito por script) e `metricas.md` (o que gerou — futuro); responde ângulo queimado e saturação.
- **Transversais / Sistema**
  - [`arquiteto-sistema`](.claude/agents/arquiteto-sistema.md) — meta-arquiteto: julga a arquitetura do próprio brand OS contra a constituição dele e propõe evolução (advisory). Produz a Camada D do relatório mensal. Stateless.
- **Engenharia / Execução / Web**
  - [`arquiteto-web`](.claude/agents/arquiteto-web.md) — scaffold, organização, libs, config do site.
  - [`designer-web`](.claude/agents/designer-web.md) — componentes React + Tailwind + Framer Motion.
  - [`dev-frontend`](.claude/agents/dev-frontend.md) — estados, formulários, responsividade, a11y, performance.
- **Engenharia / Execução / Integrações**
  - [`integrador-apis`](.claude/agents/integrador-apis.md) — constrói/mantém `scripts/integrations/publish_*.js` e `fetch_*.js`. Owner único.
- **Engenharia / Revisão**
  - [`curador-web`](.claude/agents/curador-web.md) — build, lint, types, Lighthouse, preview deploy.

A arquitetura viva é a **G3 "2 velocidades"**: verdade atemporal (lenta, em `brand/`) + leitura do momento (rápida, `estrategista-mercado`). Specs canônicas: [`2026-06-07-estrategista-mercado-design.md`](docs/specs/2026-06-07-estrategista-mercado-design.md) (modelo vigente) e [`2026-06-06-arquitetura-360-cerebro-de-marca-design.md`](docs/specs/2026-06-06-arquitetura-360-cerebro-de-marca-design.md) (fundação do cérebro); a reconciliação está em [`2026-06-08-reconciliacao-arquitetura-g3-design.md`](docs/specs/2026-06-08-reconciliacao-arquitetura-g3-design.md). A spec `2026-05-22-arquitetura-multi-setor` é **histórica (G1)** — superada.

### 4. Cérebro de marca (`memory/`)

**A memória é a integração.** As funções não se coordenam entre si — leem e escrevem o mesmo estado (blackboard). Markdown + frontmatter YAML, versionado em git, dono único por slice. Ver [`memory/_schema.md`](memory/_schema.md) para slices e ownership.

**Slices:**
- `memory/publico/` — dores e objeções com a fala do público embutida (owner: `pesquisador-mercado`).
- `memory/mercado/` — `narrativa-de-mercado.md` (discurso do nicho), `tendencias/`, `concorrentes/` (owner: `pesquisador-mercado`).
- `memory/ramon/contexto.md` — contexto temporal e biográfico do Ramon (owner: `arquivista`).
- `memory/performance/` — `registro-angulos.md` (ledger único do que cada peça **disse**: ângulo + verdade + pilar + descanso; funde os antigos `angulos-queimados.md` e `livro-razao.md`) + `metricas.md` (o que cada peça **gerou** — criado, alimentado por `fetch_*` no futuro, joinado por `slug`) + `provas-de-aluno.md` (owner: `analista-performance`).
- `memory/produto/` — `catalogo.md` (produtos vivos + status), `oportunidades.md` (hipóteses testáveis), `economia.md` + `funcao-objetivo.md` (input humano) (owner: `estrategista-produto`).
- `memory/pesquisa/` — pesquisa bruta (insumo cumulativo, não-verdade).
- `memory/biblioteca/` — `_indice.md` (índice leve) + `fontes/<slug>.md` (fichas curadas: trechos/páginas por pilar/tema). Ensinada por `/curar-fontes`, enriquecida por proposta no scouting; lida 1ª (antes da web) por `/pesquisar-tema` e na copy do `/novo-post` (owner: `pesquisador-mercado`).

> O slice `narrativas/` foi dissolvido em 2026-06: ângulo e verdade viraram um dado só (o que a peça disse) em `performance/registro-angulos.md`. O `estrategista-mercado` virou leitor (não tem mais slice durável).

**Setor Produto — desenvolvimento e evolução (Sub-projeto A):** tem slice próprio `memory/produto/` (owner `estrategista-produto`: `catalogo.md`, `oportunidades.md`, `economia.md` e `funcao-objetivo.md` — os dois últimos mantidos pelo humano). Lê `publico/` + `mercado/` + `performance/` + `brand/` para decidir produto; integra com Inteligência e Marketing **pela memória** (fila `pesquisa/pedidos.md`; oferta lida no `catalogo.md`). O `treinador` segue como entrega técnica humanizada.

### 5. Produção visual — Dino Editor + banco de imagens

Ferramental que toda peça de Instagram atravessa, separado do site.

- **Dino Editor** (`scripts/editor/`) — editor visual Figma-like servido localmente: abre os slides de um post (`design/slide-N.html`), permite edição direta (mover, redimensionar, texto), grava `edits.json` e re-exporta PNG (`scripts/export-png.js`). Usado pelo passo de design do `/novo-post`, por `/novo-estilo` (criar/editar templates) e por `/editar-post` (reabrir post pronto). Testado headless. Para testar, suba o servidor e abra no browser — **nunca** via agent-browser.
- **Banco de imagens por canal** — as fotos da marca vivem no Google Drive (MCP oficial em `.mcp.json`); `/configurar-banco` aponta a pasta-raiz, gravada em [`orquestracao/banco-imagens.yaml`](orquestracao/banco-imagens.yaml). O `arquivista` é owner: legenda, seleciona e marca fotos por slide, com **descanso por canal** (uma foto usada no Instagram descansa antes de reaparecer). O `/novo-post` seleciona/marca a imagem do banco no passo de design.

### 6. Site (`site/`)

Site institucional + comercial do Dino Team — Next.js 16 + Tailwind 4 + Framer Motion + Lucide + MDX. Construído e mantido pelo setor de Engenharia. Identidade monocromática (preto/branco/cinza) fiel ao brand book.

- [`/novo-site`](.claude/skills/novo-site/SKILL.md) — skill dual-mode (criação vs. alteração). Produz briefing institucional inline e exige aprovação de `revisor-brand` antes de cada deploy.
- MVP: home da consultoria com 7 seções (Hero, ParaQuemE, Método, Resultados, SobreRamon, FAQ, CtaFinal). Briefing em `site/docs/home-briefing.md`.

### 7. Orquestração + Dashboard

Camada que torna o sistema reativo. Triggers (**routines `/schedule`**, futuramente webhook/threshold) disparam skills sem slash command. Políticas declarativas decidem quando humano entra. Dashboard mostra estado e permite gatilho manual.

- **Governança:** [`orquestracao/governanca.yaml`](orquestracao/governanca.yaml) — mapa de autonomia por decisão: consolida os flags `automatico / humano / automatico_com_revisao` de cada função do roster. Para publicação, aponta para `politicas/publicacao.yaml`.
- **Rotas:** [`orquestracao/rotas.yaml`](orquestracao/rotas.yaml) — **documentação declarativa** de trigger → skill que as routines `/schedule` espelham (pauta semanal, pesquisa mensal, poll diário do novo-post).
- **Políticas:** [`orquestracao/politicas/publicacao.yaml`](orquestracao/politicas/publicacao.yaml) — regras de quando publicação é automática e quando exige aprovação humana. Referenciada por `governanca.yaml`; lida por `/novo-post`, `/lote-posts` e pelo dashboard.
- **Validador de política:** [`scripts/orquestracao/avaliar_politica.js`](scripts/orquestracao/avaliar_politica.js) — valida deterministicamente se um artefato passa pela política de publicação (`--canal`, `--pilar`, `--texto`, `--orcamento`). Prova que a política barra publicações com termos sensíveis.
- **Dashboard:** rota `/admin/dashboard` no site (auth por token). Mostra campanhas em curso, aprovações pendentes, frescor do banco, e dispara skills via Route Handler.
- **Agendamento:** routines `/schedule` que **executam de fato** (ver [`docs/automacao/routines.md`](docs/automacao/routines.md)) — pauta semanal (2ª), pesquisa de mercado (mensal) e poll diário do `/novo-post --auto` (gera posts vencidos → `aguardando-publicacao`). Os antigos handlers Vercel de cron foram removidos; a Vercel hospeda só o dashboard. **Publicação nunca é automática** (gate humano no dashboard).
- **Tools de publicação:** scripts em [`scripts/integrations/`](scripts/integrations/), mantidos por `integrador-apis`. v1: `publish_instagram.js`.
- **Campanhas:** estado vivo em [`campanhas/`](campanhas/) (schema em `campanhas/_schema.md`), escrito por skills L2/L3, lido pelo dashboard.
- **Relatórios:** [`relatorios/`](relatorios/) — saída versionada do `/relatorio-sistema` (`<YYYY-MM>/relatorio.md`, `<YYYY-Www>/pulso.md`). O dashboard renderiza quando a rota existir.
- **Run-ledger:** [`orquestracao/execucoes.jsonl`](orquestracao/execucoes.jsonl) — telemetria append-only das routines autônomas (`scripts/orquestracao/registrar_execucao.js`); fonte de "tarefas executadas & falhas" do relatório.

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
- **Função primeiro, corpo depois (anti-diluição).** Decisão durável e cara → **agente**; passo contextual barato → **inline na skill**; ação determinística → **script**. Foi instanciar agente fino pra tudo que diluiu o roster antes — só vira agente o que decide e é caro.

### Padrão de escrita de skills

Toda skill criada ou editada segue estas 9 regras (anti-redundância, anti-contexto-repetido):

1. **Numeração do `## Fluxo` linear `1..N`.** Zero passo fracionado (nada de `2a`, `3.⏸`, `11.5`). A obrigatoriedade do `## Fluxo` já está acima.
2. **Cada passo abre com `Lê:`** — uma linha listando o contexto que aquele passo lê (`brand/*`, `memory/*`, `estilo.md`…), **uma vez**. Sem bloco `Lê:` global no topo da skill e sem repetição inline.
3. **Condicionais = sub-bullets do passo-pai**, não passos próprios. A espinha numerada é só o happy path.
4. **Pausa (⏸) é parte do passo** que a contém — nunca um sub-passo.
5. **Modo (`--auto` etc.) num único bloco.** Proibido lembrete inline repetido por passo.
6. **Referência por nome de seção (`§Design`), nunca por número** — números mudam sob renumeração.
7. **Bloco de conteúdo longo compartilhado tem um lar canônico:** a skill mais completa detém o texto integral; as outras apontam por nome (não copiam).
8. **Fonte única para regra de sistema:** não restated spec de `brand/social-media.md`, drop-zones, "sem `preview.html`", "export valida sozinho" em cada passo — apontar onde mora.
9. **Edição = Dino Editor por link:** a skill sobe o editor e envia `http://localhost:4321`. Nunca mencionar "Live Preview". Stories (editor é carrossel-only) → preview via `export-png.js` (PNG).

Padrão de contratos e skills detalhado em [docs/specs/2026-05-26-redesign-contexto-agentes-skills-design.md](docs/specs/2026-05-26-redesign-contexto-agentes-skills-design.md).

---

## Funções do sistema

Cada função é executada por skills. Outputs ficam em `export/`, organizados por canal e data. **Produção é multicanal:** todas as skills de conteúdo ancoram numa verdade do `## Verdades` (brand-book) e escrevem de volta no mesmo `registro-angulos` — uma verdade acionada em múltiplos canais sem coordenação manual. A coerência entre semanas emerge do conjunto fixo de verdades + voz, não de campanha prescrita.

- **Criação de conteúdo — Instagram** — Skills: `/novo-post` (individual), `/lote-posts` (em lote).
- **Criação de conteúdo — Blog** — Artigo MDX draft pronto para integração no site. Skill: `/novo-artigo`.
- **Criação de conteúdo — E-mail** — Carta de mentor 1:1 com assunto, preheader e corpo. Skill: `/novo-email`.
- **Criação de conteúdo — Comunidade** — Mensagem curta para grupo WhatsApp. Skill: `/novo-comunidade`.
- **Criação de estilos** — criar novos templates visuais para uso nos posts. Skill: `/novo-estilo`.
- **Descoberta de marca** — entrevista estruturada para preencher ou atualizar o brand book. Skill: `/brand-discovery`.

---

## Horizonte declarado (não construído)

Capacidades do brand OS 360 conscientemente **adiadas** (YAGNI) — declaradas para não virarem amnésia. Cada uma tem um gatilho que a destrava:

| Capacidade | O que é | Gatilho |
|---|---|---|
| Narrativa/campanha proativa | construir uma crença ao longo de semanas (não só aproveitar o momento) | existir um evento datado a construir (lançamento de produto, fase de competição do Ramon) |
| Loop de resultado (outcome) | `scripts/integrations/fetch_*.js` popula `memory/performance/metricas.md`, cruzado por `slug` — "qual verdade/ângulo converte" | conta Instagram/API conectada |
| Loop operacional de Produto (Sub-projeto B) | telemetria de uso, retenção, tempo médio, engajamento, churn, CX + economia unitária real + voz direta dos alunos na descoberta | acesso à plataforma da consultoria + API |

Até o gatilho disparar, **não construir** — o sistema se equilibra por saturação (cobertura), não por resultado. A automação progressiva é **throughput-primeiro**: alargar produção/publicação gated antes de fechar o loop de resultado.

