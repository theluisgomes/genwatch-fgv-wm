"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const next = searchParams.get("next") ?? "/admin";

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const key = String(form.get("key") ?? "").trim();
    if (!key) {
      setError("Informe a chave de acesso.");
      return;
    }
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `genwatch_admin=${encodeURIComponent(key)}; path=/; max-age=86400; SameSite=Lax${secure}`;
    router.push(next);
    router.refresh();
  }

  return (
    <div className="max-w-md">
      <p className="eyebrow mb-3">Acesso restrito</p>
      <h2 className="font-display text-3xl mb-6">Login Admin</h2>
      <form onSubmit={onSubmit} className="card space-y-4">
        <label className="block text-sm text-muted">
          Chave de API
          <input
            name="key"
            type="password"
            className="mt-2 w-full rounded border border-white/10 bg-background px-3 py-2 text-foreground"
            placeholder="genwatch-dev-admin"
          />
        </label>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <button
          type="submit"
          className="rounded border border-accent/40 px-4 py-2 text-sm text-accent hover:bg-accent/10"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
