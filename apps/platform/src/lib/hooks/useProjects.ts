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
  avgTime: string | null;
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
  
  // Calculate real statistics from project data
  const calculateAvgTime = (projects: Project[]): string | null => {
    const completedProjects = projects.filter(p => p.status === 'COMPLETED');
    if (completedProjects.length === 0) return null;
    
    let totalMinutes = 0;
    let validTimes = 0;
    
    completedProjects.forEach(project => {
      const created = new Date(project.createdAt);
      const updated = new Date(project.updatedAt);
      const diffMs = updated.getTime() - created.getTime();
      const diffMinutes = Math.round(diffMs / (1000 * 60));
      
      // Only count reasonable completion times (between 1 minute and 2 hours)
      if (diffMinutes >= 1 && diffMinutes <= 120) {
        totalMinutes += diffMinutes;
        validTimes++;
      }
    });
    
    if (validTimes === 0) return null;
    
    const avgMinutes = Math.round(totalMinutes / validTimes);
    return avgMinutes < 60 ? `${avgMinutes}min` : `${Math.round(avgMinutes / 60)}h ${avgMinutes % 60}min`;
  };

  const stats: ProjectsStats = {
    projects: projects.length,
    successRate: projects.length > 0 
      ? `${Math.round((projects.filter(p => p.status === 'COMPLETED').length / projects.length) * 100)}%`
      : "0%",
    avgTime: calculateAvgTime(projects),
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