interface EmptyStateProps {
  onCreateProject?: () => void
}

/**
 * Componente que renderiza o estado vazio quando não há projetos
 * @param onCreateProject - Callback executado quando o botão de criar projeto é clicado
 */
export function EmptyState({ onCreateProject }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Você ainda não criou nenhum projeto
        </h3>
        <p className="text-gray-500 mb-6">
          Comece criando sua primeira aplicação full-stack
        </p>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
          onClick={onCreateProject}
        >
          Criar Nova Aplicação
        </button>
      </div>
    </div>
  )
}