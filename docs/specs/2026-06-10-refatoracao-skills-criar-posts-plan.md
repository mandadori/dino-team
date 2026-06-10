# Refatoração das skills "criar posts" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Encurtar `/novo-post`, `/lote-posts`, `/novo-estilo` e `/editar-post` removendo redundância e contexto repetido — sem remover nenhuma função — e codificar o padrão no `CLAUDE.md`.

**Architecture:** `/novo-post` vira o **lar canônico** dos blocos longos compartilhados (Editor, Aprendizado de estilo, Gate, Write-back, Publicação, Pesquisa); as outras 3 skills os referenciam **por nome de seção** (`§Design`, `§Aprendizado de estilo`, etc.), nunca por número. Cada passo abre com uma linha `Lê:` única. Condicionais viram sub-bullets do passo-pai; pausas (⏸) fazem parte do passo. Numeração de `## Fluxo` linear `1..N`. Toda menção a "Live Preview" some — a skill sobe o Dino Editor e envia `http://localhost:4321` (stories → preview por PNG).

**Tech Stack:** Markdown (arquivos de skill `.claude/skills/*/SKILL.md` + `CLAUDE.md`). Verificação por `grep`/`wc` (sem suíte de testes — os greps encodam os 10 critérios de sucesso do spec).

**Spec:** `docs/specs/2026-06-10-refatoracao-skills-criar-posts-design.md`

---

## Estrutura de arquivos

- Modificar: `CLAUDE.md` — adiciona subseção "Padrão de escrita de skills" em "Regras operacionais".
- Modificar: `.claude/skills/novo-post/SKILL.md` — lar canônico; maior reescrita.
- Modificar: `.claude/skills/lote-posts/SKILL.md` — referencia novo-post por nome.
- Modificar: `.claude/skills/novo-estilo/SKILL.md` — referencia novo-post; elimina `6.5`.
- Modificar: `.claude/skills/editar-post/SKILL.md` — conserta drift (auto-boot + link).
- Modificar: `templates/estilo.md` — remove a menção a "Live Preview" (linha ~17), por consistência com a regra 9.

**Ordem obrigatória:** Task 1 (CLAUDE.md, define o vocabulário) → Task 2 (novo-post, cria as âncoras `§`) → Tasks 3‑5 (referenciam as âncoras) → Task 6 (sweep final).

**Anti-regressão (vale para todas as tasks de skill):** a reescrita preserva **todas** as funções listadas no `## Critério de conclusão` atual de cada skill, todas as pausas humanas (⏸) e todos os gates. É corte de texto, não de capacidade. Cada task tem um passo de diff function-by-function contra o critério de conclusão original (capturado na Task 1, Step 1).

---

### Task 1: CLAUDE.md — subseção "Padrão de escrita de skills" + baseline de funções

**Files:**
- Modify: `CLAUDE.md` (seção "## Regras operacionais")
- Create: `/tmp/baseline-funcoes.md` (snapshot dos critérios de conclusão atuais — referência anti-regressão, não commitado)

- [ ] **Step 1: Capturar baseline de funções (o "teste de regressão")**

Antes de tocar em qualquer skill, snapshot dos critérios de conclusão atuais — é contra isto que o sweep final (Task 6) confere que nenhuma função sumiu.

```bash
cd "/Users/unstudio/Documents/Projetos/dino team"
{
  for s in novo-post lote-posts novo-estilo editar-post; do
    echo "===== $s ====="
    awk '/^## (Critério de conclusão|Critérios de conclusão)/{f=1} f' ".claude/skills/$s/SKILL.md"
    echo
  done
} > /tmp/baseline-funcoes.md
wc -l /tmp/baseline-funcoes.md
```

Expected: arquivo criado, > 30 linhas (os 4 blocos de critério).

- [ ] **Step 2: Verificar que o padrão ainda não existe (falha esperada)**

Run: `grep -c "Padrão de escrita de skills" "CLAUDE.md"`
Expected: `0` (ainda não foi adicionado).

