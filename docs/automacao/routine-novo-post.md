# Routine de auto-execução do `/novo-post`

Runner da Peça 3: uma routine `/schedule` diária que gera os posts cuja data prevista venceu, deixando-os `aguardando-publicacao` (humano publica no dashboard).

## Setup (manual, uma vez)

Crie uma routine diária via a skill `/schedule` com o prompt abaixo. Cadência sugerida: diária, 08:00 `America/Sao_Paulo`.

**Prompt da routine:**

> Rode `node scripts/orquestracao/briefings_do_dia.js` no repo. Para cada item do JSON retornado, execute `/novo-post --briefing <campanha>/<output> --auto`. Ao concluir cada post (gate APROVADO), atualize a tarefa correspondente no `status.yaml` da campanha para `aguardando-publicacao` e commite o rascunho do post. Se `briefings_do_dia.js` retornar `[]`, não faça nada. Nunca publique — publicação é aprovação humana no dashboard. Reporte os posts gerados e quaisquer `falhou-gate`/`falhou-auto`.

## Verificação antes de confiar na routine

1. `TODAY=<uma data com briefing pendente> node scripts/orquestracao/briefings_do_dia.js` retorna os briefings esperados.
2. `/novo-post --briefing <um briefing real> --auto` gera o post e para em `aguardando-publicacao` (não publica).
3. O dashboard (`/admin/dashboard` → aprovações) mostra o post aguardando publicação.

## Verificar na implementação (flag honesto do spec)

A mecânica exata do `/schedule` (execução headless de skill + commit no repo conectado ao GitHub) deve ser confirmada na primeira configuração. Se a routine não conseguir rodar a skill headless, alternativas: runner local (`claude -p`) no cron, ou GitHub Action — o resolver `briefings_do_dia.js` é determinístico e serve qualquer um deles.
