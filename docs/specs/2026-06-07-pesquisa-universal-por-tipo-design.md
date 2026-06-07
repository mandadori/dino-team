# Pesquisa universal por tipo de conteúdo (Peça 2)

> Spec de design — 2026-06-07
> Segunda de 4 peças do redesign da automação. Faz a pesquisa de tema rodar para **todo** post (não só os informacionais) e ser **type-aware**: fonte e profundidade variam por pilar, virando **fonte de criatividade** em vez de só de fato. Autocontida — não depende da Peça 1.

---

## Motivação

Hoje a `/pesquisar-tema` (deep research) só dispara no `/novo-post` Passo 9 **quando o ângulo é informacional** (dados, mitos, técnica). Post de Mentalidade/filosofia → **sem pesquisa** → a copy é montada só do brand book → risco de copy **robótica e genérica**.

Além disso, quando a pesquisa roda, ela é sempre **deep research técnica** (WebFetch). Isso não serve um post de Mentalidade, que precisa de **livros, autores, correntes de pensamento** — matéria-prima criativa, não dado científico.

O princípio é o do próprio `pesquisador-mercado`: *"prefira o específico ao genérico"*. Alimentar a copy com referências reais (uma frase de autor, um dado, um mito a quebrar, um debate cultural) evita o tom genérico e dá **liga criativa**.

## A visão

- **Pesquisa em todo post** — não só nos informacionais.
- **Type-aware** — a fonte e a profundidade dependem do **pilar** do post (de `brand/pilares-conteudo.md`).
- **Criatividade > só fato** — o output é matéria-prima pra copy riffar (frases, autores, contradições, referências), respeitando o `## Off-limits` dos pilares (sem motivação vazia, sem promessa irreal).
- **Custo sob controle** — profundidade variável + cache de pesquisa (`memory/pesquisa/`) evitam pesquisa cara em todo post.

## Escopo desta peça

**Dentro:**
- Definir **perfis de fonte por pilar** (fonte + profundidade + foco criativo).
- Parametrizar o modo deep research do `pesquisador-mercado` (recebe fonte + profundidade da skill, não mais hardcoded).
- `/pesquisar-tema` passa a resolver o perfil a partir do `--pilar`.
- `/novo-post` Passo 9: de **condicional (só informacional)** para **sempre**, com a profundidade do perfil.
- Alinhar `/lote-posts` (passo de pesquisa) ao mesmo comportamento.

**Fora:**
- Peças 1 (estrategista), 3 (runner) e 4 (limpeza).
- Mudar o destino/cache da pesquisa (`memory/pesquisa/` permanece igual).

---

## Mudança 1 — Perfis de fonte por pilar

Vivem numa seção `## Perfis de fonte por pilar` da skill `/pesquisar-tema` (a skill já recebe `--pilar`; é o lugar natural). Tabela (ancorada nos 4 pilares de `brand/pilares-conteudo.md`):

| Pilar | Função no funil | Fontes prioritárias | Profundidade | Foco criativo |
|---|---|---|---|---|
| **Mentalidade** | Atrair | Livros/autores (estoicismo, filosofia aplicada), correntes de pensamento, debates culturais/sociais sobre disciplina e processo | média | Frases/autores/frameworks pra copy riffar; ângulos contraintuitivos. **Filosofia conectada à prática, nunca motivação vazia.** |
| **Método** | Nutrir→Converter | Estudos de hipertrofia/periodização, autoridades técnico-científicas do nicho, métodos consagrados | profunda | Dado verificável + mito a quebrar + a lógica por trás da decisão |
| **Prova viva** | Nutrir | Fatos técnicos de fisiculturismo de elite + `memory/ramon/contexto.md`; análises técnicas | média | Princípio universal (não biografia em 1ª pessoa); o que separa elite de amador |
| **Transformação** | Converter | **Interno:** `memory/performance/provas-de-aluno.md` + `memory/publico/`; externo leve | rasa (quase interna) | Prova social real, mecânica da consultoria. **Sem promessa irreal.** |

