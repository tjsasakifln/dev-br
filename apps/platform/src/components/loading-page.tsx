"use client";

import { useEffect, useState } from "react";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";

interface LoadingPageProps {
  message?: string;
  delay?: number;
}

export function LoadingPage({ message = "Carregando...", delay = 100 }: LoadingPageProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!show) {
    return null;
  }

  return <PageLoadingSkeleton />;
}

export function SessionLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-ouro-gradient shadow-lg animate-pulse-gold">
          <span className="text-xl font-bold text-brasil-navy">BR</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gradient-gold">
            Verificando sessão...
          </h2>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
}