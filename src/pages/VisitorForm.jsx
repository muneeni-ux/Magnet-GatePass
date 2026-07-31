import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  User,
  IdCard,
  Car,
  Phone,
  Building2,
  CheckCircle,
  Shield,
  UserCheck,
  Info,
  Users,
  HeartHandshake
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
  // eslint-disable-next-line no-unused-vars
  const [autofilling, setAutofilling] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
    if (!phone) return "Phone number is required";
    if (phone.length < 10) return "Min 10 digits";
    if (phone.length > 13) return "Max 13 digits";
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
    } else if (name === "idNumber") {
      const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, "");
      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    } else if (name === "name" || name === "vehicleReg" || name === "specificDepartment") {
      const sanitizedValue = value.replace(/[^a-zA-Z0-9\s]/g, "");
      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full Name is required";

    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    if (!formData.isUnderage) {
      if (!formData.idNumber.trim()) {
        newErrors.idNumber = "ID/Passport Number is required";
      } else if (formData.idNumber.length < 8 || formData.idNumber.length > 9) {
        newErrors.idNumber = "ID/Passport must be 8 or 9 characters";
      }
    }

    if (!formData.gate) newErrors.gate = "Entry Gate is required";
    if (!formData.nature) newErrors.nature = "Purpose of Visit is required";

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
      newErrors.specificDepartment = "Please specify the location";
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
          targetPhone = selectedGate?.phone || "0111949314"; 
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
        toast.success("Saved offline. Will sync when reconnected.", {
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
              errData.error || "Failed to submit visitor details",
            );
          }

          const savedVisitor = await response.json();

          if (formData.nature !== 'staff') {
            let smsMessage = `VISITRACK\nVisitor: ${formData.name}\nID: ${formData.isUnderage ? "Minor" : maskIdNumber(formData.idNumber)}\nDest: ${finalDepartmentForDB || "General"}\nGate: ${gateNameForSMS}`;
            if (formData.isDisabled) smsMessage += `\nALERT: Needs assistance/vehicle!`;
            if (formData.isGroup) smsMessage += `\nGroup of ${formData.groupSize}`;
            
            if (savedVisitor.acknowledgmentToken) {
              smsMessage += `\nPlease confirm visitor arrival here: ${window.location.origin}/v/${savedVisitor.acknowledgmentToken}`;
            }

            try {
              await fetch(`${SERVER_URL}/api/sms/send-sms`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: targetPhone, message: smsMessage }),
              });
            } catch (smsError) {
              console.error("Failed to send department SMS notification", smsError);
            }
          }

          toast.success(`Visitor checked in! Alert sent to ${recipientName}`);
        } catch (fetchErr) {
          if (
            fetchErr.message === "SERVER_DOWN" ||
            fetchErr.name === "TypeError"
          ) {
            await addVisitorToQueue(payload);
            toast.success("Saved offline. Will sync when reconnected.", { icon: "📡" });
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
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to submit visitor form");
    } finally {
      setLoading(false);
    }
  };

  const InputLabel = ({ children, required }) => (
    <label className="block text-xs uppercase font-extrabold tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 font-mono">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );

  const selectedGateObj = gates.find((g) => g._id === formData.gate);
  const selectedDeptObj = departments.find((d) => d._id === formData.department);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] font-sans text-slate-800 dark:text-slate-100 px-3 sm:px-6 md:px-8 pt-20 md:pt-24 pb-28 md:pb-12 flex justify-center items-start relative cyber-grid overflow-hidden w-full max-w-full">
      
      {/* Background Ambient Orbs (Contained) */}
      <div className="hidden sm:block absolute top-1/4 left-0 w-[400px] h-[400px] bg-blue-500/10 dark:bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
      <div className="hidden sm:block absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse delay-700"></div>

      <div className="w-full max-w-6xl relative z-10 animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-emerald-500/10 dark:to-cyan-500/10 rounded-2xl border border-blue-500/20 dark:border-emerald-500/20 shadow-sm shrink-0">
              <UserCheck className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                 VISITOR <span className="text-blue-600 dark:text-emerald-400">CHECK-IN</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Register a new visitor entry quickly and easily
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm self-start sm:self-auto">
             <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
             <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-mono">System Active</span>
          </div>
        </div>

        {/* Unified 1-Page Form Layout */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6 w-full">
          
          {/* Main Input Sections */}
          <div className="lg:col-span-2 space-y-5 md:space-y-6 w-full">
            
            {/* Card 1: Special Categories & Personal Info */}
            <div className="glass-panel dark:glass-panel-dark bg-white/80 dark:bg-slate-900/80 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-white/80 dark:border-slate-800 shadow-lg backdrop-blur-md w-full">
              
              <div className="flex items-center gap-3 pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-slate-200/80 dark:border-slate-800">
                <User className="h-5 w-5 text-blue-600 dark:text-emerald-400 shrink-0" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Visitor Details
                </h2>
              </div>

              {/* Special Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-5 sm:mb-6">
                
                {/* Minor Toggle */}
                <label className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border cursor-pointer transition-all ${formData.isUnderage ? "bg-blue-500/10 dark:bg-emerald-500/10 border-blue-500/40 dark:border-emerald-500/40" : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"}`}>
                  <input type="checkbox" name="isUnderage" checked={formData.isUnderage} onChange={handleChange} className="w-4 h-4 rounded text-blue-600 dark:text-emerald-500 focus:ring-blue-500 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Minor / Child</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Under 18 yrs</span>
                  </div>
                </label>

                {/* Group Toggle */}
                <label className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border cursor-pointer transition-all ${formData.isGroup ? "bg-purple-500/10 border-purple-500/40" : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"}`}>
                  <input type="checkbox" name="isGroup" checked={formData.isGroup} onChange={handleChange} className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Group Entry</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Multiple visitors</span>
                  </div>
                </label>

                {/* Assistance Toggle */}
                <label className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border cursor-pointer transition-all ${formData.isDisabled ? "bg-amber-500/10 border-amber-500/40" : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"}`}>
                  <input type="checkbox" name="isDisabled" checked={formData.isDisabled} onChange={handleChange} className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Special Care</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Assistance needed</span>
                  </div>
                </label>

              </div>

              {/* Input Fields */}
              <div className="space-y-4">
                
                {/* Visitor Name & Group Size */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <InputLabel required>{formData.isGroup ? "Main Contact / Leader Name" : "Visitor Full Name"}</InputLabel>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. John Doe"
                      className={`w-full bg-white dark:bg-slate-950 border ${errors.name ? "border-red-500" : "border-slate-200 dark:border-slate-800"} text-slate-900 dark:text-white p-3 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 text-sm shadow-inner transition-all`}
                    />
                    {errors.name && <p className="text-[11px] text-red-500 mt-1 font-bold">{errors.name}</p>}
                  </div>

                  {formData.isGroup && (
                    <div className="w-full sm:w-28">
                      <InputLabel required>Group Size</InputLabel>
                      <input
                        type="number"
                        name="groupSize"
                        min="2"
                        value={formData.groupSize}
                        onChange={handleChange}
                        required
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-3 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 text-sm text-center shadow-inner font-mono font-bold"
                      />
                    </div>
                  )}
                </div>

                {/* ID / Passport & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {!formData.isUnderage ? (
                    <div>
                      <InputLabel required>ID / Passport Number</InputLabel>
                      <div className="relative">
                        <input
                          name="idNumber"
                          value={formData.idNumber}
                          onChange={handleChange}
                          required={!formData.isUnderage}
                          maxLength={9}
                          placeholder="e.g. 12345678"
                          className={`w-full bg-white dark:bg-slate-950 border ${errors.idNumber ? "border-red-500" : "border-slate-200 dark:border-slate-800"} text-slate-900 dark:text-white p-3 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 text-sm font-mono shadow-inner transition-all`}
                        />
                        <IdCard className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 shrink-0" />
                      </div>
                      {errors.idNumber ? (
                        <p className="text-[11px] text-red-500 mt-1 font-bold">{errors.idNumber}</p>
                      ) : (
                        <p className="text-[10px] text-slate-400 mt-1">Must be 8 or 9 digits/characters</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <InputLabel>ID / Passport</InputLabel>
                      <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-700">
                        Minor (Guardian Verification Required)
                      </div>
                    </div>
                  )}

                  <div>
                    <InputLabel required>Phone Number {formData.isUnderage && "(Guardian)"}</InputLabel>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        maxLength={10}
                        placeholder="07XXXXXXXX"
                        className={`w-full bg-white dark:bg-slate-950 border ${errors.phone ? "border-red-500" : "border-slate-200 dark:border-slate-800"} text-slate-900 dark:text-white p-3 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 text-sm font-mono shadow-inner transition-all`}
                      />
                      <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 shrink-0" />
                    </div>
                    {errors.phone && <p className="text-[11px] text-red-500 mt-1 font-bold">{errors.phone}</p>}
                  </div>

                </div>

                {/* Vehicle Plate Number */}
                {!formData.isUnderage && (
                  <div>
                    <InputLabel>Vehicle Plate Number (Optional)</InputLabel>
                    <div className="relative">
                      <input
                        name="vehicleReg"
                        value={formData.vehicleReg}
                        onChange={handleChange}
                        placeholder="e.g. KAA 123A"
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-3 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 text-sm font-mono uppercase shadow-inner transition-all"
                      />
                      <Car className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 shrink-0" />
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Card 2: Gate & Location Details */}
            <div className="glass-panel dark:glass-panel-dark bg-white/80 dark:bg-slate-900/80 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-white/80 dark:border-slate-800 shadow-lg backdrop-blur-md w-full">
              
              <div className="flex items-center gap-3 pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-slate-200/80 dark:border-slate-800">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-emerald-400 shrink-0" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Gate & Destination
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Gate Selector */}
                <div>
                  <InputLabel required>Entry Gate</InputLabel>
                  <select
                    name="gate"
                    value={formData.gate}
                    onChange={handleChange}
                    required
                    className={`w-full bg-white dark:bg-slate-950 border ${errors.gate ? "border-red-500" : "border-slate-200 dark:border-slate-800"} text-slate-900 dark:text-white p-3 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 text-sm shadow-inner transition-all cursor-pointer`}
                  >
                    <option value="" disabled>Select Entry Gate</option>
                    {gates.map((gate) => (
                      <option key={gate._id} value={gate._id}>
                        {gate.name}
                      </option>
                    ))}
                  </select>
                  {errors.gate && <p className="text-[11px] text-red-500 mt-1 font-bold">{errors.gate}</p>}
                </div>

                {/* Purpose Selector */}
                <div>
                  <InputLabel required>Purpose of Visit</InputLabel>
                  <select
                    name="nature"
                    value={formData.nature}
                    onChange={handleChange}
                    required
                    className={`w-full bg-white dark:bg-slate-950 border ${errors.nature ? "border-red-500" : "border-slate-200 dark:border-slate-800"} text-slate-900 dark:text-white p-3 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 text-sm shadow-inner transition-all cursor-pointer`}
                  >
                    <option value="" disabled>Select Purpose</option>
                    <option value="official">Official Visit</option>
                    <option value="personal">Personal Visit</option>
                    <option value="staff">Staff Check-in</option>
                  </select>
                  {errors.nature && <p className="text-[11px] text-red-500 mt-1 font-bold">{errors.nature}</p>}
                </div>

              </div>

              {/* Department / Office Selection */}
              {filteredDepartments.length > 0 && (
                <div className="mt-4">
                  <InputLabel required>Department / Office to Visit</InputLabel>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    className={`w-full bg-white dark:bg-slate-950 border ${errors.department ? "border-red-500" : "border-slate-200 dark:border-slate-800"} text-slate-900 dark:text-white p-3 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 text-sm shadow-inner transition-all cursor-pointer`}
                  >
                    <option value="" disabled>Select Department</option>
                    {filteredDepartments.map((dept) => {
                      const isStaffPresent = activeStaffDeps.includes(dept.name);
                      const isStaffCheckIn = formData.nature === 'staff';
                      const isDeptDisabled = !isStaffPresent && !isStaffCheckIn;
                      
                      return (
                        <option key={dept._id} value={dept._id} disabled={isDeptDisabled}>
                          {dept.name} {isDeptDisabled ? "(Offline / Staff Away)" : ""}
                        </option>
                      );
                    })}
                    <option value="Other">Other (Specify below)</option>
                  </select>
                  {errors.department && <p className="text-[11px] text-red-500 mt-1 font-bold">{errors.department}</p>}
                </div>
              )}

              {/* Specific Location if Other */}
              {formData.department === "Other" && (
                <div className="mt-4 animate-in slide-in-from-top-2">
                  <InputLabel required>Specify Office / Person to Visit</InputLabel>
                  <input
                    name="specificDepartment"
                    value={formData.specificDepartment}
                    onChange={handleChange}
                    required
                    placeholder="Enter office name or host..."
                    className={`w-full bg-white dark:bg-slate-950 border ${errors.specificDepartment ? "border-red-500" : "border-slate-200 dark:border-slate-800"} text-slate-900 dark:text-white p-3 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 text-sm shadow-inner transition-all`}
                  />
                  {errors.specificDepartment && <p className="text-[11px] text-red-500 mt-1 font-bold">{errors.specificDepartment}</p>}
                </div>
              )}

            </div>

          </div>

          {/* Right Column / Live Summary & Submission Card */}
          <div className="space-y-6 w-full">
            <div className="glass-panel dark:glass-panel-dark bg-white/90 dark:bg-slate-900/90 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-white/80 dark:border-slate-800 shadow-xl backdrop-blur-md lg:sticky lg:top-24 w-full">
              
              <div className="flex items-center gap-3 pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-slate-200/80 dark:border-slate-800">
                <Shield className="h-5 w-5 text-blue-600 dark:text-emerald-400 shrink-0" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Check-In Summary
                </h2>
              </div>

              <div className="space-y-3 sm:space-y-4 text-xs font-mono mb-6 sm:mb-8">
                
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Visitor Name</span>
                  <span className="text-slate-900 dark:text-white font-extrabold text-sm block truncate mt-0.5">
                    {formData.name || <span className="text-slate-400 italic font-sans text-xs">Not entered</span>}
                  </span>
                  {formData.isGroup && (
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-md font-bold">
                      Group of {formData.groupSize}
                    </span>
                  )}
                  {formData.isDisabled && (
                    <span className="inline-block mt-1 ml-1 text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md font-bold">
                      Assistance
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">ID / Passport</span>
                    <span className="text-slate-900 dark:text-white font-bold block truncate mt-0.5">
                      {formData.isUnderage ? (
                        "Minor"
                      ) : (
                        maskIdNumber(formData.idNumber) || "-"
                      )}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Phone</span>
                    <span className="text-slate-900 dark:text-white font-bold block truncate mt-0.5">
                      {formData.phone || "-"}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Entry Gate</span>
                  <span className="text-slate-900 dark:text-white font-bold block truncate mt-0.5">
                    {selectedGateObj?.name || <span className="text-slate-400 italic font-sans text-xs">Select gate</span>}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Destination</span>
                  <span className="text-slate-900 dark:text-white font-bold block truncate mt-0.5">
                    {formData.department === "Other" 
                      ? (formData.specificDepartment || "Other Specified")
                      : (selectedDeptObj?.name || <span className="text-slate-400 italic font-sans text-xs">Select department</span>)}
                  </span>
                </div>

              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 py-3.5 sm:py-4 px-6 rounded-2xl font-bold uppercase tracking-wider text-xs sm:text-sm transition-all shadow-lg border border-transparent ${
                  loading
                    ? "bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-emerald-500 dark:to-teal-600 hover:from-blue-500 hover:to-indigo-500 dark:hover:from-emerald-400 dark:hover:to-teal-500 text-white shadow-blue-500/20 dark:shadow-emerald-500/20 hover:shadow-xl hover:-translate-y-0.5"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-5 h-5" />
                    <span>Check In Visitor</span>
                  </>
                )}
              </button>

            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
