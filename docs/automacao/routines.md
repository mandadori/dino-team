# Routines de agendamento (Dino Team)

Após a consolidação (Peça 4), o agendamento é **um mecanismo só**: routines `/schedule` que executam de fato (os antigos handlers Vercel só registravam). Vercel hospeda só o dashboard (`/admin/dashboard`).

| Routine | Cadência | Skill | Modo |
|---|---|---|---|
| pesquisar-mercado | mensal (dia 1) | `/pesquisar-mercado` | autônomo (deep durável) |
| pauta-semanal | semanal (2ª) | `/planejar-pauta-semanal` | autônomo (sem a pausa manual) |
| novo-post | poll diário | `/novo-post --auto` por briefing vencendo | autônomo (ver `routine-novo-post.md`) |

Setup: criar cada routine via a skill `/schedule` com a cadência acima. `orquestracao/rotas.yaml` permanece como **documentação declarativa** que as routines espelham. Publicação nunca é automática (gate humano no dashboard, política em `orquestracao/politicas/publicacao.yaml`).
