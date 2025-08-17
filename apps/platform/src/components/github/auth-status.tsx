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
      <div className="flex min-h-screen w-full items-center justify-center p-4">
        <div className="animate-in fade-in-0 zoom-in-95 flex w-full max-w-3xl flex-col rounded-lg border shadow-lg">
          <div className="flex flex-col gap-4 border-b p-6">
            <div className="flex flex-col items-start gap-2">
              <LangGraphLogoSVG className="h-7" />
              <h1 className="text-xl font-semibold tracking-tight">
                Comece agora
              </h1>
            </div>
            <p className="text-muted-foreground">
              Conecte sua conta do GitHub para começar a usar o Dev BR.
            </p>
            <Button
              onClick={handleLogin}
              disabled={isLoading}
            >
              <GitHubSVG
                width="16"
                height="16"
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
      <div className="flex min-h-screen w-full items-center justify-center p-4">
        <div className="animate-in fade-in-0 zoom-in-95 flex w-full max-w-3xl flex-col rounded-lg border shadow-lg">
          <div className="flex flex-col gap-4 border-b p-6">
            <div className="flex flex-col items-start gap-2">
              <LangGraphLogoSVG className="h-7" />
              <h1 className="text-xl font-semibold tracking-tight">
                Mais um passo
              </h1>
            </div>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                1. Login GitHub ✓
              </span>
              <ArrowRight className="h-3 w-3" />
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                2. Acesso aos Repositórios
              </span>
            </div>
            <p className="text-muted-foreground">
              Ótimo! Agora precisamos de acesso aos seus repositórios do GitHub. Instale nosso
              App do GitHub para conceder acesso a repositórios específicos.
            </p>
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <p>
                Você será redirecionado para o GitHub onde poderá selecionar quais
                repositórios conceder acesso.
              </p>
            </div>
            <Button
              onClick={handleInstallGitHubApp}
              disabled={isLoading || isCheckingAppInstallation}
              className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200"
            >
              <GitHubSVG
                width="16"
                height="16"
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
