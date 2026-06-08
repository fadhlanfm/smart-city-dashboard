import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getAssetGeoJSON } from '@/lib/services/asset.service';
import { filterSchema } from '@/lib/validators/filter.schema';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Validate params but omit pagination for geojson export
    const validation = filterSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid parameters', details: validation.error.format() }, { status: 400 });
    }

    const geojson = await getAssetGeoJSON(validation.data as any);
    
    return NextResponse.json(geojson);
  } catch (error) {
    console.error('Failed to get asset geojson:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
