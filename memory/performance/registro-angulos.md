---
slice: performance
owner: analista-performance
ultima_atualizacao: 2026-06-08
versao: 1
---

# Registro de ângulos

Ledger append-only — **uma linha por peça finalizada** (aprovada no gate de marca e entregue). É o registro único do que o conteúdo **disse**: qual ângulo, qual verdade, em qual canal. Funde os antigos `angulos-queimados.md` e `livro-razao.md` num só lugar, porque ângulo e verdade são o mesmo tipo de coisa — atributos de conteúdo do post. A performance (o que o conteúdo **gerou**) vive separada em [`metricas.md`](metricas.md), unida a este ledger pela coluna `slug`.

Escrito pelo script `scripts/memory/append_registro_angulos.js` no write-back das skills de produção (`/novo-post`, `/lote-posts`, `/novo-artigo`, `/novo-email`, `/novo-comunidade`). O owner `analista-performance` **lê e cura** (ajusta `descanso` quando o juízo editorial pede); não escreve as linhas de rotina à mão.

## Schema

```
| slug | data | canal | ângulo | verdade | pilar | descanso |
```

- **`slug`** — slug do post (kebab-case). Chave de join com `metricas.md`.
- **`data`** — `YYYY-MM-DD` da finalização/publicação.
- **`canal`** — `instagram | blog | email | comunidade`.
- **`ângulo`** — slug canônico do ângulo (gancho/recorte específico). Base da saturação de ângulo.
- **`verdade`** — slug do `## Verdades` (brand-book) que a peça acendeu, ou `neutro`. Base da saturação de verdade.
- **`pilar`** — pilar de conteúdo acionado (`neutro` se não declarado).
- **`descanso`** — janela de descanso do ângulo (ex.: `21d`, `6sem`). Ângulo específico descansa mais; amplo, menos.

## Como se lê (sem estado mutável — tudo é computado)

- **"Este ângulo está queimado?"** → existe linha com esse `ângulo` cujo `data + descanso` ainda é futuro? Sim = descansando até `data + descanso`. Não = livre. (Substitui o antigo arquivo com seção "ativos/expirados" — a expiração agora é aritmética na leitura, não um chore de mover entradas.)
- **Saturação de verdade** → nº de linhas por `verdade` numa janela. Lido pelo `estrategista-mercado` para equilibrar as jogadas (não martelar a mesma verdade; cobrir o conjunto).
- **Saturação de ângulo** → nº de linhas / recência por `ângulo` numa janela.

## Entradas

| slug | data | canal | ângulo | verdade | pilar | descanso |
|------|------|-------|--------|---------|-------|----------|
