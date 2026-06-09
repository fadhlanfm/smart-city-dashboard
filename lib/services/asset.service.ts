import { prisma } from '../db/prisma';
import { Prisma } from '@prisma/client';
import { getCache, setCache } from './cache.service';
import { makeCacheKey } from '../utils/cache-key';
import { FilterParamsDTO } from '../validators/filter.schema';
import { BaseResponse, ExtendedAsset, CreateAssetDTO, UpdateAssetDTO, IncidentDocument } from '../types';

async function real_getFilteredAssets(filters: FilterParamsDTO): Promise<BaseResponse<ExtendedAsset[]>> {
  const cacheKey = makeCacheKey('assets:filtered', filters as Record<string, unknown>);
  const cached = await getCache<BaseResponse<ExtendedAsset[]>>(cacheKey);
  if (cached) return cached;

  const where: Prisma.AssetWhereInput = {};
  if (filters.districtId) where.districtId = filters.districtId;
  if (filters.type) where.type = filters.type;
  if (filters.status) where.status = filters.status;
  if (filters.dateFrom || filters.dateTo) {
    where.updatedAt = {};
    if (filters.dateFrom) where.updatedAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) where.updatedAt.lte = new Date(filters.dateTo);
  }

  const skip = (filters.page - 1) * filters.pageSize;
  
  // We use queryRaw to get ST_AsGeoJSON because prisma doesn't support PostGIS directly in findMany selects yet
  // However, building a dynamic queryRaw is risky for SQL injection.
  // Instead, we fetch IDs using Prisma findMany, then fetch geometries.
  
  const [total, assets] = await Promise.all([
    prisma.asset.count({ where }),
    prisma.asset.findMany({
      where,
      orderBy: { [filters.sort]: filters.order },
      skip,
      take: filters.pageSize,
      include: { district: { select: { name: true } } },
    }),
  ]);

  if (assets.length === 0) {
    const emptyResult = { data: [], meta: { page: filters.page, pageSize: filters.pageSize, total: 0, totalPages: 0 } };
    await setCache(cacheKey, emptyResult, 30);
    return emptyResult;
  }

  const geometries = await prisma.$queryRaw<{ geometry: string, id: string }[]>`
    SELECT id, ST_AsGeoJSON(geometry)::json as geometry FROM "Asset" WHERE id IN (${Prisma.join(assets.map(a => a.id))})
  `;
  const geoMap = new Map(geometries.map(g => [g.id, g.geometry]));

  const data = assets.map(a => ({
    ...a,
    geometry: geoMap.get(a.id) || null,
  })) as ExtendedAsset[];

  const result = {
    data,
    meta: {
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      totalPages: Math.ceil(total / filters.pageSize),
    },
  };

  await setCache(cacheKey, result, 30);
  return result;
}

async function real_getAssetSummary(filters: FilterParamsDTO) {
  const cacheKey = makeCacheKey('assets:summary', filters as Record<string, unknown>);
  const cached = await getCache<{total: number, byType: {type: string, count: number}[], byStatus: {status: string, count: number}[]}>(cacheKey);
  if (cached) return cached;

  const where: Prisma.AssetWhereInput = {};
  if (filters.districtId) where.districtId = filters.districtId;
  // Intentionally omit type/status filters for the summary aggregation itself

  const [total, byType, byStatus] = await Promise.all([
    prisma.asset.count({ where }),
    prisma.asset.groupBy({
      by: ['type'],
      where,
      _count: true,
    }),
    prisma.asset.groupBy({
      by: ['status'],
      where,
      _count: true,
    }),
  ]);

  const result = {
    total,
    byType: byType.map(t => ({ type: t.type, count: t._count })),
    byStatus: byStatus.map(s => ({ status: s.status, count: s._count })),
  };

  await setCache(cacheKey, result, 60);
  return result;
}

async function real_getAssetGeoJSON(filters: FilterParamsDTO) {
  const cacheKey = makeCacheKey('assets:geojson', filters as Record<string, unknown>);
  const cached = await getCache<any>(cacheKey);
  if (cached) return cached;

  const where: any = {};
  if (filters.districtId) where.districtId = filters.districtId;
  if (filters.type) where.type = filters.type;
  if (filters.status) where.status = filters.status;

  const assets = await prisma.asset.findMany({
    where,
    select: { id: true, name: true, type: true, status: true, districtId: true }
  });

  if (assets.length === 0) {
    const emptyResult = { type: 'FeatureCollection', features: [] };
    await setCache(cacheKey, emptyResult, 60);
    return emptyResult;
  }

  const assetIds = assets.map(a => a.id);
  const geometries: any[] = await prisma.$queryRaw`
    SELECT id, ST_AsGeoJSON(geometry)::json as geometry FROM "Asset" WHERE id IN (${Prisma.join(assetIds)})
  `;
  const geoMap = new Map(geometries.map(g => [g.id, g.geometry]));

  const featureCollection = {
    type: 'FeatureCollection',
    features: assets.map(a => ({
      type: 'Feature',
      geometry: geoMap.get(a.id),
      properties: {
        id: a.id,
        name: a.name,
        type: a.type,
        status: a.status,
        districtId: a.districtId,
      },
    })),
  };

  await setCache(cacheKey, featureCollection, 60);
  return featureCollection;
}

