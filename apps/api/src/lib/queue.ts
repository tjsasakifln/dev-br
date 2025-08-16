import { Queue } from 'bullmq';
import { getRedisClient } from './redis';

const redisConnection = getRedisClient();

// Instância separada para pub/sub
export const pubsub = getRedisClient();

export const generationQueue = new Queue('generation', {
  connection: redisConnection,
});

export { redisConnection };
export { redisConnection as redis };