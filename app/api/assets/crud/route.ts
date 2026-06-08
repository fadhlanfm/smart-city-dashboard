import { NextResponse } from 'next/server';
import { createAsset } from '@/lib/services/asset.service';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // FR-001: Validate input (Basic validation for demo)
    if (!data.name || !data.type || !data.districtId || data.lon === undefined || data.lat === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = data.id || crypto.randomUUID();
    const asset = await createAsset({ ...data, id });

    return NextResponse.json({ success: true, asset }, { status: 201 });
  } catch (error: any) {
    console.error('Create asset error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
