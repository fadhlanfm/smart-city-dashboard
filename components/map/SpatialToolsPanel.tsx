"use client";

import React, { useState } from 'react';
import { useMapStore } from '@/store/mapStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Ruler, Crosshair, X } from 'lucide-react';
import { InfoTooltip } from '@/components/ui/info-tooltip';

export function SpatialToolsPanel() {
  const { 
    spatialMode, 
    setSpatialMode, 
    bufferRadius, 
    setBufferRadius,
    bufferResult,
    intersectResult,
    setBufferResult,
    setIntersectResult
  } = useMapStore();

  const handleClose = () => {
    setSpatialMode('none');
    setBufferResult(null);
    setIntersectResult(null);
  };

  return (
    <Card className="w-80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          Spatial Analytics
        </CardTitle>
        {spatialMode !== 'none' && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        
        <div className="flex gap-2">
          <Button 
            variant={spatialMode === 'buffer' ? 'default' : 'outline'} 
            size="sm" 
            className="flex-1"
            onClick={() => setSpatialMode('buffer')}
          >
            <Ruler className="h-4 w-4 mr-2" /> 
            <InfoTooltip label="Buffer" info="Draws a magic circle around a point to find everything nearby." />
          </Button>
          <Button 
            variant={spatialMode === 'intersect' ? 'default' : 'outline'} 
            size="sm" 
            className="flex-1"
            onClick={() => setSpatialMode('intersect')}
          >
            <Crosshair className="h-4 w-4 mr-2" /> 
            <InfoTooltip label="Intersect" info="Finds out exactly which district or boundary a specific point belongs to." />
          </Button>
        </div>

        {spatialMode === 'buffer' && (
          <div className="space-y-3 pt-2">
            <div className="flex justify-between text-xs">
              <span>Radius</span>
              <span className="font-medium">{bufferRadius}m</span>
            </div>
            <Slider 
              value={[bufferRadius]} 
              min={50} 
              max={2000} 
              step={50} 
              onValueChange={(vals) => setBufferRadius(vals[0])} 
            />
            <p className="text-xs text-muted-foreground">
              Click any asset marker on the map to generate a buffer and find nearby assets.
            </p>
            {bufferResult && (
              <div className="mt-2 text-xs bg-muted/50 p-2 rounded">
                Found <strong>{bufferResult.affectedAssets?.length || 0}</strong> assets within {bufferRadius}m.
              </div>
            )}
          </div>
        )}

        {spatialMode === 'intersect' && (
          <div className="space-y-3 pt-2">
            <p className="text-xs text-muted-foreground">
              Click anywhere on the map to query intersection geometry.
            </p>
            {intersectResult && (
              <div className="mt-2 text-xs bg-muted/50 p-2 rounded space-y-1">
                <p><strong>Districts Found:</strong></p>
                {intersectResult.districts?.map((d: { id: string, name: string }) => (
                  <Badge key={d.id} variant="outline" className="mr-1">{d.name}</Badge>
                ))}
              </div>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  );
}
