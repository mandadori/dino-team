# Arquitetura 360 + Cérebro de Marca — Plano de Implementação (Onda 4)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development ou executing-plans. Passos com checkbox (`- [ ]`).

**Goal:** **Sinergia real entre canais.** Hoje o sistema só produz Instagram. A Onda 4 cria skills de produção para **outros canais** (`/novo-artigo` blog, `/novo-email`, `/novo-comunidade`) que **leem a mesma narrativa ativa** e **escrevem de volta no mesmo livro-razão** — de modo que uma crença em construção gera peças coerentes em ≥2 canais **sem ninguém coordenar**. É a demonstração direta de "a memória é a integração".

**Architecture:** Blackboard. As skills de canal não se falam — todas leem `memory/narrativas/ativas.md` (mesma narrativa) e gravam via `scripts/memory/append_livro_razao.js` (mesmo livro-razão, com `--canal` diferente). Copy é **função única, canal via parâmetro** (regra de corpo §1.5 / spec §6.1): cada skill produz a copy **inline**, adaptando o formato ao canal, sem agente de copy por canal. **Depende da Onda 3** (narrativa servida + script de write-back). Reusa o que a Onda 3 já construiu — não recria.

**Tech Stack:** Markdown (skills, templates, artefatos de email/comunidade). MDX para o artigo de blog (draft; a publicação no site é trabalho do GSD do site, fora daqui). Script Node da Onda 3 reusado. "Testes" = `grep`/`ls`/dry-run + um cenário de sinergia (mesma narrativa → 2 canais).

**Spec de origem:** `docs/specs/2026-06-06-arquitetura-360-cerebro-de-marca-design.md` (Onda 4 em §7; canais §6.1; copy/design função única §3.4/§6.1; sinergia §1.4).

---

## ⚠ Onde executar este plano

- Execute **neste worktree** (`worktree-arquitetura-360-cerebro`) — já contém `dino-studio-editor` (merge `11c6f70`) + Ondas 1-2-3. O aviso "não rode neste worktree" dos planos antigos está desatualizado.
- **Pré-requisito de fato:** a Onda 3 precisa estar executada (script `append_livro_razao.js`, `narrativa_servida` no briefing). Está — commits `d151b25`→`3b9711e`.

## Refinamentos sobre o spec (descobertos ao mapear o código)

1. **Não há blog no site ainda.** `site/app/` tem `admin/`, `privacidade/`, `termos/` — **nenhuma rota de blog/MDX**. O blog é fase do **GSD do site** (`.planning/`), não construída. Logo `/novo-artigo` **produz o artigo como artefato draft** (`export/conteudos/blog/<slug>/artigo.mdx`), espelhando como `/novo-post` produz em `export/conteudos/`. A integração do MDX no site fica para o GSD do site (fora desta onda).
2. **Envio real é diferido (§9).** E-mail (Resend) e Comunidade (WhatsApp) são "depois" no spec §6.1 e o envio está em §9 (fora de escopo até integrações ativas). Estas skills **produzem o conteúdo aprovado**; o disparo real é etapa futura (scripts `integrations/` na Onda 5+). Cada skill termina entregando o artefato + (opcional) registrando no livro-razão.
3. **Write-back multicanal reusa o script da Onda 3.** `append_livro_razao.js` já nasce com `--canal`. Cada skill nova chama com `--canal blog|email|comunidade`. Zero código novo de write-back.
4. **Copy inline, sem agente por canal.** Cada skill lê `brand/tom-de-voz.md` + `brand/publico-alvo.md` + narrativa ativa + (se informacional) dispara `/pesquisar-tema`, e escreve a copy inline — exatamente como `/novo-post` Passo 10, adaptado ao formato do canal.
5. **Gate de marca vale para todo canal.** `revisor-brand` (momento "criação de post" = copy + compliance) valida o artefato de qualquer canal antes da entrega.

## Mapa de arquivos

**Criam-se:**
- `.claude/skills/novo-artigo/SKILL.md`
- `.claude/skills/novo-email/SKILL.md`
- `.claude/skills/novo-comunidade/SKILL.md`
- `templates/artigo.md` (esqueleto MDX do artigo de blog)
- `templates/email.md` (esqueleto de e-mail: assunto + preheader + corpo + CTA)
- `templates/comunidade.md` (esqueleto de mensagem de comunidade)

**Modificam-se:**
- `CLAUDE.md` (roster de skills + canais: Instagram→multicanal)
- `memory/_schema.md` (nota: livro-razão agora recebe write-back de múltiplos canais)

**Lê-se (modelo, não muda):** `.claude/skills/novo-post/SKILL.md` (pipeline de referência), `.claude/skills/planejar-pauta-semanal/SKILL.md` (leitura de narrativa), `scripts/memory/append_livro_razao.js` (write-back), `templates/briefing.md`.

---

# ONDA 4 — Produção multicanal

