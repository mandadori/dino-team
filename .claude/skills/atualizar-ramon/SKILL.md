---
name: atualizar-ramon
description: Skill interativa para atualizar o slice `dados/ramon/` — fase atual, cronograma, princípios, falas, conquistas. Usa o agente `arquivista` como owner único do slice. Aceita input manual do usuário OU dispara o auto-sync (busca em fontes públicas). Sem ela, agentes que dependem do contexto Ramon operam às cegas.
---

# /atualizar-ramon — Dino Team

## Objetivo

Manter `dados/ramon/contexto.md` atualizado — slice da memória persistente sobre o Ramon, lido inline pelas skills de post para calibrar todo conteúdo.

## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ diagnóstico | dados/ramon (archivist auto) | — | estado atual |
| 2 | ⏸ usuário | — | 1 | input |
| 3 | arquivista | input ← 2 | 2 | contexto.md (manifesto) |
| 4 | ⚙ tratar retorno | retorno ← 3 | 3 | tratamento + oferta |
| 5 | ⚙ reportar | — | 4 | conclusão |

## Sintaxe

```
/atualizar-ramon
```

Sem argumentos — a skill é conversacional. O usuário descreve o que mudou (texto livre), ou pede para o sistema buscar sozinho ("sincroniza", "busca atualizações"). A skill identifica a seção afetada e aciona `arquivista`.

## Pipeline

### 1. Diagnóstico — mostrar estado atual

Ler `dados/ramon/contexto.md` e mostrar inline:
- Seção "Fase atual" (fase + última revisão).
- Seção "Cronograma" (últimas 5 entradas, ou "(vazio)").

Apresentar:

```
Slice ramon/ — estado atual (dados/ramon/contexto.md):

Fase atual: <conteúdo da seção Fase atual | "(vazio — primeira atualização)">
Última revisão de fase: <data | "(nunca)">

Últimas entradas do cronograma:
<lista | "(vazio)">

O que vamos atualizar?
- "fase atual" / "fase" → atualizar seção Fase atual
- "cronograma" / "agenda" / "calendário" → adicionar/editar entradas no Cronograma
- "princípios" / "falas" / "conquistas" → outras seções
- "sincroniza" / "busca" → auto-sync: archivist busca fontes públicas e propõe
- texto livre → eu identifico
```

### 2. Coletar input do usuário

**Atualizar fase atual:**

Pergunte:
1. Qual é a fase agora? (off-season | prep | prep avançada | peak week | pós-campeonato | transição | outro — descreva)
2. Desde quando? (`YYYY-MM-DD` ou "hoje")
3. Sinalizações específicas (opcional): há alguma restrição editorial desta fase? (ex: peak week → não publicar conteúdo que sugira mudar dieta)

**Adicionar entrada no cronograma:**

Pergunte:
1. Data ou faixa de datas (`YYYY-MM-DD` ou `YYYY-MM` ou "próximo mês")
2. Descrição em 1 linha (ex: "Arnold Classic SA 2026", "viagem Doha", "gravação Pretinho")
3. Tipo (campeonato | viagem | conteúdo gravado | fase | marco pessoal)
4. Status (confirmado | provável | passado)

**Auto-sync (busca automática):**

Sem perguntas de conteúdo — confirme a janela: "Buscar atividade pública do Ramon dos últimos <30 dias / período>?" e siga para o Passo 3 em modo auto-sync.

**Texto livre:**

Tente parsear:
- Se mencionar fase + data → atualizar fase.
- Se mencionar data + evento → adicionar ao cronograma.
- Caso contrário, pergunte qual seção é o alvo.

### 3. Acionar `arquivista`

[Agente: `arquivista`]

```
Tarefa: <atualizar fase atual | adicionar entrada no cronograma | adicionar fato em <seção> | auto-sync>

Inputs:
- <campos coletados no Passo 2, estruturados> | <janela temporal, se auto-sync>
- Fonte: usuário via /atualizar-ramon na data <YYYY-MM-DD> | (auto-sync: você cita as fontes públicas que encontrar)

Regras:
- Edite a seção relevante de dados/ramon/contexto.md; atualize `ultima_atualizacao` no frontmatter.
- Mudança de fase SEMPRE requer confirmação do usuário — se for auto-sync, devolva CONFIRMAR_FASE em vez de gravar.
- Se houver conflito com entrada existente, devolva CONFLITO_FATOS — eu pergunto ao usuário e re-aciono.

Saída: contexto.md atualizado + 1-3 linhas confirmando (ou proposta, se alto risco).
```

### 4. Tratar retorno + oferecer próxima atualização

- **Gravou** → mostrar inline o que mudou e seguir.
- **`CONFIRMAR_FASE`** → mostrar a proposta + fonte ao usuário; se confirmar, re-acionar o archivist com "tarefa: atualizar fase atual, confirmado pelo usuário".
- **`CONFLITO_FATOS`** → mostrar o conflito; perguntar substituir / manter as duas / descartar; re-acionar.

Depois:

```
Gravado em dados/ramon/contexto.md:
<diff resumido — só a parte que mudou>

Mais alguma coisa pra atualizar? (sim/não)
```

Loop até "não".

### 5. Reportar conclusão

```
Slice ramon/ atualizado.
Seções modificadas em dados/ramon/contexto.md:
- <lista>

Próximo /novo-post vai consultar o estado novo do slice.
```

## Princípios

- **Fonte é fonte da verdade.** O usuário descreve (ou o auto-sync cita URL), archivist grava — agentes não inventam.
- **Confirmação após cada gravação.** O usuário vê o que foi escrito antes de prosseguir.
- **Mudança de fase sempre confirmada.** Mesmo no auto-sync — fase calibra todo conteúdo.
- **Conflito de fatos pausa a skill.** Em `CONFLITO_FATOS`, pergunte: substituir, manter as duas, descartar a nova?
- **Incremental.** Pode parar e voltar — cada subatualização é independente.

## Critério de conclusão

- Pelo menos 1 seção de `dados/ramon/contexto.md` foi atualizada e versionada (ou auto-sync rodou e nada novo havia).
- `arquivista` retornou confirmação.
- O usuário encerrou explicitamente ("não" para próxima atualização).
