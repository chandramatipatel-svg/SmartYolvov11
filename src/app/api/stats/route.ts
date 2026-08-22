import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Incident from '@/models/Incident';

export async function GET() {
  try {
    await dbConnect();

    // 1. Total Accidents
    const totalAccidents = await Incident.countDocuments({ category: 'Accident' });

    // 2. Alerts today (Accidents detected today)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const alertsToday = await Incident.countDocuments({
      category: 'Accident',
      timestamp: { $gte: startOfToday, $lte: endOfToday }
    });

    // 3. Videos processed (Unique video source counts)
    const uniqueVideos = await Incident.distinct('videoSource');
    const videosProcessed = uniqueVideos.length;

    // 4. Avg Confidence Score
    const avgConfResult = await Incident.aggregate([
      {
        $group: {
          _id: null,
          avgConf: { $avg: '$confidence' }
        }
      }
    ]);
    const avgConfidence = avgConfResult.length > 0 ? avgConfResult[0].avgConf : 0;

    // 5. Last 7 days data (including today)
    const last7Days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);

      const count = await Incident.countDocuments({
        category: 'Accident',
        timestamp: { $gte: startOfDay, $lte: endOfDay }
      });

      last7Days.push({ date: dateStr, count });
    }

    // 6. Pie chart data: Accident vs Non-Accident ratio
    const totalIncidentsCount = await Incident.countDocuments({});
    const nonAccidents = await Incident.countDocuments({ category: 'Non-Accident' });

    return NextResponse.json({
      totalAccidents,
      alertsToday,
      alertsSentToday: alertsToday,
      videosProcessed,
      avgConfidence,
      averageConfidence: avgConfidence,
      last7Days,
      ratio: {
        accidents: totalAccidents,
        nonAccidents,
        total: totalIncidentsCount
      }
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error in GET /api/stats:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
