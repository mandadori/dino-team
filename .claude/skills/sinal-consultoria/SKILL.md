---
name: sinal-consultoria
description: Roteia um sinal REAL da consultoria para o cérebro: aluno travou em X → candidato a dor (`publico/dores.md`); pergunta recorrente → objeção (`publico/objecoes.md`); resultado de aluno → prova (`performance/`). A skill classifica e **propõe ao owner do slice** (dono único consolida). Não inventa sinais — recebe do consultor.
---

# /sinal-consultoria

Recebe um sinal real de consultoria e o roteia ao owner correto para que o cérebro de marca seja alimentado por dados reais — sem acoplamento direto entre Produto e Marketing.

**Sintaxe:**

```
/sinal-consultoria <descrição do sinal>
```

`<descrição do sinal>` — texto livre descrevendo o que aconteceu na consultoria: o que o aluno travou, a pergunta que recorre, ou o resultado alcançado. Sem sinal real no input, a skill devolve `SEM_SINAL` e encerra.

## Fluxo

| Passo | Agente/Ação | Recebe | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ validar input | texto livre do consultor | — | sinal presente ou `SEM_SINAL` |
| 2 | ⚙ classificar sinal (inline) | sinal ← 1 | 1 | classe: `dor` \| `objecao` \| `prova`; se ambíguo → ⏸ pergunta ao usuário |
| 3 | ⚙ formatar proposta | sinal + classe ← 2 | 2 | proposta no schema do slice-alvo |
| 3.⏸ | ⏸ confirmação humana | proposta ← 3 | 3 | aprovação antes de acionar owner |
| 4a | `pesquisador-mercado` (se dor) | proposta de entrada em `publico/dores.md` | 3.⏸ aprovado | entrada incorporada ao slice |
| 4b | `pesquisador-mercado` (se objeção) | proposta de entrada em `publico/objecoes.md` | 3.⏸ aprovado | entrada incorporada ao slice |
| 4c | `analista-performance` (se prova) | proposta de prova real em `performance/` | 3.⏸ aprovado | entrada incorporada ao slice |
| 5 | ⚙ relatório inline | outputs ← 4a\|4b\|4c | 4 | confirmação: o que foi proposto, qual slice, status |

## Pipeline

### 1. Validar input

Se o input estiver vazio ou for apenas espaço em branco:

```
SEM_SINAL — forneça a descrição do que aconteceu na consultoria.
```

Encerre. Não invente sinal.

### 2. Classificar o sinal (inline)

Leia o sinal e classifique em **uma** das três categorias:

| Classe | Critério |
|---|---|
| `dor` | Estado interno negativo do aluno — trava, frustração, dificuldade, algo que o paralisa ou desencoraja. |
| `objecao` | Barreira à entrada ou à continuidade na consultoria — argumento que o aluno usa para não avançar. |
| `prova` | Resultado real positivo alcançado pelo aluno — antes/depois mensurável, conquista concreta. |

**Se o sinal for claro** → classifique e siga ao Passo 3.

**Se ambíguo entre duas classes** → pause (⏸) e apresente ao usuário:

```
O sinal pode ser classificado como:
- dor: <por quê>
- objeção: <por quê>

Qual melhor descreve o que aconteceu?
```

Aguarde resposta antes de seguir.

### 3. Formatar proposta

Monte a proposta no schema do slice-alvo. A skill **não escreve** nos slices — ela **aciona o owner**, que escreve.

**Para `dor`** → proposta de entrada para `publico/dores.md`:

```
### <nome curto da dor>
- **Descrição:** <o que o aluno experimenta>
- **Fala do público:** "<fala crua do aluno, se disponível>"
- **Prêmio:** <Corpo | Identidade | ambos>
- **Serve:** <Pilar sugerido> · <mecanismo sugerido se evidente>
- **Origem:** sinal real de consultoria — <data>
```

**Para `objecao`** → proposta de entrada para `publico/objecoes.md`:

