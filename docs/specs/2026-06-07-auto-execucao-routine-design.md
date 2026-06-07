# Auto-execução por routine: posts gerados na data prevista (Peça 3)

> Spec de design — 2026-06-07
> Terceira de 4 peças do redesign da automação. Fecha a ponta da corrente: a `/planejar-pauta-semanal` produz briefings com `data prevista`, e esta peça faz o `/novo-post` rodar **sozinho** em cada data — gerando o post pronto (rascunho). **A publicação segue sempre gated por humano** (decisão travada no brainstorm). Idealmente vem depois das Peças 1 e 2 (pauta inteligente + pesquisa rica), mas a mecânica de execução é independente.

---

## Motivação

Hoje a corrente para na pauta: a `/planejar-pauta-semanal` grava briefings com `data prevista` e marca `aguardando-aprovacao`; um humano dispara cada `/novo-post` à mão (dashboard ou `/lote-posts`). **Não existe runner que execute os posts nas datas previstas** — a automação "ponta-a-ponta" que dá nome a esta frente não está fechada.

## Decisão travada

| Decisão | Resolução |
|---|---|
| Mecanismo de runner | **Routines do Claude Code (`/schedule`)** — agente agendado remoto que roda a skill no cron, conectado ao repo GitHub. Roda no plano Claude do usuário; sem API key a gerenciar. |
| Nível de autonomia | **Cria sozinho até o post pronto; humano libera a publicação.** O runner nunca publica. |
| Gate de marca | `revisor-brand` (já automatizado) permanece no fluxo autônomo. |

## A visão / fluxo

```
ROUTINE (diária, via /schedule)
   1. resolve "briefings do dia" (script determinístico lê o status.yaml da pauta ativa)
   2. para cada briefing vencendo hoje:
        /novo-post --briefing <path> --auto   (modo autônomo, sem pausas)
        → copy + design + export PNG + gate revisor-brand → post pronto
   3. marca a tarefa como `aguardando-publicacao` no status.yaml + commita o rascunho
   (no-op nos dias sem briefing vencendo)

DASHBOARD (Vercel)  → humano vê "aguardando publicação" → aprova → publish_instagram.js (gated por publicacao.yaml)
```

---

## Mudança 1 — Modo autônomo do `/novo-post` (`--auto`)

É a peça de engenharia central: o `/novo-post` é hoje cheio de pausas humanas. Em modo `--auto` (usado pela routine), ele roda ponta-a-ponta **sem pausa**, parando antes de publicar.

O que muda em `--auto` (sempre a partir de um `--briefing` pré-pronto, então os Passos 3/3.⏸/4/4.⏸ já são pulados):
- **Passo 10 (copy ⏸)** → gera a copy e **segue sem revisão humana** (sem a pausa "ok"). A copy fica gravada; a revisão fica pro humano na aprovação de publicação.
- **Passo 11 (Dino Editor ⏸)** → **não sobe o editor**. Usa os `slide-N.html` gerados diretamente → export-png. (Edição visual humana não existe no fluxo autônomo.)
- **Passo 11.5 (loop de aprendizado de estilo ⏸)** → **pulado** (não há `edits.json` sem editor).
- **Passo 13 (gate `revisor-brand`)** → **permanece** (é automatizado). Se REPROVADO, aplica a instrução e re-roda até 1 retry; 2º fracasso → marca a tarefa como `falhou-gate` no status.yaml e **não** entrega rascunho (some pro humano resolver, não publica lixo).
- **Passo 14.5 (stories ⏸)** → **pulado** em `--auto` (adaptação stories é decisão humana opcional).
- **Passo 15 (rascunho ⏸)** → N/A (briefing usa estilo definido, não ad-hoc).
- **Passo 16 (publicação)** → **nunca executa em `--auto`**. Apenas marca `aguardando-publicacao`.

Modo interativo (sem `--auto`) permanece exatamente como hoje. O `--auto` é aditivo.

## Mudança 2 — Resolver de "briefings do dia"

Script determinístico novo: `scripts/orquestracao/briefings_do_dia.js`.

- Lê o `status.yaml` da campanha de pauta **ativa** (a semana corrente) em `campanhas/<YYYY-Www>-pauta-semanal/`.
- Para cada tarefa `estado: pendente` com `skill: /novo-post`, lê a `Data prevista de publicação` do briefing apontado em `output`.
- Retorna (JSON, inline) a lista de briefings cuja data prevista é **hoje** (ou vencida e ainda pendente — backlog).
- Mantém a lógica de orquestração **fora** do prompt da routine (determinismo; testável isolado), espelhando o padrão dos validadores existentes (`avaliar_politica.js`).

