---
slice: pesquisa
owner: pesquisador-mercado
ultima_atualizacao: 2026-06-08
versao: 1
---

# Pedidos de pesquisa (fila — loop fechado)

O `estrategista-produto` **enfileira** aqui lacunas de evidência que precisa para
decidir produto ("existe demanda por X?", "preço do concorrente Y?"). O
`pesquisador-mercado` (via `/pesquisar-tema` ou `/pesquisar-mercado`) **atende** e
marca como respondido — apontando o arquivo de `memory/pesquisa/` gerado. Loop fechado
**pela memória**, sem chamada direta entre setores.

**Schema de um pedido:**

```
### <slug-do-pedido>
- **Pergunta:** <a lacuna, em 1 frase>
- **Para decidir:** <qual oportunidade/produto depende disso>
- **Solicitante:** estrategista-produto · <data>
- **Status:** aberto | respondido
- **Resposta:** <ref ao arquivo memory/pesquisa/<...>.md quando respondido>
```

## Pedidos

_(vazio.)_
