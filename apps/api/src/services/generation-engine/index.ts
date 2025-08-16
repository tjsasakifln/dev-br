import { invokeGenerationGraph } from './graph';
import { prisma } from '../../lib/prisma';

/**
 * Função wrapper para invocar o grafo de geração de código.
 * Busca o projeto no banco e chama a função principal do grafo.
 * @param projectId ID do projeto para gerar código
 * @returns Resultado da geração com sucesso ou erro
 */
export async function invokeGenerationForProject(
  projectId: string
): Promise<{ success: boolean; error?: string; generatedCode?: Record<string, string> }> {
  try {
    // Buscar o projeto no banco de dados
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { user: true }
    });

    if (!project) {
      throw new Error(`Projeto não encontrado: ${projectId}`);
    }

    console.log(`🚀 Iniciando geração de código para projeto ${projectId}`);
    console.log(`📝 Prompt: ${project.prompt}`);

    // Chamar a função de invocação do grafo
    const result = await invokeGenerationGraph(projectId, project.prompt);

    if (result.status === 'failed') {
      return {
        success: false,
        error: result.error
      };
    }

    console.log(`✅ Geração concluída para projeto ${projectId}`);
    console.log(`📁 Output path: ${result.outputPath}`);

    // Buscar o código gerado da última geração
    const latestGeneration = await prisma.generation.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });

    const generatedCode = latestGeneration?.generatedOutput 
      ? JSON.parse(latestGeneration.generatedOutput) 
      : {};

    return {
      success: true,
      generatedCode
    };

  } catch (error) {
    console.error(`❌ Erro na geração para projeto ${projectId}:`, error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido na geração'
    };
  }
}

// Re-exportar a função principal do grafo
export { invokeGenerationGraph } from './graph';