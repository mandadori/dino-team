# Mapa de Dores + Registro por Formato — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recalibrar `publico-alvo.md` (escada de dores + modelo dos dois prêmios) e `tom-de-voz.md` (registro por formato R1–R3 + M10 + travas anti-drift), e ligar `pilares-conteudo.md` ao novo sistema.

**Architecture:** Trabalho editorial em 3 docs de marca. A escada de dores vira o coração de `publico-alvo.md` (Opção B — sem doc novo); `tom-de-voz.md` ganha sub-registros por formato sem renumerar seções de topo (acréscimos dentro das seções 2 e 4 + "Evitar"); `pilares-conteudo.md` recebe edição leve ligando pilar → dor → registro. Spec-fonte: `docs/specs/2026-06-04-mapa-dores-e-registro-por-formato-design.md`.

**Tech Stack:** Markdown + frontmatter de marca. Sem build/test automatizado — verificação por leitura e `grep` de consistência. Voz: ver `tom-de-voz.md` (sereno/íntimo/direto).

**Nota sobre fraseado:** todo texto-fonte abaixo é **redação final proposta** — o usuário pode afinar o fraseado em qualquer passo (correções finas de voz são esperadas e viram regra). Não é placeholder; é ponto de partida concreto.

---

## File Structure

- **Modify:** `brand/publico-alvo.md` — substitui "Driver emocional profundo" pelo modelo dos dois prêmios; substitui listas estáticas "o que sente/teme" pela escada de dores; atualiza nota de cabeçalho.
- **Modify:** `brand/tom-de-voz.md` — adiciona "Registro por formato (R1–R3)" e "Travas anti-drift" dentro da seção 2; adiciona M10 na seção 4; adiciona "números de palanque" em "Evitar" (seção 5); atualiza nota de cabeçalho.
- **Modify:** `brand/pilares-conteudo.md` — adiciona "Dores que serve · Registro" a cada pilar; atualiza nota de cabeçalho.

---

## Task 1: `publico-alvo.md` — modelo dos dois prêmios

**Files:**
- Modify: `brand/publico-alvo.md` (seção "Driver emocional profundo", linhas ~6–16)

- [ ] **Step 1: Substituir a seção "Driver emocional profundo"**

Trocar o bloco atual (do título `## Driver emocional profundo` até o fim do parágrafo "Implicação pra copy", imediatamente antes do `---`) por:

```markdown
## Os dois prêmios

O que o público busca na superfície é **físico** e **reconhecimento**. Por baixo, o processo entrega **dois prêmios — ambos reais**:

1. **Transformação física** — o corpo. É o que a consultoria entrega e a razão de ela existir. Não é "só prova": é metade do prêmio. A copy **honra o desejo pelo corpo** sem tratá-lo como raso.
2. **Autorrespeito / identidade** — *consequência* do processo: tornar-se a pessoa que decide e cumpre. É o que fica e o que torna o corpo **sustentável**.

- **Status / reconhecimento social** é a *consequência* — não o objetivo.

**A culpa que ele carrega:** antes de buscar a marca, o público chega carregando **culpa** — esforço sem resultado, dias perdidos, promessas quebradas consigo mesmo. O medo que ele não verbaliza não é "estou fora de forma", mas **"eu sei que poderia ser mais e estou escolhendo não ser"**.

**Implicação pra copy:** a copy **entra pela dor de entrada e eleva aos dois prêmios** — nunca abandona o corpo para falar só de identidade. Orienta **para dentro** ("mude por si mesmo, você não precisa provar nada a ninguém") e, antes de cobrar, **devolve o autorrespeito**: a marca acolhe em vez de gritar — não cobra mais esforço, oferece direção. O reconhecimento chega como resultado, nunca como fim declarado. (Ver "os dois produtos do caminho" e M8/M9 no [tom de voz](tom-de-voz.md).)
```

- [ ] **Step 2: Verificar que "Estética é a prova visível" sumiu**

Run: `grep -n "prova visível" "brand/publico-alvo.md"`
Expected: nenhuma linha (o conceito de corpo-como-prova foi removido).

- [ ] **Step 3: Commit**

```bash
git add brand/publico-alvo.md
git commit -m "docs(brand): publico-alvo — modelo dos dois premios (corpo = premio real)"
```

