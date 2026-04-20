import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authClient } from "./lib/auth-client";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — never redirect these
  const isAuthRoute = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
  const isPublicRoute = pathname === "/" || pathname.startsWith("/api/auth");

  if (isAuthRoute || isPublicRoute) {
    return NextResponse.next();
  }

  const session = await authClient.getSession();

  if(session){
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};