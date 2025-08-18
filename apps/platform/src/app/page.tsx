"use client";

import { Toaster } from "@/components/ui/sonner";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, Code, Zap, Globe, Star, Users, Clock } from "lucide-react";

export default function Page(): React.ReactNode {
  return (
    <React.Suspense fallback={<div>Carregando...</div>}>
      <Toaster />
      <div className="min-h-screen bg-brasil-gradient">
        {/* Hero Section */}
        <div className="container mx-auto px-6 py-24">
          <div className="text-center space-y-8">
            <Badge variant="outline" className="text-sm font-medium">
              ✨ Powered by IA
            </Badge>
            
            <h1 className="text-6xl font-bold text-gradient-gold">
              Dev BR
            </h1>
            
            <p className="text-xl text-brasil-pearl max-w-3xl mx-auto leading-relaxed">
              A primeira plataforma brasileira que transforma suas ideias em aplicações full-stack funcionais usando IA avançada. 
              Do conceito ao deploy em minutos.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/dashboard">
                <Button size="lg" className="flex items-center gap-2 px-8 py-6 text-lg">
                  Começar Agora
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              
              <Link href="/projects/new">
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                  Criar Aplicação
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-brasil-pearl mb-4">
              Como Funciona
            </h2>
            <p className="text-lg text-brasil-silver max-w-2xl mx-auto">
              Três passos simples para ter sua aplicação pronta
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="card-brasil text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-brasil-royal rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="h-8 w-8 text-brasil-gold" />
                </div>
                <CardTitle className="text-brasil-pearl">1. Descreva sua ideia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-brasil-silver">
                  Digite em português o que você quer criar. Nossa IA entende projetos complexos.
                </p>
              </CardContent>
            </Card>

            <Card className="card-brasil text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-brasil-royal rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-brasil-gold" />
                </div>
                <CardTitle className="text-brasil-pearl">2. IA gera o código</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-brasil-silver">
                  React + Express/FastAPI + Docker. Código limpo, moderno e pronto para produção.
                </p>
              </CardContent>
            </Card>

            <Card className="card-brasil text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-brasil-royal rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-brasil-jade" />
                </div>
                <CardTitle className="text-brasil-pearl">3. Execute e publique</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-brasil-silver">
                  Preview no navegador, testes automáticos e publicação direta no GitHub.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-5 w-5 text-brasil-gold" />
                <span className="text-3xl font-bold text-brasil-pearl">5min</span>
              </div>
              <p className="text-brasil-silver">Tempo médio de geração</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Users className="h-5 w-5 text-brasil-gold" />
                <span className="text-3xl font-bold text-brasil-pearl">100%</span>
              </div>
              <p className="text-brasil-silver">Código funcional</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Star className="h-5 w-5 text-brasil-gold" />
                <span className="text-3xl font-bold text-brasil-pearl">4.8/5</span>
              </div>
              <p className="text-brasil-silver">Avaliação dos usuários</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-ouro-gradient py-16">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-4 text-brasil-navy">
              Pronto para criar sua primeira aplicação?
            </h2>
            <p className="text-xl mb-8 text-brasil-royal">
              Junte-se aos desenvolvedores que já estão usando IA para acelerar seus projetos
            </p>
            <Link href="/projects/new">
              <Button size="lg" variant="secondary" className="px-8 py-6 text-lg">
                Criar Aplicação Agora
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </React.Suspense>
  );
}
