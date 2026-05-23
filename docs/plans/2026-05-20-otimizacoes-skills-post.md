# Otimizações nas Skills de Criação de Post — Plano de Implementação

**Goal:** Adicionar pausa de aprovação de copy, generalizar o designer para aceitar referência ad-hoc, e reescrever o README de formatos como regras inegociáveis.

**Architecture:** Mudanças em 4 arquivos de configuração (3 markdown de skills/agente + 1 README). Sem código executável novo. Validação por leitura e teste end-to-end das skills.

**Spec:** `docs/specs/2026-05-20-otimizacoes-skills-post.md`

**Ordem de implementação:** README primeiro (dependência das skills) → designer (contrato base) → novo-post (consome ambos) → lote-posts (depende de novo-post).

---

## Task 1: Reescrever README como regras inegociáveis

**Files:**
- Modify: `templates/formatos/README.md` (reescrita completa)

- [ ] **Step 1: Sobrescrever o arquivo com o conteúdo enxuto**

Conteúdo final de `templates/formatos/README.md`:

```markdown
# Regras Inegociáveis — Criação de Posts

Aplicam em todo post, independente de formato ou estilo. Lido pelo `designer` em cada criação de post, passado explicitamente pela skill.

## Tipografia
- Todo texto em CAIXA ALTA, sem exceção
- Títulos: Anton
- Subtítulos e apoio: Montserrat
- Sem tipografias além dessas duas

## Margens e Safe Areas
- Carrossel: 80px em todos os lados
- Stories: 250px topo e base
- Conteúdo crítico nunca encosta nas bordas
- Imagens de fundo e barras de progresso podem ocupar bleed total

## Paleta
- Apenas preto (#000000), branco (#FFFFFF) e cinza (#7F7F7F)
- Verde chroma (#00B140) exclusivamente em estilos de treino com vídeo
- Sem cores saturadas, gradientes coloridos ou neons

## Assets individuais
- Sem JavaScript
- Sem dependências externas além das fontes declaradas
- Um arquivo HTML standalone por slide/frame

## Preview consolidado
- Todo post termina com preview.html
- preview.html usa templates/wrappers/preview-wrapper.html verbatim
- section[data-slide="N"] obrigatório por asset

## Dimensões
- Carrossel: 1080×1350px
- Stories: 1080×1920px
- Não alterar dimensões declaradas no template
```

- [ ] **Step 2: Verificar leitura**

Ler `templates/formatos/README.md` e confirmar que o conteúdo é exatamente o acima, sem nada do README antigo.

- [ ] **Step 3: Commit**

```bash
git add templates/formatos/README.md
git commit -m "refactor: README de formatos vira checklist de regras inegociáveis"
```

---

## Task 2: Generalizar o agente designer

**Files:**
- Modify: `.claude/agents/designer.md` — seções "Contrato de entrada" e "Quando devolver erro"

- [ ] **Step 1: Atualizar "Contrato de entrada"**

Localizar a seção `## Contrato de entrada` em `.claude/agents/designer.md` e substituir o bloco de bullets atual por:

```markdown
## Contrato de entrada

A skill que me aciona deve fornecer, em texto livre:

- **Tarefa:** descrição específica (ex: "produza N assets visuais a partir do copy em `<path>`, um por bloco" ou "consolide os assets X, Y, Z em um preview único usando o wrapper em `<path>`").
- **Inputs:**
  - **Guia visual** — ao menos um dos dois é obrigatório:
    - Caminho do template HTML do estilo + caminho do `estilo.md` (quando há estilo definido).
    - Referência ad-hoc: caminho de imagem de referência e/ou descrição textual do visual.
    - Quando ambos chegam, o template é a base e a referência é direção adicional.
  - Caminho do copy/texto base.
  - Caminho de inputs adicionais quando aplicável (ex: prescrição técnica que precisa aparecer literal num bloco).
  - Caminho do arquivo de regras inegociáveis (`templates/formatos/README.md`) — regras absolutas que valem para todo post.
- **Saída:** pasta destino e padrão de nome dos arquivos (ex: `<pasta>/asset-N.html`). Para consolidação de preview, caminho do arquivo único.

Sem `Tarefa` ou guia visual (nem template nem referência), devolvo `INPUT_INSUFICIENTE — <o que falta>`.
```

- [ ] **Step 2: Atualizar "Quando devolver erro"**

