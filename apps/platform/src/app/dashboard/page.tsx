"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useProjects } from "@/lib/hooks/useProjects";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const StatCard = ({ title, value, icon: Icon }) => (
  <Card className="glass-brasil hover-lift">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      {Icon && <Icon className="h-4 w-4 text-primary" />}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gradient-gold">{value}</div>
    </CardContent>
  </Card>
);

const StatCardSkeleton = () => (
   <Card className="glass-brasil">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
    </CardHeader>
    <CardContent>
        <Skeleton className="h-8 w-16" />
    </CardContent>
  </Card>
);

const EmptyState = () => (
    <Card className="glass-brasil text-center col-span-1 md:col-span-2 lg:col-span-4 border-primary/20">
      <CardHeader>
        <CardTitle className="text-2xl text-gradient-gold">Comece sua jornada. Crie sua primeira aplicação!</CardTitle>
        <CardDescription className="text-muted-foreground">Transforme suas ideias em aplicações reais com a magia da IA brasileira.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-6 text-muted-foreground">O processo é simples: descreva sua ideia, a IA gera o código e você recebe um repositório no GitHub pronto para rodar.</p>
        <Button asChild className="btn-brasil">
            <Link href="/dashboard/projects/new">Criar Primeiro Projeto</Link>
        </Button>
      </CardContent>
    </Card>
);

const getStatusBadge = (status: string) => {
  const statusConfig = {
    PENDING: { label: "Pendente", variant: "secondary" as const },
    RUNNING: { label: "Em Progresso", variant: "default" as const },
    COMPLETED: { label: "Concluído", variant: "success" as const },
    FAILED: { label: "Falhado", variant: "destructive" as const },
  };
  
  return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "outline" as const };
};

// Componente real para lista de projetos
const ProjectList = ({ projects }: { projects: any[] }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {projects.map((project) => {
      const statusConfig = getStatusBadge(project.status);
      return (
        <Card key={project.id} className="glass-brasil hover-lift">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-foreground">{project.name}</CardTitle>
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            </div>
            <CardDescription>
              Criado em {format(new Date(project.createdAt), "dd/MM/yyyy", { locale: ptBR })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">{project.prompt}</p>
            {project.repositoryUrl && (
              <div className="mt-2">
                <a 
                  href={project.repositoryUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline transition-colors"
                >
                  Ver no GitHub →
                </a>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/projects/${project.id}`}>Ver Projeto</Link>
            </Button>
            {project.status === 'COMPLETED' && project.generatedCode && (
              <Button asChild size="sm" className="btn-brasil">
                <a href={`/api/projects/${project.id}/download`} download>
                  Download
                </a>
              </Button>
            )}
          </CardFooter>
        </Card>
      );
    })}
  </div>
);

export default function DashboardPage() {
  const { projects, stats, isLoading, error } = useProjects();

  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gradient-gold">Dashboard</h1>
          <p className="text-muted-foreground">Seus projetos e métricas em um só lugar.</p>
        </div>
        <Card className="glass-brasil border-destructive/20">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">Erro ao carregar projetos: {error.message}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gradient-gold">Dashboard</h1>
            <p className="text-muted-foreground">Seus projetos e métricas em um só lugar.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {isLoading ? (
                <>
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                </>
            ) : (
                <>
                    <StatCard title="Projetos" value={stats.projects} />
                    <StatCard title="Taxa de Sucesso" value={stats.successRate} />
                    <StatCard title="Tempo Médio" value={stats.avgTime || "N/A"} />
                    <StatCard title="Publicados" value={stats.published} />
                </>
            )}
        </div>

        <div className="space-y-6">
            {isLoading ? (
                <Card className="glass-brasil"><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
            ) : projects.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight text-gradient-gold">Seus Projetos</h2>
                        <Button asChild className="btn-brasil">
                            <Link href="/dashboard/projects/new">Novo Projeto</Link>
                        </Button>
                    </div>
                    <ProjectList projects={projects} />
                </div>
            )}
        </div>
    </div>
  );
}