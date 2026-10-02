# Registro de produto + hierarquia de voz — Design

> **Data:** 2026-10-02
> **Origem:** brainstorming feito logo após as copys de stories da condição de Olympia (`export/conteudos/stories/2026-10-02-consultoria-condicao-olympia/`).
> **Status:** desenho aprovado no brainstorming (seções 1 a 6). Aguardando revisão deste documento.

## 1. Objetivo

Fazer a copy sair **no tom certo** para cada marca e objetivo e **com a informação de operação correta** — e fazer o repo aprender a lidar com essa classe de situação de forma geral, para qualquer produto da marca pessoal Ramon Dino, não como remendo pontual da consultoria.

**Critério de sucesso:** um pedido de copy de venda sai utilizável na primeira entrega — formato certo, voz certa, fatos reais e atuais.

## 2. Diagnóstico

O caso que disparou: o pedido "10 variações desta copy, para sequência de stories" recebeu primeiro 10 stories avulsos, curtos e filtrados pelo guia de tom da Dino Team (sem exclamação, sem "shape", argumentos cortados). O pedido era de 10 sequências de 1 a 5 slides, persuasivas, no registro do script de referência. A segunda entrega só acertou depois da correção do usuário e de uma pesquisa fora do repo.

Três camadas, uma raiz:

| Camada | Evidência no repo |
|---|---|
| **Fato** — a informação atual do produto não tem lar nem caminho de entrada | `memory/produto/catalogo.md` descreve a entrega da consultoria em uma linha e só lista a consultoria (o protocolo PPL de set/2026 e o app de treino não aparecem). `memory/performance/provas-de-aluno.md` é citado no `CLAUDE.md` e no `memory/_schema.md`, mas nunca existiu. Planos e depoimentos do site são placeholder. `memory/ramon/contexto.md` é template vazio desde 2026-05-23. A voz do cliente foi adiada até existir API (Sub-projeto B). As skills de conteúdo não leem o catálogo. |
| **Voz** — as regras não dizem onde valem | `brand/tom-de-voz.md` (registro sereno) é lido como regra geral por 10 consumidores (8 skills, 2 agentes). `brand/grade-editorial-semanal.md` diz "nunca oferta no @ramondinopro", contra a operação atual (stories diários de venda). O `CLAUDE.md` não tem regra de precedência: nada diz que a referência do usuário vale mais que o guia. |
| **Leitura** — pedido ambíguo resolvido sem confirmar | "10 variações para sequência de stories" tinha duas leituras; a escolhida, sem perguntar, foi a errada. |

**Raiz:** o repo descreve a estratégia de junho (conteúdo de marca no @dinoteam, tom sereno). A operação de outubro mudou (venda diária no perfil do Ramon, novos produtos) e não existe canal para a mudança entrar.

## 3. Decisões do brainstorming

| Tema | Decisão |
|---|---|
| Fonte da verdade da operação | O Ramon e os sócios. As novidades **não chegam organizadas**. |
| O que falta de fato | O registro da **definição do produto** nunca existiu. A lista (dores, objeções, benefícios, soluções, diferenciais) é, ou deveria ser, **extensa**. |
| Liberdade | Benefícios, dores, soluções e diferenciais **típicos das consultorias online** podem ser usados com confiança, sem depender do site nem do repo. |
| Validação | O usuário revisa **sozinho**. |
| Atualização | **Programação recorrente** (rotina mensal). |
| Voz | **Hierarquia** com raiz na marca pessoal Ramon Dino (marca pessoal = perfil pessoal) e a Dino Team atrelada abaixo. Regras que valem para tudo + regras específicas por marca e por **objetivo**. O usuário normalmente informa o objetivo no pedido. |
| Leitura de pedido | Perguntar **em uma linha** só quando houver duas leituras reais. |
| Abordagem | **A** — registro por produto + voz em camadas. Descartadas: B (encher os arquivos existentes — mantém a informação espalhada) e C (manual único fora do sistema — nenhuma skill lê, mistura crença com estado). |
| Escopo | Genérico, multi-produto. Skill nova: **`/atualizar-produto`**. |

## 4. Desenho

### 4.1 Registro por produto — `memory/produto/<produto>/`

Cada produto da marca Ramon Dino tem uma pasta própria, com os mesmos arquivos. O primeiro é a consultoria: `memory/produto/consultoria-dino-team/`.

