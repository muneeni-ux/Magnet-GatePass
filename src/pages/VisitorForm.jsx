import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  User,
  IdCard,
  Car,
  Phone,
  Building2,
  Shield,
  UserCheck,
  Search,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  addVisitorToQueue,
  getQueuedVisitors,
  removeVisitorFromQueue,
} from "../services/IndexedDBService";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const COUNTRY_CODES = [
  { code: "+254", flag: "🇰🇪", name: "Kenya" },
  { code: "+256", flag: "🇺🇬", name: "Uganda" },
  { code: "+255", flag: "🇹🇿", name: "Tanzania" },
  { code: "+250", flag: "🇷🇼", name: "Rwanda" },
  { code: "+251", flag: "🇪🇹", name: "Ethiopia" },
  { code: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "+1", flag: "🇺🇸", name: "USA / Canada" },
  { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+86", flag: "🇨🇳", name: "China" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+252", flag: "🇸🇴", name: "Somalia" },
  { code: "+211", flag: "🇸🇸", name: "South Sudan" },
];

const maskIdNumber = (idStr) => {
  if (!idStr) return "-";
  const str = idStr.toString();
  if (str.length <= 4) return str.replace(/./g, "*");
  const first = str.slice(0, 3);
  const last = str.slice(-3);
  const asterisks = "*".repeat(Math.max(3, str.length - 6));
  return `${first}${asterisks}${last}`;
};

const maskPhoneNumber = (phoneStr) => {
  if (!phoneStr) return "-";
  const str = phoneStr.toString().trim();
  if (str.length <= 6) return str.replace(/./g, "*");
  const prefix = str.slice(0, Math.min(4, Math.floor(str.length / 2)));
  const suffix = str.slice(-3);
  return `${prefix} *** ${suffix}`;
};

