import express from 'express';
import cors from 'cors';
import { todosRouter } from './routes/todos';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api/todos', todosRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});