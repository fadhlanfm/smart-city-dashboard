import { redis } from '@/lib/db/redis';
import Redis from 'ioredis';
import { logger } from '@/lib/utils/logger';

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
  }));
});

jest.mock('@/lib/utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('Redis Connection', () => {
  it('initializes redis successfully', () => {
    expect(redis).toBeDefined();
  });

  it('handles retryStrategy', () => {
    const mockRedisCall = (Redis as unknown as jest.Mock).mock.calls[0];
    const options = mockRedisCall[1];
    
    // Call the retryStrategy
    expect(options.retryStrategy(1)).toBe(50);
    expect(options.retryStrategy(4)).toBeNull();
    expect(logger.error).toHaveBeenCalledWith('Redis connection failed after 3 retries.');
  });

  it('registers error event handler', () => {
    const mockRedisInstance = (Redis as unknown as jest.Mock).mock.results[0].value;
    const errorCallback = mockRedisInstance.on.mock.calls.find((call: any[]) => call[0] === 'error')[1];
    
    errorCallback(new Error('Test error'));
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ err: expect.any(Error) }),
      'Redis connection error (graceful fallback will be used)'
    );
  });
});
