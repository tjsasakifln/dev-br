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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Faça seu login
          </h1>
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