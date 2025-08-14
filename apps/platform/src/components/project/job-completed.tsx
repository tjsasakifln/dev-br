/**
 * Componente para exibir o estado de job concluído com sucesso
 * @param prUrl - URL do Pull Request gerado
 * @param className - Classes CSS adicionais opcionais
 */
interface JobCompletedProps {
  prUrl: string
  className?: string
}

export function JobCompleted({ prUrl, className }: JobCompletedProps) {
  return (
    <div className={className}>
      <h3 className="text-md font-medium text-gray-700 mb-2">Pull Request</h3>
      <a 
        data-testid="pr-link"
        href={prUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
      >
        Ver Pull Request →
      </a>
    </div>
  )
}