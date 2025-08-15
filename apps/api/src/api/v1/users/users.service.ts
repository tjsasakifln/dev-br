import { prisma } from '../../../lib/prisma';

export const userService = {
  createUser: async (email: string, name: string) => {
    const user = await prisma.user.create({
      data: {
        email,
        name,
      },
    });
    return user;
  },
};