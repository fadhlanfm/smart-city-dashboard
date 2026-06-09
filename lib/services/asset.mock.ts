import { FilterParamsDTO } from '../validators/filter.schema';
import { BaseResponse, ExtendedAsset, CreateAssetDTO, UpdateAssetDTO } from '../types';

export const mockService = {
  async getFilteredAssets(filters: FilterParamsDTO): Promise<BaseResponse<ExtendedAsset[]>> {
    const { getMockAssets } = await import('@/lib/mock-data');
    let filtered = getMockAssets();
    if (filters.districtId) filtered = filtered.filter(a => a.districtId === filters.districtId);
    if (filters.type) filtered = filtered.filter(a => a.type === filters.type);
    if (filters.status) filtered = filtered.filter(a => a.status === filters.status);
    const total = filtered.length;
    filtered = filtered.sort((a, b) => {
      const valA = a[filters.sort] || a.createdAt;
      const valB = b[filters.sort] || b.createdAt;
      if (filters.order === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });
    const skip = (filters.page - 1) * filters.pageSize;
    const paginated = filtered.slice(skip, skip + filters.pageSize);
    return {
      data: paginated.map(a => ({ ...a, geometry: a.location, district: { name: a.districtName } })) as ExtendedAsset[],
      meta: { page: filters.page, pageSize: filters.pageSize, total, totalPages: Math.ceil(total / filters.pageSize) },
    };
  },
  async getAssetSummary(filters: FilterParamsDTO) {
    const { getMockSummary } = await import('@/lib/mock-data');
    return getMockSummary(filters);
  },
  async getAssetGeoJSON(filters: FilterParamsDTO) {
    const { getMockAssets } = await import('@/lib/mock-data');
    let filtered = getMockAssets();
    if (filters.districtId) filtered = filtered.filter(a => a.districtId === filters.districtId);
    if (filters.type) filtered = filtered.filter(a => a.type === filters.type);
    if (filters.status) filtered = filtered.filter(a => a.status === filters.status);
    return {
      type: 'FeatureCollection',
      features: filtered.map(a => ({
        type: 'Feature', geometry: a.location,
        properties: { id: a.id, name: a.name, type: a.type, status: a.status, districtId: a.districtId }
      })),
    };
  },
  async getAssetDetail(id: string) {
    const { getMockAssets } = await import('@/lib/mock-data');
    const asset = getMockAssets().find(a => a.id === id);
    if (!asset) return null;
    return {
      ...asset, geometry: asset.location,
      photos: [`https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800&sig=${id}1`],
      documents: [{ title: 'Standard Maintenance Protocol', url: '#', fileType: 'PDF', uploadedAt: new Date(asset.createdAt).toISOString() }],
      notes: ['Asset has been verified by the city inspection team.'],
      recentIncidents: [],
      district: { id: asset.districtId, name: asset.districtName, code: 'BDG' }
    } as unknown as ExtendedAsset;
  },
  async createAsset(data: CreateAssetDTO) {
    const { id, name, type, status, districtId, lon, lat, tags } = data;
    const { getMockAssets, saveMockAssets, mockDistricts } = await import('@/lib/mock-data');
    const mockAssets = getMockAssets();
    const districtName = mockDistricts.find(d => d.id === districtId)?.name || 'Mock District';
    const newAsset = {
      id, name, type, status, districtId, tags: tags || [], districtName,
      location: { type: 'Point', coordinates: [lon, lat] },
      geometry: { type: 'Point', coordinates: [lon, lat] },
      district: { id: districtId, name: districtName },
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    mockAssets.unshift(newAsset);
    saveMockAssets(mockAssets);
    return newAsset;
  },
  async updateAsset(id: string, data: UpdateAssetDTO) {
    const { name, type, status, districtId, lon, lat, tags } = data;
    const { getMockAssets, saveMockAssets, mockDistricts } = await import('@/lib/mock-data');
    const mockAssets = getMockAssets();
    const idx = mockAssets.findIndex(a => a.id === id);
    if (idx !== -1) {
      if (name) mockAssets[idx].name = name;
      if (type) mockAssets[idx].type = type;
      if (status) mockAssets[idx].status = status;
      if (districtId) {
        mockAssets[idx].districtId = districtId;
        mockAssets[idx].districtName = mockDistricts.find(d => d.id === districtId)?.name || 'Mock District';
      }
      if (lon !== undefined && lat !== undefined) mockAssets[idx].location = { type: 'Point', coordinates: [lon, lat] };
      if (tags) mockAssets[idx].tags = tags;
      mockAssets[idx].updatedAt = new Date().toISOString();
      saveMockAssets(mockAssets);
      return mockAssets[idx];
    } else {
      const districtName = mockDistricts.find(d => d.id === districtId)?.name || 'Mock District';
      return {
        id, 
        name: name || 'Unknown Asset', 
        type: type || 'POI', 
        status: status || 'ACTIVE', 
        districtId: districtId || '', 
        tags: tags || [], 
        districtName,
        location: { type: 'Point', coordinates: [lon || 107.61, lat || -6.91] },
        geometry: { type: 'Point', coordinates: [lon || 107.61, lat || -6.91] },
        district: { id: districtId || '', name: districtName },
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString()
      };
    }
  },
  async deleteAsset(id: string) {
    const { getMockAssets, saveMockAssets } = await import('@/lib/mock-data');
    const mockAssets = getMockAssets();
    const idx = mockAssets.findIndex(a => a.id === id);
    if (idx !== -1) {
      mockAssets.splice(idx, 1);
      saveMockAssets(mockAssets);
    }
    return { success: true };
  }
};
