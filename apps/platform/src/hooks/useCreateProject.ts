'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProjectService } from '@/services/projectService'

interface UseCreateProjectReturn {
  isLoading: boolean
  error: string | null
  createProject: (prompt: string) => Promise<void>
}

/**
 * Custom hook para gerenciar a criação de projetos
 * Encapsula a lógica de estado, validação e comunicação com o serviço
 * 
 * @returns {UseCreateProjectReturn} Objeto contendo estado e função de criação
 */
export function useCreateProject(): UseCreateProjectReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  /**
   * Função para criar um novo projeto
   * 
   * @param {string} prompt - Descrição da aplicação a ser criada
   * @throws {Error} Quando o prompt está vazio ou ocorre erro na criação
   */
  const createProject = async (prompt: string): Promise<void> => {
    if (!prompt.trim()) {
      setError('Por favor, descreva sua aplicação')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      // Chama o serviço para criar o projeto
      await ProjectService.createProject(prompt.trim())
      
      // Redireciona para o dashboard em caso de sucesso
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar projeto')
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    createProject
  }
}