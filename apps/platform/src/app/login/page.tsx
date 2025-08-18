"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Chrome, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleLogin = (provider: string) => {
    setIsLoading(provider);
    // O estado será resetado quando a página recarregar após redirect
    window.location.href = `/api/auth/signin/${provider}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md glass-brasil">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mb-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ouro-gradient shadow-lg">
              <span className="text-xl font-bold text-brasil-navy">BR</span>
            </div>
          </Link>
          <CardTitle className="text-3xl font-bold text-gradient-gold mb-2">
            Bem-vindo à Dev BR
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Sua ideia, seu app. Crie aplicações full-stack em minutos.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">
                {error === 'github' && 'Erro ao autenticar com GitHub. Verifique as configurações.'}
                {error === 'google' && 'Erro ao autenticar com Google. Verifique as configurações.'}
                {error !== 'github' && error !== 'google' && `Erro de autenticação: ${error}`}
              </span>
            </div>
          )}
          <Button
            onClick={() => handleLogin('github')}
            disabled={isLoading !== null}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white border border-gray-700 h-12"
            size="lg"
          >
            {isLoading === 'github' ? (
              <div className="loading-dots mr-2">
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : (
              <Github className="mr-2 h-5 w-5" />
            )}
            Entrar com GitHub
          </Button>

          <Button
            onClick={() => handleLogin('google')}
            disabled={isLoading !== null}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 h-12"
            size="lg"
          >
            {isLoading === 'google' ? (
              <div className="loading-dots mr-2">
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : (
              <Chrome className="mr-2 h-5 w-5" />
            )}
            Entrar com Google
          </Button>
          
          <p className="text-center text-xs text-muted-foreground mt-6">
            Ao continuar, você concorda com nossos{" "}
            <Link href="/terms" className="underline hover:text-primary transition-colors">
              Termos de Serviço
            </Link>
            {" "}e{" "}
            <Link href="/privacy" className="underline hover:text-primary transition-colors">
              Política de Privacidade
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}