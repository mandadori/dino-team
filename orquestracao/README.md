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
