'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled App Router Error:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
      <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 mb-4 shadow-sm">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="font-extrabold text-xl text-slate-900">Application Error</h3>
      <p className="text-slate-500 text-sm mt-2 mb-6">
        An unexpected error occurred in this portal route. Please try resetting or refreshing the current view.
      </p>
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
      >
        <RotateCcw className="w-4 h-4" /> Reset View
      </button>
    </div>
  );
}
