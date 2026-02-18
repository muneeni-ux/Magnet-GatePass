import React, { useState } from "react";
import { User, IdCard, Car, Phone, BookOpen, Baby, AlertCircle, CheckCircle, ChevronRight, FileText, Shield, Scan } from "lucide-react";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation check
    const phoneError = validatePhone(formData.phone);
    if (phoneError) {
      setErrors((prev) => ({ ...prev, phone: phoneError }));
      toast.error(`INPUT ERROR: ${phoneError}`);
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
      toast.success("ENTRY LOGGED: SUCCESS", {
          style: { background: "#0f172a", color: "#4ade80", border: "1px solid #22c55e", fontFamily: "monospace" }
      });

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
      toast.error("SYSTEM ERROR: SUBMISSION FAILED", {
          style: { background: "#450a0a", color: "#f87171", border: "1px solid #ef4444", fontFamily: "monospace" }
      });
    } finally {
      setLoading(false);
    }
  };

  const InputLabel = ({ children }) => (
      <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">
          {children}
      </label>
  );

  return (
    <div className="min-h-screen items-center justify-center bg-slate-950 font-mono text-blue-100 p-4 md:p-6 pt-24 md:pt-28 flex overflow-hidden relative">
      
       {/* Background Grid */}
       <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
            style={{
                backgroundImage: "linear-gradient(#1e40af 1px, transparent 1px), linear-gradient(90deg, #1e40af 1px, transparent 1px)",
                backgroundSize: "40px 40px"
            }}>
        </div>

      <div className="w-full max-w-4xl relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-blue-900/50 pb-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-900/20 rounded-md border border-blue-500/30">
                    <Scan className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                     <h1 className="text-2xl font-bold text-white uppercase tracking-widest">Entry Protocol</h1>
                     <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                         <span className="text-[10px] text-green-500 font-bold tracking-wider">SYSTEM ONLINE</span>
                     </div>
                </div>
            </div>
            <div className="hidden md:block text-right">
                <span className="text-[10px] text-slate-500 block uppercase tracking-widest">Secure Clearance</span>
                <span className="text-xs text-blue-300 font-mono">AUTH-LEVEL-1</span>
            </div>
        </div>
        
        {/* Progress Bar */}
        <div className="bg-slate-900/50 border border-blue-900/30 rounded-full h-1 w-full mb-8 relative overflow-hidden">
             <div 
                className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.6)]" 
                style={{ width: `${(step / 4) * 100}%` }}
             ></div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-blue-900/50 rounded-lg shadow-[0_0_50px_rgba(30,58,138,0.2)] overflow-hidden flex flex-col md:flex-row">
            
            {/* Steps Sidebar */}
            <div className="w-full md:w-1/4 bg-slate-950/80 border-b md:border-b-0 md:border-r border-blue-900/50 p-4 md:p-6 flex md:flex-col justify-between md:justify-start gap-2 overflow-x-auto">
                 {[1, 2, 3, 4].map((s) => (
                    <button
                        key={s}
                        onClick={() => s < step ? setStep(s) : null}
                        disabled={s > step}
                        className={`flex items-center gap-3 px-4 py-3 rounded-sm text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                            step === s 
                            ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-blue-400" 
                            : step > s 
                                ? "bg-slate-900 text-blue-400 border border-blue-900/30 hover:bg-slate-800"
                                : "text-slate-600 cursor-not-allowed opacity-50"
                        }`}
                    >
                         <span className="font-mono">{s < step ? <CheckCircle size={14}/> : `0${s}`}</span>
                         {s === 1 && "Identity"}
                         {s === 2 && "Contact"}
                         {s === 3 && "Purpose"}
                         {s === 4 && "Confirm"}
                    </button>
                 ))}
            </div>

            {/* Form Content */}
            <div className="flex-1 p-6 md:p-8 relative">
                <form onSubmit={handleSubmit} className="h-full flex flex-col relative z-20">
                    
                  {/* STEP 1: IDENTITY */}
                  {step === 1 && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between border-b border-blue-900/30 pb-2 mb-4">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-500" /> Phase 01: Identification
                            </h3>
                        </div>

                       {/* Underage Toggle */}
                       <label className={`flex items-center gap-4 p-4 border rounded-sm cursor-pointer transition-all ${formData.isUnderage ? "bg-blue-900/20 border-blue-500/50" : "bg-slate-950/50 border-slate-700 hover:border-slate-600"}`}>
                           <div className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-colors ${formData.isUnderage ? "bg-blue-500 border-blue-500" : "border-slate-500"}`}>
                                {formData.isUnderage && <CheckCircle size={14} className="text-white" />}
                           </div>
                           <input
                             type="checkbox"
                             name="isUnderage"
                             checked={formData.isUnderage}
                             onChange={handleChange}
                             className="hidden"
                           />
                           <div>
                               <span className="text-xs font-bold text-white uppercase tracking-wider block">Underage Visitor Protocol</span>
                               <span className="text-[10px] text-slate-400 block">Exempt from Government ID requirement. Guardian details required.</span>
                           </div>
                       </label>

                       <div>
                           <InputLabel>Full Legal Name</InputLabel>
                           <input
                             name="name"
                             value={formData.name}
                             onChange={handleChange}
                             required
                             placeholder="ENTER FULL NAME"
                             className="w-full bg-slate-950/50 border border-blue-900/30 text-blue-100 p-3 rounded-sm focus:outline-none focus:border-blue-500 focus:bg-slate-900/80 transition-all font-mono text-xs md:text-sm placeholder-slate-700"
                           />
                       </div>

                       {!formData.isUnderage && (
                           <div>
                               <InputLabel>Identification Document No.</InputLabel>
                               <div className="relative">
                                   <input
                                     name="idNumber"
                                     value={formData.idNumber}
                                     onChange={handleChange}
                                     required={!formData.isUnderage}
                                     placeholder="ID NO. / PASSPORT"
                                     className="w-full bg-slate-950/50 border border-blue-900/30 text-blue-100 p-3 rounded-sm focus:outline-none focus:border-blue-500 focus:bg-slate-900/80 transition-all font-mono text-xs md:text-sm placeholder-slate-700"
                                   />
                                   <IdCard className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 h-4 w-4" />
                               </div>
                           </div>
                       )}

                        <div className="flex justify-end mt-auto pt-6">
                            <button
                              type="button"
                              onClick={() => setStep(2)}
                              disabled={!formData.name || (!formData.isUnderage && !formData.idNumber)}
                              className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white px-8 py-3 rounded-sm font-bold text-xs tracking-widest uppercase transition-all"
                            >
                                Proceed <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                  )}

                  {/* STEP 2: CONTACT */}
                  {step === 2 && (
                    <div className="space-y-6 animate-fade-in">
                         <div className="flex items-center justify-between border-b border-blue-900/30 pb-2 mb-4">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <Phone className="h-4 w-4 text-blue-500" /> Phase 02: Contact Data
                            </h3>
                        </div>

                        <div>
                            <InputLabel>Mobile Number {formData.isUnderage && "(Guardian)"}</InputLabel>
                            <div className="relative">
                                <input
                                  type="tel"
                                  name="phone"
                                  value={formData.phone}
                                  onChange={handleChange}
                                  required
                                  maxLength={13}
                                  placeholder="07XXXXXXXX"
                                  className={`w-full bg-slate-950/50 border ${errors.phone ? "border-red-500 shake" : "border-blue-900/30"} text-blue-100 p-3 rounded-sm focus:outline-none focus:border-blue-500 focus:bg-slate-900/80 transition-all font-mono text-xs md:text-sm placeholder-slate-700`}
                                />
                                {errors.phone && (
                                    <div className="absolute top-full left-0 mt-1 flex items-center gap-1 text-[10px] text-red-500 font-bold uppercase tracking-wider">
                                        <AlertCircle size={10} /> {errors.phone}
                                    </div>
                                )}
                            </div>
                        </div>

                        {!formData.isUnderage && (
                             <div>
                                <InputLabel>Vehicle Registration (Optional)</InputLabel>
                                <div className="relative">
                                    <input
                                      name="vehicleReg"
                                      value={formData.vehicleReg}
                                      onChange={handleChange}
                                      placeholder="KAA 000A"
                                      className="w-full bg-slate-950/50 border border-blue-900/30 text-blue-100 p-3 rounded-sm focus:outline-none focus:border-blue-500 focus:bg-slate-900/80 transition-all font-mono text-xs md:text-sm placeholder-slate-700 uppercase"
                                    />
                                    <Car className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 h-4 w-4" />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between mt-auto pt-6">
                            <button type="button" onClick={() => setStep(1)} className="text-slate-500 hover:text-blue-400 text-xs font-bold uppercase tracking-widest transition-colors">← Back</button>
                            <button
                              type="button"
                              onClick={() => {
                                const err = validatePhone(formData.phone);
                                if (err) { setErrors(p => ({...p, phone: err})); toast.error(err); }
                                else setStep(3);
                              }}
                              className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-sm font-bold text-xs tracking-widest uppercase transition-all"
                            >
                                Proceed <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                  )}

                  {/* STEP 3: PURPOSE */}
                  {step === 3 && (
                     <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between border-b border-blue-900/30 pb-2 mb-4">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-blue-500" /> Phase 03: Visit Intent
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel>Entry Gate</InputLabel>
                                <select
                                    name="gate"
                                    value={formData.gate}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-slate-950/50 border border-blue-900/30 text-blue-100 p-3 rounded-sm focus:outline-none focus:border-blue-500 focus:bg-slate-900/80 transition-all font-mono text-xs md:text-sm appearance-none"
                                >
                                    <option value="" disabled>SELECT GATE...</option>
                                    <option value="Gate A">GATE A (MAIN)</option>
                                    <option value="Gate B-mauzo">GATE B (MAUZO)</option>
                                </select>
                            </div>
                            <div>
                                <InputLabel>Visit Nature</InputLabel>
                                <select
                                    name="nature"
                                    value={formData.nature}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-slate-950/50 border border-blue-900/30 text-blue-100 p-3 rounded-sm focus:outline-none focus:border-blue-500 focus:bg-slate-900/80 transition-all font-mono text-xs md:text-sm appearance-none"
                                >
                                    <option value="" disabled>SELECT TYPE...</option>
                                    <option value="official">OFFICIAL</option>
                                    <option value="personal">PERSONAL</option>
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
                                    className="w-full bg-slate-950/50 border border-blue-900/30 text-blue-100 p-3 rounded-sm focus:outline-none focus:border-blue-500 focus:bg-slate-900/80 transition-all font-mono text-xs md:text-sm appearance-none"
                                >
                                    <option value="" disabled>SELECT DEPT...</option>
                                    <option value="Administration">ADMINISTRATION</option>
                                    <option value="Academics">ACADEMICS</option>
                                    <option value="Farm">FARM</option>
                                    <option value="Kitchen">KITCHEN</option>
                                    <option value="House Keeping">HOUSE KEEPING</option>
                                    <option value="Other">OTHER / SPECIFY</option>
                                </select>
                            </div>
                        )}

                        {formData.department === "Other" && formData.gate === "Gate A" && (
                             <div>
                                <InputLabel>Specify Destination</InputLabel>
                                <input
                                  name="specificDepartment"
                                  value={formData.specificDepartment}
                                  onChange={handleChange}
                                  required
                                  placeholder="ENTER DESTINATION"
                                  className="w-full bg-slate-950/50 border border-blue-900/30 text-blue-100 p-3 rounded-sm focus:outline-none focus:border-blue-500 focus:bg-slate-900/80 transition-all font-mono text-xs md:text-sm placeholder-slate-700 uppercase"
                                />
                             </div>
                        )}

                        <div className="flex justify-between mt-auto pt-6">
                            <button type="button" onClick={() => setStep(2)} className="text-slate-500 hover:text-blue-400 text-xs font-bold uppercase tracking-widest transition-colors">← Back</button>
                            <button
                              type="button"
                              onClick={() => setStep(4)}
                              disabled={!formData.gate || !formData.nature || (formData.gate === "Gate A" && !formData.department)}
                              className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white px-8 py-3 rounded-sm font-bold text-xs tracking-widest uppercase transition-all"
                            >
                                Verify <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                     </div>
                  )}

                  {/* STEP 4: SUBMIT */}
                  {step === 4 && (
                     <div className="space-y-6 animate-fade-in text-center h-full flex flex-col justify-center">
                         <div className="border-b border-blue-900/30 pb-2 mb-4 text-left">
                            <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider flex items-center gap-2">
                                <Shield className="h-4 w-4" /> Phase 04: Authorization
                            </h3>
                        </div>

                        <div className="bg-slate-950/50 p-6 border border-blue-900/30 rounded-sm text-left mb-6 relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-2 opacity-50"><FileText size={40} className="text-slate-800" /></div>
                             <div className="space-y-2 text-xs font-mono">
                                 <div className="flex justify-between"><span className="text-slate-500">VISITOR:</span> <span className="text-white uppercase">{formData.name}</span></div>
                                 <div className="flex justify-between"><span className="text-slate-500">ID REF:</span> <span className="text-white uppercase">{formData.isUnderage ? "MINOR" : formData.idNumber}</span></div>
                                 <div className="flex justify-between"><span className="text-slate-500">CONTACT:</span> <span className="text-white uppercase">{formData.phone}</span></div>
                                 <div className="flex justify-between"><span className="text-slate-500">ACCESS PT:</span> <span className="text-white uppercase">{formData.gate}</span></div>
                                 <div className="flex justify-between"><span className="text-slate-500">DESTINATION:</span> <span className="text-white uppercase">{formData.department === "Other" ? formData.specificDepartment : formData.department}</span></div>
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-auto">
                            <button
                                type="button"
                                onClick={() => setStep(3)}
                                className="px-4 py-3 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 rounded-sm font-bold text-xs tracking-widest uppercase transition-all"
                            >
                                Modify
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-sm font-bold text-xs tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:shadow-[0_0_30px_rgba(22,163,74,0.5)] ${loading ? "bg-slate-800 text-slate-500" : "bg-green-600 hover:bg-green-500 text-white"}`}
                            >
                                {loading ? "UPLOADING..." : "AUTHORIZE ENTRY"}
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