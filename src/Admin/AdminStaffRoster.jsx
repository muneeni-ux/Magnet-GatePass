import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { format } from "date-fns";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Download,
  FileText,
  UserPlus,
  Clock,
  Search,
  Phone,
  Building2,
  X,
  UserCheck,
  History,
  User
} from "lucide-react";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const AdminStaffRoster = () => {
  const [rawStaffDirectory, setRawStaffDirectory] = useState([]);
  const [allVisitors, setAllVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal for Viewing Individual Staff Details & History
  const [selectedStaffModal, setSelectedStaffModal] = useState(null);
  const [modalTab, setModalTab] = useState("attendance"); // "attendance" or "visitors"

  // New Staff Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    staffId: "",
    phone: "",
    department: "",
    role: "Staff Member",
    gate: "",
    email: "",
  });
  const [submittingStaff, setSubmittingStaff] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (selectedStaffModal || showAddModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedStaffModal, showAddModal]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [visitorsRes, staffRes] = await Promise.all([
        axios.get(`${SERVER_URL}/api/visitors`),
        axios.get(`${SERVER_URL}/api/staff`).catch(() => ({ data: [] })),
      ]);

      const allVis = visitorsRes.data || [];
      setAllVisitors(allVis);
      setRawStaffDirectory(staffRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load staff roster data");
    } finally {
      setLoading(false);
    }
  };

  // Compile Unique Staff Profiles (Deduplicated 1-Row Per Staff Member)
  const compileUniqueProfiles = () => {
    const profileMap = new Map();

    // 1. Process staff registered in Staff DB
    rawStaffDirectory.forEach((s) => {
      const key = (s.staffId || s.name).trim().toLowerCase();
      profileMap.set(key, {
        _id: s._id,
        name: s.name,
        staffId: s.staffId || "STF-" + s._id.slice(-4).toUpperCase(),
        phone: s.phone || "-",
        department: s.department || "General",
        role: s.role || "Staff Member",
        gate: s.gate || "-",
        attendanceLogs: [],
        hostedVisitors: [],
        isActiveNow: false,
        activeGate: null,
        totalVisits: 0,
        lastCheckIn: null,
      });
    });

    // 2. Process check-in logs from Visitor collection (nature === 'staff')
    const staffLogs = allVisitors.filter((v) => v.nature === "staff");
    staffLogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    staffLogs.forEach((log) => {
      const logKey = (log.idNumber || log.name).trim().toLowerCase();
      let profile = profileMap.get(logKey);

      if (!profile) {
        const nameKey = log.name.trim().toLowerCase();
        for (const [k, p] of profileMap.entries()) {
          if (p.name.trim().toLowerCase() === nameKey) {
            profile = p;
            break;
          }
        }
      }

      if (!profile) {
        profile = {
          _id: log._id,
          name: log.name,
          staffId: log.idNumber || "STF-" + log._id.slice(-4).toUpperCase(),
          phone: log.phone || "-",
          department: log.department || "General",
          role: "Staff Member",
          gate: log.gate || "-",
          attendanceLogs: [],
          hostedVisitors: [],
          isActiveNow: false,
          activeGate: null,
          totalVisits: 0,
          lastCheckIn: null,
        };
        profileMap.set(logKey, profile);
      }

      profile.attendanceLogs.push(log);
      profile.totalVisits += 1;

      if (!log.timeOut) {
        profile.isActiveNow = true;
        profile.activeGate = log.gate;
      }

      const logDate = new Date(log.createdAt);
      if (!profile.lastCheckIn || logDate > new Date(profile.lastCheckIn)) {
        profile.lastCheckIn = log.createdAt;
      }
    });

    // 3. Aggregate visitors hosted by each staff member
    allVisitors.forEach((v) => {
      if (v.hostStaff && v.nature !== "staff") {
        const hostNameKey = v.hostStaff.trim().toLowerCase();
        for (const [k, p] of profileMap.entries()) {
          if (p.name.trim().toLowerCase() === hostNameKey) {
            p.hostedVisitors.push(v);
            break;
          }
        }
      }
    });

    return Array.from(profileMap.values());
  };

  const uniqueProfiles = compileUniqueProfiles();

  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    if (
      !newStaff.name ||
      !newStaff.staffId ||
      !newStaff.phone ||
      !newStaff.department
    ) {
      return toast.error("Please fill in Name, Staff ID, Phone, and Department");
    }

    setSubmittingStaff(true);
    try {
      const res = await axios.post(`${SERVER_URL}/api/staff`, newStaff);
      toast.success(`Staff member ${res.data.name} added successfully!`);
      setShowAddModal(false);
      setNewStaff({
        name: "",
        staffId: "",
        phone: "",
        department: "",
        role: "Staff Member",
        gate: "",
        email: "",
      });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to add staff member");
    } finally {
      setSubmittingStaff(false);
    }
  };

  const filteredRoster = uniqueProfiles.filter((staff) => {
    const matchesSearch =
      !searchQuery ||
      staff.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.phone?.includes(searchQuery) ||
      staff.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.staffId?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (!startDate && !endDate) return true;

    if (!staff.lastCheckIn) return false;
    const logDate = new Date(staff.lastCheckIn);
    logDate.setHours(0, 0, 0, 0);

    const start = startDate ? new Date(startDate) : null;
    if (start) start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    if (start && end) return logDate >= start && logDate <= end;
    if (start) return logDate >= start;
    if (end) return logDate <= end;
    return true;
  });

  const handleExportCSV = () => {
    if (filteredRoster.length === 0) return toast.error("No data to export");

    const headers = [
      "Staff Name,Staff ID,Phone,Department,Duty Gate,Current Status,Total Duty Visits,Hosted Visitors",
    ];
    const rows = filteredRoster.map((s) => {
      const statusStr = s.isActiveNow ? `Active (${s.activeGate})` : "Off Duty";
      return `"${s.name}","${s.staffId}","${s.phone}","${s.department}","${s.activeGate || s.gate}","${statusStr}","${s.totalVisits}","${s.hostedVisitors.length}"`;
    });

    const csvContent =
      "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Staff_Roster_${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (filteredRoster.length === 0) return toast.error("No data to export");

    const doc = new jsPDF();
    const dateStr = format(new Date(), "dd/MM/yyyy HH:mm:ss");

    autoTable(doc, {
      head: [
        [
          "Staff Name",
          "Staff ID",
          "Phone",
          "Department",
          "Duty Gate",
          "Current Status",
          "Total Visits",
        ],
      ],
      body: filteredRoster.map((s) => [
        s.name,
        s.staffId,
        s.phone,
        s.department,
        s.activeGate || s.gate,
        s.isActiveNow ? `Active (${s.activeGate})` : "Off Duty",
        `${s.totalVisits} Shifts`,
      ]),
      startY: 40,
      styles: { fontSize: 8, cellPadding: 2.5, font: "helvetica" },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      didDrawPage: () => {
        doc.setFontSize(16);
        doc.setTextColor(30, 41, 59);
        doc.text("VISITRACK SECURITY SYSTEM", 14, 18);
        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139);
        doc.text("Official Staff Roster & Summary Report", 14, 24);
        doc.setFontSize(9);
        doc.text(`Generated: ${dateStr}`, 14, 34);
        doc.text(
          `Total Staff: ${filteredRoster.length}`,
          doc.internal.pageSize.width - 14,
          34,
          { align: "right" }
        );
      },
    });

    doc.save(`Staff_Roster_${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  const columns = [
    {
      name: "Staff Name",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => (
        <div className="py-1">
          <span className="font-extrabold text-slate-900 block">{row.name}</span>
          <span className="text-[11px] text-blue-600 font-semibold">{row.role}</span>
        </div>
      ),
    },
    {
      name: "Staff ID",
      selector: (row) => row.staffId,
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
          {row.staffId}
        </span>
      ),
    },
    { name: "Phone", selector: (row) => row.phone, sortable: true },
    { name: "Department", selector: (row) => row.department, sortable: true },
    { name: "Gate", selector: (row) => row.activeGate || row.gate || "-", sortable: true },
    {
      name: "Duty Status",
      selector: (row) => (row.isActiveNow ? "Active" : "Off Duty"),
      sortable: true,
      cell: (row) => (
        <span
          className={
            row.isActiveNow
              ? "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 shadow-sm"
              : "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200"
          }
        >
          <span className={`w-2 h-2 rounded-full ${row.isActiveNow ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}></span>
          {row.isActiveNow ? `Active (${row.activeGate || "Gate"})` : "Off Duty"}
        </span>
      ),
    },
    {
      name: "Duty Shifts",
      selector: (row) => row.totalVisits,
      sortable: true,
      cell: (row) => (
        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
          {row.totalVisits} Shifts
        </span>
      ),
    },
    {
      name: "Action",
      cell: (row) => (
        <button
          onClick={() => {
            setSelectedStaffModal(row);
            setModalTab("attendance");
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs rounded-xl transition-all shadow-sm border border-blue-200"
        >
          <History size={14} /> Logs
        </button>
      ),
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "rgba(255, 255, 255, 0.6)",
        color: "#475569",
        fontWeight: "800",
        textTransform: "uppercase",
        fontSize: "0.75rem",
        letterSpacing: "0.1em",
        borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
      },
    },
    rows: {
      style: {
        fontSize: "0.875rem",
        color: "#1e293b",
        fontWeight: "500",
        backgroundColor: "transparent",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.9)",
        },
      },
    },
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden mb-10">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10">
        {/* Header & Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6 border-b border-slate-200/80 gap-4">
          <div>
            <h2
              className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Staff Attendance & Roster
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Unified roster view: Each staff member is listed once with active duty status, shift logs, and hosted visitors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <UserPlus size={16} /> Add New Staff
            </button>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-sm mb-6 gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff name, ID, phone..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-center w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
              />
            </div>
            {(startDate || endDate || searchQuery) && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setSearchQuery("");
                }}
                className="text-xs font-bold text-red-500 hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <FileText size={14} /> CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <Download size={14} /> PDF
            </button>
          </div>
        </div>

        {/* Unique Staff Roster Table */}
        <div className="bg-white/50 backdrop-blur-md rounded-2xl overflow-hidden border border-white/60 shadow-sm">
          <DataTable
            columns={columns}
            data={filteredRoster}
            pagination
            responsive
            highlightOnHover
            striped
            progressPending={loading}
            customStyles={customStyles}
          />
        </div>
      </div>

      {/* PERFECTED MODAL (SOFT OVERLAY, CENTERED, NO OUTER SCROLL) */}
      {selectedStaffModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-hidden animate-in fade-in duration-150">
          
          {/* Soft Transparent Backdrop Overlay */}
          <div
            className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedStaffModal(null)}
          ></div>

          {/* Modal Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl p-5 sm:p-7 w-full max-w-4xl max-h-[85vh] relative z-10 animate-in zoom-in-95 duration-150 flex flex-col"
          >
            
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 text-white p-5 rounded-2xl shadow-md mb-5 overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center text-white shadow-inner shrink-0">
                  <User size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
                      {selectedStaffModal.name}
                    </h3>
                    <span className="font-mono text-xs font-bold bg-white/20 text-white px-2 py-0.5 rounded-md backdrop-blur-sm">
                      {selectedStaffModal.staffId}
                    </span>
                  </div>
                  <p className="text-blue-100 text-xs font-medium mt-0.5">
                    {selectedStaffModal.role} &bull; {selectedStaffModal.department} &bull; 📞 {selectedStaffModal.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 relative z-10">
                <span
                  className={
                    selectedStaffModal.isActiveNow
                      ? "px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-extrabold flex items-center gap-1.5 shadow-sm"
                      : "px-3 py-1 rounded-full bg-white/10 text-slate-300 border border-white/20 text-xs font-bold"
                  }
                >
                  <span className={`w-2 h-2 rounded-full ${selectedStaffModal.isActiveNow ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`}></span>
                  {selectedStaffModal.isActiveNow ? `Active (${selectedStaffModal.activeGate || "Gate"})` : "Off Duty"}
                </span>

                <button
                  onClick={() => setSelectedStaffModal(null)}
                  className="p-1.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 shrink-0">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">Total Duty Shifts</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                  {selectedStaffModal.attendanceLogs.length} Shifts
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">Duty Status</span>
                <span className="text-base font-extrabold text-blue-600 dark:text-emerald-400 mt-0.5 block truncate">
                  {selectedStaffModal.isActiveNow ? `Duty: ${selectedStaffModal.activeGate}` : "Off Duty"}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">Visitors Hosted</span>
                <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                  {selectedStaffModal.hostedVisitors.length} Visitors
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">Last Active</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5 block truncate">
                  {selectedStaffModal.lastCheckIn ? format(new Date(selectedStaffModal.lastCheckIn), "dd/MM/yyyy HH:mm") : "N/A"}
                </span>
              </div>
            </div>

            {/* Modal Sub-Tab Controls */}
            <div className="flex items-center gap-3 mb-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-fit border border-slate-200/60 dark:border-slate-700 shrink-0">
              <button
                onClick={() => setModalTab("attendance")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
                  modalTab === "attendance"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-emerald-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Clock size={15} /> Duty Check-In History ({selectedStaffModal.attendanceLogs.length})
              </button>
              <button
                onClick={() => setModalTab("visitors")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
                  modalTab === "visitors"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-emerald-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <UserCheck size={15} /> Visitors Hosted ({selectedStaffModal.hostedVisitors.length})
              </button>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar space-y-2.5 min-h-0">
              
              {/* Sub-Tab 1: Staff Duty Check-In Logs */}
              {modalTab === "attendance" && (
                <div>
                  {selectedStaffModal.attendanceLogs.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl border border-slate-100">
                      No duty check-in records logged for this staff member.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {selectedStaffModal.attendanceLogs.map((log) => (
                        <div
                          key={log._id}
                          className="p-3.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-emerald-500/10 text-blue-600 dark:text-emerald-400 rounded-xl">
                              <Building2 size={16} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                                  Gate: {log.gate}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-bold">
                                  {log.department}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                                IN: {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss")}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-right">
                            {log.timeOut ? (
                              <div>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                                  OUT: {format(new Date(log.timeOut), "dd/MM/yyyy HH:mm:ss")}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                                  Duration: {log.duration}
                                </span>
                              </div>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 font-extrabold text-[11px] border border-emerald-300 dark:border-emerald-500/30">
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Tab 2: Visitors Hosted */}
              {modalTab === "visitors" && (
                <div>
                  {selectedStaffModal.hostedVisitors.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl border border-slate-100">
                      No visitors have listed this staff member as host.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {selectedStaffModal.hostedVisitors.map((vis) => (
                        <div
                          key={vis._id}
                          className="p-3.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                              <UserCheck size={16} />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">
                                {vis.name} {vis.isGroup && <span className="text-[10px] text-purple-600 font-bold">(Group of {vis.groupSize})</span>}
                              </h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                Phone: {vis.phone} | Gate: {vis.gate} | Dest: {vis.department}
                              </p>
                            </div>
                          </div>

                          <div className="text-right font-mono">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                              {format(new Date(vis.createdAt), "dd/MM/yyyy HH:mm")}
                            </span>
                            <span
                              className={
                                vis.timeOut
                                  ? "text-slate-400 text-[10px] font-bold"
                                  : "text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px]"
                              }
                            >
                              {vis.timeOut ? "Checked Out" : "Currently Inside"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          ></div>
          <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 sm:p-8 w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-150">
            <h3
              className="text-xl font-bold text-slate-900 mb-1"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Add Staff Member
            </h3>
            <p className="text-slate-500 text-xs mb-6 font-medium">
              Register a new staff member into the duty staff directory.
            </p>

            <form onSubmit={handleAddStaffSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Staff Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newStaff.name}
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, name: e.target.value })
                  }
                  placeholder="e.g. Dr. Jane Doe"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Staff ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStaff.staffId}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, staffId: e.target.value })
                    }
                    placeholder="e.g. STF-101"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newStaff.phone}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, phone: e.target.value })
                    }
                    placeholder="07XXXXXXXX"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Department *
                </label>
                <input
                  type="text"
                  required
                  value={newStaff.department}
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, department: e.target.value })
                  }
                  placeholder="e.g. Human Resources"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Title / Role (Optional)
                </label>
                <input
                  type="text"
                  value={newStaff.role}
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, role: e.target.value })
                  }
                  placeholder="e.g. Senior HR Manager"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 text-slate-500 font-bold text-xs rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingStaff}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  {submittingStaff ? "Saving..." : "Save Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStaffRoster;
