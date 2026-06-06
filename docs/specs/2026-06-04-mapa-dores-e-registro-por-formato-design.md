# Design — Mapa de Dores + Registro por Formato

> Brainstorm: 2026-06-04. Recalibra `publico-alvo.md` e `tom-de-voz.md` a partir de ~181 referências de carrossel (5am.sucks, STNDRD, thelawofwinning, heikavi, businessmindset101) reunidas pelo usuário, e diagnóstico do drift da copy gerada pelo sistema.
> Decisão de arquitetura: **Opção B** — a escada de dores vira o coração de `publico-alvo.md` (sem doc novo).

---

## 1. Problema

Dois problemas conectados, levantados pelo usuário:

1. **Público/pilares — dor estática.** A `publico-alvo.md` lista dores ("o que sente / o que teme") como inventário plano. Falta a camada acionável: o **momento agudo** onde cada dor aperta e o **pensamento não-dito** do lead nesse instante — que é o que intercepta o scroll e vira hook.

2. **Tom — copy gerada derivou do alvo.** Comparando as referências com a copy que o sistema gerou (`export/conteudos/carrossel/*`), o output afastou do registro-alvo. A raiz: o `tom-de-voz.md` é **cego a formato** — trata capa curta, editorial longo e educativo com o mesmo registro filosófico-denso.

A sessão trata os dois de forma **integrada**: o mapa de dores é o eixo, e o tom se calibra em função dele (cada dor pede um mecanismo + um registro).

---

## 2. Correção de modelo — os dois prêmios

Correção de rota validada pelo usuário. A `publico-alvo.md` atual diz *"Estética é a prova visível"*, rebaixando o corpo a prova. Errado para o negócio: **sem transformação física a consultoria não existe.**

O modelo certo:

> **Dor de entrada** (concreta: corpo, tempo, os outros) → **o processo** → **dois prêmios, ambos reais:**
> 1. **Transformação física** — o corpo. O que a consultoria entrega. A razão do produto existir.
> 2. **Autorrespeito / identidade** — *consequência* do processo. O que fica e compõe.

A copy **entra pela dor de entrada e eleva aos dois prêmios** — nunca abandona o corpo para falar só de identidade. Honra o desejo pelo corpo (sem tratar como raso) e mostra que a identidade é o que o torna sustentável. (O `tom-de-voz.md` já sustenta isso em "os dois produtos do caminho"; a `publico-alvo.md` é que precisa alinhar.)

---

## 3. Diagnóstico do drift — 5 padrões

Base do fix de tom. Ressalva: as copies lidas (`disciplina-nao-e-humor`, `o-que-o-resultado-esconde`, `costas-espessura`) são anteriores à reescrita de tom de 2026-06-04; parte do drift de vocabulário já foi pega. O drift **estrutural** abaixo o doc ainda permite.

1. **Densidade subordinada.** A ref dá um pivô limpo e para (*"DON'T CALL IT LUCK. CALL IT YEARS OF NOT QUITTING."*); o Dino empilha oração na mesma linha (*"...POR DEPENDER DE VONTADE PARA EXECUTAR O QUE DEVERIA SER DECISÃO."*). A ref declara; o Dino explica. Explicação não se reposta.
2. **Abstrato no lugar do concreto.** Ref fecha em palavra física comum (*"years of not quitting"*); Dino fecha em substantivo abstrato (*"deveria ser decisão"*). Concreto faz sentir; abstrato faz pensar.
3. **Dois pensamentos por slide.** Dino entrega tese + mecanismo + consequência no mesmo slide; ref entrega **uma virada**. Sintoma nas notas do designer: *"slides 2,3,4 são as mais longas — 2–3 linhas em Anton 90px."*
4. **Truques que quebram o sereno.** Estatística de palanque (*"os 5% / os 95%"*) e motivo repetido (*"câmera... filmou... câmera"*). Nenhuma das 181 refs usa porcentagem nem repete o motivo.
5. **Cego a formato (raiz dos outros 4).** O doc trata toda copy igual; as refs têm três registros distintos e o sistema só faz um.

---

## 4. Entrega 1 — `publico-alvo.md` (reescrita, Opção B)

**Mantém:** persona (quem é, onde está), espelhamento de linguagem (público diz "shape"; marca responde "físico/resultado/evolução").

**Corrige:** remove *"Estética é a prova visível"*; insere a seção **os dois prêmios** (§2).

**Substitui** as listas estáticas "o que sente / o que teme" pela **escada de dores** — tabela por dor:

`Dor de entrada · Momento agudo (quando aperta) · Pensamento não-dito (→ hook) · Prêmio que conecta (corpo/identidade) · Mecanismo de tom (M1–M10)`

> Coluna deliberadamente fora do schema: **a busca** (o que o lead digita/Googla). O usuário escolheu capturar **o pensamento (monólogo interno)**, não a busca — fiel à marca, que ganha por identificação, não SEO. Busca/search-intent fica como extensão futura.

