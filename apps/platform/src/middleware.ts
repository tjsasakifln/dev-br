import { NextRequest, NextResponse } from "next/server";

// Middleware temporariamente desabilitado para desenvolvimento
export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
