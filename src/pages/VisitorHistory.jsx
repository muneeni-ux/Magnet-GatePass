// src/pages/VisitorHistory.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FaSearch, FaSort } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { getOfflineCheckouts, saveOfflineCheckout } from "../utils/offlineSync";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const maskIdNumber = (id) => {
  if (!id) return "-";
  const str = id.toString().trim();
  if (str.toUpperCase() === "N/A") return "N/A";
  if (str.length <= 4) {
    if (str.length <= 2) return str;
    return str[0] + "*".repeat(str.length - 2) + str[str.length - 1];
  }
  return str.substring(0, 3) + "***" + str.substring(str.length - 2);
};

export default function VisitorHistory() {
  const [visitors, setVisitors] = useState([]);
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(false); // Default to reverse chronological (latest first)
  const [filterStatus, setFilterStatus] = useState("all");
  const [loadingTimeout, setLoadingTimeout] = useState(null);
  const [offlineTimeouts, setOfflineTimeouts] = useState([]);

  // Fetch pending offline timeouts from IndexedDB
  const fetchOfflineTimeouts = async () => {
    try {
      const list = await getOfflineCheckouts();
      const ids = list.map((item) => item.visitorId);
      setOfflineTimeouts(ids);
    } catch (error) {
      console.error("Failed to load offline timeouts:", error);
    }
  };

  const fetchVisitors = async () => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const res = await fetch(`${SERVER_URL}/api/visitors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setVisitors(data);
      await fetchOfflineTimeouts();
    } catch (error) {
      toast.error("Error loading visitors");
    }
  };

  const handleTimeOut = async (id) => {
    // -------------------------------------------------------------
    // OFFLINE CHECK-OUT QUEUEING
    // -------------------------------------------------------------
    if (!navigator.onLine) {
      try {
        await saveOfflineCheckout(id);
        
        // Notify navbar of pending updates
        window.dispatchEvent(new Event("sync-triggered"));
        
        toast.success("Offline: Check-out recorded locally!");
        await fetchOfflineTimeouts();
      } catch (error) {
        toast.error("Failed to log checkout offline.");
      }
      return;
    }

    setLoadingTimeout(id);
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const res = await fetch(
        `${SERVER_URL}/api/visitors/visitors/${id}/timeout`,
        { 
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (!res.ok) throw new Error();
      toast.success("Time out recorded!");
      fetchVisitors();
    } catch {
      // Server error fallback: save checkout to IndexedDB
      try {
        await saveOfflineCheckout(id);
        window.dispatchEvent(new Event("sync-triggered"));
        toast.success("Network error: Check-out recorded locally!");
        await fetchOfflineTimeouts();
      } catch (dbErr) {
        toast.error("Could not record time out");
      }
    } finally {
      setLoadingTimeout(null);
    }
  };

  useEffect(() => {
    fetchVisitors();

    // Listen to background sync-complete events dispatched by Navbar
    const handleSyncComplete = () => {
      fetchVisitors();
    };

    window.addEventListener("sync-complete", handleSyncComplete);
    return () => {
      window.removeEventListener("sync-complete", handleSyncComplete);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const nameMatch = v.name?.toLowerCase().includes(search);
      const deptMatch = v.department?.toLowerCase().includes(search);
      const idMatch = v.idNumber?.toLowerCase().includes(search);
      return nameMatch || deptMatch || idMatch;
    })
    .filter((v) => {
      const isCompleted = !!v.timeOut || offlineTimeouts.includes(v._id);
      if (filterStatus === "active") return !isCompleted;
      if (filterStatus === "completed") return isCompleted;
      return true;
    })
    .sort((a, b) => {
      const t1 = new Date(a.createdAt);
      const t2 = new Date(b.createdAt);
      return sortAsc ? t1 - t2 : t2 - t1;
    });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto mt-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl transition-colors duration-300">

      {/* ================= TITLE ================= */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight">
          Visitor History
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Detailed list of all logged entries and checked-out visitors.
        </p>
      </div>

      {/* ================= CONTROLS ================= */}
      <div className="flex flex-wrap items-center gap-3 mb-6 justify-between border-b border-slate-100 dark:border-slate-800 pb-5">

        {/* SEARCH */}
        <div className="relative">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID or dept..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border pl-10 pr-4 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl focus:outline-none text-sm font-semibold w-64 focus:border-blue-500"
          />
        </div>

        {/* STATUS FILTERS */}
        <div className="flex gap-2">
          {["all", "active", "completed"].map((item) => (
            <button
              key={item}
              onClick={() => setFilterStatus(item)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition
                ${filterStatus === item
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* UTILITIES */}
        <div className="flex gap-2">
          {/* TODAY ONLY */}
          <button
            onClick={() => setShowTodayOnly((p) => !p)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              showTodayOnly
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            {showTodayOnly ? "Showing Today" : "All Dates"}
          </button>

          {/* SORT */}
          <button
            onClick={() => setSortAsc((prev) => !prev)}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-bold"
          >
            <FaSort />
            Sort {sortAsc ? "Oldest" : "Newest"}
          </button>
        </div>

      </div>

      {/* ================= RESULT COUNT ================= */}
      <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 px-1">
        Showing {filteredVisitors.length} visitor logs
      </p>

      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
        <table className="min-w-full bg-white dark:bg-slate-900 text-sm">

          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-left font-bold uppercase tracking-wider text-xs">
            <tr>
              <th className="p-4">Visitor Info</th>
              <th className="p-4">Gate & Nature</th>
              <th className="p-4">Destination</th>
              <th className="p-4">Time In</th>
              <th className="p-4">Time Out</th>
              <th className="p-4">Duration</th>
              <th className="p-4">Checked In By</th>
              <th className="p-4">Checked Out By</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredVisitors.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center text-slate-400 py-10 font-semibold">
                  No visitors found in registry.
                </td>
              </tr>
            ) : (
              filteredVisitors.map((v) => {
                const isOfflineCompleted = offlineTimeouts.includes(v._id);
                return (
                  <tr
                    key={v._id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    {/* Visitor Info */}
                    <td className="p-4">
                      <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        {v.name}
                        {v.isUnderage && (
                          <span className="text-[10px] bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">
                            Underage
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">
                        ID: {v.isUnderage || v.idNumber === "N/A" ? "N/A (Underage)" : maskIdNumber(v.idNumber)}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">
                        {v.isUnderage ? "Guardian: " : "Phone: "}{v.phone}
                      </div>
                      {v.vehicleReg && <div className="text-[11px] text-blue-500 font-bold uppercase mt-0.5">Veh: {v.vehicleReg}</div>}
                    </td>

                    {/* Gate & Nature */}
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-md text-[11px] font-bold block w-fit mb-1 border border-blue-100 dark:border-blue-900/30">
                        {v.gate}
                      </span>
                      <span className="capitalize text-xs font-semibold block">{v.nature}</span>
                    </td>

                    {/* Destination */}
                    <td className="p-4">
                      <span className="text-sm font-extrabold">{v.department || "N/A"}</span>
                      {v.groupSize > 1 && (
                        <span className="block mt-1 text-[11px] bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-bold px-2 py-0.5 rounded w-fit border border-indigo-100 dark:border-indigo-900/30">
                          Group ({v.groupSize})
                        </span>
                      )}
                    </td>

                    {/* Time In */}
                    <td className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {new Date(v.createdAt).toLocaleString()}
                    </td>

                    {/* Time Out */}
                    <td className="p-4 text-xs font-semibold">
                      {v.timeOut ? (
                        new Date(v.timeOut).toLocaleString()
                      ) : isOfflineCompleted ? (
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 rounded-md font-bold text-[10px] animate-pulse">
                          Pending Checkout Sync
                        </span>
                      ) : (
                        <span className="text-green-500 font-bold text-xs flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                          Checked In
                        </span>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="p-4 text-sm font-bold text-slate-500">
                      {v.duration ? v.duration : isOfflineCompleted ? "—" : "—"}
                    </td>

                    {/* Checked In By */}
                    <td className="p-4 text-xs font-bold text-slate-500">
                      {v.checkedInBy || "System Admin"}
                    </td>

                    {/* Checked Out By */}
                    <td className="p-4 text-xs font-bold text-slate-500">
                      {v.timeOut ? (v.checkedOutBy || "System Admin") : isOfflineCompleted ? "Offline Sync" : "—"}
                    </td>

                    {/* Action Button */}
                    <td className="p-4 text-center">
                      {!v.timeOut && !isOfflineCompleted && (
                        <button
                          onClick={() => handleTimeOut(v._id)}
                          disabled={loadingTimeout === v._id}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 mx-auto"
                        >
                          {loadingTimeout === v._id && (
                            <ImSpinner2 className="animate-spin" />
                          )}
                          Time Out
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}
