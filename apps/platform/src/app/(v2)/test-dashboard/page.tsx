import { ProjectList } from "@/components/projects/ProjectList";
import { Button } from "@/components/ui/button";

// Esta página é um Server Component para testar
export default function TestDashboardPage() {
  // ID do utilizador que criamos na base de dados SQLite
  const MOCK_USER_ID = 'cmec9s5uk0000lve3ppu0nh3n';

  return (
    <main className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Test Dashboard - My Projects</h1>
        <Button>Create New Project</Button>
      </div>
      
      <ProjectList userId={MOCK_USER_ID} />
    </main>
  );
}