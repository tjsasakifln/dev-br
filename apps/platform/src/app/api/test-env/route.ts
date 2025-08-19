import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const envCheck = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ? 'SET' : 'NOT SET',
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ? 'SET' : 'NOT SET',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET', 
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET',
    
    GITHUB_ID_LENGTH: process.env.GITHUB_CLIENT_ID?.length || 0,
    GITHUB_SECRET_LENGTH: process.env.GITHUB_CLIENT_SECRET?.length || 0,
    GOOGLE_ID_LENGTH: process.env.GOOGLE_CLIENT_ID?.length || 0,
    GOOGLE_SECRET_LENGTH: process.env.GOOGLE_CLIENT_SECRET?.length || 0,
    
    NODE_ENV: process.env.NODE_ENV,
  };

  return NextResponse.json(envCheck);
}