---

## Task 2: `publico-alvo.md` — escada de dores

**Files:**
- Modify: `brand/publico-alvo.md` (seções "O que busca / O que sente / O que teme" dentro de "Persona principal", e a seção "Estágios de consciência")

- [ ] **Step 1: Substituir as listas estáticas "O que sente" e "O que teme" pela escada**

Na seção `## Persona principal`, manter "Quem é" e "O que busca". Substituir os blocos `**O que sente:**` e `**O que teme:**` (as duas listas) por uma referência curta + a nova seção de escada logo após a persona:

Trocar os dois blocos por:

```markdown
**O que sente / teme:** ver a **Escada de dores** abaixo — o inventário plano de sentimentos foi substituído por um mapa acionável (dor → momento → pensamento → prêmio → mecanismo).
```

- [ ] **Step 2: Inserir a seção "Escada de dores" logo após "Persona principal" (antes de "Estágios de consciência")**

```markdown
---

## Escada de dores

O eixo operacional do público. Cada dor é lida em cinco colunas: a **dor de entrada** (concreta, onde a identificação acontece), o **momento agudo** (quando aperta), o **pensamento não-dito** (o monólogo interno — matéria-prima direta de hook), o **prêmio que conecta** (corpo / identidade — ver "Os dois prêmios") e o **mecanismo de tom** (M1–M10 em [tom-de-voz.md](tom-de-voz.md)).

> **Por que pensamento e não busca:** capturamos o que o lead *pensa* quando a dor aperta, não o que ele Googla. A marca ganha por **identificação**, não por SEO. A capa que descreve o pensamento dele para o scroll.

**Porta principal** (onde mora a maior identificação): corpo · tempo · comparação · solidão. As demais amplificam ou derivam dela.

| Dor de entrada | Momento agudo | Pensamento não-dito (→ hook) | Prêmio | Mec. |
|---|---|---|---|---|
| **Corpo que não vem** | Prova uma roupa, se vê marcado numa foto, o verão chegando | *"Não importa o que eu faça, meu corpo não é o que eu queria."* | Corpo | M2 + M8 |
| **Tempo perdido** | Aniversário, vira o ano: "anos de treino e…" | *"Joguei tempo fora e não tenho o que mostrar."* | Corpo → identidade | M8 + M3 |
| **Comparação / atraso** | Vê no feed alguém que começou junto, mais evoluído | *"Todo mundo passou na frente. Já era pra eu estar mais longe."* | Identidade | M7 + borda "comparação" |
| **Solidão no processo** | Treina enquanto os amigos saem; ninguém em volta leva a sério | *"Carrego isso sozinho. Ninguém entende."* | Identidade (comunidade) | M7 + acolhimento |
| **Espelho que mente** | Tira foto de frente após semanas e se vê igual | *"Faço tudo e não saio do lugar — deve ser eu."* | Corpo → identidade | M10 + M3 |
| **Dispersão** | Abre o 5º app/coach/protocolo atrás do "certo" | *"Testo tudo e não sei mais em quem confiar."* | Corpo (direção) → identidade | M10 + M2 |
| **Cansaço de recomeçar** | Domingo à noite decidindo (de novo) que segunda começa | *"Já prometi tanto que nem eu acredito mais."* | Identidade | M4 + M1 |
| **Medo do teto** | Estagnou meses, cogita desistir | *"E se este for meu limite? E se eu nunca virar quem queria?"* | Identidade | M8 + M5 |
| **Vergonha do corpo em público** | Praia, piscina, foto — evita tirar a camisa | *"Evito situações pra não me expor assim."* | Corpo → autorrespeito | M1 + acolhimento |
| **Vergonha silenciosa** *(núcleo profundo)* | Deitado à noite, sabendo que não fez o que devia | *"Eu sei que posso mais e tô escolhendo menos."* | Identidade | M9 *(parcimônia)* |

> **Hierarquia:** as quatro primeiras são a **porta** (mais identificação, ligam direto ao branding). A **vergonha silenciosa** é o **núcleo profundo** — a dor que, resolvida, afrouxa as outras; usar com parcimônia (M9), nunca como dedo apontado.
```

- [ ] **Step 3: Verificar a escada e que as listas estáticas saíram**

