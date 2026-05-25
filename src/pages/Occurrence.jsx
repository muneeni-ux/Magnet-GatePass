import React, { useState } from "react";
import toast from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Occurrence = () => {
  const [form, setForm] = useState({
    gate: "",
    endTime: "",
    // premise: "",
    // disarmedBy: "",
    // disarmTime: "",
    // parkingOpeningTime: '',
    // parkingClosingTime: '',
    // phonesLeftWith: "",
    // armedBy: "",
    // armTime: "",
    unusualOccurrence: "No",
    unusualDescription: "",
    remarks: "",
    submittedBy: JSON.parse(localStorage.getItem("user"))?.id || null,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.submittedBy) return toast.error("Please log in first.");

    try {
      setLoading(true);
      const res = await fetch(`${SERVER_URL}/api/occurrences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to submit");

      toast.success("Occurrence submitted successfully");
      setForm((prev) => ({
        ...prev,
        unusualDescription: "",
        remarks: "",
      }));
    } catch (err) {
      toast.error(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex items-center justify-center p-6 transition-colors duration-300 pt-28 pb-16">
      
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 sm:p-10 space-y-6 border border-slate-200/50 dark:border-slate-800 transition-colors relative overflow-hidden"
      >
        {/* Glow Element */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full filter blur-3xl pointer-events-none" />

        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Occurrence Incident Report
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium leading-relaxed">
            Log school-gate operations, guard shifts, or security incidents securely.
          </p>
        </div>

        {/* Gate */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            I am reporting the occurrences from:
          </label>
          <select
            name="gate"
            value={form.gate}
            onChange={handleChange}
            required
            className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
          >
            <option value="" disabled>
              Select gate
            </option>
            <option value="Gate One">Gate 1</option>
            <option value="Gate Two">Gate 2</option>
          </select>
        </div>

        {/* End Time */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            End Time of Shift
          </label>
          <input
            type="datetime-local"
            name="endTime"
            value={form.endTime}
            onChange={handleChange}
            required
            className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm [color-scheme:light] dark:[color-scheme:dark]"
          />
        </div>

        {/* Unusual Occurrence */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Was There Any Unusual Occurrence?
          </label>
          <select
            name="unusualOccurrence"
            value={form.unusualOccurrence}
            onChange={handleChange}
            className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        {/* If Yes, Description */}
        {form.unusualOccurrence === "Yes" && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Describe the Occurrence
            </label>
            <textarea
              name="unusualDescription"
              value={form.unusualDescription}
              onChange={handleChange}
              rows={4}
              className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
              placeholder="Provide details here..."
            />
          </div>
        )}

        {/* Remarks */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Additional Remarks
          </label>
          <textarea
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            rows={3}
            className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
            placeholder="Any other comments..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-2">
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] transition-all duration-200 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting Report..." : "Submit Occurrence Report"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Occurrence;