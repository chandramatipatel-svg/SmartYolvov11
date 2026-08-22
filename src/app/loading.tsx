'use client';

import React from 'react';
import { Activity } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 animate-pulse">
        <Activity className="w-8 h-8" />
      </div>
      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Synchronizing Telemetry...</p>
    </div>
  );
}
