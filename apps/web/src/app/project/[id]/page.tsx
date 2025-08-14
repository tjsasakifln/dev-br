'use client'

import { useParams } from 'next/navigation'
import { useProjectStatus } from '@/hooks/use-project-status'
import { ProgressBar } from '@/components/project/progress-bar'
import { JobCompleted } from '@/components/project/job-completed'
import { JobFailed } from '@/components/project/job-failed'
import { JobLog } from '@/components/project/job-log'

/**
 * Página de progresso do projeto
 * Exibe o status atual de um job de projeto com polling em tempo real
 */
export default function ProjectProgressPage() {
  const params = useParams()
  const id = params.id as string
  const { jobStatus, loading, error } = useProjectStatus(id)

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'processing':
        return 'Em Processamento'
      case 'completed':
        return 'Concluído'
      case 'failed':
        return 'Falhou'
      default:
        return 'Desconhecido'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Carregando...</h1>
      </div>
    )
  }

  if (error === 'not_found') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div data-testid="not-found-error" className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-800 mb-2">Projeto não encontrado</h1>
          <p className="text-red-600">O projeto solicitado não existe ou você não tem permissão para acessá-lo.</p>
        </div>
      </div>
    )
  }

  if (error === 'network_error') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div data-testid="network-error" className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-800 mb-2">Erro ao carregar o status do projeto</h1>
          <p className="text-red-600">Não foi possível conectar ao servidor. Tente novamente mais tarde.</p>
        </div>
      </div>
    )
  }

  if (!jobStatus) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Carregando status...</h1>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Progresso do Projeto</h1>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        {/* Status Display */}
        <div>
          <h2 className="text-lg font-semibold mb-2">
            Status: {getStatusDisplay(jobStatus.status)}
          </h2>
        </div>

        {/* Progress Bar */}
        {jobStatus.status === 'processing' && typeof jobStatus.progress === 'number' && (
          <ProgressBar progress={jobStatus.progress} />
        )}

        {/* Log Display */}
        {jobStatus.log && <JobLog log={jobStatus.log} />}

        {/* PR Link */}
        {jobStatus.status === 'completed' && jobStatus.pr_url && (
          <JobCompleted prUrl={jobStatus.pr_url} />
        )}

        {/* Error Message */}
        {jobStatus.status === 'failed' && jobStatus.error_message && (
          <JobFailed errorMessage={jobStatus.error_message} />
        )}
      </div>
    </div>
  )
}