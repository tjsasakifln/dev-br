import supertest from 'supertest';
import app from '../../../index';
import { prisma } from '../../../lib/prisma';

describe('POST /api/v1/users', () => {
  beforeAll(async () => {
    // Limpar a tabela de utilizadores antes de todos os testes
    await prisma.user.deleteMany({});
  });
  
  afterAll(async () => {
    // Desconectar do prisma após todos os testes
    await prisma.$disconnect();
  });

  it('should create a new user and return 201', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
    };

    const response = await supertest(app)
      .post('/api/v1/users')
      .send(userData);
    
    expect(response.status).toBe(201);
    expect(response.body.email).toBe(userData.email);
    expect(response.body.id).toBeDefined();
  });

  it('should return 400 if email is missing', async () => {
     const userData = { name: 'Test User' };
     const response = await supertest(app)
       .post('/api/v1/users')
       .send(userData);
     expect(response.status).toBe(400);
  });
});