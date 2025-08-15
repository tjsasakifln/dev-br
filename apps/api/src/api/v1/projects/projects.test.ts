import supertest from 'supertest';
import app from '../../../index';
import { prisma } from '../../../lib/prisma';
import { User } from '@prisma/client';

describe('Projects API', () => {
  let testUser: User;

  beforeAll(async () => {
    // Limpar tabelas na ordem correta (gerações primeiro, projetos, depois utilizadores)
    await prisma.generation.deleteMany({});
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

  describe('GET /api/v1/projects', () => {
    beforeEach(async () => {
      // Limpar projetos e gerações antes de cada teste para isolamento
      await prisma.generation.deleteMany({});
      await prisma.project.deleteMany({ where: { userId: testUser.id } });
    });

    it('should return a list of projects for a given user', async () => {
      // Criar alguns projetos para o nosso utilizador de teste
      await prisma.project.createMany({
        data: [
          { name: 'Project A', prompt: 'Prompt A', userId: testUser.id },
          { name: 'Project B', prompt: 'Prompt B', userId: testUser.id },
        ],
      });

      const response = await supertest(app).get(`/api/v1/projects?userId=${testUser.id}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      // Depois da limpeza, devem existir exatamente 2 projetos
      expect(response.body.length).toBe(2);
    });
  });

  describe('GET /api/v1/projects/:id', () => {
    beforeEach(async () => {
      // Limpar projetos e gerações antes de cada teste para isolamento
      await prisma.generation.deleteMany({});
      await prisma.project.deleteMany({ where: { userId: testUser.id } });
    });

    it('should return a single project if ID is valid', async () => {
      const newProject = await prisma.project.create({
        data: { name: 'Get One Project', prompt: 'Prompt C', userId: testUser.id },
      });

      const response = await supertest(app).get(`/api/v1/projects/${newProject.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(newProject.id);
      expect(response.body.name).toBe('Get One Project');
    });

    it('should return 404 if project ID does not exist', async () => {
      const nonExistentId = 'clxxxxxxxxxxxxxxxxx';
      const response = await supertest(app).get(`/api/v1/projects/${nonExistentId}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/v1/projects/:id/generate', () => {
    it('should start a generation job and return 202', async () => {
      const project = await prisma.project.create({
        data: {
          name: 'Generation Test Project',
          prompt: 'A simple flask server',
          userId: testUser.id,
        },
      });

      const response = await supertest(app)
        .post(`/api/v1/projects/${project.id}/generate`)
        .send();
      
      // 202 Accepted é o código de status apropriado para iniciar uma tarefa assíncrona
      expect(response.status).toBe(202);
      expect(response.body.message).toBe('Generation process started');
      expect(response.body.generationId).toBeDefined();
    });
  });
});