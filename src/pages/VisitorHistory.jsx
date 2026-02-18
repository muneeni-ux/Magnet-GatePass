import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FaSearch, FaSort } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import {
  FileText,
  Clock,
  Filter,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export default function VisitorHistory() {
  const [visitors, setVisitors] = useState([]);
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loadingTimeout, setLoadingTimeout] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchVisitors = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/visitors`);
      const data = await res.json();
      setVisitors(data);
    } catch (error) {
      toast.error("Unable to load visitor records");
    }
  };

  const handleTimeOut = async (id) => {
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
      fetchVisitors();
    } catch {
      toast.error("Failed to record exit");
    }
    setLoadingTimeout(null);
  };

  useEffect(() => {
    fetchVisitors();
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
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 md:p-6 pt-24 md:pt-28 relative">
      {/* Background Grid */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      ></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Visitor Logs
              </h2>
              <p className="text-sm text-slate-400">
                Comprehensive Access Records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-slate-300">
              Live Database
            </span>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl mb-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          {/* Search */}
          <div className="relative w-full md:w-auto">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
            <input
              type="text"
              placeholder="Search visitors, departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-72 bg-slate-900 border border-slate-700 text-slate-200 pl-9 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm placeholder-slate-500 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-1">
              {["all", "active", "completed"].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilterStatus(item)}
                  className={`px-4 py-1.5 text-xs font-semibold capitalize rounded-md transition-all ${
                    filterStatus === item
                      ? "bg-slate-700 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-slate-700 mx-1 hidden md:block"></div>

            <button
              onClick={() => setShowTodayOnly((p) => !p)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-xs font-semibold transition-all ${
                showTodayOnly
                  ? "bg-blue-600/10 border-blue-500/30 text-blue-400"
                  : "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-300"
              }`}
            >
              <Filter size={14} />
              {showTodayOnly ? "Today Only" : "All Time"}
            </button>

            <button
              onClick={() => setSortAsc((prev) => !prev)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-300 transition-all"
            >
              <FaSort />
              {sortAsc ? "Oldest First" : "Newest First"}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-700 text-xs text-slate-400 font-semibold uppercase tracking-wide">
                  <th className="p-5">Visitor Details</th>
                  <th className="p-5">Department / Dest</th>
                  <th className="p-5">Log Info</th>
                  <th className="p-5">Time In</th>
                  <th className="p-5">Status / Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-700/50">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <FileText size={32} className="opacity-20" />
                        <p>No records found matching your criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((v) => (
                    <tr
                      key={v._id}
                      className="hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="p-5">
                        <div className="font-semibold text-white">{v.name}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {v.phone}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="text-slate-300">{v.department}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {v.nature} Visit
                        </div>
                      </td>
                      <td className="p-5 text-slate-400 text-xs">
                        <div>
                          Entry:{" "}
                          <span className="text-slate-300">{v.gate}</span>
                        </div>
                        {v.vehicleReg && <div>Ref: {v.vehicleReg}</div>}
                      </td>
                      <td className="p-5">
                        <div className="text-slate-300 font-medium">
                          {new Date(v.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(v.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-5">
                        {!v.timeOut ? (
                          <div className="flex items-center gap-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                              Active
                            </span>
                            <button
                              onClick={() => handleTimeOut(v._id)}
                              disabled={loadingTimeout === v._id}
                              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-medium transition-colors border border-slate-600 shadow-sm"
                            >
                              {loadingTimeout === v._id
                                ? "Logging..."
                                : "Log Exit"}
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-start gap-1">
                            <span className="inline-flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                              <CheckCircle size={12} /> Closed
                            </span>
                            <span className="text-xs text-slate-500">
                              Out:{" "}
                              {new Date(v.timeOut).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
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
          <div className="bg-slate-800 border-t border-slate-700 p-4 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
            <div className="text-xs text-slate-500">
              Showing{" "}
              <span className="text-white font-medium">
                {indexOfFirstItem + 1}
              </span>{" "}
              to{" "}
              <span className="text-white font-medium">
                {Math.min(indexOfLastItem, filteredVisitors.length)}
              </span>{" "}
              of{" "}
              <span className="text-white font-medium">
                {filteredVisitors.length}
              </span>{" "}
              records
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Logic to show limited page numbers around current page could go here
                  // For simplicity showing first 5 or using a simple range if needed
                  // But let's just show current page for now with simple prev/next if many pages

                  // Let's implement a smart visible page logic
                  let p = i + 1;
                  if (totalPages > 5) {
                    // Simple shifting window
                    if (currentPage > 3) p = currentPage - 2 + i;
                    if (p > totalPages) return null;
                  }

                  return (
                    <button
                      key={p}
                      onClick={() => paginate(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                        currentPage === p
                          ? "bg-blue-600 text-white border border-blue-500"
                          : "bg-slate-900 border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
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
                className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
