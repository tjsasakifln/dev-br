/**
 * Componente de barra de progresso para jobs em processamento
 * @param progress - Valor do progresso (0-100)
 * @param className - Classes CSS adicionais opcionais
 */
interface ProgressBarProps {
  progress: number
  className?: string
}

export function ProgressBar({ progress, className }: ProgressBarProps) {
  return (
    <div className={className}>
      <label htmlFor="progress" className="block text-sm font-medium text-gray-700 mb-2">
        Progresso
      </label>
      <div 
        data-testid="progress-bar"
        className="w-full bg-gray-200 rounded-full h-4"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div 
          className="bg-blue-600 h-4 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 mt-1">{progress}% concluído</p>
    </div>
  )
}