**Resultado testável ao fim:** existem `/novo-artigo`, `/novo-email`, `/novo-comunidade`; cada uma lê `memory/narrativas/ativas.md`, produz a peça inline (gate de marca), e escreve no livro-razão com seu `--canal`. Demonstração de sinergia: a narrativa `progresso-invisivel` gera peças coerentes em ≥2 canais.

### Task 4.1: Templates dos novos canais

**Files:** Create `templates/artigo.md`, `templates/email.md`, `templates/comunidade.md`.

- [ ] **Step 1: `templates/artigo.md`** — esqueleto de artigo de blog SEO em MDX. Seções: frontmatter (`title`, `description`, `slug`, `pilar`, `narrativa`, `data`, `autor: Dino Team`), `## Abertura` (hook que espelha a dor), corpo em H2/H3 (desenvolvimento do ângulo, ancorado em pesquisa), `## Fechamento` (eleva ao tom da marca + CTA sóbrio). Notas de SEO (1 H1 = title, keyword no primeiro parágrafo). Placeholders, não conteúdo.

- [ ] **Step 2: `templates/email.md`** — esqueleto: `assunto` (≤ 50 chars), `preheader` (≤ 90 chars), `corpo` (abertura pessoal → desenvolvimento → 1 CTA), `tom` (carta de mentor, 1:1, não broadcast). Campo `narrativa:` no topo.

- [ ] **Step 3: `templates/comunidade.md`** — esqueleto de mensagem curta para comunidade (WhatsApp): `gancho` (1 linha), `corpo` (≤ 4 linhas, conversa não-marketing), `convite` (pergunta que gera resposta). Campo `narrativa:`.

- [ ] **Step 4: Verificar e commitar**
```bash
ls templates/artigo.md templates/email.md templates/comunidade.md && echo OK
git add templates/artigo.md templates/email.md templates/comunidade.md
git commit -m "feat(templates): esqueletos de artigo, email e comunidade (canais Onda 4)"
```

### Task 4.2: Skill `/novo-artigo` (blog SEO)

**Files:** Create `.claude/skills/novo-artigo/SKILL.md`. Modelo: `/novo-post` (estrutura, gate, write-back) reduzido ao essencial de blog.

- [ ] **Step 1: Escrever a skill** com:
  - **Frontmatter:** `name: novo-artigo`; `description:` "Produz um artigo de blog (MDX draft) a partir de um tema/ângulo, lendo a narrativa ativa e o brand. Output em `export/conteudos/blog/<slug>/artigo.mdx`. Pesquisa via `/pesquisar-tema`; gate `revisor-brand`; write-back no livro-razão (canal=blog). A publicação no site é trabalho do GSD do site (não desta skill)."
  - **`## Fluxo`** (Passo|Ação|Recebe|Depende|Entrega):
    1. ⚙ parse — tema/ângulo, pilar opcional.
    2. ⚙ ler narrativa ativa — `memory/narrativas/ativas.md` → arco servido (`narrativa_servida`, ou `neutro`).
    3. ⚙ briefing inline — ângulo/pilar/objetivo/recorte/slug (espelha `/novo-post` Passo 6, lendo brand + narrativa).
    4. `/pesquisar-tema` (condicional, ângulo informacional) — grava em `memory/pesquisa/`.
    5. ⚙ escrever o artigo inline (MDX) — `brand/tom-de-voz.md` + `brand/publico-alvo.md` + pesquisa → `export/conteudos/blog/<slug>/artigo.mdx` via `templates/artigo.md`. ⏸ revisão.
    6. `revisor-brand` (gate, momento criação de post) — copy + compliance.
    7. ⚙ entregar + write-back: `append_livro_razao.js --canal blog`.
  - **Pipeline:** detalhar cada passo. Write-back só quando APROVADO (mesma regra do `/novo-post`).

- [ ] **Step 2: Verificar e commitar**
```bash
grep -q "name: novo-artigo" .claude/skills/novo-artigo/SKILL.md && grep -q "append_livro_razao" .claude/skills/novo-artigo/SKILL.md && echo OK
git add .claude/skills/novo-artigo
git commit -m "feat(skills): cria /novo-artigo (blog MDX lendo narrativa ativa + write-back)"
```

### Task 4.3: Skill `/novo-email`

**Files:** Create `.claude/skills/novo-email/SKILL.md`.

- [ ] **Step 1: Escrever a skill** — mesmo esqueleto de fluxo do `/novo-artigo`, adaptado:
  - **Frontmatter:** `name: novo-email`; `description:` "Produz um e-mail (assunto + preheader + corpo + CTA) lendo a narrativa ativa e o brand. Output em `export/conteudos/email/<slug>/email.md`. Gate `revisor-brand`; write-back (canal=email). Envio real (Resend) é etapa futura — esta skill entrega o conteúdo aprovado."
  - **`## Fluxo`:** parse → ler narrativa ativa → briefing inline → copy de e-mail inline (tom de carta de mentor, via `templates/email.md`) → ⏸ revisão → `revisor-brand` gate → entregar + write-back `--canal email`.
  - Sem deep research por padrão (e-mail é relacional, não informacional) — mas permitir disparar `/pesquisar-tema` se o ângulo pedir.

