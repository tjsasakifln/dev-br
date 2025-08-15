import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Definindo os tipos para os nossos dados
type Project = {
  id: string;
  name: string;
  prompt: string;
  status: string;
  createdAt: string;
};

async function getProjects(userId: string): Promise<Project[]> {
  try {
    // Em desenvolvimento, usar dados mock se a API não estiver acessível
    if (process.env.NODE_ENV === 'development') {
      // Tentar API, mas fallback para mock se falhar
      try {
        const res = await fetch(`http://localhost:3002/api/v1/projects?userId=${userId}`, {
          cache: 'no-store',
          signal: AbortSignal.timeout(5000), // timeout de 5s
        });

        if (res.ok) {
          return res.json();
        }
      } catch (apiError) {
        console.log('[API_UNAVAILABLE] Using mock data');
      }
      
      // Dados mock para desenvolvimento
      return [
        {
          id: "1",
          name: "Ecommerce App",
          prompt: "Create a modern ecommerce application with React and FastAPI",
          status: "pending",
          createdAt: "2025-08-15T03:29:52.923Z",
        },
        {
          id: "2", 
          name: "Blog Platform",
          prompt: "Build a blog platform with user authentication and content management",
          status: "completed",
          createdAt: "2025-08-15T03:29:57.064Z",
        },
      ];
    }

    // Para produção, usar a API real
    const res = await fetch(`http://api:3001/api/v1/projects?userId=${userId}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch projects');
    }
    return res.json();
  } catch (error) {
    console.error('[GET_PROJECTS_ERROR]', error);
    return [];
  }
}

export async function ProjectList({ userId }: { userId: string }) {
  const projects = await getProjects(userId);

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Projects Found</CardTitle>
          <CardDescription>
            You haven&apos;t created any projects yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <CardTitle>{project.name}</CardTitle>
            <CardDescription>Status: {project.status}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {project.prompt}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}