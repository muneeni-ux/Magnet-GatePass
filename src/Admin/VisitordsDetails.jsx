import React, { useEffect, useState } from "react";
import DataTable, { createTheme } from "react-data-table-component";
import { useOutletContext } from "react-router-dom";
import { CSVLink } from "react-csv";
import { Download, Printer, Search, Edit, Trash } from "lucide-react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import format from "date-fns/format";
import isWithinInterval from "date-fns/isWithinInterval";

// Register custom dark theme for react-data-table-component
createTheme("dark", {
  text: {
    primary: "#f8fafc", // slate-50
    secondary: "#94a3b8", // slate-400
  },
  background: {
    default: "#0f172a", // slate-900
  },
  context: {
    background: "#2563eb", // blue-600
    text: "#ffffff",
  },
  divider: {
    default: "#1e293b", // slate-800
  },
  action: {
    button: "rgba(255, 255, 255, 0.54)",
    hover: "rgba(255, 255, 255, 0.08)",
    disabled: "rgba(255, 255, 255, 0.26)",
  },
}, "dark");

const customStyles = {
  header: {
    style: {
      minHeight: "56px",
    },
  },
  headRow: {
    style: {
      borderTopStyle: "solid",
      borderTopWidth: "1px",
      borderTopColor: "var(--border-main)",
      backgroundColor: "var(--bg-card)",
      transition: "background-color 0.3s ease",
    },
  },
  headCells: {
    style: {
      fontSize: "13px",
      fontWeight: "700",
      textTransform: "uppercase",
      color: "var(--text-muted)",
    },
  },
  rows: {
    style: {
      minHeight: "52px",
      backgroundColor: "var(--bg-card)",
      transition: "background-color 0.3s ease",
      "&:not(:last-of-type)": {
        borderBottomStyle: "solid",
        borderBottomWidth: "1px",
        borderBottomColor: "var(--border-main)",
      },
    },
  },
  pagination: {
    style: {
      backgroundColor: "var(--bg-card)",
      color: "var(--text-main)",
      borderTopStyle: "solid",
      borderTopWidth: "1px",
      borderTopColor: "var(--border-main)",
      transition: "background-color 0.3s ease, color 0.3s ease",
    },
    pageButtonsStyle: {
      fill: "var(--text-main)",
      "&:disabled": {
        fill: "var(--text-muted)",
      },
    },
  },
};

const maskIdNumber = (id) => {
  if (!id) return "-";
  const str = id.toString().trim();
  if (str.length <= 4) {
    if (str.length <= 2) return str;
    return str[0] + "*".repeat(str.length - 2) + str[str.length - 1];
  }
  return str.substring(0, 3) + "***" + str.substring(str.length - 2);
};

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const VisitorsDetails = () => {
  const { theme } = useOutletContext();
  const [visitors, setVisitors] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [todayOnly, setTodayOnly] = useState(false);
  const [department, setDepartment] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  useEffect(() => {
    axios
      .get(`${SERVER_URL}/api/visitors`)
      .then((res) => setVisitors(res.data))
      .catch((err) => console.error("Error fetching visitors:", err));
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
      "visitors.xlsx"
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

  const filterByDate = (visitor) => {
    if (!dateRange.from || !dateRange.to) return true;
    const created = new Date(visitor.createdAt);
    return isWithinInterval(created, {
      start: new Date(dateRange.from),
      end: new Date(dateRange.to),
    });
  };

  const filteredVisitors = visitors.filter((visitor) => {
    const nameMatch = visitor.name?.toLowerCase().includes(filterText.toLowerCase());
    const todayMatch = todayOnly ? isToday(visitor.createdAt) : true;
    const departmentMatch = department ? visitor.department === department : true;
    const dateMatch = filterByDate(visitor);

    return nameMatch && todayMatch && departmentMatch && dateMatch;
  });

  const filteredExportData = filteredVisitors.map(
    ({ _id, __v, createdAt, updatedAt, timeOut, ...rest }) => ({
      ...rest,
      "Check In": format(new Date(createdAt), "dd/MM/yyyy HH:mm"),
      "Check Out": timeOut
        ? format(new Date(timeOut), "dd/MM/yyyy HH:mm")
        : "Still Inside",
    })
  );

  const columns = [
    { name: "Name", selector: (row) => row.name, sortable: true },
    {
      name: "ID Number",
      selector: (row) => row.idNumber,
      cell: (row) => (
        <span title={row.idNumber} className="cursor-help font-mono font-bold tracking-wider text-slate-700 dark:text-slate-350">
          {maskIdNumber(row.idNumber)}
        </span>
      ),
      sortable: true,
    },
    { name: "Phone", selector: (row) => row.phone, sortable: true },
    { name: "Vehicle Reg", selector: (row) => row.vehicleReg || "-", sortable: true },
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
        row.timeOut ? format(new Date(row.timeOut), "dd/MM/yyyy HH:mm") : "Still Inside",
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
            className="text-red-650 hover:text-red-800"
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
          <td>${maskIdNumber(v.idNumber)}</td>
          <td>${v.phone}</td>
          <td>${v.vehicleReg || "-"}</td>
          <td>${v.department}</td>
          <td>${v.gate}</td>
          <td>${v.nature}</td>
          <td>${format(new Date(v.createdAt), "dd/MM/yyyy HH:mm")}</td>
          <td>${v.timeOut ? format(new Date(v.timeOut), "dd/MM/yyyy HH:mm") : "—"}</td>
        </tr>`
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

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">
          Visitor Records ({filteredVisitors.length} records)
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Search name"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <Search className="absolute left-2 top-2.5 text-slate-400 w-5 h-5" />
          </div>

          <select
            className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            <option value="Dean of Students">Dean of Students</option>
            <option value="Head Teacher">Head Teacher</option>
            <option value="Farm">Farm</option>
            <option value="Finance">Finance</option>
            <option value="Social Worker">Social Worker</option>
            <option value="Directors Office">Directors Office</option>
          </select>

          <label className="text-sm text-slate-700 dark:text-slate-300">
            From:{" "}
            <input
              type="date"
              className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors [color-scheme:light] dark:[color-scheme:dark]"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, from: e.target.value }))
              }
            />
          </label>

          <label className="text-sm text-slate-700 dark:text-slate-300">
            To:{" "}
            <input
              type="date"
              className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors [color-scheme:light] dark:[color-scheme:dark]"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, to: e.target.value }))
              }
            />
          </label>

          <label className="flex items-center text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              className="mr-2 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              checked={todayOnly}
              onChange={() => setTodayOnly(!todayOnly)}
            />
            Today Only
          </label>

          <CSVLink
            data={filteredExportData}
            filename={"visitors.csv"}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded flex items-center gap-1 shadow-md transition-colors"
          >
            <Download size={16} />
            CSV
          </CSVLink>

          <button
            onClick={handleExcelExport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded shadow-md transition-colors"
          >
            Export Excel
          </button>

          <button
            onClick={handlePrint}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded flex items-center gap-1 shadow-md transition-colors"
          >
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg transition-all duration-300 bg-white dark:bg-slate-900">
        <DataTable
          columns={columns}
          data={filteredVisitors}
          pagination
          highlightOnHover
          striped
          responsive
          persistTableHead
          theme={theme}
          customStyles={customStyles}
        />
      </div>
    </div>
  );
};

export default VisitorsDetails;
