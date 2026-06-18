import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminKey } from "@/lib/config";

const ADMIN_COOKIE = "genwatch_admin";
const ADMIN_TOKEN = getAdminKey();

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = pathname.startsWith("/admin");

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (token === ADMIN_TOKEN) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
