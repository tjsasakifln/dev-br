import { Router } from 'express';
import { generationService } from '../services/generation.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { pubsub } from '../lib/queue';

const router = Router();

router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const generation = await generationService.getGenerationById(id);

  if (!generation) {
    return res.status(404).json({ error: 'Generation not found' });
  }
  
  res.status(200).json(generation);
}));

router.get('/:id/status', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const generation = await generationService.getGenerationStatus(id);

  if (!generation) {
    return res.status(404).json({ error: 'Generation not found' });
  }
  
  res.status(200).json({
    status: generation.status,
    progress: generation.progress,
  });
}));

router.get('/:id/logs', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const generation = await generationService.getGenerationLogs(id);

  if (!generation) {
    return res.status(404).json({ error: 'Generation not found' });
  }
  
  res.status(200).json({
    logs: generation.logs || [],
  });
}));

router.get('/:id/stream', async (req, res) => {
  const generationId = req.params.id;
  const channel = `generation-updates:${generationId}`;

  // 1. Configurar os headers para SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
  res.flushHeaders();

  // 2. Criar um novo cliente Redis para esta subscrição
  const subscriber = pubsub.duplicate();
  await subscriber.connect();

  // 3. Subscrever ao canal e enviar dados
  await subscriber.subscribe(channel);
  
  subscriber.on('message', (channel: string, message: string) => {
    try {
      const data = JSON.parse(message || '{}');
      
      if (data.__end_of_stream__) {
        res.write('event: end\ndata: Transmission complete\n\n');
        res.end(); // Fecha a conexão
        subscriber.quit();
        return;
      }
      
      if (data.__error__) {
        res.write(`event: error\ndata: ${JSON.stringify(data)}\n\n`);
        res.end();
        subscriber.quit();
        return;
      }
      
      res.write(`data: ${message}\n\n`);
    } catch (error) {
      console.error('Error processing SSE message:', error);
      res.write(`event: error\ndata: ${JSON.stringify({ error: 'Invalid message format' })}\n\n`);
    }
  });

  // 4. Lidar com o fecho da conexão pelo cliente
  req.on('close', () => {
    console.log(`Client disconnected from generation stream ${generationId}`);
    subscriber.unsubscribe(channel);
    subscriber.quit();
  });

  req.on('error', (error) => {
    console.error(`SSE connection error for generation ${generationId}:`, error);
    subscriber.unsubscribe(channel);
    subscriber.quit();
  });
});

export default router;