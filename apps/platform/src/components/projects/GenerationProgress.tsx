'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

type Generation = {
  id: string;
  status: string;
  progress: number;
  generatedOutput?: string; // Adicionar campo opcional para o código
};

export function GenerationProgress({ projectId }: { projectId: string }) {
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

    const intervalId = setInterval(pollGenerationStatus, 5000);
    pollGenerationStatus();

    return () => clearInterval(intervalId);
  }, [projectId]);

  const renderContent = () => {
    if (error) return <p className="text-red-500">{error}</p>;
    if (!generation) return <p>Loading generation status...</p>;
    
    if (generation.status === 'completed' && generation.generatedOutput) {
      return (
        <div>
          <h3 className="mb-2 font-semibold">Generation Complete!</h3>
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
        <CardTitle>Generation Progress</CardTitle>
        <CardDescription>
          The status of your code generation will update automatically below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}