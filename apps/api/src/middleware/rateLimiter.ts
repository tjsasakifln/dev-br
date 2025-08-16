import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { Request, Response } from 'express';
import { getRedisClient } from '../lib/redis';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const generationRateLimit = rateLimit({
  store: new RedisStore({
    client: getRedisClient(),
    prefix: 'rate_limit:generation:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // máximo 5 requisições por hora
  message: {
    message: "Você excedeu o limite de 5 gerações por hora."
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: AuthenticatedRequest): string => {
    // A chave é baseada no ID do usuário autenticado
    // Se não houver usuário autenticado, usa o IP como fallback
    if (req.user?.id) {
      return `user:${req.user.id}`;
    }
    // Fallback para IP se não houver usuário autenticado
    return `ip:${req.ip || req.connection.remoteAddress || 'unknown'}`;
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      message: "Você excedeu o limite de 5 gerações por hora."
    });
  },
  skip: () => {
    // Não pula nenhuma requisição - aplica rate limiting para todos
    return false;
  }
});