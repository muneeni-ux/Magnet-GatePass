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
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
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
    "./magnetlogo.jpg";

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
    <div className="fixed top-0 w-full z-50 shadow-lg font-sans">
      {/* Main Navbar */}
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between min-h-[70px] backdrop-blur-md bg-opacity-95">
        {/* Logo */}
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => navigate("/home")}
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
            <img
              src={base64Logo}
              alt="Institution Logo"
              className="relative w-10 h-10 object-cover rounded-full border border-slate-300 dark:border-slate-700 shadow-md"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-slate-800 dark:text-gray-100 tracking-tight leading-none">
              Visitrack
            </h1>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
              Visitor Management System
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center bg-slate-50/50 dark:bg-slate-800/50 rounded-full px-2 py-1 border border-slate-300/50 dark:border-slate-700/50">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-medium px-5 py-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-700/50"
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
            className="p-2 mr-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
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

          {/* Notifications Dropdown (Desktop & Mobile share this bell structure for simplicity or we can duplicate. We will put it here for Desktop, and add another for mobile if needed, but it's flexed here so it shows on Desktop) */}
          <div className="relative" ref={notifRef}>
            <div
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              onClick={() => setNotifOpen(!notifOpen)}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] text-white font-bold ring-2 ring-white dark:ring-slate-900">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>

            {notifOpen && (
              <div className="absolute top-12 right-0 md:right-auto md:left-1/2 md:-translate-x-1/2 w-72 md:w-80 bg-white dark:bg-slate-900 border border-slate-300/50 dark:border-slate-700/50 rounded-xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                      {unreadCount} New
                    </span>
                  )}
                </div>

                <div className="max-h-[300px] overflow-y-auto overscroll-contain">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">
                      No notifications yet
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {notifications.map((notif) => {
                        const isUnread =
                          currentUser && !notif.readBy.includes(currentUser.id);
                        return (
                          <div
                            key={notif._id}
                            onClick={() => isUnread && markAsRead(notif._id)}
                            className={`p-4 border-b border-slate-200 dark:border-slate-800 transition-colors cursor-pointer ${
                              isUnread
                                ? "bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-700/80"
                                : "bg-transparent hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1 gap-2">
                              <h4
                                className={`text-sm ${isUnread ? "font-semibold text-slate-900 dark:text-white" : "font-medium text-slate-600 dark:text-slate-300"}`}
                              >
                                {notif.title}
                              </h4>
                              {isUnread && (
                                <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0"></span>
                              )}
                            </div>
                            <p
                              className={`text-xs ${isUnread ? "text-slate-600 dark:text-slate-300" : "text-slate-500"}`}
                            >
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-500 mt-2 block">
                              {new Date(notif.createdAt).toLocaleDateString()}
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
              <span className="text-xs text-slate-700 dark:text-gray-200 font-semibold">
                Administrator
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] text-emerald-500 font-medium">
                  Online
                </span>
              </div>
            </div>
            <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 group-hover:border-slate-400 dark:group-hover:border-slate-600 transition-colors">
              <User
                size={18}
                className="text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
              />
            </div>
          </div>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute top-14 right-0 bg-white dark:bg-slate-900 text-slate-700 dark:text-gray-200 rounded-lg shadow-xl w-60 py-2 z-50 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 mb-1">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                  Account
                </p>
              </div>

              <button
                onClick={handleOccurrenceClick}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm transition-colors text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                <Book size={16} className="text-blue-500" />
                Incident Report
              </button>

              <button
                onClick={() => {
                  navigate("/profile");
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm transition-colors text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                <Shield size={16} className="text-emerald-500" />
                Security Profile
              </button>

              <div className="border-t border-slate-200 dark:border-slate-800 my-1"></div>

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
            className="md:hidden cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            onClick={toggleMenu}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <nav
        className={`fixed top-0 left-0 w-72 h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-slate-800 dark:text-gray-100 z-40 transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 md:hidden shadow-2xl border-r border-slate-200 dark:border-slate-800`}
      >
        <div className="flex items-center gap-4 p-6 border-b border-slate-200 dark:border-slate-800">
          <img
            src="./magnetlogo.jpg"
            alt="Institution Logo"
            className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700"
          />
          <div>
            <h1 className="text-lg font-bold">Visitrack</h1>
            <p className="text-xs text-slate-500">System Mobile</p>
          </div>
        </div>

        <ul className="mt-6 space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-600/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
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

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-red-900/20 text-slate-600 dark:text-slate-300 hover:text-red-400 rounded-lg transition-all border border-slate-300 dark:border-slate-700 hover:border-red-900/30"
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
