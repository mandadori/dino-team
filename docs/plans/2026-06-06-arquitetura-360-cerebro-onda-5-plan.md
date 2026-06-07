# Arquitetura 360 + Cérebro de Marca — Plano de Implementação (Onda 5)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development ou executing-plans. Passos com checkbox (`- [ ]`).

**Goal:** **Primeira automação segura.** O sistema ganha (1) um **mapa único de governança** — quais decisões se auto-aplicam e quais escalam pro humano, consolidando os flags `automatável/humano` que hoje vivem espalhados no spec; (2) **cron** para as funções estratégicas/de-captura (`/ciclo-de-direcao`, `/pesquisar-mercado`), além da pauta que já roda; (3) a confirmação determinística de que a **política de publicação bloqueia corretamente** uma publicação sensível. O critério de conclusão: *o sistema reage sem slash command e a política barra uma publicação corretamente.*

**Architecture:** A governança é **propriedade de cada decisão** (spec §4.5), não um portão central. A Onda 5 a torna **legível num lugar**: `orquestracao/governanca.yaml` enumera cada função do roster (§3.2–§3.6) com seu flag de autonomia e a referência à política específica quando há (ex.: publicação → `publicacao.yaml`). O cron é declarado em `rotas.yaml` + handler em `site/app/api/cron/<id>/route.ts` + entrada em `site/vercel.json` (padrão já estabelecido pela rota da pauta). **Honestidade de runtime:** os handlers de cron, como o da pauta já documenta, **validam e registram o trigger** mas não executam a skill (serverless não tem o repo com acesso de escrita); a execução real é delegada a um runner com o repo — wiring de runner fica fora desta onda (declarado).

**Tech Stack:** YAML (governança, rotas, vercel), TypeScript (route handlers Next.js, espelhando o handler existente), Markdown (docs). "Testes" = `grep`/`ls`, `npx tsc --noEmit` no `site/`, e um **validador determinístico** da política (dado um artefato, qual `modo` a regra resolve).

**Spec de origem:** `docs/specs/2026-06-06-arquitetura-360-cerebro-de-marca-design.md` (Onda 5 em §7; governança §4.5; flags por decisão §3.2–§3.6).

---

## ⚠ Onde executar este plano

- Execute **neste worktree** — já contém `dino-studio-editor` + Ondas 1-4. **Depende da Onda 4** apenas para listar os canais novos na governança (se a O4 não estiver feita, liste só os canais existentes; não bloqueia).
- **Toca o site (TypeScript).** Rode `npx tsc --noEmit` em `site/` ao fim (Task 5.5) — não precisa de `npm run build` completo.

## Refinamentos sobre o spec (descobertos ao mapear o código)

1. **`publicacao.yaml` NÃO morreu — é a política de publicação viva.** O spec §4.5 dizia "aposenta-se o artefato atual" prevendo que não havia automação. Mas o artefato **já é lido** por `/novo-post` Passo 16, `/lote-posts`, `site/lib/dashboard/readers.ts` e `site/app/api/skills/dispatch/route.ts`. Refinamento (mesma lógica da Onda 1 com `politicas`): **não aposentar**; `publicacao.yaml` continua sendo a política **específica de publicação**. A Onda 5 cria `governanca.yaml` como o **mapa amplo de autonomia por decisão** que, no item publicação, **aponta para** `publicacao.yaml`. Consolidação ≠ exclusão.
2. **Handler de cron não executa a skill (por design).** O handler da pauta (`site/app/api/cron/planejar-pauta-semanal/route.ts`) documenta honestamente: serverless valida o trigger, mas a execução real precisa de runtime com o repo. Os handlers novos seguem **o mesmo padrão** (validam auth + registram + `executed: false`). Ligar o runner real (GitHub Action / Claude Code remoto) é declarado, fora desta onda.
3. **Publicação real está bloqueada por credenciais.** O critério "1ª publicação real gated por política" tem duas metades: (a) **a política classifica corretamente** (determinístico, executável agora) e (b) **a publicação acontece de fato** (precisa de credenciais IG — runtime, bloqueado). A Onda 5 entrega (a) com um validador testável e marca (b) como pendência de runtime. Não fabricar credencial nem publicar de mentira.

