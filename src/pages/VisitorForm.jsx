import React, { useState } from "react";
import {
  User,
  IdCard,
  Car,
  Phone,
  BookOpen,
  CheckCircle,
  ChevronRight,
  FileText,
  Shield,
  Scan,
  Info,
} from "lucide-react";
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
    isUnderage: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const validatePhone = (phone) => {
    if (!phone) return "Required Field";
    if (phone.length < 10) return "Min 10 Digits";
    if (phone.length > 13) return "Max 13 Digits";
    return "";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "gate" && value === "Gate B-mauzo") {
      setFormData((prev) => ({
        ...prev,
        gate: value,
        department: "N/A", // Default for Gate B
        specificDepartment: "",
      }));
    } else if (type === "checkbox" && name === "isUnderage") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        idNumber: checked ? "" : prev.idNumber, // Clear ID if underage
      }));
    } else if (name === "phone") {
      // Allow only numbers
      const numericValue = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: numericValue }));

      // Real-time validation
      const error = validatePhone(numericValue);
      setErrors((prev) => ({ ...prev, phone: error }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Mock Phone Numbers for Departments
  const DEPARTMENT_PHONES = {
    Administration: "0111949314",
    Academics: "0111949314", // Replace with actual numbers later
    Farm: "0111949314",
    Kitchen: "0111949314",
    "House Keeping": "0111949314",
    "Gate B-mauzo": "0111949314", // Gate B In-charge
    Default: "0111949314", // Fallback / Admin
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full Name is required";

    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    if (!formData.isUnderage && !formData.idNumber.trim()) {
      newErrors.idNumber = "ID Number is required";
    }

    if (!formData.gate) newErrors.gate = "Entry Gate is required";
    if (!formData.nature) newErrors.nature = "Nature of Visit is required";

    if (formData.gate === "Gate A" && !formData.department) {
      newErrors.department = "Department is required";
    }

    if (
      formData.gate === "Gate A" &&
      formData.department === "Other" &&
      !formData.specificDepartment.trim()
    ) {
      newErrors.specificDepartment = "Please specify the destination";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      // Determine the department string to save
      const finalDepartment =
        formData.gate === "Gate B-mauzo"
          ? "N/A"
          : formData.department === "Other"
            ? formData.specificDepartment
            : formData.department;

      // Get current user from localStorage
      const user = JSON.parse(localStorage.getItem("user"));

      // 1. Send SMS Notification to Department/Gate
      let targetPhone = DEPARTMENT_PHONES["Default"];
      let recipientName = "Admin";

      if (formData.gate === "Gate B-mauzo") {
        targetPhone = DEPARTMENT_PHONES["Gate B-mauzo"];
        recipientName = "Gate B In-charge";
      } else if (formData.gate === "Gate A" && formData.department) {
        targetPhone =
          DEPARTMENT_PHONES[formData.department] ||
          DEPARTMENT_PHONES["Default"];
        recipientName = formData.department;
      }

      const smsMessage = `MAGTRACK ALERT\nVisitor: ${formData.name}\nID: ${formData.isUnderage ? "Underage/Minor" : formData.idNumber}\nDestination: ${finalDepartment || "School Premises"}\nPurpose: ${formData.nature}\nGate: ${formData.gate}`;

      // Trigger SMS (Non-blocking or blocking depending on preference, here blocking to ensure alert sent)
      try {
        await fetch(`${SERVER_URL}/api/sms/send-sms`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: targetPhone, message: smsMessage }),
        });
        console.log(`SMS Sent to ${recipientName} (${targetPhone})`);
      } catch (smsError) {
        console.error("Failed to send department alert SMS", smsError);
        // We don't stop the visitor log process if SMS fails, but we might log it
      }

      const payload = {
        ...formData,
        department: finalDepartment,
        // Ensure idNumber is not sent if empty (backend handles optional)
        idNumber: formData.idNumber || undefined,
        recordedBy: user?.id, // Add recordedBy field
      };

      const response = await fetch(`${SERVER_URL}/api/visitors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to submit visitor data");

      // Success Toast
      toast.success(`Visitor Logged & Alert Sent to ${recipientName}`);

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
        isUnderage: false,
      });
      setErrors({});
      setStep(1);
    } catch (error) {
      console.error(error);
      toast.error("System Error: Submission Failed");
    } finally {
      setLoading(false);
    }
  };

  const InputLabel = ({ children }) => (
    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
      {children}
    </label>
  );

  return (
    <div className="min-h-screen items-center justify-center bg-slate-900 font-sans text-slate-100 p-4 md:p-6 pt-24 md:pt-28 flex overflow-hidden relative">
      {/* Background Grid */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      ></div>

      <div className="w-full max-w-5xl relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20">
              <Scan className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Visitor Entry Log
              </h1>
              <p className="text-sm text-slate-400">
                Record and Validate Visitor Details
              </p>
            </div>
          </div>
          {/* <div className="hidden md:block text-right">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                     <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                     <span className="text-xs text-emerald-500 font-medium uppercase tracking-wide">System Online</span>
                </div>
            </div> */}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
          {/* Steps Sidebar */}
          <div className="w-full md:w-64 bg-slate-900/50 border-b md:border-b-0 md:border-r border-slate-700 p-6 flex md:flex-col justify-between md:justify-start gap-4 overflow-x-auto">
            {[1, 2, 3, 4].map((s) => (
              <button
                key={s}
                onClick={() => (s < step ? setStep(s) : null)}
                disabled={s > step}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all w-full whitespace-nowrap ${
                  step === s
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                    : step > s
                      ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      : "text-slate-500 cursor-not-allowed"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${step === s ? "bg-white/20" : "bg-slate-700"}`}
                >
                  {s < step ? <CheckCircle size={14} /> : s}
                </span>
                {s === 1 && "Personal Info"}
                {s === 2 && "Contact Info"}
                {s === 3 && "Purpose"}
                {s === 4 && "Confirm"}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="flex-1 p-6 md:p-10 relative bg-slate-800">
            <form
              onSubmit={handleSubmit}
              className="h-full flex flex-col relative z-20"
            >
              {/* STEP 1: IDENTITY */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="pb-2 mb-2">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-500" /> Personal
                      Details
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Enter visitor's official identification details.
                    </p>
                  </div>

                  {/* Underage Toggle */}
                  <label
                    className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all ${formData.isUnderage ? "bg-blue-600/10 border-blue-500/30" : "bg-slate-900/30 border-slate-700 hover:border-slate-600"}`}
                  >
                    <div
                      className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isUnderage ? "bg-blue-600 border-blue-600" : "border-slate-500 bg-slate-800"}`}
                    >
                      {formData.isUnderage && (
                        <CheckCircle size={14} className="text-white" />
                      )}
                    </div>
                    <input
                      type="checkbox"
                      name="isUnderage"
                      checked={formData.isUnderage}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <div>
                      <span className="text-sm font-semibold text-white block">
                        Underage Visitor
                      </span>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        Waives Government ID requirement. Guardian/Parent
                        information will be required.
                      </span>
                    </div>
                  </label>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <InputLabel>Full Legal Name</InputLabel>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. John Doe"
                        className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm placeholder-slate-600"
                      />
                    </div>

                    {!formData.isUnderage && (
                      <div>
                        <InputLabel>ID / Passport Number</InputLabel>
                        <div className="relative">
                          <input
                            name="idNumber"
                            value={formData.idNumber}
                            onChange={handleChange}
                            required={!formData.isUnderage}
                            placeholder="Enter ID Number"
                            className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm placeholder-slate-600"
                          />
                          <IdCard className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end mt-8 pt-6 border-t border-slate-700/50">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={
                        !formData.name ||
                        (!formData.isUnderage && !formData.idNumber)
                      }
                      className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-blue-900/20"
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

              {/* STEP 2: CONTACT */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="pb-2 mb-2">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Phone className="h-5 w-5 text-blue-500" /> Contact &
                      Vehicle
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Contact details for tracing and vehicle registration.
                    </p>
                  </div>

                  <div>
                    <InputLabel>
                      Mobile Number {formData.isUnderage && "(Parent/Guardian)"}
                    </InputLabel>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        maxLength={13}
                        placeholder="07XXXXXXXX"
                        className={`w-full bg-slate-900/50 border ${errors.phone ? "border-red-500" : "border-slate-700"} text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm placeholder-slate-600`}
                      />
                      {errors.phone && (
                        <div className="absolute top-full left-0 mt-1 flex items-center gap-1.5 text-xs text-red-400 font-medium">
                          <Info size={12} /> {errors.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  {!formData.isUnderage && (
                    <div>
                      <InputLabel>Vehicle Registration (If driving)</InputLabel>
                      <div className="relative">
                        <input
                          name="vehicleReg"
                          value={formData.vehicleReg}
                          onChange={handleChange}
                          placeholder="KAA 000A"
                          className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm placeholder-slate-600 uppercase"
                        />
                        <Car className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between mt-8 pt-6 border-t border-slate-700/50">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-slate-400 hover:text-white text-sm font-semibold transition-colors px-4 py-2"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const err = validatePhone(formData.phone);
                        if (err) {
                          setErrors((p) => ({ ...p, phone: err }));
                          toast.error(err);
                        } else setStep(3);
                      }}
                      className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-blue-900/20"
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

              {/* STEP 3: PURPOSE */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="pb-2 mb-2">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-500" /> Visit
                      Details
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Specify entry point and destination.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <InputLabel>Entry Gate</InputLabel>
                      <select
                        name="gate"
                        value={formData.gate}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm appearance-none"
                      >
                        <option value="" disabled>
                          Select Gate
                        </option>
                        <option value="Gate A">Gate A (Main)</option>
                        <option value="Gate B-mauzo">Gate B (Mauzo)</option>
                      </select>
                    </div>
                    <div>
                      <InputLabel>Nature of Visit</InputLabel>
                      <select
                        name="nature"
                        value={formData.nature}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm appearance-none"
                      >
                        <option value="" disabled>
                          Select Type
                        </option>
                        <option value="official">Official</option>
                        <option value="personal">Personal</option>
                      </select>
                    </div>
                  </div>

                  {formData.gate === "Gate A" && (
                    <div>
                      <InputLabel>Target Department</InputLabel>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm appearance-none"
                      >
                        <option value="" disabled>
                          Select Department
                        </option>
                        <option value="Administration">Administration</option>
                        <option value="Academics">Academics</option>
                        <option value="Farm">Farm</option>
                        <option value="Kitchen">Kitchen</option>
                        <option value="House Keeping">House Keeping</option>
                        <option value="Other">Other / Specify</option>
                      </select>
                    </div>
                  )}

                  {formData.department === "Other" &&
                    formData.gate === "Gate A" && (
                      <div>
                        <InputLabel>Specify Destination</InputLabel>
                        <input
                          name="specificDepartment"
                          value={formData.specificDepartment}
                          onChange={handleChange}
                          required
                          placeholder="Enter destination details"
                          className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm placeholder-slate-600"
                        />
                      </div>
                    )}

                  <div className="flex justify-between mt-8 pt-6 border-t border-slate-700/50">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-slate-400 hover:text-white text-sm font-semibold transition-colors px-4 py-2"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      disabled={
                        !formData.gate ||
                        !formData.nature ||
                        (formData.gate === "Gate A" && !formData.department)
                      }
                      className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-blue-900/20"
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

              {/* STEP 4: SUBMIT */}
              {step === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
                  <div className="pb-2 mb-2">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Shield className="h-5 w-5 text-emerald-500" /> Confirm
                      Details
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Review information before submission.
                    </p>
                  </div>

                  <div className="bg-slate-900/50 p-6 border border-slate-700 rounded-xl relative overflow-hidden">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                      <div>
                        <span className="text-slate-500 block text-xs uppercase tracking-wide mb-1">
                          Visitor Name
                        </span>
                        <span className="text-white font-medium">
                          {formData.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs uppercase tracking-wide mb-1">
                          ID / Passport
                        </span>
                        <span className="text-white font-medium">
                          {formData.isUnderage ? (
                            <span className="text-amber-400">
                              Underage / Minor
                            </span>
                          ) : (
                            formData.idNumber
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs uppercase tracking-wide mb-1">
                          Mobile
                        </span>
                        <span className="text-white font-medium">
                          {formData.phone}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs uppercase tracking-wide mb-1">
                          Gate
                        </span>
                        <span className="text-white font-medium">
                          {formData.gate}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 block text-xs uppercase tracking-wide mb-1">
                          Destination
                        </span>
                        <span className="text-white font-medium">
                          {formData.department === "Other"
                            ? formData.specificDepartment
                            : formData.department || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-auto pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-6 py-3 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 rounded-lg font-semibold text-sm transition-all"
                    >
                      Edit
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-lg ${loading ? "bg-slate-700 text-slate-400" : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20"}`}
                    >
                      {loading && (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      )}
                      {loading ? "Authorizing..." : "Submit Entry"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// import React, { useState } from "react";
// import { User, IdCard, Car, Phone, BookOpen, CheckCircle, ChevronRight, FileText, Shield, Scan, Info } from "lucide-react";
// import { toast } from "react-hot-toast";

// const SERVER_URL = process.env.REACT_APP_SERVER_URL;

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
//     isUnderage: false,
//   });

//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [step, setStep] = useState(1);

//   const validatePhone = (phone) => {
//     if (!phone) return "Required Field";
//     if (phone.length < 10) return "Min 10 Digits";
//     if (phone.length > 13) return "Max 13 Digits";
//     return "";
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;

//     if (name === "gate" && value === "Gate B-mauzo") {
//       setFormData((prev) => ({
//         ...prev,
//         gate: value,
//         department: "N/A", // Default for Gate B
//         specificDepartment: "",
//       }));
//     } else if (type === "checkbox" && name === "isUnderage") {
//       setFormData((prev) => ({
//         ...prev,
//         [name]: checked,
//         idNumber: checked ? "" : prev.idNumber, // Clear ID if underage
//       }));
//     } else if (name === "phone") {
//       // Allow only numbers
//       const numericValue = value.replace(/\D/g, "");
//       setFormData((prev) => ({ ...prev, [name]: numericValue }));

//       // Real-time validation
//       const error = validatePhone(numericValue);
//       setErrors((prev) => ({ ...prev, phone: error }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Final validation check
//     const phoneError = validatePhone(formData.phone);
//     if (phoneError) {
//       setErrors((prev) => ({ ...prev, phone: phoneError }));
//       toast.error(`Input Error: ${phoneError}`);
//       return;
//     }

//     setLoading(true);

//     try {
//       // Determine the department string to save
//       const finalDepartment =
//         formData.gate === "Gate B-mauzo"
//           ? "N/A"
//           : formData.department === "Other"
//           ? formData.specificDepartment
//           : formData.department;

//       // Get current user from localStorage
//       const user = JSON.parse(localStorage.getItem("user"));

//       const payload = {
//         ...formData,
//         department: finalDepartment,
//         // Ensure idNumber is not sent if empty (backend handles optional)
//         idNumber: formData.idNumber || undefined,
//         recordedBy: user?.id, // Add recordedBy field
//       };

//       const response = await fetch(`${SERVER_URL}/api/visitors`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!response.ok) throw new Error("Failed to submit visitor data");

//       // Success Toast
//       toast.success("Visitor Successfully Logged");

//       // Reset Form
//       setFormData({
//         name: "",
//         idNumber: "",
//         phone: "",
//         vehicleReg: "",
//         department: "",
//         specificDepartment: "",
//         gate: "",
//         nature: "",
//         isUnderage: false,
//       });
//       setErrors({});
//       setStep(1);
//     } catch (error) {
//       toast.error("System Error: Submission Failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const InputLabel = ({ children }) => (
//       <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
//           {children}
//       </label>
//   );

//   return (
//     <div className="min-h-screen items-center justify-center bg-slate-900 font-sans text-slate-100 p-4 md:p-6 pt-24 md:pt-28 flex overflow-hidden relative">

//        {/* Background Grid */}
//        <div className="absolute inset-0 z-0 opacity-[0.03]"
//             style={{
//                 backgroundImage: "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)",
//                 backgroundSize: "60px 60px"
//             }}>
//         </div>

//       <div className="w-full max-w-5xl relative z-10">

//         {/* Header */}
//         <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
//             <div className="flex items-center gap-4">
//                 <div className="p-2.5 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20">
//                     <Scan className="h-6 w-6 text-white" />
//                 </div>
//                 <div>
//                      <h1 className="text-2xl font-bold text-white tracking-tight">Visitor Entry Log</h1>
//                      <p className="text-sm text-slate-400">Record and Validate Visitor Details</p>
//                 </div>
//             </div>
//             <div className="hidden md:block text-right">
//                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
//                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
//                      <span className="text-xs text-emerald-500 font-medium uppercase tracking-wide">System Online</span>
//                 </div>
//             </div>
//         </div>

//         <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

//             {/* Steps Sidebar */}
//             <div className="w-full md:w-64 bg-slate-900/50 border-b md:border-b-0 md:border-r border-slate-700 p-6 flex md:flex-col justify-between md:justify-start gap-4 overflow-x-auto">
//                  {[1, 2, 3, 4].map((s) => (
//                     <button
//                         key={s}
//                         onClick={() => s < step ? setStep(s) : null}
//                         disabled={s > step}
//                         className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all w-full whitespace-nowrap ${
//                             step === s
//                             ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
//                             : step > s
//                                 ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
//                                 : "text-slate-500 cursor-not-allowed"
//                         }`}
//                     >
//                          <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${step === s ? "bg-white/20" : "bg-slate-700"}`}>
//                              {s < step ? <CheckCircle size={14}/> : s}
//                          </span>
//                          {s === 1 && "Personal Info"}
//                          {s === 2 && "Contact Info"}
//                          {s === 3 && "Purpose"}
//                          {s === 4 && "Confirm"}
//                     </button>
//                  ))}
//             </div>

//             {/* Form Content */}
//             <div className="flex-1 p-6 md:p-10 relative bg-slate-800">
//                 <form onSubmit={handleSubmit} className="h-full flex flex-col relative z-20">

//                   {/* STEP 1: IDENTITY */}
//                   {step === 1 && (
//                     <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
//                         <div className="pb-2 mb-2">
//                             <h3 className="text-lg font-bold text-white flex items-center gap-2">
//                                 <User className="h-5 w-5 text-blue-500" /> Personal Details
//                             </h3>
//                             <p className="text-sm text-slate-400 mt-1">Enter visitor's official identification details.</p>
//                         </div>

//                        {/* Underage Toggle */}
//                        <label className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all ${formData.isUnderage ? "bg-blue-600/10 border-blue-500/30" : "bg-slate-900/30 border-slate-700 hover:border-slate-600"}`}>
//                            <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isUnderage ? "bg-blue-600 border-blue-600" : "border-slate-500 bg-slate-800"}`}>
//                                 {formData.isUnderage && <CheckCircle size={14} className="text-white" />}
//                            </div>
//                            <input
//                              type="checkbox"
//                              name="isUnderage"
//                              checked={formData.isUnderage}
//                              onChange={handleChange}
//                              className="hidden"
//                            />
//                            <div>
//                                <span className="text-sm font-semibold text-white block">Underage Visitor</span>
//                                <span className="text-xs text-slate-400 block mt-0.5">Waives Government ID requirement. Guardian/Parent information will be required.</span>
//                            </div>
//                        </label>

//                        <div className="grid grid-cols-1 gap-6">
//                            <div>
//                                <InputLabel>Full Legal Name</InputLabel>
//                                <input
//                                  name="name"
//                                  value={formData.name}
//                                  onChange={handleChange}
//                                  required
//                                  placeholder="e.g. John Doe"
//                                  className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm placeholder-slate-600"
//                                />
//                            </div>

//                            {!formData.isUnderage && (
//                                <div>
//                                    <InputLabel>ID / Passport Number</InputLabel>
//                                    <div className="relative">
//                                        <input
//                                          name="idNumber"
//                                          value={formData.idNumber}
//                                          onChange={handleChange}
//                                          required={!formData.isUnderage}
//                                          placeholder="Enter ID Number"
//                                          className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm placeholder-slate-600"
//                                        />
//                                        <IdCard className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
//                                    </div>
//                                </div>
//                            )}
//                        </div>

//                         <div className="flex justify-end mt-8 pt-6 border-t border-slate-700/50">
//                             <button
//                               type="button"
//                               onClick={() => setStep(2)}
//                               disabled={!formData.name || (!formData.isUnderage && !formData.idNumber)}
//                               className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-blue-900/20"
//                             >
//                                 Next Step <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
//                             </button>
//                         </div>
//                     </div>
//                   )}

//                   {/* STEP 2: CONTACT */}
//                   {step === 2 && (
//                     <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
//                          <div className="pb-2 mb-2">
//                             <h3 className="text-lg font-bold text-white flex items-center gap-2">
//                                 <Phone className="h-5 w-5 text-blue-500" /> Contact & Vehicle
//                             </h3>
//                             <p className="text-sm text-slate-400 mt-1">Contact details for tracing and vehicle registration.</p>
//                         </div>

//                         <div>
//                             <InputLabel>Mobile Number {formData.isUnderage && "(Parent/Guardian)"}</InputLabel>
//                             <div className="relative">
//                                 <input
//                                   type="tel"
//                                   name="phone"
//                                   value={formData.phone}
//                                   onChange={handleChange}
//                                   required
//                                   maxLength={13}
//                                   placeholder="07XXXXXXXX"
//                                   className={`w-full bg-slate-900/50 border ${errors.phone ? "border-red-500" : "border-slate-700"} text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm placeholder-slate-600`}
//                                 />
//                                 {errors.phone && (
//                                     <div className="absolute top-full left-0 mt-1 flex items-center gap-1.5 text-xs text-red-400 font-medium">
//                                         <Info size={12} /> {errors.phone}
//                                     </div>
//                                 )}
//                             </div>
//                         </div>

//                         {!formData.isUnderage && (
//                              <div>
//                                 <InputLabel>Vehicle Registration (If driving)</InputLabel>
//                                 <div className="relative">
//                                     <input
//                                       name="vehicleReg"
//                                       value={formData.vehicleReg}
//                                       onChange={handleChange}
//                                       placeholder="KAA 000A"
//                                       className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm placeholder-slate-600 uppercase"
//                                     />
//                                     <Car className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
//                                 </div>
//                             </div>
//                         )}

//                         <div className="flex justify-between mt-8 pt-6 border-t border-slate-700/50">
//                             <button type="button" onClick={() => setStep(1)} className="text-slate-400 hover:text-white text-sm font-semibold transition-colors px-4 py-2">Back</button>
//                             <button
//                               type="button"
//                               onClick={() => {
//                                 const err = validatePhone(formData.phone);
//                                 if (err) { setErrors(p => ({...p, phone: err})); toast.error(err); }
//                                 else setStep(3);
//                               }}
//                               className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-blue-900/20"
//                             >
//                                 Next Step <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
//                             </button>
//                         </div>
//                     </div>
//                   )}

//                   {/* STEP 3: PURPOSE */}
//                   {step === 3 && (
//                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
//                         <div className="pb-2 mb-2">
//                             <h3 className="text-lg font-bold text-white flex items-center gap-2">
//                                 <BookOpen className="h-5 w-5 text-blue-500" /> Visit Details
//                             </h3>
//                              <p className="text-sm text-slate-400 mt-1">Specify entry point and destination.</p>
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <div>
//                                 <InputLabel>Entry Gate</InputLabel>
//                                 <select
//                                     name="gate"
//                                     value={formData.gate}
//                                     onChange={handleChange}
//                                     required
//                                     className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm appearance-none"
//                                 >
//                                     <option value="" disabled>Select Gate</option>
//                                     <option value="Gate A">Gate A (Main)</option>
//                                     <option value="Gate B-mauzo">Gate B (Mauzo)</option>
//                                 </select>
//                             </div>
//                             <div>
//                                 <InputLabel>Nature of Visit</InputLabel>
//                                 <select
//                                     name="nature"
//                                     value={formData.nature}
//                                     onChange={handleChange}
//                                     required
//                                     className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm appearance-none"
//                                 >
//                                     <option value="" disabled>Select Type</option>
//                                     <option value="official">Official</option>
//                                     <option value="personal">Personal</option>
//                                 </select>
//                             </div>
//                         </div>

//                         {formData.gate === "Gate A" && (
//                             <div>
//                                 <InputLabel>Target Department</InputLabel>
//                                 <select
//                                     name="department"
//                                     value={formData.department}
//                                     onChange={handleChange}
//                                     required
//                                     className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm appearance-none"
//                                 >
//                                     <option value="" disabled>Select Department</option>
//                                     <option value="Administration">Administration</option>
//                                     <option value="Academics">Academics</option>
//                                     <option value="Farm">Farm</option>
//                                     <option value="Kitchen">Kitchen</option>
//                                     <option value="House Keeping">House Keeping</option>
//                                     <option value="Other">Other / Specify</option>
//                                 </select>
//                             </div>
//                         )}

//                         {formData.department === "Other" && formData.gate === "Gate A" && (
//                              <div>
//                                 <InputLabel>Specify Destination</InputLabel>
//                                 <input
//                                   name="specificDepartment"
//                                   value={formData.specificDepartment}
//                                   onChange={handleChange}
//                                   required
//                                   placeholder="Enter destination details"
//                                   className="w-full bg-slate-900/50 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm placeholder-slate-600"
//                                 />
//                              </div>
//                         )}

//                         <div className="flex justify-between mt-8 pt-6 border-t border-slate-700/50">
//                             <button type="button" onClick={() => setStep(2)} className="text-slate-400 hover:text-white text-sm font-semibold transition-colors px-4 py-2">Back</button>
//                             <button
//                                type="button"
//                                onClick={() => setStep(4)}
//                                disabled={!formData.gate || !formData.nature || (formData.gate === "Gate A" && !formData.department)}
//                                className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-blue-900/20"
//                             >
//                                 Review <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
//                             </button>
//                         </div>
//                      </div>
//                   )}

//                   {/* STEP 4: SUBMIT */}
//                   {step === 4 && (
//                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
//                          <div className="pb-2 mb-2">
//                             <h3 className="text-lg font-bold text-white flex items-center gap-2">
//                                 <Shield className="h-5 w-5 text-emerald-500" /> Confirm Details
//                             </h3>
//                              <p className="text-sm text-slate-400 mt-1">Review information before submission.</p>
//                         </div>

//                         <div className="bg-slate-900/50 p-6 border border-slate-700 rounded-xl relative overflow-hidden">
//                              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
//                                  <div>
//                                      <span className="text-slate-500 block text-xs uppercase tracking-wide mb-1">Visitor Name</span>
//                                      <span className="text-white font-medium">{formData.name}</span>
//                                  </div>
//                                  <div>
//                                      <span className="text-slate-500 block text-xs uppercase tracking-wide mb-1">ID / Passport</span>
//                                      <span className="text-white font-medium">{formData.isUnderage ? <span className="text-amber-400">Underage / Minor</span> : formData.idNumber}</span>
//                                  </div>
//                                  <div>
//                                      <span className="text-slate-500 block text-xs uppercase tracking-wide mb-1">Mobile</span>
//                                      <span className="text-white font-medium">{formData.phone}</span>
//                                  </div>
//                                  <div>
//                                      <span className="text-slate-500 block text-xs uppercase tracking-wide mb-1">Gate</span>
//                                      <span className="text-white font-medium">{formData.gate}</span>
//                                  </div>
//                                   <div className="col-span-2">
//                                      <span className="text-slate-500 block text-xs uppercase tracking-wide mb-1">Destination</span>
//                                      <span className="text-white font-medium">{formData.department === "Other" ? formData.specificDepartment : formData.department || "N/A"}</span>
//                                  </div>
//                              </div>
//                         </div>

//                         <div className="flex gap-4 mt-auto pt-4">
//                             <button
//                                 type="button"
//                                 onClick={() => setStep(3)}
//                                 className="px-6 py-3 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 rounded-lg font-semibold text-sm transition-all"
//                             >
//                                 Edit
//                             </button>
//                             <button
//                                 type="submit"
//                                 disabled={loading}
//                                 className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-lg ${loading ? "bg-slate-700 text-slate-400" : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20"}`}
//                             >
//                                 {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
//                                 {loading ? "Authorizing..." : "Submit Entry"}
//                             </button>
//                         </div>
//                      </div>
//                   )}

//                 </form>
//             </div>
//         </div>

//       </div>
//     </div>
//   );
// }
