import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const allParams = Object.fromEntries(searchParams.entries());
  
  console.log('[DEBUG OAuth] Callback recebido:', {
    url: request.url,
    method: request.method,
    params: allParams,
    headers: Object.fromEntries(request.headers.entries()),
    timestamp: new Date().toISOString()
  });

  // Log específico dos parâmetros OAuth
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');

  console.log('[DEBUG OAuth] Parâmetros específicos:', {
    code: code ? 'PRESENTE' : 'AUSENTE',
    state: state ? 'PRESENTE' : 'AUSENTE', 
    error,
    error_description
  });

  return NextResponse.json({
    message: 'Debug OAuth callback',
    params: allParams,
    hasCode: !!code,
    hasState: !!state,
    error,
    error_description
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  
  console.log('[DEBUG OAuth] POST recebido:', {
    url: request.url,
    body,
    headers: Object.fromEntries(request.headers.entries()),
    timestamp: new Date().toISOString()
  });

  return NextResponse.json({
    message: 'Debug OAuth POST',
    body
  });
}