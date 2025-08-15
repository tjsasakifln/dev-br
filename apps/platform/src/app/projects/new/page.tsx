export default function CreateProjectPage() {
  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Criar Nova Aplicação</h1>
      <div className="max-w-2xl">
        <textarea 
          className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none"
          placeholder="Descreva a aplicação que deseja criar..."
        />
      </div>
    </main>
  );
}