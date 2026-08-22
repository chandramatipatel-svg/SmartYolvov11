'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Bell,
  Video,
  Activity,
  ArrowUpRight,
  RefreshCw,
  Clock,
  Eye
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface StatsData {
  totalAccidents: number;
  alertsToday: number;
  videosProcessed: number;
  avgConfidence: number;
  last7Days: { date: string; count: number }[];
  ratio: {
    accidents: number;
    nonAccidents: number;
    total: number;
  };
}

interface IncidentRecord {
  _id: string;
  incidentId: string;
  timestamp: string;
  videoSource: string;
  frameNumber: number;
  confidence: number;
  category: 'Accident' | 'Non-Accident';
  status: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentIncidents, setRecentIncidents] = useState<IncidentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const fetchDashboardData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      // Fetch stats
      const statsRes = await fetch('/api/stats');
      const statsJson = await statsRes.json();
      setStats(statsJson);

      // Fetch recent incidents (limit 5)
      const incidentsRes = await fetch('/api/incidents?limit=5');
      const incidentsJson = await incidentsRes.json();
      setRecentIncidents(incidentsJson.incidents || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setCountdown(30);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();

    // Auto refresh every 30 seconds
    const intervalId = setInterval(() => {
      fetchDashboardData(true);
    }, 30000);

    // Countdown timer
    const countdownId = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 30));
    }, 1000);

    return () => {
      clearInterval(intervalId);
      clearInterval(countdownId);
    };
  }, []);

  const formatPercent = (val: number) => {
    return `${(val * 100).toFixed(1)}%`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Recharts color palettes
  const PIE_COLORS = ['#ef4444', '#22c55e'];

  const getPieData = () => {
    if (!stats) return [];
    return [
      { name: 'Accident', value: stats.ratio.accidents },
      { name: 'Non-Accident', value: stats.ratio.nonAccidents }
    ];
  };

  const getBarData = () => {
    if (!stats) return [];
    return stats.last7Days.map((item) => {
      const parts = item.date.split('-');
      const formattedDate = `${parts[1]}/${parts[2]}`; // MM/DD
      return {
        date: formattedDate,
        'Accidents Detected': item.count
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">System Dashboard</h1>
          <p className="text-slate-500 mt-1">Real-time status updates and emergency analytics telemetry.</p>
        </div>
        
        {/* Refresh Badge */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200">
            <Clock className="w-3.5 h-3.5" />
            Auto-refresh in <span className="text-red-500 w-4 inline-block text-center">{countdown}</span>s
          </div>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={isRefreshing}
            className="p-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 text-xs font-semibold disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync Now
          </button>
        </div>
      </div>

      {loading && !stats ? (
        // Loading Shimmer Skeletons
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-xl border border-slate-200 bg-white p-6 shimmer" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 rounded-xl border border-slate-200 bg-white shimmer" />
            <div className="h-96 rounded-xl border border-slate-200 bg-white shimmer" />
          </div>
        </div>
      ) : (
        <>
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Accidents */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Accidents</span>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{stats?.totalAccidents}</h3>
                <span className="text-[10px] text-red-500 font-semibold bg-red-50 px-1.5 py-0.5 rounded mt-1 inline-block">Active Records</span>
              </div>
              <div className="p-4 bg-red-50 text-red-500 rounded-xl border border-red-100">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>

            {/* Alerts Today */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alerts Today</span>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{stats?.alertsToday}</h3>
                <span className="text-[10px] text-orange-500 font-semibold bg-orange-50 px-1.5 py-0.5 rounded mt-1 inline-block">Broadcasted</span>
              </div>
              <div className="p-4 bg-orange-50 text-orange-500 rounded-xl border border-orange-100">
                <Bell className="w-6 h-6" />
              </div>
            </div>

            {/* Videos Processed */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Videos Processed</span>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{stats?.videosProcessed}</h3>
                <span className="text-[10px] text-blue-500 font-semibold bg-blue-50 px-1.5 py-0.5 rounded mt-1 inline-block">Camera Sources</span>
              </div>
              <div className="p-4 bg-blue-50 text-blue-50 rounded-xl border border-blue-100">
                <Video className="w-6 h-6" />
              </div>
            </div>

            {/* Avg Confidence Score */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Confidence</span>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
                  {stats ? formatPercent(stats.avgConfidence) : '0%'}
                </h3>
                <span className="text-[10px] text-green-500 font-semibold bg-green-50 px-1.5 py-0.5 rounded mt-1 inline-block">YOLOv11 Accuracy</span>
              </div>
              <div className="p-4 bg-emerald-50 text-emerald-500 rounded-xl border border-emerald-100">
                <Activity className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Incident Table & Ratio Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recent Incidents Table */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
              <div>
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">Recent Incidents</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Most recent anomalies flagged by the detection network.</p>
                  </div>
                  <Link
                    href="/incidents"
                    className="text-xs font-bold text-red-600 hover:text-red-500 transition-colors flex items-center gap-1 hover:underline"
                  >
                    View All Incidents
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/70 text-slate-500 text-xs font-bold uppercase border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-5">Incident ID</th>
                        <th className="py-3 px-5">Timestamp</th>
                        <th className="py-3 px-5">Source File</th>
                        <th className="py-3 px-5">Confidence</th>
                        <th className="py-3 px-5">Category</th>
                        <th className="py-3 px-5">Status</th>
                        <th className="py-3 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentIncidents.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                            No incident reports found.
                          </td>
                        </tr>
                      ) : (
                        recentIncidents.map((incident) => (
                          <tr key={incident._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-5 font-mono text-xs font-bold text-slate-900">
                              {incident.incidentId.slice(0, 8)}...
                            </td>
                            <td className="py-3.5 px-5 text-slate-500 text-xs">
                              {formatDate(incident.timestamp)}
                            </td>
                            <td className="py-3.5 px-5 font-medium text-slate-700 text-xs max-w-[140px] truncate">
                              {incident.videoSource}
                            </td>
                            <td className="py-3.5 px-5 text-slate-700 text-xs font-bold">
                              {formatPercent(incident.confidence)}
                            </td>
                            <td className="py-3.5 px-5">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-extrabold leading-none ${
                                incident.category === 'Accident' 
                                  ? 'bg-red-50 text-red-600 border border-red-100' 
                                  : 'bg-green-50 text-green-600 border border-green-100'
                              }`}>
                                {incident.category}
                              </span>
                            </td>
                            <td className="py-3.5 px-5">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-extrabold leading-none ${
                                incident.category === 'Accident' 
                                  ? 'bg-red-100 text-red-800 border border-red-200' 
                                  : 'bg-green-100 text-green-800 border border-green-200'
                              }`}>
                                {incident.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              <Link
                                href={`/incidents/${incident._id}`}
                                className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-red-600 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" /> Details
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50/40 border-t border-slate-100 text-center">
                <span className="text-xs text-slate-500">
                  Showing last {recentIncidents.length} incident recordings
                </span>
              </div>
            </div>

            {/* Pie Chart: Accident vs Non-Accident Ratio */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col justify-between h-full min-h-[350px]">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Distribution Ratio</h3>
                <p className="text-slate-500 text-xs mt-0.5">Ratio of classified Accidents vs False Alarms.</p>
              </div>

              <div className="h-56 w-full flex items-center justify-center">
                {mounted && stats && stats.ratio.total > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getPieData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getPieData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} incidents`, 'Count']}
                        contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-slate-400 text-sm">No data available for display</div>
                )}
              </div>

              <div className="flex justify-around border-t border-slate-100 pt-4 text-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Accidents</span>
                  <div className="text-lg font-extrabold text-red-500">{stats?.ratio.accidents}</div>
                </div>
                <div className="border-l border-slate-100" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Non-Accidents</span>
                  <div className="text-lg font-extrabold text-green-500">{stats?.ratio.nonAccidents}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bar Chart: Last 7 Days Accident Frequency */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="mb-6">
              <h3 className="font-extrabold text-lg text-slate-900">7-Day Incident Frequency</h3>
              <p className="text-slate-500 text-xs mt-0.5">Accident detections recorded per day over the last week.</p>
            </div>
            
            <div className="h-80 w-full">
              {mounted && stats && stats.last7Days.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getBarData()}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar 
                      dataKey="Accidents Detected" 
                      fill="#ef4444" 
                      radius={[4, 4, 0, 0]} 
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  No data available for display
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
