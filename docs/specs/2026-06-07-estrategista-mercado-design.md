# Estrategista de mercado: marca de 2 velocidades (Peça 1)

> Spec de design — 2026-06-07
> Primeira de 4 peças de um redesign da automação. Esta peça troca a governança de narrativa por um modelo de **duas velocidades**: a verdade atemporal (lento, mora no `brand/`) + a leitura do momento (rápido, mercado + emoção do público). Peças 2 (pesquisa universal por tipo), 3 (auto-execução por runner) e 4 (limpeza de cadência/drift) ficam fora.

---

## Motivação

Auditoria do pipeline de automação revelou três coisas:

1. **Falta a camada de estratégia.** Entre o `pesquisador-mercado` (coleta matéria-prima — "não decide o que a marca deve dizer") e a produção (executa), ninguém **interpreta** o sinal de mercado em jogada. Hoje a `/planejar-pauta-semanal` improvisa isso inline, sem método e sem dono.

2. **O arco trimestral é máquina a mais.** O `/ciclo-de-direcao` + `estrategista-narrativa` + `narrativas/ativas.md` + `roadmap-crenca.md` governam uma "campanha de crença" de 3 meses. Mas a Dino Team **já tem um conjunto pequeno e afiado de verdades** no `brand/` — a conexão entre posts emerge do conjunto fixo + voz consistente, não precisa de campanha prescrita. Além disso, o `estrategista-narrativa` **nunca teve autonomia sobre o arco** (seu contrato: "ativar/aposentar arco exige aprovação humana") — seu valor real era rascunhar proposta + detectar saturação + checar coerência, tudo portável.

3. **O ritmo está invertido.** A crença lenta era re-decidida mensalmente (cron) enquanto a reatividade do público — que é rápida — não tinha dono. O mercado nunca foi tão variável; a marca precisa **ler a oscilação emocional do público (rápido) e responder com a verdade (lento)**, não o contrário.

## A visão: duas velocidades

```
LENTO = A VERDADE        já existe em brand/. Verdades atemporais da marca
                         (direção > esforço · consistência vence · disciplina ·
                         resultado vem de execução). A marca é dona da verdade —
                         não a re-decide. Sem arco. Sem ciclo-de-direcao. Sem roadmap-crença.

RÁPIDO = O MOMENTO       pesquisador-mercado  → crença do mercado + emoção do público
                                                (leve/semanal; deep mensal p/ concorrentes)
                         estrategista-mercado → entende o significado do momento →
                                                escolhe a verdade que responde →
                                                equilibra pelo livro-razão (não repetir; cobrir o conjunto)

PONTE = PRODUÇÃO         /planejar-pauta-semanal (⏸ humano ajusta no modo manual)
                         → produção (peças 2/3 — fora desta peça)
```

**Princípio nuclear da peça:** a verdade é fixa; o momento é variável. A oscilação emocional do público é o **gatilho**; a verdade atemporal é a **resposta**. Aparecer no pico emocional dizendo o que a marca sempre diz **reforça** o branding — é o oposto de trend-chasing.

> Exemplo concreto (do brainstorm): notícia impactante agita o público alienado → o estrategista entende o significado por trás → propõe uma jogada ancorada numa verdade universal e atemporal da marca.

## Escopo desta peça

**Dentro:**
- Criar o agente `estrategista-mercado`.
- Dar ao `pesquisador-mercado` uma dimensão de **sensing leve** (emoção do público + crença de mercado em movimento) no ritmo semanal, distinta do deep mensal.
- Reescrever `/planejar-pauta-semanal` para passar pelo estrategista e **pausar para o humano no modo manual**.
- Demolir o arco: deletar `/ciclo-de-direcao`, `estrategista-narrativa`, `ativas.md`, `roadmap-crenca.md`; repurpor o livro-razão (de "narrativa/arco" para "verdade/princípio").
- Religar todos os pontos de toque (CLAUDE.md, schema, governança, rotas, README, `pesquisar-mercado`, `novo-post`).

**Fora (outras peças):**
- **Peça 2** — `/pesquisar-tema` universal e type-aware (fonte por pilar; research em todo post). Hoje só dispara em ângulo informacional.
- **Peça 3** — runner de auto-execução que dispara `/novo-post` por data prevista (publicação segue gated por humano).
- **Peça 4** — limpeza de cadência/cron e correção de drift residual.

