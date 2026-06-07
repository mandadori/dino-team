# Arquitetura 360 + Cérebro de Marca — Plano de Implementação (Onda 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) ou superpowers:executing-plans para implementar tarefa-a-tarefa. Os passos usam checkbox (`- [ ]`).

**Goal:** Fechar o **loop de aprendizado** do sistema: (A) produzir um post passa a **escrever de volta** no cérebro o que aquilo foi (livro-razão de mensagens, complementando o write-back de ângulos que já existe), e (B) a **pesquisa deixa de morar dentro do `/novo-post`** — vira skill própria reusável (`/pesquisar-mercado` + `/pesquisar-tema`), invocável sozinha ou disparada pela produção quando o cérebro está stale.

**Architecture:** Continuação da arquitetura blackboard ("a memória é a integração"). A Onda 1 criou o substrato; a Onda 2 deu a direção (quem decide a narrativa). A Onda 3 fecha o ciclo: **toda peça registra na memória o que serviu** (write-back) e **a captura de matéria-prima vira função autônoma** (pesquisa standalone). Sem a Onda 3, o cérebro nunca aprende com o que foi produzido — o livro-razão fica vazio e "essa mensagem já foi dita 40 vezes?" continua sendo intuição, não dado. Depende das Ondas 1-2 (slices `narrativas/`, `mercado/`, `publico/` + agente `estrategista-narrativa` + modo `scouting de mercado` do `pesquisador-mercado`).

**Tech Stack:** Markdown + frontmatter YAML (cérebro, contratos de agente/skill). Um script Node determinístico novo (`scripts/memory/append_livro_razao.js`) — o corpo da escrita no livro-razão. "Testes" = verificações determinísticas: `grep`, `ls`, `node` rodando o script de append num arquivo temporário, e dry-run de leitura das skills.

**Spec de origem:** `docs/specs/2026-06-06-arquitetura-360-cerebro-de-marca-design.md` (Onda 3 em §7; write-back §4.2; pesquisa standalone §3.2/§4.1; skills afetadas §5.3).

---

## ⚠ Onde executar este plano

- O **doc** (spec + planos) vive no worktree `worktree-arquitetura-360-cerebro` (criado a partir de `origin/main` por exigência de isolamento da sessão de background).
- **A implementação NÃO deve rodar neste worktree.** As Ondas 1-2 estão commitadas aqui mas **ainda não foram mergeadas** em `dino-studio-editor` (15 commits à frente, FF limpo). Antes de executar a Onda 3: **merge fast-forward das Ondas 1-2 em `dino-studio-editor`** (+ revisão humana do conteúdo de memória gerado por IA na O1-O2 — dores, narrativa-de-mercado, arco `progresso-invisivel`), depois execute a Onda 3 em cima de `dino-studio-editor` (idealmente worktree novo branchado dele). Os caminhos abaixo refletem o estado pós-Ondas-1-2.

## Refinamentos sobre o spec (descobertos ao mapear o código)

1. **Write-back de ângulos JÁ EXISTE.** O `/novo-post` já tem o Passo 15.5 ("Registrar ângulo queimado" via `analista-performance`). A Onda 3 **não recria** isso — só **adiciona** o write-back de mensagem (livro-razão). O write-back fica completo = ângulos (existente) + livro-razão (novo).
2. **Quem escreve o livro-razão: script determinístico, não o agente.** O spec §4.2 dizia "a função de direção escreve o livro-razão", mas o contrato do `estrategista-narrativa` (commitado na O2) já cravou a decisão mais específica: *"`livro-razao.md` — **leio** (append feito pelo write-back na Onda 3; não escrevo aqui)"*. O owner **lê** (detecta saturação); o append é **mecânico** (uma linha de tabela). Pela regra de corpo (§1.5: "ação determinística → script"), o corpo é um **script** `scripts/memory/append_livro_razao.js`. Bônus: o mesmo script é reusado por todo canal na Onda 4 (`/novo-email`, `/novo-artigo` também dão write-back) — não é overhead de uso único.
3. **`/novo-post` não captura a narrativa servida hoje.** O briefing inline (Passo 6) fixa ângulo/pilar/objetivo/recorte/slug — mas **não** qual arco de narrativa o post serve. O `/planejar-pauta-semanal` (O2) já captura `narrativa:` por briefing; o `/novo-post` precisa do mesmo para o write-back ter o que registrar. Quando o post vem de briefing pré-pronto da pauta, o campo `narrativa:` já existe — basta extraí-lo (Passo 1).
4. **A pesquisa Fase A já é modo nomeado do agente.** `pesquisador-mercado` já tem o modo `scouting de mercado` (Fase A). Falta só a **skill wrapper** que o torna standalone/agendável. A Fase B (Passo 3, seleção de candidatos) **continua inline** no `/novo-post` — é decisória e acoplada à produção (ranqueia para aquele post). A pesquisa de tema (Passo 9, P9/deep research) vira `/pesquisar-tema`.

