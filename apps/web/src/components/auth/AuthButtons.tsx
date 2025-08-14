'use client'

interface AuthButtonsProps {
  onGoogleLogin: () => void
  onGitHubLogin: () => void
  onTriggerError: () => void
  error: string | null
}

/**
 * Componente de botões de autenticação
 * Renderiza botões de login para Google e GitHub, além de exibir mensagens de erro
 * @param props - Props do componente
 * @param props.onGoogleLogin - Callback para login com Google
 * @param props.onGitHubLogin - Callback para login com GitHub  
 * @param props.onTriggerError - Callback para simular erro (usado em testes)
 * @param props.error - Mensagem de erro atual
 */
export default function AuthButtons({ onGoogleLogin, onGitHubLogin, onTriggerError, error }: AuthButtonsProps) {
  return (
    <div className="mt-8">
      <div className="space-y-4">
        <button
          onClick={onGoogleLogin}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Entrar com Google
        </button>
        
        <button
          onClick={onGitHubLogin}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Entrar com GitHub
        </button>
        
        <button
          onClick={onTriggerError}
          data-testid="trigger-error-button"
          style={{ opacity: 0, position: 'absolute', left: '0px', top: '0px', width: '1px', height: '1px' }}
        >
          Simular Erro (Teste)
        </button>
      </div>
      
      {error && (
        <div 
          data-testid="error-message"
          className="mt-4 text-center text-sm text-red-600"
        >
          {error}
        </div>
      )}
    </div>
  )
}