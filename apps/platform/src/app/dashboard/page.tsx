import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Mock data - substitua pela sua lógica de fetch
const user = { name: "Tiago Sasaki" };
const stats = {
  projects: 0,
  successRate: "98%",
  avgTime: "2.3min",
  published: 0,
};

  return (
    <div className="container mx-auto min-h-screen p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Bem-vindo de volta, {user.name}!
        </h1>
        <p className="text-muted-foreground">
          Gerencie suas aplicações criadas com a magia da IA brasileira.
        </p>
      </header>

      <main className="grid gap-6">
        {/* Seção de Métricas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projetos</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.projects}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgTime}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Publicados</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.published}</div>
            </CardContent>
          </Card>
        </div>

        {/* Seção CTA Principal */}
        <Card className="bg-brasil-blue-800 border-brasil-green-500">
          <CardHeader>
            <CardTitle className="text-2xl text-brasil-yellow-500">Sua primeira aplicação está a 3 passos!</CardTitle>
            <CardDescription className="text-gray-300">Transforme ideias em aplicações reais com a magia da IA brasileira.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex items-start space-x-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brasil-green-500 text-background">1</div>
                  <div>
                      <h3 className="font-semibold">Descreva sua ideia</h3>
                      <p className="text-sm text-muted-foreground">Escreva em linguagem natural o que você quer construir.</p>
                  </div>
              </div>
               <div className="flex items-start space-x-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brasil-green-500 text-background">2</div>
                  <div>
                      <h3 className="font-semibold">IA gera o código</h3>
                      <p className="text-sm text-muted-foreground">Nossos agentes criam o frontend, backend e a infraestrutura.</p>
                  </div>
              </div>
               <div className="flex items-start space-x-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brasil-green-500 text-background">3</div>
                  <div>
                      <h3 className="font-semibold">Deploy automático</h3>
                      <p className="text-sm text-muted-foreground">Receba um repositório no GitHub pronto para rodar.</p>
                  </div>
              </div>
              <div className="flex gap-2 pt-4">
                  <Button className="bg-brasil-green-500 hover:bg-brasil-green-400 text-brasil-blue-900 font-bold">
                    Criar Primeiro Projeto
                  </Button>
                  <Button variant="outline">Ver Exemplos</Button>
              </div>
          </CardContent>
        </Card>

        {/* Adicione a lista de projetos aqui quando tiver a lógica */}
        {/* <ProjectList projects={projects} /> */}

      </main>
    </div>
  );
}