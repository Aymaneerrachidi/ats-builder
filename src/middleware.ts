import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

const AUTH_PAGES = ["/sign-in", "/sign-up"];

/**
 * Gate for the dashboard/builder area. This only checks for the presence of
 * a session cookie (fast, no DB call) to redirect at the edge — real
 * ownership/session validation still happens server-side via
 * `requireSession()` in every API route and server component.
 */
export function middleware(request: NextRequest) {
  const hasSession = Boolean(getSessionCookie(request));
  const { pathname } = request.nextUrl;

  if (!hasSession && pathname.startsWith("/dashboard")) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (hasSession && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};
