# Registro de produto + hierarquia de voz — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer a copy sair no tom certo para cada marca e objetivo e com a informação de operação correta, por meio de um registro vivo por produto e de uma hierarquia de voz que o repo inteiro usa.

**Architecture:** A voz vira uma hierarquia em `brand/voz/` — raiz na marca pessoal Ramon Dino (Parte A vale para tudo + voz própria do Ramon), Dino Team atrelada, lista fechada de objetivos e exemplos aprovados. Cada produto ganha um registro em `memory/produto/<produto>/` (tabelas markdown com status `confirmado | mercado | nao-oferece`), lido e escrito por scripts Node determinísticos em `scripts/produto/`. O `CLAUDE.md` ganha a regra de leitura de demanda; skills e agentes passam a resolver voz e registro pela hierarquia; uma skill nova (`/atualizar-produto`) e uma rotina mensal (dia 3) mantêm o registro vivo.

**Tech Stack:** Markdown + frontmatter YAML (`brand/`, `memory/`, `.claude/`), Node ≥ 20 ESM com `node:test` (`scripts/produto/`), YAML (`orquestracao/`).

**Spec:** `docs/superpowers/specs/2026-10-02-registro-produto-e-voz-design.md`

---

## Contexto para quem executa

- **Onde:** worktree `.claude/worktrees/registro-produto-e-voz`, branch `registro-produto-e-voz` (base: `main` local `3592910`). Rode todo comando a partir da raiz da worktree. **Nunca** rode git na pasta principal do repo — o harness bloqueia.
- **Testes:** `npm test` (node:test). Baseline: 80/80 verdes.
- **Commits:** um por task. Toda mensagem termina com o trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` — use dois `-m`, como nos exemplos.
- **Padrão de escrita de skills:** `CLAUDE.md` §Padrão de escrita de skills (9 regras). Vale para toda edição em `.claude/skills/`.
- **Fatos fora do git (só leitura, nunca copiar para o repo):** `/Users/unstudio/Documents/Projetos/dino team/export/produtos/protocolo-ppl-upper-lower/` e `/Users/unstudio/Documents/Projetos/dino team/export/conteudos/stories/2026-10-02-consultoria-condicao-olympia/copy-variacoes.md`.
- **Estilo dos scripts:** ESM, parsers puros exportados + `main()` chamado só quando o arquivo é executado (`if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();`), erro estrutural em CAIXA_ALTA no stderr com exit 1 — igual a `scripts/relatorio/coletar.js`.
- **Edições "substituir X por Y":** use a ferramenta de edição com o texto exato mostrado. Se o texto antigo não for encontrado, pare e reporte — não improvise.
- **Tasks com ⏸ humano** (Task 22 passo final, Task 23, Task 24 conferência) precisam do usuário: quem orquestra executa, não um subagente.

## Mapa de arquivos

**Criar**
- `brand/voz/README.md`, `brand/voz/ramon-dino.md`, `brand/voz/objetivos.md`, `brand/voz/exemplos/ramon-dino-vender/2026-10-02-script-condicao-olympia.md`
- `brand/voz/dino-team.md` (via `git mv` de `brand/tom-de-voz.md`)
- `scripts/produto/registro.js`, `validar_registro.js`, `itens_vencidos.js`, `aplicar_revisao.js` + um `*.test.js` para cada, e `scripts/produto/varredura.test.js`
- `memory/produto/_modelo/` (10 arquivos), `memory/produto/_regras-gerais.md`
- `memory/mercado/categorias/consultoria-online.md`
- `memory/produto/consultoria-dino-team/` (10 arquivos)
- `.claude/skills/atualizar-produto/SKILL.md`
- `docs/superpowers/specs/2026-10-02-registro-produto-e-voz-verificacao.md`

**Modificar**
- `brand/tom-de-voz.md` (vira ponteiro), `brand/brand-book.md`, `brand/publico-alvo.md`, `brand/pilares-conteudo.md`, `brand/grade-editorial-semanal.md`
- `CLAUDE.md`, `memory/_schema.md`, `memory/produto/catalogo.md`, `memory/publico/objecoes.md` (vira ponteiro), `package.json`, `templates/briefing.md`
- Skills: `novo-post`, `lote-posts`, `novo-artigo`, `novo-email`, `novo-comunidade`, `novo-site`, `afinar-tom-de-voz`, `brand-discovery`, `criar-produto`, `evoluir-produto`, `pesquisar-mercado`, `pesquisar-tema`, `relatorio-sistema`
- Agentes: `revisor-brand`, `estrategista-produto`, `estrategista-mercado`, `pesquisador-mercado`, `analista-performance`
- `orquestracao/rotas.yaml`, `orquestracao/governanca.yaml`, `docs/automacao/routines.md`

---

## Fase 1 — Voz + leitura de demanda

### Task 1: Esqueleto da hierarquia de voz

**Files:**
- Create: `brand/voz/README.md`
- Create: `brand/voz/objetivos.md`

- [ ] **Step 1: Criar `brand/voz/README.md`**

```markdown
# Voz — hierarquia (Ramon Dino → Dino Team)

> Criado em 2026-10-02 (spec `docs/superpowers/specs/2026-10-02-registro-produto-e-voz-design.md` §4.2). Substitui o antigo guia de tom único.

Duas marcas, uma raiz:

| Camada | Arquivo | O que define |
|---|---|---|
| Raiz — marca pessoal Ramon Dino (= perfil @ramondinopro) | [`ramon-dino.md`](ramon-dino.md) | **Parte A** — o que vale para tudo (Ramon, Dino Team e qualquer produto). **Parte B** — a voz do próprio Ramon. |
| Dino Team (atrelada à raiz) | [`dino-team.md`](dino-team.md) | A voz da consultoria: registro sereno, mecanismos M1–M10, registro de mestre, R1–R3, assinatura. |
| Objetivo da peça | [`objetivos.md`](objetivos.md) | O que a peça precisa **fazer** (`vender`, `captar`, `provar`, `educar`, `conectar`, `alcancar`) e o que carregar do registro do produto. |
| Exemplos aprovados | `exemplos/<marca>-<objetivo>/` | Peças aprovadas pelo usuário — a referência mais forte de estilo. |

**Divisão de trabalho:** a marca decide *como soa*; o objetivo decide *o que a peça faz*; o exemplo mostra a mistura.

**Produtos:** herdam a Parte A de `ramon-dino.md` e usam a voz da marca em que são vendidos. Um produto só ganha arquivo de voz próprio se precisar.

## Como resolver a voz de uma peça

1. Marca: `ramon-dino` (perfil pessoal) ou `dino-team`.
2. Leia **sempre** a Parte A de `ramon-dino.md`.
3. Leia a voz da marca: Parte B de `ramon-dino.md` **ou** `dino-team.md`.
4. Leia a seção do objetivo em `objetivos.md`.
5. Leia os exemplos em `exemplos/<marca>-<objetivo>/`, se a pasta existir.

## Ordem quando duas regras brigam

1. **Parte A de `ramon-dino.md` + regras legais** (`memory/produto/_regras-gerais.md` e o `regras.md` do produto) — nunca são quebradas por conta própria. Se o pedido do usuário esbarrar numa delas: avisar em uma linha e propor alternativa; se o usuário mantiver, a decisão é dele — **exceto inventar fato** (depoimento, número, prova), que não se faz.
2. **O pedido do usuário** (objetivo, referência, instrução).
3. **Exemplos aprovados** da combinação marca × objetivo.
4. **Regras do objetivo** (`objetivos.md`).
5. **Voz da marca** (Parte B de `ramon-dino.md` ou `dino-team.md`).
```

- [ ] **Step 2: Criar `brand/voz/objetivos.md`**

```markdown
# Objetivos — lista fechada

> Cada peça tem **um** objetivo. Ele decide o que a peça precisa fazer e o que carregar do registro do produto (`memory/produto/<produto>/`). Como a peça soa vem da marca — ver [`README.md`](README.md).

| Objetivo | A peça faz | Precisa ter | Pode ter | Não faz | Carrega do registro |
|---|---|---|---|---|---|
| `vender` | Leva à compra ou à conversa de venda | CTA claro (link, WhatsApp); benefício concreto; oferta ou condição | Prova, objeção respondida, urgência **só se real** (prazo de verdade) | Inventar escassez, prazo ou número | `oferta.md`, `entregaveis.md`, `beneficios.md`, `dores-e-objecoes.md`, `diferenciais.md`, `provas.md`, `regras.md` |
| `captar` | Traz a pessoa para a conversa (DM, WhatsApp, lista) | Convite simples; dor ou desejo nomeado | Pergunta, gancho de curiosidade | Empurrar preço | `dores-e-objecoes.md`, `beneficios.md` |
| `provar` | Mostra que funciona | Prova verificável (aluno real, número, bastidor) | CTA leve | Prova sem fonte; promessa de resultado ao leitor | `provas.md`, `diferenciais.md`, `regras.md` |
| `educar` | Ensina algo útil e aplicável | Um conceito, o porquê e como aplicar | Ponte sóbria para o produto no fim | Vender no corpo | `entregaveis.md` (só se citar o método) |
| `conectar` | Aproxima, humaniza, abre conversa | Tom de conversa; pessoa real | Pergunta para a audiência | Pitch | — |
| `alcancar` | Faz gente nova conhecer (compartilhável) | Uma ideia forte, sem CTA | — | Oferta | — |

## Como deduzir o objetivo quando o pedido não diz

- "condição", "link", "vagas", "matrícula", "preço", "me chama no WhatsApp" → `vender`.
- "caixinha", "me conta", "comenta", "manda DM" → `conectar`; com venda implícita → `captar`.
- "antes e depois", "depoimento", "resultado de aluno" → `provar`.
- "explica", "ensina", "como fazer", "erro comum" → `educar`.
- "manifesto", "reflexão", "viralizar", "frase" → `alcancar`.
- Duas leituras reais → perguntar em uma linha (`CLAUDE.md` §Como ler uma demanda).
```

- [ ] **Step 3: Commit**

```bash
git add brand/voz/README.md brand/voz/objetivos.md
git commit -m "feat(voz): hierarquia de voz em brand/voz (README + objetivos)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 2: Guia de tom vira a voz da Dino Team

**Files:**
- Move: `brand/tom-de-voz.md` → `brand/voz/dino-team.md`
- Create: `brand/tom-de-voz.md` (ponteiro)

- [ ] **Step 1: Mover preservando o histórico**

```bash
git mv brand/tom-de-voz.md brand/voz/dino-team.md
```

- [ ] **Step 2: Em `brand/voz/dino-team.md`, substituir o título**

Substituir:
```
# Tom de Voz — Dino Team

> Preenchido em 2026-05-14 via `/brand-discovery`.
```
por:
```
# Voz — Dino Team

> **Camada da hierarquia de voz** ([`README.md`](README.md)): voz da marca Dino Team, atrelada à raiz [`ramon-dino.md`](ramon-dino.md) — a Parte A de lá vale aqui também. Movido de `brand/tom-de-voz.md` em 2026-10-02 sem mudar o conteúdo, exceto a lista "Evitar" (os itens que valem para tudo foram para a Parte A).
>
> Preenchido em 2026-05-14 via `/brand-discovery`.
```

- [ ] **Step 3: Em `brand/voz/dino-team.md`, ajustar a lista "Evitar"**

Substituir:
```
### Evitar

- **"Atalho"**, **"jeito fácil"**, **"sem esforço"**
```
por:
```
### Evitar

Além das proibições da Parte A de [`ramon-dino.md`](ramon-dino.md) (inventar fato ou escassez, prometer resultado em prazo ou número, vender atalho, humilhar corpo, vitimismo), a Dino Team evita:

- **"Atalho"**, **"jeito fácil"**, **"sem esforço"**
```

Apagar a linha:
```
- Vitimismo: **"coitadinho de mim"**, **"a vida é injusta"**, **"ninguém entende"**
```

Apagar a linha:
```
- **Promessas de prazo** específico ("emagreça 10kg em 30 dias") ou de número — promete método e direção, nunca resultado em prazo X.
```

- [ ] **Step 4: Em `brand/voz/dino-team.md`, deixar a assinatura explícita como da Dino Team**

Substituir:
```
Toda legenda fecha com a assinatura verbal da marca:
```
por:
```
Toda legenda da Dino Team fecha com a assinatura verbal da marca:
```

- [ ] **Step 5: Criar o ponteiro `brand/tom-de-voz.md`**

```markdown
# Tom de Voz — movido

> Em 2026-10-02 a voz virou uma hierarquia em [`brand/voz/`](voz/README.md). O conteúdo que estava aqui (registro sereno da Dino Team, mecanismos M1–M10, R1–R3, assinatura) está em [`brand/voz/dino-team.md`](voz/dino-team.md). Não edite este arquivo.
```

- [ ] **Step 6: Conferir**

Run: `grep -n "Vitimismo: \|Promessas de prazo" brand/voz/dino-team.md`
Expected: nenhuma saída.

- [ ] **Step 7: Commit**

```bash
git add brand/voz/dino-team.md brand/tom-de-voz.md
git commit -m "refactor(voz): guia de tom vira brand/voz/dino-team.md (ponteiro no lugar antigo)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 3: Raiz `ramon-dino.md` e o primeiro exemplo aprovado

**Files:**
- Create: `brand/voz/ramon-dino.md`
- Create: `brand/voz/exemplos/ramon-dino-vender/2026-10-02-script-condicao-olympia.md`

- [ ] **Step 1: Criar `brand/voz/ramon-dino.md`**

```markdown
# Voz — Ramon Dino (raiz)

> Raiz da hierarquia de voz (ver [`README.md`](README.md)). Marca pessoal = perfil @ramondinopro. Criado em 2026-10-02.
> **Parte A** vale para tudo — Ramon Dino, Dino Team e qualquer produto. **Parte B** é a voz do próprio Ramon.

---

## Parte A — vale para tudo

### Quem é o Ramon Dino

- Saiu do zero absoluto: calistenia em praça no Acre, sem dinheiro, sem academia, sem suplemento.
- Anos errando, ajustando e se adaptando à própria realidade.
- Arnold Classic 2023 — entre os melhores do mundo no Classic Physique.
- Mr. Olympia 2025 — primeiro brasileiro campeão do Mr. Olympia (Classic Physique).
- Atleta de elite em atividade. A fase atual e o momento ficam em `memory/ramon/contexto.md` (estado, não voz).

Valores: as verdades em [`brand-book.md` §Verdades](../brand-book.md) — fonte única, não copiar aqui.

### Nunca, em nenhuma marca ou produto

1. **Mentir ou inventar fato** — depoimento, número, prova, nome, data, preço.
2. **Inventar escassez ou prazo** — "vagas limitadas", "últimas vagas" ou contagem regressiva sem teto real de atendimento ou data real de fechamento.
3. **Prometer resultado em prazo ou número ao leitor** — "perca 10 kg em 30 dias". Depoimento conta a experiência do aluno; não vira promessa para quem lê.
4. **Vender atalho ou fórmula mágica.**
5. **Humilhar o corpo de alguém** — leitor, aluno ou outro atleta.
6. **Vitimismo** — nem do Ramon, nem do leitor.
7. **Ignorar as regras legais** — `memory/produto/_regras-gerais.md` + o `regras.md` do produto citado.

Se um pedido esbarrar numa dessas regras: avisar em uma linha e propor alternativa (ordem completa em [`README.md`](README.md)).

---

## Parte B — a voz do Ramon (perfil pessoal @ramondinopro)

- **Quem fala:** o Ramon, em 1ª pessoa — "eu", "me chama", "a gente" (Ramon + equipe).
- **Registro:** conversa direta com quem assiste. Humano, próximo, sem cerimônia: "cara", "acredite", "vamos combinar", "pra", "tá" são bem-vindos.
- **Liberado:** exclamação (com moderação), "shape" (é como o público e o Ramon falam), emoção real, vender nos stories (link + WhatsApp).
- **Argumento completo:** dor → saída → prova → convite. A persuasão vem de benefício concreto e prova real, não de grito.
- **Não usa:** a assinatura "O topo exige direção." (é da Dino Team).
- **Formato:** texto do Ramon sobre foto ou bastidor. O Ramon quase nunca grava — não planejar peça que dependa de ele gravar.
- **Referência:** [`exemplos/ramon-dino-vender/`](exemplos/ramon-dino-vender/).
```

- [ ] **Step 2: Criar `brand/voz/exemplos/ramon-dino-vender/2026-10-02-script-condicao-olympia.md`**

```markdown
---
marca: ramon-dino
objetivo: vender
canal: stories (@ramondinopro)
aprovado_em: 2026-10-02
origem: script de referência enviado pelo usuário na conversa de 2026-10-02
---

# Script — condição especial do Olympia (consultoria)

> Mês de Olympia e tem condição especial para você que quer colocar o shape de respeito. E, cara, às vezes o melhor jeito de economizar na hora de melhorar seu físico é tendo alguém que entende de verdade do assunto ao seu lado, pegando na sua mão e te dizendo tudo o que você precisa fazer, com base no seu momento atual, seu peso, seu estilo de vida, suas limitações. Assim, você deixa de gastar dinheiro com dietas que nunca te levam a lugar nenhum, planilhas de treinos que não foram feitas para você, e passa a investir em algo que realmente vai te dar um retorno, muito provavelmente em poucos meses, como acontece e já aconteceu com milhares de alunos do Dino Team, te fazendo assim economizar também em tempo. E vamos concordar, tempo é o bem mais precioso de qualquer pessoa. Além de um nutricionista e um treinador próprio, você pode ter um aplicativo com suas refeições diárias, seu peso, meta de água, sua evolução, progressão de cargas, tudo integrado na sua mão para facilitar o seu progresso. Então, quer receber seu plano e já começar a mudança no seu físico nos próximos dias, com condições bem especiais do mês do Olympia que vão te surpreender? Clica no link abaixo, me chama no WhatsApp e você estará a um passo do seu novo físico. Acredite, ter um coach também é para você. Vagas abertas!

## Por que é referência

- Fala como o Ramon fala: conversa direta ("cara", "vamos concordar", "acredite"), 1ª pessoa, CTA para o WhatsApp.
- Argumento de venda completo: economia de dinheiro e de tempo → acompanhamento de quem entende → o que vem no pacote (nutricionista, treinador, app) → convite.
- Responde à objeção no fecho ("ter um coach também é para você").

## Não copiar deste exemplo

- "muito provavelmente em poucos meses" — prazo de resultado (Parte A, regra 3).
- "milhares de alunos" — usar o número do registro (`memory/produto/consultoria-dino-team/provas.md`).
- "Mês de Olympia" — só vale enquanto for verdade no calendário; fora dele, "condição especial do Olympia".
```

- [ ] **Step 3: Conferir os links da pasta**

Run: `ls brand/voz brand/voz/exemplos/ramon-dino-vender`
Expected: `README.md  dino-team.md  exemplos  objetivos.md  ramon-dino.md` e o arquivo do exemplo.

- [ ] **Step 4: Commit**

```bash
git add brand/voz/ramon-dino.md brand/voz/exemplos
git commit -m "feat(voz): raiz ramon-dino.md (Parte A + voz do Ramon) e primeiro exemplo aprovado" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 4: Documentos de marca apontam para a hierarquia; grade reflete a operação real

**Files:**
- Modify: `brand/publico-alvo.md`, `brand/pilares-conteudo.md`, `brand/grade-editorial-semanal.md`, `brand/brand-book.md`

