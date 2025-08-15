import { GenerationProgress } from "@/components/projects/GenerationProgress";

// A página recebe os parâmetros da URL
export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const projectId = params.id;

  return (
    <main className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Project Details</h1>
        <p className="text-muted-foreground">Project ID: {projectId}</p>
      </div>
      <GenerationProgress projectId={projectId} />
    </main>
  );
}