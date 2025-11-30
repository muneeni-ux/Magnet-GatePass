// import React, { useState } from "react";
// import { User, IdCard, Car, Phone, BookOpen } from "lucide-react";
// import { toast } from "react-hot-toast";

// const SERVER_URL = process.env.REACT_APP_SERVER_URL;

// // Map each department to the office’s phone number (format: 2547XXXXXXXX)
// const departmentPhones = {
//   Administration: "254111949314",
//   Academics: "254743072126",
//   Farm: "254743072126",
//   Kitchen: "254743072126",
//   "House Keeping": "254743072126",
// };

// export default function VisitorForm() {
//   const [formData, setFormData] = useState({
//     name: "",
//     idNumber: "",
//     phone: "",
//     vehicleReg: "",
//     department: "",
//     purpose: "",
//   });
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       // 1) Save the visitor record
//       const response = await fetch(`${SERVER_URL}/api/visitors`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });

//       if (!response.ok) throw new Error("Failed to submit visitor data");

//       const savedVisitor = await response.json();
//       console.log("Visitor saved:", savedVisitor);

//       // 2) Find department phone
//       const officePhone = departmentPhones[formData.department];
//       if (!officePhone) {
//         console.warn(
//           "No phone number mapped for department:",
//           formData.department
//         );
//       }

//       // 3) Compose SMS message
//       const smsMessage = `New Visitor Alert:
// Name: ${formData.name}
// Phone: ${formData.phone}
// ID Number: ${formData.idNumber}
// Vehicle Reg: ${formData.vehicleReg || "N/A"}
// Department: ${formData.department}
// Purpose: ${formData.purpose}`;

//       // 4) Send SMS
//       if (officePhone) {
//         const smsResponse = await fetch(`${SERVER_URL}/api/sms/send-sms`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             phone: officePhone,
//             message: smsMessage,
//           }),
//         });

//         if (!smsResponse.ok) {
//           console.error("SMS sending failed");
//           toast.error("Form saved but SMS notification failed.");
//         } else {
//           console.log("SMS sent successfully");
//           toast.success("Visitor registered and officer notified via SMS!");
//         }
//       } else {
//         toast.success("Visitor registered (no SMS sent: no phone mapped).");
//       }

//       // 5) Reset form
//       setFormData({
//         name: "",
//         idNumber: "",
//         phone: "",
//         vehicleReg: "",
//         department: "",
//         purpose: "",
//       });
//     } catch (error) {
//       console.error("Submission error:", error);
//       toast.error("There was a problem submitting the form.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-200 via-blue-100 to-yellow-50 text-gray-900 font-sans mt-6 md:mt-12">
//       <div className="flex-grow flex items-center justify-center px-4 py-16">
//         <div className="relative w-full max-w-4xl shadow-2xl rounded-3xl p-10 sm:p-12 bg-white/70 backdrop-blur-xl border border-white/40">
//           <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-10">
//             Visitor Registration
//           </h2>

//           <form
//             onSubmit={handleSubmit}
//             className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm sm:text-base"
//           >
//             {/* Name */}
//             <div className="relative">
//               <User className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
//               <input
//                 type="text"
//                 name="name"
//                 value={formData.name}
//                 onChange={(e) => {
//                   // Allow only letters, spaces, and basic punctuation
//                   const value = e.target.value.replace(/[0-9]/g, "");
//                   setFormData({ ...formData, name: value });
//                 }}
//                 placeholder="Full Name"
//                 required
//                 pattern="[A-Za-z\s]+"
//                 className="w-full pl-10 border-2 border-indigo-400 p-3 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600"
//               />
//             </div>

