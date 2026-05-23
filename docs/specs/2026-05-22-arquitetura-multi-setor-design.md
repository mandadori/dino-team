# Arquitetura Multi-Setor — Design Doc

**Data:** 2026-05-22
**Status:** Spec aprovada — pronta para virar plano de implementação
**Escopo:** Redesenho da arquitetura completa do sistema de agentes e skills da Dino Team — de plano flat (6 agentes + 4 skills) para sistema multi-setor com hierarquia, banco de inteligência, orquestração e dashboard

---

## 1. Visão geral

### 1.1 Problema

A arquitetura atual (6 agentes flat + 4 skills monolíticas) funciona para produção de posts isolados, mas não escala para:

- Operar múltiplos setores (Marketing, Produto, Engenharia) com fluxos coordenados
- Reter aprendizado entre execuções (cada post é um evento isolado, sem memória cumulativa)
- Suportar automação contínua (todas as skills são interativas, exigem confirmação humana)
- Manter coerência editorial em campanhas multi-canal (post + e-mail + ad + página)
- Gerir tokens com eficiência (cada agente lê o brand book inteiro mesmo quando não precisa)

### 1.2 Visão

Sistema operacional de marca completo, organizado em **3 camadas verticais** + **camada de orquestração**:

- **Transversais** (Brand, Inteligência, Plataforma & Ops) servem todos os setores
- **Setores produtivos** (Marketing, Produto, Engenharia) com 4 papéis funcionais uniformes
- **Orquestração** (Skills L1/L2/L3, Roteador de eventos, Políticas, Dashboard) que torna o sistema reativo

O sistema é desenhado para crescer de uso interativo (slash command) para automação 100% (cron, webhook, threshold).

### 1.3 Princípios condutores

| # | Princípio | Implicação |
|---|---|---|
| 1 | Setor é vertical, função é horizontal | Toda execução vive num setor; os 4 papéis (P/E/E/R) são padronizados entre setores |
| 2 | Transversais NUNCA viram filho de setor | Brand, Inteligência, Engenharia(*), Plataforma servem todos |
| 3 | Skill conhece a árvore. Agente conhece só sua função | Skill orquestra; agente recebe contrato isolado de I/O |
| 4 | Contexto destilado, não histórico inteiro | Skill destila briefing e passa só o que o agente precisa; redução estimada de 40-60% em tokens por pipeline |
| 5 | L1 → L2 → L3: composição, não duplicação | Campanha multi-setor (L3) reusa skills atômicas (L1); pesquisa compartilhada via banco |
| 6 | Banco de Inteligência é fonte da verdade compartilhada | Pesquisa, contexto-Ramon e performance vivem no banco; setores consultam, não recriam |
| 7 | Políticas substituem aprovações ad-hoc | Em vez de "pausa para humano em cada passo", regra declarada decide quando humano entra |
| 8 | Dashboard é leitor + gatilho, não controlador (no MVP) | Mostra estado e dispara skills via link; lógica vive nas skills |
| 9 | Versionamento de agente é obrigatório quando entrar em produção contínua | `copywriter@v2` em vez de sobrescrever; permite rollback e A/B |
| 10 | Convenção de nome rígida | Sempre `<função>-<contexto>`: `pesquisador-mercado`, `revisor-brand`, etc. Nunca verbo. Nunca cargo. |

*(Engenharia é setor produtivo na arquitetura final — mantém também característica de servir múltiplos setores; ver §2.2.)*

### 1.4 YAGNI rigoroso

Cada agente, skill, slice de banco, dependência externa só é criado quando o uso real chega. O desenho prevê escala, mas a Onda 1 não implementa nada que a Onda 5 vai usar.

---

## 2. Arquitetura geral

### 2.1 As 4 camadas

