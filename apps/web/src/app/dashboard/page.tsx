'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Project } from '@/types'
import { ProjectService } from '@/services/projectService'
import { ProjectList } from '@/components/ProjectList'
import { EmptyState } from '@/components/EmptyState'

/**
 * Página principal do dashboard que exibe os projetos do usuário
 * Responsável por gerenciar o estado dos projetos e orquestrar a renderização
 */
export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  /**
   * Carrega os projetos do usuário usando o serviço de projetos
   */
  const loadProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedProjects = await ProjectService.getProjects()
      setProjects(fetchedProjects)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects')
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  /**
   * Handler para criação de novo projeto
   * Navega para a página de criação de projetos
   */
  const handleCreateProject = () => {
    router.push('/create')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Gerencie seus projetos de aplicações full-stack
            </p>
          </div>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
            onClick={handleCreateProject}
          >
            Criar Nova Aplicação
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Carregando projetos...</p>
          </div>
        ) : projects.length === 0 ? (
          <EmptyState onCreateProject={handleCreateProject} />
        ) : (
          <ProjectList projects={projects} />
        )}
      </div>
    </div>
  )
}