## Decisões travadas no brainstorm

| Decisão | Resolução |
|---|---|
| Camada de estratégia | Agente novo `estrategista-mercado` (não expandir o existente). |
| Arco trimestral | **Eliminado.** Verdade mora no `brand/`; conexão emerge do conjunto fixo + livro-razão. |
| `estrategista-narrativa` | **Eliminado.** Funções portáveis migram pro `estrategista-mercado`; net zero agentes. |
| `/ciclo-de-direcao` | **Eliminado** como skill. (A decisão de "qual verdade enfatizar" não existe mais como ritual — é contínua e emergente.) |
| Nível de autonomia da corrente | Cria sozinho até o post pronto; **humano libera a publicação** (afeta peça 3; aqui só a pausa de pauta no modo manual). |
| Reatividade | = oscilação emocional do público + crença de mercado, **não** trend-chasing. |
| Profundidade da pesquisa | Semanal = leve/sentimento; deep durável = mensal; temática = por post (peça 2). "Deep toda semana" é desperdício. |
| Web do estrategista | **Não tem.** Pesquisador coleta; estrategista interpreta (fronteira limpa do blackboard). |

---

## Mudança 1 — Agente `estrategista-mercado`

Novo arquivo `.claude/agents/estrategista-mercado.md`. Segue o padrão de contrato do projeto (Contexto que carrego / Ownership / Princípios / Tarefas / Recebo / Entrego com schema rígido / Orçamento / Anti-padrões / Input incompleto).

**Função:** ler a crença do mercado e a emoção do público (rápido) e escolher qual verdade atemporal da marca responde ao momento (lento), equilibrando pelas verdades já ditas no livro-razão. **Não** produz copy nem decide pauta sozinho — **propõe** as jogadas; a skill orquestra e o humano ajusta no modo manual.

**Tools:** `Read, Write, Edit, Glob, Grep` (sem WebSearch — o pesquisador alimenta).

**Contexto que carrego (auto-lido):**
- `brand/brand-book.md` — **o conjunto de verdades** atemporais da marca (ver §"Conjunto de verdades").
- `brand/pilares-conteudo.md` — eixos temáticos válidos.
- `brand/tom-de-voz.md` — registro, pra propor ângulo já no tom.
- `brand/publico-alvo.md` — quem é o leitor.

**Lidos sob demanda (quando a tarefa apontar):**
- `memory/publico/dores.md` + `objecoes.md` — emoção/dor crua do público.
- `memory/mercado/tendencias/<YYYY-MM>.md` — crença/discurso do mercado no período.
- `memory/mercado/narrativa-de-mercado.md` — discurso dominante (pedra de amolar).
- `memory/performance/angulos-queimados.md` — o que precisa descansar.
- `memory/narrativas/livro-razao.md` — quais verdades já foram ditas (equilíbrio + saturação).

**Ownership:**
- Passa a ser **owner do slice `memory/narrativas/`** (que após a peça contém só `livro-razao.md` + `_formato.md`). **Lê** o livro-razão para equilíbrio/saturação; **não** escreve nele à mão (append é do script `append_livro_razao.js`).
- A "leitura estratégica da semana" é **efêmera** → grava em `campanhas/<semana>/` (não cria slice durável — YAGNI).

**Princípios da especialidade:**
- **A verdade é fixa; o momento é variável.** Nunca invente uma "nova verdade" — escolha entre as verdades declaradas da marca a que responde ao momento.
- **Aproveitar a emoção, não persegui-la.** Oscilação emocional do público = gatilho; verdade atemporal = resposta.
- **Equilíbrio, não repetição.** Lê o livro-razão; evita martelar a mesma verdade; cobre o conjunto ao longo do tempo. Conexão emerge do conjunto fixo + voz.
- **Saturação é dado.** Conta no livro-razão, não intuição.
- **Marca como guard-rail.** Toda jogada cabe num pilar **e** responde com uma verdade declarada. Sem sustentação no cérebro (emoção/dor real + sinal de mercado) → recusa.