```
╔══════════════════════════════════════════════════════════════════════╗
║                  CAMADA 1 — TRANSVERSAIS                             ║
║  servem TODOS os setores. agentes próprios + bancos próprios.        ║
║                                                                      ║
║  ┌──────────┐  ┌──────────────┐  ┌──────────────┐                    ║
║  │  Brand   │  │ Inteligência │  │ Plataforma   │                    ║
║  │          │  │              │  │ & Operações  │                    ║
║  │ guardião │  │ banco vivo:  │  │              │                    ║
║  │ editorial│  │ Ramon,       │  │ mantém o     │                    ║
║  │ + visual │  │ Mercado,     │  │ sistema:     │                    ║
║  │          │  │ Performance  │  │ agentes,     │                    ║
║  │ revisor- │  │              │  │ skills,      │                    ║
║  │ brand    │  │ archivist-   │  │ schema,      │                    ║
║  │ revisor- │  │ ramon        │  │ políticas,   │                    ║
║  │ compli-  │  │              │  │ dashboard    │                    ║
║  │ ance     │  │              │  │              │                    ║
║  └──────────┘  └──────────────┘  └──────────────┘                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                  CAMADA 2 — SETORES PRODUTIVOS                       ║
║  cada setor tem seus 4 papéis funcionais internos                    ║
║                                                                      ║
║  ┌────────────┐  ┌──────────────────┐  ┌────────────────────────┐    ║
║  │ Marketing  │  │     Produto      │  │     Engenharia         │    ║
║  │            │  │                  │  │                        │    ║
║  │ Pesquisa   │  │  Consultoria     │  │ Pesquisa               │    ║
║  │ Estratégia │  │   (inclui        │  │ Estratégia             │    ║
║  │ Execução   │  │    Comunidade)   │  │ Execução               │    ║
║  │ Revisão    │  │  Loja (futuro)   │  │   Web / Mobile /       │    ║
║  │            │  │  E-books (fut.)  │  │   Backend / Integ.     │    ║
║  │            │  │  App (futuro)    │  │ Revisão                │    ║
║  └────────────┘  └──────────────────┘  └────────────────────────┘    ║
╠══════════════════════════════════════════════════════════════════════╣
║                  CAMADA 3 — ORQUESTRAÇÃO                             ║
║                                                                      ║
║  Skills L1/L2/L3      Roteador de eventos      Políticas             ║
║                                                                      ║
║                       Dashboard (web)                                ║
╚══════════════════════════════════════════════════════════════════════╝
```

### 2.2 Engenharia: setor produtivo com função transversal

Engenharia é tratada como **setor produtivo** (3º setor, ao lado de Marketing e Produto) porque:

- Tem **roadmap próprio** (refatorações, migrações, escolha de stack)
- Tem **sub-disciplinas distintas** (Web, Mobile, Backend, Integrações) — cada uma com vocabulário e stack próprios
- Tem **decisões autônomas** (não são sempre demanda de outro setor)

**Mas** mantém característica de servir Marketing (web/landing) e Produto (loja, app, área de membros) — outras skills podem acionar agentes de Engenharia como executores.

### 2.3 Plataforma & Ops permanece transversal

Plataforma & Ops mantém o **sistema de agentes em si** (agentes, skills, schema do banco, dashboard). Não tem produto comercial — sua "saída" é o próprio sistema rodando. Por isso permanece transversal.

### 2.4 Composição dos setores produtivos

#### 2.4.1 Marketing

```
Marketing
├── Pesquisa
│   ├── pesquisador-mercado
│   ├── analista-performance-social-media
│   ├── analista-performance-ads
│   ├── analista-performance-email
│   └── analista-funil-site
├── Estratégia
│   ├── briefing-writer
│   ├── planejador-pauta
│   ├── planejador-ads
│   ├── planejador-email
│   ├── planejador-pagina-web
│   ├── planejador-cronograma
│   └── gestor-seo
├── Execução
│   ├── Social Media       (copywriter, designer + tool: publish_instagram)
│   ├── Criativos Pagos    (copywriter modo ad, designer modo ad + tool: publish_meta_ads)
│   ├── E-mail             (copywriter modo email, designer-web modo email + tool: publish_email)
│   └── Web                (copywriter modo web; Engenharia constrói)
└── Revisão
    └── revisor-coerencia
       (Brand revisa transversalmente — ver §3.1)
```

**Nota:** copywriter e designer são **únicos**, com parâmetro `modo` (social-media | ad | email | web). Especialização por agente é diferida até a fronteira ficar irreconciliável.

#### 2.4.2 Produto

