import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { prisma } from '../lib/prisma';

// @desc    Get current user
// @route   GET /api/v1/users/me
// @access  Private
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  // req.user é anexado pelo middleware 'protect'
  const userId = (req as any).user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      credits: true, // Incluindo o novo campo
    },
  });

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});