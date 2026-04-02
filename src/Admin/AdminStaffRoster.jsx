import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { format } from "date-fns";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, FileText } from "lucide-react";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const AdminStaffRoster = () => {
  const [staffLogs, setStaffLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  

  useEffect(() => {
    fetchStaffLogs();
  }, []);

  const fetchStaffLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${SERVER_URL}/api/visitors`);
      // Filter only staff
      const staffOnly = res.data.filter(v => v.nature === 'staff');
      // Sort by newest first
      staffOnly.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setStaffLogs(staffOnly);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load staff roster");
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = staffLogs.filter((log) => {
    if (!startDate && !endDate) return true;
    const logDate = new Date(log.createdAt);
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
    if (filteredLogs.length === 0) return toast.error("No data to export");

    const headers = ["Staff Name,Phone,Department,Gate,Check In,Check Out"];
    const rows = filteredLogs.map((row) => {
      const checkIn = format(new Date(row.createdAt), "dd/MM/yyyy HH:mm");
      const checkOut = row.timeOut ? format(new Date(row.timeOut), "dd/MM/yyyy HH:mm") : "Currently Active";
      return `"${row.name}","${row.phone}","${row.department}","${row.gate}","${checkIn}","${checkOut}"`;
    });

    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Staff_Roster_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (filteredLogs.length === 0) return toast.error("No data to export");

    const doc = new jsPDF();
    const dateStr = format(new Date(), "dd/MM/yyyy HH:mm:ss");

    autoTable(doc, {
      head: [["Staff Name", "Phone", "Department", "Gate", "Check In", "Check Out"]],
      body: filteredLogs.map((row) => [
         row.name,
         row.phone,
         row.department,
         row.gate,
         format(new Date(row.createdAt), "dd/MM/yyyy HH:mm"),
         row.timeOut ? format(new Date(row.timeOut), "dd/MM/yyyy HH:mm") : "Active"
      ]),
      startY: 40,
      styles: { fontSize: 9, cellPadding: 3, font: "helvetica" },
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' }, // Blue-500
      alternateRowStyles: { fillColor: [248, 250, 252] }, // Slate-50
      didDrawPage: (data) => {
        // Updated PDF branding
        try { doc.addImage("/VisiTrack-L3.png", "PNG", 14, 10, 20, 20); } catch(e){}
        doc.setFontSize(16);
        doc.setTextColor(30, 41, 59);
        doc.text("VISITRACK SECURITY SYSTEM", 38, 18);
        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139);
        doc.text("Official Staff Roster Report", 38, 24);
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated: ${dateStr}`, 14, 35);
        doc.text(`Total Records: ${filteredLogs.length}`, doc.internal.pageSize.width - 14, 35, { align: "right" });
        const pageHeight = doc.internal.pageSize.height;
        doc.setDrawColor(226, 232, 240);
        doc.line(14, pageHeight - 12, doc.internal.pageSize.width - 14, pageHeight - 12);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, doc.internal.pageSize.width - 14, pageHeight - 8, { align: "right" });
      }
    });

    doc.save(`Staff_Roster_${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  const columns = [
    { name: "Staff Name", selector: (row) => row.name, sortable: true },
    { name: "Phone", selector: (row) => row.phone, sortable: true },
    { name: "Department", selector: (row) => row.department, sortable: true },
    { name: "Gate", selector: (row) => row.gate, sortable: true },
    { 
      name: "Check In", 
      selector: (row) => format(new Date(row.createdAt), "dd/MM/yyyy HH:mm"), 
      sortable: true 
    },
    { 
      name: "Check Out", 
      selector: (row) => row.timeOut ? format(new Date(row.timeOut), "dd/MM/yyyy HH:mm") : "Currently Active", 
      sortable: true,
      cell: (row) => (
        <span className={!row.timeOut ? "px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-semibold" : ""}>
          {row.timeOut ? format(new Date(row.timeOut), "dd/MM/yyyy HH:mm") : "Currently Active"}
        </span>
      )
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        color: "#475569",
        fontWeight: "800",
        textTransform: "uppercase",
        fontSize: "0.75rem",
        letterSpacing: "0.1em",
        borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
        backdropFilter: "blur(10px)",
      },
    },
    rows: {
      style: {
        fontSize: "0.875rem",
        color: "#1e293b",
        fontWeight: "500",
        backgroundColor: "transparent",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.02)",
          transform: "translateY(-1px)",
          transition: "all 0.2s ease",
          zIndex: 1,
        },
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid rgba(0, 0, 0, 0.05)",
        backgroundColor: "transparent",
      },
    },
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden mb-10">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-2 text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Staff Attendance Roster</h2>
        <p className="text-slate-500 text-sm mb-8 font-medium">Real-time attendance tracking of all staff members currently clocked in and historical records.</p>
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white/40 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-sm mb-6 gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
          <div className="flex flex-col w-full md:w-auto">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex flex-col w-full md:w-auto">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">End Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          {(startDate || endDate) && (
            <button 
              onClick={() => {setStartDate(""); setEndDate("");}}
              className="mt-5 text-sm font-medium text-red-500 hover:text-red-700 transition"
            >
              Clear
            </button>
          )}
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleExportCSV}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-lg text-sm font-bold transition-colors shadow-sm"
          >
            <FileText size={16} /> CSV
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm shadow-red-200"
          >
            <Download size={16} /> PDF
          </button>
        </div>
      </div>

      <div className="bg-white/40 backdrop-blur-md rounded-2xl overflow-hidden border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <DataTable
          columns={columns}
          data={filteredLogs}
          pagination
          responsive
          highlightOnHover
          striped
          progressPending={loading}
          customStyles={customStyles}
        />
      </div>
      </div>
    </div>
  );
};

export default AdminStaffRoster;
