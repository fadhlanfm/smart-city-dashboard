"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Map, { Source, Layer, MapRef, MapLayerMouseEvent } from 'react-map-gl/maplibre';
import type { FillLayerSpecification, CircleLayerSpecification, HeatmapLayerSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStore } from '@/store/mapStore';
import { MarkerPopup } from './MarkerPopup';
import { GeoJSONFeatureCollection } from '@/lib/types';

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY && process.env.NEXT_PUBLIC_MAPTILER_KEY !== 'dummy_maptiler_key' 
  ? process.env.NEXT_PUBLIC_MAPTILER_KEY 
  : null;

const VECTOR_STYLE = MAPTILER_KEY 
  ? `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`
  : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const RASTER_STYLE = MAPTILER_KEY
  ? `https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_KEY}`
  : {
      version: 8,
      sources: {
        'osm': {
          type: 'raster',
          tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap Contributors',
        }
      },
      layers: [
        {
          id: 'osm',
          type: 'raster',
          source: 'osm',
        }
      ]
    } as any;

export function MapView() {
  const mapRef = useRef<MapRef>(null);
  const { 
    activeBasemap, 
    layerVisibility, 
    setMapRef, 
    selectAsset, 
    selectedAssetId,
    spatialMode,
    bufferRadius,
    bufferResult,
    intersectResult,
    setBufferResult,
    setIntersectResult
  } = useMapStore();
  
  const [districts, setDistricts] = useState<GeoJSONFeatureCollection | null>(null);
  const [assets, setAssets] = useState<GeoJSONFeatureCollection | null>(null);
  const [incidents, setIncidents] = useState<GeoJSONFeatureCollection | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    setMapRef(mapRef.current);
  }, [setMapRef]);

  const searchParams = useSearchParams();
  const urlAssetId = searchParams?.get('assetId');

  useEffect(() => {
    fetch('/api/districts/geojson').then(res => res.json()).then(setDistricts);
    fetch('/api/assets/geojson').then(res => res.json()).then(setAssets);
    fetch('/api/incidents/geojson').then(res => res.json()).then(setIncidents);
  }, []);

  // Handle URL parameter selection
  useEffect(() => {
    if (urlAssetId && assets && assets.features) {
      selectAsset(urlAssetId);
      
      const feature = (assets.features as any[]).find(f => f.properties.id === urlAssetId);
      if (feature && mapRef.current) {
        const [lng, lat] = feature.geometry.coordinates;
        mapRef.current.flyTo({ center: [lng, lat], zoom: 16, duration: 1500 });
      }
    }
  }, [urlAssetId, assets, selectAsset]);

  const choroplethLayer: FillLayerSpecification = {
    id: 'district-choropleth',
    type: 'fill',
    source: 'districts',
    paint: {
      'fill-color': [
        'interpolate',
        ['linear'],
        ['get', 'coverageScore'],
        0, '#ef4444', // Red for low score
        50, '#eab308', // Yellow for medium
        100, '#22c55e', // Green for high
      ],
      'fill-opacity': layerVisibility.choropleth ? 0.4 : 0,
    },
  };

  const heatmapLayer: HeatmapLayerSpecification = {
    id: 'incident-heatmap',
    type: 'heatmap',
    source: 'incidents',
    paint: {
      'heatmap-weight': 1,
      'heatmap-intensity': 1,
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(0,0,255,0)',
        0.2, 'royalblue',
        0.4, 'cyan',
        0.6, 'lime',
        0.8, 'yellow',
        1, 'red'
      ],
      'heatmap-radius': 30,
      'heatmap-opacity': layerVisibility.heatmap ? 0.8 : 0,
    },
  };

  const poiLayer: CircleLayerSpecification = {
    id: 'asset-poi',
    type: 'circle',
    source: 'assets',
    paint: {
      'circle-radius': 6,
      'circle-color': [
        'match',
        ['get', 'type'],
        'ROAD', '#3b82f6',
        'UTILITY', '#f59e0b',
        'PARK', '#10b981',
        'FACILITY', '#8b5cf6',
        '#64748b' // default
      ],
      'circle-stroke-width': 1,
      'circle-stroke-color': '#ffffff',
      'circle-opacity': layerVisibility.poi ? 1 : 0,
      'circle-stroke-opacity': layerVisibility.poi ? 1 : 0,
    },
  };

  const onClick = async (e: MapLayerMouseEvent) => {
    const features = e.features;
    
    if (spatialMode === 'buffer') {
      if (features && features.length > 0 && features[0].layer.id === 'asset-poi') {
        const assetId = features[0].properties.id;
        setIsCalculating(true);
        try {
          const res = await fetch('/api/spatial/buffer', {
            method: 'POST',
            body: JSON.stringify({ assetId, radiusMeters: bufferRadius })
          });
          const data = await res.json();
          if (data.data) {
            setBufferResult(data.data);
          }
        } catch (e) {
          console.error('Buffer error', e);
        } finally {
          setIsCalculating(false);
        }
      }
      return;
    }

    if (spatialMode === 'intersect') {
      setIsCalculating(true);
      try {
        const res = await fetch('/api/spatial/intersect', {
          method: 'POST',
          body: JSON.stringify({ lon: e.lngLat.lng, lat: e.lngLat.lat })
        });
        const data = await res.json();
        if (data.data) {
          setIntersectResult(data.data);
        }
      } catch (e) {
        console.error('Intersect error', e);
      } finally {
        setIsCalculating(false);
      }
      return;
    }

    // Default select
    if (features && features.length > 0) {
      const feature = features[0];
      if (feature.layer.id === 'asset-poi') {
        selectAsset(feature.properties.id);
      }
    } else {
      selectAsset(null);
    }
  };

  const cursorType = spatialMode === 'intersect' ? 'crosshair' : (layerVisibility.poi || spatialMode === 'buffer' ? 'pointer' : 'grab');

  return (
    <div className="w-full h-[600px] md:h-[800px] rounded-lg overflow-hidden border shadow-sm relative">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 107.61,
          latitude: -6.91,
          zoom: 13
        }}
        mapStyle={activeBasemap === 'vector' ? VECTOR_STYLE : RASTER_STYLE}
        interactiveLayerIds={spatialMode === 'buffer' || layerVisibility.poi ? ['asset-poi'] : []}
        onClick={onClick}
        cursor={cursorType}
      >
        {districts && (
          <Source id="districts" type="geojson" data={districts as any}>
            <Layer {...choroplethLayer} />
          </Source>
        )}

        {incidents && (
          <Source id="incidents" type="geojson" data={incidents as any}>
            <Layer {...heatmapLayer} />
          </Source>
        )}

        {assets && (
          <Source id="assets" type="geojson" data={assets as any}>
            <Layer {...poiLayer} />
          </Source>
        )}

        {bufferResult && spatialMode === 'buffer' && (
          <Source id="buffer" type="geojson" data={bufferResult.bufferGeoJSON}>
            <Layer 
              id="buffer-fill" 
              type="fill" 
              paint={{ 'fill-color': '#3b82f6', 'fill-opacity': 0.2 }} 
            />
            <Layer 
              id="buffer-line" 
              type="line" 
              paint={{ 'line-color': '#2563eb', 'line-width': 2, 'line-dasharray': [2, 2] }} 
            />
          </Source>
        )}

        {intersectResult && spatialMode === 'intersect' && (
          <Source id="intersect" type="geojson" data={intersectResult.pointGeoJSON}>
            <Layer 
              id="intersect-point" 
              type="circle" 
              paint={{
                'circle-radius': 8,
                'circle-color': '#ef4444',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff'
              }} 
            />
          </Source>
        )}

        {selectedAssetId && <MarkerPopup assetId={selectedAssetId} />}
      </Map>

      {isCalculating && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="bg-card text-card-foreground shadow-lg rounded-full px-6 py-3 flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary"></div>
            <span className="font-medium text-sm">Calculating spatial analytics...</span>
          </div>
        </div>
      )}
    </div>
  );
}
