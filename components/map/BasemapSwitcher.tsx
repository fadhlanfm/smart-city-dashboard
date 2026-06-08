"use client";

import React from 'react';
import { useMapStore } from '@/store/mapStore';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Map, Image as ImageIcon } from 'lucide-react';
import { InfoTooltip } from '@/components/ui/info-tooltip';

export function BasemapSwitcher() {
  const { activeBasemap, setBasemap } = useMapStore();

  return (
    <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 rounded-lg shadow-sm border inline-flex">
      <ToggleGroup type="single" value={activeBasemap} onValueChange={(val) => val && setBasemap(val as 'raster' | 'vector')}>
        <ToggleGroupItem value="vector" aria-label="Vector Map">
          <Map className="h-4 w-4 mr-2" />
          <InfoTooltip label="Streets" info="A clean, styled map similar to Google Maps Streets." />
        </ToggleGroupItem>
        <ToggleGroupItem value="raster" aria-label="Satellite Map">
          <ImageIcon className="h-4 w-4 mr-2" />
          <InfoTooltip label="Satellite" info="Real photographic imagery taken from space." />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