| Arquivo | Conteúdo |
|---|---|
| `oferta.md` | O que é, para quem e para quem não é, planos, condição vigente (com validade), como a pessoa começa, canal de venda |
| `entregaveis.md` | O que o cliente recebe (na consultoria: anamnese, treino, dieta, cada função do app, suporte, check-shape, ajustes, comunidade) |
| `beneficios.md` | O que muda para o cliente por causa da entrega (tempo, dinheiro, clareza, não decidir sozinho…) |
| `dores-e-objecoes.md` | Por que a pessoa procura e por que não compra, com a resposta para cada objeção |
| `diferenciais.md` | Separado em "padrão do mercado" e "só nós temos" |
| `provas.md` | Números, depoimentos, antes e depois — cada um com a situação legal |
| `faq.md` | Perguntas frequentes com resposta |
| `regras.md` | O que só este produto não pode dizer (ex.: regra do CFN, por ter nutricionista), com fonte |
| `_novidades.md` | Caixa de entrada: fatos novos vindos de pedidos, pendentes de revisão |
| `_indice.md` | Mapa dos arquivos + itens vencidos (gerado por script) |

**Arquivos compartilhados:**
- `memory/produto/_modelo/` — o modelo copiado para cada produto novo (mesmos arquivos, tabelas vazias, instruções de preenchimento).
- `memory/produto/_regras-gerais.md` — regras legais que valem para qualquer produto (escassez falsa — CDC art. 37; depoimento inventado; promessa de resultado em prazo), com fonte.

**Formato de cada item** — tabela, para o script conseguir ler:

```
| Item | Como o cliente fala | Status | Revisado em | Fonte |
```

`Revisado em` usa `AAAA-MM-DD` (vazio enquanto o item nunca foi revisado). Na `oferta.md`, a tabela de condições e preços ganha a coluna `Válida até` (data ou `sem data`).

**Status** — valores literais:
- `confirmado` — o usuário revisou e é verdade para este produto.
- `mercado` — ainda não revisado pelo usuário. Vem do padrão da categoria ou de uma fonte pública da própria marca; a coluna `Fonte` diz qual.
- `nao-oferece` — o usuário revisou e o produto não tem. A copy nunca usa; o `estrategista-produto` lê como sinal de oportunidade ("o mercado oferece, nós não").

A copy usa `confirmado` e `mercado`.

**Dono:** `estrategista-produto` (já é o dono do slice `produto/`). O `pesquisador-mercado` mantém o mapa da categoria em `memory/mercado/categorias/<categoria>.md` (ex.: `consultoria-online.md`); o dono leva para o registro o que for novo, como `mercado`.

**Catálogo:** `memory/produto/catalogo.md` passa a listar todos os produtos da marca Ramon Dino, cada um com o blueprint curto e o ponteiro para a pasta. Produtos que já existem fora do catálogo (protocolo PPL, app de treino) entram na lista; a pasta deles é criada quando for necessária.

**Mudança de fronteira:** as 6 objeções de `memory/publico/objecoes.md` são todas de compra e migram para `memory/produto/consultoria-dino-team/dores-e-objecoes.md`; o arquivo antigo vira ponteiro. `memory/publico/dores.md` (dores de vida e identidade) continua onde está, servindo ao conteúdo de marca.

**Montagem inicial (só a consultoria):**
1. Pesquisa das consultorias online brasileiras — o que oferecem, prometem e garantem, e do que o público reclama — gravada como mapa da categoria.
2. Fatos conhecidos: site oficial (consultoriaramondino.com.br), app na App Store (v1.50.1, 22/09/2026), telas do app (`export/conteudos/carrossel/2026-09-01-app-dino-team-fixado/copy.md`), depoimentos públicos, campanha de setembro (`docs/campanhas/2026-09-campanha-olympia-atencao.md`) e o script de referência de 2026-10-02.
3. Consolidação: todo item entra como `mercado`, com a fonte anotada.
4. Revisão única do usuário via `/atualizar-produto consultoria-dino-team --revisao`, que transforma itens em `confirmado` ou `nao-oferece`.

### 4.2 Hierarquia de voz — `brand/voz/`

Substitui `brand/tom-de-voz.md`, que vira ponteiro.

