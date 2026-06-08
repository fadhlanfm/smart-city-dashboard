import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ExtendedAsset, IncidentDocument } from '@/lib/types';

export function AssetIncidentsTab({ asset }: { asset: ExtendedAsset }) {
  if (!asset || !asset.recentIncidents) return null;

  const incidents = asset.recentIncidents;

  if (incidents.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-muted-foreground">No recent incidents reported for this asset.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {incidents.map((incident: IncidentDocument) => (
        <Card key={incident.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <Badge variant={incident.status === 'OPEN' ? 'destructive' : 'secondary'}>
                  {incident.status}
                </Badge>
                <Badge variant="outline">{incident.severity}</Badge>
                <Badge variant="outline">{incident.type}</Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                {incident.createdAt ? format(new Date(incident.createdAt), 'MMM d, yyyy') : 'Unknown Date'}
              </span>
            </div>
            <p className="text-sm">{incident.description || 'No description available.'}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
