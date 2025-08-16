import { Worker } from 'bullmq';
import { redis, pubsub } from '../lib/queue';
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
      // Execute o workflow com streaming para publicar updates em tempo real
      const stream = await generationGraph.stream(initialState as any);
      const channel = `generation-updates:${generationId}`;

      for await (const event of stream as any) {
        console.log(`Processing event:`, event);
        
        // Obter o estado atualizado do evento
        const nodeState = Object.values(event)[0];
        const state = nodeState as any;
        
        // Publicar o código gerado atualizado no canal Redis
        if (state.generated_code && Object.keys(state.generated_code).length > 0) {
          await pubsub.publish(channel, JSON.stringify(state.generated_code));
        }
      }

      // Obter o resultado final após o streaming
      const finalOutput = await generationGraph.invoke(initialState);
      const finalStateTyped = finalOutput as unknown as GenerationState;

      // Publicar sinal de fim de stream
      const finalChannel = `generation-updates:${generationId}`;
      await pubsub.publish(finalChannel, JSON.stringify({ __end_of_stream__: true }));

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
      
      // Publicar erro no canal
      const errorChannel = `generation-updates:${generationId}`;
      await pubsub.publish(errorChannel, JSON.stringify({ 
        __error__: true, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }));

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