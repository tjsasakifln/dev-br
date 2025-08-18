"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "../icons";

export function CreateProjectForm() {
  // Mock de handlers, substitua pela sua lógica de estado e submissão
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted");
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="project-prompt" className="text-base">
          Descrição do Projeto
        </Label>
        <Textarea
          id="project-prompt"
          placeholder="Ex: 'Um aplicativo de lista de tarefas com login de usuário e categorias, usando React e FastAPI'."
          className="min-h-[150px] text-base"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="file-upload" className="text-base">
          Melhorar Código Existente (Opcional)
        </Label>
        <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50 border-border hover:border-brasil-green-500/50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-muted-foreground" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Clique para enviar</span> ou arraste e solte</p>
                    <p className="text-xs text-muted-foreground">Arquivo ZIP ou arquivos avulsos</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" />
            </label>
        </div> 
      </div>

      <Button type="submit" className="w-full sm:w-auto justify-self-end bg-brasil-green-500 hover:bg-brasil-green-400 text-brasil-blue-900 font-bold text-base py-6 px-8">
        <Icons.langgraph className="mr-2 h-5 w-5" />
        Gerar Aplicação
      </Button>
    </form>
  );
}