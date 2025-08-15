'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function CreateProjectForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // !! IMPORTANTE !! Usamos o mesmo ID de utilizador "hardcoded" do dashboard
  const MOCK_USER_ID = 'substitua_pelo_id_de_um_utilizador_real_na_sua_bd';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/v1/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, prompt, userId: MOCK_USER_ID }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to create project');
      }
      
      // Sucesso! Redireciona para o dashboard para ver o novo projeto
      router.push('/dashboard');
      router.refresh(); // Garante que os dados da página do dashboard são atualizados

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create a New Project</CardTitle>
        <CardDescription>Describe your application idea in a few words.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Project Name</Label>
            <Input id="name" placeholder="e.g., My Awesome To-Do App" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prompt">Application Prompt</Label>
            <Textarea id="prompt" placeholder="Describe what you want to build..." required value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Project'}
          </Button>
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        </CardFooter>
      </form>
    </Card>
  );
}