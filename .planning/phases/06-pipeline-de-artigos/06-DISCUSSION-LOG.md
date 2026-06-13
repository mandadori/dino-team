# Phase 6: Pipeline de Artigos - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-13
**Phase:** 06-pipeline-de-artigos
**Areas discussed:** Arquitetura (rewrite vs bridge), Mapa de frontmatter, Imagem de capa, Gate de build + slug + commit

---

## Arquitetura: rewrite vs bridge

### Modelo de integração
| Option | Description | Selected |
|--------|-------------|----------|
| Bridge: passo final 'promover ao site' (Rec.) | novo-artigo mantém draft em export/ + passo final escreve site/content/blog/<slug>.mdx | ✓ |
| Rewrite: escrever direto no site | passo de escrita emite frontmatter do site direto; abandona o draft | |
| Skill separada /publicar-artigo | novo-artigo intacto; nova skill promove (2 comandos) | |

### Mecanismo de montagem/escrita
| Option | Description | Selected |
|--------|-------------|----------|
| Script determinístico Node (Rec.) | script recebe valores resolvidos, monta+valida+escreve | ✓ |
| Inline na skill (LLM escreve) | passo da skill escreve o MDX do site inline | |

**User's choice:** Bridge (passo final) + script determinístico.
**Notes:** Preserva o artefato draft e o princípio mínimo-disruptivo; determinismo garante validade na 1ª tentativa.

---

## Mapa de frontmatter

### Origem da category
| Option | Description | Selected |
|--------|-------------|----------|
| Escolher direto no briefing (Rec.) | category = campo de 1ª classe entre os 4 do site | ✓ |
| Mapear pilar→category | derivar via tabela (sem 1:1, fallback frágil) | |

### Author key
| Option | Description | Selected |
|--------|-------------|----------|
| ramon-dino default, escolhível (Rec.) | default Ramon, trocável p/ Mauri | |
| Sempre perguntar no briefing | sem default; escolha explícita entre os dois | ✓ |

### Validação 1ª tentativa
| Option | Description | Selected |
|--------|-------------|----------|
| Validar no script antes de escrever (Rec.) | espelha o zod do site; falha cedo | ✓ |
| Confiar no build como validação única | escrever e deixar o build pegar | |

**User's choice:** category escolhida no briefing; author SEMPRE perguntado; validação zod no script antes de escrever.
**Notes:** Author sem default — escolha explícita por artigo.

---

## Imagem de capa (cover)

| Option | Description | Selected |
|--------|-------------|----------|
| Default on-brand compartilhado (Rec.) | capa default committed que existe; swap real por-slug depois | ✓ |
| Pedir o cover no briefing | skill pede caminho/arquivo a cada artigo | |
| Puxar do banco de imagens (Drive) | integrar arquivista/Drive (escopo maior) | |

**User's choice:** Default on-brand compartilhado (committed, existe).
**Notes:** Criar site/public/blog/covers/ + o default nesta fase; usuário troca pela real depois.

---

## Gate de build + slug + commit

### Gate
| Option | Description | Selected |
|--------|-------------|----------|
| next build completo (Rec.) | gate autoritativo, pega MDX/JSX, casa com 'lint+build' | ✓ |
| Só validar o loader (rápido) | só zod no arquivo novo; não pega compilação | |

### Colisão de slug
| Option | Description | Selected |
|--------|-------------|----------|
| Checar cedo no briefing (Rec.) | varrer site/content/blog/ antes de escrever | ✓ |
| Deixar pro build/loader | confiar no build (slug duplicado sombreia em silêncio) | |

### Versionamento
| Option | Description | Selected |
|--------|-------------|----------|
| Não commitar — deixar pro humano (Rec.) | skill escreve; humano commita | |
| Skill commita o .mdx (+ cover) | git add+commit após gate + build verde | ✓ |

**User's choice:** gate = next build completo; slug checado cedo no briefing; a skill COMMITA o .mdx (+ cover).
**Notes:** Pré-validação zod do script falha cedo; build é a palavra final.

---

## Claude's Discretion

- Local/nome do script de promoção; mensagem de commit.
- Manter/dropar verdade_servida/pilar no frontmatter do site (zod ignora).
- Defaults date=hoje, featured=false.
- Preservar o write-back ao registro-angulos (passo 7 atual).
- Arte da capa default (placeholder; real depois).

## Deferred Ideas

- Lote / multi-artigo.
- Capa via banco de imagens (Drive) / geração de imagem.
- Imagem de capa real por-slug (content-ops posterior).
- Mapeamento automático pilar→category (descartado).
- Imagens inline no corpo.
