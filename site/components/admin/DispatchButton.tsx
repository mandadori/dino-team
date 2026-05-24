"use client";

import { useState } from "react";

/**
 * Dispara uma skill via /api/skills/dispatch e mostra o retorno.
 */
export function DispatchButton({
  skill,
  args,
  label,
  variant = "outline",
}: {
  skill: string;
  args?: string;
  label: string;
  variant?: "primary" | "outline";
}) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function go() {
    setState("loading");
    setMsg("");
    try {
      const res = await fetch("/api/skills/dispatch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ skill, args }),
      });
      const j = await res.json();
      setState(res.ok ? "done" : "error");
      setMsg(j.note ?? j.error ?? JSON.stringify(j));
    } catch (e) {
      setState("error");
      setMsg(e instanceof Error ? e.message : String(e));
    }
  }

  const base =
    "px-4 py-2 font-body text-xs font-semibold uppercase tracking-wide transition-colors disabled:opacity-50";
  const style =
    variant === "primary"
      ? "bg-fg text-bg hover:bg-muted"
      : "border border-line text-fg hover:border-fg";

  return (
    <div className="flex flex-col gap-2">
      <button onClick={go} disabled={state === "loading"} className={`${base} ${style}`}>
        {state === "loading" ? "Disparando…" : label}
      </button>
      {msg && (
        <p className={`font-body text-xs ${state === "error" ? "text-fg" : "text-muted"}`}>{msg}</p>
      )}
    </div>
  );
}
