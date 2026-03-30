// src/components/Admin/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { NavLink, Outlet, Navigate, useNavigate, Link } from "react-router-dom";
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
  Bell,
  MapPin,
  Shield,
  AlertTriangle,
  LineChart,
  UserCheck,
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
    icon: <LineChart size={18} />,
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
  {
    to: "/magnet/admin/dashboard/notifications",
    label: "Notifications",
    icon: <Bell size={18} />,
  },
  {
    to: "/magnet/admin/dashboard/locations",
    label: "Locations",
    icon: <MapPin size={18} />,
  },
  
  {
    to: "/magnet/admin/dashboard/staff-roster",
    label: "Staff Roster",
    icon: <UserCheck size={18} />,
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
    <div className="flex h-screen font-sans bg-slate-50 text-slate-800 selection:bg-blue-100 selection:text-blue-900">
      {/* ───── Sidebar ───── */}
      <aside
        className={`fixed z-30 top-0 h-full w-64 transform bg-slate-900 border-r border-slate-800 transition-transform duration-300 md:translate-x-0 ${
          open ? "translate-x-0 shadow-2xl md:shadow-none" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="p-1.5 bg-blue-600 rounded-lg shadow-sm shadow-blue-500/20">
              <Shield size={18} className="text-white" />
            </span>
            Visitrack
          </h2>
          <button
            className="md:hidden text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-md"
            onClick={() => setOpen(false)}
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="mt-6 px-4 space-y-1.5 overflow-y-auto h-[calc(100vh-160px)] pb-10 custom-scrollbar">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => {
                if (window.innerWidth < 768) {
                  setOpen(false);
                }
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-sm"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white font-medium"
                }`
              }
            >
              <span
                className={`${window.location.pathname.includes(to) ? "text-blue-100" : "text-slate-500"}`}
              >
                {icon}
              </span>
              <span className="text-sm">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-6 inset-x-0 px-4 pt-4 bg-slate-900">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-red-500/10 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/30 text-sm font-semibold transition-all group"
          >
            <LogOut
              size={16}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Secure Logout
          </button>
        </div>
      </aside>

      {/* ───── Main Content ───── */}
      <main
        className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${
          open ? "md:ml-64" : ""
        }`}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 z-10 backdrop-blur-md bg-white/90 sticky top-0">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              className="md:hidden text-slate-500 hover:text-blue-600 bg-slate-50 p-2 rounded-lg"
              onClick={() => setOpen(true)}
            >
              <MenuIcon size={20} />
            </button>

            {/* Title */}
            <div>
              <h1 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
                <span className="md:hidden">Visitrack</span>
                <span className="hidden md:inline">Administration Portal</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide uppercase hidden sm:block mt-0.5">
                System Overview & Management
              </p>
            </div>
          </div>

          {/* Profile & Emergency */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Emergency Button */}
            <Link
              to="/magnet/admin/dashboard/emergency"
              className="flex items-center gap-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 px-3 md:px-4 py-2 rounded-xl transition-all shadow-sm group"
            >
              <AlertTriangle size={16} className="group-hover:animate-pulse" />
              <span className="font-bold text-sm hidden md:inline">
                Emergency
              </span>
            </Link>

            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-slate-800 leading-tight">
                Admin User
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Clearance Level 1
              </span>
            </div>
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-blue-200 cursor-pointer hover:shadow-lg transition-all border border-blue-400/30">
              A
            </div>
          </div>
        </div>

        {/* Routed Content - Make this area scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:max-w-[1600px] w-full mx-auto relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export const AdminRoutes = () => <Navigate to="users" replace />;
export default AdminDashboard;