**Tarefas:**
1. **`jogadas-da-semana`** — dado o sensing do pesquisador (emoção + crença de mercado), ângulos-queimados e livro-razão, propor **N jogadas**. Para cada uma: ângulo (o momento/emoção que dispara) + verdade (o princípio da marca que responde) + pilar + formato/canal sugerido + sustentação. Equilibrado pelo livro-razão. Inline.
2. **`coerencia-verdade`** — dada uma lista de ângulos/briefings (ex.: temas que o humano ajustou no modo manual), classificar cada um: `serve <verdade>` | `off-brand` | `contradiz <verdade>`. Gate de coerência em **tempo de planejamento** (barato, antes de produzir) — distinto do gate final do `revisor-brand` no post pronto. Inline.

**Recebo:**
- `Tarefa:` `jogadas-da-semana` | `coerencia-verdade`.
- `Inputs:` sensing do pesquisador (caminho/inline) + N + janela da semana (tarefa 1); lista de ângulos (tarefa 2).

Sem `Tarefa`, devolve `INPUT_INSUFICIENTE — <o que falta>`.

**Entrego:**

`jogadas-da-semana` — inline rígido:
```
<jogadas>
<jogada n=1 angulo="<momento/emoção que dispara>" verdade="<princípio da marca que responde>" pilar="<X>" formato="<sugerido>" canal="<sugerido>" sustentacao="<emoção/sinal observado — fonte>" />
... N, equilibradas (sem martelar a mesma verdade) ...
equilibrio: <distribuição de verdades nesta leva + alerta se concentrou demais ou repetiu verdade saturada no livro-razão>
</jogadas>
```

`coerencia-verdade` — inline rígido:
```
<coerencia>
<item ref="<slug/ângulo>" resultado="serve <verdade> | off-brand | contradiz <verdade>" />
...
alerta: <"X de N off-brand/contradizem — revisar antes de produzir" ou vazio>
</coerencia>
```

Sem preâmbulo fora do schema.

**Orçamento:** jogadas ~150–200 palavras; coerência ~50. Anti-padding: sem preâmbulo, sem eco do input, sem fecho.

**Anti-padrões:**
- Inventar uma "verdade" fora das declaradas no brand book.
- Perseguir tendência sem ancorar numa verdade (trend-chasing).
- Produzir copy / briefing / post (é da produção).
- Repetir verdade já saturada no livro-razão sem justificativa.
- Fazer WebSearch (o pesquisador coleta).
- Reescrever o livro-razão à mão (append é por script).

**Input incompleto:**
- `INPUT_INSUFICIENTE — <o que falta>`
- `SENSING_AUSENTE — sem o sensing do pesquisador para a semana`
- `SEM_SUSTENTACAO — <jogada sem emoção/dor real ou sinal de mercado>`
- `FORA_DE_PILAR — <ângulo que não cabe em pilar declarado>`

---

## Mudança 2 — `pesquisador-mercado` ganha sensing leve

O `pesquisador-mercado` já tem `scouting de mercado` (Fase A) e `seleção de candidatos` (Fase B). Esta peça **diferencia a profundidade da Fase A** e **acrescenta a dimensão emocional**:

- **Semanal (na pauta) = sensing leve.** Foco em (a) **oscilação emocional do público** (comentários, Reddit `r/fitness`/`r/bodybuilding`, reações a posts de concorrentes — onde a emoção aparece não-filtrada) e (b) **crença de mercado em movimento** nesta semana. Rápido, não deep.
- **Mensal = deep durável.** Concorrentes/estrutura (slow-changing) — permanece como está.

A chamada semanal grava `campanhas/<semana>/pesquisa-tendencias.md` **enriquecido** com duas seções novas: `## Emoção do público (oscilação da semana)` e `## Crença de mercado em movimento`. É essa saída que o `estrategista-mercado` lê. Aprendizado durável continua indo para `memory/mercado/` + `memory/publico/` pelas regras já existentes do agente.

Mudança concreta: ajuste no contrato do `pesquisador-mercado` (descrição do sensing leve + as duas seções) e no prompt do passo de pesquisa da `/planejar-pauta-semanal`. Sem novo agente, sem nova chamada de web (a chamada semanal já existe hoje).

## Mudança 3 — `/planejar-pauta-semanal` reescrita

