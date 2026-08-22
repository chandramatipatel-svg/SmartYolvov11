'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  RotateCcw
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
  status: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });

  // Filters State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [minConfidence, setMinConfidence] = useState(0.70);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch logic wrapped in useCallback so it's a stable dependency
  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        category,
        minConfidence: minConfidence.toString()
      });

      if (search) params.append('search', search);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/incidents?${params.toString()}`);
      const data = await res.json();
      
      setIncidents(data.incidents || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
    } catch (error) {
      console.error('Error loading incidents:', error);
    } finally {
      setLoading(false);
    }
  }, [page, category, minConfidence, search, startDate, endDate]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setMinConfidence(0.70);
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        all: 'true', // custom param to bypass pagination limit
        category,
        minConfidence: minConfidence.toString()
      });

      if (search) params.append('search', search);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/incidents?${params.toString()}`);
      const data = await res.json();
      const allMatchingIncidents: IncidentRecord[] = data.incidents || [];

      if (allMatchingIncidents.length === 0) {
        alert('No incidents to export matching current filters.');
        return;
      }

      // Generate CSV Content
      const headers = ['Incident ID', 'Timestamp', 'Video Source', 'Frame Number', 'Confidence %', 'Category', 'Bounding Box [x, y, w, h]', 'Status'];
      const rows = allMatchingIncidents.map(inc => [
        inc.incidentId,
        new Date(inc.timestamp).toISOString(),
        inc.videoSource,
        inc.frameNumber,
        (inc.confidence * 100).toFixed(1) + '%',
        inc.category,
        `[${inc.boundingBox.x}; ${inc.boundingBox.y}; ${inc.boundingBox.width}; ${inc.boundingBox.height}]`,
        inc.status
      ]);

      const csvContent = 
        'data:text/csv;charset=utf-8,' 
        + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `smartguard_incidents_export_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to generate export file.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatPercent = (val: number) => {
    return `${(val * 100).toFixed(1)}%`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-heading">Incident Ledger</h1>
          <p className="text-slate-500 mt-1">Review, filter, and audit all telemetry warnings captured on the edge.</p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f172a] hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-all shadow-sm disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Generating CSV...' : 'Export CSV'}
        </button>
      </div>

      {/* Filter Control Board */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <h3 className="font-bold text-slate-800 text-sm">Search and Filter Controls</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search Box */}
          <div className="space-y-1.5 col-span-1 md:col-span-2 lg:col-span-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Search Source</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search camera file..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-slate-800"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-slate-800"
            >
              <option value="All">All Categories</option>
              <option value="Accident">Accidents Only</option>
              <option value="Non-Accident">Non-Accidents Only</option>
            </select>
          </div>

          {/* Confidence Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase">Min Confidence</label>
              <span className="text-xs font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                {(minConfidence * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center gap-2 h-9">
              <input
                type="range"
                min="0.70"
                max="0.99"
                step="0.01"
                value={minConfidence}
                onChange={(e) => {
                  setMinConfidence(parseFloat(e.target.value));
                  setPage(1);
                }}
                className="w-full accent-red-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Date Picker Start */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">Start Date</label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-slate-800"
              />
            </div>
          </div>

          {/* Date Picker End */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-slate-800"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {(search || category !== 'All' || minConfidence > 0.70 || startDate || endDate) && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:text-red-500 bg-red-50 hover:bg-red-100/60 rounded-lg transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Results Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 text-slate-500 text-xs font-bold uppercase border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Incident ID</th>
                <th className="py-3.5 px-5">Timestamp</th>
                <th className="py-3.5 px-5">Source File</th>
                <th className="py-3.5 px-5">Frame #</th>
                <th className="py-3.5 px-5">Confidence</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5">Bounding Box (x, y, w, h)</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                // Skeletons
                [...Array(10)].map((_, idx) => (
                  <tr key={idx} className="shimmer h-[53px]" />
                ))
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 font-medium">
                    No incident reports match the selected filters.
                  </td>
                </tr>
              ) : (
                incidents.map((incident) => (
                  <tr key={incident._id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-xs font-bold text-slate-900">
                      {incident.incidentId.slice(0, 8)}...
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 text-xs">
                      {formatDate(incident.timestamp)}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-700 text-xs max-w-[150px] truncate">
                      {incident.videoSource}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-mono text-xs">
                      {incident.frameNumber}
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
                    <td className="py-3.5 px-5 font-mono text-slate-400 text-xs">
                      [{incident.boundingBox.x}, {incident.boundingBox.y}, {incident.boundingBox.width}, {incident.boundingBox.height}]
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

        {/* Pagination Controls */}
        {!loading && pagination.totalPages > 1 && (
          <div className="p-4 bg-slate-50/40 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Showing page <span className="font-bold text-slate-700">{pagination.page}</span> of <span className="font-bold text-slate-700">{pagination.totalPages}</span> ({pagination.total} entries)
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-slate-600 hover:text-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-slate-600 hover:text-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
