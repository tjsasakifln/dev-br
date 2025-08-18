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
        throw new Error(errData.error || 'Falha ao criar projeto');
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
          throw new Error(errData.error || 'Falha ao enviar arquivo');
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
        <CardTitle>Criar Novo Projeto</CardTitle>
        <CardDescription>Descreva sua ideia de aplicação em poucas palavras.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome do Projeto</Label>
            <Input id="name" placeholder="ex: Meu App de Tarefas Incrível" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prompt">Descrição da Aplicação</Label>
            <Textarea id="prompt" placeholder="Descreva o que você quer construir..." required value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="file">Upload de Código Existente (Opcional)</Label>
            <Input 
              id="file" 
              type="file" 
              accept=".zip" 
              onChange={(e) => setFile(e.target.files?.[0] || null)} 
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
            />
            <p className="text-xs text-muted-foreground">Envie um arquivo .zip contendo seu código existente para melhorar a precisão da geração.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Criando...' : 'Criar Projeto'}
          </Button>
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        </CardFooter>
      </form>
    </Card>
  );
}