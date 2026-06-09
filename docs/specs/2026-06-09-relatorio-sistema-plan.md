# Relatório autoconsciente do brand OS — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir uma skill `/relatorio-sistema` que gera, periodicamente, um relatório onde o brand OS narra a si mesmo em três camadas (prestação de contas, inteligência, direção) + autojulgamento da própria arquitetura, com fatos por script (sem alucinação) e opinião por agente (aterrada em evidência).

**Architecture:** Quatro componentes + um run-ledger. Um **script determinístico** (`coletar.js`) extrai os fatos do período; **agentes de domínio existentes** resumem seus slices; um **agente novo** (`arquiteto-sistema`) faz o autojulgamento; a **skill** (`/relatorio-sistema`) orquestra e tece o documento. Um **run-ledger leve** (`registrar_execucao.js` → `execucoes.jsonl`) dá fonte real às tarefas/falhas. Dois níveis de profundidade: pulso semanal (só script) e mensal profundo (script + agentes).

**Tech Stack:** Node 20+ ESM, `node:test`, `node:assert/strict`. Sem deps novas. Agentes e skills são markdown com frontmatter (padrão Claude Code do projeto).

**Spec:** `docs/specs/2026-06-09-relatorio-sistema-design.md`

**Base:** branch `worktree-relatorio-sistema`, rebasada sobre `dino-studio-editor` (`3e9bcce`). Todo o trabalho recente (biblioteca/produto/scripts) está presente.

---

## File Structure

**Criar:**
- `scripts/orquestracao/registrar_execucao.js` — escritor append-only do run-ledger.
- `scripts/orquestracao/registrar_execucao.test.js` — testes.
- `scripts/relatorio/coletar.js` — coletor de fatos (parsers puros + orquestração + CLI).
- `scripts/relatorio/coletar.test.js` — testes dos parsers puros.
- `scripts/relatorio/render_pulso.js` — renderiza o pulso semanal a partir do JSON de fatos.
- `scripts/relatorio/render_pulso.test.js` — testes.
- `.claude/agents/arquiteto-sistema.md` — contrato do agente meta-arquiteto.
- `.claude/skills/relatorio-sistema/SKILL.md` — orquestração da skill.
- `relatorios/.gitkeep` — ancora a pasta de saída.

**Modificar:**
- `package.json` — adicionar `scripts/relatorio/*.test.js` ao script `test`.
- `.gitignore` (raiz) — ignorar `relatorios/**/.fatos.json`.
- `orquestracao/rotas.yaml` — 2 rotas novas.
- `orquestracao/governanca.yaml` — 1 função nova.
- `docs/automacao/routines.md` — 2 routines novas.
- `CLAUDE.md` — roster 12→13, lista de skills, estrutura de pastas, seção de orquestração.
- `.claude/skills/pesquisar-mercado/SKILL.md`, `.claude/skills/planejar-pauta-semanal/SKILL.md`, `.claude/skills/novo-post/SKILL.md`, `.claude/skills/evoluir-produto/SKILL.md` — passo final de registro no run-ledger.

---

## Task 1: Run-ledger writer (`registrar_execucao.js`)

**Files:**
- Create: `scripts/orquestracao/registrar_execucao.js`
- Test: `scripts/orquestracao/registrar_execucao.test.js`

- [ ] **Step 1: Write the failing test**

Create `scripts/orquestracao/registrar_execucao.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { registrarExecucao, parseArgs } from "./registrar_execucao.js";

function tmpLedger() {
  return join(mkdtempSync(join(tmpdir(), "exec-")), "execucoes.jsonl");
}

test("registrarExecucao cria o arquivo se ausente e anexa uma linha JSON válida", () => {
  const path = tmpLedger();
  assert.equal(existsSync(path), false);
  const obj = registrarExecucao({
    skill: "pesquisar-mercado", modo: "auto", resultado: "ok",
    ts: "2026-06-09T12:00:00.000Z", path,
  });
  const linhas = readFileSync(path, "utf8").trim().split("\n");
  assert.equal(linhas.length, 1);
  const parsed = JSON.parse(linhas[0]);
  assert.equal(parsed.skill, "pesquisar-mercado");
  assert.equal(parsed.modo, "auto");
  assert.equal(parsed.resultado, "ok");
  assert.equal(parsed.slug, null);
  assert.equal(parsed.nota, null);
  assert.equal(parsed.ts, "2026-06-09T12:00:00.000Z");
  assert.equal(obj.skill, "pesquisar-mercado");
});

test("registrarExecucao é append-only (não reescreve linhas)", () => {
  const path = tmpLedger();
  registrarExecucao({ skill: "a", modo: "auto", resultado: "ok", ts: "2026-06-09T12:00:00.000Z", path });
  registrarExecucao({ skill: "b", modo: "manual", resultado: "falha", nota: "timeout", ts: "2026-06-09T13:00:00.000Z", path });
  const linhas = readFileSync(path, "utf8").trim().split("\n");
  assert.equal(linhas.length, 2);
  assert.equal(JSON.parse(linhas[1]).nota, "timeout");
});

test("registrarExecucao rejeita resultado inválido", () => {
  const path = tmpLedger();
  assert.throws(() => registrarExecucao({ skill: "a", modo: "auto", resultado: "talvez", path }), /resultado/);
});

test("parseArgs extrai flags --skill --modo --resultado --slug --nota", () => {
  const a = parseArgs(["--skill", "novo-post", "--modo", "auto", "--resultado", "ok", "--slug", "x-y", "--nota", "ok feito"]);
  assert.equal(a.skill, "novo-post");
  assert.equal(a.slug, "x-y");
  assert.equal(a.nota, "ok feito");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/orquestracao/registrar_execucao.test.js`
Expected: FAIL — `Cannot find module './registrar_execucao.js'`.

- [ ] **Step 3: Write minimal implementation**

Create `scripts/orquestracao/registrar_execucao.js`:

