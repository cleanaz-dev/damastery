import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin: redirect to sign-in if there's no session cookie
  if (pathname.startsWith("/admin")) {
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackURL", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  const response = NextResponse.next();
  response.headers.set("x-proxy", "true");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};