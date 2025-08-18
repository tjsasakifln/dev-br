'use client'

import AuthButtons from '@/components/auth/AuthButtons'
import { useAuth } from '@/hooks/useAuth'

/**
 * Página de login da aplicação
 * Renderiza interface de autenticação com provedores OAuth
 * @returns Componente da página de login
 */
export default function LoginPage() {
  const { error, handleGoogleLogin, handleGitHubLogin, triggerError } = useAuth()
  
  console.log('LoginPage render - error state:', error)

  return (
    <div className="min-h-screen flex items-center justify-center bg-brasil-gradient py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="mt-6 text-center text-4xl font-extrabold bg-ouro-gradient bg-clip-text text-transparent">
            Dev BR
          </h1>
          <p className="mt-2 text-xl font-semibold text-foreground">
            Faça seu login
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Plataforma brasileira de desenvolvimento com IA
          </p>
        </div>
        
        <AuthButtons 
          onGoogleLogin={handleGoogleLogin}
          onGitHubLogin={handleGitHubLogin}
          onTriggerError={triggerError}
          error={error}
        />
      </div>
    </div>
  )
}