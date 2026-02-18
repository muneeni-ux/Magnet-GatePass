import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  User,
  Home,
  BookOpen,
  Clock,
  Info,
  LogOut,
  Book,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";

const Navbar = ({ setIsLoggedIn }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const navItems = [
    { path: "/home", label: "DASHBOARD", icon: <Home size={18} /> },
    { path: "/form", label: "ENTRY LOG", icon: <BookOpen size={18} /> },
    { path: "/history", label: "ARCHIVES", icon: <Clock size={18} /> },
    { path: "/about", label: "SYSTEM INFO", icon: <Info size={18} /> },
  ];

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    if (window.confirm("TERMINATE SESSION?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      toast.success("SESSION TERMINATED");
      setDropdownOpen(false);
      navigate("/");
    }
  };

  const handleOccurrenceClick = () => {
    navigate("/occurrence");
    setDropdownOpen(false);
  };

  const base64Logo =
    "https://thenambalemagnetschool.sc.ke/wp-content/uploads/2019/10/The-Nambale-Magnet-School.png";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed top-0 w-full z-50 font-mono shadow-2xl">
      {/* Main Navbar */}
      <div className="bg-slate-950 border-b border-blue-900/50 px-6 py-4 flex items-center justify-between min-h-[80px] backdrop-blur-md bg-opacity-95">
        
        {/* Logo */}
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/home')}>
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <img
              src={base64Logo}
              alt="Institution Logo"
              className="relative w-12 h-12 object-cover rounded-full border border-blue-500/30 shadow-lg group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-blue-100 tracking-widest uppercase" style={{ letterSpacing: '0.15em' }}>
              MagTrack
            </h1>
            <span className="text-[10px] text-blue-500 font-semibold tracking-wider">SECURITY CLEARANCE: LEVEL 1</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-sm transition-all duration-300 border border-transparent ${
                  isActive
                    ? "bg-blue-900/30 text-blue-400 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                    : "text-slate-400 hover:text-blue-300 hover:bg-blue-900/10"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Profile + Mobile Menu */}
        <div
          className="flex items-center gap-6 text-white relative"
          ref={dropdownRef}
        >
          {/* User Icon */}
          <div
            onClick={toggleDropdown}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="p-2 rounded-full bg-slate-900 border border-blue-800/50 group-hover:border-blue-500 transition-colors">
              <User size={20} className="text-blue-400 group-hover:text-blue-300" />
            </div>
            {/* Status Indicator */}
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-xs text-blue-200 font-bold">OPERATOR</span>
              <div className="flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                 <span className="text-[10px] text-green-500">ONLINE</span>
              </div>
            </div>
          </div>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute top-16 right-0 bg-slate-900 text-blue-100 rounded-sm shadow-[0_0_20px_rgba(0,0,0,0.5)] w-64 py-2 z-50 border border-blue-800 animate-in fade-in zoom-in-95 duration-200">
               <div className="px-4 py-2 border-b border-blue-900/50 mb-2">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">System Options</p>
               </div>
              
              <button
                onClick={handleOccurrenceClick}
                className="w-full flex items-center gap-3 px-6 py-3 hover:bg-blue-900/30 text-sm font-medium transition-colors"
              >
                <Book size={16} className="text-blue-500" />
                INCIDENT REPORT
              </button>

              <button
                onClick={() => {
                  navigate("/profile");
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-6 py-3 hover:bg-blue-900/30 text-sm font-medium transition-colors"
              >
                <Shield size={16} className="text-blue-500" />
                PERSONNEL FILE
              </button>

              <div className="border-t border-blue-900/50 my-2"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-6 py-3 hover:bg-red-900/20 text-sm font-medium text-red-400 transition-colors group"
              >
                <LogOut size={16} className="text-red-500 group-hover:text-red-400" />
                TERMINATE SESSION
              </button>
            </div>
          )}

          {/* Mobile Toggle */}
          <div
            className="md:hidden cursor-pointer text-blue-400 hover:text-white transition-colors"
            onClick={toggleMenu}
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <nav
        className={`fixed top-0 left-0 w-72 h-full bg-slate-950 text-blue-100 z-40 transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 md:hidden shadow-2xl border-r border-blue-900`}
      >
        <div className="flex items-center gap-4 p-6 border-b border-blue-900/50 bg-slate-900">
          <img
            src={base64Logo}
            alt="Institution Logo"
            className="w-12 h-12 rounded-full border border-blue-500/30"
          />
          <div>
             <h1 className="text-lg font-bold tracking-widest uppercase">MagTrack</h1>
             <p className="text-[10px] text-blue-500">MOBILE INTERFACE</p>
          </div>
        </div>

        <ul className="mt-8 space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 text-sm font-bold py-3 px-4 rounded-sm transition-all duration-300 border-l-2 ${
                    isActive
                      ? "bg-blue-900/20 border-blue-500 text-blue-400"
                      : "border-transparent text-slate-400 hover:bg-blue-900/10 hover:text-blue-300"
                  }`
                }
                onClick={() => setMenuOpen(false)}
              >
                {item.icon}
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

         <div className="absolute bottom-0 w-full p-4 border-t border-blue-900/50 bg-slate-900">
            <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-900/20 border border-red-900/50 hover:bg-red-900/30 text-red-500 rounded-sm transition-all"
              >
                <LogOut size={16} />
                <span className="text-xs font-bold tracking-wider">LOG OUT</span>
              </button>
         </div>
      </nav>
    </div>
  );
};

export default Navbar;
