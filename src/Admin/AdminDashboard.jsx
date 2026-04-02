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
    to: "/visitrack/admin/dashboard/users",
    label: "Users",
    icon: <Users2 size={18} />,
  },
  {
    to: "/visitrack/admin/dashboard/analytics",
    label: "Analytics",
    icon: <LineChart size={18} />,
  },
  {
    to: "/visitrack/admin/dashboard/visitorsdetails",
    label: "Visitors Details",
    icon: <FileText size={18} />,
  },
  {
    to: "/visitrack/admin/dashboard/occurrence",
    label: "Occurrences",
    icon: <FileClockIcon size={18} />,
  },
  {
    to: "/visitrack/admin/dashboard/inquiry",
    label: "Inquiry",
    icon: <User size={18} />,
  },
  {
    to: "/visitrack/admin/dashboard/faq",
    label: "FAQ",
    icon: <MessageCircleDashed size={18} />,
  },
  {
    to: "/visitrack/admin/dashboard/notifications",
    label: "Notifications",
    icon: <Bell size={18} />,
  },
  {
    to: "/visitrack/admin/dashboard/locations",
    label: "Locations",
    icon: <MapPin size={18} />,
  },
  
  {
    to: "/visitrack/admin/dashboard/staff-roster",
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
    // 🎨 Force Light Mode Restoration
    // This removes the 'dark' class from the document root whenever an Admin enters the portal.
    // Preserves the vibrant, premium light-ui design regardless of Guard's theme setting.
    document.documentElement.classList.remove('dark');
  }, []);

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
    <div className="flex h-screen font-sans bg-[#f8fafc] text-slate-800 selection:bg-cyan-100 selection:text-cyan-900 overflow-hidden relative">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.03),transparent)] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />
        {/* ───── Sidebar ───── */}
      <aside
        className={`fixed z-30 top-[20px] bottom-[20px] left-[20px] rounded-3xl h-[calc(100vh-40px)] w-[260px] transform bg-[#09090b]/95 backdrop-blur-3xl border border-white/10 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-[120%]"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-white/5">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
            <span className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-white/20">
              <Shield size={18} className="text-white" />
            </span>
            <span style={{ fontFamily: 'Outfit, sans-serif' }}>Visitrack</span>
          </h2>
          <button
            className="md:hidden text-slate-400 hover:text-white bg-white/5 p-1.5 rounded-lg border border-white/10"
            onClick={() => setOpen(false)}
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="mt-6 px-4 space-y-2 overflow-y-auto h-[calc(100vh-200px)] pb-10 custom-scrollbar">
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
                `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-50 font-bold border border-cyan-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] relative overflow-hidden"
                    : "text-slate-400 hover:bg-white/5 hover:text-white font-semibold border border-transparent"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                  )}
                  <span
                    className={`${isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"}`}
                  >
                    {icon}
                  </span>
                  <span className="text-sm tracking-wide">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-6 inset-x-0 px-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/5 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-white/10 hover:border-red-500/50 text-sm font-bold transition-all duration-300 group shadow-lg"
          >
            <LogOut
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Secure Logout
          </button>
        </div>
      </aside>

      {/* ───── Main Content ───── */}
      <main
        className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "md:ml-[300px]" : "md:ml-[20px]"
        }`}
      >
        {/* Top bar (Premium Ultra-Glass) */}
        <div className="mx-4 md:mx-6 mt-4 md:mt-5 mb-2 px-8 py-5 bg-white/70 backdrop-blur-[40px] border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.04),0_1px_1px_rgba(0,0,0,0.02)] rounded-[2.5rem] shrink-0 z-10 sticky top-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              className="md:hidden text-slate-600 hover:text-blue-600 bg-white/50 p-2.5 rounded-xl border border-white/50 shadow-sm"
              onClick={() => setOpen(true)}
            >
              <MenuIcon size={20} />
            </button>

            {/* Title */}
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-[-0.02em] leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <span className="md:hidden">Visitrack</span>
                <span className="hidden md:inline">Administration Portal</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-[0.15em] uppercase hidden sm:block mt-2">
                System Intelligence & Oversight
              </p>
            </div>
          </div>

          {/* Profile & Emergency */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Emergency Button */}
            <Link
              to="/visitrack/admin/dashboard/emergency"
              className="flex items-center gap-3 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-500/20 hover:border-rose-500 px-5 py-3 rounded-2xl transition-all duration-500 shadow-[0_0_20px_rgba(244,63,94,0.1)] hover:shadow-[0_10px_25px_rgba(244,63,94,0.3)] group font-black tracking-tighter"
            >
              <AlertTriangle size={18} className="group-hover:rotate-12 transition-transform" />
              <span className="text-xs hidden lg:inline uppercase tracking-widest pt-0.5">
                SOS Protocol
              </span>
            </Link>

            <div className="hidden sm:flex flex-col items-end mr-1 border-l border-slate-200/60 pl-5 h-10 justify-center">
              <span className="text-sm font-extrabold text-slate-800 leading-tight">
                Admin User
              </span>
              <span className="text-[10px] text-cyan-600 font-bold uppercase tracking-widest mt-0.5">
                Clearance Lvl 1
              </span>
            </div>
            <div className="w-11 h-11 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-slate-900/20 cursor-pointer hover:scale-105 transition-all border border-slate-700 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent p-[1px] opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10" style={{ fontFamily: 'Outfit, sans-serif' }}>A</span>
            </div>
          </div>
        </div>

        {/* Routed Content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-6 pt-2 lg:max-w-[1600px] w-full relative custom-scrollbar">
          <Outlet />
        </div>
      </main>    </div>
  );
};

export const AdminRoutes = () => <Navigate to="users" replace />;
export default AdminDashboard;
