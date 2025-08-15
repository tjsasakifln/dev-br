'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';

type Project = {
  id: string;
  name: string;
  prompt: string;
  status: string;
};

export function ProjectList({ userId }: { userId: string }) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${apiUrl}/api/v1/projects?userId=${userId}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setProjects(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [userId]);

  const handleGenerate = async (projectId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/v1/projects/${projectId}/generate`, { method: 'POST' });
      if (res.status !== 202) throw new Error('Failed to start generation');
      
      // Redirecionar para a página de detalhes/progresso do projeto
      router.push(`/dashboard/projects/${projectId}`);
    } catch (error) {
      console.error(error);
      alert('Error starting generation.');
    }
  };

  if (isLoading) return <p>Loading projects...</p>;
  if (projects.length === 0) return <p>No projects found.</p>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <CardTitle>{project.name}</CardTitle>
            <CardDescription>Status: {project.status}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="line-clamp-3 text-sm text-muted-foreground">{project.prompt}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleGenerate(project.id)}>Generate</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}