```
Produto
├── Consultoria (inclui Comunidade)
│   ├── Pesquisa     (analista-aluno, analista-retencao, analista-comunidade)
│   ├── Estratégia   (planejador-protocolo, planejador-pauta-comunidade)
│   ├── Execução     (treinador, nutricionista, executor-anamnese,
│   │                 executor-check-shape, atendente-aluno,
│   │                 community-mgr + tool: publish_whatsapp)
│   └── Revisão      (revisor-protocolo)
├── Loja             (futuro — e-commerce de produtos físicos/digitais)
├── E-books          (futuro — produtos digitais)
└── App              (futuro)
```

**Comunidade** (grupo WhatsApp dos alunos) é absorvida em Consultoria, pois é benefício do produto Consultoria e sua operação editorial é resolvida transversalmente por Brand.

#### 2.4.3 Engenharia

```
Engenharia
├── Pesquisa      (avaliador-tech, pesquisador-libs)
├── Estratégia    (arquiteto-sistema, planejador-roadmap-tecnico,
│                  designer-de-banco)
├── Execução
│   ├── Web          (arquiteto-web, dev-frontend, dev-fullstack)
│   ├── Mobile       (dev-mobile, designer-mobile)        ← futuro
│   ├── Backend      (dev-backend, dev-banco)             ← fase 3+
│   └── Integrações  (integrador-apis — constrói/mantém scripts publish_*.js e fetch_*.js)
└── Revisão       (curador-web, curador-mobile, curador-banco)
```

### 2.5 Publicadores são tools, não agentes

Decisão arquitetural: **publicação é ação determinística, não exige LLM.** Por isso:

- Não existem agentes `publicador-instagram`, `publicador-meta-ads`, etc.
- Existem **scripts** em `scripts/integrations/`: `publish_instagram.js`, `publish_meta_ads.js`, `publish_email.js`, `publish_whatsapp.js`
- Skills L1 invocam os scripts via Bash quando o artefato está pronto e aprovado
- Quem constrói/mantém os scripts é o agente `integrador-apis` (em Engenharia/Execução/Integrações)
- Mesma lógica vale para tools de fetch: `fetch_ga4.js`, `fetch_meta_insights.js`, `fetch_instagram_insights.js`

**Benefícios:** redução drástica em tokens por publicação, confiabilidade determinística, testes unitários possíveis.

---

## 3. Os 4 papéis funcionais

Os papéis são **tipos abstratos** que cada setor instancia com seus próprios agentes especialistas. Definição uniforme entre setores.

### 3.1 Fluxo canônico dentro de um setor

```
                 ┌─────────────────────────────────────┐
                 │     Banco de Inteligência           │
                 │  (Ramon, Mercado, Performance)      │
                 └────┬───────────────────────┬────────┘
                      │ LÊ                    │ ESCREVE
                      ▼                       │
        ┌────────────────────────┐            │
        │      PESQUISA          │────────────┘
        └───────────┬────────────┘
                    │ briefing-input
                    ▼
        ┌────────────────────────┐
        │     ESTRATÉGIA         │
        └───────────┬────────────┘
                    │ briefing canônico
                    ▼
        ┌────────────────────────┐
        │     EXECUÇÃO           │
        └───────────┬────────────┘
                    │ artefato
                    ▼
        ┌────────────────────────┐    ┌────────────┐
        │      REVISÃO           │◄───│   BRAND    │ (transversal)
        └───────────┬────────────┘    └────────────┘
                    │
            ┌───────┴────────┐
        APROVADO         REPROVADO
            │                │
            ▼                ▼
       publicação       volta para Execução (ou Estratégia, se erro de premissa)
```

### 3.2 Definição resumida dos 4 papéis

| Papel | Pergunta que responde | Output | Acesso ao banco |
|---|---|---|---|
| **Pesquisa** | "O que existe no mundo / no banco que importa?" | Matéria-prima estruturada | Lê todos os slices; escreve no slice de sua especialidade |
| **Estratégia** | "Dado o que existe, o que vamos fazer?" | Briefing canônico executável | Lê via Pesquisa; não escreve |
| **Execução** | "Como produzir o entregável conforme o briefing?" | Artefato pronto | Lê quando precisa de referência; não escreve |
| **Revisão** | "Está dentro dos padrões?" | Parecer com status | Lê padrões e histórico; não escreve diretamente (pareceres podem disparar escrita por Pesquisa) |

### 3.3 Briefing canônico

