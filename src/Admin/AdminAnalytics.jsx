// src/Admin/AdminAnalytics.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import {
  Users,
  Clock,
  TrendingUp,
  MapPin,
  Calendar,
  Building,
  Award,
  ArrowUpRight,
} from "lucide-react";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export default function AdminAnalytics() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
        const res = await axios.get(`${SERVER_URL}/api/visitors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVisitors(res.data);
      } catch (err) {
        console.error("Error fetching visitor statistics:", err);
        setError("Unable to compile analytics records.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);

  // -------------------------------------------------------------
  // CALCULATE STATISTICS
  // -------------------------------------------------------------
  const stats = React.useMemo(() => {
    if (visitors.length === 0) return {
      total: 0,
      active: 0,
      todayCount: 0,
      peakHour: "—",
      gateA: 0,
      gateB: 0,
      official: 0,
      personal: 0,
      avgDurationMin: 0,
      deptCounts: {},
      daysData: [],
    };

    const now = new Date();
    const todayStr = now.toDateString();

    let activeCount = 0;
    let todayCheckins = 0;
    let gateACount = 0;
    let gateBCount = 0;
    let officialCount = 0;
    let personalCount = 0;
    let totalDurationMs = 0;
    let durationRecords = 0;

    const hourTally = Array(24).fill(0);
    const departmentTally = {};

    // Last 7 days checkin tally
    const last7Days = Array(7).fill(0).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        dateStr: d.toDateString(),
        dayLabel: d.toLocaleDateString("en-US", { weekday: "short" }),
        count: 0,
      };
    });

    visitors.forEach((v) => {
      const checkinDate = new Date(v.createdAt);
      
      // Active check-ins
      if (!v.timeOut) {
        activeCount++;
      }

      // Today check-ins
      if (checkinDate.toDateString() === todayStr) {
        todayCheckins++;
      }

      // Gate check-ins
      if (v.gate === "Gate A") {
        gateACount++;
      } else {
        gateBCount++;
      }

      // Nature
      if (v.nature === "official") {
        officialCount++;
      } else {
        personalCount++;
      }

      // Hour tallies
      const hr = checkinDate.getHours();
      hourTally[hr]++;

      // Department tallies
      const dept = v.department || "N/A";
      departmentTally[dept] = (departmentTally[dept] || 0) + (v.groupSize || 1);

      // Last 7 Days mapping
      const index = last7Days.findIndex((d) => d.dateStr === checkinDate.toDateString());
      if (index !== -1) {
        last7Days[index].count += (v.groupSize || 1);
      }

      // Duration average (for completed visits)
      if (v.timeOut) {
        const timeoutDate = new Date(v.timeOut);
        const ms = timeoutDate - checkinDate;
        if (ms > 0) {
          totalDurationMs += ms;
          durationRecords++;
        }
      }
    });

    // Peak hour
    let maxHourCount = -1;
    let peakHourStr = "08:00 - 09:00";
    hourTally.forEach((count, h) => {
      if (count > maxHourCount) {
        maxHourCount = count;
        const nextH = (h + 1) % 24;
        const formatH = (x) => String(x).padStart(2, "0") + ":00";
        peakHourStr = `${formatH(h)} - ${formatH(nextH)}`;
      }
    });

    const avgMin = durationRecords > 0 ? Math.floor(totalDurationMs / 60000 / durationRecords) : 0;

    return {
      total: visitors.length,
      active: activeCount,
      todayCount: todayCheckins,
      peakHour: maxHourCount > 0 ? peakHourStr : "09:00 - 10:00",
      gateA: gateACount,
      gateB: gateBCount,
      official: officialCount,
      personal: personalCount,
      avgDurationMin: avgMin,
      deptCounts: departmentTally,
      daysData: last7Days,
    };
  }, [visitors]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <ClipLoader color="#3b82f6" size={50} />
        <p className="text-slate-500 font-semibold animate-pulse text-sm">Compiling Gate Records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500 font-bold bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl">
        {error}
      </div>
    );
  }

  // Find max count for line chart height scaling
  const maxDayCount = Math.max(...stats.daysData.map((d) => d.count), 5);

  // SVG Line Chart coordinates computation
  const linePoints = stats.daysData.map((d, i) => {
    const x = 50 + i * 90;
    const y = 200 - (d.count / maxDayCount) * 130;
    return { x, y, label: d.dayLabel, count: d.count };
  });

  const linePath = linePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Pie chart calculation for Gates (Gate A vs B)
  const totalGate = stats.gateA + stats.gateB || 1;
  const gateAPercent = Math.round((stats.gateA / totalGate) * 100);
  const gateBPercent = 100 - gateAPercent;

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* ───────────────── HEADER ───────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">System Analytics</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Real-time administrative stats, visit trends, and gate traffic tallies.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm shadow-sm font-semibold text-slate-500 dark:text-slate-450">
          <Calendar size={16} className="text-blue-500" />
          <span>Last 7 Days Analysis</span>
        </div>
      </div>

      {/* ───────────────── KPI CARD GRIDS ───────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Visits */}
        <div className="glass bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm hover:scale-[1.02] transition duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Total Check-Ins</span>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black">{stats.total}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-550 mt-1 flex items-center gap-1 font-semibold">
              <Award size={14} className="text-green-500" /> Accumulated gate entries
            </p>
          </div>
        </div>

        {/* Card 2: Active Checked In */}
        <div className="glass bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm hover:scale-[1.02] transition duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Currently In School</span>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-green-600 dark:text-green-400">{stats.active}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-550 mt-1 flex items-center gap-1 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping inline-block" />
              Active visitors logged
            </p>
          </div>
        </div>

        {/* Card 3: Today's Checkins */}
        <div className="glass bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm hover:scale-[1.02] transition duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Today's Visits</span>
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <ArrowUpRight size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{stats.todayCount}</h3>
            <p className="text-xs text-slate-450 dark:text-slate-500 mt-1 font-semibold">
              Check-ins logged today
            </p>
          </div>
        </div>

        {/* Card 4: Avg Visit Time */}
        <div className="glass bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm hover:scale-[1.02] transition duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Peak Hours</span>
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-black truncate">{stats.peakHour}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-550 mt-1.5 font-semibold">
              Highest rate of visitor entries
            </p>
          </div>
        </div>

      </div>

      {/* ───────────────── VISUAL CHARTS SECTION ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. Line Chart: 7-Day Frequency (Spans 2 columns on large view) */}
        <div className="lg:col-span-2 glass bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h4 className="text-lg font-bold">Check-In Trends</h4>
              <p className="text-xs text-slate-450 dark:text-slate-500 font-semibold">Total people admitted over the last 7 days</p>
            </div>
            <div className="text-xs font-bold text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-xl">
              Check-Ins Count
            </div>
          </div>

          {/* Pure SVG Line Chart */}
          <div className="w-full h-64 relative flex items-center justify-center">
            <svg viewBox="0 0 620 230" className="w-full h-full overflow-visible">
              {/* Horizontal Grid lines */}
              <line x1="40" y1="200" x2="600" y2="200" stroke="var(--border-main)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="40" y1="135" x2="600" y2="135" stroke="var(--border-main)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="40" y1="70" x2="600" y2="70" stroke="var(--border-main)" strokeWidth="1" strokeDasharray="4 4" />

              {/* Line path */}
              <path
                d={linePath}
                fill="none"
                stroke="url(#chart-gradient)"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-700"
              />

              {/* Gradient fill definition */}
              <defs>
                <linearGradient id="chart-gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>

              {/* Dots and Labels */}
              {linePoints.map((pt, index) => (
                <g key={index} className="group cursor-pointer">
                  {/* Point circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="6.5"
                    fill="var(--bg-card)"
                    stroke="#3b82f6"
                    strokeWidth="3.5"
                    className="hover:scale-125 transition-transform"
                  />
                  {/* Hover count flag */}
                  <text
                    x={pt.x}
                    y={pt.y - 12}
                    textAnchor="middle"
                    className="text-[11px] font-black fill-blue-600 dark:fill-blue-400 opacity-80 group-hover:opacity-100"
                  >
                    {pt.count}
                  </text>
                  {/* Day labels */}
                  <text
                    x={pt.x}
                    y="222"
                    textAnchor="middle"
                    className="text-[11px] font-bold fill-slate-400 dark:fill-slate-500"
                  >
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* 2. Donut Chart: Gate Ratio (1 column) */}
        <div className="glass bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-bold">Gate Ratios</h4>
            <p className="text-xs text-slate-450 dark:text-slate-500 font-semibold">Distribution of visits by Gate</p>
          </div>

          <div className="flex items-center justify-center py-6">
            {/* Pure SVG Donut Ring */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-95">
                {/* Gate B grey ring */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="var(--border-main)"
                  strokeWidth="3.5"
                />
                {/* Gate A colored stroke segment */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth="3.5"
                  strokeDasharray={`${gateAPercent} ${gateBPercent}`}
                  strokeDashoffset="0"
                />
              </svg>
              {/* Inner details label */}
              <div className="absolute text-center">
                <p className="text-2xl font-black tracking-tight">{gateAPercent}%</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Gate A traffic</p>
              </div>
            </div>
          </div>

          {/* Legends */}
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-blue-500 rounded-md" />
                <span className="font-semibold">Gate A</span>
              </div>
              <span className="font-bold text-slate-500">{stats.gateA} visits ({gateAPercent}%)</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-slate-350 dark:bg-slate-700 rounded-md" />
                <span className="font-semibold">Gate B-mauzo</span>
              </div>
              <span className="font-bold text-slate-500">{stats.gateB} visits ({gateBPercent}%)</span>
            </div>
          </div>

        </div>

      </div>

      {/* ───────────────── SECONDARY DATA VIEWS ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Busiest Departments Rank */}
        <div className="glass bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm">
          <div className="mb-5">
            <h4 className="text-lg font-bold flex items-center gap-2">
              <Building className="text-blue-500" size={18} /> Busiest Departments
            </h4>
            <p className="text-xs text-slate-450 dark:text-slate-500 font-semibold">Total people checked into each department (Single + Group size cumulative)</p>
          </div>

          <div className="space-y-4">
            {Object.keys(stats.deptCounts).length === 0 ? (
              <p className="text-center text-slate-400 py-6 text-sm">No department data recorded.</p>
            ) : (
              Object.entries(stats.deptCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name, val], index) => {
                  const maxCount = Math.max(...Object.values(stats.deptCounts), 1);
                  const barWidthPercent = Math.max(Math.round((val / maxCount) * 100), 5);
                  return (
                    <div key={name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{index + 1}. {name}</span>
                        <span className="font-extrabold text-blue-600 dark:text-blue-450">{val} visitors</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                          style={{ width: `${barWidthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Nature and Duration Stats */}
        <div className="glass bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-bold flex items-center gap-2">
              <MapPin className="text-blue-500" size={18} /> Nature of Visits
            </h4>
            <p className="text-xs text-slate-450 dark:text-slate-500 font-semibold">Purpose of entry: Official vs Personal visits</p>
          </div>

          <div className="py-6 flex items-center justify-around">
            <div className="text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Official Visits</p>
              <h3 className="text-4xl font-black text-blue-600 dark:text-blue-400 mt-2">{stats.official}</h3>
            </div>
            <div className="h-16 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Personal Visits</p>
              <h3 className="text-4xl font-black text-amber-500 mt-2">{stats.personal}</h3>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-center">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Average Visit Duration</p>
            <h4 className="text-2xl font-black text-indigo-500 mt-1">
              {stats.avgDurationMin > 0 ? (
                `${Math.floor(stats.avgDurationMin / 60)}h ${stats.avgDurationMin % 60}m`
              ) : (
                "N/A"
              )}
            </h4>
            <p className="text-[10px] text-slate-400 mt-1">Calculated from checked-out logs</p>
          </div>
        </div>

      </div>

    </div>
  );
}
