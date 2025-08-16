import request from 'supertest';
import app from '../index';
import { generationService } from '../services/generation.service';
import EventEmitter from 'events';

jest.mock('../services/generation.service');

describe('GET /api/v1/generations/:id/stream', () => {
  it('should receive SSE events in the response body', (done) => {
    const generationId = 'gen_12345';
    const mockEmitter = new EventEmitter();
    (generationService.getEventEmitter as jest.Mock).mockReturnValue(mockEmitter);

    const agent = request(app).get(`/api/v1/generations/${generationId}/stream`);

    agent.expect('Content-Type', /text\/event-stream/).expect(200);

    // Emitimos os eventos DEPOIS que o request foi feito
    setTimeout(() => {
      mockEmitter.emit('progress', { status: 'ANALYZING' });
      mockEmitter.emit('progress', { status: 'DONE' }); // Um evento para finalizar
    }, 100);

    agent.end((err, res) => {
      if (err) return done(err);

      // Verificamos o corpo da resposta completa
      expect(res.text).toContain('data: {"status":"ANALYZING"}');
      expect(res.text).toContain('data: {"status":"DONE"}');
      done();
    });
  });
});