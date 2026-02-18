import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

function Footer() {
  return (
    <footer className="relative bg-slate-900 border-t border-slate-800 text-slate-300 py-10 px-6 mt-auto font-sans">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">
        
        {/* Brand */}
        <div className="text-center sm:text-left">
          <h2 className="text-xs font-semibold mb-4 text-slate-500 uppercase tracking-widest">
            Identity
          </h2>
          <div className="flex items-center gap-3 justify-center sm:justify-start mb-4">
             <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
             <h1 className="text-xl font-bold tracking-tight text-white">MagTrack</h1>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            Nambale Magnet School<br/>
            Visitor Management System<br/>
            <span className="text-slate-500 text-xs">Version 2.0.0 (Stable)</span>
          </p>
        </div>

        {/* Navigation */}
        <div className="text-center sm:text-left">
          <h3 className="text-xs font-semibold mb-4 text-slate-500 uppercase tracking-widest">Navigation</h3>
          <ul className="space-y-2 text-sm text-slate-400">
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

        {/* Connect */}
        <div className="text-center sm:text-left">
          <h3 className="text-xs font-semibold mb-4 text-slate-500 uppercase tracking-widest">Connect</h3>
          <div className="flex justify-center sm:justify-start gap-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-full text-slate-400 hover:bg-blue-600 hover:text-white transition-all border border-slate-700 hover:border-blue-500">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-full text-slate-400 hover:bg-blue-600 hover:text-white transition-all border border-slate-700 hover:border-blue-500">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-full text-slate-400 hover:bg-blue-600 hover:text-white transition-all border border-slate-700 hover:border-blue-500">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-full text-slate-400 hover:bg-blue-600 hover:text-white transition-all border border-slate-700 hover:border-blue-500">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="mailto:info@example.com" className="p-2 bg-slate-800 rounded-full text-slate-400 hover:bg-blue-600 hover:text-white transition-all border border-slate-700 hover:border-blue-500">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-800 my-8"></div>

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
