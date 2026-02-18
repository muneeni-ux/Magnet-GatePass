import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Home } from "lucide-react";

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden font-sans text-slate-200">
      
       {/* Background Grid */}
       <div className="absolute inset-0 z-0 opacity-[0.03]" 
            style={{
                backgroundImage: "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)",
                backgroundSize: "60px 60px"
            }}>
        </div>

      <div className="relative z-10 p-12 max-w-lg w-full">
            <div className="mb-6 flex justify-center">
                 <div className="p-4 bg-slate-800 rounded-full shadow-xl">
                     <AlertTriangle size={64} className="text-slate-500" />
                 </div>
            </div>

            <h1 className="text-8xl font-bold text-white mb-2 tracking-tighter">404</h1>
            
            <h2 className="text-xl font-semibold text-slate-400 mb-6">
                Page Not Found
            </h2>
            
            <p className="text-slate-500 text-sm mb-10 leading-relaxed max-w-sm mx-auto">
                The page you are looking for does not exist or has been moved. Please check the URL or navigate back to the dashboard.
            </p>

            <Link to="/">
                <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-sm transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2 mx-auto">
                    <Home size={16} /> Return to Dashboard
                </button>
            </Link>
      </div>

    </div>
  );
}

export default NotFound;