Fluxo novo (substitui Passos 2–6 atuais):

| Passo | Ação | Recebe | Entrega |
|---|---|---|---|
| 1 | semana ativa (igual) | data | `YYYY-Www` + pasta |
| 2 | pesquisador → **sensing leve + emoção** | semana, N | `pesquisa-tendencias.md` enriquecido |
| 3 | **`estrategista-mercado` → `jogadas-da-semana`** | sensing ← 2, ângulos-queimados, livro-razão | N jogadas (ângulo+verdade+pilar+formato/canal) equilibradas |
| 3.⏸ | **⏸ humano (só modo manual)** ajusta/aprova os temas | jogadas ← 3 | jogadas confirmadas/ajustadas |
| 4 | briefings inline (×N) | jogadas ← 3.⏸ | N briefings com campo `verdade:` |
| 5 | **`estrategista-mercado` → `coerencia-verdade`** (revalida ajustes do humano) | ângulos ← 4 | serve/off-brand/contradiz por briefing |
| 6 | manifest + flags | briefings + coerência | campanha (`verdade` na tabela) |
| 7 | relatório (igual) | — | inline |

Diferenças-chave:
- **Remove** o Passo 2 atual (ler `narrativas/ativas.md` / arcos) — não há mais arco.
- **Remove** o aviso de "rode `/ciclo-de-direcao` antes" — a skill não é mais downstream de um ciclo.
- **Modo cron** = autônomo (sem a pausa 3.⏸). **Modo manual** = colaborativo (pausa 3.⏸ pro humano ajustar os temas antes de gerar os N briefings).
- Briefing carrega `verdade: <slug-do-princípio>` no lugar de `narrativa: <slug-do-arco>`. Em pauta sem nenhuma verdade aplicável a um tema, `verdade: neutro` + aviso (espelha o critério atual de `neutro`).
- O check de coerência usa `estrategista-mercado` (tarefa `coerencia-verdade`) no lugar do antigo `estrategista-narrativa`.

## Mudança 4 — Demolição do arco + repurpose do livro-razão

**Deletar:**
- `.claude/skills/ciclo-de-direcao/` (skill inteira)
- `.claude/agents/estrategista-narrativa.md`
- `memory/narrativas/ativas.md`
- `memory/narrativas/roadmap-crenca.md`

> *Opcional (baixa prioridade):* salvar as `mensagens-âncora` do arco ativo `progresso-invisivel` como frases-semente mapeadas à verdade subjacente, antes de deletar `ativas.md`. A estrutura de arco morre; as frases boas podem virar insumo solto. Não bloqueia a peça.

**Repurpor o livro-razão (sem mexer no script):**
- A coluna `narrativa` passa a significar **qual verdade/princípio** a peça acendeu (antes era slug de arco). O script `append_livro_razao.js` e a flag `--narrativa` **permanecem** (mudança só de semântica do valor passado) — para não rippar nas 5 skills de produção que dão write-back. *Renomear flag/coluna para `verdade` fica como follow-up cosmético da Peça 4.*
- `memory/narrativas/_formato.md` — remover as seções `ativas.md` e `roadmap-crenca.md`; manter só a do livro-razão, com a nota de que a coluna registra a **verdade** acionada; trocar `owner` para `estrategista-mercado`.
- `memory/narrativas/livro-razao.md` — trocar `owner` no frontmatter para `estrategista-mercado`; nota de cabeçalho sobre a semântica `verdade`.

