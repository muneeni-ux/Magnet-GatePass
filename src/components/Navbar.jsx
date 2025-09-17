
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
  const confirmed = window.confirm("Are you sure you want to log out?");
  if (confirmed) {
    // Remove token and user
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);

    // Show toast
    toast.success("Logged out successfully");

    // Close dropdown and redirect
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
    <div className="shadow-md fixed top-0 w-full z-20">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 py-4 px-6 flex items-center justify-between rounded-b-2xl shadow-lg relative">
        {/* Logo Left */}
        <div className="flex items-center gap-3">
          <img
            src={base64Logo}
            alt="Institution Logo"
            className="w-14 h-14 object-cover rounded-full border-4 border-white shadow-md"
          />
        </div>

        {/* Institution Name Center */}
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl md:text-3xl font-extrabold text-white tracking-wide">
          NAMBALE MAGNET VISITORS PASS
        </h1>

        {/* Right side: Profile + Menu */}
        <div
          className="flex items-center gap-4 text-white z-20 relative"
          ref={dropdownRef}
        >
          <div
            onClick={toggleDropdown}
            className="hover:text-yellow-300 cursor-pointer transition-all duration-300 relative"
          >
            <User size={28} />
          </div>

          {/* Dropdown Modal */}
          {dropdownOpen && (
            <div className="absolute top-14 right-0 mt-2 bg-white text-black rounded-xl shadow-2xl w-56 py-3 z-50 border border-blue-100">
              <button
                onClick={handleOccurrenceClick}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-blue-50 transition-all duration-300 text-sm font-medium"
              >
                <Book size={20} className="text-blue-600" />
                <span className="text-gray-800">Occurrence Book</span>
              </button>
              <div className="border-t border-gray-200 my-1"></div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 transition-all duration-300 text-sm font-medium"
              >
                <LogOut size={20} className="text-red-500" />
                <span className="text-red-600">Log Out</span>
              </button>
            </div>
          )}

          <div
            className="hover:text-yellow-300 cursor-pointer transition-all duration-300 md:hidden"
            onClick={toggleMenu}
          >
            {menuOpen ? <X size={32} /> : <Menu size={32} />}
          </div>
        </div>
      </div>

      {/* Side Navigation (Mobile) */}
      <nav
        className={`fixed top-0 left-0 w-64 h-full bg-blue-700 text-white z-30 transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-all duration-500 ease-in-out md:hidden`}
      >
        <div className="flex items-center justify-between p-6">
          <img
            src={base64Logo}
            alt="Institution Logo"
            className="w-12 h-12 object-cover rounded-full border-4 border-white"
          />
          <h1 className="absolute text-2xl font-extrabold text-white ml-16">
            Nambale Magnet School
          </h1>
        </div>

        {navItems.map((item) => (
          <div key={item.path} className="flex items-center gap-4 py-4 px-6">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 text-lg font-semibold py-2 px-4 rounded-lg transition-all duration-300
                ${
                  isActive
                    ? "bg-blue-600"
                    : "hover:bg-blue-600 hover:text-white"
                }`
              }
              onClick={() => setMenuOpen(false)}
            >
              {item.icon}
              {item.label}
            </NavLink>
          </div>
        ))}
      </nav>

      {/* Main Navigation (Desktop) */}
      <nav className="hidden md:flex md:items-center md:justify-center bg-blue-50 transition-all duration-500 ease-in-out">
        <ul className="flex flex-row items-center gap-4 py-4 px-6">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `relative text-lg font-semibold px-5 py-2 rounded-full transition-all duration-300
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white text-blue-600 hover:bg-blue-200 hover:text-blue-800"
                  }
                  border border-blue-400`
                }
              >
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
