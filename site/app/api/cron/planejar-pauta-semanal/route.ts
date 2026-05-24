import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

/**
 * Endpoint do cron `pauta-semanal` (rota declarada em orquestracao/rotas.yaml).
 * A Vercel dispara um POST autenticado toda 2ª-feira (ver site/vercel.json).
 *
 * NOTA DE ARQUITETURA (honesta): executar a skill /planejar-pauta-semanal exige
 * um runtime com acesso de ESCRITA ao repositório (Bash/Read/Write/Task), para
 * gravar campanhas/<YYYY-Www>-pauta-semanal/. Uma função serverless da Vercel
 * tem filesystem efêmero/somente-leitura e não contém o repo — então NÃO grava
 * a campanha aqui. Este handler valida e registra o trigger; a execução real é
 * delegada a um runner com o repo (GitHub Action, Claude Code remoto, ou um
 * worker dedicado). Esse wiring é a próxima etapa (pós-Onda 5).
 */
export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "CLAUDE_API_KEY não configurada no ambiente" },
      { status: 500 },
    );
  }

  // Cliente pronto para o wiring real do orquestrador.
  const client = new Anthropic({ apiKey });
  const orchestratorReady = typeof client.messages?.create === "function";

  return NextResponse.json({
    received: true,
    skill: "/planejar-pauta-semanal",
    args: { N: 5, modo: "cron" },
    executed: false,
    orchestratorReady,
    note: "Trigger autenticado. Execução da skill delegada a runtime com acesso de escrita ao repo (ver orquestracao/README.md). Serverless não grava campanhas/.",
    at: new Date().toISOString(),
  });
}
