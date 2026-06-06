---
versao: 2
ultima_atualizacao: 2026-06-06
---

# Cérebro de Marca — Schema (`memory/`)

Memória viva compartilhada do sistema Dino Team. **"A memória é a integração":** as funções não se coordenam entre si — leem e escrevem o mesmo estado. Markdown + frontmatter YAML. Lido por qualquer função; escrito apenas pelo owner declarado.

## Princípios

- **Dono único por slice.** Só o owner escreve; outros propõem via output e o owner consolida.
- **Cérebro ≠ insumo.** `memory/pesquisa/` é pesquisa bruta (insumo transitório). O resto é a "verdade" durável.
- **YAGNI de slice.** Uma fatia só nasce quando uma função a lê de verdade. Este schema **declara** a estrutura completa; declarar ≠ construir.
- **Write-back é de 1ª classe.** Produzir uma peça atualiza o cérebro (livro-razão de mensagens, ângulos).
- **Versionado em git.** Toda mudança é commit.

## Slices

| Slice | Owner único | Conteúdo | Estado |
|---|---|---|---|
| `narrativas/` | `estrategista-narrativa` | arcos ativos, roadmap de crença, livro-razão de mensagens | criado (Onda 1); populado (Onda 2) |
| `publico/` | `pesquisador-mercado` (Produto alimenta) | dores, objeções (com a fala do público embutida) | criado (Onda 1) |
| `mercado/` | `pesquisador-mercado` | `narrativa-de-mercado.md`, `tendencias/`, `concorrentes/` | ativo |
| `ramon/` | `arquivista` | contexto temporal/biográfico | ativo |
| `performance/` | `analista-performance` | `angulos-queimados.md`; métricas por canal (futuro) | ativo (parcial) |
| `pesquisa/` | `pesquisador-mercado` | pesquisa bruta datada (insumo) | ativo |

**Não é cérebro:** `orquestracao/politicas/` (governança/config), `memory/mercado/_diretivas.md` → config de pesquisa (mover pra junto da skill `/pesquisar-mercado` na Onda 3).

## Slices declarados, build depois (Produto / canais)

- `publico/` é alimentado por sinais reais da consultoria (Onda 6+).
- `performance/{social-media,ads,email,funil-site}/` quando publicação real gerar métrica (Onda 5+).

## Frontmatter padrão dos arquivos do cérebro

```yaml
---
slice: <narrativas | publico | mercado | ramon | performance | pesquisa>
owner: <agente owner>
ultima_atualizacao: YYYY-MM-DD
versao: 1
---
```

## Ownership

Owner **escreve**; outros **leem e propõem**. Mudança de owner exige atualizar este schema + commit.
