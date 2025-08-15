import { prisma } from '../../../lib/prisma';

export const generationService = {
  getGenerationById: async (id: string) => {
    return await prisma.generation.findUnique({
      where: { id },
    });
  },
};