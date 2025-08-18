"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Icons } from "../icons";
import { apiCall } from "@/lib/api";
import { useToast } from "@/components/ui/toast-brasil";
import { mutate } from "swr";

export function CreateProjectForm() {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const { success, error } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      error("Por favor, descreva seu projeto.");
      return;
    }

    if (!session) {
      error("Você precisa estar logado para criar um projeto.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar FormData para envio
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('name', prompt.split('.')[0].substring(0, 50)); // Nome baseado na primeira frase
      
      // Adicionar arquivos se houver
      files.forEach((file, index) => {
        formData.append(`files`, file);
      });

      const response = await apiCall('/api/projects', {
        method: 'POST',
        body: formData,
        // Remove Content-Type header para que o browser defina automaticamente com boundary
        headers: {},
      }, session.accessToken as string);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar projeto');
      }

      const project = await response.json();
      
      success("Projeto criado!", {
        description: "Redirecionando para acompanhar o progresso...",
      });

      // Invalidar cache dos projetos para atualizar dashboard
      mutate('/api/projects');

      // Redirecionar para a página de progresso do projeto
      router.push(`/dashboard/projects/${project.id}`);
      
    } catch (err) {
      console.error('Erro ao criar projeto:', err);
      error("Erro ao criar projeto", {
        description: err instanceof Error ? err.message : "Erro inesperado ao criar projeto.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="project-prompt" className="text-base">
          Descrição do Projeto
        </Label>
        <Textarea
          id="project-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: 'Um aplicativo de lista de tarefas com login de usuário e categorias, usando React e FastAPI'."
          className="min-h-[150px] text-base"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="file-upload" className="text-base">
          Melhorar Código Existente (Opcional)
        </Label>
        <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50 border-border hover:border-brasil-green-500/50 ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-muted-foreground" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Clique para enviar</span> ou arraste e solte
                    </p>
                    <p className="text-xs text-muted-foreground">Arquivo ZIP ou arquivos avulsos (máx. 10MB)</p>
                    {files.length > 0 && (
                      <p className="text-xs text-brasil-green-500 mt-2">{files.length} arquivo(s) selecionado(s)</p>
                    )}
                </div>
                <Input 
                  id="dropzone-file" 
                  type="file" 
                  multiple 
                  onChange={handleFileChange}
                  className="hidden" 
                  disabled={isSubmitting}
                />
            </label>
        </div> 
        {files.length > 0 && (
          <div className="mt-2 space-y-1">
            {files.map((file, index) => (
              <div key={index} className="flex items-center text-sm text-muted-foreground">
                <Icons.file className="mr-2 h-4 w-4" />
                {file.name} ({Math.round(file.size / 1024)} KB)
              </div>
            ))}
          </div>
        )}
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting || !prompt.trim()}
        className="w-full sm:w-auto justify-self-end bg-brasil-green-500 hover:bg-brasil-green-400 text-brasil-blue-900 font-bold text-base py-6 px-8 disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
            Criando Projeto...
          </>
        ) : (
          <>
            <Icons.langgraph className="mr-2 h-5 w-5" />
            Gerar Aplicação
          </>
        )}
      </Button>
    </form>
  );
}