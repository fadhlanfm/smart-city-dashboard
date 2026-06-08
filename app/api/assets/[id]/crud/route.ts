import { NextResponse } from 'next/server';
import { updateAsset, deleteAsset } from '@/lib/services/asset.service';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const asset = await updateAsset(params.id, data);
    return NextResponse.json({ success: true, asset });
  } catch (error: any) {
    console.error('Update asset error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await deleteAsset(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete asset error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
