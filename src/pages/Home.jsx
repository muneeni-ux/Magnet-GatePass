// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { BadgeCheck } from "lucide-react";

// const Home = () => {
//   const navigate = useNavigate();

//   const handleGetStarted = () => {
//     navigate("/form");
//   };

//   const steps = [
//     {
//       title: "Secure Login",
//       desc: "Login securely using your gatekeeper credentials.",
//       color: "from-blue-500 to-indigo-500",
//     },
//     {
//       title: "Record Visitors",
//       desc: "Record visitor information instantly upon entry.",
//       color: "from-green-500 to-emerald-500",
//     },
//     {
//       title: "Track Exits",
//       desc: "Use the Time Out button when visitors leave.",
//       color: "from-yellow-400 to-orange-500",
//     },
//     {
//       title: "Admin Dashboard",
//       desc: "Admins can view, manage, and print visit logs easily.",
//       color: "from-pink-500 to-purple-600",
//     },
//   ];

//   return (
//     <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center text-gray-800 px-6 py-10">
//       {/* Animated Background */}
//       <div className="absolute inset-0 -z-10">
//         <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full filter blur-3xl opacity-30 animate-float-slow"></div>
//         <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full filter blur-3xl opacity-30 animate-float"></div>
//         <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full filter blur-3xl opacity-20 animate-float-delayed"></div>
//       </div>

//       {/* Hero Section */}
//       <div className="max-w-5xl w-full text-center mt-16 animate-fade-in">
//         <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-blue-900 drop-shadow-xl leading-tight">
//           Welcome to{" "}
//           <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
//             Nambale Magnet School
//           </span>{" "}
//           Visitors Pass System
//         </h1>
//         <p className="text-lg md:text-xl mb-10 text-blue-800 font-medium max-w-2xl mx-auto">
//           A fast, secure, and user-friendly system to manage visitor movement
//           with ease and professionalism.
//         </p>

//         {/* Steps as Colorful Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
//           {steps.map((step, i) => (
//             <div
//               key={i}
//               className={`relative p-6 rounded-2xl shadow-lg bg-gradient-to-r ${step.color} text-white transform transition duration-300 hover:scale-105 hover:shadow-2xl`}
//             >
//               <div className="flex items-center gap-3 mb-3">
//                 <BadgeCheck className="w-7 h-7 text-white" />
//                 <h3 className="text-xl font-bold">{step.title}</h3>
//               </div>
//               <p className="text-md font-medium">{step.desc}</p>
//               <span className="absolute top-4 right-4 text-sm font-semibold opacity-60">
//                 Step {i + 1}
//               </span>
//             </div>
//           ))}
//         </div>

//         {/* CTA Button */}
//         <button
//           onClick={handleGetStarted}
//           className="mt-12 px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition duration-300 rounded-full text-lg md:text-xl font-bold text-white shadow-lg hover:shadow-2xl transform hover:scale-105"
//         >
//           🚀 Get Started
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Home;

// /neww
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
  Lock,
  Database
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [systemStatus, setSystemStatus] = useState("INITIALIZING");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSystemStatus("ONLINE"), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    setLoading(true);
    setTimeout(() => navigate("/form"), 800);
  };

  const steps = [
    {
      title: "AUTHENTICATION",
      desc: "Encrypted login protocol.",
      icon: ShieldCheck,
      status: "SECURE",
      color: "text-green-500",
      border: "border-green-500/30"
    },
    {
      title: "ENTRY LOG",
      desc: "Capture visitor data.",
      icon: Users,
      status: "ACTIVE",
      color: "text-blue-500",
      border: "border-blue-500/30"
    },
    {
      title: "TIME STAMP",
      desc: " precise exit tracking.",
      icon: Clock,
      status: "SYNCED",
      color: "text-amber-500",
      border: "border-amber-500/30"
    },
    {
      title: "ADMIN CORE",
      desc: "Centralized control.",
      icon: LayoutDashboard,
      status: "RESTRICTED",
      color: "text-red-500",
      border: "border-red-500/30"
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-blue-100 font-mono relative overflow-hidden flex flex-col pt-20">
      
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-10" 
           style={{
             backgroundImage: "linear-gradient(#1e40af 1px, transparent 1px), linear-gradient(90deg, #1e40af 1px, transparent 1px)",
             backgroundSize: "50px 50px"
           }}>
      </div>

      {/* Header Status Bar */}
      <div className="w-full bg-slate-900/80 border-b border-blue-900/50 p-2 flex justify-between items-center px-6 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-500">SYSTEM STATUS:</span>
              <span className={`font-bold ${systemStatus === "ONLINE" ? "text-green-500 animate-pulse" : "text-yellow-500"}`}>
                  {systemStatus}
              </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                  <Server size={12} />
                  <span>SERVER: CONNECTED</span>
              </div>
              <div className="flex items-center gap-1">
                  <Database size={12} />
                  <span>DB: LIVE</span>
              </div>
          </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center p-6 relative z-10">
        
        {/* Main Content */}
        <div className="max-w-5xl w-full">
            
            {/* Hero Section */}
            <div className="text-center mb-16 relative">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full -z-10"></div>
                 
                 <div className="inline-flex items-center gap-2 border border-blue-500/30 bg-blue-900/10 rounded-full px-4 py-1 mb-6">
                     <Activity size={14} className="text-blue-400" />
                     <span className="text-xs font-bold text-blue-300 tracking-widest">V2.4.0 STABLE BUILD</span>
                 </div>

                 <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6 uppercase">
                    MagTrack <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">OS</span>
                 </h1>
                 
                 <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto tracking-wide border-l-2 border-blue-500/50 pl-4 text-left md:text-center md:border-l-0 md:pl-0">
                    ADVANCED VISITOR MANAGEMENT PROTOCOLS ENABLED.<br className="hidden md:block"/>
                    SECURE. EFFICIENT. COMPLIANT.
                 </p>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {steps.map((step, i) => (
                    <div key={i} className={`bg-slate-900/50 border ${step.border} p-6 rounded-sm relative group hover:bg-slate-800/80 transition-all duration-300`}>
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="flex justify-between items-start mb-4">
                            <step.icon size={24} className={step.color} />
                            <span className={`text-[10px] font-bold border border-current px-1 rounded-sm ${step.color} opacity-70`}>
                                {step.status}
                            </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-white mb-2 tracking-wide">{step.title}</h3>
                        <p className="text-xs text-slate-400">{step.desc}</p>
                        
                        <div className="absolute bottom-2 right-2 opacity-10 text-4xl font-bold text-slate-500">
                            0{i + 1}
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Button */}
            <div className="text-center">
                <button
                    onClick={handleGetStarted}
                    className="relative group px-12 py-4 bg-transparent overflow-hidden"
                >
                    <div className="absolute inset-0 w-full h-full bg-blue-600/20 skew-x-[-20deg] group-hover:bg-blue-600/40 transition-colors border border-blue-500/50"></div>
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 shadow-[0_0_20px_#3b82f6]"></div>
                    
                    <span className="relative z-10 flex items-center gap-3 font-bold text-blue-100 tracking-[0.2em] group-hover:gap-6 transition-all duration-300">
                        {loading ? "INITIALIZING..." : "LAUNCH PROTOCOL"}
                        {!loading && <ArrowRight size={18} />}
                    </span>
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
