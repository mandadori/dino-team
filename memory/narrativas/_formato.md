---
slice: narrativas
owner: estrategista-mercado
ultima_atualizacao: 2026-06-07
versao: 2
---

# Formato do slice `narrativas/`

Após o redesign de 2 velocidades, o slice contém **apenas o livro-razão**. Não há mais arcos (`ativas.md`) nem roadmap de crença — a camada lenta é o conjunto de `## Verdades` em `brand/brand-book.md`.

## `livro-razao.md` — o que já foi dito (responde "qual verdade, quantas vezes?")

Tabela append-only, escrita pelo write-back das skills de produção.

```
| data | mensagem/ângulo | narrativa | canal | peça |
|------|-----------------|-----------|-------|------|
```

> **Semântica (redesign 2 velocidades):** a coluna `narrativa` registra a **verdade** (slug do `## Verdades` do brand-book) que a peça acendeu. O header ainda se chama `narrativa` porque o script `append_livro_razao.js` mantém a flag `--narrativa` nesta fase; o rename para `verdade` é da Peça 4.

Contagem de saturação = nº de linhas por **verdade** numa janela. Append feito pelo script `scripts/memory/append_livro_razao.js`. O owner `estrategista-mercado` **lê** para equilíbrio/saturação; não escreve aqui.
