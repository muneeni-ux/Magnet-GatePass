import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Home, ChevronRight } from "lucide-react";

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] flex flex-col items-center justify-center text-center p-6 relative overflow-hidden font-sans text-slate-800 dark:text-slate-100 cyber-grid selection:bg-blue-500/30 dark:selection:bg-emerald-500/30 md:mt-20">
      
       {/* Decorative Orbs */}
       <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-red-500/10 dark:bg-rose-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
       <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-orange-500/10 dark:bg-amber-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse delay-700"></div>

      <div className="relative z-10 glass-panel dark:glass-panel-dark p-12 md:p-16 rounded-[2.5rem] border border-white/60 dark:border-slate-700/50 shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] max-w-2xl w-full animate-in zoom-in-95 duration-500">
            <div className="mb-8 flex justify-center">
                 <div className="p-6 bg-red-500/10 dark:bg-rose-500/10 rounded-3xl shadow-inner border border-red-500/20 dark:border-rose-500/20">
                     <AlertTriangle size={64} className="text-red-500 dark:text-rose-400 animate-pulse" />
                 </div>
            </div>

            <h1 className="text-8xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 dark:from-rose-400 dark:to-amber-400 mb-2 tracking-tighter" style={{ fontFamily: 'Outfit, sans-serif' }}>
              404
            </h1>
            
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-widest font-mono">
                System Node Not Found
            </h2>
            
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mb-10 leading-relaxed max-w-md mx-auto font-medium">
                The requested quadrant does not exist within the current sector or has been restricted. Return to secure operations.
            </p>

            <Link to="/home">
                <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-emerald-600 dark:to-cyan-600 hover:from-blue-500 hover:to-indigo-500 dark:hover:from-emerald-500 dark:hover:to-cyan-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg hover:-translate-y-1 flex items-center justify-center gap-3 mx-auto border border-transparent hover:border-white/20">
                    <Home size={18} /> 
                    Return to Dashboard
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </Link>
      </div>
    </div>
  );
}

export default NotFound;
