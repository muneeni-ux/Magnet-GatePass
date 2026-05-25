// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

function Footer() {
  const base64Logo =
    "https://thenambalemagnetschool.sc.ke/wp-content/uploads/2019/10/The-Nambale-Magnet-School.png";

  return (
    <footer className="w-full bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800/80 text-slate-650 dark:text-slate-350 py-12 px-6 transition-colors duration-300">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">
        
        {/* Brand & About */}
        <div className="text-center sm:text-left space-y-3">
          <h2 className="text-lg font-black tracking-wide text-blue-600 dark:text-blue-400">
            MagTrack
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
            A state-of-the-art secure digital gatekeeper system designed to record, audit, and coordinate visitors coming into the school.
          </p>
        </div>

        {/* Quick Links */}
        <div className="text-center sm:text-left space-y-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-450 dark:text-slate-500">Quick Navigation</h3>
          <ul className="space-y-2 text-sm font-semibold">
            <li>
              <Link to="/home" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                Home Dashboard
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                Help Desk & FAQ
              </Link>
            </li>
            <li>
              <Link to="/form" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                Visitor Registration
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Links & Support */}
        <div className="text-center sm:text-left space-y-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-450 dark:text-slate-500">Connect With Us</h3>
          <div className="flex justify-center sm:justify-start gap-4 text-xl">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition" title="Facebook">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition" title="Twitter">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition" title="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition" title="LinkedIn">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="mailto:info@thenambalemagnetschool.sc.ke" className="hover:text-blue-600 dark:hover:text-blue-400 transition" title="Email Info">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200 dark:border-slate-800 my-8 max-w-6xl mx-auto"></div>

      {/* Institutional Branding */}
      <div className="flex flex-col items-center gap-3">
        <img
          src={base64Logo}
          alt="The Nambale Magnet School"
          className="w-12 h-12 object-cover rounded-full shadow border border-slate-200 dark:border-slate-800 hover:scale-105 transition-transform"
        />
        <div className="text-center text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
          © {new Date().getFullYear()} The Nambale Magnet School. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
