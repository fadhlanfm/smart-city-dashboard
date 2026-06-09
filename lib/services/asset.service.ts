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
  return getMockSummary(filters);
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
    photos: [
      `https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800&sig=${id}1`,
      `https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800&sig=${id}2`,
      `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800&sig=${id}3`
    ],
    documents: [
      { title: 'Standard Maintenance Protocol', url: '#', fileType: 'PDF', uploadedAt: new Date(asset.createdAt).toISOString() },
      { title: 'Technical Specifications', url: '#', fileType: 'PDF', uploadedAt: new Date(asset.createdAt).toISOString() },
      { title: 'Installation Diagram', url: '#', fileType: 'PNG', uploadedAt: new Date(asset.createdAt).toISOString() }
    ],
    notes: ['Asset has been verified by the city inspection team.', 'Scheduled for routine maintenance next quarter.'],
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
  
  // Mock successful creation
  return {
    id, name, type, status, districtId, tags: tags || [],
    geometry: { type: 'Point', coordinates: [lon, lat] },
    district: { id: districtId, name: 'Mock District' },
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export async function updateAsset(id: string, data: UpdateAssetDTO) {
  const { name, type, status, districtId, lon, lat, tags } = data;
  
  // Mock successful update
  return {
    id, name, type, status, districtId, tags: tags || [],
    geometry: lon !== undefined ? { type: 'Point', coordinates: [lon, lat] } : null,
    district: { id: districtId, name: 'Mock District' },
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export async function deleteAsset(id: string) {
  // Mock successful deletion
  return { success: true };
}
