import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

function Footer() {
  return (
    <footer className="relative bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white py-8 px-4 sm:px-6 rounded-t-[30px] mt-2">
      {/* Footer Content */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between gap-4">

        {/* About Section */}
        <div className="text-center sm:text-left leading-snug">
          <h2 className="text-lg font-bold mb-2 text-yellow-400">Magnet Nambale Gate-Pass Records</h2>
          <p className="text-white/90 max-w-xs mx-auto sm:mx-0 text-xs italic">
            Powered by community, built for access.
          </p>
        </div>

        {/* Quick Links Section */}
        <div className="text-center sm:text-left">
          <h3 className="text-base font-semibold mb-2 text-yellow-400">Quick Links</h3>
          <ul className="space-y-2 text-xs italic">
            <li><Link to="/" className="hover:text-yellow-300 hover:underline">Home</Link></li>
            <li><Link to="/about" className="hover:text-yellow-300 hover:underline">About</Link></li>
            <li><Link to="/help" className="hover:text-yellow-300 hover:underline">Help</Link></li>
            <li><Link to="/faq" className="hover:text-yellow-300 hover:underline">FAQ</Link></li>
          </ul>
        </div>

        {/* Social Icons Section */}
        <div className="text-center sm:text-left">
          <h3 className="text-base font-semibold mb-2 text-yellow-400">Follow Us</h3>
          <div className="flex justify-center sm:justify-start gap-4 text-xl">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300">
              <Facebook />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300">
              <Twitter />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300">
              <Instagram />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300">
              <Linkedin />
            </a>
            <a href="mailto:info@example.com" className="hover:text-yellow-300">
              <Mail />
            </a>
          </div>
        </div>
      </div>

      {/* Image Section */}
      <div className="mt-6 text-center">
        <img 
          src="https://thenambalemagnetschool.sc.ke/wp-content/uploads/2019/10/The-Nambale-Magnet-School.png" 
          alt="Ultravetis Logo" 
          className="w-20 h-20 mx-auto rounded-full shadow-md"
        />
      </div>

      {/* Bottom Section */}
      <div className="mt-4 text-center text-[10px] text-white/70 italic">
        © {new Date().getFullYear()} Magnet Nambale Visitors Gate-Pass Records. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
