'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, SearchInput, TextArea } from '@/components/ui/input';
import { LoadingProgress, useLoadingProgress, Skeleton, CardSkeleton } from '@/components/ui/loading-progress';
import { useToast } from '@/components/ui/toast-brasil';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Heart, 
  Zap, 
  Code, 
  Rocket, 
  Target,
  TrendingUp,
  Users,
  Github,
  Mail,
  Lock
} from 'lucide-react';

export function BrasilShowcase() {
  const toast = useToast();
  const [showLoading, setShowLoading] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  const loadingSteps = [
    { id: '1', message: '🚀 Inicializando sistema...', icon: '🚀' },
    { id: '2', message: '⚡ Configurando IA...', icon: '⚡' },
    { id: '3', message: '🎯 Preparando ambiente...', icon: '🎯' },
    { id: '4', message: '✨ Finalizando...', icon: '✨' }
  ];

  const { currentStep, progress, nextStep, updateProgress, reset } = useLoadingProgress(loadingSteps);

  const simulateLoading = async () => {
    setShowLoading(true);
    reset();
    
    for (let i = 0; i < 4; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      nextStep();
      updateProgress((i + 1) * 25);
    }
    
    setTimeout(() => {
      setShowLoading(false);
      toast.success('Demonstração concluída!', {
        description: 'Todos os componentes brasileiros funcionando perfeitamente'
      });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-brasil-gradient p-8">
      <div className="container mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-6 animate-fade-in">
          <h1 className="text-responsive-xl font-bold text-gradient-brasil">
            🇧🇷 Design System Brasileiro Premium
          </h1>
          <p className="text-brasil-pearl/80 text-lg max-w-2xl mx-auto">
            Uma demonstração completa dos componentes UI brasileiros com identidade visual única
          </p>
        </div>

        {/* Loading Demo */}
        {showLoading && (
          <div className="fixed inset-0 bg-brasil-navy/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <LoadingProgress
              steps={loadingSteps}
              currentStep={currentStep}
              progress={progress}
              className="max-w-lg"
            />
          </div>
        )}

        {/* Buttons Section */}
        <Card variant="glass" className="stagger-item">
          <CardHeader>
            <CardTitle className="text-gradient-gold">🚀 Botões Premium</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="brasil" onClick={() => toast.success('Botão Brasil clicado!')}>
                <Star className="h-4 w-4" />
                Brasil
              </Button>
              <Button variant="success" onClick={() => toast.success('Sucesso!')}>
                <TrendingUp className="h-4 w-4" />
                Sucesso
              </Button>
              <Button variant="warning" onClick={() => toast.warning('Atenção!')}>
                <Zap className="h-4 w-4" />
                Aviso
              </Button>
              <Button variant="outline" onClick={() => toast.info('Informação')}>
                <Target className="h-4 w-4" />
                Outline
              </Button>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button size="sm">Pequeno</Button>
              <Button size="default">Padrão</Button>
              <Button size="lg">Grande</Button>
              <Button size="xl">Extra Grande</Button>
            </div>

            <Button 
              variant="brasil" 
              size="lg" 
              onClick={simulateLoading}
              className="w-full"
            >
              🎮 Demonstrar Loading Progressivo
            </Button>
          </CardContent>
        </Card>

        {/* Cards Section */}
        <Card variant="glass" className="stagger-item">
          <CardHeader>
            <CardTitle className="text-gradient-gold">🎯 Cards Interativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card variant="default" interactive hover>
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-ouro-gradient rounded-lg flex items-center justify-center mx-auto">
                    <Code className="h-6 w-6 text-brasil-navy" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-brasil-pearl">Card Padrão</h3>
                    <p className="text-sm text-brasil-pearl/70">Com hover e interação</p>
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass" interactive hover>
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-success-gradient rounded-lg flex items-center justify-center mx-auto">
                    <Rocket className="h-6 w-6 text-success-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-brasil-pearl">Card Glass</h3>
                    <p className="text-sm text-brasil-pearl/70">Efeito vidro premium</p>
                  </div>
                </CardContent>
              </Card>

              <Card variant="gradient" interactive hover>
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-brasil-royal rounded-lg flex items-center justify-center mx-auto border border-brasil-gold/20">
                    <Heart className="h-6 w-6 text-brasil-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-brasil-pearl">Card Gradiente</h3>
                    <p className="text-sm text-brasil-pearl/70">Fundo brasileiro</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Inputs Section */}
        <Card variant="glass" className="stagger-item">
          <CardHeader>
            <CardTitle className="text-gradient-gold">📝 Inputs Avançados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input 
                  placeholder="Input padrão brasileiro"
                  leftIcon={<Mail className="h-4 w-4" />}
                />
                <Input 
                  type="password"
                  placeholder="Senha com toggle"
                  leftIcon={<Lock className="h-4 w-4" />}
                />
                <Input 
                  variant="glass"
                  placeholder="Input glass effect"
                  clearable
                />
              </div>
              
              <div className="space-y-4">
                <SearchInput 
                  placeholder="Buscar projetos..."
                  value={searchValue}
                  onSearch={setSearchValue}
                />
                <Input 
                  variant="filled"
                  status="success"
                  placeholder="Input com status de sucesso"
                />
                <Input 
                  variant="outline"
                  status="warning"
                  placeholder="Input com aviso"
                />
              </div>
            </div>

            <TextArea 
              placeholder="Descreva sua ideia de aplicação aqui..."
              className="min-h-[100px]"
              variant="glass"
            />
          </CardContent>
        </Card>

        {/* Badges and Status */}
        <Card variant="glass" className="stagger-item">
          <CardHeader>
            <CardTitle className="text-gradient-gold">🏷️ Badges e Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge variant="default" className="bg-ouro-gradient text-brasil-navy">
                ✨ Premium
              </Badge>
              <Badge variant="secondary" className="bg-brasil-royal text-brasil-pearl">
                🔄 Em Progresso
              </Badge>
              <Badge variant="outline" className="border-brasil-jade text-brasil-jade">
                ✅ Concluído
              </Badge>
              <Badge variant="destructive">
                ❌ Erro
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Skeleton Loaders */}
        <Card variant="glass" className="stagger-item">
          <CardHeader>
            <CardTitle className="text-gradient-gold">💀 Skeleton Loaders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-brasil-pearl font-medium">Skeletons Básicos</h4>
                <Skeleton variant="text" />
                <Skeleton variant="text" lines={3} />
                <Skeleton variant="button" />
                <Skeleton variant="avatar" />
              </div>
              
              <div>
                <h4 className="text-brasil-pearl font-medium mb-4">Card Skeleton</h4>
                <CardSkeleton />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Toast Demo */}
        <Card variant="glass" className="stagger-item">
          <CardHeader>
            <CardTitle className="text-gradient-gold">🍞 Sistema de Notificações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="success" 
                size="sm"
                onClick={() => toast.success('Projeto criado!', {
                  description: 'Sua aplicação está sendo gerada'
                })}
              >
                Sucesso
              </Button>
              <Button 
                variant="warning" 
                size="sm"
                onClick={() => toast.warning('Atenção!', {
                  description: 'Verifique os dados antes de continuar'
                })}
              >
                Aviso
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => toast.error('Erro na geração', {
                  description: 'Algo deu errado, mas vamos resolver!',
                  action: {
                    label: 'Tentar novamente',
                    onClick: () => console.log('Retry clicked')
                  }
                })}
              >
                Erro
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => toast.info('Dica importante', {
                  description: 'Use prompts detalhados para melhores resultados'
                })}
              >
                Info
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: Users, value: '1.2K+', label: 'Usuários', color: 'bg-ouro-gradient' },
            { icon: Code, value: '5.8K+', label: 'Projetos', color: 'bg-success-gradient' },
            { icon: Github, value: '98%', label: 'Sucesso', color: 'bg-brasil-royal border border-brasil-gold/20' },
            { icon: Zap, value: '2.1min', label: 'Tempo médio', color: 'bg-brasil-royal border border-brasil-gold/20' }
          ].map((stat, index) => (
            <Card key={index} variant="glass" className="stagger-item text-center hover-lift">
              <CardContent className="p-6 space-y-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mx-auto`}>
                  <stat.icon className="h-6 w-6 text-brasil-navy" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gradient-gold">{stat.value}</div>
                  <div className="text-sm text-brasil-pearl/70">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gradient-brasil mb-4">
            🎉 Design System Completo!
          </h2>
          <p className="text-brasil-pearl/80 mb-6">
            Todos os componentes implementados com identidade visual brasileira premium
          </p>
          <Button variant="brasil" size="lg" onClick={() => toast.success('Parabéns!', {
            description: 'Você explorou todo o design system brasileiro! 🇧🇷'
          })}>
            🚀 Finalizar Demonstração
          </Button>
        </div>
      </div>
    </div>
  );
}