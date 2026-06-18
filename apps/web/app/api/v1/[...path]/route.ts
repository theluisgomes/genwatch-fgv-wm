import { NextRequest, NextResponse } from "next/server";

const API_PROXY_URL = process.env.API_PROXY_URL?.replace(/\/$/, "");

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  if (!API_PROXY_URL) {
    return NextResponse.json(
      { error: "API proxy not configured. Set API_PROXY_URL on Vercel." },
      { status: 503 },
    );
  }

  const { path } = await context.params;
  const target = `${API_PROXY_URL}/api/v1/${path.join("/")}${request.nextUrl.search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() === "host") {
      return;
    }
    headers.set(key, value);
  });

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  const response = await fetch(target, init);
  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
