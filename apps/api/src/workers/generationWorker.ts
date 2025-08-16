import { Worker } from 'bullmq';
import { getRedisClient } from '../lib/redis';
import { prisma } from '../lib/prisma';
import { invokeGenerationForProject } from '../services/generation-engine';
import { sendGenerationSuccessEmail, sendGenerationFailedEmail } from '../services/email.service';


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
        const updatedProject = await prisma.project.update({
          where: { id: projectId },
          data: { 
            status: 'COMPLETED',
            generatedCode: result.generatedCode || {}
          },
          include: {
            user: true // Incluir dados do usuário para envio de email
          }
        });
        
        console.log(`✅ Job ${job.id} concluído com sucesso para projeto ${projectId}`);
        
        // Enviar email de sucesso
        if (updatedProject.user.email) {
          try {
            await sendGenerationSuccessEmail(updatedProject.user.email, {
              projectName: updatedProject.name,
              repositoryUrl: updatedProject.repositoryUrl || '#'
            });
            console.log(`📧 Email de sucesso enviado para ${updatedProject.user.email}`);
          } catch (emailError) {
            console.error(`❌ Erro ao enviar email de sucesso:`, emailError);
          }
        }
      } else {
        // Atualizar para FAILED
        const updatedProject = await prisma.project.update({
          where: { id: projectId },
          data: { 
            status: 'FAILED',
            generatedCode: { error: result.error },
            failureReason: result.error
          },
          include: {
            user: true // Incluir dados do usuário para envio de email
          }
        });
        
        console.log(`❌ Job ${job.id} falhou para projeto ${projectId}: ${result.error}`);
        
        // Enviar email de falha
        if (updatedProject.user.email) {
          try {
            await sendGenerationFailedEmail(updatedProject.user.email, {
              projectName: updatedProject.name,
              failureReason: result.error || 'Erro desconhecido'
            });
            console.log(`📧 Email de falha enviado para ${updatedProject.user.email}`);
          } catch (emailError) {
            console.error(`❌ Erro ao enviar email de falha:`, emailError);
          }
        }
      }
      
    } catch (error) {
      console.error(`💥 Erro no processamento do job ${job.id}:`, error);
      
      // Atualizar para FAILED em caso de erro inesperado
      try {
        const failedProject = await prisma.project.update({
          where: { id: projectId },
          data: { 
            status: 'FAILED',
            generatedCode: { 
              error: error instanceof Error ? error.message : 'Unknown error'
            },
            failureReason: error instanceof Error ? error.message : 'Unknown error'
          },
          include: {
            user: true // Incluir dados do usuário para envio de email
          }
        });
        
        // Enviar email de falha para erro inesperado
        if (failedProject.user.email) {
          try {
            await sendGenerationFailedEmail(failedProject.user.email, {
              projectName: failedProject.name,
              failureReason: error instanceof Error ? error.message : 'Erro inesperado durante o processamento'
            });
            console.log(`📧 Email de falha enviado para ${failedProject.user.email}`);
          } catch (emailError) {
            console.error(`❌ Erro ao enviar email de falha:`, emailError);
          }
        }
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