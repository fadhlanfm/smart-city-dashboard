import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getIncidentGeoJSON } from '@/lib/services/incident.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    
    const geojson = await getIncidentGeoJSON(params);
    return NextResponse.json(geojson);
  } catch (error) {
    console.error('Failed to get incident geojson:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
