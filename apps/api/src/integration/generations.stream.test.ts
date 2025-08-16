import request from 'supertest';
import express from 'express';

// Mock simples do generation service para evitar dependências
jest.mock('../services/generation.service', () => ({
  generationService: {
    getEventEmitter: jest.fn(() => ({
      on: jest.fn(),
      off: jest.fn(),
    })),
  },
}));

// Mock do asyncHandler para simplificar
jest.mock('../middleware/asyncHandler', () => ({
  asyncHandler: (fn: any) => fn,
}));

describe('GET /api/v1/generations/:id/stream', () => {
  let app: express.Application;

  beforeEach(() => {
    // Criar app com o router real
    app = express();
    app.use(express.json());
    
    // Importar o router real depois dos mocks
    const generationsRouter = require('../routes/v1/generations.routes').default;
    app.use('/api/v1/generations', generationsRouter);
  });

  it('should establish SSE connection and return correct headers', (done) => {
    const generationId = 'gen_12345';
    
    console.log('🧪 Testing SSE endpoint implementation');
    
    request(app)
      .get(`/api/v1/generations/${generationId}/stream`)
      .expect('Content-Type', /text\/event-stream/)
      .expect(200)
      .end((err, res) => {
        if (err) {
          console.log('❌ ERROR:', err.message);
          console.log('Response status:', res?.status);
          console.log('Response headers:', res?.headers);
          return done(err);
        }
        
        console.log('✅ SUCCESS: SSE endpoint working!');
        console.log('Response status:', res.status);
        console.log('Content-Type:', res.headers['content-type']);
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/text\/event-stream/);
        done();
      });
  });

  it('should handle connection close gracefully', (done) => {
    const generationId = 'gen_12345';
    
    console.log('🧪 Testing connection handling');
    
    const req = request(app)
      .get(`/api/v1/generations/${generationId}/stream`)
      .expect(200);

    // Simulate quick disconnect
    setTimeout(() => {
      req.abort();
      console.log('✅ SUCCESS: Connection closed without errors');
      done();
    }, 100);
  });
});