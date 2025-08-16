import request from 'supertest';
import express from 'express';
import { getCurrentUser } from '../controllers/user.controller';
import { prisma } from '../lib/prisma';

// Mock do cliente Prisma para isolar o teste do banco de dados
jest.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Create a simple test app without Redis dependencies
const app = express();
app.use(express.json());

// Add mock auth middleware
app.use('/api/v1/users/me', (req, res, next) => {
  (req as any).user = { id: 'user-cuid-123' };
  next();
});

app.get('/api/v1/users/me', getCurrentUser);

describe('GET /api/v1/users/me', () => {
  it('should return the current authenticated user data including credits', async () => {
    const mockUser = {
      id: 'user-cuid-123',
      name: 'Test User',
      email: 'test@example.com',
      credits: 100, // O novo campo que queremos verificar
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const response = await request(app)
      .get('/api/v1/users/me');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      credits: mockUser.credits,
    });

    // Verifica se o serviço foi chamado com o ID de usuário correto do middleware
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-cuid-123' },
      select: {
        id: true,
        name: true,
        email: true,
        credits: true,
      },
    });
  });
});