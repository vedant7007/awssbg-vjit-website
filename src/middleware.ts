import { NextResponse, type NextRequest } from "next/server";

/*
 * Edge middleware. Cheap first line of defence for /console and /admin: if there
 * is no session cookie, bounce to /signin before the route even renders. This is
 * NOT the real authorization check. Server components still call requireAuth /
 * requireAdmin (lib/auth/server.ts) to verify the cookie and read admin claims,
 * because the edge cannot safely run the Firebase Admin SDK.
 *
 * TODO(Jashwanth): polish edge behaviour (e.g. friendlier 403 for admin paths).
 */
const SESSION_COOKIE = "session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession) {
    const signinUrl = new URL("/signin", request.url);
    signinUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/console/:path*", "/admin/:path*"],
};
