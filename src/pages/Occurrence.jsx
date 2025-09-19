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
    <div className="min-h-screen from-indigo-200 via-blue-100 to-yellow-50 text-gray-900 font-sans flex items-center justify-center p-4 mt-12 md:mt-24">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6 space-y-6"
      >
        <h2 className="text-3xl font-semibold text-blue-800">
          Occurrence Report
        </h2>

        {/* Gate */}
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-1">
            I am reporting the occurrences from:
          </label>
          <select
            name="gate"
            value={form.gate}
            onChange={handleChange}
            required
            className="w-full p-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <label className="block text-sm font-medium text-blue-700 mb-1">
            End Time of Shift
          </label>
          <input
            type="datetime-local"
            name="endTime"
            value={form.endTime}
            onChange={handleChange}
            required
            className="w-full p-2 border border-blue-300 rounded-md"
          />
        </div>

        {/* Unusual Occurrence */}
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-1">
            Was There Any Unusual Occurrence?
          </label>
          <select
            name="unusualOccurrence"
            value={form.unusualOccurrence}
            onChange={handleChange}
            className="w-full p-2 border border-blue-300 rounded-md"
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        {/* If Yes, Description */}
        {form.unusualOccurrence === "Yes" && (
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">
              Describe the Occurrence
            </label>
            <textarea
              name="unusualDescription"
              value={form.unusualDescription}
              onChange={handleChange}
              rows={4}
              className="w-full p-2 border border-blue-300 rounded-md"
              placeholder="Provide details here..."
            />
          </div>
        )}

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-1">
            Additional Remarks
          </label>
          <textarea
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 border border-blue-300 rounded-md"
            placeholder="Any other comments..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            disabled={loading}
            type="submit"
            className="bg-blue-700 text-white px-6 py-2 rounded-md hover:bg-blue-800 transition"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Occurrence;