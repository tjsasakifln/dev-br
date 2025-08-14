'use client'

import { useRouter } from 'next/navigation'
import { CreateProjectForm } from '@/components/create/CreateProjectForm'
import { useCreateProject } from '@/hooks/useCreateProject'

/**
 * Página de criação de projetos
 * Orquestra o formulário e a lógica de criação através do custom hook
 * 
 * @returns {JSX.Element} Componente da página de criação
 */
export default function CreateProjectPage(): JSX.Element {
  const router = useRouter()
  const { isLoading, error, createProject } = useCreateProject()

  /**
   * Handler para cancelamento do formulário
   * Redireciona o usuário de volta ao dashboard
   */
  const handleCancel = (): void => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <CreateProjectForm
          onSubmit={createProject}
          onCancel={handleCancel}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  )
}