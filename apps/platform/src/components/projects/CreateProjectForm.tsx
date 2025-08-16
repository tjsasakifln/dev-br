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
  const [file, setFile] = useState<File | null>(null);
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
      
      // First, create the project
      const projectResponse = await fetch(`${apiUrl}/api/v1/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, prompt, userId: MOCK_USER_ID }),
      });

      if (!projectResponse.ok) {
        const errData = await projectResponse.json();
        throw new Error(errData.error || 'Failed to create project');
      }

      const project = await projectResponse.json();

      // If a file was selected, upload it
      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch(`${apiUrl}/api/v1/projects/${project.id}/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errData = await uploadResponse.json();
          throw new Error(errData.error || 'Failed to upload file');
        }
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
          <div className="space-y-1.5">
            <Label htmlFor="file">Upload Existing Code (Optional)</Label>
            <Input 
              id="file" 
              type="file" 
              accept=".zip" 
              onChange={(e) => setFile(e.target.files?.[0] || null)} 
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
            />
            <p className="text-xs text-muted-foreground">Upload a .zip file containing your existing codebase to improve generation accuracy.</p>
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