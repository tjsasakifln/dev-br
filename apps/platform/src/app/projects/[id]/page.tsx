'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WebContainerPreview from '@/components/project/WebContainerPreview';
import FeedbackForm from '@/components/project/FeedbackForm';

interface Project {
  id: string;
  name: string;
  prompt: string;
  status: string;
  generatedCode?: Record<string, string> | string;
  repositoryUrl?: string;
  failureReason?: string;
  userRating?: number;
  userFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

interface FileTreeProps {
  files: Record<string, string>;
  selectedFile: string;
  onSelectFile: (fileName: string) => void;
}

function FileTree({ files, selectedFile, onSelectFile }: FileTreeProps) {
  const fileNames = Object.keys(files).sort();

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop();
    switch (extension) {
      case 'tsx':
      case 'jsx':
        return '⚛️';
      case 'ts':
      case 'js':
        return '📜';
      case 'json':
        return '📋';
      case 'css':
        return '🎨';
      case 'html':
        return '🌐';
      case 'md':
        return '📝';
      case 'yml':
      case 'yaml':
        return '⚙️';
      default:
        return '📄';
    }
  };

  return (
    <div className="bg-gray-50 border-r border-gray-200 p-4">
      <h3 className="font-semibold text-gray-800 mb-3">Arquivos do Projeto</h3>
      <div className="space-y-1">
        {fileNames.map((fileName) => (
          <button
            key={fileName}
            onClick={() => onSelectFile(fileName)}
            className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 transition-colors ${
              selectedFile === fileName
                ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                : 'text-gray-700'
            }`}
          >
            <span className="mr-2">{getFileIcon(fileName)}</span>
            <span className="font-mono text-xs">{fileName}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function CodeDisplay({ content, fileName }: { content: string; fileName: string }) {
  const getLanguage = (fileName: string) => {
    const extension = fileName.split('.').pop();
    switch (extension) {
      case 'tsx':
      case 'jsx':
        return 'typescript';
      case 'ts':
        return 'typescript';
      case 'js':
        return 'javascript';
      case 'json':
        return 'json';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      case 'md':
        return 'markdown';
      case 'yml':
      case 'yaml':
        return 'yaml';
      default:
        return 'text';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
        <span className="font-mono text-sm text-gray-700">{fileName}</span>
      </div>
      <pre className="bg-gray-900 text-white p-4 overflow-x-auto text-sm max-h-96">
        <code className={`language-${getLanguage(fileName)}`}>{content}</code>
      </pre>
    </div>
  );
}

export default function ProjectProgressPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { data: session } = useSession();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('');

  const fetchProject = async () => {
    try {
      const response = await fetch(`http://localhost:3002/api/v1/projects/${projectId}`);
      if (!response.ok) {
        throw new Error('Projeto não encontrado');
      }
      const data = await response.json();
      setProject(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar projeto');
    } finally {
      setLoading(false);
    }
  };

  const startGeneration = async () => {
    try {
      setGenerating(true);
      const response = await fetch(`http://localhost:3002/api/v1/projects/${projectId}/generate`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao iniciar geração');
      }
      
      const updatedProject = await response.json();
      setProject(updatedProject);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar geração');
    } finally {
      setGenerating(false);
    }
  };

  const publishToGitHub = async () => {
    if (!session?.accessToken) {
      setError('Token de acesso do GitHub não encontrado. Faça login novamente.');
      return;
    }

    try {
      setPublishing(true);
      setError(null);
      
      const response = await fetch(`http://localhost:3002/api/v1/projects/${projectId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: session.accessToken,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao publicar projeto');
      }
      
      const updatedProject = await response.json();
      setProject(updatedProject);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao publicar projeto');
    } finally {
      setPublishing(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  // Set default selected file when project loads
  useEffect(() => {
    if (project?.generatedCode && typeof project.generatedCode === 'object' && !selectedFile) {
      const fileNames = Object.keys(project.generatedCode);
      if (fileNames.length > 0) {
        // Prioritize certain files as default
        const priorityFiles = ['client/src/App.tsx', 'src/App.tsx', 'package.json', 'server.js'];
        const defaultFile = priorityFiles.find(file => fileNames.includes(file)) || fileNames[0];
        setSelectedFile(defaultFile);
      }
    }
  }, [project?.generatedCode, selectedFile]);

  useEffect(() => {
    if (!project) return;
    
    const interval = setInterval(() => {
      fetchProject();
    }, 3000);
    
    if (project.status === 'COMPLETED' || project.status === 'FAILED') {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [project?.status]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Aguardando';
      case 'QUEUED': return 'Na fila';
      case 'IN_PROGRESS': return 'Gerando código...';
      case 'COMPLETED': return 'Concluído';
      case 'FAILED': return 'Falhou';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-gray-600';
      case 'QUEUED': return 'text-yellow-600';
      case 'IN_PROGRESS': return 'text-blue-600';
      case 'COMPLETED': return 'text-green-600';
      case 'FAILED': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Carregando...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto p-8">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <button 
            onClick={fetchProject}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Tentar novamente
          </button>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="container mx-auto p-8">
        <div className="text-center text-gray-600">Projeto não encontrado</div>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Progresso da Geração</h1>
      
      <div className="max-w-2xl space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
          <p className="text-gray-600 mb-4">{project.prompt}</p>
          
          <div className="flex items-center justify-between">
            <span className={`font-medium ${getStatusColor(project.status)}`}>
              Status: {getStatusText(project.status)}
            </span>
            
            {(project.status === 'PENDING' || project.status === 'FAILED') && (
              <button
                onClick={startGeneration}
                disabled={generating}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {generating ? 'Iniciando...' : 'Iniciar Geração'}
              </button>
            )}
          </div>
        </div>

        {project.status === 'IN_PROGRESS' && (
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              <span className="text-blue-700">Gerando código...</span>
            </div>
            <p className="text-blue-600 text-sm">
              Este processo pode levar alguns minutos. A página será atualizada automaticamente.
            </p>
          </div>
        )}

        {project.status === 'COMPLETED' && (
          <>
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-green-700 font-semibold mb-2">✅ Geração concluída com sucesso!</div>
                  <p className="text-green-600 text-sm">
                    O projeto foi gerado e está pronto para uso.
                  </p>
                </div>
                
                {/* GitHub Publishing Section */}
                <div className="ml-4">
                  {!project.repositoryUrl ? (
                    <button
                      onClick={publishToGitHub}
                      disabled={publishing || !session?.accessToken}
                      className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {publishing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Publicando...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"></path>
                          </svg>
                          Publicar no GitHub
                        </>
                      )}
                    </button>
                  ) : (
                    <a
                      href={project.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"></path>
                      </svg>
                      Ver no GitHub
                    </a>
                  )}
                </div>
              </div>
              
              {!session?.accessToken && !project.repositoryUrl && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-yellow-700 text-sm">
                    ⚠️ Para publicar no GitHub, faça login com uma conta do GitHub que tenha as permissões necessárias.
                  </p>
                </div>
              )}
            </div>
            
            {project.generatedCode && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <h2 className="text-2xl font-semibold p-6 border-b border-gray-200">Projeto Gerado:</h2>
                
                {/* Check if generatedCode is an object (new format) or string (legacy) */}
                {typeof project.generatedCode === 'object' ? (
                  <Tabs defaultValue="code" className="w-full">
                    <div className="px-6 pt-4">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="code">Código</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <TabsContent value="code" className="mt-0">
                      <div className="flex h-[600px]">
                        <div className="w-1/3 min-w-[250px]">
                          <FileTree
                            files={project.generatedCode}
                            selectedFile={selectedFile || Object.keys(project.generatedCode)[0] || ''}
                            onSelectFile={(fileName) => {
                              setSelectedFile(fileName);
                            }}
                          />
                        </div>
                        <div className="flex-1 p-4 overflow-auto">
                          {selectedFile || Object.keys(project.generatedCode).length > 0 ? (
                            <CodeDisplay
                              content={project.generatedCode[selectedFile || Object.keys(project.generatedCode)[0]]}
                              fileName={selectedFile || Object.keys(project.generatedCode)[0]}
                            />
                          ) : (
                            <div className="text-center text-gray-500 mt-8">
                              <p>Selecione um arquivo para ver o conteúdo</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="preview" className="mt-0">
                      <div className="p-6">
                        <WebContainerPreview generatedCode={project.generatedCode} />
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="p-6">
                    <pre className="bg-gray-900 text-white p-4 rounded-md overflow-x-auto text-sm">
                      <code>{project.generatedCode}</code>
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Feedback Form - only show for completed projects without feedback */}
            {project.status === 'COMPLETED' && !project.userRating && (
              <FeedbackForm 
                projectId={project.id}
                onFeedbackSubmitted={fetchProject}
              />
            )}
          </>
        )}

        {project.status === 'FAILED' && (
          <div className="bg-red-50 p-6 rounded-lg">
            <div className="text-red-700 font-semibold mb-2">❌ Falha na geração</div>
            {project.failureReason ? (
              <div className="space-y-2">
                <p className="text-red-600 text-sm">
                  Motivo da falha: {project.failureReason}
                </p>
                <p className="text-red-600 text-sm">
                  Tente ajustar sua descrição e gerar novamente.
                </p>
              </div>
            ) : (
              <p className="text-red-600 text-sm">
                Ocorreu um erro durante a geração. Tente novamente.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}