Localizar a seção `## Quando devolver erro` e substituir os bullets `INPUT_INSUFICIENTE`, `TEMPLATE_INVALIDO` e `ESTILO_INCOMPLETO` por:

```markdown
- `INPUT_INSUFICIENTE — <o que falta>` — sem tarefa, sem copy, ou sem guia visual (template ou referência).
- `TEMPLATE_INVALIDO — <caminho>` — template apontado não existe ou está vazio (quando template foi passado).
- `ESTILO_INCOMPLETO — <caminho>` — `estilo.md` ausente quando o template visual exigir variantes/restrições documentadas.
- `REFERENCIA_INSUFICIENTE — <motivo>` — modo ad-hoc com imagem e descrição ambas ausentes ou inutilizáveis.
```

- [ ] **Step 3: Atualizar a linha de "Contexto que carrego"**

Localizar em `## Contexto que carrego` a linha:

```markdown
- Template do estilo apontado (`templates/.../<slug>/<template visual>`) — fonte do leiaute base, das variantes de classe, das dimensões e das áreas de conteúdo. **Herde, não reinvente.**
```

Substituir por:

```markdown
- Template do estilo apontado (`templates/.../<slug>/<template visual>`) — quando há estilo definido: fonte do leiaute base, das variantes de classe, das dimensões e das áreas de conteúdo. **Herde, não reinvente.**
- Referência ad-hoc (imagem + descrição) — quando não há template: gere o HTML do zero seguindo a referência, dimensões do formato e regras do brand + regras inegociáveis.
- Regras inegociáveis (`templates/formatos/README.md`) — quando a skill apontar: checklist absoluto que vale para todo post, acima de qualquer estilo.
```

- [ ] **Step 4: Atualizar "Princípios da especialidade"**

Localizar o bullet:

```markdown
- **Template é o ponto de partida.** Herde estrutura, tokens CSS e variantes do template apontado. Ajuste para o conteúdo específico; não reescreva o leiaute base.
```

Substituir por:

```markdown
- **Guia visual é o ponto de partida.** Quando há template, herde estrutura, tokens CSS e variantes — não reescreva o leiaute base. Quando não há (modo ad-hoc), gere do zero seguindo a referência fornecida (imagem e/ou descrição), respeitando dimensões do formato e regras inegociáveis.
- **Hierarquia de regras.** Regras inegociáveis (README) > `estilo.md` do estilo (quando houver) > interpretação visual. Nada contradiz o nível acima.
```

- [ ] **Step 5: Verificar leitura**

Ler `.claude/agents/designer.md` e confirmar as 4 alterações.

- [ ] **Step 6: Commit**

```bash
git add .claude/agents/designer.md
git commit -m "feat(designer): aceitar referência ad-hoc além de template; ler regras inegociáveis"
```

---

## Task 3: Adicionar pausa de copy approval no novo-post

**Files:**
- Modify: `.claude/skills/novo-post/SKILL.md` — inserir Passo 7.5 entre Passo 7 e Passo 8, renumerar passos seguintes

- [ ] **Step 1: Inserir Passo 7.5 (revisão de copy)**

Após o final do Passo 7 atual (que termina com "Critério: arquivo gravado com a estrutura do template e variações nos pontos pedidos.") e antes do `### 8. Design (assets + preview consolidado)`, inserir:

```markdown
### 7.5. Pausa para revisão da copy

Mostre ao usuário o conteúdo de `copy.md`:

\`\`\`
Copy gerada em export/conteudos/<formato>/<data>-<slug>/copy.md

--- início do copy ---
<conteúdo integral de copy.md>
--- fim do copy ---

Confirma? (responda "ok" para seguir ao design, ou descreva o ajuste)
\`\`\`

**Aguarde resposta.** Se vier ajuste, re-acione o `copywriter` com o pedido inline (sem re-rodar pesquisa), aguarde nova gravação e reapresente. Repita até "ok". Se confirmado, siga ao Passo 8.

Prompt do `copywriter` em modo ajuste:

\`\`\`
Tarefa: ajustar copy do post conforme pedido do usuário.

Inputs:
- Copy atual: export/conteudos/<formato>/<data>-<slug>/copy.md
- Pedido de ajuste: <texto do usuário>
- Briefing inline original: <briefing guardado no Passo 3>

Regras:
- Preserve estrutura do template e blocos que não foram pedidos para mudar.
- Aplique apenas o ajuste solicitado.

Saída: sobrescrever export/conteudos/<formato>/<data>-<slug>/copy.md.
\`\`\`
```

