# Spec: Estilo autocontido

**Data:** 2026-05-21
**Escopo:** `templates/formatos/`, `.claude/skills/novo-post`, `.claude/skills/novo-estilo`, `.claude/skills/lote-posts`, `.claude/agents/copywriter.md`, `CLAUDE.md`

---

## Contexto

Hoje a estrutura de copy de um post vive no **formato** (`templates/formatos/<formato>/copy.md`), não no **estilo**. Isso gera três problemas:

1. **Estilos de mesmo formato precisam de estruturas de copy diferentes.** O esqueleto fixo de `carrossel/copy.md` (Capa → Contexto → 3 sub-temas → Insight → CTA) não cabe em `treino-dino` (lista de exercícios) — mas todos compartilham esse mesmo esqueleto hoje.
2. **No modo ad-hoc, a referência visual do usuário não influencia copy.** A referência só chega ao designer (Passo 8); pesquisa, briefing e copy rodam cegos a ela.
3. **`padrao` é um resíduo de arquitetura.** Cumpre dois papéis hoje — exemplo estrutural pra `/novo-estilo` e fallback editorial — nenhum dos dois sustenta sua existência como estilo de verdade.

A solução é tornar o **estilo** a unidade autocontida que carrega tudo: visual + estrutura de copy + tom por bloco + drop zones declaradas.

---

## Princípio central

> Estrutura de copy é propriedade do estilo, não do formato.

Cada `estilo.md` passa a declarar — em texto auditável — a sequência ordenada de blocos do post, com função editorial, tom específico, o que a copy entrega em cada um, variações A/B e inputs visuais (incluindo drop zones).

Modo ad-hoc deixa de ser caso especial: vira "estilo temporário" criado num `_rascunho/`, tratado pelo resto do pipeline como estilo definido, e no fim o usuário decide salvar ou descartar.

---

## 1. Contrato do `estilo.md`

### Seções obrigatórias

1. **Cabeçalho:** `# Estilo <slug> — <formato>`
2. **`## Conceito visual`** — texto livre. Descreve visual + DNA editorial geral.
3. **`## Estrutura`** — lista ordenada de N blocos. Cada bloco declara:
   - ID (ex: `slide-1`, `exercicio-1..N`)
   - Classe HTML / variante visual (ex: `slide capa`, `slide dividido`)
   - Função editorial (hook / contexto / desenvolvimento / virada / CTA / instrução técnica)
   - Tom (modulação dentro do tom global da marca)
   - O que entregar + limite de palavras
   - Variações A/B (sim/não — quando sim, em quais blocos)
   - **Inputs visuais** (foto na zona X com `data-bg-drop="X"` / nenhum)

   Pode ser **fixa** (treino-dino: N+3 blocos pré-definidos) ou **flexível** ("5-7 blocos, hook obrigatório no primeiro, CTA obrigatório no último").

4. **`## Quando usar`** — temas/contextos onde o estilo se aplica.
5. **`## Quando NÃO usar`** — anti-padrões editoriais.
6. **`## Variantes visuais`** — classes HTML disponíveis no template.

### Seções condicionais

7. **`## Inputs obrigatórios externos`** — quando o estilo exige dado externo (ex: prescrição de treino).
8. **`## Cores adicionais / Tokens`** — quando há tokens específicos além da paleta da marca.
9. **`## Notas técnicas`** — quando há comportamentos não-óbvios.

### Onde mora o contrato

Em **`templates/estilo.md`** (arquivo novo) — esqueleto canônico passado ao `designer` pelas skills `/novo-estilo` e `/novo-post` (Passo 3 ad-hoc) ao gerar/editar um `estilo.md`.

---

## 2. Novo fluxo do `/novo-post`

### Resumo das mudanças

- **Passo 2 inverte ordem:** tema primeiro, estilo depois.
- **Passo 3 NOVO (só ad-hoc):** designer cria `_rascunho/` cedo.
- **Pausa NOVA após Passo 3:** validar estrutura/preview do estilo ad-hoc antes de pesquisa+copy.
- **Passo 8 (copy):** `copywriter` lê `estilo.md` do estilo escolhido em vez de `templates/formatos/<formato>/copy.md`.
- **Passo 12 NOVO (só ad-hoc):** salvar `_rascunho/` como permanente ou descartar.

### Pipeline completo

