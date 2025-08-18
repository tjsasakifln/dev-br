import useSWR from 'swr';

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
  refreshInterval: 30000,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  dedupingInterval: 10000,
} as const;

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.statusText}`);
  }
  
  return response.json();
};

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/v1/projects',
    fetcher,
    PROJECT_SWR_CONFIG
  );

  const projects: Project[] = data || [];
  
  const stats: ProjectsStats = {
    projects: projects.length,
    successRate: projects.length > 0 
      ? `${Math.round((projects.filter(p => p.status === 'COMPLETED').length / projects.length) * 100)}%`
      : "0%",
    avgTime: "2.3min",
    published: projects.filter(p => p.repositoryUrl).length,
  };

  return {
    projects,
    stats,
    isLoading,
    error,
    mutate,
  };
}