import Link from 'next/link';
import { 
  ShieldAlert, 
  Activity, 
  Database, 
  Cpu, 
  Layers, 
  ArrowRight,
  Video,
  Eye,
  BellRing,
  LineChart,
  Terminal,
  Code
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      title: 'Real-Time Detection',
      description: 'Continuous YOLOv11 surveillance feeds processed frame-by-frame with sub-second latency for immediate threat detection.',
      icon: Eye,
      color: 'text-red-500',
      bg: 'bg-red-500/10 border-red-500/20'
    },
    {
      title: 'Emergency Alerts',
      description: 'Automated notification engine broadcasting detailed accident parameters, location data, and confidence scores to responders.',
      icon: BellRing,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      title: 'Analytics Dashboard',
      description: 'Comprehensive incident analytics showing historical patterns, categorization rates, confidence benchmarks, and daily trends.',
      icon: LineChart,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10 border-blue-500/20'
    }
  ];

  const steps = [
    { step: 1, title: 'Video Acquisition', desc: 'Ingestion of live feeds from traffic surveillance cameras, drones, or local files.', icon: Video },
    { step: 2, title: 'Video Processing (OpenCV)', desc: 'Frame decoding, resizing, normalization, and prep for the model queue.', icon: Cpu },
    { step: 3, title: 'Accident Detection (YOLOv11)', desc: 'Neural network inference detecting vehicles, collisions, fires, and anomalies.', icon: ShieldAlert },
    { step: 4, title: 'Accident Analysis & Classification', desc: 'Refined logic evaluating confidence scores, bounding boxes, and object tracks.', icon: Layers },
    { step: 5, title: 'Emergency Alert Generation', desc: 'Immediate packaging of incident metadata, screenshots, and alert triggers.', icon: BellRing },
    { step: 6, title: 'Database Storage', desc: 'Secure write operation in MongoDB Atlas tracking all variables for audited recall.', icon: Database },
    { step: 7, title: 'Dashboard Monitoring', desc: 'Instant UI propagation through auto-polling web dashboards for real-time human verification.', icon: LineChart }
  ];

  const techStack = [
    { name: 'YOLOv11', role: 'Object Detection Model', desc: 'State-of-the-art computer vision model for localized collision and accident grouping.', icon: ShieldAlert, color: 'border-red-500/30 hover:border-red-500 text-red-400 bg-red-950/20' },
    { name: 'OpenCV', role: 'Image Preprocessing', desc: 'Advanced computer vision library for rapid frame slicing and feed normalization.', icon: Cpu, color: 'border-blue-500/30 hover:border-blue-500 text-blue-400 bg-blue-950/20' },
    { name: 'Streamlit', role: 'ML Prototyping', desc: 'Rapid prototyping engine utilized for initial validation and parameter configuration.', icon: Terminal, color: 'border-amber-500/30 hover:border-amber-500 text-amber-400 bg-amber-950/20' },
    { name: 'MongoDB', role: 'NoSQL Data Store', desc: 'Highly scalable document database caching metadata, thresholds, and frame references.', icon: Database, color: 'border-green-500/30 hover:border-green-500 text-green-400 bg-green-950/20' },
    { name: 'Next.js 14', role: 'Full-Stack Framework', desc: 'React framework delivering lightning-fast App Router APIs and responsive visuals.', icon: Code, color: 'border-purple-500/30 hover:border-purple-500 text-purple-400 bg-purple-950/20' },
    { name: 'Python', role: 'Inference Engine Core', desc: 'Core programming language executing YOLOv11 inference and processing streams.', icon: Activity, color: 'border-cyan-500/30 hover:border-cyan-500 text-cyan-400 bg-cyan-950/20' }
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden -z-10 opacity-30">
        <div className="absolute -top-[300px] left-1/4 w-[600px] h-[600px] rounded-full bg-red-600/30 blur-[150px]" />
        <div className="absolute -top-[250px] right-1/4 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[130px]" />
        <div className="absolute top-0 left-0 right-0 h-full bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-32 md:pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/5 text-red-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in">
          <Activity className="w-4 h-4 animate-pulse" /> Live Surveillance Alert System Active
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.15] mb-6">
          AI-Powered Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-red-600">Accident Detection</span> & Emergency Response
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10">
          Real-time YOLOv11-based surveillance, instant alerts, and intelligent incident management. Empowering dispatchers and emergency services with live telemetry and response metrics.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-red-600 rounded-xl hover:bg-red-500 hover:shadow-xl hover:shadow-red-500/35 transition-all duration-200 group"
          >
            View Dashboard
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-slate-300 bg-slate-800/60 rounded-xl hover:bg-slate-800 border border-slate-700/60 hover:text-white transition-all duration-200"
          >
            Explore System
          </a>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 p-6 md:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md text-center">
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-white">95.93%</div>
            <div className="text-xs md:text-sm text-slate-400 font-medium mt-1">Accuracy</div>
          </div>
          <div className="border-l border-slate-800/80">
            <div className="text-3xl md:text-4xl font-extrabold text-white">95.80%</div>
            <div className="text-xs md:text-sm text-slate-400 font-medium mt-1">Precision</div>
          </div>
          <div className="border-l border-slate-800/80">
            <div className="text-3xl md:text-4xl font-extrabold text-white">96.05%</div>
            <div className="text-xs md:text-sm text-slate-400 font-medium mt-1">Recall</div>
          </div>
          <div className="border-l border-slate-800/80">
            <div className="text-3xl md:text-4xl font-extrabold text-white">95.93%</div>
            <div className="text-xs md:text-sm text-slate-400 font-medium mt-1">F1-Score</div>
          </div>
        </div>
      </section>

      {/* 3-Column Feature Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Core Surveillance Features</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            SmartGuard combines edge intelligence with robust reporting interfaces to minimize dispatch response delay.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/60 hover:-translate-y-1 transition-all duration-300 flex flex-col items-start"
            >
              <div className={`p-3 rounded-xl border ${feature.bg} ${feature.color} mb-6`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section (7-Step Pipeline) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32 scroll-mt-24">
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">System Processing Pipeline</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            From raw camera frames to emergency medical alerts, follow the 7-step telemetry pipeline.
          </p>
        </div>

        <div className="relative">
          {/* Timeline Connector Line */}
          <div className="absolute left-1/2 top-4 bottom-4 w-0.5 bg-slate-800 -translate-x-1/2 hidden lg:block" />

          <div className="space-y-12 lg:space-y-16">
            {steps.map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div 
                  key={step.step}
                  className={`flex flex-col lg:flex-row items-center justify-between gap-8 ${
                    isEven ? '' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* Card wrapper */}
                  <div className="w-full lg:w-[45%]">
                    <div className="p-6 md:p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all shadow-xl flex items-start gap-4">
                      <div className="p-3 bg-red-500/10 rounded-xl text-red-500 border border-red-500/20 shrink-0 mt-1">
                        <step.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Step {step.step}</span>
                        <h3 className="text-lg md:text-xl font-bold text-white mt-1 mb-2">{step.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  </div>

                  {/* Circle number in the middle */}
                  <div className="relative z-10 shrink-0 w-12 h-12 rounded-full bg-[#0f172a] border-2 border-slate-800 flex items-center justify-center font-bold text-white text-base shadow-lg shadow-black/40 hidden lg:flex">
                    {step.step}
                  </div>

                  {/* Empty spacer for grid alignment */}
                  <div className="w-[45%] hidden lg:block" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Core Technology Stack</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Powered by modern machine learning libraries, databases, and front-end architectures.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {techStack.map((tech, idx) => (
            <div 
              key={idx} 
              className={`p-6 rounded-xl border transition-all duration-200 hover:-translate-y-1 ${tech.color}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <tech.icon className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="font-bold text-white text-lg">{tech.name}</h3>
                  <p className="text-xs text-slate-400 font-semibold uppercase">{tech.role}</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{tech.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
