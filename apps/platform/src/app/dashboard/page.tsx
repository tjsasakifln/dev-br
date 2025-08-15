import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Mock projects data
const mockProjects = [
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

export default function DashboardPage() {
  return (
    <main className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Projects</h1>
        <Link href="/dashboard/projects/new">
          <Button>Create New Project</Button>
        </Link>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockProjects.map((project) => (
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
    </main>
  );
}