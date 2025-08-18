import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { prisma } from '../lib/prisma';

export const userService = {
  createUser: async (email: string, name: string) => {
    try {
      const user = await prisma.user.create({
        data: {
          email,
          name,
        },
      });
      return user;
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError) {
        // Código de erro para violação de constraint única
        if (error.code === 'P2002') {
          throw new Error('Email already in use.');
        }
      }
      throw error; // Re-lança outros erros
    }
  },

  getUsers: async () => {
    return await prisma.user.findMany();
  },

  getUserById: async (id: string) => {
    return await prisma.user.findUnique({
      where: { id },
    });
  },
};