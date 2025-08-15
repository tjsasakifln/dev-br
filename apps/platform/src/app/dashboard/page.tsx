import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <Link href="/projects/new">
        <Button>Criar Nova Aplicação</Button>
      </Link>
    </main>
  );
}