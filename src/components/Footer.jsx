import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, LifeBuoy, Mail, PhoneCall, Bug } from 'lucide-react';

function Footer() {
  return (
    <footer className="relative bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 py-10 px-6 mt-auto font-sans">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-10">
        
        {/* Brand */}
        <div className="text-center sm:text-left">
          <h2 className="text-xs font-semibold mb-4 text-slate-500 uppercase tracking-widest">
            Identity
          </h2>
          <div className="flex items-center gap-3 justify-center sm:justify-start mb-4">
             <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
             <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Visitrack</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Visitor Management System<br/>
            <span className="text-slate-500 text-xs">Version 2.0.0 (Stable)</span>
          </p>
        </div>

        {/* Navigation */}
        <div className="text-center sm:text-left">
          <h3 className="text-xs font-semibold mb-4 text-slate-500 uppercase tracking-widest">Navigation</h3>
          <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li>
              <Link to="/home" className="hover:text-blue-400 hover:pl-1 transition-all duration-200 block">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-blue-400 hover:pl-1 transition-all duration-200 block">
                System Info
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-blue-400 hover:pl-1 transition-all duration-200 block">
                Protocols
              </Link>
            </li>
          </ul>
        </div>

        {/* Connect / Support */}
        <div className="text-center sm:text-left">
          <h3 className="text-xs font-semibold mb-4 text-slate-500 uppercase tracking-widest">IT Helpdesk</h3>
          <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li>
              <a href="mailto:support@visitrack.local" className="flex items-center justify-center sm:justify-start gap-2 hover:text-blue-400 hover:pl-1 transition-all duration-200">
                <LifeBuoy className="w-4 h-4" /> IT Support Post
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center justify-center sm:justify-start gap-2 hover:text-blue-400 hover:pl-1 transition-all duration-200">
                <BookOpen className="w-4 h-4" /> Internal Wiki
              </a>
            </li>
            <li>
              <a href="occurrence#" className="flex items-center justify-center sm:justify-start gap-2 hover:text-blue-400 hover:pl-1 transition-all duration-200">
                <Bug className="w-4 h-4" /> Report Issue
              </a>
            </li>
          </ul>
        </div>

        {/* Emergency Call */}
        <div className="text-center sm:text-left">
          <h3 className="text-xs font-semibold mb-4 text-red-500 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Emergency Priority
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 leading-relaxed">
            Need immediate assistance from security or admin team?
          </p>
          <a href="tel:254111949314" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-slate-900 dark:text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-red-900/40 border border-red-500/50">
            <PhoneCall className="w-4 h-4" />
            Call Security
          </a>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200 dark:border-slate-800 my-8"></div>

      {/* Bottom Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 font-medium">
        <div className="mb-2 md:mb-0 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          System Operational
        </div>
        <div>
          &copy; {new Date().getFullYear()} Magnet Nambale. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
