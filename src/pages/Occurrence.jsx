// import React, { useState } from "react";
// import toast from "react-hot-toast";

// const SERVER_URL = process.env.REACT_APP_SERVER_URL;

// const Occurrence = () => {
//   const [form, setForm] = useState({
//     gate: "",
//     endTime: "",
//     // premise: "",
//     // disarmedBy: "",
//     // disarmTime: "",
//     // parkingOpeningTime: '',
//     // parkingClosingTime: '',
//     // phonesLeftWith: "",
//     // armedBy: "",
//     // armTime: "",
//     unusualOccurrence: "No",
//     unusualDescription: "",
//     remarks: "",
//     submittedBy: JSON.parse(localStorage.getItem("user"))?.id || null,
//   });

//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.submittedBy) return toast.error("Please log in first.");

//     try {
//       setLoading(true);
//       const res = await fetch(`${SERVER_URL}/api/occurrences`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });
//       const data = await res.json();

//       if (!res.ok) throw new Error(data.message || "Failed to submit");

//       toast.success("Occurrence submitted successfully");
//       setForm((prev) => ({
//         ...prev,
//         unusualDescription: "",
//         remarks: "",
//       }));
//     } catch (err) {
//       toast.error(err.message || "Submission failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen from-indigo-200 via-blue-100 to-yellow-50 text-gray-900 font-sans flex items-center justify-center p-4 mt-12 md:mt-24">
//       <form
//         onSubmit={handleSubmit}
//         className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6 space-y-6"
//       >
//         <h2 className="text-3xl font-semibold text-blue-800">
//           Occurrence Report
//         </h2>

//         {/* Gate */}
//         <div>
//           <label className="block text-sm font-medium text-blue-700 mb-1">
//             I am reporting the occurrences from:
//           </label>
//           <select
//             name="gate"
//             value={form.gate}
//             onChange={handleChange}
//             required
//             className="w-full p-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="" disabled>
//               Select gate
//             </option>
//             <option value="Gate One">Gate 1</option>
//             <option value="Gate Two">Gate 2</option>
//           </select>
//         </div>

//         {/* End Time */}
//         <div>
//           <label className="block text-sm font-medium text-blue-700 mb-1">
//             End Time of Shift
//           </label>
//           <input
//             type="datetime-local"
//             name="endTime"
//             value={form.endTime}
//             onChange={handleChange}
//             required
//             className="w-full p-2 border border-blue-300 rounded-md"
//           />
//         </div>

//         {/* Unusual Occurrence */}
//         <div>
//           <label className="block text-sm font-medium text-blue-700 mb-1">
//             Was There Any Unusual Occurrence?
//           </label>
//           <select
//             name="unusualOccurrence"
//             value={form.unusualOccurrence}
//             onChange={handleChange}
//             className="w-full p-2 border border-blue-300 rounded-md"
//           >
//             <option value="No">No</option>
//             <option value="Yes">Yes</option>
//           </select>
//         </div>

//         {/* If Yes, Description */}
//         {form.unusualOccurrence === "Yes" && (
//           <div>
//             <label className="block text-sm font-medium text-blue-700 mb-1">
//               Describe the Occurrence
//             </label>
//             <textarea
//               name="unusualDescription"
//               value={form.unusualDescription}
//               onChange={handleChange}
//               rows={4}
//               className="w-full p-2 border border-blue-300 rounded-md"
//               placeholder="Provide details here..."
//             />
//           </div>
//         )}

//         {/* Remarks */}
//         <div>
//           <label className="block text-sm font-medium text-blue-700 mb-1">
//             Additional Remarks
//           </label>
//           <textarea
//             name="remarks"
//             value={form.remarks}
//             onChange={handleChange}
//             rows={3}
//             className="w-full p-2 border border-blue-300 rounded-md"
//             placeholder="Any other comments..."
//           />
//         </div>

//         {/* Submit Button */}
//         <div className="flex justify-center">
//           <button
//             disabled={loading}
//             type="submit"
//             className="bg-blue-700 text-white px-6 py-2 rounded-md hover:bg-blue-800 transition"
//           >
//             {loading ? "Submitting..." : "Submit"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default Occurrence;


import React, { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

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
  const [step, setStep] = useState(1); // Step tracker

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
      toast.error(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-blue-100 to-yellow-50 flex items-center justify-center p-4 mt-12 md:mt-24">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-6 border border-white/30"
      >
        <h2 className="text-3xl font-extrabold text-blue-800 text-center mb-6">
          Occurrence Report
        </h2>

        {/* Step Progress */}
        <div className="flex justify-between mb-6 text-sm font-semibold text-gray-700">
          <div
            className={`flex-1 text-center ${
              step === 1 ? "text-yellow-400" : "opacity-50"
            } cursor-pointer`}
            onClick={() => setStep(1)}
          >
            Gate
          </div>
          <div
            className={`flex-1 text-center ${
              step === 2 ? "text-yellow-400" : "opacity-50"
            } cursor-pointer`}
            onClick={() => setStep(2)}
          >
            Unusual Occurrence
          </div>
          <div
            className={`flex-1 text-center ${
              step === 3 ? "text-yellow-400" : "opacity-50"
            } cursor-pointer`}
            onClick={() => setStep(3)}
          >
            Remarks
          </div>
          <div
            className={`flex-1 text-center ${
              step === 4 ? "text-yellow-400" : "opacity-50"
            } cursor-pointer`}
            onClick={() => setStep(4)}
          >
            Submit
          </div>
        </div>

        {/* Step 1: Gate and End Time */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-semibold text-blue-700 mb-1">
                I am reporting occurrences from:
              </label>
              <select
                name="gate"
                value={form.gate}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-white/80 border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Select gate
                </option>
                <option value="Gate One">Gate 1</option>
                <option value="Gate Two">Gate 2</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-blue-700 mb-1">
                End Time of Shift
              </label>
              <input
                type="datetime-local"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-white/80 border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-full w-full mt-4"
            >
              Next →
            </button>
          </motion.div>
        )}

        {/* Step 2: Unusual Occurrence */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-semibold text-blue-700 mb-1">
                Was There Any Unusual Occurrence?
              </label>
              <select
                name="unusualOccurrence"
                value={form.unusualOccurrence}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-white/80 border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            {form.unusualOccurrence === "Yes" && (
              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-1">
                  Describe the Occurrence
                </label>
                <textarea
                  name="unusualDescription"
                  value={form.unusualDescription}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-3 rounded-lg bg-white/80 border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide details here..."
                />
              </div>
            )}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-gray-400 hover:bg-gray-500 text-black font-bold py-2 px-6 rounded-full"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded-full"
              >
                Next →
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Remarks */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-semibold text-blue-700 mb-1">
                Additional Remarks
              </label>
              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                rows={4}
                className="w-full p-3 rounded-lg bg-white/80 border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any other comments..."
              />
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-gray-400 hover:bg-gray-500 text-black font-bold py-2 px-6 rounded-full"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded-full"
              >
                Next →
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Submit */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center space-y-4"
          >
            <p className="text-blue-700 font-semibold text-center">
              Review your inputs and submit.
            </p>
            <div className="flex justify-between w-full">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="bg-gray-400 hover:bg-gray-500 text-black font-bold py-2 px-6 rounded-full"
              >
                ← Back
              </button>
              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-3 justify-center bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-full`}
              >
                {loading && (
                  <motion.div
                    className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"
                  />
                )}
                {loading ? "Submitting..." : "Submit"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.form>
    </div>
  );
};

export default Occurrence;