Schema padronizado entre setores. Permite que a mesma Execução atue em qualquer setor lendo o mesmo formato de entrada.

```yaml
slug: "<kebab-case-2-5-palavras>"
formato: "<...>"
canal: "<...>"
objetivo: "1 frase específica"
publico_recorte: "1-2 frases"
angulo_central: "1-2 frases"
pilar: "<id do pilar>"
por_que_este_recorte: "2-3 linhas ligando ângulo + pilar + público + canal"
sinalizacoes_execucao:
  - pesquisa: "<o que enfatizar>"
  - tom: "<modulação específica do tom>"
  - tabu: "<o que NÃO pode aparecer>"
dependencias_artefato:    # opcional
  - "URL da página de vendas X"
prazo: "<YYYY-MM-DD | imediato>"
```

### 3.4 Convenção de pastas

```
.claude/agents/
├── marketing/
│   ├── pesquisa/
│   ├── estrategia/
│   ├── execucao/
│   └── revisao/
├── produto/
│   └── consultoria/
│       ├── pesquisa/
│       ├── estrategia/
│       ├── execucao/
│       └── revisao/
├── engenharia/
│   ├── pesquisa/
│   ├── estrategia/
│   ├── execucao/
│   │   ├── web/
│   │   ├── backend/
│   │   └── integracoes/
│   └── revisao/
└── transversais/
    ├── brand/
    ├── inteligencia/
    └── plataforma/
```

### 3.5 Princípio de contexto destilado

A skill é a **única que conhece a árvore completa**. Cada agente recebe **só o destilado** do que precisa:

- Pesquisa recebe tema + recorte (não recebe briefing futuro nem revisão futura)
- Estratégia recebe pesquisa + contexto canal (não recebe outras pesquisas paralelas)
- Execução recebe briefing + estilo + regras (não recebe pesquisa bruta nem objetivo da skill)
- Revisão recebe artefato + briefing + critérios (não recebe pesquisa)

**Ganho estimado:** 40-60% de redução de tokens em pipelines típicos.

---

## 4. Camadas transversais

### 4.1 Brand

**Função:** zelar pela coerência de marca em TODO artefato, independente de setor ou canal.

**Princípio operacional:** Brand é **bloqueante**. Nenhum artefato vai pra publicação sem aprovação de Brand.

**Composição:**

```
transversais/brand/
├── revisor-brand          (identidade visual + tom de voz + pilares)
├── revisor-compliance     (promessas proibidas, claims sobre saúde, jurídico, off-limits)
└── keeper-brand-book      (mantém arquivos em brand/ atualizados)
```

**Revisão em 2 camadas, sequenciais:**

```
artefato pronto (Execução)
     ↓
revisor-coerencia (do setor)        ← coerência interna
     ↓
revisor-brand (transversal)         ← identidade declarada
     ↓
revisor-compliance (transversal)    ← compliance
     ↓
PUBLICÁVEL
```

Revisor local pode aprovar com ajustes; brand e compliance só fazem **APROVADO ou REPROVADO**.

### 4.2 Inteligência

**A camada mais importante.** É o que diferencia "agentes que produzem coisas isoladas" de "sistema que aprende".

**Função:** ser a **memória persistente compartilhada** entre todos os setores.

#### 4.2.1 Estrutura — 3 slices

```
inteligencia/
├── _schema.md                  ← manifest do banco
├── ramon/                       ← contexto temporal/espacial do Ramon
│   ├── cronograma.md
│   ├── fase-atual.md
│   ├── acervo-visual.md
│   ├── falas-citacoes.md
│   ├── historico-conquistas.md
│   └── principios-treino.md
├── mercado/
│   ├── tendencias/<YYYY-MM>.md
│   ├── concorrentes/<slug>.md
│   ├── vocabulario-publico.md
│   └── hashtags-performando.md
└── performance/
    ├── social-media/<YYYY-MM>.md
    ├── ads/<YYYY-MM>.md
    ├── email/<YYYY-MM>.md
    ├── funil-site/<YYYY-MM>.md
    ├── angulos-queimados.md
    └── padroes-identificados.md
```

#### 4.2.2 Formato técnico

**Decisão arquitetural:** começar com **arquivos markdown + frontmatter YAML**, não SQL.