- [ ] **Step 1: Trocar os links para `voz/dino-team.md` (onde vivem M1–M10 e R1–R3)**

```bash
perl -pi -e 's#\[`tom-de-voz\.md`\]\(tom-de-voz\.md\)#[`voz/dino-team.md`](voz/dino-team.md)#g; s#\[tom-de-voz\.md\]\(tom-de-voz\.md\)#[voz/dino-team.md](voz/dino-team.md)#g; s#\[tom de voz\]\(tom-de-voz\.md\)#[voz da Dino Team](voz/dino-team.md)#g' brand/publico-alvo.md brand/pilares-conteudo.md brand/grade-editorial-semanal.md
```

Run: `grep -n "tom-de-voz" brand/publico-alvo.md brand/pilares-conteudo.md brand/grade-editorial-semanal.md`
Expected: nenhuma saída.

- [ ] **Step 2: `brand/brand-book.md` — três trocas**

Substituir:
```
**Assinatura da marca (sign-off fixo):** _"O topo exige direção."_ — fecha toda legenda/peça. Funde a ascensão do Ramon ("topo") com a tese central ("direção"). Ver [`tom-de-voz.md`](tom-de-voz.md).
```
por:
```
**Assinatura da marca (sign-off fixo):** _"O topo exige direção."_ — fecha toda legenda/peça da Dino Team. Funde a ascensão do Ramon ("topo") com a tese central ("direção"). Ver [`voz/dino-team.md`](voz/dino-team.md).
```

Substituir:
```
Estrutura completa em [`tom-de-voz.md`](tom-de-voz.md).
```
por:
```
Estrutura completa em [`voz/dino-team.md`](voz/dino-team.md).
```

Substituir:
```
- [Tom de voz](tom-de-voz.md)
```
por:
```
- [Voz — hierarquia Ramon Dino → Dino Team](voz/README.md)
```

- [ ] **Step 3: `brand/grade-editorial-semanal.md` — registrar a venda nos stories do @ramondinopro**

Substituir:
```
| Vende? | Nunca oferta direta. Uma ponte por semana | Um dia por semana (sexta) e stories de sexta |
```
por:
```
| Vende? | Stories diários com link para o WhatsApp (oferta vigente do produto). Feed: uma ponte por semana | Um dia por semana (sexta) e stories de sexta |
```

Substituir:
```
A grade separa fisicamente: no @dinoteam só a sexta vende; no @ramondinopro nada vende.
```
por:
```
A grade separa fisicamente: no @dinoteam só a sexta vende; no @ramondinopro o feed não vende e a venda fica nos stories diários com link.
```

Substituir:
```
**Papel:** o atleta em movimento. Alcance frio, prova viva, humanização. Zero venda.
```
por:
```
**Papel:** o atleta em movimento. Alcance frio, prova viva, humanização. No feed, zero venda; a venda acontece nos stories diários com link (voz: `voz/ramon-dino.md` Parte B, objetivo `vender`).
```

Substituir:
```
- **Oferta no @ramondinopro.** Ponte por marcação, nunca venda.
```
por:
```
- **Oferta no feed do @ramondinopro.** No feed, ponte por marcação. A venda do perfil pessoal fica nos stories diários com link.
```

Substituir (cabeçalho, linha 5 — já com o link trocado no Step 1):
```
e no scouting de mercado em `memory/mercado/`.
```
por:
```
e no scouting de mercado em `memory/mercado/`.
> Atualizado em 2026-10-02: o @ramondinopro vende nos stories diários com link (operação real desde set/2026); a voz de cada perfil está em [`voz/`](voz/README.md).
```

- [ ] **Step 4: Conferir**

Run: `grep -rn "tom-de-voz" brand/ --include=*.md | grep -v "^brand/tom-de-voz.md"`
Expected: só as duas linhas de histórico do `brand/brand-book.md` (texto entre crases, sem link) — elas ficam.

- [ ] **Step 5: Commit**

```bash
git add brand/
git commit -m "docs(brand): links para brand/voz e grade com a venda nos stories do @ramondinopro" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 5: `CLAUDE.md` — como ler uma demanda

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Inserir a seção antes de "Como o sistema é organizado"**

Substituir:
```
## Como o sistema é organizado

Este repositório é o **sistema operacional de marca completo** do Dino Team.
```
por:
```
## Como ler uma demanda

Vale para pedido direto e para skill. Spec: [`2026-10-02-registro-produto-e-voz-design.md`](docs/superpowers/specs/2026-10-02-registro-produto-e-voz-design.md).

1. **Identifique marca, objetivo e formato.** Marca: `ramon-dino` (perfil pessoal) ou `dino-team`. Objetivo: lista fechada em [`brand/voz/objetivos.md`](brand/voz/objetivos.md). Formato: peça, quantidade, tamanho.
2. **Sem objetivo declarado, deduza pelo pedido** (regras em `objetivos.md`). Se marca, objetivo ou formato tiver **duas leituras reais**, pergunte **em uma linha** antes de escrever. Sem ambiguidade, execute direto.
3. **Carregue só o que a combinação pede:** a voz pela hierarquia de [`brand/voz/README.md`](brand/voz/README.md) e os arquivos do registro do produto (`memory/produto/<produto>/`) que o objetivo lista.
4. **Benefício, dor e diferencial típicos do mercado: use com confiança.** Fato específico (preço, número de alunos, data, nome, depoimento) **nunca é inventado** — vem de item `confirmado`, de fonte pública da própria marca anotada no registro, ou do usuário. Se faltar, deixe um espaço marcado.
5. **Item vencido no registro** (`node scripts/produto/itens_vencidos.js <produto>`): pesquise fora (site, app, fontes públicas) antes de escrever.
6. **Risco legal real:** aviso em uma linha, sem tirar a força da copy. A ordem de prioridade entre regras está em `brand/voz/README.md`.
7. **Fato novo no pedido** (ex.: uma condição nova): use na hora e anote com `node scripts/produto/aplicar_revisao.js <produto> --novidade "<fato>" --origem pedido` para a revisão do mês.

**Glossário do usuário** (cresce com o uso):
- *sequência de stories* — 1 a 5 slides que contam uma história e fecham com CTA.
- *variações* — versões alternativas do mesmo pedido, cada uma por um ângulo.

---

## Como o sistema é organizado

Este repositório é o **sistema operacional de marca completo** da marca pessoal Ramon Dino e da consultoria Dino Team (atreladas) — o segundo cérebro de marketing e branding das duas.
```

- [ ] **Step 2: Lista de `brand/` (§1)**

Substituir:
```
- [`brand/tom-de-voz.md`](brand/tom-de-voz.md) — como a marca fala.
```
por:
```
- [`brand/voz/`](brand/voz/README.md) — como as marcas falam: hierarquia com raiz na marca pessoal Ramon Dino (`ramon-dino.md`: Parte A vale para tudo + voz do Ramon), a Dino Team atrelada (`dino-team.md`), objetivos (`objetivos.md`) e exemplos aprovados (`exemplos/`).
- [`brand/grade-editorial-semanal.md`](brand/grade-editorial-semanal.md) — presença semanal nos dois perfis (feed + stories).
```

- [ ] **Step 3: Linha da `/afinar-tom-de-voz` (§2)**

Substituir:
```
- [`/afinar-tom-de-voz`](.claude/skills/afinar-tom-de-voz/SKILL.md) — refino profundo do `brand/tom-de-voz.md` por exemplos concretos; vai além do brand-discovery.
```
por:
```
- [`/afinar-tom-de-voz`](.claude/skills/afinar-tom-de-voz/SKILL.md) — refino profundo de uma camada de `brand/voz/` por exemplos concretos; aprova exemplos em `brand/voz/exemplos/`; vai além do brand-discovery.
```

- [ ] **Step 4: Conferir**

Run: `grep -n "tom-de-voz.md\|Como ler uma demanda" CLAUDE.md`
Expected: só a linha `## Como ler uma demanda`.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(claude-md): seção Como ler uma demanda + glossário; brand/voz na lista" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Fase 2 — Registro por produto

### Task 6: Leitor do registro (`registro.js`)

**Files:**
- Create: `scripts/produto/registro.js`
- Test: `scripts/produto/registro.test.js`
- Modify: `package.json` (glob de testes)

- [ ] **Step 1: Escrever o teste**

`scripts/produto/registro.test.js`:
```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseItens, normalizaCabecalho, lerRegistro, listarProdutos } from "./registro.js";

const MD = `---
slice: produto
---

# Benefícios

Texto livre que não é tabela.

| Item | Como o cliente fala | Status | Revisado em | Fonte |
|---|---|---|---|---|
| Para de gastar com dieta genérica | "já gastei com dieta da internet" | confirmado | 2026-10-02 | script do usuário |
| Suporte no WhatsApp | "respondem rápido" | mercado |  | site oficial |

| Coluna | Outra |
|---|---|
| tabela sem status | é ignorada |
`;

test("normalizaCabecalho tira acento e caixa e mapeia sinônimos", () => {
  assert.equal(normalizaCabecalho(" Válida até "), "validaAte");
  assert.equal(normalizaCabecalho("Condição"), "item");
  assert.equal(normalizaCabecalho("Revisado em"), "revisadoEm");
  assert.equal(normalizaCabecalho("Resposta"), "resposta");
});

test("parseItens lê só tabelas com Item e Status, com o número da linha", () => {
  const itens = parseItens(MD);
  assert.equal(itens.length, 2);
  assert.equal(itens[0].item, "Para de gastar com dieta genérica");
  assert.equal(itens[0].status, "confirmado");
  assert.equal(itens[0].revisadoEm, "2026-10-02");
  assert.equal(itens[0].linha, 11);
  assert.equal(itens[1].status, "mercado");
  assert.equal(itens[1].revisadoEm, "");
  assert.equal(itens[1].fonte, "site oficial");
});

test("parseItens devolve vazio para tabela só com cabeçalho (modelo)", () => {
  const md = "| Item | Status | Revisado em | Fonte |\n|---|---|---|---|\n";
  assert.deepEqual(parseItens(md), []);
});

test("lerRegistro ignora arquivos com _ e listarProdutos exige oferta.md", () => {
  const raiz = mkdtempSync(join(tmpdir(), "produto-"));
  const dir = join(raiz, "consultoria-teste");
  mkdirSync(dir);
  writeFileSync(join(dir, "oferta.md"), MD);
  writeFileSync(join(dir, "_indice.md"), MD);
  mkdirSync(join(raiz, "_modelo"));
  writeFileSync(join(raiz, "_modelo", "oferta.md"), MD);
  mkdirSync(join(raiz, "sem-oferta"));
  const reg = lerRegistro(dir);
  assert.deepEqual(reg.map((a) => a.arquivo), ["oferta.md"]);
  assert.equal(reg[0].itens.length, 2);
  assert.deepEqual(listarProdutos(raiz), ["consultoria-teste"]);
});
```

- [ ] **Step 2: Incluir a pasta no glob de testes**

Em `package.json`, substituir:
```
"test": "node --test scripts/editor/*.test.js scripts/orquestracao/*.test.js scripts/relatorio/*.test.js scripts/content/*.test.js",
```
por:
```
"test": "node --test scripts/editor/*.test.js scripts/orquestracao/*.test.js scripts/relatorio/*.test.js scripts/content/*.test.js scripts/produto/*.test.js",
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `node --test scripts/produto/registro.test.js`
Expected: FAIL — `Cannot find module` apontando para `./registro.js`.

- [ ] **Step 4: Implementar `scripts/produto/registro.js`**

```js
#!/usr/bin/env node
/**
 * registro.js — leitura do registro de produto (memory/produto/<produto>/).
 *
 * Parser puro de tabelas markdown + leitura da pasta. NÃO usa LLM.
 * Tabela de registro = cabeçalho com as colunas "Item" (ou "Condição") e "Status".
 * Arquivos que começam com "_" (_indice.md, _novidades.md) não são lidos como registro.
 * Formato canônico: memory/_schema.md §Registro por produto.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

export const STATUS_VALIDOS = new Set(["confirmado", "mercado", "nao-oferece"]);

const CHAVES = {
  item: "item",
  condicao: "item",
  "como o cliente fala": "fala",
  status: "status",
  "revisado em": "revisadoEm",
  fonte: "fonte",
  "valida ate": "validaAte",
};

export function normalizaCabecalho(texto) {
  const base = texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
  return CHAVES[base] ?? base;
}

function celulas(linha) {
  const t = linha.trim();
  if (!t.startsWith("|")) return null;
  return t.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}

function ehSeparador(cs) {
  return cs.length > 0 && cs.every((c) => /^:?-{3,}:?$/.test(c));
}

/**
 * Itens de todas as tabelas de registro do markdown.
 * Cada item: { linha, valores, item, status, revisadoEm, fonte, validaAte, fala, totalCelulas, totalColunas }
 */
export function parseItens(markdown) {
  const linhas = markdown.split("\n");
  const itens = [];
  let cabecalho = null;
  for (let i = 0; i < linhas.length; i++) {
    const cs = celulas(linhas[i]);
    if (!cs) {
      cabecalho = null;
      continue;
    }
    if (!cabecalho) {
      const prox = celulas(linhas[i + 1] ?? "");
      if (prox && ehSeparador(prox)) {
        const chaves = cs.map(normalizaCabecalho);
        cabecalho = chaves.includes("status") && chaves.includes("item") ? chaves : "ignorar";
        i++;
      }
      continue;
    }
    if (cabecalho === "ignorar") continue;
    const valores = {};
    cabecalho.forEach((chave, idx) => {
      valores[chave] = cs[idx] ?? "";
    });
    itens.push({
      linha: i + 1,
      valores,
      item: valores.item ?? "",
      status: valores.status ?? "",
      revisadoEm: valores.revisadoEm ?? "",
      fonte: valores.fonte ?? "",
      validaAte: valores.validaAte ?? "",
      fala: valores.fala ?? "",
      totalCelulas: cs.length,
      totalColunas: cabecalho.length,
    });
  }
  return itens;
}

/** Arquivos .md da pasta do produto que são registro (exclui os que começam com "_"). */
export function arquivosDoRegistro(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .sort();
}

export function lerRegistro(dir) {
  return arquivosDoRegistro(dir).map((arquivo) => ({
    arquivo,
    itens: parseItens(readFileSync(join(dir, arquivo), "utf8")),
  }));
}

