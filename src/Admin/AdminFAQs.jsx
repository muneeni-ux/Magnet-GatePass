import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Trash2,
  PencilLine,
  PlusCircle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const ITEMS_PER_PAGE = 5;

const AdminFAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [form, setForm] = useState({
    question: "",
    answer: "",
    isVerified: true,
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchFAQs = async () => {
    try {
      const { data } = await axios.get(`${SERVER_URL}/api/faq`);
      setFaqs(data);
    } catch {
      toast.error("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${SERVER_URL}/api/faq/${editId}`, form);
        toast.success("FAQ updated");
      } else {
        await axios.post(`${SERVER_URL}/api/faq`, form);
        toast.success("FAQ added");
      }
      resetForm();
      fetchFAQs();
    } catch {
      toast.error("Error saving FAQ");
    }
  };

  const handleEdit = (faq) => {
    setForm(faq);
    setEditId(faq._id);
  };

  const resetForm = () => {
    setForm({ question: "", answer: "", isVerified: true });
    setEditId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this FAQ?")) return;
    try {
      await axios.delete(`${SERVER_URL}/api/faq/${id}`);
      fetchFAQs();
    } catch {
      toast.error("Error deleting FAQ");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected FAQ(s)?`))
      return;
    try {
      await Promise.all(
        selectedIds.map((id) => axios.delete(`${SERVER_URL}/api/faq/${id}`))
      );
      fetchFAQs();
      setSelectedIds([]);
    } catch {
      toast.error("Bulk delete failed");
    }
  };

  const filteredFaqs = faqs.filter((faq) => {
    const matchesQuery = faq.question
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "verified" && faq.isVerified) ||
      (filter === "unverified" && !faq.isVerified);
    return matchesQuery && matchesFilter;
  });

  const totalPages = Math.ceil(filteredFaqs.length / ITEMS_PER_PAGE);
  const paginatedFaqs = filteredFaqs.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">💬 Admin FAQs</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-50 p-4 rounded-md mb-8 space-y-4 border"
      >
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <PlusCircle size={18} />
          {editId ? "Edit FAQ" : "Add New FAQ"}
        </h2>

        <input
          type="text"
          name="question"
          value={form.question}
          onChange={(e) => setForm({ ...form, question: e.target.value })}
          placeholder="Question"
          className="w-full border rounded px-3 py-2"
          required
        />

        <textarea
          name="answer"
          value={form.answer}
          onChange={(e) => setForm({ ...form, answer: e.target.value })}
          placeholder="Answer"
          rows="4"
          className="w-full border rounded px-3 py-2"
          required
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isVerified}
            onChange={(e) => setForm({ ...form, isVerified: e.target.checked })}
          />
          Verified
        </label>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {editId ? "Update FAQ" : "Add FAQ"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm underline text-gray-500"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 items-center justify-between">
        <input
          type="text"
          placeholder="Search FAQs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full md:w-1/2 border px-3 py-2 rounded"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="all">All</option>
          <option value="verified">Verified</option>
          <option value="unverified">Not Verified</option>
        </select>
      </div>

      {/* Bulk Delete */}
      {selectedIds.length > 0 && (
        <button
          onClick={handleBulkDelete}
          className="mb-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Delete {selectedIds.length} selected
        </button>
      )}

      {/* FAQ List */}
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <CircularProgress size={40} sx={{ color: "black" }} />
        </div>
      ) : paginatedFaqs.length === 0 ? (
        <p>No FAQs found.</p>
      ) : (
        <div className="space-y-4">
          {paginatedFaqs.map((faq) => (
            <div
              key={faq._id}
              className={`border p-4 rounded-md bg-gray-50 shadow-sm ${
                selectedIds.includes(faq._id)
                  ? "bg-yellow-50 border-yellow-400"
                  : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(faq._id)}
                      onChange={() => toggleSelect(faq._id)}
                    />
                    <h3 className="font-semibold text-lg">{faq.question}</h3>
                  </label>
                  <p className="text-gray-700 mt-1">{faq.answer}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Status:{" "}
                    {faq.isVerified ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 size={14} /> Verified
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">
                        <XCircle size={14} /> Not Verified
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(faq)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <PencilLine size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(faq._id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminFAQs;