| Vantagens markdown | Quando migrar para SQL |
|---|---|
| Versionado nativamente no git | Volume passar de ~100MB |
| LLM lê e escreve com naturalidade | Queries complexas (joins, agregações) |
| Editável manualmente | Queries em <1s para dashboard |
| Zero infra extra | Concurrency real |

#### 4.2.3 Ownership único por slice

| Slice | Owner único |
|---|---|
| `ramon/*` | `archivist-ramon` |
| `mercado/tendencias/*` e `mercado/concorrentes/*` | `pesquisador-mercado` |
| `performance/social-media/*` | `analista-performance-social-media` |
| `performance/ads/*` | `analista-performance-ads` |
| `performance/email/*` | `analista-performance-email` |
| `performance/funil-site/*` | `analista-funil-site` |
| `performance/angulos-queimados.md` | `revisor-coerencia` |
| `performance/padroes-identificados.md` | cooperativo (vários analistas) |

**Leitura:** qualquer agente, qualquer slice.
**Escrita:** apenas owner do slice; outros propõem via output e o owner consolida.

#### 4.2.4 Schema versionado

`inteligencia/_schema.md` declara slices, owners, versão. Migrações são responsabilidade de `keeper-banco`.

### 4.3 Plataforma & Ops

**Função:** garantir que o sistema continua funcionando, sem virar bagunça com o tempo.

**Composição:**

```
transversais/plataforma/
├── keeper-agentes        ← cria, edita, versiona agentes
├── keeper-skills         ← cria, edita, versiona skills
├── keeper-banco          ← migra schema do banco
├── keeper-politicas      ← mantém docs/politicas/ atualizado
└── keeper-dashboard      ← mantém site/dashboard
```

**Particularidade:** é o **único lugar** onde agentes editam outros agentes. Mitigações:

- Mudanças em agentes em produção exigem aprovação humana
- Toda edição é commit isolado em git (rollback trivial)
- Existe `politica/auto-modificacao.md` declarando o que keepers podem e não podem fazer sozinhos

---

## 5. Camada de orquestração

### 5.1 Skills em 3 níveis

| Nível | Escopo | Exemplos |
|---|---|---|
| **L1 — atômica** | 1 entregável em 1 setor | `/novo-post`, `/novo-email`, `/novo-ad`, `/nova-pagina-vendas`, `/novo-ebook` |
| **L2 — composta** | N entregáveis em 1 setor | `/lote-posts`, `/sequencia-emails`, `/serie-ads-ab` |
| **L3 — campanha** | Entregáveis em N setores | `/campanha-lancamento`, `/campanha-pre-venda`, `/campanha-reativacao` |

**Composição:** L3 chama L1 e L2; L2 chama L1; L1 chama agentes. Nenhum nível duplica trabalho — pesquisa compartilhada via banco.

**Estado de campanha (L3):**

```
campanhas/<slug>/
├── briefing.md           ← briefing-mestre, consumido por todas as filhas
├── grafo.yaml            ← DAG de dependências
├── status.yaml           ← estado vivo
├── log.md                ← histórico (alimenta dashboard)
├── output/
│   ├── ebook/
│   ├── pagina/
│   ├── posts/
│   ├── ads/
│   └── emails/
└── relatorio-final.md
```

### 5.2 Roteador de eventos

**Tipos de trigger:**

| Trigger | Origem | Exemplo |
|---|---|---|
| **Cron** | Tempo agendado | Toda 2ª 9h → `/planejar-pauta-semanal` |
| **Webhook** | Sistema externo | Resend POST → atualiza `performance/email` |
| **Threshold** | Métrica no banco passa de X | Engajamento cai >20% → `/investigar-queda` |
| **Watcher** | Arquivo mudou | `brand/` mudou → `/auditoria-sistema` |
| **Humano** | Slash command / link dashboard | `/novo-post carrossel` |

**Configuração em `orquestracao/rotas.yaml`** — formato declarativo.

**Implementação técnica:**
- Cron via GitHub Actions ou Vercel Cron
- Webhook via Next.js Route Handler em `site/`
- Threshold/Watcher via cron periódico que checa condições

### 5.3 Políticas

**Função:** declarar regras de governança que o sistema consulta antes de cada ação sensível.

**Formato:** YAML declarativo em `docs/politicas/`.

