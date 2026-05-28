# Estilo `treino-dino` — Carrossel

## Conceito visual

Carrossel de **treino completo do Ramon Dino** — o público recebe um treino real, exercício por exercício, com quantidade de séries e repetições. Os slides de exercício usam **background verde chroma** (`#00B140`) para que o editor adicione, na pós-produção, o vídeo do Ramon executando o movimento.

Estética cinematográfica P&B nos slides com foto, contraste com chroma sólido nos slides de exercício. Tipografia Anton + Montserrat sempre em CAIXA ALTA. Logo DINO sempre presente no topo-esquerdo.

DNA editorial: instrutivo seco, autoridade técnica. Sem motivação inflada, sem floreio — o entregável é o treino, e o treino fala por si.

---

## Estrutura

Sequência **fixa** de **N+3 slides**, onde N é o número de exercícios fornecidos. Em todos os slides: barra de progresso inferior (3px) com fill proporcional à posição.

### Bloco `slide-1` — Capa

- **Classe HTML / variante visual:** `slide capa`
- **Função editorial:** hook
- **Tom:** anúncio direto — nomeia o treino, sem rodeios.
- **O que entregar:** título grande em Anton (até 5 palavras) chamando o treino — ex: `TREINO PARA COSTAS EM V`. Tag de tópico curta no topo-direito (ex: `BACK DAY`). Limite: até 5 palavras no título, até 3 palavras na tag.
- **Variações A/B:** sim — A e B no título da capa.
- **Inputs visuais:** foto do Ramon como background com `data-bg-drop="photo"` + overlay escuro.

### Bloco `slide-2` — Lista do treino

- **Classe HTML / variante visual:** `slide lista`
- **Função editorial:** mapa — entrega o panorama do que vem.
- **Tom:** neutro técnico. Sem adjetivos, sem subjetividade.
- **O que entregar:** tag de tópico (ex: `O TREINO`) + lista vertical de todos os exercícios numerados em ordem de execução. Cada item: `N. NOME DO EXERCÍCIO` + linha com `N SÉRIES` + reps por série (separadas por espaço, `Ⓕ` para falha).
- **Variações A/B:** não. Conteúdo determinado pelos inputs externos.
- **Inputs visuais:** foto do Ramon como background com `data-bg-drop="photo"` + overlay escuro.

### Blocos `slide-3 a slide-(N+2)` — Um exercício por slide

- **Classe HTML / variante visual:** `slide exercicio`
- **Função editorial:** instrução técnica.
- **Tom:** seco. Nome do exercício + reps. Nada além disso na copy.
- **O que entregar:** tag ordinal no topo-direito (`PRIMEIRO EXERCÍCIO`, `SEGUNDO EXERCÍCIO`, ..., `ÚLTIMO EXERCÍCIO`) + nome do exercício no canto inferior esquerdo + séries × reps logo abaixo. Sem texto sobre a área central (reservada ao vídeo do Ramon).
- **Variações A/B:** não. Conteúdo determinado pelos inputs externos.
- **Inputs visuais:** background chroma verde sólido (`#00B140`), sem foto, sem drop zone. Área central reservada — NÃO marcar `data-bg-drop`.

### Bloco `slide-(N+3)` — CTA final

- **Classe HTML / variante visual:** `slide cta`
- **Função editorial:** CTA / fechamento filosófico.
- **Tom:** afirmativo, marca-DNA — frase curta de direção.
- **O que entregar:** título centralizado em Anton, frase de fechamento (ex: `JUNTOS VAMOS MAIS LONGE.`). Tag de tópico curta no topo (ex: `DIRECIONE SEU ESFORÇO`). Sem swipe cue (último slide). Limite: até 6 palavras na frase, até 3 na tag.
- **Variações A/B:** sim — A e B na frase de fechamento.
- **Inputs visuais:** foto do Ramon como background com `data-bg-drop="photo"` + overlay escuro.

---

## Quando usar

- Posts onde o entregável é um **treino real e replicável** (não conceitual).
- Quando o cliente quer **demonstração técnica** com vídeo do Ramon.
- Conteúdo **educacional + autoridade** combinados — ensina e prova a competência.
- Pilares: **Educacional**, **Autoridade**, **Descritivo/Explicativo**.

## Quando NÃO usar

- Temas **conceituais ou filosóficos** (mentalidade, disciplina, processo) — outro estilo tipográfico serve melhor.
- Quando **não há vídeos do Ramon** disponíveis para o exercício — o slide de chroma fica vazio na pós.
- Posts de **CTA puro** (sem conteúdo de treino real) — outro estilo serve melhor.
- Conteúdo **curto** (1-3 exercícios) — o ritmo do estilo pede pelo menos 4-6 exercícios.

---

## Variantes visuais

Trocar a classe da `<section class="slide ...">`:

- `slide capa` — slide 1 (foto Ramon + título grande + swipe cue).
- `slide lista` — slide 2 (foto Ramon + lista numerada de exercícios).
- `slide exercicio` — slides 3 a N+2 (chroma verde + canto com nome/reps).
- `slide cta` — slide final (foto Ramon + frase centralizada).

---

## Inputs obrigatórios externos

Tipo: **Prescrição técnica de treino**.

Formato esperado:

- **Grupo muscular ou foco do treino** (ex: costas em V, perna completa, ombro 3D).
- **Lista de exercícios** em ordem de execução. Numeração `1., 2., 3., ...` (não A1./B1./C1.).
- **(Opcional) Séries e repetições por exercício.**

Exemplo de lista:
```
1. Supino inclinado na máquina
2. Crucifixo na máquina
3. Tríceps testa com barra W
4. Tríceps corda
```

Formato de séries/reps (quando fornecido):
- Separar séries por espaço: `4 SÉRIES 12 10 Ⓕ Ⓕ`
- Símbolo `Ⓕ` representa **falha** (rep até a falha muscular).

Quem produz quando o usuário não fornece séries/reps: agente `treinador`, acionado pela skill.

---

## Cores adicionais / Tokens

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

## Notas técnicas

- Em slides chroma (`#00B140`), **remover qualquer drop-shadow ou filtro** que possa contaminar a chave de cor na pós.
- O símbolo de falha `Ⓕ` deve ser preservado como caractere unicode (U+24BB) — não substituir por imagem.
- Se o número de exercícios for muito grande para caber na lista do slide 2, dividir em 2 slides de lista (raro — caso seja necessário, sinalizar ao Diretor).
