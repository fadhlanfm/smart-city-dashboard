import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getAllDistricts } from '@/lib/services/district.service';

export async function GET() {
  try {
    const result = await getAllDistricts();
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Failed to get districts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
