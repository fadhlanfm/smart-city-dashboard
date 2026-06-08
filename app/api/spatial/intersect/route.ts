import { NextRequest, NextResponse } from 'next/server';
import { intersectSchema } from '@/lib/validators/spatial.schema';
import { checkIntersection } from '@/lib/services/spatial.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = intersectSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid parameters', details: validation.error.format() }, { status: 400 });
    }

    const { lon, lat } = validation.data;
    const result = await checkIntersection(lon, lat);

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Intersection check failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
