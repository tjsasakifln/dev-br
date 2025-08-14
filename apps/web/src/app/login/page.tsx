'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  
  console.log('LoginPage render - error state:', error)

  const handleGoogleLogin = async () => {
    try {
      const result = await signIn('google', { 
        callbackUrl: '/dashboard',
        redirect: false 
      })
      if (result?.error) {
        setError('Erro na autenticação')
      } else if (result?.ok) {
        window.location.href = '/dashboard'
      }
    } catch (err) {
      setError('Erro na autenticação')
    }
  }

  const handleGitHubLogin = async () => {
    try {
      const result = await signIn('github', { 
        callbackUrl: '/dashboard',
        redirect: false 
      })
      if (result?.error) {
        setError('Erro na autenticação')
      } else if (result?.ok) {
        window.location.href = '/dashboard'
      }
    } catch (err) {
      setError('Erro na autenticação')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Faça seu login
          </h1>
        </div>
        
        <div className="mt-8">
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Entrar com Google
            </button>
            
            <button
              onClick={handleGitHubLogin}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Entrar com GitHub
            </button>
            
            <button
              onClick={() => {
                console.log('Simulate Error button clicked!')
                setError('Erro na autenticação')
                console.log('Error state set to: Erro na autenticação')
              }}
              data-testid="simulate-error-button"
              style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}
            >
              Simulate Error
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
      </div>
    </div>
  )
}