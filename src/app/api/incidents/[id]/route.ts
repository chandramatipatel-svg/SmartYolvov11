import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Incident from '@/models/Incident';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const incident = await Incident.findById(params.id);
    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }
    return NextResponse.json(incident);
  } catch (error) {
    const err = error as Error;
    console.error(`Error in GET /api/incidents/${params.id}:`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