**Exemplo (`publicacao.yaml`):**

```yaml
publicacao:
  defaults:
    modo: aprovacao_humana            # conservador é o default

  regras:
    - condicao: "artefato.canal == 'instagram' AND briefing.pilar in ['educacional', 'descritivo']"
      modo: automatico
      janela_aborto: 30min

    - condicao: "artefato.canal == 'meta-ads' AND briefing.orcamento_brl > 500"
      modo: aprovacao_humana
      escala: para Bruno via dashboard + WhatsApp

    - condicao: "artefato.contem_termo('suplemento') OR artefato.contem_termo('emagrecer')"
      modo: aprovacao_humana
      motivo: compliance

  iteracao:
    limite_revisao: 3
    timeout_humano: 24h
    fallback_timeout: pausar          # opções: pausar | abortar | publicar
```

**Quem consulta:** skills antes de chamar tool de publicação; roteador antes de disparar skill; dashboard exibe estado.

**Owner:** `keeper-politicas` (Plataforma & Ops). Mudança exige humano.

### 5.4 Dashboard

**Filosofia no MVP:** leitor + gatilho, não controlador.

**O que mostra:**

1. **Campanhas em curso** (kanban — lê `campanhas/*/status.yaml`)
2. **Aprovações pendentes** (lê fila de aprovações)
3. **Inteligência — frescor** (timestamps por slice)
4. **Performance — últimos 30 dias** (gráficos a partir do banco)
5. **Ações rápidas** (botões para disparar skills L1/L2/L3)

**Stack:**
- Mesma stack do site (Next.js + Tailwind + shadcn)
- Mora em `site/app/admin/dashboard/`
- Lê estado direto dos arquivos
- Gatilho de skill via webhook → roteador → SDK do Claude

**Acesso:**
- MVP: link público com token rotativo
- Evolução: Supabase Auth quando entrar mais gente

**Multi-canal (WhatsApp/Telegram):**
- Não é dashboard paralelo — é canal de notificação + ação simples (aprovar/rejeitar/abrir link)
- Implementação: mesmas tools de Consultoria (`publish_whatsapp`)
- Entra após dashboard web estar maduro

---

## 6. Plano de migração — 5 ondas

### 6.1 Princípios da migração

1. Incremental, nunca big-bang
2. Mover antes de melhorar (refatoração não-comportamental antes de mudança de comportamento)
3. YAGNI rigoroso
4. Skills atuais continuam funcionando entre ondas
5. Brand book é eixo intocado
6. Specs aprovadas viram alvo, não bagagem (incorporar `site-mvp`, `otimizacoes-skills-post`, `estilo-autocontido`)

### 6.2 Onda 1 — Reorganização estrutural

**Objetivo:** colocar agentes e skills atuais na nova convenção de pastas, sem mudar comportamento.

**Entra:**
- Criar estrutura `agents/{marketing,produto,engenharia,transversais}/` com sub-pastas dos 4 papéis
- Mover (não editar) os 6 agentes:
  - `copywriter.md` → `agents/marketing/execucao/`
  - `designer.md` → `agents/marketing/execucao/`
  - `curador-export.md` → `agents/marketing/revisao/`
  - `diretor-marca.md` → `agents/transversais/brand/` (provisório, será quebrado na Onda 2)
  - `pesquisa-tendencias.md` → `agents/marketing/pesquisa/` (renomeação na Onda 3)
  - `treinador.md` → `agents/produto/consultoria/execucao/`
- Atualizar paths nas 4 skills (sem mudar lógica)
- Criar pastas vazias com `.gitkeep`: `inteligencia/`, `campanhas/`, `orquestracao/`, `docs/politicas/`
- Atualizar `CLAUDE.md` refletindo nova organização

**Critério de conclusão:**
- 4 skills rodam sem erro de path
- `tree .claude/agents/` mostra estrutura por setor/papel
- Commit único: `refactor: reorganiza agentes pela nova arquitetura por setor/papel`

### 6.3 Onda 2 — Quebrar o `diretor-marca`

**Objetivo:** desacumular os 3 papéis exercidos pelo `diretor-marca` em 3 agentes distintos.