/** Pastas de produto em memory/produto/ (têm oferta.md e não começam com "_"). */
export function listarProdutos(raizProduto) {
  if (!existsSync(raizProduto)) return [];
  return readdirSync(raizProduto, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .filter((d) => existsSync(join(raizProduto, d.name, "oferta.md")))
    .map((d) => d.name)
    .sort();
}
```

- [ ] **Step 5: Rodar e ver passar**

Run: `node --test scripts/produto/registro.test.js`
Expected: PASS — 4 testes.

- [ ] **Step 6: Suíte inteira**

Run: `npm test`
Expected: `tests 84`, `fail 0`.

- [ ] **Step 7: Commit**

```bash
git add scripts/produto/registro.js scripts/produto/registro.test.js package.json
git commit -m "feat(produto): leitor do registro por produto (registro.js)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 7: Validador do registro (`validar_registro.js`)

**Files:**
- Create: `scripts/produto/validar_registro.js`
- Test: `scripts/produto/validar_registro.test.js`

- [ ] **Step 1: Escrever o teste**

`scripts/produto/validar_registro.test.js`:
```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validarItem, validarRegistro } from "./validar_registro.js";

const base = { item: "Suporte no WhatsApp", status: "mercado", revisadoEm: "", fonte: "site", validaAte: "", totalCelulas: 5, totalColunas: 5 };

test("item mercado sem data e com fonte é válido", () => {
  assert.deepEqual(validarItem(base), []);
});

test("status fora da lista é erro", () => {
  assert.match(validarItem({ ...base, status: "talvez" }).join(), /status inválido/);
});

test("confirmado e nao-oferece exigem data", () => {
  assert.match(validarItem({ ...base, status: "confirmado" }).join(), /sem data/);
  assert.match(validarItem({ ...base, status: "nao-oferece" }).join(), /sem data/);
  assert.deepEqual(validarItem({ ...base, status: "confirmado", revisadoEm: "2026-10-02" }), []);
});

test("data e validade fora do formato são erro", () => {
  assert.match(validarItem({ ...base, revisadoEm: "02/10/2026" }).join(), /data inválida/);
  assert.match(validarItem({ ...base, validaAte: "outubro" }).join(), /validade inválida/);
  assert.deepEqual(validarItem({ ...base, validaAte: "sem data" }), []);
  assert.deepEqual(validarItem({ ...base, validaAte: "2026-10-31" }), []);
});

test("item sem fonte, sem texto ou com colunas a menos é erro", () => {
  assert.match(validarItem({ ...base, fonte: "" }).join(), /sem fonte/);
  assert.match(validarItem({ ...base, item: "" }).join(), /sem texto/);
  assert.match(validarItem({ ...base, totalCelulas: 4 }).join(), /colunas/);
});

test("validarRegistro aponta arquivo e linha do erro", () => {
  const dir = mkdtempSync(join(tmpdir(), "reg-"));
  writeFileSync(
    join(dir, "beneficios.md"),
    [
      "# Benefícios",
      "",
      "| Item | Status | Revisado em | Fonte |",
      "|---|---|---|---|",
      "| Ok | mercado |  | site |",
      "| Ruim | confirmado |  | site |",
    ].join("\n"),
  );
  const r = validarRegistro(dir);
  assert.equal(r.total, 2);
  assert.equal(r.erros.length, 1);
  assert.deepEqual(r.erros[0], { arquivo: "beneficios.md", linha: 6, erro: 'item revisado sem data em "Revisado em"' });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test scripts/produto/validar_registro.test.js`
Expected: FAIL — `Cannot find module` apontando para `./validar_registro.js`.

- [ ] **Step 3: Implementar `scripts/produto/validar_registro.js`**

```js
#!/usr/bin/env node
/**
 * validar_registro.js — confere o formato do registro de produto.
 *
 * Regras (spec 2026-10-02 §4.1): status ∈ {confirmado, mercado, nao-oferece};
 * confirmado/nao-oferece têm "Revisado em"; datas AAAA-MM-DD; todo item tem fonte;
 * "Válida até" é data ou "sem data"; a linha tem o mesmo número de colunas do cabeçalho.
 *
 * Uso:
 *   node scripts/produto/validar_registro.js <produto> | --todos | --pasta <caminho>
 * Saída: "ok — N itens em M arquivos" (exit 0) ou a lista de erros (exit 1).
 */
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { STATUS_VALIDOS, lerRegistro, listarProdutos } from "./registro.js";

const DATA = /^\d{4}-\d{2}-\d{2}$/;

export function validarItem(it) {
  const erros = [];
  if (!it.item) erros.push("item sem texto");
  if (it.totalCelulas !== it.totalColunas)
    erros.push(`linha com ${it.totalCelulas} colunas, cabeçalho tem ${it.totalColunas}`);
  if (!STATUS_VALIDOS.has(it.status)) erros.push(`status inválido: "${it.status}"`);
  if ((it.status === "confirmado" || it.status === "nao-oferece") && !it.revisadoEm)
    erros.push('item revisado sem data em "Revisado em"');
  if (it.revisadoEm && !DATA.test(it.revisadoEm)) erros.push(`data inválida: "${it.revisadoEm}"`);
  if (!it.fonte) erros.push("item sem fonte");
  if (it.validaAte && it.validaAte !== "sem data" && !DATA.test(it.validaAte))
    erros.push(`validade inválida: "${it.validaAte}"`);
  return erros;
}

export function validarRegistro(dir) {
  const arquivos = lerRegistro(dir);
  const erros = [];
  let total = 0;
  for (const { arquivo, itens } of arquivos) {
    for (const it of itens) {
      total++;
      for (const erro of validarItem(it)) erros.push({ arquivo, linha: it.linha, erro });
    }
  }
  return { erros, total, arquivos: arquivos.length };
}

function main() {
  const argv = process.argv.slice(2);
  const raiz = resolve("memory/produto");
  let pastas;
  if (argv[0] === "--todos") pastas = listarProdutos(raiz).map((p) => join(raiz, p));
  else if (argv[0] === "--pasta" && argv[1]) pastas = [resolve(argv[1])];
  else if (argv[0] && !argv[0].startsWith("--")) pastas = [join(raiz, argv[0])];
  else {
    console.error("Uso: node scripts/produto/validar_registro.js <produto> | --todos | --pasta <caminho>");
    process.exit(1);
  }
  if (!pastas.length) console.log("nenhum produto com registro em memory/produto/");
  let falhou = false;
  for (const pasta of pastas) {
    const { erros, total, arquivos } = validarRegistro(pasta);
    if (arquivos === 0) {
      console.error(`PRODUTO_SEM_REGISTRO — ${pasta}`);
      falhou = true;
      continue;
    }
    if (erros.length) {
      falhou = true;
      for (const e of erros) console.error(`${pasta}/${e.arquivo}:${e.linha} — ${e.erro}`);
    } else {
      console.log(`ok — ${total} itens em ${arquivos} arquivos (${pasta})`);
    }
  }
  process.exit(falhou ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
```

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test scripts/produto/validar_registro.test.js`
Expected: PASS — 6 testes.

- [ ] **Step 5: Suíte inteira**

Run: `npm test`
Expected: `tests 90`, `fail 0`.

- [ ] **Step 6: Commit**

```bash
git add scripts/produto/validar_registro.js scripts/produto/validar_registro.test.js
git commit -m "feat(produto): validador do registro (validar_registro.js)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 8: Vencimento, índice e revisão do mês (`itens_vencidos.js`)

**Files:**
- Create: `scripts/produto/itens_vencidos.js`
- Test: `scripts/produto/itens_vencidos.test.js`

- [ ] **Step 1: Escrever o teste**

`scripts/produto/itens_vencidos.test.js`:
```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { diasEntre, classificar, listarPendencias, renderIndice, renderRevisao } from "./itens_vencidos.js";

const HOJE = "2026-10-02";
const it = (o) => ({ item: "x", status: "confirmado", revisadoEm: "", validaAte: "", linha: 1, ...o });

test("diasEntre conta dias corridos", () => {
  assert.equal(diasEntre("2026-07-04", HOJE), 90);
  assert.equal(diasEntre(HOJE, "2026-10-09"), 7);
});

test("confirmado com 89 dias está ok e com 91 dias está vencido", () => {
  assert.equal(classificar(it({ revisadoEm: "2026-07-05" }), HOJE), "ok");
  assert.equal(classificar(it({ revisadoEm: "2026-07-03" }), HOJE), "vencido");
});

test("90 dias exatos ainda não venceu", () => {
  assert.equal(classificar(it({ revisadoEm: "2026-07-04" }), HOJE), "ok");
});

test("validade passada vence; até 7 dias avisa; sem data vai para a revisão mensal", () => {
  assert.equal(classificar(it({ revisadoEm: HOJE, validaAte: "2026-10-01" }), HOJE), "vencido");
  assert.equal(classificar(it({ revisadoEm: HOJE, validaAte: "2026-10-09" }), HOJE), "vence-em-breve");
  assert.equal(classificar(it({ revisadoEm: HOJE, validaAte: "2026-10-10" }), HOJE), "ok");
  assert.equal(classificar(it({ revisadoEm: HOJE, validaAte: "sem data" }), HOJE), "sem-data");
});

test("mercado pede revisão e nao-oferece nunca é listado", () => {
  assert.equal(classificar(it({ status: "mercado" }), HOJE), "mercado");
  assert.equal(classificar(it({ status: "nao-oferece", revisadoEm: "2025-01-01", validaAte: "2026-01-01" }), HOJE), "nao-oferece");
  const reg = [
    {
      arquivo: "entregaveis.md",
      itens: [
        it({ status: "nao-oferece", revisadoEm: "2025-01-01", item: "Chamada de vídeo" }),
        it({ status: "mercado", item: "Vídeo de execução", linha: 7 }),
      ],
    },
  ];
  const pend = listarPendencias(reg, HOJE);
  assert.equal(pend.length, 1);
  assert.equal(pend[0].item, "Vídeo de execução");
  assert.equal(pend[0].linha, 7);
});

test("renderIndice conta status e lista só vencidos e condições", () => {
  const reg = [
    {
      arquivo: "oferta.md",
      itens: [it({ item: "Condição Olympia", revisadoEm: HOJE, validaAte: "sem data" }), it({ status: "mercado", item: "Suporte" })],
    },
  ];
  const md = renderIndice("consultoria-dino-team", reg, HOJE);
  assert.match(md, /\| \[oferta\.md\]\(oferta\.md\) \| 2 \| 1 \| 1 \| 0 \|/);
  assert.match(md, /Condição Olympia — condição sem data de fechamento/);
  assert.doesNotMatch(md, /Suporte —/);
});

test("renderRevisao agrupa por produto com checkbox", () => {
  const md = renderRevisao(
    "2026-11",
    [
      {
        produto: "consultoria-dino-team",
        pendencias: [{ arquivo: "beneficios.md", linha: 9, item: "Economia de tempo", motivo: "padrão de mercado, ainda não revisado" }],
      },
    ],
    HOJE,
  );
  assert.match(md, /# Revisão de produtos — 2026-11/);
  assert.match(md, /## consultoria-dino-team — 1 item\(ns\)/);
  assert.match(md, /- \[ \] `beneficios\.md:9` — Economia de tempo — padrão de mercado/);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test scripts/produto/itens_vencidos.test.js`
Expected: FAIL — `Cannot find module` apontando para `./itens_vencidos.js`.

- [ ] **Step 3: Implementar `scripts/produto/itens_vencidos.js`**

```js
#!/usr/bin/env node
/**
 * itens_vencidos.js — o que pede revisão no registro de produto.
 *
 * Regras (spec 2026-10-02 §4.5):
 * - nao-oferece: nunca listado.
 * - "Válida até" com data passada → vencido; até 7 dias → vence-em-breve; "sem data" → revisão mensal.
 * - mercado → a revisar.
 * - confirmado com mais de 90 dias desde "Revisado em" → vencido.
 *
 * Uso:
 *   node scripts/produto/itens_vencidos.js <produto>|--todos [--hoje AAAA-MM-DD] [--indice] [--revisao AAAA-MM] [--json]
 *   --indice  grava memory/produto/<produto>/_indice.md
 *   --revisao grava memory/produto/_revisao/<AAAA-MM>.md
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { lerRegistro, listarProdutos } from "./registro.js";

export const DIAS_VENCIMENTO = 90;
export const DIAS_AVISO_VALIDADE = 7;
const DATA = /^\d{4}-\d{2}-\d{2}$/;

export function diasEntre(de, ate) {
  const ms = Date.parse(`${ate}T00:00:00Z`) - Date.parse(`${de}T00:00:00Z`);
  return Math.round(ms / 86400000);
}

export function classificar(it, hoje) {
  if (it.status === "nao-oferece") return "nao-oferece";
  if (it.validaAte === "sem data") return "sem-data";
  if (DATA.test(it.validaAte)) {
    const faltam = diasEntre(hoje, it.validaAte);
    if (faltam < 0) return "vencido";
    if (faltam <= DIAS_AVISO_VALIDADE) return "vence-em-breve";
  }
  if (it.status === "mercado") return "mercado";
  if (it.status === "confirmado" && DATA.test(it.revisadoEm) && diasEntre(it.revisadoEm, hoje) > DIAS_VENCIMENTO)
    return "vencido";
  return "ok";
}

const MOTIVOS = {
  vencido: "vencido",
  "vence-em-breve": "vence em até 7 dias",
  "sem-data": "condição sem data de fechamento (revisão mensal)",
  mercado: "padrão de mercado, ainda não revisado",
};

export function listarPendencias(registro, hoje) {
  const pend = [];
  for (const { arquivo, itens } of registro) {
    for (const it of itens) {
      const classe = classificar(it, hoje);
      if (MOTIVOS[classe]) pend.push({ arquivo, linha: it.linha, item: it.item, status: it.status, classe, motivo: MOTIVOS[classe] });
    }
  }
  return pend;
}

export function contarPorStatus(registro) {
  const c = { confirmado: 0, mercado: 0, "nao-oferece": 0 };
  for (const { itens } of registro) for (const it of itens) if (it.status in c) c[it.status]++;
  return c;
}

export function renderIndice(produto, registro, hoje) {
  const linhas = [
    "---",
    "slice: produto",
    "owner: estrategista-produto",
    `produto: ${produto}`,
    `ultima_atualizacao: ${hoje}`,
    "gerado_por: scripts/produto/itens_vencidos.js",
    "---",
    "",
    `# Índice — ${produto}`,
    "",
    `> Gerado por script: \`node scripts/produto/itens_vencidos.js ${produto} --indice\`. Não editar à mão.`,
    "",
    "| Arquivo | Itens | confirmado | mercado | nao-oferece |",
    "|---|---|---|---|---|",
  ];
  for (const a of registro) {
    const c = contarPorStatus([a]);
    linhas.push(`| [${a.arquivo}](${a.arquivo}) | ${a.itens.length} | ${c.confirmado} | ${c.mercado} | ${c["nao-oferece"]} |`);
  }
  const pend = listarPendencias(registro, hoje).filter((p) => p.classe !== "mercado");
  linhas.push("", "## Vencidos e condições a revisar", "");
  if (!pend.length) linhas.push("Nenhum.");
  for (const p of pend) linhas.push(`- \`${p.arquivo}:${p.linha}\` — ${p.item} — ${p.motivo}`);
  linhas.push("");
  return linhas.join("\n");
}

export function renderRevisao(mes, porProduto, hoje) {
  const linhas = [
    "---",
    "slice: produto",
    "owner: estrategista-produto",
    `mes: ${mes}`,
    `gerado_em: ${hoje}`,
    "gerado_por: scripts/produto/itens_vencidos.js",
    "---",
    "",
    `# Revisão de produtos — ${mes}`,
    "",
    "Responda com `/atualizar-produto <produto>` (modo revisão, lotes de 10).",
    "",
  ];
  for (const { produto, pendencias } of porProduto) {
    linhas.push(`## ${produto} — ${pendencias.length} item(ns)`, "");
    if (!pendencias.length) linhas.push("Nada a revisar.", "");
    for (const p of pendencias) linhas.push(`- [ ] \`${p.arquivo}:${p.linha}\` — ${p.item} — ${p.motivo}`);
    if (pendencias.length) linhas.push("");
  }
  return linhas.join("\n");
}

function hojeLocal() {
  return new Date().toLocaleDateString("sv-SE");
}

