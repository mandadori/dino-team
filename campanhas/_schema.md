# Campanhas — Schema

Estado vivo de cada campanha em curso. Lida pelo dashboard, escrita por skills L2/L3.

## Estrutura por campanha

```
campanhas/<slug>/
├── briefing-mestre.md     ← briefing consolidado consumido por todas as filhas
├── grafo.yaml             ← DAG de dependências entre tarefas
├── status.yaml            ← estado vivo (qual tarefa está em qual status)
├── log.md                 ← histórico de eventos (alimenta dashboard)
├── output/
│   ├── posts/
│   ├── ads/
│   ├── emails/
│   └── (outros por canal)
└── relatorio-final.md     ← preenchido quando campanha encerra
```

## Convenção de slug

`<YYYY-Www>-<descricao-kebab-case>` — ex: `2026-W21-pauta-semanal`, `2026-Q3-lancamento-ebook`.

## Schema de `status.yaml`

```yaml
campanha:
  slug: <slug>
  inicio: YYYY-MM-DD
  fim_previsto: YYYY-MM-DD | null
  estado: em-curso | aguardando-aprovacao | concluida | pausada
tarefas:
  - id: <slug-da-tarefa>
    skill: /<skill que executa>
    estado: pendente | em-andamento | aguardando-publicacao | aguardando-aprovacao | concluida | falhou-gate | falhou-auto | falhou
    output: <caminho ou null>
    data_prevista: YYYY-MM-DD | null   # data prevista de publicação (pauta semanal)
    atualizado_em: YYYY-MM-DDTHH:mm
aprovacoes_pendentes:
  - tarefa_id: <id>
    aguardando_desde: YYYY-MM-DDTHH:mm
    canal: <dashboard | whatsapp | ...>
```

**Estados do fluxo autônomo (Peça 3):**
- `aguardando-publicacao` — post gerado por `/novo-post --auto`, pronto, esperando aprovação humana de publicação no dashboard.
- `falhou-gate` — `revisor-brand` reprovou 2× no modo `--auto`; não há rascunho publicável.
- `falhou-auto` — erro de execução no modo `--auto`.

## Quem escreve

- Skills L2/L3 ao iniciar campanha (cria pasta + briefing-mestre + status inicial).
- Skills L1 ao concluir cada filha (atualizam `status.yaml` da campanha pai se aplicável).
- Dashboard nunca escreve em `campanhas/` — só lê.

## v1 desta onda

Apenas `/planejar-pauta-semanal` cria campanha. Estrutura completa de L3 (relatorio-final, grafo elaborado) entra quando primeira campanha multi-canal existir.