## Mapa de arquivos (blast radius)

**Criam-se:**
- `scripts/memory/append_livro_razao.js` (corpo determinístico do write-back de mensagem)
- `.claude/skills/pesquisar-mercado/SKILL.md` (Fase A standalone)
- `.claude/skills/pesquisar-tema/SKILL.md` (deep research de tema standalone)

**Modificam-se:**
- `.claude/skills/novo-post/SKILL.md` (captura narrativa no Passo 6; dispara `/pesquisar-mercado` no Passo 2a; dispara `/pesquisar-tema` no Passo 9; novo Passo 15.6 write-back livro-razão; tabela `## Fluxo` + critério de conclusão)
- `.claude/skills/lote-posts/SKILL.md` (herda o write-back de livro-razão por post — confirmar que delega ao `/novo-post` ou replica o passo)
- `memory/narrativas/_formato.md` (nota: append do livro-razão é feito pelo script, não pelo owner)
- `CLAUDE.md` (roster de skills: +`/pesquisar-mercado`, +`/pesquisar-tema`; nota write-back no `/novo-post`)

**Lê-se (não muda):** `.claude/agents/pesquisador-mercado.md` (modo Fase A já existe), `.claude/agents/estrategista-narrativa.md` (já declara que lê o livro-razão), `.claude/skills/planejar-pauta-semanal/SKILL.md` (modelo de captura de `narrativa:`).

---

# ONDA 3 — Write-back + pesquisa standalone

**Resultado testável ao fim:** produzir um post atualiza o cérebro automaticamente (ângulo em `angulos-queimados.md` — já existia; **mensagem em `livro-razao.md` — novo**); `/pesquisar-mercado` e `/pesquisar-tema` existem e rodam **fora** do `/novo-post`; o `/novo-post` **dispara** a pesquisa (não a inlinexa) e seu briefing registra qual narrativa serve.

---

## PARTE A — Write-back de mensagem (livro-razão)

### Task 3.1: Script `append_livro_razao.js` (corpo determinístico do write-back)

Resolve o refinamento #2: o append no livro-razão é mecânico → script. Reusável por todo canal na Onda 4.

**Files:**
- Create: `scripts/memory/append_livro_razao.js`

- [ ] **Step 1: Escrever o script** — append-only de uma linha à tabela de `memory/narrativas/livro-razao.md`. Contrato:

  - Args: `--data <YYYY-MM-DD>` `--mensagem "<ângulo/mensagem>"` `--narrativa <slug|neutro>` `--canal <instagram|email|blog|comunidade>` `--peca <slug>`.
  - Comportamento: localiza a linha-cabeçalho da tabela (`| data | mensagem/ângulo | narrativa | canal | peça |`) e o separador, e **anexa** uma nova linha ao fim da tabela. Não reescreve linhas existentes (append-only). Escapa `|` no texto da mensagem. Atualiza `ultima_atualizacao` no frontmatter.
  - Validação: se o arquivo ou a tabela-cabeçalho não existir → erro `LIVRO_RAZAO_AUSENTE` (exit 1). Se faltar arg obrigatório → erro com uso.
  - Saída: imprime a linha anexada (1 linha), exit 0.

- [ ] **Step 2: Testar o script num arquivo temporário** (não sujar o livro-razão real)

