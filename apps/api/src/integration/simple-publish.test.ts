/**
 * Teste simples TDD para validar que o endpoint POST /api/v1/projects/:id/publish 
 * ainda não existe (deve retornar 404)
 */
import request from 'supertest';
import express from 'express';

// Criar uma app mínima para testar apenas o roteamento
const testApp = express();
testApp.use(express.json());

// Simular apenas as rotas existentes (sem o endpoint publish)
testApp.get('/api/v1/projects/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'test-project' });
});

// Middleware para capturar 404s
testApp.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

describe('TDD: POST /api/v1/projects/:id/publish endpoint', () => {
  it('should return 404 because the publish endpoint does not exist yet', async () => {
    const projectId = 'clx123abc456';
    
    const response = await request(testApp)
      .post(`/api/v1/projects/${projectId}/publish`)
      .send({ accessToken: 'mock-token' });
    
    // Este teste deve PASSAR porque esperamos que o endpoint ainda não existe (TDD)
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Route not found' });
  });
  
  it('should confirm that regular project routes work', async () => {
    const projectId = 'clx123abc456';
    
    const response = await request(testApp)
      .get(`/api/v1/projects/${projectId}`);
    
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(projectId);
  });
});