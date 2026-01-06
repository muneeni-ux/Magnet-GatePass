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
    { path: "/home", label: "Home", icon: <Home size={20} /> },
    { path: "/form", label: "Form", icon: <BookOpen size={20} /> },
    { path: "/history", label: "History", icon: <Clock size={20} /> },
    { path: "/about", label: "About", icon: <Info size={20} /> },
  ];

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
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
    <div className="fixed top-0 w-full z-30 font-sans shadow-md">
      {/* Main Navbar */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600 px-10 py-5 flex items-center justify-between rounded-b-3xl min-h-[90px]">
        
        {/* Logo */}
        <div className="flex items-center gap-4">
          <img
            src={base64Logo}
            alt="Institution Logo"
            className="w-14 h-14 object-cover rounded-full border-2 border-white shadow hover:scale-105 transition-transform duration-300"
          />
          <h1 className="text-2xl font-extrabold text-white tracking-wide">
            MagTrack
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 text-base font-semibold px-6 py-3 rounded-full transition-all duration-300 ${
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

        {/* Profile + Mobile Menu */}
        <div
          className="flex items-center gap-4 text-white relative"
          ref={dropdownRef}
        >
          {/* User Icon */}
          <div
            onClick={toggleDropdown}
            className="cursor-pointer hover:text-yellow-300 transition-all duration-300"
          >
            <User size={30} />
          </div>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute top-14 right-0 bg-white text-black rounded-xl shadow-xl w-56 py-2 z-50 border border-blue-100">
              <button
                onClick={handleOccurrenceClick}
                className="w-full flex items-center gap-4 px-6 py-3 hover:bg-blue-50 text-base font-semibold"
              >
                <Book size={20} className="text-blue-600" />
                Occurrence Book
              </button>

              <div className="border-t my-1"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-6 py-3 hover:bg-red-50 text-base font-semibold"
              >
                <LogOut size={20} className="text-red-500" />
                <span className="text-red-600">Log Out</span>
              </button>
            </div>
          )}

          {/* Mobile Toggle */}
          <div
            className="md:hidden cursor-pointer hover:text-yellow-300"
            onClick={toggleMenu}
          >
            {menuOpen ? <X size={32} /> : <Menu size={32} />}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <nav
        className={`fixed top-0 left-0 w-72 h-full bg-gradient-to-b from-blue-900 to-blue-700 text-white z-40 transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-500 md:hidden shadow-2xl`}
      >
        <div className="flex items-center gap-4 p-6 border-b border-white/20 bg-blue-800/80">
          <img
            src={base64Logo}
            alt="Institution Logo"
            className="w-16 h-16 rounded-full border-2 border-white shadow"
          />
          <h1 className="text-2xl font-extrabold">MagTrack</h1>
        </div>

        <ul className="mt-6 space-y-2">
          {navItems.map((item) => (
            <li key={item.path} className="px-4">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 text-lg font-semibold py-3 px-5 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-blue-600 shadow-lg"
                      : "hover:bg-blue-500/70 hover:pl-7"
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
