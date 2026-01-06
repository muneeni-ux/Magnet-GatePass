// import React, { useState } from "react";
// import { User, IdCard, Car, Phone, BookOpen } from "lucide-react";
// import { toast } from "react-hot-toast";
// // framer-motion removed temporarily to avoid runtime hook issues

// const SERVER_URL = process.env.REACT_APP_SERVER_URL;

// const departmentPhones = {
//   Administration: "254111949314",
//   Academics: "254111949314",
//   Farm: "254111949314",
//   Kitchen: "254111949314",
//   "House Keeping": "254111949314",
//   Other: "254111949314",
// };

// export default function VisitorForm() {
//   const [formData, setFormData] = useState({
//     name: "",
//     idNumber: "",
//     phone: "",
//     vehicleReg: "",
//     department: "",
//     specificDepartment: "",
//     gate: "",
//     nature: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [step, setStep] = useState(1); 

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     if (name === "gate" && value === "Gate B-mauzo") {
//       setFormData((prev) => ({
//         ...prev,
//         gate: value,
//         department: "",
//         specificDepartment: "",
//       }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const deptForSMS =
//         formData.gate === "Gate B-mauzo"
//           ? "N/A"
//           : formData.department === "Other"
//           ? formData.specificDepartment
//           : formData.department;

//       const response = await fetch(`${SERVER_URL}/api/visitors`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ...formData, department: deptForSMS }),
//       });

//       if (!response.ok) throw new Error("Failed to submit visitor data");

//       const officePhone =
//         formData.gate === "Gate B-mauzo"
//           ? null
//           : departmentPhones[formData.department] || departmentPhones["Other"];

//       const smsMessage = `New Visitor Alert:
// Name: ${formData.name}
// Phone: ${formData.phone}
// ID Number: ${formData.idNumber}
// Vehicle Reg: ${formData.vehicleReg || "N/A"}
// Department: ${deptForSMS}
// Gate: ${formData.gate}
// Nature of Visit: ${formData.nature}`;

//       if (officePhone) {
//         const smsResponse = await fetch(`${SERVER_URL}/api/sms/send-sms`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ phone: officePhone, message: smsMessage }),
//         });

//         if (!smsResponse.ok) {
//           toast.error("Form saved but SMS notification failed.");
//         } else {
//           toast.success("Visitor registered and officer notified via SMS!");
//         }
//       } else {
//         toast.success("Visitor registered!");
//       }

//       setFormData({
//         name: "",
//         idNumber: "",
//         phone: "",
//         vehicleReg: "",
//         department: "",
//         specificDepartment: "",
//         gate: "",
//         nature: "",
//       });

//       setStep(1);

//     } catch (error) {
//       toast.error("Submission failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-800 to-yellow-500 px-4 py-16">

//       <div className="w-full max-w-4xl shadow-2xl rounded-3xl p-10 sm:p-12 bg-white/20 backdrop-blur-xl border border-white/40">

//         <h2 className="text-4xl font-extrabold text-center text-white drop-shadow-xl mb-10">
//           Visitor Registration
//         </h2>

//         {/* STEP HEADER – CLICKABLE */}
//         <div className="flex justify-between mb-10 px-6 text-white font-semibold text-lg">
          
//           <button onClick={() => setStep(1)}
//           className={`${step === 1 ? "text-yellow-300" : "opacity-50"} hover:text-yellow-300`}>
//             Personal
//           </button>

//           <button onClick={() => setStep(2)}
//           className={`${step === 2 ? "text-yellow-300" : "opacity-50"} hover:text-yellow-300`}>
//             Visit Info
//           </button>

//           <button onClick={() => setStep(3)}
//           className={`${step === 3 ? "text-yellow-300" : "opacity-50"} hover:text-yellow-300`}>
//             Gate
//           </button>

//           <button onClick={() => setStep(4)}
//           className={`${step === 4 ? "text-yellow-300" : "opacity-50"} hover:text-yellow-300`}>
//             Submit
//           </button>

//         </div>

//         <form onSubmit={handleSubmit}>

//           {/* ============= STEP ONE PERSONAL ============== */}
//           {step === 1 && (
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

//               {/* Name */}
//               <div className="relative">
//                 <User className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-700 animate-pulse"/>
//                 <input
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   placeholder="Full Name"
//                   required
//                   className="w-full pl-10 p-3 rounded-lg bg-white/80"
//                 />
//               </div>

//               {/* ID */}
//               <div className="relative">
//                 <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-700 animate-bounce"/>
//                 <input
//                   name="idNumber"
//                   value={formData.idNumber}
//                   onChange={handleChange}
//                   placeholder="ID Number"
//                   required
//                   className="w-full pl-10 p-3 rounded-lg bg-white/80"
//                 />
//               </div>

//               <button
//                 type="button"
//                 onClick={() => setStep(2)}
//                 className="sm:col-span-2 bg-yellow-400 hover:bg-yellow-600 py-3 rounded-full text-xl font-bold mt-6"
//               >
//                 Next →
//               </button>

//             </div>
//           )}

//           {/* =========== STEP TWO: VISIT INFO ============ */}
//           {step === 2 && (
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

//               <div className="relative">
//                 <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-700 animate-wiggle"/>
//                 <input
//                   type="tel"
//                   name="phone"
//                   value={formData.phone}
//                   onChange={handleChange}
//                   placeholder="Phone Number"
//                   required
//                   className="w-full pl-10 p-3 rounded-lg bg-white/80"
//                 />
//               </div>

//               <div className="relative">
//                 <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-700 animate-spin-slow"/>
//                 <input
//                   name="vehicleReg"
//                   value={formData.vehicleReg}
//                   onChange={handleChange}
//                   placeholder="Vehicle Reg (Optional)"
//                   className="w-full pl-10 p-3 rounded-lg bg-white/80"
//                 />
//               </div>

//               <button
//                 type="button"
//                 onClick={() => setStep(3)}
//                 className="sm:col-span-2 bg-yellow-400 hover:bg-yellow-600 py-3 rounded-full text-xl font-bold mt-6"
//               >
//                 Next →
//               </button>

//             </div>
//           )}

//           {/* ============ STEP THREE GATE =========== */}
//           {step === 3 && (
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

//               <select
//                 name="gate"
//                 value={formData.gate}
//                 onChange={handleChange}
//                 required
//                 className="w-full p-3 rounded-lg bg-white/80 backdrop-blur-md"
//               >
//                 <option value="">Select Gate</option>
//                 <option value="Gate A">Gate A</option>
//                 <option value="Gate B-mauzo">Gate B-mauzo</option>
//               </select>

//               <select
//                 name="nature"
//                 value={formData.nature}
//                 onChange={handleChange}
//                 required
//                 className="w-full p-3 rounded-lg bg-white/80 backdrop-blur-md"
//               >
//                 <option value="">Nature of Visit</option>
//                 <option value="official">Official</option>
//                 <option value="personal">Personal</option>
//               </select>

//               {formData.gate === "Gate A" && (
//                 <div className="relative col-span-2">
//                   <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-700"/>
//                   <select
//                     name="department"
//                     value={formData.department}
//                     onChange={handleChange}
//                     required
//                     className="w-full pl-10 p-3 rounded-lg bg-white/80"
//                   >
//                     <option value="">Select Department</option>
//                     <option value="Administration">Administration</option>
//                     <option value="Academics">Academics</option>
//                     <option value="Farm">Farm</option>
//                     <option value="Kitchen">Kitchen</option>
//                     <option value="House Keeping">House Keeping</option>
//                     <option value="Other">Other</option>
//                   </select>
//                 </div>
//               )}

//               {formData.department === "Other" && formData.gate === "Gate A" && (
//                 <input
//                   name="specificDepartment"
//                   placeholder="Specify Department"
//                   required
//                   value={formData.specificDepartment}
//                   onChange={handleChange}
//                   className="w-full p-3 col-span-2 rounded-lg bg-white/80"
//                 />
//               )}

//               <button
//                 type="button"
//                 onClick={() => setStep(4)}
//                 className="sm:col-span-2 bg-yellow-400 hover:bg-yellow-600 py-3 rounded-full text-xl font-bold mt-6"
//               >
//                 Next →
//               </button>

//             </div>
//           )}

//           {/* ========== STEP FOUR: SUBMIT =========== */}
//           {step === 4 && (
//             <div className="mt-10 flex justify-center">

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className={`${loading ? "bg-gray-300 cursor-not-allowed" : "bg-yellow-400 hover:bg-yellow-600"} text-black px-16 py-4 rounded-full text-2xl font-bold shadow-xl flex items-center gap-4`}
//               >
                
//                 {loading && (
//                   <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
//                 )}

//                 {loading ? "Submitting..." : "Submit ✔"}

//               </button>

//             </div>
//           )}

//         </form>
//       </div>
//     </div>
//   );
// }



import React, { useState } from "react";
import { User, IdCard, Car, Phone, BookOpen } from "lucide-react";
import { toast } from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export default function VisitorForm() {
  const [formData, setFormData] = useState({
    name: "",
    idNumber: "",
    phone: "",
    vehicleReg: "",
    department: "",
    specificDepartment: "",
    gate: "",
    nature: "",
  });

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "gate" && value === "Gate B-mauzo") {
      setFormData((prev) => ({
        ...prev,
        gate: value,
        department: "",
        specificDepartment: "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Determine the department string to save
      const finalDepartment =
        formData.gate === "Gate B-mauzo"
          ? "N/A"
          : formData.department === "Other"
          ? formData.specificDepartment
          : formData.department;

      const response = await fetch(`${SERVER_URL}/api/visitors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, department: finalDepartment }),
      });

      if (!response.ok) throw new Error("Failed to submit visitor data");

      // Success Toast
      toast.success("Visitor registered successfully!");

      // Reset Form
      setFormData({
        name: "",
        idNumber: "",
        phone: "",
        vehicleReg: "",
        department: "",
        specificDepartment: "",
        gate: "",
        nature: "",
      });

      setStep(1);
    } catch (error) {
      toast.error("Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-800 to-yellow-500 px-4 py-16">
      <div className="w-full max-w-4xl shadow-2xl rounded-3xl p-10 sm:p-12 bg-white/20 backdrop-blur-xl border border-white/40">
        <h2 className="text-4xl font-extrabold text-center text-white drop-shadow-xl mb-10">
          Visitor Registration
        </h2>

        {/* STEP HEADER – CLICKABLE */}
        <div className="flex justify-between mb-10 px-6 text-white font-semibold text-lg">
          <button
            onClick={() => setStep(1)}
            className={`${step === 1 ? "text-yellow-300" : "opacity-50"} hover:text-yellow-300`}
          >
            Personal
          </button>
          <button
            onClick={() => setStep(2)}
            className={`${step === 2 ? "text-yellow-300" : "opacity-50"} hover:text-yellow-300`}
          >
            Visit Info
          </button>
          <button
            onClick={() => setStep(3)}
            className={`${step === 3 ? "text-yellow-300" : "opacity-50"} hover:text-yellow-300`}
          >
            Gate
          </button>
          <button
            onClick={() => setStep(4)}
            className={`${step === 4 ? "text-yellow-300" : "opacity-50"} hover:text-yellow-300`}
          >
            Submit
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ============= STEP ONE PERSONAL ============== */}
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-700 animate-pulse" />
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  className="w-full pl-10 p-3 rounded-lg bg-white/80"
                />
              </div>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-700 animate-bounce" />
                <input
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  placeholder="ID Number"
                  required
                  className="w-full pl-10 p-3 rounded-lg bg-white/80"
                />
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="sm:col-span-2 bg-yellow-400 hover:bg-yellow-600 py-3 rounded-full text-xl font-bold mt-6"
              >
                Next →
              </button>
            </div>
          )}

          {/* =========== STEP TWO: VISIT INFO ============ */}
          {step === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-700 animate-wiggle" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  required
                  className="w-full pl-10 p-3 rounded-lg bg-white/80"
                />
              </div>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-700 animate-spin-slow" />
                <input
                  name="vehicleReg"
                  value={formData.vehicleReg}
                  onChange={handleChange}
                  placeholder="Vehicle Reg (Optional)"
                  className="w-full pl-10 p-3 rounded-lg bg-white/80"
                />
              </div>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="sm:col-span-2 bg-yellow-400 hover:bg-yellow-600 py-3 rounded-full text-xl font-bold mt-6"
              >
                Next →
              </button>
            </div>
          )}

          {/* ============ STEP THREE GATE =========== */}
          {step === 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <select
                name="gate"
                value={formData.gate}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-white/80 backdrop-blur-md"
              >
                <option value="">Select Gate</option>
                <option value="Gate A">Gate A</option>
                <option value="Gate B-mauzo">Gate B-mauzo</option>
              </select>

              <select
                name="nature"
                value={formData.nature}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-white/80 backdrop-blur-md"
              >
                <option value="">Nature of Visit</option>
                <option value="official">Official</option>
                <option value="personal">Personal</option>
              </select>

              {formData.gate === "Gate A" && (
                <div className="relative col-span-2">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-700" />
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 p-3 rounded-lg bg-white/80"
                  >
                    <option value="">Select Department</option>
                    <option value="Administration">Administration</option>
                    <option value="Academics">Academics</option>
                    <option value="Farm">Farm</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="House Keeping">House Keeping</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}

              {formData.department === "Other" && formData.gate === "Gate A" && (
                <input
                  name="specificDepartment"
                  placeholder="Specify Department"
                  required
                  value={formData.specificDepartment}
                  onChange={handleChange}
                  className="w-full p-3 col-span-2 rounded-lg bg-white/80"
                />
              )}

              <button
                type="button"
                onClick={() => setStep(4)}
                className="sm:col-span-2 bg-yellow-400 hover:bg-yellow-600 py-3 rounded-full text-xl font-bold mt-6"
              >
                Next →
              </button>
            </div>
          )}

          {/* ========== STEP FOUR: SUBMIT =========== */}
          {step === 4 && (
            <div className="mt-10 flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className={`${
                  loading ? "bg-gray-300 cursor-not-allowed" : "bg-yellow-400 hover:bg-yellow-600"
                } text-black px-16 py-4 rounded-full text-2xl font-bold shadow-xl flex items-center gap-4`}
              >
                {loading && (
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {loading ? "Submitting..." : "Submit ✔"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}