- [ ] **Step 3: Adicionar a subseção em "Regras operacionais"**

Em `CLAUDE.md`, localize a seção `## Regras operacionais` e a linha final dela (`Padrão de contratos e skills detalhado em [docs/specs/2026-05-26-...]`). **Imediatamente antes** dessa linha de fecho, insira:

```markdown
### Padrão de escrita de skills

Toda skill criada ou editada segue estas 9 regras (anti-redundância, anti-contexto-repetido):

1. **`## Fluxo` obrigatório, numeração linear `1..N`.** Zero passo fracionado (nada de `2a`, `3.⏸`, `11.5`).
2. **Cada passo abre com `Lê:`** — uma linha listando o contexto que aquele passo lê (`brand/*`, `memory/*`, `estilo.md`…), **uma vez**. Sem bloco de leitura no topo e sem repetição inline.
3. **Condicionais = sub-bullets do passo-pai**, não passos próprios. A espinha numerada é só o happy path.
4. **Pausa (⏸) é parte do passo** que a contém — nunca um sub-passo.
5. **Modo (`--auto` etc.) num único bloco.** Proibido lembrete inline repetido por passo.
6. **Referência por nome de seção (`§Design`), nunca por número** — números mudam sob renumeração.
7. **Lar canônico para bloco longo compartilhado:** a skill mais completa detém o texto integral; as outras apontam por nome (não copiam).
8. **Fonte única para regra global:** não restated spec de `brand/social-media.md`, drop-zones, "sem `preview.html`", "export valida sozinho" em cada passo — apontar onde mora.
9. **Edição = Dino Editor por link:** a skill sobe o editor e envia `http://localhost:4321`. Nunca mencionar "Live Preview". Stories (editor é carrossel-only) → preview via `export-png.js` (PNG).
```

- [ ] **Step 4: Verificar inserção e que não quebrou o ponteiro existente**

Run:
```bash
grep -c "Padrão de escrita de skills" "CLAUDE.md"
grep -c "Padrão de contratos e skills detalhado em" "CLAUDE.md"
```
Expected: ambos `1` (subseção nova + ponteiro original preservados).

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(claude): padrão de escrita de skills (9 regras anti-redundância)"
```

---

### Task 2: `/novo-post` — lar canônico, Fluxo linear, dedup

**Files:**
- Modify: `.claude/skills/novo-post/SKILL.md`

- [ ] **Step 1: Provar a doença (testes que falham hoje)**

Run:
```bash
cd "/Users/unstudio/Documents/Projetos/dino team"
F=".claude/skills/novo-post/SKILL.md"
echo "fracionados na tabela:"; grep -nE '^\| [0-9]+[a-z.]' "$F" | wc -l
echo "headings fracionados:";   grep -nE '^### [0-9]+\.[0-9]' "$F" | wc -l
echo "bloco de leitura duplicado:"; grep -c "Contexto de leitura por passo" "$F"
echo "Live Preview:"; grep -ic "live preview" "$F"
echo "linhas:"; wc -l < "$F"
```
Expected (estado atual): fracionados > 0, headings fracionados > 0, bloco duplicado = 1, Live Preview ≥ 1, linhas ~691. Todos devem zerar/cair ao fim da task.

- [ ] **Step 2: Reescrever o `## Fluxo` para a espinha linear (14 passos)**

Substitua a tabela `## Fluxo` inteira por esta (conditionais NÃO aparecem como linha — viram sub-bullets no corpo):

