import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || 'redis',
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: 3,
});

export const generationQueue = new Queue('generationQueue', {
  connection: redisConnection,
});

export { redisConnection };