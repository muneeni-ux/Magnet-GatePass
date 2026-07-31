import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FaSearch, FaSort } from "react-icons/fa";
import {
  FileText,
  Filter,
  ChevronLeft,
  ChevronRight,
  Database
} from "lucide-react";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const maskPhoneNumber = (phoneStr) => {
  if (!phoneStr) return "-";
  const str = phoneStr.toString().trim();
  if (str.length <= 6) return str.replace(/./g, '*');
  const prefix = str.slice(0, Math.min(4, Math.floor(str.length / 2)));
  const suffix = str.slice(-3);
  return `${prefix} *** ${suffix}`;
};

export default function VisitorHistory() {
  const [visitors, setVisitors] = useState([]);
  const [gatesMap, setGatesMap] = useState({});
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loadingTimeout, setLoadingTimeout] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchVisitorsAndGates = async () => {
    try {
      const [visitorsRes, gatesRes] = await Promise.all([
        fetch(`${SERVER_URL}/api/visitors`),
        fetch(`${SERVER_URL}/api/locations/gates`),
      ]);
      const visitorsData = await visitorsRes.json();
      const gatesData = await gatesRes.json();

      // Build lookup map
      const gMap = {};
      if (Array.isArray(gatesData)) {
        gatesData.forEach((g) => {
          gMap[g._id] = g.name;
        });
      }
      setGatesMap(gMap);
      setVisitors(visitorsData);
    } catch (error) {
      toast.error("Unable to load visitor records");
    }
  };

  const handleTimeOut = async (id, isAcknowledged) => {
    if (isAcknowledged === false) {
      if (!window.confirm("Security Alert: Visitor has not been acknowledged by the host. Verify visit before checkout. Proceed?")) {
        return;
      }
    }
    setLoadingTimeout(id);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await fetch(
        `${SERVER_URL}/api/visitors/visitors/${id}/timeout`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timedOutBy: user?.id }),
        },
      );
      if (!res.ok) throw new Error();
      toast.success("Exit recorded successfully");
      fetchVisitorsAndGates();
    } catch {
      toast.error("Failed to record exit");
    }
    setLoadingTimeout(null);
  };

  useEffect(() => {
    fetchVisitorsAndGates();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, showTodayOnly, filterStatus, sortAsc]);

  const today = new Date();

  const filteredVisitors = visitors
    .filter((v) => {
      if (!showTodayOnly) return true;
      const d = new Date(v.createdAt);
      return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      );
    })
    .filter((v) => {
      const search = searchTerm.toLowerCase();
      return (
        v.name.toLowerCase().includes(search) ||
        v.department.toLowerCase().includes(search)
      );
    })
    .filter((v) => {
      if (filterStatus === "active") return !v.timeOut;
      if (filterStatus === "completed") return !!v.timeOut;
      return true;
    })
    .sort((a, b) => {
      const t1 = new Date(a.createdAt);
      const t2 = new Date(b.createdAt);
      return sortAsc ? t1 - t2 : t2 - t1;
    });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVisitors.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredVisitors.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] text-slate-800 dark:text-slate-100 font-sans p-4 md:p-6 pt-24 md:pt-[100px] relative cyber-grid selection:bg-blue-500/30 dark:selection:bg-emerald-500/30 overflow-hidden flex justify-center items-start">
      
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 dark:bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse delay-700"></div>

      <div className="w-full max-w-7xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-white/60 dark:border-slate-800/80 pb-6">
          <div className="flex items-center gap-5">
            <div className="p-3.5 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-emerald-500/10 dark:to-cyan-500/10 rounded-2xl border border-blue-500/20 dark:border-emerald-500/20 shadow-inner group">
              <Database className="h-7 w-7 text-blue-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                 VISITOR <span className="text-blue-600 dark:text-emerald-400">HISTORY</span>
              </h2>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                View all past and currently checked-in visitors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 bg-white/50 dark:bg-slate-900/50 border border-white/60 dark:border-slate-800 rounded-lg shadow-inner">
            <div className="h-2 w-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-600 dark:text-slate-300 font-mono">
              Live Link
            </span>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="glass-panel dark:glass-panel-dark border border-white/60 dark:border-slate-700/50 p-5 rounded-[2rem] mb-6 flex flex-col xl:flex-row gap-5 items-center justify-between shadow-lg">
          
          {/* Search */}
          <div className="relative w-full xl:w-96">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm" />
            <input
              type="text"
              placeholder="Search by name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/50 dark:bg-[#0a0f1c]/60 border border-white/60 dark:border-slate-700/60 text-slate-900 dark:text-white pl-11 pr-5 py-3 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 text-sm shadow-inner transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="flex bg-white/50 dark:bg-[#0a0f1c]/60 border border-white/60 dark:border-slate-700/60 rounded-xl p-1.5 shadow-inner">
              {["all", "active", "completed"].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilterStatus(item)}
                  className={`px-5 py-2 text-[10px] uppercase tracking-widest font-extrabold rounded-lg transition-all font-mono border ${
                    filterStatus === item
                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-emerald-400 shadow-sm border-white/60 dark:border-slate-600"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50 border-transparent"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="h-8 w-px bg-white/60 dark:bg-slate-700/50 mx-2 hidden md:block"></div>

            <button
              onClick={() => setShowTodayOnly((p) => !p)}
              className={`flex items-center justify-center gap-2 px-5 py-3 border rounded-xl text-[10px] uppercase font-extrabold tracking-widest transition-all font-mono min-w-[140px] ${
                showTodayOnly
                  ? "bg-blue-600/10 dark:bg-emerald-500/10 border-blue-500/30 dark:border-emerald-500/30 text-blue-600 dark:text-emerald-400 shadow-inner"
                  : "bg-white/50 dark:bg-[#0a0f1c]/60 border-white/60 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Filter size={14} />
              {showTodayOnly ? "Today Only" : "All Time"}
            </button>

            <button
              onClick={() => setSortAsc((prev) => !prev)}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white/50 dark:bg-[#0a0f1c]/60 border border-white/60 dark:border-slate-700/60 rounded-xl text-[10px] uppercase font-extrabold tracking-widest text-slate-500 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:text-slate-700 dark:hover:text-slate-200 transition-all font-mono shadow-sm min-w-[140px]"
            >
              <FaSort />
              {sortAsc ? "Oldest First" : "Newest First"}
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="glass-panel dark:glass-panel-dark border border-white/60 dark:border-slate-700/50 rounded-[2rem] overflow-hidden flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/40 dark:bg-slate-900/40 border-b border-white/60 dark:border-slate-700/50 text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-widest font-mono backdrop-blur-md">
                  <th className="p-6">Visitor / Contact</th>
                  <th className="p-6">Department / Purpose</th>
                  <th className="p-6">Gate & Vehicle</th>
                  <th className="p-6">Time Stamp</th>
                  <th className="p-6 whitespace-nowrap">Status Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-white/60 dark:divide-slate-700/50">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-20 text-center text-slate-500 dark:text-slate-400 animate-in fade-in">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl">
                           <FileText size={32} className="opacity-40" />
                        </div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No visitor records found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((v) => (
                    <tr
                      key={v._id}
                      className="hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors backdrop-blur-sm group"
                    >
                      <td className="p-6">
                        <div className="font-extrabold text-slate-900 dark:text-white flex flex-wrap items-center gap-2 font-mono text-sm leading-tight">
                          {v.name}
                          {v.isGroup && <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 rounded-md">Size: {v.groupSize}</span>}
                          {v.isDisabled && <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-md">Asst</span>}
                        </div>
                        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2 font-mono">
                          <a href={`tel:${v.phone}`} className="hover:text-blue-500 dark:hover:text-emerald-400 hover:underline transition-colors" onClick={(e) => e.stopPropagation()}>
                            {maskPhoneNumber(v.phone)}
                          </a>
                          {v.nature === 'staff' && <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-md text-[9px] uppercase tracking-widest">Staff</span>}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="text-slate-800 dark:text-slate-300 font-bold text-sm tracking-tight">{v.department}</div>
                        {v.hostStaff && (
                          <div className="text-xs font-extrabold text-blue-600 dark:text-emerald-400 mt-1 font-mono">
                            Host: {v.hostStaff}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-widest font-bold font-mono mt-1">
                          {v.nature} Type
                        </div>
                      </td>
                      <td className="p-6 text-slate-500 dark:text-slate-500 text-[11px] font-bold font-mono uppercase tracking-wide">
                        <div className="flex items-center gap-2">
                          <span className="opacity-60">Entry:</span>
                          <span className="text-slate-700 dark:text-slate-300">
                            {gatesMap[v.gate] || v.gate}
                          </span>
                        </div>
                        {v.vehicleReg && <div className="mt-1.5 flex items-center gap-2"><span className="opacity-60">Ref:</span> <span className="text-slate-700 dark:text-slate-300">{v.vehicleReg}</span></div>}
                      </td>
                      <td className="p-6">
                        <div className="text-slate-800 dark:text-white font-bold text-base font-mono">
                          {new Date(v.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
                          {new Date(v.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-6">
                        {!v.timeOut ? (
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col gap-2">
                              <span className="inline-flex items-center justify-center min-w-[70px] gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[9px] uppercase font-extrabold tracking-widest shadow-inner">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                                Active
                              </span>
                              {v.nature !== 'staff' && (
                                v.isAcknowledged ? (
                                  <span className="inline-flex items-center justify-center min-w-[70px] gap-1.5 px-2 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-[8px] uppercase font-bold tracking-wider">
                                    <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                                    Seen
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center justify-center min-w-[70px] gap-1.5 px-2 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-[8px] uppercase font-bold tracking-wider">
                                    <span className="w-1 h-1 bg-amber-500 rounded-full animate-pulse"></span>
                                    Unseen
                                  </span>
                                )
                              )}
                            </div>
                            <button
                              onClick={() => handleTimeOut(v._id, v.isAcknowledged)}
                              disabled={loadingTimeout === v._id}
                              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-[10px] uppercase tracking-widest font-extrabold transition-all border border-slate-300/60 dark:border-slate-600 shadow-sm disabled:opacity-50 group/btn"
                            >
                              {loadingTimeout === v._id
                                ? "Checking out..."
                                : "Check Out"}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <span className="inline-flex items-center justify-center min-w-[70px] gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300/50 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 text-[9px] uppercase font-extrabold tracking-widest shadow-inner">
                              <CheckCircle size={10} className="text-slate-400" />
                              Checked Out
                            </span>
                            <div className="text-[10px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-widest font-mono bg-white/40 dark:bg-slate-900/40 px-3 py-1.5 rounded-lg border border-white/60 dark:border-slate-800 shadow-inner">
                              OUT: {" "}
                              <span className="text-slate-700 dark:text-slate-300">
                                {new Date(v.timeOut).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="bg-white/40 dark:bg-slate-900/40 border-t border-white/60 dark:border-slate-700/50 p-6 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md">
            <div className="text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 font-mono">
              Displaying {" "}
              <span className="text-blue-600 dark:text-emerald-400 font-extrabold text-sm mx-1">
                {filteredVisitors.length > 0 ? indexOfFirstItem + 1 : 0}
              </span>{" "}
              - {" "}
              <span className="text-blue-600 dark:text-emerald-400 font-extrabold text-sm mx-1">
                {Math.min(indexOfLastItem, filteredVisitors.length)}
              </span>{" "}
              of {" "}
              <span className="text-blue-600 dark:text-emerald-400 font-extrabold text-sm mx-1">
                {filteredVisitors.length}
              </span>{" "}
              Log Entries
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl border border-white/60 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm bg-white/50 dark:bg-[#0a0f1c]/60"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p = i + 1;
                  if (totalPages > 5) {
                    if (currentPage > 3) p = currentPage - 2 + i;
                    if (p > totalPages) return null;
                  }

                  return (
                    <button
                      key={p}
                      onClick={() => paginate(p)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl text-[11px] font-extrabold font-mono transition-all ${
                        currentPage === p
                          ? "bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-emerald-600 dark:to-cyan-600 text-white shadow-[0_4px_15px_rgba(59,130,246,0.3)] dark:shadow-[0_4px_15px_rgba(16,185,129,0.3)] border border-transparent"
                          : "bg-white/50 dark:bg-[#0a0f1c]/60 border border-white/60 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white shadow-sm"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2.5 rounded-xl border border-white/60 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm bg-white/50 dark:bg-[#0a0f1c]/60"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper icon component for closed status
function CheckCircle({ size, className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
