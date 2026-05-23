# Onda 5 — Orquestração + Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Primeira automação real do sistema. Entregar **uma única rota cron** (`/planejar-pauta-semanal` toda 2ª 9h), uma **política declarativa** que decide quando humano entra, um **dashboard leitor + gatilho** no site, o agente `integrador-apis` e a primeira **tool de publicação determinística** (`publish_instagram.js`) — provando o ciclo completo: cron → skill → política → dashboard → publish.

**Architecture:**
- **YAGNI rigoroso:** 1 cron, 1 rota, 1 política, 1 tool de publicação. Webhooks externos, threshold, WhatsApp/Telegram ficam para depois.
- **Cron via Vercel Cron** (site já deployado na Onda 4). Sem GitHub Actions — uma plataforma só.
- **Skills L2 = compostas:** `/planejar-pauta-semanal` produz N briefings sem executar posts. Output em `campanhas/<slug>/briefing-mestre.md` + grafo de execução. A execução real continua sendo `/lote-posts` chamada pelo usuário ou pelo dashboard.
- **Política em YAML declarativo:** skills consultam antes de chamar tool de publicação. Default conservador (`aprovacao_humana`); regras explícitas liberam casos seguros.
- **Dashboard leitor + gatilho:** mostra estado lendo arquivos diretos (`campanhas/`, `dados/`, `dados/politicas/`); dispara skills via Route Handlers do Next.js.
- **`publish_instagram.js`** é script Node determinístico; lê env vars (token Instagram Graph API), recebe pasta do post como argumento, posta carrossel ou story. Sem LLM.
- `integrador-apis` (novo agente em Engenharia/Execução/Integrações) é o owner que constrói e mantém os scripts `publish_*.js` e `fetch_*.js` futuros.

**Spec de referência:** [docs/specs/2026-05-22-arquitetura-multi-setor-design.md §5 e §6.6](../specs/2026-05-22-arquitetura-multi-setor-design.md)

**Dependências:** Ondas 1, 2, 3 e 4 concluídas (sem o site em `site/`, não há Vercel Cron nem dashboard).

**Invariantes:**
- Skills `/novo-post`, `/lote-posts`, `/novo-estilo`, `/brand-discovery`, `/atualizar-ramon`, `/novo-site` continuam funcionando.
- O `publish_instagram.js` não roda sem credenciais explícitas via env — em ambiente sem credenciais, retorna erro claro.

---

## File Structure

### Arquivos criados — agente

| Arquivo | Responsabilidade |
|---|---|
| `.claude/agents/integrador-apis.md` | Owner único de `scripts/integrations/`. Constrói e mantém `publish_*.js` e `fetch_*.js` |

### Arquivos criados — orquestração

| Arquivo | Responsabilidade |
|---|---|
| `orquestracao/rotas.yaml` | Tabela declarativa de rotas: trigger → skill. 1 rota inicial |
| `dados/politicas/publicacao.yaml` | Regras declarativas para publicação. Defaults conservadores; libera casos seguros |
| `dados/politicas/README.md` | Como políticas funcionam, quem lê, quem edita |

### Arquivos criados — skill L2

| Arquivo | Responsabilidade |
|---|---|
| `.claude/skills/planejar-pauta-semanal/SKILL.md` | L2 — pesquisa de tendências da semana + briefings para N posts; output em `campanhas/<YYYY-Www>/`. Não executa posts. |

### Arquivos criados — tool de publicação

| Arquivo | Responsabilidade |
|---|---|
| `scripts/integrations/publish_instagram.js` | Script Node determinístico. Recebe pasta do post; posta carrossel ou story via Instagram Graph API. Lê credenciais de env |
| `scripts/integrations/README.md` | Como rodar, quais env vars são necessárias, como Instagram Graph API foi autorizada |
| `scripts/integrations/.env.example` | Template das env vars |

### Arquivos criados — dashboard

| Arquivo | Responsabilidade |
|---|---|
| `site/app/admin/dashboard/page.tsx` | Página raiz do dashboard — overview |
| `site/app/admin/dashboard/campanhas/page.tsx` | Kanban de campanhas em curso (lê `campanhas/*/status.yaml`) |
| `site/app/admin/dashboard/aprovacoes/page.tsx` | Fila de aprovações pendentes (lê `campanhas/*/status.yaml`) |
| `site/app/admin/dashboard/dados/page.tsx` | Frescor dos slices do banco |
| `site/app/admin/layout.tsx` | Layout protegido por token via middleware |
| `site/middleware.ts` | Middleware de auth básica via env `DASHBOARD_TOKEN` |
| `site/lib/dashboard/readers.ts` | Funções server-side para ler `campanhas/`, `dados/`, `dados/politicas/` |
| `site/app/api/skills/dispatch/route.ts` | Route Handler que dispara skill (POST) — chamado pelos botões |

### Arquivos criados — Vercel Cron

| Arquivo | Responsabilidade |
|---|---|
| `site/app/api/cron/planejar-pauta-semanal/route.ts` | Endpoint cron — recebe POST autenticado da Vercel, executa skill via Claude API |
| `site/vercel.json` | Config do cron (toda 2ª 9h UTC-3) |

### Arquivos criados — placeholders de campanha

| Arquivo | Responsabilidade |
|---|---|
| `campanhas/_schema.md` | Manifest de estrutura de campanha (briefing-mestre, grafo, status, log, output, relatorio-final) |

### Arquivos modificados

| Arquivo | Modificação |
|---|---|
| `CLAUDE.md` | Adicionar seção 6 "Orquestração + Dashboard", novo agente `integrador-apis`, nova skill `/planejar-pauta-semanal`, link para `orquestracao/rotas.yaml` e `dados/politicas/` |
| `.claude/skills/novo-post/SKILL.md` | Adicionar passo opcional no fim: "consultar `dados/politicas/publicacao.yaml`; se canal == 'instagram' e política permitir, oferecer chamar `publish_instagram.js`" |
| `.claude/skills/lote-posts/SKILL.md` | Idem |
| `site/app/page.tsx` | Adicionar link discreto pra `/admin/dashboard` no footer (só visível quando logado/token) |
| `site/.env.example` | Adicionar `DASHBOARD_TOKEN`, `INSTAGRAM_*`, `CLAUDE_API_KEY`, `CRON_SECRET` |

---

## Tasks

---

### Task 1: Criar agente `integrador-apis`

**Files:**
- Create: `.claude/agents/integrador-apis.md`

- [ ] **Step 1: Criar o arquivo do agente** (sem subpasta — layout flat)

