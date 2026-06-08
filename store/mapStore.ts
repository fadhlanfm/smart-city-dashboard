import { create } from 'zustand';
import { MapRef } from 'react-map-gl/maplibre';

interface MapState {
  activeBasemap: 'raster' | 'vector';
  layerVisibility: {
    heatmap: boolean;
    choropleth: boolean;
    poi: boolean;
  };
  selectedAssetId: string | null;
  detailAssetId: string | null;
  spatialMode: 'none' | 'buffer' | 'intersect';
  bufferRadius: number;
  bufferResult: any | null;
  intersectResult: any | null;
  mapRef: MapRef | null;
  
  setBasemap: (basemap: 'raster' | 'vector') => void;
  toggleLayer: (layer: 'heatmap' | 'choropleth' | 'poi') => void;
  selectAsset: (id: string | null) => void;
  openDetailModal: (id: string | null) => void;
  setSpatialMode: (mode: 'none' | 'buffer' | 'intersect') => void;
  setBufferRadius: (radius: number) => void;
  setBufferResult: (result: any) => void;
  setIntersectResult: (result: any) => void;
  setMapRef: (ref: MapRef | null) => void;
}

export const useMapStore = create<MapState>((set) => ({
  activeBasemap: 'vector',
  layerVisibility: {
    heatmap: true,
    choropleth: true,
    poi: true,
  },
  selectedAssetId: null,
  detailAssetId: null,
  spatialMode: 'none',
  bufferRadius: 500,
  bufferResult: null,
  intersectResult: null,
  mapRef: null,

  setBasemap: (basemap) => set({ activeBasemap: basemap }),
  toggleLayer: (layer) => set((state) => ({
    layerVisibility: {
      ...state.layerVisibility,
      [layer]: !state.layerVisibility[layer],
    }
  })),
  selectAsset: (id) => set({ selectedAssetId: id }),
  openDetailModal: (id) => set({ detailAssetId: id }),
  setSpatialMode: (mode) => set({ spatialMode: mode }),
  setBufferRadius: (radius) => set({ bufferRadius: radius }),
  setBufferResult: (result) => set({ bufferResult: result }),
  setIntersectResult: (result) => set({ intersectResult: result }),
  setMapRef: (ref) => set({ mapRef: ref }),
}));