| Arquivo | Conteúdo |
|---|---|
| `ramon-dino.md` | **Raiz.** *Parte A — vale para tudo* (Ramon Dino, Dino Team e qualquer produto): quem o Ramon é (trajetória, conquistas, valores — as `## Verdades` do brand book), o que nunca se faz (mentir, inventar escassez ou depoimento, vender atalho, humilhar o corpo de alguém) e respeitar as regras legais do registro. *Parte B — a voz do Ramon:* 1ª pessoa, conversa, humano, vende nos stories; exclamação e "shape" liberados. |
| `dino-team.md` | A voz da Dino Team, atrelada à raiz: o conteúdo atual de `tom-de-voz.md` (registro sereno, mecanismos M1–M10, registro de mestre, R1–R3, Ramon em 3ª pessoa, assinatura "O topo exige direção."). |
| `objetivos.md` | Lista fechada: `vender`, `captar`, `provar`, `educar`, `conectar`, `alcancar`. Para cada um: o que a peça precisa ter (CTA, preço, urgência só quando real) e quais arquivos do registro carregar. Ex.: `vender` carrega oferta, benefícios, dores e objeções, provas e regras. |
| `exemplos/<marca>-<objetivo>/` | Peças aprovadas pelo usuário — a referência mais forte de estilo. Começa com `exemplos/ramon-dino-vender/2026-10-02-script-condicao-olympia.md` (o script de referência, literal). |

**Divisão de trabalho:** a marca decide *como soa*, o objetivo decide *o que a peça faz*, o exemplo mostra a mistura.

**Produtos:** herdam a Parte A e usam a voz da marca em que são vendidos. Um produto só ganha arquivo de voz próprio se precisar.

**Ordem quando duas regras brigam:**
1. Parte A de `ramon-dino.md` + regras legais (`_regras-gerais.md` e `regras.md` do produto). Nunca são quebradas por conta própria. Se o pedido esbarrar numa delas: aviso em uma linha e uma alternativa; se o usuário mantiver, a decisão é dele — exceto inventar fato (depoimento, número, prova), que não se faz.
2. O pedido do usuário (objetivo, referência, instrução).
3. Exemplos aprovados da combinação marca × objetivo.
4. Regras do objetivo.
5. Voz da marca.

**Ajustes junto:**
- `brand/grade-editorial-semanal.md`: atualizar a linha "Vende?" do @ramondinopro e o off-limits "Oferta no @ramondinopro" para a operação atual (stories de venda diários com link).
- `brand/brand-book.md`: trocar os links de `tom-de-voz.md` por `voz/`.
- O contexto do momento (pós-Olympia: sem consolo, sem a assinatura) não é voz: vai para `memory/ramon/contexto.md` (fora deste escopo, §5).

### 4.3 Como ler uma demanda — nova seção no `CLAUDE.md`

Vale para pedido direto e para skill:

1. Identificar **marca** (`ramon-dino` | `dino-team`), **objetivo** (lista fechada) e **formato** (peça, quantidade, tamanho).
2. Sem objetivo declarado, deduzir pelo pedido ("condição especial", "link", "vagas" → `vender`). Se marca, objetivo ou formato tiver mais de uma leitura real, **perguntar em uma linha** antes de escrever. Sem ambiguidade, executar direto.
3. Carregar só o que a combinação pede: a voz (Parte A, voz da marca, objetivo, exemplos) e os arquivos do registro do produto que o objetivo pede.
4. Benefício, dor e diferencial típicos do mercado: usar com confiança. Fato específico (preço, número de alunos, data, nome, depoimento) nunca é inventado — vem de item `confirmado`, de fonte pública da própria marca anotada no registro, ou do usuário. Se faltar, espaço marcado.
5. Se o que a peça precisa estiver vencido no registro, pesquisar fora (site, app, fontes públicas) antes de escrever.
6. Risco legal real: aviso em uma linha, sem tirar a força da copy.

**Glossário do usuário** (na mesma seção, cresce com o uso):
- *sequência de stories* — 1 a 5 slides que contam uma história e fecham com CTA.
- *variações* — versões alternativas do mesmo pedido, cada uma por um ângulo.

### 4.4 O que muda nas skills e nos agentes