## Mapa de arquivos

**Criam-se:**
- `orquestracao/governanca.yaml` (mapa de autonomia por decisão)
- `site/app/api/cron/ciclo-de-direcao/route.ts`
- `site/app/api/cron/pesquisar-mercado/route.ts`
- `scripts/orquestracao/avaliar_politica.js` (validador determinístico da política de publicação)

**Modificam-se:**
- `orquestracao/rotas.yaml` (+ rotas ciclo-de-direcao, pesquisar-mercado)
- `site/vercel.json` (+ 2 crons)
- `orquestracao/README.md` (governanca.yaml no índice; nota sobre runner)
- `CLAUDE.md` (seção Orquestração: governanca.yaml + crons novos)

**Lê-se (modelo):** `site/app/api/cron/planejar-pauta-semanal/route.ts`, `orquestracao/politicas/publicacao.yaml`, `orquestracao/rotas.yaml`.

---

# ONDA 5 — Governança + automação

**Resultado testável ao fim:** `governanca.yaml` enumera as decisões do roster com flag de autonomia; `rotas.yaml`+`vercel.json` declaram cron para ciclo de direção e pesquisa de mercado; `avaliar_politica.js` prova que a política barra um post sensível (`aprovacao_humana`) e libera um educacional (`automatico`); `site/` continua tipando.

### Task 5.1: `orquestracao/governanca.yaml` — mapa de autonomia por decisão

Consolida os flags `automatável/humano` do roster (spec §3.2–§3.6) num arquivo legível.

**Files:** Create `orquestracao/governanca.yaml`. Read: `docs/specs/2026-06-06-...-design.md` §3.2–§3.6.

- [ ] **Step 1: Escrever o YAML** enumerando cada decisão do roster com: `funcao`, `decisao`, `autonomia` (`automatico` | `humano` | `automatico_com_revisao`), `corpo` (agente/skill/script), e `politica` (referência a `publicacao.yaml` quando for publicação). Conteúdo (derivar do spec, estes são os essenciais):

````yaml
# Governança — mapa de autonomia por decisão (Dino Team)
# "A governança é propriedade de cada decisão" (spec §4.5).
# Este arquivo CONSOLIDA os flags; políticas específicas (ex: publicação) vivem em arquivos próprios.
# Versão: 1
versao: 1

decisoes:
  - funcao: direcao-narrativa
    decisao: "ativar/aposentar arco, crença-alvo, saturação"
    autonomia: automatico_com_revisao   # detectar saturação/propor = auto; VIRAR narrativa = humano
    virada_escala_humano: true
    corpo: "agente estrategista-narrativa + /ciclo-de-direcao"
  - funcao: planejamento-pauta
    decisao: "o que produzir na janela, p/ qual narrativa"
    autonomia: automatico_com_revisao
    corpo: "/planejar-pauta-semanal"
  - funcao: pesquisa-mercado
    decisao: "o que no nicho importa"
    autonomia: automatico                # cron + demanda
    corpo: "agente pesquisador-mercado + /pesquisar-mercado"
  - funcao: producao-conteudo
    decisao: "produzir a peça no canal X"
    autonomia: humano                    # gate de marca sempre; publicação ver politica
    corpo: "/novo-post, /novo-artigo, /novo-email, /novo-comunidade"
    politica: orquestracao/politicas/publicacao.yaml
  - funcao: publicacao
    decisao: "publicar o artefato pronto"
    autonomia: ver_politica
    politica: orquestracao/politicas/publicacao.yaml
  - funcao: guarda-marca-compliance
    decisao: "dentro da identidade + compliance"
    autonomia: automatico                # gate determinístico (aprovado/reprovado)
    corpo: "agente revisor-brand"
  - funcao: coerencia-narrativa
    decisao: "fortalece ou enfraquece o posicionamento"
    autonomia: automatico                # flag; ação humana só se 'contradiz'
    corpo: "estrategista-narrativa (check na pauta)"
  - funcao: aprimoramento-branding
    decisao: "o brand book precisa evoluir"
    autonomia: humano
    corpo: "/brand-discovery, /afinar-tom-de-voz + revisor-brand"
  - funcao: aprendizado-performance
    decisao: "o que performou/saturou"
    autonomia: automatico
    corpo: "agente analista-performance"
  - funcao: sinais-produto      # Onda 6 — declarado
    decisao: "o que o aluno trava/pergunta/conquista vira dor/objeção/prova"
    autonomia: humano
    corpo: "/sinal-consultoria (Onda 6)"

