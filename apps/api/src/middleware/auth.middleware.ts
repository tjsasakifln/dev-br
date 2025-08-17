import { Request, Response, NextFunction } from 'express';
import { getToken } from 'next-auth/jwt';
import { asyncHandler } from './asyncHandler';
import { prisma } from '../lib/prisma';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

// @desc    Protect routes - requires authentication
export const protect = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token;
  
  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token using NextAuth.js JWT verification
      const decoded = await getToken({ 
        req: {
          ...req,
          headers: {
            ...req.headers,
            cookie: `next-auth.session-token=${token}` // Format token for NextAuth
          }
        } as any,
        secret: process.env.NEXTAUTH_SECRET 
      });
      
      if (!decoded || !decoded.sub) {
        return res.status(401).json({ 
          error: 'Not authorized, token invalid' 
        });
      }
      
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        select: {
          id: true,
          email: true,
          name: true
        }
      });
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Not authorized, user not found' 
        });
      }
      
      // Attach user to request object
      req.user = {
        id: user.id,
        email: user.email || '',
        name: user.name || ''
      };
      next();
      
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ 
        error: 'Not authorized, token verification failed' 
      });
    }
  }
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Not authorized, no token provided' 
    });
  }
});