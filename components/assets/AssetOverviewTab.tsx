import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

import { ExtendedAsset } from '@/lib/types';

export function AssetOverviewTab({ asset }: { asset: ExtendedAsset }) {
  if (!asset) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
          <Badge variant={asset.status === 'ACTIVE' ? 'default' : 'secondary'}>{asset.status}</Badge>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Type</h4>
          <Badge variant="outline">{asset.type}</Badge>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">District</h4>
          <p className="text-sm font-medium">{asset.district?.name} ({asset.district?.code})</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Location</h4>
          <p className="text-sm font-medium">{asset.address || 'N/A'}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
        <p className="text-sm">{asset.description || 'No description provided.'}</p>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Metadata</h4>
        <Card>
          <CardContent className="p-4 text-xs font-mono bg-muted/50 rounded-md">
            {JSON.stringify(asset.metadata || {}, null, 2)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
