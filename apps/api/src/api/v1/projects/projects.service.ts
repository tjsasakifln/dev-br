import { prisma } from '../../../lib/prisma';

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

  startGenerationForProject: async (projectId: string) => {
    // Por agora, apenas criamos o registo da Geração.
    // Mais tarde, isto também irá despoletar uma tarefa em segundo plano.
    const generation = await prisma.generation.create({
      data: {
        projectId: projectId,
        status: 'queued', // O status inicial é 'queued' (na fila)
      },
    });
    return generation;
  },
};