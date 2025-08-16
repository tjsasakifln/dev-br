import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
});

export const generationQueue = new Queue('generation', {
  connection: redisConnection,
});

export { redisConnection };
export { redisConnection as redis };