# Phase 4: Blog SEO Production-Ready - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-11
**Phase:** 4-blog-seo-production-ready
**Areas discussed:** Categorias & pilares, Autoria & EEAT, Listagem & layout, Lançamento & CTA, Site URL

---

## Categorias & pilares

### Q1 — Categorias do blog = pilares da marca, taxonomia própria ou híbrido?
| Option | Description | Selected |
|--------|-------------|----------|
| Os 4 pilares da marca | Mentalidade/Método/Prova viva/Transformação — consistência com pipeline | |
| Taxonomia própria SEO | Categorias orientadas a busca (Treino, Nutrição…) | ✓ |
| Híbrido (pilar como base) | Espinha dos pilares renomeada pra termos buscáveis | |

### Q2 — Conjunto exato de categorias?
| Option | Description | Selected |
|--------|-------------|----------|
| Treino · Nutrição · Mentalidade · Bastidores | 4 categorias enxutas | ✓ |
| + Resultados (5 categorias) | Separa prova de aluno dos bastidores do Ramon | |
| Treino · Nutrição · Mentalidade | 3 categorias, só os temas de busca mais fortes | |

**User's choice:** Taxonomia SEO própria → **Treino · Nutrição · Mentalidade · Bastidores** (1 por artigo).
**Notes:** "Prova viva"/"Transformação" não são termos de busca; taxonomia SEO vence consistência interna.

---

## Autoria & EEAT

### Q1 — Quem assina os artigos (identidade padrão + bloco de autor)?
| Option | Description | Selected |
|--------|-------------|----------|
| Ramon Dino assina | Autor único, máximo EEAT | |
| Equipe Dino Team | Autor institucional + Ramon como autoridade | |
| Autor variável por artigo | Campo `author` resolve por artigo; registro em lib/site.ts | ✓ |

### Q2 — Com quais autores o registro começa?
| Option | Description | Selected |
|--------|-------------|----------|
| Só Ramon Dino por ora | Registro com 1 autor | |
| Ramon + Equipe Dino Team | Pessoa + institucional | |
| Ramon + coach(es) reais | Usuário fornece nome/credencial/foto | ✓ |

**User's choice:** Autor variável; registro semeado com **Ramon Dino** (campeão Mr. Olympia) + **Mauri Rosolen** (Treinador).
**Notes:** Usuário entregou foto do Mauri (`mauri.rosolen_…webp`) — preservada em `site/public/autores/mauri-rosolen.webp`. Foto do Ramon segue pendente (placeholder até acervo P&B). JSON-LD Person por autor + Organization Dino Team.

---

## Listagem & layout

### Q1 — Como /blog exibe os artigos?
| Option | Description | Selected |
|--------|-------------|----------|
| Grid de cards | Cards monocromáticos, 2–3 colunas | |
| Lista editorial | Lista vertical, título Anton + meta | |
| Destaque + grid | 1 destaque grande no topo + grid | ✓ |

### Q2 — Como funciona o filtro por categoria?
| Option | Description | Selected |
|--------|-------------|----------|
| Rotas por categoria | /blog/categoria/[slug] indexáveis (melhor SEO) | ✓ |
| Pills client-side | Filtro in-page, 1 rota | |
| Pills + ?cat= (híbrido) | Filtro client-side com URL compartilhável | |

**User's choice:** **Destaque + grid** (flag `featured`) · **rotas por categoria** `/blog/categoria/[slug]`.
**Notes:** Filtro por rotas escolhido pelo ganho de SEO de topo de funil (5 páginas indexáveis).

---

## Lançamento & CTA

### Q1 — Com qual conteúdo o blog entra no ar?
| Option | Description | Selected |
|--------|-------------|----------|
| Stubs de exemplo (executor) | 4–6 artigos-exemplo cobrindo as 4 categorias | ✓ |
| Você fornece reais | Usuário passa artigos reais agora | |
| Mínimo (1–2 stubs) | Só pra rota renderizar | |

### Q2 — Pra onde aponta o CTA do fim do artigo (BLOG-10)?
| Option | Description | Selected |
|--------|-------------|----------|
| WhatsApp consultoria | CTA único e uniforme | ✓ |
| Varia por categoria (funil) | CTA leve vs consultoria por pilar | |
| Comunidade Dino Team | CTA pra entrada na comunidade | |

**User's choice:** **Stubs de exemplo** escritos pelo executor · CTA **WhatsApp consultoria** uniforme.
**Notes:** `export/conteudos/blog/` e `site/content/blog/` vazios; stubs desbloqueiam a fase sem o usuário escrever agora.

---

## Site URL (SEO-01)

### Q1 — Qual a URL base do site (NEXT_PUBLIC_SITE_URL)?
| Option | Description | Selected |
|--------|-------------|----------|
| Manter dinoteam.vercel.app | Move o hardcode pra env; troca depois | ✓ |
| Tenho domínio real | Usar domínio definitivo agora | |

**User's choice:** **Manter `dinoteam.vercel.app`** via env `NEXT_PUBLIC_SITE_URL` (com fallback); swap de domínio depois.

---

## Claude's Discretion

- Abordagem de render MDX (content-layer + smoke test Turbopack) — pesquisador resolve.
- Frontmatter parser, validação zod, lib de reading-time, mecânica do TOC, lógica de relacionados, share nativo, design do og:image único — executor decide dentro das travas de marca.

## Deferred Ideas

- CTA variável por categoria (lógica de funil) — descartado no v1.
- 5ª categoria "Resultados" — cortada.
- Mapeamento categoria→pilar — Phase 6.
- Captura de e-mail — Phase 5. og:image dinâmico — v2 (BLOG-12). Busca — v2 (BLOG-13). Domínio real — pós-milestone.