# Regra-mãe (nunca relaxar): publicar como fallback de timeout é PROIBIDO (ver publicacao.yaml).
````

- [ ] **Step 2: Verificar e commitar**
```bash
grep -q "virada_escala_humano" orquestracao/governanca.yaml && grep -q "publicacao.yaml" orquestracao/governanca.yaml && echo OK
git add orquestracao/governanca.yaml
git commit -m "feat(orquestracao): governanca.yaml — mapa de autonomia por decisao (consolida flags)"
```

### Task 5.2: Validador determinístico da política de publicação

Prova o critério "a política barra a publicação corretamente" sem precisar publicar.

**Files:** Create `scripts/orquestracao/avaliar_politica.js`. Read: `orquestracao/politicas/publicacao.yaml`.

- [ ] **Step 1: Escrever o script** — carrega `publicacao.yaml`, recebe um artefato via flags (`--canal`, `--pilar`, `--texto "<copy>"`, opcional `--orcamento`), avalia as `regras` na ordem (primeira que casa decide; senão `defaults.modo`), e imprime o `modo` resolvido + `id` da regra + motivo. Implementar a avaliação das condições suportadas: igualdade de canal, `pilar in [...]`, `contem_termo(<t>)` (varre `--texto`), comparação de orçamento. Sem dependência externa além de um parser YAML simples (pode usar regex/linha-a-linha para o formato conhecido, ou `js-yaml` se já estiver nas deps do repo — checar `package.json`; se não, parser mínimo).
  - Saída: JSON `{ modo, regra, motivo }`, exit 0. Erro de carregamento → exit 1.

- [ ] **Step 2: Testar os dois cenários do critério**
```bash
echo "== educacional (espera automatico) =="
node scripts/orquestracao/avaliar_politica.js --canal instagram --pilar educacional --texto "como organizar a semana de treino"
echo "== termo sensível (espera aprovacao_humana) =="
node scripts/orquestracao/avaliar_politica.js --canal instagram --pilar educacional --texto "esse suplemento acelera o ganho"
```
Expected: 1º → `modo: automatico` (regra `instagram-educacional-automatico`); 2º → `modo: aprovacao_humana` (regra `termos-sensiveis`, motivo compliance). **A política barra o sensível corretamente.**

- [ ] **Step 3: Commitar**
```bash
git add scripts/orquestracao/avaliar_politica.js
git commit -m "feat(orquestracao): avaliar_politica.js — valida que a politica barra publicacao sensivel"
```

### Task 5.3: Cron de `/ciclo-de-direcao` e `/pesquisar-mercado`

**Files:** Modify `orquestracao/rotas.yaml`, `site/vercel.json`. Create `site/app/api/cron/ciclo-de-direcao/route.ts`, `site/app/api/cron/pesquisar-mercado/route.ts`.

- [ ] **Step 1: `rotas.yaml`** — adicionar 2 rotas (não deletar a existente):
  - `id: ciclo-de-direcao-cron` — cron mensal (ex.: `0 9 1 * *`, dia 1 às 9h), skill `/ciclo-de-direcao`, notificação dashboard, `ativa: true`.
  - `id: pesquisar-mercado-cron` — cron mensal (ex.: `0 8 1 * *`), skill `/pesquisar-mercado`, args `{ mes: "auto" }`, `ativa: true`.

- [ ] **Step 2: Route handlers** — criar os 2 arquivos **espelhando** `site/app/api/cron/planejar-pauta-semanal/route.ts` (auth via `CRON_SECRET`, checa `CLAUDE_API_KEY`, `executed: false`, nota de delegação a runner). Trocar `skill`/`args` conforme a rota.

