import { promises as fs } from 'fs';
import { prisma } from '../lib/prisma';

export const generationService = {
  getGenerationById: async (id: string) => {
    return await prisma.generation.findUnique({
      where: { id },
    });
  },

  getGenerationStatus: async (id: string) => {
    const generation = await prisma.generation.findUnique({
      where: { id },
      select: {
        status: true,
        progress: true,
      },
    });
    return generation;
  },

  getGenerationLogs: async (id: string) => {
    const generation = await prisma.generation.findUnique({
      where: { id },
      select: {
        logs: true,
      },
    });
    return generation;
  },

  run: async (projectId: string): Promise<void> => {
    // Buscar o projeto no banco de dados
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    console.log(`[${projectId}] Generation engine started. Analyzing prompt: "${project.prompt}"`);

    // Lógica de seleção de template baseada no prompt
    let selectedTemplatePath: string;
    const promptLower = project.prompt.toLowerCase();

    if (promptLower.includes('python') || promptLower.includes('fastapi')) {
      selectedTemplatePath = 'templates/react-fastapi';
    } else {
      selectedTemplatePath = 'templates/react-express';
    }

    console.log(`[${projectId}] Template selected based on prompt: ${selectedTemplatePath}`);

    // Ler os arquivos do template selecionado
    try {
      const fileList = await fs.readdir(selectedTemplatePath);
      console.log(`[${projectId}] Files found in template: ${fileList.join(', ')}`);
    } catch (error) {
      console.warn(`[${projectId}] Could not read template directory: ${selectedTemplatePath}`);
      console.log(`[${projectId}] Files found in template: (directory not accessible)`);
    }

    console.log(`[${projectId}] Next step: Code generation for each file. Engine finished for now.`);
  },
};