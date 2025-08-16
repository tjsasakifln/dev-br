import { prisma } from '../lib/prisma';
import { generationQueue } from '../lib/queue';

interface ProjectData {
  name: string;
  prompt: string;
  userId: string;
}

export const projectService = {
  createProject: async (data: ProjectData) => {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        prompt: data.prompt,
        userId: data.userId,
      },
    });
    return project;
  },

  getProjectsByUserId: async (userId: string) => {
    return await prisma.project.findMany({
      where: { userId },
    });
  },

  getProjectById: async (id: string) => {
    return await prisma.project.findUnique({
      where: { id },
    });
  },

  startGenerationForProject: async (projectId: string, userId: string) => {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new Error('Project not found');

    // Exemplo de como carregar um template. A lógica real pode ser mais complexa.
    const template = {
      id: 'react-fastapi',
      name: 'React + FastAPI',
      files: {}, // Na implementação real, carregaria os ficheiros aqui.
    };

    const generation = await prisma.generation.create({
      data: {
        projectId: project.id,
        status: 'QUEUED',
      },
    });

    await generationQueue.add('generate-code', {
      projectId: project.id,
      prompt: project.prompt,
      template,
      generationId: generation.id,
    });

    return generation;
  },

  updateProject: async (id: string, data: Partial<Pick<ProjectData & { 
    status: string; 
    repositoryUrl?: string; 
    userRating?: number; 
    userFeedback?: string | null;
    generatedCode?: any;
    failureReason?: string | null;
    uploadedFile?: string | null;
  }, 'name' | 'prompt' | 'status' | 'repositoryUrl' | 'userRating' | 'userFeedback' | 'generatedCode' | 'failureReason' | 'uploadedFile'>>) => {
    return await prisma.project.update({
      where: { id },
      data,
    });
  },

  getLatestGeneration: async (projectId: string) => {
    return await prisma.generation.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' }, // Ordena por data de criação descendente para obter a mais recente
    });
  },
};