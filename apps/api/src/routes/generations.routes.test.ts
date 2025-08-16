import request from 'supertest';
import express from 'express';
import { prisma } from '../lib/prisma';
import { User, Project, Generation } from '@prisma/client';

// Mock do Redis para evitar problemas de configuração nos testes
jest.mock('../lib/queue', () => ({
  pubsub: {
    duplicate: jest.fn().mockReturnValue({
      connect: jest.fn(),
      subscribe: jest.fn(),
      on: jest.fn(),
      quit: jest.fn(),
      unsubscribe: jest.fn(),
    }),
  },
}));

import generationsRouter from './generations.routes';

// Setup do app de teste
const app = express();
app.use(express.json());
app.use('/api/v1/generations', generationsRouter);

describe('Generations Routes', () => {
  let testUser: User;
  let testProject: Project;
  let testGeneration: Generation;

  beforeAll(async () => {
    // Limpa a base de dados antes dos testes
    await prisma.generation.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    // Cria dados de teste
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    });

    testProject = await prisma.project.create({
      data: {
        name: 'Test Project',
        prompt: 'Create a simple todo app',
        userId: testUser.id,
      },
    });

    testGeneration = await prisma.generation.create({
      data: {
        status: 'IN_PROGRESS',
        progress: 50,
        logs: ['Iniciando geração...', 'Analisando prompt...'],
        projectId: testProject.id,
        aiModel: 'gpt-4',
        tokensUsed: 150,
      },
    });
  });

  afterAll(async () => {
    // Limpa a base de dados após os testes
    await prisma.generation.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('GET /api/v1/generations/:id/status', () => {
    it('should return generation status and progress when generation exists', async () => {
      const response = await request(app)
        .get(`/api/v1/generations/${testGeneration.id}/status`)
        .expect(200);

      expect(response.body).toEqual({
        status: 'IN_PROGRESS',
        progress: 50,
      });
    });

    it('should return 404 when generation does not exist', async () => {
      const nonExistentId = 'non-existent-id';
      
      const response = await request(app)
        .get(`/api/v1/generations/${nonExistentId}/status`)
        .expect(404);

      expect(response.body).toEqual({
        error: 'Generation not found',
      });
    });
  });

  describe('GET /api/v1/generations/:id/logs', () => {
    it('should return generation logs when generation exists', async () => {
      const response = await request(app)
        .get(`/api/v1/generations/${testGeneration.id}/logs`)
        .expect(200);

      expect(response.body).toEqual({
        logs: ['Iniciando geração...', 'Analisando prompt...'],
      });
    });

    it('should return 404 when generation does not exist', async () => {
      const nonExistentId = 'non-existent-id';
      
      const response = await request(app)
        .get(`/api/v1/generations/${nonExistentId}/logs`)
        .expect(404);

      expect(response.body).toEqual({
        error: 'Generation not found',
      });
    });

    it('should return empty logs array when generation has no logs', async () => {
      // Cria uma geração sem logs
      const generationWithoutLogs = await prisma.generation.create({
        data: {
          status: 'QUEUED',
          progress: 0,
          projectId: testProject.id,
        },
      });

      const response = await request(app)
        .get(`/api/v1/generations/${generationWithoutLogs.id}/logs`)
        .expect(200);

      expect(response.body).toEqual({
        logs: [],
      });

      // Limpa a geração criada para este teste
      await prisma.generation.delete({
        where: { id: generationWithoutLogs.id },
      });
    });
  });
});