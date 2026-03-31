import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Users,
  Clock,
  LayoutDashboard,
  Activity,
  Server,
  Database,
  Terminal
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [systemStatus, setSystemStatus] = useState("Initializing...");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSystemStatus("Online"), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    setLoading(true);
    setTimeout(() => navigate("/form"), 800);
  };

  const steps = [
    {
      title: "Authentication",
      desc: "Secure login credential verification.",
      icon: ShieldCheck,
      status: "SECURE",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30"
    },
    {
      title: "Entry Logging",
      desc: "Capture and validate visitor data.",
      icon: Users,
      status: "ACTIVE",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30"
    },
    {
      title: "Time Tracking",
      desc: "Precise entry and exit timestamps.",
      icon: Clock,
      status: "SYNCED",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30"
    },
    {
      title: "Administration",
      desc: "Centralized control and oversight.",
      icon: LayoutDashboard,
      status: "RESTRICTED",
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/30"
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] text-slate-800 dark:text-gray-100 font-sans relative overflow-hidden flex flex-col pt-[70px] cyber-grid">
      
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-32 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse delay-700"></div>

      {/* Header Status Bar (Sub-nav) */}
      <div className="w-full glass-panel dark:glass-panel-dark border-x-0 border-t-0 border-b border-white/60 dark:border-slate-800/80 py-2.5 flex justify-between items-center px-8 z-10 text-[10px] uppercase tracking-widest font-extrabold font-mono shadow-sm">
          <div className="flex items-center gap-4">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Terminal size={12} />
                Network Status:
              </span>
              <span className={`px-2.5 py-1 rounded-md border ${systemStatus === "Online" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"} shadow-inner`}>
                  {systemStatus}
              </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${systemStatus === "Online" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" : "bg-amber-500"}`}></span>
                  <span>Uplink Maintained</span>
              </div>
          </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center p-6 relative z-10">
        
        {/* Main Content */}
        <div className="max-w-6xl w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Hero Section */}
            <div className="text-center mb-20 relative pt-10">
                 
                 <div className="inline-flex items-center gap-2 border border-blue-200/50 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/10 rounded-full px-5 py-2 mb-8 shadow-inner">
                     <Activity size={14} className="text-blue-600 dark:text-blue-400" />
                     <span className="text-[10px] font-extrabold text-blue-700 dark:text-blue-300 tracking-widest uppercase font-mono">Core System v2.0.0</span>
                 </div>

                 <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 drop-shadow-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    VISITRACK<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 dark:from-emerald-400 dark:to-cyan-400">.OS</span>
                 </h1>
                 
                 <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-medium">
                    Advanced Physical Access Protocol & Security Telemetry.<br/>
                    <span className="text-slate-400 dark:text-slate-500 font-bold tracking-widest uppercase text-xs mt-2 block">Secure // Efficient // Compliant</span>
                 </p>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {steps.map((step, i) => (
                    <div key={i} className="glass-panel dark:glass-panel-dark p-6 rounded-3xl relative group hover:bg-white/90 dark:hover:bg-[#0a0f1c]/80 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:-translate-y-1 hover:shadow-xl border border-white/60 dark:border-slate-700/50">
                        
                        <div className="flex justify-between items-start mb-8 transition-transform group-hover:scale-105">
                            <div className={`p-3.5 rounded-2xl ${step.bg} ${step.color} shadow-inner`}>
                                <step.icon size={24} />
                            </div>
                            <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md ${step.bg} ${step.color} border ${step.border} font-mono`}>
                                {step.status}
                            </span>
                        </div>
                        
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>{step.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{step.desc}</p>
                    </div>
                ))}
            </div>

            {/* Action Button */}
            <div className="text-center pb-20 mt-10">
                <button
                    onClick={handleGetStarted}
                    disabled={loading}
                    className={`group relative inline-flex items-center gap-3 px-10 py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 shadow-xl border border-transparent hover:border-white/20 ${
                      loading
                        ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 dark:from-emerald-600 dark:to-cyan-600 dark:hover:from-emerald-500 dark:hover:to-cyan-500 text-white shadow-blue-500/20 dark:shadow-emerald-500/20 hover:shadow-blue-500/40 dark:hover:shadow-emerald-500/40 hover:-translate-y-1"
                    }`}
                >
                    {loading ? (
                      <>
                        <Server className="h-5 w-5 animate-pulse" />
                        Establishing Link...
                      </>
                    ) : (
                      <>
                        Initialize Dashboard
                        <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                      </>
                    )}
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