async function real_getAssetDetail(id: string) {
  const cacheKey = makeCacheKey('asset:detail', { id });
  const cached = await getCache<ExtendedAsset>(cacheKey);
  if (cached) return cached;

  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      district: {
        select: { id: true, name: true, code: true }
      }
    }
  });

  if (!asset) return null;

  const geometries = await prisma.$queryRaw<{ geometry: string }[]>`
    SELECT ST_AsGeoJSON(geometry)::json as geometry FROM "Asset" WHERE id = ${id}
  `;

  // Dynamically import Mongoose model to avoid circular/top-level issues if any
  const { Incident, connectMongoDB } = require('@/lib/db/mongoose');
  await connectMongoDB();

  // Fetch recent incidents linked to this asset from MongoDB
  const recentIncidents = await Incident.find({ assetId: id })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const { AssetDocument } = require('@/lib/db/mongoose');
  const doc = await AssetDocument.findOne({ assetId: id }).lean();

  const result = {
    ...asset,
    geometry: geometries[0]?.geometry || null,
    photos: doc?.photos || [],
    documents: doc?.documents || [],
    notes: doc?.notes || [],
    recentIncidents: recentIncidents.map((i: any) => ({
      id: i._id.toString(),
      type: i.type,
      severity: i.severity,
      status: i.status,
      description: i.description,
      createdAt: i.createdAt
    }))
  };

  await setCache(cacheKey, result, 30);
  return result as ExtendedAsset;
}

