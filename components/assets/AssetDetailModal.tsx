"use client";

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { ExtendedAsset } from '@/lib/types';

import { AssetOverviewTab } from './AssetOverviewTab';
import { AssetMaintenanceTab } from './AssetMaintenanceTab';
import { AssetIncidentsTab } from './AssetIncidentsTab';

import { AssetDocsTab } from './AssetDocsTab';

interface AssetDetailModalProps {
  assetId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AssetDetailModal({ assetId, isOpen, onClose }: AssetDetailModalProps) {
  const [asset, setAsset] = useState<ExtendedAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && assetId) {
      window.dispatchEvent(new Event('tour-asset-detail-opened'));
      setIsLoading(true);
      
      let localFound = false;
      try {
        const localStr = localStorage.getItem('mock_new_assets');
        if (localStr) {
          const localAssets = JSON.parse(localStr);
          const localAsset = localAssets.find((a: any) => a.id === assetId);
          if (localAsset) {
             setAsset(localAsset);
             setIsLoading(false);
             localFound = true;
          }
        }
      } catch(e) {}

      if (!localFound) {
        fetch(`/api/assets/${assetId}`)
          .then(res => res.json())
          .then(data => {
            if (data.data) setAsset(data.data);
          })
          .finally(() => setIsLoading(false));
      }
    } else {
      setAsset(null);
    }
  }, [assetId, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onClose();
      if (!open) window.dispatchEvent(new Event('tour-asset-detail-closed'));
    }}>
      <DialogContent id="tour-asset-detail" className="max-w-3xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : asset?.name || 'Asset Details'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-6 pt-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : asset ? (
            <Tabs defaultValue="overview" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="incidents">Incidents</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                <TabsTrigger value="docs">Docs & Photos</TabsTrigger>
              </TabsList>
              
              <ScrollArea className="flex-1 pr-4">
                <TabsContent value="overview" className="m-0">
                  <AssetOverviewTab asset={asset} />
                </TabsContent>
                <TabsContent value="incidents" className="m-0">
                  <AssetIncidentsTab asset={asset} />
                </TabsContent>
                <TabsContent value="maintenance" className="m-0">
                  <AssetMaintenanceTab asset={asset} />
                </TabsContent>
                <TabsContent value="docs" className="m-0">
                  <AssetDocsTab asset={asset} />
                </TabsContent>
              </ScrollArea>
            </Tabs>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Asset data could not be loaded.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