```js
#!/usr/bin/env node
/**
 * registrar_execucao.js — run-ledger append-only das routines autônomas.
 *
 * Uma linha JSON por execução de skill autônoma. Fonte da seção
 * "tarefas executadas & falhas" do relatório (coletar.js lê este arquivo).
 *
 * Uso:
 *   node scripts/orquestracao/registrar_execucao.js \
 *     --skill <nome> --modo <auto|manual> --resultado <ok|falha> \
 *     [--slug <slug>] [--nota <texto>]
 *
 * Override de caminho (testes): EXECUCOES_PATH=/tmp/x.jsonl
 *
 * Contrato:
 * - Append-only; cria o arquivo se ausente.
 * - `resultado` ∈ {ok, falha}; `modo` ∈ {auto, manual}.
 * - slug/nota default null. ts default new Date().toISOString().
 * - Saída: imprime a linha anexada; exit 0. Uso + exit 1 se arg faltar/inválido.
 */
import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const LEDGER_DEFAULT = "orquestracao/execucoes.jsonl";

export function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 2) {
    const k = argv[i];
    if (!k || !k.startsWith("--")) continue;
    out[k.slice(2)] = argv[i + 1];
  }
  return out;
}

export function registrarExecucao({ skill, modo, resultado, slug = null, nota = null, ts, path }) {
  if (!skill) throw new Error("registrar_execucao: --skill obrigatório");
  if (modo !== "auto" && modo !== "manual") throw new Error("registrar_execucao: --modo deve ser auto|manual");
  if (resultado !== "ok" && resultado !== "falha") throw new Error("registrar_execucao: --resultado deve ser ok|falha");
  const destino = resolve(path || process.env.EXECUCOES_PATH || LEDGER_DEFAULT);
  const obj = { ts: ts || new Date().toISOString(), skill, modo, resultado, slug: slug ?? null, nota: nota ?? null };
  if (!existsSync(dirname(destino))) mkdirSync(dirname(destino), { recursive: true });
  appendFileSync(destino, JSON.stringify(obj) + "\n", "utf8");
  return obj;
}

function main() {
  const a = parseArgs(process.argv.slice(2));
  try {
    const obj = registrarExecucao({ skill: a.skill, modo: a.modo, resultado: a.resultado, slug: a.slug ?? null, nota: a.nota ?? null });
    console.log(JSON.stringify(obj));
  } catch (e) {
    console.error(String(e.message || e));
    console.error("\nUso: node scripts/orquestracao/registrar_execucao.js --skill <nome> --modo <auto|manual> --resultado <ok|falha> [--slug <slug>] [--nota <texto>]");
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/orquestracao/registrar_execucao.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/orquestracao/registrar_execucao.js scripts/orquestracao/registrar_execucao.test.js
git commit -m "feat(relatorio): run-ledger writer registrar_execucao.js"
```

---

## Task 2: Coletor de fatos — parsers puros (`coletar.js`)

Quatro funções puras testáveis com strings de fixture. A orquestração (git + leitura de arquivos) vem na Task 3.

**Files:**
- Create: `scripts/relatorio/coletar.js`
- Test: `scripts/relatorio/coletar.test.js`

- [ ] **Step 1: Write the failing test**

Create `scripts/relatorio/coletar.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { groupCommits, contarSaturacao, parseExecucoes, sliceStaleness } from "./coletar.js";

test("groupCommits classifica por tipo conventional-commit", () => {
  const raw = [
    "abc123\tfeat(biblioteca): nova ficha",
    "def456\tfix(editor): freeze bug",
    "ghi789\tdocs(spec): plano",
    "jkl000\tpost carrossel sem prefixo",
  ].join("\n");
  const g = groupCommits(raw);
  assert.equal(g.length, 4);
  assert.equal(g[0].tipo, "feat");
  assert.equal(g[0].escopo, "biblioteca");
  assert.equal(g[0].assunto, "nova ficha");
  assert.equal(g[1].tipo, "fix");
  assert.equal(g[2].tipo, "docs");
  assert.equal(g[3].tipo, "outro");
  assert.equal(g[3].escopo, null);
});

test("groupCommits trata entrada vazia (cold start)", () => {
  assert.deepEqual(groupCommits(""), []);
  assert.deepEqual(groupCommits("\n  \n"), []);
});

test("contarSaturacao conta por verdade e por ângulo na janela", () => {
  const md = `| slug | data | canal | ângulo | verdade | pilar | descanso |
|---|---|---|---|---|---|---|
| post-a | 2026-06-02 | instagram | macro-certo | consistencia | nutricao | 21d |
| post-b | 2026-06-04 | blog | macro-certo | consistencia | nutricao | 21d |
| post-c | 2026-05-01 | instagram | zero-absoluto | identidade | mentalidade | 21d |
`;
  const s = contarSaturacao(md, { inicio: "2026-06-01", fim: "2026-06-30", hoje: "2026-06-09" });
  assert.equal(s.porVerdade.consistencia, 2);
  assert.equal(s.porVerdade.identidade, undefined); // fora da janela
  assert.equal(s.porAngulo["macro-certo"], 2);
  // post-b 2026-06-04 + 21d = 2026-06-25 > hoje → em descanso
  assert.ok(s.emDescanso.some((d) => d.angulo === "macro-certo"));
});

test("contarSaturacao com tabela vazia retorna contagens vazias", () => {
  const md = `| slug | data | canal | ângulo | verdade | pilar | descanso |
|---|---|---|---|---|---|---|
`;
  const s = contarSaturacao(md, { inicio: "2026-06-01", fim: "2026-06-30", hoje: "2026-06-09" });
  assert.deepEqual(s.porVerdade, {});
  assert.deepEqual(s.emDescanso, []);
});

test("parseExecucoes agrega ok/falha por skill na janela", () => {
  const jsonl = [
    JSON.stringify({ ts: "2026-06-02T10:00:00.000Z", skill: "pesquisar-mercado", modo: "auto", resultado: "ok" }),
    JSON.stringify({ ts: "2026-06-03T10:00:00.000Z", skill: "novo-post", modo: "auto", resultado: "ok" }),
    JSON.stringify({ ts: "2026-06-03T11:00:00.000Z", skill: "novo-post", modo: "auto", resultado: "falha" }),
    JSON.stringify({ ts: "2026-05-20T10:00:00.000Z", skill: "novo-post", modo: "auto", resultado: "ok" }), // fora
  ].join("\n");
  const e = parseExecucoes(jsonl, { inicio: "2026-06-01", fim: "2026-06-30" });
  assert.equal(e.porSkill["novo-post"].ok, 1);
  assert.equal(e.porSkill["novo-post"].falha, 1);
  assert.equal(e.porSkill["pesquisar-mercado"].ok, 1);
  assert.equal(e.totalFalhas, 1);
});

test("parseExecucoes ignora linhas malformadas e vazio", () => {
  const e = parseExecucoes("não é json\n\n", { inicio: "2026-06-01", fim: "2026-06-30" });
  assert.deepEqual(e.porSkill, {});
  assert.equal(e.totalFalhas, 0);
});

test("sliceStaleness calcula dias desde ultima_atualizacao", () => {
  const r = sliceStaleness([
    { slice: "mercado", ultima: "2026-06-01" },
    { slice: "ramon", ultima: "2026-04-01" },
  ], "2026-06-09");
  const mercado = r.find((x) => x.slice === "mercado");
  const ramon = r.find((x) => x.slice === "ramon");
  assert.equal(mercado.diasStale, 8);
  assert.equal(ramon.diasStale, 69);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/relatorio/coletar.test.js`
