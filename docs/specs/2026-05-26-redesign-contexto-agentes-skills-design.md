# Redesign: contexto cirúrgico entre agentes e skills

> Spec de design — 2026-05-26
> Estrutura: **Pattern + Deltas**. Os templates canônicos e as convenções vivem uma vez só; cada agente/skill recebe apenas o delta específico.

---

## Motivação

Auditoria do sistema revelou que skills injetam contexto que os agentes já auto-carregam (README do designer, `pilares-conteudo.md` no pesquisador, `referencias-visuais.md` no designer/curador). Além disso, skills misturam comportamento interno de agente com orquestração de fluxo, e os outputs dos agentes são prosa livre sem schema nem orçamento.

Este redesenho aplica 8 princípios a **todos os 15 agentes + 7 skills + CLAUDE.md**, de forma uniforme.

---

## Princípio central

> Cada agente recebe o **mínimo** necessário para tomar uma boa decisão — e entrega o **mínimo** suficiente para o próximo agente trabalhar.

Tudo abaixo é consequência desta regra.

### Os 8 princípios (adaptados ao runtime do Claude Code)

1. **Separação de responsabilidades.** Skill = fluxo macro (ordem, envelope entre agentes, dependências, retrabalho, output final). Contrato = comportamento interno (critérios de qualidade, como processar input, schema de output, tratamento de input incompleto). Nunca colocar "como o agente faz" na skill.
2. **Estrutura linear sem fragmentação.** Skills abrem com tabela de fluxo (passos numerados, quem executa, o que recebe, de quem depende, o que entrega). Une passos fragmentados; sem sub-rotinas desnecessárias.
3. **Dependências explícitas.** Nenhum agente é acionado antes de seu input estar disponível e qualificado.
4. **Outputs delimitados e estruturados.** Cada agente responde com schema rígido — nunca prosa livre. Sem preâmbulo; texto fora do schema é ignorado. Cardinalidade declarada.
5. **Orçamento de output.** Como o Task do Claude Code **não expõe `max_tokens` por subagent**, o orçamento é **disciplina via contrato**: alvo de concisão + anti-padding. Não é parâmetro de API.
6. **Passagem de contexto cirúrgica.** Nunca passar thread/histórico bruto. A skill extrai só os campos necessários do output anterior. **Skill não repassa contexto que o agente já auto-carrega.**
7. **Early-exit e retrabalho controlado.** Pontos de saída antes de agentes caros. **Máximo 1 retry automático por etapa**; 2º fracasso escala ao usuário.
8. **Sem redundância.** Nenhuma instrução repetida entre skill e contrato. Nenhum agente refaz trabalho de outro. Nenhum campo de output que ninguém consome.

### Decisões de runtime (travadas)

- **Orçamento (P5):** disciplina via contrato — alvo de concisão (~N palavras) + anti-padding. Sem `max_tokens`.
- **Schema (P4):** **híbrido por tipo de output**, não JSON uniforme (ver §Convenções).
- **Retry (P7):** **máx 1 retry uniforme** em todas as etapas. Aperta o `/novo-post` atual (3 no revisor-conteudo, 2 no revisor-brand) para 1+1.

---

## 1. Template canônico — contrato de agente

Todo agente passa a ter estas seções, nesta ordem:

```
---
name: <slug>
description: <quando é chamado, o que faz, o que NÃO faz>
tools: <...>
---

# <Papel>
<especialidade + fronteira (o que não faz)>

## Contexto que carrego          ← AUTO-LOAD (estático, não varia por chamada)
- brand/* que a função exige; slice que é owner; modo-específico se houver.

## Recebo                         ← ENVELOPE
- Campos exatos que a skill passa + de qual passo vêm.

## Entrego                        ← SCHEMA RÍGIDO
- inline rígido: tags/campos + cardinalidade declarada; OU
- file-producer: grava <arquivos> + retorna <manifesto> mínimo.
- Sem preâmbulo; texto fora do schema é ignorado.

## Orçamento de output           ← alvo de concisão + anti-padding
## Input incompleto              ← EARLY-EXIT: ERRO_X quando falta Y, antes de processar
## Princípios da especialidade   ← COMPORTAMENTO INTERNO (nunca migra pra skill)
## Anti-padrões
```

**Mudança vs. hoje:** `Contrato de entrada/saída` → **Recebo/Entrego** com schema rígido; ganha **Orçamento de output**; `Quando devolver erro` consolida em **Input incompleto**.

**Nota:** a regra de não-redundância (skill não repassa o que o agente auto-carrega) **não** vive no contrato do agente — o agente não controla o que a skill passa. Ela vive no template de skill.

