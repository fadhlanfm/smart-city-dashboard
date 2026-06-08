import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getFilteredAssets } from '@/lib/services/asset.service';
import { filterSchema } from '@/lib/validators/filter.schema';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    
    const validation = filterSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid parameters', details: validation.error.format() }, { status: 400 });
    }

    const result = await getFilteredAssets(validation.data);
    
    const response = NextResponse.json(result);
    response.headers.set('X-Cache', 'HIT'); // Simplified for now
    return response;
  } catch (error) {
    console.error('Failed to get assets:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