Expected: FAIL — `Cannot find module './coletar.js'`.

- [ ] **Step 3: Write minimal implementation (parsers puros)**

Create `scripts/relatorio/coletar.js` (só os parsers puros por enquanto; orquestração na Task 3):

```js
#!/usr/bin/env node
/**
 * coletar.js — coletor determinístico de fatos do período para o relatório.
 *
 * Parsers puros (testáveis com strings) + orquestração (git + arquivos) + CLI.
 * NÃO usa LLM. Os números do relatório saem daqui → sem alucinação.
 *
 * Uso:
 *   node scripts/relatorio/coletar.js --periodo <YYYY-MM | YYYY-Www>
 * Saída: JSON de fatos em stdout.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";

// ── Parsers puros ────────────────────────────────────────────────────────────

const TIPOS = new Set(["feat", "fix", "docs", "chore", "refactor", "test", "content"]);

export function groupCommits(raw) {
  if (!raw || !raw.trim()) return [];
  return raw.split("\n").map((l) => l.trim()).filter(Boolean).map((linha) => {
    const tab = linha.indexOf("\t");
    const hash = tab >= 0 ? linha.slice(0, tab) : "";
    const assuntoFull = tab >= 0 ? linha.slice(tab + 1) : linha;
    const m = assuntoFull.match(/^(\w+)(?:\(([^)]+)\))?:\s*(.*)$/);
    if (m && TIPOS.has(m[1])) {
      return { hash, tipo: m[1], escopo: m[2] ?? null, assunto: m[3] };
    }
    return { hash, tipo: "outro", escopo: null, assunto: assuntoFull };
  });
}

function descansoParaDias(d) {
  if (!d) return 0;
  const m = String(d).trim().match(/^(\d+)\s*(d|sem|mes|m)?$/i);
  if (!m) return 0;
  const n = Number(m[1]);
  const u = (m[2] || "d").toLowerCase();
  if (u === "sem") return n * 7;
  if (u === "mes" || u === "m") return n * 30;
  return n;
}

function parseTabela(md) {
  // Retorna linhas da tabela markdown como arrays de células (trim), pulando cabeçalho e separador.
  const linhas = md.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("|"));
  const corpo = linhas.filter((l) => !/^\|[\s|:-]+\|$/.test(l)); // remove separador ---
  // primeira linha restante é o cabeçalho
  return corpo.slice(1).map((l) => l.split("|").slice(1, -1).map((c) => c.trim()));
}

export function contarSaturacao(md, { inicio, fim, hoje }) {
  const porVerdade = {};
  const porAngulo = {};
  const emDescanso = [];
  for (const cels of parseTabela(md)) {
    const [slug, data, , angulo, verdade, , descanso] = cels;
    if (!data) continue;
    if (data >= inicio && data <= fim) {
      if (verdade) porVerdade[verdade] = (porVerdade[verdade] || 0) + 1;
      if (angulo) porAngulo[angulo] = (porAngulo[angulo] || 0) + 1;
    }
    const fimDescanso = new Date(new Date(data).getTime() + descansoParaDias(descanso) * 86400000)
      .toISOString().slice(0, 10);
    if (fimDescanso > hoje) emDescanso.push({ slug, angulo, ate: fimDescanso });
  }
  return { porVerdade, porAngulo, emDescanso };
}

export function parseExecucoes(jsonl, { inicio, fim }) {
  const porSkill = {};
  let totalFalhas = 0;
  for (const linha of (jsonl || "").split("\n")) {
    const t = linha.trim();
    if (!t) continue;
    let o;
    try { o = JSON.parse(t); } catch { continue; }
    const dia = (o.ts || "").slice(0, 10);
    if (!dia || dia < inicio || dia > fim) continue;
    porSkill[o.skill] = porSkill[o.skill] || { ok: 0, falha: 0 };
    if (o.resultado === "falha") { porSkill[o.skill].falha++; totalFalhas++; }
    else porSkill[o.skill].ok++;
  }
  return { porSkill, totalFalhas };
}

export function sliceStaleness(entries, hoje) {
  const base = new Date(hoje).getTime();
  return entries.map(({ slice, ultima }) => ({
    slice,
    ultima: ultima || null,
    diasStale: ultima ? Math.round((base - new Date(ultima).getTime()) / 86400000) : null,
  }));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/relatorio/coletar.test.js`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/relatorio/coletar.js scripts/relatorio/coletar.test.js
git commit -m "feat(relatorio): parsers puros do coletor de fatos (commits, saturação, execuções, staleness)"
```

---

## Task 3: Coletor de fatos — orquestração + CLI (`coletar.js`)

Adiciona a função `coletar()` que combina git + arquivos, e o entry CLI. Cobertura por smoke no repo real (não unit, pois depende de git/FS).

**Files:**
- Modify: `scripts/relatorio/coletar.js` (acrescentar ao fim, antes do CLI guard)

- [ ] **Step 1: Adicionar `coletar()` + helpers de período + CLI**

Acrescente a `scripts/relatorio/coletar.js` (após `sliceStaleness`):

```js
// ── Período ──────────────────────────────────────────────────────────────────

export function intervaloDoPeriodo(periodo) {
  // YYYY-MM → mês inteiro. YYYY-Www → semana ISO. Retorna {inicio, fim} YYYY-MM-DD.
  const mes = periodo.match(/^(\d{4})-(\d{2})$/);
  if (mes) {
    const [, y, m] = mes;
    const inicio = `${y}-${m}-01`;
    const fimDate = new Date(Number(y), Number(m), 0); // último dia do mês
    const fim = `${y}-${m}-${String(fimDate.getDate()).padStart(2, "0")}`;
    return { inicio, fim };
  }
  const sem = periodo.match(/^(\d{4})-W(\d{2})$/);
  if (sem) {
    const [, y, w] = sem;
    const jan4 = new Date(Date.UTC(Number(y), 0, 4));
    const dia = jan4.getUTCDay() || 7;
    const semana1Seg = new Date(jan4); semana1Seg.setUTCDate(jan4.getUTCDate() - dia + 1);
    const inicioDate = new Date(semana1Seg); inicioDate.setUTCDate(semana1Seg.getUTCDate() + (Number(w) - 1) * 7);
    const fimDate = new Date(inicioDate); fimDate.setUTCDate(inicioDate.getUTCDate() + 6);
    return { inicio: inicioDate.toISOString().slice(0, 10), fim: fimDate.toISOString().slice(0, 10) };
  }
  throw new Error(`coletar: período inválido '${periodo}' (use YYYY-MM ou YYYY-Www)`);
}

