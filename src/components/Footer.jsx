import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, LifeBuoy, PhoneCall, ShieldCheck, Activity, Send } from 'lucide-react';

function Footer() {
  return (
    <footer className="relative mt-auto font-sans z-10">
      {/* Decorative top border glow */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 dark:via-emerald-500/50 to-transparent"></div>
      
      <div className="glass-panel border-x-0 border-b-0 border-t border-white/60 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/60 py-12 px-6 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
            
            {/* Brand */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
              <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-emerald-500/10 dark:to-cyan-500/10 border border-blue-500/20 dark:border-emerald-500/20 shadow-inner">
                <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  VISITRACK<span className="text-blue-600 dark:text-emerald-400">.OS</span>
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1">
                  Visitor Management Terminal
                </p>
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300/50 dark:border-slate-700/50 text-xs font-bold text-slate-600 dark:text-slate-400 font-mono">
                  v2.0.0-SECURE
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div className="text-center md:text-left">
              <h3 className="text-[11px] font-extrabold mb-5 text-slate-800 dark:text-slate-200 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2 inline-block md:block">System Navigation</h3>
              <ul className="space-y-3 text-sm font-bold text-slate-600 dark:text-slate-400">
                <li>
                  <Link to="/home" className="hover:text-blue-600 dark:hover:text-emerald-400 transition-colors flex items-center justify-center md:justify-start gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-blue-600 dark:group-hover:bg-emerald-400 transition-colors"></span>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-blue-600 dark:hover:text-emerald-400 transition-colors flex items-center justify-center md:justify-start gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-blue-600 dark:group-hover:bg-emerald-400 transition-colors"></span>
                    System Info
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="hover:text-blue-600 dark:hover:text-emerald-400 transition-colors flex items-center justify-center md:justify-start gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-blue-600 dark:group-hover:bg-emerald-400 transition-colors"></span>
                    Archives
                  </Link>
                </li>
              </ul>
            </div>

            {/* Connect / Support */}
            <div className="text-center md:text-left">
              <h3 className="text-[11px] font-extrabold mb-5 text-slate-800 dark:text-slate-200 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2 inline-block md:block">IT Helpdesk</h3>
              <ul className="space-y-3 text-sm font-bold text-slate-600 dark:text-slate-400">
                <li>
                  <a href="/helpdesk" className="flex items-center justify-center md:justify-start gap-2.5 hover:text-blue-600 dark:hover:text-emerald-400 transition-colors group">
                    <LifeBuoy className="w-4 h-4 text-slate-400 group-hover:text-blue-500 dark:group-hover:text-emerald-500" /> IT Support Post
                  </a>
                </li>
                <li>
                  <a href="/faq" className="flex items-center justify-center md:justify-start gap-2.5 hover:text-blue-600 dark:hover:text-emerald-400 transition-colors group">
                    <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-blue-500 dark:group-hover:text-emerald-500" /> FAQs
                  </a>
                </li>
                <li>
                  <a href="/occurrence" className="flex items-center justify-center md:justify-start gap-2.5 hover:text-blue-600 dark:hover:text-emerald-400 transition-colors group">
                    <Send className="w-4 h-4 text-slate-400 group-hover:text-blue-500 dark:group-hover:text-emerald-500" /> Report Incident
                  </a>
                </li>
              </ul>
            </div>

            {/* Emergency Call */}
            <div className="text-center md:text-left glass-panel dark:glass-panel-dark bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 p-5 rounded-2xl relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-500/10 rounded-full blur-xl animate-pulse"></div>
              <h3 className="text-[11px] font-extrabold mb-3 text-red-600 dark:text-red-400 uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
                Emergency Priority
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs font-medium mb-4 leading-relaxed">
                Need immediate visual or physical assistance from security ops?
              </p>
              <a href="tel:+254738380692" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-[0_4px_15px_rgba(220,38,38,0.3)] border border-red-500/50 group">
                <PhoneCall className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="uppercase tracking-widest text-[11px]">Declare SOS</span>
              </a>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-500/80 uppercase tracking-widest font-mono">
            <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span className="flex items-center gap-2">
                Server Integrity: <span className="text-emerald-600 dark:text-emerald-400">100%</span>
              </span>
            </div>
            <div>
              &copy; {new Date().getFullYear()} VisiTrack System // All Rights Reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
