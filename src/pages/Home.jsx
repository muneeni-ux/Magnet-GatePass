import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Users,
  Clock,
  LayoutDashboard,
  Activity,
  UserCheck,
  Globe
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [systemStatus, setSystemStatus] = useState("Connecting...");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSystemStatus("Online"), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    setLoading(true);
    setTimeout(() => navigate("/form"), 600);
  };

  const steps = [
    {
      title: "User Login",
      desc: "Quick & secure access to the visitor system.",
      icon: ShieldCheck,
      status: "ACTIVE",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30"
    },
    {
      title: "Visitor Check-In",
      desc: "Register new visitor details effortlessly.",
      icon: Users,
      status: "READY",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30"
    },
    {
      title: "Visitor History",
      desc: "Track entry & exit times in real-time.",
      icon: Clock,
      status: "SYNCED",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30"
    },
    {
      title: "Management",
      desc: "View reports and manage gate locations.",
      icon: LayoutDashboard,
      status: "READY",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/30"
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] text-slate-800 dark:text-gray-100 font-sans relative overflow-hidden flex flex-col pt-[70px] cyber-grid">
      
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-32 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse delay-700"></div>

      {/* Header Status Bar */}
      <div className="w-full glass-panel dark:glass-panel-dark border-x-0 border-t-0 border-b border-white/60 dark:border-slate-800/80 py-2.5 flex justify-between items-center px-8 z-10 text-xs font-bold font-mono shadow-sm">
          <div className="flex items-center gap-4">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Globe size={14} />
                System Status:
              </span>
              <span className={`px-2.5 py-0.5 rounded-md border text-[11px] uppercase tracking-wider ${systemStatus === "Online" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"} shadow-inner`}>
                  {systemStatus}
              </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${systemStatus === "Online" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" : "bg-amber-500"}`}></span>
                  <span>Connected</span>
              </div>
          </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center p-6 relative z-10">
        
        {/* Main Content */}
        <div className="max-w-6xl w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Hero Section */}
            <div className="text-center mb-16 relative pt-8">
                 
                 <div className="inline-flex items-center gap-2 border border-blue-200/50 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/10 rounded-full px-5 py-2 mb-6 shadow-inner">
                     <Activity size={14} className="text-blue-600 dark:text-blue-400" />
                     <span className="text-xs font-extrabold text-blue-700 dark:text-blue-300 tracking-wider uppercase font-mono">VisiTrack System</span>
                 </div>

                 <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4 drop-shadow-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    VISITRACK<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 dark:from-emerald-400 dark:to-cyan-400">.OS</span>
                 </h1>
                 
                 <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-medium">
                    Fast, simple, and friendly visitor management system for your organization.<br/>
                    <span className="text-slate-400 dark:text-slate-500 font-bold tracking-wider uppercase text-xs mt-2 block">Easy Check-in // Quick Search // Real-time Alerts</span>
                 </p>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {steps.map((step, i) => (
                    <div key={i} className="glass-panel dark:glass-panel-dark p-6 rounded-3xl relative group hover:bg-white/90 dark:hover:bg-[#0a0f1c]/80 transition-all duration-300 shadow-md hover:-translate-y-1 hover:shadow-xl border border-white/60 dark:border-slate-800">
                        
                        <div className="flex justify-between items-start mb-6 transition-transform group-hover:scale-105">
                            <div className={`p-3.5 rounded-2xl ${step.bg} ${step.color} shadow-inner`}>
                                <step.icon size={22} />
                            </div>
                            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md ${step.bg} ${step.color} border ${step.border} font-mono`}>
                                {step.status}
                            </span>
                        </div>
                        
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>{step.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{step.desc}</p>
                    </div>
                ))}
            </div>

            {/* Action Button */}
            <div className="text-center pb-12">
                <button
                    onClick={handleGetStarted}
                    disabled={loading}
                    className={`group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl font-bold text-sm tracking-wider uppercase transition-all duration-300 shadow-lg border border-transparent ${
                      loading
                        ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 dark:from-emerald-500 dark:to-teal-600 dark:hover:from-emerald-400 dark:hover:to-teal-500 text-white shadow-blue-500/20 dark:shadow-emerald-500/20 hover:shadow-xl hover:-translate-y-0.5"
                    }`}
                >
                    {loading ? (
                      <>
                        <UserCheck className="h-5 w-5 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Start Visitor Check-In
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
