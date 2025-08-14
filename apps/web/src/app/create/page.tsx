'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProjectService } from '@/services/projectService'

/**
 * Página de criação de projetos
 * Permite ao usuário descrever uma aplicação e iniciar sua geração
 */
export default function CreateProjectPage() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  /**
   * Handler para submissão do formulário
   * Envia o prompt para criação do projeto
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!prompt.trim()) {
      setError('Por favor, descreva sua aplicação')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Chama o serviço para criar o projeto
      await ProjectService.createProject(prompt.trim())
      
      // Redireciona para o dashboard em caso de sucesso
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar projeto')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Criar Nova Aplicação
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Descreva sua aplicação e nossa IA gerará o código completo para você
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                Descreva sua aplicação
              </label>
              <textarea
                id="prompt"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descreva detalhadamente a aplicação que deseja criar. Ex: Uma aplicação de e-commerce com React no frontend, FastAPI no backend, com sistema de autenticação, carrinho de compras e pagamentos..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md" data-testid="error-message">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={loading}
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg"
              >
                {loading ? 'Gerando...' : 'Gerar Aplicação'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}