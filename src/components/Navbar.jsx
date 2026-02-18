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
  Bell
} from "lucide-react";
import toast from "react-hot-toast";

const Navbar = ({ setIsLoggedIn }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const navItems = [
    { path: "/home", label: "Dashboard", icon: <Home size={18} /> },
    { path: "/form", label: "Entry Log", icon: <BookOpen size={18} /> },
    { path: "/history", label: "Archives", icon: <Clock size={18} /> },
    { path: "/about", label: "System Info", icon: <Info size={18} /> },
  ];

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      toast.success("Successfully logged out");
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
    <div className="fixed top-0 w-full z-50 shadow-lg font-sans">
      {/* Main Navbar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between min-h-[70px] backdrop-blur-md bg-opacity-95">
        
        {/* Logo */}
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/home')}>
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
            <img
              src={base64Logo}
              alt="Institution Logo"
              className="relative w-10 h-10 object-cover rounded-full border border-slate-700 shadow-md"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-gray-100 tracking-tight leading-none">
              MagTrack
            </h1>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">Visitor Management System</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center bg-slate-800/50 rounded-full px-2 py-1 border border-slate-700/50">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-medium px-5 py-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-slate-700 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
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
          {/* Notifications Placeholder */}
          <div className="hidden md:flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-800 cursor-pointer text-slate-400 hover:text-white transition-colors">
            <Bell size={18} />
          </div>

          {/* User Icon */}
          <div
            onClick={toggleDropdown}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs text-gray-200 font-semibold">Administrator</span>
              <div className="flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                 <span className="text-[10px] text-emerald-500 font-medium">Online</span>
              </div>
            </div>
            <div className="p-2 rounded-full bg-slate-800 border border-slate-700 group-hover:border-slate-600 transition-colors">
              <User size={18} className="text-slate-300 group-hover:text-white" />
            </div>
          </div>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute top-14 right-0 bg-slate-900 text-gray-200 rounded-lg shadow-xl w-60 py-2 z-50 border border-slate-800 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
               <div className="px-4 py-3 border-b border-slate-800 mb-1">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Account</p>
               </div>
              
              <button
                onClick={handleOccurrenceClick}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 text-sm transition-colors text-slate-300 hover:text-white"
              >
                <Book size={16} className="text-blue-500" />
                Incident Report
              </button>

              <button
                onClick={() => {
                  navigate("/profile");
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 text-sm transition-colors text-slate-300 hover:text-white"
              >
                <Shield size={16} className="text-emerald-500" />
                Security Profile
              </button>

              <div className="border-t border-slate-800 my-1"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-900/10 text-sm text-red-400/90 hover:text-red-400 transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}

          {/* Mobile Toggle */}
          <div
            className="md:hidden cursor-pointer text-slate-400 hover:text-white transition-colors"
            onClick={toggleMenu}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <nav
        className={`fixed top-0 left-0 w-72 h-full bg-slate-900/95 backdrop-blur-xl text-gray-100 z-40 transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 md:hidden shadow-2xl border-r border-slate-800`}
      >
        <div className="flex items-center gap-4 p-6 border-b border-slate-800">
          <img
            src="./magnetlogo.jpg"
            alt="Institution Logo"
            className="w-10 h-10 rounded-full border border-slate-700"
          />
          <div>
             <h1 className="text-lg font-bold">MagTrack</h1>
             <p className="text-xs text-slate-500">System Mobile</p>
          </div>
        </div>

        <ul className="mt-6 space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 text-sm font-medium py-3 px-4 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
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

         <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 bg-slate-900/50">
            <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-red-900/20 text-slate-300 hover:text-red-400 rounded-lg transition-all border border-slate-700 hover:border-red-900/30"
              >
                <LogOut size={16} />
                <span className="text-sm font-medium">Log Out</span>
              </button>
         </div>
      </nav>
    </div>
  );
};

export default Navbar;
