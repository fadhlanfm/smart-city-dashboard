import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getAssetSummary } from '@/lib/services/asset.service';
import { filterSchema } from '@/lib/validators/filter.schema';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    
    const validation = filterSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid parameters', details: validation.error.format() }, { status: 400 });
    }

    const result = await getAssetSummary(validation.data);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to get asset summary:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
