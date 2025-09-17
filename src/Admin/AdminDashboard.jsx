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
];

const AdminDashboard = () => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  /* ───────── Auto-logout on token expiry (simple client-side check) ───────── */
  // const handleLogout = () => {
  //   localStorage.removeItem("adminToken");
  //   localStorage.removeItem("user");
  //   navigate("/"); // back to admin login
  // };
  const handleLogout = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("user");
    navigate("/"); // Redirect to admin login
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    // naïve expiry extraction (assumes exp in payload & token is intact)
    try {
      const { exp } = JSON.parse(atob(token.split(".")[1]));
      const timeout = exp * 1000 - Date.now();
      const id = setTimeout(handleLogout, timeout);
      return () => clearTimeout(id);
    } catch (_) {
      /* silently ignore malformed token */
    }
  }, [handleLogout]);

  

  /* ───────────────────────────── Component ───────────────────────────── */
  return (
    <div className="flex h-screen font-sans bg-gray-100">
      {/* ░░░░░░░░░░░░░░ Sidebar ░░░░░░░░░░░░░░ */}
      <aside
        className={`fixed z-30 top-0 h-full w-64 transform bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 text-white transition-transform duration-300 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand / Close btn */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-600">
          <h2 className="text-lg font-bold tracking-wide text-pink-400">
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
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                 ${
                   isActive
                     ? "bg-gray-700 text-pink-300"
                     : "text-gray-300 hover:bg-gray-800 hover:text-white"
                 }`
              }
            >
              {icon}
              <span className="text-sm font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-6 inset-x-0 px-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2 rounded-lg bg-red-600/90 hover:bg-red-700 text-white text-sm font-semibold shadow"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>

      {/* ░░░░░░░░░░ Main Content ░░░░░░░░░░ */}
      <main
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          open ? "md:ml-64" : ""
        }`}
      >
        {/* top-bar for mobile */}
        <div className="flex items-center justify-between px-4 py-3 bg-white shadow">
          <button
            className="md:hidden text-gray-700 hover:text-pink-500"
            onClick={() => setOpen(true)}
          >
            <MenuIcon size={24} />
          </button>
          {/* <div className="text-center">
        <img 
          src="https://agroduka.ke/images/thumbnails/240/240/logos/8/6d0My9wH_400x400.jpg" 
          alt="Ultravetis Logo" 
          className="w-12 h-12 mx-auto rounded-full shadow-lg"
        />
      </div> */}
          <h1 className="text-lg font-semibold text-gray-800 md:ml-20">
            Nambale Magnet School Gate Admin
          </h1>
          <span /> {/* empty spacer */}
        </div>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export const AdminRoutes = () => <Navigate to="users" replace />;
export default AdminDashboard;
