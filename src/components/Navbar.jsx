// src/components/Navbar.jsx
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
  Sun,
  Moon,
  RefreshCw,
  Settings,
} from "lucide-react";
import toast from "react-hot-toast";
import { getPendingSyncCount, syncOfflineData } from "../utils/offlineSync";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Navbar = ({ setIsLoggedIn, theme, setTheme }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pendingSyncs, setPendingSyncs] = useState(0);
  const [syncing, setSyncing] = useState(false);

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

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (confirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (setIsLoggedIn) setIsLoggedIn(false);
      toast.success("Logged out successfully");
      setDropdownOpen(false);
      navigate("/");
      // Refresh the page to clear all memory states
      window.location.reload();
    }
  };

  const handleDropdownItemClick = (path) => {
    navigate(path);
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  const base64Logo =
    "https://thenambalemagnetschool.sc.ke/wp-content/uploads/2019/10/The-Nambale-Magnet-School.png";

  // Check IndexedDB for pending sync counts
  const updatePendingCount = async () => {
    const count = await getPendingSyncCount();
    setPendingSyncs(count);
  };

  // Perform background sync when internet is restored or sync button is clicked
  const handleSync = async () => {
    if (!navigator.onLine) {
      toast.error("You are currently offline. Cannot sync data yet.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) return;

    setSyncing(true);
    const syncToast = toast.loading("Syncing offline visitor records...");
    
    try {
      const synced = await syncOfflineData(SERVER_URL, token, () => {
        // Dispatch custom event to notify other pages (like History) to reload
        window.dispatchEvent(new Event("sync-complete"));
      });
      
      toast.dismiss(syncToast);
      if (synced) {
        // toast inside syncOfflineData handles success
      } else {
        toast.success("All data is up to date!");
      }
    } catch (error) {
      toast.dismiss(syncToast);
      toast.error("Offline sync failed.");
    } finally {
      setSyncing(false);
      updatePendingCount();
    }
  };

  useEffect(() => {
    updatePendingCount();

    // Check every 5 seconds for pending offline items
    const interval = setInterval(updatePendingCount, 5000);

    // Sync automatically on connection recovery
    const handleOnline = () => {
      toast.success("Network connection restored! Auto-syncing...");
      handleSync();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("sync-triggered", updatePendingCount);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("sync-triggered", updatePendingCount);
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed top-0 w-full z-40 font-sans px-4 pt-3">
      {/* Premium Glassmorphism Navbar */}
      <div className="glass bg-white/75 dark:bg-slate-900/75 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl px-6 py-3 flex items-center justify-between shadow-lg transition-all duration-300">
        
        {/* Left - Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/home")}>
          <img
            src={base64Logo}
            alt="School Logo"
            className="w-10 h-10 object-cover rounded-full border border-slate-200 dark:border-slate-700 shadow hover:scale-105 transition-transform duration-300"
          />
          <h1 className="text-xl font-extrabold text-blue-600 dark:text-blue-400 tracking-wide">
            MagTrack
          </h1>
        </div>

        {/* Center - Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md dark:bg-blue-500"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right - Profile, Offline Sync, Theme Switch, Mobile menu */}
        <div className="flex items-center gap-3 relative" ref={dropdownRef}>
          
          {/* Offline Sync Status Indicator */}
          {pendingSyncs > 0 && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-slate-900 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md animate-pulse transition"
              title={`${pendingSyncs} items pending sync. Click to sync now.`}
            >
              <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Sync ({pendingSyncs})</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle color theme"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* User Dropdown */}
          <button
            onClick={toggleDropdown}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="User menu"
          >
            <User size={20} />
          </button>

          {dropdownOpen && (
            <div className="absolute top-12 right-0 mt-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl shadow-xl w-52 py-2 z-50 border border-slate-100 dark:border-slate-700 animate-fade-in">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Logged In As</p>
                <p className="text-sm font-bold truncate">
                  {JSON.parse(localStorage.getItem("user"))?.username || "Guard"}
                </p>
              </div>
              <button
                onClick={() => handleDropdownItemClick("/profile")}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all text-sm font-semibold"
              >
                <Settings size={18} className="text-slate-500" />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => handleDropdownItemClick("/occurrence")}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all text-sm font-semibold"
              >
                <Book size={18} className="text-blue-500" />
                <span>Occurrence Book</span>
              </button>
              <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all text-sm font-semibold"
              >
                <LogOut size={18} className="text-red-500" />
                <span className="text-red-650 dark:text-red-400">Log Out</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors md:hidden text-slate-600 dark:text-slate-300"
            onClick={toggleMenu}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar (Mobile) */}
      <nav
        className={`fixed top-0 left-0 w-64 h-full bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 z-50 transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-all duration-300 ease-in-out md:hidden shadow-2xl`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src={base64Logo}
              alt="School Logo"
              className="w-10 h-10 object-cover rounded-full border"
            />
            <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400">MagTrack</h1>
          </div>
          <button onClick={() => setMenuOpen(false)} className="text-slate-500">
            <X size={20} />
          </button>
        </div>

        <ul className="mt-4 px-4 space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 text-base font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md dark:bg-blue-500"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`
                }
                onClick={() => setMenuOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
          <li>
            <button
              onClick={() => handleDropdownItemClick("/profile")}
              className="w-full flex items-center gap-3 text-base font-semibold py-2.5 px-4 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <Settings size={16} />
              <span>My Profile</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => handleDropdownItemClick("/occurrence")}
              className="w-full flex items-center gap-3 text-base font-semibold py-2.5 px-4 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <Book size={16} className="text-blue-500" />
              <span>Occurrence Book</span>
            </button>
          </li>
          <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
          <li>
            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-3 text-base font-semibold py-2.5 px-4 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
            >
              <LogOut size={16} className="text-red-500" />
              <span>Log Out</span>
            </button>
          </li>
        </ul>
      </nav>
      
      {/* Mobile Sidebar Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Navbar;
