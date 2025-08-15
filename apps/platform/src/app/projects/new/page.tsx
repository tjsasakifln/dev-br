'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateProjectPage() {
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      setError('Você precisa estar logado para criar um projeto');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          prompt,
          userId: session.user.id,
        }),
      });

      if (response.ok) {
        const project = await response.json();
        router.push(`/projects/${project.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao criar projeto');
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.');
      console.error('Error creating project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Criar Nova Aplicação</h1>
        <p className="text-muted-foreground mt-2">
          Descreva sua ideia e nossa IA criará uma aplicação completa para você
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Projeto</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Meu App de Lista de Tarefas"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prompt">Descrição da Aplicação</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Descreva detalhadamente a aplicação que deseja criar. Inclua funcionalidades, tipo de usuários, fluxos principais, etc."
                className="min-h-[200px] resize-none"
                required
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Seja específico sobre as funcionalidades desejadas para obter melhores resultados
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !name.trim() || !prompt.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando Projeto...
                </>
              ) : (
                'Criar Aplicação'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}