async function real_createAsset(data: CreateAssetDTO) {
  const { id, name, type, status, districtId, lon, lat, tags } = data;
  
  const tagsArray = tags || [];
  const tagsPgArray = "{" + tagsArray.map(t => '"' + t.replace(/"/g, '\\"') + '"').join(',') + "}";

  // 1. Insert into Postgres using PostGIS
  await prisma.$executeRaw`
    INSERT INTO "Asset" ("id", "name", "type", "status", "districtId", "geometry", "tags", "createdAt", "updatedAt")
    VALUES (
      ${id}, ${name}, ${type}::"AssetType", ${status}::"AssetStatus", ${districtId},
      ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326),
      ${tagsPgArray}::text[],
      NOW(), NOW()
    )
  `;

  // Fetch the full asset to get the district details
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: { district: true }
  });

  // 2. Initialize MongoDB AssetDocument
  const { AssetDocument, connectMongoDB } = require('@/lib/db/mongoose');
  await connectMongoDB();
  await AssetDocument.create({
    assetId: id,
    photos: [],
    documents: [],
    notes: ["Asset created via CRUD"]
  });

  // 3. Insert into Elasticsearch
  const { esClient } = require('@/lib/db/elasticsearch');
  await esClient.index({
    index: 'smart_city_assets',
    id: id,
    document: {
      name,
      type,
      status,
      districtId,
      district: asset?.district?.name || 'Unknown',
      location: { lat, lon },
      tags: tags || [],
      updatedAt: new Date().toISOString()
    }
  });

  // 4. Invalidate Redis Caches
  const { redis } = require('@/lib/db/redis');
  if (redis) {
    const keys = await redis.keys('asset*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  return asset;
}

async function real_updateAsset(id: string, data: UpdateAssetDTO) {
  const { name, type, status, districtId, lon, lat, tags } = data;

  // 1. Update Postgres (Scalars)
  await prisma.asset.update({
    where: { id },
    data: { name, type, status, districtId, tags: tags || [] }
  });

  // 2. Update Geometry
  if (lon !== undefined && lat !== undefined) {
    await prisma.$executeRaw`
      UPDATE "Asset" 
      SET 
        "geometry" = ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326),
        "updatedAt" = NOW()
      WHERE "id" = ${id}
    `;
  }

  const asset = await prisma.asset.findUnique({
    where: { id },
    include: { district: true }
  });

  // 2. Update Elasticsearch
  const { esClient } = require('@/lib/db/elasticsearch');
  const doc: Record<string, unknown> = { name, type, status, districtId, tags, updatedAt: new Date().toISOString() };
  if (asset?.district?.name) doc.district = asset.district.name;
  if (lon !== undefined && lat !== undefined) doc.location = { lat, lon };

  await esClient.update({
    index: 'smart_city_assets',
    id: id,
    doc: doc,
    doc_as_upsert: true
  });

  // 3. Invalidate Redis Caches
  const { redis } = require('@/lib/db/redis');
  if (redis) {
    const keys = await redis.keys('asset*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  return asset;
}

async function real_deleteAsset(id: string) {
  // 1. Delete from Postgres
  await prisma.asset.delete({ where: { id } });

  // 2. Delete from MongoDB
  const { AssetDocument, Incident, connectMongoDB } = require('@/lib/db/mongoose');
  await connectMongoDB();
  await AssetDocument.deleteOne({ assetId: id });
  await Incident.deleteMany({ assetId: id });

  // 3. Delete from Elasticsearch
  const { esClient } = require('@/lib/db/elasticsearch');
  try {
    await esClient.delete({ index: 'smart_city_assets', id: id });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'meta' in err && (err as Record<string, unknown>).meta && ((err as Record<string, unknown>).meta as Record<string, unknown>).statusCode !== 404) {
      console.error('ES Delete error', err);
    }
  }

  // 4. Invalidate Redis Caches
  const { redis } = require('@/lib/db/redis');
  if (redis) {
    const keys = await redis.keys('asset*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  return { success: true };
}


// ============================================================================
// GRACEFUL DEGRADATION WRAPPERS (Real DB -> Mock Fallback)
// ============================================================================

export async function getFilteredAssets(filters: FilterParamsDTO): Promise<BaseResponse<ExtendedAsset[]>> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DB === 'true') {
    const { mockService } = await import('./asset.mock');
    return mockService.getFilteredAssets(filters);
  }
  try {
    return await real_getFilteredAssets(filters);
  } catch (err) {
    console.error("DB Error (getFilteredAssets), falling back to mock", err);
    const { mockService } = await import('./asset.mock');
    return mockService.getFilteredAssets(filters);
  }
}

export async function getAssetSummary(filters: FilterParamsDTO) {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DB === 'true') {
    const { mockService } = await import('./asset.mock');
    return mockService.getAssetSummary(filters);
  }
  try {
    return await real_getAssetSummary(filters);
  } catch (err) {
    console.error("DB Error (getAssetSummary), falling back to mock", err);
    const { mockService } = await import('./asset.mock');
    return mockService.getAssetSummary(filters);
  }
}

export async function getAssetGeoJSON(filters: FilterParamsDTO) {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DB === 'true') {
    const { mockService } = await import('./asset.mock');
    return mockService.getAssetGeoJSON(filters);
  }
  try {
    return await real_getAssetGeoJSON(filters);
  } catch (err) {
    console.error("DB Error (getAssetGeoJSON), falling back to mock", err);
    const { mockService } = await import('./asset.mock');
    return mockService.getAssetGeoJSON(filters);
  }
}

export async function getAssetDetail(id: string) {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DB === 'true') {
    const { mockService } = await import('./asset.mock');
    return mockService.getAssetDetail(id);
  }
  try {
    return await real_getAssetDetail(id);
  } catch (err) {
    console.error("DB Error (getAssetDetail), falling back to mock", err);
    const { mockService } = await import('./asset.mock');
    return mockService.getAssetDetail(id);
  }
}

export async function createAsset(data: CreateAssetDTO) {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DB === 'true') {
    const { mockService } = await import('./asset.mock');
    return mockService.createAsset(data);
  }
  try {
    return await real_createAsset(data);
  } catch (err) {
    console.error("DB Error (createAsset), falling back to mock", err);
    const { mockService } = await import('./asset.mock');
    return mockService.createAsset(data);
  }
}

export async function updateAsset(id: string, data: UpdateAssetDTO) {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DB === 'true') {
    const { mockService } = await import('./asset.mock');
    return mockService.updateAsset(id, data);
  }
  try {
    return await real_updateAsset(id, data);
  } catch (err) {
    console.error("DB Error (updateAsset), falling back to mock", err);
    const { mockService } = await import('./asset.mock');
    return mockService.updateAsset(id, data);
  }
}

export async function deleteAsset(id: string) {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DB === 'true') {
    const { mockService } = await import('./asset.mock');
    return mockService.deleteAsset(id);
  }
  try {
    return await real_deleteAsset(id);
  } catch (err) {
    console.error("DB Error (deleteAsset), falling back to mock", err);
    const { mockService } = await import('./asset.mock');
    return mockService.deleteAsset(id);
  }
}
