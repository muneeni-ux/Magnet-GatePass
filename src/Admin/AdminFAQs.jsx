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
  MessageCircleDashed,
  Search,
  Filter,
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
        selectedIds.map((id) => axios.delete(`${SERVER_URL}/api/faq/${id}`)),
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
    page * ITEMS_PER_PAGE,
  );

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <MessageCircleDashed className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Manage FAQs
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Add, update, and organize frequently asked questions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section (Left Column) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
              <h2 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2">
                <PlusCircle className="text-blue-500" />
                {editId ? "Edit Question" : "New Question"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Question Text
                  </label>
                  <input
                    type="text"
                    name="question"
                    value={form.question}
                    onChange={(e) =>
                      setForm({ ...form, question: e.target.value })
                    }
                    placeholder="e.g. How do I reset my password?"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Detailed Answer
                  </label>
                  <textarea
                    name="answer"
                    value={form.answer}
                    onChange={(e) =>
                      setForm({ ...form, answer: e.target.value })
                    }
                    placeholder="Provide a clear, helpful answer..."
                    rows="5"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm resize-none"
                    required
                  />
                </div>

                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center ${form.isVerified ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300"}`}
                  >
                    {form.isVerified && (
                      <CheckCircle2 size={14} className="text-white" />
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={form.isVerified}
                    onChange={(e) =>
                      setForm({ ...form, isVerified: e.target.checked })
                    }
                    className="hidden"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700">
                      Publish Immediately
                    </span>
                    <span className="text-xs text-slate-500">
                      Mark as verified and visible
                    </span>
                  </div>
                </label>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    className="w-full px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-all shadow-sm"
                  >
                    {editId ? "Update FAQ" : "Save FAQ"}
                  </button>
                  {editId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="w-full px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium rounded-lg text-sm transition-all"
                    >
                      Cancel Editing
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* List Section (Right Column) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search questions or answers..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  />
                </div>
                <div className="relative w-full sm:w-48 shrink-0">
                  <Filter
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm appearance-none"
                  >
                    <option value="all">All Status</option>
                    <option value="verified">Verified Only</option>
                    <option value="unverified">Drafts / Unverified</option>
                  </select>
                </div>
              </div>

              {/* Bulk Delete */}
              {selectedIds.length > 0 && (
                <div className="mb-4 bg-red-50 p-3 flex items-center justify-between rounded-lg border border-red-100">
                  <span className="text-sm text-red-800 font-medium">
                    {selectedIds.length} item(s) selected
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-md hover:bg-red-50 text-sm font-medium transition-colors"
                  >
                    <Trash2 size={14} /> Delete Selected
                  </button>
                </div>
              )}

              {/* FAQ List */}
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <CircularProgress size={30} sx={{ color: "#3B82F6" }} />
                </div>
              ) : paginatedFaqs.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <MessageCircleDashed
                    size={40}
                    className="mx-auto text-slate-300 mb-3"
                  />
                  <p className="text-slate-500 font-medium">
                    No FAQs found matching your criteria.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedFaqs.map((faq) => {
                    const isSelected = selectedIds.includes(faq._id);
                    return (
                      <div
                        key={faq._id}
                        className={`p-5 rounded-xl border transition-all ${
                          isSelected
                            ? "bg-blue-50/40 border-blue-300 ring-1 ring-blue-300 shadow-sm"
                            : "bg-white border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:border-blue-200"
                        }`}
                      >
                        <div className="flex gap-4 items-start">
                          <label className="mt-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(faq._id)}
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                            />
                          </label>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-800 text-base leading-snug pr-12 relative">
                              {faq.question}
                              <div className="absolute top-0 right-0 flex gap-2">
                                <button
                                  onClick={() => handleEdit(faq)}
                                  className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                                  title="Edit"
                                >
                                  <PencilLine size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(faq._id)}
                                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </h3>
                            <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                              {faq.answer}
                            </p>
                            <div className="mt-4 flex items-center gap-2">
                              {faq.isVerified ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 size={12} /> Published
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                  <XCircle size={12} /> Draft
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
                  <span className="text-sm font-medium text-slate-500">
                    Showing {(page - 1) * ITEMS_PER_PAGE + 1} to{" "}
                    {Math.min(page * ITEMS_PER_PAGE, filteredFaqs.length)} of{" "}
                    {filteredFaqs.length} entries
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() =>
                        setPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={page === totalPages}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFAQs;
