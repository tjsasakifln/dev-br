import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { fetchProjects } from '@/lib/api';

interface Project {
  id: string;
  name: string;
  prompt: string;
  status: string;
  generatedCode?: any;
  repositoryUrl?: string;
  failureReason?: string;
  userRating?: number;
  userFeedback?: string;
  uploadedFile?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectsStats {
  projects: number;
  successRate: string;
  avgTime: string;
  published: number;
}

const PROJECT_SWR_CONFIG = {
  refreshInterval: 30000, // 30s para dados do dashboard
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  dedupingInterval: 10000,
} as const;

export function useProjects() {
  const { data: session } = useSession();
  const token = session?.accessToken as string;

  const { data, error, isLoading, mutate } = useSWR(
    token ? '/api/projects' : null,
    () => fetchProjects(token),
    PROJECT_SWR_CONFIG
  );

  const projects: Project[] = data || [];
  
  // Calcular estatísticas dos projetos
  const stats: ProjectsStats = {
    projects: projects.length,
    successRate: projects.length > 0 
      ? `${Math.round((projects.filter(p => p.status === 'COMPLETED').length / projects.length) * 100)}%`
      : "0%",
    avgTime: "2.3min", // Placeholder - pode ser calculado a partir dos dados reais
    published: projects.filter(p => p.repositoryUrl).length,
  };

  return {
    projects,
    stats,
    isLoading,
    error,
    mutate, // Para revalidar os dados após criar novo projeto
  };
}