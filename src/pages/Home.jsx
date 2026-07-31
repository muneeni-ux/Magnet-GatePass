import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import {
  ShieldCheck,
  Users,
  Clock,
  AlertTriangle,
  UserPlus,
  Activity,
  ArrowRight,
  UserCheck,
  HelpCircle,
  Building2,
  CheckCircle2,
  PhoneCall
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Home = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [stats, setStats] = useState({
    activeInside: 0,
    activeStaffCount: 0,
    todayTotal: 0,
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    setLoading(true);
    try {
      const [visitorsRes, activeStaffRes] = await Promise.all([
        axios.get(`${SERVER_URL}/api/visitors`),
        axios.get(`${SERVER_URL}/api/visitors/active-staff-departments`).catch(() => ({ data: [] })),
      ]);

      const allVis = visitorsRes.data || [];
      const activeInside = allVis.filter((v) => !v.timeOut && v.nature !== "staff").length;
      
      const todayStr = new Date().toDateString();
      const todayTotal = allVis.filter((v) => new Date(v.createdAt).toDateString() === todayStr).length;

      setStats({
        activeInside,
        activeStaffCount: (activeStaffRes.data || []).length,
        todayTotal,
      });

      // Top 4 recent check-ins
      setRecentLogs(allVis.slice(0, 4));
    } catch (err) {
      console.error("Dashboard metrics error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] text-slate-800 dark:text-gray-100 font-sans relative overflow-hidden flex flex-col pt-20 md:pt-24 pb-28 md:pb-12 cyber-grid">
      
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse delay-700"></div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
        
        {/* HERO BANNER & WELCOME */}
        <div className="glass-panel dark:glass-panel-dark p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Security Portal Operational
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Welcome, {currentUser?.name || "Officer"}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mt-0.5">
                VisiTrack Security Gate Management Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate("/form")}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition shadow-lg shadow-blue-500/25"
            >
              <UserPlus size={16} /> New Check-In
            </button>
          </div>
        </div>

        {/* METRICS SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          
          <div className="glass-panel dark:glass-panel-dark p-5 rounded-3xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider block font-mono">
                Active Visitors Inside
              </span>
              <span className="text-3xl font-extrabold text-blue-600 dark:text-emerald-400 mt-1 block">
                {stats.activeInside}
              </span>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-emerald-500/10 text-blue-600 dark:text-emerald-400 rounded-2xl">
              <Users size={24} />
            </div>
          </div>

          <div className="glass-panel dark:glass-panel-dark p-5 rounded-3xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider block font-mono">
                Duty Staff Online
              </span>
              <span className="text-3xl font-extrabold text-indigo-600 dark:text-teal-400 mt-1 block">
                {stats.activeStaffCount} Depts
              </span>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-teal-500/10 text-indigo-600 dark:text-teal-400 rounded-2xl">
              <UserCheck size={24} />
            </div>
          </div>

          <div className="glass-panel dark:glass-panel-dark p-5 rounded-3xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider block font-mono">
                Today's Total Check-Ins
              </span>
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 block">
                {stats.todayTotal} Logs
              </span>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl">
              <Clock size={24} />
            </div>
          </div>

        </div>

        {/* QUICK ACTIONS GRID */}
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-4 uppercase tracking-wider text-xs font-mono">
            Security Gate Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Action 1: Check-In */}
            <div
              onClick={() => navigate("/form")}
              className="glass-panel dark:glass-panel-dark p-6 rounded-3xl cursor-pointer hover:scale-[1.02] transition-all duration-200 border border-blue-500/20 group hover:border-blue-500 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="p-3.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  <UserPlus size={22} />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1">
                  Visitor Check-In
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Register new visitor entrance, host selection, and country code validation.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-600 dark:text-blue-400 mt-6 group-hover:translate-x-1 transition-transform">
                Open Check-In Form <ArrowRight size={14} />
              </div>
            </div>

            {/* Action 2: History & Checkout */}
            <div
              onClick={() => navigate("/history")}
              className="glass-panel dark:glass-panel-dark p-6 rounded-3xl cursor-pointer hover:scale-[1.02] transition-all duration-200 border border-emerald-500/20 group hover:border-emerald-500 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="p-3.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  <Clock size={22} />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1">
                  Active Logs & Exit
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  View active visitors currently inside and record checkout exit timestamps.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-6 group-hover:translate-x-1 transition-transform">
                View Visitors & Checkout <ArrowRight size={14} />
              </div>
            </div>

            {/* Action 3: Occurrence */}
            <div
              onClick={() => navigate("/occurrence")}
              className="glass-panel dark:glass-panel-dark p-6 rounded-3xl cursor-pointer hover:scale-[1.02] transition-all duration-200 border border-amber-500/20 group hover:border-amber-500 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="p-3.5 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  <AlertTriangle size={22} />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1">
                  Report Incident
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Submit shift occurrence report and dispatch optional emergency SMS alerts.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-600 dark:text-amber-400 mt-6 group-hover:translate-x-1 transition-transform">
                Report Occurrence <ArrowRight size={14} />
              </div>
            </div>

            {/* Action 4: Help & Support */}
            <div
              onClick={() => navigate("/helpdesk")}
              className="glass-panel dark:glass-panel-dark p-6 rounded-3xl cursor-pointer hover:scale-[1.02] transition-all duration-200 border border-indigo-500/20 group hover:border-indigo-500 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="p-3.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  <HelpCircle size={22} />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1">
                  HelpDesk & Support
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  System guidance, support contacts, and emergency assistance resources.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 mt-6 group-hover:translate-x-1 transition-transform">
                Open HelpDesk <ArrowRight size={14} />
              </div>
            </div>

          </div>
        </div>

        {/* RECENT CHECK-INS FEED */}
        <div className="glass-panel dark:glass-panel-dark p-6 sm:p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Recent Gate Activity Feed
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Real-time activity log of the latest check-in entries
              </p>
            </div>
            <button
              onClick={() => navigate("/history")}
              className="text-xs font-bold text-blue-600 dark:text-emerald-400 hover:underline"
            >
              View Full History →
            </button>
          </div>

          {recentLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-bold">
              No recent activity recorded yet today.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentLogs.map((log) => (
                <div
                  key={log._id}
                  className="p-4 bg-white/60 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 rounded-2xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm truncate">
                      {log.name}
                    </span>
                    <span
                      className={
                        log.timeOut
                          ? "px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500"
                          : "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400"
                      }
                    >
                      {log.timeOut ? "Out" : "Inside"}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <div>Gate: {log.gate}</div>
                    <div>Dest: {log.department}</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {format(new Date(log.createdAt), "dd/MM HH:mm")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Home;