```markdown
## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ parse input | input bruto | — | formato/estilo/tema/briefing/auto |
| 2 | ⚙ frescor de mercado | — | 1 | dispara /pesquisar-mercado se stale |
| 3 | pesquisador (Fase B, condic.) + ⏸ | formato, contexto | 2 | tema escolhido |
| 4 | ⚙ estilo + plano (inline) + ⏸ | tema, estilos | 3 | estilo definido ou _rascunho/ |
| 5 | ⚙ briefing (inline ou pré-pronto) + criar pasta | contexto, tema, estilo | 4 | ângulo/pilar/objetivo/slug/verdade + pasta |
| 6 | ⚙ resolver inputs do estilo (condic.) | estilo.md | 5 | treino.md |
| 7 | /pesquisar-tema | briefing ← 5 | 6 | pesquisa gravada |
| 8 | ⚙ copy (inline) + ⏸ | pesquisa ← 7 | 7 | copy.md |
| 9 | ⚙ design (inline) + Editor + ⏸ | copy ← 8, estilo.md | 8 | slide-N.html |
| 10 | ⚙ export-png.js | slide-N.html ← 9 | 9 | PNGs |
| 11 | revisor-brand (gate) | copy + pasta ← 10 | 10 | APROVADO/REPROVADO |
| 12 | ⚙ entregar | tudo ← 11 | 11 | entrega |
| 13 | ⚙ write-back registro-angulos | ângulo+verdade+pilar ← 5 | 11 | linha no registro |
| 14 | ⚙ publicação (opcional, gated) | pasta ← 11 | 12 | publicado/pendente |
```

- [ ] **Step 3: Renumerar os corpos para `1..14` e dobrar condicionais em sub-bullets**

Reescreva os títulos `###` e o corpo seguindo o mapeamento (origem → destino). **Mantenha todo o conteúdo funcional**; só reorganize e remova redundância:

- `1` Parsear input ← atual Passo 1 (inclui `--auto`, `--briefing`).
- `2` Frescor da inteligência de mercado ← atual Passo 2 + 2a (funde o `2a` no corpo).
- `3` Tema — scouting ranqueado (⏸) ← atual Passo 3 + 3.⏸ (a pausa vira parte do passo).
- `4` Estilo + plano (⏸) ← atual Passo 4 + 4.⏸. **Sub-bullet condicional** "Criar estilo ad-hoc em `_rascunho/` (⏸)" ← absorve o atual Passo 5.
- `5` Briefing estratégico + criar pasta ← atual Passo 6 + 7 (fundidos).
- `6` Resolver inputs do estilo (condic.) ← atual Passo 8. **Sub-bullet** "Treino (treinador)" ← absorve o atual `8t`.
- `7` Pesquisa profunda ← atual Passo 9. **Âncora `#### Pesquisa`** (referenciada por /lote-posts).
- `8` Copy (⏸) ← atual Passo 10.
- `9` Design (⏸) ← atual Passo 11. **Sub-bullets:** "Fotos do banco (condic.)" ← atual `11m`; "Aprendizado de estilo (condic., ⏸)" ← atual `11.5`. **Âncoras `#### Subir o Dino Editor` e `#### Aprendizado de estilo`** (referenciadas por /novo-estilo e /editar-post).
- `10` Export PNG ← atual Passo 12.
- `11` Gate de marca (revisor-brand) ← atual Passo 13. **Âncora `#### Gate de marca`** (referenciada por /lote-posts). Mantém o scaffold de retry (`tentativas_N`, pausa após 1ª falha).
- `12` Entregar ← atual Passo 14. **Sub-bullets:** "Adaptar stories (condic., carrossel, ⏸)" ← atual `14.5`; "Captura de fonte na biblioteca (condic.)" ← atual `14.6`; "Salvar/descartar `_rascunho/` (condic.)" ← atual Passo 15.
- `13` Write-back no registro de ângulos ← atual `15.5`. **Âncora `#### Write-back`** (referenciada por /lote-posts).
- `14` Publicação (gated) ← atual Passo 16. **Sub-bullet** "Marcação de uso de imagens (condic.)". **Âncora `#### Publicação`** (referenciada por /lote-posts).
- Mantenha a seção final não-numerada `### Registrar execução (run-ledger)` como está (é ação de fecho, não passo de pipeline — não é fração).

- [ ] **Step 4: Inserir a linha `Lê:` em cada passo e remover as listas duplicadas**

