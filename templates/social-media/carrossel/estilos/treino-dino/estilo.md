# Estilo `treino-dino` — Carrossel

## Conceito

Treino completo do Ramon — exercício por exercício, com séries e repetições. Slides de exercício usam chroma verde (#00B140) para inserção de vídeo do Ramon em pós-produção. DNA editorial: instrutivo seco, autoridade técnica. O entregável é o treino; o treino fala por si.

## Estrutura

[sequência]: capa(1, obrigatório) → lista(1, obrigatório) → exercício(N, dinâmico) → cta(1, obrigatório)
[total]: min N+3 | max sem limite

### bloco: capa
[instâncias]: 1

#### visual
[classe]: slide capa
[bg]: foto(drop: photo)
[overlay]: gradiente-escuro-base
[slots]:
  título: Anton 160-180px | centro-vertical | alinhamento esquerdo
  tag-tópico: posição topo-dir
  logo: posição topo-esq
  swipe-cue: posição rodapé-centro
  barra-progresso: posição rodapé
[tokens]: título Anton 160-180px

#### editorial
[função]: hook
[tom]: anúncio direto — nomeia o treino, sem rodeios
[entregar]:
  título: max 5 palavras
  tag-tópico: max 3 palavras (ex: BACK DAY)
[ab]: título

---

### bloco: lista
[instâncias]: 1

#### visual
[classe]: slide lista
[bg]: foto(drop: photo)
[overlay]: gradiente-escuro-base
[slots]:
  tag-tópico: posição topo-dir
  lista-exercicios: Montserrat 700 ~32px (nome) + 300 ~26px (reps) | esquerdo | vertical numerada
  logo: posição topo-esq
  barra-progresso: posição rodapé
[tokens]: nome-exercício Montserrat 700 ~32px; reps Montserrat 300 ~26px

#### editorial
[função]: contexto
[tom]: neutro técnico. Sem adjetivos.
[entregar]:
  tag-tópico: max 3 palavras (ex: O TREINO)
  lista-exercicios: todos os exercícios numerados em ordem — cada item: número + nome + séries e reps
[ab]: não

---

### bloco: exercício
[instâncias]: N-dinâmico (fonte: treino.md → lista-exercícios)

#### visual
[classe]: slide exercicio
[bg]: chroma(#00B140)
[overlay]: nenhum
[slots]:
  tag-ordinal: posição topo-dir
  nome-exercicio: Montserrat 700 ~38px | canto inferior esquerdo
  reps: Montserrat 300 ~30px | abaixo de nome-exercicio
  logo: posição topo-esq
  barra-progresso: posição rodapé
[tokens]: nome-exercício Montserrat 700 ~38px; reps Montserrat 300 ~30px

#### editorial
[função]: instrução-técnica
[tom]: seco. Nome do exercício + reps. Nada além.
[entregar]:
  tag-ordinal: ordinal por extenso (PRIMEIRO EXERCÍCIO, SEGUNDO EXERCÍCIO, ..., ÚLTIMO EXERCÍCIO)
  nome-exercicio: nome exato do exercício
  reps: séries × reps no formato do treino.md
[ab]: não

---

### bloco: cta
[instâncias]: 1

#### visual
[classe]: slide cta
[bg]: foto(drop: photo)
[overlay]: gradiente-escuro-base
[slots]:
  título: Anton ~160px | centro | centralizado
  tag-tópico: posição topo-dir
  logo: posição topo-esq
  barra-progresso: posição rodapé | fill 100%
[tokens]: título Anton ~160px

#### editorial
[função]: CTA
[tom]: afirmativo, marca-DNA — frase curta de direção
[entregar]:
  título: max 6 palavras
  tag-tópico: max 3 palavras
[ab]: título

## Quando usar

- Posts onde o entregável é um **treino real e replicável** (não conceitual).
- Quando o cliente quer **demonstração técnica** com vídeo do Ramon.
- Conteúdo **educacional + autoridade** combinados.
- Pilares: Educacional, Autoridade, Descritivo/Explicativo.

## Quando NÃO usar

- Temas **conceituais ou filosóficos** — outro estilo tipográfico serve melhor.
- Quando **não há vídeos do Ramon** disponíveis para o exercício — slide chroma fica vazio na pós.
- Posts de **CTA puro** (sem conteúdo de treino real).
- Conteúdo **curto** (1-3 exercícios) — o ritmo pede pelo menos 4-6.

## Inputs obrigatórios externos

Tipo: **Prescrição técnica de treino.**

- **Grupo muscular ou foco** (ex: costas em V, perna completa).
- **Lista de exercícios** em ordem de execução. Numeração `1., 2., 3., ...`
- **(Opcional) Séries e repetições por exercício.**

Formato de séries/reps: separar séries por espaço: `4 SÉRIES 12 10 Ⓕ Ⓕ`. Símbolo `Ⓕ` = falha (U+24BB).

Quem produz séries/reps quando o usuário não fornece: agente `treinador`.

## Notas técnicas

- Slides chroma (#00B140): remover qualquer drop-shadow ou filtro que contamine a chave de cor na pós-produção.
- Símbolo `Ⓕ` (U+24BB) deve ser preservado como caractere unicode — não substituir por imagem.
- Área central dos slides chroma reservada ao vídeo do Ramon — sem texto nem sobreposição na zona central.