```bash
cp memory/narrativas/livro-razao.md "$TMPDIR/lr-test.md"
LIVRO_RAZAO_PATH="$TMPDIR/lr-test.md" node scripts/memory/append_livro_razao.js \
  --data 2026-06-06 --mensagem "Você não está travado, está medindo errado" \
  --narrativa progresso-invisivel --canal instagram --peca teste-slug
grep -q "progresso-invisivel" "$TMPDIR/lr-test.md" && grep -q "teste-slug" "$TMPDIR/lr-test.md" && echo OK
# o script aceita LIVRO_RAZAO_PATH como override; default = memory/narrativas/livro-razao.md
```
Expected: `OK` e a linha aparece **abaixo** do separador, sem alterar linhas anteriores.

- [ ] **Step 3: Commit**
```bash
git add scripts/memory/append_livro_razao.js
git commit -m "feat(memory): script append_livro_razao (corpo do write-back de mensagem)"
```

### Task 3.2: `/novo-post` captura a narrativa servida (Passo 6 + briefing pré-pronto)

**Files:**
- Modify: `.claude/skills/novo-post/SKILL.md`

- [ ] **Step 1: Passo 1 (parse) — extrair `narrativa:` do briefing pré-pronto.** Na lista de campos extraídos de `briefing_path`, adicionar `Narrativa` (o `/planejar-pauta-semanal` já grava `narrativa: <slug|neutro>` em cada briefing). Quando presente, `narrativa_servida = <slug|neutro>`.

- [ ] **Step 2: Passo 6 (briefing inline) — decidir a narrativa servida.** Adicionar `memory/narrativas/ativas.md` à lista de leituras do Passo 6 e um campo novo aos campos fixados:
  - **Narrativa servida** — slug do arco ativo que este ângulo avança; `neutro` se nenhum. Espelha o critério do `/planejar-pauta-semanal` Passo 4. Guardar como `narrativa_servida` na memória da skill (usado no Passo 15.6).
  - Se `memory/narrativas/ativas.md` não tiver arco ativo → `narrativa_servida = neutro` + aviso de uma linha (mesma postura da pauta).

- [ ] **Step 3: Verificar e commitar**
```bash
grep -q "Narrativa servida" .claude/skills/novo-post/SKILL.md && grep -q "memory/narrativas/ativas.md" .claude/skills/novo-post/SKILL.md && echo OK
git add .claude/skills/novo-post/SKILL.md
git commit -m "feat(skills): novo-post captura narrativa servida no briefing (pre-req do write-back)"
```

### Task 3.3: `/novo-post` ganha o passo de write-back de mensagem (Passo 15.6)

**Files:**
- Modify: `.claude/skills/novo-post/SKILL.md`

- [ ] **Step 1: Adicionar Passo 15.6 "Registrar mensagem no livro-razão"** logo após o 15.5 (ângulo). Mesma condição de gatilho do 15.5: **só quando APROVADO no gate (Passo 13) e entregue (Passo 14)**; se REPROVADO sem recuperação ou descartado, não registra. Conteúdo:

````markdown
### 15.6. Registrar mensagem no livro-razão

Após APROVADO (Passo 13) e entregue (Passo 14), registre a mensagem deste post no livro-razão de narrativas — assim o cérebro sabe o que já foi dito e a direção detecta saturação. Determinístico (script; o `estrategista-narrativa` é o leitor da saturação, não escreve aqui):

```bash
node scripts/memory/append_livro_razao.js \
  --data "$(date +%F)" \
  --mensagem "<ângulo central do Passo 6>" \
  --narrativa "<narrativa_servida do Passo 6 — slug ou neutro>" \
  --canal instagram \
  --peca "<slug do Passo 6>"
```

Reporte a linha anexada inline. Se o script falhar (`LIVRO_RAZAO_AUSENTE`), avise o usuário e siga — o post já está entregue; o write-back não bloqueia entrega.
````

- [ ] **Step 2: Atualizar a tabela `## Fluxo`** — adicionar a linha do Passo 15.6 (`⚙ write-back livro-razão | ângulo+narrativa+slug ← 6 | 14 | linha no livro-razão`). Adicionar `narrativa_servida` como saída do Passo 6 onde os campos do briefing são listados.

