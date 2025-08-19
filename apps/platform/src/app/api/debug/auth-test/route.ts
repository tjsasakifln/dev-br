import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    // Test 1: Basic environment variables
    const envTest = {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      GITHUB_CLIENT_ID: !!process.env.GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET: !!process.env.GITHUB_CLIENT_SECRET,
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    };

    // Test 2: Try to access auth options
    let authOptionsTest = 'OK';
    try {
      const providers = authOptions.providers;
      authOptionsTest = `${providers?.length || 0} providers configured`;
    } catch (error) {
      authOptionsTest = `Error: ${error.message}`;
    }

    // Test 3: Try to manually create GitHub provider
    let githubProviderTest = 'OK';
    try {
      const GitHubProvider = require('next-auth/providers/github');
      const provider = GitHubProvider.default({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      });
      githubProviderTest = `Provider created: ${provider.id}`;
    } catch (error) {
      githubProviderTest = `Error: ${error.message}`;
    }

    return NextResponse.json({
      status: 'AUTH_TEST',
      environment: envTest,
      authOptions: authOptionsTest,
      githubProvider: githubProviderTest,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Auth Test] Critical error:', error);
    return NextResponse.json({ 
      error: 'Auth test failed', 
      message: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}