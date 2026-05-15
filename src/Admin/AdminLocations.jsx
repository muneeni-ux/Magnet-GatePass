import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiPlus, FiTrash2, FiMapPin, FiPhone } from "react-icons/fi";
import toast from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const AdminLocations = () => {
  const [gates, setGates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [gateName, setGateName] = useState("");
  const [gatePhone, setGatePhone] = useState("");

  const [deptName, setDeptName] = useState("");
  const [deptGateId, setDeptGateId] = useState("");
  const [deptPhone, setDeptPhone] = useState("");

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const [gatesRes, deptsRes] = await Promise.all([
        axios.get(`${SERVER_URL}/api/locations/gates`),
        axios.get(`${SERVER_URL}/api/locations/departments`),
      ]);
      setGates(gatesRes.data);
      setDepartments(deptsRes.data);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Failed to load locations");
    }
  };

  const handleCreateGate = async (e) => {
    e.preventDefault();
    if (!gateName.trim()) {
      toast.error("Gate name is required");
      return;
    }
    if (gateName.trim().length < 3) {
      toast.error("Gate name must be at least 3 characters");
      return;
    }
    if (gatePhone && (gatePhone.length < 10 || gatePhone.length > 13)) {
      toast.error("Phone number must be between 10 and 13 digits");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${SERVER_URL}/api/locations/gates`,
        { name: gateName, phone: gatePhone },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Gate added successfully");
      setGates(
        [...gates, res.data.gate].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setGateName("");
      setGatePhone("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create gate");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGate = async (id) => {
    if (
      !window.confirm(
        "Delete gate? This will also delete all departments assigned to it.",
      )
    )
      return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${SERVER_URL}/api/locations/gates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Gate deleted");
      setGates(gates.filter((g) => g._id !== id));
      setDepartments(departments.filter((d) => d.gateId._id !== id)); // Adjust populated data
    } catch (error) {
      toast.error("Failed to delete gate");
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!deptName.trim() || !deptGateId || !deptPhone.trim()) {
      toast.error("All fields (Name, Gate, Phone) are required");
      return;
    }
    if (deptName.trim().length < 2) {
      toast.error("Department name must be at least 2 characters");
      return;
    }
    if (deptPhone.length < 10 || deptPhone.length > 13) {
      toast.error("Phone number must be between 10 and 13 digits");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = { name: deptName, gateId: deptGateId, phone: deptPhone };
      await axios.post(
        `${SERVER_URL}/api/locations/departments`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Re-fetch everything to get the populated gateId object correctly
      await fetchLocations();
      toast.success("Department added successfully");
      setDeptName("");
      setDeptGateId("");
      setDeptPhone("");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create department",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${SERVER_URL}/api/locations/departments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Department deleted");
      setDepartments(departments.filter((d) => d._id !== id));
    } catch (error) {
      toast.error("Failed to delete department");
    }
  };

  return (
    <div className="min-h-screen text-slate-800 font-sans pb-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-5 glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl shadow-lg relative z-10">
            <FiMapPin className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Manage Locations
            </h1>
            <p className="text-slate-500 text-sm md:text-base mt-1 font-medium">
              Configure entry gates and link designated departments for visitor
              routing.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* GATES SECTION */}
          <div className="space-y-8">
            {/* Create Gate Form */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl relative group hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <span className="p-2 bg-blue-100/50 text-blue-600 rounded-lg"><FiPlus size={18} /></span> Add New Gate
              </h2>
              <form onSubmit={handleCreateGate} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase text-[11px]">
                    Gate Name
                  </label>
                  <input
                    type="text"
                    value={gateName}
                    onChange={(e) => setGateName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm shadow-inner"
                    placeholder="E.g., Gate A (Main Entry)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase text-[11px]">
                    Fallback Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={gatePhone}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/\D/g, "");
                      setGatePhone(numericValue);
                    }}
                    className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm shadow-inner"
                    placeholder="07XXXXXXXX"
                    maxLength={13}
                  />
                  <p className="text-[11px] font-medium text-slate-400 mt-2">
                    Used if the gate itself is the final destination.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3.5 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 disabled:opacity-70 disabled:hover:shadow-none"
                >
                  Save Gate
                </button>
              </form>
            </div>

            {/* List Gates */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl">
              <h2 className="text-xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Active Gates
              </h2>
              {gates.length === 0 ? (
                <div className="bg-white/40 p-6 rounded-2xl text-center border border-white/60">
                  <p className="text-sm font-bold text-slate-400">No gates configured.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {gates.map((gate) => (
                    <div
                      key={gate._id}
                      className="flex items-center justify-between p-4 border border-white/60 rounded-2xl bg-white/40 hover:bg-white/80 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div>
                        <p className="font-extrabold text-slate-800">
                          {gate.name}
                        </p>
                        {gate.phone && (
                          <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mt-1">
                            <FiPhone size={12} className="text-indigo-400" /> {gate.phone}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteGate(gate._id)}
                        className="p-2.5 text-slate-400 hover:text-red-600 transition-colors bg-white/80 hover:bg-red-50 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* DEPARTMENTS SECTION */}
          <div className="space-y-8">
            {/* Create Department Form */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl relative group hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <span className="p-2 bg-emerald-100/50 text-emerald-600 rounded-lg"><FiPlus size={18} /></span> Add Target Department
              </h2>
              <form onSubmit={handleCreateDepartment} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase text-[11px]">
                    Department Name
                  </label>
                  <input
                    type="text"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm shadow-inner"
                    placeholder="E.g., HR Office"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase text-[11px]">
                      Assigned Gate
                    </label>
                    <select
                      value={deptGateId}
                      onChange={(e) => setDeptGateId(e.target.value)}
                      className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm shadow-inner cursor-pointer"
                    >
                      <option value="">Select Gate</option>
                      {gates.map((g) => (
                        <option key={g._id} value={g._id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase text-[11px]">
                      SMS Alert Phone
                    </label>
                    <input
                      type="tel"
                      value={deptPhone}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, "");
                        setDeptPhone(numericValue);
                      }}
                    className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm shadow-inner"
                      placeholder="07XXXXXXXX"
                      maxLength={13}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || gates.length === 0}
                  className="w-full px-6 py-3.5 mt-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 disabled:opacity-70 disabled:hover:shadow-none"
                >
                  Save Department
                </button>
              </form>
            </div>

            {/* List Departments */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl">
              <h2 className="text-xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Configured Destinations
              </h2>
              {departments.length === 0 ? (
                <div className="bg-white/40 p-6 rounded-2xl text-center border border-white/60">
                  <p className="text-sm font-bold text-slate-400">
                    No departments configured.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[460px] overflow-y-auto px-1 custom-scrollbar">
                  {departments.map((dept) => (
                    <div
                      key={dept._id}
                      className="flex items-center justify-between p-4 border border-white/60 rounded-2xl bg-white/40 hover:bg-white/80 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 group"
                    >
                      <div>
                        <p className="font-extrabold text-slate-800">
                          {dept.name}
                        </p>
                        <div className="flex flex-wrap md:flex-nowrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1.5 font-bold">
                          <span className="bg-white/60 border border-slate-200/50 px-2 py-0.5 rounded-md text-emerald-700 shadow-sm">
                            Via {dept.gateId?.name || "Unknown"}
                          </span>
                          <span className="flex items-center gap-1 text-indigo-500">
                            <FiPhone size={12} /> {dept.phone}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteDepartment(dept._id)}
                        className="p-2.5 text-slate-400 hover:text-red-600 transition-colors bg-white/80 hover:bg-red-50 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLocations;
