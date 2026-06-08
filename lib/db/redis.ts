import Redis from 'ioredis';
import { logger } from '../utils/logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClientSingleton = () => {
  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) {
        logger.error('Redis connection failed after 3 retries.');
        return null; // Stop retrying
      }
      return Math.min(times * 50, 2000);
    },
  });

  client.on('error', (err) => {
    logger.error({ err }, 'Redis connection error (graceful fallback will be used)');
  });

  return client;
};

declare global {
  var redisGlobal: undefined | ReturnType<typeof redisClientSingleton>;
}

export const redis = globalThis.redisGlobal ?? redisClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.redisGlobal = redis;