**Lista de dores** (porta principal = corpo · tempo · comparação · solidão; demais amplificam ou derivam):

- Espelho que mente (disformia — nunca se vê suficiente)
- Corpo que não vem
- Tempo perdido (funde "esforço sem retorno")
- Comparação / atraso
- Dispersão (testa tudo, não sabe em quem confiar)
- Cansaço de recomeçar (perdeu a confiança na própria palavra)
- Solidão no processo
- Medo do teto (e se este for o limite?)
- Vergonha silenciosa (núcleo profundo — sabe que pode mais e se escolhe menor; M9)
- Vergonha do corpo em público

**Amostras preenchidas** (validadas na sessão):

| Dor | Momento agudo | Pensamento não-dito | Prêmio | Mec. |
|---|---|---|---|---|
| Espelho que mente | Tira foto de frente após semanas e se vê igual | *"Faço tudo e não saio do lugar — deve ser eu."* | Corpo→identidade | M10+M3 |
| Cansaço de recomeçar | Domingo à noite decidindo (de novo) que segunda começa | *"Já prometi tanto que nem eu acredito mais."* | Identidade | M4+M1 |

**Estágios de consciência** (frio/morno/quente): mantém, cruzando com as dores quando útil.

---

## 5. Entrega 2 — `tom-de-voz.md` (nova seção + mecanismo + travas)

### 5.1 Nova seção "Registro por formato" (correção-raiz)

Três sub-registros, cada um com regra de comprimento, ritmo e fecho:

- **R1 · Capa / lâmina** — meta **~12 palavras** (meta, não lei: pode estourar quando a ideia exige), **um** pivô, fecha no **concreto**, não no abstrato.
  - Antes (drift): *"...POR DEPENDER DE VONTADE PARA EXECUTAR O QUE DEVERIA SER DECISÃO."*
  - Depois (R1): *"DISCIPLINA NÃO É VONTADE. É O QUE VOCÊ FAZ SEM ELA."*
- **R2 · Editorial longo** — parágrafo que respira, **uma virada por bloco**. Proíbe estatística de palanque e motivo repetido.
- **R3 · Educativo** — professoral-acessível: conceito nomeado + porquê em linguagem chã + payoff destacado. Hook pode abrir *curiosity-gap* ("decide UMA coisa antes de treinar → arrasta"). Substitui o uso atual do tom filosófico-denso ao ensinar.

### 5.2 M10 · Reframe de diagnóstico (mecanismo novo)

Nomeia o **nome errado** que o lead deu ao próprio problema. Conecta direto à escada (o pensamento não-dito quase sempre carrega um diagnóstico errado).
- *"Você não está travado. Está disperso."*
- *"Não foi disciplina que faltou. Foi direção."*

### 5.3 Travas anti-drift + registro de calor

- 4 travas (absorvidas no "Registro de mestre" ou subseção própria): **uma virada por slide · fecha no concreto · sem números de palanque · não repetir motivo**.
- **Calor não entra:** registrar explicitamente que encorajamento direto ("você merece mais", "continue") está fora. O autorrespeito é **estrutural/implícito**, nunca dito na cara. Modelo são as refs secas (5am.sucks, STNDRD), não as aquecidas (thelawofwinning).

---

## 6. Entrega 3 — `pilares-conteudo.md` (edição leve)

Cada pilar passa a apontar **quais dores serve** e **qual registro usa**, fechando o circuito pilar → dor → formato:
- **Mentalidade** → dores de identidade/recomeço/vergonha silenciosa · R1/R2.
- **Método** → dispersão/corpo que não vem · R3 (educativo).
- **Prova viva / Transformação** → comparação/atraso/medo do teto · conforme função no funil.

---

## 7. Fora de escopo (futuro)

- **Coluna de busca / search-intent** na escada (o que o lead Googla) — adiada; alimentaria SEO/pauta.
- **Setor de desenvolvimento e melhoria de produto** — o usuário citou que as dores ligam ao produto; caso futuro.
- **Registro de stories e de legenda** — esta sessão cobre capa, editorial e educativo de carrossel. Stories/legenda podem virar R4/R5 depois.

---

## 8. Log de decisões

| # | Decisão | Escolha |
|---|---|---|
| 1 | Foco da sessão | Os dois (dor + tom), integrados |
| 2 | Sentido de "distorção" | Espelho que mente (disformia) |
| 3 | Prêmio profundo | Não só identidade — **corpo também é prêmio real** |
| 4 | Coluna do gatilho | O **pensamento** (monólogo interno), não a busca |
| 5 | Arquitetura | **Opção B** — escada no coração de `publico-alvo.md` |
| 6 | Teto de lâmina | **Meta** ~12 palavras, não lei |
| 7 | Calor de autorrespeito | **Não entra** — austeridade mantida, autorrespeito estrutural |
