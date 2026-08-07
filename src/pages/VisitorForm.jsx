// src/pages/VisitorForm.jsx
import React, { useState, useEffect } from "react";
import { User, IdCard, Car, Phone, BookOpen, Users, CheckCircle, UserCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import { saveOfflineCheckin } from "../utils/offlineSync";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export default function VisitorForm() {
  const [formData, setFormData] = useState({
    name: "",
    isUnderage: false,
    idNumber: "",
    phone: "",
    vehicleReg: "",
    department: "",
    specificDepartment: "",
    gate: "",
    nature: "",
    isGroup: false,
    groupSize: 1,
  });

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  // Frequent visitors lists for suggestion matching
  const [history, setHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activeInput, setActiveInput] = useState(null); // 'name' | 'idNumber'

  // Fetch unique historic records for suggestions
  useEffect(() => {
    const fetchHistoricRecords = async () => {
      try {
        const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
        const res = await fetch(`${SERVER_URL}/api/visitors`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Filter unique visitors by ID
          const unique = [];
          const map = new Map();
          for (const item of data) {
            if (!map.has(item.idNumber)) {
              map.set(item.idNumber, true);
              unique.push({
                name: item.name,
                idNumber: item.idNumber,
                phone: item.phone,
                vehicleReg: item.vehicleReg || "",
              });
            }
          }
          setHistory(unique);
        }
      } catch (err) {
        console.error("Could not pre-load frequent visitors:", err);
      }
    };
    fetchHistoricRecords();
  }, []);

  // -------------------------------------------------------------
  // VALIDATIONS ENGINE
  // -------------------------------------------------------------
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "name":
        if (value.trim().length === 0) {
          error = "Full Name is required.";
        } else {
          const words = value.trim().split(/\s+/);
          if (words.length < 2) {
            error = "Please enter both First and Last name.";
          } else if (words.some((w) => w.length < 2)) {
            error = "Each name must be at least 2 characters.";
          }
        }
        break;
      case "idNumber":
        if (formData.isUnderage) {
          error = "";
        } else if (value.trim().length === 0) {
          error = "ID Number is required.";
        } else if (!/^[A-Za-z0-9\s-]{4,12}$/.test(value)) {
          error = "ID must be between 4 and 12 characters (alphanumeric).";
        }
        break;
      case "phone":
        if (value.trim().length === 0) {
          error = formData.isUnderage ? "Guardian/Parent phone number is required." : "Phone number is required.";
        } else if (!/^\+?[0-9\s-]{9,13}$/.test(value)) {
          error = "Enter a valid phone number (9 to 13 digits).";
        }
        break;
      case "vehicleReg":
        if (value.trim().length > 0 && !/^[A-Za-z0-9\s-]{4,10}$/.test(value)) {
          error = "Vehicle Registration format is invalid (4-10 characters).";
        }
        break;
      case "groupSize":
        if (formData.isGroup && (parseInt(value) < 2 || isNaN(value))) {
          error = "Group size must be at least 2 for a group visit.";
        }
        break;
      case "gate":
        if (!value) error = "Selecting a gate is required.";
        break;
      case "nature":
        if (!value) error = "Selecting visit nature is required.";
        break;
      case "department":
        if (formData.gate === "Gate A" && !value) {
          error = "Please specify a destination department.";
        }
        break;
      case "specificDepartment":
        if (formData.gate === "Gate A" && formData.department === "Other" && value.trim().length === 0) {
          error = "Specify destination department.";
        }
        break;
      default:
        break;
    }
    return error;
  };

  const validateStep = (currentStep) => {
    let stepFields = [];
    if (currentStep === 1) {
      stepFields = ["name", "idNumber"];
    } else if (currentStep === 2) {
      stepFields = ["phone", "vehicleReg", "groupSize"];
    } else if (currentStep === 3) {
      stepFields = ["gate", "nature", "department", "specificDepartment"];
    }

    const stepErrors = {};
    let isValid = true;

    stepFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        stepErrors[field] = error;
        isValid = false;
      }
    });

    setErrors((prev) => ({ ...prev, ...stepErrors }));
    return isValid;
  };

  const handleNextStep = (next) => {
    if (validateStep(step)) {
      setStep(next);
      setErrors({});
    } else {
      toast.error("Please correct the form errors before proceeding.");
    }
  };

  // -------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Enforce maximum 12 characters on ID/Passport
    if (name === "idNumber" && value.length > 12) return;

    let finalVal = type === "checkbox" ? checked : value;
    
    // Enforce uppercase on Vehicle Registration
    if (name === "vehicleReg") {
      finalVal = value.toUpperCase();
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: finalVal };
      
      // Auto clear/reset ID number if isUnderage is toggled
      if (name === "isUnderage" && finalVal) {
        updated.idNumber = "";
      }

      // Auto reset departments if Gate B is chosen
      if (name === "gate" && finalVal === "Gate B-mauzo") {
        updated.department = "";
        updated.specificDepartment = "";
      }

      // Reset group size back to 1 if group is unchecked
      if (name === "isGroup" && !finalVal) {
        updated.groupSize = 1;
      }

      return updated;
    });

    // Clear specific field errors
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name] : "" }));
    }
    if (name === "isUnderage" && finalVal) {
      setErrors((prev) => ({ ...prev, idNumber: "" }));
    }

    // Frequent visitor suggestion matching
    if (name === "name" || name === "idNumber") {
      setActiveInput(name);
      if (value.trim().length >= 2) {
        const matches = history.filter((item) =>
          item[name].toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(matches.slice(0, 4));
      } else {
        setSuggestions([]);
      }
    }
  };

  // Autofill selector action
  const selectSuggestion = (item) => {
    setFormData((prev) => ({
      ...prev,
      name: item.name,
      idNumber: item.idNumber,
      phone: item.phone,
      vehicleReg: item.vehicleReg,
    }));
    setSuggestions([]);
    setActiveInput(null);
    setErrors({});
    toast.success("Frequent visitor details autofilled!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) {
      toast.error("Form contains errors. Cannot submit.");
      return;
    }

    setLoading(true);

    const finalDept =
      formData.gate === "Gate B-mauzo"
        ? "N/A"
        : formData.department === "Other"
        ? formData.specificDepartment
        : formData.department;

    const payload = {
      name: formData.name,
      isUnderage: formData.isUnderage,
      idNumber: formData.isUnderage ? "N/A" : formData.idNumber,
      phone: formData.phone,
      vehicleReg: formData.vehicleReg || "",
      gate: formData.gate,
      nature: formData.nature,
      department: finalDept,
      groupSize: formData.isGroup ? parseInt(formData.groupSize) : 1,
    };

    // -------------------------------------------------------------
    // OFFLINE MODE SYNC LOGIC
    // -------------------------------------------------------------
    if (!navigator.onLine) {
      try {
        await saveOfflineCheckin(payload);
        
        // Notify navbar pending count trigger
        window.dispatchEvent(new Event("sync-triggered"));

        toast.success("Offline Mode: Visitor record stored locally!");
        resetForm();
      } catch (error) {
        toast.error("Failed to save offline record.");
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch(`${SERVER_URL}/api/visitors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Fallback to offline storage if server throws error
        throw new Error("Server submission failed.");
      }

      // Success Toast
      toast.success("Visitor registered successfully!");
      resetForm();

      /* ==========================================================
         SMS/EMAIL MESSAGE NOTIFICATION SYSTEM (Retired / Deactivated)
         
         const deptPhones = { ... };
         const officePhone = ...;
         const smsMessage = `...`;
         
         if (officePhone) {
           await fetch(`${SERVER_URL}/api/sms/send-sms`, { ... });
         }
         ========================================================== */

    } catch (error) {
      // Fallback to IndexedDB offline cache on server error/failure
      console.warn("Submitting failed, cache locally in offlineSync DB", error);
      try {
        await saveOfflineCheckin(payload);
        window.dispatchEvent(new Event("sync-triggered"));
        toast.success("Network error: Visitor logged locally for sync!");
        resetForm();
      } catch (dbErr) {
        toast.error("Submission failed. Connection lost.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      isUnderage: false,
      idNumber: "",
      phone: "",
      vehicleReg: "",
      department: "",
      specificDepartment: "",
      gate: "",
      nature: "",
      isGroup: false,
      groupSize: 1,
    });
    setStep(1);
    setErrors({});
    setSuggestions([]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-24 transition-colors duration-300">
      
      {/* Container */}
      <div className="w-full max-w-3xl shadow-xl rounded-3xl p-8 sm:p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all duration-300 relative overflow-hidden">
        
        {/* Glow Element */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full filter blur-3xl pointer-events-none" />

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Visitor Registration
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Capture pass records cleanly. Fields are validated dynamically.
          </p>
        </div>

        {/* STEP HEADER */}
        <div className="flex justify-between mb-8 px-4 border-b border-slate-100 dark:border-slate-800 pb-4 text-sm font-bold">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`transition ${step === 1 ? "text-blue-500 dark:text-blue-400" : "text-slate-400 hover:text-slate-600"}`}
          >
            1. Personal
          </button>
          <button
            type="button"
            onClick={() => handleNextStep(2)}
            className={`transition ${step === 2 ? "text-blue-500 dark:text-blue-400" : "text-slate-400 hover:text-slate-600"}`}
          >
            2. Visit Info
          </button>
          <button
            type="button"
            onClick={() => handleNextStep(3)}
            className={`transition ${step === 3 ? "text-blue-500 dark:text-blue-400" : "text-slate-400 hover:text-slate-600"}`}
          >
            3. Destination
          </button>
          <button
            type="button"
            onClick={() => handleNextStep(4)}
            className={`transition ${step === 4 ? "text-blue-500 dark:text-blue-400" : "text-slate-400 hover:text-slate-600"}`}
          >
            4. Submit
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* ============= STEP ONE: PERSONAL ============== */}
          {step === 1 && (
            <div className="space-y-5">
              
              {/* Full Name */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5.5 h-5.5" />
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={(e) => setErrors(prev => ({ ...prev, name: validateField("name", e.target.value) }))}
                    placeholder="First and Last name"
                    autoComplete="off"
                    required
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-sm font-semibold focus:outline-none ${
                      errors.name ? "validation-error" : formData.name && !errors.name ? "validation-success" : "border-slate-200 dark:border-slate-800"
                    }`}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.name}</p>}

                {/* Suggestions Dropdown for autofill */}
                {activeInput === "name" && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1.5">
                    <p className="px-4 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Frequent Visitors matching name</p>
                    {suggestions.map((item) => (
                      <button
                        key={item.idNumber}
                        type="button"
                        onClick={() => selectSuggestion(item)}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-750 text-sm font-bold flex items-center justify-between border-t border-slate-50 dark:border-slate-800"
                      >
                        <span>{item.name}</span>
                        <span className="text-xs text-blue-500 dark:text-blue-400 font-semibold">ID: {item.idNumber}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Underage / Minor Checkbox */}
              <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
                <div className="flex items-center gap-3">
                  <input
                    id="isUnderage"
                    type="checkbox"
                    name="isUnderage"
                    checked={formData.isUnderage}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="isUnderage" className="text-sm font-bold flex items-center gap-1.5 cursor-pointer">
                    <UserCheck size={16} className="text-amber-500" />
                    Visitor is Underage (Minor)
                  </label>
                </div>
                {formData.isUnderage && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-2 pl-8">
                    * National ID/Passport is not required for minors. Guardian/Parent phone number will be recorded in Step 2.
                  </p>
                )}
              </div>

              {/* ID Number (Conditional for adults) */}
              {!formData.isUnderage ? (
                <div className="relative">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    ID / Passport Number
                  </label>
                  <div className="relative">
                    <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5.5 h-5.5" />
                    <input
                      name="idNumber"
                      value={formData.idNumber}
                      onChange={handleChange}
                      onBlur={(e) => setErrors(prev => ({ ...prev, idNumber: validateField("idNumber", e.target.value) }))}
                      placeholder="Enter ID Number"
                      autoComplete="off"
                      required
                      maxLength={12}
                      className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-sm font-semibold focus:outline-none ${
                        errors.idNumber ? "validation-error" : formData.idNumber && !errors.idNumber ? "validation-success" : "border-slate-200 dark:border-slate-800"
                      }`}
                    />
                  </div>
                  {errors.idNumber && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.idNumber}</p>}

                  {/* Suggestions Dropdown for ID */}
                  {activeInput === "idNumber" && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1.5">
                      <p className="px-4 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Frequent Visitors matching ID</p>
                      {suggestions.map((item) => (
                        <button
                          key={item.idNumber}
                          type="button"
                          onClick={() => selectSuggestion(item)}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-750 text-sm font-bold flex items-center justify-between border-t border-slate-50 dark:border-slate-850"
                        >
                          <span>ID: {item.idNumber}</span>
                          <span className="text-xs text-blue-500 dark:text-blue-400 font-semibold">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <IdCard className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>ID / Passport records exempt for underage visitors (Saved as <strong>N/A</strong>).</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => handleNextStep(2)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition mt-6 text-sm tracking-wide"
              >
                Proceed to Info →
              </button>

            </div>
          )}

          {/* =========== STEP TWO: VISIT INFO ============ */}
          {step === 2 && (
            <div className="space-y-5">
              
              {/* Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                  <span>{formData.isUnderage ? "Guardian / Parent Phone Number" : "Phone Number"}</span>
                  {formData.isUnderage && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                      Underage Contact
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5.5 h-5.5" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={(e) => setErrors(prev => ({ ...prev, phone: validateField("phone", e.target.value) }))}
                    placeholder={formData.isUnderage ? "Parent/Guardian phone e.g. 0712345678" : "e.g. 0712345678"}
                    required
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-sm font-semibold focus:outline-none ${
                      errors.phone ? "validation-error" : formData.phone && !errors.phone ? "validation-success" : "border-slate-200 dark:border-slate-800"
                    }`}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.phone}</p>}
              </div>

              {/* Vehicle Reg */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Vehicle Registration (Optional)
                </label>
                <div className="relative">
                  <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5.5 h-5.5" />
                  <input
                    name="vehicleReg"
                    value={formData.vehicleReg}
                    onChange={handleChange}
                    onBlur={(e) => setErrors(prev => ({ ...prev, vehicleReg: validateField("vehicleReg", e.target.value) }))}
                    placeholder="e.g. KCA 123B"
                    maxLength={10}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-sm font-semibold focus:outline-none uppercase ${
                      errors.vehicleReg ? "validation-error" : formData.vehicleReg && !errors.vehicleReg ? "validation-success" : "border-slate-200 dark:border-slate-800"
                    }`}
                  />
                </div>
                {errors.vehicleReg && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.vehicleReg}</p>}
              </div>

              {/* Group Visit Setup */}
              <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    id="isGroup"
                    type="checkbox"
                    name="isGroup"
                    checked={formData.isGroup}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500"
                  />
                  <label htmlFor="isGroup" className="text-sm font-bold flex items-center gap-1.5 cursor-pointer">
                    <Users size={16} className="text-blue-500" />
                    This is a Group Visit
                  </label>
                </div>

                {formData.isGroup && (
                  <div className="animate-fade-in pl-8 space-y-2">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                      * If this is a group, input the size. Only the group leader's details are required above.
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 uppercase">Group Size:</span>
                      <input
                        type="number"
                        name="groupSize"
                        min="2"
                        value={formData.groupSize}
                        onChange={handleChange}
                        className={`w-28 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border text-sm font-bold text-center ${
                          errors.groupSize ? "border-red-500 text-red-500" : "border-slate-200 dark:border-slate-800"
                        }`}
                      />
                    </div>
                    {errors.groupSize && <p className="text-red-500 text-xs font-bold">{errors.groupSize}</p>}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl transition text-sm"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => handleNextStep(3)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition text-sm"
                >
                  Proceed to Gate →
                </button>
              </div>

            </div>
          )}

          {/* ============ STEP THREE: GATE & DESTINATION =========== */}
          {step === 3 && (
            <div className="space-y-5">
              
              {/* Gate Entry */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Select Gate
                </label>
                <select
                  name="gate"
                  value={formData.gate}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:outline-none"
                >
                  <option value="">Select Gate Location</option>
                  <option value="Gate A">Gate A</option>
                  <option value="Gate B-mauzo">Gate B-mauzo</option>
                </select>
                {errors.gate && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.gate}</p>}
              </div>

              {/* Nature of Visit */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nature of Visit
                </label>
                <select
                  name="nature"
                  value={formData.nature}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:outline-none"
                >
                  <option value="">Select Purpose</option>
                  <option value="official">Official Visit</option>
                  <option value="personal">Personal Visit</option>
                </select>
                {errors.nature && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.nature}</p>}
              </div>

              {/* Department (if Gate A is selected) */}
              {formData.gate === "Gate A" && (
                <div className="relative animate-fade-in">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Destination Department
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5.5 h-5.5" />
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:outline-none"
                    >
                      <option value="">Select Destination Department</option>
                      <option value="Administration">Administration</option>
                      <option value="Academics">Academics</option>
                      <option value="Farm">Farm</option>
                      <option value="Kitchen">Kitchen</option>
                      <option value="House Keeping">House Keeping</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  {errors.department && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.department}</p>}
                </div>
              )}

              {/* Specify specific department if "Other" */}
              {formData.department === "Other" && formData.gate === "Gate A" && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Specify Department Name
                  </label>
                  <input
                    name="specificDepartment"
                    placeholder="Enter department destination"
                    required
                    value={formData.specificDepartment}
                    onChange={handleChange}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:outline-none"
                  />
                  {errors.specificDepartment && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.specificDepartment}</p>}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl transition text-sm"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => handleNextStep(4)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition text-sm"
                >
                  Review Submission →
                </button>
              </div>

            </div>
          )}

          {/* ========== STEP FOUR: SUBMIT REVIEW =========== */}
          {step === 4 && (
            <div className="space-y-6">
              
              {/* Summary Cards */}
              <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 space-y-4">
                <h4 className="text-base font-extrabold border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-500" />
                  Verify Information
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold">
                  <div>
                    <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider">Full Name</span>
                    <span className="text-base font-extrabold flex items-center gap-2">
                      {formData.name}
                      {formData.isUnderage && (
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">
                          Underage Minor
                        </span>
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider">ID Number</span>
                    <span className="text-base font-extrabold">{formData.isUnderage ? "N/A (Underage)" : formData.idNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider">
                      {formData.isUnderage ? "Guardian Phone" : "Phone"}
                    </span>
                    <span>{formData.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider">Vehicle</span>
                    <span>{formData.vehicleReg || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider">Gate Location</span>
                    <span className="text-blue-600 dark:text-blue-400 font-extrabold">{formData.gate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider">Visit Purpose</span>
                    <span className="capitalize">{formData.nature}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider">Group Size</span>
                    <span>{formData.isGroup ? `Group of ${formData.groupSize}` : "Single Visitor"}</span>
                  </div>
                  {formData.gate === "Gate A" && (
                    <div>
                      <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider">Department</span>
                      <span>{formData.department === "Other" ? formData.specificDepartment : formData.department}</span>
                    </div>
                  )}
                </div>
              </div>

              {!navigator.onLine && (
                <div className="bg-amber-100 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 p-3.5 border border-amber-200 dark:border-amber-900 rounded-xl text-xs font-bold text-center">
                  Offline Mode Active: Form will save locally to device and sync automatically once online.
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl transition text-sm"
                >
                  ← Make Adjustments
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`py-3 rounded-xl font-bold shadow-lg text-sm transition flex items-center justify-center gap-2 ${
                    loading
                      ? "bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10 hover:scale-[1.01]"
                  }`}
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {loading ? "Recording Pass..." : "Approve & Submit"}
                </button>
              </div>

            </div>
          )}

        </form>
      </div>
    </div>
  );
}