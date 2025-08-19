import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const config = {
      nodeEnv: process.env.NODE_ENV,
      nextauthUrl: process.env.NEXTAUTH_URL,
      nextauthUrlInternal: process.env.NEXTAUTH_URL_INTERNAL,
      nextauthSecret: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
      nextauthDebug: process.env.NEXTAUTH_DEBUG,
      
      githubClientId: process.env.GITHUB_CLIENT_ID ? 'SET' : 'NOT SET',
      githubClientSecret: process.env.GITHUB_CLIENT_SECRET ? 'SET' : 'NOT SET',
      githubClientIdLength: process.env.GITHUB_CLIENT_ID?.length || 0,
      githubClientSecretLength: process.env.GITHUB_CLIENT_SECRET?.length || 0,
      
      googleClientId: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET',
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET',
      googleClientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
      googleClientSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length || 0,
      
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('[Debug] Error checking OAuth config:', error);
    return NextResponse.json({ error: 'Failed to check config' }, { status: 500 });
  }
}