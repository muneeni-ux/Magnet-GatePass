import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  CheckCircle,
  Clipboard,
  FileText,
  ShieldAlert,
  Building2,
  Send
} from "lucide-react";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Occurrence = () => {
  const [form, setForm] = useState({
    gate: "",
    endTime: "",
    unusualOccurrence: "No",
    unusualDescription: "",
    remarks: "",
    submittedBy: JSON.parse(localStorage.getItem("user"))?.id || null,
  });

  const [loading, setLoading] = useState(false);
  const [gates, setGates] = useState([]);

  useEffect(() => {
    const fetchGates = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/api/locations/gates`);
        setGates(response.data);
      } catch (err) {
        toast.error("Failed to load gates from server.");
      }
    };
    fetchGates();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.submittedBy) return toast.error("Please log in to submit a report.");
    if (!form.gate) return toast.error("Please select a Gate Location.");
    if (!form.endTime) return toast.error("Please select a Shift End Time.");
    if (form.unusualOccurrence === "Yes" && !form.unusualDescription.trim()) {
      return toast.error("Please provide a description of the incident.");
    }

    try {
      setLoading(true);
      const res = await fetch(`${SERVER_URL}/api/occurrences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to submit report");

      toast.success("Incident Report submitted successfully!");
      setForm({
        gate: "",
        endTime: "",
        unusualOccurrence: "No",
        unusualDescription: "",
        remarks: "",
        submittedBy: form.submittedBy,
      });
    } catch (err) {
      toast.error(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const InputLabel = ({ children, required }) => (
    <label className="block text-xs uppercase font-extrabold tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 font-mono">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] font-sans text-slate-800 dark:text-slate-100 px-3 sm:px-6 md:px-8 pt-20 md:pt-24 pb-28 md:pb-12 flex justify-center items-start relative cyber-grid overflow-hidden w-full max-w-full">
      
      {/* Background Ambient Orbs (Contained) */}
      <div className="hidden sm:block absolute top-1/4 right-0 w-[400px] h-[400px] bg-amber-500/10 dark:bg-orange-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
      <div className="hidden sm:block absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-red-500/10 dark:bg-rose-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse delay-700"></div>

      <div className="w-full max-w-5xl relative z-10 animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-orange-500/10 dark:to-red-500/10 rounded-2xl border border-amber-500/20 dark:border-orange-500/20 shadow-sm shrink-0">
              <Clipboard className="h-6 w-6 sm:h-7 sm:w-7 text-amber-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                 INCIDENT & <span className="text-amber-600 dark:text-orange-400">SHIFT REPORT</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Report shift activities, events, and security notes
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm self-start sm:self-auto">
            <span className="w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse"></span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-mono">
              Live System
            </span>
          </div>
        </div>

        {/* Unified 1-Page Form Layout */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6 w-full">
          
          {/* Main Input Sections */}
          <div className="lg:col-span-2 space-y-5 md:space-y-6 w-full">
            
            {/* Card 1: Shift & Gate Details */}
            <div className="glass-panel dark:glass-panel-dark bg-white/80 dark:bg-slate-900/80 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-white/80 dark:border-slate-800 shadow-lg backdrop-blur-md w-full">
              <div className="flex items-center gap-3 pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-slate-200/80 dark:border-slate-800">
                <Building2 className="h-5 w-5 text-amber-600 dark:text-orange-400 shrink-0" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Shift & Gate Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <InputLabel required>Gate Location</InputLabel>
                  <select
                    name="gate"
                    value={form.gate}
                    onChange={handleChange}
                    required
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-3 rounded-xl focus:outline-none focus:border-amber-500 dark:focus:border-orange-500 text-sm shadow-inner transition-all cursor-pointer font-mono"
                  >
                    <option value="" disabled>Select Gate Location</option>
                    {gates.map((g) => (
                      <option key={g._id} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <InputLabel required>Shift End Time</InputLabel>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                    required
                    max={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-3 rounded-xl focus:outline-none focus:border-amber-500 dark:focus:border-orange-500 text-sm font-mono shadow-inner transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Incident Assessment */}
            <div className="glass-panel dark:glass-panel-dark bg-white/80 dark:bg-slate-900/80 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-white/80 dark:border-slate-800 shadow-lg backdrop-blur-md w-full">
              <div className="flex items-center gap-3 pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-slate-200/80 dark:border-slate-800">
                <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-orange-400 shrink-0" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Incident Assessment
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
                <label
                  className={`cursor-pointer p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border flex items-center gap-3 transition-all ${form.unusualOccurrence === "No" ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold" : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-emerald-500/30"}`}
                >
                  <input
                    type="radio"
                    name="unusualOccurrence"
                    value="No"
                    checked={form.unusualOccurrence === "No"}
                    onChange={handleChange}
                    className="w-4 h-4 text-emerald-500 focus:ring-emerald-500"
                  />
                  <CheckCircle size={20} className={form.unusualOccurrence === "No" ? "text-emerald-500 shrink-0" : "text-slate-400 shrink-0"} />
                  <div>
                    <span className="text-xs font-bold block">No Incidents</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Normal shift operations</span>
                  </div>
                </label>

                <label
                  className={`cursor-pointer p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border flex items-center gap-3 transition-all ${form.unusualOccurrence === "Yes" ? "bg-red-500/10 border-red-500 text-red-600 dark:text-red-400 shadow-sm font-bold" : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-red-500/30"}`}
                >
                  <input
                    type="radio"
                    name="unusualOccurrence"
                    value="Yes"
                    checked={form.unusualOccurrence === "Yes"}
                    onChange={handleChange}
                    className="w-4 h-4 text-red-500 focus:ring-red-500"
                  />
                  <ShieldAlert size={20} className={form.unusualOccurrence === "Yes" ? "text-red-500 animate-pulse shrink-0" : "text-slate-400 shrink-0"} />
                  <div>
                    <span className="text-xs font-bold block">Incident Occurred</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Report event details</span>
                  </div>
                </label>
              </div>

              {form.unusualOccurrence === "Yes" && (
                <div className="mt-4 animate-in slide-in-from-top-2">
                  <InputLabel required>Incident Description</InputLabel>
                  <textarea
                    name="unusualDescription"
                    value={form.unusualDescription}
                    onChange={handleChange}
                    required={form.unusualOccurrence === "Yes"}
                    rows={4}
                    className="w-full bg-red-500/5 dark:bg-slate-950 border border-red-500/30 text-slate-900 dark:text-white p-3 rounded-xl focus:outline-none focus:border-red-500 text-sm shadow-inner placeholder-slate-400 font-sans"
                    placeholder="Describe what happened in detail..."
                  />
                </div>
              )}
            </div>

            {/* Card 3: Additional Notes */}
            <div className="glass-panel dark:glass-panel-dark bg-white/80 dark:bg-slate-900/80 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-white/80 dark:border-slate-800 shadow-lg backdrop-blur-md w-full">
              <div className="flex items-center gap-3 pb-3 sm:pb-4 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                <FileText className="h-5 w-5 text-amber-600 dark:text-orange-400 shrink-0" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Handover Notes & Remarks
                </h2>
              </div>

              <div>
                <InputLabel>General Remarks / Comments (Optional)</InputLabel>
                <textarea
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-3 rounded-xl focus:outline-none focus:border-amber-500 dark:focus:border-orange-500 text-sm shadow-inner placeholder-slate-400 font-sans"
                  placeholder="Enter general shift notes, handover comments, or additional details..."
                />
              </div>
            </div>

          </div>

          {/* Right Column / Summary & Submit Card */}
          <div className="space-y-6 w-full">
            <div className="glass-panel dark:glass-panel-dark bg-white/90 dark:bg-slate-900/90 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-white/80 dark:border-slate-800 shadow-xl backdrop-blur-md lg:sticky lg:top-24 w-full">
              
              <div className="flex items-center gap-3 pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-slate-200/80 dark:border-slate-800">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Report Summary
                </h2>
              </div>

              <div className="space-y-3 sm:space-y-4 text-xs font-mono mb-6 sm:mb-8">
                
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Gate Location</span>
                  <span className="text-slate-900 dark:text-white font-extrabold text-sm block truncate mt-0.5">
                    {form.gate || <span className="text-slate-400 italic font-sans text-xs">Select gate location</span>}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Shift End Time</span>
                  <span className="text-slate-900 dark:text-white font-bold block truncate mt-0.5">
                    {form.endTime ? new Date(form.endTime).toLocaleString() : <span className="text-slate-400 italic font-sans text-xs">Select shift end time</span>}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Incident Status</span>
                  <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase ${form.unusualOccurrence === "Yes" ? "bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400" : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"}`}>
                    {form.unusualOccurrence === "Yes" ? "Incident Reported" : "No Incidents"}
                  </span>
                </div>

              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 py-3.5 sm:py-4 px-6 rounded-2xl font-bold uppercase tracking-wider text-xs sm:text-sm transition-all shadow-lg border border-transparent ${
                  loading
                    ? "bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-amber-500/20 hover:shadow-xl hover:-translate-y-0.5"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>

            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Occurrence;
