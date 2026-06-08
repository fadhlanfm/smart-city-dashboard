import { getCache, setCache, deleteCache } from '@/lib/services/cache.service';
import { redis } from '@/lib/db/redis';

jest.mock('@/lib/db/redis', () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  },
}));

describe('Cache Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fall through on cache miss', async () => {
    (redis.get as jest.Mock).mockResolvedValue(null);
    const result = await getCache('test_key');
    expect(result).toBeNull();
  });

  it('should return parsed data on cache hit', async () => {
    (redis.get as jest.Mock).mockResolvedValue('{"foo":"bar"}');
    const result = await getCache('test_key');
    expect(result).toEqual({ foo: 'bar' });
  });

  it('should handle redis errors gracefully without throwing', async () => {
    (redis.get as jest.Mock).mockRejectedValue(new Error('Connection error'));
    const result = await getCache('test_key');
    expect(result).toBeNull();
  });

  it('should set cache correctly', async () => {
    await setCache('test_key', { foo: 'bar' }, 60);
    expect(redis.set).toHaveBeenCalledWith('test_key', '{"foo":"bar"}', 'EX', 60);
  });

  it('should handle set cache errors', async () => {
    (redis.set as jest.Mock).mockRejectedValueOnce(new Error('Set error'));
    await expect(setCache('test_key', { foo: 'bar' }, 60)).resolves.not.toThrow();
  });

  it('should delete cache correctly', async () => {
    await deleteCache('test_key');
    expect(redis.del).toHaveBeenCalledWith('test_key');
  });

  it('should handle delete cache errors', async () => {
    (redis.del as jest.Mock).mockRejectedValueOnce(new Error('Del error'));
    await expect(deleteCache('test_key')).resolves.not.toThrow();
  });
});