Run: `grep -n "Escada de dores\|Pensamento não-dito\|Vergonha silenciosa" "brand/publico-alvo.md"`
Expected: linhas da nova seção presentes.

Run: `grep -n "Frustração pela falta de progresso\|Recair em desculpas" "brand/publico-alvo.md"`
Expected: nenhuma linha (listas estáticas removidas).

- [ ] **Step 4: Commit**

```bash
git add brand/publico-alvo.md
git commit -m "docs(brand): publico-alvo — escada de dores (dor->pensamento->premio->mecanismo)"
```

---

## Task 3: `publico-alvo.md` — atualizar nota de cabeçalho

**Files:**
- Modify: `brand/publico-alvo.md` (bloco `>` de cabeçalho, linhas 3–4)

- [ ] **Step 1: Adicionar linha de cabeçalho registrando a reescrita**

Após a linha `> Reestruturado em 2026-05-29 — ...`, acrescentar:

```markdown
> Reescrito em 2026-06-04 — **escada de dores** (dor → momento agudo → pensamento não-dito → prêmio → mecanismo) substitui as listas estáticas; modelo dos **dois prêmios** (corpo é prêmio real, não só prova). Ver [spec](../docs/specs/2026-06-04-mapa-dores-e-registro-por-formato-design.md).
```

- [ ] **Step 2: Verificar**

Run: `grep -n "2026-06-04" "brand/publico-alvo.md"`
Expected: a nova linha de cabeçalho aparece.

- [ ] **Step 3: Commit**

```bash
git add brand/publico-alvo.md
git commit -m "docs(brand): publico-alvo — nota de cabecalho da reescrita 06-04"
```

---

## Task 4: `tom-de-voz.md` — Registro por formato (R1–R3)

**Files:**
- Modify: `brand/tom-de-voz.md` (seção 2 "Registro de mestre" — acrescentar subseção ao fim dela, antes do `---` que abre a seção 3)

- [ ] **Step 1: Inserir a subseção "Registro por formato" ao fim da seção 2**

Logo após o bloco "Notas de aplicação" (fim da seção 2 "Registro de mestre"), antes do `---`, inserir:

```markdown
### Registro por formato (R1–R3)

O "registro de mestre" garante a *voz*; o registro por formato garante a *forma*. Capa não é editorial, e editorial não é educativo — cada um tem comprimento, ritmo e fecho próprios. Ignorar isso é a raiz do drift (frase densa demais na capa, truque de palanque no editorial, filosofia onde devia ensinar).

- **R1 · Capa / lâmina** — meta **~12 palavras** (meta, não lei: estoura só quando a ideia exige), **um** pivô, fecha no **concreto**, nunca no abstrato.
  - ❌ "…POR DEPENDER DE VONTADE PARA EXECUTAR O QUE DEVERIA SER DECISÃO."
  - ✅ "DISCIPLINA NÃO É VONTADE. É O QUE VOCÊ FAZ SEM ELA."
  - ✅ "VOCÊ NÃO QUEBROU. PAROU DE COMEÇAR DE NOVO."
- **R2 · Editorial longo** — parágrafo que respira, **uma virada por bloco**. Sem estatística de palanque, sem repetir o motivo. O ritmo é frase curta declarativa seguida de frase que vira; nunca empilha três ideias num fôlego só.
- **R3 · Educativo** — professoral-acessível, **não** filosófico-denso. Conceito nomeado (ex.: "Crie mais tensão") + porquê em linguagem chã + payoff destacado. O hook pode abrir *curiosity-gap* ("os bons decidem UMA coisa antes de treinar → arrasta"). O leitor sai sentindo que **aprendeu**, não que foi pregado.
```

- [ ] **Step 2: Verificar**

Run: `grep -n "Registro por formato\|R1 · Capa\|R3 · Educativo" "brand/tom-de-voz.md"`
Expected: as três entradas aparecem.

- [ ] **Step 3: Commit**

```bash
git add brand/tom-de-voz.md
git commit -m "docs(brand): tom-de-voz — registro por formato R1-R3"
```

---

## Task 5: `tom-de-voz.md` — M10 (Reframe de diagnóstico)

