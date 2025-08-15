import supertest from 'supertest';
import app from '../../../index';
import { prisma } from '../../../lib/prisma';

describe('POST /api/v1/users', () => {
  beforeAll(async () => {
    // Limpar as tabelas na ordem correta (gerações primeiro, projetos, depois utilizadores)
    await prisma.generation.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({});
  });
  
  afterAll(async () => {
    // Desconectar do prisma após todos os testes
    await prisma.$disconnect();
  });

  it('should create a new user and return 201', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
    };

    const response = await supertest(app)
      .post('/api/v1/users')
      .send(userData);
    
    expect(response.status).toBe(201);
    expect(response.body.email).toBe(userData.email);
    expect(response.body.id).toBeDefined();
  });

  it('should return 400 if email is missing', async () => {
     const userData = { name: 'Test User' };
     const response = await supertest(app)
       .post('/api/v1/users')
       .send(userData);
     expect(response.status).toBe(400);
  });

  it('should return 409 if email already exists', async () => {
    const userData = { email: 'conflict@example.com', name: 'Conflict User' };
    // Cria o utilizador na primeira vez
    await supertest(app).post('/api/v1/users').send(userData);
    
    // Tenta criar o mesmo utilizador novamente
    const response = await supertest(app)
      .post('/api/v1/users')
      .send(userData);

    // Espera um erro de conflito
    expect(response.status).toBe(409);
  });
});

describe('GET /api/v1/users', () => {
  beforeEach(async () => {
    // Limpar as tabelas na ordem correta (gerações primeiro, projetos, depois utilizadores)
    await prisma.generation.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({});
  });

  it('should return a list of all users', async () => {
    // Criar alguns utilizadores para garantir que a base de dados não está vazia
    await prisma.user.createMany({
      data: [
        { email: 'user1@example.com', name: 'User One' },
        { email: 'user2@example.com', name: 'User Two' },
      ],
    });

    const response = await supertest(app).get('/api/v1/users');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
  });
});

describe('GET /api/v1/users/:id', () => {
  beforeEach(async () => {
    // Limpar as tabelas na ordem correta (gerações primeiro, projetos, depois utilizadores)
    await prisma.generation.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({});
  });

  it('should return a single user if ID is valid', async () => {
    const newUser = await prisma.user.create({
      data: { email: 'getone@example.com', name: 'Get One User' },
    });

    const response = await supertest(app).get(`/api/v1/users/${newUser.id}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(newUser.id);
    expect(response.body.email).toBe(newUser.email);
  });

  it('should return 404 if user ID does not exist', async () => {
    const nonExistentId = 'clxxxxxxxxxxxxxxxxx'; // Formato de CUID inválido mas válido para o teste
    const response = await supertest(app).get(`/api/v1/users/${nonExistentId}`);

    expect(response.status).toBe(404);
  });
});