'use client'

import { useEffect, useRef, useState } from 'react'
import { WebContainer } from '@webcontainer/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Terminal, CheckCircle, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface WebContainerPreviewProps {
  generatedCode: Record<string, string>
}

type Status = 'booting' | 'writing_files' | 'installing' | 'running' | 'ready' | 'error'

interface StatusInfo {
  status: Status
  message: string
  icon: React.ReactNode
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
}

const statusMap: Record<Status, StatusInfo> = {
  booting: {
    status: 'booting',
    message: 'Inicializando container...',
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    variant: 'secondary'
  },
  writing_files: {
    status: 'writing_files',
    message: 'Criando arquivos...',
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    variant: 'secondary'
  },
  installing: {
    status: 'installing',
    message: 'Instalando dependências...',
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    variant: 'secondary'
  },
  running: {
    status: 'running',
    message: 'Iniciando servidor...',
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    variant: 'secondary'
  },
  ready: {
    status: 'ready',
    message: 'Aplicação executando',
    icon: <CheckCircle className="h-4 w-4" />,
    variant: 'default'
  },
  error: {
    status: 'error',
    message: 'Erro na execução',
    icon: <AlertCircle className="h-4 w-4" />,
    variant: 'destructive'
  }
}

export default function WebContainerPreview({ generatedCode }: WebContainerPreviewProps) {
  const webcontainerInstance = useRef<WebContainer | null>(null)
  const [status, setStatus] = useState<Status>('booting')
  const [url, setUrl] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  useEffect(() => {
    let isMounted = true

    const initializeContainer = async () => {
      try {
        addLog('Inicializando WebContainer...')
        
        const instance = await WebContainer.boot()
        
        if (!isMounted) return
        
        webcontainerInstance.current = instance
        addLog('WebContainer inicializado com sucesso')
        
        setStatus('writing_files')
        await writeFiles(instance)
        
        if (!isMounted) return
        
        setStatus('installing')
        await installDependencies(instance)
        
        if (!isMounted) return
        
        setStatus('running')
        await startDevServer(instance)
        
      } catch (err) {
        console.error('Erro ao inicializar container:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        setStatus('error')
        addLog(`Erro: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
      }
    }

    const writeFiles = async (instance: WebContainer) => {
      addLog('Escrevendo arquivos no sistema virtual...')
      
      for (const [path, content] of Object.entries(generatedCode)) {
        await instance.fs.writeFile(path, content)
        addLog(`Arquivo criado: ${path}`)
      }
      
      addLog('Todos os arquivos foram escritos')
    }

    const installDependencies = async (instance: WebContainer) => {
      addLog('Instalando dependências npm...')
      
      const installProcess = await instance.spawn('npm', ['install'])
      
      installProcess.output.pipeTo(new WritableStream({
        write(data) {
          const output = new TextDecoder().decode(data)
          addLog(output.trim())
        }
      }))
      
      const exitCode = await installProcess.exit
      
      if (exitCode !== 0) {
        throw new Error(`npm install falhou com código ${exitCode}`)
      }
      
      addLog('Dependências instaladas com sucesso')
    }

    const startDevServer = async (instance: WebContainer) => {
      addLog('Iniciando servidor de desenvolvimento...')
      
      const serverProcess = await instance.spawn('npm', ['run', 'dev'])
      
      serverProcess.output.pipeTo(new WritableStream({
        write(data) {
          const output = new TextDecoder().decode(data)
          addLog(output.trim())
        }
      }))
      
      instance.on('server-ready', (port, url) => {
        if (!isMounted) return
        
        addLog(`Servidor pronto na porta ${port}`)
        addLog(`URL: ${url}`)
        setUrl(url)
        setStatus('ready')
      })
    }

    initializeContainer()

    return () => {
      isMounted = false
      if (webcontainerInstance.current) {
        webcontainerInstance.current.teardown()
      }
    }
  }, [generatedCode])

  const currentStatus = statusMap[status]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Preview da Aplicação
            </CardTitle>
            <Badge variant={currentStatus.variant} className="flex items-center gap-2">
              {currentStatus.icon}
              {currentStatus.message}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {status === 'ready' && url ? (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Aplicação executando em: <code className="bg-muted px-2 py-1 rounded">{url}</code>
              </div>
              <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
                <iframe
                  src={url}
                  className="w-full h-full"
                  title="Preview da Aplicação"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                />
              </div>
            </div>
          ) : status === 'error' ? (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive font-medium mb-2">Erro na Execução</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                {currentStatus.icon}
                <p className="text-sm text-muted-foreground">{currentStatus.message}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Logs de Execução</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4 max-h-48 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aguardando logs...</p>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-sm font-mono text-foreground/80">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}