## Mudança 3 — A routine (poll diário via `/schedule`)

Uma **routine permanente diária** (não uma agenda por-briefing) — mais robusta e com menos partes móveis:

- Cadência: diária, de manhã (ex.: 8h `America/Sao_Paulo`), após a janela da pauta.
- Ação (prompt da routine): rodar `briefings_do_dia.js` → para cada briefing retornado, `/novo-post --briefing <path> --auto` → ao concluir, atualizar a tarefa no `status.yaml` para `aguardando-publicacao` e commitar o rascunho do post no repo.
- Dias sem briefing vencendo: no-op silencioso.
- A criação/edição/remoção da routine é feita via a skill `/schedule` (setup do usuário, uma vez).

> **Verificar na implementação:** mecânica exata do `/schedule` (sintaxe, fuso, execução não-interativa de skill, semântica de escrita/commit no repo conectado). O design acima assume que uma routine remota conectada ao GitHub consegue rodar uma skill headless e commitar — confirmar antes de codar e ajustar o prompt da routine se necessário.

## Mudança 4 — Estado `aguardando-publicacao` + gate de publicação

- A máquina de estados da campanha (`campanhas/_schema.md` / `status.yaml`) ganha o estado de tarefa **`aguardando-publicacao`** (entre `pendente` e `publicado`). Estados de exceção: `falhou-gate` (revisor-brand reprovou 2×), `falhou-auto` (erro de execução).
- O **dashboard** (rota `/admin/dashboard`) passa a listar posts `aguardando-publicacao` com preview dos PNGs e botão de aprovar → dispara `publish_instagram.js`, **sempre** sujeito a `orquestracao/politicas/publicacao.yaml` (regra que casa primeiro decide; termo sensível → bloqueia).
- O runner **nunca** chama `publish_instagram.js`. O único caminho de publicação é a aprovação humana.

## Constraint conhecido — fotos em posts autônomos

Sem o Dino Editor, **ninguém dropa fotos** no fluxo autônomo. Tratamento:
- Se a campanha apontar um **banco de imagens**, o Passo 11m (`arquivista` → `suggestions.json`) pré-preenche as drop zones automaticamente — o post autônomo sai com foto.
- Sem banco, o post sai com os backgrounds-placeholder do estilo (tipográfico/chroma). O dashboard **sinaliza** "sem foto — revisar antes de publicar" no card de aprovação.
- Não é regressão: o humano vê tudo antes de publicar. É um limite explícito da autonomia, resolvido na aprovação.

## Dependências

- **Peça 1 (estrategista)** — sem ela, a pauta gera briefings, mas "burros". A auto-execução funciona mesmo assim; só rende menos. Não bloqueia.
- **Peça 2 (pesquisa universal)** — sem ela, posts autônomos de Mentalidade saem com copy mais pobre. Não bloqueia.
- Recomendado: implementar **1 → 2 → 3** para que a auto-execução já rode sobre pauta inteligente + copy rica.

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Post autônomo ruim publicado | **Impossível por design** — publicação é sempre humana (gate no dashboard + `publicacao.yaml`). |
| `revisor-brand` reprovar em loop no modo `--auto` | Máx 1 retry, depois `falhou-gate` + para (não entrega, não publica). Humano resolve. |
| Routine commitar lixo no repo | Commit do rascunho vai pra branch/rascunho, não pra publicação; humano revisa. Estados de exceção (`falhou-*`) visíveis no dashboard. |
| Mecânica do `/schedule` não suportar exatamente o assumido | Bloco "Verificar na implementação" — confirmar antes de codar; resolver de briefings é determinístico e testável fora da routine. |
| Posts sem foto saírem sem aviso | Dashboard sinaliza "sem foto"; arquivista pré-preenche quando há banco. |

## Critérios de sucesso

- `/novo-post --auto` roda um briefing pré-pronto ponta-a-ponta sem nenhuma pausa, gera copy+design+PNG, passa pelo `revisor-brand` e **para** em `aguardando-publicacao` (nunca publica).
- `scripts/orquestracao/briefings_do_dia.js` retorna deterministicamente os briefings vencendo hoje a partir do `status.yaml` da pauta ativa (testável isolado).
- Uma routine `/schedule` diária dispara o resolver + `/novo-post --auto` por briefing e atualiza o `status.yaml`.
- `status.yaml`/`campanhas/_schema.md` têm `aguardando-publicacao` + estados de exceção; o dashboard lista e permite aprovar publicação (gated por `publicacao.yaml`).
- Nenhum caminho de código publica sem aprovação humana.
- Modo interativo do `/novo-post` inalterado.
