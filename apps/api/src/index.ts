/*
 * Copyright (c) 2025 Confenge Avaliações e Inteligência Artificial LTDA
 * All Rights Reserved - Proprietary and Confidential
 * Unauthorized copying, distribution, or use is strictly prohibited.
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
// import usersRouter from './routes/v1/users.routes';
// import projectsRouter from './routes/projects.routes';
// import generationsRouter from './routes/v1/generations.routes';
import { errorHandler } from './middleware/errorHandler';
// import { testRedisConnection } from './lib/redis';
// import './workers/graph.worker';
// import './workers/generationWorker';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running' });
});

// app.use('/api/v1/users', usersRouter);
// app.use('/api/v1/projects', projectsRouter);
// app.use('/api/v1/generations', generationsRouter);

app.use(errorHandler);

export default app;

// Only start the server when the file is executed directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`API server listening at http://localhost:${port}`);
  });
}