---
versao: 1
ultima_atualizacao: 2026-05-23
---

# Banco de Dados — Schema

Memória persistente compartilhada do sistema Dino Team. Markdown com frontmatter YAML. Lido por qualquer agente; escrito apenas pelo owner declarado.

## Princípios

- **Ownership único por slice.** Só o agente declarado owner escreve. Outros propõem via output e o owner consolida.
- **Versionado em git.** Toda mudança é commit.
- **Escala em markdown enquanto possível.** Migra para SQL apenas quando volume passar de ~100MB ou queries ficarem lentas (decisão do `keeper-banco`, agente futuro).
- **Leitura sob demanda.** Quem precisa, lê. Nada é carregado automaticamente.

## Slices ativos (v1)

| Slice | Caminho | Owner único | Conteúdo |
|---|---|---|---|
| **Ramon** | `dados/ramon/` | `arquivista` | Contexto temporal e biográfico do Ramon: cronograma, fase atual, princípios de treino, falas, conquistas, acervo visual. Fontes: o usuário via `/atualizar-ramon` **e** busca automática do próprio `arquivista` em fontes públicas (sempre com fonte citada e validação). Agentes nunca inventam. |
| **Mercado** | `dados/mercado/` | `pesquisador-mercado` | Pesquisa de mercado, concorrentes, tendências, vocabulário do público. Populado por pesquisas profundas. |
| **Performance** | `dados/performance/` | `analista-performance` | Métricas de canais (social media, ads, email, funil-site), ângulos queimados, padrões identificados. **Onda 3 só popula `angulos-queimados.md`; sub-slices por canal (`performance/social-media/`, `performance/ads/`, etc.) entram quando publicação real existir (Onda 5+), sob o mesmo owner ou analistas por canal derivados dele.** |

## Arquivos populados em v1 (Onda 3)

```
dados/
├── _schema.md                           ← este arquivo
├── ramon/
│   └── contexto.md                      ← arquivo único: fase atual, cronograma, princípios, falas, conquistas (seções). Usuário via /atualizar-ramon + auto-sync do archivist
├── mercado/
│   └── vocabulario-publico.md           ← derivado de brand/publico-alvo.md
└── performance/
    └── angulos-queimados.md             ← vazio em v1; cresce ao longo do uso
```

## Arquivos futuros (declarados, não criados em v1)

Conforme volume justificar:
- **Ramon:** o contexto vive num arquivo só (`ramon/contexto.md`) enquanto for enxuto. Só vira multi-arquivo (ex: `ramon/acervo-visual.md`) se uma vertente crescer a ponto de pesar o arquivo único.
- `mercado/tendencias/<YYYY-MM>.md`, `mercado/concorrentes/<slug>.md`, `mercado/hashtags-performando.md`
- `performance/social-media/<YYYY-MM>.md`, `performance/ads/<YYYY-MM>.md`, `performance/email/<YYYY-MM>.md`, `performance/funil-site/<YYYY-MM>.md`, `performance/padroes-identificados.md`

Criar apenas quando uma skill real for consumir.

## Regras de ownership

- Owner **único** por slice (ou por sub-slice quando explicitado, como em `performance/<canal>`).
- Owner **escreve**; outros **leem e propõem**.
- Proposta vira pull (manual ou via skill) feita pelo owner.
- Mudança de owner exige atualização deste schema + commit.

## Frontmatter padrão para arquivos do banco

Cada arquivo do banco deve ter no topo:

```yaml
---
slice: <ramon | mercado | performance>
owner: <nome do agente owner>
ultima_atualizacao: YYYY-MM-DD
versao: 1
---
```

## Migração futura

Se em algum momento for migrar para SQL/outro armazenamento, este schema é o ponto de entrada da migração — declara a estrutura semântica que o novo armazenamento precisa replicar.