**Files:**
- Modify: `brand/tom-de-voz.md` (seção 4 "Mecanismos de construção" — após o bloco M9, antes do `---` que fecha a seção)

- [ ] **Step 1: Inserir M10 após M9**

```markdown
### M10. Reframe de diagnóstico
Nomeia o **nome errado** que o leitor deu ao próprio problema — e o corrige. Não nega a dor; recategoriza a causa, tirando o leitor do beco onde ele se acha defeituoso. Conecta direto à escada de dores ([`publico-alvo.md`](publico-alvo.md)): o pensamento não-dito quase sempre carrega um diagnóstico errado embutido.
- "Você não está travado. Está disperso."
- "Não foi disciplina que faltou. Foi direção."
- "O espelho de hoje não mede o trabalho de meses. O instrumento é que está errado."
```

- [ ] **Step 2: Verificar**

Run: `grep -n "M10. Reframe de diagnóstico" "brand/tom-de-voz.md"`
Expected: uma linha.

- [ ] **Step 3: Commit**

```bash
git add brand/tom-de-voz.md
git commit -m "docs(brand): tom-de-voz — M10 reframe de diagnostico"
```

---

## Task 6: `tom-de-voz.md` — travas anti-drift, "calor não entra", cabeçalho

**Files:**
- Modify: `brand/tom-de-voz.md` (seção 2 "Registro de mestre" — bloco "Notas de aplicação"; seção 5 "Vocabulário → Evitar"; cabeçalho)

- [ ] **Step 1: Adicionar as 4 travas anti-drift + "calor não entra" às "Notas de aplicação" da seção 2**

Ao fim do bloco "Notas de aplicação", acrescentar os itens:

```markdown
- **Travas anti-drift:** (1) **uma virada por slide** — não empilhar tese + mecanismo + consequência na mesma peça; (2) **fecha no concreto**, não no substantivo abstrato; (3) **sem números de palanque** (porcentagem, "os 5%/95%"); (4) **não repetir o motivo** (ex.: câmera/filmou/filma no mesmo bloco).
- **Calor não entra:** o autorrespeito é **estrutural** — vem da forma (conceder a emoção antes da direção), nunca dito na cara. Sem encorajamento direto tipo "você merece mais" / "continue". O modelo é a referência seca (STNDRD, 5am.sucks), não a aquecida.
```

- [ ] **Step 2: Adicionar "números de palanque" à lista "Evitar" (seção 5)**

Na seção 5 "Vocabulário → Evitar", acrescentar um item:

```markdown
- **Números/estatística de palanque** ("os 5% / os 95%", "90% das pessoas") — o sereno não precisa de número pra ter peso.
```

- [ ] **Step 3: Atualizar nota de cabeçalho**

Após a última linha `>` do cabeçalho (a de 2026-06-04 sobre "Registro de mestre"), acrescentar:

```markdown
> **Ampliado em 2026-06-04 (parte 2) — registro por formato + M10:** adiciona R1–R3 (capa/editorial/educativo), o mecanismo M10 (reframe de diagnóstico), travas anti-drift e a trava "calor não entra". Corrige o drift estrutural diagnosticado contra ~181 referências. Ver [spec](../docs/specs/2026-06-04-mapa-dores-e-registro-por-formato-design.md).
```

- [ ] **Step 4: Verificar**

Run: `grep -n "Travas anti-drift\|Calor não entra\|números de palanque\|palanque" "brand/tom-de-voz.md"`
Expected: as adições aparecem.

- [ ] **Step 5: Commit**

```bash
git add brand/tom-de-voz.md
git commit -m "docs(brand): tom-de-voz — travas anti-drift, calor nao entra, cabecalho"
```

---

## Task 7: `pilares-conteudo.md` — ligar pilar → dor → registro

**Files:**
- Modify: `brand/pilares-conteudo.md` (cada um dos 4 pilares + cabeçalho)

- [ ] **Step 1: Adicionar linha "Dores que serve · Registro" a cada pilar**

Em cada pilar, logo após a linha `**Função no funil:**` (e seu parágrafo), acrescentar uma linha. Conteúdo por pilar:

