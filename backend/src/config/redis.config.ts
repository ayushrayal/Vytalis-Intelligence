import Redis from 'ioredis';
import { env } from './env.config';
import { logger } from './logger.config';

let redisClient: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
      lazyConnect: true,
    });

    redisClient.on('connect', () => {
      logger.info('Redis connection established');
    });

    redisClient.on('error', (err) => {
      logger.warn(`Redis connection error: ${err.message}`);
    });
  }

  return redisClient;
};

export const connectRedis = async (): Promise<Redis> => {
  const client = getRedisClient();
  try {
    await client.connect();
    return client;
  } catch (error) {
    logger.warn('Redis connect failed - operating with degraded cache capability', { error });
    return client;
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis disconnected cleanly');
  }
};