**Religar referências (todos confirmados por grep):**
- `CLAUDE.md` — remover `/ciclo-de-direcao` e `estrategista-narrativa`; adicionar `estrategista-mercado`; **corrigir drift** (lista `curador-export` que não existe mais; omite o agente novo); atualizar contagem do roster, owner do slice `narrativas/`, e a lista de skills.
- `memory/_schema.md` — slice `narrativas/` passa a ter owner `estrategista-mercado` e conteúdo "livro-razão de verdades acionadas" (sai "arcos ativos / roadmap").
- `orquestracao/rotas.yaml` — remover a rota `ciclo-de-direcao-cron`.
- `orquestracao/governanca.yaml` — remover `estrategista-narrativa` e `ciclo-de-direcao`; adicionar `estrategista-mercado` (autonomia: propõe; humano ajusta no modo manual).
- `orquestracao/README.md` — atualizar a lista de crons (sai o ciclo).
- `.claude/skills/pesquisar-mercado/SKILL.md` — remover menção a `/ciclo-de-direcao` como consumidor.
- `.claude/skills/novo-post/SKILL.md` — Passo 6: não ler mais `narrativas/ativas.md` para arco; escolher `verdade` (princípio do brand book) no lugar de `narrativa_servida`. Passo 15.6: o valor de `--narrativa` no write-back passa a ser a `verdade` (flag mantida). Passo 1 (briefing pré-pronto): extrair `verdade:` no lugar de `narrativa:`.
- *(Outras skills de produção — `lote-posts`, `novo-email`, `novo-artigo`, `novo-comunidade` — continuam chamando o script com `--narrativa`; só a semântica do valor muda. Auditar e alinhar a documentação delas pode ir na Peça 4.)*

**Não tocar:** `docs/plans/*` e `docs/specs/2026-06-06-*` (histórico arquivado).

---

## Conjunto de verdades (onde vive)

Para o equilíbrio via livro-razão funcionar, as "verdades" precisam ser um conjunto **enumerável e canônico**. Fonte: os **princípios centrais da marca** já declarados (`brand/brand-book.md`; espelhados no CLAUDE.md):

- `direcao-vence-esforco` — Direção > esforço.
- `disciplina-sem-vontade` — Disciplina é fazer mesmo sem vontade.
- `consistencia-vence-intensidade` — Consistência vence intensidade.
- `execucao-nao-motivacao` — Resultado vem de execução, não de motivação.

O `estrategista-mercado` mapeia cada jogada a um desses slugs; o livro-razão registra a distribuição → equilíbrio + saturação. Se o brand book não enumerar os princípios de forma limpa, formalizar uma seção curta `## Verdades` em `brand-book.md` (edição de brand, passa pelo gate `revisor-brand`). A lista pode crescer/ajustar via `/brand-discovery` — é propriedade do branding, não do estrategista.

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Estrategista de **mercado** enviesar pro reativo (drift tático) ao escolher a verdade | Guard-rails na task: ancorar em `tom-de-voz`, exigir verdade declarada + sustentação no cérebro, `SEM_SUSTENTACAO` como recusa. Verdade é **escolhida**, nunca **inventada**. |
| Sem arco, conteúdo virar passeio aleatório pelas verdades | Equilíbrio emergente via livro-razão (não repetir; cobrir o conjunto) — é tarefa explícita do estrategista. Conjunto de verdades é pequeno → conexão emerge naturalmente. |
| Demolição quebrar referências vivas | Lista exaustiva de pontos de toque (grep-confirmada) acima; cada um vira passo no plano. |
| Perda das `mensagens-âncora` boas do arco ativo | Salvamento opcional como frases-semente antes do delete. |
| Ripple do repurpose nas 5 skills de produção | Manter flag `--narrativa` no script (só muda semântica). Rename cosmético adiado pra Peça 4. |

## Critérios de sucesso

- `.claude/agents/estrategista-mercado.md` existe e segue o padrão de contrato do projeto (schema rígido nas 2 tarefas).
- `/planejar-pauta-semanal` passa pelo estrategista, gera briefings com `verdade:`, pausa pro humano no modo manual e usa `coerencia-verdade`.
- `pesquisador-mercado` produz, no ritmo semanal, sensing leve com as seções de emoção do público e crença de mercado.
- `/ciclo-de-direcao`, `estrategista-narrativa`, `ativas.md`, `roadmap-crenca.md` removidos; nenhuma referência viva pendente (grep limpo fora de `docs/plans` e specs históricos).
- Livro-razão e `_formato.md` repurpostos (owner `estrategista-mercado`; coluna = verdade); `append_livro_razao.js` segue funcionando sem alteração.
- CLAUDE.md, `_schema.md`, `governanca.yaml`, `rotas.yaml`, `README.md` de orquestração, `pesquisar-mercado` e `novo-post` religados e sem drift (`curador-export` corrigido, `estrategista-mercado` presente).
- Net: **−1 skill, −1 agente, +1 agente, −2 arquivos de slice** — arquitetura mais enxuta que o estado atual.
