import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — never redirect these
  const isAuthRoute =
    pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
  const isPublicRoute = pathname === "/" || pathname === "/pricing" || pathname === "/about" || pathname.startsWith("/api");

  // better-auth stores the session token in a cookie named "better-auth.session_token"
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value;

  // Authenticated user trying to visit sign-in/sign-up → send to /home
  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // Public route or API route → let it through regardless
  if (isPublicRoute || isAuthRoute) {
    return NextResponse.next();
  }

  // Protected route with no session → send to sign-in
  if (!sessionToken) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Authenticated user on a protected route → let it through
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};