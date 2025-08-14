'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

/**
 * Custom hook para gerenciar autenticação
 * Encapsula a lógica de login e gestão de erros
 * @returns Objeto contendo estado de erro e funções de login
 */
export function useAuth() {
  const [error, setError] = useState<string | null>(null)

  /**
   * Realiza login com provedor OAuth genérico
   * @param provider - Nome do provedor (google, github)
   */
  const handleLogin = async (provider: 'google' | 'github') => {
    try {
      const result = await signIn(provider, { 
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

  /**
   * Login com Google
   */
  const handleGoogleLogin = () => handleLogin('google')

  /**
   * Login com GitHub
   */
  const handleGitHubLogin = () => handleLogin('github')

  /**
   * Simula erro para testes
   */
  const triggerError = () => setError('Erro na autenticação')

  return {
    error,
    handleGoogleLogin,
    handleGitHubLogin,
    triggerError
  }
}