| # | Passo | Quem age | Notas |
|---|---|---|---|
| 1 | Parsear input | skill | igual |
| 2 | **Resolver tema → estilo (pausa)** | skill + `pesquisa-tendencias` (se faltar tema) + `diretor-marca` (se faltar estilo) | Veja abaixo |
| 3 | **Preparar `_rascunho/` ad-hoc (pausa)** | `designer` | Só executa em ad-hoc |
| 4 | Briefing estratégico | `diretor-marca` | Caminho do estilo aponta pra slug ou `_rascunho/` |
| 5 | Criar pasta do post | skill | igual |
| 6 | Resolver inputs obrigatórios externos | skill + `treinador` se preciso | Lê `## Inputs obrigatórios externos` do estilo |
| 7 | Pesquisa profunda | `pesquisa-tendencias` | igual |
| 8 | **Copy (pausa)** | `copywriter` | Lê `estilo.md`, não `copy.md` por formato |
| 9 | Design (pausa) | `designer` | igual |
| 10 | Validação técnica + export PNG | `curador-export` | igual |
| 11 | Curadoria editorial final | `diretor-marca` | igual |
| 12 | **Salvar/descartar `_rascunho/`** | skill + usuário | Só executa em ad-hoc |
| 13 | Entregar ao usuário | skill | + info se estilo foi salvo |

**Pausas:** 3 no modo definido, 5 no ad-hoc.

### Passo 2 — Resolver tema → estilo

**2a — Tema**
- Se tema veio no input → usa direto.
- Se faltou → `pesquisa-tendencias` modo scouting (inputs: formato + brand context).

**2b — Estilo** (sabendo o tema)
- Se estilo veio no input → usa direto.
- Se faltou → `diretor-marca` lê todos os `estilo.md` do formato, recomenda **1** com motivo, ou propõe ad-hoc se nenhum couber bem. Usuário: "sim" / outro slug / ad-hoc com referência.

**2c — Mostrar plano + pausa**
```
Plano do post:
- Formato: <formato>
- Tema: <tema>
- Estilo: <slug | ad-hoc>

Confirma? (sim / ajustar)
```

### Passo 3 — Preparar `_rascunho/` ad-hoc

Só executa quando `modo_estilo = "ad-hoc"`.

```bash
mkdir -p templates/formatos/<formato>/estilos/_rascunho/
```

Aciona `designer`:
```
Tarefa: criar estilo (estilo.md + slide.html + preview.html) a partir das referências.

Inputs:
- Pasta de trabalho: templates/formatos/<formato>/estilos/_rascunho/
- Formato: <formato>
- Referências: <imagem path> + <descrição texto>
- Contrato: templates/estilo.md (use como guia das seções obrigatórias)
- Regras inegociáveis: templates/formatos/README.md
- Dimensões/arquivo principal: vêm das regras inegociáveis + convenção (slide.html para carrossel, frame.html para stories)

Saída: estilo.md + arquivo principal + preview.html em _rascunho/.

Regra crítica:
- Referências fotográficas são guia de mood/composição/tratamento — NUNCA conteúdo final.
- Backgrounds com intenção fotográfica = sempre drop zone (data-bg-drop).
- Declarar drop zones no campo "Inputs visuais" de cada bloco da ## Estrutura do estilo.md.
```

**Pausa após gravação:**
```
Rascunho do estilo ad-hoc em templates/formatos/<formato>/estilos/_rascunho/
- preview.html
- estilo.md
- <arquivo principal>

Abra preview.html no Claude Design e revise estrutura/visual.
Confirma? (ok para seguir / descreva ajuste)
```

Se vier ajuste, re-aciona designer com pedido inline. Repete até "ok".

### Passo 12 — Salvar/descartar `_rascunho/`

Só executa quando `modo_estilo = "ad-hoc"`.

```
Estilo ad-hoc usado no post: templates/formatos/<formato>/estilos/_rascunho/

Quer salvar como estilo permanente?
- "salvar <slug-em-kebab-case>" → mantém pasta, renomeia.
- "descartar" → remove a pasta.
```

- **Salvar:** `mv _rascunho/ <slug>/`. Valida kebab-case. Se já existir, pede outro.
- **Descartar:** `rm -rf _rascunho/`.

---

## 3. Mudanças no `copywriter.md`

Mudanças mínimas — agente segue generalista. Renomeia a fonte da estrutura.

| Hoje | Depois |
|---|---|
| "Templates lidos sob demanda: `templates/formatos/<X>/copy.md` (esqueleto estrutural)" | "`estilo.md` apontado pela skill — carrega `## Estrutura` com função/tom/entrega/Inputs visuais por bloco" |
| Contrato de entrada: "**Template a seguir:** caminho do esqueleto estrutural" | "**Estilo a seguir:** caminho do `estilo.md`" |
| Erro `TEMPLATE_INVALIDO — <caminho>` | `ESTILO_INVALIDO — <caminho>` |

Princípios, anti-padrões e demais comportamentos: inalterados.

---

## 4. Mudanças no `CLAUDE.md`

Refatorar seção 3 ("Agentes") + bullets operacionais que falam de agente, deixando mais enxuto e explicitando generalidade.

### Seção 3 (substitui o bloco atual)

