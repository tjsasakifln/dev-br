import { Worker } from 'bullmq';
import { redis } from '../lib/queue';
import { prisma } from '../lib/prisma';
import { generationGraph } from '../services/generation-engine/graph';
import { GenerationState } from '../services/generation-engine/types';

const worker = new Worker(
  'generation',
  async (job) => {
    console.log(`Processing generation job ${job.id} for project ${job.data.projectId}`);
    const { projectId, prompt, template, generationId } = job.data;

    const initialState = {
      project_id: projectId,
      prompt: prompt,
      template: template,
      generation_id: generationId,
      generated_code: {},
      agent_logs: [],
      messages: [],
    };

    try {
      // Execute o workflow completo e obtenha o resultado final
      const finalState = await generationGraph.invoke(initialState);
      const finalStateTyped = finalState as unknown as GenerationState;

      // Atualizar com estado final
      await prisma.generation.update({
        where: { id: generationId },
        data: {
          status: finalStateTyped?.error_message ? 'FAILED' : 'COMPLETED',
          failureReason: finalStateTyped?.error_message,
          repositoryUrl: finalStateTyped?.repository_url,
          logs: { set: finalStateTyped?.agent_logs || [] },
        },
      });
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
      await prisma.generation.update({
        where: { id: generationId },
        data: {
          status: 'FAILED',
          failureReason: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }


    console.log(`Finished processing job ${job.id}`);
  },
  { connection: redis }
);

console.log('Graph worker started.');