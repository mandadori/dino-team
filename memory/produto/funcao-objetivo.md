---
slice: produto
owner: estrategista-produto
ultima_atualizacao: 2026-06-08
versao: 1
mantido_por: humano
---

# Função-objetivo (input humano)

O que o setor **maximiza** ao rankear oportunidades. Pesos são do humano; o agente
apenas aplica. **Não é receita pura** — preserva a integridade da marca.

## Pesos (somam 1.0)

| Dimensão | Pergunta | Peso |
|---|---|---|
| Fit de marca | serve uma Verdade do `brand-book`? coerente com o brand? | 0.35 |
| Evidência de demanda | intensidade/tamanho da dor validada | 0.35 |
| Retorno ajustado a risco | margem esperada × prob. de validação ÷ esforço | 0.15 |
| Fit de portfólio | não canibaliza, complementa a consultoria | 0.15 |

> Economia entra como **filtro/gate**, não como o que se maximiza, nesta fase.
> Anti-canibalização é gate duro: oportunidade que canibaliza a consultoria sem
> ganho líquido é descartada, não rankeada.

## Orçamento de experimento (guard do G-ideia)

- **Por validação:** (a definir pelo humano — ex.: 1 post/stories + 1 landing; teto de "pedidos de atenção" à audiência por mês).
- Regra: validação **morre por padrão** se não bater o critério de sucesso declarado.
