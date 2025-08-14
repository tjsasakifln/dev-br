/**
 * Componente para exibir logs do job
 * @param log - Conteúdo do log
 * @param className - Classes CSS adicionais opcionais
 */
interface JobLogProps {
  log: string
  className?: string
}

export function JobLog({ log, className }: JobLogProps) {
  return (
    <div className={className}>
      <h3 className="text-md font-medium text-gray-700 mb-2">Log</h3>
      <div className="bg-gray-50 border border-gray-200 rounded p-3">
        <p className="text-sm text-gray-800 font-mono">{log}</p>
      </div>
    </div>
  )
}