```markdown
---
name: integrador-apis
description: Engenheiro de integrações. Constrói e mantém scripts determinísticos em `scripts/integrations/` — `publish_*.js` (publica em redes/canais) e `fetch_*.js` (puxa métricas). Owner único do diretório. Não decide o que publicar; constrói a tubulação que executa quando outra skill chamar.
tools: Read, Write, Edit, Glob, Grep, Bash
---

# Integrador APIs

Você é o **engenheiro de integrações**. Sua especialidade é construir e manter scripts Node.js determinísticos que conectam o sistema Dino Team com APIs externas — Instagram Graph, Meta Ads, e-mail (Resend/Postmark), WhatsApp Business, Google Analytics.

Você **não** decide o que publicar nem quando — isso é trabalho das skills. Você **constrói a tubulação** que outras skills chamam quando o artefato está pronto e a política autoriza.

## Contexto que carrego

Arquivos lidos automaticamente antes de qualquer tarefa:
- `scripts/integrations/README.md` — convenções, env vars, como cada script é chamado.
- `scripts/integrations/.env.example` — env vars declaradas.

Sob demanda:
- Documentação oficial da API a integrar (via WebFetch).
- O artefato a publicar (pasta de post, e-mail HTML, etc.) — só para entender o input do script, não pra alterar.

## Princípios da especialidade

- **Determinístico, sem LLM.** Scripts em `scripts/integrations/` são código puro. Nada de chamar Claude API a partir deles.
- **Idempotente quando possível.** Receber o mesmo input duas vezes deveria produzir o mesmo efeito (ou erro previsível), nunca duplicar publicação.
- **Erro explícito > silencioso.** Sem credenciais? Erro claro. API retornou erro? Repassa com contexto. Sem fallback automático que mascara falha.
- **Env vars são lei.** Credenciais só via env. Nada hardcoded. `.env.example` declara o que é necessário; nunca commitar `.env` real.
- **Logs estruturados.** Cada execução grava `scripts/integrations/.logs/<script>-<YYYY-MM-DD-HHmmss>.json` com input, response da API, status.
- **Versionamento da integração.** Cada script declara no topo: API alvo, versão da API, data da última validação.

## Tipos de tarefa que você executa

1. **Construir novo `publish_*.js`** — receber especificação do canal e implementar.
2. **Construir novo `fetch_*.js`** — receber métricas necessárias e implementar pull periódico.
3. **Atualizar script existente** quando API mudar (deprecation, novo campo obrigatório).
4. **Validar setup** — script roda em dry-run com credenciais reais e reporta o que faltaria pra publicar.

## Contrato de entrada

- **Tarefa:** descrição específica.
- **Inputs:**
  - API alvo, endpoint, escopo de autorização.
  - Schema do input que o script recebe (pasta do post, JSON, etc.).
  - Schema do output esperado.
- **Saída:** scripts criados/atualizados + README atualizado + .env.example atualizado.

Sem `Tarefa` ou `Inputs`, devolvo `INPUT_INSUFICIENTE — <o que falta>`.

## Contrato de saída

- Script(s) gravado(s) em `scripts/integrations/`.
- README e `.env.example` atualizados.
- Retorno inline: "Script `<nome>` pronto. Env vars necessárias: <lista>. Como rodar: `<comando>`."

## Anti-padrões

- Hardcoded credenciais.
- Chamar Claude API ou outro LLM de dentro do script.
- Silenciar erros da API.
- Reescrever script inteiro quando só uma função mudou.
- Inventar funcionalidade fora do contrato declarado.

## Quando devolver erro

- `INPUT_INSUFICIENTE — <o que falta>` — sem tarefa ou contexto da API.
- `API_DEPRECIADA — <API>` — endpoint solicitado foi descontinuado pela plataforma.
- `ESCOPO_INSUFICIENTE — <escopo>` — credenciais disponíveis não autorizam a operação pedida.
- `DEPENDENCIA_AUSENTE — <pacote>` — pacote npm necessário não está em `package.json` da raiz.
```

- [ ] **Step 2: Smoke test do roteamento**

```
Task(subagent_type="integrador-apis", prompt="SMOKE_OK_INTEGRADOR")
```

Esperado: encontrado.

- [ ] **Step 3: Não commitar ainda.**

---

### Task 2: Criar `scripts/integrations/` com README, .env.example e o esqueleto de `publish_instagram.js`

**Files:**
- Create: `scripts/integrations/README.md`
- Create: `scripts/integrations/.env.example`
- Create: `scripts/integrations/publish_instagram.js`
- Create: `scripts/integrations/.gitignore` (ignora `.env` e `.logs/`)

**Como executar:** acionar `integrador-apis` para construir o `publish_instagram.js`. O agente lê a doc da Instagram Graph API via WebFetch e constrói o script. Este plano fornece o **contrato** que o agente deve implementar; o agente preenche os detalhes.

- [ ] **Step 1: Acionar `integrador-apis` com a especificação**