```
### "<objeção em fala direta>"
- **Descrição:** <contexto da objeção>
- **Fala do público:** "<fala crua do aluno>"
- **Reframe:** <como a marca responde — alinhado ao tom>
- **Mecanismo:** <M sugerido se evidente>
- **Pilar:** <pilar sugerido>
- **Origem:** sinal real de consultoria — <data>
```

**Para `prova`** → proposta de entrada para `memory/performance/`:

```
### Prova — <slug descritivo>
- **Resultado:** <o que o aluno alcançou, mensurável>
- **Contexto:** <tempo de consultoria, ponto de partida>
- **Fala do aluno:** "<frase real, se disponível>"
- **Pilar servido:** <Transformação | Prova viva>
- **Origem:** sinal real de consultoria — <data>
```

Campos entre `< >` são preenchidos com base no sinal. Campos sem dado concreto ficam com `(a confirmar)` — **não inventar**.

### 3.⏸ Confirmação humana

Apresente a proposta formatada ao usuário e aguarde aprovação antes de acionar o owner. Esta pausa é **obrigatória** — autonomia `humano` conforme `orquestracao/governanca.yaml` (função `sinais-produto`):

```
Sinal classificado como: <classe>
Slice-alvo: <arquivo>

Proposta de entrada:
---
<proposta formatada do Passo 3>
---

Confirma? 
- "sim" → aciono o owner para incorporar
- "corrigir <campo>: <valor>" → ajusto a proposta e reapresento
- "cancelar" → encerro sem gravar
```

Se o usuário pedir correção, aplique inline e reapresente. Repita até "sim" ou "cancelar".

### 4. Acionar o owner do slice

**Owner não conhece a skill — recebe apenas a proposta formatada e a tarefa clara.**

**Se `dor` ou `objeção` → acione `pesquisador-mercado`:**

```
Tarefa: incorporar proposta de entrada ao slice publico/.

Inputs:
- Arquivo-alvo: memory/publico/<dores.md | objecoes.md>
- Proposta de entrada:
<proposta do Passo 3>
- Ação: adicionar a entrada à seção "## Entradas". Preservar todas as entradas existentes. Atualizar `ultima_atualizacao` no frontmatter para <data de hoje>.
- Origem da proposta: /sinal-consultoria (sinal real de consultoria aprovado pelo usuário).

Saída: manifesto.
```

**Se `prova` → acione `analista-performance`:**

```
Tarefa: registrar prova de aluno como resultado real de consultoria.

Inputs:
- Arquivo-alvo: memory/performance/ (crie memory/performance/provas-de-aluno.md se não existir)
- Proposta de entrada:
<proposta do Passo 3>
- Ação: adicionar a entrada ao arquivo. Se arquivo não existir, crie com frontmatter padrão (slice: performance, owner: analista-performance). Atualizar `ultima_atualizacao`.
- Origem da proposta: /sinal-consultoria (sinal real de consultoria aprovado pelo usuário).

Saída: manifesto.
```

**Regra dura:** a skill **não escreve** nos slices. O owner consolida e é o único que escreve. Se o owner devolver erro, reporte ao usuário sem retry automático.

### 5. Relatório inline

Após o owner confirmar (manifesto ok):

```
Sinal registrado no cérebro.

- Classificação: <dor | objeção | prova>
- Slice atualizado: <arquivo>
- Owner que consolidou: <pesquisador-mercado | analista-performance>
- Entrada: "<nome curto da dor | objeção | prova>"

Este sinal está disponível para Marketing e Produto lerem do cérebro — sem acoplamento direto entre as funções.
```

Se o owner devolver erro:

```
ERRO — owner não conseguiu gravar.
<erro do manifesto>
Ação necessária: verificar o slice e tentar novamente.
```

## Regra dura

**A skill não escreve nos slices.** Ela classifica, formata a proposta, obtém confirmação humana e **aciona o owner**, que é o único que escreve. Dono único preservado.

**Sem sinal real no input → `SEM_SINAL`.** Não invente dores, objeções nem provas.