```markdown
### 3. Agentes — especialistas por função (`.claude/agents/`)

Cada agente domina **uma função**, vale pra qualquer skill do sistema (não só criação de posts). Não conhece o fluxo nem outros agentes — recebe input num formato declarado, entrega output num formato declarado. Conhecimento específico de um fluxo vive nas skills e templates, não no agente.

**Agentes:**
- [`diretor-marca`](.claude/agents/diretor-marca.md) — estratégia e curadoria editorial.
- [`pesquisa-tendencias`](.claude/agents/pesquisa-tendencias.md) — pesquisa de conteúdo (scouting / deep).
- [`copywriter`](.claude/agents/copywriter.md) — copy persuasiva.
- [`designer`](.claude/agents/designer.md) — HTML+CSS visual.
- [`curador-export`](.claude/agents/curador-export.md) — validação técnica + export PNG.
- [`treinador`](.claude/agents/treinador.md) — decisões técnicas de treino.
```

### Regras operacionais (substitui os 4 bullets sobre skill/agente atuais)

```markdown
- **Skills orquestram, agentes executam.** Skill define ordem, pausas e formato final; agentes dominam função e podem cooperar entre si dentro de uma ordem.
- **Brand é o eixo comum.** Qualquer agente consulta `brand/` quando o trabalho exigir contexto da marca.
- **Erros estruturais voltam pra skill** (ex: `BRAND_BOOK_INCOMPLETO`, `ESTILO_INVALIDO`).
```

---

## 5. Migração dos estilos existentes

### Estilos a remover

- `templates/formatos/carrossel/estilos/padrao/` ✗
- `templates/formatos/stories/estilos/padrao/` ✗ (era placeholder, nunca foi estilo real)

### Estilos a atualizar pro novo contrato

| Estilo | Ação |
|---|---|
| `carrossel/estilos/treino-dino/estilo.md` | Adicionar `## Estrutura` (já tem `## Estrutura obrigatória` — refatorar pra novo formato com tom/entrega/variações A/B/Inputs visuais por bloco). HTML intocado. |
| `carrossel/estilos/layout-dividido/estilo.md` | Adicionar `## Estrutura` do zero. HTML intocado. |

### Arquivos a remover

- `templates/formatos/carrossel/copy.md` ✗
- `templates/formatos/stories/copy.md` ✗

### Arquivos a criar

- `templates/estilo.md` — esqueleto canônico do contrato (seções obrigatórias e condicionais).

### Referências a atualizar

- `templates/formatos/carrossel/estilos/treino-dino/estilo.md:74` — remove menção a "usar padrão".
- `.claude/skills/novo-estilo/SKILL.md:26,77,83` — remove `padrao` como exemplo e como base estrutural. Substitui: dimensões/arquivo principal vêm das regras inegociáveis (`templates/formatos/README.md`) + convenção de nome (`slide.html` carrossel, `frame.html` stories).
- `.claude/skills/lote-posts/SKILL.md:27` — troca exemplo `/lote-posts stories 6 padrao` por outro estilo válido (ou remove referência a stories até criar primeiro estilo).

### Impacto em stories

Stories fica sem nenhum estilo pré-definido. `/novo-post stories` cai sempre em ad-hoc até alguém criar via `/novo-estilo`. Comportamento esperado — `padrao` de stories nunca foi estilo real, era placeholder.

---

## 6. Fora de escopo

- Refatoração de `templates/pesquisa.md` ou `templates/briefing.md`.
- Criação de novos estilos pra stories.
- Integração com agente futuro de redes sociais.
- Auditoria/criação de slug para drop zones (`data-bg-drop` continua livre por estilo).
- Mudanças em `designer.md` (preservar generalidade do agente).

---

## 7. Critérios de aceite

- [ ] `templates/estilo.md` criado com checklist completo das seções.
- [ ] `treino-dino/estilo.md` e `layout-dividido/estilo.md` atualizados com `## Estrutura` no novo contrato.
- [ ] `padrao/` removido de carrossel e stories.
- [ ] `copy.md` removido de carrossel e stories.
- [ ] `copywriter.md` aponta pra `estilo.md` (não pra `copy.md` por formato).
- [ ] `/novo-post` SKILL.md reescrito com novo pipeline (Passos 2, 3, 12 novos/alterados).
- [ ] `/novo-estilo` SKILL.md sem referência a `padrao` como base.
- [ ] `/lote-posts` SKILL.md com exemplo atualizado.
- [ ] `CLAUDE.md` com seção 3 enxuta + bullets operacionais reduzidos + nota de generalidade.
- [ ] Um post completo gerado em modo definido (validar pipeline).
- [ ] Um post completo gerado em modo ad-hoc com salvamento do estilo (validar passos 3 e 12).
