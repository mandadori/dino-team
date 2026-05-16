# Estilo `treino-dino` — Carrossel

## Conceito visual

Carrossel de **treino completo do Ramon Dino** — o público recebe um treino real, exercício por exercício, com quantidade de séries e repetições. Os slides de exercício usam **background verde chroma** (`#00B140`) para que o editor adicione, na pós-produção, o vídeo do Ramon executando o movimento.

Estética cinematográfica P&B nos slides com foto, contraste com chroma sólido nos slides de exercício. Tipografia Anton + Montserrat sempre em CAIXA ALTA. Logo DINO sempre presente no topo-esquerdo.

---

## Estrutura obrigatória

O carrossel sempre tem **N+3 slides**, onde N é o número de exercícios fornecidos:

1. **Slide 1 — Capa**
   - Foto do Ramon como background + overlay escuro
   - Topbar: logo DINO (esquerda) + tag de tópico (direita) — ex: `BACK DAY`
   - Título grande em Anton (até 5 palavras): chamada do treino — ex: `TREINO PARA COSTAS EM V`
   - Swipe cue: `Arraste →`

2. **Slide 2 — Lista completa do treino**
   - Foto do Ramon como background + overlay escuro
   - Topbar: logo + tag (ex: `O TREINO`)
   - Lista vertical de todos os exercícios, agrupados por bloco (A, B, C…) quando aplicável
   - Cada item: `Cx.NOME DO EXERCÍCIO` + linha com `N SÉRIES` + reps por série

3. **Slides 3 a N+2 — Um exercício por slide**
   - Background verde chroma sólido (`#00B140`)
   - Topbar: logo + tag ordinal (`PRIMEIRO EXERCÍCIO`, `SEGUNDO EXERCÍCIO`, …)
   - Canto inferior esquerdo: nome do exercício + séries × reps
   - **Sem texto sobre a área central** — é onde o vídeo do Ramon vai entrar

4. **Slide N+3 — CTA final**
   - Foto do Ramon como background + overlay escuro
   - Topbar: logo + tag de fechamento (ex: `DIRECIONE SEU ESFORÇO`)
   - Título centralizado em Anton, frase de fechamento (ex: `JUNTOS VAMOS MAIS LONGE.`)
   - Sem swipe cue (último slide)

Em todos os slides: **barra de progresso inferior** (3px) com fill proporcional à posição.

---

## Inputs obrigatórios do usuário

Para gerar um post nesse estilo, o usuário (ou Diretor) precisa fornecer:

- **Grupo muscular ou foco do treino** (ex: costas em V, perna completa, ombro 3D)
- **Lista de exercícios** em ordem de execução, opcionalmente com codificação de bloco (A1, B1, C1…)
- **(Opcional)** Séries e repetições por exercício. Se ausente, o **agente `treinador`** é acionado para definir séries/reps eficientes para hipertrofia.

Formato esperado da lista:
```
A1. Supino inclinado na máquina
B1. Crucifixo na máquina
C1. Tríceps testa com barra W
C2. Tríceps corda
```

Formato de séries/reps:
- Separar séries por espaço: `4 SÉRIES 12 10 Ⓕ Ⓕ`
- Símbolo `Ⓕ` representa **falha** (rep até a falha muscular)

---

## Quando usar

- Posts onde o entregável é um **treino real e replicável** (não conceitual)
- Quando o cliente quer **demonstração técnica** com vídeo do Ramon
- Conteúdo **educacional + autoridade** combinados — ensina e prova a competência
- Pilares: **Educacional**, **Autoridade**, **Descritivo/Explicativo**

## Quando NÃO usar

- Temas **conceituais ou filosóficos** (mentalidade, disciplina, processo) — usar `padrao` ou outro estilo tipográfico
- Quando **não há vídeos do Ramon** disponíveis para o exercício — o slide de chroma fica vazio na pós
- Posts de **CTA puro** (sem conteúdo de treino real) — outro estilo serve melhor
- Conteúdo **curto** (1-3 exercícios) — o ritmo do estilo pede pelo menos 4-6 exercícios

---

## Variantes (classes do template)

Trocar a classe da `<section class="slide ...">`:
- `slide capa` — slide 1 (foto Ramon + título grande)
- `slide lista` — slide 2 (foto Ramon + lista de exercícios)
- `slide exercicio` — slides 3 a N+2 (chroma verde + canto com nome/reps)
- `slide cta` — slide final (foto Ramon + frase centralizada)

---

## Tokens específicos do estilo

| Token | Valor |
|---|---|
| Chroma key (background exercício) | `#00B140` |
| Padding lateral | `80px` |
| Topbar height | `~40px` (na resolução 1080) |
| Logo height | `~32px` (com drop-shadow) |
| Tag de tópico (size) | `~14px`, letter-spacing `0.16em`, CAIXA ALTA |
| Título capa (size) | `160–180px` Anton |
| Nome exercício (size lista) | `~32px` Montserrat 700 CAIXA ALTA |
| Reps (size lista) | `~26px` Montserrat 300 CAIXA ALTA |
| Nome exercício (canto chroma) | `~38px` Montserrat 700 CAIXA ALTA |
| Reps (canto chroma) | `~30px` Montserrat 300 CAIXA ALTA |

---

## Notas

- Em slides chroma (`#00B140`), **remover qualquer drop-shadow ou filtro** que possa contaminar a chave de cor na pós.
- O símbolo de falha `Ⓕ` deve ser preservado como caractere unicode (U+24BB) — não substituir por imagem.
- Se o número de exercícios for muito grande para caber na lista do slide 2, dividir em 2 slides de lista (raro — caso seja necessário, sinalizar ao Diretor).