//             {/* ID Number */}
//             {/* <div className="relative">
//               <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
//               <input
//                 type="text"
//                 name="idNumber"
//                 value={formData.idNumber}
//                 onChange={handleChange}
//                 placeholder="ID Number"
//                 required
//                 className="w-full pl-10 border-2 border-indigo-400 p-3 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600"
//               />
//             </div> */}
//             {/* ID Number */}
//             <div className="relative">
//               <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
//               <input
//                 type="text"
//                 name="idNumber"
//                 value={formData.idNumber}
//                 onChange={(e) => {
//                   // Allow only digits and max length 12
//                   const value = e.target.value.replace(/\D/g, "").slice(0, 12);
//                   setFormData({ ...formData, idNumber: value });
//                 }}
//                 placeholder="ID Number"
//                 required
//                 maxLength={12}
//                 inputMode="numeric"
//                 pattern="\d{1,12}"
//                 className="w-full pl-10 border-2 border-indigo-400 p-3 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600"
//               />
//             </div>

//             {/* Phone */}
//             <div className="relative">
//               <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
//               <input
//                 type="tel"
//                 name="phone"
//                 value={formData.phone}
//                 required
//                 onChange={(e) => {
//                   const value = e.target.value.replace(/\D/g, "").slice(0, 10);
//                   setFormData({ ...formData, phone: value });
//                 }}
//                 placeholder="Phone Number"
//                 maxLength={12}
//                 inputMode="numeric"
//                 pattern="\d{1,12}"
//                 className="w-full pl-10 border-2 border-indigo-400 p-3 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600"
//               />
//             </div>

//             {/* Vehicle Registration */}
//             <div className="relative">
//               <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
//               <input
//                 type="text"
//                 name="vehicleReg"
//                 value={formData.vehicleReg}
//                 onChange={handleChange}
//                 placeholder="Vehicle Registration (Optional)"
//                 className="w-full pl-10 border-2 border-indigo-400 p-3 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600"
//               />
//             </div>

//             {/* Department */}
//             <div className="relative">
//               <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
//               <select
//                 name="department"
//                 value={formData.department}
//                 onChange={handleChange}
//                 required
//                 className="w-full pl-10 border-2 border-indigo-400 p-3 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600"
//               >
//                 <option value="">Select Department</option>
//                 <option value="Administration">Administration</option>
//                 <option value="Academics">Academics</option>
//                 <option value="Farm">Farm</option>
//                 <option value="Kitchen">Kitchen</option>
//                 <option value="House Keeping">House Keeping</option>
//                 <option value="">Other</option>
//               </select>
//             </div>

//             {/* Purpose */}
//             <textarea
//               name="purpose"
//               value={formData.purpose}
//               onChange={handleChange}
//               placeholder="Purpose of Visit"
//               required
//               className="w-full border-2 border-indigo-400 p-3 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600 sm:col-span-2"
//               rows="4"
//             />

//             {/* Submit */}
//             <div className="flex justify-center sm:col-span-2 mt-6">
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className={`${
//                   loading
//                     ? "bg-indigo-400 cursor-not-allowed"
//                     : "bg-indigo-700 hover:bg-indigo-800"
//                 } text-white px-10 py-3 rounded-full shadow-lg transition font-semibold text-lg`}
//               >
//                 {loading ? "Submitting..." : "Submit Form"}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useState } from "react";
import { User, IdCard, Car, Phone, BookOpen } from "lucide-react";
import { toast } from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