Remova o bloco "**Contexto de leitura por passo:**" do topo (atuais linhas ~63‑66) e as listas de leitura inline repetidas. Em cada passo que lê contexto, coloque **uma** linha `Lê:` logo após o título:

- Passo 3 (scouting) — `Lê: ramon/contexto · performance/registro-angulos · mercado/tendencias/<mês>` (passados ao pesquisador).
- Passo 5 (briefing) — `Lê: brand-book (§Verdades) · pilares-conteudo · ramon/contexto · performance/registro-angulos · mercado/tendencias/<mês> · estilo.md (§Conceito + #### editorial)`.
- Passo 8 (copy) — `Lê: estilo.md §editorial · tom-de-voz · publico-alvo · pesquisa do post · biblioteca (índice → 1-2 fichas)`.
- Passo 9 (design) — `Lê: estilo.md §visual · slide.html · referencias-visuais · social-media · copy.md`.

- [ ] **Step 5: Consolidar `--auto` e remover lembretes inline**

Mantenha **um** bloco `## Modo autônomo` (atuais linhas ~70‑82). Remova de cada passo o lembrete repetido `**Em --auto: pular esta pausa (ver "Modo autônomo")**`. O bloco central já lista quais pausas o `--auto` pula — basta ele.

- [ ] **Step 6: Remover restated de regra global**

Tire as repetições de "não gerar `preview.html`", regras de drop-zone e "export valida sozinho" dos corpos dos passos. Onde necessário, deixe **um** ponteiro curto (ex.: "drop zones: ver `brand/social-media.md`"). Garanta zero "Live Preview" — a pausa do Editor (Passo 9) e qualquer preview de rascunho enviam o link `http://localhost:4321`; stories aponta export→PNG.

- [ ] **Step 7: Rodar os testes — devem passar agora**

Run:
```bash
cd "/Users/unstudio/Documents/Projetos/dino team"
F=".claude/skills/novo-post/SKILL.md"
grep -nE '^\| [0-9]+[a-z.]' "$F" | wc -l        # → 0
grep -nE '^### [0-9]+\.[0-9]' "$F" | wc -l       # → 0
grep -c "Contexto de leitura por passo" "$F"     # → 0
grep -ic "live preview" "$F"                     # → 0
grep -c "^Lê:" "$F"                              # → ≥ 4
wc -l < "$F"                                      # → ~360 (materialmente menor que 691)
```
Expected: conforme comentários. Se `wc -l` ainda perto de 691, há prosa redundante não cortada — revisar Steps 4‑6.

- [ ] **Step 8: Verificar âncoras canônicas presentes**

Run:
```bash
F=".claude/skills/novo-post/SKILL.md"
for a in "Subir o Dino Editor" "Aprendizado de estilo" "Gate de marca" "Write-back" "Publicação" "Pesquisa"; do
  printf '%s: ' "$a"; grep -c "#### $a" "$F"
done
```
Expected: cada âncora ≥ 1 (são referenciadas pelas outras skills).

- [ ] **Step 9: Commit**

```bash
git add .claude/skills/novo-post/SKILL.md
git commit -m "refactor(novo-post): Fluxo linear, Lê: por passo, lar canônico das âncoras"
```

---

### Task 3: `/lote-posts` — referenciar novo-post por nome

**Files:**
- Modify: `.claude/skills/lote-posts/SKILL.md`

- [ ] **Step 1: Provar a duplicação (falha esperada)**

Run:
```bash
cd "/Users/unstudio/Documents/Projetos/dino team"
F=".claude/skills/lote-posts/SKILL.md"
echo "fracionados:"; grep -nE '^\| [0-9]+\.[0-9]|^### [0-9]+\.[0-9]' "$F" | wc -l
echo "ref por nome a novo-post:"; grep -c '/novo-post §' "$F"
echo "ref por número a novo-post:"; grep -niE '/novo-post.*(passo|etapa) [0-9]' "$F" | wc -l
echo "linhas:"; wc -l < "$F"
```
Expected (atual): fracionado `8.5` presente (>0), ref por nome = 0, ref por número ≥ 1 (cita "Passo 16 do /novo-post"), linhas ~341.

