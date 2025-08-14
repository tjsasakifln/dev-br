import { NextRequest, NextResponse } from "next/server";
// import {
//   GITHUB_TOKEN_COOKIE,
//   GITHUB_INSTALLATION_ID_COOKIE,
// } from "@open-swe/shared/constants";
// import { verifyGithubUser } from "@open-swe/shared/github/verify-user";

const GITHUB_TOKEN_COOKIE = "github_access_token";
const GITHUB_INSTALLATION_ID_COOKIE = "github_installation_id";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(GITHUB_TOKEN_COOKIE)?.value;
  const installationId = request.cookies.get(
    GITHUB_INSTALLATION_ID_COOKIE,
  )?.value;
  // const user = token && installationId ? await verifyGithubUser(token) : null;
  const user = token && installationId ? { id: 'mock-user' } : null;
  
  // Verificar se há sessão do NextAuth
  const nextAuthToken = request.cookies.get("next-auth.session-token")?.value ||
                       request.cookies.get("__Secure-next-auth.session-token")?.value;

  if (request.nextUrl.pathname === "/") {
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = "/chat";
      return NextResponse.redirect(url);
    }
  }

  if (request.nextUrl.pathname.startsWith("/chat")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Proteger rota /dashboard
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!nextAuthToken) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/chat/:path*", "/dashboard/:path*"],
};
