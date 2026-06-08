import crypto from 'crypto';

export function makeCacheKey(prefix: string, params: Record<string, unknown>): string {
  const sortedKeys = Object.keys(params).sort();
  const sortedParams: Record<string, unknown> = {};
  
  for (const key of sortedKeys) {
    if (params[key] !== undefined) {
      sortedParams[key] = params[key];
    }
  }

  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(sortedParams))
    .digest('hex');

  return `${prefix}:${hash}`;
}
