import { prisma } from '../db/prisma';
import { Prisma } from '@prisma/client';
import { getCache, setCache } from './cache.service';
import { makeCacheKey } from '../utils/cache-key';
import { FilterParamsDTO } from '../validators/filter.schema';
import { BaseResponse, ExtendedAsset, CreateAssetDTO, UpdateAssetDTO, IncidentDocument } from '../types';

export async function getFilteredAssets(filters: FilterParamsDTO): Promise<BaseResponse<ExtendedAsset[]>> {
  const { mockAssets } = await import('@/lib/mock-data');
  
  let filtered = mockAssets;
  
  if (filters.districtId) filtered = filtered.filter(a => a.districtId === filters.districtId);
  if (filters.type) filtered = filtered.filter(a => a.type === filters.type);
  if (filters.status) filtered = filtered.filter(a => a.status === filters.status);

  const total = filtered.length;
  
  // Sorting (mocking basic sorting)
  filtered = filtered.sort((a, b) => {
    const valA = a[filters.sort] || a.createdAt;
    const valB = b[filters.sort] || b.createdAt;
    if (filters.order === 'asc') return valA > valB ? 1 : -1;
    return valA < valB ? 1 : -1;
  });

  const skip = (filters.page - 1) * filters.pageSize;
  const paginated = filtered.slice(skip, skip + filters.pageSize);

  const data = paginated.map(a => ({
    ...a,
    geometry: a.location,
    district: { name: a.districtName }
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

  return result;
}

export async function getAssetSummary(filters: FilterParamsDTO) {
  const { getMockSummary } = await import('@/lib/mock-data');
  return getMockSummary();
}

export async function getAssetGeoJSON(filters: FilterParamsDTO) {
  const { mockAssets } = await import('@/lib/mock-data');
  
  // Optional: Apply filters to mock data if needed
  let filtered = mockAssets;
  if (filters.districtId) filtered = filtered.filter(a => a.districtId === filters.districtId);
  if (filters.type) filtered = filtered.filter(a => a.type === filters.type);
  if (filters.status) filtered = filtered.filter(a => a.status === filters.status);

  const featureCollection = {
    type: 'FeatureCollection',
    features: filtered.map(a => ({
      type: 'Feature',
      geometry: a.location,
      properties: {
        id: a.id,
        name: a.name,
        type: a.type,
        status: a.status,
        districtId: a.districtId,
      },
    })),
  };

  return featureCollection;
}

export async function getAssetDetail(id: string) {
  const { mockAssets } = await import('@/lib/mock-data');
  const asset = mockAssets.find(a => a.id === id);
  
  if (!asset) return null;

  const result = {
    ...asset,
    geometry: asset.location,
    photos: ['https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800'],
    documents: [],
    notes: ['Mock data notes for this asset.'],
    recentIncidents: [],
    district: {
      id: asset.districtId,
      name: asset.districtName,
      code: 'BDG'
    }
  };

  return result as unknown as ExtendedAsset;
}

export async function createAsset(data: CreateAssetDTO) {
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

export async function updateAsset(id: string, data: UpdateAssetDTO) {
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

export async function deleteAsset(id: string) {
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
