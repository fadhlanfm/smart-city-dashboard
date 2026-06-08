'use client';

import React from 'react';
import { MapView } from '@/components/map/MapView';
import { BasemapSwitcher } from '@/components/map/BasemapSwitcher';
import { LayerControls } from '@/components/map/LayerControls';
import { SpatialToolsPanel } from '@/components/map/SpatialToolsPanel';
import { AssetDetailModal } from '@/components/assets/AssetDetailModal';
import { useMapStore } from '@/store/mapStore';

export default function MapPage() {
  const { detailAssetId, openDetailModal } = useMapStore();

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 relative">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Interactive Map</h1>
      </div>
      
      <div className="flex-1 relative rounded-lg overflow-hidden border shadow-sm">
        <MapView />
        
        {/* Floating UI Elements over the map */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-4">
          <div id="tour-basemap">
            <BasemapSwitcher />
          </div>
          <div id="tour-layer-controls">
            <LayerControls />
          </div>
        </div>
        
        {/* Spatial Tools Panel */}
        <div id="tour-spatial-tools" className="absolute top-4 right-4 z-10">
          <SpatialToolsPanel />
        </div>
      </div>

      <AssetDetailModal 
        assetId={detailAssetId} 
        isOpen={!!detailAssetId} 
        onClose={() => openDetailModal(null)} 
      />
    </div>
  );
}
