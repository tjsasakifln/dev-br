import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the session token to check authentication
  const token = await getToken({ req: request });

  // Redirect root based on authentication status
  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Protect dashboard route - redirect to login if not authenticated
  if (pathname === "/dashboard" && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect old v2 routes to dashboard
  if (pathname.startsWith("/chat") || pathname.startsWith("/threads")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
