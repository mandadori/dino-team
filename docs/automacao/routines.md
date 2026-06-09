# Routines de agendamento (Dino Team)

Após a consolidação (Peça 4), o agendamento é **um mecanismo só**: routines `/schedule` que executam de fato (os antigos handlers Vercel só registravam). Vercel hospeda só o dashboard (`/admin/dashboard`).

| Routine | Cadência | Skill | Modo |
|---|---|---|---|
| pesquisar-mercado | mensal (dia 1) | `/pesquisar-mercado` | autônomo (deep durável) |
| pauta-semanal | semanal (2ª) | `/planejar-pauta-semanal` | autônomo (sem a pausa manual) |
| novo-post | poll diário | `/novo-post --auto` por briefing vencendo | autônomo (ver `routine-novo-post.md`) |
| evolucao-produto-cron | mensal (dia 5) | `/evoluir-produto --todos` | só sinaliza — humano decide no gate |

**evolucao-produto-cron:** varre o catálogo + cérebro (dia 5 de cada mês, 9h America/Sao_Paulo), propõe evoluções e flags de sunset para cada produto `ativo`. **Só sinaliza** — humano decide no gate (G-sunset e evoluções). Sem produto `ativo`, retorna `SEM_PRODUTOS_ATIVOS` (esperado no cold start). Notificação: dashboard (sucesso/falha).

Setup: criar cada routine via a skill `/schedule` com a cadência acima. `orquestracao/rotas.yaml` permanece como **documentação declarativa** que as routines espelham. Publicação nunca é automática (gate humano no dashboard, política em `orquestracao/politicas/publicacao.yaml`).
