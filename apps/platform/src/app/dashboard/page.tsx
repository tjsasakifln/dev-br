'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Calendar, Star, ExternalLink } from 'lucide-react'
import { UsageMetrics } from '@/components/dashboard/UsageMetrics'

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
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/v1/projects?userId=${session.user.id}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar projetos')
      }
      
      const data = await response.json()
      setProjects(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [session?.user?.id])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': { label: 'Aguardando', variant: 'secondary' as const },
      'QUEUED': { label: 'Na fila', variant: 'outline' as const },
      'IN_PROGRESS': { label: 'Gerando...', variant: 'default' as const },
      'COMPLETED': { label: 'Concluído', variant: 'default' as const },
      'FAILED': { label: 'Falhou', variant: 'destructive' as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { label: status, variant: 'secondary' as const }

    return <Badge variant={config.variant}>{config.label}</Badge>
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
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <main className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Carregando projetos...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie suas aplicações criadas com Dev BR
          </p>
        </div>
        <Link href="/projects/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Criar Nova Aplicação
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <UsageMetrics />
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 mb-6">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchProjects}
              className="mt-2"
            >
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {projects.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="text-muted-foreground">
                <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">Nenhum projeto ainda</h3>
                <p>Crie sua primeira aplicação com IA para começar</p>
              </div>
              <Link href="/projects/new">
                <Button>Criar Primeiro Projeto</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg leading-tight">{project.name}</CardTitle>
                  {getStatusBadge(project.status)}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.prompt}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(project.createdAt)}
                  </div>

                  {project.userRating && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Sua avaliação:</span>
                      {renderStars(project.userRating)}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Link href={`/projects/${project.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Ver Detalhes
                      </Button>
                    </Link>
                    
                    {project.repositoryUrl && (
                      <a 
                        href={project.repositoryUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        title="Ver no GitHub"
                      >
                        <Button variant="outline" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}