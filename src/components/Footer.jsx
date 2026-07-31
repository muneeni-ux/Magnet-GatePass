import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, LifeBuoy, PhoneCall, ShieldCheck, Activity, AlertTriangle } from 'lucide-react';

function Footer() {
  return (
    <footer className="relative mt-auto font-sans z-10">
      {/* Subtle top border glow */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/40 dark:via-emerald-500/40 to-transparent"></div>
      
      <div className="glass-panel border-x-0 border-b-0 border-t border-white/60 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/80 py-6 px-4 md:px-8 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand & Status */}
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-emerald-500/10 border border-blue-500/20 dark:border-emerald-500/20">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                VISITRACK<span className="text-blue-600 dark:text-emerald-400">.OS</span>
              </h2>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Visitor Management System
              </p>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-400">
            <Link to="/home" className="hover:text-blue-600 dark:hover:text-emerald-400 transition-colors">
              Dashboard
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link to="/form" className="hover:text-blue-600 dark:hover:text-emerald-400 transition-colors">
              Check-In
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link to="/history" className="hover:text-blue-600 dark:hover:text-emerald-400 transition-colors">
              History
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link to="/occurrence" className="hover:text-blue-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-500" /> Report Incident
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link to="/helpdesk" className="hover:text-blue-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
              <LifeBuoy className="w-3 h-3 text-blue-500" /> Support
            </Link>
          </div>

          {/* Emergency Call & Copyright */}
          <div className="flex items-center gap-4">
            <a 
              href="tel:+254738380692" 
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-red-500/30"
              title="Call Emergency Hotline"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Emergency Call</span>
            </a>

            <div className="hidden lg:flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-4">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>Operational</span>
            </div>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">
          &copy; {new Date().getFullYear()} VisiTrack System — All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