- [ ] **Step 3: Atualizar `## Critério de conclusão`** — adicionar: "Quando APROVADO: o ângulo foi registrado em `angulos-queimados.md` (Passo 15.5) **e** a mensagem em `livro-razao.md` (Passo 15.6)."

- [ ] **Step 4: Verificar e commitar**
```bash
grep -q "append_livro_razao" .claude/skills/novo-post/SKILL.md && echo OK
git add .claude/skills/novo-post/SKILL.md
git commit -m "feat(skills): novo-post escreve no livro-razao ao finalizar (write-back de mensagem)"
```

### Task 3.4: Propagar o write-back ao `/lote-posts` + nota no `_formato`

**Files:**
- Modify: `.claude/skills/lote-posts/SKILL.md`
- Modify: `memory/narrativas/_formato.md`

- [ ] **Step 1: Conferir como `/lote-posts` produz cada post.** `grep -n "novo-post\|Passo 15\|write-back\|angulo" .claude/skills/lote-posts/SKILL.md`. Se delega ao pipeline do `/novo-post` por post → o write-back é herdado, só **documentar** que cada post do lote dá write-back. Se replica o pipeline inline → adicionar o mesmo Passo 15.6 ao loop por post.

- [ ] **Step 2: Nota em `memory/narrativas/_formato.md`** — na seção `livro-razao.md`, acrescentar: "Append feito pelo script `scripts/memory/append_livro_razao.js`, disparado no write-back das skills de produção (Onda 3). O owner `estrategista-narrativa` **lê** para detectar saturação; não escreve aqui."

- [ ] **Step 3: Verificar e commitar**
```bash
grep -q "append_livro_razao" memory/narrativas/_formato.md && echo OK
git add -A
git commit -m "docs(memory): documenta append do livro-razao via script; lote-posts herda write-back"
```

---

## PARTE B — Pesquisa standalone

### Task 3.5: Criar a skill `/pesquisar-mercado` (Fase A standalone)

Extrai a inteligência de mercado durável (hoje só disparável de dentro do `/novo-post` Passo 2a) para skill própria. Modelo: `.claude/skills/planejar-pauta-semanal/SKILL.md` (frontmatter + `## Fluxo` + pipeline + agendável).

**Files:**
- Create: `.claude/skills/pesquisar-mercado/SKILL.md`
- Read (padrão): `.claude/skills/planejar-pauta-semanal/SKILL.md`, `.claude/agents/pesquisador-mercado.md` (modo `scouting de mercado` Fase A)

- [ ] **Step 1: Escrever a skill** com:
  - **Frontmatter:** `name: pesquisar-mercado`; `description:` "Captura de inteligência de mercado durável (Fase A): tendências quentes do mês, padrão de comunicação de concorrentes, fala do público. Escreve em `memory/mercado/` e `memory/publico/`. Disparável manual ou por cron (Onda 5); também acionada pelo `/novo-post` quando a inteligência está stale. Não produz conteúdo."
  - **`## Fluxo`** (Passo | Agente/Ação | Recebe | Depende | Entrega):
    1. ⚙ reunir parâmetros — mês de referência (`date +%Y-%m`), profundidade.
    2. `pesquisador-mercado` (Tarefa: `scouting de mercado` Fase A) — recebe mês de referência; grava `memory/mercado/tendencias/<YYYY-MM>.md` + `concorrentes/<slug>.md` + enriquece `memory/publico/`.
    3. ⚙ relatório inline — achados-chave, arquivos atualizados, novos concorrentes detectados.
  - **Pipeline:** detalhar o prompt do agente (espelhar o bloco do `/novo-post` Passo 2a, que já está correto), o destino dos arquivos, e o relatório final. **Sem produção de conteúdo.** Sem write-back de livro-razão (não é peça).
  - **Agendável:** nota de que entra em `orquestracao/rotas.yaml` na Onda 5 (cron); por ora, disparo manual.

- [ ] **Step 2: Verificar e commitar**
```bash
grep -q "name: pesquisar-mercado" .claude/skills/pesquisar-mercado/SKILL.md && echo OK
git add .claude/skills/pesquisar-mercado
git commit -m "feat(skills): cria /pesquisar-mercado (Fase A standalone, extraida do novo-post)"
```

