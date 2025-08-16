import request from 'supertest';
import app from '../index'; // App exportado como default

// Mock de todos os módulos que podem causar problemas
jest.mock('../lib/redis', () => ({
  getRedisClient: () => ({
    ping: jest.fn().mockResolvedValue('PONG'),
    on: jest.fn(),
  }),
  testRedisConnection: jest.fn().mockResolvedValue(true),
}));

jest.mock('../middleware/rateLimiter', () => ({
  generationRateLimit: (req: any, res: any, next: any) => next(),
}));

jest.mock('../workers/graph.worker', () => ({}));
jest.mock('../workers/generationWorker', () => ({}));

// Mock dos serviços
jest.mock('../services/project.service', () => ({
  projectService: {
    getProjectById: jest.fn(),
  },
}));

jest.mock('../services/github.service', () => ({
  GitHubService: jest.fn(),
}));

const { projectService } = require('../services/project.service');
const { GitHubService } = require('../services/github.service');

describe('POST /api/v1/projects/:id/publish', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 when accessToken is missing', async () => {
    const projectId = 'clx123abc456';

    // Executa a requisição sem accessToken
    const response = await request(app)
      .post(`/api/v1/projects/${projectId}/publish`)
      .set('Authorization', 'Bearer mock-user-token')
      .send({});

    // Esperamos erro 400 porque accessToken é obrigatório
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('GitHub access token is required');
  });

  it('should return 400 when accessToken is missing (with valid project)', async () => {
    const projectId = 'clx123abc456';
    const mockProject = {
      id: projectId,
      name: 'test-project',
      generatedCode: { 'src/index.js': 'console.log("test");' },
    };

    // Configuração dos mocks para projeto válido
    projectService.getProjectById.mockResolvedValue(mockProject);

    // Requisição sem accessToken deve retornar 400
    const response = await request(app)
      .post(`/api/v1/projects/${projectId}/publish`)
      .set('Authorization', 'Bearer mock-user-token')
      .send({});

    // Esperamos erro 400 porque accessToken é obrigatório
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('GitHub access token is required');
  });
});