**Skills de conteúdo** — `/novo-post`, `/lote-posts`, `/novo-artigo`, `/novo-email`, `/novo-comunidade`, `/novo-site`:
- Entradas novas: `--marca <ramon-dino|dino-team>` (padrão `dino-team` quando o pedido não indicar a marca) e `--objetivo <slug>` (padrão: deduzido do pedido, §4.3).
- O `Lê:` troca `brand/tom-de-voz.md` pela voz resolvida (§4.2) e acrescenta os arquivos do registro pedidos pelo objetivo.
- O texto completo da resolução fica no `/novo-post` (lar canônico, seção nomeada); as demais apontam por nome (regra 7 do padrão de escrita de skills).

**Agentes:**
- `revisor-brand` — julga pela marca e objetivo declarados; Parte A e regras legais sempre; compliance lido de `_regras-gerais.md` + `regras.md` do produto (fonte única).
- `estrategista-produto` — dono dos registros: aplica revisões e novidades, controla status e datas, leva itens do mapa da categoria para o registro, lê `nao-oferece` como sinal de oportunidade.
- `pesquisador-mercado` — mantém `memory/mercado/categorias/<categoria>.md`.
- `estrategista-mercado` — atualiza caminhos (voz em `brand/voz/`, objeções no registro).

**Skill de pesquisa:** `/pesquisar-mercado` passa a atualizar também o mapa da categoria de cada produto ativo (rotina do dia 1).

**Skills de marca:** `/afinar-tom-de-voz` e `/brand-discovery` escrevem em `brand/voz/`, escolhendo a camada; `/afinar-tom-de-voz` ganha a ação "aprovar exemplo", que salva uma peça aprovada em `exemplos/<marca>-<objetivo>/`.

**Skills de produto:**
- `/criar-produto` passa a criar `memory/produto/<produto>/` a partir de `_modelo/`.
- `/evoluir-produto` grava as mudanças aprovadas pelo mesmo passo de escrita da `/atualizar-produto` — um caminho só de escrita.
- **Nova:** `/atualizar-produto` (§4.5).

**Documentos:** `CLAUDE.md` (§4.3, listas de skills e slices, remoção de `provas-de-aluno.md`), `memory/_schema.md` (slice `produto/` com registros, objeções movidas, `provas-de-aluno.md` removido de `performance/`), `brand/brand-book.md` (links), `orquestracao/rotas.yaml` e `docs/automacao/routines.md` (rotina nova).

### 4.5 Atualização recorrente

**`/atualizar-produto <produto | --todos> [--revisao | --novidade "<texto>" | --preparar]`**
- `--revisao` (padrão): mostra em lotes de 10 os itens a revisar — `mercado`, `confirmado` vencido, condição a 7 dias ou menos de vencer, e pendências de `_novidades.md`. Para cada item: confirma, `nao-oferece` ou corrige. Grava status e data.
- `--novidade "<texto>"`: o usuário cola um fato solto; a skill encontra os itens afetados e atualiza. Como o usuário é o validador, entra `confirmado`.
- `--preparar` (usado pela rotina): leva itens novos do mapa da categoria para o registro como `mercado`, roda o script de vencimento e escreve a revisão do mês em `memory/produto/_revisao/<AAAA-MM>.md`.

**Vencimento:** `confirmado` com mais de 90 dias desde `Revisado em` está vencido. Condição e preço vencem na data de `Válida até`; `sem data` entra na revisão todo mês.

**Encadeamento mensal** (America/Sao_Paulo):

| Quando | Rotina | Papel |
|---|---|---|
| Dia 1, 8h | `/pesquisar-mercado` (já existe) | passa a atualizar também o mapa da categoria de cada produto ativo |
| Dia 3, 9h | **nova** `revisao-produtos-cron` → `/atualizar-produto --todos --preparar` | itens novos do mercado entram como `mercado`; vencidos listados; revisão do mês pronta |
| Dias 3–5 | usuário | ~5 min em `/atualizar-produto <produto>` |
| Dia 5, 9h | `/evoluir-produto` (já existe) | trabalha sobre o registro revisado |
| Dia 7, 9h | `/relatorio-sistema` (já existe) | mostra o que mudou nos produtos |

**Se a revisão não for feita:** nada trava. A copy usa o registro como está e, para condição e preço vencidos, segue a §4.3 (pesquisa fora ou espaço marcado).

### 4.6 Verificação e tratamento de erro