- [ ] **Step 2: Renumerar Fluxo linear `1..10` (funde `8.5` no Passo 8)**

Substitua a tabela `## Fluxo` por:

```markdown
| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ parse input | input | — | N, estilos, tema |
| 2 | ⚙ distribuição de estilos | — | 1 | estilos por post |
| 3 | pesquisador (distribuição, condic.) | tema | 2 | distribuição sugerida |
| 4 | ⚙ subtemas + confirmar plano + ⏸ | plano ← 3 | 3 | plano confirmado |
| 5 | ⚙ briefing + copy inline (×posts) | plano ← 4 | 4 | copy por post |
| 6 | ⏸ revisão de copies em lote | copies ← 5 | 5 | ok/ajuste |
| 7 | ⚙ design inline + revisão (×posts, ⏸) | copy ← 5 | 6 | assets por post |
| 8 | ⚙ export + gate + write-back (×posts) | slides ← 7 | 7 | PNGs + validação + registro |
| 9 | ⚙ relatório do lote | — | 8 | relatório |
| 10 | ⚙ publicação (×posts, gated) | pasta ← 8 | 8 | publicado/pendente |
```

O atual `8.5` (write-back por post) vira sub-bullet do Passo 8.

- [ ] **Step 3: Substituir os blocos duplicados por referência de nome**

No corpo, troque a re-documentação por ponteiros ao lar canônico:

- **Pesquisa (Passo 5d):** mantém a invocação `/pesquisar-tema` (já é skill separada); sem mudança estrutural.
- **Gate (Passo 8):** substitua o prompt inline do `revisor-brand` por: `Aplique o gate como em /novo-post §Gate de marca (mesmo prompt, momento "criação de post"), por post.` Mantenha só o que é específico do lote (APROVADO grava briefing; REPROVADO marca pulado, refazer é do /novo-post).
- **Write-back (sub-bullet do Passo 8):** substitua o bloco de script por: `Por post aprovado, escreva a linha como em /novo-post §Write-back (script append_registro_angulos.js). Posts pulados/reprovados não registram.`
- **Publicação (Passo 10):** substitua "o mesmo gate de política do Passo 16 do /novo-post" por "como em /novo-post §Publicação"; mantém a regra "modo cron → nunca publica automaticamente".

- [ ] **Step 4: `Lê:` por passo + remover listas duplicadas**

Remova o bloco "Contexto de leitura por post" do topo se ficar redundante; coloque `Lê:` nos passos de briefing (5b), copy (5e) e design (7), espelhando as linhas do /novo-post.

- [ ] **Step 5: Rodar testes — devem passar**

Run:
```bash
F=".claude/skills/lote-posts/SKILL.md"
grep -nE '^\| [0-9]+\.[0-9]|^### [0-9]+\.[0-9]' "$F" | wc -l   # → 0
grep -c '/novo-post §' "$F"                                     # → ≥ 3
grep -niE '/novo-post.*(passo|etapa) [0-9]' "$F" | wc -l        # → 0
grep -ic "live preview" "$F"                                    # → 0
wc -l < "$F"                                                     # → ~190
```
Expected: conforme comentários.

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/lote-posts/SKILL.md
git commit -m "refactor(lote-posts): referencia /novo-post por nome, Fluxo linear 1..10"
```

---

### Task 4: `/novo-estilo` — referenciar Editor/Aprendizado, eliminar `6.5`

**Files:**
- Modify: `.claude/skills/novo-estilo/SKILL.md`

- [ ] **Step 1: Provar (falha esperada)**

Run:
```bash
cd "/Users/unstudio/Documents/Projetos/dino team"
F=".claude/skills/novo-estilo/SKILL.md"
grep -nE '^\| [0-9]+\.[0-9]|^### [0-9]+\.[0-9]' "$F" | wc -l   # → >0 (tem 6.5)
grep -niE '/novo-post.*passo [0-9]' "$F" | wc -l               # → ≥1 (cita "Passo 11.5 de /novo-post")
grep -ic "live preview" "$F"                                    # → ≥1 (linha 92)
wc -l < "$F"
```

- [ ] **Step 2: Fundir `6.5` no Passo 6 e renumerar `1..10`**

A "promoção de edições estruturais" (atual `6.5`) vira **sub-bullet** do Passo 6 (Revisar no Dino Editor). Tabela `## Fluxo` renumerada sem `6.5`:

