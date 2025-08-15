import supertest from 'supertest';
import app from '../../../index';
import { prisma } from '../../../lib/prisma';
import { User, Project, Generation } from '@prisma/client';

describe('Generations API', () => {
  let testUser: User;
  let testProject: Project;
  let testGeneration: Generation;

  beforeAll(async () => {
    // Limpar tabelas na ordem correta
    await prisma.generation.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({});
    
    // Criar dados de teste
    testUser = await prisma.user.create({
      data: { email: 'genuser@example.com', name: 'Gen User' },
    });
    testProject = await prisma.project.create({
      data: { name: 'Gen Project', prompt: 'Prompt', userId: testUser.id },
    });
    testGeneration = await prisma.generation.create({
      data: { projectId: testProject.id, status: 'running', progress: 50 },
    });
  });
  
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/v1/generations/:id', () => {
    it('should return the status of a specific generation', async () => {
      const response = await supertest(app)
        .get(`/api/v1/generations/${testGeneration.id}`);
      
      // Este teste vai falhar com 404
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testGeneration.id);
      expect(response.body.status).toBe('running');
      expect(response.body.progress).toBe(50);
    });

    it('should return 404 for a non-existent generation ID', async () => {
      const nonExistentId = 'clxxxxxxxxxxxxxxxxx';
      const response = await supertest(app)
        .get(`/api/v1/generations/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });
});