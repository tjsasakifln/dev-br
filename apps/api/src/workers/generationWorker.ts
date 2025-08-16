import { Worker } from 'bullmq';
import { getRedisClient } from '../lib/redis';
import { prisma } from '../lib/prisma';
import { invokeGenerationForProject } from '../services/generation-engine';


export const generationWorker = new Worker(
  'generation',
  async (job) => {
    const { projectId } = job.data;
    
    console.log(`🚀 Processando job ${job.id} para projeto ${projectId}`);
    
    try {
      // Atualizar status para IN_PROGRESS
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'IN_PROGRESS' },
      });
      
      // Chamar o motor de geração LangGraph
      const result = await invokeGenerationForProject(projectId);
      
      if (result.success) {
        // Atualizar para COMPLETED
        await prisma.project.update({
          where: { id: projectId },
          data: { 
            status: 'COMPLETED',
            generatedCode: result.generatedCode || {}
          },
        });
        
        console.log(`✅ Job ${job.id} concluído com sucesso para projeto ${projectId}`);
      } else {
        // Atualizar para FAILED
        await prisma.project.update({
          where: { id: projectId },
          data: { 
            status: 'FAILED',
            generatedCode: { error: result.error }
          },
        });
        
        console.log(`❌ Job ${job.id} falhou para projeto ${projectId}: ${result.error}`);
      }
      
    } catch (error) {
      console.error(`💥 Erro no processamento do job ${job.id}:`, error);
      
      // Atualizar para FAILED em caso de erro inesperado
      try {
        await prisma.project.update({
          where: { id: projectId },
          data: { 
            status: 'FAILED',
            generatedCode: { 
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          },
        });
      } catch (dbError) {
        console.error(`💥 Erro ao atualizar status no banco:`, dbError);
      }
      
      throw error;
    }
  },
  { 
    connection: getRedisClient(),
    concurrency: 5 // Processar até 5 jobs simultaneamente
  }
);

generationWorker.on('completed', (job) => {
  console.log(`🎉 Job ${job.id} completed`);
});

generationWorker.on('failed', (job, err) => {
  console.log(`💀 Job ${job?.id} failed with error:`, err.message);
});

console.log('🔧 Generation Worker iniciado e aguardando jobs...');