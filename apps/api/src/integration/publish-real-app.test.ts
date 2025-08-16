/**
 * Teste do endpoint POST /api/v1/projects/:id/publish usando a app real
 */
import request from 'supertest';
import app from '../index';

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

// Mock de todo o diretório services para evitar problemas de importação
jest.mock('../services/generation.service', () => ({}));
jest.mock('../services/email.service', () => ({}));
jest.mock('../services/user.service', () => ({}));

// Mock dos serviços específicos
jest.mock('../services/project.service', () => ({
  projectService: {
    getProjectById: jest.fn(),
    updateProject: jest.fn(),
  },
}));

jest.mock('../services/github.service', () => ({
  githubService: {
    publishProject: jest.fn(),
  },
}));

const { projectService } = require('../services/project.service');
const { githubService } = require('../services/github.service');

describe('POST /api/v1/projects/:id/publish - Real App Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully publish a completed project', async () => {
    const projectId = 'clx123abc456';
    const mockProject = {
      id: projectId,
      name: 'test-project',
      status: 'COMPLETED',
      generatedCode: { 'src/index.js': 'console.log("test");' },
      repositoryUrl: null,
    };
    const mockResult = {
      repositoryUrl: 'https://github.com/user/test-project',
      repositoryName: 'test-project'
    };

    // Configuração dos mocks
    projectService.getProjectById.mockResolvedValue(mockProject);
    projectService.updateProject.mockResolvedValue({
      ...mockProject,
      repositoryUrl: mockResult.repositoryUrl
    });
    githubService.publishProject.mockResolvedValue(mockResult);

    // Executa a requisição
    const response = await request(app)
      .post(`/api/v1/projects/${projectId}/publish`)
      .send({ accessToken: 'mock-github-token' });

    // Validações
    expect(response.status).toBe(200);
    expect(response.body.repositoryUrl).toBe(mockResult.repositoryUrl);
    expect(response.body.repositoryName).toBe(mockResult.repositoryName);

    // Verifica se os serviços foram chamados corretamente
    expect(projectService.getProjectById).toHaveBeenCalledWith(projectId);
    expect(githubService.publishProject).toHaveBeenCalledWith({
      accessToken: 'mock-github-token',
      projectName: 'test-project',
      generatedCode: mockProject.generatedCode
    });
    expect(projectService.updateProject).toHaveBeenCalledWith(projectId, {
      repositoryUrl: mockResult.repositoryUrl
    });
  });

  it('should return 404 if project not found', async () => {
    const projectId = 'non-existent-id';

    projectService.getProjectById.mockResolvedValue(null);

    const response = await request(app)
      .post(`/api/v1/projects/${projectId}/publish`)
      .send({ accessToken: 'mock-github-token' });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Project not found');
  });

  it('should return 400 if no access token provided', async () => {
    const projectId = 'clx123abc456';

    const response = await request(app)
      .post(`/api/v1/projects/${projectId}/publish`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('GitHub access token is required');
  });

  it('should return 400 if project is not completed', async () => {
    const projectId = 'clx123abc456';
    const mockProject = {
      id: projectId,
      name: 'test-project',
      status: 'IN_PROGRESS',
      generatedCode: null,
      repositoryUrl: null,
    };

    projectService.getProjectById.mockResolvedValue(mockProject);

    const response = await request(app)
      .post(`/api/v1/projects/${projectId}/publish`)
      .send({ accessToken: 'mock-github-token' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Project must be completed before publishing');
  });

  it('should return 400 if project already published', async () => {
    const projectId = 'clx123abc456';
    const mockProject = {
      id: projectId,
      name: 'test-project',
      status: 'COMPLETED',
      generatedCode: { 'src/index.js': 'console.log("test");' },
      repositoryUrl: 'https://github.com/user/existing-repo',
    };

    projectService.getProjectById.mockResolvedValue(mockProject);

    const response = await request(app)
      .post(`/api/v1/projects/${projectId}/publish`)
      .send({ accessToken: 'mock-github-token' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Project has already been published');
  });

  it('should return 400 if no generated code found', async () => {
    const projectId = 'clx123abc456';
    const mockProject = {
      id: projectId,
      name: 'test-project',
      status: 'COMPLETED',
      generatedCode: null,
      repositoryUrl: null,
    };

    projectService.getProjectById.mockResolvedValue(mockProject);

    const response = await request(app)
      .post(`/api/v1/projects/${projectId}/publish`)
      .send({ accessToken: 'mock-github-token' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('No generated code found for this project');
  });
});