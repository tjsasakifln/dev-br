/**
 * Componente para exibir o estado de job que falhou
 * @param errorMessage - Mensagem de erro detalhada
 * @param className - Classes CSS adicionais opcionais
 */
interface JobFailedProps {
  errorMessage: string
  className?: string
}

export function JobFailed({ errorMessage, className }: JobFailedProps) {
  return (
    <div className={className}>
      <h3 className="text-md font-medium text-red-700 mb-2">Erro</h3>
      <div data-testid="error-message" className="bg-red-50 border border-red-200 rounded p-3">
        <p className="text-sm text-red-800">{errorMessage}</p>
      </div>
    </div>
  )
}