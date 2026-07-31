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
  PhoneCall,
  Sun,
  Moon,
  LifeBuoy,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

import { useSettings } from "../context/SettingsContext";
import { socket } from "../services/socket";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Navbar = ({ setIsLoggedIn }) => {
  const { settings } = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSosModal, setShowSosModal] = useState(false);
  const [dispatchingSos, setDispatchingSos] = useState(false);

  const handleTriggerSosPanic = async () => {
    setDispatchingSos(true);
    try {
      const sosNum = settings?.sosPhone || "0700000000";
      const userName = currentUser?.name || "Security Personnel";
      
      // 1. Post emergency occurrence
      await axios.post(`${SERVER_URL}/api/occurrences`, {
        gate: "Main Gate",
        endTime: new Date().toISOString(),
        unusualOccurrence: "Yes",
        unusualDescription: `🚨 INSTANT SOS PANIC ALERT triggered by ${userName}`,
        sendEmergencySms: true,
        isEmergency: true,
        submittedBy: currentUser?.id || null,
      }).catch(() => {});

      toast.success("🚨 Emergency SOS Panic Alert dispatched!");
      setShowSosModal(false);

      // 2. Initiate Call
      window.location.href = `tel:${sosNum}`;
    } catch (err) {
      console.error(err);
      toast.error("Failed to dispatch SOS alert");
    } finally {
      setDispatchingSos(false);
    }
  };
  
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

    // WebSockets Live Listeners
    socket.on("notification:new", (newNotif) => {
      toast.custom(
        (t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-slate-900 text-white shadow-2xl rounded-2xl pointer-events-auto flex p-4 border border-blue-500/40`}>
            <div className="flex-1">
              <p className="text-xs uppercase font-mono font-bold text-blue-400">🔔 New Notification</p>
              <p className="text-sm font-bold mt-0.5">{newNotif.title}</p>
              <p className="text-xs text-slate-300 mt-1">{newNotif.message}</p>
            </div>
          </div>
        ),
        { duration: 5000 }
      );
      fetchNotifications();
    });

    socket.on("sos:alert", (sosData) => {
      toast.custom(
        (t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-red-950 text-white shadow-2xl rounded-2xl pointer-events-auto flex p-4 border border-red-500`}>
            <div className="flex-1">
              <p className="text-xs uppercase font-mono font-bold text-red-400">🚨 EMERGENCY SOS BROADCAST</p>
              <p className="text-sm font-extrabold mt-0.5">{sosData.title || sosData.type}</p>
              <p className="text-xs text-red-200 mt-1">{sosData.description} at Gate: {sosData.gateLocation || sosData.gate || 'Main Gate'}</p>
            </div>
          </div>
        ),
        { duration: 8000 }
      );
      fetchNotifications();
    });

    return () => {
      socket.off("notification:new");
      socket.off("sos:alert");
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
    { path: "/form", label: "Visitor Check-In", icon: <BookOpen size={18} /> },
    { path: "/history", label: "Visitor History", icon: <Clock size={18} /> },
    { path: "/helpdesk", label: "Support & Help", icon: <LifeBuoy size={18} /> },
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
      <div className="glass-panel border-x-0 border-t-0 border-b border-white/60 dark:border-slate-800/80 px-3 sm:px-6 py-2.5 flex items-center justify-between min-h-[64px] sm:min-h-[70px] transition-all duration-300">
        {/* Logo */}
        <div
          className="flex items-center gap-2 sm:gap-4 cursor-pointer group"
          onClick={() => navigate("/home")}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
            <img
              src={settings?.logoUrl || base64Logo}
              alt="Institution Logo"
              className="relative w-9 h-9 sm:w-10 sm:h-10 object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = base64Logo;
              }}
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-gray-100 tracking-tight leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>
              VISITRACK<span className="text-blue-600 dark:text-emerald-400">.OS</span>
            </h1>
            <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-widest uppercase mt-0.5">
              Visitor Management
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
          className="flex items-center gap-2 sm:gap-4 text-slate-900 dark:text-white relative"
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
            <button 
              onClick={() => setShowSosModal(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-3.5 py-1.5 rounded-full transition-all border border-red-500/30 group shadow-md"
              title={`Emergency Call & SOS Panic (${settings?.sosPhone || "SOS"})`}
            >
              <div className="p-1 rounded-full bg-white transition-colors shadow-lg">
                <PhoneCall size={12} className="text-red-600 animate-pulse" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">SOS PANIC</span>
            </button>
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
                      No new notifications.
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
                {currentUser?.username || "Visitor Officer"}
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
                  Account Details
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
                My Profile
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
        </div>
      </div>

      {/* INSTANT SOS PANIC ALERT MODAL */}
      {showSosModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden animate-in fade-in duration-150">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-md"
            onClick={() => setShowSosModal(false)}
          ></div>
          <div className="bg-white dark:bg-slate-900 border border-red-500/40 shadow-2xl rounded-3xl p-6 sm:p-8 w-full max-w-md relative z-10 animate-in zoom-in-95 duration-150 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-300 dark:border-red-500/40 shadow-lg animate-pulse">
              <PhoneCall size={32} />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              🚨 Emergency SOS Panic Alert
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-xs font-medium mb-6 leading-relaxed">
              Are you sure you want to dispatch an instant security panic alert? This will immediately send an Emergency Broadcast SMS to <span className="font-mono font-bold text-red-600">{settings?.sosPhone || "0700000000"}</span> and initiate a call.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleTriggerSosPanic}
                disabled={dispatchingSos}
                className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
              >
                <PhoneCall size={16} /> {dispatchingSos ? "Dispatching SOS..." : "🚨 DISPATCH EMERGENCY SMS & CALL NOW"}
              </button>

              <button
                onClick={() => setShowSosModal(false)}
                className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
