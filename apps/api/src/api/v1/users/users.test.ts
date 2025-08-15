// apps/api/src/api/v1/users/users.test.ts
import supertest from 'supertest';
import express from 'express';

// Criamos uma instância mínima da app para testar a rota isoladamente
const app = express();
app.use(express.json());

// Mock da rota (que ainda não existe na app real)
// Vamos adicionar a rota real aqui mais tarde
// app.use('/api/v1/users', ...);

describe('POST /api/v1/users', () => {
  it('should create a new user and return 201', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
    };

    const response = await supertest(app)
      .post('/api/v1/users')
      .send(userData);
    
    // Este teste vai falhar com 404, o que é o esperado por agora.
    expect(response.status).toBe(201);
    expect(response.body.email).toBe(userData.email);
  });
});