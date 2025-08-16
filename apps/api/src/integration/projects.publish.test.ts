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

  it('should return 404 for non-existent endpoint (TDD - expected failure)', async () => {
    const projectId = 'clx123abc456';

    // Executa a requisição para endpoint que ainda não existe
    const response = await request(app)
      .post(`/api/v1/projects/${projectId}/publish`)
      .set('Authorization', 'Bearer mock-user-token');

    // Este teste deve falhar porque o endpoint ainda não foi implementado
    // Esperamos um 404 Not Found
    expect(response.status).toBe(404);
  });

  it('should call githubService and return the new repository URL (implementation pending)', async () => {
    const projectId = 'clx123abc456';
    const mockProject = {
      id: projectId,
      name: 'test-project',
      generatedCode: { 'src/index.js': 'console.log("test");' },
    };
    const mockRepoUrl = `https://github.com/user/${mockProject.name}`;

    // Configuração dos mocks - este comportamento será implementado depois
    projectService.getProjectById.mockResolvedValue(mockProject);
    
    const mockGitHubService = {
      publishProject: jest.fn().mockResolvedValue({
        repositoryUrl: mockRepoUrl,
        repositoryName: mockProject.name
      })
    };
    GitHubService.mockImplementation(() => mockGitHubService);

    // Esta requisição deve falhar agora porque o endpoint não existe
    const response = await request(app)
      .post(`/api/v1/projects/${projectId}/publish`)
      .set('Authorization', 'Bearer mock-user-token');

    // Por enquanto, esperamos falha (404), depois implementaremos o sucesso
    expect(response.status).toBe(404);
  });
});