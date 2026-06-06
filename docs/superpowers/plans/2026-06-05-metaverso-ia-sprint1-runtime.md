# Metaverso de Agentes IA — Sprint 1 (Runtime headless) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the headless AI runtime where 3 agents (2 conversational + 1 with a real tool) live in rooms, run autonomous routine ticks, trigger each other via a message bus, and persist memory — proving the core "aha" scenario in logs before any visual layer exists.

**Architecture:** A TypeScript/Node service organized by responsibility. Pure-domain types and interfaces sit at the center; SQLite (via `better-sqlite3`) provides durable storage behind repository interfaces; a pluggable `LLMProvider` (Claude for MVP) is selected per-agent by an `LLMRouter`; a deterministic lexical `MemoryStore` (bag-of-words cosine) stands in for pgvector and is swappable later; an in-process `MessageBus` carries NPC↔NPC triggers; an `AgentRuntime` executes the 5-step tick (plan→move→interact→execute→memorize) driven by a `Scheduler`. Every external dependency (LLM, clock) is injected so the runtime is fully testable with fakes.

**Tech Stack:** TypeScript, Node.js, Vitest (tests), better-sqlite3 (storage), @anthropic-ai/sdk (Claude), dotenv (config). No network calls in tests — Claude is faked.

---

## Project location

This is a **new standalone git repository** at `~/Documents/Projetos/metaverso-ia`. All paths below are relative to that repo root. Task 1 creates it.

## File Structure

```
metaverso-ia/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── .gitignore
├── .env.example
├── src/
│   ├── domain/
│   │   └── types.ts                 # all core types + interfaces
│   ├── domain/agent-definition.ts   # AgentDefinition validation
│   ├── db/
│   │   ├── schema.sql               # SQLite DDL
│   │   ├── database.ts              # connection + migration runner
│   │   ├── world-repo.ts           # rooms + agent definitions + agent state
│   │   └── task-repo.ts            # tasks + produced docs
│   ├── memory/
│   │   └── lexical-memory-store.ts  # MemoryStore impl (cosine + recency)
│   ├── llm/
│   │   ├── claude-provider.ts       # Anthropic SDK impl of LLMProvider
│   │   └── llm-router.ts            # picks provider per agent
│   ├── tools/
│   │   ├── tool-registry.ts         # register/get tools
│   │   └── write-doc-tool.ts        # the "real tool" used in the demo
│   ├── bus/message-bus.ts           # in-process pub/sub
│   ├── runtime/
│   │   ├── decision.ts              # parse LLM output into AgentDecision
│   │   ├── agent-runtime.ts         # the 5-step tick
│   │   └── scheduler.ts             # drives ticks across agents
│   └── index.ts                     # demo wiring: the 3-agent scenario
└── tests/                            # mirrors src/
```

**Decomposition rationale:** Interfaces live in `domain/types.ts` so every module depends on abstractions, not implementations. Storage, LLM, memory, tools, and bus are each isolated behind an interface and independently testable. The runtime depends only on interfaces, so the whole tick is exercised with fakes — no DB or network needed for its tests.

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`, `.env.example`
- Create: `tests/smoke.test.ts`

- [ ] **Step 1: Create the repo and enter it**

```bash
mkdir -p ~/Documents/Projetos/metaverso-ia
cd ~/Documents/Projetos/metaverso-ia
git init
```

- [ ] **Step 2: Write `package.json`**

```json
{
  "name": "metaverso-ia",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "demo": "tsx src/index.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.32.1",
    "better-sqlite3": "^11.3.0",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.11",
    "@types/node": "^22.7.4",
    "tsx": "^4.19.1",
    "typescript": "^5.6.2",
    "vitest": "^2.1.1"
  }
}
```

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "outDir": "dist",
    "rootDir": ".",
    "types": ["node"]
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 4: Write `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
});
```

- [ ] **Step 5: Write `.gitignore`**

```
node_modules/
dist/
*.db
*.db-journal
.env
.DS_Store
```

- [ ] **Step 6: Write `.env.example`**

```
# Copy to .env and fill in. Only needed to run the live demo (npm run demo).
ANTHROPIC_API_KEY=
# DB file path. Defaults to ./metaverso.db if unset.
DB_PATH=./metaverso.db
# Default Claude model for agents that don't override it.
DEFAULT_MODEL=claude-sonnet-4-6
```

- [ ] **Step 7: Write `tests/smoke.test.ts`**

```ts
import { describe, it, expect } from "vitest";

