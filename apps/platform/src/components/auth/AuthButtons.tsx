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
          className="group relative w-full flex justify-center py-3 px-6 border border-primary/20 text-sm font-medium rounded-lg text-primary-foreground bg-ouro-gradient hover:shadow-lg hover:shadow-primary/25 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all duration-200"
        >
          <span className="font-semibold">Entrar com Google</span>
        </button>
        
        <button
          onClick={onGitHubLogin}
          className="group relative w-full flex justify-center py-3 px-6 border border-border text-sm font-medium rounded-lg text-foreground bg-card hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-200"
        >
          <span className="font-semibold">Entrar com GitHub</span>
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