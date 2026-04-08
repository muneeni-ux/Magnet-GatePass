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
  Bell,
  CheckCircle,
  PhoneCall,
  Sun,
  Moon,
  LifeBuoy,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Navbar = ({ setIsLoggedIn }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Theme state
  const [isDark, setIsDark] = useState(() => {
    if (localStorage.getItem('theme') === 'dark') return true;
    if (localStorage.getItem('theme') === 'light') return false;
    return true; // Default dark because existing codebase is dark
  });

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    fetchNotifications();
    
    // Easier method logic: Only poll when the tab is visible and increase interval to reduce DB requests
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    }, 60000); 

    // Fetch immediately when user returns to the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/notifications?activeOnly=true`);
      const allNotifs = response.data;
      setNotifications(allNotifs);

      // calculate unread count based on readBy array
      if (currentUser) {
        const unread = allNotifs.filter(
          (n) => !n.readBy.includes(currentUser.id),
        );
        setUnreadCount(unread.length);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${SERVER_URL}/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Update local state optimistic UI
      setNotifications((prev) =>
        prev.map((n) => {
          if (n._id === notificationId && !n.readBy.includes(currentUser.id)) {
            return { ...n, readBy: [...n.readBy, currentUser.id] };
          }
          return n;
        }),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const navItems = [
    { path: "/home", label: "Dashboard", icon: <Home size={18} /> },
    { path: "/form", label: "Entry Log", icon: <BookOpen size={18} /> },
    { path: "/history", label: "Archives", icon: <Clock size={18} /> },
    { path: "/about", label: "System Info", icon: <Info size={18} /> },
    { path: "/helpdesk", label: "Help Desk", icon: <LifeBuoy size={18} /> },
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
    "./VisiTrack-L51.png";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed top-0 w-full z-50 shadow-[0_10px_30px_rgb(0,0,0,0.05)] font-sans">
      {/* Main Navbar */}
      <div className="glass-panel border-x-0 border-t-0 border-b border-white/60 dark:border-slate-800/80 px-6 py-3 flex items-center justify-between min-h-[70px] transition-all duration-300">
        {/* Logo */}
        <div
          className="flex items-center gap-4 cursor-pointer group"
          onClick={() => navigate("/home")}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
            <img
              src={base64Logo}
              alt="Institution Logo"
              className="relative w-10 h-10 object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold text-slate-800 dark:text-gray-100 tracking-tight leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>
              VISITRACK<span className="text-blue-600 dark:text-emerald-400">.OS</span>
            </h1>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-widest uppercase mt-0.5">
              Secure Terminal
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center bg-white/40 dark:bg-slate-800/40 rounded-2xl px-2 py-1.5 border border-white/60 dark:border-slate-700/60 shadow-inner backdrop-blur-md">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-bold px-5 py-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-white dark:bg-slate-700/80 text-blue-600 dark:text-emerald-400 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-white/80 dark:border-slate-600 scale-105"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50"
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
          className="flex items-center gap-6 text-slate-900 dark:text-white relative"
          ref={dropdownRef}
        >
          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-10 h-10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-emerald-400 rounded-xl bg-white/40 dark:bg-slate-800/40 border border-white/60 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-all"
            title="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Emergency Call Button */}
          <div className="hidden sm:flex items-center">
            <a 
              href="tel:254111949314" 
              className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-full transition-all border border-red-500/30 group"
              title="Emergency Call"
            >
              <div className="p-1 rounded-full bg-red-500 group-hover:bg-white transition-colors shadow-lg shadow-red-900/50">
                <PhoneCall size={12} className="text-white group-hover:text-red-600 animate-pulse" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">SOS</span>
            </a>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer transition-all border shadow-sm ${notifOpen ? 'bg-white dark:bg-slate-900 border-white/80 dark:border-slate-600 text-blue-600 dark:text-emerald-400 scale-105' : 'bg-white/40 dark:bg-slate-900/40 border-white/60 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:text-blue-600 dark:hover:text-emerald-400'}`}
              onClick={() => setNotifOpen(!notifOpen)}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white font-extrabold shadow-[0_0_10px_rgba(239,68,68,0.5)] border-2 border-slate-50 dark:border-slate-900">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>

            {notifOpen && (
              <div className="absolute top-14 right-0 md:right-auto md:left-1/2 md:-translate-x-1/2 w-[320px] md:w-[380px] bg-white dark:bg-slate-900 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.7)] z-50 overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex justify-between items-center">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-widest">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wide bg-red-500/20 text-red-600 dark:text-red-400 px-2.5 py-1 rounded-lg border border-red-500/30">
                      {unreadCount} Unread
                    </span>
                  )}
                </div>

                <div className="max-h-[350px] overflow-y-auto overscroll-contain custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm font-bold bg-white/20 dark:bg-slate-900/20">
                      SYSTEM CLEAR. NO ACTIVE ALERTS.
                    </div>
                  ) : (
                    <div className="flex flex-col p-2 space-y-2">
                      {notifications.map((notif) => {
                        const isUnread =
                          currentUser && !notif.readBy.includes(currentUser.id);
                        return (
                          <div
                            key={notif._id}
                            onClick={() => isUnread && markAsRead(notif._id)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer ${
                              isUnread
                                ? "bg-white/60 dark:bg-slate-800/80 border-blue-200 dark:border-emerald-500/30 shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
                                : "bg-transparent border-transparent hover:bg-white/40 dark:hover:bg-slate-800/40 hover:border-white/20 dark:hover:border-slate-700/30"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1.5 gap-2">
                              <h4
                                className={`text-sm tracking-tight ${isUnread ? "font-extrabold text-slate-900 dark:text-emerald-400" : "font-bold text-slate-600 dark:text-slate-300"}`}
                              >
                                {notif.title}
                              </h4>
                              {isUnread && (
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 dark:bg-emerald-500 mt-1 flex-shrink-0 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                              )}
                            </div>
                            <p
                              className={`text-xs leading-relaxed ${isUnread ? "text-slate-700 dark:text-slate-200 font-medium" : "text-slate-500 dark:text-slate-400"}`}
                            >
                              {notif.message}
                            </p>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-3 block uppercase tracking-widest font-mono">
                              {new Date(notif.createdAt).toLocaleString(undefined, {
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Icon */}
          <div
            onClick={toggleDropdown}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[11px] text-slate-800 dark:text-gray-200 font-extrabold uppercase tracking-widest">
                {currentUser?.username || "Administrator"}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-widest font-mono">
                  Online
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/40 dark:bg-slate-800/40 border border-white/60 dark:border-slate-700/60 group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:border-blue-200 dark:group-hover:border-emerald-500/50 shadow-sm transition-all">
              <User
                size={18}
                className="text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-emerald-400"
              />
            </div>
          </div>

          {dropdownOpen && (
            <div className="absolute top-16 right-0 bg-white dark:bg-slate-900 text-slate-700 dark:text-gray-200 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.7)] w-64 p-2 z-50 animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700">
              <div className="px-4 py-3 mb-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-widest">
                  System Account
                </p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                  {currentUser?.email || "admin@visitrack.com"}
                </p>
              </div>

              <button
                onClick={handleOccurrenceClick}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/60 dark:hover:bg-slate-800/80 text-sm font-bold transition-all text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-emerald-400"
              >
                <div className="p-1.5 bg-blue-100/50 dark:bg-emerald-500/10 rounded-lg text-blue-600 dark:text-emerald-400">
                  <Book size={16} />
                </div>
                Incident Report
              </button>

              <button
                onClick={() => {
                  navigate("/profile");
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/60 dark:hover:bg-slate-800/80 text-sm font-bold transition-all text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-emerald-400"
              >
                <div className="p-1.5 bg-indigo-100/50 dark:bg-teal-500/10 rounded-lg text-indigo-600 dark:text-teal-400">
                  <Shield size={16} />
                </div>
                Security Profile
              </button>

              <div className="border-t border-white/40 dark:border-slate-700/50 my-2"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 dark:hover:bg-red-500/20 text-sm font-bold text-red-500 dark:text-red-400 transition-all border border-transparent hover:border-red-500/30"
              >
                <div className="p-1.5 bg-red-100/50 dark:bg-red-500/10 rounded-lg">
                  <LogOut size={16} />
                </div>
                Sign Out
              </button>
            </div>
          )}

          {/* Mobile Toggle */}
          <div
            className="md:hidden cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            onClick={toggleMenu}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <nav
        className={`fixed top-0 left-0 w-80 h-full glass-panel dark:glass-panel-dark bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl text-slate-800 dark:text-gray-100 z-40 transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-500 md:hidden shadow-2xl border-r border-white/50 dark:border-slate-700/50 flex flex-col`}
      >
        <div className="flex items-center gap-4 p-8 border-b border-white/40 dark:border-slate-800">
          <img
            src="./VisiTrack-L51.png"
            alt="Institution Logo"
            className="w-12 h-12 rounded-2xl shadow-md"
          />
          <div>
            <h1 className="text-xl font-extrabold" style={{ fontFamily: 'Outfit, sans-serif' }}>VISITRACK<span className="text-blue-600 dark:text-emerald-400">.OS</span></h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Mobile Terminal</p>
          </div>
        </div>

        <ul className="flex-1 overflow-y-auto mt-6 space-y-2 px-5">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all border ${
                    isActive
                      ? "bg-white/80 dark:bg-slate-800 border-white dark:border-slate-600 text-blue-600 dark:text-emerald-400 shadow-[0_4px_15px_rgba(0,0,0,0.05)]"
                      : "bg-transparent border-transparent text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
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

        <div className="p-6 border-t border-white/40 dark:border-slate-800 bg-white/20 dark:bg-slate-900/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold rounded-2xl transition-all border border-red-500/20 hover:border-red-500/40"
          >
            <LogOut size={18} />
            <span className="uppercase tracking-widest text-[11px]">Sign Out</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