```markdown
<!-- Pilar 1 — Mentalidade -->
**Dores que serve · Registro:** cansaço de recomeçar, comparação/atraso, vergonha silenciosa, medo do teto → escada de dores em [`publico-alvo.md`](publico-alvo.md). Registro **R1/R2** (capa-lâmina e editorial).

<!-- Pilar 2 — Método -->
**Dores que serve · Registro:** dispersão, corpo que não vem, espelho que mente → escada em [`publico-alvo.md`](publico-alvo.md). Registro **R3** (educativo professoral-acessível).

<!-- Pilar 3 — Prova viva -->
**Dores que serve · Registro:** medo do teto, comparação/atraso (Ramon como evidência de que o teto percebido não é o real) → escada em [`publico-alvo.md`](publico-alvo.md). Registro **R2/R3**.

<!-- Pilar 4 — Transformação -->
**Dores que serve · Registro:** corpo que não vem, tempo perdido, solidão (a comunidade responde) → escada em [`publico-alvo.md`](publico-alvo.md). Registro **R2** com CTA.
```

(Os comentários `<!-- -->` são só guia de colocação — não copiar pro doc.)

- [ ] **Step 2: Atualizar nota de cabeçalho**

Após a linha `> Reestruturado em 2026-05-29 — ...`, acrescentar:

```markdown
> Ligado em 2026-06-04 — cada pilar aponta as **dores** que serve (escada em [`publico-alvo.md`](publico-alvo.md)) e o **registro** de formato ([`tom-de-voz.md`](tom-de-voz.md): R1–R3).
```

- [ ] **Step 3: Verificar**

Run: `grep -n "Dores que serve · Registro" "brand/pilares-conteudo.md"`
Expected: 4 linhas (uma por pilar).

- [ ] **Step 4: Commit**

```bash
git add brand/pilares-conteudo.md
git commit -m "docs(brand): pilares — ligar pilar -> dor -> registro"
```

---

## Task 8: Passagem de consistência final

**Files:**
- Read: `brand/publico-alvo.md`, `brand/tom-de-voz.md`, `brand/pilares-conteudo.md`

- [ ] **Step 1: Conferir links cruzados e nomes de mecanismo**

Run: `grep -rn "M10\|Escada de dores\|R1\|R2\|R3" brand/`
Expected: `publico-alvo.md` cita M1–M10 na escada; `tom-de-voz.md` define M10 e R1–R3; `pilares-conteudo.md` referencia escada e R1–R3. Nenhum mecanismo citado que não exista (M1–M10 apenas).

- [ ] **Step 2: Conferir que os links relativos resolvem**

Run: `grep -rn "](publico-alvo.md)\|](tom-de-voz.md)\|](pilares-conteudo.md)\|](../docs/specs/2026-06-04" brand/`
Expected: caminhos relativos corretos (mesma pasta `brand/`; spec via `../docs/specs/`).

- [ ] **Step 3: Leitura final dos 3 docs**

Ler os 3 arquivos inteiros. Checar contra o spec (`docs/specs/2026-06-04-mapa-dores-e-registro-por-formato-design.md`):
- §2 dois prêmios → Task 1 ✓
- §4 escada (schema + 10 dores + amostras) → Task 2 ✓
- §5.1 R1–R3 → Task 4 ✓ · §5.2 M10 → Task 5 ✓ · §5.3 travas + calor → Task 6 ✓
- §6 pilares → Task 7 ✓

Corrigir qualquer escorregão de voz inline (registro de mestre: princípio em presente, fecha no concreto).

- [ ] **Step 4: Commit (se houve correções)**

```bash
git add brand/
git commit -m "docs(brand): passagem de consistencia mapa-dores + registro por formato"
```

---

## Self-Review (preenchido)

**Spec coverage:** §2→T1 · §3 (diagnóstico, é racional, não vira doc) → embutido em T4/T6 como ❌/✅ e travas · §4→T2/T3 · §5→T4/T5/T6 · §6→T7 · §7 (fora de escopo) não gera task — correto. Sem lacunas.

**Placeholder scan:** todo conteúdo é texto final redigido; nenhum "TBD/implementar depois". Os `<!-- -->` em T7 são marcados como "não copiar".

**Type consistency:** mecanismos nomeados M1–M10 em todos os docs; sub-registros sempre "R1/R2/R3"; seção sempre "Escada de dores". Sem divergência de nomenclatura.
