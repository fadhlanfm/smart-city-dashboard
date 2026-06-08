import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { searchAssets } from '@/lib/services/search.service';
import { searchSchema } from '@/lib/validators/search.schema';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    
    if (!params.q) {
      return NextResponse.json({ error: 'Missing query parameter "q"' }, { status: 400 });
    }

    const validation = searchSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid parameters', details: validation.error.format() }, { status: 400 });
    }

    const results = await searchAssets(validation.data);
    
    return NextResponse.json({ data: results });
  } catch (error) {
    console.error('Failed to search assets:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
