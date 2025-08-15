import { Worker } from 'bullmq';
import OpenAI from 'openai';
import { prisma } from '../lib/prisma';
import { redisConnection } from '../lib/queue';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const processProject = async (projectId: string) => {
  console.log(`[Worker] Iniciando geração para projeto: ${projectId}`);
  
  try {
    // Buscar o projeto completo do banco de dados
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error(`Projeto ${projectId} não encontrado`);
    }

    // Atualizar status para IN_PROGRESS
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'IN_PROGRESS' },
    });
    
    console.log(`[Worker] Gerando código com IA para: "${project.prompt}"`);
    
    // Construir o prompt para a IA
    const systemPrompt = `Você é um especialista em desenvolvimento full-stack. Sua tarefa é gerar o código para um componente React (TSX) com base na descrição do usuário. O componente deve usar Tailwind CSS para estilização e ser contido em um único bloco de código. 

Regras importantes:
1. Retorne APENAS o código TSX, sem explicações
2. Use TypeScript e Tailwind CSS
3. O componente deve ser funcional e completo
4. Inclua imports necessários (React, etc.)
5. Use nomes de componentes em PascalCase`;

    // Chamar a API da OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: project.prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const generatedCode = response.choices[0]?.message?.content;
    
    if (!generatedCode) {
      throw new Error('IA não retornou código válido');
    }
    
    // Salvar o resultado no banco de dados
    await prisma.project.update({
      where: { id: projectId },
      data: { 
        status: 'COMPLETED',
        generatedCode: generatedCode 
      },
    });
    
    console.log(`[Worker] Geração concluída para projeto: ${projectId}`);
  } catch (error) {
    console.error(`[Worker] Erro na geração do projeto ${projectId}:`, error);
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'FAILED' },
    });
    throw error;
  }
};

export const generationWorker = new Worker('generationQueue', async (job) => {
  const { projectId } = job.data;
  await processProject(projectId);
}, { 
  connection: redisConnection,
});

console.log("Generation Worker is running...");