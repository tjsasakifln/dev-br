'use client'

import { useState, useEffect, useCallback } from 'react'

interface JobStatus {
  status: 'processing' | 'completed' | 'failed'
  progress?: number
  log?: string
  pr_url?: string
  error_message?: string
}

/**
 * Hook customizado para gerenciar o status do projeto
 * Fornece estado e polling automático para jobs de projeto
 * 
 * @param projectId - ID do projeto para monitorar
 * @returns Objeto contendo status, loading, error e funções de controle
 */
interface UseProjectStatusReturn {
  jobStatus: JobStatus | null
  loading: boolean
  error: 'not_found' | 'network_error' | null
  refetch: () => Promise<void>
}

export function useProjectStatus(projectId: string): UseProjectStatusReturn {
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null)
  const [error, setError] = useState<'not_found' | 'network_error' | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchJobStatus = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`/api/v1/jobs/${projectId}/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      })

      if (response.status === 404) {
        setError('not_found')
        setLoading(false)
        return true
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
  }, [projectId])

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
  }, [fetchJobStatus])

  const refetch = useCallback(async () => {
    setLoading(true)
    await fetchJobStatus()
  }, [fetchJobStatus])

  return {
    jobStatus,
    loading,
    error,
    refetch
  }
}