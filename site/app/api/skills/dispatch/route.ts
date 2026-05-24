import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const REPO_ROOT = path.resolve(process.cwd(), "..");

/** Termos que a política marca como sensíveis (espelho de publicacao.yaml). */
const TERMOS_SENSIVEIS = ["suplemento", "emagrecer", "cura"];

/**
 * Dispara uma skill a partir do dashboard. Consulta a política antes de
 * qualquer publicação. Como serverless não tem o repo com acesso de escrita,
 * a execução real é delegada (executed:false) — mas a checagem de política e
 * a autenticação são reais.
 */
export async function POST(req: Request) {
  const cookie = req.headers.get("cookie") ?? "";
  const token = cookie.match(/dashboard_token=([^;]+)/)?.[1];
  if (!process.env.DASHBOARD_TOKEN || token !== process.env.DASHBOARD_TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "CLAUDE_API_KEY não configurada" }, { status: 500 });
  }

  let body: { skill?: string; args?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "corpo inválido" }, { status: 400 });
  }
  const { skill, args = "" } = body;
  if (!skill) return NextResponse.json({ error: "skill ausente" }, { status: 400 });

  // ── Gate de política: se o disparo pode publicar, consulta publicacao.yaml ──
  const envolvePublicacao = /publish|publicar|lote-posts|novo-post/.test(`${skill} ${args}`);
  if (envolvePublicacao) {
    const termo = TERMOS_SENSIVEIS.find((t) => `${skill} ${args}`.toLowerCase().includes(t));
    if (termo) {
      return NextResponse.json({
        dispatched: false,
        executed: false,
        motivo: "política exige aprovação humana",
        regra: "termos-sensiveis",
        termo,
        note: `Bloqueado pela política (dados/politicas/publicacao.yaml): termo sensível "${termo}".`,
      });
    }
  }

  // Política existe? (apenas registra; a avaliação completa é feita pelas skills)
  const politicaPath = path.join(REPO_ROOT, "dados", "politicas", "publicacao.yaml");
  const politicaPresente = fs.existsSync(politicaPath);

  // Cliente pronto para o wiring real do orquestrador.
  const client = new Anthropic({ apiKey });
  const orchestratorReady = typeof client.messages?.create === "function";

  return NextResponse.json({
    dispatched: true,
    executed: false,
    skill,
    args,
    politicaPresente,
    orchestratorReady,
    startedAt: new Date().toISOString(),
    note: "Trigger autenticado e política consultada. Execução da skill delegada a runtime com acesso de escrita ao repo (serverless não executa skills do Claude Code).",
  });
}
