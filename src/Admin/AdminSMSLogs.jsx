import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { format } from "date-fns";
import toast from "react-hot-toast";
import {
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Upload,
  RefreshCw,
  Search,
  Sliders,
  PhoneCall,
  ShieldAlert,
  Image as ImageIcon
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const maskPhoneNumber = (phoneStr) => {
  if (!phoneStr) return "-";
  const str = phoneStr.toString().trim();
  if (str.length <= 6) return str.replace(/./g, "*");
  const prefix = str.slice(0, Math.min(4, Math.floor(str.length / 2)));
  const suffix = str.slice(-3);
  return `${prefix} *** ${suffix}`;
};

const AdminSMSLogs = () => {
  const { settings, updateSettings, uploadLogo, fetchSettings } = useSettings();
  const [smsLogs, setSmsLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Local Form States
  const [sosPhoneInput, setSosPhoneInput] = useState("");
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [uploadingLogoState, setUploadingLogoState] = useState(false);

  useEffect(() => {
    fetchSmsLogs();
  }, []);

  useEffect(() => {
    if (settings) {
      setSosPhoneInput(settings.sosPhone || "0700000000");
    }
  }, [settings]);

  const fetchSmsLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${SERVER_URL}/api/sms/logs`);
      setSmsLogs(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load SMS logs");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGlobalSMS = async () => {
    setUpdatingSettings(true);
    try {
      const newStatus = !settings.smsEnabled;
      await updateSettings({ smsEnabled: newStatus });
      toast.success(`Global System SMS is now ${newStatus ? "ENABLED 🟢" : "DISABLED 🔴"}`);
    } catch (err) {
      toast.error("Failed to update SMS setting");
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleToggleSosSms = async () => {
    setUpdatingSettings(true);
    try {
      const newStatus = !settings.sosSmsEnabled;
      await updateSettings({ sosSmsEnabled: newStatus });
      toast.success(`Automated SOS Emergency SMS is now ${newStatus ? "ENABLED 🟢" : "DISABLED 🔴"}`);
    } catch (err) {
      toast.error("Failed to update SOS SMS setting");
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleSaveSosPhone = async (e) => {
    e.preventDefault();
    if (!sosPhoneInput || sosPhoneInput.length < 10) {
      return toast.error("Please enter a valid SOS phone number");
    }
    setUpdatingSettings(true);
    try {
      await updateSettings({ sosPhone: sosPhoneInput });
      toast.success(`SOS Emergency Phone updated to ${sosPhoneInput}`);
    } catch (err) {
      toast.error("Failed to update SOS Phone");
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadLogoSubmit = async (e) => {
    e.preventDefault();
    if (!logoFile) return toast.error("Please select a logo image to upload");

    setUploadingLogoState(true);
    try {
      const res = await uploadLogo(logoFile);
      toast.success("Custom logo uploaded and applied system-wide!");
      setLogoFile(null);
      setLogoPreview("");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to upload logo");
    } finally {
      setUploadingLogoState(false);
    }
  };

  const filteredLogs = smsLogs.filter((log) => {
    const matchesSearch =
      !searchQuery ||
      log.recipientPhone?.includes(searchQuery) ||
      log.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.source?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === "delivered") return log.status === "delivered";
    if (filterStatus === "failed") return log.status === "failed";
    if (filterStatus === "disabled_skipped") return log.status === "disabled_skipped";
    return true;
  });

  const deliveredCount = smsLogs.filter((l) => l.status === "delivered").length;
  const failedCount = smsLogs.filter((l) => l.status === "failed").length;
  const skippedCount = smsLogs.filter((l) => l.status === "disabled_skipped").length;

  const columns = [
    {
      name: "Recipient Phone",
      selector: (row) => row.recipientPhone,
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-slate-800">
          {maskPhoneNumber(row.recipientPhone)}
        </span>
      ),
    },
    {
      name: "Message Snippet",
      selector: (row) => row.message,
      sortable: false,
      grow: 2,
      cell: (row) => (
        <span className="text-xs text-slate-600 font-medium truncate max-w-xs" title={row.message}>
          {row.message}
        </span>
      ),
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => {
        if (row.status === "delivered") {
          return (
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold inline-flex items-center gap-1 border border-emerald-300">
              <CheckCircle size={12} /> Delivered
            </span>
          );
        }
        if (row.status === "disabled_skipped") {
          return (
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold inline-flex items-center gap-1 border border-amber-300">
              <AlertTriangle size={12} /> Skipped (Disabled)
            </span>
          );
        }
        return (
          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[11px] font-bold inline-flex items-center gap-1 border border-red-300">
            <XCircle size={12} /> Failed
          </span>
        );
      },
    },
    {
      name: "Source",
      selector: (row) => row.source,
      sortable: true,
      cell: (row) => (
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
          {row.source}
        </span>
      ),
    },
    {
      name: "Timestamp",
      selector: (row) => format(new Date(row.createdAt), "dd/MM/yyyy HH:mm:ss"),
      sortable: true,
      cell: (row) => (
        <span className="text-xs font-mono text-slate-500">
          {format(new Date(row.createdAt), "dd/MM/yyyy HH:mm")}
        </span>
      ),
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "rgba(255, 255, 255, 0.6)",
        color: "#475569",
        fontWeight: "800",
        textTransform: "uppercase",
        fontSize: "0.75rem",
        letterSpacing: "0.1em",
      },
    },
    rows: {
      style: {
        fontSize: "0.875rem",
        color: "#1e293b",
      },
    },
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden gap-4">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              SMS Gateway & System Configurations
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
              Manage custom branding logo, global SMS master switch, SOS phone number, and monitor real-time SMS delivery logs.
            </p>
          </div>
        </div>

        <button
          onClick={fetchSmsLogs}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Logs
        </button>
      </div>

      {/* TOP CONFIGURATION CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CARD 1: GLOBAL SMS MASTER SWITCH */}
        <div className="glass-panel p-6 rounded-3xl relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                <Sliders size={20} />
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                  settings?.smsEnabled
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-red-100 text-red-800 border-red-300"
                }`}
              >
                {settings?.smsEnabled ? "System SMS: ON" : "System SMS: OFF"}
              </span>
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
              Global System SMS Switch
            </h3>
            <p className="text-slate-500 text-xs font-medium mb-6">
              Enable or disable all SMS notifications across the entire application with one click.
            </p>
          </div>

          <button
            onClick={handleToggleGlobalSMS}
            disabled={updatingSettings}
            className={`w-full py-3 px-4 rounded-xl text-xs font-extrabold transition-all shadow-md ${
              settings?.smsEnabled
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {updatingSettings ? "Updating..." : settings?.smsEnabled ? "Deactivate Global SMS" : "Activate Global SMS"}
          </button>
        </div>

        {/* CARD 2: DYNAMIC SOS EMERGENCY PHONE & AUTO-SMS */}
        <div className="glass-panel p-6 rounded-3xl relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 bg-rose-100 text-rose-600 rounded-xl">
                <ShieldAlert size={20} />
              </span>
              <button
                onClick={handleToggleSosSms}
                disabled={updatingSettings}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                  settings?.sosSmsEnabled
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-slate-100 text-slate-600 border-slate-300"
                }`}
              >
                Auto-SMS: {settings?.sosSmsEnabled ? "ON" : "OFF"}
              </button>
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
              SOS Emergency Phone
            </h3>
            <p className="text-slate-500 text-xs font-medium mb-4">
              Phone number that automatically receives emergency broadcast SMS when security SOS is triggered.
            </p>

            <form onSubmit={handleSaveSosPhone} className="space-y-3">
              <div className="relative">
                <PhoneCall className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="tel"
                  value={sosPhoneInput}
                  onChange={(e) => setSosPhoneInput(e.target.value)}
                  placeholder="07XXXXXXXX"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                disabled={updatingSettings}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Save SOS Phone
              </button>
            </form>
          </div>
        </div>

        {/* CARD 3: CUSTOM BRANDING LOGO (CLOUDINARY) */}
        <div className="glass-panel p-6 rounded-3xl relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                <ImageIcon size={20} />
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                Cloudinary Storage
              </span>
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
              Custom System Logo
            </h3>
            <p className="text-slate-500 text-xs font-medium mb-4">
              Upload custom logo image to display on Navbar, Login page, Visitor Form, and PDF exports.
            </p>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                <img
                  src={logoPreview || settings?.logoUrl || "/logo192.png"}
                  alt="System Logo"
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/logo192.png";
                  }}
                />
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleUploadLogoSubmit}
            disabled={!logoFile || uploadingLogoState}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2"
          >
            <Upload size={14} /> {uploadingLogoState ? "Uploading..." : "Upload Custom Logo"}
          </button>
        </div>

      </div>

      {/* METRICS & LOGS SECTION */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl">
        
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-white/60 border border-white/80 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-500 uppercase font-mono block">Total SMS Logged</span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">{smsLogs.length}</span>
          </div>

          <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl">
            <span className="text-[11px] font-bold text-emerald-700 uppercase font-mono block">Delivered SMS</span>
            <span className="text-xl font-extrabold text-emerald-700 mt-1 block">{deliveredCount}</span>
          </div>

          <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl">
            <span className="text-[11px] font-bold text-amber-700 uppercase font-mono block">Skipped (Disabled)</span>
            <span className="text-xl font-extrabold text-amber-700 mt-1 block">{skippedCount}</span>
          </div>

          <div className="p-4 bg-red-50/60 border border-red-200/80 rounded-2xl">
            <span className="text-[11px] font-bold text-red-700 uppercase font-mono block">Failed SMS</span>
            <span className="text-xl font-extrabold text-red-700 mt-1 block">{failedCount}</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phone number, message..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {["all", "delivered", "disabled_skipped", "failed"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition ${
                  filterStatus === st
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white/60 text-slate-600 hover:bg-white"
                }`}
              >
                {st === "disabled_skipped" ? "Skipped" : st}
              </button>
            ))}
          </div>
        </div>

        {/* DataTable */}
        <div className="bg-white/50 backdrop-blur-md rounded-2xl overflow-hidden border border-white/60 shadow-sm">
          <DataTable
            columns={columns}
            data={filteredLogs}
            pagination
            responsive
            highlightOnHover
            striped
            progressPending={loading}
            customStyles={customStyles}
          />
        </div>

      </div>
    </div>
  );
};

export default AdminSMSLogs;
