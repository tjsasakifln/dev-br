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

    const initialState: GenerationState = {
      project_id: projectId,
      prompt: prompt,
      template: template,
      generation_id: generationId,
      generated_code: {},
      agent_logs: [],
      messages: [],
    };

    const stream = generationGraph.stream(initialState);

    for await (const event of stream) {
      // Cada 'event' é um snapshot do estado após a execução de um nó.
      const [nodeName, nodeState] = Object.entries(event)[0];
      console.log(`[Job ${job.id}] Node '${nodeName}' finished. Updating status.`);

      await prisma.generation.update({
        where: { id: generationId },
        data: {
          status: 'IN_PROGRESS',
          logs: { set: nodeState.agent_logs },
          repositoryUrl: nodeState.repository_url,
          // Atualizar outros campos conforme necessário
        },
      });
    }

    const finalState = await stream.finalOutput();
    await prisma.generation.update({
        where: { id: generationId },
        data: {
            status: finalState?.error_message ? 'FAILED' : 'COMPLETED',
            failureReason: finalState?.error_message,
            repositoryUrl: finalState?.repository_url,
        },
    });

    console.log(`Finished processing job ${job.id}`);
  },
  { connection: redis }
);

console.log('Graph worker started.');