```markdown
| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ parse + modo | input | — | modo, formato, slug |
| 2 | ⚙ tratar _rascunho/ | — | 1 | rascunho pronto |
| 3 | ⏸ usuário | contexto ← 2 | 2 | descrição/alterações |
| 4 | ⚙ preparar pasta | — | 3 | pasta de trabalho |
| 5 | ⚙ gerar/editar inline | descrição ← 3 | 4 | estilo.md + slide.html |
| 6 | ⚙ Editor + ⏸ | _rascunho ← 5 | 5 | confirmar/ajuste (+ promove edits) |
| 7 | revisor-brand (gate visual) | estilo.md ← 6 | 6 | APROVADO/REPROVADO |
| 8 | ⚙ slug (só criar) | — | 7 | slug |
| 9 | ⚙ salvar | — | 8 | estilo salvo |
| 10 | ⚙ confirmar | — | 9 | confirmação |
```

- [ ] **Step 3: Substituir boot do Editor + promoção por referência de nome**

No Passo 6:
- Substitua o bloco de boot do editor (atuais ~itens 1‑3) por: `Sobe o Dino Editor como em /novo-post §Subir o Dino Editor (auto-start + health-check + envia http://localhost:4321). Scaffold de preview via scripts/editor/scaffold-estilo.js antes de subir; editor é carrossel-only (stories → fallback export-png.js).` Mantenha o que é específico (scaffold-estilo.js, pasta `_rascunho/preview/`).
- Substitua o item de promoção (atual `6.5`/item 4) por sub-bullet: `Promover edições (modo editar): aplica os deltas estruturais como em /novo-post §Aprendizado de estilo — porém **direto**, sem a pausa de confirmação (aqui editar o estilo É o objetivo).`

- [ ] **Step 4: `Lê:` no Passo 5 + matar "Live Preview"**

Passo 5 — `Lê: templates/estilo.md · referencias-visuais · social-media`. Remova as menções a "Live Preview" (linha ~81 "preview = abrir slide.html via Live Preview ou Dino Editor" → "preview = Dino Editor; stories → export-png.js"; e qualquer outra).

- [ ] **Step 5: Rodar testes — devem passar**

Run:
```bash
F=".claude/skills/novo-estilo/SKILL.md"
grep -nE '^\| [0-9]+\.[0-9]|^### [0-9]+\.[0-9]' "$F" | wc -l   # → 0
grep -c '/novo-post §' "$F"                                     # → ≥ 2 (Editor + Aprendizado)
grep -niE '/novo-post.*passo [0-9]' "$F" | wc -l                # → 0
grep -ic "live preview" "$F"                                    # → 0
wc -l < "$F"                                                     # → ~120
```

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/novo-estilo/SKILL.md
git commit -m "refactor(novo-estilo): referencia §Editor/§Aprendizado, funde 6.5, mata Live Preview"
```

---

### Task 5: `/editar-post` — conserta drift + referência

**Files:**
- Modify: `.claude/skills/editar-post/SKILL.md`
- Modify: `templates/estilo.md`

- [ ] **Step 1: Provar o bug (falha esperada)**

Run:
```bash
cd "/Users/unstudio/Documents/Projetos/dino team"
F=".claude/skills/editar-post/SKILL.md"
grep -ic "show preview\|live preview" "$F"           # → ≥1 (manda usar VS Code Show Preview)
grep -c "Suba o backend" "$F"                          # → ≥1 (manda subir backend na mão)
grep -niE '/novo-post.*etapa [0-9]' "$F" | wc -l       # → ≥1 (cita "etapa 11")
grep -ic "live preview" "templates/estilo.md"          # → ≥1 (linha ~17)
```

- [ ] **Step 2: Reescrever o Passo 3 (auto-boot + link)**

Substitua o Passo 3 atual inteiro por:

```markdown
### 3. Subir o Dino Editor e enviar o link (⏸)

