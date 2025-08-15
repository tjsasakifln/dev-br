import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);

  if (err.message === 'Email already in use.') {
    return res.status(409).json({ error: err.message });
  }
  
  res.status(500).json({ error: 'Something went wrong' });
};