- [ ] **Step 2: Verificar que os passos seguintes seguem a mesma numeração**

O passo "### 8. Design" e os seguintes (9, 10, 11, 12) permanecem inalterados em numeração — o novo passo é 7.5, intermediário.

- [ ] **Step 3: Verificar leitura**

Ler `.claude/skills/novo-post/SKILL.md` e confirmar que o Passo 7.5 está presente entre o 7 e o 8.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/novo-post/SKILL.md
git commit -m "feat(novo-post): pausa de aprovação da copy antes do design"
```

---

## Task 4: Adicionar fluxo ad-hoc no Passo 2 do novo-post

**Files:**
- Modify: `.claude/skills/novo-post/SKILL.md` — Passo 2

- [ ] **Step 1: Substituir o Passo 2 inteiro**

Localizar `### 2. Confirmar plano (scouting quando faltar estilo ou tema)` e substituir o bloco inteiro (até antes de `### 3. Briefing estratégico`) por:

```markdown
### 2. Confirmar plano (estilo existente ou ad-hoc; scouting de tema)

Se faltar **estilo**, pergunte ao usuário:

\`\`\`
Estilo: nenhum definido.

Opções:
- Usar estilo existente: <lista de slugs de templates/formatos/<formato>/estilos/>
- Criar do zero (ad-hoc): anexe imagem de referência e/ou descreva o visual desejado
\`\`\`

**Aguarde resposta.** Resolva uma das duas vias:

- **Slug existente escolhido** → `modo_estilo = "definido"`, `slug = <escolhido>`.
- **Ad-hoc** → `modo_estilo = "ad-hoc"`, colete:
  - `referencia_imagem` (caminho) — opcional
  - `referencia_descricao` (texto) — opcional
  - Ao menos um dos dois é obrigatório. Se nenhum, repita a pergunta.

Se faltar **tema**, acione `pesquisa-tendencias`:

\`\`\`
Tarefa: sugerir tema para um post Instagram.
Profundidade: rápida / decisória.

Inputs:
- Formato: <formato>
- Estilo: <slug ou "ad-hoc — <descrição resumida>">
- Tema já definido: <texto ou "nenhum">

Saída inline (3-4 linhas): tema sugerido + motivo, ancorando em pilar/público/tendência.
\`\`\`

Apresente o plano final:

\`\`\`
Plano do post:
- Formato: <formato>
- Estilo: <slug existente> | ad-hoc (referência: <descrição resumida>)
- Tema: <tema>

Confirma? (responda "sim" para seguir, ou diga o que ajustar)
\`\`\`

**Aguarde confirmação explícita ou ajuste** antes de seguir ao Passo 3.
```

- [ ] **Step 2: Verificar leitura**

Ler o Passo 2 atualizado e confirmar a presença de `modo_estilo` e da bifurcação existente vs ad-hoc.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/novo-post/SKILL.md
git commit -m "feat(novo-post): suportar estilo ad-hoc no plano (sem template pré-criado)"
```

---

## Task 5: Skip do Passo 5 em modo ad-hoc no novo-post

**Files:**
- Modify: `.claude/skills/novo-post/SKILL.md` — Passo 5

- [ ] **Step 1: Adicionar guarda no início do Passo 5**

Localizar `### 5. Resolver inputs obrigatórios do estilo` e substituir a primeira linha (que começa com "Leia `templates/formatos/...`") por:

```markdown
**Se `modo_estilo = "ad-hoc"`:** pule este passo. Sem `estilo.md`, não há inputs obrigatórios a verificar.

Caso contrário, leia `templates/formatos/<formato>/estilos/<estilo>/estilo.md`. Se não declarar seção **"Inputs obrigatórios"**, pule. Caso contrário, por tipo de input:
```

(O restante do passo — exercícios, prescrição técnica, treinador, outros tipos — permanece igual.)

- [ ] **Step 2: Verificar leitura**

Confirmar que a guarda `modo_estilo = "ad-hoc"` está no topo do Passo 5.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/novo-post/SKILL.md
git commit -m "feat(novo-post): pular Passo 5 em modo ad-hoc (sem estilo.md)"
```

---

## Task 6: Atualizar Passo 8 do novo-post (guia visual dual + README)

**Files:**
- Modify: `.claude/skills/novo-post/SKILL.md` — Passo 8

- [ ] **Step 1: Substituir os Inputs da Tarefa 1 do designer no Passo 8**

Localizar o bloco da Tarefa 1 no Passo 8:

```markdown
Tarefa 1 — produzir N assets visuais (um por bloco do copy).

