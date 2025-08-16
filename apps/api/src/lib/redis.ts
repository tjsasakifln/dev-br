import Redis from 'ioredis';

let redis: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redis = new Redis(redisUrl, {
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    });

    redis.on('connect', () => {
      console.log('✅ Redis conectado com sucesso');
    });

    redis.on('error', (error) => {
      console.error('❌ Erro na conexão com Redis:', error);
    });

    redis.on('ready', () => {
      console.log('🚀 Redis está pronto para uso');
    });
  }

  return redis;
};

export const testRedisConnection = async (): Promise<boolean> => {
  try {
    const client = getRedisClient();
    await client.ping();
    console.log('✅ Teste de conexão Redis: SUCESSO');
    return true;
  } catch (error) {
    console.error('❌ Teste de conexão Redis: FALHOU', error);
    return false;
  }
};

export default getRedisClient;