import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Home } from "lucide-react";

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden font-mono text-blue-100">
      
       {/* Background Grid */}
       <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
            style={{
                backgroundImage: "linear-gradient(#ef4444 1px, transparent 1px), linear-gradient(90deg, #ef4444 1px, transparent 1px)",
                backgroundSize: "60px 60px"
            }}>
        </div>

      <div className="relative z-10 p-12 bg-slate-900/80 backdrop-blur-md border border-red-500/30 rounded-sm shadow-[0_0_50px_rgba(239,68,68,0.2)] max-w-lg w-full">
            <div className="mb-6 flex justify-center">
                 <div className="p-4 bg-red-900/20 rounded-full border border-red-500/50 animate-pulse">
                     <AlertTriangle size={64} className="text-red-500" />
                 </div>
            </div>

            <h1 className="text-8xl font-bold text-white mb-2 tracking-tighter">404</h1>
            <div className="h-1 w-24 bg-red-500 mx-auto mb-6"></div>
            
            <h2 className="text-xl font-bold text-red-400 uppercase tracking-widest mb-4">
                System Error: Path Not Found
            </h2>
            
            <p className="text-slate-400 text-xs mb-8 leading-relaxed">
                The requested URL was not found on this server. The resource may have been relocated, deleted, or access privileges are insufficient.
            </p>

            <Link to="/">
                <button className="group relative px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-sm font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] overflow-hidden">
                    <span className="relative z-10 flex items-center gap-2">
                        <Home size={16} /> Return to Dashboard
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 transform skew-x-12"></div>
                </button>
            </Link>
      </div>

       <div className="absolute bottom-6 font-mono text-[10px] text-red-500/50 uppercase tracking-widest animate-pulse">
            Error Code: 404_NOT_FOUND // Trace ID: {Math.random().toString(36).substring(7).toUpperCase()}
       </div>

    </div>
  );
}

export default NotFound;
