import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Clipboard,
  FileText,
  ShieldAlert,
  Server
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
  const [step, setStep] = useState(1);
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

  const handleNext = (nextStep) => {
    if (step === 1 && nextStep > 1) {
      if (!form.gate || !form.endTime) {
        return toast.error(
          "Please fill in Checkpoint and End Time before proceeding.",
        );
      }
    }
    if (step === 2 && nextStep > 2) {
      if (form.unusualOccurrence === "Yes" && !form.unusualDescription.trim()) {
        return toast.error("Please provide a description of the incident.");
      }
    }
    setStep(nextStep);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.submittedBy) return toast.error("Access Denied: Unregistered Entity.");

    try {
      setLoading(true);
      const res = await fetch(`${SERVER_URL}/api/occurrences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to commit log");

      toast.success("Incident Protocol Logged Successfully");
      setForm({
        gate: "",
        endTime: "",
        unusualOccurrence: "No",
        unusualDescription: "",
        remarks: "",
        submittedBy: form.submittedBy,
      });
      setStep(1);
    } catch (err) {
      toast.error(err.message || "Commit Failure");
    } finally {
      setLoading(false);
    }
  };

  const InputLabel = ({ children }) => (
    <label className="block text-[10px] uppercase font-extrabold tracking-widest text-slate-500 dark:text-slate-400 mb-2 font-mono">
      {children}
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] font-sans text-slate-800 dark:text-slate-100 p-4 md:p-8 pt-2 md:pt-[100px] flex items-center justify-center relative overflow-hidden cyber-grid selection:bg-blue-500/30 dark:selection:bg-emerald-500/30 md:mt-10">
      
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -right-32 w-[600px] h-[600px] bg-amber-500/10 dark:bg-orange-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 -left-32 w-[600px] h-[600px] bg-red-500/10 dark:bg-rose-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse delay-700"></div>

      <div className="w-full max-w-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500 mt-0 md:-mt-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-white/60 dark:border-slate-800/80 gap-4">
          <div className="flex items-center gap-5">
            <div className="p-3.5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-orange-500/10 dark:to-red-500/10 rounded-2xl border border-amber-500/20 dark:border-orange-500/20 shadow-inner group">
              <Clipboard className="h-7 w-7 text-amber-600 dark:text-orange-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                 OCCURRENCE <span className="text-amber-600 dark:text-orange-400">REPORT</span>
              </h1>
              <p className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono mt-1">
                Shift Activity & Incident Logging
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/50 dark:bg-slate-900/50 border border-white/60 dark:border-slate-800 shadow-inner self-start md:self-auto">
            <span className="w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse"></span>
            <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest font-mono">
              Live Link
            </span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-panel dark:glass-panel-dark border border-white/60 dark:border-slate-700/50 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] p-8 md:p-12 relative overflow-hidden backdrop-blur-md bg-white/40 dark:bg-[#0a0f1c]/60"
        >
          {/* Progress Indicators */}
          <div className="flex justify-between items-center mb-10 relative px-2">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/60 dark:bg-slate-800/80 -z-10 shadow-inner"></div>
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                onClick={() => (s < step ? setStep(s) : null)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-extrabold transition-all cursor-pointer font-mono ${
                  step >= s
                    ? "bg-gradient-to-br from-amber-500 to-orange-500 dark:from-orange-500 dark:to-red-500 text-white shadow-[0_4px_15px_rgba(245,158,11,0.3)] border border-transparent"
                    : "bg-white/50 dark:bg-slate-900/80 border border-white/60 dark:border-slate-700/60 text-slate-500 shadow-sm"
                }`}
              >
                {step > s ? <CheckCircle size={16} /> : s}
              </div>
            ))}
          </div>

          {/* Step 1: Gate and End Time */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-8 pb-4 border-b border-white/60 dark:border-slate-700/50">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <Server className="h-5 w-5 text-amber-600 dark:text-orange-400" /> Shift Parameters
                </h3>
              </div>

              <div className="space-y-2">
                <InputLabel>Reporting Checkpoint</InputLabel>
                <div className="relative">
                    <select
                    name="gate"
                    value={form.gate}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/50 dark:bg-[#0a0f1c]/60 border border-white/60 dark:border-slate-700/60 text-slate-900 dark:text-white p-3.5 rounded-xl focus:outline-none focus:border-amber-500 dark:focus:border-orange-500 focus:ring-1 focus:ring-amber-500 dark:focus:ring-orange-500 transition-all font-mono text-sm shadow-inner dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] appearance-none cursor-pointer"
                    >
                    <option className="bg-white dark:bg-slate-900" value="" disabled>
                        Select Sector
                    </option>
                    {gates.map((g) => (
                        <option className="bg-white dark:bg-slate-900" key={g._id} value={g.name}>
                        {g.name}
                        </option>
                    ))}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
              </div>

              <div className="space-y-2">
                <InputLabel>Shift Termination Time</InputLabel>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/50 dark:bg-[#0a0f1c]/60 border border-white/60 dark:border-slate-700/60 text-slate-900 dark:text-white p-3.5 rounded-xl focus:outline-none focus:border-amber-500 dark:focus:border-orange-500 focus:ring-1 focus:ring-amber-500 dark:focus:ring-orange-500 transition-all font-mono text-sm shadow-inner dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] placeholder-slate-400 dark:placeholder-slate-600"
                />
              </div>

              <div className="flex justify-end mt-10 pt-6 border-t border-white/60 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => handleNext(2)}
                  className="group flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 dark:from-orange-500 dark:to-red-500 hover:from-amber-400 hover:to-orange-400 dark:hover:from-orange-400 dark:hover:to-red-400 text-white px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all shadow-lg shadow-amber-500/20 dark:shadow-orange-500/20 hover:-translate-y-0.5 border border-transparent hover:border-white/20"
                >
                  Proceed{" "}
                  <ChevronRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Unusual Occurrence */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-8 pb-4 border-b border-white/60 dark:border-slate-700/50">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-orange-400" /> Incident Assessment
                </h3>
              </div>

              <div>
                <div className="grid grid-cols-2 gap-6">
                  <label
                    className={`cursor-pointer p-6 border rounded-2xl flex flex-col items-center justify-center gap-4 transition-all glass-panel dark:glass-panel-dark ${form.unusualOccurrence === "No" ? "bg-emerald-500/10 dark:bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 shadow-inner" : "border-white/60 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:border-emerald-500/30"}`}
                  >
                    <input
                      type="radio"
                      name="unusualOccurrence"
                      value="No"
                      checked={form.unusualOccurrence === "No"}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <CheckCircle size={28} className={form.unusualOccurrence === "No" ? "text-emerald-500" : ""} />
                    <span className="font-extrabold text-[11px] uppercase tracking-widest font-mono">No Incidents</span>
                  </label>
                  <label
                    className={`cursor-pointer p-6 border rounded-2xl flex flex-col items-center justify-center gap-4 transition-all glass-panel dark:glass-panel-dark ${form.unusualOccurrence === "Yes" ? "bg-red-500/10 dark:bg-rose-500/10 border-red-500/50 text-red-600 dark:text-red-400 shadow-inner" : "border-white/60 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:border-red-500/30"}`}
                  >
                    <input
                      type="radio"
                      name="unusualOccurrence"
                      value="Yes"
                      checked={form.unusualOccurrence === "Yes"}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <ShieldAlert size={28} className={form.unusualOccurrence === "Yes" ? "text-red-500 animate-pulse" : ""} />
                    <span className="font-extrabold text-[11px] uppercase tracking-widest font-mono">Incident</span>
                  </label>
                </div>
              </div>

              {form.unusualOccurrence === "Yes" && (
                <div className="animate-in slide-in-from-top-2 space-y-2">
                  <InputLabel>Full Incident Description</InputLabel>
                  <textarea
                    name="unusualDescription"
                    value={form.unusualDescription}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-red-500/5 dark:bg-[#0a0f1c]/60 border border-red-500/30 dark:border-red-500/30 text-slate-900 dark:text-white p-4 rounded-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-sm shadow-inner dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] placeholder-slate-400 dark:placeholder-slate-500"
                    placeholder="Provide a detailed log of the event..."
                  />
                </div>
              )}

              <div className="flex justify-between items-center mt-10 pt-6 border-t border-white/60 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => handleNext(1)}
                  className="text-[11px] uppercase tracking-widest font-extrabold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors px-4 py-2"
                >
                  Reverse
                </button>
                <button
                  type="button"
                  onClick={() => handleNext(3)}
                  className="group flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 dark:from-orange-500 dark:to-red-500 hover:from-amber-400 hover:to-orange-400 dark:hover:from-orange-400 dark:hover:to-red-400 text-white px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all shadow-lg shadow-amber-500/20 dark:shadow-orange-500/20 hover:-translate-y-0.5 border border-transparent hover:border-white/20"
                >
                  Proceed{" "}
                  <ChevronRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Remarks */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-8 pb-4 border-b border-white/60 dark:border-slate-700/50">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <FileText className="h-5 w-5 text-amber-600 dark:text-orange-400" /> Additional Notes
                </h3>
              </div>

              <div className="space-y-2">
                <InputLabel>General Handover Remarks</InputLabel>
                <textarea
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                  rows={6}
                  className="w-full bg-white/50 dark:bg-[#0a0f1c]/60 border border-white/60 dark:border-slate-700/60 text-slate-900 dark:text-white p-4 rounded-xl focus:outline-none focus:border-amber-500 dark:focus:border-orange-500 focus:ring-1 focus:ring-amber-500 dark:focus:ring-orange-500 transition-all font-mono text-sm shadow-inner dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] placeholder-slate-400 dark:placeholder-slate-600"
                  placeholder="Enter standard logs or comments..."
                />
              </div>

              <div className="flex justify-between items-center mt-10 pt-6 border-t border-white/60 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => handleNext(2)}
                  className="text-[11px] uppercase tracking-widest font-extrabold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors px-4 py-2"
                >
                  Reverse
                </button>
                <button
                  type="button"
                  onClick={() => handleNext(4)}
                  className="group flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 dark:from-orange-500 dark:to-red-500 hover:from-amber-400 hover:to-orange-400 dark:hover:from-orange-400 dark:hover:to-red-400 text-white px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all shadow-lg shadow-amber-500/20 dark:shadow-orange-500/20 hover:-translate-y-0.5 border border-transparent hover:border-white/20"
                >
                  Submit Log{" "}
                  <ChevronRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Submit */}
          {step === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6 pb-2 border-b border-white/60 dark:border-slate-700/50">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <AlertTriangle className="h-5 w-5 text-amber-500" /> Review Sequence
                </h3>
              </div>

              <div className="glass-panel dark:glass-panel-dark bg-white/40 dark:bg-slate-900/40 p-6 sm:p-8 rounded-[1.5rem] border border-white/60 dark:border-slate-700/50 relative overflow-hidden shadow-inner">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500 dark:from-orange-500 dark:to-red-500"></div>

                 <div className="grid grid-cols-1 gap-y-6 text-sm font-mono">
                   
                   <div className="flex justify-between items-center pb-4 border-b border-white/60 dark:border-slate-700/50">
                       <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-500 dark:text-slate-400">Node Origin</span>
                       <span className="font-bold text-slate-900 dark:text-white">{form.gate || "NOT SPECIFIED"}</span>
                   </div>

                   <div className="flex justify-between items-center pb-4 border-b border-white/60 dark:border-slate-700/50">
                       <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-500 dark:text-slate-400">Time Stamp</span>
                       <span className="font-bold text-slate-900 dark:text-white">{form.endTime ? new Date(form.endTime).toLocaleString() : "TBD"}</span>
                   </div>

                   <div className="flex justify-between items-center pb-4 border-b border-white/60 dark:border-slate-700/50">
                       <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-500 dark:text-slate-400">Anomaly State</span>
                       <span className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest border ${form.unusualOccurrence === "Yes" ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"}`}>
                           {form.unusualOccurrence === "Yes" ? "FLAGGED" : "NOMINAL"}
                       </span>
                   </div>

                    {form.unusualOccurrence === "Yes" && (
                        <div className="pt-2">
                           <span className="text-[10px] uppercase font-extrabold tracking-widest text-red-500 dark:text-red-400 block mb-2 font-mono">Incident Output:</span>
                           <p className="p-4 bg-red-500/5 border border-red-500/20 text-slate-700 dark:text-slate-300 rounded-lg text-xs leading-relaxed">
                               {form.unusualDescription}
                           </p>
                        </div>
                    )}
                 </div>
              </div>

              <div className="flex gap-4 mt-10 pt-6 border-t border-white/60 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => handleNext(3)}
                  className="px-6 py-3.5 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all shadow-sm"
                >
                  Alter
                </button>
                 <button
                      type="submit"
                      disabled={loading}
                      className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all shadow-lg border border-transparent ${loading ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed" : "bg-gradient-to-r from-amber-500 to-orange-500 dark:from-orange-500 dark:to-red-500 hover:from-amber-400 hover:to-orange-400 dark:hover:from-orange-400 dark:hover:to-red-400 text-white shadow-amber-500/20 dark:shadow-orange-500/20 hover:shadow-amber-500/40 dark:hover:shadow-orange-500/40 hover:-translate-y-0.5 hover:border-white/20"}`}
                    >
                      {loading && (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      )}
                      {loading ? "Committing..." : "Finalize Protocol"}
                  </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
export default Occurrence;
