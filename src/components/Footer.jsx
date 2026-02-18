import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

function Footer() {
  return (
    <footer className="relative bg-slate-950 border-t border-blue-900/50 text-blue-100 py-10 px-6 mt-auto">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">
        
        {/* About */}
        <div className="text-center sm:text-left">
          <h2 className="text-sm font-bold mb-4 text-blue-500 uppercase tracking-widest">
            System Identity
          </h2>
          <div className="flex items-center gap-3 justify-center sm:justify-start mb-4">
             <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
             <h1 className="text-2xl font-bold tracking-tighter text-white">MagTrack</h1>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed font-mono">
            SECURE VISITOR MANAGEMENT PROTOCOL<br/>
            VERSION 2.4.0 (STABLE)<br/>
            AUTHORIZED ACCESS ONLY
          </p>
        </div>

        {/* Quick Links */}
        <div className="text-center sm:text-left">
          <h3 className="text-sm font-bold mb-4 text-blue-500 uppercase tracking-widest">Navigation</h3>
          <ul className="space-y-2 text-xs font-mono text-slate-400">
            <li>
              <Link to="/home" className="hover:text-blue-400 hover:pl-2 transition-all duration-300 block">
                [ DASHBOARD ]
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-blue-400 hover:pl-2 transition-all duration-300 block">
                [ SYSTEM INFO ]
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-blue-400 hover:pl-2 transition-all duration-300 block">
                [ PROTOCOLS ]
              </Link>
            </li>
          </ul>
        </div>

        {/* Socials */}
        <div className="text-center sm:text-left">
          <h3 className="text-sm font-bold mb-4 text-blue-500 uppercase tracking-widest">Network</h3>
          <div className="flex justify-center sm:justify-start gap-4 text-xl">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-900/20 rounded-sm text-blue-400 hover:bg-blue-600 hover:text-white transition-all border border-blue-900/50 hover:border-blue-400">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-900/20 rounded-sm text-blue-400 hover:bg-blue-600 hover:text-white transition-all border border-blue-900/50 hover:border-blue-400">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-900/20 rounded-sm text-blue-400 hover:bg-blue-600 hover:text-white transition-all border border-blue-900/50 hover:border-blue-400">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-900/20 rounded-sm text-blue-400 hover:bg-blue-600 hover:text-white transition-all border border-blue-900/50 hover:border-blue-400">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="mailto:info@example.com" className="p-2 bg-blue-900/20 rounded-sm text-blue-400 hover:bg-blue-600 hover:text-white transition-all border border-blue-900/50 hover:border-blue-400">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-blue-900/30 my-8"></div>

      {/* Bottom */}
      <div className="flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-500 font-mono uppercase tracking-wider">
        <div className="mb-2 md:mb-0">
          SYSTEM STATUS: <span className="text-green-500">OPERATIONAL</span>
        </div>
        <div className="italic">
          © {new Date().getFullYear()} Magnet Nambale // SECURE RECORDS DIVISION
        </div>
      </div>
    </footer>
  );
}

export default Footer;
