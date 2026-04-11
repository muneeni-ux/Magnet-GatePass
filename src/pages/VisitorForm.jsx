import React, { useState, useEffect } from "react";
import axios from "axios";
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
import {
  addVisitorToQueue,
  getQueuedVisitors,
  removeVisitorFromQueue,
} from "../services/IndexedDBService";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const maskIdNumber = (idStr) => {
  if (!idStr) return "-";
  const str = idStr.toString();
  if (str.length <= 4) return str.replace(/./g, '*');
  const first = str.slice(0, 3);
  const last = str.slice(-3);
  const asterisks = '*'.repeat(Math.max(3, str.length - 6));
  return `${first}${asterisks}${last}`;
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
    isUnderage: false,
    isGroup: false,
    groupSize: 1,
    isDisabled: false,
  });

  const [gates, setGates] = useState([]);
  const [activeStaffDeps, setActiveStaffDeps] = useState([]);
  const [autofilling, setAutofilling] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const [gatesRes, deptsRes, staffDepsRes] = await Promise.all([
          axios.get(`${SERVER_URL}/api/locations/gates`),
          axios.get(`${SERVER_URL}/api/locations/departments`),
          axios.get(`${SERVER_URL}/api/visitors/active-staff-departments`),
        ]);
        setGates(gatesRes.data);
        setDepartments(deptsRes.data);
        setActiveStaffDeps(staffDepsRes.data || []);
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      }
    };
    fetchLocations();

    const syncOfflineVisitors = async () => {
      try {
        const queued = await getQueuedVisitors();
        if (queued.length === 0) return;

        toast.loading(`Syncing ${queued.length} offline records...`, {
          id: "offline-sync",
        });

        for (const visitor of queued) {
          await axios.post(`${SERVER_URL}/api/visitors`, visitor);
          await removeVisitorFromQueue(visitor.id);
        }

        toast.success(`Successfully synced ${queued.length} offline records!`, {
          id: "offline-sync",
        });
      } catch (error) {
        console.error("Background sync failed:", error);
        toast.error("Offline sync partially failed. Will retry later.", {
          id: "offline-sync",
        });
      }
    };

    window.addEventListener("online", syncOfflineVisitors);
    if (navigator.onLine) {
      syncOfflineVisitors();
    }
    return () => window.removeEventListener("online", syncOfflineVisitors);
  }, []);

  useEffect(() => {
    const queryPhone = formData.phone?.length >= 10 ? formData.phone : null;
    const queryId = formData.idNumber?.length >= 6 ? formData.idNumber : null;

    if (!queryPhone && !queryId) return;

    const timeoutId = setTimeout(async () => {
      try {
        setAutofilling(true);
        let url = `${SERVER_URL}/api/visitors/search/recent?`;
        if (queryPhone) url += `phone=${queryPhone}&`;
        if (queryId) url += `idNumber=${queryId}`;
        
        const res = await axios.get(url);
        if (res.data) {
           toast.success("Past visitor found. Autofilling details...", { id: 'autofill' });
           setFormData(prev => ({
             ...prev,
             name: prev.name || res.data.name,
             vehicleReg: prev.vehicleReg || res.data.vehicleReg || "",
             isUnderage: prev.isUnderage || res.data.isUnderage || false,
             idNumber: prev.idNumber || res.data.idNumber || ""
           }));
        }
      } catch (err) {
        console.error("Autofill fetch failed", err);
      } finally {
        setAutofilling(false);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [formData.phone, formData.idNumber]);

  const validatePhone = (phone) => {
    if (!phone) return "Required Field";
    if (phone.length < 10) return "Min 10 Digits";
    if (phone.length > 13) return "Max 13 Digits";
    return "";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "gate") {
      setFormData((prev) => ({
        ...prev,
        gate: value,
        department: "", 
        specificDepartment: "",
      }));
      const filtered = departments.filter((d) => d.gateId._id === value);
      setFilteredDepartments(filtered);
    } else if (type === "checkbox" && (name === "isUnderage" || name === "isGroup" || name === "isDisabled")) {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        idNumber: (name === "isUnderage" && checked) ? "" : prev.idNumber,
      }));
    } else if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
      const error = validatePhone(numericValue);
      setErrors((prev) => ({ ...prev, phone: error }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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

    const hasDepartments = departments.some(
      (d) => d.gateId._id === formData.gate,
    );

    if (hasDepartments && !formData.department) {
      newErrors.department = "Department is required";
    }

    if (
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
      const user = JSON.parse(localStorage.getItem("user"));
      let targetPhone = "";
      let recipientName = "Admin";
      const selectedGate = gates.find((g) => g._id === formData.gate);

      if (formData.department === "Other" || !formData.department) {
        targetPhone = selectedGate?.phone || "0711111111"; 
        recipientName = selectedGate?.name || "Gate Admin";
      } else {
        const selectedDept = departments.find(
          (d) => d._id === formData.department,
        );
        if (selectedDept) {
          targetPhone = selectedDept.phone;
          recipientName = selectedDept.name;
        } else {
          targetPhone = selectedGate?.phone || "0711111111"; 
          recipientName = selectedGate?.name || "Gate Admin";
        }
      }

      const gateNameForSMS = selectedGate ? selectedGate.name : formData.gate;
      let finalDepartmentForDB = formData.department;
      if (formData.department === "Other") {
        finalDepartmentForDB = formData.specificDepartment;
      } else {
        const matchedDept = departments.find(
          (d) => d._id === formData.department,
        );
        if (matchedDept) finalDepartmentForDB = matchedDept.name;
      }

      const payload = {
        ...formData,
        department: finalDepartmentForDB,
        gate: gateNameForSMS,
        idNumber: formData.idNumber || undefined,
        recordedBy: user?.id, 
      };

      if (!navigator.onLine) {
        await addVisitorToQueue(payload);
        toast.success("No Internet. Saved locally to sync when connected.", {
          icon: "📡",
        });
      } else {
        try {
          const response = await fetch(`${SERVER_URL}/api/visitors`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            if (response.status >= 500) {
              throw new Error("SERVER_DOWN");
            }
            const errData = await response.json().catch(() => ({}));
            throw new Error(
              errData.error || "Failed to submit visitor data (Validation)",
            );
          }

          const savedVisitor = await response.json();

          if (formData.nature !== 'staff') {
            let smsMessage = `VISITRACK\nVisitor: ${formData.name}\nID: ${formData.isUnderage ? "Minor" : maskIdNumber(formData.idNumber)}\nDest: ${finalDepartmentForDB || "General"}\nGate: ${gateNameForSMS}`;
            if (formData.isDisabled) smsMessage += `\nALERT: Needs assistance/vehicle!`;
            if (formData.isGroup) smsMessage += `\nGroup of ${formData.groupSize}`;
            
            if (savedVisitor.acknowledgmentToken) {
              smsMessage += `\nPlease acknowledge their arrival here: ${window.location.origin}/v/${savedVisitor.acknowledgmentToken}`;
            }

            try {
              await fetch(`${SERVER_URL}/api/sms/send-sms`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: targetPhone, message: smsMessage }),
              });
              console.log(`SMS Sent to ${recipientName} (${targetPhone})`);
            } catch (smsError) {
              console.error("Failed to send department alert SMS", smsError);
            }
          } else {
            console.log("SMS bypassed for staff check-in.");
          }

          toast.success(`Visitor Logged & Alert Sent to ${recipientName}`);
        } catch (fetchErr) {
          if (
            fetchErr.message === "SERVER_DOWN" ||
            fetchErr.name === "TypeError"
          ) {
            console.warn("Backend/DB Offline intercepted. Queuing locally.", fetchErr);
            await addVisitorToQueue(payload);
            toast.success("Service Unreachable. Saved locally to sync when reconnected.", { icon: "📡" });
          } else {
            throw fetchErr;
          }
        }
      }

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
        isGroup: false,
        groupSize: 1,
        isDisabled: false,
      });
      setErrors({});
      setStep(1);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "System Error: Submission Failed");
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] font-sans text-slate-800 dark:text-slate-100 p-4 md:p-6 pt-24 md:pt-[100px] flex justify-center items-start overflow-hidden relative cyber-grid selection:bg-blue-500/30 dark:selection:bg-emerald-500/30">
      
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-blue-500/10 dark:bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-32 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse delay-700"></div>

      <div className="w-full max-w-5xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-white/60 dark:border-slate-800/80 gap-4">
          <div className="flex items-center gap-5">
            <div className="p-3.5 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-emerald-500/10 dark:to-cyan-500/10 rounded-2xl border border-blue-500/20 dark:border-emerald-500/20 shadow-inner group">
              <Scan className="h-7 w-7 text-blue-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                 ENTRY <span className="text-blue-600 dark:text-emerald-400">LOG</span>
              </h1>
              <p className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono mt-1">
                Record & Validate Identity
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/50 dark:bg-slate-900/50 border border-white/60 dark:border-slate-800 shadow-inner self-start md:self-auto">
             <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
             <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest font-mono">System Online</span>
          </div>
        </div>

        <div className="glass-panel dark:glass-panel-dark border border-white/60 dark:border-slate-700/50 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row relative">
          
          {/* Steps Sidebar */}
          <div className="w-full md:w-64 bg-white/40 dark:bg-[#0a0f1c]/80 border-b md:border-b-0 md:border-r border-white/60 dark:border-slate-700/50 p-6 flex md:flex-col justify-between md:justify-start gap-3 overflow-x-auto backdrop-blur-md">
            {[1, 2, 3, 4].map((s) => (
              <button
                key={s}
                onClick={() => (s < step ? setStep(s) : null)}
                disabled={s > step}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[11px] font-extrabold uppercase tracking-widest transition-all w-full whitespace-nowrap shadow-sm font-mono ${
                  step === s
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-emerald-600 dark:to-cyan-600 text-white shadow-[0_4px_15px_rgba(59,130,246,0.3)] dark:shadow-[0_4px_15px_rgba(16,185,129,0.3)] border border-transparent"
                    : step > s
                      ? "bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800 border border-white/60 dark:border-slate-700/60"
                      : "text-slate-400 dark:text-slate-600 cursor-not-allowed border border-transparent"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-6 h-6 rounded-lg text-[10px] ${step === s ? "bg-white/20" : step > s ? "bg-white dark:bg-slate-700 shadow-inner" : "bg-slate-100 dark:bg-slate-800/50"}`}
                >
                  {s < step ? <CheckCircle size={14} className="text-emerald-500" /> : s}
                </span>
                {s === 1 && "Identity Data"}
                {s === 2 && "Visit Infomation"}
                {s === 3 && "Vector Routing"}
                {s === 4 && "Confirmation"}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="flex-1 p-6 md:p-10 relative bg-white/20 dark:bg-transparent backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="h-full flex flex-col relative z-20">
              
              {/* STEP 1: IDENTITY */}
              {step === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="pb-4 mb-4 border-b border-white/60 dark:border-slate-700/50">
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      <User className="h-5 w-5 text-blue-600 dark:text-emerald-400" /> Identity verification
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Underage Toggle */}
                    <label className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${formData.isUnderage ? "bg-blue-600/10 dark:bg-emerald-500/10 border-blue-500/30 dark:border-emerald-500/30 shadow-inner" : "glass-panel dark:glass-panel-dark border-white/60 dark:border-slate-700/50 hover:border-blue-400 dark:hover:border-emerald-500/50"}`}>
                      <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${formData.isUnderage ? "bg-blue-600 dark:bg-emerald-500 border-blue-600 dark:border-emerald-500" : "border-slate-400 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50"}`}>
                        {formData.isUnderage && <CheckCircle size={14} className="text-white dark:text-slate-900" />}
                      </div>
                      <input type="checkbox" name="isUnderage" checked={formData.isUnderage} onChange={handleChange} className="hidden" />
                      <div>
                        <span className="text-[11px] font-extrabold text-slate-900 dark:text-white block uppercase tracking-wide font-mono">Underage</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1 font-medium">Guardian req.</span>
                      </div>
                    </label>

                    {/* Group Toggle */}
                    <label className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${formData.isGroup ? "bg-purple-600/10 dark:bg-indigo-500/10 border-purple-500/30 dark:border-indigo-500/30 shadow-inner" : "glass-panel dark:glass-panel-dark border-white/60 dark:border-slate-700/50 hover:border-blue-400 dark:hover:border-emerald-500/50"}`}>
                      <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${formData.isGroup ? "bg-purple-600 dark:bg-indigo-500 border-purple-600 dark:border-indigo-500" : "border-slate-400 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50"}`}>
                        {formData.isGroup && <CheckCircle size={14} className="text-white dark:text-slate-900" />}
                      </div>
                      <input type="checkbox" name="isGroup" checked={formData.isGroup} onChange={handleChange} className="hidden" />
                      <div>
                        <span className="text-[11px] font-extrabold text-slate-900 dark:text-white block uppercase tracking-wide font-mono">Group Visit</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1 font-medium">Multiple pax</span>
                      </div>
                    </label>

                    {/* Disabled Toggle */}
                    <label className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${formData.isDisabled ? "bg-amber-600/10 border-amber-500/30 shadow-inner" : "glass-panel dark:glass-panel-dark border-white/60 dark:border-slate-700/50 hover:border-amber-400 dark:hover:border-amber-500/50"}`}>
                      <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${formData.isDisabled ? "bg-amber-500 border-amber-500" : "border-slate-400 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50"}`}>
                        {formData.isDisabled && <CheckCircle size={14} className="text-white dark:text-slate-900" />}
                      </div>
                      <input type="checkbox" name="isDisabled" checked={formData.isDisabled} onChange={handleChange} className="hidden" />
                      <div>
                        <span className="text-[11px] font-extrabold text-slate-900 dark:text-white block uppercase tracking-wide font-mono">Disabled</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1 font-medium">Req. assistance</span>
                      </div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-2">
                        <InputLabel>{formData.isGroup ? "Leader's Full Name" : "Official Full Name"}</InputLabel>
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="e.g. John Doe"
                          className="w-full bg-white/50 dark:bg-[#0a0f1c]/60 border border-white/60 dark:border-slate-700/60 text-slate-900 dark:text-white p-3.5 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all font-mono text-sm shadow-inner dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] placeholder-slate-400 dark:placeholder-slate-600"
                        />
                      </div>
                      {formData.isGroup && (
                        <div className="w-24 space-y-2">
                          <InputLabel>Size</InputLabel>
                          <input
                            type="number"
                            name="groupSize"
                            min="2"
                            value={formData.groupSize}
                            onChange={handleChange}
                            required
                            className="w-full bg-white/50 dark:bg-[#0a0f1c]/60 border border-white/60 dark:border-slate-700/60 text-slate-900 dark:text-white p-3.5 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all font-mono text-sm shadow-inner dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] placeholder-slate-400 dark:placeholder-slate-600 text-center"
                          />
                        </div>
                      )}
                    </div>

                    {!formData.isUnderage && (
                      <div className="space-y-2">
                        <InputLabel>ID / Passport Num</InputLabel>
                        <div className="relative">
                          <input
                            name="idNumber"
                            value={formData.idNumber}
                            onChange={handleChange}
                            required={!formData.isUnderage}
                            placeholder="Enter Identity Document #"
                            className="w-full bg-white/50 dark:bg-[#0a0f1c]/60 border border-white/60 dark:border-slate-700/60 text-slate-900 dark:text-white p-3.5 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all font-mono text-sm shadow-inner dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] placeholder-slate-400 dark:placeholder-slate-600"
                          />
                          <IdCard className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end mt-8 pt-6 border-t border-white/60 dark:border-slate-700/50">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={
                        !formData.name ||
                        (!formData.isUnderage && !formData.idNumber)
                      }
                      className="group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-emerald-600 dark:to-cyan-600 hover:from-blue-500 hover:to-indigo-500 dark:hover:from-emerald-500 dark:hover:to-cyan-500 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-800 dark:disabled:to-slate-800 disabled:text-slate-500 text-white px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all shadow-lg shadow-blue-500/20 dark:shadow-emerald-500/20 hover:shadow-blue-500/40 dark:hover:shadow-emerald-500/40 hover:-translate-y-0.5 border border-transparent hover:border-white/20 disabled:border-transparent disabled:shadow-none disabled:transform-none"
                    >
                      Next
                      <ChevronRight
                        size={16}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: CONTACT */}
              {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="pb-4 mb-4 border-b border-white/60 dark:border-slate-700/50">
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      <Phone className="h-5 w-5 text-blue-600 dark:text-emerald-400" /> Visit Info
                    </h3>
                  </div>

                  <div className="space-y-2">
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
                        className={`w-full bg-white/50 dark:bg-[#0a0f1c]/60 border ${errors.phone ? "border-red-500/50 dark:border-red-500/50" : "border-white/60 dark:border-slate-700/60"} text-slate-900 dark:text-white p-3.5 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all font-mono text-sm shadow-inner dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] placeholder-slate-400 dark:placeholder-slate-600`}
                      />
                      {errors.phone && (
                        <div className="absolute top-full left-0 mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-md flex items-center gap-1.5 text-[10px] text-red-500 dark:text-red-400 font-extrabold uppercase tracking-wide">
                          <Info size={12} /> {errors.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  {!formData.isUnderage && (
                    <div className="space-y-2">
                      <InputLabel>Vehicle Registration (Optional)</InputLabel>
                      <div className="relative">
                        <input
                          name="vehicleReg"
                          value={formData.vehicleReg}
                          onChange={handleChange}
                          placeholder="KAA 000A"
                          className="w-full bg-white/50 dark:bg-[#0a0f1c]/60 border border-white/60 dark:border-slate-700/60 text-slate-900 dark:text-white p-3.5 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all font-mono text-sm shadow-inner dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] placeholder-slate-400 dark:placeholder-slate-600 uppercase"
                        />
                        <Car className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/60 dark:border-slate-700/50">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[11px] uppercase tracking-widest font-extrabold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors px-4 py-2"
                    >
                      Go Back
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
                      className="group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-emerald-600 dark:to-cyan-600 hover:from-blue-500 hover:to-indigo-500 dark:hover:from-emerald-500 dark:hover:to-cyan-500 text-white px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all shadow-lg shadow-blue-500/20 dark:shadow-emerald-500/20 hover:shadow-blue-500/40 dark:hover:shadow-emerald-500/40 hover:-translate-y-0.5 border border-transparent hover:border-white/20"
                    >
                      Verify Data
                      <ChevronRight
                        size={16}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PURPOSE */}
              {step === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="pb-4 mb-4 border-b border-white/60 dark:border-slate-700/50">
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      <BookOpen className="h-5 w-5 text-blue-600 dark:text-emerald-400" /> Vector Routing
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <InputLabel>Facility Gate</InputLabel>
                      <div className="relative">
                        <select
                          name="gate"
                          value={formData.gate}
                          onChange={handleChange}
                          required
                          className="w-full bg-white/50 dark:bg-[#0a0f1c]/60 border border-white/60 dark:border-slate-700/60 text-slate-900 dark:text-white p-3.5 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all font-mono text-sm shadow-inner dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] appearance-none cursor-pointer"
                        >
                          <option className="bg-white dark:bg-slate-900" value="" disabled>Select Checkpoint</option>
                          {gates.map((gate) => (
                            <option className="bg-white dark:bg-slate-900" key={gate._id} value={gate._id}>
                              {gate.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <InputLabel>Nature of Visit</InputLabel>
                      <div className="relative">
                        <select
                          name="nature"
                          value={formData.nature}
                          onChange={handleChange}
                          required
                          className="w-full bg-white/50 dark:bg-[#0a0f1c]/60 border border-white/60 dark:border-slate-700/60 text-slate-900 dark:text-white p-3.5 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all font-mono text-sm shadow-inner dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] appearance-none cursor-pointer"
                        >
                          <option className="bg-white dark:bg-slate-900" value="" disabled>Select Type</option>
                          <option className="bg-white dark:bg-slate-900" value="official">Official</option>
                          <option className="bg-white dark:bg-slate-900" value="personal">Personal</option>
                          <option className="bg-white dark:bg-slate-900" value="staff">Staff</option>
                        </select>
                         <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                      </div>
                    </div>
                  </div>

                  {filteredDepartments.length > 0 && (
                    <div className="space-y-2">
                      <InputLabel>Target Node System</InputLabel>
                      <div className="relative">
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          required
                          className="w-full bg-white/50 dark:bg-[#0a0f1c]/60 border border-white/60 dark:border-slate-700/60 text-slate-900 dark:text-white p-3.5 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all font-mono text-sm shadow-inner dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] appearance-none cursor-pointer"
                        >
                          <option className="bg-white dark:bg-slate-900" value="" disabled>Select Target Dept.</option>
                          {filteredDepartments.map((dept) => {
                            const isStaffPresent = activeStaffDeps.includes(dept.name);
                            const isStaffCheckIn = formData.nature === 'staff';
                            const isDeptDisabled = !isStaffPresent && !isStaffCheckIn;
                            
                            return (
                              <option className="bg-white dark:bg-slate-900" key={dept._id} value={dept._id} disabled={isDeptDisabled}>
                                {dept.name} {isDeptDisabled ? "(Offline)" : ""}
                              </option>
                            );
                          })}
                          <option className="bg-white dark:bg-slate-900" value="Other">Other</option>
                        </select>
                         <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                      </div>
                    </div>
                  )}

                  {formData.department === "Other" && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                      <InputLabel>Specify Node Coordinates</InputLabel>
                      <input
                        name="specificDepartment"
                        value={formData.specificDepartment}
                        onChange={handleChange}
                        required
                        placeholder="Log Exact Info..."
                        className="w-full bg-white/50 dark:bg-[#0a0f1c]/60 border border-white/60 dark:border-slate-700/60 text-slate-900 dark:text-white p-3.5 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all font-mono text-sm shadow-inner dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] placeholder-slate-400 dark:placeholder-slate-600"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/60 dark:border-slate-700/50">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-[11px] uppercase tracking-widest font-extrabold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors px-4 py-2"
                    >
                      Go Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      disabled={
                        !formData.gate ||
                        !formData.nature ||
                        (filteredDepartments.length > 0 && !formData.department)
                      }
                      className="group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-emerald-600 dark:to-cyan-600 hover:from-blue-500 hover:to-indigo-500 dark:hover:from-emerald-500 dark:hover:to-cyan-500 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-800 dark:disabled:to-slate-800 disabled:text-slate-500 text-white px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all shadow-lg shadow-blue-500/20 dark:shadow-emerald-500/20 hover:shadow-blue-500/40 dark:hover:shadow-emerald-500/40 hover:-translate-y-0.5 border border-transparent hover:border-white/20 disabled:border-transparent disabled:shadow-none disabled:transform-none"
                    >
                      Preview
                      <ChevronRight
                        size={16}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: SUBMIT */}
              {step === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
                  <div className="pb-4 mb-2 border-b border-white/60 dark:border-slate-700/50">
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      <Shield className="h-5 w-5 text-emerald-500" /> Confirm Sequence
                    </h3>
                  </div>

                  <div className="glass-panel dark:glass-panel-dark bg-white/40 dark:bg-slate-900/40 p-6 sm:p-8 rounded-[1.5rem] border border-white/60 dark:border-slate-700/50 relative overflow-hidden shadow-inner">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500 dark:from-emerald-500 dark:to-cyan-500"></div>
                    
                    <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-extrabold font-mono uppercase tracking-widest mb-1.5">
                          {formData.isGroup ? "Leader Target" : "Entity Name"}
                        </span>
                        <span className="text-slate-900 dark:text-white font-bold flex items-center gap-2 font-mono text-sm">
                          {formData.name}
                          {formData.isGroup && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 rounded-md">Size: {formData.groupSize}</span>}
                          {formData.isDisabled && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-md">Assistance req.</span>}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-extrabold font-mono uppercase tracking-widest mb-1.5">
                          ID Num
                        </span>
                        <span className="text-slate-900 dark:text-white font-bold font-mono text-sm">
                          {formData.isUnderage ? (
                            <span className="text-amber-500 dark:text-amber-400">
                              Minor/Guardian
                            </span>
                          ) : (
                            maskIdNumber(formData.idNumber)
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-extrabold font-mono uppercase tracking-widest mb-1.5">
                          Freq
                        </span>
                        <span className="text-slate-900 dark:text-white font-bold font-mono text-sm">
                          {formData.phone}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-extrabold font-mono uppercase tracking-widest mb-1.5">
                          Gate
                        </span>
                        <span className="text-slate-900 dark:text-white font-bold font-mono text-sm">
                          {gates.find((g) => g._id === formData.gate)?.name ||
                            formData.gate}
                        </span>
                      </div>
                      <div className="col-span-2 pt-4 border-t border-white/60 dark:border-slate-700/50">
                        <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-extrabold font-mono uppercase tracking-widest mb-1.5">
                          Target Location
                        </span>
                        <span className="text-slate-900 dark:text-white font-bold font-mono text-sm">
                          {formData.department === "Other"
                            ? formData.specificDepartment
                            : departments.find(
                                (d) => d._id === formData.department,
                              )?.name ||
                              formData.department ||
                              "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-auto pt-6 border-t border-white/60 dark:border-slate-700/50">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-6 py-3.5 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all shadow-sm"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all shadow-lg border border-transparent ${loading ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed" : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 hover:border-white/20"}`}
                    >
                      {loading && (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      )}
                      {loading ? "Submitting..." : "Submit"}
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