- [ ] **Step 3: `site/vercel.json`** — adicionar 2 entradas em `crons` apontando para os novos paths, com os schedules das rotas.

- [ ] **Step 4: Verificar e commitar**
```bash
grep -q "ciclo-de-direcao-cron" orquestracao/rotas.yaml && grep -q "pesquisar-mercado-cron" orquestracao/rotas.yaml && echo "rotas OK"
test -f site/app/api/cron/ciclo-de-direcao/route.ts && test -f site/app/api/cron/pesquisar-mercado/route.ts && echo "handlers OK"
grep -q "ciclo-de-direcao" site/vercel.json && echo "vercel OK"
git add orquestracao/rotas.yaml site/vercel.json site/app/api/cron/ciclo-de-direcao site/app/api/cron/pesquisar-mercado
git commit -m "feat(orquestracao): cron de /ciclo-de-direcao e /pesquisar-mercado (rotas + handlers + vercel)"
```

### Task 5.4: Atualizar docs (README de orquestração + CLAUDE.md)

**Files:** Modify `orquestracao/README.md`, `CLAUDE.md`.

- [ ] **Step 1: `orquestracao/README.md`** — adicionar `governanca.yaml` ao índice/estrutura; nota de que `publicacao.yaml` é a política específica referenciada pela governança; listar as 3 rotas cron ativas.

- [ ] **Step 2: `CLAUDE.md`** — seção "Orquestração + Dashboard": mencionar `governanca.yaml` (mapa de autonomia), as rotas cron novas, e o validador `avaliar_politica.js`. Atualizar "v1 com 1 rota" → 3 rotas.

- [ ] **Step 3: Verificar e commitar**
```bash
grep -q "governanca.yaml" orquestracao/README.md && grep -q "governanca" CLAUDE.md && echo OK
git add orquestracao/README.md CLAUDE.md
git commit -m "docs: governanca.yaml + crons no README de orquestracao e no CLAUDE"
```

### Task 5.5: Verificação final da Onda 5

- [ ] **Step 1: Artefatos**
```bash
test -f orquestracao/governanca.yaml && test -f scripts/orquestracao/avaliar_politica.js \
  && test -f site/app/api/cron/ciclo-de-direcao/route.ts && test -f site/app/api/cron/pesquisar-mercado/route.ts && echo OK
```
- [ ] **Step 2: Política barra o sensível** — re-rodar Task 5.2 Step 2; confirmar `aprovacao_humana` no termo sensível e `automatico` no educacional.
- [ ] **Step 3: Site ainda tipa**
```bash
cd site && npx tsc --noEmit 2>&1 | tail -15; cd ..
```
Expected: sem erro novo nos handlers criados.
- [ ] **Step 4: Cron declarado de ponta a ponta** — cada rota cron nova tem entrada em `rotas.yaml` **e** handler **e** entrada em `vercel.json`.

---

## Self-review (cobertura vs spec)

- §7 Onda 5 ("consolidar flags num arquivo de governança; ligar cron direção+pauta; 1ª publicação gated") → Tasks 5.1 (flags), 5.3 (cron), 5.2 (gate determinístico) ✓
- §4.5 (governança = propriedade de cada decisão; consolidar num arquivo quando 1ª automação ligar) → `governanca.yaml` ✓
- §7 critério ("reage sem slash command; política bloqueia 1 publicação corretamente") → cron (reação sem comando, com a ressalva honesta do runner) + `avaliar_politica.js` (bloqueio correto) ✓

## Decisões resolvidas / diferidas

- **`publicacao.yaml` mantido** (não aposentado) — é a política específica referenciada por `governanca.yaml`.
- **Handler de cron não executa a skill** — segue o padrão honesto da rota da pauta; runner real (GitHub Action/Claude remoto) declarado, fora da onda.
- **Publicação IG real** bloqueada por credenciais (runtime) — entregue a metade determinística (a política classifica certo); a publicação de fato é pendência de runtime, não fabricada.
