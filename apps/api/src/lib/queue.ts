import { Queue } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST || 'redis', // 'redis' é o nome do serviço no docker-compose
  port: 6379,
};

export const generationQueue = new Queue('generation-queue', { connection });