// Map each department to the office’s phone number
const departmentPhones = {
  Administration: "254111949314",
  Academics: "254111949314",
  Farm: "254111949314",
  Kitchen: "254111949314",
  "House Keeping": "254111949314",
  Other: "254111949314",
};

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

  // Handle field changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // If gate changes to Gate B-mauzo, clear department fields
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
      // Prepare department for SMS
      const deptForSMS =
        formData.gate === "Gate B-mauzo"
          ? "N/A"
          : formData.department === "Other"
          ? formData.specificDepartment
          : formData.department;

      // Save the visitor record
      const response = await fetch(`${SERVER_URL}/api/visitors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, department: deptForSMS }),
      });

      if (!response.ok) throw new Error("Failed to submit visitor data");

      const savedVisitor = await response.json();
      console.log("Visitor saved:", savedVisitor);

      // Find department phone (skip if Gate B-mauzo)
      const officePhone =
        formData.gate === "Gate B-mauzo"
          ? null
          : departmentPhones[formData.department] || departmentPhones["Other"];

      // Compose SMS message
      const smsMessage = `New Visitor Alert:
Name: ${formData.name}
Phone: ${formData.phone}
ID Number: ${formData.idNumber}
Vehicle Reg: ${formData.vehicleReg || "N/A"}
Department: ${deptForSMS}
Gate: ${formData.gate}
Nature of Visit: ${formData.nature}`;

      // Send SMS if applicable
      if (officePhone) {
        const smsResponse = await fetch(`${SERVER_URL}/api/sms/send-sms`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: officePhone, message: smsMessage }),
        });

        if (!smsResponse.ok) {
          console.error("SMS sending failed");
          toast.error("Form saved but SMS notification failed.");
        } else {
          toast.success("Visitor registered and officer notified via SMS!");
        }
      } else {
        toast.success("Visitor registered!");
      }

      // Reset form
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
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("There was a problem submitting the form.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-200 via-blue-100 to-yellow-50 text-gray-900 font-sans mt-6 md:mt-12">
      <div className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="relative w-full max-w-4xl shadow-2xl rounded-3xl p-10 sm:p-12 bg-white/70 backdrop-blur-xl border border-white/40">
          <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-10">
            Visitor Registration
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm sm:text-base"
          >
            {/* Name */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => {
                  const value = e.target.value.replace(/[0-9]/g, "");
                  setFormData({ ...formData, name: value });
                }}
                placeholder="Full Name"
                required
                pattern="[A-Za-z\s]+"
                className="w-full pl-10 border-2 border-indigo-400 p-3 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            {/* ID Number */}
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 12);
                  setFormData({ ...formData, idNumber: value });
                }}
                placeholder="ID Number"
                required
                maxLength={12}
                inputMode="numeric"
                pattern="\d{1,12}"
                className="w-full pl-10 border-2 border-indigo-400 p-3 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                required
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setFormData({ ...formData, phone: value });
                }}
                placeholder="Phone Number"
                maxLength={12}
                inputMode="numeric"
                pattern="\d{1,12}"
                className="w-full pl-10 border-2 border-indigo-400 p-3 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            {/* Vehicle Registration */}
            <div className="relative">
              <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
              <input
                type="text"
                name="vehicleReg"
                value={formData.vehicleReg}
                onChange={handleChange}
                placeholder="Vehicle Registration (Optional)"
                className="w-full pl-10 border-2 border-indigo-400 p-3 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            {/* Gate Dropdown */}
            <div className="relative">
              <select
                name="gate"
                value={formData.gate}
                onChange={handleChange}
                required
                className="w-full pl-3 border-2 border-indigo-400 p-3 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600"
              >
                <option value="">Select Gate</option>
                <option value="Gate A">Gate A</option>
                <option value="Gate B-mauzo">Gate B-mauzo</option>
              </select>
            </div>

            {/* Nature of Visit */}
            <div className="relative">
              <select
                name="nature"
                value={formData.nature}
                onChange={handleChange}
                required
                className="w-full pl-3 border-2 border-indigo-400 p-3 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600"
              >
                <option value="">Nature of Visit</option>
                <option value="official">Official</option>
                <option value="personal">Personal</option>
              </select>
            </div>

            {/* Department – only show if Gate A */}
            {formData.gate === "Gate A" && (
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 border-2 border-indigo-400 p-3 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600"
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

            {/* Specific Department if 'Other' and Gate A */}
            {formData.department === "Other" && formData.gate === "Gate A" && (
              <div className="relative sm:col-span-2">
                <input
                  type="text"
                  name="specificDepartment"
                  value={formData.specificDepartment}
                  onChange={handleChange}
                  placeholder="Specify Department"
                  required
                  className="w-full pl-3 border-2 border-indigo-400 p-3 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center sm:col-span-2 mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`${
                  loading
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-700 hover:bg-indigo-800"
                } text-white px-10 py-3 rounded-full shadow-lg transition font-semibold text-lg`}
              >
                {loading ? "Submitting..." : "Submit Form"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
