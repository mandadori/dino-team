---
versao: 4
ultima_atualizacao: 2026-06-08
---

# Cérebro de Marca — Schema (`memory/`)

Memória viva compartilhada do sistema Dino Team. **"A memória é a integração":** as funções não se coordenam entre si — leem e escrevem o mesmo estado. Markdown + frontmatter YAML. Lido por qualquer função; escrito apenas pelo owner declarado.

## Princípios

- **Dono único por slice.** Só o owner escreve; outros propõem via output e o owner consolida.
- **Cérebro ≠ insumo.** `memory/pesquisa/` é pesquisa bruta (insumo transitório). O resto é a "verdade" durável.
- **YAGNI de slice.** Uma fatia só nasce quando uma função a lê de verdade. Este schema **declara** a estrutura completa; declarar ≠ construir.
- **Write-back é de 1ª classe.** Produzir uma peça atualiza o cérebro: uma linha no `registro-angulos.md` (ângulo + verdade + pilar + descanso). Recebe write-back de **múltiplos canais** (`instagram`, `blog`, `email`, `comunidade`) via `node scripts/memory/append_registro_angulos.js --canal <canal> ...`. É a demonstração direta de "a memória é a integração". A performance (`metricas.md`) é joinada por `slug` quando os coletores `fetch_*` existirem.
- **Versionado em git.** Toda mudança é commit.

## Slices

| Slice | Owner único | Conteúdo | Estado |
|---|---|---|---|
| `publico/` | `pesquisador-mercado` (Produto alimenta) | dores, objeções (com a fala do público embutida) | criado (Onda 1) |
| `mercado/` | `pesquisador-mercado` | `narrativa-de-mercado.md`, `tendencias/`, `concorrentes/` | ativo |
| `ramon/` | `arquivista` | contexto temporal/biográfico | ativo |
| `performance/` | `analista-performance` | `registro-angulos.md` (o que cada peça disse: ângulo + verdade + pilar + descanso), `metricas.md` (o que gerou — criado, alimentado por `fetch_*` no futuro), `provas-de-aluno.md` | ativo |
| `produto/` | `estrategista-produto` | `catalogo.md` (produtos vivos + status), `oportunidades.md` (hipóteses testáveis), `economia.md` (humano), `funcao-objetivo.md` (humano) | criado (setor Produto — Sub-projeto A) |
| `pesquisa/` | `pesquisador-mercado` | pesquisa bruta datada (insumo) | ativo |

> O slice `narrativas/` (livro-razão de verdades) foi **dissolvido em 2026-06**: ângulo e verdade são o mesmo tipo de dado (o que a peça disse) e passaram a viver juntos em `performance/registro-angulos.md`, sob `analista-performance`. O `estrategista-mercado` deixou de ter slice durável — virou leitor (lê o registro para saturação/equilíbrio).

**Não é cérebro:** `orquestracao/politicas/` (governança/config), `memory/mercado/_diretivas.md` → config de pesquisa.

## Setor Produto — integrado pelo cérebro

O setor de Produto tem **slice próprio** (`produto/`, owner `estrategista-produto`) e
**lê** o resto do cérebro para decidir produto (`publico/` dores+objeções, `mercado/`
tendências, `performance/` saturação, `brand/` verdades). Integra com Marketing e
Inteligência **pela memória**, nunca por chamada direta:

| Direção | Como |
|---|---|
| Produto → Inteligência | enfileira lacunas em `pesquisa/pedidos.md`; `pesquisador-mercado` atende (loop fechado) |
| Produto → Marketing | escreve a oferta em `produto/catalogo.md`; `estrategista-mercado` lê para promover |
| Inteligência → Produto | Produto lê `mercado/` + `publico/` na descoberta |

> A skill embrionária `/sinal-consultoria` (canal manual de sinais de consultoria) foi
> **removida** — superada pelo setor de Produto. A **voz direta dos ~400 alunos**
> (dores/objeções/provas reais da base) entra no **Sub-projeto B**, dormente até a
> plataforma conectar.

## Slices declarados, build depois (canais de performance)

- `performance/metricas.md` já existe (vazio) como ponto único de concentração. Os recortes `performance/{social-media,ads,email,funil-site}/` nascem só quando o volume de métrica real de cada canal justificar.

### Sub-projeto B — Experiência do Cliente / loop operacional (declarado, dormente)

Declarado para não virar amnésia; **não construir** até o gatilho.

| Capacidade | O que é | Gatilho |
|---|---|---|
| Loop operacional / CX | telemetria de uso, retenção, tempo médio, engajamento, churn, jornada | acesso à plataforma + API |
| Economia unitária real | custo/margem reais alimentando `produto/economia.md` | receita/custo conectados |
| Voz direta do cliente | dores/objeções/provas reais dos ~400 alunos na descoberta (inclui `performance/provas-de-aluno.md`) | plataforma conecta / canal estruturado de captura |

Sem coletor, sem agente, sem skill agora — só esta declaração.

## Frontmatter padrão dos arquivos do cérebro

```yaml
---
slice: <publico | mercado | ramon | performance | pesquisa | produto>
owner: <agente owner>
ultima_atualizacao: YYYY-MM-DD
versao: 1
---
```

## Ownership

Owner **escreve**; outros **leem e propõem**. Mudança de owner exige atualizar este schema + commit.
