/**
 * API base URL resolution for local dev, Vercel (proxy), or direct backend URL.
 */
export function getApiBase(): string {
  const direct = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (direct) {
    return direct;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.API_PROXY_URL) {
    return "http://localhost:3000";
  }

  return "http://localhost:8000";
}

export function getAdminKey(): string {
  return process.env.GENWATCH_ADMIN_KEY ?? "genwatch-dev-admin";
}

export function apiPath(path: string): string {
  const base = getApiBase();
  return base ? `${base}${path}` : path;
}
