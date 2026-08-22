import React from 'react';
import {
  Layers,
  Activity,
  CheckCircle,
  Database,
  Shield,
  Cpu,
  Tv,
  Compass,
  ChevronRight,
  Globe
} from 'lucide-react';

export default function AboutPage() {
  const layers = [
    {
      title: '1. Input Layer (Data Acquisition)',
      desc: 'Connects to edge inputs including traffic surveillance camera feeds, static intersection feeds, drone videos, and uploaded simulation files.',
      icon: Tv,
      color: 'text-blue-500 bg-blue-50 border-blue-100'
    },
    {
      title: '2. Processing Layer (OpenCV Pipeline)',
      desc: 'Handles resizing, color normalization, noise reduction, and frame slicing to buffer sequence blocks for model inference.',
      icon: Cpu,
      color: 'text-amber-500 bg-amber-50 border-amber-100'
    },
    {
      title: '3. Intelligence Layer (YOLOv11 Inference)',
      desc: 'Employs YOLOv11 neural network models to recognize vehicles, detect overlapping bounding boxes, and classify collision probabilities.',
      icon: Shield,
      color: 'text-red-500 bg-red-50 border-red-100'
    },
    {
      title: '4. Output Layer (Response & Storage)',
      desc: 'Triggers alerts for dispatchers, writes incident coordinates and confidence percentages to MongoDB, and populates the dashboard UI.',
      icon: Database,
      color: 'text-green-500 bg-green-50 border-green-100'
    }
  ];

  const futureEnhancements = [
    { title: 'Near-Collision Detection', desc: 'Predicting potential accidents seconds before they occur by tracking vehicle vector trajectories and deceleration velocities.' },
    { title: 'Overspeeding & Reckless Driving Flagging', desc: 'Calculating pixel-to-meter speed estimations using static perspective mappings and vehicle bounding box shifts.' },
    { title: 'Wrong-Lane & Illegal Turn Alerting', desc: 'Evaluating vehicle lanes against static flow directional vector maps in intersection camera zones.' },
    { title: 'Local Risk Scoring & Hotspots', desc: 'Generating heatmaps of hazardous junctions and risk levels by plotting historical incident densities.' },
    { title: 'VideoLLaMA3 Integration', desc: 'Employing advanced vision language models to generate written textual descriptions and event reviews of accident causes.' }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-heading">System Information</h1>
        <p className="text-slate-500 mt-1">Architecture details, performance statistics, and project roadmap.</p>
      </div>

      {/* 4-Layer Architecture */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-red-500" />
            System Architecture (4-Layer Framework)
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            SmartGuard uses a decoupled pipeline to guarantee high-performance, real-time object classification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {layers.map((layer, idx) => (
            <div key={idx} className="p-5 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-4 hover:shadow-sm transition-all">
              <div className={`p-3 rounded-lg border shrink-0 ${layer.color}`}>
                <layer.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">{layer.title}</h4>
                <p className="text-slate-500 text-xs leading-relaxed mt-1">{layer.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats and Comparative Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Performance Metrics Table */}
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-red-500" />
              ML Model Benchmarks
            </h3>
            <p className="text-slate-500 text-[10px] mt-0.5">Validation metrics from YOLOv11 testing datasets.</p>
            
            <div className="mt-4 overflow-hidden border border-slate-100 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="py-2.5 px-4">Metric</th>
                    <th className="py-2.5 px-4 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr>
                    <td className="py-3 px-4">Accuracy</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">95.93%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Precision</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">95.80%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Recall</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">96.05%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">F1-Score</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">95.93%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 p-3 bg-red-50/50 border border-red-100 rounded-lg text-[10px] text-slate-600 leading-relaxed">
            * Benchmarks evaluated under typical city intersection lighting conditions with standard 1080p surveillance video frames.
          </div>
        </section>

        {/* Feature Comparison Matrix */}
        <section className="md:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 mb-1">
            <CheckCircle className="w-4.5 h-4.5 text-green-500" />
            Proposed System vs. Existing CIRS
          </h3>
          <p className="text-slate-500 text-[10px] mb-4">Comparison of features in standard Collision Incident Response Systems (CIRS) vs. SmartGuard.</p>

          <div className="overflow-x-auto border border-slate-100 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="py-2.5 px-4">Capabilities</th>
                  <th className="py-2.5 px-4 text-slate-400">Standard CIRS</th>
                  <th className="py-2.5 px-4 text-red-500">SmartGuard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800">Accident Detection</td>
                  <td className="py-3 px-4 text-slate-400">Yes</td>
                  <td className="py-3 px-4 font-bold text-green-600">Yes</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800">YOLOv11 Integration</td>
                  <td className="py-3 px-4 text-slate-400">Yes</td>
                  <td className="py-3 px-4 font-bold text-green-600">Yes</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800">Emergency Response</td>
                  <td className="py-3 px-4 text-slate-400">Yes</td>
                  <td className="py-3 px-4 font-bold text-green-600">Yes</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800">Dashboard Monitoring</td>
                  <td className="py-3 px-4 text-slate-400">Limited</td>
                  <td className="py-3 px-4 font-bold text-slate-900">Advanced Dashboard</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800">Accident History Storage</td>
                  <td className="py-3 px-4 text-slate-400">Limited</td>
                  <td className="py-3 px-4 font-bold text-slate-900">Database Driven</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800">Analytics Visualization</td>
                  <td className="py-3 px-4 text-slate-400">Limited</td>
                  <td className="py-3 px-4 font-bold text-slate-900">Interactive Dashboard</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800">Historical Analysis</td>
                  <td className="py-3 px-4 text-slate-400">Limited</td>
                  <td className="py-3 px-4 font-bold text-slate-900">Comprehensive Record Mgmt</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800">Scalability</td>
                  <td className="py-3 px-4 text-slate-400">Research Prototype</td>
                  <td className="py-3 px-4 font-bold text-slate-900">Deployable Prototype</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Expected Outcomes */}
        <section className="md:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5 mt-4">
          <h3 className="font-extrabold text-slate-900 text-base mb-2">10. Expected Outcomes</h3>
          <ul className="list-disc pl-5 text-slate-700 text-sm space-y-1">
            <li>Detect accidents automatically from surveillance videos.</li>
            <li>Reduce dependence on manual monitoring.</li>
            <li>Improve emergency response efficiency.</li>
            <li>Maintain searchable accident records.</li>
            <li>Provide real-time traffic safety analytics.</li>
            <li>Support future accident prevention research.</li>
          </ul>
        </section>

      </div>

      {/* WHO Statistics Callout */}
      <section className="p-6 bg-slate-900 text-slate-200 border border-slate-800 rounded-xl shadow-lg flex flex-col sm:flex-row items-center gap-6">
        <div className="p-4 bg-slate-800 text-red-500 rounded-2xl border border-slate-700/60 shrink-0">
          <Globe className="w-8 h-8 text-red-400 animate-pulse" />
        </div>
        <div className="space-y-2 text-center sm:text-left">
          <h4 className="font-extrabold text-sm uppercase tracking-wider text-red-400">Research & Societal Context</h4>
          <p className="text-slate-400 text-xs leading-relaxed max-w-3xl">
            According to the World Health Organization (WHO), road traffic crashes claim approximately 1.19 million lives each year and are the leading cause of death for children and young adults aged 5–29. Standard dispatcher delay accounts for up to 30% of emergency response lagging. SmartGuard aims to eliminate the reporting gap through automated computer vision feeds, facilitating instantaneous dispatch telemetry to drastically improve survival outcomes.
          </p>
        </div>
      </section>

      {/* Future Enhancements */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-red-500" />
            Future Roadmap Enhancements
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Planned model upgrades and advanced logic modules for the SmartGuard project.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {futureEnhancements.map((item, idx) => (
            <div key={idx} className="p-4 bg-slate-50 hover:bg-slate-100/40 border border-slate-100 rounded-lg flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                  <ChevronRight className="w-4 h-4 text-red-500 shrink-0" />
                  {item.title}
                </h4>
                <p className="text-slate-500 text-xs leading-relaxed mt-2">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