Inputs:
- Template visual: templates/formatos/<formato>/estilos/<estilo>/<arquivo HTML do estilo>
- Descrição do estilo: templates/formatos/<formato>/estilos/<estilo>/estilo.md
- Copy: export/conteudos/<formato>/<data>-<slug>/copy.md
- Inputs técnicos (se houver): export/conteudos/<formato>/<data>-<slug>/treino.md
```

Substituir por:

```markdown
Tarefa 1 — produzir N assets visuais (um por bloco do copy).

Inputs:
- Regras inegociáveis: templates/formatos/README.md
- Guia visual:
  - Modo "definido":
    - Template visual: templates/formatos/<formato>/estilos/<estilo>/<arquivo HTML do estilo>
    - Descrição do estilo: templates/formatos/<formato>/estilos/<estilo>/estilo.md
  - Modo "ad-hoc":
    - Referência (imagem): <caminho ou "nenhuma">
    - Referência (descrição): <texto do usuário>
- Copy: export/conteudos/<formato>/<data>-<slug>/copy.md
- Inputs técnicos (se houver): export/conteudos/<formato>/<data>-<slug>/treino.md
```

- [ ] **Step 2: Verificar leitura**

Confirmar que o bloco do Passo 8 agora referencia o README e suporta os dois modos.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/novo-post/SKILL.md
git commit -m "feat(novo-post): passar README + guia visual dual ao designer no Passo 8"
```

---

## Task 7: Resequenciar lote-posts para pausa de copy em lote

**Files:**
- Modify: `.claude/skills/lote-posts/SKILL.md` — Passos 5, 6, 7

- [ ] **Step 1: Substituir o Passo 5 (Executar pipeline /novo-post por par até o design)**

Localizar `### 5. Executar pipeline /novo-post por par (até o design)` e substituir todo o bloco até antes de `### 6. Loop de revisão de previews` por:

```markdown
### 5. Executar até a copy de cada post

Para cada par `(subtema, estilo)` da lista, execute os passos do `/novo-post` **até a copy**, sem pausa:

- **Briefing estratégico** (`diretor-marca`) — extraia `slug-do-post`.
- **Criar pasta do post** — `export/conteudos/<formato>/<data>-<slug>/`.
- **Resolver inputs obrigatórios do estilo** (apenas se `modo_estilo = "definido"`):
  - Modo interativo: pergunte ao usuário (ex.: lista de exercícios).
  - Modo agendado: pule este post (`SKIPPED — input técnico obrigatório`) e siga.
- **Pesquisa profunda** (`pesquisa-tendencias`).
- **Copy** (`copywriter`).

**Política de falha:** se um post falhar em qualquer etapa, registre o erro e continue os demais. `BRAND_BOOK_INCOMPLETO` para o lote inteiro.

### 6. Pausa de revisão de copies em lote

Após a copy de todos os posts, apresente as copies em lote:

\`\`\`
Copies do lote geradas. Revise antes do design:

Post 1 — <slug-do-post> (estilo: <slug>)
--- início ---
<conteúdo integral de copy.md do post 1>
--- fim ---

Post 2 — <slug-do-post> (estilo: <slug>)
--- início ---
<conteúdo integral de copy.md do post 2>
--- fim ---

...

Responda:
- "ok" → aprova todos e inicia design de todos
- "ajustar post N: <descrição>" → re-aciona copywriter só daquele post; reapresenta apenas o post ajustado para confirmação; pergunta se há mais ajustes ou se pode iniciar design
\`\`\`

A pausa só avança ao Passo 7 quando o usuário confirmar que não há mais ajustes.

**Modo agendado:** pule a pausa. Siga direto ao Passo 7.

### 7. Design + revisão de previews por post

Para cada post aprovado no Passo 6, execute o **Design (assets + preview consolidado)** do `/novo-post` (`designer`).

Após o design de todos os posts, apresente os previews **um por um**, na ordem da lista:

\`\`\`
Post <n> de <N> — <slug-do-post> (estilo: <slug>)
Tema: <subtema>
Preview: export/conteudos/<formato>/<data>-<slug>/design/preview.html

Opções:
- "ok" / "confirmar" → segue para o próximo
- "ajustar: <descrição>" → reaciona o designer; reapresenta este post
- Anexe preview.html editado → sobrescreve e segue
\`\`\`

Aguarde decisão antes de passar ao próximo. Quando todos forem confirmados, siga ao Passo 8.

**Modo agendado:** pule o loop. Siga direto ao Passo 8 com os previews gerados.
```

