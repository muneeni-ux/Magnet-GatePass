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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import format from "date-fns/format";
import isWithinInterval from "date-fns/isWithinInterval";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

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

  const handleExcelExport = () => {
    const ws = XLSX.utils.json_to_sheet(filteredExportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Visitor Summary");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      "visitors.xlsx",
    );
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

  const filteredExportData = filteredVisitors.map(
    ({ _id, __v, createdAt, updatedAt, timeOut, ...rest }) => ({
      ...rest,
      "Check In": format(new Date(createdAt), "dd/MM/yyyy HH:mm"),
      "Check Out": timeOut
        ? format(new Date(timeOut), "dd/MM/yyyy HH:mm")
        : "Still Inside",
    }),
  );

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.name}
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
    { name: "ID Number", selector: (row) => row.idNumber, sortable: true },
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
          <button
            className="text-blue-600 hover:text-blue-800"
            onClick={() => alert("Edit visitor coming soon")}
          >
            <Edit size={18} />
          </button>
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

  const handlePrint = () => {
    const theadTh = `
      <th>Name</th><th>ID No</th><th>Phone</th>
      <th>Vehicle</th><th>Department</th><th>Gate</th><th>Nature</th>
      <th>Time In</th><th>Time Out</th>
    `;

    const rowsHtml = filteredVisitors
      .map(
        (v) => `<tr>
          <td>${v.name}</td>
          <td>${v.idNumber}</td>
          <td>${v.phone}</td>
          <td>${v.vehicleReg || "-"}</td>
          <td>${v.department}</td>
          <td>${v.gate}</td>
          <td>${v.nature}</td>
          <td>${format(new Date(v.createdAt), "dd/MM/yyyy HH:mm")}</td>
          <td>${v.timeOut ? format(new Date(v.timeOut), "dd/MM/yyyy HH:mm") : "—"}</td>
        </tr>`,
      )
      .join("");

    const todayString = format(new Date(), "dd MMM yyyy");

    const html = `
      <html>
        <head>
          <title>Visitor Summary Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color:#333; }
            .logo { width:80px;height:80px;object-fit:cover;display:block;margin:0 auto 10px; }
            h1 { text-align:center;margin:5px 0 25px 0;font-size:22px; }
            .date { text-align:right;font-size:12px;margin-bottom:10px;color:#666; }
            table { width:100%;border-collapse:collapse;font-size:12px;margin-top:10px; }
            th,td { border:1px solid #aaa;padding:5px 8px;text-align:left; }
            th { background:#f0f0f0; }
            .signature { margin-top:40px;display:flex;justify-content:space-between;font-size:12px; }
            .footer { margin-top:30px;text-align:center;font-size:11px;color:#777; }
          </style>
        </head>
        <body>
          <img src="./magnetlogo.jpg" class="logo" />
          <h1>Nambale Magnet School Visitor Report</h1>
          <div class="date">Generated: ${todayString}</div>
          <table>
            <thead><tr>${theadTh}</tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <div class="signature">
            <div>Prepared by: ______________________</div>
            <div>Approved by: ______________________</div>
          </div>
          <div class="footer">
            Generated by Nambale Magnet School Visitor Pass System
          </div>
        </body>
      </html>
    `;

    const w = window.open("", "_blank");
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.onload = () => {
      w.focus();
      w.print();
    };
  };

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#f8fafc",
        color: "#64748b",
        fontWeight: "600",
        textTransform: "uppercase",
        fontSize: "0.75rem",
        letterSpacing: "0.05em",
        borderBottom: "1px solid #f1f5f9",
      },
    },
    rows: {
      style: {
        fontSize: "0.875rem",
        color: "#334155",
        backgroundColor: "#ffffff",
        "&:hover": {
          backgroundColor: "#f8fafc",
        },
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid #f1f5f9",
      },
    },
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
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
              onClick={handleExcelExport}
              className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium px-4 py-2.5 rounded-xl transition-all border border-indigo-200"
            >
              <Download size={16} /> Excel
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2.5 rounded-xl transition-all border border-slate-200"
            >
              <Printer size={16} /> Print
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-2">
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
