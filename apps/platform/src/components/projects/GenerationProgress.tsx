'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type Generation = {
  id: string;
  status: string;
  progress: number;
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
        const data = await res.json();
        setGeneration(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    pollGenerationStatus(); // Chamada imediata
    const intervalId = setInterval(pollGenerationStatus, 5000); // Polling a cada 5 segundos

    return () => clearInterval(intervalId); // Limpeza ao desmontar o componente
  }, [projectId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generation Progress</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500">{error}</p>}
        {!generation && !error && <p>Loading generation status...</p>}
        {generation && (
          <div className="space-y-4">
            <div>
              <p><strong>Status:</strong> {generation.status}</p>
              <p><strong>Generation ID:</strong> {generation.id}</p>
            </div>
            <Progress value={generation.progress} className="w-full" />
            <p className="text-center">{generation.progress}% complete</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}