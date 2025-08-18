import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import React from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { BrasilProvider, BrasilUIProvider, PerformanceMonitor } from "@/components/providers/brasil-provider";
import AuthProvider from "@/providers/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  preload: true,
  display: "swap",
});

export const metadata: Metadata = {
  title: "🇧🇷 Dev BR - IA Brasileira para Desenvolvimento",
  description: "A primeira plataforma brasileira que transforma suas ideias em aplicações full-stack funcionais usando IA avançada. Do conceito ao deploy em minutos.",
  keywords: ["dev br", "ia brasileira", "desenvolvimento", "full-stack", "react", "fastapi", "gerador de código"],
  authors: [{ name: "Dev BR Team" }],
  creator: "Dev BR",
  publisher: "Dev BR",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "🇧🇷 Dev BR - IA Brasileira",
    description: "Transforme suas ideias em aplicações reais com IA brasileira",
    url: "https://devbr.com.br",
    siteName: "Dev BR",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "🇧🇷 Dev BR - IA Brasileira",
    description: "Transforme suas ideias em aplicações reais",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className="dark"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Força tema dark brasileiro
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
              })();
            `,
          }}
        />
      </head>
      <body 
        className={`${inter.className} bg-background text-foreground dark`}
        style={{ 
          background: 'oklch(0.15 0.08 240)', 
          color: 'oklch(0.95 0.02 60)',
          minHeight: '100vh' 
        }}
      >
        <PerformanceMonitor>
          <AuthProvider>
            <BrasilProvider>
              <BrasilUIProvider>
                <NuqsAdapter>{children}</NuqsAdapter>
              </BrasilUIProvider>
            </BrasilProvider>
          </AuthProvider>
        </PerformanceMonitor>
      </body>
    </html>
  );
}
