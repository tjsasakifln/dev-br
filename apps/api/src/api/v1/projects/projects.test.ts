import supertest from 'supertest';
import app from '../../../index';
import { prisma } from '../../../lib/prisma';
import { User } from '@prisma/client';

describe('Projects API', () => {
  let testUser: User;

  beforeAll(async () => {
    // Limpar tabelas
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({});
    
    // Criar um utilizador para os testes
    testUser = await prisma.user.create({
      data: {
        email: 'projectuser@example.com',
        name: 'Project User',
      },
    });
  });
  
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/v1/projects', () => {
    it('should create a new project for a user', async () => {
      const projectData = {
        name: 'My First AI App',
        prompt: 'A to-do list application with user authentication',
        userId: testUser.id,
      };

      const response = await supertest(app)
        .post('/api/v1/projects')
        .send(projectData);
      
      // Este teste vai falhar com 404, o que é o esperado
      expect(response.status).toBe(201);
      expect(response.body.name).toBe(projectData.name);
      expect(response.body.userId).toBe(testUser.id);
    });
  });
});