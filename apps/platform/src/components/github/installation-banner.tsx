"use client";

import { useGitHubAppProvider } from "@/providers/GitHubApp";
import { InstallationPrompt } from "./installation-prompt";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const GITHUB_INSTALLATION_SEEN_KEY = "github_installation_seen";

export function GitHubInstallationBanner() {
  const { isInstalled, isLoading } = useGitHubAppProvider();
  const [dismissed, setDismissed] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    // Check if this might be a new user (no installation history in localStorage)
    const hasSeenInstallation = localStorage.getItem(
      GITHUB_INSTALLATION_SEEN_KEY,
    );
    if (!hasSeenInstallation && !isInstalled && !isLoading) {
      setIsNewUser(true);
      localStorage.setItem(GITHUB_INSTALLATION_SEEN_KEY, "true");
    }
  }, [isInstalled, isLoading]);

  // Don't show banner if:
  // - Still loading installation status
  // - App is already installed
  // - User has dismissed the banner
  if (isLoading || isInstalled || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    setIsNewUser(false);
  };

  // Enhanced messaging for new users
  const title = isNewUser
    ? "🎉 Bem-vindo ao Dev BR! Complete sua configuração"
    : "Complete sua configuração para começar a programar";

  const description = isNewUser
    ? "Você está a apenas um passo do desenvolvimento assistido por IA! Instale nosso App do GitHub para conectar seus repositórios e começar a programar com assistência de IA."
    : "Instale nosso App do GitHub para conceder acesso aos seus repositórios e habilitar o desenvolvimento assistido por IA.";

  return (
    <InstallationPrompt
      title={title}
      description={description}
      variant="banner"
      showDismiss={true}
      onDismiss={handleDismiss}
      className={cn(isNewUser && "border-2 border-amber-300 shadow-lg")}
    />
  );
}
