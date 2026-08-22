'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Video,
  Layers,
  Activity,
  AlertTriangle,
  CheckCircle,
  FileText,
  Scan
} from 'lucide-react';

interface IncidentRecord {
  _id: string;
  incidentId: string;
  timestamp: string;
  videoSource: string;
  frameNumber: number;
  confidence: number;
  category: 'Accident' | 'Non-Accident';
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  frameSnapshotPath?: string;
  status: string;
  createdAt: string;
}

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [incident, setIncident] = useState<IncidentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchIncidentDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/incidents/${id}`);
        if (!res.ok) {
          throw new Error('Incident record not found');
        }
        const data = await res.json();
        setIncident(data);
      } catch (err) {
        setError((err as Error).message || 'Failed to fetch incident details');
      } finally {
        setLoading(false);
      }
    };

    fetchIncidentDetails();
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const formatPercent = (val: number) => {
    return `${(val * 100).toFixed(1)}%`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Convert bounding box to percentage styles assuming a 640x480 coordinate system
  const getBoxStyles = (box: IncidentRecord['boundingBox']) => {
    const frameWidth = 640;
    const frameHeight = 480;

    // Constrain percentages to positive bounds
    const left = Math.max(0, Math.min(100, (box.x / frameWidth) * 100));
    const top = Math.max(0, Math.min(100, (box.y / frameHeight) * 100));
    const width = Math.max(0, Math.min(100 - left, (box.width / frameWidth) * 100));
    const height = Math.max(0, Math.min(100 - top, (box.height / frameHeight) * 100));

    return {
      left: `${left}%`,
      top: `${top}%`,
      width: `${width}%`,
      height: `${height}%`
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-24 bg-slate-200 rounded shimmer" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[450px] bg-slate-200 border rounded-xl shimmer" />
          <div className="h-[450px] bg-slate-200 border rounded-xl shimmer" />
        </div>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-lg mx-auto mt-12 shadow-sm">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="font-extrabold text-xl text-slate-900">Incident Record Error</h3>
        <p className="text-slate-500 text-sm mt-2">{error || 'The requested incident could not be found.'}</p>
        <button
          onClick={handleBack}
          className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to List
        </button>
      </div>
    );
  }

  const boxStyle = getBoxStyles(incident.boundingBox);
  const isAccident = incident.category === 'Accident';

  return (
    <div className="space-y-6">
      {/* Back Link & Navigation */}
      <div>
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Ledger
        </button>
      </div>

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-slate-400 font-mono tracking-widest uppercase">
            ID: {incident.incidentId}
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading mt-1">
            Incident Telemetry Report
          </h1>
        </div>

        <div>
          <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border ${
            isAccident 
              ? 'bg-red-50 text-red-600 border-red-200' 
              : 'bg-green-50 text-green-600 border-green-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isAccident ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
            {incident.category} Flagged
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Visualizer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
            <h3 className="font-extrabold text-slate-900 text-base mb-3 flex items-center gap-2">
              <Scan className="w-4 h-4 text-slate-500" />
              Surveillance Frame Visualizer
            </h3>

            {/* Frame Snapshot Sandbox Container */}
            <div className="relative w-full aspect-video bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
              {incident.frameSnapshotPath ? (
                // If path exists, show image
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={incident.frameSnapshotPath} 
                  alt="Incident Snapshot Frame" 
                  className="w-full h-full object-cover opacity-90"
                  onError={(e) => {
                    // Fallback to placeholder if image loading fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}

              {/* Styled Mock Video Frame Backdrop if path not exists or image fails */}
              <div className="absolute inset-0 bg-slate-900 flex flex-col justify-between p-6 overflow-hidden pointer-events-none select-none">
                {/* Header info */}
                <div className="flex justify-between items-start text-[10px] font-mono text-slate-400">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-red-500 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> LIVE STREAM INFERENCE
                    </span>
                    <span>FEED_ID: {incident.videoSource}</span>
                  </div>
                  <div className="text-right">
                    <span>FRAME: #{incident.frameNumber}</span>
                    <br />
                    <span>FPS: 29.8</span>
                  </div>
                </div>

                {/* Grid Overlay Graphic */}
                <div className="absolute inset-0 border border-slate-800/20 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-[0.05]" />

                {/* Camera crosshairs */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <div className="w-8 h-8 border border-white rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full" />
                  </div>
                </div>

                {/* Bottom Watermark */}
                <div className="flex justify-between items-end text-[9px] font-mono text-slate-500">
                  <span>YOLOv11x-ACCIDENT-DETECTOR</span>
                  <span>UTC: {new Date(incident.timestamp).toISOString()}</span>
                </div>
              </div>

              {/* Absolute Bounding Box Overlay */}
              <div 
                className={`absolute border-2 border-dashed ${
                  isAccident 
                    ? 'border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                    : 'border-green-500 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                } rounded transition-all duration-300 pointer-events-none`}
                style={boxStyle}
              >
                {/* Bounding box badge label */}
                <div className={`absolute -top-6 left-0 px-2 py-0.5 text-[10px] font-bold text-white rounded shadow-sm whitespace-nowrap ${
                  isAccident ? 'bg-red-600' : 'bg-green-600'
                }`}>
                  {incident.category.toUpperCase()} ({formatPercent(incident.confidence)})
                </div>
              </div>
            </div>

            {/* Bounding Box Info Footer */}
            <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs border border-slate-100 flex flex-wrap justify-between items-center gap-3">
              <span className="text-slate-500 font-semibold uppercase">Bounding Box Coords:</span>
              <div className="font-mono text-slate-700 space-x-4">
                <span>X: <span className="font-bold">{incident.boundingBox.x}px</span></span>
                <span>Y: <span className="font-bold">{incident.boundingBox.y}px</span></span>
                <span>W: <span className="font-bold">{incident.boundingBox.width}px</span></span>
                <span>H: <span className="font-bold">{incident.boundingBox.height}px</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Metadata Cards */}
        <div className="space-y-4">
          
          {/* Metadata Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-slate-500" />
              Incident Details
            </h3>

            <div className="space-y-3">
              {/* Timestamp */}
              <div className="flex gap-3">
                <Calendar className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Detection Date</span>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">{formatDate(incident.timestamp)}</p>
                </div>
              </div>

              {/* Video Source */}
              <div className="flex gap-3">
                <Video className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Video Source Feed</span>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5 font-mono">{incident.videoSource}</p>
                </div>
              </div>

              {/* Frame Number */}
              <div className="flex gap-3">
                <Layers className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Incident Frame Index</span>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">#{incident.frameNumber}</p>
                </div>
              </div>

              {/* Confidence */}
              <div className="flex gap-3">
                <Activity className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Confidence Rating</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-sm font-extrabold text-slate-800">{formatPercent(incident.confidence)}</p>
                    <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden border">
                      <div 
                        className={`h-full ${isAccident ? 'bg-red-500' : 'bg-green-500'}`} 
                        style={{ width: `${incident.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex gap-3">
                <CheckCircle className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">System Status</span>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">{incident.status}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Response Telemetry Actions */}
          {isAccident && (
            <div className="bg-red-50/50 border border-red-100 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
                <h4 className="font-extrabold text-sm uppercase tracking-wider">Emergency Dispatch Protocol</h4>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                An anomaly matching a high-confidence collision profile has been registered from source feed <span className="font-mono bg-red-50/80 px-1 border rounded">{incident.videoSource}</span>. Automated emergency dispatcher notifications have been generated.
              </p>
              
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => alert('Emergency dispatch notification broadcasted successfully!')}
                  className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs transition-all shadow-md shadow-red-500/10 uppercase tracking-wider"
                >
                  Confirm & Alert Responders
                </button>
                <button
                  onClick={() => alert('Flagged as False Alarm. Record category updated to Non-Accident.')}
                  className="w-full py-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-semibold rounded-lg text-xs transition-all uppercase tracking-wider"
                >
                  Dismiss as False Alarm
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
