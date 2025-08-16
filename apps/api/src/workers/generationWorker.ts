import { Worker } from 'bullmq';
import { getRedisClient } from '../lib/redis';
import { prisma } from '../lib/prisma';

// Função principal para processar jobs de geração
async function processGenerationJob(job: any) {
  // Extrair projectId e userId do job.data
  const { projectId, userId } = job.data;
  
  console.log(`Processing generation job for project ${projectId}...`);
  
  try {
    // Usar o cliente Prisma para encontrar o projeto no banco de dados
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });
    
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }
    
    // Atualizar o status do projeto de QUEUED para GENERATING
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'GENERATING' }
    });
    
    // Simular o processo de geração com logs e delays
    console.log(`[${projectId}] Step 1: Analyzing user prompt and requirements...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`[${projectId}] Step 2: Selecting appropriate template (e.g., react-express)...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`[${projectId}] Step 3: Orchestrating AI agents for code generation...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`[${projectId}] Step 4: Generating backend code...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`[${projectId}] Step 5: Generating frontend code...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`[${projectId}] Step 6: Assembling Docker configuration...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Finalizar o job - atualizar status para COMPLETED
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'COMPLETED' }
    });
    
    console.log(`Successfully completed generation for project ${projectId}.`);
    
  } catch (error) {
    // Tratamento de erros
    console.error(`Error processing generation job for project ${projectId}:`, error);
    
    // Atualizar status do projeto para FAILED e salvar mensagem de erro
    await prisma.project.update({
      where: { id: projectId },
      data: { 
        status: 'FAILED',
        failureReason: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    
    // Re-lançar o erro para que a fila marque o job como falho
    throw error;
  }
}

export const generationWorker = new Worker(
  'generation',
  async (job) => {
    // Verificar se é o tipo de job correto
    if (job.name === 'start-generation') {
      // Chamar a função de processamento principal
      await processGenerationJob(job);
    } else {
      console.warn(`Unknown job type: ${job.name}`);
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