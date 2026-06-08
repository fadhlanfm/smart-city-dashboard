import { z } from 'zod';

export const bufferSchema = z.object({
  assetId: z.string().min(1, 'Invalid Asset ID'),
  radiusMeters: z.number().min(10).max(5000),
});

export const intersectSchema = z.object({
  lon: z.number().min(-180).max(180),
  lat: z.number().min(-90).max(90),
});
