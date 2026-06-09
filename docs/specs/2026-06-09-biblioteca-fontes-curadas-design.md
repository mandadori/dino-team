# Biblioteca de Fontes Curadas — Design

> Data: 2026-06-09
> Status: spec aprovada (design) — pendente plano de implementação
> Base: `dino-studio-editor` @ 3c5a9e1

## Problema

O `pesquisador-mercado` sabe **onde buscar no mercado** (config em `memory/mercado/_diretivas.md`) e **o que o nicho diz** (slice `memory/mercado/`), mas não tem memória durável de **de onde a marca tira profundidade** — os livros, autores, criadores e estudos específicos que sustentam a voz da Dino Team. Hoje isso vive numa tabela **estática e genérica** dentro de `/pesquisar-tema` ("Perfis de fonte por pilar": *Mentalidade → livros de estoicismo*), sem nomes, trechos ou páginas concretas, e não aprendível.

Queremos que o usuário possa **ensinar** ao sistema, por conversa, quais fontes usar por pilar/tema — e que essa biblioteca **se enriqueça** com o que o mercado valida e (no futuro) com o que performa — **sem inflar o contexto** e **convergindo com a inteligência de mercado**, não competindo com ela.

Reframe do "treinar um agente": nesta arquitetura agentes não têm pesos. Treinar = dar ao agente um **slice durável de memória que ele lê**, ensinado por uma **skill de entrevista** (precedentes: `/afinar-tom-de-voz`, `/atualizar-ramon`).

## Decisões (e por quê)

| Decisão | Escolha | Por quê |
|---|---|---|
| Formato | Biblioteca curada de fontes + skill de entrevista | "Treinar" = memória durável lida pelo agente, não pesos |
| Atualização | Você ensina + agente propõe + loop de performance (futuro) | Auto-aprendizado com você no controle; núcleo nunca muta sozinho |
| Estrutura | Índice leve + fichas sob demanda | Anti-inflação por design (mesmo padrão do banco de imagens / `MEMORY.md`) |
| Dono | Estende `pesquisador-mercado` (sem agente novo) | Princípio anti-diluição; ele já é dono de pesquisa+memória |
| Formato do índice | Markdown | Coerente com o cérebro ("Markdown + frontmatter YAML"), auditável |
| Gate de marca | Fichas **não** passam por `revisor-brand` | Fichas são insumo; a copy que as usa já é gated no `/novo-post` |

## Estrutura de dados — slice `memory/biblioteca/`

```
memory/biblioteca/
  _indice.md                      # índice leve — 1 linha/fonte, SEMPRE lido
  fontes/
    <slug>.md                     # ficha funda — lida SÓ quando selecionada
```

**Princípio anti-inflação:** a biblioteca **nunca** guarda o conteúdo integral de um livro/estudo. Guarda **ponteiros + um punhado de trechos-chave curados**. Um livro de 300 páginas vira uma ficha de poucas centenas de palavras. Por post, o contexto carregado = `_indice.md` (minúsculo) + 1–2 fichas selecionadas. Nunca a biblioteca toda, nunca a obra.

### `_indice.md` (sempre lido, barato)

Frontmatter padrão do cérebro (`slice: biblioteca`, `owner: pesquisador-mercado`, `ultima_atualizacao`, `versao`) + tabela:

| Coluna | Conteúdo |
|---|---|
| `slug` | identificador kebab-case (= nome do arquivo da ficha) |
| `nome` | nome legível (ex: "Meditações — Marco Aurélio") |
| `tipo` | `livro` \| `autor` \| `criador` \| `estudo` \| `artigo` \| `podcast` |
| `pilares` | um ou mais pilares de `brand/pilares-conteudo.md` |
| `use para` | 1 linha — para que ângulos/temas serve |
| `status` | `nucleo` (você aprovou) \| `candidato` (proposto, aguarda aprovação) |

O agente filtra esta tabela por **pilar + palavras-chave do tema** e seleciona 1–2 slugs antes de abrir qualquer ficha.

### Ficha `fontes/<slug>.md` (lida sob demanda)

```yaml
---
slice: biblioteca
owner: pesquisador-mercado
slug: meditacoes-marco-aurelio
tipo: livro
pilares: [mentalidade]
status: nucleo            # nucleo | candidato
proveniencia: usuario     # usuario | scouting:<YYYY-MM-DD> | performance:<YYYY-MM-DD>
ultima_atualizacao: 2026-06-09
versao: 1
---
```

Corpo:
- **Use para:** ângulos/temas que esta fonte sustenta (1–2 linhas).
- **Ideias-chave:** 3–5 bullets do que a fonte defende.
- **Trechos:** 3–5 citações/frases curadas, **cada uma com página/fonte verificável**.
- **Como a copy riffa:** 1–2 linhas — como transformar em copy da marca (sem cópia literal).
- **Off-limits:** o que evitar (ex: Mentalidade não vira motivação vazia; a ideia tem que conectar à prática).

## Como o usuário ensina — skill `/curar-fontes`

Skill de entrevista, dona da escrita do slice via `pesquisador-mercado` (owner).

- **Modo semeadura (default):** varre pilar a pilar — "Pro Mentalidade, em que livros/autores a marca se apoia? Quais trechos valem? Como a copy usa?" — e grava fichas `status: nucleo`. Atualiza `_indice.md`.
- **Modo reabrir:** adicionar/editar uma fonte específica, ou **promover `candidato` → `nucleo`** (revisar candidatas propostas pelo agente).

Sintaxe (proposta): `/curar-fontes [<slug-ou-fonte>] [--pilar <pilar>]`. Sem argumento → semeadura/triagem; com argumento → reabrir aquela fonte.

## Captura no fluxo do post — `/novo-post`

