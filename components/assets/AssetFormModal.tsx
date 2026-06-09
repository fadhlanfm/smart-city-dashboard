"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import Map, { Marker, MapLayerMouseEvent } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import { ExtendedAsset } from '@/lib/types';

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY && process.env.NEXT_PUBLIC_MAPTILER_KEY !== 'dummy_maptiler_key' 
  ? process.env.NEXT_PUBLIC_MAPTILER_KEY 
  : null;

const VECTOR_STYLE = MAPTILER_KEY 
  ? `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`
  : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset?: ExtendedAsset | null; // If null, it's a create. If object, it's an edit.
  onSuccess: () => void;
}

export function AssetFormModal({ isOpen, onClose, asset, onSuccess }: AssetFormModalProps) {
  const [districts, setDistricts] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    status: '',
    districtId: '',
    lon: 107.6191, // Default Bandung
    lat: -6.9175,
    tags: [] as string[],
  });

  useEffect(() => {
    fetch('/api/districts')
      .then(res => res.json())
      .then(resData => {
        if (resData && Array.isArray(resData.data)) {
          setDistricts(resData.data);
        } else if (Array.isArray(resData)) {
          setDistricts(resData);
        } else {
          setDistricts([]);
          console.error("Invalid districts response:", resData);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (asset) {
      let geom = asset.geometry;
      if (typeof geom === 'string') {
        try { geom = JSON.parse(geom); } catch (e) {}
      }
      setFormData({
        name: asset.name || '',
        type: asset.type || '',
        status: asset.status || '',
        districtId: asset.districtId || '',
        lon: (geom?.coordinates as number[])?.[0] || 107.6191,
        lat: (geom?.coordinates as number[])?.[1] || -6.9175,
        tags: asset.tags || [],
      });
    } else {
      setFormData({
        name: '',
        type: 'POI',
        status: 'ACTIVE',
        districtId: '',
        lon: 107.6191,
        lat: -6.9175,
        tags: [],
      });
    }
  }, [asset, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMapClick = (e: MapLayerMouseEvent) => {
    setFormData(prev => ({ 
      ...prev, 
      lon: Number(e.lngLat.lng.toFixed(6)), 
      lat: Number(e.lngLat.lat.toFixed(6)) 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type || !formData.status || !formData.districtId) {
      toast.error('Please fill in all required fields (Name, Type, Status, District).');
      return;
    }
    
    setLoading(true);
    try {
      const url = asset ? `/api/assets/${asset.id}/crud` : '/api/assets/crud';
      const method = asset ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          lon: parseFloat(String(formData.lon).replace(',', '.')),
          lat: parseFloat(String(formData.lat).replace(',', '.'))
        })
      });

      if (!res.ok) throw new Error('Failed to save asset');
      
      toast.success(asset ? 'Asset updated successfully' : 'Asset created successfully');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'An error occurred');
      } else {
        toast.error('An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onClose();
      if (!open) window.dispatchEvent(new Event('tour-asset-modal-closed'));
    }}>
      <DialogContent id="tour-asset-form" className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{asset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-2">
            <Label htmlFor="name">Asset Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(val) => handleSelectChange('type', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ROAD">Road</SelectItem>
                  <SelectItem value="UTILITY">Utility</SelectItem>
                  <SelectItem value="PARK">Park</SelectItem>
                  <SelectItem value="FACILITY">Facility</SelectItem>
                  <SelectItem value="POI">Point of Interest (POI)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(val) => handleSelectChange('status', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="DECOMMISSIONED">Decommissioned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="districtId">District</Label>
            <Select value={formData.districtId} onValueChange={(val) => handleSelectChange('districtId', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent>
                {districts.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lon">Longitude</Label>
              <Input id="lon" name="lon" type="number" step="any" value={formData.lon} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lat">Latitude</Label>
              <Input id="lat" name="lat" type="number" step="any" value={formData.lat} onChange={handleChange} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Pick Location on Map
            </Label>
            <div className="h-48 w-full rounded-md border overflow-hidden relative">
              <Map
                initialViewState={{
                  longitude: formData.lon,
                  latitude: formData.lat,
                  zoom: 13
                }}
                mapStyle={VECTOR_STYLE}
                onClick={handleMapClick}
                cursor="crosshair"
              >
                <Marker 
                  longitude={formData.lon} 
                  latitude={formData.lat} 
                  color="var(--primary)" 
                />
              </Map>
            </div>
            <p className="text-xs text-muted-foreground">
              Click anywhere on the map to automatically update the latitude and longitude.
            </p>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => {
              onClose();
              window.dispatchEvent(new Event('tour-asset-modal-closed'));
            }} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {asset ? 'Save Changes' : 'Create Asset'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
