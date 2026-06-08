import { z } from 'zod';
import { AssetType, AssetStatus } from '@prisma/client';

export const filterSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  districtId: z.string().optional(),
  type: z.nativeEnum(AssetType).optional(),
  status: z.nativeEnum(AssetStatus).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sort: z.string().default('updatedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
}).refine(data => {
  if (data.dateFrom && data.dateTo) {
    return new Date(data.dateFrom) <= new Date(data.dateTo);
  }
  return true;
}, {
  message: "dateFrom must be before or equal to dateTo",
  path: ["dateTo"],
});

export type FilterParamsDTO = z.infer<typeof filterSchema>;