function gitLog(root, inicio, fim) {
  try {
    return execFileSync("git", ["-C", root, "log", `--since=${inicio} 00:00`, `--until=${fim} 23:59`, "--format=%h%x09%s"], { encoding: "utf8" });
  } catch { return ""; }
}

function lerSe(p) { return existsSync(p) ? readFileSync(p, "utf8") : ""; }

function frontmatterData(md) {
  const m = md.match(/ultima_atualizacao:\s*(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

export function coletar({ periodo, root = process.cwd(), hoje = new Date().toISOString().slice(0, 10) }) {
  const { inicio, fim } = intervaloDoPeriodo(periodo);
  const commits = groupCommits(gitLog(root, inicio, fim));
  const saturacao = contarSaturacao(lerSe(join(root, "memory/performance/registro-angulos.md")), { inicio, fim, hoje });
  const execucoes = parseExecucoes(lerSe(join(root, "orquestracao/execucoes.jsonl")), { inicio, fim });

  const slices = ["publico", "mercado", "ramon", "performance", "produto", "biblioteca"]
    .map((s) => {
      // pega o primeiro .md com frontmatter no slice (heurística leve)
      const dir = join(root, "memory", s);
      if (!existsSync(dir)) return { slice: s, ultima: null };
      const md = readdirSync(dir).find((f) => f.endsWith(".md"));
      return { slice: s, ultima: md ? frontmatterData(readFileSync(join(dir, md), "utf8")) : null };
    });
  const staleness = sliceStaleness(slices, hoje);

  return { periodo, inicio, fim, hoje, commits, saturacao, execucoes, staleness };
}

function main() {
  const argv = process.argv.slice(2);
  const i = argv.indexOf("--periodo");
  if (i < 0 || !argv[i + 1]) {
    console.error("Uso: node scripts/relatorio/coletar.js --periodo <YYYY-MM | YYYY-Www>");
    process.exit(1);
  }
  console.log(JSON.stringify(coletar({ periodo: argv[i + 1] }), null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) main();
```

- [ ] **Step 2: Adicionar teste de `intervaloDoPeriodo` (puro)**

Acrescente a `scripts/relatorio/coletar.test.js`:

```js
import { intervaloDoPeriodo } from "./coletar.js";

test("intervaloDoPeriodo resolve mês inteiro", () => {
  assert.deepEqual(intervaloDoPeriodo("2026-06"), { inicio: "2026-06-01", fim: "2026-06-30" });
  assert.deepEqual(intervaloDoPeriodo("2026-02"), { inicio: "2026-02-01", fim: "2026-02-28" });
});

test("intervaloDoPeriodo resolve semana ISO (2ª a dom)", () => {
  const r = intervaloDoPeriodo("2026-W24");
  assert.equal(r.inicio, "2026-06-08"); // segunda da W24/2026
  assert.equal(r.fim, "2026-06-14");
});

test("intervaloDoPeriodo rejeita formato inválido", () => {
  assert.throws(() => intervaloDoPeriodo("junho"), /inválido/);
});
```

- [ ] **Step 3: Run tests**

Run: `node --test scripts/relatorio/coletar.test.js`
Expected: PASS (10 tests).

- [ ] **Step 4: Smoke da orquestração no repo real**

Run: `node scripts/relatorio/coletar.js --periodo 2026-06`
Expected: imprime JSON com `periodo`, `inicio`/`fim` = 2026-06-01/30, `commits` (lista não vazia), `saturacao`, `execucoes` (provavelmente `{}` — sem ledger ainda), `staleness` com os slices. Sem erro.

- [ ] **Step 5: Commit**

```bash
git add scripts/relatorio/coletar.js scripts/relatorio/coletar.test.js
git commit -m "feat(relatorio): orquestração coletar() (git+slices+ledger) e CLI"
```

---

## Task 4: Renderizador do pulso (`render_pulso.js`)

Transforma o JSON de fatos no markdown do pulso semanal — determinístico, sem agente.

**Files:**
- Create: `scripts/relatorio/render_pulso.js`
- Test: `scripts/relatorio/render_pulso.test.js`

- [ ] **Step 1: Write the failing test**

Create `scripts/relatorio/render_pulso.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { renderPulso } from "./render_pulso.js";

const fatos = {
  periodo: "2026-W24", inicio: "2026-06-08", fim: "2026-06-14", hoje: "2026-06-14",
  commits: [
    { hash: "abc", tipo: "feat", escopo: "biblioteca", assunto: "nova ficha" },
    { hash: "def", tipo: "fix", escopo: "editor", assunto: "freeze" },
  ],
  saturacao: { porVerdade: { consistencia: 3 }, porAngulo: { "macro-certo": 2 }, emDescanso: [{ slug: "post-a", angulo: "macro-certo", ate: "2026-06-25" }] },
  execucoes: { porSkill: { "novo-post": { ok: 2, falha: 1 } }, totalFalhas: 1 },
  staleness: [{ slice: "mercado", ultima: "2026-06-01", diasStale: 13 }],
};

test("renderPulso produz markdown com as seções esperadas", () => {
  const md = renderPulso(fatos);
  assert.match(md, /# Pulso semanal — 2026-W24/);
  assert.match(md, /## Runs & falhas/);
  assert.match(md, /novo-post/);
  assert.match(md, /1 falha/);
  assert.match(md, /## Melhorias da semana/);
  assert.match(md, /feat\(biblioteca\)/);
  assert.match(md, /## Ângulos saturando/);
  assert.match(md, /macro-certo/);
});

test("renderPulso degrada cold start sem quebrar", () => {
  const vazio = { periodo: "2026-W24", inicio: "2026-06-08", fim: "2026-06-14", hoje: "2026-06-14",
    commits: [], saturacao: { porVerdade: {}, porAngulo: {}, emDescanso: [] },
    execucoes: { porSkill: {}, totalFalhas: 0 }, staleness: [] };
  const md = renderPulso(vazio);
  assert.match(md, /sem execuções registradas/i);
  assert.match(md, /sem atividade/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/relatorio/render_pulso.test.js`
Expected: FAIL — `Cannot find module './render_pulso.js'`.

- [ ] **Step 3: Write minimal implementation**

Create `scripts/relatorio/render_pulso.js`:

```js
#!/usr/bin/env node
/**
 * render_pulso.js — renderiza o pulso semanal (markdown) a partir do JSON de fatos.
 * Determinístico, sem agente. Lê fatos de stdin ou de --fatos <arquivo>.
 *
 * Uso: node scripts/relatorio/coletar.js --periodo 2026-W24 | node scripts/relatorio/render_pulso.js
 */
import { readFileSync } from "node:fs";

export function renderPulso(f) {
  const L = [];
  L.push(`# Pulso semanal — ${f.periodo}`);
  L.push("");
  L.push(`> ${f.inicio} a ${f.fim} · gerado em ${f.hoje} · fatos por script (sem opinião)`);
  L.push("");

  // Runs & falhas
  L.push("## Runs & falhas");
  const skills = Object.entries(f.execucoes.porSkill || {});
  if (skills.length === 0) {
    L.push("_sem execuções registradas no período._");
  } else {
    for (const [skill, c] of skills) {
      const falhaTxt = c.falha ? ` — ⚠ ${c.falha} falha${c.falha > 1 ? "s" : ""}` : "";
      L.push(`- \`${skill}\`: ${c.ok} ok${falhaTxt}`);
    }
  }
  L.push("");

  // Ângulos saturando
  L.push("## Ângulos saturando");
  const ang = Object.entries(f.saturacao.porAngulo || {});
  if (ang.length === 0) L.push("_sem atividade de ângulos no período._");
  else ang.sort((a, b) => b[1] - a[1]).forEach(([a, n]) => L.push(`- \`${a}\`: ${n} peça${n > 1 ? "s" : ""}`));
  L.push("");

  // Melhorias da semana
  L.push("## Melhorias da semana");
  if ((f.commits || []).length === 0) L.push("_sem atividade de commits no período._");
  else f.commits.forEach((c) => {
    const escopo = c.escopo ? `(${c.escopo})` : "";
    L.push(`- ${c.tipo}${escopo}: ${c.assunto} \`${c.hash}\``);
  });
  L.push("");

  L.push("---");
  L.push("→ relatório mensal profundo: `relatorios/<YYYY-MM>/relatorio.md`");
  L.push("");
  return L.join("\n");
}

function main() {
  const argv = process.argv.slice(2);
  const i = argv.indexOf("--fatos");
  const raw = i >= 0 ? readFileSync(argv[i + 1], "utf8") : readFileSync(0, "utf8");
  process.stdout.write(renderPulso(JSON.parse(raw)));
}

if (import.meta.url === `file://${process.argv[1]}`) main();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/relatorio/render_pulso.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Smoke do pipeline pulso completo**

Run: `node scripts/relatorio/coletar.js --periodo 2026-W24 | node scripts/relatorio/render_pulso.js`
Expected: markdown do pulso impresso, com Melhorias da semana populadas pelos commits reais.

- [ ] **Step 6: Commit**

```bash
git add scripts/relatorio/render_pulso.js scripts/relatorio/render_pulso.test.js
git commit -m "feat(relatorio): renderizador determinístico do pulso semanal"
```

---

## Task 5: Registrar testes no `package.json` + ancorar `relatorios/`

**Files:**
- Modify: `package.json`
- Create: `relatorios/.gitkeep`
- Modify: `.gitignore`

- [ ] **Step 1: Atualizar o glob de teste**

Em `package.json`, trocar a linha do script `test` para incluir `scripts/relatorio/*.test.js`:

```json
    "test": "node --test scripts/editor/*.test.js scripts/orquestracao/*.test.js scripts/relatorio/*.test.js",
```

- [ ] **Step 2: Ancorar a pasta de saída e ignorar fatos transitórios**

Create `relatorios/.gitkeep` (arquivo vazio).

Adicionar ao `.gitignore` da raiz (criar a linha se o arquivo existir; se não existir, criar `.gitignore` com esta linha):

```
relatorios/**/.fatos.json
```

- [ ] **Step 3: Rodar a suíte inteira**

Run: `npm test`
Expected: PASS — todos os testes do editor, orquestração e relatório (incluindo registrar_execucao, coletar, render_pulso).

- [ ] **Step 4: Commit**

```bash
git add package.json .gitignore relatorios/.gitkeep
git commit -m "chore(relatorio): registra testes no glob e ancora relatorios/"
```

---

## Task 6: Agente `arquiteto-sistema`

Contrato markdown. Sem unit test (é um agente); verificação por smoke de drift plantado na Task 9.

**Files:**
- Create: `.claude/agents/arquiteto-sistema.md`

- [ ] **Step 1: Escrever o contrato**

Create `.claude/agents/arquiteto-sistema.md`. Use o frontmatter no padrão dos outros agentes (checar `.claude/agents/analista-performance.md` para o formato exato de `name`/`description`/`tools`). Conteúdo:

```markdown
---
name: arquiteto-sistema
description: Meta-arquiteto do brand OS. Lê a constituição do próprio sistema (CLAUDE.md, memory/_schema.md, contratos, specs) e julga o sistema CONTRA ELA MESMA — saúde, drift doc↔disco, violações das regras declaradas, eficiência de contexto/agentes. Produz a camada de autoarquitetura do relatório: achados aterrados em arquivo+evidência, sempre advisory (nunca edita, nunca auto-aplica). Stateless: não possui slice de memory. Acionado pela skill /relatorio-sistema no modo mensal.
tools: Read, Glob, Grep
---

# arquiteto-sistema — meta-arquiteto do brand OS

## Função

Avaliar a arquitetura do próprio sistema Dino Team e propor sua evolução. Mede o sistema contra a **constituição declarada** dele (não best-practices genéricas de fora). Entrega a **Camada D** do relatório mensal.

## Contexto que carrego

- `CLAUDE.md` — doc-mestre: roster, regras operacionais, estrutura, horizonte.
- `memory/_schema.md` — slices, ownership, princípios do cérebro.
- `orquestracao/governanca.yaml` — mapa de autonomia.
- `docs/specs/` — specs canônicas (arquitetura vigente).

Os contratos de agente e skills específicos NÃO são lidos por inteiro toda vez — chegam pela skill via (a) git diff do período e (b) o subsistema do foco rotativo do mês. Isso teta o custo.

## Input que recebo (da skill)

```
Tarefa: autoarquitetura
Período: <YYYY-MM>
Foco rotativo do mês: <agentes | skills | memory-orquestracao>
Git diff estrutural desde o último relatório:
<diff de .claude/agents/, .claude/skills/, memory/_schema.md, CLAUDE.md>
Fatos do período (JSON): <saturação, staleness dos slices>
Camada D do relatório anterior (para status):
<markdown da última autoarquitetura, ou "nenhum">
```

## O que inspeciono

1. **Drift doc↔disco** — o CLAUDE.md declara algo que o disco contradiz: skill/agente citado que não existe como arquivo; slice declarado sem leitor; contagem de roster divergente; ponteiro quebrado.
2. **Saúde** — slice stale além da cadência esperada; slice morto (sem leitura); saturação de verdade/ângulo em extremo (lido dos fatos).
3. **Violação de constituição** — medido contra as REGRAS DO PRÓPRIO CLAUDE.md: contrato repetindo contexto que já declara em "Contexto que carrego" (anti-redundância); skill embutindo comportamento de agente; skill sem `## Fluxo`; saída de agente fora dos 3 schemas; agente fino que só executa (anti-diluição).
4. **Eficiência de contexto** — contrato/skill inchado, injeção redundante de contexto, arquivo que cresceu demais para uma responsabilidade.

## Travas (invariantes — quebrar qualquer uma é falha de contrato)

1. **Citação obrigatória** — todo achado cita `arquivo` (+ seção/linha quando aplicável) e a regra ou evidência específica. Achado sem citação não entra.
2. **Sem platitude** — proibido best-practice genérico solto ("adicione testes", "modularize", "melhore a documentação"). Só vale se amarrado a violação concreta de uma regra DECLARADA do sistema.
3. **Advisory absoluto** — proponho, nunca edito, nunca auto-aplico. Saída é proposta para o humano ratificar.
4. **Silêncio quando limpo** — subsistema sem drift novo → uma linha "sem drift em <subsistema>", e ponto. Não invento achado para preencher.
5. **Anti-padding** — alvo de concisão: cada proposta cabe em ~5 linhas. Sem preâmbulo.

## Schema de saída (markdown estruturado — a Camada D)

```markdown
## Camada D — Autoarquitetura

### Saúde & drift
- <achado> — `<arquivo>` — <evidência> — severidade: <alta|média|baixa>
- (ou) sem drift novo neste período.

### Propostas de evolução
1. **<título curto>** — severidade: <alta|média|baixa> — status: <novo|reincidente|resolvido>
   - Evidência: `<arquivo>` — <o que se observa>
   - Por que importa: <1 frase, amarrada a uma regra/risco concreto>
   - Mudança proposta: <1-2 frases acionáveis>

### Foco do mês — <subsistema>
- <2-4 achados do deep-dive do subsistema da vez, mesmo formato>
```

## Tratamento de input incompleto

- Sem "Camada D anterior" → trato tudo como `status: novo`.
- Sem git diff (primeiro relatório) → audito só o foco rotativo + fatos, e digo "primeiro relatório: sem delta".
- Foco rotativo ausente → assumo `agentes` e sinalizo.
```

- [ ] **Step 2: Verificar o frontmatter contra um agente existente**

Run: `head -5 .claude/agents/analista-performance.md`
Confirme que `name`/`description`/`tools` do novo agente seguem o mesmo formato (ajuste se o projeto usar outro campo).

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/arquiteto-sistema.md
git commit -m "feat(relatorio): agente arquiteto-sistema (autoarquitetura advisory, aterrada)"
```

---

## Task 7: Skill `/relatorio-sistema`

**Files:**
- Create: `.claude/skills/relatorio-sistema/SKILL.md`

- [ ] **Step 1: Escrever a skill**

Create `.claude/skills/relatorio-sistema/SKILL.md`. Espelhar o estilo de `.claude/skills/planejar-pauta-semanal/SKILL.md` (frontmatter `name`/`description`; abre com `## Objetivo`, `## Sintaxe`, `## Fluxo`). Conteúdo:

```markdown
---
name: relatorio-sistema
description: Gera o relatório periódico onde o brand OS narra a si mesmo — três camadas (prestação de contas, inteligência, direção) + autojulgamento da arquitetura. Dois modos de profundidade: pulso semanal (só script, ~zero token) e mensal profundo (script + agentes de domínio + arquiteto-sistema). Fatos por script (sem alucinação); custo e resultado/impacto ficam como seções deferidas honestas (Horizonte). Sintaxe — /relatorio-sistema [--pulso | --mes <YYYY-MM>].
---

# /relatorio-sistema — Dino Team

## Objetivo

Periodicamente, deixar o sistema reportar sobre si mesmo ao operador humano: o que fez e por quê (prestação de contas), o que muda lá fora (inteligência), para onde ir + como a própria arquitetura pode evoluir (direção + autoarquitetura). Artefato markdown versionado em `relatorios/`; o dashboard renderiza depois.

## Sintaxe

```
/relatorio-sistema                 # mensal profundo do mês fechado anterior
/relatorio-sistema --pulso         # pulso semanal (semana ISO fechada)
/relatorio-sistema --mes <YYYY-MM> # mês específico
```

## Fluxo

| Passo | Agente/Ação | Recebe | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ resolver período + criar pasta | args | — | `<YYYY-MM>` ou `<YYYY-Www>` |
| 2 | ⚙ `coletar.js` | período | 1 | JSON de fatos |
| 2p | ⚙ `render_pulso.js` | fatos | 2 | `pulso.md` → **fim** (modo `--pulso`) |
| 3 | agentes de domínio (×4) | fatos + slices | 2 | resumos camadas B/C |
| 4 | `arquiteto-sistema` | git diff + foco + fatos + Camada D anterior | 2 | Camada D |
| 5 | ⚙ tecer documento | tudo ← 2,3,4 | 4 | `relatorio.md` |
| 6 | ⚙ `registrar_execucao.js` | resultado | 5 | linha no run-ledger |

## Quando dispara

- Cron mensal (dia 7) e semanal (2ª 7h) via routines `/schedule` (`orquestracao/rotas.yaml`).
- Manual via `/relatorio-sistema`.

---

## Pipeline

### 1. Resolver período + criar pasta
- `--pulso` → semana ISO fechada anterior (`<YYYY-Www>`); senão mês fechado anterior (`<YYYY-MM>`), ou `--mes`.
- Pasta: `relatorios/<periodo>/`. Se `relatorio.md`/`pulso.md` já existir → abortar `RELATORIO_JA_EXISTE — relatorios/<periodo>` (re-run é decisão humana; `--force` sobrescreve).

### 2. Coletar fatos
Rodar `node scripts/relatorio/coletar.js --periodo <periodo>`. Guardar o JSON.

### 2p. Modo pulso (early-exit)
Se `--pulso`: `node scripts/relatorio/coletar.js --periodo <sem> | node scripts/relatorio/render_pulso.js > relatorios/<sem>/pulso.md`. Registrar no run-ledger (passo 6) e **terminar**. Sem agentes.

### 3. Resumos de domínio (modo mensal)
Acionar, cada um com o JSON de fatos + ponteiro pro slice, pedindo resumo conciso da janela:
- `pesquisador-mercado` → inteligência externa + movimentos de concorrentes + antecipação de risco (lê `memory/mercado/`, `memory/publico/`).
- `analista-performance` → leitura de saturação + transparência de decisão (lê `registro-angulos`).
- `estrategista-mercado` → forward-looking / próximas jogadas.
- `estrategista-produto` → estado de produto + oportunidades/evolução.
Falha de um agente: 1 retry; depois degradar a seção com "⚠ indisponível (falha em <agente>)" e seguir.

### 4. Autoarquitetura (`arquiteto-sistema`)
Computar o **foco rotativo** do mês: `agentes` se mês%3==1, `skills` se ==2, `memory-orquestracao` se ==0. Montar o git diff estrutural desde o último relatório (`git diff <ultimo-commit-de-relatorio>..HEAD -- .claude/agents .claude/skills memory/_schema.md CLAUDE.md`). Acionar `arquiteto-sistema` com período + foco + diff + fatos + Camada D do relatório anterior (se houver).

### 5. Tecer o documento
Montar `relatorios/<YYYY-MM>/relatorio.md` na anatomia da spec §4.1: topo (período/gerado/modo/**Insights do período** destilados em 2-3 bullets) + Camada A (tarefas&falhas dos fatos, melhorias dos commits, transparência de decisão, 💤 custo) + Camada B (intel + risco) + Camada C (forward-looking + conhecimento acumulado + 💤 resultado/impacto) + Camada D (do agente). As seções 💤 são literais: "ainda não instrumentado — gatilho: <X>".

### 6. Registrar execução
`node scripts/orquestracao/registrar_execucao.js --skill relatorio-sistema --modo <auto|manual> --resultado ok`.

## Modo cron (sem humano)
- Igual, sem pausa. Falha → registrar `--resultado falha --nota <motivo>` e logar.

## Critério de conclusão
- `relatorios/<periodo>/relatorio.md` (mensal) ou `pulso.md` (semanal) existe.
- Modo mensal: 4 camadas presentes; 💤 custo e 💤 resultado/impacto literais (nenhum número fabricado).
- Run-ledger recebeu a linha desta execução.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/relatorio-sistema/SKILL.md
git commit -m "feat(relatorio): skill /relatorio-sistema (pulso + mensal, Fluxo, degradação)"
```

---

## Task 8: Fiar `registrar_execucao` nas 4 routines autônomas

Cada SKILL.md autônoma ganha um passo final que registra a execução. Edição de documentação (a skill é seguida por LLM).

**Files:**
- Modify: `.claude/skills/pesquisar-mercado/SKILL.md`
- Modify: `.claude/skills/planejar-pauta-semanal/SKILL.md`
- Modify: `.claude/skills/novo-post/SKILL.md`
- Modify: `.claude/skills/evoluir-produto/SKILL.md`

- [ ] **Step 1: Adicionar o passo de registro em cada skill**

Em cada uma das 4 skills, ao fim do pipeline (antes/junto do relatório inline final), adicionar uma subseção:

```markdown
### Registrar execução (run-ledger)

Ao concluir, registrar no run-ledger para o relatório do sistema:

`node scripts/orquestracao/registrar_execucao.js --skill <nome-desta-skill> --modo <auto|manual> --resultado <ok|falha> [--slug <slug>] [--nota <motivo se falha>]`

- `--modo auto` quando disparada por routine; `manual` quando pelo usuário.
- Em falha estrutural, registrar `--resultado falha --nota <erro>` antes de abortar.
```

Substituir `<nome-desta-skill>` pelo nome correto (`pesquisar-mercado`, `planejar-pauta-semanal`, `novo-post`, `evoluir-produto`). Para `novo-post`, ancorar no caminho `--auto` (mas registrar em qualquer modo).

- [ ] **Step 2: Verificar que o nome bate com o campo `skill` esperado**

Confirme que cada `--skill <nome>` usa o slug da skill (sem barra), consistente com o que `coletar.js`/`render_pulso.js` exibem.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/pesquisar-mercado/SKILL.md .claude/skills/planejar-pauta-semanal/SKILL.md .claude/skills/novo-post/SKILL.md .claude/skills/evoluir-produto/SKILL.md
git commit -m "feat(relatorio): routines autônomas registram execução no run-ledger"
```

---

## Task 9: Smoke do `arquiteto-sistema` com drift plantado

Verificação comportamental do agente (a trava anti-slop e a citação obrigatória). Não é unit test — é um smoke manual/subagente documentado.

**Files:** nenhuma alteração de código (cria fixture temporária, descartada).

- [ ] **Step 1: Plantar um drift conhecido numa cópia temporária**

```bash
mkdir -p /tmp/drift-fixture && cp CLAUDE.md /tmp/drift-fixture/CLAUDE.md
printf '\n- [`/skill-fantasma`](.claude/skills/skill-fantasma/SKILL.md) — skill que NÃO existe no disco.\n' >> /tmp/drift-fixture/CLAUDE.md
```

- [ ] **Step 2: Acionar o `arquiteto-sistema` apontando para a fixture**

Dispatch do agente `arquiteto-sistema` com:
```
Tarefa: autoarquitetura
Período: 2026-06 (smoke)
Foco rotativo do mês: skills
Git diff estrutural: (use o conteúdo de /tmp/drift-fixture/CLAUDE.md como CLAUDE.md vigente)
Fatos do período (JSON): {}
Camada D do relatório anterior: nenhum
```
Expected: a saída inclui um achado em **Saúde & drift** que cita `CLAUDE.md` e aponta `/skill-fantasma` como skill declarada sem arquivo no disco. Sem platitude genérica.

- [ ] **Step 3: Rodar contra o repo limpo (controle)**

Dispatch igual, mas com o `CLAUDE.md` real e `Foco: skills`.
Expected: ou achados reais aterrados em arquivo, ou "sem drift novo" — **nunca** invenção sem citação.

- [ ] **Step 4: Limpar**

```bash
rm -rf /tmp/drift-fixture
```

- [ ] **Step 5: Registrar o resultado do smoke**

Sem commit de código. Anotar no relato de execução se o agente passou (flagou o drift plantado citando o arquivo) ou se precisa de ajuste no contrato.

---

## Task 10: Cadência, governança e doc-mestre

**Files:**
- Modify: `orquestracao/rotas.yaml`
- Modify: `orquestracao/governanca.yaml`
- Modify: `docs/automacao/routines.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Adicionar as 2 rotas**

Acrescentar a `orquestracao/rotas.yaml`, seguindo o formato das rotas existentes:

```yaml
  - id: relatorio-mensal-cron
    trigger:
      tipo: cron
      schedule: "0 9 7 * *"          # dia 7 de cada mês às 9h (TZ: America/Sao_Paulo)
      timezone: America/Sao_Paulo
    skill: /relatorio-sistema
    args:
      mes: anterior
    notificacao:
      sucesso: dashboard
      falha: dashboard
    ativa: true

  - id: pulso-semanal-cron
    trigger:
      tipo: cron
      schedule: "0 7 * * 1"          # toda 2ª-feira 7h (antes da pauta das 9h)
      timezone: America/Sao_Paulo
    skill: /relatorio-sistema
    args:
      pulso: true
    notificacao:
      sucesso: dashboard
      falha: dashboard
    ativa: true
```

- [ ] **Step 2: Adicionar a função de governança**

Acrescentar a `orquestracao/governanca.yaml`, em `decisoes:`:

```yaml
  - funcao: auto-relato-sistema
    decisao: "gerar o relatório periódico do próprio sistema (prestação de contas + intel + direção + autoarquitetura)"
    autonomia: automatico                # gerar = auto; agir nas propostas de arquitetura = humano (advisory)
    corpo: "/relatorio-sistema + agente arquiteto-sistema"
```

- [ ] **Step 3: Documentar as routines**

Acrescentar 2 linhas na tabela de `docs/automacao/routines.md`:

```markdown
| relatorio-mensal | mensal (dia 7) | `/relatorio-sistema` | autônomo (mês fechado anterior) |
| pulso-semanal | semanal (2ª 7h) | `/relatorio-sistema --pulso` | autônomo (só script, ~zero token) |
```

- [ ] **Step 4: Atualizar o doc-mestre `CLAUDE.md`**

Quatro edições cirúrgicas (manter doc↔realidade — o `arquiteto-sistema` flagaria o contrário):

1. Na lista de skills (seção "Skills disponíveis"), adicionar sob um grupo apropriado (ex: novo bloco _Auto-observabilidade_ ou dentro de "Estratégia e direção"):
```markdown
- [`/relatorio-sistema`](.claude/skills/relatorio-sistema/SKILL.md) — relatório periódico onde o sistema narra a si mesmo (prestação de contas + inteligência + direção + autoarquitetura). Pulso semanal (script) + mensal profundo (agentes + `arquiteto-sistema`). Custo e resultado/impacto são seções `💤` deferidas (Horizonte).
```

2. Na lista de agentes, mudar "**Agentes atuais (12):**" para "**(13):**" e adicionar sob um setor (ex: **Transversais / Sistema**):
```markdown
- **Transversais / Sistema**
  - [`arquiteto-sistema`](.claude/agents/arquiteto-sistema.md) — meta-arquiteto: julga a arquitetura do próprio brand OS contra a constituição dele e propõe evolução (advisory). Produz a Camada D do relatório mensal. Stateless.
```

3. Na estrutura de pastas / seção de orquestração, registrar `relatorios/` e o run-ledger:
```markdown
- **Relatórios:** [`relatorios/`](relatorios/) — saída versionada do `/relatorio-sistema` (`<YYYY-MM>/relatorio.md`, `<YYYY-Www>/pulso.md`). O dashboard renderiza quando a rota existir.
- **Run-ledger:** [`orquestracao/execucoes.jsonl`](orquestracao/execucoes.jsonl) — telemetria append-only das routines autônomas (`scripts/orquestracao/registrar_execucao.js`); fonte de "tarefas executadas & falhas" do relatório.
```

4. Conferir que a contagem e os ponteiros batem (nº de agentes, nome dos arquivos).

- [ ] **Step 5: Commit**

```bash
git add orquestracao/rotas.yaml orquestracao/governanca.yaml docs/automacao/routines.md CLAUDE.md
git commit -m "feat(relatorio): rotas + governança + doc-mestre do /relatorio-sistema"
```

---

## Task 11: Smoke E2E + verificação final

- [ ] **Step 1: Suíte completa verde**

Run: `npm test`
Expected: PASS — editor + orquestração + relatório.

- [ ] **Step 2: Pulso real**

Run: `node scripts/relatorio/coletar.js --periodo 2026-W24 | node scripts/relatorio/render_pulso.js`
Expected: markdown coerente; Melhorias da semana com commits reais; "sem execuções registradas" (ledger ainda vazio) — degradação honesta.

- [ ] **Step 3: Ledger end-to-end**

```bash
node scripts/orquestracao/registrar_execucao.js --skill novo-post --modo manual --resultado ok --slug smoke-x
node scripts/relatorio/coletar.js --periodo 2026-06 | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const f=JSON.parse(s);console.log(JSON.stringify(f.execucoes,null,2))})'
```
Expected: `execucoes.porSkill["novo-post"].ok >= 1`. Depois remover a linha de smoke do `orquestracao/execucoes.jsonl` (ou deixar `.gitignore`d / não commitar o ledger de smoke).

- [ ] **Step 4: Verificação de cobertura da spec**

Reler a spec §11 (critério de conclusão) e confirmar item a item contra o que foi construído. Anotar qualquer gap.

- [ ] **Step 5: Commit final (se houver ajuste pendente)**

```bash
git add -A && git commit -m "test(relatorio): smoke E2E e verificação de cobertura"
```

---

## Self-Review (preenchido pelo autor do plano)

**Cobertura da spec:**
- §2 (4 componentes + ledger) → Tasks 1–7. ✓
- §3 (cadência tiered, delta+rodízio) → Task 7 (foco rotativo) + Task 10 (rotas). ✓
- §4 (anatomia mensal/pulso) → Task 7 (mensal) + Task 4 (pulso). ✓
- §5 (componentes em detalhe) → Tasks 1–4, 6, 7. ✓
- §6 (erro/degradação) → Task 7 (passo 3 retry+degradar; `RELATORIO_JA_EXISTE`). ✓
- §7 (routines) → Task 10. ✓
- §8 (governança/doc-mestre/sem novo slice) → Task 10; nenhum slice criado. ✓
- §9 (teste) → Tasks 1–5 (unit), 9 (smoke agente), 11 (E2E). ✓
- §10 (fora de escopo) → 💤 literais na Task 7; sem telemetria de custo/impacto. ✓
- §11 (conclusão) → Task 11 passo 4. ✓

**Consistência de tipos:** `registrarExecucao`/`parseArgs` (T1) usados em T8/T11; `coletar`/`groupCommits`/`contarSaturacao`/`parseExecucoes`/`sliceStaleness`/`intervaloDoPeriodo` (T2/T3) consumidos por `renderPulso` (T4) e pela skill (T7); shape de `fatos` idêntico entre `coletar` (T3) e `renderPulso` (T4). ✓

**Sem placeholders:** todo passo de código traz o código; comandos com saída esperada. ✓
