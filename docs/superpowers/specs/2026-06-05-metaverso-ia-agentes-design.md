# Metaverso de Agentes IA — Design

> **Status:** Design aprovado · MVP definido
> **Data:** 2026-06-05
> **Tipo:** Projeto novo (standalone, fora do pipeline Dino Team)

---

## Visão

Um mundo virtual web no estilo **Habbo Hotel** — isométrico 2.5D, navegável por avatares — onde os NPCs não seguem scripts fixos: **cada NPC é um agente de IA baseado em LLM**, com memória própria, rotina autônoma, objetivos e capacidade de executar funções reais.

O mundo é um **hotel** organizado como ambiente de trabalho: um **lobby** (hub central) e **salas setorizadas** (Dev, Produto, Criação...). Os agentes residem em salas por setor, executam tarefas de forma autônoma e **se deslocam fisicamente** pelo hotel para resolver dependências entre setores — andam até o outro agente para conversar, como num Habbo real.

A plataforma é **multi-tenant**: cada **workspace** (empresa/time) tem seu próprio hotel, agentes e usuários, isolados de outros workspaces. Agentes criados por um usuário são visíveis a todos os membros do mesmo workspace.

### Norte de longo prazo (não é o MVP)

- **Metaverso online multiplayer** — vários colaboradores no mesmo hotel ao vivo.
- **Quarto individual por usuário** — espaço pessoal de comando: organização, notas e controles do próprio time de agentes (um painel de gestão habitável, não decorativo).
- **Equipes de agentes por colaborador** — cada pessoa gerencia seu próprio time dentro do workspace compartilhado.
- **Gerenciamento de múltiplos projetos simultâneos** — não limitado a workspace de empresa.
- **Produto comercial** — plataforma SaaS distribuível por link.

---

## Princípios de design

1. **Runtime-first.** O risco real do projeto não é o visual (Phaser tem isométrico pronto) — é fazer agentes agirem de forma autônoma e coerente. Construir e validar o motor de IA antes do visual.
2. **Movimento é significativo.** Comunicação entre agentes é sempre física: o agente caminha até o outro para conversar. O Message Bus é apenas o gatilho ("preciso falar com X"); a conversa real só acontece na co-localização. Isso elimina movimento decorativo.
3. **O visual renderiza o estado.** O Phaser nunca decide nada — apenas desenha o que o runtime de IA já computou no servidor. Toda inteligência fica no backend, invisível ao browser.
4. **Web, sem instalação.** Produto = link. Nenhum app desktop. Isso mantém a Fase 2 (multiplayer) como extensão natural, não reescrita.
5. **Multi-LLM via BYOK.** Cada agente declara qual LLM usa; cada usuário conecta sua própria chave de API (Bring Your Own Key). Custo e conta ficam no usuário.

---

## Arquitetura

Cinco camadas, do browser ao dado:

| Camada | Tecnologia | Responsabilidade |
|--------|-----------|------------------|
| **Visual** | Phaser 3 + React | Mundo isométrico (Phaser) + HUD overlay (React: chat, painel de agentes, config) |
| **Realtime** | Socket.io | Transmite estado do mundo em tempo real (eventos `agent_moved`, `agent_spoke`, `task_started`, `room_entered`) |
| **Runtime IA** | Node.js | Scheduler de rotina · Message Bus (NPC↔NPC) · LLM Router · Tool Executor |
| **Dados** | PostgreSQL + pgvector + Redis | Estado durável (Postgres), memória semântica (pgvector), estado efêmero — posições, sessões (Redis) |
| **Credenciais** | BYOK Vault | Chaves API criptografadas por usuário/workspace; injetadas pelo LLM Router no momento da chamada; nunca saem do servidor |

**Providers LLM suportados (alvo):** Anthropic, OpenAI, Google Gemini, Groq, Ollama (self-hosted).

**Stack de deploy (alvo):** Vercel (frontend) + Railway/Render (backend + WebSocket server).

### Componentes do Runtime de IA

- **Agent Scheduler** — executa rotinas conforme horário/gatilho. Um "tick" por agente.
- **Message Bus** — roteamento publish/subscribe por sala. Dispara intenções de comunicação; não carrega a conversa em si.
- **LLM Router** — direciona cada agente à sua API conforme a definição do agente; injeta a chave BYOK correta.
- **Tool Executor** — executa as ferramentas dos agentes funcionais (ler/escrever arquivo, chamar API, gerar documento). Cada chamada persiste resultado.

---

## Modelos de dados

### Definição de agente (≈ `.claude/agents/*.md` deste repositório)

Três blocos:

