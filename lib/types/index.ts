import { Asset, District, AssetStatus, AssetType } from '@prisma/client';

export interface GeoJSONGeometry {
  type: string;
  coordinates: number[] | number[][] | number[][][];
}

export interface GeoJSONFeature<T = any> {
  type: 'Feature';
  geometry: GeoJSONGeometry;
  properties: T;
}

export interface GeoJSONFeatureCollection<T = any> {
  type: 'FeatureCollection';
  features: GeoJSONFeature<T>[];
}

export interface IncidentDocument {
  id: string; // Mapped from _id
  type: string;
  severity: string;
  status: string;
  description: string;
  createdAt: Date | string;
  assetId?: string;
}

export interface AssetDocumentType {
  assetId: string;
  photos: string[];
  documents: { title: string; url: string; uploadedAt: string }[];
  notes: string[];
}

export interface ExtendedAsset extends Asset {
  district?: {
    id: string;
    name: string;
    code: string;
  };
  geometry?: GeoJSONGeometry | null;
  photos?: string[];
  documents?: { title: string; url: string; uploadedAt: string }[];
  notes?: string[];
  recentIncidents?: IncidentDocument[];
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateAssetDTO {
  id?: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  districtId: string;
  lon: number;
  lat: number;
  tags?: string[];
}

export interface UpdateAssetDTO {
  name?: string;
  type?: AssetType;
  status?: AssetStatus;
  districtId?: string;
  lon?: number;
  lat?: number;
  tags?: string[];
}

export interface SearchHit {
  _id: string;
  _score?: number;
  _source: {
    name: string;
    type: string;
    status: string;
    districtId: string;
    district: string;
    location: { lat: number; lon: number };
    tags: string[];
    updatedAt: string;
  };
}

export interface BaseResponse<T> {
  data: T;
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
