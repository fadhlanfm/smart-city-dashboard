import { redis } from '../db/redis';
import { logger } from '../utils/logger';

export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  
  try {
    const data = await redis.get(key);
    if (data) {
      return JSON.parse(data) as T;
    }
    return null;
  } catch (error) {
    logger.warn({ error, key }, 'Redis get error, bypassing cache');
    return null;
  }
}

export async function setCache<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
  if (!redis) return;

  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  } catch (error) {
    logger.warn({ error, key }, 'Redis set error, ignoring cache save');
  }
}

export async function deleteCache(key: string): Promise<void> {
  if (!redis) return;

  try {
    await redis.del(key);
  } catch (error) {
    logger.warn({ error, key }, 'Redis delete error');
  }
}
