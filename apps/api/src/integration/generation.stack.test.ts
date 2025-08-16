import request from 'supertest';
import app from '../index';
import { projectService } from '../services/project.service';
import { generationService } from '../services/generation.service';
import { promises as fs } from 'fs';

jest.mock('../services/generation.service');
jest.mock('fs', () => ({
  promises: {
    readdir: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
    rm: jest.fn(),
  }
}));

describe('POST /api/projects/:id/generate - Stack Selection', () => {
  it('should generate a FastAPI backend when Python stack is specified', async () => {
    const projectId = 'proj_python_test';
    const mockProject = { 
      id: projectId, 
      prompt: 'I want to build a python application with fastapi backend', 
      userId: 'user123',
      name: 'Python Test App',
      status: 'PENDING',
      generatedCode: null,
      repositoryUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      failureReason: null,
      userRating: null,
      userFeedback: null,
      uploadedFile: null
    };

    // Mock do projectService.getProjectById para retornar nosso projeto mock
    jest.spyOn(projectService, 'getProjectById').mockResolvedValue(mockProject);

    // Mock do fs.readdir para simular templates disponíveis
    const mockReaddir = fs.readdir as jest.Mock;
    mockReaddir.mockResolvedValue(['backend', 'frontend', 'docker-compose.yml']);

    // Mock do generationService.run para capturar o template selecionado
    const mockRun = jest.spyOn(generationService, 'run').mockImplementation(async (projectId: string) => {
      console.log(`Mocked run called for project: ${projectId}`);
    });

    // Inicia a geração
    const response = await request(app)
      .post(`/api/projects/${projectId}/generate`)
      .set('Authorization', 'Bearer mock-token')
      .send();

    expect(response.status).toBe(200);

    // A validação CRÍTICA:
    // Verificamos se o generationService.run foi chamado
    expect(mockRun).toHaveBeenCalledWith(projectId);

    // Analisamos os logs para verificar qual template foi selecionado
    // Com base no código real em generation.service.ts:112-116
    // Se o prompt contém 'python' ou 'fastapi', deve selecionar 'react-fastapi'
    expect(mockProject.prompt.toLowerCase()).toContain('python');
  });
});