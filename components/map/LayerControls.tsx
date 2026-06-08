"use client";

import React from 'react';
import { useMapStore } from '@/store/mapStore';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { InfoTooltip } from '@/components/ui/info-tooltip';

export function LayerControls() {
  const { layerVisibility, toggleLayer } = useMapStore();

  return (
    <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg shadow-sm border w-64 space-y-4">
      <h3 className="font-semibold text-sm">Map Layers</h3>
      
      <div className="flex items-center justify-between">
        <Label htmlFor="poi-layer" className="cursor-pointer">
          <InfoTooltip label="Asset POIs" info="Points of Interest. Shows where specific city assets (like a camera or a park) are located." />
        </Label>
        <Switch 
          id="poi-layer" 
          checked={layerVisibility.poi} 
          onCheckedChange={() => toggleLayer('poi')} 
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="heatmap-layer" className="cursor-pointer">
          <InfoTooltip label="Incident Heatmap" info="Shows areas with many reported incidents as glowing 'hot' colors. Great for spotting problem areas at a glance." />
        </Label>
        <Switch 
          id="heatmap-layer" 
          checked={layerVisibility.heatmap} 
          onCheckedChange={() => toggleLayer('heatmap')} 
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="choropleth-layer" className="cursor-pointer">
          <InfoTooltip label="District Choropleth" info="Colors each district based on the number of assets inside it. Darker color = more assets in that area." />
        </Label>
        <Switch 
          id="choropleth-layer" 
          checked={layerVisibility.choropleth} 
          onCheckedChange={() => toggleLayer('choropleth')} 
        />
      </div>
    </div>
  );
}
