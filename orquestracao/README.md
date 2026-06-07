# Orquestração — Dino Team

Tabela declarativa de rotas (trigger → skill). Agendamento executado por **routines `/schedule`** (ver `docs/automacao/routines.md`); o Vercel hospeda só o dashboard.

## Estrutura de arquivos

| Arquivo | Função |
|---|---|
| `rotas.yaml` | Tabela declarativa de trigger → skill (fonte de verdade das rotas; espelhada pelas routines) |
| `governanca.yaml` | Mapa de autonomia por decisão — quais funções do roster são automáticas, humanas, ou automáticas com revisão. Referencia `politicas/publicacao.yaml` para a função de publicação. |
| `politicas/publicacao.yaml` | Política específica de publicação — regras por canal/pilar/termos que determinam `automatico` vs `aprovacao_humana`. Referenciada por `governanca.yaml` e lida por `/novo-post`, `/lote-posts` e pelo dashboard. **Não aposentado** — é a política viva de publicação. |

## Rotas ativas (2)

| ID | Schedule | Skill |
|---|---|---|
| `pauta-semanal-cron` | `0 9 * * 1` (2ª-feira 9h) | `/planejar-pauta-semanal` |
| `pesquisar-mercado-cron` | `0 8 1 * *` (dia 1 do mês 8h) | `/pesquisar-mercado` |

Agendamento executado por **routines `/schedule`** (ver `docs/automacao/routines.md`). Publicação nunca é automática — gate humano no dashboard.

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
2. Criar a routine correspondente via `/schedule` com a cadência declarada em `rotas.yaml`.
3. Atualizar `docs/automacao/routines.md` com a nova entrada.
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
