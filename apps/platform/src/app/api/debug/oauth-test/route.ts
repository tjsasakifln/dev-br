import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Simular o que NextAuth faz internamente
    const githubClientId = process.env.GITHUB_CLIENT_ID;
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    
    if (!githubClientId || !googleClientId) {
      return NextResponse.json({ 
        error: 'Missing OAuth credentials',
        github: !!githubClientId,
        google: !!googleClientId
      }, { status: 400 });
    }

    // Testar se conseguimos gerar URLs OAuth válidas
    const githubOAuthUrl = `https://github.com/login/oauth/authorize?` + 
      `client_id=${githubClientId}&` +
      `redirect_uri=${encodeURIComponent('http://localhost:3000/api/auth/callback/github')}&` +
      `scope=read:user user:email&` +
      `state=test_state&` +
      `response_type=code`;

    const googleOAuthUrl = `https://accounts.google.com/oauth2/auth?` +
      `client_id=${googleClientId}&` +
      `redirect_uri=${encodeURIComponent('http://localhost:3000/api/auth/callback/google')}&` +
      `scope=openid email profile&` +
      `state=test_state&` +
      `response_type=code&` +
      `prompt=consent`;

    // Verificar se as URLs são acessíveis (sem seguir redirect)
    const results = {
      github: {
        clientId: githubClientId,
        url: githubOAuthUrl,
        accessible: false
      },
      google: {
        clientId: googleClientId.substring(0, 20) + '...',
        url: googleOAuthUrl.substring(0, 100) + '...',
        accessible: false
      }
    };

    // Tentar fazer HEAD request para verificar se OAuth endpoints respondem
    try {
      const githubResponse = await fetch(githubOAuthUrl, { 
        method: 'HEAD', 
        redirect: 'manual',
        headers: { 'User-Agent': 'OAuth-Test' }
      });
      results.github.accessible = githubResponse.status === 302;
      results.github.status = githubResponse.status;
    } catch (error) {
      results.github.error = error.message;
    }

    try {
      const googleResponse = await fetch(googleOAuthUrl, { 
        method: 'HEAD', 
        redirect: 'manual' 
      });
      results.google.accessible = googleResponse.status === 302;
      results.google.status = googleResponse.status;
    } catch (error) {
      results.google.error = error.message;
    }

    return NextResponse.json(results);

  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed', 
      message: error.message 
    }, { status: 500 });
  }
}