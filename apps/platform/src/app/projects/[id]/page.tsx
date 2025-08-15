export default function ProjectProgressPage() {
  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Progresso da Geração</h1>
      <div className="max-w-2xl">
        <div className="h-4 bg-gray-200 rounded-lg">
          <div className="h-4 bg-blue-500 rounded-lg" style={{ width: '0%' }}></div>
        </div>
        <p className="mt-4 text-gray-600">Preparando geração...</p>
      </div>
    </main>
  );
}