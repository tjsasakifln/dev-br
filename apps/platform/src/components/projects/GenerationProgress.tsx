'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

type Generation = {
  id: string;
  status: string;
  progress: number;
  generatedOutput?: string; // Adicionar campo opcional para o código
};

type Project = {
  id: string;
  name: string;
  prompt: string;
  status: string;
  generatedCode?: any;
  repositoryUrl?: string;
};

export function GenerationProgress({ projectId }: { projectId: string }) {
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const projectRes = await fetch(`${apiUrl}/api/v1/projects/${projectId}`);
        if (!projectRes.ok) {
          const errData = await projectRes.json();
          throw new Error(errData.error || 'Failed to fetch project');
        }
        const projectData: Project = await projectRes.json();
        setProject(projectData);
      } catch (err: any) {
        setError(err.message);
      }
    };

    const pollGenerationStatus = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${apiUrl}/api/v1/projects/${projectId}/generations/latest`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to fetch status');
        }
        const data: Generation = await res.json();
        setGeneration(data);

        // Para o polling se a geração estiver concluída ou falhou
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(intervalId);
        }
      } catch (err: any) {
        setError(err.message);
        clearInterval(intervalId);
        }
    };

    // Fetch project data once
    fetchProjectData();

    const intervalId = setInterval(pollGenerationStatus, 5000);
    pollGenerationStatus();

    return () => clearInterval(intervalId);
  }, [projectId]);

  const renderContent = () => {
    if (error) return <p className="text-red-500">{error}</p>;
    if (!generation || !project) return <p>Loading project data...</p>;
    
    if (generation.status === 'completed' && generation.generatedOutput) {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="mb-2 font-semibold">Generation Complete!</h3>
            {project.status === 'COMPLETED' && project.generatedCode && (
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/projects/${projectId}/download`}
                download
              >
                <Button variant="outline">
                  Download Code
                </Button>
              </a>
            )}
          </div>
          <SyntaxHighlighter language="javascript" style={vscDarkPlus} showLineNumbers>
            {generation.generatedOutput}
          </SyntaxHighlighter>
        </div>
      );
    }

    if (generation.status === 'failed') {
      return <p className="text-red-500">Generation failed. Please try again.</p>;
    }

    // Se estiver 'queued' ou 'running'
    return (
      <div className="space-y-4">
        <div>
          <p><strong>Status:</strong> {generation.status}</p>
          <p><strong>Generation ID:</strong> {generation.id}</p>
        </div>
        <Progress value={generation.progress} className="w-full" />
        <p className="text-center">{generation.progress}% complete</p>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{project?.name || 'Project'} - Generation Progress</CardTitle>
        <CardDescription>
          {project?.prompt && (
            <p className="mb-2"><strong>Description:</strong> {project.prompt}</p>
          )}
          The status of your code generation will update automatically below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}