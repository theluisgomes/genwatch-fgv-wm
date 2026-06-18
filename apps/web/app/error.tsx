"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ApiUnavailableError } from "@/lib/api";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isApiDown =
    error instanceof ApiUnavailableError ||
    error.name === "ApiUnavailableError" ||
    error.message.includes("GenWatch API is not reachable") ||
    error.message === "fetch failed";

  useEffect(() => {
    console.error(error);
  }, [error]);

  if (isApiDown) {
    return (
      <div className="max-w-xl">
        <p className="eyebrow mb-3">API offline</p>
        <h2 className="font-display text-3xl mb-4">Backend não está rodando</h2>
        <p className="text-sm text-muted mb-6">
          O dashboard precisa do GenWatch API na porta 8000. Abra outro terminal na raiz
          do projeto e execute:
        </p>
        <pre className="card mb-6 overflow-x-auto text-xs text-accent">
          make install{"\n"}make dev-api
        </pre>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded border border-accent/40 px-4 py-2 text-sm text-accent hover:bg-accent/10"
          >
            Tentar novamente
          </button>
          <Link href="/" className="rounded border border-white/10 px-4 py-2 text-sm text-muted">
            Início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <p className="eyebrow mb-3">Erro</p>
      <h2 className="font-display text-3xl mb-4">Algo deu errado</h2>
      <p className="text-sm text-muted mb-6">{error.message}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded border border-accent/40 px-4 py-2 text-sm text-accent hover:bg-accent/10"
      >
        Tentar novamente
      </button>
    </div>
  );
}
