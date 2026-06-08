---
slice: performance
owner: analista-performance
ultima_atualizacao: 2026-06-08
versao: 1
---

# Métricas por peça

Ledger append-only de **performance** — o que cada peça **gerou** depois de publicada. Unido ao [`registro-angulos.md`](registro-angulos.md) pela coluna `slug` (uma peça = uma linha de conteúdo lá + N coletas de métrica aqui). Cruzar os dois responde "qual **verdade** / **ângulo** converte" — o elo do auto-aprimoramento.

> **Estado: criado, não alimentado.** Não há ingestão de métrica ainda — falta conectar o Instagram da consultoria e construir os coletores `scripts/integrations/fetch_*.js` (plano futuro). Enquanto isso, a otimização do fluxo é feita por um humano apontando; este arquivo fica pronto, vazio, esperando o primeiro `fetch_*`. Não invente números: linha só entra com dado real coletado de API.

## Schema

```
| slug | data_coleta | canal | alcance | impressoes | saves | compartilhamentos | comentarios | visitas_perfil | follows |
```

- **`slug`** — slug do post. Chave de join com `registro-angulos.md`.
- **`data_coleta`** — `YYYY-MM-DD` da coleta (métrica amadurece; pode haver mais de uma coleta por peça).
- **`canal`** — `instagram | blog | email | comunidade | ads | funil-site`.
- Demais colunas — métricas orgânicas do canal. Colunas sem equivalente no canal ficam vazias.

## Origem (futuro)

Populado por `scripts/integrations/fetch_<canal>.js` (ex.: `fetch_instagram.js` via Graph API → endpoint Insights, escopo `instagram_manage_insights`). Owner que consolida: `analista-performance`. Quando outros canais entrarem (email/Resend, site/GA4, ads/Meta), cada um tem seu coletor, mas todos normalizam para este mesmo arquivo — um único ponto de concentração de performance, lido por quem decide ângulo/verdade.

## Coletas

| slug | data_coleta | canal | alcance | impressoes | saves | compartilhamentos | comentarios | visitas_perfil | follows |
|------|-------------|-------|---------|------------|-------|-------------------|-------------|----------------|--------|
