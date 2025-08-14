'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface JobStatus {
  status: 'processing' | 'completed' | 'failed'
  progress?: number
  log?: string
  pr_url?: string
  error_message?: string
}

export default function ProjectProgressPage() {
  const params = useParams()
  const id = params.id as string

  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchJobStatus = async () => {
    try {
      const response = await fetch(`/api/v1/jobs/${id}/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      })

      if (response.status === 404) {
        setError('not_found')
        setLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error('Network error')
      }

      const data = await response.json()
      setJobStatus(data)
      setError(null)
      setLoading(false)

      // Stop polling if job is in final state
      if (data.status === 'completed' || data.status === 'failed') {
        return true // Signal to stop polling
      }

      return false // Continue polling
    } catch (err) {
      setError('network_error')
      setLoading(false)
      return true // Stop polling on error
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout

    const startPolling = async () => {
      // Initial fetch
      const shouldStop = await fetchJobStatus()
      
      if (!shouldStop) {
        // Start polling every 2 seconds for non-final states
        interval = setInterval(async () => {
          const shouldStopPolling = await fetchJobStatus()
          if (shouldStopPolling && interval) {
            clearInterval(interval)
          }
        }, 2000)
      }
    }

    startPolling()

    // Cleanup interval on unmount
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [id])

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

        {/* Progress Bar - only show for processing status */}
        {jobStatus.status === 'processing' && typeof jobStatus.progress === 'number' && (
          <div>
            <label htmlFor="progress" className="block text-sm font-medium text-gray-700 mb-2">
              Progresso
            </label>
            <div 
              data-testid="progress-bar"
              className="w-full bg-gray-200 rounded-full h-4"
              role="progressbar"
              aria-valuenow={jobStatus.progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${jobStatus.progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">{jobStatus.progress}% concluído</p>
          </div>
        )}

        {/* Log Display */}
        {jobStatus.log && (
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">Log</h3>
            <div className="bg-gray-50 border border-gray-200 rounded p-3">
              <p className="text-sm text-gray-800 font-mono">{jobStatus.log}</p>
            </div>
          </div>
        )}

        {/* PR Link - show for completed status */}
        {jobStatus.status === 'completed' && jobStatus.pr_url && (
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">Pull Request</h3>
            <a 
              data-testid="pr-link"
              href={jobStatus.pr_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Ver Pull Request →
            </a>
          </div>
        )}

        {/* Error Message - show for failed status */}
        {jobStatus.status === 'failed' && jobStatus.error_message && (
          <div>
            <h3 className="text-md font-medium text-red-700 mb-2">Erro</h3>
            <div data-testid="error-message" className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-800">{jobStatus.error_message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}