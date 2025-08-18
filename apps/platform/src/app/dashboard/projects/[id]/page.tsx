"use client";
import { GenerationProgress } from "@/components/projects/GenerationProgress";
import { JobLog } from "@/components/project/job-log";
import WebContainerPreview from "@/components/project/WebContainerPreview";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { apiCall } from "@/lib/api";

interface LogEntry {
  timestamp: string;
  message: string;
  status: 'completed' | 'in_progress' | 'pending' | 'error';
}

interface ProgressData {
  progress: number;
  status: string;
  currentStep: string;
  logs: LogEntry[];
}

interface Project {
  id: string;
  name: string;
  status: string;
  prompt: string;
}

// Componente de progresso em tempo real
const RealTimeProgressCard = ({ projectId }: { projectId: string }) => {
  const [progressData, setProgressData] = useState<ProgressData>({
    progress: 0,
    status: 'PENDING',
    currentStep: 'Iniciando...',
    logs: []
  });
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.accessToken) return;

    // Conectar ao stream SSE
    const eventSource = new EventSource(
      `/api/generations/${projectId}/stream?token=${session.accessToken}`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setProgressData(prev => ({
          ...prev,
          progress: data.progress || prev.progress,
          status: data.status || prev.status,
          currentStep: data.currentStep || prev.currentStep,
          logs: data.logs ? [...prev.logs, ...data.logs] : prev.logs,
        }));
      } catch (error) {
        console.error('Erro ao parsear dados do stream:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Erro na conexão SSE:', error);
      eventSource.close();
    };

    eventSource.addEventListener('complete', () => {
      console.log('Geração concluída');
      eventSource.close();
    });

    eventSource.addEventListener('error', (event) => {
      console.error('Erro na geração:', event);
      setProgressData(prev => ({
        ...prev,
        status: 'FAILED',
        currentStep: 'Erro na geração'
      }));
      eventSource.close();
    });

    return () => {
      eventSource.close();
    };
  }, [projectId, session?.accessToken]);

  const getStepStatus = (stepName: string) => {
    const steps = [
      'Análise de requisitos',
      'Template selecionado',
      'Gerando código',
      'Validação e testes'
    ];
    
    const currentIndex = Math.floor(progressData.progress / 25);
    const stepIndex = steps.indexOf(stepName);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'in_progress';
    return 'pending';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm">
        <span>Progresso da Geração</span>
        <span>{progressData.progress}%</span>
      </div>
      <Progress value={progressData.progress} className="w-full" />
      <div className="text-sm text-muted-foreground mb-4">
        Status: {progressData.currentStep}
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            getStepStatus('Análise de requisitos') === 'completed' ? 'bg-green-500' :
            getStepStatus('Análise de requisitos') === 'in_progress' ? 'bg-yellow-500 animate-pulse' :
            'bg-gray-300'
          }`}></div>
          <span className={
            getStepStatus('Análise de requisitos') === 'completed' ? 'text-green-700' :
            getStepStatus('Análise de requisitos') === 'in_progress' ? 'text-yellow-700' :
            'text-gray-500'
          }>Análise de requisitos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            getStepStatus('Template selecionado') === 'completed' ? 'bg-green-500' :
            getStepStatus('Template selecionado') === 'in_progress' ? 'bg-yellow-500 animate-pulse' :
            'bg-gray-300'
          }`}></div>
          <span className={
            getStepStatus('Template selecionado') === 'completed' ? 'text-green-700' :
            getStepStatus('Template selecionado') === 'in_progress' ? 'text-yellow-700' :
            'text-gray-500'
          }>Template selecionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            getStepStatus('Gerando código') === 'completed' ? 'bg-green-500' :
            getStepStatus('Gerando código') === 'in_progress' ? 'bg-yellow-500 animate-pulse' :
            'bg-gray-300'
          }`}></div>
          <span className={
            getStepStatus('Gerando código') === 'completed' ? 'text-green-700' :
            getStepStatus('Gerando código') === 'in_progress' ? 'text-yellow-700' :
            'text-gray-500'
          }>Gerando código...</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            getStepStatus('Validação e testes') === 'completed' ? 'bg-green-500' :
            getStepStatus('Validação e testes') === 'in_progress' ? 'bg-yellow-500 animate-pulse' :
            'bg-gray-300'
          }`}></div>
          <span className={
            getStepStatus('Validação e testes') === 'completed' ? 'text-green-700' :
            getStepStatus('Validação e testes') === 'in_progress' ? 'text-yellow-700' :
            'text-gray-500'
          }>Validação e testes</span>
        </div>
      </div>
    </div>
  );
};

export default function ProjectProgressPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [realTimeLogs, setRealTimeLogs] = useState<string>("");
  const { data: session } = useSession();

  // Buscar dados do projeto
  useEffect(() => {
    const fetchProject = async () => {
      if (!session?.accessToken) return;
      
      try {
        const response = await apiCall(`/api/projects/${params.id}`, {
          method: 'GET'
        }, session.accessToken as string);
        
        if (response.ok) {
          const projectData = await response.json();
          setProject(projectData);
        }
      } catch (error) {
        console.error('Erro ao buscar projeto:', error);
      }
    };

    fetchProject();
  }, [params.id, session?.accessToken]);

  // Conectar aos logs em tempo real
  useEffect(() => {
    if (!session?.accessToken) return;

    const eventSource = new EventSource(
      `/api/generations/${params.id}/logs?token=${session.accessToken}`
    );

    eventSource.onmessage = (event) => {
      const logEntry = event.data;
      setRealTimeLogs(prev => 
        prev + `\n[${new Date().toLocaleTimeString()}] ${logEntry}`
      );
    };

    return () => {
      eventSource.close();
    };
  }, [params.id, session?.accessToken]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: "Pendente", className: "bg-gray-500" },
      RUNNING: { label: "Em Progresso", className: "bg-brasil-yellow-500 text-brasil-blue-900" },
      COMPLETED: { label: "Concluído", className: "bg-green-500" },
      FAILED: { label: "Falhado", className: "bg-red-500" },
    };
    
    return statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      className: "bg-gray-500" 
    };
  };

  if (!project) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusBadge(project.status);
  
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                {project.name}
                <Badge className={`text-sm ${statusConfig.className}`}>
                  {statusConfig.label}
                </Badge>
            </h1>
            <p className="text-muted-foreground">
              Acompanhe em tempo real a geração da sua aplicação pelo agente de IA.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {project.prompt}
            </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader><CardTitle>Pré-visualização ao Vivo</CardTitle></CardHeader>
                    <CardContent>
                        <WebContainerPreview generationId={params.id} />
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader><CardTitle>Log de Atividades da IA</CardTitle></CardHeader>
                    <CardContent>
                        <JobLog log={realTimeLogs || `[${new Date().toLocaleTimeString()}] Aguardando logs do servidor...`} />
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-1">
                <Card className="sticky top-20">
                     <CardHeader><CardTitle>Progresso Geral</CardTitle></CardHeader>
                     <CardContent>
                        <RealTimeProgressCard projectId={params.id} />
                     </CardContent>
                </Card>
                
                <div className="mt-6">
                    <GenerationProgress projectId={params.id} />
                </div>
            </div>
        </div>
    </div>
  );
}