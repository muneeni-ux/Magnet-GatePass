import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

// const calculateDuration = (start, end) => {
//   if (!start || !end) return null;

//   const ms = new Date(end) - new Date(start);
//   const minutes = Math.floor(ms / 60000);
//   const hours = Math.floor(minutes / 60);
//   const remainingMinutes = minutes % 60;

//   return `${hours}h ${remainingMinutes}m`;
// };
// Utility to convert data to CSV and trigger download
// const exportToCSV = (data) => {
//   const csvRows = [
//     ["Name", "Department", "Purpose", "Time In", "Time Out", "Duration"],
//     ...data.map((v) => {
//       const timeIn = new Date(v.createdAt);
//       const timeOut = v.timeOut ? new Date(v.timeOut) : null;
//       const duration =
//         v.duration || (v.timeOut ? calculateDuration(timeIn, timeOut) : "—");

//       return [
//         v.name,
//         v.department,
//         v.purpose,
//         timeIn.toLocaleString(),
//         timeOut ? timeOut.toLocaleString() : "—",
//         duration,
//       ];
//     }),
//   ];

//   const csvContent = csvRows.map((e) => e.join(",")).join("\n");
//   const blob = new Blob([csvContent], { type: "text/csv" });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = "visitor_history.csv";
//   a.click();
//   URL.revokeObjectURL(url);
// };

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export default function VisitorHistory() {
  const [visitors, setVisitors] = useState([]);
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all"); // all | active | completed

  const fetchVisitors = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/visitors`);
      const data = await res.json();
      setVisitors(data);
    } catch (error) {
      // console.error("Failed to fetch visitors", error);
      toast.error("Error loading visitors");
    }
  };

  const handleTimeOut = async (id) => {
    try {
      const res = await fetch(
        `${SERVER_URL}/api/visitors/visitors/${id}/timeout`,
        {
          method: "PUT",
        }
      );
      if (!res.ok) throw new Error("Failed to update time out");
      toast.success("Time out recorded!");
      fetchVisitors();
    } catch (error) {
      // console.error("Time out failed", error);
      toast.error("Could not record time out");
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const today = new Date();

  const filteredVisitors = visitors
    .filter((v) => {
      if (!showTodayOnly) return true;
      const date = new Date(v.createdAt);
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
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
    <div className="p-4 md:p-6 max-w-7xl mx-auto mt-16 md:mt-24 bg-white shadow-md rounded-xl">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold text-indigo-800">
          📋 Visitor History
        </h2>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Search name or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md focus:ring focus:ring-indigo-300"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <button
            onClick={() => setShowTodayOnly((prev) => !prev)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            {showTodayOnly ? "Show All Dates" : "Today Only"}
          </button>
          <button
            onClick={() => setSortAsc((prev) => !prev)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Sort {sortAsc ? "↑" : "↓"}
          </button>
          {/* <button
            onClick={() => exportToCSV(filteredVisitors)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Export CSV
          </button> */}
        </div>
      </div>

      <div className="text-gray-700 mb-3 font-medium">
        Showing {filteredVisitors.length} {showTodayOnly ? "today's" : ""}{" "}
        visitor
        {filteredVisitors.length !== 1 && "s"} (
        {filterStatus === "active"
          ? "active"
          : filterStatus === "completed"
          ? "completed"
          : "all"}
        )
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full bg-white text-sm md:text-base">
          {/* <thead className="bg-indigo-100 text-indigo-800">
            <tr>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Department</th>
              <th className="p-3 border">Purpose</th>
              <th className="p-3 border">Time In</th>
              <th className="p-3 border">Time Out</th>

              <th className="p-3 border">Duration</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredVisitors.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-gray-500 p-6">
                  No matching visitors found.
                </td>
              </tr>
            ) : (
              filteredVisitors.map((visitor) => (
                <tr key={visitor._id} className="text-center hover:bg-gray-50">
                  <td className="p-3 border">{visitor.name}</td>
                  <td className="p-3 border">{visitor.department}</td>
                  <td className="p-3 border">{visitor.purpose}</td>
                  <td className="p-3 border">
                    {new Date(visitor.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 border">
                    {visitor.timeOut
                      ? new Date(visitor.timeOut).toLocaleString()
                      : "—"}
                  </td>
                  <td className="p-3 border">{visitor.duration || "—"}</td>

                  <td className="p-3 border">
                    {!visitor.timeOut && (
                      <button
                        onClick={() => handleTimeOut(visitor._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Time Out
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody> */}
          <thead className="bg-indigo-100 text-indigo-800">
  <tr>
    <th className="p-3 border">Name</th>
    <th className="p-3 border">Department</th>
    <th className="p-3 border">Gate</th>
    <th className="p-3 border">Nature</th>
    <th className="p-3 border">Time In</th>
    <th className="p-3 border">Time Out</th>
    <th className="p-3 border">Duration</th>
    <th className="p-3 border">Action</th>
  </tr>
</thead>

<tbody>
  {filteredVisitors.length === 0 ? (
    <tr>
      <td colSpan="9" className="text-center text-gray-500 p-6">
        No matching visitors found.
      </td>
    </tr>
  ) : (
    filteredVisitors.map((visitor) => (
      <tr key={visitor._id} className="text-center hover:bg-gray-50">
        <td className="p-3 border">{visitor.name}</td>
        <td className="p-3 border">{visitor.department}</td>
        <td className="p-3 border">{visitor.gate}</td>
        <td className="p-3 border">{visitor.nature}</td>
        <td className="p-3 border">{new Date(visitor.createdAt).toLocaleString()}</td>
        <td className="p-3 border">
          {visitor.timeOut ? new Date(visitor.timeOut).toLocaleString() : "—"}
        </td>
        <td className="p-3 border">{visitor.duration || "—"}</td>
        <td className="p-3 border">
          {!visitor.timeOut && (
            <button
              onClick={() => handleTimeOut(visitor._id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Time Out
            </button>
          )}
        </td>
      </tr>
    ))
  )}
</tbody>

        </table>
      </div>
    </div>
  );
}
