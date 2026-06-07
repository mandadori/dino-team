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
- **Write-back é de 1ª classe.** Produzir uma peça atualiza o cérebro (livro-razão de mensagens, ângulos). O livro-razão recebe write-back de **múltiplos canais** (`instagram`, `blog`, `email`, `comunidade`) via `node scripts/memory/append_livro_razao.js --canal <canal>`. É a demonstração direta de "a memória é a integração".
- **Versionado em git.** Toda mudança é commit.

## Slices

| Slice | Owner único | Conteúdo | Estado |
|---|---|---|---|
| `narrativas/` | `estrategista-narrativa` | arcos ativos, roadmap de crença, livro-razão de mensagens | criado (Onda 1); populado (Onda 2); write-back multicanal (Onda 4) |
| `publico/` | `pesquisador-mercado` (Produto alimenta) | dores, objeções (com a fala do público embutida) | criado (Onda 1) |
| `mercado/` | `pesquisador-mercado` | `narrativa-de-mercado.md`, `tendencias/`, `concorrentes/` | ativo |
| `ramon/` | `arquivista` | contexto temporal/biográfico | ativo |
| `performance/` | `analista-performance` | `angulos-queimados.md`; métricas por canal (futuro) | ativo (parcial) |
| `pesquisa/` | `pesquisador-mercado` | pesquisa bruta datada (insumo) | ativo |

**Não é cérebro:** `orquestracao/politicas/` (governança/config), `memory/mercado/_diretivas.md` → config de pesquisa (mover pra junto da skill `/pesquisar-mercado` na Onda 3).

## Integração Produto pelo cérebro (Onda 6)

**Produto não tem slice próprio** — escreve nos slices existentes via os owners declarados:

| Produto escreve em | Owner que consolida | Via | O que escreve |
|---|---|---|---|
| `publico/dores.md` | `pesquisador-mercado` | `/sinal-consultoria` | dores reais de aluno (com fala crua) |
| `publico/objecoes.md` | `pesquisador-mercado` | `/sinal-consultoria` | objeções reais ouvidas na consultoria |
| `performance/provas-de-aluno.md` | `analista-performance` | `/sinal-consultoria` | resultados reais de aluno (prova/Transformação) |

**Produto lê** `publico/` + `performance/` + `memory/narrativas/` para priorizar o roadmap de produto — sem acoplar com Marketing. A memória é a integração.

**Roadmap de produto** — declarado, build depois (YAGNI): nasce como arquivo quando o Produto for efetivamente priorizado no sistema. Não criar arquivo vazio agora.

**Fluxo de um sinal real:** consultor (ou `treinador` propõe) → `/sinal-consultoria` classifica + confirma com humano → aciona owner → owner grava no slice → Marketing lê do slice (sem saber da fonte). Dono único preservado; autonomia `humano` conforme `orquestracao/governanca.yaml`.

## Slices declarados, build depois (canais de performance)

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
