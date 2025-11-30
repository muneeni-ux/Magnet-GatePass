// src/components/Admin/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import {
  Users2,
  UserPlus,
  FileText,
  LogOut,
  FileClock as FileClockIcon,
  Menu as MenuIcon,
  X as CloseIcon,
  MessageCircleDashed,
  User,
} from "lucide-react";

const links = [
  {
    to: "/magnet/admin/dashboard/users",
    label: "Users",
    icon: <Users2 size={18} />,
  },
  {
    to: "/magnet/admin/dashboard/usersignup",
    label: "User Sign-Up",
    icon: <UserPlus size={18} />,
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

const AdminDashboard = () => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  /* Auto-logout on token expiry */
  const handleLogout = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("user");
    navigate("/"); // back to admin login
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
    <div className="flex h-screen font-sans bg-gray-100">
      {/* ───── Sidebar ───── */}
      <aside
        className={`fixed z-30 top-0 h-full w-64 transform bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 text-white shadow-xl border-r border-gray-700 transition-transform duration-300 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-900/60 backdrop-blur">
          <h2 className="text-lg font-bold tracking-wide text-blue-400">
            GATE PASS ADMIN
          </h2>
          <button
            className="md:hidden text-gray-400 hover:text-white"
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
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 
                 ${
                   isActive
                     ? "bg-blue-600 text-white shadow-md"
                     : "text-gray-300 hover:bg-gray-800 hover:text-white"
                 }`
              }
            >
              {icon}
              <span className="text-sm font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-6 inset-x-0 px-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow transition"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>

      {/* ───── Main Content ───── */}
      <main
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          open ? "md:ml-64" : ""
        }`}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-white shadow-md sticky top-0 z-20">
          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-700 hover:text-blue-600"
            onClick={() => setOpen(true)}
          >
            <MenuIcon size={24} />
          </button>

          {/* Title */}
          <h1 className="text-lg font-semibold text-gray-800 md:ml-20">
            MagTrack — Admin Dashboard
          </h1>

          {/* Profile placeholder */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
              A
            </div>
          </div>
        </div>

        {/* Routed Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export const AdminRoutes = () => <Navigate to="users" replace />;
export default AdminDashboard;
