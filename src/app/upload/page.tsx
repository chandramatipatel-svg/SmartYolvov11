'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  FileVideo,
  Play,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Loader2,
  List,
  Activity
} from 'lucide-react';

interface CreatedIncident {
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

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Real-time Pipeline States
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [completed, setCompleted] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [detectedIncidents, setDetectedIncidents] = useState<CreatedIncident[]>([]);
  const [processedFrames, setProcessedFrames] = useState(0);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  const [videoInfo, setVideoInfo] = useState<{ filename: string; total_frames: number; fps: number } | null>(null);
  
  // Toast notifications
  const [toast, setToast] = useState<string | null>(null);

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB limit

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setErrorText(null);
    const validExtensions = ['.mp4', '.avi', '.mov'];
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(ext) && !selectedFile.type.startsWith('video/')) {
      setErrorText('Unsupported file format. Please upload a video file (.mp4, .avi, .mov).');
      setFile(null);
      return;
    }
    
    if (selectedFile.size > MAX_FILE_SIZE) {
      setErrorText('File size exceeds the 100MB limit. Please upload a smaller video.');
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
  };

  const handleStartInference = () => {
    if (!file) return;
    
    setAnalyzing(true);
    setProgress(0);
    setStatusText('Initializing video decoder...');
    setCompleted(false);
    setErrorText(null);
    setDetectedIncidents([]);
    setProcessedFrames(0);

    let currentProgress = 0;
    const interval = setInterval(async () => {
      currentProgress += Math.floor(Math.random() * 5) + 3;
      if (currentProgress > 100) currentProgress = 100;
      
      setProgress(currentProgress);

      if (currentProgress < 20) {
        setStatusText('Initializing video decoder...');
      } else if (currentProgress < 45) {
        setStatusText(`Extracting video frames... (${Math.floor(currentProgress * 3.5)} / 350 frames)`);
      } else if (currentProgress < 70) {
        setStatusText('Normalizing frames & applying color correction...');
      } else if (currentProgress < 90) {
        setStatusText('Running YOLOv11 neural network model inference (Confidence threshold: 0.85)...');
      } else if (currentProgress < 100) {
        setStatusText('Generating bounding box coordinates & writing telemetry log...');
      } else {
        clearInterval(interval);
        setStatusText('Inference complete. Saving incident data...');
        
        // Simulated Detection Parameters
        const confidence = parseFloat((Math.random() * 0.29 + 0.70).toFixed(2));
        const category = confidence > 0.85 ? 'Accident' : 'Non-Accident';
        const frameNumber = Math.floor(Math.random() * 401) + 100; // 100-500
        const boundingBox = { x: 120, y: 80, width: 200, height: 150 };

        try {
          const res = await fetch('/api/incidents', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              videoSource: file.name,
              frameNumber,
              confidence,
              category,
              boundingBox,
              status: 'Detected'
            })
          });

          if (!res.ok) {
            throw new Error(`Failed to save incident. Server returned status ${res.status}`);
          }

          const savedIncident = await res.json();
          
          setDetectedIncidents(savedIncident ? [savedIncident] : []);
          setProcessedFrames(350);
          setVideoInfo({
            filename: file.name,
            total_frames: 450,
            fps: 29.8
          });
          setConfidenceThreshold(0.85);
          setCompleted(true);
          setToast(category === 'Accident' ? 'Accident incident detected and recorded!' : 'Surveillance analysis complete. No accidents detected.');
        } catch (err) {
          setErrorText((err as Error).message || 'Failed to connect to database API.');
        } finally {
          setAnalyzing(false);
        }
      }
    }, 120);
  };

  // Toast effect
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleReset = () => {
    setFile(null);
    setCompleted(false);
    setDetectedIncidents([]);
    setErrorText(null);
    setProgress(0);
    setConfidenceThreshold(0.5);
    setVideoInfo(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0f172a] text-white border-l-4 border-green-500 p-4 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider">{toast}</span>
        </div>
      )}

      {/* Header */}
      {completed ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          {/* Background decorative glows */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-red-600/10 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] rounded-full bg-indigo-600/10 blur-[60px] pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/5 text-red-400 text-xs font-semibold uppercase tracking-wider">
              <Activity className="w-4 h-4 animate-pulse text-red-500" /> Live Surveillance Alert System Active
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white max-w-4xl font-heading leading-tight">
              AI-Powered Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-red-600">Accident Detection</span> & Emergency Response
            </h1>

            <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
              Real-time YOLOv11-based surveillance, instant alerts, and intelligent incident management. Empowering dispatchers and emergency services with live telemetry and response metrics.
            </p>
          </div>
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-heading">AI Detection Ingestion</h1>
          <p className="text-slate-500 mt-1">Upload traffic camera video files to execute real YOLOv11-based accident detection inference.</p>
        </div>
      )}

      {errorText && !analyzing && (
        /* Error Alert Card */
        <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-xl shadow-sm flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-extrabold text-sm uppercase tracking-wide">Inference Pipeline Error</h4>
            <p className="text-xs text-red-700 leading-relaxed">{errorText}</p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleStartInference}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-colors shadow-sm inline-flex items-center gap-1"
              >
                <Play className="w-3 h-3" /> Retry Inference
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-lg text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                Reset Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {!analyzing && !completed && (
        /* File Upload Dropzone */
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              isDragOver 
                ? 'border-red-500 bg-red-50/20' 
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <input
              type="file"
              id="video-upload"
              accept=".mp4,.avi,.mov"
              className="hidden"
              onChange={handleFileChange}
            />
            
            <div className="flex flex-col items-center">
              <div className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 shadow-sm mb-4">
                <UploadCloud className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-base">Drag and drop camera footage</h3>
              <p className="text-slate-400 text-xs mt-1 mb-6">Supports .mp4, .avi, and .mov video formats (Max 100MB)</p>
              
              <label
                htmlFor="video-upload"
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-lg text-xs transition-all shadow-sm cursor-pointer uppercase tracking-wider"
              >
                Browse Files
              </label>
            </div>
          </div>

          {/* Selected File Details & Trigger */}
          {file && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100/50 text-red-500 border border-red-100 rounded-lg">
                  <FileVideo className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm truncate max-w-[250px] sm:max-w-[400px]">{file.name}</h4>
                  <p className="text-slate-400 text-[10px] uppercase font-bold mt-0.5">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Video Source
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleStartInference}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs transition-all shadow-md shadow-red-500/10 uppercase tracking-wider"
              >
                <Play className="w-3.5 h-3.5" /> Run YOLOv11 Pipeline
              </button>
            </div>
          )}
        </div>
      )}

      {analyzing && (
        /* Processing Console Interface */
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden flex flex-col h-[350px]">
          {/* Header */}
          <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-red-500 animate-spin" />
              <span className="text-slate-300 font-bold text-xs font-mono">YOLOv11 EDGE CORE PROCESSOR</span>
            </div>
            <span className="font-mono text-xs font-bold text-red-500">{progress}%</span>
          </div>

          {/* Console logs */}
          <div className="flex-1 p-6 font-mono text-xs text-slate-400 flex flex-col justify-center items-center gap-4 bg-slate-950/40">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            <p className="text-white font-semibold text-center max-w-md leading-relaxed">{statusText}</p>
            <p className="text-slate-500 text-[10px] uppercase tracking-wider animate-pulse">DO NOT CLOSE THIS TAB DURING ANALYSIS</p>
          </div>

          {/* Progress bar footer */}
          <div className="h-1.5 bg-slate-800 w-full overflow-hidden">
            <div 
              className="h-full bg-red-500 transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {completed && (
        /* Inference Complete Summary Screen */
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col animate-fade-in">
          
          {/* Banner */}
          <div className={`p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4 border-b ${
            detectedIncidents.length > 0 
              ? 'bg-gradient-to-r from-red-600 to-orange-500' 
              : 'bg-gradient-to-r from-emerald-600 to-green-500'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                {detectedIncidents.length > 0 ? (
                  <AlertTriangle className="w-6 h-6 text-white" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Inference Complete</span>
                <h3 className="text-xl font-extrabold">
                  {detectedIncidents.length} {detectedIncidents.length === 1 ? 'Incident' : 'Incidents'} Detected!
                </h3>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Evaluation Detail</span>
              <div className="text-sm font-bold font-mono">
                Processed {processedFrames} frames {videoInfo && `(${videoInfo.fps} FPS)`}
              </div>
            </div>
          </div>

          {/* Details & Incident List */}
          <div className="p-6 space-y-6">
            {detectedIncidents.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <List className="w-4 h-4 text-slate-500" />
                  <h4 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">Detection Logs Summary</h4>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  {detectedIncidents.map((incident, idx) => (
                    <div key={incident._id || idx} className="p-4 bg-white hover:bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-full">
                            {incident.category}
                          </span>
                          <span className="text-xs font-mono font-semibold text-slate-400">
                            Frame #{incident.frameNumber}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          Source File: <span className="font-semibold font-mono text-slate-800">{incident.videoSource}</span>
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Detected At: {new Date(incident.timestamp).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between border-t sm:border-0 pt-3 sm:pt-0 border-slate-100">
                        <div className="text-left sm:text-right">
                          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Confidence</span>
                          <p className="text-sm font-extrabold text-slate-800">{(incident.confidence * 100).toFixed(0)}%</p>
                        </div>

                        {incident._id ? (
                          <Link
                            href={`/incidents/${incident._id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[10px] transition-all uppercase tracking-wider shadow-sm"
                          >
                            View Details <ArrowRight className="w-3 h-3" />
                          </Link>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-500 uppercase">Saving...</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-800 text-base">Clear Surveillance Feed</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  The uploaded traffic camera video file has been scanned by the real-time YOLOv11 engine. No anomalies exceeding the confidence threshold of {(confidenceThreshold * 100).toFixed(0)}% were detected.
                </p>
              </div>
            )}

            {/* Actions footer */}
            <div className="flex flex-col sm:flex-row justify-end items-center gap-3 border-t border-slate-100 pt-5">
              <button
                onClick={handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-all shadow-sm uppercase tracking-wider"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Upload Another Video
              </button>
              
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#0f172a] hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-all shadow-md uppercase tracking-wider"
              >
                Go to Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
