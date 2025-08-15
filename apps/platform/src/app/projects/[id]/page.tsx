'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Project {
  id: string;
  name: string;
  prompt: string;
  status: string;
  generatedCode?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectProgressPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchProject();
  }, [projectId]);

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
              <div className="text-green-700 font-semibold mb-2">✅ Geração concluída com sucesso!</div>
              <p className="text-green-600 text-sm">
                O código foi gerado e está pronto para uso.
              </p>
            </div>
            
            {project.generatedCode && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4">Código Gerado:</h2>
                <pre className="bg-gray-900 text-white p-4 rounded-md overflow-x-auto text-sm">
                  <code>{project.generatedCode}</code>
                </pre>
              </div>
            )}
          </>
        )}

        {project.status === 'FAILED' && (
          <div className="bg-red-50 p-6 rounded-lg">
            <div className="text-red-700 font-semibold mb-2">❌ Falha na geração</div>
            <p className="text-red-600 text-sm">
              Ocorreu um erro durante a geração. Tente novamente.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}