A skill **sobe o editor sozinha** — como em /novo-post §Subir o Dino Editor (auto-start + health-check). O usuário nunca roda o backend.

\`\`\`bash
lsof -ti tcp:4321 | xargs kill -9 2>/dev/null; \
npm run editor -- <pasta> --estilo <estilo_path> > /tmp/dino-editor.log 2>&1 &
\`\`\`

Aguarde ~3s, confirme saúde (`curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/` → `200`) e apresente:

\`\`\`
Post: <pasta>
Estilo: <estilo_path>
Slides: <lista de slide-N.html em design/>

O Dino Editor está no ar: abra http://localhost:4321 no navegador.
Edite no canvas, clique "Salvar". Quando pronto:
- "exportar" / "re-exportar" → re-exporto os PNGs (Passo 4)
- "pronto" → encerro sem re-exportar
\`\`\`

**Aguarde resposta.**
```

- [ ] **Step 3: Corrigir a referência por número no Passo 4**

No Passo 4, troque "use `/novo-post` → etapa 11 diretamente" por "use `/novo-post §Design` / curadoria diretamente". Mantenha o resto (re-export via `export-png.js`).

- [ ] **Step 4: Remover "Live Preview" de `templates/estilo.md`**

Em `templates/estilo.md` (linha ~17), troque "preview = abrir `slide.html` no Live Preview do VS Code ou no Dino Editor" por "preview = abrir `slide.html` no Dino Editor (carrossel); stories → `export-png.js`".

- [ ] **Step 5: Rodar testes — devem passar**

Run:
```bash
F=".claude/skills/editar-post/SKILL.md"
grep -ic "show preview\|live preview" "$F"       # → 0
grep -c "Suba o backend" "$F"                      # → 0
grep -niE '/novo-post.*etapa [0-9]' "$F" | wc -l   # → 0
grep -c '/novo-post §' "$F"                        # → ≥ 1
grep -ic "live preview" "templates/estilo.md"      # → 0
```

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/editar-post/SKILL.md templates/estilo.md
git commit -m "fix(editar-post): auto-boot do editor + link, mata Live Preview; ref por nome"
```

---

### Task 6: Sweep final — critérios de sucesso + anti-regressão

**Files:**
- Nenhum novo (verificação cross-cutting; correções inline se algo falhar).

- [ ] **Step 1: Sweep dos critérios 1‑8 nas 4 skills**

Run:
```bash
cd "/Users/unstudio/Documents/Projetos/dino team"
echo "== fracionados (deve ser 0 em todas) =="
grep -rnE '^\| [0-9]+[a-z.]|^### [0-9]+\.[0-9]' .claude/skills/{novo-post,lote-posts,novo-estilo,editar-post}/SKILL.md | wc -l
echo "== Live Preview (deve ser 0) =="
grep -rilc "live preview" .claude/skills/{novo-post,lote-posts,novo-estilo,editar-post}/SKILL.md templates/estilo.md | grep -v ':0' | wc -l
echo "== ref cross-skill por número (deve ser 0) =="
grep -rniE '/novo-post.*(passo|etapa) [0-9]' .claude/skills/{lote-posts,novo-estilo,editar-post}/SKILL.md | wc -l
echo "== âncoras canônicas no novo-post (cada ≥1) =="
for a in "Subir o Dino Editor" "Aprendizado de estilo" "Gate de marca" "Write-back" "Publicação"; do printf '%s: ' "$a"; grep -c "#### $a" .claude/skills/novo-post/SKILL.md; done
echo "== linhas por skill =="
wc -l .claude/skills/{novo-post,lote-posts,novo-estilo,editar-post}/SKILL.md
```
Expected: fracionados 0; Live Preview 0; ref por número 0; âncoras ≥1; linhas ~360/190/120/80.

- [ ] **Step 2: Anti-regressão — diff function-by-function**

Compare os critérios de conclusão NOVOS de cada skill contra o baseline capturado na Task 1:

```bash
{
  for s in novo-post lote-posts novo-estilo editar-post; do
    echo "===== $s ====="
    awk '/^## (Critério de conclusão|Critérios de conclusão)/{f=1} f' ".claude/skills/$s/SKILL.md"
    echo
  done
} > /tmp/novo-funcoes.md
diff /tmp/baseline-funcoes.md /tmp/novo-funcoes.md
```

Expected: as diferenças devem ser **só de redação/renumeração** — nenhuma capacidade do baseline pode ter sumido. Leia o diff: se um critério de conclusão original (ex.: "stories: frame-N.html + PNG por frame", "write-back registra linha", "rascunho salvo ou removido") não tiver equivalente no novo, **a função sumiu** — restaure-a na skill correspondente antes de seguir.

- [ ] **Step 3: Sanity de invocação — referências resolvem**

Para cada referência `/novo-post §X`, confirme que existe um heading correspondente no novo-post:

```bash
cd "/Users/unstudio/Documents/Projetos/dino team"
grep -rhoE '/novo-post §[A-Za-zçãéô -]+' .claude/skills/{lote-posts,novo-estilo,editar-post}/SKILL.md \
  | sed 's#/novo-post §##' | sort -u | while read -r sec; do
    printf '%-30s ' "$sec"; grep -c "#### $sec\|### [0-9]*\. *$sec" .claude/skills/novo-post/SKILL.md
  done