**Testes automáticos** — entram no `npm test`, acrescentando `scripts/produto/*.test.js` ao glob do `package.json`:
- `scripts/produto/itens_vencidos.js` — casos: `confirmado` com 89 e com 91 dias; condição com `Válida até` passada; `sem data`; `nao-oferece` nunca listado.
- `scripts/produto/validar_registro.js` — todo item com status válido, data quando `confirmado` e fonte; falha nomeando arquivo e linha.
- Varredura — nenhum arquivo em `.claude/`, nem o `CLAUDE.md` ou o `memory/_schema.md`, aponta para `brand/tom-de-voz.md` ou `memory/publico/objecoes.md` como fonte (só os ponteiros podem citá-los).

**Testes com peças reais** — uma vez, ao fim da implementação:
- Refazer o pedido das 10 sequências de stories (`--marca ramon-dino --objetivo vender`). Passa se a primeira entrega já sair como 10 sequências de 1 a 5 slides, na voz do script de referência, usando o registro da consultoria e sem fato inventado.
- Post de alcance no @dinoteam (`--marca dino-team --objetivo alcancar`): sai sereno e com a assinatura.
- `revisor-brand`: story de venda do Ramon com exclamação → aprova; o mesmo story com "vagas limitadas" sem teto real → reprova pela Parte A; post de marca da Dino Team com exclamação → reprova pela voz da Dino Team.

**Erros:**
- `PRODUTO_SEM_REGISTRO` — pedido para produto sem pasta: avisar e oferecer criar pelo `_modelo/`. Se o usuário preferir seguir, usar só o mapa da categoria e marcar os fatos específicos.
- Fato novo no pedido: usar na hora (o pedido vale mais que o registro) e anotar em `_novidades.md` do produto, para a revisão do mês confirmar. Não entra direto como `confirmado` porque veio de passagem, num pedido de copy, e não como atualização intencional do registro (essa é a `--novidade`).
- Rotina que falhar: registrada no run-ledger (`orquestracao/execucoes.jsonl`) e visível no relatório mensal.

## 5. Fora do escopo

- **Contexto do Ramon** (`memory/ramon/contexto.md`: pós-Olympia, volta em 2027, sensibilidades do momento) — passo seguinte separado, mesmo padrão; a skill `/atualizar-ramon` já existe.
- **Registros dos outros produtos** (protocolo PPL, app de treino) — criados sob demanda.
- **Site novo da consultoria** (saída do Framer) — projeto próprio, que vai consumir o registro.
- **Loop de resultado** (métrica de conversão por peça) — segue no Horizonte declarado do `CLAUDE.md`.

## 6. Riscos e pontos de atenção

- **Antes e depois:** o Código de Ética do Nutricionista vigente (art. 58) proíbe divulgar imagem corporal de cliente atribuindo o resultado ao protocolo; a Res. CFN 856/2026 endurece a regra a partir de 23/01/2027 (prazo prorrogado pela Res. CFN 156/2026). Entra no `regras.md` da consultoria.
- **Amplitude da migração:** 10 consumidores do guia de tom e 4 da lista de objeções. A varredura automática protege contra caminho esquecido.
- **Tamanho do registro × contexto:** o índice e a carga por objetivo mantêm cada leitura pequena.

## 7. Ordem sugerida de implementação

1. **Voz + leitura** — `brand/voz/` e a seção do `CLAUDE.md`. É o ganho mais rápido: muda toda demanda a partir daí.
2. **Registro** — `_modelo/`, `_regras-gerais.md`, scripts com testes, montagem e revisão da consultoria.
3. **Ligação** — skills de conteúdo, de marca e de produto; agentes; documentos.
4. **Atualização** — `/atualizar-produto` e a rotina do dia 3.
5. **Verificação** — os testes com peças reais.

## 8. Critérios de aceite

1. `memory/produto/consultoria-dino-team/` existe com os 10 arquivos, montado e revisado uma vez pelo usuário.
2. `brand/voz/` existe com `ramon-dino.md`, `dino-team.md`, `objetivos.md` e `exemplos/ramon-dino-vender/`; `brand/tom-de-voz.md` e `memory/publico/objecoes.md` viraram ponteiros.
3. O `CLAUDE.md` tem a seção "Como ler uma demanda" com o glossário.
4. As 6 skills de conteúdo aceitam `--marca` e `--objetivo` e resolvem voz e registro pela hierarquia.
5. `/atualizar-produto` funciona nos três modos; a rotina do dia 3 está declarada em `rotas.yaml` e criada via `/schedule`.
6. `npm test` verde, com os testes novos.
7. Os três testes com peças reais passam.