---

## 2. Template canônico — skill

```
---
name: <skill>
description: <...>
---

# /<skill>
<propósito macro>

## Fluxo
| Passo | Agente/Ação | Recebe (campo ← passo) | Depende de | Entrega |
|-------|-------------|------------------------|------------|---------|
| 1 | pesquisador | tema, formato          | —          | <candidatos> |
| 2 | ⏸ usuário   | candidatos ← P1        | P1         | escolha      |
| 3 | briefing    | escolha ← P2           | P2         | <briefing>   |

## Gates de early-exit
- Antes de cada agente caro: condição de saída SEM acionar o próximo.

## Retrabalho
- Máx 1 retry por etapa; 2º fracasso → escala ao usuário.

## Passos detalhados
### Passo N — <agente>
<APENAS o envelope: campos exatos. Sem contexto auto-loaded. Sem instrução de comportamento interno.>

## Output final
```

**Regras do template de skill:**
- Tabela de fluxo no topo torna ordem e dependências auditáveis num relance.
- Ações de orquestrador (pausa humana ⏸, criar pasta, gate de política) entram na tabela marcadas, distintas de chamadas de agente.
- **Passos detalhados só carregam envelope.** Qualquer "como o agente faz" migra pro contrato.
- **Regra de não-redundância (P6/P8):** passos detalhados nunca repassam contexto que o agente já auto-carrega (ver "Contexto que carrego" do contrato). A skill só injeta o que varia por chamada.

---

## 3. Convenções transversais

### 3A. Schema de saída — 3 tipos (por modo, não por agente)

| Tipo | Quando | Formato | Agentes/modos |
|---|---|---|---|
| **Inline rígido** | consumido só por agente/skill, nunca mostrado cru | `<tags>` + cardinalidade | pesquisador (Fase B), revisor-conteudo, revisor-brand, curador-export, curador-web, treinador |
| **Markdown estruturado** | mostrado ao usuário **e** consumido por agente | campos `**negrito**`, conjunto fechado, sem preâmbulo | briefing-writer |
| **Manifesto** | agente escreve arquivo(s) | grava artefato + retorna `<manifesto>` curto | designer, copywriter, designer-web, dev-frontend, arquiteto-web, integrador-apis, archivist-ramon, analista-performance, pesquisador (Fase A + P7) |

Exemplos canônicos:

```
# Inline rígido (revisor)
<parecer>
<status>APROVADO | APROVADO_COM_AJUSTES | REPROVADO</status>
<apontamentos>- <arquivo>:<ponto> → <ajuste | categoria></apontamentos>
</parecer>

# Manifesto (file-producer)
<manifesto>
arquivos: 5 | pasta: .../design/
status: ok
obs: <1 linha ou vazio>
</manifesto>
```

Um agente com 2 modos (ex: pesquisador) declara **um schema por modo** no contrato.

### 3B. Orçamento por tipo

| Output | Alvo de concisão |
|---|---|
| Inline rígido (candidatos, parecer, validação) | ~150–300 palavras |
| Briefing (markdown estruturado) | ~250 palavras |
| Manifesto | ~50 palavras |
| Artefato em arquivo (copy, HTML, deep research) | sem teto global — governado pelos limites por bloco do `estilo.md`/template; disciplina = "só o necessário" |

Anti-padding universal: sem preâmbulo, sem eco do input, sem fecho, nada fora do schema.

### 3C. Early-exit + retrabalho

- **Gate antes de agente caro** (WebSearch/WebFetch — pesquisador deep research; ou geração de muitos artefatos — designer): a skill valida o output anterior; se vazio/inválido → erro ao usuário, **não aciona o próximo**. Agente barato (revisores, briefing) não precisa de gate.
- **Retry:** máx 1 retry automático por etapa. 2º fracasso → pausa e mostra parecer/erro ao usuário. Pausas humanas pré-existentes (revisão de preview, revisão de copy) permanecem.

---

## 4. Decisão sobre `templates/formatos/README.md` — deletar

Comparação linha a linha: o README é ~90% duplicação de `brand/referencias-visuais.md` (que o designer já auto-carrega) + ~10% duplicação do próprio contrato do designer.

