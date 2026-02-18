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
import { AlertTriangle, CheckCircle, ChevronRight, Clipboard, FileText } from "lucide-react";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.submittedBy) return toast.error("ACCESS DENIED: Please log in first.");

    try {
      setLoading(true);
      const res = await fetch(`${SERVER_URL}/api/occurrences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to submit");

      toast.success("INCIDENTS LOGGED SUCCESSFULLY");
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
      toast.error(err.message || "SUBMISSION FAILURE");
    } finally {
      setLoading(false);
    }
  };

  const InputLabel = ({ children }) => (
      <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">
          {children}
      </label>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-blue-100 font-mono p-4 md:p-6 pt-24 relative overflow-hidden flex items-center justify-center">
        {/* Background Grid */}
       <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
            style={{
                backgroundImage: "linear-gradient(#1e40af 1px, transparent 1px), linear-gradient(90deg, #1e40af 1px, transparent 1px)",
                backgroundSize: "40px 40px"
            }}>
        </div>

      <div className="w-full max-w-2xl relative z-10">
        
        {/* Header */}
        <div className="bg-slate-900 border border-blue-900/50 border-b-0 rounded-t-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-900/20 rounded-md border border-amber-500/30">
                    <Clipboard className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white tracking-widest uppercase">Occurrence Report</h2>
                    <p className="text-[10px] text-amber-500/70 uppercase tracking-wider">Shift Activity Log</p>
                </div>
            </div>
             <div className="flex items-center gap-2">
                 <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse"></div>
                 <span className="text-[10px] text-amber-500 font-bold">LOGGING ACTIVE</span>
            </div>
        </div>

        <form
            onSubmit={handleSubmit}
            className="bg-slate-900/80 backdrop-blur-xl border border-blue-900/50 p-6 md:p-10 shadow-[0_0_50px_rgba(30,58,138,0.2)] rounded-b-lg"
        >
            {/* Progress Indicators */}
            <div className="flex justify-between items-center mb-8 relative">
                 <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-10"></div>
                 {[1, 2, 3, 4].map((s) => (
                    <div 
                        key={s}
                        onClick={() => s < step ? setStep(s) : null}
                        className={`w-8 h-8 rounded-sm flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                            step >= s 
                            ? "bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]" 
                            : "bg-slate-900 border border-slate-700 text-slate-600"
                        }`}
                    >
                        {step > s ? <CheckCircle size={14} /> : `0${s}`}
                    </div>
                 ))}
            </div>

            {/* Step 1: Gate and End Time */}
            {step === 1 && (
            <div className="space-y-6 animate-fade-in">
                 <div className="border-b border-blue-900/30 pb-2 mb-4">
                    <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wider">Step 01 // Shift Details</h3>
                </div>

                <div>
                    <InputLabel>Reporting From (Access Point)</InputLabel>
                    <select
                        name="gate"
                        value={form.gate}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-950/50 border border-blue-900/30 text-blue-100 p-3 rounded-sm focus:outline-none focus:border-blue-500 focus:bg-slate-900/80 transition-all text-sm font-mono appearance-none"
                    >
                        <option value="" disabled>SELECT GATE...</option>
                        <option value="Gate One">GATE A (MAIN)</option>
                        <option value="Gate Two">GATE B (MAUZO)</option>
                    </select>
                </div>

                <div>
                    <InputLabel>Shift End Timestamp</InputLabel>
                    <input
                        type="datetime-local"
                        name="endTime"
                        value={form.endTime}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-950/50 border border-blue-900/30 text-blue-100 p-3 rounded-sm focus:outline-none focus:border-blue-500 focus:bg-slate-900/80 transition-all text-sm font-mono" // Standard datetime-local styling is limited, but this applies basic colors
                    />
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-sm font-bold text-xs tracking-widest uppercase transition-all"
                    >
                        Next Section <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
            )}

            {/* Step 2: Unusual Occurrence */}
            {step === 2 && (
            <div className="space-y-6 animate-fade-in">
                 <div className="border-b border-blue-900/30 pb-2 mb-4">
                    <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider">Step 02 // Incident Check</h3>
                </div>

                <div>
                    <InputLabel>Anomaly Detected?</InputLabel>
                    <div className="grid grid-cols-2 gap-4">
                        <label className={`cursor-pointer p-4 border rounded-sm flex items-center justify-center gap-2 transition-all ${form.unusualOccurrence === "No" ? "bg-green-900/20 border-green-500/50 text-green-400" : "bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-600"}`}>
                            <input type="radio" name="unusualOccurrence" value="No" checked={form.unusualOccurrence === "No"} onChange={handleChange} className="hidden" />
                            <CheckCircle size={16} /> NO INCIDENTS
                        </label>
                        <label className={`cursor-pointer p-4 border rounded-sm flex items-center justify-center gap-2 transition-all ${form.unusualOccurrence === "Yes" ? "bg-red-900/20 border-red-500/50 text-red-400 animate-pulse-slow" : "bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-600"}`}>
                             <input type="radio" name="unusualOccurrence" value="Yes" checked={form.unusualOccurrence === "Yes"} onChange={handleChange} className="hidden" />
                             <AlertTriangle size={16} /> YES, REPORT
                        </label>
                    </div>
                </div>

                {form.unusualOccurrence === "Yes" && (
                <div>
                     <InputLabel>Incident Description</InputLabel>
                    <textarea
                    name="unusualDescription"
                    value={form.unusualDescription}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-slate-950/50 border border-red-900/50 text-red-100 p-3 rounded-sm focus:outline-none focus:border-red-500 focus:bg-slate-900/80 transition-all text-sm font-mono placeholder-red-900/50"
                    placeholder="DESCRIBE THE UNUSUAL EVENT IN DETAIL..."
                    />
                </div>
                )}

                <div className="flex justify-between mt-6">
                    <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-slate-500 hover:text-blue-400 text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                        ← Back
                    </button>
                    <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-sm font-bold text-xs tracking-widest uppercase transition-all"
                    >
                        Next Section <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
            )}

            {/* Step 3: Remarks */}
            {step === 3 && (
            <div className="space-y-6 animate-fade-in">
                <div className="border-b border-blue-900/30 pb-2 mb-4">
                    <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wider">Step 03 // Additional Notes</h3>
                </div>

                <div>
                     <InputLabel>General Remarks / Handover Notes</InputLabel>
                    <textarea
                        name="remarks"
                        value={form.remarks}
                        onChange={handleChange}
                        rows={4}
                         className="w-full bg-slate-950/50 border border-blue-900/30 text-blue-100 p-3 rounded-sm focus:outline-none focus:border-blue-500 focus:bg-slate-900/80 transition-all text-sm font-mono placeholder-slate-600"
                        placeholder="ENTER ANY ADDITIONAL COMMENTS..."
                    />
                </div>

                <div className="flex justify-between mt-6">
                    <button
                        type="button"
                        onClick={() => setStep(2)}
                       className="text-slate-500 hover:text-blue-400 text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                        ← Back
                    </button>
                    <button
                        type="button"
                        onClick={() => setStep(4)}
                        className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-sm font-bold text-xs tracking-widest uppercase transition-all"
                    >
                        Review & Submit <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
            )}

            {/* Step 4: Submit */}
            {step === 4 && (
            <div className="space-y-6 animate-fade-in text-center">
                 <div className="border-b border-blue-900/30 pb-2 mb-4 text-left">
                    <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider">Step 04 // Final Authorization</h3>
                </div>
                
                <div className="p-4 bg-slate-950 border border-blue-900/30 rounded-sm text-left space-y-2 mb-6">
                    <div className="flex justify-between text-xs"><span className="text-slate-500">GATE:</span> <span className="text-blue-200">{form.gate}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-500">SHIFT END:</span> <span className="text-blue-200">{form.endTime}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-500">INCIDENT:</span> <span className={form.unusualOccurrence === "Yes" ? "text-red-400 font-bold" : "text-green-400"}>{form.unusualOccurrence}</span></div>
                </div>

                <div className="flex justify-between w-full gap-4">
                    <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="px-6 py-3 rounded-sm border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 text-xs font-bold uppercase tracking-widest transition-all"
                    >
                        ← Edit Data
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`flex-1 flex items-center gap-3 justify-center px-6 py-3 rounded-sm font-bold text-xs tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:shadow-[0_0_30px_rgba(22,163,74,0.5)] ${loading ? "bg-slate-800 text-slate-500" : "bg-green-600 hover:bg-green-500 text-white"}`}
                    >
                        {loading && (
                        <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                        )}
                        {loading ? "UPLOADING..." : "SUBMIT REPORT"}
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