### Task 3.6: Criar a skill `/pesquisar-tema` (deep research standalone)

Extrai a pesquisa profunda (hoje `/novo-post` Passo 9) para skill própria — permite pré-pesquisar um tema e reusar o resultado em vários posts.

**Files:**
- Create: `.claude/skills/pesquisar-tema/SKILL.md`
- Read (padrão): `.claude/agents/pesquisador-mercado.md`, `templates/pesquisa.md`

- [ ] **Step 1: Escrever a skill** com:
  - **Frontmatter:** `name: pesquisar-tema`; `description:` "Levanta matéria-prima profunda (deep research) para um ângulo/tema específico — dados, contradições, mitos, referências com fonte. Grava em `memory/pesquisa/<data>-<slug>.md`, reusável por `/novo-post`. Disparável manual ou pela produção quando o ângulo é informacional."
  - **Sintaxe:** `/pesquisar-tema <tema/ângulo> [--pilar X] [--recorte ...]`.
  - **`## Fluxo`:**
    1. ⚙ parse — tema/ângulo, pilar, recorte, slug.
    2. `pesquisador-mercado` (pesquisa profunda, deep research) — espelhar o prompt do `/novo-post` Passo 9; grava em `memory/pesquisa/<data>-<slug>.md` via `templates/pesquisa.md`.
    3. ⚙ entregar — caminho do arquivo + achado-chave inline.
  - **Pipeline:** reusar o bloco do Passo 9 (já correto), partindo de `memory/mercado/` acumulado para não redescobrir tendências.

- [ ] **Step 2: Verificar e commitar**
```bash
grep -q "name: pesquisar-tema" .claude/skills/pesquisar-tema/SKILL.md && echo OK
git add .claude/skills/pesquisar-tema
git commit -m "feat(skills): cria /pesquisar-tema (deep research standalone)"
```

### Task 3.7: `/novo-post` dispara as skills de pesquisa (deixa de possuí-las)

**Files:**
- Modify: `.claude/skills/novo-post/SKILL.md`

- [ ] **Step 1: Passo 2a — disparar `/pesquisar-mercado` quando STALE** em vez de inlinear o prompt do agente. O check de frescor (`find -mtime +14`) **fica** na skill (é a decisão de quando). Quando STALE: "Atualizando inteligência de mercado…" → invoca `/pesquisar-mercado`. Substituir o bloco de prompt inline por uma referência à skill (o prompt do agente passa a viver só em `/pesquisar-mercado`, fonte única).

- [ ] **Step 2: Passo 9 — disparar `/pesquisar-tema`** quando o ângulo for informacional (mesma condição atual). Substituir o prompt inline por invocação de `/pesquisar-tema` com o tema/pilar/recorte do briefing; o arquivo gravado em `memory/pesquisa/` é o mesmo que o Passo 10 (copy) já lê. **Fase B (Passo 3) permanece inline** — é decisória e acoplada à produção (não extrair).

- [ ] **Step 3: Atualizar o Princípio central** do `/novo-post` — a linha que descreve a orquestração ("Orquestra pesquisa, briefing inline...") passa a dizer que **dispara** as skills de pesquisa (`/pesquisar-mercado`, `/pesquisar-tema`) e mantém Fase B inline; reflete que o `/novo-post` deixou de possuir a pesquisa de mercado/tema.

- [ ] **Step 4: Verificar e commitar**
```bash
grep -q "pesquisar-mercado" .claude/skills/novo-post/SKILL.md && grep -q "pesquisar-tema" .claude/skills/novo-post/SKILL.md && echo OK
git add .claude/skills/novo-post/SKILL.md
git commit -m "refactor(skills): novo-post dispara /pesquisar-* (deixa de possuir pesquisa; Fase B fica inline)"
```

### Task 3.8: Atualizar o roster de skills no `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Adicionar ao roster de skills** (seção "Skills — fluxos orquestrados") as entradas `/pesquisar-mercado` e `/pesquisar-tema`, e `/ciclo-de-direcao` (da O2, se ainda não listada). Atualizar a descrição do `/novo-post` para mencionar o write-back ao cérebro e o disparo das skills de pesquisa.

