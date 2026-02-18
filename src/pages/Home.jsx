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
  Database
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
      status: "Secure",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      title: "Entry Logging",
      desc: "Capture and validate visitor data.",
      icon: Users,
      status: "Active",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    {
      title: "Time Tracking",
      desc: "Precise entry and exit timestamps.",
      icon: Clock,
      status: "Synced",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20"
    },
    {
      title: "Administration",
      desc: "Centralized control and oversight.",
      icon: LayoutDashboard,
      status: "Restricted",
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20"
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 font-sans relative overflow-hidden flex flex-col pt-20">
      
      {/* Background Subtle Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" 
           style={{
             backgroundImage: "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)",
             backgroundSize: "60px 60px"
           }}>
      </div>

      {/* Header Status Bar */}
      <div className="w-full bg-slate-800/80 border-b border-slate-700/50 py-2 flex justify-between items-center px-6 backdrop-blur-sm z-10 text-xs font-medium">
          <div className="flex items-center gap-3">
              <span className="text-slate-400">System Status:</span>
              <span className={`px-2 py-0.5 rounded-full ${systemStatus === "Online" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                  {systemStatus}
              </span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
              <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Server Connected</span>
              </div>
          </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center p-6 relative z-10">
        
        {/* Main Content */}
        <div className="max-w-6xl w-full">
            
            {/* Hero Section */}
            <div className="text-center mb-16 relative">
                 {/* Soft Blur Behind Title */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/5 blur-[120px] rounded-full -z-10"></div>
                 
                 <div className="inline-flex items-center gap-2 border border-slate-700/50 bg-slate-800/50 rounded-full px-4 py-1.5 mb-8">
                     <Activity size={14} className="text-blue-400" />
                     <span className="text-xs font-semibold text-blue-300 tracking-wide uppercase">Version 2.4.0 Stable</span>
                 </div>

                 <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
                    MagTrack <span className="text-blue-500">OS</span>
                 </h1>
                 
                 <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                    Advanced Visitor Management Protocol for Nambale Magnet School.<br/>
                    <span className="text-slate-500">Secure. Efficient. Compliant.</span>
                 </p>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {steps.map((step, i) => (
                    <div key={i} className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl relative group hover:bg-slate-800 hover:border-slate-600 transition-all duration-300 shadow-sm hover:shadow-xl">
                        
                        <div className="flex justify-between items-start mb-5">
                            <div className={`p-3 rounded-lg ${step.bg} ${step.color}`}>
                                <step.icon size={24} />
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${step.bg} ${step.color} border ${step.border}`}>
                                {step.status}
                            </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                    </div>
                ))}
            </div>

            {/* Action Button */}
            <div className="text-center pb-10">
                <button
                    onClick={handleGetStarted}
                    className="group relative inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-sm tracking-wide shadow-lg shadow-blue-900/20 transition-all transform hover:-translate-y-0.5"
                >
                    {loading ? "Initializing..." : "Access Dashboard"}
                    {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
