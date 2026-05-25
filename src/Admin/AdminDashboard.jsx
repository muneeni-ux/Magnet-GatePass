// src/Admin/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import {
  Users2,
  BarChart3,
  FileText,
  LogOut,
  FileClock as FileClockIcon,
  Menu as MenuIcon,
  X as CloseIcon,
  MessageCircleDashed,
  User,
  Sun,
  Moon,
} from "lucide-react";

const links = [
  {
    to: "/magnet/admin/dashboard/users",
    label: "Users",
    icon: <Users2 size={18} />,
  },
  {
    to: "/magnet/admin/dashboard/analytics",
    label: "Analytics",
    icon: <BarChart3 size={18} />,
  },
  {
    to: "/magnet/admin/dashboard/visitorsdetails",
    label: "Visitors Details",
    icon: <FileText size={18} />,
  },
  {
    to: "/magnet/admin/dashboard/occurrence",
    label: "Occurrences",
    icon: <FileClockIcon size={18} />,
  },
  {
    to: "/magnet/admin/dashboard/inquiry",
    label: "Inquiry",
    icon: <User size={18} />,
  },
  {
    to: "/magnet/admin/dashboard/faq",
    label: "FAQ",
    icon: <MessageCircleDashed size={18} />,
  },
];

const AdminDashboard = ({ theme, setTheme }) => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  /* Auto-logout on token expiry */
  const handleLogout = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("user");
    navigate("/"); // back to login
    window.location.reload();
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    try {
      const { exp } = JSON.parse(atob(token.split(".")[1]));
      const timeout = exp * 1000 - Date.now();
      const id = setTimeout(handleLogout, timeout);
      return () => clearTimeout(id);
    } catch (_) {
      /* ignore malformed token */
    }
  }, [handleLogout]);

  return (
    <div className="flex h-screen font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* ───── Sidebar ───── */}
      <aside
        className={`fixed z-30 top-0 h-full w-64 transform bg-slate-900 border-r border-slate-800 text-white shadow-xl transition-transform duration-300 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-850 bg-slate-950/80 backdrop-blur">
          <h2 className="text-lg font-bold tracking-wide text-blue-400">
            GATE PASS ADMIN
          </h2>
          <button
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setOpen(false)}
          >
            <CloseIcon size={22} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="mt-6 px-4 space-y-1">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-205 
                 ${
                   isActive
                     ? "bg-blue-600 text-white shadow-lg"
                     : "text-slate-350 hover:bg-slate-800 hover:text-white"
                 }`
              }
            >
              {icon}
              <span className="text-sm font-semibold">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-6 inset-x-0 px-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md transition-colors"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>

      {/* ───── Main Content ───── */}
      <main
        className={`flex-1 overflow-y-auto transition-all duration-300 bg-slate-50 dark:bg-slate-950 ${
          open ? "md:ml-64" : ""
        }`}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-20 transition-colors">
          
          {/* Mobile menu button */}
          <button
            className="md:hidden text-slate-700 dark:text-slate-300 hover:text-blue-600"
            onClick={() => setOpen(true)}
          >
            <MenuIcon size={24} />
          </button>

          {/* Title */}
          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            MagTrack — Admin Dashboard
          </h1>

          {/* Controls & Profile */}
          <div className="flex items-center gap-4">
            
            {/* Theme Switch */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Toggle theme"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Profile Avatar */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-xl flex items-center justify-center font-bold">
                A
              </div>
            </div>
          </div>
        </div>

        {/* Routed Content */}
        <div className="p-8">
          <Outlet context={{ theme }} />
        </div>
      </main>
    </div>
  );
};

export const AdminRoutes = () => <Navigate to="users" replace />;
export default AdminDashboard;