```
Expected: cada seção referenciada resolve para ≥1 heading no novo-post. Se alguma der `0`, ajuste o nome da âncora ou da referência até casar.

- [ ] **Step 4: Commit do fechamento (se houve correções) + spec**

```bash
git add -A
git commit -m "chore(skills): sweep final dos critérios + commit do spec/plano da refatoração" || echo "nada a commitar"
```

(Inclui no commit o spec `docs/specs/2026-06-10-refatoracao-skills-criar-posts-design.md` e este plano, se ainda não versionados.)

---

## Self-review (preenchido pelo autor do plano)

**Spec coverage:** cada uma das 9 regras do padrão → Task 1 Step 3; Fluxo linear → Tasks 2/3/4 Step 2; `Lê:` único → Tasks 2/3/4 Step 4; `--auto` consolidado → Task 2 Step 5; lar canônico + ref por nome → Task 2 Step 8 (âncoras) + Tasks 3/4/5 Step 3; matar Live Preview → Tasks 2/4/5; conserto do drift do editar-post → Task 5 Step 2; CLAUDE.md modo (a) → Task 1; anti-regressão das 26 funções → Task 1 Step 1 + Task 6 Step 2; alvos de tamanho → testes `wc -l` em cada task + Task 6 Step 1. Os 10 critérios de sucesso estão cobertos por Task 6 Steps 1‑3.

**Placeholder scan:** os conteúdos literais (bloco das 9 regras, tabelas de Fluxo, Passo 3 do editar-post, linhas `Lê:`, comandos de verificação) estão completos. A reescrita de prosa de corpo é dada como diretiva de transformação com referência de linha/seção exata (não "limpe a prosa") — cada passo aponta origem→destino e o que cortar.

**Type consistency:** os nomes de âncora são idênticos entre quem define (Task 2: `#### Subir o Dino Editor`, `#### Aprendizado de estilo`, `#### Gate de marca`, `#### Write-back`, `#### Publicação`, `#### Pesquisa`) e quem referencia (Tasks 3/4/5: `/novo-post §<mesmo nome>`). O Step 3 da Task 6 valida esse casamento por grep.
