"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [token, setToken] = useState("");
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/admin/dashboard?token=${encodeURIComponent(token)}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6 text-fg">
      <form onSubmit={submit} className="w-full max-w-sm">
        <h1 className="font-display text-3xl uppercase">Dino Team · Admin</h1>
        <p className="mt-2 font-body text-sm text-muted">Informe o token de acesso.</p>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="DASHBOARD_TOKEN"
          aria-label="Token de acesso"
          className="mt-6 w-full border border-line bg-surface px-4 py-3 font-body text-fg outline-none focus:border-fg"
        />
        <button
          type="submit"
          className="mt-4 w-full bg-fg px-6 py-3 font-body text-sm font-semibold uppercase tracking-wide text-bg hover:bg-muted"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
