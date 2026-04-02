import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { CSVLink } from "react-csv";
import {
  Download,
  Printer,
  Search,
  Edit,
  Trash,
  Baby,
  Users,
} from "lucide-react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import format from "date-fns/format";
import isWithinInterval from "date-fns/isWithinInterval";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const maskIdNumber = (idStr) => {
  if (!idStr) return "-";
  const str = idStr.toString();
  if (str.length <= 4) return str.replace(/./g, '*');
  const first = str.slice(0, 3);
  const last = str.slice(-3);
  const asterisks = '*'.repeat(Math.max(3, str.length - 6));
  return `${first}${asterisks}${last}`;
};

const VisitorsDetails = () => {
  const [visitors, setVisitors] = useState([]);
  const [gates, setGates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [todayOnly, setTodayOnly] = useState(false);
  const [overstayedOnly, setOverstayedOnly] = useState(false);
  const [department, setDepartment] = useState("");
  const [filterGate, setFilterGate] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [visRes, gateRes, deptRes] = await Promise.all([
          axios.get(`${SERVER_URL}/api/visitors`),
          axios.get(`${SERVER_URL}/api/locations/gates`),
          axios.get(`${SERVER_URL}/api/locations/departments`),
        ]);
        setVisitors(visRes.data || []);
        setGates(gateRes.data || []);
        setDepartments(deptRes.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this visitor?")) {
      try {
        await axios.delete(`${SERVER_URL}/api/visitors/${id}`);
        setVisitors((prev) => prev.filter((v) => v._id !== id));
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const handlePDFExport = () => {
    if (filteredVisitors.length === 0) return alert("No data to export");

    const doc = new jsPDF();
    const dateStr = format(new Date(), "dd/MM/yyyy HH:mm:ss");

    autoTable(doc, {
      head: [["Name", "ID No", "Phone", "Vehicle", "Department", "Gate", "Nature", "Time In", "Time Out"]],
      body: filteredVisitors.map((v) => [
        v.name,
        maskIdNumber(v.idNumber),
        v.phone,
        v.vehicleReg || "-",
        v.department,
        v.gate,
        v.nature,
        format(new Date(v.createdAt), "dd/MM/yyyy HH:mm"),
        v.timeOut ? format(new Date(v.timeOut), "dd/MM/yyyy HH:mm") : "Inside",
      ]),
      startY: 40,
      styles: { fontSize: 7, cellPadding: 2, font: "helvetica" },
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      didDrawPage: (data) => {
        try { doc.addImage("/VisiTrack-L3.png", "PNG", 14, 10, 20, 20); } catch(e){}
        doc.setFontSize(16);
        doc.setTextColor(30, 41, 59);
        doc.text("VISITRACK SECURITY SYSTEM", 38, 18);
        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139);
        doc.text("Visitor Records & Detail Report", 38, 24);
        doc.setFontSize(9);
        doc.text(`Generated: ${dateStr}`, 14, 35);
        doc.text(`Total Records: ${filteredVisitors.length}`, doc.internal.pageSize.width - 14, 35, { align: "right" });
        const pageHeight = doc.internal.pageSize.height;
        doc.setDrawColor(226, 232, 240);
        doc.line(14, pageHeight - 12, doc.internal.pageSize.width - 14, pageHeight - 12);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, doc.internal.pageSize.width - 14, pageHeight - 8, { align: "right" });
      }
    });

    doc.save(`Visitor_Records_${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  const isToday = (dateStr) => {
    const today = new Date();
    const date = new Date(dateStr);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isOverstayed = (dateStr) => {
    const created = new Date(dateStr);
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    if (created < startOfToday) {
      return true;
    }

    const fivePM = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      17,
      0,
      0,
    );
    if (now >= fivePM && created < fivePM) {
      return true;
    }

    return false;
  };

  const filterByDate = (visitor) => {
    if (!dateRange.from || !dateRange.to) return true;
    const created = new Date(visitor.createdAt);
    return isWithinInterval(created, {
      start: new Date(dateRange.from),
      end: new Date(dateRange.to),
    });
  };

  const filteredVisitors = visitors.filter((visitor) => {
    const nameMatch = visitor.name
      ?.toLowerCase()
      .includes(filterText.toLowerCase());
    const todayMatch = todayOnly ? isToday(visitor.createdAt) : true;
    const gateObjMatch = filterGate ? visitor.gate === filterGate : true;
    const departmentMatch = department
      ? visitor.department === department
      : true;
    const dateMatch = filterByDate(visitor);
    const overstayMatch = overstayedOnly
      ? !visitor.timeOut && isOverstayed(visitor.createdAt)
      : true;

    return (
      nameMatch &&
      todayMatch &&
      departmentMatch &&
      gateObjMatch &&
      dateMatch &&
      overstayMatch
    );
  });

  const selectedGateObj = gates.find((g) => g.name === filterGate);
  const filteredDepartments = selectedGateObj
    ? departments.filter(
        (d) =>
          d.gateId === selectedGateObj._id ||
          (d.gateId && d.gateId._id === selectedGateObj._id),
      )
    : departments;

  const filteredExportData = filteredVisitors.map((v) => ({
    "Name": v.name,
    "ID Number": maskIdNumber(v.idNumber),
    "Phone": v.phone,
    "Vehicle Reg": v.vehicleReg || "-",
    "Department": v.department,
    "Gate": v.gate,
    "Nature": v.nature,
    "Group Visit": v.isGroup ? `Yes (${v.groupSize})` : "No",
    "Needs Help": v.isDisabled ? "Yes" : "No",
    "Underage": v.isUnderage ? "Yes" : "No",
    "Check In": format(new Date(v.createdAt), "dd/MM/yyyy HH:mm"),
    "Check Out": v.timeOut
      ? format(new Date(v.timeOut), "dd/MM/yyyy HH:mm")
      : "Still Inside",
    "Recorded By": v.recordedBy?.username || "-",
    "Timed Out By": v.timedOutBy?.username || "-",
  }));

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.name}
          {row.isGroup && (
             <span title="Group Visit" className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold border border-purple-300">
               Grp: {row.groupSize}
             </span>
          )}
          {row.isDisabled && (
             <span title="Needs Assistance" className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
               Asst
             </span>
          )}
          {row.isUnderage && (
            <span
              title="Underage Visitor"
              className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold border border-yellow-300 flex items-center gap-1"
            >
              <Baby size={14} />
            </span>
          )}
        </div>
      ),
    },
    { name: "ID Number", selector: (row) => maskIdNumber(row.idNumber), sortable: true },
    { name: "Phone", selector: (row) => row.phone, sortable: true },
    {
      name: "Vehicle Reg",
      selector: (row) => row.vehicleReg || "-",
      sortable: true,
    },
    { name: "Department", selector: (row) => row.department, sortable: true },
    { name: "Gate", selector: (row) => row.gate, sortable: true },
    { name: "Nature", selector: (row) => row.nature, sortable: true },
    {
      name: "Check In",
      selector: (row) => format(new Date(row.createdAt), "dd/MM/yyyy HH:mm"),
      sortable: true,
    },
    {
      name: "Check Out",
      selector: (row) =>
        row.timeOut
          ? format(new Date(row.timeOut), "dd/MM/yyyy HH:mm")
          : "Still Inside",
      sortable: true,
    },
    {
      name: "Recorded By",
      selector: (row) => row.recordedBy?.username || "-",
      sortable: true,
    },
    {
      name: "Timed Out By",
      selector: (row) => row.timedOutBy?.username || "-",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          {/* <button
            className="text-blue-600 hover:text-blue-800"
            onClick={() => alert("Edit visitor coming soon")}
          >
            <Edit size={18} />
          </button> */}
          <button
            className="text-red-600 hover:text-red-800"
            onClick={() => handleDelete(row._id)}
          >
            <Trash size={18} />
          </button>
        </div>
      ),
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
    <div className="min-h-screen text-slate-800 font-sans pb-10">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Visitor Records
              </h1>
              <p className="text-sm text-slate-500 font-medium tracking-wide mt-1">
                Total Entries:{" "}
                <span className="font-bold text-slate-700">
                  {filteredVisitors.length}
                </span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <CSVLink
              data={filteredExportData}
              filename={"visitors.csv"}
              className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium px-4 py-2.5 rounded-xl transition-all border border-emerald-200"
            >
              <Download size={16} /> CSV
            </CSVLink>
            <button
              onClick={handlePDFExport}
              className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium px-4 py-2.5 rounded-xl transition-all border border-indigo-200"
            >
              <Download size={16} /> PDF Report
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-panel p-5 md:p-6 rounded-3xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              placeholder="Search by name..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
          <select
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
            value={filterGate}
            onChange={(e) => {
              setFilterGate(e.target.value);
              setDepartment(""); // Reset department when gate changes
            }}
          >
            <option value="">All Gates</option>
            {gates.map((g) => (
              <option key={g._id} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>
          <select
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            {filteredDepartments.map((d) => (
              <option key={d._id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
          <div className="flex flex-col justify-center">
            <label className="text-xs text-slate-500 mb-1 font-medium">
              From Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, from: e.target.value }))
              }
            />
          </div>
          <div className="flex flex-col justify-center">
            <label className="text-xs text-slate-500 mb-1 font-medium">
              To Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, to: e.target.value }))
              }
            />
          </div>
          <div className="flex items-center justify-center">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${todayOnly ? "bg-blue-600 border-blue-600 text-white" : "bg-slate-50 border-slate-300 group-hover:bg-slate-100"}`}
              >
                {todayOnly && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="w-3 h-3"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
              <input
               type="checkbox"
                className="hidden"
                checked={todayOnly}
                onChange={() => setTodayOnly(!todayOnly)}
              />
              <span className="text-sm font-medium text-slate-700 select-none">
                Today
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group ml-4">
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${overstayedOnly ? "bg-red-600 border-red-600 text-white" : "bg-slate-50 border-slate-300 group-hover:bg-slate-100"}`}
              >
                {overstayedOnly && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="w-3 h-3"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={overstayedOnly}
                onChange={() => setOverstayedOnly(!overstayedOnly)}
              />
              <span className="text-sm font-medium text-slate-700 select-none">
                Overstayed
              </span>
            </label>
          </div>
        </div>

        {/* Table */}
        <div className="glass-panel rounded-3xl overflow-hidden p-2 sm:p-4">
          <DataTable
            columns={columns}
            data={filteredVisitors}
            pagination
            highlightOnHover
            striped
            responsive
            persistTableHead
            customStyles={customStyles}
          />
        </div>
      </div>
    </div>
  );
};

export default VisitorsDetails;