Quando a copy de um post se apoiar numa fonte ainda **não fichada**, ao fim do fluxo o `/novo-post` oferece: *"Salvar [fonte] na biblioteca como ficha do pilar X?"*. Se sim, cria a ficha (`proveniencia: usuario`) e adiciona ao índice. Alimentação orgânica, sem sessão longa. É opcional e não bloqueia a publicação.

## Agente propõe — enriquecimento via mercado

No **scouting mensal (Fase A)** e no **deep research** (`/pesquisar-tema`), quando o `pesquisador-mercado` topa uma fonte **fortemente citada** no nicho/público (livro recorrente entre fontes, criador com ângulo repetido, autor que o público referencia), ele:

1. Adiciona ao `_indice.md` como `status: candidato`.
2. Cria uma ficha-stub (`proveniencia: scouting:<data>`) com o que observou + a fonte do sinal.
3. Lista "novas fontes candidatas — aprovar?" no output.

O usuário promove `candidato → nucleo` via `/curar-fontes`. **O núcleo curado pelo usuário nunca muta sozinho.**

## Integração na produção

- **`/pesquisar-tema` (Passo 2 / deep research):** antes do WebSearch, o `pesquisador-mercado` consulta a biblioteca (fichas do pilar/tema) como **1ª parada**; a web preenche lacunas. A tabela estática **"Perfis de fonte por pilar"** passa a ser o *fallback de tipo-de-fonte* (quando a biblioteca não tem match para o pilar) e instrui "consulte a biblioteca primeiro". A pesquisa web é **reduzida e focada**, não substituída.
- **`/novo-post` (passo de copy):** os trechos das fichas selecionadas entram como **matéria-prima** do passo de copy, respeitando o off-limits do pilar.

## Convergência com a inteligência de mercado

Dois eixos que se **encontram**, não competem:

| Eixo | Decide | Vem de |
|---|---|---|
| Mercado/público | *quando* + *qual* ângulo (timing, emoção, crença em movimento, saturação) | `memory/mercado/` + `publico/` + `registro-angulos` |
| Biblioteca | *com o quê* sustentar (autoridade, profundidade, trecho) | `memory/biblioteca/` |

O scouting que **dirige o ângulo** também **alimenta a biblioteca** (propõe candidatas). A biblioteca é distinta de: `memory/mercado/` (o que o nicho diz), `_diretivas.md` (config de *onde* buscar), `memory/pesquisa/` (insumo bruto transitório).

## Horizonte (declarado, não construído)

**Loop de performance:** quando `scripts/integrations/fetch_*.js` popular `memory/performance/metricas.md`, aprende quais fontes correlacionam com engajamento e prioriza fichas na pesquisa. **Gatilho:** conta Instagram/API conectada — coerente com o "Loop de resultado" já declarado no CLAUDE.md.

**Hook fino agora (opcional, baixo custo):** o write-back do `registro-angulos` pode registrar o(s) `slug` de fonte usados no post (campo `--fontes`), de modo que a correlação futura tenha o dado pronto. Registra-se o dado; **não** se constrói a análise agora.

## Fora de escopo (YAGNI)

- Não armazenar texto integral de livros/estudos (só fichas curadas).
- Não construir o loop de performance agora (Horizonte; gatilho = API).
- Não criar agente novo (estende `pesquisador-mercado`).
- Não duplicar `memory/mercado/`, `_diretivas.md` nem `memory/pesquisa/`.
- Captura no post e proposta de candidatas nunca bloqueiam publicação.

## Arquivos afetados (para o plano)

**Novos:**
- `memory/biblioteca/_indice.md` — índice semente (frontmatter + tabela vazia).
- `memory/biblioteca/fontes/.gitkeep` (ou primeira ficha de exemplo).
- `.claude/skills/curar-fontes/SKILL.md` — skill de entrevista.

**Editados:**
- `memory/_schema.md` — registrar slice `biblioteca/` (owner `pesquisador-mercado`) na tabela de slices + frontmatter padrão.
- `.claude/agents/pesquisador-mercado.md` — ownership do novo slice; ler `_indice.md` no deep research e selecionar fichas; propor candidatas no scouting (Fase A) e no deep research.
- `.claude/skills/pesquisar-tema/SKILL.md` — consultar a biblioteca antes da web; "Perfis de fonte por pilar" vira fallback que aponta pra biblioteca.
- `.claude/skills/novo-post/SKILL.md` — injetar trechos das fichas no passo de copy; oferecer captura de fonte nova ao fim.
- `CLAUDE.md` — listar `/curar-fontes`, o slice `memory/biblioteca/` e (se adotado) o hook `--fontes` no registro-angulos.
- (opcional / hook) `scripts/memory/append_registro_angulos.js` + `.claude/agents/analista-performance.md` — aceitar/registrar `--fontes` no `registro-angulos.md`.

## Critérios de aceitação

1. Existe `memory/biblioteca/_indice.md` com frontmatter do cérebro e tabela (vazia ou semente).
2. `memory/_schema.md` lista o slice `biblioteca/` com owner `pesquisador-mercado`.
3. `/curar-fontes` cria/edita fichas e atualiza o índice; promove `candidato → nucleo`.
4. `/pesquisar-tema` consulta a biblioteca como 1ª parada antes da web, filtrando por pilar/tema sem carregar fichas irrelevantes.
5. `/novo-post` usa trechos das fichas no passo de copy e oferece captura de fonte nova ao fim.
6. O scouting (Fase A) e o deep research propõem fontes `candidato` sem promovê-las sozinhos.
7. Nenhum fluxo carrega a biblioteca inteira nem conteúdo integral de obras — só índice + 1–2 fichas por post.
8. Documentação (`CLAUDE.md`, `memory/_schema.md`) reflete o slice e a skill.
