'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Calendar, Star, TrendingUp, Zap, Code, Github, Target } from 'lucide-react'
import { UsageMetrics } from '@/components/dashboard/UsageMetrics'
import { LoadingProgress, useLoadingProgress } from '@/components/ui/loading-progress'
import { useToast } from '@/components/ui/toast-brasil'

interface Project {
  id: string
  name: string
  prompt: string
  status: string
  repositoryUrl?: string
  userRating?: number
  createdAt: string
  updatedAt: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [_error, _setError] = useState<string | null>(null)
  const toast = useToast()

  // Loading progressivo brasileiro
  const loadingSteps = [
    { id: '1', message: '🔐 Autenticando sessão...', icon: '🔐', duration: 800 },
    { id: '2', message: '📊 Carregando dashboard...', icon: '📊', duration: 1200 },
    { id: '3', message: '🎯 Sincronizando projetos...', icon: '🎯', duration: 1500 },
    { id: '4', message: '✨ Preparando ambiente...', icon: '✨', duration: 600 }
  ]
  
  const { 
    currentStep, 
    progress, 
    nextStep, 
    updateProgress, 
    reset 
  } = useLoadingProgress(loadingSteps)

  const fetchProjects = async () => {
    if (!session?.user?.id) return

    try {
      // Simulação de loading progressivo
      reset()
      updateProgress(0)
      
      // Etapa 1: Autenticação
      await new Promise(resolve => setTimeout(resolve, 800))
      nextStep()
      updateProgress(25)
      
      // Etapa 2: Carregamento do dashboard
      await new Promise(resolve => setTimeout(resolve, 600))
      nextStep()
      updateProgress(50)
      
      // Etapa 3: Buscar projetos
      const response = await fetch(`/api/v1/projects?userId=${session.user.id}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar projetos')
      }
      
      nextStep()
      updateProgress(75)
      
      const data = await response.json()
      
      // Etapa 4: Finalizar
      await new Promise(resolve => setTimeout(resolve, 400))
      nextStep()
      updateProgress(100)
      
      setProjects(data)
      _setError(null)
      
      toast.success('Dashboard carregado com sucesso!', {
        description: `${data.length} projetos encontrados`
      })
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      _setError(errorMessage)
      toast.error('Erro ao carregar projetos', {
        description: errorMessage,
        action: {
          label: 'Tentar novamente',
          onClick: () => fetchProjects()
        }
      })
    } finally {
      setTimeout(() => setLoading(false), 500) // Delay para mostrar o 100%
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [session?.user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': { label: '⏳ Aguardando', variant: 'outline' as const, class: 'border-brasil-amber text-brasil-amber' },
      'QUEUED': { label: '🔄 Na fila', variant: 'secondary' as const, class: 'bg-brasil-royal text-brasil-pearl' },
      'IN_PROGRESS': { label: '⚡ Gerando...', variant: 'warning' as const, class: 'animate-pulse' },
      'COMPLETED': { label: '✅ Concluído', variant: 'success' as const, class: 'glow-success' },
      'FAILED': { label: '❌ Falhou', variant: 'destructive' as const, class: '' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { label: status, variant: 'secondary' as const, class: '' }

    return <Badge variant={config.variant} className={config.class}>{config.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 transition-all duration-200 ${
              star <= rating ? 'fill-brasil-gold text-brasil-gold animate-pulse' : 'text-brasil-silver'
            }`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-brasil-gradient">
        <div className="container mx-auto p-8">
          <div className="flex items-center justify-center min-h-screen">
            <LoadingProgress
              steps={loadingSteps}
              currentStep={currentStep}
              progress={progress}
              className="max-w-lg"
            />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-brasil-gradient">
      <div className="container mx-auto p-8 animate-fade-in">
        {/* Header Hero */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="mb-6">
            <h1 className="text-responsive-xl font-bold text-gradient-brasil mb-4">
              🇧🇷 Bem-vindo de volta, {session?.user?.name}!
            </h1>
            <p className="text-brasil-pearl/80 text-lg">
              Gerencie suas aplicações criadas com a magia da IA brasileira
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card variant="glass" className="stagger-item p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-ouro-gradient rounded-lg flex items-center justify-center">
                  <Code className="h-6 w-6 text-brasil-navy" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-brasil-gold">{projects.length}</div>
                  <div className="text-sm text-brasil-pearl/70">Projetos</div>
                </div>
              </div>
            </Card>
            
            <Card variant="glass" className="stagger-item p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-success-gradient rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-success-foreground" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-brasil-jade">98%</div>
                  <div className="text-sm text-brasil-pearl/70">Sucesso</div>
                </div>
              </div>
            </Card>
            
            <Card variant="glass" className="stagger-item p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brasil-royal rounded-lg flex items-center justify-center border border-brasil-gold/20">
                  <Zap className="h-6 w-6 text-brasil-gold" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-brasil-pearl">2.3min</div>
                  <div className="text-sm text-brasil-pearl/70">Tempo médio</div>
                </div>
              </div>
            </Card>
            
            <Card variant="glass" className="stagger-item p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brasil-royal rounded-lg flex items-center justify-center border border-brasil-gold/20">
                  <Github className="h-6 w-6 text-brasil-pearl" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-brasil-pearl">{projects.filter(p => p.repositoryUrl).length}</div>
                  <div className="text-sm text-brasil-pearl/70">Publicados</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/projects/new">
              <Button variant="brasil" size="lg" className="flex items-center gap-2 px-8">
                <Plus className="h-5 w-5" />
                🚀 Criar Nova Aplicação
              </Button>
            </Link>
            <Link href="/dashboard/projects/new">
              <Button variant="outline" size="lg" className="flex items-center gap-2 px-8">
                <Target className="h-5 w-5" />
                📝 Ver Templates
              </Button>
            </Link>
          </div>
        </div>

        {/* Usage Metrics with new design */}
        <div className="mb-8">
          <UsageMetrics />
        </div>

        {/* Projects Section */}
        {projects.length === 0 ? (
          <Card variant="glass" className="text-center p-12 animate-slide-up">
            <div className="space-y-6">
              <div className="relative">
                <div className="w-24 h-24 bg-ouro-gradient rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-gold">
                  <Plus className="h-12 w-12 text-brasil-navy" />
                </div>
                <div className="absolute inset-0 w-24 h-24 border-4 border-brasil-gold/30 rounded-full animate-spin mx-auto" />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gradient-gold">
                  🎯 Sua primeira aplicação está a 3 passos!
                </h3>
                <p className="text-brasil-pearl/80 text-lg max-w-md mx-auto">
                  Transforme suas ideias em aplicações reais com a magia da IA brasileira
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
                  <div className="text-center p-4 glass-brasil rounded-lg">
                    <div className="text-2xl mb-2">💡</div>
                    <div className="text-sm text-brasil-pearl font-medium">Descreva sua ideia</div>
                  </div>
                  <div className="text-center p-4 glass-brasil rounded-lg">
                    <div className="text-2xl mb-2">⚡</div>
                    <div className="text-sm text-brasil-pearl font-medium">IA gera o código</div>
                  </div>
                  <div className="text-center p-4 glass-brasil rounded-lg">
                    <div className="text-2xl mb-2">🚀</div>
                    <div className="text-sm text-brasil-pearl font-medium">Deploy automático</div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/projects/new">
                  <Button variant="brasil" size="xl" className="px-10">
                    🎨 Criar Primeiro Projeto
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="px-8">
                  📚 Ver Exemplos
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Projects Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gradient-gold">
                🎯 Seus Projetos ({projects.length})
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  📊 Filtros
                </Button>
                <Button variant="outline" size="sm">
                  🔄 Ordenar
                </Button>
              </div>
            </div>
            
            {/* Projects Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, index) => (
                <Card 
                  key={project.id} 
                  variant="default"
                  interactive={true}
                  className={`stagger-item hover-lift`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg leading-tight text-brasil-pearl line-clamp-2">
                        {project.name}
                      </CardTitle>
                      {getStatusBadge(project.status)}
                    </div>
                    <p className="text-sm text-brasil-pearl/70 line-clamp-2">
                      {project.prompt}
                    </p>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-brasil-pearl/60">
                        <Calendar className="h-4 w-4" />
                        {formatDate(project.createdAt)}
                      </div>

                      {project.userRating && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-brasil-pearl">Sua avaliação:</span>
                          {renderStars(project.userRating)}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Link href={`/projects/${project.id}`} className="flex-1">
                          <Button variant="brasil" size="sm" className="w-full">
                            👁️ Ver Detalhes
                          </Button>
                        </Link>
                        
                        {project.repositoryUrl && (
                          <a 
                            href={project.repositoryUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            title="Ver no GitHub"
                          >
                            <Button variant="outline" size="icon-sm" className="shrink-0">
                              <Github className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}