| Item do README | Já está em | Veredito |
|---|---|---|
| Tipografia Anton/Montserrat | `referencias-visuais` §Tipografia | duplicado |
| Margem carrossel 80px | `referencias-visuais` §Margens | duplicado |
| Stories safe area 250px | `referencias-visuais` §Margens | duplicado |
| Paleta preto/branco/cinza | `referencias-visuais` §Paleta | duplicado |
| Dimensões carrossel/stories | `referencias-visuais` §Carrossel/Stories | duplicado |
| Sem JS / sem deps externas | designer contract (Princípios) | duplicado |
| 1 HTML standalone por slide | designer contract (Entrego) | duplicado |
| Preview wrapper verbatim / `section[data-slide]` | designer contract + critério skill→curador | duplicado |
| **Drop zones (`data-bg-drop`, host de overlay transparente, `background-size:cover`)** | **só no README** | **único conteúdo exclusivo** |

**Ação:**
- `templates/formatos/README.md` → **deletado**.
- Mecânica de drop zones → absorvida no **contrato do designer** (Princípios técnicos / Anti-padrões).
- `brand/referencias-visuais.md` → continua fonte única de tokens; nada a adicionar.
- Skills removem todas as injeções do README.

---

## 5. Deltas por agente (15)

Delta dominante uniforme: renomear `Contrato de entrada/saída` → **Recebo/Entrego**; dar **schema rígido** ao Entrego; adicionar **Orçamento de output**; consolidar erros em **Input incompleto**.

| Agente | Tipo de Entrego | Delta específico |
|---|---|---|
| designer | manifesto | **absorve drop zones**; remove README de "sob demanda" |
| copywriter | manifesto (`copy.md`) | schema + orçamento |
| briefing-writer | markdown estruturado | já quase pronto; orçamento + formalizar campos |
| pesquisador-mercado | **2 modos**: Fase B inline / Fase A+P7 manifesto | schema por modo + orçamento |
| revisor-conteudo | inline `<parecer>` | schema tags + orçamento |
| revisor-brand | inline `<parecer>` binário | schema tags + orçamento |
| curador-export | inline `<status>` | schema tags + orçamento |
| curador-web | inline `<status>` | schema tags + orçamento |
| treinador | inline (formato canônico já existe) | envelopar + orçamento |
| archivist-ramon | manifesto | schema + orçamento |
| analista-performance | manifesto | schema + orçamento |
| arquiteto-web | manifesto | schema + orçamento |
| designer-web | manifesto | schema + orçamento |
| dev-frontend | manifesto | schema + orçamento |
| integrador-apis | manifesto/status | schema + orçamento |

---

## 6. Deltas por skill (7)

| Skill | Delta |
|---|---|
| **novo-post** | + tabela de fluxo; remove injeção README (3×), `pilares-conteudo.md` (L78), critério `referencias-visuais.md` (L434/599); retry 3/2 → 1; limpa envelopes |
| **novo-estilo** | + tabela; remove injeção `referencias-visuais.md` (L76) + README (L77) |
| **planejar-pauta-semanal** | + tabela; remove injeção `pilares-conteudo.md` (L58); retry 1 |
| **lote-posts** | + tabela; herda padrão novo-post; limpa envelopes |
| **brand-discovery** | + tabela; envelope cirúrgico |
| **atualizar-ramon** | + tabela; envelope cirúrgico |
| **novo-site** | + tabela; limpa linhas de contexto documental/redundante |

---

## 7. CLAUDE.md

Reescrito aplicando os princípios como **doutrina do sistema**, não só descrição:

- Seção "Regras operacionais" ganha:
  - **Separação skill = fluxo / contrato = comportamento.**
  - **Regra de não-redundância** — skill não repassa contexto auto-carregado pelo agente.
  - **Convenções de schema** (3 tipos) e **orçamento de output**.
  - **Early-exit + máx 1 retry.**
- Aponta esta spec como referência canônica do padrão.
- Mantém a descrição dos 15 agentes / 7 skills, alinhada à nova nomenclatura (Recebo/Entrego).

---

## 8. Ordem de migração (vira o plano de implementação)

1. **Contratos de agente primeiro** — fundação; as skills referenciam seus schemas.
2. **Skills depois** — apontam pros schemas já definidos + ganham tabela de fluxo.
3. **CLAUDE.md por último** — reflete o estado final.
4. **Checagem de consistência:**
   - Nenhuma skill injeta contexto auto-carregado.
   - Todo Entrego tem schema rígido declarado.
   - Toda skill abre com tabela de fluxo.
   - `templates/formatos/README.md` não existe mais e não é referenciado em lugar nenhum.

---

## Fora de escopo

- Construir orquestração externa ao Claude Code para impor `max_tokens` real (decisão: disciplina via contrato basta).
- Reescrever templates de estilo (`estilo.md`, `slide.html`) — só o contrato do designer e as skills mudam.
- Mudar o fluxo funcional de qualquer skill — o redesenho é estrutural (forma do envelope, schema, retry), não altera o que cada skill produz.
