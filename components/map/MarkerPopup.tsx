"use client";

import React, { useEffect, useState } from 'react';
import { Popup } from 'react-map-gl/maplibre';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMapStore } from '@/store/mapStore';
import { ExtendedAsset } from '@/lib/types';

interface MarkerPopupProps {
  assetId: string;
}

export function MarkerPopup({ assetId }: MarkerPopupProps) {
  const { selectAsset, openDetailModal } = useMapStore();
  const [data, setData] = useState<ExtendedAsset | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch(`/api/assets/${assetId}`)
      .then(res => res.json())
      .then(resData => {
        if (isMounted && resData.data) {
          setData(resData.data);
        }
      })
      .catch(console.error);

    return () => { isMounted = false; };
  }, [assetId]);

  if (!data) return null;

  return (
    <Popup
      longitude={(data.geometry?.coordinates as number[])?.[0] || 0}
      latitude={(data.geometry?.coordinates as number[])?.[1] || 0}
      anchor="bottom"
      onClose={() => selectAsset(null)}
      closeOnClick={false}
      className="z-50"
    >
      <div id="tour-poi-popup" className="p-1 min-w-[200px]">
        <h4 className="font-semibold text-sm mb-1">{data.name}</h4>
        <div className="flex gap-2 mb-2">
          <Badge variant="outline" className="text-[10px]">{data.type}</Badge>
          <Badge className="text-[10px]">{data.status}</Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-3">{data.district?.name} District</p>
        <Button 
          size="sm" 
          className="w-full text-xs" 
          onClick={() => {
            openDetailModal(assetId);
          }}
        >
          View Details
        </Button>
      </div>
    </Popup>
  );
}
