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
    <div className="min-h-screen text-slate-800 font-sans pb-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-5 glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl shadow-lg relative z-10 w-fit">
            <MessageCircleDashed className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Manage FAQs
            </h1>
            <p className="text-slate-500 text-sm md:text-base mt-1 font-medium">
              Add, update, and organize frequently asked questions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section (Left Column) */}
          <div className="lg:col-span-1 space-y-8">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden sticky top-28 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <span className="p-2 bg-blue-100/50 text-blue-600 rounded-lg"><PlusCircle size={18} /></span>
                {editId ? "Edit Question" : "New Question"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase text-[11px]">
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
                    className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm shadow-inner"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase text-[11px]">
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
                    className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm resize-none shadow-inner"
                    required
                  />
                </div>

                <label className="flex items-center gap-3 p-4 bg-white/40 rounded-xl border border-white/60 cursor-pointer hover:bg-white/70 transition-all duration-300 shadow-sm">
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

                <div className="pt-4 flex flex-col gap-3">
                  <button
                    type="submit"
                    className="w-full px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
                  >
                    {editId ? "Update FAQ" : "Save FAQ"}
                  </button>
                  {editId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="w-full px-6 py-3 bg-white/50 border border-white/60 hover:bg-white/80 text-slate-600 font-bold rounded-xl text-sm transition-all backdrop-blur-md"
                    >
                      Cancel Editing
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* List Section (Right Column) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-white/60">
              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-5 mb-8">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search questions or answers..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm shadow-inner"
                  />
                </div>
                <div className="relative w-full sm:w-56 shrink-0">
                  <Filter
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm appearance-none shadow-inner cursor-pointer"
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
                <div className="flex justify-center items-center py-24">
                  <CircularProgress size={30} sx={{ color: "#4F46E5" }} />
                </div>
              ) : paginatedFaqs.length === 0 ? (
                <div className="text-center py-20 bg-white/40 border border-white/60 rounded-2xl backdrop-blur-md">
                  <MessageCircleDashed
                    size={48}
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
                        className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 ${
                          isSelected
                            ? "bg-blue-50/60 border-blue-300/80 ring-2 ring-blue-300 shadow-[0_8px_30px_rgba(59,130,246,0.1)] backdrop-blur-md"
                            : "bg-white/40 border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:bg-white/70 hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] backdrop-blur-sm"
                        }`}
                      >
                        <div className="flex gap-4 sm:gap-5 items-start">
                          <label className="mt-1.5 cursor-pointer flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(faq._id)}
                              className="w-4.5 h-4.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                            />
                          </label>
                          <div className="flex-1 w-full relative">
                            <h3 className="font-extrabold text-slate-800 text-base md:text-lg leading-snug pr-16" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                              {faq.question}
                              <div className="absolute top-0 right-0 flex gap-2">
                                <button
                                  onClick={() => handleEdit(faq)}
                                  className="text-slate-400 hover:text-blue-600 transition-colors p-1.5 bg-white/50 hover:bg-white rounded-lg shadow-sm"
                                  title="Edit"
                                >
                                  <PencilLine size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(faq._id)}
                                  className="text-slate-400 hover:text-red-500 transition-colors p-1.5 bg-white/50 hover:bg-red-50 rounded-lg shadow-sm"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </h3>
                            <p className="text-slate-600 mt-3 text-sm md:text-base leading-relaxed font-medium">
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
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/60">
                  <span className="text-sm font-bold text-slate-500">
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