- [ ] **Step 2: Verificar e commitar**
```bash
grep -q "name: novo-email" .claude/skills/novo-email/SKILL.md && echo OK
git add .claude/skills/novo-email
git commit -m "feat(skills): cria /novo-email (lendo narrativa ativa + write-back)"
```

### Task 4.4: Skill `/novo-comunidade`

**Files:** Create `.claude/skills/novo-comunidade/SKILL.md`.

- [ ] **Step 1: Escrever a skill** — a mais leve:
  - **Frontmatter:** `name: novo-comunidade`; `description:` "Produz uma mensagem para a comunidade (WhatsApp) lendo a narrativa ativa — conversa, não broadcast de marketing. Output em `export/conteudos/comunidade/<slug>/mensagem.md`. Gate `revisor-brand`; write-back (canal=comunidade). Disparo real é etapa futura."
  - **`## Fluxo`:** parse → ler narrativa ativa → mensagem inline (via `templates/comunidade.md`, tom de quem está no grupo, não vendendo) → ⏸ revisão → `revisor-brand` gate → entregar + write-back `--canal comunidade`.

- [ ] **Step 2: Verificar e commitar**
```bash
grep -q "name: novo-comunidade" .claude/skills/novo-comunidade/SKILL.md && echo OK
git add .claude/skills/novo-comunidade
git commit -m "feat(skills): cria /novo-comunidade (mensagem de comunidade + write-back)"
```

### Task 4.5: Atualizar CLAUDE.md + nota no schema

**Files:** Modify `CLAUDE.md`, `memory/_schema.md`.

- [ ] **Step 1: CLAUDE.md** — adicionar `/novo-artigo`, `/novo-email`, `/novo-comunidade` ao roster de skills. Atualizar qualquer texto "post-cêntrico" que diga que o sistema só produz Instagram → produção multicanal (Instagram, blog, e-mail, comunidade), todos lendo a narrativa ativa.

- [ ] **Step 2: `memory/_schema.md`** — na descrição de `narrativas/livro-razao` (ou onde o write-back é mencionado), notar que o livro-razão recebe write-back de **múltiplos canais** (`instagram`, `blog`, `email`, `comunidade`) via `append_livro_razao.js --canal`.

- [ ] **Step 3: Verificar e commitar**
```bash
grep -q "novo-artigo" CLAUDE.md && grep -q "novo-email" CLAUDE.md && echo OK
git add CLAUDE.md memory/_schema.md
git commit -m "docs: roster multicanal (novo-artigo/email/comunidade); schema nota write-back multicanal"
```

### Task 4.6: Verificação final + demonstração de sinergia

- [ ] **Step 1: Artefatos existem**
```bash
for s in novo-artigo novo-email novo-comunidade; do test -f .claude/skills/$s/SKILL.md || echo "FALTA $s"; done
for t in artigo email comunidade; do test -f templates/$t.md || echo "FALTA template $t"; done
echo "checagem feita"
```

- [ ] **Step 2: Cada skill lê narrativa + dá write-back** (dry-run de leitura)
```bash
for s in novo-artigo novo-email novo-comunidade; do
  echo "== $s =="
  grep -q "memory/narrativas/ativas.md" .claude/skills/$s/SKILL.md && echo "lê narrativa OK" || echo "NÃO lê narrativa"
  grep -q "append_livro_razao" .claude/skills/$s/SKILL.md && echo "write-back OK" || echo "SEM write-back"
done
```
Expected: as 3 leem narrativa e dão write-back.

- [ ] **Step 3: Coerência de canal único** — cada skill usa `--canal` correto (blog/email/comunidade), não `instagram`.
```bash
grep -h "append_livro_razao" .claude/skills/{novo-artigo,novo-email,novo-comunidade}/SKILL.md | grep -oE "\-\-canal [a-z]+"
```
Expected: `--canal blog`, `--canal email`, `--canal comunidade`.

---

## Self-review (cobertura vs spec)

- §7 Onda 4 ("`/novo-artigo`, `/novo-email`, prompts de comunidade — reusando copy/design inline + lendo narrativas ativas") → Tasks 4.2, 4.3, 4.4 ✓
- §1.4 (sinergia: vários canais, uma narrativa, ninguém coordena) → as 3 skills leem a mesma `ativas.md` + escrevem o mesmo livro-razão ✓
- §3.4/§6.1 (copy função única, canal via parâmetro; não agente por canal) → copy inline em cada skill ✓
- §7 critério ("uma narrativa ativa gera peças coerentes em ≥2 canais") → Task 4.6 ✓

## Decisões resolvidas / diferidas

- **Blog produz draft MDX**, não publica no site (não há blog; é GSD do site). Diferido: integração MDX→site.
- **Envio real diferido** (Resend/WhatsApp) — §9. As skills entregam conteúdo aprovado; disparo é Onda 5+.
- **Sem agente de copy por canal** — copy inline em cada skill (regra de corpo).
