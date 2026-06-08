import { z } from 'zod';
import { AssetType, AssetStatus } from '@prisma/client';

export const searchSchema = z.object({
  q: z.string().min(1).max(200),
  districtId: z.string().optional(),
  type: z.nativeEnum(AssetType).optional(),
  status: z.nativeEnum(AssetStatus).optional(),
  size: z.coerce.number().min(1).max(50).default(10),
});

export type SearchParamsDTO = z.infer<typeof searchSchema>;