- [ ] **Step 2: Verificar e commitar**
```bash
grep -q "pesquisar-mercado" CLAUDE.md && grep -q "pesquisar-tema" CLAUDE.md && echo OK
git add CLAUDE.md
git commit -m "docs(claude): roster ganha /pesquisar-mercado, /pesquisar-tema; novo-post com write-back"
```

### Task 3.9: Verificação final da Onda 3

- [ ] **Step 1: Artefatos existem**
```bash
test -f scripts/memory/append_livro_razao.js \
  && test -f .claude/skills/pesquisar-mercado/SKILL.md \
  && test -f .claude/skills/pesquisar-tema/SKILL.md \
  && grep -q "append_livro_razao" .claude/skills/novo-post/SKILL.md \
  && grep -q "Narrativa servida" .claude/skills/novo-post/SKILL.md \
  && echo OK
```
Expected: `OK`.

- [ ] **Step 2: Write-back funciona de ponta a ponta (script)** — rodar a Task 3.1 Step 2 contra cópia temporária; confirmar append append-only.

- [ ] **Step 3: Pesquisa é reusável fora do post** — confirmar que `/pesquisar-mercado` e `/pesquisar-tema` rodam sem `/novo-post` (dry-run de leitura: o pipeline só chama `pesquisador-mercado` e grava no slice; não depende de nenhum passo do post).

- [ ] **Step 4: Nenhum prompt de pesquisa duplicado** — o prompt da Fase A deve existir **só** em `/pesquisar-mercado` (não mais inline no `/novo-post` Passo 2a); o prompt P9 só em `/pesquisar-tema`.
```bash
grep -c "scouting de mercado" .claude/skills/novo-post/SKILL.md   # esperado: 0 ou só referência à skill, não o prompt completo
```

---

## Self-review (cobertura vs spec)

- §4.2 (write-back no fim da produção: livro-razão + ângulos) → ângulos já existiam; livro-razão via Tasks 3.1–3.4 ✓
- §3.2 (pesquisa de mercado [EXISTE] standalone + pesquisa de tema [REFRAME] extraída) → Tasks 3.5, 3.6, 3.7 ✓
- §4.1 (captura disparável sozinha OU de dentro da produção quando stale) → Tasks 3.5 (standalone) + 3.7 (disparo quando stale) ✓
- §5.3 (`/novo-post` deixa de possuir pesquisa + ganha write-back; novas `/pesquisar-*`) → Tasks 3.7, 3.3, 3.5, 3.6 ✓
- §7 Onda 3 critério ("produzir um post atualiza o cérebro; pesquisa reusável fora do post") → Task 3.9 ✓
- §11 critérios de aceitação destravados: "Produzir um post atualiza o cérebro" + "Pesquisa é skill própria, reusável fora do `/novo-post`" ✓

## Decisões resolvidas neste plano (eram ambíguas no spec)

- **Quem escreve o livro-razão** → script determinístico `scripts/memory/append_livro_razao.js` (regra de corpo §1.5), não o agente `estrategista-narrativa` (que **lê** para saturação, conforme já cravado no contrato O2). Reusável por todos os canais na Onda 4.
- **Fase B (seleção de candidatos) NÃO é extraída** → permanece inline no `/novo-post` (decisória + acoplada à produção). Só Fase A (`/pesquisar-mercado`) e P9 (`/pesquisar-tema`) viram skill.
- **Captura da narrativa servida no `/novo-post`** → novo campo no briefing inline (Passo 6), espelhando o `/planejar-pauta-semanal`; do briefing pré-pronto, extraído no Passo 1.

## Fora de escopo (próximas ondas)

- Ligar cron de `/pesquisar-mercado` em `orquestracao/rotas.yaml` → **Onda 5** (governança + automação).
- Write-back multicanal (`/novo-email`, `/novo-artigo` chamando o mesmo script) → **Onda 4** (o script já nasce reusável aqui).
- Keeper de memória (auditar saturação/lixo lendo o livro-razão) → declarado no schema; build depois.
