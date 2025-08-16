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
};