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
} from "lucide-react";
import toast from "react-hot-toast";

const Navbar = ({ setIsLoggedIn }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const navItems = [
    { path: "/home", label: "Home", icon: <Home size={16} /> },
    { path: "/form", label: "Form", icon: <BookOpen size={16} /> },
    { path: "/history", label: "History", icon: <Clock size={16} /> },
    { path: "/about", label: "About", icon: <Info size={16} /> },
  ];

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (confirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      toast.success("Logged out successfully");
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

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="shadow-md fixed top-0 w-full z-30 font-sans">
      {/* Single Layer Navbar (Desktop & Mobile) */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600 px-6 py-3 flex items-center justify-between shadow-md rounded-b-3xl">
        {/* Left - Logo */}
        <div className="flex items-center gap-3">
          <img
            src={base64Logo}
            alt="Institution Logo"
            className="w-10 h-10 object-cover rounded-full border-2 border-white shadow hover:scale-105 transition-transform duration-300"
          />
          <h1 className="text-lg font-bold text-white tracking-wide">
            Nambale Magnet Visitors Pass
          </h1>
        </div>

        {/* Center - Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-white text-blue-700 shadow-md"
                    : "text-white hover:bg-blue-800/70"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right - Profile + Mobile Menu */}
        <div className="flex items-center gap-3 text-white relative" ref={dropdownRef}>
          {/* User Dropdown */}
          <div
            onClick={toggleDropdown}
            className="hover:text-yellow-300 cursor-pointer transition-all duration-300"
          >
            <User size={24} />
          </div>

          {dropdownOpen && (
            <div className="absolute top-12 right-0 mt-2 bg-white text-black rounded-xl shadow-xl w-52 py-2 z-50 border border-blue-100 animate-fade-in">
              <button
                onClick={handleOccurrenceClick}
                className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-blue-50 transition-all text-sm font-medium"
              >
                <Book size={18} className="text-blue-600" />
                <span>Occurrence Book</span>
              </button>
              <div className="border-t border-gray-200 my-1"></div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-red-50 transition-all text-sm font-medium"
              >
                <LogOut size={18} className="text-red-500" />
                <span className="text-red-600">Log Out</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <div
            className="hover:text-yellow-300 cursor-pointer transition-all duration-300 md:hidden"
            onClick={toggleMenu}
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </div>
        </div>
      </div>

      {/* Sidebar (Mobile) */}
      <nav
        className={`fixed top-0 left-0 w-64 h-full bg-gradient-to-b from-blue-900 to-blue-700 text-white z-40 transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-all duration-500 ease-in-out md:hidden shadow-2xl`}
      >
        <div className="flex items-center gap-3 p-6 border-b border-white/20 bg-blue-800/80">
          <img
            src={base64Logo}
            alt="Institution Logo"
            className="w-12 h-12 object-cover rounded-full border-2 border-white shadow"
          />
          <h1 className="text-lg font-extrabold">Nambale Magnet</h1>
        </div>

        <ul className="mt-4">
          {navItems.map((item) => (
            <li key={item.path} className="px-4">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 text-base font-medium py-2.5 px-4 rounded-lg transition-all duration-300 ${
                    isActive
                      ? "bg-blue-600 shadow-lg"
                      : "hover:bg-blue-500/70 hover:pl-6"
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
      </nav>
    </div>
  );
};

export default Navbar;