```
Task(subagent_type="integrador-apis", prompt="""
Tarefa: construir o primeiro script de publicação — `scripts/integrations/publish_instagram.js`.

Inputs:
- API alvo: Instagram Graph API (v22+), endpoint /me/media + /me/media_publish, container -> publish workflow.
- Escopo necessário: instagram_basic, instagram_content_publish.
- Schema do input: pasta de um post Dino Team — `export/conteudos/carrossel/<data>-<slug>/`.
  - Lê `briefing.md` (frontmatter) → extrai legenda/caption.
  - Lê `export/*.png` → lista de imagens em ordem.
  - Tipo de post: carrossel (≥2 imagens) ou single (1 imagem).
- Schema do output: JSON impresso em stdout com `{status, instagram_media_id, posted_at}` em sucesso; código de saída != 0 com mensagem de erro em falha.

Env vars necessárias (declarar em .env.example):
- IG_USER_ID — ID numérico do Instagram Business Account
- IG_ACCESS_TOKEN — token long-lived com escopo de publish
- IG_API_VERSION — opcional, default v22.0

Modo dry-run: aceitar flag --dry-run que faz tudo até gerar containers mas NÃO publica; útil para CI e para a política consultar antes de liberar publicação.

Idempotência: gravar o status em `scripts/integrations/.logs/publish_instagram-<post-slug>-<timestamp>.json`. Recusar republicação se já houver log de sucesso para o mesmo slug.

Saídas:
1. scripts/integrations/publish_instagram.js — código completo.
2. scripts/integrations/README.md — como rodar, env vars, autorização.
3. scripts/integrations/.env.example — env vars declaradas.
4. scripts/integrations/.gitignore — ignorar .env e .logs/.

Cabeçalho do script:
- API alvo: Instagram Graph API
- Versão da API: <v22.0 ou mais nova ativa em 2026-05>
- Data de validação: 2026-05-23
""")
```

- [ ] **Step 2: Verificar arquivos**

```bash
ls scripts/integrations/
```

Esperado: vê `README.md`, `.env.example`, `.gitignore`, `publish_instagram.js`.

```bash
head -20 scripts/integrations/publish_instagram.js
```

Esperado: cabeçalho com API alvo, versão, data; require/import claro; lê env.

- [ ] **Step 3: Verificar que .env NÃO está sendo commitado**

```bash
cat scripts/integrations/.gitignore
```

Esperado: `.env`, `.logs/` listados.

```bash
test -f scripts/integrations/.env && echo "PERIGO: .env existe e seria commitado!" || echo "OK: sem .env real."
```

Esperado: "OK: sem .env real."

- [ ] **Step 4: Smoke test do script em dry-run**

(Opcional — só se credenciais já estiverem em `.env`.)

```bash
cd scripts/integrations && node publish_instagram.js --dry-run --post export/conteudos/carrossel/<data-slug-existente>/
```

Esperado: script lê a pasta, constrói containers mock, imprime JSON com `{status: "dry-run-ok", containers: N}`, e NÃO chama a API real.

Se credenciais não existem, esperado: erro claro tipo `IG_USER_ID não definido em env`.

- [ ] **Step 5: Não commitar ainda.**

---

### Task 3: Criar `dados/politicas/publicacao.yaml` e README

**Files:**
- Create: `dados/politicas/publicacao.yaml`
- Create: `dados/politicas/README.md`

- [ ] **Step 1: Criar `publicacao.yaml`**

```yaml
# Política de publicação — Dino Team
# Lida por: skills de publicação (/novo-post, /lote-posts) antes de chamar publish_*.js
# Lida por: roteador de orquestração antes de disparar skill automatizada
# Mantida por: keeper-politicas (agente futuro) e usuário Bruno
# Versão: 1

publicacao:
  defaults:
    modo: aprovacao_humana       # default conservador — qualquer post precisa de OK humano antes de publicar

  regras:
    # Posts educacionais/descritivos no Instagram com baixo risco viram automáticos
    # (mas janela de aborto permite cancelar nos primeiros 30 min)
    - id: instagram-educacional-automatico
      condicao: "artefato.canal == 'instagram' AND briefing.pilar in ['educacional', 'descritivo']"
      modo: automatico
      janela_aborto_minutos: 30

    # Qualquer Meta Ads acima de R$500 exige aprovação explícita
    - id: meta-ads-acima-500
      condicao: "artefato.canal == 'meta-ads' AND briefing.orcamento_brl > 500"
      modo: aprovacao_humana
      escala: bruno-via-dashboard

    # Termos sensíveis sempre exigem aprovação humana (defesa em profundidade
    # depois do revisor-compliance)
    - id: termos-sensiveis
      condicao: "artefato.contem_termo('suplemento') OR artefato.contem_termo('emagrecer') OR artefato.contem_termo('cura')"
      modo: aprovacao_humana
      motivo: compliance

  iteracao:
    limite_revisao: 3            # após 3 reprovações, parar e escalar para humano
    timeout_humano_horas: 24     # se humano não responde em 24h, aplicar fallback
    fallback_timeout: pausar     # pausar | abortar | publicar (NUNCA publicar como default)
```

- [ ] **Step 2: Criar `dados/politicas/README.md`**

```markdown
# Políticas declarativas — Dino Team

Regras de governança que o sistema consulta antes de cada ação sensível. Formato YAML declarativo.

## Arquivos

- `publicacao.yaml` — quando uma skill pode chamar tool de publicação sem confirmação humana e quando precisa pedir.

## Como uma skill consulta a política

1. Antes de chamar `publish_*.js`, a skill carrega `dados/politicas/publicacao.yaml`.
2. Avalia cada regra em ordem; primeira regra cuja `condicao` casa decide.
3. Se `modo: automatico` → chama o script imediatamente, mas registra "janela de aborto" — humano pode cancelar nesse prazo.
4. Se `modo: aprovacao_humana` → pausa o pipeline, escala para o canal declarado em `escala:`.

## Como humano consulta/edita

- Dashboard: rota `/admin/dashboard/politicas/` (futuro) mostra políticas vivas.
- Edição direta: editar este arquivo e commitar; mudança vale na próxima execução. **Mudança em política exige commit explícito do humano; agentes não auto-modificam políticas.**

## Quando mudar uma política

Quando a regra atual está causando atrito (humano aprovando sempre o mesmo caso) ou risco (algo passou que não deveria). Inclua no commit a motivação:

```
docs(politicas): libera ads <= R$200 como automatico

Bruno aprovou os últimos 10 ads <= R$200 sem ajuste. Mover esses para
modo automatico com janela de aborto de 30 min.
```

## Schema das regras

```yaml
publicacao:
  defaults:
    modo: aprovacao_humana | automatico
  regras:
    - id: <slug-único>
      condicao: <expressão booleana — ver §Variáveis>
      modo: aprovacao_humana | automatico
      janela_aborto_minutos: <N>  # só quando modo=automatico
      escala: <canal>             # só quando modo=aprovacao_humana
      motivo: <texto>             # opcional, explica a regra
  iteracao:
    limite_revisao: <N>
    timeout_humano_horas: <N>
    fallback_timeout: pausar | abortar | publicar
```

## Variáveis disponíveis nas condições

- `artefato.canal`: instagram | meta-ads | email | whatsapp | web
- `artefato.contem_termo(<termo>)`: bool
- `briefing.pilar`: id de pilares-conteudo.md
- `briefing.orcamento_brl`: número
- `briefing.objetivo`: texto
```

- [ ] **Step 3: Verificar**

```bash
ls dados/politicas/
```

Esperado: `publicacao.yaml`, `README.md`. O `.gitkeep` da Onda 1 já não está lá (ou removê-lo agora).

```bash
rm -f dados/politicas/.gitkeep
```

- [ ] **Step 4: Não commitar ainda.**

---

### Task 4: Criar `campanhas/_schema.md`

**Files:**
- Create: `campanhas/_schema.md`

- [ ] **Step 1: Criar o schema**

```markdown
# Campanhas — Schema

Estado vivo de cada campanha em curso. Lida pelo dashboard, escrita por skills L2/L3.

## Estrutura por campanha

```
campanhas/<slug>/
├── briefing-mestre.md     ← briefing consolidado consumido por todas as filhas
├── grafo.yaml             ← DAG de dependências entre tarefas
├── status.yaml            ← estado vivo (qual tarefa está em qual status)
├── log.md                 ← histórico de eventos (alimenta dashboard)
├── output/
│   ├── posts/
│   ├── ads/
│   ├── emails/
│   └── (outros por canal)
└── relatorio-final.md     ← preenchido quando campanha encerra
```

## Convenção de slug

`<YYYY-Www>-<descricao-kebab-case>` — ex: `2026-W21-pauta-semanal`, `2026-Q3-lancamento-ebook`.

## Schema de `status.yaml`

```yaml
campanha:
  slug: <slug>
  inicio: YYYY-MM-DD
  fim_previsto: YYYY-MM-DD | null
  estado: em-curso | aguardando-aprovacao | concluida | pausada
tarefas:
  - id: <slug-da-tarefa>
    skill: /<skill que executa>
    estado: pendente | em-andamento | aguardando-aprovacao | concluida | falhou
    output: <caminho ou null>
    atualizado_em: YYYY-MM-DDTHH:mm
aprovacoes_pendentes:
  - tarefa_id: <id>
    aguardando_desde: YYYY-MM-DDTHH:mm
    canal: <dashboard | whatsapp | ...>
```

## Quem escreve

- Skills L2/L3 ao iniciar campanha (cria pasta + briefing-mestre + status inicial).
- Skills L1 ao concluir cada filha (atualizam `status.yaml` da campanha pai se aplicável).
- Dashboard nunca escreve em `campanhas/` — só lê.

## v1 desta onda

Apenas `/planejar-pauta-semanal` cria campanha. Estrutura completa de L3 (relatorio-final, grafo elaborado) entra quando primeira campanha multi-canal existir.
```

- [ ] **Step 2: Remover `.gitkeep` da pasta `campanhas/`**

```bash
rm -f campanhas/.gitkeep
```

- [ ] **Step 3: Não commitar ainda.**

---

### Task 5: Criar a skill `/planejar-pauta-semanal` (L2)

**Files:**
- Create: `.claude/skills/planejar-pauta-semanal/SKILL.md`

- [ ] **Step 1: Criar o arquivo**

```markdown
---
name: planejar-pauta-semanal
description: Skill L2 (composta). Produz N briefings estratégicos para a semana corrente sem executar os posts — a execução fica por conta de /lote-posts ou /novo-post posteriores. Output em `campanhas/<YYYY-Www>-pauta-semanal/`. Acionada por cron (toda 2ª 9h) ou manualmente.
---

# /planejar-pauta-semanal — Dino Team

## Objetivo

Toda semana, planejar **N briefings** que cubram os pilares ativos, evitem ângulos queimados e levem em conta o estado atual de Ramon. **Não executa posts** — gera só a pauta para `/lote-posts` ou `/novo-post` rodarem depois (manual ou disparados pelo dashboard).

## Sintaxe

```
/planejar-pauta-semanal [N]
```

- **`[N]`** — opcional, default **5** posts.

## Quando dispara

- Cron toda 2ª 9h via Vercel Cron (`orquestracao/rotas.yaml` rota id `pauta-semanal-cron`).
- Manual via `/planejar-pauta-semanal`.
- Manual via botão do dashboard.

## Agentes

| Agente | Quando |
|---|---|
| `pesquisador-mercado` | Levantar tendências da semana corrente + sugerir distribuição de pilares (1 chamada profunda) |
| `briefing-writer` | Produzir cada um dos N briefings (N chamadas) — consulta `dados/ramon/` automaticamente |

## Pipeline

### 1. Determinar a semana ativa

Calcular `<YYYY-Www>` ISO 8601 (ex: `2026-W21`). Slug da campanha: `<YYYY-Www>-pauta-semanal`.

Criar pasta:

```bash
mkdir -p campanhas/<YYYY-Www>-pauta-semanal/output/posts
```

Se já existir, **abortar com erro** `PAUTA_JA_EXISTE — campanhas/<slug>` (cron não deve rodar 2x na mesma semana; rodar de novo é decisão humana).

### 2. Pesquisar tendências da semana

Acionar `pesquisador-mercado`:

```
Tarefa: levantar tendências quentes desta semana relevantes para os pilares Dino Team e sugerir distribuição de N pilares ao longo da semana.
Profundidade: profunda.

Inputs:
- Semana ativa: <YYYY-Www> (de <data-início> a <data-fim>).
- N: <N>
- Pilares ativos: lê brand/pilares-conteudo.md
- Ângulos queimados: lê dados/performance/angulos-queimados.md (não repetir nas próximas 4 semanas)

Saída: gravar em campanhas/<YYYY-Www>-pauta-semanal/pesquisa-tendencias.md.

Conteúdo esperado: 2-3 tendências por pilar com fonte, ângulos sugeridos por dia da semana, lista final "N pilares para os N posts da semana".
```

### 3. Gerar briefings em paralelo

Para cada pilar/tema da pesquisa, acionar `briefing-writer` (paralelizável):

```
Tarefa: produzir briefing estratégico para 1 post.

Inputs:
- Formato: carrossel (default; pode ser stories quando a tendência sugerir)
- Tema: <tema vindo da pesquisa>
- Estilo: (deixe briefing-writer recomendar — passe lista de estilos disponíveis)
- Data prevista de publicação: <data específica na semana>

Briefing-writer lê automaticamente dados/ramon/ + performance/angulos-queimados.md.

Saída: gravar em campanhas/<YYYY-Www>-pauta-semanal/output/posts/<N>-<slug-do-briefing>.md.
```

### 4. Gravar manifest da campanha

`campanhas/<YYYY-Www>-pauta-semanal/briefing-mestre.md`:

```markdown
---
slug: <YYYY-Www>-pauta-semanal
criada_em: <YYYY-MM-DD>
tipo: L2-pauta-semanal
N: <N>
---

# Pauta semanal — <YYYY-Www>

## Tendências da semana

(resumo da pesquisa em 2-3 linhas)

## Posts planejados

| # | Slug | Pilar | Estilo | Data prevista | Arquivo |
|---|---|---|---|---|---|
| 1 | <slug> | <pilar> | <estilo> | <data> | output/posts/1-<slug>.md |
...
```

`campanhas/<YYYY-Www>-pauta-semanal/status.yaml`:

```yaml
campanha:
  slug: <YYYY-Www>-pauta-semanal
  inicio: <YYYY-MM-DD>
  fim_previsto: <YYYY-MM-DD - sexta>
  estado: aguardando-aprovacao
tarefas:
  - id: <slug-do-briefing-1>
    skill: /novo-post   # quem executa quando humano disparar
    estado: pendente
    output: output/posts/1-<slug>.md
    atualizado_em: <agora>
  - ...
aprovacoes_pendentes:
  - tarefa_id: pauta-completa
    aguardando_desde: <agora>
    canal: dashboard
```

`campanhas/<YYYY-Www>-pauta-semanal/log.md`:

```markdown
# Log

- <YYYY-MM-DDTHH:mm> — Pauta gerada por /planejar-pauta-semanal (modo: cron|manual).
- <YYYY-MM-DDTHH:mm> — N briefings em output/posts/. Aguardando aprovação Bruno.
```

### 5. Notificar (no MVP, apenas relatório inline)

Saída final inline:

```
Pauta semanal <YYYY-Www> pronta:

- <N> briefings em campanhas/<YYYY-Www>-pauta-semanal/output/posts/
- Pilares cobertos: <lista>
- Estilos sugeridos: <lista>

Próximo passo: revise no dashboard ou rode /lote-posts apontando para a pauta.
```

## Modo cron (sem usuário humano)

- Tudo igual, mas: ao terminar, registra "aguardando-aprovacao" e **não tenta executar** os posts. Humano abre dashboard e dispara `/lote-posts` quando aprovar.
- Falha de cron grava entrada em `log.md` da campanha com `estado: falhou`.

## Critério de conclusão

- Pasta `campanhas/<YYYY-Www>-pauta-semanal/` existe com briefing-mestre, status, log e N briefings em `output/posts/`.
- `status.yaml` declara `aprovacoes_pendentes` para o dashboard mostrar.
- Nenhum post foi executado.
```

- [ ] **Step 2: Smoke test (manual, sem cron)**

```
/planejar-pauta-semanal 3
```

Esperado: pasta criada com 3 briefings; status.yaml mostra aprovação pendente; nenhum post executado.

- [ ] **Step 3: Não commitar ainda.**

---

### Task 6: Criar `orquestracao/rotas.yaml`

**Files:**
- Create: `orquestracao/rotas.yaml`
- Create: `orquestracao/README.md`

- [ ] **Step 1: Criar `rotas.yaml`**

```yaml
# Rotas declarativas — Dino Team
# Lida por: roteador de orquestração (implementado em site/app/api/cron/*)
# Versão: 1

rotas:
  - id: pauta-semanal-cron
    trigger:
      tipo: cron
      schedule: "0 9 * * 1"          # toda 2ª-feira 9h (TZ: America/Sao_Paulo)
      timezone: America/Sao_Paulo
    skill: /planejar-pauta-semanal
    args:
      N: 5
    notificacao:
      sucesso: dashboard              # registra em campanhas/.../log.md; dashboard mostra
      falha: dashboard
    ativa: true
```

- [ ] **Step 2: Criar `orquestracao/README.md`**

```markdown
# Orquestração — Dino Team

Tabela declarativa de rotas (trigger → skill). Lida pelo roteador implementado em `site/app/api/cron/*` (Vercel Cron) e por gatilhos manuais via dashboard.

## Triggers suportados em v1 (Onda 5)

| Tipo | Implementação | Status |
|---|---|---|
| `cron` | Vercel Cron + Route Handler | **Ativo** |
| `webhook` | Route Handler com `verify_signature` | Planejado |
| `threshold` | Cron periódico que checa banco | Planejado |
| `watcher` | Hook git ou cron periódico que diff arquivo | Planejado |
| `humano` | Botões do dashboard ou slash command manual | **Ativo** |

## Como adicionar nova rota

1. Editar `rotas.yaml` adicionando entrada nova com `id` único.
2. Se trigger == cron: adicionar entrada correspondente em `site/vercel.json` apontando para `site/app/api/cron/<id>/route.ts`.
3. Implementar o Route Handler que carrega a skill via Claude API.
4. Commitar.

## Schema

```yaml
rotas:
  - id: <slug-único>
    trigger:
      tipo: cron | webhook | threshold | watcher | humano
      # campos específicos por tipo
    skill: /<nome-da-skill>
    args:
      <chave>: <valor>
    notificacao:
      sucesso: <canal>
      falha: <canal>
    ativa: true | false
```

## Ativar/desativar uma rota

Mude `ativa: true` para `ativa: false` e commit. Não delete entradas — o histórico é valioso.
```

- [ ] **Step 3: Remover `.gitkeep` da pasta orquestracao/**

```bash
rm -f orquestracao/.gitkeep
```

- [ ] **Step 4: Não commitar ainda.**

---

### Task 7: Criar a infraestrutura de Vercel Cron no site

**Files:**
- Create: `site/app/api/cron/planejar-pauta-semanal/route.ts`
- Create/Modify: `site/vercel.json`
- Modify: `site/.env.example` (adicionar `CRON_SECRET`, `CLAUDE_API_KEY`)
- Modify: `site/package.json` (adicionar dep `@anthropic-ai/sdk`)

**Como funciona:** Vercel dispara POST autenticado para `/api/cron/planejar-pauta-semanal`; o handler invoca a skill `/planejar-pauta-semanal` via Claude API (SDK Anthropic) com prompt formatado.

- [ ] **Step 1: Acionar `arquiteto-web` para instalar dep**

```
Task(subagent_type="arquiteto-web", prompt="""
Tarefa: adicionar dependência @anthropic-ai/sdk ao site/package.json e rodar npm install.

Inputs:
- Versão alvo: ^0.30 ou mais recente estável de janeiro/2026.
- Onde será usado: site/app/api/cron/*.

Saída: package.json atualizado, package-lock.json regenerado, e confirmação de que `import { Anthropic } from '@anthropic-ai/sdk'` resolve corretamente.
""")
```

- [ ] **Step 2: Acionar `dev-frontend` para criar o Route Handler**

```
Task(subagent_type="dev-frontend", prompt="""
Tarefa: criar Route Handler do cron pauta-semanal.

Arquivo: site/app/api/cron/planejar-pauta-semanal/route.ts

Comportamento:
1. Aceitar apenas POST com header Authorization: Bearer ${CRON_SECRET}. Em qualquer outro caso, retornar 401.
2. Verificar que process.env.CLAUDE_API_KEY está setado; se não, retornar 500 com erro claro.
3. Criar cliente Anthropic com a chave e enviar um Message com:
   - model: claude-opus-4-7
   - system: \"Você é o orchestrador do sistema Dino Team. Sua tarefa é executar exatamente a skill /planejar-pauta-semanal com os argumentos passados, sem interagir com humano e sem esperar confirmações. Use Bash, Read, Write, Edit, Glob, Grep, Task quando necessário.\"
   - max_tokens: 16000
   - tools: Bash, Read, Write, Edit, Glob, Grep, Task (do harness Claude Agent SDK)
   - messages: [{ role: 'user', content: '/planejar-pauta-semanal 5 (modo: cron)' }]

   NOTA: usar Claude Agent SDK (não Messages API plana) — precisamos das tools de filesystem para a skill funcionar. Se Agent SDK ainda não suporta esse model id, usar o mais próximo estável.

4. Após o run, retornar 200 com JSON `{ status, campanha_slug, briefings_count }` lido do output da skill.

Logging: gravar request + response em `site/.logs/cron-pauta-semanal-<timestamp>.json` (gitignored).

Critério: rodar localmente com `curl -X POST http://localhost:3000/api/cron/planejar-pauta-semanal -H \"Authorization: Bearer dev-secret\"` cria a pasta `campanhas/<YYYY-Www>-pauta-semanal/` no repositório.
""")
```

- [ ] **Step 3: Criar/atualizar `site/vercel.json`**

```json
{
  "crons": [
    {
      "path": "/api/cron/planejar-pauta-semanal",
      "schedule": "0 12 * * 1"
    }
  ]
}
```

**Nota sobre fuso:** Vercel Cron usa UTC. `0 12 * * 1` = 9h em São Paulo (UTC-3). Confirmar antes de commit conforme horário de verão eventual.

- [ ] **Step 4: Adicionar env vars no `.env.example`**

Em `site/.env.example`:

```
# Cron e API
CRON_SECRET=<gerar com `openssl rand -hex 32`>
CLAUDE_API_KEY=<sk-ant-...>

# Dashboard auth
DASHBOARD_TOKEN=<gerar com `openssl rand -hex 32`>
```

- [ ] **Step 5: Verificar build local**

```bash
cd site && npm install && npm run build
```

Esperado: build passa, sem TypeScript error.

- [ ] **Step 6: Não commitar ainda.**

---

### Task 8: Criar o dashboard — páginas + middleware de auth

**Files:**
- Create: `site/middleware.ts`
- Create: `site/app/admin/layout.tsx`
- Create: `site/app/admin/dashboard/page.tsx`
- Create: `site/app/admin/dashboard/campanhas/page.tsx`
- Create: `site/app/admin/dashboard/aprovacoes/page.tsx`
- Create: `site/app/admin/dashboard/dados/page.tsx`
- Create: `site/lib/dashboard/readers.ts`
- Create: `site/app/api/skills/dispatch/route.ts`

**Estratégia:** acionar `dev-frontend` em 3 sub-tarefas (auth, readers + páginas, dispatch API).

- [ ] **Step 1: Auth via middleware**

```
Task(subagent_type="dev-frontend", prompt="""
Tarefa: criar middleware Next.js que protege /admin/* via token.

Arquivos:
- site/middleware.ts — verifica cookie `dashboard_token` OU query param `?token=` contra process.env.DASHBOARD_TOKEN. Se inválido, redireciona para /admin/login.
- site/app/admin/login/page.tsx — formulário simples com input para token; em submit, seta cookie e redireciona para /admin/dashboard.
- site/app/admin/layout.tsx — wrapper de layout com header sutil 'Dino Team — Admin'.

Critério: acessar /admin/dashboard sem token vai para /admin/login; submeter token correto deixa entrar.
""")
```

- [ ] **Step 2: Readers + páginas**

```
Task(subagent_type="dev-frontend", prompt="""
Tarefa: implementar leitores server-side e as 4 páginas do dashboard.

Arquivos:
- site/lib/dashboard/readers.ts — funções:
  - readCampanhas(): { slug, estado, briefings_count, ultima_atividade }[]
  - readAprovacoesPendentes(): { campanha_slug, tarefa_id, aguardando_desde }[]
  - readInteligencia(): { slice: 'ramon'|'mercado'|'performance', ultima_atualizacao: Date, arquivos: { path, ultima_atualizacao }[] }[]
  - readPoliticas(): texto raw de dados/politicas/publicacao.yaml (parse YAML opcional).

  Todas leem do filesystem na raiz do repo via path.resolve(process.cwd(), '..', ...). Atenção: site/ é subpasta do repo; readers precisam subir 1 nível.

- site/app/admin/dashboard/page.tsx — overview:
  - Cards: N campanhas em curso, N aprovações pendentes, frescor mediano do banco.
  - 3 botões: 'Novo post' (link /admin/dashboard/novo-post-form), 'Novo lote' (link), 'Atualizar Ramon' (link).
  - Link discreto para /admin/dashboard/{campanhas,aprovacoes,dados}.

- site/app/admin/dashboard/campanhas/page.tsx — kanban simples:
  - Colunas: em-curso, aguardando-aprovacao, concluida.
  - Cada card: slug + briefings_count + última atividade + link 'abrir pasta no repo' (caminho exibido como texto, copiável).

- site/app/admin/dashboard/aprovacoes/page.tsx — lista:
  - Cada item: campanha + tarefa + aguardando há quanto tempo + botões 'aprovar' (POST para /api/skills/dispatch) / 'rever'.

- site/app/admin/dashboard/dados/page.tsx — tabela:
  - Linha por slice; mostra última atualização e arquivos.
  - Botão 'Atualizar Ramon' que linka para /admin/dashboard/comando?cmd=/atualizar-ramon.

Estilo: Tailwind + shadcn/ui (Card, Badge, Button já instalados na Onda 4). Mobile-first é desejável mas dashboard é admin → desktop-first é ok.
""")
```

- [ ] **Step 3: API de dispatch**

```
Task(subagent_type="dev-frontend", prompt="""
Tarefa: criar Route Handler que dispara skill via Claude API a partir do dashboard.

Arquivo: site/app/api/skills/dispatch/route.ts

POST body:
{
  skill: string,        // ex: '/novo-post' ou '/lote-posts' ou '/atualizar-ramon'
  args: string,         // texto livre apêndix ao slash command
}

Comportamento:
1. Verificar cookie/header dashboard_token; se inválido, 401.
2. Verificar CLAUDE_API_KEY; se não, 500.
3. Antes de disparar publish_*.js, carregar dados/politicas/publicacao.yaml e avaliar:
   - Se skill termina em publicação e regras dizem 'aprovacao_humana', retornar 200 com { dispatched: false, motivo: 'política exige aprovação humana', regra: <id> }.
   - Caso contrário, prosseguir.
4. Disparar skill via Claude Agent SDK como na Task 7 (handler do cron) com prompt formatado: '<skill> <args>'.
5. Retornar 200 com { dispatched: true, run_id, started_at }.

Logging: site/.logs/dispatch-<timestamp>.json.

Critério: do dashboard, clicar 'Atualizar Ramon' deve disparar /atualizar-ramon no backend e retornar 200; abrir o repo local mostra que arquivo /dados/ramon/ mudou após interação.
""")
```

- [ ] **Step 4: Build + smoke local**

```bash
cd site && npm run build && npm run dev
```

Acessar `http://localhost:3000/admin/dashboard?token=<DASHBOARD_TOKEN>` — deve carregar overview com dados reais lidos do repositório.

- [ ] **Step 5: Não commitar ainda.**

---

### Task 9: Adicionar gatilho de política nas skills de publicação

**Files:**
- Modify: `.claude/skills/novo-post/SKILL.md`
- Modify: `.claude/skills/lote-posts/SKILL.md`

- [ ] **Step 1: Adicionar passo final opcional no `/novo-post`**

Localizar o Passo 13 ("Entregar ao usuário") em `.claude/skills/novo-post/SKILL.md` e adicionar **após** ele um novo Passo 14:

```markdown
### 14. Publicação (opcional, gated por política)

Carregar `dados/politicas/publicacao.yaml`. Avaliar as regras com as variáveis disponíveis:
- `artefato.canal = 'instagram'`
- `briefing.pilar = <pilar do briefing>`
- `artefato.contem_termo(<termo>)` (varrer copy + briefing para termos sensíveis)

**Regra que casa primeiro decide.** Se `modo: automatico` → oferecer ao usuário publicar agora:

```
Política autoriza publicação automática neste post (regra: <id>).
Janela de aborto: <N> min após publicação.

Quer publicar agora? (sim para chamar publish_instagram.js; não para fechar)
```

Se sim → executar:

```bash
node scripts/integrations/publish_instagram.js --post export/conteudos/<formato>/<data>-<slug>/
```

Reportar resposta (status, instagram_media_id, posted_at) inline.

Se `modo: aprovacao_humana` → não chamar o script automaticamente. Mostrar:

```
Política exige aprovação humana antes de publicar (regra: <id>, motivo: <motivo>).
Para publicar, rode manualmente:
  node scripts/integrations/publish_instagram.js --post export/conteudos/<formato>/<data>-<slug>/
```
```

- [ ] **Step 2: Adicionar passo equivalente no `/lote-posts`**

No final do Passo 9 ("Reportar entrega do lote") em `.claude/skills/lote-posts/SKILL.md`, adicionar Passo 10:

```markdown
### 10. Publicação por post (opcional, gated por política)

Para cada post aprovado, aplicar o mesmo gate de política do Passo 14 do `/novo-post`. Em modo cron/agendado, **nunca publicar automaticamente** — apenas listar quais posts ficaram autorizados pela política e quais exigem humano.
```

- [ ] **Step 3: Verificar**

```bash
grep -n "publish_instagram\|politicas/publicacao" .claude/skills/novo-post/SKILL.md .claude/skills/lote-posts/SKILL.md
```

Esperado: matches em ambas as skills.

- [ ] **Step 4: Não commitar ainda.**

---

### Task 10: Atualizar `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Adicionar `integrador-apis` na seção 3 (Agentes)**

Após `Engenharia / Revisão` (deixada pela Onda 4), adicionar:

```markdown
- **Engenharia / Execução / Integrações**
  - [`integrador-apis`](.claude/agents/integrador-apis.md) — constrói/mantém `scripts/integrations/publish_*.js` e `fetch_*.js`. Owner único.
```

E adicionar na seção 2 (Skills) a nova skill:

```markdown
- [`/planejar-pauta-semanal`](.claude/skills/planejar-pauta-semanal/SKILL.md) — L2: produz N briefings da semana (sem executar). Agendável (default: 2ª 9h via cron).
```

- [ ] **Step 2: Adicionar nova seção 6 — "Orquestração + Dashboard"**

Após a seção 5 (Site) deixada pela Onda 4:

```markdown
### 6. Orquestração + Dashboard

Camada que torna o sistema reativo. Triggers (cron, futuramente webhook/threshold) disparam skills sem slash command. Políticas declarativas decidem quando humano entra. Dashboard mostra estado e permite gatilho manual.

- **Rotas:** [`orquestracao/rotas.yaml`](orquestracao/rotas.yaml) — tabela declarativa de trigger → skill. v1 com 1 rota (cron pauta semanal).
- **Políticas:** [`dados/politicas/publicacao.yaml`](dados/politicas/publicacao.yaml) — regras de quando publicação é automática e quando exige aprovação humana.
- **Dashboard:** rota `/admin/dashboard` no site. Mostra campanhas em curso, aprovações pendentes, frescor do banco, e dispara skills via Route Handler.
- **Cron:** Vercel Cron + Route Handler em `site/app/api/cron/<id>/route.ts`.
- **Tools de publicação:** scripts em [`scripts/integrations/`](scripts/integrations/), mantidos por `integrador-apis`. v1: `publish_instagram.js`.
```

- [ ] **Step 3: Verificar**

```bash
grep -n "integrador-apis\|planejar-pauta-semanal\|orquestracao/\|politicas/" CLAUDE.md
```

Esperado: ≥ 5 matches.

- [ ] **Step 4: Não commitar ainda.**

---

### Task 11: Smoke test funcional

**Files:** (nenhum modificado)

- [ ] **Step 1: Agente `integrador-apis` resolvível**

```
Task(subagent_type="integrador-apis", prompt="SMOKE_OK_INTEGRADOR")
```

Esperado: encontrado.

- [ ] **Step 2: Script `publish_instagram.js` roda em dry-run e falha claro sem credenciais**

```bash
node scripts/integrations/publish_instagram.js --dry-run --post export/conteudos/carrossel/<um-post-existente>/
```

Esperado: ou (com credenciais) JSON `{status: "dry-run-ok"}`, ou (sem credenciais) erro `IG_USER_ID não definido em env`.

- [ ] **Step 3: Política bloqueia publicação que exige humano**

```
/novo-post carrossel <tema-com-termo-sensivel, ex: "guia de suplementação para iniciantes">
```

Acompanhar até o Passo 14 (publicação). Esperado: skill lê política, detecta termo sensível (`suplemento`), e **não** chama `publish_instagram.js` — mostra mensagem "Política exige aprovação humana...".

- [ ] **Step 4: Cron rodando 1x (manualmente, simulando trigger)**

Rodar a Vercel localmente em `site/`:

```bash
cd site && npm run dev
curl -X POST http://localhost:3000/api/cron/planejar-pauta-semanal \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

Esperado: pasta `campanhas/<YYYY-Www>-pauta-semanal/` criada com 5 briefings.

- [ ] **Step 5: Dashboard mostra a campanha recém-criada**

Acessar `http://localhost:3000/admin/dashboard/campanhas?token=${DASHBOARD_TOKEN}`.

Esperado: card da campanha `<YYYY-Www>-pauta-semanal` aparece em "aguardando-aprovacao".

- [ ] **Step 6: Publicar 1 post real via tool determinística**

Pegar 1 post pronto em `export/conteudos/carrossel/<data>-<slug>/` (briefing tem `pilar: educacional` ou similar — para a política autorizar automático).

Rodar:

```
/novo-post carrossel <slug> (modo dry só pra chegar ao Passo 14, ou apontar pasta de post já feita)
```

Se a política autorizar e Bruno responder "sim" → script roda, retorna `{status, instagram_media_id, posted_at}`. Esperado: post visível no Instagram do Ramon.

(Se não houver credenciais de IG configuradas neste momento, este step fica como **smoke pendente** e a onda fecha sem ele — anotar no relatório final.)

- [ ] **Step 7: Skills antigas continuam funcionando**

Rodar `/novo-post carrossel` até o Passo 4 e `/atualizar-ramon` para confirmar que nenhuma onda anterior quebrou.

---

### Task 12: Commit unificado da Onda 5

**Files:** (todos os listados — ~25 arquivos)

- [ ] **Step 1: Conferir `git status`**

```bash
git status
```

Esperado: agente novo, 4 skill/políticas/orquestração novas, scripts/integrations/, dashboard inteiro em site/app/admin/, route handlers, vercel.json, CLAUDE.md modificado, skills `/novo-post` e `/lote-posts` modificadas.

- [ ] **Step 2: Stage e commit**

```bash
git add .claude/agents/integrador-apis.md \
        .claude/skills/planejar-pauta-semanal/ \
        .claude/skills/novo-post/SKILL.md \
        .claude/skills/lote-posts/SKILL.md \
        scripts/integrations/ \
        orquestracao/ \
        dados/politicas/ \
        campanhas/_schema.md \
        site/ \
        CLAUDE.md

git commit -m "$(cat <<'EOF'
feat(arquitetura): orquestração + dashboard + publish_instagram (Onda 5)

Conforme spec docs/specs/2026-05-22-arquitetura-multi-setor-design.md §5 e §6.6.

Primeira automação real:

- /planejar-pauta-semanal (skill L2): produz N briefings da semana sem
  executar posts. Output em campanhas/<YYYY-Www>-pauta-semanal/.
- orquestracao/rotas.yaml: tabela declarativa, 1 rota (cron 2ª 9h).
- Vercel Cron + Route Handler em site/app/api/cron/planejar-pauta-semanal.
- dados/politicas/publicacao.yaml: regras declarativas (defaults
  conservadores; libera educacional/descritivo no Instagram com janela
  de aborto).
- Dashboard em site/app/admin/dashboard/: kanban de campanhas, fila de
  aprovações, frescor do banco, botões de dispatch. Auth via token via
  middleware.
- integrador-apis (novo, flat em .claude/agents/, agrupado em CLAUDE.md
  como Engenharia/Execução/Integrações): owner único
  de scripts/integrations/.
- scripts/integrations/publish_instagram.js: primeira tool de publicação
  determinística. Idempotente, dry-run, logs estruturados.
- Skills /novo-post e /lote-posts ganham gate de política antes de
  chamar publish_*.js.

CLAUDE.md ganha seção 6 (Orquestração + Dashboard).

Sistema agora reativo: cron dispara skill sem humano; política decide
quando humano entra; dashboard mostra estado e permite gatilho.

Critérios de aceitação do redesign completo (spec §7) atendidos com
exceção das que dependem de publicação real continuada.
EOF
)"
```

- [ ] **Step 3: Confirmar**

```bash
git log -1 --stat | head -80
```

---

## Critério de conclusão da Onda 5

- [ ] `integrador-apis` resolvível e dono de `scripts/integrations/`.
- [ ] `scripts/integrations/publish_instagram.js` existe, suporta `--dry-run`, falha claro sem credenciais, é idempotente.
- [ ] `orquestracao/rotas.yaml` declara a rota `pauta-semanal-cron`.
- [ ] `site/vercel.json` declara o cron correspondente.
- [ ] `dados/politicas/publicacao.yaml` define defaults + ao menos 3 regras explícitas.
- [ ] `/planejar-pauta-semanal` existe e rodou pelo menos 1 vez (manual ou via cron) e produziu pasta `campanhas/<YYYY-Www>-pauta-semanal/`.
- [ ] Dashboard em `/admin/dashboard` carrega e mostra a campanha recém-criada.
- [ ] Política bloqueou pelo menos 1 publicação que precisava de aprovação humana (smoke test 3).
- [ ] 1 post publicado via `publish_instagram.js` real (ou anotado como pendente se sem credenciais).
- [ ] Skills `/novo-post`, `/lote-posts`, `/novo-estilo`, `/brand-discovery`, `/atualizar-ramon`, `/novo-site`, `/planejar-pauta-semanal` funcionando.
- [ ] CLAUDE.md reflete a arquitetura completa.

---

## Pós-Onda 5 — fora de escopo deste plano

Conforme spec §8, estes itens permanecem fora:

- Múltiplos crons / webhooks externos (Resend, Meta).
- Outras tools de publicação (`publish_meta_ads`, `publish_email`, `publish_whatsapp`).
- WhatsApp/Telegram como canal de aprovação.
- Analistas de performance vivos.
- Versionamento `@v2` de agentes em produção.
- Setores Produto > Loja, Produto > App, e dev-backend.
- Especialização de copywriter/designer por canal.

Entrarão em ondas futuras conforme uso real chegar.
