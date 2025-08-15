import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import usersRouter from './api/v1/users/users.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running' });
});

app.use('/api/v1/users', usersRouter);

app.use(errorHandler);

// Export the app for tests to import
export default app;

// Only start the server when the file is executed directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`API server listening at http://localhost:${port}`);
  });
}