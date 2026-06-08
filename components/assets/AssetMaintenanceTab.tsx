import React from 'react';
import { ExtendedAsset } from '@/lib/types';

export function AssetMaintenanceTab({ asset }: { asset: ExtendedAsset }) {
  if (!asset) return null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-center py-8">
        Maintenance history is not implemented in this version.
      </p>
    </div>
  );
}
