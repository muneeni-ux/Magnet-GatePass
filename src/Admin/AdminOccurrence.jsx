import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Trash,
  FileClock,
  Search,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  Eye,
  ShieldAlert,
} from "lucide-react";
import { format } from "date-fns";
import { ClipLoader } from "react-spinners";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const ITEMS_PER_PAGE = 10;

const AdminOccurrence = () => {
  const [occurrences, setOccurrences] = useState([]);
  const [gates, setGates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterGate, setFilterGate] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOccurrence, setSelectedOccurrence] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [occRes, gatesRes] = await Promise.all([
        axios.get(`${SERVER_URL}/api/occurrences`),
        axios.get(`${SERVER_URL}/api/locations/gates`),
      ]);
      setOccurrences(occRes.data || []);
      setGates(gatesRes.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredOccurrences = occurrences.filter((o) => {
    const gateMatch = filterGate
      ? o.gate?.toLowerCase().includes(filterGate.toLowerCase())
      : true;
    const dateMatch = filterDate
      ? o.submittedAt &&
        format(new Date(o.submittedAt), "yyyy-MM-dd") === filterDate
      : true;
    const searchMatch = searchTerm
      ? [o.gate, o.remarks, o.submittedBy?.username]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      : true;

    return gateMatch && dateMatch && searchMatch;
  });

  const totalPages = Math.ceil(filteredOccurrences.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredOccurrences.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this occurrence?")) {
      try {
        await axios.delete(`${SERVER_URL}/api/occurrences/${id}`);
        setOccurrences((prev) => prev.filter((o) => o._id !== id));
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const exportToPDF = () => {
    if (filteredOccurrences.length === 0) return toast.error("No data to export");
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const dateStr = format(new Date(), "dd/MM/yyyy HH:mm:ss");

    autoTable(doc, {
      head: [["Gate", "End Time", "Unusual?", "Remarks", "Submitted By", "Submitted At"]],
      body: filteredOccurrences.map(o => [
        o.gate || "—",
        o.endTime ? format(new Date(o.endTime), "dd/MM/yyyy HH:mm") : "—",
        o.unusualOccurrence || "—",
        o.remarks || "—",
        o.submittedBy?.username || "—",
        o.submittedAt ? format(new Date(o.submittedAt), "dd/MM/yyyy HH:mm") : "—"
      ]),
      startY: 45,
      styles: { fontSize: 8, cellPadding: 3, font: "helvetica" },
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      didDrawPage: (data) => {
        try { doc.addImage("/VisiTrack-L3.png", "PNG", 14, 10, 25, 25); } catch (e) {}
        doc.setFontSize(18);
        doc.setTextColor(30, 41, 59);
        doc.text("VISITRACK SECURITY SYSTEM", 45, 20);
        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139);
        doc.text("Security Occurrence & Incident Log", 45, 26);
        doc.setFontSize(9);
        doc.text(`Generated on: ${dateStr}`, 45, 32);
        doc.setDrawColor(226, 232, 240);
        doc.line(14, 40, pageWidth - 14, 40);
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text("© 2026 VisiTrack Security System. All rights reserved.", 14, pageHeight - 10);
        const pageNum = doc.internal.getNumberOfPages();
        doc.text(`Page ${pageNum}`, pageWidth - 25, pageHeight - 10);
      },
      margin: { top: 45, bottom: 20 },
    });

    doc.save(`Security_Occurrences_${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast.success("PDF Report Generated!");
  };

  return (
    <div className="min-h-screen text-slate-800 font-sans pb-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl shadow-lg relative z-10 w-fit">
            <FileClock className="w-6 h-6" />
          </div>
          <div className="flex-1 relative z-10">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Security Occurrences
            </h1>
            <p className="text-slate-500 text-sm md:text-base mt-1 font-medium">
              Review and track all reported security events and shift logs.
            </p>
          </div>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 bg-white/80 hover:bg-white text-indigo-700 px-6 py-3 rounded-2xl font-extrabold transition-all shadow-[0_2px_15px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] relative z-10 w-full sm:w-auto justify-center group"
          >
            <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" />
            Export PDF
          </button>
        </div>

        <div className="glass-panel p-5 md:p-6 rounded-3xl flex flex-col md:flex-row items-center gap-5">
          <div className="relative w-full md:w-64">
            <Filter
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <select
              className="w-full pl-11 pr-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm appearance-none shadow-inner cursor-pointer"
              value={filterGate}
              onChange={(e) => setFilterGate(e.target.value)}
            >
              <option value="">All Gates</option>
              {gates.map((g) => (
                <option key={g._id} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full md:w-56">
            <Calendar
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="date"
              className="w-full pl-11 pr-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm shadow-inner cursor-pointer"
              value={filterDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>

          <div className="relative flex-1 w-full">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by gate, remarks, or user..."
              className="w-full pl-11 pr-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="glass-panel overflow-hidden rounded-3xl border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <ClipLoader color="#6366f1" size={40} />
            </div>
          ) : currentItems.length === 0 ? (
            <div className="text-center py-16 bg-white/40 border border-white/60 rounded-2xl m-6 backdrop-blur-md">
              <FileClock size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-bold">
                No occurrences found matching criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-white/40 border-b border-white/60 text-slate-600 uppercase tracking-widest text-[11px] font-extrabold backdrop-blur-md">
                    <th className="px-6 py-5">Gate</th>
                    <th className="px-6 py-5">End Time</th>
                    <th className="px-6 py-5">Unusual?</th>
                    <th className="px-6 py-5 hidden md:table-cell">Remarks</th>
                    <th className="px-6 py-5">Submitted By</th>
                    <th className="px-6 py-5">Submitted At</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {currentItems.map((o) => (
                    <tr key={o._id} className="bg-transparent hover:bg-white/60 transition-all duration-200 group border-b border-white/40 last:border-0 hover:shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
                      <td className="px-6 py-4 font-semibold text-slate-800">{o.gate || "—"}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {o.endTime ? format(new Date(o.endTime), "dd/MM/yyyy HH:mm") : "—"}
                      </td>
                      <td className="px-6 py-4">
                        {o.unusualOccurrence?.toLowerCase() === "yes" ? (
                          <button
                            onClick={() => setSelectedOccurrence(o)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors shadow-sm"
                          >
                            <Eye size={12} />
                            View Incident
                          </button>
                        ) : (
                          <span className="text-slate-500">{o.unusualOccurrence || "—"}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="max-w-[200px] truncate text-slate-600" title={o.remarks}>{o.remarks || "—"}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{o.submittedBy?.username || "—"}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {o.submittedAt ? format(new Date(o.submittedAt), "dd/MM/yyyy HH:mm") : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* <button
                            onClick={() => toast("Editing is under development", { icon: "ℹ️" })}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-200 rounded-lg shadow-sm transition-all"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button> */}
                          <button
                            onClick={() => handleDelete(o._id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 bg-white border border-slate-200 hover:border-red-200 rounded-lg shadow-sm transition-all"
                            title="Delete"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="flex justify-between items-center px-6 py-5 border-t border-white/60 bg-white/20 backdrop-blur-md">
                  <span className="text-sm font-bold text-slate-500">
                    Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredOccurrences.length)} of {filteredOccurrences.length} entries
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div className="flex space-x-1">
                      {[...Array(totalPages)].map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPage(idx + 1)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === idx + 1 ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Incident Details Modal */}
      {selectedOccurrence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100">
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                Incident Details
              </h3>
              <button
                onClick={() => setSelectedOccurrence(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 font-semibold mb-1 text-xs uppercase tracking-wider">Gate</p>
                  <p className="font-bold text-slate-800">{selectedOccurrence.gate || "—"}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-semibold mb-1 text-xs uppercase tracking-wider">Time Recorded</p>
                  <p className="font-bold text-slate-800">
                    {selectedOccurrence.submittedAt ? format(new Date(selectedOccurrence.submittedAt), "dd/MM/yyyy HH:mm") : "—"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-slate-500 font-semibold mb-1 text-xs uppercase tracking-wider">Description</p>
                <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedOccurrence.unusualDescription || "No detailed description provided."}
                </div>
              </div>
              <div>
                <p className="text-slate-500 font-semibold mb-1 text-xs uppercase tracking-wider">General Remarks</p>
                <div className="p-3 bg-slate-50 rounded-xl text-slate-600 text-sm leading-relaxed">
                  {selectedOccurrence.remarks || "—"}
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedOccurrence(null)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-lg transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOccurrence;
