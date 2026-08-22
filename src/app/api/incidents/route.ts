import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Incident from '@/models/Incident';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minConfidence = searchParams.get('minConfidence');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Check if we want all documents (e.g. for CSV export)
    const all = searchParams.get('all') === 'true';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      query.videoSource = { $regex: search, $options: 'i' };
    }
    if (minConfidence) {
      query.confidence = { $gte: parseFloat(minConfidence) };
    }
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.timestamp.$lte = end;
      }
    }

    if (all) {
      const incidents = await Incident.find(query).sort({ timestamp: -1 });
      return NextResponse.json({ incidents });
    }

    const skip = (page - 1) * limit;
    const total = await Incident.countDocuments(query);
    const incidents = await Incident.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      incidents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error in GET /api/incidents:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { 
      incidentId, 
      timestamp, 
      videoSource, 
      frameNumber, 
      confidence, 
      category, 
      boundingBox, 
      status 
    } = body;

    const newIncident = new Incident({
      incidentId: incidentId || undefined,
      timestamp: timestamp ? new Date(timestamp) : undefined,
      videoSource,
      frameNumber: frameNumber !== undefined ? frameNumber : Math.floor(Math.random() * 401) + 100,
      confidence: confidence !== undefined ? confidence : parseFloat((Math.random() * 0.29 + 0.70).toFixed(2)),
      category: category || (confidence > 0.85 ? 'Accident' : 'Non-Accident'),
      boundingBox: boundingBox || { x: 120, y: 80, width: 200, height: 150 },
      status: status || 'Detected'
    });

    await newIncident.save();
    return NextResponse.json(newIncident, { status: 201 });
  } catch (error) {
    const err = error as Error;
    console.error('Error in POST /api/incidents:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
