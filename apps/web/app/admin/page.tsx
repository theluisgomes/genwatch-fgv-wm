import { apiPath, getAdminKey } from "@/lib/config";

export const dynamic = "force-dynamic";

async function getAdminHeaders(): Promise<HeadersInit> {
  return {
    "X-API-Key": getAdminKey(),
  };
}

export default async function AdminPage() {
  const response = await fetch(apiPath("/api/v1/ingestion/runs"), {
    headers: await getAdminHeaders(),
    next: { revalidate: 10 },
  });
  const runs = response.ok ? await response.json() : [];

  return (
    <div>
      <h2 className="font-display text-3xl mb-6">Admin · Ingestão</h2>
      {!response.ok ? (
        <div className="card mb-4 text-sm text-muted">
          Não foi possível carregar os runs de ingestão. Verifique a chave admin.
        </div>
      ) : null}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted">
            <tr>
              <th className="pb-3">Source</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Records</th>
              <th className="pb-3">Started</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run: {
              id: string;
              source_id: string;
              status: string;
              record_count: number;
              started_at: string;
            }) => (
              <tr key={run.id} className="border-t border-white/5">
                <td className="py-3">{run.source_id}</td>
                <td className="py-3">
                  <span className="pill">{run.status}</span>
                </td>
                <td className="py-3">{run.record_count}</td>
                <td className="py-3 text-muted">
                  {new Date(run.started_at).toLocaleString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