- [ ] **Step 2: Renumerar os passos seguintes**

Localizar `### 7. Validação, export e curadoria editorial` e renumerar para `### 8. Validação, export e curadoria editorial`. Localizar `### 8. Reportar entrega do lote` e renumerar para `### 9. Reportar entrega do lote`.

- [ ] **Step 3: Atualizar a seção "Modo agendado" no final**

Localizar `## Modo agendado (\`/schedule\`)` e atualizar para:

```markdown
## Modo agendado (`/schedule`)

- Pula confirmação do plano (Passo 4).
- Pula pausa de revisão de copies em lote (Passo 6).
- Pula loop de revisão de previews (Passo 7).
- Posts com inputs técnicos obrigatórios não declarados são pulados.
- Reporta o resumo no canal de notificação configurado.
```

- [ ] **Step 4: Verificar leitura**

Ler `.claude/skills/lote-posts/SKILL.md` integralmente e confirmar:
- Passos 5, 6, 7 atualizados conforme nova sequência
- Passos 8 e 9 existem (renumerados de 7 e 8)
- Modo agendado lista os 3 skips corretos

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/lote-posts/SKILL.md
git commit -m "feat(lote-posts): copy de todos os posts → pausa em lote → design"
```

---

## Task 8: Validação end-to-end manual

**Files:** nenhum (validação por execução)

- [ ] **Step 1: Validar `novo-post` com estilo existente**

Rodar mentalmente o pipeline com:
```
/novo-post carrossel padrao mentalidade campeão
```
Verificar que:
- Passo 5 executa normal (estilo definido).
- Passo 7.5 (pausa de copy) está presente e funcional.
- Passo 8 passa `templates/formatos/README.md` + template + estilo.md.

- [ ] **Step 2: Validar `novo-post` em modo ad-hoc**

Rodar mentalmente o pipeline com:
```
/novo-post carrossel "cards escuros com fonte gigante, fundo grão de filme"
```
Verificar que:
- Passo 2 detecta ausência de slug, oferece ad-hoc, coleta descrição.
- Passo 5 é pulado.
- Passo 7.5 (pausa de copy) funciona igual.
- Passo 8 passa `templates/formatos/README.md` + referência (descrição), sem template.

- [ ] **Step 3: Validar `lote-posts`**

Rodar mentalmente:
```
/lote-posts carrossel 3 padrao
```
Verificar que:
- Passo 5 gera as 3 copies em sequência sem pausa.
- Passo 6 apresenta as 3 copies em lote para revisão.
- Passo 7 só inicia após "ok" da revisão.

- [ ] **Step 4: Commit final do plano executado**

```bash
git log --oneline -8
```

Confirmar que os 7 commits estão registrados em sequência (Tasks 1-7).
```

---

## Self-Review

**Spec coverage:**
- ✅ Copy approval em `novo-post` → Task 3
- ✅ Copy approval em `lote-posts` (pausa em lote) → Task 7
- ✅ Designer aceita template OR referência → Task 2
- ✅ Designer carrega regras inegociáveis → Task 2 (Step 3) + Task 6 (skill passa o caminho)
- ✅ novo-post Passo 2 ad-hoc → Task 4
- ✅ novo-post Passo 5 skip em ad-hoc → Task 5
- ✅ novo-post Passo 8 dual + README → Task 6
- ✅ README reescrito → Task 1

**Type/path consistency:**
- `modo_estilo` aparece em Task 4 (definido) e Task 5 (usado). Nome consistente.
- `templates/formatos/README.md` aparece em Task 1 (criado), Task 2 (referenciado no contexto do designer), Task 6 (passado pelo skill). Path consistente.
- `referencia_imagem` e `referencia_descricao` aparecem em Task 4 (definidos) e Task 6 (passados ao designer como "Referência (imagem)" e "Referência (descrição)" — match conceitual).

**Ordem de dependência:**
1. README primeiro (Task 1) — citado nos demais
2. Designer (Task 2) — define o contrato que a skill vai consumir
3. novo-post (Tasks 3-6) — em ordem incremental no mesmo arquivo
4. lote-posts (Task 7) — depende do novo-post atualizado
5. Validação (Task 8)

Sem placeholders.
