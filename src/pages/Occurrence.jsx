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
          "Please fill in Gate and End Time before proceeding.",
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
    if (!form.submittedBy) return toast.error("Access Denied: Please log in.");

    try {
      setLoading(true);
      const res = await fetch(`${SERVER_URL}/api/occurrences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to submit");

      toast.success("Incident Logged Successfully");
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
      toast.error(err.message || "Submission Failure");
    } finally {
      setLoading(false);
    }
  };

  const InputLabel = ({ children }) => (
    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
      {children}
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-sans p-4 md:p-6 pt-8 md:pt-28 relative overflow-hidden flex items-center justify-center">
      {/* Background Grid */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      ></div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-amber-600/10 rounded-lg border border-amber-500/20">
              <Clipboard className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Occurrence Report
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Shift Activity & Incident Logging
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-amber-500 font-medium uppercase tracking-wide">
              Live Logging
            </span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl p-6 md:p-10 relative overflow-hidden"
        >
          {/* Progress Indicators */}
          <div className="flex justify-between items-center mb-10 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-700 -z-10"></div>
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                onClick={() => (s < step ? setStep(s) : null)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                  step >= s
                    ? "bg-blue-600 text-slate-900 dark:text-white shadow-lg shadow-blue-900/20 ring-4 ring-slate-800"
                    : "bg-slate-50 dark:bg-slate-900 border border-slate-400 dark:border-slate-600 text-slate-500 ring-4 ring-slate-800"
                }`}
              >
                {step > s ? <CheckCircle size={14} /> : s}
              </div>
            ))}
          </div>

          {/* Step 1: Gate and End Time */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Shift Information
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Select reporting location and timestamp.
                </p>
              </div>

              <div>
                <InputLabel>Reporting Location</InputLabel>
                <select
                  name="gate"
                  value={form.gate}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium appearance-none"
                >
                  <option value="" disabled>
                    Select Gate
                  </option>
                  {gates.map((g) => (
                    <option key={g._id} value={g.name}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <InputLabel>Shift End Time</InputLabel>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
                />
              </div>

              <div className="flex justify-end mt-8 pt-6 border-t border-slate-300/50 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => handleNext(2)}
                  className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-blue-900/20"
                >
                  Next Step{" "}
                  <ChevronRight
                    size={16}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Unusual Occurrence */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Incident Report
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Were there any security anomalies during the shift?
                </p>
              </div>

              <div>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`cursor-pointer p-4 border rounded-xl flex flex-col items-center justify-center gap-3 transition-all ${form.unusualOccurrence === "No" ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "bg-slate-50/50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800"}`}
                  >
                    <input
                      type="radio"
                      name="unusualOccurrence"
                      value="No"
                      checked={form.unusualOccurrence === "No"}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <CheckCircle size={24} />
                    <span className="font-bold text-sm">No Incidents</span>
                  </label>
                  <label
                    className={`cursor-pointer p-4 border rounded-xl flex flex-col items-center justify-center gap-3 transition-all ${form.unusualOccurrence === "Yes" ? "bg-red-500/10 border-red-500/50 text-red-400" : "bg-slate-50/50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800"}`}
                  >
                    <input
                      type="radio"
                      name="unusualOccurrence"
                      value="Yes"
                      checked={form.unusualOccurrence === "Yes"}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <ShieldAlert size={24} />
                    <span className="font-bold text-sm">Report Incident</span>
                  </label>
                </div>
              </div>

              {form.unusualOccurrence === "Yes" && (
                <div>
                  <InputLabel>Description of Incident</InputLabel>
                  <textarea
                    name="unusualDescription"
                    value={form.unusualDescription}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white p-3 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm font-medium placeholder-slate-500"
                    placeholder="Please describe the event in detail..."
                  />
                </div>
              )}

              <div className="flex justify-between mt-8 pt-6 border-t border-slate-300/50 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => handleNext(1)}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-semibold transition-colors px-4 py-2"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => handleNext(3)}
                  className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-blue-900/20"
                >
                  Next Step{" "}
                  <ChevronRight
                    size={16}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Remarks */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Additional Notes
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  General remarks or handover information.
                </p>
              </div>

              <div>
                <InputLabel>General Remarks</InputLabel>
                <textarea
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                  rows={5}
                  className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium placeholder-slate-500"
                  placeholder="Enter any additional comments here..."
                />
              </div>

              <div className="flex justify-between mt-8 pt-6 border-t border-slate-300/50 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => handleNext(2)}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-semibold transition-colors px-4 py-2"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => handleNext(4)}
                  className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-blue-900/20"
                >
                  Review{" "}
                  <ChevronRight
                    size={16}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Submit */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Confirm Submission
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Please review your report before submitting.
                </p>
              </div>

              <div className="bg-slate-50/50 dark:bg-slate-900/50 p-6 border border-slate-300 dark:border-slate-700 rounded-xl space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">
                    Reporting From
                  </span>
                  <span className="text-slate-900 dark:text-white font-semibold">
                    {form.gate || "Not Selected"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Shift End</span>
                  <span className="text-slate-900 dark:text-white font-semibold">
                    {form.endTime
                      ? new Date(form.endTime).toLocaleString()
                      : "Not Set"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Incidents</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded ${form.unusualOccurrence === "Yes" ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}
                  >
                    {form.unusualOccurrence === "Yes"
                      ? "Issues Reported"
                      : "None"}
                  </span>
                </div>
                {form.unusualOccurrence === "Yes" && (
                  <div className="pt-2 border-t border-slate-300/50 dark:border-slate-700/50 mt-2">
                    <span className="text-slate-500 text-xs block mb-1">
                      Incident Detail:
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 text-sm italic">
                      "{form.unusualDescription}"
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-8 pt-6">
                <button
                  type="button"
                  onClick={() => handleNext(3)}
                  className="px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-500 text-sm font-semibold transition-all"
                >
                  Edit
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-lg ${loading ? "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400" : "bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white shadow-emerald-900/20"}`}
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {loading ? "Submitting..." : "Submit Report"}
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