**Entra:**
- Criar `agents/marketing/estrategia/briefing-writer.md` — herda papel de "Briefing estratégico"
- Criar `agents/marketing/revisao/revisor-coerencia.md` — herda "Curadoria editorial final"
- Renomear `diretor-marca.md` → `revisor-brand.md` em `agents/transversais/brand/` (guardião de identidade + recomendação de estilo)
- Criar `agents/transversais/brand/revisor-compliance.md` (inicial simples)
- Atualizar `/novo-post` para chamar os 3 em vez de 1

**Critério de conclusão:**
- 3 agentes onde antes havia 1
- `/novo-post` funciona idêntico, mas com 3 invocações distintas
- `diretor-marca.md` não existe mais

### 6.4 Onda 3 — Banco de Inteligência mínimo

**Objetivo:** dar memória ao sistema. Vazio no início, com schema declarado.

**Entra:**
- Criar `inteligencia/_schema.md` declarando 3 slices (ramon, mercado, performance)
- Criar templates vazios:
  - `inteligencia/ramon/cronograma.md` (+ 1ª entrada manual)
  - `inteligencia/ramon/fase-atual.md` (+ 1ª entrada manual)
  - `inteligencia/mercado/vocabulario-publico.md` (template inicial; pode partir de `brand/publico-alvo.md`)
  - `inteligencia/performance/angulos-queimados.md` (vazio)
- Criar `agents/transversais/inteligencia/archivist-ramon.md`
- Renomear `pesquisa-tendencias.md` → `pesquisador-mercado.md`
- Adaptar `briefing-writer` para consultar `ramon/` + `performance/angulos-queimados.md` antes de produzir briefing
- Skill nova: `/atualizar-ramon` (interativa)

**Critério de conclusão:**
- Bruno atualizou `ramon/fase-atual.md`
- Próximo `/novo-post` produz briefing diferente porque consultou banco
- Schema versionado (v1)

### 6.5 Onda 4 — Site + Engenharia

**Objetivo:** executar o plano `2026-05-19-site-dino-team-mvp.md` dentro do novo modelo.

**Adaptações ao plano original:**

| Plano original | Novo posicionamento |
|---|---|
| 4 agentes flat em `.claude/agents/` | Distribuídos em Engenharia |
| `arquiteto-web.md` | `agents/engenharia/execucao/web/` |
| `designer-web.md` | `agents/engenharia/execucao/web/` |
| `dev-frontend.md` | `agents/engenharia/execucao/web/` |
| `curador-web.md` | `agents/engenharia/revisao/` |
| `/novo-site` chama `diretor-marca` para briefing | Chama `briefing-writer` (Marketing/Estratégia) |
| Sem revisão de brand explícita | `revisor-brand` valida o site pré-deploy |

**Mudanças concretas no plano:**

- Tasks 1-4 (criar 4 agentes web): mantidas, mas com paths novos
- Task 5 (skill `/novo-site`): atualizar para chamar `briefing-writer` + adicionar `revisor-brand` pré-deploy
- Task 10 (briefing da home): produzido por `briefing-writer` consultando banco de Inteligência
- Task 21 (atualizar CLAUDE.md): atualizar com estrutura nova
- Nova task (pré-deploy): acionar `revisor-brand` em modo "validar site contra brand book"

**Dashboard fica para Onda 5**, embora seja rota dentro do site.

**Critério de conclusão:**
- 4 agentes Engenharia nas pastas corretas
- Site no ar via preview Vercel
- `revisor-brand` aprovou
- Bruno aprovou o visual

### 6.6 Onda 5 — Orquestração + dashboard inicial

**Objetivo:** primeira automação real. Sistema reage a algo sem slash command.

**Entra:**
- `orquestracao/rotas.yaml` com **1 rota inicial**: cron toda 2ª 9h → `/planejar-pauta-semanal`
- Skill `/planejar-pauta-semanal` (L2 — produz N briefings, não executa)
- `docs/politicas/publicacao.yaml` com regras iniciais minimalistas (defaults aprovação humana; educacional/descritivo automático com janela 30min)
- Dashboard em `site/app/admin/dashboard/`:
  - Campanhas em curso (lê `campanhas/`)
  - Aprovações pendentes
  - Frescor do banco
  - 3 botões: novo post, novo lote, atualizar ramon
- 1ª tool de publicação real: `scripts/integrations/publish_instagram.js`

