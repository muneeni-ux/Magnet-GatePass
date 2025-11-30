import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { CSVLink } from "react-csv";
import { Download, Printer, Search, Edit, Trash } from "lucide-react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import format from "date-fns/format";
import isWithinInterval from "date-fns/isWithinInterval";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const VisitorsDetails = () => {
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
    { name: "ID Number", selector: (row) => row.idNumber, sortable: true },
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-700">
          Visitor Records ({filteredVisitors.length} records)
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              className="border border-gray-300 rounded px-4 py-2 pl-10"
              placeholder="Search name"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <Search className="absolute left-2 top-2.5 text-gray-400 w-5 h-5" />
          </div>

          <select
            className="border px-3 py-2 rounded"
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

          <label className="text-sm">
            From:{" "}
            <input
              type="date"
              className="border rounded px-2 py-1"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, from: e.target.value }))
              }
            />
          </label>

          <label className="text-sm">
            To:{" "}
            <input
              type="date"
              className="border rounded px-2 py-1"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, to: e.target.value }))
              }
            />
          </label>

          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              className="mr-1"
              checked={todayOnly}
              onChange={() => setTodayOnly(!todayOnly)}
            />
            Today Only
          </label>

          <CSVLink
            data={filteredExportData}
            filename={"visitors.csv"}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded flex items-center gap-1"
          >
            <Download size={16} />
            CSV
          </CSVLink>

          <button
            onClick={handleExcelExport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded"
          >
            Export Excel
          </button>

          <button
            onClick={handlePrint}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded flex items-center gap-1"
          >
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredVisitors}
        pagination
        highlightOnHover
        striped
        responsive
        persistTableHead
      />
    </div>
  );
};

export default VisitorsDetails;