export default function VisitorForm() {
  const initialFormState = {
    name: "",
    idNumber: "",
    phone: "",
    countryCode: "+254",
    vehicleReg: "",
    department: "",
    specificDepartment: "",
    gate: "",
    nature: "official",
    hostStaff: "",
    isUnderage: false,
    isGroup: false,
    groupSize: 1,
    isDisabled: false,
    isStaffCheckIn: false,
  };

  const [formData, setFormData] = useState(initialFormState);

  // Revert / Undo Autofill State
  const [previousFormData, setPreviousFormData] = useState(null);
  const [wasAutofilled, setWasAutofilled] = useState(false);

  const [gates, setGates] = useState([]);
  const [activeStaffDeps, setActiveStaffDeps] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [staffRoster, setStaffRoster] = useState([]);

  // Search & Autofill state
  const [topSearch, setTopSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searching, setSearching] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // SCREENSHOT & SECURITY PROTECTION EFFECT
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === "PrintScreen" ||
        e.code === "PrintScreen" ||
        (e.ctrlKey && (e.key === "p" || e.key === "P")) ||
        (e.ctrlKey &&
          e.shiftKey &&
          (e.key === "I" || e.key === "i" || e.key === "S" || e.key === "s")) ||
        (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4"))
      ) {
        e.preventDefault();
        if (navigator.clipboard) {
          navigator.clipboard.writeText("").catch(() => {});
        }
        toast.error(
          "Screenshots and copying are disabled on Visitor Check-In portal for security & privacy.",
          { id: "no-screenshot" },
        );
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyDown);
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyDown);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const [
          gatesRes,
          deptsRes,
          staffDepsRes,
          staffRosterRes,
          inquiryStaffRes,
          visitorsRes,
        ] = await Promise.all([
          axios.get(`${SERVER_URL}/api/locations/gates`),
          axios.get(`${SERVER_URL}/api/locations/departments`),
          axios.get(`${SERVER_URL}/api/visitors/active-staff-departments`),
          axios.get(`${SERVER_URL}/api/staff`).catch(() => ({ data: [] })),
          axios
            .get(`${SERVER_URL}/api/inquiry-staff`)
            .catch(() => ({ data: [] })),
          axios.get(`${SERVER_URL}/api/visitors`).catch(() => ({ data: [] })),
        ]);

        setGates(gatesRes.data);
        setDepartments(deptsRes.data);
        setActiveStaffDeps(staffDepsRes.data || []);

        // Filter staff entries from Visitor collection as well
        const staffFromVisitors = (visitorsRes.data || [])
          .filter((v) => v.nature === "staff")
          .map((v) => ({
            _id: v._id,
            name: v.name,
            role: "Staff Member",
            department: v.department,
            phone: v.phone,
            staffId: v.idNumber || v._id.slice(-6).toUpperCase(),
          }));

        // Combine dedicated staff, inquiry staff, and staff check-in records
        const combinedStaff = [
          ...staffFromVisitors,
          ...(staffRosterRes.data || []),
          ...(inquiryStaffRes.data || []).map((s) => ({
            _id: s._id,
            name: s.name,
            role: s.role,
            department: s.department,
            phone: s.phone,
            staffId: s._id.slice(-6).toUpperCase(),
          })),
        ];

        // Deduplicate by staff name, preserving specific department over General
        const staffMap = new Map();
        combinedStaff.forEach((item) => {
          if (!item || !item.name) return;
          const key = item.name.trim().toLowerCase();
          const existing = staffMap.get(key);
          if (!existing) {
            staffMap.set(key, item);
          } else {
            const currentDept = existing.department || "";
            const newDept = item.department || "";
            const isCurrentGeneral = !currentDept || currentDept.toLowerCase() === "general";
            const isNewSpecific = newDept && newDept.toLowerCase() !== "general";

            if (isCurrentGeneral && isNewSpecific) {
              staffMap.set(key, { ...existing, department: newDept });
            }
          }
        });
        setStaffRoster(Array.from(staffMap.values()));
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

        toast.success(`Synced ${queued.length} offline records!`, {
          id: "offline-sync",
        });
      } catch (error) {
        console.error("Background sync failed:", error);
      }
    };

    window.addEventListener("online", syncOfflineVisitors);
    if (navigator.onLine) syncOfflineVisitors();
    return () => window.removeEventListener("online", syncOfflineVisitors);
  }, []);

  // Top Search Bar Live Autocomplete Handler
  useEffect(() => {
    if (!topSearch || topSearch.trim().length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await axios.get(
          `${SERVER_URL}/api/visitors/search/query?q=${encodeURIComponent(topSearch.trim())}`,
        );
        setSearchResults(res.data || []);
        setShowSearchDropdown(true);
      } catch (err) {
        console.error("Top search failed", err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [topSearch]);

  // Smart Multi-Field (2-Field Match) Background Autofill
  useEffect(() => {
    if (wasAutofilled) return; // Don't re-trigger if already autofilled

    const filledFields = [
      formData.phone?.length >= 8 ? "phone" : null,
      formData.idNumber?.length >= 6 ? "idNumber" : null,
      formData.vehicleReg?.length >= 4 ? "vehicleReg" : null,
      formData.name?.length >= 4 ? "name" : null,
    ].filter(Boolean);

    if (filledFields.length < 2) return;

    const timer = setTimeout(async () => {
      try {
        let params = new URLSearchParams();
        if (formData.phone) params.append("phone", formData.phone);
        if (formData.idNumber) params.append("idNumber", formData.idNumber);
        if (formData.vehicleReg)
          params.append("vehicleReg", formData.vehicleReg);
        if (formData.name) params.append("name", formData.name);

        const res = await axios.get(
          `${SERVER_URL}/api/visitors/search/recent?${params.toString()}`,
        );
        if (res.data) {
          toast.success(
            `Matched past record for ${res.data.name}. Autofilled!`,
            { id: "autofill-2field" },
          );
          populateVisitorRecord(res.data);
        }
      } catch (err) {
        console.error("2-field autofill failed", err);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [
    formData.phone,
    formData.idNumber,
    formData.vehicleReg,
    formData.name,
    wasAutofilled,
  ]);

  const populateVisitorRecord = (record) => {
    // Save snapshot for undo
    setPreviousFormData({ ...formData });

    let rawPhone = record.phone || "";
    let extractedCountryCode = record.countryCode || "+254";

    // Clean double country code issue (+254 +254...)
    if (rawPhone.startsWith("+")) {
      const matchedCode = COUNTRY_CODES.find((c) =>
        rawPhone.startsWith(c.code),
      );
      if (matchedCode) {
        extractedCountryCode = matchedCode.code;
        rawPhone = rawPhone.slice(matchedCode.code.length);
      } else {
        rawPhone = rawPhone.replace(/^\+\d{1,4}/, "");
      }
    }
    rawPhone = rawPhone.replace(/\D/g, "").replace(/^0/, "");

    setFormData((prev) => ({
      ...prev,
      name: record.name || prev.name,
      idNumber: record.idNumber || prev.idNumber,
      phone: rawPhone || prev.phone,
      countryCode: extractedCountryCode,
      vehicleReg: record.vehicleReg || prev.vehicleReg,
      isUnderage: record.isUnderage || false,
      isDisabled: record.isDisabled || false,
      isGroup: record.isGroup || false,
      groupSize: record.groupSize || 1,
    }));
    setWasAutofilled(true);
    setShowSearchDropdown(false);
    setTopSearch("");
  };

  const handleUndoAutofill = () => {
    if (previousFormData) {
      setFormData(previousFormData);
      setWasAutofilled(false);
      setPreviousFormData(null);
      toast.success("Autofill undone. You can now enter details manually.");
    }
  };

  const validatePhone = (phone) => {
    if (!phone) return "Phone number is required";
    if (phone.length < 7) return "Min 7 digits";
    if (phone.length > 14) return "Max 14 digits";
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
      const filtered = departments.filter((d) => {
        if (d.gates && d.gates.length > 0) {
          return d.gates.some((g) => {
            const gId = typeof g === "object" ? g._id : g;
            return gId?.toString() === value?.toString();
          });
        }
        if (d.gateId) {
          const gId = typeof d.gateId === "object" ? d.gateId._id : d.gateId;
          return gId?.toString() === value?.toString();
        }
        return true;
      });
      setFilteredDepartments(filtered);
    } else if (type === "checkbox") {
      if (name === "isStaffCheckIn") {
        setFormData((prev) => ({
          ...prev,
          isStaffCheckIn: checked,
          nature: checked ? "staff" : "official",
          isUnderage: false,
          idNumber: "",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: checked,
          idNumber: name === "isUnderage" && checked ? "" : prev.idNumber,
        }));
      }
    } else if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
      const error = validatePhone(numericValue);
      setErrors((prev) => ({ ...prev, phone: error }));
    } else if (name === "idNumber") {
      const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, "");
      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    } else if (
      name === "name" ||
      name === "vehicleReg" ||
      name === "specificDepartment"
    ) {
      const sanitizedValue = value.replace(/[^a-zA-Z0-9\s]/g, "");
      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Staff Check-In Selection Handler
  const handleStaffSelect = (staffId) => {
    const staff = staffRoster.find(
      (s) => s._id === staffId || s.staffId === staffId,
    );
    if (staff) {
      setPreviousFormData({ ...formData });

      let cleanStaffPhone = (staff.phone || "").replace(/\D/g, "");
      if (cleanStaffPhone.startsWith("254"))
        cleanStaffPhone = cleanStaffPhone.slice(3);
      if (cleanStaffPhone.startsWith("0"))
        cleanStaffPhone = cleanStaffPhone.slice(1);

      setFormData((prev) => ({
        ...prev,
        name: staff.name,
        phone: cleanStaffPhone || prev.phone,
        idNumber: staff.staffId || prev.idNumber,
        department:
          departments.find((d) => d.name === staff.department)?._id ||
          prev.department,
        specificDepartment: staff.department || "",
        nature: "staff",
      }));
      setWasAutofilled(true);
      toast.success(`Staff details loaded for ${staff.name}`);
    }
  };

  // Host Staff Selection Handler
  const handleHostStaffSelect = (staffName) => {
    const staff = staffRoster.find((s) => s.name === staffName);
    if (staff) {
      const matchedDept = departments.find((d) => d.name === staff.department);
      setFormData((prev) => ({
        ...prev,
        hostStaff: staff.name,
        department: matchedDept ? matchedDept._id : prev.department,
        specificDepartment: staff.department || prev.specificDepartment,
      }));
      toast.success(`Host staff selected: ${staff.name} (${staff.department})`);
    } else {
      setFormData((prev) => ({ ...prev, hostStaff: staffName }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full Name is required";

    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    if (!formData.isUnderage && !formData.isStaffCheckIn) {
      if (!formData.idNumber.trim()) {
        newErrors.idNumber = "ID/Passport Number is required";
      } else if (
        formData.idNumber.length < 6 ||
        formData.idNumber.length > 12
      ) {
        newErrors.idNumber = "ID/Passport must be 6 to 12 characters";
      }
    }

    if (!formData.gate) newErrors.gate = "Entry Gate is required";
    if (!formData.nature) newErrors.nature = "Purpose of Visit is required";

    const hasDepartments = departments.some(
      (d) => d.gateId._id === formData.gate,
    );
    if (
      hasDepartments &&
      !formData.department &&
      formData.department !== "Other"
    ) {
      newErrors.department = "Department is required";
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
      const selectedGate = gates.find((g) => g._id === formData.gate);

      // Determine final department name
      let finalDepartmentName = formData.department;
      if (formData.department === "Other") {
        finalDepartmentName = formData.specificDepartment || "General";
      } else {
        const matchedDept = departments.find(
          (d) => d._id === formData.department,
        );
        if (matchedDept) finalDepartmentName = matchedDept.name;
      }

      // Format full international phone number without double country code (+254 +254...)
      const cleanPhoneDigits = formData.phone
        .replace(/\D/g, "")
        .replace(/^0/, "");
      const formattedFullPhone = `${formData.countryCode}${cleanPhoneDigits}`;

      const payload = {
        ...formData,
        phone: formattedFullPhone,
        department: finalDepartmentName || "General",
        gate: selectedGate ? selectedGate.name : formData.gate,
        recordedBy: user?.id,
      };

      if (!navigator.onLine) {
        await addVisitorToQueue(payload);
        toast.success("Saved offline. Will sync when reconnected.", {
          icon: "📡",
        });
      } else {
        const response = await fetch(`${SERVER_URL}/api/visitors`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to submit visitor details");
        }

        const savedVisitor = await response.json();

        // STRICT CHECK: DO NOT SEND SMS FOR STAFF ENTRY LOGS AT ALL
        const isStaffEntry =
          formData.nature === "staff" || formData.isStaffCheckIn;

        if (!isStaffEntry) {
          let targetPhone = "";
          let recipientName = "";
          let deliveryTier = "";

          // Tier 1: Host Staff Phone
          const selectedHost = staffRoster.find(
            (s) => s.name === formData.hostStaff,
          );
          if (selectedHost && selectedHost.phone) {
            targetPhone = selectedHost.phone;
            recipientName = selectedHost.name;
            deliveryTier = "Host Staff Direct";
          }

          // Tier 2: Department Phone
          if (!targetPhone) {
            const selectedDept = departments.find(
              (d) => d._id === formData.department,
            );
            if (selectedDept && selectedDept.phone) {
              targetPhone = selectedDept.phone;
              recipientName = selectedDept.name;
              deliveryTier = "Department Contact";
            }
          }

          // Tier 3: Gate / Admin Fallback
          if (!targetPhone) {
            targetPhone = selectedGate?.phone || "0711111111";
            recipientName = selectedGate?.name || "Gate Admin";
            deliveryTier = "Gate Hotline Fallback";
          }

          const gateNameForSMS = selectedGate
            ? selectedGate.name
            : formData.gate;
          let smsMessage = `VISITRACK\nVisitor: ${formData.name}\nID: ${formData.isUnderage ? "Minor" : maskIdNumber(formData.idNumber)}\nDest: ${finalDepartmentName}\nGate: ${gateNameForSMS}`;
          if (formData.hostStaff) smsMessage += `\nHost: ${formData.hostStaff}`;
          if (formData.isDisabled)
            smsMessage += `\nALERT: Needs assistance/vehicle!`;
          if (formData.isGroup)
            smsMessage += `\nGroup of ${formData.groupSize}`;

          if (savedVisitor.acknowledgmentToken) {
            smsMessage += `\nConfirm arrival: ${window.location.origin}/v/${savedVisitor.acknowledgmentToken}`;
          }

          try {
            await fetch(`${SERVER_URL}/api/sms/send-sms`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ phone: targetPhone, message: smsMessage }),
            });
            toast.success(
              `Visitor checked in! Alert sent to ${recipientName} (${deliveryTier})`,
            );
          } catch (smsError) {
            console.error("SMS failed, attempting fallback...", smsError);
            try {
              const fallbackPhone = selectedGate?.phone || "0711111111";
              await fetch(`${SERVER_URL}/api/sms/send-sms`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  phone: fallbackPhone,
                  message: smsMessage,
                }),
              });
              toast.success(
                `Checked in! Alert delivered to ${selectedGate?.name || "Gate"} (Fallback)`,
              );
            } catch (fallbackErr) {
              toast.success("Visitor checked in! (SMS notice queued)");
            }
          }
        } else {
          // Clean confirmation for Staff Entry with NO SMS
          toast.success(`Staff check-in recorded for ${formData.name}`);
        }
      }

      // Reset form
      setFormData(initialFormState);
      setWasAutofilled(false);
      setPreviousFormData(null);
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
  const selectedDeptObj = departments.find(
    (d) => d._id === formData.department || d.name === formData.department
  );
  const selectedDeptName = selectedDeptObj
    ? selectedDeptObj.name
    : formData.department === "Other"
    ? formData.specificDepartment
    : (formData.department || "");

  const filteredHostStaff = staffRoster.filter((s) => {
    if (!selectedDeptName) return true;
    if (!s.department) return true;

    const sDept = s.department.toString().trim().toLowerCase();
    const targetDeptName = selectedDeptName.toString().trim().toLowerCase();
    const targetDeptId = selectedDeptObj ? selectedDeptObj._id.toString().trim().toLowerCase() : "";

    return (
      sDept === targetDeptName ||
      (targetDeptId && sDept === targetDeptId) ||
      sDept.includes(targetDeptName) ||
      targetDeptName.includes(sDept) ||
      sDept.split(/\s+/).some(w => w.length >= 3 && targetDeptName.includes(w))
    );
  });

  const hostStaffOptions = filteredHostStaff.length > 0 ? filteredHostStaff : staffRoster;

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] font-sans text-slate-800 dark:text-slate-100 px-3 sm:px-6 md:px-8 pt-20 md:pt-24 pb-28 md:pb-12 flex justify-center items-start relative cyber-grid overflow-hidden w-full max-w-full select-none"
      style={{ WebkitUserSelect: "none", userSelect: "none" }}
    >
      {/* Background Ambient Orbs (Contained) */}
      <div className="hidden sm:block absolute top-1/4 left-0 w-[400px] h-[400px] bg-blue-500/10 dark:bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
      <div className="hidden sm:block absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse delay-700"></div>

      <div className="w-full max-w-6xl relative z-10 animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
        {/* Top Quick Search Bar for Frequent Visitors */}
        <div className="mb-4 relative">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 dark:text-emerald-400 h-5 w-5" />
              <input
                type="text"
                value={topSearch}
                onChange={(e) => setTopSearch(e.target.value)}
                onFocus={() =>
                  topSearch.trim().length >= 2 && setShowSearchDropdown(true)
                }
                placeholder="🔍 Search Frequent Visitor by Name, ID, Phone, or Vehicle Plate..."
                className="w-full bg-white/90 dark:bg-slate-900/90 border border-blue-500/30 dark:border-emerald-500/30 text-slate-900 dark:text-white pl-12 pr-10 py-3 rounded-2xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 text-sm shadow-md backdrop-blur-md transition-all font-sans"
              />
              {searching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>

            {/* Undo / Revert Autofill Button */}
            {wasAutofilled && (
              <button
                type="button"
                onClick={handleUndoAutofill}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-2xl font-bold text-xs transition-all shrink-0 animate-in fade-in slide-in-from-right-2 shadow-sm"
                title="Undo last autofill and clear fields"
              >
                <RotateCcw size={16} />
                <span>Undo Autofill</span>
              </button>
            )}
          </div>

          {/* Autocomplete Results Dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {searchResults.map((res) => (
                <div
                  key={res._id}
                  onClick={() => populateVisitorRecord(res)}
                  className="p-3.5 hover:bg-blue-50 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-emerald-500/20 text-blue-600 dark:text-emerald-400 rounded-xl">
                      <UserCheck size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {res.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        ID: {res.idNumber || "Minor"} | Phone:{" "}
                        {maskPhoneNumber(res.phone)}{" "}
                        {res.vehicleReg && `| Plate: ${res.vehicleReg}`}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600 dark:text-emerald-400 bg-blue-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-emerald-500/20">
                    Autofill →
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-emerald-500/10 dark:to-cyan-500/10 rounded-2xl border border-blue-500/20 dark:border-emerald-500/20 shadow-sm shrink-0">
              <UserCheck className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1
                className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                VISITOR{" "}
                <span className="text-blue-600 dark:text-emerald-400">
                  CHECK-IN
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Register a new visitor entry quickly and easily
              </p>
            </div>
          </div>
        </div>

        {/* Unified 1-Page Form Layout */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6 w-full"
        >
          {/* Main Input Sections */}
          <div className="lg:col-span-2 space-y-5 md:space-y-6 w-full">
            {/* Card 1: Category Toggles & Visitor Info */}
            <div className="glass-panel dark:glass-panel-dark bg-white/80 dark:bg-slate-900/80 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-white/80 dark:border-slate-800 shadow-lg backdrop-blur-md w-full">
              <div className="flex items-center gap-3 pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-slate-200/80 dark:border-slate-800">
                <User className="h-5 w-5 text-blue-600 dark:text-emerald-400 shrink-0" />
                <h2
                  className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  Visitor Details
                </h2>
              </div>

              {/* Category Toggles (Grid of 4) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-5 sm:mb-6">
                {/* Staff Check-In Toggle */}
                <label
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${formData.isStaffCheckIn ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold" : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300"}`}
                >
                  <input
                    type="checkbox"
                    name="isStaffCheckIn"
                    checked={formData.isStaffCheckIn}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 shrink-0"
                  />
                  <div>
                    <span className="text-xs font-bold block leading-tight">
                      Staff Check-In
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 block">
                      Duty Staff
                    </span>
                  </div>
                </label>

                {/* Minor Toggle */}
                <label
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${formData.isUnderage ? "bg-blue-500/10 dark:bg-emerald-500/10 border-blue-500/40 font-bold" : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300"}`}
                >
                  <input
                    type="checkbox"
                    name="isUnderage"
                    checked={formData.isUnderage}
                    onChange={handleChange}
                    disabled={formData.isStaffCheckIn}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 shrink-0"
                  />
                  <div>
                    <span className="text-xs font-bold block leading-tight">
                      Minor / Child
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 block">
                      Under 18 yrs
                    </span>
                  </div>
                </label>

                {/* Group Toggle */}
                <label
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${formData.isGroup ? "bg-purple-500/10 border-purple-500/40 font-bold" : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300"}`}
                >
                  <input
                    type="checkbox"
                    name="isGroup"
                    checked={formData.isGroup}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 shrink-0"
                  />
                  <div>
                    <span className="text-xs font-bold block leading-tight">
                      Group Entry
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 block">
                      Multiple visitors
                    </span>
                  </div>
                </label>

                {/* Assistance Toggle */}
                <label
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${formData.isDisabled ? "bg-amber-500/10 border-amber-500/40 font-bold" : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300"}`}
                >
                  <input
                    type="checkbox"
                    name="isDisabled"
                    checked={formData.isDisabled}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 shrink-0"
                  />
                  <div>
                    <span className="text-xs font-bold block leading-tight">
                      Special Care
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 block">
                      Assistance needed
                    </span>
                  </div>
                </label>
              </div>

              {/* Staff Select Dropdown if Staff Check-In Toggle is active */}
              {formData.isStaffCheckIn && staffRoster.length > 0 && (
                <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl animate-in slide-in-from-top-2">
                  <InputLabel required>
                    Select Staff Member Checking In
                  </InputLabel>
                  <select
                    onChange={(e) => handleStaffSelect(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-emerald-500/40 text-slate-900 dark:text-white p-3 rounded-xl focus:outline-none focus:border-emerald-500 text-sm shadow-inner font-mono cursor-pointer"
                  >
                    <option value="">-- Choose Staff from Roster --</option>
                    {staffRoster.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} - {s.role || "Staff"} ({s.department})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Input Fields */}
              <div className="space-y-4">
                {/* Visitor Name & Group Size */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <InputLabel required>
                      {formData.isGroup
                        ? "Main Contact / Leader Name"
                        : formData.isStaffCheckIn
                          ? "Staff Full Name"
                          : "Visitor Full Name"}
                    </InputLabel>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder={
                        formData.isStaffCheckIn
                          ? "e.g. Jane Doe"
                          : "e.g. John Doe"
                      }
                      className={`w-full bg-white dark:bg-slate-950 border ${errors.name ? "border-red-500" : "border-slate-200 dark:border-slate-800"} text-slate-900 dark:text-white p-3 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 text-sm shadow-inner transition-all`}
                    />
                    {errors.name && (
                      <p className="text-[11px] text-red-500 mt-1 font-bold">
                        {errors.name}
                      </p>
                    )}
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

                {/* ID / Passport & International Mobile Number with Country Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {!formData.isUnderage ? (
                    <div>
                      <InputLabel required={!formData.isStaffCheckIn}>
                        {formData.isStaffCheckIn
                          ? "Staff ID / Employee No."
                          : "ID / Passport Number"}
                      </InputLabel>
                      <div className="relative">
                        <input
                          name="idNumber"
                          value={formData.idNumber}
                          onChange={handleChange}
                          required={
                            !formData.isUnderage && !formData.isStaffCheckIn
                          }
                          placeholder={
                            formData.isStaffCheckIn
                              ? "e.g. STF-102"
                              : "e.g. 12345678"
                          }
                          className={`w-full bg-white dark:bg-slate-950 border ${errors.idNumber ? "border-red-500" : "border-slate-200 dark:border-slate-800"} text-slate-900 dark:text-white p-3 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 text-sm font-mono shadow-inner transition-all`}
                        />
                        <IdCard className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 shrink-0" />
                      </div>
                      {errors.idNumber && (
                        <p className="text-[11px] text-red-500 mt-1 font-bold">
                          {errors.idNumber}
                        </p>
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

                  {/* International Mobile Field with Country Code Picker */}
                  <div>
                    <InputLabel required>Mobile Phone Number</InputLabel>
                    <div className="flex gap-2">
                      <select
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleChange}
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-2 py-3 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 text-xs font-mono font-bold cursor-pointer shrink-0"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code} ({c.name})
                          </option>
                        ))}
                      </select>

                      <div className="relative flex-1">
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          maxLength={12}
                          placeholder="7XXXXXXXX"
                          className={`w-full bg-white dark:bg-slate-950 border ${errors.phone ? "border-red-500" : "border-slate-200 dark:border-slate-800"} text-slate-900 dark:text-white p-3 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 text-sm font-mono shadow-inner transition-all`}
                        />
                        <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 shrink-0" />
                      </div>
                    </div>
                    {errors.phone && (
                      <p className="text-[11px] text-red-500 mt-1 font-bold">
                        {errors.phone}
                      </p>
                    )}
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

            {/* Card 2: Gate, Host Staff & Destination */}
            <div className="glass-panel dark:glass-panel-dark bg-white/80 dark:bg-slate-900/80 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-white/80 dark:border-slate-800 shadow-lg backdrop-blur-md w-full">
              <div className="flex items-center gap-3 pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-slate-200/80 dark:border-slate-800">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-emerald-400 shrink-0" />
                <h2
                  className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  Gate & Destination
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
                    <option value="" disabled>
                      Select Entry Gate
                    </option>
                    {gates.map((gate) => (
                      <option key={gate._id} value={gate._id}>
                        {gate.name}
                      </option>
                    ))}
                  </select>
                  {errors.gate && (
                    <p className="text-[11px] text-red-500 mt-1 font-bold">
                      {errors.gate}
                    </p>
                  )}
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
                    <option value="official">Official Visit</option>
                    <option value="personal">Personal Visit</option>
                    <option value="staff">Staff Check-in</option>
                  </select>
                </div>
              </div>

              {/* Department Selection */}
              {filteredDepartments.length > 0 && (
                <div>
                  <InputLabel required>Department / Office to Visit</InputLabel>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    className={`w-full bg-white dark:bg-slate-950 border ${errors.department ? "border-red-500" : "border-slate-200 dark:border-slate-800"} text-slate-900 dark:text-white p-3 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 text-sm shadow-inner transition-all cursor-pointer`}
                  >
                    <option value="" disabled>
                      Select Department
                    </option>
                    {filteredDepartments.map((dept) => {
                      const isStaffPresent = activeStaffDeps.some((activeDept) => {
                        if (!activeDept) return false;
                        const aNorm = activeDept.toString().trim().toLowerCase();
                        const dNorm = dept.name.toString().trim().toLowerCase();
                        return aNorm === dNorm || aNorm.includes(dNorm) || dNorm.includes(aNorm);
                      });
                      const isStaffCheckIn = formData.nature === "staff";
                      const isDeptDisabled = !isStaffPresent && !isStaffCheckIn;

                      return (
                        <option
                          key={dept._id}
                          value={dept._id}
                          disabled={isDeptDisabled}
                        >
                          {dept.name}{" "}
                          {isDeptDisabled ? "(Offline / Staff Away)" : ""}
                        </option>
                      );
                    })}
                    <option value="Other">Other (Specify below)</option>
                  </select>
                  {errors.department && (
                    <p className="text-[11px] text-red-500 mt-1 font-bold">
                      {errors.department}
                    </p>
                  )}
                </div>
              )}
              {/* Host Staff / Person to Visit (Optional) */}
              {!formData.isStaffCheckIn && staffRoster.length > 0 && (
                <div className="mt-4">
                  <InputLabel>
                    Host Staff / Person to Visit (Optional)
                  </InputLabel>
                  <select
                    value={formData.hostStaff}
                    onChange={(e) => handleHostStaffSelect(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-3 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 text-sm shadow-inner transition-all cursor-pointer"
                  >
                    <option value="">
                      {selectedDeptName
                        ? `-- Choose Host Staff under ${selectedDeptName} (Optional) --`
                        : "-- Choose Host Staff (Optional) --"}
                    </option>
                    {filteredHostStaff.map((s) => (
                      <option key={s._id} value={s.name}>
                        {s.name} ({s.department || "General"})
                      </option>
                    ))}
                  </select>
                  {selectedDeptName && filteredHostStaff.length === 0 && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5 font-semibold">
                      Note: No staff registered specifically under "{selectedDeptName}".
                    </p>
                  )}
                </div>
              )}
              {/* Specific Location if Other */}
              {formData.department === "Other" && (
                <div className="mt-4 animate-in slide-in-from-top-2">
                  <InputLabel required>
                    Specify Office / Host Location
                  </InputLabel>
                  <input
                    name="specificDepartment"
                    value={formData.specificDepartment}
                    onChange={handleChange}
                    required
                    placeholder="Enter office name or host..."
                    className={`w-full bg-white dark:bg-slate-950 border ${errors.specificDepartment ? "border-red-500" : "border-slate-200 dark:border-slate-800"} text-slate-900 dark:text-white p-3 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 text-sm shadow-inner transition-all`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column / Live Summary & Submission Card */}
          <div className="space-y-6 w-full">
            <div className="glass-panel dark:glass-panel-dark bg-white/90 dark:bg-slate-900/90 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-white/80 dark:border-slate-800 shadow-xl backdrop-blur-md lg:sticky lg:top-24 w-full">
              <div className="flex items-center gap-3 pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-slate-200/80 dark:border-slate-800">
                <Shield className="h-5 w-5 text-blue-600 dark:text-emerald-400 shrink-0" />
                <h2
                  className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  Check-In Summary
                </h2>
              </div>

              <div className="space-y-3 sm:space-y-4 text-xs font-mono mb-6 sm:mb-8">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">
                    Visitor / Staff Name
                  </span>
                  <span className="text-slate-900 dark:text-white font-extrabold text-sm block truncate mt-0.5">
                    {formData.name || (
                      <span className="text-slate-400 italic font-sans text-xs">
                        Not entered
                      </span>
                    )}
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {formData.isStaffCheckIn && (
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md font-bold">
                        Staff Member
                      </span>
                    )}
                    {formData.isGroup && (
                      <span className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-md font-bold">
                        Group of {formData.groupSize}
                      </span>
                    )}
                    {formData.isDisabled && (
                      <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md font-bold">
                        Assistance
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">
                      ID / Passport
                    </span>
                    <span className="text-slate-900 dark:text-white font-bold block truncate mt-0.5">
                      {formData.isUnderage
                        ? "Minor"
                        : maskIdNumber(formData.idNumber) || "-"}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">
                      Mobile Number
                    </span>
                    <span className="text-slate-900 dark:text-white font-bold block truncate mt-0.5">
                      {formData.phone
                        ? maskPhoneNumber(
                            `${formData.countryCode}${formData.phone}`,
                          )
                        : "-"}
                    </span>
                  </div>
                </div>

                {formData.hostStaff && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">
                      Host Staff
                    </span>
                    <span className="text-blue-600 dark:text-emerald-400 font-bold block truncate mt-0.5">
                      {formData.hostStaff}
                    </span>
                  </div>
                )}

                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">
                    Entry Gate
                  </span>
                  <span className="text-slate-900 dark:text-white font-bold block truncate mt-0.5">
                    {selectedGateObj?.name || (
                      <span className="text-slate-400 italic font-sans text-xs">
                        Select gate
                      </span>
                    )}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">
                    Destination
                  </span>
                  <span className="text-slate-900 dark:text-white font-bold block truncate mt-0.5">
                    {formData.department === "Other"
                      ? formData.specificDepartment || "Other Specified"
                      : selectedDeptObj?.name || (
                          <span className="text-slate-400 italic font-sans text-xs">
                            Select department
                          </span>
                        )}
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
                    <span>
                      Check In {formData.isStaffCheckIn ? "Staff" : "Visitor"}
                    </span>
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
