import { Worker } from 'bullmq';
import { prisma } from '../lib/prisma';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const connection = {
  host: process.env.REDIS_HOST || 'redis',
  port: 6379,
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generationWorker = new Worker('generation-queue', async job => {
  const { generationId } = job.data;
  console.log(`[Worker] Processing generation: ${generationId}`);

  try {
    // 1. Mudar status para 'running'
    await prisma.generation.update({
      where: { id: generationId },
      data: { status: 'running', progress: 10 },
    });

    // 2. Obter o prompt do projeto
    const generation = await prisma.generation.findUnique({
      where: { id: generationId },
      include: { project: true },
    });

    if (!generation) throw new Error('Generation not found');

    // 3. Chamar a API da OpenAI
    await prisma.generation.update({ where: { id: generationId }, data: { progress: 30 } });
    
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an expert full-stack developer. Generate only the code for the requested component.' },
        { role: 'user', content: generation.project.prompt }
      ],
      model: 'gpt-3.5-turbo', // Pode usar 'gpt-4' para melhores resultados
    });
    
    const generatedCode = chatCompletion.choices[0].message.content;

    await prisma.generation.update({ where: { id: generationId }, data: { progress: 80 } });

    // 4. Guardar o resultado e finalizar
    await prisma.generation.update({
      where: { id: generationId },
      data: {
        status: 'completed',
        progress: 100,
        generatedOutput: generatedCode,
        aiModel: 'gpt-3.5-turbo',
      },
    });
    
    console.log(`[Worker] Completed generation: ${generationId}`);
  } catch (error) {
    console.error(`[Worker] Error processing generation ${generationId}:`, error);
    await prisma.generation.update({
      where: { id: generationId },
      data: { status: 'failed', progress: 0 },
    });
  }
}, { connection });

console.log("Generation Worker with OpenAI integration is running...");