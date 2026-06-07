---
name: ciclo-de-direcao
description: Ciclo periódico de direção de marca. Lê o cérebro inteiro e atualiza `memory/narrativas/` — ativa/aposenta arcos, define crença-alvo, sinaliza saturação. NÃO produz conteúdo. Disparo manual agora; cron/threshold na Onda 5.
---

# /ciclo-de-direcao — Dino Team

## Objetivo

Ciclo de direção de marca — lê o estado completo do cérebro e atualiza `memory/narrativas/` com a direção vigente: arcos ativos, crença-alvo do trimestre, o que saturou. **Não produz nenhum conteúdo** (copy, briefing, post). É a camada estratégica acima da pauta — `/planejar-pauta-semanal` é downstream deste ciclo.

A virada de narrativa (ativar/aposentar arco) **exige aprovação humana**: o agente devolve proposta, a skill pausa, o humano decide.

## Sintaxe

```
/ciclo-de-direcao
```

Sem parâmetros obrigatórios. O ciclo lê o estado atual do cérebro e produz proposta de atualização.

## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ reunir estado | — | — | caminhos do cérebro |
| 2 | `estrategista-narrativa` (tarefa: `revisar-direcao`) | caminhos ← 1 | 1 | proposta de mudanças em `ativas.md`/`roadmap-crenca.md` |
| 3 | ⏸ usuário | proposta ← 2 | 2 | aprovação (sim/não/ajustar) |
| 4 | `estrategista-narrativa` (tarefa: `definir-roadmap` + gravar aprovados) | aprovação ← 3 | 3 | `ativas.md` + `roadmap-crenca.md` atualizados |
| 5 | ⚙ relatório inline | — | 4 | relatório de direção |

---

## Pipeline

### 1. Reunir estado do cérebro

Coletar os caminhos relevantes para passar ao agente:

```
memory/narrativas/ativas.md
memory/narrativas/roadmap-crenca.md
memory/narrativas/livro-razao.md
memory/mercado/narrativa-de-mercado.md
memory/performance/angulos-queimados.md
memory/publico/dores.md
memory/publico/objecoes.md
brand/pilares-conteudo.md
```

Verificar que os arquivos existem antes de prosseguir. Se `memory/narrativas/livro-razao.md` estiver vazio (Onda 2 ainda não tem write-back), passar mesmo assim — o agente lida com tabela vazia.

### 2. Acionar `estrategista-narrativa` — revisar direção

```
Tarefa: revisar-direcao

Inputs:
- Leia o cérebro completo:
  - memory/narrativas/ativas.md
  - memory/narrativas/roadmap-crenca.md
  - memory/narrativas/livro-razao.md (saturação)
  - memory/mercado/narrativa-de-mercado.md (pedra de amolar)
  - memory/performance/angulos-queimados.md
  - memory/publico/dores.md
  - memory/publico/objecoes.md
  - brand/pilares-conteudo.md
- Decida: arcos a ativar, ajustar, aposentar; saturação; roadmap de crença a revisar.
- Devolva proposta — NÃO aplique ainda.
```

O agente devolve `<proposta-direcao>` com `aguarda-aprovacao: sim`. Se devolver `INPUT_INSUFICIENTE` ou `SLICE_AUSENTE`, abortar com o erro recebido.

### 3. Pausar para aprovação humana

Exibir a proposta do agente de forma legível ao usuário:

```
## Proposta de direção — /ciclo-de-direcao

**Arcos a ativar:** <lista ou "nenhum">
**Arcos a aposentar:** <lista ou "nenhum">
**Ajustes em arcos existentes:** <lista ou "nenhum">
**Saturação detectada:** <arco + contagem ou "nenhuma">

**Justificativa:**
<texto do agente>

---
Aprovar? [sim | não | ajustar — descreva o ajuste]
```

**Regra de autonomia:** virar ou aposentar narrativa exige resposta explícita do usuário. Nunca prosseguir automaticamente quando `arcos-a-ativar` ou `arcos-a-aposentar` não estiverem vazios.

Se o usuário responder "não", encerrar sem gravar nada. Se "ajustar", repassar o ajuste ao agente e repetir o Passo 2.

### 4. Acionar `estrategista-narrativa` — aplicar aprovados

Com a aprovação do usuário (ou "sim" sem ressalvas):

```
Tarefa: definir-roadmap

Inputs:
- Proposta aprovada: <proposta-direcao do Passo 2>
- Aprovação do usuário: <resposta literal do Passo 3>
- Aplique as mudanças aprovadas em memory/narrativas/ativas.md e memory/narrativas/roadmap-crenca.md.
- Atualize o campo ultima_atualizacao no frontmatter de cada arquivo editado.
```

O agente grava diretamente nos arquivos do slice (é o owner único). Conferir que retornou `status: ok`.

### 5. Relatório inline

Exibir ao usuário:

```
Ciclo de direção concluído — <YYYY-MM-DD>

**Arcos ativos:**
<lista de arcos com estado e crença-alvo>

**Crença-alvo do trimestre:**
<3 meses do roadmap>

**O que saturou:**
<lista ou "nada detectado ainda">

Próximo passo: rode /planejar-pauta-semanal — a pauta lerá os arcos ativos automaticamente.
```

---

## Quando dispara

- **Manual** via `/ciclo-de-direcao` (agora — Onda 2).
- **Cron + threshold** (Onda 5): cron mensal + disparo por threshold de saturação (quando o livro-razão detectar ≥N entradas da mesma mensagem numa janela, write-back sinaliza e a skill é disparada).

## Critério de conclusão

- `memory/narrativas/ativas.md` reflete os arcos aprovados (≥1 ativo).
- `memory/narrativas/roadmap-crenca.md` tem os 3 horizontes preenchidos.
- Nenhum arco foi ativado ou aposentado sem aprovação humana explícita.
- Nenhum conteúdo foi produzido.