Regras:
- O perfil **respeita o `## Off-limits`** de `pilares-conteudo.md` — pesquisa de Mentalidade não traz "motivação vazia"; Transformação não traz "promessa de prazo".
- Pilar ausente/desconhecido → perfil default = Mentalidade (média, criativo), com aviso de 1 linha.
- "Profundidade rasa (interna)" do pilar Transformação significa: priorizar `memory/` (provas-de-aluno, público) e fazer no máximo um WebFetch leve — **não** uma varredura cara.

## Mudança 2 — `pesquisador-mercado`: deep research parametrizado

Hoje o prompt do Passo 2 da `/pesquisar-tema` fixa *"Profundidade: deep research (WebFetch nas fontes promissoras)"*. Esta peça torna o modo de pesquisa profunda **parametrizado**:

- A skill passa, no envelope, `Fontes:` (o perfil do pilar) e `Profundidade:` (`rasa | média | profunda`).
- O contrato do `pesquisador-mercado` (modo deep research) ganha a leitura desses dois campos: prioriza as fontes do perfil e calibra o esforço pela profundidade. Sem os campos, mantém o comportamento atual (deep) — retrocompatível.
- O princípio "cite fontes / específico > genérico / identifique contradições" permanece; muda **onde** ele cava (filosofia vs. ciência vs. interno) e **quão fundo**.

O template `templates/pesquisa.md` permanece único; o conteúdo se adapta ao perfil (uma pesquisa de Mentalidade preenche com autores/frases; uma de Método com estudos/dados).

## Mudança 3 — `/novo-post` Passo 9: de condicional para sempre

Texto atual: *"Execute quando o ângulo for informacional… Pule em post puramente narrativo."*

Novo comportamento:
- **Executa sempre.** A pesquisa deixa de ser exclusiva de ângulos informacionais.
- A skill resolve o **perfil pelo pilar do briefing** (Passo 6) e dispara `/pesquisar-tema <tema> --pilar <pilar do briefing> --recorte <recorte>`.
- A **profundidade vem do perfil** — Mentalidade/Prova viva = média; Método = profunda; Transformação = rasa/interna.
- O cache de `memory/pesquisa/` continua valendo: se a slug já existe, pula (igual hoje).
- O arquivo gravado segue sendo lido pelo Passo 10 (copy) — agora **todo** post tem matéria-prima de pesquisa pra copy, inclusive os de Mentalidade.

## Mudança 4 — `/lote-posts` alinhamento

O passo de pesquisa do `/lote-posts` (equivalente ao Passo 9 do `/novo-post`) recebe o mesmo tratamento: pesquisa por pilar, sempre, com profundidade do perfil. Pré-pesquisar um lote que compartilha pilar/tema reaproveita o cache (uma chamada serve N posts) — ganho de custo explícito.

---

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Pesquisar em **todo** post encarece/atrasa | Profundidade variável (rasa pra Transformação; média pra Mentalidade/Prova) + cache `memory/pesquisa/` por slug. Só Método paga deep. |
| Pesquisa de Mentalidade virar "motivação vazia" reembalada | Perfil ancora em autores/frameworks reais + respeita `## Off-limits`; sem fonte = declarar especulação (regra do agente). |
| Copy ficar "enciclopédica" (fato sem alma) por excesso de pesquisa | Foco criativo do perfil é matéria-prima pra **riffar**, não pra recitar; o tom continua governado por `brand/tom-de-voz.md` no Passo 10. |
| Perfil divergir dos pilares se `pilares-conteudo.md` mudar | Perfis referenciam os pilares por nome; revisar a tabela quando os pilares forem reestruturados (nota na skill). |

## Critérios de sucesso

- `/pesquisar-tema` tem a tabela `## Perfis de fonte por pilar` e resolve fonte+profundidade a partir do `--pilar`.
- `pesquisador-mercado` (modo deep research) lê `Fontes:` + `Profundidade:` do envelope e calibra a busca; sem os campos, comporta-se como hoje.
- `/novo-post` Passo 9 dispara pesquisa **para todo post**, com a profundidade do perfil do pilar; o cache por slug é respeitado.
- `/lote-posts` alinhado ao mesmo comportamento.
- Um post de **Mentalidade** passa a chegar no Passo 10 (copy) com matéria-prima de pesquisa (autores/frases/ângulos), não só o brand book.
- Nenhuma regresssão nos posts de **Método** (continuam recebendo deep research técnica).
