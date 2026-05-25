import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, Trash } from "lucide-react";
import { format } from "date-fns";
import { ClipLoader } from "react-spinners";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const gates = [ "Gate One", "Gate Two"];
const ITEMS_PER_PAGE = 10;

const AdminOccurrence = () => {
  const [occurrences, setOccurrences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterGate, setFilterGate] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOccurrences = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${SERVER_URL}/api/occurrences`);
      setOccurrences(res.data || []);
    } catch (error) {
      console.error("Failed to fetch occurrences:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOccurrences();
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

  // Pagination logic
  const totalPages = Math.ceil(filteredOccurrences.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredOccurrences.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

  return (
    <div className="p-6 max-w-7xl mx-auto text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100">All Occurrences</h1>

      {/* Filters + Search */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
          value={filterGate}
          onChange={(e) => setFilterGate(e.target.value)}
        >
          <option value="">All Gates</option>
          {gates.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <input
          type="date"
          className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors [color-scheme:light] dark:[color-scheme:dark]"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />

        <input
          type="text"
          placeholder="Search by gate, remarks, or user"
          className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <ClipLoader color="#8b5cf6" size={50} />
        </div>
      ) : currentItems.length === 0 ? (
        <p className="text-center text-slate-500 dark:text-slate-400">No occurrences found.</p>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-slate-900 shadow-md rounded border border-transparent dark:border-slate-700 transition-colors">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-slate-100 dark:bg-slate-800 text-xs uppercase text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-2">Gate</th>
                <th className="px-4 py-2">End Time</th>
                {/* <th className="px-4 py-2">Disarmed By</th>
                <th className="px-4 py-2">Disarm Time</th>
                <th className="px-4 py-2">Armed By</th>
                <th className="px-4 py-2">Arm Time</th> */}
                {/* <th className="px-4 py-2">Parking Open</th>
                <th className="px-4 py-2">Parking Close</th> */}
                {/* <th className="px-4 py-2">Premise</th>
                <th className="px-4 py-2">Phones With</th> */}
                <th className="px-4 py-2">Unusual?</th>
                <th className="px-4 py-2">Remarks</th>
                <th className="px-4 py-2">Submitted By</th>
                <th className="px-4 py-2">Submitted At</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((o) => (
                <tr key={o._id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-2">{o.gate || "—"}</td>
                  <td className="px-4 py-2">
                    {o.endTime ? format(new Date(o.endTime), "dd/MM/yyyy HH:mm") : "—"}
                  </td>
                  {/* <td className="px-4 py-2">{o.disarmedBy || "—"}</td>
                  <td className="px-4 py-2">{o.disarmTime || "—"}</td>
                  <td className="px-4 py-2">{o.armedBy || "—"}</td>
                  <td className="px-4 py-2">{o.armTime || "—"}</td> */}
                  {/* <td className="px-4 py-2">{o.parkingOpeningTime || "—"}</td>
                  <td className="px-4 py-2">{o.parkingClosingTime || "—"}</td> */}
                  {/* <td className="px-4 py-2">{o.premise || "—"}</td>
                  <td className="px-4 py-2">{o.phonesLeftWith || "—"}</td> */}
                  <td className="px-4 py-2">{o.unusualOccurrence || "—"}</td>
                  <td className="px-4 py-2">{o.remarks || "—"}</td>
                  <td className="px-4 py-2">{o.submittedBy?.username || "—"}</td>
                  <td className="px-4 py-2">
                    {o.submittedAt
                      ? format(new Date(o.submittedAt), "dd/MM/yyyy HH:mm")
                      : "—"}
                  </td>
                  <td className="px-4 py-2 flex items-center gap-2">
                    <button
                      onClick={() => alert("Edit coming soon")}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(o._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              className={`px-3 py-1 rounded transition-colors ${
                currentPage === idx + 1
                  ? "bg-purple-600 dark:bg-purple-500 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOccurrence;
