import { NextRequest, NextResponse } from 'next/server';
import { getAssetDetail } from '@/lib/services/asset.service';
import { idSchema } from '@/lib/validators/id.schema';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const validation = idSchema.safeParse({ id });
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const asset = await getAssetDetail(validation.data.id);
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    return NextResponse.json({ data: asset });
  } catch (error) {
    console.error('Failed to get asset details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
