import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FaSearch, FaSort } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { FileText, Clock, Filter, AlertTriangle } from "lucide-react";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export default function VisitorHistory() {
  const [visitors, setVisitors] = useState([]);
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loadingTimeout, setLoadingTimeout] = useState(null);

  const fetchVisitors = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/visitors`);
      const data = await res.json();
      setVisitors(data);
    } catch (error) {
      toast.error("Error loading visitors");
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
        }
      );
      if (!res.ok) throw new Error();
      toast.success("Time out recorded!");
      fetchVisitors();
    } catch {
      toast.error("Could not record time out");
    }
    setLoadingTimeout(null);
  };

  useEffect(() => {
    fetchVisitors();
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

  return (
    <div className="min-h-screen bg-slate-950 text-blue-100 font-mono p-4 md:p-6 pt-24 relative">
       {/* Background Grid */}
       <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
            style={{
                backgroundImage: "linear-gradient(#1e40af 1px, transparent 1px), linear-gradient(90deg, #1e40af 1px, transparent 1px)",
                backgroundSize: "40px 40px"
            }}>
        </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-blue-900/30 pb-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-900/20 rounded-md border border-blue-500/30">
                    <FileText className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-widest uppercase">Visitor Logs</h2>
                    <p className="text-xs text-blue-400/70 uppercase tracking-wider">Secure Access Records Database</p>
                </div>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-blue-900/50 rounded-sm">
                 <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                 <span className="text-xs font-bold text-blue-300">DATABASE SYNCED</span>
            </div>
        </div>

        {/* Controls Toolbar */}
        <div className="bg-slate-900/80 border border-blue-900/50 p-4 rounded-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-sm">
            
            {/* Search */}
            <div className="relative w-full md:w-auto">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                    type="text"
                    placeholder="SEARCH RECORDS..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-64 bg-slate-950 border border-blue-900/30 text-blue-100 pl-10 pr-4 py-2 rounded-sm focus:outline-none focus:border-blue-500 text-xs placeholder-slate-600 uppercase"
                />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex bg-slate-950 border border-blue-900/30 rounded-sm p-1">
                    {["all", "active", "completed"].map((item) => (
                        <button
                        key={item}
                        onClick={() => setFilterStatus(item)}
                        className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors rounded-sm ${
                            filterStatus === item
                            ? "bg-blue-600 text-white"
                            : "text-slate-500 hover:text-blue-400"
                        }`}
                        >
                        {item}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setShowTodayOnly((p) => !p)}
                    className={`flex items-center gap-2 px-3 py-1.5 border rounded-sm text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        showTodayOnly 
                        ? "bg-blue-900/30 border-blue-500 text-blue-300" 
                        : "bg-slate-950 border-blue-900/30 text-slate-500 hover:border-blue-500/50"
                    }`}
                >
                    <Clock size={12} />
                    {showTodayOnly ? "Today Only" : "All Time"}
                </button>

                <button
                    onClick={() => setSortAsc((prev) => !prev)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-blue-900/30 rounded-sm text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:border-blue-500/50 transition-colors"
                >
                    <FaSort />
                    {sortAsc ? "Oldest" : "Newest"}
                </button>
            </div>
        </div>

        {/* Table */}
        <div className="bg-slate-900/50 border border-blue-900/30 rounded-sm overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-blue-900/20 border-b border-blue-900/50 text-xs text-blue-300 uppercase tracking-wider">
                            <th className="p-4 font-bold border-r border-blue-900/30">Visitor Name</th>
                            <th className="p-4 font-bold border-r border-blue-900/30">Dept / Dest</th>
                            <th className="p-4 font-bold border-r border-blue-900/30">Gate</th>
                            <th className="p-4 font-bold border-r border-blue-900/30">Purpose</th>
                            <th className="p-4 font-bold border-r border-blue-900/30">Time In</th>
                            <th className="p-4 font-bold border-r border-blue-900/30">Time Out</th>
                            <th className="p-4 font-bold border-r border-blue-900/30">Duration</th>
                            <th className="p-4 font-bold text-center">Protocol</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs text-slate-300">
                        {filteredVisitors.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="p-8 text-center text-slate-500 uppercase tracking-widest">
                                    No records found in current query.
                                </td>
                            </tr>
                        ) : (
                            filteredVisitors.map((v, idx) => (
                                <tr 
                                    key={v._id} 
                                    className={`border-b border-blue-900/10 hover:bg-blue-900/10 transition-colors ${idx % 2 === 0 ? 'bg-slate-950/30' : 'bg-transparent'}`}
                                >
                                    <td className="p-4 border-r border-blue-900/30 font-medium text-white">{v.name}</td>
                                    <td className="p-4 border-r border-blue-900/30">{v.department}</td>
                                    <td className="p-4 border-r border-blue-900/30 text-blue-400">{v.gate}</td>
                                    <td className="p-4 border-r border-blue-900/30">{v.nature}</td>
                                    <td className="p-4 border-r border-blue-900/30 font-mono text-blue-200">{new Date(v.createdAt).toLocaleString()}</td>
                                    <td className="p-4 border-r border-blue-900/30 font-mono">
                                        {v.timeOut ? (
                                            <span className="text-slate-400">{new Date(v.timeOut).toLocaleString()}</span>
                                        ) : (
                                            <span className="text-green-500 animate-pulse font-bold">ACTIVE</span>
                                        )}
                                    </td>
                                    <td className="p-4 border-r border-blue-900/30 font-mono">{v.duration || "—"}</td>
                                    <td className="p-4 text-center">
                                        {!v.timeOut ? (
                                            <button
                                                onClick={() => handleTimeOut(v._id)}
                                                disabled={loadingTimeout === v._id}
                                                className="px-3 py-1 bg-red-900/30 border border-red-500/50 text-red-400 hover:bg-red-900/50 hover:text-white rounded-sm text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 mx-auto"
                                            >
                                                {loadingTimeout === v._id && <ImSpinner2 className="animate-spin" />}
                                                LOG EXIT
                                            </button>
                                        ) : (
                                            <span className="flex items-center justify-center gap-1 text-slate-600 text-[10px] font-bold uppercase">
                                                <AlertTriangle size={10} /> CLOSED
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
             <div className="bg-slate-900 border-t border-blue-900/30 p-2 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                    SHOWING {filteredVisitors.length} RECORDS // END OF LIST
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
