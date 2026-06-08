import { NextRequest, NextResponse } from 'next/server';
import { bufferSchema } from '@/lib/validators/spatial.schema';
import { analyzeBuffer } from '@/lib/services/spatial.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = bufferSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid parameters', details: validation.error.format() }, { status: 400 });
    }

    const { assetId, radiusMeters } = validation.data;
    const result = await analyzeBuffer(assetId, radiusMeters);

    if (!result) {
      return NextResponse.json({ error: 'Asset not found or buffer computation failed' }, { status: 404 });
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Buffer analysis failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
