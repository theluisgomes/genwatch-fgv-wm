import { readFile } from "fs/promises";
import path from "path";

const STUB_DIR = path.join(process.cwd(), "data", "stub");

async function readStub<T>(filename: string): Promise<T> {
  const raw = await readFile(path.join(STUB_DIR, filename), "utf-8");
  return JSON.parse(raw) as T;
}

export async function handleStubApi(pathSegments: string[]): Promise<Response | null> {
  const [resource, ...rest] = pathSegments;

  if (resource === "health") {
    return Response.json(await readStub("health.json"));
  }

  if (resource === "generations" && rest.length === 0) {
    return Response.json(await readStub("generations.json"));
  }

  if (resource === "insights") {
    return Response.json(await readStub("insights.json"));
  }

  if (resource === "analytics" && rest[0] === "overview" && rest.length === 1) {
    return Response.json(await readStub("analytics-overview.json"));
  }

  if (resource === "analytics" && rest[0] === "regions" && rest.length === 1) {
    return Response.json(await readStub("analytics-regions.json"));
  }

  if (resource === "analytics" && rest[0] === "generations" && rest.length === 2) {
    const generationId = rest[1];
    const data = await readStub<{ analytics: unknown }>(`generations/${generationId}.json`);
    return Response.json(data.analytics);
  }

  if (resource === "generations" && rest.length === 2 && rest[1] === "summary") {
    const generationId = rest[0];
    const data = await readStub<{ summary: unknown }>(`generations/${generationId}.json`);
    return Response.json(data.summary);
  }

  if (resource === "generations" && rest.length === 3 && rest[1] === "layers") {
    const generationId = rest[0];
    const layer = rest[2];
    const data = await readStub<{ layers: Record<string, unknown> }>(
      `generations/${generationId}.json`,
    );
    const layerData = data.layers[layer];
    if (!layerData) {
      return Response.json({ detail: "Layer not found" }, { status: 404 });
    }
    return Response.json(layerData);
  }

  return null;
}
