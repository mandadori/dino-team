# Orquestração — Dino Team

Tabela declarativa de rotas (trigger → skill). Lida pelo roteador implementado em `site/app/api/cron/*` (Vercel Cron) e por gatilhos manuais via dashboard.

## Estrutura de arquivos

| Arquivo | Função |
|---|---|
| `rotas.yaml` | Tabela declarativa de trigger → skill (fonte de verdade das rotas) |
| `governanca.yaml` | Mapa de autonomia por decisão — quais funções do roster são automáticas, humanas, ou automáticas com revisão. Referencia `politicas/publicacao.yaml` para a função de publicação. |
| `politicas/publicacao.yaml` | Política específica de publicação — regras por canal/pilar/termos que determinam `automatico` vs `aprovacao_humana`. Referenciada por `governanca.yaml` e lida por `/novo-post`, `/lote-posts` e pelo dashboard. **Não aposentado** — é a política viva de publicação. |

## Rotas cron ativas (2)

| ID | Schedule | Skill | Handler |
|---|---|---|---|
| `pauta-semanal-cron` | `0 9 * * 1` (2ª-feira 9h) | `/planejar-pauta-semanal` | `site/app/api/cron/planejar-pauta-semanal/route.ts` |
| `pesquisar-mercado-cron` | `0 8 1 * *` (dia 1 do mês 8h) | `/pesquisar-mercado` | `site/app/api/cron/pesquisar-mercado/route.ts` |

**Nota de runtime (honesta):** os handlers de cron validam autenticação e registram o trigger, mas **não executam a skill** — serverless tem filesystem efêmero/somente-leitura. A execução real é delegada a um runner com acesso de escrita ao repo (GitHub Action, Claude Code remoto, ou worker dedicado). Esse wiring é a próxima etapa (pós-Onda 5).

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
3. Implementar o Route Handler espelhando o padrão dos handlers existentes (auth via `CRON_SECRET`, checa `CLAUDE_API_KEY`, `executed: false`, nota de delegação).
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
