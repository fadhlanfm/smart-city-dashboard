const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../lib/services/asset.service.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace exports
content = content.replace(/export async function getFilteredAssets/g, 'async function real_getFilteredAssets');
content = content.replace(/export async function getAssetSummary/g, 'async function real_getAssetSummary');
content = content.replace(/export async function getAssetGeoJSON/g, 'async function real_getAssetGeoJSON');
content = content.replace(/export async function getAssetDetail/g, 'async function real_getAssetDetail');
content = content.replace(/export async function createAsset/g, 'async function real_createAsset');
content = content.replace(/export async function updateAsset/g, 'async function real_updateAsset');
content = content.replace(/export async function deleteAsset/g, 'async function real_deleteAsset');

const wrappers = `

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
`;

fs.writeFileSync(filePath, content + wrappers);
