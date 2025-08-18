import React from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { AlertTriangle, RotateCcw, Home, MessageCircle } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          errorInfo={this.state.errorInfo}
        />
      );
    }

    return this.props.children;
  }
}

// Default Error Fallback Component with Brazilian design
function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const isNetworkError = error?.message.includes('fetch') || error?.message.includes('network');
  const isAuthError = error?.message.includes('401') || error?.message.includes('unauthorized');

  return (
    <div className="min-h-screen bg-brasil-gradient flex items-center justify-center p-4">
      <Card variant="glass" className="max-w-lg w-full text-center">
        <CardHeader>
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <CardTitle className="text-xl text-gradient-gold">
            😅 Ops! Algo deu errado
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <p className="text-brasil-pearl/80">
              {isNetworkError 
                ? 'Parece que há um problema de conexão. Verifique sua internet e tente novamente.'
                : isAuthError
                ? 'Sua sessão expirou. Faça login novamente para continuar.'
                : 'Encontramos um erro inesperado, mas não se preocupe - vamos resolver juntos!'
              }
            </p>
            
            {error?.message && (
              <details className="text-left">
                <summary className="text-sm text-brasil-pearl/60 cursor-pointer hover:text-brasil-gold">
                  Detalhes técnicos
                </summary>
                <div className="mt-2 p-3 bg-brasil-navy/50 rounded text-xs text-brasil-pearl/70 font-mono">
                  {error.message}
                </div>
              </details>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="brasil" 
              onClick={resetError}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              🔄 Tentar Novamente
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/dashboard'}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              🏠 Voltar ao Início
            </Button>
          </div>

          <div className="border-t border-brasil-gold/20 pt-4">
            <p className="text-sm text-brasil-pearl/60">
              💡 Precisa de ajuda? Entre em contato conosco
            </p>
            <Button 
              variant="ghost" 
              size="sm"
              className="mt-2 flex items-center gap-2 mx-auto"
              onClick={() => window.open('mailto:suporte@devbr.com.br', '_blank')}
            >
              <MessageCircle className="h-4 w-4" />
              Falar com Suporte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Specialized Error Fallbacks
export function NetworkErrorFallback({ resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-brasil-gradient flex items-center justify-center p-4">
      <Card variant="glass" className="max-w-md w-full text-center">
        <CardContent className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-brasil-amber/20 rounded-full flex items-center justify-center mx-auto">
              <div className="text-2xl">📡</div>
            </div>
            <h3 className="text-xl font-bold text-gradient-gold">
              Conexão Instável
            </h3>
            <p className="text-brasil-pearl/80">
              Parece que sua conexão está instável. Vamos tentar reconectar automaticamente.
            </p>
          </div>

          <div className="space-y-3">
            <div className="loading-wave justify-center">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p className="text-sm text-brasil-pearl/60">Reconectando...</p>
          </div>

          <Button variant="outline" onClick={resetError} size="sm">
            Tentar Manualmente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function AuthErrorFallback() {
  return (
    <div className="min-h-screen bg-brasil-gradient flex items-center justify-center p-4">
      <Card variant="glass" className="max-w-md w-full text-center">
        <CardContent className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-brasil-gold/20 rounded-full flex items-center justify-center mx-auto">
              <div className="text-2xl">🔐</div>
            </div>
            <h3 className="text-xl font-bold text-gradient-gold">
              Sessão Expirada
            </h3>
            <p className="text-brasil-pearl/80">
              Sua sessão expirou por segurança. Faça login novamente para continuar.
            </p>
          </div>

          <Button 
            variant="brasil" 
            onClick={() => window.location.href = '/login'}
            className="w-full"
          >
            🚀 Fazer Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook para usar com error boundaries de forma programática
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    console.error('Captured error:', error);
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
}

// Higher-order component para adicionar error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorFallback?: React.ComponentType<ErrorFallbackProps>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={errorFallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default ErrorBoundary;
export { DefaultErrorFallback };
export type { ErrorBoundaryProps, ErrorFallbackProps };