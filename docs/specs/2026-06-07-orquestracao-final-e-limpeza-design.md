# Orquestração final e limpeza (Peça 4)

> Spec de design — 2026-06-07
> Última de 4 peças do redesign da automação. Recolhe os resíduos das Peças 1–3 e consolida o agendamento: termina o rename cosmético `narrativa → verdade`, remove o handler de cron órfão, unifica o mecanismo de agendamento em **routines**, e faz a varredura final de referências mortas. Depende das Peças 1 e 3 prontas.

---

## Motivação

As Peças 1–3 deixam três pontas soltas, de propósito (pra não rippar durante mudanças maiores):

1. **Rename adiado.** A Peça 1 manteve a flag `--narrativa` no `append_livro_razao.js` (só mudou a semântica do valor para "verdade") pra não tocar nas 5 skills de produção naquele momento. O rename consistente fica aqui.
2. **Handler de cron órfão.** A Peça 1 remove a skill `/ciclo-de-direcao` e a rota em `rotas.yaml`, mas o Route Handler `site/app/api/cron/ciclo-de-direcao/` continua existindo.
3. **Dois mecanismos de agendamento.** A Peça 3 introduz routines (`/schedule`) pro `/novo-post`, enquanto pauta e pesquisar-mercado seguem em Vercel Cron. Pior: pelo CLAUDE.md, os handlers Vercel **só registram** o trigger — não executam. Consolidar em routines **fecha a execução** de pauta/pesquisar (que hoje não acontece).

## Escopo

**Dentro:**
- Rename cosmético `--narrativa → --verdade` (script + ledger + `_formato` + skills de produção).
- Remover o Route Handler de cron `ciclo-de-direcao`.
- Consolidar agendamento em routines (pesquisar-mercado, pauta, novo-post) — **recomendado, a confirmar na revisão**.
- Varredura final: nenhuma referência morta a `estrategista-narrativa`, `ciclo-de-direcao`, `ativas.md`, `roadmap-crenca`, `--narrativa` no sistema vivo.

**Fora:** lógica das Peças 1–3 em si.

---

## Mudança 1 — Rename cosmético `narrativa → verdade`

Tornar a semântica (já mudada na Peça 1) explícita no nome, em todo lugar:
- `scripts/memory/append_livro_razao.js` — flag `--narrativa` → `--verdade`; `HEADER_PATTERN` e a coluna gerada de `narrativa` → `verdade`; `REQUIRED` e `usage()`.
- `memory/narrativas/livro-razao.md` — cabeçalho da tabela: coluna `narrativa` → `verdade`.
- `memory/narrativas/_formato.md` — descrição da coluna.
- Chamadas de write-back nas skills de produção: `/novo-post` (Passo 15.6), `/lote-posts`, `/novo-email`, `/novo-artigo`, `/novo-comunidade` — trocar `--narrativa <valor>` por `--verdade <valor>`.
- Campo do briefing `narrativa:` → `verdade:` onde ainda referenciado (templates/briefing.md, parse do `/novo-post` Passo 1, geração da `/planejar-pauta-semanal`).

> Migração da tabela existente: o `livro-razao.md` atual está vazio (só cabeçalho), então trocar o cabeçalho não exige migração de linhas. Se houver linhas quando esta peça rodar, manter as antigas (a contagem de saturação tolera o histórico) e só mudar o cabeçalho — ou reescrever o cabeçalho preservando linhas.

## Mudança 2 — Remover o Route Handler de cron `ciclo-de-direcao`

- Deletar `site/app/api/cron/ciclo-de-direcao/`.
- Conferir `site/vercel.json` (ou config equivalente) e remover a entrada de cron correspondente, se existir.
- (As Mudanças da Peça 1 já removeram a skill, a rota em `rotas.yaml` e as menções em `governanca.yaml`/`README.md`.)

## Mudança 3 — Consolidar agendamento em routines (recomendado)

**Estado-alvo: um mecanismo só.** As três skills agendadas viram routines `/schedule` que **de fato executam** (não só registram):

| Skill | Cadência | Modo |
|---|---|---|
| `/pesquisar-mercado` | mensal (deep durável) | autônomo |
| `/planejar-pauta-semanal` | semanal (2ª) | autônomo (sem a pausa manual; a pausa é só do disparo manual) |
| `/novo-post --auto` | poll diário (Peça 3) | autônomo |

- **Vercel fica só com o dashboard** (`/admin/dashboard`) — triggers manuais e aprovações de publicação. Os Route Handlers de cron (`pesquisar-mercado`, `planejar-pauta-semanal`) são removidos.
- `orquestracao/rotas.yaml` vira a **documentação declarativa** do agendamento que as routines espelham (fonte de verdade humana), ou é aposentado — decidir na revisão.

> **A confirmar na revisão:** consolidar tudo em routines **ou** manter híbrido (routines só pro novo-post; Vercel cron pra pauta/pesquisar). Recomendo consolidar — um mecanismo, e fecha a execução de pauta/pesquisar que hoje não roda. Mas toca a infra do site existente, então é sua chamada.

## Mudança 4 — Varredura final de referências mortas

Após as Peças 1–4, rodar o sweep e garantir **zero** ocorrências vivas (fora de `docs/plans/*` e `docs/specs/2026-06-06-*`, que são histórico):

```
grep -rn "estrategista-narrativa\|ciclo-de-direcao\|narrativas/ativas\|roadmap-crenca\|--narrativa" \
  --include="*.md" --include="*.yaml" --include="*.js" --include="*.ts" . \
  | grep -v node_modules | grep -v "docs/plans/" | grep -v "docs/specs/2026-06-06"
```

Qualquer hit vivo é corrigido. Atualizar `memory/MEMORY.md` (auto-memória) e os notes de memória relevantes para refletir a nova arquitetura de 2 velocidades.

## Dependências

- Vem **por último**: precisa da Peça 1 (demolição/rename semântico) e da Peça 3 (routine do novo-post) prontas.
- A Peça 2 é independente.

## Critérios de sucesso

- `append_livro_razao.js` usa `--verdade`; as 5 skills de produção chamam com `--verdade`; o ledger e o `_formato` mostram a coluna `verdade`.
- `site/app/api/cron/ciclo-de-direcao/` removido; nenhuma config de cron órfã.
- Agendamento num mecanismo só (routines) **ou** híbrido documentado — conforme decidido na revisão; pauta e pesquisar-mercado de fato executam.
- O sweep da Mudança 4 retorna **zero** referências vivas mortas.
- `memory/MEMORY.md` e notes refletem a arquitetura de 2 velocidades.
