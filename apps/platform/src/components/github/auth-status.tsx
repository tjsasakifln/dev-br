"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { GitHubSVG } from "@/components/icons/github";
import { ArrowRight } from "lucide-react";
import { LangGraphLogoSVG } from "../icons/langgraph";
import { useGitHubToken } from "@/hooks/useGitHubToken";
import { useGitHubAppProvider } from "@/providers/GitHubApp";
import { GitHubAppProvider } from "@/providers/GitHubApp";
import { useRouter } from "next/navigation";

function AuthStatusContent() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    token: githubToken,
    fetchToken: fetchGitHubToken,
    isLoading: isTokenLoading,
  } = useGitHubToken();

  const {
    isInstalled: hasGitHubAppInstalled,
    isLoading: isCheckingAppInstallation,
  } = useGitHubAppProvider();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isAuth && hasGitHubAppInstalled && !githubToken && !isTokenLoading) {
      // Fetch token when app is installed but we don't have a token yet
      fetchGitHubToken();
    }
  }, [
    isAuth,
    hasGitHubAppInstalled,
    githubToken,
    isTokenLoading,
    fetchGitHubToken,
  ]);

  useEffect(() => {
    if (githubToken) {
      console.log("redirecting to chat");
      router.push("/chat");
    }
  }, [githubToken]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/status");
      const data = await response.json();
      setIsAuth(data.authenticated);
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsAuth(false);
    }
  };

  const handleLogin = () => {
    setIsLoading(true);
    window.location.href = "/api/auth/github/login";
  };

  const handleInstallGitHubApp = () => {
    setIsLoading(true);
    window.location.href = "/api/github/installation";
  };

  const showGetStarted = !isAuth;
  const showInstallApp =
    !showGetStarted && !hasGitHubAppInstalled && !isTokenLoading;
  const showLoading = !showGetStarted && !showInstallApp && !githubToken;

  useEffect(() => {
    if (!showGetStarted && !showInstallApp && !showLoading) {
      router.push("/chat");
    }
  }, [showGetStarted, showInstallApp, showLoading, router]);

  if (showGetStarted) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-4 bg-brasil-gradient">
        <div className="animate-in fade-in-0 zoom-in-95 flex w-full max-w-3xl flex-col rounded-lg border border-primary/20 shadow-2xl shadow-primary/10 bg-card/95 backdrop-blur">
          <div className="flex flex-col gap-6 p-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-ouro-gradient flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-primary-foreground">🇧🇷</span>
              </div>
              <h1 className="text-3xl font-bold bg-ouro-gradient bg-clip-text text-transparent">
                Dev BR
              </h1>
              <h2 className="text-xl font-semibold text-foreground">
                Comece agora
              </h2>
            </div>
            <p className="text-center text-muted-foreground text-lg">
              Conecte sua conta do GitHub para começar a usar a plataforma brasileira de desenvolvimento com IA.
            </p>
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="bg-ouro-gradient hover:shadow-lg hover:shadow-primary/25 text-primary-foreground font-semibold py-3 px-6 text-base transition-all duration-200"
              size="lg"
            >
              <GitHubSVG
                width="20"
                height="20"
              />
              {isLoading ? "Conectando..." : "Conectar GitHub"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showInstallApp) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-4 bg-brasil-gradient">
        <div className="animate-in fade-in-0 zoom-in-95 flex w-full max-w-3xl flex-col rounded-lg border border-primary/20 shadow-2xl shadow-primary/10 bg-card/95 backdrop-blur">
          <div className="flex flex-col gap-6 p-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-ouro-gradient flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-primary-foreground">🇧🇷</span>
              </div>
              <h1 className="text-3xl font-bold bg-ouro-gradient bg-clip-text text-transparent">
                Dev BR
              </h1>
              <h2 className="text-xl font-semibold text-foreground">
                Mais um passo
              </h2>
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="rounded-full bg-primary/20 border border-primary px-3 py-1 text-xs font-medium text-primary">
                1. Login GitHub ✓
              </span>
              <ArrowRight className="h-4 w-4 text-primary" />
              <span className="rounded-full bg-accent/20 border border-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                2. Acesso aos Repositórios
              </span>
            </div>
            <div className="text-center space-y-4">
              <p className="text-muted-foreground text-lg">
                Ótimo! Agora precisamos de acesso aos seus repositórios do GitHub. Instale nosso
                App do GitHub para conceder acesso a repositórios específicos.
              </p>
              <div className="rounded-lg border border-accent/30 bg-accent/10 p-4 text-sm text-accent-foreground">
                <p>
                  Você será redirecionado para o GitHub onde poderá selecionar quais
                  repositórios conceder acesso.
                </p>
              </div>
            </div>
            <Button
              onClick={handleInstallGitHubApp}
              disabled={isLoading || isCheckingAppInstallation}
              className="bg-ouro-gradient hover:shadow-lg hover:shadow-primary/25 text-primary-foreground font-semibold py-3 px-6 text-base transition-all duration-200"
              size="lg"
            >
              <GitHubSVG
                width="20"
                height="20"
              />
              {isLoading || isCheckingAppInstallation
                ? "Carregando..."
                : "Instalar App do GitHub"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-4">
        <div className="animate-in fade-in-0 zoom-in-95 flex w-full max-w-3xl flex-col rounded-lg border shadow-lg">
          <div className="flex flex-col gap-4 border-b p-6">
            <div className="flex flex-col items-start gap-2">
              <LangGraphLogoSVG className="h-7" />
              <h1 className="text-xl font-semibold tracking-tight">
                Carregando...
              </h1>
            </div>
            <p className="text-muted-foreground">
              Configurando sua integração com o GitHub...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function AuthStatus() {
  return (
    <GitHubAppProvider>
      <AuthStatusContent />
    </GitHubAppProvider>
  );
}