- **Identidade:** nome, setor/sala, função declarada, avatar (sprite).
- **Comportamento:** system prompt, contrato de output, rotina (schedule), gatilhos de ação.
- **Capacidades:** LLM escolhida (Claude/GPT/Gemini/...), tools habilitadas, salas que pode acessar, agentes que pode chamar.

### Mundo

```
Workspace (empresa/time)
└── Hotel (1 por workspace)
    └── Rooms[] (lobby + setores)
        └── Agents[] (NPCs residentes)
```

**Room:** `{ id, name, sector, tilemap (grid isométrico JSON), agents[], connections[] (portas p/ salas vizinhas), objects[] }`

**Agent runtime state:** `{ current_room_id, position {x,y}, status (idle|thinking|speaking|moving|executing), current_task_id, memory_context (últimas N interações) }`

---

## Ciclo de vida de um agente (um tick)

1. **Planejar** — scheduler dispara; a LLM decide a próxima ação com base em rotina + memória + contexto atual.
2. **Mover** — se precisa de outro setor, pathfinding pelo corredor; Socket emite `agent_moved` a cada tile.
3. **Interagir** — ao chegar no destino, chama o outro agente (co-localizado) ou responde ao player; balão de chat no Phaser.
4. **Executar** — se tem tools, roda a função; resultado persiste.
5. **Memorizar** — resumo da ação salvo no pgvector; o próximo tick começa com esse contexto.

### Exemplo de fluxo NPC↔NPC

```
AgenteDev      → bus.publish("task.spec_needed", { from: "dev" })
AgenteProduto  ← subscribe → caminha fisicamente até a sala Dev
AgenteProduto  → balão "Aqui está a spec do login" + gera doc (tool)
AgenteDev      → recebe spec → volta à sua sala → executa
```

Tudo autônomo, sem player. O Phaser mostra os deslocamentos e balões em tempo real via Socket.io.

---

## Escopo do MVP (Runtime-first, 2 sprints)

### Sprint 1 — Núcleo de IA (headless, validado por logs + testes)

- Modelo de dados: workspace, room, agent, task.
- Definição de agente (identidade + comportamento + capacidades).
- LLM Router com Claude funcional (1 provider primeiro).
- Scheduler de rotina (tick por agente).
- Memória persistida (Postgres + pgvector).
- Message Bus — gatilho de "preciso falar com X".
- 3 agentes: 2 conversacionais + 1 com tool real.

### Sprint 2 — Mundo visível (Phaser 3, renderiza o estado do Sprint 1)

- Tilemap isométrico: lobby + 2 salas + corredor.
- Avatares dos agentes com sprite + indicação de status.
- Movimento físico (pathfinding) entre salas.
- Balões de chat em tempo real.
- Socket.io: estado servidor → browser.
- Player entra, anda e fala com um agente.
- Quarto do usuário presente (1 player no MVP).

### A cena que prova o MVP

Você abre o link e vê o hotel. O AgenteDev está parado na sala de Dev. O scheduler dispara: ele precisa de uma spec. Caminha pelo corredor até a sala de Produto, chega no AgenteProduto, aparece um balão *"Preciso da spec do login"*. O Produto responde, gera o doc (tool real), e o Dev volta pra sua sala e executa. Tudo sozinho — e você pode entrar com seu avatar e perguntar o que estão fazendo.

### Explicitamente fora do MVP (Fase 2+)

- Multiplayer (vários usuários simultâneos).
- Multi-LLM completo (só Claude no MVP).
- Editor visual de agentes (config via arquivo/form simples no MVP).
- BYOK Vault completo (env var no MVP).
- Quartos individuais por colaborador como painel de gestão.
- Marketplace / produto comercial.

---

## Decisões em aberto (para a fase de planejamento)

- **Assets visuais:** pixel art próprio vs. kit isométrico pronto.
- **Frequência do tick:** equilíbrio entre custo de API e vivacidade do mundo.
- **Estrutura de repositório:** monorepo vs. repos separados (front/back).
- **Hospedagem inicial:** rodar local vs. Railway desde o começo.

---

## Por que não as alternativas

- **Electron + Pixi.js (desktop):** bloqueia a Fase 2 — compartilhar estado entre usuários num app desktop é muito mais complexo, e produto = distribuição por link.
- **Three.js isométrico (3D low-poly):** visual mais moderno, mas assets 3D mais caros e curva maior; não justifica o risco no MVP.
- **Visual-first:** demo bonita rápida, mas arrisca construir o visual perfeito sobre um runtime que não encaixa — retrabalho caro.
- **Tracks paralelas:** mais rápido no papel, mas contexto dividido com time pequeno é contexto perdido; integração no fim sempre surpreende.