**NÃO entra:** múltiplos cron, webhooks externos, WhatsApp/Telegram, outras tools de publicação.

**Critério de conclusão:**
- Cron rodou pelo menos 1 vez e produziu pauta
- Dashboard mostra `campanhas/` em curso
- 1 post publicado via tool real (não copy-paste manual)
- Política bloqueou pelo menos 1 publicação que precisava de aprovação humana

---

## 7. Critérios de aceitação do redesign completo

A migração está completa quando:

- [ ] Estrutura de pastas reflete os 3 setores × 4 papéis (Onda 1)
- [ ] `diretor-marca` foi quebrado em 3 agentes (Onda 2)
- [ ] Banco de Inteligência tem schema declarado e pelo menos 2 slices populados (Onda 3)
- [ ] Site Dino Team está no ar com aprovação de `revisor-brand` (Onda 4)
- [ ] Sistema produz pauta semanal por cron sem intervenção humana (Onda 5)
- [ ] Sistema publica pelo menos 1 post via tool determinística (não copy-paste) (Onda 5)
- [ ] Política bloqueou pelo menos 1 publicação corretamente (Onda 5)
- [ ] Dashboard web mostra estado vivo do sistema (Onda 5)
- [ ] Skills `/novo-post`, `/lote-posts`, `/novo-estilo`, `/brand-discovery` continuam funcionando ao fim de cada onda
- [ ] CLAUDE.md atualizado refletindo o sistema vigente
- [ ] Token consumption por pipeline reduzido em ≥30% vs. baseline atual

---

## 8. Fora do escopo deste redesign

A arquitetura suporta, mas estes itens **não** são entregues nas 5 ondas:

| Item | Quando entra |
|---|---|
| Setor Produto > Loja (e-commerce) | Quando primeiro produto físico/digital existir além do e-book |
| Setor Produto > App | Quando decisão de criar app for tomada |
| `dev-backend` + Supabase | Quando primeiro formulário com persistência for necessário |
| Versionamento de agentes (`@v2`) | Quando primeira mudança em agente em produção causar regressão |
| Migrar slice do banco para SQL | Quando volume passar de ~100MB ou queries ficarem lentas |
| Webhooks de sistemas externos (Resend, Meta) | Quando integrações ativas pedirem |
| WhatsApp/Telegram como canal de aprovação | Após dashboard web maduro |
| Analistas de performance vivos | Após 1º mês com publicação real (precisa de dados) |
| Múltiplas tools de publicação | Após Instagram estar estável; depois Meta Ads, depois Email |
| Especialização do copywriter/designer | Quando a fronteira ficar irreconciliável (volume justificar) |

---

## 9. Pontos de risco

| Risco | Mitigação |
|---|---|
| Migração rachar uma skill em produção | Onda 1 só move arquivos; comportamento idêntico |
| Banco virar lixo cumulativo em 3 meses | Ownership único por slice; schema versionado; `keeper-banco` faz auditoria periódica |
| Brand bloqueante atrasar publicação | Limite de 3 iterações; escala pra humano após timeout |
| Auto-modificação por keepers causar regressão | Mudança em agente em produção exige aprovação humana; rollback via git |
| Cron rodar quando humano não quer | Política tem modo "pausar" global; dashboard mostra estado |
| Tokens explodirem em campanhas L3 | Pesquisa compartilhada via banco; contexto destilado por skill; cache de outputs intermediários |
| Setor crescer demais e voltar ao problema flat | Convenção rígida de papéis + auditoria periódica do `keeper-agentes` |

---

## 10. Próximos passos pós-aprovação

1. Adaptar `docs/plans/2026-05-19-site-dino-team-mvp.md` à nova arquitetura (Onda 4)
2. Quebrar este design em planos executáveis por onda:
   - `docs/plans/<data>-onda-1-reorganizacao.md`
   - `docs/plans/<data>-onda-2-quebrar-diretor-marca.md`
   - `docs/plans/<data>-onda-3-banco-inteligencia.md`
   - `docs/plans/<data>-onda-4-site-engenharia.md` (adaptação do plano existente)
   - `docs/plans/<data>-onda-5-orquestracao-dashboard.md`
3. Executar Onda 1 (baixo risco, validação prática do desenho)