function main() {
  const argv = process.argv.slice(2);
  const valor = (flag) => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const alvo = argv[0];
  if (!alvo || (alvo.startsWith("--") && alvo !== "--todos")) {
    console.error("Uso: node scripts/produto/itens_vencidos.js <produto>|--todos [--hoje AAAA-MM-DD] [--indice] [--revisao AAAA-MM] [--json]");
    process.exit(1);
  }
  const hoje = valor("--hoje") ?? hojeLocal();
  const raiz = resolve("memory/produto");
  const produtos = alvo === "--todos" ? listarProdutos(raiz) : [alvo];
  const porProduto = produtos.map((produto) => {
    const registro = lerRegistro(join(raiz, produto));
    if (!registro.length) {
      console.error(`PRODUTO_SEM_REGISTRO — memory/produto/${produto}/`);
      process.exit(1);
    }
    if (argv.includes("--indice")) writeFileSync(join(raiz, produto, "_indice.md"), renderIndice(produto, registro, hoje));
    return { produto, pendencias: listarPendencias(registro, hoje) };
  });
  const mes = valor("--revisao");
  if (mes) {
    mkdirSync(join(raiz, "_revisao"), { recursive: true });
    writeFileSync(join(raiz, "_revisao", `${mes}.md`), renderRevisao(mes, porProduto, hoje));
  }
  if (argv.includes("--json")) {
    console.log(JSON.stringify(porProduto, null, 2));
    return;
  }
  for (const { produto, pendencias } of porProduto) {
    console.log(`${produto}: ${pendencias.length} pendência(s)`);
    for (const p of pendencias) console.log(`  ${p.arquivo}:${p.linha} — ${p.item} — ${p.motivo}`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
```

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test scripts/produto/itens_vencidos.test.js`
Expected: PASS — 7 testes.

- [ ] **Step 5: Suíte inteira**

Run: `npm test`
Expected: `tests 97`, `fail 0`.

- [ ] **Step 6: Commit**

```bash
git add scripts/produto/itens_vencidos.js scripts/produto/itens_vencidos.test.js
git commit -m "feat(produto): vencimento, índice e revisão do mês (itens_vencidos.js)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 9: Caminho único de escrita (`aplicar_revisao.js`)

**Files:**
- Create: `scripts/produto/aplicar_revisao.js`
- Test: `scripts/produto/aplicar_revisao.test.js`

- [ ] **Step 1: Escrever o teste**

`scripts/produto/aplicar_revisao.test.js`:
```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { atualizarItem, adicionarItem, anotarNovidade, tocarFrontmatter } from "./aplicar_revisao.js";
import { parseItens } from "./registro.js";

const MD = [
  "---",
  "slice: produto",
  "ultima_atualizacao: 2026-10-01",
  "---",
  "",
  "## Dores",
  "",
  "| Item | Como o cliente fala | Status | Revisado em | Fonte |",
  "|---|---|---|---|---|",
  '| Dieta que não funciona | "já tentei de tudo" | mercado |  | padrão de mercado |',
  "",
  "## Objeções",
  "",
  "| Item | Como o cliente fala | Resposta | Status | Revisado em | Fonte |",
  "|---|---|---|---|---|---|",
  '| É caro | "tá caro" | Custo de continuar errando | mercado |  | publico/objecoes.md (migrado) |',
].join("\n");

test("atualizarItem confirma o item, grava a data e toca o frontmatter", () => {
  const out = atualizarItem(MD, { item: "É caro", status: "confirmado", data: "2026-10-05" });
  const it = parseItens(out).find((i) => i.item === "É caro");
  assert.equal(it.status, "confirmado");
  assert.equal(it.revisadoEm, "2026-10-05");
  assert.equal(it.valores.resposta, "Custo de continuar errando");
  assert.match(out, /^ultima_atualizacao: 2026-10-05$/m);
});

test("atualizarItem não grava data quando o item segue mercado", () => {
  const out = atualizarItem(MD, { item: "É caro", fonte: "site oficial", data: "2026-10-05" });
  const it = parseItens(out).find((i) => i.item === "É caro");
  assert.equal(it.status, "mercado");
  assert.equal(it.revisadoEm, "");
  assert.equal(it.fonte, "site oficial");
});

test("atualizarItem falha com item inexistente, ambíguo ou status inválido", () => {
  assert.throws(() => atualizarItem(MD, { item: "Não existe", status: "confirmado", data: "2026-10-05" }), /ITEM_NAO_ENCONTRADO/);
  const dup = MD + "\n| É caro | x | y | mercado |  | z |";
  assert.throws(() => atualizarItem(dup, { item: "É caro", status: "confirmado", data: "2026-10-05" }), /ITEM_AMBIGUO/);
  assert.throws(() => atualizarItem(MD, { item: "É caro", status: "talvez" }), /STATUS_INVALIDO/);
});

test("adicionarItem acrescenta na tabela da seção pedida, respeitando as colunas", () => {
  const out = adicionarItem(MD, {
    secao: "Objeções",
    valores: { item: "Não tenho tempo", fala: '"minha rotina não deixa"', resposta: "O plano cabe na rotina", status: "mercado", revisadoEm: "", fonte: "padrão de mercado" },
    data: "2026-10-05",
  });
  const itens = parseItens(out);
  const novo = itens.find((i) => i.item === "Não tenho tempo");
  assert.equal(novo.valores.resposta, "O plano cabe na rotina");
  assert.equal(novo.totalCelulas, novo.totalColunas);
  assert.equal(itens.length, 3);
});

test("adicionarItem falha sem tabela na seção ou com status inválido", () => {
  assert.throws(() => adicionarItem(MD, { secao: "Inexistente", valores: { item: "x", status: "mercado", fonte: "y" } }), /TABELA_NAO_ENCONTRADA/);
  assert.throws(() => adicionarItem(MD, { valores: { item: "x", status: "talvez", fonte: "y" } }), /STATUS_INVALIDO/);
});

test("anotarNovidade acrescenta linha pendente no _novidades.md", () => {
  const nov = ["---", "ultima_atualizacao: 2026-10-01", "---", "", "| Data | Novidade | Origem | Status |", "|---|---|---|---|"].join("\n");
  const out = anotarNovidade(nov, { data: "2026-10-05", texto: "suporte | até 22h", origem: "pedido" });
  assert.match(out, /\| 2026-10-05 \| suporte \/ até 22h \| pedido \| pendente \|/);
  assert.match(out, /^ultima_atualizacao: 2026-10-05$/m);
});

test("tocarFrontmatter só troca a data do frontmatter", () => {
  assert.equal(tocarFrontmatter("---\nultima_atualizacao: 2026-01-01\n---\n", "2026-10-05"), "---\nultima_atualizacao: 2026-10-05\n---\n");
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test scripts/produto/aplicar_revisao.test.js`
Expected: FAIL — `Cannot find module` apontando para `./aplicar_revisao.js`.

- [ ] **Step 3: Implementar `scripts/produto/aplicar_revisao.js`**

```js
#!/usr/bin/env node
/**
 * aplicar_revisao.js — caminho único de escrita no registro de produto.
 *
 * Usado pela /atualizar-produto (revisão, novidade, preparação) e pela
 * /evoluir-produto (mudança aprovada). Edita uma linha de tabela, acrescenta
 * um item ou anota uma novidade — e atualiza `ultima_atualizacao`.
 *
 * Uso:
 *   node scripts/produto/aplicar_revisao.js <produto> --arquivo <arq.md> --item "<texto>" [--status <s>] [--data AAAA-MM-DD] [--fonte "<f>"] [--novo-texto "<t>"]
 *   node scripts/produto/aplicar_revisao.js <produto> --arquivo <arq.md> --adicionar --item "<t>" --status <s> --fonte "<f>" [--fala "<f>"] [--resposta "<r>"] [--detalhe "<d>"] [--situacao-legal "<s>"] [--valida-ate <data|"sem data">] [--secao "<título>"] [--data AAAA-MM-DD]
 *   node scripts/produto/aplicar_revisao.js <produto> --novidade "<texto>" [--origem <pedido|usuario>] [--data AAAA-MM-DD]
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { STATUS_VALIDOS, normalizaCabecalho } from "./registro.js";

const SEPARADOR = /^:?-{3,}:?$/;

function celulas(linha) {
  return linha.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}

function montarLinha(cs) {
  return `| ${cs.join(" | ")} |`;
}

function escapar(t) {
  return String(t ?? "").replace(/\|/g, "/").replace(/\n/g, " ").trim();
}

export function tocarFrontmatter(md, data) {
  return md.replace(/^ultima_atualizacao: .*$/m, `ultima_atualizacao: ${data}`);
}

function tabelas(linhas) {
  const res = [];
  let secao = "";
  for (let i = 0; i < linhas.length; i++) {
    const l = linhas[i];
    if (/^#{1,6} /.test(l)) secao = l.replace(/^#{1,6} /, "").trim();
    if (!l.trim().startsWith("|")) continue;
    const prox = linhas[i + 1] ?? "";
    if (!prox.trim().startsWith("|") || !celulas(prox).every((c) => SEPARADOR.test(c))) continue;
    const chaves = celulas(l).map(normalizaCabecalho);
    const t = { inicio: i, chaves, linhas: [], secao, ehRegistro: chaves.includes("status") && chaves.includes("item") };
    let j = i + 2;
    while (j < linhas.length && linhas[j].trim().startsWith("|")) {
      t.linhas.push(j);
      j++;
    }
    res.push(t);
    i = j - 1;
  }
  return res;
}

function inserirLinha(linhas, t, cs) {
  const fim = t.linhas.length ? t.linhas[t.linhas.length - 1] : t.inicio + 1;
  linhas.splice(fim + 1, 0, montarLinha(cs));
}

export function atualizarItem(md, { item, status, data, fonte, novoTexto }) {
  if (!item) throw new Error("INPUT_INSUFICIENTE — falta o texto do item");
  if (status && !STATUS_VALIDOS.has(status)) throw new Error(`STATUS_INVALIDO — ${status}`);
  const linhas = md.split("\n");
  const achados = [];
  for (const t of tabelas(linhas).filter((x) => x.ehRegistro)) {
    const iItem = t.chaves.indexOf("item");
    for (const idx of t.linhas) if (celulas(linhas[idx])[iItem] === item.trim()) achados.push({ t, idx });
  }
  if (!achados.length) throw new Error(`ITEM_NAO_ENCONTRADO — ${item}`);
  if (achados.length > 1) throw new Error(`ITEM_AMBIGUO — "${item}" aparece ${achados.length} vezes`);
  const { t, idx } = achados[0];
  const cs = celulas(linhas[idx]);
  const pos = (k) => t.chaves.indexOf(k);
  if (status) cs[pos("status")] = status;
  const final = cs[pos("status")];
  if (data && pos("revisadoEm") >= 0 && (final === "confirmado" || final === "nao-oferece")) cs[pos("revisadoEm")] = data;
  if (fonte && pos("fonte") >= 0) cs[pos("fonte")] = escapar(fonte);
  if (novoTexto) cs[pos("item")] = escapar(novoTexto);
  linhas[idx] = montarLinha(cs);
  const out = linhas.join("\n");
  return data ? tocarFrontmatter(out, data) : out;
}

export function adicionarItem(md, { secao, valores, data }) {
  if (!valores?.item) throw new Error("INPUT_INSUFICIENTE — falta o texto do item");
  if (!STATUS_VALIDOS.has(valores.status)) throw new Error(`STATUS_INVALIDO — ${valores.status}`);
  const linhas = md.split("\n");
  const t = tabelas(linhas).find((x) => x.ehRegistro && (!secao || x.secao === secao));
  if (!t) throw new Error(`TABELA_NAO_ENCONTRADA — ${secao ?? "(primeira tabela de registro)"}`);
  inserirLinha(linhas, t, t.chaves.map((k) => escapar(valores[k])));
  const out = linhas.join("\n");
  return data ? tocarFrontmatter(out, data) : out;
}

export function anotarNovidade(md, { data, texto, origem }) {
  if (!texto) throw new Error("INPUT_INSUFICIENTE — falta o texto da novidade");
  const linhas = md.split("\n");
  const t = tabelas(linhas).find((x) => x.chaves.includes("novidade"));
  if (!t) throw new Error("TABELA_NAO_ENCONTRADA — _novidades.md sem tabela de novidades");
  const valores = { data, novidade: texto, origem, status: "pendente" };
  inserirLinha(linhas, t, t.chaves.map((k) => escapar(valores[k])));
  return tocarFrontmatter(linhas.join("\n"), data);
}

function hojeLocal() {
  return new Date().toLocaleDateString("sv-SE");
}

function main() {
  const argv = process.argv.slice(2);
  const v = (f) => {
    const i = argv.indexOf(f);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const produto = argv[0];
  if (!produto || produto.startsWith("--")) {
    console.error('Uso: node scripts/produto/aplicar_revisao.js <produto> (--arquivo <arq.md> --item "<texto>" ... | --novidade "<texto>")');
    process.exit(1);
  }
  const dir = resolve("memory/produto", produto);
  if (!existsSync(join(dir, "oferta.md"))) {
    console.error(`PRODUTO_SEM_REGISTRO — memory/produto/${produto}/`);
    process.exit(1);
  }
  const data = v("--data") ?? hojeLocal();
  try {
    if (argv.includes("--novidade")) {
      const arq = join(dir, "_novidades.md");
      writeFileSync(arq, anotarNovidade(readFileSync(arq, "utf8"), { data, texto: v("--novidade"), origem: v("--origem") ?? "usuario" }));
      console.log(`novidade anotada em memory/produto/${produto}/_novidades.md`);
      return;
    }
    const arquivo = v("--arquivo");
    if (!arquivo) throw new Error("INPUT_INSUFICIENTE — falta --arquivo");
    const caminho = join(dir, arquivo);
    const md = readFileSync(caminho, "utf8");
    const status = v("--status");
    if (argv.includes("--adicionar")) {
      const revisado = status === "confirmado" || status === "nao-oferece" ? data : "";
      const valores = {
        item: v("--item"),
        fala: v("--fala"),
        resposta: v("--resposta"),
        detalhe: v("--detalhe"),
        "situacao legal": v("--situacao-legal"),
        status,
        revisadoEm: revisado,
        fonte: v("--fonte"),
        validaAte: v("--valida-ate"),
      };
      writeFileSync(caminho, adicionarItem(md, { secao: v("--secao"), valores, data }));
      console.log(`item adicionado em ${produto}/${arquivo}: ${valores.item}`);
      return;
    }
    writeFileSync(caminho, atualizarItem(md, { item: v("--item"), status, data, fonte: v("--fonte"), novoTexto: v("--novo-texto") }));
    console.log(`item atualizado em ${produto}/${arquivo}: ${v("--item")}${status ? ` → ${status}` : ""}`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
```

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test scripts/produto/aplicar_revisao.test.js`
Expected: PASS — 7 testes.

- [ ] **Step 5: Suíte inteira**

Run: `npm test`
Expected: `tests 104`, `fail 0`.

- [ ] **Step 6: Commit**

```bash
git add scripts/produto/aplicar_revisao.js scripts/produto/aplicar_revisao.test.js
git commit -m "feat(produto): caminho único de escrita no registro (aplicar_revisao.js)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 10: Modelo do registro e regras gerais

**Files:**
- Create: `memory/produto/_modelo/` — `oferta.md`, `entregaveis.md`, `beneficios.md`, `dores-e-objecoes.md`, `diferenciais.md`, `provas.md`, `faq.md`, `regras.md`, `_novidades.md`, `_indice.md`
- Create: `memory/produto/_regras-gerais.md`

Todos os arquivos do modelo começam com este frontmatter (o `_indice.md` tem um campo a mais, mostrado abaixo):

```
---
slice: produto
owner: estrategista-produto
produto: <produto>
ultima_atualizacao: AAAA-MM-DD
versao: 1
---
```

- [ ] **Step 1: `memory/produto/_modelo/oferta.md`** (frontmatter acima +)

```markdown
# Oferta — <produto>

> O que é, para quem, planos e condição vigente. Condição e preço têm "Válida até" (data ou `sem data`). Status: `confirmado` | `mercado` | `nao-oferece` — formato em `memory/_schema.md` §Registro por produto.

## O que é e para quem

| Item | Como o cliente fala | Status | Revisado em | Fonte |
|---|---|---|---|---|

## Para quem não é

| Item | Como o cliente fala | Status | Revisado em | Fonte |
|---|---|---|---|---|

## Planos, preços e condições

| Condição | Detalhe | Válida até | Status | Revisado em | Fonte |
|---|---|---|---|---|---|

## Como começar e canal de venda

| Item | Como o cliente fala | Status | Revisado em | Fonte |
|---|---|---|---|---|
```

- [ ] **Step 2: `memory/produto/_modelo/entregaveis.md`** (frontmatter +)

```markdown
# Entregáveis — <produto>

> O que o cliente recebe, um item por linha (cada função do app é um item). Formato: `memory/_schema.md` §Registro por produto.

## O que o cliente recebe

| Item | Como o cliente fala | Status | Revisado em | Fonte |
|---|---|---|---|---|
```

- [ ] **Step 3: `memory/produto/_modelo/beneficios.md`** (frontmatter +)

```markdown
# Benefícios — <produto>

> O que muda para o cliente por causa da entrega (tempo, dinheiro, clareza, não decidir sozinho…). Benefício é consequência; o que é entregue fica em `entregaveis.md`.

## O que muda para o cliente

| Item | Como o cliente fala | Status | Revisado em | Fonte |
|---|---|---|---|---|
```

- [ ] **Step 4: `memory/produto/_modelo/dores-e-objecoes.md`** (frontmatter +)

```markdown
# Dores e objeções — <produto>

> Dores de compra: por que a pessoa procura. Objeções: por que ela não compra — sempre com a resposta. Dores de vida e identidade ficam em `memory/publico/dores.md`.

## Dores (por que procura)

| Item | Como o cliente fala | Status | Revisado em | Fonte |
|---|---|---|---|---|

## Objeções (por que não compra)

| Item | Como o cliente fala | Resposta | Status | Revisado em | Fonte |
|---|---|---|---|---|---|
```

- [ ] **Step 5: `memory/produto/_modelo/diferenciais.md`** (frontmatter +)

```markdown
# Diferenciais — <produto>

> Separe o que todo mundo oferece do que só este produto tem. Copy que só usa o padrão do mercado fica igual à de qualquer concorrente.

## Padrão do mercado (todo mundo oferece)

| Item | Como o cliente fala | Status | Revisado em | Fonte |
|---|---|---|---|---|

## Só nós temos

| Item | Como o cliente fala | Status | Revisado em | Fonte |
|---|---|---|---|---|
```

- [ ] **Step 6: `memory/produto/_modelo/provas.md`** (frontmatter +)

```markdown
# Provas — <produto>

> Números, depoimentos e antes e depois. Toda prova tem fonte e situação legal. Nunca inventar prova.

| Item | Como o cliente fala | Situação legal | Status | Revisado em | Fonte |
|---|---|---|---|---|---|
```

- [ ] **Step 7: `memory/produto/_modelo/faq.md`** (frontmatter +)

```markdown
# Perguntas frequentes — <produto>

> "Item" é a pergunta, como o cliente faz.

| Item | Resposta | Status | Revisado em | Fonte |
|---|---|---|---|---|
```

- [ ] **Step 8: `memory/produto/_modelo/regras.md`** (frontmatter +)

```markdown
# Regras do produto — <produto>

> Só o que vale para este produto. As regras de qualquer produto estão em `memory/produto/_regras-gerais.md`. Regras valem sempre, qualquer que seja o status; o status só diz se o usuário já revisou a redação.

| Item | Detalhe | Status | Revisado em | Fonte |
|---|---|---|---|---|
```

- [ ] **Step 9: `memory/produto/_modelo/_novidades.md`** (frontmatter +)

```markdown
# Novidades — <produto>

> Caixa de entrada. Fatos novos que chegaram de passagem (num pedido de copy, por exemplo) e ainda não foram revisados. Escrita por `node scripts/produto/aplicar_revisao.js <produto> --novidade "<texto>" --origem <pedido|usuario>`; a revisão aplica e marca como `aplicada`.

| Data | Novidade | Origem | Status |
|---|---|---|---|
```

- [ ] **Step 10: `memory/produto/_modelo/_indice.md`**

```markdown
---
slice: produto
owner: estrategista-produto
produto: <produto>
ultima_atualizacao: AAAA-MM-DD
gerado_por: scripts/produto/itens_vencidos.js
---

# Índice — <produto>

> Gerado por script: `node scripts/produto/itens_vencidos.js <produto> --indice`. Não editar à mão.
```

- [ ] **Step 11: `memory/produto/_regras-gerais.md`**

```markdown
---
slice: produto
owner: estrategista-produto
ultima_atualizacao: 2026-10-02
versao: 1
---

# Regras gerais — valem para qualquer produto da marca Ramon Dino

> Lidas junto com o `regras.md` de cada produto. A Parte A de `brand/voz/ramon-dino.md` manda respeitá-las. Não são parecer jurídico: são o que o sistema não deixa passar sem aviso. Valem sempre, qualquer que seja o status — o status só diz se o usuário já revisou a redação.

| Item | Detalhe | Status | Revisado em | Fonte |
|---|---|---|---|---|
| Sem escassez falsa | Não dizer "vagas limitadas", "últimas vagas" ou fazer contagem regressiva sem teto real de atendimento ou data real de fechamento | mercado |  | CDC (Lei 8.078/1990) art. 37 — publicidade enganosa; docs/campanhas/2026-09-campanha-olympia-atencao.md §10 |
| Sem depoimento, número ou prova inventados | Depoimento só de aluno real; número só com fonte (registro `confirmado`, fonte pública da marca ou o usuário) | mercado |  | CDC art. 37; Código Brasileiro de Autorregulamentação Publicitária (CONAR) — testemunhais |
| Sem promessa de resultado em prazo ou número ao leitor | Não prometer "X kg em Y dias"; depoimento conta a experiência do aluno, não promete a do leitor | mercado |  | CDC art. 37; brand/pilares-conteudo.md §Off-limits |
| Sem claim de saúde | Não dizer que cura, trata, previne ou alivia doença | mercado |  | CDC art. 37; contrato do agente revisor-brand (compliance de saúde) |
| Suplemento não é solução | Não prescrever suplemento nem dosagem como promessa de resultado | mercado |  | contrato do agente revisor-brand (compliance de suplementação) |
| Preço e condição verdadeiros | Preço, parcelamento, fidelidade e multa ditos como são; multa de plano com fidelidade aparece legível | mercado |  | CDC art. 31 (informação clara); docs/campanhas/2026-09-campanha-olympia-atencao.md §4 |
```

- [ ] **Step 12: Validar**

Run: `node scripts/produto/validar_registro.js --pasta memory/produto/_modelo`
Expected: `ok — 0 itens em 8 arquivos (...)`

Run:
```bash
node --input-type=module -e "import {readFileSync} from 'node:fs'; import {parseItens} from './scripts/produto/registro.js'; import {validarItem} from './scripts/produto/validar_registro.js'; const itens = parseItens(readFileSync('memory/produto/_regras-gerais.md','utf8')); const erros = itens.flatMap(i => validarItem(i).map(e => i.linha + ': ' + e)); console.log(itens.length + ' itens', erros.length ? erros : 'ok');"
```
Expected: `6 itens ok`

- [ ] **Step 13: Commit**

```bash
git add memory/produto/_modelo memory/produto/_regras-gerais.md
git commit -m "feat(produto): modelo do registro e regras gerais" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 11: Mapa da categoria "consultoria online"

**Files:**
- Create: `memory/mercado/categorias/consultoria-online.md`

- [ ] **Step 1: Pesquisar**

Com WebSearch + WebFetch, seguindo os princípios do agente `pesquisador-mercado` (cite fonte, específico > genérico, nunca invente métrica):
- Buscas: "consultoria online treino e dieta personalizada", "consultoria fitness online o que está incluso", "consultoria online hipertrofia nutricionista e treinador", "consultoria online treino dieta app acompanhamento", "reclame aqui consultoria online treino dieta", "consultoria online fitness vale a pena".
- Meta mínima: **8** consultorias online brasileiras com página de venda acessível (anote URL e data de acesso); **15** entregáveis ou benefícios distintos; **10** dores ou objeções com a fala do público e fonte (comentários, Reclame Aqui, fóruns).
- Não inclua a Dino Team no mapa — o registro dela é a Task 12.

- [ ] **Step 2: Escrever o arquivo (preencha todas as tabelas)**

```markdown
---
slice: mercado
owner: pesquisador-mercado
categoria: consultoria-online
ultima_atualizacao: 2026-10-02
versao: 1
---

# Categoria — consultoria online de treino e dieta (Brasil)

> O que o mercado oferece, promete e garante, e do que o público reclama. Fonte dos itens `mercado` dos registros de produto desta categoria (`memory/produto/<produto>/`). Atualizado pela `/pesquisar-mercado` (rotina do dia 1).

## Consultorias analisadas

| Consultoria | Página de venda | Destaque da oferta | Acessado em |
|---|---|---|---|

## Entregáveis comuns

| Entregável | Quantas oferecem (de N) | Exemplo (consultoria — trecho) |
|---|---|---|

## Benefícios prometidos

| Benefício | Como aparece na copy delas | Fonte |
|---|---|---|

## Diferenciais (o que só algumas têm)

| Diferencial | Quem tem | Fonte |
|---|---|---|

## Garantias e condições comerciais

| Condição | Como funciona | Fonte |
|---|---|---|

## Dores e objeções do público

| Dor ou objeção | Como o público fala | Fonte |
|---|---|---|

## Fontes consultadas

- <URL> — <AAAA-MM-DD>
```

As colunas usam nomes próprios (não "Item"/"Status") de propósito: este arquivo é pesquisa de mercado, não registro de produto, e não deve ser lido pelos scripts de `scripts/produto/`.

- [ ] **Step 3: Conferir as metas**

Run: `grep -c "^| " memory/mercado/categorias/consultoria-online.md`
Expected: ≥ 51 (cabeçalhos e separadores contam 12; o restante são linhas de conteúdo). Toda linha de conteúdo tem fonte.

- [ ] **Step 4: Commit**

```bash
git add memory/mercado/categorias/consultoria-online.md
git commit -m "feat(mercado): mapa da categoria consultoria online" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 12: Montar o registro da consultoria

**Files:**
- Create: `memory/produto/consultoria-dino-team/` (os 10 arquivos)

- [ ] **Step 1: Copiar o modelo**

```bash
cp -R memory/produto/_modelo memory/produto/consultoria-dino-team
perl -pi -e "s/<produto>/consultoria-dino-team/g; s/AAAA-MM-DD/2026-10-02/g" memory/produto/consultoria-dino-team/*.md
```

- [ ] **Step 2: Reunir as fontes**

Site oficial (texto literal; ignore os depoimentos em inglês, sobras de modelo "WARAS"):
```bash
curl -sL -A "Mozilla/5.0" https://consultoriaramondino.com.br/ -o "$TMPDIR/consultoria.html"
python3 - "$TMPDIR/consultoria.html" <<'PY'
import re, sys, html
t = open(sys.argv[1], encoding="utf-8", errors="ignore").read()
t = re.sub(r"(?s)<style.*?</style>|<script.*?</script>|<svg.*?</svg>", "", t)
t = re.sub(r"<[^>]+>", "\n", t)
vistos = set()
for linha in html.unescape(t).splitlines():
    linha = re.sub(r"\s+", " ", linha).strip()
    if linha and linha not in vistos:
        vistos.add(linha)
        print(linha)
PY
```
Demais fontes:
- App na App Store: WebFetch em `https://apps.apple.com/us/app/ramon-dino-app/id6779653000` (descrição e versão).
- `export/conteudos/carrossel/2026-09-01-app-dino-team-fixado/copy.md` — telas do app.
- `docs/campanhas/2026-09-campanha-olympia-atencao.md` — §3.3 (anamnese, check-shape), §4 (planos e preços de 31/08/2026, multa de 20%).
- `brand/voz/exemplos/ramon-dino-vender/2026-10-02-script-condicao-olympia.md` — o script do usuário.
- `memory/publico/objecoes.md` — as 6 objeções a migrar (fala + reframe).
- `brand/publico-alvo.md` §Linguagem — como o público fala.
- `memory/mercado/categorias/consultoria-online.md` — padrão do mercado (Task 11).
- Só leitura, fora do git: `/Users/unstudio/Documents/Projetos/dino team/export/conteudos/stories/2026-10-02-consultoria-condicao-olympia/copy-variacoes.md`.

- [ ] **Step 3: Preencher os arquivos**

Regras:
- **Todo item entra com status `mercado`**, `Revisado em` vazio e `Fonte` exata — ex.: `site oficial (consultoriaramondino.com.br, 2026-10-02)`, `App Store v1.50.1 (2026-09-22)`, `carrossel do app (2026-09-01)`, `campanha set/2026 §4`, `script do usuário (2026-10-02)`, `mercado/categorias/consultoria-online.md`, `publico/objecoes.md (migrado)`. O usuário confirma na Task 23.
- **Nunca invente número, nome, preço ou depoimento.** O que não tiver fonte fica de fora.
- Para adicionar cada linha use o script, para o formato sair certo:
  ```bash
  node scripts/produto/aplicar_revisao.js consultoria-dino-team --arquivo entregaveis.md --adicionar --item "<texto>" --fala "<como o cliente fala>" --status mercado --fonte "<fonte>" --data 2026-10-02
  ```
  (objeções: `--arquivo dores-e-objecoes.md --secao "Objeções (por que não compra)" --resposta "<resposta>"`; condições: `--arquivo oferta.md --secao "Planos, preços e condições" --detalhe "<detalhe>" --valida-ate "sem data"`; provas: `--situacao-legal "<situação>"`; faq: `--resposta`; regras: `--detalhe`.)

Mínimos e conteúdo obrigatório:

| Arquivo | Mínimo | Tem que conter (com a fonte indicada) |
|---|---|---|
| `oferta.md` | O que é ≥ 3 · Para quem não é ≥ 3 · Planos ≥ 6 · Como começar ≥ 3 | Os planos e preços de 31/08/2026 (campanha §4), cada um `Válida até: sem data`; a condição especial do Olympia (`Válida até: sem data` — sem data de fechamento); "Clica no link e me chama no WhatsApp" como canal de venda (script). |
| `entregaveis.md` | ≥ 15 | Os 4 do site: "Treino periodizado para o seu físico", "Dieta sob medida para a sua rotina", "Suporte humanizado e instantâneo", "Ajustes contínuos no seu protocolo"; anamnese inicial (campanha §3.3); nutricionista e treinador próprios (script); check-shape — fotos de frente, lado e costas no mesmo padrão, a equipe analisa e ajusta treino e dieta (carrossel + site); e cada função do app em uma linha: treino do dia guiado com as observações do treinador, melhor série de cada exercício salva, relatório e feedback do treino, dieta com alimento, quantidade e horário, marcação das refeições com calorias e macros do dia, checklist do dia (água, dieta, treino, cardio), sequência de dias cumpridos, peso e medidas, comunidade de alunos e novidades no app (carrossel), ajuste do nutricionista ou treinador aparece na hora no app (App Store). |
| `beneficios.md` | ≥ 15 | Economia de dinheiro (para de gastar com dieta e planilha genéricas) e de tempo (script); não decidir sozinho o que comer e como treinar; evolução medida, não achismo; nunca recomeçar do zero (suporte e ajustes); e o padrão do mapa da categoria. |
| `dores-e-objecoes.md` | Dores ≥ 12 · Objeções ≥ 10 | As dores que o site nomeia ("falta de clareza", "não sabe se o treino que segue funciona para você", "dietas copiadas da internet", "treinar sozinho", "resultados lentos", "investimento perdido"); as 6 objeções de `publico/objecoes.md`, cada uma com o reframe como `Resposta`; ≥ 4 objeções do mapa da categoria. |
| `diferenciais.md` | Padrão ≥ 6 · Só nós ≥ 5 | Só nós: o método do Ramon ("O mesmo método que levou ele ao topo, agora adaptado para você" — site), o app próprio da consultoria, a comunidade, o suporte humanizado e rápido no WhatsApp (depoimentos do site). Padrão: o que o mapa diz que todo mundo oferece. |
| `provas.md` | ≥ 6 | "+1000 alunos evoluindo todos os dias" (site; situação legal: número público da marca); ~400 alunos ativos (dado interno de jun/2026, `memory/produto/catalogo.md`); 1º brasileiro campeão do Mr. Olympia Classic Physique, 2025 (site); os 4 depoimentos com nome da seção "Veja o que os alunos do Dino Team dizem" do site (Érika Prado, Tiago Mello, Lorena Bastos, Renan Castilho), com o trecho literal; antes e depois de alunos (o usuário tem as fotos) com situação legal: "CFN art. 58 (vigente): nutricionista não pode divulgar imagem corporal de cliente atribuindo o resultado ao protocolo — validar com quem responde pela nutrição; a Res. CFN 856/2026 endurece a partir de 23/01/2027". Depoimento com número de peso: situação legal "atenção à Res. CFN 856/2026 a partir de 23/01/2027". Os depoimentos da seção "Histórias de sucesso" do site têm o autor mal identificado no HTML: se usar, sem nome. |
| `faq.md` | ≥ 10 | Funciona para iniciante? · Quanto tempo até ver resultado? (resposta sem prazo: "Não vendemos prazo…" — `site/docs/home-briefing.md` §FAQ) · Preciso de academia ou suplemento? · Como funciona na prática? · É o Ramon que me acompanha? (mesma fonte) · e perguntas do mapa da categoria. |
| `regras.md` | ≥ 3 | Antes e depois — CFN art. 58 vigente + Res. CFN 856/2026 a partir de 23/01/2027 (prorrogada pela Res. CFN 156/2026) — fontes: cfn.org.br/novo-codigo-de-etica-dos-nutricionistas-proibe-divulgacao-de-fotos-antes-e-depois-de-pacientes/ e legisweb.com.br/legislacao/?id=498532; "nutricionista" só se a dieta for feita por nutricionista registrado; multa de 20% do plano trimestral visível em qualquer peça que cite esse plano (campanha §4). |

- [ ] **Step 4: Validar**

Run: `node scripts/produto/validar_registro.js consultoria-dino-team`
Expected: `ok — <N> itens em 8 arquivos (...)`. Em erro, corrija o `arquivo:linha` apontado e repita.

- [ ] **Step 5: Conferir os mínimos**

Run:
```bash
node --input-type=module -e "import {lerRegistro} from './scripts/produto/registro.js'; for (const a of lerRegistro('memory/produto/consultoria-dino-team')) console.log(a.arquivo, a.itens.length);"
```
Expected: cada arquivo atinge o mínimo da tabela do Step 3 (para `oferta.md`, `dores-e-objecoes.md` e `diferenciais.md`, a soma das seções).

- [ ] **Step 6: Gerar o índice**

Run: `node scripts/produto/itens_vencidos.js consultoria-dino-team --indice`
Expected: lista as pendências (todos os itens `mercado`) e grava `memory/produto/consultoria-dino-team/_indice.md`.

- [ ] **Step 7: Commit**

```bash
git add memory/produto/consultoria-dino-team
git commit -m "feat(produto): registro da consultoria Dino Team (montagem inicial, tudo mercado)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 13: Fronteiras — objeções, catálogo multi-produto, schema e CLAUDE.md

**Files:**
- Modify: `memory/publico/objecoes.md` (vira ponteiro)
- Modify: `memory/produto/catalogo.md`
- Modify: `memory/_schema.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Substituir todo o conteúdo de `memory/publico/objecoes.md`**

```markdown
---
slice: publico
owner: pesquisador-mercado
ultima_atualizacao: 2026-10-02
versao: 2
---

# Objeções do público — movido

> Em 2026-10-02 as objeções de compra foram para o registro de cada produto. As da consultoria estão em [`memory/produto/consultoria-dino-team/dores-e-objecoes.md`](../produto/consultoria-dino-team/dores-e-objecoes.md), seção "Objeções (por que não compra)". Não edite este arquivo.
```

- [ ] **Step 2: Substituir todo o conteúdo de `memory/produto/catalogo.md`**

Antes, leia em `/Users/unstudio/Documents/Projetos/dino team/export/produtos/protocolo-ppl-upper-lower/capa-textos.md` (só leitura) para conferir a promessa do protocolo.

```markdown
---
slice: produto
owner: estrategista-produto
ultima_atualizacao: 2026-10-02
versao: 2
---

# Catálogo de produtos — marca Ramon Dino

Todos os produtos da marca pessoal Ramon Dino, com blueprint curto e **status de 1ª classe**. O detalhe vivo de cada produto (oferta, entregáveis, benefícios, dores e objeções, diferenciais, provas, FAQ, regras) fica no **registro do produto**, `memory/produto/<produto>/` (formato em `memory/_schema.md` §Registro por produto). Owner único: `estrategista-produto`. Marketing lê (não escreve) para promover.

**Status (estado de 1ª classe):**
`oportunidade` → `em-validação` → `em-construção` → `ativo` → `em-evolução` → `candidato-a-sunset` → `aposentado`.

Campos do blueprint por produto: tipo · status · categoria (mapa em `memory/mercado/categorias/`) · registro · dor que resolve · público da oferta · promessa · modelo · preço · verdade da marca servida · canal de distribuição.

## Produtos

### Consultoria Dino Team
- **Tipo:** serviço (consultoria de treino + dieta personalizada).
- **Status:** `ativo`.
- **Categoria:** `consultoria-online`.
- **Registro:** [`consultoria-dino-team/`](consultoria-dino-team/).
- **Dor que resolve:** dispersão + medo do teto + progresso invisível (ref `publico/dores.md`).
- **Público da oferta:** homens e mulheres 18–40 que treinam e não veem resultado proporcional ao esforço.
- **Promessa:** o método validado por quem saiu do zero absoluto ao topo mundial — direção, não atalho.
- **Modelo:** assinatura/serviço recorrente; venda pelo WhatsApp comercial; plataforma do aluno + app.
- **Preço:** ver `consultoria-dino-team/oferta.md` §Planos, preços e condições.
- **Verdade servida:** "vende direção, não motivação" (ref `brand/brand-book.md` §Verdades).
- **Canal de distribuição:** stories diários do @ramondinopro, @dinoteam, WhatsApp.
- **Origem:** produto pré-existente (~400 alunos ativos em jun/2026; o site oficial diz "+1000 alunos").

### Protocolo PPL + Upper/Lower
- **Tipo:** digital (PDF de treino, 10 páginas — low ticket).
- **Status:** `ativo` (a confirmar pelo usuário; divulgado nos stories do @ramondinopro em set/2026).
- **Categoria:** `protocolo-de-treino`.
- **Registro:** ainda não criado — criar com `/atualizar-produto protocolo-ppl-upper-lower` quando houver pedido de copy.
- **Promessa:** a estrutura de treino da preparação para o Olympia 2026, escrita em protocolo (5 treinos por semana, 6 semanas programadas, substituição para cada exercício).
- **Limite de claim:** o documento declara que não é a ficha oficial completa, nem prescrição clínica, nem endosso de Ramon Dino ou do treinador. Formulação permitida: "base de organização utilizada no treinamento de Ramon Dino".
- **Preço:** a confirmar pelo usuário.
- **Fonte:** pasta local do usuário `export/produtos/protocolo-ppl-upper-lower/` (fora do git).

### App de treino "by Ramon Dino"
- **Tipo:** digital (assinatura de app de treino).
- **Status:** `ativo` (a confirmar pelo usuário).
- **Categoria:** `app-de-treino`.
- **Registro:** ainda não criado.
- **O que se sabe (fonte pública):** assinatura de R$ 24,99/mês, mais de 200 exercícios, venda pela Hotmart com programa de afiliados — Revista Empreende, "Ramon Dino: do Olympia a uma plataforma de negócios" (revistaempreende.com.br/ramon-dino-olympia-2026-plataforma-negocios/), acesso em 2026-10-02.
- **Não confundir** com o app da consultoria (Ramon Dino App, Prime Coaching), que é entregável da Consultoria Dino Team.
```

- [ ] **Step 3: `memory/_schema.md` — linhas da tabela de slices**

Substituir:
```
| `publico/` | `pesquisador-mercado` (Produto alimenta) | dores, objeções (com a fala do público embutida) | criado (Onda 1) |
| `mercado/` | `pesquisador-mercado` | `narrativa-de-mercado.md`, `tendencias/`, `concorrentes/` | ativo |
```
por:
```
| `publico/` | `pesquisador-mercado` (Produto alimenta) | dores de vida e identidade (com a fala do público embutida); `objecoes.md` virou ponteiro — as objeções de compra estão no registro do produto | criado (Onda 1) |
| `mercado/` | `pesquisador-mercado` | `narrativa-de-mercado.md`, `tendencias/`, `concorrentes/`, `categorias/<categoria>.md` (o que cada categoria de produto oferece — fonte dos itens `mercado` do registro) | ativo |
```

Substituir:
```
`metricas.md` (o que gerou — criado, alimentado por `fetch_*` no futuro), `provas-de-aluno.md` | ativo |
| `produto/` | `estrategista-produto` | `catalogo.md` (produtos vivos + status), `oportunidades.md` (hipóteses testáveis), `economia.md` (humano), `funcao-objetivo.md` (humano) | criado (setor Produto — Sub-projeto A) |
```
por:
```
`metricas.md` (o que gerou — criado, alimentado por `fetch_*` no futuro) | ativo |
| `produto/` | `estrategista-produto` | `catalogo.md` (todos os produtos da marca Ramon Dino + status), registro por produto em `<produto>/` (ver §Registro por produto), `_modelo/`, `_regras-gerais.md`, `_revisao/<AAAA-MM>.md`, `oportunidades.md` (hipóteses testáveis), `economia.md` (humano), `funcao-objetivo.md` (humano) | criado (setor Produto — Sub-projeto A) |
```

- [ ] **Step 4: `memory/_schema.md` — leitura do setor Produto e direção Produto → Marketing**

Substituir:
```
**lê** o resto do cérebro para decidir produto (`publico/` dores+objeções, `mercado/`
```
por:
```
**lê** o resto do cérebro para decidir produto (`publico/` dores, `mercado/`
```

Substituir:
```
| Produto → Marketing | escreve a oferta em `produto/catalogo.md`; `estrategista-mercado` lê para promover |
```
por:
```
| Produto → Marketing | escreve a oferta no registro do produto (`produto/<produto>/`); as skills de conteúdo e o `estrategista-mercado` leem para promover |
```

Substituir:
```
| Voz direta do cliente | dores/objeções/provas reais dos ~400 alunos na descoberta (inclui `performance/provas-de-aluno.md`) | plataforma conecta / canal estruturado de captura |
```
por:
```
| Voz direta do cliente | dores/objeções/provas reais dos ~400 alunos na descoberta (as provas entram em `produto/<produto>/provas.md`) | plataforma conecta / canal estruturado de captura |
```

- [ ] **Step 5: `memory/_schema.md` — seção do formato do registro**

Substituir:
```
## Frontmatter padrão dos arquivos do cérebro
```
por:
```
## Registro por produto (`produto/<produto>/`)

Formato canônico (spec `docs/superpowers/specs/2026-10-02-registro-produto-e-voz-design.md` §4.1). Cada item é uma linha de tabela:

| Item | Como o cliente fala | Status | Revisado em | Fonte |
|---|---|---|---|---|

- **Status:** `confirmado` (o usuário revisou) · `mercado` (ainda não revisado — padrão da categoria ou fonte pública da marca) · `nao-oferece` (o usuário revisou: não temos; a copy nunca usa).
- **Revisado em:** `AAAA-MM-DD`; obrigatório em `confirmado` e `nao-oferece`. Condições e preços têm `Válida até` (data ou `sem data`). Colunas extras (`Resposta`, `Detalhe`, `Situação legal`) são permitidas.
- **Vencimento:** `confirmado` com mais de 90 dias; condição na data de validade; `sem data` → revisão mensal.
- **Escrita só por** `scripts/produto/aplicar_revisao.js` (usado pela `/atualizar-produto` e pela `/evoluir-produto`). Leitura e validação: `registro.js`, `validar_registro.js`, `itens_vencidos.js`.
- Arquivos que começam com `_` não são itens: `_indice.md` (gerado) e `_novidades.md` (caixa de entrada).

## Frontmatter padrão dos arquivos do cérebro
```

- [ ] **Step 6: `CLAUDE.md` §4 — slices**

Substituir:
```
- `memory/publico/` — dores e objeções com a fala do público embutida (owner: `pesquisador-mercado`).
- `memory/mercado/` — `narrativa-de-mercado.md` (discurso do nicho), `tendencias/`, `concorrentes/` (owner: `pesquisador-mercado`).
```
por:
```
- `memory/publico/` — dores de vida e identidade com a fala do público embutida (owner: `pesquisador-mercado`). As objeções de compra ficam no registro do produto.
- `memory/mercado/` — `narrativa-de-mercado.md` (discurso do nicho), `tendencias/`, `concorrentes/`, `categorias/` (o que cada categoria de produto oferece) (owner: `pesquisador-mercado`).
```

Substituir:
```
+ `metricas.md` (o que cada peça **gerou** — criado, alimentado por `fetch_*` no futuro, joinado por `slug`) + `provas-de-aluno.md` (owner: `analista-performance`).
- `memory/produto/` — `catalogo.md` (produtos vivos + status), `oportunidades.md` (hipóteses testáveis), `economia.md` + `funcao-objetivo.md` (input humano) (owner: `estrategista-produto`).
```
por:
```
+ `metricas.md` (o que cada peça **gerou** — criado, alimentado por `fetch_*` no futuro, joinado por `slug`) (owner: `analista-performance`).
- `memory/produto/` — `catalogo.md` (todos os produtos da marca Ramon Dino + status), **registro por produto** em `<produto>/` (oferta, entregáveis, benefícios, dores e objeções, diferenciais, provas, FAQ, regras — cada item com status `confirmado` | `mercado` | `nao-oferece`; modelo em `_modelo/`, regras legais gerais em `_regras-gerais.md`, revisão mensal em `_revisao/`), `oportunidades.md` (hipóteses testáveis), `economia.md` + `funcao-objetivo.md` (input humano) (owner: `estrategista-produto`; escrita do registro via `scripts/produto/aplicar_revisao.js`).
```

Substituir:
```
(fila `pesquisa/pedidos.md`; oferta lida no `catalogo.md`).
```
por:
```
(fila `pesquisa/pedidos.md`; oferta lida no registro do produto, `memory/produto/<produto>/`).
```

- [ ] **Step 7: Conferir**

Run: `grep -n "provas-de-aluno\|objecoes.md" CLAUDE.md memory/_schema.md`
Expected: nenhuma saída.

Run: `npm test`
Expected: `tests 104`, `fail 0`.

- [ ] **Step 8: Commit**

```bash
git add memory/publico/objecoes.md memory/produto/catalogo.md memory/_schema.md CLAUDE.md
git commit -m "docs(memory): objeções no registro, catálogo multi-produto e formato do registro no schema" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Fase 3 — Ligação com skills e agentes

### Task 14: `/novo-post` — §Voz e registro, marca e objetivo

**Files:**
- Modify: `.claude/skills/novo-post/SKILL.md`
- Modify: `templates/briefing.md`

- [ ] **Step 1: Fluxo, linha 5**

Substituir:
```
| 5 | ⚙ briefing (inline ou pré-pronto) + criar pasta | contexto, tema, estilo | 4 | ângulo/pilar/objetivo/slug/verdade + pasta |
```
por:
```
| 5 | ⚙ briefing (inline ou pré-pronto) + criar pasta | contexto, tema, estilo | 4 | marca/objetivo/ângulo/pilar/slug/verdade + pasta |
```

- [ ] **Step 2: Sintaxe**

Substituir:
```
/novo-post <formato> [estilo] [tema...]
/novo-post <formato> [estilo] --briefing <caminho/briefing-pre-pronto.md>
```
por:
```
/novo-post <formato> [estilo] [tema...] [--marca <ramon-dino|dino-team>] [--objetivo <objetivo>]
/novo-post <formato> [estilo] --briefing <caminho/briefing-pre-pronto.md>
```

Substituir:
```
- Ordem livre. Tokens são interpretados por correspondência com slugs; o resto vira tema.
```
por:
```
- **`--marca <ramon-dino|dino-team>`** — opcional. Default `dino-team`, a menos que o tema ou o briefing indiquem o perfil pessoal do Ramon.
- **`--objetivo <objetivo>`** — opcional. Um de `brand/voz/objetivos.md`; sem ele, deduzido no briefing pelas regras desse arquivo.
- Ordem livre. Tokens são interpretados por correspondência com slugs; o resto vira tema.
```

- [ ] **Step 3: Parse**

Substituir:
```
- `--auto` → `modo_auto = true`. Só válido junto de `--briefing`. Sem `--briefing`, ignore `--auto` e siga interativo.
```
por:
```
- `--auto` → `modo_auto = true`. Só válido junto de `--briefing`. Sem `--briefing`, ignore `--auto` e siga interativo.
- `--marca <valor>` → `marca`; `--objetivo <valor>` → `objetivo`. Briefing pré-pronto com `Marca:` e `Objetivo: <slug> — <frase>` também preenche os dois.
```

- [ ] **Step 4: Briefing estratégico**

Substituir:
```
Lê: `brand-book (§Verdades)` · `pilares-conteudo` · `ramon/contexto` · `performance/registro-angulos` · `mercado/tendencias/<mês>` · `estilo.md (§Conceito + #### editorial)`.

- **`modo_briefing = "pre-pronto"`** → pule a decisão; os campos já vieram do Passo 1 (incluindo `verdade_servida`).
```
por:
```
Lê: `brand-book (§Verdades)` · `pilares-conteudo` · `ramon/contexto` · `performance/registro-angulos` · `mercado/tendencias/<mês>` · `estilo.md (§Conceito + #### editorial)` · `brand/voz/objetivos.md`.

- **`modo_briefing = "pre-pronto"`** → pule a decisão; os campos já vieram do Passo 1 (incluindo `verdade_servida`). Se o briefing não trouxer marca ou o slug do objetivo, deduza só esses dois (mesmas regras abaixo).
```

Substituir:
```
  - **Objetivo** — 1 frase específica do que o post deve fazer no leitor.
```
por:
```
  - **Marca** — `ramon-dino` ou `dino-team` (de `--marca`, do briefing ou deduzida do tema; default `dino-team`).
  - **Objetivo** — `<slug> — <frase>`: o slug da lista fechada de `brand/voz/objetivos.md` (de `--objetivo` ou deduzido pelas regras desse arquivo; duas leituras reais → pergunte em uma linha) + 1 frase do que o post deve fazer no leitor.
```

- [ ] **Step 5: Copy — leitura e a seção canônica**

Substituir:
```
Lê: `estilo.md §editorial` (função, tom, [entregar], [ab] de cada bloco) · `tom-de-voz` · `publico-alvo` ·
```
por:
```
Lê: `estilo.md §editorial` (função, tom, [entregar], [ab] de cada bloco) · voz e registro do produto (§Voz e registro) · `publico-alvo` ·
```

Substituir:
```
**Aguarde resposta.** Se vier ajuste, edite `copy.md` inline (sem re-rodar pesquisa) e reapresente. Repita até "ok".

### 9. Design (⏸)
```
por:
```
**Aguarde resposta.** Se vier ajuste, edite `copy.md` inline (sem re-rodar pesquisa) e reapresente. Repita até "ok".

#### Voz e registro

Fonte única desta resolução — `/lote-posts`, `/novo-artigo`, `/novo-email`, `/novo-comunidade` e `/novo-site` apontam para cá. Camadas e ordem de prioridade: `brand/voz/README.md`. Leitura de demanda: `CLAUDE.md` §Como ler uma demanda.

1. **Voz:** Parte A de `brand/voz/ramon-dino.md` (sempre) → voz da `marca` (Parte B de `ramon-dino.md` ou `brand/voz/dino-team.md`) → seção do `objetivo` em `brand/voz/objetivos.md` → exemplos em `brand/voz/exemplos/<marca>-<objetivo>/` (se a pasta existir).
2. **Registro do produto:** quando a coluna "Carrega do registro" do objetivo listar arquivos, leia-os em `memory/produto/<produto>/` (produto citado na peça; default `consultoria-dino-team`) + `memory/produto/_regras-gerais.md`. Use itens `confirmado` e `mercado`; nunca `nao-oferece`.
   - Pasta do produto ausente → `PRODUTO_SEM_REGISTRO`: avise e ofereça `/atualizar-produto <produto>` (cria pelo `_modelo/`). Se o usuário seguir sem, use `memory/mercado/categorias/` e marque cada fato específico com `[confirmar: …]`.
   - Item que a peça usa está vencido (`node scripts/produto/itens_vencidos.js <produto>`) → pesquise fora (site, app, fontes públicas) antes de escrever; sem confirmação, espaço marcado.
   - Fato específico (preço, número, data, nome, depoimento) só de item `confirmado`, de fonte pública da marca anotada no registro ou do usuário.
   - Fato novo trazido pelo usuário no pedido → use e anote: `node scripts/produto/aplicar_revisao.js <produto> --novidade "<fato>" --origem pedido`.

### 9. Design (⏸)
```

- [ ] **Step 6: Gate de marca**

Substituir:
```
- Briefing inline:
  Pilar: <pilar>
  Objetivo: <objetivo>
  Ângulo central: <ângulo>
  Recorte de público: <recorte>
  Slug do post: <slug>

Avaliar: tom de voz, pilar, compliance (saúde, jurídico, suplementação, promessas irreais).
```
por:
```
- Briefing inline:
  Marca: <marca>
  Objetivo: <objetivo — slug + frase>
  Produto: <produto do registro usado | nenhum>
  Pilar: <pilar>
  Ângulo central: <ângulo>
  Recorte de público: <recorte>
  Slug do post: <slug>

Avaliar: voz pela marca e objetivo declarados (brand/voz/), pilar, regras legais (memory/produto/_regras-gerais.md + regras.md do produto) e compliance (saúde, jurídico, suplementação, promessas irreais).
```

- [ ] **Step 7: `templates/briefing.md`**

Substituir:
```
**Pilar:** {pilar}
**Objetivo:** {objetivo estratégico}
```
por:
```
**Marca:** {ramon-dino | dino-team}
**Pilar:** {pilar}
**Objetivo:** {slug de brand/voz/objetivos.md} — {objetivo estratégico}
```

- [ ] **Step 8: Conferir**

Run: `grep -n "tom-de-voz\|#### Voz e registro" .claude/skills/novo-post/SKILL.md`
Expected: só a linha `#### Voz e registro`.

- [ ] **Step 9: Commit**

```bash
git add .claude/skills/novo-post/SKILL.md templates/briefing.md
git commit -m "feat(novo-post): marca e objetivo + seção canônica Voz e registro" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 15: Demais skills de conteúdo apontam para §Voz e registro

**Files:**
- Modify: `.claude/skills/lote-posts/SKILL.md`, `.claude/skills/novo-artigo/SKILL.md`, `.claude/skills/novo-email/SKILL.md`, `.claude/skills/novo-comunidade/SKILL.md`, `.claude/skills/novo-site/SKILL.md`

- [ ] **Step 1: `/lote-posts`**

Substituir:
```
/lote-posts <formato> [N] [estilo[:K] ...] [tema-base...]
```
por:
```
/lote-posts <formato> [N] [estilo[:K] ...] [tema-base...] [--marca <ramon-dino|dino-team>] [--objetivo <objetivo>]
```

Substituir:
```
Ordem livre. Tokens são interpretados: número solto → N total; slug (com ou sem `:K`) → estilo; resto → tema-base.
```
por:
```
- **`--marca` / `--objetivo`** — opcionais; valem para o lote inteiro (cada post pode sobrescrever no briefing). Mesmas regras da /novo-post §Sintaxe.

Ordem livre. Tokens são interpretados: número solto → N total; slug (com ou sem `:K`) → estilo; resto → tema-base.
```

Substituir:
```
Fixe: ângulo central, pilar, objetivo, recorte de público, slug do post (kebab-case), **verdade servida**
```
por:
```
Fixe: **marca** e **objetivo** (`<slug> — <frase>`, como na /novo-post §Briefing estratégico + criar pasta), ângulo central, pilar, recorte de público, slug do post (kebab-case), **verdade servida**
```

Substituir:
```
Lê: `estilo.md §editorial` · `tom-de-voz` · `publico-alvo` · pesquisa gravada.
```
por:
```
Lê: `estilo.md §editorial` · voz e registro do produto (/novo-post §Voz e registro, por post) · `publico-alvo` · pesquisa gravada.
```

- [ ] **Step 2: `/novo-artigo`**

Substituir:
```
- **Objetivo** — 1 frase: o que o artigo deve fazer no leitor.
```
por:
```
- **Objetivo** — `<slug> — <frase>`: slug de `brand/voz/objetivos.md` (padrão `educar`) + o que o artigo deve fazer no leitor. Marca do blog: `dino-team`.
```

Substituir:
```
- `brand/tom-de-voz.md`
- `brand/publico-alvo.md`
- `templates/artigo.md` (esqueleto de seções)
```
por:
```
- voz e registro do produto — /novo-post §Voz e registro (marca `dino-team`; objetivo do plano)
- `brand/publico-alvo.md`
- `templates/artigo.md` (esqueleto de seções)
```

Substituir:
```
- Tom: `brand/tom-de-voz.md`. Sem motivação vazia; sem vitimismo; sem vender no corpo.
```
por:
```
- Tom: a voz resolvida acima. Sem motivação vazia; sem vitimismo; sem vender no corpo.
```

Substituir:
```
  Pilar: <pilar>
  Objetivo: <objetivo>
  Ângulo central: <ângulo>
  Recorte de público: <recorte>
  Slug: <slug>

Avaliar: tom de voz, pilar, compliance (saúde, jurídico, suplementação, promessas irreais).
```
por:
```
  Marca: dino-team
  Objetivo: <objetivo — slug + frase>
  Pilar: <pilar>
  Ângulo central: <ângulo>
  Recorte de público: <recorte>
  Slug: <slug>

Avaliar: voz pela marca e objetivo declarados (brand/voz/), pilar, regras legais (memory/produto/_regras-gerais.md) e compliance (saúde, jurídico, suplementação, promessas irreais).
```

- [ ] **Step 3: `/novo-email`**

Substituir:
```
- **Objetivo** — 1 frase: o que este e-mail deve fazer no leitor.
```
por:
```
- **Objetivo** — `<slug> — <frase>`: slug de `brand/voz/objetivos.md` (padrão `conectar`) + o que este e-mail deve fazer no leitor. Marca: `dino-team`, salvo pedido em contrário.
```

Substituir:
```
- `brand/tom-de-voz.md`
- `brand/publico-alvo.md`
- `templates/email.md` (esqueleto de campos)
```
por:
```
- voz e registro do produto — /novo-post §Voz e registro (marca e objetivo do plano)
- `brand/publico-alvo.md`
- `templates/email.md` (esqueleto de campos)
```

Substituir:
```
  Pilar: <pilar>
  Objetivo: <objetivo>
  Ângulo central: <ângulo>
  Recorte de público: <recorte>
  Slug: <slug>

Avaliar: tom de voz, pilar, compliance (saúde, jurídico, suplementação, promessas irreais).
```
por:
```
  Marca: <marca>
  Objetivo: <objetivo — slug + frase>
  Pilar: <pilar>
  Ângulo central: <ângulo>
  Recorte de público: <recorte>
  Slug: <slug>

Avaliar: voz pela marca e objetivo declarados (brand/voz/), pilar, regras legais (memory/produto/_regras-gerais.md) e compliance (saúde, jurídico, suplementação, promessas irreais).
```

- [ ] **Step 4: `/novo-comunidade`**

Substituir:
```
- `brand/tom-de-voz.md`
- `brand/publico-alvo.md`
- `templates/comunidade.md` (esqueleto de campos)
```
por:
```
- voz e registro do produto — /novo-post §Voz e registro (marca `dino-team`, objetivo `conectar`)
- `brand/publico-alvo.md`
- `templates/comunidade.md` (esqueleto de campos)
```

Substituir:
```
  Tema: <tema>
  Verdade servida: <verdade_servida>
  Slug: <slug>

Avaliar: tom de voz (conversa, não marketing), compliance (saúde, jurídico, suplementação, promessas irreais).
```
por:
```
  Marca: dino-team
  Objetivo: conectar
  Tema: <tema>
  Verdade servida: <verdade_servida>
  Slug: <slug>

Avaliar: voz pela marca e objetivo declarados (brand/voz/ — conversa, não marketing), regras legais (memory/produto/_regras-gerais.md) e compliance (saúde, jurídico, suplementação, promessas irreais).
```

- [ ] **Step 5: `/novo-site`**

Substituir:
```
- `brand/brand-book.md`, `brand/tom-de-voz.md`, `brand/publico-alvo.md`, `brand/referencias-visuais.md` — identidade da marca.
```
por:
```
- `brand/brand-book.md`, `brand/publico-alvo.md`, `brand/referencias-visuais.md` — identidade da marca.
- Voz e registro do produto — /novo-post §Voz e registro (marca `dino-team`, objetivo `vender`, produto `consultoria-dino-team`): benefícios, entregáveis, provas e FAQ da home saem do registro.
```

- [ ] **Step 6: `--marca` e `--objetivo` nas quatro skills restantes (critério de aceite 4)**

Em `.claude/skills/novo-artigo/SKILL.md`, substituir:
```
/novo-artigo <tema> [--pilar <pilar>]
```
por:
```
/novo-artigo <tema> [--pilar <pilar>] [--marca <ramon-dino|dino-team>] [--objetivo <objetivo>]
```
e substituir:
```
- **`[--pilar <pilar>]`** — opcional. Slug do pilar de `brand/pilares-conteudo.md`.
```
por:
```
- **`[--pilar <pilar>]`** — opcional. Slug do pilar de `brand/pilares-conteudo.md`.
- **`[--marca]` / `[--objetivo]`** — opcionais; padrão `dino-team` e `educar`. Regras: /novo-post §Sintaxe.
```

Em `.claude/skills/novo-email/SKILL.md`, substituir:
```
/novo-email <tema> [--pilar <pilar>]
```
por:
```
/novo-email <tema> [--pilar <pilar>] [--marca <ramon-dino|dino-team>] [--objetivo <objetivo>]
```
e substituir:
```
- **`[--pilar <pilar>]`** — opcional. Slug do pilar de `brand/pilares-conteudo.md`.
```
por:
```
- **`[--pilar <pilar>]`** — opcional. Slug do pilar de `brand/pilares-conteudo.md`.
- **`[--marca]` / `[--objetivo]`** — opcionais; padrão `dino-team` e `conectar`. Regras: /novo-post §Sintaxe.
```

Em `.claude/skills/novo-comunidade/SKILL.md`, substituir:
```
/novo-comunidade <tema>
```
por:
```
/novo-comunidade <tema> [--marca <ramon-dino|dino-team>] [--objetivo <objetivo>]
```
e substituir:
```
- **`<tema>`** — obrigatório. Texto livre descrevendo o tema ou a conversa a iniciar na comunidade.
```
por:
```
- **`<tema>`** — obrigatório. Texto livre descrevendo o tema ou a conversa a iniciar na comunidade.
- **`[--marca]` / `[--objetivo]`** — opcionais; padrão `dino-team` e `conectar`. Regras: /novo-post §Sintaxe. Quando vierem, substituem os valores fixos do gate de marca.
```

Em `.claude/skills/novo-site/SKILL.md`, substituir:
```
/novo-site [descrição livre da alteração — só usado em modo alteração]
```
por:
```
/novo-site [descrição livre da alteração — só usado em modo alteração] [--marca <ramon-dino|dino-team>] [--objetivo <objetivo>]
```
e substituir:
```
- **Sem argumento + site não existe** → modo criação completo.
```
por:
```
- **`--marca` / `--objetivo`** — opcionais; padrão `dino-team` e `vender` (home da consultoria). Regras: /novo-post §Sintaxe.
- **Sem argumento + site não existe** → modo criação completo.
```

- [ ] **Step 7: Conferir**

Run: `grep -n "tom-de-voz" .claude/skills/lote-posts/SKILL.md .claude/skills/novo-artigo/SKILL.md .claude/skills/novo-email/SKILL.md .claude/skills/novo-comunidade/SKILL.md .claude/skills/novo-site/SKILL.md`
Expected: nenhuma saída.

Run: `grep -c "\-\-objetivo" .claude/skills/novo-post/SKILL.md .claude/skills/lote-posts/SKILL.md .claude/skills/novo-artigo/SKILL.md .claude/skills/novo-email/SKILL.md .claude/skills/novo-comunidade/SKILL.md .claude/skills/novo-site/SKILL.md`
Expected: todos os 6 arquivos com contagem ≥ 1.

- [ ] **Step 8: Commit**

```bash
git add .claude/skills/lote-posts .claude/skills/novo-artigo .claude/skills/novo-email .claude/skills/novo-comunidade .claude/skills/novo-site
git commit -m "feat(skills): conteúdo resolve voz e registro pela /novo-post §Voz e registro" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 16: Revisor de marca julga por marca e objetivo

**Files:**
- Modify: `.claude/agents/revisor-brand.md`

- [ ] **Step 1: Descrição (frontmatter)**

Substituir:
```
contra brand book — tom de voz, paleta, tipografia, pilares, identidade declarada — E contra compliance (promessas proibidas, claims sensíveis de saúde/jurídico/suplementação/resultados irreais).
```
por:
```
contra a hierarquia de voz (`brand/voz/`: Parte A + voz da marca + objetivo declarados), paleta, tipografia, pilares e identidade declarada — E contra compliance (regras legais do registro de produto; claims sensíveis de saúde/jurídico/suplementação/resultados irreais).
```

- [ ] **Step 2: Gate em 2 momentos**

Substituir:
```
| **Criação de post** (`/novo-post`, `/lote-posts`) | Copy (tom de voz) **+ compliance** (claims/promessas).
```
por:
```
| **Criação de post** (`/novo-post`, `/lote-posts`) | Copy (voz pela marca e objetivo) **+ compliance** (claims/promessas).
```

- [ ] **Step 3: Contexto que carrego**

Substituir:
```
- `brand/tom-de-voz.md` — como a marca fala.
```
por:
```
- `brand/voz/README.md` — hierarquia de voz e ordem quando regras brigam.
- `brand/voz/ramon-dino.md` — Parte A (vale para tudo) + voz do Ramon.
- `brand/voz/dino-team.md` — voz da Dino Team.
- `brand/voz/objetivos.md` — o que cada objetivo exige.
- `memory/produto/_regras-gerais.md` — regras legais de qualquer produto.
```

Substituir:
```
- `brand/compliance/termos-vetados.md` (quando existir) — lista de termos e expressões proibidos.
```
por:
```
- `brand/compliance/termos-vetados.md` (quando existir) — lista de termos e expressões proibidos.
- `memory/produto/<produto>/regras.md` — regras do produto citado na peça.
- `brand/voz/exemplos/<marca>-<objetivo>/` — referência aprovada da combinação.
```

- [ ] **Step 4: Princípios**

Substituir:
```
- **Tom de voz é lei.** Vocabulário a usar e proibido em `brand/tom-de-voz.md` mandam — releio antes de cada parecer.
```
por:
```
- **Voz por marca e objetivo.** Julgo pela marca e pelo objetivo declarados na tarefa: Parte A de `brand/voz/ramon-dino.md` sempre; depois a voz da marca (Parte B de `ramon-dino.md` ou `brand/voz/dino-team.md`) e o objetivo (`brand/voz/objetivos.md`). Exclamação e "shape" passam na voz do Ramon e reprovam no conteúdo de marca da Dino Team. Releio as camadas antes de cada parecer.
```

Substituir:
```
Ler `brand/compliance/termos-vetados.md` quando existir.
```
por:
```
Ler `brand/compliance/termos-vetados.md` quando existir. Regras legais: `memory/produto/_regras-gerais.md` + `regras.md` do produto (fonte única). Escassez inventada, fato sem fonte (depoimento, número, prova) e promessa de resultado em prazo reprovam sempre (Parte A).
```

- [ ] **Step 5: Recebo**

Substituir:
```
- **Saída:** `inline` (parecer markdown).

Sem `Tarefa` ou `Inputs`, devolvo `INPUT_INSUFICIENTE — <o que falta>`.
```
por:
```
- **Saída:** `inline` (parecer markdown).
- **Marca** (`ramon-dino` | `dino-team`) e **objetivo** (`brand/voz/objetivos.md`) — obrigatórios no momento post.

Sem `Tarefa` ou `Inputs`, devolvo `INPUT_INSUFICIENTE — <o que falta>`. No momento post sem marca ou objetivo: `INPUT_INSUFICIENTE — marca e objetivo`.
```

- [ ] **Step 6: Schema do parecer de post**

Substituir:
```
- Tom de voz: {ok / violação específica com arquivo + trecho}
- Pilar: {ok / fora de pilar}
```
por:
```
- Parte A + regras legais: {ok / violação com arquivo + trecho + regra}
- Voz (marca <marca> · objetivo <objetivo>): {ok / violação específica com arquivo + trecho + camada da regra}
- Pilar: {ok / fora de pilar}
```

- [ ] **Step 7: Conferir e commitar**

Run: `grep -n "tom-de-voz" .claude/agents/revisor-brand.md`
Expected: nenhuma saída.

```bash
git add .claude/agents/revisor-brand.md
git commit -m "feat(revisor-brand): julga pela marca e objetivo declarados; regras legais do registro" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 17: Agentes de produto, mercado, pesquisa e performance

**Files:**
- Modify: `.claude/agents/estrategista-produto.md`, `.claude/agents/estrategista-mercado.md`, `.claude/agents/pesquisador-mercado.md`, `.claude/agents/analista-performance.md`
- Modify: `.claude/skills/pesquisar-tema/SKILL.md`

- [ ] **Step 1: `estrategista-produto`**

Substituir:
```
- `memory/produto/catalogo.md`, `oportunidades.md`, `economia.md` (input humano), `funcao-objetivo.md` (input humano).
```
por:
```
- `memory/produto/catalogo.md`, `oportunidades.md`, `economia.md` (input humano), `funcao-objetivo.md` (input humano).
- `memory/produto/<produto>/` — registro por produto (formato em `memory/_schema.md` §Registro por produto). Escrita só por `scripts/produto/aplicar_revisao.js` (chamado pela `/atualizar-produto` e pela `/evoluir-produto`).
```

Substituir:
```
- `memory/publico/dores.md` + `objecoes.md` — dor/objeção real (origem das hipóteses).
```
por:
```
- `memory/publico/dores.md` — dor de vida e identidade (origem das hipóteses).
- `memory/mercado/categorias/<categoria>.md` — o que a categoria oferece; o que o mercado tem e o registro marca `nao-oferece` é sinal de oportunidade.
```

Substituir:
```
- `memory/performance/registro-angulos.md` + `provas-de-aluno.md` (quando existir) — o que ressoou; prova.
```
por:
```
- `memory/performance/registro-angulos.md` — o que ressoou. Provas e objeções de compra estão no registro do produto (`provas.md`, `dores-e-objecoes.md`).
```

Substituir:
```
- **Marca como guard-rail.** Toda oferta cabe num pilar e serve uma verdade. Off-brand → recusa.
```
por:
```
- **Marca como guard-rail.** Toda oferta cabe num pilar e serve uma verdade. Off-brand → recusa.
- **Registro é fato, não estratégia.** O registro por produto diz o que o produto é hoje; a estratégia (criar, evoluir, matar) fica nas tarefas abaixo. Em `descobrir-oportunidade`, itens `nao-oferece` são sinal de oportunidade.
```

- [ ] **Step 2: `estrategista-mercado`**

Substituir:
```
- `brand/tom-de-voz.md` — registro sereno; para propor ângulo já no tom.
```
por:
```
- `brand/voz/README.md` + `brand/voz/dino-team.md` — hierarquia de voz e o registro sereno da Dino Team; para propor ângulo já no tom.
```

Substituir:
```
- `memory/publico/dores.md` + `memory/publico/objecoes.md` — emoção/dor crua do público.
```
por:
```
- `memory/publico/dores.md` + `memory/produto/consultoria-dino-team/dores-e-objecoes.md` — emoção/dor crua do público e objeções de compra.
```

- [ ] **Step 3: `pesquisador-mercado`**

Substituir:
```
e a fala do público em `publico/dores.md` + `publico/objecoes.md`. Outros agentes apenas leem os slices.
```
por:
```
a fala do público em `publico/dores.md` e o mapa de cada categoria de produto em `mercado/categorias/<categoria>.md`. Outros agentes apenas leem os slices.
```

Substituir:
```
Em `memory/publico/`, registro **dores** e **objeções** do público com a fala dele embutida (em contexto); o setor de Produto propõe entradas, eu consolido.
```
por:
```
Em `memory/publico/`, registro **dores** de vida e identidade com a fala do público embutida (em contexto); o setor de Produto propõe entradas, eu consolido. **Objeções de compra** vivem no registro do produto (`memory/produto/<produto>/dores-e-objecoes.md`, dono `estrategista-produto`): quando eu achar uma nova, proponho na seção "Sugestão para o registro do produto" do arquivo de pesquisa.
```

Substituir:
```
- `memory/publico/dores.md` + `memory/publico/objecoes.md` — a fala do público (termos/jargões/dores em linguagem do leitor) embutida em cada entrada.
```
por:
```
- `memory/publico/dores.md` — a fala do público (termos/jargões/dores em linguagem do leitor) embutida em cada entrada.
```

Substituir:
```
- `memory/publico/dores.md` + `objecoes.md` — enriqueça com a fala do público (termos/jargões em contexto).
```
por:
```
- `memory/publico/dores.md` — enriqueça com a fala do público (termos/jargões em contexto).
- `memory/mercado/categorias/<categoria>.md` — para cada categoria de produto ativo em `memory/produto/catalogo.md` (campo **Categoria**): o que as concorrentes oferecem, prometem e garantem, e do que o público reclama, com fonte. Mantenha o formato do arquivo (tabelas + `## Fontes consultadas`).
```

- [ ] **Step 4: `analista-performance`**

Apagar a linha:
```
- `memory/performance/provas-de-aluno.md` — provas reais de aluno via o **Sub-projeto B** do setor de Produto (dormente; crie com frontmatter padrão se não existir).
```

Substituir:
```
4. **Registrar prova de aluno** — resultado real de consultoria proposto pelo **Sub-projeto B** do setor de Produto (dormente até a plataforma conectar). Serve o pilar Transformação / Prova viva. Grava em `memory/performance/provas-de-aluno.md` (crie com frontmatter padrão se não existir). A prova é de aluno real — não inventar dado.
```
por:
```
4. **Propor prova de aluno** — resultado real de consultoria (Sub-projeto B, dormente até a plataforma conectar) vira proposta para o registro do produto (`memory/produto/<produto>/provas.md`, dono `estrategista-produto`, escrita via `scripts/produto/aplicar_revisao.js`). Serve o pilar Transformação / Prova viva. A prova é de aluno real — não inventar dado.
```

- [ ] **Step 5: `/pesquisar-tema`**

Substituir:
```
| **Transformação** | Interno: `memory/performance/provas-de-aluno.md` + `memory/publico/`; externo leve |
```
por:
```
| **Transformação** | Interno: `memory/produto/<produto>/provas.md` + `memory/publico/`; externo leve |
```

- [ ] **Step 6: Conferir e commitar**

Run: `grep -rn "provas-de-aluno\|publico/objecoes\|\`objecoes.md\`\|tom-de-voz.md" .claude/agents .claude/skills/pesquisar-tema`
Expected: nenhuma saída.

```bash
git add .claude/agents .claude/skills/pesquisar-tema
git commit -m "feat(agentes): registro por produto, mapa da categoria e provas no registro" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 18: Skills de marca escrevem em `brand/voz/`

**Files:**
- Modify: `.claude/skills/afinar-tom-de-voz/SKILL.md`, `.claude/skills/brand-discovery/SKILL.md`

- [ ] **Step 1: `/afinar-tom-de-voz` — descrição e abertura**

Substituir:
```
Use sempre que o usuário quiser aprimorar, calibrar ou aprofundar o arquivo brand/tom-de-voz.md — mesmo que ele já esteja preenchido.
```
por:
```
Use sempre que o usuário quiser aprimorar, calibrar ou aprofundar a voz em brand/voz/ (Parte A e voz do Ramon em ramon-dino.md, voz da Dino Team em dino-team.md, objetivos e exemplos aprovados) — mesmo que já esteja preenchida — ou aprovar uma peça como exemplo.
```

Substituir:
```
Entrevista de refinamento do `brand/tom-de-voz.md` via múltipla escolha com copy real.
```
por:
```
Entrevista de refinamento de **uma camada** de `brand/voz/` (ver `brand/voz/README.md`) via múltipla escolha com copy real.
```

Substituir:
```
| 0 | Diagnóstico | `brand/tom-de-voz.md` atual | mapa: fixado vs. refinável |
```
por:
```
| 0 | Diagnóstico | camada escolhida de `brand/voz/` | mapa: fixado vs. refinável |
```

Substituir:
```
Leia `brand/tom-de-voz.md` e `brand/brand-book.md`.
```
por:
```
Pergunte qual camada afinar: **Parte A** ou **voz do Ramon** (`brand/voz/ramon-dino.md`), **voz da Dino Team** (`brand/voz/dino-team.md`) ou **um objetivo** (`brand/voz/objetivos.md`). Leia a camada escolhida, `brand/voz/README.md` e `brand/brand-book.md`.
```

Substituir:
```
**3. Após confirmação, reescreva `brand/tom-de-voz.md`** com:
```
por:
```
**3. Após confirmação, reescreva o arquivo da camada escolhida em `brand/voz/`** com:
```

Substituir:
```
Ofereça sugestão de commit git: `refine(brand): afinar tom-de-voz via entrevista de calibração`
```
por:
```
Ofereça sugestão de commit git: `refine(brand): afinar voz (<camada>) via entrevista de calibração`
```

- [ ] **Step 2: `/afinar-tom-de-voz` — modo "aprovar exemplo"**

Substituir:
```
## Princípios da condução
```
por:
````
## Aprovar exemplo (modo atalho)

`/afinar-tom-de-voz --aprovar-exemplo <caminho-da-peça> --marca <ramon-dino|dino-team> --objetivo <objetivo>` — sem entrevista. Confirme com o usuário e grave o texto aprovado, literal, em `brand/voz/exemplos/<marca>-<objetivo>/<AAAA-MM-DD>-<slug>.md`:

```markdown
---
marca: <marca>
objetivo: <objetivo>
canal: <canal>
aprovado_em: <AAAA-MM-DD>
origem: <caminho da peça>
---

# <título curto>

<texto literal da peça>

## Por que é referência

- <2 a 3 linhas ditas pelo usuário>
```

## Princípios da condução
````

- [ ] **Step 3: `/brand-discovery`**

Substituir:
```
Preenche brand-book.md, tom-de-voz.md, publico-alvo.md, pilares-conteudo.md e referencias-visuais.md de forma incremental.
```
por:
```
Preenche brand-book.md, a voz em voz/ (ramon-dino.md e dino-team.md), publico-alvo.md, pilares-conteudo.md e referencias-visuais.md de forma incremental.
```

Substituir:
```
**Bloco D — Tom de voz (`tom-de-voz.md`)**
```
por:
```
**Bloco D — Voz (`brand/voz/`)** — pergunte se é a voz do Ramon (`ramon-dino.md`, Parte B) ou da Dino Team (`dino-team.md`); o que vale para as duas vai na Parte A de `ramon-dino.md`.
```

Substituir:
```
- [Tom de voz](tom-de-voz.md)
```
por:
```
- [Voz — hierarquia Ramon Dino → Dino Team](voz/README.md)
```

- [ ] **Step 4: Conferir e commitar**

Run: `grep -n "tom-de-voz.md" .claude/skills/afinar-tom-de-voz/SKILL.md .claude/skills/brand-discovery/SKILL.md`
Expected: nenhuma saída.

```bash
git add .claude/skills/afinar-tom-de-voz .claude/skills/brand-discovery
git commit -m "feat(skills-marca): afinar e brand-discovery escrevem em brand/voz; modo aprovar exemplo" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 19: Skills de produto e de pesquisa de mercado

**Files:**
- Modify: `.claude/skills/criar-produto/SKILL.md`, `.claude/skills/evoluir-produto/SKILL.md`, `.claude/skills/pesquisar-mercado/SKILL.md`

- [ ] **Step 1: `/criar-produto` — fluxo**

Substituir:
```
| 4 | `estrategista-produto` (`arquitetar-oferta`) | oportunidade + respostas ← 3 | 3 | blueprint no `catalogo.md` status `em-validação` |
```
por:
```
| 4 | `estrategista-produto` (`arquitetar-oferta`) + ⚙ criar registro | oportunidade + respostas ← 3 | 3 | blueprint no `catalogo.md` status `em-validação` + pasta `memory/produto/<slug>/` |
```

- [ ] **Step 2: `/criar-produto` — arquitetar a oferta**

Substituir:
```
Ele grava o blueprint no `catalogo.md` com status `em-validação` e devolve manifesto
(verdade, pilar, preço proposto, delegação de asset).
```
por:
````
Ele grava o blueprint no `catalogo.md` com status `em-validação` e devolve manifesto
(verdade, pilar, preço proposto, delegação de asset).

Em seguida, crie o registro do produto a partir do modelo (ação determinística, sem decisão):

```bash
cp -R memory/produto/_modelo memory/produto/<slug>
perl -pi -e "s/<produto>/<slug>/g; s/AAAA-MM-DD/$(date +%F)/g" memory/produto/<slug>/*.md
```

O registro nasce vazio; os itens entram pela `/atualizar-produto <slug> --novidade` conforme o produto se define.
````

- [ ] **Step 3: `/criar-produto` — critério**

Substituir:
```
- `catalogo.md` tem o produto com status `em-validação` e blueprint completo.
```
por:
```
- `catalogo.md` tem o produto com status `em-validação` e blueprint completo.
- `memory/produto/<slug>/` criado a partir de `memory/produto/_modelo/`.
```

- [ ] **Step 4: `/evoluir-produto`**

Substituir:
```
| 4 | ⚙ aplicar no `catalogo.md` | decisões ← 3 | 3 | status/oferta atualizados |
```
por:
```
| 4 | ⚙ aplicar no `catalogo.md` + registro do produto | decisões ← 3 | 3 | status/oferta atualizados |
```

Substituir:
```
cérebro: `publico/objecoes.md`, tendências, e qualquer resultado de mercado registrado).
```
por:
```
cérebro: objeções e itens `nao-oferece` do registro do produto (`memory/produto/<slug>/`), tendências, e qualquer resultado de mercado registrado).
```

Substituir:
```
status `em-evolução`; sunset confirmado → status `aposentado` + motivo. Novas
oportunidades surgidas do sinal → o agente as grava em `oportunidades.md` (realimenta a
descoberta).
```
por:
```
status `em-evolução`; sunset confirmado → status `aposentado` + motivo. Novas
oportunidades surgidas do sinal → o agente as grava em `oportunidades.md` (realimenta a
descoberta). Mudança aprovada que altera o que o produto entrega ou oferece → grave também
no registro pelo caminho único de escrita: `node scripts/produto/aplicar_revisao.js <slug> --arquivo <arquivo.md> --item "<texto atual>" --status confirmado --novo-texto "<novo texto>"` (item novo: `--adicionar ... --status confirmado`).
```

- [ ] **Step 5: `/pesquisar-mercado`**

Substituir:
```
Saída: gravar/atualizar memory/mercado/tendencias/<YYYY-MM>.md, memory/mercado/concorrentes/<slug>.md e memory/publico/ (dores/objeções) conforme a metodologia do modo scouting de mercado.
```
por:
```
Saída: gravar/atualizar memory/mercado/tendencias/<YYYY-MM>.md, memory/mercado/concorrentes/<slug>.md, memory/publico/dores.md e memory/mercado/categorias/<categoria>.md para cada categoria de produto ativo em memory/produto/catalogo.md (campo Categoria), conforme a metodologia do modo scouting de mercado.
```

Substituir:
```
- `memory/mercado/tendencias/<YYYY-MM>.md` existe e foi atualizado com a varredura do mês.
```
por:
```
- `memory/mercado/tendencias/<YYYY-MM>.md` existe e foi atualizado com a varredura do mês.
- `memory/mercado/categorias/<categoria>.md` atualizado para cada categoria de produto ativo.
```

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/criar-produto .claude/skills/evoluir-produto .claude/skills/pesquisar-mercado
git commit -m "feat(skills-produto): criar-produto cria o registro; evoluir grava pelo caminho único; mercado mantém a categoria" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 20: Varredura — nenhum caminho antigo sobrando

**Files:**
- Test: `scripts/produto/varredura.test.js`

- [ ] **Step 1: Escrever o teste**

`scripts/produto/varredura.test.js`:
```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const ALVOS_ANTIGOS = ["tom-de-voz.md", "`tom-de-voz`", "publico/objecoes.md", "`objecoes.md`", "provas-de-aluno.md"];

function arquivosMd(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((nome) => {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) return nome === "worktrees" ? [] : arquivosMd(caminho);
    return nome.endsWith(".md") ? [caminho] : [];
  });
}

test("nenhum agente, skill, CLAUDE.md ou schema aponta para os caminhos antigos", () => {
  const arquivos = [...arquivosMd(".claude/agents"), ...arquivosMd(".claude/skills"), "CLAUDE.md", "memory/_schema.md"];
  const achados = [];
  for (const arquivo of arquivos) {
    readFileSync(arquivo, "utf8")
      .split("\n")
      .forEach((linha, i) => {
        for (const alvo of ALVOS_ANTIGOS) if (linha.includes(alvo)) achados.push(`${arquivo}:${i + 1} → ${alvo}`);
      });
  }
  assert.deepEqual(achados, []);
});
```

- [ ] **Step 2: Rodar**

Run: `node --test scripts/produto/varredura.test.js`
Expected: PASS. Se falhar, a mensagem lista `arquivo:linha → alvo`: troque cada referência pelo caminho novo (`brand/voz/...`, `memory/produto/<produto>/dores-e-objecoes.md`, `memory/produto/<produto>/provas.md`) e rode de novo.

- [ ] **Step 3: Suíte inteira**

Run: `npm test`
Expected: `tests 105`, `fail 0`.

- [ ] **Step 4: Commit**

```bash
git add scripts/produto/varredura.test.js
git commit -m "test(produto): varredura contra caminhos antigos de voz, objeções e provas" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Fase 4 — Atualização recorrente

### Task 21: Skill `/atualizar-produto`

**Files:**
- Create: `.claude/skills/atualizar-produto/SKILL.md`

- [ ] **Step 1: Criar o arquivo**

````markdown
---
name: atualizar-produto
description: Mantém vivo o registro de um produto da marca Ramon Dino (memory/produto/<produto>/) — revisão em lotes de 10 (confirma, "não oferece" ou corrige), novidade solta colada pelo usuário e preparação mensal (itens novos do mercado + vencidos → lista de revisão). Escrita só pelo script scripts/produto/aplicar_revisao.js. Sintaxe — /atualizar-produto <produto | --todos> [--revisao | --novidade "<texto>" | --preparar].
---

# /atualizar-produto

Registra o que o produto **é hoje**. Não decide o que ele deveria virar (`/evoluir-produto`) nem cria produto novo (`/criar-produto`). Formato do registro: `memory/_schema.md` §Registro por produto. Spec: `docs/superpowers/specs/2026-10-02-registro-produto-e-voz-design.md` §4.5.

## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ parse + checar registro | input | — | produto(s), modo |
| 2 | ⚙ preparar (modo `--preparar`) | mapa da categoria, registro ← 1 | 1 | itens novos como `mercado` + `_revisao/<AAAA-MM>.md` |
| 3 | ⚙ revisão em lotes + ⏸ (modo `--revisao`) | pendências ← 1 | 1 | itens confirmados, `nao-oferece` ou corrigidos |
| 4 | ⚙ novidade (modo `--novidade`) | texto ← 1 | 1 | itens atualizados ou criados |
| 5 | ⚙ validar + índice + relatório | registro ← 2, 3 ou 4 | 2, 3 ou 4 | validação ok, `_indice.md`, resumo |

## Sintaxe

```
/atualizar-produto <produto> [--revisao]
/atualizar-produto <produto> --novidade "<texto>"
/atualizar-produto --todos --preparar
```

- **`<produto>`** — pasta em `memory/produto/` (ex.: `consultoria-dino-team`).
- **`--revisao`** — padrão quando nenhum modo é passado.
- **`--novidade "<texto>"`** — o usuário informa um fato novo.
- **`--preparar`** — usado pela rotina `revisao-produtos-cron` (dia 3).

## Modo rotina

`--preparar` roda sem pausa humana. **Nunca** marca item como `confirmado` ou `nao-oferece` — só acrescenta itens `mercado`, gera a lista de revisão e os índices. Revisão e novidade são sempre com o usuário.

## Pipeline

### 1. Parsear e checar o registro

Lê: `memory/produto/` (pastas) · `memory/produto/catalogo.md` (campo Categoria).

- Produto sem `oferta.md` na pasta → `PRODUTO_SEM_REGISTRO`: ofereça criar a pasta pelo modelo (`cp -R memory/produto/_modelo memory/produto/<produto>` + `perl -pi -e "s/<produto>/<produto>/g; s/AAAA-MM-DD/$(date +%F)/g" memory/produto/<produto>/*.md`, trocando o segundo `<produto>` pelo slug) e pare até o usuário responder.
- `--todos` → todas as pastas de produto com registro (as mesmas que `node scripts/produto/validar_registro.js --todos` valida).

### 2. Preparar (modo `--preparar`)

Lê: `memory/mercado/categorias/<categoria>.md` · registro do produto.

1. Compare o mapa da categoria com o registro. Para cada entregável, benefício, dor, objeção ou diferencial do mapa que **não** existe no registro (mesmo sentido, não só mesmo texto), acrescente como `mercado`:
   ```bash
   node scripts/produto/aplicar_revisao.js <produto> --arquivo <arquivo.md> --adicionar --secao "<título da seção>" --item "<texto>" --fala "<como o cliente fala>" --status mercado --fonte "mercado/categorias/<categoria>.md"
   ```
2. Gere a revisão do mês e os índices:
   ```bash
   node scripts/produto/itens_vencidos.js --todos --indice --revisao "$(date +%Y-%m)"
   ```

### 3. Revisão em lotes (⏸)

Lê: `node scripts/produto/itens_vencidos.js <produto> --json` (pendências) · `memory/produto/<produto>/_novidades.md` (linhas `pendente`).

Apresente **10 itens por vez**, numerados:

```
Revisão — <produto> (lote 1 de N)

1. [entregaveis.md] Vídeo de execução de cada exercício
   Como o cliente fala: "não sei se tô fazendo certo"
   Fonte: mercado/categorias/consultoria-online.md · Motivo: padrão de mercado, ainda não revisado
...

Para cada número: c (confirma) · n (não oferece) · corrige: <texto certo>
Ou "parar" para continuar outro dia.
```

Aplique cada resposta:

```bash
node scripts/produto/aplicar_revisao.js <produto> --arquivo <arquivo.md> --item "<texto atual>" --status confirmado
node scripts/produto/aplicar_revisao.js <produto> --arquivo <arquivo.md> --item "<texto atual>" --status nao-oferece
node scripts/produto/aplicar_revisao.js <produto> --arquivo <arquivo.md> --item "<texto atual>" --status confirmado --novo-texto "<texto corrigido>"
```

- Novidade pendente aprovada → aplique como no Passo 4 e troque a célula `Status` da linha em `_novidades.md` de `pendente` para `aplicada`.
- "parar" → encerre o lote; o restante fica para a próxima revisão.

### 4. Novidade (modo `--novidade`)

Lê: registro do produto.

Encontre os itens que o texto do usuário afeta e atualize (`--status confirmado --novo-texto "<texto>"`) ou acrescente (`--adicionar ... --status confirmado`). O usuário é o validador, então entra `confirmado`. Mostre o antes e o depois de cada linha.

- Texto que não cabe em nenhum arquivo do registro → pergunte em uma linha onde entra.

### 5. Validar, gerar índice e relatar

```bash
node scripts/produto/validar_registro.js <produto>
node scripts/produto/itens_vencidos.js <produto> --indice
```

- Validação com erro → corrija o `arquivo:linha` apontado e repita.

```
Registro <produto> atualizado: <N> confirmados, <N> não oferece, <N> corrigidos, <N> novos.
Ainda a revisar: <N> (próximo: /atualizar-produto <produto>).
```

Registre a execução: `node scripts/orquestracao/registrar_execucao.js --skill atualizar-produto --modo <auto|manual> --resultado <ok|falha> [--slug <produto>] [--nota <motivo se falha>]` (`auto` no modo `--preparar` pela rotina).

## Critério de conclusão

- `node scripts/produto/validar_registro.js <produto>` (ou `--todos`) termina com `ok`.
- `_indice.md` regenerado.
- Nenhum item virou `confirmado` ou `nao-oferece` sem resposta do usuário (`--novidade` é o próprio usuário).
````

- [ ] **Step 2: Rodar a varredura e a suíte**

Run: `npm test`
Expected: `tests 105`, `fail 0`.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/atualizar-produto
git commit -m "feat(atualizar-produto): skill de revisão, novidade e preparação do registro" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 22: Rotina do dia 3, governança e `CLAUDE.md`

**Files:**
- Modify: `orquestracao/rotas.yaml`, `orquestracao/governanca.yaml`, `docs/automacao/routines.md`, `CLAUDE.md`, `.claude/skills/relatorio-sistema/SKILL.md`

- [ ] **Step 1: `orquestracao/rotas.yaml` — rota nova entre a pesquisa (dia 1) e a evolução (dia 5)**

Substituir:
```
  - id: evolucao-produto-cron
```
por:
```
  - id: revisao-produtos-cron
    trigger:
      tipo: cron
      schedule: "0 9 3 * *"          # dia 3 de cada mês às 9h (TZ: America/Sao_Paulo) — entre a pesquisa (dia 1) e a evolução (dia 5)
      timezone: America/Sao_Paulo
    skill: /atualizar-produto
    args:
      escopo: --todos
      modo: --preparar               # só prepara (itens de mercado + vencidos); confirmar item é do usuário
    notificacao:
      sucesso: dashboard
      falha: dashboard
    ativa: true

  - id: evolucao-produto-cron
```

- [ ] **Step 2: `docs/automacao/routines.md`**

Substituir:
```
| evolucao-produto-cron | mensal (dia 5) | `/evoluir-produto --todos` | só sinaliza — humano decide no gate |
```
por:
```
| revisao-produtos-cron | mensal (dia 3) | `/atualizar-produto --todos --preparar` | só prepara — o usuário revisa com `/atualizar-produto <produto>` |
| evolucao-produto-cron | mensal (dia 5) | `/evoluir-produto --todos` | só sinaliza — humano decide no gate |
```

Substituir:
```
**evolucao-produto-cron:** varre o catálogo
```
por:
```
**revisao-produtos-cron:** no dia 3 de cada mês, 9h America/Sao_Paulo, leva para o registro de cada produto os itens novos do mapa da categoria (status `mercado`), lista o que venceu e grava `memory/produto/_revisao/<AAAA-MM>.md`. Nunca confirma item. O usuário revisa entre o dia 3 e o dia 5 com `/atualizar-produto <produto>`; no dia 5 a `/evoluir-produto` já trabalha sobre o registro revisado.

**evolucao-produto-cron:** varre o catálogo
```

- [ ] **Step 3: `orquestracao/governanca.yaml`**

Substituir:
```
  - funcao: validacao-produto
```
por:
```
  - funcao: registro-produto
    decisao: "o que o produto é hoje (oferta, entregáveis, provas, condições)"
    autonomia: automatico_com_revisao   # preparar (itens de mercado, vencidos) = auto; confirmar item = usuário
    corpo: "/atualizar-produto + scripts/produto/ (dono do slice: estrategista-produto)"

  - funcao: validacao-produto
```

- [ ] **Step 4: `CLAUDE.md` — lista de skills de produto**

Substituir:
```
- [`/evoluir-produto`](.claude/skills/evoluir-produto/SKILL.md) — melhoria + disciplina de sunset (custo afundado); invocada também pela rotina mensal de evolução.
```
por:
```
- [`/evoluir-produto`](.claude/skills/evoluir-produto/SKILL.md) — melhoria + disciplina de sunset (custo afundado); invocada também pela rotina mensal de evolução.
- [`/atualizar-produto`](.claude/skills/atualizar-produto/SKILL.md) — mantém vivo o registro de cada produto (`memory/produto/<produto>/`): revisão em lotes, novidade solta e preparação mensal (rotina do dia 3). Escrita só por `scripts/produto/aplicar_revisao.js`.
```

- [ ] **Step 5: `CLAUDE.md` — agendamento**

Substituir:
```
pauta semanal (2ª), pesquisa de mercado (mensal) e poll diário
```
por:
```
pauta semanal (2ª), pesquisa de mercado (mensal, dia 1), revisão de produtos (mensal, dia 3) e poll diário
```

- [ ] **Step 6: `/relatorio-sistema` — o relatório do dia 7 mostra o que mudou nos produtos**

Em `.claude/skills/relatorio-sistema/SKILL.md`, substituir:
```
- `estrategista-produto` → estado de produto + oportunidades/evolução.
```
por:
```
- `estrategista-produto` → estado de produto + oportunidades/evolução + o que mudou nos registros de produto no mês (lê `memory/produto/_revisao/<AAAA-MM>.md` e o `_indice.md` de cada produto).
```

- [ ] **Step 7: Conferir e commitar**

Run: `grep -c "revisao-produtos-cron" orquestracao/rotas.yaml docs/automacao/routines.md && npm test`
Expected: contagem ≥ 1 nos dois arquivos; `tests 105`, `fail 0`.

```bash
git add orquestracao/rotas.yaml orquestracao/governanca.yaml docs/automacao/routines.md CLAUDE.md .claude/skills/relatorio-sistema/SKILL.md
git commit -m "feat(orquestracao): rotina revisao-produtos-cron (dia 3) + governança do registro" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 8: ⏸ Criar a routine de verdade (ação externa — com o usuário)**

Pergunte ao usuário se a routine deve ser criada agora. Com o "sim", use a skill `schedule`: prompt `/atualizar-produto --todos --preparar`, cron `0 9 3 * *`, fuso America/Sao_Paulo. Sem o "sim", registre no relatório final que a routine ficou declarada em `rotas.yaml` mas não criada.

### Task 23: ⏸ Revisão inicial da consultoria com o usuário

**Files:**
- Modify: `memory/produto/consultoria-dino-team/*.md` (via script)

- [ ] **Step 1: Rodar a revisão com o usuário**

Execute `/atualizar-produto consultoria-dino-team --revisao` na sessão principal, em lotes de 10, até o usuário dizer "parar" ou acabar a lista. Comece por `oferta.md` e `provas.md` (são o que a copy de venda mais usa).

- [ ] **Step 2: Validar e gerar o índice**

Run: `node scripts/produto/validar_registro.js consultoria-dino-team && node scripts/produto/itens_vencidos.js consultoria-dino-team --indice`
Expected: `ok — <N> itens em 8 arquivos (...)` e a lista do que ainda está `mercado`.

- [ ] **Step 3: Commit**

```bash
git add memory/produto/consultoria-dino-team
git commit -m "chore(produto): revisão inicial da consultoria pelo usuário" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Fase 5 — Verificação

### Task 24: Testes com peças reais

**Files:**
- Create: `docs/superpowers/specs/2026-10-02-registro-produto-e-voz-verificacao.md`

- [ ] **Step 1: Refazer o pedido das stories do Olympia**

Despache um subagente `general-purpose` novo (sem contexto desta conversa), com o prompt:

```
Você está no repositório em /Users/unstudio/Documents/Projetos/dino team/.claude/worktrees/registro-produto-e-voz. Siga o CLAUDE.md.
Pedido do usuário (literal):
"com base na seguinte copy, quero que crie um arquivo md com 10 variacoes desta copy, para sequencia de stories que serao postados no perfil pessoal do ramon dino, encurtada e direta para encaixar no storie: <cole aqui o texto do script de brand/voz/exemplos/ramon-dino-vender/2026-10-02-script-condicao-olympia.md>"
Grave o resultado em export/conteudos/stories/verificacao/copy.md e responda com o caminho e com as perguntas que você fez (se fez alguma).
```

Critérios (passa só se todos forem sim):
1. São 10 sequências, cada uma com 1 a 5 slides.
2. Voz do Ramon: 1ª pessoa, conversa, humano (exclamação e "shape" permitidos).
3. Usa pelo menos 8 entregáveis ou benefícios distintos do registro da consultoria.
4. Nenhum fato fora do registro ou sem fonte (conferir cada número citado contra `provas.md` e `oferta.md`).
5. Não aparece "milhares", "poucos meses", "últimas vagas" nem "vagas limitadas".
6. No máximo 1 pergunta de uma linha antes de escrever.

- [ ] **Step 2: Post de alcance da Dino Team**

Despache outro subagente `general-purpose` novo com o prompt:

```
Você está no repositório em /Users/unstudio/Documents/Projetos/dino team/.claude/worktrees/registro-produto-e-voz. Siga o CLAUDE.md.
Pedido: escreva só a copy (capa + 5 slides + legenda) de um carrossel de alcance para o @dinoteam sobre "recomeçar toda segunda". Não faça design nem export. Responda com a copy.
```

Critérios: registro sereno (sem exclamação, sem hype, sem "shape" na voz da marca), sem CTA de venda, legenda fecha com "O topo exige direção.".

- [ ] **Step 3: Revisor de marca — 3 casos**

Despache o agente `revisor-brand` três vezes (momento: criação de post, conteúdo inline):

| Caso | Marca · objetivo | Texto | Esperado |
|---|---|---|---|
| A | `ramon-dino` · `vender` (produto `consultoria-dino-team`) | "Cara, chega de gastar com dieta da internet! Na Dino Team você tem nutricionista, treinador e app com tudo integrado. Condição especial do Olympia — me chama no WhatsApp!" | APROVADO |
| B | `ramon-dino` · `vender` (produto `consultoria-dino-team`) | o texto do caso A + " Últimas vagas, só até hoje!" | REPROVADO (Parte A, regra 2 — escassez inventada) |
| C | `dino-team` · `alcancar` | "Recomeçar não é falhar! Bora pra cima, você consegue!" | REPROVADO (voz da Dino Team: exclamação e motivação vazia) |

- [ ] **Step 4: Registrar o resultado**

Crie `docs/superpowers/specs/2026-10-02-registro-produto-e-voz-verificacao.md`:

```markdown
# Verificação — registro de produto + hierarquia de voz

> Data: <AAAA-MM-DD> · Branch: registro-produto-e-voz · Spec: 2026-10-02-registro-produto-e-voz-design.md §4.6

| Teste | Resultado | Evidência |
|---|---|---|
| Stories do Olympia refeitas | <passa/falha> | <critérios 1–6, um por linha> |
| Alcance @dinoteam | <passa/falha> | <trecho da legenda> |
| Revisor — caso A | <APROVADO/REPROVADO> | <linha do parecer> |
| Revisor — caso B | <APROVADO/REPROVADO> | <linha do parecer> |
| Revisor — caso C | <APROVADO/REPROVADO> | <linha do parecer> |
```

Teste que falhar: corrija o arquivo responsável (camada de voz, `objetivos.md`, seção do `CLAUDE.md` ou contrato do agente), commite a correção e rode só aquele teste de novo. Segunda falha no mesmo teste → pare e leve ao usuário.

- [ ] **Step 5: ⏸ Conferência do usuário**

Mostre ao usuário o arquivo `export/conteudos/stories/verificacao/copy.md` e pergunte se a primeira entrega saiu utilizável. Registre a resposta na tabela de verificação. Depois apague a pasta de teste: `rm -r export/conteudos/stories/verificacao`.

- [ ] **Step 6: Commit**

```bash
git add docs/superpowers/specs/2026-10-02-registro-produto-e-voz-verificacao.md
git commit -m "docs(verificacao): testes com peças reais do registro + hierarquia de voz" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 25: Fechamento

- [ ] **Step 1: Suíte, validação e varredura**

Run: `npm test && node scripts/produto/validar_registro.js --todos`
Expected: `tests 105`, `fail 0`; `ok — <N> itens em 8 arquivos (...)`.

- [ ] **Step 2: Conferir os critérios de aceite da spec (§8)**

Para cada um dos 7 critérios, aponte o commit ou o arquivo que o cumpre. Critério sem evidência → volte à task correspondente.

- [ ] **Step 3: Encerrar a branch**

Use a skill `superpowers:finishing-a-development-branch`.
