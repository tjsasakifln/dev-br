import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import usersRouter from './api/v1/users/users.routes';
import projectsRouter from './api/v1/projects/projects.routes';
import generationsRouter from './api/v1/generations/generations.routes';
import { errorHandler } from './middleware/errorHandler';
import './workers/generationWorker';

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running' });
});

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/projects', projectsRouter);
app.use('/api/v1/generations', generationsRouter);

app.use(errorHandler);

export default app;

// Only start the server when the file is executed directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`API server listening at http://localhost:${port}`);
  });
}