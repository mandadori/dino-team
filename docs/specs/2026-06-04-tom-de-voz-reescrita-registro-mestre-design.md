# Tom de Voz — Reescrita com Registro de Mestre

> Spec de design. Brainstorm em 2026-06-04.
> Frente ③ (sistema de copy). Reescreve `brand/tom-de-voz.md` mais limpo/assertivo/organizado, com uma trava de registro explícita que impede a voz de escorregar para "narrador comum" em texto longo. Mesma essência.

---

## Contexto

`brand/tom-de-voz.md` é o documento que governa como a marca fala. Toda copy nasce dele (a skill `/novo-post` gera a copy inline lendo o tom). O documento atual (re-autorado 2026-05-31, refinado 2026-06-01) tem ~260 linhas: personalidade, espinha filosófica, mecanismos M1–M9, vocabulário, cenários de borda e 17 regras de copy.

**Sintoma:** em frase curta a copy fica no registro certo; em **corpo editorial longo** a voz escorrega para "pessoa comum narrando" — usa palavra cotidiana ("travei", "corrói"), narra cena em vez de enunciar princípio, repete termo (filma/filmou/câmera), e usa o objeto literal em vez do nome de princípio.

## Causa-raiz (por que o tom não foi seguido)

Não é falta de fidelidade ao doc — são **lacunas do doc**:

1. **O tom só sabe ensinar frase curta.** Todos os mecanismos M1–M9 são moldes de frase aforística isolada. Não há nenhum molde para **sustentar o registro ao longo de um parágrafo**. No corpo longo o modelo fica sem padrão e cai no default da linguagem: **narrar uma cena**.
2. **A regra que evitaria isso está enterrada.** A única guia próxima é a regra de copy nº 13 de 17 ("ensine como mestre, em presente universal") — peso quase nulo na geração, e diz o "o quê" sem os **"nãos"** explícitos.
3. **Não há exemplo de contraste em formato longo.** O doc tem ótimos exemplos positivos e curtos, mas nenhum par "narração (errado) → princípio (certo)" no tamanho de um corpo. O modelo casa padrão com o que vê (frases soltas) e improvisa o parágrafo.

## Decisões (brainstorm 2026-06-04)

| # | Decisão | Escolha |
|---|---------|---------|
| D1 | Escopo | **Só reescrever `tom-de-voz.md`** — mais limpo/assertivo/organizado, mesma essência |
| D2 | A trava | Nova seção **"Registro de mestre"** no topo, com os **"nãos"** explícitos, válida em qualquer tamanho de texto |
| D3 | Exemplos | **Pares de contraste em formato longo** (narração → princípio), derivados das correções reais do usuário |
| D4 | Camada de "modo de copy" | **Descartada (YAGNI).** O modo (narrativa/mensagem) é governado pelo pilar + tom; não precisa de doc próprio. A solução é não fugir do tom, não adicionar estrutura |

---

## Arquitetura do documento reescrito

Reordenar numa hierarquia limpa, deduplicando a sobreposição atual entre *Características*, *Mecanismos*, *Regras de copy* e *Vocabulário*:

```
1. Personalidade da marca (enxuta — 3 palavras + o que NÃO é)
2. ★ Registro de mestre (NOVO — a trava; vale em qualquer tamanho)
3. Espinha filosófica (direção → caminho → identidade) — mantida
4. Mecanismos de construção (M1–M9 consolidados, sem repetir o que virou regra)
5. Vocabulário (usar / evitar / hierarquia por contexto) — mantido
6. Cenários de borda — mantidos
7. Sign-off fixo + Frases-bandeira — mantidos
```

As 17 "Regras de copy" atuais são **absorvidas**: as que são registro sobem para a seção 2; as que são mecanismo viram nota nos M1–M9; as redundantes saem. Nenhum mecanismo ou nuance é perdido — só corta-se a repetição.

### Seção nova — "Registro de mestre" (conteúdo)

A trava, no topo, com os "nãos" explícitos e exemplos de contraste **em formato longo**:

1. **Enuncie princípio, não narre cena.** Verdade universal em presente, não relato de um acontecimento.
   - ❌ "Anos treinando, tudo certo, e o espelho não responde."
   - ✅ "Anos de treino exaustivo não garantem resultado no espelho."
2. **Sem vocabulário cotidiano/emocional.** Nada de "travei", "corrói", "trava" — a autoridade é calma, não dramatiza.
   - ❌ "Aí vem a pergunta que corrói: será que travei?"
   - ✅ "A pergunta que você deve se fazer."
3. **Substantivo de princípio > objeto literal.** Prefira o nome abstrato ao prop concreto.
   - ❌ "longe de qualquer câmera"  ✅ "longe de qualquer reconhecimento"
   - quando o concreto for necessário, use o do léxico atual do público: ❌ "que ninguém filma" → ✅ "que ninguém posta"
4. **Léxico da marca.** "estagnado" (não "travou"); processo, direção, caminho, identidade.
   - ❌ "Não travou. Você só entrou na parte do processo que ninguém filma."
   - ✅ "Você não está estagnado. Essa é a parte do processo que ninguém posta."
5. **Não repita termo** em frases vizinhas (ex.: filma/filmou/câmera no mesmo bloco).
6. **Fale ao leitor com autoridade**, não encarne a dúvida dele. O mestre aponta; não terceiriza a insegurança como narrador.

> Regra-guarda: **se a frase soa como algo que uma pessoa comum diria sobre si mesma, está errada. Tem que soar como um mestre enunciando um princípio.**

## O que NÃO muda (essência preservada)

- Registro **sereno, íntimo, direto**; autoridade calma (vem do título, não do volume).
- Espinha filosófica: direção → caminho → identidade.
- Todos os mecanismos M1–M9 (dualidade, hook contrário, trabalho invisível, disciplina sem vitimismo, princípio de origem, caminho→identidade, contraste de tribo, reframe de privilégio, vergonha silenciosa).
- Vocabulário (usar/evitar/hierarquia), cenários de borda.
- Sign-off fixo **"O topo exige direção."** e as frases-bandeira.

## Validação

- **Diff** do reescrito contra o atual — o usuário confirma que a essência ficou intacta e a organização ficou mais limpa.
- **Prova de fogo:** reescrever o slide editorial que falhou (o de mindset "o que ninguém vê") usando o tom novo, e comparar com o original — o corpo longo deve sustentar o registro de mestre.

## Fora de escopo

- `modos-de-copy.md` / catálogo de modos — descartado (D4).
- Mudança no processo de geração (a skill já lê o tom; a trava prominente basta).
- Papéis de agente / ângulos queimados (frente ④).
- Identidade visual e editor (frentes ① e ② — já feitas).
