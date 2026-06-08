import { AssetType, AssetStatus } from '@prisma/client';

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data?: T;
  meta?: PaginationMeta;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface FilterParams {
  page?: number;
  pageSize?: number;
  districtId?: string;
  type?: AssetType;
  status?: AssetStatus;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface HealthStatus {
  status: 'ok' | 'degraded';
  services: {
    postgres: { status: 'up' | 'down'; latencyMs?: number };
    mongodb: { status: 'up' | 'down'; latencyMs?: number };
    redis: { status: 'up' | 'down'; latencyMs?: number };
    elasticsearch: { status: 'up' | 'down'; latencyMs?: number };
  };
  timestamp: string;
}

export interface SearchResult {
  id: string;
  name: string;
  type: string;
  status?: string;
  district: string;
  districtId?: string;
  address?: string;
  location?: { lat: number; lon: number };
  geometry?: { type: string; coordinates: number[] | number[][] | number[][][] } | null;
  score: number;
}
