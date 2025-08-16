import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { generationService } from '../services/generation.service';

export const streamGenerationProgress = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // 1. Configurar cabeçalhos para Server-Sent Events (SSE)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Cache-Control', 'no-cache');
  res.flushHeaders(); // Envia os cabeçalhos imediatamente

  // 2. Obter o event emitter para esta geração específica
  const eventEmitter = generationService.getEventEmitter(id);

  const progressListener = (data: { status: string; log: string }) => {
    // 3. Formatar e enviar o evento no formato SSE
    res.write(`event: message\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  eventEmitter.on('progress', progressListener);

  // 4. Lidar com o fechamento da conexão pelo cliente
  req.on('close', () => {
    eventEmitter.off('progress', progressListener);
    console.log(`Connection closed for generation ${id}`);
    res.end();
  });
});