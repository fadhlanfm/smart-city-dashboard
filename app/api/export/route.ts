import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { searchAssets } from '@/lib/services/search.service';
import { searchSchema } from '@/lib/validators/search.schema';
import { SearchHit } from '@/lib/types';

function escapeCsv(val: string | number | null | undefined) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Default search parameters if not provided
    if (!params.q) params.q = ''; // Empty string means match_all in some logic or we handle it
    
    // We want to fetch a large amount of records for export, not paginated
    // Let's force size to 10000
    const exportParams = { ...params, size: 10000 };
    
    // If q is empty, we must bypass the strict search schema or supply a wildcard
    // Our searchSchema requires q to be string min 1, but here we might want all data.
    // Wait, the current searchAssets requires `q` to be passed, but let's see. 
    // If no `q` is passed, `searchAssets` does `multi_match`. 
    // Actually, `searchSchema` says `q: z.string().min(1).max(200)`.
    // Let's just bypass zod if we want all data, or require `q`.
    // In our app, if the search bar is empty, it does not call the search API, it calls `/api/dashboard/summary`.
    // But wait, the export button is for the DataTable which shows ALL data filtered!
    
    // Let's modify the search logic directly here for exporting
    const { mockAssets } = await import('@/lib/mock-data');
    let filtered = mockAssets;

    if (params.q) {
      const q = params.q.toLowerCase();
      filtered = filtered.filter(a => a.name.toLowerCase().includes(q) || a.districtName.toLowerCase().includes(q));
    }
    if (params.districtId) filtered = filtered.filter(a => a.districtId === params.districtId);
    if (params.type) filtered = filtered.filter(a => a.type === params.type);
    if (params.status) filtered = filtered.filter(a => a.status === params.status);

    const records = filtered.map(a => ({
      id: a.id,
      name: a.name,
      type: a.type,
      status: a.status,
      district: a.districtName,
      districtId: a.districtId,
      lon: a.location.coordinates[0],
      lat: a.location.coordinates[1],
    }));

    const format = params.format || 'csv';

    if (format === 'geojson') {
      const featureCollection = {
        type: 'FeatureCollection',
        features: records.map((r) => ({
          type: 'Feature',
          geometry: r.lon && r.lat ? { type: 'Point', coordinates: [r.lon, r.lat] } : null,
          properties: {
            id: r.id,
            name: r.name,
            type: r.type,
            status: r.status,
            district: r.district
          }
        }))
      };
      
      return new NextResponse(JSON.stringify(featureCollection), {
        headers: {
          'Content-Type': 'application/geo+json',
          'Content-Disposition': 'attachment; filename="export.geojson"'
        }
      });
    } else {
      // Default to CSV
      const headers = ['ID', 'Name', 'Type', 'Status', 'District', 'Longitude', 'Latitude'];
      const csvRows = [headers.join(',')];
      
      for (const r of records) {
        const row = [r.id, r.name, r.type, r.status, r.district, r.lon, r.lat].map(escapeCsv);
        csvRows.push(row.join(','));
      }
      
      return new NextResponse(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="export.csv"'
        }
      });
    }

  } catch (error) {
    console.error('Failed to export data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
