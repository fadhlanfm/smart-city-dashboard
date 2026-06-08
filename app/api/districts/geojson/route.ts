import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getDistrictGeoJSON } from '@/lib/services/district.service';

export async function GET() {
  try {
    const geojson = await getDistrictGeoJSON();
    return NextResponse.json(geojson);
  } catch (error) {
    console.error('Failed to get district geojson:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
