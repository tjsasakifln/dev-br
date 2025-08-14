'use client'

import { useState } from 'react'

interface CreateProjectFormProps {
  onSubmit: (prompt: string) => Promise<void>
  onCancel: () => void
  isLoading: boolean
  error: string | null
}

/**
 * Componente de formulário para criação de projetos
 * Gerencia o estado local do prompt e delega a submissão para o componente pai
 * 
 * @param {CreateProjectFormProps} props - Props do componente
 * @param {function} props.onSubmit - Função chamada ao submeter o formulário
 * @param {function} props.onCancel - Função chamada ao cancelar
 * @param {boolean} props.isLoading - Indica se está carregando
 * @param {string | null} props.error - Mensagem de erro, se houver
 * @returns {JSX.Element} Componente de formulário
 */
export function CreateProjectForm({ onSubmit, onCancel, isLoading, error }: CreateProjectFormProps) {
  const [prompt, setPrompt] = useState('')

  /**
   * Handler para submissão do formulário
   * Valida o prompt e chama a função de submissão do pai
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!prompt.trim()) {
      return
    }

    await onSubmit(prompt.trim())
  }

  return (
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
            disabled={isLoading}
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
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isLoading}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg"
          >
            {isLoading ? 'Gerando...' : 'Gerar Aplicação'}
          </button>
        </div>
      </form>
    </div>
  )
}