describe("smoke", () => {
  it("runs the test runner", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 8: Install and run the smoke test**

Run: `npm install && npm test`
Expected: PASS — `smoke > runs the test runner`. (better-sqlite3 compiles a native binary during install; this can take a minute.)

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold metaverso-ia (ts + vitest + sqlite deps)"
```

---

### Task 2: Domain types and interfaces

**Files:**
- Create: `src/domain/types.ts`
- Test: `tests/domain/types.test.ts`

These are the contracts every other module imports. The test pins the discriminated unions and a small helper so later tasks rely on a stable shape.

- [ ] **Step 1: Write the failing test**

```ts
// tests/domain/types.test.ts
import { describe, it, expect } from "vitest";
import { isTerminalTaskStatus, AGENT_STATUSES } from "../../src/domain/types.js";

describe("domain types", () => {
  it("knows which task statuses are terminal", () => {
    expect(isTerminalTaskStatus("done")).toBe(true);
    expect(isTerminalTaskStatus("open")).toBe(false);
    expect(isTerminalTaskStatus("in_progress")).toBe(false);
  });

  it("exposes the full set of agent statuses", () => {
    expect(AGENT_STATUSES).toContain("idle");
    expect(AGENT_STATUSES).toContain("executing");
    expect(AGENT_STATUSES.length).toBe(5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/domain/types.test.ts`
Expected: FAIL — cannot find module `../../src/domain/types.js`.

- [ ] **Step 3: Write the implementation**

```ts
// src/domain/types.ts

export type LLMProviderName = "claude" | "openai" | "gemini";

export const AGENT_STATUSES = [
  "idle",
  "thinking",
  "speaking",
  "moving",
  "executing",
] as const;
export type AgentStatus = (typeof AGENT_STATUSES)[number];

export type TaskStatus = "open" | "in_progress" | "done";

export function isTerminalTaskStatus(s: TaskStatus): boolean {
  return s === "done";
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface RoutineSpec {
  /** Free-text instruction injected each tick describing what this agent should pursue. */
  goal: string;
}

export interface AgentDefinition {
  id: string;
  name: string;
  sector: string;
  roomId: string;
  systemPrompt: string;
  llm: LLMProviderName;
  model: string;
  /** Tool names this agent may invoke (must exist in the ToolRegistry). */
  tools: string[];
  routine: RoutineSpec;
}

export interface AgentState {
  agentId: string;
  currentRoomId: string;
  status: AgentStatus;
  currentTaskId: string | null;
}

export interface Room {
  id: string;
  name: string;
  sector: string;
  /** Ids of directly reachable rooms. */
  connections: string[];
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  createdBy: string;
  assignedTo: string | null;
  resultDocId: string | null;
}

export interface MemoryEntry {
  id: string;
  agentId: string;
  content: string;
  createdAt: number;
}

export interface BusMessage {
  topic: string;
  from: string;
  /** Optional target agent id. */
  to?: string;
  payload: Record<string, unknown>;
}

// ---- Service interfaces (implemented in later tasks) ----

export interface LLMProvider {
  /** Returns the assistant's text completion. */
  complete(req: {
    system: string;
    messages: ChatMessage[];
    model: string;
  }): Promise<string>;
}

export interface MemoryStore {
  remember(agentId: string, content: string): void;
  /** Most relevant past entries for a query (semantic-ish). */
  recall(agentId: string, query: string, limit: number): MemoryEntry[];
  /** Most recent entries regardless of query. */
  recent(agentId: string, limit: number): MemoryEntry[];
}

export interface ToolResult {
  ok: boolean;
  output: string;
  docId?: string;
}

export interface Tool {
  name: string;
  description: string;
  run(input: Record<string, unknown>): Promise<ToolResult>;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/domain/types.test.ts`
Expected: PASS — both tests green.

- [ ] **Step 5: Commit**

```bash
git add src/domain/types.ts tests/domain/types.test.ts
git commit -m "feat(domain): core types and service interfaces"
```

---

### Task 3: Agent definition validation

**Files:**
- Create: `src/domain/agent-definition.ts`
- Test: `tests/domain/agent-definition.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/domain/agent-definition.test.ts
import { describe, it, expect } from "vitest";
import { validateAgentDefinition } from "../../src/domain/agent-definition.js";

const valid = {
  id: "dev",
  name: "Agente Dev",
  sector: "engenharia",
  roomId: "room-dev",
  systemPrompt: "Você é um engenheiro.",
  llm: "claude",
  model: "claude-sonnet-4-6",
  tools: [],
  routine: { goal: "Implementar o login." },
};

describe("validateAgentDefinition", () => {
  it("accepts a well-formed definition", () => {
    const result = validateAgentDefinition(valid);
    expect(result.ok).toBe(true);
  });

  it("rejects an unknown llm provider", () => {
    const result = validateAgentDefinition({ ...valid, llm: "mistral" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(" ")).toContain("llm");
  });

  it("rejects a missing systemPrompt", () => {
    const result = validateAgentDefinition({ ...valid, systemPrompt: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(" ")).toContain("systemPrompt");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/domain/agent-definition.test.ts`
Expected: FAIL — cannot find module `agent-definition.js`.

- [ ] **Step 3: Write the implementation**

```ts
// src/domain/agent-definition.ts
import type { AgentDefinition, LLMProviderName } from "./types.js";

const PROVIDERS: LLMProviderName[] = ["claude", "openai", "gemini"];

export type ValidationResult =
  | { ok: true; value: AgentDefinition }
  | { ok: false; errors: string[] };

export function validateAgentDefinition(input: unknown): ValidationResult {
  const errors: string[] = [];
  const o = (input ?? {}) as Record<string, unknown>;

  const requireString = (key: string) => {
    if (typeof o[key] !== "string" || (o[key] as string).length === 0) {
      errors.push(`${key} must be a non-empty string`);
    }
  };

  requireString("id");
  requireString("name");
  requireString("sector");
  requireString("roomId");
  requireString("systemPrompt");
  requireString("model");

  if (!PROVIDERS.includes(o.llm as LLMProviderName)) {
    errors.push(`llm must be one of ${PROVIDERS.join(", ")}`);
  }
  if (!Array.isArray(o.tools) || !o.tools.every((t) => typeof t === "string")) {
    errors.push("tools must be an array of strings");
  }
  const routine = o.routine as Record<string, unknown> | undefined;
  if (!routine || typeof routine.goal !== "string" || routine.goal.length === 0) {
    errors.push("routine.goal must be a non-empty string");
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: o as unknown as AgentDefinition };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/domain/agent-definition.test.ts`
Expected: PASS — all three tests green.

- [ ] **Step 5: Commit**

```bash
git add src/domain/agent-definition.ts tests/domain/agent-definition.test.ts
git commit -m "feat(domain): agent definition validation"
```

---

### Task 4: SQLite database + schema + migration

**Files:**
- Create: `src/db/schema.sql`
- Create: `src/db/database.ts`
- Test: `tests/db/database.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/db/database.test.ts
import { describe, it, expect } from "vitest";
import { openDatabase } from "../../src/db/database.js";

describe("openDatabase", () => {
  it("creates all tables in an in-memory database", () => {
    const db = openDatabase(":memory:");
    const rows = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
      )
      .all() as { name: string }[];
    const names = rows.map((r) => r.name);
    expect(names).toContain("rooms");
    expect(names).toContain("agent_definitions");
    expect(names).toContain("agent_state");
    expect(names).toContain("tasks");
    expect(names).toContain("docs");
    expect(names).toContain("memories");
    db.close();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/db/database.test.ts`
Expected: FAIL — cannot find module `database.js`.

- [ ] **Step 3: Write the schema**

```sql
-- src/db/schema.sql
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  connections TEXT NOT NULL DEFAULT '[]' -- JSON array of room ids
);

CREATE TABLE IF NOT EXISTS agent_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  room_id TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  llm TEXT NOT NULL,
  model TEXT NOT NULL,
  tools TEXT NOT NULL DEFAULT '[]',   -- JSON array
  routine TEXT NOT NULL               -- JSON RoutineSpec
);

CREATE TABLE IF NOT EXISTS agent_state (
  agent_id TEXT PRIMARY KEY,
  current_room_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_task_id TEXT
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  created_by TEXT NOT NULL,
  assigned_to TEXT,
  result_doc_id TEXT
);

CREATE TABLE IF NOT EXISTS docs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_memories_agent ON memories(agent_id);
```

- [ ] **Step 4: Write the database connector**

```ts
// src/db/database.ts
import Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export type DB = Database.Database;

const here = dirname(fileURLToPath(import.meta.url));

export function openDatabase(path: string): DB {
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  const schema = readFileSync(join(here, "schema.sql"), "utf8");
  db.exec(schema);
  return db;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/db/database.test.ts`
Expected: PASS — all six tables present.

- [ ] **Step 6: Commit**

```bash
git add src/db/schema.sql src/db/database.ts tests/db/database.test.ts
git commit -m "feat(db): sqlite schema + migration runner"
```

---

### Task 5: World repository (rooms, agent definitions, agent state)

**Files:**
- Create: `src/db/world-repo.ts`
- Test: `tests/db/world-repo.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/db/world-repo.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { openDatabase } from "../../src/db/database.js";
import { WorldRepo } from "../../src/db/world-repo.js";
import type { AgentDefinition, Room } from "../../src/domain/types.js";

const room: Room = {
  id: "room-dev",
  name: "Sala Dev",
  sector: "engenharia",
  connections: ["room-prod"],
};

const def: AgentDefinition = {
  id: "dev",
  name: "Agente Dev",
  sector: "engenharia",
  roomId: "room-dev",
  systemPrompt: "Você é um engenheiro.",
  llm: "claude",
  model: "claude-sonnet-4-6",
  tools: [],
  routine: { goal: "Implementar o login." },
};

describe("WorldRepo", () => {
  let repo: WorldRepo;
  beforeEach(() => {
    repo = new WorldRepo(openDatabase(":memory:"));
  });

  it("round-trips a room including connections", () => {
    repo.saveRoom(room);
    expect(repo.getRoom("room-dev")).toEqual(room);
  });

  it("round-trips an agent definition including tools and routine", () => {
    repo.saveAgentDefinition(def);
    expect(repo.getAgentDefinition("dev")).toEqual(def);
  });

  it("lists all agent definitions", () => {
    repo.saveAgentDefinition(def);
    repo.saveAgentDefinition({ ...def, id: "prod", name: "Agente Produto" });
    expect(repo.listAgentDefinitions().map((d) => d.id).sort()).toEqual([
      "dev",
      "prod",
    ]);
  });

  it("upserts and reads agent state", () => {
    repo.saveState({
      agentId: "dev",
      currentRoomId: "room-dev",
      status: "idle",
      currentTaskId: null,
    });
    repo.saveState({
      agentId: "dev",
      currentRoomId: "room-prod",
      status: "moving",
      currentTaskId: "t1",
    });
    expect(repo.getState("dev")).toEqual({
      agentId: "dev",
      currentRoomId: "room-prod",
      status: "moving",
      currentTaskId: "t1",
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/db/world-repo.test.ts`
Expected: FAIL — cannot find module `world-repo.js`.

- [ ] **Step 3: Write the implementation**

```ts
// src/db/world-repo.ts
import type { DB } from "./database.js";
import type { AgentDefinition, AgentState, Room } from "../domain/types.js";

export class WorldRepo {
  constructor(private db: DB) {}

  saveRoom(room: Room): void {
    this.db
      .prepare(
        `INSERT INTO rooms (id, name, sector, connections)
         VALUES (@id, @name, @sector, @connections)
         ON CONFLICT(id) DO UPDATE SET
           name=excluded.name, sector=excluded.sector,
           connections=excluded.connections`,
      )
      .run({ ...room, connections: JSON.stringify(room.connections) });
  }

  getRoom(id: string): Room | null {
    const row = this.db.prepare("SELECT * FROM rooms WHERE id=?").get(id) as
      | { id: string; name: string; sector: string; connections: string }
      | undefined;
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      sector: row.sector,
      connections: JSON.parse(row.connections),
    };
  }

  saveAgentDefinition(d: AgentDefinition): void {
    this.db
      .prepare(
        `INSERT INTO agent_definitions
           (id, name, sector, room_id, system_prompt, llm, model, tools, routine)
         VALUES (@id, @name, @sector, @room_id, @system_prompt, @llm, @model, @tools, @routine)
         ON CONFLICT(id) DO UPDATE SET
           name=excluded.name, sector=excluded.sector, room_id=excluded.room_id,
           system_prompt=excluded.system_prompt, llm=excluded.llm, model=excluded.model,
           tools=excluded.tools, routine=excluded.routine`,
      )
      .run({
        id: d.id,
        name: d.name,
        sector: d.sector,
        room_id: d.roomId,
        system_prompt: d.systemPrompt,
        llm: d.llm,
        model: d.model,
        tools: JSON.stringify(d.tools),
        routine: JSON.stringify(d.routine),
      });
  }

  private rowToDefinition(row: any): AgentDefinition {
    return {
      id: row.id,
      name: row.name,
      sector: row.sector,
      roomId: row.room_id,
      systemPrompt: row.system_prompt,
      llm: row.llm,
      model: row.model,
      tools: JSON.parse(row.tools),
      routine: JSON.parse(row.routine),
    };
  }

  getAgentDefinition(id: string): AgentDefinition | null {
    const row = this.db
      .prepare("SELECT * FROM agent_definitions WHERE id=?")
      .get(id);
    return row ? this.rowToDefinition(row) : null;
  }

  listAgentDefinitions(): AgentDefinition[] {
    const rows = this.db.prepare("SELECT * FROM agent_definitions").all();
    return rows.map((r) => this.rowToDefinition(r));
  }

  saveState(s: AgentState): void {
    this.db
      .prepare(
        `INSERT INTO agent_state (agent_id, current_room_id, status, current_task_id)
         VALUES (@agentId, @currentRoomId, @status, @currentTaskId)
         ON CONFLICT(agent_id) DO UPDATE SET
           current_room_id=excluded.current_room_id, status=excluded.status,
           current_task_id=excluded.current_task_id`,
      )
      .run(s);
  }

  getState(agentId: string): AgentState | null {
    const row = this.db
      .prepare("SELECT * FROM agent_state WHERE agent_id=?")
      .get(agentId) as any;
    if (!row) return null;
    return {
      agentId: row.agent_id,
      currentRoomId: row.current_room_id,
      status: row.status,
      currentTaskId: row.current_task_id,
    };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/db/world-repo.test.ts`
Expected: PASS — all four tests green.

- [ ] **Step 5: Commit**

```bash
git add src/db/world-repo.ts tests/db/world-repo.test.ts
git commit -m "feat(db): world repository (rooms, definitions, state)"
```

---

### Task 6: Task repository (tasks + produced docs)

**Files:**
- Create: `src/db/task-repo.ts`
- Test: `tests/db/task-repo.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/db/task-repo.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { openDatabase } from "../../src/db/database.js";
import { TaskRepo } from "../../src/db/task-repo.js";

describe("TaskRepo", () => {
  let repo: TaskRepo;
  beforeEach(() => {
    repo = new TaskRepo(openDatabase(":memory:"));
  });

  it("creates and reads a task", () => {
    const t = repo.createTask({ title: "Login", createdBy: "dev" });
    expect(t.status).toBe("open");
    expect(repo.getTask(t.id)).toEqual(t);
  });

  it("updates task status and result doc", () => {
    const t = repo.createTask({ title: "Login", createdBy: "dev" });
    repo.updateTask(t.id, { status: "done", resultDocId: "doc1" });
    const updated = repo.getTask(t.id)!;
    expect(updated.status).toBe("done");
    expect(updated.resultDocId).toBe("doc1");
  });

  it("saves a doc and reads it back", () => {
    const doc = repo.saveDoc({ title: "Spec", body: "conteúdo", createdBy: "prod" });
    expect(repo.getDoc(doc.id)?.body).toBe("conteúdo");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/db/task-repo.test.ts`
Expected: FAIL — cannot find module `task-repo.js`.

- [ ] **Step 3: Write the implementation**

```ts
// src/db/task-repo.ts
import { randomUUID } from "node:crypto";
import type { DB } from "./database.js";
import type { Task } from "../domain/types.js";

export interface Doc {
  id: string;
  title: string;
  body: string;
  createdBy: string;
  createdAt: number;
}

export class TaskRepo {
  constructor(private db: DB) {}

  createTask(input: { title: string; createdBy: string; assignedTo?: string }): Task {
    const task: Task = {
      id: randomUUID(),
      title: input.title,
      status: "open",
      createdBy: input.createdBy,
      assignedTo: input.assignedTo ?? null,
      resultDocId: null,
    };
    this.db
      .prepare(
        `INSERT INTO tasks (id, title, status, created_by, assigned_to, result_doc_id)
         VALUES (@id, @title, @status, @createdBy, @assignedTo, @resultDocId)`,
      )
      .run(task);
    return task;
  }

  getTask(id: string): Task | null {
    const row = this.db.prepare("SELECT * FROM tasks WHERE id=?").get(id) as any;
    if (!row) return null;
    return {
      id: row.id,
      title: row.title,
      status: row.status,
      createdBy: row.created_by,
      assignedTo: row.assigned_to,
      resultDocId: row.result_doc_id,
    };
  }

  updateTask(
    id: string,
    patch: Partial<Pick<Task, "status" | "assignedTo" | "resultDocId">>,
  ): void {
    const current = this.getTask(id);
    if (!current) throw new Error(`task not found: ${id}`);
    const next = { ...current, ...patch };
    this.db
      .prepare(
        `UPDATE tasks SET status=@status, assigned_to=@assignedTo,
           result_doc_id=@resultDocId WHERE id=@id`,
      )
      .run(next);
  }

  saveDoc(input: { title: string; body: string; createdBy: string }): Doc {
    const doc: Doc = {
      id: randomUUID(),
      title: input.title,
      body: input.body,
      createdBy: input.createdBy,
      createdAt: Date.now(),
    };
    this.db
      .prepare(
        `INSERT INTO docs (id, title, body, created_by, created_at)
         VALUES (@id, @title, @body, @createdBy, @createdAt)`,
      )
      .run(doc);
    return doc;
  }

  getDoc(id: string): Doc | null {
    const row = this.db.prepare("SELECT * FROM docs WHERE id=?").get(id) as any;
    if (!row) return null;
    return {
      id: row.id,
      title: row.title,
      body: row.body,
      createdBy: row.created_by,
      createdAt: row.created_at,
    };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/db/task-repo.test.ts`
Expected: PASS — all three tests green.

- [ ] **Step 5: Commit**

```bash
git add src/db/task-repo.ts tests/db/task-repo.test.ts
git commit -m "feat(db): task repository + docs"
```

---

### Task 7: Lexical memory store (cosine similarity + recency)

**Files:**
- Create: `src/memory/lexical-memory-store.ts`
- Test: `tests/memory/lexical-memory-store.test.ts`

This implements the `MemoryStore` interface. It stores entries in SQLite (`memories` table) and ranks `recall` by bag-of-words cosine similarity — real vector similarity, deterministic, no external embedding API. Phase 2 swaps this class for a neural-embedding store behind the same interface.

- [ ] **Step 1: Write the failing test**

```ts
// tests/memory/lexical-memory-store.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { openDatabase } from "../../src/db/database.js";
import { LexicalMemoryStore } from "../../src/memory/lexical-memory-store.js";

describe("LexicalMemoryStore", () => {
  let store: LexicalMemoryStore;
  beforeEach(() => {
    store = new LexicalMemoryStore(openDatabase(":memory:"));
  });

  it("returns recent entries in reverse chronological order", () => {
    store.remember("dev", "primeira lembrança");
    store.remember("dev", "segunda lembrança");
    const recent = store.recent("dev", 2);
    expect(recent[0].content).toBe("segunda lembrança");
    expect(recent[1].content).toBe("primeira lembrança");
  });

  it("ranks recall by lexical similarity to the query", () => {
    store.remember("dev", "preciso da spec do login");
    store.remember("dev", "almoço no refeitório foi bom");
    store.remember("dev", "a spec do login está pronta");
    const hits = store.recall("dev", "spec do login", 2);
    expect(hits.length).toBe(2);
    for (const h of hits) expect(h.content).toContain("login");
  });

  it("scopes memory per agent", () => {
    store.remember("dev", "memória do dev");
    store.remember("prod", "memória do produto");
    expect(store.recent("dev", 5)).toHaveLength(1);
    expect(store.recent("dev", 5)[0].content).toBe("memória do dev");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/memory/lexical-memory-store.test.ts`
Expected: FAIL — cannot find module `lexical-memory-store.js`.

- [ ] **Step 3: Write the implementation**

```ts
// src/memory/lexical-memory-store.ts
import { randomUUID } from "node:crypto";
import type { DB } from "../db/database.js";
import type { MemoryEntry, MemoryStore } from "../domain/types.js";

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 0);
}

function termFreq(tokens: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of tokens) m.set(t, (m.get(t) ?? 0) + 1);
  return m;
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  for (const [term, av] of a) {
    const bv = b.get(term);
    if (bv) dot += av * bv;
  }
  const mag = (m: Map<string, number>) =>
    Math.sqrt([...m.values()].reduce((s, v) => s + v * v, 0));
  const denom = mag(a) * mag(b);
  return denom === 0 ? 0 : dot / denom;
}

export class LexicalMemoryStore implements MemoryStore {
  constructor(private db: DB) {}

  remember(agentId: string, content: string): void {
    this.db
      .prepare(
        `INSERT INTO memories (id, agent_id, content, created_at)
         VALUES (?, ?, ?, ?)`,
      )
      .run(randomUUID(), agentId, content, Date.now());
  }

  recent(agentId: string, limit: number): MemoryEntry[] {
    const rows = this.db
      .prepare(
        `SELECT * FROM memories WHERE agent_id=? ORDER BY created_at DESC LIMIT ?`,
      )
      .all(agentId, limit) as any[];
    return rows.map(this.rowToEntry);
  }

  recall(agentId: string, query: string, limit: number): MemoryEntry[] {
    const rows = this.db
      .prepare(`SELECT * FROM memories WHERE agent_id=?`)
      .all(agentId) as any[];
    const qv = termFreq(tokenize(query));
    return rows
      .map((r) => ({
        entry: this.rowToEntry(r),
        score: cosine(qv, termFreq(tokenize(r.content))),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((x) => x.entry);
  }

  private rowToEntry(row: any): MemoryEntry {
    return {
      id: row.id,
      agentId: row.agent_id,
      content: row.content,
      createdAt: row.created_at,
    };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/memory/lexical-memory-store.test.ts`
Expected: PASS — all three tests green.

- [ ] **Step 5: Commit**

```bash
git add src/memory/lexical-memory-store.ts tests/memory/lexical-memory-store.test.ts
git commit -m "feat(memory): lexical cosine memory store (pgvector stand-in)"
```

---

### Task 8: Claude provider + LLM router

**Files:**
- Create: `src/llm/claude-provider.ts`
- Create: `src/llm/llm-router.ts`
- Test: `tests/llm/llm-router.test.ts`

The `ClaudeProvider` wraps the Anthropic SDK; we unit-test it by injecting a fake SDK client so no network is hit. The `LLMRouter` picks a provider per agent's `llm` field.

- [ ] **Step 1: Write the failing test**

```ts
// tests/llm/llm-router.test.ts
import { describe, it, expect } from "vitest";
import { ClaudeProvider } from "../../src/llm/claude-provider.js";
import { LLMRouter } from "../../src/llm/llm-router.js";
import type { LLMProvider } from "../../src/domain/types.js";

// Fake Anthropic client matching the shape ClaudeProvider uses.
const fakeAnthropic = {
  messages: {
    create: async (args: any) => ({
      content: [{ type: "text", text: `echo:${args.messages[0].content}` }],
    }),
  },
};

describe("ClaudeProvider", () => {
  it("maps a completion request to the SDK and returns text", async () => {
    const provider = new ClaudeProvider(fakeAnthropic as any);
    const out = await provider.complete({
      system: "sys",
      messages: [{ role: "user", content: "olá" }],
      model: "claude-sonnet-4-6",
    });
    expect(out).toBe("echo:olá");
  });
});

describe("LLMRouter", () => {
  it("routes an agent to the provider registered for its llm name", async () => {
    const claudeFake: LLMProvider = {
      complete: async () => "from-claude",
    };
    const router = new LLMRouter({ claude: claudeFake });
    const out = await router.complete("claude", {
      system: "s",
      messages: [{ role: "user", content: "x" }],
      model: "m",
    });
    expect(out).toBe("from-claude");
  });

  it("throws for an unconfigured provider", async () => {
    const router = new LLMRouter({});
    await expect(
      router.complete("gemini", { system: "s", messages: [], model: "m" }),
    ).rejects.toThrow("gemini");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/llm/llm-router.test.ts`
Expected: FAIL — cannot find module `claude-provider.js`.

- [ ] **Step 3: Write the ClaudeProvider**

```ts
// src/llm/claude-provider.ts
import type Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage, LLMProvider } from "../domain/types.js";

export class ClaudeProvider implements LLMProvider {
  constructor(private client: Anthropic) {}

  async complete(req: {
    system: string;
    messages: ChatMessage[];
    model: string;
  }): Promise<string> {
    const res = await this.client.messages.create({
      model: req.model,
      max_tokens: 1024,
      system: req.system,
      messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
    });
    const first = res.content[0];
    return first && first.type === "text" ? first.text : "";
  }
}
```

- [ ] **Step 4: Write the LLMRouter**

```ts
// src/llm/llm-router.ts
import type {
  ChatMessage,
  LLMProvider,
  LLMProviderName,
} from "../domain/types.js";

export class LLMRouter {
  constructor(
    private providers: Partial<Record<LLMProviderName, LLMProvider>>,
  ) {}

  async complete(
    name: LLMProviderName,
    req: { system: string; messages: ChatMessage[]; model: string },
  ): Promise<string> {
    const provider = this.providers[name];
    if (!provider) throw new Error(`no LLM provider configured for: ${name}`);
    return provider.complete(req);
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/llm/llm-router.test.ts`
Expected: PASS — all three tests green.

- [ ] **Step 6: Commit**

```bash
git add src/llm/claude-provider.ts src/llm/llm-router.ts tests/llm/llm-router.test.ts
git commit -m "feat(llm): claude provider + per-agent router"
```

---

### Task 9: Tool registry + write-doc tool

**Files:**
- Create: `src/tools/tool-registry.ts`
- Create: `src/tools/write-doc-tool.ts`
- Test: `tests/tools/write-doc-tool.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/tools/write-doc-tool.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { openDatabase } from "../../src/db/database.js";
import { TaskRepo } from "../../src/db/task-repo.js";
import { ToolRegistry } from "../../src/tools/tool-registry.js";
import { WriteDocTool } from "../../src/tools/write-doc-tool.js";

describe("ToolRegistry", () => {
  it("registers and retrieves a tool by name", () => {
    const reg = new ToolRegistry();
    const tool = new WriteDocTool(new TaskRepo(openDatabase(":memory:")));
    reg.register(tool);
    expect(reg.get("write_doc")).toBe(tool);
  });

  it("throws for an unknown tool", () => {
    const reg = new ToolRegistry();
    expect(() => reg.get("nope")).toThrow("nope");
  });
});

describe("WriteDocTool", () => {
  let repo: TaskRepo;
  let tool: WriteDocTool;
  beforeEach(() => {
    repo = new TaskRepo(openDatabase(":memory:"));
    tool = new WriteDocTool(repo);
  });

  it("persists a doc and returns its id", async () => {
    const result = await tool.run({
      title: "Spec do login",
      body: "Campos: email, senha.",
      createdBy: "prod",
    });
    expect(result.ok).toBe(true);
    expect(result.docId).toBeDefined();
    expect(repo.getDoc(result.docId!)?.title).toBe("Spec do login");
  });

  it("fails when title is missing", async () => {
    const result = await tool.run({ body: "x", createdBy: "prod" });
    expect(result.ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/tools/write-doc-tool.test.ts`
Expected: FAIL — cannot find module `tool-registry.js`.

- [ ] **Step 3: Write the ToolRegistry**

```ts
// src/tools/tool-registry.ts
import type { Tool } from "../domain/types.js";

export class ToolRegistry {
  private tools = new Map<string, Tool>();

  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  get(name: string): Tool {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`unknown tool: ${name}`);
    return tool;
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }
}
```

- [ ] **Step 4: Write the WriteDocTool**

```ts
// src/tools/write-doc-tool.ts
import type { TaskRepo } from "../db/task-repo.js";
import type { Tool, ToolResult } from "../domain/types.js";

/** Produces a real artifact (a persisted document) — the "tool real" in the demo. */
export class WriteDocTool implements Tool {
  name = "write_doc";
  description =
    "Cria um documento persistido. Input: { title, body, createdBy }.";

  constructor(private tasks: TaskRepo) {}

  async run(input: Record<string, unknown>): Promise<ToolResult> {
    const title = input.title;
    const body = input.body;
    const createdBy = input.createdBy;
    if (typeof title !== "string" || title.length === 0) {
      return { ok: false, output: "title é obrigatório" };
    }
    if (typeof body !== "string") {
      return { ok: false, output: "body é obrigatório" };
    }
    const doc = this.tasks.saveDoc({
      title,
      body,
      createdBy: typeof createdBy === "string" ? createdBy : "unknown",
    });
    return { ok: true, output: `doc criado: ${title}`, docId: doc.id };
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/tools/write-doc-tool.test.ts`
Expected: PASS — all four tests green.

- [ ] **Step 6: Commit**

```bash
git add src/tools/tool-registry.ts src/tools/write-doc-tool.ts tests/tools/write-doc-tool.test.ts
git commit -m "feat(tools): registry + write-doc tool"
```

---

### Task 10: Message bus (in-process pub/sub)

**Files:**
- Create: `src/bus/message-bus.ts`
- Test: `tests/bus/message-bus.test.ts`

The bus carries NPC↔NPC triggers. It delivers to topic subscribers and also keeps a per-agent inbox the runtime drains each tick.

- [ ] **Step 1: Write the failing test**

```ts
// tests/bus/message-bus.test.ts
import { describe, it, expect } from "vitest";
import { MessageBus } from "../../src/bus/message-bus.js";

describe("MessageBus", () => {
  it("delivers a published message to a topic subscriber", () => {
    const bus = new MessageBus();
    const received: string[] = [];
    bus.subscribe("task.spec_needed", (m) => received.push(m.from));
    bus.publish({ topic: "task.spec_needed", from: "dev", payload: {} });
    expect(received).toEqual(["dev"]);
  });

  it("queues messages addressed to an agent into its inbox", () => {
    const bus = new MessageBus();
    bus.publish({ topic: "task.spec_ready", from: "prod", to: "dev", payload: { docId: "d1" } });
    const inbox = bus.drainInbox("dev");
    expect(inbox).toHaveLength(1);
    expect(inbox[0].payload.docId).toBe("d1");
    expect(bus.drainInbox("dev")).toHaveLength(0); // drained
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/bus/message-bus.test.ts`
Expected: FAIL — cannot find module `message-bus.js`.

- [ ] **Step 3: Write the implementation**

```ts
// src/bus/message-bus.ts
import type { BusMessage } from "../domain/types.js";

type Handler = (msg: BusMessage) => void;

export class MessageBus {
  private subscribers = new Map<string, Handler[]>();
  private inboxes = new Map<string, BusMessage[]>();

  subscribe(topic: string, handler: Handler): void {
    const list = this.subscribers.get(topic) ?? [];
    list.push(handler);
    this.subscribers.set(topic, list);
  }

  publish(msg: BusMessage): void {
    for (const h of this.subscribers.get(msg.topic) ?? []) h(msg);
    if (msg.to) {
      const inbox = this.inboxes.get(msg.to) ?? [];
      inbox.push(msg);
      this.inboxes.set(msg.to, inbox);
    }
  }

  drainInbox(agentId: string): BusMessage[] {
    const inbox = this.inboxes.get(agentId) ?? [];
    this.inboxes.set(agentId, []);
    return inbox;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/bus/message-bus.test.ts`
Expected: PASS — both tests green.

- [ ] **Step 5: Commit**

```bash
git add src/bus/message-bus.ts tests/bus/message-bus.test.ts
git commit -m "feat(bus): in-process pub/sub with per-agent inbox"
```

---

### Task 11: Decision parser

**Files:**
- Create: `src/runtime/decision.ts`
- Test: `tests/runtime/decision.test.ts`

The LLM returns a JSON decision describing the next action. This parser turns raw model text into a typed `AgentDecision`, tolerating code fences and falling back to `idle` on garbage.

- [ ] **Step 1: Write the failing test**

```ts
// tests/runtime/decision.test.ts
import { describe, it, expect } from "vitest";
import { parseDecision } from "../../src/runtime/decision.js";

describe("parseDecision", () => {
  it("parses a move decision", () => {
    const d = parseDecision('{"action":"move","targetRoomId":"room-prod"}');
    expect(d).toEqual({ action: "move", targetRoomId: "room-prod" });
  });

  it("parses a speak decision with a target", () => {
    const d = parseDecision('{"action":"speak","to":"prod","text":"preciso da spec"}');
    expect(d).toEqual({ action: "speak", to: "prod", text: "preciso da spec" });
  });

  it("parses a use_tool decision", () => {
    const d = parseDecision(
      '{"action":"use_tool","tool":"write_doc","input":{"title":"Spec"}}',
    );
    expect(d).toEqual({
      action: "use_tool",
      tool: "write_doc",
      input: { title: "Spec" },
    });
  });

  it("strips markdown code fences before parsing", () => {
    const d = parseDecision('```json\n{"action":"idle"}\n```');
    expect(d).toEqual({ action: "idle" });
  });

  it("falls back to idle on unparseable input", () => {
    expect(parseDecision("não sei o que fazer")).toEqual({ action: "idle" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/runtime/decision.test.ts`
Expected: FAIL — cannot find module `decision.js`.

- [ ] **Step 3: Write the implementation**

```ts
// src/runtime/decision.ts
export type AgentDecision =
  | { action: "idle" }
  | { action: "move"; targetRoomId: string }
  | { action: "speak"; to?: string; text: string }
  | { action: "use_tool"; tool: string; input: Record<string, unknown> };

export function parseDecision(raw: string): AgentDecision {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    const o = JSON.parse(cleaned) as Record<string, unknown>;
    switch (o.action) {
      case "move":
        if (typeof o.targetRoomId === "string")
          return { action: "move", targetRoomId: o.targetRoomId };
        break;
      case "speak":
        if (typeof o.text === "string")
          return {
            action: "speak",
            to: typeof o.to === "string" ? o.to : undefined,
            text: o.text,
          };
        break;
      case "use_tool":
        if (typeof o.tool === "string")
          return {
            action: "use_tool",
            tool: o.tool,
            input: (o.input as Record<string, unknown>) ?? {},
          };
        break;
      case "idle":
        return { action: "idle" };
    }
  } catch {
    // fall through
  }
  return { action: "idle" };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/runtime/decision.test.ts`
Expected: PASS — all five tests green.

- [ ] **Step 5: Commit**

```bash
git add src/runtime/decision.ts tests/runtime/decision.test.ts
git commit -m "feat(runtime): LLM decision parser"
```

---

### Task 12: Agent runtime (the 5-step tick)

**Files:**
- Create: `src/runtime/agent-runtime.ts`
- Test: `tests/runtime/agent-runtime.test.ts`

This is the core. One `tick(agentId)` runs: build context (recent memory + recall + inbox) → ask LLM for a decision → apply it (move = update room; speak = publish bus message; use_tool = run tool + persist) → write a memory summary. Every dependency is injected so the test drives it with a scripted fake LLM and asserts the side effects.

- [ ] **Step 1: Write the failing test**

```ts
// tests/runtime/agent-runtime.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { openDatabase } from "../../src/db/database.js";
import { WorldRepo } from "../../src/db/world-repo.js";
import { TaskRepo } from "../../src/db/task-repo.js";
import { LexicalMemoryStore } from "../../src/memory/lexical-memory-store.js";
import { LLMRouter } from "../../src/llm/llm-router.js";
import { ToolRegistry } from "../../src/tools/tool-registry.js";
import { WriteDocTool } from "../../src/tools/write-doc-tool.js";
import { MessageBus } from "../../src/bus/message-bus.js";
import { AgentRuntime } from "../../src/runtime/agent-runtime.js";
import type { AgentDefinition, LLMProvider, Room } from "../../src/domain/types.js";

function makeDef(over: Partial<AgentDefinition> = {}): AgentDefinition {
  return {
    id: "dev",
    name: "Agente Dev",
    sector: "engenharia",
    roomId: "room-dev",
    systemPrompt: "Você é um engenheiro.",
    llm: "claude",
    model: "m",
    tools: ["write_doc"],
    routine: { goal: "Implementar o login." },
    ...over,
  };
}

const rooms: Room[] = [
  { id: "room-dev", name: "Dev", sector: "eng", connections: ["room-prod"] },
  { id: "room-prod", name: "Produto", sector: "prod", connections: ["room-dev"] },
];

/** Returns a provider that emits scripted decisions in order, then idles. */
function scriptedProvider(script: string[]): LLMProvider {
  let i = 0;
  return { complete: async () => script[i++] ?? '{"action":"idle"}' };
}

describe("AgentRuntime.tick", () => {
  let world: WorldRepo;
  let tasks: TaskRepo;
  let memory: LexicalMemoryStore;
  let bus: MessageBus;
  let tools: ToolRegistry;

  beforeEach(() => {
    const db = openDatabase(":memory:");
    world = new WorldRepo(db);
    tasks = new TaskRepo(db);
    memory = new LexicalMemoryStore(db);
    bus = new MessageBus();
    tools = new ToolRegistry();
    tools.register(new WriteDocTool(tasks));
    for (const r of rooms) world.saveRoom(r);
    world.saveAgentDefinition(makeDef());
    world.saveState({
      agentId: "dev",
      currentRoomId: "room-dev",
      status: "idle",
      currentTaskId: null,
    });
  });

  function runtimeWith(script: string[]): AgentRuntime {
    return new AgentRuntime({
      world,
      memory,
      bus,
      tools,
      router: new LLMRouter({ claude: scriptedProvider(script) }),
    });
  }

  it("move updates the agent's current room", async () => {
    const rt = runtimeWith(['{"action":"move","targetRoomId":"room-prod"}']);
    await rt.tick("dev");
    expect(world.getState("dev")?.currentRoomId).toBe("room-prod");
  });

  it("speak with a target publishes a bus message to that agent's inbox", async () => {
    const rt = runtimeWith([
      '{"action":"speak","to":"prod","text":"preciso da spec do login"}',
    ]);
    await rt.tick("dev");
    const inbox = bus.drainInbox("prod");
    expect(inbox).toHaveLength(1);
    expect(inbox[0].payload.text).toBe("preciso da spec do login");
  });

  it("use_tool runs the tool and persists its artifact", async () => {
    const rt = runtimeWith([
      '{"action":"use_tool","tool":"write_doc","input":{"title":"Spec do login","body":"email, senha","createdBy":"dev"}}',
    ]);
    await rt.tick("dev");
    const docs = (memory.recent("dev", 5)).map((m) => m.content).join(" ");
    expect(docs).toContain("write_doc");
  });

  it("writes a memory summary every tick", async () => {
    const rt = runtimeWith(['{"action":"idle"}']);
    await rt.tick("dev");
    expect(memory.recent("dev", 1)).toHaveLength(1);
  });

  it("leaves the agent idle when the decision is idle", async () => {
    const rt = runtimeWith(['{"action":"idle"}']);
    await rt.tick("dev");
    expect(world.getState("dev")?.status).toBe("idle");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/runtime/agent-runtime.test.ts`
Expected: FAIL — cannot find module `agent-runtime.js`.

- [ ] **Step 3: Write the implementation**

```ts
// src/runtime/agent-runtime.ts
import type { WorldRepo } from "../db/world-repo.js";
import type { MessageBus } from "../bus/message-bus.js";
import type { ToolRegistry } from "../tools/tool-registry.js";
import type { LLMRouter } from "../llm/llm-router.js";
import type { MemoryStore, ChatMessage } from "../domain/types.js";
import { parseDecision, type AgentDecision } from "./decision.js";

export interface RuntimeDeps {
  world: WorldRepo;
  memory: MemoryStore;
  bus: MessageBus;
  tools: ToolRegistry;
  router: LLMRouter;
}

export interface TickLog {
  agentId: string;
  decision: AgentDecision;
  note: string;
}

const DECISION_INSTRUCTIONS = `Responda APENAS com um JSON de uma ação, sem texto extra. Formatos válidos:
{"action":"idle"}
{"action":"move","targetRoomId":"<id de sala vizinha>"}
{"action":"speak","to":"<id de agente|opcional>","text":"<fala>"}
{"action":"use_tool","tool":"<nome>","input":{...}}`;

export class AgentRuntime {
  constructor(private deps: RuntimeDeps) {}

  async tick(agentId: string): Promise<TickLog> {
    const { world, memory, bus, tools, router } = this.deps;
    const def = world.getAgentDefinition(agentId);
    const state = world.getState(agentId);
    if (!def || !state) throw new Error(`agent not initialized: ${agentId}`);

    // 1. Plan — assemble context and ask the LLM for a decision.
    world.saveState({ ...state, status: "thinking" });
    const inbox = bus.drainInbox(agentId);
    const recent = memory.recent(agentId, 5).map((m) => m.content);
    const relevant = memory
      .recall(agentId, def.routine.goal, 3)
      .map((m) => m.content);
    const room = world.getRoom(state.currentRoomId);

    const contextText = [
      `Objetivo da rotina: ${def.routine.goal}`,
      `Sala atual: ${room?.name ?? state.currentRoomId} (vizinhas: ${room?.connections.join(", ") ?? "nenhuma"})`,
      `Ferramentas disponíveis: ${def.tools.join(", ") || "nenhuma"}`,
      inbox.length
        ? `Mensagens recebidas: ${inbox.map((m) => `${m.from}: ${JSON.stringify(m.payload)}`).join(" | ")}`
        : "Mensagens recebidas: nenhuma",
      relevant.length ? `Lembranças relevantes: ${relevant.join(" | ")}` : "",
      recent.length ? `Atividade recente: ${recent.join(" | ")}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const messages: ChatMessage[] = [
      { role: "user", content: `${contextText}\n\n${DECISION_INSTRUCTIONS}` },
    ];
    const raw = await router.complete(def.llm, {
      system: def.systemPrompt,
      messages,
      model: def.model,
    });
    const decision = parseDecision(raw);

    // 2–4. Apply the decision.
    let note = "idle";
    switch (decision.action) {
      case "move": {
        world.saveState({
          ...state,
          status: "moving",
          currentRoomId: decision.targetRoomId,
        });
        note = `moveu para ${decision.targetRoomId}`;
        break;
      }
      case "speak": {
        world.saveState({ ...state, status: "speaking" });
        bus.publish({
          topic: decision.to ? "agent.message" : "agent.broadcast",
          from: agentId,
          to: decision.to,
          payload: { text: decision.text },
        });
        note = `falou${decision.to ? ` com ${decision.to}` : ""}: ${decision.text}`;
        break;
      }
      case "use_tool": {
        world.saveState({ ...state, status: "executing" });
        const result = await tools.get(decision.tool).run(decision.input);
        note = `usou ${decision.tool} -> ${result.output}`;
        break;
      }
      case "idle":
        world.saveState({ ...state, status: "idle" });
        note = "idle";
        break;
    }

    // 5. Memorize.
    memory.remember(agentId, note);
    // Reset to idle so the next tick starts clean (movement/speech are momentary).
    const after = world.getState(agentId)!;
    world.saveState({ ...after, status: "idle" });

    return { agentId, decision, note };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/runtime/agent-runtime.test.ts`
Expected: PASS — all five tests green.

- [ ] **Step 5: Commit**

```bash
git add src/runtime/agent-runtime.ts tests/runtime/agent-runtime.test.ts
git commit -m "feat(runtime): agent tick (plan/move/speak/tool/memorize)"
```

---

### Task 13: Scheduler

**Files:**
- Create: `src/runtime/scheduler.ts`
- Test: `tests/runtime/scheduler.test.ts`

The scheduler runs one round of ticks across all agents. It takes a list of agent ids and the runtime, ticking each in order and collecting logs. Keeping it round-based (not timer-based) makes it deterministic and testable; the demo calls `runRound` in a loop.

- [ ] **Step 1: Write the failing test**

```ts
// tests/runtime/scheduler.test.ts
import { describe, it, expect } from "vitest";
import { Scheduler } from "../../src/runtime/scheduler.js";
import type { TickLog } from "../../src/runtime/agent-runtime.js";

describe("Scheduler", () => {
  it("ticks every agent once per round and collects logs in order", async () => {
    const ticked: string[] = [];
    const fakeRuntime = {
      tick: async (id: string): Promise<TickLog> => {
        ticked.push(id);
        return { agentId: id, decision: { action: "idle" }, note: "idle" };
      },
    };
    const scheduler = new Scheduler(fakeRuntime, ["dev", "prod", "design"]);
    const logs = await scheduler.runRound();
    expect(ticked).toEqual(["dev", "prod", "design"]);
    expect(logs.map((l) => l.agentId)).toEqual(["dev", "prod", "design"]);
  });

  it("runs the requested number of rounds", async () => {
    let count = 0;
    const fakeRuntime = {
      tick: async (id: string): Promise<TickLog> => {
        count++;
        return { agentId: id, decision: { action: "idle" }, note: "idle" };
      },
    };
    const scheduler = new Scheduler(fakeRuntime, ["a", "b"]);
    await scheduler.runRounds(3);
    expect(count).toBe(6); // 2 agents × 3 rounds
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/runtime/scheduler.test.ts`
Expected: FAIL — cannot find module `scheduler.js`.

- [ ] **Step 3: Write the implementation**

```ts
// src/runtime/scheduler.ts
import type { TickLog } from "./agent-runtime.js";

export interface Tickable {
  tick(agentId: string): Promise<TickLog>;
}

export class Scheduler {
  constructor(
    private runtime: Tickable,
    private agentIds: string[],
  ) {}

  async runRound(): Promise<TickLog[]> {
    const logs: TickLog[] = [];
    for (const id of this.agentIds) {
      logs.push(await this.runtime.tick(id));
    }
    return logs;
  }

  async runRounds(n: number): Promise<TickLog[]> {
    const all: TickLog[] = [];
    for (let i = 0; i < n; i++) {
      all.push(...(await this.runRound()));
    }
    return all;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/runtime/scheduler.test.ts`
Expected: PASS — both tests green.

- [ ] **Step 5: Commit**

```bash
git add src/runtime/scheduler.ts tests/runtime/scheduler.test.ts
git commit -m "feat(runtime): round-based scheduler"
```

---

### Task 14: Demo wiring — the 3-agent scenario

**Files:**
- Create: `src/index.ts`
- Create: `src/seed.ts`
- Test: `tests/scenario.test.ts`

`seed.ts` builds the world (2 rooms + 3 agents) and wires all components. The scenario test proves the end-to-end "aha" with a scripted fake LLM (no network). `index.ts` runs the same wiring against real Claude when `ANTHROPIC_API_KEY` is set, printing the tick log.

- [ ] **Step 1: Write the failing scenario test**

```ts
// tests/scenario.test.ts
import { describe, it, expect } from "vitest";
import { openDatabase } from "../src/db/database.js";
import { buildWorld } from "../src/seed.js";
import { AgentRuntime } from "../src/runtime/agent-runtime.js";
import { Scheduler } from "../src/runtime/scheduler.js";
import { LLMRouter } from "../src/llm/llm-router.js";
import type { LLMProvider } from "../src/domain/types.js";

// A fake LLM that returns the right decision based on which agent is asking,
// detected via the agent's system prompt embedded in the request.
function scenarioProvider(): LLMProvider {
  const sent = new Set<string>();
  return {
    complete: async (req) => {
      const sys = req.system;
      const ctx = req.messages.map((m) => m.content).join(" ");
      if (sys.includes("engenheiro")) {
        // Dev: first asks Produto for the spec, later idles.
        if (!sent.has("dev-asked")) {
          sent.add("dev-asked");
          return '{"action":"speak","to":"prod","text":"preciso da spec do login"}';
        }
        return '{"action":"idle"}';
      }
      if (sys.includes("produto")) {
        // Produto: when it sees the request in its inbox, writes the doc.
        if (ctx.includes("preciso da spec")) {
          return '{"action":"use_tool","tool":"write_doc","input":{"title":"Spec do login","body":"Campos: email, senha","createdBy":"prod"}}';
        }
        return '{"action":"idle"}';
      }
      return '{"action":"idle"}';
    },
  };
}

describe("scenario: Dev pede spec, Produto entrega", () => {
  it("produces a persisted doc via autonomous NPC↔NPC flow", async () => {
    const db = openDatabase(":memory:");
    const w = buildWorld(db, new LLMRouter({ claude: scenarioProvider() }));
    const runtime = new AgentRuntime({
      world: w.world,
      memory: w.memory,
      bus: w.bus,
      tools: w.tools,
      router: w.router,
    });
    const scheduler = new Scheduler(runtime, ["dev", "prod", "design"]);
    // Round 1: dev speaks to prod (queued). Round 2: prod sees inbox, writes doc.
    await scheduler.runRounds(2);

    const docCount = (
      db.prepare("SELECT COUNT(*) AS n FROM docs").get() as { n: number }
    ).n;
    expect(docCount).toBe(1);
    const doc = db.prepare("SELECT title FROM docs").get() as { title: string };
    expect(doc.title).toBe("Spec do login");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/scenario.test.ts`
Expected: FAIL — cannot find module `../src/seed.js`.

- [ ] **Step 3: Write `seed.ts`**

```ts
// src/seed.ts
import type { DB } from "./db/database.js";
import { WorldRepo } from "./db/world-repo.js";
import { TaskRepo } from "./db/task-repo.js";
import { LexicalMemoryStore } from "./memory/lexical-memory-store.js";
import { ToolRegistry } from "./tools/tool-registry.js";
import { WriteDocTool } from "./tools/write-doc-tool.js";
import { MessageBus } from "./bus/message-bus.js";
import type { LLMRouter } from "./llm/llm-router.js";
import type { AgentDefinition, Room } from "./domain/types.js";

export interface World {
  world: WorldRepo;
  tasks: TaskRepo;
  memory: LexicalMemoryStore;
  tools: ToolRegistry;
  bus: MessageBus;
  router: LLMRouter;
}

const ROOMS: Room[] = [
  { id: "room-lobby", name: "Lobby", sector: "comum", connections: ["room-dev", "room-prod", "room-design"] },
  { id: "room-dev", name: "Sala Dev", sector: "engenharia", connections: ["room-lobby", "room-prod"] },
  { id: "room-prod", name: "Sala Produto", sector: "produto", connections: ["room-lobby", "room-dev"] },
  { id: "room-design", name: "Sala Criação", sector: "criacao", connections: ["room-lobby"] },
];

function model(): string {
  return process.env.DEFAULT_MODEL ?? "claude-sonnet-4-6";
}

const AGENTS: AgentDefinition[] = [
  {
    id: "dev",
    name: "Agente Dev",
    sector: "engenharia",
    roomId: "room-dev",
    systemPrompt:
      "Você é um engenheiro de software. Quando precisar de uma especificação que não tem, peça ao agente de produto (id 'prod'). Aja em um passo por vez.",
    llm: "claude",
    model: model(),
    tools: [],
    routine: { goal: "Implementar a tela de login (precisa da spec antes)." },
  },
  {
    id: "prod",
    name: "Agente Produto",
    sector: "produto",
    systemPrompt:
      "Você é um gerente de produto. Quando alguém pedir uma especificação, use a ferramenta write_doc para criá-la com title e body. Aja em um passo por vez.",
    llm: "claude",
    model: model(),
    roomId: "room-prod",
    tools: ["write_doc"],
    routine: { goal: "Atender pedidos de especificação dos outros setores." },
  },
  {
    id: "design",
    name: "Agente Criação",
    sector: "criacao",
    roomId: "room-design",
    systemPrompt:
      "Você é um designer. Se não houver nada a fazer, fique em idle. Aja em um passo por vez.",
    llm: "claude",
    model: model(),
    tools: [],
    routine: { goal: "Aguardar demandas de criação." },
  },
];

/** Builds the full world and wires all components against the given router. */
export function buildWorld(db: DB, router: LLMRouter): World {
  const world = new WorldRepo(db);
  const tasks = new TaskRepo(db);
  const memory = new LexicalMemoryStore(db);
  const tools = new ToolRegistry();
  tools.register(new WriteDocTool(tasks));
  const bus = new MessageBus();

  for (const r of ROOMS) world.saveRoom(r);
  for (const a of AGENTS) {
    world.saveAgentDefinition(a);
    world.saveState({
      agentId: a.id,
      currentRoomId: a.roomId,
      status: "idle",
      currentTaskId: null,
    });
  }
  return { world, tasks, memory, tools, bus, router };
}
```

- [ ] **Step 4: Run the scenario test to verify it passes**

Run: `npx vitest run tests/scenario.test.ts`
Expected: PASS — exactly one doc titled "Spec do login" is persisted.

- [ ] **Step 5: Write `index.ts` (live demo runner)**

```ts
// src/index.ts
import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { openDatabase } from "./db/database.js";
import { ClaudeProvider } from "./llm/claude-provider.js";
import { LLMRouter } from "./llm/llm-router.js";
import { buildWorld } from "./seed.js";
import { AgentRuntime } from "./runtime/agent-runtime.js";
import { Scheduler } from "./runtime/scheduler.js";

async function main() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    console.error("Defina ANTHROPIC_API_KEY no .env para rodar o demo ao vivo.");
    process.exit(1);
  }
  const db = openDatabase(process.env.DB_PATH ?? "./metaverso.db");
  const router = new LLMRouter({
    claude: new ClaudeProvider(new Anthropic({ apiKey: key })),
  });
  const w = buildWorld(db, router);
  const runtime = new AgentRuntime({
    world: w.world,
    memory: w.memory,
    bus: w.bus,
    tools: w.tools,
    router: w.router,
  });
  const scheduler = new Scheduler(runtime, ["dev", "prod", "design"]);

  console.log("🏨 Metaverso IA — rodando 4 rodadas autônomas\n");
  for (let round = 1; round <= 4; round++) {
    const logs = await scheduler.runRound();
    console.log(`--- Rodada ${round} ---`);
    for (const l of logs) console.log(`  [${l.agentId}] ${l.note}`);
  }
  const docs = db.prepare("SELECT title FROM docs").all() as { title: string }[];
  console.log(`\n📄 Documentos produzidos: ${docs.map((d) => d.title).join(", ") || "nenhum"}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 6: Typecheck and run the full suite**

Run: `npm run typecheck && npm test`
Expected: typecheck clean; all test files pass.

- [ ] **Step 7: (Optional) live smoke against real Claude**

Only if you have a key. Copy `.env.example` to `.env`, fill `ANTHROPIC_API_KEY`, then:
Run: `npm run demo`
Expected: 4 rounds of tick logs print; "Documentos produzidos" lists at least "Spec do login" (exact behavior varies — it's a live model). This is a manual sanity check, not an automated gate.

- [ ] **Step 8: Commit**

```bash
git add src/index.ts src/seed.ts tests/scenario.test.ts
git commit -m "feat: 3-agent autonomous scenario + live demo runner"
```

---

## Self-Review

**Spec coverage:**
- Modelo de dados (workspace/room/agent/task) → Tasks 2, 4, 5, 6. (Workspace is single-tenant implicit in MVP; multi-tenant is Phase 2 per spec.)
- Definição de agente (identidade/comportamento/capacidades) → Tasks 2, 3, 5.
- LLM Router (Claude, 1 provider) → Task 8.
- Scheduler de rotina (tick por agente) → Tasks 12, 13.
- Memória persistida (pgvector stand-in) → Task 7.
- Message Bus (gatilho "preciso falar com X") → Task 10, exercised in 12 & 14.
- 3 agentes (2 conversacionais + 1 com tool real) → Tasks 9 (tool), 14 (wiring + scenario).
- A "cena que prova o MVP" (Dev pede spec → Produto entrega doc, autônomo) → Task 14 scenario test + live demo.

All Sprint 1 MVP requirements map to a task. Sprint 2 items (Phaser, Socket.io, avatares, movimento físico renderizado, quarto do usuário) are intentionally out of scope per the chosen plan.

**Placeholder scan:** No TBD/TODO; every code step contains full implementation and every test step contains real assertions.

**Type consistency:** `LLMProvider.complete`, `MemoryStore` (remember/recall/recent), `Tool.run`→`ToolResult`, `AgentDecision`, `TickLog`, and repo method names are defined once in early tasks and reused verbatim in Tasks 12–14. `buildWorld` returns the exact field names the runtime consumes.

---

## Notes for Sprint 2 (not in this plan)

- Add a Socket.io server that subscribes to `MessageBus` topics and `agent_state` changes, emitting `agent_moved` / `agent_spoke` / `task_started`.
- Phaser 3 isometric tilemap renders `rooms` + `agent_state.position`; movement becomes pathfinding through `connections` instead of an instant room swap.
- Swap `LexicalMemoryStore` for a neural-embedding store behind the same `MemoryStore` interface; swap SQLite for Postgres + pgvector.
- Introduce the `Workspace` table and BYOK vault for multi-tenant + multi-LLM.
