import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from './asyncHandler';

// @desc    Protect routes - requires authentication
export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // For now, this is a simple mock implementation
  // In a real application, this would verify JWT tokens
  
  // Mock user for testing purposes
  (req as any).user = { id: 'user-cuid-123' };
  
  next();
});