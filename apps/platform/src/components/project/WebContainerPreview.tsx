'use client'

import { useEffect, useRef, useState } from 'react'
import { WebContainer } from '@webcontainer/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Terminal, CheckCircle, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface WebContainerPreviewProps {
  generatedCode?: Record<string, string>
  generationId?: string
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

export default function WebContainerPreview({ generatedCode, generationId }: WebContainerPreviewProps) {
  const webcontainerInstance = useRef<WebContainer | null>(null)
  const [status, setStatus] = useState<Status>('booting')
  const [url, setUrl] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const updateWebContainerFiles = async (files: Record<string, string>) => {
    if (!webcontainerInstance.current) return
    
    for (const [path, content] of Object.entries(files)) {
      await webcontainerInstance.current.fs.writeFile(path, content)
      addLog(`Arquivo atualizado: ${path}`)
    }
  }

  const startDevServer = async () => {
    if (!webcontainerInstance.current) return
    
    try {
      // Primeiro, instalar dependências
      setStatus('installing')
      addLog('Instalando dependências npm...')
      
      const installProcess = await webcontainerInstance.current.spawn('npm', ['install'])
      
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
      
      // Depois, iniciar o servidor de desenvolvimento
      setStatus('running')
      addLog('Iniciando servidor de desenvolvimento...')
      
      const serverProcess = await webcontainerInstance.current.spawn('npm', ['run', 'dev'])
      
      serverProcess.output.pipeTo(new WritableStream({
        write(data) {
          const output = new TextDecoder().decode(data)
          addLog(output.trim())
        }
      }))
      
      webcontainerInstance.current.on('server-ready', (port, url) => {
        addLog(`Servidor pronto na porta ${port}`)
        addLog(`URL: ${url}`)
        setUrl(url)
        setStatus('ready')
      })
    } catch (err) {
      console.error('Erro ao iniciar servidor:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setStatus('error')
      addLog(`Erro: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
    }
  }

  // SSE connection for real-time code streaming
  useEffect(() => {
    if (!generationId) return

    // Iniciar a conexão SSE
    const eventSource = new EventSource(`/api/v1/generations/${generationId}/stream`)
    console.log(`Conectado ao stream de geração para ${generationId}`)
    
    // Atualizar o estado da UI para indicar que estamos a receber o código
    setLogs(prev => [...prev, 'Conectado ao servidor. A receber código em tempo real...'])

    // Ouvinte para mensagens de dados (atualizações de código)
    eventSource.onmessage = (event) => {
      const files = JSON.parse(event.data)
      
      // Chama a função para escrever os ficheiros no WebContainer
      updateWebContainerFiles(files)
    }

    // Ouvinte para o evento personalizado de fim de stream
    eventSource.addEventListener('end', (event) => {
      console.log('Stream de geração terminado pelo servidor.')
      setLogs(prev => [...prev, 'Geração concluída! A iniciar o servidor de desenvolvimento...'])
      eventSource.close()
      
      // Agora que todos os ficheiros estão escritos, podemos iniciar o servidor
      startDevServer()
    })

    // Ouvinte para erros de conexão
    eventSource.onerror = (err) => {
      console.error('Erro na conexão SSE:', err)
      setLogs(prev => [...prev, 'Erro na conexão com o servidor.'])
      eventSource.close()
    }

    // Função de limpeza para fechar a conexão quando o componente é desmontado
    return () => {
      console.log(`A fechar a conexão SSE para ${generationId}`)
      eventSource.close()
    }
  }, [generationId])

  useEffect(() => {
    let isMounted = true

    const initializeContainer = async () => {
      try {
        addLog('Inicializando WebContainer...')
        
        const instance = await WebContainer.boot()
        
        if (!isMounted) return
        
        webcontainerInstance.current = instance
        addLog('WebContainer inicializado com sucesso')
        
        // Se temos um generationId, o SSE irá gerir a escrita de ficheiros
        // Caso contrário, usamos o código gerado fornecido como prop
        if (generationId) {
          addLog('Aguardando código via streaming...')
          setStatus('writing_files')
        } else if (generatedCode) {
          setStatus('writing_files')
          await writeFiles(instance)
          
          if (!isMounted) return
          
          setStatus('installing')
          await installDependencies(instance)
          
          if (!isMounted) return
          
          setStatus('running')
          await startDevServerLegacy(instance)
        }
        
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

    const startDevServerLegacy = async (instance: WebContainer) => {
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
  }, [generatedCode, generationId])

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